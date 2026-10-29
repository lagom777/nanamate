/* 수소 원자의 에너지 준위와 선 스펙트럼 (보어 모형).
 * 컨트롤: ni, nf (1~6), show (one | lyman | balmer | paschen).
 * E_n = −13.6/n² eV. 세로 위치는 eV에 비례 (0 eV → y=40, −13.6 eV → y=330, 290/13.6 단위/eV).
 * λ(nm) = 1240/ΔE(eV). 아래 띠의 가로축은 90~2000 nm 로그 눈금.
 * update 없이 render 와 readout 만 둔다.
 */
(function (NMFIG) {
  'use strict';

  var E_RY = 13.6;
  var Y_TOP = 40;
  var Y_BOT = 330;
  var Y_SPAN = Y_BOT - Y_TOP;

  var AXIS_X = 48;
  var LINE_X1 = 80;
  var LINE_X2 = 224;
  var N_X = 250;
  var E_X = 284;
  var BR_X = 64;
  var ARROW_X = 112;
  var DE_X = 128;

  var LEG_X = 358;
  var LEG_W = 190;

  var SP_X0 = 32;
  var SP_X1 = 528;
  var SP_NM0 = 90;
  var SP_NM1 = 2000;
  var LN0 = Math.log(SP_NM0);
  var LN1 = Math.log(SP_NM1);

  var INK = 'var(--fgx-ink, #1a1f2e)';
  var DIM = 'var(--fgx-dim, #4a5468)';
  var LINE = 'var(--fgx-line, rgba(0,0,0,.18))';
  var CARD = 'var(--fgx-card, #fff)';
  var ELEV = 'var(--fgx-elev, #f5f7fa)';
  var C1 = 'var(--fgx-c1, #2563eb)';
  var C2 = 'var(--fgx-c2, #dc2626)';
  var C3 = 'var(--fgx-c3, #d97706)';
  var C4 = 'var(--fgx-c4, #16a34a)';
  var C5 = 'var(--fgx-c5, #7c3aed)';
  var C6 = 'var(--fgx-c6, #0891b2)';
  var C1S = 'var(--fgx-c1-soft, #d3e0fb)';
  var C2S = 'var(--fgx-c2-soft, #f7d4d4)';
  var C3S = 'var(--fgx-c3-soft, #f8e6c8)';
  var C4S = 'var(--fgx-c4-soft, #d4edda)';
  var C5S = 'var(--fgx-c5-soft, #e4d8fb)';
  var C6S = 'var(--fgx-c6-soft, #d0eef4)';
  var C8 = 'var(--fgx-c8, #65748b)';

  var UV = '#8b7fb0';
  var IR = '#7a2e2e';

  /* 380~750 nm 앵커. 410·434·486·656 은 대표 색에 맞춘다. */
  var STOPS = [
    [380, 91, 33, 182],
    [410, 124, 58, 237],
    [434, 59, 75, 216],
    [486, 8, 145, 178],
    [530, 22, 163, 74],
    [570, 202, 138, 4],
    [610, 234, 88, 12],
    [656, 225, 29, 29],
    [750, 185, 28, 28]
  ];

  /* 겹치는 위 준위 라벨만 아래로 벌린 세로 중심. */
  var LABEL_Y = { inf: 46, 6: 66, 5: 86, 4: 106, 3: 126, 2: 146, 1: 330 };

  function r1(v) {
    return (Math.round(v * 10) / 10).toFixed(1);
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function energy(n) {
    return -E_RY / (n * n);
  }

  function yOfN(n) {
    return Y_TOP + Y_SPAN / (n * n);
  }

  function xNm(nm) {
    var t = (Math.log(nm) - LN0) / (LN1 - LN0);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    return SP_X0 + t * (SP_X1 - SP_X0);
  }

  function hex2(n) {
    var s = n.toString(16);
    return s.length < 2 ? '0' + s : s;
  }

  function lambdaColor(nm) {
    var i, a, b, t, r, g, bl;
    if (nm < 380) return UV;
    if (nm > 750) return IR;
    for (i = 0; i < STOPS.length; i++) {
      if (STOPS[i][0] > 380 && STOPS[i][0] < 750 && Math.abs(nm - STOPS[i][0]) <= 1.25) {
        return '#' + hex2(STOPS[i][1]) + hex2(STOPS[i][2]) + hex2(STOPS[i][3]);
      }
    }
    for (i = 0; i < STOPS.length - 1; i++) {
      a = STOPS[i];
      b = STOPS[i + 1];
      if (nm >= a[0] && nm <= b[0]) {
        t = (nm - a[0]) / (b[0] - a[0]);
        r = Math.round(a[1] + (b[1] - a[1]) * t);
        g = Math.round(a[2] + (b[2] - a[2]) * t);
        bl = Math.round(a[3] + (b[3] - a[3]) * t);
        return '#' + hex2(r) + hex2(g) + hex2(bl);
      }
    }
    return '#e11d1d';
  }

  function fmtDE(de) {
    var d = de >= 10 ? 1 : (de >= 1 ? 2 : 3);
    var shown = Number(de.toFixed(d));
    if (d < 3 && Math.abs(1240 / shown - 1240 / de) >= 1) d = 3;
    return de.toFixed(d);
  }

  function fmtNm(nm) {
    var s;
    if (nm < 200) {
      s = nm.toFixed(1);
      return s.replace(/\.0$/, '');
    }
    return String(Math.round(nm));
  }

  function fmtE(n) {
    if (n === 1) return '−13.6';
    return '−' + Math.abs(energy(n)).toFixed(2);
  }

  function hueName(nm) {
    if (nm < 425) return '보라';
    if (nm < 450) return '남색';
    if (nm < 495) return '청록';
    if (nm < 570) return '초록';
    if (nm < 590) return '노랑';
    if (nm < 630) return '주황';
    return '붉은색';
  }

  function regionPhrase(nm) {
    if (nm < 380) return '자외선';
    if (nm > 750) return '적외선';
    return '가시광선(' + hueName(nm) + ')';
  }

  function seriesKey(lo) {
    if (lo === 1) return 'lyman';
    if (lo === 2) return 'balmer';
    if (lo === 3) return 'paschen';
    return '';
  }

  function seriesName(lo) {
    if (lo === 1) return '라이먼 계열';
    if (lo === 2) return '발머 계열';
    if (lo === 3) return '파셴 계열';
    return '';
  }

  function norm(v) {
    v = v || {};
    var ni = Math.round(Number(v.ni));
    var nf = Math.round(Number(v.nf));
    var show = v.show;
    if (!(ni >= 1 && ni <= 6)) ni = 3;
    if (!(nf >= 1 && nf <= 6)) nf = 2;
    if (show !== 'one' && show !== 'lyman' && show !== 'balmer' && show !== 'paschen') show = 'one';
    return { ni: ni, nf: nf, show: show };
  }

  function makeTrans(ni, nf) {
    var de = Math.abs(energy(ni) - energy(nf));
    var nm = de > 0 ? 1240 / de : 0;
    var lo = ni < nf ? ni : nf;
    var hi = ni > nf ? ni : nf;
    return {
      ni: ni,
      nf: nf,
      de: de,
      nm: nm,
      emit: ni > nf,
      lo: lo,
      hi: hi,
      color: lambdaColor(nm),
      dash: nm < 380 || nm > 750,
      region: regionPhrase(nm),
      hue: nm >= 380 && nm <= 750 ? hueName(nm) : '',
      series: seriesName(lo),
      seriesKey: seriesKey(lo),
      deText: fmtDE(de),
      nmText: fmtNm(nm),
      eNi: fmtE(ni),
      eNf: fmtE(nf)
    };
  }

  function seriesTerminal(show) {
    if (show === 'lyman') return 1;
    if (show === 'balmer') return 2;
    if (show === 'paschen') return 3;
    return 0;
  }

  function transitionList(s) {
    var m = seriesTerminal(s.show);
    var list = [];
    var n;
    if (m) {
      for (n = m + 1; n <= 6; n++) list.push(makeTrans(n, m));
      return list;
    }
    if (s.ni === s.nf) return [];
    return [makeTrans(s.ni, s.nf)];
  }

  function readoutOf(s) {
    var m = seriesTerminal(s.show);
    var list, i, bits, name;
    if (m) {
      list = transitionList(s);
      bits = [];
      for (i = 0; i < list.length; i++) bits.push(list[i].nmText);
      name = m === 1 ? '라이먼' : (m === 2 ? '발머' : '파셴');
      return name + ' 계열 (n → ' + m + '): ' + bits.join(', ') + ' nm …';
    }
    if (s.ni === s.nf) return '전이 없음 — 시작과 나중 준위를 다르게 고르세요';
    var t = makeTrans(s.ni, s.nf);
    var line1 = t.ni + ' → ' + t.nf + ' (' + (t.emit ? '방출' : '흡수') + ')  ΔE = |' +
      t.eNi + ' − (' + t.eNf + ')| = ' + t.deText + ' eV';
    if (!t.emit) return line1 + '\n정확히 ' + t.deText + ' eV 의 광자만 흡수';
    var line2 = 'λ ≈ 1240 / ' + t.deText + ' ≈ ' + t.nmText + ' nm  →  ' + t.region;
    if (t.series) line2 += ' · ' + t.series;
    return line1 + '\n' + line2;
  }

  function calc(v) {
    var s = norm(v);
    return {
      ni: s.ni,
      nf: s.nf,
      show: s.show,
      transitions: transitionList(s),
      readout: readoutOf(s)
    };
  }

  function T(x, y, str, size, opt) {
    opt = opt || {};
    var fill = opt.fill || INK;
    var weight = opt.bold ? ' font-weight="700"' : '';
    var base = opt.base ? ' dominant-baseline="' + opt.base + '"' : '';
    var cls = opt.cls ? ' class="' + opt.cls + '"' : '';
    var anchor = opt.anchor ? ' text-anchor="' + opt.anchor + '"' : '';
    var extra = opt.extra || '';
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" font-size="' + size + '" fill="' + fill + '"' +
      weight + base + anchor + cls + extra + '>' + esc(str) + '</text>';
  }

  function hit(x, y, w, h) {
    return '<rect class="fgx-hit" x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) +
      '" height="' + r1(h) + '" fill="transparent" style="pointer-events:all"/>';
  }

  function styleBlock() {
    return '<style>' +
      '.fgx-fig-hlevel text{font-family:inherit}' +
      '.fgx-fig-hlevel .fgx-halo{paint-order:stroke;stroke:#fff;stroke-width:3px;stroke-linejoin:round}' +
      '.fgx-fig-hlevel .fgx-hit{pointer-events:all}' +
      '</style>';
  }

  function defsBlock() {
    var x0 = xNm(380);
    var x1 = xNm(750);
    var stops = '';
    var i, nm, rgb, t;
    for (i = 0; i < STOPS.length; i++) {
      nm = STOPS[i][0];
      rgb = '#' + hex2(STOPS[i][1]) + hex2(STOPS[i][2]) + hex2(STOPS[i][3]);
      t = ((nm - 380) / (750 - 380) * 100).toFixed(1);
      stops += '<stop offset="' + t + '%" stop-color="' + rgb + '"/>';
    }
    return '<defs>' +
      '<linearGradient id="hlevel-rainbow" gradientUnits="userSpaceOnUse" x1="' + r1(x0) +
      '" y1="0" x2="' + r1(x1) + '" y2="0">' + stops + '</linearGradient>' +
      '<clipPath id="hlevel-band"><rect x="' + SP_X0 + '" y="400" width="' + (SP_X1 - SP_X0) +
      '" height="18" rx="6"/></clipPath>' +
      '</defs>';
  }

  function titleChip() {
    var x = 158;
    var y = 3;
    var w = 244;
    var h = 26;
    return '<g data-part="bohr">' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + C1S + '" stroke="' + C1 + '" stroke-width="1.5"/>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + h / 2) + '" font-size="16" fill="' + INK + '" text-anchor="middle" dominant-baseline="middle">' +
      '<tspan font-weight="700">보어 모형</tspan>' +
      '<tspan font-weight="400">  Eₙ = −13.6 / n² eV</tspan>' +
      '</text></g>';
  }

  function lineEls(fromN, toN) {
    var out = '';
    var n, y, color, sw;
    for (n = fromN; n <= toN; n++) {
      y = yOfN(n);
      color = n === 1 ? C4 : C1;
      sw = n === 1 ? 4 : 3.5;
      out += '<line x1="' + LINE_X1 + '" y1="' + r1(y) + '" x2="' + LINE_X2 + '" y2="' + r1(y) +
        '" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round"/>';
    }
    return out;
  }

  function axisAndLevels() {
    var ticks = [0, -3.4, -E_RY];
    var tickText = ['0', '−3.4', '−13.6'];
    var out = '';
    var i, e, y, n;
    out += '<line x1="' + AXIS_X + '" y1="' + Y_TOP + '" x2="' + AXIS_X + '" y2="' + Y_BOT +
      '" stroke="' + DIM + '" stroke-width="1.5" stroke-linecap="round"/>';
    for (i = 0; i < ticks.length; i++) {
      e = ticks[i];
      y = Y_TOP + (0 - e) * (Y_SPAN / E_RY);
      out += '<line x1="' + (AXIS_X - 5) + '" y1="' + r1(y) + '" x2="' + AXIS_X + '" y2="' + r1(y) +
        '" stroke="' + DIM + '" stroke-width="1.5" stroke-linecap="round"/>';
      out += T(AXIS_X - 8, y, tickText[i], 14, { anchor: 'end', base: 'middle', fill: DIM, cls: 'fgx-halo' });
    }
    for (n = 2; n <= 6; n++) {
      y = yOfN(n);
      out += '<line x1="' + (AXIS_X - 3) + '" y1="' + r1(y) + '" x2="' + AXIS_X + '" y2="' + r1(y) +
        '" stroke="' + C8 + '" stroke-width="1.25" stroke-linecap="round"/>';
    }
    out += T(16, 188, '에너지 (eV)', 15, {
      anchor: 'middle',
      fill: DIM,
      extra: ' transform="rotate(-90 16 188)"'
    });
    out += lineEls(1, 6);
    out += hit(LINE_X1, 150, LINE_X2 - LINE_X1, 160);
    out += hit(4, 150, 40, 80);
    return '<g data-part="level">' + out + '</g>';
  }

  function ionization() {
    var y = Y_TOP;
    var ly = LABEL_Y.inf;
    var d = 'M' + LINE_X2 + ' ' + r1(y) + ' L' + (LINE_X2 + 10) + ' ' + r1(y) +
      ' L' + (LINE_X2 + 10) + ' ' + r1(ly) + ' L' + (N_X - 4) + ' ' + r1(ly);
    return '<g data-part="ionization">' +
      '<line x1="' + LINE_X1 + '" y1="' + y + '" x2="' + LINE_X2 + '" y2="' + y +
      '" stroke="' + C8 + '" stroke-width="2.25" stroke-dasharray="6 4" stroke-linecap="round"/>' +
      '<path d="' + d + '" fill="none" stroke="' + C8 + '" stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round"/>' +
      hit(LINE_X1, y - 9, LINE_X2 - LINE_X1, 18) +
      T(N_X, ly, 'n=∞', 15, { base: 'middle', bold: true, cls: 'fgx-halo' }) +
      T(E_X, ly, '0 eV', 15, { base: 'middle', fill: DIM, cls: 'fgx-halo' }) +
      hit(N_X - 4, ly - 11, 92, 22) +
      '</g>';
  }

  function leader(yLine, yLab, rail) {
    if (Math.abs(yLine - yLab) < 2.5) {
      return '<line x1="' + LINE_X2 + '" y1="' + r1(yLine) + '" x2="' + (N_X - 4) + '" y2="' + r1(yLab) +
        '" stroke="' + C8 + '" stroke-width="1.25" stroke-linecap="round"/>';
    }
    return '<polyline points="' + LINE_X2 + ',' + r1(yLine) + ' ' + rail + ',' + r1(yLine) + ' ' +
      rail + ',' + r1(yLab) + ' ' + (N_X - 4) + ',' + r1(yLab) +
      '" fill="none" stroke="' + C8 + '" stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round"/>';
  }

  function quantumLabels() {
    var out = '';
    var ns = [1, 2, 3, 4, 5, 6];
    var i, n, y;
    for (i = 0; i < ns.length; i++) {
      n = ns[i];
      y = LABEL_Y[n];
      out += T(N_X, y, 'n=' + n, 15, { base: 'middle', bold: true, cls: 'fgx-halo' });
      out += hit(N_X - 3, y - 11, 34, 22);
    }
    return '<g data-part="quantum_n">' + out + '</g>';
  }

  function stateLabels() {
    var excited = '';
    var ground = '';
    var n, yLine, yLab, rail;
    var rails = { 6: 230, 5: 234, 4: 238, 3: 242, 2: 246 };
    for (n = 2; n <= 6; n++) {
      yLine = yOfN(n);
      yLab = LABEL_Y[n];
      rail = rails[n];
      excited += leader(yLine, yLab, rail);
      excited += '<circle cx="' + LINE_X2 + '" cy="' + r1(yLine) + '" r="2.6" fill="' + C1 + '"/>';
      excited += T(E_X, yLab, fmtE(n) + ' eV', 15, { base: 'middle', fill: DIM, cls: 'fgx-halo' });
      excited += hit(E_X - 2, yLab - 11, 68, 22);
      excited += hit(LINE_X1, yLine - 9, LINE_X2 - LINE_X1, 18);
      excited += '<line x1="' + LINE_X1 + '" y1="' + r1(yLine) + '" x2="' + LINE_X2 + '" y2="' + r1(yLine) +
        '" stroke="' + C1 + '" stroke-width="3.5" stroke-linecap="round"/>';
    }
    yLine = yOfN(1);
    yLab = LABEL_Y[1];
    ground += leader(yLine, yLab, LINE_X2 + 8);
    ground += '<circle cx="' + LINE_X2 + '" cy="' + r1(yLine) + '" r="2.8" fill="' + C4 + '"/>';
    ground += T(E_X, yLab, fmtE(1) + ' eV', 15, { base: 'middle', fill: DIM, cls: 'fgx-halo' });
    ground += hit(E_X - 2, yLab - 11, 68, 22);
    ground += hit(LINE_X1, yLine - 10, LINE_X2 - LINE_X1, 20);
    ground += '<line x1="' + LINE_X1 + '" y1="' + r1(yLine) + '" x2="' + LINE_X2 + '" y2="' + r1(yLine) +
      '" stroke="' + C4 + '" stroke-width="4" stroke-linecap="round"/>';
    return '<g data-part="excited">' + excited + '</g>' +
      '<g data-part="ground">' + ground + '</g>';
  }

  function levelYs() {
    return [Y_TOP, yOfN(6), yOfN(5), yOfN(4), yOfN(3), yOfN(2), yOfN(1)];
  }

  function clearY(prefer, minY, maxY, rad) {
    var ys = levelYs();
    var best = null;
    var bestD = 1e9;
    var y, i, ok, d;
    if (maxY < minY) return null;
    for (y = minY; y <= maxY; y += 1) {
      ok = true;
      for (i = 0; i < ys.length; i++) {
        if (Math.abs(ys[i] - y) < rad) ok = false;
      }
      if (!ok) continue;
      d = Math.abs(y - prefer);
      if (d < bestD) {
        bestD = d;
        best = y;
      }
    }
    return best;
  }

  function nearOtherLevel(y, rad, skip1, skip2) {
    var ys = levelYs();
    var i;
    for (i = 0; i < ys.length; i++) {
      if (Math.abs(ys[i] - skip1) < 0.8) continue;
      if (Math.abs(ys[i] - skip2) < 0.8) continue;
      if (Math.abs(ys[i] - y) < rad) return true;
    }
    return false;
  }

  /* 광자는 시작 준위 바로 위, ΔE 글자는 두 준위 사이. 간격이 좁으면 빈 영역으로 내린다. */
  function placeCallout(top, bot) {
    var gap = bot - top;
    var labelY, photonY, cands, i;
    if (gap < 36) return { inside: false, photonIn: false, photonY: 158, labelY: 186 };
    labelY = top + gap * 0.62;
    if (labelY < top + 16) labelY = top + 16;
    if (labelY > bot - 13) labelY = bot - 13;
    cands = [top - 8, top + 10, bot + 14];
    for (i = 0; i < cands.length; i++) {
      photonY = cands[i];
      if (photonY < 44 || photonY > 316) continue;
      if (Math.abs(photonY - labelY) < 18) continue;
      if (nearOtherLevel(photonY, 5, top, bot)) continue;
      return { inside: true, photonIn: true, photonY: photonY, labelY: labelY };
    }
    return { inside: true, photonIn: false, photonY: 158, labelY: labelY };
  }

  function wavePath(x0, x1, y, amp, waves) {
    var span = x1 - x0;
    var steps = Math.max(8, waves * 12);
    var i, x, yy, d;
    d = 'M' + r1(x0) + ' ' + r1(y);
    for (i = 1; i <= steps; i++) {
      x = x0 + span * i / steps;
      yy = y + Math.sin(i / steps * waves * Math.PI * 2) * amp;
      d += 'L' + r1(x) + ' ' + r1(yy);
    }
    return d;
  }

  function headH(x, y, dir, color) {
    var base = dir < 0 ? x + 7 : x - 7;
    return '<polygon points="' + r1(x) + ',' + r1(y) + ' ' + r1(base) + ',' + r1(y - 3.4) + ' ' +
      r1(base) + ',' + r1(y + 3.4) + '" fill="' + color + '"/>';
  }

  function headV(x, y, dir, color, s) {
    var w = s * 0.62;
    var base = dir < 0 ? y - s : y + s;
    return '<polygon points="' + r1(x) + ',' + r1(y) + ' ' + r1(x - w) + ',' + r1(base) + ' ' +
      r1(x + w) + ',' + r1(base) + '" fill="' + color + '"/>';
  }

  function photonMark(x0, x1, y, color, dash, dir, amp) {
    var pathEnd = dir < 0 ? x0 + 7 : x1 - 7;
    var pathStart = dir < 0 ? x1 : x0;
    var d = wavePath(pathStart, pathEnd, y, amp || 2.2, 2);
    var dashAttr = dash ? ' stroke-dasharray="5 3"' : '';
    var hx = dir < 0 ? x0 : x1;
    var left = Math.min(x0, x1);
    var width = Math.abs(x1 - x0);
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"' + dashAttr + '/>' +
      headH(hx, y, dir, color) +
      hit(left, y - 10, Math.max(16, width), 20);
  }

  function bracket(yA, yB) {
    var top = Math.min(yA, yB);
    var bot = Math.max(yA, yB);
    var x = BR_X;
    return '<line x1="' + (x - 7) + '" y1="' + r1(top) + '" x2="' + (x + 7) + '" y2="' + r1(top) +
      '" stroke="' + C3 + '" stroke-width="2" stroke-linecap="round"/>' +
      '<line x1="' + (x - 7) + '" y1="' + r1(bot) + '" x2="' + (x + 7) + '" y2="' + r1(bot) +
      '" stroke="' + C3 + '" stroke-width="2" stroke-linecap="round"/>' +
      '<line x1="' + x + '" y1="' + r1(top) + '" x2="' + x + '" y2="' + r1(bot) +
      '" stroke="' + C3 + '" stroke-width="2" stroke-linecap="round"/>' +
      hit(x - 10, top, 20, Math.max(16, bot - top));
  }

  function vArrow(x, yA, yB, color, dash) {
    var down = yB > yA;
    var top = Math.min(yA, yB);
    var bot = Math.max(yA, yB);
    var dy = bot - top;
    var hs = dy >= 22 ? 9 : Math.max(4, dy * 0.62);
    var yTip, yLine, dir;
    var dashAttr = dash ? ' stroke-dasharray="5 3.5"' : '';
    if (down) {
      yTip = bot;
      yLine = top;
      dir = -1;
      if (dy > hs + 1) yTip = bot;
    } else {
      yTip = top;
      yLine = bot;
      dir = 1;
    }
    var yStop = down ? yTip - hs + 1 : yTip + hs - 1;
    var line = '';
    if (dy > hs + 0.5) {
      line = '<line x1="' + r1(x) + '" y1="' + r1(yLine) + '" x2="' + r1(x) + '" y2="' + r1(yStop) +
        '" stroke="' + color + '" stroke-width="3.5" stroke-linecap="round"' + dashAttr + '/>';
    }
    return line + headV(x, yTip, dir, color, hs) +
      hit(x - 9, top, 18, Math.max(16, dy));
  }

  function deLabel(x, y, text) {
    return T(x, y, text, 15, { base: 'middle', fill: C3, cls: 'fgx-halo', bold: true }) +
      hit(x - 2, y - 11, Math.max(16, text.length * 8), 22);
  }

  function noneChip() {
    var x = 96;
    var y = 188;
    var w = 108;
    var h = 32;
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + ELEV + '" stroke="' + C8 + '" stroke-width="1.5"/>' +
      T(x + w / 2, y + h / 2, '전이 없음', 16, { anchor: 'middle', base: 'middle', bold: true });
  }

  function oneTransition(t) {
    var yHi = yOfN(t.hi);
    var yLo = yOfN(t.lo);
    var top = Math.min(yHi, yLo);
    var bot = Math.max(yHi, yLo);
    var place = placeCallout(top, bot);
    var color = t.emit ? C2 : C1;
    var dir = t.emit ? 1 : -1;
    var label = 'ΔE = ' + t.deText + ' eV';
    var yFrom = t.emit ? yHi : yLo;
    var yTo = t.emit ? yLo : yHi;
    var px0, px1, lx, ly, midY, leaderD, out;
    out = '<g data-part="' + (t.emit ? 'emission' : 'absorption') + '">';
    out += vArrow(ARROW_X, yFrom, yTo, color, false);
    out += '</g>';
    out += '<g data-part="energy_gap">';
    out += bracket(yHi, yLo);
    if (place.inside) {
      lx = DE_X;
      ly = place.labelY;
      out += deLabel(lx, ly, label);
    } else {
      lx = N_X;
      ly = place.labelY;
      midY = (top + bot) / 2;
      leaderD = 'M' + (BR_X + 9) + ' ' + r1(midY) + ' L' + (BR_X + 20) + ' ' + r1(midY) +
        ' L' + (BR_X + 20) + ' ' + r1(ly) + ' L' + (lx - 6) + ' ' + r1(ly);
      out += '<path d="' + leaderD + '" fill="none" stroke="' + C3 + '" stroke-width="1.25" stroke-dasharray="4 3" stroke-linejoin="round" stroke-linecap="round"/>';
      out += deLabel(lx, ly, label);
    }
    out += '</g>';
    out += '<g data-part="photon">';
    if (place.photonIn) {
      px0 = DE_X;
      px1 = DE_X + 72;
      out += photonMark(px0, px1, place.photonY, t.color, t.dash, dir, 1.8);
    } else {
      out += photonMark(N_X, N_X + 72, place.photonY, t.color, t.dash, dir, 2.6);
    }
    out += '</g>';
    return out;
  }

  function seriesArrows(list) {
    var n = list.length;
    var x0 = 108;
    var x1 = 208;
    var xs = [];
    var i, x, t, yHi, yLo;
    var out = '<g data-part="emission">';
    for (i = 0; i < n; i++) {
      x = n === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * i / (n - 1);
      xs.push(x);
      t = list[i];
      yHi = yOfN(t.hi);
      yLo = yOfN(t.lo);
      out += vArrow(x, yHi, yLo, t.color, t.dash);
    }
    out += '</g>';
    return { svg: out, xs: xs };
  }

  function seriesGap(list) {
    var m = list[0].lo;
    var yA = yOfN(6);
    var yB = yOfN(m);
    var minDe = list[0].de;
    var maxDe = list[0].de;
    var i, ly, blocked, out;
    for (i = 1; i < list.length; i++) {
      if (list[i].de < minDe) minDe = list[i].de;
      if (list[i].de > maxDe) maxDe = list[i].de;
    }
    ly = 176;
    blocked = m === 1;
    out = bracket(yA, yB);
    if (!blocked) {
      out += '<path d="M' + BR_X + ' ' + r1(yB) + ' L' + BR_X + ' ' + r1(ly) + ' L' + (N_X - 6) + ' ' + r1(ly) +
        '" fill="none" stroke="' + C3 + '" stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round"/>';
    }
    out += deLabel(N_X, ly, fmtDE(minDe) + '–' + fmtDE(maxDe) + ' eV');
    return '<g data-part="energy_gap">' + out + '</g>';
  }

  function seriesPhoton(list) {
    var t = list[0];
    var y = 200;
    return '<g data-part="photon">' +
      photonMark(N_X, N_X + 74, y, t.color, t.dash, 1) +
      '</g>';
  }

  function transitions(s) {
    var list = transitionList(s);
    if (!list.length) return noneChip();
    if (s.show === 'one') return oneTransition(list[0]);
    var arrows = seriesArrows(list);
    return arrows.svg + seriesGap(list) + seriesPhoton(list);
  }

  function chip(part, x, y, w, h, label, on, stroke, fill) {
    return '<g data-part="' + part + '">' +
      '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(w) + '" height="' + r1(h) +
      '" rx="8" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + (on ? 2.5 : 1.5) + '"/>' +
      T(x + w / 2, y + h / 2, label, 15, { anchor: 'middle', base: 'middle', bold: on }) +
      '</g>';
  }

  function legend(s) {
    var active = '';
    var list = transitionList(s);
    var rows, i, on, stroke, fill, out, emitOn, absorbOn;
    if (s.show === 'one') {
      if (list.length) active = list[0].seriesKey;
    } else active = s.show;
    rows = [
      ['lyman', '라이먼 n→1 자외선', C5, C5S],
      ['balmer', '발머 n→2 가시광선', C6, C6S],
      ['paschen', '파셴 n→3 적외선', C3, C3S]
    ];
    out = '';
    for (i = 0; i < rows.length; i++) {
      on = active === rows[i][0];
      stroke = on ? rows[i][2] : LINE;
      fill = on ? rows[i][3] : CARD;
      out += chip(rows[i][0], LEG_X, 40 + i * 30, LEG_W, 26, rows[i][1], on, stroke, fill);
    }
    emitOn = (s.show !== 'one') || (list.length && list[0].emit);
    absorbOn = s.show === 'one' && list.length && !list[0].emit;
    out += chip('emission', LEG_X, 134, 92, 26, '방출 ↓', emitOn, emitOn ? C2 : LINE, emitOn ? C2S : CARD);
    out += chip('absorption', LEG_X + 98, 134, 92, 26, '흡수 ↑', absorbOn, absorbOn ? C1 : LINE, absorbOn ? C1S : CARD);
    return out;
  }

  function cardShell(accent) {
    return '<rect x="' + LEG_X + '" y="168" width="' + LEG_W + '" height="176" rx="12" fill="' + CARD + '" stroke="' + LINE + '" stroke-width="1.5"/>' +
      '<rect x="' + LEG_X + '" y="168" width="5" height="176" rx="2" fill="' + accent + '"/>';
  }

  function cardNone() {
    return cardShell(C8) +
      T(LEG_X + 16, 214, '전이 없음', 17, { bold: true }) +
      T(LEG_X + 16, 246, '시작과 나중 준위를', 15, { fill: DIM }) +
      T(LEG_X + 16, 268, '다르게 고르세요', 15, { fill: DIM });
  }

  function cardOne(t) {
    var accent = t.emit ? C2 : C1;
    var badge = t.emit ? '방출' : '흡수';
    var badgeFill = t.emit ? C2S : C1S;
    var left = LEG_X + 16;
    var right = LEG_X + LEG_W - 14;
    var out = cardShell(accent);
    out += T(left, 192, t.ni + ' → ' + t.nf, 18, { bold: true });
    out += '<rect x="' + (right - 46) + '" y="176" width="46" height="22" rx="6" fill="' + badgeFill + '"/>';
    out += T(right - 22, 188, badge, 15, { anchor: 'middle', base: 'middle', fill: accent, bold: true });
    out += T(left, 216, 'ΔE', 15, { fill: DIM });
    out += T(right, 216, t.deText + ' eV', 16, { anchor: 'end', bold: true });
    out += T(left, 238, 'λ = 1240 / ΔE', 15, { fill: DIM });
    out += T(left, 262, t.nmText + ' nm', 18, { bold: true });
    out += '<circle cx="' + (left + 7) + '" cy="290" r="7" fill="' + t.color + '" stroke="' + LINE + '" stroke-width="1"/>';
    out += T(left + 20, 290, t.region, 15, { base: 'middle' });
    if (t.series) out += T(left, 314, t.series, 15, { fill: DIM });
    else out += T(left, 314, t.emit ? '방출 전이' : '흡수 전이', 15, { fill: DIM });
    if (!t.emit) out += T(left, 334, '이 에너지의 광자만', 15, { fill: C1 });
    return out;
  }

  function cardSeries(s, list) {
    var m = seriesTerminal(s.show);
    var name = m === 1 ? '라이먼 계열' : (m === 2 ? '발머 계열' : '파셴 계열');
    var zone = m === 1 ? '자외선' : (m === 2 ? '가시광선' : '적외선');
    var accent = m === 1 ? C5 : (m === 2 ? C6 : C3);
    var left = LEG_X + 16;
    var out = cardShell(accent);
    var i, t, y;
    out += T(left, 190, name, 16, { bold: true });
    out += T(left, 210, 'n → ' + m + '  ·  ' + zone, 15, { fill: DIM });
    for (i = 0; i < list.length; i++) {
      t = list[i];
      y = 234 + i * 20;
      out += '<circle cx="' + (left + 6) + '" cy="' + y + '" r="5.5" fill="' + t.color + '"/>';
      out += T(left + 18, y, t.nmText + ' nm', 15, { base: 'middle' });
      out += T(LEG_X + LEG_W - 14, y, t.hue || (t.nm < 380 ? '자외선' : '적외선'), 15, {
        anchor: 'end',
        base: 'middle',
        fill: DIM
      });
    }
    return out;
  }

  function card(s) {
    var list = transitionList(s);
    if (!list.length) return cardNone();
    if (s.show === 'one') return cardOne(list[0]);
    return cardSeries(s, list);
  }

  function keepNmLabels(items) {
    var minIt = items[0];
    var maxIt = items[0];
    var i, it, kept, ok, j, need;
    for (i = 1; i < items.length; i++) {
      if (items[i].nm < minIt.nm) minIt = items[i];
      if (items[i].nm > maxIt.nm) maxIt = items[i];
    }
    function half(text) {
      return text.length * 4.6 + 2;
    }
    function boxOf(cx, text) {
      var h = half(text);
      return [cx - h, cx + h];
    }
    function hits(box) {
      var k, b;
      for (k = 0; k < kept.length; k++) {
        b = boxOf(kept[k].x, kept[k].text);
        if (box[0] < b[1] + 4 && box[1] > b[0] - 4) return true;
      }
      return box[0] < 26 || box[1] > 546;
    }
    var order = items.slice().sort(function (a, b) {
      var ae = (a === minIt || a === maxIt) ? 0 : 1;
      var be = (b === minIt || b === maxIt) ? 0 : 1;
      if (ae !== be) return ae - be;
      return b.nm - a.nm;
    });
    var shifts = [0, 10, -10, 16, -16, 22];
    kept = [];
    for (i = 0; i < order.length; i++) {
      it = order[i];
      ok = false;
      for (j = 0; j < shifts.length; j++) {
        need = it.x + shifts[j];
        if (it.nm < 180 && shifts[j] === 0) need = it.x + half(it.text) + 6;
        if (!hits(boxOf(need, it.text))) {
          kept.push({ x: need, text: it.text, nm: it.nm, off: it.off });
          ok = true;
          break;
        }
      }
    }
    return kept;
  }

  function spectrum(s) {
    var list = transitionList(s);
    var x380 = xNm(380);
    var x750 = xNm(750);
    var barY = 400;
    var barH = 18;
    var ticks = [100, 200, 400, 700, 1000, 2000];
    var out = '';
    var i, nm, x, t, items, kept, anchor, off;
    out += '<line x1="24" y1="352" x2="536" y2="352" stroke="' + LINE + '" stroke-width="1.25"/>';
    out += T((SP_X0 + x380) / 2, 366, '자외선', 15, { anchor: 'middle', base: 'middle', fill: DIM });
    out += T((x380 + x750) / 2, 366, '가시광선', 15, { anchor: 'middle', base: 'middle', bold: true });
    out += T((x750 + SP_X1) / 2, 366, '적외선', 15, { anchor: 'middle', base: 'middle', fill: DIM });
    out += '<rect x="' + SP_X0 + '" y="' + barY + '" width="' + (SP_X1 - SP_X0) + '" height="' + barH + '" rx="6" fill="' + ELEV + '"/>';
    out += '<g clip-path="url(#hlevel-band)">';
    out += '<rect x="' + r1(SP_X0) + '" y="' + barY + '" width="' + r1(x380 - SP_X0) + '" height="' + barH + '" fill="#e6e1f2"/>';
    out += '<rect x="' + r1(x380) + '" y="' + barY + '" width="' + r1(x750 - x380) + '" height="' + barH + '" fill="url(#hlevel-rainbow)"/>';
    out += '<rect x="' + r1(x750) + '" y="' + barY + '" width="' + r1(SP_X1 - x750) + '" height="' + barH + '" fill="#f3e4e2"/>';
    out += '</g>';
    out += '<rect x="' + SP_X0 + '" y="' + barY + '" width="' + (SP_X1 - SP_X0) + '" height="' + barH + '" rx="6" fill="none" stroke="' + LINE + '" stroke-width="1.25"/>';
    out += '<line x1="' + r1(x380) + '" y1="' + barY + '" x2="' + r1(x380) + '" y2="' + (barY + barH) + '" stroke="rgba(255,255,255,.85)" stroke-width="1.5"/>';
    out += '<line x1="' + r1(x750) + '" y1="' + barY + '" x2="' + r1(x750) + '" y2="' + (barY + barH) + '" stroke="rgba(255,255,255,.85)" stroke-width="1.5"/>';
    items = [];
    for (i = 0; i < list.length; i++) {
      t = list[i];
      off = t.nm < SP_NM0 || t.nm > SP_NM1;
      x = off ? (t.nm > SP_NM1 ? SP_X1 - 2 : SP_X0 + 2) : xNm(t.nm);
      out += '<line x1="' + r1(x) + '" y1="392" x2="' + r1(x) + '" y2="422" stroke="' + t.color + '" stroke-width="3" stroke-linecap="round"' +
        (t.dash ? ' stroke-dasharray="4 3"' : '') + '/>';
      items.push({ x: x, text: t.nmText, nm: t.nm, off: off });
    }
    if (items.length) {
      kept = keepNmLabels(items);
      for (i = 0; i < kept.length; i++) {
        anchor = 'middle';
        x = kept[i].x;
        if (kept[i].off && kept[i].nm > SP_NM1) {
          anchor = 'end';
          x = SP_X1;
        }
        if (anchor === 'middle') {
          if (x < SP_X0 + 16) x = SP_X0 + 16;
          if (x > SP_X1 - 18) {
            anchor = 'end';
            x = SP_X1;
          }
        }
        out += T(x, 390, kept[i].text, 15, { anchor: anchor, fill: INK, cls: 'fgx-halo' });
      }
    }
    out += '<line x1="' + SP_X0 + '" y1="424" x2="' + SP_X1 + '" y2="424" stroke="' + DIM + '" stroke-width="1.5" stroke-linecap="round"/>';
    for (i = 0; i < ticks.length; i++) {
      nm = ticks[i];
      x = xNm(nm);
      out += '<line x1="' + r1(x) + '" y1="424" x2="' + r1(x) + '" y2="430" stroke="' + DIM + '" stroke-width="1.5" stroke-linecap="round"/>';
      anchor = 'middle';
      if (i === ticks.length - 1) anchor = 'end';
      if (i === 0) anchor = 'start';
      out += T(x, 444, String(nm), 14, { anchor: anchor, fill: DIM });
    }
    out += hit(SP_X0, 360, SP_X1 - SP_X0, 86);
    return '<g data-part="spectrum">' + out + '</g>';
  }

  function render(v) {
    var s = norm(v);
    return [
      styleBlock(),
      defsBlock(),
      titleChip(),
      axisAndLevels(),
      ionization(),
      quantumLabels(),
      stateLabels(),
      transitions(s),
      legend(s),
      card(s),
      spectrum(s)
    ].join('');
  }

  NMFIG.define('hlevel', {
    viewBox: [560, 450],
    controls: [
      {
        id: 'ni',
        type: 'choice',
        label: '시작 준위 nᵢ',
        value: 3,
        options: [
          { v: 1, label: 'n=1' },
          { v: 2, label: 'n=2' },
          { v: 3, label: 'n=3' },
          { v: 4, label: 'n=4' },
          { v: 5, label: 'n=5' },
          { v: 6, label: 'n=6' }
        ]
      },
      {
        id: 'nf',
        type: 'choice',
        label: '나중 준위 n_f',
        value: 2,
        options: [
          { v: 1, label: 'n=1' },
          { v: 2, label: 'n=2' },
          { v: 3, label: 'n=3' },
          { v: 4, label: 'n=4' },
          { v: 5, label: 'n=5' },
          { v: 6, label: 'n=6' }
        ]
      },
      {
        id: 'show',
        type: 'choice',
        label: '보기',
        value: 'one',
        options: [
          { v: 'one', label: '선택한 전이만' },
          { v: 'lyman', label: '라이먼 계열' },
          { v: 'balmer', label: '발머 계열' },
          { v: 'paschen', label: '파셴 계열' }
        ]
      }
    ],
    render: function (v) {
      return render(v);
    },
    readout: function (v) {
      return readoutOf(norm(v));
    },
    _calc: function (v) {
      return calc(v);
    }
  });
})(window.NMFIG);
