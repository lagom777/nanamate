/* 통합과학 6~10장(지질 시대와 생물 다양성 · 화학 변화 · 생태계와 환경 · 에너지 · 과학과 미래 사회) 장면 — 최상위 이름은 SB_ 로 시작한다. 도구는 첫 파일(intsci-scenes.js)에 있다. */
const SB_G=IC[3],SB_O=IC[4],SB_INK='#0B1722';
function SB_al(c,a,fn){if(a<=.02)return;c.save();c.globalAlpha*=clamp(a);fn();c.restore();}   // 투명도를 걸고 그리기
function SB_mix(h1,h2,k){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),a=p(h1),b=p(h2);return 'rgb('+a.map((v,i)=>Math.round(lerp(v,b[i],clamp(k)))).join(',')+')';}   // 두 색 사이
function SB_fat(c,x1,y1,x2,y2,col,w,a=1){ // 굵기가 양을 나타내는 화살표
  if(a<=.02)return;const L=Math.hypot(x2-x1,y2-y1),ux=(x2-x1)/L,uy=(y2-y1)/L,hd=Math.max(11,w*.9),hw=Math.max(6,w*.5+5);
  c.save();c.globalAlpha*=a;c.strokeStyle=c.fillStyle=col;c.lineWidth=w;c.lineCap='butt';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2-ux*hd,y2-uy*hd);c.stroke();
  c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-ux*hd-uy*hw,y2-uy*hd+ux*hw);c.lineTo(x2-ux*hd+uy*hw,y2-uy*hd-ux*hw);c.closePath();c.fill();c.restore();}
function SB_ion(c,x,y,r,col,s,a=1){SB_al(c,a,()=>{dot(c,x,y,r,ra(col,.28),{stroke:col,lw:2});T(c,s,x,y+.5,{size:12,align:'center',w:600});});}   // 이온(원 + 이름)
function SB_fossil(c,kind,x,y,s,col){ // 화석 기호(도형으로 직접 그림)
  if(kind==='tri'){c.save();c.strokeStyle=col;c.lineWidth=1.6;c.beginPath();c.ellipse(x,y,s*.62,s,0,0,TAU);c.stroke();c.restore();
    poly(c,[[x-s*.22,y-s*.82],[x-s*.22,y+s*.82]],col,1.2);poly(c,[[x+s*.22,y-s*.82],[x+s*.22,y+s*.82]],col,1.2);
    for(let j=-1;j<=1;j++)poly(c,[[x-s*.55,y+j*s*.42],[x+s*.55,y+j*s*.42]],col,1,{alpha:.7});}
  else if(kind==='amm'){const P=[];for(let a=0;a<TAU*2.4;a+=.25){const r=s*(.12+.88*a/(TAU*2.4));P.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}poly(c,P,col,1.8);}
  else if(kind==='num'){dot(c,x,y,s,null,{stroke:col,lw:1.8});dot(c,x,y,s*.6,null,{stroke:col,lw:1.2});dot(c,x,y,s*.22,col);}
  else if(kind==='coral'){poly(c,[[x,y+s],[x,y-s*.1]],col,2);poly(c,[[x,y+s*.35],[x-s*.6,y-s*.5]],col,2);poly(c,[[x,y+s*.1],[x+s*.6,y-s*.7]],col,2);poly(c,[[x,y-s*.1],[x-s*.12,y-s]],col,2);
    [[-.6,-.5],[.6,-.7],[-.12,-1]].forEach(p=>dot(c,x+p[0]*s,y+p[1]*s,2.2,col));}
  else{poly(c,[[x,y+s],[x,y-s]],col,1.8);for(let j=0;j<4;j++){const yy=y+s*.7-j*s*.45,l=s*(.75-j*.14);poly(c,[[x,yy],[x-l,yy-l*.5]],col,1.5);poly(c,[[x,yy],[x+l,yy-l*.5]],col,1.5);}}}

/* ───────── Ⅳ-1 표준 화석과 시상 화석 ───────── */
S.push({u:3,ch:'지질 시대와 생물 다양성',title:'표준 화석과 시상 화석',file:'06-earth-history-diversity.html',
  sub:'같은 화석이라도 쓰임이 다릅니다. 한 층에서만 나오는 화석은 지층이 쌓인 시대를, 특정 환경에서만 살던 생물의 화석은 그때의 환경을 알려 줍니다.',
  fx:[{w:1,f:'표준 화석 → 시대',n:'생존 기간 짧고 · 분포 넓고 · 개체 수 많음'},{w:1,f:'시상 화석 → 환경',n:'생존 기간 길고 · 특정 환경에서만 삶'},{w:1,f:'삼엽충 · 암모나이트 · 화폐석',n:'고생대 · 중생대 · 신생대'}],
  pts:['<em>생존 기간이 짧아야</em> 그 화석이 나온 지층의 시대가 좁혀지고, <em>분포가 넓어야</em> 멀리 떨어진 지층끼리 비교할 수 있습니다.','환경을 알려면 사는 조건이 까다로워야 합니다. <em>산호</em>는 따뜻하고 얕은 바다, <em>고사리</em>는 따뜻하고 습한 육지입니다.','함정: 산호가 나왔다고 <em>시대</em>를 정할 수 없습니다. 표준 화석의 조건은 생존 기간이 ‘길다’가 아니라 <em>짧다</em>입니다.'],
  dur:16,still:10,
  draw(c,t){
    const GR=SB_G,CY=C.u2,Y0=326,LC=['#3b3527','#2c3a3b','#40392a','#30303e','#324030'];
    const strata=(x,w,hs,fi,kind,gc,t0)=>{let off=0;const mid=[];hs.forEach((h,i)=>{const a=fin(t,t0+i*.5,.5),y=Y0-off-h,on=fi.includes(i);off+=h;mid.push(y+h/2);
      SB_al(c,a,()=>{box(c,x,y-(1-a)*12,w,h,0,on?ra(gc,.16):LC[i],on?ra(gc,.8):'rgba(230,237,245,.16)',on?1.6:1);
        if(on)for(let j=0;j<3;j++)SB_fossil(c,kind,x+w*(.2+.3*j),y+h/2-(1-a)*12,Math.min(12,h*.3),gc);});});return mid;};
    // 왼쪽: 표준 화석 — 두 지역의 지층에서 같은 화석이 한 층에서만
    T(c,'표준 화석',50,40,{size:21,w:700,color:GR});T(c,'→ 지층이 쌓인 시대',50+kw(c,'표준 화석',21,700)+12,41,{size:16});
    arrow(c,72,Y0,72,98,C.dim,1.5,8);label(c,'과거',72,Y0+14,C.dim,{size:12});label(c,'현재',72,84,C.dim,{size:12});
    K(c,'지역 A',165,80,{size:14,color:C.muted});K(c,'지역 B',365,80,{size:14,color:C.muted});
    const mA=strata(100,130,[46,46,46,46,46],[2],'tri',GR,.3),mB=strata(300,130,[30,34,46,64,56],[2],'tri',GR,.5);
    const kc=fin(t,3.3,.8);
    if(kc>0){poly(c,[[230,mA[2]],[lerp(230,300,kc),lerp(mA[2],mB[2],kc)]],GR,2,{dash:[5,4]});SB_al(c,fin(t,3.9,.5),()=>K(c,'같은 시대',265,mA[2]-24,{size:13,color:GR,w:600}));}
    SB_al(c,fin(t,4.4,.6),()=>{T(c,'한 층에서만 나옴 → 생존 기간이 짧다 → 시대가 좁혀진다',50,362,{size:14.5});T(c,'먼 두 지역에서 나옴 → 분포가 넓다 → 지층끼리 비교',50,386,{size:14.5,color:C.muted});});
    // 오른쪽: 시상 화석 — 여러 층에 걸쳐 나오지만 한 환경에서만
    poly(c,[[480,28],[480,400]],C.line,1.5);
    T(c,'시상 화석',505,40,{size:21,w:700,color:CY});T(c,'→ 쌓일 당시의 환경',505+kw(c,'시상 화석',21,700)+12,41,{size:16});
    K(c,'어느 지역의 지층',595,80,{size:14,color:C.muted});
    strata(530,130,[46,46,46,46,46],[0,1,2,3],'coral',CY,.7);
    const ke=fin(t,5.2,.7);
    SB_al(c,ke,()=>{arw(c,666,211,694,211,CY,2.5,9);rr(c,700,104,220,196,12,'rgba(79,209,232,.06)',ra(CY,.45),1.3);
      dot(c,884,134,12,C.u1,{glow:14+4*Math.sin(t*3)});
      const sea=[];for(let x=712;x<=908;x+=7)sea.push([x,176+Math.sin(x*.08+t*2)*2.5]);poly(c,sea,'#7EC8FF',2);
      poly(c,[[712,288],[712,268],[772,236],[908,230],[908,288]],null,0,{close:true,fill:'rgba(217,199,160,.28)'});poly(c,[[712,268],[772,236],[908,230]],'#D9C7A0',1.5);
      [800,840,880].forEach((x,j)=>SB_fossil(c,'coral',x+Math.sin(t*1.5+j)*1.5,218-j%2*2,13,CY));
      T(c,'당시의 환경',712,120,{size:12.5,color:C.muted});K(c,'따뜻하고 얕은 바다',810,318,{size:15,w:700,color:CY});});
    SB_al(c,fin(t,5.8,.6),()=>{T(c,'여러 층에서 나옴 → 생존 기간이 길다 → 시대는 못 좁힘',505,362,{size:14.5});T(c,'특정 환경에서만 삶 → 그 환경을 알려 준다',505,386,{size:14.5,color:C.muted});});
    // 아래: 외울 것
    const CH=[['고생대','삼엽충 · 방추충','tri',0],['중생대','암모나이트 · 공룡','amm',0],['신생대','화폐석 · 매머드','num',0],['산호','따뜻하고 얕은 바다','coral',1],['고사리','따뜻하고 습한 육지','fern',1]];
    const hi=t>10.5?Math.floor((t-10.5)/1.1)%5:-1;
    CH.forEach((d,i)=>{const x=40+i*178,col=d[3]?CY:GR,a=fin(t,6.4+i*.45,.5);SB_al(c,a,()=>{
      rr(c,x,420,168,88,10,ra(col,i===hi?.2:.07),ra(col,i===hi?1:.55),i===hi?2.2:1.4);
      T(c,d[0],x+14,441,{size:16,w:700,color:col});SB_fossil(c,d[2],x+142,447,13,col);
      T(c,d[1],x+14,468,{size:14.5});T(c,d[3]?'시상 화석 → 환경':'표준 화석 → 시대',x+14,492,{size:12.5,color:C.muted});});});
  }});

/* ───────── Ⅳ-2 지질 시대의 길이와 대멸종 ───────── */
const SB_ERA=[[46,5.4,'선캄브리아 시대','#7E8FA6'],[5.4,2.5,'고생대','#4FD1E8'],[2.5,.66,'중생대','#7BE07F'],[.66,0,'신생대','#F4B544']];
const SB_DIV=[[5.4,.06],[5,.3],[4.5,.5],[4.42,.37],[4.2,.5],[3.8,.57],[3.72,.43],[3.4,.56],[3,.6],[2.54,.63],[2.5,.2],[2.3,.33],[2.06,.46],[2,.35],[1.7,.5],[1.2,.66],[.7,.75],[.66,.5],[.4,.76],[0,.95]];   // 생물 과의 수(개념도) — 다섯 번의 급락
S.push({u:3,ch:'지질 시대와 생물 다양성',title:'지질 시대의 길이와 대멸종',file:'06-earth-history-diversity.html',
  sub:'46억 년 가운데 선캄브리아 시대가 약 88 %입니다. 고생대 이후를 늘려 보면 생물 과의 수가 다섯 번 급락하고, 그 자리가 시대의 경계와 겹칩니다.',
  fx:[{w:1,f:'선캄브리아 > 고생대 > 중생대 > 신생대',n:'길이 순서 · 경계 시각의 차로 계산'},{w:1,f:'고생대 말: 가장 큰 대멸종',n:'삼엽충 · 방추충이 사라짐'},{w:1,f:'대멸종 → 빈자리 → 다시 다양해짐',n:'공룡 멸종 뒤 포유류 번성'}],
  pts:['시대를 나누는 기준이 <em>생물계의 큰 변화</em>라서, 대멸종이 일어난 자리가 곧 시대의 경계가 됩니다.','대멸종으로 서식지와 먹이가 비면 → 살아남은 생물이 퍼져 적응하며 <em>다시 다양해집니다</em>. 그래프는 떨어진 뒤 다시 올라갑니다.','함정: 화석이 많이 나오는 고생대가 가장 긴 시대가 아닙니다. 가장 긴 것은 <em>선캄브리아 시대</em>, 가장 짧은 것은 신생대입니다.','<em>오존층이 형성된 뒤</em>(고생대) 생물이 육지로 진출했습니다. 순서가 뒤집힌 보기는 틀립니다.'],
  dur:16,still:11.8,
  draw(c,t){
    const X0=60,BW=840,xs=a=>X0+BW*(1-a/46),gx=a=>100+780*(1-a/5.4),gy=v=>400-v*200;
    T(c,'지구의 역사 46억 년 — 시대의 길이는 경계 시각의 차',60,36,{size:15,color:C.muted});
    const k=fin(t,.3,2.4);
    c.save();c.beginPath();c.rect(X0-2,50,(BW+4)*k,50);c.clip();
    SB_ERA.forEach(e=>{const x1=xs(e[0]),x2=xs(e[1]);box(c,x1,58,x2-x1,34,0,ra(e[3],.45),ra(e[3],.95),1.2);});
    K(c,'선캄브리아 시대   40.6억 년 · 약 88 %',xs(25.7),75.5,{size:15,w:600});c.restore();
    T(c,'46억 년 전',60,108,{size:12.5,color:C.muted});
    SB_al(c,fin(t,2.4,.5),()=>{K(c,'5.4억 년 전',xs(5.4),108,{size:12.5,color:C.muted});T(c,'현재',908,75,{size:12.5,color:C.muted});
      T(c,'고생대 6 % · 중생대 4 % · 신생대 1 %',900,36,{size:13.5,align:'right'});});
    const kz=fin(t,2.9,.7);if(kz>0){poly(c,[[xs(5.4),92],[lerp(xs(5.4),100,kz),lerp(92,150,kz)]],C.dim,1.2,{dash:[4,4]});poly(c,[[900,92],[lerp(900,880,kz),lerp(92,150,kz)]],C.dim,1.2,{dash:[4,4]});}
    // 고생대 이후를 늘린 그래프
    SB_al(c,fin(t,3.4,.7),()=>{SB_ERA.slice(1).forEach(e=>{const x1=gx(e[0]),x2=gx(e[1]);box(c,x1,150,x2-x1,250,0,ra(e[3],.07),ra(e[3],.35),1);
        K(c,e[2],(x1+x2)/2,168,{size:15,w:700,color:e[3]});K(c,(e[0]-e[1]).toFixed(2).replace(/0$/,'')+'억 년',(x1+x2)/2,187,{size:12.5,color:C.muted});});
      poly(c,[[100,150],[100,400],[880,400]],C.dim,1.5);T(c,'생물 과의 수',92,232,{size:12.5,color:C.muted,align:'right'});
      [[5.4,'5.4억 년 전'],[2.5,'2.5'],[.66,'0.66'],[0,'현재']].forEach(d=>K(c,d[1],gx(d[0]),415,{size:12.5,color:C.muted}));});
    const P=SB_DIV.map(d=>[gx(d[0]),gy(d[1])]),kc=seg(t,4.3,9.3),xe=lerp(100,880,kc),Q=[];
    for(let i=0;i<P.length;i++){if(P[i][0]<=xe)Q.push(P[i]);else{if(i>0){const u=(xe-P[i-1][0])/(P[i][0]-P[i-1][0]);Q.push([xe,lerp(P[i-1][1],P[i][1],u)]);}break;}}
    if(kc>0)poly(c,Q,C.text,2.5);
    [3,6,10,13,17].forEach(i=>{if(P[i][0]<=xe){const big=i===10||i===17;dot(c,P[i][0],P[i][1],big?6:4,big?C.u3:C.hot,{glow:big?12:0});}});
    SB_al(c,fin(t,9.5,.6),()=>{T(c,'가장 큰 대멸종',505,350,{size:14,w:700,color:C.u3,align:'right'});T(c,'삼엽충 · 방추충이 사라짐',505,369,{size:12.5,color:C.muted,align:'right'});
      T(c,'공룡 · 암모나이트가 사라짐',772,334,{size:12.5,color:C.muted,align:'right'});});
    SB_al(c,fin(t,10.2,.6),()=>{arw(c,542,366,584,334,C.green,2.5,9);T(c,'살아남은 생물이 다시 다양해짐',556,384,{size:12.5,color:C.green});});
    SB_al(c,fin(t,8.8,.6),()=>{T(c,'표준 화석',92,441,{size:12.5,color:C.muted,align:'right'});T(c,'환경 · 생물',92,463,{size:12.5,color:C.muted,align:'right'});
      [['삼엽충 · 방추충','오존층 형성 → 생물이 육지로'],['암모나이트 · 공룡','빙하기 없이 온난 · 판게아 분리'],['화폐석 · 매머드','포유류 · 속씨식물 번성']].forEach((d,i)=>{const e=SB_ERA[i+1],x=(gx(e[0])+gx(e[1]))/2;
        K(c,d[0],x,441,{size:14,w:600,color:e[3]});K(c,d[1],x,463,{size:12.5});});});
    SB_al(c,fin(t,10.8,.6),()=>K(c,'대멸종 → 서식지와 먹이가 빔 → 살아남은 생물이 퍼져 적응 → 생물 다양성이 다시 늘어남',480,503,{size:14.5}));
    if(t>12){const u=((t-12)%4)/4,xx=lerp(100,880,u);let i=1;while(i<P.length-1&&P[i][0]<xx)i++;const v=(xx-P[i-1][0])/(P[i][0]-P[i-1][0]);dot(c,xx,lerp(P[i-1][1],P[i][1],v),5,C.u1,{glow:12});}
  }});

