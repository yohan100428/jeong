// 홈 (index.html). 데이터는 projects/projects.js · research/documents.js 를 그대로 사용 — 홈에 따로 적지 않음.
{ // 블록으로 감쌈: 다른 스크립트 전역 이름과 충돌 방지

  // ---- HeroMedia: 영상 / 포스터 / CSS 기본 배경 ----
  // 지금은 영상이 없어 CSS 기본 배경(css/home.css 의 .hm-art)만 보임.
  // 실제 주행·제작 영상이 준비되면: 파일을 media/ 에 넣고 아래 값만 수정.
  //   posterSrc: 'media/home-hero-poster.webp'  → 정지 이미지 (모바일·모션 줄이기 설정에서는 이것만 표시)
  //   videoSrc:  'media/home-hero.mp4' + enableVideo: true → 배경 영상 (음소거·자동재생·반복)
  // 파일을 못 불러오면 자동으로 CSS 기본 배경이 유지됨. AI 생성 차량 이미지를 실제 영상처럼 쓰지 말 것.
  const HERO_MEDIA = { enableVideo: false, videoSrc: '', posterSrc: '', overlayOpacity: .6 };

  function heroMedia(el, c) {
    el.style.setProperty('--overlay', c.overlayOpacity);
    const show = node => { el.prepend(node); el.classList.add('has-media'); };
    if (c.posterSrc) {
      const img = new Image();
      img.alt = '';
      img.onload = () => { if (!el.querySelector('video')) show(img); };
      img.src = c.posterSrc;
    }
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 720px)').matches;
    if (c.enableVideo && c.videoSrc && !still) {
      const v = document.createElement('video');
      Object.assign(v, { muted: true, autoplay: true, loop: true, playsInline: true, preload: 'metadata', poster: c.posterSrc || '' });
      v.addEventListener('canplay', () => { el.querySelector('img')?.remove(); show(v); }, { once: true });
      v.src = c.videoSrc;
    }
  }
  heroMedia(document.getElementById('hero-media'), HERO_MEDIA);

  // ---- THE MACHINES: 프로젝트 데이터 앞에서 2개 ----
  document.getElementById('machines').innerHTML = PROJECTS.slice(0, 2).map(p => `
    <article class="hm-proj hm-rv">
      <div class="hm-proj-vis">
        ${p.cover ? `<img src="projects/${esc(p.cover)}" alt="${esc(p.name)} — ${GALLERY_KIND[p.coverKind] || ''}" loading="lazy"><small class="hm-tech">${GALLERY_KIND[p.coverKind] || ''}</small>`
                  : `<b aria-hidden="true">${esc(p.id)}</b>`}
      </div>
      <div>
        <p class="hm-tech">PROJECT ${esc(p.id)}<span class="hm-status">${PROJECT_STATUS[p.status] || esc(p.status)}</span></p>
        <h3>${esc(p.name)}</h3>
        <p class="hm-tech hm-proj-cat">${esc(p.category)}</p>
        <p class="hm-proj-desc">${esc(p.description)}</p>
        <a class="hm-btn" href="projects/${projectUrl(p)}">EXPLORE ${esc(p.name)} <span aria-hidden="true">→</span></a>
      </div>
    </article>`).join('');

  // ---- 공개된 연구자료만 (초안은 홈에 올리지 않음) ----
  const published = RESEARCH_DOCS.filter(d => d.status === 'published').sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const paper = published[0];
  if (paper) document.getElementById('paper').innerHTML = `
    <p class="hm-tech hm-paper-top"><span class="hm-lime">${esc(paper.id)}</span><span>${esc(paper.category)}</span>
      ${(paper.editions || []).map(e => `<span>${esc(e.name)} / ${esc(e.lang)}</span>`).join('')}<span>${paper.access === 'garage' ? 'GARAGE+' : 'OPEN ACCESS'}</span></p>
    <h3>${esc(paper.title)}</h3>
    ${paper.titleOriginal ? `<p class="hm-paper-orig" lang="ko">${esc(paper.titleOriginal)}</p>` : ''}
    ${paper.abstract ? `<p class="hm-paper-abs">${esc(paper.abstract)}</p>` : ''}
    <a class="hm-btn" href="research/${esc(docUrl(paper))}">READ RESEARCH <span aria-hidden="true">→</span></a>`;
  else document.getElementById('paper').hidden = true;

  // ---- FROM THE GARAGE: 실제 기록만 (공개 연구자료 + 날짜가 있는 프로젝트 빌드 로그). 지어낸 소식 금지 ----
  const feed = [
    ...published.map(d => ({ date: d.createdAt, kind: 'RESEARCH RELEASE', title: `${d.id} — ${d.title}`, url: `research/${docUrl(d)}` })),
    ...PROJECTS.flatMap(p => p.logs.filter(l => l.date).map(l => ({ date: l.date, kind: `${p.name} BUILD LOG`, title: l.title, url: l.url || `projects/${projectUrl(p)}` }))),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  document.getElementById('feed').innerHTML = feed.length
    ? `<ul class="hm-feed">${feed.map(f => `
        <li><a href="${esc(f.url)}"><span class="hm-tech">${esc(f.date)}</span>
          <span><span class="hm-tech">${esc(f.kind)}</span><b>${esc(f.title)}</b></span><i aria-hidden="true">→</i></a></li>`).join('')}</ul>`
    : `<p class="hm-feed-empty">Development records will appear here as the work is documented.</p>
       <a class="hm-btn" href="projects/index.html">EXPLORE PROJECTS <span aria-hidden="true">→</span></a>`;

  // 섹션 등장 효과: 화면에 들어올 때 한 번 (기본은 보이는 상태라 실패해도 내용이 숨지 않음)
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.hm-rv').forEach(s => io.observe(s));
}
