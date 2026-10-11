// 부품 스토어 상품 데이터. 새 상품 = PRODUCTS 에 객체 하나 추가 (UI 코드 수정 불필요).
// 이미지: shop/images/<slug>/ 에 넣고 images 에 경로 추가. 없으면 'Image coming soon' 표시.
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
    name: 'Rack and Pinion Steering Gearbox',
    summary: 'Steering gearbox for small vehicles (demo product)',
    category: 'Steering',
    price: 129000,
    currency: 'KRW',
    images: [],
    features: ['Demo product — not real specifications', 'For checking the detail page layout'],
    status: 'review',
    availability: 'coming-soon',
    video: '', // YouTube URL (watch, youtu.be, shorts 모두 가능). 비우면 영상 영역 숨김
    actionImages: [], // 실제 사용 사진 경로
    review: null, // { pros: [], cons: [], reason: '', verification: '' } — 직접 써본 제품만
    specs: [
      { label: 'Type', value: 'Rack & Pinion', source: 'manufacturer' },
      { label: 'Rack travel', value: 'TBD', source: 'manufacturer' },
      { label: 'Weight', value: 'TBD', source: 'manufacturer' },
    ],
    compatibility: ['K-01 fitment not verified'],
    notes: ['Demo data. Differs from real specifications.'],
    projectId: 'K-01',
    relatedResearch: ['k01-steering-geometry'], // research/documents.js 의 slug
    relatedProducts: ['demo-digital-torque-wrench'],
  },
  {
    id: 'demo-p002',
    slug: 'demo-cvt-drive-belt',
    demo: true,
    name: 'CVT Drive Belt',
    summary: 'CVT belt for small engines (demo product)',
    category: 'Powertrain',
    price: null, // null = 가격 미정
    currency: 'KRW',
    images: [],
    features: ['Demo product — not real specifications'],
    status: 'review',
    availability: 'coming-soon',
    video: '',
    actionImages: [],
    review: null,
    specs: [
      { label: 'Belt width', value: 'TBD', source: 'manufacturer' },
      { label: 'Circumference', value: 'TBD', source: 'manufacturer' },
    ],
    compatibility: ['Engine compatibility not verified'],
    notes: ['Demo data.'],
    projectId: 'K-01',
    relatedResearch: ['k01-engine-cvt-compat'],
    relatedProducts: [],
  },
  {
    id: 'demo-p003',
    slug: 'demo-digital-torque-wrench',
    demo: true,
    name: 'Digital Torque Wrench',
    summary: 'Tool for managing fastening torque (demo product)',
    category: 'Tools',
    price: 89000,
    currency: 'KRW',
    images: [],
    features: ['Demo product — not real specifications'],
    status: 'review',
    availability: 'coming-soon',
    video: '',
    actionImages: [],
    review: null,
    specs: [
      { label: 'Measuring range', value: 'TBD', source: 'manufacturer' },
      { label: 'Accuracy', value: 'TBD', source: 'manufacturer' },
    ],
    compatibility: [],
    notes: ['Demo data.'],
    relatedResearch: [],
    relatedProducts: ['demo-rack-pinion-gearbox'],
  },
];

// ---- 아래는 공용 로직 (상품 추가 시 수정 불필요) ----

const STATUS_LABEL = { used: 'Used in Project', tested: 'Tested', review: 'Under Review' };
const AVAILABILITY_LABEL = { 'coming-soon': 'Coming Soon', available: 'Available', 'sold-out': 'Sold out' };

// 검색: 공백으로 나눈 모든 단어가 포함돼야 일치. 대소문자 무시.
function productMatches(p, query, category) {
  if (category && category !== 'All' && p.category !== category) return false;
  const hay = [p.name, p.summary, p.category, ...p.features].join(' ').toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every(t => hay.includes(t));
}

const formatPrice = p => p.price == null
  ? 'Price TBD'
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
  : '<div class="ph" role="img" aria-label="Image coming soon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg><span>Image coming soon</span></div>';

if (typeof module !== 'undefined') module.exports = { PRODUCTS, productMatches, formatPrice, youtubeId };
