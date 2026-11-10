/* 수능 영어 모션 노트 장면들 — build-motion.mjs 가 물리학Ⅰ 모션 노트의 플레이어 엔진 뒤에 붙인다.
   전제: C, UNITS, S, clamp, lerp, ease, seg, rnd, fm, T, arrow, poly, dot, box, axes, label, M 이 이미 정의되어 있다.
   그림 속 영어 문장은 장 노트(content/en-1·en-2.mjs, quick-english.mjs)에 직접 만든 예문을 그대로 또는 짧게 줄여 쓴 것이다.
   fx 칸은 모두 w:1 — 수식 서식(fm)이 영어 글자를 기울이지 않게. 엔진·플레이어의 전역 이름(frame, go, t, cnt …)은 쓰지 않는다. */
const EN=['#4FD1E8','#F4B544','#7BE07F','#FF7A8A','#B69CFF'];
const K={ok:'#7BE07F',no:'#FF6B6B',amb:'#F4B544',cy:'#4FD1E8',pk:'#FF7A8A',vi:'#B69CFF',card:'#0E1B2A'};
function rr(c,x,y,w,h,r,fill,stroke,lw,o){box(c,x,y,w,h,r,fill,stroke,lw||2,o||{});}
function tw(c,s,size,w,font){c.save();c.font=`${w||500} ${size}px ${font||SANS}`;const v=c.measureText(s).width;c.restore();return v;}
/* 한 줄 글자: {…} 강조(굵게·o.hl 색), […] 표시(보통 굵기·o.mk 색). o.dry면 그리지 않고 자리만.
   돌려줌 {x0,x1,w,spans,marks} — 구간마다 {x0,x1,y,col} */
function rich(c,str,x,y,o={}){
  const size=o.size||18,font=o.font||SANS,toks=String(str).split(/(\{[^}]*\}|\[[^\]]*\])/).filter(s=>s!=='');
  const fnt=b=>`${b?(o.hw||700):(o.w||500)} ${size}px ${font}`;
  c.save();c.textBaseline='middle';c.textAlign='left';if(o.alpha!=null)c.globalAlpha*=o.alpha;
  const it=toks.map(s=>{const k=s[0]==='{'?1:s[0]==='['?2:0,txt=k?s.slice(1,-1):s;c.font=fnt(k===1);return {k,txt,w:c.measureText(txt).width};});
  const tot=it.reduce((a,b)=>a+b.w,0);let cx=o.align==='center'?x-tot/2:o.align==='right'?x-tot:x;
  const x0=cx,spans=[],marks=[];
  it.forEach(q=>{let col=o.color||C.text;
    if(q.k===1){col=Array.isArray(o.hl)?(o.hl[spans.length]||K.amb):(o.hl||K.amb);spans.push({x0:cx,x1:cx+q.w,y,col});}
    else if(q.k===2){col=Array.isArray(o.mk)?(o.mk[marks.length]||col):(o.mk||col);marks.push({x0:cx,x1:cx+q.w,y,col});}
    if(!o.dry&&q.txt){c.font=fnt(q.k===1);c.fillStyle=col;c.fillText(q.txt,cx,y);}
    cx+=q.w;});
  c.restore();return {x0,x1:cx,w:tot,spans,marks};}
function mk(c,x,y,good,s=9,a=1){if(a<=0)return;
  if(good)poly(c,[[x-s*.85,y],[x-s*.25,y+s*.62],[x+s*.9,y-s*.72]],K.ok,3,{alpha:a});
  else{poly(c,[[x-s*.7,y-s*.7],[x+s*.7,y+s*.7]],K.no,3,{alpha:a});poly(c,[[x+s*.7,y-s*.7],[x-s*.7,y+s*.7]],K.no,3,{alpha:a});}}
function strike(c,x0,x1,y,k,col,w){k=clamp(k);if(k<=0)return;poly(c,[[x0-3,y],[lerp(x0-3,x1+3,k),y]],col||K.no,w||3);}
function pill(c,s,x,y,col,o={}){const size=o.size||15,font=o.font||SANS,wt=o.w||600,pad=o.pad==null?11:o.pad;
  const w=tw(c,s,size,wt,font)+pad*2,h=size+12,x0=o.align==='left'?x:o.align==='right'?x-w:x-w/2,a=o.alpha==null?1:o.alpha;
  if(a>0){box(c,x0,y-h/2,w,h,h/2,o.fill||col+'22',col,1.5,{alpha:a});T(c,s,x0+w/2,y,{size,color:o.tc||col,w:wt,font,align:'center',alpha:a});}
  return {x0,x1:x0+w,w,h};}
function head(c,x,y,a,col,s=11,al){c.save();if(al!=null)c.globalAlpha*=al;c.fillStyle=col;c.beginPath();c.moveTo(x,y);
  c.lineTo(x-s*Math.cos(a-.45),y-s*Math.sin(a-.45));c.lineTo(x-s*Math.cos(a+.45),y-s*Math.sin(a+.45));c.closePath();c.fill();c.restore();}
/* 휘어진 화살표: b > 0 이면 진행 방향의 왼쪽(화면에서 오른쪽으로 갈 때 위)으로 휜다. o.k = 그려진 비율 */
function bend(c,x1,y1,x2,y2,b,col,o={}){const k=o.k==null?1:clamp(o.k);if(k<=.01)return;
  const L=Math.hypot(x2-x1,y2-y1)||1,qx=(x1+x2)/2+(y2-y1)/L*b,qy=(y1+y2)/2-(x2-x1)/L*b;
  const P=u=>[(1-u)*(1-u)*x1+2*(1-u)*u*qx+u*u*x2,(1-u)*(1-u)*y1+2*(1-u)*u*qy+u*u*y2],pts=[];
  for(let i=0;i<=30;i++)pts.push(P(i/30*k));
  poly(c,pts,col,o.w||2.5,{dash:o.dash,alpha:o.alpha});
  if(o.head!==false){const dx=2*(1-k)*(qx-x1)+2*k*(x2-qx),dy=2*(1-k)*(qy-y1)+2*k*(y2-qy),e=pts[pts.length-1];head(c,e[0],e[1],Math.atan2(dy,dx),col,o.hs||11,o.alpha);}}
function bars(c,x,y,tt,col,on,a=1){if(a<=0)return;for(let i=0;i<5;i++){const h=on?5+13*Math.abs(Math.sin(tt*7+i*1.7)):4;box(c,x+i*6,y-h/2,3.5,h,1.75,col,null,0,{alpha:a*(on?1:.5)});}}
function hbox(c,sp,size,col,a){if(!sp||a<=0)return;rr(c,sp.x0-5,sp.y-size*.68,sp.x1-sp.x0+10,size*1.36,6,col+'24',col,1.6,{alpha:a});}
function ul(c,sp,col,dy,w,a){if(!sp||a<=0)return;poly(c,[[sp.x0,sp.y+dy],[lerp(sp.x0,sp.x1,clamp(a*1.4)),sp.y+dy]],col,w||2.5,{alpha:clamp(a*2)});}
function dbox(c,x,y,w,h,r,col,a=1,fill){if(a<=0)return;c.save();c.globalAlpha*=a;c.setLineDash([6,5]);c.beginPath();c.roundRect(x,y,w,h,r);
  if(fill){c.fillStyle=fill;c.fill();}c.strokeStyle=col;c.lineWidth=2;c.stroke();c.restore();}
function sign(c,x,y,v,a,gl){if(a<=0)return;const col=v>0?K.ok:K.no;dot(c,x,y,14,col+'26',{stroke:col,lw:2,alpha:a,glow:gl||0});
  poly(c,[[x-6,y],[x+6,y]],col,2.6,{alpha:a});if(v>0)poly(c,[[x,y-6],[x,y+6]],col,2.6,{alpha:a});}

/* ───────── 0. 인트로 ───────── */
S.push({u:-1,ch:'시작',title:'수능 영어, 움직이며 정리하기',
  sub:'다섯 묶음 열여섯 장면으로, 유형마다 답을 가르는 신호 하나를 움직여서 보여 줍니다.',
  fx:[{w:1,f:'Ⅰ 듣기',n:'1~17번 · 말 바꾸는 신호 · 시각 · 금액'},
      {w:1,f:'Ⅱ 대의·세부',n:'18~28번 · 결론의 자리 · 요지·주제·제목 · 도표'},
      {w:1,f:'Ⅲ 어법·어휘',n:'29~30번 · 수 일치 · 관계사 · 수동 · 반의어'},
      {w:1,f:'Ⅳ 빈칸·간접 쓰기',n:'31~40번 · 예측 · 순서 · 삽입 · 요약'},
      {w:1,f:'Ⅴ 장문',n:'41~45번 · 대명사 추적 · 네 칸 대조'}],
  pts:['장면마다 <em>신호 하나 → 답</em>을 보세요. Actually 뒤의 숫자, However 뒤의 결론, a 다음의 the처럼 단서 하나가 답을 정합니다.',
       '재생 중에는 약 15초마다 다음 장면으로 넘어갑니다. 아래 막대를 눌러 원하는 장면으로 바로 갈 수 있어요.',
       '페이지 아래 <em>한눈에 정리</em>에 단원별 핵심이 모여 있습니다.'],
  dur:14,still:4.5,
  draw(c,t){
    label(c,'5 UNITS · 16 SCENES',480,60,C.dim,{size:14});
    const names=['듣기','대의·세부','어법·어휘','빈칸·간접 쓰기','장문'],cx=[110,295,480,665,850],cy=236,R=72;
    for(let i=0;i<5;i++){const k=ease(seg(t,.1+i*.18,.9+i*.18)),x0=cx[i],col=EN[i];if(k<=0)continue;
      c.save();c.globalAlpha*=k;
      dot(c,x0,cy,R,'rgba(255,255,255,.03)',{stroke:col+'88',lw:1.6});
      c.beginPath();c.arc(x0,cy,R-3,0,TAU);c.clip();
      if(i===0){for(let j=0;j<11;j++){const env=1-Math.abs(j-5)/6.5,h=6+44*env*(.35+.65*Math.abs(Math.sin(t*2.6+j*.8)));box(c,x0-53+j*10,cy-h/2,6,h,3,col);}}
      else if(i===1){[[-34,92,0],[-12,80,1],[10,66,0],[32,86,1]].forEach(([dy,w,hi],j)=>{const ind=j===2?14:0;
          box(c,x0-46+ind,cy+dy-4,w-ind,8,4,hi?col:'#3A4D63',null,0,{alpha:hi?.6+.4*Math.sin(t*2.2+j):1});});
        bend(c,x0+48,cy-30,x0+36,cy-14,16,col,{w:2,hs:7});}
      else if(i===2){const ph=(Math.sin(t*1.6)+1)/2;
        dot(c,x0-40,cy,10,K.amb);dot(c,x0+40,cy,10,col);
        box(c,x0-18,cy-9,36,18,5,'#5E738B',null,0,{alpha:1-ph});
        c.save();c.strokeStyle=col;c.lineWidth=2;c.globalAlpha*=1-ph*.6;c.beginPath();c.arc(x0+4,cy,24,Math.PI*.72,Math.PI*1.28);c.stroke();
        c.beginPath();c.arc(x0-4,cy,24,-Math.PI*.28,Math.PI*.28);c.stroke();c.restore();
        poly(c,[[x0-30,cy+24],[x0+30,cy+24]],col,3,{alpha:ph});}
      else if(i===3){const sc=[2,0,1],k2=ease(clamp((Math.sin(t*1.3)+1)/2*1.5-.25)),sy=[-30,0,30];
        for(let j=0;j<3;j++){const y=cy+lerp(sy[sc[j]],sy[j],k2);box(c,x0-38,y-10,76,20,6,'#1E3247',col,1.5);box(c,x0-38,y-10,8,20,3,col);}}
      else{for(let j=0;j<6;j++)box(c,x0-48,cy-43+j*16,j===5?60:96,6,3,'#3A4D63');
        box(c,x0-48,cy-46,26,12,4,col);box(c,x0+12,cy+2,18,12,4,col+'AA');
        bend(c,x0+20,cy+2,x0-34,cy-34,26,col,{k:ease((t%3)/2),w:2,hs:7});}
      c.restore();
      c.save();c.globalAlpha*=k;
      T(c,['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ'][i],x0,cy+R+42,{font:DISP,size:32,color:col,align:'center',w:400});
      T(c,names[i],x0,cy+R+82,{size:19,align:'center',w:600});
      c.restore();}
  }});

