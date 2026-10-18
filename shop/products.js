// =====================================================================
// 부품 스토어 데이터. 새 상품 = PRODUCTS 에 객체 하나 추가 (UI 코드 수정 불필요).
// 이미지: shop/images/<slug>/ 에 넣고 images 에 경로 추가. 없으면 자리표시 그래픽.
// 결제·주문·재고 연동 없음. 나중에 커머스(Shopify 등) 연결 시 sku 로 매칭.
//
// 지켜야 할 규칙 (사실만 표시):
//   - demo: true  = 미리보기 상품. 화면에 PREVIEW 로 표시되고 실제 재고처럼 보이지 않음
//   - verification.status: 실제 근거가 있을 때만 올릴 것. 자동 부여 금지
//       'tested'     JEONG TESTED            — JEONG 이 직접 시험 (evidence 필수)
//       'docs'       DOCUMENTATION REVIEWED  — 제조사 문서 검토 (evidence 필수)
//       'unverified' NOT YET VERIFIED        — 기본값
//   - availability: 'available' | 'coming-soon' | 'out-of-stock'
//   - specs[].source / notes[].source: 'manufacturer' 제조사 주장 | 'jeong' JEONG 실측·검증. 값이 없으면 value 를 '' 로
//   - projects: 호환이 "확인된" JEONG 프로젝트만. { slug, evidence } — 추정으로 넣지 말 것
//   - documentation: 실제 파일/링크가 있을 때만. { label, kind, url }
//   - sourceType: 'original' JEONG 제작 | 'retail' 타사 소매 | 'affiliate' 제휴 | 'supplier' 외부 공급사 | '' 미정
//       제휴 상품은 affiliate: true 로 반드시 공개. 타사 제품을 JEONG 제작처럼 쓰지 말 것
// =====================================================================

