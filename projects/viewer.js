// 프로젝트 상세 맨 위 3D 뷰어. projects.js 의 프로젝트에 model 이 있을 때만 보임.
//   model: { url: '../models/<file>.glb', ...뷰어 옵션 (autoRotate, cameraPosition 등 — ../js/model-viewer.js 의 DEFAULTS) }
// 뷰어 본체는 ../js/model-viewer.js. models/ 폴더는 누구나 내려받을 수 있으므로 공개해도 되는 파일만 둘 것.
import { engineeringModelViewer } from '../js/model-viewer.js';

const p = PROJECTS.find(x => x.slug === new URLSearchParams(location.search).get('slug'));
const el = document.getElementById('viewer');
if (p?.model?.url) {
  const { url, ...options } = p.model;
  el.querySelector('.mv-bg').textContent = p.name; // 배경의 큰 이름
  el.hidden = false;
  const viewer = engineeringModelViewer(el, { modelUrl: url, ...options });
  addEventListener('pagehide', e => { if (!e.persisted) viewer.dispose(); });
}
