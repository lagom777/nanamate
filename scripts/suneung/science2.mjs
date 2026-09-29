// 수능 과학탐구Ⅱ(물리학Ⅱ·화학Ⅱ·생명과학Ⅱ·지구과학Ⅱ) — 개념 노트 없이 기출 풀어보기(채점)만 제공
import fs from "fs";
import path from "path";
import { LEARN, head, practicePage, stylesCss, examsOf, note, tbl } from "./lib.mjs";

const SUBS = [
  { sub: "phys2", label: "물리학Ⅱ", file: "practice-phys2.html", blurb: "역학적 상호 작용·전자기장·파동과 물질의 성질" },
  { sub: "chem2", label: "화학Ⅱ", file: "practice-chem2.html", blurb: "물질의 세 가지 상태·용액·반응 엔탈피·반응 속도·평형" },
  { sub: "bio2", label: "생명과학Ⅱ", file: "practice-bio2.html", blurb: "세포와 물질대사·유전자의 발현·생물의 진화와 다양성" },
  { sub: "earth2", label: "지구과학Ⅱ", file: "practice-earth2.html", blurb: "지구 내부와 지질·대기와 해양·천체와 우주" },
];

export const spec = {
  sub: "science2", folder: "aboutSuneungScience2", label: "수능 과학탐구Ⅱ", short: "과학탐구Ⅱ", color: "#475569",
  glow: "rgba(71,85,105,0.12)", border: "rgba(71,85,105,0.16)",
  asideSub: "수능 과학탐구Ⅱ — 물Ⅱ·화Ⅱ·생Ⅱ·지Ⅱ 기출",
  chapters: [], kind: "items", qn: 20, minutes: 30, motion: false,
};

function asideFor(active) {
  const li = (href, label, on) => `<li><a href="${href}"${on ? ' style="color:var(--accent);font-weight:600;"' : ""}>${label}</a></li>`;
  return `<aside><a href="../index.html" class="hub-back-link">↑ 통합 허브</a><h3>${spec.short} 목차</h3><ol>
${li("index.html", "표지 · 안내", active === "index")}
${SUBS.map((s) => li(s.file, `📝 ${s.label} 풀어보기`, active === s.sub)).join("\n")}
</ol></aside>`;
}

export function writeScience2() {
  const dir = path.join(LEARN, spec.folder);
  fs.mkdirSync(dir, { recursive: true });
  const N = (sub) => examsOf(sub).length;
  const cards = SUBS.map(
    (s) => `  <a class="outline-card" href="${s.file}"><div class="num">${s.sub.toUpperCase()}</div><h4>📝 ${s.label}</h4><p>${s.blurb}</p><p class="mini">실제 시험지 ${N(s.sub)}회 ${N(s.sub) * 20}문항 · 채점</p></a>`
  ).join("\n");
  const index = `${head("수능 과학탐구Ⅱ — 기출 풀어보기", 0, spec)}
<body><div class="layout">
${asideFor("index")}
<main>
<header class="paper-header">
  <h1>수능 과학탐구Ⅱ,<br><em>기출</em>로 풀어보기</h1>
  <p class="authors">물리학Ⅱ · 화학Ⅱ · 생명과학Ⅱ · 지구과학Ⅱ · 실제 시험지 그대로</p>
  <p class="affiliation">수능 2018~2026학년도 · 6월/9월 모의평가 2018~2027학년도 (2018~2021학년도는 2009 개정 교육과정)</p>
</header>
<h2>이 폴더가 제공하는 것</h2>
<p>과학탐구Ⅱ 네 과목의 <strong>실제 시험지(문항 이미지)</strong>를 시험 모드(30분·20문항)와 연습 모드로 풀고, 정답표로 <strong>채점</strong>하고, 틀린 문항을 오답 노트로 모읍니다. 과학Ⅰ(물리학Ⅰ·화학Ⅰ·생명과학Ⅰ·지구과학Ⅰ)과 달리 <strong>개념 노트와 문항별 해설은 아직 없습니다</strong> — 정답과 배점만 확인할 수 있습니다.</p>
${note("시험 구조", "과목당 20문항 · 50점 · 30분. 2점 10문항 + 3점 10문항. 그림·자료를 읽고 보기 ㄱ·ㄴ·ㄷ의 참/거짓을 가리거나 수치를 구하는 5지 선다입니다.")}
<h2>과목 선택</h2>
<div class="outline-grid">
${cards}
</div>
</main></div>
</body></html>`;
  const out = { "index.html": index, "styles.css": stylesCss(spec) };
  for (const s of SUBS) out[s.file] = practicePage(spec, { sub: s.sub, label: `수능 ${s.label}`, aside: asideFor(s.sub) });
  for (const [rel, body] of Object.entries(out)) fs.writeFileSync(path.join(dir, rel), body);
  console.log(spec.folder, Object.keys(out).length, "files");
}
