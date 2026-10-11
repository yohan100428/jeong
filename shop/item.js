// 상품 상세 (공용 템플릿): item.html?slug=<slug>
// 내용은 전부 products.js 데이터에서. 근거가 없는 항목은 "아직 없음"으로 표시 (가짜 검증·호환·문서 없음).
const p = PRODUCTS.find(x => x.slug === new URLSearchParams(location.search).get('slug'));
const root = document.getElementById('item');

// 카탈로그에서 왔으면 history.back() 으로 필터 유지
document.querySelector('.back').addEventListener('click', e => {
  if (document.referrer.includes('/shop/catalog')) { e.preventDefault(); history.back(); }
});

const NOTE_KIND = { measurement: 'Measurements', assembly: 'Assembly observations', testing: 'Testing notes', limitation: 'Limitations' };
const DOC_KIND = { manual: 'MANUAL', drawing: 'DRAWING', cad: 'CAD', report: 'REPORT', install: 'INSTALL GUIDE' };
const noteSource = n => n.source === 'manufacturer' ? ['claim', 'MANUFACTURER CLAIM']
  : ['measurement', 'testing'].includes(n.kind) ? ['jeong', 'JEONG MEASURED'] : ['note', 'JEONG NOTE'];
const pending = text => `<p class="pending">${text}</p>`;
const bullets = arr => `<ul class="bullets">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
const section = (no, title, inner) => `<section class="sec"><p class="sec-no">${no}</p><h2>${title}</h2>${inner}</section>`;

function render() {
  if (!p) {
    root.innerHTML = '<h1 class="i-title">PART NOT FOUND.</h1><p class="pending">The address is wrong or the product is no longer listed.</p><p><a class="btn-line" href="catalog.html">← BACK TO THE GARAGE</a></p>';
    return;
  }
  document.title = `${p.name} | JEONG MOTORS Parts`;
  document.querySelector('meta[name=description]').content = p.summary;

  // A. Hero
  const thumbs = p.images.length > 1
    ? `<div class="thumbs">${p.images.map((src, i) => `<button type="button" data-i="${i}" aria-label="Image ${i + 1}"><img src="${esc(src)}" alt=""></button>`).join('')}</div>`
    : '';
  const hero = `
    <section class="i-hero">
      <div class="gallery">
        <div class="main-img">${productImage(p)}${p.demo ? '<span class="sticker">PREVIEW</span>' : ''}</div>${thumbs}
      </div>
      <div class="i-info">
        <p class="i-meta"><span>${esc(categoryName(p.category))}</span><span>${esc(p.productType)}</span></p>
        <h1 class="i-title">${esc(p.name)}</h1>
        <dl class="i-facts">
          <div><dt>JEONG PART NO.</dt><dd>${esc(p.sku)}</dd></div>
          <div><dt>MANUFACTURER</dt><dd>${p.manufacturer ? esc(p.manufacturer) : 'Not specified'}</dd></div>
        </dl>
        <p class="i-desc">${esc(p.summary)} ${esc(p.description || '')}</p>
        <p class="i-price">${formatPrice(p)}</p>
        <div class="pcard-tags">${availBadge(p)}${verifyBadge(p)}</div>
        <p class="i-evidence">${p.verification.evidence ? esc(p.verification.evidence) : 'No verification records for this item yet.'}</p>
        <!-- TODO(commerce): 결제 연결 시 이 버튼을 장바구니/체크아웃으로 교체 (p.sku 로 외부 커머스 상품 매칭) -->
        <button type="button" class="btn-fill" disabled>${p.demo ? 'PREVIEW — NOT FOR SALE' : 'CHECKOUT COMING SOON'}</button>
        <p class="i-hint">Online purchasing is not available yet.</p>
      </div>
    </section>`;

  // 사용 영상·사진 (있을 때만)
  const vid = youtubeId(p.video);
  const action = (vid || p.actionImages?.length) ? section('IN USE', 'IN ACTION.',
    (vid ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${vid}" title="${esc(p.name)} in use (video)" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>` : '')
    + (p.actionImages?.length ? `<div class="photos">${p.actionImages.map(src => `<img src="${esc(src)}" alt="${esc(p.name)} in use" loading="lazy">`).join('')}</div>` : '')) : '';

  // B. Specs — 묶음별 아코디언. 값이 없으면 제조사 항목은 NOT PROVIDED, JEONG 항목은 TBD
  const groups = [...new Set(p.specs.map(s => s.group || 'Specifications'))];
  const specRow = s => `<tr><th scope="row">${esc(s.label)}</th><td>${s.value ? esc(s.value) : `<span class="na">${s.source === 'jeong' ? 'TBD' : 'NOT PROVIDED'}</span>`}</td>
    <td><span class="src src-${s.source}">${s.source === 'jeong' ? 'JEONG MEASURED' : 'MANUFACTURER'}</span></td></tr>`;
  const figures = (p.figures || []).map(g => `<figure class="fig"><img src="${esc(g.src)}" alt="${esc(g.caption)}" loading="lazy"><figcaption>${esc(g.caption)}</figcaption></figure>`).join('');
  const specs = section('01 / SPECIFICATIONS', 'THE SPECS.', figures +
    (groups.length ? groups.map(g => `
      <details class="acc" open>
        <summary>${esc(g)}</summary>
        <div class="table-wrap"><table class="spec"><tbody>${p.specs.filter(s => (s.group || 'Specifications') === g).map(specRow).join('')}</tbody></table></div>
      </details>`).join('') : pending('No specifications provided yet.'))
    + (p.requirements?.length ? `<details class="acc" open><summary>Compatibility requirements</summary>${bullets(p.requirements)}</details>` : ''));

  // C. Engineering notes — 제조사 주장과 JEONG 실측을 배지로 구분
  const kinds = Object.keys(NOTE_KIND).filter(k => p.notes.some(n => n.kind === k));
  const notes = section('02 / ENGINEERING NOTES', 'INSIDE THE GARAGE.', kinds.length ? kinds.map(k => `
    <h3>${NOTE_KIND[k]}</h3>
    <ul class="notes">${p.notes.filter(n => n.kind === k).map(n => {
      const [cls, label] = noteSource(n);
      return `<li><span class="src src-${cls}">${label}</span><span>${esc(n.text)}</span></li>`;
    }).join('')}</ul>`).join('') : pending('No engineering notes recorded yet.'));

  // D. Project compatibility — 확인된 것만
  const connections = section('03 / COMPATIBILITY', 'BUILT CONNECTIONS.', p.projects.length ? `
    <ul class="lrows">${p.projects.map(c => `
      <li><a href="../projects/project.html?slug=${encodeURIComponent(c.slug)}"><b>${esc(c.slug.toUpperCase())}</b><span>${esc(c.evidence)}</span></a></li>`).join('')}</ul>`
    : pending('No confirmed project compatibility yet. Compatibility is listed only after it has been checked on a JEONG project.'));

  // E. Documentation — 실제로 열 수 있는 자료만
  const research = (p.relatedResearch || []).map(s => DOCS.find(d => d.slug === s)).filter(Boolean)
    .map(d => ({ label: d.title, kind: 'report', url: `../research/doc.html?slug=${encodeURIComponent(d.slug)}` }));
  const docs = [...p.documentation, ...research];
  const documentation = section('04 / DOCUMENTATION', 'THE PAPER TRAIL.', docs.length ? `
    <ul class="lrows">${docs.map(d => `
      <li><a href="${esc(d.url)}"><b>${esc(d.label)}</b><span class="src src-note">${DOC_KIND[d.kind] || esc(d.kind)}</span></a></li>`).join('')}</ul>`
    : pending('No documentation published for this item yet.'));

  // F. Product source — 판매자·제휴 관계 공개
  const third = ['retail', 'affiliate', 'supplier'].includes(p.sourceType);
  const source = section('05 / SOURCE', 'WHERE IT COMES FROM.', p.sourceType ? `
    <dl class="i-facts wide">
      <div><dt>SOURCE TYPE</dt><dd>${SOURCE_TYPE_LABEL[p.sourceType]}</dd></div>
      <div><dt>SELLER</dt><dd>${p.seller ? esc(p.seller) : 'Not specified'}</dd></div>
      <div><dt>MANUFACTURER</dt><dd>${p.manufacturer ? esc(p.manufacturer) : 'Not specified'}</dd></div>
    </dl>
    ${third ? '<p class="disclose">This product is not manufactured by JEONG MOTORS.</p>' : ''}
    ${p.affiliate ? '<p class="disclose">Affiliate disclosure: JEONG MOTORS may earn a commission if you buy through the seller link.</p>' : ''}`
    : pending('Sourcing for this item has not been decided yet.'));

  // 관련 상품 (있을 때만)
  const prods = (p.relatedProducts || []).map(s => PRODUCTS.find(x => x.slug === s)).filter(Boolean);
  const related = prods.length ? section('MORE', 'FROM THE SAME SHELF.', `<ul class="pgrid">${prods.map(productCard).join('')}</ul>`) : '';

  root.innerHTML = hero + action + specs + notes + connections + documentation + source + related;

  // 썸네일 클릭 -> 대표 이미지 교체
  root.querySelector('.thumbs')?.addEventListener('click', e => {
    const b = e.target.closest('[data-i]');
    if (b) root.querySelector('.main-img img').src = p.images[b.dataset.i];
  });
}
render();
