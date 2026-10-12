// =====================================================================
// 언어 전환 (EN / KO) — 국기 버튼. 모든 페이지에서 main.js 보다 먼저 로드.
//
// 방식: 화면의 영어 문구를 아래 사전(KO)으로 바꿔 끼움. HTML·JS 코드는 영어 그대로 둠.
//   - 번역 대상: 메뉴, 버튼, 입력 항목, 필터, 상태 표시, 안내·오류 문구 등 편의 기능 문구
//   - 번역 안 함: 고유명사(JEONG, CVT, K-01, GARAGE+, OPEN ACCESS ...), 큰 제목 슬로건,
//                 상품·프로젝트·연구자료 데이터(이름, 설명, 사양 값)
//   - 문구 추가: KO 에 '영어 원문': '번역' 한 줄 추가. 원문은 화면에 보이는 글자와 정확히 같아야 함
//   - 숫자·이름이 들어가는 문구는 KO_PATTERNS 에 정규식으로
// 기본 언어: 저장된 선택 > 브라우저 언어(ko 면 한국어) > 영어. 전환 시 페이지를 새로 읽음.
// =====================================================================

const LANG = (() => {
  try { const s = localStorage.getItem('lang'); if (s === 'ko' || s === 'en') return s; } catch {}
  return (navigator.language || '').startsWith('ko') ? 'ko' : 'en';
})();
document.documentElement.lang = LANG;

