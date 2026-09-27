/* shared/quiz-data.test.mjs — 인라인 NANAMATE_QUIZ 코퍼스(416페이지·2080문항) 계약/회귀 테스트
   각 퀴즈 HTML에서 window.NANAMATE_QUIZ 블록을 추출·JSON.parse 후
   shared/quizgame3d.js가 소비하는 계약 {color, questions:[{q,choices,answer}]}을 검증한다.
   프로덕션 파일 무편집. node --test shared/quiz-data.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// NANAMATE_QUIZ를 인라인한 모든 퀴즈 페이지 열거 (grep -rln → 416개)
const FILES = execSync('grep -rln --include="*.html" "NANAMATE_QUIZ" .', { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter(Boolean);

/** 한 페이지의 모든 window.NANAMATE_QUIZ 블록을 파싱해 반환 (블록은 단일 줄 순수 JSON) */
function parseBlocks(rel) {
  const src = readFileSync(resolve(ROOT, rel), 'utf8');
  const blocks = [];
  for (const m of src.matchAll(/window\.NANAMATE_QUIZ\s*=\s*(\{[\s\S]*?\})\s*;/g)) {
    blocks.push(JSON.parse(m[1]));
  }
  return blocks;
}

/**
 * MCQ 문항 계약 검증 (quizgame3d.js가 소비하는 {q,choices,answer}).
 * - q: 비어있지 않은 문자열
 * - choices: 문자열 배열, 길이 >= 2, 각 항목 비어있지 않음, 중복 없음
 * - answer: 정수이며 [0, choices.length-1] (quizgame3d.js:179 choiceMeshes[q.answer] undefined-throw 방어)
 */
function assertQuestion(q, ctx) {
  assert.equal(typeof q.q, 'string', ctx + ' q는 문자열');
  assert.ok(q.q.length > 0, ctx + ' q 비어있지 않음');
  assert.ok(Array.isArray(q.choices) && q.choices.length >= 2, ctx + ' choices 길이 >= 2');
  const seen = new Set();
  for (const c of q.choices) {
    assert.equal(typeof c, 'string', ctx + ' 보기는 문자열');
    assert.ok(c.length > 0, ctx + ' 보기 비어있지 않음');
    seen.add(c);
  }
  assert.equal(seen.size, q.choices.length, ctx + ' 보기 중복 없음');
  assert.ok(Number.isInteger(q.answer), ctx + ' answer 정수');
  assert.ok(q.answer >= 0 && q.answer < q.choices.length,
    ctx + ' answer 범위 [0, ' + (q.choices.length - 1) + '] 이내');
}

test('NANAMATE_QUIZ 페이지 열거(grep) 결과 존재', () => {
  assert.ok(FILES.length > 0, 'grep 결과 비어있지 않음');
});

for (const rel of FILES) {
  test(rel, () => {
    const blocks = parseBlocks(rel);
    assert.ok(blocks.length > 0, rel + ' NANAMATE_QUIZ 블록 1개 이상 파싱(정규식/포맷 드리프트 감지)');
    blocks.forEach((data, bi) => {
      const tag = rel + (blocks.length > 1 ? ' #' + bi : '');
      assert.ok(Array.isArray(data.questions) && data.questions.length > 0,
        tag + ' questions 비어있지 않은 배열');
      data.questions.forEach((q, i) => assertQuestion(q, tag + ' q[' + i + ']'));
    });
  });
}
