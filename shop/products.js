// 부품 스토어 상품 데이터. 새 상품 = PRODUCTS 에 객체 하나 추가 (UI 코드 수정 불필요).
// 이미지: shop/images/<slug>/ 에 넣고 images 에 경로 추가. 없으면 '이미지 준비중' 표시.
// 결제/주문은 아직 없음. 나중에 Shopify 등 연결 시 commerceId(외부 상품 ID)로 매칭.
//
// 검토 상태(status) — 실제로 확인한 만큼만 표시할 것:
//   'used'   Used in Project : JEONG 프로젝트에 실제 장착·사용
//   'tested' Tested          : JEONG 이 직접 시험
//   'review' Under Review    : 아직 직접 검증 안 함 (기본값)
// 판매 상태(availability): 'coming-soon' | 'available' | 'sold-out'
// 사양 출처(specs[].source): 'manufacturer' 제조사 공개 사양 | 'measured' JEONG 실측

const PRODUCT_CATEGORIES = ['Powertrain', 'Steering', 'Suspension', 'Electronics', 'Tools'];

const PRODUCTS = [
  {
    id: 'demo-p001',
    slug: 'demo-rack-pinion-gearbox',
    demo: true, // UI 검증용 샘플 — 실제 판매 상품 아님
    name: '랙 앤 피니언 조향 기어박스',
    summary: '소형 차량용 조향 기어박스 (데모 상품)',
    category: 'Steering',
    price: 129000,
    currency: 'KRW',
    images: [],
    features: ['데모 상품 — 실제 사양 아님', '상세페이지 레이아웃 확인용'],
    status: 'review',
    availability: 'coming-soon',
    video: '', // YouTube URL (watch, youtu.be, shorts 모두 가능). 비우면 영상 영역 숨김
    actionImages: [], // 실제 사용 사진 경로
    review: null, // { pros: [], cons: [], reason: '', verification: '' } — 직접 써본 제품만
    specs: [
      { label: '형식', value: 'Rack & Pinion', source: 'manufacturer' },
      { label: '랙 스트로크', value: 'TBD', source: 'manufacturer' },
      { label: '중량', value: 'TBD', source: 'manufacturer' },
    ],
    compatibility: ['K-01 장착 여부 미검증'],
    notes: ['데모 데이터입니다. 실제 사양과 다릅니다.'],
    projectId: 'K-01',
    relatedResearch: ['k01-steering-geometry'], // research/documents.js 의 slug
    relatedProducts: ['demo-digital-torque-wrench'],
  },
  {
    id: 'demo-p002',
    slug: 'demo-cvt-drive-belt',
    demo: true,
    name: 'CVT 구동 벨트',
    summary: '소형 엔진용 CVT 벨트 (데모 상품)',
    category: 'Powertrain',
    price: null, // null = 가격 미정
    currency: 'KRW',
    images: [],
    features: ['데모 상품 — 실제 사양 아님'],
    status: 'review',
    availability: 'coming-soon',
    video: '',
    actionImages: [],
    review: null,
    specs: [
      { label: '벨트 폭', value: 'TBD', source: 'manufacturer' },
      { label: '둘레', value: 'TBD', source: 'manufacturer' },
    ],
    compatibility: ['적용 엔진 미검증'],
    notes: ['데모 데이터입니다.'],
    projectId: 'K-01',
    relatedResearch: ['k01-engine-cvt-compat'],
    relatedProducts: [],
  },
  {
    id: 'demo-p003',
    slug: 'demo-digital-torque-wrench',
    demo: true,
    name: '디지털 토크 렌치',
    summary: '체결 토크 관리용 공구 (데모 상품)',
    category: 'Tools',
    price: 89000,
    currency: 'KRW',
    images: [],
    features: ['데모 상품 — 실제 사양 아님'],
    status: 'review',
    availability: 'coming-soon',
    video: '',
    actionImages: [],
    review: null,
    specs: [
      { label: '측정 범위', value: 'TBD', source: 'manufacturer' },
      { label: '정확도', value: 'TBD', source: 'manufacturer' },
    ],
    compatibility: [],
    notes: ['데모 데이터입니다.'],
    relatedResearch: [],
    relatedProducts: ['demo-rack-pinion-gearbox'],
  },
];

// ---- 아래는 공용 로직 (상품 추가 시 수정 불필요) ----

const STATUS_LABEL = { used: 'Used in Project', tested: 'Tested', review: 'Under Review' };
const AVAILABILITY_LABEL = { 'coming-soon': 'Coming Soon', available: '판매중', 'sold-out': '품절' };

// 검색: 공백으로 나눈 모든 단어가 포함돼야 일치. 대소문자 무시.
function productMatches(p, query, category) {
  if (category && category !== 'All' && p.category !== category) return false;
  const hay = [p.name, p.summary, p.category, ...p.features].join(' ').toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every(t => hay.includes(t));
}

const formatPrice = p => p.price == null
  ? '가격 미정'
  : new Intl.NumberFormat('ko-KR', { style: 'currency', currency: p.currency }).format(p.price);

// YouTube URL -> 영상 ID (watch?v=, youtu.be/, shorts/, embed/). 아니면 null
function youtubeId(url) {
  const m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/.exec(url || '');
  return m ? m[1] : null;
}

// 화면용 HTML 조각 (esc 는 research/documents.js 에 있음 — 스토어 페이지에서 함께 로드)
const statusBadge = p => `<span class="st st-${p.status}">${STATUS_LABEL[p.status]}</span>`;
const productImage = (p, i = 0) => p.images[i]
  ? `<img src="${esc(p.images[i])}" alt="${esc(p.name)}" loading="lazy">`
  : '<div class="ph" role="img" aria-label="이미지 준비중"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg><span>이미지 준비중</span></div>';

if (typeof module !== 'undefined') module.exports = { PRODUCTS, productMatches, formatPrice, youtubeId };
