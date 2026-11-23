// 수능 사회탐구 9과목 — 개념 노트 없이 기출 풀어보기(채점)만 제공(2022학년도~)
import fs from "fs";
import path from "path";
import { LEARN, head, practicePage, stylesCss, examsOf, note } from "./lib.mjs";

const SUBS = [
  { sub: "lifeeth", label: "생활과 윤리", file: "practice-lifeeth.html", blurb: "생명·사회·과학·문화·평화 윤리 등 현대 생활의 응용 윤리" },
  { sub: "ethth", label: "윤리와 사상", file: "practice-ethth.html", blurb: "동양·한국 윤리 사상, 서양 윤리 사상, 사회사상" },
  { sub: "kgeo", label: "한국지리", file: "practice-kgeo.html", blurb: "국토 인식·지형·기후·인구·산업·지역" },
  { sub: "wgeo", label: "세계지리", file: "practice-wgeo.html", blurb: "자연환경·문화권·지역별 특성과 세계화" },
  { sub: "eahist", label: "동아시아사", file: "practice-eahist.html", blurb: "선사부터 현대까지 동아시아의 교류와 갈등" },
  { sub: "whist", label: "세계사", file: "practice-whist.html", blurb: "고대 문명부터 현대 세계까지" },
  { sub: "econ", label: "경제", file: "practice-econ.html", blurb: "경제 원리·시장·국가 경제·국제 경제" },
  { sub: "pol", label: "정치와 법", file: "practice-pol.html", blurb: "민주주의·헌법·정치 과정·개인 생활과 법·국제 관계" },
  { sub: "soc", label: "사회·문화", file: "practice-soc.html", blurb: "사회·문화 현상 탐구, 사회 구조·문화·계층·변동" },
];

export const spec = {
  sub: "social", folder: "aboutSuneungSocial", label: "수능 사회탐구", short: "사회탐구", color: "#c2410c",
  glow: "rgba(194,65,12,0.12)", border: "rgba(194,65,12,0.16)",
  asideSub: "수능 사회탐구 — 9과목 기출",
  chapters: [], kind: "items", qn: 20, minutes: 30, motion: false,
};

function asideFor(active) {
  const li = (href, label, on) => `<li><a href="${href}"${on ? ' style="color:var(--accent);font-weight:600;"' : ""}>${label}</a></li>`;
  return `<aside><a href="../index.html" class="hub-back-link">↑ 통합 허브</a><a href="../my-style.html" class="hub-back-link my-style-link">🙋 내 성향</a><h3>${spec.short} 목차</h3><ol>
${li("index.html", "표지 · 안내", active === "index")}
${SUBS.map((s) => li(s.file, `📝 ${s.label} 풀어보기`, active === s.sub)).join("\n")}
</ol></aside>`;
}

export function writeSocial() {
  const dir = path.join(LEARN, spec.folder);
  fs.mkdirSync(dir, { recursive: true });
  const N = (sub) => examsOf(sub).length;
  const ys = examsOf(SUBS[0].sub).map((e) => e.year), nEx = examsOf(SUBS[0].sub).length;
  const titles = `수능·6월/9월 모의평가 ${Math.min(...ys)}~${Math.max(...ys)}학년도 · ${nEx}회`;
  const cards = SUBS.map(
    (s, i) => `  <a class="outline-card" href="${s.file}"><div class="num">${String(i + 1).padStart(2, "0")}</div><h4>📝 ${s.label}</h4><p>${s.blurb}</p><p class="mini">실제 시험지 ${N(s.sub)}회 ${N(s.sub) * 20}문항 · 채점</p></a>`
  ).join("\n");
  const index = `${head("수능 사회탐구 — 기출 풀어보기", 0, spec)}
<body><div class="layout">
${asideFor("index")}
<main>
<header class="paper-header">
  <h1>수능 사회탐구,<br><em>기출</em>로 풀어보기</h1>
  <p class="authors">${SUBS.map((s) => s.label).join(" · ")} · 실제 시험지 그대로</p>
  <p class="affiliation">${titles}</p>
</header>
<h2>이 폴더가 제공하는 것</h2>
<p>사회탐구 아홉 과목의 <strong>실제 시험지(문항 이미지)</strong>를 시험 모드(30분·20문항)와 연습 모드로 풀고, 정답표로 <strong>채점</strong>하고, 틀린 문항을 오답 노트로 모읍니다. <strong>개념 노트와 문항별 해설은 없고</strong> 정답과 배점만 확인할 수 있습니다. 2015 개정 교육과정 선택과목 체제인 <strong>2022학년도부터</strong>의 수능과 6월·9월 모의평가가 들어 있습니다. 정치와 법·사회·문화 등의 묶음 문항(“[14~15] 다음 자료를 보고…”)은 두 문항 모두에 공통 자료를 붙여 보여 줍니다.</p>
${note("시험 구조", "과목당 20문항 · 50점 · 30분. 2점 10문항 + 3점 10문항. 자료·지도·그래프를 읽고 옳은 설명을 고르거나 보기 ㄱ·ㄴ·ㄷ·ㄹ을 가리는 5지 선다입니다.")}
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
