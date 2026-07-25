/* ============================================================
   nanamate · 전역 검색 (44개 과목 across)
   - 어느 페이지에서든 과목을 한국어/영어/설명/카테고리로 검색.
   - 단축키: Ctrl/⌘ + K (또는 / 키), Esc 로 닫기.
   - 의존성 0 · 바닐라 JS · 라이트 테마 대응 · i18n 다국어.
   ============================================================ */
(function () {
  'use strict';

  // === 과목 색인 (index.html 에서 추출, 정렬 유지) ===
  var SUBJECTS = [
    {"n": "물리학", "e": "Interactive Physics Lab", "d": "역학~양자역학, 상대성이론까지 3D 시뮬레이션", "u": "aboutPhysics/index.html", "c": "자연과학", "a": "#00d4ff"},
    {"n": "화학", "e": "Molecular Chemistry", "d": "원자~유기화학, 생화학 3D 분자 모델", "u": "aboutChemistry/index.html", "c": "자연과학", "a": "#00e890"},
    {"n": "생물학", "e": "Biology Lab", "d": "세포, DNA, 진화, 생태학 3D 시뮬레이션", "u": "aboutBiology/index.html", "c": "자연과학", "a": "#22c55e"},
    {"n": "지구과학", "e": "Earth Science", "d": "판구조론, 대기, 해양, 기후변화 3D 지구", "u": "aboutEarthScience/index.html", "c": "자연과학", "a": "#1565c0"},
    {"n": "천문학", "e": "Astronomy", "d": "태양계, 은하, 블랙홀, 우주 탐사 3D 궤도", "u": "aboutAstronomy/index.html", "c": "자연과학", "a": "#6366f1"},
    {"n": "뇌과학", "e": "Neuroscience", "d": "뉴런, 기억, 의식, 신경가소성, BCI", "u": "aboutNeuroscience/index.html", "c": "자연과학", "a": "#818cf8"},
    {"n": "수학", "e": "Mathematics", "d": "수와 집합부터 미분·적분까지 개념 3D 시각화", "u": "aboutMath/index.html", "c": "자연과학", "a": "#f43f5e"},
    {"n": "인공지능", "e": "Artificial Intelligence", "d": "역사~Transformer, LLM, 생성모델, 안전성", "u": "aboutAI/index.html", "c": "IT", "a": "#7b5cff"},
    {"n": "하네스 엔지니어링", "e": "Agent Harness Engineering", "d": "루프·툴·컨텍스트·검증·오케스트레이션 + 실전 도구", "u": "aboutHarness/index.html", "c": "IT", "a": "#14b8a6"},
    {"n": "프론트엔드", "e": "Frontend Development", "d": "HTML~React, 빌드도구, 배포 인터랙티브", "u": "aboutFrontend/index.html", "c": "IT", "a": "#0ea5e9"},
    {"n": "백엔드", "e": "Backend Development", "d": "서버, API, 인증, 마이크로서비스, DevOps", "u": "aboutBackend/index.html", "c": "IT", "a": "#22c55e"},
    {"n": "데이터베이스", "e": "Database Systems", "d": "SQL, 정규화, NoSQL, 분산DB, 설계 패턴", "u": "aboutDatabase/index.html", "c": "IT", "a": "#0d6efd"},
    {"n": "정보보안", "e": "Information Security", "d": "암호학, 네트워크 보안, 웹 취약점, 침투테스트", "u": "aboutSecurity/index.html", "c": "IT", "a": "#475569"},
    {"n": "심리학", "e": "Psychology", "d": "뇌·지각·학습·기억·발달·성격·사회·정서", "u": "aboutPsy/index.html", "c": "인문", "a": "#a855f7"},
    {"n": "철학", "e": "Philosophy", "d": "고대 그리스~현대 철학, 사상의 계보", "u": "aboutPhilosophy/index.html", "c": "인문", "a": "#d4a047"},
    {"n": "작문", "e": "Writing", "d": "문장 기초~에세이·스토리텔링·자기소개서·AI 작문", "u": "aboutWriting/index.html", "c": "인문", "a": "#ec6f9c"},
    {"n": "역사", "e": "World History", "d": "고대 문명~현대, 한국사 포함", "u": "aboutHistory/index.html", "c": "인문", "a": "#b45309"},
    {"n": "사회학", "e": "Sociology", "d": "문화, 계층, 젠더, 디지털 사회", "u": "aboutSociology/index.html", "c": "인문", "a": "#7c3aed"},
    {"n": "정치학", "e": "Political Science", "d": "정치 이념, 민주주의, 국제관계", "u": "aboutPolitics/index.html", "c": "인문", "a": "#dc2626"},
    {"n": "경제학", "e": "Economics", "d": "미시·거시경제, 금융, 행동경제학", "u": "aboutEconomics/index.html", "c": "인문", "a": "#0891b2"},
    {"n": "법학", "e": "Everyday Law", "d": "헌법~디지털 법률, 일상 법률", "u": "aboutLaw/index.html", "c": "인문", "a": "#1d4ed8"},
    {"n": "세계 종교", "e": "World Religions", "d": "석가모니·예수·공자·노자, 창시자로 읽는 9대 전통", "u": "aboutReligion/index.html", "c": "종교", "a": "#e0a82e"},
    {"n": "그리스·로마 신화", "e": "Greek & Roman Mythology", "d": "올림포스 12신, 영웅과 트로이 전쟁, 변신 이야기", "u": "aboutMythology/index.html", "c": "종교", "a": "#e0b341"},
    {"n": "이념과 체제", "e": "Political Ideologies", "d": "민주주의·자본주의·사회주의·복지국가 등 9가지 이념", "u": "aboutIdeology/index.html", "c": "이념", "a": "#e11d48"},
    {"n": "기쁨", "e": "Joy", "d": "도파민 보상, 행복의 과학, 의미와 몰입", "u": "aboutJoy/index.html", "c": "감정", "a": "#fde047"},
    {"n": "슬픔", "e": "Sadness", "d": "상실, 비탄, 우울, 회복탄력성", "u": "aboutSadness/index.html", "c": "감정", "a": "#60a5fa"},
    {"n": "분노", "e": "Anger", "d": "부당함의 신호, 공격성, 분노 조절", "u": "aboutAnger/index.html", "c": "감정", "a": "#ef4444"},
    {"n": "공포", "e": "Fear", "d": "편도체, 불안장애, 노출치료, PTSD", "u": "aboutFear/index.html", "c": "감정", "a": "#8b5cf6"},
    {"n": "혐오", "e": "Disgust", "d": "오염 회피, 도덕적 혐오, 편견", "u": "aboutDisgust/index.html", "c": "감정", "a": "#84cc16"},
    {"n": "놀람", "e": "Surprise", "d": "예측 오차, 학습, 호기심, 예측 부호화", "u": "aboutSurprise/index.html", "c": "감정", "a": "#fbbf24"},
    {"n": "사랑·애착", "e": "Love & Attachment", "d": "옥시토신, 4유형 애착, 관계의 과학", "u": "aboutLove/index.html", "c": "감정", "a": "#ec4899"},
    {"n": "수치·죄책감", "e": "Shame & Guilt", "d": "자기 의식적 정서, 자비 중심 치료, 자기 연민", "u": "aboutShameGuilt/index.html", "c": "감정", "a": "#a78bfa"},
    {"n": "자긍심·희망", "e": "Pride & Hope", "d": "자기 효능감, 회복탄력성, 성장 마인드셋", "u": "aboutPrideHope/index.html", "c": "감정", "a": "#f472b6"},
    {"n": "영어", "e": "General English", "d": "문법, 회화, 작문, 청해 종합 학습", "u": "aboutEnglish/index.html", "c": "실용", "a": "#3b82f6"},
    {"n": "토익", "e": "TOEIC Preparation", "d": "LC/RC 전략, 어휘, 모의고사", "u": "aboutTOEIC/index.html", "c": "실용", "a": "#f59e0b"},
    {"n": "토플", "e": "TOEFL Preparation", "d": "iBT 4영역(R/L/S/W), 어휘, 모의고사", "u": "aboutTOEFL/index.html", "c": "실용", "a": "#06b6d4"},
    {"n": "중국어", "e": "Chinese Language", "d": "발음~HSK, 비즈니스 중국어", "u": "aboutChinese/index.html", "c": "실용", "a": "#ef4444"},
    {"n": "마케팅", "e": "Marketing & Growth", "d": "소비자 심리, 브랜딩, 그로스 해킹", "u": "aboutMarketing/index.html", "c": "실용", "a": "#e040fb"},
    {"n": "창업", "e": "Startup", "d": "아이디어~엑싯, 투자, 팀빌딩", "u": "aboutStartup/index.html", "c": "실용", "a": "#f97316"},
    {"n": "재테크·투자", "e": "Personal Finance", "d": "복리·주식·채권·ETF·부동산·포트폴리오·연금", "u": "aboutInvesting/index.html", "c": "실용", "a": "#16c784"},
    {"n": "재무관리", "e": "Financial Management", "d": "시간가치·자본예산·자본구조·배당·운전자본", "u": "aboutFinance/index.html", "c": "실용", "a": "#0f766e"},
    {"n": "경영통계학", "e": "Business Statistics", "d": "기술통계·확률분포·신뢰구간·가설검정·회귀", "u": "aboutBizStats/index.html", "c": "실용", "a": "#7c3aed"},
    {"n": "LEET 법학적성", "e": "Legal Education Eligibility Test", "d": "로스쿨 입학 — 언어이해·추리논증 완전 정복", "u": "aboutLEET/index.html", "c": "실용", "a": "#b91c1c"},
    {"n": "음악이론", "e": "Music Theory", "d": "음계, 화성, 리듬, 작곡, 제작", "u": "aboutMusic/index.html", "c": "예술", "a": "#ec4899"},
    {"n": "사주명리", "e": "Four Pillars", "d": "천간·지지·오행, 동양 운명학", "u": "aboutSaju/index.html", "c": "운명", "a": "#ff4d8d"},
    {"n": "풍수지리", "e": "Feng Shui", "d": "기·음양오행, 형세론·이기론, 양택·음택 명당", "u": "aboutFengshui/index.html", "c": "운명", "a": "#14b8a6"},
    {"n": "별자리 점성술", "e": "Astrology", "d": "황도 12궁, 출생 차트, 빅3, 궁합·트랜짓", "u": "aboutAstrology/index.html", "c": "운명", "a": "#c084fc"},
    {"n": "주역 육효점", "e": "I Ching Divination", "d": "동전 6번으로 64괘 뽑기 · 변괘로 보는 운세", "u": "aboutIching/index.html", "c": "운명", "a": "#cf9b34"},
    {"n": "타로카드", "e": "Tarot", "d": "78장의 상징, 메이저·마이너 아르카나, 스프레드 읽기", "u": "aboutTarot/index.html", "c": "운명", "a": "#b18cf0"}
  ];

  // === 다국어 UI 문자열 ===
  var I18N = {
    btn:    { ko: '🔍 검색', en: '🔍 Search', ja: '🔍 検索', zh: '🔍 搜索' },
    title:  { ko: '과목 검색', en: 'Search subjects', ja: '科目を検索', zh: '搜索科目' },
    ph:     { ko: '과목·분야·키워드…', en: 'subject, field, keyword…', ja: '科目・分野・キーワード…', zh: '科目・领域・关键词…' },
    none:   { ko: '결과 없음', en: 'No results', ja: '結果なし', zh: '无结果' },
    hint:   { ko: '↑↓ 이동 · Enter 열기 · Esc 닫기', en: '↑↓ move · Enter open · Esc close', ja: '↑↓ 移動 · Enter 開く · Esc 閉じる', zh: '↑↓ 移动 · Enter 打开 · Esc 关闭' }
  };

  function lang() {
    var l = localStorage.getItem('nanamate-lang') || 'ko';
    return I18N.btn[l] ? l : 'ko';
  }
  function t(key) { return I18N[key][lang()] || I18N[key].ko; }

  // === 경로 보정: 현재 페이지 깊이에 맞춰 "aboutX/index.html" 앞에 ../ 를 붙인다 ===
  function basePrefix() {
    // 사이트 루트 기준. about*/index.html 은 깊이 1, about*/chapters/*.html 은 깊이 2.
    var path = location.pathname;
    var idx = path.indexOf('/about');
    if (idx === -1) {
      // 허브(루트) 또는 알 수 없는 위치 → 그대로 사용
      return '';
    }
    // /about... 이후 슬래시 개수만큼 ../
    var after = path.slice(idx + 1); // "aboutX/..." 형태
    var slashes = (after.match(/\//g) || []).length; // 파일까지 포함한 디렉터리 깊이
    var up = '';
    for (var i = 0; i < slashes; i++) up += '../';
    return up;
  }

  // === 검색 매칭 ===
  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) return SUBJECTS.slice();
    var terms = q.split(/\s+/);
    return SUBJECTS.filter(function (s) {
      var hay = (s.n + ' ' + s.e + ' ' + s.d + ' ' + s.c).toLowerCase();
      return terms.every(function (term) { return hay.indexOf(term) !== -1; });
    });
  }

  // === 스타일 (라이트/다크 변수 모두 대응) ===
  function injectCSS() {
    if (document.getElementById('nm-search-style')) return;
    var css =
      '.nm-search-btn{display:block;width:100%;margin-top:14px;padding:10px 14px;border:1px solid var(--accent,#7b5cff);border-radius:10px;background:var(--accent-glow,rgba(123,92,255,.12));color:var(--accent,#7b5cff);font-size:13px;font-weight:600;text-align:center;cursor:pointer;font-family:inherit;transition:transform .15s,filter .15s;}' +
      '.nm-search-btn:hover{transform:translateY(-2px);filter:brightness(1.12);}' +
      '.nm-search-fab{position:fixed;right:18px;bottom:18px;z-index:9998;width:auto;padding:12px 18px;border:1px solid var(--accent,#7b5cff);border-radius:999px;background:var(--bg-card,#181426);color:var(--accent,#7b5cff);font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 8px 28px rgba(0,0,0,.28);transition:transform .15s,filter .15s;}' +
      '.nm-search-fab:hover{transform:translateY(-2px);filter:brightness(1.08);}' +
      '.nm-search-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:flex-start;justify-content:center;z-index:10000;opacity:0;pointer-events:none;transition:opacity .18s;padding:10vh 16px 16px;}' +
      '.nm-search-ov.open{opacity:1;pointer-events:auto;}' +
      '.nm-search-box{width:min(94vw,560px);max-height:78vh;display:flex;flex-direction:column;background:var(--bg-card,#181426);color:var(--text,#f0e8f7);border:1px solid var(--border,rgba(255,255,255,.14));border-radius:16px;box-shadow:0 24px 70px rgba(0,0,0,.5);overflow:hidden;transform:translateY(-12px);transition:transform .18s;font-family:inherit;}' +
      '.nm-search-ov.open .nm-search-box{transform:none;}' +
      '.nm-search-head{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid var(--border,rgba(255,255,255,.12));}' +
      '.nm-search-head input{flex:1;background:none;border:none;outline:none;color:var(--text,#f0e8f7);font-size:1.05em;font-family:inherit;}' +
      '.nm-search-head input::placeholder{color:var(--text-mute,#7a6692);}' +
      '.nm-search-count{font-size:.78em;color:var(--text-mute,#7a6692);white-space:nowrap;}' +
      '.nm-search-list{list-style:none;margin:0;padding:6px;overflow-y:auto;}' +
      '.nm-search-item{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:10px;cursor:pointer;text-decoration:none;color:inherit;}' +
      '.nm-search-item:hover,.nm-search-item.sel{background:var(--accent-glow,rgba(123,92,255,.14));}' +
      '.nm-search-dot{width:10px;height:10px;border-radius:50%;flex:none;}' +
      '.nm-search-meta{min-width:0;}' +
      '.nm-search-name{font-weight:700;font-size:.98em;}' +
      '.nm-search-name small{font-weight:500;color:var(--text-mute,#7a6692);margin-left:6px;}' +
      '.nm-search-desc{font-size:.8em;color:var(--text-dim,#b09bc8);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.nm-search-cat{margin-left:auto;font-size:.72em;color:var(--text-mute,#7a6692);border:1px solid var(--border,rgba(255,255,255,.18));border-radius:999px;padding:2px 9px;flex:none;}' +
      '.nm-search-empty{padding:28px;text-align:center;color:var(--text-mute,#7a6692);font-size:.9em;}' +
      '.nm-search-foot{padding:9px 16px;border-top:1px solid var(--border,rgba(255,255,255,.1));font-size:.74em;color:var(--text-mute,#7a6692);text-align:center;}';
    var s = document.createElement('style');
    s.id = 'nm-search-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  var ov, input, listEl, countEl, results = [], sel = 0, prefix = '';

  function buildOverlay() {
    if (ov) return;
    prefix = basePrefix();
    ov = document.createElement('div');
    ov.className = 'nm-search-ov';
    ov.innerHTML =
      '<div class="nm-search-box" role="dialog" aria-modal="true" aria-label="' + t('title') + '">' +
        '<div class="nm-search-head">' +
          '<span aria-hidden="true">🔍</span>' +
          '<input type="text" autocomplete="off" spellcheck="false" placeholder="' + t('ph') + '" aria-label="' + t('title') + '">' +
          '<span class="nm-search-count"></span>' +
        '</div>' +
        '<ul class="nm-search-list"></ul>' +
        '<div class="nm-search-foot">' + t('hint') + '</div>' +
      '</div>';
    document.body.appendChild(ov);
    input = ov.querySelector('input');
    listEl = ov.querySelector('.nm-search-list');
    countEl = ov.querySelector('.nm-search-count');

    input.addEventListener('input', render);
    input.addEventListener('keydown', onKey);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
  }

  function render() {
    results = search(input.value);
    sel = 0;
    countEl.textContent = results.length;
    if (!results.length) {
      listEl.innerHTML = '<li class="nm-search-empty">' + t('none') + '</li>';
      return;
    }
    listEl.innerHTML = results.map(function (s, i) {
      return '<a class="nm-search-item' + (i === 0 ? ' sel' : '') + '" href="' + prefix + s.u + '" data-i="' + i + '">' +
        '<span class="nm-search-dot" style="background:' + s.a + '"></span>' +
        '<span class="nm-search-meta">' +
          '<div class="nm-search-name">' + esc(s.n) + '<small>' + esc(s.e) + '</small></div>' +
          '<div class="nm-search-desc">' + esc(s.d) + '</div>' +
        '</span>' +
        '<span class="nm-search-cat">' + esc(s.c) + '</span>' +
      '</a>';
    }).join('');
  }

  function esc(str) {
    return String(str).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function highlight() {
    var items = listEl.querySelectorAll('.nm-search-item');
    items.forEach(function (el, i) { el.classList.toggle('sel', i === sel); });
    var cur = items[sel];
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (results.length) { sel = (sel + 1) % results.length; highlight(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (results.length) { sel = (sel - 1 + results.length) % results.length; highlight(); } }
    else if (e.key === 'Enter') { e.preventDefault(); go(); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  }

  function go() {
    if (!results.length) return;
    location.href = prefix + results[sel].u;
  }

  function open() {
    buildOverlay();
    ov.classList.add('open');
    input.value = '';
    render();
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() { if (ov) ov.classList.remove('open'); }

  // === 진입점 버튼 ===
  function addButton() {
    if (document.querySelector('.nm-search-btn') || document.querySelector('.nm-search-fab')) return;
    var sidebar = document.querySelector('.study-controls-sidebar') ||
                  document.querySelector('.layout > aside, .container > aside, aside.sidebar');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = t('btn');
    btn.addEventListener('click', open);
    if (sidebar) {
      btn.className = 'nm-search-btn';
      // 학습 설정 사이드바라면 제목 바로 아래(맨 위)에 두어 눈에 잘 띄게
      var titleEl = sidebar.querySelector('.study-controls-title');
      if (titleEl && titleEl.nextSibling) sidebar.insertBefore(btn, titleEl.nextSibling);
      else sidebar.appendChild(btn);
    } else {
      btn.className = 'nm-search-fab';
      document.body.appendChild(btn);
    }
  }

  // === 전역 단축키 ===
  function globalKeys(e) {
    var openCombo = (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey);
    var slash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey &&
                !/^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || '')) && !e.target.isContentEditable;
    if (openCombo || slash) { e.preventDefault(); open(); }
  }

  function init() {
    injectCSS();
    // i18n/difficulty 가 사이드바를 만들 시간을 약간 준다(둘 다 DOMContentLoaded 에서 생성).
    addButton();
    setTimeout(addButton, 120);
    document.addEventListener('keydown', globalKeys);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  if (typeof module !== 'undefined' && module.exports) { module.exports = { SUBJECTS: SUBJECTS, search: search, basePrefix: basePrefix }; }
})();
