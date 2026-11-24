// 옛 묶음 폴더 aboutSuneungIntegrated(2026-11-20~24): 통합사회·통합과학이 과목 폴더(aboutSuneungIntSocial·aboutSuneungIntScience)로 나뉘어
// 예전 주소로 들어온 사람을 새 폴더로 넘겨 주는 쪽만 남긴다.
import fs from "fs";
import path from "path";
import { LEARN, BEACON } from "./lib.mjs";

const MOVED = { "index.html": "../index.html#suneung", "practice-soc.html": "../aboutSuneungIntSocial/practice.html", "practice-sci.html": "../aboutSuneungIntScience/practice.html" };

export function writeIntegratedStubs() {
  const dir = path.join(LEARN, "aboutSuneungIntegrated");
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const [file, to] of Object.entries(MOVED)) {
    fs.writeFileSync(path.join(dir, file), `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>옮겼습니다</title><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}">
${BEACON}
</head><body><p>이 쪽은 옮겼습니다. <a href="${to}">새 주소로 가기</a></p><script>location.replace(${JSON.stringify(to)} + location.hash.replace(/^#suneung$/, ""));</script></body></html>
`);
  }
  console.log("aboutSuneungIntegrated", Object.keys(MOVED).length, "stubs");
}