/* ───────── Ⅰ-1 말 바꾸는 신호 ───────── */
S.push({u:0,ch:'숫자·조건 받아 적기',title:'말 바꾸는 신호 — 마지막 조건이 답',file:'01-listening.html',
  sub:'Actually · Wait · instead가 들리면 방금 적은 숫자에 줄을 긋고, 바뀐 뒤의 조건으로만 답을 정합니다.',
  fx:[{w:1,f:'Actually · Wait · instead · rather · except',n:'“실은… 잠깐! 대신 차라리 그거 빼고요” — 앞 조건을 바꾸는 표지'},
      {w:1,f:'신호가 들리면 → 방금 적은 숫자에 줄',n:'답은 대화가 끝난 뒤의 조건으로만'},
      {w:1,f:'점원이 말한 중간 합계 = 검산용',n:'그 뒤에 수량이 바뀌면 그 합계는 답이 아니다'}],
  pts:['처음 숫자를 답으로 두면 뒤에 나온 <em>수량 변경·할인</em>이 빠집니다.',
       '장소도 같습니다. 「도서관에서 보자」 뒤에 「비가 오니 카페로 바꾸자」가 나오면 <em>나중 장소</em>가 답입니다.',
       '이유(7번)도 <em>Actually · The thing is</em> 뒤가 진짜 이유이고, 앞 사정은 버려집니다.'],
  dur:16,still:14,
  draw(c,t){
    const B=[{s:'{Two} tickets for the {four o’clock} show, please.',hl:[K.cy,K.cy],at:.2},
             {s:'{Wait}, make it {three}.',hl:[K.amb,K.cy],at:3},
             {s:'{Actually}, make that the {six o’clock} show.',hl:[K.amb,K.cy],at:6.6}];
    const ys=[118,208,298],BX=66,FS=19,ends=[];
    B.forEach((b,i)=>{const a=ease(seg(t,b.at,b.at+.6)),y=ys[i];
      const m=rich(c,b.s,BX+20,y,{size:FS,hl:b.hl,dry:true}),w=m.w+40;ends.push({x:BX+w,y});
      if(a<=0)return;
      bars(c,24,y,t,C.muted,t>b.at&&t<b.at+1.8,a);
      rr(c,BX,y-28,w,56,18,'#132538','#3A5470',1.5,{alpha:a});
      rich(c,b.s,BX+20,y,{size:FS,hl:b.hl,alpha:a});
      if(i){const g=seg(t,b.at+.3,b.at+.6)*(1-seg(t,b.at+1.8,b.at+2.4));hbox(c,m.spans[0],FS,K.amb,g);}});
    // 받아 적는 메모
    const MX=600,MY=80,ma=ease(seg(t,.4,1));
    rr(c,MX,MY,320,240,14,K.card,C.line,1.5,{alpha:ma});
    for(let j=0;j<8;j++)dot(c,MX+22+j*39,MY,5,'#09131F',{stroke:C.dim,lw:2,alpha:ma});
    const rows=[{lab:'장수',y:165,old:'2',nw:'3',at:3},{lab:'시각',y:255,old:'4:00',nw:'6:00',at:6.6}];
    rows.forEach((r,j)=>{const a0=ease(seg(t,1.1,1.6)),k=ease(seg(t,r.at+1.3,r.at+1.9)),an=ease(seg(t,r.at+1.9,r.at+2.4));
      T(c,r.lab,MX+26,r.y,{size:17,color:C.muted,w:600,alpha:ease(seg(t,.6,1.1))});
      T(c,r.old,700,r.y,{size:30,w:700,alpha:a0*lerp(1,.42,k)});
      strike(c,700,700+tw(c,r.old,30,700),r.y,k,K.no,3);
      if(an>0){c.save();c.globalAlpha*=an;arrow(c,772,r.y,808,r.y,K.amb,2.5,9);c.restore();T(c,r.nw,820,r.y,{size:30,w:700,color:K.amb,alpha:an});}
      const e=ends[j+1],ka=ease(seg(t,r.at+.8,r.at+1.4));
      if(ka>0)bend(c,e.x+8,e.y,592,r.y,-14,K.amb,{k:ka,w:1.8,dash:[5,5],alpha:lerp(1,.35,seg(t,r.at+2.4,r.at+3)),hs:9});});
    const aa=ease(seg(t,9.6,10.2));
    if(aa>0){rr(c,MX,340,320,58,12,'rgba(123,224,127,.12)',K.ok,2,{alpha:aa});
      rich(c,'답 = 마지막 조건 {3장 · 6시}',MX+160,369,{size:20,align:'center',hl:K.ok,alpha:aa});}
    rich(c,'{Actually} · {Wait} · {instead} · {rather} · {except}',480,450,{size:19,align:'center',hl:K.amb,color:C.dim,alpha:ease(seg(t,10.8,11.6))});
    rich(c,'“{실은}… {잠깐}! {대신} {차라리} 그거 {빼고}요”',480,488,{size:19,align:'center',hl:K.amb,color:C.muted,alpha:ease(seg(t,11.3,12.1))});
  }});

/* ───────── Ⅰ-2 시각 past · to ───────── */
S.push({u:0,ch:'시각 표현',title:'시각 — past는 더하고, to는 뺀다',file:'01-listening.html',
  sub:'past는 그 시각에서 지난 만큼 더하고, to는 그 시각까지 남은 만큼 빼서 숫자로 바꿉니다.',
  fx:[{w:1,f:'a quarter = 15분 · half = 30분',n:'한 시간의 4분의 1 · 2분의 1'},
      {w:1,f:'a quarter past four = 4:15',n:'4시 + 15분'},
      {w:1,f:'ten to four = 3:50',n:'4시 − 10분'},
      {w:1,f:'a quarter to six = 5:45',n:'6시 15분 ✕ — to는 그 시각보다 앞'}],
  pts:['<em>to</em>는 기준 시각으로 다가가는 중이라 그 시각보다 <em>앞</em>입니다.',
       'fifteen · thirteen은 뒤 teen이 길고, fifty · thirty는 앞이 셉니다. 선지에 15와 50이 같이 있으면 그 자리가 함정입니다.',
       '지연·조기 도착은 들은 순서대로: 2:40 + 25분 = 3:05, 그보다 10분 일찍 = <em>2:55</em>.'],
  dur:17,still:15.5,
  draw(c,t){
    const P=[[4,15],[4,30],[4,-15],[4,-10],[6,-15]],T0=.4,PL=2.8;
    const i=clamp(Math.floor((t-T0)/PL),0,4),u=t-T0-i*PL,ph=P[i];
    const prev=i?P[i-1][0]*60+P[i-1][1]:240,ref=ph[0]*60,s=ease(seg(u,.6,1.6));
    const m=u<.6?lerp(prev,ref,ease(seg(u,0,.5))):ref+ph[1]*s,col=ph[1]>0?K.ok:K.pk,d=u<.6?0:ph[1]*s;
    const cx=215,cy=240,R=150,top=-Math.PI/2;
    dot(c,cx,cy,R,'#0E1B2A',{stroke:C.line,lw:2});
    for(let j=0;j<60;j++){const a=j/60*TAU+top,big=j%5===0,r0=R-(big?20:10);
      poly(c,[[cx+Math.cos(a)*r0,cy+Math.sin(a)*r0],[cx+Math.cos(a)*(R-4),cy+Math.sin(a)*(R-4)]],big?C.muted:C.line,big?3:1.5);}
    poly(c,[[cx-8,cy-R-13],[cx+8,cy-R-13],[cx,cy-R-1]],null,0,{fill:C.text,close:true});
    const ah=(ph[0]%12)/12*TAU+top;dot(c,cx+Math.cos(ah)*(R-36),cy+Math.sin(ah)*(R-36),7,K.cy,{glow:12});
    if(Math.abs(d)>.2){const a1=top+d/60*TAU;
      c.save();c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R-24,top,a1,d<0);c.closePath();c.fillStyle=col+'2E';c.fill();
      c.strokeStyle=col;c.lineWidth=6;c.lineCap='round';c.beginPath();c.arc(cx,cy,R-24,top,a1,d<0);c.stroke();c.restore();}
    const aH=((m/60)%12)/12*TAU+top,aM=((m%60+60)%60)/60*TAU+top;
    poly(c,[[cx,cy],[cx+Math.cos(aH)*R*.5,cy+Math.sin(aH)*R*.5]],C.text,7);
    poly(c,[[cx,cy],[cx+Math.cos(aM)*R*.8,cy+Math.sin(aM)*R*.8]],Math.abs(d)>.2?col:C.text,4);
    dot(c,cx,cy,7,C.text);
    rich(c,`${ph[0]}시 {${ph[1]>0?'+':'−'} ${Math.abs(ph[1])}분}`,cx,cy+R+44,{size:24,align:'center',hl:col,w:600,alpha:ease(seg(u,.6,1.1))});
    const HX=460;
    rich(c,'{past}는 더하고, {to}는 뺀다',HX,64,{size:28,font:DISP,w:400,hw:400,hl:[K.ok,K.pk],alpha:ease(seg(t,.1,.7))});
    const rows=[['a quarter {past} four','4:15',K.ok],['half {past} four','4:30',K.ok],['a quarter {to} four','3:45',K.pk],['ten {to} four','3:50',K.pk]];
    rows.forEach((r,j)=>{const y=138+j*62,a=ease(seg(t-T0-j*PL,1.4,1.9));if(a<=0)return;
      if(i===j)rr(c,HX-10,y-25,480,50,12,r[2]+'1A',r[2]+'88',1.5,{alpha:a});
      rich(c,r[0],HX+10,y,{size:21,hl:r[2],alpha:a});
      T(c,r[1],920,y,{size:26,w:700,align:'right',alpha:a});});
    const u4=t-T0-4*PL,ta=ease(seg(u4,1.4,1.9));
    if(ta>0){const y=414;rr(c,HX-10,y-30,480,60,12,'rgba(255,107,107,.10)',K.no+'AA',1.5,{alpha:ta});
      rich(c,'a quarter {to} six',HX+10,y,{size:21,hl:K.pk,alpha:ta});
      T(c,'6:15',818,y,{size:20,align:'right',color:C.muted,alpha:ta});
      strike(c,818-tw(c,'6:15',20),818,y,ease(seg(u4,1.8,2.3)),K.no,2.5);
      T(c,'5:45',920,y,{size:26,w:700,align:'right',color:K.pk,alpha:ta});}
  }});

