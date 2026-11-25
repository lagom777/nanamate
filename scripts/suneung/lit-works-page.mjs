// 문학 작품 카드 쪽(lit-works.html) — 작품마다 주제·표현·출제 포인트 카드 + ▶ 내용 재생. 국어 노트 생성 때 함께 쓴다(korean.mjs 의 spec.extra)
// 데이터: content/lit-works.mjs(카드) · content/lit/*.mjs(재생) · 회독 체크는 브라우저(localStorage)에만 저장
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { head, aside } from "./lib.mjs";
import { WORKS, SOURCES } from "./content/lit-works.mjs";

// 내용 재생기 데이터(content/lit/*.mjs) — 있는 파일만. 작품(who 가 있는 항목)을 제목·작가로 짝짓는다(규격: lit-play.test.mjs)
const LIT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "content", "lit");
const PLAYS = [];
for (const f of fs.existsSync(LIT_DIR) ? fs.readdirSync(LIT_DIR).filter((f) => f.endsWith(".mjs")).sort() : []) {
  PLAYS.push(...(await import(pathToFileURL(path.join(LIT_DIR, f)).href)).PLAYS);
}

const GENRES = ["현대시", "현대소설", "고전시가", "고전산문", "극·수필"];
const GID = { "현대시": "mp", "현대소설": "mn", "고전시가": "cp", "고전산문": "cn", "극·수필": "de" };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const works = WORKS.map((w, i) => ({ ...w, id: "w" + String(i + 1).padStart(3, "0") }));   // id 는 회독 기록의 열쇠 — WORKS 순서를 바꾸지 말 것

const playOf = (w) => PLAYS.find((p) => p.who && p.t === w.t && p.a === w.a && w.s.startsWith("수특"));
const playBtn = (id, label = "▶ 내용 재생") => `<button type="button" class="lw-play" data-play="${id}">${label}</button>`;

/** 재생기 데이터 파일(lit-play-data.js): window.NM_LIT[id] = 재생 한 편 + 카드의 갈래·수록·주제 */
export function litData() {
  const out = {};
  for (const w of works) { const p = playOf(w); if (p) out[w.id] = { ...p, g: w.g, s: w.s, th: w.th }; }
  return `/* 국어 문학 작품 내용 재생기 데이터 — scripts/suneung/lit-works-page.mjs 가 content/lit/*.mjs 로 만든다(직접 고치지 말 것) */\nwindow.NM_LIT = ${JSON.stringify(out)};\n`;
}

const searchText = (w) => [w.t, w.a, w.s, w.g, w.th, w.fx, w.pt, w.pr, w.n || ""].join(" ").toLowerCase();

const chk = (id) => `<span class="lw-rd" data-id="${id}"><label title="1회독"><input type="checkbox" data-r="1">1</label><label title="2회독"><input type="checkbox" data-r="2">2</label><label title="3회독"><input type="checkbox" data-r="3">3</label></span>`;

function card(w) {
  const row = (k, v) => (v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : "");
  const todo = `<span class="lw-todo">교재 해설로 확인</span>`;
  return `<article class="lw-card" id="${w.id}" data-g="${w.g}" data-q="${esc(searchText(w))}">
<header><h4>「${w.t}」 <small>${w.a}</small></h4><div class="lw-meta"><span class="lw-src" title="요약의 근거가 된 교재 위치">${w.s}</span>${chk(w.id)}${playOf(w) ? playBtn(w.id) : ""}</div></header>
<dl>
${row("주제·정서", w.th || todo)}
${row("표현", w.fx || todo)}
${row("출제 포인트", w.pt || todo)}
${row("같이 보기", w.pr)}
${row("메모", w.n)}
</dl>${w.q ? `<p class="lw-q">${w.q}</p>` : ""}
</article>`;
}

function overview() {
  const rows = works.map((w) => `<tr data-id="${w.id}" data-g="${w.g}" data-q="${esc(searchText(w))}"><td>${w.g}</td><td><a href="#${w.id}">「${w.t}」</a> <small>${w.a}</small></td><td>${chk(w.id)}</td></tr>`).join("\n");
  return `<div class="tbl-wrap lw-ov"><table><thead><tr><th>갈래</th><th>작품</th><th>회독</th></tr></thead><tbody>
${rows}
</tbody></table></div>`;
}

