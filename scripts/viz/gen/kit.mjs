// 장면 SVG 조립 키트 — 사람·배경·소품·단계 래퍼를 함수로 만들어 둔 것. 결과물은 viz/<단어>.svg 일반 파일.
// 규칙은 scripts/viz/GUIDE.md 그대로(글자 금지, id는 <단어>_ 접두, transform 은 up/pop/mv/a-* 요소에 직접 달지 않음).

const SKY = {
  day: ['#8fd0ff', '#eaf7ff'], dusk: ['#7a6ad6', '#ffc27a'], night: ['#0f1730', '#2c3a68'], gray: ['#8e9db3', '#d4dbe6'],
  warm: ['#ffe9c9', '#f7c98f'], wall: ['#fff3e0', '#f6dcb6'], cool: ['#eef2ff', '#d8e2f6'], pink: ['#fff0f6', '#fbd5e5'],
  green: ['#f0f9e0', '#d6eeaa'], dark: ['#1f2937', '#374151'], sun: ['#ffd27a', '#fff0c4'], mint: ['#e6faf5', '#c4eee3'],
};
const GROUND = {
  grass: ['#8fd06a', '#58a846'], sand: ['#ecc77a', '#c99a45'], snow: ['#ffffff', '#d4e2f2'], floor: ['#d9a066', '#b98650'],
  road: ['#5b6575', '#363e4d'], stone: ['#b8c2d4', '#8a93a5'], soil: ['#9a6a3a', '#5e3d1f'], carpet: ['#c9a0dc', '#9a6fb8'],
  tile: ['#cfd9e6', '#a9b8cc'], water: ['#4fc3f7', '#0277bd'], dark: ['#2a2f3a', '#161a22'],
};
export const CLR = { skin: '#ffd7b5', skin2: '#f0c6a4', hair: '#3a2418', ink: '#2a1a12', red: '#ef4444', green: '#22c55e', blue: '#3b82f6', yellow: '#ffd34d' };

const f = (n) => Math.round(n * 10) / 10;

