/* 한국사 모션 노트 장면 엔진 — hist-motion.mjs 가 물리학Ⅰ 모션 노트의 공통 도구 뒤에 붙인다.
   전제: C, UNITS, S, W, H, TAU, SANS, MONO, DISP, clamp, lerp, ease, seg, rnd, T, arrow, poly, dot, box, label 이 이미 정의되어 있다.
   장면은 데이터(SCENES)만 있고, 그리는 일은 템플릿(TPL[type])이 한다. */
const PAL=['#F4B544','#4FD1E8','#FF7A8A','#7BE07F','#B69CFF','#FF9A4D','#5EEAD4','#F472B6'];
const colOf=d=>d.u<0?'#FF7A8A':UNITS[d.u].c;
const TPL={};

/* ── 글자 도구 ── */
function wrap(c,s,maxW,font){c.save();c.font=font;const out=[];
  String(s).split('\n').forEach(par=>{let line='';
    par.split(' ').forEach(wd=>{const test=line?line+' '+wd:wd;
      if(!line||c.measureText(test).width<=maxW)line=test;else{out.push(line);line=wd;}});
    out.push(line);});
  const res=[];out.forEach(l=>{if(c.measureText(l).width<=maxW){res.push(l);return;}let cur='';
    for(const ch of l){if(cur&&c.measureText(cur+ch).width>maxW){res.push(cur);cur=ch;}else cur+=ch;}res.push(cur);});
  c.restore();return res;}
function WT(c,s,x,y,maxW,lh,o={}){const font=`${o.w||500} ${o.size||16}px ${o.font||SANS}`;const ls=wrap(c,s,maxW,font);
  ls.forEach((l,i)=>T(c,l,x,y+i*lh,o));return ls.length;}
function fit(c,s,maxW,size,w=600,font=SANS){c.save();c.font=`${w} ${size}px ${font}`;const m=c.measureText(s).width;c.restore();return m>maxW?Math.max(10,size*maxW/m):size;}
function kicker(c,d,col){label(c,d.kick||UNITS[d.u].name,48,26,C.dim,{size:12,align:'left'});
  if(d.head)T(c,d.head,48,56,{font:DISP,size:27,color:col,w:400});}
function pill(c,s,x,y,col,o={}){c.save();c.font=`${o.w||600} ${o.size||13}px ${SANS}`;const w=c.measureText(s).width+(o.pad||16);c.restore();
  box(c,x-w/2,y-12,w,24,12,o.fill||col+'22',col,1.3,{alpha:o.alpha});T(c,s,x,y+1,{size:o.size||13,w:o.w||600,color:o.tc||C.text,align:'center',alpha:o.alpha});return w;}

/* ── 인트로 ── */
TPL.intro=function(c,t,d){
  label(c,'HISTORY MOTION NOTE',480,44,C.dim,{size:14});
  T(c,'한국사, 움직이며 외우기',480,92,{font:DISP,size:34,align:'center',color:C.text});
  const us=UNITS,n=us.length,per=5;
  us.forEach((u,i)=>{const r=Math.floor(i/per),cc=i%per,x=48+cc*176,y=150+r*170,k=ease(seg(t,.2+i*.18,.8+i*.18));if(k<=0)return;
    const cnt=S.filter(s=>s.u===i).length;
    c.save();c.globalAlpha=k;c.translate(x+80,y+66);c.scale(.9+.1*k,.9+.1*k);c.translate(-80,-66);
    box(c,0,0,160,132,16,'#0E1B2A',u.c+'99',1.8,{glow:6,gc:u.c});box(c,0,0,160,6,3,u.c);
    T(c,u.e,80,48,{size:38,align:'center'});T(c,u.name,80,86,{size:fit(c,u.name,140,17,700),w:700,align:'center'});
    label(c,'장면 '+cnt+'개',80,112,C.dim,{size:12});c.restore();});
  label(c,'아래 막대를 눌러 원하는 장면으로 이동 · ← → 키로 넘기기 · Space 재생/정지',480,516,C.muted,{size:13});
};

