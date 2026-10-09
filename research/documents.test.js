// 실행: node research/documents.test.js
const assert = require('assert');
const { RESEARCH_DOCS: d, researchMatches: m, esc } = require('./documents.js');
const hits = (q, c) => d.filter(x => m(x, q, c)).map(x => x.id);
assert.deepStrictEqual(hits('', '전체'), ['demo-001', 'demo-002', 'demo-003']);
assert.deepStrictEqual(hits('cfd'), ['demo-001']);            // 영문 대소문자 무시
assert.deepStrictEqual(hits('조향'), ['demo-002']);           // 한글 제목
assert.deepStrictEqual(hits('k-01'), ['demo-002', 'demo-003']);
assert.deepStrictEqual(hits('k-01 cvt'), ['demo-003']);       // 여러 단어 = AND
assert.deepStrictEqual(hits('', '동력계'), ['demo-003']);      // 카테고리
assert.deepStrictEqual(hits('steering', '동력계'), []);        // 검색 + 카테고리 동시
assert.deepStrictEqual(hits('jeong motors'), ['demo-001', 'demo-002', 'demo-003']); // 작성자
assert.strictEqual(esc('<a href="x">'), '&lt;a href=&quot;x&quot;&gt;');
console.log('ok');
