/* 전류의 자기장과 전자기 유도 — 직선 도선, 두 도선, 코일, 전자기 유도.
 * 컨트롤: I, dir, ratio, rel, kind, n, t, pole.
 * 직선 도선 화살표 길이 = 18·I·(60/r) (I=3, r=60 → 54, r=120 → 27).
 * 0인 점: 같은 방향 x_A + d·I_A/(I_A+I_B), 반대 방향(I_B>I_A) x_A − d·I_A/(I_B−I_A).
 * 선속 Φ: 0–2 s 0→4, 2–4 s 4, 4–5 s 4→0, 5–6 s 0. ε = −ΔΦ/Δt (N=1).
 */
(function () {
  var NM = window.NMFIG;
  if (!NM) return;

  var C1 = 'var(--fgx-c1, #2563eb)';
  var C2 = 'var(--fgx-c2, #dc2626)';
  var C3 = 'var(--fgx-c3, #d97706)';
  var C6 = 'var(--fgx-c6, #0891b2)';
  var C7 = 'var(--fgx-c7, #db2777)';
  var C8 = 'var(--fgx-c8, #65748b)';
  var C6S = 'var(--fgx-c6-soft, #d2ebf1)';
  var C2S = 'var(--fgx-c2-soft, #f9d8d8)';
  var C1S = 'var(--fgx-c1-soft, #d3e0fb)';
  var INK = 'var(--fgx-ink, #1a1f2e)';
  var DIM = 'var(--fgx-dim, #4a5468)';
  var LINE = 'var(--fgx-line, #d5d8e0)';
  var CARD = 'var(--fgx-card, #fff)';
  var ELEV = 'var(--fgx-elev, #f5f7fa)';

  var XA = 200;
  var XB = 360;
  var D_WIRE = 160;

  function f(v) {
    var n = Math.round(v * 10) / 10;
    if (n === 0) n = 0;
    return n.toFixed(1);
  }
  function num(v, d) {
    var x = Number(v);
    return x === x ? x : d;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function txt(x, y, s, size, fill, anchor, weight) {
    return '<text x="' + f(x) + '" y="' + f(y) + '" font-size="' + size + '" fill="' + (fill || INK) + '" text-anchor="' + (anchor || 'middle') + '"' + (weight ? ' font-weight="' + weight + '"' : '') + '>' + esc(s) + '</text>';
  }
  function hit(x, y, w, h) {
    return '<rect class="fgx-hit" x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="transparent" style="pointer-events:all"/>';
  }
  function hitC(cx, cy, r) {
    return '<circle class="fgx-hit" cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r) + '" fill="transparent" style="pointer-events:all"/>';
  }
  function head(x, y, ux, uy, len, fill) {
    var px = -uy;
    var py = ux;
    var bx = x - ux * len;
    var by = y - uy * len;
    var w = len * 0.42;
    return '<polygon points="' + f(x) + ',' + f(y) + ' ' + f(bx + px * w) + ',' + f(by + py * w) + ' ' + f(bx - px * w) + ',' + f(by - py * w) + '" fill="' + fill + '"/>';
  }
  function arrow(x1, y1, x2, y2, color, sw, headLen) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var L = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / L;
    var uy = dy / L;
    var hl = headLen || 12;
    var xh = x2 - ux * hl * 0.65;
    var yh = y2 - uy * hl * 0.65;
    return '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(xh) + '" y2="' + f(yh) + '" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round"/>' + head(x2, y2, ux, uy, hl, color);
  }
  function chip(cx, cy, w, h, label, fill, stroke, color, size) {
    var sz = size || 15;
    return '<rect x="' + f(cx - w / 2) + '" y="' + f(cy - h / 2) + '" width="' + f(w) + '" height="' + f(h) + '" rx="8" fill="' + (fill || CARD) + '" stroke="' + (stroke || LINE) + '" stroke-width="1.5"/>' + txt(cx, cy + sz * 0.35, label, sz, color || INK, 'middle', 700);
  }
  function g(part, inner) {
    return '<g data-part="' + part + '">' + inner + '</g>';
  }
  function poly(pts, color, sw, dash) {
    var i;
    var s = [];
    if (!pts || pts.length < 2) return '';
    for (i = 0; i < pts.length; i++) s.push(f(pts[i][0]) + ',' + f(pts[i][1]));
    return '<polyline fill="none" stroke="' + color + '" stroke-width="' + sw + '" stroke-linejoin="round" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' points="' + s.join(' ') + '"/>';
  }
  function fmtNum(n) {
    var r = Math.round(n * 10) / 10;
    if (Math.abs(r - Math.round(r)) < 1e-6) return String(Math.round(r));
    return r.toFixed(1);
  }
  function iVal(v) {
    var x = Math.round(num(v.I, 3));
    if (x < 1) x = 1;
    if (x > 5) x = 5;
    return x;
  }
  function nVal(v) {
    var x = Math.round(num(v.n, 6));
    if (x < 2) x = 2;
    if (x > 10) x = 10;
    return x;
  }
  function ratioOf(v) {
    var r = Math.round(num(v.ratio, 2));
    if (r < 1) r = 1;
    if (r > 3) r = 3;
    return r;
  }

  /* I=3, r=60 → 54. 명세의 10·I·(60/r)·0.9 는 27이라 예시(54, 27)와 어긋나 예시를 따른다. */
  function bLen(I, r) {
    return 18 * I * (60 / r);
  }
  function bOne(x, xw, Iw, s) {
    var dx = x - xw;
    var ad = Math.abs(dx);
    var side;
    if (ad < 0.001) return 0;
    side = dx > 0 ? -1 : 1;
    return s * Iw / ad * side;
  }
  function bNet(x, iA, iB, sA, sB) {
    return bOne(x, XA, iA, sA) + bOne(x, XB, iB, sB);
  }
  function zeroAt(ratio, rel) {
    if (rel === 'same') {
      return { x: XA + D_WIRE / (1 + ratio), dist: D_WIRE / (1 + ratio), place: '사이', frac: 'd/' + (1 + ratio) };
    }
    if (ratio <= 1) return null;
    return {
      x: XA - D_WIRE / (ratio - 1),
      dist: D_WIRE / (ratio - 1),
      place: '바깥',
      frac: (ratio - 1) === 1 ? 'd' : 'd/' + (ratio - 1)
    };
  }
  function fluxAt(t) {
    var x = num(t, 0);
    if (x < 0) x = 0;
    if (x > 6) x = 6;
    if (x < 2) return { t: x, phi: 2 * x, emf: -2, mode: 'up' };
    if (x < 4) return { t: x, phi: 4, emf: 0, mode: 'flat' };
    if (x < 5) return { t: x, phi: 4 - 4 * (x - 4), emf: 4, mode: 'down' };
    return { t: x, phi: 0, emf: 0, mode: 'off' };
  }
  function facePole(pole, mode) {
    if (mode === 'up') return pole;
    if (mode === 'down') return pole === 'N' ? 'S' : 'N';
    return '';
  }

  function ringArrows(cx, cy, r, ccw) {
    var angles = [50, 140, 230, 320];
    var out = '';
    var i, th, x, y, dx, dy;
    for (i = 0; i < angles.length; i++) {
      th = angles[i] * Math.PI / 180;
      x = cx + r * Math.cos(th);
      y = cy - r * Math.sin(th);
      if (ccw) { dx = -Math.sin(th); dy = -Math.cos(th); }
      else { dx = Math.sin(th); dy = Math.cos(th); }
      out += head(x, y, dx, dy, 11, C6);
    }
    return out;
  }

  function ellipseHeads(cx, cy, rx, ry) {
    var angles = [125, 305];
    var out = '';
    var i, th, x, y, tx, ty, L;
    for (i = 0; i < angles.length; i++) {
      th = angles[i] * Math.PI / 180;
      x = cx + rx * Math.cos(th);
      y = cy - ry * Math.sin(th);
      tx = -rx * Math.sin(th);
      ty = -ry * Math.cos(th);
      L = Math.sqrt(tx * tx + ty * ty) || 1;
      out += head(x, y, tx / L, ty / L, 8, C6);
    }
    return out;
  }

  function bSub(x, y, sub) {
    return '<text x="' + f(x) + '" y="' + f(y) + '" font-size="15" fill="' + C6 + '" text-anchor="start" font-weight="700">B<tspan dy="4" font-size="15">' + sub + '</tspan></text>';
  }

  function loopNote() {
    return chip(270, 408, 330, 32, '원형 도선: 한 바퀴만 감은 코일', CARD, C8, INK, 15);
  }

  function renderWire(v) {
    var I = iVal(v);
    var out = !v.dir;
    var cx = 230;
    var cy = 215;
    var rs = [60, 110, 160];
    var sws = [2.4, 1.8, 1.3];
    var field = '';
    var i, r, sw;
    var pLen = bLen(I, 60);
    var qLen = bLen(I, 120);
    var dirY = out ? -1 : 1;
    var px = cx + 60;
    var qx = cx + 120;
    var pTip = cy + dirY * pLen;
    var qTip = cy + dirY * qLen;
    var symText = out ? '⊙ 전류가 나옴' : '⊗ 전류가 들어감';
    var pLabX = out ? px : px - 18;
    var qLabX = out ? qx : qx + 16;
    var labY = out ? cy + 28 : cy - 22;

    for (i = 0; i < rs.length; i++) {
      r = rs[i];
      sw = sws[i];
      field += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + C6 + '" stroke-width="' + sw + '"/>';
      field += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="transparent" stroke-width="16" style="pointer-events:all"/>';
      field += ringArrows(cx, cy, r, out);
    }

    function bLabel(x, y1, len, sub) {
      var my = y1 + dirY * len * 0.5;
      return bSub(x + 16, my + 4, sub);
    }

    var strength = ''
      + '<line x1="' + f(cx + 22) + '" y1="' + cy + '" x2="392" y2="' + cy + '" stroke="' + LINE + '" stroke-width="1.2" stroke-dasharray="3 4"/>'
      + '<line x1="' + px + '" y1="' + cy + '" x2="' + px + '" y2="' + f(pTip) + '" stroke="' + CARD + '" stroke-width="6" stroke-linecap="round"/>'
      + '<line x1="' + qx + '" y1="' + cy + '" x2="' + qx + '" y2="' + f(qTip) + '" stroke="' + CARD + '" stroke-width="6" stroke-linecap="round"/>'
      + arrow(px, cy, px, pTip, C6, 3.2, 12)
      + arrow(qx, cy, qx, qTip, C6, 3.2, 11)
      + '<circle cx="' + px + '" cy="' + cy + '" r="5" fill="' + C6 + '" stroke="' + CARD + '" stroke-width="2"/>'
      + '<circle cx="' + qx + '" cy="' + cy + '" r="5" fill="' + C6 + '" stroke="' + CARD + '" stroke-width="2"/>'
      + txt(pLabX, labY, 'P', 16, INK, 'middle', 700)
      + txt(qLabX, labY, 'Q', 16, INK, 'middle', 700)
      + bLabel(px, cy, pLen, 'P')
      + bLabel(qx, cy, qLen, 'Q')
      + chip(300, 412, 132, 32, 'B ∝ I / r', CARD, C6, C6, 16)
      + hit(px - 16, Math.min(cy, pTip) - 8, 36, Math.abs(pLen) + 20)
      + hit(qx - 16, Math.min(cy, qTip) - 8, 52, Math.abs(qLen) + 20);

    var cross = '';
    if (out) {
      cross = '<circle cx="' + cx + '" cy="' + cy + '" r="3.6" fill="' + C1 + '"/>';
    } else {
      cross = '<line x1="' + (cx - 8) + '" y1="' + (cy - 8) + '" x2="' + (cx + 8) + '" y2="' + (cy + 8) + '" stroke="' + C1 + '" stroke-width="2.4" stroke-linecap="round"/>'
        + '<line x1="' + (cx - 8) + '" y1="' + (cy + 8) + '" x2="' + (cx + 8) + '" y2="' + (cy - 8) + '" stroke="' + C1 + '" stroke-width="2.4" stroke-linecap="round"/>';
    }

    var rhr = ''
      + '<rect x="398" y="16" width="152" height="186" rx="12" fill="' + ELEV + '" stroke="' + LINE + '" stroke-width="1.5"/>'
      + arrow(468, 132, 468, 52, C1, 4.5, 13)
      + '<ellipse cx="468" cy="100" rx="20" ry="13" fill="none" stroke="' + C6 + '" stroke-width="2"/>'
      + '<ellipse cx="468" cy="100" rx="34" ry="22" fill="none" stroke="' + C6 + '" stroke-width="1.6"/>'
      + ellipseHeads(468, 100, 20, 13)
      + ellipseHeads(468, 100, 34, 22)
      + txt(468, 40, '엄지 = 전류', 15, C1, 'middle', 700)
      + txt(468, 164, '네 손가락', 15, C6, 'middle', 700)
      + txt(468, 184, '= 자기장', 15, C6, 'middle', 700);

    return ''
      + g('field', field)
      + g('strength', strength)
      + g('wire', '<circle cx="' + cx + '" cy="' + cy + '" r="16" fill="' + ELEV + '" stroke="' + C8 + '" stroke-width="2.4"/>' + hitC(cx, cy, 20))
      + g('dotcross', cross + hitC(cx, cy, 9) + chip(132, 412, 168, 32, symText, CARD, C1, C1, 15))
      + g('current', txt(cx, 146, '전류 I', 16, C1, 'middle', 700) + hit(cx - 40, 128, 80, 24))
      + g('rhr', rhr);
  }

  function renderTwo(v) {
    var ratio = ratioOf(v);
    var rel = v.rel === 'opposite' ? 'opposite' : 'same';
    var sA = 1;
    var sB = rel === 'same' ? 1 : -1;
    var z = zeroAt(ratio, rel);
    var Y0 = 328;
    var BCAP = 0.055;
    var YS = 78 / BCAP;
    var parts = [];
    var xs = [];
    var x, k, b, ab, rad;

    function yOf(bv) {
      var c = bv;
      if (c > BCAP) c = BCAP;
      if (c < -BCAP) c = -BCAP;
      return Y0 - c * YS;
    }

    parts.push('<line x1="48" y1="176" x2="520" y2="176" stroke="' + LINE + '" stroke-width="1.5" stroke-linecap="round"/>');
    parts.push('<line x1="' + XA + '" y1="176" x2="' + XA + '" y2="400" stroke="' + LINE + '" stroke-width="1.2" stroke-dasharray="2 4"/>');
    parts.push('<line x1="' + XB + '" y1="176" x2="' + XB + '" y2="400" stroke="' + LINE + '" stroke-width="1.2" stroke-dasharray="2 4"/>');
    parts.push('<line x1="' + XA + '" y1="192" x2="' + XB + '" y2="192" stroke="' + DIM + '" stroke-width="1.4"/>');
    parts.push('<line x1="' + XA + '" y1="186" x2="' + XA + '" y2="198" stroke="' + DIM + '" stroke-width="1.4"/>');
    parts.push('<line x1="' + XB + '" y1="186" x2="' + XB + '" y2="198" stroke="' + DIM + '" stroke-width="1.4"/>');
    parts.push(txt((XA + XB) / 2, 214, 'd', 16, DIM, 'middle', 700));

    parts.push(wireColumn(XA, true, 4, '도선 A', 'I', 'wire_a', -1));
    parts.push(wireColumn(XB, rel === 'same', 3.2 + ratio * 2.6, '도선 B', (ratio === 1 ? '' : String(ratio)) + 'I', 'wire_b', 1));

    var symbols = '<line x1="70" y1="112" x2="500" y2="112" stroke="' + LINE + '" stroke-width="1.2"/>';
    for (x = 80; x <= 480; x += 40) xs.push(x);
    for (k = 0; k < xs.length; k++) {
      x = xs[k];
      if (x === XA || x === XB) continue;
      b = bNet(x, 1, ratio, sA, sB);
      ab = Math.abs(b);
      if (ab < 0.0025) {
        symbols += txt(x, 117, '0', 15, DIM, 'middle', 700);
      } else {
        rad = 5.5 + Math.min(ab, 0.04) / 0.04 * 6.5;
        if (b > 0) {
          symbols += '<circle cx="' + x + '" cy="112" r="' + f(rad) + '" fill="' + CARD + '" stroke="' + C6 + '" stroke-width="1.7"/>';
          symbols += '<circle cx="' + x + '" cy="112" r="' + f(Math.max(1.6, rad * 0.28)) + '" fill="' + C6 + '"/>';
        } else {
          symbols += '<circle cx="' + x + '" cy="112" r="' + f(rad) + '" fill="' + CARD + '" stroke="' + C6 + '" stroke-width="1.7"/>';
          symbols += '<line x1="' + f(x - rad * 0.62) + '" y1="' + f(112 - rad * 0.62) + '" x2="' + f(x + rad * 0.62) + '" y2="' + f(112 + rad * 0.62) + '" stroke="' + C6 + '" stroke-width="1.6" stroke-linecap="round"/>';
          symbols += '<line x1="' + f(x - rad * 0.62) + '" y1="' + f(112 + rad * 0.62) + '" x2="' + f(x + rad * 0.62) + '" y2="' + f(112 - rad * 0.62) + '" stroke="' + C6 + '" stroke-width="1.6" stroke-linecap="round"/>';
        }
      }
    }

    var curve = '';
    curve += '<line x1="36" y1="' + Y0 + '" x2="532" y2="' + Y0 + '" stroke="' + DIM + '" stroke-width="1.4"/>';
    curve += txt(18, Y0 - 68, '⊙', 16, C6, 'middle', 700);
    curve += txt(18, Y0 + 74, '⊗', 16, C6, 'middle', 700);
    curve += txt(18, Y0 + 5, '0', 15, DIM, 'middle', 700);

    function runsOf(x0, x1) {
      var runs = [];
      var run = [];
      var xx, rawB;
      for (xx = x0; xx <= x1 + 0.01; xx += 3) {
        rawB = bNet(xx, 1, ratio, sA, sB);
        if (Math.abs(rawB) > BCAP) {
          if (run.length) {
            run.push([xx, yOf(rawB)]);
            runs.push(run);
            run = [];
          }
        } else run.push([xx, yOf(rawB)]);
      }
      if (run.length > 1) runs.push(run);
      return runs;
    }
    function nearWire(xx) {
      return Math.abs(xx - XA) < Math.abs(xx - XB) ? XA : XB;
    }
    function dashToward(run, idx, wireX) {
      var p = run[idx];
      var q = run[idx === 0 ? 1 : run.length - 2];
      var dx, dy, len, x2, y2, sgn;
      if (!q || Math.abs(p[0] - wireX) > 52) return '';
      dx = p[0] - q[0];
      dy = p[1] - q[1];
      len = Math.sqrt(dx * dx + dy * dy) || 1;
      x2 = p[0] + dx / len * 18;
      y2 = p[1] + dy / len * 18;
      sgn = wireX > p[0] ? 1 : -1;
      if ((wireX - x2) * sgn < 7) x2 = wireX - sgn * 7;
      if (y2 < 248) y2 = 248;
      if (y2 > 408) y2 = 408;
      return poly([[p[0], p[1]], [x2, y2]], C6, 1.7, '3 3');
    }
    var bands = [[40, XA - 6], [XA + 6, XB - 6], [XB + 6, 528]];
    var bi, runs, rr;
    for (bi = 0; bi < bands.length; bi++) {
      runs = runsOf(bands[bi][0], bands[bi][1]);
      for (rr = 0; rr < runs.length; rr++) {
        if (runs[rr].length < 2) continue;
        curve += poly(runs[rr], C6, 2.4);
        curve += dashToward(runs[rr], 0, nearWire(runs[rr][0][0]));
        curve += dashToward(runs[rr], runs[rr].length - 1, nearWire(runs[rr][runs[rr].length - 1][0]));
      }
    }
    curve += hit(48, 92, 470, 36);
    curve += hit(36, 236, 500, 176);
    parts.push(g('net_field', symbols + curve));

    var zero = '';
    if (!z) {
      zero = chip(280, 252, 132, 32, '0인 점 없음', C2S, C3, C3, 15);
    } else {
      var lx = z.x;
      var ly = Y0 - 36;
      if (lx < 100) { lx = z.x + 58; ly = Y0 - 32; }
      zero = '<polygon points="' + starPts(z.x, Y0, 11) + '" fill="' + C3 + '" stroke="' + CARD + '" stroke-width="1.5"/>'
        + chip(lx, ly, 70, 26, 'B = 0', CARD, C3, C3, 15)
        + hitC(z.x, Y0, 16);
    }
    parts.push(g('zero_point', zero));
    return parts.join('');
  }

  function starPts(cx, cy, r) {
    var i, a, rr, pts = [];
    for (i = 0; i < 10; i++) {
      a = -Math.PI / 2 + i * Math.PI / 5;
      rr = i % 2 === 0 ? r : r * 0.42;
      pts.push(f(cx + rr * Math.cos(a)) + ',' + f(cy + rr * Math.sin(a)));
    }
    return pts.join(' ');
  }

  function wireColumn(x, up, sw, name, mag, part, side) {
    var y1 = up ? 158 : 48;
    var y2 = up ? 48 : 158;
    var hl = 11 + sw;
    var lx = x + side * (16 + sw);
    var ly = up ? 66 : 156;
    var anchor = side < 0 ? 'end' : 'start';
    return g(part,
      '<line x1="' + x + '" y1="48" x2="' + x + '" y2="168" stroke="' + C8 + '" stroke-width="' + f(sw) + '" stroke-linecap="round"/>'
      + head(x, y2, 0, up ? -1 : 1, hl, C1)
      + txt(x, 32, name, 16, INK, 'middle', 700)
      + txt(lx, ly, mag, 16, C1, anchor, 700)
      + hit(x - 20, 24, 40, 156)
    );
  }

  function fieldW(I) {
    return 2 + (I - 1) * 0.75;
  }

  function coilXs(n) {
    var a = [];
    var i;
    var x0 = 172;
    var x1 = 348;
    for (i = 0; i < n; i++) a.push(x0 + (x1 - x0) * i / (n - 1));
    return a;
  }

  function dotSym(x, y, r, into) {
    var s = '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="' + CARD + '" stroke="' + C8 + '" stroke-width="2"/>';
    if (into) {
      var d = r * 0.55;
      s += '<line x1="' + f(x - d) + '" y1="' + f(y - d) + '" x2="' + f(x + d) + '" y2="' + f(y + d) + '" stroke="' + C1 + '" stroke-width="1.8" stroke-linecap="round"/>';
      s += '<line x1="' + f(x - d) + '" y1="' + f(y + d) + '" x2="' + f(x + d) + '" y2="' + f(y - d) + '" stroke="' + C1 + '" stroke-width="1.8" stroke-linecap="round"/>';
    } else {
      s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(Math.max(2, r * 0.28)) + '" fill="' + C1 + '"/>';
    }
    return s;
  }

  function poleBadge(x, y, which, r) {
    var red = which === 'N';
    return '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + r + '" fill="' + (red ? C2 : C1) + '"/>' + txt(x, y + 6, which, 18, '#fff', 'middle', 700);
  }

  function renderCoil(v) {
    var I = iVal(v);
    var n = nVal(v);
    var loop = v.kind === 'loop';
    var toRight = !v.dir;
    var topInto = toRight;
    var sw = fieldW(I);
    var prod = n * I;
    var bText = loop ? 'B ∝ I / r' : ('B ∝ nI = ' + n + ' × ' + I + ' = ' + prod);
    var out = [];

    if (!loop) {
      var xs = coilXs(n);
      var pitch = (348 - 172) / (n - 1);
      var rad = Math.max(6.5, Math.min(10, pitch / 2 - 3));
      var topY = 168;
      var botY = 256;
      var mid = 212;
      var i;
      var ux = toRight ? 1 : -1;
      var solenoid = '';
      var lines = '<rect x="184" y="180" width="152" height="64" rx="6" fill="' + C6S + '"/>';
      var ys = [mid - 26, mid, mid + 26];
      for (i = 0; i < ys.length; i++) {
        lines += arrow(toRight ? 188 : 332, ys[i], toRight ? 332 : 188, ys[i], C6, sw, 13);
      }
      var ret = ''
        + '<path d="M 164,140 L 356,140 C 412,140 420,168 420,212 C 420,256 412,284 356,284 L 164,284 C 108,284 100,256 100,212 C 100,168 108,140 164,140" fill="none" stroke="' + C6 + '" stroke-width="1.6" stroke-dasharray="5 4" stroke-linejoin="round"/>'
        + head(260, 140, -ux, 0, 11, C6)
        + head(260, 284, -ux, 0, 11, C6);
      for (i = 0; i < xs.length; i++) {
        solenoid += dotSym(xs[i], topY, rad, topInto);
        solenoid += dotSym(xs[i], botY, rad, !topInto);
      }
      solenoid += hit(150, 150, 220, 124);
      var poles = poleBadge(toRight ? 78 : 444, mid, 'S', 17) + poleBadge(toRight ? 444 : 78, mid, 'N', 17);
      var turns = ''
        + chip(78, 40, 84, 32, 'n = ' + n, CARD, C8, INK, 16)
        + '<line x1="' + f(xs[0]) + '" y1="112" x2="' + f(xs[xs.length - 1]) + '" y2="112" stroke="' + DIM + '" stroke-width="1.6"/>'
        + '<line x1="' + f(xs[0]) + '" y1="104" x2="' + f(xs[0]) + '" y2="120" stroke="' + DIM + '" stroke-width="1.6"/>'
        + '<line x1="' + f(xs[xs.length - 1]) + '" y1="104" x2="' + f(xs[xs.length - 1]) + '" y2="120" stroke="' + DIM + '" stroke-width="1.6"/>'
        + txt((xs[0] + xs[xs.length - 1]) / 2, 100, '감은 수', 15, DIM, 'middle', 700)
        + hit(xs[0] - 8, 78, xs[xs.length - 1] - xs[0] + 16, 48);
      out.push(ret);
      out.push(g('inner_field', lines + chip(300, 40, 228, 32, bText, C6S, C6, C6, 15) + hit(150, 180, 220, 64)));
      out.push(g('solenoid', solenoid));
      out.push(g('poles', poles));
      out.push(g('turns', turns));
      out.push(g('loop', loopNote()));
    } else {
      var cx = 240;
      var cy = 198;
      var frame = '<rect x="' + (cx - 42) + '" y="' + (cy - 98) + '" width="84" height="196" rx="42" fill="' + ELEV + '" stroke="' + C8 + '" stroke-width="2.2"/>'
        + hit(cx - 48, cy - 104, 96, 208);
      var dots = dotSym(cx, cy - 72, 14, topInto) + dotSym(cx, cy + 72, 14, !topInto) + hitC(cx, cy - 72, 18) + hitC(cx, cy + 72, 18);
      var line = arrow(toRight ? 92 : 424, cy, toRight ? 424 : 92, cy, C6, sw, 14);
      var polesL = poleBadge(toRight ? 60 : 458, cy, 'S', 17) + poleBadge(toRight ? 458 : 60, cy, 'N', 17);
      out.push(g('solenoid', frame));
      out.push(g('loop', dots + loopNote()));
      out.push(g('inner_field', line + chip(300, 40, 150, 32, bText, C6S, C6, C6, 15) + hit(90, cy - 16, 300, 32)));
      out.push(g('poles', polesL));
      out.push(g('turns', chip(cx, 348, 108, 32, '감은 수 1', CARD, C8, INK, 15)));
    }
    return out.join('');
  }

  function renderInduction(v) {
    var pole = v.pole === 'S' ? 'S' : 'N';
    var ph = fluxAt(v.t);
    var face = facePole(pole, ph.mode);
    var cy = 72;
    var xNear = 386;
    var xR = 60 + (xNear - 60) * (ph.phi / 4);
    var xL = xR - 100;
    var top = 54;
    var nRight = pole === 'N';
    var coilX = [352, 370, 388, 406];
    var parts = [];
    var mag = '';
    var i, yy, nLine, fw;
    var upArrow = face === 'S';

    mag += '<defs><clipPath id="em-mag"><rect x="' + f(xL) + '" y="' + top + '" width="100" height="36" rx="8"/></clipPath></defs>';
    mag += '<g clip-path="url(#em-mag)">';
    mag += '<rect x="' + f(xL) + '" y="' + top + '" width="50" height="36" fill="' + (nRight ? C1 : C2) + '"/>';
    mag += '<rect x="' + f(xL + 50) + '" y="' + top + '" width="50" height="36" fill="' + (nRight ? C2 : C1) + '"/>';
    mag += '</g>';
    mag += '<rect x="' + f(xL) + '" y="' + top + '" width="100" height="36" rx="8" fill="none" stroke="' + INK + '" stroke-width="1.4"/>';
    mag += txt(xL + 25, top + 24, nRight ? 'S' : 'N', 18, '#fff', 'middle', 700);
    mag += txt(xL + 75, top + 24, nRight ? 'N' : 'S', 18, '#fff', 'middle', 700);
    if (ph.mode === 'up') mag += arrow(xL + 33, 106, xL + 67, 106, C3, 3, 11);
    else if (ph.mode === 'down') mag += arrow(xL + 81, 106, xL + 19, 106, C3, 3, 12);
    mag += hit(Math.max(0, xL - 4), top - 2, 108, 68);
    parts.push(g('magnet', mag));

    nLine = ph.phi >= 3 ? 3 : ph.phi >= 1.5 ? 2 : ph.phi > 0.25 ? 1 : 0;
    fw = 1.6 + 1.4 * (ph.phi / 4);
    var flux = '';
    var ys = nLine <= 1 ? [cy] : nLine === 2 ? [cy - 12, cy + 12] : [cy - 14, cy, cy + 14];
    for (i = 0; i < nLine; i++) {
      yy = ys[i];
      if (pole === 'N') flux += arrow(xR + 4, yy, 448, yy, C6, fw, 10);
      else flux += arrow(448, yy, xR + 4, yy, C6, fw, 10);
    }

    var coil = '';
    for (i = 0; i < coilX.length; i++) {
      coil += '<ellipse cx="' + coilX[i] + '" cy="' + cy + '" rx="8" ry="28" fill="none" stroke="' + C8 + '" stroke-width="2.2"/>';
    }
    coil += hit(340, cy - 32, 84, 64);

    var induced = '';
    var ax = 428;
    if (ph.emf === 0) {
      induced = chip(478, 30, 118, 28, '유도 전류 0', CARD, C7, C7, 15);
    } else {
      var aw = 2.2 + 2.2 * (Math.abs(ph.emf) / 4);
      if (upArrow) {
        induced = '<path d="M ' + ax + ',' + (cy + 22) + ' Q ' + (ax + 26) + ',' + cy + ' ' + ax + ',' + (cy - 22) + '" fill="none" stroke="' + C7 + '" stroke-width="' + f(aw) + '" stroke-linecap="round"/>'
          + head(ax, cy - 22, 0, -1, 11, C7);
      } else {
        induced = '<path d="M ' + ax + ',' + (cy - 22) + ' Q ' + (ax + 26) + ',' + cy + ' ' + ax + ',' + (cy + 22) + '" fill="none" stroke="' + C7 + '" stroke-width="' + f(aw) + '" stroke-linecap="round"/>'
          + head(ax, cy + 22, 0, 1, 11, C7);
      }
      induced += hit(ax - 4, cy - 30, 40, 60);
    }

    var lenz = '';
    if (!face) {
      lenz = chip(200, 30, 112, 28, '유도 없음', CARD, C8, DIM, 15);
    } else {
      lenz = '<circle cx="318" cy="30" r="12" fill="' + (face === 'N' ? C2 : C1) + '" stroke="' + CARD + '" stroke-width="2"/>'
        + txt(318, 35, face, 15, '#fff', 'middle', 700)
        + txt(200, 34, '유도 자기장 방향', 15, face === 'N' ? C2 : C1, 'middle', 700)
        + hitC(318, 30, 16);
    }

    var gcx = 386;
    var gcy = 164;
    var gr = 42;
    var deg = ph.emf * 15;
    var radn = deg * Math.PI / 180;
    var nlen = 24;
    var nx = gcx + Math.sin(radn) * nlen;
    var ny = gcy - Math.cos(radn) * nlen;
    var gal = ''
      + '<path d="M ' + (gcx - gr) + ',' + gcy + ' A ' + gr + ',' + gr + ' 0 0 0 ' + (gcx + gr) + ',' + gcy + '" fill="' + ELEV + '" stroke="' + C8 + '" stroke-width="2"/>'
      + '<line x1="352" y1="' + (cy + 28) + '" x2="' + (gcx - gr) + '" y2="' + gcy + '" stroke="' + C8 + '" stroke-width="1.8"/>'
      + '<line x1="406" y1="' + (cy + 28) + '" x2="' + (gcx + gr) + '" y2="' + gcy + '" stroke="' + C8 + '" stroke-width="1.8"/>'
      + '<line x1="' + gcx + '" y1="' + gcy + '" x2="' + f(nx) + '" y2="' + f(ny) + '" stroke="' + C7 + '" stroke-width="2.6" stroke-linecap="round"/>'
      + '<circle cx="' + gcx + '" cy="' + gcy + '" r="4" fill="' + C8 + '"/>'
      + txt(gcx, gcy - gr + 16, '0', 15, INK, 'middle', 700)
      + txt(gcx - gr - 6, gcy - 2, '−', 16, C7, 'end', 700)
      + txt(gcx + gr + 6, gcy - 2, '+', 16, C7, 'start', 700)
      + hit(gcx - gr - 20, gcy - gr, gr * 2 + 44, gr + 10);

    flux += phiGraph(ph);
    parts.push(g('flux', flux));
    parts.push(g('coil', coil));
    parts.push(g('induced', induced));
    parts.push(g('lenz', lenz));
    parts.push(g('galvanometer', gal));
    parts.push(g('faraday', emfGraph(ph)));
    return parts.join('');
  }

  function tX(t, x0) { return x0 + t * 26; }

  function phiGraph(ph) {
    var x0 = 50;
    var y0 = 400;
    var sc = 28;
    var pts = [[0, 0], [2, 4], [4, 4], [5, 0], [6, 0]];
    var i, xy = [], area, tx = tX(ph.t, x0), py = y0 - ph.phi * sc;
    for (i = 0; i < pts.length; i++) xy.push([tX(pts[i][0], x0), y0 - pts[i][1] * sc]);
    area = 'M ' + f(xy[0][0]) + ',' + y0;
    for (i = 0; i < xy.length; i++) area += ' L ' + f(xy[i][0]) + ',' + f(xy[i][1]);
    area += ' L ' + f(xy[xy.length - 1][0]) + ',' + y0 + ' Z';
    return '<path d="' + area + '" fill="' + C6S + '"/>'
      + '<line x1="' + x0 + '" y1="' + (y0 - 4 * sc) + '" x2="' + x0 + '" y2="' + y0 + '" stroke="' + DIM + '" stroke-width="1.4"/>'
      + '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + f(tX(6, x0)) + '" y2="' + y0 + '" stroke="' + DIM + '" stroke-width="1.4"/>'
      + poly(xy, C6, 2.4)
      + '<line x1="' + f(tx) + '" y1="' + (y0 - 4 * sc - 4) + '" x2="' + f(tx) + '" y2="' + y0 + '" stroke="' + C2 + '" stroke-width="1.4" stroke-dasharray="3 3"/>'
      + '<circle cx="' + f(tx) + '" cy="' + f(py) + '" r="4.5" fill="' + C2 + '" stroke="' + CARD + '" stroke-width="1.5"/>'
      + txt(x0 + 6, 246, 'Φ (Wb)', 15, C6, 'start', 700)
      + txt(tX(6, x0) + 28, y0 - 6, 't (s)', 15, DIM, 'start', 700)
      + txt(x0 - 8, y0 + 4, '0', 15, DIM, 'end', 0)
      + txt(x0 - 8, y0 - 4 * sc + 4, '4', 15, DIM, 'end', 0)
      + txt(tX(0, x0), y0 + 16, '0', 15, DIM, 'middle', 0)
      + txt(tX(2, x0), y0 + 16, '2', 15, DIM, 'middle', 0)
      + txt(tX(4, x0), y0 + 16, '4', 15, DIM, 'middle', 0)
      + txt(tX(6, x0), y0 + 16, '6', 15, DIM, 'middle', 0)
      + hit(x0 - 24, 232, 210, 188);
  }

  function emfGraph(ph) {
    var x0 = 292;
    var z = 348;
    var vs = 15;
    var pts = [[0, -2], [2, -2], [2, 0], [4, 0], [4, 4], [5, 4], [5, 0], [6, 0]];
    var i, xy = [], tx = tX(ph.t, x0), ey = z - ph.emf * vs;
    for (i = 0; i < pts.length; i++) xy.push([tX(pts[i][0], x0), z - pts[i][1] * vs]);
    return '<line x1="' + x0 + '" y1="' + (z - 4 * vs) + '" x2="' + x0 + '" y2="' + (z + 2 * vs + 8) + '" stroke="' + DIM + '" stroke-width="1.4"/>'
      + '<line x1="' + x0 + '" y1="' + z + '" x2="' + f(tX(6, x0)) + '" y2="' + z + '" stroke="' + DIM + '" stroke-width="1.4"/>'
      + poly(xy, C7, 2.4)
      + '<line x1="' + f(tx) + '" y1="' + (z - 4 * vs - 4) + '" x2="' + f(tx) + '" y2="' + (z + 2 * vs + 6) + '" stroke="' + C2 + '" stroke-width="1.4" stroke-dasharray="3 3"/>'
      + '<circle cx="' + f(tx) + '" cy="' + f(ey) + '" r="4.5" fill="' + C2 + '" stroke="' + CARD + '" stroke-width="1.5"/>'
      + chip(400, 230, 168, 28, 'ε = −ΔΦ/Δt', CARD, C7, C7, 15)
      + txt(x0 - 8, z - 4 * vs + 4, '4', 15, DIM, 'end', 0)
      + txt(x0 - 8, z + 4, '0', 15, DIM, 'end', 0)
      + txt(x0 - 8, z + 2 * vs + 4, '−2', 15, DIM, 'end', 0)
      + txt(tX(0, x0), 418, '0', 15, DIM, 'middle', 0)
      + txt(tX(2, x0), 418, '2', 15, DIM, 'middle', 0)
      + txt(tX(4, x0), 418, '4', 15, DIM, 'middle', 0)
      + txt(tX(6, x0), 418, '6', 15, DIM, 'middle', 0)
      + txt(tX(6, x0) + 16, z - 8, 't (s)', 15, DIM, 'start', 700)
      + hit(x0 - 28, 214, 230, 214);
  }

  function readoutWire(v) {
    var I = iVal(v);
    var out = !v.dir;
    var how = out ? '⊙ 지면에서 나옴' : '⊗ 지면으로 들어감';
    var turn = out ? '반시계 방향' : '시계 방향';
    return '전류 ' + I + ' A (' + how + ') → 자기장은 ' + turn
      + '\nB_P : B_Q = 2 : 1 (r_Q = 2 r_P) — B ∝ I / r'
      + '\nB_P = ' + I + ' (상대값)';
  }
  function readoutTwo(v) {
    var ratio = ratioOf(v);
    var rel = v.rel === 'opposite' ? 'opposite' : 'same';
    var z = zeroAt(ratio, rel);
    var headS = (rel === 'same' ? '같은 방향' : '반대 방향') + ' · I_A : I_B = 1 : ' + ratio;
    if (!z) return headS + ' → 0인 점 없음';
    if (rel === 'same') return headS + ' → 0인 점은 두 도선 사이, A에서 ' + z.frac;
    return headS + ' → 0인 점은 A 바깥쪽, A에서 ' + z.frac + ' (전류가 작은 쪽)';
  }
  function readoutCoil(v) {
    var I = iVal(v);
    var n = nVal(v);
    var side = v.dir ? '왼쪽' : '오른쪽';
    if (v.kind === 'loop') {
      return '원형 도선: 네 손가락을 전류 방향으로 감으면 엄지(자기장) = ' + side + '\nB ∝ I / r (상대값 ' + I + ')';
    }
    return '솔레노이드: 네 손가락을 전류 방향으로 감아쥐면 엄지(N극) = ' + side
      + '\nB ∝ nI = ' + n + ' × ' + I + ' (상대값 ' + (n * I) + ')';
  }
  function readoutInduction(v) {
    var pole = v.pole === 'S' ? 'S' : 'N';
    var ph = fluxAt(v.t);
    var tStr = ph.t.toFixed(1);
    var pStr = fmtNum(ph.phi);
    var face, verb, line2;
    if (ph.mode === 'flat') {
      return 't = ' + tStr + ' s · Φ = ' + pStr + ' Wb 일정 → ΔΦ/Δt = 0 → 유도 전류 0';
    }
    if (ph.mode === 'off') {
      return 't = ' + tStr + ' s · Φ = 0 · 유도 전류 0';
    }
    face = facePole(pole, ph.mode);
    verb = ph.mode === 'up' ? '밀어냄' : '끌어당김';
    if (ph.mode === 'up') {
      line2 = pole + '극이 접근 → 선속 증가를 방해하도록 코일의 자석 쪽 면이 ' + face + '극(' + verb + ')이 되는 방향으로 유도 전류';
    } else {
      line2 = '감소를 방해 → 자석 쪽 면이 ' + face + '극(' + verb + ')이 되는 방향, 앞 구간과 반대 방향 전류';
    }
    return 't = ' + tStr + ' s · Φ = ' + pStr + ' Wb ' + (ph.mode === 'up' ? '↑ 증가' : '↓ 감소')
      + ' · ε = −ΔΦ/Δt: |ε| = ' + fmtNum(Math.abs(ph.emf)) + ' V\n' + line2;
  }

  NM.define('electromagnet', {
    viewBox: [560, 440],
    views: [
      { id: 'wire', label: '직선 도선', hint: '전류가 지면에서 나오면 자기장은 반시계 방향이다.' },
      { id: 'two', label: '두 도선', hint: '같은 방향이면 0인 점은 두 도선 사이, 반대면 전류가 작은 쪽 바깥이다.' },
      { id: 'coil', label: '코일', hint: '네 손가락을 전류 방향으로 감으면 엄지가 N극이다.' },
      { id: 'induction', label: '전자기 유도', hint: '선속이 변할 때만 유도 전류가 생긴다.' }
    ],
    controls: [
      { id: 'I', type: 'range', label: '전류 I (A)', min: 1, max: 5, step: 1, value: 3, views: ['wire', 'coil'] },
      { id: 'dir', type: 'toggle', label: '전류 방향 반대로', value: false, views: ['wire', 'coil'] },
      {
        id: 'ratio', type: 'choice', label: 'I_B / I_A', value: 2, views: ['two'],
        options: [{ v: 1, label: '1' }, { v: 2, label: '2' }, { v: 3, label: '3' }]
      },
      {
        id: 'rel', type: 'choice', label: '전류 방향', value: 'same', views: ['two'],
        options: [{ v: 'same', label: '같은 방향' }, { v: 'opposite', label: '반대 방향' }]
      },
      {
        id: 'kind', type: 'choice', label: '코일 종류', value: 'solenoid', views: ['coil'],
        options: [{ v: 'solenoid', label: '솔레노이드' }, { v: 'loop', label: '원형 도선' }]
      },
      { id: 'n', type: 'range', label: '감은 수 n', min: 2, max: 10, step: 1, value: 6, views: ['coil'] },
      {
        id: 't', type: 'range', label: '시간 t (s)', min: 0, max: 6, step: 0.02, value: 0.5, views: ['induction'],
        fmt: function (val) { return Number(val).toFixed(1) + ' s'; }
      },
      {
        id: 'pole', type: 'choice', label: '접근하는 극', value: 'N', views: ['induction'],
        options: [{ v: 'N', label: 'N' }, { v: 'S', label: 'S' }]
      }
    ],
    animate: { control: 't', from: 0, to: 6, duration: 12000, loop: true, views: ['induction'] },
    render: function (v, view) {
      if (view === 'two') return renderTwo(v);
      if (view === 'coil') return renderCoil(v);
      if (view === 'induction') return renderInduction(v);
      return renderWire(v);
    },
    readout: function (v, view) {
      if (view === 'two') return readoutTwo(v);
      if (view === 'coil') return readoutCoil(v);
      if (view === 'induction') return readoutInduction(v);
      return readoutWire(v);
    },
    _calc: function (v) {
      v = v || {};
      var ratio = ratioOf(v);
      var rel = v.rel === 'opposite' ? 'opposite' : 'same';
      var I = iVal(v);
      var ph = fluxAt(v.t);
      return {
        bLenP: bLen(I, 60),
        bLenQ: bLen(I, 120),
        zero: zeroAt(ratio, rel),
        phi: ph.phi,
        emf: ph.emf,
        mode: ph.mode,
        bSample: bNet(XA + D_WIRE / 3, 1, 2, 1, 1)
      };
    }
  });
})();
