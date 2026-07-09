/* 나나메이트 플래그십 3D 게임 — 포물선 발사 (aboutPhysics/01-mechanics)
 * 마우스/터치로 대포를 "당겨서" 조준(슬링샷) → 놓으면 포물선으로 날아가 표적 명중. 단계별 표적·점수·궤적·폭발·사운드.
 * 포물선 운동(중력 가속도, 발사각 45°에서 사거리 최대)을 직접 체감하며 배운다.
 * 컨테이너: <div id="nm-flagship"></div>. THREE(r128) 전역 필요. WebGL 실패 시 안내문으로 graceful.
 */
(function () {
  // ───────────────────────────── 순수 로직 (테스트 가능) ─────────────────────────────
  var G = 16;            // 중력(scene units/s^2)
  var LX = -6, LY = 0.6; // 대포 발사 지점
  // 표적 단계(x,y). 대포는 (LX,LY)에서 발사.
  var LEVELS = [{ x: 4, y: 1.6 }, { x: 6.5, y: 2.4 }, { x: 9, y: 1.2 }, { x: 7.5, y: 3.6 }];

  // 명중 점수: 기본 100 + 발사 수가 적을수록 보너스(최대 60, 음수는 0으로 바닥)
  function hitScore(shots) { return 100 + Math.max(0, 60 - shots * 5); }

  // 포물선 발사 시뮬레이션(반음함수 오일러 적분). loop()의 스텝·명중(<1.1)·빗나감(y<0.2||x>16||x<-16)을 재현.
  function simulateShot(vx, vy, targetX, targetY, dt) {
    dt = dt || 0.016;
    var x = LX, y = LY, vX = vx, vY = vy;
    for (var i = 0; i < 20000; i++) {
      vY -= G * dt; x += vX * dt; y += vY * dt;
      if (Math.hypot(x - targetX, y - targetY) < 1.1) return { hit: true, x: x, y: y };
      if (y < 0.2 || x > 16 || x < -16) return { hit: false, x: x, y: y };
    }
    return { hit: false, x: x, y: y };
  }

  var LOGIC = {
    G: G, LX: LX, LY: LY,
    LEVELS: LEVELS,
    hitScore: hitScore,
    simulateShot: simulateShot
  };
  if (typeof module !== 'undefined' && module.exports) { module.exports = LOGIC; }
  if (typeof window !== 'undefined') { window.NM_PROJECTILE_LOGIC = LOGIC; }

  // ───────────────────────────── 3D 게임 (브라우저 전용) ─────────────────────────────
  function init() {
    if (typeof document === 'undefined') return;
    var host = document.getElementById('nm-flagship');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }

    var W = host.clientWidth || 640, H = 340;
    var scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(48, W / H, 0.1, 200);
      cam.position.set(1, 6, 17); cam.lookAt(1, 2.2, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:crosshair;touch-action:none;display:block';
    host.appendChild(rndr.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    var dl = new THREE.DirectionalLight(0xffffff, 0.7); dl.position.set(-4, 10, 8); scene.add(dl);

    // 지면
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshLambertMaterial({ color: 0x14532d }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = 0; scene.add(ground);
    var grid = new THREE.GridHelper(60, 30, 0x2f6b46, 0x225239); grid.position.y = 0.01; scene.add(grid);

    // 대포
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 0.8, 16), new THREE.MeshLambertMaterial({ color: 0x334155 }));
    base.position.set(LX, 0.4, 0); scene.add(base);
    var barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 2.4, 14), new THREE.MeshLambertMaterial({ color: 0x64748b }));
    barrel.position.set(LX, LY, 0); scene.add(barrel);

    // 발사체
    var ball = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 18), new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0x664f00, metalness: 0.3, roughness: 0.4 }));
    ball.visible = false; scene.add(ball);

    // 표적(토러스)
    var target = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.18, 12, 28), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x5b1212 }));
    target.position.set(4, 1.6, 0); scene.add(target);
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8), new THREE.MeshLambertMaterial({ color: 0x9ca3af }));
    pole.position.set(4, 0.8, 0); scene.add(pole);

    // 궤적 미리보기 점
    var preview = []; for (var i = 0; i < 26; i++) { var d = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })); d.visible = false; scene.add(d); preview.push(d); }
    var trail = [];

    var lvl = 0, score = 0, shots = 0;

    // HUD
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:10px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6);pointer-events:none;line-height:1.5';
    host.appendChild(hud);
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;right:10px;bottom:10px;font:600 12px "Noto Sans KR",sans-serif;color:#e5e7eb;text-shadow:0 1px 3px rgba(0,0,0,.6);pointer-events:none;text-align:right';
    tip.textContent = '대포를 당겼다 놓아 표적을 맞히세요 · 45°에서 사거리 최대';
    host.appendChild(tip);
    function setHud(extra) { hud.innerHTML = '🏆 ' + score + '점 · 단계 ' + (lvl + 1) + '/' + LEVELS.length + ' · 발사 ' + shots + (extra ? '<br>' + extra : ''); }

    function placeTarget() { var L = LEVELS[lvl]; target.position.set(L.x, L.y, 0); pole.position.set(L.x, L.y / 2, 0); pole.scale.y = L.y / 1.6; }
    placeTarget(); setHud();

    // 발사 물리 상태
    var flying = false, vel = new THREE.Vector3(), pos = new THREE.Vector3();
    function resetBall() { flying = false; ball.visible = false; clearTrail(); }
    function clearTrail() { for (var i = 0; i < trail.length; i++) scene.remove(trail[i]); trail = []; }

    function launch(vx, vy) {
      flying = true; shots++; ball.visible = true;
      pos.set(LX, LY, 0); ball.position.copy(pos); vel.set(vx, vy, 0);
      hidePreview(); beep(220, 0.12, 'sawtooth'); setHud();
    }

    // 조준(슬링샷): 당긴 반대 방향으로, 당긴 길이만큼 세게
    var aiming = false, sx = 0, sy = 0;
    function toLocal(e) { var r = rndr.domElement.getBoundingClientRect(); var p = e.touches ? e.touches[0] : e; return { x: p.clientX - r.left, y: p.clientY - r.top }; }
    function aimVec(cx, cy) {
      var dx = cx - sx, dy = cy - sy;            // 당긴 벡터(화면)
      var vx = -dx * 0.06, vy = dy * 0.06;        // 반대 방향, 화면 아래로 당기면 위로 발사
      var sp = Math.hypot(vx, vy), MAX = 22;
      if (sp > MAX) { vx *= MAX / sp; vy *= MAX / sp; }
      return { vx: vx, vy: vy };
    }
    function showPreview(vx, vy) {
      var px = LX, py = LY, pvx = vx, pvy = vy, dt = 0.06;
      for (var i = 0; i < preview.length; i++) { px += pvx * dt; py += pvy * dt; pvy -= G * dt; if (py < 0) { preview[i].visible = false; continue; } preview[i].position.set(px, py, 0); preview[i].visible = true; }
      // 각도 HUD
      var ang = Math.round(Math.atan2(vy, vx) * 180 / Math.PI), spd = Math.round(Math.hypot(vx, vy));
      setHud('조준 ' + ang + '° · 세기 ' + spd);
    }
    function hidePreview() { for (var i = 0; i < preview.length; i++) preview[i].visible = false; }

    function onDown(e) { if (flying) return; aiming = true; var p = toLocal(e); sx = p.x; sy = p.y; e.preventDefault(); }
    function onMove(e) { if (!aiming || flying) return; var p = toLocal(e); var v = aimVec(p.x, p.y); barrel.rotation.z = Math.atan2(v.vy, v.vx) - Math.PI / 2; showPreview(v.vx, v.vy); e.preventDefault(); }
    function onUp(e) { if (!aiming || flying) return; aiming = false; var p = toLocal(e.changedTouches ? { touches: e.changedTouches } : e); var v = aimVec(p.x, p.y); if (Math.hypot(v.vx, v.vy) < 2) { hidePreview(); setHud(); return; } launch(v.vx, v.vy); e.preventDefault(); }
    var el = rndr.domElement;
    el.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false }); el.addEventListener('touchmove', onMove, { passive: false }); el.addEventListener('touchend', onUp, { passive: false });

    function burst(p, color) {
      for (var i = 0; i < 16; i++) { var s = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: color })); s.position.copy(p); var a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI; s.userData.v = new THREE.Vector3(Math.cos(a) * Math.sin(b), Math.cos(b), Math.sin(a) * Math.sin(b)).multiplyScalar(4 + Math.random() * 3); s.userData.life = 0.7; scene.add(s); parts.push(s); }
    }
    var parts = [];

    function hit() {
      score += hitScore(shots); beep(880, 0.1, 'sine'); setTimeout(function () { beep(1320, 0.14, 'sine'); }, 90);
      burst(target.position.clone(), 0xfde047);
      resetBall();
      lvl++;
      if (lvl >= LEVELS.length) { setHud('🎉 모든 표적 명중! 클리어'); chime(); flying = false; el.style.pointerEvents = 'none'; setTimeout(function () { el.style.pointerEvents = ''; lvl = 0; placeTarget(); setHud(); }, 2600); }
      else { placeTarget(); setHud('명중! 다음 표적'); }
    }
    function miss(p) { burst(p, 0x94a3b8); beep(150, 0.16, 'square'); resetBall(); setHud('빗나감 — 다시 조준'); }

    var last = null;
    function loop(ts) {
      requestAnimationFrame(loop); var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts;
      target.rotation.y += 0.03; target.rotation.x = 0.4 + 0.15 * Math.sin(ts / 600);
      if (flying) {
        vel.y -= G * dt; pos.addScaledVector(vel, dt); ball.position.copy(pos);
        var tm = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.5 })); tm.position.copy(pos); scene.add(tm); trail.push(tm); if (trail.length > 40) { scene.remove(trail.shift()); }
        if (pos.distanceTo(target.position) < 1.1) hit();
        else if (pos.y < 0.2 || pos.x > 16 || pos.x < -16) miss(pos.clone());
      }
      for (var i = parts.length - 1; i >= 0; i--) { var s = parts[i]; s.userData.life -= dt; if (s.userData.life <= 0) { scene.remove(s); parts.splice(i, 1); continue; } s.userData.v.y -= 9 * dt; s.position.addScaledVector(s.userData.v, dt); s.material.opacity = Math.max(0, s.userData.life); s.material.transparent = true; }
      for (var j = 0; j < trail.length; j++) { trail[j].material.opacity *= 0.96; }
      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    // 사운드
    var actx = null, muted = false;
    function beep(f, d, type) { if (muted) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 'triangle'); }, i * 110); }); }
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
