// =====================================================================
// 관리자 화면 로직 (프론트엔드 전용). 데이터 읽기/쓰기는 전부 api.js 를 통해서만.
// 페이지는 <body data-page="dashboard|research|upload|content"> 로 구분.
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
const MOCK_MSG = ' — 서버 연결 전이라 실제로 저장되지 않았습니다. 새로고침하면 원래대로 돌아옵니다.';

const list = s => s.split(',').map(x => x.trim()).filter(Boolean);
const docUrl = slug => `../research/doc.html?slug=${encodeURIComponent(slug)}`;
const statusLabel = s => (s === 'published' ? '공개' : '비공개');

const pages = {
  // ---- Admin Dashboard: 실제 자료 기준 통계 ----
  async dashboard() {
    const docs = await researchApi.list();
    const pub = docs.filter(d => d.status === 'published').length;
    document.getElementById('stats').innerHTML = [
      ['전체 자료', docs.length], ['공개', pub], ['비공개 (draft)', docs.length - pub],
    ].map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');

    const byCat = {};
    docs.forEach(d => { byCat[d.category] = (byCat[d.category] || 0) + 1; });
    document.getElementById('cats').innerHTML = Object.entries(byCat).sort((a, b) => b[1] - a[1])
      .map(([c, n]) => `<li><span>${esc(c)}</span><b>${n}</b></li>`).join('') || '<li class="muted">자료 없음</li>';

    const day = d => d.updatedAt || d.createdAt;
    document.getElementById('recent').innerHTML = docs.sort((a, b) => day(b).localeCompare(day(a))).slice(0, 5)
      .map(d => `<li><a href="${docUrl(d.slug)}">${esc(d.title)}</a><span>${esc(day(d))} · ${statusLabel(d.status)}</span></li>`).join('')
      || '<li class="muted">자료 없음</li>';
  },

  // ---- Research Management: 목록 · 검색 · 공개 전환 · 수정 · 삭제 ----
  async research() {
    let docs = await researchApi.list();
    const q = document.getElementById('search');
    const tbody = document.querySelector('#table tbody');
    const count = document.getElementById('count');

    const render = () => {
      const hits = docs.filter(d => researchMatches(d, q.value, '전체'));
      count.textContent = `${hits.length}건`;
      tbody.innerHTML = hits.map(d => `
        <tr data-slug="${esc(d.slug)}">
          <td><a href="${docUrl(d.slug)}">${esc(d.title)}</a><small>${esc(d.slug)}</small></td>
          <td>${esc(d.category)}</td>
          <td>${esc(d.documentType)}</td>
          <td>${esc(d.updatedAt || d.createdAt)}</td>
          <td><button type="button" class="status ${d.status}" data-act="status" aria-label="공개 상태 전환 (현재 ${statusLabel(d.status)})">${statusLabel(d.status)}</button></td>
          <td><div class="acts"><a href="upload.html?slug=${encodeURIComponent(d.slug)}">수정</a><button type="button" class="danger" data-act="delete">삭제</button></div></td>
        </tr>`).join('') || '<tr><td colspan="6" class="empty">검색 조건에 맞는 자료가 없습니다.</td></tr>';
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
        else notice('err', '상태 변경 실패', ` — ${r.error}`);
      }
      if (btn.dataset.act === 'delete') {
        if (!confirm(`"${doc.title}" 을(를) 삭제할까요?`)) { btn.disabled = false; return; }
        const r = await researchApi.remove(doc.slug);
        if (r.ok) { docs = docs.filter(d => d !== doc); notice('ok', '삭제됨', r.mock ? MOCK_MSG : ''); }
        else notice('err', '삭제 실패', ` — ${r.error}`);
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
    if (editSlug && !editing) notice('err', '자료를 찾을 수 없습니다', ` — ${editSlug}. 새 자료로 작성합니다.`);
    if (editing) {
      document.querySelector('.page-title').textContent = 'Edit Research';
      document.title = 'Edit Research | JEONG MOTORS';
      document.querySelector('.sub').textContent = '연구자료 수정';
      form.querySelector('[type=submit]').textContent = '수정 저장';
      for (const k of ['title', 'titleEn', 'category', 'documentType', 'createdAt', 'abstract', 'projectId', 'version', 'status', 'slug']) {
        if (editing[k] != null) f[k].value = editing[k];
      }
      f.author.value = editing.author.join(', ');
      f.keywords.value = editing.keywords.join(', ');
      f.slug.readOnly = true; // 주소가 바뀌면 기존 링크가 깨지므로 수정 불가
      if (editing.attachments?.length) {
        document.getElementById('existing').textContent = `기존 첨부: ${editing.attachments.map(a => a.name).join(', ')} (새 파일은 추가됨)`;
      }
    }

    // slug: 직접 고치기 전까지 영문 제목(없으면 제목)에서 자동 생성. 한글만 있으면 비어서 직접 입력 필요
    const toSlug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    let slugEdited = !!editing;
    form.addEventListener('input', e => {
      if (e.target === f.slug) { slugEdited = true; f.slug.setCustomValidity(''); }
      if (!slugEdited && (e.target === f.title || e.target === f.titleEn)) f.slug.value = toSlug(f.titleEn.value || f.title.value);
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const slug = f.slug.value;
      if (!editing && docs.some(d => d.slug === slug)) {
        f.slug.setCustomValidity('이미 사용 중인 slug입니다.');
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
      btn.textContent = '저장 중…';
      try {
        const r = editing ? await researchApi.update(slug, meta, files) : await researchApi.upload(meta, files);
        if (!r.ok) notice('err', '저장 실패', ` — ${r.error}`);
        else if (r.mock) notice('ok', editing ? '모의 수정 완료' : '모의 업로드 완료', ' — 서버 연결 전이라 실제로 저장되지 않았습니다. 전송될 데이터:', JSON.stringify(meta, null, 2));
        else { notice('ok', editing ? '수정 완료' : '업로드 완료'); if (!editing) form.reset(); }
      } catch {
        notice('err', '저장 실패', ' — 네트워크 오류. 입력값은 그대로니 다시 시도하세요.');
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
        if (!r.ok) notice('err', '저장 실패', ` — ${r.error}`);
        else notice('ok', r.mock ? '모의 저장 완료' : '저장 완료', r.mock ? ' — 서버 연결 전이라 홈 화면에 반영되지 않습니다. 전송될 데이터:' : '', r.mock ? JSON.stringify(next, null, 2) : '');
      } catch {
        notice('err', '저장 실패', ' — 네트워크 오류. 다시 시도하세요.');
      } finally {
        btn.disabled = false;
      }
    });
  },
};

pages[document.body.dataset.page]();
