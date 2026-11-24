// 지난 수능 복습 — 2027학년도 수능까지의 선택과목 시험(풀이 기록·오답 복습용). 지금 수능 과목이 아니라 메뉴에는 이 묶음 하나로만 둔다.
import fs from "fs";
import path from "path";
import { LEARN, head, practicePage, stylesCss, examsOf } from "./lib.mjs";

// 이 폴더에서 직접 만드는 풀어보기(수학 옛 구성). 과목 키 math 는 공통 + 미적분(2021학년도까지는 가형), mathgeo 는 공통 + 기하
const MATH = [
  { sub: "math", label: "수학 (공통 + 미적분)", file: "practice-math.html", qn: 30, minutes: 100 },
  { sub: "mathgeo", label: "수학 (공통 + 기하)", file: "practice-mathgeo.html", qn: 30, minutes: 100 },
];
// 폴더가 따로 있는 예전 선택과목
const LINKS = [
  ["과학탐구Ⅰ", [["물리학Ⅰ", "../aboutSuneungPhysics1/practice.html", "phys1"], ["화학Ⅰ", "../aboutSuneungChem1/practice.html", "chem1"], ["생명과학Ⅰ", "../aboutSuneungBio1/practice.html", "bio1"], ["지구과학Ⅰ", "../aboutSuneungEarth1/practice.html", "earth1"]]],
  ["과학탐구Ⅱ", [["물리학Ⅱ", "../aboutSuneungScience2/practice-phys2.html", "phys2"], ["화학Ⅱ", "../aboutSuneungScience2/practice-chem2.html", "chem2"], ["생명과학Ⅱ", "../aboutSuneungScience2/practice-bio2.html", "bio2"], ["지구과학Ⅱ", "../aboutSuneungScience2/practice-earth2.html", "earth2"]]],
  ["사회탐구", [["생활과 윤리", "../aboutSuneungSocial/practice-lifeeth.html", "lifeeth"], ["윤리와 사상", "../aboutSuneungSocial/practice-ethth.html", "ethth"], ["한국지리", "../aboutSuneungSocial/practice-kgeo.html", "kgeo"], ["세계지리", "../aboutSuneungSocial/practice-wgeo.html", "wgeo"], ["동아시아사", "../aboutSuneungSocial/practice-eahist.html", "eahist"], ["세계사", "../aboutSuneungSocial/practice-whist.html", "whist"], ["경제", "../aboutSuneungSocial/practice-econ.html", "econ"], ["정치와 법", "../aboutSuneungSocial/practice-pol.html", "pol"], ["사회·문화", "../aboutSuneungSocial/practice-soc.html", "soc"]]],
];

export const spec = {
  sub: "archive", folder: "aboutSuneungArchive", label: "지난 수능 복습", short: "지난 수능 복습", color: "#64748b",
  glow: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.16)",
  asideSub: "2027학년도 수능까지의 선택과목 시험",
  chapters: [], kind: "items", qn: 30, minutes: 100, motion: false,
};

function asideFor(active) {
  const li = (href, label, on) => `<li><a href="${href}"${on ? ' style="color:var(--accent);font-weight:600;"' : ""}>${label}</a></li>`;
  return `<aside><a href="../index.html" class="hub-back-link">↑ 통합 허브</a><a href="../my-style.html" class="hub-back-link my-style-link">🙋 내 성향</a><h3>${spec.short}</h3><ol>
${li("index.html", "과목 고르기", active === "index")}
${MATH.map((s) => li(s.file, `📝 ${s.label}`, active === s.sub)).join("\n")}
</ol></aside>`;
}

export function writeArchive() {
  const dir = path.join(LEARN, spec.folder);
  fs.mkdirSync(dir, { recursive: true });
  const card = (label, href, sub) => `  <a class="outline-card" href="${href}"><h4>📝 ${label}</h4><p class="mini">시험 ${examsOf(sub).length}회 · 내 풀이 기록·오답 그대로</p></a>`;
  const index = `${head("지난 수능 복습", 0, spec)}
<body><div class="layout">
${asideFor("index")}
<main>
<header class="paper-header">
  <h1>지난 수능,<br><em>틀린 것</em> 복습하기</h1>
  <p class="authors">2027학년도 수능까지의 선택과목 시험 · 문제지·정답·내 풀이 기록 그대로</p>
  <p class="affiliation">지금 수능 과목(국어·수학·영어·한국사·통합사회·통합과학)은 첫 화면에 있습니다</p>
</header>
<p>예전에 푼 시험의 <strong>내 답·오답 노트·메모</strong>는 그대로 남아 있습니다. 과목을 골라 들어가면 시험마다 채점 결과와 틀린 문항을 다시 볼 수 있습니다. 국어·영어·한국사는 과목이 그대로라 첫 화면의 풀어보기에서 지난 시험을 봅니다.</p>
<h2>수학</h2>
<div class="outline-grid">
${MATH.map((s) => card(s.label, s.file, s.sub)).join("\n")}
</div>
${LINKS.map(([g, list]) => `<h2>${g}</h2>\n<div class="outline-grid">\n${list.map(([l, h, s]) => card(l, h, s)).join("\n")}\n</div>`).join("\n")}
</main></div>
</body></html>`;
  const out = { "index.html": index, "styles.css": stylesCss(spec) };
  for (const s of MATH) out[s.file] = practicePage({ ...spec, qn: s.qn, minutes: s.minutes }, { sub: s.sub, label: `수능 ${s.label}`, aside: asideFor(s.sub) });
  for (const [rel, body] of Object.entries(out)) fs.writeFileSync(path.join(dir, rel), body);
  console.log(spec.folder, Object.keys(out).length, "files");
}
