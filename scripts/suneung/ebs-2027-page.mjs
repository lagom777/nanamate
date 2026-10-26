// 2027 수능 EBS 연계(수능특강·수능완성) 정리 페이지 — 국어 노트 생성 때 함께 쓴다(korean.mjs 의 extraPages)
// 데이터: content/ebs-2027.mjs · 반복 복습용: 회독 체크는 브라우저(localStorage)에만 저장
import { head, aside } from "./lib.mjs";
import { WORKS, MOCKS, READING, SOURCES } from "./content/ebs-2027.mjs";

const GENRES = ["현대시", "현대소설", "고전시가", "고전산문", "극·수필"];
const GID = { "현대시": "mp", "현대소설": "mn", "고전시가": "cp", "고전산문": "cn", "극·수필": "de" };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* 우선순위(추정) 규칙 — 페이지에 그대로 설명한다
 *  C: 6·9월 모평에서 이미 연계로 출제(같은 해 수능 재출제는 드묾)
 *  B: 수특 1부 개념 학습 작품, 또는 극·수필 갈래(연계 출제 빈도가 상대적으로 낮음)
 *  A: 그 밖의 수특 2·3부·갈래 복합, 수완 수록 작품 */
const grade = (w) => (w.m ? "C" : w.s.startsWith("수특 1부") || w.g === "극·수필" ? "B" : "A");

const works = WORKS.map((w, i) => ({ ...w, id: "w" + String(i + 1).padStart(3, "0"), gr: grade(w), book: w.s.startsWith("수특") ? "수특" : "수완" }));

const searchText = (w) => [w.t, w.a, w.s, w.g, w.th, w.fx, w.pt, w.pr, w.m || "", w.n || "", "등급" + w.gr].join(" ").toLowerCase();

const chk = (id) => `<span class="ebs-rd" data-id="${id}"><label title="1회독"><input type="checkbox" data-r="1">1</label><label title="2회독"><input type="checkbox" data-r="2">2</label><label title="3회독"><input type="checkbox" data-r="3">3</label></span>`;

const badge = (w) => `<span class="ebs-g g${w.gr}" title="우선순위 ${w.gr}">${w.gr}</span>${w.m ? `<span class="ebs-mock">${w.m}</span>` : ""}`;

function card(w) {
  const row = (k, v) => (v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : "");
  const todo = `<span class="ebs-todo">교재 해설로 확인</span>`;
  return `<article class="ebs-card" id="${w.id}" data-g="${w.g}" data-gr="${w.gr}" data-book="${w.book}" data-mock="${w.m ? 1 : 0}" data-q="${esc(searchText(w))}">
<header><h4>「${w.t}」 <small>${w.a}</small></h4><div class="ebs-meta">${badge(w)}<span class="ebs-src">${w.s}</span>${chk(w.id)}</div></header>
<dl>
${row("주제·정서", w.th || todo)}
${row("표현", w.fx || todo)}
${row("출제 포인트", w.pt || todo)}
${row("같이 묶기", w.pr)}
${row("메모", w.n)}
</dl>${w.q ? `<p class="ebs-q">${w.q}</p>` : ""}
</article>`;
}

function overview() {
  const rows = works.map((w) => `<tr data-id="${w.id}" data-g="${w.g}" data-gr="${w.gr}" data-book="${w.book}" data-mock="${w.m ? 1 : 0}" data-q="${esc(searchText(w))}"><td>${w.g}</td><td><a href="#${w.id}">「${w.t}」</a> <small>${w.a}</small></td><td>${w.s}</td><td>${badge(w)}</td><td>${chk(w.id)}</td></tr>`).join("\n");
  return `<div class="tbl-wrap ebs-ov"><table><thead><tr><th>갈래</th><th>작품</th><th>수록</th><th>우선</th><th>회독</th></tr></thead><tbody>
${rows}
</tbody></table></div>`;
}

function mocksTable() {
  return `<div class="tbl-wrap"><table><thead><tr><th>모평</th><th>갈래</th><th>작품</th><th>연계</th></tr></thead><tbody>
${MOCKS.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("\n")}
</tbody></table></div>`;
}

function stats() {
  const by = (f) => works.filter(f).length;
  return GENRES.map((g) => `<div class="stat"><b>${by((w) => w.g === g)}</b><span>${g}</span></div>`).join("")
    + `<div class="stat"><b>${works.length}</b><span>전체(수특 ${by((w) => w.book === "수특")} · 수완 ${by((w) => w.book === "수완")})</span></div>`;
}

