/* ============================================================
   nanamate · 뇌 여행 — 영상처럼 흐르는 HTML 재생기
   anatomy-art.js 의 검수된 뇌 그림(옆면·정중 단면)을 복제해 입체 조명·글로우·심도·카메라 연출을 입힌다.
   장면 정의는 DOM 없이 window.NMBrainTour.scenes 로 노출한다(테스트용).
   ============================================================ */
(function () {
  'use strict';

  var ASPECT = 16 / 9;
  var OVERVIEW = { x: -177, y: -36, w: 1154, h: 649 };

  /* view: side=옆면, mid=정중 단면 · focus: 켜질 부위(묶음 키 가능) · cam: 카메라가 담을 부위(없으면 전체)
     seq: 시간 순서로 차례 강조 · fx: reflex | hormone · memo: 어원 한 줄을 읽어 올 부위 키 */
  var SCENES = [
    { id: 'intro', view: 'side', dur: 7, label: '시작', title: '사람의 뇌', en: 'The Human Brain',
      text: '약 1.4 kg, 신경 세포 수백억 개가 만드는 사령탑. 부위마다 맡은 일이 다르고, 이름에는 그 단서가 들어 있습니다.' },
    { id: 'frontal', view: 'side', dur: 6.5, label: '전두엽', focus: ['frontal'], cam: ['frontal'], memo: 'frontal',
      text: '전두엽(前頭葉) — 이마 쪽 잎. 계획·판단·수의 운동 명령을 내립니다.' },
    { id: 'parietal', view: 'side', dur: 6.5, label: '두정엽', focus: ['parietal'], cam: ['parietal'], memo: 'parietal',
      text: '두정엽(頭頂葉) — 정수리 아래. 촉각·통증 같은 몸 감각과 공간 지각을 맡습니다.' },
    { id: 'temporal', view: 'side', dur: 6.5, label: '측두엽', focus: ['temporal'], cam: ['temporal'], memo: 'temporal',
      text: '측두엽(側頭葉) — 옆머리 잎. 소리를 듣고 말을 이해하며, 안쪽에는 기억의 해마가 있습니다.' },
    { id: 'occipital', view: 'side', dur: 6, label: '후두엽', focus: ['occipital'], cam: ['occipital'], memo: 'occipital',
      text: '후두엽(後頭葉) — 뒤통수 잎. 눈으로 들어온 정보를 ‘본다’는 경험으로 만듭니다.' },
    { id: 'cerebellum', view: 'side', dur: 7.5, label: '소뇌·뇌줄기', focus: ['cerebellum', 'brainstem'], cam: ['cerebellum', 'brainstem'], memo: 'cerebellum',
      title: '소뇌와 뇌줄기', en: 'Cerebellum & Brainstem',
      text: '소뇌(小腦)는 ‘작은 뇌’ — 몸의 균형과 운동의 정교한 협응. 뇌줄기는 생명 유지의 기둥입니다.' },
    { id: 'cut', view: 'mid', dur: 5.5, label: '단면', title: '정중 단면', en: 'Midsagittal Section',
      text: '이제 뇌를 반으로 잘라 안쪽을 봅니다.' },
    { id: 'cortex', view: 'mid', dur: 7.5, label: '겉질·뇌량', focus: ['cerebrum', 'corpus_callosum'], cam: ['cerebrum'], memo: 'corpus_callosum',
      title: '대뇌 겉질과 뇌량', en: 'Cortex & Corpus callosum',
      text: '겉(회색질)에 신경 세포체가 모여 있고 속은 흰 축삭(백색질)입니다. 뇌량(腦梁)은 좌우를 잇는 ‘대들보’.' },
    { id: 'dien', view: 'mid', dur: 8, label: '간뇌', focus: ['diencephalon'], cam: ['diencephalon'], memo: 'diencephalon',
      text: '간뇌(間腦)는 ‘사이 뇌’. 시상은 감각의 중간 정류장, 시상 하부는 체온·혈당·삼투압 조절의 총사령관입니다.' },
    { id: 'pit', view: 'mid', dur: 8, label: '뇌하수체', focus: ['hypothalamus', 'pituitary'], cam: ['hypothalamus', 'pituitary'], memo: 'pituitary', fx: 'hormone',
      title: '시상 하부와 뇌하수체', en: 'Hypothalamus → Pituitary',
      text: '시상 하부가 방출 호르몬으로 뇌하수체(腦下垂體, ‘뇌 아래 매달린 몸’)를 지휘합니다. 신경계와 내분비계의 접점입니다.' },
    { id: 'stem', view: 'mid', dur: 8.4, label: '뇌줄기·척수', cam: ['midbrain', 'pons', 'medulla', 'spinal_cord'],
      seq: ['midbrain', 'pons', 'medulla', 'spinal_cord'],
      text: '중간뇌=동공 반사, 뇌교(腦橋)=대뇌와 소뇌를 잇는 ‘다리’, 연수(延髓)=호흡·심장 박동, 척수=무릎 반사.' },
    { id: 'reflex', view: 'mid', dur: 9, label: '무릎 반사', focus: ['spinal_cord'], noDim: true, cam: ['spinal_cord', 'medulla', 'pons', 'midbrain', 'thalamus', 'cerebrum'], memo: 'spinal_cord', fx: 'reflex',
      title: '무릎 반사', en: 'Knee-jerk reflex',
      text: '무릎 반사는 대뇌를 거치지 않고 척수에서 끝납니다. 알아차리는 건 그 뒤입니다.' },
    { id: 'outro', view: 'mid', dur: 7.5, label: '정리', seq: ['cerebrum', 'cerebellum', 'diencephalon', 'midbrain', 'medulla', 'spinal_cord'],
      title: '이름이 알려 주는 기능', en: 'Names are clues',
      text: '기능과 위치는 이름이 알려 줍니다 — 이름의 뜻을 기억하세요.' }
  ];

  var TOTAL = 0;
  SCENES.forEach(function (s) { s.t0 = TOTAL; TOTAL += s.dur; });

  window.NMBrainTour = { scenes: SCENES, total: TOTAL };

  if (typeof document === 'undefined') return;

  /* ───────── 유틸 ───────── */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function svgEl(tag, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function reduced() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function hexRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function mix(rgb, to, k) {
    return 'rgb(' + rgb.map(function (c, i) { return Math.round(c + (to[i] - c) * k); }).join(',') + ')';
  }

  var uid = 0;

  function fmtTime(s) {
    s = Math.floor(s);
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  /* ───────── 재생기 ───────── */
  function mount(host) {
    var A = window.ANATOMY_ART, D = window.ANATOMY_DATA;
    if (!A || !D || !A.brainSide || !A.brainMid) {
      host.textContent = '뇌 그림 데이터를 불러오지 못했습니다.';
      return;
    }
    var pre = 'bt' + (++uid) + '-';
    var root = el('div', 'bt');
    var wrap = el('div', 'bt-wrap');
    var stage = el('div', 'bt-stage');
    var tilt = el('div', 'bt-tilt');
    var dust = el('div', 'bt-dust');
    var i;
    for (i = 0; i < 26; i++) {
      var d = el('i');
      d.style.cssText = 'left:' + (Math.random() * 100).toFixed(1) + '%;top:' + (Math.random() * 100).toFixed(1) +
        '%;--s:' + (1 + Math.random() * 2.4).toFixed(1) + 'px;--d:' + (9 + Math.random() * 14).toFixed(1) +
        's;--o:' + (0.15 + Math.random() * 0.45).toFixed(2) + ';animation-delay:-' + (Math.random() * 14).toFixed(1) + 's';
      dust.appendChild(d);
    }

    /* SVG + 두 층(옆면/정중) */
    var svg = svgEl('svg', { 'class': 'bt-svg', viewBox: '0 0 800 580', preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' });
    var defs = svgEl('defs', {});
    svg.appendChild(defs);
    var glowF = svgEl('filter', { id: pre + 'glow', x: '-30%', y: '-30%', width: '160%', height: '160%' });
    var glowE = svgEl('feDropShadow', { dx: 0, dy: 0, stdDeviation: 7, 'flood-color': '#5eead4', 'flood-opacity': 0.95 });
    glowF.appendChild(glowE);
    defs.appendChild(glowF);
    var layers = {};
    ['side', 'mid'].forEach(function (v) {
      var g = svgEl('g', { 'class': 'bt-layer bt-' + v });
      g.innerHTML = v === 'side' ? A.brainSide : A.brainMid; /* 정적 그림 마크업(데이터 문자열 아님) */
      svg.appendChild(g);
      layers[v] = g;
    });
    var fx = svgEl('g', { 'class': 'bt-fx', 'pointer-events': 'none', filter: 'url(#' + pre + 'glow)' });
    svg.appendChild(fx);

    /* 평평한 색 → 입체 그라데이션 */
    var gradN = 0;
    var gradCache = {};
    function gradFor(hex) {
      var key = hex.toLowerCase();
      if (gradCache[key]) return gradCache[key];
      var id = pre + 'g' + (++gradN);
      var rgb = hexRgb(key);
      var g = svgEl('radialGradient', { id: id, cx: '0.34', cy: '0.28', r: '0.95' });
      [[0, mix(rgb, [255, 255, 255], 0.38)], [0.5, mix(rgb, [255, 255, 255], 0.02)], [1, mix(rgb, [8, 10, 22], 0.52)]].forEach(function (st) {
        g.appendChild(svgEl('stop', { offset: st[0], 'stop-color': st[1] }));
      });
      defs.appendChild(g);
      gradCache[key] = 'url(#' + id + ')';
      return gradCache[key];
    }
    function isHex(v) { return typeof v === 'string' && /^#[0-9a-fA-F]{3,6}$/.test(v); }
    ['side', 'mid'].forEach(function (v) {
      var parts = layers[v].querySelectorAll('.ax-part');
      Array.prototype.forEach.call(parts, function (p) {
        var base = p.getAttribute('fill');
        Array.prototype.forEach.call(p.querySelectorAll('path, ellipse, circle'), function (n) {
          if (n.closest('.ax-deco')) return;
          var own = n.getAttribute('fill');
          var col = isHex(own) ? own : (own == null && isHex(base) ? base : null);
          if (col) n.setAttribute('fill', gradFor(col));
        });
        if (isHex(base)) p.setAttribute('fill', gradFor(base));
        if (p.classList.contains('ax-lateral')) p.style.display = 'none';
      });
    });

    /* 부위 조회 */
    function expand(keys) {
      var out = [];
      (keys || []).forEach(function (k) {
        var m = D.groups && D.groups[k];
        if (m) m.forEach(function (x) { out.push(x); });
        else out.push(k);
      });
      return out;
    }
    function groupsOf(view, keys) {
      /* 그림에 그 키의 도형이 있으면 그것을, 없으면(묶음 키) 구성원 도형들을 쓴다 */
      var out = [];
      (keys || []).forEach(function (k) {
        var direct = layers[view].querySelectorAll('[data-part="' + k + '"]');
        if (direct.length) {
          Array.prototype.forEach.call(direct, function (n) { out.push(n); });
          return;
        }
        expand([k]).forEach(function (m) {
          Array.prototype.forEach.call(layers[view].querySelectorAll('[data-part="' + m + '"]'), function (n) { out.push(n); });
        });
      });
      return out;
    }
    function bboxOf(nodes) {
      var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, ok = false;
      nodes.forEach(function (n) {
        try {
          var b = n.getBBox();
          if (!b.width && !b.height) return;
          ok = true;
          x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
          x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height);
        } catch (e) {}
      });
      return ok ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
    }
    function camFor(sc) {
      if (!sc.cam) return OVERVIEW;
      var b = bboxOf(groupsOf(sc.view, sc.cam));
      if (!b) return OVERVIEW;
      var pad = Math.max(b.w, b.h) * 0.2 + 16;
      var w0 = b.w + pad * 2, h0 = b.h + pad * 2;
      var h = Math.max(h0 / 0.84, w0 / ASPECT, 300);
      var w = h * ASPECT;
      return { x: b.x + b.w / 2 - w / 2, y: b.y - pad, w: w, h: h };
    }
    function centerOf(view, keys) {
      var b = bboxOf(groupsOf(view, keys));
      return b ? [b.x + b.w / 2, b.y + b.h / 2] : null;
    }

    stage.appendChild(dust);
    tilt.appendChild(svg);
    stage.appendChild(tilt);

    /* 오버레이: 제목 · 자막 · 포스터 · 와이프 */
    var tag = el('div', 'bt-tag', '뇌 여행');
    var count = el('span', 'bt-count');
    tag.appendChild(count);
    var titleBox = el('div', 'bt-title');
    var titleH = el('b');
    var titleEn = el('span');
    titleBox.appendChild(titleH);
    titleBox.appendChild(titleEn);
    var cap = el('div', 'bt-cap');
    var capText = el('p', 'bt-cap-t');
    var capMemo = el('p', 'bt-cap-m');
    cap.appendChild(capText);
    cap.appendChild(capMemo);
    var wipe = el('div', 'bt-wipe');
    var poster = el('button', 'bt-poster');
    poster.type = 'button';
    poster.setAttribute('aria-label', '뇌 여행 재생');
    var pTitle = el('b', 'bt-poster-t', '뇌 여행');
    var pSub = el('span', 'bt-poster-s', '부위 이름의 뜻까지 · 약 ' + Math.round(TOTAL / 10) * 10 + '초');
    var pPlay = el('i', 'bt-poster-p');
    pPlay.textContent = '▶';
    poster.appendChild(pPlay);
    poster.appendChild(pTitle);
    poster.appendChild(pSub);
    stage.appendChild(wipe);
    stage.appendChild(tag);
    stage.appendChild(titleBox);
    stage.appendChild(cap);
    stage.appendChild(poster);

    /* 컨트롤 */
    var bar = el('div', 'bt-bar');
    function btn(label, aria, cls) {
      var b = el('button', 'bt-btn' + (cls ? ' ' + cls : ''), label);
      b.type = 'button';
      b.setAttribute('aria-label', aria);
      return b;
    }
    var bPrev = btn('⏮', '이전 장면');
    var bPlay = btn('▶', '재생', 'bt-play');
    var bNext = btn('⏭', '다음 장면');
    var track = el('div', 'bt-track');
    track.setAttribute('role', 'slider');
    track.setAttribute('aria-label', '재생 위치');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', String(Math.round(TOTAL)));
    track.tabIndex = 0;
    var fill = el('div', 'bt-fill');
    track.appendChild(fill);
    SCENES.forEach(function (s, idx) {
      if (!idx) return;
      var tk = el('i', 'bt-tick');
      tk.style.left = (s.t0 / TOTAL * 100) + '%';
      track.appendChild(tk);
    });
    var timeEl = el('span', 'bt-time', '0:00');
    var bSpeed = btn('1×', '재생 속도', 'bt-speed');
    var bFull = btn('⛶', '전체화면');
    [bPrev, bPlay, bNext, track, timeEl, bSpeed, bFull].forEach(function (n) { bar.appendChild(n); });
    var chips = el('div', 'bt-chips');
    var chipEls = SCENES.map(function (s, idx) {
      var c = el('button', 'bt-chip', s.label || s.title);
      c.type = 'button';
      c.addEventListener('click', function () { seekScene(idx, true); });
      chips.appendChild(c);
      return c;
    });
    wrap.appendChild(stage);
    wrap.appendChild(bar);
    wrap.appendChild(chips);
    root.appendChild(wrap);
    host.textContent = '';
    host.appendChild(root);

    /* ───────── 상태 ───────── */
    var T = 0;
    var playing = false;
    var userPaused = false;
    var ended = false;
    var started = false;
    var speed = 1;
    var visible = false;
    var lastIdx = -1;
    var lastTs = 0;
    var cams = SCENES.map(function () { return OVERVIEW; });
    var seqKey = '';
    var flows = [];
    var ping = null;

    function recomputeCams() {
      cams = SCENES.map(camFor);
    }
    recomputeCams();

    function sceneAt(t) {
      for (var k = SCENES.length - 1; k >= 0; k--) if (t >= SCENES[k].t0) return k;
      return 0;
    }
    function memoOf(key) {
      var p = D.parts && D.parts[key];
      return p && p.etym && p.etym.memo ? p.etym.memo : '';
    }
    function nameOf(key) {
      var p = D.parts && D.parts[key];
      return p ? { n: p.name, en: p.en } : null;
    }
    function typeIn(node, text) {
      node.textContent = text;
      node.classList.remove('bt-in');
      void node.offsetWidth;
      node.classList.add('bt-in');
    }

    function setFocus(sc, litKeys) {
      var lit = groupsOf(sc.view, litKeys);
      ['side', 'mid'].forEach(function (v) {
        Array.prototype.forEach.call(layers[v].querySelectorAll('.ax-part'), function (p) {
          var on = v === sc.view && lit.indexOf(p) !== -1;
          p.classList.toggle('is-lit', on);
          p.classList.toggle('is-dim', v === sc.view && lit.length > 0 && !on && !sc.noDim);
          p.style.filter = on ? 'url(#' + pre + 'glow)' : '';
        });
      });
    }

    function enterScene(idx) {
      var sc = SCENES[idx];
      var prev = lastIdx >= 0 ? SCENES[lastIdx] : null;
      lastIdx = idx;
      seqKey = '';
      if (!prev || prev.view !== sc.view) {
        layers.side.classList.toggle('is-on', sc.view === 'side');
        layers.mid.classList.toggle('is-on', sc.view === 'mid');
        if (prev) {
          wipe.classList.remove('go');
          void wipe.offsetWidth;
          wipe.classList.add('go');
        }
      }
      while (fx.firstChild) fx.removeChild(fx.firstChild);
      flows = [];
      ping = null;
      var firstKey = sc.focus && sc.focus[0];
      var nm = sc.title ? { n: sc.title, en: sc.en || '' } : (firstKey ? nameOf(sc.focus[0]) : null);
      if (sc.id === 'stem') nm = { n: '뇌줄기와 척수', en: 'Brainstem & Spinal cord' };
      titleH.textContent = nm ? nm.n : '';
      titleEn.textContent = nm ? nm.en : '';
      titleBox.classList.remove('bt-in');
      void titleBox.offsetWidth;
      titleBox.classList.add('bt-in');
      typeIn(capText, sc.text);
      var memo = sc.memo ? memoOf(sc.memo) : '';
      capMemo.textContent = memo ? '💡 ' + memo : '';
      capMemo.style.display = memo ? '' : 'none';
      count.textContent = ' · ' + ('0' + (idx + 1)).slice(-2) + ' / ' + SCENES.length;
      chipEls.forEach(function (c, k) { c.classList.toggle('is-on', k === idx); });
      setFocus(sc, sc.focus || []);
      if (sc.fx === 'reflex') buildReflex();
      if (sc.fx === 'hormone') buildHormone();
    }

    /* ───────── 신호 연출 ───────── */
    function makeFlow(pts, color, n, r) {
      var segs = [], total = 0, k;
      for (k = 0; k < pts.length - 1; k++) {
        var l = Math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]);
        segs.push(l);
        total += l;
      }
      var dots = [];
      for (k = 0; k < n; k++) {
        var c = svgEl('circle', { r: r, fill: color, opacity: 0 });
        fx.appendChild(c);
        dots.push(c);
      }
      var f = { pts: pts, segs: segs, total: total, dots: dots, r: r };
      flows.push(f);
      return f;
    }
    function pointAt(f, s) {
      var d = clamp(s, 0, 1) * f.total, k = 0;
      while (k < f.segs.length - 1 && d > f.segs[k]) { d -= f.segs[k]; k++; }
      var a = f.pts[k], b = f.pts[k + 1], u = f.segs[k] ? d / f.segs[k] : 0;
      return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
    }
    function drawFlow(f, s) { /* s: 머리 위치(0~1), 꼬리는 뒤따른다 */
      for (var k = 0; k < f.dots.length; k++) {
        var ss = s - k * 0.014;
        var c = f.dots[k];
        if (s <= 0 || s >= 1.06 || ss < 0) { c.setAttribute('opacity', 0); continue; }
        var p = pointAt(f, ss);
        c.setAttribute('cx', p[0].toFixed(1));
        c.setAttribute('cy', p[1].toFixed(1));
        c.setAttribute('r', (f.r * (1 - k / f.dots.length * 0.75)).toFixed(2));
        c.setAttribute('opacity', (0.95 * (1 - k / f.dots.length)).toFixed(2));
      }
    }
    function addPing(x, y, color) {
      var c = svgEl('circle', { cx: x, cy: y, r: 6, fill: 'none', stroke: color, 'stroke-width': 2.2, opacity: 0 });
      fx.appendChild(c);
      return c;
    }
    function buildReflex() {
      var up = [[428, 580], [428, 540], [426, 502], [424, 470], [422, 430], [424, 392], [432, 352], [440, 316], [432, 290], [420, 250], [410, 200], [402, 150], [400, 104]];
      var down = [[426, 504], [429, 540], [429, 580]];
      flows.push({ kind: 'up', f: makeFlow(up, '#5eead4', 12, 8) });
      flows.push({ kind: 'down', f: makeFlow(down, '#f472b6', 12, 8) });
      flows.push({ kind: 'ping1', p: addPing(426, 504, '#f472b6') });
      flows.push({ kind: 'ping2', p: addPing(400, 118, '#5eead4') });
    }
    function buildHormone() {
      var a = centerOf('mid', ['hypothalamus']) || [332, 288];
      var b = centerOf('mid', ['pituitary']) || [322, 348];
      var route = [[a[0], a[1]], [a[0] - 2, lerp(a[1], b[1], 0.4)], [b[0] + 5, lerp(a[1], b[1], 0.72)], [b[0], b[1]]];
      for (var k = 0; k < 3; k++) flows.push({ kind: 'hor', phase: k / 3, f: makeFlow(route, '#fbbf24', 9, 4.4) });
      flows.push({ kind: 'ping3', p: addPing(a[0], a[1], '#fbbf24') });
    }
    function updateFx(sc, lt) {
      var k;
      for (k = 0; k < flows.length; k++) {
        var o = flows[k];
        if (o.kind === 'up') drawFlow(o.f, clamp((lt - 1.2) / 5.2, 0, 1.08));
        else if (o.kind === 'down') drawFlow(o.f, clamp((lt - 2.3) / 1.0, 0, 1.08));
        else if (o.kind === 'ping1' || o.kind === 'ping2' || o.kind === 'ping3') {
          var start = o.kind === 'ping1' ? 2.2 : o.kind === 'ping2' ? 6.1 : 0.8;
          var u = o.kind === 'ping3' ? ((lt - start) % 2) / 2 : (lt - start) / 1.4;
          if (lt < start || u > 1) { o.p.setAttribute('opacity', 0); continue; }
          o.p.setAttribute('r', (6 + u * 38).toFixed(1));
          o.p.setAttribute('opacity', (0.9 * (1 - u)).toFixed(2));
        } else if (o.kind === 'hor') {
          var s = ((lt - 0.9) / 1.7 + o.phase) % 1;
          drawFlow(o.f, lt < 0.9 ? 0 : s);
        }
      }
    }

    /* ───────── 프레임 ───────── */
    function frame(ts) {
      requestAnimationFrame(frame);
      if (!visible && !playing) { lastTs = ts; return; }
      var dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
      lastTs = ts;
      if (playing) {
        T += dt * speed;
        if (T >= TOTAL) { T = TOTAL - 0.001; playing = false; ended = true; syncButtons(); }
      }
      render(ts / 1000);
    }

    function render(clock) {
      var idx = sceneAt(T);
      if (idx !== lastIdx) enterScene(idx);
      var sc = SCENES[idx];
      var lt = T - sc.t0;
      /* 카메라: 이전 장면 → 이번 장면 */
      var from = idx > 0 ? cams[idx - 1] : OVERVIEW;
      var to = cams[idx];
      var e = (idx === 0 && !started) ? 1 : ease(lt / 1.4);
      var cx = lerp(from.x + from.w / 2, to.x + to.w / 2, e);
      var cy = lerp(from.y + from.h / 2, to.y + to.h / 2, e);
      var w = lerp(from.w, to.w, e);
      var h = w / ASPECT;
      var calm = reduced();
      var ck = calm ? 0 : clock;
      cx += Math.sin(ck * 0.35) * w * 0.007;
      cy += Math.cos(ck * 0.27) * h * 0.007;
      var z = 1 + Math.sin(ck * 0.2) * 0.008;
      w *= z; h *= z;
      svg.setAttribute('viewBox', (cx - w / 2).toFixed(1) + ' ' + (cy - h / 2).toFixed(1) + ' ' + w.toFixed(1) + ' ' + h.toFixed(1));
      if (!calm) {
        tilt.style.transform = 'perspective(1400px) rotateY(' + (Math.sin(ck * 0.3) * 1.7).toFixed(2) + 'deg) rotateX(' + (Math.cos(ck * 0.22) * 0.8).toFixed(2) + 'deg)';
      }
      glowE.setAttribute('stdDeviation', (7 + Math.sin(clock * 3.2) * 2.4).toFixed(1));
      /* 시간 순 강조 */
      if (sc.seq) {
        var per = sc.dur / sc.seq.length;
        var si = Math.min(sc.seq.length - 1, Math.floor(lt / per));
        var k = sc.seq[si];
        if (k !== seqKey) {
          seqKey = k;
          setFocus(sc, [k]);
          var nm = nameOf(k);
          if (nm && sc.id !== 'outro') {
            titleH.textContent = nm.n;
            titleEn.textContent = nm.en;
          }
          if (sc.id === 'outro' && nm) { titleEn.textContent = nm.n + ' · ' + nm.en; }
          var m = memoOf(k);
          capMemo.textContent = m ? '💡 ' + m : '';
          capMemo.style.display = m ? '' : 'none';
        }
      }
      updateFx(sc, lt);
      fill.style.width = (T / TOTAL * 100).toFixed(2) + '%';
      track.setAttribute('aria-valuenow', String(Math.round(T)));
      timeEl.textContent = fmtTime(T) + ' / ' + fmtTime(TOTAL);
    }

    /* ───────── 조작 ───────── */
    function syncButtons() {
      bPlay.textContent = playing ? '⏸' : (ended ? '↺' : '▶');
      bPlay.setAttribute('aria-label', playing ? '일시정지' : (ended ? '다시 보기' : '재생'));
      poster.style.display = started ? 'none' : '';
      root.classList.toggle('is-playing', playing);
    }
    function play(byUser) {
      if (ended) { T = 0; ended = false; lastIdx = -1; }
      started = true;
      playing = true;
      if (byUser) userPaused = false;
      syncButtons();
    }
    function pause(byUser) {
      playing = false;
      if (byUser) userPaused = true;
      syncButtons();
    }
    function seekScene(idx, byUser) {
      idx = clamp(idx, 0, SCENES.length - 1);
      T = SCENES[idx].t0 + 0.001;
      ended = false;
      started = true;
      lastIdx = -1;
      if (byUser) play(true); else syncButtons();
      render(performance.now() / 1000);
    }
    bPlay.addEventListener('click', function () { if (playing) pause(true); else play(true); });
    poster.addEventListener('click', function () { play(true); });
    bPrev.addEventListener('click', function () {
      var idx = sceneAt(T);
      seekScene(T - SCENES[idx].t0 > 2 ? idx : idx - 1, true);
    });
    bNext.addEventListener('click', function () { seekScene(sceneAt(T) + 1, true); });
    bSpeed.addEventListener('click', function () {
      speed = speed === 1 ? 1.5 : speed === 1.5 ? 0.75 : 1;
      bSpeed.textContent = (speed === 0.75 ? '0.75' : speed) + '×';
    });
    bFull.addEventListener('click', function () {
      var f = root.requestFullscreen || root.webkitRequestFullscreen;
      if (document.fullscreenElement) document.exitFullscreen();
      else if (f) f.call(root);
    });
    if (!(root.requestFullscreen || root.webkitRequestFullscreen)) bFull.style.display = 'none';
    document.addEventListener('fullscreenchange', function () {
      root.classList.toggle('is-full', document.fullscreenElement === root);
      recomputeCams();
      lastIdx = -1;
    });

    function scrub(ev) {
      var r = track.getBoundingClientRect();
      T = clamp((ev.clientX - r.left) / r.width, 0, 0.9999) * TOTAL;
      ended = false;
      started = true;
      lastIdx = -1;
      render(performance.now() / 1000);
    }
    var dragging = false;
    track.addEventListener('pointerdown', function (ev) {
      dragging = true;
      track.setPointerCapture(ev.pointerId);
      scrub(ev);
    });
    track.addEventListener('pointermove', function (ev) { if (dragging) scrub(ev); });
    track.addEventListener('pointerup', function () { dragging = false; });
    track.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight') { seekScene(sceneAt(T) + 1, true); ev.preventDefault(); }
      if (ev.key === 'ArrowLeft') { seekScene(sceneAt(T) - 1, true); ev.preventDefault(); }
    });
    root.addEventListener('keydown', function (ev) {
      if (ev.key === ' ' && ev.target === root) { ev.preventDefault(); if (playing) pause(true); else play(true); }
    });
    root.tabIndex = 0;

    /* 화면에 70% 이상 보이면 자동 재생(사용자가 멈췄으면 존중) */
    /* 화면에 대부분 보이면 자동 재생(사용자가 멈췄으면 존중). 조상 요소의 overflow 때문에 IO 비율이 낮게 나오는 페이지가 있어
       비율 대신 실제 사각형으로 판단한다. */
    function checkView() {
      var r = stage.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      visible = r.bottom > 0 && r.top < vh;
      var shown = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      var good = r.height > 0 && shown / Math.min(r.height, vh) >= 0.7;
      if (good && !userPaused && !ended && !reduced() && !playing) play(false);
      else if (!visible && playing) pause(false);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(checkView, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }).observe(stage);
    }
    var scrollQueued = false;
    window.addEventListener('scroll', function () {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(function () { scrollQueued = false; checkView(); });
    }, { passive: true });

    layers.side.classList.add('is-on');
    syncButtons();
    enterScene(0);
    render(0);
    checkView();
    requestAnimationFrame(frame);
  }

  function init() {
    var hosts = document.querySelectorAll('[data-braintour]');
    Array.prototype.forEach.call(hosts, function (h) {
      if (h.getAttribute('data-bt-ready')) return;
      h.setAttribute('data-bt-ready', '1');
      mount(h);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
