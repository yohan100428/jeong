// 프로젝트 목록: 카테고리 필터. 상태는 URL(?group=)에 저장해 뒤로가기 시 유지.
const params = new URLSearchParams(location.search);
let group = PROJECT_FILTERS.some(([k]) => k === params.get('group')) ? params.get('group') : 'all';

const filters = document.getElementById('filters');
const grid = document.getElementById('grid');

filters.innerHTML = PROJECT_FILTERS
  .map(([key, label]) => `<button type="button" class="chip" data-group="${key}">${label}</button>`).join('');

function render() {
  filters.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.group === group));
  const hits = PROJECTS.filter(p => projectMatches(p, group));
  grid.innerHTML = hits.map(p => `
    <li class="pj-card">
      <a class="pj-cover" href="${projectUrl(p)}" tabindex="-1" aria-hidden="true">${projectCover(p)}</a>
      <div class="pj-body">
        <p class="pj-no">PROJECT ${esc(p.id)}</p>
        <h2><a href="${projectUrl(p)}">${esc(p.name)}</a></h2>
        <p class="pj-tags"><span class="pj-cat">${esc(p.category)}</span>${projectStatus(p)}</p>
        <p class="pj-desc">${esc(p.description)}</p>
        ${p.updatedAt ? `<p class="pj-updated">LAST UPDATED ${esc(p.updatedAt)}</p>` : ''}
        <a class="pj-btn" href="${projectUrl(p)}">EXPLORE ${esc(p.name)}</a>
      </div>
    </li>`).join('')
    || '<li class="empty">No projects in this category yet.<br><button type="button" class="reset">Show all projects</button></li>';
  history.replaceState(null, '', group === 'all' ? location.pathname : `?group=${group}`);
}

filters.addEventListener('click', e => {
  const b = e.target.closest('.chip');
  if (b) { group = b.dataset.group; render(); }
});
grid.addEventListener('click', e => {
  if (e.target.closest('.reset')) { group = 'all'; render(); }
});
render();
