// =====================================================================
// 관리자 화면 로직 (프론트엔드 전용). 데이터 읽기/쓰기는 전부 api.js 를 통해서만.
// 페이지는 <body data-page="dashboard|research|upload|products|product|content"> 로 구분.
// ponytail: 관리자 여부는 화면 가리기용(window.adminMode). 진짜 권한 검사는 서버에서.
// =====================================================================

const gate = document.getElementById('gate');
const panel = document.getElementById('panel');
const result = document.getElementById('result');

// 관리자 모드일 때만 내용 표시 (dev-admin.js 삭제 시 항상 숨겨짐 → 실제 인증 붙일 때 교체)
function applyGate() {
  const on = !!window.adminMode?.isAdmin;
  panel.hidden = !on;
  gate.hidden = on;
}
addEventListener('adminchange', applyGate);
applyGate();

function notice(kind, title, msg = '', detail = '') {
  result.hidden = false;
  result.className = `notice ${kind}`;
  result.querySelector('strong').textContent = title;
  result.querySelector('span').textContent = msg;
  result.querySelector('pre').textContent = detail;
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
const MOCK_MSG = ' — Not saved: no server connected yet. Reloading restores the original.';

const list = s => s.split(',').map(x => x.trim()).filter(Boolean);
const docUrl = slug => `../research/doc.html?slug=${encodeURIComponent(slug)}`;
const statusLabel = s => (s === 'published' ? 'Published' : 'Draft');
// slug: 영문 소문자·숫자·하이픈만. 한글만 있으면 빈 값 -> 직접 입력 필요
const toSlug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const pages = {
  // ---- Admin Dashboard: 실제 자료 기준 통계 ----
  async dashboard() {
    const docs = await researchApi.list();
    const products = await productsApi.list();
    const pub = docs.filter(d => d.status === 'published').length;
    document.getElementById('stats').innerHTML = [
      ['Documents', docs.length], ['Published', pub], ['Draft', docs.length - pub], ['Products', products.length],
    ].map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');

    const byCat = {};
    docs.forEach(d => { byCat[d.category] = (byCat[d.category] || 0) + 1; });
    document.getElementById('cats').innerHTML = Object.entries(byCat).sort((a, b) => b[1] - a[1])
      .map(([c, n]) => `<li><span>${esc(c)}</span><b>${n}</b></li>`).join('') || '<li class="muted">No documents</li>';

    const day = d => d.updatedAt || d.createdAt;
    document.getElementById('recent').innerHTML = docs.sort((a, b) => day(b).localeCompare(day(a))).slice(0, 5)
      .map(d => `<li><a href="${docUrl(d.slug)}">${esc(d.title)}</a><span>${esc(day(d))} · ${statusLabel(d.status)}</span></li>`).join('')
      || '<li class="muted">No documents</li>';
  },

  // ---- Research Management: 목록 · 검색 · 공개 전환 · 수정 · 삭제 ----
  async research() {
    let docs = await researchApi.list();
    const q = document.getElementById('search');
    const tbody = document.querySelector('#table tbody');
    const count = document.getElementById('count');

    const render = () => {
      const hits = docs.filter(d => researchMatches(d, q.value, 'All'));
      count.textContent = `Documents: ${hits.length}`;
      tbody.innerHTML = hits.map(d => `
        <tr data-slug="${esc(d.slug)}">
          <td><a href="${docUrl(d.slug)}">${esc(d.title)}</a><small>${esc(d.slug)}</small></td>
          <td>${esc(d.category)}</td>
          <td>${esc(d.documentType)}</td>
          <td>${esc(d.updatedAt || d.createdAt)}</td>
          <td><button type="button" class="status ${d.status}" data-act="status" aria-label="Toggle visibility (now ${statusLabel(d.status)})">${statusLabel(d.status)}</button></td>
          <td><div class="acts"><a href="upload.html?slug=${encodeURIComponent(d.slug)}">Edit</a><button type="button" class="danger" data-act="delete">Delete</button></div></td>
        </tr>`).join('') || '<tr><td colspan="6" class="empty">No documents match your search.</td></tr>';
    };

    q.addEventListener('input', render);
    tbody.addEventListener('click', async e => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const doc = docs.find(d => d.slug === btn.closest('tr').dataset.slug);
      btn.disabled = true;

      if (btn.dataset.act === 'status') {
        const next = doc.status === 'published' ? 'draft' : 'published';
        const r = await researchApi.setStatus(doc.slug, next);
        if (r.ok) { doc.status = next; notice('ok', `"${doc.title}" → ${statusLabel(next)}`, r.mock ? MOCK_MSG : ''); }
        else notice('err', 'Status change failed', ` — ${r.error}`);
      }
      if (btn.dataset.act === 'delete') {
        if (!confirm(`Delete "${doc.title}"?`)) { btn.disabled = false; return; }
        const r = await researchApi.remove(doc.slug);
        if (r.ok) { docs = docs.filter(d => d !== doc); notice('ok', 'Deleted', r.mock ? MOCK_MSG : ''); }
        else notice('err', 'Delete failed', ` — ${r.error}`);
      }
      render();
    });
    render();
  },

  // ---- Upload / Edit Research: ?slug=... 이면 수정 모드 ----
  async upload() {
    const form = document.getElementById('upload-form');
    const f = form.elements;
    const docs = await researchApi.list();
    const editSlug = new URLSearchParams(location.search).get('slug');
    const editing = editSlug && docs.find(d => d.slug === editSlug);

    f.createdAt.value = new Date().toLocaleDateString('sv-SE'); // 오늘 (YYYY-MM-DD)
    if (editSlug && !editing) notice('err', 'Document not found', ` — ${editSlug}. Starting a new document.`);
    if (editing) {
      document.querySelector('.page-title').textContent = 'Edit Research';
      document.title = 'Edit Research | JEONG MOTORS';
      document.querySelector('.sub').textContent = 'Edit research document';
      form.querySelector('[type=submit]').textContent = 'Save changes';
      for (const k of ['title', 'titleEn', 'category', 'documentType', 'createdAt', 'abstract', 'projectId', 'version', 'status', 'slug']) {
        if (editing[k] != null) f[k].value = editing[k];
      }
      f.author.value = editing.author.join(', ');
      f.keywords.value = editing.keywords.join(', ');
      f.slug.readOnly = true; // 주소가 바뀌면 기존 링크가 깨지므로 수정 불가
      if (editing.attachments?.length) {
        document.getElementById('existing').textContent = `Existing attachments: ${editing.attachments.map(a => a.name).join(', ')} (new files are added)`;
      }
    }

    // slug: 직접 고치기 전까지 영문 제목(없으면 제목)에서 자동 생성. 한글만 있으면 비어서 직접 입력 필요
    let slugEdited = !!editing;
    form.addEventListener('input', e => {
      if (e.target === f.slug) { slugEdited = true; f.slug.setCustomValidity(''); }
      if (!slugEdited && (e.target === f.title || e.target === f.titleEn)) f.slug.value = toSlug(f.titleEn.value || f.title.value);
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const slug = f.slug.value;
      if (!editing && docs.some(d => d.slug === slug)) {
        f.slug.setCustomValidity('This slug is already in use.');
        f.slug.reportValidity();
        return;
      }
      const files = [...f.attachments.files];
      const attachments = [
        ...(editing?.attachments || []),
        ...files.map(x => ({ name: x.name, url: `files/${x.name}`, type: (x.name.split('.').pop() || '').toUpperCase() })),
      ];
      const meta = {
        id: editing?.id || slug,
        slug,
        title: f.title.value.trim(),
        titleEn: f.titleEn.value.trim() || undefined,
        author: list(f.author.value),
        category: f.category.value.trim(),
        documentType: f.documentType.value.trim(),
        createdAt: f.createdAt.value,
        updatedAt: editing ? new Date().toLocaleDateString('sv-SE') : undefined,
        abstract: f.abstract.value.trim() || undefined,
        keywords: list(f.keywords.value),
        projectId: f.projectId.value.trim() || undefined,
        version: f.version.value.trim() || undefined,
        status: f.status.value,
        contentPath: editing?.contentPath,
        attachments: attachments.length ? attachments : undefined,
      };

      const btn = form.querySelector('[type=submit]');
      const label = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Saving…';
      try {
        const r = editing ? await researchApi.update(slug, meta, files) : await researchApi.upload(meta, files);
        if (!r.ok) notice('err', 'Save failed', ` — ${r.error}`);
        else if (r.mock) notice('ok', editing ? 'Mock update complete' : 'Mock upload complete', ' — Not saved: no server connected yet. Data that would be sent:', JSON.stringify(meta, null, 2));
        else { notice('ok', editing ? 'Updated' : 'Uploaded'); if (!editing) form.reset(); }
      } catch {
        notice('err', 'Save failed', ' — Network error. Your input is kept; try again.');
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  },

  // ---- Product Management: 상품 목록 · 검색 · 수정 · 삭제 ----
  async products() {
    let items = await productsApi.list();
    const q = document.getElementById('search');
    const tbody = document.querySelector('#table tbody');
    const count = document.getElementById('count');

    const render = () => {
      const hits = catalogFilter(items, { q: q.value });
      count.textContent = `Products: ${hits.length}`;
      tbody.innerHTML = hits.map(p => `
        <tr data-slug="${esc(p.slug)}">
          <td><a href="../shop/item.html?slug=${encodeURIComponent(p.slug)}">${esc(p.name)}</a><small>${esc(p.sku)}${p.demo ? ' · PREVIEW' : ''}</small></td>
          <td>${esc(categoryName(p.category))}</td>
          <td>${formatPrice(p)}</td>
          <td>${verifyBadge(p)}</td>
          <td>${availBadge(p)}</td>
          <td><div class="acts"><a href="product.html?slug=${encodeURIComponent(p.slug)}">Edit</a><button type="button" class="danger" data-act="delete">Delete</button></div></td>
        </tr>`).join('') || '<tr><td colspan="6" class="empty">No products match your search.</td></tr>';
    };

    q.addEventListener('input', render);
    tbody.addEventListener('click', async e => {
      const btn = e.target.closest('[data-act=delete]');
      if (!btn) return;
      const item = items.find(p => p.slug === btn.closest('tr').dataset.slug);
      if (!confirm(`Delete "${item.name}"?`)) return;
      btn.disabled = true;
      const r = await productsApi.remove(item.slug);
      if (r.ok) { items = items.filter(p => p !== item); notice('ok', 'Deleted', r.mock ? MOCK_MSG : ''); }
      else notice('err', 'Delete failed', ` — ${r.error}`);
      render();
    });
    render();
  },

  // ---- Add / Edit Product: ?slug=... 이면 수정 모드. 필드는 shop/products.js 의 상품 형식과 1:1 ----
  async product() {
    const form = document.getElementById('product-form');
    const f = form.elements;
    const items = await productsApi.list();
    const editSlug = new URLSearchParams(location.search).get('slug');
    const editing = editSlug && items.find(p => p.slug === editSlug);
    const lines = s => s.split('\n').map(x => x.trim()).filter(Boolean);
    const cells = line => line.split('|').map(x => x.trim());
    const NOTE_FIELDS = { measurement: 'noteMeasure', assembly: 'noteAssembly', testing: 'noteTesting', limitation: 'noteLimit' };

    f.category.innerHTML = PRODUCT_CATEGORIES.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');

    // 기술 사양: 행 추가/삭제
    const specsBox = document.getElementById('specs');
    const addSpec = (s = {}) => {
      const row = document.getElementById('spec-row').content.firstElementChild.cloneNode(true);
      row.querySelector('.group').value = s.group || '';
      row.querySelector('.label').value = s.label || '';
      row.querySelector('.value').value = s.value || '';
      row.querySelector('.source').value = s.source || 'manufacturer';
      specsBox.append(row);
    };
    document.getElementById('add-spec').addEventListener('click', () => addSpec());
    specsBox.addEventListener('click', e => e.target.closest('.rm')?.closest('.spec-row').remove());

    if (editSlug && !editing) notice('err', 'Product not found', ` — ${editSlug}. Starting a new product.`);
    if (editing) {
      document.querySelector('.page-title').textContent = 'Edit Product';
      document.querySelector('.sub').textContent = 'Edit product';
      document.title = 'Edit Product | JEONG MOTORS';
      form.querySelector('[type=submit]').textContent = 'Save changes';
      for (const k of ['name', 'summary', 'description', 'slug', 'sku', 'category', 'productType', 'currency', 'availability',
        'manufacturer', 'seller', 'sourceType', 'video']) {
        if (editing[k] != null) f[k].value = editing[k];
      }
      f.price.value = editing.price ?? '';
      f.featured.checked = !!editing.featured;
      f.demo.checked = !!editing.demo;
      f.affiliate.checked = !!editing.affiliate;
      f.verifyStatus.value = editing.verification.status;
      f.evidence.value = editing.verification.evidence || '';
      f.requirements.value = (editing.requirements || []).join('\n');
      for (const [kind, field] of Object.entries(NOTE_FIELDS)) {
        f[field].value = editing.notes.filter(n => n.kind === kind && n.source !== 'manufacturer').map(n => n.text).join('\n');
      }
      f.noteClaims.value = editing.notes.filter(n => n.source === 'manufacturer').map(n => n.text).join('\n');
      f.projects.value = editing.projects.map(c => `${c.slug} | ${c.evidence}`).join('\n');
      f.documentation.value = editing.documentation.map(d => `${d.label} | ${d.kind} | ${d.url}`).join('\n');
      f.relatedResearch.value = (editing.relatedResearch || []).join(', ');
      f.relatedProducts.value = (editing.relatedProducts || []).join(', ');
      f.slug.readOnly = true; // 주소가 바뀌면 기존 링크가 깨지므로 수정 불가
      const had = [...editing.images, ...(editing.actionImages || [])];
      if (had.length) document.getElementById('existing').textContent = `${had.length} existing image(s) kept (new files are added)`;
    }
    (editing?.specs?.length ? editing.specs : [{}]).forEach(addSpec);

    let slugEdited = !!editing;
    form.addEventListener('input', e => {
      e.target.setCustomValidity?.('');
      if (e.target === f.slug) slugEdited = true;
      if (!slugEdited && e.target === f.name) f.slug.value = toSlug(f.name.value);
    });
    const invalid = (el, msg) => { el.setCustomValidity(msg); el.reportValidity(); };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const slug = f.slug.value;
      const others = items.filter(p => p !== editing);
      if (others.some(p => p.slug === slug)) return invalid(f.slug, 'This slug is already in use.');
      if (others.some(p => p.sku === f.sku.value.trim())) return invalid(f.sku, 'This part number is already in use.');
      if (f.video.value && !youtubeId(f.video.value)) return invalid(f.video, 'Only YouTube URLs are allowed.');
      // 근거 없는 검증 표시 금지
      if (f.verifyStatus.value !== 'unverified' && !f.evidence.value.trim()) {
        return invalid(f.evidence, 'A verification status needs evidence: what was tested or reviewed, and where the record is.');
      }
      if (f.demo.checked && f.availability.value === 'available') return invalid(f.availability, 'A preview item cannot be marked Available.');
      // 호환 프로젝트: "slug | 근거" — 근거 없이 호환 표시 금지
      const projects = lines(f.projects.value).map(cells);
      if (projects.some(c => !c[0] || !c[1])) return invalid(f.projects, 'Each line needs "project-slug | evidence".');
      // 문서: "이름 | 종류 | 주소" — 주소 없는 문서 금지
      const documentation = lines(f.documentation.value).map(cells);
      if (documentation.some(c => !c[0] || !c[2])) return invalid(f.documentation, 'Each line needs "label | kind | url".');

      const imgFiles = [...f.images.files];
      const actFiles = [...f.actionImages.files];
      const path = file => `images/${slug}/${file.name}`;
      const notes = [
        ...Object.entries(NOTE_FIELDS).flatMap(([kind, field]) => lines(f[field].value).map(text => ({ kind, text, source: 'jeong' }))),
        ...lines(f.noteClaims.value).map(text => ({ kind: 'measurement', text, source: 'manufacturer' })),
      ];
      const meta = {
        id: editing?.id || slug,
        sku: f.sku.value.trim(),
        slug,
        demo: f.demo.checked,
        featured: f.featured.checked,
        addedAt: editing?.addedAt || new Date().toLocaleDateString('sv-SE'),
        name: f.name.value.trim(),
        summary: f.summary.value.trim(),
        description: f.description.value.trim(),
        category: f.category.value,
        productType: f.productType.value.trim(),
        manufacturer: f.manufacturer.value.trim(),
        seller: f.seller.value.trim(),
        sourceType: f.sourceType.value,
        affiliate: f.affiliate.checked || f.sourceType.value === 'affiliate', // 제휴 상품은 항상 공개
        price: f.price.value === '' ? null : Number(f.price.value),
        currency: f.currency.value,
        images: [...(editing?.images || []), ...imgFiles.map(path)],
        availability: f.availability.value,
        verification: { status: f.verifyStatus.value, evidence: f.evidence.value.trim() },
        specs: [...specsBox.querySelectorAll('.spec-row')]
          .map(r => ({ group: r.querySelector('.group').value.trim() || 'Specifications', label: r.querySelector('.label').value.trim(), value: r.querySelector('.value').value.trim(), source: r.querySelector('.source').value }))
          .filter(s => s.label),
        requirements: lines(f.requirements.value),
        notes,
        projects: projects.map(([slug, evidence]) => ({ slug, evidence })),
        documentation: documentation.map(([label, kind, url]) => ({ label, kind: kind || 'manual', url })),
        relatedResearch: list(f.relatedResearch.value),
        relatedProducts: list(f.relatedProducts.value),
        video: f.video.value.trim(),
        actionImages: [...(editing?.actionImages || []), ...actFiles.map(path)],
      };

      const btn = form.querySelector('[type=submit]');
      const label = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Saving…';
      try {
        const files = { images: imgFiles, actionImages: actFiles };
        const r = editing ? await productsApi.update(slug, meta, files) : await productsApi.create(meta, files);
        if (!r.ok) notice('err', 'Save failed', ` — ${r.error}`);
        else if (r.mock) notice('ok', editing ? 'Mock update complete' : 'Mock save complete', ' — Not saved: no server connected yet. Data that would be sent:', JSON.stringify(meta, null, 2));
        else { notice('ok', editing ? 'Updated' : 'Saved'); if (!editing) form.reset(); }
      } catch {
        notice('err', 'Save failed', ' — Network error. Your input is kept; try again.');
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  },

  // ---- Content Management: 홈 화면 문구 ----
  async content() {
    const form = document.getElementById('content-form');
    const f = form.elements;
    const data = await contentApi.get();
    for (const k in data) if (f[k]) f[k].value = data[k];

    const preview = () => {
      document.getElementById('pv-slogan').textContent = f.heroSlogan.value;
      document.getElementById('pv-btn').textContent = f.heroButton.value;
    };
    form.addEventListener('input', preview);
    preview();

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const next = Object.fromEntries(Object.keys(data).map(k => [k, f[k].value.trim()]));
      const btn = form.querySelector('[type=submit]');
      btn.disabled = true;
      try {
        const r = await contentApi.save(next);
        if (!r.ok) notice('err', 'Save failed', ` — ${r.error}`);
        else notice('ok', r.mock ? 'Mock save complete' : 'Saved', r.mock ? ' — Not applied to the home page: no server connected yet. Data that would be sent:' : '', r.mock ? JSON.stringify(next, null, 2) : '');
      } catch {
        notice('err', 'Save failed', ' — Network error. Try again.');
      } finally {
        btn.disabled = false;
      }
    });
  },
};

pages[document.body.dataset.page]();
