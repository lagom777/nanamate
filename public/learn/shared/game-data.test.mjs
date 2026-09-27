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

const TYPES = new Set(['sequence', 'matching', 'grouping', 'oddone', 'trace', 'slots', 'scenario']);

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
 * - type: 7타입 중 하나, color: '#'로 시작하는 문자열
 * - sequence / matching / grouping / oddone: 기존 계약
 * - trace: stages 길이 >= 2, 각 name 비어있지 않음
 * - slots: slots 길이 >= 2, 각 label·answer 비어있지 않음, answer 중복 없음
 * - scenario: rounds 길이 >= 1, situation·choices·answer·(optional why)
 */
function assertGame(g, ctx) {
  assert.ok(TYPES.has(g.type), ctx + ' type은 지원 타입 중 하나 (실제: ' + g.type + ')');
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
  } else if (g.type === 'oddone') {
    assert.ok(Array.isArray(g.rounds) && g.rounds.length >= 1, ctx + ' rounds 길이 >= 1');
    g.rounds.forEach((r, ri) => {
      assert.ok(Array.isArray(r.items) && r.items.length >= 2, ctx + ' rounds[' + ri + '].items 길이 >= 2');
      r.items.forEach((it) => assert.ok(nonEmptyStr(it), ctx + ' rounds[' + ri + '] item 비어있지 않은 문자열'));
      assert.ok(Number.isInteger(r.odd) && r.odd >= 0 && r.odd < r.items.length,
        ctx + ' rounds[' + ri + '].odd 정수 [0, ' + r.items.length + ') (실제: ' + r.odd + ')');
    });
  } else if (g.type === 'trace') {
    assert.ok(Array.isArray(g.stages) && g.stages.length >= 2, ctx + ' stages 길이 >= 2');
    const names = new Set();
    g.stages.forEach((s, i) => {
      assert.ok(nonEmptyStr(s.name), ctx + ' stages[' + i + '].name 비어있지 않음');
      assert.ok(!names.has(s.name), ctx + ' stages name 중복: ' + s.name);
      names.add(s.name);
    });
  } else if (g.type === 'slots') {
    assert.ok(Array.isArray(g.slots) && g.slots.length >= 2, ctx + ' slots 길이 >= 2');
    const answers = new Set();
    g.slots.forEach((s, i) => {
      assert.ok(nonEmptyStr(s.label), ctx + ' slots[' + i + '].label 비어있지 않음');
      assert.ok(nonEmptyStr(s.answer), ctx + ' slots[' + i + '].answer 비어있지 않음');
      assert.ok(!answers.has(s.answer), ctx + ' slots answer 중복: ' + s.answer);
      answers.add(s.answer);
    });
    if (g.distractors != null) {
      assert.ok(Array.isArray(g.distractors), ctx + ' distractors는 배열');
      g.distractors.forEach((d, i) => assert.ok(nonEmptyStr(d), ctx + ' distractors[' + i + '] 비어있지 않음'));
    }
  } else { // scenario
    assert.ok(Array.isArray(g.rounds) && g.rounds.length >= 1, ctx + ' rounds 길이 >= 1');
    g.rounds.forEach((r, ri) => {
      assert.ok(nonEmptyStr(r.situation), ctx + ' rounds[' + ri + '].situation 비어있지 않음');
      assert.ok(Array.isArray(r.choices) && r.choices.length >= 2, ctx + ' rounds[' + ri + '].choices 길이 >= 2');
      r.choices.forEach((c) => assert.ok(nonEmptyStr(c), ctx + ' rounds[' + ri + '] choice 비어있지 않음'));
      assert.ok(Number.isInteger(r.answer) && r.answer >= 0 && r.answer < r.choices.length,
        ctx + ' rounds[' + ri + '].answer 정수 [0, ' + r.choices.length + ') (실제: ' + r.answer + ')');
    });
  }
}

test('NANAMATE_GAME 페이지 열거(grep) 결과 존재', () => {
  assert.ok(FILES.length > 0, 'grep 결과 비어있지 않음');
});

test('learngame3d: 2열 matching 엔진 폐기, 구 페이로드는 liftMatching으로 승격', () => {
  const src = readFileSync(resolve(ROOT, 'shared/learngame3d.js'), 'utf8');
  assert.ok(src.includes('function liftMatching'), 'liftMatching 존재');
  assert.equal(src.includes('function setupMatching'), false, 'setupMatching 제거');
  assert.equal(src.includes("if (type === 'matching')"), false, 'matching 디스패치 제거');
});

/* 신규 3타입(trace·slots·scenario)은 챕터 코퍼스 도입이 아직 진행 중이라, 계약 자체를 픽스처로 고정한다.
 * 코퍼스에 해당 타입이 0개인 순간에도 검증기가 살아있는지(그리고 무력화되지 않았는지) 보장한다.
 * 형태는 learngame3d.js:21 ok-guard 및 setupTrace·setupSlots·setupScenario가 소비하는 것과 1:1. */
const VALID = {
  trace: { type: 'trace', color: '#6366f1', stages: [{ name: '토큰화', why: '문장을 조각낸다' }, { name: '임베딩' }] },
  slots: { type: 'slots', color: '#6366f1', slots: [{ label: 'Q', answer: '질의' }, { label: 'K', answer: '키' }], distractors: ['미끼'] },
  scenario: { type: 'scenario', color: '#6366f1', rounds: [{ situation: '과적합이 보인다', choices: ['층을 늘린다', '규제를 넣는다'], answer: 1, why: '규제가 분산을 줄인다' }] }
};

test('trace·slots·scenario: 정상 데이터는 계약 통과', () => {
  Object.keys(VALID).forEach((t) => assertGame(VALID[t], t));
});

test('trace·slots·scenario: 계약 위반은 반드시 실패', () => {
  const broken = [
    { ...VALID.trace, stages: [{ name: '토큰화' }] },                                              // stages < 2
    { ...VALID.trace, stages: [{ name: '토큰화' }, { name: '토큰화' }] },                           // name 중복
    { ...VALID.trace, stages: [{ name: '토큰화' }, { name: '  ' }] },                              // name 공백
    { ...VALID.slots, slots: [{ label: 'Q', answer: '질의' }, { label: 'K', answer: '질의' }] },    // answer 중복
    { ...VALID.slots, slots: [{ label: 'Q', answer: '' }, { label: 'K', answer: '키' }] },          // answer 공백
    { ...VALID.slots, distractors: [''] },                                                          // distractor 공백
    { ...VALID.scenario, rounds: [{ situation: '상황', choices: ['가', '나'], answer: 2 }] },        // answer 범위 밖
    { ...VALID.scenario, rounds: [{ situation: '', choices: ['가', '나'], answer: 0 }] },            // situation 공백
    { ...VALID.scenario, rounds: [{ situation: '상황', choices: ['가'], answer: 0 }] },              // choices < 2
    { type: 'trace', stages: VALID.trace.stages },                                                  // color 누락
    { type: 'puzzle', color: '#6366f1', steps: ['가', '나'] }                                        // 미지원 타입
  ];
  broken.forEach((g, i) => assert.throws(() => assertGame(g, 'broken#' + i), assert.AssertionError, 'broken#' + i + ' 는 반드시 실패해야 함'));
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
