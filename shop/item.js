// 상품 상세: item.html?slug=<slug>
// 섹션은 데이터가 있을 때만 표시 (영상·사진 없으면 Product in Action 숨김 등)
const p = PRODUCTS.find(x => x.slug === new URLSearchParams(location.search).get('slug'));
const root = document.getElementById('item');

// 목록에서 왔으면 history.back() 으로 검색 조건 유지
document.querySelector('.back').addEventListener('click', e => {
  if (document.referrer.includes('/shop/')) { e.preventDefault(); history.back(); }
});

const bullets = arr => arr?.length ? `<ul class="bullets">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
const section = (title, inner) => inner ? `<section class="block shop-sec"><h2>${title}</h2>${inner}</section>` : '';
const SOURCE_LABEL = { manufacturer: 'Manufacturer', measured: 'Measured by JEONG' };

function render() {
  if (!p) {
    root.innerHTML = '<h1 class="doc-title">Product not found.</h1><p class="sub">The address is wrong or the product is no longer available.</p>';
    return;
  }
  document.title = `${p.name} | JEONG MOTORS Parts`;
  document.querySelector('meta[name=description]').content = p.summary;

  // 1. Hero
  const thumbs = p.images.length > 1
    ? `<div class="thumbs">${p.images.map((src, i) => `<button type="button" data-i="${i}" aria-label="Image ${i + 1}"><img src="${esc(src)}" alt=""></button>`).join('')}</div>`
    : '';
  const hero = `
    <div class="hero-p">
      <div class="gallery"><div class="main-img">${productImage(p)}</div>${thumbs}</div>
      <div class="p-info">
        <p class="meta">${esc(p.category)}${p.demo ? ' <span class="badge">DEMO · not a real product</span>' : ''}</p>
        <h1 class="doc-title">${esc(p.name)}</h1>
        <p class="sub">${esc(p.summary)}</p>
        ${bullets(p.features)}
        <p class="price-lg">${formatPrice(p)}</p>
        <p class="badges">${statusBadge(p)}<span class="avail">${AVAILABILITY_LABEL[p.availability]}</span></p>
        <!-- TODO(commerce): 결제 연결 시 버튼 활성화 (p.commerceId 로 외부 커머스 상품 매칭) -->
        <div class="buy">
          <button type="button" class="pop-btn" disabled>Add to Cart</button>
          <button type="button" class="pop-btn primary" disabled>Buy Now</button>
        </div>
        <p class="hint">Online purchase is coming soon.</p>
      </div>
    </div>`;

  // 2. Product in Action — 영상/사진 없으면 숨김
  const vid = youtubeId(p.video);
  const action = section('Product in Action',
    (vid ? `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${vid}" title="${esc(p.name)} in use (video)" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>` : '')
    + (p.actionImages?.length ? `<div class="photos">${p.actionImages.map(src => `<img src="${esc(src)}" alt="${esc(p.name)} in use" loading="lazy">`).join('')}</div>` : ''));

  // 3. JEONG Review — 직접 써본 제품만 내용 표시
  const r = p.review;
  const review = section('JEONG Review', r
    ? `<div class="review">
        <div><h3>Pros</h3>${bullets(r.pros)}</div>
        <div><h3>Cons</h3>${bullets(r.cons)}</div>
      </div>
      ${r.reason ? `<h3>Why we chose it</h3><p>${esc(r.reason)}</p>` : ''}
      ${r.verification ? `<h3>Verification</h3><p>${esc(r.verification)}</p>` : ''}`
    : '<p class="sub">JEONG MOTORS has not used or verified this product yet.</p>');

  // 4. Technical Specifications — 제조사 사양 / JEONG 실측 구분
  const specs = section('Technical Specifications', p.specs?.length && `
    <div class="table-wrap"><table class="spec">
      <thead><tr><th>Item</th><th>Value</th><th>Source</th></tr></thead>
      <tbody>${p.specs.map(s => `<tr class="${s.source}"><td>${esc(s.label)}</td><td>${esc(s.value)}</td><td>${SOURCE_LABEL[s.source] || esc(s.source)}</td></tr>`).join('')}</tbody>
    </table></div>`);

  // 5. Compatibility & Notes
  const compat = section('Compatibility & Notes',
    (p.compatibility?.length ? `<h3>Compatibility &amp; fitment</h3>${bullets(p.compatibility)}` : '')
    + (p.notes?.length ? `<h3>Cautions &amp; unverified items</h3>${bullets(p.notes)}` : ''));

  // 6. Related — 실제로 존재하는 것만
  const project = p.projectId && PROJECT_PAGES[p.projectId]
    ? `<h3>Related project</h3><p><a href="${esc(PROJECT_PAGES[p.projectId])}">${esc(p.projectId)}</a></p>` : '';
  const docs = (p.relatedResearch || []).map(s => DOCS.find(d => d.slug === s)).filter(Boolean);
  const research = docs.length
    ? `<h3>Related research</h3><ul class="links">${docs.map(d => `<li><a href="../research/doc.html?slug=${encodeURIComponent(d.slug)}">${esc(d.title)}</a></li>`).join('')}</ul>` : '';
  const prods = (p.relatedProducts || []).map(s => PRODUCTS.find(x => x.slug === s)).filter(Boolean);
  const products = prods.length
    ? `<h3>Related products</h3><ul class="links">${prods.map(x => `<li><a href="item.html?slug=${encodeURIComponent(x.slug)}">${esc(x.name)}</a> <span>${formatPrice(x)}</span></li>`).join('')}</ul>` : '';
  const related = section('Related Content', project + research + products);

  root.innerHTML = hero + action + review + specs + compat + related;

  // 썸네일 클릭 -> 대표 이미지 교체
  root.querySelector('.thumbs')?.addEventListener('click', e => {
    const b = e.target.closest('[data-i]');
    if (b) root.querySelector('.main-img img').src = p.images[b.dataset.i];
  });
}
render();
