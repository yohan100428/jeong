// =====================================================================
// 연구자료 업로드 API — 현재: 프론트엔드 모의 구현 (아무것도 저장 안 함)
//
// 서버 연결 시 이 파일의 upload() 본문만 교체. upload.js / upload.html 은 수정 불필요.
//
// 서버 쪽에서 할 일:
//   - POST /api/research  (multipart/form-data: meta(JSON) + body(.md) + attachments[])
//   - 관리자 권한 검증 (프론트의 adminMode 는 화면용이라 신뢰하면 안 됨)
//   - 파일 형식·크기 검사, slug 중복 검사
//   - 저장 후 연구자료 목록(documents)에 반영 — DB 또는 저장소 커밋
//
// 반환 형식 (서버도 동일하게 맞출 것):
//   성공: { ok: true, slug }      실패: { ok: false, error: '사용자에게 보여줄 메시지' }
// =====================================================================

const researchApi = {
  async upload(meta, body, files) {
    // TODO(server): 아래 모의 코드 삭제 후 교체
    // const fd = new FormData();
    // fd.append('meta', JSON.stringify(meta));
    // fd.append('body', new Blob([body], { type: 'text/markdown' }), `${meta.slug}.md`);
    // files.forEach(f => fd.append('attachments', f));
    // const r = await fetch('/api/research', { method: 'POST', body: fd, credentials: 'include' });
    // return r.json();

    await new Promise(r => setTimeout(r, 600)); // 네트워크 지연 흉내
    console.info('[mock upload]', meta, `${body.length} chars`, files.map(f => f.name));
    return { ok: true, slug: meta.slug, mock: true };
  },
};
