/* 뇌·내분비 탐험기 그림 — SVG 내부 마크업만 (루트 svg는 explorer가 만든다).
 * 옆면 네 엽은 같은 곡선을 앞뒤로 이어 빈틈·겹침 없이 맞물린다.
 */
(function () {
  'use strict';

  function r1(v) { return Math.round(v * 10) / 10; }

  function S(x0, y0, c1x, c1y, c2x, c2y, x1, y1) {
    return { x0: x0, y0: y0, c1x: c1x, c1y: c1y, c2x: c2x, c2y: c2y, x1: x1, y1: y1 };
  }

  /* 닫힌 점열 → 서로 이어진 3차 베지어. 끝점 좌표는 입력 그대로라 뒤집어도 정확히 맞는다. */
  function smoothClosedSegs(pts) {
    var n = pts.length;
    var segs = [];
    var i, p0, p1, p2, p3;
    for (i = 0; i < n; i++) {
      p0 = pts[(i - 1 + n) % n];
      p1 = pts[i];
      p2 = pts[(i + 1) % n];
      p3 = pts[(i + 2) % n];
      segs.push(S(
        p1[0], p1[1],
        r1(p1[0] + (p2[0] - p0[0]) / 6), r1(p1[1] + (p2[1] - p0[1]) / 6),
        r1(p2[0] - (p3[0] - p1[0]) / 6), r1(p2[1] - (p3[1] - p1[1]) / 6),
        p2[0], p2[1]
      ));
    }
    return segs;
  }

  function smoothOpenSegs(pts) {
    var n = pts.length;
    var segs = [];
    var i, p0, p1, p2, p3;
    for (i = 0; i < n - 1; i++) {
      p0 = i === 0 ? pts[0] : pts[i - 1];
      p1 = pts[i];
      p2 = pts[i + 1];
      p3 = i + 2 < n ? pts[i + 2] : pts[n - 1];
      if (i === 0) p0 = p1;
      if (i + 2 >= n) p3 = p2;
      segs.push(S(
        p1[0], p1[1],
        r1(p1[0] + (p2[0] - p0[0]) / 6), r1(p1[1] + (p2[1] - p0[1]) / 6),
        r1(p2[0] - (p3[0] - p1[0]) / 6), r1(p2[1] - (p3[1] - p1[1]) / 6),
        p2[0], p2[1]
      ));
    }
    return segs;
  }

  function sliceSegs(segs, from, to) {
    var n = segs.length;
    var out = [];
    var i = from;
    var guard = 0;
    while (i !== to && guard <= n) {
      out.push(segs[i]);
      i = (i + 1) % n;
      guard++;
    }
    return out;
  }

  function reversed(segs) {
    var out = [];
    var i, s;
    for (i = segs.length - 1; i >= 0; i--) {
      s = segs[i];
      out.push(S(s.x1, s.y1, s.c2x, s.c2y, s.c1x, s.c1y, s.x0, s.y0));
    }
    return out;
  }

  function concat(name, lists) {
    var all = [];
    var i, j, prev, s0;
    for (i = 0; i < lists.length; i++) {
      if (!lists[i].length) throw new Error(name + ' 빈 곡선');
      if (all.length) {
        prev = all[all.length - 1];
        s0 = lists[i][0];
        if (Math.abs(prev.x1 - s0.x0) > 0.05 || Math.abs(prev.y1 - s0.y0) > 0.05) {
          throw new Error(name + ' 연결 실패 ' + prev.x1 + ',' + prev.y1 + ' → ' + s0.x0 + ',' + s0.y0);
        }
      }
      for (j = 0; j < lists[i].length; j++) all.push(lists[i][j]);
    }
    if (Math.abs(all[0].x0 - all[all.length - 1].x1) > 0.05 || Math.abs(all[0].y0 - all[all.length - 1].y1) > 0.05) {
      throw new Error(name + ' 닫히지 않음');
    }
    return all;
  }

  function pathD(segs, close) {
    var d = 'M ' + segs[0].x0 + ' ' + segs[0].y0;
    var i, s;
    for (i = 0; i < segs.length; i++) {
      s = segs[i];
      d += ' C ' + s.c1x + ' ' + s.c1y + ' ' + s.c2x + ' ' + s.c2y + ' ' + s.x1 + ' ' + s.y1;
    }
    return close === false ? d : d + ' Z';
  }

  function poly(pts) { return pathD(smoothClosedSegs(pts), true); }
  function polyOpen(pts) { return pathD(smoothOpenSegs(pts), false); }

  function g(attrs, inner) {
    var s = '<g';
    var k;
    for (k in attrs) {
      if (attrs[k] != null && attrs[k] !== '') s += ' ' + k + '="' + attrs[k] + '"';
    }
    return s + '>' + inner + '</g>';
  }

  function part(key, fill, op, inner, opt) {
    opt = opt || {};
    return g({
      'class': 'ax-part' + (opt.cls ? ' ' + opt.cls : ''),
      'data-part': key,
      fill: fill,
      'fill-opacity': op,
      'data-sex': opt.sex || null
    }, inner);
  }

  function target(id, fill, op, inner, opt) {
    opt = opt || {};
    return g({
      'class': 'ax-target' + (opt.cls ? ' ' + opt.cls : ''),
      'data-target': id,
      fill: fill,
      'fill-opacity': op,
      'data-sex': opt.sex || null
    }, inner);
  }

  function P(d) { return '<path d="' + d + '"/>'; }
  function spot(d) { return '<path class="ax-spot" d="' + d + '"/>'; }
  function ell(cx, cy, rx, ry, cls) {
    return '<ellipse' + (cls ? ' class="' + cls + '"' : '') + ' cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/>';
  }

  function deco(inner, stroke, sw, op) {
    return g({
      'class': 'ax-deco',
      'pointer-events': 'none',
      fill: 'none',
      stroke: stroke,
      'stroke-width': sw,
      'stroke-opacity': op == null ? 0.4 : op,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, inner);
  }

  function paths(list) {
    var s = '';
    var i;
    for (i = 0; i < list.length; i++) s += P(polyOpen(list[i]));
    return s;
  }

  /* 소뇌 가로 주름 — 윤곽 타원 안쪽에만 그린다 */
  function folia(cx, cy, rx, ry, n) {
    var s = '';
    var i, t, y, k, half, x1, x2, bow;
    for (i = 1; i < n; i++) {
      t = i / n;
      y = cy - ry + t * ry * 2;
      k = (y - cy) / ry;
      half = rx * Math.sqrt(Math.max(0, 1 - k * k));
      if (half < 10) continue;
      x1 = cx - half * 0.9;
      x2 = cx + half * 0.9;
      bow = 5 + 6 * (0.5 - Math.abs(t - 0.5));
      s += '<path d="M ' + r1(x1) + ' ' + r1(y) + ' Q ' + r1(cx) + ' ' + r1(y + bow) + ' ' + r1(x2) + ' ' + r1(y) + '"/>';
    }
    return s;
  }

  function hit(cx, cy, r) {
    return '<circle fill="transparent" stroke="none" style="stroke:none" cx="' + cx + '" cy="' + cy + '" r="' + r + '"/>';
  }

  function idxOf(pts, pt) {
    var i;
    for (i = 0; i < pts.length; i++) if (pts[i] === pt) return i;
    throw new Error('기준점 없음');
  }

  function loopD(name, lists) {
    return pathD(concat(name, lists), true);
  }

  function shrink(pts, k) {
    var cx = 0, cy = 0, i, out = [];
    for (i = 0; i < pts.length; i++) { cx += pts[i][0]; cy += pts[i][1]; }
    cx /= pts.length;
    cy /= pts.length;
    for (i = 0; i < pts.length; i++) {
      out.push([r1(cx + (pts[i][0] - cx) * k), r1(cy + (pts[i][1] - cy) * k)]);
    }
    return out;
  }

  /* 구불구불한 회·구 무늬: 시작점→끝점 사이를 크게 굽이치게 한다 (엽 안쪽에만 쓴다).
   * 굽이마다 진폭·위상을 달리해 규칙적인 지그재그로 보이지 않게 한다. */
  function wig(x1, y1, x2, y2, amp, waves) {
    var pts = [];
    var n = waves * 2;
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len, ny = dx / len;
    var seed = Math.round(x1 * 3 + y1 * 5 + len);
    var i, t, k, jitter, drift;
    for (i = 0; i <= n; i++) {
      t = i / n;
      jitter = 0.55 + 0.9 * (((seed + i * 37) % 11) / 10);
      drift = (((seed + i * 53) % 7) - 3) * 0.012;
      k = (i === 0 || i === n) ? 0 : (i % 2 ? 1 : -1) * amp * jitter;
      pts.push([r1(x1 + dx * (t + drift) + nx * k), r1(y1 + dy * (t + drift) + ny * k)]);
    }
    return pts;
  }

  /* ═══════════════ 옆면 (전두엽이 왼쪽) ═══════════════
   * 외곽은 한 바퀴. 실비우스 열(외측구)은 윤곽이 한번 들어갔다가 측두극이 다시 앞아래로 나온다.
   * A 외측구 입구 · B 중심구∩외측구 · C 외측구 뒤끝 · D 중심구 위 · E 두정–후두 경계(위) · F 후두전 패임(아래) */
  var A = [204, 270];
  var B = [340, 244];
  var C = [560, 188];
  var D = [420, 28];
  var E = [620, 82];
  var F = [652, 312];

  var outerPts = [
    A,
    [170, 262], [132, 254], [100, 238], [84, 210], [90, 168], [110, 126], [146, 88], [196, 58], [256, 38], [330, 28],
    D,
    [492, 32], [560, 50],
    E,
    [660, 118], [690, 162], [704, 214], [698, 262], [678, 296],
    F,
    [610, 330], [556, 344], [498, 352], [438, 356], [378, 352], [322, 342], [272, 326], [234, 308], [214, 294]
  ];
  var iA = idxOf(outerPts, A);
  var iD = idxOf(outerPts, D);
  var iE = idxOf(outerPts, E);
  var iF = idxOf(outerPts, F);
  var outerSegs = smoothClosedSegs(outerPts);
  var frontOuter = sliceSegs(outerSegs, iA, iD);
  var parietalOuter = sliceSegs(outerSegs, iD, iE);
  var occipitalOuter = sliceSegs(outerSegs, iE, iF);
  var temporalOuter = sliceSegs(outerSegs, iF, iA);

  var central = smoothOpenSegs([D, [406, 74], [388, 126], [368, 178], [350, 224], B]);
  var lfAll = smoothOpenSegs([A, [252, 262], [298, 254], B, [410, 234], [486, 214], C]);
  var lfFront = lfAll.slice(0, 3);
  var lfBack = lfAll.slice(3);
  var po = smoothOpenSegs([E, [604, 128], [580, 160], C]);
  var toF = smoothOpenSegs([C, [596, 232], [632, 276], F]);

  var frontalD = loopD('frontal', [frontOuter, central, reversed(lfFront)]);
  var parietalD = loopD('parietal', [parietalOuter, po, reversed(lfBack), reversed(central)]);
  var occipitalD = loopD('occipital', [occipitalOuter, reversed(toF), reversed(po)]);
  var temporalD = loopD('temporal', [temporalOuter, lfFront, lfBack, toF]);

  /* 소뇌는 후두엽·측두엽 아래로 윗부분이 파고든다 → 대뇌보다 먼저 그린다. 크기는 대뇌 길이의 약 1/3. */
  var cerebPts = [
    [476, 374], [494, 344], [536, 322], [596, 310], [652, 318], [690, 342], [704, 380],
    [692, 414], [654, 436], [600, 444], [548, 436], [506, 418], [484, 398]
  ];
  /* 뇌줄기: 측두엽 아랫면에서 나와 뒤쪽으로 비스듬히 내려가 척수로 이어진다. 가운데 뇌교가 볼록. */
  var stemPts = [
    [386, 346], [380, 386], [388, 430], [402, 474], [414, 518], [416, 568], [466, 568],
    [468, 520], [476, 474], [488, 430], [492, 388], [482, 346], [434, 334]
  ];

  var gyriSets = [
    /* 전두엽 */
    wig(122, 200, 306, 152, 12, 3), wig(114, 152, 266, 100, 11, 3), wig(152, 228, 334, 206, 10, 3),
    wig(190, 114, 376, 72, 10, 3), wig(236, 176, 358, 156, 9, 2),
    /* 두정엽 */
    wig(436, 70, 566, 92, 11, 3), wig(424, 122, 574, 144, 11, 3), wig(404, 178, 536, 180, 10, 3),
    wig(480, 46, 606, 66, 9, 2),
    /* 후두엽 */
    wig(630, 130, 690, 170, 10, 2), wig(612, 188, 682, 228, 10, 2), wig(628, 244, 658, 280, 8, 1),
    /* 측두엽 */
    wig(246, 304, 426, 294, 11, 3), wig(278, 328, 470, 318, 10, 3), wig(450, 264, 568, 252, 9, 2),
    wig(352, 282, 502, 270, 9, 3)
  ];

  var sideFolia = '';
  (function () {
    var rows = [[344, 520, 700], [364, 508, 706], [384, 506, 704], [404, 514, 690], [424, 538, 660]];
    var i, y, x1, x2;
    for (i = 0; i < rows.length; i++) {
      y = rows[i][0]; x1 = rows[i][1]; x2 = rows[i][2];
      sideFolia += '<path d="M ' + x1 + ' ' + y + ' Q ' + Math.round((x1 + x2) / 2) + ' ' + (y + 7) + ' ' + x2 + ' ' + y + '"/>';
    }
  })();

  var brainSide = [
    part('cerebellum', '#e4c27a', '1', P(poly(cerebPts)) + deco(sideFolia, '#8a6230', 1.4, 0.55)),
    part('brainstem', '#e09aa3', '1', P(poly(stemPts)) + deco(paths([
      [[392, 372], [432, 380], [478, 372]],
      [[392, 396], [434, 404], [482, 394]],
      [[398, 420], [436, 426], [484, 416]],
      [[410, 470], [438, 474], [470, 468]],
      [[416, 520], [440, 524], [468, 518]]
    ]), '#7a4450', 1.5, 0.4)),
    part('occipital', '#8ebbe8', '1', P(occipitalD)),
    part('temporal', '#c9b0e0', '1', P(temporalD)),
    part('parietal', '#7dcec0', '1', P(parietalD)),
    part('frontal', '#f2b39a', '1', P(frontalD)),
    deco(
      '<path d="' + pathD(central, false) + '" stroke-width="3.4" stroke-opacity="0.82"/>' +
      '<path d="' + pathD(lfAll, false) + '" stroke-width="3.6" stroke-opacity="0.84"/>' +
      '<path d="' + pathD(po, false) + '" stroke-width="2.8" stroke-opacity="0.7"/>' +
      '<path d="' + pathD(toF, false) + '" stroke-width="2.2" stroke-opacity="0.55"/>' +
      paths(gyriSets),
      '#4a382f', 1.15, 0.4
    )
  ].join('');

  /* ═══════════════ 정중 단면 (전두엽이 왼쪽) ═══════════════
   * 뇌줄기(중간뇌·뇌교·연수)는 맞닿는 변을 공유해 한 줄기로 이어진다. */
  var mpA = [392, 346], mpB = [438, 354], mpC = [484, 346];
  var pmA = [372, 424], pmB = [420, 432], pmC = [470, 424];
  var mcA = [396, 496], mcB = [424, 502], mcC = [452, 496];

  var cutMP = smoothOpenSegs([mpA, mpB, mpC]);
  var cutPM = smoothOpenSegs([pmA, pmB, pmC]);
  var cutMC = smoothOpenSegs([mcA, mcB, mcC]);

  var midArc = smoothOpenSegs([mpC, [492, 324], [490, 300], [470, 282], [436, 276], [404, 282], [386, 302], [386, 326], mpA]);
  var ponsFront = smoothOpenSegs([mpA, [360, 356], [340, 384], [350, 410], pmA]);
  var ponsBack = smoothOpenSegs([pmC, [490, 402], [494, 374], mpC]);
  var medFront = smoothOpenSegs([pmA, [366, 448], [378, 474], mcA]);
  var medBack = smoothOpenSegs([mcC, [458, 476], [466, 450], pmC]);
  var cordSides = smoothOpenSegs([mcA, [398, 530], [400, 572], [426, 580], [452, 572], [452, 530], mcC]);

  var midbrainD = loopD('midbrain', [midArc, cutMP]);
  var ponsD = loopD('pons', [reversed(cutMP), ponsFront, cutPM, ponsBack]);
  var medullaD = loopD('medulla', [reversed(cutPM), medFront, cutMC, medBack]);
  var cordD = loopD('cord', [reversed(cutMC), cordSides]);

  var cerebrumPts = [
    [84, 206], [96, 160], [130, 112], [182, 72], [250, 44], [330, 30], [420, 28], [510, 38], [590, 62],
    [650, 100], [692, 150], [716, 205], [712, 255], [684, 292], [640, 312], [590, 318], [540, 322],
    [494, 340], [450, 372], [412, 392], [372, 396], [332, 392], [296, 384], [264, 368], [236, 344],
    [204, 318], [164, 284], [120, 250]
  ];
  var whitePts = shrink(cerebrumPts, 0.88);
  var callosumPts = [
    [232, 184], [246, 152], [282, 128], [336, 114], [394, 108], [454, 112], [506, 128], [540, 154],
    [552, 190], [540, 222], [516, 224], [500, 196], [468, 166], [424, 150], [376, 146], [330, 152],
    [292, 170], [270, 194], [262, 220], [244, 216]
  ];
  var thalamusPts = [[350, 214], [344, 240], [364, 266], [408, 276], [452, 268], [474, 244], [468, 216], [440, 200], [396, 198]];
  var hypoPts = [[300, 268], [296, 288], [312, 306], [342, 310], [366, 296], [364, 274], [340, 262]];
  var pinealPts = [[480, 214], [478, 232], [494, 244], [510, 236], [508, 218], [496, 210]];
  var cereMidPts = [
    [496, 350], [516, 316], [560, 296], [620, 292], [676, 312], [708, 350], [716, 392],
    [696, 430], [652, 452], [596, 458], [546, 446], [514, 420], [498, 388]
  ];
  var hippoPts = [[274, 372], [300, 364], [336, 366], [372, 372], [396, 382], [384, 388], [348, 382], [312, 380], [284, 384]];
  var amygPts = [[250, 346], [256, 334], [276, 330], [290, 340], [286, 356], [266, 362]];
  var midSulci = [
    [[232, 128], [290, 96], [380, 82], [470, 88], [540, 112], [580, 150], [590, 196]],
    [[610, 72], [596, 120], [580, 160], [566, 196]],
    [[566, 196], [620, 214], [676, 222], [708, 236]],
    [[150, 150], [200, 100], [290, 64], [380, 52]],
    [[420, 60], [500, 66], [570, 90]],
    [[160, 230], [220, 190], [290, 150]],
    [[130, 210], [150, 180]],
    [[650, 130], [690, 170], [706, 210]]
  ];
  var arbor = [
    [[520, 392], [590, 396], [650, 384], [696, 388]],
    [[590, 394], [630, 356], [672, 336], [700, 352]],
    [[600, 398], [652, 392], [690, 416]],
    [[580, 402], [620, 436], [664, 446]],
    [[550, 396], [574, 430], [610, 448]],
    [[648, 360], [662, 332], [688, 330]]
  ];
  var midFolia = '';
  (function () {
    var rows = [304, 322, 340, 358, 376, 394, 412, 430, 444];
    var i, y, x1, x2, k;
    for (i = 0; i < rows.length; i++) {
      y = rows[i];
      k = Math.abs(y - 374) / 90;
      x1 = 508 + k * 36;
      x2 = 708 - k * 40;
      midFolia += '<path d="M ' + r1(x1) + ' ' + y + ' Q ' + r1((x1 + x2) / 2) + ' ' + (y + 6) + ' ' + r1(x2) + ' ' + y + '"/>';
    }
  })();

  var brainMid = [
    part('cerebellum', '#e4c27a', '1',
      P(poly(cereMidPts)) +
      deco(midFolia, '#8a6230', 1.25, 0.5) +
      deco(paths(arbor), '#f7f1e2', 5, 0.95)
    ),
    part('cerebrum', '#d9a28e', '1',
      P(poly(cerebrumPts)) +
      '<path fill="#f7f3ee" fill-opacity="0.98" d="' + poly(whitePts) + '"/>' +
      deco(paths(midSulci), '#6a4a40', 1.55, 0.48)
    ),
    part('spinal_cord', '#c9a3aa', '0.95',
      P(cordD) +
      '<path fill="none" stroke="#f4e8ea" stroke-width="1.6" stroke-linecap="round" d="M 424 506 L 426 574"/>'
    ),
    part('medulla', '#a85d72', '0.95', P(medullaD)),
    part('pons', '#b86d82', '0.95', P(ponsD) + deco(paths([
      [[362, 372], [420, 380], [486, 370]],
      [[350, 394], [420, 404], [492, 392]],
      [[360, 414], [430, 422], [484, 408]]
    ]), '#f6e8ea', 1.8, 0.5)),
    part('midbrain', '#c98490', '0.95',
      P(midbrainD) +
      '<ellipse fill="#e0b0b6" cx="486" cy="296" rx="8" ry="6"/>' +
      '<ellipse fill="#e0b0b6" cx="494" cy="314" rx="8" ry="6"/>' +
      '<ellipse fill="#d0989e" cx="480" cy="334" rx="7" ry="5"/>'
    ),
    '<path pointer-events="none" fill="#c5d5de" d="M 496 366 L 508 380 L 498 398 Z"/>',
    part('corpus_callosum', '#fbf7ef', '1', P(poly(callosumPts))),
    deco(
      '<path d="M 300 198 C 350 168, 420 160, 480 178 C 496 186, 504 200, 508 214" fill="none"/>' +
      '<path d="M 304 202 C 312 226, 318 250, 312 270" fill="none"/>',
      '#b6a27a', 2.2, 0.9
    ),
    part('thalamus', '#e08a62', '0.96', P(poly(thalamusPts)) + '<circle cx="408" cy="236" r="4.5" fill="#c46a48"/>'),
    part('hypothalamus', '#d4537e', '1', P(poly(hypoPts)) + hit(332, 288, 15)),
    '<ellipse class="ax-deco" pointer-events="none" cx="306" cy="318" rx="14" ry="6" fill="#b86d82" fill-opacity="0.8"/>',
    part('pineal', '#d4a017', '0.97', P(poly(pinealPts)) + hit(494, 228, 14)),
    part('pituitary', '#c42d66', '0.97',
      '<path d="M 330 304 C 326 318, 324 326, 322 334" fill="none" stroke="#c42d66" stroke-width="4.5" stroke-linecap="round"/>' +
      '<ellipse cx="322" cy="348" rx="19" ry="14" fill="#c42d66"/>' +
      '<ellipse cx="331" cy="348" rx="7" ry="9" fill="#9a2048"/>' +
      hit(322, 346, 20)
    ),
    part('hippocampus', '#5b8fc4', '0.55', P(poly(hippoPts)), { cls: 'ax-lateral' }),
    part('amygdala', '#7d6aad', '0.55', P(poly(amygPts)) + hit(268, 346, 16), { cls: 'ax-lateral' })
  ].join('');

  /* ═══════════════ 몸 ═══════════════ */
  var CX = 176;

  function mirrorSeg(s) {
    return S(r1(CX * 2 - s.x0), s.y0, r1(CX * 2 - s.c1x), s.c1y, r1(CX * 2 - s.c2x), s.c2y, r1(CX * 2 - s.x1), s.y1);
  }
  function bodyD(pts) {
    var left = smoothOpenSegs(pts);
    var right = reversed(left);
    var i;
    for (i = 0; i < right.length; i++) right[i] = mirrorSeg(right[i]);
    return pathD(left.concat(right), true);
  }

  var bodyLine = [
    [176, 28],
    [158, 32], [140, 46], [126, 70], [122, 96], [126, 114],
    [130, 132], [140, 148], [142, 160],
    [139, 176], [138, 194], [140, 208],
    [122, 216], [98, 226], [76, 236], [62, 246],
    [46, 278], [34, 328], [28, 378], [24, 428], [18, 478], [14, 528], [10, 566],
    [4, 590], [2, 612], [16, 630], [34, 634], [48, 616], [56, 592], [58, 568],
    [52, 528], [50, 478], [52, 428], [54, 378], [58, 330], [70, 294],
    [90, 316], [88, 358], [90, 408], [96, 456], [100, 502], [96, 536], [92, 568],
    [90, 604], [93, 654], [97, 714], [101, 770], [104, 830], [106, 872],
    [98, 898], [102, 916], [128, 924], [154, 916], [156, 896],
    [152, 868], [150, 820], [152, 770], [156, 710], [162, 652], [168, 604],
    [176, 570]
  ];

  function ribs() {
    var s = '';
    var i, y, side, reach;
    for (side = -1; side <= 1; side += 2) {
      for (i = 0; i < 7; i++) {
        y = 268 + i * 16;
        reach = 46 + i * 4;
        s += '<path class="ax-spot" d="M ' + CX + ' ' + y +
          ' Q ' + (CX + side * 26) + ' ' + (y + 3) + ' ' + (CX + side * reach) + ' ' + (y + 12) + '"/>';
      }
    }
    s += '<path class="ax-spot" d="M 150 578 C 138 650, 126 730, 118 822"/>';
    s += '<path class="ax-spot" d="M 202 578 C 214 650, 226 730, 234 822"/>';
    return s;
  }

  var liverD = 'M 108 342 C 100 378, 106 436, 138 466 C 168 458, 196 424, 206 382 C 202 350, 172 332, 140 336 C 118 332, 108 334, 108 342 Z';
  var heartD = 'M 188 310 C 170 326, 166 356, 184 376 L 228 402 C 246 386, 252 352, 240 328 C 230 308, 210 296, 192 304 C 186 306, 182 308, 188 310 Z';
  var stomachD = 'M 184 344 C 216 332, 246 354, 240 394 C 234 430, 202 446, 174 422 C 156 404, 162 358, 184 344 Z';
  var colonD = 'M 118 398 L 118 512 C 118 532, 150 542, 178 524 C 204 508, 224 514, 228 492 L 228 398 C 228 384, 200 376, 176 388 C 146 376, 118 384, 118 398 Z' +
    ' M 146 418 L 146 494 C 146 508, 168 514, 186 500 C 202 488, 208 468, 206 440 L 206 418 C 190 406, 160 406, 146 418 Z';
  var massD = 'M 154 436 C 148 460, 156 496, 176 504 C 198 510, 214 488, 210 460 C 206 436, 186 424, 168 428 C 158 430, 154 432, 154 436 Z';
  var kidneyLD = 'M 136 436 C 114 452, 110 492, 128 514 C 142 526, 160 514, 162 494 C 156 478, 144 476, 150 462 C 158 450, 160 436, 144 428 C 136 424, 132 428, 136 436 Z';
  var kidneyRD = 'M 220 422 C 206 436, 202 472, 216 496 C 228 510, 246 502, 250 482 C 246 468, 234 466, 240 452 C 248 440, 246 426, 230 418 C 220 414, 216 416, 220 422 Z';
  var adrenalLD = 'M 146 440 L 118 468 L 170 464 Z';
  var adrenalRD = 'M 230 426 L 204 454 L 254 450 Z';
  var pancreasD = 'M 122 384 C 114 366, 136 352, 162 360 C 200 346, 238 348, 254 360 C 248 370, 200 372, 158 380 C 138 392, 126 394, 122 384 Z';
  var lungRU = 'M 112 262 C 100 286, 106 322, 136 334 C 158 324, 170 292, 162 266 C 148 252, 124 252, 112 262 Z';
  var lungRL = 'M 114 328 C 104 352, 118 378, 152 374 C 170 364, 168 338, 146 326 C 132 320, 120 320, 114 328 Z';
  var lungLU = 'M 196 260 C 188 284, 198 318, 224 328 C 246 316, 252 286, 242 264 C 228 252, 206 252, 196 260 Z';
  var lungLL = 'M 200 322 C 192 346, 208 368, 236 362 C 252 350, 248 328, 226 318 C 214 312, 204 314, 200 322 Z';
  var uterusD = 'M 176 500 C 156 506, 152 526, 162 542 C 170 554, 182 554, 190 542 C 200 526, 196 506, 176 500 Z';
  var thymusD = 'M 156 252 C 148 268, 158 286, 176 280 C 194 286, 204 268, 196 252 C 186 258, 166 258, 156 252 Z';
  var thyroidD = 'M 158 184 C 146 194, 150 214, 168 216 C 174 208, 174 202, 176 206 C 178 202, 178 208, 184 216 C 202 214, 206 194, 194 184 C 184 192, 180 196, 176 196 C 172 196, 168 192, 158 184 Z';
  var headBrainD = 'M 150 56 C 136 74, 140 100, 162 114 C 186 122, 210 108, 216 84 C 214 60, 190 44, 166 46 C 156 48, 150 50, 150 56 Z';
  var breastLD = 'M 128 292 C 114 300, 116 320, 136 324 C 154 320, 158 302, 146 292 C 138 284, 132 286, 128 292 Z';
  var breastRD = 'M 224 292 C 210 300, 214 320, 234 324 C 252 320, 256 302, 244 292 C 236 284, 228 286, 224 292 Z';
  var ovaryLD = 'M 118 478 C 112 492, 118 510, 132 512 C 144 506, 146 490, 136 478 C 128 470, 122 472, 118 478 Z';
  var ovaryRD = 'M 234 478 C 228 492, 234 510, 248 512 C 260 506, 262 490, 252 478 C 244 470, 238 472, 234 478 Z';
  var scrotumD = 'M 160 594 C 154 612, 164 630, 176 632 C 188 630, 198 612, 192 594 C 184 582, 168 582, 160 594 Z';

  var IX = 456, IY = 176, IR = 98;
  var insetBrainD = 'M 396 164 C 388 138, 408 108, 448 98 C 492 90, 526 114, 532 150 C 534 176, 508 196, 476 188 C 458 206, 424 200, 404 176 C 394 168, 394 166, 396 164 Z';
  var insetWhite = 'M 412 158 C 406 140, 422 118, 452 112 C 486 106, 512 124, 516 150 C 512 164, 488 172, 464 162 C 446 174, 424 166, 414 152 C 410 148, 410 154, 412 158 Z';
  var insetCall = 'M 420 152 C 414 136, 430 122, 456 118 C 484 116, 504 128, 506 144 C 496 134, 470 128, 446 134 C 428 140, 422 148, 420 152 Z';
  var insetCere = 'M 496 172 C 514 164, 534 178, 536 204 C 524 220, 500 216, 492 196 C 488 184, 490 176, 496 172 Z';
  var insetHypo = 'M 438 160 L 410 166 C 402 178, 406 192, 426 196 L 446 184 C 450 172, 446 162, 438 160 Z';
  var insetPit = 'M 414 206 C 402 210, 402 224, 418 228 C 434 232, 446 222, 440 210 C 432 202, 422 202, 414 206 Z';
  var insetPine = 'M 476 128 C 472 142, 486 154, 502 146 C 510 136, 500 122, 486 122 C 478 124, 476 126, 476 128 Z';

  var headInset = [
    '<path class="ax-deco" pointer-events="none" fill="none" stroke="var(--text-mute,#6b7280)" stroke-width="1.3" stroke-dasharray="5 5" d="M 230 108 C 310 86, 360 124, ' + (IX - IR + 2) + ' ' + (IY - 6) + '"/>',
    '<circle cx="' + IX + '" cy="' + IY + '" r="' + IR + '" fill="var(--bg-card,#fff)" stroke="var(--text-mute,#6b7280)" stroke-width="1.4"/>',
    '<text x="' + IX + '" y="64" text-anchor="middle" fill="var(--text-mute,#6b7280)" font-size="15" font-weight="600">머리 확대</text>',
    g({ 'class': 'ax-inset', 'pointer-events': 'none' },
      '<path fill="#d9a28e" d="' + insetBrainD + '"/>' +
      '<path fill="#f7f3ee" d="' + insetWhite + '"/>' +
      '<path fill="#fbf7ef" d="' + insetCall + '"/>' +
      '<path fill="#e4c27a" d="' + insetCere + '"/>' +
      '<path fill="none" stroke="#8a6230" stroke-width="1.2" stroke-opacity="0.6" d="M 500 190 C 512 184, 522 196, 520 208"/>'
    ),
    part('hypothalamus', '#d4537e', '0.96', spot(insetHypo) + hit(428, 172, 15)),
    part('pineal', '#d4a017', '0.97', spot(insetPine) + hit(492, 140, 14)),
    part('pituitary', '#c42d66', '0.97',
      '<path d="M 430 194 C 424 202, 418 210, 420 216" fill="none" stroke="#c42d66" stroke-width="5" stroke-linecap="round"/>' +
      spot(insetPit) +
      '<ellipse cx="422" cy="216" rx="5" ry="7" fill="#9a2048"/>' +
      hit(416, 214, 15)
    )
  ].join('');

  var gutSquig = '<path d="M 162 452 C 176 442, 188 458, 176 470 C 164 482, 158 468, 168 458"/>' +
    '<path d="M 174 460 C 190 450, 204 468, 190 482 C 176 494, 166 478, 178 466"/>' +
    '<path d="M 168 478 C 184 470, 198 486, 184 498"/>';

  var body = [
    g({ 'class': 'ax-body' }, '<path d="' + bodyD(bodyLine) + '"/>'),
    target('bone', 'none', '1', ribs(), { cls: 'ax-bone' }),
    target('muscle', '#e7b1a8', '0.45',
      ell(46, 334, 9, 34, 'ax-spot') + ell(306, 334, 9, 34, 'ax-spot') +
      ell(127, 658, 26, 66, 'ax-spot') + ell(225, 658, 26, 66, 'ax-spot')
    ),
    g({
      'class': 'ax-deco', 'pointer-events': 'none',
      fill: '#d4aeb2', 'fill-opacity': '0.4', stroke: '#b89096', 'stroke-width': '1.25', 'stroke-opacity': '0.85'
    }, P(lungRU) + P(lungRL) + P(lungLU) + P(lungLL) +
      '<path fill="none" stroke="#a07880" stroke-width="1.2" d="M 118 330 C 140 322, 160 330, 166 338"/>' +
      '<path fill="none" stroke="#a07880" stroke-width="1.2" d="M 202 322 C 220 316, 240 324, 246 334"/>'),
    target('liver', '#c47272', '0.62', spot(liverD)),
    target('gut', '#e0a07a', '0.78',
      spot(stomachD) +
      spot(massD) +
      '<path class="ax-spot" fill-rule="evenodd" d="' + colonD + '"/>' +
      deco(gutSquig, '#a86848', 1.7, 0.6)
    ),
    target('heart', '#d25d5d', '0.78', '<g transform="translate(207 352) scale(0.68) translate(-207 -352)">' + spot(heartD) + '</g>'),
    target('kidney', '#c98478', '0.78', spot(kidneyLD) + spot(kidneyRD)),
    part('pancreas', '#e3a31a', '0.96', spot(pancreasD)),
    part('adrenal', '#e07c32', '0.97', spot(adrenalLD) + spot(adrenalRD) + hit(144, 456, 14) + hit(230, 442, 14)),
    target('breast', '#f0b7c4', '0.88',
      spot(breastLD) + spot(breastRD) +
      '<circle cx="136" cy="308" r="3.2" fill="#d4899e"/>' +
      '<circle cx="232" cy="308" r="3.2" fill="#d4899e"/>',
      { sex: 'f' }
    ),
    target('uterus', '#e7a0b8', '0.86', spot(uterusD) + deco(
      '<path d="M 162 508 C 140 496, 124 492, 116 482"/>' +
      '<path d="M 190 508 C 212 496, 228 492, 236 482"/>',
      '#d4899e', 1.7, 0.8
    ), { sex: 'f' }),
    part('ovary', '#d4537e', '0.96', spot(ovaryLD) + spot(ovaryRD) + hit(130, 494, 14) + hit(246, 494, 14), { sex: 'f' }),
    part('testis', '#c4622d', '0.96',
      spot(scrotumD) +
      '<ellipse class="ax-spot" cx="168" cy="610" rx="8" ry="11" fill="#b85628"/>' +
      '<ellipse class="ax-spot" cx="184" cy="610" rx="8" ry="11" fill="#b85628"/>' +
      hit(176, 612, 16),
      { sex: 'm' }
    ),
    target('brain', '#e7b0bc', '0.9', spot(headBrainD) +
      deco('<path d="M 176 52 C 176 80, 176 96, 176 112" fill="none"/>', '#c48898', 1.2, 0.4)),
    part('thymus', '#e98aa0', '0.9', spot(thymusD)),
    part('thyroid', '#e15b48', '0.95', spot(thyroidD)),
    part('parathyroid', '#f0a030', '0.98',
      ell(154, 192, 5.5, 5, 'ax-spot') + ell(162, 208, 5, 4.5, 'ax-spot') +
      ell(190, 208, 5, 4.5, 'ax-spot') + ell(198, 192, 5.5, 5, 'ax-spot') +
      hit(154, 192, 12) + hit(162, 208, 12) + hit(190, 208, 12) + hit(198, 192, 12)
    ),
    g({ 'class': 'ax-all', 'pointer-events': 'none' },
      '<circle class="ax-all-pt" cx="176" cy="80" r="3" opacity="0"/>' +
      '<circle class="ax-all-pt" cx="176" cy="330" r="3" opacity="0"/>' +
      '<circle class="ax-all-pt" cx="176" cy="470" r="3" opacity="0"/>' +
      '<circle class="ax-all-pt" cx="46" cy="334" r="3" opacity="0"/>' +
      '<circle class="ax-all-pt" cx="127" cy="658" r="3" opacity="0"/>'
    ),
    headInset
  ].join('');

  window.ANATOMY_ART = {
    viewBox: {
      brainSide: '0 0 800 580',
      brainMid: '0 0 800 580',
      body: '0 0 560 940'
    },
    brainSide: brainSide,
    brainMid: brainMid,
    body: body,
    headInset: headInset
  };
})();
