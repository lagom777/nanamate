// 생명과학Ⅰ 모션 노트 한 번 생성: 물리학Ⅰ 모션 노트의 플레이어 엔진 + bio-scenes.js 의 장면들.
// 결과물(aboutSuneungBio1/motion.html)은 이후 정적 파일로 관리한다. (물리 노트를 고치면 필요할 때 다시 돌린다)
import fs from "fs";
import path from "path";
import { LEARN } from "./lib.mjs";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(LEARN, "aboutSuneungPhysics1/motion.html"), "utf8");
const scenes = fs.readFileSync(path.join(HERE, "bio-scenes.js"), "utf8");

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
head = rep(head, "<title>물리학Ⅰ 모션 노트</title>", "<title>생명과학Ⅰ 모션 노트</title>");
head = rep(head, "물리학Ⅰ <span>모션 노트</span>", "생명과학Ⅰ <span>모션 노트</span>");
head = rep(head, "← 수능 물리학Ⅰ 노트", "← 수능 생명과학Ⅰ 노트");
head = rep(head, "19개 핵심 개념을", "23개 핵심 개념을");
head = rep(head, "01 / 20", "01 / 24");
head = rep(head, "2015 개정 교육과정 물리학Ⅰ 범위 기준 · 그림 속 수치는 개념 설명용 예시값", "2015 개정 교육과정 생명과학Ⅰ 범위 기준 · 그림 속 수치는 개념 설명용 예시값");
head = rep(head, "grid-template-columns:repeat(3,minmax(0,1fr))", "grid-template-columns:repeat(auto-fit,minmax(260px,1fr))");
head = head.replace(/const UNITS=\[.*?\];/s, "const UNITS=[{k:'Ⅰ',name:'생명과학의 이해',c:'#7BE07F'},{k:'Ⅱ',name:'사람의 물질대사',c:'#F4B544'},{k:'Ⅲ',name:'항상성과 몸의 조절',c:'#4FD1E8'},{k:'Ⅳ',name:'유전',c:'#FF7A8A'},{k:'Ⅴ',name:'생태계와 상호 작용',c:'#B69CFF'}];");
if (!head.includes("생명과학의 이해',c:")) throw new Error("UNITS not replaced");
player = rep(player, "<span class=\"n\">${x.n}</span>", "<span class=\"n\">${x.n||''}</span>");
player = rep(player, "const cnt=[0,0,0];", "const cnt=[0,0,0,0,0];");
player = rep(player, "<b>INTRO</b> 물리학Ⅰ 전체 지도", "<b>INTRO</b> 생명과학Ⅰ 전체 지도");
player = rep(player, "s.u<0?C.u1:UNITS[s.u].c", "s.u<0?'#7BE07F':UNITS[s.u].c");

const out = head + mFn + "\n" + scenes + "\n" + player;
const dest = path.join(LEARN, "aboutSuneungBio1/motion.html");
fs.writeFileSync(dest, out);
console.log("wrote", dest, out.length, "bytes");