const css = `
.ebs-bar { position:sticky; top:0; z-index:5; margin:0 0 18px; padding:10px 0; background:var(--bg); border-bottom:1px solid var(--border); display:grid; gap:8px; }
.ebs-bar input[type=search] { width:100%; padding:10px 14px; font-size:1em; border:1px solid var(--border); border-radius:10px; background:var(--bg-card); color:var(--text); font-family:var(--font-body); }
.ebs-f { display:flex; flex-wrap:wrap; gap:6px; }
.ebs-f button { padding:4px 10px; border:1px solid var(--border); border-radius:999px; background:transparent; color:var(--text-dim); font-size:.8em; cursor:pointer; font-family:var(--font-body); }
.ebs-f button[aria-pressed=true] { border-color:var(--accent); color:var(--accent); font-weight:600; }
.ebs-count { font-size:.78em; color:var(--text-mute); }
.ebs-toc { columns:2; column-gap:24px; margin:8px 0 6px; padding-left:18px; }
.ebs-toc li { break-inside:avoid; margin:0 0 4px; }
.ebs-toc a { color:var(--text); text-decoration:none; } .ebs-toc a:hover { color:var(--accent); }
.ebs-grid { display:grid; gap:12px; }
.ebs-card { padding:12px 14px; border:1px solid var(--border); border-radius:12px; background:var(--bg-card); scroll-margin-top:120px; }
.ebs-card header { display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:4px 12px; margin-bottom:6px; }
.ebs-card h4 { margin:0; font-size:1.02em; color:var(--text); }
.ebs-card h4 small { font-weight:400; color:var(--text-mute); font-size:.82em; }
.ebs-meta { display:flex; flex-wrap:wrap; align-items:center; gap:6px; font-size:.78em; }
.ebs-src { color:var(--text-mute); }
.ebs-g { display:inline-grid; place-items:center; min-width:20px; height:20px; padding:0 5px; border-radius:6px; border:1px solid var(--border); font-weight:700; font-size:.92em; }
.ebs-g.gA { border-color:var(--accent); color:var(--accent); }
.ebs-g.gB { color:var(--text-dim); }
.ebs-g.gC { color:var(--text-mute); text-decoration:line-through; }
.ebs-mock { padding:1px 7px; border-radius:6px; background:var(--bg-elevated); color:var(--text-dim); }
.ebs-card dl { margin:0; display:grid; gap:3px; }
.ebs-card dl > div { display:grid; grid-template-columns:5.4em minmax(0,1fr); gap:8px; font-size:.9em; line-height:1.6; }
.ebs-card dt { color:var(--text-mute); font-size:.92em; }
.ebs-card dd { margin:0; color:var(--text-dim); }
.ebs-todo { color:var(--text-mute); font-style:italic; }
.ebs-q { margin:8px 0 0; padding:8px 12px; border-left:3px solid var(--accent); background:var(--bg-elevated); border-radius:0 8px 8px 0; font-size:.95em; line-height:1.9; color:var(--text); }
.ebs-rd { display:inline-flex; gap:2px; }
.ebs-rd label { display:inline-flex; align-items:center; gap:1px; padding:0 4px; border:1px solid var(--border); border-radius:6px; cursor:pointer; color:var(--text-mute); font-size:.92em; }
.ebs-rd input { margin:0 2px 0 0; accent-color:var(--accent); }
.ebs-rd label:has(input:checked) { color:var(--accent); border-color:var(--accent); }
.ebs-ov td { font-size:.9em; } .ebs-ov a { color:var(--text); }
.ebs-prog { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:8px; margin:8px 0 14px; }
.ebs-prog div { padding:8px 10px; border:1px solid var(--border); border-radius:10px; font-size:.82em; color:var(--text-dim); }
.ebs-prog b { display:block; font-size:1.2em; color:var(--text); }
.ebs-prog i { display:block; height:4px; margin-top:6px; border-radius:2px; background:var(--bg-elevated); overflow:hidden; font-style:normal; }
.ebs-prog i span { display:block; height:100%; background:var(--accent); }
.ebs-hide { display:none !important; }
.ebs-read td:first-child { white-space:nowrap; font-weight:600; }
@media (max-width:640px) { .ebs-toc { columns:1; } .ebs-card dl > div { grid-template-columns:1fr; gap:0; } .ebs-card dt { margin-top:4px; } }
@media print { .ebs-bar, .ebs-rd { display:none !important; } .ebs-card { break-inside:avoid; } }
`;

