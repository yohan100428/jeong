// 연구자료 데이터. 새 자료 추가 = 아래 RESEARCH_DOCS 에 객체 하나 추가 (UI 코드 수정 불필요).
// 본문: research/content/<slug>.md · 첨부파일: research/files/
// status: 'published' 만 공개 사이트에 노출. 'draft' 는 로컬(file://, localhost) 또는 ?draft=1 에서만 보임.

const RESEARCH_CATEGORIES = ['공기역학', '기계공학', '동력계', '전자공학'];

// 프로젝트 페이지가 생기면 여기에 연결: { 'K-01': '../projects/k01.html' }
const PROJECT_PAGES = {};

const RESEARCH_DOCS = [
  {
    id: 'demo-001',
    slug: 'rear-wing-aoa-aero',
    title: '리어윙 받음각에 따른 공력 특성 분석',
    author: ['JEONG MOTORS'],
    category: '공기역학',
    documentType: '실험 보고서',
    createdAt: '2026-10-09',
    keywords: ['CFD', 'Aerodynamics'],
    version: '0.1',
    status: 'draft', // UI 검증용 샘플
  },
  {
    id: 'demo-002',
    slug: 'k01-steering-geometry',
    title: 'K-01 조향계 기하학적 설계 검토',
    author: ['JEONG MOTORS'],
    category: '기계공학',
    documentType: '기술 보고서',
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
    title: 'K-01 엔진 및 CVT 호환성 검토',
    author: ['JEONG MOTORS'],
    category: '동력계',
    documentType: '기술 검토',
    createdAt: '2026-10-09',
    keywords: ['K-01', 'Powertrain', 'CVT'],
    projectId: 'K-01',
    version: '0.1',
    status: 'draft', // UI 검증용 샘플
  },
  /* 첨부파일 예시:
  attachments: [{ name: '보고서 PDF', url: 'files/k01-steering.pdf', type: 'PDF' }],
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
  if (category && category !== '전체' && doc.category !== category) return false;
  const hay = [doc.title, doc.titleEn, doc.abstract, doc.category, doc.documentType, ...doc.author, ...doc.keywords]
    .filter(Boolean).join(' ').toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every(t => hay.includes(t));
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

if (typeof module !== 'undefined') module.exports = { RESEARCH_DOCS, researchMatches, esc };
