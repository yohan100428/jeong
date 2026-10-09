# JEONG 공식 사이트

정적 사이트 (HTML/CSS/JS, 빌드 없음). `index.html` 더블클릭으로 바로 확인.

## 구조
- `index.html` 메인 (상단 메뉴: 햄버거 · 로고 · 언어 · 프로필)
- `css/style.css` 공용 스타일 · `js/main.js` 메뉴/언어 전환
- `research/` 연구자료실 (Research Library)
  - `documents.js` **자료 데이터** — 새 자료는 여기에 객체 하나 추가
  - `content/<slug>.md` 본문 (Markdown, `$수식$` LaTeX 지원)
  - `files/` 첨부파일 (PDF, CAD, 데이터)
  - `index.html` 목록/검색 · `doc.html?slug=...` 상세

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

## 개발용 관리자 모드
- 로컬(file://, localhost)에서만 언어 선택 왼쪽에 `Admin` 스위치가 나타남. 공개 사이트에는 안 보임
- ON: 프로필 옆 Administrator 표시 + 햄버거 메뉴에 관리자 메뉴(현재 Coming Soon)
- 실제 권한 없음 (화면 개발용 모의 상태). 코드: `js/main.js` 의 `adminMode`

## 테스트
```
node research/documents.test.js
```
