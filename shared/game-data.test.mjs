/* shared/game-data.test.mjs — 인라인 NANAMATE_GAME 코퍼스(416페이지) 계약/회귀 테스트
   각 학습게임 HTML에서 window.NANAMATE_GAME 블록을 추출·JSON.parse 후
   shared/learngame3d.js가 소비하는 타입별 계약을 검증한다.
   프로덕션 파일 무편집. node --test shared/game-data.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// NANAMATE_GAME을 인라인한 모든 학습게임 페이지 열거 (grep -rln → 416개)
const FILES = execSync('grep -rln --include="*.html" "NANAMATE_GAME" .', { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter(Boolean);

const TYPES = new Set(['sequence', 'matching', 'grouping', 'oddone']);

/** 한 페이지의 모든 window.NANAMATE_GAME 블록을 파싱해 반환 (블록은 단일 줄 순수 JSON) */
function parseBlocks(rel) {
  const src = readFileSync(resolve(ROOT, rel), 'utf8');
  const blocks = [];
  for (const m of src.matchAll(/window\.NANAMATE_GAME\s*=\s*(\{[\s\S]*?\})\s*;/g)) {
    blocks.push(JSON.parse(m[1]));
  }
  return blocks;
}

function nonEmptyStr(s) { return typeof s === 'string' && s.trim().length > 0; }

/**
 * 타입별 게임 데이터 계약 검증 (learngame3d.js가 소비하는 형태).
 * - type: {sequence,matching,grouping,oddone} 중 하나, color: '#'로 시작하는 문자열
 * - sequence: steps 배열 길이 >= 2, 각 단계 비어있지 않은 문자열 (learngame3d.js:21 ok-guard)
 * - matching: pairs 배열 길이 >= 2, 각 term·def 비어있지 않음 (chip(p.term)/chip(p.def))
 * - grouping: groups 길이 >= 2, 각 name·items 비어있지 않고 총 items >= 2,
 *             한 item이 서로 다른 두 그룹에 중복되지 않음 (:143 itemOf[it]=gi 충돌 방어)
 * - oddone: rounds 길이 >= 1, 각 round.items 길이 >= 2 (:166 r.items.forEach TypeError 방어),
 *           round.odd 정수 [0, items.length) (:169 i===r.odd 무승부 라운드 방어)
 */
function assertGame(g, ctx) {
  assert.ok(TYPES.has(g.type), ctx + " type은 {sequence,matching,grouping,oddone} 중 하나 (실제: " + g.type + ')');
  assert.equal(typeof g.color, 'string', ctx + ' color는 문자열');
  assert.ok(g.color.startsWith('#'), ctx + " color는 '#'로 시작");

  if (g.type === 'sequence') {
    assert.ok(Array.isArray(g.steps) && g.steps.length >= 2, ctx + ' steps 길이 >= 2');
    g.steps.forEach((s, i) => assert.ok(nonEmptyStr(s), ctx + ' steps[' + i + '] 비어있지 않은 문자열'));
  } else if (g.type === 'matching') {
    assert.ok(Array.isArray(g.pairs) && g.pairs.length >= 2, ctx + ' pairs 길이 >= 2');
    g.pairs.forEach((p, i) => {
      assert.ok(nonEmptyStr(p.term), ctx + ' pairs[' + i + '].term 비어있지 않음');
      assert.ok(nonEmptyStr(p.def), ctx + ' pairs[' + i + '].def 비어있지 않음');
    });
  } else if (g.type === 'grouping') {
    assert.ok(Array.isArray(g.groups) && g.groups.length >= 2, ctx + ' groups 길이 >= 2');
    let total = 0;
    const owner = new Map(); // item -> 최초 그룹 인덱스
    g.groups.forEach((gr, gi) => {
      assert.ok(nonEmptyStr(gr.name), ctx + ' groups[' + gi + '].name 비어있지 않음');
      assert.ok(Array.isArray(gr.items) && gr.items.length >= 1, ctx + ' groups[' + gi + '].items 비어있지 않은 배열');
      gr.items.forEach((it) => {
        total++;
        assert.ok(nonEmptyStr(it), ctx + ' groups[' + gi + '] item 비어있지 않은 문자열');
        assert.ok(!(owner.has(it) && owner.get(it) !== gi),
          ctx + ' item "' + it + '"이 서로 다른 두 그룹에 중복(그룹 ' + owner.get(it) + ' vs ' + gi + ')');
        if (!owner.has(it)) owner.set(it, gi);
      });
    });
    assert.ok(total >= 2, ctx + ' 총 items >= 2');
  } else { // oddone
    assert.ok(Array.isArray(g.rounds) && g.rounds.length >= 1, ctx + ' rounds 길이 >= 1');
    g.rounds.forEach((r, ri) => {
      assert.ok(Array.isArray(r.items) && r.items.length >= 2, ctx + ' rounds[' + ri + '].items 길이 >= 2');
      r.items.forEach((it) => assert.ok(nonEmptyStr(it), ctx + ' rounds[' + ri + '] item 비어있지 않은 문자열'));
      assert.ok(Number.isInteger(r.odd) && r.odd >= 0 && r.odd < r.items.length,
        ctx + ' rounds[' + ri + '].odd 정수 [0, ' + r.items.length + ') (실제: ' + r.odd + ')');
    });
  }
}

test('NANAMATE_GAME 페이지 열거(grep) 결과 존재', () => {
  assert.ok(FILES.length > 0, 'grep 결과 비어있지 않음');
});

for (const rel of FILES) {
  test(rel, () => {
    const blocks = parseBlocks(rel);
    assert.ok(blocks.length > 0, rel + ' NANAMATE_GAME 블록 1개 이상 파싱(정규식/포맷 드리프트 감지)');
    blocks.forEach((data, bi) => {
      const tag = rel + (blocks.length > 1 ? ' #' + bi : '');
      assertGame(data, tag);
    });
  });
}
