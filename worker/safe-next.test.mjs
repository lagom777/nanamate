import { test } from 'node:test';
import assert from 'node:assert/strict';
import { failedNext, safeNext } from './safe-next.js';

test('위험한 next 는 / 로 막는다', () => {
  assert.equal(safeNext('//evil.com'), '/');
  assert.equal(safeNext('//evil.com/path'), '/');
  assert.equal(safeNext('https://evil.example/steal'), '/');
  assert.equal(safeNext('http://evil.example'), '/');
  assert.equal(safeNext('/\\evil'), '/');
  assert.equal(safeNext('/foo\\bar'), '/');
  assert.equal(safeNext('/foo//bar'), '/');
  assert.equal(safeNext('foo'), '/');
  assert.equal(safeNext(''), '/');
  assert.equal(safeNext(null), '/');
});

test('같은 사이트 상대경로만 허용', () => {
  assert.equal(safeNext('/'), '/');
  assert.equal(safeNext('/aboutSuneungMath/practice.html'), '/aboutSuneungMath/practice.html');
  assert.equal(safeNext('/aboutSuneungMath/practice.html?x=1'), '/aboutSuneungMath/practice.html?x=1');
});

test('로그인 실패는 next 에 login=failed 를 붙인다', () => {
  assert.equal(failedNext('/aboutSuneungMath/practice.html'), '/aboutSuneungMath/practice.html?login=failed');
  assert.equal(failedNext('/aboutSuneungMath/practice.html?a=1'), '/aboutSuneungMath/practice.html?a=1&login=failed');
  assert.equal(failedNext('/p#q'), '/p?login=failed#q');
  assert.equal(failedNext('//evil.com'), '/?login=failed');
});
