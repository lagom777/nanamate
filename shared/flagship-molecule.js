/* 나나메이트 플래그십 3D 게임 — 분자 조립 (aboutChemistry/02-chemical-bonds)
 * 원자 풀(H·O·C·N)에서 원자를 클릭/드래그로 골라 중심 원자에 결합시켜 목표 분자를 완성한다.
 * 원자가(H=1, O=2, N=3, C=4) 규칙으로 결합 수가 제한된다. 목표: H₂O → CO₂ → NH₃ → CH₄.
 * 정확히 충족되면 명중·폭발·점수·다음 분자. 3D 회전, 결합은 실린더로 표시.
 * 목표는 분자 이름만 제시(화학식은 단계당 1회 −10점 힌트). 틀린 원소 선택은 −5점+흔들림+교육 문구.
 * 컨테이너: <div id="nm-molecule"></div>. THREE(r128) 전역 필요. WebGL 실패 시 안내문(graceful).
 *
 * 사실성: 원자가/구성은 실제 분자 화학 — H₂O(굽은형, O 단일결합×2),
 *   CO₂(직선형, C=O 이중결합×2 → C는 4결합, O는 2결합), NH₃(삼각뿔, N 단일결합×3),
 *   CH₄(정사면체, C 단일결합×4). 결합 수 = 사용된 원자가.
 */
