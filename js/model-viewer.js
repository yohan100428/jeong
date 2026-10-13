// =====================================================================
// EngineeringModelViewer — STL 실시간 3D 뷰어 (Three.js). 홈에서 사용, 다른 페이지에서도 재사용 가능.
//
//   import { engineeringModelViewer } from './model-viewer.js';
//   const viewer = engineeringModelViewer(element, { modelUrl: 'models/part.stl' });
//   viewer.dispose();   // 페이지에서 뗄 때
//
// 모델 교체 = modelUrl 만 바꾸면 됨. 크기·위치·단위는 파일마다 다르므로 전부 경계 상자에서 계산
// (특정 모델 치수나 카메라 위치를 코드에 적지 않음).
//
// element 안에 있어야 하는 것 (없으면 그 기능만 생략):
//   [data-mv-status]   불러오는 중 / 오류 표시      [data-mv-rotate]      자동 회전 켜기·끄기
//   [data-mv-reset]    처음 시점으로               [data-mv-fullscreen]  전체 화면
//   [data-mv-tris] [data-mv-size]  모델 정보 (삼각형 수 · 크기)
// Three.js 는 CDN(jsdelivr)에서 불러옴. 실패하거나 WebGL 이 없으면 안내 문구만 보이고 페이지는 그대로 동작.
// =====================================================================

const DEFAULTS = {
  modelUrl: '',
  modelName: '',
  autoRotate: true,                 // 처음부터 천천히 회전. 화면의 ROTATE 버튼으로 언제든 멈출 수 있음 (모션 줄이기 설정과 무관하게 동작)
  autoRotateSeconds: 30,            // 한 바퀴 도는 시간
  upAxis: 'z',                      // 모델의 위쪽 축. CAD 내보내기는 보통 z, 이미 y 가 위면 'y'
  cameraPosition: [1, .62, 1.15],   // 모델 중심에서 카메라를 두는 방향 (거리는 자동 계산)
  materialStyle: { color: 0x8F8C99, metalness: .85, roughness: .4 }, // 새틴 금속 회색
  backgroundStyle: null,            // null = 투명 (배경은 CSS). 색을 주면 그 색으로 채움
  wheelZoom: 'ctrl',                // 'ctrl' = Ctrl+휠(또는 트랙패드 확대 동작)로만 확대해 페이지 스크롤을 막지 않음. 'always' = 휠만으로 확대
  creaseAngle: 35,                  // 이 각도(도)보다 완만한 모서리는 부드럽게 이어 곡면이 보이게
};

