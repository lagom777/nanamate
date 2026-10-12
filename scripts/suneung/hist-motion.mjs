// 한국사 모션 노트 페이지 조립: 물리학Ⅰ 모션 노트의 CSS·공통 도구 + hist-engine.js 의 장면 템플릿 + hist-scenes.mjs 의 데이터.
// 전체 합본(motion.html)과 파트별(motion/NN-*.html) 열 한 쪽을 같은 데이터로 만든다.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LEARN } from "./lib.mjs";
import { UNITS, scenes } from "./hist-scenes.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE = fs.readFileSync(path.join(HERE, "hist-engine.js"), "utf8");

/* 합본 안에서의 장면 번호(챕터의 모션 링크용) */
export const sceneIndex = (u) => scenes.map((s, i) => ({ i, s })).filter((x) => x.s.u === u).map((x) => ({ i: x.i, title: x.s.title }));
export const partFile = (u) => UNITS[u].file;

const EXTRA_CSS = `
.pl{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:-4px 0 0}
.pll{font-family:var(--fm);font-size:12px;color:var(--dim);margin-right:2px}
.pl a{font-family:var(--fm);font-size:12px;padding:5px 11px;border:1px solid var(--line);border-radius:999px;color:var(--muted);text-decoration:none;transition:all .25s}
.pl a:hover{border-color:var(--c,var(--acc));color:var(--c,var(--acc))}
.pl a[aria-current="page"]{background:var(--c,var(--acc));border-color:var(--c,var(--acc));color:var(--bg)}
.sum-grid{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))!important}
.chip .em{margin-right:4px}
`;

function pageHtml({ src, title, h1, backs, base, unitsHere, list, linkNav, footer }) {
  const iIntro = src.indexOf("/* ───────── 0. 인트로");
  if (iIntro < 0) throw new Error("physics motion markers not found");
  let head = src.slice(0, iIntro);
  const rep = (s, a, b) => { if (!s.includes(a)) throw new Error("missing: " + a.slice(0, 50)); return s.replace(a, b); };
  head = rep(head, "<title>물리학Ⅰ 모션 노트</title>", `<title>${title}</title>`);
  head = rep(head, "물리학Ⅰ <span>모션 노트</span>", h1);
  head = rep(head, `<p><a class="back" href="index.html">← 수능 물리학Ⅰ 노트</a> · <a class="back" href="practice.html">📝 기출 풀어보기</a> · 19개 핵심 개념을 움직이는 그림으로</p>`, `<p>${backs}</p>`);
  head = rep(head, `<nav class="units" id="units" aria-label="단원"></nav>
  </header>`, `<nav class="units" id="units" aria-label="파트"></nav>
  </header>
  <nav class="pl" aria-label="모션 노트 바로가기">${linkNav}</nav>`);
  head = rep(head, "<footer>2015 개정 교육과정 물리학Ⅰ 범위 기준 · 그림 속 수치는 개념 설명용 예시값</footer>", `<footer>${footer}</footer>`);
  head = head.replace(/const UNITS=\[.*?\];/s, `const UNITS=${JSON.stringify(UNITS.map(({ k, e, name, c }) => ({ k, e, name, c })))};`);
  if (!head.includes('"선사·고조선"')) throw new Error("UNITS not replaced");
  head = rep(head, "</style>\n<style>body{margin:0}</style>", `</style>\n<style>body{margin:0}${EXTRA_CSS}</style>`);

  const data = `const HERE_UNITS=${JSON.stringify(unitsHere)};\nconst SCENES=${JSON.stringify(list)};\n`;
  const player = `
/* ───────── 플레이어 ───────── */
buildScenes(SCENES);
const cv=document.getElementById('cv'),ctx=cv.getContext('2d'),$=id=>document.getElementById(id);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let idx=0,t=0,playing=!reduce,last=null;
function resize(){const r=cv.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);cv.width=Math.max(1,Math.round(r.width*d));cv.height=Math.max(1,Math.round(r.height*d));}
new ResizeObserver(resize).observe(cv);resize();
const uc=s=>s.u<0?'#FF7A8A':UNITS[s.u].c;
const cnt=UNITS.map(()=>0);S.forEach(s=>{if(s.u>=0)s.no=++cnt[s.u];});
const fxHTML=x=>\`<span class="f word">\${x.f}</span>\`;
const tl=$('tl');
S.forEach((s,i)=>{const b=document.createElement('button');b.className='seg';b.style.setProperty('--c',uc(s));b.title=\`\${i+1}. \${s.title}\`;
  b.setAttribute('aria-label',\`\${i+1}번째 장면: \${s.title}\`);b.innerHTML='<i><b></b></i>';b.onclick=()=>go(i);tl.appendChild(b);});
HERE_UNITS.forEach(k=>{const u=UNITS[k];const b=document.createElement('button');b.className='chip';b.dataset.u=k;b.style.setProperty('--c',u.c);b.innerHTML=\`<span class="em">\${u.e}</span>\${u.name}\`;
  b.onclick=()=>go(S.findIndex(s=>s.u===k));$('units').appendChild(b);});
function render(){
  const s=S[idx];document.documentElement.style.setProperty('--acc',uc(s));
  $('p-eye').innerHTML=s.u<0?'<b>INTRO</b> 한국사 전체 지도':\`<b>\${UNITS[s.u].k}-\${s.no}</b> \${UNITS[s.u].name} · \${s.ch}\`;
  $('p-title').textContent=s.title;$('p-sub').textContent=s.sub;
  $('p-fx').innerHTML=s.fx.map(x=>\`<div class="fx">\${fxHTML(x)}<span class="n">\${x.n||''}</span></div>\`).join('');
  $('p-pts').innerHTML=s.pts.map(p=>\`<li>\${p}</li>\`).join('');
  const pn=$('panel');pn.classList.remove('enter');void pn.offsetWidth;pn.classList.add('enter');pn.scrollTop=0;
  $('count').textContent=String(idx+1).padStart(2,'0')+' / '+S.length;
  [...tl.children].forEach((b,i)=>{b.classList.toggle('done',i<idx);b.setAttribute('aria-current',i===idx);b.querySelector('b').style.width='';});
  document.querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-current',+b.dataset.u===s.u));
  cv.setAttribute('aria-label',s.title+' 애니메이션');
  try{history.replaceState(null,'','#s'+idx)}catch(e){}
}
function go(i,start){idx=(i+S.length)%S.length;t=start??(playing?0:(S[idx].still??2));render();}
function setPlay(p){playing=p;$('b-play').setAttribute('aria-label',p?'일시정지':'재생');$('play-ico').setAttribute('d',p?'M4 2h3v12H4zM9 2h3v12H9z':'M4 2v12l10-6z');}
$('b-play').onclick=()=>setPlay(!playing);$('b-prev').onclick=()=>go(idx-1);$('b-next').onclick=()=>go(idx+1);cv.onclick=()=>setPlay(!playing);
document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea'))return;
  if(e.key==='ArrowRight')go(idx+1);else if(e.key==='ArrowLeft')go(idx-1);
  else if(e.key===' '&&!e.target.closest('button')){e.preventDefault();setPlay(!playing);}});
HERE_UNITS.forEach(k=>{const u=UNITS[k],col=document.createElement('div');col.className='col';col.style.setProperty('--c',u.c);
  col.innerHTML=\`<h3>\${u.e} \${u.name}<small>\${cnt[k]} SCENES</small></h3>\`+S.map((s,i)=>s.u!==k?'':
    \`<div class="item"><button data-i="\${i}">\${s.title}<span>\${u.k}-\${s.no}</span></button><div class="fs">\${s.fx.slice(0,3).map(x=>\`<span class="word">\${x.f}</span>\`).join('')}</div></div>\`).join('');
  $('sum').appendChild(col);});
$('sum').addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(!b)return;go(+b.dataset.i);
  document.querySelector('.player').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});});
function frame(now){
  const dt=last==null?0:Math.min(.05,(now-last)/1000);last=now;
  if(playing){t+=dt;if(t>=S[idx].dur)go(idx+1);}
  ctx.setTransform(cv.width/W,0,0,cv.height/H,0,0);ctx.clearRect(0,0,W,H);
  try{S[idx].draw(ctx,t);}catch(err){console.error(err);}
  const b=tl.children[idx].querySelector('b');b.style.width=(clamp(t/S[idx].dur)*100)+'%';
  requestAnimationFrame(frame);
}
const hm=location.hash.match(/^#s(\\d+)$/);const st0=hm?Math.min(+hm[1],S.length-1):0;setPlay(playing);go(st0,S[st0].still);
requestAnimationFrame(frame);
</script>

</body>
</html>
`;
  return head + "\n" + ENGINE + "\n" + data + player;
}

