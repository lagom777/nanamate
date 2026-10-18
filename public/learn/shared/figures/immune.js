/* 특이적 방어 작용 — 반응 흐름(세포 지도)과 1차·2차 항체 곡선.
 * 컨트롤: stage 0~6(flow), day 0~56(graph), showB(graph, 항원 B를 28일에 함께 주사).
 * 곡선 매듭은 생명과학Ⅰ 교과서형 상대 농도다. 1차는 잠복이 길고 낮고, 2차는 짧고 높으며, 항원 B는 다시 1차.
 * 단계의 소수로 위치·크기·투명도를 보간한다. 투명도는 data-part가 아닌 안쪽 그룹에만 둔다.
 */
(function (NMFIG) {
  'use strict';

  var C = {
    c1: 'var(--fgx-c1,#2563eb)', c2: 'var(--fgx-c2,#dc2626)', c3: 'var(--fgx-c3,#d97706)',
    c4: 'var(--fgx-c4,#16a34a)', c5: 'var(--fgx-c5,#7c3aed)', c6: 'var(--fgx-c6,#0891b2)',
    c7: 'var(--fgx-c7,#db2777)', c8: 'var(--fgx-c8,#65748b)',
    s1: 'var(--fgx-c1-soft,#d3e0fb)', s2: 'var(--fgx-c2-soft,#f8d4d4)', s3: 'var(--fgx-c3-soft,#f7e4cd)',
    s4: 'var(--fgx-c4-soft,#d0eddb)', s5: 'var(--fgx-c5-soft,#e5d8fb)', s6: 'var(--fgx-c6-soft,#cee9f0)',
    s7: 'var(--fgx-c7-soft,#f8d4e4)', s8: 'var(--fgx-c8-soft,#e0e3e8)',
    ink: 'var(--fgx-ink,#1a1f2e)', dim: 'var(--fgx-dim,#4a5468)',
    line: 'var(--fgx-line,#d0d5de)', card: 'var(--fgx-card,#fff)', elev: 'var(--fgx-elev,#f5f7fa)'
  };

  /* 세포 지도 기준점 (viewBox 단위). 공격·분화 때 이 좌표 사이를 보간한다. */
  var LAY = {
    bugX: 118, bugY: 94,
    macX: 456, macY: 102,
    thX: 284, thY: 198,
    bX: 76, bY: 316,
    plX: 190, plY: 328,
    memX: 72, memY: 398,
    kX: 360, kY: 326,
    infX: 478, infY: 340
  };

  /* 그래프: x 일수 0~56, y 상대 항체 농도 0~10. 눈금은 7일마다. */
  var GX0 = 70, GX1 = 535, GY0 = 52, GY1 = 304;
  var XSPAN = GX1 - GX0;
  var YSPAN = GY1 - GY0;

  /* (일, 상대 농도) */
  var A1 = [[0, 0], [7, 0], [10, 1], [14, 2], [20, 1.6], [28, 1]];
  var A2 = [[28, 1], [30, 2.5], [33, 7], [35, 8.5], [42, 6.5], [56, 3.5]];
  var BB = [[28, 0], [35, 0], [38, 1], [42, 2], [48, 1.6], [56, 1]];

  var STAGE_FMT = [
    '⓪ 침입',
    '① 식균·항원 제시',
    '② 보조 T 활성',
    '③ B·세포독성 T 활성화',
    '④ 분화·공격',
    '⑤ 항체 작용',
    '⑥ 재침입'
  ];
  var STAGE_LINE = [
    '병원체가 침입했습니다. 표면의 항원이 면역 반응을 일으킵니다.',
    '대식세포가 병원체를 삼켜 분해하고, 항원 조각을 표면에 제시합니다.',
    '보조 T 림프구가 항원 제시를 인식해 활성화됩니다.',
    '보조 T 림프구가 B 림프구와 세포독성 T 림프구를 활성화합니다.',
    'B 림프구는 형질 세포·기억 세포로 분화하고, 세포독성 T 림프구는 감염된 세포를 공격합니다.',
    '형질 세포가 분비한 항체가 항원에 결합해 제거를 돕습니다.',
    '같은 항원이 다시 침입하면 기억 세포가 형질 세포로 분화해 항체를 빠르게 만듭니다.'
  ];
  var FOLLOW = ['antigen', 'macrophage', 'helper_t', 'b_cell', 'plasma', 'antibody', 'memory'];
  var ACTIVE = [
    ['antigen'],
    ['antigen', 'macrophage', 'presentation'],
    ['macrophage', 'presentation', 'helper_t'],
    ['helper_t', 'b_cell', 'killer_t'],
    ['b_cell', 'plasma', 'memory', 'killer_t', 'infected'],
    ['plasma', 'antibody', 'antigen'],
    ['memory', 'plasma', 'antibody', 'antigen']
  ];

  /* 항체 Y의 자리. a = 나타나기 시작하는 stage. */
var ABS = [
  { x: 158, y: 230, rot: -98, a: 4.2 },
  { x: 146, y: 196, rot: -92, a: 4.45 },
  { x: 132, y: 162, rot: -84, a: 4.7 },
  { x: 118, y: 128, rot: -70, a: 4.9 },
  { x: 118, y: 56, rot: 180, a: 4.75 },
  { x: 168, y: 108, rot: -30, a: 5.3 },
  { x: 78, y: 128, rot: -60, a: 5.45 },
  { x: 194, y: 90, rot: 180, a: 5.15 },
  { x: 188, y: 156, rot: -110, a: 5.7 }
];

  function r1(v) { return Math.round(v * 10) / 10; }
  function r2(v) { return Math.round(v * 100) / 100; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function num(v, d) {
    var n = Number(v);
    return n === n ? n : d;
  }
  function ramp(stage, a, b) {
    if (b <= a) return stage >= b ? 1 : 0;
    var t = clamp((stage - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function band(stage, a, b, c, d) {
    return ramp(stage, a, b) * (1 - ramp(stage, c, d));
  }
  function hot(stage, a, b, floor) {
    return floor + (1 - floor) * band(stage, a - 0.15, a + 0.2, b, b + 0.45);
  }
  function labelOp(body) {
    if (body < 0.04) return 0;
    return clamp(0.48 + body * 0.52, 0, 1);
  }
  function stageIndex(stage) {
    var n = Math.round(clamp(stage, 0, 6));
    if (n < 0) n = 0;
    if (n > 6) n = 6;
    return n;
  }

  function xsOf(knots) {
    var a = [];
    var i;
    for (i = 0; i < knots.length; i++) a.push(knots[i][0]);
    return a;
  }
  function ysOf(knots) {
    var a = [];
    var i;
    for (i = 0; i < knots.length; i++) a.push(knots[i][1]);
    return a;
  }
  function tangents(xs, ys) {
    var n = xs.length;
    var d = [];
    var m = [];
    var i, a, b, s, tau;
    for (i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    for (i = 0; i < n; i++) m.push(0);
    m[0] = d[0];
    m[n - 1] = d[n - 2];
    for (i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) m[i] = 0;
      else m[i] = (d[i - 1] + d[i]) / 2;
    }
    for (i = 0; i < n - 1; i++) {
      if (Math.abs(d[i]) < 1e-12) {
        m[i] = 0;
        m[i + 1] = 0;
      } else {
        a = m[i] / d[i];
        b = m[i + 1] / d[i];
        s = a * a + b * b;
        if (s > 9) {
          tau = 3 / Math.sqrt(s);
          m[i] = tau * a * d[i];
          m[i + 1] = tau * b * d[i];
        }
      }
    }
    return m;
  }
  function evalH(xs, ys, m, x) {
    var n = xs.length;
    var lo, hi, mid, h, t, t2, t3;
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    lo = 0;
    hi = n - 1;
    while (hi - lo > 1) {
      mid = (lo + hi) >> 1;
      if (xs[mid] <= x) lo = mid;
      else hi = mid;
    }
    h = xs[lo + 1] - xs[lo];
    t = (x - xs[lo]) / h;
    t2 = t * t;
    t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[lo]
      + (t3 - 2 * t2 + t) * h * m[lo]
      + (-2 * t3 + 3 * t2) * ys[lo + 1]
      + (t3 - t2) * h * m[lo + 1];
  }

  var A1X = xsOf(A1), A1Y = ysOf(A1), A1M = tangents(A1X, A1Y);
  var A2X = xsOf(A2), A2Y = ysOf(A2), A2M = tangents(A2X, A2Y);
  var BBX = xsOf(BB), BBY = ysOf(BB), BBM = tangents(BBX, BBY);

  function valueA(day) {
    if (day <= 28) return evalH(A1X, A1Y, A1M, day);
    return evalH(A2X, A2Y, A2M, day);
  }
  function valueB(day) {
    if (day <= 28) return 0;
    return evalH(BBX, BBY, BBM, day);
  }
  function xDay(d) { return GX0 + (d / 56) * XSPAN; }
  function yVal(v) { return GY1 - (v / 10) * YSPAN; }

  function buildSamples(xs, ys, m) {
    var pts = [];
    var i, h, steps, k, t, x;
    for (i = 0; i < xs.length - 1; i++) {
      h = xs[i + 1] - xs[i];
      steps = Math.max(2, Math.ceil(h / 0.2));
      for (k = 0; k < steps; k++) {
        t = k / steps;
        x = xs[i] + h * t;
        pts.push({ d: x, x: xDay(x), y: yVal(evalH(xs, ys, m, x)) });
      }
    }
    i = xs.length - 1;
    pts.push({ d: xs[i], x: xDay(xs[i]), y: yVal(ys[i]) });
    return pts;
  }
  var SAMP_A1 = buildSamples(A1X, A1Y, A1M);
  var SAMP_A2 = buildSamples(A2X, A2Y, A2M);
  var SAMP_B = buildSamples(BBX, BBY, BBM);

  function pathD(pts) {
    var s = 'M' + r1(pts[0].x) + ',' + r1(pts[0].y);
    var i;
    for (i = 1; i < pts.length; i++) s += 'L' + r1(pts[i].x) + ',' + r1(pts[i].y);
    return s;
  }
  function pathUntil(pts, day) {
    var out, i, p, n, t;
    if (!pts.length || day <= pts[0].d + 1e-6) return '';
    out = [pts[0]];
    for (i = 1; i < pts.length; i++) {
      p = pts[i];
      n = pts[i - 1];
      if (p.d <= day + 1e-6) {
        out.push(p);
        continue;
      }
      t = (day - n.d) / (p.d - n.d);
      out.push({ x: n.x + (p.x - n.x) * t, y: n.y + (p.y - n.y) * t });
      break;
    }
    if (out.length < 2) return '';
    return pathD(out);
  }
  function fmtAbout(v) {
    var x = Math.round(v * 10) / 10;
    if (x < 0.05) return '0';
    if (Math.abs(x - Math.round(x)) < 0.05) return String(Math.round(x));
    return x.toFixed(1);
  }
  function fmtDay(day) {
    var d = Math.round(day * 2) / 2;
    if (Math.abs(d - Math.round(d)) < 0.01) return String(Math.round(d));
    return d.toFixed(1);
  }
  function readoutGraph(day, showB) {
    var a = valueA(day);
    var line;
    if (day < 28) {
      line = fmtDay(day) + '일 · 항원 A: 항체 약 ' + fmtAbout(a) + ' ('
        + (day < 7 ? '1차 반응 잠복기' : '1차 반응: 잠복기 길고 적음') + ')';
      return line;
    }
    line = fmtDay(day) + '일 이후 · 항원 A: 항체 약 ' + fmtAbout(a)
      + ' (2차 반응: 잠복기 짧고 매우 많음)';
    if (showB) {
line += ' · 항원 B: 약 ' + fmtAbout(valueB(day))
      + ' (' + (day <= 35 ? '1차 반응 잠복기' : '1차 반응') + ')';
    }
    return line;
  }

  function polar(r, deg) {
    var a = deg * Math.PI / 180;
    return [r * Math.cos(a), r * Math.sin(a)];
  }
  function closedSmooth(pts) {
    var n = pts.length;
    var d = '';
    var i, p0, p1, p2, p3, c1x, c1y, c2x, c2y;
    for (i = 0; i < n; i++) {
      p0 = pts[(i - 1 + n) % n];
      p1 = pts[i];
      p2 = pts[(i + 1) % n];
      p3 = pts[(i + 2) % n];
      c1x = p1[0] + (p2[0] - p0[0]) / 6;
      c1y = p1[1] + (p2[1] - p0[1]) / 6;
      c2x = p2[0] - (p3[0] - p1[0]) / 6;
      c2y = p2[1] - (p3[1] - p1[1]) / 6;
      if (i === 0) d += 'M' + r1(p1[0]) + ',' + r1(p1[1]);
      d += 'C' + r1(c1x) + ',' + r1(c1y) + ' ' + r1(c2x) + ',' + r1(c2y) + ' ' + r1(p2[0]) + ',' + r1(p2[1]);
    }
    return d + 'Z';
  }
  function edge(x, y, rad, tx, ty) {
    var dx = tx - x;
    var dy = ty - y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    return [x + dx / len * rad, y + dy / len * rad];
  }
  function arrowGeom(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy);
    var ux, uy, hx, hy, bx, by, lx, ly, rx, ry, ex, ey;
    if (len < 10) {
      return { len: len, x1: r1(x1), y1: r1(y1), x2: r1(x1), y2: r1(y1), hd: 'M0,-30', hide: 1 };
    }
    ux = dx / len;
    uy = dy / len;
    hx = 11;
    hy = 5.2;
    bx = x2 - ux * hx;
    by = y2 - uy * hx;
    lx = bx - uy * hy;
    ly = by + ux * hy;
    rx = bx + uy * hy;
    ry = by - ux * hy;
    ex = x2 - ux * 8;
    ey = y2 - uy * 8;
    return {
      len: len,
      x1: r1(x1), y1: r1(y1), x2: r1(ex), y2: r1(ey),
      hd: 'M' + r1(x2) + ',' + r1(y2) + 'L' + r1(lx) + ',' + r1(ly) + 'L' + r1(rx) + ',' + r1(ry) + 'Z',
      hide: 0
    };
  }

  function yMark(color, sw) {
    return '<path d="M0,10 L0,1 L-7,-9 M0,1 L7,-9" fill="none" stroke="' + color + '" stroke-width="' + sw + '"/>';
  }
  function markerTri(deg, dist, size, fill) {
    var p = polar(dist, deg);
    var a = deg * Math.PI / 180;
    var ux = Math.cos(a);
    var uy = Math.sin(a);
    var px = -uy;
    var py = ux;
    var tx = p[0] + ux * size;
    var ty = p[1] + uy * size;
    var b1x = p[0] + px * size * 0.78;
    var b1y = p[1] + py * size * 0.78;
    var b2x = p[0] - px * size * 0.78;
    var b2y = p[1] - py * size * 0.78;
    return '<path d="M' + r1(tx) + ',' + r1(ty) + 'L' + r1(b1x) + ',' + r1(b1y) + 'L' + r1(b2x) + ',' + r1(b2y)
      + 'Z" fill="' + fill + '" stroke="' + C.card + '" stroke-width="1.4"/>';
  }

  var VIRUS = (function () {
    var s = [];
    var angs = [20, 70, 115, 160, 210, 250, 300, 340];
    var i, p, q;
    s.push('<circle r="24" fill="' + C.card + '" stroke="' + C.c2 + '" stroke-width="2.2" class="fgx-vis"/>');
    s.push('<circle r="14" fill="' + C.s2 + '"/>');
    for (i = 0; i < angs.length; i++) {
      p = polar(22, angs[i]);
      q = polar(33, angs[i]);
      s.push('<line x1="' + r1(p[0]) + '" y1="' + r1(p[1]) + '" x2="' + r1(q[0]) + '" y2="' + r1(q[1])
        + '" stroke="' + C.c2 + '" stroke-width="2.4"/>');
    }
    s.push(markerTri(-90, 28, 9, C.c2));
    p = polar(30, 32);
    s.push('<circle cx="' + r1(p[0]) + '" cy="' + r1(p[1]) + '" r="6.5" fill="' + C.c3 + '" stroke="' + C.card + '" stroke-width="1.4"/>');
    p = polar(30, 198);
    s.push('<path d="M' + r1(p[0]) + ',' + r1(p[1] - 7) + 'L' + r1(p[0] + 7) + ',' + r1(p[1])
      + 'L' + r1(p[0]) + ',' + r1(p[1] + 7) + 'L' + r1(p[0] - 7) + ',' + r1(p[1])
      + 'Z" fill="' + C.c7 + '" stroke="' + C.card + '" stroke-width="1.4"/>');
    s.push('<circle class="fgx-hit" r="34" fill="transparent" style="pointer-events:all"/>');
    return s.join('');
  })();

  var MACRO = (function () {
    var pts = [[54, -4], [40, 20], [16, 40], [-10, 48], [-36, 36], [-52, 14], [-50, -16], [-30, -38], [-4, -46], [22, -36], [42, -22]];
    var s = [];
    s.push('<path d="' + closedSmooth(pts) + '" fill="' + C.s6 + '" stroke="' + C.c6 + '" stroke-width="2.4" class="fgx-vis"/>');
    s.push('<ellipse cx="-6" cy="-2" rx="14" ry="11" fill="' + C.c6 + '"/>');
    s.push('<ellipse cx="-8" cy="-4" rx="6" ry="4.5" fill="' + C.s6 + '"/>');
    s.push('<circle cx="18" cy="10" r="5" fill="' + C.card + '" stroke="' + C.c6 + '" stroke-width="1.3"/>');
    s.push('<circle cx="24" cy="-8" r="3.6" fill="' + C.card + '" stroke="' + C.c6 + '" stroke-width="1.2"/>');
    s.push('<circle cx="-22" cy="16" r="4" fill="' + C.card + '" stroke="' + C.c6 + '" stroke-width="1.2"/>');
    s.push('<ellipse class="fgx-hit" rx="58" ry="52" fill="transparent" style="pointer-events:all"/>');
    return s.join('');
  })();

  var PLASMA = (function () {
    var s = [];
    s.push('<ellipse cx="2" cy="2" rx="33" ry="25" fill="' + C.c1 + '" stroke="' + C.c1 + '" stroke-width="2" class="fgx-vis"/>');
    s.push('<ellipse cx="-12" cy="1" rx="11" ry="10" fill="' + C.s5 + '"/>');
    s.push('<circle cx="-16" cy="-2" r="1.6" fill="' + C.c5 + '"/>');
    s.push('<circle cx="-10" cy="3" r="1.6" fill="' + C.c5 + '"/>');
    s.push('<circle cx="-14" cy="6" r="1.4" fill="' + C.c5 + '"/>');
    s.push('<path d="M4,-12 C16,-13 24,-6 16,-1" fill="none" stroke="' + C.card + '" stroke-width="2.2"/>');
    s.push('<path d="M6,-2 C18,-1 24,6 14,11" fill="none" stroke="' + C.card + '" stroke-width="2.2"/>');
    s.push('<path d="M2,8 C12,11 18,16 8,18" fill="none" stroke="' + C.card + '" stroke-width="2"/>');
    s.push('<ellipse class="fgx-hit" cx="2" cy="2" rx="38" ry="30" fill="transparent" style="pointer-events:all"/>');
    return s.join('');
  })();

function bReceptors() {
  var angs = [-50, 28, 150];
  var s = [];
  var i, p, rot;
  for (i = 0; i < angs.length; i++) {
    p = polar(22, angs[i]);
    rot = angs[i] + 90;
    s.push('<g transform="translate(' + r1(p[0]) + ',' + r1(p[1]) + ') rotate(' + r1(rot) + ') scale(0.9)">');
    s.push(yMark(C.c1, 2.4));
    s.push('</g>');
  }
  return s.join('');
}
function tReceptors() {
  var angs = [-70, 18, 112, 200];
  var s = [];
  var i, p, q;
  for (i = 0; i < angs.length; i++) {
    p = polar(24, angs[i]);
    q = polar(34, angs[i]);
    s.push('<line x1="' + r1(p[0]) + '" y1="' + r1(p[1]) + '" x2="' + r1(q[0]) + '" y2="' + r1(q[1]) + '" stroke="' + C.c5 + '" stroke-width="2.3"/>');
    s.push('<circle cx="' + r1(q[0]) + '" cy="' + r1(q[1]) + '" r="3.3" fill="' + C.c5 + '"/>');
  }
  return s.join('');
}

  function lymph(fill, stroke, r, nucleus) {
    return '<circle r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2.3" class="fgx-vis"/>'
      + '<circle cx="-3" cy="-1" r="' + nucleus + '" fill="' + C.card + '" stroke="' + stroke + '" stroke-width="1.2"/>'
      + '<circle class="fgx-hit" r="' + (r + 8) + '" fill="transparent" style="pointer-events:all"/>';
  }

  var PRES = (function () {
    var angs = [128, 152, 176];
    var cols = [C.c2, C.c3, C.c7];
    var s = [];
    var i;
    for (i = 0; i < 3; i++) s.push(markerTri(angs[i], 50, 8, cols[i]));
    s.push('<rect class="fgx-hit" x="-62" y="-2" width="48" height="58" fill="transparent" style="pointer-events:all"/>');
    return s.join('');
  })();

  function tf(x, y, sx, sy) {
    if (sy == null) sy = sx;
    return 'translate(' + r1(x) + ',' + r1(y) + ') scale(' + r2(sx) + ',' + r2(sy) + ')';
  }
  function opAttr(v) { return ' opacity="' + r2(v) + '"'; }
  function trAttr(v) { return ' transform="' + v + '"'; }

  function flowModel(stage) {
    var s = clamp(num(stage, 0), 0, 6);
    var idx = stageIndex(s);
    var leave = 1 - ramp(s, 0.12, 0.92);
    var enter = ramp(s, 0.08, 1);
    var eat = ramp(s, 0.5, 1.05) * (1 - ramp(s, 1.55, 2.25));
    var cluster = ramp(s, 4.5, 5.05);
    var uSplit = ramp(s, 3.25, 4.15);
    var uAtk = ramp(s, 3.35, 4.15);
    var uSq = ramp(s, 3.5, 4.12);
    var bug, eatP, c1, c2, c3, pres, pl, pl2, pl3, mem, killer, inf;
    var macOp, thOp, bOp, kOp, infOp, abOp;
    var p1, p2, g;

    bug = {
      x: lerp(LAY.bugX, LAY.macX - 6, enter),
      y: lerp(LAY.bugY, LAY.macY + 4, enter),
      sc: lerp(1, 0.3, enter),
      op: leave
    };
    eatP = { op: eat };
    c1 = { x: LAY.bugX, y: LAY.bugY, sc: 0.84, op: cluster };
    c2 = { x: LAY.bugX + 76, y: LAY.bugY + 28, sc: 0.64, op: ramp(s, 4.75, 5.25) };
    c3 = { x: LAY.bugX + 24, y: LAY.bugY + 68, sc: 0.56, op: ramp(s, 5.3, 5.85) };

    macOp = hot(s, 0.75, 2.15, 0.45);
    pres = {
      op: ramp(s, 0.62, 1.12) * (0.8 + 0.2 * band(s, 0.8, 1.1, 2.4, 3.2)),
      sc: lerp(0.45, 1, ramp(s, 0.6, 1.15))
    };
    thOp = hot(s, 1.65, 3.45, 0.45);
    bOp = hot(s, 2.55, 4.25, 0.45);
    kOp = hot(s, 2.55, 4.7, 0.45);
    infOp = 0.45 + 0.55 * Math.max(band(s, 3.25, 3.65, 4.7, 5.3), ramp(s, 4.3, 4.9) * 0.5);

    pl = {
      x: lerp(LAY.bX, LAY.plX, uSplit),
      y: lerp(LAY.bY, LAY.plY, uSplit),
      sc: lerp(0.42, 1, uSplit),
      op: ramp(s, 3.3, 3.95) * (0.78 + 0.22 * band(s, 3.6, 4.05, 6.2, 6.6))
    };
pl2 = {
    x: lerp(LAY.memX, 246, ramp(s, 5.15, 5.9)),
    y: lerp(LAY.memY, 306, ramp(s, 5.15, 5.9)),
    sc: lerp(0.28, 0.5, ramp(s, 5.15, 5.9)),
    op: ramp(s, 5.2, 5.85)
  };
  pl3 = {
    x: lerp(LAY.memX, 210, ramp(s, 5.3, 6)),
    y: lerp(LAY.memY, 408, ramp(s, 5.3, 6)),
    sc: lerp(0.26, 0.46, ramp(s, 5.3, 6)),
    op: ramp(s, 5.35, 5.95)
  };
    mem = {
      x: lerp(LAY.bX, LAY.memX, uSplit),
      y: lerp(LAY.bY, LAY.memY, uSplit),
      sc: lerp(0.4, 1, uSplit),
      op: ramp(s, 3.3, 3.95) * (0.75 + 0.25 * Math.max(band(s, 3.6, 4.05, 4.8, 5.3), ramp(s, 5.15, 5.8))),
      glow: ramp(s, 5.15, 5.8)
    };
    killer = {
      x: lerp(LAY.kX, 424, uAtk),
      y: lerp(LAY.kY, 344, uAtk),
      op: kOp
    };
    inf = {
      x: LAY.infX + uSq * 6,
      y: LAY.infY,
      sx: 1 + uSq * 0.16,
      sy: 1 - uSq * 0.28,
      op: infOp,
      dash: uSq,
      solid: 1 - uSq
    };
    abOp = ramp(s, 4.45, 5.1);

    function along(ax, ay, bx, by, radA, radB) {
      p1 = edge(ax, ay, radA, bx, by);
      p2 = edge(bx, by, radB, ax, ay);
      return arrowGeom(p1[0], p1[1], p2[0], p2[1]);
    }

    g = {
      bug: bug, eat: eatP, c1: c1, c2: c2, c3: c3, pres: pres,
      pl: pl, pl2: pl2, pl3: pl3, mem: mem, killer: killer, inf: inf,
      macOp: macOp, thOp: thOp, bOp: bOp, abOp: abOp,
      titleOp: labelOp(Math.max(bug.op, c1.op)),
      agOp: labelOp(Math.max(bug.op, c1.op)),
      idx: idx,
      readout: STAGE_LINE[idx],
      follow: FOLLOW[idx],
      active: ACTIVE[idx]
    };
    g.arrows = {
      inv: along(bug.x, bug.y, LAY.macX, LAY.macY, 36 * bug.sc, 54),
      mh: along(LAY.macX, LAY.macY, LAY.thX, LAY.thY, 52, 30),
      hb: along(LAY.thX, LAY.thY, LAY.bX, LAY.bY, 30, 26),
      hk: along(LAY.thX, LAY.thY, killer.x, killer.y, 30, 28),
      bp: along(LAY.bX, LAY.bY, pl.x, pl.y, 24, 30 * pl.sc),
      bm: along(LAY.bX, LAY.bY, mem.x, mem.y, 24, 18 * mem.sc),
      ki: along(killer.x, killer.y, inf.x, inf.y, 26, 32 * inf.sx)
    };
g.arrows.inv.op = (1 - ramp(s, 0.05, 0.7)) * (g.arrows.inv.hide ? 0 : 1);
  g.arrows.mh.op = band(s, 1.2, 1.65, 2.15, 2.7) * (g.arrows.mh.hide ? 0 : 1);
  g.arrows.hb.op = band(s, 2.4, 2.85, 3.35, 3.85) * (g.arrows.hb.hide ? 0 : 1);
  g.arrows.hk.op = band(s, 2.4, 2.85, 3.35, 3.85) * (g.arrows.hk.hide ? 0 : 1);
    g.arrows.bp.op = band(s, 3.35, 3.85, 4.35, 4.9) * (g.arrows.bp.hide ? 0 : 1) * (pl.op > 0.05 ? 1 : 0);
    g.arrows.bm.op = band(s, 3.35, 3.85, 4.35, 4.9) * (g.arrows.bm.hide ? 0 : 1) * (mem.op > 0.05 ? 1 : 0);
    g.arrows.ki.op = band(s, 3.4, 3.85, 4.15, 4.55) * (g.arrows.ki.hide ? 0 : 1);
    g.abs = [];
    for (var i = 0; i < ABS.length; i++) {
      g.abs.push(ramp(s, ABS[i].a, ABS[i].a + 0.38));
    }
    return g;
  }

  function textEl(k, x, y, anchor, size, weight, fill, op, str) {
    return '<text data-k="' + k + '" x="' + x + '" y="' + y + '" text-anchor="' + anchor
      + '" font-size="' + size + '"' + (weight ? ' font-weight="700"' : '')
      + ' fill="' + fill + '"' + opAttr(op) + '>' + str + '</text>';
  }

  function arrowSvg(id, color, dashed, geom) {
    var dash = dashed ? ' stroke-dasharray="7 5"' : '';
    return '<g data-k="ar-' + id + '"' + opAttr(geom.op) + '>'
      + '<line data-k="ar-' + id + '-ln" x1="' + geom.x1 + '" y1="' + geom.y1 + '" x2="' + geom.x2 + '" y2="' + geom.y2
      + '" stroke="' + color + '" stroke-width="2.4"' + dash + '/>'
      + '<path data-k="ar-' + id + '-hd" d="' + geom.hd + '" fill="' + color + '"/>'
      + '</g>';
  }

  function renderFlow(v) {
    var M = flowModel(v.stage);
    var s = [];
    var i;
    s.push(STYLE);
    s.push('<g data-part="humoral">');
    s.push('<rect x="8" y="252" width="268" height="178" rx="16" fill="' + C.s1 + '" stroke="' + C.c1 + '" stroke-width="1.6" stroke-opacity="0.45"/>');
    s.push(textEl('hum-lab', 22, 274, 'start', 16, 1, C.c1, 1, '체액성 면역'));
    s.push('</g>');
    s.push('<g data-part="cellular">');
    s.push('<rect x="284" y="252" width="268" height="178" rx="16" fill="' + C.s3 + '" stroke="' + C.c3 + '" stroke-width="1.6" stroke-opacity="0.45"/>');
    s.push(textEl('cel-lab', 418, 274, 'middle', 16, 1, C.c3, 1, '세포성 면역'));
    s.push('</g>');

    s.push(arrowSvg('inv', C.c2, 1, M.arrows.inv));
    s.push(arrowSvg('mh', C.c6, 0, M.arrows.mh));
    s.push(arrowSvg('hb', C.c5, 0, M.arrows.hb));
    s.push(arrowSvg('hk', C.c5, 0, M.arrows.hk));
    s.push(arrowSvg('bp', C.c1, 0, M.arrows.bp));
    s.push(arrowSvg('bm', C.c4, 0, M.arrows.bm));
    s.push(arrowSvg('ki', C.c3, 0, M.arrows.ki));

    s.push('<g data-part="macrophage">');
    s.push('<g data-k="mac-fade"' + opAttr(M.macOp) + '>');
    s.push('<g transform="translate(' + LAY.macX + ',' + LAY.macY + ')">' + MACRO + '</g>');
    s.push(textEl('mac-lab', LAY.macX, 170, 'middle', 15, 0, C.ink, 1, '대식세포'));
    s.push('</g></g>');

    s.push('<g data-part="presentation">');
    s.push('<g data-k="pres-fade"' + opAttr(M.pres.op) + '>');
    s.push('<g data-k="pres-tf"' + trAttr(tf(LAY.macX, LAY.macY, M.pres.sc)) + '>' + PRES + '</g>');
    s.push('</g></g>');

    s.push('<g data-part="antigen">');
    s.push('<g data-k="bug-fade"' + opAttr(M.bug.op) + '>');
    s.push('<g data-k="bug-tf"' + trAttr(tf(M.bug.x, M.bug.y, M.bug.sc)) + '>' + VIRUS + '</g>');
    s.push('</g></g>');

    s.push('<g data-part="antigen">');
    s.push('<g data-k="eat-fade"' + opAttr(M.eat.op) + '>');
    s.push('<g transform="translate(' + (LAY.macX - 8) + ',' + (LAY.macY + 6) + ') scale(0.34)">' + VIRUS + '</g>');
    s.push('</g></g>');

    s.push('<g data-part="antigen">');
    s.push('<g data-k="c1-fade"' + opAttr(M.c1.op) + '><g data-k="c1-tf"' + trAttr(tf(M.c1.x, M.c1.y, M.c1.sc)) + '>' + VIRUS + '</g></g>');
    s.push('<g data-k="c2-fade"' + opAttr(M.c2.op) + '><g data-k="c2-tf"' + trAttr(tf(M.c2.x, M.c2.y, M.c2.sc)) + '>' + VIRUS + '</g></g>');
    s.push('<g data-k="c3-fade"' + opAttr(M.c3.op) + '><g data-k="c3-tf"' + trAttr(tf(M.c3.x, M.c3.y, M.c3.sc)) + '>' + VIRUS + '</g></g>');
    s.push(textEl('bug-title', LAY.bugX, 34, 'middle', 16, 1, C.ink, M.titleOp, '병원체'));
    s.push(textEl('bug-ag', 46, LAY.bugY + 5, 'end', 15, 0, C.ink, M.agOp, '항원'));
    s.push('</g>');

    s.push('<g data-part="helper_t">');
    s.push('<g data-k="th-fade"' + opAttr(M.thOp) + '>');
    s.push('<g transform="translate(' + LAY.thX + ',' + LAY.thY + ')">');
    s.push(lymph(C.s5, C.c5, 26, 9));
    s.push(tReceptors());
    s.push('</g>');
    s.push(textEl('th-lab', LAY.thX, 242, 'middle', 15, 0, C.ink, 1, '보조 T'));
    s.push('</g></g>');

    s.push('<g data-part="b_cell">');
    s.push('<g data-k="b-fade"' + opAttr(M.bOp) + '>');
    s.push('<g transform="translate(' + LAY.bX + ',' + LAY.bY + ')">');
    s.push(lymph(C.s1, C.c1, 22, 8));
    s.push(bReceptors());
    s.push('</g>');
    s.push(textEl('b-lab', LAY.bX, 354, 'middle', 15, 0, C.ink, 1, 'B 림프구'));
    s.push('</g></g>');

    s.push('<g data-part="plasma">');
    s.push('<g data-k="pl-fade"' + opAttr(M.pl.op) + '><g data-k="pl-tf"' + trAttr(tf(M.pl.x, M.pl.y, M.pl.sc)) + '>' + PLASMA + '</g></g>');
    s.push('<g data-k="pl2-fade"' + opAttr(M.pl2.op) + '><g data-k="pl2-tf"' + trAttr(tf(M.pl2.x, M.pl2.y, M.pl2.sc)) + '>' + PLASMA + '</g></g>');
    s.push('<g data-k="pl3-fade"' + opAttr(M.pl3.op) + '><g data-k="pl3-tf"' + trAttr(tf(M.pl3.x, M.pl3.y, M.pl3.sc)) + '>' + PLASMA + '</g></g>');
    s.push(textEl('pl-lab', LAY.plX, 374, 'middle', 15, 0, C.ink, labelOp(M.pl.op), '형질 세포'));
    s.push('</g>');

    s.push('<g data-part="memory">');
    s.push('<g data-k="mem-fade"' + opAttr(M.mem.op) + '>');
    s.push('<g data-k="mem-tf"' + trAttr(tf(M.mem.x, M.mem.y, M.mem.sc)) + '>');
    s.push('<circle data-k="mem-glow" r="22" fill="none" stroke="' + C.c4 + '" stroke-width="3"' + opAttr(M.mem.glow) + '/>');
    s.push(lymph(C.s4, C.c4, 16, 6));
    s.push('</g></g>');
    s.push(textEl('mem-lab', 112, 404, 'start', 15, 0, C.ink, labelOp(M.mem.op), '기억 세포'));
    s.push('</g>');

    s.push('<g data-part="killer_t">');
    s.push('<g data-k="k-fade"' + opAttr(M.killer.op) + '>');
    s.push('<g data-k="k-tf"' + trAttr(tf(M.killer.x, M.killer.y, 1)) + '>');
    s.push(lymph(C.s3, C.c3, 24, 8));
    s.push('<circle cx="6" cy="-6" r="3.2" fill="' + C.c2 + '"/>');
    s.push('<circle cx="10" cy="4" r="2.6" fill="' + C.c2 + '"/>');
    s.push('<circle cx="-2" cy="8" r="2.4" fill="' + C.c2 + '"/>');
    s.push('</g>');
    s.push(textEl('k-lab', LAY.kX, 370, 'middle', 15, 0, C.ink, 1, '세포독성 T'));
    s.push('</g></g>');

    s.push('<g data-part="infected">');
    s.push('<g data-k="inf-fade"' + opAttr(M.inf.op) + '>');
    s.push('<g data-k="inf-tf"' + trAttr(tf(M.inf.x, M.inf.y, 1)) + '>');
    s.push('<g data-k="inf-sq"' + trAttr('scale(' + r2(M.inf.sx) + ',' + r2(M.inf.sy) + ')') + '>');
    s.push('<ellipse rx="32" ry="26" fill="' + C.s8 + '" data-k="inf-fill" fill-opacity="' + r2(0.95 - M.inf.dash * 0.25) + '"/>');
    s.push('<ellipse class="fgx-vis" data-k="inf-solid" rx="32" ry="26" fill="none" stroke="' + C.c8 + '" stroke-width="2.3"' + opAttr(M.inf.solid) + '/>');
    s.push('<ellipse data-k="inf-dash" rx="32" ry="26" fill="none" stroke="' + C.c8 + '" stroke-width="2.4" stroke-dasharray="5 4"' + opAttr(M.inf.dash) + '/>');
    s.push('<circle cx="-8" cy="-4" r="5" fill="' + C.c2 + '"/>');
    s.push('<circle cx="8" cy="6" r="4.2" fill="' + C.c2 + '"/>');
    s.push('<circle cx="2" cy="-10" r="3.4" fill="' + C.c7 + '"/>');
    s.push('<circle cx="-12" cy="10" r="3.2" fill="' + C.c2 + '"/>');
    s.push('<ellipse cx="-4" cy="0" rx="8" ry="6" fill="' + C.card + '" stroke="' + C.c8 + '" stroke-width="1.2"/>');
    s.push('</g>');
    s.push('<ellipse class="fgx-hit" rx="40" ry="34" fill="transparent" style="pointer-events:all"/>');
    s.push('</g>');
    s.push(textEl('inf-lab', LAY.infX, 392, 'middle', 15, 0, C.ink, 1, '감염된 세포'));
    s.push('</g></g>');

    s.push('<g data-part="antibody">');
    for (i = 0; i < ABS.length; i++) {
      s.push('<g data-k="ab-' + i + '"' + opAttr(M.abs[i]) + '>');
      s.push('<g transform="translate(' + ABS[i].x + ',' + ABS[i].y + ') rotate(' + ABS[i].rot + ')">');
      s.push(yMark(C.c1, 2.6));
      s.push('<circle class="fgx-hit" r="16" fill="transparent" style="pointer-events:all"/>');
      s.push('</g></g>');
    }
    s.push(textEl('ab-lab', 214, 228, 'middle', 15, 0, C.c1, labelOp(M.abOp), '항체'));
    s.push('</g>');
    return s.join('');
  }

  function hArrow(x1, x2, y, color) {
    var a = Math.min(x1, x2);
    var b = Math.max(x1, x2);
    var head = b - a < 22 ? Math.max(5, (b - a) * 0.36) : 8;
    var d = 'M' + r1(a + head * 0.7) + ',' + y + 'L' + r1(b - head * 0.7) + ',' + y;
    var h1 = 'M' + r1(a) + ',' + y + 'L' + r1(a + head) + ',' + r1(y - 4.5) + 'L' + r1(a + head) + ',' + r1(y + 4.5) + 'Z';
    var h2 = 'M' + r1(b) + ',' + y + 'L' + r1(b - head) + ',' + r1(y - 4.5) + 'L' + r1(b - head) + ',' + r1(y + 4.5) + 'Z';
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2.2"/>'
      + '<path d="' + h1 + '" fill="' + color + '"/>'
      + '<path d="' + h2 + '" fill="' + color + '"/>';
  }

  function syringe(color) {
    return '<line x1="0" y1="-20" x2="0" y2="-13" stroke="' + color + '" stroke-width="1.7"/>'
      + '<rect x="-6" y="-13" width="12" height="18" rx="2" fill="' + C.card + '" stroke="' + color + '" stroke-width="1.7"/>'
      + '<line x1="-6" y1="-4" x2="6" y2="-4" stroke="' + color + '" stroke-width="1.3"/>'
      + '<line x1="0" y1="5" x2="0" y2="12" stroke="' + color + '" stroke-width="2"/>'
      + '<rect x="-5" y="11" width="10" height="4" rx="1.2" fill="' + color + '"/>';
  }

  function graphActive(day, showB) {
    var a = [];
    if (day < 28) a.push('primary');
    else a.push('secondary');
    if (day < 7 || (day >= 28 && day < 30) || (showB && day >= 28 && day <= 35)) a.push('latent');
    return a;
  }

  function graphModel(day, showB) {
    var d = clamp(num(day, 0), 0, 56);
    var bOn = showB !== false;
    var aOn = d <= 28 ? pathUntil(SAMP_A1, d) : pathD(SAMP_A1);
    var a2On = pathUntil(SAMP_A2, d);
    var bPath = bOn ? pathUntil(SAMP_B, d) : '';
    var ax = xDay(d);
    var ay = yVal(valueA(d));
    var by = yVal(valueB(d));
    return {
      day: d,
      showB: bOn,
      aOn: aOn || 'M0,-40',
      a2On: a2On || 'M0,-40',
      bOnPath: bPath || 'M0,-40',
      aOnOp: aOn ? 1 : 0,
      a2OnOp: a2On ? 1 : 0,
      bOp: bOn ? 1 : 0,
      bOnOp: bOn && bPath ? 1 : 0,
      dotX: ax,
      dotY: ay,
      dotBX: ax,
      dotBY: by,
      dotBOp: bOn && d >= 28 ? 1 : 0,
      inj: bOn ? 'A 재주사 + B 주사' : 'A 재주사',
      syrX: bOn ? xDay(28) - 9 : xDay(28),
      readout: readoutGraph(d, bOn),
      follow: d < 28 ? 'primary' : 'secondary',
      active: graphActive(d, bOn)
    };
  }

  function curveGroup(part, cls, faintD, onD, onOp, color, sw, hitOn) {
    return '<g data-part="' + part + '" class="' + cls + '">'
      + '<path data-k="' + cls + '-faint" d="' + faintD + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" stroke-opacity="0.34"' + opAttr(hitOn) + '/>'
      + '<path data-k="' + cls + '-on" class="fgx-vis" d="' + onD + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '"' + opAttr(onOp) + '/>'
      + '<path data-k="' + cls + '-hit" d="' + faintD + '" fill="none" stroke="transparent" stroke-width="18" style="pointer-events:stroke" stroke-opacity="' + (hitOn ? 1 : 0) + '"/>'
      + '</g>';
  }

  function renderGraph(v) {
    var G = graphModel(v.day, v.showB);
    var s = [];
    var ticks = [0, 7, 14, 21, 28, 35, 42, 49, 56];
    var i, x;
    s.push(STYLE);
    s.push('<rect x="' + GX0 + '" y="' + GY0 + '" width="' + XSPAN + '" height="' + YSPAN + '" fill="' + C.elev + '" stroke="' + C.line + '" stroke-width="1.6"/>');
    s.push('<line data-k="now" x1="' + r1(G.dotX) + '" y1="' + GY0 + '" x2="' + r1(G.dotX) + '" y2="' + GY1 + '" stroke="' + C.ink + '" stroke-width="1.4" stroke-dasharray="4 4" stroke-opacity="0.55"/>');
    s.push('<line x1="' + r1(xDay(0)) + '" y1="' + GY0 + '" x2="' + r1(xDay(0)) + '" y2="' + GY1 + '" stroke="' + C.c1 + '" stroke-width="1.5" stroke-dasharray="4 4" stroke-opacity="0.55"/>');
    s.push('<line x1="' + r1(xDay(28)) + '" y1="' + GY0 + '" x2="' + r1(xDay(28)) + '" y2="' + GY1 + '" stroke="' + C.c1 + '" stroke-width="1.5" stroke-dasharray="4 4" stroke-opacity="0.7"/>');

    for (i = 0; i < ticks.length; i++) {
      x = xDay(ticks[i]);
      s.push('<line x1="' + r1(x) + '" y1="' + GY1 + '" x2="' + r1(x) + '" y2="' + (GY1 + 6) + '" stroke="' + C.dim + '" stroke-width="1.4"/>');
      s.push('<text x="' + r1(x) + '" y="' + (GY1 + 22) + '" text-anchor="middle" font-size="15" fill="' + C.dim + '">' + ticks[i] + '</text>');
    }
    s.push(textEl('y-title', GX0, 34, 'start', 16, 1, C.ink, 1, '항체 농도'));
    s.push('<text x="62" y="66" text-anchor="end" font-size="15" fill="' + C.dim + '">높음</text>');
    s.push('<text x="56" y="278" text-anchor="end" font-size="15" fill="' + C.dim + '">낮음</text>');

    s.push(curveGroup('primary', 'a1', pathD(SAMP_A1), G.aOn, G.aOnOp, C.c1, 3.2, 1));
    s.push(curveGroup('secondary', 'a2', pathD(SAMP_A2), G.a2On, G.a2OnOp, C.c1, 5, 1));
    s.push(curveGroup('primary', 'bb', pathD(SAMP_B), G.bOnPath, G.bOnOp, C.c2, 3.2, G.bOp));

    s.push('<g data-part="latent">');
    s.push(hArrow(xDay(1), xDay(7) - 2, 286, C.c1));
    s.push('<text x="' + r1((xDay(1) + xDay(7)) / 2) + '" y="272" text-anchor="middle" font-size="15" fill="' + C.c1 + '">잠복기</text>');
    s.push('<rect class="fgx-hit" x="' + r1(xDay(0)) + '" y="258" width="' + r1(xDay(7) - xDay(0)) + '" height="36" fill="transparent" style="pointer-events:all"/>');
    s.push('</g>');
s.push('<g data-part="latent">');
  s.push(hArrow(xDay(28), xDay(30), 216, C.c1));
  s.push('<line x1="' + r1(xDay(30)) + '" y1="216" x2="' + r1(xDay(30)) + '" y2="232" stroke="' + C.c1 + '" stroke-width="1.7"/>');
  s.push('<text x="' + r1(xDay(28) - 8) + '" y="221" text-anchor="end" font-size="15" fill="' + C.c1 + '">잠복기</text>');
  s.push('<rect class="fgx-hit" x="' + r1(xDay(28) - 54) + '" y="200" width="' + r1(xDay(30) - xDay(28) + 62) + '" height="36" fill="transparent" style="pointer-events:all"/>');
  s.push('</g>');
  s.push('<g data-part="latent">');
  s.push('<g data-k="lat-b"' + opAttr(G.bOp) + '>');
  s.push(hArrow(xDay(28.4), xDay(35) - 2, 293, C.c2));
  s.push('<text x="' + r1(xDay(33.2)) + '" y="270" text-anchor="middle" font-size="15" fill="' + C.c2 + '">잠복기</text>');
  s.push('<rect class="fgx-hit" x="' + r1(xDay(28)) + '" y="252" width="' + r1(xDay(35) - xDay(28)) + '" height="52" fill="transparent" style="pointer-events:all"/>');
  s.push('</g></g>');

    s.push('<circle data-k="dot-a" cx="' + r1(G.dotX) + '" cy="' + r1(G.dotY) + '" r="5.5" fill="' + C.c1 + '" stroke="' + C.card + '" stroke-width="2"/>');
    s.push('<circle data-k="dot-b" cx="' + r1(G.dotBX) + '" cy="' + r1(G.dotBY) + '" r="5.5" fill="' + C.c2 + '" stroke="' + C.card + '" stroke-width="2"' + opAttr(G.dotBOp) + '/>');

    s.push('<g data-k="leg">');
    s.push('<line x1="86" y1="74" x2="112" y2="74" stroke="' + C.c1 + '" stroke-width="3.2"/>');
    s.push('<text x="118" y="79" font-size="15" fill="' + C.ink + '">A 1차</text>');
    s.push('<line x1="86" y1="96" x2="112" y2="96" stroke="' + C.c1 + '" stroke-width="5"/>');
    s.push('<text x="118" y="101" font-size="15" fill="' + C.ink + '">A 2차</text>');
    s.push('<g data-k="leg-b"' + opAttr(G.bOp) + '>');
    s.push('<line x1="86" y1="118" x2="112" y2="118" stroke="' + C.c2 + '" stroke-width="3.2"/>');
    s.push('<text x="118" y="123" font-size="15" fill="' + C.ink + '">B 1차</text>');
    s.push('</g></g>');

    s.push('<g transform="translate(' + r1(xDay(0)) + ',372)">' + syringe(C.c1) + '</g>');
    s.push('<text x="' + r1(xDay(0) + 18) + '" y="408" text-anchor="start" font-size="15" fill="' + C.ink + '">항원 A 주사</text>');
    s.push('<g data-k="syr-a"' + trAttr('translate(' + r1(G.syrX) + ',372)') + '>' + syringe(C.c1) + '</g>');
    s.push('<g data-k="syr-b"' + opAttr(G.bOp) + ' transform="translate(' + r1(xDay(28) + 10) + ',372)">' + syringe(C.c2) + '</g>');
    s.push('<text data-k="inj-lab" x="' + r1(xDay(28)) + '" y="412" text-anchor="middle" font-size="15" fill="' + C.ink + '">' + G.inj + '</text>');
    return s.join('');
  }

  var STYLE = '<style>.fgx-fig-immune text{font-family:inherit;stroke:none}.fgx-fig-immune .fgx-hit{pointer-events:all}</style>';

  function setOp(ctx, k, op) {
    var el = ctx.q('[data-k="' + k + '"]');
    if (el) el.setAttribute('opacity', String(r2(op)));
  }
  function setTf(ctx, k, value) {
    var el = ctx.q('[data-k="' + k + '"]');
    if (el) el.setAttribute('transform', value);
  }
  function setA(ctx, k, name, value) {
    var el = ctx.q('[data-k="' + k + '"]');
    if (el) el.setAttribute(name, value);
  }

  function applyArrow(ctx, id, geom) {
    setOp(ctx, 'ar-' + id, geom.op);
    setA(ctx, 'ar-' + id + '-ln', 'x1', geom.x1);
    setA(ctx, 'ar-' + id + '-ln', 'y1', geom.y1);
    setA(ctx, 'ar-' + id + '-ln', 'x2', geom.x2);
    setA(ctx, 'ar-' + id + '-ln', 'y2', geom.y2);
    setA(ctx, 'ar-' + id + '-hd', 'd', geom.hd);
  }

  function applyFlow(ctx, M) {
    var i;
    setOp(ctx, 'bug-fade', M.bug.op);
    setTf(ctx, 'bug-tf', tf(M.bug.x, M.bug.y, M.bug.sc));
    setOp(ctx, 'eat-fade', M.eat.op);
    setOp(ctx, 'c1-fade', M.c1.op);
    setTf(ctx, 'c1-tf', tf(M.c1.x, M.c1.y, M.c1.sc));
    setOp(ctx, 'c2-fade', M.c2.op);
    setTf(ctx, 'c2-tf', tf(M.c2.x, M.c2.y, M.c2.sc));
    setOp(ctx, 'c3-fade', M.c3.op);
    setTf(ctx, 'c3-tf', tf(M.c3.x, M.c3.y, M.c3.sc));
    setOp(ctx, 'bug-title', M.titleOp);
    setOp(ctx, 'bug-ag', M.agOp);
    setOp(ctx, 'mac-fade', M.macOp);
    setOp(ctx, 'pres-fade', M.pres.op);
    setTf(ctx, 'pres-tf', tf(LAY.macX, LAY.macY, M.pres.sc));
    setOp(ctx, 'th-fade', M.thOp);
    setOp(ctx, 'b-fade', M.bOp);
    setOp(ctx, 'pl-fade', M.pl.op);
    setTf(ctx, 'pl-tf', tf(M.pl.x, M.pl.y, M.pl.sc));
    setOp(ctx, 'pl2-fade', M.pl2.op);
    setTf(ctx, 'pl2-tf', tf(M.pl2.x, M.pl2.y, M.pl2.sc));
    setOp(ctx, 'pl3-fade', M.pl3.op);
    setTf(ctx, 'pl3-tf', tf(M.pl3.x, M.pl3.y, M.pl3.sc));
    setOp(ctx, 'pl-lab', labelOp(M.pl.op));
    setOp(ctx, 'mem-fade', M.mem.op);
    setTf(ctx, 'mem-tf', tf(M.mem.x, M.mem.y, M.mem.sc));
    setOp(ctx, 'mem-glow', M.mem.glow);
    setOp(ctx, 'mem-lab', labelOp(M.mem.op));
    setOp(ctx, 'k-fade', M.killer.op);
    setTf(ctx, 'k-tf', tf(M.killer.x, M.killer.y, 1));
    setOp(ctx, 'inf-fade', M.inf.op);
    setTf(ctx, 'inf-tf', tf(M.inf.x, M.inf.y, 1));
    setTf(ctx, 'inf-sq', 'scale(' + r2(M.inf.sx) + ',' + r2(M.inf.sy) + ')');
    setOp(ctx, 'inf-solid', M.inf.solid);
    setOp(ctx, 'inf-dash', M.inf.dash);
    setA(ctx, 'inf-fill', 'fill-opacity', String(r2(0.95 - M.inf.dash * 0.25)));
    for (i = 0; i < M.abs.length; i++) setOp(ctx, 'ab-' + i, M.abs[i]);
    setOp(ctx, 'ab-lab', labelOp(M.abOp));
    applyArrow(ctx, 'inv', M.arrows.inv);
    applyArrow(ctx, 'mh', M.arrows.mh);
    applyArrow(ctx, 'hb', M.arrows.hb);
    applyArrow(ctx, 'hk', M.arrows.hk);
    applyArrow(ctx, 'bp', M.arrows.bp);
    applyArrow(ctx, 'bm', M.arrows.bm);
    applyArrow(ctx, 'ki', M.arrows.ki);
  }

  function applyGraph(ctx, G) {
    var el;
    setA(ctx, 'a1-on', 'd', G.aOn);
    setOp(ctx, 'a1-on', G.aOnOp);
    setA(ctx, 'a2-on', 'd', G.a2On);
    setOp(ctx, 'a2-on', G.a2OnOp);
    setA(ctx, 'bb-on', 'd', G.bOnPath);
    setOp(ctx, 'bb-on', G.bOnOp);
    setOp(ctx, 'bb-faint', G.bOp);
    el = ctx.q('[data-k="bb-hit"]');
    if (el) {
      el.setAttribute('stroke-opacity', G.bOp ? '1' : '0');
      el.setAttribute('style', G.bOp ? 'pointer-events:stroke' : 'pointer-events:none');
    }
    setA(ctx, 'dot-a', 'cx', r1(G.dotX));
    setA(ctx, 'dot-a', 'cy', r1(G.dotY));
    setA(ctx, 'dot-b', 'cx', r1(G.dotBX));
    setA(ctx, 'dot-b', 'cy', r1(G.dotBY));
    setOp(ctx, 'dot-b', G.dotBOp);
    setA(ctx, 'now', 'x1', r1(G.dotX));
    setA(ctx, 'now', 'x2', r1(G.dotX));
    setOp(ctx, 'lat-b', G.bOp);
    setOp(ctx, 'leg-b', G.bOp);
    setOp(ctx, 'syr-b', G.bOp);
    setTf(ctx, 'syr-a', 'translate(' + r1(G.syrX) + ',372)');
    el = ctx.q('[data-k="inj-lab"]');
    if (el) el.textContent = G.inj;
  }

  var def = {
    viewBox: [560, 440],
    views: [
      { id: 'flow', label: '반응 흐름', hint: '단계를 옮기면 침입부터 2차 반응까지 세포가 순서대로 움직입니다.' },
      { id: 'graph', label: '1차·2차 반응', hint: '같은 항원 A는 2차에 빠르고 강하고, 처음인 항원 B는 다시 1차 반응입니다.' }
    ],
    controls: [
      {
        id: 'stage', type: 'range', label: '단계', min: 0, max: 6, step: 0.02, value: 0,
        fmt: function (v) { return STAGE_FMT[stageIndex(num(v, 0))]; },
        views: ['flow']
      },
      {
        id: 'day', type: 'range', label: '경과 일수', min: 0, max: 56, step: 0.5, value: 0,
        fmt: function (v) { return fmtDay(num(v, 0)) + '일'; },
        views: ['graph']
      },
      {
        id: 'showB', type: 'toggle', label: '항원 B도 함께 주사', value: true,
        views: ['graph']
      }
    ],
    animate: [
      { control: 'stage', from: 0, to: 6, duration: 22000, loop: true, views: ['flow'] },
      { control: 'day', from: 0, to: 56, duration: 12000, loop: true, views: ['graph'] }
    ],
    render: function (v, view) {
      var bag = v || {};
      if (view === 'graph') return renderGraph(bag);
      return renderFlow(bag);
    },
    update: function (ctx) {
      var bag = ctx.v || {};
      if (ctx.view === 'graph') {
        var G = graphModel(bag.day, bag.showB);
        applyGraph(ctx, G);
        return { readout: G.readout, active: G.active, follow: G.follow };
      }
      var M = flowModel(bag.stage);
      applyFlow(ctx, M);
      return { readout: M.readout, active: M.active, follow: M.follow };
    },
    _calc: function (v) {
      var bag = v || {};
      var stage = clamp(num(bag.stage, 0), 0, 6);
      var day = clamp(num(bag.day, 0), 0, 56);
      var showB = bag.showB !== false;
      return {
        stage: stageIndex(stage),
        day: day,
        a: Math.round(valueA(day) * 1000) / 1000,
        b: showB ? Math.round(valueB(day) * 1000) / 1000 : null,
        flow: STAGE_LINE[stageIndex(stage)],
        graph: readoutGraph(day, showB)
      };
    },
    _series: function (day) {
      return { a: valueA(day), b: valueB(day) };
    }
  };

  NMFIG.define('immune', def);
})(window.NMFIG);