const js = `
(() => {
  const KEY = 'nm-ebs2027-read-v1';
  let st = {};
  try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  const level = (id) => st[id] || 0;
  const boxes = () => document.querySelectorAll('.ebs-rd');
  function paint() {
    boxes().forEach((b) => { const n = level(b.dataset.id); b.querySelectorAll('input').forEach((c) => { c.checked = Number(c.dataset.r) <= n; }); });
    const prog = document.getElementById('ebsProg'); if (!prog) return;
    const cards = [...document.querySelectorAll('.ebs-card')];
    const groups = ['전체', ${JSON.stringify(GENRES).slice(1, -1)}];
    prog.innerHTML = groups.map((g) => {
      const cs = cards.filter((c) => g === '전체' || c.dataset.g === g);
      const done = (r) => cs.filter((c) => level(c.id) >= r).length;
      const pct = cs.length ? Math.round(done(3) / cs.length * 100) : 0;
      return '<div><b>' + g + '</b>1회 ' + done(1) + ' · 2회 ' + done(2) + ' · 3회 ' + done(3) + ' / ' + cs.length + '<i><span style="width:' + pct + '%"></span></i></div>';
    }).join('');
  }
  document.addEventListener('change', (e) => {
    const c = e.target.closest('.ebs-rd input'); if (!c) return;
    const id = c.closest('.ebs-rd').dataset.id, r = Number(c.dataset.r);
    st[id] = c.checked ? r : r - 1; if (!st[id]) delete st[id];
    save(); paint(); apply();
  });
  const q = document.getElementById('ebsQ');
  const F = { g: '', gr: '', book: '', mock: '', todo: '' };
  document.querySelectorAll('.ebs-f button').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.k, v = b.dataset.v;
    F[k] = F[k] === v ? '' : v;
    document.querySelectorAll('.ebs-f button[data-k="' + k + '"]').forEach((x) => x.setAttribute('aria-pressed', String(F[k] === x.dataset.v)));
    apply();
  }));
  function match(el) {
    const s = (q.value || '').trim().toLowerCase();
    if (s && !s.split(/\\s+/).every((t) => el.dataset.q.includes(t))) return false;
    if (F.g && el.dataset.g !== F.g) return false;
    if (F.gr && el.dataset.gr !== F.gr) return false;
    if (F.book && el.dataset.book !== F.book) return false;
    if (F.mock && el.dataset.mock !== F.mock) return false;
    const id = el.id || el.dataset.id;
    if (F.todo && level(id) >= Number(F.todo)) return false;
    return true;
  }
  function apply() {
    let n = 0;
    document.querySelectorAll('.ebs-card').forEach((c) => { const ok = match(c); c.classList.toggle('ebs-hide', !ok); if (ok) n++; });
    document.querySelectorAll('.ebs-ov tbody tr').forEach((r) => r.classList.toggle('ebs-hide', !match(r)));
    document.querySelectorAll('.ebs-sec').forEach((s) => s.classList.toggle('ebs-hide', !s.querySelector('.ebs-card:not(.ebs-hide)')));
    document.getElementById('ebsN').textContent = n + '개 작품 표시';
  }
  q.addEventListener('input', apply);
  paint(); apply();
})();
`;

const filt = (k, v, label) => `<button type="button" data-k="${k}" data-v="${v}" aria-pressed="false">${label}</button>`;

