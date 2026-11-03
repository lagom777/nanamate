/* 뇌 여행 장면 정의 검증 — node --test public/learn/shared/brain-tour.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function load(name) {
  const window = {};
  vm.runInContext(readFileSync(new URL('./' + name, import.meta.url), 'utf8'), vm.createContext({ window }));
  return window;
}
const w = Object.assign({}, load('anatomy-data.js'), load('anatomy-art.js'), load('brain-tour.js'));
const D = w.ANATOMY_DATA, A = w.ANATOMY_ART, T = w.NMBrainTour;
const partsIn = (svg) => new Set([...svg.matchAll(/data-part="([a-z_]+)"/g)].map((m) => m[1]));

test('장면이 있고 시간 합계가 맞다', () => {
  assert.ok(T.scenes.length >= 12);
  assert.equal(T.total, T.scenes.reduce((a, s) => a + s.dur, 0));
  assert.ok(T.total >= 60 && T.total <= 120);
});

test('장면의 부위 키가 데이터와 그림에 있다', () => {
  const art = { side: partsIn(A.brainSide), mid: partsIn(A.brainMid) };
  for (const s of T.scenes) {
    assert.ok(art[s.view], s.id + ' view');
    const keys = [...(s.focus || []), ...(s.cam || []), ...(s.seq || [])];
    for (const k of keys) {
      const members = D.groups[k] || [k];
      assert.ok(D.parts[k], s.id + ': 데이터에 없는 키 ' + k);
      assert.ok(art[s.view].has(k) || members.some((m) => art[s.view].has(m)), s.id + ': ' + s.view + ' 그림에 없는 ' + k);
    }
    if (s.memo) assert.ok(D.parts[s.memo].etym.memo, s.id + ' memo');
    assert.ok(s.text && s.text.length > 8, s.id + ' text');
  }
});

test('시나리오 전환: 옆면 뒤 정중 단면', () => {
  const views = T.scenes.map((s) => s.view);
  assert.equal(views[0], 'side');
  assert.equal(views[views.length - 1], 'mid');
  assert.equal(views.join('').replace(/(side)+/, 'S').replace(/(mid)+/, 'M'), 'SM');
});
