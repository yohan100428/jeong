// 홈 (index.html): 실제 STL 모델을 실시간 3D 로 보여 줌. 뷰어 본체는 js/model-viewer.js (재사용 가능).
// 모델 교체: 파일을 models/ 에 넣고 modelUrl 만 수정 (index.html 의 모델 이름·안내 문구도 함께).
// 공개해도 되는 파일만 models/ 에 둘 것 — 이 폴더는 누구나 내려받을 수 있음.
import { engineeringModelViewer } from './model-viewer.js';

const viewer = engineeringModelViewer(document.getElementById('viewer'), {
  modelUrl: 'models/SC19_FrontWing_CenterSection_UpdatedAero.stl', // 예시 프런트 윙 형상 (완성된 JEONG 차량이 아님)
  modelName: 'FRONT WING / CENTER SECTION',
});
addEventListener('pagehide', e => { if (!e.persisted) viewer.dispose(); });
