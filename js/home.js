// 홈 (index.html) — Hero 배경만 담당. 홈은 다른 페이지 데이터(프로젝트·연구자료)를 읽지 않음.
{ // 블록으로 감쌈: 다른 스크립트 전역 이름과 충돌 방지

  // ---- HeroMedia: 영상 / 포스터 / 기본 배경 ----
  // 지금은 영상이 없어 기본 배경(css/home.css 의 .hm-media)만 보임.
  // 실제 주행·제작 영상이 준비되면: 파일을 media/ 에 넣고 아래 값만 수정.
  //   posterSrc: 'media/home-hero-poster.webp'  → 정지 이미지 (모바일·모션 줄이기 설정에서는 이것만 표시)
  //   videoSrc:  'media/home-hero.mp4' + enableVideo: true → 배경 영상 (음소거·자동재생·반복)
  // 파일을 못 불러오면 자동으로 기본 배경이 유지됨. AI 생성 차량 이미지를 실제 영상처럼 쓰지 말 것.
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
}