/* ───────── Ⅰ-3 금액 네 줄 ───────── */
S.push({u:0,ch:'6번 금액',title:'금액 — 네 줄로, 할인은 마지막에 한 번',file:'01-listening.html',
  sub:'단가 × 수량을 적고 할인은 마지막에 한 번만 빼면, 흔한 오답 금액은 모두 한 줄을 빼먹은 값입니다.',
  fx:[{w:1,f:'금액 = 확정 수량 × 단가의 합 − 확정 할인',n:'중간 합계는 그 시점의 주문일 뿐'},
      {w:1,f:'① 단가·수량 → ② 할인 대상 → ③ 마지막에 한 번 → ④ 없으면 다시',n:'가장 가까운 금액을 고르지 않는다'},
      {w:1,f:'학생 할인 2장까지 · 성인 2명 + 학생 3명',n:'24 + 14 + 12 = 50달러 (3장 모두 할인 45 ✕ · 모두 성인가 60 ✕)'}],
  pts:['예문: 양장본 20달러, 문고본 10달러, 회원은 양장본만 6달러 할인. 마지막 주문은 양장본 1 + 문고본 3입니다.',
       '<em>34달러</em>는 「Wait. Please add one more paperback.」 앞의 중간 합계라 검산용입니다.',
       '할인이 <em>일부에게만</em>(양장본만, 2장까지) 붙으면 장을 둘로 나눠 더합니다.'],
  dur:16,still:14,
  draw(c,t){
    const L=[{s:'① 단가 × 수량: 양장본 20 × 1 + 문고본 10 × 3 = {50}',hl:K.cy,at:.3},
             {s:'② 할인 대상: 회원 할인은 {양장본에만 − 6}',hl:K.pk,at:2.2},
             {s:'③ 마지막에 한 번: 50 − 6 = {44}',hl:K.ok,at:4.1},
             {s:'④ 선지에 없으면: {수량·할인 대상 다시}',hl:K.amb,at:6}];
    const ys=[112,196,280,364];let s44=null;
    L.forEach((l,j)=>{const a=ease(seg(t,l.at,l.at+.6)),y=ys[j];if(a<=0)return;
      rr(c,30,y-31,505,62,14,j===2?'rgba(123,224,127,.08)':K.card,j===2?K.ok+'99':C.line,1.5,{alpha:a});
      const r=rich(c,l.s,50,y,{size:19,hl:l.hl,alpha:a});if(j===2)s44=r.spans[0];});
    const CH=[['$34','문고본 추가 전 합계'],['$40','예전 수량에 할인도 안 뺌'],['$44',''],['$50','할인을 안 뺌'],['$56','할인을 더함']];
    const order=[0,1,-1,2,3],cy0=96,dy=78,ca=ease(seg(t,.5,1.1));
    CH.forEach((q,j)=>{const y=cy0+j*dy,good=j===2;
      const r=good?ease(seg(t,4.9,5.4)):ease(seg(t,7.2+order[j],7.7+order[j]));
      T(c,q[0],600,y,{size:26,w:700,color:r>0?(good?K.ok:K.no):C.muted,alpha:ca});
      if(!good){strike(c,600,600+tw(c,q[0],26,700),y,r,K.no,3);if(r>0)T(c,q[1],672,y,{size:16,color:C.muted,alpha:r});}
      mk(c,574,y,good,9,r);});
    if(s44){const k=ease(seg(t,4.6,5.2));if(k>0)bend(c,s44.x1+10,280,592,cy0+2*dy+4,-20,K.ok,{k,w:2,dash:[5,5],alpha:lerp(1,.5,seg(t,5.6,6.2))});}
    rich(c,'할인은 {확정 합계}에서 {마지막에 한 번}만',480,470,{size:19,align:'center',hl:K.amb,alpha:ease(seg(t,11,11.6))});
  }});

/* ───────── Ⅱ-1 However 뒤가 결론 ───────── */
S.push({u:1,ch:'글의 구조',title:'However 뒤가 필자의 결론',file:'02-main-idea.html',
  sub:'However가 남들 생각을 꺾고, For example이 한 단계 내려가 보여 준 뒤, Therefore가 결론을 닫습니다.',
  fx:[{w:1,f:'↩ However · Nevertheless · On the other hand',n:'꺾기 — 뒤가 필자의 방향'},
      {w:1,f:'↓ For example · For instance · such as',n:'내려가기 — 사례 하나, 결론이 아니다'},
      {w:1,f:'⇒ Therefore · Thus · As a result',n:'닫기 — 필자의 정리'},
      {w:1,f:'= In other words · That is',n:'같은 말 — 새 조건이 아니다'}],
  pts:['However <em>앞</em>은 필자가 벗어나려는 통념입니다. 그 문장을 옮기면 요지·주장이 글의 반대편이 됩니다.',
       '사례(For example 뒤)는 결론을 떠받치는 재료라, 요지로 올리면 범위가 좁아집니다.',
       'Although절은 인정이고 <em>주절이 본뜻</em>입니다.',
       'In fact · Actually는 꺾기보다 앞 인상을 <em>더 정확한 사실</em>로 바꾸는 일이 많습니다.'],
  dur:15,still:13,
  draw(c,t){
    const B=[{s:'Many students reread a chapter until it feels familiar.',x:90,y:80,role:'남들 생각 (통념)',col:C.dim,at:.3},
             {s:'{However}, familiarity is not the same as understanding.',x:90,y:185,role:'↩ 꺾기 · 필자 방향',col:K.amb,at:2.2},
             {s:'{For example}, many cannot explain a page they have read twice.',x:130,y:290,role:'↓ 내려가기 · 사례 하나',col:K.cy,at:4.6},
             {s:'{Therefore}, students should test themselves before rereading.',x:90,y:395,role:'⇒ 닫기 · 결론',col:K.amb,at:7}];
    const fin=ease(seg(t,9.4,10.2));
    B.forEach((b,j)=>{const a=ease(seg(t,b.at,b.at+.7));if(a<=0)return;
      const key=j===1||j===3;
      rr(c,b.x,b.y-26,700-b.x,52,12,key?`rgba(244,181,68,${(.05+.09*fin).toFixed(3)})`:K.card,key&&fin>0?K.amb:C.line,key?1.5+fin:1.5,{alpha:a,glow:key?fin*14:0});
      rich(c,b.s,b.x+18,b.y,{size:18,hl:b.col,color:j===0?C.muted:C.text,alpha:a*(j===0?lerp(1,.55,fin):1)});
      T(c,b.role,716,b.y,{size:16,w:600,color:b.col,alpha:ease(seg(t,b.at+.5,b.at+1.1))});
      if(j===0)mk(c,676,b.y,false,8,fin);});
    const a1=ease(seg(t,2.5,3.2));if(a1>0)bend(c,88,96,88,170,-70,K.amb,{k:a1,w:2.5});
    const a2=ease(seg(t,4.9,5.6));
    if(a2>0){poly(c,[[110,213],[110,lerp(213,290,clamp(a2*1.6))]],K.cy,2.5);
      if(a2>.62){const q=(a2-.62)/.38;poly(c,[[110,290],[lerp(110,122,q),290]],K.cy,2.5);if(q>.95)head(c,129,290,0,K.cy,10);}}
    const a3=ease(seg(t,7.3,7.9));
    if(a3>0){const y2=lerp(318,357,a3);poly(c,[[146,318],[146,y2]],K.amb,2.5);poly(c,[[154,318],[154,y2]],K.amb,2.5);if(a3>.95)head(c,150,368,Math.PI/2,K.amb,14);}
    rich(c,'요지 = {However 뒤} + {Therefore 뒤}   ·   첫 문장은 ✕',480,474,{size:19,align:'center',hl:K.amb,alpha:ease(seg(t,10,10.6))});
  }});

