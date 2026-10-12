// 연구자료 데이터. 새 자료 추가 = 아래 RESEARCH_DOCS 에 객체 하나 추가 (UI 코드 수정 불필요).
// 본문: research/content/<slug>.md · 첨부파일: research/files/
// PDF 논문: PDF 를 research/ 에 넣고 editions 에 언어판을 등록 (같은 문서 ID 를 여러 언어판이 공유).
//   editions: [{ lang: 'KR', name: 'Korean', url: 'JM-RP-0001-KR.pdf' }, { lang: 'EN', name: 'English', url: 'JM-RP-0001-EN.pdf' }]
//   title = 사이트 표시 제목, titleOriginal = 원문 제목. createdAt 은 'YYYY-MM-DD' 또는 연도만('YYYY').
//   page: 전용 주소가 필요하면 doc.html 을 <slug>.html 로 복사하고 여기에 파일명 (없으면 doc.html?slug=...)
// status: 'published' 만 공개 사이트에 노출. 'draft' 는 로컬(file://, localhost) 또는 ?draft=1 에서만 보임.

const RESEARCH_CATEGORIES = ['Aerodynamics', 'Mechanical', 'Powertrain', 'Electronics'];

// 프로젝트 페이지가 생기면 여기에 연결: { 'K-01': '../projects/k01.html' }
const PROJECT_PAGES = { 'K-01': '../projects/project.html?slug=k-01' };

const RESEARCH_DOCS = [
  {
    id: 'JM-RP-0001',
    slug: 'jm-rp-0001',
    page: 'jm-rp-0001.html',
    title: 'Aerodynamic Analysis of a Wide-Range Variable Rear Wing Using CFD', // 사이트 표시용 번역 제목 (영문판 논문은 없음)
    titleOriginal: 'CFD 수치해석을 활용한 광대역 가변형 리어윙의 공기역학적 분석',
    author: ['이주찬', '정시원'],
    category: 'Aerodynamics',
    documentType: 'Research Paper',
    createdAt: '2026',
    abstract: 'A numerical investigation of the aerodynamic characteristics of a variable rear wing using CFD simulations. The study compares drag, downforce, and aerodynamic efficiency across five nominal flap-angle configurations: 0°, 35°, 70°, 90°, and 180°. The study found that the 70° configuration produced the highest downforce-to-drag ratio among the tested conditions. The results are limited to the simulated geometry and conditions.',
    keywords: ['CFD', 'Rear Wing', 'Downforce', 'Drag'],
    access: 'open',
    status: 'published',
    editions: [{ lang: 'KR', name: 'Korean', url: 'JM-RP-0001-KR.pdf' }], // 현재 한국어판만 있음
  },
  {
    id: 'demo-001',
    slug: 'rear-wing-aoa-aero',
    title: 'Aerodynamic Characteristics of a Rear Wing by Angle of Attack',
    author: ['JEONG MOTORS'],
    category: 'Aerodynamics',
    documentType: 'Test Report',
    createdAt: '2026-10-09',
    keywords: ['CFD', 'Aerodynamics'],
    version: '0.1',
    status: 'draft', // UI 검증용 샘플
  },
  {
    id: 'demo-002',
    slug: 'k01-steering-geometry',
    title: 'K-01 Steering Geometry Design Review',
    author: ['JEONG MOTORS'],
    category: 'Mechanical',
    documentType: 'Technical Report',
    createdAt: '2026-10-09',
    keywords: ['K-01', 'Steering', 'Geometry'],
    projectId: 'K-01',
    version: '0.1',
    status: 'draft', // UI 검증용 샘플
    contentPath: 'content/k01-steering-geometry.md',
  },
  {
    id: 'demo-003',
    slug: 'k01-engine-cvt-compat',
    title: 'K-01 Engine and CVT Compatibility Review',
    author: ['JEONG MOTORS'],
    category: 'Powertrain',
    documentType: 'Technical Review',
    createdAt: '2026-10-09',
    keywords: ['K-01', 'Powertrain', 'CVT'],
    projectId: 'K-01',
    version: '0.1',
    status: 'draft', // UI 검증용 샘플
  },
  /* 첨부파일 예시:
  attachments: [{ name: 'Report PDF', url: 'files/k01-steering.pdf', type: 'PDF' }],
  */
];

// ---- 아래는 공용 로직 (자료 추가 시 수정 불필요) ----

const SHOW_DRAFTS = typeof location !== 'undefined' &&
  (location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(location.hostname) ||
   new URLSearchParams(location.search).has('draft'));

const DOCS = RESEARCH_DOCS
  .filter(d => d.status === 'published' || SHOW_DRAFTS)
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

// 검색: 공백으로 나눈 모든 단어가 포함돼야 일치. 대소문자 무시.
// ponytail: 클라이언트 전체 스캔, 자료 수백 건 넘으면 서버/인덱스 검색으로 교체
function researchMatches(doc, query, category) {
  if (category && category !== 'All' && doc.category !== category) return false;
  const hay = [doc.id, doc.title, doc.titleOriginal, doc.titleEn, doc.abstract, doc.category, doc.documentType, ...doc.author, ...doc.keywords]
    .filter(Boolean).join(' ').toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every(t => hay.includes(t));
}

const docUrl = d => d.page || `doc.html?slug=${encodeURIComponent(d.slug)}`;

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

if (typeof module !== 'undefined') module.exports = { RESEARCH_DOCS, researchMatches, esc };
