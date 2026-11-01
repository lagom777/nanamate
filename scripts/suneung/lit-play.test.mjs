// 국어 EBS 연계 '내용 재생기' 데이터(content/lit/*.mjs 의 PLAYS) 점검.
// 작품은 2027 수능특강 목록(ebs-2027.mjs WORKS)과 갈래·제목·작가가 같고, 독서는 READING.suteuk 의 이름·묶음과 같아야 하며, 칸 길이를 지킨다.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { WORKS, READING } from "./content/ebs-2027.mjs";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "content", "lit");
// 파일 → 갈래(독서는 READING 묶음 이름들)
const LIT_FILES = {
  "modern-novel": ["현대소설"], "classic-prose": ["고전산문"], "modern-poem": ["현대시"], "classic-poem": ["고전시가"], "drama-essay": ["극·수필"],
  "reading-1": ["독서 개념", "인문·예술", "사회·문화"], "reading-2": ["과학·기술", "주제 통합", "실전 학습"],
};
const READ = READING.suteuk.flatMap(([cat, names]) => names.split(" / ").map((n) => ({ cat, t: n.replace(/★/g, "").trim() })));
const len = (s) => [...String(s)].length;
const plain = (s) => typeof s === "string" && s.trim() === s && s.length > 0 && !/[<>]/.test(s);

function checkEntry(e, kinds, reading) {
  const err = [];
  const where = `${e && e.t}`;
  const need = (ok, msg) => { if (!ok) err.push(`${where}: ${msg}`); };
  need(plain(e.t), "t(제목) 문자열");
  if (reading) {
    need(READ.some((r) => r.t === e.t && r.cat === e.cat && kinds.includes(r.cat)), `독서 목록(${kinds.join("·")})에 없는 이름·묶음 — cat '${e.cat}'`);
  } else {
    need(plain(e.a), "a(작가) 문자열");
    need(WORKS.some((w) => /^수특/.test(w.s) && kinds.includes(w.g) && w.t === e.t && w.a === e.a), `수특 ${kinds[0]} 목록에 없는 제목·작가 '${e.a}'`);
    need(Array.isArray(e.who) && e.who.length >= 1 && e.who.length <= 5, "who 1~5명");
    (e.who || []).forEach((w) => need(Array.isArray(w) && w.length === 2 && plain(w[0]) && len(w[0]) <= 12 && plain(w[1]) && len(w[1]) <= 36, `who 항목 [이름(≤12), 설명(≤36)]: ${JSON.stringify(w)}`));
  }
  need(Array.isArray(e.steps) && e.steps.length >= 3 && e.steps.length <= 7, "steps 3~7개");
  const names = new Set((e.who || []).map((w) => w[0]));
  (e.steps || []).forEach((s, i) => {
    need(plain(s.h) && len(s.h) <= 10, `steps[${i}].h(≤10)`);
    need(plain(s.ev) && len(s.ev) >= 10 && len(s.ev) <= 100, `steps[${i}].ev(10~100자): ${len(s.ev || "")}`);
    if (reading) need(Array.isArray(s.keys) && s.keys.length >= 1 && s.keys.length <= 4 && s.keys.every((k) => plain(k) && len(k) <= 14), `steps[${i}].keys 1~4개(≤14)`);
    else {
      need(plain(s.feel) && len(s.feel) <= 8, `steps[${i}].feel(≤8)`);
      if (s.who != null) need(Array.isArray(s.who) && s.who.every((n) => names.has(n)), `steps[${i}].who 는 who 이름 중에서`);
    }
    if (s.q != null) need(plain(s.q) && len(s.q) <= 32, `steps[${i}].q(≤32)`);
  });
  need(plain(e.key) && len(e.key) <= 70, "key(≤70)");
  need(Array.isArray(e.pt) && e.pt.length >= 1 && e.pt.length <= 3 && e.pt.every((p) => plain(p) && len(p) <= 70), "pt 1~3개(각 ≤70)");
  need(plain(e.src) && len(e.src) <= 60, "src(근거 쪽, ≤60)");
  return err;
}

for (const [file, kinds] of Object.entries(LIT_FILES)) {
  const p = path.join(DIR, file + ".mjs");
  if (!fs.existsSync(p)) continue;
  test(`내용 재생기 ${file}: 목록과 맞고 칸 길이를 지킨다`, async () => {
    const { PLAYS } = await import(pathToFileURL(p).href);
    assert.ok(Array.isArray(PLAYS) && PLAYS.length > 0, "PLAYS 배열");
    const reading = file.startsWith("reading");
    const seen = new Set();
    const errs = [];
    for (const e of PLAYS) {
      const id = e.t + "|" + (e.a || e.cat);
      if (seen.has(id)) errs.push(`${e.t}: 중복`);
      seen.add(id);
      errs.push(...checkEntry(e, kinds, reading));
    }
    assert.deepEqual(errs, []);
  });
}