export function engineeringModelViewer(el, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const $ = name => el.querySelector(`[data-mv-${name}]`);
  const status = $('status');
  let disposed = false, cleanup = () => {};

  const say = (text, retry) => {
    if (!status) return;
    status.hidden = !text;
    status.innerHTML = text ? `<p></p>${retry ? '<button type="button">RETRY</button>' : ''}` : '';
    if (text) status.firstChild.textContent = text;
    if (retry) status.querySelector('button').onclick = start;
  };

  async function start() {
    cleanup();
    say('LOADING 3D MODEL...');
    let THREE, STLLoader, OrbitControls, RoomEnvironment, toCreasedNormals;
    try {
      [THREE, { STLLoader }, { OrbitControls }, { RoomEnvironment }, { toCreasedNormals }] = await Promise.all([
        import('three'), import('three/addons/loaders/STLLoader.js'), import('three/addons/controls/OrbitControls.js'),
        import('three/addons/environments/RoomEnvironment.js'), import('three/addons/utils/BufferGeometryUtils.js'),
      ]);
    } catch { return say('The 3D viewer could not be loaded.', true); }
    if (disposed) return;

    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { return say('3D view is not available on this device.'); }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); // 고해상도 화면에서 과한 연산 방지
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const canvas = renderer.domElement;
    el.prepend(canvas);

    const scene = new THREE.Scene();
    if (o.backgroundStyle != null) scene.background = new THREE.Color(o.backgroundStyle);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), .04).texture; // 금속 반사용 스튜디오 환경
    scene.environment = env;
    scene.environmentIntensity = .4;
    // 조명: 은은한 전체광 + 큰 주광 + 뒤쪽 보라 테두리광
    scene.add(new THREE.HemisphereLight(0xffffff, 0x17141c, .25));
    const key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(3, 5, 4); scene.add(key);
    const rim = new THREE.DirectionalLight(0x9B5CD0, 1.1); rim.position.set(-4, .5, -5); scene.add(rim);

    const camera = new THREE.PerspectiveCamera(30, 1, .01, 100);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false; // 모델이 화면 밖으로 사라지지 않게
    // 일반 휠은 뷰어가 가로채지 않고 페이지를 스크롤 (전체 화면에서는 휠만으로 확대)
    const onWheel = e => { if (o.wheelZoom === 'ctrl' && !e.ctrlKey && !document.fullscreenElement) e.stopPropagation(); };
    el.addEventListener('wheel', onWheel, { capture: true });
    controls.autoRotateSpeed = 60 / o.autoRotateSeconds; // OrbitControls: 2.0 = 30초에 한 바퀴
    canvas.style.touchAction = 'pan-y'; // 터치: 가로로 끌면 회전, 세로로 밀면 페이지 스크롤 (스크롤이 갇히지 않게)

    const material = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, ...o.materialStyle });
    let mesh, radius = 1, wantRotate = o.autoRotate, touched = false, resumeTimer;

    // 모델 전체가 보이는 거리 계산 (화면이 세로로 길면 가로 시야각 기준)
    function frame(reset) {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const vFov = camera.fov * Math.PI / 360, hFov = Math.atan(Math.tan(vFov) * camera.aspect);
      const dist = radius / Math.sin(Math.min(vFov, hFov)) * 1.08;
      controls.minDistance = dist * .4;
      controls.maxDistance = dist * 2.2;
      if (reset || !touched) {
        camera.position.copy(new THREE.Vector3(...o.cameraPosition).normalize().multiplyScalar(dist));
        controls.target.set(0, 0, 0);
        touched = false;
      }
      camera.updateProjectionMatrix();
      controls.update();
    }

    const setRotate = on => {
      wantRotate = on;
      controls.autoRotate = on;
      $('rotate')?.setAttribute('aria-pressed', on);
    };
    // 직접 돌리는 동안은 자동 회전 멈춤, 손을 떼고 잠시 뒤 다시 시작
    controls.addEventListener('start', () => { touched = true; clearTimeout(resumeTimer); controls.autoRotate = false; });
    controls.addEventListener('end', () => { resumeTimer = setTimeout(() => { controls.autoRotate = wantRotate; }, 2500); });

    const onRotate = () => setRotate(!wantRotate);
    const onReset = () => frame(true);
    const onFull = () => document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen?.();
    $('rotate')?.addEventListener('click', onRotate);
    $('reset')?.addEventListener('click', onReset);
    const fullBtn = $('fullscreen');
    if (fullBtn) { fullBtn.hidden = !el.requestFullscreen; fullBtn.addEventListener('click', onFull); }

    // 화면에 보일 때만 그림
    let raf = 0, visible = true;
    const tick = () => { raf = requestAnimationFrame(tick); controls.update(); renderer.render(scene, camera); };
    const run = () => { cancelAnimationFrame(raf); raf = 0; if (visible && !document.hidden && mesh) tick(); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); });
    io.observe(el);
    document.addEventListener('visibilitychange', run);
    const ro = new ResizeObserver(() => frame(false));
    ro.observe(el);

    cleanup = () => {
      cancelAnimationFrame(raf); clearTimeout(resumeTimer);
      io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', run);
      $('rotate')?.removeEventListener('click', onRotate);
      $('reset')?.removeEventListener('click', onReset);
      fullBtn?.removeEventListener('click', onFull);
      el.removeEventListener('wheel', onWheel, { capture: true });
      controls.dispose(); mesh?.geometry.dispose(); material.dispose(); env.dispose(); pmrem.dispose();
      renderer.dispose(); canvas.remove();
      cleanup = () => {};
    };

    new STLLoader().load(o.modelUrl, raw => {
      if (disposed) return;
      // 원본 파일은 그대로 두고, 화면용 사본만: 법선 계산 → 가운데 정렬 → 크기 정규화 (비율 유지)
      const geometry = toCreasedNormals(raw, o.creaseAngle * Math.PI / 180);
      if (o.upAxis === 'z') geometry.rotateX(-Math.PI / 2);
      geometry.computeBoundingBox();
      const size = geometry.boundingBox.getSize(new THREE.Vector3());
      const tris = raw.attributes.position.count / 3;
      geometry.center();
      mesh = new THREE.Mesh(geometry, material);
      mesh.scale.setScalar(2 / Math.max(size.x, size.y, size.z));
      geometry.computeBoundingSphere();
      radius = geometry.boundingSphere.radius * mesh.scale.x;
      scene.add(mesh);
      // 모델 정보: 파일에서 계산한 값만 표시 (단위는 파일에 없으므로 "units")
      const fmt = n => Math.round(n).toLocaleString('en');
      if ($('tris')) $('tris').textContent = fmt(tris);
      if ($('size')) $('size').textContent = [size.x, size.z, size.y].map(fmt).join(' × ') + ' units';
      frame(true);
      setRotate(wantRotate);
      say('');
      el.classList.add('mv-ready');
      run();
    }, e => { if (e.lengthComputable) say(`LOADING 3D MODEL... ${Math.round(e.loaded / e.total * 100)}%`); },
    () => { cleanup(); say('The 3D model could not be loaded.', true); });
  }

  start();
  return { dispose() { disposed = true; cleanup(); } };
}
