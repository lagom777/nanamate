/* 속도–시간 그래프. 직선의 기울기 Δv/Δt 는 가속도, 시간 축과 직선 사이 부호 있는 넓이는 변위.
 * 컨트롤: v0 (m/s, −6~6), a (m/s², −3~3), t (s, 0~6).
 * v = v₀ + at,  s = v₀t + ½at².  이동 거리는 0~t 에서 |v| 를 적분한 값.
 * 세로 눈금은 0~6 s 의 max(|v₀|, |v(6)|) 에 따라 ±6·±12·±18 (간격 2·3·6).
 * 아래 수레의 위치는 같은 s(t). 방향이 바뀌면 경로를 레일 아래 두 줄로 나누어 그린다.
 */
(function (NMFIG) {
  'use strict';

  var PL = 68, PR = 500, PT = 40, PB = 236;
  var TLAB_Y = 258;
  var V_TITLE_X = 68, V_TITLE_Y = 22;
  var T_TITLE_X = 516;
  var DISP_LAB_Y = 298;
  var ARROW_Y = 318;
  var RAIL_Y = 356;
  var POS_Y = 394;
  var DIST_Y = 418;
  var DIST_Y2 = 432;
  var DIST_LAB_Y = 454;
  var RAIL_L = 28, RAIL_R = 536;
  var BODY_W = 46, BODY_H = 18, WHEEL_R = 7;

  var C1 = 'var(--fgx-c1, #2563eb)';
  var C2 = 'var(--fgx-c2, #dc2626)';
  var C3 = 'var(--fgx-c3, #d97706)';
  var C4 = 'var(--fgx-c4, #16a34a)';
  var C6 = 'var(--fgx-c6, #0891b2)';
  var C8 = 'var(--fgx-c8, #65748b)';
  var C1S = 'var(--fgx-c1-soft, #d3e0fb)';
  var C2S = 'var(--fgx-c2-soft, #f8d4d4)';
  var INK = 'var(--fgx-ink, #1a1f2e)';
  var DIM = 'var(--fgx-dim, #4a5468)';
  var LINE = 'var(--fgx-line, rgba(0,0,0,.18))';
  var CARD = 'var(--fgx-card, #fff)';
  var ELEV = 'var(--fgx-elev, #f5f7fa)';

  function n(x) {
    if (x !== x || x === Infinity || x === -Infinity) return 0;
    return x;
  }

  function roundTo(x, d) {
    var p = Math.pow(10, d);
    var y = n(x) * p;
    var r = y >= 0 ? Math.floor(y + 0.5) : Math.ceil(y - 0.5);
    return r / p;
  }

  function p(x) {
    var s = roundTo(n(x), 1).toFixed(1);
    return s === '-0.0' ? '0.0' : s;
  }

  function fmtNum(x, d) {
    var r = roundTo(x, d);
    var s = Math.abs(r).toFixed(d);
    return r < 0 ? '−' + s : s;
  }

  function fmtSigned(x, d) {
    var r = roundTo(x, d);
    if (r > 0) return '+' + Math.abs(r).toFixed(d);
    return fmtNum(x, d);
  }

  function fmtTick(x) {
    var r = roundTo(x, 2);
    var neg = r < -1e-9;
    var a = Math.abs(r);
    var body = Math.abs(a - Math.round(a)) < 1e-6 ? String(Math.round(a)) : a.toFixed(1);
    return neg ? '−' + body : body;
  }

  function fmtT(x) {
    var r = roundTo(x, 2);
    if (Math.abs(r * 10 - Math.round(r * 10)) < 1e-4) return fmtNum(r, 1);
    return (r < 0 ? '−' : '') + Math.abs(r).toFixed(2);
  }

  function posAt(v0, a, t) {
    return v0 * t + 0.5 * a * t * t;
  }

  function velAt(v0, a, t) {
    return v0 + a * t;
  }

  function turnTime(v0, a) {
    var tt;
    if (Math.abs(a) < 1e-12) return null;
    tt = -v0 / a;
    if (tt > 1e-9 && tt <= 6 + 1e-9) return tt > 6 ? 6 : tt;
    return null;
  }

  function scaleOf(vmax) {
    if (vmax <= 6 + 1e-9) return { V: 6, tick: 2 };
    if (vmax <= 12 + 1e-9) return { V: 12, tick: 3 };
    return { V: 18, tick: 6 };
  }

  function calc(v) {
    var v0 = n(Number(v && v.v0));
    var a = n(Number(v && v.a));
    var t = n(Number(v && v.t));
    var tt, s, st, vmax, sc, s6, sMin, sMax, turned, leg1, leg2, dist;
    if (t < 0) t = 0;
    if (t > 6) t = 6;
    tt = turnTime(v0, a);
    s = posAt(v0, a, t);
    st = tt === null ? null : posAt(v0, a, tt);
    turned = tt !== null && t > tt + 1e-9;
    if (!turned) {
      leg1 = null;
      leg2 = null;
      dist = Math.abs(s);
    } else {
      leg1 = Math.abs(st);
      leg2 = Math.abs(s - st);
      dist = leg1 + leg2;
    }
    vmax = Math.max(Math.abs(v0), Math.abs(velAt(v0, a, 6)));
    sc = scaleOf(vmax);
    s6 = posAt(v0, a, 6);
    sMin = Math.min(0, s6);
    sMax = Math.max(0, s6);
    if (tt !== null && tt < 6 - 1e-9) {
      sMin = Math.min(sMin, st);
      sMax = Math.max(sMax, st);
    }
    return {
      v0: v0, a: a, t: t, tt: tt, st: st, turned: turned,
      vel: velAt(v0, a, t), s: s, d: dist, leg1: leg1, leg2: leg2,
      V: sc.V, tick: sc.tick, vmax: vmax, sMin: sMin, sMax: sMax
    };
  }

  function readout(v) {
    var c = calc(v);
    var line3;
    var head = 'a = ' + fmtSigned(c.a, 1) + ' m/s²  ·  v(' + fmtT(c.t) + ' s) = ' + fmtNum(c.vel, 1) + ' m/s';
    var mid = '변위 s = v₀t + ½at² = ' + fmtSigned(c.s, 1) + ' m (넓이의 부호 있는 합)';
    if (c.turned) {
      line3 = '이동 거리 = ' + fmtNum(c.leg1, 1) + ' + ' + fmtNum(c.leg2, 1) + ' = ' + fmtNum(c.d, 1) + ' m (변위 ' + fmtNum(c.s, 1) + ' m 와 다름)';
    } else {
      line3 = '이동 거리 = ' + fmtNum(c.d, 1) + ' m';
    }
    return head + '\n' + mid + '\n' + line3;
  }

  function estWidth(str, size) {
    var w = 0, i, ch;
    for (i = 0; i < str.length; i++) {
      ch = str.charCodeAt(i);
      if (ch >= 0xAC00 && ch <= 0xD7A3) w += size;
      else if (ch === 0x20) w += size * 0.33;
      else w += size * 0.58;
    }
    return w * 1.2 + 4;
  }

  function overlaps(a, b, gap) {
    var g = gap || 0;
    return a.x < b.x + b.w + g && a.x + a.w + g > b.x && a.y < b.y + b.h + g && a.y + a.h + g > b.y;
  }

  function text(x, y, str, size, fill, anchor, weight) {
    return '<text x="' + p(x) + '" y="' + p(y) + '" font-size="' + size + '" fill="' + fill + '" text-anchor="' + (anchor || 'start') + '"' + (weight ? ' font-weight="' + weight + '"' : '') + '>' + str + '</text>';
  }

  function haloText(x, y, str, size, fill, anchor, weight) {
    var common = ' x="' + p(x) + '" y="' + p(y) + '" font-size="' + size + '" text-anchor="' + (anchor || 'start') + '"' + (weight ? ' font-weight="' + weight + '"' : '') + ' stroke-linejoin="round"';
    return '<text' + common + ' fill="none" stroke="' + CARD + '" stroke-width="5">' + str + '</text>' +
      '<text' + common + ' fill="' + fill + '">' + str + '</text>';
  }

  function makeGeom(c) {
    var half = (PB - PT) / 2;
    var zeroY = PT + half;
    var plotW = PR - PL;
    var lo = c.sMin;
    var hi = c.sMax;
    var innerL = RAIL_L + 32;
    var innerR = RAIL_R - 32;
    if (hi - lo < 1e-9) { lo = -1; hi = 1; }
    return {
      half: half,
      zeroY: zeroY,
      plotW: plotW,
      sLo: lo,
      sHi: hi,
      xT: function (t) { return PL + (t / 6) * plotW; },
      yV: function (vel) { return zeroY - (vel / c.V) * half; },
      xS: function (s) { return innerL + (s - lo) / (hi - lo) * (innerR - innerL); }
    };
  }

  function shadeTop(xL, xR, c, g, lh) {
    var i, x, t, y, low, top;
    if (!(xR > xL)) return null;
    low = -1e9;
    for (i = 0; i <= 8; i++) {
      x = xL + (xR - xL) * i / 8;
      t = (x - PL) / (PR - PL) * 6;
      if (t < 0) t = 0;
      if (t > 6) t = 6;
      y = g.yV(velAt(c.v0, c.a, t));
      if (y > low) low = y;
    }
    top = low + 7;
    if (top < PT + 2 || top + lh > g.zeroY - 3) return null;
    return top;
  }

  function lineHits(box, c, g) {
    var i, x, t, y;
    for (i = 0; i <= 10; i++) {
      x = box.x + box.w * (i / 10);
      t = (x - PL) / (PR - PL) * 6;
      if (t < -0.05 || t > 6.05) continue;
      y = g.yV(velAt(c.v0, c.a, t));
      if (y > box.y - 6 && y < box.y + box.h + 3) return true;
    }
    return false;
  }

  function fixedObstacles(g) {
    return [
      { x: PL - 4, y: g.zeroY - 2, w: PR - PL + 24, h: 8 },
      { x: V_TITLE_X - 2, y: 1, w: estWidth('v (m/s)', 16) + 6, h: 24 }
    ];
  }

  function chooseBox(cands, c, g, obstacles, near) {
    var obs = (obstacles || []).concat(fixedObstacles(g));
    var best = null;
    var i, k, b, col, d, rank;
    for (i = 0; i < cands.length; i++) {
      b = cands[i];
      col = 0;
      if (b.x < 2 || b.y < 1) col += 80;
      if (b.x + b.w > 554) col += 80;
      if (b.y + b.h > 452) col += 70;
      if (b.y < PT && b.y + b.h > PT - 2) col += 10;
      if (b.y + b.h > PB - 2) col += 50;
      if (lineHits(b, c, g)) col += 60;
      for (k = 0; k < obs.length; k++) {
        if (overlaps(b, obs[k], 0)) col += 40;
      }
      d = 0;
      if (near) d = Math.abs(b.x + b.w / 2 - near.x) + Math.abs(b.y + b.h / 2 - near.y);
      rank = col * 1000 + (b.bias || 0) * 80 + d;
      if (!best || rank < best.rank) best = { rank: rank, b: b };
    }
    return best.b;
  }

  function chip(x, y, w, h, str, stroke, fillText) {
    var size = 15;
    var tx = x + w / 2;
    var ty = y + h / 2 + size * 0.35;
    return '<rect x="' + p(x) + '" y="' + p(y) + '" width="' + p(w) + '" height="' + p(h) + '" rx="8" fill="' + CARD + '" stroke="' + stroke + '" stroke-width="1.5"/>' +
      text(tx, ty, str, size, fillText || INK, 'middle', '700');
  }

  function arrowHead(x1, y1, x2, y2, size) {
    var ang = Math.atan2(y2 - y1, x2 - x1);
    var x3 = x2 - Math.cos(ang - 0.42) * size;
    var y3 = y2 - Math.sin(ang - 0.42) * size;
    var x4 = x2 - Math.cos(ang + 0.42) * size;
    var y4 = y2 - Math.sin(ang + 0.42) * size;
    return 'M ' + p(x2) + ' ' + p(y2) + ' L ' + p(x3) + ' ' + p(y3) + ' L ' + p(x4) + ' ' + p(y4) + ' Z';
  }

  function backdrop() {
    return '<rect x="' + PL + '" y="' + PT + '" width="' + (PR - PL) + '" height="' + (PB - PT) + '" fill="' + ELEV + '" stroke="' + LINE + '" stroke-width="1.5"/>';
  }

  function grid(c, g) {
    var out = [];
    var v, x, y, t;
    out.push('<g style="pointer-events:none">');
    for (v = -c.V; v <= c.V + 1e-9; v += c.tick) {
      if (Math.abs(v) < 1e-9) continue;
      y = g.yV(v);
      out.push('<line x1="' + PL + '" y1="' + p(y) + '" x2="' + PR + '" y2="' + p(y) + '" stroke="' + LINE + '" stroke-width="1"/>');
    }
    for (t = 1; t <= 5; t++) {
      x = g.xT(t);
      out.push('<line x1="' + p(x) + '" y1="' + PT + '" x2="' + p(x) + '" y2="' + PB + '" stroke="' + LINE + '" stroke-width="1"/>');
    }
    out.push('</g>');
    return out.join('');
  }

  function areaPath(t1, t2, c, g) {
    var v1 = velAt(c.v0, c.a, t1);
    var v2 = velAt(c.v0, c.a, t2);
    return 'M ' + p(g.xT(t1)) + ' ' + p(g.zeroY) +
      ' L ' + p(g.xT(t1)) + ' ' + p(g.yV(v1)) +
      ' L ' + p(g.xT(t2)) + ' ' + p(g.yV(v2)) +
      ' L ' + p(g.xT(t2)) + ' ' + p(g.zeroY) + ' Z';
  }

  function areaMarkup(c, g) {
    var spans = [];
    var out = [];
    var i, t1, t2, mid, d, fill;
    out.push('<g data-part="area">');
    if (c.t > 1e-6) {
      if (c.tt !== null && c.tt > 1e-6 && c.tt < c.t - 1e-6) spans.push([0, c.tt], [c.tt, c.t]);
      else spans.push([0, c.t]);
      for (i = 0; i < spans.length; i++) {
        t1 = spans[i][0];
        t2 = spans[i][1];
        mid = velAt(c.v0, c.a, (t1 + t2) / 2);
        if (Math.abs(mid) < 1e-8) continue;
        d = areaPath(t1, t2, c, g);
        fill = mid > 0 ? C1S : C2S;
        out.push('<path d="' + d + '" fill="' + fill + '"/>');
        out.push('<path d="' + d + '" fill="transparent" stroke="transparent" stroke-width="16" class="fgx-hit" style="pointer-events:all"/>');
      }
    }
    if (out.length < 3) {
      out.push('<rect class="fgx-hit" x="' + p(g.xT(0) - 8) + '" y="' + p(g.zeroY - 8) + '" width="16" height="16" fill="transparent" style="pointer-events:all"/>');
    }
    out.push('</g>');
    return out.join('');
  }

  function axes(c, g) {
    var out = [];
    var v, y, t, x, lab;
    out.push('<g data-part="v_axis">');
    out.push('<rect class="fgx-hit" x="' + (PL - 36) + '" y="' + PT + '" width="44" height="' + (PB - PT) + '" fill="transparent" style="pointer-events:all"/>');
    out.push('<line x1="' + PL + '" y1="' + PT + '" x2="' + PL + '" y2="' + PB + '" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>');
    for (v = -c.V; v <= c.V + 1e-9; v += c.tick) {
      y = g.yV(v);
      out.push('<line x1="' + (PL - 6) + '" y1="' + p(y) + '" x2="' + PL + '" y2="' + p(y) + '" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>');
      out.push(text(PL - 9, y + 5, fmtTick(v), 15, Math.abs(v) < 1e-9 ? INK : DIM, 'end', Math.abs(v) < 1e-9 ? '700' : ''));
    }
    out.push(text(V_TITLE_X, V_TITLE_Y, 'v (m/s)', 16, INK, 'start', '700'));
    out.push('</g>');

    out.push('<g data-part="t_axis">');
    out.push('<rect class="fgx-hit" x="' + PL + '" y="' + p(g.zeroY - 10) + '" width="' + (PR - PL) + '" height="20" fill="transparent" style="pointer-events:all"/>');
    out.push('<rect class="fgx-hit" x="' + PL + '" y="' + (TLAB_Y - 16) + '" width="' + (PR - PL + 52) + '" height="24" fill="transparent" style="pointer-events:all"/>');
    out.push('<line x1="' + PL + '" y1="' + p(g.zeroY) + '" x2="' + PR + '" y2="' + p(g.zeroY) + '" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>');
    for (t = 0; t <= 6; t++) {
      x = g.xT(t);
      out.push('<line x1="' + p(x) + '" y1="' + p(g.zeroY) + '" x2="' + p(x) + '" y2="' + p(g.zeroY + 6) + '" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>');
      lab = String(t);
      out.push(text(x, TLAB_Y, lab, 15, DIM, 'middle'));
    }
    out.push(text(T_TITLE_X, TLAB_Y, 't (s)', 16, INK, 'start', '700'));
    out.push('</g>');
    return out.join('');
  }

  function graphLine(c, g) {
    var dAll = 'M ' + p(g.xT(0)) + ' ' + p(g.yV(c.v0)) + ' L ' + p(g.xT(6)) + ' ' + p(g.yV(velAt(c.v0, c.a, 6)));
    var out = [];
    out.push('<g data-part="line" clip-path="url(#vtClip)">');
    out.push('<path d="' + dAll + '" fill="none" stroke="transparent" stroke-width="18" class="fgx-hit" style="pointer-events:all"/>');
    if (c.t > 1e-4) {
      out.push('<path d="M ' + p(g.xT(0)) + ' ' + p(g.yV(c.v0)) + ' L ' + p(g.xT(c.t)) + ' ' + p(g.yV(c.vel)) + '" fill="none" stroke="' + C1 + '" stroke-width="4" stroke-linecap="round"/>');
    }
    if (c.t < 6 - 1e-4) {
      out.push('<path d="M ' + p(g.xT(c.t)) + ' ' + p(g.yV(c.vel)) + ' L ' + p(g.xT(6)) + ' ' + p(g.yV(velAt(c.v0, c.a, 6))) + '" fill="none" stroke="' + C1 + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="8 6" stroke-opacity="0.4"/>');
    }
    out.push('</g>');
    return out.join('');
  }

  function cursor(c, g) {
    var x = g.xT(c.t);
    var y = g.yV(c.vel);
    if (y < PT) y = PT;
    if (y > PB) y = PB;
    return '<g style="pointer-events:none">' +
      '<line x1="' + p(x) + '" y1="' + PT + '" x2="' + p(x) + '" y2="' + PB + '" stroke="' + C4 + '" stroke-width="1.75" stroke-dasharray="5 4" stroke-linecap="round"/>' +
      '<circle cx="' + p(x) + '" cy="' + p(y) + '" r="6" fill="' + C4 + '" stroke="' + CARD + '" stroke-width="2"/>' +
      '</g>';
  }

  function slopeBox(c, g) {
    var x1 = g.xT(1);
    var x2 = g.xT(2);
    var y1 = g.yV(velAt(c.v0, c.a, 1));
    var y2 = g.yV(velAt(c.v0, c.a, 2));
    var top = Math.min(y1, y2) - 6;
    var bot = Math.max(y1, y2) + 6;
    return { x: x1 - 8, y: top, w: (x2 - x1) + 16, h: Math.max(18, bot - top) };
  }

  function slopeMarkup(c, g, obstacles) {
    var x1 = g.xT(1);
    var x2 = g.xT(2);
    var y1 = g.yV(velAt(c.v0, c.a, 1));
    var y2 = g.yV(velAt(c.v0, c.a, 2));
    var out = [];
    var label, lw, lh, box, cands, len, head;
    out.push('<g data-part="slope">');
    if (Math.abs(c.a) < 1e-9) {
      label = '기울기 0';
      lw = estWidth(label, 15) + 8;
      lh = 18;
      cands = [
        { x: (x1 + x2) / 2 - lw / 2, y: y1 - lh - 8, w: lw, h: lh },
        { x: (x1 + x2) / 2 - lw / 2, y: y1 + 10, w: lw, h: lh },
        { x: x2 + 8, y: y1 - lh / 2, w: lw, h: lh }
      ];
      box = chooseBox(cands, c, g, obstacles, { x: (x1 + x2) / 2, y: y1 });
      out.push('<rect class="fgx-hit" x="' + p(x1) + '" y="' + p(y1 - 12) + '" width="' + p(x2 - x1) + '" height="24" fill="transparent" style="pointer-events:all"/>');
      out.push(haloText(box.x + 4, box.y + 14, label, 15, C3, 'start', '700'));
      out.push('<rect class="fgx-hit" x="' + p(box.x) + '" y="' + p(box.y) + '" width="' + p(box.w) + '" height="' + p(box.h) + '" fill="transparent" style="pointer-events:all"/>');
      obstacles.push(box);
    } else {
      len = Math.abs(y2 - y1);
      head = len >= 11 ? Math.min(9, len * 0.55) : 0;
      out.push('<line x1="' + p(x1) + '" y1="' + p(y1) + '" x2="' + p(x2) + '" y2="' + p(y1) + '" stroke="' + C3 + '" stroke-width="2.5" stroke-dasharray="5 4" stroke-linecap="round"/>');
      out.push('<line x1="' + p(x2) + '" y1="' + p(y1) + '" x2="' + p(x2) + '" y2="' + p(y2) + '" stroke="' + C3 + '" stroke-width="2.5" stroke-dasharray="5 4" stroke-linecap="round"/>');
      if (head > 0) out.push('<path d="' + arrowHead(x2, y1, x2, y2, head) + '" fill="' + C3 + '"/>');
      out.push('<rect class="fgx-hit" x="' + p(slopeBox(c, g).x) + '" y="' + p(slopeBox(c, g).y) + '" width="' + p(slopeBox(c, g).w) + '" height="' + p(slopeBox(c, g).h) + '" fill="transparent" style="pointer-events:all"/>');
      label = 'Δv/Δt = a';
      lw = estWidth(label, 15) + 8;
      lh = 18;
      cands = [];
      var step, belowBias, aboveBias, mid, slot;
      belowBias = c.a >= 0 ? 0 : 1;
      aboveBias = c.a >= 0 ? 1 : 0;
      mid = (x1 + x2) / 2 - lw / 2;
      slot = shadeTop(x1, Math.min(PR - 8, x1 + lw), c, g, lh);
      if (slot !== null) cands.push({ x: x1, y: slot, w: lw, h: lh, bias: 0 });
      slot = shadeTop(x2 + 8, Math.min(PR - 8, x2 + 8 + lw), c, g, lh);
      if (slot !== null) cands.push({ x: x2 + 8, y: slot, w: lw, h: lh, bias: 1 });
      for (step = 0; step < 5; step++) {
        cands.push({ x: mid, y: Math.max(y1, y2) + 8 + step * 14, w: lw, h: lh, bias: belowBias + 2 });
        cands.push({ x: mid, y: Math.min(y1, y2) - lh - 8 - step * 14, w: lw, h: lh, bias: aboveBias + 2 });
        cands.push({ x: x2 + 10, y: Math.max(y1, y2) + 6 + step * 14, w: lw, h: lh, bias: belowBias + 3 });
        cands.push({ x: x2 + 10, y: Math.min(y1, y2) - lh - 6 - step * 14, w: lw, h: lh, bias: aboveBias + 3 });
      }
      box = chooseBox(cands, c, g, obstacles, { x: (x1 + x2) / 2, y: (y1 + y2) / 2 });
      out.push(haloText(box.x + 3, box.y + 14, label, 15, C3, 'start', '700'));
      obstacles.push(box);
    }
    out.push('</g>');
    return out.join('');
  }

  function v0Markup(c, g, obstacles) {
    var x = g.xT(0);
    var y = g.yV(c.v0);
    var label = 'v₀';
    var lw = estWidth(label, 16) + 6;
    var lh = 18;
    var cands = [];
    var dxs = [12, 20, 32, 48];
    var dys = [-44, -32, -20, -8, 6, 16, 28];
    var i, j;
    for (i = 0; i < dxs.length; i++) {
      for (j = 0; j < dys.length; j++) {
        cands.push({ x: x + dxs[i], y: y + dys[j], w: lw, h: lh, bias: 0 });
      }
    }
    cands.push({
      x: V_TITLE_X + estWidth('v (m/s)', 16) + 18,
      y: 2, w: lw, h: lh, bias: 3
    });
    var box = chooseBox(cands, c, g, obstacles, { x: x, y: y });
    obstacles.push(box);
    return '<g data-part="v0">' +
      '<circle class="fgx-hit" cx="' + p(x) + '" cy="' + p(y) + '" r="16" fill="transparent" style="pointer-events:all"/>' +
      '<circle cx="' + p(x) + '" cy="' + p(y) + '" r="7" fill="' + C3 + '" stroke="' + CARD + '" stroke-width="2"/>' +
      haloText(box.x, box.y + 14, label, 16, C3, 'start', '700') +
      '</g>';
  }

  function turnMarkup(c, g, obstacles) {
    var label, lw, x, y, box, cands, w, h;
    if (c.tt === null) {
      label = '방향 전환 없음';
      w = estWidth(label, 15) + 20;
      h = 28;
      x = 560 - 12 - w;
      y = 4;
      box = { x: g.PR ? PR - w - 8 : PR - w - 8, y: PT + 6, w: w, h: h };
      if (!lineHits(box, c, g) && !overlapsAny(box, obstacles)) {
        x = box.x;
        y = box.y;
      }
      return '<g data-part="turn">' + chip(x, y, w, h, label, C8, DIM) + '</g>';
    }
    x = g.xT(c.tt);
    y = g.zeroY;
    label = 'v=0 (방향 전환)';
    lw = estWidth(label, 15) + 16;
    h = 26;
    cands = [
      { x: x + 12, y: y + 12, w: lw, h: h },
      { x: x - lw - 12, y: y + 12, w: lw, h: h },
      { x: x + 12, y: y - h - 12, w: lw, h: h },
      { x: x - lw - 12, y: y - h - 12, w: lw, h: h },
      { x: x - lw / 2, y: y + 28, w: lw, h: h },
      { x: x - lw / 2, y: y - h - 28, w: lw, h: h }
    ];
    if (c.a < 0) cands = [cands[1], cands[2], cands[0], cands[3], cands[4], cands[5]];
    else cands = [cands[3], cands[0], cands[1], cands[2], cands[5], cands[4]];
    box = chooseBox(cands, c, g, obstacles.concat([slopeBox(c, g)]));
    obstacles.push(box);
    return '<g data-part="turn">' +
      '<circle class="fgx-hit" cx="' + p(x) + '" cy="' + p(y) + '" r="16" fill="transparent" style="pointer-events:all"/>' +
      '<circle cx="' + p(x) + '" cy="' + p(y) + '" r="8" fill="' + CARD + '" stroke="' + C2 + '" stroke-width="3"/>' +
      chip(box.x, box.y, box.w, box.h, label, C2, C2) +
      '</g>';
  }

  function overlapsAny(box, list) {
    var i;
    for (i = 0; i < list.length; i++) if (overlaps(box, list[i], 2)) return true;
    return false;
  }

  function niceStep(span) {
    var raw, pow, n, m;
    raw = span / 5;
    if (raw <= 0) return 1;
    pow = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    n = raw / pow;
    if (n <= 1) m = 1;
    else if (n <= 2) m = 2;
    else if (n <= 5) m = 5;
    else m = 10;
    return m * pow;
  }

  function positionTicks(c, g) {
    var span = c.sMax - c.sMin;
    var step, ticks, s, i, prev, minPx, guard, seen, out, j, dup;
    if (span < 1e-9) return [0];
    step = niceStep(span);
    guard = 0;
    ticks = [0];
    while (guard++ < 8) {
      ticks = [];
      s = Math.ceil((c.sMin - 1e-8) / step) * step;
      for (i = 0; i < 30 && s <= c.sMax + 1e-8; i++) {
        ticks.push(roundTo(s, 4));
        s += step;
      }
      seen = false;
      for (i = 0; i < ticks.length; i++) if (Math.abs(ticks[i]) < 1e-6) seen = true;
      if (!seen) ticks.push(0);
      ticks.sort(function (a, b) { return a - b; });
      out = [];
      for (i = 0; i < ticks.length; i++) {
        dup = false;
        for (j = 0; j < out.length; j++) if (Math.abs(out[j] - ticks[i]) < 1e-6) dup = true;
        if (!dup) out.push(ticks[i]);
      }
      ticks = out;
      minPx = 1e9;
      prev = null;
      for (i = 0; i < ticks.length; i++) {
        if (prev !== null) minPx = Math.min(minPx, Math.abs(g.xS(ticks[i]) - g.xS(prev)));
        prev = ticks[i];
      }
      if (ticks.length <= 2 || minPx >= 38 || step >= span) break;
      step *= 2;
    }
    return ticks;
  }

  function track(c, g) {
    var out = [];
    var ticks = positionTicks(c, g);
    var i, x, sLab, disp, distLab, x0, xs, xt, xNow, len, head, d1, d2;
    var cartX = g.xS(c.s);
    out.push('<line x1="' + RAIL_L + '" y1="' + RAIL_Y + '" x2="' + RAIL_R + '" y2="' + RAIL_Y + '" stroke="' + C8 + '" stroke-width="2.5" stroke-linecap="round" style="pointer-events:none"/>');
    for (i = 0; i < ticks.length; i++) {
      x = g.xS(ticks[i]);
      sLab = fmtTick(ticks[i]);
      if (Math.abs(ticks[i]) < 1e-6) {
        out.push('<line x1="' + p(x) + '" y1="' + (RAIL_Y - 12) + '" x2="' + p(x) + '" y2="' + (RAIL_Y + 12) + '" stroke="' + INK + '" stroke-width="2" stroke-linecap="round" style="pointer-events:none"/>');
        out.push(text(x, POS_Y, sLab, 15, INK, 'middle', '700'));
      } else {
        out.push('<line x1="' + p(x) + '" y1="' + RAIL_Y + '" x2="' + p(x) + '" y2="' + (RAIL_Y + 8) + '" stroke="' + C8 + '" stroke-width="1.5" stroke-linecap="round" style="pointer-events:none"/>');
        out.push(text(x, POS_Y, sLab, 15, DIM, 'middle'));
      }
    }
    out.push(text(RAIL_R - 2, POS_Y, 'm', 15, DIM, 'end'));

    x0 = g.xS(0);
    xs = g.xS(c.s);
    disp = '변위 s = ' + fmtSigned(c.s, 1) + ' m';
    out.push('<g data-part="displacement">');
    len = Math.abs(xs - x0);
    if (len >= 8) {
      head = Math.min(11, len * 0.45);
      out.push('<line x1="' + p(x0) + '" y1="' + ARROW_Y + '" x2="' + p(xs) + '" y2="' + ARROW_Y + '" stroke="' + C4 + '" stroke-width="4" stroke-linecap="round"/>');
      out.push('<path d="' + arrowHead(x0, ARROW_Y, xs, ARROW_Y, head) + '" fill="' + C4 + '"/>');
      out.push('<rect class="fgx-hit" x="' + p(Math.min(x0, xs)) + '" y="' + (ARROW_Y - 10) + '" width="' + p(len) + '" height="20" fill="transparent" style="pointer-events:all"/>');
    } else {
      out.push('<circle cx="' + p(x0) + '" cy="' + ARROW_Y + '" r="5" fill="' + C4 + '"/>');
      out.push('<circle class="fgx-hit" cx="' + p(x0) + '" cy="' + ARROW_Y + '" r="14" fill="transparent" style="pointer-events:all"/>');
    }
    placeCenteredLabel(out, disp, (x0 + xs) / 2, DISP_LAB_Y, 16, INK, true);
    out.push('</g>');

    distLab = '이동 거리 = ' + fmtNum(c.d, 1) + ' m';
    out.push('<g data-part="distance">');
    if (c.turned) {
      xt = g.xS(c.st);
      xNow = g.xS(c.s);
      d1 = 'M ' + p(x0) + ' ' + DIST_Y + ' L ' + p(xt) + ' ' + DIST_Y;
      d2 = 'M ' + p(xt) + ' ' + DIST_Y2 + ' L ' + p(xNow) + ' ' + DIST_Y2;
      out.push('<path d="' + d1 + '" fill="none" stroke="transparent" stroke-width="16" class="fgx-hit" style="pointer-events:all"/>');
      out.push('<path d="' + d2 + '" fill="none" stroke="transparent" stroke-width="16" class="fgx-hit" style="pointer-events:all"/>');
      out.push('<path d="' + d1 + '" fill="none" stroke="' + C6 + '" stroke-width="2.5" stroke-linecap="round"/>');
      out.push('<path d="' + d2 + '" fill="none" stroke="' + C6 + '" stroke-width="2.5" stroke-linecap="round"/>');
      out.push('<circle cx="' + p(xt) + '" cy="' + DIST_Y + '" r="3.5" fill="' + C6 + '"/>');
    } else {
      d1 = 'M ' + p(x0) + ' ' + DIST_Y + ' L ' + p(g.xS(c.s)) + ' ' + DIST_Y;
      if (Math.abs(g.xS(c.s) - x0) < 4) {
        out.push('<circle class="fgx-hit" cx="' + p(x0) + '" cy="' + DIST_Y + '" r="12" fill="transparent" style="pointer-events:all"/>');
        out.push('<circle cx="' + p(x0) + '" cy="' + DIST_Y + '" r="4" fill="' + C6 + '"/>');
      } else {
        out.push('<path d="' + d1 + '" fill="none" stroke="transparent" stroke-width="16" class="fgx-hit" style="pointer-events:all"/>');
        out.push('<path d="' + d1 + '" fill="none" stroke="' + C6 + '" stroke-width="2.5" stroke-linecap="round"/>');
      }
    }
    placeCenteredLabel(out, distLab, (RAIL_L + RAIL_R) / 2, DIST_LAB_Y, 16, INK, true);
    out.push('</g>');

    out.push(cartMarkup(cartX));
    return out.join('');
  }

  function placeCenteredLabel(out, str, cx, baseline, size, fill, bold) {
    var w = estWidth(str, size);
    var x = cx - w / 2;
    if (x < 8) x = 8;
    if (x + w > 552) x = 552 - w;
    out.push(text(x, baseline, str, size, fill, 'start', bold ? '700' : ''));
  }

  function cartMarkup(cx) {
    var top = RAIL_Y - WHEEL_R - BODY_H + 4;
    var x = cx - BODY_W / 2;
    return '<g data-part="cart">' +
      '<rect class="fgx-hit" x="' + p(cx - 30) + '" y="' + p(top - 6) + '" width="60" height="' + p(BODY_H + WHEEL_R + 18) + '" fill="transparent" style="pointer-events:all"/>' +
      '<rect x="' + p(x) + '" y="' + p(top) + '" width="' + BODY_W + '" height="' + BODY_H + '" rx="3" fill="' + C4 + '" stroke="' + INK + '" stroke-width="1.5"/>' +
      '<rect x="' + p(x + 8) + '" y="' + p(top + 4) + '" width="14" height="8" rx="1.5" fill="' + CARD + '"/>' +
      '<circle cx="' + p(cx - 13) + '" cy="' + RAIL_Y + '" r="' + WHEEL_R + '" fill="' + CARD + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<circle cx="' + p(cx + 13) + '" cy="' + RAIL_Y + '" r="' + WHEEL_R + '" fill="' + CARD + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<circle cx="' + p(cx - 13) + '" cy="' + RAIL_Y + '" r="2.2" fill="' + C8 + '"/>' +
      '<circle cx="' + p(cx + 13) + '" cy="' + RAIL_Y + '" r="2.2" fill="' + C8 + '"/>' +
      '</g>';
  }

  function render(v) {
    var c = calc(v);
    var g = makeGeom(c);
    var obstacles = [];
    var parts = [];
    parts.push('<defs><clipPath id="vtClip"><rect x="' + PL + '" y="' + PT + '" width="' + (PR - PL) + '" height="' + (PB - PT) + '"/></clipPath></defs>');
    parts.push(backdrop());
    parts.push('<g clip-path="url(#vtClip)">');
    parts.push(areaMarkup(c, g));
    parts.push(grid(c, g));
    parts.push('</g>');
    parts.push(axes(c, g));
    parts.push(graphLine(c, g));
    parts.push(cursor(c, g));
    parts.push(slopeMarkup(c, g, obstacles));
    parts.push(v0Markup(c, g, obstacles));
    parts.push(turnMarkup(c, g, obstacles));
    parts.push(track(c, g));
    return parts.join('');
  }

  NMFIG.define('vt', {
    viewBox: [560, 460],
    controls: [
      {
        id: 'v0', type: 'range', label: '처음 속도 v₀ (m/s)',
        min: -6, max: 6, step: 0.5, value: 2,
        fmt: function (val) { return fmtSigned(val, 1) + ' m/s'; }
      },
      {
        id: 'a', type: 'range', label: '가속도 a (m/s²)',
        min: -3, max: 3, step: 0.5, value: 1.5,
        fmt: function (val) { return fmtSigned(val, 1) + ' m/s²'; }
      },
      {
        id: 't', type: 'range', label: '시각 t (s)',
        min: 0, max: 6, step: 0.05, value: 3,
        fmt: function (val) { return fmtT(val) + ' s'; }
      }
    ],
    animate: { control: 't', from: 0, to: 6, duration: 8000, loop: true },
    _calc: calc,
    readout: function (v) { return readout(v); },
    render: function (v) { return render(v); }
  });
}(window.NMFIG));
