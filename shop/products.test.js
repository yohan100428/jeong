// 실행: node shop/products.test.js
const assert = require('assert');
const { PRODUCTS: p, PRODUCT_CATEGORIES, catalogFilter: f, catalogSort: s, formatPrice, youtubeId } = require('./products.js');
const ids = list => list.map(x => x.id);

// 필터 (실제 상품 수와 무관하게 가짜 목록으로 로직 확인)
const mk = (id, name, category, productType, extra = {}) => ({ id, name, sku: `SKU-${id}`, summary: '', manufacturer: '', category, productType,
  availability: 'coming-soon', verification: { status: 'unverified' }, price: null, ...extra });
const fake = [mk('a', 'Steering Gearbox', 'steering', 'Component'), mk('b', 'CVT Drive Kit', 'drivetrain', 'Component'),
  mk('c', 'Torque Wrench', 'tools', 'Tool', { verification: { status: 'tested' }, availability: 'available' })];
assert.deepStrictEqual(ids(f(fake, {})), ['a', 'b', 'c']);
assert.deepStrictEqual(ids(f(fake, { q: 'cvt' })), ['b']);                       // 대소문자 무시
assert.deepStrictEqual(ids(f(fake, { q: 'sku-c' })), ['c']);                     // 부품 번호 검색
assert.deepStrictEqual(ids(f(fake, { cat: 'tools' })), ['c']);
assert.deepStrictEqual(ids(f(fake, { q: 'wrench', cat: 'steering' })), []);      // 검색 + 카테고리 동시
assert.deepStrictEqual(ids(f(fake, { types: ['Tool'] })), ['c']);
assert.deepStrictEqual(ids(f(fake, { verification: ['tested'] })), ['c']);
assert.deepStrictEqual(ids(f(fake, { availability: ['coming-soon'] })), ['a', 'b']);
assert.deepStrictEqual(ids(f(fake, { min: 1 })), []);                            // 가격 조건 -> 가격 미정 제외
assert.deepStrictEqual(ids(f(p, { cat: 'drivetrain' })), ['p001']);              // 실제 데이터: CVT 는 DRIVETRAIN

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
  for (const img of [...x.images, ...(x.figures || []).map(g => g.src)]) assert.ok(require('fs').existsSync(require('path').join(__dirname, img)), `${x.slug}: 이미지 파일 없음 ${img}`);
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
