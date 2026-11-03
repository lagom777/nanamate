/* 뇌·내분비 데이터와 그림이 서로 맞는지 확인한다. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script, createContext } from 'node:vm';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));

function load() {
  const window = {};
  const context = createContext({ window, console });
  new Script(readFileSync(resolve(dir, 'anatomy-data.js'), 'utf8')).runInContext(context);
  new Script(readFileSync(resolve(dir, 'anatomy-art.js'), 'utf8')).runInContext(context);
  return window;
}

const ALLOWED = new Set([
  'brain', 'pituitary', 'thyroid', 'adrenal', 'liver', 'kidney', 'heart',
  'muscle', 'bone', 'gut', 'breast', 'uterus', 'gonad', 'all', 'pancreas'
]);

function collect(svg, attr) {
  return [...svg.matchAll(new RegExp('data-' + attr + '="([^"]+)"', 'g'))].map((m) => m[1]);
}

function assertUnique(list, label) {
  const seen = new Set();
  for (const id of list) {
    assert.ok(!seen.has(id), label + ' 중복: ' + id);
    seen.add(id);
  }
  return seen;
}

/* 옆면의 brainstem 은 묶음이지만 도형이 있다. 그 외 묶음 키는 구성원 도형으로 대신한다. */
function requiredShapes(data, view) {
  return view.parts.filter((key) => {
    if (view.id === 'side' && key === 'brainstem') return true;
    if (data.groups[key]) return false;
    return true;
  });
}

const { ANATOMY_DATA: data, ANATOMY_ART: art } = load();

test('자료 뼈대', () => {
  assert.ok(data && art);
  for (const view of data.brainViews) {
    assert.ok(view.id && view.label && Array.isArray(view.parts));
    for (const key of view.parts) assert.ok(data.parts[key], '보기에 없는 부위 ' + key);
  }
  for (const [name, members] of Object.entries(data.groups)) {
    assert.ok(data.parts[name], '묶음 ' + name);
    for (const m of members) assert.ok(data.parts[m], name + ' 구성원 ' + m);
  }
  for (const g of data.glands) assert.ok(data.parts[g], '샘 ' + g);
});

test('부위 필드', () => {
  for (const [key, p] of Object.entries(data.parts)) {
    assert.equal(typeof p.name, 'string', key);
    assert.ok(p.name.length > 0, key);
    assert.equal(typeof p.en, 'string', key);
    assert.ok(p.level === 'core' || p.level === 'ref', key + ' level');
    assert.equal(typeof p.where, 'string', key);
    assert.ok(p.etym && p.etym.ko && p.etym.en && p.etym.memo, key + ' etym');
    assert.ok(Array.isArray(p.role) && p.role.length >= 1, key + ' role');
  }
});

test('호르몬과 표적', () => {
  for (const p of Object.values(data.parts)) {
    for (const group of p.hormones || []) {
      assert.ok(Array.isArray(group.keys));
      for (const k of group.keys) assert.ok(data.hormones[k], '호르몬 없음 ' + k);
    }
  }
  for (const [key, h] of Object.entries(data.hormones)) {
    assert.ok(data.parts[h.from], key + ' from ' + h.from);
    assert.ok(Array.isArray(h.targets) && h.targets.length >= 1, key);
    for (const t of h.targets) assert.ok(ALLOWED.has(t), key + ' 표적 ' + t);
  }
});

test('시나리오', () => {
  const views = new Map(data.brainViews.map((v) => [v.id, v]));
  for (const s of data.scenarios.brain) {
    assert.ok(s.id && s.title && s.steps.length);
    for (const step of s.steps) {
      assert.ok(views.has(step.view), step.view);
      assert.ok(data.parts[step.key], step.key);
      assert.ok(views.get(step.view).parts.includes(step.key), step.key + ' @ ' + step.view);
    }
  }
  for (const s of data.scenarios.endo) {
    assert.ok(s.steps.length);
    for (const step of s.steps) {
      assert.ok(data.parts[step.gland], step.gland);
      assert.ok(data.glands.includes(step.gland), step.gland);
      assert.ok(step.hormone === null || !!data.hormones[step.hormone], String(step.hormone));
    }
  }
});

test('그림 키와 표적', () => {
  assert.equal(typeof art.brainSide, 'string');
  assert.equal(typeof art.brainMid, 'string');
  assert.equal(typeof art.body, 'string');
  assert.equal(typeof art.headInset, 'string');
  assert.ok(art.viewBox.brainSide && art.viewBox.brainMid && art.viewBox.body);
  for (const key of ['brainSide', 'brainMid', 'body', 'headInset']) {
    assert.ok(!/<svg[\s>]/i.test(art[key]), key + ' 에 루트 svg');
  }

  const side = data.brainViews.find((v) => v.id === 'side');
  const mid = data.brainViews.find((v) => v.id === 'mid');
  const sideIds = assertUnique(collect(art.brainSide, 'part'), 'brainSide');
  const midIds = assertUnique(collect(art.brainMid, 'part'), 'brainMid');
  const bodyParts = assertUnique(collect(art.body, 'part'), 'body part');
  const bodyTargets = assertUnique(collect(art.body, 'target'), 'body target');

  for (const key of requiredShapes(data, side)) assert.ok(sideIds.has(key), '옆면 도형 ' + key);
  for (const key of requiredShapes(data, mid)) assert.ok(midIds.has(key), '단면 도형 ' + key);
  for (const key of data.glands) assert.ok(bodyParts.has(key), '몸 샘 ' + key);

  for (const id of ['brain', 'liver', 'kidney', 'heart', 'muscle', 'bone', 'gut', 'breast', 'uterus']) {
    assert.ok(bodyTargets.has(id), '표적 ' + id);
  }
  for (const id of sideIds) assert.ok(data.parts[id], '옆면 모르는 키 ' + id);
  for (const id of midIds) assert.ok(data.parts[id], '단면 모르는 키 ' + id);
  for (const id of bodyParts) assert.ok(data.parts[id], '몸 모르는 키 ' + id);
  for (const id of bodyTargets) assert.ok(ALLOWED.has(id), '표적 id ' + id);

  assert.ok(art.brainMid.includes('ax-lateral'));
  assert.ok(art.body.includes('data-sex="f"'));
  assert.ok(art.body.includes('data-sex="m"'));
  assert.ok(art.body.includes('ax-all-pt'));
});
