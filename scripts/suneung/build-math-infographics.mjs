// 수능 수학 이미지 요약 맵 10~12 (다항함수 그래프의 비율 관계·넓이 공식)를 SVG 로 만든다.
//   node scripts/suneung/build-math-infographics.mjs
// 01~09 는 손으로 만든 정적 파일이고, 이 세 장은 곡선을 식으로 그려야 해서 여기서 만든다(곡선·치수선 좌표를 식에서 계산).
// <img> 로 불러오는 SVG 는 웹 글꼴을 못 쓰므로 글자 폭에 여유를 둔다(한 줄 폭은 아래 fit 검사 참고).
import fs from "node:fs";

const OUT = new URL("../../public/learn/aboutSuneungMath/images/", import.meta.url);
const INK = "#e2e8f0", DIM = "#94a3b8", MUTE = "#64748b", GOLD = "#fbbf24", MINT = "#34d399", PANEL = "#0b1220";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const r1 = (v) => Math.round(v * 10) / 10;

/* 글자: *강조* 는 강조색 굵게 */
function rich(s, accent) {
  return String(s).split("*").map((p, i) => (i % 2 ? `<tspan fill="${accent}" font-weight="700">${esc(p)}</tspan>` : esc(p))).join("");
}

/* 그래프 상자: 수학 좌표 → 화면 좌표 */
function plot(id, box, range) {
  const { x, y, w, h } = box, pad = 12;
  const X = (v) => r1(x + pad + ((v - range.x0) / (range.x1 - range.x0)) * (w - 2 * pad));
  const Y = (v) => r1(y + h - pad - ((v - range.y0) / (range.y1 - range.y0)) * (h - 2 * pad));
  const out = [];
  const halo = `stroke="${PANEL}" stroke-width="3.5" paint-order="stroke" stroke-linejoin="round"`;
  const api = {
    X, Y,
    curve(f, a, b, o = {}) {
      const n = 140, pts = [];
      for (let i = 0; i <= n; i++) { const t = a + ((b - a) * i) / n; pts.push(`${X(t)},${Y(f(t))}`); }
      out.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="${o.stroke || INK}" stroke-width="${o.width || 2.2}" stroke-linejoin="round" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`);
      return api;
    },
    area(top, bot, a, b, fill, op = 0.3) {
      const n = 80, up = [], dn = [];
      for (let i = 0; i <= n; i++) { const t = a + ((b - a) * i) / n; up.push(`${X(t)},${Y(top(t))}`); dn.unshift(`${X(t)},${Y(bot(t))}`); }
      out.push(`<polygon points="${up.concat(dn).join(" ")}" fill="${fill}" fill-opacity="${op}"/>`);
      return api;
    },
    seg(xa, ya, xb, yb, o = {}) {
      out.push(`<line x1="${X(xa)}" y1="${Y(ya)}" x2="${X(xb)}" y2="${Y(yb)}" stroke="${o.stroke || DIM}" stroke-width="${o.width || 1.2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`);
      return api;
    },
    dot(px, py, o = {}) {
      out.push(`<circle cx="${X(px)}" cy="${Y(py)}" r="${o.r || 3.4}" fill="${o.fill || INK}" stroke="${PANEL}" stroke-width="1.2"/>`);
      return api;
    },
    txt(px, py, s, o = {}) {
      out.push(`<text x="${r1(X(px) + (o.dx || 0))}" y="${r1(Y(py) + (o.dy || 0))}" fill="${o.fill || DIM}" font-size="${o.size || 12}" font-weight="${o.weight || 600}" text-anchor="${o.anchor || "middle"}" ${halo}>${esc(s)}</text>`);
      return api;
    },
    /* 가로 치수선: y 높이에서 oy 픽셀만큼 떨어진 곳에 xa~xb, 가운데 글자 */
    hdim(xa, xb, py, s, o = {}) {
      const yy = r1(Y(py) + (o.oy || 0)), c = o.color || GOLD, a = X(xa), b = X(xb);
      out.push(`<path d="M${a},${yy - 4}V${yy + 4}M${b},${yy - 4}V${yy + 4}M${a},${yy}H${b}" stroke="${c}" stroke-width="1.4" fill="none"/>`);
      out.push(`<text x="${r1((a + b) / 2)}" y="${r1(yy + (o.ty ?? -6))}" fill="${c}" font-size="${o.size || 13}" font-weight="800" text-anchor="middle" ${halo}>${esc(s)}</text>`);
      return api;
    },
    /* 세로 치수선: x 에서 ox 픽셀만큼 떨어진 곳에 ya~yb, 옆에 글자 */
    vdim(px, ya, yb, s, o = {}) {
      const xx = r1(X(px) + (o.ox || 0)), c = o.color || GOLD, a = Y(ya), b = Y(yb);
      out.push(`<path d="M${xx - 4},${a}H${xx + 4}M${xx - 4},${b}H${xx + 4}M${xx},${a}V${b}" stroke="${c}" stroke-width="1.4" fill="none"/>`);
      out.push(`<text x="${r1(xx + (o.tx ?? 8))}" y="${r1((a + b) / 2 + 4)}" fill="${c}" font-size="${o.size || 13}" font-weight="800" text-anchor="${(o.tx ?? 8) < 0 ? "end" : "start"}" ${halo}>${esc(s)}</text>`);
      return api;
    },
    svg() {
      return `<clipPath id="${id}"><rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" rx="9"/></clipPath>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${PANEL}" stroke="#1f2937"/>
<g clip-path="url(#${id})">${out.join("\n")}</g>`;
    },
  };
  return api;
}

