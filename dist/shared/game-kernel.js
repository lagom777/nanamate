/* 나나메이트 게임 커널 — 학습 피드백(teach) + 진행 + 전역 뮤트
 * 플래그십이 공통으로 쓰는 얇은 레이어. THREE 비의존. 순수 헬퍼는 테스트 가능.
 * 브라우저: createKernel(host, { gameId }) → teach/saveBest/…
 */
(function () {
  'use strict';

  var MUTE_KEY = 'nm-lab-muted';
  var BEST_PREFIX = 'nm-lab-best:';
  var LEARN_KEY = 'nm-lab-learned'; // [{gameId, transfer, at}]
  var LEARN_MAX = 40;

  function load(k) {
    try {
      return window.localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  }
  function save(k, v) {
    try {
      window.localStorage.setItem(k, v);
    } catch (e) {}
  }

  // 동일 outcome 연속 실패 시 코칭 단계(1→2→3). 3부터 coachDeep 사용.
  function nextCoachStep(streakMap, outcome) {
    var n = (streakMap[outcome] || 0) + 1;
    streakMap[outcome] = n;
    return n;
  }

  function pickCoach(ev, step) {
    if (step >= 3 && ev.coachDeep) return ev.coachDeep;
    if (step >= 2 && ev.coachMid) return ev.coachMid;
    return ev.coach || '';
  }

  function readLearned() {
    try {
      var raw = load(LEARN_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function pushLearned(gameId, transfer) {
    if (!transfer) return readLearned();
    var arr = readLearned().filter(function (x) {
      return !(x && x.gameId === gameId && x.transfer === transfer);
    });
    arr.unshift({ gameId: gameId, transfer: transfer, at: Date.now() });
    if (arr.length > LEARN_MAX) arr = arr.slice(0, LEARN_MAX);
    save(LEARN_KEY, JSON.stringify(arr));
    return arr;
  }

  function starsFromScore(score, maxScore) {
    if (!maxScore || maxScore <= 0) return score > 0 ? 1 : 0;
    var r = score / maxScore;
    if (r >= 0.85) return 3;
    if (r >= 0.55) return 2;
    if (r > 0) return 1;
    return 0;
  }

  var LOGIC = {
    MUTE_KEY: MUTE_KEY,
    BEST_PREFIX: BEST_PREFIX,
    nextCoachStep: nextCoachStep,
    pickCoach: pickCoach,
    starsFromScore: starsFromScore,
    readLearned: readLearned,
    pushLearned: pushLearned
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LOGIC;
  }
  if (typeof window !== 'undefined') {
    window.NM_KERNEL_LOGIC = LOGIC;
  }

  function createKernel(host, opts) {
    if (typeof document === 'undefined' || !host) return null;
    opts = opts || {};
    var gameId = opts.gameId || 'game';
    var muted = load(MUTE_KEY) === '1';
    var failStreak = {};
    var RM = false;
    try {
      RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {}

    host.style.position = host.style.position || 'relative';
    host.style.borderRadius = host.style.borderRadius || '14px';

    // 시네마틱 프레임 — 비네트 + 상단 광원 하이라이트 (플래그십 공용, pointer-events 없음)
    var frameEl = document.createElement('div');
    frameEl.className = 'nm-kernel-frame';
    frameEl.style.cssText =
      'position:absolute;inset:0;z-index:4;pointer-events:none;border-radius:inherit;' +
      'box-shadow:inset 0 0 60px rgba(2,6,23,.55),inset 0 1px 0 rgba(255,255,255,.07),inset 0 -18px 34px rgba(2,6,23,.35);';
    host.appendChild(frameEl);

    var coachEl = document.createElement('div');
    coachEl.className = 'nm-kernel-coach';
    coachEl.setAttribute('role', 'status');
    coachEl.setAttribute('aria-live', 'polite');
    coachEl.style.cssText =
      'position:absolute;left:50%;transform:translateX(-50%);bottom:38px;z-index:6;pointer-events:none;' +
      'font:700 12.5px/1.45 "Noto Sans KR",sans-serif;color:#fde68a;' +
      'background:rgba(8,12,24,.72);border:1px solid rgba(251,191,36,.28);border-radius:999px;' +
      'padding:7px 14px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);' +
      'box-shadow:0 8px 24px rgba(2,6,23,.5);text-shadow:0 1px 3px rgba(0,0,0,.75);opacity:0;transition:opacity .2s;max-width:92%';
    host.appendChild(coachEl);

    var transferEl = document.createElement('div');
    transferEl.className = 'nm-kernel-transfer';
    transferEl.style.cssText =
      'display:none;position:absolute;inset:0;z-index:8;align-items:center;justify-content:center;' +
      'background:rgba(2,6,23,.78);padding:16px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border-radius:inherit;';
    transferEl.innerHTML =
      '<div style="max-width:360px;background:linear-gradient(165deg,#141c31,#0b1120);border:1px solid rgba(251,191,36,.32);border-radius:16px;padding:22px 20px;text-align:center;color:#e2e8f0;font-family:Noto Sans KR,sans-serif;box-shadow:0 24px 70px rgba(0,0,0,.6),0 0 40px rgba(251,191,36,.10),inset 0 1px 0 rgba(255,255,255,.06)">' +
      '<div style="font-size:11px;font-weight:900;letter-spacing:.14em;color:#fbbf24;margin-bottom:10px;text-transform:uppercase">TODAY · 가져갈 한 줄</div>' +
      '<p class="nm-kernel-transfer-text" style="margin:0 0 16px;font-size:15px;font-weight:800;line-height:1.55;color:#fde047;text-shadow:0 0 12px rgba(253,224,71,.35)"></p>' +
      '<button type="button" class="nm-kernel-again" style="min-height:40px;padding:10px 22px;border:none;border-radius:11px;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#1c1005;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 8px 22px rgba(245,158,11,.35),inset 0 1px 0 rgba(255,255,255,.35)">한 판 더</button>' +
      '</div>';
    host.appendChild(transferEl);
    var transferText = transferEl.querySelector('.nm-kernel-transfer-text');
    var againBtn = transferEl.querySelector('.nm-kernel-again');
    var onAgain = null;
    againBtn.addEventListener('click', function () {
      transferEl.style.display = 'none';
      if (typeof onAgain === 'function') onAgain();
    });

    var muteBtn = document.createElement('button');
    muteBtn.type = 'button';
    muteBtn.setAttribute('aria-label', '소리 켜기/끄기');
    muteBtn.style.cssText =
      'position:absolute;left:10px;bottom:8px;z-index:7;border:1px solid rgba(251,191,36,.25);' +
      'border-radius:9px;background:rgba(8,12,24,.6);color:#fde68a;font-size:14px;padding:4px 8px;cursor:pointer;' +
      'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)';
    function paintMute() {
      muteBtn.textContent = muted ? '🔇' : '🔊';
    }
    paintMute();
    muteBtn.onclick = function () {
      muted = !muted;
      save(MUTE_KEY, muted ? '1' : '0');
      paintMute();
    };
    host.appendChild(muteBtn);

    var coachTimer = null;
    function showCoach(msg, kind) {
      if (!msg) return;
      coachEl.textContent = (kind === 'ok' ? '✓ ' : '💡 ') + msg;
      coachEl.style.color = kind === 'ok' ? '#bbf7d0' : '#fef3c7';
      coachEl.style.opacity = '1';
      if (coachTimer) clearTimeout(coachTimer);
      coachTimer = setTimeout(function () {
        coachEl.style.opacity = '0';
      }, RM ? 1600 : 3200);
    }

    var actx = null;
    function beep(f, d, type) {
      if (muted) return;
      try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        var o = actx.createOscillator(),
          g = actx.createGain();
        o.type = type || 'sine';
        o.frequency.value = f;
        o.connect(g);
        g.connect(actx.destination);
        var t = actx.currentTime;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.11, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.start(t);
        o.stop(t + d + 0.02);
      } catch (e) {}
    }

    return {
      gameId: gameId,
      isMuted: function () {
        return muted;
      },
      isReducedMotion: function () {
        return RM;
      },
      beep: beep,
      teach: function (ev) {
        if (!ev) return;
        if (ev.kind === 'fail') {
          var step = nextCoachStep(failStreak, ev.outcome || 'miss');
          showCoach(pickCoach(ev, step), 'fail');
          beep(150, 0.12, 'square');
        } else if (ev.kind === 'success') {
          failStreak = {};
          if (ev.coach) showCoach(ev.coach, 'ok');
          beep(720, 0.08, 'sine');
        } else if (ev.kind === 'hint' && ev.coach) {
          showCoach(ev.coach, 'fail');
        } else if (ev.kind === 'clear') {
          failStreak = {};
          if (ev.transfer) {
            pushLearned(gameId, ev.transfer);
            transferText.textContent = ev.transfer;
            transferEl.style.display = 'flex';
            onAgain = typeof ev.onAgain === 'function' ? ev.onAgain : null;
          } else if (ev.coach) {
            showCoach(ev.coach, 'ok');
          }
        }
      },
      resetStreak: function () {
        failStreak = {};
      },
      getBest: function () {
        return parseInt(load(BEST_PREFIX + gameId) || '0', 10) || 0;
      },
      saveBest: function (score) {
        var s = Math.round(score) || 0;
        var prev = this.getBest();
        if (s > prev) save(BEST_PREFIX + gameId, String(s));
        return Math.max(s, prev);
      },
      getLearned: readLearned
    };
  }

  if (typeof window !== 'undefined') {
    window.NMGameKernel = { create: createKernel, logic: LOGIC };
  }
})();