const KO = {
  // ---- 공용: 메뉴 · 헤더 · 프로필 ----
  'Home': '홈', 'Parts Store': '부품 스토어', 'Projects': '프로젝트', 'Research': '연구자료', 'Membership': '멤버십',
  'Contact': '문의', 'Soon': '준비 중', 'Open menu': '메뉴 열기', 'Menu': '메뉴', 'Close': '닫기', 'Profile': '프로필',
  'Language': '언어', 'Account': '계정', 'Sign in required': '로그인이 필요합니다', 'Member': '일반 회원',
  'Sign in with your JEONG MOTORS account.': 'JEONG MOTORS 계정으로 로그인하세요.', 'Sign out': '로그아웃', 'Sign in': '로그인',
  'Join →': '가입 →', 'Admin': '관리자', 'Administrator': '관리자', 'Admin mode (dev)': '관리자 모드 (개발용)', 'Admin menu': '관리자 메뉴',
  'Admin Dashboard': '관리자 대시보드', 'Research Management': '연구자료 관리', 'Upload Research': '연구자료 업로드',
  'Product Management': '상품 관리', 'Add Product': '상품 등록', 'Content Management': '콘텐츠 관리',
  // ---- 홈 · 로그인 ----
  'Enter your brand slogan here.': '브랜드 슬로건을 여기에 입력하세요.', 'Research Library': '연구자료실',
  'Temporary dev sign-in — any value works.': '개발용 임시 로그인 — 아무 값이나 입력하면 됩니다.', 'ID or email': '아이디 또는 이메일', 'Password': '비밀번호',

  // ---- 연구자료실 ----
  'Technical papers, experiments and engineering reports.': '기술 논문, 실험, 엔지니어링 보고서.',
  'Search research': '연구자료 검색', 'Search titles, keywords...': '제목, 키워드 검색...', 'Research field': '연구 분야', 'All': '전체',
  'No research documents published yet.': '아직 공개된 연구자료가 없습니다.',
  'No research documents match your search.': '검색 조건에 맞는 연구자료가 없습니다.', 'Reset search': '검색 조건 초기화',
  'Document not found.': '자료를 찾을 수 없습니다.', 'The address is wrong or the document is not public.': '주소가 잘못되었거나 비공개 자료입니다.',
  'DEMO · UI sample': 'DEMO · 화면 확인용 샘플', 'Author': '작성자', 'Date': '작성일', 'Updated': '수정일', 'Version': '버전',
  'Abstract': '초록', 'Keywords': '키워드', 'Attachments': '첨부파일', 'Related Project': '관련 프로젝트', 'Loading…': '불러오는 중…',
  'Could not load the content. (If opened as a local file, run a web server.)': '본문을 불러오지 못했습니다. (파일로 직접 열었다면 웹 서버로 실행하세요.)',

  // ---- 부품 스토어: 홈 ----
  'Discover components, tools, and engineering resources selected for real-world projects.': '실제 프로젝트를 위해 고른 부품, 공구, 엔지니어링 자료를 만나 보세요.',
  'EXPLORE THE GARAGE': '카탈로그 보기', 'OUR PHILOSOPHY': '우리의 철학', 'Eight systems, one garage.': '여덟 개의 시스템, 하나의 개러지.',
  'No items yet': '상품 준비 중', 'No featured products yet.': '아직 추천 상품이 없습니다.',
  'Preview items only. The store is not open for orders, and no prices are final.': '미리보기 상품입니다. 아직 주문을 받지 않으며 가격은 확정되지 않았습니다.',
  'We believe performance parts should be understood, documented, and evaluated — not simply advertised.': '성능 부품은 단순히 광고되는 것이 아니라, 이해되고 기록되고 평가되어야 한다고 믿습니다.',
  "This is where we are heading, not a claim about today's catalog: no item is marked JEONG TESTED until a real test record exists.": '이것은 앞으로의 방향이며 현재 카탈로그에 대한 주장이 아닙니다. 실제 테스트 기록이 생기기 전에는 어떤 상품도 JEONG 테스트 완료로 표시하지 않습니다.',
  'EXPLORE OUR PROCESS': '검증 과정 보기', 'Component measurements': '부품 실측', 'Installation documentation': '장착 문서',
  'CAD compatibility': 'CAD 호환성', 'Testing reports': '테스트 보고서', 'Engineering notes': '엔지니어링 노트', 'Related build projects': '관련 제작 프로젝트',
  'Original components born from our engineering projects.': '우리의 엔지니어링 프로젝트에서 태어난 오리지널 부품.',
  'Custom suspension components': '맞춤 서스펜션 부품', 'Uprights and mechanical assemblies': '업라이트 및 기계 조립체',
  'Electronics and control systems': '전자 및 제어 시스템', 'Engineering tools and digital resources': '엔지니어링 도구 및 디지털 자료',
  'CONCEPT': '컨셉', 'COMING SOON': '공개 예정',
  'Explore the research, development logs, and technical documentation behind our engineering projects.': '엔지니어링 프로젝트의 바탕이 된 연구, 개발 기록, 기술 문서를 살펴보세요.',
  'PROJECTS': '프로젝트', 'The machines we are building': '우리가 만들고 있는 기계들', 'RESEARCH': '연구', 'Papers and engineering reports': '논문과 엔지니어링 보고서',
  'ENGINEERING DOCUMENTATION': '엔지니어링 문서', 'K-01 project documents': 'K-01 프로젝트 문서', 'OPEN RESOURCES': '공개 자료',
  'What stays free with Open Access': 'Open Access 로 무료 제공되는 자료',
  'Explore advanced engineering tools, downloadable resources, and future membership benefits. Membership is in development.': '고급 엔지니어링 도구, 다운로드 자료, 앞으로의 멤버십 혜택을 살펴보세요. 멤버십은 준비 중입니다.',
  'EXPLORE MEMBERSHIP': '멤버십 보기',
  // ---- 부품 스토어: 카탈로그 ----
  'The store is in preview. Items shown are not available to order yet.': '스토어는 미리보기 단계입니다. 표시된 상품은 아직 주문할 수 없습니다.',
  'FILTERS': '필터', 'System': '시스템', 'ALL SYSTEMS': '전체 시스템', 'Price range': '가격 범위', 'Min': '최소', 'Max': '최대',
  'Minimum price': '최소 가격', 'Maximum price': '최대 가격', 'Brand': '브랜드', 'None listed yet.': '아직 없음.',
  'Product type': '상품 종류', 'Reset filters': '필터 초기화', 'Sort': '정렬', 'Search products': '상품 검색',
  'Search name, part number, system...': '상품명, 부품 번호, 시스템 검색...',
  'Featured': '추천순', 'Price: Low to High': '가격 낮은순', 'Price: High to Low': '가격 높은순', 'Newest': '최신순', 'Name': '이름순',
  'NOTHING ON THIS SHELF.': '이 선반은 비어 있습니다.', 'No products match these filters.': '필터 조건에 맞는 상품이 없습니다.',
  // ---- 부품 스토어: 상품 카드 · 상태 ----
  'PRICE TBA': '가격 미정', 'IMAGE COMING SOON': '이미지 준비 중', 'Image coming soon': '이미지 준비 중', 'PREVIEW': '미리보기', 'VIEW DETAILS →': '자세히 보기 →',
  'Available': '판매 중', 'Coming Soon': '출시 예정', 'Out of Stock': '품절', 'Availability': '판매 상태', 'Verification': '검증 상태',
  'JEONG TESTED': 'JEONG 테스트 완료', 'DOCUMENTATION REVIEWED': '문서 검토 완료', 'NOT YET VERIFIED': '검증 전',
  // ---- 부품 스토어: 상세 ----
  'Catalog': '카탈로그', 'PART NOT FOUND.': '상품을 찾을 수 없습니다.', 'The address is wrong or the product is no longer listed.': '주소가 잘못되었거나 더 이상 등록되지 않은 상품입니다.',
  '← BACK TO THE GARAGE': '← 카탈로그로', 'JEONG PART NO.': 'JEONG 부품 번호', 'MANUFACTURER': '제조사', 'Not specified': '미지정',
  'No verification records for this item yet.': '이 상품의 검증 기록은 아직 없습니다.', 'PREVIEW — NOT FOR SALE': '미리보기 — 판매 전',
  'CHECKOUT COMING SOON': '결제 기능 준비 중', 'Online purchasing is not available yet.': '온라인 구매는 아직 지원하지 않습니다.',
  'No specifications provided yet.': '아직 등록된 사양이 없습니다.', 'NOT PROVIDED': '정보 없음', 'TBD': '미정', 'JEONG MEASURED': 'JEONG 실측',
  'Compatibility requirements': '호환 조건', 'Manufacturer specifications': '제조사 사양', 'Dimensions': '치수', 'Weight': '무게', 'Material': '재질',
  'Mechanical interfaces': '기계적 인터페이스', 'Source documentation': '출처 문서', 'Specifications': '사양',
  'Measurements': '측정', 'Assembly observations': '조립 관찰', 'Testing notes': '테스트 기록', 'Limitations': '제한 사항',
  'MANUFACTURER CLAIM': '제조사 주장', 'JEONG NOTE': 'JEONG 메모', 'No engineering notes recorded yet.': '아직 기록된 엔지니어링 노트가 없습니다.',
  'No confirmed project compatibility yet. Compatibility is listed only after it has been checked on a JEONG project.': '확인된 프로젝트 호환 정보가 아직 없습니다. 호환성은 JEONG 프로젝트에서 실제로 확인한 뒤에만 표시합니다.',
  'MANUAL': '매뉴얼', 'DRAWING': '도면', 'REPORT': '보고서', 'INSTALL GUIDE': '설치 가이드',
  'No documentation published for this item yet.': '이 상품의 공개 문서는 아직 없습니다.',
  'SOURCE TYPE': '출처 유형', 'SELLER': '판매자', 'JEONG Original Product': 'JEONG 오리지널 제품', 'Third-Party Retail Product': '타사 소매 제품',
  'Affiliate Product': '제휴 제품', 'External Supplier': '외부 공급사',
  'This product is not manufactured by JEONG MOTORS.': '이 제품은 JEONG MOTORS 가 제조한 제품이 아닙니다.',
  'Affiliate disclosure: JEONG MOTORS may earn a commission if you buy through the seller link.': '제휴 안내: 판매자 링크를 통해 구매하면 JEONG MOTORS 가 수수료를 받을 수 있습니다.',
  'Sourcing for this item has not been decided yet.': '이 상품의 공급 방식은 아직 정해지지 않았습니다.',

  // ---- 프로젝트 ----
  'From experimental machines to ambitious performance engineering. Explore the projects shaping JEONG MOTORS.': '실험적인 기계부터 야심 찬 퍼포먼스 엔지니어링까지. JEONG MOTORS 를 만들어 가는 프로젝트를 살펴보세요.',
  'Project category': '프로젝트 분류', 'ALL PROJECTS': '전체 프로젝트', 'VEHICLES': '차량', 'EXPERIMENTS': '실험',
  'IN DEVELOPMENT': '개발 중', 'COMPLETED': '완료', 'PAUSED': '중단', 'COVER IMAGE PENDING': '커버 이미지 준비 중', 'Cover image pending': '커버 이미지 준비 중',
  'No projects in this category yet.': '이 분류에는 아직 프로젝트가 없습니다.', 'Show all projects': '전체 프로젝트 보기',
  'All projects': '전체 프로젝트', 'Image viewer': '이미지 보기', 'Project sections': '프로젝트 섹션', 'Project navigation': '프로젝트 이동',
  'PROJECT NOT FOUND.': '프로젝트를 찾을 수 없습니다.', 'The address is wrong or the project is not public.': '주소가 잘못되었거나 비공개 프로젝트입니다.',
  '← ALL PROJECTS': '← 전체 프로젝트', 'NEXT PROJECT →': '다음 프로젝트 →',
  'Overview': '개요', 'Specs': '사양', 'Timeline': '타임라인', 'Gallery': '갤러리', 'Build log': '빌드 로그', 'Documents': '문서',
  'Objectives': '목표', 'Design philosophy': '설계 철학', 'Engineering challenges': '엔지니어링 과제', 'Background': '배경', 'To be documented.': '작성 예정.',
  'PROJECT NO.': '프로젝트 번호', 'CATEGORY': '분류', 'STATUS': '상태', 'LAST UPDATED': '최근 업데이트',
  'CONFIRMED': '확정', 'PLANNED': '계획', 'IN PROGRESS': '진행 중',
  'decided and verified': '결정·확인됨', 'intended, may change': '예정, 변경 가능', 'not decided yet': '아직 미정',
  'Vehicle configuration': '차량 구성', 'Engine': '엔진', 'Drivetrain': '구동계', 'Chassis': '섀시', 'Suspension': '서스펜션',
  'Steering system': '조향 장치', 'Braking system': '제동 장치', 'Wheel specifications': '휠 사양', 'Development stage': '개발 단계',
  'In development': '개발 중', 'Concept': '컨셉', 'Design': '설계', 'Parts Sourcing': '부품 조달', 'Assembly': '조립', 'Validation': '검증',
  'PHOTO': '사진', 'COMPONENT PHOTO': '부품 사진', 'TECHNICAL DRAWING': '기술 도면', 'CONCEPT RENDER': '컨셉 렌더', 'VIDEO': '영상',
  'Watch on YouTube': 'YouTube 에서 보기', 'No photos, drawings or renders published yet.': '아직 공개된 사진, 도면, 렌더가 없습니다.',
  'No build log entries yet.': '아직 빌드 로그가 없습니다.', 'READ MORE →': '더 보기 →',
  'Core research and selected technical materials stay free. See the': '핵심 연구와 일부 기술 자료는 계속 무료로 공개됩니다. 바로가기:',
  'No documents published for this project yet.': '이 프로젝트의 공개 문서는 아직 없습니다.', 'Research report': '연구 보고서',

  // ---- 멤버십 ----
  'More than a membership. Build, learn, and grow with JEONG.': '멤버십 그 이상. JEONG 과 함께 만들고, 배우고, 성장하세요.',
  'Billing period': '결제 주기', 'MONTHLY': '월간', 'YEARLY': '연간', 'Plans': '요금제', 'FREE': '무료', 'Free forever': '계속 무료',
  'Monthly price to be announced': '월 요금은 추후 공개', 'Yearly price to be announced': '연 요금은 추후 공개',
  'Included': '포함 혜택', 'Proposed benefits': '예정 혜택 (미확정)', 'GET STARTED': '시작하기', 'JOIN WAITLIST': '대기자 등록',
  'Public research papers': '공개 연구 논문', 'Open engineering documentation': '공개 엔지니어링 문서', 'Selected 2D drawings': '일부 2D 도면',
  'Public development logs': '공개 개발 기록', 'Community access (planned)': '커뮤니티 이용 (예정)', 'Extended 3D CAD library': '확장 3D CAD 라이브러리',
  'Premium engineering tools': '프리미엄 엔지니어링 도구', 'Advanced software features': '고급 소프트웨어 기능',
  'Downloadable project resources': '다운로드 가능한 프로젝트 자료', 'Exclusive engineering updates': '전용 엔지니어링 소식', 'Future member benefits': '추가 예정 회원 혜택',
  'The waitlist is not open yet. This is a preview — nothing was submitted.': '대기자 등록은 아직 열리지 않았습니다. 미리보기 화면이며 아무것도 제출되지 않았습니다.',
  "Great engineering should be shared. Our core research and selected technical resources remain free. Membership helps us build better tools and expand what's possible.": '좋은 엔지니어링은 공유되어야 합니다. 핵심 연구와 일부 기술 자료는 계속 무료입니다. 멤버십은 더 나은 도구를 만들고 가능성을 넓히는 데 쓰입니다.',
  'What stays free?': '무엇이 계속 무료인가요?',
  'Public research papers, open engineering documentation, selected 2D drawings and public development logs stay free under Open Access.': '공개 연구 논문, 공개 엔지니어링 문서, 일부 2D 도면, 공개 개발 기록은 Open Access 로 계속 무료입니다.',
  'What is included in GARAGE+?': 'GARAGE+ 에는 무엇이 포함되나요?',
  'The proposed benefits are an extended 3D CAD library, premium engineering tools, advanced software features, downloadable project resources and exclusive engineering updates. This list is not final and may change before launch.': '예정된 혜택은 확장 3D CAD 라이브러리, 프리미엄 엔지니어링 도구, 고급 소프트웨어 기능, 다운로드 가능한 프로젝트 자료, 전용 엔지니어링 소식입니다. 확정된 목록이 아니며 출시 전에 바뀔 수 있습니다.',
  'When will membership launch?': '멤버십은 언제 시작하나요?',
  'There is no launch date yet. GARAGE+ is in early planning, and pricing has not been announced.': '아직 출시일은 정해지지 않았습니다. GARAGE+ 는 초기 기획 단계이며 요금도 공개되지 않았습니다.',
  'Can I change my plan later?': '나중에 요금제를 바꿀 수 있나요?',
  'Open Access needs no commitment. How plan changes will work for GARAGE+ will be confirmed before it launches.': 'Open Access 는 약정이 없습니다. GARAGE+ 의 요금제 변경 방식은 출시 전에 확정됩니다.',

  // ---- 관리자 ----
  'Dashboard': '대시보드', 'Upload': '업로드', 'Products': '상품', 'Content': '콘텐츠', 'Available in admin mode only.': '관리자 모드에서만 사용할 수 있습니다.',
  'Research and product overview': '연구자료 · 상품 현황', 'By field': '분야별', 'Recent documents': '최근 자료', 'Published': '공개', 'Draft': '비공개',
  'No documents': '자료 없음', '+ Upload research': '+ 연구자료 업로드', '+ Add product': '+ 상품 등록',
  'Manage research': '연구자료 관리', 'Manage products': '상품 관리', 'Manage content': '콘텐츠 관리',
  'List, publish, edit and delete research documents': '연구자료 목록 · 공개 전환 · 수정 · 삭제', 'Search documents': '자료 검색',
  'Search title, keywords, field...': '제목, 키워드, 분야 검색...', 'Title': '제목', 'Field': '분야', 'Type': '유형', 'Status': '상태', 'Actions': '작업',
  'Edit': '수정', 'Delete': '삭제', 'No documents match your search.': '검색 조건에 맞는 자료가 없습니다.',
  'Deleted': '삭제됨', 'Delete failed': '삭제 실패', 'Status change failed': '상태 변경 실패',
  '— Not saved: no server connected yet. Reloading restores the original.': '— 서버 연결 전이라 실제로 저장되지 않았습니다. 새로고침하면 원래대로 돌아옵니다.',
  'Register a new research document': '새 연구자료 등록', 'Edit Research': '연구자료 수정', 'Edit research document': '연구자료 수정',
  'Basics': '기본 정보', 'Title *': '제목 *', 'English title': '영문 제목', 'Field *': '분야 *', 'Document type *': '자료 유형 *',
  'e.g. Aerodynamics': '예: Aerodynamics', 'Author *': '작성자 *', 'Date *': '작성일 *', 'Slug (URL) *': 'slug (주소) *',
  'lowercase letters, numbers, hyphens': '영문 소문자, 숫자, 하이픈', 'comma separated': '쉼표로 구분', 'comma separated: CFD, Aerodynamics': '쉼표로 구분: CFD, Aerodynamics',
  'Related project': '관련 프로젝트', 'Visibility': '공개 상태', 'Draft (hidden)': '비공개 (draft)', 'Save changes': '수정 저장', 'Save': '저장',
  'This slug is already in use.': '이미 사용 중인 slug 입니다.', 'Saving…': '저장 중…', 'Save failed': '저장 실패',
  'Mock update complete': '모의 수정 완료', 'Mock upload complete': '모의 업로드 완료', 'Mock save complete': '모의 저장 완료',
  '— Not saved: no server connected yet. Data that would be sent:': '— 서버 연결 전이라 실제로 저장되지 않았습니다. 전송될 데이터:',
  'Uploaded': '업로드 완료', 'Saved': '저장 완료', 'Update complete': '수정 완료', '— Network error. Your input is kept; try again.': '— 네트워크 오류. 입력값은 그대로니 다시 시도하세요.',
  '— Network error. Try again.': '— 네트워크 오류. 다시 시도하세요.', 'Document not found': '자료를 찾을 수 없습니다',
  'List, edit and delete products': '상품 목록 · 수정 · 삭제', 'Search name, category...': '상품명, 카테고리 검색...',
  'Product': '상품', 'Category': '카테고리', 'Price': '가격', 'No products match your search.': '검색 조건에 맞는 상품이 없습니다.',
  'Register a new product': '새 상품 등록', 'Edit Product': '상품 수정', 'Edit product': '상품 수정', 'Product not found': '상품을 찾을 수 없습니다',
  'Product name *': '상품명 *', 'One-line summary *': '한 줄 소개 *', 'Description': '설명', 'JEONG part number (SKU) *': 'JEONG 부품 번호 (SKU) *',
  'System (category) *': '시스템 (카테고리) *', 'Product type *': '상품 종류 *', "leave empty for 'PRICE TBA'": "비우면 '가격 미정'", 'Currency': '통화',
  'Preview item (not real inventory)': '미리보기 상품 (실제 재고 아님)', 'Feature on the store home': '스토어 홈에 추천으로 노출',
  'Source': '출처', 'Manufacturer': '제조사', 'Seller': '판매자', 'Source type': '출처 유형', 'Not decided': '미정',
  'Affiliate relationship (always disclosed on the product page)': '제휴 관계 (상품 페이지에 항상 공개됨)', 'Verification status': '검증 상태',
  'Choose a status other than NOT YET VERIFIED only when a real record exists. Evidence is then required.': '실제 기록이 있을 때만 "검증 전" 이외의 상태를 고르세요. 그 경우 근거 입력이 필수입니다.',
  'Evidence (what was tested or reviewed, and where the record is)': '근거 (무엇을 시험·검토했는지, 기록이 어디 있는지)',
  'Images & video': '이미지 · 영상', 'Product images (first is the cover)': '상품 이미지 (첫 장이 대표)', 'Photos in use': '실제 사용 사진', 'YouTube video URL': 'YouTube 영상 주소',
  'Technical specifications': '기술 사양', 'Leave a value empty when unknown — the page shows NOT PROVIDED / TBD. Do not guess.': '모르는 값은 비워 두세요 — 화면에 "정보 없음 / 미정"으로 표시됩니다. 추정해서 넣지 마세요.',
  '+ Add spec': '+ 사양 추가', 'Compatibility requirements (one per line)': '호환 조건 (한 줄에 하나)', 'Engineering notes (one per line)': '엔지니어링 노트 (한 줄에 하나)',
  'Measurements — measured by JEONG': '측정 — JEONG 실측', 'Manufacturer claims — not verified by JEONG': '제조사 주장 — JEONG 미검증',
  'Testing notes — tested by JEONG': '테스트 기록 — JEONG 시험', 'Compatibility & documentation': '호환성 · 문서',
  'Confirmed project compatibility — one per line: project-slug | evidence': '확인된 프로젝트 호환 — 한 줄에 하나: 프로젝트-slug | 근거',
  'Documentation — one per line: label | kind (manual, drawing, cad, report, install) | url': '문서 — 한 줄에 하나: 이름 | 종류 (manual, drawing, cad, report, install) | 주소',
  'Related research slugs': '관련 연구자료 slug', 'Related product slugs': '관련 상품 slug', 'Measured by JEONG': 'JEONG 실측',
  'Group (e.g. Dimensions)': '묶음 (예: Dimensions)', 'Spec group': '사양 묶음', 'Item (e.g. Weight)': '항목 (예: Weight)', 'Spec item': '사양 항목',
  'Value (e.g. 1.2 kg)': '값 (예: 1.2 kg)', 'Spec value': '사양 값', 'Remove spec row': '사양 행 삭제',
  'Only YouTube URLs are allowed.': 'YouTube 주소만 입력할 수 있습니다.', 'This part number is already in use.': '이미 사용 중인 부품 번호입니다.',
  'A verification status needs evidence: what was tested or reviewed, and where the record is.': '검증 상태를 표시하려면 근거가 필요합니다: 무엇을 시험·검토했는지, 기록이 어디 있는지.',
  'A preview item cannot be marked Available.': '미리보기 상품은 "판매 중"으로 표시할 수 없습니다.',
  'Each line needs "project-slug | evidence".': '각 줄은 "프로젝트-slug | 근거" 형식이어야 합니다.', 'Each line needs "label | kind | url".': '각 줄은 "이름 | 종류 | 주소" 형식이어야 합니다.',
  'Home page copy': '홈 화면 문구', 'Home hero': '홈 · 대표 화면', 'Slogan': '슬로건', 'Button label': '버튼 문구', 'Footer copyright': '하단 저작권 문구', 'Preview': '미리보기',
  '— Not applied to the home page: no server connected yet. Data that would be sent:': '— 서버 연결 전이라 홈 화면에 반영되지 않습니다. 전송될 데이터:',
};