/* ───────── Ⅳ-3 변이와 자연선택 ───────── */
const SB_NS=(()=>{const ord=[...Array(40).keys()].sort((a,b)=>rnd(a+100)-rnd(b+100)),g=ord.slice(0,20),b=ord.slice(20);   // 초록 20 · 갈색 20, 그중 초록 5 · 갈색 15 를 집어낸다
  return {green:new Set(g),pos:i=>[77.5+(i%8)*55+(rnd(i)-.5)*20,102+Math.floor(i/8)*56+(rnd(i+50)-.5)*20],
    out:[...g.slice(0,5),...b.slice(0,15)].sort((x,y)=>rnd(x+200)-rnd(y+200)),stay:[...g.slice(5),...b.slice(15)]};})();
S.push({u:3,ch:'지질 시대와 생물 다양성',title:'변이와 자연선택',file:'06-earth-history-diversity.html',
  sub:'초록색 천 위의 조각 40개에서 눈에 띄는 것부터 집어내고, 남은 것이 2배로 늘어납니다. 조각은 그대로인데 집단의 비율이 달라집니다.',
  fx:[{w:1,f:'변이 → 생존 경쟁 → 자연선택 → 진화',n:'과잉 생산에서 출발'},{w:1,f:'초록 20 : 갈색 20 → 15 : 5 → 30 : 10',n:'초록 비율 50 % → 75 %'},{w:1,f:'색 = 변이 · 천 = 환경 · 집는 사람 = 포식자',n:'모의실험의 대응'}],
  pts:['<em>변이가 먼저</em> 있고 환경이 그중에서 고릅니다. 환경이 필요한 변이를 만들어 주는 것이 아닙니다.','초록색 천에서는 초록 조각이 덜 띄어 더 많이 살아남고 → 자손을 더 남겨 → <em>집단에서 비율</em>이 높아집니다.','함정: ‘개체가 변했다’는 틀리고 ‘집단의 비율이 변했다’가 맞습니다. 내성 세균도 항생제 때문에 생긴 것이 아니라 <em>원래 있던 것이 살아남은 것</em>입니다.','‘유리하다’는 환경에 따라 달라집니다. 배경이 갈색이면 갈색 조각이 유리합니다.'],
  dur:16,still:11.5,
  draw(c,t){
    const GD='#57B868',BR='#D0894A',N=SB_NS;
    T(c,'초록색 천 = 환경',50,52,{size:15,w:600,color:GD});T(c,'조각 40개 · 색 = 변이',490,52,{size:13,color:C.muted,align:'right'});
    rr(c,50,74,440,280,10,'rgba(60,150,85,.30)','rgba(110,200,130,.6)',1.5);
    const D=(i,x,y,a,r=11)=>{const g=N.green.has(i);SB_al(c,a,()=>dot(c,x,y,r,g?GD:BR,{stroke:g?'rgba(20,60,30,.55)':'rgba(255,230,200,.75)',lw:1.5}));};
    N.stay.forEach((i,j)=>{const p=N.pos(i);D(i,p[0],p[1],fin(t,.3+j*.03,.4));
      const q=N.pos(N.out[j]),kk=ease(seg(t,8+j*.06,8.9+j*.06));if(kk>0)D(i,lerp(p[0],q[0],kk),lerp(p[1],q[1],kk),Math.min(1,kk*3));});   // 번식: 빈자리로 자손이 퍼짐
    N.out.forEach((i,m)=>{const p=N.pos(i),t0=3+m*.17,kk=seg(t,t0,t0+.5),a=fin(t,.3+m*.03,.4)*(1-kk);D(i,p[0],p[1]-kk*26,a);
      if(t>t0-.25&&t<t0+.5)dot(c,p[0],p[1]-kk*26,17,null,{stroke:C.text,lw:2});});   // 집어냄
    const ph=t<3?0:t<6.5?1:t<8?2:3;
    dot(c,752,60,7,GD);T(c,'초록',764,60,{size:14});dot(c,852,60,7,BR);T(c,'갈색',864,60,{size:14});
    [['① 처음','20','20',.4],['② 눈에 띄는 것부터 집어냄','−5','−15',3],['③ 남은 조각','15','5',6.5],['④ 2배로 번식','30','10',8]].forEach((d,i)=>{const y=98+i*38,a=fin(t,d[3],.5);SB_al(c,a,()=>{
      if(i===ph)rr(c,524,y-16,396,32,8,ra(SB_G,.12),ra(SB_G,.6),1.2);T(c,d[0],536,y,{size:14.5,w:i===ph?700:500});
      K(c,d[1],770,y,{size:16,w:700,color:GD,font:MONO});K(c,d[2],870,y,{size:16,w:700,color:BR,font:MONO});});});
    const q=seg(t,3,6.4),r=(20-5*q)/(40-20*q);
    T(c,'초록 조각의 비율',524,262,{size:14,color:C.muted});
    box(c,524,278,396,28,6,BR,null,0,{alpha:.85});box(c,524,278,396*r,28,6,GD,null,0);K(c,Math.round(r*100)+' %',524+396*r/2,292.5,{size:15,w:700,color:SB_INK});
    SB_al(c,fin(t,6.6,.5),()=>{T(c,'50 % → 75 %',524,328,{size:17,w:700,color:GD});T(c,'조각 하나하나는 그대로 — 달라진 것은 집단의 비율',524,353,{size:13.5});});
    [['조각의 색 = 변이 (먼저 있다)',GD],['초록색 천 = 환경 (고르는 기준)',C.u2],['집는 사람 = 포식자',C.u3]].forEach((d,i)=>{const x=50+i*293,a=fin(t,9+i*.4,.5);rr(c,x,382,283,42,10,ra(d[1],.08),ra(d[1],.6),1.4,a);SB_al(c,a,()=>K(c,d[0],x+141.5,403,{size:15,w:600}));});
    SB_al(c,fin(t,10.3,.5),()=>{K(c,'변이가 먼저 있다 → 환경이 그중에서 고른다 → 살아남은 쪽이 자손을 남긴다 → 비율이 달라진다',480,456,{size:14.5});
      K(c,'배경을 갈색 천으로 바꾸면 → 이번에는 갈색 조각의 비율이 높아진다 (‘원래 더 뛰어난 색’은 없다)',480,490,{size:13.5,color:C.muted});});
  }});

/* ───────── Ⅳ-4 생물 다양성의 세 수준 ───────── */
S.push({u:3,ch:'지질 시대와 생물 다양성',title:'생물 다양성 — 세 수준과 종 다양성 비교',file:'06-earth-history-diversity.html',
  sub:'생물 다양성은 유전자·종·생태계 세 수준으로 봅니다. 종 다양성은 종의 수와 종별 개체 수가 고른 정도를 함께 따집니다.',
  fx:[{w:1,f:'유전적 다양성 · 종 다양성 · 생태계 다양성',n:'세 수준'},{w:1,f:'종 다양성 = 종의 수 + 고른 정도',n:'개체 수 합계로는 판단하지 않음'},{w:1,f:'A(25×4) > B(85·5·5·5),  A(4종) > C(2종)',n:'지역 비교'}],
  pts:['<em>유전적 다양성</em>이 높으면 환경이 급변하거나 전염병이 돌아도 살아남는 개체가 있어 → 멸종 위험이 낮습니다.','<em>종 다양성</em>이 높으면 먹이 관계가 복잡해져 → 한 종이 사라져도 생태계가 안정적으로 유지됩니다.','함정: 종의 수가 같으면 종 다양성도 같다고 보면 틀립니다. 종별 개체 수가 <em>고를수록</em> 높습니다.','같은 종 무당벌레의 무늬 차이는 종 다양성이 아니라 <em>유전적 다양성</em>입니다.'],
  dur:15,still:10,
  draw(c,t){
    const L=[['유전적 다양성','같은 종 안에서 형질이 다양','예: 무당벌레의 무늬',C.u3],['종 다양성','종의 수가 많고 · 고르게 분포','예: 숲의 여러 식물 · 곤충 · 새',SB_G],['생태계 다양성','한 지역에 생태계가 다양','예: 숲 · 습지 · 갯벌 · 강 · 바다',C.u2]];
    L.forEach((d,i)=>{const x=40+i*300,a=fin(t,.2+i*.6,.6);rr(c,x,34,280,116,12,ra(d[3],.07),ra(d[3],.55),1.4,a);SB_al(c,a,()=>{
      T(c,d[0],x+16,56,{size:17,w:700,color:d[3]});T(c,d[1],x+16,81,{size:14});T(c,d[2],x+16,134,{size:12.5,color:C.muted});
      for(let j=0;j<6;j++){const px=x+28+j*30,py=108+Math.sin(t*2+j+i)*1.5;
        if(i===0){dot(c,px,py,10,'#E0604A',{stroke:'#FFC2B5',lw:1.2});poly(c,[[px,py-10],[px,py+10]],'#5a1d14',1.2);for(let q=0;q<j;q++)dot(c,px+(q%2?4.5:-4.5),py-5+Math.floor(q/2)*5,1.7,'#2a0d08');}
        else if(i===1){const col=['#7BE07F','#F4B544','#4FD1E8','#FF7A8A','#B69CFF','#E6EDF5'][j];
          if(j%3===0)dot(c,px,py,9,col);else if(j%3===1)poly(c,[[px,py-10],[px+10,py+8],[px-10,py+8]],col,0,{close:true,fill:col});else box(c,px-8,py-8,16,16,3,col);}
        else if(j<5)box(c,x+18+j*36,98,32,20,4,['#3F9A55','#3E8F8A','#A98958','#4C8FD9','#2F5FAF'][j],'rgba(255,255,255,.35)',1);}});
      if(i<2)arw(c,x+282,92,x+298,92,C.dim,2,7,a);});
    const R=[['지역 B',[85,5,5,5],'4종 · 한 종에 치우침',180],['지역 A',[25,25,25,25],'4종 · 고르다',480],['지역 C',[50,50],'2종 · 고르다',780]],SC=['#7BE07F','#F4B544','#4FD1E8','#FF7A8A'];
    R.forEach((d,i)=>{const cx=d[3],a=fin(t,2.2+i*.8,.5),n=d[1].length,bw=36,gp=14,x0=cx-(n*bw+(n-1)*gp)/2;SB_al(c,a,()=>{
      K(c,d[0],cx,180,{size:16,w:700,color:i===1?C.u1:C.text});poly(c,[[cx-110,410],[cx+110,410]],C.dim,1.5);
      d[1].forEach((v,j)=>{const h=v*2.2*fin(t,2.5+i*.8+j*.12,.8),x=x0+j*(bw+gp);box(c,x,410-h,bw,h,4,ra(SC[j],.7),SC[j],1.2);K(c,String(v),x+bw/2,410-h-12,{size:13,font:MONO});});
      K(c,d[2],cx,430,{size:13.5,color:C.muted});});});
    SB_al(c,fin(t,5.6,.5),()=>{K(c,'<',330,320,{size:40,w:700,color:C.u1,font:MONO});K(c,'종 수가 같다 → 고른 쪽(A)이 높다',330,464,{size:14,w:600});});
    SB_al(c,fin(t,7,.5),()=>{K(c,'>',630,320,{size:40,w:700,color:C.u1,font:MONO});K(c,'고른 정도가 같다 → 종 수 많은 쪽(A)이 높다',630,464,{size:14,w:600});});
    SB_al(c,fin(t,8.4,.5),()=>K(c,'종 다양성 = 종의 수 + 종별 개체 수가 고른 정도   (전체 개체 수는 세 지역 모두 100)',480,502,{size:14.5}));
  }});

