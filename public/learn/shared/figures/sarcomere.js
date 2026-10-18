/* 골격근 · 근육 원섬유 마디.
 * contract: 컨트롤 len(μm, 2.4~3.0). Z선만 움직이고 필라멘트 길이는 고정.
 * hierarchy: 골격근 → 근섬유 → 근육 원섬유 → 마디.
 * 축척 150 단위/μm. 마이오신=A대 1.6, 액틴 한쪽 1.2, I=X−1.6, H=X−2.4.
 * 수치는 교과서·수능 예제와 같은 값.
 */
(function (NMFIG) {
  'use strict';

  var UM = 150;
  var CX = 280;
  var ACTIN_UM = 1.2;
  var MYOSIN_UM = 1.6;
  var ACTIN_U = 180;
  var MY_HALF = 120;
  var RELAX = 3;

  var C1 = 'var(--fgx-c1,#2563eb)';
  var C2 = 'var(--fgx-c2,#dc2626)';
  var C3 = 'var(--fgx-c3,#d97706)';
  var C5 = 'var(--fgx-c5,#7c3aed)';
  var C6 = 'var(--fgx-c6,#0891b2)';
  var C7 = 'var(--fgx-c7,#db2777)';
  var C8 = 'var(--fgx-c8,#65748b)';
  var C1S = 'var(--fgx-c1-soft,#d3e0fb)';
  var C2S = 'var(--fgx-c2-soft,#f8d4d4)';
  var C3S = 'var(--fgx-c3-soft,#f8e6c8)';
  var C5S = 'var(--fgx-c5-soft,#e4d8fb)';
  var C6S = 'var(--fgx-c6-soft,#d0eef5)';
  var C7S = 'var(--fgx-c7-soft,#f8d5e4)';
  var C8S = 'var(--fgx-c8-soft,#e1e5eb)';
  var INK = 'var(--fgx-ink,#1a1f2e)';
  var DIM = 'var(--fgx-dim,#4a5468)';
  var LINE = 'var(--fgx-line,#d5d8de)';
  var ACCENT = 'var(--fgx-accent,#16a34a)';
  var ZC = '#3a4254';

  var Y_ACT = [100, 140, 180, 220];
  var Y_MYO = [120, 160, 200];
  var ACT_H = 5;
  var MY_H = 14;
  var HEAD_L = [184, 214, 244];
  var HEAD_R = [316, 346, 376];

  var Y_LEN = 24;
  var Y_DIM = 40;
  var Y_ZTX = 74;
  var Y_Z1 = 86;
  var Y_Z2 = 228;
  var Y_ALAB = 250;
  var Y_AB = 262;
  var Y_STRIP = 278;
  var H_STRIP = 26;
  var Y_TICK1 = 316;
  var Y_TICKL = 336;

  var STYLE = '<style>.fgx-fig-sarcomere .fgx-hit{pointer-events:all}</style>';

  function round2(v) {
    return Math.round(v * 100) / 100;
  }

  function num(v) {
    var n = round2(v);
    if (n !== n || n > 1e6 || n < -1e6) return '0';
    return String(n);
  }

  function calc(v) {
    var len = Number(v && v.len);
    if (len !== len) len = RELAX;
    if (len < 2.4) len = 2.4;
    if (len > 3) len = 3;
    var zL = round2(CX - len * (UM / 2));
    var zR = round2(CX + len * (UM / 2));
    var mL = CX - MY_HALF;
    var mR = CX + MY_HALF;
    var actLEnd = round2(zL + ACTIN_U);
    var actR0 = round2(zR - ACTIN_U);
    if (actR0 < actLEnd) actR0 = actLEnd;
    var edges = [zL, mL, actLEnd, actR0, mR, zR];
    var i;
    for (i = 1; i < edges.length; i++) {
      if (edges[i] < edges[i - 1]) edges[i] = edges[i - 1];
    }
    var H = round2((edges[3] - edges[2]) / UM);
    var I = round2((edges[5] - edges[0]) / UM - MYOSIN_UM);
    var ov = round2((MYOSIN_UM - H) / 2);
    return {
      len: len,
      zL: edges[0],
      zR: edges[5],
      mL: edges[1],
      mR: edges[4],
      actLEnd: edges[2],
      actR0: edges[3],
      edges: edges,
      A: MYOSIN_UM,
      I: I,
      H: H,
      ov: ov
    };
  }

  function phaseOf(len) {
    if (len > 2.95) return '이완';
    if (len <= 2.45) return '최대 수축';
    return '수축';
  }

  function deltaMark(now, base) {
    var d = round2(now - base);
    if (d === 0) return '=';
    return d > 0 ? '↑' : '↓';
  }

  function readoutOf(c) {
    var l1 = '마디 X = ' + c.len.toFixed(2) + ' μm (' + phaseOf(c.len) + ')';
    var l2 = 'A대 1.60 μm (불변) · I대 ' + c.I.toFixed(2) + ' μm ' + deltaMark(c.I, 1.4)
      + ' · H대 ' + c.H.toFixed(2) + ' μm ' + deltaMark(c.H, 0.6)
      + ' · 겹침 한쪽 ' + c.ov.toFixed(2) + ' μm ' + deltaMark(c.ov, 0.5);
    var l3 = '액틴 1.2 μm · 마이오신 1.6 μm — 필라멘트 길이는 그대로';
    return l1 + '\n' + l2 + '\n' + l3;
  }

  function bandTextOn(w, minW) {
    return w >= minW ? 'visible' : 'hidden';
  }

  function rect(x, y, w, h, attrs) {
    return '<rect x="' + num(x) + '" y="' + num(y) + '" width="' + num(w) + '" height="' + num(h) + '" ' + attrs + '/>';
  }

  function oneHead(x, y, dir, sign) {
    var x2 = x + dir * 8;
    var y2 = y + sign * 9;
    return '<line x1="' + num(x) + '" y1="' + num(y) + '" x2="' + num(x2) + '" y2="' + num(y2)
      + '" stroke="' + C2 + '" stroke-width="2.2" stroke-linecap="round"/>'
      + '<circle cx="' + num(x2) + '" cy="' + num(y2) + '" r="3.2" fill="' + C2 + '"/>'
      + '<circle class="fgx-hit" cx="' + num(x2) + '" cy="' + num(y2) + '" r="8" fill="transparent"/>';
  }

  function headsAt(cy) {
    var s = '';
    var i;
    var top = cy - MY_H / 2;
    var bot = cy + MY_H / 2;
    for (i = 0; i < HEAD_L.length; i++) {
      s += oneHead(HEAD_L[i], top, 1, -1);
      s += oneHead(HEAD_L[i], bot, 1, 1);
    }
    for (i = 0; i < HEAD_R.length; i++) {
      s += oneHead(HEAD_R[i], top, -1, -1);
      s += oneHead(HEAD_R[i], bot, -1, 1);
    }
    return s;
  }

  function dimPath(zL, zR) {
    return 'M' + num(zL) + ' 54 L' + num(zL) + ' ' + Y_DIM + ' L' + num(zR) + ' ' + Y_DIM + ' L' + num(zR) + ' 54';
  }

  function renderContract(v) {
    var c = calc(v);
    var s = STYLE;
    var i, y, cy, w, vis, hw, hx;
    var e = c.edges;

    s += '<g class="js-nb" opacity="0.34">';
    for (i = 0; i < Y_ACT.length; i++) {
      y = Y_ACT[i] - ACT_H / 2;
      s += rect(c.zL - ACTIN_U, y, ACTIN_U, ACT_H, 'class="js-nb-al" rx="2.5" fill="' + C1 + '"');
      s += rect(c.zR, y, ACTIN_U, ACT_H, 'class="js-nb-ar" rx="2.5" fill="' + C1 + '"');
    }
    for (i = 0; i < Y_MYO.length; i++) {
      y = Y_MYO[i] - MY_H / 2;
      s += rect(c.zL - c.len * (UM / 2) - MY_HALF, y, MY_HALF * 2, MY_H, 'class="js-nb-ml" rx="7" fill="' + C2 + '"');
      s += rect(c.zR + c.len * (UM / 2) - MY_HALF, y, MY_HALF * 2, MY_H, 'class="js-nb-mr" rx="7" fill="' + C2 + '"');
    }
    s += '</g>';

    s += '<g data-part="sarcomere">';
    s += '<text class="js-len" x="' + CX + '" y="' + Y_LEN + '" text-anchor="middle" font-size="17" font-weight="700" fill="' + INK + '">마디 X = ' + c.len.toFixed(2) + ' μm</text>';
    s += '<path class="js-dim" d="' + dimPath(c.zL, c.zR) + '" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>';
    s += rect(c.zL, 4, c.zR - c.zL, 58, 'class="fgx-hit js-sarc-hit" fill="transparent"');
    s += '</g>';

    s += '<g data-part="actin">';
    for (i = 0; i < Y_ACT.length; i++) {
      cy = Y_ACT[i];
      y = cy - ACT_H / 2;
      s += rect(c.zL, y, ACTIN_U, ACT_H, 'class="js-act-l" rx="2.5" fill="' + C1 + '"');
      s += rect(c.zR - ACTIN_U, y, ACTIN_U, ACT_H, 'class="js-act-r" rx="2.5" fill="' + C1 + '"');
      s += rect(c.zL, cy - 8, ACTIN_U, 16, 'class="fgx-hit js-act-l" fill="transparent"');
      s += rect(c.zR - ACTIN_U, cy - 8, ACTIN_U, 16, 'class="fgx-hit js-act-r" fill="transparent"');
    }
    s += '</g>';

    s += '<g data-part="myosin">';
    for (i = 0; i < Y_MYO.length; i++) {
      cy = Y_MYO[i];
      s += rect(c.mL, cy - MY_H / 2, MY_HALF * 2, MY_H, 'rx="7" fill="' + C2 + '"');
      s += rect(c.mL, cy - 8, MY_HALF * 2, 16, 'class="fgx-hit" fill="transparent"');
    }
    s += '</g>';

    s += '<g data-part="myosin_head">';
    for (i = 0; i < Y_MYO.length; i++) s += headsAt(Y_MYO[i]);
    s += '</g>';

    s += '<g data-part="m_line">';
    s += '<line x1="' + CX + '" y1="' + (Y_MYO[0] - MY_H / 2) + '" x2="' + CX + '" y2="' + (Y_MYO[2] + MY_H / 2) + '" stroke="' + ZC + '" stroke-width="2.5" stroke-linecap="round"/>';
    s += rect(CX - 9, Y_MYO[0] - MY_H / 2, 18, Y_MYO[2] - Y_MYO[0] + MY_H, 'class="fgx-hit" fill="transparent"');
    s += '</g>';

    s += '<g data-part="z_line" class="js-zl" transform="translate(' + num(c.zL) + ',0)">';
    s += '<line x1="0" y1="' + Y_Z1 + '" x2="0" y2="' + Y_Z2 + '" stroke="' + ZC + '" stroke-width="5" stroke-linecap="round"/>';
    s += '<text x="0" y="' + Y_ZTX + '" text-anchor="middle" font-size="17" font-weight="700" fill="' + INK + '">Z</text>';
    s += rect(-14, Y_ZTX - 18, 28, Y_Z2 - Y_ZTX + 22, 'class="fgx-hit" fill="transparent"');
    s += '</g>';
    s += '<g data-part="z_line" class="js-zr" transform="translate(' + num(c.zR) + ',0)">';
    s += '<line x1="0" y1="' + Y_Z1 + '" x2="0" y2="' + Y_Z2 + '" stroke="' + ZC + '" stroke-width="5" stroke-linecap="round"/>';
    s += '<text x="0" y="' + Y_ZTX + '" text-anchor="middle" font-size="17" font-weight="700" fill="' + INK + '">Z</text>';
    s += rect(-14, Y_ZTX - 18, 28, Y_Z2 - Y_ZTX + 22, 'class="fgx-hit" fill="transparent"');
    s += '</g>';

    s += '<line class="js-guide-l" x1="' + num(c.zL) + '" y1="' + (Y_Z2 + 2) + '" x2="' + num(c.zL) + '" y2="' + Y_STRIP + '" stroke="' + LINE + '" stroke-width="1.5" stroke-dasharray="3 4" style="pointer-events:none"/>';
    s += '<line class="js-guide-r" x1="' + num(c.zR) + '" y1="' + (Y_Z2 + 2) + '" x2="' + num(c.zR) + '" y2="' + Y_STRIP + '" stroke="' + LINE + '" stroke-width="1.5" stroke-dasharray="3 4" style="pointer-events:none"/>';

    s += '<g data-part="a_band">';
    s += '<text x="' + CX + '" y="' + Y_ALAB + '" text-anchor="middle" font-size="16" font-weight="700" fill="' + INK + '">A대</text>';
    s += '<path d="M' + c.mL + ' ' + (Y_AB + 10) + ' L' + c.mL + ' ' + Y_AB + ' L' + c.mR + ' ' + Y_AB + ' L' + c.mR + ' ' + (Y_AB + 10) + '" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>';
    s += rect(c.mL, Y_ALAB - 16, c.mR - c.mL, 30, 'class="fgx-hit" fill="transparent"');
    s += '</g>';

    var bands = [
      { part: 'i_band', cls: 'il', i0: 0, i1: 1, fill: C6S, stroke: C6, label: 'I', min: 16 },
      { part: 'overlap', cls: 'ol', i0: 1, i1: 2, fill: C3S, stroke: C3, label: '겹침', min: 44 },
      { part: 'overlap', cls: 'or', i0: 3, i1: 4, fill: C3S, stroke: C3, label: '겹침', min: 44 },
      { part: 'i_band', cls: 'ir', i0: 4, i1: 5, fill: C6S, stroke: C6, label: 'I', min: 16 },
      { part: 'h_zone', cls: 'h', i0: 2, i1: 3, fill: C2S, stroke: C2, label: 'H', min: 16 }
    ];
    for (i = 0; i < bands.length; i++) {
      w = e[bands[i].i1] - e[bands[i].i0];
      vis = bandTextOn(w, bands[i].min);
      s += '<g data-part="' + bands[i].part + '">';
      s += rect(e[bands[i].i0], Y_STRIP, Math.max(0, w), H_STRIP, 'class="js-b js-b-' + bands[i].cls + '" fill="' + bands[i].fill + '" stroke="' + bands[i].stroke + '" stroke-width="' + (bands[i].cls === 'h' && w < 1 ? '0' : '1.5') + '"');
      s += '<text class="js-bt js-bt-' + bands[i].cls + '" x="' + num(e[bands[i].i0] + w / 2) + '" y="' + (Y_STRIP + 18) + '" text-anchor="middle" font-size="15" font-weight="700" fill="' + INK + '" visibility="' + vis + '">' + bands[i].label + '</text>';
      if (bands[i].cls === 'h') {
        vis = w < 4 ? 'visible' : 'hidden';
        s += '<line class="js-h-fold" x1="' + CX + '" y1="' + (Y_STRIP - 5) + '" x2="' + CX + '" y2="' + (Y_STRIP + H_STRIP + 5) + '" stroke="' + C2 + '" stroke-width="3.5" stroke-linecap="round" visibility="' + vis + '"/>';
        s += '<circle class="js-h-fold" cx="' + CX + '" cy="' + (Y_STRIP + H_STRIP / 2) + '" r="5.5" fill="' + C2 + '" visibility="' + vis + '"/>';
        hw = w >= 16 ? w : 16;
        hx = w >= 16 ? e[2] : CX - 8;
        s += rect(hx, Y_STRIP - 6, hw, H_STRIP + 12, 'class="fgx-hit js-h-hit" fill="transparent"');
      }
      s += '</g>';
    }

    s += '<line class="js-ruler" x1="' + num(c.zL) + '" y1="' + (Y_TICK1 + 8) + '" x2="' + num(c.zL + 3 * UM) + '" y2="' + (Y_TICK1 + 8) + '" stroke="' + DIM + '" stroke-width="1.5" stroke-linecap="round"/>';
    s += '<text x="16" y="' + Y_TICKL + '" font-size="15" fill="' + DIM + '">μm</text>';
    for (i = 0; i <= 3; i++) {
      var tx = c.zL + i * UM;
      s += '<g class="js-tick" data-i="' + i + '">';
      s += '<line class="js-tick-ln" x1="' + num(tx) + '" y1="' + Y_TICK1 + '" x2="' + num(tx) + '" y2="' + (Y_TICK1 + 8) + '" stroke="' + DIM + '" stroke-width="1.5" stroke-linecap="round"/>';
      s += '<text class="js-tick-tx" x="' + num(tx) + '" y="' + Y_TICKL + '" text-anchor="middle" font-size="15" fill="' + DIM + '">' + i + '</text>';
      s += '</g>';
    }
    return s;
  }

  function sideText(cy, name, desc) {
    return '<text x="348" y="' + (cy - 8) + '" font-size="16" font-weight="700" fill="' + INK + '">' + name + '</text>'
      + '<text x="348" y="' + (cy + 14) + '" font-size="15" fill="' + DIM + '">' + desc + '</text>';
  }

  function zoomMark(y) {
    return '<path d="M158 ' + (y - 10) + ' L178 ' + y + ' L198 ' + (y - 10) + ' Z" fill="' + DIM + '"/>'
      + '<text x="206" y="' + y + '" font-size="15" fill="' + DIM + '">확대</text>';
  }

  function renderHierarchy() {
    var s = STYLE;
    var cy, d, i, x0, pitch, aW, iW, fibY, fibH, zL, zR, unit, mL, mR, aEnd, a0, ys, k;

    cy = 48;
    d = 'M96 ' + cy
      + ' C110 ' + (cy - 30) + ' 142 ' + (cy - 34) + ' 180 ' + (cy - 34)
      + ' C218 ' + (cy - 34) + ' 250 ' + (cy - 30) + ' 264 ' + cy
      + ' C250 ' + (cy + 30) + ' 218 ' + (cy + 34) + ' 180 ' + (cy + 34)
      + ' C142 ' + (cy + 34) + ' 110 ' + (cy + 30) + ' 96 ' + cy + ' Z';
    s += '<defs>';
    s += '<clipPath id="fgx-sarc-belly"><path d="' + d + '"/></clipPath>';
    s += '<clipPath id="fgx-sarc-fiber"><rect x="32" y="132" width="292" height="36" rx="18"/></clipPath>';
    s += '<clipPath id="fgx-sarc-fib"><rect x="40" y="232" width="284" height="32" rx="8"/></clipPath>';
    s += '</defs>';

    s += '<g data-part="muscle">';
    s += '<line x1="22" y1="' + cy + '" x2="108" y2="' + cy + '" stroke="' + C8 + '" stroke-width="7" stroke-linecap="round"/>';
    s += '<line x1="252" y1="' + cy + '" x2="322" y2="' + cy + '" stroke="' + C8 + '" stroke-width="7" stroke-linecap="round"/>';
    s += '<path d="' + d + '" fill="' + C2S + '" stroke="' + C2 + '" stroke-width="2" stroke-linejoin="round"/>';
    s += '<g clip-path="url(#fgx-sarc-belly)">';
    for (i = 0; i < 6; i++) {
      s += rect(112 + i * 24, cy - 36, 9, 72, 'fill="' + C2 + '"');
    }
    s += '</g>';
    s += sideText(cy, '골격근', '뼈에 붙은 근육');
    s += rect(8, 8, 536, 78, 'class="fgx-hit" fill="transparent"');
    s += '</g>';

    s += zoomMark(104);

    cy = 150;
    s += '<g data-part="fiber">';
    s += rect(32, cy - 18, 292, 36, 'rx="18" fill="' + C7S + '" stroke="' + C7 + '" stroke-width="2"');
    s += '<g clip-path="url(#fgx-sarc-fiber)">';
    for (i = -1; i <= 1; i++) {
      s += '<line x1="50" y1="' + (cy + i * 8) + '" x2="306" y2="' + (cy + i * 8) + '" stroke="' + C7 + '" stroke-width="1.5" stroke-linecap="round"/>';
    }
    s += '</g>';
    for (i = 0; i < 3; i++) {
      s += '<ellipse cx="' + (108 + i * 70) + '" cy="' + (cy + 9) + '" rx="11" ry="5.5" fill="' + C5S + '" stroke="' + C5 + '" stroke-width="1.5"/>';
    }
    s += sideText(cy, '근섬유', '세포 1개(핵 여러 개)');
    s += rect(8, 112, 536, 76, 'class="fgx-hit" fill="transparent"');
    s += '</g>';

    s += zoomMark(206);

    fibY = 232;
    fibH = 32;
    pitch = 46;
    aW = round2(pitch * MYOSIN_UM / RELAX);
    iW = round2((pitch - aW) / 2);
    s += '<g data-part="myofibril">';
    s += rect(40, fibY, 284, fibH, 'rx="8" fill="' + C6S + '"');
    s += '<g clip-path="url(#fgx-sarc-fib)">';
    for (i = 0; i < 6; i++) {
      x0 = 46 + i * pitch;
      s += rect(x0 + iW, fibY, aW, fibH, 'fill="' + C2 + '"');
    }
    for (i = 0; i <= 6; i++) {
      x0 = 46 + i * pitch;
      s += '<line x1="' + x0 + '" y1="' + (fibY + 2) + '" x2="' + x0 + '" y2="' + (fibY + fibH - 2) + '" stroke="' + ZC + '" stroke-width="1.5" stroke-dasharray="2.5 2" stroke-linecap="round"/>';
    }
    s += '</g>';
    s += '<rect x="40" y="' + fibY + '" width="284" height="' + fibH + '" rx="8" fill="none" stroke="' + C8 + '" stroke-width="1.5"/>';
    s += '<rect x="' + (46 + 2 * pitch - 3) + '" y="' + (fibY - 5) + '" width="' + (pitch + 6) + '" height="' + (fibH + 10) + '" rx="4" fill="none" stroke="' + ACCENT + '" stroke-width="2"/>';
    s += sideText(248, '근육 원섬유', '근섬유 속 가는 실');
    s += rect(8, 214, 536, 72, 'class="fgx-hit" fill="transparent"');
    s += '</g>';

    s += zoomMark(308);

    zL = 78;
    zR = 276;
    unit = (zR - zL) / RELAX;
    mL = (zL + zR) / 2 - 0.8 * unit;
    mR = (zL + zR) / 2 + 0.8 * unit;
    aEnd = zL + ACTIN_UM * unit;
    a0 = zR - ACTIN_UM * unit;
    ys = [356, 372, 388, 404];
    s += '<g data-part="sarcomere">';
    s += '<text x="' + ((zL + zR) / 2) + '" y="328" text-anchor="middle" font-size="16" font-weight="700" fill="' + INK + '">근육 원섬유 마디</text>';
    s += '<path d="M' + num(zL) + ' 344 L' + num(zL) + ' 334 L' + num(zR) + ' 334 L' + num(zR) + ' 344" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>';
    s += '<line x1="' + num(zL) + '" y1="350" x2="' + num(zL) + '" y2="410" stroke="' + ZC + '" stroke-width="4" stroke-linecap="round"/>';
    s += '<line x1="' + num(zR) + '" y1="350" x2="' + num(zR) + '" y2="410" stroke="' + ZC + '" stroke-width="4" stroke-linecap="round"/>';
    s += '<text x="' + num(zL - 16) + '" y="384" text-anchor="middle" font-size="15" font-weight="700" fill="' + INK + '">Z</text>';
    s += '<text x="' + num(zR + 16) + '" y="384" text-anchor="middle" font-size="15" font-weight="700" fill="' + INK + '">Z</text>';
    for (k = 0; k < ys.length; k++) {
      if (k % 2 === 0) {
        s += rect(zL, ys[k] - 2, aEnd - zL, 4, 'rx="2" fill="' + C1 + '"');
        s += rect(a0, ys[k] - 2, zR - a0, 4, 'rx="2" fill="' + C1 + '"');
      } else {
        s += rect(mL, ys[k] - 4, mR - mL, 8, 'rx="4" fill="' + C2 + '"');
      }
    }
    s += '<line x1="' + num((zL + zR) / 2) + '" y1="352" x2="' + num((zL + zR) / 2) + '" y2="408" stroke="' + ZC + '" stroke-width="2" stroke-linecap="round"/>';
    s += sideText(372, '근육 원섬유 마디', '수축의 기본 단위');
    s += rect(8, 316, 536, 100, 'class="fgx-hit" fill="transparent"');
    s += '</g>';
    return s;
  }

  function setX(nodes, x) {
    var i;
    for (i = 0; i < nodes.length; i++) nodes[i].setAttribute('x', num(x));
  }

  function applyContract(svg, c) {
    var q = function (sel) { return svg.querySelector(sel); };
    var qa = function (sel) { return Array.prototype.slice.call(svg.querySelectorAll(sel)); };
    var e = c.edges;
    var specs = [
      ['il', 0, 1, 16],
      ['ol', 1, 2, 44],
      ['h', 2, 3, 16],
      ['or', 3, 4, 44],
      ['ir', 4, 5, 16]
    ];
    var i, w, x, node, ln, tx, n, hw, hx, lenEl, dim, hit, guide;

    var zl = q('.js-zl');
    var zr = q('.js-zr');
    if (zl) zl.setAttribute('transform', 'translate(' + num(c.zL) + ',0)');
    if (zr) zr.setAttribute('transform', 'translate(' + num(c.zR) + ',0)');

    setX(qa('.js-act-l'), c.zL);
    setX(qa('.js-act-r'), c.zR - ACTIN_U);
    setX(qa('.js-nb-al'), c.zL - ACTIN_U);
    setX(qa('.js-nb-ar'), c.zR);
    setX(qa('.js-nb-ml'), c.zL - c.len * (UM / 2) - MY_HALF);
    setX(qa('.js-nb-mr'), c.zR + c.len * (UM / 2) - MY_HALF);

    lenEl = q('.js-len');
    if (lenEl) lenEl.textContent = '마디 X = ' + c.len.toFixed(2) + ' μm';
    dim = q('.js-dim');
    if (dim) dim.setAttribute('d', dimPath(c.zL, c.zR));
    hit = q('.js-sarc-hit');
    if (hit) {
      hit.setAttribute('x', num(c.zL));
      hit.setAttribute('width', num(c.zR - c.zL));
    }
    guide = q('.js-guide-l');
    if (guide) {
      guide.setAttribute('x1', num(c.zL));
      guide.setAttribute('x2', num(c.zL));
    }
    guide = q('.js-guide-r');
    if (guide) {
      guide.setAttribute('x1', num(c.zR));
      guide.setAttribute('x2', num(c.zR));
    }

    for (i = 0; i < specs.length; i++) {
      x = e[specs[i][1]];
      w = e[specs[i][2]] - x;
      if (w < 0) w = 0;
      node = q('.js-b-' + specs[i][0]);
      if (node) {
        node.setAttribute('x', num(x));
        node.setAttribute('width', num(w));
        node.setAttribute('stroke-width', w < 1 ? '0' : '1.5');
      }
      node = q('.js-bt-' + specs[i][0]);
      if (node) {
        node.setAttribute('x', num(x + w / 2));
        node.setAttribute('visibility', bandTextOn(w, specs[i][3]));
      }
    }
    var folds = qa('.js-h-fold');
    var foldVis = (e[3] - e[2]) < 4 ? 'visible' : 'hidden';
    for (i = 0; i < folds.length; i++) folds[i].setAttribute('visibility', foldVis);
    node = q('.js-h-hit');
    if (node) {
      w = e[3] - e[2];
      hw = w >= 16 ? w : 16;
      hx = w >= 16 ? e[2] : CX - 8;
      node.setAttribute('x', num(hx));
      node.setAttribute('width', num(hw));
    }

    node = q('.js-ruler');
    if (node) {
      node.setAttribute('x1', num(c.zL));
      node.setAttribute('x2', num(c.zL + 3 * UM));
    }
    var ticks = qa('.js-tick');
    for (i = 0; i < ticks.length; i++) {
      n = Number(ticks[i].getAttribute('data-i'));
      x = c.zL + n * UM;
      ln = ticks[i].querySelector('.js-tick-ln');
      tx = ticks[i].querySelector('.js-tick-tx');
      if (ln) {
        ln.setAttribute('x1', num(x));
        ln.setAttribute('x2', num(x));
      }
      if (tx) tx.setAttribute('x', num(x));
    }
  }

  NMFIG.define('sarcomere', {
    viewBox: [560, 420],
    views: [
      { id: 'contract', label: '마디 수축' },
      { id: 'hierarchy', label: '근육 → 마디' }
    ],
    controls: [
      {
        id: 'len',
        type: 'range',
        label: '근육 원섬유 마디 길이 X',
        min: 2.4,
        max: 3.0,
        step: 0.01,
        value: 3.0,
        fmt: function (val) { return Number(val).toFixed(2) + ' μm'; },
        views: ['contract']
      }
    ],
    animate: { control: 'len', from: 3.0, to: 2.4, duration: 6000, loop: true, views: ['contract'] },
    _calc: calc,
    _readout: readoutOf,
    render: function (v, view) {
      if (view === 'hierarchy') return renderHierarchy();
      return renderContract(v);
    },
    update: function (ctx) {
      if (!ctx || ctx.view !== 'contract') return { readout: '' };
      var c = calc(ctx.v);
      if (ctx.svg && ctx.svg.querySelector) applyContract(ctx.svg, c);
      return { readout: readoutOf(c) };
    }
  });
})(window.NMFIG);
