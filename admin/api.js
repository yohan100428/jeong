// =====================================================================
// 관리자 API — 현재: 프론트엔드 모의 구현 (아무것도 저장 안 함)
//
// 서버 연결 시 이 파일의 함수 본문만 교체. admin.js / *.html 은 수정 불필요.
// 모든 함수는 Promise 를 반환하고, 쓰기 함수는 아래 형식을 지킬 것:
//   성공: { ok: true, ... }      실패: { ok: false, error: '사용자에게 보여줄 메시지' }
//   (mock: true 는 모의 응답 표시용. 서버 응답에는 넣지 말 것)
//
// 서버 쪽 공통 할 일:
//   - 모든 쓰기 요청에서 관리자 권한 검증 (프론트의 adminMode 는 화면용이라 신뢰 금지)
//   - 업로드 파일 형식·크기 검사, slug 중복 검사
//   - 저장 결과를 공개 페이지(research/documents.js 또는 DB)에 반영
// =====================================================================

const mockDelay = () => new Promise(r => setTimeout(r, 400)); // 네트워크 지연 흉내
const mockOk = (what, extra = {}) => {
  console.info(`[mock] ${what}`, extra);
  return { ok: true, mock: true, ...extra };
};

const researchApi = {
  // 서버: GET /api/research  (관리자용: draft 포함 전체)
  async list() {
    return structuredClone(RESEARCH_DOCS);
  },

  // 서버: POST /api/research  (multipart/form-data: meta(JSON) + attachments[])
  // const fd = new FormData(); fd.append('meta', JSON.stringify(meta)); files.forEach(f => fd.append('attachments', f));
  // return (await fetch('/api/research', { method: 'POST', body: fd, credentials: 'include' })).json();
  async upload(meta, files) {
    await mockDelay();
    return mockOk('upload', { slug: meta.slug, meta, files: files.map(f => f.name) });
  },

  // 서버: PUT /api/research/:slug  (multipart, upload 와 같은 형식)
  async update(slug, meta, files) {
    await mockDelay();
    return mockOk('update', { slug, meta, files: files.map(f => f.name) });
  },

  // 서버: PATCH /api/research/:slug  body { status: 'draft' | 'published' }
  async setStatus(slug, status) {
    await mockDelay();
    return mockOk('setStatus', { slug, status });
  },

  // 서버: DELETE /api/research/:slug  (첨부파일도 함께 삭제)
  async remove(slug) {
    await mockDelay();
    return mockOk('remove', { slug });
  },
};

const contentApi = {
  // 서버: GET /api/content  — 현재 홈 화면 문구를 그대로 반환 (서버 연결 시 index.html 도 이 값을 읽도록 변경)
  async get() {
    return {
      heroSlogan: '브랜드 슬로건을 여기에 입력하세요.',
      heroSloganEn: 'Enter your brand slogan here.',
      heroButton: '연구자료 보기',
      heroButtonEn: 'Research Library',
      footer: '© 2026 JEONG MOTORS. All rights reserved.',
    };
  },

  // 서버: PUT /api/content  body: get() 과 같은 형식
  async save(data) {
    await mockDelay();
    return mockOk('content save', { data });
  },
};
