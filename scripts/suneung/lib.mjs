// 수능 과목별 노트(물리학Ⅰ · 생명과학Ⅰ) 페이지 생성 공통 도구
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { mapHtml, mapCss } from "./map.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const LEARN = path.resolve(HERE, "../../public/learn");
// 문항·시험지 이미지는 저장소 대신 Cloudflare R2(공개 r2.dev)에서 불러온다. exams.json·해설·meta.json 은 사이트에 그대로 둔다.
export const IMG_BASE = "https://pub-920d78ae5be2443d84da6b3e8a54a5af.r2.dev/";
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

/* 과목별 시험 목록(그 과목 데이터가 있는 회차만) */
export const examsOf = (sub) => EXAMS.filter((e) => e[sub]);

/* 출제 통계: 최근 회차에서 이 파트 태그가 몇 문항이었나 */
export function partStats(sub, partId) {
  const ex = examsOf(sub).filter((e) => e[sub].t);
  const per = ex.map((e) => e[sub].t.filter((t) => t === partId).length);
  const total = per.reduce((a, b) => a + b, 0);
  const pts = ex.reduce((s, e) => s + e[sub].t.reduce((a, t, i) => a + (t === partId ? e[sub].p[i] : 0), 0), 0);
  return { total, exams: ex.length, avg: (total / ex.length).toFixed(1), avgPts: (pts / ex.length).toFixed(1), min: Math.min(...per), max: Math.max(...per) };
}

