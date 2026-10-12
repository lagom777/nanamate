// 한국사 모션 노트 페이지 조립: 물리학Ⅰ 모션 노트의 CSS·공통 도구 + hist-engine.js 의 장면 템플릿 + hist-scenes.mjs 의 데이터.
// 전체 합본(motion.html)과 파트별(motion/NN-*.html) 열 한 쪽을 같은 데이터로 만든다.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LEARN } from "./lib.mjs";
import { UNITS, scenes, TERR, TERR_ORDER } from "./hist-scenes.mjs";

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

  const data = `const HERE_UNITS=${JSON.stringify(unitsHere)};\nconst SCENES=${JSON.stringify(list)};\nconst TERR=${JSON.stringify(TERR)};\n`;
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
  const nav = (base, cur) => `<span class="pll">▶ 파트별 페이지</span><a href="${base}motion.html"${cur === "all" ? ' aria-current="page"' : ""}>🎬 전체 합본</a><a href="${base}map.html" style="--c:#FDE047">🗺️ 영토 변화 지도</a>` +
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

/* ── 영토 변화 인포그래픽(map.html): 연도 슬라이더로 스냅숏 사이를 넘긴다 ── */
export function mapPage() {
  const src = fs.readFileSync(path.join(LEARN, "aboutSuneungPhysics1/motion.html"), "utf8");
  const i0 = src.indexOf("/* ───────── 공통 도구 ───────── */"), i1 = src.indexOf("/* ───────── 0. 인트로");
  if (i0 < 0 || i1 < 0) throw new Error("physics helper markers not found");
  const tools = src.slice(i0, i1).replace(/const UNITS=\[.*?\];/s, `const UNITS=${JSON.stringify(UNITS.map(({ k, e, name, c }) => ({ k, e, name, c })))};`);
  const snaps = TERR_ORDER.map((id) => ({ id, ...TERR[id] }));
  const ticks = snaps.map((s, i) => `<button class="tick" data-i="${i}" style="--c:${UNITS[s.u].c}"><b>${s.sy}</b><span>${s.t}</span></button>`).join("");
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>한눈에 보는 영토 변화 — 한국사</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap">
<style>
:root{color-scheme:dark;--bg:#09131F;--bg2:#0E1B2A;--line:#1F3349;--text:#E6EDF5;--muted:#91A5BA;--dim:#5E738B;--acc:#FDE047;
  --fd:"Black Han Sans","IBM Plex Sans KR",system-ui,sans-serif;--fb:"IBM Plex Sans KR",system-ui,-apple-system,sans-serif;--fm:"IBM Plex Mono",ui-monospace,Menlo,monospace}
html,body{background:var(--bg);color:var(--text);margin:0}
body{font-family:var(--fb);font-size:15px;line-height:1.6;padding:22px clamp(16px,3vw,40px) 56px}
.wrap{max-width:1240px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
h1{font-family:var(--fd);font-weight:400;font-size:clamp(28px,3.6vw,40px);margin:0;line-height:1.1}
h1 span{color:var(--acc);transition:color .4s}
.sub{margin:6px 0 0;color:var(--muted);font-size:13px}.sub a{color:var(--acc);text-decoration:none}.sub a:hover{text-decoration:underline}
.board{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--bg2)}
.stage{position:relative;aspect-ratio:640/660;background:#0A1828}
.stage canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab}
.info{border-left:1px solid var(--line);padding:24px 26px;display:flex;flex-direction:column;gap:12px;min-width:0}
.yr{font-family:var(--fd);font-size:clamp(34px,4vw,52px);line-height:1;color:var(--acc);transition:color .4s}
.ttl{font-size:22px;font-weight:700;margin:0}
.desc{color:var(--muted);margin:0}
.keys{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}
.keys li{position:relative;padding-left:16px;font-size:14px}.keys li::before{content:"";position:absolute;left:0;top:.6em;width:7px;height:7px;border-radius:50%;border:1.5px solid var(--acc)}
.legend{display:flex;flex-wrap:wrap;gap:6px 14px;padding-top:10px;border-top:1px dashed var(--line)}
.legend span{display:flex;align-items:center;gap:6px;font-size:13px}.legend i{width:13px;height:13px;border-radius:3px;display:inline-block}
.links{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto}
.links a{font-size:13px;padding:7px 12px;border:1px solid var(--acc);border-radius:10px;color:var(--acc);text-decoration:none}.links a:hover{background:var(--acc);color:var(--bg)}
.ctrl{grid-column:1/-1;border-top:1px solid var(--line);padding:14px 16px;display:flex;flex-direction:column;gap:12px}
.row{display:flex;gap:10px;align-items:center}
.btn{width:38px;height:38px;flex:none;display:grid;place-items:center;border:1px solid var(--line);border-radius:10px;background:transparent;color:var(--text);cursor:pointer;font-size:15px}
.btn:hover{border-color:var(--acc)}.btn.main{background:var(--acc);border-color:var(--acc);color:var(--bg)}
input[type=range]{flex:1;accent-color:var(--acc);height:28px;min-width:0}
.ticks{display:grid;grid-template-columns:repeat(${snaps.length},minmax(0,1fr));gap:4px}
.tick{all:unset;cursor:pointer;display:flex;flex-direction:column;gap:2px;padding:7px 6px;border-radius:8px;border:1px solid var(--line);min-width:0;text-align:center;transition:all .25s}
.tick b{font-family:var(--fm);font-size:11.5px;font-weight:500;color:var(--c)}.tick span{font-size:11.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tick:hover{border-color:var(--c)}.tick[aria-current="true"]{background:color-mix(in srgb,var(--c) 18%,transparent);border-color:var(--c)}
.tick:focus-visible,.btn:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.note{color:var(--dim);font-size:12px;font-family:var(--fm)}
@media (max-width:900px){.board{grid-template-columns:1fr}.info{border-left:0;border-top:1px solid var(--line)}
  .ticks{grid-template-columns:repeat(${Math.ceil(snaps.length / 2)},minmax(0,1fr))}}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>한눈에 보는 <span>영토 변화</span></h1>
    <p class="sub"><a href="index.html">← 수능 한국사 노트</a> · <a href="motion.html">🎬 모션 노트</a> · 슬라이더를 끌거나 연도를 눌러 2000년의 지도 변화를 넘겨 보세요 · ← → 키, Space 재생</p>
  </header>
  <section class="board" aria-label="영토 변화 지도">
    <div class="stage"><canvas id="map" role="img" aria-label="영토 변화 지도"></canvas></div>
    <div class="info" aria-live="polite">
      <div class="yr" id="yr"></div>
      <h2 class="ttl" id="ttl"></h2>
      <p class="desc" id="desc"></p>
      <ul class="keys" id="keys"></ul>
      <div class="legend" id="legend"></div>
      <div class="links" id="links"></div>
    </div>
    <div class="ctrl">
      <div class="row">
        <button class="btn" id="prev" aria-label="이전 시기">◀</button>
        <button class="btn main" id="play" aria-label="재생">▶</button>
        <button class="btn" id="next" aria-label="다음 시기">▶▶</button>
        <input type="range" id="slider" min="0" max="${snaps.length - 1}" step="0.01" value="0" aria-label="연도 슬라이더">
      </div>
      <div class="ticks" id="ticks">${ticks}</div>
    </div>
  </section>
  <p class="note">경계는 교과서 지도를 단순화한 약도입니다. 정확한 경계는 시기와 학설에 따라 다릅니다. · 2015 개정 교육과정 한국사 범위</p>
</div>
<script>
${tools}
${ENGINE}
const TERR=${JSON.stringify(TERR)};
const SN=${JSON.stringify(snaps)};
const CH=${JSON.stringify(UNITS.map((u) => ({ name: u.name, file: u.file, c: u.c })))};
const cv=document.getElementById('map'),ctx=cv.getContext('2d'),$=id=>document.getElementById(id);
const MW=640,MH=660,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let v=0,target=null,playing=false,hold=0,last=null,shown=-1;
function resize(){const r=cv.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);cv.width=Math.max(1,Math.round(r.width*d));cv.height=Math.max(1,Math.round(r.height*d));}
new ResizeObserver(resize).observe(cv);resize();
function panel(i){if(i===shown)return;shown=i;const s=SN[i],col=CH[s.u].c;
  document.documentElement.style.setProperty('--acc',col);
  $('yr').textContent=s.y;$('ttl').textContent=s.t;$('desc').textContent=s.d;
  $('keys').innerHTML=s.keys.map(k=>'<li>'+k+'</li>').join('');
  $('legend').innerHTML=s.regs.filter(r=>r.legend!==false).map(r=>'<span><i style="background:'+r.c+'"></i>'+r.n+'</span>').join('');
  $('links').innerHTML='<a href="chapters/'+CH[s.u].file+'">📖 '+CH[s.u].name+' 파트 노트</a><a href="motion/'+CH[s.u].file+'">🎬 '+CH[s.u].name+' 모션</a>';
  document.querySelectorAll('.tick').forEach((b,j)=>b.setAttribute('aria-current',j===i));
  try{history.replaceState(null,'','#'+s.id)}catch(e){}}
function goTo(i){i=Math.max(0,Math.min(SN.length-1,i));if(reduce){v=i;target=null;}else target=i;hold=0;}
function setPlay(p){playing=p;$('play').textContent=p?'❚❚':'▶';$('play').setAttribute('aria-label',p?'일시정지':'재생');hold=0;}
$('prev').onclick=()=>{setPlay(false);goTo(Math.round(v)-1);};$('next').onclick=()=>{setPlay(false);goTo(Math.round(v)+1);};
$('play').onclick=()=>{if(!playing&&Math.round(v)>=SN.length-1){v=0;target=null;}setPlay(!playing);};
$('slider').addEventListener('input',e=>{setPlay(false);target=null;v=+e.target.value;});
$('slider').addEventListener('change',e=>{goTo(Math.round(+e.target.value));});
$('ticks').addEventListener('click',e=>{const b=e.target.closest('.tick');if(!b)return;setPlay(false);goTo(+b.dataset.i);});
document.addEventListener('keydown',e=>{if(e.target.closest('input[type=range]'))return;
  if(e.key==='ArrowRight'){setPlay(false);goTo(Math.round(v)+1);}else if(e.key==='ArrowLeft'){setPlay(false);goTo(Math.round(v)-1);}
  else if(e.key===' '&&!e.target.closest('button')){e.preventDefault();$('play').click();}});
let drag=null;cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,v};cv.setPointerCapture(e.pointerId);setPlay(false);});
cv.addEventListener('pointermove',e=>{if(!drag)return;target=null;v=Math.max(0,Math.min(SN.length-1,drag.v-(e.clientX-drag.x)/(cv.getBoundingClientRect().width*.5)));});
cv.addEventListener('pointerup',()=>{if(drag){goTo(Math.round(v));drag=null;}});
function frame(now){const dt=last==null?0:Math.min(.05,(now-last)/1000);last=now;
  if(target!=null){const d=target-v;v+=Math.sign(d)*Math.min(Math.abs(d),dt*Math.max(.5,Math.abs(d)*.9));if(Math.abs(target-v)<1e-3){v=target;target=null;}}
  else if(playing){hold+=dt;if(hold>3.2){if(Math.round(v)>=SN.length-1)setPlay(false);else goTo(Math.round(v)+1);}}
  $('slider').value=v;
  const a=Math.floor(v+1e-6),k=v-a,A=SN[a],B=SN[Math.min(SN.length-1,a+1)];
  ctx.setTransform(cv.width/MW,0,0,cv.height/MH,0,0);ctx.clearRect(0,0,MW,MH);
  drawTerritory(ctx,TERR[A.id],k>0?TERR[B.id]:null,k,{x:0,y:0,w:MW,h:MH});
  const ka=ease(Math.max(0,Math.min(1,k*1.6-.2))),ca=CH[A.u].c,cb=CH[B.u].c;
  ctx.save();ctx.beginPath();ctx.rect(14,10,400,92);ctx.clip();
  const yo=(s,col,al,dy)=>{TS(ctx,s.y,22,40+dy,{size:30,font:DISP,w:400,align:'left',color:col,lw:6,alpha:al});TS(ctx,s.t,22,74+dy,{size:16,align:'left',lw:5,alpha:al});};
  if(k>0&&B!==A){yo(A,ca,1-ka,-26*ka);yo(B,cb,ka,26*(1-ka));}else yo(A,ca,1,0);ctx.restore();
  panel(Math.round(v));requestAnimationFrame(frame);}
const h0=SN.findIndex(s=>'#'+s.id===location.hash);if(h0>=0)v=h0;panel(Math.round(v));
requestAnimationFrame(frame);
</script>
</body>
</html>
`;
}
