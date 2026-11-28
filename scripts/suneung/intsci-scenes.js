/* 통합과학 모션 노트 장면들 — build-motion.mjs 가 물리학Ⅰ 모션 노트의 플레이어 엔진 뒤에 붙인다(이 파일 → intsci-scenes-1.js → intsci-scenes-2.js 순서).
   전제: W, H, TAU, C, SANS, MONO, SERIF, DISP, UNITS, S, clamp, lerp, ease, seg, rnd, fm, T, arrow, poly, dot, box, axes, wavy, wl2rgb, label, M 이 이미 정의되어 있다.
   내용은 장 노트(content/is-*.mjs)에 있는 개념만 쓴다. 엔진·플레이어의 전역 이름(frame, go, t, cnt, idx, Q, $, loop, speed, stage, render …)은 쓰지 않는다.
   조각 파일의 최상위 이름은 접두사를 붙인다(-1: SA_, -2: SB_). */
const IC=['#F4B544','#B69CFF','#4FD1E8','#7BE07F','#FF9A4D','#FF7A8A'];   // 단원 색(UNITS 와 같은 순서)
const ra=(h,a)=>`rgba(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)},${a})`;
const fin=(t,a,d=.5)=>ease(seg(t,a,a+d));                    // a초부터 d초 동안 나타남(0→1)
const win=(t,a,b,f=.35)=>clamp(Math.min((t-a)/f,(b-t)/f));    // a~b 동안 켜졌다 꺼짐(앞뒤 f초 페이드)
function rr(c,x,y,w,h,r,fill,stroke,lw,a){box(c,x,y,w,h,r,fill,stroke,lw||2,a==null?{}:{alpha:a});}
function K(c,s,x,y,o={}){T(c,s,x,y,Object.assign({size:17,align:'center'},o));}       // 가운데 정렬 글자
function kw(c,s,size,w=500,font=SANS){c.save();c.font=`${w} ${size}px ${font}`;const v=c.measureText(s).width;c.restore();return v;}
function arc(c,x,y,r,a0,a1,col,w=6,o={}){c.save();c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';if(o.alpha!=null)c.globalAlpha*=o.alpha;c.beginPath();c.arc(x,y,r,a0,a1);c.stroke();c.restore();}
function arw(c,x1,y1,x2,y2,col,w=2.5,hd=10,a=1){if(a<=0)return;c.save();c.globalAlpha*=a;arrow(c,x1,y1,x2,y2,col,w,hd);c.restore();}
function chk(c,x,y,s,col,a=1){if(a<=0)return;c.save();c.globalAlpha*=a;poly(c,[[x-s,y],[x-s*.3,y+s*.7],[x+s,y-s*.8]],col,3.5);c.restore();}   // ✓
function crs(c,x,y,s,col,a=1){if(a<=0)return;c.save();c.globalAlpha*=a;poly(c,[[x-s,y-s],[x+s,y+s]],col,3.5);poly(c,[[x+s,y-s],[x-s,y+s]],col,3.5);c.restore();}   // ✕
function flow(c,pts,tt,col,n=4,r=5,sp=.25){ // 경로를 따라 흐르는 입자(물질·에너지·사람·돈의 이동)
  poly(c,pts,'rgba(150,175,205,.22)',2,{dash:[2,5]});
  const L=[];let tot=0;for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);L.push(d);tot+=d;}
  for(let k=0;k<n;k++){let q=((tt*sp+k/n)%1)*tot,i=0;while(i<L.length-1&&q>L[i]){q-=L[i];i++;}
    const u=q/L[i],x=lerp(pts[i][0],pts[i+1][0],u),y=lerp(pts[i][1],pts[i+1][1],u);dot(c,x,y,r,col,{glow:8});}}
function smooth(P,n=14){const o=[];for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];   // 점들을 지나는 부드러운 곡선
  for(let k=0;k<n;k++){const u=k/n,u2=u*u,u3=u2*u,f=j=>.5*(2*p1[j]+(p2[j]-p0[j])*u+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*u2+(3*p1[j]-p0[j]-3*p2[j]+p3[j])*u3);o.push([f(0),f(1)]);}}
  o.push(P[P.length-1]);return o;}
function para(c,s,x,y,maxW,lh,o={}){ // 긴 글을 maxW 에 맞춰 여러 줄로(띄어쓰기에서 끊음) → 줄 수
  const size=o.size||15,w=o.w||500,words=String(s).split(' '),lines=[];let cur='';
  words.forEach(wd=>{const nx=cur?cur+' '+wd:wd;if(cur&&kw(c,nx,size,w,o.font)>maxW){lines.push(cur);cur=wd;}else cur=nx;});if(cur)lines.push(cur);
  lines.forEach((l,i)=>T(c,l,x,y+i*lh,o));return lines.length;}
