// 연구자료 상세: doc.html?slug=<slug> 또는 전용 페이지 <slug>.html (doc.html 복사본, 주소에서 slug 를 읽음)
const slug = new URLSearchParams(location.search).get('slug') || location.pathname.split('/').pop().replace(/\.html$/, '');
const doc = DOCS.find(d => d.slug === slug);
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

// PDF 읽기: 모든 쪽을 캔버스로 그림 (PDF.js). 브라우저 내장 뷰어는 모바일에서 안 뜨는 경우가 많아 사용하지 않음.
// 실패하면 원본 PDF 링크만 안내. 원본 파일은 수정 없이 그대로 제공.
// ponytail: 모든 쪽을 한 번에 그림. 수십 쪽 넘는 문서가 생기면 보이는 쪽만 그리도록 교체
const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/';
function loadPdf(url, box, count) {
  const fail = () => { box.innerHTML = `<p class="sub">The online reader could not be loaded in this browser.</p><p><a href="${esc(url)}" target="_blank" rel="noopener">Open the PDF directly</a></p>`; };
  const s = document.createElement('script');
  s.src = PDFJS + 'build/pdf.min.js';
  s.onerror = fail;
  s.onload = async () => {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'build/pdf.worker.min.js';
      const pdf = await pdfjsLib.getDocument({ url, cMapUrl: PDFJS + 'cmaps/', cMapPacked: true, standardFontDataUrl: PDFJS + 'standard_fonts/' }).promise;
      box.innerHTML = '';
      count.textContent = `Pages: ${pdf.numPages}`;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const vp = page.getViewport({ scale: 1400 / page.getViewport({ scale: 1 }).width }); // 가로 1400px 로 그려 확대해도 선명하게
        const c = document.createElement('canvas');
        c.width = vp.width; c.height = vp.height;
        c.setAttribute('role', 'img'); c.setAttribute('aria-label', `Page ${i}`);
        box.append(c);
        await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
      }
    } catch { fail(); }
  };
  document.head.append(s);
}

function render() {
  if (!doc) {
    root.innerHTML = '<h1 class="doc-title">Document not found.</h1><p class="sub">The address is wrong or the document is not public.</p>';
    return;
  }
  document.title = `${doc.title} | JEONG MOTORS Research`;
  document.querySelector('meta[name=description]').content = doc.abstract || doc.title;

  const pdf = doc.editions?.[0];
  const row = (k, v) => v ? `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>` : '';
  const project = doc.projectId && (PROJECT_PAGES[doc.projectId]
    ? `<a href="${esc(PROJECT_PAGES[doc.projectId])}">${esc(doc.projectId)}</a>`
    : esc(doc.projectId));

  root.innerHTML = `
    <p class="meta">${esc(doc.category)} · ${esc(doc.documentType)}${doc.status === 'draft' ? ' <span class="badge">DEMO · UI sample</span>' : ''}</p>
    <h1 class="doc-title">${esc(doc.title)}</h1>
    ${doc.titleOriginal ? `<p class="sub" lang="ko">${esc(doc.titleOriginal)}</p>` : ''}
    ${doc.titleEn ? `<p class="sub">${esc(doc.titleEn)}</p>` : ''}
    <dl class="info">
      ${row('Document ID', doc.id.toUpperCase())}
      ${row('Author', doc.author.join(', '))}
      ${row(doc.createdAt.length === 4 ? 'Year' : 'Date', doc.createdAt)}
      ${row('Language', pdf && doc.editions.map(e => `${e.name} / ${e.lang}`).join(', '))}
      ${row('Access', pdf && (doc.access === 'garage' ? 'GARAGE+' : 'Open Access'))}
      ${row('Updated', doc.updatedAt)}
      ${row('Version', doc.version && `v${doc.version}`)}
    </dl>
    ${doc.abstract ? `<section class="block"><h2>Abstract</h2><p>${esc(doc.abstract)}</p></section>` : ''}
    ${doc.keywords.length ? `<section class="block"><h2>Keywords</h2><ul class="tags">${doc.keywords.map(k => `<li>${esc(k)}</li>`).join('')}</ul></section>` : ''}
    ${pdf ? `<section class="block" id="reader"><h2>Read Paper</h2>
      <p class="pdf-bar">
        <a class="pdf-btn fill" href="${esc(pdf.url)}" download="${esc(pdf.url)}">DOWNLOAD PDF</a>
        <a class="pdf-btn" href="${esc(pdf.url)}" target="_blank" rel="noopener">OPEN ORIGINAL PDF</a>
        <button type="button" class="pdf-btn" data-zoom="-1" aria-label="Zoom out">−</button>
        <button type="button" class="pdf-btn" data-zoom="1" aria-label="Zoom in">+</button>
        <span id="pdf-count"></span>
      </p>
      <div class="pdf-view" id="pdf"><p class="sub">Loading…</p></div>
      <p class="sub">${esc(pdf.url)} · ${esc(pdf.name)} (${esc(pdf.lang)})${doc.editions.length === 1 ? ' · No other language edition is available.' : ''}</p>
    </section>` : ''}
    ${doc.contentPath ? '<article class="prose block" id="body"><p class="sub">Loading…</p></article>' : ''}
    ${doc.attachments?.length ? `<section class="block"><h2>Attachments</h2><ul class="files">${doc.attachments.map(a =>
      `<li><a href="${esc(a.url)}" download>${esc(a.name)} <span>${esc(a.type)}</span></a></li>`).join('')}</ul></section>` : ''}
    ${project ? `<section class="block"><h2>Related Project</h2><p>${project}</p></section>` : ''}`;

  if (pdf) {
    const box = document.getElementById('pdf');
    loadPdf(pdf.url, box, document.getElementById('pdf-count'));
    // 확대·축소: 캔버스 표시 폭만 바꿈 (100% ~ 250%), 넘치면 가로 스크롤
    let zoom = 1;
    root.querySelector('.pdf-bar').addEventListener('click', e => {
      const b = e.target.closest('[data-zoom]');
      if (!b) return;
      zoom = Math.min(2.5, Math.max(1, zoom + b.dataset.zoom * .5));
      box.style.setProperty('--zoom', zoom);
    });
  }

  if (doc.contentPath) {
    const body = document.getElementById('body');
    // file:// 에서는 fetch 가 막힘. 로컬 확인은 python -m http.server 로.
    fetch(doc.contentPath)
      .then(r => { if (!r.ok) throw r.status; return r.text(); })
      .then(md => { body.innerHTML = renderMarkdown(md); })
      .catch(() => { body.innerHTML = '<p class="sub">Could not load the content. (If opened as a local file, run a web server.)</p>'; });
  }
}
render();
