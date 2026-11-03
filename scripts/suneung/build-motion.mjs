// 과목별 모션 노트 생성: 물리학Ⅰ 모션 노트(손으로 만든 정적 파일)의 플레이어 엔진 + <과목>-scenes.js 의 장면들.
// node scripts/suneung/build-motion.mjs [과목…] — 인자가 없으면 전부 만든다. 물리 노트의 엔진을 고치면 다시 돌린다.
// 장면에 file:'<장 파일>'을 적어 두면 motionLinks()가 그 장 노트의 '🎬' 링크(합본 안의 장면 번호)를 만든다.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LEARN } from "./lib.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const u = (k, name, c) => ({ k, name, c });
export const MOTION = {
  bio1: {
    folder: "aboutSuneungBio1", name: "생명과학Ⅰ", scenes: "bio-scenes.js", intro: "#7BE07F",
    footer: "2015 개정 교육과정 생명과학Ⅰ 범위 기준 · 그림 속 수치는 개념 설명용 예시값",
    units: [u("Ⅰ", "생명과학의 이해", "#7BE07F"), u("Ⅱ", "사람의 물질대사", "#F4B544"), u("Ⅲ", "항상성과 몸의 조절", "#4FD1E8"), u("Ⅳ", "유전", "#FF7A8A"), u("Ⅴ", "생태계와 상호 작용", "#B69CFF")],
  },
  korean: {
    folder: "aboutSuneungKorean", name: "국어", scenes: "korean-scenes.js", intro: "#F4B544",
    footer: "2015 개정 교육과정 국어 범위 기준 · 그림 속 예시는 개념 설명용으로 새로 만든 것",
    units: [u("Ⅰ", "현대시", "#F4B544"), u("Ⅱ", "현대 소설", "#FF7A8A"), u("Ⅲ", "고전 시가", "#7BE07F"), u("Ⅳ", "고전 산문·극·수필", "#B69CFF"), u("Ⅴ", "독서·문법", "#4FD1E8")],
  },
  math: {
    folder: "aboutSuneungMath", name: "수학", scenes: "math-scenes.js", intro: "#B69CFF",
    footer: "2015 개정 교육과정 수학Ⅰ·수학Ⅱ·미적분 범위 기준 · 그림 속 수치는 개념 설명용 예시값",
    units: [u("Ⅰ", "수학Ⅰ", "#F4B544"), u("Ⅱ", "수학Ⅱ", "#4FD1E8"), u("Ⅲ", "미적분", "#FF7A8A")],
  },
  english: {
    folder: "aboutSuneungEnglish", name: "영어", scenes: "english-scenes.js", intro: "#4FD1E8",
    footer: "2015 개정 교육과정 영어 범위 기준 · 그림 속 영어 문장은 개념 설명용으로 새로 만든 것",
    units: [u("Ⅰ", "듣기", "#4FD1E8"), u("Ⅱ", "대의·세부", "#F4B544"), u("Ⅲ", "어법·어휘", "#7BE07F"), u("Ⅳ", "빈칸·간접 쓰기", "#FF7A8A"), u("Ⅴ", "장문", "#B69CFF")],
  },
};

const PHYSICS = path.join(LEARN, "aboutSuneungPhysics1/motion.html");
// 장면 소스: 물리는 손으로 만든 motion.html 자체, 나머지는 <과목>-scenes.js (아직 없으면 빈 문자열)
const scenesSrc = (key) => {
  const f = key === "physics1" ? PHYSICS : path.join(HERE, MOTION[key].scenes);
  return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "";
};

