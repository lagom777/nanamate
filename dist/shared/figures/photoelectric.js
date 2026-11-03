/* 광전 효과 — 장치(광원·금속판·광전자)와 K–f 그래프.
 * 컨트롤: f(×10¹⁴ Hz, 1~14), I(광자 수 1~10), metal(cs/na/zn).
 * hf(eV) = 0.414 × f. h = 4.14×10⁻¹⁵ eV·s.
 * 일함수 W: 세슘 2.1, 나트륨 2.3, 아연 4.3 eV. f₀ = W/0.414.
 * K_max = hf − W(≥0). 정지 전압 V_s = K_max (e = 1).
 * 장치 에너지 막대 55 단위/eV. 그래프 가로 (520−75)/14, 세로 (370−30)/10.5.
 */
(function (NMFIG) {
  'use strict';

  var H_PER_F = 0.414;
  var NMAX = 10;
  var PHOTON_T = 2.8;
  var ELEC_T = 2.4;

  var METAL = {
    cs: { name: '세슘', sym: 'Cs', W: 2.1, plate: '세슘(Cs)' },
    na: { name: '나트륨', sym: 'Na', W: 2.3, plate: '나트륨(Na)' },
    zn: { name: '아연', sym: 'Zn', W: 4.3, plate: '아연(Zn)' }
  };
  var METAL_KEYS = ['cs', 'na', 'zn'];

  /* 장치 좌표 */
  var LAMP = { x: 64, y: 88 };
  var PLATE = { x: 14, y: 372, w: 340, h: 52 };
  var BAR_Y0 = 358;
  var BAR_PX = 55;
  var BAR_AXIS = 404;
  var BAR_X = 412;
  var BAR_W = 28;
  var BAR_LAB = 450;

  /* 그래프 좌표. f 0~14, K 6 ~ −4.5 */
  var GX0 = 75, GX1 = 520, GY_TOP = 30, GY_BOT = 370;
  var F_MAX = 14, K_TOP = 6, K_BOT = -4.5;
  var GSX = (GX1 - GX0) / F_MAX;
  var GSY = (GY_BOT - GY_TOP) / (K_TOP - K_BOT);
  var TRI_F1 = 0.9;
  var CHIP_W = 176;
  var CHIP_H = 30;

  /* 판 위 부채꼴. +는 오른쪽(시계 방향). */
  var FAN = [-30, -18, -6, 6, 16, 26, -24, -12, 8, 20];

  var INK = 'var(--fgx-ink, #1a1f2e)';
  var DIM = 'var(--fgx-dim, #4a5468)';
  var LINE = 'var(--fgx-line, #d5dbe6)';
  var CARD = 'var(--fgx-card, #fff)';
  var ELEV = 'var(--fgx-elev, #f5f7fa)';
  var C1 = 'var(--fgx-c1, #2563eb)';
  var C2 = 'var(--fgx-c2, #dc2626)';
  var C3 = 'var(--fgx-c3, #d97706)';
  var C4 = 'var(--fgx-c4, #16a34a)';
  var C5 = 'var(--fgx-c5, #7c3aed)';
  var C8 = 'var(--fgx-c8, #65748b)';

  var STOPS = [
    { f: 4.0, c: '#e11d1d' },
    { f: 5.0, c: '#f59e0b' },
    { f: 5.5, c: '#16a34a' },
    { f: 6.3, c: '#2563eb' },
    { f: 7.5, c: '#7c3aed' }
  ];

  function n(v) { return Math.round(v * 10) / 10; }
  function n2(v) { return Math.round(v * 100) / 100; }

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function hexRgb(hex) {
    var h = String(hex).replace('#', '');
    return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
  }

  function rgbHex(c) {
    function b(v) {
      var s = String(Math.round(clamp(v, 0, 255)));
      var h = Number(s).toString(16);
      return h.length < 2 ? '0' + h : h;
    }
    return '#' + b(c[0]) + b(c[1]) + b(c[2]);
  }

  function mixHex(a, b, t) {
    var A = hexRgb(a), B = hexRgb(b);
    return rgbHex([
      A[0] + (B[0] - A[0]) * t,
      A[1] + (B[1] - A[1]) * t,
      A[2] + (B[2] - A[2]) * t
    ]);
  }

  function lightColor(f) {
    var x = Number(f);
    if (x !== x) x = 8;
    if (x < 4) return '#7a2e2e';
    if (x > 7.5) return '#8b7fb0';
    var i, a, b, t;
    for (i = 0; i < STOPS.length - 1; i++) {
      a = STOPS[i];
      b = STOPS[i + 1];
      if (x <= b.f) {
        t = (x - a.f) / (b.f - a.f);
        return mixHex(a.c, b.c, t);
      }
    }
    return STOPS[STOPS.length - 1].c;
  }

  function fmt2(cents) {
    var sign = cents < 0 ? '−' : '';
    var a = Math.abs(cents);
    var whole = Math.floor(a / 100);
    var frac = a % 100;
    var s = String(frac);
    if (s.length < 2) s = '0' + s;
    return sign + whole + '.' + s;
  }

  function fmtW(w) {
    return (Math.round(w * 10) / 10).toFixed(1);
  }

  function calc(v) {
    var src = v || {};
    var f = Number(src.f);
    if (f !== f) f = 8;
    f = clamp(Math.round(f * 10) / 10, 1, 14);
    var I = Math.round(Number(src.I));
    if (I !== I) I = 5;
    I = clamp(I, 1, 10);
    var key = METAL[src.metal] ? src.metal : 'na';
    var meta = METAL[key];
    var W = meta.W;
    var eTrue = H_PER_F * f;
    var eCenti = Math.round(eTrue * 100);
    var wCenti = Math.round(W * 100);
    var emit = eTrue >= W - 1e-9;
    var kTrue = emit ? (eTrue - W) : 0;
    var kCenti = emit ? (eCenti - wCenti) : 0;
    var fShow = f.toFixed(1);
    var eShow = fmt2(eCenti);
    var wShow = fmtW(W);
    var kShow = fmt2(kCenti);
    var head;
    if (emit) {
      head = 'hf = 0.414 × ' + fShow + ' = ' + eShow + ' eV  ·  W(' + meta.sym + ') = ' + wShow + ' eV'
        + '\nK_max = hf − W = ' + kShow + ' eV → 광전자 방출 · 광전자 수는 세기에 비례';
    } else {
      head = 'hf = ' + eShow + ' eV < W = ' + wShow + ' eV → 광전자 방출 없음 (세기를 높여도, 오래 비춰도 마찬가지)';
    }
    var slope = '기울기 h = 0.414 eV/(10¹⁴ Hz) = 4.14×10⁻¹⁵ eV·s (금속과 무관)';
    return {
      f: f, I: I, key: key,
      name: meta.name, sym: meta.sym, plate: meta.plate,
      E: eTrue, W: W, f0: W / H_PER_F, K: kTrue,
      emit: emit,
      color: lightColor(f),
      dashed: (f < 4 || f > 7.5),
      pale: mixHex(lightColor(f), '#ffffff', 0.78),
      eShow: eShow, kShow: kShow, wShow: wShow, fShow: fShow,
      readoutDevice: head,
      readoutGraph: head + '\n' + slope
    };
  }

  function gX(f) { return GX0 + f * GSX; }
  function gY(k) { return GY_TOP + (K_TOP - k) * GSY; }
  function kOf(f, W) { return H_PER_F * f - W; }
  function yEv(E) { return BAR_Y0 - E * BAR_PX; }

  function seg(f1, f2, W) {
    return 'M' + n(gX(f1)) + ' ' + n(gY(kOf(f1, W))) + 'L' + n(gX(f2)) + ' ' + n(gY(kOf(f2, W)));
  }

  function waveD(f) {
    var cycles = Math.max(1, f * 0.26);
    var len = 24;
    var amp = 5;
    var steps = Math.max(10, Math.round(cycles * 9));
    var d = '';
    var i, t, x, y;
    for (i = 0; i <= steps; i++) {
      t = i / steps;
      x = -len / 2 + t * len;
      y = -Math.sin(t * cycles * Math.PI * 2) * amp;
      d += (i ? 'L' : 'M') + n(x) + ' ' + n(y);
    }
    return d;
  }

  function slotEnds(i) {
    return {
      x0: 86 + (i - 4.5) * 2.4,
      y0: 108,
      x1: 132 + i * 17.6,
      y1: PLATE.y - 6
    };
  }

  function slotPoint(i, p) {
    var e = slotEnds(i);
    return {
      x: e.x0 + (e.x1 - e.x0) * p,
      y: e.y0 + (e.y1 - e.y0) * p,
      ang: Math.atan2(e.y1 - e.y0, e.x1 - e.x0) * 180 / Math.PI,
      hitX: e.x1,
      hitY: PLATE.y
    };
  }

  function elecPos(i, age, K) {
    var e = slotEnds(i);
    var ang = FAN[i] * Math.PI / 180;
    var dist = Math.sqrt(Math.max(K, 0)) * 64 * age;
    var x = e.x1 + Math.sin(ang) * dist;
    var y = PLATE.y - Math.cos(ang) * dist;
    if (x < 20) x = 20;
    if (x > 348) x = 348;
    if (y < 132) y = 132;
    return { x: x, y: y, dist: dist };
  }

  function styleOpen() {
    return '<style>'
      + '.fgx-fig-photoelectric text{font-family:inherit}'
      + '.fgx-fig-photoelectric .fgx-hit{pointer-events:all}'
      + '</style>';
  }

  function halo(cls, x, y, str, fill, anchor, size) {
    var fs = size || 15;
    var a = anchor || 'start';
    var common = ' class="' + cls + '" x="' + n(x) + '" y="' + n(y) + '" font-size="' + fs + '" text-anchor="' + a + '"';
    return '<text' + common + ' stroke="' + CARD + '" stroke-width="4" stroke-linejoin="round" fill="' + CARD + '">' + str + '</text>'
      + '<text' + common + ' fill="' + fill + '">' + str + '</text>';
  }

  /* ---------- 장치 ---------- */

  function beamPoints() {
    var L = slotEnds(0);
    var R = slotEnds(NMAX - 1);
    return n(L.x0 - 8) + ',' + n(L.y0) + ' ' + n(R.x0 + 10) + ',' + n(R.y0) + ' '
      + n(R.x1 + 8) + ',' + n(R.y1) + ' ' + n(L.x1 - 8) + ',' + n(L.y1);
  }

  function centerLine() {
    var a = slotEnds(2);
    var b = slotEnds(7);
    var x0 = (a.x0 + b.x0) / 2;
    var y0 = (a.y0 + b.y0) / 2;
    var x1 = (a.x1 + b.x1) / 2;
    var y1 = (a.y1 + b.y1) / 2;
    return 'M' + n(x0) + ' ' + n(y0) + 'L' + n(x1) + ' ' + n(y1);
  }

  function renderDevice(c) {
    var p = [];
    var i, s, prog, pt, age, ep, on, dash, wave, hit, labelI, best, dlt;
    p.push(styleOpen());

    p.push('<g data-part="photon" class="js-beam">');
    p.push('<polygon class="js-beam-fill fgx-vis" points="' + beamPoints() + '" fill="' + c.pale + '" stroke="' + c.color + '" stroke-width="1.5" stroke-linejoin="round"/>');
    p.push('<path class="js-beam-line" d="' + centerLine() + '" fill="none" stroke="' + c.color + '" stroke-width="3" stroke-linecap="round"'
      + (c.dashed ? ' stroke-dasharray="7 5"' : '') + '/>');
    p.push('</g>');

    wave = waveD(c.f);
    dash = c.dashed ? ' stroke-dasharray="2.6 2.1"' : '';
    labelI = 0;
    best = 99;
    for (i = 0; i < NMAX; i++) {
      if (i >= c.I) continue;
      prog = (i / c.I) % 1;
      dlt = Math.abs(prog - 0.42);
      if (dlt < best) { best = dlt; labelI = i; }
    }
    for (i = 0; i < NMAX; i++) {
      on = i < c.I;
      prog = on ? ((i / c.I) % 1) : 0;
      if (on && prog < 0.04) prog = 0.04;
      pt = slotPoint(i, on ? prog : 0);
      p.push('<g data-part="photon" class="js-ph" data-i="' + i + '"' + (on ? '' : ' display="none"')
        + ' transform="translate(' + n(pt.x) + ' ' + n(pt.y) + ')">');
      p.push('<g class="js-ph-rot" transform="rotate(' + n(pt.ang) + ')">');
      p.push('<path class="js-ph-wave fgx-vis" d="' + wave + '" fill="none" stroke="' + c.color + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"' + dash + '/>');
      p.push('<rect class="fgx-hit" x="-16" y="-12" width="32" height="24" fill="transparent" style="pointer-events:all"/>');
      p.push('</g></g>');
    }

    p.push(lampMarkup(c));

    p.push('<g data-part="metal" class="js-plate">');
    p.push('<rect class="fgx-vis" x="' + PLATE.x + '" y="' + PLATE.y + '" width="' + PLATE.w + '" height="' + PLATE.h + '" rx="8" fill="' + C8 + '" stroke="#3e4c63" stroke-width="2"/>');
    p.push('<line x1="' + (PLATE.x + 10) + '" y1="' + (PLATE.y + 3) + '" x2="' + (PLATE.x + PLATE.w - 10) + '" y2="' + (PLATE.y + 3) + '" stroke="#c5d0e0" stroke-width="2" stroke-linecap="round"/>');
    for (i = 0; i < 7; i++) {
      p.push('<circle cx="' + (40 + i * 46) + '" cy="' + (PLATE.y + 14) + '" r="3.6" fill="#e7eefc" stroke="' + C1 + '" stroke-width="1.2"/>');
    }
    p.push('<text class="js-plate-name" x="' + (PLATE.x + PLATE.w / 2) + '" y="' + (PLATE.y + 38) + '" text-anchor="middle" font-size="17" font-weight="700" fill="#ffffff">' + c.plate + '</text>');
    p.push('<rect class="fgx-hit" x="' + PLATE.x + '" y="' + PLATE.y + '" width="' + PLATE.w + '" height="' + PLATE.h + '" fill="transparent" style="pointer-events:all"/>');
    p.push('</g>');

    for (i = 0; i < NMAX; i++) {
      s = slotEnds(i);
      p.push('<g class="js-spark" data-i="' + i + '" style="pointer-events:none"' + (c.emit || i >= c.I ? ' display="none"' : '') + '>');
      p.push('<circle class="js-spark-o" cx="' + n(s.x1) + '" cy="' + n(PLATE.y + 1) + '" r="6" fill="#fdba74"/>');
      p.push('<circle class="js-spark-i" cx="' + n(s.x1) + '" cy="' + n(PLATE.y + 1) + '" r="2.6" fill="#e11d1d"/>');
      p.push('</g>');
    }

    for (i = 0; i < NMAX; i++) {
      on = c.emit && i < c.I;
      age = on ? ((i + 0.45) / c.I) : 0;
      ep = elecPos(i, age, c.K);
      var tail = tailLocal(i, ep);
      p.push('<g data-part="electron" class="js-el" data-i="' + i + '"' + (on ? '' : ' display="none"')
        + ' transform="translate(' + n(ep.x) + ' ' + n(ep.y) + ')">');
      p.push('<line class="js-el-tail" x1="0" y1="0" x2="' + n(tail.x) + '" y2="' + n(tail.y) + '" stroke="' + C1 + '" stroke-width="2" stroke-linecap="round"/>');
      p.push('<circle class="fgx-vis" r="7" fill="' + C1 + '" stroke="#ffffff" stroke-width="1.6"/>');
      p.push('<rect class="fgx-hit" x="-12" y="-12" width="24" height="24" fill="transparent" style="pointer-events:all"/>');
      p.push('</g>');
    }

    p.push(energyMarkup(c));

    p.push('<g data-part="frequency" class="js-fchip">');
    p.push('<rect x="104" y="68" width="140" height="32" rx="8" fill="' + CARD + '" stroke="' + LINE + '" stroke-width="1.5"/>');
    p.push('<text class="js-fchip-t" x="174" y="89" text-anchor="middle" font-size="15" fill="' + INK + '">f = ' + c.fShow + ' ×10¹⁴ Hz</text>');
    p.push('<rect class="fgx-hit" x="104" y="68" width="140" height="32" fill="transparent" style="pointer-events:all"/>');
    p.push('</g>');

    p.push('<g data-part="intensity" class="js-ichip">');
    p.push('<rect x="16" y="150" width="82" height="30" rx="8" fill="' + CARD + '" stroke="' + LINE + '" stroke-width="1.5"/>');
    p.push('<text class="js-ichip-t" x="57" y="170" text-anchor="middle" font-size="15" fill="' + INK + '">세기 ' + c.I + '</text>');
    p.push('<rect class="fgx-hit" x="16" y="150" width="82" height="30" fill="transparent" style="pointer-events:all"/>');
    p.push('</g>');

    pt = slotPoint(labelI, Math.max(0.04, (labelI / c.I) % 1));
    var tagAt = labelOffset(pt);
    p.push('<g data-part="photon" class="js-ph-tag" transform="translate(' + n(tagAt.x) + ' ' + n(tagAt.y) + ')">');
    p.push('<rect x="-32" y="-16" width="64" height="24" rx="6" fill="' + CARD + '" stroke="' + LINE + '" stroke-width="1.2"/>');
    p.push('<text x="0" y="1" text-anchor="middle" font-size="15" fill="' + INK + '">광자 hf</text>');
    p.push('<rect class="fgx-hit" x="-32" y="-16" width="64" height="24" fill="transparent" style="pointer-events:all"/>');
    p.push('</g>');

    p.push('<g data-part="electron" class="js-el-tag"' + (c.emit ? '' : ' display="none"') + '>');
    p.push('<rect x="16" y="196" width="74" height="28" rx="8" fill="' + CARD + '" stroke="' + C1 + '" stroke-width="1.5"/>');
    p.push('<text x="53" y="215" text-anchor="middle" font-size="15" fill="' + INK + '">광전자</text>');
    p.push('<rect class="fgx-hit" x="16" y="196" width="74" height="28" fill="transparent" style="pointer-events:all"/>');
    p.push('</g>');

    return p.join('');
  }

  function lampMarkup(c) {
    var x = LAMP.x, y = LAMP.y;
    var rays = [
      [-26, -22, -38, -36],
      [-12, -30, -16, -46],
      [4, -32, 8, -48],
      [18, -24, 32, -36]
    ];
    var o = ['<g class="js-lamp" style="pointer-events:none">'];
    var i, r;
    o.push('<g class="js-rays" stroke="' + c.color + '" stroke-width="2.2" stroke-linecap="round" fill="none">');
    for (i = 0; i < rays.length; i++) {
      r = rays[i];
      o.push('<line x1="' + (x + r[0]) + '" y1="' + (y + r[1]) + '" x2="' + (x + r[2]) + '" y2="' + (y + r[3]) + '"/>');
    }
    o.push('</g>');
    o.push('<circle cx="' + x + '" cy="' + y + '" r="23" fill="' + CARD + '" stroke="' + INK + '" stroke-width="2"/>');
    o.push('<circle class="js-bulb" cx="' + x + '" cy="' + y + '" r="13" fill="' + c.pale + '" stroke="' + c.color + '" stroke-width="2"/>');
    o.push('<path class="js-filament" d="M' + (x - 8) + ' ' + (y + 4) + ' Q' + x + ' ' + (y - 10) + ' ' + (x + 8) + ' ' + (y + 4) + '" fill="none" stroke="' + c.color + '" stroke-width="2" stroke-linecap="round"/>');
    o.push('<rect x="' + (x - 12) + '" y="' + (y + 20) + '" width="24" height="12" rx="2" fill="' + C8 + '"/>');
    o.push('<rect x="' + (x - 8) + '" y="' + (y + 32) + '" width="16" height="6" rx="1.5" fill="#3e4c63"/>');
    o.push('</g>');
    return o.join('');
  }

  function energyMarkup(c) {
    var yE = yEv(c.E);
    var yW = yEv(c.W);
    var y0 = yEv(0);
    var y5 = yEv(5);
    var o = [];
    var e, lab;
    o.push('<g class="js-energy">');
    o.push('<line class="js-axis" x1="' + BAR_AXIS + '" y1="' + n(Math.min(y5, yE) - 16) + '" x2="' + BAR_AXIS + '" y2="' + n(y0) + '" stroke="' + DIM + '" stroke-width="1.5" stroke-linecap="round"/>');
    for (e = 0; e <= 5; e++) {
      o.push('<line x1="' + (BAR_AXIS - 5) + '" y1="' + n(yEv(e)) + '" x2="' + BAR_AXIS + '" y2="' + n(yEv(e)) + '" stroke="' + DIM + '" stroke-width="1.5"/>');
      o.push('<text x="' + (BAR_AXIS - 10) + '" y="' + n(yEv(e) + 5) + '" text-anchor="end" font-size="15" fill="' + DIM + '">' + e + '</text>');
    }
    o.push('<text x="' + (BAR_AXIS - 10) + '" y="' + n(y5 - 16) + '" text-anchor="end" font-size="15" fill="' + DIM + '">eV</text>');

    o.push('<g data-part="photon" class="js-hf">');
    o.push('<rect class="js-hf-rect fgx-vis" x="' + BAR_X + '" y="' + n(yE) + '" width="' + BAR_W + '" height="' + n(y0 - yE) + '" rx="3" fill="' + c.color + '"/>');
    o.push('<rect class="fgx-hit js-hf-hit" x="' + (BAR_X - 4) + '" y="' + n(yE) + '" width="' + (BAR_W + 8) + '" height="' + n(Math.max(18, y0 - yE)) + '" fill="transparent" style="pointer-events:all"/>');
    o.push('</g>');

    o.push('<g data-part="kmax" class="js-kbar"' + (c.emit ? '' : ' display="none"') + '>');
    o.push('<rect class="js-kbar-rect fgx-vis" x="' + BAR_X + '" y="' + n(yE) + '" width="' + BAR_W + '" height="' + n(Math.max(0, yW - yE)) + '" rx="3" fill="' + C1 + '"/>');
    lab = kbarLabel(c);
    o.push('<text class="js-kbar-t" x="' + n(lab.x) + '" y="' + n(lab.y) + '" text-anchor="' + lab.anchor + '" font-size="15" font-weight="700" fill="' + C1 + '">K_max</text>');
    o.push('<rect class="fgx-hit js-kbar-hit" x="' + n(lab.hitX) + '" y="' + n(lab.hitY) + '" width="' + n(lab.hitW) + '" height="' + n(lab.hitH) + '" fill="transparent" style="pointer-events:all"/>');
    o.push('</g>');

    o.push('<g data-part="work_function" class="js-wline">');
    o.push('<line class="js-wline-ln fgx-vis" x1="' + (BAR_X - 8) + '" y1="' + n(yW) + '" x2="' + (BAR_X + BAR_W + 8) + '" y2="' + n(yW) + '" stroke="' + C2 + '" stroke-width="3" stroke-linecap="round"/>');
    o.push('<text class="js-wline-t" x="' + BAR_LAB + '" y="' + n(yW + 5) + '" font-size="15" fill="' + C2 + '">일함수 W</text>');
    o.push('<rect class="fgx-hit js-wline-hit" x="' + (BAR_X - 10) + '" y="' + n(yW - 12) + '" width="130" height="24" fill="transparent" style="pointer-events:all"/>');
    o.push('</g>');
    o.push('</g>');
    return o.join('');
  }

  function kbarLabel(c) {
    var yE = yEv(c.E);
    var yW = yEv(c.W);
    var mid = (yE + yW) / 2;
    var y = mid + 5;
    var x = BAR_LAB;
    var anchor = 'start';
    if (!c.emit) {
      return { x: x, y: y, anchor: anchor, hitX: BAR_X - 4, hitY: yE, hitW: 70, hitH: 18 };
    }
    if (Math.abs(y - (yW + 5)) < 20) {
      x = BAR_AXIS - 12;
      anchor = 'end';
      if (Math.abs(y - yEv(Math.round((BAR_Y0 - y) / BAR_PX))) < 14) {
        y = mid - 16;
      }
    }
    var hitX = anchor === 'end' ? x - 52 : BAR_X - 4;
    var hitY = Math.min(yE, y - 14);
    var hitH = Math.max(18, Math.abs(yW - yE));
    return { x: x, y: y, anchor: anchor, hitX: hitX, hitY: hitY, hitW: 78, hitH: hitH };
  }

  /* ---------- 그래프 ---------- */

  function renderGraph(c) {
    var p = [];
    var ticksK = [-4, -2, 0, 2, 4, 6];
    var ticksF = [0, 2, 4, 6, 8, 10, 12, 14];
    var i, k, f, y, x, key, meta, sel, side, nameY, tri, ann;
    p.push(styleOpen());
    p.push('<rect x="' + GX0 + '" y="' + GY_TOP + '" width="' + (GX1 - GX0) + '" height="' + (GY_BOT - GY_TOP) + '" fill="' + CARD + '" stroke="' + LINE + '" stroke-width="1.5"/>');

    for (i = 0; i < ticksK.length; i++) {
      k = ticksK[i];
      y = gY(k);
      if (k !== 0) {
        p.push('<line x1="' + GX0 + '" y1="' + n(y) + '" x2="' + GX1 + '" y2="' + n(y) + '" stroke="' + LINE + '" stroke-width="1"/>');
      }
    }
    for (i = 0; i < ticksF.length; i++) {
      f = ticksF[i];
      x = gX(f);
      if (f !== 0) {
        p.push('<line x1="' + n(x) + '" y1="' + GY_TOP + '" x2="' + n(x) + '" y2="' + GY_BOT + '" stroke="' + LINE + '" stroke-width="1"/>');
      }
    }

    p.push('<line x1="' + GX0 + '" y1="' + n(gY(0)) + '" x2="' + GX1 + '" y2="' + n(gY(0)) + '" stroke="' + INK + '" stroke-width="1.8"/>');
    p.push('<line x1="' + GX0 + '" y1="' + GY_BOT + '" x2="' + GX0 + '" y2="' + GY_TOP + '" stroke="' + INK + '" stroke-width="1.8"/>');
    p.push('<path d="M' + GX1 + ' ' + n(gY(0)) + ' l-9 -5 v10 Z" fill="' + INK + '"/>');
    p.push('<path d="M' + GX0 + ' ' + GY_TOP + ' l-5 9 h10 Z" fill="' + INK + '"/>');

    tri = triGeom(c.W);
    p.push('<g data-part="planck" class="js-tri">');
    p.push('<path class="js-tri-fill" d="' + tri.fill + '" fill="' + mixHex('#7c3aed', '#ffffff', 0.84) + '" stroke="none"/>');
    p.push('<path class="js-tri-legs fgx-vis" d="' + tri.legs + '" fill="none" stroke="' + C5 + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>');
    p.push(halo('js-tri-lab', tri.lx, tri.ly, '기울기 = h', C5, 'middle', 15));
    p.push('<rect class="fgx-hit js-tri-hit" x="' + n(tri.hitX) + '" y="' + n(tri.hitY) + '" width="' + n(tri.hitW) + '" height="' + n(tri.hitH) + '" fill="transparent" style="pointer-events:all"/>');
    p.push('</g>');

    for (i = 0; i < METAL_KEYS.length; i++) {
      key = METAL_KEYS[i];
      meta = METAL[key];
      sel = key === c.key;
      side = key === 'na' ? 1 : -1;
      nameY = gY(kOf(F_MAX, meta.W)) + (side < 0 ? -8 : 18);
      p.push('<g class="js-m" data-metal="' + key + '">');
      p.push('<path class="js-md" d="' + seg(0, meta.W / H_PER_F, meta.W) + '" fill="none" stroke="' + (sel ? C1 : '#9aa3b5') + '" stroke-width="' + (sel ? 4 : 2) + '" stroke-dasharray="6 4" stroke-linecap="round"' + (sel ? ' display="none"' : '') + '/>');
      p.push('<path class="js-ms" d="' + seg(meta.W / H_PER_F, F_MAX, meta.W) + '" fill="none" stroke="' + (sel ? C1 : '#9aa3b5') + '" stroke-width="' + (sel ? 4 : 2) + '" stroke-linecap="round"' + (sel ? ' display="none"' : '') + '/>');
      p.push(halo('js-mn', 512, nameY, meta.name, sel ? C1 : '#5c6778', 'end', 15));
      p.push('</g>');
    }

    p.push('<g data-part="kf_line" class="js-kf">');
    p.push('<path class="js-kf-hit" d="' + seg(0, F_MAX, c.W) + '" fill="none" stroke="transparent" stroke-width="18" stroke-linecap="round"/>');
    p.push('<path class="js-kf-dash fgx-vis" d="' + seg(0, c.f0, c.W) + '" fill="none" stroke="' + C1 + '" stroke-width="4" stroke-dasharray="6 4" stroke-linecap="round"/>');
    p.push('<path class="js-kf-solid fgx-vis" d="' + seg(c.f0, F_MAX, c.W) + '" fill="none" stroke="' + C1 + '" stroke-width="4" stroke-linecap="round"/>');
    p.push('</g>');

    ann = graphAnn(c);
    p.push('<g data-part="threshold" class="js-f0">');
    p.push('<line class="js-f0-line" x1="' + n(ann.f0x) + '" y1="108" x2="' + n(ann.f0x) + '" y2="' + n(ann.axisY) + '" stroke="' + C3 + '" stroke-width="1.6" stroke-dasharray="4 3"/>');
    p.push('<circle class="js-f0-dot fgx-vis" cx="' + n(ann.f0x) + '" cy="' + n(ann.axisY) + '" r="7" fill="' + C3 + '" stroke="#ffffff" stroke-width="1.5"/>');
    p.push(halo('js-f0-lab', ann.f0lx, ann.f0ly, 'f₀', C3, ann.f0anchor, 16));
    p.push('<rect class="fgx-hit js-f0-hit" x="' + n(ann.f0x - 12) + '" y="' + n(ann.axisY - 14) + '" width="28" height="36" fill="transparent" style="pointer-events:all"/>');
    p.push('</g>');

    p.push('<g data-part="work_function" class="js-wpt">');
    p.push('<circle class="js-w-dot fgx-vis" cx="' + GX0 + '" cy="' + n(ann.wy) + '" r="5.5" fill="' + C2 + '" stroke="#ffffff" stroke-width="1.5"/>');
    p.push(halo('js-w-lab', ann.wlx, ann.wly, '−W', C2, 'start', 16));
    p.push('<rect class="fgx-hit js-w-hit" x="' + (GX0 - 10) + '" y="' + n(ann.wy - 12) + '" width="48" height="28" fill="transparent" style="pointer-events:all"/>');
    p.push('</g>');

    p.push('<g data-part="kmax" class="js-kpt">');
    p.push('<line class="js-k-guide" x1="' + n(ann.kx) + '" y1="' + n(ann.ky) + '" x2="' + n(ann.kx) + '" y2="' + n(ann.axisY) + '" stroke="' + C4 + '" stroke-width="1.6" stroke-dasharray="3 3"' + (c.emit ? '' : ' display="none"') + '/>');
    p.push('<circle class="js-k-dot fgx-vis" cx="' + n(ann.kx) + '" cy="' + n(ann.ky) + '" r="6.5" fill="' + (c.emit ? C4 : CARD) + '" stroke="' + C4 + '" stroke-width="2.4"/>');
    p.push(halo('js-k-lab', ann.klx, ann.kly, 'K_max', C4, ann.kanchor, 15));
    p.push('<rect class="fgx-hit js-k-hit" x="' + n(ann.kx - 14) + '" y="' + n(ann.ky - 14) + '" width="28" height="28" fill="transparent" style="pointer-events:all"/>');
    p.push('</g>');

    p.push('<g data-part="frequency" class="js-fmark">');
    p.push('<polygon class="js-f-tri fgx-vis" points="' + ann.fpts + '" fill="' + C1 + '"/>');
    p.push(halo('js-f-lab', ann.flx, ann.fly, 'f', C1, 'middle', 15));
    p.push('<rect class="fgx-hit js-f-hit" x="' + n(ann.fx - 10) + '" y="' + n(ann.axisY + 6) + '" width="42" height="28" fill="transparent" style="pointer-events:all"/>');
    p.push('</g>');

    p.push('<g data-part="stopping" class="js-stop" transform="translate(' + n(ann.chipX) + ' ' + n(ann.chipY) + ')">');
    p.push('<rect width="' + CHIP_W + '" height="' + CHIP_H + '" rx="8" fill="' + CARD + '" stroke="' + C4 + '" stroke-width="1.6"/>');
    p.push('<text x="' + (CHIP_W / 2) + '" y="20" text-anchor="middle" font-size="15" fill="' + INK + '">정지 전압 V_s = K_max/e</text>');
    p.push('</g>');

    for (i = 0; i < ticksK.length; i++) {
      k = ticksK[i];
      y = gY(k);
      p.push('<text x="' + (GX0 - 8) + '" y="' + n(y + 5) + '" text-anchor="end" font-size="15" fill="' + DIM + '">' + (k < 0 ? '−' + (-k) : String(k)) + '</text>');
    }
    for (i = 0; i < ticksF.length; i++) {
      f = ticksF[i];
      x = gX(f);
      p.push('<line x1="' + n(x) + '" y1="' + GY_BOT + '" x2="' + n(x) + '" y2="' + (GY_BOT + 6) + '" stroke="' + DIM + '" stroke-width="1.4"/>');
      p.push('<text x="' + n(x) + '" y="' + (GY_BOT + 22) + '" text-anchor="middle" font-size="15" fill="' + DIM + '">' + f + '</text>');
    }
    p.push('<text x="' + n((GX0 + GX1) / 2) + '" y="424" text-anchor="middle" font-size="16" fill="' + INK + '">f (×10¹⁴ Hz)</text>');
    p.push('<text x="20" y="214" text-anchor="middle" font-size="16" fill="' + INK + '" transform="rotate(-90 20 214)">K_max (eV)</text>');
    return p.join('');
  }

  function tailLocal(i, ep) {
    var dx = ep.x - slotEnds(i).x1;
    var dy = ep.y - PLATE.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var tlen = Math.min(12, Math.max(0, ep.dist - 8));
    return { x: -dx / len * tlen, y: -dy / len * tlen };
  }

  function znYAt(x) {
    var f = (x - GX0) / GSX;
    return gY(kOf(f, 4.3));
  }

  /* 정지 전압 칩은 세 직선 아래(아연 선 밑)에 둔다. 하늘 쪽은 직선이 올라와 자리가 없다. */
  function placeChip(kx, f0x) {
    var left = kx + 16;
    var triRight = gX(TRI_F1 + 4) + 10;
    if (left < triRight) left = triRight;
    if (left + CHIP_W > 546) left = 546 - CHIP_W;
    if (left < 82) left = 82;
    var top = znYAt(left) + 14;
    if (f0x > left - 6 && f0x < left + CHIP_W + 6) {
      var alt = f0x + 16;
      if (alt + CHIP_W <= 546) left = alt;
      else left = Math.max(82, f0x - CHIP_W - 12);
      top = znYAt(left) + 14;
    }
    if (top + CHIP_H > GY_BOT - 6) top = GY_BOT - 6 - CHIP_H;
    if (top < 100) top = 100;
    return { x: left, y: top };
  }

  function triGeom(W) {
    var f1 = TRI_F1;
    var f2 = f1 + 4;
    var k1 = kOf(f1, W);
    var k2 = kOf(f2, W);
    var x1 = gX(f1), x2 = gX(f2);
    var y1 = gY(k1), y2 = gY(k2);
    var fill = 'M' + n(x1) + ' ' + n(y1) + 'L' + n(x2) + ' ' + n(y1) + 'L' + n(x2) + ' ' + n(y2) + 'Z';
    var legs = 'M' + n(x1) + ' ' + n(y1) + 'L' + n(x2) + ' ' + n(y1) + 'L' + n(x2) + ' ' + n(y2);
    var fx = f1 + 4 * 0.7;
    var kLine = kOf(fx, W);
    var kLab = k1 + (kLine - k1) * 0.38;
    var lx = gX(fx);
    var ly = gY(kLab) + 4;
    return {
      fill: fill, legs: legs, lx: lx, ly: ly,
      hitX: x1, hitY: Math.min(y1, y2), hitW: x2 - x1, hitH: Math.abs(y2 - y1)
    };
  }

  function graphAnn(c) {
    var axisY = gY(0);
    var f0x = gX(c.f0);
    var fx = gX(c.f);
    var kx = fx;
    var ky = c.emit ? gY(c.K) : axisY;
    var f0side = 1;
    if (Math.abs(fx - f0x) < 40 && fx >= f0x) f0side = -1;
    var f0lx = f0x + f0side * 11;
    var f0ly = axisY + 22;
    var f0anchor = f0side > 0 ? 'start' : 'end';
    var wy = gY(-c.W);
    var wlx = GX0 + 12;
    var wly = wy + 16;
    if (wly > GY_BOT - 4) wly = wy - 12;
    var klx = kx + 12;
    var kly = ky + 4;
    var kanchor = 'start';
    if (ky > axisY - 36) {
      kly = ky - 16;
      klx = kx - 12;
      kanchor = 'end';
    }
    if (kanchor === 'start' && klx + 46 > GX1 - 4) {
      klx = kx - 12;
      kanchor = 'end';
    }
    var chip = placeChip(kx, f0x);
    var chipX = chip.x;
    var chipY = chip.y;
    var apexY = axisY + 8;
    var baseY = axisY + 20;
    var fpts = n(fx) + ',' + n(apexY) + ' ' + n(fx - 7) + ',' + n(baseY) + ' ' + n(fx + 7) + ',' + n(baseY);
    var flx = fx + 16;
    var fly = baseY - 1;
    if (Math.abs(fx - f0x) < 34) flx = fx + (fx >= f0x ? 22 : -22);
    return {
      axisY: axisY, f0x: f0x, f0lx: f0lx, f0ly: f0ly, f0anchor: f0anchor,
      wy: wy, wlx: wlx, wly: wly,
      kx: kx, ky: ky, klx: klx, kly: kly, kanchor: kanchor,
      chipX: chipX, chipY: chipY,
      fx: fx, fpts: fpts, flx: flx, fly: fly
    };
  }

  /* ---------- DOM 반영 ---------- */

  function shown(el, on) {
    if (!el) return;
    if (on) el.removeAttribute('display');
    else el.setAttribute('display', 'none');
  }

  function setText(list, str) {
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i].textContent !== str) list[i].textContent = str;
    }
  }

  function place(list, x, y, anchor) {
    var i, el;
    for (i = 0; i < list.length; i++) {
      el = list[i];
      el.setAttribute('x', String(n(x)));
      el.setAttribute('y', String(n(y)));
      if (anchor) el.setAttribute('text-anchor', anchor);
    }
  }

  function applyDevice(ctx, c) {
    var time = Number(ctx.time);
    if (time !== time) time = 0;
    var wave = waveD(c.f);
    var dash = c.dashed ? '2.6 2.1' : 'none';
    var beam = ctx.q('.js-beam-fill');
    var beamLine = ctx.q('.js-beam-line');
    var bulb = ctx.q('.js-bulb');
    var fil = ctx.q('.js-filament');
    var rays = ctx.q('.js-rays');
    var hf = ctx.q('.js-hf-rect');
    var hfHit = ctx.q('.js-hf-hit');
    var kbar = ctx.q('.js-kbar');
    var krect = ctx.q('.js-kbar-rect');
    var wln = ctx.q('.js-wline-ln');
    var whit = ctx.q('.js-wline-hit');
    var axis = ctx.q('.js-axis');
    var i, on, prog, pt, age, ep, node, rot, path, best, labelI, dlt, tail, dx, dy, len, tlen;
    var yE = yEv(c.E);
    var yW = yEv(c.W);
    var y0 = yEv(0);
    var y5 = yEv(5);
    var lab = kbarLabel(c);

    if (beam) {
      beam.setAttribute('fill', c.pale);
      beam.setAttribute('stroke', c.color);
    }
    if (beamLine) {
      beamLine.setAttribute('stroke', c.color);
      beamLine.setAttribute('stroke-dasharray', c.dashed ? '7 5' : 'none');
    }
    if (bulb) {
      bulb.setAttribute('fill', c.pale);
      bulb.setAttribute('stroke', c.color);
    }
    if (fil) fil.setAttribute('stroke', c.color);
    if (rays) rays.setAttribute('stroke', c.color);

    labelI = 0;
    best = 99;
    for (i = 0; i < NMAX; i++) {
      if (i >= c.I) continue;
      prog = (time / PHOTON_T + i / c.I) % 1;
      dlt = Math.abs(prog - 0.42);
      if (dlt < best) { best = dlt; labelI = i; }
    }
    for (i = 0; i < NMAX; i++) {
      node = ctx.q('.js-ph[data-i="' + i + '"]');
      if (!node) continue;
      on = i < c.I;
      shown(node, on);
      if (!on) continue;
      prog = (time / PHOTON_T + i / c.I) % 1;
      if (prog < 0.04) prog = 0.04;
      pt = slotPoint(i, prog);
      node.setAttribute('transform', 'translate(' + n(pt.x) + ' ' + n(pt.y) + ')');
      rot = node.querySelector('.js-ph-rot');
      path = node.querySelector('.js-ph-wave');
      if (rot) rot.setAttribute('transform', 'rotate(' + n(pt.ang) + ')');
      if (path) {
        path.setAttribute('d', wave);
        path.setAttribute('stroke', c.color);
        path.setAttribute('stroke-dasharray', dash);
      }
      if (i === labelI) {
        var tag = ctx.q('.js-ph-tag');
        if (tag) {
          var off = labelOffset(pt);
          tag.setAttribute('transform', 'translate(' + n(off.x) + ' ' + n(off.y) + ')');
        }
      }
    }

    setText(ctx.qa('.js-fchip-t'), 'f = ' + c.fShow + ' ×10¹⁴ Hz');
    setText(ctx.qa('.js-ichip-t'), '세기 ' + c.I);
    setText(ctx.qa('.js-plate-name'), c.plate);

    if (hf) {
      hf.setAttribute('y', String(n(yE)));
      hf.setAttribute('height', String(n(Math.max(0.5, y0 - yE))));
      hf.setAttribute('fill', c.color);
    }
    if (hfHit) {
      hfHit.setAttribute('y', String(n(yE)));
      hfHit.setAttribute('height', String(n(Math.max(18, y0 - yE))));
    }
    if (axis) axis.setAttribute('y1', String(n(Math.min(y5, yE) - 16)));
    shown(kbar, c.emit);
    if (krect && c.emit) {
      krect.setAttribute('y', String(n(yE)));
      krect.setAttribute('height', String(n(Math.max(0.5, yW - yE))));
    }
    place(ctx.qa('.js-kbar-t'), lab.x, lab.y, lab.anchor);
    var kh = ctx.q('.js-kbar-hit');
    if (kh) {
      kh.setAttribute('x', String(n(lab.hitX)));
      kh.setAttribute('y', String(n(lab.hitY)));
      kh.setAttribute('width', String(n(lab.hitW)));
      kh.setAttribute('height', String(n(lab.hitH)));
    }
    if (wln) {
      wln.setAttribute('y1', String(n(yW)));
      wln.setAttribute('y2', String(n(yW)));
    }
    place(ctx.qa('.js-wline-t'), BAR_LAB, yW + 5, 'start');
    if (whit) whit.setAttribute('y', String(n(yW - 12)));

    for (i = 0; i < NMAX; i++) {
      node = ctx.q('.js-el[data-i="' + i + '"]');
      if (!node) continue;
      on = c.emit && i < c.I;
      shown(node, on);
      if (!on) continue;
      age = (time / ELEC_T + (i + 0.45) / c.I) % 1;
      ep = elecPos(i, age, c.K);
      node.setAttribute('transform', 'translate(' + n(ep.x) + ' ' + n(ep.y) + ')');
      tail = node.querySelector('.js-el-tail');
      if (tail) {
        var back = tailLocal(i, ep);
        tail.setAttribute('x2', String(n(back.x)));
        tail.setAttribute('y2', String(n(back.y)));
      }
    }
    shown(ctx.q('.js-el-tag'), c.emit);

    for (i = 0; i < NMAX; i++) {
      node = ctx.q('.js-spark[data-i="' + i + '"]');
      if (!node) continue;
      on = !c.emit && i < c.I;
      shown(node, on);
      if (!on) continue;
      var wob = 0.5 + 0.5 * Math.sin(time * 5 + i * 1.3);
      var outer = node.querySelector('.js-spark-o');
      var inner = node.querySelector('.js-spark-i');
      if (outer) outer.setAttribute('r', String(n(4 + wob * 4)));
      if (inner) inner.setAttribute('r', String(n(2 + wob * 1.6)));
    }
  }

  function labelOffset(pt) {
    var rad = pt.ang * Math.PI / 180;
    var nx = Math.sin(rad);
    var ny = -Math.cos(rad);
    if (ny > 0) { nx = -nx; ny = -ny; }
    var x = pt.x + nx * 26;
    var y = pt.y + ny * 22;
    if (y < 118 && x > 96 && x < 250) y = 118;
    if (x > 360) x = 360;
    if (x < 70) x = 70;
    if (y > PLATE.y - 28) y = PLATE.y - 28;
    if (y < 36) y = 36;
    return { x: x, y: y };
  }

  function applyGraph(ctx, c) {
    var i, key, meta, sel, group, dash, solid, names, ann, tri;
    ann = graphAnn(c);
    tri = triGeom(c.W);
    for (i = 0; i < METAL_KEYS.length; i++) {
      key = METAL_KEYS[i];
      meta = METAL[key];
      sel = key === c.key;
      group = ctx.q('.js-m[data-metal="' + key + '"]');
      if (!group) continue;
      dash = group.querySelector('.js-md');
      solid = group.querySelector('.js-ms');
      shown(dash, !sel);
      shown(solid, !sel);
      if (!sel) {
        if (dash) { dash.setAttribute('stroke', '#9aa3b5'); dash.setAttribute('stroke-width', '2'); }
        if (solid) { solid.setAttribute('stroke', '#9aa3b5'); solid.setAttribute('stroke-width', '2'); }
      }
      names = group.querySelectorAll('.js-mn');
      var ni, col = sel ? '#2563eb' : '#5c6778';
      for (ni = 0; ni < names.length; ni++) {
        if (names[ni].getAttribute('stroke')) continue;
        names[ni].setAttribute('fill', col);
      }
    }
    var hit = ctx.q('.js-kf-hit');
    var kdash = ctx.q('.js-kf-dash');
    var ksolid = ctx.q('.js-kf-solid');
    if (hit) hit.setAttribute('d', seg(0, F_MAX, c.W));
    if (kdash) kdash.setAttribute('d', seg(0, c.f0, c.W));
    if (ksolid) ksolid.setAttribute('d', seg(c.f0, F_MAX, c.W));

    var fill = ctx.q('.js-tri-fill');
    var legs = ctx.q('.js-tri-legs');
    if (fill) fill.setAttribute('d', tri.fill);
    if (legs) legs.setAttribute('d', tri.legs);
    place(ctx.qa('.js-tri-lab'), tri.lx, tri.ly, 'middle');
    var th = ctx.q('.js-tri-hit');
    if (th) {
      th.setAttribute('x', String(n(tri.hitX)));
      th.setAttribute('y', String(n(tri.hitY)));
      th.setAttribute('width', String(n(tri.hitW)));
      th.setAttribute('height', String(n(tri.hitH)));
    }

    var fl = ctx.q('.js-f0-line');
    var fd = ctx.q('.js-f0-dot');
    if (fl) {
      fl.setAttribute('x1', String(n(ann.f0x)));
      fl.setAttribute('x2', String(n(ann.f0x)));
      fl.setAttribute('y2', String(n(ann.axisY)));
    }
    if (fd) {
      fd.setAttribute('cx', String(n(ann.f0x)));
      fd.setAttribute('cy', String(n(ann.axisY)));
    }
    place(ctx.qa('.js-f0-lab'), ann.f0lx, ann.f0ly, ann.f0anchor);
    var fhit = ctx.q('.js-f0-hit');
    if (fhit) {
      fhit.setAttribute('x', String(n(ann.f0x - 12)));
      fhit.setAttribute('y', String(n(ann.axisY - 14)));
    }

    var wd = ctx.q('.js-w-dot');
    if (wd) wd.setAttribute('cy', String(n(ann.wy)));
    place(ctx.qa('.js-w-lab'), ann.wlx, ann.wly, 'start');
    var wh = ctx.q('.js-w-hit');
    if (wh) wh.setAttribute('y', String(n(ann.wy - 12)));

    var guide = ctx.q('.js-k-guide');
    var dot = ctx.q('.js-k-dot');
    shown(guide, c.emit);
    if (guide && c.emit) {
      guide.setAttribute('x1', String(n(ann.kx)));
      guide.setAttribute('x2', String(n(ann.kx)));
      guide.setAttribute('y1', String(n(ann.ky)));
      guide.setAttribute('y2', String(n(ann.axisY)));
    }
    if (dot) {
      dot.setAttribute('cx', String(n(ann.kx)));
      dot.setAttribute('cy', String(n(ann.ky)));
      dot.setAttribute('fill', c.emit ? '#16a34a' : '#ffffff');
    }
    place(ctx.qa('.js-k-lab'), ann.klx, ann.kly, ann.kanchor);
    var khit = ctx.q('.js-k-hit');
    if (khit) {
      khit.setAttribute('x', String(n(ann.kx - 14)));
      khit.setAttribute('y', String(n(ann.ky - 14)));
    }

    var ftri = ctx.q('.js-f-tri');
    if (ftri) ftri.setAttribute('points', ann.fpts);
    place(ctx.qa('.js-f-lab'), ann.flx, ann.fly, 'middle');
    var fmk = ctx.q('.js-f-hit');
    if (fmk) {
      fmk.setAttribute('x', String(n(ann.fx - 10)));
      fmk.setAttribute('y', String(n(ann.axisY + 6)));
    }

    var stop = ctx.q('.js-stop');
    if (stop) stop.setAttribute('transform', 'translate(' + n(ann.chipX) + ' ' + n(ann.chipY) + ')');
  }

  NMFIG.define('photoelectric', {
    viewBox: [560, 440],
    live: true,
    views: [
      { id: 'device', label: '장치', hint: '진동수 f가 문턱 f₀ 이상일 때만 광전자가 나옵니다. 세기는 개수를 바꿉니다.' },
      { id: 'graph', label: 'K–f 그래프', hint: '세 직선은 기울기 h로 평행합니다. 가로 절편은 f₀, 세로 절편은 −W입니다.' }
    ],
    controls: [
      {
        id: 'f', type: 'range', label: '빛의 진동수 f (×10¹⁴ Hz)',
        min: 1, max: 14, step: 0.1, value: 8,
        fmt: function (v) { return Number(v).toFixed(1) + ' ×10¹⁴ Hz'; }
      },
      {
        id: 'I', type: 'range', label: '빛의 세기 (광자 수)',
        min: 1, max: 10, step: 1, value: 5,
        fmt: function (v) { return String(Math.round(Number(v))); }
      },
      {
        id: 'metal', type: 'choice', label: '금속', value: 'na',
        options: [
          { v: 'cs', label: '세슘 Cs' },
          { v: 'na', label: '나트륨 Na' },
          { v: 'zn', label: '아연 Zn' }
        ]
      }
    ],
    _calc: calc,
    render: function (v, view) {
      var c = calc(v);
      return view === 'graph' ? renderGraph(c) : renderDevice(c);
    },
    update: function (ctx) {
      var c = calc(ctx.v);
      if (ctx.view === 'graph') applyGraph(ctx, c);
      else applyDevice(ctx, c);
      return {
        readout: ctx.view === 'graph' ? c.readoutGraph : c.readoutDevice,
        active: c.emit ? ['electron'] : ['photon']
      };
    }
  });
})(window.NMFIG);