// 숫자·이름이 들어가는 문구. 위 사전에 없을 때만 순서대로 검사
const KO_PATTERNS = [
  [/^Results: (\d+)$/, '검색 결과 $1건'],
  [/^Documents: (\d+)$/, '자료 $1건'],
  [/^Products: (\d+)$/, '상품 $1개'],
  [/^(\d+) items?$/, '상품 $1개'],
  [/^(\d+) items? · preview items are not for sale$/, '상품 $1개 · 미리보기 상품은 판매하지 않습니다'],
  [/^EXPLORE (.+)$/, '$1 살펴보기'],
  [/^LAST UPDATED (.+)$/, '최근 업데이트 $1'],
  [/^(COMPLETED|IN PROGRESS|PLANNED) · (.+)$/, (m, s, d) => `${KO[s]} · ${d}`],
  [/^Profile \((.+)\)$/, '프로필 ($1)'],
  [/^Image (\d+)$/, '이미지 $1'],
  [/^Toggle visibility \(now (Published|Draft)\)$/, (m, s) => `공개 상태 전환 (현재 ${KO[s]})`],
  [/^"(.+)" → (Published|Draft)$/, (m, n, s) => `"${n}" → ${KO[s]}`],
  [/^Delete "(.+)"\?$/, '"$1" 을(를) 삭제할까요?'],
  [/^— (.+)\. Starting a new document\.$/, '— $1. 새 자료로 작성합니다.'],
  [/^— (.+)\. Starting a new product\.$/, '— $1. 새 상품으로 작성합니다.'],
  [/^Existing attachments: (.+) \(new files are added\)$/, '기존 첨부: $1 (새 파일은 추가됨)'],
  [/^(\d+) existing image\(s\) kept \(new files are added\)$/, '기존 이미지 $1장 유지 (새 파일은 추가됨)'],
];

