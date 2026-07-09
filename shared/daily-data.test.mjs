/* shared/daily-data.test.mjs — 3개 일일학습 데이터 뱅크(EN/ZH/TOEIC) 데이터 계약 테스트
   각 daily-data.js를 텍스트로 읽어 new Function('window', src)({})로 실행한 뒤
   window.NANAMATE_DAILY를 daily.js가 실제로 소비하는 계약에 맞춰 검증한다.
   프로덕션 파일 무편집. node --test shared/daily-data.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/** {dir}/daily-data.js 실행 후 window.NANAMATE_DAILY 반환 (window는 {} 스텁) */
function loadBank(dir) {
  const src = readFileSync(new URL('../' + dir + '/daily-data.js', import.meta.url), 'utf8');
  const win = {};
  new Function('window', src)(win);
  return win.NANAMATE_DAILY;
}

const EPOCH_RE = /^\d{4}-\d{2}-\d{2}$/;

/** 모든 뱅크 공통 계약: kind/subject/accent/title/epoch */
function assertCommon(data) {
  assert.ok(data, 'NANAMATE_DAILY 존재');
  assert.ok(['lesson', 'quizset'].includes(data.kind), 'kind ∈ {lesson,quizset}');
  assert.equal(typeof data.subject, 'string');
  assert.ok(data.subject.length > 0, 'subject 비어있지 않음');
  assert.equal(typeof data.accent, 'string');
  assert.ok(data.accent.length > 0, 'accent 비어있지 않음');
  assert.equal(typeof data.title, 'string');
  assert.ok(data.title.length > 0, 'title 비어있지 않음');
  assert.equal(typeof data.epoch, 'string');
  assert.match(data.epoch, EPOCH_RE);
}

/**
 * MCQ 문항 공통 계약 검증.
 * opts.choicesLen 지정 시 보기 길이가 정확히 그 값, 아니면 opts.minChoices 이상.
 * - q: 비어있지 않은 문자열
 * - choices: 문자열 배열, 중복 없음
 * - answer: 정수이며 [0, choices.length-1] (out-of-range가 이 테스트가 막는 버그류)
 * - explain: 존재
 */
function assertQuestion(q, ctx, opts) {
  opts = opts || {};
  assert.equal(typeof q.q, 'string', ctx + ' q는 문자열');
  assert.ok(q.q.length > 0, ctx + ' q 비어있지 않음');
  assert.ok(Array.isArray(q.choices), ctx + ' choices 배열');
  if (opts.choicesLen != null) {
    assert.equal(q.choices.length, opts.choicesLen, ctx + ' choices 길이 == ' + opts.choicesLen);
  } else {
    assert.ok(q.choices.length >= opts.minChoices, ctx + ' choices 길이 >= ' + opts.minChoices);
  }
  const seen = new Set();
  for (const c of q.choices) {
    assert.equal(typeof c, 'string', ctx + ' 보기는 문자열');
    seen.add(c);
  }
  assert.equal(seen.size, q.choices.length, ctx + ' 보기 문자열 중복 없음');
  assert.ok(Number.isInteger(q.answer), ctx + ' answer 정수');
  assert.ok(q.answer >= 0 && q.answer < q.choices.length,
    ctx + ' answer 범위 [0, ' + (q.choices.length - 1) + '] 이내');
  assert.ok(q.explain != null && String(q.explain).length > 0, ctx + ' explain 존재');
}

/** lesson 뱅크(EN/ZH) 공통: items front+mean, quiz 각 문항 (보기 >=2) */
function assertLessonBank(data, tag) {
  assertCommon(data);
  assert.equal(data.kind, 'lesson');
  assert.ok(Array.isArray(data.items) && data.items.length > 0, tag + ' items 비어있지 않은 배열');
  data.items.forEach((it, i) => {
    assert.ok(it.front != null && String(it.front).length > 0, tag + ' item[' + i + '] front');
    assert.ok(it.mean != null && String(it.mean).length > 0, tag + ' item[' + i + '] mean');
  });
  assert.ok(Array.isArray(data.quiz) && data.quiz.length > 0, tag + ' quiz 비어있지 않은 배열');
  data.quiz.forEach((q, i) => assertQuestion(q, tag + ' quiz[' + i + ']', { minChoices: 2 }));
}

test('English 뱅크: lesson 계약(items front+mean / quiz)', () => {
  assertLessonBank(loadBank('aboutEnglish'), 'EN');
});

test('Chinese 뱅크: lesson 계약(items front+mean / quiz)', () => {
  assertLessonBank(loadBank('aboutChinese'), 'ZH');
});

test('TOEIC 뱅크: quizset 계약(150문항·4지선다·Part6/7 지문)', () => {
  const data = loadBank('aboutTOEIC');
  assertCommon(data);
  assert.equal(data.kind, 'quizset');
  assert.ok(data.setSize != null, 'setSize 존재');
  assert.ok(Array.isArray(data.questions), 'questions 배열');
  assert.equal(data.questions.length, 150, '문항 정확히 150개');
  data.questions.forEach((q, i) => {
    const ctx = 'TOEIC q[' + i + ']';
    assert.ok(q.part != null, ctx + ' part 존재');
    assertQuestion(q, ctx, { choicesLen: 4 });
    if (q.part === 6 || q.part === 7) {
      assert.ok(q.passage != null && String(q.passage).length > 0,
        ctx + ' Part ' + q.part + ' 지문(passage) 존재');
    }
  });
});
