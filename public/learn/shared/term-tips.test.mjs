/* 용어 툴팁 매처·데이터 검증 — node --test public/learn/shared/term-tips.test.mjs
   term-tips.js 를 vm 에서 실행한다. document 가 없으므로 DOM 초기화는 건너뛴다. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

function loadEngine() {
  const src = readFileSync(new URL('./term-tips.js', import.meta.url), 'utf8');
  const window = {};
  vm.runInContext(src, vm.createContext({ window }));
  return window.NMTermTips;
}

const api = loadEngine();

function term(k, extra) {
  return Object.assign({ k: k, def: k + '의 뜻', etym: { memo: k + ' 기억' } }, extra || {});
}

/** vm 영역의 배열은 프로토타입이 달라 deepEqual 이 실패하므로 이쪽 배열로 옮긴다. */
function rows(hits, text) {
  return Array.from(hits, (h) => {
    const row = [h.start, h.end, h.term.k];
    if (text !== undefined) row.push(text.slice(h.start, h.end));
    return row;
  });
}

test('DOM 없이 buildMatcher·match 를 노출한다', () => {
  assert.equal(typeof api.buildMatcher, 'function');
  assert.equal(typeof api.match, 'function');
});

test('scope: ch 가 있는 용어는 해당 장에서만 남는다', () => {
  const plain = term('효소');
  const scoped = term('전도', { ch: ['03'] });
  assert.deepEqual(Array.from(api.scope([plain, scoped], '03'), (t) => t.k), ['효소', '전도']);
  assert.deepEqual(Array.from(api.scope([plain, scoped], '04'), (t) => t.k), ['효소']);
  assert.deepEqual(Array.from(api.scope([plain, scoped], ''), (t) => t.k), ['효소']);
});

test('긴 표제어가 짧은 표제어보다 우선한다 (대뇌 vs 뇌)', () => {
  const brain = term('뇌');
  const cerebrum = term('대뇌');
  const matcher = api.buildMatcher([brain, cerebrum]);
  const hits = api.match('대뇌', matcher);
  assert.deepEqual(rows(hits), [[0, 2, '대뇌']]);
  assert.equal(hits[0].term, cerebrum);

  const both = api.match('뇌의 대뇌', matcher);
  assert.deepEqual(rows(both, '뇌의 대뇌'), [
    [0, 1, '뇌', '뇌'],
    [3, 5, '대뇌', '대뇌'],
  ]);
});

test('겹치는 구간은 긴 매칭만 남긴다', () => {
  const matcher = api.buildMatcher([term('활동'), term('동전위')]);
  const text = '활동전위';
  const hits = api.match(text, matcher);
  assert.deepEqual(rows(hits), [[1, 4, '동전위']]);
  assert.equal(text.slice(1, 4), '동전위');
});

test('alt 표기도 같은 용어로 매칭한다', () => {
  const action = term('활동 전위', { alt: ['활동전위'] });
  const matcher = api.buildMatcher([action]);
  const text = '활동전위와 활동 전위';
  const hits = api.match(text, matcher);
  assert.equal(hits.length, 2);
  assert.equal(hits[0].term, action);
  assert.equal(hits[1].term, action);
  assert.equal(text.slice(hits[0].start, hits[0].end), '활동전위');
  assert.equal(text.slice(hits[1].start, hits[1].end), '활동 전위');
  assert.deepEqual([hits[0].start, hits[0].end], [0, 4]);
  assert.deepEqual([hits[1].start, hits[1].end], [text.indexOf('활동 전위'), text.indexOf('활동 전위') + 5]);
});

test('영문 표기는 앞뒤가 영숫자일 때 매칭하지 않는다', () => {
  const atp = term('ATP');
  const matcher = api.buildMatcher([atp]);
  const text = 'ATPase, xATP, ATP를, (ATP)';
  const hits = api.match(text, matcher);
  assert.deepEqual(rows(hits, text), [
    [text.indexOf('ATP를'), text.indexOf('ATP를') + 3, 'ATP', 'ATP'],
    [text.indexOf('(ATP)') + 1, text.indexOf('(ATP)') + 4, 'ATP', 'ATP'],
  ]);
  assert.ok(hits.every((h) => h.term === atp));
  assert.equal(api.match('ATPase', matcher).length, 0);
  assert.equal(api.match('xATP', matcher).length, 0);
});

test('영문 표기는 대소문자를 구분하지 않는다', () => {
  const atp = term('ATP');
  const matcher = api.buildMatcher([atp]);
  const text = 'atp와 Atp';
  const hits = api.match(text, matcher);
  assert.deepEqual(rows(hits, text), [
    [0, 3, 'ATP', 'atp'],
    [5, 8, 'ATP', 'Atp'],
  ]);
});

