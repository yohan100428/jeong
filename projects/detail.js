// 프로젝트 상세 (공용 템플릿): project.html?slug=<slug>
// 내용은 전부 projects.js 데이터에서. 비어 있는 항목은 "아직 없음"으로 표시 (가짜 내용 없음).
const root = document.getElementById('project');
const lightbox = document.getElementById('lightbox');

const SPEC_TYPE = { confirmed: 'CONFIRMED', planned: 'PLANNED', tbd: 'TBD' };
const STAGE_STATUS = { completed: 'COMPLETED', 'in-progress': 'IN PROGRESS', planned: 'PLANNED' };
const ACCESS = { open: 'OPEN ACCESS', garage: 'GARAGE+', soon: 'COMING SOON' };

const bullets = arr => `<ul class="pj-bullets">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
const pending = text => `<p class="pj-pending">${text}</p>`;
const section = (id, no, title, inner) => `
  <section class="pj-sec" id="${id}">
    <p class="pj-sec-no">${no}</p>
    <h2>${title}</h2>
    ${inner}
  </section>`;

function render() {
  const p = PROJECTS.find(x => x.slug === new URLSearchParams(location.search).get('slug'));
  if (!p) {
    root.innerHTML = '<h1 class="pj-title">PROJECT NOT FOUND.</h1><p class="pj-pending">The address is wrong or the project is not public.</p><p><a class="pj-btn" href="index.html">← ALL PROJECTS</a></p>';
    return;
  }
  document.title = `${p.name} — Project ${p.id} | JEONG MOTORS`;
  document.querySelector('meta[name=description]').content = p.description;

  const jump = `
      <nav class="pj-jump" aria-label="Project sections">
        <a href="#overview">Overview</a><a href="#specs">Specs</a><a href="#timeline">Timeline</a>
        <a href="#gallery">Gallery</a><a href="#log">Build log</a><a href="#documents">Documents</a>
      </nav>`;

  // A. 3D 쇼룸 정보 레이어 (모델이 있는 프로젝트만): 이름·상태·조작 안내만. 차량이 주인공이므로 더 넣지 말 것.
  //    뷰어(#viewer) 가장자리에 놓이고 클릭은 모델로 통과
  if (p.model) document.getElementById('showroom').innerHTML = `
    <div class="pj-show-id">
      <p class="pj-show-label">PROJECT ${esc(p.id)} / ${esc(p.category)}</p>
      <h1>${esc(p.name)}</h1>
      <p class="pj-show-status">${PROJECT_STATUS[p.status] || esc(p.status)}</p>
    </div>
    <p class="pj-show-hint"><span class="mv-mouse">DRAG TO ROTATE · CTRL + SCROLL TO ZOOM</span><span class="mv-touch">DRAG TO ROTATE · PINCH TO ZOOM</span></p>
    <a class="pj-show-scroll" href="#details">SCROLL TO EXPLORE ↓</a>`;

  // A-2. Hero. 모델이 있으면 이름·상태는 쇼룸에 이미 있으므로 소개 문단만 (제목·커버 자리표시 반복 안 함)
  const hero = p.model ? `
    <section class="pj-intro">
      <p class="pj-sub">PROJECT ${esc(p.id)} / INTRODUCTION</p>
      <p class="pj-intro-lead">${esc(p.description)}</p>${jump}
    </section>` : `
    <section class="pj-dhero">
      <p class="pj-sub">PROJECT ${esc(p.id)} / ${esc(p.category)}</p>
      <h1 class="pj-title">${esc(p.name)}</h1>
      <p class="pj-tags">${projectStatus(p)}</p>
      <p class="pj-lead">${esc(p.description)}</p>
      <div class="pj-cover pj-cover-lg">${projectCover(p)}</div>${jump}
    </section>`;

  // B. Overview — 본문 + 정보 패널
  const o = p.overview || {};
  const overview = section('overview', '01 / OVERVIEW', 'THE MACHINE.', `
    <div class="pj-two">
      <div>
        <h3>Objectives</h3>${o.objectives?.length ? bullets(o.objectives) : pending('To be documented.')}
        <h3>Design philosophy</h3>${o.philosophy ? `<p>${esc(o.philosophy)}</p>` : pending('To be documented.')}
        <h3>Engineering challenges</h3>${o.challenges?.length ? bullets(o.challenges) : pending('To be documented.')}
        <h3>Background</h3>${o.background ? `<p>${esc(o.background)}</p>` : pending('To be documented.')}
      </div>
      <dl class="pj-panel">
        <div><dt>PROJECT NO.</dt><dd>${esc(p.id)}</dd></div>
        <div><dt>CATEGORY</dt><dd>${esc(p.category)}</dd></div>
        <div><dt>STATUS</dt><dd>${PROJECT_STATUS[p.status] || esc(p.status)}</dd></div>
        ${p.updatedAt ? `<div><dt>LAST UPDATED</dt><dd>${esc(p.updatedAt)}</dd></div>` : ''}
      </dl>
    </div>`);

  // C. Specs — confirmed / planned / tbd 구분. note 가 있으면 펼쳐보기
  const specCard = s => {
    const body = `<span class="pj-spec-label">${esc(s.label)}</span><b>${s.value ? esc(s.value) : '—'}</b><span class="pj-type pj-type-${s.type}">${SPEC_TYPE[s.type]}</span>`;
    return s.note
      ? `<details class="pj-spec"><summary>${body}</summary><p>${esc(s.note)}</p></details>`
      : `<div class="pj-spec">${body}</div>`;
  };
  const specs = section('specs', '02 / SPECIFICATIONS', 'UNDER THE SKIN.', `
    <p class="pj-legend"><span class="pj-type pj-type-confirmed">CONFIRMED</span> decided and verified
      <span class="pj-type pj-type-planned">PLANNED</span> intended, may change
      <span class="pj-type pj-type-tbd">TBD</span> not decided yet</p>
    <div class="pj-specs">${p.specs.map(specCard).join('')}</div>`);

  // D. Timeline — 날짜는 실제 값이 있을 때만
  const timeline = section('timeline', '03 / TIMELINE', 'BUILD IN PROGRESS.', `
    <ol class="pj-timeline">${p.timeline.map((t, i) => `
      <li class="pj-stage pj-stage-${t.status}">
        <span class="pj-dot" aria-hidden="true"></span>
        <span class="pj-stage-no">${String(i + 1).padStart(2, '0')}</span>
        <b>${esc(t.stage)}</b>
        <span class="pj-stage-st">${STAGE_STATUS[t.status]}${t.date ? ` · ${esc(t.date)}` : ''}</span>
        ${t.note ? `<p>${esc(t.note)}</p>` : ''}
      </li>`).join('')}</ol>`);

  // E. Gallery — 종류 라벨로 실제 사진/도면/컨셉 구분, 클릭 시 라이트박스
  const gallery = section('gallery', '04 / GALLERY', 'BEHIND THE BUILD.', p.gallery.length ? `
    <div class="pj-gallery">${p.gallery.map((g, i) => g.kind === 'video'
      ? `<a class="pj-shot pj-video" href="${esc(g.youtube)}" target="_blank" rel="noopener"><span class="pj-kind">VIDEO</span><b>▶</b><span class="pj-cap">${esc(g.caption || 'Watch on YouTube')}</span></a>`
      : `<button type="button" class="pj-shot" data-shot="${i}"><img src="${esc(g.src)}" alt="${esc(g.caption || p.name)}" loading="lazy"><span class="pj-kind">${GALLERY_KIND[g.kind] || esc(g.kind)}</span></button>`).join('')}
    </div>` : pending('No photos, drawings or renders published yet.'));

  // F. Build log
  const logs = section('log', '05 / BUILD LOG', 'THE BUILD LOG.', p.logs.length ? `
    <div class="pj-logs">${p.logs.map(l => `
      <article class="pj-log">
        <p class="pj-log-meta"><span>ENTRY ${esc(l.no)}</span><span>${esc(l.date)}</span><span class="pj-type pj-type-planned">${esc(l.category)}</span></p>
        <h3>${esc(l.title)}</h3>
        <p>${esc(l.summary)}</p>
        ${l.images?.length ? `<div class="pj-log-imgs">${l.images.map(src => `<img src="${esc(src)}" alt="" loading="lazy">`).join('')}</div>` : ''}
        ${l.url ? `<a class="pj-more" href="${esc(l.url)}">READ MORE →</a>` : ''}
      </article>`).join('')}</div>` : pending('No build log entries yet.'));

  // G. Documents — 실제로 열 수 있는 자료만 링크. 공개 연구자료는 구독 유도 없이 바로 연결
  const docRow = d => {
    const doc = d.research && DOCS.find(x => x.slug === d.research);
    const href = doc ? `../research/doc.html?slug=${encodeURIComponent(doc.slug)}` : d.url;
    const access = href ? d.access : 'soon';
    const inner = `<span><b>${esc(d.title)}</b><small>${esc(d.type)}</small></span><span class="pj-access pj-access-${access}">${ACCESS[access]}</span>`;
    return href ? `<li><a href="${esc(href)}">${inner}</a></li>` : `<li><div>${inner}</div></li>`;
  };
  const documents = section('documents', '06 / DOCUMENTS', 'OPEN ENGINEERING.', `
    <p class="pj-note">Core research and selected technical materials stay free. See the <a href="../research/index.html">Research Library</a>.</p>
    ${p.documents.length ? `<ul class="pj-docs">${p.documents.map(docRow).join('')}</ul>` : pending('No documents published for this project yet.')}`);

  // H. Navigation
  const next = PROJECTS[(PROJECTS.indexOf(p) + 1) % PROJECTS.length];
  const nav = `
    <nav class="pj-nav" aria-label="Project navigation">
      <a class="pj-nav-all" href="index.html">← ALL PROJECTS</a>
      ${next !== p ? `<a class="pj-nav-next" href="${projectUrl(next)}"><span>NEXT PROJECT →</span><b>${esc(next.name)}</b><small>PROJECT ${esc(next.id)} / ${esc(next.category)}</small></a>` : ''}
    </nav>`;

  root.innerHTML = hero + overview + specs + timeline + gallery + logs + documents + nav;

  // 라이트박스 (native dialog: Esc·바깥 클릭으로 닫힘)
  root.querySelector('.pj-gallery')?.addEventListener('click', e => {
    const b = e.target.closest('[data-shot]');
    if (!b) return;
    const g = p.gallery[b.dataset.shot];
    lightbox.querySelector('img').src = g.src;
    lightbox.querySelector('img').alt = g.caption || p.name;
    lightbox.querySelector('.pj-kind').textContent = GALLERY_KIND[g.kind] || g.kind;
    lightbox.querySelector('figcaption').textContent = g.caption || '';
    lightbox.showModal();
  });

  // 섹션 등장 효과: 화면에 들어올 때 한 번 (동작 줄이기 설정이면 CSS 에서 꺼짐)
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  root.querySelectorAll('.pj-sec').forEach(s => io.observe(s));
}

lightbox.addEventListener('click', e => { if (e.target === lightbox || e.target.closest('.close')) lightbox.close(); });
render();
