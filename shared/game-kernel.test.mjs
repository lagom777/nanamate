/* game-kernel 순수 로직 테스트 — node --test shared/game-kernel.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function load() {
  const src = readFileSync(new URL('./game-kernel.js', import.meta.url), 'utf8');
  const module = { exports: {} };
  new Function('module', 'exports', 'window', src)(module, module.exports, undefined);
  return module.exports;
}

test('coach step rises and pickCoach uses deep after 3', () => {
  const K = load();
  const map = {};
  assert.equal(K.nextCoachStep(map, 'short'), 1);
  assert.equal(K.nextCoachStep(map, 'short'), 2);
  assert.equal(K.nextCoachStep(map, 'short'), 3);
  const ev = { coach: 'A', coachMid: 'B', coachDeep: 'C' };
  assert.equal(K.pickCoach(ev, 1), 'A');
  assert.equal(K.pickCoach(ev, 2), 'B');
  assert.equal(K.pickCoach(ev, 3), 'C');
});

test('starsFromScore thresholds', () => {
  const K = load();
  assert.equal(K.starsFromScore(0, 100), 0);
  assert.equal(K.starsFromScore(40, 100), 1);
  assert.equal(K.starsFromScore(60, 100), 2);
  assert.equal(K.starsFromScore(90, 100), 3);
});
