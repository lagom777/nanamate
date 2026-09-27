/* 전역 검색 색인 무결성 회귀 테스트 — node --test shared/search-index.test.mjs
   search.js의 SUBJECTS 색인과 허브(index.html) 카드가 1:1로 일치하는지 검증한다.
   (aboutHarness 누락 같은 색인 드리프트를 CI에서 잡는다.) 프로덕션 파일은 안 건드림. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url)); // 레포 루트(= shared/의 상위)

/** search.js에서 SUBJECTS 배열 리터럴만 뽑아 JSON.parse (항목은 순수 JSON 객체). */
function loadSubjects() {
  const src = readFileSync(new URL('./search.js', import.meta.url), 'utf8');
  const start = src.indexOf('var SUBJECTS = [') + 'var SUBJECTS = ['.length;
  const end = src.indexOf('\n  ];', start);
  assert.ok(start > 15 && end > start, 'SUBJECTS 배열 경계를 찾지 못함');
  return JSON.parse('[' + src.slice(start, end) + ']');
}

/** index.html의 허브 카드 href 집합. */
function hubHrefs() {
  const html = readFileSync(new URL('./../index.html', import.meta.url), 'utf8');
  const set = new Set();
  const re = /href="(about[A-Za-z]+\/index\.html)"/g;
  let m;
  while ((m = re.exec(html)) !== null) set.add(m[1]);
  return set;
}

test('SUBJECTS 색인 .u 집합 = 허브 카드 href 집합 (드리프트 없음)', () => {
  const us = new Set(loadSubjects().map((s) => s.u));
  const hrefs = hubHrefs();
  assert.deepEqual([...us].sort(), [...hrefs].sort());
});

test('모든 SUBJECTS .u 대상 파일이 디스크에 존재', () => {
  for (const s of loadSubjects()) {
    assert.ok(existsSync(ROOT + s.u), '없는 경로: ' + s.u);
  }
});

test('SUBJECTS .u 중복 없음', () => {
  const subs = loadSubjects();
  assert.equal(new Set(subs.map((s) => s.u)).size, subs.length);
});

test('모든 SUBJECTS 항목이 n·e·d·u·c·a 비어있지 않음', () => {
  for (const s of loadSubjects()) {
    for (const k of ['n', 'e', 'd', 'u', 'c', 'a']) {
      assert.equal(typeof s[k], 'string');
      assert.ok(s[k].length > 0, '빈 필드 ' + k + ': ' + JSON.stringify(s));
    }
  }
});