/* ── 연표: 사건이 차례로 떠오르는 가로 타임라인 ── */
TPL.timeline=function(c,t,d){
  const ev=d.events,n=ev.length,col=colOf(d);kicker(c,d,col);
  const X0=n>1?120:480,X1=840,Y=d.cy||292,t0=.6,step=Math.max(1,(d.dur-3.2)/n),endT=t0+step*n;
  const newest=t<endT?Math.min(n-1,Math.floor((t-t0)/step)):-1,cyc=t>=endT?Math.floor((t-endT)/1.5)%n:-1,cur=newest>=0?newest:cyc;
  poly(c,[[50,Y],[910,Y]],C.line,4);
  poly(c,[[50,Y],[50+860*(t>=endT?1:clamp((t-t0)/(step*n))),Y]],col,4,{alpha:.9});
  const sp=n>1?(X1-X0)/(n-1):0,cw=Math.min(212,Math.max(132,sp*2-18));
  (d.gaps||[]).forEach((g,i)=>{if(!g)return;const k=seg(t,t0+(i+1)*step,t0+(i+1)*step+.6);if(k<=0)return;pill(c,g,X0+(i+.5)*sp,Y,col,{alpha:k,size:13,fill:'#09131F'});});
  ev.forEach((e,i)=>{const x=X0+i*sp,tt=t0+i*step,k=ease(seg(t,tt,tt+.55));if(k<=0)return;
    const up=i%2===0,on=i===cur,ch=d.cardH||132,yy=(up?Y-62-ch:Y+62)+(1-k)*(up?-14:14);
    c.save();c.globalAlpha=k;
    poly(c,[[x,Y],[x,up?Y-62:Y+62]],on?col:C.line,2);
    box(c,x-cw/2,yy,cw,ch,12,on?col+'22':'#0E1B2A',on?col:C.line,on?2.6:1.5,{glow:on?16:0,gc:col});
    T(c,e.y,x,yy+22,{font:DISP,size:fit(c,e.y,cw-14,21,400,DISP),color:col,align:'center',w:400});
    const nl=WT(c,e.t,x,yy+50,cw-18,19,{size:16,w:700,align:'center'});
    if(e.n)WT(c,e.n,x,yy+50+nl*19+7,cw-20,16,{size:12.5,color:C.muted,align:'center'});
    dot(c,x,Y,on?25:21,on?col:'#10202F',{stroke:col,lw:3,glow:on?22:0});
    T(c,e.e||'•',x,Y+1,{size:on?24:20,align:'center'});
    c.restore();});
  if(d.foot&&t>endT-.5)label(c,d.foot,480,516,C.muted,{size:14,alpha:seg(t,endT-.5,endT+.3)});
};

/* ── 카드: 비교 카드들이 튀어나오고 핵심어가 하나씩 붙는다 ── */
TPL.cards=function(c,t,d){
  const cs=d.cards,n=cs.length,col=colOf(d);kicker(c,d,col);
  const cols=n<=5?n:3,rows=Math.ceil(n/cols),gap=14,cw=(880-(cols-1)*gap)/cols,ch=rows===1?352:196,top=rows===1?100:94;
  const per=.55,endT=.5+n*per+1.8,cyc=t>endT?Math.floor((t-endT)/1.6)%n:-1;
  cs.forEach((cd,i)=>{const r=Math.floor(i/cols),cc=i%cols,x=40+cc*(cw+gap),y=top+r*(ch+gap),t0=.5+i*per,k=ease(seg(t,t0,t0+.5));if(k<=0)return;
    const cl=cd.c||PAL[i%PAL.length],on=i===cyc;
    c.save();c.translate(x+cw/2,y+ch/2);c.scale(.86+.14*k,.86+.14*k);c.globalAlpha=k;c.translate(-cw/2,-ch/2);
    box(c,0,0,cw,ch,16,on?cl+'22':'#0E1B2A',on?cl:cl+'66',on?3:1.8,{glow:on?22:0,gc:cl});box(c,0,0,cw,rows===1?8:6,3,cl);
    let ky;
    if(rows===1){T(c,cd.e,cw/2,58,{size:44,align:'center'});T(c,cd.h,cw/2,112,{font:DISP,size:fit(c,cd.h,cw-20,28,400,DISP),align:'center',color:cl,w:400});
      ky=150;if(cd.s){WT(c,cd.s,cw/2,146,cw-20,15,{size:12.5,color:C.muted,align:'center'});ky=180;}}
    else{T(c,cd.e,34,42,{size:34,align:'center'});T(c,cd.h,64,40,{font:DISP,size:fit(c,cd.h,cw-80,25,400,DISP),color:cl,w:400});
      if(cd.s)T(c,cd.s,64,66,{size:12.5,color:C.muted});ky=cd.s?96:84;}
    (cd.k||[]).forEach((kk,j)=>{const kt=t0+.5+j*.32,k2=ease(seg(t,kt,kt+.35));if(k2<=0)return;const yy=ky+j*(rows===1?37:34);
      box(c,14,yy-15,cw-28,29,14,cl+'1f',cl+'88',1.3,{alpha:k2});T(c,kk,cw/2,yy,{size:fit(c,kk,cw-48,15,600),w:600,align:'center',alpha:k2});});
    c.restore();});
  if(d.foot)label(c,d.foot,480,516,C.muted,{size:14,alpha:seg(t,endT-.6,endT)});
};