/* ───────── Ⅱ-2 요지 · 주제 · 제목 ───────── */
S.push({u:1,ch:'22~24번',title:'요지 · 주제 · 제목 — 같은 결론, 다른 모양',file:'02-main-idea.html',
  sub:'같은 결론이 우리말 문장(22) → 영어 명사구(23) → 제목(24)으로 모양만 바뀌고, 범위나 방향이 다른 선지는 떨어집니다.',
  fx:[{w:1,f:'요지(22) = 판단이 든 우리말 한 문장',n:'익숙함은 이해가 아니니, 다시 읽기 전에 스스로 점검해야 한다'},
      {w:1,f:'주제(23) = 같은 범위의 영어 명사구',n:'the value of self-testing before rereading'},
      {w:1,f:'제목(24) = 같은 범위 안의 장면·비유',n:'Close the Book and Explain'},
      {w:1,f:'“목심주함 요주제” — 18~24번 차례',n:'목적 · 심경 · 주장 · 함축 · 요지 · 주제 · 제목'}],
  pts:['<em>좁음</em>: 사례 하나만 — How to Pronounce Difficult Words (공부법 전체를 발음 하나로 줄임).',
       '<em>넓음</em>: 글에 없는 범위까지 — The History of Studying.',
       '<em>반대</em>: However 앞의 습관 — Reread Until It Feels Familiar.',
       '선지를 가리고 결론을 <em>우리말 한 줄</em>로 먼저 적은 뒤, 범위가 같은 것만 남깁니다.'],
  dur:16,still:14,
  draw(c,t){
    const R3=[{tag:'22 요지 — 우리말 문장',s:'익숙함은 이해가 아니니, 다시 읽기 전에 스스로 점검해야 한다',size:17,col:K.amb,at:.3},
              {tag:'23 주제 — 영어 명사구',s:'the value of self-testing before rereading',size:19,col:K.cy,at:2},
              {tag:'24 제목 — 같은 범위의 장면',size:22,col:K.ok,at:3.6}];
    const BX=40,BW=500,ys=[124,250,376];
    R3.forEach((r,j)=>{const a=ease(seg(t,r.at,r.at+.7)),y=ys[j];if(a<=0)return;
      pill(c,r.tag,BX,y-50,r.col,{size:15,align:'left',alpha:a});
      rr(c,BX,y-30,BW,60,14,r.col+'14',r.col+'AA',1.5,{alpha:a});
      if(r.s)T(c,r.s,BX+BW/2,y,{size:r.size,align:'center',w:600,alpha:a});
      if(j){c.save();c.globalAlpha*=a;arrow(c,BX+BW-40,ys[j-1]+32,BX+BW-40,y-34,r.col,2.5,9);c.restore();}});
    const CA=[{s:'How to Pronounce Difficult Words',tag:'좁음',kind:0},{s:'Close the Book and Explain',good:1},
              {s:'The History of Studying',tag:'넓음',kind:1},{s:'Reread Until It Feels Familiar',tag:'반대',kind:2}];
    const RX=570,y0s=[110,195,280,365],y1s=[130,0,250,370],ca=ease(seg(t,5,5.6)),fly=ease(seg(t,6,7)),re=ease(seg(t,7,7.6));
    T(c,'점선 = 글이 덮는 범위',RX,64,{size:15,color:C.dim,alpha:ca});
    let n=0;
    CA.forEach((q,j)=>{
      if(q.good){const size=lerp(16,22,fly),w=tw(c,q.s,size,600);
        T(c,q.s,lerp(RX,BX+BW/2-w/2,fly),lerp(y0s[j],ys[2],fly),{size,w:600,alpha:ca});return;}
      const k=ease(seg(t,7.6+n*1.3,8.4+n*1.3));n++;
      const y=lerp(y0s[j],y1s[j],re)+8*k,by=y+22,r0=RX,r1=RX+200;
      T(c,q.s,RX,y,{size:16,alpha:ca*lerp(1,.75,k)});
      if(ca>0){poly(c,[[r0,by],[r1,by]],C.dim,1.5,{dash:[4,4],alpha:ca*.9});poly(c,[[r0,by-5],[r0,by+5]],C.dim,1.5,{alpha:ca*.9});poly(c,[[r1,by-5],[r1,by+5]],C.dim,1.5,{alpha:ca*.9});}
      if(k<=0)return;
      if(q.kind===0)poly(c,[[r0,by],[r0+56*k,by]],K.pk,6);
      else if(q.kind===1){poly(c,[[r0,by],[r0+200*clamp(k/.6),by]],K.amb,6);if(k>.6)poly(c,[[r1,by],[r1+130*(k-.6)/.4,by]],K.no,6);}
      else{poly(c,[[r1,by],[lerp(r1,r0+12,k),by]],K.no,6);if(k>.9)head(c,r0+2,by,Math.PI,K.no,13);}
      pill(c,q.tag,892,y,q.kind===2?K.no:K.pk,{size:15,alpha:k});
      mk(c,RX-16,y,false,7,k);});
  }});

/* ───────── Ⅱ-3 도표 by · to · twice ───────── */
S.push({u:1,ch:'25번 도표',title:'도표 — by는 차이, to는 도착값',file:'03-details.html',
  sub:'120에서 150이 되면 increased by 30이자 increased to 150이고, twice as many A as B는 B에 2를 곱해 A와 맞춰 봅니다.',
  fx:[{w:1,f:'increased by N',n:'나중 − 처음 = N (늘어난 차이)'},
      {w:1,f:'increased to N',n:'나중 값 = N (도착한 수)'},
      {w:1,f:'twice as many A as B',n:'2 × B 를 A와 비교 — 2를 곱하는 쪽은 as 뒤의 B'},
      {w:1,f:'remained the same',n:'두 칸의 수가 같음 (청소년 80 → 80)'}],
  pts:['어린이 120 → 150: <em>by 30</em>도 <em>to 150</em>도 참입니다. 「150만큼 늘었다」는 거짓입니다.',
       '2024년 어린이 150은 2023년 청소년 80의 두 배? 2 × 80 = 160 ≠ 150 → <em>거짓</em>.',
       '성인 200 → 160은 decreased by 40, decreased to 160입니다.',
       '50명은 50%가 아닙니다. 전체 합으로 나눈 값이 50%일 때만 절반입니다.'],
  dur:15,still:13,
  draw(c,t){
    const base=440,sc=1.3,Y=v=>base-v*sc;
    poly(c,[[50,base],[480,base]],C.dim,1.5);
    const g1=ease(seg(t,.2,1.4)),g2=ease(seg(t,1.6,2.6)),g3=ease(seg(t,2.8,4)),r1=ease(seg(t,4.4,5)),r2=ease(seg(t,6.2,6.8)),r3=ease(seg(t,10.2,10.8));
    const bar=(x,v,col,w=70)=>{if(v>.5)rr(c,x-w/2,Y(v),w,v*sc,5,col,null,0);};
    bar(110,120*g1,'#5D7591');bar(330,80*g1,'#5D7591');bar(215,120*g2,'#7F9BBB');
    if(g3>0){rr(c,180,Y(120+30*g3),70,30*g3*sc,4,K.amb,null,0,{glow:r1*(8+6*Math.sin(t*4))});
      poly(c,[[145,Y(120)],[180,Y(120)]],K.amb,1.5,{dash:[4,3]});}
    [['어린이 2023',110],['어린이 2024',215],['청소년 2023',330]].forEach(([s,x])=>T(c,s,x,base+24,{size:15,align:'center',color:C.muted,alpha:ease(seg(t,.2,.8))}));
    T(c,'120',110,Y(120)-16,{size:18,w:700,align:'center',alpha:seg(t,1.2,1.5)});
    T(c,'80',330,Y(80)-16,{size:18,w:700,align:'center',alpha:seg(t,1.2,1.5)});
    T(c,'150',215,Y(150)-16,{size:18,w:700,align:'center',color:r2>0?K.cy:C.text,alpha:seg(t,3.8,4.1)});
    if(r2>0)head(c,176,Y(150),0,K.cy,12,r2);
    const gh1=ease(seg(t,8,8.6)),gh2=ease(seg(t,8.8,9.4)),dl=ease(seg(t,9.4,9.9)),gp=ease(seg(t,9.9,10.3));
    if(gh1>0)rr(c,395,Y(80*gh1),50,80*gh1*sc,4,K.pk+'40',K.pk,1.5);
    if(gh2>0)rr(c,395,Y(80+80*gh2),50,80*gh2*sc,4,K.pk+'40',K.pk,1.5);
    T(c,'× 2',420,Y(160)-16,{size:17,w:700,align:'center',color:K.pk,alpha:gh2>=1?1:0});
    if(dl>0)poly(c,[[445,Y(160)],[lerp(445,262,dl),Y(160)]],K.pk,1.8,{dash:[5,4]});
    if(gp>0)poly(c,[[254,Y(160)],[264,Y(160)],[264,Y(150)],[254,Y(150)]],K.no,2.5,{alpha:gp});
    const RX=530;
    rich(c,'increased {by} 30',RX,104,{size:24,hl:K.amb,alpha:r1});
    T(c,'= 150 − 120 · 늘어난 차이',RX,140,{size:17,color:C.muted,alpha:r1});
    rich(c,'increased {to} 150',RX,214,{size:24,hl:K.cy,alpha:r2});
    T(c,'= 나중 값 · 도착한 수',RX,250,{size:17,color:C.muted,alpha:r2});
    rich(c,'{twice} as many A as B',RX,324,{size:24,hl:K.pk,alpha:r3});
    rich(c,'B = 청소년 80 → 2 × 80 = 160 ≠ 150 → {거짓}',RX,360,{size:17,color:C.muted,hl:K.no,alpha:r3});
    mk(c,RX+344,324,false,10,r3);
  }});

/* ───────── Ⅲ-1 주어–동사 수 일치 ───────── */
S.push({u:2,ch:'29번 어법',title:'수 일치 — 꾸밈말을 걷으면 주어가 보인다',file:'04-grammar-vocab.html',
  sub:'of ~ 전치사구와 that ~ 관계절을 괄호로 걷으면 주어 box(단수)가 남고, 동사는 그 한 단어에 맞춰 was가 됩니다.',
  fx:[{w:1,f:'걷을 것: 전치사구 · 관계절 · 분사구 · 삽입어구',n:'괄호 밖에 남은 명사가 주어'},
      {w:1,f:'The number of ~ + 단수 (is)',n:'A number of ~ + 복수 (are)'},
      {w:1,f:'A as well as B → A에 맞춤',n:'either A or B · neither A nor B → B에 맞춤'}],
  pts:['동사 바로 앞의 명사(letters, grandparents)에 맞추면 <em>were</em>가 되어 틀립니다.',
       '전치사 뒤의 명사는 주어가 아닙니다. There 문장은 be 뒤가 진짜 주어입니다.',
       'The quality of preparation, rather than the number of hours, <em>determines</em>… — rather than 덩어리도 걷습니다.',
       '관계절 동사는 선행사에, 주절 동사는 주절 주어에 맞춥니다.'],
  dur:15,still:13.5,
  draw(c,t){
    const FS=22,Y0=150,YT=300,trap=ease(seg(t,8.4,9.2));
    const SG=[{s:'The {box}',hl:K.amb},{s:'of old [letters]',drop:1},{s:'that my [grandparents] wrote',drop:1},{verb:1},{s:'found in the attic.'}];
    const fix=ease(seg(t,6.6,7.3)),drop=ease(seg(t,3.4,4.8)),br=ease(seg(t,1.8,2.6)),gap=tw(c,' ',FS)*1.5;
    const vw=lerp(tw(c,'were',FS,700),tw(c,'was',FS,700),fix);
    const W=SG.map(q=>q.verb?vw:rich(c,q.s,0,0,{size:FS,dry:true}).w);
    const lay=k=>{let x=0;const xs=[];SG.forEach((q,i)=>{xs.push(x);const f=q.drop?1-k:1;x+=W[i]*f+(i<4?gap*f:0);});return {xs,tot:x};};
    const L0=lay(0),L=lay(drop),x00=480-L0.tot/2,x0=480-L.tot/2;
    const tw1=W[1],tw2=W[2],tx=480-(tw1+40+tw2)/2,trayX=[0,tx,tx+tw1+40];
    const paren=(a,b,y,col,al)=>{if(al<=0)return;const h=FS*.66;c.save();c.globalAlpha*=al;c.strokeStyle=col;c.lineWidth=2.2;
      c.beginPath();c.moveTo(a-1,y-h);c.quadraticCurveTo(a-8,y,a-1,y+h);c.stroke();c.beginPath();c.moveTo(b+1,y-h);c.quadraticCurveTo(b+8,y,b+1,y+h);c.stroke();c.restore();};
    const ap=ease(seg(t,.3,1));let boxSp=null,verbX=0;
    SG.forEach((q,i)=>{
      if(q.drop){const x=lerp(x00+L0.xs[i],trayX[i],drop),y=lerp(Y0,YT,drop);
        rich(c,q.s,x,y,{size:FS,color:C.text,mk:trap>0?K.no:C.text,alpha:ap*lerp(1,.62,drop)});paren(x,x+W[i],y,K.ok,br*ap);return;}
      const x=x0+L.xs[i];
      if(q.verb){verbX=x;T(c,'were',x,Y0,{size:FS,w:700,color:K.no,alpha:ap*(1-fix)});T(c,'was',x,Y0,{size:FS,w:700,color:K.ok,alpha:ap*fix});return;}
      const r=rich(c,q.s,x,Y0,{size:FS,hl:q.hl,alpha:ap});if(i===0)boxSp=r.spans[0];});
    const sv=ease(seg(t,5.4,6.2));
    if(boxSp&&sv>0){const bx=(boxSp.x0+boxSp.x1)/2,vx=verbX+vw/2;
      pill(c,'S · 단수',boxSp.x1,Y0+44,K.amb,{size:15,align:'right',alpha:sv});pill(c,'V · 단수',verbX+4,Y0+44,K.ok,{size:15,align:'left',alpha:sv});
      bend(c,bx,Y0-20,vx,Y0-20,26,K.ok,{k:sv,w:2.2,head:false,alpha:sv});}
    rich(c,'괄호 속 {letters} · {grandparents}에 맞추면 were ✕ — 주어는 {box} 하나',480,430,{size:18,align:'center',hl:[K.no,K.no,K.amb],alpha:trap});
  }});

