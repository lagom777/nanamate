// 보기별 오답 해설(trap/<회차>-<과목>.json) 검증: 구조 + Grok 이 직접 푼 답이 공식 정답과 같은지.
// 사용: node scripts/suneung-exam/validate-trap.mjs <회차키> [과목=bio1]
import fs from 'node:fs';
const [, , key, sub = 'bio1'] = process.argv;
const root = new URL('../../public/learn/suneung-exam/', import.meta.url);
const exams = JSON.parse(fs.readFileSync(new URL('exams.json', root))).exams;
const e = exams.find((x) => x.key === key);
const file = new URL(`trap/${key}-${sub}.json`, root);
const errs = [];
if (!e || !e[sub]) { console.log('no such exam/sub'); process.exit(1); }
if (!fs.existsSync(file)) { console.log('missing file'); process.exit(1); }
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const numeric = new Set(e[sub].n || []);
e[sub].a.forEach((ans, i) => {
  const n = String(i + 1), q = d[n];
  if (!q) return errs.push(`${n}: 없음`);
  const okAns = ans === 0 ? true : Array.isArray(ans) ? ans.includes(q.ans) : q.ans === ans;
  if (!okAns) errs.push(`${n}: 푼 답 ${q.ans} ≠ 공식 ${JSON.stringify(ans)}`);
  if (numeric.has(i + 1)) return; // 단답형은 선지가 없어 ans 만 확인
  for (const k of ['1', '2', '3', '4', '5']) {
    const t = q.o && q.o[k];
    if (typeof t !== 'string' || t.trim().length < 8) errs.push(`${n}-${k}: 설명 없음/너무 짧음`);
    else if (t.length > 220) errs.push(`${n}-${k}: 너무 김(${t.length})`);
    else if (/[<>]/.test(t)) errs.push(`${n}-${k}: HTML 금지`);
  }
});
console.log(errs.length ? errs.join('\n') : `OK ${key}-${sub} (${e[sub].a.length}문항)`);
process.exit(errs.length ? 1 : 0);