/* ── 인과 사슬: 사건이 "그래서"로 이어진다 ── */
TPL.chain=function(c,t,d){
  const ns=d.nodes,n=ns.length,col=colOf(d);kicker(c,d,col);
  const per=n<=4?n:Math.ceil(n/2),rows=Math.ceil(n/per),nw=Math.min(228,(880-(per-1)*56)/per),nh=n<=4?156:128;
  const t0=.6,step=Math.max(1.1,(d.dur-3.2)/n),endT=t0+step*n,newest=t<endT?Math.min(n-1,Math.floor((t-t0)/step)):-1,cyc=t>=endT?Math.floor((t-endT)/1.4)%n:-1,cur=newest>=0?newest:cyc;
  const gapX=per>1?(880-per*nw)/(per-1):0,topY=rows===1?170:100,rowGap=rows===1?0:(n<=6?106:96);
  const pos=i=>{const r=Math.floor(i/per),ci=i%per,cp=r%2?per-1-ci:ci;return{x:40+cp*(nw+gapX),y:topY+r*(nh+rowGap),r,cp};};
  for(let i=1;i<n;i++){const a=pos(i-1),b=pos(i),ts=t0+i*step-.7,k=ease(seg(t,ts,ts+.6));if(k<=0)continue;
    let x1,y1,x2,y2;
    if(a.r===b.r){const right=b.cp>a.cp;y1=y2=a.y+nh/2;x1=right?a.x+nw+4:a.x-4;x2=right?b.x-4:b.x+nw+4;}
    else{x1=x2=a.x+nw/2;y1=a.y+nh+4;y2=b.y-4;}
    arrow(c,x1,y1,lerp(x1,x2,k),lerp(y1,y2,k),col,3.2,12);
    if(d.links&&d.links[i-1]&&k>.6)pill(c,d.links[i-1],(x1+x2)/2,(y1+y2)/2+(a.r===b.r?-22:0),col,{alpha:seg(k,.6,1),size:12.5,fill:'#09131F'});}
  ns.forEach((nd,i)=>{const p=pos(i),tt=t0+i*step,k=ease(seg(t,tt,tt+.5));if(k<=0)return;const on=i===cur;
    c.save();c.translate(p.x+nw/2,p.y+nh/2);c.scale(.88+.12*k,.88+.12*k);c.globalAlpha=k;c.translate(-nw/2,-nh/2);
    box(c,0,0,nw,nh,14,on?col+'22':'#0E1B2A',on?col:C.line,on?2.8:1.6,{glow:on?20:0,gc:col});
    T(c,nd.e||'•',30,32,{size:28,align:'center'});T(c,nd.y,58,30,{font:DISP,size:fit(c,nd.y,nw-72,22,400,DISP),color:col,w:400});
    const nl=WT(c,nd.t,nw/2,nh<140?64:70,nw-22,20,{size:fit(c,nd.t,nw-22,17,700),w:700,align:'center'});
    if(nd.n)WT(c,nd.n,nw/2,(nh<140?64:70)+nl*20+8,nw-24,16,{size:12.5,color:C.muted,align:'center'});
    c.restore();});
  if(d.foot)label(c,d.foot,480,516,C.muted,{size:14,alpha:seg(t,endT-.5,endT+.2)});
};

