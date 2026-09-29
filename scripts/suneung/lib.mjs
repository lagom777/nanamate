// 수능 과목별 노트(물리학Ⅰ · 생명과학Ⅰ) 페이지 생성 공통 도구
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const LEARN = path.resolve(HERE, "../../public/learn");
export const EXAMS = JSON.parse(fs.readFileSync(path.join(LEARN, "suneung-exam/exams.json"), "utf8")).exams;

/* ── 본문 조각 ── */
export const f = (h) => `<div class="formula">${h}</div>`;
export const note = (t, h) => `<div class="info-card"><h4>${t}</h4><p>${h}</p></div>`;
export const warn = (h) => `<div class="warning-box"><strong>함정:</strong> ${h}</div>`;
export const tip = (h) => `<div class="study-tip"><strong>TIP:</strong> ${h}</div>`;
export const tbl = (head, rows) =>
  `<div class="tbl-wrap"><table><thead><tr>${head.map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((x) => `<td>${x}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
export const ex = (q, sol) =>
  `<details class="example"><summary>${q}</summary><div class="example-sol">${sol}</div></details>`;

/* 출제 통계: 최근 회차에서 이 파트 태그가 몇 문항이었나 */
export function partStats(sub, partId) {
  const per = EXAMS.map((e) => e[sub].t.filter((t) => t === partId).length);
  const total = per.reduce((a, b) => a + b, 0);
  const pts = EXAMS.reduce((s, e) => s + e[sub].t.reduce((a, t, i) => a + (t === partId ? e[sub].p[i] : 0), 0), 0);
  return { total, exams: EXAMS.length, avg: (total / EXAMS.length).toFixed(1), avgPts: (pts / EXAMS.length).toFixed(1), min: Math.min(...per), max: Math.max(...per) };
}

