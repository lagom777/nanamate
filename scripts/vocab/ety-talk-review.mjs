// 영단어장 어원 → 읽기 문장(ety-talk.js) 전체를 뽑아 본다.
// 사용: node scripts/vocab/ety-talk-review.mjs [--from N] [--count M] [--grep 글자] [--check]
//   --check: 로마자가 남았거나 문장이 '요.'로 끝나지 않는 것만 보이고, 하나라도 있으면 종료 코드 1
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(here, '../../public/learn/aboutMyVocab');
const html = fs.readFileSync(path.join(app, 'index.html'), 'utf8');
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['themes.js', 'examples.js']) { try { vm.runInContext(fs.readFileSync(path.join(app, f), 'utf8'), ctx); } catch { /* 없는 파일은 넘어간다 */ } }
vm.runInContext(js.slice(0, js.indexOf('const DECKS = [')) + ';globalThis.__D = [YEONGILMAN, WORDMASTER];', ctx);
vm.runInContext(fs.readFileSync(path.join(app, 'ety-talk.js'), 'utf8'), ctx);

const seen = new Map();
for (const deck of ctx.__D) for (const w of deck) if (w.e && !seen.has(w.e)) seen.set(w.e, w.w);
let rows = [...seen].map(([e, w], i) => ({ i: i + 1, w, e, t: ctx.etyTalk(e) }));

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
if (arg('--grep')) rows = rows.filter((r) => r.e.includes(arg('--grep')) || r.w.includes(arg('--grep')));
const check = process.argv.includes('--check');
if (check) rows = rows.filter((r) => /[A-Za-z]/.test(r.t) || !/요\.$/.test(r.t));
const from = +(arg('--from') || 0), count = +(arg('--count') || rows.length);
for (const r of rows.slice(from, from + count)) console.log(`${r.i}. ${r.w} | ${r.e}\n   → ${r.t}`);
console.log(`(${rows.length}개${check ? ' 문제' : ''} / 전체 ${seen.size}개)`);
if (check && rows.length) process.exit(1);