/* ── 약도 지도: 한반도 외곽선 위에서 사건이 이동한다 ── */
const KOR=[[124.35,39.8],[124.4,40.15],[125.3,40.4],[126.3,41.1],[126.9,41.8],[128.2,41.4],[128.1,42.0],[129.2,42.25],[129.75,42.45],[130.1,42.95],[130.68,42.3],[130.3,42.2],[129.75,41.8],[129.4,40.65],[128.9,40.4],[128.2,40.0],[127.65,39.85],[127.45,39.15],[128.2,38.7],[128.6,38.2],[128.95,37.75],[129.15,37.4],[129.4,37.0],[129.4,36.4],[129.45,36.05],[129.35,35.5],[129.1,35.1],[128.7,35.0],[128.7,34.7],[127.9,34.7],[127.7,34.75],[127.3,34.5],[126.5,34.3],[126.35,34.8],[126.4,35.4],[126.5,35.7],[126.6,35.95],[126.2,36.6],[126.3,36.95],[126.85,36.95],[126.6,37.45],[126.3,37.75],[126.2,37.95],[125.5,37.7],[124.85,38.2],[125.3,38.7],[125.1,39.2],[125.6,39.6],[124.9,39.9]];
const CNCOAST=[[121.9,31.2],[121.2,32.1],[120.5,33.3],[119.2,34.7],[120.4,36.1],[122.5,37.4],[121.0,37.5],[119.3,37.2],[118.3,38.2],[117.7,39.0],[119.0,39.8],[120.7,40.4],[122.2,40.6],[121.6,39.6],[121.2,38.9],[122.3,39.5],[123.5,39.8],[124.35,39.8]];
const JPN=[[130.9,33.9],[132,34.4],[134.5,34.7],[135.2,34.6],[136.9,34.4],[138.8,34.6],[140,35.2],[140.9,35.7],[141.5,38],[141.9,39.5],[141.4,41.3],[140.3,41],[139.9,39.7],[139.4,38.2],[137.3,37.2],[136.7,36.7],[135.6,35.6],[133.5,35.5],[132,35.4],[131,34.4]];
const PLACES={'국내성':[126.19,41.13,'l'],'평양':[125.75,39.02,'l'],'한성':[127.0,37.55,'r'],'한양':[127.0,37.55,'r'],'서울':[127.0,37.55,'r'],'웅진':[127.12,36.45,'r'],'사비':[126.91,36.28,'l'],'경주':[129.21,35.84,'r'],
  '관산성':[127.6,36.3,'r'],'전주':[127.15,35.82,'l'],'송악':[126.55,37.97,'l'],'철원':[127.31,38.15,'r'],'구미(일리천)':[128.35,36.1,'r'],'귀주':[125.25,39.95,'l'],'강화도':[126.4,37.72,'l'],'처인성':[127.25,37.23,'r'],
  '충주':[127.93,36.99,'r'],'진도':[126.25,34.45,'l'],'제주':[126.55,33.45,'r'],'부산':[129.04,35.1,'r'],'한산도':[128.45,34.77,'r'],'진주':[128.11,35.18,'l'],'행주':[126.8,37.6,'l'],'울돌목':[126.3,34.58,'l'],'노량':[127.85,34.93,'r'],
  '의주':[124.55,40.2,'l'],'고부':[126.85,35.57,'l'],'논산':[127.1,36.2,'l'],'공주(우금치)':[127.12,36.47,'r'],
  '상하이':[121.47,31.23,'r'],'충칭':[106.55,29.56,'r'],'도쿄':[139.7,35.68,'l'],'간도':[129.0,42.5,'r'],'하얼빈':[126.6,45.75,'r']};
TPL.map=function(c,t,d){
  const col=colOf(d),asia=d.view==='asia';kicker(c,d,col);
  const lon0=asia?104:123.6,lon1=asia?142:131.4,lat0=asia?27:33,lat1=asia?46.5:43.3,bx=28,by=70,bw=520,bh=440,k0=Math.cos(37*Math.PI/180);
  const sc=Math.min(bw/((lon1-lon0)*k0),bh/(lat1-lat0)),ox=bx+(bw-(lon1-lon0)*k0*sc)/2,oy=by+(bh-(lat1-lat0)*sc)/2;
  const P=(lo,la)=>[ox+(lo-lon0)*k0*sc,oy+(lat1-la)*sc];
  if(asia){poly(c,CNCOAST.map(p=>P(...p)),'#335B7C',2,{dash:[5,5]});poly(c,JPN.map(p=>P(...p)),'#2E5A7D',2,{close:true,fill:'#0F2234'});
    label(c,'중국',...P(112,36),C.dim,{size:15});label(c,'일본',...P(137.5,38.5),C.dim,{size:14});label(c,'만주',...P(125,43.8),C.dim,{size:14});}
  poly(c,KOR.map(p=>P(...p)),'#3C7AA6',2.4,{close:true,fill:'#12283C'});
  if(!asia){label(c,'동해',...P(130.5,37.6),'#3E5E7C',{size:15});label(c,'황해',...P(124.3,36.2),'#3E5E7C',{size:15});
    poly(c,[P(124.4,38),P(129.6,38)],'#3E5E7C',1,{dash:[3,6]});label(c,'38°',...P(129.9,38.15),'#3E5E7C',{size:11});}
  const st=d.steps,m=st.length,t0=.5,sd=(d.dur-1.8)/m,cur=clamp(Math.floor((t-t0)/sd),0,m-1),started=t>=t0;
  const shown={};
  st.forEach((s,i)=>{if(i>cur||!started)return;(s.pins||[]).forEach(p=>{const nm=Array.isArray(p)?p[0]:p;shown[nm]={e:Array.isArray(p)?p[1]:null,i,c:Array.isArray(p)&&p[2]?p[2]:col,l:Array.isArray(p)?p[3]:null};});});
  st.forEach((s,i)=>{(s.arrows||[]).forEach(a=>{const ts=t0+i*sd+.5;const k=i<cur?1:ease(seg(t,ts,ts+sd*.55));if(k<=0||i>cur)return;
    const A=PLACES[a[0]],B=PLACES[a[1]];if(!A||!B)return;const pa=P(A[0],A[1]),pb=P(B[0],B[1]);const cl=a[3]||col;
    arrow(c,pa[0],pa[1],lerp(pa[0],pb[0],k),lerp(pa[1],pb[1],k),cl,3.4,12);
    if(a[2]&&k>.5)pill(c,a[2],(pa[0]+pb[0])/2+(asia?0:(pb[0]<pa[0]?-70:70)),(pa[1]+pb[1])/2,cl,{alpha:seg(k,.5,1),size:12,fill:'#09131F'});});});
  Object.keys(shown).forEach(nm=>{const pl=PLACES[nm];if(!pl)return;const [x,y]=P(pl[0],pl[1]),o=shown[nm],isCur=o.i===cur,pulse=isCur?1+.25*Math.sin(t*5):1;
    dot(c,x,y,(asia?6:7)*pulse,o.c,{glow:isCur?18:6,stroke:'#fff',lw:1.5});
    if(o.e)T(c,o.e,x,y-(asia?18:20),{size:asia?18:21,align:'center'});
    const right=(o.l||pl[2])==='r';pill(c,nm,x+(right?14:-14)+(right?1:-1)*(nm.length*3.6),y+(o.e?6:0),o.c,{size:12.5,fill:'#09131F',alpha:.96});});
  // 오른쪽 단계 목록
  const lx=574;
  st.forEach((s,i)=>{const on=i===cur&&started,done=i<cur&&started;const yy=72+i*(Math.min(88,400/m));
    c.save();c.globalAlpha=started&&i<=cur?1:.28;
    dot(c,lx+14,yy+14,14,on?col:'#10202F',{stroke:col,lw:2});T(c,String(i+1),lx+14,yy+15,{size:14,w:700,align:'center',color:on?'#09131F':col});
    T(c,s.y,lx+40,yy+14,{font:DISP,size:fit(c,s.y,300,19,400,DISP),color:on?col:C.muted,w:400});
    WT(c,s.cap,lx+40,yy+38,336,17,{size:14.5,w:on?600:500,color:on?C.text:C.muted});c.restore();});
  if(d.foot)label(c,d.foot,480,522,C.dim,{size:12});
};

