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
/* 머리글을 data-l 로 칸마다 넣어 둔다 — 좁은 화면에서는 행을 카드로 쌓고 칸 이름을 위에 보여 준다 */
export const cellLabel = (x) => String(x).replace(/<[^>]*>/g, "").replace(/"/g, "&quot;");
export const tbl = (head, rows) =>
  `<div class="tbl-wrap"><table><thead><tr>${head.map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((x, i) => `<td data-l="${cellLabel(head[i] ?? "")}">${x}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
export const ex = (q, sol) =>
  `<details class="example"><summary>${q}</summary><div class="example-sol">${sol}</div></details>`;

/* 과목별 시험 목록(그 과목 데이터가 있는 회차만) */
/* 장별 인터랙티브 그림(마우스 올리면 설명·어원): shared/figure-explorer.{js,css} + figures/<id>.js(그림) + figures/data/<id>.js(글).
 * 장 파일(chapters/ 아래)의 headExtra 에 넣고, 본문에는 <div data-figure="<id>"></div> 를 둔다. */
export const figHead = (...ids) => `<link rel="stylesheet" href="../../shared/figure-explorer.css">
<script defer src="../../shared/figure-explorer.js"></script>
${ids.map((id) => `<script defer src="../../shared/figures/data/${id}.js"></script>\n<script defer src="../../shared/figures/${id}.js"></script>`).join("\n")}`;
export const figure = (id, view) => `<div data-figure="${id}" id="fig-${id}${view ? "-" + view : ""}"${view ? ` data-view="${view}"` : ""}></div>`;

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
export function head(title, depth, spec, opts = {}) {
  const up = depth ? "../" : "";
  // 용어·어원 툴팁: spec.termsData 가 있는 과목의 파트·요약 페이지에만 (shared/term-tips.js + shared/terms/<이름>.js)
  const terms = opts.terms && spec.termsData
    ? `\n<link rel="stylesheet" href="${up}../shared/term-tips.css">\n<script defer src="${up}../shared/terms/${spec.termsData}.js"></script>\n<script defer src="${up}../shared/term-tips.js"></script>`
    : "";
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="${up}styles.css">
<link rel="stylesheet" href="${up}../shared/light-theme.css">
<script defer src="${up}../shared/i18n.js"></script>
<script defer src="${up}../shared/support.js"></script>
<script defer src="${up}../shared/search.js"></script>
<script defer src="${up}../shared/difficulty.js"></script>
<link rel="stylesheet" href="${up}../shared/practice-simple.css">
<script defer src="${up}../shared/practice-simple.js"></script>
<link rel="stylesheet" href="${up}../shared/sections.css">
<script defer src="${up}../shared/sections.js"></script>${terms}${spec.styles ? `\n<link rel="stylesheet" href="${up}../shared/study-style.css">\n<script defer src="${up}../shared/study-style.js"></script>` : ""}${opts.extra ? "\n" + opts.extra : ""}
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
  if (spec.styles) items.push(li(`${up}study-style.html`, "🧭 논리형 공부법", active === "style"));
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
<p>이 파트 핵심만 고르세요. 보기를 누르면 바로 정답이 보입니다.</p>
<div id="nm-quiz-host"></div>
<script>window.NANAMATE_QUIZ=${JSON.stringify({ color: spec.color, questions: spreadAnswers(c.questions, salt) })};</script>`;
}

/* 본문을 절(h2)마다 접어 제목만 보이게 한다. 첫 h2 앞 글은 그대로, 맨 앞에 ‘모두 펼치기’ 줄(shared/sections.js) */
function foldSections(html) {
  const s = String(html), at = s.search(/<h2[\s>]/);
  if (at < 0) return html;
  // 맨 앞의 h2 도 접히도록 앞글(lead)은 첫 h2 앞에서 잘라 낸다(split 은 0번 자리의 빈 일치를 건너뛴다)
  const lead = s.slice(0, at), secs = s.slice(at).split(/(?=<h2[\s>])/);
  return `${lead}<div class="sec-bar"><span>본문 ${secs.length}절 · 제목을 누르면 펼쳐집니다</span><button type="button" class="sec-all" data-sec-all aria-pressed="false">모두 펼치기</button></div>
${secs.map((x) => { const m = x.match(/^<h2[^>]*>[\s\S]*?<\/h2>/); return m ? `<details class="sec"><summary>${m[0]}</summary>${x.slice(m[0].length)}</details>` : x; }).join("")}`;
}

export function chapterPage(spec, c, i) {
  const st = c.part ? partStats(spec.sub, c.part) : null;
  const prev = spec.chapters[i - 1], next = spec.chapters[i + 1];
  const stat = st
    ? `<div class="stat-row"><div class="stat"><b>${st.avg}</b><span>회당 문항 수</span></div><div class="stat"><b>${st.avgPts}점</b><span>회당 배점</span></div><div class="stat"><b>${st.min}~${st.max}</b><span>회차별 범위</span></div><div class="stat"><b>${st.total}</b><span>최근 ${st.exams}회 누적</span></div></div>
<p class="stat-note">수능 2018~2026학년도 + 6·9월 모의평가 ${st.exams}회(2018~2020학년도는 2009 개정 교육과정)(${st.exams * (spec.qn || 20)}문항) 기준. 문항 본문 키워드로 분류한 값이라 ±1문항 오차가 있을 수 있습니다.</p>`
    : "";
  const practice = spec.practice === false ? "" : c.part
    ? `<h2>이 파트 기출 풀어보기</h2>
<p>${spec.label} 전 시험지에서 이 파트로 분류된 <strong>${st.total}문항</strong>을 실제 시험지 그대로 풀고, 채점과 해설까지 볼 수 있습니다.</p>
<p><a class="cta" href="../practice.html#part:${c.part}">📝 ${c.title} 모아 풀기 →</a></p>`
    : `<h2>실전으로 풀어보기</h2><p><a class="cta" href="../practice.html">📝 수능 풀어보기 →</a></p>`;
  const motion = c.motion
    ? `<h2>모션으로 보기</h2>
<p>이 파트의 개념을 움직이는 그림으로 다시 확인합니다.</p>
<p>${c.motion.map(([n, label]) => `<a class="cta sm" href="../motion.html#s${n}">🎬 ${label}</a>`).join(" ")}${c.motionPage ? ` <a class="cta" href="../motion/${c.motionPage}">▶ 이 파트 모션 전체 재생</a>` : ""}${c.mapLink ? ` <a class="cta sm" href="../${c.mapLink}">🗺️ 영토 변화 지도</a>` : ""}</p>`
    : "";
  const sumCta = spec.summary ? `<p><a class="cta sm" href="../summary.html#p${i + 1}">📌 이 파트 한눈에 요약 →</a></p>` : "";
  const nav = `<div class="pager">${prev ? `<a href="${prev.file}">← ${prev.title}</a>` : `<a href="../index.html">← 표지</a>`}${next ? `<a href="${next.file}">${next.title} →</a>` : spec.practice === false ? "" : `<a href="../practice.html">수능 풀어보기 →</a>`}</div>`;
  return `${head(`${c.title} — ${spec.label}`, 1, spec, { terms: true, extra: c.headExtra })}
<body><div class="layout">
${aside(spec, c.file, 1)}
<main>
<header class="paper-header"><h1>${c.title}</h1><p class="authors">Part ${i + 1} · ${c.unit}</p><p class="affiliation">${c.sub}</p></header>
${stat}
${c.lead}
${styleCard(spec, c)}
${spec.maps ? `<details class="mg-wrap" open><summary>📌 이 파트 한눈에 요약 맵</summary>${mapOf(spec, i)}</details>` : ""}
${sumCta}
${spec.styles ? stepBand("②", "이해하기", "본문은 절 제목만 보입니다 — 지금 필요한 절만 펼쳐 ‘왜’를 두 번 물으며 읽기") : ""}
${foldSections(c.body)}
${motion}
${spec.styles ? stepBand("③", "확인하기", "조건이 바뀐 문제로 확인 — 막히면 가장 쉬운 문제부터") : ""}
${c.traps ? `<h2>자주 나오는 함정</h2>${c.traps}` : ""}
${c.examples ? `<h2${spec.styles ? ' id="examples"' : ""}>대표 예제</h2><p>눌러서 풀이를 펼치세요.</p>${c.examples}` : ""}
${tabs(c.easy, c.hard)}
${games(spec, c, i)}
${practice}
${styleEnd(spec, c)}
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
${spec.styles ? `  <a class="outline-card" href="study-style.html"><div class="num">STYLE</div><h4>🧭 논리형 공부법</h4><p>왜 사슬 · 장별 전체 해설 · 말로 설명해 보기 — 원리로 납득하며 공부하는 순서와 파트별 공략</p></a>` : ""}
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
  const span = (k) => { const ys = ex.filter((e) => (k === "csat") === (e.kind === "csat")).map((e) => e.year); return ys.length ? `${Math.min(...ys)}~${Math.max(...ys)}학년도` : ""; };
  const years = `수능 ${span("csat")} · 6월/9월 모의평가 ${span("mock")} · 총 ${ex.length}회`;
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
<script src="../shared/auth.js"></script>
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

/* ── 논리형 공부법 ──
 * spec.styles = { intro, types: { logic: { fit, principles[], routine[], weekly, trap, extra? } },
 *                 chapters: { [file]: { logic: { one, chain[], keep, derive, trap, explain[], answers[], full[] } } } }
 * 사용자의 공부 성향(논리형)에만 맞춘 장 첫머리 카드(styleCard)와 과목별 study-style.html(stylePage). 다른 성향은 두지 않는다. */
/* ‘하나만 고른다면’은 “핵심 — 풀이” 꼴이라 줄표 앞을 굵게, 줄표가 없으면 문장 전체를 굵게 */
const boldOne = (t) => { const i = t.indexOf(" — "); return i > 0 ? `<strong>${t.slice(0, i)}</strong>${t.slice(i)}` : `<strong>${t}</strong>`; };
const doneBox = (key) => `<div class="nms-done" data-done="${key}"><b>✅ 이 파트 끝내기</b><span class="nms-done-n" aria-live="polite"></span>
<label><input type="checkbox" data-chk="0"> 사슬을 안 보고 처음부터 끝까지 써 봤다</label>
<label><input type="checkbox" data-chk="1"> ‘말로 설명해 보기’ 두 질문에 막힘없이 답했다</label>
<label><input type="checkbox" data-chk="2"> 조건을 바꾼 문제(대표 예제·기출)를 풀었다</label></div>`;
/* o: { ex: 대표 예제 주소, done: 끝내기 체크 키, full: true(전체 해설을 여기 펼침) | 주소(전체 해설로 가는 링크) }
 * 전체 해설의 절에 sec.fig = [[그림 id, 이름]…]이 있으면 본문의 그 그림(id="fig-<id>")으로 가는 링크를 붙인다. */
/* 전체 해설은 길어서 기본으로 접어 두고, 접힌 채로도 절 제목(줄표 앞)과 읽는 시간(분당 500자)이 한눈에 보이게 한다 */
const fullMin = (d) => Math.max(1, Math.round(d.full.reduce((n, s) => n + s.p.join("").replace(/<[^>]+>/g, "").length, 0) / 500));
const fullBlock = (d) => `<details class="nms-full"><summary><span class="nms-full-t">📖 논리형 전체 해설 — ${d.full.length}절 · 약 ${fullMin(d)}분</span><span class="nms-full-toc">${d.full.map((s) => s.h.split(" — ")[0]).join(" · ")}</span></summary>
${d.full.map((sec) => `<div class="nms-full-sec"><p class="nms-full-h">${sec.h}</p>${sec.p.map((x) => `<p>${x}</p>`).join("")}${sec.fig ? `<p class="nms-figlink">${sec.fig.map(([id, name]) => `<a href="#fig-${id}">🖼 그림으로 보기: ${name} ↓</a>`).join("")}</p>` : ""}</div>`).join("\n")}</details>`;
const explainBlock = (d) => d.explain ? `<div class="nms-explain"><b>🗣 말로 설명해 보기</b><ol>${d.explain.map((x, i) => `<li>${x}${d.answers && d.answers[i] ? `<details class="nms-ans"><summary>내 설명과 비교하기</summary><p>${d.answers[i]}</p></details>` : ""}</li>`).join("")}</ol><p>책을 덮고 모르는 사람에게 설명하듯 소리 내어 먼저 답해 본 뒤 비교하세요. 막히는 곳이 아직 내 것이 아닌 곳이니, 그 고리만 위 사슬에서 다시 보면 됩니다.</p></div>` : "";
/* 오답 한 줄: 틀린 문제에서 ‘내가 왜 그렇게 생각했나, 어느 단계에서 틀어졌나’를 남긴다(이 기기에만 저장, shared/study-style.js) */
const noteBox = (key) => `<div class="nms-note" data-note="${key}"><b>✍️ 오답 한 줄</b><span class="nms-note-saved" aria-live="polite"></span>
<p class="nms-note-hint">틀린 문제 하나를 골라 ‘내가 왜 그렇게 생각했나, 어느 단계에서 틀어졌나’를 한 줄로 적어 두세요. 이 기기에만 저장되고 논리형 공부법 페이지에 모입니다.</p>
<textarea rows="2" data-note-input aria-label="오답 한 줄" placeholder="예: 조건 하나를 빼고 식을 세움 — 다음엔 조건에 번호부터 붙이기"></textarea></div>`;
/* 장 페이지를 공부 습관 순서로 나누는 띠: ① 틀 잡기 → ② 이해하기 → ③ 확인하기 → ④ 마무리 */
export const stepBand = (n, t, sub) => `<div class="nms-stepband"><b>${n} ${t}</b><span>${sub}</span></div>`;
const logicBlock = (d, o = {}) => `<div class="nms-logic">${d.one ? `<p class="nms-one"><b>하나만 고른다면</b>${boldOne(d.one)}</p>` : ""}
<div class="nms-chain-h"><span>왜 사슬</span><button type="button" class="nms-recall" data-recall aria-pressed="false">🙈 가리고 떠올리기</button></div>
<p class="nms-recall-hint">다음 단계를 먼저 머릿속으로 떠올린 뒤, 가려진 단계를 눌러 맞았는지 확인하세요.</p>
<ol class="nms-chain">${d.chain.map((x) => `<li><span class="nms-step">${x}</span></li>`).join("")}</ol>
${d.full && o.full === true ? fullBlock(d) : d.full && o.full ? `<p class="nms-first"><a href="${o.full}">📖 이 파트 논리형 전체 해설 보기 →</a></p>` : ""}
<p class="nms-kv"><b>외울 것은 이것뿐</b>${d.keep}</p>
<p class="nms-kv"><b>나머지는 유도</b>${d.derive}</p>
<p class="nms-trap"><b>논리형 함정</b>${d.trap}</p>
${o.explain === false ? "" : explainBlock(d)}
${o.ex ? `<p class="nms-first">문제부터 부딪치고 싶다면 <a href="${o.ex}">대표 예제</a>를 먼저 풀고, 막힌 고리만 사슬에서 찾아 채우세요.</p>` : ""}
${o.done ? doneBox(o.done) : ""}</div>`;
/* 논리형 공통 루틴 — 이해가 ‘옮겨 적기’에서 끝나지 않고 내 것이 되게 하는 습관(모든 과목 공통) */
const LOGIC_COMMON = [
  "<strong>틀부터 빌립니다.</strong> 파트를 읽기 전 표지의 로드맵과 ‘한눈에 요약 맵’으로 큰 덩어리를 5분 봅니다. 틀을 직접 만들려 애쓰지 말고, 있는 틀이 왜 그렇게 짜였는지 이해하는 데 힘을 씁니다. 읽는 동안 ‘지금 이 내용이 틀의 어느 자리인가’를 의식합니다.",
  "<strong>‘왜’를 두 번 묻습니다.</strong> 읽은 문장에 ‘왜 그런가’, 그 답에 다시 ‘왜’. 파트마다 있는 ‘왜 사슬’은 이 질문의 답을 이어 놓은 것입니다.",
  "<strong>하나만 고릅니다.</strong> 파트를 덮고 ‘가장 중요한 것 하나’를 말해 봅니다. 고르는 행위가 지식에 층위를 만듭니다. 카드 맨 위의 ‘하나만 고른다면’과 비교해 보세요.",
  "<strong>말로 설명합니다(파인만 학습법).</strong> 공부 끝 5분, 오늘 배운 것 하나를 모르는 사람에게 설명하듯 소리 내어 말합니다. 막히는 곳이 아직 내 것이 아닌 곳이고, 그 부분만 다시 봅니다.",
  "<strong>숫자와 조건을 바꿔 확인합니다.</strong> 이해했다고 느껴도 조건 하나가 바뀐 문제에서 손이 멈추면 아직 옮겨 적기만 한 상태입니다.",
  "<strong>오답에는 ‘내가 왜 그렇게 생각했나’를 한 줄 씁니다.</strong> 정답을 베끼지 말고, 내 생각이 어느 단계에서 틀어졌는지를 고칩니다.",
  "<strong>어려운 문제를 먼저 만나도 됩니다.</strong> 순서대로 읽는 대신 대표 예제나 기출 하나를 먼저 붙잡고, 막힌 고리만 사슬에서 찾아 채우는 방식이 잘 맞는 경우가 많습니다.",
  "<strong>50분 한 덩어리, 작은 마감.</strong> 50분 안에 주제 하나를 끝내는 단위로 계획하고, 큰 목표 하나보다 매일 끝낼 수 있는 작은 마감을 둡니다. 막혀서 손이 안 가면 그 과목에서 가장 쉬운 문제 하나부터 풉니다."
];

export function styleCard(spec, c) {
  const d = spec.styles && spec.styles.chapters[c.file];
  if (!d) return "";
  return `${stepBand("①", "틀 잡기", "5분 — ‘하나만 고른다면’과 왜 사슬, 요약 맵으로 큰 그림부터")}
<section class="nms" data-nms>
<div class="nms-top"><b>🧭 논리형으로 이 파트 공부하기</b><span class="nms-top-r"><button type="button" class="nms-timer-btn" data-timer>⏱ 50분 집중</button><a href="../study-style.html">논리형 공부법 전체 →</a></span></div>
${logicBlock(d.logic, { ex: c.examples ? "#examples" : null, full: true, explain: false })}
</section>`;
}

/* 장 끝 마무리 카드: 공부 끝 5분 — 말로 설명 → 오답 한 줄 → 끝내기 체크 */
export function styleEnd(spec, c) {
  const d = spec.styles && spec.styles.chapters[c.file];
  if (!d) return "";
  const key = `${spec.folder}/${c.file}`;
  return `${stepBand("④", "마무리", "공부 끝 5분 — 말로 설명하고, 오답 한 줄을 남기고, 끝내기 체크")}
<section class="nms nms-end" data-nms>
<div class="nms-top"><b>🗣 마무리 — 말로 설명하고 끝내기</b><span class="nms-top-r"><a href="../study-style.html#notes">내 오답 한 줄 모음 →</a></span></div>
${explainBlock(d.logic)}
${noteBox(key)}
${doneBox(key)}
</section>`;
}

export function stylePage(spec) {
  const S = spec.styles;
  const t = S.types.logic;
  const styled = spec.chapters.filter((c) => S.chapters[c.file]);
  /* 파트별 공략은 파트마다 접어 두어 제목과 진행률만 한눈에 보이게 한다 */
  const chapterList = styled.map((c) => {
    const i = spec.chapters.indexOf(c);
    return `<details class="nms-part"><summary><span class="nms-part-h">${i + 1}. ${c.title}</span> <span class="nms-prog" data-prog="${spec.folder}/${c.file}"></span></summary>
<p class="nms-first"><a href="chapters/${c.file}">이 파트 공부하러 가기 →</a></p>
${logicBlock(S.chapters[c.file].logic, { ex: c.examples ? `chapters/${c.file}#examples` : null, full: `chapters/${c.file}` })}</details>`;
  }).join("\n");
  const notes = `<div class="nms-notes" id="notes"><h3>✍️ 내 오답 한 줄 모음</h3>
<p class="nms-fit">파트마다 마무리 칸에 적은 한 줄입니다. 시험 전에 이것만 다시 읽어도 같은 자리에서 또 틀리는 일을 줄일 수 있습니다.</p>
<ul>${styled.map((c) => `<li data-note-show="${spec.folder}/${c.file}" hidden><a href="chapters/${c.file}">${c.title}</a><span class="nms-note-text"></span></li>`).join("")}</ul>
<p class="nms-notes-empty">아직 적은 오답 한 줄이 없습니다. 파트를 마무리할 때 하나씩 남겨 보세요.</p></div>`;
  const frame = `<div class="nms-frame"><h3>이 과목의 틀 — 장마다 하나만</h3>
<p class="nms-fit">각 파트에서 ‘하나만 고른다면’을 모은 과목 전체의 뼈대입니다. 파트를 시작하기 전에 이 목록에서 지금 파트의 자리를 확인하고, 시험 직전에는 이 목록만 소리 내어 읽어도 큰 그림이 돌아옵니다.</p>
<p class="nms-total" data-prog-total="${spec.folder}" data-prog-count="${styled.length}"></p>
<ol>${styled.map((c) => `<li><a href="chapters/${c.file}">${c.title}</a> <span class="nms-prog" data-prog="${spec.folder}/${c.file}"></span><span class="nms-frame-one">${boldOne(S.chapters[c.file].logic.one || "")}</span></li>`).join("")}</ol></div>`;
  return `${head(`논리형 공부법 — ${spec.label}`, 0, spec, { terms: true })}
<body><div class="layout">
${aside(spec, "style", 0)}
<main>
<header class="paper-header"><h1>논리형 공부법</h1><p class="authors">${spec.label} · 원리와 인과로 납득하며 공부하기</p><p class="affiliation">각 파트 첫머리의 ‘논리형으로 이 파트 공부하기’ 상자와 같은 사슬·해설을 씁니다. 끝내기 체크와 50분 타이머는 이 사이트의 모든 과목에서 이어집니다.</p></header>
<p>${S.intro}</p>
<section class="nms" data-nms>
<div class="nms-top"><b>논리형으로 이 과목 공부하기</b><span class="nms-top-r"><button type="button" class="nms-timer-btn" data-timer>⏱ 50분 집중</button></span></div>
<p class="nms-tip"><strong>논리형</strong> — 원리·인과로 납득해야 기억한다. ${t.fit}</p>
${frame}
${notes}
<div class="nms-common"><h3>논리형 공통 루틴 — 이해가 ‘내 것’이 되게</h3><ol>${LOGIC_COMMON.map((x) => `<li>${x}</li>`).join("")}</ol></div>
${t.extra ? `<div class="nms-extra"><h3>${t.extra.title}</h3><ul>${t.extra.items.map((x) => `<li>${x}</li>`).join("")}</ul></div>` : ""}
<h3>이 과목의 기본 원칙</h3>
<ul>${t.principles.map((x) => `<li>${x}</li>`).join("")}</ul>
<h3>공부 순서</h3>
<ol class="nms-steps">${t.routine.map((x) => `<li>${x}</li>`).join("")}</ol>
<p class="nms-kv"><b>한 주 배치</b>${t.weekly}</p>
<p class="nms-trap"><b>논리형 함정</b>${t.trap}</p>
<h3>파트별 공략</h3>
${chapterList}
</section>
</main></div>
</body></html>`;
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
  return `${head(`한눈에 요약 — ${spec.label}`, 0, spec, { terms: true })}
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
th, td { word-break:keep-all; overflow-wrap:break-word; }
/* 옛한글(아래아 ㆍ, ㅿ, ㆁ, ㅸ 등): 첫가끝 자모만 담은 Noto Sans CJK KR 부분 글꼴 — 조합 규칙(ljmo/vjmo/tjmo) 포함 */
@font-face { font-family:'NM Old Hangul'; src:url('../shared/fonts/old-hangul.woff2') format('woff2'); unicode-range:U+1100-11FF, U+302E-302F, U+3164-318E, U+A960-A97F, U+D7B0-D7FF; font-display:swap; }
:root { --font-body:'NM Old Hangul','IBM Plex Sans KR',-apple-system,sans-serif; --font-display:'Space Grotesk','NM Old Hangul','IBM Plex Sans KR',sans-serif; }
@media (max-width:640px) {
  main { padding:32px 16px 72px; }
  .tbl-wrap { overflow:visible; }
  .tbl-wrap table, .tbl-wrap tbody, .tbl-wrap tr, .tbl-wrap td { display:block; width:100%; }
  .tbl-wrap thead { display:none; }
  .tbl-wrap tr { margin:0 0 10px; border:1px solid var(--border); border-radius:10px; overflow:hidden; background:var(--bg-card); }
  .tbl-wrap td { border:none; border-top:1px solid var(--border); padding:8px 12px; }
  .tbl-wrap td:first-child { border-top:none; background:var(--bg-elevated); color:var(--text); font-weight:600; }
  .tbl-wrap td:not(:first-child)[data-l]:not([data-l=""])::before { content:attr(data-l); display:block; margin-bottom:2px; font-size:.75em; font-weight:600; color:var(--text-mute); }
}
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
${spec.extraCss || ""}
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
  if (spec.styles) out["study-style.html"] = stylePage(spec);
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