const css = `
.lw-bar { position:sticky; top:0; z-index:5; margin:0 0 18px; padding:10px 0; background:var(--bg); border-bottom:1px solid var(--border); display:grid; gap:8px; }
.lw-bar input[type=search] { width:100%; padding:10px 14px; font-size:1em; border:1px solid var(--border); border-radius:10px; background:var(--bg-card); color:var(--text); font-family:var(--font-body); }
.lw-f { display:flex; flex-wrap:wrap; gap:6px; }
.lw-f button { padding:4px 10px; border:1px solid var(--border); border-radius:999px; background:transparent; color:var(--text-dim); font-size:.8em; cursor:pointer; font-family:var(--font-body); }
.lw-f button[aria-pressed=true] { border-color:var(--accent); color:var(--accent); font-weight:600; }
.lw-count { font-size:.78em; color:var(--text-mute); }
.lw-grid { display:grid; gap:12px; }
.lw-card { padding:12px 14px; border:1px solid var(--border); border-radius:12px; background:var(--bg-card); scroll-margin-top:120px; }
.lw-card header { display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:4px 12px; margin-bottom:6px; }
.lw-card h4 { margin:0; font-size:1.02em; color:var(--text); }
.lw-card h4 small { font-weight:400; color:var(--text-mute); font-size:.82em; }
.lw-meta { display:flex; flex-wrap:wrap; align-items:center; gap:6px; font-size:.78em; }
.lw-src { color:var(--text-mute); }
.lw-card dl { margin:0; display:grid; gap:3px; }
.lw-card dl > div { display:grid; grid-template-columns:5.4em minmax(0,1fr); gap:8px; font-size:.9em; line-height:1.6; }
.lw-card dt { color:var(--text-mute); font-size:.92em; }
.lw-card dd { margin:0; color:var(--text-dim); }
.lw-todo { color:var(--text-mute); font-style:italic; }
.lw-q { margin:8px 0 0; padding:8px 12px; border-left:3px solid var(--accent); background:var(--bg-elevated); border-radius:0 8px 8px 0; font-size:.95em; line-height:1.9; color:var(--text); }
.lw-rd { display:inline-flex; gap:2px; }
.lw-rd label { display:inline-flex; align-items:center; gap:1px; padding:0 4px; border:1px solid var(--border); border-radius:6px; cursor:pointer; color:var(--text-mute); font-size:.92em; }
.lw-rd input { margin:0 2px 0 0; accent-color:var(--accent); }
.lw-rd label:has(input:checked) { color:var(--accent); border-color:var(--accent); }
.lw-ov td { font-size:.9em; } .lw-ov a { color:var(--text); }
.lw-fold { margin:0 0 18px; } .lw-fold > summary { cursor:pointer; font-weight:600; color:var(--text); padding:6px 0; }
.lw-prog { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:8px; margin:8px 0 14px; }
.lw-prog div { padding:8px 10px; border:1px solid var(--border); border-radius:10px; font-size:.82em; color:var(--text-dim); }
.lw-prog b { display:block; font-size:1.2em; color:var(--text); }
.lw-prog i { display:block; height:4px; margin-top:6px; border-radius:2px; background:var(--bg-elevated); overflow:hidden; font-style:normal; }
.lw-prog i span { display:block; height:100%; background:var(--accent); }
.lw-hide { display:none !important; }
.lw-play { padding:1px 9px; border:1px solid var(--accent); border-radius:999px; background:transparent; color:var(--accent); font-weight:600; cursor:pointer; font-family:var(--font-body); font-size:1em; }
.lp-modal { position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; padding:16px; background:rgba(5,8,16,.8); }
.lp-modal[hidden] { display:none; }
.lp-panel { width:min(980px,100%); max-height:100%; overflow:auto; padding:10px 12px 12px; border-radius:16px; background:#0b1222; }
.lp-x { display:block; margin:0 0 8px auto; padding:5px 12px; border:1px solid rgba(255,255,255,.3); border-radius:10px; background:rgba(255,255,255,.08); color:#fff; cursor:pointer; font-family:var(--font-body); }
@media (max-width:640px) { .lw-card dl > div { grid-template-columns:1fr; gap:0; } .lw-card dt { margin-top:4px; } }
@media print { .lw-bar, .lw-rd { display:none !important; } .lw-card { break-inside:avoid; } }
`;

