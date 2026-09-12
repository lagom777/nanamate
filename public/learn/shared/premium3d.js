/* 나나메이트 프리미엄 3D 레이어 (flagship 공용) — THREE r128 전용, 의존성 0
 * "비싼 게임" 느낌의 공통분모를 한 곳에:
 *   · ACES 필름 톤매핑 + sRGB 출력 (조명 있는 장면의 색이 시네마틱하게 눌림)
 *   · 3점 라이트 릭 (따뜻한 키 + 차가운 림 + 반구 환경광)
 *   · 시네 치환 — 인트로 돌리 + 아이들 드리프트 + 감쇠 셰이크
 *   · 소프트 파티클 풀 (additive 글로우 스프라이트)
 * 사용: <script src="../../shared/premium3d.js"></script> 를 flagship 스크립트보다 먼저 로드.
 * 모든 기능은 window.NMP3 존재 여부로 가드해 없어도 기존 동작 유지(graceful).
 */
(function () {
  'use strict';

  var RM = false;
  try { RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------- 렌더러: ACES 톤매핑 + sRGB ---------- */
  function renderer(w, h, opts) {
    opts = opts || {};
    var r;
    try {
      r = new THREE.WebGLRenderer({ antialias: true, alpha: opts.alpha !== false });
    } catch (e) { return null; }
    r.setSize(w, h);
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (typeof THREE.ACESFilmicToneMapping !== 'undefined') {
      r.toneMapping = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = opts.exposure || 1.12;
    }
    if (typeof THREE.sRGBEncoding !== 'undefined') r.outputEncoding = THREE.sRGBEncoding;
    return r;
  }

  /* ---------- 3점 라이트 릭 ---------- */
  function lightRig(scene, opts) {
    opts = opts || {};
    var hemi = new THREE.HemisphereLight(
      opts.sky != null ? opts.sky : 0xbcc7ff,
      opts.ground != null ? opts.ground : 0x2a2440,
      opts.hemiI != null ? opts.hemiI : 0.65);
    scene.add(hemi);
    var key = new THREE.DirectionalLight(opts.keyColor != null ? opts.keyColor : 0xffd9a0, opts.keyI != null ? opts.keyI : 1.0);
    key.position.set(opts.keyX != null ? opts.keyX : -6, opts.keyY != null ? opts.keyY : 8, opts.keyZ != null ? opts.keyZ : 9);
    scene.add(key);
    var rim = new THREE.DirectionalLight(opts.rimColor != null ? opts.rimColor : 0x7aa2ff, opts.rimI != null ? opts.rimI : 0.45);
    rim.position.set(opts.rimX != null ? opts.rimX : 7, opts.rimY != null ? opts.rimY : 4, opts.rimZ != null ? opts.rimZ : -8);
    scene.add(rim);
    return { hemi: hemi, key: key, rim: rim };
  }

  /* ---------- 캔버스 합성 래디얼 텍스처 (글로우/연기 공용) ---------- */
  function radialTex(stops, size) {
    size = size || 64;
    var c = document.createElement('canvas'); c.width = c.height = size;
    var g = c.getContext('2d'), gr = g.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2 - 2);
    for (var i = 0; i < stops.length; i++) gr.addColorStop(stops[i][0], stops[i][1]);
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }
  var _glowTex = null, _softTex = null;
  function glowTex() {
    if (!_glowTex) _glowTex = radialTex([[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,214,130,.85)'], [1, 'rgba(255,170,50,0)']]);
    return _glowTex;
  }
  function softTex() {
    if (!_softTex) _softTex = radialTex([[0, 'rgba(255,255,255,.95)'], [0.5, 'rgba(255,255,255,.45)'], [1, 'rgba(255,255,255,0)']]);
    return _softTex;
  }

  /* ---------- 소프트 파티클 풀 (additive 스프라이트, 상한 순환) ---------- */
  function particles(scene, opts) {
    opts = opts || {};
    var N = opts.max || 48;
    var mat = new THREE.SpriteMaterial({
      map: opts.soft ? softTex() : glowTex(),
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
    });
    var pool = [], head = 0;
    for (var i = 0; i < N; i++) {
      var sp = new THREE.Sprite(mat.clone());
      sp.visible = false;
      sp.userData = { life: 0, decay: 1, vx: 0, vy: 0, vz: 0, s0: 1, grow: 0 };
      scene.add(sp); pool.push(sp);
    }
    return {
      /* pos: Vector3-like · hex: 색 · n: 개수 · spd: 속도 · life: 초 · size: 크기 · up: 상승 바이어스 */
      burst: function (pos, hex, n, spd, life, size, up) {
        if (RM) return;
        for (var k = 0; k < n; k++) {
          var s = pool[head++ % N];
          s.visible = true;
          s.material.color.setHex(hex);
          s.material.opacity = 0.9;
          s.position.set(pos.x, pos.y, pos.z != null ? pos.z : 0.3);
          var a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI;
          var v = (spd || 2.5) * (0.5 + Math.random() * 0.8);
          s.userData.vx = Math.cos(a) * Math.sin(b) * v;
          s.userData.vy = Math.abs(Math.cos(b)) * v * 0.7 + (up || 0.4) * v * 0.4;
          s.userData.vz = Math.sin(a) * Math.sin(b) * v * 0.4;
          s.userData.life = 1; s.userData.decay = 1 / (life || 0.8);
          s.userData.s0 = (size || 0.5) * (0.7 + Math.random() * 0.6);
          s.userData.grow = 0.6;
          s.scale.set(s.userData.s0, s.userData.s0, 1);
        }
      },
      tick: function (dt) {
        for (var k = 0; k < N; k++) {
          var s = pool[k]; if (!s.visible) continue;
          var u = s.userData;
          u.life -= dt * u.decay;
          if (u.life <= 0) { s.visible = false; continue; }
          u.vy -= 1.6 * dt; // 가벼운 중력
          s.position.x += u.vx * dt; s.position.y += u.vy * dt; s.position.z += u.vz * dt;
          var sc = u.s0 * (1 + u.grow * (1 - u.life));
          s.scale.set(sc, sc, 1);
          s.material.opacity = 0.9 * u.life;
        }
      }
    };
  }

  /* ---------- 시네 치환: 인트로 돌리 + 아이들 드리프트 + 셰이크 ---------- */
  function cineCam(cam, base, opts) {
    opts = opts || {};
    var lookAt = opts.lookAt || { x: base.x, y: base.y, z: 0 };
    var intro = RM ? 1 : 0;                    // 0→1 인트로 돌리 진행도
    var introDur = opts.introDur || 1.4;
    var from = {
      x: base.x + (opts.dollyX != null ? opts.dollyX : 0),
      y: base.y + (opts.dollyY != null ? opts.dollyY : -1.2),
      z: base.z + (opts.dollyZ != null ? opts.dollyZ : 4.5)
    };
    var driftAmp = opts.driftAmp != null ? opts.driftAmp : 0.14;   // 아이들 호흡 드리프트
    var driftSpd = opts.driftSpd != null ? opts.driftSpd : 0.32;
    var shakeAmp = 0, shakeT = 0, shakeDur = 1;
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    return {
      tick: function (dt, tSec) {
        var ix = 0, iy = 0, iz = 0;
        if (intro < 1) {
          intro = Math.min(1, intro + dt / introDur);
          var e = easeOutCubic(intro);
          ix = (from.x - base.x) * (1 - e); iy = (from.y - base.y) * (1 - e); iz = (from.z - base.z) * (1 - e);
        }
        var dx = 0, dy = 0;
        if (!RM && driftAmp > 0) {
          dx = Math.sin(tSec * driftSpd) * driftAmp;
          dy = Math.cos(tSec * driftSpd * 0.8) * driftAmp * 0.55;
        }
        var ox = 0, oy = 0;
        if (shakeT > 0) {
          shakeT -= dt;
          var sk = Math.max(0, shakeT / shakeDur) * shakeAmp;
          ox += (Math.random() * 2 - 1) * sk; oy += (Math.random() * 2 - 1) * sk;
        }
        cam.position.set(base.x + ix + dx + ox, base.y + iy + dy + oy, base.z + iz);
        cam.lookAt(lookAt.x, lookAt.y, lookAt.z != null ? lookAt.z : 0);
      },
      shake: function (amp, dur) { if (RM) return; shakeAmp = amp; shakeT = dur; shakeDur = dur; },
      skipIntro: function () { intro = 1; }
    };
  }

  window.NMP3 = {
    RM: RM,
    renderer: renderer,
    lightRig: lightRig,
    glowTex: glowTex,
    softTex: softTex,
    radialTex: radialTex,
    particles: particles,
    cineCam: cineCam
  };
})();