/* ───────── Ⅳ-5 산화와 환원: 산소의 이동 ───────── */
S.push({u:3,ch:'화학 변화',title:'산화와 환원 — 산소의 이동',file:'07-chemical-change.html',
  sub:'산화 구리(Ⅱ)와 탄소를 섞어 가열하면 산소가 구리에서 탄소로 옮겨 갑니다. 산소를 잃은 쪽은 환원, 얻은 쪽은 산화입니다.',
  fx:[{w:1,f:'산화: 산소를 얻음 · 환원: 산소를 잃음'},{w:1,f:'2CuO + C → 2Cu + CO₂',n:'CuO 환원 · C 산화'},{w:1,f:'광합성: CO₂ 환원 · 연소: 연료 산화 · 제련: 산화 철 환원',n:'역사를 바꾼 세 반응'}],
  pts:['산소를 잃는 물질이 있으면 그 산소를 얻는 물질이 반드시 있어서 → <em>산화와 환원은 항상 함께</em> 일어납니다.','검은색 가루가 <em>붉은색</em>이 되는 것은 환원(CuO → Cu), 석회수가 <em>뿌옇게</em> 흐려지는 것은 산화(C → CO₂)의 증거입니다.','함정: 광합성에서 이산화 탄소는 산화가 아니라 <em>환원</em>되어 포도당이 됩니다. 포도당이 산화되는 것은 세포 호흡입니다.'],
  dur:16,still:11.5,
  draw(c,t){
    const RD=C.u2,OX=SB_O,OC='#FF6B6B';
    K(c,'2CuO  +  C   →   2Cu  +  CO₂',280,40,{size:22,w:600,font:MONO});
    const k1=ease(seg(t,2.2,5)),k2=ease(seg(t,3.2,6));
    [[140,k1],[250,k2]].forEach(d=>{dot(c,120,d[0],34,SB_mix('#2A2E35','#C5673A',d[1]),{stroke:SB_mix('#7C8794','#F0A070',d[1]),lw:2.5});K(c,'Cu',120,d[0]+1,{size:17,w:700});});
    dot(c,380,195,24,'#39424E',{stroke:'#AAB6C4',lw:2.5});K(c,'C',380,196,{size:17,w:700});
    [[173,140,334,k1],[173,250,426,k2]].forEach(d=>{const x=lerp(d[0],d[2],d[3]),y=lerp(d[1],195,d[3])-Math.sin(d[3]*Math.PI)*46;
      dot(c,x,y,19,ra(OC,.3),{stroke:OC,lw:2.5,glow:d[3]>0&&d[3]<1?12:0});K(c,'O',x,y+1,{size:15,w:700});});
    SB_al(c,1-fin(t,4.6,.6),()=>K(c,'검은색 산화 구리(Ⅱ) + 탄소 가루를 가열',250,330,{size:14,color:C.muted}));
    SB_al(c,fin(t,5.2,.6),()=>{K(c,'CuO → Cu',120,308,{size:16,w:700});K(c,'산소를 잃음 = 환원',120,333,{size:15,w:600,color:RD});K(c,'검은색 → 붉은색',120,357,{size:13,color:C.muted});});
    SB_al(c,fin(t,6,.6),()=>{K(c,'C → CO₂',380,250,{size:16,w:700});K(c,'산소를 얻음 = 산화',380,275,{size:15,w:600,color:OX});});
    const kg=fin(t,6.4,.6);
    if(kg>0){c.save();c.globalAlpha*=kg;flow(c,[[400,165],[470,100],[700,100],[700,205]],t,'#AAB6C4',5,4,.22);c.restore();SB_al(c,kg,()=>K(c,'CO₂ 기체',585,82,{size:13,color:C.muted}));}
    const km=fin(t,7.6,2.4);
    box(c,642,205,216,123,0,SB_mix('#1B3550','#C9D3DC',km*.8),null,0);poly(c,[[640,170],[640,330],[860,330],[860,170]],'#7FA6CC',2.5);K(c,'석회수',770,188,{size:13,color:C.muted});
    SB_al(c,fin(t,8.8,.6),()=>{K(c,'뿌옇게 흐려짐',750,268,{size:16,w:700,color:SB_INK});K(c,'석회수가 흐려짐 → CO₂가 생겼다는 증거',750,352,{size:13.5});});
    SB_al(c,fin(t,9.3,.6),()=>K(c,'산소가 CuO에서 C로 옮겨 간다 → 환원과 산화는 항상 함께 일어난다',400,398,{size:15,w:600}));
    [['광합성',['CO₂ → 포도당 : 환원',RD],['H₂O → O₂ : 산화',OX]],['화석 연료의 연소',['CH₄ + 2O₂ → CO₂ + 2H₂O',C.text],['메테인이 산소를 얻음 : 산화',OX]],['철의 제련',['Fe₂O₃ → Fe : 환원',RD],['CO → CO₂ : 산화',OX]]].forEach((d,i)=>{
      const x=40+i*300,a=fin(t,9.8+i*.4,.5);rr(c,x,424,280,92,10,'rgba(255,255,255,.03)',C.line,1.4,a);
      SB_al(c,a,()=>{T(c,d[0],x+16,444,{size:15,w:700,color:C.u1});T(c,d[1][0],x+16,470,{size:14.5,color:d[1][1]});T(c,d[2][0],x+16,496,{size:14.5,color:d[2][1]});});});
  }});

/* ───────── Ⅳ-6 산화와 환원: 전자의 이동 ───────── */
S.push({u:3,ch:'화학 변화',title:'산화와 환원 — 전자의 이동과 이온 수',file:'07-chemical-change.html',
  sub:'질산 은 수용액에 구리선을 넣으면 구리가 전자를 잃고 녹아 나오고, 은 이온이 전자를 얻어 붙습니다. 이온 수는 전하로 셉니다.',
  fx:[{w:1,f:'산화: 전자를 잃음 · 환원: 전자를 얻음'},{w:1,f:'Cu + 2Ag⁺ → Cu²⁺ + 2Ag',n:'Cu 산화 · Ag⁺ 환원'},{w:1,f:'잃은 전자 수 = 얻은 전자 수',n:'Ag⁺ 6개 → Cu²⁺ 3개'}],
  pts:['구리 원자 1개가 전자 2개를 잃으면 → Ag⁺ 2개가 전자를 1개씩 얻습니다. 그래서 <em>양이온 수는 6에서 3으로</em> 줄어듭니다.','반응에 참여하지 않는 <em>음이온(NO₃⁻) 수와 전하의 합</em>은 변하지 않습니다. (+1)×6 = (+2)×3.','함정: 산소는 얻으면 산화인데 전자는 <em>잃으면</em> 산화입니다. 금속이 산화되는 까닭은 산소를 얻어서가 아니라 전자를 잃어서입니다.','용액의 푸른색은 Cu²⁺ 때문입니다. 구리가 녹아 나올수록 용액이 푸르러집니다.'],
  dur:16,still:11.5,
  draw(c,t){
    const AG='#C9D3DC',CU='#6EA8FF',NO='#8FB39A',EV=[2,4.6,7.2],AL=[[110,200],[135,295],[95,345]],AR=[[390,200],[365,295],[405,345]],CR=[[335,190],[170,190],[250,395]];
    const nE=EV.filter(e=>t>=e+1.5).length,sE=EV.reduce((s,e)=>s+fin(t,e+1.5,.4),0);
    box(c,62,150,376,278,0,ra(CU,.04+.07*sE),null,0);poly(c,[[60,120],[60,430],[440,430],[440,120]],'#7FA6CC',2.5);
    box(c,236,50,28,300,4,'#C5673A','#F0A070',1.5);K(c,'구리선 Cu',250,34,{size:14,color:'#F0A070',w:600});
    K(c,'질산 은 수용액',350,135,{size:13,color:C.muted});dot(c,80,135,4,C.u1,{glow:8});T(c,'전자 e⁻',90,135,{size:12.5,color:C.u1});
    [[165,245],[175,345],[110,405],[335,245],[325,345],[390,405]].forEach((p,i)=>SB_ion(c,p[0]+Math.sin(t*1.1+i)*3,p[1]+Math.cos(t*.9+i*2)*3,17,NO,'NO₃⁻'));
    EV.forEach((e,k)=>{const yk=185+k*50,km=ease(seg(t,e,e+1.2)),dn=t>=e+1.5;
      [[AL[k],221],[AR[k],279]].forEach((d,j)=>{const x=lerp(d[0][0],d[1],km)+Math.sin(t*1.3+k+j)*3*(1-km),y=lerp(d[0][1],yk,km);
        if(dn){dot(c,x,y,13,AG,{stroke:'#F2F5F8',lw:1.5});K(c,'Ag',x,y+.5,{size:12,w:700,color:SB_INK});}else SB_ion(c,x,y,15,AG,'Ag⁺');
        const ke=seg(t,e+.9,e+1.5);if(ke>0&&ke<1)dot(c,lerp(250,d[1],ke),yk,4.5,C.u1,{glow:10});});
      if(dn){const kc=ease(seg(t,e+1.5,e+2.4));SB_ion(c,lerp(250,CR[k][0],kc),lerp(yk+25,CR[k][1],kc),16,CU,'Cu²⁺');}});
    T(c,'Cu → Cu²⁺ + 2e⁻',60,456,{size:15,w:600});T(c,'전자를 잃음 = 산화',250,456,{size:15,w:700,color:SB_O});
    T(c,'2Ag⁺ + 2e⁻ → 2Ag',60,482,{size:15,w:600});T(c,'전자를 얻음 = 환원',250,482,{size:15,w:700,color:C.u2});
    T(c,'용액이 점점 푸른색 ← Cu²⁺이 녹아 나옴',60,510,{size:13,color:CU});
    T(c,'이온 수 세기',510,56,{size:17,w:700});T(c,'Ag⁺ 6개가 모두 반응할 때',618,57,{size:13,color:C.muted});
    [['Ag⁺',6-2*sE,6-2*nE,AG,''],['Cu²⁺',sE,nE,CU,''],['NO₃⁻',6,6,NO,'일정'],['양이온 수',6-sE,6-nE,C.text,'감소'],['양전하의 합',6,'+6',SB_O,'일정'],['음전하의 합',6,'−6',NO,'일정']].forEach((d,i)=>{const y=100+i*46+(i>2?14:0);
      T(c,d[0],510,y,{size:15,w:600,color:d[3]});bar(c,630,y-8,200,16,d[1]/6,d[3]);K(c,String(d[2]),858,y,{size:16,w:700,font:MONO});if(d[4])T(c,d[4],884,y,{size:12.5,color:C.muted});});
    poly(c,[[510,222],[920,222]],C.line,1.2,{dash:[3,4]});
    [['잃은 전자 수 = 얻은 전자 수  (Cu 1개 : Ag⁺ 2개)',8.8],['반응하지 않는 음이온(NO₃⁻)의 수는 그대로',9.3],['전하가 다른 이온끼리 바뀌면 양이온 수가 변한다',9.8]].forEach((d,i)=>{const y=402+i*29,a=fin(t,d[1],.5);chk(c,520,y,6,C.green,a);SB_al(c,a,()=>T(c,d[0],538,y,{size:14.5}));});
    SB_al(c,fin(t,10.4,.5),()=>T(c,'Ag⁺ 6개 → Cu²⁺ 3개 :  (+1)×6 = (+2)×3 = +6',520,496,{size:14.5,w:600,color:SB_O}));
  }});

/* ───────── Ⅳ-7 중화 반응과 이온 수 변화 ───────── */
S.push({u:3,ch:'화학 변화',title:'중화 반응 — 이온 수의 변화',file:'07-chemical-change.html',
  sub:'묽은 염산에 수산화 나트륨 수용액을 조금씩 넣습니다. H⁺과 OH⁻이 1 : 1로 만나 물이 되고, 나머지 이온은 그대로 남습니다.',
  fx:[{w:1,f:'H⁺ + OH⁻ → H₂O',n:'1 : 1로 반응'},{w:1,f:'중화점까지: H⁺ 감소 · Na⁺ 증가 · Cl⁻ 일정 · 전체 일정'},{w:1,f:'중화점 뒤: OH⁻ · Na⁺ 증가 → 전체 증가'},{w:1,f:'BTB: 노란색 → 초록색 → 파란색',n:'산성 → 중성 → 염기성'}],
  pts:['H⁺ 1개가 사라질 때 Na⁺ 1개가 들어오므로 → 중화점까지 <em>전체 이온 수는 일정</em>합니다. 그 뒤에는 넣는 대로 늘어납니다.','<em>Na⁺과 Cl⁻은 반응에 참여하지 않습니다.</em> 섞은 용액의 액성은 H⁺과 OH⁻ 가운데 많은 쪽이 정합니다.','함정: 생성된 물 분자 수는 넣은 양이 아니라 H⁺과 OH⁻ 가운데 <em>적은 쪽</em>의 수와 같습니다.','물이 생길 때 열이 나오므로, 생성된 물이 가장 많은 혼합 용액의 온도가 가장 높습니다.'],
  dur:17,still:13.6,
  draw(c,t){
    const HC='#FF6B6B',CLC='#9AD17F',NAC=C.u1,OHC='#6EA8FF',TD=k=>1.5+(k-1)*1.7;
    const HP=[[105,285],[320,235],[160,390],[270,335]],CLP=[[215,285],[105,390],[320,390],[160,235]],NAP=[[270,235],[105,335],[215,390],[320,285],[215,335],[160,285]],OHP=[[270,285],[160,340]];
    let d=0;for(let k=1;k<=6;k++)d+=seg(t,TD(k)+.4,TD(k)+1.3);
    const nd=[1,2,3,4,5,6].filter(k=>t>=TD(k)+1.3).length,liq=d>4?SB_mix('#3E9A58','#3E6FD0',d-4):SB_mix('#C9A92E','#3E9A58',d-3);
    box(c,201,36,18,112,3,'rgba(110,168,255,.18)','#7FA6CC',1.5);poly(c,[[205,148],[210,160],[215,148]],'#7FA6CC',1.5);
    T(c,'NaOH 수용액',230,58,{size:14,color:C.muted});T(c,'Na⁺ · OH⁻',230,80,{size:12.5,color:C.dim});
    T(c,'넣은 OH⁻ : '+[1,2,3,4,5,6].filter(k=>t>=TD(k)+.4).length+'개',40,58,{size:14});T(c,'생긴 물 : '+Math.min(nd,4)+'개',40,82,{size:14,color:'#BFE3FF'});
    T(c,nd<4?'물이 생길 때마다 열 방출':nd===4?'중화점: 물 4개 생성':'H⁺이 없어 열이 안 남',40,106,{size:12.5,color:nd<=4?C.hot:C.muted});
    c.save();c.globalAlpha*=.32;box(c,72,205,276,223,0,liq,null,0);c.restore();poly(c,[[70,175],[70,430],[350,430],[350,175]],'#7FA6CC',2.5);
    CLP.forEach((p,i)=>SB_ion(c,p[0],p[1]+Math.sin(t+i)*2,15,CLC,'Cl⁻'));
    HP.forEach((p,i)=>{const t1=TD(i+1)+1.3;if(t<t1)SB_ion(c,p[0],p[1]+Math.cos(t+i)*2,15,HC,'H⁺');
      else SB_al(c,1-.4*seg(t,t1,t1+1),()=>{dot(c,p[0],p[1],15,'rgba(126,200,255,.12)',{stroke:'#7EC8FF',lw:1.5,dash:[3,3]});K(c,'H₂O',p[0],p[1]+.5,{size:12,color:'#BFE3FF'});});});
    for(let k=1;k<=6;k++){const t0=TD(k);if(t<t0)continue;const kd=seg(t,t0,t0+.4);
      if(kd<1){dot(c,210,lerp(162,205,kd),5,OHC);continue;}
      const km=ease(seg(t,t0+.4,t0+1.3)),n=NAP[k-1],o=k<=4?HP[k-1]:OHP[k-5];
      if(k>4||km<1)SB_ion(c,lerp(210,o[0],km),lerp(215,o[1],km),15,OHC,'OH⁻');
      SB_ion(c,lerp(210,n[0],km),lerp(215,n[1],km),15,NAC,'Na⁺');}
    K(c,'묽은 염산 (H⁺ 4개 · Cl⁻ 4개) + BTB 용액',210,452,{size:13.5,color:C.muted});
    const st=nd<4?0:nd===4?1:2;[['산성 · 노란색','#D9B93A'],['중성 · 초록색','#4DB36A'],['염기성 · 파란색','#5B8DEB']].forEach((s,i)=>{const x=40+i*116;
      rr(c,x,472,108,30,8,ra(s[1],i===st?.35:.08),ra(s[1],i===st?1:.4),i===st?2:1.2);K(c,s[0],x+54,487.5,{size:12.5,w:i===st?700:500,color:i===st?C.text:C.muted});});
    // 그래프: 넣은 양에 따른 이온 수
    const X=470,Y=410,gx=v=>X+v*380/6,gy=v=>Y-v*25,xp=clamp(d,0,6);
    poly(c,[[X,96],[X,Y],[X+392,Y]],C.dim,1.5);T(c,'이온 수',X-8,104,{size:12.5,color:C.muted,align:'right'});K(c,'넣은 NaOH 수용액의 양 →',X+190,430,{size:12.5,color:C.muted});
    poly(c,[[gx(4),Y],[gx(4),104]],C.muted,1.2,{dash:[4,4]});K(c,'중화점',gx(4),88,{size:13.5,w:700,color:'#4DB36A'});
    [['H⁺',HC,v=>Math.max(0,4-v),2.5,0],['Cl⁻',CLC,v=>4,2.5,0],['Na⁺',NAC,v=>v,2.5,0],['OH⁻',OHC,v=>Math.max(0,v-4),2.5,-2.5],['전체',C.text,v=>v<4?8:8+2*(v-4),3.5,0]].forEach(L=>{const pts=[];
      for(let v=0;v<xp;v+=.1)pts.push([gx(v),gy(L[2](v))+L[4]]);pts.push([gx(xp),gy(L[2](xp))+L[4]]);if(pts.length>1)poly(c,pts,L[1],L[3]);dot(c,gx(xp),gy(L[2](xp))+L[4],4,L[1]);
      T(c,L[0],X+396,gy(L[2](6)),{size:14,w:700,color:L[1]});});
    SB_al(c,fin(t,TD(4)+1.3,.5),()=>T(c,'중화점까지: H⁺ 1개가 사라질 때 Na⁺ 1개가 들어옴 → 전체 일정',470,456,{size:13.5}));
    SB_al(c,fin(t,TD(6)+1.3,.5),()=>T(c,'중화점 뒤: Na⁺ · OH⁻이 넣는 대로 쌓임 → 전체 증가',470,481,{size:13.5}));
    SB_al(c,fin(t,TD(6)+1.9,.5),()=>T(c,'물이 생기는 동안만 열이 나온다 → 생긴 물이 많을수록 나온 열이 많다',470,507,{size:13.5,color:C.hot}));
  }});

