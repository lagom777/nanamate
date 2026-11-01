// 모션 노트 점검: motion.html 의 장면 draw()를 가짜 캔버스로 여러 시각에 돌려
// 오류 · 빠진 칸 · 캔버스 밖으로 나간 글자 · (--overlap) 정지 화면에서 겹친 글자를 찾는다. 물리·생명·국어·수학·영어 모션 노트용.
// node scripts/suneung/motion-smoke.mjs public/learn/aboutSuneungMath/motion.html [--overlap]
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

/* 글자 폭 어림: 한글·한자 1em, 영문 소문자 .52em, 대문자·숫자 .6em, 빈칸 .3em, 그 밖의 기호 .7em */
const charW = (ch) => {
  const c = ch.codePointAt(0);
  if ((c >= 0xac00 && c <= 0xd7a3) || (c >= 0x3130 && c <= 0x318f) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef)) return 1;
  if (ch === " ") return 0.3;
  if (/[a-z]/.test(ch)) return 0.52;
  if (/[A-Z0-9]/.test(ch)) return 0.6;
  if (/[.,:;'!|()[\]]/.test(ch)) return 0.3;
  return 0.7;
};
const textW = (s, size) => [...String(s)].reduce((w, ch) => w + charW(ch), 0) * size;
const sizeOf = (font) => +((/([\d.]+)px/.exec(font) || [])[1] || 10);

const METHODS = "beginPath closePath moveTo lineTo arc arcTo ellipse rect roundRect fill stroke clip quadraticCurveTo bezierCurveTo setLineDash fillRect strokeRect clearRect drawImage putImageData drawFocusIfNeeded scrollPathIntoView reset".split(" ");
function makeCtx() {
  const texts = [];
  let st = { font: "500 18px sans-serif", textAlign: "left", textBaseline: "alphabetic", globalAlpha: 1, tf: [1, 0, 0, 1, 0, 0], rot: false };
  const stack = [];
  const own = {
    save() { stack.push({ ...st, tf: st.tf.slice() }); },
    restore() { if (stack.length) st = stack.pop(); },
    translate(x, y) { const t = st.tf; t[4] += t[0] * x + t[2] * y; t[5] += t[1] * x + t[3] * y; },
    scale(a, b) { const t = st.tf; t[0] *= a; t[1] *= a; t[2] *= b; t[3] *= b; },
    rotate(a) { if (Math.abs(a % (Math.PI * 2)) > 1e-6) st.rot = true; },
    transform() { st.rot = true; },
    setTransform(a, b, c, d, e, f) { st.tf = [a, b, c, d, e, f]; st.rot = !!(b || c); },
    resetTransform() { st.tf = [1, 0, 0, 1, 0, 0]; st.rot = false; },
    getTransform() { const [a, b, c, d, e, f] = st.tf; return { a, b, c, d, e, f }; },
    measureText(s) { return { width: textW(s, sizeOf(st.font)) }; },
    fillText(s, x, y) { rec(s, x, y); },
    strokeText(s, x, y) { rec(s, x, y); },
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; },
    createConicGradient() { return { addColorStop() {} }; },
    createPattern() { return null; },
    getLineDash() { return []; },
    isPointInPath() { return false; },
  };
  for (const m of METHODS) own[m] = () => {};
  function rec(s, x, y) {
    if (st.globalAlpha <= 0.05 || s == null || String(s).trim() === "") return;
    const size = sizeOf(st.font) * Math.abs(st.tf[0]), w = textW(s, sizeOf(st.font)) * Math.abs(st.tf[0]);
    const X = st.tf[0] * x + st.tf[2] * y + st.tf[4], Y = st.tf[1] * x + st.tf[3] * y + st.tf[5];
    const a = st.textAlign, b = st.textBaseline;
    const x0 = a === "center" ? X - w / 2 : a === "right" || a === "end" ? X - w : X;
    const y0 = b === "middle" ? Y - size / 2 : b === "top" || b === "hanging" ? Y : b === "bottom" ? Y - size : Y - size * 0.8;
    texts.push({ s: String(s), x0, y0, x1: x0 + w, y1: y0 + size, rot: st.rot });
  }
  const props = {};
  const ctx = new Proxy(own, {
    get(t, p) { if (p in t) return t[p]; if (p === "font" || p === "textAlign" || p === "textBaseline" || p === "globalAlpha") return st[p]; return props[p]; },
    set(t, p, v) { if (p === "font" || p === "textAlign" || p === "textBaseline" || p === "globalAlpha") st[p] = v; else props[p] = v; return true; },
  });
  return { ctx, texts };
}

