(function() {
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

  // Inject toggle button
  const toggle = document.createElement('div');
  toggle.className = 'mode-toggle in-sidebar';
  toggle.innerHTML =
    '<div class="toggle-label">🧭 보기 방식</div>' +
    '<button data-mode="easy">🧒 쉬운 버전</button>' +
    '<button data-mode="paper">📄 논문 버전</button>';
  ensureControlsSidebar().appendChild(toggle);

  // Restore saved mode (default: easy)
  const saved = localStorage.getItem('aboutdb-mode') || 'easy';
  document.body.classList.add('mode-' + saved);

  // Wire up clicks
  toggle.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      document.body.classList.remove('mode-easy', 'mode-paper');
      document.body.classList.add('mode-' + mode);
      localStorage.setItem('aboutdb-mode', mode);
      // Re-render MathJax if switching into paper mode (equations may have been hidden)
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise();
      }
    });
  });
})();
