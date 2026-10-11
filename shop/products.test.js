// 실행: node shop/products.test.js
const assert = require('assert');
const { PRODUCTS: p, PRODUCT_CATEGORIES, catalogFilter: f, catalogSort: s, formatPrice, youtubeId } = require('./products.js');
const ids = list => list.map(x => x.id);

// 필터
assert.deepStrictEqual(ids(f(p, {})), ['demo-p001', 'demo-p002', 'demo-p003']);
assert.deepStrictEqual(ids(f(p, { q: 'CVT' })), ['demo-p002']);                 // 대소문자 무시
assert.deepStrictEqual(ids(f(p, { q: 'jg-prv-0003' })), ['demo-p003']);         // 부품 번호 검색
assert.deepStrictEqual(ids(f(p, { cat: 'tools' })), ['demo-p003']);
assert.deepStrictEqual(ids(f(p, { q: 'wrench', cat: 'steering' })), []);        // 검색 + 카테고리 동시
assert.deepStrictEqual(ids(f(p, { types: ['Tool'] })), ['demo-p003']);
assert.deepStrictEqual(ids(f(p, { verification: ['tested'] })), []);            // 검증된 상품 아직 없음
assert.deepStrictEqual(ids(f(p, { availability: ['coming-soon'] })).length, 3);
assert.deepStrictEqual(ids(f(p, { min: 1 })), []);                              // 가격 조건 -> 가격 미정 제외

// 정렬 (가짜 가격으로 로직만 확인)
const priced = [{ id: 'a', name: 'B', price: 300 }, { id: 'b', name: 'A', price: null }, { id: 'c', name: 'C', price: 100, featured: true, addedAt: '2026-01-02' }];
assert.deepStrictEqual(ids(s(priced, 'price-asc')), ['c', 'a', 'b']);           // 가격 미정은 뒤로
assert.deepStrictEqual(ids(s(priced, 'price-desc')), ['a', 'c', 'b']);
assert.deepStrictEqual(ids(s(priced, 'name')), ['b', 'a', 'c']);
assert.deepStrictEqual(ids(s(priced, 'featured'))[0], 'c');
assert.deepStrictEqual(ids(s(priced, 'newest'))[0], 'c');
assert.deepStrictEqual(ids(priced), ['a', 'b', 'c']);                           // 원본 유지
assert.deepStrictEqual(ids(f(priced.map(x => ({ ...x, verification: {}, sku: '', summary: '' })), { min: 150, max: 400 })), ['a']);

// 데이터 규칙: 중복 없음, 허용된 값, 근거 없는 검증 표시 금지, 제휴 공개
const cats = PRODUCT_CATEGORIES.map(c => c.id);
assert.strictEqual(new Set(p.map(x => x.slug)).size, p.length);
assert.strictEqual(new Set(p.map(x => x.sku)).size, p.length);
for (const x of p) {
  assert.ok(cats.includes(x.category), `${x.slug}: category`);
  assert.ok(['available', 'coming-soon', 'out-of-stock'].includes(x.availability), `${x.slug}: availability`);
  assert.ok(['tested', 'docs', 'unverified'].includes(x.verification.status), `${x.slug}: verification`);
  if (x.verification.status !== 'unverified') assert.ok(x.verification.evidence, `${x.slug}: 검증 표시에는 evidence 필수`);
  for (const pr of x.projects) assert.ok(pr.evidence, `${x.slug}: 프로젝트 호환에는 evidence 필수`);
  for (const d of x.documentation) assert.ok(d.url, `${x.slug}: 문서에는 실제 url 필수`);
  if (x.sourceType === 'affiliate') assert.strictEqual(x.affiliate, true, `${x.slug}: 제휴 상품은 affiliate 공개 필수`);
  if (x.demo) assert.notStrictEqual(x.availability, 'available', `${x.slug}: 미리보기 상품은 판매중으로 표시 불가`);
}

assert.strictEqual(formatPrice({ price: null }), 'PRICE TBA');
assert.strictEqual(formatPrice({ price: 129000, currency: 'KRW' }), '₩129,000');
for (const u of ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/shorts/dQw4w9WgXcQ', 'https://www.youtube.com/watch?t=5&v=dQw4w9WgXcQ']) {
  assert.strictEqual(youtubeId(u), 'dQw4w9WgXcQ', u);
}
assert.strictEqual(youtubeId(''), null);
assert.strictEqual(youtubeId('https://vimeo.com/123'), null);
console.log('ok');
