// 챕터 콘텐츠 모듈 검증: node scripts/suneung/validate-chapters.mjs scripts/suneung/content/math-1.mjs [...]
import path from "path";
import { pathToFileURL } from "url";

const REQUIRED = ["file", "unit", "title", "sub", "lead", "body", "easy", "hard", "prompt", "pairs", "questions"];
const ALLOWED = new Set(["h2", "p", "ul", "ol", "li", "b", "i", "em", "strong", "sub", "sup", "span", "div", "h3", "h4", "table", "thead", "tbody", "tr", "th", "td", "details", "summary", "br", "a", "code"]);
const VOID = new Set(["br"]);

function checkHtml(name, html, errs) {
  const st = [];
  const re = /<\/?([a-zA-Z0-9]+)([^>]*)>/g;
  let m;
  while ((m = re.exec(html))) {
    const closing = m[0][1] === "/";
    const tag = m[1].toLowerCase();
    if (!ALLOWED.has(tag)) errs.push(`${name}: 허용되지 않은 태그 <${tag}>`);
    if (VOID.has(tag)) continue;
    if (closing) {
      if (st[st.length - 1] !== tag) errs.push(`${name}: 닫는 태그 불일치 </${tag}> (열린 것: ${st.slice(-3).join(">")})`);
      else st.pop();
    } else st.push(tag);
  }
  if (st.length) errs.push(`${name}: 닫히지 않은 태그 ${st.join(",")}`);
  // 이스케이프 안 된 꺾쇠 (태그가 아닌 < )
  const stripped = html.replace(/<\/?[a-zA-Z0-9][^>]*>/g, "");
  if (/[<>]/.test(stripped)) errs.push(`${name}: 태그가 아닌 < 또는 > 가 있음 (&lt; &gt; 로 쓰세요)`);
  if (/\*\*|^#{1,3} |```/m.test(stripped)) errs.push(`${name}: 마크다운 흔적`);
}

let bad = 0;
for (const file of process.argv.slice(2)) {
  const mod = await import(pathToFileURL(path.resolve(file)).href);
  const chapters = mod.chapters;
  if (!Array.isArray(chapters) || !chapters.length) {
    console.log(`✖ ${file}: export const chapters 배열이 없음`);
    bad++;
    continue;
  }
  for (const c of chapters) {
    const errs = [];
    const tag = `${file}#${c.file || "?"}`;
    for (const k of REQUIRED.concat(["traps", "examples"])) if (c[k] == null || c[k] === "") errs.push(`${tag}: 필드 없음 ${k}`);
    if (c.file && !/^\d\d-[a-z0-9-]+\.html$/.test(c.file)) errs.push(`${tag}: file 이름 형식(01-name.html)`);
    for (const k of ["lead", "body", "traps", "examples", "easy", "hard"]) if (typeof c[k] === "string") checkHtml(`${tag}.${k}`, c[k], errs);
    if (typeof c.body === "string" && c.body.length < 4500) errs.push(`${tag}: body가 너무 짧음(${c.body.length}자, 최소 4500)`);
    if (typeof c.body === "string" && !/<h2>/.test(c.body)) errs.push(`${tag}: body에 <h2> 절 제목이 없음`);
    if (Array.isArray(c.pairs)) {
      if (c.pairs.length < 5 || c.pairs.length > 6) errs.push(`${tag}: pairs는 5~6개(현재 ${c.pairs.length})`);
      c.pairs.forEach((p, i) => {
        if (!p || typeof p.term !== "string" || typeof p.def !== "string" || !p.term || !p.def) errs.push(`${tag}: pairs[${i}] term/def 문자열 필요`);
        else if (/[<>]|&[a-z]+;/.test(p.term + p.def)) errs.push(`${tag}: pairs[${i}]에 HTML/엔티티 금지(일반 텍스트만)`);
      });
    }
    if (Array.isArray(c.questions)) {
      if (c.questions.length !== 5) errs.push(`${tag}: questions는 정확히 5개(현재 ${c.questions.length})`);
      c.questions.forEach((q, i) => {
        if (!q || typeof q.q !== "string" || !Array.isArray(q.choices) || q.choices.length !== 4) errs.push(`${tag}: questions[${i}] 형식(q, choices 4개, answer)`);
        else {
          if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) errs.push(`${tag}: questions[${i}].answer는 0~3 정수`);
          if (new Set(q.choices).size !== 4) errs.push(`${tag}: questions[${i}] 보기가 중복됨`);
          if (/[<>]|&[a-z]+;/.test(q.q + q.choices.join(""))) errs.push(`${tag}: questions[${i}]에 HTML/엔티티 금지(일반 텍스트만)`);
        }
      });
    }
    if (errs.length) {
      bad += errs.length;
      errs.forEach((e) => console.log("✖ " + e));
    } else console.log(`✔ ${tag} (${(c.body || "").length}자)`);
  }
}
if (bad) {
  console.log(`\n오류 ${bad}건`);
  process.exit(1);
}
console.log("\n모두 통과");
