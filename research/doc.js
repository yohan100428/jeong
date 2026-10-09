// 연구자료 상세: doc.html?slug=<slug>
const doc = DOCS.find(d => d.slug === new URLSearchParams(location.search).get('slug'));
const root = document.getElementById('doc');

// 목록에서 왔으면 history.back() 으로 검색 조건 유지
document.querySelector('.back').addEventListener('click', e => {
  if (document.referrer.includes('/research/')) { e.preventDefault(); history.back(); }
});

// Markdown + LaTeX($..$, $$..$$) 렌더. 수식은 marked 가 _ 등을 망가뜨리지 않게 먼저 빼둠.
// ponytail: 코드블록 안의 $ 도 수식으로 잡힘, 문제되면 코드블록 먼저 보호
function renderMarkdown(md) {
  const math = [];
  md = md.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, (_, block, inline) => {
    math.push([block ?? inline, block != null]);
    return `@@MATH${math.length - 1}@@`;
  });
  return marked.parse(md).replace(/@@MATH(\d+)@@/g, (_, i) =>
    katex.renderToString(math[i][0], { displayMode: math[i][1], throwOnError: false }));
}

function render() {
  if (!doc) {
    root.innerHTML = '<h1 class="doc-title">자료를 찾을 수 없습니다.</h1><p class="sub">주소가 잘못되었거나 비공개 자료입니다.</p>';
    return;
  }
  document.title = `${doc.title} | JEONG MOTORS Research`;
  document.querySelector('meta[name=description]').content = doc.abstract || doc.title;

  const row = (k, v) => v ? `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>` : '';
  const project = doc.projectId && (PROJECT_PAGES[doc.projectId]
    ? `<a href="${esc(PROJECT_PAGES[doc.projectId])}">${esc(doc.projectId)}</a>`
    : esc(doc.projectId));

  root.innerHTML = `
    <p class="meta">${esc(doc.category)} · ${esc(doc.documentType)}${doc.status === 'draft' ? ' <span class="badge">DEMO · 화면 검증용 샘플</span>' : ''}</p>
    <h1 class="doc-title">${esc(doc.title)}</h1>
    ${doc.titleEn ? `<p class="sub">${esc(doc.titleEn)}</p>` : ''}
    <dl class="info">
      ${row('작성자', doc.author.join(', '))}
      ${row('작성일', doc.createdAt)}
      ${row('최종 수정일', doc.updatedAt)}
      ${row('버전', doc.version && `v${doc.version}`)}
    </dl>
    ${doc.abstract ? `<section class="block"><h2>Abstract</h2><p>${esc(doc.abstract)}</p></section>` : ''}
    ${doc.keywords.length ? `<section class="block"><h2>Keywords</h2><ul class="tags">${doc.keywords.map(k => `<li>${esc(k)}</li>`).join('')}</ul></section>` : ''}
    ${doc.contentPath ? '<article class="prose block" id="body"><p class="sub">본문 불러오는 중…</p></article>' : ''}
    ${doc.attachments?.length ? `<section class="block"><h2>Attachments</h2><ul class="files">${doc.attachments.map(a =>
      `<li><a href="${esc(a.url)}" download>${esc(a.name)} <span>${esc(a.type)}</span></a></li>`).join('')}</ul></section>` : ''}
    ${project ? `<section class="block"><h2>Related Project</h2><p>${project}</p></section>` : ''}`;

  if (doc.contentPath) {
    const body = document.getElementById('body');
    // file:// 에서는 fetch 가 막힘. 로컬 확인은 python -m http.server 로.
    fetch(doc.contentPath)
      .then(r => { if (!r.ok) throw r.status; return r.text(); })
      .then(md => { body.innerHTML = renderMarkdown(md); })
      .catch(() => { body.innerHTML = '<p class="sub">본문을 불러오지 못했습니다. (로컬 파일로 열었다면 웹 서버로 실행하세요)</p>'; });
  }
}
render();