/* 카드: 알약 라벨 · 제목 · 그래프 · 글 */
const CARD_W = 360, CARD_H = 446, GBOX = { x: 16, y: 84, w: 328, h: 194 };
function card(i, accent, c) {
  const x = 40 + i * 380, y = 132;
  let ty = 300;
  const rows = [];
  for (const it of c.rows) {
    if (it.box) {
      const h = 14 + it.box.length * 19;
      rows.push(`<rect x="16" y="${ty - 14}" width="328" height="${h}" rx="8" fill="${accent}" fill-opacity="0.09" stroke="${accent}" stroke-opacity="0.55"/>`);
      it.box.forEach((l, k) => rows.push(`<text data-fit="304" x="28" y="${ty + 5 + k * 19}" fill="${INK}" font-size="12.5" font-weight="600">${rich(l, accent)}</text>`));
      ty += h + 10;
    } else {
      rows.push(`<circle cx="22" cy="${ty - 4}" r="2.6" fill="${accent}"/>`);
      it.b.forEach((l, k) => rows.push(`<text data-fit="312" x="32" y="${ty + k * 18}" fill="${k ? DIM : INK}" font-size="12.5" font-weight="${k ? 500 : 600}">${rich(l, accent)}</text>`));
      ty += it.b.length * 18 + 7;
    }
  }
  if (ty - 12 > CARD_H) throw new Error(`card ${c.title}: 글이 카드 밖으로 (${ty})`);
  const pillW = 26 + [...c.pill].reduce((s, ch) => s + (ch.charCodeAt(0) > 255 ? 10.4 : 4.6), 0);
  return `<g transform="translate(${x}, ${y})">
<rect width="${CARD_W}" height="${CARD_H}" rx="16" fill="#111827" fill-opacity="0.92" stroke="${accent}" stroke-width="1.2" filter="url(#card-shadow)"/>
<rect x="18" y="16" width="${r1(pillW)}" height="24" rx="12" fill="${accent}" fill-opacity="0.14" stroke="${accent}" stroke-opacity="0.7"/>
<text x="${r1(18 + pillW / 2)}" y="32" fill="${accent}" font-size="11" font-weight="700" text-anchor="middle">${esc(c.pill)}</text>
<text data-fit="324" x="18" y="64" fill="#ffffff" font-size="17" font-weight="700">${esc(c.title)}</text>
<line x1="18" y1="74" x2="342" y2="74" stroke="#334155"/>
${c.graph}
${rows.join("\n")}
</g>`;
}

