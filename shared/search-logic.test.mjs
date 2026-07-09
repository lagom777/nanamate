/* 전역 검색 핵심 로직 단위 테스트 — node --test shared/search-logic.test.mjs
   search.js를 텍스트로 읽어 new Function(...)로 인스턴스화하고 가드된 module.exports를
   뽑아낸다(flagship.test.mjs 패턴). document 스텁의 readyState:'loading' 덕에 init은
   DOMContentLoaded 콜백으로만 등록되고 실행되지 않아 DOM/브라우저 API를 건드리지 않는다. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/** search.js의 순수 로직(SUBJECTS/search/basePrefix)을 격리 반환. location 스텁은 수정 가능. */
function load() {
  const src = readFileSync(new URL('./search.js', import.meta.url), 'utf8');
  const module = { exports: {} };
  const location = { pathname: '/index.html' };
  const document = { readyState: 'loading', addEventListener() {} };
  new Function('module', 'exports', 'window', 'document', 'location', src)(
    module, module.exports, undefined, document, location
  );
  return { api: module.exports, location };
}

test('search: 빈 질의는 전체 과목(46) 반환', () => {
  const { api } = load();
  assert.equal(api.search('').length, 46);
  assert.equal(api.search('   ').length, 46); // 공백만 → 전체
});

test('search: 대소문자 무시 · 부분 문자열(영문/한글)', () => {
  const { api } = load();
  const byEn = api.search('physics'); // e: "Interactive Physics Lab"
  const byKo = api.search('물리');     // n: "물리학"
  assert.ok(byEn.some((s) => s.u === 'aboutPhysics/index.html'));
  assert.ok(byKo.some((s) => s.u === 'aboutPhysics/index.html'));
  assert.deepEqual(api.search('PHYSICS'), byEn); // 대소문자 무시
});

test('search: n·e·d·c 네 필드 모두에서 매칭', () => {
  const { api } = load();
  const has = (r, u) => r.some((s) => s.u === u);
  assert.ok(has(api.search('타로'), 'aboutTarot/index.html'));       // n
  assert.ok(has(api.search('tarot'), 'aboutTarot/index.html'));      // e
  assert.ok(has(api.search('스프레드'), 'aboutTarot/index.html'));   // d
  const art = api.search('예술');                                    // c (음악이론에만 존재)
  assert.ok(art.length >= 1 && art.every((s) => s.c === '예술'));
});

test('search: 다중 단어는 AND (모든 단어가 같은 과목에 hit)', () => {
  const { api } = load();
  // 두 단어 모두 물리학에 hit(n:물리, e:physics) → 물리학 포함
  assert.ok(api.search('물리 physics').some((s) => s.u === 'aboutPhysics/index.html'));
  // 물리는 물리학, tarot는 타로카드 — 한 과목이 둘 다 만족 못함 → []
  assert.deepEqual(api.search('물리 tarot'), []);
});

test('search: 매칭 없는 질의는 빈 배열', () => {
  const { api } = load();
  assert.deepEqual(api.search('zzqqxwnomatch'), []);
});

test('basePrefix: 페이지 깊이에 따른 ../ 개수', () => {
  const { api, location } = load();
  location.pathname = '/index.html';
  assert.equal(api.basePrefix(), '');
  location.pathname = '/aboutAI/index.html';
  assert.equal(api.basePrefix(), '../');
  location.pathname = '/aboutAI/chapters/01-x.html';
  assert.equal(api.basePrefix(), '../../');
});
