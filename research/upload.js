// Upload Research 화면 (UI 전용). 실제 저장은 upload-api.js 의 researchApi.upload() 담당.
// 입력값 -> documents.js 의 자료 형식(ResearchDocument)으로 변환해 넘김.
const form = document.getElementById('upload-form');
const gate = document.getElementById('gate');
const result = document.getElementById('result');
const f = form.elements;

// 관리자 모드일 때만 폼 표시.
// ponytail: 화면을 가리는 것뿐, 진짜 권한 검사는 서버에서 해야 함
const applyGate = () => {
  const on = !!window.adminMode?.isAdmin;
  form.hidden = !on;
  gate.hidden = on;
};
addEventListener('adminchange', applyGate);
applyGate();

f.category.innerHTML = RESEARCH_CATEGORIES.map(c => `<option>${esc(c)}</option>`).join('');
f.createdAt.value = new Date().toLocaleDateString('sv-SE'); // 오늘 (YYYY-MM-DD)

// slug: 직접 고치기 전까지 영문 제목(없으면 제목)에서 자동 생성. 한글만 있으면 비어서 직접 입력 필요
const toSlug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
let slugEdited = false;
form.addEventListener('input', e => {
  if (e.target === f.slug) { slugEdited = true; f.slug.setCustomValidity(''); }
  if (!slugEdited && (e.target === f.title || e.target === f.titleEn)) f.slug.value = toSlug(f.titleEn.value || f.title.value);
});

const list = s => s.split(',').map(x => x.trim()).filter(Boolean);
const ext = name => (name.split('.').pop() || '').toUpperCase();

function showResult(kind, title, msg, detail = '') {
  result.hidden = false;
  result.className = `notice ${kind}`;
  result.querySelector('strong').textContent = title;
  result.querySelector('span').textContent = msg;
  result.querySelector('pre').textContent = detail;
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const slug = f.slug.value;
  if (RESEARCH_DOCS.some(d => d.slug === slug)) {
    f.slug.setCustomValidity('이미 사용 중인 slug입니다.');
    f.slug.reportValidity();
    return;
  }
  const files = [...f.attachments.files];
  const body = f.body.value.trim();
  const meta = {
    id: slug,
    slug,
    title: f.title.value.trim(),
    titleEn: f.titleEn.value.trim() || undefined,
    author: list(f.author.value),
    category: f.category.value,
    documentType: f.documentType.value.trim(),
    createdAt: f.createdAt.value,
    abstract: f.abstract.value.trim() || undefined,
    keywords: list(f.keywords.value),
    projectId: f.projectId.value.trim() || undefined,
    version: f.version.value.trim() || undefined,
    status: f.status.value,
    contentPath: body ? `content/${slug}.md` : undefined,
    attachments: files.length ? files.map(x => ({ name: x.name, url: `files/${x.name}`, type: ext(x.name) })) : undefined,
  };

  const btn = form.querySelector('[type=submit]');
  btn.disabled = true;
  btn.textContent = '업로드 중…';
  try {
    const r = await researchApi.upload(meta, body, files);
    if (!r.ok) showResult('err', '업로드 실패', ` — ${r.error}`);
    else if (r.mock) showResult('ok', '모의 업로드 완료', ' — 서버 연결 전이라 실제로 저장되지 않았습니다. 전송될 데이터:', JSON.stringify(meta, null, 2));
    else { showResult('ok', '업로드 완료', ''); form.reset(); }
  } catch {
    showResult('err', '업로드 실패', ' — 네트워크 오류. 입력값은 그대로니 다시 시도하세요.');
  } finally {
    btn.disabled = false;
    btn.textContent = '업로드';
  }
});
