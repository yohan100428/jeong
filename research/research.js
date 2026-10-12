// 연구자료실 (아카이브): 검색 + 카테고리 탭 + 정렬 + 목록/격자 보기. 데이터는 documents.js 그대로.
// 검색어·카테고리·정렬은 URL(?q=&cat=&sort=)에 저장해 뒤로가기 시 유지. 보기 방식은 브라우저에 저장.
const params = new URLSearchParams(location.search);
const draftQs = params.has('draft') ? '&draft=1' : ''; // 공개 사이트에서 샘플 확인용
const SORTS = {
  newest: ['Newest', (a, b) => b.createdAt.localeCompare(a.createdAt)],
  oldest: ['Oldest', (a, b) => a.createdAt.localeCompare(b.createdAt)],
  title: ['Title A–Z', (a, b) => a.title.localeCompare(b.title)],
};
const state = {
  q: params.get('q') || '',
  cat: params.get('cat') || 'All',
  sort: SORTS[params.get('sort')] ? params.get('sort') : 'newest',
};

const search = document.getElementById('search');
const clear = document.getElementById('clear');
const filters = document.getElementById('filters');
const sort = document.getElementById('sort');
const list = document.getElementById('list');
const count = document.getElementById('count');
const views = document.getElementById('views');

search.value = state.q;
sort.innerHTML = Object.entries(SORTS).map(([k, [label]]) => `<option value="${k}">${label}</option>`).join('');
sort.value = state.sort;
// 카테고리 탭: 고정 분야 + 실제 자료에 있는 분야. 번호는 장식용
filters.innerHTML = ['All', ...new Set([...RESEARCH_CATEGORIES, ...DOCS.map(d => d.category)])]
  .map((c, i) => `<button type="button" class="rl-tab" data-cat="${esc(c)}"><small>${String(i).padStart(2, '0')} /</small> ${esc(c)}</button>`).join('');

// 상태 표시는 실제 데이터 기준: published 만 PUBLISHED. draft 는 로컬 미리보기에서만 보임
const statusTag = d => d.status === 'published'
  ? '<span class="rl-tag rl-tag-pub">PUBLISHED</span>'
  : '<span class="rl-tag rl-tag-draft">DRAFT · LOCAL PREVIEW</span>';
const accessTag = d => `<span class="rl-tag">${d.access === 'garage' ? 'GARAGE+' : 'OPEN ACCESS'}</span>`;

const card = d => `
  <li><a class="rl-card" href="doc.html?slug=${encodeURIComponent(d.slug)}${draftQs}">
    ${d.cover ? `<img class="rl-cover" src="${esc(d.cover)}" alt="" loading="lazy">` : ''}
    <p class="rl-top"><span class="rl-id">${esc(d.id.toUpperCase())}</span><span>${esc(d.category)}</span><span>${esc(d.createdAt)}</span></p>
    <h3>${esc(d.title)}</h3>
    ${d.abstract ? `<p class="rl-abs">${esc(d.abstract)}</p>` : ''}
    <p class="rl-meta"><span>${esc(d.documentType)}</span><span>${esc(d.author.join(', '))}</span>${d.projectId ? `<span>PROJECT ${esc(d.projectId)}</span>` : ''}</p>
    <p class="rl-tags">${statusTag(d)}${accessTag(d)}</p>
    <span class="rl-arrow" aria-hidden="true">→</span>
  </a></li>`;

// 자료가 하나도 없을 때 (가짜 논문으로 채우지 않음)
const EMPTY_ARCHIVE = `
  <li class="rl-empty">
    <svg viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M10 100h180M30 100V40l40-24 40 24v60M70 16v84M110 40l50 20v40" opacity=".7"/>
      <circle cx="70" cy="58" r="16"/><circle cx="70" cy="58" r="5"/><path d="M40 58h60M70 28v60" stroke-dasharray="3 5"/>
      <circle cx="160" cy="60" r="4" fill="currentColor"/>
    </svg>
    <h3>THE LAB IS JUST GETTING STARTED.</h3>
    <p>Our research archive is being prepared. New engineering studies and technical documentation will appear here as they become available.</p>
    <a class="rl-btn" href="../projects/index.html">EXPLORE PROJECTS</a>
  </li>`;
const NO_MATCH = `
  <li class="rl-empty">
    <h3>NO MATCHING DOCUMENTS.</h3>
    <p>Nothing in the archive matches this search and category.</p>
    <button type="button" class="rl-btn reset">Clear filters</button>
  </li>`;

function render() {
  const hits = DOCS.filter(d => researchMatches(d, state.q, state.cat)).sort(SORTS[state.sort][1]);
  filters.querySelectorAll('.rl-tab').forEach(b => b.setAttribute('aria-pressed', b.dataset.cat === state.cat));
  clear.hidden = !state.q;
  count.textContent = `Results: ${hits.length}`;
  list.innerHTML = !DOCS.length ? EMPTY_ARCHIVE : hits.length ? hits.map(card).join('') : NO_MATCH;

  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.cat !== 'All') p.set('cat', state.cat);
  if (state.sort !== 'newest') p.set('sort', state.sort);
  if (draftQs) p.set('draft', '1');
  history.replaceState(null, '', (p.size ? `?${p}` : location.pathname) + location.hash);
}

function reset() {
  state.q = search.value = '';
  state.cat = 'All';
  render();
  search.focus();
}

search.addEventListener('input', () => { state.q = search.value; render(); });
clear.addEventListener('click', () => { state.q = search.value = ''; render(); search.focus(); });
sort.addEventListener('change', () => { state.sort = sort.value; render(); });
filters.addEventListener('click', e => {
  const b = e.target.closest('.rl-tab');
  if (b) { state.cat = b.dataset.cat; render(); }
});
list.addEventListener('click', e => { if (e.target.closest('.reset')) reset(); });

// 목록 / 격자 보기
function setView(v) {
  list.classList.toggle('rl-grid', v === 'grid');
  views.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === v));
  try { localStorage.setItem('research-view', v); } catch {}
}
views.addEventListener('click', e => {
  const b = e.target.closest('[data-view]');
  if (b) setView(b.dataset.view);
});
let savedView = 'list';
try { if (localStorage.getItem('research-view') === 'grid') savedView = 'grid'; } catch {}
setView(savedView);
render();

// 관련 프로젝트 (projects/projects.js 데이터). 상태는 프로젝트 데이터 그대로
document.getElementById('related').innerHTML = PROJECTS.map(p => {
  const n = DOCS.filter(d => d.projectId === p.name).length;
  return `
  <li><a class="rl-proj" href="../projects/${projectUrl(p)}">
    <span class="rl-proj-no">PROJECT ${esc(p.id)}</span>
    <b>${esc(p.name)}</b>
    <span class="rl-proj-cat">${esc(p.category)}</span>
    <span class="rl-tag${p.status === 'in-development' ? ' rl-tag-pub' : ''}">${PROJECT_STATUS[p.status] || esc(p.status)}</span>
    <span class="rl-proj-docs">${n ? `${n} research document${n > 1 ? 's' : ''}` : 'No linked research yet'}</span>
    <span class="rl-arrow" aria-hidden="true">→</span>
  </a></li>`;
}).join('');

// 섹션 등장 효과: 화면에 들어올 때 한 번 (기본은 보이는 상태라 실패해도 내용이 숨지 않음)
const io = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
}), { rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('.rl-sec').forEach(s => io.observe(s));