function page({ no, accent, title, sub, cards, tags }) {
  let tx = 40;
  const chips = tags.map((t) => {
    const w = 22 + [...t].reduce((s, ch) => s + (ch.charCodeAt(0) > 255 ? 12 : 7), 0);
    const g = `<g transform="translate(${tx}, 606)"><rect width="${w}" height="28" rx="14" fill="#1e293b" stroke="#334155"/><text x="${w / 2}" y="19" fill="#cbd5e1" font-size="12" font-weight="600" text-anchor="middle">${esc(t)}</text></g>`;
    tx += w + 10;
    return g;
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="100%" height="100%" style="background:#0a0e1a; font-family:'IBM Plex Sans KR', -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;">
<defs>
<radialGradient id="bg-glow" cx="20%" cy="15%" r="60%"><stop offset="0%" stop-color="${accent}" stop-opacity="0.18"/><stop offset="60%" stop-color="#0a0e1a" stop-opacity="0.95"/><stop offset="100%" stop-color="#05070d"/></radialGradient>
<filter id="card-shadow" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/></filter>
</defs>
<rect width="1200" height="675" fill="url(#bg-glow)"/>
<g transform="translate(40, 26)">
<rect width="232" height="30" rx="6" fill="#1e293b" stroke="${accent}" stroke-width="1.2"/>
<circle cx="15" cy="15" r="4" fill="${accent}"/>
<text x="28" y="20" fill="#f1f5f9" font-size="12" font-weight="700" letter-spacing="1">수능 수학 핵심요약</text>
<text x="220" y="20" fill="${accent}" font-size="12" font-weight="800" text-anchor="end">MAP ${no}</text>
<text data-fit="860" x="0" y="66" fill="#ffffff" font-size="32" font-weight="800" letter-spacing="-0.5">${esc(title)}</text>
<text data-fit="860" x="0" y="90" fill="#94a3b8" font-size="14" font-weight="500">${esc(sub)}</text>
<g transform="translate(940, 8)"><rect width="180" height="60" rx="10" fill="#111827" stroke="#334155"/>
<text x="90" y="26" fill="#64748b" font-size="10" font-weight="700" text-anchor="middle" letter-spacing="1">NANAMATE EDUTECH</text>
<text x="90" y="47" fill="${accent}" font-size="13" font-weight="800" text-anchor="middle">그래프로 보는 비율 관계</text></g>
</g>
${cards.map((c, i) => card(i, accent, c)).join("\n")}
${chips}
<text x="1160" y="650" fill="${MUTE}" font-size="11" text-anchor="end">nanamate.study · a는 최고차항의 계수</text>
</svg>
`;
}

/* ───────── MAP 10 · 이차함수 ───────── */
function map10() {
  const A = "#38bdf8";
  // ① 포물선 y = x² 과 x = −1.5, 2.1 에서의 두 접선
  const al = -1.5, be = 2.1, m = (al + be) / 2, f = (x) => x * x, tan = (p) => (x) => 2 * p * (x - p) + p * p;
  const chord = (x) => f(al) + ((f(be) - f(al)) / (be - al)) * (x - al);
  const g1 = plot("m10a", GBOX, { x0: -2.5, x1: 3.1, y0: -4.0, y1: 5.4 })
    .area(chord, f, al, be, A, 0.28)
    .area(f, tan(al), al, m, MINT, 0.3).area(f, tan(be), m, be, MINT, 0.3)
    .curve(f, -2.5, 3.1).curve(tan(al), -2.5, 0.75, { stroke: DIM, width: 1.4 }).curve(tan(be), -0.1, 3.1, { stroke: DIM, width: 1.4 })
    .seg(al, f(al), be, f(be), { stroke: A, width: 1.6 })
    .seg(m, al * be, m, chord(m), { stroke: GOLD, dash: "4 3", width: 1.3 })
    .dot(al, f(al)).dot(be, f(be)).dot(m, al * be, { fill: GOLD }).dot(m, f(m), { fill: GOLD }).dot(m, chord(m), { fill: GOLD })
    .txt(m, (al * be + f(m)) / 2, "1", { dx: 11, dy: 4, fill: GOLD, size: 13, weight: 800 }).txt(m, (f(m) + chord(m)) / 2, "1", { dx: 11, dy: 4, fill: GOLD, size: 13, weight: 800 })
    .txt(m, al * be, "P", { dx: -12, dy: 4 }).txt(m, f(m), "Q", { dx: -12, dy: 13 }).txt(m, chord(m), "M", { dx: -12, dy: -4 })
    .txt(al, f(al), "α", { dx: -13, dy: -7, size: 13 }).txt(be, f(be), "β", { dx: 13, dy: 2, size: 13 })
    .txt(1.25, 1.75, "넓이 2", { fill: A, size: 11.5, weight: 700 }).txt(1.2, -0.75, "넓이 1", { fill: MINT, size: 11.5, weight: 700, dx: 22 });
  // ② y = −(x−3)² + 6 : x축과 y = −3
  const h = (x) => -(x - 3) * (x - 3) + 6, s6 = Math.sqrt(6);
  const g2 = plot("m10b", GBOX, { x0: -3.4, x1: 7.9, y0: -5.2, y1: 7.6 })
    .seg(-3.4, 0, 7.9, 0, { stroke: MUTE }).seg(-3.4, -3, 7.9, -3, { stroke: MUTE })
    .curve(h, -0.45, 6.45).seg(3, 6, 3, -3, { stroke: MUTE, dash: "3 3" }).seg(-2.6, 6, 3, 6, { stroke: MUTE, dash: "3 3" })
    .dot(3, 6, { fill: A }).dot(3 - s6, 0).dot(3 + s6, 0).dot(0, -3).dot(6, -3)
    .hdim(3, 3 + s6, 0, "√6", { oy: -9 }).hdim(0, 3, -3, "3", { oy: -9 }).hdim(3, 6, -3, "3", { oy: -9 })
    .vdim(-1.4, 6, 0, "6", { tx: -8, color: A }).vdim(-2.6, 6, -3, "9", { tx: -8, color: A })
    .txt(3 - s6, 0, "α", { dx: -13, dy: -7, size: 13 }).txt(3 + s6, 0, "β", { dx: 13, dy: -7, size: 13 })
    .txt(0, -3, "k", { dx: -12, dy: -7, size: 12 }).txt(6, -3, "k+6", { dx: 20, dy: -7, size: 12 })
    .txt(7.8, 0, "x축", { anchor: "end", dy: 14, size: 10.5, fill: MUTE }).txt(7.8, -3, "y = −3", { anchor: "end", dy: 14, size: 10.5, fill: MUTE });
  // ③ y = 3(x−1)(x−5)
  const q = (x) => 3 * (x - 1) * (x - 5);
  const g3 = plot("m10c", GBOX, { x0: -0.6, x1: 6.6, y0: -15.5, y1: 8.5 })
    .seg(-0.6, 0, 6.6, 0, { stroke: MUTE }).curve(q, 0.45, 5.55)
    .dot(1, 0).dot(5, 0).dot(3, -12, { fill: A })
    .hdim(1, 3, 0, "2", { oy: -9 }).hdim(3, 5, 0, "2", { oy: -9 })
    .vdim(3, 0, -12, "−12", { ox: 0, tx: 9, color: A })
    .txt(1, 0, "1", { dx: -10, dy: 16, size: 12 }).txt(5, 0, "5", { dx: 10, dy: 16, size: 12 })
    .txt(-0.5, -14.6, "최고차항의 계수 3", { anchor: "start", size: 11, fill: DIM });
  return page({
    no: "10", accent: A, title: "이차함수 — 포물선의 길이·넓이·기울기", sub: "Parabola: tangent ratios, width & height, values from the factored form",
    cards: [
      { pill: "길이비 1 : 1 · 넓이비 1 : 2", title: "포물선과 두 접선", graph: g1.svg(), rows: [
        { b: ["두 접선이 만나는 점 P는 *두 접점의 한가운데*", "(P의 x좌표 = α와 β의 중점)"] },
        { b: ["세로 길이 *PQ : QM = 1 : 1*", "Q는 포물선 위, M은 두 접점을 이은 선분의 중점"] },
        { box: ["두 접점을 이은 선분과 포물선 사이: *|a|/6 · (β−α)³*", "두 접선과 포물선 사이: *|a|/12 · (β−α)³*  (1 : 2)"] },
      ] },
      { pill: "폭과 높이", title: "꼭짓점에서 가로 k → 세로 |a|k²", graph: g2.svg(), rows: [
        { b: ["꼭짓점에서 가로로 k 가면 세로로 *|a|k²* 내려간다", "그 점에서의 접선의 기울기는 *2|a|k*"] },
        { box: ["a = −1 인 포물선이 y = −3 과 k, k+6 에서 만난다", "→ 반폭 3 이므로 꼭짓점은 *9* 위 (x축에서는 6 위)", "→ x축에서는 반폭 √6, *β − α = 2√6*"] },
      ] },
      { pill: "상대적 위치", title: "인수 꼴이면 함숫값은 거리의 곱", graph: g3.svg(), rows: [
        { b: ["f(x) = a(x−α)(x−β) 이면", "*f(p) = a × (p−α) × (p−β)*"] },
        { b: ["꼭짓점의 y좌표: *3 × 2 × (−2) = −12*"] },
        { box: ["근에서의 기울기 = a × (다른 근까지의 거리)", "f′(5) = 3 × (5−1) = *12*,  f′(1) = *−12*"] },
      ] },
    ],
    tags: ["#두접선중점", "#길이비1:1", "#넓이비1:2", "#폭과높이", "#인수꼴함숫값"],
  });
}

/* ───────── MAP 11 · 삼차함수 ───────── */
function map11() {
  const A = "#f59e0b", s3 = Math.sqrt(3);
  const f = (x) => x * x * x - 3 * x;
  const g1 = plot("m11a", GBOX, { x0: -2.75, x1: 2.75, y0: -4.3, y1: 3.2 })
    .seg(-s3, 0, s3, 0, { stroke: MINT, width: 1.4 }).seg(-1, 2, 2, 2, { stroke: A, dash: "5 3", width: 1.3 }).seg(-2, -2, 1, -2, { stroke: A, dash: "5 3", width: 1.3 });
  for (const v of [-2, -1, 0, 1, 2]) g1.seg(v, f(v), v, -3.35, { stroke: MUTE, dash: "2 3", width: 1 });
  g1.curve(f, -2.2, 2.2)
    .dot(-1, 2, { fill: A }).dot(2, 2, { fill: A }).dot(1, -2, { fill: A }).dot(-2, -2, { fill: A }).dot(0, 0, { fill: MINT }).dot(s3, 0, { fill: MINT }).dot(-s3, 0, { fill: MINT });
  for (const v of [-2, -1, 0, 1]) g1.hdim(v, v + 1, -3.35, "1", { oy: 0, ty: 15, color: GOLD, size: 12 });
  g1.hdim(0, s3, 0, "√3", { oy: -10, color: MINT, size: 12 }).hdim(-1, 0, 0, "1", { oy: 10, ty: 16, color: MINT, size: 12 })
    .txt(-1, 2, "극대", { dy: -8, size: 10.5 }).txt(1, -2, "극소", { dx: 19, dy: 15, size: 10.5 }).txt(0, 0, "대칭점", { dx: 24, dy: 17, size: 10.5, fill: MINT });
  // ② (x−1)(x−4)²
  const d = (x) => (x - 1) * (x - 4) * (x - 4);
  const g2 = plot("m11b", GBOX, { x0: 0.1, x1: 5.5, y0: -2.6, y1: 6.2 })
    .seg(0.1, 0, 5.5, 0, { stroke: MUTE }).curve(d, 0.62, 5.28).seg(2, 0, 2, 4, { stroke: MUTE, dash: "3 3" })
    .dot(1, 0).dot(4, 0).dot(2, 4, { fill: A })
    .hdim(1, 2, 0, "a = 1", { oy: 12, ty: 17, size: 12 }).hdim(2, 4, 0, "b = 2", { oy: 12, ty: 17, size: 12 })
    .vdim(2, 0, 4, "4", { ox: 0, tx: -9, color: A })
    .txt(1, 0, "1", { dx: -9, dy: -7, size: 12 }).txt(4, 0, "4", { dx: 13, dy: 16, size: 12 }).txt(2, 4, "극대 (x = 2)", { dy: -9, size: 11 });
  // ③ (x−1)(x−4)(x−5) 와 x = 1 에서의 접선
  const t = (x) => (x - 1) * (x - 4) * (x - 5);
  const g3 = plot("m11c", GBOX, { x0: 0.0, x1: 6.2, y0: -4.6, y1: 9.2 })
    .seg(0, 0, 6.2, 0, { stroke: MUTE }).curve(t, 0.72, 5.62).seg(0.66, -4.1, 1.72, 8.6, { stroke: A, width: 1.6 })
    .dot(1, 0, { fill: A }).dot(4, 0).dot(5, 0)
    .hdim(1, 4, 0, "3", { oy: 13, ty: 17, size: 12 }).hdim(1, 5, 0, "4", { oy: 36, ty: 17, size: 12 })
    .txt(1, 0, "1", { dx: -11, dy: -6, size: 12 }).txt(4, 0, "4", { dx: 9, dy: -8, size: 12 }).txt(5, 0, "5", { dx: 12, dy: 15, size: 12 })
    .txt(1.72, 8.6, "기울기 12", { dx: 34, dy: 12, size: 11.5, fill: A, weight: 700 });
  return page({
    no: "11", accent: A, title: "삼차함수 — 비율 관계와 거리의 곱", sub: "Cubic: equal spacing, 1 : 2 division, slopes & values from the factored form",
    cards: [
      { pill: "같은 간격 · 1 : √3", title: "삼차함수의 비율 관계", graph: g1.svg(), rows: [
        { b: ["극점 높이의 수평선이 곡선과 다시 만나는 점", "까지, 가로 간격이 모두 같다 → *1 : 1 : 1 : 1*"] },
        { b: ["접점에서 다시 만나는 점까지를 반대쪽 극점이", "*2 : 1* 로 나눈다 (가운데가 대칭점)"] },
        { box: ["대칭점을 지나는 수평선: 극점까지 가로 1 이면", "곡선과 만나는 점까지는 *√3*"] },
      ] },
      { pill: "1 : 2 로 나누는 곳", title: "중근이 있는 삼차함수", graph: g2.svg(), rows: [
        { b: ["y = k(x−α)(x−β)² 의 극점은", "α와 β(접하는 점) 사이를 *1 : 2* 로 나눈다"] },
        { b: ["극값 = *k × a × b²*  (근까지의 거리의 곱)"] },
        { box: ["(x−1)(x−4)² : 극대는 x = 2", "극댓값 = 1 × 1 × 2² = *4*"] },
      ] },
      { pill: "f′ 을 인수 꼴로", title: "기울기도 거리의 곱", graph: g3.svg(), rows: [
        { b: ["근 α에서의 기울기 = a × (다른 근까지의 거리의 곱)", "(x−1)(x−4)(x−5) : f′(1) = 3 × 4 = *12*"] },
        { box: ["최고차항의 계수 1, 극점이 x = 1, 5 인 삼차함수", "→ f′(x) = *3*(x−1)(x−5)  (도함수의 계수는 3배)", "f′(6) = 3 × 5 × 1 = *15*", "대칭점 x = 3 의 기울기 = 3 × 2 × (−2) = *−12*"] },
      ] },
    ],
    tags: ["#삼차비율1:1:1:1", "#대칭점√3", "#중근1:2", "#극값은거리의곱", "#도함수인수꼴"],
  });
}

/* ───────── MAP 12 · 사차함수와 넓이 공식 ───────── */
function map12() {
  const A = "#a78bfa", s2 = Math.SQRT2;
  const w = (x) => x * x * x * x - 2 * x * x;
  const g1 = plot("m12a", GBOX, { x0: -1.95, x1: 1.95, y0: -1.75, y1: 1.5 })
    .seg(-s2, 0, s2, 0, { stroke: A, dash: "5 3", width: 1.3 }).curve(w, -1.66, 1.66)
    .seg(1, 0, 1, -1.28, { stroke: MUTE, dash: "3 3" }).seg(0, 0, 0, -1.28, { stroke: MUTE, dash: "3 3" })
    .dot(0, 0, { fill: A }).dot(1, -1).dot(-1, -1).dot(s2, 0, { fill: A }).dot(-s2, 0, { fill: A })
    .hdim(0, s2, 0, "√2", { oy: -10, size: 12 }).hdim(0, 1, -1.28, "1", { ty: 16, size: 12 })
    .vdim(-1, 0, -1, "h", { ox: 0, tx: -9, color: MINT })
    .txt(0, 0, "극대", { dx: -22, dy: -8, size: 10.5 }).txt(1, -1, "극소", { dx: 24, dy: 5, size: 10.5 });
  // ② x³(x−4)
  const u = (x) => x * x * x * (x - 4);
  const g2 = plot("m12b", GBOX, { x0: -2.0, x1: 5.0, y0: -36, y1: 26 })
    .seg(-2, 0, 5, 0, { stroke: A, dash: "5 3", width: 1.3 }).curve(u, -1.62, 4.27)
    .seg(3, 0, 3, -27, { stroke: MUTE, dash: "3 3" })
    .dot(0, 0, { fill: A }).dot(4, 0, { fill: A }).dot(3, -27)
    .hdim(0, 3, 0, "3", { oy: -10, size: 12 }).hdim(3, 4, 0, "1", { oy: -10, size: 12 })
    .vdim(3, 0, -27, "깊이", { ox: 0, tx: -9, color: MINT, size: 11.5 })
    .txt(0, 0, "α (세 번 겹친 근)", { dx: 2, dy: 17, size: 10.5 }).txt(4, 0, "β", { dx: 12, dy: 16, size: 13 }).txt(3, -27, "극소", { dy: 16, size: 10.5 });
  // ③ 넓이 공식 네 가지: 작은 그림 + 식
  const mini = (id, yy, draw) => { const p = plot(id, { x: 16, y: yy, w: 84, h: 62 }, draw.range); draw.fn(p); return p.svg(); };
  const par = (x) => x * x, line = () => 1.44;
  const rowsG = [
    { y: 84, t: "포물선과 직선", s: "|a|/6 · (β−α)³", range: { x0: -1.7, x1: 1.7, y0: -0.5, y1: 2.6 }, fn: (p) => p.area(line, par, -1.2, 1.2, A, 0.4).curve(par, -1.6, 1.6, { width: 1.8 }).seg(-1.7, 1.44, 1.7, 1.44, { stroke: DIM }) },
    { y: 154, t: "포물선과 두 접선", s: "|a|/12 · (β−α)³", range: { x0: -1.7, x1: 1.7, y0: -1.9, y1: 2.2 }, fn: (p) => p.area(par, (x) => -2.4 * x - 1.44, -1.2, 0, A, 0.4).area(par, (x) => 2.4 * x - 1.44, 0, 1.2, A, 0.4).curve(par, -1.5, 1.5, { width: 1.8 }).curve((x) => -2.4 * x - 1.44, -1.5, 0.15, { stroke: DIM, width: 1.2 }).curve((x) => 2.4 * x - 1.44, -0.15, 1.5, { stroke: DIM, width: 1.2 }) },
    { y: 224, t: "삼차함수(중근)와 x축", s: "|a|/12 · (β−α)⁴", range: { x0: -0.5, x1: 3.5, y0: -2.2, y1: 5.2 }, fn: (p) => { const c = (x) => x * (x - 3) * (x - 3); p.area(c, () => 0, 0, 3, A, 0.4).seg(-0.5, 0, 3.5, 0, { stroke: DIM }).curve(c, -0.28, 3.42, { width: 1.8 }); } },
    { y: 294, t: "삼차함수(세 근이 같은 간격)", s: "한쪽 넓이  |a|/4 · (β−α)⁴", range: { x0: -1.5, x1: 1.5, y0: -0.75, y1: 0.75 }, fn: (p) => { const c = (x) => x * (x - 1) * (x + 1); p.area(c, () => 0, -1, 0, A, 0.4).seg(-1.5, 0, 1.5, 0, { stroke: DIM }).curve(c, -1.28, 1.28, { width: 1.8 }); } },
  ];
  const g3 = rowsG.map((r, i) => `${mini("m12c" + i, r.y, r)}
<text data-fit="228" x="112" y="${r.y + 25}" fill="${INK}" font-size="12.5" font-weight="600">${esc(r.t)}</text>
<text data-fit="228" x="112" y="${r.y + 47}" fill="${A}" font-size="14" font-weight="800">${esc(r.s)}</text>`).join("\n");
  const c3 = { pill: "넓이 공식 네 가지", title: "다항함수 넓이, 식 없이 바로", graph: g3, rows: [] };
  const extra = `<text data-fit="324" x="18" y="384" fill="${DIM}" font-size="12" font-weight="500">α, β 는 이웃한 두 근(또는 접점·교점)의 x좌표</text>
<rect x="16" y="396" width="328" height="38" rx="8" fill="${A}" fill-opacity="0.09" stroke="${A}" stroke-opacity="0.55"/>
<text data-fit="304" x="28" y="420" fill="${INK}" font-size="12.5" font-weight="600">도함수 그래프의 넓이 = <tspan fill="${A}" font-weight="700">원래 함수의 높이 차</tspan></text>`;
  c3.graph += "\n" + extra;
  return page({
    no: "12", accent: A, title: "사차함수 비율 관계와 넓이 공식", sub: "Quartic: 1 : √2 and 3 : 1 ratios, depth via the derivative's area",
    cards: [
      { pill: "1 : √2 · 높이 차", title: "W자 사차함수 (좌우 대칭)", graph: g1.svg(), rows: [
        { b: ["극대에서 그은 수평선: 극소까지 가로 1 이면", "곡선과 다시 만나는 점까지는 *√2*"] },
        { b: ["극대와 극소의 높이 차 *h = |a| × d⁴*", "(d: 극대와 극소 사이의 가로 거리)"] },
        { box: ["도함수는 세 근이 같은 간격인 삼차함수(계수 4a)", "→ 한쪽 넓이 |4a|/4 · d⁴ = *|a|d⁴ = h*"] },
      ] },
      { pill: "3 : 1 로 나누는 곳", title: "한쪽이 평평한 사차함수", graph: g2.svg(), rows: [
        { b: ["y = a(x−α)³(x−β) 의 극점은", "α와 β 사이를 *3 : 1* 로 나눈다"] },
        { b: ["깊이 = *27/256 × |a| × (β−α)⁴*"] },
        { box: ["도함수는 중근이 있는 삼차함수(계수 4a)", "→ 넓이 |4a|/12 · (극점−α)⁴ = *깊이*"] },
      ] },
      c3,
    ],
    tags: ["#사차비율1:√2", "#삼중근3:1", "#1/6공식", "#1/12공식", "#도함수넓이=높이차"],
  });
}

for (const [name, svg] of [["10-quadratic-ratios.svg", map10()], ["11-cubic-ratios.svg", map11()], ["12-quartic-areas.svg", map12()]]) {
  fs.writeFileSync(new URL(name, OUT), svg);
  console.log(name, svg.length);
}
