// 인터랙티브 그림(NMFIG) 점검 도구 — 브라우저 없이 render()를 돌려 자료와 맞는지, SVG가 깨지지 않았는지 본다.
// 사용: node scripts/figcheck.mjs <id> [--png] [--out <폴더>]
//   · 각 보기(view) × 컨트롤 값 변형(최솟값/중간/최댓값, 선택지, 토글)으로 render() 호출
//   · data-part 가 자료(data)에 있는지, 자료의 모든 부위가 어딘가에 그려지는지
//   · NaN/undefined/Infinity, 작은 글씨(14 미만), XML 형식 오류 검사
//   · SVG 파일을 --out 폴더(기본 /tmp/figcheck)에 쓰고, --png 면 qlmanage 로 PNG 미리보기도 만든다(macOS)
import fs from "fs";
import vm from "vm";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, "../public/learn/shared/figures");
const args = process.argv.slice(2);
const id = args[0];
const png = args.includes("--png");
const outIdx = args.indexOf("--out");
const OUT = outIdx >= 0 ? args[outIdx + 1] : "/tmp/figcheck";
if (!id) { console.error("사용: node scripts/figcheck.mjs <id> [--png] [--out 폴더]"); process.exit(2); }

const TOKENS = {
  accent: "#16a34a", ink: "#1a1f2e", dim: "#4a5468", mute: "#6b7280", line: "rgba(0,0,0,0.12)", card: "#ffffff", elev: "#f5f7fa",
  c1: "#2563eb", c2: "#dc2626", c3: "#d97706", c4: "#16a34a", c5: "#7c3aed", c6: "#0891b2", c7: "#db2777", c8: "#65748b",
};
for (let i = 1; i <= 8; i++) TOKENS["c" + i + "-soft"] = `color-mix(in srgb, ${TOKENS["c" + i]} 18%, #fff)`;

const defs = {}, datas = {};
const NMFIG = { define: (i, d) => { defs[i] = d; }, data: (i, d) => { datas[i] = d; } };
const sandbox = { window: { NMFIG }, NMFIG, console, Math, Date, JSON };
vm.createContext(sandbox);
for (const f of [path.join(DIR, "data", id + ".js"), path.join(DIR, id + ".js")]) {
  if (!fs.existsSync(f)) { console.error("없는 파일: " + f); process.exit(1); }
  new vm.Script(fs.readFileSync(f, "utf8"), { filename: f }).runInContext(sandbox);
}
const def = defs[id], data = datas[id];
const problems = [];
const bad = (m) => problems.push(m);
if (!def) bad("NMFIG.define('" + id + "') 가 없음");
if (!data) bad("NMFIG.data('" + id + "') 가 없음");
if (!def || !data) { report(); }

const vb = Array.isArray(def.viewBox) ? def.viewBox : String(def.viewBox || "").trim().split(/[\s,]+/).map(Number).slice(-2);
if (!(vb.length === 2 && vb.every((n) => n > 0))) bad("viewBox 형식 이상: " + JSON.stringify(def.viewBox));
const views = (def.views && def.views.length) ? def.views : [{ id: "main", label: "" }];
const viewIds = new Set(views.map((v) => v.id));
const controls = def.controls || [];
const cids = new Set();
for (const c of controls) {
  if (cids.has(c.id)) bad("컨트롤 id 중복: " + c.id);
  cids.add(c.id);
  if (c.type === "range" && !(c.min < c.max && c.step > 0)) bad("range 설정 이상: " + c.id);
  if (c.type === "range" && !(c.value >= c.min && c.value <= c.max)) bad("range 기본값이 범위 밖: " + c.id);
  if (c.type === "choice" && !(c.options && c.options.some((o) => o.v === c.value))) bad("choice 기본값이 선택지에 없음: " + c.id);
  for (const vw of c.views || []) if (!viewIds.has(vw)) bad("컨트롤 " + c.id + " 의 views 에 없는 보기: " + vw);
}
const defaults = () => Object.fromEntries(controls.map((c) => [c.id, c.value]));
const variants = [["기본", defaults()]];
for (const c of controls) {
  const vals = c.type === "range" ? [c.min, (c.min + c.max) / 2, c.max] : c.type === "choice" ? c.options.map((o) => o.v) : [true, false];
  for (const val of vals) variants.push([c.id + "=" + val, { ...defaults(), [c.id]: val }]);
}

