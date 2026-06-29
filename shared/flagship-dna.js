/* 나나메이트 플래그십 3D 게임 — DNA 염기쌍 (aboutBiology/02-dna)
 * 이중나선 한쪽 가닥의 염기(A/T/G/C)가 순서대로 제시되면, 4개 버튼 중 올바른 상보 염기를
 * 클릭해 페어링한다. 샤가프의 규칙(A↔T, G↔C)을 직접 체득. 맞으면 나선에 염기쌍이 채워지고
 * 다음 칸으로, 틀리면 흔들림+페널티. 가닥 전체를 올바르게 페어링하면 클리어.
 * 컨테이너: <div id="nm-dna"></div>. THREE(r128) 필요. WebGL 실패 시 안내문(graceful).
 */
(function () {
  'use strict';

  // ── 순수 로직 (테스트 가능) ───────────────────────────────────────────────
  // A-T, G-C 만이 정상 왓슨-크릭 염기쌍. 대문자만 취급.
  var COMPLEMENT = { A: 'T', T: 'A', G: 'C', C: 'G' };

  // 한 염기의 올바른 상보 염기를 반환. 알 수 없는 입력은 null.
  function complement(base) {
    return Object.prototype.hasOwnProperty.call(COMPLEMENT, base) ? COMPLEMENT[base] : null;
  }

  // 사용자가 고른 염기가 제시된 염기의 올바른 상보인지.
  function isCorrectPair(templateBase, picked) {
    return complement(templateBase) === picked;
  }

  // 한 가닥(template, 문자열 또는 배열)에 대한 정답 상보 가닥 전체.
  // 알 수 없는 염기가 있으면 null(가닥 자체가 유효하지 않음).
  function complementStrand(template) {
    var arr = typeof template === 'string' ? template.split('') : template.slice();
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var c = complement(arr[i]);
      if (c === null) return null;
      out.push(c);
    }
    return out;
  }

  // 승리 판정: 제시된 가닥 전체가 올바른 상보로 완성되었는가.
  // picks 는 사용자가 채운 상보 가닥(문자 배열). 길이가 같고 모든 칸이 정답이어야 win.
  function isStrandComplete(template, picks) {
    var tmpl = typeof template === 'string' ? template.split('') : template;
    if (!picks || picks.length !== tmpl.length || tmpl.length === 0) return false;
    for (var i = 0; i < tmpl.length; i++) {
      if (!isCorrectPair(tmpl[i], picks[i])) return false;
    }
    return true;
  }

  var LOGIC = {
    COMPLEMENT: COMPLEMENT,
    complement: complement,
    isCorrectPair: isCorrectPair,
    complementStrand: complementStrand,
    isStrandComplete: isStrandComplete
  };

  // Node(테스트) 환경이면 로직만 내보내고 끝.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LOGIC;
    return;
  }
  // 브라우저에서도 디버깅/검증용으로 노출.
  if (typeof window !== 'undefined') window.NM_DNA_LOGIC = LOGIC;

  // ── 데이터: 실제 유전자에서 따온 짧은 템플릿 가닥들 ────────────────────────
  // 짧고 사실 기반인 서열들. 단계가 올라갈수록 길어진다.
  var LEVELS = [
    { strand: 'ATGC', note: '시작 코돈 ATG(메티오닌)으로 시작하는 가닥' },
    { strand: 'TACGGT', note: '주형 가닥 일부' },
    { strand: 'ATGGCATAC', note: '베타글로빈 유전자 도입부 닮은 서열' }
  ];

  var BASES = ['A', 'T', 'G', 'C'];
  var BASE_COLOR = { A: 0xef4444, T: 0x3b82f6, G: 0xeab308, C: 0x22c55e };

  function init() {
    var host = document.getElementById('nm-dna');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }

    var W = host.clientWidth || 640, H = 380, scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(48, W / H, 0.1, 200);
      cam.position.set(0, 0, 11); cam.lookAt(0, 0, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;touch-action:none;display:block;background:radial-gradient(circle at 50% 40%, #0b1220, #060a12)';
    host.appendChild(rndr.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    var dl = new THREE.DirectionalLight(0xffffff, 0.6); dl.position.set(3, 6, 8); scene.add(dl);

    var helix = new THREE.Group(); scene.add(helix);

    // 상태
    var lvl = 0, score = 0, idx = 0, picks = [], won = false, locked = false;
    var rungs = []; // 칸별 {tmplMesh, pairMesh, compMesh, y, ang, filled}
    var shakeUntil = 0, shakeMag = 0;

    // ── HUD ───────────────────────────────────────────────────────────────
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:12px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#e5e7eb;text-shadow:0 1px 3px rgba(0,0,0,.7);pointer-events:none;line-height:1.55';
    host.appendChild(hud);

    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;left:12px;bottom:12px;right:12px;font:600 12px "Noto Sans KR",sans-serif;color:#cbd5e1;text-shadow:0 1px 3px rgba(0,0,0,.7);pointer-events:none';
    tip.textContent = '제시된 염기의 짝(상보)을 고르세요 — A↔T, G↔C';
    host.appendChild(tip);

    // 염기 버튼 패널
    var pad = document.createElement('div');
    pad.style.cssText = 'position:absolute;right:12px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px';
    host.appendChild(pad);
    var btnEls = {};
    BASES.forEach(function (b) {
      var btn = document.createElement('button');
      btn.textContent = b;
      var hex = '#' + ('000000' + BASE_COLOR[b].toString(16)).slice(-6);
      btn.style.cssText = 'width:46px;height:46px;border-radius:12px;border:2px solid ' + hex + ';background:rgba(15,23,42,.85);color:' + hex + ';font:800 20px "Noto Sans KR",sans-serif;cursor:pointer;transition:transform .08s';
      btn.onmousedown = function () { btn.style.transform = 'scale(.92)'; };
      btn.onmouseup = function () { btn.style.transform = ''; };
      btn.onmouseleave = function () { btn.style.transform = ''; };
      btn.onclick = function () { pick(b); };
      pad.appendChild(btn); btnEls[b] = btn;
    });

    function curStrand() { return LEVELS[lvl].strand; }

    function setHud(msg) {
      var s = curStrand();
      var shown = '';
      for (var i = 0; i < s.length; i++) {
        var on = i < idx;
        var cur = i === idx;
        var col = cur ? '#fde047' : (on ? '#22c55e' : '#64748b');
        var pc = on ? picks[i] : (cur ? '?' : '·');
        shown += '<span style="color:' + col + ';font-weight:800">' + s[i] + ':' + pc + '</span> ';
      }
      hud.innerHTML = '🧬 단계 ' + (lvl + 1) + '/' + LEVELS.length + ' · 🏆 ' + score + '점<br>' +
        '<span style="font-size:11px;color:#94a3b8">제시 가닥</span><br>' + shown +
        (msg ? '<br><b style="color:#fde047">' + msg + '</b>' : '');
    }

    // ── 나선 빌드 ──────────────────────────────────────────────────────────
    function lbl(txt, color) {
      var fs = 40, cv = document.createElement('canvas'); var x = cv.getContext('2d');
      var font = '800 ' + fs + 'px "Noto Sans KR",sans-serif'; x.font = font;
      cv.width = 64; cv.height = 64; x = cv.getContext('2d'); x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = color; x.fillText(txt, 32, 34);
      var tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter;
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false }));
      sp.scale.set(0.7, 0.7, 1); return sp;
    }

    function buildHelix() {
      while (helix.children.length) helix.remove(helix.children[0]);
      rungs = [];
      var s = curStrand(), N = s.length;
      var span = Math.min(8, N * 1.5), turns = N / 5 + 0.4, R = 1.5;
      for (var i = 0; i < N; i++) {
        var t = N === 1 ? 0.5 : i / (N - 1);
        var ang = t * Math.PI * 2 * turns;
        var y = (0.5 - t) * span; // 위에서 아래로 진행
        var ax = Math.cos(ang) * R, az = Math.sin(ang) * R;
        var bx = Math.cos(ang + Math.PI) * R, bz = Math.sin(ang + Math.PI) * R;

        // 제시(template) 염기 — 항상 보임
        var tcol = BASE_COLOR[s[i]];
        var tnode = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 16),
          new THREE.MeshStandardMaterial({ color: tcol, emissive: tcol, emissiveIntensity: 0.35 }));
        tnode.position.set(ax, y, az); helix.add(tnode);
        var tlab = lbl(s[i], '#ffffff'); tlab.position.set(ax, y, az + 0.36); helix.add(tlab);

        // 상보 염기 자리 — 처음엔 회색 빈칸
        var cnode = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x0f172a, transparent: true, opacity: 0.5 }));
        cnode.position.set(bx, y, bz); helix.add(cnode);
        var clab = lbl('?', '#64748b'); clab.position.set(bx, y, bz - 0.36); clab.visible = true; helix.add(clab);

        // 염기쌍 사다리 막대 (수소결합) — 처음엔 흐릿
        var dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz);
        var rung = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, len, 8),
          new THREE.MeshBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.25 }));
        rung.position.set((ax + bx) / 2, y, (az + bz) / 2);
        rung.rotation.z = Math.PI / 2; rung.rotation.y = -Math.atan2(dz, dx);
        helix.add(rung);

        rungs.push({ tnode: tnode, cnode: cnode, clab: clab, rung: rung, bx: bx, by: y, bz: bz, ang: ang, filled: false });
      }
    }

    // ── 입력: 염기 선택 ────────────────────────────────────────────────────
    function pick(base) {
      if (locked || won) return;
      var s = curStrand();
      if (idx >= s.length) return;
      if (isCorrectPair(s[idx], base)) {
        picks[idx] = base;
        fillRung(idx, base);
        beep(660 + idx * 60, 0.1, 'sine'); setTimeout(function () { beep(990, 0.1, 'sine'); }, 70);
        idx++;
        if (isStrandComplete(s, picks)) { win(); }
        else { setHud('짝 성립! 다음 염기'); }
      } else {
        score = Math.max(0, score - 5);
        triggerShake(); flashRung(idx);
        beep(140, 0.22, 'square');
        setHud('상보가 아닙니다 — ' + s[idx] + '의 짝은 ' + complement(s[idx]) + ' (−5점)');
      }
    }

    function fillRung(i, base) {
      var r = rungs[i]; if (!r) return;
      var col = BASE_COLOR[base];
      r.cnode.material.color.setHex(col); r.cnode.material.emissive.setHex(col);
      r.cnode.material.emissiveIntensity = 0.4; r.cnode.material.opacity = 1; r.cnode.material.transparent = false;
      r.clab.material.map.dispose();
      var nl = lbl(base, '#ffffff'); r.clab.material = nl.material; r.clab.scale.copy(nl.scale);
      r.rung.material.color.setHex(i % 2 === 0 ? 0xfacc15 : 0xf472b6); r.rung.material.opacity = 1;
      r.filled = true;
      burst(new THREE.Vector3(r.bx, r.by, r.bz), col);
    }

    function flashRung(i) {
      var r = rungs[i]; if (!r) return;
      r.cnode.material.emissive.setHex(0xef4444); r.cnode.material.emissiveIntensity = 0.9;
      setTimeout(function () { if (!r.filled) { r.cnode.material.emissive.setHex(0x0f172a); r.cnode.material.emissiveIntensity = 0; } }, 320);
    }

    function triggerShake() { shakeUntil = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + 380; shakeMag = 0.5; }

    function win() {
      won = true; locked = true;
      var bonus = 100 + lvl * 50; score += bonus;
      chime();
      rungs.forEach(function (r) { burst(new THREE.Vector3(r.bx, r.by, r.bz), 0x22c55e); });
      lvl++;
      if (lvl >= LEVELS.length) {
        setHud('🎉 모든 가닥 완성! 총 ' + score + '점 클리어');
        setTimeout(function () { lvl = 0; score = 0; startLevel(); }, 3000);
      } else {
        setHud('가닥 완성! 다음 단계 (+' + bonus + ')');
        setTimeout(function () { startLevel(); }, 1700);
      }
    }

    function startLevel() {
      idx = 0; picks = []; won = false; locked = false;
      buildHelix(); setHud();
    }

    // 회전 드래그(보기용)
    var md = false, px = 0, py = 0;
    function toXY(e) { var p = e.touches ? e.touches[0] : e; return { x: p.clientX, y: p.clientY }; }
    function onDown(e) { md = true; var p = toXY(e); px = p.x; py = p.y; }
    function onMove(e) { if (!md) return; var p = toXY(e); helix.rotation.y += (p.x - px) * 0.006; px = p.x; py = p.y; e.preventDefault(); }
    function onUp() { md = false; }
    var el = rndr.domElement;
    el.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false }); el.addEventListener('touchmove', onMove, { passive: false }); el.addEventListener('touchend', onUp, { passive: false });

    // 파티클
    var parts = [];
    function burst(p, color) {
      for (var i = 0; i < 12; i++) {
        var sp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), new THREE.MeshBasicMaterial({ color: color }));
        sp.position.copy(p); var a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI;
        sp.userData.v = new THREE.Vector3(Math.cos(a) * Math.sin(b), Math.cos(b), Math.sin(a) * Math.sin(b)).multiplyScalar(2.6 + Math.random() * 2);
        sp.userData.life = 0.7; scene.add(sp); parts.push(sp);
      }
    }

    var last = null;
    function loop(ts) {
      requestAnimationFrame(loop);
      var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts;
      if (!md) helix.rotation.y += 0.004;
      // 흔들림
      var now = ts;
      if (now < shakeUntil) { helix.position.x = (Math.random() - 0.5) * shakeMag; shakeMag *= 0.92; }
      else helix.position.x = 0;
      // 현재 칸 강조 펄스
      for (var i = 0; i < rungs.length; i++) {
        var r = rungs[i];
        if (i === idx && !won) { var s2 = 1 + 0.12 * Math.sin(ts / 220); r.cnode.scale.setScalar(s2); }
        else r.cnode.scale.setScalar(1);
      }
      for (var j = parts.length - 1; j >= 0; j--) {
        var s = parts[j]; s.userData.life -= dt;
        if (s.userData.life <= 0) { scene.remove(s); parts.splice(j, 1); continue; }
        s.userData.v.y -= 6 * dt; s.position.addScaledVector(s.userData.v, dt);
        s.material.transparent = true; s.material.opacity = Math.max(0, s.userData.life);
      }
      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    // 사운드
    var actx = null;
    function beep(f, d, type) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 'triangle'); }, i * 110); }); }

    startLevel();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