/** motion.html 하나를 점검해 문제 문장 목록을 돌려준다. */
export function checkMotion(file, { overlap = false } = {}) {
  const html = fs.readFileSync(file, "utf8");
  const iTools = html.indexOf("/* ───────── 공통 도구");
  const iPlayer = html.indexOf("/* ───────── 플레이어");
  if (iTools < 0 || iPlayer < 0) throw new Error("모션 노트 엔진 표시를 못 찾음: " + file);
  // 한국사 노트는 장면 데이터를 플레이어 첫 줄 buildScenes(SCENES)에서 S 로 펼친다
  const build = html.startsWith("buildScenes(SCENES);", html.indexOf("\n", iPlayer) + 1) ? "\nbuildScenes(SCENES);" : "";
  const code = html.slice(html.lastIndexOf("<script>", iTools) + 8, iPlayer) + build + "\n;globalThis.__S=S;globalThis.__W=W;globalThis.__H=H;globalThis.__U=UNITS;";
  // 장면이 그림을 미리 굽는 데 쓰는 보조 캔버스(document.createElement('canvas'))도 흉내 낸다
  const offscreen = () => {
    const { ctx } = makeCtx();
    ctx.createImageData = (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) });
    ctx.getImageData = (x, y, w, h) => ctx.createImageData(w, h);
    return { width: 0, height: 0, getContext: () => ctx };
  };
  const sandbox = { console, Math, Date, JSON, Number, String, Array, Object, Uint8ClampedArray, document: { createElement: offscreen },
    Path2D: class { addPath() {} moveTo() {} lineTo() {} arc() {} rect() {} closePath() {} } };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: file });
  const S = sandbox.__S, W = sandbox.__W, H = sandbox.__H, U = sandbox.__U;

  const problems = [];
  const say = (i, msg) => problems.push(`#${i} ${S[i]?.title ?? "?"} — ${msg}`);
  const chDir = path.join(path.dirname(file), "chapters");
  S.forEach((s, i) => {
    for (const k of ["title", "sub", "ch"]) if (typeof s[k] !== "string" || !s[k]) say(i, `${k} 없음`);
    if (!Array.isArray(s.fx) || !s.fx.length) say(i, "fx 없음");
    else s.fx.forEach((x, j) => { if (!x || typeof x.f !== "string") say(i, `fx[${j}].f 없음`); });
    if (!Array.isArray(s.pts) || !s.pts.length) say(i, "pts 없음");
    if (!(s.dur > 0)) say(i, "dur 이 0 이하");
    if (s.still != null && !(s.still >= 0 && s.still <= s.dur)) say(i, `still(${s.still})이 0~dur 밖`);
    if (!Number.isInteger(s.u) || s.u < -1 || s.u >= U.length) say(i, `u(${s.u})가 단원 범위 밖`);
    if (s.file && !fs.existsSync(path.join(chDir, s.file))) say(i, `file '${s.file}' 장이 없음`);
    if (typeof s.draw !== "function") { say(i, "draw 없음"); return; }
    const times = [...new Set([0, s.dur * 0.25, s.dur * 0.5, s.dur * 0.75, s.still ?? 2, s.dur - 0.01].map((t) => +t.toFixed(3)))];
    for (const t of times) {
      const { ctx, texts } = makeCtx();
      try { s.draw(ctx, t); } catch (e) { say(i, `t=${t} 오류: ${e.message}`); continue; }
      for (const q of texts) {
        if (q.rot) continue;
        if (q.x0 < -2 || q.x1 > W + 2 || q.y0 < -2 || q.y1 > H + 2) say(i, `t=${t} 캔버스 밖 글자 “${q.s}” (${q.x0.toFixed(0)}~${q.x1.toFixed(0)}, ${q.y0.toFixed(0)}~${q.y1.toFixed(0)})`);
      }
      if (overlap && t === +(s.still ?? 2).toFixed(3)) {
        const T = texts.filter((q) => !q.rot);
        for (let a = 0; a < T.length; a++) for (let b = a + 1; b < T.length; b++) {
          const p = T[a], q = T[b];
          const ix = Math.min(p.x1, q.x1) - Math.max(p.x0, q.x0), iy = Math.min(p.y1, q.y1) - Math.max(p.y0, q.y0);
          if (ix <= 0 || iy <= 0) continue;
          const small = Math.min((p.x1 - p.x0) * (p.y1 - p.y0), (q.x1 - q.x0) * (q.y1 - q.y0));
          if (ix * iy > 0.3 * small && !(p.s === q.s && Math.abs(p.x0 - q.x0) < 1 && Math.abs(p.y0 - q.y0) < 1)) say(i, `정지 화면 글자 겹침 “${p.s}” ↔ “${q.s}”`);
        }
      }
    }
  });
  return { scenes: S.length, problems };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) { console.error("사용법: node scripts/suneung/motion-smoke.mjs <motion.html> [--overlap]"); process.exit(2); }
  const { scenes, problems } = checkMotion(file, { overlap: process.argv.includes("--overlap") });
  console.log(`${path.relative(process.cwd(), file)}: 장면 ${scenes}개 (인트로 포함), 문제 ${problems.length}개`);
  for (const p of problems) console.log("  " + p);
  process.exitCode = problems.length ? 1 : 0;
}
