// 연구자료실 목록: 검색 + 카테고리 필터. 상태는 URL(?q=&cat=)에 저장해 뒤로가기 시 유지.
const params = new URLSearchParams(location.search);
const draftQs = params.has('draft') ? '&draft=1' : ''; // 공개 사이트에서 샘플 확인용
const state = { q: params.get('q') || '', cat: params.get('cat') || '전체' };

const search = document.getElementById('search');
const filters = document.getElementById('filters');
const list = document.getElementById('list');
const count = document.getElementById('count');
const arrow = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 7h10v10M7 17 17 7"/></svg>';

search.value = state.q;
filters.innerHTML = ['전체', ...RESEARCH_CATEGORIES]
  .map(c => `<button type="button" class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

function render() {
  const hits = DOCS.filter(d => researchMatches(d, state.q, state.cat));
  filters.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.cat === state.cat));
  count.textContent = `검색 결과 ${hits.length}건`;

  if (!DOCS.length) {
    list.innerHTML = '<li class="empty">아직 공개된 연구자료가 없습니다.</li>';
  } else if (!hits.length) {
    list.innerHTML = '<li class="empty">검색 조건에 맞는 연구자료가 없습니다.<br><button type="button" class="reset">검색 조건 초기화</button></li>';
  } else {
    list.innerHTML = hits.map(d => `
      <li><a class="item" href="doc.html?slug=${encodeURIComponent(d.slug)}${draftQs}">
        <span class="meta">${esc(d.category)} · ${esc(d.documentType)}${d.status === 'draft' ? ' <span class="badge">DEMO</span>' : ''}</span>
        <span class="title">${esc(d.title)}</span>
        <span class="kw">${d.keywords.map(esc).join(' · ')}</span>
        ${arrow}
      </a></li>`).join('');
  }

  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.cat !== '전체') p.set('cat', state.cat);
  if (draftQs) p.set('draft', '1');
  history.replaceState(null, '', p.size ? `?${p}` : location.pathname);
}

search.addEventListener('input', () => { state.q = search.value; render(); });
filters.addEventListener('click', e => {
  const b = e.target.closest('.chip');
  if (b) { state.cat = b.dataset.cat; render(); }
});
list.addEventListener('click', e => {
  if (e.target.closest('.reset')) { state.q = search.value = ''; state.cat = '전체'; render(); search.focus(); }
});
render();
