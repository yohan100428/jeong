// 카탈로그: 검색 + 사이드 필터 + 정렬 (전부 로컬 데이터, products.js 의 catalogFilter / catalogSort 사용).
// 검색어·카테고리·정렬은 URL(?q=&cat=&sort=)에 저장해 뒤로가기·공유 시 유지.
const params = new URLSearchParams(location.search);
const form = document.getElementById('filters');
const search = document.getElementById('search');
const sort = document.getElementById('sort');
const grid = document.getElementById('grid');
const count = document.getElementById('count');
const drawer2 = document.getElementById('filter-box'); // 모바일에서 접히는 필터 상자

const uniq = arr => [...new Set(arr.filter(Boolean))].sort();
const checks = (name, items) => items.length
  ? items.map(([v, label]) => `<label class="opt"><input type="checkbox" name="${name}" value="${esc(v)}"><span>${esc(label)}</span></label>`).join('')
  : '<p class="none">None listed yet.</p>';

// 필터 항목을 데이터에서 만듦 (브랜드·종류는 실제 상품에 있는 값만)
document.getElementById('f-cat').innerHTML = [{ id: 'all', name: 'ALL SYSTEMS' }, ...PRODUCT_CATEGORIES].map(c => {
  const n = c.id === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.category === c.id).length;
  return `<label class="opt"><input type="radio" name="cat" value="${c.id}"><span>${esc(c.name)}</span><small>${n}</small></label>`;
}).join('');
document.getElementById('f-brand').innerHTML = checks('brands', uniq(PRODUCTS.map(p => p.manufacturer)).map(b => [b, b]));
document.getElementById('f-avail').innerHTML = checks('availability', Object.entries(AVAILABILITY_LABEL));
document.getElementById('f-verify').innerHTML = checks('verification', Object.entries(VERIFY_LABEL));
document.getElementById('f-type').innerHTML = checks('types', uniq(PRODUCTS.map(p => p.productType)).map(t => [t, t]));
sort.innerHTML = SORT_OPTIONS.map(([v, label]) => `<option value="${v}">${label}</option>`).join('');

// URL -> 초기 상태
search.value = params.get('q') || '';
sort.value = SORT_OPTIONS.some(([v]) => v === params.get('sort')) ? params.get('sort') : 'featured';
const startCat = PRODUCT_CATEGORIES.some(c => c.id === params.get('cat')) ? params.get('cat') : 'all';
form.querySelector(`[name=cat][value="${startCat}"]`).checked = true;

const picked = name => [...form.querySelectorAll(`[name=${name}]:checked`)].map(i => i.value);

function render() {
  const state = {
    q: search.value, cat: picked('cat')[0], min: form.elements.min.value, max: form.elements.max.value,
    brands: picked('brands'), availability: picked('availability'), verification: picked('verification'), types: picked('types'),
  };
  const hits = catalogSort(catalogFilter(PRODUCTS, state), sort.value);
  count.textContent = `${hits.length} item${hits.length === 1 ? '' : 's'}${hits.some(p => p.demo) ? ' · preview items are not for sale' : ''}`;
  grid.innerHTML = hits.map(productCard).join('')
    || '<li class="empty"><b>NOTHING ON THIS SHELF.</b><br>No products match these filters.<br><button type="button" class="reset">Reset filters</button></li>';

  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.cat !== 'all') p.set('cat', state.cat);
  if (sort.value !== 'featured') p.set('sort', sort.value);
  history.replaceState(null, '', p.size ? `?${p}` : location.pathname);
}

function reset() {
  form.reset();
  form.querySelector('[name=cat][value=all]').checked = true;
  search.value = '';
  sort.value = 'featured';
  render();
}

form.addEventListener('input', render);
search.addEventListener('input', render);
sort.addEventListener('change', render);
form.addEventListener('submit', e => e.preventDefault());
document.addEventListener('click', e => { if (e.target.closest('.reset')) reset(); });

// 넓은 화면에서는 필터를 펼친 채로, 좁은 화면에서는 접어 둠
drawer2.open = matchMedia('(min-width: 900px)').matches;
render();
