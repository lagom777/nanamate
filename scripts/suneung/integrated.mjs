// 2028학년도 수능(2027년 11월 시행)부터의 탐구: 통합사회·통합과학 — 평가원 예시문항 풀어보기(채점)
// 시험 형식·출제 범위는 평가원 「2028학년도 대학수학능력시험 예시문항 안내」(2025-04-15)에서 옮겼다.
import fs from "fs";
import path from "path";
import { LEARN, head, practicePage, stylesCss, examsOf, note, tbl } from "./lib.mjs";

const SUBS = [
  { sub: "intsoc", label: "통합사회", file: "practice-soc.html", blurb: "통합사회1·2 — 행복·자연환경·문화·생활공간, 인권·정의·시장·세계화·미래" },
  { sub: "intsci", label: "통합과학", file: "practice-sci.html", blurb: "통합과학1·2 — 과학의 기초·물질과 규칙성·시스템, 변화와 다양성·환경과 에너지·미래 사회" },
];

export const spec = {
  sub: "integrated", folder: "aboutSuneungIntegrated", label: "수능 통합사회·통합과학", short: "통합사회·통합과학", color: "#0f766e",
  glow: "rgba(15,118,110,0.12)", border: "rgba(15,118,110,0.16)",
  asideSub: "2028 수능 대비 — 통합사회·통합과학",
  chapters: [], kind: "items", qn: 25, minutes: 40, motion: false,
};

function asideFor(active) {
  const li = (href, label, on) => `<li><a href="${href}"${on ? ' style="color:var(--accent);font-weight:600;"' : ""}>${label}</a></li>`;
  return `<aside><a href="../index.html" class="hub-back-link">↑ 통합 허브</a><a href="../my-style.html" class="hub-back-link my-style-link">🙋 내 성향</a><h3>${spec.short} 목차</h3><ol>
${li("index.html", "표지 · 2028 수능 안내", active === "index")}
${SUBS.map((s) => li(s.file, `📝 ${s.label} 풀어보기`, active === s.sub)).join("\n")}
</ol></aside>`;
}

export function writeIntegrated() {
  const dir = path.join(LEARN, spec.folder);
  fs.mkdirSync(dir, { recursive: true });
  const N = (sub) => examsOf(sub).length;
  const cards = SUBS.map(
    (s, i) => `  <a class="outline-card" href="${s.file}"><div class="num">${String(i + 1).padStart(2, "0")}</div><h4>📝 ${s.label}</h4><p>${s.blurb}</p><p class="mini">평가원 예시문항 ${N(s.sub)}회 ${N(s.sub) * spec.qn}문항 · 채점</p></a>`
  ).join("\n");
  const index = `${head("수능 통합사회·통합과학 — 2028 수능 대비", 0, spec)}
<body><div class="layout">
${asideFor("index")}
<main>
<header class="paper-header">
  <h1>통합사회·통합과학,<br><em>2028 수능</em> 대비</h1>
  <p class="authors">${SUBS.map((s) => s.label).join(" · ")} · 평가원 예시문항 그대로</p>
  <p class="affiliation">2028학년도 수능(2027년 11월 시행)부터 · 과목당 25문항 · 40분 · 50점</p>
</header>
<h2>무엇이 바뀌나</h2>
<p>2028학년도 수능부터 탐구 영역은 선택과목이 없어지고, <strong>모든 수험생이 통합사회와 통합과학을 둘 다</strong> 봅니다. 지금까지는 사회·과학탐구 17과목 가운데 두 과목을 골랐지만, 이제는 같은 문제지를 풉니다. 시험 시간과 점수는 두 과목이 따로입니다.</p>
${tbl(["", "2027학년도 수능까지", "2028학년도 수능부터"], [
    ["응시 과목", "사회·과학탐구 17과목 중 최대 2과목 선택", "<strong>통합사회 + 통합과학</strong> 공통 응시"],
    ["문항 수 · 시간", "과목당 20문항 · 30분", "과목당 <strong>25문항 · 40분</strong>"],
    ["배점", "2점 · 3점 (50점 만점)", "<strong>1.5점 · 2점 · 2.5점</strong> (50점 만점, 예시문항 기준)"],
    ["4교시 시간표(안)", "한국사 → 탐구 2과목 (16:37 종료)", "한국사 → 통합사회 15:35~16:15 → 통합과학 16:30~17:10"],
    ["성적 표기", "표준점수 · 백분위 · 등급", "같음 (상대평가)"],
  ])}
<p class="mini">출처: 한국교육과정평가원 「2028학년도 대학수학능력시험 예시문항 안내」(2025년 4월). 시간표는 ‘안’이어서 시행 계획 발표 때 달라질 수 있습니다.</p>
<h2>출제 범위</h2>
<p>두 과목 모두 고등학교 1학년 때 배우는 <strong>2022 개정 교육과정</strong> 과목입니다. 통합사회는 통합사회1·2, 통합과학은 통합과학1·2에서 나옵니다.</p>
${tbl(["과목", "영역"], [
    ["통합사회1", "통합적 관점 · 인간, 사회, 환경과 행복 · 자연환경과 인간 · 문화와 다양성 · 생활공간과 사회"],
    ["통합사회2", "인권보장과 헌법 · 사회정의와 불평등 · 시장경제와 지속가능발전 · 세계화와 평화 · 미래와 지속가능한 삶"],
    ["통합과학1", "과학의 기초(기본량과 단위, 측정과 어림, 정보와 신호) · 물질과 규칙성(원소 형성, 주기성, 이온·공유 결합, 물질의 전기적 성질) · 시스템과 상호작용(지구시스템, 판구조론, 중력장 내의 운동, 충격량과 운동량, 세포, 물질대사, 유전자와 단백질)"],
    ["통합과학2", "변화와 다양성(지질시대, 자연선택, 생물다양성, 산화와 환원, 산·염기와 중화) · 환경과 에너지(생태계, 대기와 해양, 지구온난화, 핵융합, 발전, 에너지 전환) · 과학과 미래 사회(감염병, 인공지능, 로봇, 과학기술과 윤리)"],
  ])}
${note("문항의 특징", "한 문항에 여러 분야가 섞입니다. 통합사회는 윤리·지리·역사·일반사회의 관점을 한 자료에서 함께 묻고, 통합과학은 물리·화학·생명과학·지구과학 개념을 실험과 자료 해석으로 엮어 묻습니다. 지도·그래프·표·대화 같은 자료를 읽는 문항이 대부분입니다.")}
<h2>이 폴더가 제공하는 것</h2>
<p>평가원이 공개한 <strong>2028학년도 수능 예시문항 문제지</strong>(과목당 25문항)를 시험 모드(40분)와 연습 모드로 풀고, 정답표로 <strong>채점</strong>하고, 틀린 문항을 오답 노트로 모읍니다. 평가원이 2028학년도 수능의 문항 수와 시험 시간에 맞춰 만든 문제지입니다.</p>
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