/* ───────── Ⅳ-8 물질 변화와 에너지 출입 ───────── */
S.push({u:3,ch:'화학 변화',title:'발열과 흡열 — 에너지의 출입',file:'07-chemical-change.html',
  sub:'반응물과 생성물이 가진 에너지의 높낮이 차이만큼 열이 드나듭니다. 내보내면 주위가 따뜻해지고, 받아들이면 주위가 차가워집니다.',
  fx:[{w:1,f:'발열: 반응물 > 생성물 → 열 방출',n:'주위 온도 상승'},{w:1,f:'흡열: 반응물 < 생성물 → 열 흡수',n:'주위 온도 하강'},{w:1,f:'발열: 연소 · 중화 · 세포 호흡  /  흡열: 광합성 · 증발 · 융해'}],
  pts:['반응물의 에너지가 생성물보다 크면 → 그 차이만큼 주위로 나와 <em>주위의 온도가 올라갑니다</em>(발열).','<em>광합성과 세포 호흡</em>은 짝입니다. 산화·환원의 방향도, 에너지의 출입도 서로 반대입니다.','함정: 온도계가 재는 것은 <em>주위</em>의 온도입니다. ‘흡수하니까 뜨거워진다’가 아니라, 주위는 열을 빼앗겨 차가워집니다.','상태 변화도 같습니다. 물이 얼 때는 방출, 얼음이 녹거나 물이 증발할 때는 흡수입니다.'],
  dur:14,still:6.5,
  draw(c,t){
    const u=(t%5)/5,kT=fin(t,1.5,3);
    const P=(ox,exo)=>{const col=exo?C.hot:'#6EA8FF',yR=exo?150:280,yP=exo?280:150;
      T(c,exo?'발열':'흡열',ox+50,48,{size:21,w:700,color:col});T(c,exo?'열을 주위로 내보낸다':'열을 주위에서 받아들인다',ox+104,49,{size:15});
      arrow(c,ox+80,335,ox+80,98,C.dim,1.5,8);T(c,'에너지',ox+90,102,{size:12.5,color:C.muted});
      poly(c,[[ox+110,yR],[ox+215,yR]],C.text,3);K(c,'반응물',ox+162,yR+(exo?-17:19),{size:14.5,w:600});
      poly(c,[[ox+265,yP],[ox+370,yP]],C.text,3);K(c,'생성물',ox+318,yP+(exo?19:-17),{size:14.5,w:600});
      poly(c,[[ox+215,yR],[ox+250,yR]],C.dim,1.2,{dash:[3,4]});poly(c,[[ox+230,yP],[ox+265,yP]],C.dim,1.2,{dash:[3,4]});
      arrow(c,ox+240,yR+(exo?5:-5),ox+240,yP+(exo?-5:5),col,3.5,12);T(c,exo?'차이만큼 방출':'모자란 만큼 흡수',ox+254,215,{size:14,w:600,color:col});
      const bx=u<.25?lerp(162,240,u/.25):u<.75?240:lerp(240,318,(u-.75)/.25),by=u<.25?yR:u<.75?lerp(yR,yP,ease((u-.25)/.5)):yP;dot(c,ox+bx,by,7,C.u1,{glow:12});
      [185,245].forEach((y,j)=>{if(exo)wavy(c,ox+366,y,ox+410,y,C.hot,12,3.5,t*6+j,2);else wavy(c,ox+410,y,ox+366,y,'#6EA8FF',12,3.5,t*6+j,2);});
      const lv=lerp(.45,exo?.82:.14,kT)+Math.sin(t*2)*.008;
      box(c,ox+419,118,12,192,6,'#0E1B2A',C.muted,1.5);box(c,ox+421,120+188*(1-lv),8,188*lv+6,4,col,null,0);dot(c,ox+425,318,11,col,{stroke:C.muted,lw:1.5});
      K(c,exo?'주위 온도 ↑':'주위 온도 ↓',ox+425,348,{size:13.5,w:700,color:col});
      rr(c,ox+40,368,410,62,10,ra(col,.06),ra(col,.4),1.2);
      K(c,exo?'연소 · 중화 반응 · 손난로(철 가루의 산화)':'광합성 · 냉찜질 팩(질산 암모늄의 용해)',ox+245,387,{size:14});
      K(c,exo?'세포 호흡 · 물이 얼 때 · 수증기 → 물':'얼음이 녹을 때 · 물의 증발 · 드라이아이스의 승화',ox+245,411,{size:14});};
    P(0,true);P(450,false);poly(c,[[470,30],[470,356]],C.line,1.5);
    K(c,'온도계가 재는 것은 ‘주위’의 온도 — 열을 흡수하는 변화가 일어나면 주위는 차가워진다',480,464,{size:15,w:600});
    K(c,'광합성(흡열) ↔ 세포 호흡(발열): 산화·환원의 방향도, 에너지의 출입도 반대',480,498,{size:14,color:C.muted});
  }});

/* ───────── Ⅴ-1 생태 피라미드 ───────── */
S.push({u:4,ch:'생태계와 환경',title:'생태 피라미드 — 에너지양과 넘어간 비율',file:'08-ecosystem-environment.html',
  sub:'에너지는 먹이 관계를 따라 한 방향으로 흐르고, 단계마다 호흡으로 열이 되어 빠져나갑니다. 줄어드는 것은 에너지양이고, 넘어간 비율은 따로 계산합니다.',
  fx:[{w:1,f:'넘어간 비율(%) = 그 단계 ÷ 바로 아래 단계 × 100'},{w:1,f:'2000 → 200 → 30 → 6',n:'에너지양은 줄어든다'},{w:1,f:'10 % → 15 % → 20 %',n:'비율은 커질 수 있다'},{w:1,f:'에너지는 흐르고 · 물질은 순환한다'}],
  pts:['각 단계의 생물이 에너지의 많은 부분을 <em>호흡에 써서 열로</em> 내보내므로 → 위 단계로 갈수록 에너지양이 줄어듭니다.','에너지는 순환하지 않고 열로 빠져나가므로 → 생태계가 유지되려면 <em>태양 에너지가 계속</em> 들어와야 합니다.','함정: 층의 넓이만 보고 ‘위로 갈수록 넘어가는 비율도 작아진다’고 하면 틀립니다. <em>양과 비율</em>은 자료의 수로 따로 나눕니다.'],
  dur:16,still:11.5,
  draw(c,t){
    const LV=[['생산자',2000,420,370,'#7BE07F'],['1차 소비자',200,300,294,'#F4B544'],['2차 소비자',30,190,218,'#FF9A4D'],['3차 소비자',6,124,142,'#FF7A8A']],cx=300;
    dot(c,62,96,22,C.u1,{glow:16+5*Math.sin(t*3)});for(let j=0;j<8;j++){const a=j*TAU/8+t*.3;poly(c,[[62+Math.cos(a)*29,96+Math.sin(a)*29],[62+Math.cos(a)*38,96+Math.sin(a)*38]],C.u1,2.5);}
    T(c,'태양의 빛에너지',108,84,{size:13.5,color:C.u1});flow(c,[[70,134],[106,368]],t,C.u1,4,4,.3);
    LV.forEach((L,i)=>{const x=cx-L[2]/2,a=fin(t,.4+i*.5,.6);SB_al(c,a,()=>{rr(c,x,L[3],L[2],52,8,ra(L[4],.2),L[4],2);
      K(c,L[0],cx,L[3]+17,{size:13.5,w:600,color:L[4]});K(c,String(L[1]),cx,L[3]+37,{size:17,w:700,font:MONO});
      wavy(c,cx+L[2]/2+6,L[3]+32,cx+L[2]/2+50,L[3]+10,C.hot,12,3.5,t*5+i,2);});});
    SB_al(c,fin(t,2.4,.6),()=>T(c,'각 단계에서 호흡 → 열',428,152,{size:13,color:C.hot}));
    T(c,'다음 단계로 넘어간 비율',630,60,{size:16,w:700});T(c,'= 그 단계 ÷ 바로 아래 단계 × 100',630,84,{size:13,color:C.muted});
    [['생산자 → 1차 소비자','200 ÷ 2000 =','10 %',10,4],['1차 → 2차 소비자','30 ÷ 200 =','15 %',15,6],['2차 → 3차 소비자','6 ÷ 30 =','20 %',20,8]].forEach((d,i)=>{const y=126+i*74,a=fin(t,d[4],.5),gy=358-i*76;
      SB_al(c,a,()=>{T(c,d[0],630,y,{size:13,color:C.muted});T(c,d[1],630,y+24,{size:16,font:MONO});T(c,d[2],790,y+24,{size:18,w:700,color:C.u1,font:MONO});
        bar(c,630,y+41,290,10,d[3]/29*fin(t,d[4]+.3,.8),C.u1);T(c,d[2],cx+14,gy,{size:13,w:700,color:C.u1});});
      arw(c,cx,gy+9,cx,gy-9,C.u1,2.5,8,a);});
    SB_al(c,fin(t,9.6,.6),()=>{T(c,'에너지양  2000 → 200 → 30 → 6',630,360,{size:14.5});T(c,'줄어든다',920,360,{size:14.5,w:700,color:C.hot,align:'right'});
      T(c,'비율  10 → 15 → 20 %',630,386,{size:14.5});T(c,'커졌다',920,386,{size:14.5,w:700,color:C.green,align:'right'});
      T(c,'→ ‘양’과 ‘비율’은 따로 계산한다',630,414,{size:15,w:700,color:C.u1});});
    SB_al(c,fin(t,10.4,.6),()=>{K(c,'에너지: 태양 → 생산자 → 소비자, 한 방향으로 흐르며 열로 빠져나간다 (순환하지 않는다)',480,468,{size:14.5});
      K(c,'물질(탄소): 생산자 → 소비자 → 분해자 → 환경 → 다시 생산자로 순환한다',480,498,{size:14.5,color:C.muted});});
  }});