/* ───────── Ⅲ-2 관계사 빈자리 ───────── */
S.push({u:2,ch:'29번 어법',title:'관계사 — which 뒤엔 빈자리, where 뒤엔 꽉 찬 문장',file:'04-grammar-vocab.html',
  sub:'which · that 뒤의 절에는 주어나 목적어가 하나 비어 있고, where · when · why 뒤의 절은 성분이 다 차 있습니다.',
  fx:[{w:1,f:'which · that + 빈자리 있는 절',n:'he bought ___ — 목적어가 빔'},
      {w:1,f:'where · when · why + 다 찬 절',n:'he lived — 주어·동사가 다 있음'},
      {w:1,f:'what = the thing(s) that',n:'앞에 꾸밀 명사 없이 쓴다 — The order what ✕'}],
  pts:['사람·사물은 1차 분류일 뿐, <em>최종 분류는 뒤 절의 성분</em>입니다.',
       'The reason <em>which</em> many residents praise the change… — 주어·동사·목적어가 다 있어 which가 들어갈 자리가 없습니다. why 또는 that.',
       '콤마 뒤 계속적 용법에는 that을 쓰지 않습니다.',
       '전치사 + 관계사(the pen with which she wrote)에서는 which를 생략할 수 없습니다.'],
  dur:16,still:14,
  draw(c,t){
    const FS=24,X=60;
    const aA=ease(seg(t,.3,1)),A=rich(c,'This is [the house] {which} he bought',X,104,{size:FS,hl:K.cy,mk:K.amb,alpha:aA});
    const sx=A.x1+14,sw=86,blink=t<3?.55+.45*Math.cos(seg(t,1.2,3)*TAU*2):1,fill=ease(seg(t,3,3.5));
    dbox(c,sx,104-19,sw,38,8,K.pk,aA*blink,fill>0?`rgba(255,122,138,${(.2*fill).toFixed(3)})`:null);
    const hs=A.marks[0];if(hs)bend(c,(hs.x0+hs.x1)/2,104-18,sx+sw/2,104-22,40,K.amb,{k:ease(seg(t,2.2,3.1)),w:2,dash:[5,4]});
    rich(c,'bought의 {목적어 자리가 빔} → which · that',X,150,{size:18,hl:K.pk,color:C.muted,alpha:ease(seg(t,3.3,3.9))});
    const aB=ease(seg(t,4.6,5.3)),Bm=rich(c,'This is [the house] {where} [he] [lived].',X,246,{size:FS,hl:K.vi,mk:[K.amb,C.text,C.text],alpha:aB});
    const uB=ease(seg(t,5.6,6.4));ul(c,Bm.marks[1],K.ok,16,3,uB);ul(c,Bm.marks[2],K.ok,16,3,uB);
    rich(c,'he lived — {주어·동사가 다 있음} → where',X,292,{size:18,hl:K.ok,color:C.muted,alpha:ease(seg(t,6.6,7.2))});
    const aC=ease(seg(t,8,8.7)),Cm=rich(c,'The reason {which} [many residents] [praise] [the change] …',X,392,{size:FS,hl:K.no,alpha:aC});
    [9,9.4,9.8].forEach((s0,j)=>ul(c,Cm.marks[j],K.ok,16,3,ease(seg(t,s0,s0+.4))));
    const ws=Cm.spans[0];strike(c,ws.x0,ws.x1,392,ease(seg(t,10.6,11)),K.no,3);
    T(c,'why',(ws.x0+ws.x1)/2,356,{size:20,w:700,align:'center',color:K.ok,alpha:ease(seg(t,11.1,11.6))});
    rich(c,'{주어·동사·목적어가 다 있음} → which ✕ · why ✓',X,440,{size:18,hl:K.ok,color:C.muted,alpha:ease(seg(t,11.6,12.2))});
  }});

/* ───────── Ⅲ-3 자동사·타동사와 수동 ───────── */
S.push({u:2,ch:'29번 어법',title:'수동 — a가 끼면 목적어를 데려온다',file:'04-grammar-vocab.html',
  sub:'수동태는 목적어가 주어 자리로 올라온 문장이라, 목적어를 데려오지 못하는 동사(rise · lie · happen)는 수동이 되지 않습니다.',
  fx:[{w:1,f:'raise · lay = 무엇을 올리다 · 놓다',n:'목적어를 데려온다 → 수동 가능 (Her hand was raised.)'},
      {w:1,f:'rise · lie = 스스로 오르다 · 눕다',n:'혼자 — 수동 ✕ · rise – rose – risen · lie – lay – lain'},
      {w:1,f:'happen · occur · appear · arrive · consist of',n:'저절로 되는 일은 수동 ✕ — was happened ✕ · is consisted of ✕'}],
  pts:['수동태 = <em>목적어가 주어 자리로</em> 올라온 문장입니다. 목적어가 없으면 올릴 것이 없습니다.',
       'lay는 lie의 과거이기도 합니다. 목적어가 있나, 눕나 놓나로 가릅니다.',
       'The group <em>consists of</em> four students — is consisted of ✕.'],
  dur:15,still:13,
  draw(c,t){
    const FS=24,X=80,RX=620;
    rich(c,'r{a}ise · l{a}y는 {무엇을}, rise · lie는 {혼자}',480,58,{size:26,align:'center',hl:[K.amb,K.amb,K.amb,K.cy],alpha:ease(seg(t,.3,.9))});
    rich(c,'a가 끼면 {목적어}를 데려온다 → 목적어가 있어야 수동이 된다',480,98,{size:18,align:'center',hl:K.amb,color:C.muted,alpha:ease(seg(t,.9,1.5))});
    const go1=(y,a0)=>{const a=ease(seg(t,a0,a0+.5));if(a>0){c.save();c.globalAlpha*=a;arrow(c,RX-56,y,RX-14,y,C.dim,2,8);c.restore();}};
    const a1=ease(seg(t,1.6,2.2)),R1=rich(c,'The curtain {rose}.',X,184,{size:FS,hl:K.cy,alpha:a1});
    const bl=t<3.2?.5+.5*Math.cos(seg(t,2.2,3.2)*TAU*2):1;dbox(c,R1.x1+16,184-18,90,36,8,C.dim,a1*bl);mk(c,R1.x1+61,184,false,8,ease(seg(t,3,3.4)));
    go1(184,3.3);rich(c,'목적어 없음 → {was risen ✕}',RX,184,{size:18,hl:K.no,color:C.muted,alpha:ease(seg(t,3.4,4))});
    const a2=ease(seg(t,4.4,5)),R2=rich(c,'She r{a}ised [her hand].',X,290,{size:FS,hl:K.amb,mk:t>5.4?K.amb:C.text,alpha:a2});
    hbox(c,R2.spans[0],FS,K.amb,seg(t,5,5.3)*(1-seg(t,6.4,7)));
    const hs=R2.marks[0],k2=ease(seg(t,5.4,6.1));
    if(hs&&k2>0){bend(c,(R2.spans[0].x0+R2.spans[0].x1)/2,290-16,(hs.x0+hs.x1)/2,290-16,34,K.amb,{k:k2,w:2,hs:9});ul(c,hs,K.amb,16,3.5,k2);}
    go1(290,6.6);rich(c,'→ {Her hand was raised.} ✓',RX,290,{size:18,hl:K.ok,color:C.muted,alpha:ease(seg(t,6.8,7.4))});
    const a3=ease(seg(t,8,8.6)),R3=rich(c,'The problem {was happened}.',X,396,{size:FS,hl:K.no,alpha:a3});
    strike(c,R3.spans[0].x0,R3.spans[0].x1,396,ease(seg(t,8.8,9.3)),K.no,3);
    go1(396,9.3);rich(c,'→ The problem {happened}. ✓',RX,396,{size:18,hl:K.ok,color:C.muted,alpha:ease(seg(t,9.5,10.1))});
    rich(c,'저절로 되는 일 — {happen · occur · appear · arrive · consist of} — 은 수동 ✕',480,474,{size:17,align:'center',hl:K.cy,color:C.muted,alpha:ease(seg(t,10.4,11))});
  }});

