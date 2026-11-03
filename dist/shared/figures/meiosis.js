/* 감수 분열: 2n=4(긴·짧은 상동, 길이 비 3:2)가 생식세포 4개가 되기까지.
 * 컨트롤 stage 0~8 — G₁, G₂, 전Ⅰ·중Ⅰ·후Ⅰ·말Ⅰ, 전·중Ⅱ·후Ⅱ·말Ⅱ.
 * DNA 상대량은 G₁기=1. S기(0→1)만 1→2 선형, 말Ⅰ에서 1, 말Ⅱ에서 0.5.
 * 빨강=모계, 파랑=부계. 전기Ⅰ 교차로 맞바꾼 팔 끝 색은 그 뒤로 유지한다.
 * 아래 타임라인 칸이 단계 부위, 계단선이 DNA 상대량.
 */
(function (NMFIG) {
  'use strict';

  var LONG = 27;
  var SHORT = 18;
  var RED = 'var(--fgx-c2, #dc2626)';
  var BLUE = 'var(--fgx-c1, #2563eb)';
  var INK = 'var(--fgx-ink, #1a1f2e)';
  var DIM = 'var(--fgx-dim, #4a5468)';
  var ACC = 'var(--fgx-accent, #16a34a)';

  var AX0 = 40;
  var ADX = 60;
  var Y_BR = 288;
  var Y_BAR = 294;
  var Y_LAB = 324;
  var Y_AXIS = 334;
  var Y_G2 = 346;
  var Y_G0 = 418;
  var Y_CAP = 436;

  var BIG = { cx: 188, cy: 138, rx: 146, ry: 106 };
  var L2 = { cx: 96, cy: 138, rx: 78, ry: 100 };
  var R2 = { cx: 276, cy: 138, rx: 78, ry: 100 };
  var TL = { cx: 96, cy: 70, rx: 78, ry: 52 };
  var BL = { cx: 96, cy: 198, rx: 78, ry: 52 };
  var TR = { cx: 276, cy: 70, rx: 78, ry: 52 };
  var BR = { cx: 276, cy: 198, rx: 78, ry: 52 };

  var STAGE_NAME = [
    'G₁기',
    'G₂기 (복제 후)',
    '감수 1분열 전기',
    '감수 1분열 중기',
    '감수 1분열 후기',
    '감수 1분열 말기 · 세포질 분열',
    '감수 2분열 전기 · 중기',
    '감수 2분열 후기',
    '감수 2분열 말기 · 세포질 분열'
  ];
  var STAT = [
    '핵상 2n · 염색체 4 · 염색 분체 4 · DNA 상대량 1 · 세포 1개',
    '핵상 2n · 염색체 4 · 염색 분체 8 · DNA 상대량 2 · 세포 1개',
    '핵상 2n · 염색체 4 (2가 염색체 2개) · 염색 분체 8 · DNA 상대량 2 · 세포 1개',
    '핵상 2n · 염색체 4 (2가 염색체 2개) · 염색 분체 8 · DNA 상대량 2 · 세포 1개',
    '핵상 2n · 염색체 4 (2가 염색체 2개) · 염색 분체 8 · DNA 상대량 2 · 세포 1개',
    '핵상 n · 세포당 염색체 2 · 염색 분체 4 · DNA 상대량 1 · 세포 2개',
    '핵상 n · 세포당 염색체 2 · 염색 분체 4 · DNA 상대량 1 · 세포 2개',
    '핵상 n · 세포당 염색체 4 (일시적으로 2배) · DNA 상대량 1 · 세포 2개',
    '핵상 n · 세포당 염색체 2 · 염색 분체 2 · DNA 상대량 0.5 · 세포 4개'
  ];
  var KEYLINE = [
    'DNA 복제 전 · 염색사는 가늘고 풀려 있다',
    'S기에 DNA가 복제되어 염색 분체가 2개씩',
    '상동 염색체가 접합하고 교차가 일어남',
    '2가 염색체가 적도판에 배열',
    '상동 염색체 분리 중',
    '상동 염색체가 분리 → 염색체 수 반감',
    '복제 없이 적도판에 배열',
    '염색 분체가 분리',
    '생식세포 4개 · 각 DNA 상대량은 G₁의 절반'
  ];
  var FOLLOW = [
    'interphase', 'dna_rel', 'bivalent', 'metaphase1', 'anaphase1',
    'telophase1', 'prophase2', 'anaphase2', 'gamete'
  ];
  var LABELS = ['G₁', 'G₂', '전Ⅰ', '중Ⅰ', '후Ⅰ', '말Ⅰ', '전·중Ⅱ', '후Ⅱ', '말Ⅱ'];
  var LAB_PART = [
    'interphase', 'interphase', 'prophase1', 'metaphase1', 'anaphase1',
    'telophase1', 'prophase2', 'anaphase2', 'telophase2'
  ];

  /* 염색체 키프레임. 0 LM 모계 긴, 1 LP 부계 긴, 2 SM 모계 짧은, 3 SP 부계 짧은.
   * sister B는 7·8에서만 따로(순수 분체는 위 생식세포, 교차 분체는 아래). */
  function P(x, y, rot, spread, wave) {
    return { x: x, y: y, rot: rot, spread: spread, wave: wave };
  }

  var KA = [
    [P(132, 104, -48, 0, 5.2), P(168, 178, -128, 0, 5.2), P(246, 104, -22, 0, 4.4), P(214, 176, -158, 0, 4.4)],
    [P(134, 106, -62, 14, 4), P(170, 176, -118, 14, 4), P(244, 106, -32, 13, 3.4), P(212, 174, -148, 13, 3.4)],
    [P(168, 102, -90, 30, 0.5), P(208, 102, -90, 30, 0.5), P(202, 180, -90, 32, 0.4), P(174, 180, -90, 32, 0.4)],
    [P(168, 100, -90, 30, 0), P(208, 100, -90, 30, 0), P(202, 178, -90, 32, 0), P(174, 178, -90, 32, 0)],
    [P(86, 104, -90, 28, 0), P(292, 104, -90, 28, 0), P(278, 182, -90, 30, 0), P(98, 182, -90, 30, 0)],
    [P(96, 96, -90, 28, 0.3), P(276, 96, -90, 28, 0.3), P(276, 184, -90, 30, 0.3), P(96, 184, -90, 30, 0.3)],
    [P(62, 138, -90, 28, 0), P(242, 138, -90, 28, 0), P(310, 138, -90, 30, 0), P(130, 138, -90, 30, 0)],
    [P(62, 84, -90, 0, 0), P(242, 194, -90, 0, 0), P(310, 194, -90, 0, 0), P(130, 86, -90, 0, 0)],
    [P(58, 62, -90, 0, 0), P(238, 188, -90, 0, 0), P(302, 192, -90, 0, 0), P(100, 68, -90, 0, 0)]
  ];
  var KB = [
    null, null, null, null, null, null,
    null,
    [P(62, 194, -90, 0, 0), P(242, 82, -90, 0, 0), P(310, 84, -90, 0, 0), P(130, 194, -90, 0, 0)],
    [P(58, 188, -90, 0, 0), P(238, 62, -90, 0, 0), P(302, 68, -90, 0, 0), P(100, 192, -90, 0, 0)]
  ];

  var COL = [RED, RED, BLUE, BLUE, RED, RED, BLUE, BLUE];
  var LEN = [LONG, LONG, LONG, LONG, SHORT, SHORT, SHORT, SHORT];
  var CHROM = [0, 0, 1, 1, 2, 2, 3, 3];
  var SIDE = [0, 1, 0, 1, 0, 1, 0, 1];
  var INNER = [0, 1, 1, 0, 1, 0, 0, 1];
  var DRAW = [0, 3, 5, 6, 1, 2, 4, 7];

  function r1(n) { return Math.round(n * 10) / 10; }

  function num(v) {
    var n = Number(v);
    if (!isFinite(n)) return 0;
    return n;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function smooth01(stage, a, b) {
    var t = (stage - a) / (b - a);
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t * t * (3 - 2 * t);
  }

  function ax(i) { return AX0 + i * ADX; }

  function gy(v) { return Y_G0 - (v / 2) * (Y_G0 - Y_G2); }

  function dnaAt(s) {
    if (s <= 0) return 1;
    if (s < 1) return 1 + s;
    if (s < 5) return 2;
    if (s < 8) return 1;
    return 0.5;
  }

  function anchorOf(stage) {
    var s = Math.floor(stage + 0.001);
    if (s < 0) s = 0;
    if (s > 8) s = 8;
    return s;
  }

  function lerpP(a, b, t) {
    return {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      rot: lerp(a.rot, b.rot, t),
      spread: lerp(a.spread, b.spread, t),
      wave: lerp(a.wave, b.wave, t)
    };
  }

  function pose(stage, ci, sister) {
    var i0 = Math.floor(stage);
    var i1;
    var t;
    var a;
    var b;
    if (i0 < 0) i0 = 0;
    if (i0 > 7) i0 = 7;
    if (stage >= 8) { i0 = 8; i1 = 8; t = 0; }
    else { i1 = i0 + 1; t = stage - i0; }
    a = (sister && KB[i0]) ? KB[i0][ci] : KA[i0][ci];
    b = (sister && KB[i1]) ? KB[i1][ci] : KA[i1][ci];
    return lerpP(a, b, t);
  }

  function lerpEll(a, b, t) {
    return {
      cx: lerp(a.cx, b.cx, t),
      cy: lerp(a.cy, b.cy, t),
      rx: lerp(a.rx, b.rx, t),
      ry: lerp(a.ry, b.ry, t)
    };
  }

  function membranes(stage) {
    var t1 = smooth01(stage, 4.04, 4.62);
    var t2 = smooth01(stage, 7.04, 7.62);
    var m = [null, null, null, null];
    if (t1 <= 0) {
      m[0] = lerpEll(BIG, BIG, 0);
      return m;
    }
    if (t2 <= 0) {
      m[0] = lerpEll(BIG, L2, t1);
      m[1] = lerpEll(BIG, R2, t1);
      return m;
    }
    m[0] = lerpEll(L2, TL, t2);
    m[1] = lerpEll(R2, TR, t2);
    m[2] = lerpEll(L2, BL, t2);
    m[3] = lerpEll(R2, BR, t2);
    return m;
  }

  function ellPath(e) {
    var rx = e.rx < 1 ? 1 : e.rx;
    var ry = e.ry < 1 ? 1 : e.ry;
    return 'M' + r1(e.cx - rx) + ' ' + r1(e.cy) +
      'A' + r1(rx) + ' ' + r1(ry) + ' 0 1 1 ' + r1(e.cx + rx) + ' ' + r1(e.cy) +
      'A' + r1(rx) + ' ' + r1(ry) + ' 0 1 1 ' + r1(e.cx - rx) + ' ' + r1(e.cy) + 'Z';
  }

  function nucOp(stage) {
    if (stage <= 1.05) return 1;
    if (stage < 1.85) return (1.85 - stage) / 0.8;
    if (stage < 4.78) return 0;
    if (stage < 5.08) return (stage - 4.78) / 0.3;
    if (stage < 5.42) return 1;
    if (stage < 5.78) return (5.78 - stage) / 0.36;
    if (stage < 7.78) return 0;
    if (stage < 8) return (stage - 7.78) / 0.22;
    return 1;
  }

  function nucOf(mem, stage) {
    if (mem.rx > 120) return { cx: mem.cx, cy: mem.cy, rx: mem.rx * 0.72, ry: mem.ry * 0.74 };
    if (mem.ry > 80) return { cx: mem.cx, cy: mem.cy, rx: mem.rx * 0.74, ry: mem.ry * 0.84 };
    return { cx: mem.cx - 14, cy: mem.cy - 6, rx: 54, ry: 37 };
  }

  function sampleArm(cen, ang, len, amp, sgn, bend, t) {
    var rad = ang * Math.PI / 180;
    var ux = Math.cos(rad);
    var uy = Math.sin(rad);
    var x = cen.x + ux * len * t;
    var y = cen.y + uy * len * t;
    var cut;
    var u;
    var bx;
    var by;
    var w;
    if (bend && bend.amt > 0.001) {
      cut = 0.55;
      if (t <= cut) {
        u = t / cut;
        bx = cen.x + (bend.x - cen.x) * u;
        by = cen.y + (bend.y - cen.y) * u;
      } else {
        u = (t - cut) / (1 - cut);
        bx = bend.x + (bend.tipx - bend.x) * u;
        by = bend.y + (bend.tipy - bend.y) * u;
      }
      x = x + (bx - x) * bend.amt;
      y = y + (by - y) * bend.amt;
    }
    w = 0;
    if (amp) {
      w = (Math.sin(t * Math.PI * 2) * 0.72 + Math.sin(t * Math.PI * 4) * 0.38 * sgn) * amp;
    }
    return [x - uy * w, y + ux * w];
  }

  function poly(pts) {
    var s = '';
    var i;
    for (i = 0; i < pts.length; i++) {
      s += (i ? 'L' : 'M') + r1(pts[i][0]) + ' ' + r1(pts[i][1]);
    }
    return s;
  }

  function armPath(cen, ang, len, amp, sgn, bend, t0, t1, n) {
    var pts = [];
    var i;
    var t;
    for (i = 0; i <= n; i++) {
      t = n === 0 ? t0 : t0 + (t1 - t0) * (i / n);
      pts.push(sampleArm(cen, ang, len, amp, sgn, bend, t));
    }
    return poly(pts);
  }

  function armAngles(rot, spread, side) {
    if (side) return [rot + spread, rot + 180 - spread];
    return [rot - spread, rot + 180 + spread];
  }

  function bendAmt(stage, dist) {
    var b;
    if (stage < 1.62) b = 0;
    else if (stage < 2.05) b = (stage - 1.62) / 0.43;
    else if (stage < 3.3) b = 1;
    else if (stage < 4.05) b = (4.05 - stage) / 0.75;
    else b = 0;
    if (dist > 78) return 0;
    if (dist > 52) return b * (78 - dist) / 26;
    return b;
  }

  function makeBend(cen, chia, len, amt) {
    if (!chia || amt <= 0.001) return null;
    return {
      amt: amt,
      x: chia.x,
      y: chia.y,
      tipx: chia.x + (chia.x - cen.x) * 0.62,
      tipy: chia.y + len * 0.5
    };
  }

  function chrWidth(stage) {
    if (stage <= 0) return 3.2;
    if (stage < 2) return lerp(3.2, 6.4, stage / 2);
    return 6.4;
  }

  function sisOp(stage) {
    if (stage <= 0) return 0;
    if (stage < 0.6) return stage / 0.6;
    return 1;
  }

  function cenOp(stage) {
    if (stage < 0.85) return 0;
    if (stage < 1.55) return (stage - 0.85) / 0.7;
    return 1;
  }

  function reachOf(stage, a, b) {
    if (stage < a) return 0;
    if (stage < b) return (stage - a) / (b - a);
    return 1;
  }

  function fadeWin(stage, a, b, c, d) {
    if (stage < a || stage >= d) return 0;
    if (stage < b) return (stage - a) / (b - a);
    if (stage < c) return 1;
    return (d - stage) / (d - c);
  }

  function toward(a, b, t) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  function stopShort(pole, cen, gap) {
    var dx = cen.x - pole.x;
    var dy = cen.y - pole.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var t;
    if (dist < gap + 0.5) return { x: pole.x, y: pole.y };
    t = (dist - gap) / dist;
    return { x: pole.x + dx * t, y: pole.y + dy * t };
  }

  function lineTo(pole, cen, reach) {
    var end = toward(pole, cen, reach);
    if (reach > 0.96) end = stopShort(pole, cen, 7);
    return { x1: pole.x, y1: pole.y, x2: end.x, y2: end.y };
  }

  function disp(on) { return on ? 'inline' : 'none'; }

  function calc(input) {
    var stage = input;
    var anchor;
    var mem;
    var nOp;
    var poses;
    var i;
    var ci;
    var sister;
    var lm;
    var lp;
    var sm;
    var sp;
    var dLong;
    var dShort;
    var bLong;
    var bShort;
    var chiaL;
    var chiaS;
    var chr;
    var ang;
    var bend;
    var base;
    var distal;
    var sw;
    var sop;
    var cop;
    var mi;
    var mii;
    var reachM;
    var reach2;
    var poleL;
    var poleR;
    var poles2;
    var spindles;
    var plates;
    var biv;
    var cross;
    var gam;
    var s;
    var active;
    var dna;
    var xNow;

    if (input && typeof input === 'object') stage = input.stage;
    stage = num(stage);
    if (stage < 0) stage = 0;
    if (stage > 8) stage = 8;
    anchor = anchorOf(stage);
    mem = membranes(stage);
    nOp = nucOp(stage);
    poses = [];
    for (i = 0; i < 8; i++) {
      ci = CHROM[i];
      sister = SIDE[i];
      poses.push(pose(stage, ci, sister));
    }
    lm = poses[0];
    lp = poses[2];
    sm = poses[4];
    sp = poses[6];
    dLong = Math.sqrt((lm.x - lp.x) * (lm.x - lp.x) + (lm.y - lp.y) * (lm.y - lp.y));
    dShort = Math.sqrt((sm.x - sp.x) * (sm.x - sp.x) + (sm.y - sp.y) * (sm.y - sp.y));
    bLong = bendAmt(stage, dLong);
    bShort = bendAmt(stage, dShort);
    chiaL = { x: (lm.x + lp.x) / 2, y: (lm.y + lp.y) / 2 + 16 };
    chiaS = { x: (sm.x + sp.x) / 2, y: (sm.y + sp.y) / 2 + 11 };
    sw = chrWidth(stage);
    sop = sisOp(stage);
    cop = cenOp(stage);
    chr = [];
    for (i = 0; i < 8; i++) {
      ang = armAngles(poses[i].rot, poses[i].spread, SIDE[i]);
      bend = null;
      if (INNER[i]) {
        if (i < 4) bend = makeBend(poses[i], chiaL, LEN[i], bLong);
        else bend = makeBend(poses[i], chiaS, LEN[i], bShort);
      }
      base = COL[i];
      distal = base;
      if (INNER[i] && stage >= 1.85) distal = base === RED ? BLUE : RED;
      chr.push({
        a1: armPath(poses[i], ang[0], LEN[i], poses[i].wave, i < 4 ? 1 : -1, null, 0, 1, 8),
        a2p: armPath(poses[i], ang[1], LEN[i], poses[i].wave, i < 4 ? 1 : -1, bend, 0, 0.55, 5),
        a2d: armPath(poses[i], ang[1], LEN[i], poses[i].wave, i < 4 ? 1 : -1, bend, 0.55, 1, 4),
        c1: base,
        c2: distal,
        sw: r1(sw),
        on: SIDE[i] === 0 || sop > 0.02,
        op: SIDE[i] === 0 ? 1 : sop,
        cx: poses[i].x,
        cy: poses[i].y,
        cen: cop > 0.04 && (SIDE[i] === 0 || sop > 0.45)
      });
    }

    mi = fadeWin(stage, 1.55, 2.15, 4.15, 4.75);
    mii = fadeWin(stage, 5.35, 5.95, 7.15, 7.75);
    reachM = reachOf(stage, 1.55, 2.7);
    reach2 = reachOf(stage, 5.35, 6.15);
    poleL = { x: BIG.cx - BIG.rx + 20, y: BIG.cy };
    poleR = { x: BIG.cx + BIG.rx - 20, y: BIG.cy };
    poles2 = [
      { x: L2.cx, y: L2.cy - L2.ry + 18 },
      { x: L2.cx, y: L2.cy + L2.ry - 18 },
      { x: R2.cx, y: R2.cy - R2.ry + 18 },
      { x: R2.cx, y: R2.cy + R2.ry - 18 }
    ];
    spindles = [];
    for (i = 0; i < 8; i++) spindles.push({ x1: 0, y1: 0, x2: 0, y2: 0, on: false, op: 0 });
    if (mi > 0.02) {
      spindles[0] = packLine(lineTo(poleL, lm, reachM), mi);
      spindles[1] = packLine(lineTo(poleR, lp, reachM), mi);
      spindles[2] = packLine(lineTo(poleL, sp, reachM), mi);
      spindles[3] = packLine(lineTo(poleR, sm, reachM), mi);
    }
    if (mii > 0.02) {
      spindles[0] = packLine(lineTo(poles2[0], poses[0], reach2), mii);
      spindles[1] = packLine(lineTo(poles2[1], poses[1], reach2), mii);
      spindles[2] = packLine(lineTo(poles2[0], poses[6], reach2), mii);
      spindles[3] = packLine(lineTo(poles2[1], poses[7], reach2), mii);
      spindles[4] = packLine(lineTo(poles2[2], poses[3], reach2), mii);
      spindles[5] = packLine(lineTo(poles2[3], poses[2], reach2), mii);
      spindles[6] = packLine(lineTo(poles2[2], poses[5], reach2), mii);
      spindles[7] = packLine(lineTo(poles2[3], poses[4], reach2), mii);
    }

    plates = [
      {
        x1: BIG.cx, y1: BIG.cy - 72, x2: BIG.cx, y2: BIG.cy + 72,
        on: fadeWin(stage, 2.35, 2.7, 3.85, 4.35) > 0.04,
        op: fadeWin(stage, 2.35, 2.7, 3.85, 4.35)
      },
      {
        x1: L2.cx - 46, y1: L2.cy, x2: L2.cx + 46, y2: L2.cy,
        on: fadeWin(stage, 5.45, 5.8, 6.45, 6.85) > 0.04,
        op: fadeWin(stage, 5.45, 5.8, 6.45, 6.85)
      },
      {
        x1: R2.cx - 46, y1: R2.cy, x2: R2.cx + 46, y2: R2.cy,
        on: fadeWin(stage, 5.45, 5.8, 6.45, 6.85) > 0.04,
        op: fadeWin(stage, 5.45, 5.8, 6.45, 6.85)
      }
    ];

    biv = [
      bivBox(lm, lp, LONG, stage >= 1.78 && stage < 3.88 && bLong > 0.2),
      bivBox(sp, sm, SHORT, stage >= 1.78 && stage < 3.88 && bShort > 0.2)
    ];
    cross = [
      { cx: chiaL.x, cy: chiaL.y, on: bLong > 0.62 && stage < 3.95 },
      { cx: chiaS.x, cy: chiaS.y, on: bShort > 0.62 && stage < 3.95 }
    ];

    s = anchor;
    active = [];
    if (s === 2) active = ['bivalent', 'crossing'];
    else if (s === 3) active = ['bivalent'];

    gam = gametes(mem, stage);
    dna = dnaAt(stage);
    xNow = AX0 + stage * ADX;

    return {
      stage: stage,
      anchor: s,
      mem: packMem(mem),
      nuc: packNuc(mem, nOp, stage),
      chr: chr,
      draw: DRAW,
      spindles: spindles,
      poles: packPoles(poleL, poleR, poles2, mi, mii),
      plates: plates,
      biv: biv,
      cross: cross,
      ploidy: s >= 5 ? '핵상 n' : '핵상 2n',
      ploidyFill: s >= 5 ? 'var(--fgx-c4-soft, #d7f0e0)' : 'var(--fgx-c5-soft, #e4d8fb)',
      ploidyStroke: s >= 5 ? 'var(--fgx-c4, #16a34a)' : 'var(--fgx-c5, #7c3aed)',
      labFill: labFills(s),
      nowX: ax(s) - 26,
      cur: { x1: xNow, y1: Y_AXIS, x2: xNow, y2: gy(0) },
      dot: { cx: xNow, cy: gy(dna) },
      gam: gam,
      dna: dna,
      readout: STAGE_NAME[s] + '\n' + STAT[s] + '\n' + KEYLINE[s],
      active: active,
      follow: FOLLOW[s],
      cenOp: cop
    };
  }

  function packLine(ln, op) {
    return { x1: ln.x1, y1: ln.y1, x2: ln.x2, y2: ln.y2, on: op > 0.02, op: op };
  }

  function packMem(mem) {
    var out = [];
    var i;
    var e;
    for (i = 0; i < 4; i++) {
      e = mem[i];
      out.push({
        d: e ? ellPath(e) : 'M0 0',
        on: !!e
      });
    }
    return out;
  }

  function packNuc(mem, op, stage) {
    var out = [];
    var i;
    var e;
    var show = op > 0.03;
    for (i = 0; i < 4; i++) {
      e = mem[i];
      out.push({
        d: e ? ellPath(nucOf(e, stage)) : 'M0 0',
        on: !!(e && show),
        op: op
      });
    }
    return out;
  }

  function packPoles(poleL, poleR, poles2, mi, mii) {
    return [
      { cx: poleL.x, cy: poleL.y, on: mi > 0.04, op: mi },
      { cx: poleR.x, cy: poleR.y, on: mi > 0.04, op: mi },
      { cx: poles2[0].x, cy: poles2[0].y, on: mii > 0.04, op: mii },
      { cx: poles2[1].x, cy: poles2[1].y, on: mii > 0.04, op: mii },
      { cx: poles2[2].x, cy: poles2[2].y, on: mii > 0.04, op: mii },
      { cx: poles2[3].x, cy: poles2[3].y, on: mii > 0.04, op: mii }
    ];
  }

  function bivBox(a, b, len, on) {
    var minX = Math.min(a.x, b.x) - len * 0.78;
    var maxX = Math.max(a.x, b.x) + len * 0.78;
    var minY = Math.min(a.y, b.y) - len * 1.05;
    var maxY = Math.max(a.y, b.y) + len * 1.22;
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY + len * 0.35, on: on };
  }

  function gametes(mem, stage) {
    var on = stage >= 7.84;
    var spots = [TL, TR, BL, BR];
    var out = [];
    var i;
    var e;
    for (i = 0; i < 4; i++) {
      e = on && mem[i] ? mem[i] : spots[i];
      out.push({
        x: e.cx - e.rx,
        y: e.cy - e.ry,
        w: e.rx * 2,
        h: e.ry * 2,
        tx: e.cx,
        ty: e.cy + e.ry - 12,
        on: on
      });
    }
    return out;
  }

  function labFills(anchor) {
    var fills = [];
    var i;
    for (i = 0; i < 9; i++) {
      fills.push(i === anchor ? INK : DIM);
    }
    return fills;
  }

  function attr(el, map) {
    var k;
    var node;
    if (!el) return;
    for (k in map) {
      if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
      node = map[k];
      if (node == null) continue;
      el.setAttribute(k, String(node));
    }
  }

  function apply(q, sc) {
    var i;
    var el;
    var c;
    var b;
    var g;
    for (i = 0; i < 4; i++) {
      attr(q('.js-mem-' + i), { d: sc.mem[i].d, display: disp(sc.mem[i].on) });
      attr(q('.js-nuc-' + i), {
        d: sc.nuc[i].d,
        display: disp(sc.nuc[i].on),
        opacity: r1(sc.nuc[i].op)
      });
    }
    for (i = 0; i < 3; i++) {
      attr(q('.js-plt-' + i), {
        x1: r1(sc.plates[i].x1), y1: r1(sc.plates[i].y1),
        x2: r1(sc.plates[i].x2), y2: r1(sc.plates[i].y2),
        display: disp(sc.plates[i].on),
        opacity: r1(sc.plates[i].op)
      });
    }
    for (i = 0; i < 6; i++) {
      attr(q('.js-pole-' + i), {
        cx: r1(sc.poles[i].cx), cy: r1(sc.poles[i].cy),
        display: disp(sc.poles[i].on),
        opacity: r1(sc.poles[i].op)
      });
    }
    for (i = 0; i < 8; i++) {
      attr(q('.js-sp-' + i), {
        x1: r1(sc.spindles[i].x1), y1: r1(sc.spindles[i].y1),
        x2: r1(sc.spindles[i].x2), y2: r1(sc.spindles[i].y2),
        display: disp(sc.spindles[i].on),
        opacity: r1(sc.spindles[i].op)
      });
      c = sc.chr[i];
      attr(q('.js-chr-' + i), { display: disp(c.on), opacity: r1(c.op) });
      attr(q('.js-chr-' + i + ' .js-a1'), { d: c.a1, stroke: c.c1, 'stroke-width': c.sw });
      attr(q('.js-chr-' + i + ' .js-a2p'), { d: c.a2p, stroke: c.c1, 'stroke-width': c.sw });
      attr(q('.js-chr-' + i + ' .js-a2d'), { d: c.a2d, stroke: c.c2, 'stroke-width': c.sw });
      attr(q('.js-chr-' + i + ' .js-cen'), {
        cx: r1(c.cx), cy: r1(c.cy),
        display: disp(c.cen),
        opacity: r1(sc.cenOp)
      });
    }
    for (i = 0; i < 2; i++) {
      b = sc.biv[i];
      attr(q('.js-biv-' + i), { display: disp(b.on) });
      attr(q('.js-biv-' + i + ' .js-box'), {
        x: r1(b.x), y: r1(b.y), width: r1(b.w), height: r1(b.h)
      });
      attr(q('.js-biv-' + i + ' .js-hit'), {
        x: r1(b.x), y: r1(b.y), width: r1(b.w), height: r1(b.h)
      });
      attr(q('.js-crs-' + i), {
        display: disp(sc.cross[i].on),
        transform: 'translate(' + r1(sc.cross[i].cx) + ' ' + r1(sc.cross[i].cy) + ')'
      });
    }
    attr(q('.js-pl-bg'), { fill: sc.ploidyFill, stroke: sc.ploidyStroke });
    el = q('.js-pl-t');
    if (el) el.textContent = sc.ploidy;
    attr(q('.js-now'), { x: r1(sc.nowX), display: 'inline' });
    for (i = 0; i < 9; i++) {
      attr(q('.js-lab-' + i), {
        fill: sc.labFill[i],
        'font-weight': i === sc.anchor ? '700' : '500'
      });
    }
    attr(q('.js-cur'), {
      x1: r1(sc.cur.x1), y1: r1(sc.cur.y1),
      x2: r1(sc.cur.x2), y2: r1(sc.cur.y2)
    });
    attr(q('.js-dot'), { cx: r1(sc.dot.cx), cy: r1(sc.dot.cy) });
    for (i = 0; i < 4; i++) {
      g = sc.gam[i];
      attr(q('.js-gam-' + i), { display: disp(g.on) });
      attr(q('.js-gam-' + i + ' .js-hit'), {
        x: r1(g.x), y: r1(g.y), width: r1(g.w), height: r1(g.h)
      });
      attr(q('.js-gam-' + i + ' .js-gt'), { x: r1(g.tx), y: r1(g.ty) });
    }
  }

  function css() {
    return [
      '<style>',
      '.fgx-fig-meiosis .js-deco{pointer-events:none}',
      '.fgx-fig-meiosis .mem{fill:var(--fgx-elev,#f5f7fa);stroke:var(--fgx-ink,#1a1f2e);stroke-width:2.2}',
      '.fgx-fig-meiosis .nuc{fill:var(--fgx-c5-soft,#e4d8fb);stroke:var(--fgx-c5,#7c3aed);stroke-width:1.7;stroke-dasharray:5 3.5;fill-opacity:.55}',
      '.fgx-fig-meiosis .chr{fill:none;stroke-linecap:round;stroke-linejoin:round}',
      '.fgx-fig-meiosis .spn{fill:none;stroke:var(--fgx-c6,#0891b2);stroke-width:1.7;stroke-linecap:round}',
      '.fgx-fig-meiosis .plt{fill:none;stroke:var(--fgx-c3,#d97706);stroke-width:1.7;stroke-dasharray:5 4}',
      '.fgx-fig-meiosis .pole{fill:var(--fgx-c6,#0891b2)}',
      '.fgx-fig-meiosis .cen{fill:var(--fgx-c3,#d97706);stroke:var(--fgx-card,#fff);stroke-width:1.3}',
      '.fgx-fig-meiosis .bivbox{fill:transparent;stroke:var(--fgx-c3,#d97706);stroke-width:1.6;stroke-dasharray:6 4}',
      '.fgx-fig-meiosis .dnaf{fill:var(--fgx-c4-soft,#d7f0e0);stroke:none}',
      '.fgx-fig-meiosis .dnal{fill:none;stroke:var(--fgx-accent,#16a34a);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round}',
      '.fgx-fig-meiosis .grid{fill:none;stroke:var(--fgx-line,rgba(0,0,0,.18));stroke-width:1}',
      '.fgx-fig-meiosis .now{fill:var(--fgx-c4-soft,#d7f0e0)}',
      '.fgx-fig-meiosis .bar1{fill:var(--fgx-c3-soft,#f8e6c8);stroke:var(--fgx-c3,#d97706);stroke-width:1.2}',
      '.fgx-fig-meiosis .bar2{fill:var(--fgx-c1-soft,#d3e0fb);stroke:var(--fgx-c1,#2563eb);stroke-width:1.2}',
      '.fgx-fig-meiosis .bar0{fill:var(--fgx-c8-soft,#e1e5eb);stroke:var(--fgx-c8,#65748b);stroke-width:1.2}',
      '.fgx-fig-meiosis .fgx-hit{pointer-events:all}',
      '.fgx-fig-meiosis text{font-family:inherit}',
      '</style>'
    ].join('');
  }

  function dnaPath() {
    var x0 = ax(0);
    var x1 = ax(1);
    var x5 = ax(5);
    var x8 = ax(8);
    var y1 = gy(1);
    var y2 = gy(2);
    var y5 = gy(0.5);
    var y0 = gy(0);
    return 'M' + x0 + ' ' + r1(y1) +
      'L' + x1 + ' ' + r1(y2) +
      'L' + x5 + ' ' + r1(y2) +
      'L' + x5 + ' ' + r1(y1) +
      'L' + x8 + ' ' + r1(y1) +
      'L' + x8 + ' ' + r1(y5);
  }

  function svg(sc) {
    var p = [];
    var i;
    var c;
    var order;
    var b;
    var g;
    var part;
    var x;
    var y1;
    var y2;
    var y5;
    var line;
    var fill;
    p.push(css());
    for (i = 0; i < 4; i++) {
      p.push('<path class="mem js-deco js-mem-' + i + '" d="' + sc.mem[i].d + '" display="' + disp(sc.mem[i].on) + '"/>');
    }
    for (i = 0; i < 4; i++) {
      p.push('<path class="nuc js-deco js-nuc-' + i + '" d="' + sc.nuc[i].d + '" display="' + disp(sc.nuc[i].on) + '" opacity="' + r1(sc.nuc[i].op) + '"/>');
    }
    for (i = 0; i < 3; i++) {
      p.push('<line class="plt js-deco js-plt-' + i + '" x1="' + r1(sc.plates[i].x1) + '" y1="' + r1(sc.plates[i].y1) + '" x2="' + r1(sc.plates[i].x2) + '" y2="' + r1(sc.plates[i].y2) + '" display="' + disp(sc.plates[i].on) + '" opacity="' + r1(sc.plates[i].op) + '"/>');
    }
    for (i = 0; i < 6; i++) {
      p.push('<circle class="pole js-deco js-pole-' + i + '" cx="' + r1(sc.poles[i].cx) + '" cy="' + r1(sc.poles[i].cy) + '" r="4.5" display="' + disp(sc.poles[i].on) + '" opacity="' + r1(sc.poles[i].op) + '"/>');
    }
    for (i = 0; i < 8; i++) {
      p.push('<line class="spn js-deco js-sp-' + i + '" x1="' + r1(sc.spindles[i].x1) + '" y1="' + r1(sc.spindles[i].y1) + '" x2="' + r1(sc.spindles[i].x2) + '" y2="' + r1(sc.spindles[i].y2) + '" display="' + disp(sc.spindles[i].on) + '" opacity="' + r1(sc.spindles[i].op) + '"/>');
    }
    order = sc.draw;
    for (i = 0; i < order.length; i++) {
      c = sc.chr[order[i]];
      p.push('<g class="js-deco js-chr-' + order[i] + '" display="' + disp(c.on) + '" opacity="' + r1(c.op) + '">');
      p.push('<path class="chr js-a1" d="' + c.a1 + '" stroke="' + c.c1 + '" stroke-width="' + c.sw + '"/>');
      p.push('<path class="chr js-a2p" d="' + c.a2p + '" stroke="' + c.c1 + '" stroke-width="' + c.sw + '"/>');
      p.push('<path class="chr js-a2d" d="' + c.a2d + '" stroke="' + c.c2 + '" stroke-width="' + c.sw + '"/>');
      p.push('<circle class="cen js-cen" cx="' + r1(c.cx) + '" cy="' + r1(c.cy) + '" r="4.2" display="' + disp(c.cen) + '" opacity="' + r1(sc.cenOp) + '"/>');
      p.push('</g>');
    }
    for (i = 0; i < 2; i++) {
      b = sc.biv[i];
      p.push('<g data-part="bivalent" class="js-biv-' + i + '" display="' + disp(b.on) + '">');
      p.push('<rect class="bivbox fgx-vis js-box" x="' + r1(b.x) + '" y="' + r1(b.y) + '" width="' + r1(b.w) + '" height="' + r1(b.h) + '" rx="10"/>');
      p.push('<rect class="fgx-hit js-hit" x="' + r1(b.x) + '" y="' + r1(b.y) + '" width="' + r1(b.w) + '" height="' + r1(b.h) + '" fill="transparent" pointer-events="all"/>');
      p.push('</g>');
    }
    for (i = 0; i < 2; i++) {
      p.push('<g data-part="crossing" class="js-crs-' + i + '" display="' + disp(sc.cross[i].on) + '" transform="translate(' + r1(sc.cross[i].cx) + ' ' + r1(sc.cross[i].cy) + ')">');
      p.push('<circle r="5" fill="var(--fgx-card,#fff)" stroke="var(--fgx-c3,#d97706)" stroke-width="2.2"/>');
      p.push('<circle r="2" fill="var(--fgx-c3,#d97706)"/>');
      p.push('<rect class="fgx-hit" x="-12" y="-12" width="24" height="24" fill="transparent" pointer-events="all"/>');
      p.push('</g>');
    }
    for (i = 0; i < 4; i++) {
      g = sc.gam[i];
      p.push('<g data-part="gamete" class="js-gam-' + i + '" display="' + disp(g.on) + '">');
      p.push('<rect class="fgx-hit js-hit" x="' + r1(g.x) + '" y="' + r1(g.y) + '" width="' + r1(g.w) + '" height="' + r1(g.h) + '" rx="18" fill="transparent" pointer-events="all"/>');
      p.push('<text class="js-gt" x="' + r1(g.tx) + '" y="' + r1(g.ty) + '" text-anchor="middle" font-size="15" font-weight="700" fill="' + INK + '">생식세포</text>');
      p.push('</g>');
    }

    p.push('<g data-part="nuclear_phase">');
    p.push('<rect class="fgx-vis js-pl-bg" x="366" y="22" width="180" height="46" rx="12" fill="' + sc.ploidyFill + '" stroke="' + sc.ploidyStroke + '" stroke-width="1.7"/>');
    p.push('<text class="js-pl-t" x="456" y="52" text-anchor="middle" font-size="18" font-weight="700" fill="' + INK + '">' + sc.ploidy + '</text>');
    p.push('</g>');
    p.push('<g class="js-deco">');
    p.push('<circle cx="384" cy="86" r="5.5" fill="' + RED + '"/>');
    p.push('<text x="394" y="91" font-size="15" fill="' + INK + '">모계</text>');
    p.push('<circle cx="454" cy="86" r="5.5" fill="' + BLUE + '"/>');
    p.push('<text x="464" y="91" font-size="15" fill="' + INK + '">부계</text>');
    p.push('</g>');

    p.push('<line class="js-deco" x1="' + ax(0) + '" y1="' + Y_AXIS + '" x2="' + ax(8) + '" y2="' + Y_AXIS + '" stroke="var(--fgx-line,rgba(0,0,0,.18))" stroke-width="1.4"/>');
    p.push('<rect class="now js-deco js-now" x="' + r1(sc.nowX) + '" y="308" width="52" height="24" rx="7"/>');

    p.push('<g data-part="interphase">');
    p.push('<rect class="fgx-hit" x="' + (ax(0) - 26) + '" y="274" width="' + (ADX + 52) + '" height="62" fill="transparent" pointer-events="all"/>');
    p.push('<rect class="bar0 fgx-vis" x="' + (ax(0) - 18) + '" y="' + Y_BAR + '" width="' + (ADX + 36) + '" height="9" rx="4"/>');
    p.push('<text x="' + ((ax(0) + ax(1)) / 2) + '" y="' + Y_BR + '" text-anchor="middle" font-size="15" font-weight="700" fill="' + DIM + '">간기</text>');
    p.push('<text class="js-lab-0" x="' + ax(0) + '" y="' + Y_LAB + '" text-anchor="middle" font-size="15" font-weight="' + (sc.anchor === 0 ? '700' : '500') + '" fill="' + sc.labFill[0] + '">G₁</text>');
    p.push('<text class="js-lab-1" x="' + ax(1) + '" y="' + Y_LAB + '" text-anchor="middle" font-size="15" font-weight="' + (sc.anchor === 1 ? '700' : '500') + '" fill="' + sc.labFill[1] + '">G₂</text>');
    p.push('</g>');

    p.push('<g data-part="meiosis1">');
    p.push('<rect class="fgx-hit" x="' + (ax(2) - 22) + '" y="274" width="' + (ADX * 3 + 44) + '" height="28" fill="transparent" pointer-events="all"/>');
    p.push('<rect class="bar1 fgx-vis" x="' + (ax(2) - 16) + '" y="' + Y_BAR + '" width="' + (ADX * 3 + 32) + '" height="9" rx="4"/>');
    p.push('<text x="' + ((ax(2) + ax(5)) / 2) + '" y="' + Y_BR + '" text-anchor="middle" font-size="16" font-weight="700" fill="' + INK + '">감수 1분열</text>');
    p.push('</g>');

    p.push('<g data-part="meiosis2">');
    p.push('<rect class="fgx-hit" x="' + (ax(6) - 22) + '" y="274" width="' + (ADX * 2 + 48) + '" height="28" fill="transparent" pointer-events="all"/>');
    p.push('<rect class="bar2 fgx-vis" x="' + (ax(6) - 16) + '" y="' + Y_BAR + '" width="' + (ADX * 2 + 36) + '" height="9" rx="4"/>');
    p.push('<text x="' + ((ax(6) + ax(8)) / 2) + '" y="' + Y_BR + '" text-anchor="middle" font-size="16" font-weight="700" fill="' + INK + '">감수 2분열</text>');
    p.push('</g>');

    for (i = 2; i <= 8; i++) {
      part = LAB_PART[i];
      p.push('<g data-part="' + part + '">');
      p.push('<rect class="fgx-hit" x="' + (ax(i) - 26) + '" y="306" width="52" height="30" fill="transparent" pointer-events="all"/>');
      p.push('<text class="js-lab-' + i + '" x="' + ax(i) + '" y="' + Y_LAB + '" text-anchor="middle" font-size="15" font-weight="' + (sc.anchor === i ? '700' : '500') + '" fill="' + sc.labFill[i] + '">' + LABELS[i] + '</text>');
      p.push('</g>');
    }

    line = dnaPath();
    fill = line + 'L' + ax(8) + ' ' + Y_G0 + 'L' + ax(0) + ' ' + Y_G0 + 'Z';
    y2 = r1(gy(2));
    y1 = r1(gy(1));
    y5 = r1(gy(0.5));
    p.push('<g data-part="dna_rel">');
    p.push('<rect class="fgx-hit" x="6" y="338" width="440" height="100" fill="transparent" pointer-events="all"/>');
    p.push('<line class="grid" x1="' + ax(0) + '" y1="' + y2 + '" x2="' + ax(8) + '" y2="' + y2 + '"/>');
    p.push('<line class="grid" x1="' + ax(0) + '" y1="' + y1 + '" x2="' + ax(8) + '" y2="' + y1 + '"/>');
    p.push('<line class="grid" x1="' + ax(0) + '" y1="' + y5 + '" x2="' + ax(8) + '" y2="' + y5 + '"/>');
    p.push('<path class="dnaf" d="' + fill + '"/>');
    p.push('<path class="dnal fgx-vis" d="' + line + '"/>');
    p.push('<text x="32" y="' + (Number(y2) + 4) + '" text-anchor="end" font-size="14" fill="' + DIM + '">2</text>');
    p.push('<text x="32" y="' + (Number(y1) + 4) + '" text-anchor="end" font-size="14" fill="' + DIM + '">1</text>');
    p.push('<text x="32" y="' + (Number(y5) + 4) + '" text-anchor="end" font-size="14" fill="' + DIM + '">0.5</text>');
    p.push('<text x="' + ax(0) + '" y="' + Y_CAP + '" font-size="15" fill="' + INK + '">DNA 상대량 (G₁기=1)</text>');
    p.push('<line class="js-cur" x1="' + r1(sc.cur.x1) + '" y1="' + r1(sc.cur.y1) + '" x2="' + r1(sc.cur.x2) + '" y2="' + r1(sc.cur.y2) + '" stroke="' + ACC + '" stroke-width="1.5" pointer-events="none"/>');
    p.push('<circle class="js-dot" cx="' + r1(sc.dot.cx) + '" cy="' + r1(sc.dot.cy) + '" r="5" fill="' + ACC + '" stroke="var(--fgx-card,#fff)" stroke-width="1.6"/>');
    p.push('</g>');

    x = 452;
    p.push('<g data-part="gamete">');
    p.push('<rect class="fgx-hit" x="' + x + '" y="420" width="100" height="16" fill="transparent" pointer-events="all"/>');
    for (i = 0; i < 4; i++) {
      p.push('<rect x="' + (x + i * 25) + '" y="421" width="18" height="13" rx="3.5" fill="var(--fgx-elev,#f5f7fa)" stroke="var(--fgx-ink,#1a1f2e)" stroke-width="1.2"/>');
      p.push('<line x1="' + (x + i * 25 + 9) + '" y1="423" x2="' + (x + i * 25 + 9) + '" y2="432" stroke="' + (i % 2 ? BLUE : RED) + '" stroke-width="2" stroke-linecap="round"/>');
    }
    p.push('</g>');
    return p.join('');
  }

  function render(v) {
    return svg(calc(v));
  }

  function update(ctx) {
    var sc = calc(ctx.v);
    apply(ctx.q, sc);
    return { readout: sc.readout, active: sc.active, follow: sc.follow };
  }

  NMFIG.define('meiosis', {
    viewBox: [560, 440],
    views: [{ id: 'steps', label: '감수 분열' }],
    controls: [
      {
        id: 'stage',
        type: 'range',
        label: '단계',
        min: 0,
        max: 8,
        step: 0.02,
        value: 0,
        fmt: function (v) {
          var s = anchorOf(num(v));
          return STAGE_NAME[s];
        }
      }
    ],
    animate: { control: 'stage', from: 0, to: 8, duration: 28000, loop: true },
    render: render,
    update: update,
    _calc: calc
  });
})(window.NMFIG);
