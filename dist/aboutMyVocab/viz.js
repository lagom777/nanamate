/* 단어 한 장 해설 재생기 — 장면(SVG)은 viz/<단어>.svg, 만드는 법은 scripts/viz/GUIDE.md.
   장면 안 data-s="n" 요소는 n단계부터, data-e="m"이 있으면 m단계까지 보인다. 단계 길이는 장면 루트의 data-t(초).
   등장: .vs(+ up pop wipe wipe-d draw)  이동: .mv  반복 움직임: .a-fall .a-drip .a-rise .a-dash .a-bob .a-flap .a-pulse .a-slide .a-flow .a-flip .a-press */
(function () {
  const VIZ = (window.VIZ = window.VIZ || {});   // 장면은 viz/<단어>.svg 에서 불러와 채워진다 (index.html의 ensureViz)

  /* 다크 테마에서는 밝은 장면이 튀지 않게 살짝 어둡게 덮는다(filter는 움직일 때마다 다시 그려야 해서 덮개로) */
  const DIM = 'content: ""; position: absolute; inset: 0; background: #0e131a; opacity: .14; pointer-events: none;';
  const css = document.createElement("style");
  css.textContent = `.vz-scene { position: relative; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .vz-scene::after { ${DIM} } }
:root[data-theme="dark"] .vz-scene::after { ${DIM} }`;
  document.head.append(css);

  /* 장면 안에서 가장 늦게 끝나는 등장·이동의 지연+길이(배율 적용 전 초) */
  function span(scene) {
    let max = 0.8;
    for (const m of scene.matchAll(/<[a-z]+[^>]*\bclass="([^"]*)"[^>]*>/g)) {
      const cls = ` ${m[1]} `, tag = m[0];
      if (!/ (vs|mv) /.test(cls)) continue;
      const dl = +((tag.match(/--dl:\s*([\d.]+)s/) || [])[1] || 0), d = tag.match(/--d:\s*([\d.]+)s/);
      const len = / mv /.test(cls) ? (d ? +d[1] : 1.6) : / (wipe|wipe-d|draw) /.test(cls) ? (d ? +d[1] : 1.4) : 0.8;
      max = Math.max(max, dl + len);
    }
    return max;
  }
  /* --k = 등장·이동 시간 배율: 단계가 짧아도 툭 튀지 않게 넉넉히 주되, 단계가 끝나기 전에 움직임이 멈추도록 */
  function pace(v) {
    if (v.k == null) v.k = Math.max(0.2, Math.min(1, v.t / 2, (0.85 * v.t) / span(v.scene))).toFixed(2);
    return v.k;
  }

  /* 카드 옆 패널 HTML: 장면 + 영단어. 재생 버튼은 두지 않는다 — 재생·정지는 아래 큰 재생 버튼 하나로, 장면을 누르면 처음부터 다시 */
  window.vizHtml = function (word) {
    const v = VIZ[word.toLowerCase()];
    if (!v || !v.pic) return null;
    return `<div class="vz pic" data-state="idle" style="--vz:${v.color};--t:${v.t}s;--k:${pace(v)}">
<div class="vz-scene" role="button" tabindex="0" aria-label="그림 해설 처음부터 다시 보기" title="누르면 처음부터 다시">${v.scene}</div>
<div class="vz-ctl"><div class="vz-word"><b>${word.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))}</b></div>
<div class="vz-segs" aria-hidden="true">${Array.from({ length: v.n }, (_, i) => `<span class="vz-seg" data-k="${i + 1}"><b><i></i></b></span>`).join("")}</div></div></div>`;
  };

  /* 재생기: 단계 막대의 채움 애니메이션이 끝나면 다음 단계로 — 일시정지하면 애니메이션째 멈춘다 */
  window.vizMount = function (root, autoplay) {
    const scene = root.querySelector(".vz-scene");
    const parts = [...scene.querySelectorAll("[data-s]")];
    const segs = [...root.querySelectorAll(".vz-seg")];
    const n = segs.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let step = 0;
    const set = (st) => { root.dataset.state = st; };
    function show(k, instant) {
      if (instant) scene.classList.add("vz-reset");
      parts.forEach((el) => {
        const s = +el.dataset.s, e = el.dataset.e ? +el.dataset.e : n;
        el.classList.toggle("in", k >= s && k <= e);
      });
      if (instant) { void scene.offsetWidth; scene.classList.remove("vz-reset"); }
    }
    function go(k, instant) {
      step = k;
      show(k, instant);
      segs.forEach((s, i) => { s.classList.toggle("done", i + 1 < k); s.classList.remove("run"); });
      if (k >= 1) { const s = segs[k - 1]; void s.offsetWidth; s.classList.add("run"); }
    }
    function end() {
      set("end");
      root.dispatchEvent(new CustomEvent("vzend"));
      segs.forEach((s) => { s.classList.remove("run"); s.classList.add("done"); });
    }
    function play() { set("run"); go(0, true); go(1); }
    /* 단계 길이는 보이지 않는 막대(.vz-seg i)의 채움 애니메이션으로 잰다 */
    root.addEventListener("animationend", (e) => {
      if (root.dataset.state !== "run" || !e.target.matches(".vz-seg.run i")) return;
      if (step < n) go(step + 1); else end();
    });
    /* 장면을 누르면 처음부터 다시(움직임 줄이기 설정이면 한 단계씩 넘긴다) */
    function again() {
      if (!reduce) { play(); return; }
      const k = step < n && root.dataset.state !== "end" ? step + 1 : 1;
      go(k, true);
      if (k === n) end(); else set("step");
    }
    scene.addEventListener("click", again);
    scene.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); again(); }
    });
    if (reduce) { go(n, true); end(); }
    else if (autoplay) play();
    else { set("idle"); go(0, true); }
    return {
      reveal() { if (root.dataset.state === "idle") play(); },
      replay() { if (root.dataset.state === "end" && !reduce) play(); },   // 다 본 장면을 낭독과 함께 처음부터
    };
  };
})();
