// 실행: node shop/products.test.js
const assert = require('assert');
const { PRODUCTS: p, productMatches: m, formatPrice, youtubeId } = require('./products.js');
const hits = (q, c) => p.filter(x => m(x, q, c)).map(x => x.id);
assert.deepStrictEqual(hits('', 'All'), ['demo-p001', 'demo-p002', 'demo-p003']);
assert.deepStrictEqual(hits('cvt'), ['demo-p002']);           // 대소문자 무시
assert.deepStrictEqual(hits('', 'Tools'), ['demo-p003']);     // 카테고리
assert.deepStrictEqual(hits('렌치', 'Steering'), []);          // 검색 + 카테고리 동시
assert.deepStrictEqual(hits('데모 벨트'), ['demo-p002']);      // 여러 단어 = AND
assert.strictEqual(formatPrice({ price: null }), '가격 미정');
assert.strictEqual(formatPrice({ price: 129000, currency: 'KRW' }), '₩129,000');
for (const u of ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/shorts/dQw4w9WgXcQ', 'https://www.youtube.com/watch?t=5&v=dQw4w9WgXcQ']) {
  assert.strictEqual(youtubeId(u), 'dQw4w9WgXcQ', u);
}
assert.strictEqual(youtubeId(''), null);
assert.strictEqual(youtubeId('https://vimeo.com/123'), null);
console.log('ok');