(function () {
  'use strict';

  // ───────────────────────────── 순수 로직 (테스트 가능) ─────────────────────────────
  // 원자가(valence): 한 원자가 만들 수 있는 결합의 총수
  var VALENCE = { H: 1, O: 2, N: 3, C: 4 };

  // 목표 분자 정의. composition = 필요한 원자 개수, bonds = 결합 목록(원자 인덱스 쌍, order=결합 차수)
  // 원자 배열의 0번은 항상 중심 원자.
  var TARGETS = [
    {
      key: 'H2', name: '수소 (H₂)', kname: '수소', formula: 'H₂', shape: '이원자 단일결합',
      atoms: ['H', 'H'],
      bonds: [{ a: 0, b: 1, order: 1 }],
      composition: { H: 2 },
      transfer: 'H는 원자가 1 — 손이 하나라 결합 하나면 충분하다'
    },
    {
      key: 'H2O', name: '물 (H₂O)', kname: '물', formula: 'H₂O', shape: '굽은형 104.5°',
      atoms: ['O', 'H', 'H'],
      bonds: [{ a: 0, b: 1, order: 1 }, { a: 0, b: 2, order: 1 }],
      composition: { O: 1, H: 2 },
      transfer: '산소 원자가 2, 수소가 1 — 물이 되는 이유'
    },
    {
      key: 'O2', name: '산소 (O₂)', kname: '산소', formula: 'O₂', shape: '이원자 이중결합',
      atoms: ['O', 'O'],
      bonds: [{ a: 0, b: 1, order: 2 }],
      composition: { O: 2 },
      transfer: 'O는 원자가 2 — 이중결합 하나로 서로 채운다'
    },
    {
      key: 'CO2', name: '이산화탄소 (CO₂)', kname: '이산화탄소', formula: 'CO₂', shape: '직선형 180°',
      atoms: ['C', 'O', 'O'],
      bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2, order: 2 }],
      composition: { C: 1, O: 2 },
      transfer: 'C 원자가 4 = 이중결합×2 — 선형 CO₂'
    },
    {
      key: 'N2', name: '질소 (N₂)', kname: '질소', formula: 'N₂', shape: '이원자 삼중결합',
      atoms: ['N', 'N'],
      bonds: [{ a: 0, b: 1, order: 3 }],
      composition: { N: 2 },
      transfer: 'N 원자가 3 — 삼중결합이 아주 단단하다'
    },
    {
      key: 'NH3', name: '암모니아 (NH₃)', kname: '암모니아', formula: 'NH₃', shape: '삼각뿔 107°',
      atoms: ['N', 'H', 'H', 'H'],
      bonds: [{ a: 0, b: 1, order: 1 }, { a: 0, b: 2, order: 1 }, { a: 0, b: 3, order: 1 }],
      composition: { N: 1, H: 3 },
      transfer: 'N에 H 세 개 — 원자가 3을 채운 암모니아'
    },
    {
      key: 'CH4', name: '메탄 (CH₄)', kname: '메탄', formula: 'CH₄', shape: '정사면체 109.5°',
      atoms: ['C', 'H', 'H', 'H', 'H'],
      bonds: [{ a: 0, b: 1, order: 1 }, { a: 0, b: 2, order: 1 }, { a: 0, b: 3, order: 1 }, { a: 0, b: 4, order: 1 }],
      composition: { C: 1, H: 4 },
      transfer: 'C 원자가 4 — 수소 네 개와 정사면체 메탄'
    },
    {
      key: 'HCN', name: '사이안화수소 (HCN)', kname: '사이안화수소', formula: 'HCN', shape: '직선형',
      atoms: ['C', 'H', 'N'],
      bonds: [{ a: 0, b: 1, order: 1 }, { a: 0, b: 2, order: 3 }],
      composition: { C: 1, H: 1, N: 1 },
      transfer: 'C–H 단일 + C≡N 삼중 — 탄소 원자가 4를 채움'
    }
  ];

  // 목표 구성에 없는 원소 / 개수 초과 시 교육 문구
  function wrongElementReason(target, element, currentAtoms) {
    var need = target.composition[element] || 0;
    var have = 0;
    for (var i = 0; i < currentAtoms.length; i++) if (currentAtoms[i] === element) have++;
    if (need === 0) {
      return element + '는 이 분자에 필요 없어요 (' + (target.kname || target.name) + ')';
    }
    if (have >= need) {
      return element + '는 이미 ' + need + '개면 충분해요';
    }
    return null;
  }

  // 원자 배열로부터 구성(원소→개수) 계산
  function composition(atoms) {
    var c = {};
    for (var i = 0; i < atoms.length; i++) {
      var el = atoms[i];
      c[el] = (c[el] || 0) + 1;
    }
    return c;
  }

  // 두 구성이 동일한지(원소·개수 일치)
  function sameComposition(a, b) {
    var ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (var i = 0; i < ka.length; i++) {
      if (a[ka[i]] !== b[ka[i]]) return false;
    }
    return true;
  }

  // 각 원자가 현재 사용 중인 결합 차수의 합(원자 인덱스 → 사용된 결합수)
  function bondUsage(atomCount, bonds) {
    var used = new Array(atomCount);
    for (var i = 0; i < atomCount; i++) used[i] = 0;
    for (var j = 0; j < bonds.length; j++) {
      var bd = bonds[j];
      used[bd.a] += bd.order;
      used[bd.b] += bd.order;
    }
    return used;
  }

  // 모든 원자의 원자가가 정확히 충족되는가(초과·미달 모두 실패)
  function allValenceSatisfied(atoms, bonds) {
    var used = bondUsage(atoms.length, bonds);
    for (var i = 0; i < atoms.length; i++) {
      var v = VALENCE[atoms[i]];
      if (v === undefined) return false;
      if (used[i] !== v) return false;
    }
    return true;
  }

  // 결합 차수가 원자가를 초과하면 결합 불가(드래그로 결합 시 사전 검사)
  function canBond(atoms, bonds, ai, bi, order) {
    if (ai === bi) return false;
    var used = bondUsage(atoms.length, bonds);
    if (used[ai] + order > VALENCE[atoms[ai]]) return false;
    if (used[bi] + order > VALENCE[atoms[bi]]) return false;
    return true;
  }

  // 승리 판정: (1) 구성이 목표와 일치 AND (2) 모든 원자가 정확히 충족
  // 두 조건이 모두 참이면 위상이 목표와 동일해진다(목표는 모두 중심+말단 구조).
  function isComplete(target, atoms, bonds) {
    if (!sameComposition(composition(atoms), target.composition)) return false;
    if (!allValenceSatisfied(atoms, bonds)) return false;
    return true;
  }

  var LOGIC = {
    VALENCE: VALENCE, TARGETS: TARGETS,
    composition: composition, sameComposition: sameComposition,
    bondUsage: bondUsage, allValenceSatisfied: allValenceSatisfied,
    canBond: canBond, isComplete: isComplete,
    wrongElementReason: wrongElementReason
  };

  // node 테스트용 export (브라우저에선 무시됨)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LOGIC;
  }
  if (typeof window !== 'undefined') {
    window.NM_MOLECULE_LOGIC = LOGIC;
  }

  // ───────────────────────────── 3D 게임 (브라우저 전용) ─────────────────────────────
  function init() {
    if (typeof document === 'undefined') return;
    var host = document.getElementById('nm-molecule');
    if (!host) return;
    if (typeof THREE === 'undefined') { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">3D를 표시할 수 없는 환경입니다.</p>'; return; }

    var W = host.clientWidth || 640, H = 360, scene, cam, rndr;
    try {
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(48, W / H, 0.1, 200);
      cam.position.set(0, 1.2, 12); cam.lookAt(0, 0.2, 0);
      rndr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rndr.setSize(W, H); rndr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (e) { host.innerHTML = '<p style="color:#6b7280;font-size:14px;padding:12px">WebGL 초기화 실패.</p>'; return; }
    host.innerHTML = ''; host.style.position = 'relative';
    var kernel = window.NMGameKernel && window.NMGameKernel.create ? window.NMGameKernel.create(host, { gameId: 'molecule' }) : null;
    var TRANSFER_LINE = '원자가(손이 몇 개)를 채우면 분자가 된다 — H1 O2 N3 C4.';
    rndr.domElement.style.cssText = 'width:100%;height:' + H + 'px;border-radius:12px;cursor:grab;touch-action:none;display:block;background:radial-gradient(ellipse at 50% 30%,#0b1220,#05080f)';
    host.appendChild(rndr.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.62));
    var dl = new THREE.DirectionalLight(0xffffff, 0.85); dl.position.set(4, 8, 10); scene.add(dl);
    var dl2 = new THREE.DirectionalLight(0x88aaff, 0.4); dl2.position.set(-6, -2, 4); scene.add(dl2);

    // 분자 회전용 그룹(중심·원자·결합 모두 여기에)
    var molGroup = new THREE.Group(); scene.add(molGroup);

    // 원소 색/반지름
    var COLOR = { H: 0xffffff, O: 0xef4444, C: 0x334155, N: 0x3b82f6 };
    var EMIS = { H: 0x555555, O: 0x4a1010, C: 0x0c1220, N: 0x10204a };
    var RADIUS = { H: 0.34, O: 0.52, C: 0.55, N: 0.5 };

    // 목표 라운드별로 중심 원자가 앉을 위치 + 결합 자리(슬롯) 방향
    // 슬롯 방향은 실제 분자 기하를 반영(VSEPR).
    var GEOM = {
      H2: { center: [0, 0, 0], slots: [[1.1, 0, 0]] },
      O2: { center: [0, 0, 0], slots: [[1.15, 0, 0]] },
      N2: { center: [0, 0, 0], slots: [[1.2, 0, 0]] },
      H2O: { center: [0, 0, 0], slots: [[Math.sin(0.911), -Math.cos(0.911), 0], [-Math.sin(0.911), -Math.cos(0.911), 0]] },
      CO2: { center: [0, 0, 0], slots: [[1, 0, 0], [-1, 0, 0]] },
      HCN: { center: [0, 0, 0], slots: [[1.1, 0, 0], [-1.15, 0, 0]] },
      NH3: { center: [0, 0.25, 0], slots: tetraSlots(3) },
      CH4: { center: [0, 0, 0], slots: tetraSlots(4) }
    };
    function geomOf(t) {
      if (GEOM[t.key]) return GEOM[t.key];
      var n = Math.max(1, t.atoms.length - 1), slots = [];
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2;
        slots.push([Math.cos(a), 0.15 * Math.sin(a * 2), Math.sin(a)]);
      }
      return { center: [0, 0, 0], slots: slots };
    }
    function bondOrderTo(t, otherIdx) {
      for (var i = 0; i < t.bonds.length; i++) {
        var b = t.bonds[i];
        if ((b.a === 0 && b.b === otherIdx) || (b.b === 0 && b.a === otherIdx)) return b.order;
      }
      return 1;
    }
    function tetraSlots(n) {
      // 정사면체 꼭짓점 4개(정규화)
      var t = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
      var out = [];
      for (var i = 0; i < n; i++) { var v = t[i]; var L = Math.sqrt(3); out.push([v[0] / L, v[1] / L, v[2] / L]); }
      return out;
    }

    // 게임 상태
    var lvl = 0, score = 0, locked = false;
    var hintUsed = false;          // 이번 단계에서 화학식 힌트를 썼는가 (단계당 1회 -10점)
    var shakeUntil = 0, shakeMag = 0; // 오답 흔들림
    var atoms = [];   // { el, mesh, slot }  0번=중심
    var bonds = [];   // { a, b, order, meshes:[] }
    var placedCount = 0; // 중심 외에 배치된 말단 원자 수
    var ELNAME = { H: '수소', O: '산소', C: '탄소', N: '질소' };

    // 트레이(원자 풀) — DOM 버튼으로 어떤 원소를 추가할지 선택
    var tray = document.createElement('div');
    tray.style.cssText = 'position:absolute;left:0;right:0;bottom:10px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;pointer-events:none';
    host.appendChild(tray);
    // 모든 원소 버튼은 항상 활성 — 틀린 원소를 고르면 감점 (진짜 선택의 긴장감)
    ['H', 'O', 'N', 'C'].forEach(function (el) {
      var b = document.createElement('button');
      var hex = '#' + ('000000' + COLOR[el].toString(16)).slice(-6);
      var txtColor = (el === 'H') ? '#1f2937' : '#fff';
      b.textContent = el + ' (' + LOGIC.VALENCE[el] + ')';
      b.style.cssText = 'pointer-events:auto;border:2px solid rgba(255,255,255,.45);border-radius:10px;background:' + hex + ';color:' + txtColor + ';font:800 13px "Noto Sans KR",sans-serif;padding:7px 12px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4)';
      b.onclick = function () { addAtom(el); };
      tray.appendChild(b);
    });

    // HUD
    var hud = document.createElement('div');
    hud.style.cssText = 'position:absolute;left:10px;top:10px;font:700 13px "Noto Sans KR",sans-serif;color:#e7f6ee;text-shadow:0 1px 3px rgba(0,0,0,.7);pointer-events:none;line-height:1.55';
    host.appendChild(hud);
    var tip = document.createElement('div');
    tip.style.cssText = 'position:absolute;right:10px;top:10px;font:600 11.5px "Noto Sans KR",sans-serif;color:#cde7da;text-shadow:0 1px 3px rgba(0,0,0,.7);pointer-events:none;text-align:right;max-width:200px';
    tip.innerHTML = '아래 원자 버튼을 눌러<br>목표 분자를 조립하세요<br>틀린 원소는 −5점!<br>회전: 드래그 · 결합 자동 형성';
    host.appendChild(tip);

    // 오답 시 화면 붉은 플래시
    var redFlash = document.createElement('div');
    redFlash.style.cssText = 'position:absolute;left:0;right:0;top:0;height:' + H + 'px;border-radius:12px;background:rgba(239,68,68,.28);opacity:0;transition:opacity .12s;pointer-events:none';
    host.appendChild(redFlash);
    function flashRed() { redFlash.style.opacity = '1'; setTimeout(function () { redFlash.style.opacity = '0'; }, 170); }
    function triggerShake() { shakeUntil = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + 380; shakeMag = 0.4; }

    var resetBtn = document.createElement('button');
    resetBtn.textContent = '↺ 다시';
    resetBtn.style.cssText = 'position:absolute;right:10px;bottom:48px;pointer-events:auto;border:1px solid rgba(255,255,255,.4);border-radius:8px;background:rgba(20,28,40,.85);color:#e7f6ee;font:700 12px "Noto Sans KR",sans-serif;padding:5px 11px;cursor:pointer';
    resetBtn.onclick = function () { if (!locked) buildLevel(); };
    host.appendChild(resetBtn);

    // 화학식 힌트 버튼 — 단계당 1회, -10점. 기본은 분자 이름만 보고 조립해야 한다.
    var hintBtn = document.createElement('button');
    hintBtn.textContent = '💡 화학식 힌트 (−10점)';
    hintBtn.style.cssText = 'position:absolute;right:10px;bottom:84px;pointer-events:auto;border:1px solid rgba(253,224,71,.55);border-radius:8px;background:rgba(40,34,12,.85);color:#fde047;font:700 12px "Noto Sans KR",sans-serif;padding:5px 11px;cursor:pointer';
    hintBtn.onclick = function () {
      if (locked || hintUsed) return;
      hintUsed = true;
      score = Math.max(0, score - 10);
      hintBtn.style.opacity = '0.45';
      setHud('힌트: 화학식은 ' + TARGETS[lvl].formula + ' (−10점)', '#fde047');
    };
    host.appendChild(hintBtn);

    function setHud(msg, color) {
      var t = TARGETS[Math.min(lvl, TARGETS.length - 1)];
      var compNow = LOGIC.composition(atoms.map(function (a) { return a.el; }));
      var compStr = ['C', 'N', 'O', 'H'].filter(function (e) { return compNow[e]; }).map(function (e) { return e + (compNow[e] > 1 ? compNow[e] : ''); }).join('');
      hud.innerHTML = '🧪 목표: <b style="font-size:17px;color:#fde047">' + t.kname + '</b><br>' +
        '구조: ' + t.shape + '<br>' +
        '화학식: ' + (hintUsed ? '<b style="color:#fde047">' + t.formula + '</b>' : '???') + '<br>' +
        '현재: ' + (compStr || '(중심만)') + '<br>' +
        '🏆 ' + score + '점 · 단계 ' + Math.min(lvl + 1, TARGETS.length) + '/' + TARGETS.length +
        (msg ? '<br><b style="color:' + (color || '#00e890') + '">' + msg + '</b>' : '');
    }

    function clearMolecule() {
      while (molGroup.children.length) molGroup.remove(molGroup.children[0]);
      atoms = []; bonds = []; placedCount = 0; molGroup.rotation.set(0, 0, 0);
    }

    function makeAtomMesh(el) {
      var m = new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS[el], 26, 26),
        new THREE.MeshStandardMaterial({ color: COLOR[el], emissive: EMIS[el], metalness: 0.25, roughness: 0.45 })
      );
      return m;
    }

    function buildLevel() {
      locked = false;
      clearMolecule();
      var t = TARGETS[lvl];
      var g = geomOf(t);
      // 중심 원자 배치
      var centerEl = t.atoms[0];
      var cm = makeAtomMesh(centerEl);
      cm.position.set(g.center[0], g.center[1], g.center[2]);
      molGroup.add(cm);
      atoms.push({ el: centerEl, mesh: cm, slot: -1 });
      // 빈 슬롯(고스트) 표시 — 어디에 결합되는지 힌트
      ghosts = [];
      for (var s = 0; s < g.slots.length; s++) {
        var dir = g.slots[s];
        var gp = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 12, 12),
          new THREE.MeshBasicMaterial({ color: 0x00e890, transparent: true, opacity: 0.28, wireframe: true })
        );
        var tipEl = t.atoms[Math.min(s + 1, t.atoms.length - 1)];
        var dist = bondLen(centerEl, tipEl);
        gp.position.set(g.center[0] + dir[0] * dist, g.center[1] + dir[1] * dist, g.center[2] + dir[2] * dist);
        gp.userData.slot = s;
        molGroup.add(gp); ghosts.push(gp);
      }
      hintUsed = false;
      hintBtn.style.opacity = '1';
      setHud(t.transfer ? '배울 점: ' + t.transfer : '');
    }
    var ghosts = [];

    function bondLen(elA, elB) { return RADIUS[elA] + RADIUS[elB] + 0.55; }

    function addAtom(el) {
      if (locked) return;
      var t = TARGETS[lvl];
      var compNow = LOGIC.composition(atoms.map(function (a) { return a.el; }));
      // 틀린 원소(불필요/초과) → 감점 + 흔들림 + 교육 문구
      if ((compNow[el] || 0) >= (t.composition[el] || 0)) {
        score = Math.max(0, score - 5);
        triggerShake(); flashRed();
        beep(150, 0.14, 'square');
        var why =
          LOGIC.wrongElementReason(t, el, atoms.map(function (a) { return a.el; })) ||
          (t.composition[el] ? t.kname + '의 ' + ELNAME[el] + '는 충분해요' : t.kname + '엔 ' + ELNAME[el] + '가 없어요');
        setHud('❌ ' + why + ' (−5점)', '#f87171');
        if (kernel) kernel.teach({ kind: 'fail', outcome: 'element', coach: why, coachMid: '목표 분자에 필요한 원소만 고르세요', coachDeep: '화학식 힌트(−10)로 구성 힌트를 볼 수 있어요' });
        return;
      }
      // 다음 빈 슬롯
      var slotIdx = placedCount;
      var g = geomOf(t);
      if (slotIdx >= g.slots.length) { beep(150, 0.12, 'square'); return; }
      var dir = g.slots[slotIdx];
      var dist = bondLen(t.atoms[0], el);
      var m = makeAtomMesh(el);
      var target = new THREE.Vector3(g.center[0] + dir[0] * dist, g.center[1] + dir[1] * dist, g.center[2] + dir[2] * dist);
      m.position.copy(target).multiplyScalar(3.2);
      m.userData.from = m.position.clone();
      m.userData.to = target.clone();
      m.userData.t = 0;
      molGroup.add(m);

      var order = bondOrderTo(t, atoms.length); // 곧 붙을 인덱스
      var newAtom = { el: el, mesh: m, slot: slotIdx };
      if (!LOGIC.canBond(atoms.map(function (a) { return a.el; }).concat([el]), bonds, 0, atoms.length, order)) {
        molGroup.remove(m); beep(150, 0.14, 'square'); flash('원자가 초과 — 결합 불가'); return;
      }
      atoms.push(newAtom);
      bonds.push({ a: 0, b: atoms.length - 1, order: order, meshes: [], dir: dir });
      placedCount++;
      if (ghosts[slotIdx]) ghosts[slotIdx].visible = false;
      beep(420 + slotIdx * 60, 0.1, 'triangle');
      setHud(order > 1 ? '결합! (차수 ' + order + ')' : '결합!');
    }

    function makeBondMesh(p1, p2, order) {
      var meshes = [];
      var dirV = new THREE.Vector3().subVectors(p2, p1);
      var len = dirV.length();
      var mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      var up = new THREE.Vector3(0, 1, 0);
      var quat = new THREE.Quaternion().setFromUnitVectors(up, dirV.clone().normalize());
      // 이중/삼중 결합은 평행 실린더
      var offsets = order >= 3 ? [-0.16, 0, 0.16] : order === 2 ? [-0.13, 0.13] : [0];
      // 수직 오프셋 방향
      var perp = new THREE.Vector3(1, 0, 0);
      if (Math.abs(dirV.clone().normalize().dot(perp)) > 0.9) perp.set(0, 0, 1);
      perp.crossVectors(dirV, perp).normalize();
      for (var i = 0; i < offsets.length; i++) {
        var cyl = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, len * 0.78, 12),
          new THREE.MeshStandardMaterial({ color: 0xcbd5e1, emissive: 0x222a33, metalness: 0.4, roughness: 0.4 })
        );
        cyl.position.copy(mid).addScaledVector(perp, offsets[i]);
        cyl.quaternion.copy(quat);
        molGroup.add(cyl); meshes.push(cyl);
      }
      return meshes;
    }

    function checkWin() {
      if (locked) return;
      var t = TARGETS[lvl];
      var atomEls = atoms.map(function (a) { return a.el; });
      if (LOGIC.isComplete(t, atomEls, bonds)) {
        win();
      }
    }

    function win() {
      if (locked) return;
      locked = true;
      var t = TARGETS[lvl];
      score += 100 + (lvl === TARGETS.length - 1 ? 50 : 0);
      atoms.forEach(function (a) { var p = a.mesh.position.clone(); molGroup.localToWorld(p); burst(p, 0x00e890); });
      chime();
      var line = t.transfer ? t.transfer : t.name + ' 완성';
      setHud('🎉 ' + t.name + ' 완성! · ' + line, '#fde047');
      lvl++;
      if (lvl >= TARGETS.length) {
        setHud('🏆 원자가 공방 클리어! 총 ' + score + '점 · 원자가를 채우면 분자가 된다', '#fde047');
        if (kernel) {
          kernel.saveBest(score);
          kernel.teach({ kind: 'clear', transfer: TRANSFER_LINE, onAgain: function () { lvl = 0; score = 0; locked = false; buildLevel(); } });
        } else setTimeout(function () { lvl = 0; score = 0; buildLevel(); }, 3400);
      } else {
        if (kernel) kernel.teach({ kind: 'success', coach: line });
        setTimeout(function () { buildLevel(); }, 1700);
      }
    }

    function flash(msg) { setHud(msg); }

    // 회전 드래그
    var dragging = false, px = 0, py = 0;
    function pt(e) { var p = e.touches ? e.touches[0] : e; return { x: p.clientX, y: p.clientY }; }
    function onDown(e) { dragging = true; var p = pt(e); px = p.x; py = p.y; rndr.domElement.style.cursor = 'grabbing'; }
    function onMove(e) {
      if (!dragging) return; var p = pt(e);
      molGroup.rotation.y += (p.x - px) * 0.01;
      molGroup.rotation.x += (p.y - py) * 0.01;
      px = p.x; py = p.y; e.preventDefault();
    }
    function onUp() { dragging = false; rndr.domElement.style.cursor = 'grab'; }
    var el = rndr.domElement;
    el.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    el.addEventListener('touchstart', onDown, { passive: false }); el.addEventListener('touchmove', onMove, { passive: false }); el.addEventListener('touchend', onUp, { passive: false });

    // 파티클
    var parts = [];
    function burst(p, color) {
      var lp = molGroup.worldToLocal(p.clone());
      for (var i = 0; i < 16; i++) {
        var s = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 6), new THREE.MeshBasicMaterial({ color: color }));
        s.position.copy(lp);
        var a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
        s.userData.v = new THREE.Vector3(Math.cos(a) * Math.sin(b), Math.cos(b), Math.sin(a) * Math.sin(b)).multiplyScalar(3 + Math.random() * 3);
        s.userData.life = 0.8; molGroup.add(s); parts.push(s);
      }
    }

    var last = null;
    function loop(ts) {
      requestAnimationFrame(loop);
      var dt = last == null ? 0.016 : Math.min(0.05, (ts - last) / 1000); last = ts;
      if (!dragging && !locked) molGroup.rotation.y += 0.004;

      // 오답 흔들림
      if (ts < shakeUntil) { molGroup.position.x = (Math.random() - 0.5) * shakeMag; shakeMag *= 0.92; }
      else molGroup.position.x = 0;

      // 날아드는 원자 애니메이션 + 도착 시 결합 생성
      for (var i = 0; i < atoms.length; i++) {
        var a = atoms[i];
        if (a.mesh.userData.to && a.mesh.userData.t < 1) {
          a.mesh.userData.t = Math.min(1, a.mesh.userData.t + dt * 3.2);
          var e2 = 1 - Math.pow(1 - a.mesh.userData.t, 3);
          a.mesh.position.lerpVectors(a.mesh.userData.from, a.mesh.userData.to, e2);
          if (a.mesh.userData.t >= 1) {
            a.mesh.userData.to = null;
            // 도착 → 결합 실린더 생성
            var bd = null;
            for (var j = 0; j < bonds.length; j++) if (bonds[j].b === i) { bd = bonds[j]; break; }
            if (bd && bd.meshes.length === 0) {
              bd.meshes = makeBondMesh(atoms[0].mesh.position, a.mesh.position, bd.order);
            }
            checkWin();
          }
        }
      }

      // 고스트 펄스
      for (var k = 0; k < ghosts.length; k++) if (ghosts[k].visible) ghosts[k].scale.setScalar(1 + 0.12 * Math.sin(ts / 300 + k));

      // 파티클
      for (var pI = parts.length - 1; pI >= 0; pI--) {
        var sp = parts[pI]; sp.userData.life -= dt;
        if (sp.userData.life <= 0) { molGroup.remove(sp); parts.splice(pI, 1); continue; }
        sp.userData.v.y -= 6 * dt; sp.position.addScaledVector(sp.userData.v, dt);
        sp.material.transparent = true; sp.material.opacity = Math.max(0, sp.userData.life);
      }
      rndr.render(scene, cam);
    }
    requestAnimationFrame(loop);
    window.addEventListener('resize', function () { var w = host.clientWidth || 640; cam.aspect = w / H; cam.updateProjectionMatrix(); rndr.setSize(w, H); });

    // 사운드
    var actx = null;
    function beep(f, d, type) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.value = f; o.connect(g); g.connect(actx.destination); var t = actx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {} }
    function chime() { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { beep(f, 0.18, 'triangle'); }, i * 110); }); }

    buildLevel();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  }
})();
