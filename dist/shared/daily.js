/* ============================================================
   nanamate · 일일학습 엔진 (공용) — window.NanamateDaily
   페이지에 window.NANAMATE_DAILY = {kind, subject, accent, ...}
   와 <div id="nm-daily-host"></div> 가 있으면 자동으로 UI를 그린다.
   (quizgame3d.js와 동일한 "전역 데이터 + host div + 자동 init" 컨벤션)

   의존성 0 · THREE 불필요 · ES5-safe · 스타일은 shared/daily.css
   (daily.css는 light-theme.css 뒤에 로드할 것)

   데이터 계약 (daily-data.js가 daily.js보다 먼저 defer 로드):
     kind:'lesson'  → {subject, accent, title, epoch, perDay, quizPerDay,
                       items:[{badge,front,sub?,mean,ex?,exSub?,exMean?,hint?}],
                       quiz:[{q,choices,answer,explain?}]}
     kind:'quizset' → {subject, accent, title, epoch, setSize,
                       questions:[{part?,passage?,q,choices,answer,explain?}]}

   localStorage: 'NANAMATE_DAILY_' + SUBJECT
     {"streak":4,"lastDone":"2026-07-03","totalDone":12,"best":9}
   ============================================================ */
(function () {
  'use strict';

  /* Math.imul 폴리필 (구형 브라우저 대비, mulberry32 정확성에 필요) */
  var imul = Math.imul || function (a, b) {
    var ah = (a >>> 16) & 0xffff, al = a & 0xffff;
    var bh = (b >>> 16) & 0xffff, bl = b & 0xffff;
    return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)) | 0;
  };

  /* ---------- PRNG / 날짜 ---------- */

  /**
   * 표준 mulberry32 PRNG.
   * @param {number} seed uint32 시드
   * @returns {function(): number} 호출마다 [0,1) 난수를 내는 함수 (같은 시드 → 같은 수열)
   */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = imul(a ^ (a >>> 15), 1 | a);
      t = (t + imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Date → 'YYYY-MM-DD' (로컬타임. toISOString 금지) */
  function fmtDate(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }

  /** 'YYYY-MM-DD' → 로컬 자정 Date */
  function parseDateStr(s) {
    var p = String(s).split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  /**
   * 오늘 날짜 문자열 'YYYY-MM-DD' (로컬타임).
   * @param {Date} [d] 생략 시 now. 테스트용: d 생략 + URL에 ?nmdate=YYYY-MM-DD 있으면 그 값 반환
   * @returns {string}
   */
  function todayStr(d) {
    if (!d) {
      try {
        var m = /[?&]nmdate=(\d{4}-\d{2}-\d{2})/.exec(window.location.search);
        if (m) return m[1];
      } catch (e) { /* location 없음(테스트 환경) */ }
      d = new Date();
    }
    return fmtDate(d);
  }

  /**
   * 날짜+salt → uint32 시드. Number(dateStr.replace(/-/g,''))에서 시작해
   * salt의 각 문자를 (seed*31+code)>>>0 로 혼합.
   * @param {string} dateStr 'YYYY-MM-DD'
   * @param {string} [salt] 과목별 구분용 문자열
   * @returns {number} uint32
   */
  function seedFrom(dateStr, salt) {
    var seed = Number(String(dateStr).replace(/-/g, '')) >>> 0;
    var s = salt == null ? '' : String(salt);
    for (var i = 0; i < s.length; i++) {
      seed = (seed * 31 + s.charCodeAt(i)) >>> 0;
    }
    return seed;
  }

  /* ---------- 결정적/랜덤 선택 ---------- */

  /** 인덱스 배열을 rng로 Fisher-Yates 셔플해서 반환 (bank는 건드리지 않음) */
  function shuffledIndexes(len, rng) {
    var idx = [], i;
    for (i = 0; i < len; i++) idx.push(i);
    for (i = len - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = idx[i]; idx[i] = idx[j]; idx[j] = t;
    }
    return idx;
  }

  function takeByIndexes(bank, idx, n) {
    var count = Math.min(n == null ? bank.length : n, bank.length);
    var out = [];
    for (var i = 0; i < count; i++) out.push(bank[idx[i]]);
    return out;
  }

  /**
   * 날짜 기반 결정적 선택: 같은 날짜+salt+bank.length면 항상 같은 결과.
   * mulberry32(seedFrom(date,salt))로 인덱스 Fisher-Yates 셔플 후 앞 n개.
   * @param {Array} bank 아이템 은행 (변형되지 않음)
   * @param {number} n 뽑을 개수
   * @param {string} salt 과목/용도별 구분 문자열 (예: 'ENGLISH', 'ENGLISH-quiz')
   * @param {string} [dateStr] 'YYYY-MM-DD', 생략 시 todayStr()
   * @returns {Array} 새 배열
   */
  function pickDaily(bank, n, salt, dateStr) {
    bank = bank || [];
    var rng = mulberry32(seedFrom(dateStr || todayStr(), salt));
    return takeByIndexes(bank, shuffledIndexes(bank.length, rng), n);
  }

  /**
   * Math.random 셔플 후 앞 n개 (스트릭 무관 랜덤 모드용).
   * @param {Array} bank
   * @param {number} n
   * @returns {Array} 새 배열
   */
  function pickRandom(bank, n) {
    bank = bank || [];
    return takeByIndexes(bank, shuffledIndexes(bank.length, Math.random), n);
  }

  /**
   * epoch로부터 며칠째인지 (1-based, 로컬 자정 기준).
   * @param {string} epochStr 'YYYY-MM-DD'
   * @param {string} [dateStr] 생략 시 todayStr()
   * @returns {number} epoch 당일 = 1
   */
  function dayNumber(epochStr, dateStr) {
    var d = parseDateStr(dateStr || todayStr());
    var e = parseDateStr(epochStr);
    return Math.round((d.getTime() - e.getTime()) / 86400000) + 1;
  }

  /**
   * TOEIC식 일별 세트 슬라이스. bank를 size씩 자른 세트를 날짜순으로 순환.
   * @param {Array} bank 문제 은행
   * @param {number} size 세트 크기
   * @param {string} epochStr Day 1 기준일
   * @param {string} [dateStr] 생략 시 todayStr()
   * @returns {{day:number, totalDays:number, items:Array}}
   */
  function daySlice(bank, size, epochStr, dateStr) {
    bank = bank || [];
    size = size || 10;
    var totalDays = Math.ceil(bank.length / size);
    if (totalDays < 1) return { day: 1, totalDays: 0, items: [] };
    var n = dayNumber(epochStr, dateStr);
    var idx = (((n - 1) % totalDays) + totalDays) % totalDays; /* 음수 안전 순환 */
    return { day: idx + 1, totalDays: totalDays, items: bank.slice(idx * size, idx * size + size) };
  }

  /* ---------- 스트릭/완료 상태 (localStorage, try/catch 래핑) ---------- */

  /**
   * @param {string} subject 예: 'ENGLISH'
   * @returns {string} 'NANAMATE_DAILY_ENGLISH'
   */
  function storageKey(subject) {
    return 'NANAMATE_DAILY_' + String(subject).toUpperCase();
  }

  /**
   * 저장된 상태를 기본값과 병합해 반환.
   * @param {string} subject
   * @returns {{streak:number, lastDone:(string|null), totalDone:number, best:(number|null)}}
   */
  function getState(subject) {
    var out = { streak: 0, lastDone: null, totalDone: 0, best: null };
    try {
      var raw = window.localStorage.getItem(storageKey(subject));
      if (raw) {
        var parsed = JSON.parse(raw);
        for (var k in out) {
          if (Object.prototype.hasOwnProperty.call(out, k) && parsed && parsed[k] !== undefined) {
            out[k] = parsed[k];
          }
        }
      }
    } catch (e) { /* 저장소 불가/파싱 실패 → 기본값 */ }
    return out;
  }

  /** @returns {boolean} 오늘 이미 완료했는지 */
  function isDoneToday(subject) {
    return getState(subject).lastDone === todayStr();
  }

  /**
   * '오늘의 학습' 완료 마킹 (랜덤 모드에선 호출 금지). 하루 1회 멱등.
   * lastDone이 어제면 streak+1, 아니면 streak=1. totalDone++, best=max(best,score).
   * @param {string} subject
   * @param {number} [score] 이번 점수 (best 갱신용)
   * @param {number} [total] 만점 (현재 저장 안 함, 시그니처 호환용)
   * @returns {object} 새 state
   */
  function markDone(subject, score, total) {
    var state = getState(subject);
    var today = todayStr();
    if (state.lastDone === today) return state; /* 멱등: 이미 오늘 완료 */
    var y = parseDateStr(today);
    y.setDate(y.getDate() - 1);
    state.streak = (state.lastDone === fmtDate(y)) ? state.streak + 1 : 1;
    state.lastDone = today;
    state.totalDone = (state.totalDone || 0) + 1;
    if (typeof score === 'number') {
      state.best = (state.best == null) ? score : Math.max(state.best, score);
    }
    try { window.localStorage.setItem(storageKey(subject), JSON.stringify(state)); } catch (e) {}
    return state;
  }

  /* ---------- 렌더 헬퍼 (순수 DOM, 클래스 prefix .nm-daily-) ---------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /**
   * 🔥 연속 N일 · ✅오늘 완료/⬜미완료 · 누적 N회 배지 바. 재호출 시 갱신.
   * @param {Element} host
   * @param {string} subject
   * @param {string} [accent] 과목 액센트 색
   */
  function renderStreak(host, subject, accent) {
    var s = getState(subject);
    var done = isDoneToday(subject);
    host.innerHTML = '';
    var bar = el('div', 'nm-daily-streak');
    if (accent) bar.style.setProperty('--nm-daily-accent', accent);
    bar.appendChild(el('span', 'nm-daily-badge nm-daily-badge-fire', '🔥 연속 ' + s.streak + '일'));
    bar.appendChild(el('span', 'nm-daily-badge ' + (done ? 'nm-daily-badge-done' : 'nm-daily-badge-todo'),
      done ? '✅ 오늘 완료' : '⬜ 오늘 미완료'));
    bar.appendChild(el('span', 'nm-daily-badge', '📚 누적 ' + s.totalDone + '회'));
    host.appendChild(bar);
  }

  /**
   * '📅 오늘의 학습' / '🎲 랜덤 뽑기' 모드 탭.
   * 탭을 다시 눌러도 onSelect가 불린다(랜덤 재뽑기 용도).
   * @param {Element} host
   * @param {string} accent
   * @param {function(string):void} onSelect 'daily' | 'random'
   */
  function renderModeTabs(host, accent, onSelect) {
    host.innerHTML = '';
    var wrap = el('div', 'nm-daily-tabs');
    if (accent) wrap.style.setProperty('--nm-daily-accent', accent);
    var modes = [
      { id: 'daily', label: '📅 오늘의 학습' },
      { id: 'random', label: '🎲 랜덤 뽑기' }
    ];
    var btns = [];
    for (var i = 0; i < modes.length; i++) {
      (function (mode) {
        var btn = el('button', 'nm-daily-tab' + (mode.id === 'daily' ? ' active' : ''), mode.label);
        btn.type = 'button';
        btn.addEventListener('click', function () {
          for (var j = 0; j < btns.length; j++) btns[j].className = 'nm-daily-tab';
          btn.className = 'nm-daily-tab active';
          if (typeof onSelect === 'function') onSelect(mode.id);
        });
        btns.push(btn);
        wrap.appendChild(btn);
      })(modes[i]);
    }
    host.appendChild(wrap);
  }

  /**
   * 레슨 아이템 카드 목록.
   * item: {badge?, front, sub?(병음), mean?, hint?(발음힌트), ex?, exSub?, exMean?}
   * @param {Element} host
   * @param {Array} items
   * @param {string} [accent]
   */
  function renderItemCards(host, items, accent) {
    host.innerHTML = '';
    var list = el('div', 'nm-daily-cards');
    if (accent) list.style.setProperty('--nm-daily-accent', accent);
    for (var i = 0; i < (items || []).length; i++) {
      var item = items[i];
      var card = el('div', 'nm-daily-card');
      if (item.badge) card.appendChild(el('span', 'nm-daily-tag', item.badge));
      var front = el('div', 'nm-daily-front', item.front || '');
      if (item.sub) front.appendChild(el('span', 'nm-daily-sub', item.sub));
      card.appendChild(front);
      if (item.mean) card.appendChild(el('div', 'nm-daily-mean', item.mean));
      if (item.hint) card.appendChild(el('div', 'nm-daily-hint', item.hint));
      if (item.ex) {
        var ex = el('div', 'nm-daily-ex');
        ex.appendChild(el('div', 'nm-daily-ex-main', item.ex));
        if (item.exSub) ex.appendChild(el('div', 'nm-daily-sub', item.exSub));
        if (item.exMean) ex.appendChild(el('div', 'nm-daily-ex-mean', item.exMean));
        card.appendChild(ex);
      }
      list.appendChild(card);
    }
    host.appendChild(list);
  }

  /**
   * MCQ 퀴즈 렌더러. 선택 → 정답 초록/오답 빨강, showExplain 시 해설 노출,
   * 전부 풀면 결과 박스 + onComplete(correct,total).
   * question: {q, passage?, part?, choices:[..], answer:idx, explain?}
   * @param {Element} host
   * @param {Array} questions
   * @param {{accent?:string, showExplain?:boolean, onComplete?:function(number,number):void}} [opts]
   */
  function renderQuiz(host, questions, opts) {
    opts = opts || {};
    questions = questions || [];
    host.innerHTML = '';
    var wrap = el('div', 'nm-daily-quiz');
    if (opts.accent) wrap.style.setProperty('--nm-daily-accent', opts.accent);
    var total = questions.length;
    var answered = 0, correct = 0;
    var resultBox = el('div', 'nm-daily-result');
    resultBox.style.display = 'none';

    for (var qi = 0; qi < total; qi++) {
      (function (item, num) {
        var block = el('div', 'nm-daily-q');
        if (item.part) block.appendChild(el('span', 'nm-daily-part', 'Part ' + item.part));
        if (item.passage) block.appendChild(el('div', 'nm-daily-passage', item.passage));
        block.appendChild(el('div', 'nm-daily-q-text', 'Q' + num + '. ' + item.q));
        var choicesBox = el('div', 'nm-daily-choices');
        var btns = [];
        var explainBox = null;
        if (opts.showExplain && item.explain) {
          explainBox = el('div', 'nm-daily-explain', '💡 ' + item.explain);
          explainBox.style.display = 'none';
        }
        var done = false;
        for (var ci = 0; ci < (item.choices || []).length; ci++) {
          (function (choiceIdx) {
            var btn = el('button', 'nm-daily-choice', item.choices[choiceIdx]);
            btn.type = 'button';
            btn.addEventListener('click', function () {
              if (done) return;
              done = true;
              answered++;
              var ok = choiceIdx === item.answer;
              if (ok) correct++;
              for (var b = 0; b < btns.length; b++) btns[b].disabled = true;
              btn.className = 'nm-daily-choice ' + (ok ? 'ok' : 'bad');
              if (!ok && btns[item.answer]) btns[item.answer].className = 'nm-daily-choice ok';
              if (explainBox) explainBox.style.display = '';
              if (answered >= total) {
                resultBox.textContent = (correct === total ? '🎉 ' : '🎯 ') +
                  '결과: ' + correct + ' / ' + total + ' 정답';
                resultBox.style.display = '';
                if (typeof opts.onComplete === 'function') opts.onComplete(correct, total);
              }
            });
            btns.push(btn);
            choicesBox.appendChild(btn);
          })(ci);
        }
        block.appendChild(choicesBox);
        if (explainBox) block.appendChild(explainBox);
        wrap.appendChild(block);
      })(questions[qi], qi + 1);
    }

    wrap.appendChild(resultBox);
    host.appendChild(wrap);
  }

  /* ---------- mount: 전체 페이지 조립 ---------- */

  /**
   * data.kind에 따라 스트릭 바 + 모드 탭 + 콘텐츠(카드/퀴즈)를 host에 조립.
   * - kind:'lesson'  : daily → pickDaily(items,perDay,subject) 카드
   *                    + pickDaily(quiz,quizPerDay||3,subject+'-quiz') 퀴즈,
   *                    퀴즈 완료 시 markDone → 스트릭 재렌더.
   *                    random → pickRandom 동일 구성 + 스트릭 미반영 안내.
   * - kind:'quizset' : daily → daySlice(questions,setSize||10,epoch)
   *                    "📅 Day {day} / {totalDays} 세트" + 해설 퀴즈, 완료 시 markDone.
   *                    random → pickRandom(questions,setSize).
   * @param {Element} host
   * @param {object} data window.NANAMATE_DAILY 형식
   */
  function mount(host, data) {
    if (!host || !data) return;
    var accent = data.accent || '#0066cc';
    host.innerHTML = '';
    var root = el('div', 'nm-daily');
    root.style.setProperty('--nm-daily-accent', accent);
    var streakHost = el('div');
    var tabsHost = el('div');
    var body = el('div', 'nm-daily-body');
    root.appendChild(streakHost);
    root.appendChild(tabsHost);
    root.appendChild(body);
    host.appendChild(root);

    function refreshStreak() { renderStreak(streakHost, data.subject, accent); }

    function onQuizComplete(isDailyMode) {
      return function (c, t) {
        if (isDailyMode) {
          markDone(data.subject, c, t);
          refreshStreak();
        }
      };
    }

    function show(mode) {
      body.innerHTML = '';
      var isDailyMode = mode === 'daily';

      if (data.kind === 'quizset') {
        var setSize = data.setSize || 10;
        var qs, title;
        if (isDailyMode) {
          var slice = daySlice(data.questions, setSize, data.epoch);
          qs = slice.items;
          title = '📅 Day ' + slice.day + ' / ' + slice.totalDays + ' 세트';
        } else {
          qs = pickRandom(data.questions, setSize);
          title = '🎲 랜덤 세트 (' + qs.length + '문제)';
        }
        body.appendChild(el('h2', 'nm-daily-section-title', title));
        if (!isDailyMode) {
          body.appendChild(el('p', 'nm-daily-note', '랜덤 모드는 스트릭에 반영되지 않아요. 탭을 다시 누르면 새로 뽑아요.'));
        }
        var quizHost = el('div');
        body.appendChild(quizHost);
        renderQuiz(quizHost, qs, {
          accent: accent,
          showExplain: true,
          onComplete: onQuizComplete(isDailyMode)
        });
        return;
      }

      /* kind:'lesson' */
      var perDay = data.perDay || 5;
      var quizPerDay = data.quizPerDay || 3;
      var items, quiz;
      if (isDailyMode) {
        items = pickDaily(data.items, perDay, data.subject);
        quiz = pickDaily(data.quiz, quizPerDay, data.subject + '-quiz');
        body.appendChild(el('h2', 'nm-daily-section-title', '📅 ' + (data.title || '오늘의 학습') + ' — ' + todayStr()));
      } else {
        items = pickRandom(data.items, perDay);
        quiz = pickRandom(data.quiz, quizPerDay);
        body.appendChild(el('h2', 'nm-daily-section-title', '🎲 랜덤 뽑기'));
        body.appendChild(el('p', 'nm-daily-note', '랜덤 모드는 스트릭에 반영되지 않아요. 탭을 다시 누르면 새로 뽑아요.'));
      }
      var cardsHost = el('div');
      body.appendChild(cardsHost);
      renderItemCards(cardsHost, items, accent);
      if (quiz.length) {
        body.appendChild(el('h2', 'nm-daily-section-title', '✏️ 미니 퀴즈'));
        var lessonQuizHost = el('div');
        body.appendChild(lessonQuizHost);
        renderQuiz(lessonQuizHost, quiz, {
          accent: accent,
          showExplain: true,
          onComplete: onQuizComplete(isDailyMode)
        });
      }
    }

    refreshStreak();
    renderModeTabs(tabsHost, accent, show);
    show('daily');
  }

  /* ---------- 공개 API ---------- */
  window.NanamateDaily = {
    mulberry32: mulberry32,
    todayStr: todayStr,
    seedFrom: seedFrom,
    pickDaily: pickDaily,
    pickRandom: pickRandom,
    dayNumber: dayNumber,
    daySlice: daySlice,
    storageKey: storageKey,
    getState: getState,
    isDoneToday: isDoneToday,
    markDone: markDone,
    renderStreak: renderStreak,
    renderModeTabs: renderModeTabs,
    renderItemCards: renderItemCards,
    renderQuiz: renderQuiz,
    mount: mount
  };

  /* ---------- 자동 init (quizgame3d 컨벤션) ---------- */
  function init() {
    var host = document.getElementById('nm-daily-host');
    if (host && window.NANAMATE_DAILY) mount(host, window.NANAMATE_DAILY);
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
