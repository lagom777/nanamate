// 모션 노트: 장면마다 draw()가 오류 없이 돌고 빠진 칸·캔버스 밖 글자가 없어야 하며,
// 생성하는 과목의 motion.html 은 장면 소스(<과목>-scenes.js)를 고친 뒤 다시 만든 그대로여야 한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { LEARN } from "./lib.mjs";
import { MOTION, renderMotion } from "./build-motion.mjs";
import { checkMotion } from "./motion-smoke.mjs";

const HIST = path.join(LEARN, "aboutSuneungHistory");
const pages = [["physics1", "aboutSuneungPhysics1"], ...Object.entries(MOTION).map(([k, m]) => [k, m.folder]), ["history", "aboutSuneungHistory"]]
  .map(([k, folder]) => [k, path.join(LEARN, folder, "motion.html")])
  .concat(fs.existsSync(path.join(HIST, "motion")) ? fs.readdirSync(path.join(HIST, "motion")).filter((f) => f.endsWith(".html")).map((f) => [`history/${f}`, path.join(HIST, "motion", f)]) : [])
  .filter(([, f]) => fs.existsSync(f));

for (const [key, file] of pages) {
  test(`모션 노트 ${key}: 장면 점검`, () => {
    assert.deepEqual(checkMotion(file).problems, []);
  });
  if (MOTION[key]) test(`모션 노트 ${key}: 장면 소스와 같다`, () => {
    assert.ok(fs.readFileSync(file, "utf8") === renderMotion(key).html, `node scripts/suneung/build-motion.mjs ${key} 로 다시 만드세요`);
  });
}