/* ── 퀴즈: 문제 → 생각 시간 → 정답 공개 ── */
TPL.quiz=function(c,t,d){
  const col=colOf(d),its=d.items,m=its.length,slot=d.dur/m,i=Math.min(m-1,Math.floor(t/slot)),lt=t-i*slot,q=its[i],rev=slot*.6;
  kicker(c,d,col);label(c,`Q${i+1} / ${m}`,912,30,col,{size:14,align:'right'});
  const qk=ease(seg(lt,0,.5));c.save();c.globalAlpha=qk;
  box(c,48,78,864,98,16,'#0E1B2A',col+'88',2);
  WT(c,q.q,480,127-((wrap(c,q.q,800,`700 22px ${SANS}`).length-1)*14),800,28,{size:22,w:700,align:'center'});c.restore();
  const cw=424,chh=70,gx=16;
  q.ch.forEach((ct,j)=>{const x=48+(j%2)*(cw+gx),y=200+Math.floor(j/2)*(chh+14),k=ease(seg(lt,.5+j*.18,1+j*.18));if(k<=0)return;
    const ok=j===q.a,isRev=lt>=rev,good=isRev&&ok,dim=isRev&&!ok;
    c.save();c.globalAlpha=k*(dim?.35:1);box(c,x,y+(1-k)*10,cw,chh,14,good?'rgba(123,224,127,.18)':'#0E1B2A',good?'#7BE07F':C.line,good?3:1.6,{glow:good?20:0,gc:'#7BE07F'});
    dot(c,x+30,y+chh/2+(1-k)*10,15,good?'#7BE07F':'#10202F',{stroke:good?'#7BE07F':col,lw:2});T(c,String('①②③④'[j]),x+30,y+chh/2+1+(1-k)*10,{size:16,w:700,align:'center',color:good?'#09131F':col});
    WT(c,ct,x+54,y+chh/2+(1-k)*10-(wrap(c,ct,cw-70,`600 16px ${SANS}`).length-1)*9,cw-70,18,{size:16,w:600});
    if(good)T(c,'✅',x+cw-26,y+chh/2,{size:22,align:'center'});c.restore();});
  if(lt<rev){const k=1-lt/rev;box(c,48,360,864,8,4,'#10202F');box(c,48,360,864*k,8,4,k>.3?col:'#FF7A8A');label(c,'생각해 보세요 · '+Math.ceil(rev-lt)+'초',480,386,C.muted,{size:13});}
  else{const k=ease(seg(lt,rev,rev+.5));c.save();c.globalAlpha=k;box(c,48,372,864,128,16,'rgba(123,224,127,.07)','#7BE07F66',1.6);
    T(c,'정답 '+'①②③④'[q.a],72,398,{size:18,w:700,color:'#7BE07F'});WT(c,q.why,72,428,816,22,{size:15.5,color:C.text,w:500});c.restore();}
};

