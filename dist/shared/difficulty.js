/* ============================================================
   nanamate · 난이도 탭 (쉬움 / 고급 2단계)
   .difficulty-tabs 와 .difficulty-content 요소 자동 바인딩
   ============================================================ */

(function() {
  'use strict';

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

  function init() {
    const sidebar = ensureControlsSidebar();
    document.querySelectorAll('.difficulty-tabs').forEach(tabs => {
      if (sidebar && !tabs.classList.contains('in-sidebar') && tabs.dataset.sidebarBound !== 'true') {
        tabs.dataset.sidebarBound = 'true';
        const wrap = document.createElement('div');
        wrap.className = 'sidebar-difficulty';
        wrap.innerHTML = '<div class="toggle-label">📊 난이도</div>';
        // 원본 위치에 placeholder를 두고 그 콘텐츠를 사이드바에 동일 인스턴스로 옮긴다.
        // 다만 컨텐츠 매칭은 tabs.parentElement 기준이라 옮기면 안 된다.
        // 대신 사이드바에는 동일 버튼들을 가진 미러를 만들고, 클릭시 원래 탭을 트리거.
        const mirror = tabs.cloneNode(true);
        mirror.classList.add('in-sidebar');
        wrap.appendChild(mirror);
        sidebar.appendChild(wrap);

        // 원래 탭은 화면에서 숨기지만 콘텐츠 매칭 로직은 그대로 둠
        tabs.style.display = 'none';

        // 미러 버튼 클릭 → 원래 버튼 클릭으로 위임
        mirror.querySelectorAll('.difficulty-tab').forEach((mBtn) => {
          mBtn.addEventListener('click', () => {
            const target = mBtn.dataset.target;
            const origBtn = tabs.querySelector(`.difficulty-tab[data-target="${target}"]`);
            if (origBtn) origBtn.click();
            mirror.querySelectorAll('.difficulty-tab').forEach(b => b.classList.remove('active'));
            mBtn.classList.add('active');
          });
        });
      }

      const buttons = tabs.querySelectorAll('.difficulty-tab');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.target;
          const container = tabs.parentElement;

          // 모든 탭 비활성화
          tabs.querySelectorAll('.difficulty-tab').forEach(b => b.classList.remove('active'));
          container.querySelectorAll('.difficulty-content').forEach(c => c.classList.remove('active'));

          // 선택된 탭 활성화
          btn.classList.add('active');
          const content = container.querySelector(`.difficulty-content[data-level="${target}"]`);
          if (content) content.classList.add('active');
        });
      });

      // 첫 번째 탭(쉬움)을 기본 활성화 + 사이드바 미러 동기화
      if (buttons.length > 0 && !tabs.querySelector('.difficulty-tab.active')) {
        buttons[0].click();
        const firstTarget = buttons[0].dataset.target;
        const mirrorBtn = sidebar && sidebar.querySelector(`.difficulty-tabs.in-sidebar .difficulty-tab[data-target="${firstTarget}"]`);
        if (mirrorBtn) mirrorBtn.classList.add('active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