/* 합본 + 파트별 페이지. 반환: { "motion.html": html, "motion/01-….html": html, … } */
export function motionPages() {
  const src = fs.readFileSync(path.join(LEARN, "aboutSuneungPhysics1/motion.html"), "utf8");
  const out = {};
  const allUnits = UNITS.map((_, i) => i);
  const nav = (base, cur) => `<span class="pll">▶ 파트별 페이지</span><a href="${base}motion.html"${cur === "all" ? ' aria-current="page"' : ""}>🎬 전체 합본</a>` +
    UNITS.map((u, i) => `<a href="${base}motion/${u.file}" style="--c:${u.c}"${cur === i ? ' aria-current="page"' : ""}>${u.e} ${u.name}</a>`).join("");
  out["motion.html"] = pageHtml({
    src, title: "한국사 모션 노트", h1: `한국사 <span>모션 노트</span>`, base: "",
    backs: `<a class="back" href="index.html">← 수능 한국사 노트</a> · ${scenes.length}개 장면을 움직이는 그림으로 · 파트만 골라 보려면 아래 바로가기`,
    unitsHere: allUnits, list: scenes, linkNav: nav("", "all"),
    footer: "2015 개정 교육과정 한국사 범위 기준 · 지도는 개념 설명용 약도이며 위치는 대략적입니다",
  });
  UNITS.forEach((u, k) => {
    const list = scenes.filter((s) => s.u === k);
    out[`motion/${u.file}`] = pageHtml({
      src, title: `${u.name} 모션 노트 — 한국사`, h1: `${u.name} <span>모션 노트</span>`, base: "../",
      backs: `<a class="back" href="../index.html">← 수능 한국사 노트</a> · <a class="back" href="../chapters/${u.file}">📖 ${u.name} 파트 노트</a> · <a class="back" href="../motion.html">🎬 전체 합본</a> · 장면 ${list.length}개`,
      unitsHere: [k], list, linkNav: nav("../", k),
      footer: "2015 개정 교육과정 한국사 범위 기준 · 지도는 개념 설명용 약도이며 위치는 대략적입니다",
    });
  });
  return out;
}
