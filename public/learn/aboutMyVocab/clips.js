/* 뜻 영상. viz.js의 그림 해설과 따로 둔다.
   카드는 그림 해설이 있으면 그것도 그대로 보여 주고, 여기 주소가 있는 단어는 그 위에 영상을 한 번 재생하고 마지막 장면에서 멈춘다.
   새 영상은 CLIPS에 한 줄만 추가하면 된다. */
(function () {
  const CLIPS = (window.CLIPS = {
    glacier: 'https://pub-920d78ae5be2443d84da6b3e8a54a5af.r2.dev/vocab/glacier.mp4?v=2',
    pollination: 'https://pub-920d78ae5be2443d84da6b3e8a54a5af.r2.dev/vocab/pollination.mp4?v=2',
    sediment: 'https://pub-920d78ae5be2443d84da6b3e8a54a5af.r2.dev/vocab/sediment.mp4?v=2',
    erosion: 'https://pub-920d78ae5be2443d84da6b3e8a54a5af.r2.dev/vocab/erosion.mp4?v=2',
    refraction: 'https://pub-920d78ae5be2443d84da6b3e8a54a5af.r2.dev/vocab/refraction.mp4?v=2',
    dissolve: 'https://pub-920d78ae5be2443d84da6b3e8a54a5af.r2.dev/vocab/dissolve.mp4?v=2',
  });

  const style = document.createElement('style');
  style.textContent = [
    '.clip{background:var(--card);border-radius:14px;overflow:hidden;box-shadow:var(--shadow);line-height:0}',
    '.clip[hidden]{display:none}',
    '.clip video{display:block;width:100%;height:auto;aspect-ratio:1;object-fit:cover;background:#111;cursor:pointer}',
    '@media (min-width:880px){.side.has-clip .list{max-height:340px}}',
  ].join('');
  document.head.appendChild(style);

  const el = document.createElement('aside');
  el.className = 'clip';
  el.hidden = true;
  el.setAttribute('aria-label', '뜻 영상');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let word = '', hidden = true;

  window.clipPlace = function (slot) {
    if (slot && el.parentNode !== slot) slot.insertBefore(el, slot.firstChild);
  };

  function video() { return el.querySelector('video'); }

  window.clipShow = function (name, hide, enabled) {
    const src = enabled && CLIPS[String(name).toLowerCase()];
    const side = document.getElementById('side');
    if (!src) {
      el.hidden = true;
      el.innerHTML = '';
      word = '';
      hidden = true;
      if (side) side.classList.remove('has-clip');
      return;
    }
    if (side) side.classList.add('has-clip');
    const changed = word !== name;
    if (changed) {
      el.innerHTML = '<video muted playsinline preload="auto"></video>';
      const v = video();
      v.poster = src.replace('.mp4', '.jpg');
      v.src = src;
      v.addEventListener('error', () => { el.hidden = true; });
      v.addEventListener('click', () => {
        v.currentTime = 0;
        v.play().catch(() => {});
      });
      word = name;
    }
    const showNow = !hide;
    const became = hidden && showNow;
    hidden = hide;
    el.hidden = hide;
    const v = video();
    if (!v) return;
    if (hide) { v.pause(); return; }
    if ((changed || became) && !reduce) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };
})();
