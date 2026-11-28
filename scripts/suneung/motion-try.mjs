// 모션 노트 조각 시험: 과목의 첫 장면 파일(도구·인트로) + 조각 파일 하나만으로 임시 motion 을 만들어 점검하고, 장면마다 정지 화면을 PNG 로 찍는다.
// node scripts/suneung/motion-try.mjs <과목> <조각.js|all> [--shots <폴더>] [--only 3,4] [--t 0.5]
//   all = 과목의 장면 파일 전부. --shots 는 Chrome(headless)으로 장면의 still 시각 화면을 <폴더>/sNN.png 에 찍는다(--t 는 dur 의 비율로 다른 시각).
//   임시 파일은 과목 폴더의 motion-try-*.html 로 만들었다가 지운다(file 태그의 chapters/ 검사가 되도록 같은 폴더에).
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { LEARN } from "./lib.mjs";
import { MOTION, renderMotion } from "./build-motion.mjs";
import { checkMotion } from "./motion-smoke.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [key, frag] = process.argv.slice(2);
const opt = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
if (!MOTION[key] || !frag) { console.error("사용법: node scripts/suneung/motion-try.mjs <과목> <조각.js|all> [--shots <폴더>] [--only 3,4] [--t 0.5]"); process.exit(2); }
const all = [].concat(MOTION[key].scenes).map((f) => path.join(HERE, f));
const files = frag === "all" ? all : [all[0], path.resolve(frag)];
let { html, n } = renderMotion(key, files);
const frac = opt("--t");
if (frac != null) html = html.replace("function go(i,start){idx=(i+S.length)%S.length;t=start??(playing?0:(S[idx].still??2));", `function go(i,start){idx=(i+S.length)%S.length;t=start??(S[idx].dur*${+frac});`);
const tmp = path.join(LEARN, MOTION[key].folder, `motion-try-${path.basename(frag, ".js")}-${process.pid}.html`);
fs.writeFileSync(tmp, html);
let bad = 0;
try {
  const { scenes, problems } = checkMotion(tmp, { overlap: true });
  console.log(`${key} ${path.basename(frag)}: 장면 ${scenes}개(인트로 포함, 개념 ${n}), 문제 ${problems.length}개`);
  for (const p of problems) console.log("  " + p);
  bad = problems.length;
  const dir = opt("--shots");
  if (dir) {
    fs.mkdirSync(dir, { recursive: true });
    const only = (opt("--only") || "").split(",").filter(Boolean).map(Number);
    const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    for (let i = 0; i < scenes; i++) {
      if (only.length && !only.includes(i)) continue;
      const out = path.join(dir, `s${String(i).padStart(2, "0")}.png`);
      execFileSync(CHROME, ["--headless=new", "--force-prefers-reduced-motion", "--hide-scrollbars", "--window-size=1100,700", "--virtual-time-budget=2500", `--screenshot=${out}`, `file://${tmp}?embed&only=${i}`], { stdio: "ignore" });
      console.log("  shot", out);
    }
  }
} finally { fs.unlinkSync(tmp); }
process.exitCode = bad ? 1 : 0;
