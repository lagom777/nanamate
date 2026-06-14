/* ============================================================
   nanamate · 다국어 토글 (한/영/일/중)
   페이지 전체에 [data-i18n="key"] 속성으로 다국어 지원
   기본은 한국어. 토글 클릭 시 번역 사전을 적용하거나
   Google Translate를 fallback으로 사용.
   ============================================================ */

(function() {
  'use strict';

  const LANGS = {
    ko: { label: '한', name: '한국어' },
    en: { label: 'EN', name: 'English' },
    ja: { label: '日', name: '日本語' },
    zh: { label: '中', name: '中文' }
  };

  const STORAGE_KEY = 'nanamate-lang';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'ko';

  function ensureControlsSidebar() {
    const existingSidebar = document.querySelector('.layout > aside, .container > aside, aside.sidebar, body > aside:not(.study-controls-sidebar)');
    if (existingSidebar) return existingSidebar;

    let controlsSidebar = document.querySelector('.study-controls-sidebar');
    if (controlsSidebar) return controlsSidebar;

    controlsSidebar = document.createElement('aside');
    controlsSidebar.className = 'study-controls-sidebar';
    controlsSidebar.setAttribute('aria-label', '학습 설정');
    controlsSidebar.innerHTML = '<div class="study-controls-title">학습 설정</div>';
    document.body.prepend(controlsSidebar);
    document.body.classList.add('has-study-controls-sidebar');
    return controlsSidebar;
  }

  // === 언어 토글 UI 삽입 ===
  function injectToggle() {
    if (document.querySelector('.lang-toggle')) return;
    const toggle = document.createElement('div');
    toggle.className = 'lang-toggle';
    toggle.innerHTML =
      '<div class="toggle-label">🌐 언어</div>' +
      Object.entries(LANGS).map(([code, info]) =>
        `<button data-lang="${code}" title="${info.name}">${info.label}</button>`
      ).join('');

    const sidebar = ensureControlsSidebar();
    toggle.classList.add('in-sidebar');
    sidebar.appendChild(toggle);

    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-lang]');
      if (!btn) return;
      const lang = btn.dataset.lang;
      setLanguage(lang);
    });

    updateToggleUI();
  }

  function updateToggleUI() {
    document.querySelectorAll('.lang-toggle button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  // === 언어 적용 ===
  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    updateToggleUI();
    applyTranslations();

    // Google Translate fallback - 페이지에 사전이 부족하면 자동 번역
    if (lang !== 'ko' && !window.__nanamateTranslated) {
      activateGoogleTranslate(lang);
    } else if (lang === 'ko') {
      deactivateGoogleTranslate();
    }
  }

  function applyTranslations() {
    const dict = window.NANAMATE_I18N || {};
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const translations = dict[key];
      if (translations && translations[currentLang]) {
        el.textContent = translations[currentLang];
      }
    });
    document.documentElement.lang = currentLang;
  }

  // === Google Translate 통합 (사전 없는 콘텐츠 자동 번역) ===
  function activateGoogleTranslate(lang) {
    if (!document.getElementById('google-translate-element')) {
      const div = document.createElement('div');
      div.id = 'google-translate-element';
      div.style.cssText = 'position:fixed;left:-9999px;visibility:hidden;';
      document.body.appendChild(div);
    }

    if (!window.googleTranslateLoaded) {
      window.googleTranslateElementInit = function() {
        new google.translate.TranslateElement({
          pageLanguage: 'ko',
          includedLanguages: 'en,ja,zh-CN',
          autoDisplay: false
        }, 'google-translate-element');
        // 약간의 딜레이 후 트리거
        setTimeout(() => triggerGoogleTranslate(lang), 800);
      };
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
      window.googleTranslateLoaded = true;
    } else {
      triggerGoogleTranslate(lang);
    }
  }

  function triggerGoogleTranslate(lang) {
    const map = { en: 'en', ja: 'ja', zh: 'zh-CN' };
    const target = map[lang];
    if (!target) return;
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = target;
      select.dispatchEvent(new Event('change'));
    } else {
      setTimeout(() => triggerGoogleTranslate(lang), 500);
    }
  }

  function deactivateGoogleTranslate() {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = '';
      select.dispatchEvent(new Event('change'));
    }
    // 페이지 reload (가장 확실한 방법)
    if (document.documentElement.classList.contains('translated-ltr') ||
        document.documentElement.classList.contains('translated-rtl')) {
      location.reload();
    }
  }

  // === 초기화 ===
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectToggle();
      if (currentLang !== 'ko') setLanguage(currentLang);
    });
  } else {
    injectToggle();
    if (currentLang !== 'ko') setLanguage(currentLang);
  }
})();