// 문구 하나 번역. 사전에 없으면 원문 그대로 (데이터·고유명사는 자연히 영어로 남음)
function t(text) {
  if (LANG !== 'ko' || !text) return text;
  const key = text.trim().replace(/\s+/g, ' ');
  if (!key) return text;
  let out = KO[key];
  if (out == null) {
    const hit = KO_PATTERNS.find(([re]) => re.test(key));
    if (hit) out = key.replace(hit[0], hit[1]);
  }
  return out == null ? text : text.replace(/^(\s*)[\s\S]*?(\s*)$/, (m, a, b) => a + out + b);
}

// 화면 번역: 글자와 placeholder·aria-label·title·alt. 코드·입력값·데이터 목록은 건드리지 않음
const I18N_ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
const I18N_SKIP = 'script, style, pre, code, textarea, datalist, .lang-flags';
function translateNode(node) {
  if (node.nodeType === 3) {
    if (node.parentElement?.closest(I18N_SKIP)) return;
    const v = t(node.nodeValue);
    if (v !== node.nodeValue) node.nodeValue = v;
    return;
  }
  if (node.nodeType !== 1 || node.closest(I18N_SKIP)) return;
  for (const el of [node, ...node.querySelectorAll('*')]) {
    if (el.matches(I18N_SKIP)) continue;
    for (const a of I18N_ATTRS) {
      const v = el.getAttribute(a);
      if (v && t(v) !== v) el.setAttribute(a, t(v));
    }
  }
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) translateNode(n);
}

