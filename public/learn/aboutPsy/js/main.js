// ===== 챕터 순서 정의 (한 곳에서 관리) =====
const CHAPTER_ORDER = [
  'index.html',
  'ch01.html', 'ch02.html', 'ch03.html', 'ch04.html', 'ch05.html',
  'ch06.html', 'ch07.html', 'ch08.html', 'ch09.html', 'ch10.html',
  'quiz.html'
];

// ===== 테마 =====
(function initTheme() {
  const saved = localStorage.getItem('psy-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('psy-theme', next);
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  btn.textContent = current === 'dark' ? '라이트 모드 전환' : '다크 모드 전환';
}

// ===== 사이드바 활성 링크 =====
function getCurrentPage() {
  return location.pathname.split('/').pop() || 'index.html';
}

function highlightActiveLink() {
  const path = getCurrentPage();
  document.querySelectorAll('aside nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });
}

// ===== 퀴즈 =====
function mark(btn, isCorrect) {
  const parent = btn.parentElement;
  parent.querySelectorAll('button').forEach(b => {
    b.disabled = true;
    b.style.cursor = 'default';
  });
  btn.classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) {
    parent.querySelectorAll('button').forEach(b => {
      const onclickAttr = b.getAttribute('onclick') || '';
      if (onclickAttr.includes('true')) b.classList.add('correct');
    });
  }
}

// ===== 모바일 사이드바 토글 =====
function injectSidebarToggle() {
  const aside = document.querySelector('aside');
  if (!aside) return;

  const toggle = document.createElement('button');
  toggle.id = 'sidebar-toggle';
  toggle.setAttribute('aria-label', '메뉴 열기/닫기');
  toggle.innerHTML = '☰';
  document.body.appendChild(toggle);

  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  document.body.appendChild(backdrop);

  const close = () => {
    aside.classList.remove('open');
    backdrop.classList.remove('open');
  };

  toggle.addEventListener('click', () => {
    const open = aside.classList.toggle('open');
    backdrop.classList.toggle('open', open);
  });

  backdrop.addEventListener('click', close);

  aside.querySelectorAll('nav a').forEach(a => {
    a.addEventListener('click', close);
  });
}

// ===== 진행률 표시 =====
function injectProgressBar() {
  const page = getCurrentPage();
  const idx = CHAPTER_ORDER.indexOf(page);
  if (idx <= 0) return; // index나 목록에 없는 페이지는 생략

  const total = CHAPTER_ORDER.length - 1; // index 제외
  const percent = Math.round((idx / total) * 100);

  const main = document.querySelector('main');
  const pageNav = main && main.querySelector('.page-nav');
  if (!main || !pageNav) return;

  const label = document.createElement('div');
  label.className = 'progress-label';
  label.textContent = `진행률  ${idx} / ${total}  ·  ${percent}%`;

  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  const fill = document.createElement('div');
  fill.className = 'fill';
  fill.style.width = percent + '%';
  bar.appendChild(fill);

  pageNav.after(label, bar);
}

// ===== 키보드 이전/다음 탐색 =====
function initKeyboardNav() {
  const page = getCurrentPage();
  const idx = CHAPTER_ORDER.indexOf(page);
  if (idx < 0) return;

  document.addEventListener('keydown', (e) => {
    // 입력 요소에 포커스가 있으면 무시
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    if (e.key === 'ArrowLeft' && idx > 0) {
      location.href = CHAPTER_ORDER[idx - 1];
    } else if (e.key === 'ArrowRight' && idx < CHAPTER_ORDER.length - 1) {
      location.href = CHAPTER_ORDER[idx + 1];
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateThemeButton();
  highlightActiveLink();
  injectSidebarToggle();
  injectProgressBar();
  initKeyboardNav();
});