export class Scene {
  constructor(word, { c = '#3b82f6', label = '', n = 3 } = {}) {
    this.w = word; this.c = c; this.label = label; this.n = n; this.grads = new Map(); this.body = [];
  }
  /* 그라데이션 등록 → url(#단어_이름) */
  g(name, c1, c2, dir = 'v') {
    if (!this.grads.has(name)) this.grads.set(name, [c1, c2, dir]);
    return `url(#${this.w}_${name})`;
  }
  add(x) { this.body.push(x); return this; }
  sky(kind = 'day') { const [a, b] = SKY[kind]; return this.add(`<rect width="560" height="300" fill="${this.g('sky', a, b)}"/>`); }
  /* 땅: grass 는 언덕, 나머지는 평평한 띠. y = 땅 윗선 */
  ground(kind = 'grass', y = 236) {
    const [a, b] = GROUND[kind];
    const fill = this.g('gr', a, b);
    if (kind === 'grass') return this.add(`<path d="M0 ${y + 8}C150 ${y - 6} 310 ${y + 10} 560 ${y}V300H0Z" fill="${fill}"/>`);
    if (kind === 'snow') return this.add(`<path d="M0 ${y + 4}C150 ${y - 10} 310 ${y + 8} 560 ${y - 4}V300H0Z" fill="${fill}"/>`);
    return this.add(`<rect x="0" y="${y}" width="560" height="${300 - y}" fill="${fill}"/>`);
  }
  /* 단계 래퍼 */
  vs(k, inner, { cls = '', e, dl, d } = {}) {
    const st = [dl != null ? `--dl:${dl}s` : '', d != null ? `--d:${d}s` : ''].filter(Boolean).join(';');
    return `<g class="vs${cls ? ' ' + cls : ''}" data-s="${k}"${e ? ` data-e="${e}"` : ''}${st ? ` style="${st}"` : ''}>${inner}</g>`;
  }
  step(k, inner, o) { return this.add(this.vs(k, inner, o)); }
  /* 이동: 기본 좌표가 최종 위치, from 은 출발 변환. appear=true 면 이동 시작 단계부터 보임(그 전엔 안 보임), e = 그 단계까지만 */
  mv(k, from, inner, { d = 1, dl, ease, e, appear = true } = {}) {
    const st = `--from:${from};--d:${d}s${dl != null ? `;--dl:${dl}s` : ''}${ease ? `;--ease:${ease}` : ''};transform-box:fill-box;transform-origin:center`;
    const body = appear || e ? this.vs(k, inner, { e }) : inner;
    return this.add(`<g class="mv" data-s="${k}" style="${st}">${body}</g>`);
  }
  /* 두 번 이동하는 물체(예: 1→2단계 이동, 2→3단계 이동). */
  badge(kind = 'check', x = 500, y = 56, k = null, color) {
    const kk = k || this.n;
    const col = color || ({ check: '#22c55e', x: '#ef4444', excl: '#ef4444', up: '#0ea5e9', down: '#0ea5e9', star: '#f59e0b', heart: '#ec4899', q: '#8b5cf6' }[kind] || '#22c55e');
    const ic = {
      check: '<path d="M-10 0L-3 8L12 -9" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
      x: '<path d="M-9 -9L9 9M9 -9L-9 9" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
      excl: '<path d="M0 -12V3M0 10V12" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
      up: '<path d="M0 12V-10M-9 -2L0 -12L9 -2" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
      down: '<path d="M0 -12V10M-9 2L0 12L9 2" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
      star: '<path d="M0 -12L3.6 -3.6L12 -3L5.4 3L7.4 12L0 7L-7.4 12L-5.4 3L-12 -3L-3.6 -3.6Z" fill="#fff"/>',
      heart: '<path d="M0 10C-14 0 -12 -12 -5 -12C-2 -12 0 -9 0 -8C0 -9 2 -12 5 -12C12 -12 14 0 0 10Z" fill="#fff"/>',
      q: '<path d="M-6 -6Q-6 -13 0 -13Q7 -13 7 -7Q7 -3 2 0Q0 2 0 5M0 10V12" stroke="#fff" stroke-width="4.4" stroke-linecap="round" fill="none"/>',
    }[kind];
    return this.add(this.vs(kk, `<g transform="translate(${x} ${y})"><circle r="22" fill="${col}" stroke="#fff" stroke-width="3"/>${ic}</g>`, { cls: 'pop', dl: 0.4 }));
  }
  svg() {
    const defs = [`<clipPath id="${this.w}_clip"><rect width="560" height="300" rx="14"/></clipPath>`];
    for (const [name, [a, b, dir]] of this.grads) {
      const xy = dir === 'v' ? 'x1="0" y1="0" x2="0" y2="1"' : dir === 'h' ? 'x1="0" y1="0" x2="1" y2="0"' : 'x1="0" y1="0" x2="1" y2="1"';
      defs.push(`<linearGradient id="${this.w}_${name}" ${xy}><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`);
    }
    const lab = this.label.replace(/"/g, "'");
    return `<svg xmlns="http://www.w3.org/2000/svg" data-n="${this.n}" data-t="1" data-c="${this.c}" viewBox="0 0 560 300" role="img" aria-label="${lab}">\n<defs>\n${defs.join('\n')}\n</defs>\n<g clip-path="url(#${this.w}_clip)">\n${this.body.join('\n')}\n</g></svg>\n`;
  }
}

/* ---------- 기본 도형 ---------- */
export const T = (x, y, inner, extra = '') => `<g transform="translate(${f(x)} ${f(y)})${extra ? ' ' + extra : ''}">${inner}</g>`;
export const R = (x, y, w, h, fill, rx = 0, ex = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"${rx ? ` rx="${rx}"` : ''} fill="${fill}"${ex ? ' ' + ex : ''}/>`;
export const C = (x, y, r, fill, ex = '') => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"${ex ? ' ' + ex : ''}/>`;
export const E = (x, y, rx, ry, fill, ex = '') => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}"${ex ? ' ' + ex : ''}/>`;
export const P = (d, fill, ex = '') => `<path d="${d}" fill="${fill}"${ex ? ' ' + ex : ''}/>`;
export const L = (d, stroke, w = 4, ex = '') => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${ex ? ' ' + ex : ''}/>`;
export const shadow = (x, y, rx = 30, op = 0.18) => E(x, y, rx, rx * 0.16, '#000', `fill-opacity="${op}"`);
export const G = (inner, ex = '') => `<g${ex ? ' ' + ex : ''}>${inner}</g>`;

/* 화살표(선 + 삼각형 머리). 그리는 방향 x1,y1 → x2,y2 */
export function arrow(x1, y1, x2, y2, col = '#0ea5e9', w = 5, hs = 12) {
  const a = Math.atan2(y2 - y1, x2 - x1), ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux;
  const bx = x2 - ux * hs, by = y2 - uy * hs;
  return L(`M${f(x1)} ${f(y1)}L${f(bx)} ${f(by)}`, col, w) +
    P(`M${f(x2)} ${f(y2)}L${f(bx + px * hs * 0.7)} ${f(by + py * hs * 0.7)}L${f(bx - px * hs * 0.7)} ${f(by - py * hs * 0.7)}Z`, col);
}
export const star = (x, y, r = 10, fill = '#ffd34d', ex = '') => P(`M${x} ${y - r}L${f(x + r * 0.3)} ${f(y - r * 0.3)}L${x + r} ${f(y - r * 0.2)}L${f(x + r * 0.45)} ${f(y + r * 0.25)}L${f(x + r * 0.6)} ${y + r}L${x} ${f(y + r * 0.55)}L${f(x - r * 0.6)} ${y + r}L${f(x - r * 0.45)} ${f(y + r * 0.25)}L${x - r} ${f(y - r * 0.2)}L${f(x - r * 0.3)} ${f(y - r * 0.3)}Z`, fill, ex);
export const drop = (x, y, s = 1, fill = '#6fb8ee', ex = '') => `<path d="M${x} ${y}c${f(-7 * s)} ${f(11 * s)} ${f(-7 * s)} ${f(16 * s)} 0 ${f(16 * s)}c${f(7 * s)} 0 ${f(7 * s)} ${f(-5 * s)} 0 ${f(-16 * s)}Z" fill="${fill}" stroke="#fff" stroke-width="1.2"${ex ? ' ' + ex : ''}/>`;
export const sparks = (x, y, r1 = 26, r2 = 42, col = '#ffd34d', n = 6, w = 5) => {
  let d = ''; for (let i = 0; i < n; i++) { const a = (Math.PI * 2 * i) / n - Math.PI / 2; d += `M${f(x + Math.cos(a) * r1)} ${f(y + Math.sin(a) * r1)}L${f(x + Math.cos(a) * r2)} ${f(y + Math.sin(a) * r2)}`; }
  return L(d, col, w);
};
export const cloud = (x, y, k = 1, fill = '#fff', op = 0.95) => `<g fill="${fill}" fill-opacity="${op}" transform="translate(${x} ${y}) scale(${k})"><ellipse cx="0" cy="0" rx="36" ry="10"/><ellipse cx="22" cy="-8" rx="22" ry="12"/><ellipse cx="-18" cy="-6" rx="18" ry="10"/></g>`;
export const sun = (x, y, r = 22, col = '#fff3a8') => C(x, y, r, col);
export const moon = (x, y, r = 20, bg = '#1f2a44') => C(x, y, r, '#fff6c8') + C(x + r * 0.5, y - r * 0.3, r * 0.9, bg);
export const heart = (x, y, k = 1, fill = '#ef4444') => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 14C-26 -4 -20 -22 -9 -22C-3 -22 0 -16 0 -14C0 -16 3 -22 9 -22C20 -22 26 -4 0 14Z" fill="${fill}"/>`;
export const coin = (x, y, r = 14, fill = '#ffd34d') => C(x, y, r, fill, 'stroke="#d99a00" stroke-width="2.4"') + C(x, y, r * 0.6, 'none', 'stroke="#d99a00" stroke-width="2"');
export const tree = (x, y, k = 1, leaf = '#4fa04a') => `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-6" y="-60" width="12" height="60" fill="#6b4a2a"/><circle cx="0" cy="-80" r="34" fill="${leaf}"/><circle cx="-24" cy="-62" r="22" fill="#3f8f3a"/><circle cx="24" cy="-64" r="22" fill="#3f8f3a"/></g>`;
export const house = (x, y, w = 120, wall = '#e8d0b0', roof = '#c0392b', k = 1) => {
  const h = w * 0.6;
  return `<g transform="translate(${x} ${y}) scale(${k})"><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${wall}"/><path d="M${-w / 2 - 12} ${-h}L0 ${-h - w * 0.4}L${w / 2 + 12} ${-h}Z" fill="${roof}"/><rect x="-12" y="${-h * 0.62}" width="24" height="${h * 0.62}" fill="#8c5a2a"/><rect x="${-w / 2 + 12}" y="${-h * 0.8}" width="${w * 0.22}" height="${w * 0.2}" fill="#cfeaff" stroke="#fff" stroke-width="3"/><rect x="${w / 2 - 12 - w * 0.22}" y="${-h * 0.8}" width="${w * 0.22}" height="${w * 0.2}" fill="#cfeaff" stroke="#fff" stroke-width="3"/></g>`;
};
export const table = (x, y, w = 160, col = '#a0602e') => `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="-10" width="${w}" height="14" rx="5" fill="${col}"/><rect x="${-w / 2 + 12}" y="4" width="10" height="${58}" fill="#7a461f"/><rect x="${w / 2 - 22}" y="4" width="10" height="58" fill="#7a461f"/></g>`;
export const book = (x, y, col = '#3b82f6', w = 40, h = 52) => `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="4" fill="${col}"/><rect x="${-w / 2 + 6}" y="${-h + 8}" width="${w - 12}" height="${h * 0.3}" rx="2" fill="#fff" fill-opacity=".85"/><rect x="${-w / 2}" y="${-h}" width="7" height="${h}" fill="#000" fill-opacity=".18"/></g>`;
export const paper = (x, y, w = 70, h = 90, lines = 4, col = '#fff') => {
  let l = ''; for (let i = 0; i < lines; i++) l += `M${-w / 2 + 10} ${-h / 2 + 16 + i * 14}H${w / 2 - 10 - (i % 2) * 14}`;
  return `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="4" fill="${col}" stroke="#b9c1cf" stroke-width="2.4"/>${L(l, '#aab4c6', 3)}</g>`;
};
export const money = (x, y, w = 60) => `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="-16" width="${w}" height="32" rx="4" fill="#7fd08a" stroke="#3f9a52" stroke-width="2.4"/>${C(0, 0, 9, '#bff0c4', 'stroke="#3f9a52" stroke-width="2"')}</g>`;
export const lamp = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-3" y="-50" width="6" height="50" fill="#6b7384"/><path d="M-22 -50L-12 -76H12L22 -50Z" fill="#ffd34d"/><circle cx="0" cy="-48" r="30" fill="#ffe9a0" fill-opacity=".35"/></g>`;
export const bubble = (x, y, w = 80, h = 50, fill = '#fff', tail = 'l') => `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2.4}" fill="${fill}" stroke="#aab4c6" stroke-width="2.4"/>${tail === 'l' ? P(`M${-w / 2 + 14} ${h / 2 - 2}L${-w / 2 - 4} ${h / 2 + 14}L${-w / 2 + 28} ${h / 2 - 2}Z`, fill, 'stroke="#aab4c6" stroke-width="2.4"') : P(`M${w / 2 - 14} ${h / 2 - 2}L${w / 2 + 4} ${h / 2 + 14}L${w / 2 - 28} ${h / 2 - 2}Z`, fill, 'stroke="#aab4c6" stroke-width="2.4"')}</g>`;
export const gear = (x, y, r = 22, fill = '#8a93a5') => { let d = ''; for (let i = 0; i < 8; i++) { const a = (Math.PI / 4) * i; d += `M${f(x + Math.cos(a) * r * 0.8)} ${f(y + Math.sin(a) * r * 0.8)}L${f(x + Math.cos(a) * r * 1.25)} ${f(y + Math.sin(a) * r * 1.25)}`; } return L(d, fill, r * 0.38) + C(x, y, r, fill) + C(x, y, r * 0.4, '#e5e9f0'); };
export const door = (x, y, w = 56, h = 90, col = '#8c5a2a') => `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="4" fill="${col}"/><circle cx="${w / 2 - 10}" cy="${-h / 2}" r="3.4" fill="#ffd34d"/></g>`;
export const flag = (x, y, col = '#ef4444', h = 90) => `<g transform="translate(${x} ${y})"><rect x="-2" y="${-h}" width="4" height="${h}" fill="#6b7384"/><path d="M2 ${-h}H46L36 ${-h + 14}L46 ${-h + 28}H2Z" fill="${col}"/></g>`;
export const crown = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-22 0L-26 -26L-12 -14L0 -32L12 -14L26 -26L22 0Z" fill="#ffd34d" stroke="#d99a00" stroke-width="2.4"/>${C(0, -32, 3.4, '#ef4444')}${C(-26, -26, 3, '#ef4444')}${C(26, -26, 3, '#ef4444')}</g>`;
export const clock = (x, y, r = 24, hh = 0, mm = 0) => `<g transform="translate(${x} ${y})">${C(0, 0, r, '#fff', 'stroke="#6b7384" stroke-width="4"')}${L(`M0 0L${f(Math.sin(hh) * r * 0.5)} ${f(-Math.cos(hh) * r * 0.5)}`, '#2a2e3a', 4)}${L(`M0 0L${f(Math.sin(mm) * r * 0.75)} ${f(-Math.cos(mm) * r * 0.75)}`, '#2a2e3a', 3)}${C(0, 0, 2.6, '#2a2e3a')}</g>`;
export const scales = (x, y, tilt = 0) => `<g transform="translate(${x} ${y})"><rect x="-4" y="-80" width="8" height="80" fill="#8a6a2a"/><rect x="-30" y="-4" width="60" height="8" rx="3" fill="#8a6a2a"/><g transform="rotate(${tilt} 0 -80)"><rect x="-60" y="-83" width="120" height="6" rx="3" fill="#b88a2a"/><path d="M-60 -80L-76 -40H-44Z M60 -80L44 -40H76Z" fill="none" stroke="#b88a2a" stroke-width="2"/><path d="M-80 -40H-40Q-40 -28 -60 -28Q-80 -28 -80 -40Z M40 -40H80Q80 -28 60 -28Q40 -28 40 -40Z" fill="#ffd34d" stroke="#b88a2a" stroke-width="2.4" transform="translate(0 ${-tilt * 0})"/></g></g>`;
export const chair = (x, y, col = '#a0602e') => `<g transform="translate(${x} ${y})"><rect x="-22" y="-52" width="8" height="52" fill="${col}"/><rect x="-22" y="-28" width="46" height="9" rx="3" fill="${col}"/><rect x="16" y="-19" width="8" height="19" fill="${col}"/></g>`;
export const bed = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-90" y="-44" width="180" height="36" rx="8" fill="#8a90e0"/><rect x="-96" y="-72" width="14" height="72" rx="5" fill="#5a62b8"/><rect x="82" y="-54" width="14" height="54" rx="5" fill="#5a62b8"/><rect x="-80" y="-58" width="50" height="22" rx="11" fill="#fff"/></g>`;

/* ---------- 사람 ---------- */
const HAIR = {
  short: (c) => `<path d="M-17 -84Q-19 -104 0 -102Q19 -104 17 -84Q9 -95 0 -95Q-9 -95 -17 -84Z" fill="${c}"/>`,
  long: (c) => `<path d="M-17 -84Q-19 -104 0 -102Q19 -104 17 -84L19 -62L12 -62L12 -84Q6 -93 0 -93Q-6 -93 -12 -84L-12 -62L-19 -62Z" fill="${c}"/>`,
  bun: (c) => `<circle cx="0" cy="-106" r="8" fill="${c}"/><path d="M-17 -84Q-19 -104 0 -102Q19 -104 17 -84Q9 -95 0 -95Q-9 -95 -17 -84Z" fill="${c}"/>`,
  bald: () => '',
  curly: (c) => `<g fill="${c}"><circle cx="-13" cy="-94" r="8"/><circle cx="0" cy="-99" r="9"/><circle cx="13" cy="-94" r="8"/></g>`,
};
function face(kind, skin) {
  const eye = (x, r = 2.4) => C(x, -83, r, '#2a1a12');
  const m = (d, w = 2.8) => L(d, '#2a1a12', w);
  switch (kind) {
    case 'sad': return eye(-6) + eye(6) + L('M-10 -90L-3 -87M10 -90L3 -87', '#2a1a12', 2.4) + m('M-5 -73Q0 -78 5 -73');
    case 'angry': return eye(-6) + eye(6) + L('M-10 -90L-2 -86M10 -90L2 -86', '#2a1a12', 3) + m('M-5 -74H5');
    case 'shock': return C(-6, -83, 4.2, '#fff', 'stroke="#2a1a12" stroke-width="1.6"') + C(6, -83, 4.2, '#fff', 'stroke="#2a1a12" stroke-width="1.6"') + C(-6, -83, 1.8, '#2a1a12') + C(6, -83, 1.8, '#2a1a12') + E(0, -73, 3.6, 4.6, '#7a2a2a');
    case 'cry': return L('M-10 -83Q-6 -86 -2 -83M2 -83Q6 -86 10 -83', '#2a1a12', 2.4) + m('M-5 -72Q0 -78 5 -72') + drop(-9, -80, 0.5, '#8fd0ff') + drop(9, -80, 0.5, '#8fd0ff');
    case 'sleep': return L('M-10 -83Q-6 -80 -2 -83M2 -83Q6 -80 10 -83', '#2a1a12', 2.4) + m('M-3 -74H3', 2.4);
    case 'shy': return eye(-6) + eye(6) + C(-11, -77, 4, '#ff8aa0', 'fill-opacity=".6"') + C(11, -77, 4, '#ff8aa0', 'fill-opacity=".6"') + m('M-5 -74Q0 -70 5 -74');
    case 'think': return eye(-6) + eye(6) + L('M-10 -90Q-6 -93 -2 -90', '#2a1a12', 2.2) + m('M-4 -74H4', 2.4);
    case 'cheer': return L('M-10 -82Q-6 -87 -2 -82M2 -82Q6 -87 10 -82', '#2a1a12', 2.6) + P('M-6 -75Q0 -66 6 -75Z', '#7a2a2a');
    case 'sick': return L('M-9 -84L-3 -81M9 -84L3 -81', '#2a1a12', 2.6) + m('M-6 -73Q-3 -77 0 -73T6 -73');
    case 'smirk': return eye(-6) + eye(6) + m('M-4 -74Q2 -71 6 -76');
    case 'yawn': return L('M-10 -83Q-6 -80 -2 -83M2 -83Q6 -80 10 -83', '#2a1a12', 2.4) + E(0, -73, 3.8, 5, '#7a2a2a');
    default: return eye(-6) + eye(6) + m('M-6 -75Q0 -69 6 -75');
  }
}
/* 사람: 발 중심이 (0,0). o = {x,y,s,rot,shirt,pants,hair,hs,skin,face,armL:[dx,dy],armR:[dx,dy],hat,legs:'stand'|'walk'|'hide'} */
export function person(o = {}) {
  const { x = 0, y = 0, s = 1, rot = 0, shirt = '#3b82f6', pants = '#334155', hair = '#3a2418', hs = 'short', skin = '#ffd7b5', fc = 'smile', armL = [-6, 30], armR = [6, 30], hat = '', legs = 'stand', rotO = '0 -30', sh = true } = o;
  const arm = (sx, d) => { const ex = sx + d[0], ey = -56 + d[1]; const mx = sx + d[0] * 0.5, my = -56 + d[1] * 0.5; return L(`M${sx} -56L${f(mx)} ${f(my)}`, shirt, 10) + L(`M${f(mx)} ${f(my)}L${f(ex)} ${f(ey)}`, skin, 7) + C(ex, ey, 4.6, skin); };
  let lg = '';
  if (legs === 'stand') lg = R(-14, -10, 11, 20, pants, 4) + R(3, -10, 11, 20, pants, 4);
  else if (legs === 'walk') lg = R(-16, -10, 11, 20, pants, 4, 'transform="rotate(14 -10 -10)"') + R(5, -10, 11, 20, pants, 4, 'transform="rotate(-14 10 -10)"');
  else if (legs === 'hide') lg = '';
  const tr = `translate(${f(x)} ${f(y)})${s !== 1 ? ` scale(${s})` : ''}${rot ? ` rotate(${rot} ${rotO.replace(' ', ' ')})` : ''}`;
  return `<g transform="${tr}">${sh ? shadow(0, 12, 26) : ''}${lg}${R(-16, -64, 32, 60, shirt, 12)}${arm(-16, armL)}${arm(16, armR)}${R(-3, -68, 6, 8, skin)}${C(0, -82, 16, skin)}${(HAIR[hs] || HAIR.short)(hair)}${face(fc, skin)}${hat}</g>`;
}
export const hatCap = (col = '#ef4444') => `<path d="M-17 -88Q0 -110 17 -88Z" fill="${col}"/><rect x="-18" y="-92" width="40" height="6" rx="3" fill="${col}"/>`;
export const hardhat = () => `<path d="M-19 -88Q0 -112 19 -88Z" fill="#facc15"/><rect x="-22" y="-92" width="44" height="7" rx="3" fill="#facc15"/>`;
export const crownHat = () => crown(0, -98, 0.7);