/* ───────── Ⅴ-2 생태계 평형의 회복 ───────── */
S.push({u:4,ch:'생태계와 환경',title:'생태계 평형 — 먹이 관계가 되돌린다',file:'08-ecosystem-environment.html',
  sub:'1차 소비자가 잠깐 늘면 먹이인 생산자는 줄고 포식자인 2차 소비자는 늘어, 다시 1차 소비자가 줄어듭니다. 다섯 단계를 거쳐 처음 상태로 돌아옵니다.',
  fx:[{w:1,f:'1차 ↑ → 생산자 ↓ · 2차 ↑ → 1차 ↓ → 생산자 ↑ · 2차 ↓ → 회복'},{w:1,f:'먹이 쪽은 반대로 · 잡아먹는 쪽은 같은 방향으로'},{w:1,f:'봉우리가 먼저 나오는 곡선 = 피식자',n:'포식자가 뒤따른다'}],
  pts:['먹이는 줄고 잡아먹는 쪽은 늘었으므로 → 늘어났던 1차 소비자가 <em>다시 줄어듭니다</em>. 이 되돌림이 평형을 유지합니다.','<em>먹이 그물이 복잡할수록</em> 다른 먹이로 바꿀 수 있어 충격이 흩어지고 평형이 잘 유지됩니다.','함정: 개체수 변동 그래프에서 <em>먼저 늘어나는 쪽이 피식자</em>입니다. 포식자가 먼저 늘어난다고 읽으면 반대로 답합니다.','되돌리는 힘에는 한계가 있습니다. 서식지 파괴·외래생물·기후변화처럼 변화가 너무 크면 회복하지 못합니다.'],
  dur:16,still:12,
  draw(c,t){
    const cx=250,B=[['2차 소비자',130,194,'#FF9A4D',[0,0,40,40,0,0]],['1차 소비자',240,262,'#F4B544',[0,60,60,0,0,0]],['생산자',360,330,'#7BE07F',[0,0,-60,-60,0,0]]];
    const s=clamp(Math.floor((t-1)/2.4),-1,4),u=s<0?0:ease(seg(t,1+s*2.4,2.5+s*2.4));
    T(c,'1차 소비자가 일시적으로 늘어나면?',50,52,{size:17,w:700});
    if(s>=0){dot(c,cx,128,24,ra(C.u1,.14),{stroke:C.u1,lw:2});K(c,String(s+1),cx,129,{size:22,w:700,color:C.u1,font:MONO});}
    if(s===4){chk(c,cx+52,128,9,C.green,u);SB_al(c,u,()=>T(c,'평형 회복',cx+70,129,{size:15,w:700,color:C.green}));}
    B.forEach(b=>{const d=s<0?0:lerp(b[4][s],b[4][s+1],u),w=b[1]+d,dir=s<0?0:Math.sign(b[4][s+1]-b[4][s]);
      poly(c,[[cx-b[1]/2,b[2]],[cx+b[1]/2,b[2]],[cx+b[1]/2,b[2]+54],[cx-b[1]/2,b[2]+54]],'rgba(230,237,245,.4)',1.2,{dash:[4,4],close:true});
      rr(c,cx-w/2,b[2],w,54,8,ra(b[3],.22),b[3],2.2);K(c,b[0],cx,b[2]+27,{size:15,w:700});
      if(dir){const x=cx+Math.max(w,b[1])/2+24;arw(c,x,b[2]+27+dir*15,x,b[2]+27-dir*15,dir>0?C.green:C.u3,4,11,.45+.55*Math.abs(Math.sin(t*3)));}});
    K(c,'점선 = 처음 크기',cx,402,{size:12.5,color:C.dim});
    K(c,'한 단계가 변하면',cx,432,{size:14,color:C.muted});K(c,'먹이 쪽은 반대로 · 잡아먹는 쪽은 같은 방향으로',cx,458,{size:15.5,w:700,color:C.u1});K(c,'먹이 그물이 복잡할수록 평형이 잘 유지된다',cx,492,{size:14});
    ['① 1차 소비자가 늘어난다','② 먹이인 생산자 ↓ · 포식자인 2차 소비자 ↑','③ 먹이는 줄고 포식자는 늘어 → 1차 소비자 ↓','④ 생산자 ↑ · 2차 소비자 ↓','⑤ 처음과 비슷한 상태로 → 평형 회복'].forEach((x,i)=>{const y=58+i*44,on=i===s,a=i<=s?1:.4;
      rr(c,500,y-17,420,34,8,on?ra(C.u1,.14):'rgba(255,255,255,.02)',on?C.u1:C.line,on?2:1.2,a);SB_al(c,a,()=>T(c,x,514,y,{size:14.5,w:on?700:500}));});
    const X=540,Y=474,GW=340,f1=v=>392-42*Math.sin(v),f2=v=>434-26*Math.sin(v-1.35),P1=[],P2=[];
    T(c,'포식자와 피식자의 개체수 변동',500,296,{size:14.5,w:700});
    poly(c,[[X,322],[X,Y],[X+GW+6,Y]],C.dim,1.5);T(c,'개체수',X-8,330,{size:12,color:C.muted,align:'right'});T(c,'시간',X+GW+6,Y+13,{size:12,color:C.muted,align:'right'});
    for(let i=0;i<=120;i++){const v=i/120*4*Math.PI,x=X+i/120*GW;P1.push([x,f1(v)]);P2.push([x,f2(v)]);}
    poly(c,P1,'#F4B544',2.5);poly(c,P2,'#FF9A4D',2.5,{dash:[6,4]});
    T(c,'피식자',X+GW+10,f1(4*Math.PI),{size:13,w:700,color:'#F4B544'});T(c,'포식자',X+GW+10,f2(4*Math.PI),{size:13,w:700,color:'#FF9A4D'});
    const xa=X+GW/8,xb=X+(Math.PI/2+1.35)/(4*Math.PI)*GW;poly(c,[[xa,350],[xa,Y]],ra(C.u1,.6),1.2,{dash:[3,3]});poly(c,[[xb,408],[xb,Y]],'rgba(255,154,77,.6)',1.2,{dash:[3,3]});
    T(c,'봉우리가 먼저',xa+8,336,{size:12.5,color:'#F4B544',w:600});
    const uu=(t*.12)%1,vv=uu*4*Math.PI;dot(c,X+uu*GW,f1(vv),5,'#F4B544',{glow:10});dot(c,X+uu*GW,f2(vv),5,'#FF9A4D',{glow:10});
    K(c,'피식자가 먼저 늘고 → 포식자가 뒤따라 늘어난다',710,510,{size:13.5,color:C.muted});
  }});

/* ───────── Ⅴ-3 지구 열수지와 온실효과 ───────── */
S.push({u:4,ch:'생태계와 환경',title:'지구 열수지와 온실효과',file:'08-ecosystem-environment.html',
  sub:'태양 복사 100 가운데 30은 반사되고 70이 흡수됩니다. 대기는 지표가 내보낸 에너지를 흡수했다가 지표로 다시 내보내 지표를 데웁니다.',
  fx:[{w:1,f:'지구 전체: 100 = 30 + 65 + 5'},{w:1,f:'대기: 20 + 135 = 65 + 90'},{w:1,f:'지표: 50 + 90 = 140',n:'재복사 90 = 온실효과의 크기'},{w:1,f:'온실 기체 ↑ → 재복사 ↑ → 지표 온도 ↑',n:'지구온난화'}],
  pts:['지표가 내보내는 140이 태양에서 받은 50보다 큰 까닭은 → 대기가 <em>재복사한 90</em>을 더 받기 때문입니다.','온실 기체가 늘면 → 대기의 흡수와 재복사가 늘어 → 지표가 받는 양이 내보내는 양보다 많아져 <em>기온이 오릅니다</em>. 태양 에너지가 늘어난 것이 아닙니다.','함정: <em>온실효과</em>는 대기가 있으면 언제나 일어나는 현상이고, <em>지구온난화</em>는 그것이 강화되어 평균 기온이 오르는 현상입니다.','숫자는 자료마다 다릅니다. 세 곳 모두 ‘들어온 양 = 나간 양’이라는 식으로 읽습니다.'],
  dur:17,still:12.5,
  draw(c,t){
    const SUN=C.u1,IR='#FF7A5C',A=a=>fin(t,a,.6),mv=(x1,y1,x2,y2,a,ph)=>{if(a>.6){const u=(t*.45+ph)%1;dot(c,lerp(x1,x2,u),lerp(y1,y2,u),3,'#fff',{alpha:.85});}};
    T(c,'우주',52,52,{size:14,color:C.dim});T(c,'복사 평형: 흡수 70 = 방출 70',920,58,{size:13.5,color:C.muted,align:'right'});
    rr(c,40,160,880,90,14,'rgba(110,168,255,.10)','rgba(110,168,255,.45)',1.5);T(c,'대기 (온실 기체)',52,234,{size:13.5,color:'#9DBBFF'});
    box(c,40,350,880,24,6,'#3a3326','#7d6b4a',1.5);T(c,'지표',52,362,{size:13.5,color:'#D9C7A0',w:600});
    SB_fat(c,190,44,190,196,SUN,18,A(.4));mv(190,44,190,186,A(.4),0);SB_al(c,A(.4),()=>T(c,'태양 복사 100',208,62,{size:15,w:700,color:SUN}));
    SB_fat(c,176,168,112,48,SUN,5.5,A(1.3));mv(176,168,116,56,A(1.3),.3);SB_al(c,A(1.3),()=>T(c,'반사 30',128,112,{size:14,color:SUN,align:'right'}));
    SB_al(c,A(2),()=>{dot(c,190,210,7,SUN,{glow:12});T(c,'대기가 흡수 20',208,208,{size:14,color:SUN});});
    SB_fat(c,190,224,190,350,SUN,9,A(2.7));mv(190,224,190,340,A(2.7),.5);SB_al(c,A(2.7),()=>T(c,'지표가 흡수 50',206,304,{size:14,color:SUN}));
    SB_fat(c,440,350,440,254,IR,24,A(3.8));mv(440,348,440,266,A(3.8),.1);SB_al(c,A(3.8),()=>{T(c,'지표가 내보냄 140',462,302,{size:15,w:700,color:IR});T(c,'대기가 흡수 135',462,216,{size:13.5,color:IR});});
    SB_fat(c,372,350,372,48,IR,2.2,A(4.8));mv(372,350,372,56,A(4.8),.6);SB_al(c,A(4.8),()=>T(c,'우주로 바로 5',362,112,{size:13.5,color:IR,align:'right'}));
    SB_fat(c,640,160,640,48,IR,11.5,A(5.8));mv(640,160,640,58,A(5.8),.2);SB_al(c,A(5.8),()=>T(c,'대기 → 우주 65',658,104,{size:14.5,w:600,color:IR}));
    SB_fat(c,790,250,790,350,IR,16+(t>11.5?1.5+1.5*Math.sin(t*2.5):0),A(6.8));mv(790,250,790,340,A(6.8),.4);
    SB_al(c,A(6.8),()=>{T(c,'재복사 90',770,292,{size:15,w:700,color:IR,align:'right'});T(c,'= 온실효과의 크기',770,314,{size:13,align:'right'});});
    [['지구 전체','100 = 30 + 65 + 5','태양 복사 = 반사 + 대기 · 지표의 방출'],['대기','20 + 135 = 65 + 90','흡수 = 우주로 + 지표로 재복사'],['지표','50 + 90 = 140','태양에서 + 재복사 = 내보냄']].forEach((d,i)=>{const x=40+i*300,a=A(8+i*.6);
      rr(c,x,392,280,58,10,'rgba(255,255,255,.03)',C.line,1.4,a);SB_al(c,a,()=>{T(c,d[0],x+14,410,{size:14.5,w:700,color:C.u2});T(c,d[1],x+266,410,{size:15.5,w:700,font:MONO,align:'right'});T(c,d[2],x+14,435,{size:12,color:C.muted});});});
    SB_al(c,A(10.2),()=>K(c,'온실 기체 ↑ → 대기의 흡수·재복사 ↑ (90 → 93) → 지표: 받는 143 > 내보내는 140 → 기온 ↑',480,480,{size:14.5,w:600}));
    SB_al(c,A(11),()=>K(c,'태양에서 오는 에너지(100)가 늘어난 것이 아니다 · 온실효과(늘 있는 재복사) ≠ 지구온난화(강화되어 기온 상승)',480,510,{size:13,color:C.muted}));
  }});

/* ───────── Ⅴ-4 엘니뇨 ───────── */
function SB_pac(c,y0,k,t,name){ // 적도 태평양 단면(서 ← → 동). k = 0 평상시, 1 엘니뇨
  const s=y0+62,b=y0+150,dW=lerp(62,44,k),dE=lerp(8,36,k),on=k>.5;
  T(c,name,50,y0+10,{size:16,w:700,color:on?C.u3:name==='엘니뇨'?C.dim:C.text});
  box(c,110,s,740,b-s,0,'rgba(60,110,200,.28)',null,0);poly(c,[[110,s],[850,s],[850,s+dE],[110,s+dW]],null,0,{close:true,fill:'rgba(255,140,60,.5)'});
  box(c,50,s-14,60,b-s+14,4,'#3a3326','#7d6b4a',1.5);box(c,850,s-14,60,b-s+14,4,'#3a3326','#7d6b4a',1.5);
  K(c,'서',80,s+38,{size:15,w:700,color:'#D9C7A0'});K(c,'동',880,s+38,{size:15,w:700,color:'#D9C7A0'});poly(c,[[110,s],[850,s]],'#9DBBFF',2);
  T(c,'따뜻한 표층 해수',130,s+17,{size:12.5,color:'#FFE9D2'});T(c,'차가운 해수',420,b-14,{size:12.5,color:'#B9D0FF'});
  const len=lerp(380,150,k),wx=lerp(720,710,k);arrow(c,wx,y0+42,wx-len,y0+42,C.text,lerp(6,2.5,k),lerp(14,9,k));
  K(c,on?'무역풍 약해짐':'무역풍 (동 → 서)',wx-len/2,y0+22,{size:13.5,w:600,color:on?C.u3:C.text});
  const cx=lerp(190,470,k),cy=y0+20;[[-16,4,12],[0,-3,15],[16,4,12]].forEach(p=>dot(c,cx+p[0],cy+p[1],p[2],'#C9D3DC'));
  for(let j=0;j<5;j++){const xx=cx-20+j*10,ph=(t*1.6+j*.37)%1;poly(c,[[xx,cy+18+ph*18],[xx-2,cy+24+ph*18]],'#7EC8FF',2);}
  const up=1-.75*k;for(let j=0;j<3;j++){const x=782+j*22;arw(c,x,b-6,x,b-6-44*up,'#7EC8FF',2.5,8,.4+.6*up);dot(c,x,b-6-44*up*((t*.5+j*.33)%1),2.5,'#fff',{alpha:.7*up});}
  T(c,on?'용승 약해짐':'용승',770,b-24,{size:12.5,color:'#B9D0FF',align:'right',w:600});
  for(let j=0;j<6;j++){const u=((j/6-t*.12*(1-.8*k))%1+1)%1;dot(c,110+740*u,s+5,2.5,'#FFE9D2',{alpha:.8});}
  T(c,on?'서태평양: 비가 줄어 가뭄 · 산불':'서태평양: 따뜻한 물이 모여 비가 많다',50,b+17,{size:13,color:on?C.u3:C.muted});
  T(c,on?'동태평양: 수온 높음 · 홍수 · 어획량 감소':'동태평양: 수온 낮음 · 건조 · 좋은 어장',910,b+17,{size:13,color:on?C.u3:C.muted,align:'right'});}
S.push({u:4,ch:'생태계와 환경',title:'엘니뇨 — 무역풍에서 시작하는 사슬',file:'08-ecosystem-environment.html',
  sub:'평상시에는 무역풍이 따뜻한 해수를 서쪽으로 밀고 동쪽에서는 찬 해수가 올라옵니다. 무역풍이 약해지면 이 모습이 차례로 무너집니다.',
  fx:[{w:1,f:'무역풍 약화 → 따뜻한 해수 동쪽으로 → 용승 약화 → 동태평양 수온 상승'},{w:1,f:'엘니뇨: 동태평양 홍수 · 서태평양 가뭄'},{w:1,f:'라니냐: 무역풍 강화 → 반대',n:'동태평양 수온이 평상시보다 낮음'}],
  pts:['<em>출발점은 바람</em>입니다. 무역풍이 약해져 → 따뜻한 해수가 동쪽으로 퍼지고 → 용승이 약해져 → 동태평양 수온이 오릅니다.','용승이 약해지면 영양분이 줄어 → 식물 플랑크톤이 줄고 → <em>어획량이 감소</em>합니다. 지구 현상이 생태계로 이어집니다.','함정: 수온이 올라서 용승이 약해지는 것이 아니라, <em>용승이 약해져서 수온이 오릅니다</em>. 보기는 사슬의 한 칸을 뒤집어 놓습니다.'],
  dur:16,still:11.5,
  draw(c,t){
    SB_pac(c,36,0,t,'평상시');SB_pac(c,222,ease(seg(t,4.5,8.5)),t,'엘니뇨');
    ['무역풍 약화','따뜻한 해수가 동쪽으로','동태평양 용승 약화','동태평양 수온 상승','비 오는 곳이 동쪽으로'].forEach((x,i)=>{const bx=34+i*182,on=fin(t,4.6+i*.9,.5);
      rr(c,bx,412,164,34,8,ra(C.u3,.05+.13*on),ra(C.u3,.35+.65*on),1.3+on*.7);K(c,x,bx+82,429,{size:13.5,w:600,alpha:.55+.45*on});if(i<4)arw(c,bx+166,429,bx+180,429,C.muted,2,7,.4+.6*on);});
    SB_al(c,fin(t,9.4,.6),()=>K(c,'출발점은 바람 — 수온이 올라서 용승이 약해지는 것이 아니라, 용승이 약해져서 수온이 오른다',480,474,{size:14,w:600}));
    SB_al(c,fin(t,10.2,.6),()=>K(c,'생태계로: 용승 약화 → 영양분 ↓ → 식물 플랑크톤 ↓ → 어류 ↓   ·   라니냐는 반대(무역풍 강화)',480,504,{size:13,color:C.muted}));
  }});