const js = `
(() => {
  // ▶ 내용 재생: 누른 작품의 재생기를 창 안에 띄우고, 닫으면 떼어 낸다(shared/player.js · players/lit.js)
  const modal = document.getElementById('lpModal');
  if (!modal) return;
  const host = modal.querySelector('.lp-host');
  function open(id) {
    const e = window.NM_LIT && window.NM_LIT[id];
    if (!e || !window.NM_LIT_DEF || !window.NM_PLAYER_INIT) return;
    const key = 'lit-' + id;
    window.NM_PLAYERS = window.NM_PLAYERS || {};
    if (!window.NM_PLAYERS[key]) window.NM_PLAYERS[key] = window.NM_LIT_DEF(e);
    host.innerHTML = '<div data-player="' + key + '"></div>';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    window.NM_PLAYER_INIT();
    modal.querySelector('.lp-x').focus();
  }
  function close() { modal.hidden = true; host.innerHTML = ''; document.body.style.overflow = ''; }
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-play]');
    if (b) { ev.preventDefault(); open(b.dataset.play); return; }
    if (ev.target === modal || ev.target.closest('.lp-x')) close();
  });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && !modal.hidden) close(); });
})();
(() => {
  const KEY = 'nm-ebs2027-read-v1';   // 이름은 옛 쪽의 것 — 바꾸면 이미 저장된 회독 기록이 사라진다
  let st = {};
  try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  const level = (id) => st[id] || 0;
  const boxes = () => document.querySelectorAll('.lw-rd');
  function paint() {
    boxes().forEach((b) => { const n = level(b.dataset.id); b.querySelectorAll('input').forEach((c) => { c.checked = Number(c.dataset.r) <= n; }); });
    const prog = document.getElementById('lwProg'); if (!prog) return;
    const cards = [...document.querySelectorAll('.lw-card')];
    const groups = ['전체', ${JSON.stringify(GENRES).slice(1, -1)}];
    prog.innerHTML = groups.map((g) => {
      const cs = cards.filter((c) => g === '전체' || c.dataset.g === g);
      const done = (r) => cs.filter((c) => level(c.id) >= r).length;
      const pct = cs.length ? Math.round(done(3) / cs.length * 100) : 0;
      return '<div><b>' + g + '</b>1회 ' + done(1) + ' · 2회 ' + done(2) + ' · 3회 ' + done(3) + ' / ' + cs.length + '<i><span style="width:' + pct + '%"></span></i></div>';
    }).join('');
  }
  document.addEventListener('change', (e) => {
    const c = e.target.closest('.lw-rd input'); if (!c) return;
    const id = c.closest('.lw-rd').dataset.id, r = Number(c.dataset.r);
    st[id] = c.checked ? r : r - 1; if (!st[id]) delete st[id];
    save(); paint(); apply();
  });
  const q = document.getElementById('lwQ');
  const F = { g: '', todo: '' };
  document.querySelectorAll('.lw-f button').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.k, v = b.dataset.v;
    F[k] = F[k] === v ? '' : v;
    document.querySelectorAll('.lw-f button[data-k="' + k + '"]').forEach((x) => x.setAttribute('aria-pressed', String(F[k] === x.dataset.v)));
    apply();
  }));
  function match(el) {
    const s = (q.value || '').trim().toLowerCase();
    if (s && !s.split(/\\s+/).every((t) => el.dataset.q.includes(t))) return false;
    if (F.g && el.dataset.g !== F.g) return false;
    const id = el.id || el.dataset.id;
    if (F.todo && level(id) >= Number(F.todo)) return false;
    return true;
  }
  function apply() {
    let n = 0;
    document.querySelectorAll('.lw-card').forEach((c) => { const ok = match(c); c.classList.toggle('lw-hide', !ok); if (ok) n++; });
    document.querySelectorAll('.lw-ov tbody tr').forEach((r) => r.classList.toggle('lw-hide', !match(r)));
    document.querySelectorAll('.lw-sec').forEach((s) => s.classList.toggle('lw-hide', !s.querySelector('.lw-card:not(.lw-hide)')));
    document.getElementById('lwN').textContent = n + '개 작품 표시';
  }
  q.addEventListener('input', apply);
  paint(); apply();
})();
`;

const filt = (k, v, label) => `<button type="button" data-k="${k}" data-v="${v}" aria-pressed="false">${label}</button>`;

