/* 나나메이트 플래그십 3D 게임 — 화음 쌓기 (aboutMusic/03-harmony)
 * 3D 건반(한 옥타브+). 근음과 목표 화음 종류가 주어지면, 정확한 반음 간격의 건반을 클릭해 화음을 쌓는다.
 * 장3화음=근음+장3도(4반음)+완전5도(7반음), 단3화음=근음+단3도(3)+완전5도(7),
 * 감3화음=근음+단3도(3)+감5도(6), 증3화음=근음+장3도(4)+증5도(8), 속7화음=근음+4+7+단7도(10).
 * 음높이는 12평균율 f = 440·2^((n−69)/12). WebAudio로 각 음을 재생, 완성 시 화음을 동시에 울린다.
 * 컨테이너: <div id="nm-chord"></div>. THREE(r128) 전역 필요. WebGL 실패 시 안내문으로 graceful.
 */
(function () {
  // ===== 순수 로직 (테스트 가능, THREE/DOM 무관) =====
  // 각 화음 종류: 근음으로부터의 반음 간격(intervals).
  var CHORD_TYPES = {
    major: { name: '장3화음', intervals: [0, 4, 7], sym: '' },
    minor: { name: '단3화음', intervals: [0, 3, 7], sym: 'm' },
    dim: { name: '감3화음', intervals: [0, 3, 6], sym: 'dim' },
    aug: { name: '증3화음', intervals: [0, 4, 8], sym: 'aug' },
    dom7: { name: '속7화음', intervals: [0, 4, 7, 10], sym: '7' }
  };
  var NOTE_NAMES = ['도', '도#', '레', '레#', '미', '파', '파#', '솔', '솔#', '라', '라#', '시'];

  // MIDI note number(반음 인덱스, 0=C) → 주파수(Hz), 12평균율.
  function midiToFreq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  // 근음 MIDI + 화음종류 → 목표 음들의 MIDI 배열(절대 음높이).
  function chordNotes(rootMidi, typeKey) {
    var t = CHORD_TYPES[typeKey];
    return t.intervals.map(function (iv) { return rootMidi + iv; });
  }

  // 승리 판정: 선택한 MIDI 집합이 목표 MIDI 집합과 정확히 일치하는가(개수·구성 모두).
  function isChordComplete(selectedMidis, targetMidis) {
    if (selectedMidis.length !== targetMidis.length) return false;
    var sel = selectedMidis.slice().sort(function (a, b) { return a - b; });
    var tgt = targetMidis.slice().sort(function (a, b) { return a - b; });
    for (var i = 0; i < tgt.length; i++) { if (sel[i] !== tgt[i]) return false; }
    return true;
  }

  // 선택한 음이 목표에 속하는 올바른 음인지(클릭 즉시 피드백용).
  function isCorrectNote(midi, targetMidis) { return targetMidis.indexOf(midi) !== -1; }

  // 노드/브라우저 양쪽에서 테스트 가능하도록 export.
  var LOGIC = {
    CHORD_TYPES: CHORD_TYPES, NOTE_NAMES: NOTE_NAMES,
    midiToFreq: midiToFreq, chordNotes: chordNotes,
    isChordComplete: isChordComplete, isCorrectNote: isCorrectNote
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = LOGIC; }
  if (typeof window !== 'undefined') { window.NM_CHORD_LOGIC = LOGIC; }
  if (typeof document === 'undefined') return; // 노드 테스트 환경이면 여기서 종료.

  // ===== 3D 게임 =====
  function init() {
    var host = document.getElementById('nm-chord');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }

    var W = host.clientWidth || 640, H = 360, scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 200);
      cam.position.set(0, 7.5, 11.5); cam.lookAt(0, 0, -0.8);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:pointer;touch-action:none;display:block';
    host.appendChild(rndr.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.82));
    var dl = new THREE.DirectionalLight(0xffffff, 0.55); dl.position.set(3, 9, 6); scene.add(dl);

    // 건반: C4(MIDI 60) ~ E5(MIDI 76) = 17개 반음. 흰건반 패턴으로 배치.
    var LOW = 60, HIGH = 76; // 포함 범위
    var WHITE = [0, 2, 4, 5, 7, 9, 11]; // 옥타브 내 흰건반 반음 인덱스
    function isWhite(midi) { return WHITE.indexOf(((midi % 12) + 12) % 12) !== -1; }

    var keys = []; // {midi, mesh, white, baseX, selected, correct}
    var whiteW = 1.05, whiteGap = 0.06, whiteLen = 3.0, whiteH = 0.5;
    var blackW = 0.62, blackLen = 1.9, blackH = 0.85;

    // 흰건반 x좌표 누적 배치, 검은건반은 인접 흰건반 사이.
    var whiteIndex = 0, whiteXOf = {}; // midi -> x
    var m;
    for (m = LOW; m <= HIGH; m++) { if (isWhite(m)) { whiteXOf[m] = whiteIndex * (whiteW + whiteGap); whiteIndex++; } }
    var totalW = (whiteIndex - 1) * (whiteW + whiteGap);
    var offX = -totalW / 2;

    var whiteMat = function () { return new THREE.MeshStandardMaterial({ color: 0xf8fafc, emissive: 0x000000, metalness: 0.05, roughness: 0.6 }); };
    var blackMat = function () { return new THREE.MeshStandardMaterial({ color: 0x1f2937, emissive: 0x000000, metalness: 0.1, roughness: 0.5 }); };

    for (m = LOW; m <= HIGH; m++) {
      var w = isWhite(m);
      var x;
      if (w) { x = whiteXOf[m] + offX; }
      else {
        // 검은건반: 바로 아래 흰건반과 바로 위 흰건반 사이.
        var lo = m - 1, hi = m + 1;
        var xl = whiteXOf[lo] !== undefined ? whiteXOf[lo] + offX : null;
        var xh = whiteXOf[hi] !== undefined ? whiteXOf[hi] + offX : null;
        x = (xl != null && xh != null) ? (xl + xh) / 2 : (xl != null ? xl + (whiteW + whiteGap) / 2 : xh - (whiteW + whiteGap) / 2);
      }
      var geo = w ? new THREE.BoxGeometry(whiteW, whiteH, whiteLen) : new THREE.BoxGeometry(blackW, blackH, blackLen);
      var mat = w ? whiteMat() : blackMat();
      var mesh = new THREE.Mesh(geo, mat);
      var y = w ? whiteH / 2 : blackH / 2 + 0.02;
      var z = w ? 0 : -(whiteLen - blackLen) / 2; // 검은건반은 뒤쪽으로
      mesh.position.set(x, y, z);
      mesh.userData.key = { midi: m, white: w, baseY: y, x: x };
      scene.add(mesh);
      keys.push({ midi: m, mesh: mesh, white: w, baseX: x, selected: false, correct: false });
    }

    // 음 이름 라벨(흰건반 위 작은 캔버스 스프라이트) — 옥타브 표시 포함.
    function noteLabel(midi) { return NOTE_NAMES[((midi % 12) + 12) % 12]; }

    // 단계 정의: 근음(MIDI)과 화음 종류. 사실 정확한 음정만 사용.
    var levels = [
      { root: 60, type: 'major' },  // C 장3화음 (도-미-솔)
      { root: 62, type: 'minor' },  // D 단3화음 (레-파-라)
      { root: 65, type: 'major' },  // F 장3화음 (파-라-도)
      { root: 60, type: 'dim' },    // C 감3화음 (도-레#-파#)
      { root: 64, type: 'aug' },    // E 증3화음 (미-솔#-도)  (=라#? 8반음 위 → 64+8=72=도)
      { root: 60, type: 'dom7' }    // C 속7화음 (도-미-솔-시♭)
    ];
    var lvl = 0, score = 0, won = false;
    var target = [];      // 목표 MIDI들
    var selected = [];    // 선택한 MIDI들

    function loadLevel() {
      won = false; selected = [];
      var L = levels[lvl];
      target = chordNotes(L.root, L.type);
      keys.forEach(function (k) {
        k.selected = false; k.correct = false;
        k.mesh.material.color.setHex(k.white ? 0xf8fafc : 0x1f2937);
        k.mesh.material.emissive.setHex(0x000000);
        k.mesh.position.y = k.mesh.userData.key.baseY;
      });
      setHud();
    }

    // ===== HUD =====
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:12px;top:10px;font:700 14px "Noto Sans KR",sans-serif;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.55);pointer-events:none;line-height:1.55';
    host.appendChild(hud);
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;right:12px;bottom:10px;font:600 12px "Noto Sans KR",sans-serif;color:#ede9fe;text-shadow:0 1px 3px rgba(0,0,0,.6);pointer-events:none;text-align:right;max-width:60%';
    tip.textContent = '건반을 클릭해 목표 화음을 쌓으세요 · 다시 클릭하면 선택 해제';
    host.appendChild(tip);

    function targetText() {
      var L = levels[lvl];
      var rootName = noteLabel(L.root);
      var t = CHORD_TYPES[L.type];
      return rootName + ' ' + t.name;
    }
    function setHud(msg) {
      var L = levels[lvl];
      var iv = CHORD_TYPES[L.type].intervals.join('-');
      hud.innerHTML = '🎯 목표: <b>' + targetText() + '</b> (근음 ' + noteLabel(L.root) + ' 기준 ' + iv + '반음)'
        + '<br>🏆 ' + score + '점 · 단계 ' + (lvl + 1) + '/' + levels.length
        + ' · 선택 ' + selected.length + '/' + target.length
        + (msg ? '<br><span style="color:#fde047">' + msg + '</span>' : '');
    }

    // 배경 패널
    var panel = new THREE.Mesh(new THREE.PlaneGeometry(totalW + 2.2, whiteLen + 1.4), new THREE.MeshBasicMaterial({ color: 0x2e1065 }));
    panel.rotation.x = -Math.PI / 2; panel.position.set(0, -0.02, -0.0); scene.add(panel);

    // ===== 입력 (마우스 + 터치, pointer) =====
    var ray = new THREE.Raycaster();
    function ndc(e) { var r = rndr.domElement.getBoundingClientRect(); var p = e.touches ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e); return new THREE.Vector2(((p.clientX - r.left) / r.width) * 2 - 1, -((p.clientY - r.top) / r.height) * 2 + 1); }
    function pick(e) {
      ray.setFromCamera(ndc(e), cam);
      var meshes = keys.map(function (k) { return k.mesh; });
      var hits = ray.intersectObjects(meshes, false);
      if (hits.length) {
        // 검은건반이 흰건반보다 위(y큼)라 자연스럽게 먼저 잡힘. 가장 가까운 hit 사용.
        return findKey(hits[0].object);
      }
      return null;
    }
    function findKey(mesh) { for (var i = 0; i < keys.length; i++) { if (keys[i].mesh === mesh) return keys[i]; } return null; }

    function onTap(e) {
      if (won) return;
      e.preventDefault();
      var k = pick(e);
      if (!k) return;
      resumeAudio();
      var idx = selected.indexOf(k.midi);
      if (idx !== -1) {
        // 선택 해제
        selected.splice(idx, 1); k.selected = false; k.correct = false;
        k.mesh.material.color.setHex(k.white ? 0xf8fafc : 0x1f2937);
        k.mesh.material.emissive.setHex(0x000000);
        k.mesh.position.y = k.mesh.userData.key.baseY;
        setHud();
        return;
      }
      // 선택 추가 + 음 재생
      selected.push(k.midi); k.selected = true;
      playNote(midiToFreq(k.midi), 0.5);
      var ok = isCorrectNote(k.midi, target);
      k.correct = ok;
      k.mesh.material.color.setHex(ok ? 0x22c55e : 0xef4444);
      k.mesh.material.emissive.setHex(ok ? 0x064e25 : 0x5b1212);
      k.mesh.position.y = k.mesh.userData.key.baseY - 0.18; // 눌림
      if (!ok) {
        dissonance(); // 불협
        setHud('✗ 목표에 없는 음 — 다시 클릭해 해제하세요');
      } else {
        setHud(isChordComplete(selected, target) ? '' : '✓ 좋아요, 계속 쌓으세요');
      }
      if (isChordComplete(selected, target)) win();
    }
    var el = rndr.domElement;
    el.addEventListener('mousedown', onTap);
    el.addEventListener('touchstart', onTap, { passive: false });

    // ===== 승리 =====
    function win() {
      won = true; score += 100;
      // 화음 동시 재생
      playChord(target.map(midiToFreq), 1.1);
      // 정답 파티클 + 건반 솟구침
      keys.forEach(function (k) {
        if (target.indexOf(k.midi) !== -1) {
          burst(k.mesh.position.clone().add(new THREE.Vector3(0, 1, 0)), 0xa855f7);
          k.celebrate = 0.0;
        }
      });
      lvl++;
      if (lvl >= levels.length) {
        setHud('🎉 모든 화음 완성! 클리어 · 총 ' + score + '점');
        el.style.pointerEvents = 'none';
        setTimeout(function () { el.style.pointerEvents = ''; lvl = 0; score = 0; loadLevel(); }, 3000);
      } else {
        setHud('🎵 화음 완성! 다음 단계');
        setTimeout(function () { loadLevel(); }, 1700);
      }
    }

    // ===== 파티클 =====
    var parts = [];
    function burst(p, color) {
      for (var i = 0; i < 14; i++) {
        var s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), new THREE.MeshBasicMaterial({ color: color }));
        s.position.copy(p);
        var a = Math.random() * Math.PI * 2;
        s.userData.v = new THREE.Vector3(Math.cos(a) * 2.4, 2.6 + Math.random() * 2, Math.sin(a) * 2.4);
        s.userData.life = 0.8; scene.add(s); parts.push(s);
      }
    }

    // ===== 루프 =====
    var lastTs = null;
    function loop(ts) {
      requestAnimationFrame(loop);
      var dt = lastTs == null ? 0.016 : Math.min(0.05, (ts - lastTs) / 1000); lastTs = ts;
      scene.rotation.y = 0.06 * Math.sin(ts / 2200);
      // 정답 건반 살짝 출렁
      keys.forEach(function (k) {
        if (k.celebrate != null) {
          k.celebrate += dt;
          k.mesh.position.y = k.mesh.userData.key.baseY + Math.max(0, Math.sin(k.celebrate * 8)) * 0.35;
          if (k.celebrate > 1.2) { k.celebrate = null; k.mesh.position.y = k.mesh.userData.key.baseY; }
        }
      });
      for (var i = parts.length - 1; i >= 0; i--) {
        var s = parts[i]; s.userData.life -= dt;
        if (s.userData.life <= 0) { scene.remove(s); parts.splice(i, 1); continue; }
        s.userData.v.y -= 8 * dt; s.position.addScaledVector(s.userData.v, dt);
        s.material.transparent = true; s.material.opacity = Math.max(0, s.userData.life);
      }
      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    // ===== WebAudio =====
    var actx = null;
    function resumeAudio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {} }
    function playNote(freq, dur) {
      try {
        resumeAudio(); if (!actx) return;
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = 'triangle'; o.frequency.value = freq; o.connect(g); g.connect(actx.destination);
        var t = actx.currentTime;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.start(t); o.stop(t + dur + 0.03);
      } catch (e) {}
    }
    function playChord(freqs, dur) {
      freqs.forEach(function (f) { playNote(f, dur); });
    }
    function dissonance() {
      // 불협: 반음(약 1.06배) 차로 두 음을 부딪힘.
      try {
        resumeAudio(); if (!actx) return;
        var base = 300;
        [base, base * Math.pow(2, 1 / 12)].forEach(function (f) {
          var o = actx.createOscillator(), g = actx.createGain();
          o.type = 'sawtooth'; o.frequency.value = f; o.connect(g); g.connect(actx.destination);
          var t = actx.currentTime;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.1, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
          o.start(t); o.stop(t + 0.3);
        });
      } catch (e) {}
    }

    loadLevel();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
