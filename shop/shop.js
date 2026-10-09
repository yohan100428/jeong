// 스토어 목록: 검색 + 카테고리 필터. 상태는 URL(?q=&cat=)에 저장해 뒤로가기 시 유지.
const params = new URLSearchParams(location.search);
const state = { q: params.get('q') || '', cat: params.get('cat') || 'All' };

const search = document.getElementById('search');
const filters = document.getElementById('filters');
const grid = document.getElementById('grid');
const count = document.getElementById('count');

search.value = state.q;
filters.innerHTML = ['All', ...PRODUCT_CATEGORIES]
  .map(c => `<button type="button" class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

function render() {
  const hits = PRODUCTS.filter(p => productMatches(p, state.q, state.cat));
  filters.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.cat === state.cat));
  count.textContent = `상품 ${hits.length}개`;

  grid.innerHTML = hits.map(p => `
    <li><a class="card-p" href="item.html?slug=${encodeURIComponent(p.slug)}">
      <div class="thumb">${productImage(p)}</div>
      <div class="card-body">
        <div class="badges">${statusBadge(p)}${p.demo ? '<span class="badge">DEMO</span>' : ''}</div>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.summary)}</p>
        <div class="row"><b>${formatPrice(p)}</b><span class="more">View Details →</span></div>
      </div>
    </a></li>`).join('')
    || '<li class="empty">검색 조건에 맞는 상품이 없습니다.<br><button type="button" class="reset">검색 조건 초기화</button></li>';

  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.cat !== 'All') p.set('cat', state.cat);
  history.replaceState(null, '', p.size ? `?${p}` : location.pathname);
}

search.addEventListener('input', () => { state.q = search.value; render(); });
filters.addEventListener('click', e => {
  const b = e.target.closest('.chip');
  if (b) { state.cat = b.dataset.cat; render(); }
});
grid.addEventListener('click', e => {
  if (e.target.closest('.reset')) { state.q = search.value = ''; state.cat = 'All'; render(); search.focus(); }
});
render();