export function litWorksPage(spec) {
  const count = (g) => works.filter((w) => w.g === g).length;
  const sections = GENRES.map((g) => `<section class="lw-sec" id="lw-${GID[g]}"><h2>${g}</h2>
<div class="lw-grid">
${works.filter((w) => w.g === g).map(card).join("\n")}
</div></section>`).join("\n");
  return `${head("문학 작품 줄거리·주제 카드", 0, spec, { extra: `<style>${css}</style>\n<link rel="stylesheet" href="../shared/player.css">\n<script defer src="../shared/player.js"></script>\n<script defer src="../shared/players/lit.js"></script>\n<script defer src="lit-play-data.js"></script>` })}
<body><div class="layout">
${aside(spec, "works", 0)}
<main>
<header class="paper-header">
  <h1>문학 작품,<br><em>줄거리·주제</em> 카드</h1>
  <p class="authors">${GENRES.join(" · ")} ${works.length}편 · ▶ 내용 재생 ${works.filter(playOf).length}편</p>
  <p class="affiliation">카드 한 장 = 주제·표현·출제 포인트 · 회독 체크로 반복</p>
</header>

<div class="lw-bar">
  <input type="search" id="lwQ" placeholder="작품·작가·주제·소재로 찾기 (예: 유배, 윤동주, 액자, 연군)" aria-label="작품 검색">
  <div class="lw-f">${GENRES.map((g) => filt("g", g, `${g} ${count(g)}`)).join("")}${filt("todo", "1", "아직 1회독 전")}${filt("todo", "3", "3회독 미완")}<span class="lw-count" id="lwN"></span></div>
</div>

<h2 id="lw-how">이렇게 쓰세요</h2>
<ul>
<li><strong>카드</strong>: 작품 하나에 주제·표현·출제 포인트만 있습니다. 읽었으면 오른쪽 <b>1</b>·<b>2</b>·<b>3</b>에 체크합니다(이 브라우저에 저장).</li>
<li><strong>▶ 내용 재생</strong>: 줄거리·시상 흐름을 단계별로 보여 주고, 마지막에 출제 포인트를 짚습니다.</li>
<li><strong>다시 볼 때</strong>: 위에서 갈래와 <b>3회독 미완</b>을 켜면 남은 카드만 보입니다.</li>
</ul>
<div class="lw-prog" id="lwProg"></div>
<details class="lw-fold"><summary>전체 표로 보기 (${works.length}편 · 회독 체크)</summary>
${overview()}
</details>

${sections}

<section id="lw-src"><h2>근거 출처</h2>
<p>작품 목록과 요약은 <strong>2027 수능특강·수능완성 문학</strong>을 근거로 했습니다. 카드의 ‘수특 ○강’·‘수완 ○회’는 그 교재 안의 위치이고, ▶ 내용 재생은 수능특강 문학 본책과 정답과 해설만 근거로 우리 말로 요약했습니다.</p>
<ul>${SOURCES.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${t}</a></li>`).join("")}</ul>
<ul>
<li>카드의 ‘교재 해설로 확인’은 근거를 찾지 못해 비워 둔 칸입니다(지어내지 않았습니다). 옛 표기 인용은 교과서·수능 지문 표기 기준이며 판본마다 다를 수 있습니다.</li>
<li>카드의 표현·출제 포인트는 해설 사이트(모두의 국어)의 작품별 해설을 원문 인용과 맞춰 보고 확인된 것만 적었습니다. 「그 나무」·「나룻배 이야기」·「잘 익은 사과」·「금환기봉」은 2027학년도 6·9월 모의평가의 지문과 문항 기준입니다.</li>
<li>수능완성 문학 목록은 EBS 공식 목차가 아니라 해설 사이트(모두의 국어) 기준입니다.</li>
<li>목차 자료끼리 표기가 다른 것: 「응계설/옹계설」, 「내 영혼 술에 섞여/섞어」. 「정처관군동」은 본책 표기로 확인했습니다.</li>
</ul>
</section>
</main></div>
<div class="lp-modal" id="lpModal" hidden role="dialog" aria-modal="true" aria-label="내용 재생기"><div class="lp-panel"><button type="button" class="lp-x">✕ 닫기 (Esc)</button><div class="lp-host"></div></div></div>
<script>${js}</script>
</body></html>`;
}