/* 장면 목록(합본 안 번호 i, title, file)을 소스에서 읽는다. 인트로가 0번이다. */
function sceneList(src) {
  const at = [...src.matchAll(/S\.push\(\{u:(-?\d+)/g)].map((m) => ({ i: m.index, u: +m[1] }));
  return at.map((a, k) => {
    const body = src.slice(a.i, k + 1 < at.length ? at[k + 1].i : src.length);
    return { i: k, u: a.u, title: (body.match(/title:'([^']*)'/) || [])[1], file: (body.match(/file:'([^']*)'/) || [])[1] };
  });
}

/** 장 파일 → [[장면 번호, 제목], …] (장 노트의 '🎬' 링크용). key 는 MOTION 의 과목 또는 'physics1' */
export function motionLinks(key) {
  const out = {};
  for (const s of sceneList(scenesSrc(key))) if (s.file) (out[s.file] ||= []).push([s.i, s.title]);
  return out;
}

/** 과목 모션 노트 HTML 전체(파일로 쓰기 전) */
export function renderMotion(key) {
  const cfg = MOTION[key];
  const src = fs.readFileSync(PHYSICS, "utf8");
  const scenes = scenesSrc(key);
  const n = sceneList(scenes).filter((s) => s.u >= 0).length;

  const iIntro = src.indexOf("/* ───────── 0. 인트로");
  const iM = src.indexOf("function M(c,s,x,y,o={})");
  const iM1 = src.indexOf("/* ───────── Ⅰ-1 등가속도");
  const iPlayer = src.indexOf("/* ───────── 플레이어");
  if ([iIntro, iM, iM1, iPlayer].some((i) => i < 0)) throw new Error("physics motion markers not found");

  let head = src.slice(0, iIntro);
  const mFn = src.slice(iM, iM1);
  let player = src.slice(iPlayer);

  const rep = (s, a, b) => {
    if (!s.includes(a)) throw new Error("missing: " + a.slice(0, 40));
    return s.replace(a, b);
  };
  head = rep(head, "<title>물리학Ⅰ 모션 노트</title>", `<title>${cfg.name} 모션 노트</title>`);
  head = rep(head, "물리학Ⅰ <span>모션 노트</span>", `${cfg.name} <span>모션 노트</span>`);
  head = rep(head, "← 수능 물리학Ⅰ 노트", `← 수능 ${cfg.name} 노트`);
  const reN = (s, re, b) => { if (!re.test(s)) throw new Error("missing: " + re); return s.replace(re, b); };
  head = reN(head, /\d+개 핵심 개념을/, `${n}개 핵심 개념을`);
  head = reN(head, /01 \/ \d+/, `01 / ${n + 1}`);
  head = rep(head, "2015 개정 교육과정 물리학Ⅰ 범위 기준 · 그림 속 수치는 개념 설명용 예시값", cfg.footer);
  head = rep(head, "grid-template-columns:repeat(3,minmax(0,1fr))", "grid-template-columns:repeat(auto-fit,minmax(260px,1fr))");
  const units = cfg.units.map((x) => `{k:'${x.k}',name:'${x.name}',c:'${x.c}'}`).join(",");
  head = head.replace(/const UNITS=\[.*?\];/s, () => `const UNITS=[${units}];`);
  if (!head.includes(`name:'${cfg.units[0].name}',c:`)) throw new Error("UNITS not replaced");
  player = rep(player, "<span class=\"n\">${x.n}</span>", "<span class=\"n\">${x.n||''}</span>");
  player = rep(player, "const cnt=[0,0,0];", `const cnt=[${cfg.units.map(() => 0)}];`);
  player = rep(player, "<b>INTRO</b> 물리학Ⅰ 전체 지도", `<b>INTRO</b> ${cfg.name} 전체 지도`);
  player = rep(player, "s.u<0?C.u1:UNITS[s.u].c", `s.u<0?'${cfg.intro}':UNITS[s.u].c`);

  return { html: head + mFn + "\n" + scenes + "\n" + player, n };
}

export function buildMotion(key) {
  const { html, n } = renderMotion(key);
  const dest = path.join(LEARN, MOTION[key].folder, "motion.html");
  fs.writeFileSync(dest, html);
  return { dest, bytes: html.length, n };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(MOTION);
  for (const k of keys) {
    if (!MOTION[k]) throw new Error("모르는 과목: " + k);
    if (!fs.existsSync(path.join(HERE, MOTION[k].scenes))) { console.log(k, "장면 파일 없음 — 건너뜀"); continue; }
    const r = buildMotion(k);
    console.log(k, r.n, "개념 →", path.relative(process.cwd(), r.dest), r.bytes, "bytes");
  }
}