/* ───────── Ⅴ-5 태양에서 전기까지 ───────── */
S.push({u:4,ch:'에너지',title:'태양에서 전기까지 — 에너지 전환의 사슬',file:'09-energy.html',
  sub:'태양의 핵융합에서 나온 빛이 지구에서 여러 형태로 바뀌어 발전소까지 옵니다. 발전 방식마다 어떤 에너지를 거쳐 전기가 되는지 줄별로 따라갑니다.',
  fx:[{w:1,f:'수소 원자핵 4개 → 헬륨 원자핵 1개 + 에너지',n:'줄어든 질량이 에너지로'},{w:1,f:'화력: 화학 → 열 → 운동 → 전기',n:'핵발전: 핵 → 열 → 운동 → 전기'},{w:1,f:'수력: 위치 → 운동 → 전기 · 풍력: 운동 → 전기'},{w:1,f:'태양광: 빛 → 전기',n:'터빈 · 발전기 없음'}],
  pts:['화력 발전의 전기를 거슬러 올라가면 화석 연료 → 옛 생물의 광합성 → <em>태양의 핵융합</em>입니다. 수력·풍력도 맨 앞에 태양이 있습니다.','터빈과 발전기가 있으면 → <em>운동 에너지 → 전기 에너지</em> 단계(전자기 유도)가 들어 있습니다. 화력과 핵발전은 열원만 다릅니다.','함정: 모든 발전이 터빈을 돌리지는 않습니다. <em>태양광</em>은 태양 전지가 빛을 바로 전기로 바꿉니다.','함정: 파도(파력)는 바람에서 오므로 근원이 태양이고, <em>조력</em>은 달과 태양의 인력입니다. 핵융합 뒤 질량은 줄어듭니다.'],
  dur:16,still:10.5,
  draw(c,t){
    const SUN=C.u1,A=a=>fin(t,a,.5);
    T(c,'태양 중심의 핵융합: 수소 원자핵 4개 → 헬륨 원자핵 1개 + 에너지',40,38,{size:15,w:600});T(c,'줄어든 질량만큼 에너지가 나온다 (연소가 아니다)',40,62,{size:13,color:C.muted});
    const u=(t%2.4)/2.4,fy=50;for(let j=0;j<4;j++){const hx=520+(j%2)*15,hy=42+Math.floor(j/2)*15;dot(c,hx,hy,5.5,C.pos,{stroke:'#FFC2B5',lw:1});dot(c,lerp(hx,596,ease(u)),lerp(hy,fy,ease(u)),3.5,C.pos,{alpha:1-u});}   // 수소 원자핵 4개가 합쳐져 헬륨 원자핵 1개로
    arrow(c,548,fy,574,fy,C.muted,2,7);dot(c,596,fy,9,'#FFE38A',{glow:10+10*u});for(let j=0;j<8;j++){const a=j*TAU/8,r=14+u*10;poly(c,[[596+Math.cos(a)*r,fy+Math.sin(a)*r],[596+Math.cos(a)*(r+7),fy+Math.sin(a)*(r+7)]],SUN,2,{alpha:1-u*.8});}
    dot(c,78,235,38,SUN,{glow:22+6*Math.sin(t*2.5)});K(c,'태양',78,236,{size:17,w:700,color:'#3a2a05'});
    [['지구에서 거치는 길',230],['에너지원 (형태)',410],['열',560],['운동 (터빈)',680],['발전기',765],['전기 에너지',850]].forEach(d=>K(c,d[0],d[1],98,{size:12.5,color:d[1]===765?C.u2:C.muted}));
    box(c,740,114,50,172,8,ra(C.u2,.08),ra(C.u2,.4),1.2);rr(c,740,378,50,44,8,ra(C.u2,.08),ra(C.u2,.4),1.2,A(6.2));poly(c,[[40,360],[920,360]],C.line,1.2,{dash:[3,5]});
    const chip=(x,w,y,s,col,a,dx=0)=>{rr(c,x-w/2,y-19,w,38,9,ra(col,.1),ra(col,.65),1.4,a);SB_al(c,a,()=>K(c,s,x+dx,y,{size:13,w:600}));};
    const gap=(x1,x2,y,col,a,y1=y)=>{arw(c,x1,y1,x2,y,col,2,7,a);if(a>.9){const q=(t*.9+x1*.013+y*.007)%1;dot(c,lerp(x1,x2,q),lerp(y1,y,q),3,'#fff',{alpha:.85});}};
    [{y:140,a:1,c1:'옛 생물의 광합성',c2:'화석 연료 (화학)',heat:1,turb:1,name:'화력 발전',col:'#FF9A4D'},{y:200,a:2.2,c1:'물의 증발 · 비',c2:'높은 곳의 물 (위치)',turb:1,name:'수력 발전',col:'#4FD1E8'},
     {y:260,a:3.4,c1:'공기가 데워짐',c2:'바람 (운동)',turb:1,name:'풍력 발전',col:'#7BE07F'},{y:320,a:4.6,c1:'태양 전지에 빛이 닿음',c2:'햇빛 (빛)',name:'태양광 발전',col:'#F4B544'},
     {y:400,a:6.2,c1:'무거운 원자핵이 쪼개짐',c2:'우라늄 (핵)',heat:1,turb:1,name:'핵발전',col:'#B69CFF',nosun:1}].forEach(r=>{const a=A(r.a),y=r.y;
      if(r.nosun)SB_al(c,a,()=>{K(c,'태양에서',78,y-9,{size:12.5,color:C.u3,w:600});K(c,'오지 않음',78,y+9,{size:12.5,color:C.u3,w:600});});else gap(120,153,y,SUN,a,235+(y-235)*.3);
      chip(230,150,y,r.c1,r.col,a);gap(307,333,y,r.col,a);chip(410,150,y,r.c2,r.col,a);
      if(r.turb){if(r.heat){gap(487,523,y,r.col,a);chip(560,70,y,'열',C.hot,a);gap(597,628,y,r.col,a);}else gap(487,628,y,r.col,a);
        chip(680,100,y,'운동',r.col,a,10);SB_al(c,a,()=>{for(let j=0;j<3;j++){const an=t*3+j*TAU/3;poly(c,[[652,y],[652+Math.cos(an)*10,y+Math.sin(an)*10]],C.text,2.5);}dot(c,652,y,2.5,C.text);});
        gap(732,798,y,C.u2,a);}
      else{gap(487,798,y,r.col,a);SB_al(c,a,()=>K(c,'터빈 · 발전기를 거치지 않는다',642,y-13,{size:12.5,color:C.u1}));}
      chip(850,100,y,r.name,r.col,a);});
    SB_al(c,A(7.4),()=>K(c,'터빈·발전기가 있으면 운동 에너지 → 전기 에너지 (전자기 유도)  ·  화력과 핵발전은 열원만 다르다',480,452,{size:14,w:600}));
    SB_al(c,A(8.2),()=>K(c,'태양이 근원이 아닌 것: 핵에너지 · 지열(지구 내부의 열) · 조력(달과 태양의 인력)',480,482,{size:14}));
    SB_al(c,A(9),()=>K(c,'함정: 파도(파력)는 바람에서 오므로 근원이 태양 · 밀물과 썰물(조력)은 인력',480,510,{size:13,color:C.muted}));
  }});

/* ───────── Ⅴ-6 전자기 유도와 발전기 ───────── */
S.push({u:4,ch:'에너지',title:'전자기 유도 — 자기장이 변할 때만',file:'09-energy.html',
  sub:'자석을 코일에 가까이 하거나 멀리 하면 유도 전류가 흐르고, 코일 속에 멈춰 있으면 흐르지 않습니다. 검류계 바늘과 그래프를 함께 보세요.',
  fx:[{w:1,f:'코일을 지나는 자기장이 변한다 → 유도 전류'},{w:1,f:'가까이 ↔ 멀리: 전류 방향 반대 · 멈춤: 0'},{w:1,f:'세게: 빠르게 · 센 자석 · 많이 감기'},{w:1,f:'발전기: 운동 에너지 → 전기 에너지'}],
  pts:['조건은 ‘자기장이 있다’가 아니라 <em>‘자기장이 변한다’</em>입니다. 자석 대신 코일을 움직여도 변하므로 전류가 흐릅니다.','자석을 빠르게 움직이거나 센 자석을 쓰면 변화가 크고 빨라져 → <em>유도 전류가 세집니다</em>. 코일을 많이 감아도 세집니다.','함정: 자석이 코일 속에 <em>있기만 하면</em> 전류가 흐른다고 보면 틀립니다. 멈추면 0입니다.','실험에서 ‘떨어뜨리는 높이를 같게 한 이유’는 코일을 지날 때의 <em>빠르기를 같게</em> 하기 위해서입니다.'],
  dur:15,still:1.7,
  draw(c,t){
    const PD=10,u=t%PD,sm=k=>(1-Math.cos(Math.PI*k))/2,pos=v=>{v=((v%PD)+PD)%PD;return v<3?sm(v/3):v<5?1:v<8?1-sm((v-5)/3):0;},cur=v=>clamp((pos(v+.02)-pos(v-.02))/.04/(Math.PI/6),-1,1),p=pos(u),I=cur(u);
    const xt=lerp(300,560,p),cy=160,ph=u<3?0:u<5?1:u<8?2:3;
    T(c,'조건은 ‘자기장이 있다’가 아니라 ‘자기장이 변한다’',50,40,{size:16.5,w:700});
    const ST=[['자석이 가까워짐 → 코일을 지나는 자기장이 세짐 → 전류 흐름',C.green],['코일 속에서 멈춤 → 자기장 변화 없음 → 전류 0',C.muted],['자석이 멀어짐 → 자기장이 약해짐 → 반대 방향 전류',C.u3],['멈춤 → 자기장 변화 없음 → 전류 0',C.muted]][ph];
    K(c,ST[0],400,82,{size:14.5,w:600,color:ST[1]});
    const loop=(a0,a1,col,w)=>{for(let j=0;j<8;j++){c.save();c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.ellipse(480+j*24,cy,12,52,0,a0,a1);c.stroke();c.restore();}};
    loop(-Math.PI/2,Math.PI/2,'#6b5330',3);
    box(c,xt-170,cy-23,85,46,5,'#3E6FD0','#9DBBFF',1.5);box(c,xt-85,cy-23,85,46,5,'#D0483E','#FFB3AB',1.5);K(c,'S',xt-128,cy+1,{size:18,w:700});K(c,'N',xt-42,cy+1,{size:18,w:700});
    if(Math.abs(I)>.05){const sg=I>0?1:-1;arw(c,xt-85-sg*26,cy-40,xt-85+sg*26,cy-40,C.text,2.5,9,.5+.5*Math.abs(I));}
    loop(Math.PI/2,Math.PI*1.5,'#D9A441',3.5);K(c,'코일',564,228,{size:12.5,color:C.muted});
    const on=Math.abs(I)>.03;flow(c,[[480,212],[480,262],[850,262],[850,210]],p,on?C.u1:C.dim,6,on?4:2.5,1.5);poly(c,[[648,212],[648,246],[790,246],[790,210]],'#C9A46A',2);poly(c,[[480,212],[480,262],[850,262],[850,210]],'#C9A46A',2,{alpha:.6});
    dot(c,820,160,56,'#0E1B2A',{stroke:C.muted,lw:2.5});
    for(let j=-3;j<=3;j++){const a=-Math.PI/2+j*.3;poly(c,[[820+Math.cos(a)*42,176+Math.sin(a)*42],[820+Math.cos(a)*(j?48:52),176+Math.sin(a)*(j?48:52)]],C.muted,j?1.5:2.5);}
    const na=-Math.PI/2+I*.9;poly(c,[[820,176],[820+Math.cos(na)*40,176+Math.sin(na)*40]],I>.05?C.green:I<-.05?C.u3:C.text,3);dot(c,820,176,4,C.text);K(c,'검류계',820,198,{size:12.5,color:C.muted});
    // 그래프
    const X=90,Y=400,PX=54,G=[];poly(c,[[X,334],[X,466]],C.dim,1.5);arrow(c,X,Y,X+PD*PX+16,Y,C.dim,1.5,8);T(c,'유도 전류',X+8,330,{size:12.5,color:C.muted});T(c,'시간',X+PD*PX+16,Y+15,{size:12,color:C.muted,align:'right'});
    [3,5,8].forEach(v=>poly(c,[[X+v*PX,340],[X+v*PX,462]],C.line,1.2,{dash:[3,4]}));
    for(let v=0;v<=PD+.001;v+=.05)G.push([X+v*PX,Y-cur(Math.min(v,PD-.03))*52]);poly(c,G,C.u1,2.5);
    poly(c,[[X+u*PX,342],[X+u*PX,460]],ra(C.u1,.5),1);dot(c,X+u*PX,Y-I*52,6,C.u1,{glow:12});
    [['가까이 가져감','전류 흐름',1.5,C.green],['코일 속에서 멈춤','전류 0',4,C.muted],['멀리 가져감','반대 방향',6.5,C.u3],['멈춤','전류 0',9,C.muted]].forEach((d,i)=>{const x=X+d[2]*PX;
      K(c,d[0],x,484,{size:13,w:ph===i?700:500,color:ph===i?C.text:C.muted});K(c,d[1],x,504,{size:13,w:600,color:d[3]});});
    rr(c,680,318,245,196,12,'rgba(255,255,255,.03)',C.line,1.4);T(c,'유도 전류를 세게 하려면',696,342,{size:14.5,w:700});
    ['① 자석을 더 빠르게 움직인다','② 더 센 자석을 쓴다','③ 코일을 더 많이 감는다'].forEach((s,i)=>T(c,s,696,372+i*26,{size:13.5}));
    poly(c,[[696,446],[909,446]],C.line,1.2);T(c,'운동 에너지 → 전기 에너지',696,468,{size:14.5,w:700,color:SB_O});T(c,'발전기: 이 과정을 계속 일으킨다',696,494,{size:12.5,color:C.muted});
  }});

