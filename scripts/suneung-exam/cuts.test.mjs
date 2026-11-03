// 풀어보기 등급컷(public/learn/suneung-exam/cuts.json, EBSi 역대 등급컷 원점수) 점검.
// 시험·과목이 exams.json 에 있고, 1~8등급 최저점이 만점 안에서 내려가며(null = 그 시험에 없는 등급),
// 국어·수학은 원점수 컷이 있는 2021학년도까지만, 과탐 8과목은 모든 시험에 있어야 한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "public", "learn", "suneung-exam");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const SCI = ["phys1", "chem1", "bio1", "earth1", "phys2", "chem2", "bio2", "earth2"];

test("등급컷: 시험·과목이 기출 목록과 맞고 1~8등급 최저점이 만점 안에서 내려간다", () => {
  const exams = Object.fromEntries(read("exams.json").exams.map((e) => [e.key, e]));
  const { cuts } = read("cuts.json");
  const errs = [];
  for (const [key, subs] of Object.entries(cuts)) {
    if (!exams[key]) { errs.push(`${key}: exams.json 에 없는 시험`); continue; }
    for (const [sub, c] of Object.entries(subs)) {
      const where = `${key} ${sub}`;
      if (!exams[key][sub]) errs.push(`${where}: 그 시험에 없는 과목`);
      if ((sub === "korean" || sub === "math") && exams[key].year >= 2022) errs.push(`${where}: 2022학년도부터는 원점수 등급컷이 없다`);
      const max = sub === "korean" || sub === "math" ? 100 : 50;
      const vals = c.filter((v) => v != null);
      if (c.length !== 8 || c[0] == null || !c.every((v) => v === null || Number.isInteger(v))) errs.push(`${where}: 8칸 정수(첫 칸은 값) ${JSON.stringify(c)}`);
      else if (!vals.every((v, i) => v > 0 && v <= max && (i === 0 || v < vals[i - 1]))) errs.push(`${where}: 만점 ${max} 안에서 내려가야 ${JSON.stringify(c)}`);
    }
  }
  for (const e of Object.values(exams)) {
    if (e.year < 2018) continue;
    const have = cuts[e.key] || {};
    const miss = SCI.filter((s) => !have[s]);
    if (miss.length) errs.push(`${e.key}: 과탐 등급컷 없음 ${miss.join(",")}`);
    if (e.year <= 2021 && !(have.korean && have.math)) errs.push(`${e.key}: 국어·수학(가형) 등급컷 없음`);
  }
  assert.deepEqual(errs, []);
});

// 2022학년도부터 국어·수학은 원점수 컷이 없어 시험 직후 입시업체 가채점 예상컷(est)을 선택과목별로 둔다(위 몇 등급만, 출처 기사 링크)
const EST = ["hwajak", "eonmae", "calc"];
test("가채점 예상컷: 2022학년도부터 국어·수학 시험마다 화작·언매·미적분이 출처와 함께 1등급부터 내려간다", () => {
  const exams = Object.fromEntries(read("exams.json").exams.map((e) => [e.key, e]));
  const { est } = read("cuts.json");
  const errs = [];
  for (const [key, subs] of Object.entries(est)) {
    if (!exams[key]) { errs.push(`${key}: exams.json 에 없는 시험`); continue; }
    if (exams[key].year < 2022) errs.push(`${key}: 2021학년도까지는 EBSi 원점수 컷(cuts)을 쓴다`);
    for (const [k, v] of Object.entries(subs)) {
      const where = `${key} ${k}`, c = v.c;
      if (!EST.includes(k)) errs.push(`${where}: 화작·언매·미적분(hwajak·eonmae·calc)만`);
      if (!Array.isArray(c) || !c.length || c.length > 8 || !c.every((x, i) => Number.isInteger(x) && x > 0 && x <= 100 && (i === 0 || x < c[i - 1]))) errs.push(`${where}: 1등급부터 내려가는 정수 ${JSON.stringify(c)}`);
      if (!v.by || !/^https:\/\//.test(v.url || "")) errs.push(`${where}: 출처(by·url) 없음`);
    }
  }
  for (const e of Object.values(exams)) {
    if (e.year < 2022) continue;
    const miss = EST.filter((k) => !(est[e.key] || {})[k]);
    if (miss.length) errs.push(`${e.key}: 예상컷 없음 ${miss.join(",")}`);
  }
  assert.deepEqual(errs, []);
});
