// 프로젝트 상세 맨 위 3D 뷰어. projects.js 의 프로젝트에 model 이 있을 때만 보임.
//   model: { url: '../models/<file>.glb', name: '화면에 보일 이름', note: '모델 정보에 보일 안내 (선택)', ...뷰어 옵션 }
// 뷰어 본체는 ../js/model-viewer.js. models/ 폴더는 누구나 내려받을 수 있으므로 공개해도 되는 파일만 둘 것.
import { engineeringModelViewer } from '../js/model-viewer.js';

const p = PROJECTS.find(x => x.slug === new URLSearchParams(location.search).get('slug'));
const el = document.getElementById('viewer');
if (p?.model?.url) {
  const { url, name, note, ...options } = p.model;
  el.querySelector('.mv-name').textContent = name || p.name;
  el.querySelector('.note').textContent = note || '';
  el.querySelector('.note').hidden = !note;
  el.hidden = false;
  const viewer = engineeringModelViewer(el, { modelUrl: url, ...options });
  addEventListener('pagehide', e => { if (!e.persisted) viewer.dispose(); });
}