/* ───────── Ⅴ-7 에너지 효율 ───────── */
S.push({u:4,ch:'에너지',title:'에너지 효율 — 보존되지만 흩어진다',file:'09-energy.html',
  sub:'연료에서 얻은 1000 J이 발전소와 전등을 거치며 전기, 빛으로 바뀝니다. 전환할 때마다 일부가 다시 쓰기 어려운 열로 흩어집니다.',
  fx:[{w:1,f:'효율(%) = 유용하게 쓰인 에너지 ÷ 공급한 에너지 × 100'},{w:1,f:'공급한 에너지 = 유용한 에너지 + 버려진 에너지',n:'총량은 보존'},{w:1,f:'전환을 여러 번 거치면 효율은 곱한다',n:'0.4 × 0.3 = 0.12'}],
  pts:['전환할 때마다 일부가 <em>다시 모아 쓰기 어려운 열</em>로 흩어지므로 → 총량이 보존되어도 쓸모 있는 에너지는 줄어듭니다.','효율 40 %인 발전소의 전기를 효율 30 %인 전등에 쓰면 → 전체 효율은 <em>0.4 × 0.3 = 12 %</em>입니다.','함정: 효율은 100 %를 넘을 수 없습니다. 넘으면 분자와 분모를 바꾼 것입니다. 분모는 <em>공급한 에너지</em>입니다.','‘효율이 낮으면 에너지가 사라진다’가 아니라 ‘쓸모없는 열로 바뀐다’가 맞습니다.'],
  dur:15,still:10.5,
  draw(c,t){
    const FU='#F4B544',EL='#6EA8FF',LI='#FFE38A',HT='#FF7A5C',A=a=>fin(t,a,.6),k1=A(.5),k2=A(2.2),k3=A(4.2),k4=A(6);
    const run=(x1,x2,y,a,n=3)=>{if(a>.8)for(let j=0;j<n;j++){const q=(t*.45+j/n)%1;dot(c,lerp(x1,x2,q),y,3,'#fff',{alpha:.8});}};
    const fall=(x,y1,y2,a)=>{if(a>.8)for(let j=0;j<2;j++){const q=(t*.4+j/2)%1;dot(c,x,lerp(y1,y2,q),3,'#fff',{alpha:.7});}};
    K(c,'에너지 효율(%) = 유용하게 쓰인 에너지 ÷ 공급한 에너지 × 100',480,44,{size:16.5,w:700});
    SB_al(c,k1,()=>{box(c,50,120,170,180,6,ra(FU,.3),FU,1.5);K(c,'연료에서 얻은 열',135,146,{size:12.5,color:C.muted});K(c,'공급한 에너지',135,200,{size:14.5});K(c,'1000 J',135,228,{size:21,w:700,font:MONO,color:FU});});run(60,215,270,k1);
    SB_al(c,k2,()=>{box(c,316,120,214,72,0,ra(EL,.3),EL,1.5);K(c,'전기 400 J',423,157,{size:16.5,w:700});
      box(c,330,192,108,150,0,ra(HT,.28),HT,1.5);poly(c,[[322,342],[446,342],[384,374]],HT,1.5,{close:true,fill:ra(HT,.5)});K(c,'버려진 열',384,252,{size:14});K(c,'600 J',384,277,{size:16,w:700,font:MONO,color:HT});
      K(c,'400 ÷ 1000 × 100 = 40 %',176,336,{size:14,font:MONO,color:EL});});run(320,526,176,k2);fall(350,200,338,k2);
    box(c,220,104,96,212,10,'#13263a',C.muted,2);K(c,'발전소',268,198,{size:16,w:700});K(c,'효율 40 %',268,223,{size:13,color:C.muted});
    SB_al(c,k3,()=>{box(c,626,120,150,22,0,ra(LI,.45),LI,1.5);poly(c,[[776,112],[776,150],[802,131]],LI,1.5,{close:true,fill:ra(LI,.6)});
      T(c,'빛 120 J',812,124,{size:16.5,w:700,color:LI});T(c,'유용하게 쓰인 에너지',812,147,{size:12.5,color:C.muted});
      box(c,640,142,50,200,0,ra(HT,.28),HT,1.5);poly(c,[[632,342],[698,342],[665,374]],HT,1.5,{close:true,fill:ra(HT,.5)});K(c,'열',665,240,{size:14});K(c,'280 J',665,263,{size:13.5,w:700,font:MONO,color:HT});
      K(c,'120 ÷ 400 × 100 = 30 %',533,236,{size:14,font:MONO,color:LI});});run(630,790,131,k3,2);fall(665,282,338,k3);
    SB_al(c,k2,()=>{box(c,530,104,96,104,10,'#13263a',C.muted,2);K(c,'전등',578,146,{size:16,w:700});K(c,'효율 30 %',578,171,{size:13,color:C.muted});});
    SB_al(c,k4,()=>{K(c,'버려진 열 600 J',384,392,{size:13,color:HT});K(c,'열 280 J',665,392,{size:13,color:HT});});
    SB_al(c,A(7.4),()=>K(c,'전체 효율 = 0.4 × 0.3 = 0.12 → 12 %   (처음 1000 J 가운데 빛이 되는 것은 120 J)',480,430,{size:15.5,w:700,color:C.u1}));
    SB_al(c,A(8.4),()=>K(c,'보존: 120 + 280 + 600 = 1000 J — 총량은 그대로이고, 쓸모 있는 에너지만 줄어든다',480,464,{size:14.5}));
    SB_al(c,A(9.2),()=>K(c,'함정: 효율은 100 %를 넘을 수 없다 · ‘에너지가 사라진다’ ✕ → ‘다시 쓰기 어려운 열로 흩어진다’ ○',480,498,{size:13,color:C.muted}));
  }});

/* ───────── Ⅵ-1 세균과 바이러스 ───────── */
S.push({u:5,ch:'과학과 미래 사회',title:'세균과 바이러스',file:'10-future.html',
  sub:'세균은 스스로 분열해 늘어나는 세포이고, 바이러스는 세포가 아니어서 살아 있는 세포 안에서만 늘어납니다. 둘 다 핵산과 단백질을 가집니다.',
  fx:[{w:1,f:'세균: 세포 · 스스로 분열 · 항생제'},{w:1,f:'바이러스: 세포 아님 · 세포 안에서만 증식 · 항바이러스제'},{w:1,f:'공통: 핵산(유전 물질) + 단백질',n:'진단 검사가 찾는 것'}],
  pts:['차이는 <em>스스로 살아갈 수 있는가</em>입니다. 세균은 혼자 물질대사를 하고, 바이러스는 다른 생물의 세포와 그 재료를 써야 증식합니다.','둘 다 <em>핵산과 단백질</em>을 가지므로 → 진단 검사는 이 두 물질 가운데 하나를 찾습니다.','함정: 감기·독감의 원인은 바이러스라서 <em>항생제는 듣지 않습니다</em>. 항생제는 세균에 쓰는 약입니다.','결핵·콜레라·파상풍은 세균, 독감·코로나19·홍역은 바이러스입니다.'],
  dur:14,still:5,
  draw(c,t){
    const BC='#7BE07F',VC='#FF7A8A',NA='#F4B544',PR='#B69CFF';
    const sq=(x,y,w,col,ph=0)=>{const P=[];for(let q=0;q<=20;q++)P.push([x-w/2+q/20*w,y+Math.sin(q*.95+ph)*4]);poly(c,P,col,2.2);};   // 핵산(구불구불한 줄)
    const bact=(x,y,w)=>{box(c,x-w/2,y-28,w,56,28,ra(BC,.14),BC,2.5);sq(x,y-4,w*.5,NA,x*.1);[[-.3,13],[.05,15],[.3,11]].forEach(p=>dot(c,x+p[0]*w,y+p[1],3,PR));};
    const vir=(x,y,r,a=1)=>SB_al(c,a,()=>{const P=[];for(let q=0;q<6;q++)P.push([x+Math.cos(q*TAU/6)*r,y+Math.sin(q*TAU/6)*r]);poly(c,P,PR,3,{close:true,fill:ra(PR,.16)});sq(x,y,r*1.1,NA,x*.2);});
    T(c,'세균',50,44,{size:22,w:700,color:BC});T(c,'세포로 이루어진 생물',106,46,{size:14.5,color:C.muted});
    T(c,'바이러스',500,44,{size:22,w:700,color:VC});T(c,'세포가 아니다 · 세균보다 훨씬 작다',600,46,{size:14.5,color:C.muted});poly(c,[[480,28],[480,392]],C.line,1.5);
    // 세균: 스스로 분열
    const u=(t%6)/6;if(u<.35)bact(255,150,lerp(112,184,ease(u/.35)));else{const d=ease(clamp((u-.35)/.25));bact(255-lerp(46,66,d),150,lerp(92,108,d));bact(255+lerp(46,66,d),150,lerp(92,108,d));}
    K(c,'양분이 있으면 스스로 분열해 늘어난다',255,214,{size:13.5,color:BC});
    dot(c,62,244,5,NA);T(c,'핵산',72,244,{size:12.5,color:NA});dot(c,122,244,4,PR);T(c,'단백질',132,244,{size:12.5,color:PR});
    // 바이러스: 살아 있는 세포 안에서만
    dot(c,770,160,60,'rgba(79,209,232,.07)',{stroke:C.u2,lw:2.5});K(c,'살아 있는 세포',770,84,{size:12.5,color:C.u2});
    vir(545,118,15);T(c,'단백질 껍질',568,110,{size:12.5,color:PR});T(c,'핵산',568,128,{size:12.5,color:NA});
    const w=(t%8)/8;if(w<.4){const k=ease(w/.4);vir(lerp(560,742,k),lerp(172,160,k),13,w<.3?1:1-(w-.3)/.1*.4);}
    else{const n=Math.min(4,1+Math.floor((w-.4)/.09)),out=ease(clamp((w-.78)/.22));[[-22,-18],[22,-16],[-18,22],[24,20]].slice(0,n).forEach((p,j)=>vir(770+p[0]*(1+out*2.6),160+p[1]*(1+out*2),12,1-out*.75));}
    K(c,'세포 안에 들어가야만 늘어난다',705,238,{size:13.5,color:VC});
    [['구조','세포 (스스로 물질대사)','핵산 + 단백질 껍질 (세포 아님)'],['증식','양분이 있으면 스스로 분열','살아 있는 세포 안에서만'],['치료','항생제','항바이러스제 — 항생제는 듣지 않는다'],['예','결핵 · 콜레라 · 파상풍','독감 · 코로나19 · 홍역']].forEach((d,i)=>{const y=278+i*30,a=fin(t,.6+i*.5,.5);SB_al(c,a,()=>{
      T(c,d[0],50,y,{size:12.5,color:C.dim});T(c,d[1],96,y,{size:15,w:i===2?700:500});T(c,d[0],500,y,{size:12.5,color:C.dim});T(c,d[2],546,y,{size:15,w:i===2?700:500});
      if(i===2){chk(c,96+kw(c,d[1],15,700)+18,y,6,C.green);crs(c,546+kw(c,d[2],15,700)+18,y,5.5,C.u3);}});});
    const a=fin(t,3,.6);rr(c,180,412,600,52,12,ra(C.u1,.1),C.u1,1.8,a);arw(c,300,386,300,408,C.u1,2,7,a);arw(c,660,386,660,408,C.u1,2,7,a);
    SB_al(c,a,()=>K(c,'둘 다 가진 것: 핵산(유전 물질) + 단백질 → 진단 검사가 찾는 두 물질',480,438,{size:15.5,w:700}));
    SB_al(c,fin(t,3.8,.6),()=>K(c,'함정: 감기 · 독감의 원인은 바이러스 → 항생제(세균에 쓰는 약)로 낫지 않는다',480,496,{size:14,color:C.muted}));
  }});

/* ───────── Ⅵ-2 핵산 검사와 단백질 검사 ───────── */
S.push({u:5,ch:'과학과 미래 사회',title:'감염병 진단 — 핵산 검사와 단백질 검사',file:'10-future.html',
  sub:'핵산 검사는 병원체의 핵산을 복제해 양을 늘려 찾고, 단백질 검사는 병원체의 단백질에 달라붙는 물질로 선을 띄웁니다. 정확도와 빠르기가 서로 다릅니다.',
  fx:[{w:1,f:'핵산 검사(유전자 증폭): 정확 · 장비와 시간 필요'},{w:1,f:'단백질 검사(신속 항원): 빠름 · 양이 적으면 놓침'},{f:'2^{10} = 1024',n:'10번 복제하면 1024배, 20번이면 약 100만 배'}],
  pts:['한 번 복제할 때마다 2배가 되므로 → 아주 적어 보이지 않던 핵산도 <em>검출할 수 있는 양</em>이 됩니다. 그래서 정확도가 높습니다.','신속 항원 검사는 늘리는 과정이 없어서 → 빠르지만 병원체의 <em>양이 적으면 놓칠</em> 수 있습니다.','함정: 유전자 증폭 검사가 찾는 것은 단백질이 아니라 <em>핵산</em>입니다. 두 검사가 찾는 물질을 바꿔 쓴 보기가 나옵니다.','빠른 검사로 먼저 거르고, 정확한 검사로 다시 확인합니다.'],
  dur:15,still:9.5,
  draw(c,t){
    const NA='#F4B544',PR='#B69CFF',A=a=>fin(t,a,.5);
    T(c,'핵산 검사',50,42,{size:20,w:700,color:NA});T(c,'유전자 증폭 검사',146,44,{size:14.5,color:C.muted});T(c,'병원체의 핵산을 여러 번 복제해 양을 늘린 뒤 확인',50,68,{size:13,color:C.muted});
    T(c,'단백질 검사',500,42,{size:20,w:700,color:PR});T(c,'신속 항원 검사',614,44,{size:14.5,color:C.muted});T(c,'병원체의 단백질에만 달라붙는 물질로 선을 띄움',500,68,{size:13,color:C.muted});
    poly(c,[[480,28],[480,452]],C.line,1.5);
    // 왼쪽: 복제할 때마다 2배
    const n=clamp(Math.floor((t-1)/.65),0,10),X=80,Y=336;
    poly(c,[[X,112],[X,Y],[X+356,Y]],C.dim,1.5);T(c,'핵산의 양',X+8,108,{size:12.5,color:C.muted});K(c,'복제 횟수',X+178,Y+36,{size:12.5,color:C.muted});
    for(let i=0;i<=10;i++){const x=X+14+i*31,g=fin(t,1+i*.65,.4),h=Math.max(2.5,Math.pow(2,i)/1024*196)*g;if(g>0)box(c,x,Y-h,24,h,3,ra(NA,.6),NA,1.2);K(c,String(i),x+12,Y+15,{size:12,color:C.muted,font:MONO});}
    poly(c,[[X,Y-38],[X+356,Y-38]],C.u2,1.5,{dash:[5,4]});T(c,'검출할 수 있는 양',X+10,Y-52,{size:12.5,color:C.u2});
    T(c,n+'번 복제하면 '+Math.pow(2,n)+'배',X+24,150,{size:18,w:700,color:NA});T(c,'복제할 때마다 2배 · 20번이면 약 100만 배',X+24,178,{size:13,color:C.muted});
    // 오른쪽: 검사 도구
    rr(c,540,146,350,84,18,'#16293d',C.muted,2);dot(c,592,188,20,SB_INK,{stroke:C.muted,lw:2});K(c,'시료',592,122,{size:13,color:C.muted});
    box(c,650,168,210,40,6,'#E9EEF3',null,0);
    const kd=seg(t,1.2,2);if(kd>0&&kd<1)dot(c,592,lerp(136,182,kd),6,'#FF9DB0');
    if(t>=2){dot(c,592,188,13,'rgba(255,150,170,.6)');const fr=lerp(612,860,seg(t,2,6));box(c,612,182,Math.min(fr,650)-612,12,0,'rgba(255,150,170,.5)',null,0);if(fr>650)box(c,650,168,fr-650,40,0,'rgba(255,150,170,.25)',null,0);}
    SB_al(c,fin(t,2+143/248*4,.6),()=>{box(c,752,170,6,36,0,'#D6336C',null,0);K(c,'선이 나타남',755,157,{size:12.5,w:600,color:'#FF9DB0'});});
    T(c,'선이 생기는 자리를 확대하면',540,258,{size:13,color:C.muted});poly(c,[[548,334],[872,334]],C.muted,2);
    for(let j=0;j<5;j++){const x=580+j*65,y=316,kk=ease(seg(t,3.6+j*.4,4.6+j*.4)),px=lerp(x+46,x,kk),py=lerp(272,y-19,kk);
      poly(c,[[x,y+18],[x,y]],PR,3);poly(c,[[x,y],[x-10,y-12]],PR,3);poly(c,[[x,y],[x+10,y-12]],PR,3);
      SB_al(c,kk*1.5,()=>poly(c,[[px-8,py-7],[px+8,py-7],[px,py+6]],'#FF7A8A',1.5,{close:true,fill:'rgba(255,122,138,.6)'}));}
    SB_al(c,A(5.6),()=>K(c,'병원체의 단백질(▽)이 결합 → 선이 나타난다',710,356,{size:13.5,w:600,color:PR}));
    [['찾는 것','병원체의 핵산(유전 물질)','병원체의 단백질'],['장점','아주 적은 양도 찾아낸다 → 정확도가 높다','장비 없이 짧은 시간에 결과를 본다'],['한계','장비 · 전문 인력이 필요하고 시간이 걸린다','병원체의 양이 적으면 놓칠 수 있다']].forEach((d,i)=>{const y=394+i*26,a=A(6.4+i*.4);SB_al(c,a,()=>{
      T(c,d[0],50,y,{size:12.5,color:C.dim});T(c,d[1],110,y,{size:14,w:i?500:700});T(c,d[0],500,y,{size:12.5,color:C.dim});T(c,d[2],560,y,{size:14,w:i?500:700});});});
    SB_al(c,A(7.8),()=>K(c,'빠른 검사(단백질)로 먼저 거르고 → 정확한 검사(핵산)로 다시 확인한다',480,482,{size:15.5,w:700,color:C.u1}));
    SB_al(c,A(8.5),()=>K(c,'함정: 유전자 증폭 검사가 찾는 것은 단백질이 아니라 핵산 · 신속 항원 검사가 찾는 것은 단백질',480,512,{size:13,color:C.muted}));
  }});