function bar(c,x,y,w,h,k,col,o={}){ // 가로 막대(k = 0~1 채움)
  box(c,x,y,w,h,h/2,'#0E1B2A',C.line,1.5);if(k>0)box(c,x,y,Math.max(h,w*clamp(k)),h,h/2,col,null,0,o);}

/* ───────── 0. 인트로 ───────── */
S.push({u:-1,ch:'시작',title:'수능 통합과학, 움직이며 정리하기',
  sub:'여섯 단원, 서른일곱 개 개념. 표·그래프·실험으로 나오는 장면을 움직여서 보여 줍니다.',
  fx:[{w:1,f:'Ⅰ 과학의 기초',n:'규모 · 단위 · 측정 · 신호'},{w:1,f:'Ⅱ 물질과 규칙성',n:'원소의 기원 · 주기율 · 결합'},{w:1,f:'Ⅲ 시스템과 상호작용',n:'지구시스템 · 역학 · 생명'},{w:1,f:'Ⅳ 변화와 다양성',n:'지질 시대 · 진화 · 화학 변화'},{w:1,f:'Ⅴ 환경과 에너지',n:'생태계 · 기후 · 발전'},{w:1,f:'Ⅵ 과학과 미래 사회',n:'감염병 · 빅데이터 · 인공지능'}],
  pts:['장면마다 <em>무엇이 원인이고 무엇이 결과인가</em>를 먼저 보세요. 통합과학 문항은 그 방향을 자료로 묻습니다.','재생 중에는 약 15초마다 다음 개념으로 넘어갑니다. 아래 막대를 눌러 원하는 개념으로 이동할 수 있어요.','페이지 아래 <em>한눈에 정리</em>에 단원별 핵심이 모여 있습니다.'],
  dur:14,still:5,
  draw(c,t){
    label(c,'6 UNITS · 37 CONCEPTS',480,46,C.dim,{size:14});
    const names=['과학의 기초','물질과 규칙성','시스템과 상호작용','변화와 다양성','환경과 에너지','과학과 미래 사회'],rom=['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ'];
    names.forEach((nm,i)=>{const col=i%3,row=Math.floor(i/3),x0=180+col*300,y0=150+row*220,k=fin(t,.2+i*.3,.7);c.save();c.globalAlpha=k;
      dot(c,x0,y0,58,'rgba(255,255,255,.03)',{stroke:ra(IC[i],.55),lw:1.6});
      if(i===0){[10,22,36,52].forEach((r,j)=>dot(c,x0,y0,r*(.9+.1*Math.sin(t*1.5+j)),null,{stroke:ra(IC[0],.9-j*.2),lw:2}));}
      else if(i===1){dot(c,x0,y0,10,IC[1]);for(let j=0;j<3;j++){const a=t*1.2+j*TAU/3,r=26+j*10;dot(c,x0,y0,r,null,{stroke:ra(IC[1],.3),lw:1});dot(c,x0+Math.cos(a)*r,y0+Math.sin(a)*r,4,'#E6EDF5');}}
      else if(i===2){dot(c,x0,y0,24,ra(IC[2],.25),{stroke:IC[2],lw:2});const a=t*.9;dot(c,x0+Math.cos(a)*44,y0+Math.sin(a)*44,6,'#E6EDF5');arc(c,x0,y0,44,a-1.2,a,ra(IC[2],.7),2);}
      else if(i===3){const P=smooth([[x0-44,y0+26],[x0-22,y0+10],[x0,y0+16],[x0+20,y0-12],[x0+44,y0-28]]);poly(c,P.slice(0,Math.max(2,Math.floor(P.length*clamp((t%5)/3.5)))),IC[3],3);[-44,-22,0,20,44].forEach((dx,j)=>dot(c,x0+dx,y0+[26,10,16,-12,-28][j],4,IC[3]));}
      else if(i===4){dot(c,x0,y0,16,IC[4],{glow:14+6*Math.sin(t*3)});for(let j=0;j<8;j++){const a=j*TAU/8+t*.4;poly(c,[[x0+Math.cos(a)*24,y0+Math.sin(a)*24],[x0+Math.cos(a)*40,y0+Math.sin(a)*40]],IC[4],2.5);}}
      else{for(let j=0;j<5;j++){const a=j*TAU/5-Math.PI/2,x1=x0+Math.cos(a)*36,y1=y0+Math.sin(a)*36;poly(c,[[x0,y0],[x1,y1]],ra(IC[5],.5),1.5);dot(c,x1,y1,6,(Math.floor(t*2)%5===j)?'#E6EDF5':IC[5]);}dot(c,x0,y0,9,IC[5]);}
      c.restore();c.save();c.globalAlpha=k;T(c,rom[i],x0-92,y0+86,{font:DISP,size:26,color:IC[i],align:'center',w:400});
      T(c,nm,x0-70,y0+86,{size:16,w:600});c.restore();});
  }});