/* ── 두음 암기: 첫 글자가 튀어나오고 풀이 카드가 붙는다 ── */
TPL.acro=function(c,t,d){
  const rows=d.rows,m=rows.length,slot=d.dur/m,ri=Math.min(m-1,Math.floor(t/slot)),lt=t-ri*slot,row=rows[ri],col=colOf(d);kicker(c,d,col);
  label(c,row.name,480,92,C.muted,{size:16});
  const n=row.items.length,sp=Math.min(196,872/n),x0=480-(n-1)*sp/2;
  row.items.forEach((it,i)=>{const tt=.3+i*.6,k=seg(lt,tt,tt+.5),x=x0+i*sp,cl=PAL[i%PAL.length];
    if(k>0){const s=k<1?1+.4*Math.sin(k*Math.PI):1;c.save();c.translate(x,206);c.scale(s,s);c.globalAlpha=Math.min(1,k*2);
      T(c,it[0],0,0,{font:DISP,size:118,align:'center',color:cl,w:400});c.restore();}
    const ck=ease(seg(lt,tt+.5,tt+1));if(ck>0){c.save();c.globalAlpha=ck;c.translate(0,(1-ck)*14);
      box(c,x-sp/2+8,296,sp-16,168,14,'#0E1B2A',cl+'99',1.8);T(c,it[1],x,330,{size:fit(c,it[1],sp-34,19,700),w:700,align:'center'});
      WT(c,it[2],x,364,sp-34,18,{size:13.5,color:C.muted,align:'center'});c.restore();}});
  const pk=seg(lt,slot*.72,slot*.8);if(pk>0){const pu=1+.04*Math.sin(t*7);c.save();c.globalAlpha=pk;c.translate(480,498);c.scale(pu,pu);
    T(c,`소리 내어 세 번!  “${row.k}”`,0,0,{size:17,w:700,align:'center',color:col});c.restore();}
};

/* ── SNS 프로필: 인물을 한 줄 게시물로 ── */
TPL.profile=function(c,t,d){
  const ps=d.people,n=ps.length,col=colOf(d);kicker(c,d,col);
  const cw=Math.min(284,(880-(n-1)*18)/n),ch=392,x0=480-(n*cw+(n-1)*18)/2;
  ps.forEach((p,i)=>{const t0=.4+i*.7,k=ease(seg(t,t0,t0+.5));if(k<=0)return;const cl=PAL[(i+d.u)%PAL.length],x=x0+i*(cw+18),y=96;
    c.save();c.translate(x+cw/2,y+ch/2);c.scale(.9+.1*k,.9+.1*k);c.globalAlpha=k;c.translate(-cw/2,-ch/2);
    box(c,0,0,cw,ch,18,'#0E1B2A',cl+'88',1.8);
    dot(c,40,44,26,cl+'33',{stroke:cl,lw:2});T(c,p.e,40,45,{size:28,align:'center'});
    T(c,p.n,76,34,{size:fit(c,p.n,cw-92,17,700),w:700});T(c,p.h,76,56,{size:12.5,color:C.dim,font:MONO});
    const nl=WT(c,p.t,18,102,cw-36,24,{size:16.5,w:500});
    let ty=102+nl*24+8,tx=18;(p.tags||[]).forEach(tg=>{const w=pill(c,tg,tx+10,ty,cl,{size:12,pad:14});tx+=w+6;if(tx>cw-40){tx=18;ty+=28;}});
    const lk=Math.floor(clamp((t-t0-.5)/1.4)*(p.likes||1200));T(c,'❤ '+lk.toLocaleString('ko-KR'),18,ch-110,{size:13.5,color:'#FF7A8A',w:600});
    const rk=ease(seg(t,t0+2.2,t0+2.8));if(rk>0){c.save();c.globalAlpha=rk;box(c,12,ch-90,cw-24,78,12,cl+'18',cl+'66',1.3);
      T(c,'💡 진짜 내용',24,ch-74,{size:12,color:cl,w:700});WT(c,p.real,24,ch-52,cw-48,17,{size:13,color:C.text});c.restore();}
    c.restore();});
};