/* ───────── Ⅲ-4 30번 반의어 ───────── */
S.push({u:2,ch:'30번 어휘',title:'30번 — 흐름과 거꾸로 가는 낱말',file:'04-grammar-vocab.html',
  sub:'문장마다 +/−를 적고 연결어로 같음·반대를 이으면, 혼자 방향이 뒤집힌 밑줄 하나가 드러납니다.',
  fx:[{w:1,f:'however · yet · in contrast',n:'앞과 평가가 반대'},
      {w:1,f:'in other words · that is',n:'바로 앞과 같은 말 — +/−도 같다'},
      {w:1,f:'therefore · so · as a result',n:'앞에서 따라 나오는 같은 방향'}],
  pts:['답은 바꿔 넣을 말이 아니라 <em>부적절한 밑줄의 번호</em>입니다. ② weaken 자리는 strengthen 방향이어야 합니다.',
       'In other words 뒤 문장(실수를 더 분명히 본다)이 +라서, 바로 앞 밑줄도 +여야 합니다.',
       '모르는 단어 ≠ 틀린 단어. guarantee가 어려워 보여도 does not과 함께 첫 문장에 맞습니다.',
       '자주 뒤집히는 축: 증가↔감소 · 이득↔손해 · 장려↔억제 · 단순↔복잡.'],
  dur:16,still:14,
  draw(c,t){
    const FS=17,X=40,X1=780,X2=870,ys=[86,160,234,308,382],conf=ease(seg(t,11,11.6));
    const LN=['Winning once does not {①guarantee} a successful season.',
              'Careful review of each game, [however], can {②weaken} the players’ judgment.',
              '[In other words], they see their mistakes more clearly and choose {③better} moves.',
              'The coach [therefore] asks them to watch one scene twice {④before} they talk.',
              'Players who accept this habit usually {⑤improve} faster.'];
    const F=[-1,1,1,1,1],U=[-1,-1,1,1,1];
    T(c,'흐름',X1,40,{size:16,w:700,align:'center',color:C.muted,alpha:ease(seg(t,4,4.5))});
    T(c,'밑줄',X2,40,{size:16,w:700,align:'center',color:C.muted,alpha:ease(seg(t,8.6,9.1))});
    if(conf>0)rr(c,28,ys[1]-24,X2+26-28,48,12,`rgba(255,107,107,${(.12*conf).toFixed(3)})`,K.no,1.5,{alpha:conf});
    LN.forEach((s,j)=>{const a=ease(seg(t,.3+j*.8,.9+j*.8));if(a<=0)return;
      const r=rich(c,s,X,ys[j],{size:FS,hl:j===1&&conf>0?K.no:C.text,mk:K.amb,alpha:a});ul(c,r.spans[0],j===1&&conf>0?K.no:C.text,12,2,a);
      sign(c,X1,ys[j],F[j],ease(seg(t,4.4+j*.9,4.8+j*.9)));
      sign(c,X2,ys[j],U[j],ease(seg(t,9+j*.4,9.3+j*.4)),j===1?conf*16:0);});
    const cn=j=>ease(seg(t,4.6+j*.9,5.2+j*.9)),mx=X1-34;
    if(cn(0)>0)bend(c,mx+8,ys[0]+8,mx+8,ys[1]-8,40,K.amb,{k:cn(0),w:2,hs:8});
    const e1=cn(1);if(e1>0){poly(c,[[mx-6,(ys[1]+ys[2])/2-4],[mx+10,(ys[1]+ys[2])/2-4]],K.amb,2.5,{alpha:e1});poly(c,[[mx-6,(ys[1]+ys[2])/2+4],[mx+10,(ys[1]+ys[2])/2+4]],K.amb,2.5,{alpha:e1});}
    const e2=cn(2);if(e2>0){const ym=(ys[2]+ys[3])/2;poly(c,[[X1-4,ym-14],[X1-4,ym+6]],K.amb,2,{alpha:e2});poly(c,[[X1+4,ym-14],[X1+4,ym+6]],K.amb,2,{alpha:e2});head(c,X1,ym+14,Math.PI/2,K.amb,10,e2);}
    const e3=cn(3);if(e3>0){c.save();c.globalAlpha*=e3;arrow(c,X1,ys[3]+17,X1,ys[4]-17,K.amb,2,8);c.restore();}
    rich(c,'답 = {② weaken} — 흐름은 +인데 밑줄만 −',480,466,{size:20,align:'center',hl:K.no,alpha:ease(seg(t,11.8,12.4))});
  }});

/* ───────── Ⅳ-1 빈칸 예측 ───────── */
S.push({u:3,ch:'31~34번 빈칸',title:'빈칸 — 선지를 가리고 우리말로 먼저',file:'05-blank.html',
  sub:'빈칸 옆 연결어가 같음·반대를 정하면 그 방향으로 우리말 한 줄을 적고, 그다음에 선지를 대조합니다.',
  fx:[{w:1,f:'however · but → 앞과 반대',n:'so · therefore → 앞에서 따라 나온 결론'},
      {w:1,f:'not A but ___ → A를 버린 쪽',n:'B rather than A · B instead of A도 A를 버린다'},
      {w:1,f:'연결어 → 우리말 한 줄 → 방향 · 범위 · 문법 틀 대조',n:'선지는 예측을 적은 뒤에 연다'}],
  pts:['<em>반대</em>: 버린 A를 그대로 담은 선지 — accept that ability is fixed.',
       '<em>범위</em>: 지문에 없는 every · all · always가 선지에만 있으면 의심합니다.',
       '<em>소재만</em>: 지문 단어(score)가 겹쳐도 관계가 다르면 오답입니다. 겹침은 함정일 때가 많습니다.',
       'not · hardly · unless 같은 작은 말 하나가 예측 전체를 뒤집습니다.'],
  dur:16,still:14,
  draw(c,t){
    const FS=17,X=40;
    const P=['People often treat a single failure as proof that they lack ability.',
             '{However}, a low score may simply mean that the method did not fit the task.',
             'The useful response is {not} to call oneself unable, {but} to'];
    let last=null;
    P.forEach((s,j)=>{const a=ease(seg(t,.3+j*.6,.9+j*.6));const r=rich(c,s,X,56+j*34,{size:FS,hl:K.amb,color:j?C.text:C.muted,alpha:a});
      if(j===2)last=r;const g=ease(seg(t,2.2,2.8))*(1-ease(seg(t,4.2,4.8)));r.spans.forEach(sp=>hbox(c,sp,FS,K.amb,g*a));});
    const bk=ease(seg(t,1.5,2.1)),pulse=t>3.6&&t<4.6?.5+.5*Math.sin(t*12):1;
    if(last)dbox(c,last.x1+10,124-14,120,28,6,K.cy,bk*pulse,'rgba(79,209,232,.08)');
    rich(c,'{However} · {not A but} → 통념(능력 부족)의 {반대쪽}',X,170,{size:17,hl:[K.amb,K.amb,K.cy],color:C.muted,alpha:ease(seg(t,3,3.6))});
    const pa=ease(seg(t,4.4,5));
    if(pa>0){rr(c,X,206,880,52,14,'rgba(79,209,232,.10)',K.cy,2,{alpha:pa});rich(c,'우리말 예측:  {방법을 바꾸고 다시 한다}',X+20,232,{size:20,hl:K.cy,alpha:pa});}
    const CH=[['① accept that ability is fixed','버린 A 그대로'],['② change the method and try again',''],['③ avoid every difficult task','every → 범위 커짐'],
              ['④ memorize the score for years','소재(score)만 겹침'],['⑤ blame the teacher for the result','지문에 없음']];
    const cur=ease(seg(t,1,1.6))*(1-ease(seg(t,6,6.8))),ch=ease(seg(t,6.3,7));
    CH.forEach((q,j)=>{const y=300+j*44,good=j===1,r=ease(seg(t,7+j*.9,7.5+j*.9));
      if(good&&r>0)rr(c,X,y-19,560,38,10,'rgba(123,224,127,.12)',K.ok,1.5,{alpha:r});
      T(c,q[0],X+32,y,{size:17,w:good&&r>0?700:500,color:good&&r>0?K.ok:C.text,alpha:ch*(good?1:lerp(1,.62,r))});
      if(q[1])T(c,q[1],420,y,{size:16,color:K.pk,alpha:r});mk(c,X+14,y,good,8,r);});
    if(cur>0){rr(c,30,276,900,226,14,'#0B1724',C.line,1.5,{alpha:cur});T(c,'선지는 가려 두기 — 예측을 먼저',480,389,{size:18,align:'center',color:C.dim,alpha:cur});}
    const lk=ease(seg(t,7.9,8.5));if(lk>0)bend(c,640,258,610,344,-24,K.ok,{k:lk,w:2,dash:[5,4],alpha:lerp(1,.5,seg(t,9,9.6))});
  }});

/* ───────── Ⅳ-2 글의 순서 ───────── */
S.push({u:3,ch:'36~37번 순서',title:'글의 순서 — a로 소개하고 the · This로 받는다',file:'06-indirect.html',
  sub:'블록 첫 단어가 가리킬 것이 이미 앞에 나와 있어야 하므로, 앞 블록 끝의 새 정보를 받는 블록을 바로 뒤에 붙입니다.',
  fx:[{w:1,f:'a / an + 명사 = 처음 나옴',n:'a new shelf · a card'},
      {w:1,f:'the · this · each + 명사 = 앞에 이미 나옴',n:'the shelf · Each borrower · This record'},
      {w:1,f:'“지정석에 연시” — 지시어 · 정관사 · 연결어 · 시간',n:'시간으로 먼저 정해도 마지막엔 대명사로 검산'}],
  pts:['주어진 글이 새로 소개한 것은 tools와 <em>a new shelf</em>뿐이라, This record · Each borrower는 첫 자리에 올 수 없습니다.',
       '(B)의 끝 they began to borrow가 대출자를 만들고, (C)의 a card가 기록을 만듭니다.',
       '정답 배열은 화살표가 <em>앞 → 뒤로만</em> 갑니다. 뒤로 가야 받을 말이 생기는 배열은 지웁니다.'],
  dur:17,still:15,
  draw(c,t){
    const FS=17,BX=40,BW=720,TX=104,on=(a)=>t>a;
    const ga=ease(seg(t,.3,1));
    rr(c,BX,30,BW,70,12,'#13263B',C.line,1.5,{alpha:ga});
    rich(c,'A city library began to lend tools as well as books.',TX,52,{size:FS,color:C.muted,alpha:ga});
    const G2=rich(c,'Hammers and drills sat on {a new shelf} near the door.',TX,78,{size:FS,hl:on(2.4)?K.cy:C.text,alpha:ga});
    hbox(c,G2.spans[0],FS,K.cy,seg(t,2.4,2.8)*(1-seg(t,3.6,4.2)));
    const BL={A:{n:2,col:K.pk,l:[['{This record} showed which tools people actually used,',[on(10.9)?K.pk:C.text]],['so the staff bought more of those items.',[]]]},
              B:{n:2,col:K.cy,l:[['{At first}, few residents noticed {the shelf},',[on(3.6)?K.vi:C.text,on(3.6)?K.cy:C.text]],['but after a short demonstration {they began to borrow} the tools.',[on(6.8)?K.amb:C.text]]]},
              C:{n:1,col:K.amb,l:[['{Each borrower} wrote the return date on {a card}.',[on(7.6)?K.amb:C.text,on(10.5)?K.pk:C.text]]]}};
    const H={A:70,B:70,C:44},tops=o=>{let y=118;const r={};o.forEach(k=>{r[k]=y;y+=H[k]+14;});return r;};
    const O0=tops(['A','B','C']),O1=tops(['B','A','C']),O2=tops(['B','C','A']),m1=ease(seg(t,4.2,5.4)),m2=ease(seg(t,8,9.2));
    const ba=ease(seg(t,1.2,1.8)),pos={},spans={};
    ['A','B','C'].forEach(k=>{const y=lerp(lerp(O0[k],O1[k],m1),O2[k],m2);pos[k]=y;if(ba<=0)return;const b=BL[k];
      rr(c,BX,y,BW,H[k],12,K.card,C.line,1.5,{alpha:ba});pill(c,`(${k})`,68,y+22,b.col,{size:15,alpha:ba});
      spans[k]=b.l.map((ln,j)=>rich(c,ln[0],TX,y+22+j*26,{size:FS,hl:ln[1].length?ln[1]:C.text,alpha:ba}).spans);});
    if(ba>0){const fl=(sp,col,a0,a1)=>hbox(c,sp,FS,col,seg(t,a0,a0+.3)*(1-seg(t,a1,a1+.4)));
      fl(spans.A[0][0],K.no,2.8,4);fl(spans.C[0][0],K.no,3.2,4);fl(spans.B[0][1],K.cy,3.6,5.4);
      fl(spans.A[0][0],K.no,7.2,8);fl(spans.C[0][0],K.amb,7.6,9.2);fl(spans.B[1][0],K.amb,6.8,9.2);
      fl(spans.C[0][1],K.pk,10.5,11.8);fl(spans.A[0][0],K.pk,10.9,11.8);
      const ln=(a,b,col,k)=>{if(k>0)bend(c,(a.x0+a.x1)/2,a.y+11,(b.x0+b.x1)/2,b.y-11,-14,col,{k,w:2.2,hs:9});};
      ln(G2.spans[0],spans.B[0][1],K.cy,ease(seg(t,5.6,6.3)));
      ln(spans.B[1][0],spans.C[0][0],K.amb,ease(seg(t,9.4,10.1)));
      ln(spans.C[0][1],spans.A[0][0],K.pk,ease(seg(t,11.2,11.9)));}
    rich(c,'첫 자리: {This record} · {Each borrower}는 받을 말이 아직 없다 → {the shelf}',BX,378,{size:17,hl:[K.pk,K.amb,K.cy],color:C.muted,alpha:ease(seg(t,3.2,3.8))});
    rich(c,'정답 {(B) → (C) → (A)}   ·   화살표는 앞 → 뒤로만',BX,424,{size:20,hl:K.ok,alpha:ease(seg(t,12.4,13))});
    rich(c,'{지}시어 · {정}관사 · {연}결어 · {시}간  =  “{지정}석에 {연시}”',BX,470,{size:18,hl:K.amb,color:C.muted,alpha:ease(seg(t,13,13.6))});
  }});