if (LANG === 'ko') {
  translateNode(document.body);
  // 스크립트가 나중에 그리는 내용(목록, 알림, 팝업)도 번역
  new MutationObserver(muts => {
    for (const m of muts) {
      if (m.type === 'childList') m.addedNodes.forEach(translateNode);
      else if (m.type === 'characterData') translateNode(m.target);
      else if (m.target.nodeType === 1 && !m.target.closest(I18N_SKIP)) {
        const v = m.target.getAttribute(m.attributeName);
        if (v && t(v) !== v) m.target.setAttribute(m.attributeName, t(v));
      }
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: I18N_ATTRS });
}

// ---- 국기 버튼 (프로필 왼쪽) ----
// 이모지 국기는 Windows 에서 글자(US/KR)로 보여서 SVG 로 그림
{
  const us = `<svg viewBox="0 0 28 20" aria-hidden="true"><rect width="28" height="20" fill="#fff"/>${[0, 2, 4, 6, 8, 10, 12].map(i => `<rect y="${(i * 20 / 13).toFixed(2)}" width="28" height="1.54" fill="#B22234"/>`).join('')}<rect width="12" height="10.77" fill="#3C3B6E"/>${[2, 6, 10].flatMap(x => [2.2, 5.4, 8.6].map(y => `<circle cx="${x}" cy="${y}" r=".8" fill="#fff"/>`)).join('')}</svg>`;
  // 괘: 1 = 이어진 막대, 0 = 끊어진 막대 (건 111, 감 010, 리 101, 곤 000)
  const gwae = (cx, cy, deg, bars) => `<g transform="rotate(${deg} ${cx} ${cy})" fill="#000">${bars.map((solid, i) => {
    const y = cy - 1.9 + i * 1.5;
    return solid ? `<rect x="${cx - 2.5}" y="${y}" width="5" height=".9"/>` : `<rect x="${cx - 2.5}" y="${y}" width="2.2" height=".9"/><rect x="${cx + .3}" y="${y}" width="2.2" height=".9"/>`;
  }).join('')}</g>`;
  const kr = `<svg viewBox="0 0 28 20" aria-hidden="true"><rect width="28" height="20" fill="#fff"/><g transform="rotate(33.7 14 10)"><circle cx="14" cy="10" r="5" fill="#CD2E3A"/><path d="M9 10a5 5 0 0 0 10 0a2.5 2.5 0 0 0-5 0a2.5 2.5 0 0 1-5 0z" fill="#0047A0"/></g>${gwae(5.5, 4.4, -56.3, [1, 1, 1])}${gwae(22.5, 4.4, 56.3, [0, 1, 0])}${gwae(5.5, 15.6, 56.3, [1, 0, 1])}${gwae(22.5, 15.6, -56.3, [0, 0, 0])}</svg>`;

  document.querySelector('.profile-btn').insertAdjacentHTML('beforebegin', `
    <div class="lang-flags" role="group" aria-label="Language">
      <button type="button" class="flag" data-lang="en" aria-pressed="${LANG === 'en'}" aria-label="English" title="English">${us}</button>
      <button type="button" class="flag" data-lang="ko" aria-pressed="${LANG === 'ko'}" aria-label="한국어" title="한국어">${kr}</button>
    </div>`);
  document.querySelector('.lang-flags').addEventListener('click', e => {
    const btn = e.target.closest('.flag');
    if (!btn) return;
    // 좁은 화면에서는 현재 언어 국기만 보임 -> 그 국기를 누르면 다른 언어로 전환
    const other = LANG === 'ko' ? 'en' : 'ko';
    const otherHidden = !document.querySelector(`.flag[data-lang="${other}"]`).offsetParent;
    const lang = btn.dataset.lang === LANG ? (otherHidden ? other : null) : btn.dataset.lang;
    if (!lang) return;
    try { localStorage.setItem('lang', lang); } catch {}
    location.reload(); // 새로 읽어서 전체 문구를 다시 그림
  });
}