/* ── 비교: 헷갈리는 두 개를 마주 세운다 ── */
TPL.compare=function(c,t,d){
  const ps=d.pairs,m=ps.length,slot=d.dur/m,i=Math.min(m-1,Math.floor(t/slot)),lt=t-i*slot,p=ps[i],col=colOf(d);kicker(c,d,col);
  if(m>1)label(c,`${i+1} / ${m}`,912,30,col,{size:13,align:'right'});
  T(c,p.cap,480,96,{size:18,w:700,align:'center',color:C.muted});
  const ek=ease(seg(lt,0,.5));
  [[p.a,48,PAL[0]],[p.b,512,PAL[1]]].forEach(([s,x,cl],si)=>{c.save();c.globalAlpha=ek;c.translate(si?(1-ek)*40:-(1-ek)*40,0);
    box(c,x,118,400,372,18,'#0E1B2A',cl+'99',2);box(c,x,118,400,8,4,cl);
    T(c,s.e,x+46,172,{size:40,align:'center'});T(c,s.h,x+86,170,{font:DISP,size:fit(c,s.h,290,30,400,DISP),color:cl,w:400});
    s.items.forEach((it,j)=>{const kt=.7+j*.55+si*.25,k=ease(seg(lt,kt,kt+.4));if(k<=0)return;const yy=232+j*62;
      c.save();c.globalAlpha=k;dot(c,x+30,yy+8,6,cl);WT(c,it,x+48,yy+8-(wrap(c,it,326,`600 17px ${SANS}`).length-1)*10,326,22,{size:17,w:600});c.restore();});
    c.restore();});
  const vk=ease(seg(lt,.3,.8));c.save();c.globalAlpha=vk;dot(c,480,304,30,'#09131F',{stroke:C.dim,lw:2});T(c,'VS',480,305,{font:DISP,size:22,align:'center',color:C.text});c.restore();
};

/* ── 플레이어용: 데이터 → 장면 ── */
function buildScenes(list){list.forEach(d=>{S.push(Object.assign({still:d.dur*.82},d,{draw:(c,t)=>TPL[d.type](c,t,d)}));});}

/* ── 영토 변화 지도: 시대별 스냅숏(TERR)을 서로 겹쳐 바꿔 그린다 ──
   영역 다각형은 바다까지 넉넉히 잡고, 육지(대륙+한반도) 모양으로 잘라 그린다. 경계는 교과서 지도를 단순화한 약도. */
const MAINLAND=[[112,30],[121.9,31.2],[121.2,32.1],[120.5,33.3],[119.2,34.7],[120.4,36.1],[122.5,37.4],[121.0,37.5],[119.3,37.2],[118.3,38.2],[117.7,39.0],[119.0,39.8],[120.7,40.4],[122.2,40.6],[121.6,39.6],[121.2,38.9],[122.3,39.5],[123.5,39.8],[124.35,39.8],
  [124.4,40.15],[125.3,40.4],[126.3,41.1],[126.9,41.8],[128.2,41.4],[128.1,42.0],[129.2,42.25],[129.75,42.45],[130.1,42.95],[130.68,42.3],[131.2,42.6],[131.9,43.0],[132.4,42.85],[133.1,42.7],[134.5,43.4],[136,44.5],[137.5,46],[138.5,47.5],[138.5,52],[112,52]];
const JEJU=[[126.15,33.3],[126.3,33.5],[126.6,33.56],[126.95,33.47],[126.9,33.26],[126.5,33.2]];
const KYUSHU=[[129.6,33.4],[130.2,33.9],[131.0,33.95],[131.9,33.3],[131.5,32.0],[131.0,31.3],[130.2,31.3],[129.9,32.6]];
function terrProj(bx){const lon0=117,lon1=134,lat0=32.8,lat1=47.5,k0=Math.cos(40*Math.PI/180);
  const sc=Math.min(bx.w/((lon1-lon0)*k0),bx.h/(lat1-lat0)),ox=bx.x+(bx.w-(lon1-lon0)*k0*sc)/2,oy=bx.y+(bx.h-(lat1-lat0)*sc)/2;
  return (lo,la)=>[ox+(lo-lon0)*k0*sc,oy+(lat1-la)*sc];}
function pathOf(c,P,pts){pts.forEach((p,i)=>{const q=P(p[0],p[1]);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]);});c.closePath();}
function chaikin(pts,n=2){let a=pts;for(let r=0;r<n;r++){const b=[];a.forEach((p,i)=>{const q=a[(i+1)%a.length];b.push([.75*p[0]+.25*q[0],.75*p[1]+.25*q[1]],[.25*p[0]+.75*q[0],.25*p[1]+.75*q[1]]);});a=b;}return a;}
const SMOOTH=new WeakMap();const smooth=p=>{let s=SMOOTH.get(p);if(!s){s=chaikin(p);SMOOTH.set(p,s);}return s;};
function TS(c,s,x,y,o={}){c.save();c.font=`${o.w||700} ${o.size||15}px ${o.font||SANS}`;c.textAlign=o.align||'center';c.textBaseline='middle';
  if(o.alpha!=null)c.globalAlpha*=o.alpha;c.lineJoin='round';c.lineWidth=o.lw||4;c.strokeStyle='rgba(8,16,26,.9)';c.strokeText(s,x,y);c.fillStyle=o.color||'#fff';c.fillText(s,x,y);c.restore();}