/* ───────── Ⅵ-3 검사 결과표 읽기 ───────── */
const SB_FP=(()=>{const a=[];for(let i=0;i<1000;i++)if(i%50>=5)a.push(i);a.sort((p,q)=>rnd(p+7)-rnd(q+7));return new Set(a.slice(0,18));})();   // 비감염자 900명 가운데 양성으로 나온 18명
S.push({u:5,ch:'과학과 미래 사회',title:'검사 결과표 — 분모부터 정한다',file:'10-future.html',
  sub:'감염자 100명과 비감염자 900명을 신속 검사로 검사한 결과입니다. 같은 80명이라도 무엇으로 나누느냐에 따라 비율이 달라집니다.',
  fx:[{w:1,f:'감염자 가운데 양성: 80 ÷ 100 = 80 %'},{w:1,f:'비감염자 가운데 음성: 882 ÷ 900 = 98 %'},{w:1,f:'양성 가운데 감염자: 80 ÷ 98 ≈ 82 %',n:'분모가 다르다'}],
  pts:['‘감염자 가운데 양성’과 ‘양성 가운데 감염자’는 <em>분모가 달라</em> 값이 다릅니다. 표에서 가로줄로 나눌지 세로 칸으로 나눌지부터 정합니다.','양성 98명 가운데 18명은 감염되지 않은 사람이고 감염자 20명은 음성으로 놓쳤으므로 → <em>정확한 검사로 다시 확인</em>합니다.','함정: 양성이면 모두 감염자라고 읽으면 틀립니다. 비감염자가 훨씬 많으면 <em>적은 비율의 오류</em>도 사람 수로는 커집니다.'],
  dur:16,still:11,
  draw(c,t){
    const INF='#FF7A8A',NON='#5E7A99',POS=C.u1,A=a=>fin(t,a,.5),sw=lerp(40,562,seg(t,2.2,5)),g0=c.globalAlpha;
    const which=t<6?-1:t<7.5?0:t<9?1:t<10.5?2:Math.floor((t-10.5)/1.8)%3;
    T(c,'1000명을 검사한다',50,52,{size:16,w:700});T(c,'점 하나 = 한 사람',550,54,{size:12.5,color:C.muted,align:'right'});
    c.save();for(let i=0;i<1000;i++){const col=i%50,row=Math.floor(i/50),x=55+col*10,y=89+row*10,inf=col<5,pos=inf?row<16:SB_FP.has(i),a=clamp((t-.2)*2-col*.02);if(a<=0)continue;
      c.globalAlpha=g0*a*(which===0&&!inf||which===1&&inf||which===2&&!pos?.35:1);c.fillStyle=inf?INF:NON;c.beginPath();c.arc(x,y,3.3,0,TAU);c.fill();
      if(pos&&x<sw){c.strokeStyle=POS;c.lineWidth=which===2?2.4:1.8;c.beginPath();c.arc(x,y,4.7,0,TAU);c.stroke();}}c.restore();
    if(t>2.2&&t<5.2){poly(c,[[sw,78],[sw,292]],POS,2);K(c,'검사',clamp(sw,60,540),70,{size:12.5,color:POS,w:600});}
    if(which===0)box(c,49,83,52,202,4,null,INF,2);if(which===1)box(c,101,83,452,202,4,null,'#9DB6D3',2);
    dot(c,58,310,5,INF);T(c,'감염자 100',70,310,{size:13});dot(c,188,310,5,NON);T(c,'비감염자 900',200,310,{size:13});dot(c,338,310,5.5,null,{stroke:POS,lw:2});T(c,'양성으로 나온 사람',350,310,{size:13,color:POS});
    SB_al(c,A(5.2),()=>{T(c,'감염자 100명 → 양성 80 · 음성 20 (놓침)',50,346,{size:14});T(c,'비감염자 900명 → 양성 18 (잘못 나옴) · 음성 882',50,372,{size:14});});
    // 표
    const TB=[['','양성','음성','합계'],['감염자','80','20','100'],['비감염자','18','882','900'],['합계','98','902','1000']],CX=[606,740,810,885],HL=[[[1,1],[1,3]],[[2,2],[2,3]],[[1,1],[3,1]]][which]||[];
    poly(c,[[600,80],[920,80]],C.line,1.5);poly(c,[[600,144],[920,144]],C.line,1,{dash:[3,4]});
    TB.forEach((r,i)=>r.forEach((s,j)=>{if(!s)return;const y=64+i*32,hl=HL.some(h=>h[0]===i&&h[1]===j);if(hl)rr(c,CX[j]-32,y-14,64,28,6,ra(C.u1,.2),C.u1,1.5);
      if(j===0)T(c,s,CX[0],y,{size:14,color:C.muted});else K(c,s,CX[j],y,{size:i?15.5:13.5,font:i?MONO:SANS,w:hl?700:500,color:i?C.text:C.muted});}));
    [['① 감염자 가운데 양성','80 ÷ 100 = 80 %','감염자 20명은 음성으로 나와 놓쳤다',6],['② 비감염자 가운데 음성','882 ÷ 900 = 98 %','비감염자 18명은 양성으로 나왔다',7.5],['③ 양성 가운데 실제 감염자','80 ÷ 98 ≈ 82 %','분모가 ‘양성 98명’으로 바뀌었다',9]].forEach((d,i)=>{const y=212+i*62,on=which===i;SB_al(c,A(d[3]),()=>{
      if(on)rr(c,592,y-18,336,56,8,ra(C.u1,.1),ra(C.u1,.7),1.4);T(c,d[0],604,y,{size:14,w:600});T(c,d[1],916,y,{size:15,w:700,font:MONO,color:C.u1,align:'right'});T(c,d[2],604,y+22,{size:12.5,color:C.muted});});});
    SB_al(c,A(10),()=>{K(c,'분모부터 정한다 — ‘감염자 가운데’(80 %)와 ‘양성 가운데’(82 %)는 다른 값이다',480,432,{size:15.5,w:700,color:C.u1});
      K(c,'그래서 빠른 검사로 먼저 거르고, 정확한 검사로 다시 확인한다',480,466,{size:14});
      K(c,'함정: 표에서 가로로 나눌지(감염자 줄), 세로로 나눌지(양성 칸)를 먼저 확인',480,498,{size:13,color:C.muted});});
  }});

/* ───────── Ⅵ-4 사물인터넷 · 빅데이터 · 인공지능 · 로봇 ───────── */
S.push({u:5,ch:'과학과 미래 사회',title:'사물인터넷 · 빅데이터 · 인공지능 · 로봇',file:'10-future.html',
  sub:'센서가 모은 데이터가 쌓이고, 인공지능이 거기서 규칙을 익혀 판단하고, 로봇이 움직입니다. 사례 글에서는 낱말 하나로 기술을 가릅니다.',
  fx:[{w:1,f:'센서 + 통신 → 사물인터넷'},{w:1,f:'대량의 자료 분석 → 빅데이터'},{w:1,f:'학습 · 판단 → 인공지능',n:'감지하고 움직이면 로봇'},{w:1,f:'유용성과 한계는 함께 있다'}],
  pts:['데이터가 재료이고 인공지능이 분석 도구라서 → <em>빅데이터와 인공지능은 짝</em>입니다. 한 사례에 여러 기술이 함께 들어 있는 경우가 많습니다.','치우친 데이터로 학습하면 → <em>판단도 치우칩니다</em>. 결과는 실험과 관측으로 다시 확인해야 합니다.','함정: 사물인터넷은 사물끼리 데이터를 주고받는 <em>연결</em>이고, 인공지능은 학습하고 판단하는 기술입니다. 같은 말이 아닙니다.','함정: ‘데이터가 많으면 항상 옳다’, ‘함께 변하면 원인과 결과다’는 틀린 문장입니다.'],
  dur:15,still:8.5,
  draw(c,t){
    const CD=[['사물인터넷','센서 + 통신','사물끼리 데이터를 주고받는다','스마트 홈 · 스마트 팜','착용형 기기','#4FD1E8'],['빅데이터','대량의 자료 분석','숨은 규칙과 경향을 찾는다','기상 예보 · 유전체 분석','신약 후보 물질 추리기','#F4B544'],
      ['인공지능','학습 · 추론 · 판단','데이터에서 규칙을 익힌다','관측 자료 분류','단백질 구조 · 날씨 예측','#B69CFF'],['로봇','감지 → 판단 → 움직임','스스로 움직여 일을 한다','조립 · 수술 보조 로봇','구조 · 탐사 로봇','#7BE07F']];
    CD.forEach((d,i)=>{const x=40+i*225,cx=x+102.5,cy=140,col=d[5],a=fin(t,.3+i*.7,.6);rr(c,x,52,205,268,12,ra(col,.06),ra(col,.55),1.4,a);SB_al(c,a,()=>{
      T(c,d[0],x+14,76,{size:18,w:700,color:col});
      if(i===0){dot(c,cx,cy-18,13,ra(col,.25),{stroke:col,lw:2});[[-52,26],[0,40],[52,26]].forEach((p,j)=>{box(c,cx+p[0]-11,cy+p[1]-9,22,18,4,ra(col,.25),col,1.5);const q=(t*.7+j*.33)%1;poly(c,[[cx+p[0],cy+p[1]-10],[cx,cy-6]],ra(col,.4),1.2,{dash:[2,4]});dot(c,lerp(cx+p[0],cx,q),lerp(cy+p[1]-10,cy-6,q),3,'#fff');});
        for(let j=1;j<=2;j++)arc(c,cx,cy-18,13+j*7+(t*6%7),-2.2,-.9,ra(col,.5-j*.15),1.5);}
      else if(i===1){for(let j=0;j<40;j++){const px=cx-62+(j%10)*13.8,py=cy+36-Math.floor(j/10)*14-rnd(j)*8-(j%10)*3.4;if((t*8)%60>j||t>6)dot(c,px,py,2.6,ra(col,.85));}poly(c,[[cx-64,cy+30],[cx+64,cy-34]],C.text,2,{dash:[5,4]});}
      else if(i===2){const Ls=[[-50,[-26,0,26]],[0,[-36,-12,12,36]],[50,[-14,14]]],hot=Math.floor(t*2.5)%3;Ls.forEach((L,q)=>{if(q<2)L[1].forEach(y1=>Ls[q+1][1].forEach(y2=>poly(c,[[cx+L[0],cy+y1],[cx+Ls[q+1][0],cy+y2]],ra(col,q===hot?.7:.25),1.1)));});
        Ls.forEach((L,q)=>L[1].forEach(y1=>dot(c,cx+L[0],cy+y1,6,q===hot?'#fff':ra(col,.5),{stroke:col,lw:1.5})));}
      else{const a1=-1.1+Math.sin(t*1.4)*.35,a2=a1+1.2+Math.sin(t*1.4+1)*.4,x1=cx-30+Math.cos(a1)*44,y1=cy+34+Math.sin(a1)*44,x2=x1+Math.cos(a2)*38,y2=y1+Math.sin(a2)*38;
        box(c,cx-52,cy+34,44,12,3,ra(col,.4),col,1.5);poly(c,[[cx-30,cy+34],[x1,y1],[x2,y2]],col,6);dot(c,cx-30,cy+34,5,C.text);dot(c,x1,y1,5,C.text);poly(c,[[x2-6,y2-7],[x2,y2],[x2+7,y2-5]],C.text,2.5);box(c,cx+30,cy+30,18,16,3,ra(C.u1,.5),C.u1,1.5);}
      rr(c,x+12,196,181,28,8,ra(col,.16),ra(col,.7),1.2);K(c,d[1],cx,210.5,{size:13.5,w:700});
      K(c,d[2],cx,244,{size:13});K(c,d[3],cx,276,{size:12.5,color:C.muted});K(c,d[4],cx,296,{size:12.5,color:C.muted});});
      if(i<3){arw(c,x+207,140,x+223,140,C.muted,2,6,a);}});
    T(c,'사례 글에서 이 낱말이 보이면 →',40,34,{size:13,color:C.muted});
    const pu=.5+.5*Math.sin(t*1.6);
    [['유용성','숨은 규칙을 찾아 예측 · 시간과 비용을 줄인다','위험하거나 반복되는 일을 대신한다',C.green,40,pu],['한계와 우려','개인 정보 유출 · 격차 · 사고의 책임','치우친 데이터 → 치우친 판단',C.u3,490,1-pu]].forEach((d,i)=>{const a=fin(t,3.6+i*.7,.6);
      rr(c,d[4],340,430,100,12,ra(d[3],.05+.06*d[5]),ra(d[3],.5+.4*d[5]),1.5,a);SB_al(c,a,()=>{T(c,d[0],d[4]+16,362,{size:16,w:700,color:d[3]});T(c,d[1],d[4]+16,392,{size:14});T(c,d[2],d[4]+16,418,{size:14});});});
    SB_al(c,fin(t,5.2,.6),()=>K(c,'어떤 기술이든 유용성과 한계가 함께 있다 — 한쪽만 말하는 보기는 대부분 틀린다',480,470,{size:15,w:700,color:C.u1}));
    SB_al(c,fin(t,6,.6),()=>K(c,'함정: 데이터가 많아도 치우치면 결론이 틀린다 · 두 값이 함께 변해도 원인과 결과라고 단정할 수 없다',480,502,{size:13,color:C.muted}));
  }});
