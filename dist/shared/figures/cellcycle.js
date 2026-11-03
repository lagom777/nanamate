/* 염색체 구조와 세포 주기·체세포 분열.
 * 보기 cycle: 왼쪽 고리(pos), 오른쪽 세포, 아래 핵 1개당 DNA 상대량.
 * 보기 chromosome: DNA→히스톤→염색질→염색체, 아래 상동 염색체 한 쌍.
 * 컨트롤 pos(0~1, 세포 주기의 위치), rep(before/after).
 * 구간은 글 자료와 같다. G₁ 0–0.30, S 0.30–0.55, G₂ 0.55–0.72,
 * 전기 0.72–0.80, 중기 0.80–0.86, 후기 0.86–0.92, 말기 0.92–0.95, 세포질 분열 0.95–1.
 * 세포 안 염색체 길이 비는 긴:짧은 = 3:2 (모계 빨강, 부계 파랑).
 */
(function (NMFIG) {
  'use strict';

  var RCX = 150;
  var RCY = 165;
  var RO = 115;
  var RI = 72;
  var CCX = 420;
  var CCY = 156;
  var DAU = 66;

  var RED = 'var(--fgx-c2, #dc2626)';
  var BLU = 'var(--fgx-c1, #2563eb)';
  var TEAL = 'var(--fgx-c6, #0891b2)';
  var GRN = 'var(--fgx-c4, #16a34a)';
  var PUR = 'var(--fgx-c5, #7c3aed)';
  var ORN = 'var(--fgx-c3, #d97706)';
  var PNK = 'var(--fgx-c7, #db2777)';
  var INK = 'var(--fgx-ink, #1a1f2e)';
  var DIM = 'var(--fgx-dim, #4a5468)';
  var LINE = 'var(--fgx-line, rgba(0,0,0,.18))';
  var ELEV = 'var(--fgx-elev, #f5f7fa)';
  var CARD = 'var(--fgx-card, #fff)';

  /* 긴 것 반길이 18, 짧은 것 12 → 전체 길이 36:24 = 3:2. 적도판 칸 사이 틈 8. */
  var CHRS = [
    { len: 18, slot: -54, sx: -22, sy: -18, rot: -16, col: RED },
    { len: 12, slot: -16, sx: 20, sy: -10, rot: 12, col: RED },
    { len: 18, slot: 22, sx: -18, sy: 16, rot: 18, col: BLU },
    { len: 12, slot: 60, sx: 20, sy: 22, rot: -14, col: BLU }
  ];

  var PHASES = [
    { id: 'g1', name: 'G₁기', a: 0, b: 0.30, fill: TEAL, label: 'G₁', lr: 0.15 },
    { id: 's_phase', name: 'S기', a: 0.30, b: 0.55, fill: GRN, label: 'S', lr: 0.425 },
    { id: 'g2', name: 'G₂기', a: 0.55, b: 0.72, fill: BLU, label: 'G₂', lr: 0.635 },
    { id: 'prophase', name: '전기', a: 0.72, b: 0.80, fill: '#fecaca' },
    { id: 'metaphase', name: '중기', a: 0.80, b: 0.86, fill: '#fb7185' },
    { id: 'anaphase', name: '후기', a: 0.86, b: 0.92, fill: '#ef4444', label: 'M', lr: 0.89 },
    { id: 'telophase', name: '말기', a: 0.92, b: 0.95, fill: '#dc2626' },
    { id: 'cytokinesis', name: '세포질 분열', a: 0.95, b: 1.02, fill: '#991b1b' }
  ];

  var GX0 = 82;
  var GX1 = 532;
  var GY0 = 414;
  var GY1 = 342;

  function n(v) {
    var x = Math.round(v * 10) / 10;
    if (x === 0) return '0';
    return String(x);
  }

  function clamp01(t) {
    if (t < 0) return 0;
    if (t > 1) return 1;
    return t;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smooth(t) {
    t = clamp01(t);
    return t * t * (3 - 2 * t);
  }

  function linSeg(pos, a, b) {
    return clamp01((pos - a) / (b - a));
  }

  function seg(pos, a, b) {
    return smooth(linSeg(pos, a, b));
  }

  function numPos(v) {
    var p = Number(v);
    if (p !== p) p = 0.1;
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    return p;
  }

  function phaseAt(pos) {
    var i;
    for (i = 0; i < PHASES.length; i++) {
      if (pos < PHASES[i].b || i === PHASES.length - 1) return PHASES[i];
    }
    return PHASES[0];
  }

  function dnaRel(pos) {
    if (pos < 0.30) return 1;
    if (pos < 0.55) return 1 + (pos - 0.30) / 0.25;
    if (pos < 0.95) return 2;
    if (pos >= 1) return 1;
    return 2 - (pos - 0.95) / 0.05;
  }

  function chromN(pos) {
    if (pos >= 0.86 && pos < 0.95) return 8;
    return 4;
  }

  function fmtDna(v) {
    var x = Math.round(v * 10) / 10;
    if (Math.abs(x - Math.round(x)) < 0.001) return String(Math.round(x));
    return x.toFixed(1);
  }

  function nameColor(id) {
    if (id === 'g1') return TEAL;
    if (id === 's_phase') return GRN;
    if (id === 'g2') return BLU;
    return RED;
  }

  function readoutOf(pos) {
    var ph = phaseAt(pos);
    var dna = fmtDna(dnaRel(pos));
    var a;
    var b;
    if (ph.id === 'g1') {
      a = 'G₁기 · 핵 1개당 DNA 상대량 1';
      b = '염색체 수 4개 (2n=4), 염색 분체 1개씩';
    } else if (ph.id === 's_phase') {
      a = 'S기 · 핵 1개당 DNA 상대량 ' + dna + ' (1→2 증가)';
      b = '염색체 수 4개 (2n=4), 염색 분체 복제 중';
    } else if (ph.id === 'g2') {
      a = 'G₂기 · 핵 1개당 DNA 상대량 2';
      b = '염색체 수 4개 (2n=4), 염색 분체 2개씩';
    } else if (ph.id === 'prophase' || ph.id === 'metaphase') {
      a = ph.name + ' · 핵 1개당 DNA 상대량 2';
      b = '염색체 수 4개 (2n=4), 염색 분체 2개씩';
    } else if (ph.id === 'anaphase' || ph.id === 'telophase') {
      a = ph.name + ' · 핵 1개당 DNA 상대량 2';
      b = '염색체 수 일시적으로 8개(2배)';
    } else {
      a = '세포질 분열 · 딸세포 핵 1개당 DNA 상대량 ' + dna + ' (2→1)';
      b = '딸세포 하나당 염색체 수 4개 (2n=4)';
    }
    return a + '\n' + b;
  }

  function phaseLines(ph) {
    if (ph.id === 'cytokinesis') return ['세포질', '분열'];
    return [ph.name, ''];
  }

  function polar(r, t) {
    var ang = -Math.PI / 2 + t * Math.PI * 2;
    return { x: RCX + r * Math.cos(ang), y: RCY + r * Math.sin(ang) };
  }

  function ringSlice(a, b) {
    var large = (b - a) > 0.5 ? 1 : 0;
    var o0 = polar(RO, a);
    var o1 = polar(RO, b);
    var i1 = polar(RI, b);
    var i0 = polar(RI, a);
    return 'M ' + n(o0.x) + ' ' + n(o0.y)
      + ' A ' + RO + ' ' + RO + ' 0 ' + large + ' 1 ' + n(o1.x) + ' ' + n(o1.y)
      + ' L ' + n(i1.x) + ' ' + n(i1.y)
      + ' A ' + RI + ' ' + RI + ' 0 ' + large + ' 0 ' + n(i0.x) + ' ' + n(i0.y)
      + ' Z';
  }

  function arcD(a, b, r) {
    var large = (b - a) > 0.5 ? 1 : 0;
    var p0 = polar(r, a);
    var p1 = polar(r, b);
    return 'M ' + n(p0.x) + ' ' + n(p0.y)
      + ' A ' + n(r) + ' ' + n(r) + ' 0 ' + large + ' 1 ' + n(p1.x) + ' ' + n(p1.y);
  }

  function bracketD(a, b, r) {
    var sIn = polar(r - 9, a);
    var s = polar(r, a);
    var e = polar(r, b);
    var eIn = polar(r - 9, b);
    var large = (b - a) > 0.5 ? 1 : 0;
    return 'M ' + n(sIn.x) + ' ' + n(sIn.y)
      + ' L ' + n(s.x) + ' ' + n(s.y)
      + ' A ' + n(r) + ' ' + n(r) + ' 0 ' + large + ' 1 ' + n(e.x) + ' ' + n(e.y)
      + ' L ' + n(eIn.x) + ' ' + n(eIn.y);
  }

  function ellipseD(cx, cy, rx, ry) {
    return 'M ' + n(cx - rx) + ' ' + n(cy)
      + ' A ' + n(rx) + ' ' + n(ry) + ' 0 1 1 ' + n(cx + rx) + ' ' + n(cy)
      + ' A ' + n(rx) + ' ' + n(ry) + ' 0 1 1 ' + n(cx - rx) + ' ' + n(cy)
      + ' Z';
  }

  function peanutD(cx, cy, rx, ry, pinch) {
    var neck;
    var xL;
    var xR;
    var cin;
    if (pinch < 0.03) return ellipseD(cx, cy, rx, ry);
    neck = ry * (1 - 0.9 * pinch);
    xL = cx - rx;
    xR = cx + rx;
    cin = rx * 0.38;
    return 'M ' + n(xL) + ' ' + n(cy)
      + ' C ' + n(xL) + ' ' + n(cy - ry * 0.92) + ' ' + n(cx - cin) + ' ' + n(cy - neck) + ' ' + n(cx) + ' ' + n(cy - neck)
      + ' C ' + n(cx + cin) + ' ' + n(cy - neck) + ' ' + n(xR) + ' ' + n(cy - ry * 0.92) + ' ' + n(xR) + ' ' + n(cy)
      + ' C ' + n(xR) + ' ' + n(cy + ry * 0.92) + ' ' + n(cx + cin) + ' ' + n(cy + neck) + ' ' + n(cx) + ' ' + n(cy + neck)
      + ' C ' + n(cx - cin) + ' ' + n(cy + neck) + ' ' + n(xL) + ' ' + n(cy + ry * 0.92) + ' ' + n(xL) + ' ' + n(cy)
      + ' Z';
  }

  function wave(x, y, len, amp, phase) {
    var steps = 10;
    var i;
    var t;
    var d = '';
    for (i = 0; i <= steps; i++) {
      t = i / steps;
      d += (i ? ' L ' : 'M ') + n(x + len * t) + ' ' + n(y + Math.sin(phase + t * Math.PI * 2.4) * amp);
    }
    return d;
  }

  function armPath(side, len, spread, straight) {
    var w;
    var tip;
    var c1;
    var c2;
    if (straight > 0.97) return 'M 0 ' + n(-len) + ' L 0 ' + n(len);
    w = spread * (1 - straight);
    tip = side * w;
    c1 = side * w * 0.22;
    c2 = side * w * 1.02;
    return 'M 0 0 C ' + n(c1) + ' ' + n(-len * 0.14) + ' ' + n(c2) + ' ' + n(-len * 0.58) + ' ' + n(tip) + ' ' + n(-len)
      + ' M 0 0 C ' + n(c1) + ' ' + n(len * 0.14) + ' ' + n(c2) + ' ' + n(len * 0.58) + ' ' + n(tip) + ' ' + n(len);
  }

  function gx(pos) {
    return GX0 + (GX1 - GX0) * pos;
  }

  function gy(dna) {
    return GY0 - (GY0 - GY1) * (dna / 2.5);
  }

  function visOf(op) {
    return op < 0.03 ? 'hidden' : 'visible';
  }

  function geom(pos) {
    var ph = phaseAt(pos);
    var lines = phaseLines(ph);
    var two = pos >= 0.95;
    var elon = seg(pos, 0.86, 0.935);
    var pinch = two ? 0 : seg(pos, 0.908, 0.949);
    var cellRx = lerp(98, 114, elon);
    var cellRy = lerp(100, 90, elon);
    var cenT = seg(pos, 0.60, 0.80);
    var pole = lerp(76, 90, elon);
    var topY = CCY - 70;
    var cenL = { x: lerp(CCX - 8, CCX - pole, cenT), y: lerp(topY, CCY, cenT) };
    var cenR = { x: lerp(CCX + 8, CCX + pole, cenT), y: lerp(topY, CCY, cenT) };
    var cenOp = 0;
    var toPlate = seg(pos, 0.745, 0.825);
    var split = seg(pos, 0.86, 0.915);
    var arrive = seg(pos, 0.905, 0.945);
    var sc = lerp(lerp(0.76, 1, toPlate), 0.6, arrive);
    var sep = split * DAU;
    var cond = 0;
    var i;
    var c;
    var chrs = [];
    var reach = 0;
    var spinOp = 0;
    var spins = [];
    var side;
    var kinX;
    var poleP;
    var nucOp = 1;
    var dash = 'none';
    var mainChrom;
    var repl;
    var dauNuc;
    var dauThread;
    var eq = 0.2;
    var mk;
    var oneY;
    var twoY;

    if (pos >= 0.58 && pos < 0.66) cenOp = linSeg(pos, 0.58, 0.66);
    else if (pos >= 0.66 && pos < 0.932) cenOp = 1;
    else if (pos >= 0.932 && pos < 0.952) cenOp = 1 - linSeg(pos, 0.932, 0.952);

    if (pos >= 0.70 && pos < 0.78) cond = seg(pos, 0.70, 0.78);
    else if (pos >= 0.78 && pos < 0.922) cond = 1;
    else if (pos >= 0.922) cond = 1 - seg(pos, 0.922, 0.958);

    for (i = 0; i < CHRS.length; i++) {
      c = CHRS[i];
      chrs.push({
        x: lerp(CCX + c.sx, CCX, toPlate),
        y: lerp(CCY + c.sy, CCY + c.slot, toPlate),
        rot: lerp(c.rot, 0, toPlate),
        sep: sep,
        len: c.len,
        col: c.col,
        dL: armPath(-1, c.len * sc, Math.max(7.5, c.len * 0.64) * sc, split),
        dR: armPath(1, c.len * sc, Math.max(7.5, c.len * 0.64) * sc, split)
      });
    }

    if (pos >= 0.748 && pos < 0.82) reach = seg(pos, 0.748, 0.82);
    else if (pos >= 0.82) reach = 1;
    if (pos >= 0.748 && pos < 0.81) spinOp = seg(pos, 0.748, 0.81);
    else if (pos >= 0.81 && pos < 0.938) spinOp = 1;
    else if (pos >= 0.938) spinOp = 1 - seg(pos, 0.938, 0.962);

    for (i = 0; i < chrs.length; i++) {
      for (side = 0; side < 2; side++) {
        kinX = side ? chrs[i].x + chrs[i].sep : chrs[i].x - chrs[i].sep;
        poleP = side ? cenR : cenL;
        spins.push({
          x1: poleP.x,
          y1: poleP.y,
          x2: lerp(poleP.x, kinX, reach),
          y2: lerp(poleP.y, chrs[i].y, reach)
        });
      }
    }

    if (pos >= 0.72 && pos < 0.81) {
      nucOp = 1 - seg(pos, 0.72, 0.808);
      dash = '4 3.5';
    } else if (pos >= 0.81) nucOp = 0;

    mainChrom = pos < 0.72 ? 1 : (pos < 0.80 ? 1 - seg(pos, 0.72, 0.80) : 0);
    repl = pos <= 0.30 ? 0 : (pos >= 0.55 ? 1 : (pos - 0.30) / 0.25);
    dauNuc = pos < 0.916 ? 0 : seg(pos, 0.916, 0.948);
    dauThread = pos < 0.932 ? 0 : seg(pos, 0.932, 0.966);

    if (pos >= 0.782 && pos < 0.80) eq = lerp(0.2, 1, linSeg(pos, 0.782, 0.80));
    else if (pos >= 0.80 && pos < 0.86) eq = 1;
    else if (pos >= 0.86 && pos < 0.905) eq = lerp(1, 0.2, linSeg(pos, 0.86, 0.905));

    mk = polar(84, pos);
    if (lines[1]) {
      oneY = 158;
      twoY = 182;
    } else {
      oneY = 172;
      twoY = 182;
    }

    return {
      pos: pos,
      phaseId: ph.id,
      l1: lines[0],
      l2: lines[1],
      y1: oneY,
      y2: twoY,
      l2vis: lines[1] ? 'visible' : 'hidden',
      fill: nameColor(ph.id),
      two: two,
      mem: peanutD(CCX, CCY, cellRx, cellRy, pinch),
      nucOp: nucOp,
      dash: dash,
      mainChrom: mainChrom,
      repl: repl,
      sw: lerp(2.3, 3.15, repl),
      dauNuc: dauNuc,
      dauThread: dauThread,
      cond: cond,
      chrs: chrs,
      cenOp: cenOp,
      cenL: cenL,
      cenR: cenR,
      spinOp: spinOp,
      spins: spins,
      eq: eq,
      mx: mk.x,
      my: mk.y,
      dx: gx(pos),
      dy: gy(dnaRel(pos))
    };
  }

  function halo(x, y, str, size) {
    return '<text x="' + n(x) + '" y="' + n(y) + '" font-size="' + size
      + '" text-anchor="middle" font-weight="700" fill="#ffffff" stroke="#0f172a" stroke-width="3" paint-order="stroke fill" stroke-linejoin="round">'
      + str + '</text>';
  }

  function label(x, y, str, size, fill, extra) {
    return '<text x="' + n(x) + '" y="' + n(y) + '" font-size="' + size + '" fill="' + fill + '"'
      + (extra ? ' ' + extra : '') + '>' + str + '</text>';
  }

  function threadPair(cx, cy, y, len, amp, phase, col, sw, repl) {
    var d1 = wave(cx - len / 2, cy + y, len, amp, phase);
    var d2 = wave(cx - len / 2, cy + y + 5, len, amp, phase + 0.6);
    return '<path class="js-s1" d="' + d1 + '" fill="none" stroke="' + col + '" stroke-width="' + n(sw) + '" stroke-linecap="round"/>'
      + '<path class="js-s2" d="' + d2 + '" fill="none" stroke="' + col + '" stroke-width="' + n(sw) + '" stroke-linecap="round" opacity="' + n(repl) + '"/>';
  }

  function ringMarkup() {
    var gap = 0.0045;
    var s = [];
    var i;
    var p;
    var a;
    var b;
    var mid;
    var pt;
    var br;
    var hit;
    for (i = 0; i < PHASES.length; i++) {
      p = PHASES[i];
      a = p.a + gap;
      b = Math.min(p.b, 1) - gap;
      if (b > 1) b = 1 - gap;
      s.push('<g data-part="' + p.id + '">');
      s.push('<path class="fgx-vis" d="' + ringSlice(a, b) + '" fill="' + p.fill + '"/>');
      if (p.label) {
        pt = polar(104, p.lr);
        s.push(halo(pt.x, pt.y + 5, p.label, 16));
      }
      s.push('</g>');
    }
    br = bracketD(0.02, 0.70, 130);
    hit = arcD(0.02, 0.70, 130);
    mid = polar(158, 0.36);
    s.push('<g data-part="interphase">');
    s.push('<path d="' + hit + '" fill="none" stroke="transparent" stroke-width="18" class="fgx-hit" style="pointer-events:stroke"/>');
    s.push('<path class="fgx-vis" d="' + br + '" fill="none" stroke="' + DIM + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>');
    s.push(label(mid.x, mid.y + 5, '간기', 16, INK, 'text-anchor="middle" font-weight="700"'));
    s.push('</g>');
    br = bracketD(0.735, 0.985, 130);
    hit = arcD(0.735, 0.985, 130);
    mid = polar(156, 0.86);
    s.push('<g data-part="m_phase">');
    s.push('<path d="' + hit + '" fill="none" stroke="transparent" stroke-width="18" class="fgx-hit" style="pointer-events:stroke"/>');
    s.push('<path class="fgx-vis" d="' + br + '" fill="none" stroke="' + RED + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>');
    s.push(label(mid.x, mid.y + 5, '분열기', 16, INK, 'text-anchor="middle" font-weight="700"'));
    s.push('</g>');
    return s.join('');
  }

  function graphStatic() {
    var s = [];
    var i;
    var p;
    var x0;
    var x1;
    var d;
    var keys;
    var dna;
    s.push(label(GX0, 328, 'DNA 상대량', 15, INK, 'font-weight="700"'));
    s.push('<line x1="' + GX0 + '" y1="' + n(gy(2.55)) + '" x2="' + GX0 + '" y2="' + GY0 + '" stroke="' + DIM + '" stroke-width="1.5"/>');
    s.push('<line x1="' + GX0 + '" y1="' + GY0 + '" x2="' + GX1 + '" y2="' + GY0 + '" stroke="' + DIM + '" stroke-width="1.5"/>');
    s.push('<line x1="' + GX0 + '" y1="' + n(gy(1)) + '" x2="' + GX1 + '" y2="' + n(gy(1)) + '" stroke="' + LINE + '" stroke-width="1"/>');
    s.push('<line x1="' + GX0 + '" y1="' + n(gy(2)) + '" x2="' + GX1 + '" y2="' + n(gy(2)) + '" stroke="' + LINE + '" stroke-width="1"/>');
    s.push(label(GX0 - 8, gy(1) + 5, '1', 15, DIM, 'text-anchor="end"'));
    s.push(label(GX0 - 8, gy(2) + 5, '2', 15, DIM, 'text-anchor="end"'));
    for (i = 0; i < PHASES.length; i++) {
      p = PHASES[i];
      x0 = gx(p.a);
      x1 = gx(Math.min(p.b, 1));
      s.push('<rect x="' + n(x0) + '" y="' + GY0 + '" width="' + n(x1 - x0) + '" height="8" fill="' + p.fill + '"/>');
    }
    keys = [0, 0.30, 0.55, 0.95, 1];
    d = '';
    for (i = 0; i < keys.length; i++) {
      dna = dnaRel(keys[i]);
      d += (i ? ' L ' : 'M ') + n(gx(keys[i])) + ' ' + n(gy(dna));
    }
    s.push('<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>');
    return s.join('');
  }

  function cycleMarkup(g) {
    var s = [];
    var i;
    var c;
    var side;
    s.push('<circle cx="' + RCX + '" cy="' + RCY + '" r="70" fill="' + CARD + '"/>');
    s.push(ringMarkup());
    s.push('<text text-anchor="middle" font-weight="700" fill="' + g.fill + '">');
    s.push('<tspan class="js-l1" x="' + RCX + '" y="' + g.y1 + '" font-size="22">' + g.l1 + '</tspan>');
    s.push('<tspan class="js-l2" x="' + RCX + '" y="' + g.y2 + '" font-size="22" visibility="' + g.l2vis + '">' + g.l2 + '</tspan>');
    s.push('</text>');
    s.push('<g class="js-marker" transform="translate(' + n(g.mx) + ' ' + n(g.my) + ')">');
    s.push('<circle r="7" fill="#ffffff" stroke="' + INK + '" stroke-width="2.5"/>');
    s.push('<circle r="3.2" fill="' + INK + '"/>');
    s.push('</g>');

    s.push('<path class="js-mem" d="' + g.mem + '" fill="' + ELEV + '" stroke="#475569" stroke-width="2.4" style="pointer-events:none" display="' + (g.two ? 'none' : 'inline') + '"/>');
    s.push('<path class="js-memL" d="' + ellipseD(CCX - DAU, CCY, 46, 98) + '" fill="' + ELEV + '" stroke="#475569" stroke-width="2.4" style="pointer-events:none" display="' + (g.two ? 'inline' : 'none') + '"/>');
    s.push('<path class="js-memR" d="' + ellipseD(CCX + DAU, CCY, 46, 98) + '" fill="' + ELEV + '" stroke="#475569" stroke-width="2.4" style="pointer-events:none" display="' + (g.two ? 'inline' : 'none') + '"/>');

    s.push('<g data-part="equator">');
    s.push('<line class="js-eq fgx-vis" x1="' + CCX + '" y1="62" x2="' + CCX + '" y2="252" stroke="' + PNK + '" stroke-width="2.5" stroke-dasharray="5 4" stroke-linecap="round" stroke-opacity="' + n(g.eq) + '"/>');
    s.push('<rect class="fgx-hit" x="' + (CCX - 12) + '" y="62" width="24" height="190" fill="transparent" style="pointer-events:all"/>');
    s.push('</g>');

    s.push('<g data-part="spindle" class="js-spin" style="pointer-events:' + (g.spinOp > 0.12 ? 'all' : 'none') + '">');
    for (i = 0; i < g.spins.length; i++) {
      c = g.spins[i];
      s.push('<line class="js-sp js-sp-hit" x1="' + n(c.x1) + '" y1="' + n(c.y1) + '" x2="' + n(c.x2) + '" y2="' + n(c.y2) + '" stroke="transparent" stroke-width="16" stroke-linecap="round"/>');
      s.push('<line class="js-sp fgx-vis" x1="' + n(c.x1) + '" y1="' + n(c.y1) + '" x2="' + n(c.x2) + '" y2="' + n(c.y2) + '" stroke="#64748b" stroke-width="1.8" stroke-linecap="round" stroke-opacity="' + n(g.spinOp) + '"/>');
    }
    s.push('</g>');

    s.push('<ellipse class="js-nuc" cx="' + CCX + '" cy="' + (CCY + 4) + '" rx="54" ry="46" fill="#f5f3ff" stroke="' + PUR + '" stroke-width="2.2" stroke-dasharray="' + g.dash + '" opacity="' + n(g.nucOp) + '" visibility="' + visOf(g.nucOp) + '" style="pointer-events:none"/>');
    s.push('<circle class="js-nucl" cx="' + (CCX + 16) + '" cy="' + (CCY - 12) + '" r="6.5" fill="' + PUR + '" opacity="' + n(g.nucOp) + '" visibility="' + visOf(g.nucOp) + '" style="pointer-events:none"/>');

    s.push('<g class="js-threads" opacity="' + n(g.mainChrom) + '" visibility="' + visOf(g.mainChrom) + '" style="pointer-events:none">');
    s.push(threadPair(CCX, CCY + 4, -22, 48, 4.2, 0.3, RED, g.sw, g.repl));
    s.push(threadPair(CCX, CCY + 4, -6, 32, 3.6, 1.2, RED, g.sw, g.repl));
    s.push(threadPair(CCX, CCY + 4, 10, 48, 4.2, 2.1, BLU, g.sw, g.repl));
    s.push(threadPair(CCX, CCY + 4, 24, 32, 3.6, 0.7, BLU, g.sw, g.repl));
    s.push('</g>');

    for (side = 0; side < 2; side++) {
      s.push('<g class="js-dau" data-side="' + side + '" transform="translate(' + (CCX + (side ? DAU : -DAU)) + ' ' + CCY + ')" style="pointer-events:none" visibility="' + visOf(Math.max(g.dauNuc, g.dauThread)) + '">');
      s.push('<ellipse class="js-dnuc" cx="0" cy="0" rx="32" ry="52" fill="#f5f3ff" stroke="' + PUR + '" stroke-width="2" opacity="' + n(g.dauNuc) + '"/>');
      s.push('<circle class="js-dnucl" cx="10" cy="-16" r="5" fill="' + PUR + '" opacity="' + n(g.dauNuc) + '"/>');
      s.push('<g class="js-dthread" opacity="' + n(g.dauThread) + '">');
      s.push('<path d="' + wave(-18, -18, 36, 3.2, 0.4) + '" fill="none" stroke="' + RED + '" stroke-width="2.2" stroke-linecap="round"/>');
      s.push('<path d="' + wave(-12, -4, 24, 2.8, 1.1) + '" fill="none" stroke="' + RED + '" stroke-width="2.2" stroke-linecap="round"/>');
      s.push('<path d="' + wave(-18, 10, 36, 3.2, 2.0) + '" fill="none" stroke="' + BLU + '" stroke-width="2.2" stroke-linecap="round"/>');
      s.push('<path d="' + wave(-12, 22, 24, 2.8, 0.6) + '" fill="none" stroke="' + BLU + '" stroke-width="2.2" stroke-linecap="round"/>');
      s.push('</g></g>');
    }

    for (i = 0; i < g.chrs.length; i++) {
      c = g.chrs[i];
      s.push('<g class="js-chr" data-i="' + i + '" opacity="' + n(g.cond) + '" visibility="' + visOf(g.cond) + '" style="pointer-events:none" transform="translate(' + n(c.x) + ' ' + n(c.y) + ') rotate(' + n(c.rot) + ')">');
      s.push('<g class="js-armL" transform="translate(' + n(-c.sep) + ' 0)">');
      s.push('<path class="js-armd" d="' + c.dL + '" fill="none" stroke="' + c.col + '" stroke-width="4" stroke-linecap="round"/>');
      s.push('<circle r="3.1" fill="#ffffff" stroke="' + c.col + '" stroke-width="1.8"/>');
      s.push('</g>');
      s.push('<g class="js-armR" transform="translate(' + n(c.sep) + ' 0)">');
      s.push('<path class="js-armd" d="' + c.dR + '" fill="none" stroke="' + c.col + '" stroke-width="4" stroke-linecap="round"/>');
      s.push('<circle r="3.1" fill="#ffffff" stroke="' + c.col + '" stroke-width="1.8"/>');
      s.push('</g></g>');
    }

    s.push('<g class="js-cenL" opacity="' + n(g.cenOp) + '" visibility="' + visOf(g.cenOp) + '" style="pointer-events:none" transform="translate(' + n(g.cenL.x) + ' ' + n(g.cenL.y) + ')">');
    s.push('<circle cx="-4" cy="0" r="4.5" fill="#fff" stroke="' + ORN + '" stroke-width="2"/>');
    s.push('<circle cx="4" cy="0" r="4.5" fill="#fff" stroke="' + ORN + '" stroke-width="2"/>');
    s.push('</g>');
    s.push('<g class="js-cenR" opacity="' + n(g.cenOp) + '" visibility="' + visOf(g.cenOp) + '" style="pointer-events:none" transform="translate(' + n(g.cenR.x) + ' ' + n(g.cenR.y) + ')">');
    s.push('<circle cx="-4" cy="0" r="4.5" fill="#fff" stroke="' + ORN + '" stroke-width="2"/>');
    s.push('<circle cx="4" cy="0" r="4.5" fill="#fff" stroke="' + ORN + '" stroke-width="2"/>');
    s.push('</g>');

    s.push(graphStatic());
    s.push('<line class="js-guide" x1="' + n(g.dx) + '" y1="' + n(g.dy) + '" x2="' + n(g.dx) + '" y2="' + GY0 + '" stroke="#94a3b8" stroke-width="1.5"/>');
    s.push('<circle class="js-dot" cx="' + n(g.dx) + '" cy="' + n(g.dy) + '" r="5.5" fill="' + g.fill + '" stroke="#ffffff" stroke-width="2"/>');
    return s.join('');
  }

  function helixSvg(cx) {
    var top = 54;
    var h = 92;
    var amp = 16;
    var turns = 2.15;
    var N = 42;
    var A = [];
    var B = [];
    var i;
    var t;
    var ang;
    var y;
    var z;
    var segs;
    var front;
    var back;
    var rungs = [];
    var svg = [];
    var colorAt = [ORN, PUR];
    function collect(pts, want) {
      var out = [];
      var cur = null;
      var j;
      var on;
      for (j = 0; j < pts.length; j++) {
        on = want ? pts[j].z >= -0.08 : pts[j].z <= 0.08;
        if (!on) { cur = null; continue; }
        if (!cur) { cur = []; out.push(cur); }
        cur.push(pts[j]);
      }
      return out;
    }
    function drawSegs(list, stroke, width) {
      var j;
      var k;
      var d;
      for (j = 0; j < list.length; j++) {
        d = '';
        for (k = 0; k < list[j].length; k++) {
          d += (k ? ' L ' : 'M ') + n(list[j][k].x) + ' ' + n(list[j][k].y);
        }
        svg.push('<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="' + width + '" stroke-linecap="round" stroke-linejoin="round"/>');
      }
    }
    for (i = 0; i <= N; i++) {
      t = i / N;
      ang = t * turns * Math.PI * 2;
      y = top + h * t;
      z = Math.cos(ang);
      A.push({ x: cx + Math.sin(ang) * amp, y: y, z: z });
      B.push({ x: cx - Math.sin(ang) * amp, y: y, z: -z });
    }
    back = collect(A, false).concat(collect(B, false));
    front = collect(A, true).concat(collect(B, true));
    for (i = 2; i < N; i += 4) {
      if (Math.abs(A[i].x - B[i].x) < amp * 0.55) continue;
      rungs.push({ a: A[i], b: B[i], col: colorAt[(rungs.length) % 2] });
    }
    drawSegs(back, '#94a3b8', 2.2);
    for (i = 0; i < rungs.length; i++) {
      svg.push('<line x1="' + n(rungs[i].a.x) + '" y1="' + n(rungs[i].a.y) + '" x2="' + n(rungs[i].b.x) + '" y2="' + n(rungs[i].b.y) + '" stroke="' + rungs[i].col + '" stroke-width="2.6" stroke-linecap="round"/>');
    }
    drawSegs(front, '#334155', 3);
    return svg.join('');
  }

  function histoneSvg(cx) {
    var beads = [
      { x: cx - 32, y: 118 },
      { x: cx, y: 86 },
      { x: cx + 32, y: 118 }
    ];
    var s = [];
    var i;
    var b;
    var n2;
    var rD = 16;
    var d;
    d = 'M ' + n(beads[0].x - 22) + ' ' + n(beads[0].y + 8);
    for (i = 0; i < beads.length; i++) {
      b = beads[i];
      d += ' Q ' + n(b.x - rD) + ' ' + n(b.y + 18) + ' ' + n(b.x) + ' ' + n(b.y + rD);
      if (i < beads.length - 1) {
        n2 = beads[i + 1];
        d += ' Q ' + n((b.x + n2.x) / 2) + ' ' + n(Math.max(b.y, n2.y) + 22) + ' ' + n(n2.x) + ' ' + n(n2.y + rD);
      }
    }
    d += ' Q ' + n(beads[2].x + rD) + ' ' + n(beads[2].y + 18) + ' ' + n(beads[2].x + 22) + ' ' + n(beads[2].y + 6);
    s.push('<path d="' + d + '" fill="none" stroke="' + TEAL + '" stroke-width="2.6" stroke-linecap="round"/>');
    for (i = 0; i < beads.length; i++) {
      b = beads[i];
      s.push('<circle cx="' + b.x + '" cy="' + b.y + '" r="' + rD + '" fill="none" stroke="' + TEAL + '" stroke-width="2.6"/>');
      s.push('<circle cx="' + b.x + '" cy="' + b.y + '" r="11" fill="var(--fgx-c3-soft, #f8e7d2)" stroke="' + ORN + '" stroke-width="2"/>');
    }
    return s.join('');
  }

  function chromatinSvg(cx) {
    var s = [];
    var d = 'M ' + (cx - 34) + ' 64'
      + ' C ' + (cx - 8) + ' 52 ' + (cx + 36) + ' 58 ' + (cx + 28) + ' 86'
      + ' C ' + (cx + 20) + ' 114 ' + (cx - 36) + ' 100 ' + (cx - 24) + ' 126'
      + ' C ' + (cx - 12) + ' 150 ' + (cx + 34) + ' 142 ' + (cx + 30) + ' 118';
    var dots = [
      [cx - 20, 78],
      [cx + 18, 74],
      [cx + 22, 98],
      [cx - 16, 112],
      [cx + 8, 128]
    ];
    var i;
    s.push('<path d="' + d + '" fill="none" stroke="' + PUR + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>');
    s.push('<path d="' + d + '" fill="none" stroke="#6d28d9" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 7"/>');
    for (i = 0; i < dots.length; i++) {
      s.push('<circle cx="' + dots[i][0] + '" cy="' + dots[i][1] + '" r="4.5" fill="var(--fgx-c3-soft, #f8e7d2)" stroke="' + ORN + '" stroke-width="1.5"/>');
    }
    return s.join('');
  }

  function xPaths(up, dn, w) {
    function one(side) {
      var tipU = side * w * 0.78;
      var tipD = side * w * 0.78;
      var cU = side * w;
      var cD = side * w;
      return 'M 0 0 C ' + n(side * w * 0.2) + ' ' + n(-up * 0.16) + ' ' + n(cU) + ' ' + n(-up * 0.55) + ' ' + n(tipU) + ' ' + n(-up)
        + ' M 0 0 C ' + n(side * w * 0.2) + ' ' + n(dn * 0.16) + ' ' + n(cD) + ' ' + n(dn * 0.55) + ' ' + n(tipD) + ' ' + n(dn);
    }
    return { L: one(-1), R: one(1) };
  }

  function cubicAtY(p0, p1, p2, p3, y) {
    var lo = 0;
    var hi = 1;
    var mid;
    var pt;
    var i;
    var u;
    for (i = 0; i < 16; i++) {
      mid = (lo + hi) / 2;
      u = 1 - mid;
      pt = u * u * u * p0.y + 3 * u * u * mid * p1.y + 3 * u * mid * mid * p2.y + mid * mid * mid * p3.y;
      if (p3.y < p0.y) {
        if (pt > y) lo = mid;
        else hi = mid;
      } else if (pt < y) lo = mid;
      else hi = mid;
    }
    mid = (lo + hi) / 2;
    u = 1 - mid;
    return {
      x: u * u * u * p0.x + 3 * u * u * mid * p1.x + 3 * u * mid * mid * p2.x + mid * mid * mid * p3.x,
      y: u * u * u * p0.y + 3 * u * u * mid * p1.y + 3 * u * mid * mid * p2.y + mid * mid * mid * p3.y
    };
  }

  function armCtrls(side, up, dn, w) {
    return {
      up: [
        { x: 0, y: 0 },
        { x: side * w * 0.2, y: -up * 0.16 },
        { x: side * w, y: -up * 0.55 },
        { x: side * w * 0.78, y: -up }
      ],
      dn: [
        { x: 0, y: 0 },
        { x: side * w * 0.2, y: dn * 0.16 },
        { x: side * w, y: dn * 0.55 },
        { x: side * w * 0.78, y: dn }
      ]
    };
  }

  function bandAt(ctrl, y) {
    var set = y < 0 ? ctrl.up : ctrl.dn;
    return cubicAtY(set[0], set[1], set[2], set[3], y);
  }

  function bandMark(x, y) {
    return '<rect x="' + n(x - 8) + '" y="' + n(y - 5) + '" width="16" height="10" rx="2" fill="#fff7ed" stroke="#9a3412" stroke-width="1.4"/>'
      + '<rect class="fgx-hit" x="' + n(x - 12) + '" y="' + n(y - 10) + '" width="24" height="20" fill="transparent" style="pointer-events:all"/>';
  }

  function cenMark(col) {
    return '<circle r="7" fill="#ffffff" stroke="' + col + '" stroke-width="2.5"/>'
      + '<circle class="fgx-hit" r="12" fill="transparent" style="pointer-events:all"/>';
  }

  function smallChrom(cx, cy, after) {
    var s = [];
    var xp;
    s.push('<g data-part="chromosome">');
    if (after) {
      xp = xPaths(34, 42, 13);
      s.push('<path d="' + xp.L + '" fill="none" stroke="' + PUR + '" stroke-width="6" stroke-linecap="round" transform="translate(' + cx + ' ' + cy + ')"/>');
      s.push('<path d="' + xp.R + '" fill="none" stroke="' + PUR + '" stroke-width="6" stroke-linecap="round" transform="translate(' + cx + ' ' + cy + ')"/>');
      s.push('<circle cx="' + cx + '" cy="' + cy + '" r="4.5" fill="#ffffff" stroke="' + PUR + '" stroke-width="2"/>');
    } else {
      s.push('<path d="M ' + cx + ' ' + (cy - 34) + ' L ' + cx + ' ' + (cy - 8) + ' M ' + cx + ' ' + (cy + 8) + ' L ' + cx + ' ' + (cy + 42) + '" fill="none" stroke="' + PUR + '" stroke-width="8" stroke-linecap="round"/>');
      s.push('<circle cx="' + cx + '" cy="' + cy + '" r="4.5" fill="#ffffff" stroke="' + PUR + '" stroke-width="2"/>');
    }
    s.push('<rect class="fgx-hit" x="' + (cx - 22) + '" y="' + (cy - 46) + '" width="44" height="96" fill="transparent" style="pointer-events:all"/>');
    s.push(label(cx, 172, '염색체', 16, INK, 'text-anchor="middle" font-weight="700"'));
    s.push('</g>');
    return s.join('');
  }

  function pairBody(mode) {
    var PX = 186;
    var QX = 386;
    var PY = 324;
    var UP = 54;
    var DN = 66;
    var W = 26;
    var loci = [-34, 24, 50];
    var after = mode === 'after';
    var xp = xPaths(UP, DN, W);
    var cL = armCtrls(-1, UP, DN, W);
    var cR = armCtrls(1, UP, DN, W);
    var s = [];
    var i;
    var y;
    var pL;
    var pR;
    var sw = 11;
    s.push('<g data-part="homologous">');
    s.push('<rect class="fgx-hit" x="150" y="262" width="290" height="140" fill="transparent" style="pointer-events:all"/>');
    if (after) {
      s.push('<path d="' + xp.L + '" fill="none" stroke="' + RED + '" stroke-width="' + sw + '" stroke-linecap="round" transform="translate(' + PX + ' ' + PY + ')"/>');
      s.push('<path d="' + xp.L + '" fill="none" stroke="' + BLU + '" stroke-width="' + sw + '" stroke-linecap="round" transform="translate(' + QX + ' ' + PY + ')"/>');
      s.push('<path d="' + xp.R + '" fill="none" stroke="' + BLU + '" stroke-width="' + sw + '" stroke-linecap="round" transform="translate(' + QX + ' ' + PY + ')"/>');
    } else {
      s.push('<path d="M 0 ' + n(-UP) + ' L 0 ' + n(-8) + ' M 0 ' + n(8) + ' L 0 ' + n(DN) + '" fill="none" stroke="' + BLU + '" stroke-width="14" stroke-linecap="round" transform="translate(' + QX + ' ' + PY + ')"/>');
    }
    s.push('</g>');
    s.push('<g data-part="chromatid">');
    if (after) {
      s.push('<path d="' + xp.R + '" fill="none" stroke="' + RED + '" stroke-width="' + sw + '" stroke-linecap="round" transform="translate(' + PX + ' ' + PY + ')"/>');
      s.push('<path d="' + xp.R + '" fill="none" stroke="transparent" stroke-width="22" stroke-linecap="round" transform="translate(' + PX + ' ' + PY + ')" class="fgx-hit" style="pointer-events:stroke"/>');
    } else {
      s.push('<path d="M 0 ' + n(-UP) + ' L 0 ' + n(-8) + ' M 0 ' + n(8) + ' L 0 ' + n(DN) + '" fill="none" stroke="' + RED + '" stroke-width="14" stroke-linecap="round" transform="translate(' + PX + ' ' + PY + ')"/>');
      s.push('<rect class="fgx-hit" x="' + (PX - 14) + '" y="' + (PY - UP - 4) + '" width="28" height="' + (UP + DN + 8) + '" fill="transparent" style="pointer-events:all"/>');
    }
    s.push('</g>');
    s.push('<g data-part="gene">');
    for (i = 0; i < loci.length; i++) {
      y = loci[i];
      if (after) {
        pL = bandAt(cL, y);
        pR = bandAt(cR, y);
        s.push(bandMark(PX + pL.x, PY + y));
        s.push(bandMark(PX + pR.x, PY + y));
        s.push(bandMark(QX + pL.x, PY + y));
        s.push(bandMark(QX + pR.x, PY + y));
      } else {
        s.push(bandMark(PX, PY + y));
        s.push(bandMark(QX, PY + y));
      }
    }
    s.push(label(132, PY + 24 + 5, 'B', 16, INK, 'text-anchor="end" font-weight="700"'));
    s.push(label(440, PY + 24 + 5, 'B', 16, INK, 'text-anchor="start" font-weight="700"'));
    s.push('</g>');
    s.push('<g data-part="centromere">');
    s.push('<g transform="translate(' + PX + ' ' + PY + ')">' + cenMark(RED) + '</g>');
    s.push('<g transform="translate(' + QX + ' ' + PY + ')">' + cenMark(BLU) + '</g>');
    s.push('</g>');
    return s.join('');
  }

  function alleleMarkup() {
    var yA = 324 - 34;
    var s = [];
    s.push('<g data-part="allele">');
    s.push('<path d="M 108 250 L 108 276 M 464 250 L 464 276 M 108 250 L 464 250" fill="none" stroke="' + PNK + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>');
    s.push('<path d="M 108 250 L 108 276 M 464 250 L 464 276 M 108 250 L 464 250" fill="none" stroke="transparent" stroke-width="16" class="fgx-hit" style="pointer-events:stroke"/>');
    s.push(label(286, 236, '대립유전자', 16, PNK, 'text-anchor="middle" font-weight="700"'));
    s.push(label(132, yA + 5, 'A', 16, PNK, 'text-anchor="end" font-weight="700"'));
    s.push(label(440, yA + 5, 'a', 16, PNK, 'text-anchor="start" font-weight="700"'));
    s.push('</g>');
    return s.join('');
  }

  function arrowAt(x1, x2, y, word) {
    return label((x1 + x2) / 2, y - 14, word, 15, DIM, 'text-anchor="middle" font-weight="700"')
      + '<line x1="' + x1 + '" y1="' + y + '" x2="' + (x2 - 9) + '" y2="' + y + '" stroke="' + DIM + '" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M ' + (x2 - 11) + ' ' + (y - 5) + ' L ' + x2 + ' ' + y + ' L ' + (x2 - 11) + ' ' + (y + 5) + ' Z" fill="' + DIM + '"/>';
  }

  function chromMarkup(rep) {
    var after = rep !== 'before';
    var s = [];
    s.push('<g data-part="dna">');
    s.push(helixSvg(68));
    s.push(label(68, 172, 'DNA', 16, INK, 'text-anchor="middle" font-weight="700"'));
    s.push('<rect class="fgx-hit" x="40" y="48" width="56" height="110" fill="transparent" style="pointer-events:all"/>');
    s.push('</g>');
    s.push('<g data-part="histone">');
    s.push(histoneSvg(198));
    s.push(label(198, 172, '히스톤', 16, INK, 'text-anchor="middle" font-weight="700"'));
    s.push('<rect class="fgx-hit" x="148" y="64" width="100" height="90" fill="transparent" style="pointer-events:all"/>');
    s.push('</g>');
    s.push('<g data-part="chromatin">');
    s.push(chromatinSvg(334));
    s.push(label(334, 172, '염색질', 16, INK, 'text-anchor="middle" font-weight="700"'));
    s.push('<rect class="fgx-hit" x="292" y="48" width="84" height="110" fill="transparent" style="pointer-events:all"/>');
    s.push('</g>');
    s.push(arrowAt(98, 148, 104, '감김'));
    s.push(arrowAt(250, 292, 104, '응축'));
    s.push(arrowAt(392, 438, 104, '응축'));
    s.push('<g class="js-mode-after" display="' + (after ? 'inline' : 'none') + '">');
    s.push(smallChrom(474, 100, true));
    s.push(pairBody('after'));
    s.push('</g>');
    s.push('<g class="js-mode-before" display="' + (after ? 'none' : 'inline') + '">');
    s.push(smallChrom(474, 100, false));
    s.push(pairBody('before'));
    s.push('</g>');
    s.push(alleleMarkup());
    return s.join('');
  }

  function setA(node, k, v) {
    if (node) node.setAttribute(k, v);
  }

  function applyCycle(ctx, g) {
    var l1 = ctx.q('.js-l1');
    var l2 = ctx.q('.js-l2');
    var marker = ctx.q('.js-marker');
    var mem = ctx.q('.js-mem');
    var memL = ctx.q('.js-memL');
    var memR = ctx.q('.js-memR');
    var nuc = ctx.q('.js-nuc');
    var nucl = ctx.q('.js-nucl');
    var threads = ctx.q('.js-threads');
    var s1 = ctx.qa('.js-s1');
    var s2 = ctx.qa('.js-s2');
    var daus = ctx.qa('.js-dau');
    var chrs = ctx.qa('.js-chr');
    var cenL = ctx.q('.js-cenL');
    var cenR = ctx.q('.js-cenR');
    var spin = ctx.q('.js-spin');
    var sps = ctx.qa('.js-sp');
    var eq = ctx.q('.js-eq');
    var guide = ctx.q('.js-guide');
    var dot = ctx.q('.js-dot');
    var i;
    var node;
    var armL;
    var armR;
    var paths;
    var k;
    if (!mem) return;
    if (l1) {
      l1.textContent = g.l1;
      setA(l1, 'y', String(g.y1));
      setA(l1, 'fill', g.fill);
    }
    if (l2) {
      l2.textContent = g.l2;
      setA(l2, 'y', String(g.y2));
      setA(l2, 'fill', g.fill);
      setA(l2, 'visibility', g.l2vis);
    }
    setA(marker, 'transform', 'translate(' + n(g.mx) + ' ' + n(g.my) + ')');
    setA(mem, 'd', g.mem);
    setA(mem, 'display', g.two ? 'none' : 'inline');
    setA(memL, 'display', g.two ? 'inline' : 'none');
    setA(memR, 'display', g.two ? 'inline' : 'none');
    setA(nuc, 'opacity', n(g.nucOp));
    setA(nuc, 'visibility', visOf(g.nucOp));
    setA(nuc, 'stroke-dasharray', g.dash);
    setA(nucl, 'opacity', n(g.nucOp));
    setA(nucl, 'visibility', visOf(g.nucOp));
    setA(threads, 'opacity', n(g.mainChrom));
    setA(threads, 'visibility', visOf(g.mainChrom));
    for (i = 0; i < s1.length; i++) setA(s1[i], 'stroke-width', n(g.sw));
    for (i = 0; i < s2.length; i++) {
      setA(s2[i], 'opacity', n(g.repl));
      setA(s2[i], 'stroke-width', n(g.sw));
    }
    for (i = 0; i < daus.length; i++) {
      node = daus[i];
      setA(node, 'visibility', visOf(Math.max(g.dauNuc, g.dauThread)));
      setA(node.querySelector('.js-dnuc'), 'opacity', n(g.dauNuc));
      setA(node.querySelector('.js-dnucl'), 'opacity', n(g.dauNuc));
      setA(node.querySelector('.js-dthread'), 'opacity', n(g.dauThread));
    }
    for (i = 0; i < chrs.length; i++) {
      node = chrs[i];
      k = Number(node.getAttribute('data-i'));
      if (k !== k || !g.chrs[k]) continue;
      setA(node, 'opacity', n(g.cond));
      setA(node, 'visibility', visOf(g.cond));
      setA(node, 'transform', 'translate(' + n(g.chrs[k].x) + ' ' + n(g.chrs[k].y) + ') rotate(' + n(g.chrs[k].rot) + ')');
      armL = node.querySelector('.js-armL');
      armR = node.querySelector('.js-armR');
      setA(armL, 'transform', 'translate(' + n(-g.chrs[k].sep) + ' 0)');
      setA(armR, 'transform', 'translate(' + n(g.chrs[k].sep) + ' 0)');
      paths = armL.querySelectorAll('.js-armd');
      if (paths[0]) setA(paths[0], 'd', g.chrs[k].dL);
      paths = armR.querySelectorAll('.js-armd');
      if (paths[0]) setA(paths[0], 'd', g.chrs[k].dR);
    }
    setA(cenL, 'opacity', n(g.cenOp));
    setA(cenL, 'visibility', visOf(g.cenOp));
    setA(cenL, 'transform', 'translate(' + n(g.cenL.x) + ' ' + n(g.cenL.y) + ')');
    setA(cenR, 'opacity', n(g.cenOp));
    setA(cenR, 'visibility', visOf(g.cenOp));
    setA(cenR, 'transform', 'translate(' + n(g.cenR.x) + ' ' + n(g.cenR.y) + ')');
    if (spin) spin.setAttribute('style', 'pointer-events:' + (g.spinOp > 0.12 ? 'all' : 'none'));
    for (i = 0; i < sps.length; i++) {
      k = Math.floor(i / 2);
      if (!g.spins[k]) continue;
      setA(sps[i], 'x1', n(g.spins[k].x1));
      setA(sps[i], 'y1', n(g.spins[k].y1));
      setA(sps[i], 'x2', n(g.spins[k].x2));
      setA(sps[i], 'y2', n(g.spins[k].y2));
      if (sps[i].getAttribute('stroke') !== 'transparent') setA(sps[i], 'stroke-opacity', n(g.spinOp));
    }
    setA(eq, 'stroke-opacity', n(g.eq));
    setA(guide, 'x1', n(g.dx));
    setA(guide, 'x2', n(g.dx));
    setA(guide, 'y1', n(g.dy));
    setA(guide, 'y2', String(GY0));
    setA(dot, 'cx', n(g.dx));
    setA(dot, 'cy', n(g.dy));
    setA(dot, 'fill', g.fill);
  }

  function applyRep(ctx) {
    var after = ctx.v.rep !== 'before';
    var a = ctx.qa('.js-mode-after');
    var b = ctx.qa('.js-mode-before');
    var i;
    for (i = 0; i < a.length; i++) a[i].setAttribute('display', after ? 'inline' : 'none');
    for (i = 0; i < b.length; i++) b[i].setAttribute('display', after ? 'none' : 'inline');
  }

  NMFIG.define('cellcycle', {
    viewBox: [560, 440],
    views: [
      { id: 'cycle', label: '세포 주기', hint: '※ 분열기(M)는 보기 쉽게 실제보다 크게 그렸습니다.' },
      { id: 'chromosome', label: '염색체 구조' }
    ],
    controls: [
      {
        id: 'pos', type: 'range', label: '세포 주기의 위치', min: 0, max: 1, step: 0.002, value: 0.1,
        fmt: function (v) { return phaseAt(numPos(v)).name; },
        views: ['cycle']
      },
      {
        id: 'rep', type: 'choice', label: '염색체', value: 'after', views: ['chromosome'],
        options: [
          { v: 'before', label: '복제 전: 염색 분체 1개' },
          { v: 'after', label: '복제 후: 염색 분체 2개' }
        ]
      }
    ],
    animate: { control: 'pos', from: 0, to: 1, duration: 20000, loop: true, views: ['cycle'] },
    _calc: function (v) {
      var pos = numPos(v && v.pos);
      var ph = phaseAt(pos);
      return {
        pos: pos,
        phase: ph.id,
        name: ph.name,
        dna: Math.round(dnaRel(pos) * 1000) / 1000,
        n: chromN(pos),
        readout: readoutOf(pos)
      };
    },
    render: function (v, view) {
      if (view === 'chromosome') return chromMarkup(v && v.rep);
      return cycleMarkup(geom(numPos(v && v.pos)));
    },
    update: function (ctx) {
      var pos;
      var g;
      if (!ctx || ctx.view === 'chromosome') {
        applyRep(ctx);
        return { active: [], follow: '' };
      }
      pos = numPos(ctx.v && ctx.v.pos);
      g = geom(pos);
      applyCycle(ctx, g);
      return { readout: readoutOf(pos), active: [], follow: g.phaseId };
    }
  });
})(window.NMFIG);