/* ── 페이지 뼈대 ── */
export function head(title, depth, spec) {
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
  let lastGroup = null;
  spec.chapters.forEach((c, i) => {
    if (c.group && c.group !== lastGroup) { items.push(`<li class="grp">${c.group}</li>`); lastGroup = c.group; }
    items.push(li(`${ch}${c.file}`, `${i + 1}. ${c.title}`, active === c.file));
  });
  if (spec.motion !== false) items.push(li(`${up}motion.html`, "🎬 모션 노트", active === "motion"));
  if (spec.summary) items.push(li(`${up}summary.html`, "📌 한눈에 요약", active === "summary"));
  if (spec.practice !== false) items.push(li(`${up}practice.html`, "📝 수능 풀어보기", active === "practice"));
  (spec.extraLinks || []).forEach((x) => items.push(li(`${up}${x.href}`, x.label, false)));
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

/* 퀴즈 정답 위치가 한쪽으로 몰리지 않게 보기 순서를 결정적으로 돌린다 */
function spreadAnswers(questions, salt) {
  return questions.map((q, qi) => {
    const right = q.choices[q.answer];
    const others = q.choices.filter((_, i) => i !== q.answer);
    const target = (qi * 3 + salt) % 4;
    const choices = others.slice();
    choices.splice(target, 0, right);
    return { ...q, choices, answer: target };
  });
}

function games(spec, c, salt = 0) {
  return `<h2>직접 해보기</h2>
<p>${c.prompt}</p>
<div id="nm-game-host"></div>
<script>window.NANAMATE_GAME=${JSON.stringify({ type: "matching", color: spec.color, prompt: c.prompt, pairs: c.pairs })};</script>
<h2>개념 확인</h2>
<p>이 파트 핵심만 고르세요. 게임은 이 페이지 안에서 바로 풀립니다.</p>
<div id="nm-quiz-host"></div>
<script>window.NANAMATE_QUIZ=${JSON.stringify({ color: spec.color, questions: spreadAnswers(c.questions, salt) })};</script>`;
}

export function chapterPage(spec, c, i) {
  const st = c.part ? partStats(spec.sub, c.part) : null;
  const prev = spec.chapters[i - 1], next = spec.chapters[i + 1];
  const stat = st
    ? `<div class="stat-row"><div class="stat"><b>${st.avg}</b><span>회당 문항 수</span></div><div class="stat"><b>${st.avgPts}점</b><span>회당 배점</span></div><div class="stat"><b>${st.min}~${st.max}</b><span>회차별 범위</span></div><div class="stat"><b>${st.total}</b><span>최근 ${st.exams}회 누적</span></div></div>
<p class="stat-note">수능 2018~2026학년도 + 6·9월 모의평가 ${st.exams}회(2018~2021학년도는 구 교육과정)(${st.exams * (spec.qn || 20)}문항) 기준. 문항 본문 키워드로 분류한 값이라 ±1문항 오차가 있을 수 있습니다.</p>`
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
  const sumCta = spec.summary ? `<p><a class="cta sm" href="../summary.html#p${i + 1}">📌 이 파트 한눈에 요약 →</a></p>` : "";
  const nav = `<div class="pager">${prev ? `<a href="${prev.file}">← ${prev.title}</a>` : `<a href="../index.html">← 표지</a>`}${next ? `<a href="${next.file}">${next.title} →</a>` : `<a href="../practice.html">수능 풀어보기 →</a>`}</div>`;
  return `${head(`${c.title} — ${spec.label}`, 1, spec)}
<body><div class="layout">
${aside(spec, c.file, 1)}
<main>
<header class="paper-header"><h1>${c.title}</h1><p class="authors">Part ${i + 1} · ${c.unit}</p><p class="affiliation">${c.sub}</p></header>
${stat}
${c.lead}
${spec.maps ? `<details class="mg-wrap" open><summary>📌 이 파트 한눈에 요약 맵</summary>${mapOf(spec, i)}</details>` : ""}
${sumCta}
${c.body}
${motion}
${c.traps ? `<h2>자주 나오는 함정</h2>${c.traps}` : ""}
${c.examples ? `<h2>대표 예제</h2><p>눌러서 풀이를 펼치세요.</p>${c.examples}` : ""}
${tabs(c.easy, c.hard)}
${games(spec, c, i)}
${practice}
${nav}
</main></div>
</body></html>`;
}

export function indexPage(spec) {
  const card = (c, i) => {
    const st = c.part ? partStats(spec.sub, c.part) : null;
    return `  <a class="outline-card" href="chapters/${c.file}"><div class="num">PART ${String(i + 1).padStart(2, "0")}</div><h4>${c.title}</h4><p>${c.sub}</p>${st ? `<p class="mini">회당 약 ${st.avg}문항 · ${st.avgPts}점</p>` : ""}</a>`;
  };
  const extraCards = `${spec.motion === false ? "" : `  <a class="outline-card" href="motion.html"><div class="num">MOTION</div><h4>🎬 모션 노트</h4><p>${spec.motionBlurb}</p></a>`}
${spec.summary ? `  <a class="outline-card" href="summary.html"><div class="num">SUMMARY</div><h4>📌 한눈에 요약</h4><p>${spec.summaryBlurb}</p></a>` : ""}
${spec.practice === false ? "" : `  <a class="outline-card" href="practice.html"><div class="num">PRACTICE</div><h4>📝 수능 풀어보기</h4><p>${spec.practiceBlurb || `실제 시험지 ${examsOf(spec.sub).length}회 ${examsOf(spec.sub).length * (spec.qn || 20)}문항 · 채점 · 해설`}</p></a>`}
${(spec.extraLinks || []).map((x) => `  <a class="outline-card" href="${x.href}"><div class="num">${x.num}</div><h4>${x.label}</h4><p>${x.blurb}</p></a>`).join("\n")}`;
  let roadmap;
  if (spec.chapters.some((c) => c.group)) {
    const groups = [];
    spec.chapters.forEach((c, i) => {
      let g = groups[groups.length - 1];
      if (!g || g.name !== c.group) groups.push((g = { name: c.group, cards: [] }));
      g.cards.push(card(c, i));
    });
    roadmap = groups.map((g, gi) => `<h3 class="grp-h">${g.name}</h3>\n<div class="outline-grid">\n${g.cards.join("\n")}${gi === groups.length - 1 ? "\n" + extraCards : ""}\n</div>`).join("\n");
  } else {
    roadmap = `<div class="outline-grid">\n${spec.chapters.map(card).join("\n")}\n${extraCards}\n</div>`;
  }
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
${roadmap}
${spec.after || ""}
</main></div>
</body></html>`;
}

export function practicePage(spec, o = {}) {
  const sub = o.sub || spec.sub, label = o.label || spec.label;
  const kind = spec.kind || "items", qn = spec.qn || 20, minutes = spec.minutes || 30;
  const ex = examsOf(sub);
  const expDir = path.join(LEARN, "suneung-exam/explain");
  const withExp = fs.existsSync(expDir)
    ? fs.readdirSync(expDir).filter((f) => f.endsWith(`-${sub}.json`)).map((f) => EXAMS.find((e) => e.key === f.replace(`-${sub}.json`, ""))).filter(Boolean)
    : [];
  const expNote = withExp.length
    ? `<p class="exp-note">📖 <strong>문항별 해설이 있는 시험</strong> ${withExp.length}회: ${withExp.map((e) => e.title).join(", ")}. 나머지 시험(과 해설을 싣지 못한 문항)은 정답·배점 채점${spec.chapters.length ? "과 관련 파트 링크" : ""}가 제공됩니다. 해설은 AI가 문항 이미지를 풀어 쓰고 공식 정답과 일치하는 것만 실었지만, 풀이 과정에 오류가 있을 수 있으니 참고용으로 보세요.</p>`
    : "";
  const parts = spec.chapters.filter((c) => c.part).map((c) => ({ id: c.part, name: c.title, href: `chapters/${c.file}` }));
  const numeric = sub === "math" ? " 단답형(16~22번·29~30번)은 답을 숫자로 직접 입력합니다." : "";
  const lead = kind === "paper"
    ? `<p>시험지를 <strong>단(段) 단위 이미지</strong>로 그대로 보여 주고, 오른쪽 답안지에 답을 표시합니다. 시험 모드는 ${minutes}분 타이머로 ${sub === "korean" ? "공통 34문항 + 선택 11문항" : "45문항"}을 풀고 제출하면 채점합니다. 연습 모드는 답을 고르는 즉시 정오가 표시됩니다.${sub === "korean" ? " 선택과목(화법과 작문 / 언어와 매체)을 골라 풀 수 있습니다." : " 듣기 음성은 제공하지 않아 채점 후 대본으로 확인합니다."}</p>`
    : `<p>시험 모드는 ${minutes}분 타이머로 ${qn}문항을 풀고 제출하면 한 번에 채점합니다. 연습 모드는 답을 고르는 즉시 정오${withExp.length ? "와 해설" : ""}가 열립니다.${numeric}${parts.length ? " <strong>파트별 모아 풀기</strong>로 약한 단원만 골라 풀고, " : " "}틀린 문항은 자동으로 오답 노트에 쌓입니다.</p>`;
  const years = `수능 2018~2026학년도 · 6월/9월 모의평가 2018~2027학년도 · 총 ${ex.length}회`;
  return `${head(`수능 풀어보기 — ${label}`, 0, spec).replace("</head>", `<link rel="stylesheet" href="../suneung-exam/practice.css">\n</head>`)}
<body><div class="layout">
${o.aside || aside(spec, "practice", 0)}
<main class="wide">
<header class="paper-header"><h1>수능 풀어보기</h1><p class="authors">${label} · 실제 시험지 그대로</p><p class="affiliation">${years}</p></header>
${lead}
${expNote}
<div id="practice-root"></div>
</main></div>
<script>window.SUNEUNG_PRACTICE=${JSON.stringify({ subject: sub, label, base: "../suneung-exam/", imgBase: IMG_BASE, parts, mount: "practice-root", kind, qn, minutes })};</script>
<script src="../suneung-exam/practice.js"></script>
</body></html>`;
}

/* 한눈에 요약 맵(spec.maps[i])을 HTML로. 출제 비중 막대·회당 문항 수는 실제 시험 데이터에서 계산한다. */
function mapOf(spec, i) {
  const m = spec.maps?.[i];
  if (!m) return "";
  const c = spec.chapters[i];
  const st = c.part ? partStats(spec.sub, c.part) : null;
  const weights = spec.chapters.filter((x) => x.part).map((x) => ({ title: x.title, ...partStats(spec.sub, x.part) }));
  return mapHtml(m, { weights, stat: st ? `회당 평균 ${st.avg}문항 · ${st.avgPts}점` : "" });
}

/* 챕터 본문에서 공식 상자·표만 뽑아 파트별 요약 시트를 만든다(새로 쓰는 내용 없이 본문 그대로). */
function sheetOf(c) {
  const re = /<h2>([\s\S]*?)<\/h2>|<h3>([\s\S]*?)<\/h3>|(<div class="formula">[\s\S]*?<\/div>)|(<div class="tbl-wrap">[\s\S]*?<\/div>)/g;
  const secs = [];
  let sec = null, label = "", m;
  while ((m = re.exec(c.body))) {
    if (m[1] != null) { sec = { title: m[1].replace(/^\d+\.\s*/, ""), blocks: [] }; secs.push(sec); label = ""; }
    else if (m[2] != null) label = m[2];
    else if (sec) { sec.blocks.push((label ? `<h4>${label}</h4>` : "") + (m[3] || m[4])); label = ""; }
  }
  return secs.filter((x) => x.blocks.length);
}

export function summaryPage(spec) {
  const chips = spec.chapters.map((c, i) => `<a href="#p${i + 1}">${i + 1}. ${c.title}</a>`).join("") + (spec.imageMaps ? `<a href="#img-maps">🗺️ 이미지 요약 맵</a>` : "");
  const gallery = spec.imageMaps
    ? `<section class="sum-part" id="img-maps">
<h2>🗺️ 이미지 요약 맵 ${spec.imageMaps.length}장</h2>
<p class="sum-sub">카드를 누르면 큰 이미지가 열리고, 아래 링크로 가까운 파트 노트로 이동합니다.</p>
<div class="mg-gallery">${spec.imageMaps
        .map((m, i) => `<div class="mg-gcard"><a href="${m.img}" target="_blank" rel="noopener" title="새 탭에서 크게 보기"><img src="${m.img}" alt="${m.title}" loading="lazy"></a><div class="gi"><div class="gp">MAP ${String(i + 1).padStart(2, "0")}</div><div class="gt">${m.title}</div><div class="gd">${m.desc}</div><a class="cta sm" href="chapters/${m.chapter}">관련 파트 노트 →</a></div></div>`)
        .join("")}</div>
</section>`
    : "";
  const parts = spec.chapters.map((c, i) => {
    // 본문 표 안의 파트 링크(같은 chapters/ 폴더 기준)는 요약 페이지(상위 폴더)에서 쓰도록 경로를 고친다.
    const secs = sheetOf(c).map((x) => `<div class="sum-sec"><h3>${x.title}</h3>${x.blocks.join("").replace(/href="(?!https?:|#|\/|chapters\/)([^"]+)"/g, 'href="chapters/$1"')}</div>`).join("\n");
    const traps = c.traps ? `<div class="sum-traps"><h3>⚠ 자주 걸리는 함정</h3>${c.traps}</div>` : "";
    const terms = c.pairs?.length ? `<div class="sum-sec"><h3>핵심 용어</h3>${tbl(["용어", "뜻"], c.pairs.map((p) => [p.term, p.def]))}</div>` : "";
    const map = spec.maps ? mapOf(spec, i) : "";
    const sheet = `${secs}\n${terms}\n${traps}`;
    return `<section class="sum-part" id="p${i + 1}">
<h2>Part ${i + 1} · ${c.title}</h2>
<p class="sum-sub">${c.unit} · ${c.sub}</p>
${map ? `${map}\n<details class="mg-wrap"><summary>📋 본문에서 뽑은 공식·표 시트 펼치기</summary>${sheet}</details>` : sheet}
<p><a class="cta sm" href="chapters/${c.file}">이 파트 자세히 보기 →</a>${c.part ? ` <a class="cta sm" href="practice.html#part:${c.part}">📝 기출 풀기</a>` : ""}</p>
</section>`;
  }).join("\n");
  return `${head(`한눈에 요약 — ${spec.label}`, 0, spec)}
<body class="sumpage"><div class="layout">
${aside(spec, "summary", 0)}
<main>
<header class="paper-header"><h1>한눈에 요약</h1><p class="authors">${spec.label} · 파트별 핵심 공식·그림·함정을 카드 한 장씩에 모았습니다</p><p class="affiliation">개념 설명은 각 파트 노트에서, 여기서는 시험 직전 훑어보기용으로</p></header>
<div class="sum-chips">${chips}</div>
${parts}
${gallery}
</main></div>
<script>window.addEventListener("load", () => { const el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(() => el.scrollIntoView(), 400); });</script>
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
aside ol li.grp { margin:16px 0 4px; padding-left:12px; font-size:.7em; letter-spacing:.12em; color:var(--text-mute); font-family:var(--font-mono); }
h3.grp-h { margin:28px 0 -6px; font-size:1.05em; color:var(--accent); }
main li { color:var(--text-dim); margin-bottom:4px; line-height:1.7; }
.sum-chips { display:flex; flex-wrap:wrap; gap:8px; margin:20px 0 8px; }
.sum-chips a { padding:6px 12px; border-radius:999px; border:1px solid var(--border); color:var(--text-dim); text-decoration:none; font-size:.85em; }
.sum-chips a:hover { border-color:var(--accent); color:var(--accent); }
.sum-part { margin-top:52px; padding-top:10px; border-top:2px solid var(--accent); scroll-margin-top:16px; }
.sum-part > h2 { margin-top:14px; }
.sum-sub { color:var(--text-mute); margin-top:-6px; }
.sum-sec h3 { margin:26px 0 6px; font-size:1.05em; color:var(--accent); }
.sum-sec h4 { margin:14px 0 4px; font-size:.95em; }
.sum-traps { margin-top:22px; padding:6px 18px 10px; border:1px solid var(--border); border-left:4px solid var(--accent); border-radius:10px; background:var(--bg-card); }
.sum-traps h3 { margin:12px 0 4px; font-size:1.05em; }
${mapCss}
@media print { aside, .sum-chips, .cta { display:none !important; } .layout { display:block !important; } .sum-part { break-before:page; } }
`;
  return css;
}

export function writeAll(spec, extra = {}) {
  const dir = path.join(LEARN, spec.folder);
  const out = {};
  out["index.html"] = indexPage(spec);
  if (spec.practice !== false) out["practice.html"] = practicePage(spec);
  if (spec.summary) out["summary.html"] = summaryPage(spec);
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
