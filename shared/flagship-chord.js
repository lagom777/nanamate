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

    // 모션 최소화 선호: 스윙·셰이크·파티클 게이트.
    var RM = false;
    try { RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) {}

    var W = host.clientWidth || 640, H = 360, scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 200);
      cam.position.set(0, 7.5, 11.5); cam.lookAt(0, 0, -0.8);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    var kernel = window.NMGameKernel && window.NMGameKernel.create ? window.NMGameKernel.create(host, { gameId: 'chord' }) : null;
    var TRANSFER_LINE = '장3화음=근음+장3도+완전5도(반음 0·4·7). 귀로 확인하며 쌓는다.';
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:pointer;touch-action:none;display:block;background:linear-gradient(180deg,#3b0764 0%,#1b0a38 46%,#03010a 100%)';
    host.appendChild(rndr.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.62));
    var dl = new THREE.DirectionalLight(0xffffff, 0.4); dl.position.set(3, 9, 6); scene.add(dl);

    // 무대 스포트라이트 2개(좌·우). 천천히 스윙 — RM이면 고정.
    function makeSpot(color, x) {
      var sp = new THREE.SpotLight(color, 0.85, 60, 0.5, 0.5, 1.0);
      sp.position.set(x, 11, 5);
      sp.target.position.set(x * 0.35, 0, 0);
      scene.add(sp); scene.add(sp.target);
      return sp;
    }
    var spotL = makeSpot(0xc4b5fd, -7), spotR = makeSpot(0x93c5fd, 7);

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
      { root: 60, type: 'major' },  // C 장3
      { root: 62, type: 'minor' },  // D 단3
      { root: 65, type: 'major' },  // F 장3
      { root: 67, type: 'minor' },  // G 단3
      { root: 60, type: 'dim' },
      { root: 64, type: 'aug' },
      { root: 60, type: 'dom7' },
      { root: 65, type: 'dom7' },   // F7
      { root: 57, type: 'major' },  // A 장3 (낮은 옥타브 근처)
      { root: 62, type: 'dom7' }
    ];
    var lvl = 0, score = 0, won = false;
    var target = [];      // 목표 MIDI들
    var selected = [];    // 선택한 MIDI들

    // ===== 트윈 (rAF 단일 루프에서 처리) =====
    var tweens = [];
    function addTween(dur, fn, done) { var tw = { t: 0, dur: dur, fn: fn, done: done, dead: false }; tweens.push(tw); return tw; }
    function easeOut(p) { return 1 - (1 - p) * (1 - p); }

    // 건반 프레스: 즉시 스냅 대신 0.06s 다운 트윈 / 릴리즈 업 트윈.
    function pressKey(k, down) {
      if (k.yTw) k.yTw.dead = true;
      var from = k.mesh.position.y;
      var to = k.mesh.userData.key.baseY - (down ? 0.18 : 0);
      k.yTw = addTween(down ? 0.06 : 0.1, function (p) {
        if (k.celebrate == null) k.mesh.position.y = from + (to - from) * easeOut(p);
      });
    }
    // emissive 글로우 펄스(색은 즉시 setHex 유지, intensity만 트윈).
    function pulseEmissive(k, peak) {
      addTween(0.5, function (p) { k.mesh.material.emissiveIntensity = 1 + (peak - 1) * Math.sin(Math.PI * p); });
    }
    // 오답: 빨강 플래시 + 좌우 미세 셰이크(RM 게이트).
    function flashWrong(k) {
      pulseEmissive(k, 3.2);
      if (!RM) k.shakeT = 0.32;
    }

    function loadLevel() {
      won = false; selected = [];
      var L = levels[lvl];
      target = chordNotes(L.root, L.type);
      keys.forEach(function (k) {
        k.selected = false; k.correct = false;
        if (k.yTw) { k.yTw.dead = true; k.yTw = null; }
        k.shakeT = null; k.celebrate = null;
        k.mesh.material.color.setHex(k.white ? 0xf8fafc : 0x1f2937);
        k.mesh.material.emissive.setHex(0x000000);
        k.mesh.material.emissiveIntensity = 1;
        k.mesh.position.y = k.mesh.userData.key.baseY;
        k.mesh.position.x = k.baseX;
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
      var L = levels[Math.min(lvl, levels.length - 1)];
      var rootName = noteLabel(L.root);
      var t = CHORD_TYPES[L.type];
      return rootName + ' ' + t.name;
    }
    function setHud(msg) {
      var li = Math.min(lvl, levels.length - 1);
      var L = levels[li];
      // 목표 인터벌 배지 (예: 0-4-7)
      var badges = CHORD_TYPES[L.type].intervals.map(function (iv) {
        return '<span style="display:inline-block;min-width:14px;text-align:center;padding:0 5px;margin:0 1px;border-radius:999px;background:rgba(139,92,246,.42);border:1px solid rgba(196,181,253,.6);font-size:11px;font-weight:700">' + iv + '</span>';
      }).join('');
      // 선택 진행 ●○○ 점
      var dots = '';
      for (var i = 0; i < target.length; i++) {
        dots += i < selected.length
          ? '<span style="color:#c4b5fd;text-shadow:0 0 7px #a855f7">●</span>'
          : '<span style="color:rgba(255,255,255,.4)">○</span>';
      }
      hud.innerHTML = '🎯 목표: <b>' + targetText() + '</b> ' + badges
        + '<br>🏆 ' + score + '점 · 단계 ' + (li + 1) + '/' + levels.length
        + ' · <span style="letter-spacing:4px;font-size:13px">' + dots + '</span>'
        + (msg ? '<br><span style="color:#fde047">' + msg + '</span>' : '');
    }

    // 배경 패널 — 광택 스탠다드 머티리얼(낮은 roughness)로 건반·조명 반사 무드.
    var panel = new THREE.Mesh(
      new THREE.PlaneGeometry(totalW + 2.2, whiteLen + 1.4),
      new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.16, metalness: 0.35 })
    );
    panel.rotation.x = -Math.PI / 2; panel.position.set(0, -0.02, -0.0); scene.add(panel);

    // 뒤편 부유 입자 한 겹(느린 Points) — RM이면 생략.
    var dust = null;
    if (!RM) {
      var DUST_N = 80, dpos = new Float32Array(DUST_N * 3), dvel = new Float32Array(DUST_N);
      for (var di = 0; di < DUST_N; di++) {
        dpos[di * 3] = (Math.random() - 0.5) * 20;
        dpos[di * 3 + 1] = Math.random() * 8;
        dpos[di * 3 + 2] = -2.5 - Math.random() * 6;
        dvel[di] = 0.1 + Math.random() * 0.25;
      }
      var dgeo = new THREE.BufferGeometry();
      dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
      dust = new THREE.Points(dgeo, new THREE.PointsMaterial({ color: 0xa78bfa, size: 0.08, transparent: true, opacity: 0.5, depthWrite: false }));
      dust.userData = { pos: dpos, v: dvel, n: DUST_N };
      scene.add(dust);
    }

    // ===== 음표 글리프 스프라이트 풀 (♪ 캔버스 텍스처, 상승+페이드) =====
    var noteTex = (function () {
      var cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
      var x2 = cv.getContext('2d');
      x2.font = '700 46px "Noto Sans KR",sans-serif'; x2.textAlign = 'center'; x2.textBaseline = 'middle';
      x2.shadowColor = 'rgba(196,181,253,0.9)'; x2.shadowBlur = 10;
      x2.fillStyle = '#ffffff'; x2.fillText('♪', 32, 34);
      var tx = new THREE.CanvasTexture(cv); tx.minFilter = THREE.LinearFilter; return tx;
    })();
    var noteSprites = [];
    for (var ni = 0; ni < 10; ni++) {
      var nsp = new THREE.Sprite(new THREE.SpriteMaterial({ map: noteTex, transparent: true, opacity: 0, depthWrite: false }));
      nsp.scale.set(0.65, 0.65, 1); nsp.visible = false; nsp.userData.life = 0;
      scene.add(nsp); noteSprites.push(nsp);
    }
    function spawnNote(k) {
      if (RM) return;
      for (var i = 0; i < noteSprites.length; i++) {
        if (!noteSprites[i].visible) {
          var s = noteSprites[i];
          s.position.set(k.mesh.position.x, (k.white ? whiteH : blackH + 0.02) + 0.4, k.mesh.position.z);
          s.userData.life = 0.9; s.visible = true; s.material.opacity = 1;
          return;
        }
      }
    }

    // ===== 링 리플 풀 (건반 표면에서 확장+페이드) =====
    var rings = [];
    for (var ri = 0; ri < 8; ri++) {
      var rgm = new THREE.Mesh(
        new THREE.RingGeometry(0.22, 0.34, 24),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
      );
      rgm.rotation.x = -Math.PI / 2; rgm.visible = false; rgm.userData.life = 0;
      scene.add(rgm); rings.push(rgm);
    }
    function spawnRing(k, color) {
      if (RM) return;
      for (var i = 0; i < rings.length; i++) {
        if (!rings[i].visible) {
          var r = rings[i];
          r.material.color.setHex(color);
          r.position.set(k.mesh.position.x, (k.white ? whiteH : blackH + 0.02) + 0.03, k.mesh.position.z);
          r.scale.set(1, 1, 1); r.userData.life = 0.45; r.visible = true; r.material.opacity = 0.85;
          return;
        }
      }
    }

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
        k.mesh.material.emissiveIntensity = 1;
        pressKey(k, false); // 릴리즈 업 트윈
        if (hovered === k) hovered = null;
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
      pressKey(k, true); // 눌림 다운 트윈
      spawnNote(k);
      spawnRing(k, ok ? 0x34d399 : 0xf87171);
      if (ok) pulseEmissive(k, 2.6); else flashWrong(k);
      if (!ok) {
        dissonance(); // 불협
        setHud('✗ 목표에 없는 음 — 다시 클릭해 해제하세요');
        if (kernel) kernel.teach({ kind: 'fail', outcome: 'wrong-note', coach: '목표 화음에 없는 음입니다', coachMid: '근음에서 반음 간격을 세어 보세요', coachDeep: '장3=0·4·7, 단3=0·3·7, 속7=0·4·7·10' });
      } else {
        setHud(isChordComplete(selected, target) ? '' : '✓ 좋아요, 계속 쌓으세요');
      }
      if (isChordComplete(selected, target)) win();
    }
    var el = rndr.domElement;
    el.addEventListener('mousedown', onTap);
    el.addEventListener('touchstart', onTap, { passive: false });

    // 호버 하이라이트 — 마우스 전용(터치 무시, 기존 탭 동작 불변).
    var hovered = null;
    function clearHover() {
      if (hovered && !hovered.selected) { hovered.mesh.material.emissive.setHex(0x000000); hovered.mesh.material.emissiveIntensity = 1; }
      hovered = null;
    }
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var k = pick(e);
      if (k === hovered) return;
      clearHover();
      hovered = k;
      if (k && !k.selected) {
        k.mesh.material.emissive.setHex(k.white ? 0x8b5cf6 : 0xa78bfa);
        k.mesh.material.emissiveIntensity = 0.22;
      }
    });
    el.addEventListener('pointerleave', clearHover);

    // ===== 승리 연출 DOM =====
    // '+100' 플로팅 팝업 — 화음 중앙 건반 위 스크린 좌표에 투사.
    function scorePop(text) {
      var mid = target[target.length >> 1], km = null;
      for (var i = 0; i < keys.length; i++) { if (keys[i].midi === mid) { km = keys[i]; break; } }
      var v = new THREE.Vector3(km ? km.baseX : 0, 1.6, 0).project(cam);
      var rect = rndr.domElement.getBoundingClientRect();
      var x = (v.x * 0.5 + 0.5) * rect.width, y = (-v.y * 0.5 + 0.5) * rect.height;
      var d = document.createElement('div');
      d.textContent = text;
      d.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;transform:translate(-50%,-50%);font:800 22px "Noto Sans KR",sans-serif;color:#fde047;text-shadow:0 0 12px rgba(250,204,21,.8),0 1px 3px rgba(0,0,0,.7);pointer-events:none;opacity:1;transition:transform 1s cubic-bezier(.2,.7,.3,1),opacity 1s';
      host.appendChild(d);
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        d.style.transform = 'translate(-50%,-50%) translateY(-46px)';
        d.style.opacity = '0';
      }); });
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 1100);
    }
    // 완성 화음 이름 대형 배너 — scale-in 후 페이드.
    function showBanner(text) {
      var b = document.createElement('div');
      b.textContent = '🎵 ' + text;
      b.style.cssText = 'position:absolute;left:50%;top:36%;transform:translate(-50%,-50%) scale(.4);opacity:0;font:800 30px "Noto Sans KR",sans-serif;color:#fff;text-shadow:0 2px 20px rgba(168,85,247,.95),0 1px 3px rgba(0,0,0,.6);pointer-events:none;white-space:nowrap;transition:transform .3s cubic-bezier(.2,1.7,.4,1),opacity .22s';
      host.appendChild(b);
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        b.style.opacity = '1'; b.style.transform = 'translate(-50%,-50%) scale(1)';
      }); });
      setTimeout(function () {
        b.style.transition = 'transform .5s ease-in,opacity .5s ease-in';
        b.style.opacity = '0'; b.style.transform = 'translate(-50%,-50%) scale(1.12)';
      }, 1000);
      setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 1600);
    }
    // 완성 순간 스포트라이트 인텐시티 플래시.
    function flashSpots() {
      addTween(0.7, function (p) {
        var v = 0.85 + 1.7 * Math.sin(Math.PI * p);
        spotL.intensity = v; spotR.intensity = v;
      });
    }

    // ===== 승리 =====
    function win() {
      won = true; score += 100;
      // 화음 재생 (구성음 미세 스태거 → 스트럼 느낌)
      playChord(target.map(midiToFreq), 1.1);
      // 목표 건반 순차 웨이브 바운스(위상차) + 보라 파티클 분수
      var order = 0;
      keys.forEach(function (k) {
        if (target.indexOf(k.midi) !== -1) {
          burst(k.mesh.position.clone().add(new THREE.Vector3(0, 1, 0)), 0xa855f7);
          k.celebrate = -order * 0.12; order++;
        }
      });
      flashSpots();
      scorePop('+100');
      showBanner(targetText() + '!');
      lvl++;
      if (lvl >= levels.length) {
        setHud('🎉 모든 화음 완성! 클리어 · 총 ' + score + '점');
        el.style.pointerEvents = 'none';
        if (kernel) {
          kernel.saveBest(score);
          kernel.teach({ kind: 'clear', transfer: TRANSFER_LINE, onAgain: function () {
            el.style.pointerEvents = ''; lvl = 0; score = 0; loadLevel();
          }});
        } else setTimeout(function () { el.style.pointerEvents = ''; lvl = 0; score = 0; loadLevel(); }, 3000);
      } else {
        setHud('🎵 화음 완성! 다음 단계');
        if (kernel) kernel.teach({ kind: 'success', coach: '화음 구성음이 맞았습니다' });
        setTimeout(function () { loadLevel(); }, 1700);
      }
    }

    // ===== 파티클 (풀링 + 상한) =====
    var PART_MAX = 90;
    var partGeo = new THREE.SphereGeometry(0.09, 6, 6);
    var partPool = [];
    for (var pi = 0; pi < PART_MAX; pi++) {
      var pm = new THREE.Mesh(partGeo, new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 1 }));
      pm.visible = false; pm.userData = { v: new THREE.Vector3(), life: 0 };
      scene.add(pm); partPool.push(pm);
    }
    function burst(p, color) {
      if (RM) return;
      var made = 0;
      for (var i = 0; i < partPool.length && made < 16; i++) {
        var s = partPool[i];
        if (s.visible) continue;
        s.material.color.setHex(color);
        s.position.copy(p);
        var a = Math.random() * Math.PI * 2;
        // 분수: 수직 위주 속도
        s.userData.v.set(Math.cos(a) * (0.7 + Math.random() * 1.2), 3.0 + Math.random() * 2.6, Math.sin(a) * (0.7 + Math.random() * 1.2));
        s.userData.life = 0.9; s.material.opacity = 1; s.visible = true;
        made++;
      }
    }

    // ===== 루프 (단일 rAF) =====
    var lastTs = null;
    function loop(ts) {
      requestAnimationFrame(loop);
      var dt = lastTs == null ? 0.016 : Math.min(0.05, (ts - lastTs) / 1000); lastTs = ts;
      if (!RM) {
        scene.rotation.y = 0.06 * Math.sin(ts / 2200);
        // 스포트라이트 느린 스윙
        spotL.target.position.x = -2.4 + Math.sin(ts / 1900) * 3.2;
        spotR.target.position.x = 2.4 + Math.sin(ts / 2300 + 2.1) * 3.2;
      }
      // 트윈 진행
      for (var ti = tweens.length - 1; ti >= 0; ti--) {
        var tw = tweens[ti];
        if (!tw.dead) {
          tw.t += dt; var p = Math.min(1, tw.t / tw.dur);
          tw.fn(p);
          if (p >= 1) { tw.dead = true; if (tw.done) tw.done(); }
        }
        if (tw.dead) tweens.splice(ti, 1);
      }
      keys.forEach(function (k) {
        // 정답 건반 순차 웨이브 바운스(음이 낮은 순 위상차)
        if (k.celebrate != null) {
          k.celebrate += dt;
          var c = Math.max(0, k.celebrate);
          // 위상차 대기 중엔 눌린 깊이 유지, 자기 차례에 부드럽게 복귀하며 바운스(스냅 방지).
          var rise = Math.min(1, c * 6);
          k.mesh.position.y = k.mesh.userData.key.baseY - 0.18 * (1 - rise) + Math.max(0, Math.sin(c * 8)) * 0.35;
          if (k.celebrate > 1.2) { k.celebrate = null; k.mesh.position.y = k.mesh.userData.key.baseY; }
        }
        // 오답 좌우 미세 셰이크
        if (k.shakeT != null) {
          k.shakeT -= dt;
          if (k.shakeT <= 0) { k.shakeT = null; k.mesh.position.x = k.baseX; }
          else { k.mesh.position.x = k.baseX + Math.sin(k.shakeT * 75) * 0.05 * (k.shakeT / 0.32); }
        }
      });
      // 파티클(풀)
      for (var i = 0; i < partPool.length; i++) {
        var s = partPool[i];
        if (!s.visible) continue;
        s.userData.life -= dt;
        if (s.userData.life <= 0) { s.visible = false; continue; }
        s.userData.v.y -= 8 * dt; s.position.addScaledVector(s.userData.v, dt);
        s.material.opacity = Math.max(0, s.userData.life);
      }
      // 음표 스프라이트 상승+페이드
      for (var i2 = 0; i2 < noteSprites.length; i2++) {
        var ns = noteSprites[i2];
        if (!ns.visible) continue;
        ns.userData.life -= dt;
        if (ns.userData.life <= 0) { ns.visible = false; continue; }
        ns.position.y += dt * 1.7;
        ns.material.opacity = Math.min(1, (ns.userData.life / 0.9) * 1.4);
      }
      // 링 리플 확장+페이드
      for (var i3 = 0; i3 < rings.length; i3++) {
        var rr = rings[i3];
        if (!rr.visible) continue;
        rr.userData.life -= dt;
        if (rr.userData.life <= 0) { rr.visible = false; continue; }
        var gp = 1 - rr.userData.life / 0.45;
        var sc = 1 + gp * 2.4;
        rr.scale.set(sc, sc, 1);
        rr.material.opacity = 0.85 * (1 - gp);
      }
      // 부유 입자 드리프트
      if (dust) {
        var dp = dust.userData.pos;
        for (var i4 = 0; i4 < dust.userData.n; i4++) {
          dp[i4 * 3 + 1] += dust.userData.v[i4] * dt;
          if (dp[i4 * 3 + 1] > 8) dp[i4 * 3 + 1] = 0;
        }
        dust.geometry.attributes.position.needsUpdate = true;
      }
      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    // ===== WebAudio — 피아노 톤 근사(순수 합성: triangle + 옥타브 위 sine, lowpass, 엔벨로프) =====
    var actx = null;
    function resumeAudio() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {} }
    function playNote(freq, dur, delay) {
      try {
        resumeAudio(); if (!actx) return;
        var t = actx.currentTime + (delay || 0);
        var g = actx.createGain();
        var fl = actx.createBiquadFilter();
        fl.type = 'lowpass'; fl.frequency.value = Math.min(7000, freq * 7); fl.Q.value = 0.6;
        g.connect(fl); fl.connect(actx.destination);
        // 짧은 어택 + 자연스러운 릴리즈
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.2, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.06, t + dur * 0.45);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        var o1 = actx.createOscillator(), g1 = actx.createGain();
        o1.type = 'triangle'; o1.frequency.value = freq; o1.detune.value = -3;
        g1.gain.value = 0.85; o1.connect(g1); g1.connect(g);
        var o2 = actx.createOscillator(), g2 = actx.createGain();
        o2.type = 'sine'; o2.frequency.value = freq * 2; o2.detune.value = 5;
        g2.gain.value = 0.3; o2.connect(g2); g2.connect(g);
        o1.start(t); o2.start(t);
        o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
      } catch (e) {}
    }
    function playChord(freqs, dur) {
      // 구성음 미세 스태거(수 ms) — 스트럼 느낌
      freqs.forEach(function (f, i) { playNote(f, dur, i * 0.03); });
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
