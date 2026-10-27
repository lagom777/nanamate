/* 영단어장 어원 읽기(aboutMyVocab/ety-talk.js) 회귀 테스트 — node --test shared/ety-talk.test.mjs
   모든 단어의 어원이 로마자·기호 없이 '…요.'로 끝나는 우리말 문장이 되는지, 대표 문장이 그대로인지 본다. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const app = new URL('../aboutMyVocab/', import.meta.url);
const read = (f) => readFileSync(new URL(f, app), 'utf8');

function load() {
  const ctx = { console };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['themes.js', 'examples.js']) { try { vm.runInContext(read(f), ctx); } catch { /* 없으면 넘어감 */ } }
  const js = [...read('index.html').matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
  vm.runInContext(js.slice(0, js.indexOf('const DECKS = [')) + ';globalThis.__D = [YEONGILMAN, WORDMASTER];', ctx);
  vm.runInContext(read('ety-talk.js'), ctx);
  return ctx;
}
const ctx = load();

test('모든 어원이 기호·로마자 없이 말하는 문장이 된다', () => {
  const bad = [];
  for (const deck of ctx.__D) for (const w of deck) {
    const t = ctx.etyTalk(w.e);
    if (!t || /[A-Za-z+/→←()~·:—↔]/.test(t) || !/요\.$/.test(t)) bad.push(`${w.w}: ${t}`);
  }
  assert.deepEqual(bad, []);
});

test('대표 문장', () => {
  assert.equal(ctx.etyTalk('re(다시) + videre(보다) → 다시 보고 고치다'), '리는 다시, 비데레는 보다. 그래서 다시 보고 고치다라는 뜻이 됐어요.');
  assert.equal(ctx.etyTalk('in(아닌) + different(다른) → 차이를 두지 않는 → 신경 안 쓰는'), '인은 아닌, 디퍼런트는 다른. 그래서 차이를 두지 않는, 나중에는 신경 안 쓰는 거라는 뜻이 됐어요.');
  assert.equal(ctx.etyTalk('dis(따로따로) + tribuere(나누어 주다)'), '디스는 따로따로, 트리부에레는 나누어 주다라는 뜻이에요.');
  assert.equal(ctx.etyTalk('sapor(맛) ← sapere(맛이 나다) → 맛을 음미하다'), '사포르는 맛이라는 뜻인데, 맛이 나다라는 뜻의 사페레에서 왔어요. 그래서 맛을 음미하다라는 뜻이 됐어요.');
});

test('라틴어 읽기', () => {
  const k = ctx.etyTalkParts.latinKo;
  assert.deepEqual(['videre', 'plicare', 'swellan', 'sequi', 'frangere', 'disciplina', 'dimm'].map(k), ['비데레', '플리카레', '스웰란', '세퀴', '프랑게레', '디스키플리나', '딤']);
});
