/* ============================================================
   nanamate · 3D 미니게임 엔진 (공용)
   페이지에 window.NANAMATE_QUIZ = {color, questions:[{q,choices,answer}]}
   와 <div id="nm-quiz-host"></div> 가 있으면 자동으로 게임을 그린다.
   THREE(r128)가 이미 로드되어 있어야 한다.
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var host = document.getElementById('nm-quiz-host');
    var DATA = window.NANAMATE_QUIZ;
    if (!host || !DATA || !window.THREE || !DATA.questions || !DATA.questions.length) return;

    var ACCENT = DATA.color || '#7b9cff';

    /* ---------- styles ---------- */
    if (!document.getElementById('nm-quiz-style')) {
      var st = document.createElement('style');
      st.id = 'nm-quiz-style';
      st.textContent =
        '#nm-quiz-host{position:relative;border:1px solid rgba(148,163,184,.16);border-radius:20px;overflow:hidden;margin:24px 0;background:radial-gradient(900px 300px at 15% -10%,rgba(251,191,36,.07),transparent 55%),radial-gradient(700px 320px at 90% 0%,rgba(99,102,241,.10),transparent 55%),linear-gradient(165deg,#10182b,#0a0f1d 60%,#0d1226);box-shadow:0 24px 70px rgba(2,6,23,.55),inset 0 1px 0 rgba(255,255,255,.05);font-family:"Noto Sans KR",sans-serif;}' +
        '#nm-quiz-host:after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 60px rgba(2,6,23,.5),inset 0 -18px 34px rgba(2,6,23,.3);z-index:4;}' +
        '.nm-q-bar{display:flex;align-items:center;gap:12px;padding:14px 18px;background:rgba(2,6,23,.35);border-bottom:1px solid rgba(148,163,184,.14);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}' +
        '.nm-q-text{flex:1;font-weight:800;font-size:1.02em;color:#f1f5f9;line-height:1.45;letter-spacing:-.01em;}' +
        '.nm-q-score{font-family:monospace;font-size:.95em;font-weight:900;color:' + ACCENT + ';white-space:nowrap;text-shadow:0 0 12px ' + ACCENT + '66;}' +
        '.nm-q-dots{display:flex;gap:5px;}' +
        '.nm-q-dot{width:9px;height:9px;border-radius:50%;background:rgba(148,163,184,.22);}' +
        '.nm-q-dot.ok{background:#34d399;box-shadow:0 0 8px rgba(52,211,153,.7);}.nm-q-dot.bad{background:#f87171;box-shadow:0 0 8px rgba(248,113,113,.6);}.nm-q-dot.cur{background:' + ACCENT + ';box-shadow:0 0 10px ' + ACCENT + ';}' +
        '.nm-q-stage{position:relative;height:380px;cursor:pointer;background:linear-gradient(180deg,rgba(10,15,30,.0),rgba(10,15,30,.35));}' +
        '.nm-q-stage canvas{display:block;width:100%!important;height:100%!important;}' +
        '.nm-q-label{position:absolute;transform:translate(-50%,-50%);pointer-events:none;padding:6px 13px;border-radius:999px;background:rgba(8,12,24,.78);border:1px solid ' + ACCENT + ';color:#f1f5f9;font-size:.86em;font-weight:700;white-space:nowrap;max-width:46%;overflow:hidden;text-overflow:ellipsis;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);box-shadow:0 4px 14px rgba(2,6,23,.5),0 0 10px ' + ACCENT + '44;}' +
        '.nm-q-end{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(2,6,23,.82);color:#f1f5f9;z-index:5;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}' +
        '.nm-q-end .nm-q-big{font-size:2.4em;font-weight:900;color:#fbbf24;text-shadow:0 0 20px rgba(251,191,36,.55),0 0 50px rgba(251,191,36,.25);}' +
        '.nm-q-retry{padding:11px 24px;border:none;border-radius:11px;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#1c1005;font-weight:900;font-size:1em;cursor:pointer;box-shadow:0 8px 22px rgba(245,158,11,.35),inset 0 1px 0 rgba(255,255,255,.35);}' +
        '.nm-q-hint{padding:9px 18px;font-size:.78em;font-weight:600;color:#64748b;letter-spacing:.03em;}';
      document.head.appendChild(st);
    }

    /* ---------- DOM ---------- */
    host.innerHTML =
      '<div class="nm-q-bar"><div class="nm-q-text" id="nm-q-text"></div><div class="nm-q-dots" id="nm-q-dots"></div><div class="nm-q-score" id="nm-q-score"></div></div>' +
      '<div class="nm-q-stage" id="nm-q-stage"></div>' +
      '<div class="nm-q-hint">🖱️ 떠 있는 보기 중 정답을 클릭하세요 · 드래그로 회전</div>';
    var stage = document.getElementById('nm-q-stage');
    var elText = document.getElementById('nm-q-text');
    var elScore = document.getElementById('nm-q-score');
    var elDots = document.getElementById('nm-q-dots');

    /* ---------- three (WebGL 불가 시 HTML 폴백) ---------- */
    var renderer = null;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { renderer = null; }
    if (!renderer) { htmlFallback(); return; }
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, stage.clientWidth / stage.clientHeight, 0.1, 100);
    camera.position.set(0, 0.4, 8.4);
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    stage.appendChild(renderer.domElement);

    function htmlFallback() {
      var qi = 0, sc = 0;
      function draw() {
        var q = DATA.questions[qi];
        elText.textContent = 'Q' + (qi + 1) + '. ' + q.q;
        elScore.textContent = sc + '점';
        stage.style.cursor = 'default';
        stage.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:center;height:100%;padding:20px;">' +
          q.choices.map(function (cTxt, i) {
            return '<button type="button" data-i="' + i + '" style="padding:14px 22px;border-radius:12px;border:1px solid ' + ACCENT + ';background:rgba(255,255,255,.05);color:#fff;font-size:1em;cursor:pointer;">' + cTxt + '</button>';
          }).join('') + '</div>';
        stage.querySelectorAll('button').forEach(function (b) {
          b.addEventListener('click', function () {
            var ok = Number(b.dataset.i) === q.answer;
            if (ok) sc++;
            b.style.background = ok ? '#22c55e' : '#ef4444';
            setTimeout(function () {
              qi++;
              if (qi >= DATA.questions.length) {
                elText.textContent = '게임 끝!';
                stage.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#fff;gap:10px;"><div style="font-size:2em;font-weight:800;">' + sc + ' / ' + DATA.questions.length + '</div><button type="button" class="nm-q-retry">↻ 다시 하기</button></div>';
                stage.querySelector('.nm-q-retry').addEventListener('click', function () { qi = 0; sc = 0; draw(); });
              } else draw();
            }, ok ? 700 : 1200);
          });
        });
      }
      draw();
    }
    var accentNum = parseInt(ACCENT.replace('#', '0x'));

    // 배경 별
    for (var i = 0; i < 40; i++) {
      var bg = new THREE.Mesh(new THREE.SphereGeometry(0.025 + Math.random() * 0.035, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 + Math.random() * 0.35 }));
      bg.position.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 10, -4 - Math.random() * 6);
      scene.add(bg);
    }

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var qIndex = 0, score = 0, busy = false, results = [];
    var choiceMeshes = [], labels = [], particles = [];
    var GEOS = [
      function () { return new THREE.SphereGeometry(0.62, 22, 22); },
      function () { return new THREE.BoxGeometry(1.0, 1.0, 1.0); },
      function () { return new THREE.OctahedronGeometry(0.75, 0); },
      function () { return new THREE.ConeGeometry(0.62, 1.1, 24); },
      function () { return new THREE.TorusGeometry(0.5, 0.22, 14, 36); },
    ];

    function renderDots() {
      var html = '';
      for (var i = 0; i < DATA.questions.length; i++) {
        var cls = 'nm-q-dot' + (results[i] === true ? ' ok' : results[i] === false ? ' bad' : i === qIndex ? ' cur' : '');
        html += '<div class="' + cls + '"></div>';
      }
      elDots.innerHTML = html;
      elScore.textContent = score + '점';
    }

    function clearChoices() {
      choiceMeshes.forEach(function (m) { scene.remove(m); });
      labels.forEach(function (l) { l.remove(); });
      choiceMeshes = []; labels = [];
    }

    function showQuestion() {
      clearChoices(); busy = false;
      var q = DATA.questions[qIndex];
      elText.textContent = 'Q' + (qIndex + 1) + '. ' + q.q;
      renderDots();
      var n = q.choices.length;
      for (var i = 0; i < n; i++) {
        var mesh = new THREE.Mesh(GEOS[i % GEOS.length](),
          new THREE.MeshBasicMaterial({ color: accentNum, transparent: true, opacity: 0.92 }));
        var t = (i / n) * Math.PI * 2 - Math.PI / 2;
        mesh.userData = { idx: i, baseX: Math.cos(t) * 2.9, baseY: Math.sin(t) * 1.55, ph: Math.random() * 6.28 };
        mesh.position.set(mesh.userData.baseX, mesh.userData.baseY, 0);
        scene.add(mesh); choiceMeshes.push(mesh);
        var lb = document.createElement('div');
        lb.className = 'nm-q-label'; lb.textContent = q.choices[i];
        stage.appendChild(lb); labels.push(lb);
      }
    }

    function burst(pos, color) {
      for (var i = 0; i < 22; i++) {
        var p = new THREE.Mesh(new THREE.SphereGeometry(0.06 + Math.random() * 0.06, 6, 6),
          new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 1 }));
        p.position.copy(pos);
        p.userData = { vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18, vz: (Math.random() - 0.5) * 0.12, life: 1 };
        scene.add(p); particles.push(p);
      }
    }

    function finish() {
      clearChoices();
      elText.textContent = '게임 끝!';
      var total = DATA.questions.length;
      var grade = score === total ? '🏆 완벽!' : score >= total * 0.8 ? '🎉 훌륭해요' : score >= total * 0.5 ? '👍 좋아요' : '📖 다시 복습해볼까요?';
      var end = document.createElement('div');
      end.className = 'nm-q-end';
      end.innerHTML = '<div class="nm-q-big">' + score + ' / ' + total + '</div><div>' + grade + '</div><button class="nm-q-retry" type="button">↻ 다시 하기</button>';
      stage.appendChild(end);
      end.querySelector('.nm-q-retry').addEventListener('click', function () {
        end.remove(); qIndex = 0; score = 0; results = []; showQuestion();
      });
      renderDots();
    }

    function pick(idx, mesh) {
      if (busy) return; busy = true;
      var q = DATA.questions[qIndex];
      var correct = idx === q.answer;
      results[qIndex] = correct;
      if (correct) { score++; burst(mesh.position, 0x22c55e); mesh.material.color.setHex(0x22c55e); }
      else {
        mesh.material.color.setHex(0xef4444); mesh.userData.shake = 1;
        var ans = choiceMeshes[q.answer];
        if (ans) ans.material.color.setHex(0x22c55e);
      }
      renderDots();
      setTimeout(function () {
        qIndex++;
        if (qIndex >= DATA.questions.length) finish(); else showQuestion();
      }, correct ? 850 : 1500);
    }

    stage.addEventListener('click', function (e) {
      if (busy || !choiceMeshes.length) return;
      var rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      var hits = raycaster.intersectObjects(choiceMeshes);
      if (hits.length) pick(hits[0].object.userData.idx, hits[0].object);
    });

    // 드래그 회전(가볍게)
    var drag = false, pxx = 0, rotY = 0;
    stage.addEventListener('mousedown', function (e) { drag = true; pxx = e.clientX; });
    window.addEventListener('mouseup', function () { drag = false; });
    stage.addEventListener('mousemove', function (e) {
      if (drag) { rotY += (e.clientX - pxx) * 0.0015; pxx = e.clientX; }
    });

    var T = 0;
    function loop() {
      requestAnimationFrame(loop);
      T += 0.016;
      choiceMeshes.forEach(function (m, i) {
        m.position.x = m.userData.baseX + Math.sin(T * 0.9 + m.userData.ph) * 0.12;
        m.position.y = m.userData.baseY + Math.cos(T * 1.1 + m.userData.ph) * 0.12;
        m.rotation.x += 0.008; m.rotation.y += 0.01;
        if (m.userData.shake) { m.position.x += Math.sin(T * 60) * 0.06 * m.userData.shake; m.userData.shake *= 0.92; }
        // 라벨 투영
        var v = m.position.clone().project(camera);
        var lb = labels[i];
        if (lb) {
          lb.style.left = ((v.x * 0.5 + 0.5) * stage.clientWidth) + 'px';
          lb.style.top = ((-v.y * 0.5 + 0.5) * stage.clientHeight - 38) + 'px';
        }
      });
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.position.x += p.userData.vx; p.position.y += p.userData.vy; p.position.z += p.userData.vz;
        p.userData.life -= 0.02; p.material.opacity = Math.max(0, p.userData.life);
        if (p.userData.life <= 0) { scene.remove(p); particles.splice(i, 1); }
      }
      scene.rotation.y = rotY;
      renderer.render(scene, camera);
    }

    window.addEventListener('resize', function () {
      camera.aspect = stage.clientWidth / stage.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(stage.clientWidth, stage.clientHeight);
    });

    showQuestion();
    loop();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