/* ── 페이지 뼈대 ── */
function head(title, depth, spec) {
  const up = depth ? "../" : "";
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="${up}styles.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<link rel="stylesheet" href="${up}../shared/light-theme.css">
<script defer src="${up}../shared/i18n.js"></script>
<script defer src="${up}../shared/support.js"></script>
<script defer src="${up}../shared/search.js"></script>
<script defer src="${up}../shared/difficulty.js"></script>
<script defer src="${up}../shared/quizgame3d.js"></script>
<script defer src="${up}../shared/learngame3d.js"></script>
</head>`;
}

export function aside(spec, active, depth) {
  const up = depth ? "../" : "";
  const ch = depth ? "" : "chapters/";
  const li = (href, label, on) => `<li><a href="${href}"${on ? ' style="color:var(--accent);font-weight:600;"' : ""}>${label}</a></li>`;
  const items = [li(`${up}index.html`, "표지 · 범위와 로드맵", active === "index")];
  spec.chapters.forEach((c, i) => items.push(li(`${ch}${c.file}`, `${i + 1}. ${c.title}`, active === c.file)));
  if (spec.motion !== false) items.push(li(`${up}motion.html`, "🎬 모션 노트", active === "motion"));
  if (spec.practice !== false) items.push(li(`${up}practice.html`, "📝 수능 풀어보기", active === "practice"));
  return `<aside><a href="${up}../index.html" class="hub-back-link">↑ 통합 허브</a><h3>${spec.short} 목차</h3><ol>
${items.join("\n")}
</ol></aside>`;
}

function tabs(easy, hard) {
  return `<h2>난이도별 한 줄 정리</h2>
<div class="difficulty-tabs">
  <button class="difficulty-tab" data-target="easy">쉬움</button>
  <button class="difficulty-tab" data-target="hard">고급</button>
</div>
<div class="difficulty-content" data-level="easy">
  <span class="difficulty-badge easy">쉬움</span>
${easy}
</div>
<div class="difficulty-content" data-level="hard">
  <span class="difficulty-badge hard">고급</span>
${hard}
</div>`;
}

function games(spec, c) {
  return `<h2>직접 해보기</h2>
<p>${c.prompt}</p>
<div id="nm-game-host"></div>
<script>window.NANAMATE_GAME=${JSON.stringify({ type: "matching", color: spec.color, prompt: c.prompt, pairs: c.pairs })};</script>
<h2>개념 확인</h2>
<p>이 파트 핵심만 고르세요. 게임은 이 페이지 안에서 바로 풀립니다.</p>
<div id="nm-quiz-host"></div>
<script>window.NANAMATE_QUIZ=${JSON.stringify({ color: spec.color, questions: c.questions })};</script>`;
}

export function chapterPage(spec, c, i) {
  const st = c.part ? partStats(spec.sub, c.part) : null;
  const prev = spec.chapters[i - 1], next = spec.chapters[i + 1];
  const stat = st
    ? `<div class="stat-row"><div class="stat"><b>${st.avg}</b><span>회당 문항 수</span></div><div class="stat"><b>${st.avgPts}점</b><span>회당 배점</span></div><div class="stat"><b>${st.min}~${st.max}</b><span>회차별 범위</span></div><div class="stat"><b>${st.total}</b><span>최근 ${st.exams}회 누적</span></div></div>
<p class="stat-note">수능 2022~2026학년도 + 6·9월 모의평가 ${st.exams}회(${st.exams * 20}문항) 기준. 문항 본문 키워드로 분류한 값이라 ±1문항 오차가 있을 수 있습니다.</p>`
    : "";
  const practice = c.part
    ? `<h2>이 파트 기출 풀어보기</h2>
<p>${spec.label} 전 시험지에서 이 파트로 분류된 <strong>${st.total}문항</strong>을 실제 시험지 그대로 풀고, 채점과 해설까지 볼 수 있습니다.</p>
<p><a class="cta" href="../practice.html#part:${c.part}">📝 ${c.title} 모아 풀기 →</a></p>`
    : `<h2>실전으로 풀어보기</h2><p><a class="cta" href="../practice.html">📝 수능 풀어보기 →</a></p>`;
  const motion = c.motion
    ? `<h2>모션으로 보기</h2>
<p>이 파트의 개념을 움직이는 그림으로 다시 확인합니다.</p>
<p>${c.motion.map(([n, label]) => `<a class="cta sm" href="../motion.html#s${n}">🎬 ${label}</a>`).join(" ")}</p>`
    : "";
  const nav = `<div class="pager">${prev ? `<a href="${prev.file}">← ${prev.title}</a>` : `<a href="../index.html">← 표지</a>`}${next ? `<a href="${next.file}">${next.title} →</a>` : `<a href="../practice.html">수능 풀어보기 →</a>`}</div>`;
  return `${head(`${c.title} — ${spec.label}`, 1, spec)}
<body><div class="layout">
${aside(spec, c.file, 1)}
<main>
<header class="paper-header"><h1>${c.title}</h1><p class="authors">Part ${i + 1} · ${c.unit}</p><p class="affiliation">${c.sub}</p></header>
${stat}
${c.lead}
${c.body}
${motion}
${c.traps ? `<h2>자주 나오는 함정</h2>${c.traps}` : ""}
${c.examples ? `<h2>대표 예제</h2><p>눌러서 풀이를 펼치세요.</p>${c.examples}` : ""}
${tabs(c.easy, c.hard)}
${games(spec, c)}
${practice}
${nav}
</main></div>
</body></html>`;
}

export function indexPage(spec) {
  const cards = spec.chapters
    .map((c, i) => {
      const st = c.part ? partStats(spec.sub, c.part) : null;
      return `  <a class="outline-card" href="chapters/${c.file}"><div class="num">PART ${String(i + 1).padStart(2, "0")}</div><h4>${c.title}</h4><p>${c.sub}</p>${st ? `<p class="mini">회당 약 ${st.avg}문항 · ${st.avgPts}점</p>` : ""}</a>`;
    })
    .join("\n");
  const tot = EXAMS.length * 20;
  return `${head(`${spec.label} — 수능 노트`, 0, spec)}
<body><div class="layout">
${aside(spec, "index", 0)}
<main>
<header class="paper-header">
  <h1>${spec.h1}</h1>
  <p class="authors">${spec.authors}</p>
  <p class="affiliation">${spec.affiliation}</p>
</header>
${spec.intro}
<h2>파트별 로드맵</h2>
<div class="outline-grid">
${cards}
${spec.motion === false ? "" : `  <a class="outline-card" href="motion.html"><div class="num">MOTION</div><h4>🎬 모션 노트</h4><p>${spec.motionBlurb}</p></a>`}
${spec.practice === false ? "" : `  <a class="outline-card" href="practice.html"><div class="num">PRACTICE</div><h4>📝 수능 풀어보기</h4><p>실제 시험지 ${EXAMS.length}회 ${tot}문항 · 채점 · 해설</p></a>`}
</div>
${spec.after || ""}
</main></div>
</body></html>`;
}

export function practicePage(spec) {
  const expDir = path.join(LEARN, "suneung-exam/explain");
  const withExp = fs.existsSync(expDir)
    ? fs.readdirSync(expDir).filter((f) => f.endsWith(`-${spec.sub}.json`)).map((f) => EXAMS.find((e) => e.key === f.replace(`-${spec.sub}.json`, ""))).filter(Boolean)
    : [];
  const expNote = withExp.length
    ? `<p class="exp-note">📖 <strong>문항별 해설이 있는 시험</strong>: ${withExp.map((e) => e.title).join(", ")}. 나머지 시험은 정답·배점 채점과 관련 파트 링크가 제공되고, 해설은 순차적으로 추가합니다.</p>`
    : "";
  const parts = spec.chapters.filter((c) => c.part).map((c) => ({ id: c.part, name: c.title, href: `chapters/${c.file}` }));
  return `${head(`수능 풀어보기 — ${spec.label}`, 0, spec).replace("</head>", `<link rel="stylesheet" href="../suneung-exam/practice.css">\n</head>`)}
<body><div class="layout">
${aside(spec, "practice", 0)}
<main class="wide">
<header class="paper-header"><h1>수능 풀어보기</h1><p class="authors">${spec.label} · 실제 시험지 그대로</p><p class="affiliation">수능 2022~2026학년도 · 6월/9월 모의평가 2022~2027학년도</p></header>
<p>시험 모드는 30분 타이머로 20문항을 풀고 제출하면 한 번에 채점합니다. 연습 모드는 답을 고르는 즉시 정오와 해설이 열립니다. <strong>파트별 모아 풀기</strong>로 약한 단원만 골라 풀고, 틀린 문항은 자동으로 오답 노트에 쌓입니다.</p>
${expNote}
<div id="practice-root"></div>
</main></div>
<script>window.SUNEUNG_PRACTICE=${JSON.stringify({ subject: spec.sub, label: spec.label, base: "../suneung-exam/", parts, mount: "practice-root" })};</script>
<script src="../suneung-exam/practice.js"></script>
</body></html>`;
}

export function stylesCss(spec) {
  const base = fs.readFileSync(path.join(HERE, "base.css"), "utf8"); // 옛 aboutSuneung 스타일(다크 기본형)에서 가져온 공통 뼈대
  let css = base
    .replace(/--accent:#dc2626; --accent-glow:rgba\(220,38,38,0\.12\); --border:rgba\(220,38,38,0\.14\);/, `--accent:${spec.color}; --accent-glow:${spec.glow}; --border:${spec.border};`)
    .replace("content:'aboutSuneung'", `content:'${spec.folder}'`)
    .replace("content:'수능 이과 — 국어·미적·영어·물1·생1'", `content:'${spec.asideSub}'`);
  css += `
aside::before { font-size:1.05em !important; word-break:break-all; }
main.wide { max-width: 1180px; }
.exp-note { padding:10px 14px; border-radius:10px; background:var(--bg-elevated); border:1px solid var(--border); font-size:.9em; }
.outline-card { text-decoration:none; color:inherit; display:block; transition:transform .15s, border-color .15s; }
a.outline-card:hover { transform:translateY(-2px); border-color:var(--accent); }
.outline-card .mini { font-size:.78em; color:var(--accent); margin-top:6px; font-family:var(--font-mono); }
.stat-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:12px; margin:0 0 6px; }
.stat { padding:12px 14px; background:var(--bg-elevated); border:1px solid var(--border); border-radius:10px; text-align:center; }
.stat b { display:block; font-family:var(--font-display); font-size:1.5em; color:var(--accent); }
.stat span { font-size:.78em; color:var(--text-dim); }
.stat-note { font-size:.78em; color:var(--text-mute); margin:8px 0 30px; }
.formula { font-family:var(--font-mono); line-height:1.9; padding:14px 18px; margin:18px 0; border-radius:10px; background:var(--bg-elevated); border:1px solid var(--border); overflow-x:auto; }
.formula sub, .formula sup, td sub, td sup, p sub, p sup, li sub, li sup { font-size:.72em; }
.warning-box { padding:14px 18px; margin:18px 0; border-radius:10px; border-left:4px solid #f59e0b; background:rgba(245,158,11,.10); }
.tbl-wrap { overflow-x:auto; margin:18px 0; }
table { border-collapse:collapse; width:100%; font-size:.92em; }
th, td { border:1px solid var(--border); padding:8px 12px; text-align:left; vertical-align:top; line-height:1.55; }
th { background:var(--bg-elevated); font-family:var(--font-display); font-size:.9em; }
.cta { display:inline-block; padding:10px 18px; border-radius:10px; background:var(--accent); color:#fff !important; text-decoration:none; font-weight:600; font-size:.95em; margin:4px 6px 4px 0; }
.cta.sm { padding:7px 14px; font-size:.85em; background:transparent; color:var(--accent) !important; border:1px solid var(--accent); }
.cta:hover { filter:brightness(1.1); }
.pager { display:flex; justify-content:space-between; gap:12px; margin-top:60px; padding-top:24px; border-top:1px solid var(--border); flex-wrap:wrap; }
.pager a { color:var(--accent); text-decoration:none; font-weight:600; }
details.example { margin:14px 0; border:1px solid var(--border); border-radius:10px; background:var(--bg-card); }
details.example summary { cursor:pointer; padding:12px 16px; font-weight:600; line-height:1.6; }
.example-sol { padding:4px 18px 14px; border-top:1px dashed var(--border); }
.example-sol p { margin:10px 0; }
main h2 + ul, main h3 + ul { margin-top:4px; }
main li { color:var(--text-dim); margin-bottom:4px; line-height:1.7; }
`;
  return css;
}

export function writeAll(spec, extra = {}) {
  const dir = path.join(LEARN, spec.folder);
  const out = {};
  out["index.html"] = indexPage(spec);
  out["practice.html"] = practicePage(spec);
  out["styles.css"] = stylesCss(spec);
  spec.chapters.forEach((c, i) => (out["chapters/" + c.file] = chapterPage(spec, c, i)));
  Object.assign(out, extra);
  for (const [rel, body] of Object.entries(out)) {
    const p = path.join(dir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, body);
  }
  console.log(spec.folder, Object.keys(out).length, "files");
}
