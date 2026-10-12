// 실행: node research/documents.test.js
const assert = require('assert');
const { RESEARCH_DOCS: d, researchMatches: m, esc } = require('./documents.js');
const hits = (q, c) => d.filter(x => m(x, q, c)).map(x => x.id);
assert.deepStrictEqual(hits('', 'All'), ['JM-RP-0001', 'demo-001', 'demo-002', 'demo-003']);
assert.deepStrictEqual(hits('cfd'), ['JM-RP-0001', 'demo-001']); // 영문 대소문자 무시
assert.deepStrictEqual(hits('rear wing cfd variable'), ['JM-RP-0001']);
assert.deepStrictEqual(hits('리어윙의 공기역학적'), ['JM-RP-0001']);   // 원문(한국어) 제목
assert.deepStrictEqual(hits('jm-rp-0001'), ['JM-RP-0001']);            // 문서 번호
assert.deepStrictEqual(hits('', 'Aerodynamics'), ['JM-RP-0001', 'demo-001']);
// 등록된 PDF·전용 페이지 파일이 실제로 있어야 함
const fs = require('fs'), path = require('path');
for (const x of d) for (const f of [x.page, ...(x.editions || []).map(e => e.url)].filter(Boolean))
  assert.ok(fs.existsSync(path.join(__dirname, f)), `${x.id}: missing ${f}`);
assert.deepStrictEqual(hits('geometry'), ['JM-RP-0001', 'demo-002']); // 초록 · 제목
assert.deepStrictEqual(hits('k-01'), ['demo-002', 'demo-003']);
assert.deepStrictEqual(hits('k-01 cvt'), ['demo-003']);       // 여러 단어 = AND
assert.deepStrictEqual(hits('', 'Powertrain'), ['demo-003']);      // 카테고리
assert.deepStrictEqual(hits('steering', 'Powertrain'), []);        // 검색 + 카테고리 동시
assert.deepStrictEqual(hits('jeong motors'), ['demo-001', 'demo-002', 'demo-003']); // 작성자
assert.strictEqual(esc('<a href="x">'), '&lt;a href=&quot;x&quot;&gt;');
console.log('ok');