/* ───────── Ⅳ-3 문장 삽입 ───────── */
S.push({u:3,ch:'38~39번 삽입',title:'문장 삽입 — 탈락 이유가 안 적히는 자리',file:'06-indirect.html',
  sub:'주어진 문장의 첫 단어(They · also)가 요구하는 것이 바로 앞에 있는지 다섯 자리를 차례로 확인합니다.',
  fx:[{w:1,f:'They · It · This → 바로 앞에 그 대상',n:'수와 성별까지 맞아야 한다'},
      {w:1,f:'also · too → 같은 주체의 앞선 동작',n:'Walkers stopped to look → They also noticed'},
      {w:1,f:'However → 바로 앞과 반대 · the + 명사 → 이미 소개됨',n:'다음 문장이 삽입문을 받아 주는지도 확인'}],
  pts:['자리마다 <em>탈락 이유를 한 단어로</em> 적고, 이유가 안 적히는 자리를 고릅니다.',
       '가장 비슷한 소재 옆에 넣는 것이 아닙니다. 첫 단어가 요구하는 선행 정보가 <em>바로 앞</em>에 있어야 합니다.',
       '④는 투표 뒤라 관찰이 결정보다 늦고, ⑤는 신문 기사 뒤라 너무 늦습니다.'],
  dur:16,still:14.5,
  draw(c,t){
    const FS=17,X=64,GAP=56,open=ease(seg(t,10.6,11.6)),fly=ease(seg(t,10.4,11.4));
    const LN=['The town replaced the bright lamps on the river path with softer ones.','Within a month, night birds returned to the trees.',
              '{Walkers} stopped to look at the sky.','The council voted to keep the new lamps.','A local paper called the path safe for an evening stroll.'];
    const ly=j=>60+j*70+(j>=3?GAP*open:0),sy=i=>i<2?95+i*70:i===2?235+GAP*open*.5:95+i*70+GAP*open;
    let wk=null;
    LN.forEach((s,j)=>{const a=ease(seg(t,.2+j*.2,.8+j*.2));const r=rich(c,s,X,ly(j),{size:FS,hl:t>5.6?K.amb:C.text,alpha:a});if(j===2)wk=r.spans[0];});
    for(let i=0;i<5;i++){const y=sy(i),a=ease(seg(t,1.4,2));poly(c,[[42,y-6],[52,y],[42,y+6]],null,0,{fill:i===2&&open>0?K.ok:C.dim,close:true,alpha:a});}
    const TG=[['① They가 받을 사람 없음',K.pk],['② also가 받을 관찰 없음',K.pk],['③ Walkers → They ✓',K.ok],['④ 결정 뒤 — 순서 ✕',K.pk],['⑤ 신문 뒤 — 너무 늦음',K.pk]];
    const Ti=i=>2.4+i*1.6;
    TG.forEach((g,i)=>T(c,g[0],660,sy(i),{size:15,w:600,color:g[1],alpha:ease(seg(t,Ti(i)+.5,Ti(i)+1))}));
    // 자리를 하나씩 짚는 말머리
    let py=null,pa=ease(seg(t,2.1,2.4))*(1-ease(seg(t,10.4,10.8)));
    if(t<9.8){const i=clamp(Math.floor((t-2.4)/1.6),0,4),k=ease(seg(t,Ti(i)+1,Ti(i)+1.6));py=i<4?lerp(sy(i),sy(i+1),k):sy(4);}
    else py=lerp(sy(4),sy(2),ease(seg(t,9.8,10.4)));
    if(pa>0)pill(c,'They also …',62,py,K.amb,{size:15,align:'left',alpha:pa});
    // 주어진 문장 카드 → ③ 자리로
    const ca=ease(seg(t,1.2,1.8)),cx0=200,cy0=468,tx=lerp(cx0,X,fly),tyy=lerp(cy0,sy(2),fly);
    if(ca>0){rr(c,30,442,900,52,14,'#13263B',C.line,1.5,{alpha:ca*(1-fly)});pill(c,'주어진 문장',46,cy0,K.amb,{size:15,align:'left',alpha:ca*(1-fly)});
      if(open>0)rr(c,50,tyy-21,600,42,10,'rgba(123,224,127,.12)',K.ok,1.5,{alpha:open});
      const g=rich(c,'{They also} noticed that the glare on the water was gone.',tx,tyy,{size:FS,hl:K.amb,alpha:ca});
      if(wk&&open>0){const s0=g.spans[0];bend(c,s0.x0-2,tyy-8,wk.x0-2,ly(2)+8,30,K.ok,{k:ease(seg(t,11.6,12.2)),w:2,hs:8});}}
    rich(c,'첫 단어가 요구하는 것 = {바로 앞의 복수 사람} + {앞선 같은 동작}',480,482,{size:17,align:'center',hl:[K.amb,K.amb],alpha:ease(seg(t,12.2,12.8))});
  }});

/* ───────── Ⅳ-4 요약문 (A)(B) ───────── */
S.push({u:3,ch:'40번 요약',title:'요약문 — 두 덩어리를 한 단계 위의 말로',file:'06-indirect.html',
  sub:'전환 표지(now · but · however)에서 글을 둘로 나누고, 덩어리마다 사례 이름을 벗긴 한 단어로 올려 (A)(B)에 넣습니다.',
  fx:[{w:1,f:'(A) = 앞 덩어리 · (B) = 뒤 덩어리',n:'남 → 나 · 옛 → 지금 · 왜 → 그래서'},
      {w:1,f:'경계 = however · but · now · as a result',n:'once → now처럼 상황이 갈라지는 자리'},
      {w:1,f:'사례 이름 대신 한 단계 위의 말',n:'closed rooms → limited · online → open'}],
  pts:['요약문의 <em>but</em>은 두 칸이 대비되어야 한다는 신호입니다.',
       '<em>한 칸만 맞는 짝</em>(limited / useless)이 가장 오래 남는 오답입니다. 칸마다 따로 확인합니다.',
       'open은 「온라인만 남는다」가 아니라 more open — 방문이 유일한 방법이 아니게 됐다는 뜻입니다.'],
  dur:16,still:14.5,
  draw(c,t){
    const FS=17,X=58,m1=t>4.4,m2=t>6.4;
    const a1=ease(seg(t,.3,1.4)),a2=ease(seg(t,1.4,2.4));
    rr(c,40,40,600,84,12,K.card,m1?K.amb+'88':C.line,1.5,{alpha:a1});
    rich(c,'Museums [once] kept rare objects in [closed rooms].',X,66,{size:FS,mk:m1?K.amb:C.text,alpha:a1});
    rich(c,'[Only a few] scholars could see them.',X,98,{size:FS,mk:m1?K.amb:C.text,alpha:a1});
    rr(c,40,156,600,84,12,K.card,m2?K.cy+'88':C.line,1.5,{alpha:a2});
    rich(c,'Many museums [now] place pictures and short notes [online],',X,182,{size:FS,mk:[t>3?K.cy:C.text,m2?K.cy:C.text],alpha:a2});
    rich(c,'so [students far away] can study the same objects.',X,214,{size:FS,mk:m2?K.cy:C.text,alpha:a2});
    const dv=ease(seg(t,3,3.8));if(dv>0)poly(c,[[40,140],[lerp(40,640,dv),140]],K.cy,1.8,{dash:[6,5]});
    pill(c,'now = 경계 · 옛 → 지금',660,140,K.cy,{size:15,align:'left',alpha:ease(seg(t,3.4,4))});
    const A=ease(seg(t,5.2,6)),Bv=ease(seg(t,7.2,8));
    if(A>0){c.save();c.globalAlpha*=A;arrow(c,646,82,694,82,K.amb,2.5,9);c.restore();}
    if(Bv>0){c.save();c.globalAlpha*=Bv;arrow(c,646,198,694,198,K.cy,2.5,9);c.restore();}
    rich(c,'(A) {limited}',706,82,{size:26,hl:K.amb,alpha:A});
    rich(c,'(B) {open}',706,198,{size:26,hl:K.cy,alpha:Bv});
    const sa=ease(seg(t,8.6,9.2)),f1=ease(seg(t,9.6,10.2)),f2=ease(seg(t,10.2,10.8));
    if(sa>0){rr(c,40,268,880,96,14,'#13263B',C.line,1.5,{alpha:sa});
      const p1='Access to rare objects used to be (A) ',p2='but online notes have made it more (B) ';
      T(c,p1,X,298,{size:FS,alpha:sa});const x1=X+tw(c,p1,FS);T(c,p2,X,334,{size:FS,alpha:sa});const x2=X+tw(c,p2,FS);
      dbox(c,x1-2,298-14,96,28,6,K.amb,sa*(1-f1));dbox(c,x2-2,334-14,96,28,6,K.cy,sa*(1-f2));
      T(c,'limited',x1+4,298,{size:FS,w:700,color:K.amb,alpha:f1});T(c,',',x1+4+tw(c,'limited',FS,700),298,{size:FS,alpha:f1});
      T(c,'open.',x2+4,334,{size:FS,w:700,color:K.cy,alpha:f2});}
    const w1=ease(seg(t,11.2,11.7)),w2=ease(seg(t,11.8,12.3));
    rich(c,'limited / {useless} — (B)가 뒤 덩어리와 반대',X+18,404,{size:17,hl:K.no,color:C.muted,alpha:w1});mk(c,X,404,false,8,w1);
    rich(c,'{open} / {limited} — 앞뒤 칸이 바뀜',X+18,440,{size:17,hl:[K.no,K.no],color:C.muted,alpha:w2});mk(c,X,440,false,8,w2);
    rich(c,'(A)는 {앞 덩어리}, (B)는 {뒤 덩어리} — 사례 이름 대신 한 단계 위의 말',480,488,{size:17,align:'center',hl:K.amb,alpha:ease(seg(t,12.6,13.2))});
  }});