const seen = new Set();
const files = [];
fs.mkdirSync(OUT, { recursive: true });
const solid = (s) => s.replace(/var\(--fgx-([a-z0-9-]+)\s*(?:,\s*([^)]*))?\)/g, (_, k, fb) => TOKENS[k] || (fb && fb.trim()) || "#888");
for (const view of views) {
  variants.forEach(([label, v], idx) => {
    let markup;
    try { markup = def.render(v, view.id); } catch (e) { bad(`[${view.id}/${label}] render 예외: ${e.message}`); return; }
    if (typeof markup !== "string") { bad(`[${view.id}/${label}] render 가 문자열이 아님`); return; }
    if (/NaN|undefined|Infinity/.test(markup)) bad(`[${view.id}/${label}] 마크업에 NaN/undefined/Infinity: ` + (markup.match(/.{0,40}(NaN|undefined|Infinity).{0,20}/) || [""])[0]);
    for (const m of markup.matchAll(/data-part="([^"]+)"/g)) {
      seen.add(m[1]);
      if (!data.parts[m[1]]) bad(`[${view.id}/${label}] data-part "${m[1]}" 가 자료(data.parts)에 없음`);
    }
    const sizes = [...markup.matchAll(/font-size[=:]\s*"?([\d.]+)/g)].map((m) => parseFloat(m[1]));
    const small = sizes.filter((s) => s < 14);
    if (small.length && idx === 0) bad(`[${view.id}] 14 미만의 작은 글씨 ${small.length}곳 (최소 ${Math.min(...small)})`);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb[0]} ${vb[1]}" width="${vb[0] * 2}" height="${vb[1] * 2}" class="fgx-svg fgx-fig-${id}" font-family="Helvetica, Arial, sans-serif"><rect width="${vb[0]}" height="${vb[1]}" fill="#fff"/>${solid(markup)}</svg>`;
    const file = path.join(OUT, `${id}-${view.id}-${idx === 0 ? "base" : label.replace(/[^\w.=-]/g, "_")}.svg`);
    fs.writeFileSync(file, svg);
    files.push(file);
    try { execFileSync("python3", ["-c", "import sys,xml.dom.minidom as m;m.parse(sys.argv[1])", file], { stdio: "pipe" }); }
    catch (e) { bad(`[${view.id}/${label}] XML 형식 오류: ` + String(e.stderr || e.message).trim().split("\n").pop()); }
  });
}
for (const k of data.order) if (!seen.has(k)) bad(`자료의 부위 "${k}" 가 어떤 보기에서도 그려지지 않음`);
for (const s of data.scenes || []) {
  for (const st of s.steps) {
    for (const k of Object.keys(st.set || {})) if (!cids.has(k)) bad(`시나리오 ${s.id}: set 키 "${k}" 가 컨트롤에 없음`);
    if (st.part && !data.parts[st.part]) bad(`시나리오 ${s.id}: part "${st.part}" 가 자료에 없음`);
    if (st.view && !viewIds.has(st.view)) bad(`시나리오 ${s.id}: view "${st.view}" 가 없음`);
  }
  if (s.view && !viewIds.has(s.view)) bad(`시나리오 ${s.id}: 시작 view "${s.view}" 가 없음`);
}
for (const [k, p] of Object.entries(data.parts)) if (p.view && !viewIds.has(p.view)) bad(`부위 ${k}: view "${p.view}" 가 def.views 에 없음`);

if (png) {
  for (const f of files.filter((f) => f.includes("-base"))) {
    try { execFileSync("qlmanage", ["-t", "-s", "1400", "-o", OUT, f], { stdio: "pipe" }); } catch (e) { bad("PNG 변환 실패: " + f); }
  }
}
report();

function report() {
  if (problems.length) {
    console.log(`✗ ${id}: 문제 ${problems.length}건`);
    for (const p of problems.slice(0, 60)) console.log("  - " + p);
    process.exit(1);
  }
  console.log(`✓ ${id}: 보기 ${views.length}개 × 변형 ${variants.length}개 render 통과, 부위 ${data.order.length}개 모두 그려짐${png ? ", PNG: " + OUT : ", SVG: " + OUT}`);
}
