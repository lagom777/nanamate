/* 장별 인터랙티브 그림 엔진. [data-figure] 요소에 붙인다.
 * 글은 NMFIG.data, 그림은 NMFIG.define. 문자열은 textContent만 쓴다.
 * SVG 뼈대만 엔진이 만들고, 안쪽 마크업은 render() 결과로 통째로 교체한다.
 */
(function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  var ERR = '그림 자료를 불러오지 못했습니다.';

  var api = {
    _defs: {},
    _data: {},
    define: function (id, def) { api._defs[id] = def; },
    data: function (id, figData) { api._data[id] = figData; },
    mountAll: mountAll,
    mount: mount
  };

  if (typeof window !== 'undefined') window.NMFIG = api;

  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }
  function clearNode(n) {
    while (n.firstChild) n.removeChild(n.firstChild);
  }
  function log(e) {
    if (typeof console !== 'undefined' && console.error) console.error(e);
  }
  function reduced() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }
  function coarse() {
    try { return window.matchMedia('(pointer: coarse)').matches; }
    catch (e) { return false; }
  }
  function durationMs(text) {
    var sec = ((text || '').length) / 15;
    if (sec < 4) sec = 4;
    if (sec > 8) sec = 8;
    return Math.round(sec * 1000);
  }
  function smooth(u) {
    if (u < 0) u = 0;
    if (u > 1) u = 1;
    return u * u * (3 - 2 * u);
  }
  function viewList(def) {
    if (def.views && def.views.length) return def.views;
    return [{ id: 'main', label: '' }];
  }
  function viewBoxOf(vb) {
    if (!vb) return '0 0 100 100';
    if (typeof vb === 'string') return vb;
    if (vb.length >= 4) return vb[0] + ' ' + vb[1] + ' ' + vb[2] + ' ' + vb[3];
    return '0 0 ' + vb[0] + ' ' + vb[1];
  }
  function knownView(def, id) {
    var list = viewList(def);
    var i;
    for (i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function controlById(list, id) {
    var i;
    for (i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function controlVisible(c, view) {
    if (!c.views || !c.views.length) return true;
    var i;
    for (i = 0; i < c.views.length; i++) if (c.views[i] === view) return true;
    return false;
  }
  function formatVal(c, value) {
    if (typeof c.fmt === 'function') {
      try { return String(c.fmt(Number(value))); }
      catch (e) { return String(value); }
    }
    if (c.type === 'range') {
      var n = Number(value);
      if (n !== n) return '';
      var step = String(c.step == null ? '' : c.step);
      var dot = step.indexOf('.');
      var d = dot >= 0 ? step.length - dot - 1 : 0;
      return n.toFixed(d);
    }
    return String(value);
  }
  function readDefaults(def) {
    var v = {};
    var list = def.controls || [];
    var i, c;
    for (i = 0; i < list.length; i++) {
      c = list[i];
      if (c.type === 'range') v[c.id] = Number(c.value);
      else if (c.type === 'toggle') v[c.id] = !!c.value;
      else v[c.id] = c.value;
    }
    return v;
  }
  function showError(root) {
    clearNode(root);
    var p = el('p', 'fgx-error');
    p.textContent = ERR;
    root.appendChild(p);
  }

  function mountAll() {
    if (typeof document === 'undefined') return;
    var nodes = document.querySelectorAll('[data-figure]');
    var i;
    for (i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  function mount(root) {
    if (typeof document === 'undefined' || !root || !root.getAttribute) return;
    if (root.getAttribute('data-fg-mounted')) return;
    root.setAttribute('data-fg-mounted', '1');
    root.classList.add('fgx');

    var id = root.getAttribute('data-figure');
    var fig = api._data[id];
    var def = api._defs[id];
    if (!fig || !def || typeof def.render !== 'function') {
      showError(root);
      return;
    }
    clearNode(root);
    build(root, id, fig, def);
  }

  function build(root, id, fig, def) {
    var controls = def.controls || [];
    var views = viewList(def);
    var useUpdate = typeof def.update === 'function';
    var startAttr = root.getAttribute('data-view');
    var startMeta = (startAttr && knownView(def, startAttr)) || views[0];

    var state = {
      view: startMeta.id,
      v: readDefaults(def),
      time: 0,
      dt: 0,
      lastNow: 0,
      hover: null,
      pinned: null,
      follow: null,
      active: [],
      tipId: null,
      panelId: undefined,
      readoutText: null,
      partSig: null,
      playing: false,
      userPaused: !!reduced(),
      sweepDone: false,
      onScreen: true,
      tweens: {},
      scenario: null,
      raf: 0,
      vDirty: false,
      dirtyReason: '',
      fromKey: false
    };

    if (!state.userPaused && def.live) state.playing = true; // 슬라이더 훑기(animate)는 ▶ 를 눌러야 시작

    var ui = {};
    ui.views = el('div', 'fgx-views');
    ui.main = el('div', 'fgx-main');
    ui.col = el('div', 'fgx-col');
    ui.stage = el('div', 'fgx-stage');
    ui.host = el('div', 'fgx-svghost');
    ui.tip = el('div', 'fgx-tip');
    ui.tipName = el('span', 'fgx-tip-name');
    ui.tipEn = el('span', 'fgx-tip-en');
    ui.hint = el('p', 'fgx-hint');
    ui.readout = el('p', 'fgx-readout');
    ui.controls = el('div', 'fgx-controls');
    ui.transport = el('div', 'fgx-transport');
    ui.play = el('button', 'fgx-play');
    ui.clock = el('span', 'fgx-clock');
    ui.chips = el('div', 'fgx-chips');
    ui.panel = el('aside', 'fgx-panel');
    ui.scenes = el('div', 'fgx-scenes');
    ui.player = el('div', 'fgx-player');
    ui.sub = el('p', 'fgx-sub');
    ui.dots = el('div', 'fgx-dots');
    ui.sPrev = el('button', 'fgx-step');
    ui.sPlay = el('button', 'fgx-step');
    ui.sNext = el('button', 'fgx-step');
    ui.legend = legendLine();
    ui.ctls = [];

    ui.tip.hidden = true;
    ui.tip.setAttribute('aria-hidden', 'true');
    ui.tip.appendChild(ui.tipName);
    ui.tip.appendChild(ui.tipEn);
    ui.hint.hidden = true;
    ui.readout.hidden = true;
    ui.readout.setAttribute('aria-live', 'polite');
    ui.readout.setAttribute('role', 'status');
    ui.panel.setAttribute('role', 'region');
    ui.panel.setAttribute('aria-label', '설명');
    ui.player.hidden = true;
    ui.player.setAttribute('role', 'region');
    ui.player.setAttribute('aria-label', '시나리오 재생');
    ui.sub.setAttribute('aria-live', 'polite');
    ui.play.type = 'button';
    ui.sPrev.type = 'button';
    ui.sPlay.type = 'button';
    ui.sNext.type = 'button';
    ui.sPrev.textContent = '⏮';
    ui.sPlay.textContent = '▶';
    ui.sNext.textContent = '⏭';
    ui.sPrev.setAttribute('aria-label', '이전 단계');
    ui.sPlay.setAttribute('aria-label', '재생');
    ui.sNext.setAttribute('aria-label', '다음 단계');
    ui.clock.setAttribute('aria-hidden', 'true');
    ui.clock.textContent = '경과 0.0초';
    ui.views.setAttribute('role', 'group');
    ui.views.setAttribute('aria-label', '보기');
    if (fig.title) {
      root.setAttribute('role', 'group');
      root.setAttribute('aria-label', fig.title);
    }
    root.classList.toggle('is-reduced', reduced());

    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'fgx-svg fgx-fig-' + id);
    svg.setAttribute('viewBox', viewBoxOf(def.viewBox));
    svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', fig.title || id);
    svg.setAttribute('focusable', 'false');
    ui.svg = svg;
    ui.host.appendChild(svg);

    ui.stage.appendChild(ui.host);
    ui.stage.appendChild(ui.tip);
    ui.stage.appendChild(ui.hint);
    ui.transport.appendChild(ui.play);
    ui.transport.appendChild(ui.clock);
    ui.controls.appendChild(ui.transport);
    ui.col.appendChild(ui.stage);
    ui.col.appendChild(ui.readout);
    ui.col.appendChild(ui.controls);
    ui.col.appendChild(ui.chips);
    ui.main.appendChild(ui.col);
    ui.main.appendChild(ui.panel);

    var pc = el('div', 'fgx-pc');
    pc.appendChild(ui.sPrev);
    pc.appendChild(ui.sPlay);
    pc.appendChild(ui.sNext);
    pc.appendChild(ui.dots);
    ui.player.appendChild(ui.sub);
    ui.player.appendChild(pc);

    if (views.length > 1) {
      views.forEach(function (v) {
        var b = el('button', 'fgx-view');
        b.type = 'button';
        b.setAttribute('data-view', v.id);
        b.textContent = v.label || v.id;
        b.addEventListener('click', function () { setView(v.id, false); });
        ui.views.appendChild(b);
      });
      root.appendChild(ui.views);
    }
    buildControlDom();
    root.appendChild(ui.main);
    root.appendChild(ui.scenes);
    root.appendChild(ui.player);
    root.appendChild(ui.legend);

    bindSvg(svg);
    ui.play.addEventListener('click', onTransport);
    ui.sPrev.addEventListener('click', goPrev);
    ui.sNext.addEventListener('click', goNext);
    ui.sPlay.addEventListener('click', onScenarioPlay);

    buildScenarioButtons();
    syncHint();
    syncControlVisibility();
    syncPlayButton();
    performDraw('init');
    ensureLoop();

    document.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);
    if (typeof IntersectionObserver === 'function') {
      var io = new IntersectionObserver(function (ents) {
        state.onScreen = !!(ents[0] && ents[0].isIntersecting);
        onVisibility();
      }, { threshold: 0.01 });
      io.observe(root);
    }
    try {
      var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      var onMq = function () {
        root.classList.toggle('is-reduced', reduced());
        if (reduced()) {
          state.playing = false;
          state.userPaused = true;
          pauseScenario();
          syncPlayButton();
          ensureLoop();
        }
        if (state.scenario) updatePlayer();
      };
      if (mq.addEventListener) mq.addEventListener('change', onMq);
    } catch (e) {}

    function legendLine() {
      var p = el('p', 'fgx-legend');
      p.appendChild(dot(true));
      p.appendChild(document.createTextNode(' 교과서 핵심'));
      var gap = el('span', 'fgx-legend-gap');
      gap.textContent = '   ';
      p.appendChild(gap);
      p.appendChild(dot(false));
      p.appendChild(document.createTextNode(' 참고'));
      return p;
    }
    function dot(core) {
      var i = el('i', 'fgx-dot' + (core ? ' is-core' : ''));
      i.setAttribute('aria-hidden', 'true');
      return i;
    }

    /* def.animate 는 객체 하나 또는 객체 배열(항목마다 views 로 보기를 구분). 지금 보기에 해당하는 항목을 돌려준다. */
    function curAnim() {
      var list = def.animate;
      if (!list) return null;
      if (!Array.isArray(list)) list = [list];
      var i, a, j, ok;
      for (i = 0; i < list.length; i++) {
        a = list[i];
        ok = true;
        if (a.views && a.views.length) {
          ok = false;
          for (j = 0; j < a.views.length; j++) if (a.views[j] === state.view) ok = true;
        }
        if (!ok) continue;
        var c = controlById(controls, a.control);
        if (c && c.type === 'range') return a;
      }
      return null;
    }
    function isAnimControl(cid) {
      var list = def.animate;
      if (!list) return false;
      if (!Array.isArray(list)) list = [list];
      var i;
      for (i = 0; i < list.length; i++) if (list[i].control === cid) return true;
      return false;
    }
    function animateApplies() {
      return !state.sweepDone && !!curAnim();
    }

    function buildControlDom() {
      controls.forEach(function (c) {
        var wrap = el('div', 'fgx-ctl fgx-ctl-' + c.type);
        var rec = { def: c, wrap: wrap };
        if (c.type === 'range') {
          var name = el('span', 'fgx-ctl-name');
          name.textContent = c.label || c.id;
          var val = el('span', 'fgx-ctl-val');
          var input = el('input');
          input.type = 'range';
          input.min = String(c.min);
          input.max = String(c.max);
          input.step = c.step == null ? 'any' : String(c.step);
          input.value = String(c.value);
          input.setAttribute('aria-label', c.label || c.id);
          input.addEventListener('input', function () {
            if (state.tweens[c.id]) delete state.tweens[c.id];
            state.v[c.id] = Number(input.value);
            if (isAnimControl(c.id)) {
              state.playing = false;
              state.userPaused = true;
              state.sweepDone = false;
              syncPlayButton();
            }
            pauseScenario();
            syncControlWidgets();
            markDirty('control');
          });
          wrap.appendChild(name);
          wrap.appendChild(val);
          wrap.appendChild(input);
          rec.input = input;
          rec.val = val;
        } else if (c.type === 'choice') {
          var lab = el('span', 'fgx-ctl-name');
          lab.textContent = c.label || c.id;
          var group = el('div', 'fgx-choice');
          group.setAttribute('role', 'group');
          group.setAttribute('aria-label', c.label || c.id);
          rec.btns = [];
          (c.options || []).forEach(function (opt, j) {
            var b = el('button', 'fgx-choice-btn');
            b.type = 'button';
            b.textContent = opt.label;
            b.addEventListener('click', function () {
              state.v[c.id] = opt.v;
              pauseScenario();
              syncControlWidgets();
              markDirty('control');
            });
            group.appendChild(b);
            rec.btns.push(b);
            rec.btns[j].setAttribute('data-i', String(j));
          });
          wrap.appendChild(lab);
          wrap.appendChild(group);
        } else {
          var tb = el('button', 'fgx-toggle');
          tb.type = 'button';
          tb.textContent = c.label || c.id;
          tb.addEventListener('click', function () {
            state.v[c.id] = !state.v[c.id];
            pauseScenario();
            syncControlWidgets();
            markDirty('control');
          });
          wrap.appendChild(tb);
          rec.btn = tb;
        }
        ui.ctls.push(rec);
        ui.controls.appendChild(wrap);
      });
    }

    function syncControlWidgets() {
      var i, c, j, b, on, val, text;
      for (i = 0; i < ui.ctls.length; i++) {
        c = ui.ctls[i];
        val = state.v[c.def.id];
        if (c.def.type === 'range') {
          if (document.activeElement !== c.input) c.input.value = String(val);
          text = formatVal(c.def, val);
          c.val.textContent = text;
          c.input.setAttribute('aria-valuetext', text);
        } else if (c.def.type === 'toggle') {
          on = !!val;
          c.btn.classList.toggle('is-on', on);
          c.btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        } else if (c.def.type === 'choice') {
          for (j = 0; j < c.btns.length; j++) {
            b = c.btns[j];
            on = c.def.options[j].v === val;
            b.classList.toggle('is-on', on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
          }
        }
      }
    }

    function syncControlVisibility() {
      var i;
      for (i = 0; i < ui.ctls.length; i++) {
        ui.ctls[i].wrap.hidden = !controlVisible(ui.ctls[i].def, state.view);
      }
    }

    function syncPlayButton() {
      var show = !!(def.live || curAnim());
      ui.transport.hidden = !show;
      ui.clock.hidden = !def.live;
      ui.play.textContent = state.playing ? '⏸' : '▶';
      ui.play.setAttribute('aria-label', state.playing ? '일시정지' : '재생');
      ui.play.setAttribute('aria-pressed', state.playing ? 'true' : 'false');
      ui.play.classList.toggle('is-on', !!state.playing);
      root.classList.toggle('is-playing', !!state.playing);
    }

    function syncClock() {
      if (!def.live) return;
      var label = '경과 ' + state.time.toFixed(1) + '초';
      if (ui.clock.textContent !== label) ui.clock.textContent = label;
    }

    function syncHint() {
      var meta = knownView(def, state.view);
      if (meta && meta.hint) {
        ui.hint.hidden = false;
        ui.hint.textContent = meta.hint;
      } else ui.hint.hidden = true;
    }

    function syncViewButtons() {
      var buttons = ui.views.querySelectorAll('.fgx-view');
      var i, on;
      for (i = 0; i < buttons.length; i++) {
        on = buttons[i].getAttribute('data-view') === state.view;
        buttons[i].classList.toggle('is-on', on);
        buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    }

    /* 컨트롤 폭주·재생 프레임이 같은 프레임에 update를 두 번 부르지 않게 한 줄로 모은다. */
    function markDirty(reason) {
      state.vDirty = true;
      state.dirtyReason = reason || 'control';
      if (state.raf) return;
      state.raf = requestAnimationFrame(loop);
    }
    function shouldLoop() {
      if (typeof document !== 'undefined' && document.hidden) return false;
      if (!state.onScreen) return false;
      if (hasTween()) return true;
      if (!state.playing) return false;
      if (def.live) return true;
      if (animateApplies()) return true;
      return false;
    }
    function ensureLoop() {
      if (state.raf) return;
      if (!shouldLoop() && !state.vDirty) return;
      state.raf = requestAnimationFrame(loop);
    }
    function hasTween() {
      return Object.keys(state.tweens).length > 0;
    }
    function loop(now) {
      state.raf = 0;
      if ((typeof document !== 'undefined' && document.hidden) || !state.onScreen) return;
      var dt = 0;
      if (state.lastNow) {
        dt = (now - state.lastNow) / 1000;
        if (dt > 0.05) dt = 0.05;
        if (dt < 0) dt = 0;
      }
      state.lastNow = now;
      state.dt = dt;

      var timeMoved = false;
      var controlMoved = false;
      if (state.playing && def.live) {
        state.time += dt;
        timeMoved = true;
      }
      if (state.playing && animateApplies()) {
        if (advanceSweep(dt)) controlMoved = true;
      }
      if (advanceTweens(dt)) controlMoved = true;

      var dirty = state.vDirty;
      var reason = state.dirtyReason || (dirty ? 'control' : 'frame');
      if (dirty || controlMoved || (timeMoved && useUpdate)) performDraw(reason);
      if (timeMoved) syncClock();
      if (shouldLoop() || state.vDirty) state.raf = requestAnimationFrame(loop);
    }

    function advanceSweep(dt) {
      var a = curAnim();
      if (!a || dt <= 0) return false;
      var from = Number(a.from);
      var to = Number(a.to);
      var dur = Number(a.duration);
      if (!dur) dur = 1000;
      var cur = Number(state.v[a.control]);
      if (cur !== cur) cur = from;
      var next = cur + (to - from) * (dt * 1000) / dur;
      var forward = to >= from;
      var reached = forward ? next >= to : next <= to;
      if (reached) {
        if (a.loop) {
          var span = to - from;
          if (!span) {
            state.v[a.control] = to;
            return false;
          }
          var len = span < 0 ? -span : span;
          var traveled = span < 0 ? (from - next) : (next - from);
          var mod = traveled % len;
          if (mod < 0) mod += len;
          next = span < 0 ? (from - mod) : (from + mod);
        } else {
          next = to;
          state.sweepDone = true;
          if (!def.live) {
            state.playing = false;
            state.userPaused = true;
            syncPlayButton();
          }
        }
      }
      var c = controlById(controls, a.control);
      if (c) {
        if (next < Number(c.min)) next = Number(c.min);
        if (next > Number(c.max)) next = Number(c.max);
      }
      state.v[a.control] = next;
      return true;
    }

    function advanceTweens(dt) {
      var keys = Object.keys(state.tweens);
      if (!keys.length || dt <= 0) return false;
      var i, tw, u;
      for (i = 0; i < keys.length; i++) {
        tw = state.tweens[keys[i]];
        if (!tw) continue;
        tw.elapsed += dt;
        u = tw.elapsed / tw.dur;
        if (u >= 1) {
          state.v[keys[i]] = tw.to;
          delete state.tweens[keys[i]];
        } else {
          state.v[keys[i]] = tw.from + (tw.to - tw.from) * smooth(u);
        }
      }
      return true;
    }

    function makeCtx(reason) {
      return {
        svg: ui.svg,
        v: state.v,
        view: state.view,
        time: state.time,
        dt: state.dt,
        reason: reason,
        q: function (sel) { return ui.svg.querySelector(sel); },
        qa: function (sel) { return Array.prototype.slice.call(ui.svg.querySelectorAll(sel)); },
        part: function (pid) { return nodesOf(pid); }
      };
    }

    function nodesOf(pid) {
      if (!ui.svg) return [];
      var all = ui.svg.querySelectorAll('[data-part]');
      var out = [];
      var i;
      for (i = 0; i < all.length; i++) {
        if (all[i].getAttribute('data-part') === pid) out.push(all[i]);
      }
      return out;
    }

    function performDraw(reason) {
      state.vDirty = false;
      state.dirtyReason = '';
      var doRender = !useUpdate || reason === 'init' || reason === 'view';
      if (doRender) paintSvg();
      if (useUpdate) {
        var res = {};
        try { res = def.update(makeCtx(reason)) || {}; }
        catch (e) { log(e); }
        applyResult(res);
      } else {
        var rd = {};
        if (typeof def.readout === 'function') {
          try { rd = { readout: def.readout(state.v, state.view) }; }
          catch (e2) { log(e2); }
        }
        applyResult(rd);
      }
      syncChipsState();
      syncControlWidgets();
      syncViewButtons();
    }

    function paintSvg() {
      var markup = '';
      try {
        markup = def.render(state.v, state.view);
      } catch (e) {
        log(e);
        markup = '';
      }
      if (typeof markup !== 'string') markup = '';
      ui.svg.innerHTML = markup;
      decorateParts();
      var sig = partSignature();
      if (sig !== state.partSig) {
        state.partSig = sig;
        buildChips();
      }
      if (state.pinned && !nodesOf(state.pinned).length) state.pinned = null;
      if (state.hover && !nodesOf(state.hover).length) state.hover = null;
    }

    function partSignature() {
      var nodes = ui.svg.querySelectorAll('[data-part]');
      var ids = [];
      var seen = {};
      var i, pid;
      for (i = 0; i < nodes.length; i++) {
        pid = nodes[i].getAttribute('data-part');
        if (pid && !seen[pid]) { seen[pid] = 1; ids.push(pid); }
      }
      ids.sort();
      return ids.join('|');
    }

    function decorateParts() {
      var nodes = ui.svg.querySelectorAll('[data-part]');
      var i, n, pid, meta;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        pid = n.getAttribute('data-part');
        meta = fig.parts && fig.parts[pid];
        n.setAttribute('tabindex', '0');
        n.setAttribute('role', 'button');
        n.setAttribute('aria-label', meta ? meta.name : pid);
      }
    }

    function applyResult(res) {
      state.active = Array.isArray(res.active) ? res.active : [];
      state.follow = res.follow || null;
      var text = res.readout ? String(res.readout) : '';
      if (text !== state.readoutText) {
        state.readoutText = text;
        ui.readout.textContent = text;
        ui.readout.hidden = !text;
      }
      applyHighlight();
      syncPanel();
    }

    function displayPartId() {
      if (state.hover && fig.parts[state.hover]) return state.hover;
      if (state.pinned && fig.parts[state.pinned]) return state.pinned;
      var sc = state.scenario;
      if (sc && sc.playing && sc.part && fig.parts[sc.part] && !state.hover && !state.pinned) return sc.part;
      if (state.follow && fig.parts[state.follow]) return state.follow;
      return null;
    }

    function applyHighlight() {
      if (!ui.svg) return;
      var nodes = ui.svg.querySelectorAll('[data-part]');
      var primary = displayPartId();
      var links = {};
      var part = primary && fig.parts[primary];
      var ls = (part && part.links) || [];
      var i, id, n, on;
      for (i = 0; i < ls.length; i++) links[ls[i]] = 1;
      var active = {};
      for (i = 0; i < state.active.length; i++) active[state.active[i]] = 1;
      var marked = {};
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        id = n.getAttribute('data-part');
        n.classList.remove('is-hover', 'is-pinned', 'is-linked', 'is-active', 'is-dim');
        on = false;
        if (id && id === state.hover) { n.classList.add('is-hover'); on = true; }
        if (id && id === state.pinned) { n.classList.add('is-pinned'); on = true; }
        if (!state.hover && id && id === primary && id !== state.pinned) {
          n.classList.add('is-pinned');
          on = true;
        }
        if (id && links[id] && id !== primary && id !== state.hover && id !== state.pinned) {
          n.classList.add('is-linked');
          on = true;
        }
        if (id && active[id]) { n.classList.add('is-active'); on = true; }
        if (on && id) marked[id] = 1;
        n.setAttribute('aria-pressed', id && id === state.pinned ? 'true' : 'false');
      }
      var hasMark = false;
      for (id in marked) {
        if (marked.hasOwnProperty(id)) hasMark = true;
      }
      if (hasMark) {
        for (i = 0; i < nodes.length; i++) {
          id = nodes[i].getAttribute('data-part');
          if (!marked[id]) nodes[i].classList.add('is-dim');
        }
      }
      root.classList.toggle('is-selected', hasMark);
    }

    function partOf(node) {
      if (!node || !node.closest || !ui.svg) return null;
      var g = node.closest('[data-part]');
      if (g && ui.svg.contains(g)) return g;
      return null;
    }

    function bindSvg(svgEl) {
      svgEl.addEventListener('pointerover', function (e) {
        if (e.pointerType === 'touch' || coarse()) return;
        var g = partOf(e.target);
        if (!g) return;
        setHover(g.getAttribute('data-part'));
      });
      svgEl.addEventListener('pointerout', function (e) {
        var g = partOf(e.target);
        if (!g) return;
        var rel = e.relatedTarget;
        if (rel && g.contains(rel)) return;
        var next = rel && rel.closest && rel.closest('[data-part]');
        if (next && svgEl.contains(next)) {
          var nid = next.getAttribute('data-part');
          if (nid !== g.getAttribute('data-part')) setHover(nid);
          return;
        }
        if (state.hover === g.getAttribute('data-part')) setHover(null);
        hideTip();
      });
      svgEl.addEventListener('pointermove', function (e) {
        if (coarse() || e.pointerType === 'touch') { hideTip(); return; }
        var g = partOf(e.target);
        if (!g) { hideTip(); return; }
        var pid = g.getAttribute('data-part');
        if (state.hover !== pid) setHover(pid);
        showTip(pid, e.clientX, e.clientY);
      });
      svgEl.addEventListener('pointerleave', hideTip);
      svgEl.addEventListener('click', function (e) {
        if (state.fromKey) return;
        var g = partOf(e.target);
        if (!g) {
          state.pinned = null;
          applyHighlight();
          syncPanel();
          syncChipsState();
          return;
        }
        pauseScenario();
        togglePin(g.getAttribute('data-part'));
      });
      svgEl.addEventListener('focusin', function (e) {
        var g = partOf(e.target);
        if (!g) return;
        setHover(g.getAttribute('data-part'));
      });
      svgEl.addEventListener('focusout', function (e) {
        var g = partOf(e.target);
        if (!g) return;
        var rel = e.relatedTarget;
        if (rel && g.contains(rel)) return;
        var pid = g.getAttribute('data-part');
        if (state.hover === pid) setHover(null);
      });
      svgEl.addEventListener('keydown', function (e) {
        var g = partOf(e.target);
        if (!g) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          state.fromKey = true;
          setTimeout(function () { state.fromKey = false; }, 0);
          pauseScenario();
          togglePin(g.getAttribute('data-part'));
        }
      });
    }

    function showTip(pid, clientX, clientY) {
      var part = fig.parts[pid];
      if (!part) return;
      if (state.tipId !== pid) {
        state.tipId = pid;
        ui.tipName.textContent = part.name;
        ui.tipEn.textContent = part.en || '';
      }
      ui.tip.hidden = false;
      var rect = ui.stage.getBoundingClientRect();
      var x = clientX - rect.left + 14;
      var y = clientY - rect.top + 16;
      var tw = ui.tip.offsetWidth;
      var th = ui.tip.offsetHeight;
      if (x + tw > ui.stage.clientWidth - 6) x = clientX - rect.left - tw - 14;
      if (y + th > ui.stage.clientHeight - 6) y = clientY - rect.top - th - 10;
      if (x < 6) x = 6;
      if (y < 6) y = 6;
      ui.tip.style.left = x + 'px';
      ui.tip.style.top = y + 'px';
    }
    function hideTip() {
      state.tipId = null;
      ui.tip.hidden = true;
    }

    function setHover(pid) {
      if (state.hover === pid) return;
      state.hover = pid;
      applyHighlight();
      syncPanel();
      syncChipsState();
    }

    function togglePin(pid) {
      state.pinned = state.pinned === pid ? null : pid;
      applyHighlight();
      syncPanel();
      syncChipsState();
      if (state.pinned) maybeRevealPanel();
    }

    function openPart(pid) {
      pauseScenario();
      var part = fig.parts[pid];
      state.hover = null;
      hideTip();
      if (part && part.view && part.view !== state.view && knownView(def, part.view)) {
        setView(part.view, false);
      }
      state.pinned = pid;
      applyHighlight();
      syncPanel();
      syncChipsState();
      maybeRevealPanel();
    }

    function maybeRevealPanel() {
      try {
        if (ui.panel.getBoundingClientRect().top >= ui.stage.getBoundingClientRect().bottom - 2) {
          ui.panel.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
        }
      } catch (e) {}
    }

    function setView(next, fromScenario) {
      if (!knownView(def, next)) return;
      if (next === state.view) {
        if (!fromScenario) pauseScenario();
        return;
      }
      if (!fromScenario) pauseScenario();
      state.view = next;
      state.hover = null;
      hideTip();
      if (!fromScenario && !state.userPaused && !reduced()) {
        if (def.live) state.playing = true;
      }
      if (state.playing && !def.live && !animateApplies()) state.playing = false;
      performDraw('view');
      if (state.pinned && !nodesOf(state.pinned).length) state.pinned = null;
      syncHint();
      syncControlVisibility();
      syncViewButtons();
      syncPlayButton();
      ensureLoop();
    }

    function onTransport() {
      pauseScenario();
      if (state.playing) {
        state.playing = false;
        state.userPaused = true;
      } else {
        state.playing = true;
        state.userPaused = false;
        state.sweepDone = false;
        var a = curAnim();
        if (a) {
          var cur = Number(state.v[a.control]);
          var to = Number(a.to);
          if (Math.abs(cur - to) < 1e-4) state.v[a.control] = Number(a.from);
        }
      }
      syncPlayButton();
      syncControlWidgets();
      ensureLoop();
    }

    function chipKeys() {
      var nodes = ui.svg.querySelectorAll('[data-part]');
      var seen = {};
      var found = [];
      var i, pid;
      for (i = 0; i < nodes.length; i++) {
        pid = nodes[i].getAttribute('data-part');
        if (!pid || seen[pid] || !fig.parts[pid]) continue;
        seen[pid] = 1;
        found.push(pid);
      }
      var order = fig.order || [];
      found.sort(function (a, b) {
        var ia = order.indexOf(a);
        var ib = order.indexOf(b);
        if (ia < 0) ia = 9999;
        if (ib < 0) ib = 9999;
        return ia - ib;
      });
      return found;
    }

    function buildChips() {
      clearNode(ui.chips);
      chipKeys().forEach(function (pid) {
        var part = fig.parts[pid];
        var b = el('button', 'fgx-chip');
        b.type = 'button';
        b.setAttribute('data-key', pid);
        b.appendChild(dot(part.level === 'core'));
        var t = el('span');
        t.textContent = part.name;
        b.appendChild(t);
        b.addEventListener('pointerenter', function (e) {
          if (e.pointerType === 'touch') return;
          setHover(pid);
        });
        b.addEventListener('pointerleave', function () {
          if (state.hover === pid) setHover(null);
        });
        b.addEventListener('focus', function () { setHover(pid); });
        b.addEventListener('blur', function () {
          if (state.hover === pid) setHover(null);
        });
        b.addEventListener('click', function () {
          pauseScenario();
          togglePin(pid);
        });
        ui.chips.appendChild(b);
      });
      syncChipsState();
    }

    function syncChipsState() {
      var buttons = ui.chips.querySelectorAll('.fgx-chip');
      var primary = displayPartId();
      var i, pid, on;
      for (i = 0; i < buttons.length; i++) {
        pid = buttons[i].getAttribute('data-key');
        on = pid === state.hover || pid === state.pinned || (pid === primary && !state.hover);
        buttons[i].classList.toggle('is-on', !!on);
        buttons[i].setAttribute('aria-pressed', pid === state.pinned ? 'true' : 'false');
      }
    }

    function section(title, node) {
      var s = el('section', 'fgx-sec');
      var h = el('h4', 'fgx-sec-h');
      h.textContent = title;
      s.appendChild(h);
      s.appendChild(node);
      return s;
    }

    function fillIdle(body) {
      var lead = el('p', 'fgx-idle-lead');
      lead.textContent = fig.lead || '';
      body.appendChild(lead);
      if (fig.idle) {
        var note = el('p', 'fgx-idle-note');
        note.textContent = fig.idle;
        body.appendChild(note);
      }
      body.appendChild(legendLine());
    }

    function fillPart(body, pid) {
      var part = fig.parts[pid];
      if (!part) { fillIdle(body); return; }
      var head = el('div', 'fgx-head');
      var name = el('h3', 'fgx-name');
      name.textContent = part.name;
      var badge = el('span', 'fgx-badge ' + (part.level === 'core' ? 'is-core' : 'is-ref'));
      badge.textContent = part.level === 'core' ? '교과서 핵심' : '참고';
      var en = el('p', 'fgx-en');
      en.textContent = part.en || '';
      head.appendChild(name);
      head.appendChild(badge);
      head.appendChild(en);
      body.appendChild(head);

      if (part.where) {
        var where = el('p', 'fgx-where');
        where.textContent = part.where;
        body.appendChild(section('📍 위치', where));
      }
      if (part.etym) {
        var etym = el('div', 'fgx-etym');
        var ko = el('p', 'fgx-etym-ko');
        ko.textContent = part.etym.ko || '';
        var eny = el('p', 'fgx-etym-en');
        eny.textContent = part.etym.en || '';
        var memo = el('p', 'fgx-memo');
        var lab = el('b');
        lab.textContent = '💡 기억 팁';
        memo.appendChild(lab);
        memo.appendChild(document.createTextNode('  ' + (part.etym.memo || '')));
        etym.appendChild(ko);
        etym.appendChild(eny);
        etym.appendChild(memo);
        body.appendChild(section('🔤 이름의 뜻', etym));
      }
      if (part.role && part.role.length) {
        var ul = el('ul', 'fgx-role');
        var r, li;
        for (r = 0; r < part.role.length; r++) {
          li = el('li');
          li.textContent = part.role[r];
          ul.appendChild(li);
        }
        body.appendChild(section('⚙️ 하는 일', ul));
      }
      if (part.exam) {
        var ex = el('div', 'fgx-exam');
        ex.textContent = part.exam;
        body.appendChild(section('🎯 시험 포인트', ex));
      }
      var links = part.links || [];
      var row = el('div', 'fgx-links');
      var n = 0;
      var k, lk;
      for (k = 0; k < links.length; k++) {
        lk = links[k];
        if (!fig.parts[lk] || lk === pid) continue;
        row.appendChild(linkChip(lk));
        n++;
      }
      if (n) body.appendChild(section('🔗 연결된 부위', row));
    }

    function linkChip(pid) {
      var part = fig.parts[pid];
      var b = el('button', 'fgx-link');
      b.type = 'button';
      b.textContent = part ? part.name : pid;
      b.addEventListener('click', function () { openPart(pid); });
      return b;
    }

    function syncPanel() {
      var pid = displayPartId();
      var token = pid || '';
      if (token === state.panelId && ui.panel.firstChild) return;
      state.panelId = token;
      var body = el('div', 'fgx-panel-body');
      if (pid) fillPart(body, pid);
      else fillIdle(body);
      clearNode(ui.panel);
      ui.panel.appendChild(body);
      ui.panel.scrollTop = 0;
    }

    function buildScenarioButtons() {
      clearNode(ui.scenes);
      var list = fig.scenes || [];
      list.forEach(function (s) {
        var b = el('button', 'fgx-scene');
        b.type = 'button';
        b.setAttribute('data-sid', s.id);
        b.textContent = '▶ ' + (s.label || s.id);
        b.addEventListener('click', function () { onSceneButton(s); });
        ui.scenes.appendChild(b);
      });
    }

    function onSceneButton(s) {
      if (state.scenario && state.scenario.id === s.id && state.scenario.playing) {
        stopScenario(false);
        return;
      }
      startScenario(s);
    }

    function startScenario(s) {
      stopScenario(true);
      state.playing = false;
      state.userPaused = true;
      state.sweepDone = false;
      state.tweens = {};
      syncPlayButton();
      ensureLoop();
      state.scenario = {
        id: s.id,
        steps: s.steps || [],
        index: 0,
        playing: true,
        paused: !!reduced(),
        part: null,
        timer: 0,
        remain: 0,
        started: 0
      };
      if (s.view && knownView(def, s.view)) setView(s.view, true);
      goStep(0);
    }

    function stopScenario(silent) {
      var sc = state.scenario;
      if (!sc && silent) {
        ui.player.hidden = true;
        return;
      }
      if (sc && sc.timer) clearTimeout(sc.timer);
      state.scenario = null;
      state.tweens = {};
      ui.player.hidden = true;
      syncSceneButtons();
      if (!silent) {
        applyHighlight();
        syncPanel();
        syncChipsState();
      }
    }

    function goStep(i) {
      var sc = state.scenario;
      if (!sc) return;
      if (i < 0) return;
      if (i >= sc.steps.length) { stopScenario(false); return; }
      if (sc.timer) { clearTimeout(sc.timer); sc.timer = 0; }
      sc.index = i;
      sc.remain = 0;
      var step = sc.steps[i];
      state.hover = null;
      state.pinned = null;
      sc.part = step.part || null;
      if (step.view && knownView(def, step.view)) setView(step.view, true);
      if (step.set) applySet(step.set);
      else {
        applyHighlight();
        syncPanel();
        syncChipsState();
      }
      updatePlayer();
      scheduleStep();
    }

    function applySet(set) {
      var keys = Object.keys(set || {});
      var queued = false;
      var i, key, c, target, from;
      for (i = 0; i < keys.length; i++) {
        key = keys[i];
        c = controlById(controls, key);
        if (!c) continue;
        if (c.type === 'range') {
          target = Number(set[key]);
          from = Number(state.v[key]);
          if (from !== from) from = target;
          if (reduced() || Math.abs(target - from) < 1e-4) {
            state.v[key] = target;
            delete state.tweens[key];
          } else {
            state.tweens[key] = { from: from, to: target, elapsed: 0, dur: 0.6 };
            queued = true;
          }
        } else if (c.type === 'toggle') {
          state.v[key] = !!set[key];
        } else {
          state.v[key] = set[key];
        }
      }
      syncControlWidgets();
      if (queued) markDirty('frame');
      else performDraw('control');
    }

    function stepDuration(step) {
      if (step && step.ms) return step.ms;
      return durationMs(step && step.text);
    }

    function scheduleStep() {
      var sc = state.scenario;
      if (!sc || !sc.playing || sc.paused || reduced()) return;
      if (sc.timer) clearTimeout(sc.timer);
      var ms = sc.remain || stepDuration(sc.steps[sc.index]);
      sc.remain = ms;
      sc.started = Date.now();
      sc.timer = setTimeout(function () {
        if (!state.scenario) return;
        state.scenario.timer = 0;
        state.scenario.remain = 0;
        goStep(state.scenario.index + 1);
      }, ms);
    }

    function pauseScenario() {
      var sc = state.scenario;
      if (!sc || !sc.playing || sc.paused) return;
      sc.paused = true;
      if (sc.timer) {
        clearTimeout(sc.timer);
        sc.timer = 0;
        var elapsed = Date.now() - sc.started;
        sc.remain = Math.max(600, sc.remain - elapsed);
      }
      updatePlayer();
    }

    function onScenarioPlay() {
      var sc = state.scenario;
      if (!sc || reduced()) return;
      if (sc.paused) {
        sc.paused = false;
        state.hover = null;
        state.pinned = null;
        updatePlayer();
        applyHighlight();
        syncPanel();
        syncChipsState();
        scheduleStep();
      } else pauseScenario();
    }

    function goPrev() {
      if (!state.scenario || state.scenario.index <= 0) return;
      goStep(state.scenario.index - 1);
    }
    function goNext() {
      if (!state.scenario) return;
      goStep(state.scenario.index + 1);
    }

    function updatePlayer() {
      var sc = state.scenario;
      syncSceneButtons();
      if (!sc || !sc.playing) { ui.player.hidden = true; return; }
      ui.player.hidden = false;
      var step = sc.steps[sc.index];
      clearNode(ui.sub);
      ui.sub.appendChild(document.createTextNode((step.text || '') + ' '));
      var count = el('span', 'fgx-count');
      count.textContent = (sc.index + 1) + '/' + sc.steps.length;
      ui.sub.appendChild(count);
      clearNode(ui.dots);
      var i, d;
      for (i = 0; i < sc.steps.length; i++) {
        d = el('i', 'fgx-pdot' + (i === sc.index ? ' is-on' : (i < sc.index ? ' is-done' : '')));
        d.setAttribute('aria-hidden', 'true');
        ui.dots.appendChild(d);
      }
      var paused = sc.paused || reduced();
      ui.sPlay.hidden = !!reduced();
      ui.sPlay.textContent = paused ? '▶' : '⏸';
      ui.sPlay.setAttribute('aria-label', paused ? '재생' : '일시정지');
    }

    function syncSceneButtons() {
      var buttons = ui.scenes.querySelectorAll('.fgx-scene');
      var sid = state.scenario && state.scenario.playing ? state.scenario.id : '';
      var i;
      for (i = 0; i < buttons.length; i++) {
        var on = buttons[i].getAttribute('data-sid') === sid;
        buttons[i].classList.toggle('is-on', on);
        buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    }

    function onKey(e) {
      if (e.key !== 'Escape') return;
      if (!state.pinned && !state.hover) return;
      var ae = document.activeElement;
      if (ae && !root.contains(ae)) {
        var tag = (ae.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || ae.isContentEditable) return;
      }
      if (root.contains(ae) && ae.blur) ae.blur();
      state.pinned = null;
      state.hover = null;
      hideTip();
      applyHighlight();
      syncPanel();
      syncChipsState();
    }

    function onVisibility() {
      var off = (typeof document !== 'undefined' && document.hidden) || !state.onScreen;
      root.classList.toggle('is-off', off);
      if (off) {
        if (state.raf) cancelAnimationFrame(state.raf);
        state.raf = 0;
        state.lastNow = 0;
      } else ensureLoop();
    }
  }

  if (typeof document !== 'undefined') {
    /* defer 스크립트는 readyState 가 'interactive' 일 때 실행되므로, 그림 스크립트들이 모두 실행된 뒤인 DOMContentLoaded 에 붙인다. */
    if (document.readyState === 'complete') mountAll();
    else document.addEventListener('DOMContentLoaded', mountAll);
  }
})();
