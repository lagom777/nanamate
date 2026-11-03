/* 콩팥 네프론 — 여과·재흡수·분비와 물질이 오줌까지 가는 길.
 * 컨트롤 sub: protein 단백질, glucose 포도당, urea 요소, water 물, inulin 이눌린.
 * 농도: 단백질 8→0→0 g/100 mL, 포도당 0.1→0.1→0, 요소 0.03→0.03→2.0,
 * 물 약 99% 재흡수, 이눌린 0.1→0.1→12 mg/mL(120배). 입자 운명 u=(i*0.618)%1, 주기 10초.
 * 보먼 바깥 반지름 52, 사구체 약 30, 세뇨관 굵기 16, 집합관 굵기 24 (viewBox 단위).
 */
(function (NMFIG) {
  'use strict';

  var PERIOD = 10;
  var GCX = 118;
  var GCY = 124;
  var R_OUT = 52;
  var R_IN = 40;
  var R_GLOM = 28;
  var TUBE_W = 16;
  var DUCT_W = 24;
  var CAP_W = 10;
  var ARTERY_W = 18;
  var OFFSET = 26;

  var CARD = { x: 304, y: 46, w: 242, h: 172 };
  var DUCT_CX = 408;
  var DUCT_TOP = 278;
  var DUCT_BOT = 362;
  var DROP_Y = 382;

  var INK = 'var(--fgx-ink, #1a1f2e)';
  var DIM = 'var(--fgx-dim, #4a5468)';
  var LINE = 'var(--fgx-line, #d5d8de)';
  var CARDC = 'var(--fgx-card, #fff)';
  var C1 = 'var(--fgx-c1, #2563eb)';
  var C2 = 'var(--fgx-c2, #dc2626)';
  var C3 = 'var(--fgx-c3, #d97706)';
  var C4 = 'var(--fgx-c4, #16a34a)';
  var C6 = 'var(--fgx-c6, #0891b2)';
  var C3S = 'var(--fgx-c3-soft, #f8e6d2)';
  var C2S = 'var(--fgx-c2-soft, #f8d4d4)';
  var C6S = 'var(--fgx-c6-soft, #d5eef3)';
  var URINE = '#eab308';

  var FORMULA = '오줌 = 여과 − 재흡수 + 분비';

  var SUBS = {
    protein: {
      id: 'protein', name: '단백질', color: 'var(--fgx-c5, #7c3aed)', r: 6,
      n: 12, secN: 0, filtered: false, reP: 0, dense: false, active: ['filtration'],
      nums: '8 → 0 → 0', unit: 'g/100 mL',
      note1: '크기가 커서 여과되지 않음', note2: '',
      readout: '단백질  8 → 0 → 0 g/100 mL\n크기가 커서 여과되지 않음\n' + FORMULA
    },
    glucose: {
      id: 'glucose', name: '포도당', color: 'var(--fgx-c3, #d97706)', r: 4,
      n: 14, secN: 0, filtered: true, reP: 1, dense: false, active: ['reabsorption'],
      nums: '0.1 → 0.1 → 0', unit: '',
      note1: '여과 후 전부 재흡수', note2: '',
      readout: '포도당  0.1 → 0.1 → 0\n여과 후 전부 재흡수\n' + FORMULA
    },
    urea: {
      id: 'urea', name: '요소', color: 'var(--fgx-c8, #65748b)', r: 3.5,
      n: 10, secN: 4, filtered: true, reP: 0.5, dense: true, active: ['urine'],
      nums: '0.03 → 0.03 → 2.0', unit: '',
      note1: '일부 재흡수 +', note2: '물 재흡수 → 농축',
      readout: '요소  0.03 → 0.03 → 2.0\n일부 재흡수 + 물 재흡수 → 농축\n' + FORMULA
    },
    water: {
      id: 'water', name: '물', color: 'var(--fgx-c1, #2563eb)', r: 3,
      n: 20, secN: 0, filtered: true, reP: 0.94, dense: false, water: true, active: ['reabsorption'],
      nums: '', unit: '',
      note1: '여과된 물의 약 99 %', note2: '재흡수',
      readout: '물  여과된 물의 약 99 % 재흡수\n' + FORMULA
    },
    inulin: {
      id: 'inulin', name: '이눌린', color: 'var(--fgx-c7, #db2777)', r: 4,
      n: 14, secN: 0, filtered: true, reP: 0, dense: true, active: ['filtration'],
      nums: '0.1 → 0.1 → 12', unit: 'mg/mL',
      note1: '여과만 됨 → 농축 120배', note2: '',
      readout: '이눌린  0.1 → 0.1 → 12 mg/mL\n여과만 됨 → 농축 120배\n' + FORMULA
    }
  };

  var MAX_N = 20;
  var MAX_SEC = 4;
  var CACHE = {};

  function n(v) {
    if (typeof v !== 'number' || v !== v || v === Infinity || v === -Infinity) return '0';
    return (Math.round(v * 10) / 10).toFixed(1);
  }

  function hashU(i) {
    var x = i * 0.618;
    return x - Math.floor(x);
  }

  function subOf(v) {
    var id = v && v.sub;
    return SUBS[id] || SUBS.glucose;
  }

  function ptAt(pts, f) {
    var m = pts.length - 1;
    var x = f * m;
    var i, t;
    if (x < 0) x = 0;
    if (x > m) x = m;
    i = Math.floor(x);
    if (i >= m) return [pts[m][0], pts[m][1]];
    t = x - i;
    return [
      pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t,
      pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t
    ];
  }

  function dedupe(pts) {
    var out = [];
    var i, p, q, dx, dy;
    for (i = 0; i < pts.length; i++) {
      p = pts[i];
      if (out.length) {
        q = out[out.length - 1];
        dx = p[0] - q[0];
        dy = p[1] - q[1];
        if (dx * dx + dy * dy < 0.16) continue;
      }
      out.push(p);
    }
    return out;
  }

  function slicePts(pts, t0, t1) {
    var out = [];
    var m = pts.length - 1;
    var a, b, i0, i1, i;
    if (t1 < t0) t1 = t0;
    a = t0 * m;
    b = t1 * m;
    if (b < a + 0.001) b = a + 0.001;
    i0 = Math.ceil(a);
    i1 = Math.floor(b);
    out.push(ptAt(pts, t0));
    for (i = i0; i <= i1; i++) {
      if (i > 0 && i < pts.length) out.push(pts[i]);
    }
    out.push(ptAt(pts, t1 > 1 ? 1 : t1));
    return dedupe(out);
  }

  function tracker(pts, wts) {
    var cum = [0];
    var total = 0;
    var i, dx, dy, L, w;
    for (i = 1; i < pts.length; i++) {
      dx = pts[i][0] - pts[i - 1][0];
      dy = pts[i][1] - pts[i - 1][1];
      L = Math.sqrt(dx * dx + dy * dy);
      w = wts && wts[i - 1] ? wts[i - 1] : 1;
      total += L * w;
      cum.push(total);
    }
    function at(t) {
      var target, lo, hi, mid, span, f;
      if (t <= 0 || !(total > 0)) return { x: pts[0][0], y: pts[0][1] };
      if (t > 1) t = 1;
      target = t * total;
      lo = 1;
      hi = pts.length - 1;
      while (lo < hi) {
        mid = (lo + hi) >> 1;
        if (cum[mid] < target) lo = mid + 1;
        else hi = mid;
      }
      span = cum[lo] - cum[lo - 1];
      f = span > 0 ? (target - cum[lo - 1]) / span : 0;
      return {
        x: pts[lo - 1][0] + (pts[lo][0] - pts[lo - 1][0]) * f,
        y: pts[lo - 1][1] + (pts[lo][1] - pts[lo - 1][1]) * f
      };
    }
    return { at: at, pts: pts, total: total };
  }

  function compile(sections) {
    var pts = [];
    var wts = [];
    var s, i, list, w, p, q;
    for (s = 0; s < sections.length; s++) {
      list = sections[s].pts;
      w = sections[s].w || 1;
      if (!list || !list.length) continue;
      for (i = 0; i < list.length; i++) {
        p = list[i];
        if (pts.length) {
          q = pts[pts.length - 1];
          if (Math.abs(q[0] - p[0]) < 0.3 && Math.abs(q[1] - p[1]) < 0.3) continue;
          wts.push(w);
        }
        pts.push([p[0], p[1]]);
      }
    }
    if (pts.length < 2) {
      pts.push([pts[0][0] + 1, pts[0][1]]);
      wts.push(1);
    }
    return tracker(pts, wts);
  }

  function smoothSegs(pts) {
    var segs = [];
    var i, p0, p1, p2, p3;
    var len = pts.length;
    for (i = 0; i < len - 1; i++) {
      p0 = i === 0 ? pts[0] : pts[i - 1];
      p1 = pts[i];
      p2 = pts[i + 1];
      p3 = i + 2 < len ? pts[i + 2] : pts[len - 1];
      segs.push([
        p1,
        [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
        [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
        p2
      ]);
    }
    return segs;
  }

  function sampleSegs(segs, steps) {
    var pts = [];
    var s, i, t, u, p0, p1, p2, p3, a, b, c, d;
    for (s = 0; s < segs.length; s++) {
      p0 = segs[s][0];
      p1 = segs[s][1];
      p2 = segs[s][2];
      p3 = segs[s][3];
      for (i = 0; i < steps; i++) {
        t = i / steps;
        u = 1 - t;
        a = u * u * u;
        b = 3 * u * u * t;
        c = 3 * u * t * t;
        d = t * t * t;
        pts.push([
          a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
          a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]
        ]);
      }
    }
    p3 = segs[segs.length - 1][3];
    pts.push([p3[0], p3[1]]);
    return pts;
  }

  function segsD(segs) {
    var d = 'M ' + n(segs[0][0][0]) + ' ' + n(segs[0][0][1]);
    var i, s;
    for (i = 0; i < segs.length; i++) {
      s = segs[i];
      d += ' C ' + n(s[1][0]) + ' ' + n(s[1][1]) + ' ' + n(s[2][0]) + ' ' + n(s[2][1]) + ' ' + n(s[3][0]) + ' ' + n(s[3][1]);
    }
    return d;
  }

  function pathD(pts) {
    var parts = ['M', n(pts[0][0]), n(pts[0][1])];
    var i;
    for (i = 1; i < pts.length; i++) parts.push('L', n(pts[i][0]), n(pts[i][1]));
    return parts.join(' ');
  }

  function resample(pts, count) {
    var tr = tracker(pts, null);
    var out = [];
    var i, p;
    for (i = 0; i < count; i++) {
      p = tr.at(count === 1 ? 0 : i / (count - 1));
      out.push([p.x, p.y]);
    }
    return out;
  }

  function offsetPts(pts, dist) {
    var out = [];
    var i, a, b, tx, ty, len, m;
    m = pts.length - 1;
    for (i = 0; i < pts.length; i++) {
      a = pts[i === 0 ? 0 : i - 1];
      b = pts[i === m ? m : i + 1];
      tx = b[0] - a[0];
      ty = b[1] - a[1];
      len = Math.sqrt(tx * tx + ty * ty) || 1;
      tx /= len;
      ty /= len;
      out.push([pts[i][0] + ty * dist, pts[i][1] - tx * dist]);
    }
    return out;
  }

  function wiggle(pts, amp, waves) {
    var out = [];
    var i, a, b, tx, ty, len, nx, ny, w, m;
    m = pts.length - 1;
    for (i = 0; i < pts.length; i++) {
      a = pts[i === 0 ? 0 : i - 1];
      b = pts[i === m ? m : i + 1];
      tx = b[0] - a[0];
      ty = b[1] - a[1];
      len = Math.sqrt(tx * tx + ty * ty) || 1;
      nx = -ty / len;
      ny = tx / len;
      w = Math.sin((i / m) * waves * Math.PI * 2) * amp;
      out.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
    }
    return out;
  }

  function arcPts(cx, cy, r, deg0, deg1, count) {
    var pts = [];
    var i, a;
    for (i = 0; i <= count; i++) {
      a = (deg0 + (deg1 - deg0) * (i / count)) * Math.PI / 180;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return pts;
  }

  function hop(a, b) {
    var pts = [];
    var i, t;
    for (i = 0; i <= 6; i++) {
      t = i / 6;
      pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
    return pts;
  }

  function dist(a, b) {
    var dx = a[0] - b[0];
    var dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  function buildGeo() {
    var anchors = [
      [118, 178],
      [118, 230],
      [118, 300],
      [124, 338],
      [158, 356],
      [198, 344],
      [214, 300],
      [216, 272],
      [250, 294],
      [310, 314],
      [362, 318],
      [DUCT_CX, 304]
    ];
    var segs = smoothSegs(anchors);
    var rough = sampleSegs(segs, 10);
    var tubeArc = resample(rough, 96);
    var capOff = offsetPts(tubeArc, OFFSET);
    var capW = wiggle(capOff, 2.2, 3.2);
    var cap0 = capW[0];
    var aff = [
      [GCX + 18, GCY + 6],
      [GCX + 44, GCY + 30],
      [cap0[0] + 4, cap0[1] - 16],
      cap0
    ];
    var cutI = tubeArc.length - 1;
    var ci;
    for (ci = 0; ci < tubeArc.length; ci++) {
      if (tubeArc[ci][0] > 328) { cutI = ci; break; }
    }
    var cutF = cutI / (tubeArc.length - 1);
    var cutPt = ptAt(capW, cutF);
    var vein = [
      cutPt,
      [cutPt[0] + 16, 250],
      [390, 244],
      [470, 246],
      [534, 248]
    ];
    var artery = resample([[GCX, 8], [GCX, GCY]], 18);
    var filt = resample([[GCX, GCY], anchors[0]], 12);
    var glomArc = resample([
      [GCX, GCY],
      [GCX - 16, GCY - 10],
      [GCX - 12, GCY + 16],
      [GCX + 10, GCY + 18],
      [GCX + 24, GCY + 8]
    ], 16);
    var duct = [
      [DUCT_CX, 304],
      [DUCT_CX, DUCT_BOT],
      [DUCT_CX, DROP_Y]
    ];
    var outer = arcPts(GCX, GCY, R_OUT, 112, 440, 42);
    var inner = arcPts(GCX, GCY, R_IN, 112, 440, 36);
    return {
      anchors: anchors,
      segs: segs,
      tubeArc: tubeArc,
      capW: capW,
      aff: aff,
      vein: vein,
      artery: artery,
      filt: filt,
      glomArc: glomArc,
      duct: duct,
      outer: outer,
      inner: inner,
      tubeD: segsD(segs),
      cutF: cutF
    };
  }

  var GEO = buildGeo();

  function fateAt(sub, i, sec) {
    var u = hashU(sec ? i + 23 : i);
    if (sec) return { kind: 'secrete', u: u, at: 0.28 + hashU(i + 41) * 0.4 };
    if (!sub.filtered) return { kind: 'blood', u: u, at: 0 };
    if (u < sub.reP) {
      return {
        kind: 're',
        u: u,
        at: 0.16 + (sub.reP >= 0.999 ? u : u / sub.reP) * 0.6
      };
    }
    return { kind: 'out', u: u, at: 1 };
  }

  function buildRoute(sub, i, sec) {
    var f = fateAt(sub, i, sec);
    var at = f.at;
    var cut = GEO.cutF || 0.84;
    if (at > cut - 0.05) at = cut - 0.05;
    if (f.kind === 'secrete') {
      return compile([
        { pts: GEO.aff, w: 1 },
        { pts: slicePts(GEO.capW, 0, at), w: 1 },
        { pts: hop(ptAt(GEO.capW, at), ptAt(GEO.tubeArc, at)), w: 4.2 },
        { pts: slicePts(GEO.tubeArc, at, 1), w: 1 },
        { pts: GEO.duct, w: 8 }
      ]);
    }
    if (f.kind === 'blood') {
      return compile([
        { pts: GEO.artery, w: 1 },
        { pts: GEO.glomArc, w: 5 },
        { pts: GEO.aff, w: 1 },
        { pts: slicePts(GEO.capW, 0, cut), w: 1 },
        { pts: GEO.vein, w: 1 }
      ]);
    }
    if (f.kind === 're') {
      return compile([
        { pts: GEO.artery, w: 1 },
        { pts: GEO.filt, w: 1.7 },
        { pts: slicePts(GEO.tubeArc, 0, at), w: 1 },
        { pts: hop(ptAt(GEO.tubeArc, at), ptAt(GEO.capW, at)), w: 4.2 },
        { pts: slicePts(GEO.capW, at, cut), w: 1 },
        { pts: GEO.vein, w: 1 }
      ]);
    }
    return compile([
      { pts: GEO.artery, w: 1 },
      { pts: GEO.filt, w: 1.5 },
      { pts: GEO.tubeArc, w: 1 },
      { pts: GEO.duct, w: sub.dense ? 8 : 1.15 }
    ]);
  }

  function routeFor(sub, i, sec) {
    var key = sub.id + (sec ? ':s' : ':n') + i;
    if (!CACHE[key]) CACHE[key] = buildRoute(sub, i, sec);
    return CACHE[key];
  }

  function place(sub, i, sec, time) {
    var u = hashU(sec ? i + 23 : i);
    var ph = ((time || 0) / PERIOD + u) % 1;
    if (ph < 0) ph += 1;
    return routeFor(sub, i, sec).at(ph);
  }

  function arrowHead(x1, y1, x2, y2, size) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var L = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / L;
    var uy = dy / L;
    var px = -uy;
    var py = ux;
    var bx = x2 - ux * size;
    var by = y2 - uy * size;
    var h = size * 0.48;
    return 'M ' + n(x2) + ' ' + n(y2) +
      ' L ' + n(bx + px * h) + ' ' + n(by + py * h) +
      ' L ' + n(bx - px * h) + ' ' + n(by - py * h) + ' Z';
  }

  function shaft(x1, y1, x2, y2, color, sw) {
    return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) +
      '" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round"/>' +
      '<path d="' + arrowHead(x1, y1, x2, y2, 11) + '" fill="' + color + '"/>';
  }

  function hitBox(x, y, w, h) {
    return '<rect class="fgx-hit" x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) +
      '" fill="transparent" style="pointer-events:all"/>';
  }

  function gapArrow(frac, dir) {
    var a = ptAt(GEO.tubeArc, frac);
    var b = ptAt(GEO.capW, frac);
    var x1 = dir > 0 ? a[0] : b[0];
    var y1 = dir > 0 ? a[1] : b[1];
    var x2 = dir > 0 ? b[0] : a[0];
    var y2 = dir > 0 ? b[1] : a[1];
    var dx = x2 - x1;
    var dy = y2 - y1;
    var L = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / L;
    var uy = dy / L;
    return {
      x1: x1 + ux * 7,
      y1: y1 + uy * 7,
      x2: x2 - ux * 8,
      y2: y2 - uy * 8,
      mx: (x1 + x2) / 2,
      my: (y1 + y2) / 2,
      px: -uy,
      py: ux
    };
  }

  function cupPath() {
    var pts = GEO.outer.concat(GEO.inner.slice().reverse());
    return pathD(pts) + ' Z';
  }

  function glomStrands() {
    var out = [];
    var specs = [
      { ph: 0.4, w: 2.8 },
      { ph: 1.7, w: 2.4 },
      { ph: 3.1, w: 3.1 },
      { ph: 4.4, w: 2.2 },
      { ph: 5.5, w: 2.6 }
    ];
    var s, i, a, rad, x, y, dx, dy, d, pts, k;
    for (s = 0; s < specs.length; s++) {
      pts = [];
      for (i = 0; i <= 16; i++) {
        a = specs[s].ph + i * 0.42;
        rad = R_GLOM * (0.28 + 0.7 * Math.abs(Math.sin(i * 0.78 + specs[s].ph)));
        x = GCX + Math.cos(a) * rad;
        y = GCY + Math.sin(a * 1.05) * rad * 0.92;
        dx = x - GCX;
        dy = y - GCY;
        d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d > R_GLOM) {
          x = GCX + dx / d * R_GLOM;
          y = GCY + dy / d * R_GLOM;
        }
        pts.push([x, y]);
      }
      k = specs[s].w;
      out.push('<path d="' + pathD(pts) + '" fill="none" stroke="' + C2 + '" stroke-width="' + k +
        '" stroke-linecap="round" stroke-linejoin="round"/>');
    }
    return out.join('');
  }

  function tubePaint(d, width, color) {
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + width +
      '" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  function dotMarkup(sub, time) {
    var html = ['<g class="js-dots">'];
    var i, p, on, col, r;
    col = sub.color;
    r = sub.r;
    for (i = 0; i < MAX_N; i++) {
      on = i < sub.n;
      p = on ? place(sub, i, false, time) : { x: -30, y: -30 };
      html.push('<circle class="js-dot" data-i="' + i + '" data-sec="0" cx="' + n(p.x) + '" cy="' + n(p.y) +
        '" r="' + r + '" fill="' + col + '" stroke="' + CARDC + '" stroke-width="1"' +
        (on ? '' : ' display="none"') + '/>');
    }
    for (i = 0; i < MAX_SEC; i++) {
      on = i < sub.secN;
      p = on ? place(sub, i, true, time) : { x: -30, y: -30 };
      html.push('<circle class="js-dot" data-i="' + i + '" data-sec="1" cx="' + n(p.x) + '" cy="' + n(p.y) +
        '" r="' + r + '" fill="' + col + '" stroke="' + CARDC + '" stroke-width="1"' +
        (on ? '' : ' display="none"') + '/>');
    }
    html.push('</g>');
    return html.join('');
  }

  function notePos(sub) {
    if (sub.water) return { y1: CARD.y + 90, y2: CARD.y + 114, size: 16 };
    return { y1: CARD.y + 128, y2: CARD.y + 150, size: 15 };
  }

  function cardMarkup(sub) {
    var cx = CARD.x + CARD.w / 2;
    var np = notePos(sub);
    var y0 = CARD.y;
    return '<g class="js-card">' +
      '<rect x="' + CARD.x + '" y="' + y0 + '" width="' + CARD.w + '" height="' + CARD.h +
      '" rx="14" fill="' + CARDC + '" stroke="' + LINE + '" stroke-width="1.5"/>' +
      '<rect class="js-bar" x="' + (CARD.x + 10) + '" y="' + (y0 + 16) + '" width="6" height="' + (CARD.h - 32) +
      '" rx="3" fill="' + sub.color + '"/>' +
      '<text class="js-title" x="' + cx + '" y="' + (y0 + 32) + '" text-anchor="middle" font-size="17" font-weight="700" fill="' + sub.color + '">' + sub.name + '</text>' +
      '<text class="js-flow" x="' + cx + '" y="' + (y0 + 54) + '" text-anchor="middle" font-size="15" fill="' + DIM + '">혈장 → 원뇨 → 오줌</text>' +
      '<text class="js-nums" x="' + cx + '" y="' + (y0 + 84) + '" text-anchor="middle" font-size="18" font-weight="700" fill="' + INK + '">' + sub.nums + '</text>' +
      '<text class="js-unit" x="' + cx + '" y="' + (y0 + 106) + '" text-anchor="middle" font-size="15" fill="' + DIM + '">' + sub.unit + '</text>' +
      '<text class="js-note1" x="' + cx + '" y="' + np.y1 + '" text-anchor="middle" font-size="' + np.size + '" fill="' + INK + '">' + sub.note1 + '</text>' +
      '<text class="js-note2" x="' + cx + '" y="' + np.y2 + '" text-anchor="middle" font-size="' + np.size + '" fill="' + INK + '">' + sub.note2 + '</text>' +
      '</g>';
  }

  function labelText(part, text, x, y, opt) {
    opt = opt || {};
    var size = opt.size || 16;
    var anchor = opt.anchor || 'start';
    var weight = opt.weight ? ' font-weight="' + opt.weight + '"' : '';
    var fill = opt.fill || INK;
    var est = text.length * size * (anchor === 'middle' ? 0.5 : 1);
    var hx = anchor === 'middle' ? x - est : anchor === 'end' ? x - est : x;
    var hw = Math.max(20, text.length * size);
    var html = '<g data-part="' + part + '">';
    if (opt.leader) {
      html += '<line x1="' + n(opt.leader[0]) + '" y1="' + n(opt.leader[1]) + '" x2="' + n(opt.lx) + '" y2="' + n(opt.ly) +
        '" stroke="' + LINE + '" stroke-width="1.25"/>';
      html += '<circle cx="' + n(opt.leader[0]) + '" cy="' + n(opt.leader[1]) + '" r="2.4" fill="' + DIM + '"/>';
    }
    html += '<text x="' + n(x) + '" y="' + n(y) + '" text-anchor="' + anchor + '" font-size="' + size + '"' + weight +
      ' fill="' + fill + '">' + text + '</text>';
    html += hitBox(hx - 4, y - size, hw + 8, size + 8);
    html += '</g>';
    return html;
  }

  function shapes() {
    var capDraw = slicePts(GEO.capW, 0, GEO.cutF);
    var capD = pathD(GEO.aff.concat(capDraw));
    var veinD = pathD(GEO.vein);
    var lipL = GEO.outer[0];
    var lipR = GEO.outer[GEO.outer.length - 1];
    var inL = GEO.inner[0];
    var inR = GEO.inner[GEO.inner.length - 1];
    var boxX = 50;
    var boxY = 56;
    var boxW = 136;
    var boxH = 138;
    var reFr = [0.08, 0.16, 0.24];
    var seFr = [0.53, 0.58];
    var html = [];
    var i, g;

    html.push('<g data-part="nephron">');
    html.push('<path d="M 26 48 L 26 40 Q 26 32 34 32 L 100 32 M 136 32 L 270 32 Q 278 32 278 40 L 278 48" fill="none" stroke="' + INK + '" stroke-width="1.75" stroke-linecap="round"/>');
    html.push(hitBox(26, 18, 252, 34));
    html.push('</g>');

    html.push('<g data-part="corpuscle">');
    html.push('<rect x="' + boxX + '" y="' + boxY + '" width="' + boxW + '" height="' + boxH + '" rx="18" fill="none" stroke="' + DIM + '" stroke-width="1.6" stroke-dasharray="6 4.5"/>');
    html.push(hitBox(boxX - 6, boxY - 6, boxW + 12, boxH + 12));
    html.push('</g>');

    html.push('<g data-part="capillary">');
    html.push(tubePaint(capD, CAP_W, C2));
    html.push(tubePaint(veinD, 12, C1));
    html.push('<path d="' + arrowHead(GEO.vein[3][0], GEO.vein[3][1], GEO.vein[4][0], GEO.vein[4][1], 12) + '" fill="' + C1 + '"/>');
    html.push('<path d="' + capD + '" fill="none" stroke="transparent" stroke-width="18" stroke-linecap="round"/>');
    html.push('</g>');

    html.push('<g data-part="tubule">');
    html.push(tubePaint(GEO.tubeD, TUBE_W, C3));
    html.push(tubePaint(GEO.tubeD, 9, C3S));
    html.push('<path d="' + GEO.tubeD + '" fill="none" stroke="transparent" stroke-width="22" stroke-linecap="round"/>');
    html.push('</g>');

    html.push('<g data-part="collecting">');
    html.push('<rect x="' + (DUCT_CX - DUCT_W / 2) + '" y="' + DUCT_TOP + '" width="' + DUCT_W + '" height="' + (DUCT_BOT - DUCT_TOP) + '" rx="12" fill="' + C3S + '" stroke="' + C3 + '" stroke-width="4"/>');
    html.push(hitBox(DUCT_CX - 18, DUCT_TOP - 4, 36, DUCT_BOT - DUCT_TOP + 8));
    html.push('</g>');

    html.push('<g data-part="bowman">');
    html.push('<path d="' + cupPath() + '" fill="' + C6S + '" stroke="none"/>');
    html.push('<path d="' + pathD(GEO.outer) + '" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>');
    html.push('<path d="' + pathD(GEO.inner) + '" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>');
    html.push('<line x1="' + n(lipL[0]) + '" y1="' + n(lipL[1]) + '" x2="' + n(inL[0]) + '" y2="' + n(inL[1]) + '" stroke="' + INK + '" stroke-width="2"/>');
    html.push('<line x1="' + n(lipR[0]) + '" y1="' + n(lipR[1]) + '" x2="' + n(inR[0]) + '" y2="' + n(inR[1]) + '" stroke="' + INK + '" stroke-width="2"/>');
    html.push('<line x1="' + n(lipL[0]) + '" y1="' + n(lipL[1]) + '" x2="' + (GCX - 8) + '" y2="180" stroke="' + C3 + '" stroke-width="2"/>');
    html.push('<line x1="' + n(lipR[0]) + '" y1="' + n(lipR[1]) + '" x2="' + (GCX + 8) + '" y2="180" stroke="' + C3 + '" stroke-width="2"/>');
    html.push(hitBox(GCX - R_OUT - 4, GCY - R_OUT - 4, R_OUT * 2 + 8, R_OUT * 2 + 8));
    html.push('</g>');

    html.push('<g data-part="glomerulus">');
    html.push(tubePaint(pathD(GEO.artery), ARTERY_W, C2));
    html.push('<path d="' + arrowHead(GCX, 16, GCX, 30, 10) + '" fill="' + CARDC + '"/>');
    html.push('<circle cx="' + GCX + '" cy="' + GCY + '" r="24" fill="' + C2S + '"/>');
    html.push(glomStrands());
    html.push('<circle cx="' + GCX + '" cy="' + GCY + '" r="30" fill="transparent"/>');
    html.push('</g>');

    html.push('<g data-part="filtration">');
    html.push(shaft(128, 140, 146, 164, C6, 3.5));
    html.push(hitBox(116, 128, 44, 48));
    html.push('</g>');

    html.push('<g data-part="reabsorption">');
    for (i = 0; i < reFr.length; i++) {
      g = gapArrow(reFr[i], 1);
      html.push(shaft(g.x1, g.y1, g.x2, g.y2, C4, 3.5));
      html.push(hitBox(Math.min(g.x1, g.x2) - 8, Math.min(g.y1, g.y2) - 8, Math.abs(g.x2 - g.x1) + 16, Math.abs(g.y2 - g.y1) + 16));
    }
    html.push('</g>');

    html.push('<g data-part="secretion">');
    for (i = 0; i < seFr.length; i++) {
      g = gapArrow(seFr[i], -1);
      html.push(shaft(g.x1, g.y1, g.x2, g.y2, C3, 3.5));
      html.push(hitBox(Math.min(g.x1, g.x2) - 8, Math.min(g.y1, g.y2) - 8, Math.abs(g.x2 - g.x1) + 16, Math.abs(g.y2 - g.y1) + 16));
    }
    html.push('</g>');

    html.push('<g data-part="urine">');
    html.push('<path d="M ' + DUCT_CX + ' ' + (DROP_Y + 12) +
      ' C ' + (DUCT_CX + 12) + ' ' + (DROP_Y + 12) + ' ' + (DUCT_CX + 13) + ' ' + (DROP_Y - 2) + ' ' + DUCT_CX + ' ' + (DROP_Y - 16) +
      ' C ' + (DUCT_CX - 13) + ' ' + (DROP_Y - 2) + ' ' + (DUCT_CX - 12) + ' ' + (DROP_Y + 12) + ' ' + DUCT_CX + ' ' + (DROP_Y + 12) +
      ' Z" fill="' + URINE + '" stroke="#ca8a04" stroke-width="1.5"/>');
    html.push('<ellipse cx="' + (DUCT_CX - 4) + '" cy="' + (DROP_Y - 4) + '" rx="3.2" ry="4.2" fill="#fde68a"/>');
    html.push(hitBox(DUCT_CX - 16, DROP_Y - 20, 32, 40));
    html.push('</g>');

    return html.join('');
  }

  function labels() {
    var html = [];
    html.push(labelText('nephron', '네프론', 152, 22, { anchor: 'middle', size: 17, weight: 700 }));
    html.push('<text x="8" y="54" font-size="15" fill="' + C2 + '" font-weight="700">혈액</text>');
    html.push(labelText('corpuscle', '신소체', 198, 78, { leader: [176, 66], lx: 192, ly: 74 }));
    html.push(labelText('glomerulus', '사구체', 198, 112, { leader: [148, 116], lx: 192, ly: 108 }));
    html.push(labelText('bowman', '보먼주머니', 198, 148, { leader: [166, 142], lx: 192, ly: 144 }));
    html.push(labelText('filtration', '① 여과', 198, 184, { fill: C6, weight: 700, leader: [150, 166], lx: 192, ly: 180 }));
    html.push(labelText('tubule', '세뇨관', 8, 268, { leader: [118, 274], lx: 72, ly: 264 }));
    html.push(labelText('reabsorption', '② 재흡수', 8, 308, { fill: C4, weight: 700 }));
    html.push(labelText('capillary', '모세 혈관', 166, 234, { leader: [146, 250], lx: 166, ly: 230 }));
    html.push(labelText('secretion', '③ 분비', 228, 346, {
      fill: C3, weight: 700, leader: [204, 308], lx: 228, ly: 332
    }));
    html.push(labelText('collecting', '집합관', 328, 356, { leader: [396, 332], lx: 376, ly: 350 }));
    html.push(labelText('urine', '오줌', 388, 404, { anchor: 'end', weight: 700 }));
    html.push(labelText('urine', '(콩팥 깔때기로)', 388, 426, { anchor: 'end', size: 15 }));
    html.push('<text x="486" y="232" font-size="15" font-weight="700" fill="' + C1 + '">혈액</text>');
    return html.join('');
  }

  function render(v) {
    var sub = subOf(v);
    return [
      '<style>',
      '.fgx-fig-nephron text{font-family:inherit}',
      '.fgx-fig-nephron .fgx-hit{pointer-events:all}',
      '.fgx-fig-nephron .js-dots{pointer-events:none}',
      '</style>',
      shapes(),
      dotMarkup(sub, 0),
      labels(),
      cardMarkup(sub)
    ].join('');
  }

  function setText(ctx, sel, text) {
    var el = ctx.q(sel);
    if (el) el.textContent = text || '';
  }

  function update(ctx) {
    var sub = subOf(ctx.v);
    var time = ctx.time || 0;
    var nodes = ctx.qa('.js-dot');
    var i, node, idx, sec, on, p, np, note1, note2, bar, title;
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      idx = Number(node.getAttribute('data-i'));
      sec = node.getAttribute('data-sec') === '1';
      on = sec ? idx < sub.secN : idx < sub.n;
      if (!on) {
        node.setAttribute('display', 'none');
        continue;
      }
      p = place(sub, idx, sec, time);
      node.setAttribute('display', 'inline');
      node.setAttribute('cx', n(p.x));
      node.setAttribute('cy', n(p.y));
      node.setAttribute('r', String(sub.r));
      node.setAttribute('fill', sub.color);
    }
    np = notePos(sub);
    setText(ctx, '.js-title', sub.name);
    setText(ctx, '.js-nums', sub.nums);
    setText(ctx, '.js-unit', sub.unit);
    setText(ctx, '.js-note1', sub.note1);
    setText(ctx, '.js-note2', sub.note2);
    note1 = ctx.q('.js-note1');
    note2 = ctx.q('.js-note2');
    if (note1) {
      note1.setAttribute('y', String(np.y1));
      note1.setAttribute('font-size', String(np.size));
    }
    if (note2) {
      note2.setAttribute('y', String(np.y2));
      note2.setAttribute('font-size', String(np.size));
    }
    bar = ctx.q('.js-bar');
    title = ctx.q('.js-title');
    if (bar) bar.setAttribute('fill', sub.color);
    if (title) title.setAttribute('fill', sub.color);
    return { readout: sub.readout, active: sub.active };
  }

  function calc(v, time) {
    var sub = subOf(v);
    var t = time || 0;
    var dots = [];
    var i, f, p;
    for (i = 0; i < sub.n; i++) {
      f = fateAt(sub, i, false);
      p = place(sub, i, false, t);
      dots.push({ i: i, sec: false, kind: f.kind, u: f.u, x: p.x, y: p.y });
    }
    for (i = 0; i < sub.secN; i++) {
      f = fateAt(sub, i, true);
      p = place(sub, i, true, t);
      dots.push({ i: i, sec: true, kind: f.kind, u: f.u, x: p.x, y: p.y });
    }
    return { sub: sub.id, readout: sub.readout, active: sub.active.slice(), nums: sub.nums, dots: dots };
  }

  var def = {
    viewBox: [560, 440],
    live: true,
    controls: [
      {
        id: 'sub',
        type: 'choice',
        label: '물질 고르기',
        value: 'glucose',
        options: [
          { v: 'protein', label: '단백질' },
          { v: 'glucose', label: '포도당' },
          { v: 'urea', label: '요소' },
          { v: 'water', label: '물' },
          { v: 'inulin', label: '이눌린' }
        ]
      }
    ],
    render: render,
    update: update
  };
  def._calc = calc;
  def._geo = GEO;
  def._dist = dist;

  NMFIG.define('nephron', def);
})(window.NMFIG);
