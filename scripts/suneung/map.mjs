// 수능 '한눈에 요약 맵' — 카드형 인포그래픽(HTML+인라인 SVG) 빌더. 내용은 maps-*.mjs 에 데이터로만 둔다.
// 카드 = { icon, title, wide?, blocks: [...] }. 블록 종류: f(공식) kv(라벨 행) tbl(표) flow(순서) ul(목록) note(팁/함정) svg(그림) bars(출제 비중)

/* ── SVG 그리기 도구: 색은 CSS(.a .b .g .fl …)에서 카드 색(--c)을 받는다 ── */
export const svg = (w, h, inner, label = "") =>
  `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
export const T = (x, y, s, c = "", a = "") => `<text x="${x}" y="${y}"${a ? ` text-anchor="${a}"` : ""}${c ? ` class="${c}"` : ""}>${s}</text>`;
export const L = (x1, y1, x2, y2, c = "ln") => `<line class="${c}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
export const P = (d, c = "a") => `<path class="${c}" d="${d}"/>`;
export const R = (x, y, w, h, c = "fl", r = 3) => `<rect class="${c}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
export const C = (x, y, r, c = "pt") => `<circle class="${c}" cx="${x}" cy="${y}" r="${r}"/>`;
/** 좌표축(원점 ox,oy, 가로 끝 xe, 세로 끝 ye)과 축 이름 */
export function axes(ox, oy, xe, ye, xl = "", yl = "") {
  return (
    L(ox, oy, xe, oy) + L(ox, oy, ox, ye) +
    `<polygon class="ah" points="${xe},${oy} ${xe - 6},${oy - 3} ${xe - 6},${oy + 3}"/>` +
    `<polygon class="ah" points="${ox},${ye} ${ox - 3},${ye + 6} ${ox + 3},${ye + 6}"/>` +
    (xl ? T(xe, oy + 14, xl, "t-m", "end") : "") + (yl ? T(ox + 6, ye + 4, yl, "t-m") : "")
  );
}

/** 원점이 가운데인 좌표축(x0~x1, y0~y1은 화면 좌표, 교점은 cx, cy) */
export function cross(cx, cy, x0, x1, y0, y1, xl = "", yl = "") {
  return (
    L(x0, cy, x1, cy) + L(cx, y0 + 0, cx, y1) +
    `<polygon class="ah" points="${x1},${cy} ${x1 - 6},${cy - 3} ${x1 - 6},${cy + 3}"/>` +
    `<polygon class="ah" points="${cx},${y0} ${cx - 3},${y0 + 6} ${cx + 3},${y0 + 6}"/>` +
    (xl ? T(x1, cy + 14, xl, "t-m", "end") : "") + (yl ? T(cx + 6, y0 + 4, yl, "t-m") : "")
  );
}
/** 번호 칩 한 줄: 문항 번호를 색 묶음별로 칠한다. groups = [[from, to, 클래스], …] */
export function chips(from, to, x, y, groups, w = 15, gap = 2, h = 17) {
  let out = "";
  for (let n = from; n <= to; n++) {
    const g = groups.find(([a, b]) => n >= a && n <= b);
    const cx = x + (n - from) * (w + gap);
    out += `<rect class="${g ? g[2] : "box"}" x="${cx}" y="${y}" width="${w}" height="${h}" rx="3"/>` + T(cx + w / 2, y + h - 5, n, "t-n", "middle");
  }
  return out;
}

/* ── 블록 ── */
const li = (items) => items.map((x) => `<li>${x}</li>`).join("");
const BLOCKS = {
  f: (b) => `<div class="mg-f">${b.lines.join("<br>")}</div>`,
  kv: (b) => `<dl class="mg-kv">${b.rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`,
  tbl: (b) =>
    `<div class="mg-tbl"><table><thead><tr>${b.head.map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${b.rows
      .map((r) => `<tr>${r.map((x, i) => (i === 0 ? `<th scope="row">${x}</th>` : `<td>${x}</td>`)).join("")}</tr>`)
      .join("")}</tbody></table></div>`,
  flow: (b) =>
    `<ol class="mg-flow${b.v ? " v" : ""}">${b.steps
      .map((s) => (Array.isArray(s) ? `<li><b>${s[0]}</b><span>${s[1]}</span></li>` : `<li><b>${s}</b></li>`))
      .join("")}</ol>`,
  ul: (b) => `<ul class="mg-ul">${li(b.items)}</ul>`,
  note: (b) => `<p class="mg-note ${b.kind || "tip"}"><span>${b.kind === "warn" ? "⚠" : "💡"}</span>${b.text}</p>`,
  svg: (b) => `<figure class="mg-fig">${b.svg}${b.cap ? `<figcaption>${b.cap}</figcaption>` : ""}</figure>`,
  bars: (b, ctx) => {
    const w = ctx.weights || [];
    const max = Math.max(...w.map((x) => Number(x.avgPts)), 1);
    return `<div class="mg-bars">${w
      .map(
        (x) =>
          `<div class="row"><span class="lab">${x.title}</span><span class="bar"><i style="width:${((x.avgPts / max) * 100).toFixed(0)}%"></i></span><span class="num">${x.avg}문항 · ${x.avgPts}점</span></div>`
      )
      .join("")}</div>`;
  },
};

const card = (c, i, ctx) =>
  `<section class="mg-card c${(i % 6) + 1}${c.wide ? " wide" : ""}"><h3><i>${c.icon}</i>${c.title}</h3>${c.blocks
    .map((b) => {
      if (!BLOCKS[b.t]) throw new Error("알 수 없는 블록: " + b.t);
      return BLOCKS[b.t](b, ctx);
    })
    .join("")}</section>`;

/** 2열 격자에서 짝이 없어 혼자 남는 카드는 가로 전체로 넓힌다. */
function spanAlone(cards) {
  const out = [];
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (c.wide) out.push(c);
    else if (cards[i + 1] && !cards[i + 1].wide) { out.push(c, cards[i + 1]); i++; }
    else out.push({ ...c, wide: true });
  }
  return out;
}

/** m = { tagline, cards, traps: [[틀린 말, 맞는 말], …], ask }, ctx = { weights, stat } */
export function mapHtml(m, ctx = {}) {
  const traps = m.traps?.length
    ? `<div class="mg-traps"><h3>⚠ 이 파트 함정 — 이렇게 속입니다</h3><ul>${m.traps
        .map(([w, r]) => `<li><s>${w}</s><b>→</b><em>${r}</em></li>`)
        .join("")}</ul></div>`
    : "";
  return `<div class="mg">
<div class="mg-top"><span class="mg-chip">📌 한눈에 요약</span><span class="mg-tag">${m.tagline}</span>${ctx.stat ? `<span class="mg-stat">${ctx.stat}</span>` : ""}</div>
<div class="mg-grid">${spanAlone(m.cards).map((c, i) => card(c, i, ctx)).join("\n")}</div>
${traps}
${m.ask ? `<p class="mg-ask"><b>수능은 이렇게 묻는다</b>${m.ask}</p>` : ""}
</div>`;
}

export const mapCss = `
/* ── 한눈에 요약 맵 ── */
.mg { margin:26px 0 8px; --r:14px; }
.mg-top { display:flex; flex-wrap:wrap; align-items:center; gap:10px; margin-bottom:14px; }
.mg-chip { padding:5px 12px; border-radius:999px; background:var(--accent); color:#fff; font-size:.8em; font-weight:700; letter-spacing:.02em; }
.mg-tag { font-weight:600; color:var(--text); }
.mg-stat { margin-left:auto; font-size:.8em; color:var(--text-mute); font-family:var(--font-mono); }
.mg-grid { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:14px; }
.mg-card { --c:#2563eb; min-width:0; padding:14px 16px 14px; border:1px solid var(--border); border-top:3px solid var(--c); border-radius:var(--r); background:var(--bg-card); }
.mg-card.wide { grid-column:1 / -1; }
.mg-card.c1 { --c:#2563eb; } .mg-card.c2 { --c:#0d9488; } .mg-card.c3 { --c:#d97706; }
.mg-card.c4 { --c:#db2777; } .mg-card.c5 { --c:#7c3aed; } .mg-card.c6 { --c:#16a34a; }
.mg-card h3 { display:flex; align-items:center; gap:8px; margin:0 0 10px; padding:0; font-size:1.02em; line-height:1.35; color:var(--text); font-family:var(--font-body); }
.mg-card h3 i { font-style:normal; display:grid; place-items:center; width:28px; height:28px; border-radius:8px; background:color-mix(in srgb, var(--c) 14%, transparent); font-size:15px; flex:none; }
.mg-card > * + * { margin-top:10px; }
.mg-f { padding:9px 12px; border-radius:10px; background:color-mix(in srgb, var(--c) 9%, var(--bg-elevated)); border-left:3px solid var(--c); font-family:var(--font-mono); font-size:.86em; line-height:1.85; color:var(--text); overflow-x:auto; white-space:pre-wrap; }
.mg-kv { margin:0; display:grid; gap:6px; }
.mg-kv > div { display:grid; grid-template-columns:auto minmax(0,1fr); gap:4px 10px; align-items:baseline; }
.mg-kv dt { padding:1px 9px; border-radius:6px; background:color-mix(in srgb, var(--c) 14%, transparent); color:var(--c); font-size:.8em; font-weight:700; white-space:nowrap; }
.mg-kv dd { margin:0; font-size:.88em; line-height:1.6; color:var(--text-dim); }
.mg-tbl { overflow-x:auto; }
.mg-tbl table { width:100%; border-collapse:collapse; font-size:.8em; line-height:1.5; }
.mg-tbl th, .mg-tbl td { padding:5px 8px; border:1px solid var(--border); text-align:left; vertical-align:top; color:var(--text-dim); }
.mg-tbl thead th { background:color-mix(in srgb, var(--c) 12%, transparent); color:var(--text); font-weight:700; white-space:nowrap; }
.mg-tbl tbody th { background:var(--bg-elevated); color:var(--text); font-weight:600; white-space:nowrap; }
.mg-flow { list-style:none; margin:0; padding:0; display:flex; flex-wrap:wrap; gap:6px 4px; align-items:stretch; }
.mg-flow li { margin:0; position:relative; display:flex; flex-direction:column; gap:1px; padding:6px 10px; border-radius:9px; background:color-mix(in srgb, var(--c) 10%, var(--bg-elevated)); border:1px solid color-mix(in srgb, var(--c) 28%, transparent); font-size:.82em; line-height:1.4; color:var(--text); }
.mg-flow li b { font-weight:700; }
.mg-flow li span { font-size:.88em; color:var(--text-mute); }
.mg-flow li + li { margin-left:14px; }
.mg-flow li + li::before { content:'→'; position:absolute; left:-15px; top:50%; transform:translateY(-50%); color:var(--c); font-weight:700; }
.mg-flow.v { flex-direction:column; gap:12px; }
.mg-flow.v li + li { margin-left:0; }
.mg-flow.v li + li::before { content:'↓'; left:14px; top:-13px; transform:none; }
.mg-ul { margin:0; padding-left:18px; }
.mg-ul li { margin:0 0 3px; font-size:.86em; line-height:1.6; color:var(--text-dim); }
.mg-note { margin:0; display:flex; gap:8px; padding:8px 11px; border-radius:10px; font-size:.84em; line-height:1.6; color:var(--text-dim); background:color-mix(in srgb, #f59e0b 12%, transparent); border:1px solid color-mix(in srgb, #f59e0b 30%, transparent); }
.mg-note.warn { background:color-mix(in srgb, #e11d48 10%, transparent); border-color:color-mix(in srgb, #e11d48 28%, transparent); }
.mg-note span { flex:none; }
.mg-fig { margin:0; }
.mg-fig svg { display:block; width:100%; height:auto; max-height:230px; color:var(--text-dim); }
.mg-card.wide .mg-fig svg { max-width:540px; margin:0 auto; }
.mg-fig figcaption { margin-top:2px; font-size:.74em; color:var(--text-mute); text-align:center; }
.mg-fig text { fill:currentColor; font-size:12px; font-family:inherit; }
.mg-fig .t-a { fill:var(--c); font-weight:700; } .mg-fig .t-b { fill:#e11d48; font-weight:700; } .mg-fig .t-g { fill:#16a34a; font-weight:700; }
.mg-fig .t-m { fill:var(--text-mute); font-size:11px; } .mg-fig .t-s { font-size:11px; }
.mg-fig .ln { stroke:currentColor; stroke-opacity:.5; stroke-width:1; fill:none; }
.mg-fig .dash { stroke:currentColor; stroke-opacity:.45; stroke-width:1; stroke-dasharray:3 3; fill:none; }
.mg-fig .ah { fill:currentColor; fill-opacity:.55; }
.mg-fig .a { stroke:var(--c); stroke-width:2.4; fill:none; stroke-linecap:round; stroke-linejoin:round; }
.mg-fig .b { stroke:#e11d48; stroke-width:2.4; fill:none; stroke-linecap:round; stroke-linejoin:round; }
.mg-fig .g { stroke:#16a34a; stroke-width:2.4; fill:none; stroke-linecap:round; stroke-linejoin:round; }
.mg-fig .fl { fill:var(--c); fill-opacity:.18; stroke:none; }
.mg-fig .fb { fill:#e11d48; fill-opacity:.16; stroke:none; }
.mg-fig .box { fill:var(--bg-elevated); stroke:currentColor; stroke-opacity:.35; stroke-width:1; }
.mg-fig .boxa { fill:color-mix(in srgb, var(--c) 14%, transparent); stroke:var(--c); stroke-width:1.2; }
.mg-fig .pt { fill:var(--c); } .mg-fig .ptb { fill:#e11d48; }
.mg-fig .f1 { fill:#2563eb; fill-opacity:.28; } .mg-fig .f2 { fill:#0d9488; fill-opacity:.3; } .mg-fig .f3 { fill:#d97706; fill-opacity:.32; }
.mg-fig .f4 { fill:#db2777; fill-opacity:.28; } .mg-fig .f5 { fill:#7c3aed; fill-opacity:.28; } .mg-fig .f6 { fill:#16a34a; fill-opacity:.3; }
.mg-fig .t-n { font-size:9.5px; }
.mg-bars { display:grid; gap:6px; }
.mg-bars .row { display:grid; grid-template-columns:minmax(0,9.5em) minmax(0,1fr) auto; gap:8px; align-items:center; font-size:.8em; color:var(--text-dim); }
.mg-bars .lab { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--text); }
.mg-bars .bar { height:10px; border-radius:999px; background:var(--bg-elevated); overflow:hidden; }
.mg-bars .bar i { display:block; height:100%; border-radius:999px; background:var(--c); }
.mg-bars .num { font-family:var(--font-mono); font-size:.9em; white-space:nowrap; color:var(--text-mute); }
.mg-traps { margin-top:14px; padding:12px 16px 8px; border:1px solid color-mix(in srgb, #e11d48 30%, transparent); border-radius:var(--r); background:color-mix(in srgb, #e11d48 6%, var(--bg-card)); }
.mg-traps h3 { margin:0 0 8px; padding:0; font-size:1em; color:#e11d48; font-family:var(--font-body); }
.mg-traps ul { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:4px 22px; }
.mg-traps li { margin:0 0 4px; padding:0; font-size:.84em; line-height:1.55; color:var(--text-dim); }
.mg-traps s { color:var(--text-mute); text-decoration-color:#e11d48; text-decoration-thickness:1.5px; }
.mg-traps b { margin:0 6px; color:var(--text-mute); }
.mg-traps em { font-style:normal; font-weight:600; color:var(--text); }
.mg-ask { margin:12px 0 0; padding:9px 14px; border-radius:10px; background:var(--bg-elevated); font-size:.86em; line-height:1.6; color:var(--text-dim); }
.mg-ask b { margin-right:10px; color:var(--accent); }
.mg-gallery { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px,1fr)); gap:16px; margin-top:16px; }
.mg-gcard { overflow:hidden; border:1px solid var(--border); border-radius:12px; background:var(--bg-card); display:flex; flex-direction:column; }
.mg-gcard img { display:block; width:100%; aspect-ratio:16 / 9; object-fit:cover; background:#0a0e1a; }
.mg-gcard .gi { padding:10px 14px 14px; }
.mg-gcard .gp { font-size:.72em; font-weight:700; color:var(--accent); font-family:var(--font-mono); }
.mg-gcard .gt { margin:3px 0 2px; font-weight:600; font-size:.95em; }
.mg-gcard .gd { margin-bottom:8px; font-size:.78em; color:var(--text-dim); line-height:1.55; }
details.mg-wrap { margin:22px 0; }
details.mg-wrap > summary { cursor:pointer; padding:10px 14px; border:1px solid var(--border); border-radius:10px; background:var(--bg-card); font-weight:700; list-style:none; }
details.mg-wrap[open] > summary { margin-bottom:6px; }
.sumpage main { max-width:1120px; }
@media (max-width: 760px) {
  .mg-grid { grid-template-columns:minmax(0,1fr); }
  .mg-traps ul { grid-template-columns:minmax(0,1fr); }
  .mg-bars .row { grid-template-columns:minmax(0,7em) minmax(0,1fr); } .mg-bars .num { grid-column:1 / -1; margin-top:-4px; }
  .mg-stat { margin-left:0; }
}
@media print { .mg-card { break-inside:avoid; } }
`;