/* ───────── Ⅴ-1 대명사 추적 ───────── */
S.push({u:4,ch:'44번 지칭',title:'대명사 추적 — 이름 · 성별 · 관계 메모로',file:'07-long.html',
  sub:'이름·성별·관계를 적어 두고 she마다 후보를 지우면, 목적어로 다시 나온 이름은 주어 후보에서 빠집니다.',
  fx:[{w:1,f:'“이성관계” — 이름 · 성별 · 관계',n:'여백에 세 줄만 적는다'},
      {w:1,f:'성별·수 → 그 동작을 할 사람 → 가까운 이름은 후보만',n:'대명사 지우는 순서'},
      {w:1,f:'목적어로 다시 나온 이름 ≠ 주어',n:'she thanked Nari의 she는 Nari가 아니다'}],
  pts:['his sister의 his는 남성 Jun입니다. Ms. Han이었다면 her sister여야 합니다.',
       '같은 성별이 둘이면 가장 가까운 이름으로 확정하지 않고 <em>그 동작을 할 수 있는 사람</em>만 남깁니다.',
       '<em>아직 도착하지 않은 사람</em>은 그 장면의 동작을 하지 못합니다.',
       'the boy · the man처럼 돌려 말한 표현도 대명사와 같이 추적합니다.'],
  dur:16,still:14.5,
  draw(c,t){
    const FS=18,X=40,HAN=K.amb,JUN=K.cy,NARI=K.pk,ys=[78,158,238,318];
    const LN=[['[Ms. Han] lent her camera to [Jun] before {she} left for the office.',[HAN,JUN],.3],
              ['[Jun] dropped it, and {his} sister [Nari] picked it up.',[JUN,NARI],3.8],
              ['[Nari] wiped the lens.',[NARI],6.3],
              ['When [Ms. Han] returned, {she} thanked [Nari] and checked the camera.',[HAN,NARI],7]];
    const R=LN.map((l,j)=>rich(c,l[0],X,ys[j],{size:FS,mk:l[1],hl:K.vi,alpha:ease(seg(t,l[2],l[2]+.6))}));
    const pg=(j,a0)=>hbox(c,R[j].spans[0],FS,K.vi,seg(t,a0,a0+.3)*(1-seg(t,a0+1.6,a0+2.2)));
    pg(0,1.8);pg(1,4.8);pg(3,7.8);
    const up=(sp,to,col,k)=>{if(k>0)bend(c,(sp.x0+sp.x1)/2,sp.y-12,(to.x0+to.x1)/2,to.y-12,-30,col,{k,w:2.2,hs:9});};
    up(R[0].spans[0],R[0].marks[0],HAN,ease(seg(t,2.6,3.3)));
    up(R[1].spans[0],R[1].marks[0],JUN,ease(seg(t,5.2,5.9)));
    const sh=R[3].spans[0],nr=R[3].marks[1],kx=ease(seg(t,9,9.8));
    if(kx>0){bend(c,(sh.x0+sh.x1)/2,sh.y+12,(nr.x0+nr.x1)/2,nr.y+12,-24,K.no,{k:kx,w:2,dash:[5,4],hs:8});
      mk(c,((sh.x0+sh.x1)/2+(nr.x0+nr.x1)/2)/2,sh.y+30,false,8,ease(seg(t,9.6,10)));}
    up(sh,R[3].marks[0],K.ok,ease(seg(t,10.4,11.2)));
    // 이성관계 메모
    const MX=640,ma=ease(seg(t,.5,1.1));
    rr(c,MX,40,290,210,14,K.card,C.line,1.5,{alpha:ma});
    rich(c,'{이}름 · {성}별 · {관}계',MX+145,70,{size:17,align:'center',hl:K.vi,color:C.muted,alpha:ma});
    const MR=[['[Ms. Han] · 여 · 빌려 준 사람',HAN,1],['[Jun] · 남 · 빌린 사람',JUN,1.3],['[Nari] · 여 · Jun의 누이',NARI,4.3]];
    const js=ease(seg(t,8.4,8.9)),jf=seg(t,2.1,2.4)*(1-seg(t,2.9,3.3));
    MR.forEach((m,j)=>{const y=118+j*50,a=ease(seg(t,m[2],m[2]+.5));
      if(j===1&&jf>0)rr(c,MX+10,y-18,270,36,8,'rgba(255,107,107,.14)',K.no,1.2,{alpha:jf});
      const r=rich(c,m[0],MX+22,y,{size:17,mk:m[1],alpha:a*(j===1?lerp(1,.45,js):1)});
      if(j===1)strike(c,r.x0,r.x1,y,js,K.no,2.5);});
    rich(c,'지우는 순서: {성별·수} → {그 동작을 할 사람} → 가까운 이름은 후보만',X,420,{size:17,hl:K.vi,color:C.muted,alpha:ease(seg(t,11.8,12.4))});
    rich(c,'목적어로 다시 나온 이름({Nari})은 주어가 아니다 → she = {Ms. Han}',X,462,{size:18,hl:[NARI,HAN],alpha:ease(seg(t,12.4,13))});
  }});

/* ───────── Ⅴ-2 45번 네 칸 대조 ───────── */
S.push({u:4,ch:'45번 내용 일치',title:'45번 — 네 칸 중 한 칸만 비틀린다',file:'07-long.html',
  sub:'선지를 주체 · 동작 · 수·때 · 긍정·부정 네 칸으로 나눠 근거 문장과 칸끼리 맞추면, 한 칸이 다른 선지가 불일치입니다.',
  fx:[{w:1,f:'선지 한 줄 = 주체 + 동작 + 수·때 + 긍정·부정',n:'네 칸이 근거 문장과 모두 같으면 일치'},
      {w:1,f:'did not · no · without → 부정 칸에 따로',n:'not 하나 빠지면 소재가 같아도 불일치'},
      {w:1,f:'선지마다 근거 문장 번호',n:'전문을 다시 통독하지 않는다'}],
  pts:['발문의 <em>‘않은’</em>에 먼저 동그라미 — 불일치 문항이면 어긋난 하나를 고릅니다.',
       '자주 비틀리는 칸: 주체(Lina ↔ Mr. Choi) · 부정(did not) · 수·때(두 번 · 5월) · 순서(가져가기 전).',
       '영어 단어가 그대로 나왔다고 일치가 아니고, 우리말로 풀었다고 불일치가 아닙니다. <em>관계</em>만 봅니다.'],
  dur:15,still:13,
  draw(c,t){
    const FS=18,X=40;
    const ea=ease(seg(t,.3,1)),eb=ease(seg(t,.8,1.5)),ca=ease(seg(t,1.6,2.2));
    rich(c,'Lina joined a weekend repair club in March.',X,58,{size:FS,color:C.muted,alpha:ea});
    const E=rich(c,'[She] learned to fix lamp switches, but she {did not} [work on gas stoves].',X,94,{size:FS,hl:t>7.6?K.no:C.text,mk:[t>2.8?K.amb:C.text,t>4.3?K.cy:C.text],alpha:eb});
    rr(c,X,128,560,50,12,'#13263B',C.line,1.5,{alpha:ca});
    const Q=rich(c,'② [Lina]는 [가스레인지 수리]도 {맡았다}.',X+20,153,{size:20,mk:[t>2.8?K.amb:C.text,t>4.3?K.cy:C.text],hl:t>7.6?K.no:C.text,alpha:ca});
    const CL=[['주체','Lina = she',K.amb,1],['동작','work on = 수리',K.cy,1],['수·때','선지에 없음',C.muted,1],['긍정·부정','did not ↔ 맡았다',K.no,0]];
    CL.forEach((q,i)=>{const s0=2.8+i*1.5,a=ease(seg(t,s0,s0+.5)),mkA=ease(seg(t,s0+.7,s0+1.1)),x=X+i*222,bad=!q[3];if(a<=0)return;
      rr(c,x,214,208,180,14,bad&&mkA>0?'rgba(255,107,107,.12)':K.card,bad&&mkA>0?K.no:C.line,bad?1.5+mkA:1.5,{alpha:a,glow:bad?mkA*12:0});
      T(c,q[0],x+104,244,{size:17,w:700,align:'center',color:q[2]===C.muted?C.text:q[2],alpha:a});
      T(c,q[1],x+104,300,{size:16,align:'center',color:C.muted,alpha:a});
      mk(c,x+104,352,q[3],12,mkA);});
    const lk=(a,b,col,s0)=>{const k=ease(seg(t,s0,s0+.6));if(a&&b&&k>0)poly(c,[[(a.x0+a.x1)/2,a.y+12],[lerp((a.x0+a.x1)/2,(b.x0+b.x1)/2,k),lerp(a.y+12,b.y-14,k)]],col,1.8,{dash:[4,4],alpha:lerp(1,.45,seg(t,s0+1.2,s0+1.8))});};
    lk(E.marks[0],Q.marks[0],K.amb,3.1);lk(E.marks[1],Q.marks[1],K.cy,4.6);lk(E.spans[0],Q.spans[0],K.no,7.6);
    rich(c,'한 칸만 달라도 {불일치} → ② 가 답',480,446,{size:20,align:'center',hl:K.no,alpha:ease(seg(t,9,9.6))});
  }});