test('정규식 특수문자를 글자 그대로 매칭한다', () => {
  const sub = '\u2084';
  const sup = '\u207a';
  const dash = '\u2013';
  const t4 = 'T' + sub;
  const pump = 'Na' + sup + dash + 'K' + sup + ' 펌프';
  const paren = '(활동)';
  const matcher = api.buildMatcher([term(t4), term(pump), term(paren), term('A.B')]);
  const text = '앞활동뒤 ' + t4 + '은 ' + t4 + 'a ' + pump + ' ' + paren;
  const hits = api.match(text, matcher);
  assert.deepEqual(Array.from(hits, (h) => text.slice(h.start, h.end)), [t4, pump, paren]);

  const dotted = api.buildMatcher([term('A.B')]);
  assert.equal(api.match('AxB', dotted).length, 0);
  assert.equal(api.match('A.B', dotted)[0].end - api.match('A.B', dotted)[0].start, 3);
});

test('한 문단에서 매칭 위치가 맞다', () => {
  const brain = term('뇌');
  const cerebrum = term('대뇌');
  const action = term('활동 전위', {
    alt: ['활동전위'],
    en: 'Action potential',
    etym: { ko: '움직이는 자리', en: 'action+potential', memo: '일하는 전위' },
  });
  const atp = term('ATP');
  const sample = [brain, cerebrum, action, atp];
  const matcher = api.buildMatcher(sample);
  const paragraph = '대뇌는 뇌의 명령을 활동전위로 전하고 ATP를 쓴다. ATPase와 xATP는 빠진다.';
  const hits = api.match(paragraph, matcher);
  const again = api.match(paragraph, matcher);

  assert.deepEqual(rows(hits, paragraph), [
    [paragraph.indexOf('대뇌'), paragraph.indexOf('대뇌') + 2, '대뇌', '대뇌'],
    [paragraph.indexOf('뇌의'), paragraph.indexOf('뇌의') + 1, '뇌', '뇌'],
    [paragraph.indexOf('활동전위'), paragraph.indexOf('활동전위') + 4, '활동 전위', '활동전위'],
    [paragraph.indexOf('ATP를'), paragraph.indexOf('ATP를') + 3, 'ATP', 'ATP'],
  ]);
  assert.equal(hits[0].term, cerebrum);
  assert.equal(hits[1].term, brain);
  assert.equal(hits[2].term, action);
  assert.equal(hits[3].term, atp);
  assert.deepEqual(rows(again), rows(hits));
});

test('빈 입력은 빈 배열', () => {
  const matcher = api.buildMatcher([term('대뇌')]);
  assert.equal(api.match('', matcher).length, 0);
  assert.equal(api.match('대뇌', api.buildMatcher([])).length, 0);
  assert.equal(api.match('대뇌', api.buildMatcher(null)).length, 0);
});

const TAG = /<[a-z/][^>]*>/i;

function eachString(value, fn, seen) {
  if (typeof value === 'string') {
    fn(value);
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((item) => eachString(item, fn, seen));
    return;
  }
  Object.keys(value).forEach((key) => eachString(value[key], fn, seen));
}

function assertTermList(terms, label) {
  assert.ok(Array.isArray(terms), label + ': NM_TERMS 는 배열');
  const seen = new Set();
  for (const term of terms) {
    assert.equal(typeof term.k, 'string', label + ': k');
    assert.equal(typeof term.def, 'string', label + ': def');
    assert.ok(term.etym && typeof term.etym.memo === 'string', label + ': etym.memo (' + term.k + ')');
    const surfaces = [term.k].concat(Array.isArray(term.alt) ? term.alt : []);
    if (term.alt !== undefined) assert.ok(Array.isArray(term.alt), label + ': alt 배열 (' + term.k + ')');
    for (const surface of surfaces) {
      assert.equal(typeof surface, 'string', label + ': 표기');
      assert.ok(!seen.has(surface), label + ': 중복 표기 ' + surface);
      seen.add(surface);
      if (/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(surface)) {
        assert.ok(surface.length >= 2, label + ': 한글 표제어는 2글자 이상 (' + surface + ')');
      }
    }
    eachString(term, (str) => {
      assert.equal(TAG.test(str), false, label + ': HTML 태그 포함 ' + str);
    }, new Set());
  }
}

function checkTermFile(t, rel) {
  const url = new URL(rel, import.meta.url);
  const path = fileURLToPath(url);
  if (!existsSync(path)) {
    t.skip(rel + ' 없음');
    return;
  }
  const src = readFileSync(url, 'utf8');
  const window = {};
  vm.runInContext(src, vm.createContext({ window: window, console: console }));
  assertTermList(window.NM_TERMS, rel);
}

test('terms/bio1.js 데이터', (t) => {
  checkTermFile(t, './terms/bio1.js');
});

test('terms/phys1.js 데이터', (t) => {
  checkTermFile(t, './terms/phys1.js');
});
