// 실행: node projects/projects.test.js
const assert = require('assert');
const { PROJECTS: p, PROJECT_STAGES, projectMatches: m } = require('./projects.js');
const hits = g => p.filter(x => m(x, g)).map(x => x.slug);
assert.deepStrictEqual(hits('all'), ['k-01']);
assert.deepStrictEqual(hits('vehicles'), ['k-01']);
assert.deepStrictEqual(hits('experiments'), ['k-01']);
assert.deepStrictEqual(hits('research'), []);
// 데이터 규칙: slug 중복 없음, 사양/단계 값이 허용된 종류인지, 값 없는 사양은 tbd 인지
assert.strictEqual(new Set(p.map(x => x.slug)).size, p.length);
for (const x of p) {
  for (const s of x.specs) {
    assert.ok(['confirmed', 'planned', 'tbd'].includes(s.type), `${x.slug} ${s.label}`);
    if (!s.value) assert.strictEqual(s.type, 'tbd', `${x.slug} ${s.label}: 값 없이 confirmed/planned 불가`);
  }
  assert.deepStrictEqual(x.timeline.map(t => t.stage), PROJECT_STAGES);
  for (const t of x.timeline) assert.ok(['completed', 'in-progress', 'planned'].includes(t.status));
  if (x.cover) assert.ok(x.coverKind, `${x.slug}: cover 에는 coverKind 필수`);
}
console.log('ok');