export function ebsPage(spec) {
  const toc = [
    ["ebs-how", "이렇게 쓰세요 · 우선순위 규칙"],
    ["ebs-mocks", "6·9월 모평에 이미 나온 작품"],
    ["ebs-all", "한눈에 보는 전체 표 + 회독 체크"],
    ...GENRES.map((g) => ["ebs-" + GID[g], `문학 · ${g} (${works.filter((w) => w.g === g).length})`]),
    ["ebs-read", "독서 · 수록 지문 주제"],
    ["ebs-src", "근거 출처와 확인 못 한 것"],
  ];
  const sections = GENRES.map((g) => `<section class="ebs-sec" id="ebs-${GID[g]}"><h2>${g}</h2>
<div class="ebs-grid">
${works.filter((w) => w.g === g).map(card).join("\n")}
</div></section>`).join("\n");
  const read = (rows) => `<div class="tbl-wrap ebs-read"><table><thead><tr><th>구분</th><th>지문 주제</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("")}</tbody></table></div>`;
  return `${head("2027 수능 EBS 연계 정리 — 수능특강·수능완성", 0, spec, { extra: `<style>${css}</style>` })}
<body><div class="layout">
${aside(spec, "ebs", 0)}
<main>
<header class="paper-header">
  <h1>2027 수능 EBS 연계,<br><em>수특·수완 문학</em> 정리</h1>
  <p class="authors">수능특강 문학 · 수능완성 문학 수록 작품 ${works.length}편 + 독서 수록 지문 주제</p>
  <p class="affiliation">2026-10-27 기준 · 6·9월 모평 반영 · 1회독 요약 카드 → 2·3회독 체크로 반복 복습</p>
</header>

<div class="ebs-bar">
  <input type="search" id="ebsQ" placeholder="작품·작가·주제·소재로 찾기 (예: 유배, 윤동주, 액자, 연군)" aria-label="작품 검색">
  <div class="ebs-f">${GENRES.map((g) => filt("g", g, g)).join("")}</div>
  <div class="ebs-f">${filt("gr", "A", "우선 A")}${filt("gr", "B", "B")}${filt("gr", "C", "C(모평 출제)")}${filt("book", "수특", "수능특강")}${filt("book", "수완", "수능완성")}${filt("mock", "0", "모평 미출제만")}${filt("todo", "1", "아직 1회독 전")}${filt("todo", "3", "3회독 미완")}<span class="ebs-count" id="ebsN"></span></div>
</div>

<h2 id="ebs-toc">목차</h2>
<ol class="ebs-toc">${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ol>

<h2 id="ebs-how">이렇게 쓰세요</h2>
<ul>
<li><strong>1회독</strong>: 갈래별 카드를 위에서부터 한 번 훑습니다. 카드 하나에 주제·표현·출제 포인트만 있습니다. 다 읽으면 카드 오른쪽 <b>1</b>에 체크.</li>
<li><strong>2·3회독</strong>: 위 필터에서 <b>우선 A</b> + <b>3회독 미완</b>을 켜고 남은 카드만 다시 봅니다. 체크는 이 브라우저에 저장됩니다.</li>
<li><strong>시험 직전</strong>: ‘한눈에 보는 전체 표’만 훑고, 제목만 보고 주제가 바로 안 떠오르는 작품의 카드를 엽니다.</li>
</ul>
<div class="info-card"><h4>우선순위(A·B·C)는 이렇게 매겼습니다 — 추정입니다</h4><p><b>C</b> = 2027학년도 6·9월 모평에 이미 연계로 나온 작품(같은 해 수능에서 같은 작품이 다시 나오는 일은 드뭅니다). <b>B</b> = 수특 1부 ‘교과서 개념 학습’ 작품이거나 극·수필 갈래(연계 출제 빈도가 상대적으로 낮음). <b>A</b> = 나머지 수특 2·3부·갈래 복합과 수완 수록 작품. 평가원이 무엇을 낼지는 아무도 모르므로, 이 등급은 공부 순서를 정하는 용도로만 쓰세요.</p></div>
<div class="stat-row">${stats()}</div>
<p class="stat-note">쪽수는 확인하지 못해 ‘강·회’ 위치로 적었습니다. 카드의 ‘교재 해설로 확인’은 근거를 찾지 못해 비워 둔 칸입니다(지어내지 않았습니다). 옛 표기 인용은 교과서·수능 지문 표기 기준이며 판본마다 다를 수 있습니다.</p>

<h2 id="ebs-mocks">6·9월 모평에 이미 나온 작품</h2>
<p>6월에는 문학 8작품 중 4작품이 연계였고, 9월에는 6작품 중 3작품이 연계였습니다. 연계 작품이 모두 <strong>수능특강</strong>에서 나왔다는 점, 그리고 같은 작가의 다른 작품(작가 연계)이 쓰였다는 점을 기억하세요.</p>
${mocksTable()}

<h2 id="ebs-all">한눈에 보는 전체 표</h2>
<div class="ebs-prog" id="ebsProg"></div>
${overview()}

${sections}

<section id="ebs-read"><h2>독서 · 수록 지문 주제</h2>
<p>독서는 지문 주제와 핵심 개념만 정리했습니다. ★는 6월 모평 독서에 연계된 것으로 보도된 제재입니다(6월 모평 독서 4지문 모두 EBS 연계, 신분제·형평 운동 / 정보 비대칭 / 액체의 표면 장력). 표면 장력 지문은 수특의 ‘폐포의 표면 장력’과 ‘찻주전자 효과와 젖음성’ 중 어느 쪽인지 확인하지 못했습니다. 9월 모평 독서 연계 제재는 확인하지 못했습니다.</p>
<h3>수능특강 독서 (72지문)</h3>
${read(READING.suteuk)}
<h3>수능완성 독서 (22지문)</h3>
${read(READING.suwan)}
</section>

<section id="ebs-src"><h2>근거 출처와 확인 못 한 것</h2>
<ul>${SOURCES.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${t}</a></li>`).join("")}</ul>
<ul>
<li>수능완성 문학·독서 목록은 EBS 공식 목차가 아니라 해설 사이트(모두의 국어) 기준입니다. 교재와 한 번 대조하세요.</li>
<li>강사·카페의 ‘연계 예상’ 자료(작품별 별표)는 첨부 PDF라 열어 보지 못했습니다. 위 등급은 제가 정한 규칙입니다.</li>
<li>수특 목차 자료끼리 표기가 다른 것: 「정처관군동/정처관둔동」, 「응계설/옹계설」, 「내 영혼 술에 섞여/섞어」.</li>
</ul>
</section>
</main></div>
<script>${js}</script>
</body></html>`;
}
