// =====================================================================
// 프로젝트 데이터. 새 프로젝트 = PROJECTS 에 객체 하나 추가 (UI 코드 수정 불필요).
// 이미지: projects/images/<slug>/ 에 넣고 cover / gallery 에 경로 추가.
//
// 지켜야 할 규칙 (사실만 표시):
//   - specs[].type: 'confirmed' 확정 | 'planned' 계획 | 'tbd' 미정. 추정값을 confirmed 로 쓰지 말 것
//   - timeline[].status: 'completed' | 'in-progress' | 'planned'. date 는 실제 날짜가 있을 때만
//   - gallery[].kind: 실제 사진과 컨셉 렌더를 반드시 구분
//       'photo' 실제 사진 | 'component' 부품 사진 | 'cad' CAD 화면 | 'drawing' 도면 | 'concept' 컨셉 렌더 | 'video' 영상(youtube 주소)
//   - documents[]: research 에 연구자료 slug 를 넣으면 공개된 자료만 자동 링크. 없는 파일 링크 금지
//       access: 'open' OPEN ACCESS | 'garage' GARAGE+ | 'soon' COMING SOON
//   - model: 상세 페이지 맨 위 3D 뷰어 (선택). { url: '../models/<file>.glb', name, note }. 공개해도 되는 파일만
//   - 비어 있는 항목(gallery, logs 등)은 "아직 없음"으로 표시됨. 가짜 내용으로 채우지 말 것
// =====================================================================

const PROJECT_FILTERS = [['all', 'ALL PROJECTS'], ['vehicles', 'VEHICLES'], ['research', 'RESEARCH'], ['experiments', 'EXPERIMENTS']];
const PROJECT_STAGES = ['Concept', 'Research', 'Design', 'Parts Sourcing', 'Assembly', 'Validation'];
const SPEC_FIELDS = ['Vehicle configuration', 'Engine', 'Drivetrain', 'Chassis', 'Suspension', 'Steering system', 'Braking system', 'Wheel specifications'];

// 값이 정해지면 { label, value: '...', type: 'confirmed' | 'planned', note: '선택' } 로 교체
const tbdSpecs = () => SPEC_FIELDS.map(label => ({ label, value: '', type: 'tbd' }));
const stages = statuses => PROJECT_STAGES.map((stage, i) => ({ stage, status: statuses[i] || 'planned', date: '', note: '' }));

const PROJECTS = [
  {
    id: '001',
    slug: 'k-01',
    name: 'K-01',
    category: 'Experimental Vehicle',
    groups: ['vehicles', 'experiments'], // 필터: vehicles | research | experiments
    status: 'in-development',            // in-development | concept | completed | paused
    description: 'An independent lightweight vehicle engineering project, exploring chassis design, mechanical systems, and accessible performance.',
    cover: '',      // 이미지 경로. 비우면 자리표시 그래픽
    coverKind: '',  // cover 가 있을 때 필수: gallery kind 와 동일 ('photo', 'concept' ...)
    updatedAt: '',  // 실제 갱신일 (YYYY-MM-DD). 비우면 표시 안 함
    // 3D 모델: 원본 FBX 를 웹용으로 변환한 파일 (형상 단순화 + 압축). name · note 는 화면에 보이는 문구
    model: { url: '../models/k-01-model.glb', name: 'K-01 / 3D MODEL', note: 'Simplified for web viewing. Work in progress — details may change.' },
    overview: {
      objectives: ['Explore lightweight chassis design', 'Develop the mechanical systems', 'Keep performance accessible'],
      philosophy: 'Accessible performance and open engineering. We do not just show the machine — we document how it is built.',
      challenges: [], // 비우면 "To be documented"
      background: '',
    },
    specs: [...tbdSpecs(), { label: 'Development stage', value: 'In development', type: 'confirmed' }],
    timeline: stages(['completed', 'in-progress']), // ponytail: 단계 상태는 추정 초기값, 실제 진행에 맞게 수정
    gallery: [],   // { src, kind, caption } 또는 { kind: 'video', youtube: 'https://...', caption }
    logs: [],      // { no: '001', date: 'YYYY-MM-DD', title, category: 'MECHANICAL'|'DESIGN'|'ELECTRONICS'|'RESEARCH', summary, images: [], url: '선택' }
    documents: [
      { title: 'K-01 Steering Geometry Design Review', type: 'Research report', access: 'open', research: 'k01-steering-geometry' },
      { title: 'K-01 Engine and CVT Compatibility Review', type: 'Research report', access: 'open', research: 'k01-engine-cvt-compat' },
    ],
  },
];

// ---- 아래는 공용 로직 (프로젝트 추가 시 수정 불필요) ----

const PROJECT_STATUS = { 'in-development': 'IN DEVELOPMENT', concept: 'CONCEPT', completed: 'COMPLETED', paused: 'PAUSED' };
const GALLERY_KIND = { photo: 'PHOTO', component: 'COMPONENT PHOTO', cad: 'CAD', drawing: 'TECHNICAL DRAWING', concept: 'CONCEPT RENDER', video: 'VIDEO' };

const projectMatches = (p, group) => group === 'all' || p.groups.includes(group);
const projectUrl = p => `project.html?slug=${encodeURIComponent(p.slug)}`;

// 커버: 이미지가 없으면 자리표시 그래픽 (사진처럼 보이지 않게 번호 + 안내만). esc 는 research/documents.js
const projectCover = p => p.cover
  ? `<img src="${esc(p.cover)}" alt="${esc(p.name)} — ${GALLERY_KIND[p.coverKind] || ''}" loading="lazy"><span class="pj-kind">${GALLERY_KIND[p.coverKind] || ''}</span>`
  : `<div class="pj-ph" role="img" aria-label="Cover image pending"><b aria-hidden="true">${esc(p.id)}</b><span>COVER IMAGE PENDING</span></div>`;
const projectStatus = p => `<span class="pj-status pj-st-${p.status}">${PROJECT_STATUS[p.status] || esc(p.status)}</span>`;

if (typeof module !== 'undefined') module.exports = { PROJECTS, PROJECT_STAGES, projectMatches };
