/* ============================================================
   nanamate · 후원하기 위젯 (왼쪽 사이드바 하단)
   버튼 클릭 → 모달(선택적 광고 영역 + Buy Me a Coffee 링크)
   ------------------------------------------------------------
   ▼▼▼ 설정: 아래 두 줄만 바꾸면 됩니다 ▼▼▼
   ============================================================ */
(function () {
  'use strict';

  // 1) Buy Me a Coffee 사용자명으로 교체하세요 (예: 'kglagom')
  const BMC_USERNAME = 'YOUR_USERNAME';
  // 2) 광고 영역 표시 여부. true 로 바꾸고 아래 AD_HTML 에 AdSense 코드를 넣으면 노출됩니다.
  const SHOW_AD = false;
  // 3) (선택) 광고 HTML — AdSense <ins> 스니펫 등을 문자열로 넣으세요.
  const AD_HTML = '<div class="nm-ad-slot">광고 영역 (AdSense 코드를 여기에 삽입)</div>';

  // ============================================================
  const BMC_URL = (BMC_USERNAME && BMC_USERNAME !== 'YOUR_USERNAME')
    ? 'https://www.buymeacoffee.com/' + BMC_USERNAME
    : 'https://www.buymeacoffee.com/';

  function injectCSS() {
    if (document.getElementById('nm-support-style')) return;
    const css =
      '.nm-support-btn{display:block;width:100%;margin-top:18px;padding:11px 14px;border:1px solid var(--accent,#e0a82e);border-radius:10px;background:var(--accent-glow,rgba(224,168,46,0.12));color:var(--accent,#e0a82e);font-size:13px;font-weight:600;text-align:center;cursor:pointer;font-family:inherit;transition:transform .15s,filter .15s;}' +
      '.nm-support-btn:hover{transform:translateY(-2px);filter:brightness(1.12);}' +
      '.nm-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;pointer-events:none;transition:opacity .2s;}' +
      '.nm-modal-overlay.open{opacity:1;pointer-events:auto;}' +
      '.nm-modal{position:relative;width:min(92vw,400px);background:var(--bg-card,#181426);color:var(--text,#f0e8f7);border:1px solid var(--border,rgba(255,255,255,.14));border-radius:16px;padding:26px;box-shadow:0 20px 60px rgba(0,0,0,.5);transform:translateY(12px);transition:transform .2s;font-family:inherit;}' +
      '.nm-modal-overlay.open .nm-modal{transform:none;}' +
      '.nm-modal h3{margin:0 0 8px;font-size:1.3em;color:var(--accent,#e0a82e);font-weight:700;}' +
      '.nm-modal p{margin:0 0 16px;font-size:.9em;color:var(--text-dim,#b09bc8);line-height:1.65;}' +
      '.nm-ad-slot{margin:0 0 16px;min-height:90px;border:1px dashed var(--border,rgba(255,255,255,.25));border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--text-mute,#7a6692);font-size:.8em;text-align:center;padding:10px;}' +
      '.nm-bmc{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:13px;border-radius:10px;background:#ffdd00;color:#000;font-weight:700;text-decoration:none;font-size:1em;box-sizing:border-box;}' +
      '.nm-bmc:hover{filter:brightness(.96);}' +
      '.nm-x{display:block;width:100%;margin-top:12px;background:none;border:none;color:var(--text-mute,#7a6692);font-size:.82em;cursor:pointer;font-family:inherit;}' +
      '.nm-x:hover{color:var(--text-dim,#b09bc8);}';
    const s = document.createElement('style');
    s.id = 'nm-support-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildModal() {
    if (document.getElementById('nm-support-modal')) return;
    const ov = document.createElement('div');
    ov.className = 'nm-modal-overlay';
    ov.id = 'nm-support-modal';
    ov.innerHTML =
      '<div class="nm-modal" role="dialog" aria-modal="true" aria-label="후원하기">' +
        '<h3>☕ 후원하기</h3>' +
        '<p>nanamate는 무료 학습 사이트입니다. 도움이 되셨다면 커피 한 잔으로 응원해 주세요. 보내주신 마음은 서버 운영과 새 강의 제작에 쓰입니다.</p>' +
        (SHOW_AD ? AD_HTML : '') +
        '<a class="nm-bmc" href="' + BMC_URL + '" target="_blank" rel="noopener noreferrer">☕ Buy me a coffee</a>' +
        '<button class="nm-x" type="button">닫기</button>' +
      '</div>';
    document.body.appendChild(ov);
    const close = () => ov.classList.remove('open');
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    ov.querySelector('.nm-x').addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  function openModal() {
    buildModal();
    document.getElementById('nm-support-modal').classList.add('open');
  }

  function addButton() {
    if (document.querySelector('.nm-support-btn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nm-support-btn';
    btn.textContent = '☕ 후원하기';
    btn.addEventListener('click', openModal);
    const sidebar = document.querySelector('.layout > aside');
    if (sidebar) {
      sidebar.appendChild(btn); // 왼쪽 사이드바 하단
    } else {
      // 사이드바가 없는 페이지(허브 등): 좌측 하단 고정 버튼
      btn.style.cssText += 'position:fixed;left:18px;bottom:18px;width:auto;z-index:9998;';
      document.body.appendChild(btn);
    }
  }

  function init() { injectCSS(); addButton(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
