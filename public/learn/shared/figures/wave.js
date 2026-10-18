/* 파동의 용어 — 변위–위치(횡파), 변위–시간, 종파(소밀).
 * 오른쪽 진행 y = A sin(2π(x/λ − ft)), v = fλ, T = 1/f. ctx.time 이 t(초).
 * 컨트롤: wl 파장(m), amp 진폭(m), f 진동수(Hz).
 * 공간: 0–8 m → x 40–520 (60 px/m), 평형 y=190, 변위 70 px/m.
 * 시간: 0–4 s → x 60–500 (110 px/s), 평형 y=170. 곡선은 A sin(2πft).
 * 종파 변위는 amp×7 px, 평형 간격 6 px의 0.8배(4.8 px)에서 클램프.
 */
(function (NMFIG) {
  'use strict';

  var C1 = 'var(--fgx-c1, #2563eb)';
  var C2 = 'var(--fgx-c2, #dc2626)';
  var C3 = 'var(--fgx-c3, #d97706)';
  var C4 = 'var(--fgx-c4, #16a34a)';
  var C5 = 'var(--fgx-c5, #7c3aed)';
  var C6 = 'var(--fgx-c6, #0891b2)';
  var C8 = 'var(--fgx-c8, #65748b)';
  var C1S = 'var(--fgx-c1-soft, #d3e0fb)';
  var C2S = 'var(--fgx-c2-soft, #f9d8d8)';
  var C5S = 'var(--fgx-c5-soft, #e7dcfc)';
  var C6S = 'var(--fgx-c6-soft, #d2ebf1)';
  var INK = 'var(--fgx-ink, #1a1f2e)';
  var DIM = 'var(--fgx-dim, #4a5468)';
  var LINE = 'var(--fgx-line, #d1d1d1)';
  var CARD = 'var(--fgx-card, #fff)';
  var ELEV = 'var(--fgx-elev, #f5f7fa)';

  var N_MARK = 12;
  var SX = 60;
  var SY = 70;
  var SPACE_OX = 40;
  var SPACE_OY = 190;
  var TIME_OX = 60;
  var TIME_OY = 170;
  var TIME_SX = 110;
  var LONG_OX = 56;
  var LONG_ROWS = [130, 160, 190, 220, 250];
  var LONG_GAP = 6;
  var CARD_Y = 334;
  var CARD_H = 50;
  var CARD_TY = 365;

  var MED_M = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8];

  var STYLE = '<style>.fgx-fig-wave text{font-family:inherit}.fgx-fig-wave .fgx-hit{pointer-events:all}</style>';

  function r1(n) {
    return (Math.round(n * 10) / 10).toFixed(1);
  }

  function num(x, fb) {
    x = Number(x);
    if (x !== x || x === Infinity || x === -Infinity) return fb;
    return x;
  }

  function norm(v) {
    v = v || {};
    var wl = num(v.wl, 2);
    var amp = num(v.amp, 0.6);
    var f = num(v.f, 1);
    if (!(wl > 0)) wl = 2;
    if (!(amp >= 0)) amp = 0.6;
    if (!(f > 0)) f = 1;
    return { wl: wl, amp: amp, f: f };
  }

  function yAt(x, t, v) {
    return v.amp * Math.sin(2 * Math.PI * (x / v.wl - v.f * t));
  }

  function fmt1(n) {
    return (Math.round(n * 10) / 10).toFixed(1);
  }

  function fmt2(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  function fmtFlex(n) {
    var t = Math.round(n * 100) / 100;
    if (Math.abs(t * 10 - Math.round(t * 10)) < 1e-6) return t.toFixed(1);
    return t.toFixed(2);
  }

  function fmtT(n) {
    var t = Math.round(n * 100) / 100;
    if (Math.abs(t * 10 - Math.round(t * 10)) < 1e-6) return t.toFixed(1);
    return t.toFixed(2);
  }

  function mod(a, b) {
    var m = a % b;
    if (m < 0) m += b;
    return m;
  }

  function phaseXs(lambda, f, t, shift, x0, x1) {
    var ft = f * t;
    var k0 = Math.ceil(x0 / lambda - ft - shift - 1e-9);
    var k1 = Math.floor(x1 / lambda - ft - shift + 1e-9);
    var out = [];
    var k, x;
    for (k = k0; k <= k1; k++) {
      x = lambda * (ft + k + shift);
      if (x >= x0 - 1e-6 && x <= x1 + 1e-6) out.push(x);
    }
    return out;
  }

  function pickSpan(xs, lambda, xMax, toPx, halfLab) {
    var i, a, b, pm, fallback;
    fallback = null;
    for (i = 0; i < xs.length; i++) {
      a = xs[i];
      b = a + lambda;
      if (a < -1e-4 || b > xMax + 1e-4) continue;
      if (!fallback) fallback = [a, b];
      pm = (toPx(a) + toPx(b)) / 2;
      if (pm - halfLab >= 8 && pm + halfLab <= 552) return [a, b];
    }
    return fallback;
  }

  function closestIndex(xs, target, minDist) {
    var i, d, best = -1, bestD = 1e9, alt = -1, altD = 1e9;
    for (i = 0; i < xs.length; i++) {
      d = Math.abs(xs[i] - target);
      if (d < bestD) { bestD = d; best = i; }
      if (d >= minDist && d < altD) { altD = d; alt = i; }
    }
    if (minDist && best >= 0 && Math.abs(xs[best] - target) < minDist && alt >= 0) return alt;
    return best;
  }

  function headPts(x, y, dir, size) {
    var s = size;
    var w = s * 0.55;
    if (dir === 'r') return r1(x) + ',' + r1(y) + ' ' + r1(x - s) + ',' + r1(y - w) + ' ' + r1(x - s) + ',' + r1(y + w);
    if (dir === 'l') return r1(x) + ',' + r1(y) + ' ' + r1(x + s) + ',' + r1(y - w) + ' ' + r1(x + s) + ',' + r1(y + w);
    if (dir === 'u') return r1(x) + ',' + r1(y) + ' ' + r1(x - w) + ',' + r1(y + s) + ' ' + r1(x + w) + ',' + r1(y + s);
    return r1(x) + ',' + r1(y) + ' ' + r1(x - w) + ',' + r1(y - s) + ' ' + r1(x + w) + ',' + r1(y - s);
  }

  function fitHead(len) {
    if (len < 36) return Math.max(4, len * 0.34);
    return 9;
  }

  function speedLine(n) {
    return 'v = fλ = ' + fmt1(n.f) + ' Hz × ' + fmt1(n.wl) + ' m = ' + fmtFlex(n.f * n.wl) + ' m/s';
  }

  function readoutOf(view, n) {
    var T = 1 / n.f;
    var spd = n.f * n.wl;
    if (view === 'time') {
      return 'T = ' + fmt2(T) + ' s ↔ f = 1/T = ' + fmt1(n.f) + ' Hz\nv = λ/T = ' + fmtFlex(spd) + ' m/s';
    }
    if (view === 'long') {
      return '밀과 밀 사이 = 파장 λ = ' + fmt1(n.wl) + ' m · 소리는 매질이 있어야 전달되는 종파';
    }
    return 'λ = ' + fmt1(n.wl) + ' m · f = ' + fmt1(n.f) + ' Hz · T = ' + fmt2(T) + ' s → v = fλ = ' + fmtFlex(spd) + ' m/s';
  }

  function sinePath(x0, x1, step, yOf) {
    var d = '';
    var x, i, n;
    n = Math.round((x1 - x0) / step);
    for (i = 0; i <= n; i++) {
      x = x0 + i * step;
      d += (i ? 'L' : 'M') + r1(x) + ' ' + r1(yOf(x));
    }
    return d;
  }

  function longAmpPx(amp) {
    var a = amp * 7;
    var cap = LONG_GAP * 0.8;
    if (a > cap) a = cap;
    if (a < 0) a = 0;
    return a;
  }

  function bandW(wl) {
    var w = wl * SX * 0.18;
    if (w < 16) w = 16;
    if (w > 42) w = 42;
    return w;
  }

  function sideOf(px, other, textW) {
    if (other != null && Math.abs(px - other) < textW + 10) {
      if (px <= other) return { lx: -8, anchor: 'end' };
      return { lx: 8, anchor: 'start' };
    }
    if (px < 28) return { lx: 8, anchor: 'start' };
    if (px > 532) return { lx: -8, anchor: 'end' };
    return { lx: 0, anchor: 'middle' };
  }

  function emptyHArrow() {
    return { show: false, x1: 0, x2: 0, y: 0, h1: '0,0 0,0 0,0', h2: '0,0 0,0 0,0', lx: 0, ly: 0, text: '', hx: 0, hy: 0, hw: 0, hh: 0 };
  }

  function makeHArrow(x1, x2, y, text, ly) {
    var hs = fitHead(Math.abs(x2 - x1));
    var left = Math.min(x1, x2);
    var top = Math.min(y, ly) - 18;
    return {
      show: true,
      x1: x1, x2: x2, y: y,
      h1: headPts(x1, y, 'l', hs),
      h2: headPts(x2, y, 'r', hs),
      lx: (x1 + x2) / 2,
      ly: ly,
      text: text,
      hx: left - 8,
      hy: top,
      hw: Math.abs(x2 - x1) + 16,
      hh: Math.abs(ly - y) + 28
    };
  }

  function makeVArrow(x, yTop, yBot, text, side) {
    var len = Math.abs(yBot - yTop);
    var hs = fitHead(len);
    var lx = side > 0 ? x + 8 : x - 8;
    var anchor = side > 0 ? 'start' : 'end';
    if (side > 0 && lx + 62 > 548) { lx = x - 8; anchor = 'end'; }
    if (side < 0 && lx - 62 < 8) { lx = x + 8; anchor = 'start'; }
    var labLeft = anchor === 'start' ? lx : lx - 62;
    var hitL = Math.min(x - 12, labLeft - 4);
    var hitR = Math.max(x + 12, labLeft + 66);
    return {
      show: true,
      x: x,
      y1: yTop,
      y2: yBot,
      h1: headPts(x, yTop, 'u', hs),
      h2: headPts(x, yBot, 'd', hs),
      lx: lx,
      ly: (yTop + yBot) / 2 + 5,
      anchor: anchor,
      text: text,
      hx: hitL,
      hy: yTop - 10,
      hw: hitR - hitL,
      hh: len + 20
    };
  }

  function flipAway(px) {
    if (px > 490) return true;
    if (Math.abs(px - 280) < 80) return px < 280;
    return false;
  }

  function pad(list, n) {
    var out = [];
    var i;
    for (i = 0; i < n; i++) out.push(list[i] || null);
    return out;
  }

  function crestMark(px, py, text, place) {
    var bw = text === '골' ? 30 : 44;
    if (place === 'above') {
      return {
        x: px, y: py, text: text, lx: 0, ly: -16, anchor: 'middle',
        bx: -bw / 2, by: -33, bw: bw, bh: 20, bg: !!text
      };
    }
    var left = place === 'left';
    var lx = left ? -18 : 18;
    var bx = left ? lx - bw + 3 : lx - 3;
    return {
      x: px, y: py, text: text, lx: lx, ly: 5, anchor: left ? 'end' : 'start',
      bx: bx, by: -12, bw: bw, bh: 20, bg: !!text
    };
  }

  function geomSpace(v, t) {
    var crests = phaseXs(v.wl, v.f, t, 0.25, 0, 8);
    var troughs = phaseXs(v.wl, v.f, t, 0.75, 0, 8);
    var pair = pickSpan(crests, v.wl, 8, function (m) { return SPACE_OX + m * SX; }, 42);
    var ampI = closestIndex(crests, 4, 0.45);
    var labI = -1;
    var i, px, py, m;
    if (pair) labI = closestIndex(crests, pair[0], 0);
    var cMarks = [];
    py = SPACE_OY - v.amp * SY;
    for (i = 0; i < crests.length && i < N_MARK; i++) {
      px = SPACE_OX + crests[i] * SX;
      cMarks.push(crestMark(px, py, i === labI ? '마루' : '', px > 500 ? 'left' : 'right'));
    }
    var tMarks = [];
    var tLab = closestIndex(troughs, 4, 0);
    py = SPACE_OY + v.amp * SY;
    for (i = 0; i < troughs.length && i < N_MARK; i++) {
      px = SPACE_OX + troughs[i] * SX;
      tMarks.push(crestMark(px, py, i === tLab ? '골' : '', flipAway(px) ? 'left' : 'right'));
    }
    var amp = null;
    if (ampI >= 0) {
      m = crests[ampI];
      px = SPACE_OX + m * SX;
      var side = m >= 4 ? 1 : -1;
      var ax = px + side * 22;
      if (ax > 508) { side = -1; ax = px - 22; }
      if (ax < 56) { side = 1; ax = px + 22; }
      amp = makeVArrow(ax, SPACE_OY - v.amp * SY, SPACE_OY, '진폭 A', side);
      amp.bx1 = px + side * 10;
      amp.bx2 = ax - side * 2;
      amp.by = SPACE_OY - v.amp * SY;
    }
    var wl = emptyHArrow();
    if (pair) {
      wl = makeHArrow(SPACE_OX + pair[0] * SX, SPACE_OX + pair[1] * SX, 92, '파장 λ', 76);
    }
    var meds = [];
    for (i = 0; i < MED_M.length; i++) {
      meds.push({
        x: SPACE_OX + MED_M[i] * SX,
        y: SPACE_OY - yAt(MED_M[i], t, v) * SY
      });
    }
    return {
      curve: sinePath(SPACE_OX, SPACE_OX + 8 * SX, 4, function (x) {
        return SPACE_OY - yAt((x - SPACE_OX) / SX, t, v) * SY;
      }),
      crests: pad(cMarks, N_MARK),
      troughs: pad(tMarks, N_MARK),
      amp: amp,
      wl: wl,
      meds: meds,
      py: SPACE_OY - yAt(4, t, v) * SY,
      yTop: SPACE_OY - v.amp * SY,
      yBot: SPACE_OY + v.amp * SY
    };
  }

  function geomTime(v, t) {
    var f = v.f;
    var t1 = 0.25 / f;
    var t2 = 1.25 / f;
    var crestT = [];
    var troughT = [];
    var k, tt;
    for (k = 0; k < 16; k++) {
      tt = (k + 0.25) / f;
      if (tt > 4 + 1e-6) break;
      if (tt >= -1e-6) crestT.push(tt);
    }
    for (k = 0; k < 16; k++) {
      tt = (k + 0.75) / f;
      if (tt > 4 + 1e-6) break;
      if (tt >= -1e-6) troughT.push(tt);
    }
    var cy = TIME_OY - v.amp * SY;
    var ty = TIME_OY + v.amp * SY;
    var cMarks = [];
    var tMarks = [];
    var i, px;
    for (i = 0; i < crestT.length && i < N_MARK; i++) {
      px = TIME_OX + crestT[i] * TIME_SX;
      cMarks.push(crestMark(px, cy, i === 0 ? '마루' : '', i === 0 ? 'above' : (px > 470 ? 'left' : 'right')));
    }
    var tLab = 0;
    for (i = 0; i < troughT.length && i < N_MARK; i++) {
      px = TIME_OX + troughT[i] * TIME_SX;
      tMarks.push(crestMark(px, ty, i === tLab ? '골' : '', px > 470 ? 'left' : 'right'));
    }
    var ampT = crestT.length > 1 ? crestT[1] : t1;
    var ampPx = TIME_OX + ampT * TIME_SX;
    var ax = ampPx + 22;
    var side = 1;
    if (ax > 486) { side = -1; ax = ampPx - 22; }
    var amp = makeVArrow(ax, cy, TIME_OY, '진폭 A', side);
    amp.bx1 = ampPx + side * 10;
    amp.bx2 = ax - side * 2;
    amp.by = cy;
    var per = makeHArrow(
      TIME_OX + t1 * TIME_SX,
      TIME_OX + t2 * TIME_SX,
      64,
      '주기 T = ' + fmtT(1 / f) + ' s',
      46
    );
    var tCur = mod(t, 4);
    var nx = TIME_OX + tCur * TIME_SX;
    var ny = TIME_OY - v.amp * Math.sin(2 * Math.PI * f * tCur) * SY;
    return {
      curve: sinePath(TIME_OX, TIME_OX + 4 * TIME_SX, 4, function (x) {
        var u = (x - TIME_OX) / TIME_SX;
        return TIME_OY - v.amp * Math.sin(2 * Math.PI * f * u) * SY;
      }),
      crests: pad(cMarks, N_MARK),
      troughs: pad(tMarks, N_MARK),
      amp: amp,
      per: per,
      freq: 'f = 1/T = ' + fmt1(f) + ' Hz',
      nx: nx,
      ny: ny,
      yTop: TIME_OY - v.amp * SY,
      yBot: TIME_OY + v.amp * SY
    };
  }

  function longDots(v, t) {
    var A = longAmpPx(v.amp);
    var gray = [];
    var redX = LONG_OX + 4 * SX;
    var row, col, x0, s, x;
    for (row = 0; row < LONG_ROWS.length; row++) {
      for (col = 0; col < 80; col++) {
        x0 = col / 10;
        s = A * Math.sin(2 * Math.PI * (x0 / v.wl - v.f * t));
        x = LONG_OX + x0 * SX + s;
        if (col === 40) redX = x;
        else gray.push([x, LONG_ROWS[row]]);
      }
    }
    return { gray: gray, redX: redX, A: A };
  }

  function geomLong(v, t) {
    var comps = phaseXs(v.wl, v.f, t, 0.5, 0, 8);
    var rares = phaseXs(v.wl, v.f, t, 0, 0, 8);
    var pair = pickSpan(comps, v.wl, 8, function (m) { return LONG_OX + m * SX; }, 42);
    var labC = pair ? pair[0] : (comps.length ? comps[0] : null);
    var labR = null;
    var i, d, best, bestD, mid;
    if (pair) {
      mid = (pair[0] + pair[1]) / 2;
      bestD = 1e9;
      best = null;
      for (i = 0; i < rares.length; i++) {
        d = Math.abs(rares[i] - mid);
        if (d < bestD) { bestD = d; best = rares[i]; }
      }
      labR = best;
    } else if (rares.length) labR = rares[Math.floor(rares.length / 2)];
    var cPx = labC == null ? null : LONG_OX + labC * SX;
    var rPx = labR == null ? null : LONG_OX + labR * SX;
    var bw = bandW(v.wl);
    function pack(xs, labelAt, text, otherPx) {
      var out = [];
      var j, px, sd, on;
      for (j = 0; j < xs.length && j < N_MARK; j++) {
        px = LONG_OX + xs[j] * SX;
        on = labelAt != null && Math.abs(xs[j] - labelAt) < 1e-4;
        sd = sideOf(px, on ? otherPx : null, 20);
        out.push({ x: px, text: on ? text : '', lx: sd.lx, anchor: sd.anchor, bw: bw });
      }
      return out;
    }
    var wl = emptyHArrow();
    if (pair) {
      wl = makeHArrow(LONG_OX + pair[0] * SX, LONG_OX + pair[1] * SX, 68, '파장 λ', 50);
    }
    var dots = longDots(v, t);
    return {
      comps: pad(pack(comps, labC, '밀', rPx), N_MARK),
      rares: pad(pack(rares, labR, '소', cPx), N_MARK),
      wl: wl,
      dots: dots,
      bw: bw
    };
  }

  function hit(x, y, w, h) {
    return '<rect class="fgx-hit" x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) + '" fill="transparent" style="pointer-events:all"/>';
  }

  function speedCard(text) {
    return '<g data-part="speed">' +
      '<rect x="24" y="' + CARD_Y + '" width="512" height="' + CARD_H + '" rx="12" fill="' + ELEV + '" stroke="' + LINE + '" stroke-width="1.5"/>' +
      hit(24, CARD_Y, 512, CARD_H) +
      '<text class="js-speed" x="280" y="' + CARD_TY + '" text-anchor="middle" font-size="18" font-weight="700" fill="' + INK + '">' + text + '</text>' +
      '</g>';
  }

  function dirGroup(x1, y) {
    return '<g data-part="direction">' +
      '<text x="' + (x1 - 8) + '" y="' + (y + 5) + '" text-anchor="end" font-size="16" font-weight="700" fill="' + C4 + '">진행 방향</text>' +
      '<line x1="' + x1 + '" y1="' + y + '" x2="' + (x1 + 80) + '" y2="' + y + '" stroke="' + C4 + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<polygon points="' + headPts(x1 + 80, y, 'r', 9) + '" fill="' + C4 + '"/>' +
      hit(x1 - 78, y - 16, 176, 32) +
      '</g>';
  }

  function chip(part, x, y, w, h, fill, stroke, tfill, text, fs) {
    var open = part ? '<g data-part="' + part + '">' : '<g>';
    return open +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1.5"/>' +
      hit(x, y, w, h) +
      '<text x="' + (x + w / 2) + '" y="' + (y + h - 8) + '" text-anchor="middle" font-size="' + fs + '" font-weight="700" fill="' + tfill + '">' + text + '</text>' +
      '</g>';
  }

  function xAxis(ox, sx, vals, y, unit) {
    var s = '';
    var i, x;
    for (i = 0; i < vals.length; i++) {
      x = ox + vals[i] * sx;
      s += '<line x1="' + r1(x) + '" y1="' + (y - 16) + '" x2="' + r1(x) + '" y2="' + (y - 8) + '" stroke="' + C8 + '" stroke-width="1.5" stroke-linecap="round"/>';
      s += '<text x="' + r1(x) + '" y="' + y + '" text-anchor="middle" font-size="15" fill="' + DIM + '">' + vals[i] + '</text>';
    }
    s += '<text x="' + r1(ox + vals[vals.length - 1] * sx + 18) + '" y="' + y + '" font-size="15" fill="' + DIM + '">' + unit + '</text>';
    return s;
  }

  function scaleMarks(ox, yTop, yBot) {
    return '<g class="js-scale">' +
      '<line class="js-axis" x1="' + r1(ox) + '" y1="' + r1(yTop - 8) + '" x2="' + r1(ox) + '" y2="' + r1(yBot + 8) + '" stroke="' + C8 + '" stroke-width="1.5" stroke-linecap="round"/>' +
      '<line class="js-tp" x1="' + r1(ox - 8) + '" y1="' + r1(yTop) + '" x2="' + r1(ox) + '" y2="' + r1(yTop) + '" stroke="' + DIM + '" stroke-width="1.5" stroke-linecap="round"/>' +
      '<text class="js-tpl" x="' + r1(ox - 12) + '" y="' + r1(yTop + 5) + '" font-size="15" font-weight="700" fill="' + INK + '" text-anchor="end">+A</text>' +
      '<line class="js-tn" x1="' + r1(ox - 8) + '" y1="' + r1(yBot) + '" x2="' + r1(ox) + '" y2="' + r1(yBot) + '" stroke="' + DIM + '" stroke-width="1.5" stroke-linecap="round"/>' +
      '<text class="js-tnl" x="' + r1(ox - 12) + '" y="' + r1(yBot + 5) + '" font-size="15" font-weight="700" fill="' + INK + '" text-anchor="end">−A</text>' +
      '</g>';
  }

  function markSlots(cls, part, color, marks) {
    var s = '';
    var i, m, on, bgOn;
    for (i = 0; i < N_MARK; i++) {
      m = marks[i];
      on = !!m;
      bgOn = on && m.bg;
      s += '<g class="' + cls + '" data-part="' + part + '"' + (on ? '' : ' display="none"') + ' transform="translate(' + r1(on ? m.x : 0) + ',' + r1(on ? m.y : 0) + ')">' +
        '<circle r="6" fill="' + color + '" stroke="' + CARD + '" stroke-width="2"/>' +
        '<rect class="js-bg" x="' + r1(on ? m.bx : 0) + '" y="' + r1(on ? m.by : 0) + '" width="' + r1(on ? m.bw : 0) + '" height="' + r1(on ? m.bh : 0) + '" rx="4" fill="' + CARD + '"' + (bgOn ? '' : ' display="none"') + '/>' +
        '<text class="js-lab" x="' + (on ? m.lx : 0) + '" y="' + (on ? m.ly : 0) + '" text-anchor="' + (on ? m.anchor : 'start') + '" font-size="16" font-weight="700" fill="' + color + '">' + (on && m.text ? m.text : '') + '</text>' +
        hit(-40, -16, 84, 34) +
        '</g>';
    }
    return s;
  }

  function arrowH(cls, part, color, a) {
    if (!a) a = emptyHArrow();
    return '<g class="' + cls + '" data-part="' + part + '"' + (a.show ? '' : ' display="none"') + '>' +
      '<line class="js-ln" x1="' + r1(a.x1) + '" y1="' + r1(a.y) + '" x2="' + r1(a.x2) + '" y2="' + r1(a.y) + '" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round"/>' +
      '<polygon class="js-h1" points="' + a.h1 + '" fill="' + color + '"/>' +
      '<polygon class="js-h2" points="' + a.h2 + '" fill="' + color + '"/>' +
      '<text class="js-lab" x="' + r1(a.lx) + '" y="' + r1(a.ly) + '" text-anchor="middle" font-size="16" font-weight="700" fill="' + color + '">' + (a.text || '') + '</text>' +
      '<rect class="fgx-hit js-hit" x="' + r1(a.hx) + '" y="' + r1(a.hy) + '" width="' + r1(Math.max(20, a.hw)) + '" height="' + r1(Math.max(20, a.hh)) + '" fill="transparent" style="pointer-events:all"/>' +
      '</g>';
  }

  function arrowV(color, a) {
    if (!a) a = { show: false, x: 0, y1: 0, y2: 0, h1: '0,0 0,0 0,0', h2: '0,0 0,0 0,0', lx: 0, ly: 0, anchor: 'start', text: '', hx: 0, hy: 0, hw: 0, hh: 0, bx1: 0, bx2: 0, by: 0 };
    var bw = 58;
    var bx = a.anchor === 'start' ? a.lx - 4 : a.lx - bw + 4;
    return '<g class="js-amp" data-part="amplitude"' + (a.show ? '' : ' display="none"') + '>' +
      '<line class="js-bridge" x1="' + r1(a.bx1 || 0) + '" y1="' + r1(a.by || 0) + '" x2="' + r1(a.bx2 || 0) + '" y2="' + r1(a.by || 0) + '" stroke="' + color + '" stroke-width="1.5" stroke-dasharray="2 3" stroke-linecap="round"/>' +
      '<line class="js-ln" x1="' + r1(a.x) + '" y1="' + r1(a.y1) + '" x2="' + r1(a.x) + '" y2="' + r1(a.y2) + '" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round"/>' +
      '<polygon class="js-h1" points="' + a.h1 + '" fill="' + color + '"/>' +
      '<polygon class="js-h2" points="' + a.h2 + '" fill="' + color + '"/>' +
      '<rect class="js-bg" x="' + r1(bx) + '" y="' + r1(a.ly - 15) + '" width="' + bw + '" height="20" rx="4" fill="' + CARD + '"/>' +
      '<text class="js-lab" x="' + r1(a.lx) + '" y="' + r1(a.ly) + '" text-anchor="' + a.anchor + '" font-size="16" font-weight="700" fill="' + color + '">' + (a.text || '') + '</text>' +
      '<rect class="fgx-hit js-hit" x="' + r1(a.hx) + '" y="' + r1(a.hy) + '" width="' + r1(Math.max(20, a.hw)) + '" height="' + r1(Math.max(20, a.hh)) + '" fill="transparent" style="pointer-events:all"/>' +
      '</g>';
  }

  function denseSlots(cls, part, color, marks) {
    var s = '';
    var i, m, on, soft;
    soft = color === C2 ? C2S : C6S;
    for (i = 0; i < N_MARK; i++) {
      m = marks[i];
      on = !!m;
      s += '<g class="' + cls + '" data-part="' + part + '"' + (on ? '' : ' display="none"') + ' transform="translate(' + r1(on ? m.x : 0) + ',0)">' +
        '<rect class="js-band" x="' + r1(on ? -m.bw / 2 : 0) + '" y="124" width="' + r1(on ? m.bw : 0) + '" height="134" rx="8" fill="' + soft + '"/>' +
        '<polygon class="js-tri" points="0,118 -8,106 8,106" fill="' + color + '"/>' +
        '<text class="js-lab" x="' + (on ? m.lx : 0) + '" y="98" text-anchor="' + (on ? m.anchor : 'middle') + '" font-size="16" font-weight="700" fill="' + color + '">' + (on && m.text ? m.text : '') + '</text>' +
        hit(-16, 88, 32, 40) +
        '</g>';
    }
    return s;
  }

  function applyShow(el, on) {
    if (!el) return;
    if (on) el.removeAttribute('display');
    else el.setAttribute('display', 'none');
  }

  function applyMarks(nodes, marks) {
    var i, g, m, lab, bg;
    for (i = 0; i < nodes.length; i++) {
      g = nodes[i];
      m = marks[i];
      if (!m) { applyShow(g, false); continue; }
      applyShow(g, true);
      g.setAttribute('transform', 'translate(' + r1(m.x) + ',' + r1(m.y) + ')');
      lab = g.querySelector('.js-lab');
      bg = g.querySelector('.js-bg');
      if (lab) {
        lab.textContent = m.text || '';
        lab.setAttribute('x', String(m.lx));
        lab.setAttribute('y', String(m.ly));
        lab.setAttribute('text-anchor', m.anchor);
      }
      if (bg) {
        if (m.bg) {
          applyShow(bg, true);
          bg.setAttribute('x', r1(m.bx));
          bg.setAttribute('y', r1(m.by));
          bg.setAttribute('width', r1(m.bw));
          bg.setAttribute('height', r1(m.bh));
        } else applyShow(bg, false);
      }
    }
  }

  function applyHArrow(g, a) {
    if (!g) return;
    applyShow(g, a && a.show);
    if (!a || !a.show) return;
    var ln = g.querySelector('.js-ln');
    ln.setAttribute('x1', r1(a.x1));
    ln.setAttribute('y1', r1(a.y));
    ln.setAttribute('x2', r1(a.x2));
    ln.setAttribute('y2', r1(a.y));
    g.querySelector('.js-h1').setAttribute('points', a.h1);
    g.querySelector('.js-h2').setAttribute('points', a.h2);
    var lab = g.querySelector('.js-lab');
    lab.setAttribute('x', r1(a.lx));
    lab.setAttribute('y', r1(a.ly));
    lab.textContent = a.text;
    var hitR = g.querySelector('.js-hit');
    hitR.setAttribute('x', r1(a.hx));
    hitR.setAttribute('y', r1(a.hy));
    hitR.setAttribute('width', r1(Math.max(20, a.hw)));
    hitR.setAttribute('height', r1(Math.max(20, a.hh)));
  }

  function applyVArrow(g, a) {
    if (!g) return;
    applyShow(g, !!(a && a.show));
    if (!a || !a.show) return;
    var ln = g.querySelector('.js-ln');
    ln.setAttribute('x1', r1(a.x));
    ln.setAttribute('x2', r1(a.x));
    ln.setAttribute('y1', r1(a.y1));
    ln.setAttribute('y2', r1(a.y2));
    g.querySelector('.js-h1').setAttribute('points', a.h1);
    g.querySelector('.js-h2').setAttribute('points', a.h2);
    var bridge = g.querySelector('.js-bridge');
    if (bridge && a.bx1 != null) {
      bridge.setAttribute('x1', r1(a.bx1));
      bridge.setAttribute('x2', r1(a.bx2));
      bridge.setAttribute('y1', r1(a.by));
      bridge.setAttribute('y2', r1(a.by));
    }
    var lab = g.querySelector('.js-lab');
    lab.setAttribute('x', r1(a.lx));
    lab.setAttribute('y', r1(a.ly));
    lab.setAttribute('text-anchor', a.anchor);
    lab.textContent = a.text;
    var bg = g.querySelector('.js-bg');
    var bw = 58;
    var bx = a.anchor === 'start' ? a.lx - 4 : a.lx - bw + 4;
    bg.setAttribute('x', r1(bx));
    bg.setAttribute('y', r1(a.ly - 15));
    bg.setAttribute('width', r1(bw));
    bg.setAttribute('height', '20');
    var hitR = g.querySelector('.js-hit');
    hitR.setAttribute('x', r1(a.hx));
    hitR.setAttribute('y', r1(a.hy));
    hitR.setAttribute('width', r1(Math.max(20, a.hw)));
    hitR.setAttribute('height', r1(Math.max(20, a.hh)));
  }

  function applyScale(svg, ox, oy, yTop, yBot) {
    var axis = svg.querySelector('.js-axis');
    var tp = svg.querySelector('.js-tp');
    var tn = svg.querySelector('.js-tn');
    var tpl = svg.querySelector('.js-tpl');
    var tnl = svg.querySelector('.js-tnl');
    if (axis) {
      axis.setAttribute('x1', r1(ox));
      axis.setAttribute('x2', r1(ox));
      axis.setAttribute('y1', r1(yTop - 8));
      axis.setAttribute('y2', r1(yBot + 8));
    }
    if (tp) {
      tp.setAttribute('x1', r1(ox - 8));
      tp.setAttribute('x2', r1(ox));
      tp.setAttribute('y1', r1(yTop));
      tp.setAttribute('y2', r1(yTop));
    }
    if (tn) {
      tn.setAttribute('x1', r1(ox - 8));
      tn.setAttribute('x2', r1(ox));
      tn.setAttribute('y1', r1(yBot));
      tn.setAttribute('y2', r1(yBot));
    }
    if (tpl) {
      tpl.setAttribute('x', r1(ox - 12));
      tpl.setAttribute('y', r1(yTop + 5));
    }
    if (tnl) {
      tnl.setAttribute('x', r1(ox - 12));
      tnl.setAttribute('y', r1(yBot + 5));
    }
  }

  function applyDense(nodes, marks) {
    var i, g, m, lab, band;
    for (i = 0; i < nodes.length; i++) {
      g = nodes[i];
      m = marks[i];
      if (!m) { applyShow(g, false); continue; }
      applyShow(g, true);
      g.setAttribute('transform', 'translate(' + r1(m.x) + ',0)');
      band = g.querySelector('.js-band');
      if (band) {
        band.setAttribute('x', r1(-m.bw / 2));
        band.setAttribute('width', r1(m.bw));
      }
      lab = g.querySelector('.js-lab');
      if (lab) {
        lab.textContent = m.text || '';
        lab.setAttribute('x', String(m.lx));
        lab.setAttribute('text-anchor', m.anchor);
      }
    }
  }

  function renderSpace(v) {
    var g = geomSpace(v, 0);
    var n = v;
    var med = '';
    var i;
    for (i = 0; i < g.meds.length; i++) {
      med += '<circle class="js-med" cx="' + r1(g.meds[i].x) + '" cy="' + r1(g.meds[i].y) + '" r="3" fill="' + C8 + '"/>';
      med += '<circle class="js-medhit" cx="' + r1(g.meds[i].x) + '" cy="' + r1(g.meds[i].y) + '" r="10" fill="transparent" style="pointer-events:all"/>';
    }
    return STYLE +
      '<g data-part="equilibrium">' +
      '<line x1="40" y1="190" x2="520" y2="190" stroke="' + C8 + '" stroke-width="1.75" stroke-dasharray="6 5" stroke-linecap="round"/>' +
      hit(40, 181, 480, 18) +
      '<line x1="16" y1="21" x2="42" y2="21" stroke="' + C8 + '" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round"/>' +
      '<text x="48" y="26" font-size="15" fill="' + DIM + '">평형 위치</text>' +
      hit(12, 8, 118, 26) +
      '</g>' +
      scaleMarks(SPACE_OX, g.yTop, g.yBot) +
      xAxis(SPACE_OX, SX, [0, 2, 4, 6, 8], 294, 'm') +
      '<line class="js-rail" x1="280" y1="' + r1(g.yTop) + '" x2="280" y2="' + r1(g.yBot) + '" stroke="' + C2 + '" stroke-width="1.5" stroke-dasharray="3 4" stroke-linecap="round"/>' +
      '<path class="js-curve" d="' + g.curve + '" fill="none" stroke="' + C1 + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<g data-part="medium">' + med +
      '<text x="168" y="26" font-size="16" font-weight="700" fill="' + C8 + '">매질</text>' +
      hit(160, 8, 44, 22) +
      '</g>' +
      '<g data-part="particle">' +
      '<circle class="js-p" cx="280" cy="' + r1(g.py) + '" r="7" fill="' + C2 + '" stroke="' + CARD + '" stroke-width="2"/>' +
      '<rect class="js-phit fgx-hit" x="266" y="' + r1(g.py - 14) + '" width="28" height="28" fill="transparent" style="pointer-events:all"/>' +
      '</g>' +
      markSlots('js-trough', 'trough', C1, g.troughs) +
      markSlots('js-crest', 'crest', C2, g.crests) +
      arrowV(C3, g.amp) +
      arrowH('js-wl', 'wavelength', C5, g.wl) +
      dirGroup(448, 48) +
      chip('transverse', 378, 8, 168, 26, C1S, C1, C1, '횡파: 진동 ⊥ 진행', 15) +
      '<text x="28" y="318" font-size="15" fill="' + DIM + '">매질의 점은 제자리에서 위아래로만 진동</text>' +
      speedCard(speedLine(n));
  }

  function renderTime(v) {
    var g = geomTime(v, 0);
    return STYLE +
      chip('', 16, 6, 308, 24, ELEV, LINE, DIM, '※ 파장은 이 그래프에서 읽을 수 없다', 15) +
      '<g data-part="equilibrium">' +
      '<line x1="60" y1="170" x2="500" y2="170" stroke="' + C8 + '" stroke-width="1.75" stroke-dasharray="6 5" stroke-linecap="round"/>' +
      hit(60, 161, 440, 18) +
      '<line x1="400" y1="21" x2="426" y2="21" stroke="' + C8 + '" stroke-width="2" stroke-dasharray="4 3" stroke-linecap="round"/>' +
      '<text x="432" y="26" font-size="15" fill="' + DIM + '">평형 위치</text>' +
      hit(396, 8, 120, 26) +
      '</g>' +
      scaleMarks(TIME_OX, g.yTop, g.yBot) +
      xAxis(TIME_OX, TIME_SX, [0, 1, 2, 3, 4], 272, 's') +
      '<path class="js-curve" d="' + g.curve + '" fill="none" stroke="' + C1 + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>' +
      markSlots('js-trough', 'trough', C1, g.troughs) +
      markSlots('js-crest', 'crest', C2, g.crests) +
      arrowV(C3, g.amp) +
      arrowH('js-per', 'period', C5, g.per) +
      '<g class="js-now" data-part="particle">' +
      '<line class="js-vline" x1="' + r1(g.nx) + '" y1="96" x2="' + r1(g.nx) + '" y2="248" stroke="' + C2 + '" stroke-width="1.5" stroke-dasharray="4 4" stroke-linecap="round"/>' +
      '<line class="js-conn" x1="506" y1="' + r1(g.ny) + '" x2="520" y2="' + r1(g.ny) + '" stroke="' + C2 + '" stroke-width="2" stroke-linecap="round"/>' +
      '<circle class="js-dot" cx="' + r1(g.nx) + '" cy="' + r1(g.ny) + '" r="7" fill="' + C2 + '" stroke="' + CARD + '" stroke-width="2"/>' +
      '<circle class="js-dhit fgx-hit" cx="' + r1(g.nx) + '" cy="' + r1(g.ny) + '" r="14" fill="transparent" style="pointer-events:all"/>' +
      '</g>' +
      '<g data-part="particle" class="js-railp">' +
      '<line x1="528" y1="100" x2="528" y2="240" stroke="' + C8 + '" stroke-width="1.5" stroke-linecap="round"/>' +
      '<circle class="js-rdot" cx="528" cy="' + r1(g.ny) + '" r="6" fill="' + C2 + '" stroke="' + CARD + '" stroke-width="2"/>' +
      '<text x="528" y="90" text-anchor="middle" font-size="15" font-weight="700" fill="' + C2 + '">입자</text>' +
      hit(512, 78, 32, 170) +
      '</g>' +
      '<g data-part="frequency">' +
      '<rect class="js-freqbg" x="60" y="286" width="230" height="28" rx="8" fill="' + C5S + '" stroke="' + C5 + '" stroke-width="1.5"/>' +
      hit(60, 286, 230, 28) +
      '<text class="js-freq" x="175" y="305" text-anchor="middle" font-size="16" font-weight="700" fill="' + C5 + '">' + g.freq + '</text>' +
      '</g>' +
      speedCard(speedLine(v));
  }

  function speaker() {
    return '<g>' +
      '<rect x="8" y="174" width="13" height="26" rx="2" fill="' + C8 + '"/>' +
      '<polygon points="21,180 34,168 34,206 21,194" fill="' + C1 + '"/>' +
      '<path d="M38 176 q8 11 0 22" fill="none" stroke="' + C6 + '" stroke-width="2" stroke-linecap="round"/>' +
      '</g>';
  }

  function renderLong(v) {
    var g = geomLong(v, 0);
    var dots = g.dots;
    var i, circles = '';
    for (i = 0; i < dots.gray.length; i++) {
      circles += '<circle class="js-dot" cx="' + r1(dots.gray[i][0]) + '" cy="' + r1(dots.gray[i][1]) + '" r="2.2" fill="' + C8 + '"/>';
    }
    var reds = '';
    for (i = 0; i < LONG_ROWS.length; i++) {
      reds += '<circle cy="' + LONG_ROWS[i] + '" r="3.6" fill="' + C2 + '" stroke="' + CARD + '" stroke-width="1.25"/>';
    }
    return STYLE +
      chip('longitudinal', 372, 8, 172, 26, C6S, C6, C6, '종파: 진동 ∥ 진행', 15) +
      speaker() +
      '<g data-part="medium">' + circles +
      hit(LONG_OX - 6, 124, 8 * SX + 12, 136) +
      '<text x="56" y="286" font-size="16" font-weight="700" fill="' + C8 + '">매질(공기)</text>' +
      hit(52, 268, 100, 24) +
      '</g>' +
      denseSlots('js-comp', 'compression', C2, g.comps) +
      denseSlots('js-rare', 'rarefaction', C6, g.rares) +
      '<g data-part="particle" class="js-col" transform="translate(' + r1(dots.redX) + ',0)">' +
      reds +
      hit(-12, 116, 24, 148) +
      '</g>' +
      arrowH('js-wl', 'wavelength', C5, g.wl) +
      dirGroup(420, 280) +
      speedCard(speedLine(v));
  }

  function paintSpace(svg, g) {
    var curve = svg.querySelector('.js-curve');
    if (curve) curve.setAttribute('d', g.curve);
    var meds = svg.querySelectorAll('.js-med');
    var hits = svg.querySelectorAll('.js-medhit');
    var i;
    for (i = 0; i < meds.length; i++) {
      if (!g.meds[i]) break;
      meds[i].setAttribute('cy', r1(g.meds[i].y));
      if (hits[i]) hits[i].setAttribute('cy', r1(g.meds[i].y));
    }
    var rail = svg.querySelector('.js-rail');
    if (rail) {
      rail.setAttribute('x1', '280');
      rail.setAttribute('x2', '280');
      rail.setAttribute('y1', r1(g.yTop));
      rail.setAttribute('y2', r1(g.yBot));
    }
    var p = svg.querySelector('.js-p');
    var ph = svg.querySelector('.js-phit');
    if (p) {
      p.setAttribute('cx', '280');
      p.setAttribute('cy', r1(g.py));
    }
    if (ph) {
      ph.setAttribute('x', '266');
      ph.setAttribute('y', r1(g.py - 14));
    }
    applyScale(svg, SPACE_OX, SPACE_OY, g.yTop, g.yBot);
    applyMarks(svg.querySelectorAll('.js-crest'), g.crests);
    applyMarks(svg.querySelectorAll('.js-trough'), g.troughs);
    applyVArrow(svg.querySelector('.js-amp'), g.amp);
    applyHArrow(svg.querySelector('.js-wl'), g.wl);
  }

  function paintTime(svg, g) {
    var curve = svg.querySelector('.js-curve');
    if (curve) curve.setAttribute('d', g.curve);
    applyScale(svg, TIME_OX, TIME_OY, g.yTop, g.yBot);
    applyMarks(svg.querySelectorAll('.js-crest'), g.crests);
    applyMarks(svg.querySelectorAll('.js-trough'), g.troughs);
    applyVArrow(svg.querySelector('.js-amp'), g.amp);
    applyHArrow(svg.querySelector('.js-per'), g.per);
    var freq = svg.querySelector('.js-freq');
    if (freq) freq.textContent = g.freq;
    var vline = svg.querySelector('.js-vline');
    if (vline) {
      vline.setAttribute('x1', r1(g.nx));
      vline.setAttribute('x2', r1(g.nx));
      vline.setAttribute('y1', '96');
      vline.setAttribute('y2', '248');
    }
    var conn = svg.querySelector('.js-conn');
    if (conn) {
      conn.setAttribute('x1', '506');
      conn.setAttribute('y1', r1(g.ny));
      conn.setAttribute('x2', '520');
      conn.setAttribute('y2', r1(g.ny));
    }
    var dot = svg.querySelector('.js-dot');
    var dh = svg.querySelector('.js-dhit');
    if (dot) {
      dot.setAttribute('cx', r1(g.nx));
      dot.setAttribute('cy', r1(g.ny));
    }
    if (dh) {
      dh.setAttribute('cx', r1(g.nx));
      dh.setAttribute('cy', r1(g.ny));
    }
    var rd = svg.querySelector('.js-rdot');
    if (rd) rd.setAttribute('cy', r1(g.ny));
  }

  function paintLong(svg, g) {
    var dots = svg.querySelectorAll('.js-dot');
    var i;
    for (i = 0; i < dots.length; i++) {
      if (!g.dots.gray[i]) break;
      dots[i].setAttribute('cx', r1(g.dots.gray[i][0]));
      dots[i].setAttribute('cy', r1(g.dots.gray[i][1]));
    }
    var col = svg.querySelector('.js-col');
    if (col) col.setAttribute('transform', 'translate(' + r1(g.dots.redX) + ',0)');
    applyDense(svg.querySelectorAll('.js-comp'), g.comps);
    applyDense(svg.querySelectorAll('.js-rare'), g.rares);
    applyHArrow(svg.querySelector('.js-wl'), g.wl);
  }

  function build(v, view, t) {
    var n = norm(v);
    var o = { n: n, readout: readoutOf(view, n), speed: speedLine(n) };
    if (view === 'time') o.time = geomTime(n, t);
    else if (view === 'long') o.long = geomLong(n, t);
    else o.space = geomSpace(n, t);
    return o;
  }

  NMFIG.define('wave', {
    viewBox: [560, 400],
    live: true,
    views: [
      { id: 'space', label: '변위–위치 (공간)', hint: '한 순간의 모양. 마루와 마루 사이가 파장 λ.' },
      { id: 'time', label: '변위–시간', hint: '한 지점의 진동. 마루와 마루 사이 시간이 주기 T.' },
      { id: 'long', label: '종파 (소리)', hint: '진행 방향과 나란히 진동. 밀과 밀 사이가 파장.' }
    ],
    controls: [
      { id: 'wl', type: 'range', label: '파장 λ (m)', min: 1, max: 4, step: 0.1, value: 2, fmt: function (v) { return fmt1(v) + ' m'; } },
      { id: 'amp', type: 'range', label: '진폭 A (m)', min: 0.2, max: 1, step: 0.1, value: 0.6, fmt: function (v) { return fmt1(v) + ' m'; } },
      { id: 'f', type: 'range', label: '진동수 f (Hz)', min: 0.5, max: 2, step: 0.1, value: 1, fmt: function (v) { return fmt1(v) + ' Hz'; } }
    ],
    render: function (v, view) {
      var n = norm(v);
      if (view === 'time') return renderTime(n);
      if (view === 'long') return renderLong(n);
      return renderSpace(n);
    },
    update: function (ctx) {
      var t = ctx.time || 0;
      var b = build(ctx.v, ctx.view, t);
      var speed = ctx.svg.querySelector('.js-speed');
      if (speed) speed.textContent = b.speed;
      if (ctx.view === 'time') paintTime(ctx.svg, b.time);
      else if (ctx.view === 'long') paintLong(ctx.svg, b.long);
      else paintSpace(ctx.svg, b.space);
      return { readout: b.readout };
    },
    _calc: function (v, t) {
      var n = norm(v);
      var tt = t == null ? 0 : t;
      return {
        wl: n.wl,
        amp: n.amp,
        f: n.f,
        T: 1 / n.f,
        speed: n.f * n.wl,
        y: function (x) { return yAt(x, tt, n); },
        crests: phaseXs(n.wl, n.f, tt, 0.25, 0, 8),
        troughs: phaseXs(n.wl, n.f, tt, 0.75, 0, 8),
        compression: phaseXs(n.wl, n.f, tt, 0.5, 0, 8),
        rarefaction: phaseXs(n.wl, n.f, tt, 0, 0, 8)
      };
    },
    yAt: function (x, t, v) {
      return yAt(x, t, norm(v));
    }
  });
})(window.NMFIG);
