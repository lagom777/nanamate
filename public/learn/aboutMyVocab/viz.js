/* 단어 한 장 해설 재생기 — 장면(SVG)은 viz/<단어>.svg, 만드는 법은 scripts/viz/GUIDE.md.
   장면 안 data-s="n" 요소는 n단계부터, data-e="m"이 있으면 m단계까지 보인다. 단계 길이는 장면 루트의 data-t(초).
   등장: .vs(+ up pop wipe wipe-d draw)  이동: .mv  반복 움직임: .a-fall .a-drip .a-rise .a-dash .a-bob .a-flap .a-pulse .a-slide .a-flow .a-flip .a-press */
(function () {
  const VIZ = (window.VIZ = window.VIZ || {});   // 장면은 viz/<단어>.svg 에서 불러와 채워진다 (index.html의 ensureViz)

  /* 카드 옆 패널 HTML */
  const ICON = `<svg class="ic-play" viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg><svg class="ic-pause" viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg><svg class="ic-again" viewBox="0 0 24 24"><path d="M12 5a7 7 0 1 1-6.6 4.7l1.9.6A5 5 0 1 0 12 7v3L7.5 6 12 2z"/></svg>`;
  window.vizHtml = function (word) {
    const v = VIZ[word.toLowerCase()];
    if (!v || !v.pic) return null;
    return `<div class="vz pic" data-state="idle" style="--vz:${v.color};--t:${v.t}s;--k:${Math.max(0.2, v.t / 4)}">
<div class="vz-scene">${v.scene}</div>
<div class="vz-ctl"><button class="vz-play" type="button" aria-label="해설 재생">${ICON}</button>
<div class="vz-segs">${Array.from({ length: v.n }, (_, i) => `<button class="vz-seg" type="button" data-k="${i + 1}" aria-label="${i + 1}단계 보기"><b><i></i></b></button>`).join("")}</div></div></div>`;
  };

  /* 재생기: 단계 막대의 채움 애니메이션이 끝나면 다음 단계로 — 일시정지하면 애니메이션째 멈춘다 */
  window.vizMount = function (root, autoplay) {
    const scene = root.querySelector(".vz-scene");
    const parts = [...scene.querySelectorAll("[data-s]")];
    const segs = [...root.querySelectorAll(".vz-seg")];
    const lis = [...root.querySelectorAll(".vz-steps li")];
    const btn = root.querySelector(".vz-play");
    const time = root.querySelector(".vz-time");
    const n = segs.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let step = 0;
    const LABEL = { idle: "해설 재생", run: "해설 일시정지", pause: "해설 이어서 재생", end: "해설 다시 보기" };
    const set = (st) => { root.dataset.state = st; btn.setAttribute("aria-label", LABEL[st]); };
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
      lis.forEach((li, i) => li.classList.toggle("on", i + 1 === k));
      if (time) time.textContent = `${k} / ${n}`;
    }
    function end() {
      set("end");
      root.dispatchEvent(new CustomEvent("vzend"));
      segs.forEach((s) => { s.classList.remove("run"); s.classList.add("done"); });
      lis.forEach((li) => li.classList.remove("on"));
    }
    function play() { set("run"); go(0, true); go(1); }
    function jump(k) {
      if (reduce) { go(k); set("pause"); return; }
      set("run"); go(k);
    }
    root.addEventListener("animationend", (e) => {
      if (root.dataset.state !== "run" || !e.target.matches(".vz-seg.run i")) return;
      if (step < n) go(step + 1); else end();
    });
    btn.addEventListener("click", () => {
      const st = root.dataset.state;
      if (reduce) { jump(step < n && st !== "end" ? step + 1 : 1); return; }
      if (st === "run") set("pause");
      else if (st === "pause") set("run");
      else play();
    });
    root.addEventListener("click", (e) => {
      const t = e.target.closest(".vz-seg, .vz-steps li");
      if (t) jump(+t.dataset.k);
    });
    if (reduce) { go(n, true); end(); }
    else if (autoplay) play();
    else { set("idle"); go(0, true); }
    return { reveal() { if (root.dataset.state === "idle") play(); } };
  };
})();
