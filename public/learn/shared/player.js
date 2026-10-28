/* ============================================================
   nanamate · 그림 재생기 — 장면을 영상처럼 흘려 보여 주는 HTML 재생기의 뼈대
   장면 묶음은 shared/players/<이름>.js 가 window.NM_PLAYERS[이름] 에 넣고, 페이지의 <div data-player="이름"> 자리에 띄운다.
   (그 파일을 이 파일보다 먼저 불러온다.) 조작은 뇌 여행 재생기와 같다: 포스터 → 재생 · 장면 칩 · 속도 · 전체화면 · 화면에 보이면 자동 재생.
   def = { title, sub, tag, scenes: [{ label, title, sub, dur, text, memo }],
           setup(box) → { show(sc, idx, lt, jump) } }   // show 는 매 프레임: lt = 장면 안 시각, jump = 끊어서(애니메이션 없이) 그릴 때
   ============================================================ */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function fmt(s) { s = Math.floor(s); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  function mount(host, def) {
    var SC = def.scenes;
    var TOTAL = 0;
    SC.forEach(function (s) { s.t0 = TOTAL; TOTAL += s.dur; });

    var root = el('div', 'pl');
    var stage = el('div', 'pl-stage');
    var box = el('div', 'pl-box');
    var head = el('div', 'pl-head');
    var tag = el('p', 'pl-tag', def.tag || '');
    var count = el('span', 'pl-count');
    tag.appendChild(count);
    var titleBox = el('p', 'pl-title');
    var titleB = el('b');
    var titleS = el('span');
    titleBox.appendChild(titleB);
    titleBox.appendChild(titleS);
    head.appendChild(tag);
    head.appendChild(titleBox);
    var dock = el('div', 'pl-dock');
    var capT = el('p', 'pl-cap-t');
    var capM = el('p', 'pl-cap-m');
    dock.appendChild(capT);
    dock.appendChild(capM);
    var poster = el('button', 'pl-poster');
    poster.type = 'button';
    poster.setAttribute('aria-label', (def.title || '재생기') + ' 재생');
    var pPlay = el('i', 'pl-poster-p', '▶');
    poster.appendChild(pPlay);
    poster.appendChild(el('b', 'pl-poster-t', def.title || ''));
    poster.appendChild(el('span', 'pl-poster-s', (def.sub ? def.sub + ' · ' : '') + '약 ' + (TOTAL >= 90 ? Math.round(TOTAL / 30) / 2 + '분' : Math.round(TOTAL / 10) * 10 + '초')));
    stage.appendChild(box);
    stage.appendChild(head);
    stage.appendChild(dock);
    stage.appendChild(poster);

    var bar = el('div', 'pl-bar');
    function btn(label, aria, cls) {
      var b = el('button', 'pl-btn' + (cls ? ' ' + cls : ''), label);
      b.type = 'button';
      b.setAttribute('aria-label', aria);
      return b;
    }
    var bPrev = btn('⏮', '이전 장면');
    var bPlay = btn('▶', '재생', 'pl-play');
    var bNext = btn('⏭', '다음 장면');
    var track = el('div', 'pl-track');
    track.setAttribute('role', 'slider');
    track.setAttribute('aria-label', '재생 위치');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', String(Math.round(TOTAL)));
    track.tabIndex = 0;
    var fill = el('div', 'pl-fill');
    track.appendChild(fill);
    SC.forEach(function (s, i) {
      if (!i) return;
      var tk = el('i', 'pl-tick');
      tk.style.left = (s.t0 / TOTAL * 100) + '%';
      track.appendChild(tk);
    });
    var timeEl = el('span', 'pl-time', '0:00');
    var bSpeed = btn('1×', '재생 속도', 'pl-speed');
    var bFull = btn('⛶', '전체화면');
    [bPrev, bPlay, bNext, track, timeEl, bSpeed, bFull].forEach(function (n) { bar.appendChild(n); });
    var chips = el('div', 'pl-chips');
    var chipEls = SC.map(function (s, i) {
      var c = el('button', 'pl-chip', s.label || s.title);
      c.type = 'button';
      c.addEventListener('click', function () { seekScene(i, true); });
      chips.appendChild(c);
      return c;
    });
    var wrap = el('div', 'pl-wrap');
    wrap.appendChild(stage);
    wrap.appendChild(bar);
    wrap.appendChild(chips);
    root.appendChild(wrap);
    host.textContent = '';
    host.appendChild(root);

    var view = def.setup(box);

    /* ───────── 상태 ───────── */
    var T = 0, playing = false, userPaused = false, ended = false, started = false, speed = 1;
    var lastIdx = -1, jumpNext = true, lastTs = 0;

    function sceneAt(t) {
      for (var k = SC.length - 1; k >= 0; k--) if (t >= SC[k].t0) return k;
      return 0;
    }
    function enter(idx) {
      var sc = SC[idx];
      lastIdx = idx;
      titleB.textContent = sc.title || sc.label || '';
      titleS.textContent = sc.sub || '';
      count.textContent = ' · ' + ('0' + (idx + 1)).slice(-2) + ' / ' + SC.length;
      capT.textContent = sc.text || '';
      capM.textContent = sc.memo ? '💡 ' + sc.memo : '';
      capM.style.display = sc.memo ? '' : 'none';
      [titleBox, capT, box].forEach(function (n) {
        n.classList.remove('pl-in');
        void n.offsetWidth;
        n.classList.add('pl-in');
      });
      chipEls.forEach(function (c, k) { c.classList.toggle('is-on', k === idx); });
    }
    function render() {
      var idx = sceneAt(T);
      var jump = jumpNext;
      if (idx !== lastIdx) { enter(idx); jump = true; }
      jumpNext = false;
      view.show(SC[idx], idx, T - SC[idx].t0, jump);
      fill.style.width = (T / TOTAL * 100).toFixed(2) + '%';
      track.setAttribute('aria-valuenow', String(Math.round(T)));
      timeEl.textContent = fmt(T) + ' / ' + fmt(TOTAL);
    }
    function frame(ts) {
      var dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0;
      lastTs = ts;
      if (playing) {
        T += dt * speed;
        if (T >= TOTAL) { T = TOTAL - 0.001; playing = false; ended = true; syncButtons(); }
        render();
      }
      requestAnimationFrame(frame);
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
      idx = clamp(idx, 0, SC.length - 1);
      T = SC[idx].t0 + 0.001;
      ended = false;
      started = true;
      lastIdx = -1;
      jumpNext = true;
      if (byUser) play(true); else syncButtons();
      render();
    }
    bPlay.addEventListener('click', function () { if (playing) pause(true); else play(true); });
    poster.addEventListener('click', function () { play(true); });
    bPrev.addEventListener('click', function () {
      var idx = sceneAt(T);
      seekScene(T - SC[idx].t0 > 2 ? idx : idx - 1, true);
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
      jumpNext = true;
      render();
    });

    function scrub(ev) {
      var r = track.getBoundingClientRect();
      T = clamp((ev.clientX - r.left) / r.width, 0, 0.9999) * TOTAL;
      ended = false;
      started = true;
      jumpNext = true;
      syncButtons();
      render();
    }
    var dragging = false;
    track.addEventListener('pointerdown', function (ev) {
      dragging = true;
      try { track.setPointerCapture(ev.pointerId); } catch (e) { /* 합성 이벤트 등 */ }
      scrub(ev);
    });
    track.addEventListener('pointermove', function (ev) { if (dragging) scrub(ev); });
    track.addEventListener('pointerup', function () { dragging = false; });
    track.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight') { seekScene(sceneAt(T) + 1, true); ev.preventDefault(); }
      if (ev.key === 'ArrowLeft') { seekScene(sceneAt(T) - 1, true); ev.preventDefault(); }
    });
    root.tabIndex = 0;
    root.addEventListener('keydown', function (ev) {
      if (ev.key === ' ' && ev.target === root) { ev.preventDefault(); if (playing) pause(true); else play(true); }
    });

    /* 화면에 대부분 보이면 자동 재생(사용자가 멈췄으면 존중), 화면 밖으로 나가면 멈춤 — 뇌 여행과 같이 실제 사각형으로 판단 */
    function checkView() {
      var r = stage.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var visible = r.bottom > 0 && r.top < vh;
      var shown = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      var good = r.height > 0 && shown / Math.min(r.height, vh) >= 0.7;
      if (good && !userPaused && !ended && !reduced() && !playing) play(false);
      else if (!visible && playing) pause(false);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(checkView, { threshold: [0, 0.25, 0.5, 0.75, 1] }).observe(stage);
    }
    var queued = false;
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; checkView(); });
    }, { passive: true });

    syncButtons();
    render();
    checkView();
    requestAnimationFrame(frame);
  }

  function init() {
    var reg = window.NM_PLAYERS || {};
    Array.prototype.forEach.call(document.querySelectorAll('[data-player]'), function (h) {
      var def = reg[h.getAttribute('data-player')];
      if (!def || h.getAttribute('data-pl-ready')) return;
      h.setAttribute('data-pl-ready', '1');
      mount(h, def);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
