/* 나나메이트 플래그십 3D 게임 — DNA 염기쌍 (aboutBiology/02-dna)
 * 이중나선 한쪽 가닥의 염기(A/T/G/C)가 순서대로 제시되면, 4개 버튼 중 올바른 상보 염기를
 * 클릭해 페어링한다. 샤가프의 규칙(A↔T, G↔C)을 직접 체득. 맞으면 나선에 염기쌍이 채워지고
 * 다음 칸으로, 틀리면 흔들림+−5점(정답은 알려주지 않고 규칙만 상기). 연속 정답 +2 보너스.
 * 힌트 버튼(가닥당 2회, −10점)으로 현재 염기의 상보를 확인 가능. 가닥 전체를 페어링하면 클리어.
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

  // ── 여기서부터는 브라우저 전용(위 조기 return 이후에만 평가됨) ────────────
  // prefers-reduced-motion: 셰이크·부유입자·색종이 게이트.
  var RM = false;
  try { RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) {}

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  // 애니메이션 키프레임/클래스는 1회만 주입.
  function injectStyle() {
    if (document.getElementById('nmdna-style')) return;
    var st = document.createElement('style'); st.id = 'nmdna-style';
    st.textContent = [
      '.nmdna-basebtn{transition:transform .08s, box-shadow .18s}',
      '.nmdna-basebtn:hover{box-shadow:0 0 15px rgba(255,255,255,.42)}',
      '@keyframes nmdna-pop{0%{transform:scale(.92)}45%{transform:scale(1.24)}100%{transform:scale(1)}}',
      '.nmdna-pop{animation:nmdna-pop .34s cubic-bezier(.3,1.5,.5,1)}',
      '@keyframes nmdna-hintglow{0%,100%{box-shadow:0 0 5px rgba(253,224,71,.5)}50%{box-shadow:0 0 20px 5px rgba(253,224,71,.95)}}',
      '.nmdna-hintglow{animation:nmdna-hintglow .8s ease-in-out infinite}',
      '@keyframes nmdna-popup{0%{opacity:0;transform:translate(-50%,8px) scale(.75)}18%{opacity:1;transform:translate(-50%,0) scale(1.08)}70%{opacity:1}100%{opacity:0;transform:translate(-50%,-38px) scale(1)}}',
      '.nmdna-popup{animation:nmdna-popup .9s ease-out forwards}',
      '@keyframes nmdna-banner{0%{opacity:0;transform:translate(-50%,-16px) scale(.86)}14%{opacity:1;transform:translate(-50%,0) scale(1.06)}24%{transform:translate(-50%,0) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-10px)}}',
      '.nmdna-banner{animation:nmdna-banner 2.2s ease-out forwards}'
    ].join('');
    document.head.appendChild(st);
  }

  // ── 데이터: 실제 유전자에서 따온 짧은 템플릿 가닥들 ────────────────────────
  // 짧고 사실 기반인 서열들. 단계가 올라갈수록 길어진다.
  var LEVELS = [
    { strand: 'ATGC', note: '시작 코돈 ATG 맛보기' },
    { strand: 'TACG', note: '상보 연습 4염기' },
    { strand: 'ATGCAT', note: '짧은 반복' },
    { strand: 'TACGGT', note: '주형 가닥 일부' },
    { strand: 'GCTAAC', note: '혼합 서열' },
    { strand: 'ATGGCA', note: 'ATG 포함' },
    { strand: 'CGTAATCG', note: '8염기 도전' },
    { strand: 'ATGGCATAC', note: '베타글로빈 도입부 닮은 서열' },
    { strand: 'TGCATGCAAT', note: '마스터 10염기' },
    { strand: 'AATTCCGGAATTCC', note: '제한효소 자리 느낌(교육용 단순화)' }
  ];
  var TRANSFER_LINE = 'A는 T와, G는 C와 쌍을 이룬다 — 상보가 유전 정보 복사의 규칙이다.';

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
    injectStyle();
    host.innerHTML = ''; host.style.position = 'relative';
    var kernel = window.NMGameKernel && window.NMGameKernel.create ? window.NMGameKernel.create(host, { gameId: 'dna' }) : null;
    // 딥 블루 radial 그라디언트 강화(세포질 느낌).
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;touch-action:none;display:block;background:radial-gradient(ellipse at 50% 38%, #12213b 0%, #0b1220 45%, #05080f 100%)';
    host.appendChild(rndr.domElement);

    // ── DOM 오버레이(비네트/붉은 플래시/골드 틴트) — 클릭 통과 ─────────────
    function overlay(css) { var d = document.createElement('div'); d.style.cssText = 'position:absolute;inset:0;border-radius:12px;pointer-events:none;' + css; host.appendChild(d); return d; }
    overlay('background:radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 52%, rgba(2,6,14,.55) 100%);box-shadow:inset 0 0 60px rgba(0,0,0,.5)'); // 비네트
    var goldEl = overlay('background:radial-gradient(ellipse at 50% 45%, rgba(250,204,21,.5), rgba(250,204,21,0) 70%);opacity:0;transition:opacity .45s');
    var redEl = overlay('background:rgba(239,68,68,.28);opacity:0;transition:opacity .12s');

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    var dl = new THREE.DirectionalLight(0xffffff, 0.6); dl.position.set(3, 6, 8); scene.add(dl);

    var helix = new THREE.Group(); scene.add(helix);

    // ── 세포질 부유 입자 (느린 Points + 미세 반짝임) ──────────────────────
    var cyto = null, cytoMat = null;
    (function () {
      var n = 150, g = new THREE.BufferGeometry(), arr = new Float32Array(n * 3);
      for (var i = 0; i < n; i++) { arr[i * 3] = (Math.random() - 0.5) * 16; arr[i * 3 + 1] = (Math.random() - 0.5) * 12; arr[i * 3 + 2] = (Math.random() - 0.5) * 16; }
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      cytoMat = new THREE.PointsMaterial({ color: 0x7dd3fc, size: 0.09, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending });
      cyto = new THREE.Points(g, cytoMat); scene.add(cyto);
    })();

    // 부드러운 글로우 텍스처(현재 칸 additive 빌보드용) — 1회 생성.
    function makeGlowTex() {
      var c = document.createElement('canvas'); c.width = c.height = 64; var x = c.getContext('2d');
      var grd = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.4, 'rgba(255,255,255,.5)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = grd; x.fillRect(0, 0, 64, 64);
      var t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t;
    }
    var glowTex = makeGlowTex();
    var cellGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfde047, transparent: true, blending: THREE.AdditiveBlending, depthTest: false, opacity: 0.9 }));
    cellGlow.scale.set(1.6, 1.6, 1); cellGlow.visible = false; scene.add(cellGlow);

    // 상태
    var lvl = 0, score = 0, idx = 0, picks = [], won = false, locked = false;
    var streak = 0;             // 연속 정답 수 (연속 정답 보너스용)
    var hintsUsed = 0;          // 이번 가닥에서 쓴 힌트 수 (최대 2)
    var HINT_MAX = 2;
    var rungs = []; // 칸별 {tnode, cnode, clab, rung, bx,by,bz, ang, filled, fly}
    var backbones = []; // 백본 리본 2줄 — 살아있는 emissive 셰이머용 참조
    var shakeUntil = 0, shakeMag = 0;
    var wrongCell = -1, wrongUntil = 0;   // 오답 시 현재 '?' 라벨 진동
    var spinBoost = 0, camAnim = null;    // 가닥 완성 회전 가속 / 카메라 줌

    // ── HUD ───────────────────────────────────────────────────────────────
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:12px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#e5e7eb;text-shadow:0 1px 3px rgba(0,0,0,.7);pointer-events:none;line-height:1.55;max-width:62%';
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
      btn.textContent = b; btn.className = 'nmdna-basebtn';
      var hex = '#' + ('000000' + BASE_COLOR[b].toString(16)).slice(-6);
      btn.style.cssText = 'width:46px;height:46px;border-radius:12px;border:2px solid ' + hex + ';background:rgba(15,23,42,.85);color:' + hex + ';font:800 20px "Noto Sans KR",sans-serif;cursor:pointer';
      btn.onmousedown = function () { btn.style.transform = 'scale(.92)'; };
      btn.onmouseup = function () { btn.style.transform = ''; };
      btn.onmouseleave = function () { btn.style.transform = ''; };
      btn.onclick = function () { pick(b); };
      pad.appendChild(btn); btnEls[b] = btn;
    });

    // 정답 직후 눌린 버튼 팝 애니메이션
    function popBtn(b) {
      var el2 = btnEls[b]; if (!el2) return;
      el2.style.transform = ''; el2.classList.remove('nmdna-pop');
      void el2.offsetWidth; el2.classList.add('nmdna-pop');
      setTimeout(function () { el2.classList.remove('nmdna-pop'); }, 360);
    }

    // 힌트 버튼 — 현재 염기의 상보를 보여준다. 가닥당 최대 2회, 1회 −10점.
    var hintBtn = document.createElement('button');
    hintBtn.style.cssText = 'position:absolute;right:12px;top:10px;border:1px solid rgba(253,224,71,.55);border-radius:8px;background:rgba(40,34,12,.85);color:#fde047;font:700 11.5px "Noto Sans KR",sans-serif;padding:5px 9px;cursor:pointer';
    function updateHintBtn() {
      hintBtn.textContent = '💡 힌트 −10 (' + (HINT_MAX - hintsUsed) + ')';
      var out = hintsUsed >= HINT_MAX || locked || won;
      hintBtn.disabled = out; hintBtn.style.opacity = out ? '0.4' : '1';
      hintBtn.style.cursor = out ? 'not-allowed' : 'pointer';
    }
    hintBtn.onclick = function () {
      if (locked || won || hintsUsed >= HINT_MAX) return;
      var s = curStrand(); if (idx >= s.length) return;
      hintsUsed++;
      score = Math.max(0, score - 10);
      updateHintBtn();
      var comp = complement(s[idx]);
      // 해당 상보 버튼에 글로우 펄스 수 초간
      var gb = btnEls[comp];
      if (gb) { gb.classList.add('nmdna-hintglow'); setTimeout(function () { gb.classList.remove('nmdna-hintglow'); }, 2600); }
      setHud('힌트: ' + s[idx] + '의 짝은 ' + comp + ' (−10점)');
    };
    host.appendChild(hintBtn);

    function curStrand() { return LEVELS[Math.min(lvl, LEVELS.length - 1)].strand; }

    function setHud(msg) {
      var s = curStrand();
      var shown = '';
      for (var i = 0; i < s.length; i++) {
        var on = i < idx;
        var cur = i === idx;
        var pc = on ? picks[i] : (cur ? '?' : '·');
        var bg, bd, tc;
        if (cur) { bg = 'rgba(253,224,71,.22)'; bd = 'rgba(253,224,71,.9)'; tc = '#fde047'; }
        else if (on) { bg = 'rgba(34,197,94,.18)'; bd = 'rgba(34,197,94,.55)'; tc = '#86efac'; }
        else { bg = 'rgba(100,116,139,.14)'; bd = 'rgba(100,116,139,.4)'; tc = '#94a3b8'; }
        shown += '<span style="display:inline-block;margin:2px 3px 0 0;padding:1px 6px;border-radius:8px;background:' + bg + ';border:1px solid ' + bd + ';color:' + tc + ';font-weight:800;font-size:12px' + (cur ? ';box-shadow:0 0 8px rgba(253,224,71,.5)' : '') + '">' + s[i] + ':' + pc + '</span>';
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

    // 레벨 전환 시 텍스처/지오메트리 dispose (스프라이트는 공유 지오메트리라 material만).
    function clearHelix() {
      for (var i = helix.children.length - 1; i >= 0; i--) {
        var c = helix.children[i];
        helix.remove(c);
        if (c.isMesh && c.geometry) c.geometry.dispose();
        if (c.material) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); }
      }
    }

    function buildHelix() {
      clearHelix();
      rungs = [];
      backbones = [];
      var s = curStrand(), N = s.length;
      var span = Math.min(8, N * 1.5), turns = N / 5 + 0.4, R = 1.5;
      var aPts = [], bPts = [];
      for (var i = 0; i < N; i++) {
        var t = N === 1 ? 0.5 : i / (N - 1);
        var ang = t * Math.PI * 2 * turns;
        var y = (0.5 - t) * span; // 위에서 아래로 진행
        var ax = Math.cos(ang) * R, az = Math.sin(ang) * R;
        var bx = Math.cos(ang + Math.PI) * R, bz = Math.sin(ang + Math.PI) * R;
        aPts.push(new THREE.Vector3(ax, y, az));
        bPts.push(new THREE.Vector3(bx, y, bz));

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

        // 염기쌍 사다리 막대 (수소결합) — MeshStandard 로 채워질 때 emissive 글로우.
        var dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz);
        var rung = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, len, 8),
          new THREE.MeshStandardMaterial({ color: 0x475569, emissive: 0x0f172a, emissiveIntensity: 0.1, transparent: true, opacity: 0.28 }));
        rung.position.set((ax + bx) / 2, y, (az + bz) / 2);
        rung.rotation.z = Math.PI / 2; rung.rotation.y = -Math.atan2(dz, dx);
        helix.add(rung);

        rungs.push({ tnode: tnode, cnode: cnode, clab: clab, rung: rung, bx: bx, by: y, bz: bz, ang: ang, filled: false, fly: null });
      }

      // 양쪽 가닥 백본 리본 (CatmullRom + Tube, 반투명). 레벨 전환 시 clearHelix에서 dispose.
      if (aPts.length >= 2) {
        var seg = Math.max(12, N * 8);
        var tubeA = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(aPts), seg, 0.09, 8, false),
          new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x1e3a8a, emissiveIntensity: 0.4, transparent: true, opacity: 0.34, roughness: 0.4, metalness: 0.1 }));
        helix.add(tubeA); backbones.push(tubeA);
        var tubeB = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bPts), seg, 0.09, 8, false),
          new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0x831843, emissiveIntensity: 0.4, transparent: true, opacity: 0.34, roughness: 0.4, metalness: 0.1 }));
        helix.add(tubeB); backbones.push(tubeB);
      }
    }

    // 헬릭스 로컬 좌표 → 월드 좌표(회전 y + shake x 만 반영).
    function worldOf(v) {
      var c = Math.cos(helix.rotation.y), sn = Math.sin(helix.rotation.y);
      return new THREE.Vector3(v.x * c + v.z * sn + helix.position.x, v.y, -v.x * sn + v.z * c);
    }

    // ── 입력: 염기 선택 ────────────────────────────────────────────────────
    function pick(base) {
      if (locked || won) return;
      var s = curStrand();
      if (idx >= s.length) return;
      if (isCorrectPair(s[idx], base)) {
        var thisIdx = idx;
        picks[idx] = base;
        score += 10;
        streak++;
        var bonusMsg = '';
        var popupText = '+10';
        // 연속 정답 보너스: 2연속부터 매 정답 +2 (숙련 보상)
        if (streak >= 2) { score += 2; bonusMsg = ' · 🔥' + streak + '연속 +2'; popupText = '+12 🔥' + streak; }
        // 사운드: 2-tone 상승 + 콤보≥2 밝은 배음 한 겹
        beep(660 + thisIdx * 60, 0.1, 'sine');
        setTimeout(function () { beep(990, 0.1, 'sine'); }, 70);
        if (streak >= 2) { beep(1320, 0.12, 'triangle', 0.05); setTimeout(function () { beep(1760, 0.1, 'triangle', 0.04); }, 70); }
        popBtn(base);
        startFill(thisIdx, base, popupText, streak);
        goldTint(streak);
        idx++;
        if (isStrandComplete(s, picks)) { win(); }
        else { setHud('짝 성립!' + bonusMsg + ' 다음 염기'); }
      } else {
        score = Math.max(0, score - 5);
        streak = 0;
        triggerShake(); flashRung(idx); redFlash(); wrongLabel(idx);
        beep(140, 0.22, 'square');
        goldTint(0);
        // 정답을 알려주지 않고 규칙만 상기 (플래시카드가 아니라 게임)
        setHud('❌ 규칙: A는 T와, G는 C와 — 다시! (−5점)');
        if (kernel) kernel.teach({ kind: 'fail', outcome: 'pair', coach: 'A↔T, G↔C — 지금 염기의 짝만 고르세요', coachMid: '템플릿이 A면 T, G면 C입니다', coachDeep: '상보: 퓨린-피리미딘 쌍. A-T 두 수소결합, G-C 세 개(개념)' });
      }
    }

    // 상보 염기가 화면 바깥에서 날아와 안착(easeOutCubic 트윈).
    function startFill(i, base, popupText, combo) {
      var r = rungs[i]; if (!r) return;
      var col = BASE_COLOR[base];
      r.cnode.material.color.setHex(col); r.cnode.material.emissive.setHex(col);
      r.cnode.material.emissiveIntensity = 0.5; r.cnode.material.opacity = 1; r.cnode.material.transparent = false;
      r.clab.material.map.dispose(); r.clab.material.dispose();
      var nl = lbl(base, '#ffffff'); r.clab.material = nl.material; r.clab.scale.copy(nl.scale);
      r.clab.visible = false; // 안착 순간에 표시
      r.filled = true;
      var to = new THREE.Vector3(r.bx, r.by, r.bz);
      var rad = Math.hypot(r.bx, r.bz) || 1;
      var from = new THREE.Vector3(r.bx + (r.bx / rad) * 6.5, r.by + 2.4, r.bz + (r.bz / rad) * 6.5);
      r.cnode.position.copy(from);
      r.fly = { from: from, to: to, t: 0, popup: popupText, combo: combo, col: col };
      if (RM) { r.cnode.position.copy(to); landFly(i); } // 모션 최소화: 트윈 없이 즉시 안착
    }

    // 안착 순간: 링 리플 + 버스트 + 플로팅 팝업 + rung 글로우.
    function landFly(i) {
      var r = rungs[i]; var f = r.fly; r.fly = null;
      r.cnode.position.set(r.bx, r.by, r.bz); r.cnode.scale.setScalar(1);
      r.clab.visible = true;
      var rc = i % 2 === 0 ? 0xfacc15 : 0xf472b6;
      r.rung.material.color.setHex(rc); r.rung.material.emissive.setHex(rc);
      r.rung.material.emissiveIntensity = 0.75; r.rung.material.opacity = 1; r.rung.material.transparent = false;
      r.tnode.material.emissiveIntensity = 0.55;
      rippleAt(worldOf(new THREE.Vector3(r.bx, r.by, r.bz)), f.col);
      burst(new THREE.Vector3(r.bx, r.by, r.bz), f.col);
      floatPopup(f.popup, f.combo);
    }

    function flashRung(i) {
      var r = rungs[i]; if (!r) return;
      r.cnode.material.emissive.setHex(0xef4444); r.cnode.material.emissiveIntensity = 0.9;
      setTimeout(function () { if (!r.filled) { r.cnode.material.emissive.setHex(0x0f172a); r.cnode.material.emissiveIntensity = 0; } }, 320);
    }

    function wrongLabel(i) { wrongCell = i; wrongUntil = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + 360; }
    function triggerShake() { if (RM) return; shakeUntil = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + 400; shakeMag = 0.55; }
    function redFlash() { redEl.style.opacity = '1'; setTimeout(function () { redEl.style.opacity = '0'; }, 120); }
    function goldTint(st) { goldEl.style.opacity = st >= 2 ? String(Math.min(0.14, 0.04 + st * 0.02)) : '0'; }

    // DOM 플로팅 팝업 '+10' / 콤보 '+12 🔥N'
    function floatPopup(text, combo) {
      var d = document.createElement('div');
      var big = combo >= 2;
      d.textContent = text; d.className = 'nmdna-popup';
      d.style.cssText = 'position:absolute;left:' + (47 + Math.random() * 6).toFixed(1) + '%;top:44%;pointer-events:none;font:800 ' + (big ? '22px' : '18px') + ' "Noto Sans KR",sans-serif;color:' + (big ? '#fde047' : '#86efac') + ';text-shadow:0 2px 8px rgba(0,0,0,.7);z-index:6;white-space:nowrap';
      host.appendChild(d);
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 940);
    }

    // 상단 배너 '가닥 완성! +bonus'
    function showBanner(text) {
      var d = document.createElement('div');
      d.textContent = text; d.className = 'nmdna-banner';
      d.style.cssText = 'position:absolute;left:50%;top:16px;pointer-events:none;font:800 16px "Noto Sans KR",sans-serif;color:#3a2400;background:linear-gradient(90deg,#f59e0b,#facc15);padding:7px 16px;border-radius:20px;box-shadow:0 4px 16px rgba(250,204,21,.55);z-index:7;white-space:nowrap';
      host.appendChild(d);
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 2200);
    }

    function win() {
      won = true; locked = true; updateHintBtn();
      var bonus = 100 + lvl * 50; score += bonus;
      chime(); glissando();
      showBanner('가닥 완성! +' + bonus);
      if (!RM) { spinBoost = 0.055; camAnim = { t: 0 }; } // 회전 가속·카메라 줌은 모션 최소화 시 생략
      // 나선 전체 rung이 순차적으로 골드로 물드는 웨이브
      rungs.forEach(function (r, i2) {
        setTimeout(function () {
          r.cnode.material.color.setHex(0xfacc15); r.cnode.material.emissive.setHex(0xfacc15); r.cnode.material.emissiveIntensity = 0.95;
          r.rung.material.color.setHex(0xfde047); r.rung.material.emissive.setHex(0xfde047); r.rung.material.emissiveIntensity = 1; r.rung.material.opacity = 1; r.rung.material.transparent = false;
          r.tnode.material.emissiveIntensity = 0.85;
          burst(new THREE.Vector3(r.bx, r.by, r.bz), 0x22c55e);
        }, i2 * 80);
      });
      confetti();
      lvl++;
      if (lvl >= LEVELS.length) {
        setHud('🎉 모든 가닥 완성! 총 ' + score + '점 클리어');
        if (kernel) {
          kernel.saveBest(score);
          kernel.teach({ kind: 'clear', transfer: TRANSFER_LINE, onAgain: function () { lvl = 0; score = 0; streak = 0; startLevel(); } });
        } else {
          setTimeout(function () { lvl = 0; score = 0; streak = 0; startLevel(); }, 3000);
        }
      } else {
        setHud('가닥 완성! 다음 단계 (+' + bonus + ')');
        setTimeout(function () { startLevel(); }, 1700);
      }
    }

    function startLevel() {
      idx = 0; picks = []; won = false; locked = false; hintsUsed = 0;
      wrongCell = -1; spinBoost = 0; camAnim = null; cam.position.z = 11; goldTint(0);
      buildHelix(); updateHintBtn(); setHud();
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

    // ── 파티클 풀 (상한 + 재사용) ────────────────────────────────────────
    var PGEO = new THREE.SphereGeometry(0.09, 6, 6);
    var pool = [], POOL_MAX = 150;
    function spawnParticle(pos, color, speed, gravity) {
      var p = null;
      for (var k = 0; k < pool.length; k++) { if (!pool[k].active) { p = pool[k]; break; } }
      if (!p) {
        if (pool.length >= POOL_MAX) return;
        var m = new THREE.Mesh(PGEO, new THREE.MeshBasicMaterial({ color: color, transparent: true }));
        scene.add(m); p = { mesh: m, active: false }; pool.push(p);
      }
      p.active = true; p.mesh.visible = true; p.mesh.material.color.setHex(color); p.mesh.material.opacity = 1;
      p.mesh.position.copy(pos);
      var a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI;
      p.v = new THREE.Vector3(Math.cos(a) * Math.sin(b), Math.cos(b), Math.sin(a) * Math.sin(b)).multiplyScalar(speed);
      p.life = 0.7 + Math.random() * 0.3; p.g = gravity;
    }
    function burst(pos, color) { if (RM) return; for (var i = 0; i < 12; i++) spawnParticle(pos, color, 2.6 + Math.random() * 2, 6); }
    function confetti() {
      if (RM) return; // 색종이 대량 버스트는 RM 시 생략
      var cols = [0xef4444, 0x3b82f6, 0xeab308, 0x22c55e, 0xf472b6, 0xfacc15, 0x38bdf8];
      for (var i = 0; i < 80; i++) spawnParticle(new THREE.Vector3((Math.random() - 0.5) * 2, 3 + Math.random() * 1.5, (Math.random() - 0.5) * 2), cols[i % cols.length], 3 + Math.random() * 3.5, 5);
    }

    // ── 링 리플 풀 ───────────────────────────────────────────────────────
    var RGEO = new THREE.RingGeometry(0.55, 0.72, 28);
    var ripples = [], RIP_MAX = 10;
    function rippleAt(worldPos, color) {
      if (RM) return;
      var r = null;
      for (var k = 0; k < ripples.length; k++) { if (!ripples[k].active) { r = ripples[k]; break; } }
      if (!r) {
        if (ripples.length >= RIP_MAX) return;
        var m = new THREE.Mesh(RGEO, new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthTest: false, side: THREE.DoubleSide }));
        scene.add(m); r = { mesh: m, active: false }; ripples.push(r);
      }
      r.active = true; r.mesh.visible = true; r.mesh.material.color.setHex(color); r.mesh.material.opacity = 0.9;
      r.mesh.position.copy(worldPos); r.mesh.scale.setScalar(0.3); r.life = 0;
    }

    var last = null;
    function loop(ts) {
      requestAnimationFrame(loop);
      var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts;
      // 회전 + 완성 시 가속
      if (!md) helix.rotation.y += 0.004 + spinBoost;
      if (spinBoost > 0.0002) spinBoost *= 0.95; else spinBoost = 0;
      // 흔들림 (RM 게이트, 감쇠 노이즈)
      if (!RM && ts < shakeUntil) { helix.position.x = (Math.random() - 0.5) * shakeMag; helix.rotation.z = (Math.random() - 0.5) * shakeMag * 0.05; shakeMag *= 0.9; }
      else { helix.position.x = 0; helix.rotation.z = 0; }
      // 카메라 살짝 줌인 후 복귀
      if (camAnim) {
        camAnim.t += dt / 1.2; var cp = camAnim.t, z;
        if (cp < 0.5) z = 11 - easeOutCubic(cp / 0.5) * 2.4;
        else if (cp < 1) z = 8.6 + easeOutCubic((cp - 0.5) / 0.5) * 2.4;
        else { z = 11; camAnim = null; }
        cam.position.z = z;
      }
      // 세포질 부유/반짝임 (RM 시 정지)
      if (!RM && cyto) { cyto.rotation.y += 0.0006; cyto.position.y = Math.sin(ts / 3000) * 0.15; cytoMat.opacity = 0.35 + 0.12 * Math.sin(ts / 900); }
      // 백본 리본 살아있는 글로우(느린 호흡, RM 시 정지)
      if (!RM && backbones.length) { var bp = 0.4 + 0.16 * Math.sin(ts / 680); for (var bk = 0; bk < backbones.length; bk++) backbones[bk].material.emissiveIntensity = bp; }
      // rung: 트윈 안착 + 현재 칸 펄스
      for (var i = 0; i < rungs.length; i++) {
        var r = rungs[i];
        if (r.fly) {
          r.fly.t = Math.min(1, r.fly.t + dt * 2.6);
          var e = easeOutCubic(r.fly.t);
          r.cnode.position.lerpVectors(r.fly.from, r.fly.to, e);
          r.cnode.scale.setScalar(0.55 + 0.45 * e);
          if (r.fly.t >= 1) landFly(i);
        } else if (i === idx && !won && !RM) { r.cnode.scale.setScalar(1 + 0.13 * Math.sin(ts / 210)); }
        else r.cnode.scale.setScalar(1);
        // 채워진 수소결합(rung) 살아있는 emissive 셰이머 (승리 웨이브 중엔 미간섭, RM 게이트)
        if (!RM && !won && r.filled && !r.fly) { r.rung.material.emissiveIntensity = 0.75 + 0.2 * Math.sin(ts / 320 + i); }
      }
      // 현재 칸 additive 글로우 빌보드
      if (!won && idx < rungs.length) {
        var cr = rungs[idx];
        cellGlow.position.copy(worldOf(new THREE.Vector3(cr.bx, cr.by, cr.bz)));
        cellGlow.visible = true; var gs = RM ? 1.6 : 1.6 + 0.35 * Math.sin(ts / 210); cellGlow.scale.set(gs, gs, 1);
      } else cellGlow.visible = false;
      // 오답 '?' 라벨 진동 (RM 게이트)
      if (wrongCell >= 0 && rungs[wrongCell]) {
        if (!RM && ts < wrongUntil) rungs[wrongCell].clab.position.x = rungs[wrongCell].bx + (Math.random() - 0.5) * 0.28;
        else rungs[wrongCell].clab.position.x = rungs[wrongCell].bx;
      }
      // 링 리플
      for (var q = 0; q < ripples.length; q++) {
        var rp = ripples[q]; if (!rp.active) continue;
        rp.life += dt; var pp = rp.life / 0.55;
        if (pp >= 1) { rp.active = false; rp.mesh.visible = false; }
        else { rp.mesh.scale.setScalar(0.3 + pp * 3.2); rp.mesh.material.opacity = 0.9 * (1 - pp); }
      }
      // 파티클
      for (var j = 0; j < pool.length; j++) {
        var pt = pool[j]; if (!pt.active) continue;
        pt.life -= dt;
        if (pt.life <= 0) { pt.active = false; pt.mesh.visible = false; continue; }
        pt.v.y -= pt.g * dt; pt.mesh.position.addScaledVector(pt.v, dt);
        pt.mesh.material.opacity = Math.max(0, Math.min(1, pt.life));
      }
      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    // 사운드
    var actx = null;
    function beep(f, d, type, vol) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; var peak = vol || 0.12; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 'triangle'); }, i * 110); }); }
    function glissando() { [523, 587, 659, 784, 880, 1047, 1175, 1319].forEach(function (f, i) { setTimeout(function () { beep(f, 0.12, 'triangle', 0.06); }, i * 55); }); }

    startLevel();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
