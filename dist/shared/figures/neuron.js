/* 뉴런 구조 · 활동 전위 · 시냅스.
 * 컨트롤: pulse(흥분의 위치, 보기 structure), t(시간 ms, 보기 ap), s(전달 진행, 보기 synapse).
 * 활동 전위 V(t)는 명세의 (ms, mV) 매듭을 단조 3차(PCHIP)로 잇는다.
 * 도약 전도: 말이집 구간에서는 앞쪽 랑비에 결절로 불꽃을 붙인다. 마지막 말이집 뒤에는 결절이 없어 직전 결절에 둔다.
 * 이온·소포 위치는 슬라이더 값만으로 정한다(ctx.time 을 쓰지 않음).
 */
(function (NMFIG) {
  'use strict';

  var C1 = 'var(--fgx-c1, #2563eb)';
  var C1S = 'var(--fgx-c1-soft, #d8e3fb)';
  var C2 = 'var(--fgx-c2, #dc2626)';
  var C2S = 'var(--fgx-c2-soft, #f8d4d4)';
  var C3 = 'var(--fgx-c3, #d97706)';
  var C3S = 'var(--fgx-c3-soft, #f8e8c8)';
  var C4 = 'var(--fgx-c4, #16a34a)';
  var C4S = 'var(--fgx-c4-soft, #d4f0dc)';
  var C5 = 'var(--fgx-c5, #7c3aed)';
  var C5S = 'var(--fgx-c5-soft, #e6d8fb)';
  var C6 = 'var(--fgx-c6, #0891b2)';
  var C6S = 'var(--fgx-c6-soft, #d0eef5)';
  var C8 = 'var(--fgx-c8, #65748b)';
  var INK = 'var(--fgx-ink, #1a1f2e)';
  var DIM = 'var(--fgx-dim, #4a5468)';
  var LINE = 'var(--fgx-line, #d5d8de)';
  var CARD = 'var(--fgx-card, #fff)';
  var ELEV = 'var(--fgx-elev, #f5f7fa)';

  /* 구조 보기 좌표(viewBox 560×420). 축삭 중심 y, 말이집 길이·결절 간격. */
  var CY = 208;
  var AX0 = 200;
  var AX1 = 528;
  var MY_W = 70;
  var ND_W = 14;
  var MY0 = 232;
  var MY_H = 34;
  var BRANCH = 486;

  var AP_T = [0, 0.5, 0.8, 1.0, 1.3, 1.7, 2.1, 2.6, 3.2, 4.0, 5.0, 6.0];
  var AP_V = [-70, -70, -55, -5, 30, 5, -35, -68, -80, -78, -72, -70];
  var GP = { x0: 70, x1: 535, y0: 25, y1: 212, vTop: 40, vBot: -90 };

  var NA_X = 142;
  var K_X = 278;
  var PUMP_X = 438;
  var NA_WIN = [0.6, 1.35];
  var K_WIN = [1.25, 3.6];

  /* 시냅스: 시냅스 이후 막은 2차 베지어. 수용체 t, 소포, Ca 통로. */
  var SM = { x0: 58, y0: 222, x1: 236, y1: 248, x2: 424, y2: 222 };
  var REC_T = [0.22, 0.5, 0.76];
  var CA_XS = [168, 336];
  var VES = [
    { x: 118, y: 86, fuse: 0 },
    { x: 188, y: 74, fuse: 0 },
    { x: 258, y: 84, fuse: 1, tx: 214, ty: 150 },
    { x: 150, y: 118, fuse: 1, tx: 256, ty: 152 },
    { x: 228, y: 122, fuse: 1, tx: 300, ty: 150 },
    { x: 318, y: 108, fuse: 0 }
  ];

  function n(v) {
    if (typeof v !== 'number' || v !== v || v === Infinity || v === -Infinity) v = 0;
    var r = Math.round(v * 10) / 10;
    if (r === 0) r = 0;
    return String(r);
  }

  function numOr(v, d) {
    var x = Number(v);
    return x === x ? x : d;
  }

  function clamp(v, a, b) {
    if (v < a) return a;
    if (v > b) return b;
    return v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function css() {
    return '<style>'
      + '.fgx-fig-neuron .fgx-hit{pointer-events:all}'
      + '.fgx-fig-neuron path,.fgx-fig-neuron line,.fgx-fig-neuron polyline{stroke-linecap:round;stroke-linejoin:round}'
      + '</style>';
  }

  function hit(x, y, w, h) {
    return '<rect class="fgx-hit" x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" fill="transparent" style="pointer-events:all"/>';
  }

  function txt(x, y, str, size, fill, anchor, weight) {
    return '<text x="' + n(x) + '" y="' + n(y) + '" text-anchor="' + (anchor || 'start') + '" font-size="' + size + '"'
      + (weight ? ' font-weight="' + weight + '"' : '')
      + ' fill="' + fill + '">' + str + '</text>';
  }

  function label(part, x, y, str, anchor) {
    var w = str.length * 16;
    var ax = anchor || 'start';
    var rx = ax === 'middle' ? x - w / 2 : ax === 'end' ? x - w : x;
    return '<g data-part="' + part + '">'
      + hit(rx - 3, y - 16, w + 6, 22)
      + txt(x, y, str, 16, INK, ax, '700')
      + '</g>';
  }

  function leader(x1, y1, x2, y2) {
    return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '" stroke="' + DIM + '" stroke-width="1.25"/>'
      + '<circle cx="' + n(x2) + '" cy="' + n(y2) + '" r="2.6" fill="' + DIM + '"/>';
  }

  function myX(i) { return MY0 + i * (MY_W + ND_W); }

  function nodeX(i) { return myX(i) + MY_W + ND_W / 2; }

  /* ---------- 활동 전위 곡선 ---------- */

  function pchipTangents(xs, ys) {
    var len = xs.length;
    var h = [];
    var d = [];
    var m = [];
    var k, w1, w2, hn, hn1, dn, dn1, a, b, s, tau;
    for (k = 0; k < len - 1; k++) {
      h[k] = xs[k + 1] - xs[k];
      d[k] = (ys[k + 1] - ys[k]) / h[k];
    }
    for (k = 1; k < len - 1; k++) {
      if (d[k - 1] * d[k] <= 0) m[k] = 0;
      else {
        w1 = 2 * h[k] + h[k - 1];
        w2 = h[k] + 2 * h[k - 1];
        m[k] = (w1 + w2) / ((w1 / d[k - 1]) + (w2 / d[k]));
      }
    }
    m[0] = d[0];
    m[len - 1] = d[len - 2];
    if (len > 2) {
      m[0] = ((2 * h[0] + h[1]) * d[0] - h[0] * d[1]) / (h[0] + h[1]);
      if (m[0] * d[0] <= 0) m[0] = 0;
      else if (d[0] * d[1] < 0 && Math.abs(m[0]) > Math.abs(3 * d[0])) m[0] = 3 * d[0];
      hn = h[len - 2];
      hn1 = h[len - 3];
      dn = d[len - 2];
      dn1 = d[len - 3];
      m[len - 1] = ((2 * hn + hn1) * dn - hn * dn1) / (hn + hn1);
      if (m[len - 1] * dn <= 0) m[len - 1] = 0;
      else if (dn * dn1 < 0 && Math.abs(m[len - 1]) > Math.abs(3 * dn)) m[len - 1] = 3 * dn;
    }
    for (k = 0; k < len - 1; k++) {
      if (d[k] === 0) {
        m[k] = 0;
        m[k + 1] = 0;
      } else {
        a = m[k] / d[k];
        b = m[k + 1] / d[k];
        s = a * a + b * b;
        if (s > 9) {
          tau = 3 / Math.sqrt(s);
          m[k] = tau * a * d[k];
          m[k + 1] = tau * b * d[k];
        }
      }
    }
    return m;
  }

  var AP_M = pchipTangents(AP_T, AP_V);

  function hermite(y0, y1, m0, m1, h, s) {
    var s2 = s * s;
    var s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * y0 + (s3 - 2 * s2 + s) * h * m0 + (-2 * s3 + 3 * s2) * y1 + (s3 - s2) * h * m1;
  }

  function Vof(t) {
    var i, h, s;
    if (t <= AP_T[0]) return AP_V[0];
    if (t >= AP_T[AP_T.length - 1]) return AP_V[AP_V.length - 1];
    i = 0;
    while (i < AP_T.length - 2 && t > AP_T[i + 1]) i++;
    h = AP_T[i + 1] - AP_T[i];
    s = (t - AP_T[i]) / h;
    return hermite(AP_V[i], AP_V[i + 1], AP_M[i], AP_M[i + 1], h, s);
  }

  function Xof(t) {
    return GP.x0 + (t / 6) * (GP.x1 - GP.x0);
  }

  function Yof(v) {
    return GP.y0 + (GP.vTop - v) / (GP.vTop - GP.vBot) * (GP.y1 - GP.y0);
  }

  function fmtMv(v) {
    var r = Math.round(v);
    if (r > 0) return '+' + r;
    if (r < 0) return '−' + (-r);
    return '0';
  }

  function phaseOf(t) {
    var id, line, active;
    active = [];
    if (t >= NA_WIN[0] && t <= NA_WIN[1]) active.push('na_channel');
    if (t >= K_WIN[0] && t <= K_WIN[1]) active.push('k_channel');
    if (t < 0.5 || t >= 5) {
      id = 'resting';
      line = '휴지 전위 — K⁺ 누수와 Na⁺–K⁺ 펌프로 유지';
    } else if (t < 1.3) {
      id = 'depolarization';
      line = t < 0.6 ? '탈분극 시작 — 막전위가 역치를 향해 오름' : '탈분극 — Na⁺ 통로 열림 → Na⁺ 유입';
    } else if (t < 2.7) {
      id = 'repolarization';
      line = '재분극 — K⁺ 통로 열림 → K⁺ 유출';
    } else {
      id = 'hyperpolarization';
      line = '과분극 — K⁺이 더 나가 휴지 전위보다 낮아짐';
    }
    return { id: id, line: line, active: active };
  }

  function ionStream(t, win, y0, y1, xs) {
    var span = win[1] - win[0];
    var out = [];
    var i, p, on;
    for (i = 0; i < xs.length; i++) {
      p = (t - win[0]) / span - i * 0.28;
      on = p >= 0 && p <= 1;
      out.push({ x: xs[i], y: on ? lerp(y0, y1, p) : y0, on: on });
    }
    return out;
  }

  function apState(t) {
    var v, ph, pos;
    t = clamp(t, 0, 6);
    v = Vof(t);
    ph = phaseOf(t);
    pos = v >= 0;
    return {
      t: t,
      v: v,
      follow: ph.id,
      active: ph.active,
      readout: 't = ' + t.toFixed(1) + ' ms · 막전위 ≈ ' + fmtMv(v) + ' mV\n' + ph.line,
      naOpen: t >= NA_WIN[0] && t <= NA_WIN[1],
      kOpen: t >= K_WIN[0] && t <= K_WIN[1],
      charge: pos ? '(+)' : '(−)',
      chargeFill: pos ? C2 : C1,
      mx: Xof(t),
      my: Yof(v),
      naIons: ionStream(t, NA_WIN, 276, 366, [NA_X - 9, NA_X, NA_X + 9]),
      kIons: ionStream(t, K_WIN, 366, 276, [K_X - 9, K_X, K_X + 9])
    };
  }

  /* ---------- 흥분의 위치 ---------- */

  function pulseState(p) {
    var x, y, u, s, snapped, zone, node, follow, active, text;
    p = clamp(p, 0, 1);
    if (p < 0.2) {
      u = p / 0.2;
      if (u < 0.55) {
        s = u / 0.55;
        x = lerp(42, 112, s);
        y = lerp(132, 190, s);
        zone = 'dendrite';
        text = '흥분이 가지 돌기를 따라 신경 세포체 쪽으로 이동';
      } else {
        s = (u - 0.55) / 0.45;
        x = lerp(112, AX0, s);
        y = lerp(190, CY, s);
        zone = 'soma';
        text = '흥분이 신경 세포체에 모임';
      }
      return {
        x: x, y: y, zone: zone, node: 0,
        follow: zone, active: [], readout: text
      };
    }
    u = (p - 0.2) / 0.8;
    x = lerp(AX0, AX1, u);
    y = CY;
    snapped = snapAxon(x);
    x = snapped.x;
    zone = snapped.zone;
    node = snapped.node;
    active = [];
    if (zone === 'node') {
      follow = 'node';
      active = ['node'];
      text = '흥분이 랑비에 결절 ' + node + '에서 일어남 — 말이집 부분에서는 활동 전위가 발생하지 않고 마디에서 마디로 건너뜀(도약 전도)';
    } else if (zone === 'terminal') {
      follow = 'terminal';
      text = '흥분이 축삭 말단에 도달 — 시냅스에서 다음 뉴런으로 전달';
    } else {
      follow = 'axon';
      text = '흥분이 축삭 돌기를 따라 이동';
    }
    return { x: x, y: y, zone: zone, node: node, follow: follow, active: active, readout: text };
  }

  function snapAxon(x) {
    var i, a, b;
    for (i = 0; i < 3; i++) {
      a = myX(i);
      b = a + MY_W;
      if (x >= a && x < b) {
        if (i < 2) return { x: nodeX(i), node: i + 1, zone: 'node' };
        return { x: nodeX(1), node: 2, zone: 'node' };
      }
    }
    for (i = 0; i < 2; i++) {
      a = myX(i) + MY_W;
      b = a + ND_W;
      if (x >= a && x < b) return { x: nodeX(i), node: i + 1, zone: 'node' };
    }
    if (x >= BRANCH) return { x: x, node: 0, zone: 'terminal' };
    return { x: x, node: 0, zone: 'axon' };
  }

  function sparkTf(st) {
    var sc = st.zone === 'node' ? 1.08 : 1;
    return 'translate(' + n(st.x) + ',' + n(st.y) + ') scale(' + sc + ')';
  }

  /* ---------- 시냅스 단계 ---------- */

  function bez(t) {
    var u = 1 - t;
    return {
      x: u * u * SM.x0 + 2 * u * t * SM.x1 + t * t * SM.x2,
      y: u * u * SM.y0 + 2 * u * t * SM.y1 + t * t * SM.y2
    };
  }

  function synState(s) {
    var follow, text, fuse, i, ves, nts, cas, nas, recs, p, rel, dest, ch;
    s = clamp(s, 0, 1);
    if (s < 0.15) {
      follow = 'presynaptic';
      text = '활동 전위가 시냅스 이전 뉴런의 축삭 말단에 도착';
    } else if (s < 0.35) {
      follow = 'ca_channel';
      text = 'Ca²⁺ 통로가 열려 Ca²⁺이 말단 안으로 들어옴';
    } else if (s < 0.6) {
      follow = 'vesicle';
      text = '소포가 막과 융합해 신경 전달 물질을 시냅스 틈으로 방출';
    } else if (s < 0.85) {
      follow = 'neurotransmitter';
      text = '신경 전달 물질이 틈을 건너 수용체에 결합';
    } else {
      follow = 'receptor';
      text = '수용체 통로가 열려 Na⁺이 유입되고 시냅스 이후 막이 탈분극';
    }
    fuse = clamp((s - 0.35) / 0.25, 0, 1);
    rel = clamp((s - 0.6) / 0.25, 0, 1);
    ves = [];
    for (i = 0; i < VES.length; i++) {
      if (VES[i].fuse) {
        ves.push({
          x: lerp(VES[i].x, VES[i].tx, fuse),
          y: lerp(VES[i].y, VES[i].ty, fuse),
          ry: lerp(13, 6, fuse)
        });
      } else {
        ves.push({ x: VES[i].x, y: VES[i].y, ry: 13 });
      }
    }
    recs = [];
    for (i = 0; i < REC_T.length; i++) recs.push(bez(REC_T[i]));
    nts = [];
    /* 융합하는 소포 3개 × 전달 물질 2개 → 수용체 3개 */
    var fuseIdx = [2, 3, 4];
    var k, src, mouth, side;
    for (i = 0; i < 3; i++) {
      src = ves[fuseIdx[i]];
      mouth = recs[i];
      for (k = 0; k < 2; k++) {
        side = k === 0 ? -7 : 7;
        dest = { x: mouth.x + side, y: mouth.y - 2 };
        if (rel <= 0) {
          nts.push({ x: src.x + side * 0.4, y: src.y + (k === 0 ? -4 : 4) });
        } else {
          nts.push({ x: lerp(src.x, dest.x, rel), y: lerp(src.y, dest.y, rel) });
        }
      }
    }
    cas = [];
    p = clamp((s - 0.15) / 0.2, 0, 1);
    for (i = 0; i < 4; i++) {
      ch = CA_XS[i < 2 ? 0 : 1];
      cas.push({
        x: ch + (i % 2 === 0 ? -7 : 7),
        y: lerp(196, 128, clamp(p - (i % 2) * 0.25, 0, 1))
      });
    }
    nas = [];
    p = clamp((s - 0.85) / 0.15, 0, 1);
    var postCh = bez(0.9);
    for (i = 0; i < 3; i++) {
      var ip = clamp(p - i * 0.22, 0, 1);
      nas.push({
        x: postCh.x + (i - 1) * 8,
        y: lerp(postCh.y - 18, postCh.y + 48, s >= 0.85 ? ip : 0),
        on: s >= 0.85 && ip > 0 && (p - i * 0.22) <= 1
      });
    }
    return {
      s: s,
      follow: follow,
      active: s >= 0.85 ? ['receptor'] : s >= 0.15 && s < 0.55 ? ['ca_channel'] : [],
      readout: 's=' + s.toFixed(2) + ': ' + text,
      ves: ves,
      nts: nts,
      cas: cas,
      nas: nas,
      recs: recs,
      postCh: postCh,
      caOpen: s >= 0.15 && s < 0.55,
      bound: s >= 0.72,
      naOpen: s >= 0.85,
      depol: s >= 0.85,
      boltOn: s < 0.15
    };
  }

  /* ---------- 뉴런 구조 ---------- */

  function renderStruct(v) {
    var st = pulseState(numOr(v.pulse, 0));
    var y0 = CY - MY_H / 2;
    var parts = [css()];
    var i, x, a, b;

    parts.push(leader(52, 54, 28, 168));
    parts.push(leader(248, 54, 224, 196));
    parts.push(leader(400, 54, nodeX(1), CY - 14));
    parts.push(leader(146, 356, 148, 262));
    parts.push(leader(myX(1) + MY_W / 2, 356, myX(1) + MY_W / 2, y0 + MY_H + 2));
    parts.push(leader(500, 356, 516, CY + 62));

    parts.push('<g data-part="dendrite">');
    parts.push('<path d="M116,178 C88,158 62,140 34,122" fill="none" stroke="' + C6 + '" stroke-width="6.5"/>');
    parts.push('<path d="M68,146 C50,126 38,114 28,102" fill="none" stroke="' + C6 + '" stroke-width="3.5"/>');
    parts.push('<path d="M106,202 C74,196 44,194 16,188" fill="none" stroke="' + C6 + '" stroke-width="7"/>');
    parts.push('<path d="M58,196 C42,178 32,166 24,154" fill="none" stroke="' + C6 + '" stroke-width="3.5"/>');
    parts.push('<path d="M114,230 C84,250 54,268 30,286" fill="none" stroke="' + C6 + '" stroke-width="6.5"/>');
    parts.push('<path d="M74,252 C58,270 46,280 36,296" fill="none" stroke="' + C6 + '" stroke-width="3.2"/>');
    parts.push(hit(12, 96, 108, 210));
    parts.push('</g>');

    parts.push('<g data-part="soma">');
    parts.push('<path d="M200,' + CY + ' C194,' + (CY - 34) + ' 172,' + (CY - 52) + ' 146,' + (CY - 54)
      + ' C114,' + (CY - 56) + ' 96,' + (CY - 32) + ' 98,' + CY
      + ' C96,' + (CY + 34) + ' 118,' + (CY + 56) + ' 150,' + (CY + 54)
      + ' C176,' + (CY + 52) + ' 194,' + (CY + 32) + ' 200,' + CY + ' Z" fill="' + C6S + '" stroke="' + C6 + '" stroke-width="2"/>');
    parts.push(hit(96, CY - 56, 108, 114));
    parts.push('</g>');

    parts.push('<g data-part="nucleus">');
    parts.push('<circle cx="140" cy="' + CY + '" r="15" fill="' + C6 + '" stroke="' + INK + '" stroke-width="1.25"/>');
    parts.push('<circle cx="145" cy="' + (CY - 3) + '" r="4" fill="' + CARD + '"/>');
    parts.push(hit(122, CY - 18, 36, 36));
    parts.push('</g>');

    parts.push('<g data-part="myelin">');
    for (i = 0; i < 3; i++) {
      x = myX(i);
      parts.push('<rect x="' + x + '" y="' + y0 + '" width="' + MY_W + '" height="' + MY_H + '" rx="17" fill="' + C3S + '" stroke="' + C3 + '" stroke-width="1.75"/>');
      for (a = 1; a <= 4; a++) {
        b = x + 10 + a * 12;
        parts.push('<path d="M' + b + ',' + (y0 + 7) + ' Q' + (b + 4) + ',' + CY + ' ' + b + ',' + (y0 + MY_H - 7) + '" fill="none" stroke="' + C3 + '" stroke-width="1.15"/>');
      }
    }
    parts.push('</g>');

    parts.push('<g data-part="axon">');
    parts.push('<path d="M186,' + (CY - 16) + ' C206,' + (CY - 8) + ' 220,' + (CY - 4) + ' 234,' + (CY - 3.5)
      + ' L234,' + (CY + 3.5) + ' C220,' + (CY + 4) + ' 206,' + (CY + 8) + ' 186,' + (CY + 16) + ' Z" fill="' + C8 + '"/>');
    parts.push('<line x1="226" y1="' + CY + '" x2="' + BRANCH + '" y2="' + CY + '" stroke="' + C8 + '" stroke-width="7"/>');
    parts.push(hit(190, CY - 10, BRANCH - 186, 20));
    parts.push('</g>');

    parts.push('<g data-part="node">');
    for (i = 0; i < 2; i++) {
      x = nodeX(i);
      parts.push('<circle cx="' + x + '" cy="' + CY + '" r="7" fill="none" stroke="' + C2 + '" stroke-width="2"/>');
      parts.push('<circle cx="' + x + '" cy="' + CY + '" r="3.2" fill="' + C2 + '"/>');
      parts.push(hit(x - 12, CY - 18, 24, 36));
    }
    parts.push('</g>');

    x = myX(1);
    parts.push('<g data-part="schwann">');
    parts.push('<path d="M' + (x + 8) + ',' + (y0 + 2) + ' C' + (x + 6) + ',' + (y0 - 22) + ' ' + (x + 28) + ',' + (y0 - 36) + ' ' + (x + 40) + ',' + (y0 - 32)
      + ' C' + (x + 56) + ',' + (y0 - 26) + ' ' + (x + 62) + ',' + (y0 - 10) + ' ' + (x + 58) + ',' + (y0 + 2) + ' Z" fill="' + C5S + '" stroke="' + C5 + '" stroke-width="1.5"/>');
    parts.push('<ellipse cx="' + (x + 36) + '" cy="' + (y0 - 16) + '" rx="13" ry="8" fill="' + C5S + '" stroke="' + C5 + '" stroke-width="1.75"/>');
    parts.push('<circle cx="' + (x + 38) + '" cy="' + (y0 - 16) + '" r="3" fill="' + C5 + '"/>');
    parts.push(hit(x + 10, y0 - 40, 56, 44));
    parts.push('</g>');

    parts.push('<g data-part="terminal">');
    parts.push('<path d="M' + BRANCH + ',' + CY + ' Q512,' + (CY - 8) + ' 518,' + (CY - 52) + '" fill="none" stroke="' + C8 + '" stroke-width="5"/>');
    parts.push('<path d="M' + BRANCH + ',' + CY + ' L530,' + CY + '" fill="none" stroke="' + C8 + '" stroke-width="5"/>');
    parts.push('<path d="M' + BRANCH + ',' + CY + ' Q512,' + (CY + 8) + ' 518,' + (CY + 52) + '" fill="none" stroke="' + C8 + '" stroke-width="5"/>');
    parts.push('<circle cx="524" cy="' + (CY - 60) + '" r="13" fill="' + C6S + '" stroke="' + C6 + '" stroke-width="2"/>');
    parts.push('<circle cx="' + AX1 + '" cy="' + CY + '" r="13" fill="' + C6S + '" stroke="' + C6 + '" stroke-width="2"/>');
    parts.push('<circle cx="524" cy="' + (CY + 60) + '" r="13" fill="' + C6S + '" stroke="' + C6 + '" stroke-width="2"/>');
    parts.push('<circle cx="521" cy="' + (CY - 62) + '" r="2.2" fill="' + C3 + '"/>');
    parts.push('<circle cx="528" cy="' + (CY - 56) + '" r="2" fill="' + C3 + '"/>');
    parts.push('<circle cx="' + (AX1 - 3) + '" cy="' + (CY - 2) + '" r="2.2" fill="' + C3 + '"/>');
    parts.push('<circle cx="' + (AX1 + 3) + '" cy="' + (CY + 3) + '" r="2" fill="' + C3 + '"/>');
    parts.push('<circle cx="521" cy="' + (CY + 58) + '" r="2.2" fill="' + C3 + '"/>');
    parts.push('<circle cx="528" cy="' + (CY + 64) + '" r="2" fill="' + C3 + '"/>');
    parts.push(hit(478, CY - 78, 70, 156));
    parts.push('</g>');

    parts.push('<g class="js-spark" transform="' + sparkTf(st) + '" style="pointer-events:none">');
    parts.push('<circle r="11" fill="' + C2S + '"/>');
    parts.push('<circle r="5.2" fill="' + C2 + '"/>');
    parts.push('<circle r="2.2" fill="' + CARD + '"/>');
    parts.push('</g>');

    parts.push(label('dendrite', 16, 46, '가지 돌기', 'start'));
    parts.push(label('axon', 196, 46, '축삭 돌기', 'start'));
    parts.push(label('node', 338, 46, '랑비에 결절', 'start'));
    parts.push(label('soma', 146, 384, '신경 세포체', 'middle'));
    parts.push(label('myelin', myX(1) + 20, 384, '말이집', 'middle'));
    parts.push(label('terminal', 492, 384, '축삭 말단', 'middle'));
    return parts.join('');
  }

  /* ---------- 활동 전위 ---------- */

  function curvePts(t0, t1) {
    var steps = Math.max(8, Math.ceil((t1 - t0) / 0.045));
    var pts = [];
    var i, t;
    for (i = 0; i <= steps; i++) {
      t = t0 + (t1 - t0) * i / steps;
      pts.push(n(Xof(t)) + ',' + n(Yof(Vof(t))));
    }
    return pts.join(' ');
  }

  function curveSeg(part, color, t0, t1) {
    var pts = curvePts(t0, t1);
    return '<g data-part="' + part + '">'
      + '<polyline fill="none" stroke="' + color + '" stroke-width="4" points="' + pts + '"/>'
      + '<polyline fill="none" stroke="transparent" stroke-width="18" points="' + pts + '"/>'
      + '</g>';
  }

  function gate(cx, part, color, open, cls, down) {
    var x = cx - 22;
    var y = 294;
    var plug = open ? 'hidden' : 'visible';
    var flow = open ? 'visible' : 'hidden';
    var word = open ? '열림' : '닫힘';
    var shaft = down
      ? 'M' + cx + ',' + (y - 4) + ' L' + cx + ',' + (y + 50)
      : 'M' + cx + ',' + (y + 58) + ' L' + cx + ',' + (y + 4);
    var head = down
      ? 'M' + cx + ',' + (y + 58) + ' L' + (cx - 5) + ',' + (y + 48) + ' L' + (cx + 5) + ',' + (y + 48) + ' Z'
      : 'M' + cx + ',' + (y - 6) + ' L' + (cx - 5) + ',' + (y + 4) + ' L' + (cx + 5) + ',' + (y + 4) + ' Z';
    return '<g data-part="' + part + '">'
      + '<rect x="' + x + '" y="' + y + '" width="44" height="54" rx="10" fill="' + CARD + '" stroke="' + color + '" stroke-width="2.5"/>'
      + '<rect x="' + (cx - 7) + '" y="' + (y + 6) + '" width="14" height="42" rx="4" fill="' + ELEV + '"/>'
      + '<rect class="' + cls + '-plug" x="' + (cx - 9) + '" y="' + (y + 20) + '" width="18" height="14" rx="3" fill="' + color + '" visibility="' + plug + '"/>'
      + '<path class="' + cls + '-flow" d="' + shaft + '" fill="none" stroke="' + color + '" stroke-width="2.25" visibility="' + flow + '"/>'
      + '<path class="' + cls + '-flow" d="' + head + '" fill="' + color + '" visibility="' + flow + '"/>'
      + txt(cx, 392, word, 15, color, 'middle', '700').replace('<text ', '<text class="' + cls + '-state" ')
      + hit(x - 8, y - 8, 60, 114)
      + '</g>';
  }

  function lipids() {
    var out = [];
    var x, skip;
    for (x = 52; x <= 516; x += 16) {
      skip = Math.abs(x - NA_X) < 32 || Math.abs(x - K_X) < 32 || (x > PUMP_X - 62 && x < PUMP_X + 70);
      if (skip) continue;
      out.push('<circle cx="' + x + '" cy="307" r="4.4" fill="' + C6 + '"/>');
      out.push('<line x1="' + (x - 2) + '" y1="312" x2="' + (x - 2) + '" y2="322" stroke="' + C8 + '" stroke-width="1.4"/>');
      out.push('<line x1="' + (x + 2) + '" y1="312" x2="' + (x + 2) + '" y2="322" stroke="' + C8 + '" stroke-width="1.4"/>');
      out.push('<circle cx="' + x + '" cy="333" r="4.4" fill="' + C6 + '"/>');
      out.push('<line x1="' + (x - 2) + '" y1="328" x2="' + (x - 2) + '" y2="318" stroke="' + C8 + '" stroke-width="1.4"/>');
      out.push('<line x1="' + (x + 2) + '" y1="328" x2="' + (x + 2) + '" y2="318" stroke="' + C8 + '" stroke-width="1.4"/>');
    }
    return out.join('');
  }

  function staticIons() {
    var na = [[64, 274], [92, 286], [196, 270], [228, 284], [330, 274], [356, 288]];
    var k = [[62, 382], [250, 384], [308, 376]];
    var out = [];
    var i;
    out.push('<g data-part="na_channel">');
    for (i = 0; i < na.length; i++) {
      out.push('<circle cx="' + na[i][0] + '" cy="' + na[i][1] + '" r="6" fill="' + C2 + '"/>');
    }
    out.push(txt(196, 258, 'Na⁺', 15, C2, 'middle', '700'));
    out.push('</g>');
    out.push('<g data-part="k_channel">');
    for (i = 0; i < k.length; i++) {
      out.push('<circle cx="' + k[i][0] + '" cy="' + k[i][1] + '" r="6" fill="' + C1 + '"/>');
    }
    out.push(txt(196, 400, 'K⁺', 15, C1, 'middle', '700'));
    out.push('</g>');
    return out.join('');
  }

  function movingIons(st) {
    var out = [];
    var i, ion;
    for (i = 0; i < st.naIons.length; i++) {
      ion = st.naIons[i];
      out.push('<circle class="js-na-ion" data-i="' + i + '" cx="' + n(ion.x) + '" cy="' + n(ion.y) + '" r="5.5" fill="' + C2 + '" visibility="' + (ion.on ? 'visible' : 'hidden') + '"/>');
    }
    for (i = 0; i < st.kIons.length; i++) {
      ion = st.kIons[i];
      out.push('<circle class="js-k-ion" data-i="' + i + '" cx="' + n(ion.x) + '" cy="' + n(ion.y) + '" r="5.5" fill="' + C1 + '" visibility="' + (ion.on ? 'visible' : 'hidden') + '"/>');
    }
    return out.join('');
  }

  function charges(st) {
    var xs = [102, 214, 348, 512];
    var out = [];
    var i;
    for (i = 0; i < xs.length; i++) {
      out.push('<text class="js-charge" data-i="' + i + '" x="' + xs[i] + '" y="370" text-anchor="middle" font-size="15" font-weight="700" fill="' + st.chargeFill + '">' + st.charge + '</text>');
    }
    return out.join('');
  }

  function pump() {
    var x = PUMP_X - 54;
    return '<g data-part="nak_pump">'
      + '<rect x="' + x + '" y="296" width="108" height="52" rx="14" fill="' + C4S + '" stroke="' + C4 + '" stroke-width="2.5"/>'
      + txt(PUMP_X, 262, 'ATP', 16, C4, 'middle', '700')
      + '<line x1="' + (PUMP_X - 26) + '" y1="336" x2="' + (PUMP_X - 26) + '" y2="306" stroke="' + C2 + '" stroke-width="2.5"/>'
      + '<path d="M' + (PUMP_X - 26) + ',300 L' + (PUMP_X - 32) + ',312 L' + (PUMP_X - 20) + ',312 Z" fill="' + C2 + '"/>'
      + txt(PUMP_X - 26, 286, 'Na⁺×3', 15, C2, 'middle', '700')
      + '<line x1="' + (PUMP_X + 26) + '" y1="306" x2="' + (PUMP_X + 26) + '" y2="334" stroke="' + C1 + '" stroke-width="2.5"/>'
      + '<path d="M' + (PUMP_X + 26) + ',342 L' + (PUMP_X + 20) + ',330 L' + (PUMP_X + 32) + ',330 Z" fill="' + C1 + '"/>'
      + txt(PUMP_X + 26, 378, 'K⁺×2', 15, C1, 'middle', '700')
      + hit(x - 16, 260, 140, 112)
      + '</g>';
  }

  function renderAp(v) {
    var st = apState(numOr(v.t, 0.2));
    var parts = [css()];
    var ticks = [30, 0, -55, -80];
    var i, tv, y, x, lab;
    parts.push('<rect x="36" y="244" width="488" height="164" rx="10" fill="' + CARD + '" stroke="' + LINE + '" stroke-width="1.25"/>');
    parts.push('<rect x="40" y="248" width="480" height="60" fill="' + C2S + '"/>');
    parts.push('<rect x="40" y="308" width="480" height="26" fill="' + C3S + '"/>');
    parts.push('<rect x="40" y="334" width="480" height="70" fill="' + C1S + '"/>');

    parts.push('<line x1="' + GP.x0 + '" y1="' + GP.y0 + '" x2="' + GP.x0 + '" y2="' + GP.y1 + '" stroke="' + INK + '" stroke-width="1.6"/>');
    parts.push('<line x1="' + GP.x0 + '" y1="' + GP.y1 + '" x2="' + GP.x1 + '" y2="' + GP.y1 + '" stroke="' + INK + '" stroke-width="1.6"/>');
    for (i = 0; i < ticks.length; i++) {
      tv = ticks[i];
      y = Yof(tv);
      parts.push('<line x1="' + (GP.x0 - 5) + '" y1="' + n(y) + '" x2="' + GP.x0 + '" y2="' + n(y) + '" stroke="' + INK + '" stroke-width="1.4"/>');
      lab = tv > 0 ? '+' + tv : tv < 0 ? '−' + (-tv) : '0';
      parts.push(txt(GP.x0 - 8, y + 4, lab, 14, DIM, 'end', ''));
    }
    for (i = 0; i <= 6; i++) {
      x = Xof(i);
      parts.push('<line x1="' + n(x) + '" y1="' + GP.y1 + '" x2="' + n(x) + '" y2="' + (GP.y1 + 5) + '" stroke="' + INK + '" stroke-width="1.4"/>');
      parts.push(txt(x, GP.y1 + 20, String(i), 14, DIM, 'middle', ''));
    }
    parts.push(txt(GP.x0 - 8, 16, 'mV', 14, DIM, 'end', ''));
    parts.push(txt(GP.x1, GP.y1 - 8, 'ms', 14, DIM, 'end', ''));

    y = Yof(-70);
    parts.push('<g data-part="resting">');
    parts.push('<line x1="' + GP.x0 + '" y1="' + n(y) + '" x2="' + GP.x1 + '" y2="' + n(y) + '" stroke="' + C8 + '" stroke-width="1.25"/>');
    parts.push(txt(348, y - 8, '−70 mV', 15, C8, 'start', '700'));
    parts.push(hit(GP.x0, y - 8, GP.x1 - GP.x0, 16));
    parts.push('</g>');

    y = Yof(-55);
    parts.push('<g data-part="threshold">');
    parts.push('<line x1="' + GP.x0 + '" y1="' + n(y) + '" x2="' + GP.x1 + '" y2="' + n(y) + '" stroke="' + C3 + '" stroke-width="1.75" stroke-dasharray="6 5"/>');
    parts.push(txt(GP.x1 - 8, y - 10, '역치', 15, C3, 'end', '700'));
    parts.push(hit(GP.x0, y - 10, GP.x1 - GP.x0, 18));
    parts.push('</g>');

    parts.push(curveSeg('resting', C8, 0, 0.5));
    parts.push(curveSeg('depolarization', C2, 0.5, 1.3));
    parts.push(curveSeg('repolarization', C1, 1.3, 2.7));
    parts.push(curveSeg('hyperpolarization', C5, 2.7, 5));
    parts.push(curveSeg('resting', C8, 5, 6));

    x = Xof(1.3);
    y = Yof(30);
    parts.push('<g data-part="peak">');
    parts.push('<path d="M' + n(x) + ',' + n(y - 8) + ' L' + n(x + 6) + ',' + n(y) + ' L' + n(x) + ',' + n(y + 8) + ' L' + n(x - 6) + ',' + n(y) + ' Z" fill="' + C2 + '"/>');
    parts.push('<line x1="' + n(x + 8) + '" y1="' + n(y - 4) + '" x2="188" y2="30" stroke="' + C2 + '" stroke-width="1.25"/>');
    parts.push(txt(192, 28, '+30 mV', 15, C2, 'start', '700'));
    parts.push(hit(188, 12, 72, 22));
    parts.push(hit(x - 12, y - 14, 24, 28));
    parts.push('</g>');

    parts.push('<g class="js-now" style="pointer-events:none">');
    parts.push('<line class="js-now-line" x1="' + n(st.mx) + '" y1="' + GP.y0 + '" x2="' + n(st.mx) + '" y2="' + GP.y1 + '" stroke="' + C4 + '" stroke-width="1.5" stroke-dasharray="3 4"/>');
    parts.push('<circle class="js-now-dot" cx="' + n(st.mx) + '" cy="' + n(st.my) + '" r="6.5" fill="' + C4 + '" stroke="' + CARD + '" stroke-width="2"/>');
    parts.push(txt(528, 16, fmtMv(st.v) + ' mV', 15, INK, 'end', '700').replace('<text ', '<text class="js-now-lab" '));
    parts.push('</g>');

    parts.push(txt(48, 262, '세포 밖', 16, INK, 'start', '700'));
    parts.push(txt(48, 400, '세포 안', 16, INK, 'start', '700'));
    parts.push(lipids());
    parts.push(staticIons());
    parts.push(gate(NA_X, 'na_channel', C2, st.naOpen, 'js-na', true));
    parts.push(gate(K_X, 'k_channel', C1, st.kOpen, 'js-k', false));
    parts.push(pump());
    parts.push(charges(st));
    parts.push(movingIons(st));
    return parts.join('');
  }

  /* ---------- 시냅스 ---------- */

  function diamond(cls, i, x, y) {
    return '<g class="' + cls + '" data-i="' + i + '" data-part="neurotransmitter" transform="translate(' + n(x) + ',' + n(y) + ')">'
      + '<path d="M0,-6 L5.2,0 L0,6 L-5.2,0 Z" fill="' + C3 + '"/>'
      + hit(-8, -8, 16, 16)
      + '</g>';
  }

  function cup(x, y, bound) {
    var fill = bound ? C5 : C5S;
    return '<g class="js-rec" data-part="receptor" transform="translate(' + n(x) + ',' + n(y) + ')">'
      + '<path d="M-13,2 L-13,16 Q-13,28 0,28 Q13,28 13,16 L13,2 L7,2 L7,16 Q7,22 0,22 Q-7,22 -7,16 L-7,2 Z" fill="' + fill + '" stroke="' + C5 + '" stroke-width="1.75"/>'
      + hit(-16, -4, 32, 40)
      + '</g>';
  }

  function smallGate(cx, open) {
    var plug = open ? 'hidden' : 'visible';
    return '<g data-part="ca_channel">'
      + '<rect x="' + (cx - 14) + '" y="150" width="28" height="32" rx="6" fill="' + CARD + '" stroke="' + C6 + '" stroke-width="2.25"/>'
      + '<rect x="' + (cx - 5) + '" y="156" width="10" height="20" rx="3" fill="' + ELEV + '"/>'
      + '<rect class="js-ca-plug" x="' + (cx - 6) + '" y="162" width="12" height="8" rx="2" fill="' + C6 + '" visibility="' + plug + '"/>'
      + hit(cx - 16, 146, 32, 40)
      + '</g>';
  }

  function renderSyn(v) {
    var st = synState(numOr(v.s, 0));
    var parts = [css()];
    var i, p, vis, ch;
    parts.push('<g data-part="presynaptic">');
    parts.push('<path d="M96,166 C74,166 58,148 58,118 C58,72 96,44 156,42 L300,42 C366,44 404,72 404,118 C404,148 388,166 366,166 Z" fill="' + CARD + '" stroke="' + C8 + '" stroke-width="2"/>');
    parts.push('<line x1="96" y1="166" x2="366" y2="166" stroke="' + INK + '" stroke-width="3"/>');
    parts.push('<line x1="200" y1="8" x2="200" y2="46" stroke="' + C8 + '" stroke-width="7"/>');
    parts.push('<path class="js-bolt" d="M168,16 L180,30 L174,30 L186,46 L170,28 L176,28 Z" fill="' + (st.boltOn ? C2 : C8) + '"/>');
    parts.push(txt(214, 30, '흥분 도착', 16, INK, 'start', '700'));
    parts.push(hit(58, 8, 350, 162));
    parts.push('</g>');

    for (i = 0; i < st.ves.length; i++) {
      p = st.ves[i];
      parts.push('<g class="js-ves" data-i="' + i + '" data-part="vesicle" transform="translate(' + n(p.x) + ',' + n(p.y) + ')">');
      parts.push('<ellipse class="js-ves-body" cx="0" cy="0" rx="13" ry="' + n(p.ry) + '" fill="' + C3S + '" stroke="' + C3 + '" stroke-width="1.75"/>');
      if (!VES[i].fuse) {
        parts.push('<circle cx="-4" cy="-2" r="2.2" fill="' + C3 + '"/>');
        parts.push('<circle cx="3" cy="2" r="2.2" fill="' + C3 + '"/>');
        parts.push('<circle cx="-1" cy="5" r="1.8" fill="' + C3 + '"/>');
      }
      parts.push(hit(-16, -16, 32, 32));
      parts.push('</g>');
    }

    for (i = 0; i < CA_XS.length; i++) parts.push(smallGate(CA_XS[i], st.caOpen));
    parts.push('<g data-part="ca_channel">' + txt(248, 64, 'Ca²⁺', 15, C6, 'middle', '700') + '</g>');

    parts.push('<g data-part="cleft">');
    parts.push('<rect x="58" y="174" width="346" height="42" fill="' + ELEV + '"/>');
    parts.push(txt(70, 200, '시냅스 틈', 16, INK, 'start', '700'));
    parts.push(hit(58, 172, 346, 46));
    parts.push('</g>');

    for (i = 0; i < st.cas.length; i++) {
      parts.push('<circle class="js-ca" data-i="' + i + '" data-part="ca_channel" cx="' + n(st.cas[i].x) + '" cy="' + n(st.cas[i].y) + '" r="5" fill="' + C6 + '"/>');
    }

    parts.push('<g data-part="postsynaptic">');
    parts.push('<path d="M' + n(SM.x0) + ',' + n(SM.y0) + ' Q' + n(SM.x1) + ',' + n(SM.y1) + ' ' + n(SM.x2) + ',' + n(SM.y2) + ' L' + n(SM.x2) + ',412 L' + n(SM.x0) + ',412 Z" fill="' + C6S + '" stroke="' + LINE + '" stroke-width="1.25"/>');
    parts.push('<path d="M' + n(SM.x0) + ',' + n(SM.y0) + ' Q' + n(SM.x1) + ',' + n(SM.y1) + ' ' + n(SM.x2) + ',' + n(SM.y2) + '" fill="none" stroke="' + C8 + '" stroke-width="4"/>');
    parts.push(txt(86, 292, st.depol ? '(+)' : '(−)', 16, st.depol ? C2 : C1, 'start', '700').replace('<text ', '<text class="js-ps-sign" '));
    parts.push(txt(132, 300, st.depol ? '(+)' : '(−)', 16, st.depol ? C2 : C1, 'start', '700').replace('<text ', '<text class="js-ps-sign" '));
    parts.push(txt(178, 292, st.depol ? '(+)' : '(−)', 16, st.depol ? C2 : C1, 'start', '700').replace('<text ', '<text class="js-ps-sign" '));
    vis = st.depol ? 'visible' : 'hidden';
    parts.push('<text class="js-depol" x="230" y="330" font-size="18" font-weight="700" fill="' + C2 + '" visibility="' + vis + '">탈분극</text>');
    parts.push(hit(58, 230, 370, 180));
    parts.push('</g>');

    for (i = 0; i < st.recs.length; i++) parts.push(cup(st.recs[i].x, st.recs[i].y, st.bound));

    ch = st.postCh;
    parts.push('<g data-part="receptor">');
    parts.push('<rect x="' + n(ch.x - 16) + '" y="' + n(ch.y - 8) + '" width="32" height="36" rx="6" fill="' + CARD + '" stroke="' + C2 + '" stroke-width="2.25"/>');
    parts.push('<rect x="' + n(ch.x - 6) + '" y="' + n(ch.y - 2) + '" width="12" height="24" rx="3" fill="' + ELEV + '"/>');
    parts.push('<rect class="js-ps-plug" x="' + n(ch.x - 7) + '" y="' + n(ch.y + 6) + '" width="14" height="10" rx="2" fill="' + C2 + '" visibility="' + (st.naOpen ? 'hidden' : 'visible') + '"/>');
    parts.push(txt(ch.x - 8, ch.y - 26, 'Na⁺', 15, C2, 'end', '700'));
    parts.push(hit(ch.x - 20, ch.y - 20, 44, 56));
    parts.push('</g>');

    for (i = 0; i < st.nts.length; i++) parts.push(diamond('js-nt', i, st.nts[i].x, st.nts[i].y));

    for (i = 0; i < st.nas.length; i++) {
      parts.push('<circle class="js-ps-na" data-i="' + i + '" data-part="postsynaptic" cx="' + n(st.nas[i].x) + '" cy="' + n(st.nas[i].y) + '" r="5" fill="' + C2 + '" visibility="' + (st.nas[i].on ? 'visible' : 'hidden') + '"/>');
    }

    parts.push('<g style="pointer-events:none">');
    parts.push('<line x1="492" y1="78" x2="492" y2="300" stroke="' + C4 + '" stroke-width="3.5"/>');
    parts.push('<path d="M492,316 L480,296 L504,296 Z" fill="' + C4 + '"/>');
    parts.push(txt(492, 346, '한 방향', 16, INK, 'middle', '700'));
    parts.push('</g>');
    return parts.join('');
  }

  /* ---------- update: 속성만 ---------- */

  function vis(el, on) {
    if (el) el.setAttribute('visibility', on ? 'visible' : 'hidden');
  }

  function updateStruct(ctx) {
    var st = pulseState(numOr(ctx.v.pulse, 0));
    var g = ctx.q('.js-spark');
    if (g) g.setAttribute('transform', sparkTf(st));
    return { readout: st.readout, active: st.active, follow: st.follow };
  }

  function updateAp(ctx) {
    var st = apState(numOr(ctx.v.t, 0.2));
    var line = ctx.q('.js-now-line');
    var dot = ctx.q('.js-now-dot');
    var lab = ctx.q('.js-now-lab');
    var i, list, el;
    if (line) {
      line.setAttribute('x1', n(st.mx));
      line.setAttribute('x2', n(st.mx));
    }
    if (dot) {
      dot.setAttribute('cx', n(st.mx));
      dot.setAttribute('cy', n(st.my));
    }
    if (lab) {
      lab.setAttribute('x', '528');
      lab.textContent = fmtMv(st.v) + ' mV';
    }
    vis(ctx.q('.js-na-plug'), !st.naOpen);
    vis(ctx.q('.js-k-plug'), !st.kOpen);
    list = ctx.qa('.js-na-flow');
    for (i = 0; i < list.length; i++) vis(list[i], st.naOpen);
    list = ctx.qa('.js-k-flow');
    for (i = 0; i < list.length; i++) vis(list[i], st.kOpen);
    el = ctx.q('.js-na-state');
    if (el) el.textContent = st.naOpen ? '열림' : '닫힘';
    el = ctx.q('.js-k-state');
    if (el) el.textContent = st.kOpen ? '열림' : '닫힘';
    list = ctx.qa('.js-na-ion');
    for (i = 0; i < list.length; i++) {
      el = list[i];
      var ion = st.naIons[Number(el.getAttribute('data-i'))];
      if (!ion) continue;
      el.setAttribute('cy', n(ion.y));
      vis(el, ion.on);
    }
    list = ctx.qa('.js-k-ion');
    for (i = 0; i < list.length; i++) {
      el = list[i];
      var kion = st.kIons[Number(el.getAttribute('data-i'))];
      if (!kion) continue;
      el.setAttribute('cy', n(kion.y));
      vis(el, kion.on);
    }
    list = ctx.qa('.js-charge');
    for (i = 0; i < list.length; i++) {
      list[i].textContent = st.charge;
      list[i].setAttribute('fill', st.chargeFill);
    }
    return { readout: st.readout, active: st.active, follow: st.follow };
  }

  function updateSyn(ctx) {
    var st = synState(numOr(ctx.v.s, 0));
    var i, list, el, p;
    var bolt = ctx.q('.js-bolt');
    if (bolt) bolt.setAttribute('fill', st.boltOn ? C2 : C8);
    list = ctx.qa('.js-ves');
    for (i = 0; i < list.length; i++) {
      el = list[i];
      p = st.ves[Number(el.getAttribute('data-i'))];
      if (!p) continue;
      el.setAttribute('transform', 'translate(' + n(p.x) + ',' + n(p.y) + ')');
      var body = el.querySelector('.js-ves-body');
      if (body) body.setAttribute('ry', n(p.ry));
    }
    list = ctx.qa('.js-ca-plug');
    for (i = 0; i < list.length; i++) vis(list[i], !st.caOpen);
    list = ctx.qa('.js-ca');
    for (i = 0; i < list.length; i++) {
      el = list[i];
      p = st.cas[Number(el.getAttribute('data-i'))];
      if (!p) continue;
      el.setAttribute('cx', n(p.x));
      el.setAttribute('cy', n(p.y));
    }
    list = ctx.qa('.js-nt');
    for (i = 0; i < list.length; i++) {
      el = list[i];
      p = st.nts[Number(el.getAttribute('data-i'))];
      if (!p) continue;
      el.setAttribute('transform', 'translate(' + n(p.x) + ',' + n(p.y) + ')');
    }
    list = ctx.qa('.js-rec');
    for (i = 0; i < list.length; i++) {
      var shape = list[i].querySelector('path');
      if (shape) shape.setAttribute('fill', st.bound ? C5 : C5S);
    }
    vis(ctx.q('.js-ps-plug'), !st.naOpen);
    list = ctx.qa('.js-ps-na');
    for (i = 0; i < list.length; i++) {
      el = list[i];
      p = st.nas[Number(el.getAttribute('data-i'))];
      if (!p) continue;
      el.setAttribute('cx', n(p.x));
      el.setAttribute('cy', n(p.y));
      vis(el, p.on);
    }
    list = ctx.qa('.js-ps-sign');
    for (i = 0; i < list.length; i++) {
      list[i].textContent = st.depol ? '(+)' : '(−)';
      list[i].setAttribute('fill', st.depol ? C2 : C1);
    }
    vis(ctx.q('.js-depol'), st.depol);
    return { readout: st.readout, active: st.active, follow: st.follow };
  }

  NMFIG.define('neuron', {
    viewBox: [560, 420],
    views: [
      { id: 'structure', label: '뉴런 구조' },
      { id: 'ap', label: '활동 전위' },
      { id: 'synapse', label: '시냅스' }
    ],
    controls: [
      { id: 'pulse', type: 'range', label: '흥분의 위치', min: 0, max: 1, step: 0.005, value: 0, views: ['structure'] },
      {
        id: 't', type: 'range', label: '시간', min: 0, max: 6, step: 0.02, value: 0.2, views: ['ap'],
        fmt: function (val) { return Number(val).toFixed(1) + ' ms'; }
      },
      { id: 's', type: 'range', label: '전달 진행', min: 0, max: 1, step: 0.005, value: 0, views: ['synapse'] }
    ],
    animate: [
      { control: 'pulse', from: 0, to: 1, duration: 7000, loop: true, views: ['structure'] },
      { control: 't', from: 0, to: 6, duration: 9000, loop: true, views: ['ap'] },
      { control: 's', from: 0, to: 1, duration: 8000, loop: true, views: ['synapse'] }
    ],
    render: function (v, view) {
      if (view === 'ap') return renderAp(v || {});
      if (view === 'synapse') return renderSyn(v || {});
      return renderStruct(v || {});
    },
    update: function (ctx) {
      if (ctx.view === 'ap') return updateAp(ctx);
      if (ctx.view === 'synapse') return updateSyn(ctx);
      return updateStruct(ctx);
    },
    _calc: function (v) {
      v = v || {};
      var t = numOr(v.t, 0.2);
      var p = numOr(v.pulse, 0);
      var s = numOr(v.s, 0);
      return { V: Vof(t), pulse: pulseState(p), ap: apState(t), syn: synState(s) };
    }
  });
})(window.NMFIG);
