# JEONG 공식 사이트

정적 사이트 (HTML/CSS/JS, 빌드 없음). `index.html` 더블클릭으로 바로 확인.

## 언어 · 글꼴
- 영어 / 한국어 전환: 헤더의 국기 버튼. 기본값은 브라우저 언어(한국어면 한국어), 선택은 브라우저에 저장
- 번역은 `js/i18n.js` 사전 한 곳에서 관리 (`'영어 원문': '번역'`). HTML·JS 코드는 영어로 작성하고, 한국어일 때 화면 문구만 바꿔 끼움
  - 번역 대상: 메뉴·버튼·입력 항목·필터·상태·안내 문구. 고유명사, 큰 제목 슬로건, 상품·프로젝트·연구자료 데이터는 영어 유지
  - 새 문구를 추가했는데 한국어로 안 바뀌면 사전에 한 줄 추가
- 글꼴 2종 (둘 다 한글·영문 지원): 제목·버튼은 Black Han Sans, 설명·라벨은 Gmarket Sans. `fonts/*.woff2` (원본 ttf 는 `fonts/original/`, 저장소 제외). 설정은 `css/style.css` 맨 위

## 구조
- `index.html` 메인 (상단 메뉴: 햄버거 · 로고 · 언어 · 프로필)
- `css/style.css` 공용 스타일 · `js/main.js` 메뉴/로그인 팝업 · `js/i18n.js` 언어 전환
- `research/` 연구자료실 (Research Library)
  - `documents.js` **자료 데이터** — 새 자료는 여기에 객체 하나 추가
  - `content/<slug>.md` 본문 (Markdown, `$수식$` LaTeX 지원)
  - `files/` 첨부파일 (PDF, CAD, 데이터)
  - `index.html` 연구자료실 (Hero · 아카이브 검색/탭/정렬/목록·격자 · Open Engineering · 관련 프로젝트) · `doc.html?slug=...` 상세
  - `lab.css` 는 index.html 전용, `research.css` 는 상세·관리자 등이 함께 쓰는 공용 스타일

- `shop/` 부품 스토어 (Parts Store) — **미리보기 단계: 결제·주문·재고 없음, 구매 버튼 비활성**
  - `products.js` **상품 데이터 + 카테고리(8개 시스템)** — 새 상품은 객체 하나 추가. 검증·호환·제휴 표시 규칙은 파일 상단 주석
  - `index.html` 스토어 홈 · `catalog.html` 카탈로그(사이드 필터·정렬·검색) · `item.html?slug=...` 상세 · 이미지는 `shop/images/<slug>/`
  - 현재 상품은 CVT Drive Kit 1개 (DRIVETRAIN, PREVIEW: 가격 없음 · NOT YET VERIFIED)
- `projects/` 프로젝트 페이지
  - `projects.js` **프로젝트 데이터** — 새 프로젝트는 여기에 객체 하나 추가 (사양·단계·갤러리 규칙은 파일 상단 주석)
  - `index.html` 목록/필터 · `project.html?slug=...` 상세 (공용 템플릿) · 이미지는 `projects/images/<slug>/`
  - 사양은 전부 TBD, 갤러리·빌드 로그는 비어 있음 (실제 내용이 생기면 데이터만 채우면 됨)
- `membership/` 멤버십(구독) 페이지 — **UI 프로토타입, 결제·가입 처리 없음**
  - `membership.js` 맨 위 `PLANS` 가 요금제 데이터 (가격·혜택·버튼). 결제 연결 지점은 파일 상단 주석
  - 진입: 햄버거 메뉴 Membership, 프로필 팝업의 Membership

## 로컬 확인
본문(.md) 불러오기는 웹 서버가 필요:
```
python -m http.server 8000
```
브라우저에서 http://localhost:8000

## 연구자료 공개 규칙
- `status: 'draft'` = 로컬에서만 보임 (공개 사이트에서는 주소 끝에 `?draft=1` 붙이면 확인 가능)
- `status: 'published'` = 공개
- 현재 3개 자료는 화면 검증용 DEMO 샘플

## 로그인 (임시)
- 프로필 버튼 → 팝업 → 로그인 → `login.html` → 아무 값 입력 → 원래 보던 페이지로 복귀
- 비밀번호 검사 없음, 이름만 브라우저에 저장. 실제 인증 붙일 때 `js/main.js` 의 `auth` 교체

## 테스트
```
node research/documents.test.js
node shop/products.test.js
node projects/projects.test.js
```