// 카테고리: id 는 상품의 category 값. icon 은 24x24 SVG 내부 (실물 사진이 없을 때 쓰는 중립 아이콘)
const PRODUCT_CATEGORIES = [
  { id: 'powertrain', name: 'POWERTRAIN', icon: '<rect x="7" y="3" width="10" height="8" rx="1"/><path d="M12 11v5M9 21a3 3 0 1 1 6 0"/>' },
  { id: 'drivetrain', name: 'DRIVETRAIN', icon: '<circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/>' },
  { id: 'steering', name: 'STEERING', icon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M3.5 10h17M12 14v7"/>' },
  { id: 'suspension', name: 'SUSPENSION', icon: '<path d="M7 3h10M7 21h10M8 6l8 3-8 3 8 3-8 3"/>' },
  { id: 'braking', name: 'BRAKING', icon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2"/>' },
  { id: 'electronics', name: 'ELECTRONICS', icon: '<rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>' },
  { id: 'tools', name: 'TOOLS & EQUIPMENT', icon: '<path d="M14.5 5.5a4 4 0 0 0 4.9 4.9L10 19.8a2 2 0 0 1-2.8-2.8l9.4-9.4a4 4 0 0 1-2.1-2.1z"/>' },
  { id: 'jeong', name: 'JEONG COMPONENTS', icon: '<path d="M12 2l8.5 5v10L12 22l-8.5-5V7z"/><path d="M14 8v6a2 2 0 0 1-4 0"/>' },
];

const PRODUCTS = [
  {
    id: 'p001',
    sku: 'JG-PRV-0001',          // JEONG 부품 번호 (PRV = 미리보기)
    slug: 'cvt-drive-kit',
    demo: true,                  // 미리보기 — 아직 판매하지 않음 (판매 시작 시 false + availability 변경)
    featured: true,              // 스토어 홈 "FROM THE GARAGE" 에 노출
    addedAt: '2026-10-11',       // 'Newest' 정렬용
    name: 'CVT Drive Kit',
    summary: 'Belt-driven continuously variable transmission kit.',
    description: 'Driver and driven pulleys, drive belt, backplate, cover and mounting hardware, as pictured.',
    category: 'drivetrain',      // CVT = 변속기 -> DRIVETRAIN
    productType: 'Component',    // Component | Tool | Resource
    manufacturer: '',            // 비우면 "Not specified"
    seller: '',
    sourceType: '',
    affiliate: false,
    price: null,                 // null = 가격 미정
    currency: 'KRW',
    images: [                    // 첫 장 = 대표 이미지 (카드·상세 상단)
      'images/cvt-drive-kit/cvt-1.jpg', // 조립 상태 + 커버
      'images/cvt-drive-kit/cvt-2.jpg', // 구성품 펼친 모습
    ],
    figures: [                   // 사양 섹션 상단에 설명과 함께 보여줄 그림
      { src: 'images/cvt-drive-kit/cvt-2.jpg', caption: 'Kit contents as pictured: pulleys, belt, backplate, cover, sprocket and hardware.' },
    ],
    availability: 'coming-soon',
    verification: { status: 'unverified', evidence: '' },
    specs: [                     // group: 아코디언 묶음 이름. 모르는 값은 '' (NOT PROVIDED 로 표시)
      { group: 'Manufacturer specifications', label: 'Type', value: 'Belt-driven CVT', source: 'manufacturer' },
      { group: 'Manufacturer specifications', label: 'Ratio range', value: '', source: 'manufacturer' },
      { group: 'Mechanical interfaces', label: 'Driver bore', value: '', source: 'manufacturer' },
      { group: 'Mechanical interfaces', label: 'Driven bore', value: '', source: 'manufacturer' },
      { group: 'Mechanical interfaces', label: 'Output sprocket', value: '', source: 'manufacturer' },
      { group: 'Dimensions', label: 'Belt width', value: '', source: 'manufacturer' },
      { group: 'Dimensions', label: 'Center distance', value: '', source: 'manufacturer' },
      { group: 'Weight', label: 'Kit weight', value: '', source: 'manufacturer' },
    ],
    requirements: ['Engine compatibility has not been verified.', 'K-01 fitment has not been verified.'], // 호환·장착 조건
    notes: [],                   // { kind: measurement | assembly | testing | limitation, text, source: 'jeong' | 'manufacturer' }
    projects: [],                // 확인된 호환만: { slug: 'k-01', evidence: '...' }
    documentation: [],           // { label, kind: 'manual'|'drawing'|'cad'|'report'|'install', url }
    relatedResearch: ['k01-engine-cvt-compat'], // research/documents.js 의 slug (공개된 자료만 링크)
    relatedProducts: [],
    video: '',                   // YouTube URL. 비우면 영상 영역 숨김
    actionImages: [],            // 실제 사용 사진
  },

  {
    id: 'p002',
    sku: 'JG-PRV-0002',
    slug: 'hwasdan-h225-engine',
    demo: true,
    featured: true,
    addedAt: '2026-10-19',
    name: 'HWASDAN H225 Engine',
    summary: '223 cc air-cooled, four-stroke single-cylinder engine. Research catalog entry only.',
    description: 'A physical reference unit is held by JEONG. Published dimensions and independent measurements are recorded separately; no installation or operating compatibility is implied.',
    category: 'powertrain',
    productType: 'Component',
    manufacturer: 'HWASDAN',
    seller: '',
    sourceType: '',
    affiliate: false,
    price: null,
    currency: 'KRW',
    images: [],
    figures: [],
    availability: 'coming-soon',
    verification: { status: 'unverified', evidence: '' },
    specs: [
      { group: 'Manufacturer specifications', label: 'Displacement', value: '223 cc', source: 'manufacturer' },
      { group: 'Manufacturer specifications', label: 'Engine cycle', value: 'Four-stroke', source: 'manufacturer' },
      { group: 'Manufacturer specifications', label: 'Cooling', value: 'Air-cooled', source: 'manufacturer' },
      { group: 'Manufacturer specifications', label: 'Rated power', value: '4.5 kW at 3600 rpm (seller specification)', source: 'manufacturer' },
      { group: 'Reference measurements', label: 'PTO outer diameter', value: 'Approximately 20.00 mm (sample measurement)', source: 'jeong' },
    ],
    requirements: ['This entry is for component research, not an installation guide.', 'Project compatibility and operational safety have not been established.'],
    notes: [{ kind: 'measurement', text: 'PTO diameter was measured on the project reference unit. Measurement is not a performance or durability test.', source: 'jeong' }],
    projects: [],
    documentation: [],
    relatedResearch: [],
    relatedProducts: [],
    video: '',
    actionImages: [],
  },
  {
    id: 'p003',
    sku: 'JG-PRV-0003',
    slug: 'iljin-ij113046-hub',
    demo: true,
    featured: true,
    addedAt: '2026-10-19',
    name: 'ILJIN IJ113046 Wheel Hub Assembly',
    summary: 'Physical reference wheel hub assembly with preliminary reverse-engineering records.',
    description: 'The purchased unit has been photographed and measured for approximate CAD layout reference; it has not been qualified for any new vehicle application.',
    category: 'suspension',
    productType: 'Component',
    manufacturer: 'ILJIN',
    seller: '',
    sourceType: '',
    affiliate: false,
    price: null,
    currency: 'KRW',
    images: [],
    figures: [],
    availability: 'coming-soon',
    verification: { status: 'unverified', evidence: '' },
    specs: [
      { group: 'Identification', label: 'Manufacturer part number', value: 'IJ113046', source: 'manufacturer' },
      { group: 'Identification', label: 'Related OEM reference', value: '52750-1Y100 (reference; fitment must be independently confirmed)', source: 'manufacturer' },
      { group: 'Reference measurements', label: 'CAD reference', value: 'Preliminary approximate geometry prepared', source: 'jeong' },
    ],
    requirements: ['Measured geometry is a layout reference, not a manufacturing drawing.', 'Bearing retention, load capacity and application suitability are not validated here.'],
    notes: [{ kind: 'measurement', text: 'Preliminary front, rear and side sketches are based on a physical sample; full specification and structural validation remain outstanding.', source: 'jeong' }],
    projects: [],
    documentation: [],
    relatedResearch: [],
    relatedProducts: [],
    video: '',
    actionImages: [],
  },
  {
    id: 'p004',
    sku: 'JG-PRV-0004',
    slug: 'rack-pinion-steering-kit',
    demo: true,
    featured: false,
    addedAt: '2026-10-19',
    name: 'Rack & Pinion Steering Kit',
    summary: 'Third-party steering kit ordered for inspection; preliminary supplier dimensions only.',
    description: 'This preview records the sourcing and documentation status of a steering component. Dimensions, fitment and function remain subject to examination of the delivered product.',
    category: 'steering',
    productType: 'Component',
    manufacturer: '',
    seller: '',
    sourceType: '',
    affiliate: false,
    price: null,
    currency: 'KRW',
    images: [],
    figures: [],
    availability: 'coming-soon',
    verification: { status: 'unverified', evidence: '' },
    specs: [
      { group: 'Supplier information', label: 'Rack overall length', value: 'Approximately 335 mm (seller listing)', source: 'manufacturer' },
      { group: 'Supplier information', label: 'Tie rod overall length', value: 'Approximately 245 mm each (seller listing)', source: 'manufacturer' },
    ],
    requirements: ['All listed dimensions are supplier references, not JEONG measurements.', 'No vehicle-specific fitment or safety validation has been completed.'],
    notes: [{ kind: 'limitation', text: 'Catalog entry pending physical inspection and part identification.', source: 'jeong' }],
    projects: [],
    documentation: [],
    relatedResearch: [],
    relatedProducts: [],
    video: '',
    actionImages: [],
  },
];

// ---- 아래는 공용 로직 (상품 추가 시 수정 불필요) ----

const VERIFY_LABEL = { tested: 'JEONG TESTED', docs: 'DOCUMENTATION REVIEWED', unverified: 'NOT YET VERIFIED' };
const AVAILABILITY_LABEL = { available: 'Available', 'coming-soon': 'Coming Soon', 'out-of-stock': 'Out of Stock' };
const SOURCE_TYPE_LABEL = { original: 'JEONG Original Product', retail: 'Third-Party Retail Product', affiliate: 'Affiliate Product', supplier: 'External Supplier' };
const SORT_OPTIONS = [['featured', 'Featured'], ['price-asc', 'Price: Low to High'], ['price-desc', 'Price: High to Low'], ['newest', 'Newest'], ['name', 'Name']];

const categoryName = id => PRODUCT_CATEGORIES.find(c => c.id === id)?.name || id;

// 필터: 지정한 조건만 적용. f = { q, cat, min, max, brands[], availability[], verification[], types[] }
// 검색어는 공백으로 나눈 모든 단어가 포함돼야 일치 (대소문자 무시). 가격 조건이 있으면 가격 미정 상품은 제외.
function catalogFilter(list, f = {}) {
  const terms = (f.q || '').toLowerCase().split(/\s+/).filter(Boolean);
  const any = (arr, v) => !arr?.length || arr.includes(v);
  const min = f.min === '' || f.min == null ? null : Number(f.min);
  const max = f.max === '' || f.max == null ? null : Number(f.max);
  return list.filter(p => {
    if (f.cat && f.cat !== 'all' && p.category !== f.cat) return false;
    if (!any(f.brands, p.manufacturer) || !any(f.availability, p.availability)) return false;
    if (!any(f.verification, p.verification.status) || !any(f.types, p.productType)) return false;
    if ((min != null || max != null) && p.price == null) return false;
    if (min != null && p.price < min) return false;
    if (max != null && p.price > max) return false;
    const hay = [p.name, p.sku, p.summary, p.manufacturer, categoryName(p.category), p.productType].join(' ').toLowerCase();
    return terms.every(t => hay.includes(t));
  });
}

// 정렬 (원본 배열은 건드리지 않음). 가격 미정은 가격 정렬에서 항상 뒤로.
function catalogSort(list, key) {
  const priced = (a, b, dir) => (a.price == null) - (b.price == null) || dir * ((a.price ?? 0) - (b.price ?? 0));
  const by = {
    featured: (a, b) => !!b.featured - !!a.featured,
    'price-asc': (a, b) => priced(a, b, 1),
    'price-desc': (a, b) => priced(a, b, -1),
    newest: (a, b) => (b.addedAt || '').localeCompare(a.addedAt || ''),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return [...list].sort(by[key] || by.featured);
}

const formatPrice = p => p.price == null
  ? 'PRICE TBA'
  : new Intl.NumberFormat('ko-KR', { style: 'currency', currency: p.currency }).format(p.price);

// YouTube URL -> 영상 ID (watch?v=, youtu.be/, shorts/, embed/). 아니면 null
function youtubeId(url) {
  const m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/.exec(url || '');
  return m ? m[1] : null;
}

// 화면용 HTML 조각 (esc 는 research/documents.js 에 있음 — 스토어 페이지에서 함께 로드)
const verifyBadge = p => `<span class="vf vf-${p.verification.status}">${VERIFY_LABEL[p.verification.status]}</span>`;
const availBadge = p => `<span class="av av-${p.availability}">${AVAILABILITY_LABEL[p.availability] || esc(p.availability)}</span>`;
const categoryIcon = id => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PRODUCT_CATEGORIES.find(c => c.id === id)?.icon || ''}</svg>`;
// 이미지가 없으면 카테고리 아이콘 자리표시 (사진처럼 보이지 않게)
const productImage = (p, i = 0) => p.images[i]
  ? `<img src="${esc(p.images[i])}" alt="${esc(p.name)}" loading="lazy">`
  : `<div class="ph" role="img" aria-label="Image coming soon">${categoryIcon(p.category)}<span>IMAGE COMING SOON</span></div>`;
// 상품 카드 (스토어 홈·카탈로그 공용)
const productCard = p => `
  <li><a class="pcard" href="item.html?slug=${encodeURIComponent(p.slug)}">
    <div class="pcard-img">${productImage(p)}${p.demo ? '<span class="sticker">PREVIEW</span>' : ''}</div>
    <div class="pcard-body">
      <p class="pcard-meta"><span>${esc(p.sku)}</span><span>${esc(categoryName(p.category))}</span></p>
      <h3>${esc(p.name)}</h3>
      <p class="pcard-price">${formatPrice(p)}</p>
      <div class="pcard-tags">${availBadge(p)}${verifyBadge(p)}</div>
      <span class="pcard-more">VIEW DETAILS →</span>
    </div>
  </a></li>`;

if (typeof module !== 'undefined') module.exports = { PRODUCTS, PRODUCT_CATEGORIES, catalogFilter, catalogSort, formatPrice, youtubeId };