function drawTerritory(c,A,B,k,bx){
  const P=terrProj(bx),sz=Math.max(.75,Math.min(1.35,bx.h/450));
  c.save();c.beginPath();c.roundRect(bx.x,bx.y,bx.w,bx.h,14);c.clip();
  c.fillStyle='#071220';c.fillRect(bx.x,bx.y,bx.w,bx.h);
  c.beginPath();pathOf(c,P,MAINLAND);pathOf(c,P,KOR);pathOf(c,P,JEJU);pathOf(c,P,KYUSHU);pathOf(c,P,JPN);c.fillStyle='#1B3147';c.fill();c.strokeStyle='#3A6688';c.lineWidth=1.1;c.stroke();
  c.save();c.beginPath();pathOf(c,P,MAINLAND);pathOf(c,P,KOR);pathOf(c,P,JEJU);c.clip();
  [[A,1-k],[B,k]].forEach(([s,a])=>{if(!s||a<=.001)return;s.regs.forEach(r=>{c.save();c.beginPath();pathOf(c,P,r.sharp?r.p:smooth(r.p));
    c.globalAlpha=a*(r.hi?.78:.5);c.fillStyle=r.c;c.fill();c.globalAlpha=a*.95;c.strokeStyle=r.c;c.lineWidth=r.hi?2.2:1.4;if(r.hi)c.setLineDash([5,4]);c.stroke();c.restore();});});
  c.restore();
  c.beginPath();pathOf(c,P,KOR);c.strokeStyle='#4A7FA8';c.lineWidth=1.4;c.stroke();
  [[A,1-k],[B,k]].forEach(([s,a])=>{if(!s||a<=.02)return;
    (s.lines||[]).forEach(l=>{poly(c,l.p.map(q=>P(q[0],q[1])),l.c||'#fff',(l.w||2.6)*sz,{dash:l.dash?[7,5]:null,alpha:a});
      if(l.at){const [x,y]=P(l.at[0],l.at[1]);TS(c,l.n,x,y,{size:12*sz,color:l.c||'#fff',alpha:a});}});
    s.regs.forEach(r=>{if(!r.at)return;const [x,y]=P(r.at[0],r.at[1]);TS(c,r.n,x,y,{size:(r.fs||16)*sz,w:800,alpha:a});
      if(r.s)TS(c,r.s,x,y+17*sz,{size:11.5*sz,w:600,color:'#DCE6F0',alpha:a*.95,lw:3});});
    (s.pins||[]).forEach(p=>{const [x,y]=P(p[1],p[2]);dot(c,x,y,4.2*sz,'#fff',{alpha:a,stroke:'#09131F',lw:1.6});
      TS(c,p[0],x+(p[3]==='l'?-7:7)*sz,y,{size:12*sz,w:700,align:p[3]==='l'?'right':'left',color:'#FFF6D8',alpha:a,lw:3});});});
  c.restore();
}
TPL.territory=function(c,t,d){
  const col=colOf(d);kicker(c,d,col);
  const sn=d.snaps.map(id=>TERR[id]),m=sn.length,slot=d.dur/m,i=Math.min(m-1,Math.floor(t/slot)),lt=t-i*slot,k=ease(seg(lt,0,1.1));
  const prev=i>0?sn[i-1]:null,cur=sn[i];
  drawTerritory(c,prev,cur,prev?k:1,{x:24,y:72,w:528,h:450});
  const x=576,a=ease(seg(lt,.15,.75));c.save();c.globalAlpha=a;
  T(c,cur.y,x,102,{font:DISP,size:fit(c,cur.y,350,40,400,DISP),color:col,w:400});
  T(c,cur.t,x,146,{size:fit(c,cur.t,350,22,800),w:800});
  const nl=WT(c,cur.d,x,180,352,22,{size:15,color:C.muted});
  const regs=cur.regs.filter(r=>r.n&&r.legend!==false),ly=180+nl*22+20;
  regs.forEach((r,j)=>{const cx=x+(j%2)*178,cy=ly+Math.floor(j/2)*26;box(c,cx,cy-7,14,14,3,r.c,null,0,{alpha:r.hi?1:.85});T(c,r.n,cx+22,cy,{size:13.5,w:600});});
  c.restore();
  if(m>1){const sx=590,ex=916,yy=486;poly(c,[[sx,yy],[ex,yy]],C.line,3);poly(c,[[sx,yy],[lerp(sx,ex,(i+clamp(lt/slot))/(m-1||1)),yy]],col,3,{alpha:.7});
    sn.forEach((s,j)=>{const xx=lerp(sx,ex,j/(m-1)),on=j===i;dot(c,xx,yy,on?8:5,on?col:'#10202F',{stroke:col,lw:2});
      label(c,s.sy||s.y,xx,yy+(m>6&&j%2?-20:20),on?col:C.dim,{size:11});});}
};
