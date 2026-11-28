/* 통합과학 1~5장(과학의 기초 · 물질과 규칙성 · 지구시스템 · 역학 시스템 · 생명 시스템) 장면 — 최상위 이름은 SA_ 로 시작한다. 도구는 첫 파일(intsci-scenes.js)에 있다. */
const SA_PK='#FF7A8A',SA_BL='#6EA8FF',SA_GR='#7BE07F',SA_HOT='#FF9A4D',SA_INK='#0E1B2A';
function SA_g(c,a,fn){if(a<=.02)return;c.save();c.globalAlpha*=clamp(a);fn();c.restore();}   // 투명도를 걸고 그리기
function SA_part(P,k){const L=[];let tot=0;for(let i=1;i<P.length;i++){const d=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);L.push(d);tot+=d;}   // 꺾은선 P 의 앞쪽 k(0~1)만큼
  let q=clamp(k)*tot;const o=[P[0]];for(let i=0;i<L.length;i++){if(q>=L[i]){o.push(P[i+1]);q-=L[i];}else{const u=q/L[i];o.push([lerp(P[i][0],P[i+1][0],u),lerp(P[i][1],P[i+1][1],u)]);break;}}return o;}

/* ───────── Ⅰ-1 기본량과 유도량 ───────── */
S.push({u:0,ch:'과학의 기초',title:'기본량에서 유도량으로',file:'01-basics.html',
  sub:'시간·길이·질량 같은 기본량을 곱하거나 나누면 속력·부피·밀도·힘 같은 유도량이 됩니다. 단위를 보면 어떤 기본량에서 왔는지 읽힙니다.',
  fx:[{w:1,f:'기본량: 시간 s · 길이 m · 질량 kg · 전류 A · 온도 K',n:'물질량 mol · 광도 cd 까지 일곱 개'},{w:1,f:'속력 = 길이 ÷ 시간',n:'m/s'},{w:1,f:'밀도 = 질량 ÷ 부피',n:'kg/m³ · 부피 = 길이 × 길이 × 길이'},{w:1,f:'1 mL = 1 cm³ · 1 g/cm³ = 1000 kg/m³',n:'단위 환산'}],
  pts:['<em>기본량</em>은 다른 양으로 나타낼 수 없는 양이고, <em>유도량</em>은 기본량을 곱하거나 나누어 만든 양입니다.','부피가 길이를 세 번 곱한 양이라서, 밀도(질량 ÷ 부피)는 <em>질량과 길이</em> 두 기본량에서 나옵니다.','함정: 질량의 기본 단위는 g이 아니라 <em>kg</em>, 온도는 ℃가 아니라 <em>K</em>입니다. ℃로 적혀 있어도 온도 자체는 기본량입니다.','두 양을 비교하거나 나누기 전에 단위부터 하나로 맞춥니다. 72 km/h = 20 m/s.'],
  dur:16,still:13.5,
  draw(c,t){
    const G=IC[0],base=[['시간','s','초',C.u2],['길이','m','미터',G],['질량','kg','킬로그램 · g 아님',SA_PK],['전류','A','암페어',C.neu],['온도','K','켈빈 · ℃ 아님',C.neu]];
    const der=[['속력','길이 ÷ 시간','m/s',[1,0]],['부피','길이 × 길이 × 길이','m³',[1]],['밀도','질량 ÷ 부피','kg/m³',[2]],['힘','질량 × 길이 ÷ (시간 × 시간)','N = kg·m/s²',[2,1,0]]];
    const by=i=>66+i*88,cy=j=>62+j*110,cur=clamp(Math.floor((t-1.4)/3.3),-1,3);
    label(c,'기본량 (SI)',136,40,C.muted,{size:14});label(c,'유도량 = 기본량을 곱하거나 나눈 양',735,40,C.muted,{size:14});
    der.forEach((d,j)=>{const a=fin(t,1.4+j*3.3,.6);if(a<=0)return;const on=j===cur;
      d[3].forEach((b,q)=>{const p=[[224,by(b)+28],[556,cy(j)+42+(q-(d[3].length-1)/2)*18]];
        SA_g(c,a,()=>{if(on)flow(c,p,t,base[b][3],2,5,.55);else poly(c,p,ra(base[b][3],.38),1.8);});});});
    base.forEach((b,i)=>{const y=by(i),a=fin(t,.1+i*.18,.5),used=cur>=0&&der[cur][3].includes(i),dim=i>2;
      SA_g(c,a,()=>{rr(c,50,y,172,56,12,used?ra(b[3],.16):SA_INK,dim?C.line:b[3],used?2.8:1.8);
        T(c,b[0],68,y+28,{size:18,w:700,color:dim?C.muted:C.text});dot(c,192,y+28,19,ra(b[3],.14),{stroke:b[3],lw:1.5});
        T(c,b[1],192,y+29,{size:15,font:MONO,align:'center',color:b[3],w:600});T(c,b[2],54,y+70,{size:12,color:i===2||i===4?SA_HOT:C.dim});});});
    der.forEach((d,j)=>{const a=fin(t,1.4+j*3.3,.6),y=cy(j),on=j===cur;
      SA_g(c,a,()=>{rr(c,560,y,350,84,14,on?ra(G,.13):SA_INK,on?G:C.line,on?2.6:1.6);T(c,d[0],582,y+29,{size:20,w:700,color:on?G:C.text});
        T(c,d[1],582,y+59,{size:14,color:C.muted});T(c,d[2],890,y+30,{size:17,font:MONO,align:'right',color:G,w:600});});});
    SA_g(c,fin(t,8.4,.6),()=>{arw(c,700,cy(1)+86,700,cy(2)-3,G,2.5,9);T(c,'부피를 다시 쓴다',714,cy(1)+97,{size:12,color:G});});
    SA_g(c,fin(t,11.6,.7),()=>K(c,'단위를 기본량까지 거슬러 올라가 적는다 — 밀도 → 질량 ÷ 부피 → 질량 ÷ (길이 × 길이 × 길이)',480,516,{size:14,color:C.text}));
  }});

/* ───────── Ⅰ-2 측정 표준 ───────── */
S.push({u:0,ch:'과학의 기초',title:'측정 표준이 바뀐 방향',file:'01-basics.html',
  sub:'1 m·1초·1 kg의 기준은 사람이 만든 물건이나 지구처럼 변할 수 있는 것에서, 빛의 속력이나 원자의 성질처럼 변하지 않는 자연의 값으로 옮겨 왔습니다.',
  fx:[{w:1,f:'변할 수 있는 기준 → 변하지 않는 자연의 값',n:'표준이 바뀐 방향'},{w:1,f:'1 m: 미터원기 → 빛이 1/299 792 458초 동안 가는 거리',n:'길이를 시간으로 정함'},{w:1,f:'1초: 하루의 1/86400 → 세슘 원자가 내는 빛의 진동',n:'9 192 631 770번'},{w:1,f:'1 kg: 킬로그램원기 → 플랑크 상수',n:'변하지 않는 값으로 정의'}],
  pts:['<em>측정 표준</em>은 누가 어디에서 재어도 같은 값이 나오게 하려는 약속입니다.','금속 원기는 온도에 따라 늘거나 줄고 닳으며, 지구 자전도 완전히 일정하지 않습니다. 그래서 <em>어디서나 같은</em> 빛의 속력과 원자의 진동으로 바꿨습니다.','함정: 지금의 1 m 정의 안에는 <em>‘초’</em>가 들어 있습니다. 시간을 정밀하게 재야 길이의 기준도 정밀해집니다.','변천 순서를 물으면 <em>변할 수 있는 기준 → 변하지 않는 기준</em> 방향으로 세웁니다.'],
  dur:15,still:13,
  draw(c,t){
    const ry=[140,275,410],U=['1 m','1초','1 kg'],G=IC[0];
    K(c,'예전 기준 — 변할 수 있는 것',290,50,{size:16,w:700,color:SA_HOT});K(c,'지금 기준 — 변하지 않는 자연의 값',720,50,{size:16,w:700,color:SA_GR});
    ry.forEach((y,i)=>SA_g(c,fin(t,.4+i*2.8,.7),()=>{
      T(c,U[i],32,y,{font:DISP,size:28,color:G,w:400});
      rr(c,130,y-52,320,104,14,ra(SA_HOT,.06),ra(SA_HOT,.55),1.6);rr(c,530,y-52,380,104,14,ra(SA_GR,.06),ra(SA_GR,.6),1.6);
      const k=fin(t,1.6+i*2.8,.6);arw(c,460,y,460+62*k,y,C.text,3,11,k);
      if(i===0){const w=150*(1+.06*Math.sin(t*2.4));box(c,160,y-36,w,13,3,'#B8C4D0');poly(c,[[160,y-42],[160,y-17]],C.muted,1.5);poly(c,[[310,y-42],[310,y-17]],C.muted,1.5,{dash:[3,3]});
        T(c,'미터원기 (백금·이리듐 합금)',160,y+6,{size:15,w:700});T(c,'온도에 따라 늘거나 줄고, 닳는다',160,y+30,{size:13,color:C.muted});
        poly(c,[[560,y-30],[880,y-30]],C.line,2);poly(c,[[560,y-38],[560,y-22]],SA_GR,2);poly(c,[[880,y-38],[880,y-22]],SA_GR,2);dot(c,560+320*((t*.7)%1),y-30,6,'#FFF3B0',{glow:14});
        T(c,'빛이 1/299 792 458초 동안 가는 거리',560,y+6,{size:15,w:700});T(c,'빛의 속력은 어디에서나 같다',560,y+30,{size:13,color:C.muted});}
      if(i===1){const a=t*1.4+.5*Math.sin(t*.9);dot(c,178,y-4,26,ra(SA_BL,.2),{stroke:SA_BL,lw:2});poly(c,[[178,y-4],[178+Math.cos(a)*26,y-4+Math.sin(a)*26]],C.text,2.5);arc(c,178,y-4,34,a-1.1,a,ra(SA_BL,.7),2);
        T(c,'하루 길이의 1/86400',228,y-14,{size:15,w:700});T(c,'지구 자전이 완전히 일정하지 않다',228,y+12,{size:13,color:C.muted});
        dot(c,572,y-28,13,ra('#B69CFF',.3),{stroke:'#B69CFF',lw:2});T(c,'Cs',572,y-27,{size:12,align:'center',font:MONO,color:C.text});wavy(c,592,y-28,884,y-28,'#FFF3B0',20,7,t*9,2);
        T(c,'세슘 원자의 빛이 9 192 631 770번 진동',560,y+6,{size:15,w:700});T(c,'원자가 내는 빛의 진동은 일정하다',560,y+30,{size:13,color:C.muted});}
      if(i===2){box(c,158,y-26,40,44,5,'#B8C4D0');c.save();c.fillStyle='#DDE5EE';c.beginPath();c.ellipse(178,y-26,20,6,0,0,TAU);c.fill();c.restore();
        for(let q=0;q<3;q++){const u=((t*.5+q/3)%1);dot(c,204+q*5+u*10,y-8+u*26,2,ra('#B8C4D0',1-u));}
        T(c,'킬로그램원기의 질량',228,y-14,{size:15,w:700});T(c,'닳거나 손상될 수 있다',228,y+12,{size:13,color:C.muted});
        T(c,'h',574,y-6,{size:44,font:SERIF,it:true,color:SA_GR,align:'center'});T(c,'플랑크 상수로 정의',612,y-14,{size:15,w:700});T(c,'변하지 않는 값',612,y+12,{size:13,color:C.muted});}}));
    SA_g(c,fin(t,9.4,.7),()=>{arw(c,896,222,896,194,G,2.5,9);T(c,'1 m의 정의 안에 ‘초’가 들어 있다 → 시간 측정이 길이 표준의 바탕',884,208,{size:13,color:G,align:'right'});});
    SA_g(c,fin(t,11.5,.7),()=>K(c,'누가 어디에서 재어도 같은 값 · 설비만 있으면 누구나 다시 만들어 낼 수 있다',480,494,{size:15,color:C.text}));
  }});

/* ───────── Ⅰ-3 신호와 정보 ───────── */
S.push({u:0,ch:'과학의 기초',title:'아날로그 신호에서 디지털 정보로',file:'01-basics.html',
  sub:'끊김 없이 이어지는 자연의 신호를 센서가 전기 신호로 바꾸고, 일정한 간격으로 읽어 수로, 다시 0과 1로 나타냅니다.',
  fx:[{w:1,f:'신호 → 센서 → 전기 신호 → 수 → 0과 1',n:'디지털 정보가 되는 순서'},{w:1,f:'아날로그: 끊김 없이 이어지는 값',n:'목소리 · 기온 변화 · 수은 온도계'},{w:1,f:'디지털: 0과 1처럼 구분되는 값',n:'잡음에 강함 · 복제와 전송이 쉬움'}],
  pts:['<em>신호</em>는 전달되는 변화이고, 그것을 측정·분석해 얻은 뜻 있는 내용이 <em>정보</em>입니다.','디지털은 0인지 1인지만 구분하면 되므로 <em>잡음</em>의 영향이 작고, 같은 내용을 그대로 복제해 멀리 보낼 수 있습니다.','함정: 일정한 간격으로 읽는 동안 <em>그 사이의 값은 빠집니다.</em> 디지털 정보가 원래 신호와 완전히 같은 것은 아닙니다.','센서는 빛·소리·온도·압력 같은 신호를 <em>전기 신호</em>로 바꾸는 장치입니다.'],
  dur:15,still:13,
  draw(c,t){
    const G=IC[0],f=x=>3.5+2.4*Math.sin(x*.0105+.5)+.9*Math.sin(x*.027+1.2),Y=v=>205-v*19,nz=fin(t,10.8,.8);
    T(c,'① 자연의 변화(아날로그 신호)  →  ② 센서가 전기 신호로',90,46,{size:14,color:C.muted});
    SA_g(c,nz,()=>T(c,'잡음이 섞이면 가려내기 어렵다',870,46,{size:14,color:SA_HOT,align:'right'}));
    poly(c,[[90,210],[880,210]],C.line,2);
    const P=[],xe=100+770*seg(t,.4,3);for(let x=100;x<=xe;x+=4)P.push([x,Y(f(x))+nz*7*(rnd(x*.37+Math.floor(t*10)*5.1)-.5)]);poly(c,P,G,3);
    const xs=i=>120+i*64,lv=i=>Math.round(f(xs(i)));
    if(t>8.6){const k=fin(t,8.6,.8),Q=[];for(let i=0;i<12;i++){Q.push([xs(i),Y(lv(i))]);Q.push([i<11?xs(i+1):860,Y(lv(i))]);}poly(c,Q,C.u2,2,{dash:[5,4],alpha:k});}
    for(let i=0;i<12;i++){const a=fin(t,3.4+i*.42,.4);if(a<=0)continue;const x=xs(i),v=lv(i);
      SA_g(c,a,()=>{poly(c,[[x,Y(f(x))],[x,216]],ra(C.u2,.7),1.5,{dash:[3,3]});dot(c,x,Y(f(x)),5,C.u2,{glow:8});
        box(c,x-17,400-v*17*a,34,Math.max(2,v*17*a),4,ra(C.u2,.35),C.u2,1.5);label(c,String(v),x,400-v*17-13,C.text,{size:15});
        label(c,v.toString(2).padStart(3,'0'),x,424,SA_GR,{size:14});});}
    poly(c,[[90,400],[880,400]],C.line,2);
    SA_g(c,fin(t,3.2,.6),()=>T(c,'③ 일정한 간격으로 읽어 수로 바꾼다',90,242,{size:14,color:C.u2}));
    SA_g(c,fin(t,5,.6),()=>T(c,'④ 0과 1로 나타낸다 → 저장 · 처리 · 전송',90,454,{size:14,color:SA_GR}));
    SA_g(c,nz,()=>T(c,'0인지 1인지만 구분 → 잡음의 영향이 작다',870,454,{size:14,color:SA_GR,align:'right'}));
    SA_g(c,fin(t,9,.7),()=>K(c,'읽는 간격 사이의 값은 빠진다 → 원래 신호와 완전히 같지는 않다',480,496,{size:15,color:G,w:600}));
  }});

/* ───────── Ⅱ-1 스펙트럼 ───────── */
function SA_rain(c,x,y,w,h){c.save();for(let i=0;i<w;i+=2){c.fillStyle=wl2rgb(390+i/w*320);c.fillRect(x+i,y,2.4,h);}c.restore();}
S.push({u:1,ch:'물질과 규칙성',title:'스펙트럼으로 원소 찾기',file:'02-matter.html',
  sub:'원소마다 선이 나타나는 위치가 다릅니다. 별빛의 흡수선을 원소의 방출선과 세로로 맞대어 보면 별의 대기에 어떤 원소가 있는지 알 수 있습니다.',
  fx:[{w:1,f:'연속: 고온의 물체 · 방출: 고온의 기체 · 흡수: 저온의 기체를 지난 빛',n:'스펙트럼 세 가지'},{w:1,f:'같은 원소의 방출선과 흡수선은 같은 위치',n:'선의 위치 = 원소의 지문'},{w:1,f:'우주의 질량비  수소 : 헬륨 ≈ 3 : 1',n:'여러 천체의 스펙트럼을 분석한 결과'}],
  pts:['<em>방출 스펙트럼</em>은 검은 바탕에 밝은 선, <em>흡수 스펙트럼</em>은 연속 띠 위에 검은 선입니다.','원소마다 선의 위치(파장)가 달라서, 선을 맞대어 보면 직접 갈 수 없는 별의 구성 원소를 빛만으로 알아냅니다.','함정: 어떤 원소의 선이 <em>모두</em> 들어 있어야 그 원소가 있다고 판단합니다. 하나라도 빠지면 있다고 할 수 없습니다.','별의 스펙트럼에 다른 선이 남아 있으면 <em>다른 원소도 있다</em>는 뜻입니다. ‘이 원소로만 이루어졌다’고 할 수 없습니다.'],
  dur:15,still:13,
  draw(c,t){
    const X=l=>250+(l-390)/320*640,H0=44,yC=64,yX=152,yS=246,yY=340,LX=[410,434,486,656],LY=[447,502,589],LS=[410,434,486,656,589];
    const strip=(y,a,nm,sb,kind,L)=>SA_g(c,a,()=>{T(c,nm,36,y+13,{size:15,w:700});T(c,sb,36,y+34,{size:12,color:C.muted});
      if(kind)SA_rain(c,250,y,640,H0);else box(c,250,y,640,H0,0,'#04070C');box(c,250,y,640,H0,0,null,C.line,1.5);
      L.forEach(l=>{if(kind)box(c,X(l)-2.5,y,5,H0,0,'#04070C');else box(c,X(l)-2,y+2,4,H0-4,0,wl2rgb(l),null,0,{glow:10});});});
    strip(yC,fin(t,.2,.6),'연속 스펙트럼','고온의 물체가 내는 빛',1,[]);
    SA_g(c,fin(t,.6,.6),()=>{T(c,'← 파장이 짧다',250,128,{size:12,color:C.dim});T(c,'파장이 길다 →',890,128,{size:12,color:C.dim,align:'right'});});
    strip(yX,fin(t,1.2,.6),'원소 X의 방출 스펙트럼','고온의 기체 X가 내는 빛',0,LX);
    strip(yS,fin(t,2.2,.6),'별빛의 흡수 스펙트럼','별의 대기(저온 기체)를 지난 빛',1,LS);
    strip(yY,fin(t,6.6,.6),'원소 Y의 방출 스펙트럼','고온의 기체 Y가 내는 빛',0,LY);
    LX.forEach((l,k)=>{const a=fin(t,3.4+k*.55,.4);poly(c,[[X(l),yX+H0],[X(l),yX+H0+(yS-yX-H0)*a]],SA_GR,2.5,{dash:[4,3],alpha:a});chk(c,X(l)+14,221,6,SA_GR,a);});
    LY.forEach((l,k)=>{const a=fin(t,7.6+k*.7,.4),ok=l===589,col=ok?SA_GR:SA_PK;poly(c,[[X(l),yY],[X(l),yY-(yY-yS-H0)*a]],col,2.5,{dash:[4,3],alpha:a});
      if(ok)chk(c,X(l)+14,315,6,col,a);else{crs(c,X(l)+14,315,5,col,a);SA_g(c,a,()=>dot(c,X(l),yS+H0/2,13,null,{stroke:SA_PK,lw:2,dash:[3,3]}));}});
    const V=[[5.8,SA_GR,'X: 선 4개가 모두 같은 위치','→ 별의 대기에 X가 있다'],[10,SA_PK,'Y: 선 3개 중 1개만 같은 위치','→ Y가 있다고 할 수 없다'],[11.4,IC[0],'X의 선이 아닌 흡수선이 남는다','→ X로만 이루어진 것은 아니다']];
    V.forEach((v,i)=>SA_g(c,fin(t,v[0],.6),()=>{const x=40+i*300;rr(c,x,418,280,84,12,ra(v[1],.1),v[1],2);T(c,v[2],x+18,446,{size:15,w:700});T(c,v[3],x+18,476,{size:14,color:v[1]});}));
  }});

/* ───────── Ⅱ-2 원소의 기원 ───────── */
S.push({u:1,ch:'물질과 규칙성',title:'원소가 만들어진 세 곳',file:'02-matter.html',
  sub:'수소와 헬륨의 대부분은 빅뱅 직후에, 철까지의 원소는 별 내부의 핵융합으로, 철보다 무거운 원소는 초신성 폭발로 만들어졌습니다.',
  fx:[{w:1,f:'빅뱅 직후: 수소 · 헬륨(대부분)',n:'개수비 12 : 1 → 질량비 3 : 1'},{w:1,f:'별 내부 핵융합: 헬륨보다 무겁고 철까지',n:'중심으로 갈수록 무거운 원소'},{w:1,f:'초신성 폭발: 철보다 무거운 원소',n:'금 · 우라늄'}],
  pts:['헬륨 원자핵 1개의 질량이 수소 원자핵의 약 4배라서, 개수비 12 : 1이 <em>질량비 3 : 1</em>이 됩니다. 관측한 값과 맞아 빅뱅의 근거가 됩니다.','핵융합은 <em>철</em>에서 멈춥니다. 철 원자핵이 매우 안정해서 융합해도 에너지를 얻을 수 없기 때문입니다.','함정: 헬륨 <em>원자핵</em>은 약 3분 무렵, <em>원자</em>는 약 38만 년 뒤에 만들어졌습니다. ‘헬륨의 대부분이 별에서 만들어졌다’도 틀린 말입니다.','중심에 철이 있는 내부 구조 그림이면 태양보다 질량이 훨씬 큰 별입니다. 태양과 비슷한 별은 탄소·산소까지 만듭니다.'],
  dur:16,still:14,
  draw(c,t){
    const cy=205,ZC=[C.u2,IC[0],SA_PK],a1=fin(t,.2,.6),a2=fin(t,3.4,.7),a3=fin(t,9.2,.7);
    SA_g(c,a1,()=>{K(c,'① 빅뱅 직후',160,48,{size:17,w:700,color:ZC[0]});
      label(c,'H 원자핵(양성자) 12개',160,100,C.muted,{size:12});
      for(let j=0;j<12;j++){const a=j/12*TAU+t*.18;dot(c,160+Math.cos(a)*84,cy+Math.sin(a)*84,7,'#FF8A7A',{glow:6});}
      const k=ease(seg(t,.9,3)),d=lerp(44,8,k);[[-1,-1,1],[1,1,1],[1,-1,0],[-1,1,0]].forEach(p=>dot(c,160+p[0]*d,cy-6+p[1]*d,8,p[2]?'#FF8A7A':'#AAB6C4',{stroke:SA_INK,lw:1}));
      if(k>.95)dot(c,160,cy-6,24,null,{stroke:ra(C.u2,.8),lw:2,glow:10,gc:C.u2});
      label(c,'He 원자핵 1개',160,cy+36,C.u2,{size:12.5,alpha:fin(t,2.8,.5)});
      K(c,'개수비  H 12 : He 1',160,318,{size:14});SA_g(c,fin(t,2.9,.6),()=>K(c,'질량비  12×1 : 1×4 = 3 : 1',160,342,{size:15,w:700,color:ZC[0]}));
      K(c,'약 3분: 헬륨 원자핵 (양성자 2 + 중성자 2)',160,372,{size:12.5,color:C.muted});K(c,'약 38만 년: 원자 (전자를 붙잡음)',160,392,{size:12.5,color:C.muted});});
    arw(c,264,cy,364,cy,C.text,3,11,a2);
    SA_g(c,a2,()=>{K(c,'② 별 내부 — 핵융합',480,48,{size:17,w:700,color:ZC[1]});
      const R=[100,83,66,50,34,18],N=['H','He','C','O','Si','Fe'],F=['#24476B','#34608F','#5F5AA6','#9A5C97','#CF6E4F','#F4B544'];
      R.forEach((r,i)=>{const a=fin(t,3.6+i*.8,.6);if(a<=0)return;dot(c,480,cy,r,F[i],{stroke:ra('#E6EDF5',.35),lw:1,alpha:a,glow:i===5?12:0});
        SA_g(c,a,()=>T(c,N[i],480,i<5?cy-(r+R[i+1])/2:cy,{size:13,w:700,align:'center',color:i===5?'#1B1300':C.text}));});
      K(c,'중심으로 갈수록 온도 ↑ → 더 무거운 원소',480,318,{size:13.5});SA_g(c,fin(t,7.8,.6),()=>{K(c,'철에서 멈춘다',480,342,{size:15,w:700,color:ZC[1]});
        K(c,'철은 융합해도 에너지를 얻지 못한다',480,366,{size:12.5,color:C.muted});});K(c,'태양과 비슷한 별: 탄소 · 산소까지',480,390,{size:12.5,color:C.muted});});
    arw(c,598,cy,694,cy,C.text,3,11,a3);
    SA_g(c,a3,()=>{K(c,'③ 초신성 폭발',800,48,{size:17,w:700,color:ZC[2]});
      const sh=ease(seg(t,9.5,10.3)),u=t<10.3?0:((t-10.3)*.42)%1;dot(c,800,cy,lerp(30,11,sh),'#F4B544',{glow:16});
      if(t>=10.3){dot(c,800,cy,12+80*u,ra(SA_PK,.12*(1-u)),{stroke:ra(SA_PK,1-u*.8),lw:3});
        for(let j=0;j<22;j++){const a=j/22*TAU+rnd(j+3)*.25,r=16+(54+rnd(j+40)*22)*u,hv=j%3===0,ca=Math.cos(a),sa=Math.sin(a);
          poly(c,[[800+ca*r*.55,cy+sa*r*.55],[800+ca*r,cy+sa*r]],ra(hv?'#FFD54F':'#E6EDF5',.35*(1-u*.6)),hv?2.5:1.5);dot(c,800+ca*r,cy+sa*r,hv?6:3.5,hv?'#FFD54F':'#E6EDF5',{alpha:1-u*.6,glow:hv?10:0});}}
      K(c,'중심부가 급격히 수축 → 폭발',800,318,{size:13.5});K(c,'철보다 무거운 원소',800,342,{size:15,w:700,color:ZC[2]});
      K(c,'금 · 우라늄 등',800,366,{size:12.5,color:C.muted});K(c,'원소가 우주로 흩어져 새 성운으로',800,390,{size:12.5,color:C.muted});});
    label(c,'원소가 무거워지는 방향 →',480,424,C.dim,{size:12});
    [[80,220,'H · He',a1,'빅뱅 직후'],[300,320,'C · N · O · Si … Fe',a2,'별 내부의 핵융합'],[620,260,'Au · U …',a3,'초신성 폭발']].forEach((b,i)=>{
      SA_g(c,.28+.72*b[3],()=>{box(c,b[0]+2,438,b[1]-4,34,8,ra(ZC[i],.2),ZC[i],2);K(c,b[2],b[0]+b[1]/2,455,{size:15,w:700,color:ZC[i]});K(c,b[4],b[0]+b[1]/2,490,{size:13,color:C.muted});});});
  }});

/* ───────── Ⅱ-3 주기율표와 전자 배치 ───────── */
const SA_PT=[['H','','','','','','','He'],['Li','Be','B','C','N','O','F','Ne'],['Na','Mg','Al','Si','P','S','Cl','Ar']];
S.push({u:1,ch:'물질과 규칙성',title:'전자 배치로 주기와 족 읽기',file:'02-matter.html',
  sub:'전자를 안쪽 껍질부터 채워 (2, 8, 1)처럼 적으면 숫자의 개수가 주기, 마지막 숫자가 족의 일의 자리입니다. 같은 족은 원자가 전자 수가 같아 성질이 비슷합니다.',
  fx:[{w:1,f:'주기 = 전자가 들어 있는 껍질 수',n:'가로줄'},{w:1,f:'족 = 가장 바깥 껍질의 전자 수가 같은 세로줄',n:'화학적 성질이 비슷'},{w:1,f:'1족 Li < Na < K · 17족 F > Cl > Br > I',n:'반응성이 커지는 방향이 반대'}],
  pts:['<em>원자가 전자</em>(가장 바깥 껍질에서 결합에 참여하는 전자)가 화학적 성질을 정합니다. 그래서 같은 족 원소의 성질이 비슷합니다.','1족 알칼리 금속은 전자 1개를 잃어 +1의 양이온, 17족 할로젠은 전자 1개를 얻어 −1의 음이온이 됩니다.','함정: <em>수소</em>는 1족에 있지만 알칼리 금속이 아닌 비금속입니다. 헬륨은 전자가 2개뿐이지만 18족입니다.','반응성이 커지는 방향은 1족은 <em>아래쪽</em>, 17족은 <em>위쪽</em>으로 서로 반대입니다.'],
  dur:15,still:8,
  draw(c,t){
    const P=IC[1],G=IC[0],E=[['Li',[2,1],1,0],['O',[2,6],1,5],['Na',[2,8,1],2,0],['Cl',[2,8,7],2,6],['Ar',[2,8,8],2,7]],GN=['1','2','13','14','15','16','17','18'];
    const e=E[Math.floor(t/2.9)%5],q=t%2.9,ax=190,ay=232,RS=[44,84,124],tot=e[1].reduce((a,b)=>a+b,0),shown=Math.round(tot*ease(seg(q,.15,1.5))),fa=Math.min(fin(q,0,.3),1-seg(q,2.7,2.9));
    label(c,'전자는 안쪽 껍질부터 채운다: 2 → 8 → 8',190,62,C.muted,{size:13});
    SA_g(c,fa,()=>{let left=shown;e[1].forEach((m,s)=>{dot(c,ax,ay,RS[s],null,{stroke:ra(P,.45),lw:1.5});const n=Math.min(m,left);left-=n;const out=s===e[1].length-1;
        for(let j=0;j<n;j++){const a=j/m*TAU-Math.PI/2+t*.3*(s%2?-1:1);dot(c,ax+Math.cos(a)*RS[s],ay+Math.sin(a)*RS[s],out?6.5:5,out?G:'#E6EDF5',{glow:out?10:0});}});
      dot(c,ax,ay,23,ra(P,.35),{stroke:P,lw:2});T(c,e[0],ax,ay+1,{size:17,w:700,align:'center'});
      const k=fin(q,1.5,.4);SA_g(c,k,()=>{T(c,e[0]+'  ('+e[1].join(', ')+')',ax,392,{size:20,font:MONO,align:'center',w:600});
        K(c,'숫자 '+e[1].length+'개 → '+e[1].length+'주기',ax,424,{size:15,color:C.u2,w:600});K(c,'마지막 숫자 '+e[1][e[1].length-1]+' → '+GN[e[3]]+'족',ax,450,{size:15,color:G,w:600});});});
    const x0=432,y0=104,cw=58,ch=54;
    label(c,'족(세로줄): 가장 바깥 껍질의 전자 수가 같다',664,62,C.muted,{size:13});label(c,'주기',410,86,C.dim,{size:12});
    GN.forEach((g,i)=>label(c,g,x0+i*cw+cw/2,86,i===e[3]&&q>1.5?G:C.muted,{size:13}));
    SA_PT.forEach((row,r)=>{label(c,String(r+1),410,y0+r*ch+ch/2,r===e[2]&&q>1.5?C.u2:C.muted,{size:13});
      row.forEach((s,i)=>{if(!s)return;const x=x0+i*cw,y=y0+r*ch,col=i===0&&r>0?G:i===6?SA_PK:i===7?C.u2:null,on=s===e[0]&&q>1.5,z=r===0?(i?2:1):r*8-5+i;
        rr(c,x+2,y+2,cw-4,ch-4,7,col?ra(col,.16):SA_INK,on?'#FFFFFF':col||C.line,on?3:1.3);if(on)box(c,x+2,y+2,cw-4,ch-4,7,null,'#FFFFFF',2,{glow:14});
        T(c,s,x+cw/2,y+ch/2+6,{size:17,w:700,align:'center',color:col||C.text});T(c,String(z),x+8,y+14,{size:12,font:MONO,color:C.dim});});});
    T(c,'수소는 1족이지만 알칼리 금속이 아니다 (비금속)',500,131,{size:13,color:C.muted});
    arw(c,x0+50,y0+ch+12,x0+50,y0+3*ch-8,G,2,8);arw(c,x0+6*cw+50,y0+3*ch-8,x0+6*cw+50,y0+ch+12,SA_PK,2,8);
    [[G,'1족 알칼리 금속','Li · Na · K','원자가 전자 1개 → 잃고 +1의 양이온','반응성: 아래로 갈수록 크다  Li < Na < K',0],[SA_PK,'17족 할로젠','F · Cl · Br · I','원자가 전자 7개 → 1개 얻고 −1의 음이온','반응성: 위로 갈수록 크다  F > Cl > Br > I',6],[C.u2,'18족 비활성 기체','He · Ne · Ar','가장 바깥 껍질이 가득 참 → 안정','다른 원소와 거의 반응하지 않는다',7]].forEach((g,i)=>{
      const y=290+i*66,on=g[5]===e[3]&&q>1.5;rr(c,x0,y,464,58,12,ra(g[0],on?.2:.07),g[0],on?2.6:1.4);
      T(c,g[1],x0+16,y+20,{size:15,w:700,color:g[0]});T(c,g[2],x0+16,y+42,{size:12.5,color:C.muted,font:MONO});T(c,g[3],x0+166,y+20,{size:14});T(c,g[4],x0+166,y+42,{size:12.5,color:C.muted});});
    K(c,'전자 배치를 (2, 8, …)로 적으면 원자 번호 · 주기 · 족이 한 번에 나온다',480,512,{size:14,color:C.text});
  }});

/* ───────── Ⅱ-4 이온 결합과 공유 결합 ───────── */
function SA_bulb(c,x,y,on){box(c,x-6,y+12,12,10,2,'#5E738B');dot(c,x,y,14,on?'#FFE28A':'#16263A',{stroke:on?'#FFE28A':C.dim,lw:2,glow:on?22:0});}
S.push({u:1,ch:'물질과 규칙성',title:'이온 결합과 공유 결합',file:'02-matter.html',
  sub:'금속과 비금속은 전자를 주고받아 이온 결합을, 비금속끼리는 전자쌍을 함께 가져 공유 결합을 합니다. 전류는 전하를 띤 입자가 움직일 수 있을 때만 흐릅니다.',
  fx:[{w:1,f:'이온 결합: 금속 + 비금속',n:'양이온과 음이온의 전기적 인력'},{w:1,f:'공유 결합: 비금속 + 비금속',n:'전자쌍을 함께 가짐'},{w:1,f:'전류: 전하를 띤 입자가 움직일 수 있어야 흐른다',n:'이온 결합 물질은 액체 · 수용액에서'}],
  pts:['가장 바깥 껍질이 가득 찬 <em>비활성 기체의 전자 배치</em>가 안정해서, 원자들은 전자를 잃거나 얻거나 함께 가집니다.','Na(2, 8, 1)은 전자 1개를 잃어 Na⁺(2, 8), Cl(2, 8, 7)은 1개를 얻어 Cl⁻(2, 8, 8)이 됩니다. 물은 O가 H 2개와 전자쌍을 1개씩 공유합니다.','함정: 고체 염화 나트륨에 전류가 흐르지 않는 것은 이온이 없어서가 아니라 <em>움직이지 못해서</em>입니다.','설탕 같은 공유 결합 물질은 물에 녹아도 <em>분자 그대로</em>라서 전류가 흐르지 않습니다.'],
  dur:15,still:13,
  draw(c,t){
    const G=IC[0],y=158,k1=ease(seg(t,1,2.6)),k2=ease(seg(t,2.8,4)),k3=ease(seg(t,5,7));
    T(c,'이온 결합',50,50,{size:18,w:700,color:G});T(c,'금속 Na + 비금속 Cl',148,51,{size:14,color:C.muted});
    T(c,'공유 결합',520,50,{size:18,w:700,color:C.u2});T(c,'비금속 O + 비금속 H',618,51,{size:14,color:C.muted});poly(c,[[480,40],[480,282]],C.line,1.5,{dash:[3,5]});
    const nx=150+20*k2,cx=350-20*k2,done=k1>.97;
    dot(c,nx,y,44,null,{stroke:ra(G,.6*(1-k1)+.12),lw:1.5,dash:done?[3,4]:null});dot(c,nx,y,21,ra(G,.3),{stroke:G,lw:2});T(c,done?'Na⁺':'Na',nx,y+1,{size:15,w:700,align:'center'});
    dot(c,cx,y,48,null,{stroke:ra(SA_GR,.6),lw:1.5});dot(c,cx,y,21,ra(SA_GR,.28),{stroke:SA_GR,lw:2});T(c,done?'Cl⁻':'Cl',cx,y+1,{size:15,w:700,align:'center'});
    for(let j=0;j<8;j++)if(j!==4){const a=j/8*TAU;dot(c,cx+Math.cos(a)*48,y+Math.sin(a)*48,5,'#E6EDF5');}
    dot(c,lerp(nx+44,cx-48,k1),y-Math.sin(k1*Math.PI)*26,6,G,{glow:12});
    K(c,done?'(2, 8) 네온과 같다':'(2, 8, 1)',nx-14,y+68,{size:12.5,color:C.muted});K(c,done?'(2, 8, 8) 아르곤과 같다':'(2, 8, 7)',cx+14,y+68,{size:12.5,color:C.muted});
    SA_g(c,k2,()=>{arw(c,nx+26,y-62,nx+58,y-62,SA_HOT,2.5,8);arw(c,cx-26,y-62,cx-58,y-62,SA_HOT,2.5,8);K(c,'전자를 주고받는다 → 양이온과 음이온이 서로 끌어당긴다',250,262,{size:13.5});});
    const ox=720,h1=lerp(596,654,k3),h2=lerp(844,786,k3);
    dot(c,ox,y,50,null,{stroke:ra(SA_PK,.6),lw:1.5});dot(c,ox,y,22,ra(SA_PK,.28),{stroke:SA_PK,lw:2});T(c,'O',ox,y+1,{size:15,w:700,align:'center'});
    [h1,h2].forEach((hx,i)=>{const s=i?-1:1,xm=(ox-s*50+hx+s*30)/2;dot(c,hx,y,30,null,{stroke:ra(C.u2,.6),lw:1.5});dot(c,hx,y,13,ra(C.u2,.28),{stroke:C.u2,lw:2});T(c,'H',hx,y+1,{size:13,w:700,align:'center'});
      if(k3>.97)c.save(),c.strokeStyle=ra(G,.8),c.lineWidth=1.5,c.beginPath(),c.ellipse(xm,y,9,17,0,0,TAU),c.stroke(),c.restore();
      dot(c,lerp(ox-s*50,xm,k3),y-7*k3,5,'#E6EDF5');dot(c,lerp(hx+s*30,xm,k3),y+7*k3,5,C.u2);});
    [-1,1].forEach(s=>[-.2,.2].forEach(d=>dot(c,ox+Math.sin(d)*50,y+s*Math.cos(d)*50,5,'#E6EDF5')));
    SA_g(c,k3,()=>{K(c,'H₂O — 공유 전자쌍 2개',720,238,{size:14,w:700,color:C.u2});K(c,'전자쌍을 함께 가진다 → 모두 비활성 기체와 같은 배치',720,262,{size:13.5});});
    SA_g(c,fin(t,7.6,.6),()=>K(c,'전류가 흐르려면 — 전하를 띤 입자가 움직일 수 있어야 한다',480,306,{size:15,w:700,color:G}));
    [['고체 염화 나트륨 — 전류 ✕','이온은 있지만 제자리에 묶여 있다',0],['염화 나트륨 수용액 — 전류 ○','양이온과 음이온으로 나뉘어 움직인다',1],['설탕물 — 전류 ✕','분자 그대로 녹아 전하를 띤 입자가 없다',0]].forEach((p,i)=>SA_g(c,fin(t,8.2+i*1.3,.6),()=>{
      const x=60+i*285;rr(c,x,326,270,114,12,SA_INK,p[2]?SA_GR:C.line,p[2]?2.2:1.5);SA_bulb(c,x+236,372,p[2]);
      const ion=(px,py,pos)=>{dot(c,px,py,9,ra(pos?SA_HOT:SA_BL,.3),{stroke:pos?SA_HOT:SA_BL,lw:1.5});T(c,pos?'+':'−',px,py+1,{size:12,align:'center',w:700,color:C.text});};
      if(i===0)for(let r=0;r<3;r++)for(let q=0;q<5;q++)ion(x+34+q*34+Math.sin(t*9+r+q*2)*1.2,354+r*30,(r+q)%2===0);
      if(i===1)for(let q=0;q<6;q++){const pos=q<3,u=(t*.22+rnd(q+11))%1;ion(x+26+(pos?1-u:u)*172,346+q*15,pos);}
      if(i===2)for(let q=0;q<7;q++){const px=x+40+rnd(q+60)*150+Math.sin(t*.9+q)*9,py=350+rnd(q+70)*66+Math.cos(t*.7+q*2)*7;dot(c,px,py,8,ra('#AAB6C4',.25),{stroke:'#AAB6C4',lw:1.5});}
      K(c,p[0],x+135,462,{size:14,w:700,color:p[2]?SA_GR:C.text});K(c,p[1],x+135,486,{size:13,color:C.muted});}));
  }});

/* ───────── Ⅲ-1 기권과 해수의 층상 구조 ───────── */
function SA_loop(c,x,y,rx,ry,t,col){c.save();c.strokeStyle=ra(col,.45);c.lineWidth=1.5;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.stroke();c.restore();   // 대류(빙글 도는 흐름)
  for(let k=0;k<2;k++){const a=t*1.6+k*Math.PI;dot(c,x+Math.cos(a)*rx,y+Math.sin(a)*ry,3.5,col);}}
S.push({u:2,ch:'지구시스템',title:'기권과 해수의 층상 구조',file:'03-earth-system.html',
  sub:'기권은 높이에 따른 기온으로, 해수는 깊이에 따른 수온으로 층을 나눕니다. 무엇이 그 층을 데우는지를 알면 기온이 꺾이는 방향이 설명됩니다.',
  fx:[{w:1,f:'대류권 ↓ · 성층권 ↑ · 중간권 ↓ · 열권 ↑',n:'높이 올라갈수록 기온'},{w:1,f:'기상 현상 = 대류 + 수증기',n:'대류권에서만'},{w:1,f:'혼합층 · 수온 약층 · 심해층',n:'수온 약층은 안정한 층'}],
  pts:['대류권은 <em>지표</em>가 내보내는 열로, 성층권은 <em>오존층</em>이 자외선을 흡수해서, 열권은 태양 에너지를 직접 흡수해서 데워집니다.','아래가 따뜻하고 위가 차가우면 대류가 일어나고(대류권·중간권), 아래가 차갑고 위가 따뜻하면 <em>안정</em>합니다(성층권).','함정: 중간권은 대류가 일어나지만 <em>수증기가 거의 없어</em> 기상 현상이 없습니다.','<em>수온 약층</em>은 위아래로 섞이지 않아 혼합층과 심해층 사이의 교환을 막습니다. 혼합층은 바람이 강할수록 두꺼워집니다.'],
  dur:15,still:13,
  draw(c,t){
    const U=C.u2,B=[['대류권','↓','지표가 내보내는 열로 데워진다','대류 ○ · 수증기 ○ → 기상 현상'],['성층권','↑','오존층이 자외선을 흡수해 데워진다','아래가 차가워 안정하다 (대류 ✕)'],['중간권','↓','아래가 따뜻해 대류가 일어난다','수증기가 거의 없다 → 기상 현상 ✕'],['열권','↑','태양 에너지를 직접 흡수한다','공기가 매우 희박 · 오로라']];
    T(c,'기권 — 높이에 따른 기온',40,40,{size:16,w:700,color:U});T(c,'해수 — 깊이에 따른 수온',640,40,{size:16,w:700,color:U});
    arrow(c,70,480,70,70,C.dim,1.5,8);arrow(c,70,480,284,480,C.dim,1.5,8);T(c,'기온 →',284,500,{size:12.5,color:C.muted,align:'right'});T(c,'높이',84,74,{size:12.5,color:C.muted});
    [['11 km',380],['50 km',280],['80 km',180]].forEach(k=>{poly(c,[[70,k[1]],[572,k[1]]],C.line,1.2,{dash:[4,5]});T(c,k[0],62,k[1],{size:12,color:C.muted,align:'right',font:MONO});});
    box(c,72,331,208,26,0,ra(SA_GR,.14));T(c,'오존층',276,344,{size:12,color:SA_GR,align:'right'});
    const P=SA_part([[247,480],[138,380],[221,280],[93,180],[258,84]],seg(t,.6,6)),pe=P[P.length-1];
    SA_loop(c,104,438,14,26,t,SA_HOT);if(t>3.4)SA_loop(c,240,214,14,24,t,SA_HOT);
    poly(c,P,IC[0],3.5);if(t<6)dot(c,pe[0],pe[1],6,IC[0],{glow:12});
    B.forEach((b,i)=>SA_g(c,fin(t,.7+i*1.35,.6),()=>{const m=430-i*100,col=b[1]==='↓'?SA_BL:SA_HOT;
      T(c,b[0],296,m-26,{size:16,w:700,color:col});T(c,'올라갈수록 기온 '+b[1],296+kw(c,b[0],16,700)+12,m-25,{size:13,color:col});T(c,b[2],296,m-2,{size:13.5});T(c,b[3],296,m+20,{size:13.5,color:C.muted});}));
    SA_g(c,fin(t,6.5,.7),()=>{
      const wv=[];for(let x=650;x<=900;x+=6)wv.push([x,118+Math.sin(x*.07+t*2.2)*2.5]);poly(c,wv,SA_BL,2.5);arrow(c,650,118,650,452,C.dim,1.5,8);T(c,'깊이',662,446,{size:12.5,color:C.muted});T(c,'수온 →',900,98,{size:12.5,color:C.muted,align:'right'});
      T(c,'바람',656,98,{size:12.5,color:C.muted});for(let k=0;k<3;k++){const u=(t*.4+k/3)%1;arw(c,692+u*70,98,712+u*70,98,C.muted,2,7,Math.sin(u*Math.PI));}
      [190,305].forEach(y=>poly(c,[[650,y],[900,y]],C.line,1.2,{dash:[4,5]}));
      SA_loop(c,748,154,22,14,t,SA_BL);SA_loop(c,812,154,22,14,-t,SA_BL);
      const Q=smooth([[860,118],[860,150],[860,186],[800,232],[738,280],[714,314],[705,370],[701,440]],12),m=Math.max(2,Math.floor(Q.length*seg(t,7,10)));poly(c,Q.slice(0,m),IC[0],3.5);
      T(c,'혼합층',662,154,{size:14,w:700,color:U});SA_g(c,fin(t,8.2,.5),()=>T(c,'수온 약층',662,250,{size:14,w:700,color:U}));SA_g(c,fin(t,9.2,.5),()=>T(c,'심해층',888,372,{size:14,w:700,color:U,align:'right'}));
      [['혼합층: 바람이 섞어 수온이 고르다',7.4],['수온 약층: 안정 → 위아래 교환을 막는다',8.6],['심해층: 태양 에너지가 닿지 않는다',9.8]].forEach((r,i)=>SA_g(c,fin(t,r[1],.6),()=>T(c,r[0],640,476+i*22,{size:13.5,color:i===1?C.text:C.muted})));});
  }});

/* ───────── Ⅲ-2 탄소의 순환 ───────── */
S.push({u:2,ch:'지구시스템',title:'탄소의 순환',file:'03-earth-system.html',
  sub:'탄소는 권역마다 다른 모습으로 있으면서 권역 사이를 이동합니다. 들어오는 양과 나가는 양이 같으면 그 권역의 탄소량은 일정합니다.',
  fx:[{w:1,f:'기권 ⇄ 생물권: 광합성 · 호흡',n:'이산화 탄소 ⇄ 유기물'},{w:1,f:'지권 → 기권: 화산 분출 · 화석 연료의 연소',n:'석회암 · 화석 연료에 있던 탄소'},{w:1,f:'탄소 변화량 = 들어온 양 − 나간 양',n:'두 양이 같으면 균형'}],
  pts:['탄소는 기권에서 <em>이산화 탄소·메테인</em>, 생물권에서 <em>유기물</em>, 수권에서 <em>탄산 이온</em>, 지권에서 <em>석회암·화석 연료</em>로 있습니다.','화석 연료를 태우면 지권에 오래 갇혀 있던 탄소가 짧은 시간에 기권으로 나갑니다. 들어오는 양이 나가는 양보다 많아져 <em>대기 중 이산화 탄소가 늘어납니다.</em>','함정: 탄소가 가장 많이 들어 있는 권역은 기권이 아니라 <em>지권</em>입니다. 석회암에 갇혀 있기 때문입니다.','권역 화살표는 <em>원인이 된 권역 → 결과가 나타난 권역</em>입니다. ‘비가 내려 암석이 깎였다’는 기권 → 지권입니다.'],
  dur:16,still:14,
  draw(c,t){
    const A=C.u2,Bc=SA_GR,Hc=SA_BL,Gc=IC[0],hot=fin(t,11,.8);
    const F=[[[[400,134],[200,228]],Bc,'광합성',314,164,'right',1],[[[250,228],[450,134]],Bc,'호흡',332,200,'left',2.1],[[[560,134],[760,228]],Hc,'해수에 녹는다',646,164,'left',3.2],[[[710,228],[510,134]],Hc,'수온이 오르면 빠져나온다',628,200,'right',4.3],
      [[[200,308],[346,440]],Gc,'유해가 묻혀 화석 연료로',276,396,'right',5.4],[[[760,308],[614,440]],Gc,'탄산염으로 가라앉아 석회암으로',684,396,'left',6.5],[[[480,406],[480,134]],SA_HOT,'',0,0,'left',7.6]];
    F.forEach((f,i)=>SA_g(c,fin(t,f[6],.6),()=>{const p=f[0],last=i===6;arw(c,p[0][0],p[0][1],p[1][0],p[1][1],ra(f[1],.55),last?2+2*hot:1.8,10);
      flow(c,p,t*(last?1+1.4*hot:1),f[1],last?3+Math.round(3*hot):3,last?5+hot:4.5,.3);if(f[2])T(c,f[2],f[3],f[4],{size:13,color:f[1],align:f[5]});}));
    SA_g(c,fin(t,7.6,.6),()=>{T(c,'화산 분출',468,286,{size:13,color:SA_HOT,align:'right'});T(c,'화석 연료의 연소',492,286,{size:13+hot,color:SA_HOT,w:hot>.5?700:500});});
    [[360,58,240,72,A,'기권','이산화 탄소 · 메테인'],[60,232,220,72,Bc,'생물권','유기물 (탄소 화합물)'],[680,232,220,72,Hc,'수권','물에 녹은 탄산 이온'],[350,410,260,90,Gc,'지권','석회암 · 화석 연료']].forEach((b,i)=>SA_g(c,fin(t,.1+i*.2,.5),()=>{
      rr(c,b[0],b[1],b[2],b[3],14,SA_INK,b[4],2.4);K(c,b[5],b[0]+b[2]/2,b[1]+24,{size:18,w:700,color:b[4]});K(c,b[6],b[0]+b[2]/2,b[1]+51,{size:14});
      if(i===3)K(c,'탄소가 가장 많이 들어 있는 곳',480,b[1]+74,{size:12.5,color:Gc});}));
    rr(c,60,44,270,92,12,'rgba(255,255,255,.03)',C.line,1.4);T(c,'어느 권역의 탄소 변화량',78,66,{size:13,color:C.muted});T(c,'= 들어온 양 − 나간 양',78,92,{size:16,w:700});T(c,'두 양이 같으면 변화 없음 (균형)',78,118,{size:12.5,color:C.muted});
    rr(c,630,44,270,92,12,'rgba(255,255,255,.03)',hot>.1?SA_HOT:C.line,1.4);T(c,'대기 중 이산화 탄소',648,66,{size:13,color:C.muted});bar(c,648,82,234,15,.42+.38*ease(seg(t,11.3,13.6)),SA_HOT);
    SA_g(c,hot,()=>T(c,'들어오는 양 > 나가는 양 → 늘어난다',648,118,{size:12.5,color:SA_HOT}));
  }});

/* ───────── Ⅲ-3 판의 경계 ───────── */
function SA_quake(c,x,y,t,k){const u=(t*.8+k*.37)%1;dot(c,x,y,3,'#FFE28A');dot(c,x,y,3+12*u,null,{stroke:ra('#FFE28A',1-u),lw:2});}   // 지진(퍼지는 고리)
S.push({u:2,ch:'지구시스템',title:'판의 경계와 지각 변동',file:'03-earth-system.html',
  sub:'맨틀 대류로 판이 움직이면 경계에 힘이 쌓여 지진과 화산 활동이 일어납니다. 두 판이 멀어지는지, 가까워지는지, 어긋나는지로 경계를 나눕니다.',
  fx:[{w:1,f:'발산형: 해령 · 열곡대',n:'판이 생성 · 맨틀 대류의 상승부'},{w:1,f:'수렴형: 해구 · 호상 열도 · 습곡 산맥',n:'섭입형에서는 판이 소멸'},{w:1,f:'보존형: 변환 단층',n:'판의 생성도 소멸도 없음'},{w:1,f:'지진: 모두 활발 · 화산 활동: 발산형 · 섭입형만',n:'충돌형 · 보존형은 거의 없음'}],
  pts:['<em>지구 내부 에너지 → 맨틀 대류 → 판의 이동 → 경계에 힘이 쌓임 → 지진·화산</em>. 그래서 지진대·화산대가 판의 경계와 거의 겹칩니다.','화산 활동에는 마그마가 필요합니다. 벌어진 틈으로 맨틀 물질이 올라오는 발산형, 들어간 판 위쪽에서 마그마가 생기는 섭입형에서만 활발합니다.','함정: <em>충돌형</em>(히말라야산맥)과 <em>보존형</em>(산안드레아스 단층)은 지진은 잦지만 화산 활동이 거의 없습니다.','경계를 가릴 때는 <em>화산 유무 → 지형</em> 순서로 봅니다. 섭입형에서는 판이 들어가는 쪽으로 갈수록 지진이 깊은 곳에서 일어납니다.'],
  dur:16,still:12,
  draw(c,t){
    const OC='#34587C',OS='#7FA6CC',CT='#4C6B58',CS='#8FB79B',MAN=ra(SA_HOT,.1);
    const PN=[['발산형','서로 멀어진다',1,'해령 · 열곡대 — 맨틀 물질이 올라와 새 판이 된다'],['수렴형 · 섭입형','밀도 큰 판이 아래로',1,'해구 · 호상 열도 · 화산이 있는 산맥 — 판이 소멸한다'],['수렴형 · 충돌형','대륙끼리 부딪친다',0,'습곡 산맥 (히말라야산맥) — 지층이 휘어지며 솟는다'],['보존형','어긋나 스친다 (위에서 본 모습)',0,'변환 단층 (산안드레아스 단층) — 생성도 소멸도 없다']];
    PN.forEach((p,i)=>SA_g(c,fin(t,.3+i*2.3,.7),()=>{const x=30+(i%2)*460,y=44+Math.floor(i/2)*226;
      rr(c,x,y,440,212,14,'rgba(255,255,255,.025)',C.line,1.4);T(c,p[0],x+16,y+22,{size:16,w:700,color:C.u2});T(c,p[1],x+28+kw(c,p[0],16,700),y+23,{size:13,color:C.muted});
      K(c,'지진 ○',x+336,y+23,{size:13,color:SA_GR,w:600});K(c,p[2]?'화산 ○':'화산 ✕',x+398,y+23,{size:13,color:p[2]?SA_GR:SA_PK,w:600});K(c,p[3],x+220,y+192,{size:13.5});
      if(i<3)box(c,x+16,y+124,408,48,6,MAN);
      if(i===0){const g=5+11*((t*.28)%1);box(c,x+30,y+92,188-g,30,4,OC,OS,1.5);box(c,x+222+g,y+92,188-g,30,4,OC,OS,1.5);
        poly(c,[[x+218-g-26,y+92],[x+218-g,y+78],[x+218-g,y+92]],OS,1.5,{fill:OC,close:true});poly(c,[[x+222+g+26,y+92],[x+222+g,y+78],[x+222+g,y+92]],OS,1.5,{fill:OC,close:true});
        box(c,x+218-g,y+84,4+2*g,84,2,ra(SA_HOT,.55));flow(c,[[x+220,y+168],[x+220,y+86]],t,SA_HOT,3,4.5,.5);
        arw(c,x+196,y+148,x+96,y+148,ra(SA_HOT,.7),2,8);arw(c,x+244,y+148,x+344,y+148,ra(SA_HOT,.7),2,8);T(c,'맨틀 대류의 상승부',x+28,y+160,{size:12,color:SA_HOT});
        arw(c,x+150,y+107,x+84,y+107,C.text,2.5,9);arw(c,x+290,y+107,x+356,y+107,C.text,2.5,9);K(c,'해령',x+220,y+62,{size:13,w:600});SA_quake(c,x+220,y+100,t,0);}
      if(i===1){poly(c,[[x+30,y+92],[x+226,y+92],[x+338,y+156],[x+324,y+172],[x+214,y+118],[x+30,y+118]],OS,1.5,{fill:OC,close:true});
        poly(c,[[x+240,y+84],[x+410,y+84],[x+410,y+122],[x+300,y+122]],CS,1.5,{fill:CT,close:true});poly(c,[[x+326,y+84],[x+346,y+56],[x+366,y+84]],CS,1.5,{fill:'#6B4F3F',close:true});
        flow(c,[[x+318,y+152],[x+340,y+110],[x+346,y+60]],t,SA_HOT,3,4,.45);arw(c,x+60,y+105,x+130,y+105,C.text,2.5,9);arw(c,x+402,y+103,x+372,y+103,C.text,2.5,9);
        poly(c,[[x+232,y+62],[x+232,y+86]],C.muted,1.2);K(c,'해구',x+232,y+52,{size:13,w:600});T(c,'화산',x+374,y+62,{size:13,w:600});
        [[250,104],[278,122],[306,139]].forEach((q,k)=>SA_quake(c,x+q[0],y+q[1],t,k));T(c,'들어가는 쪽으로 갈수록',x+28,y+142,{size:12,color:C.muted});T(c,'지진이 깊은 곳에서 일어난다',x+28,y+160,{size:12,color:C.muted});}
      if(i===2){const h=25+6*Math.sin(t*1.4);box(c,x+30,y+92,180,34,4,CT,CS,1.5);box(c,x+234,y+92,176,34,4,CT,CS,1.5);
        poly(c,[[x+176,y+92],[x+198,y+92-h*.6],[x+210,y+92-h*.32],[x+222,y+92-h],[x+235,y+92-h*.46],[x+248,y+92-h*.76],[x+268,y+92],[x+268,y+126],[x+176,y+126]],CS,1.5,{fill:CT,close:true});
        for(let k=0;k<2;k++){const W=[];for(let q=0;q<=92;q+=4)W.push([x+176+q,y+104+k*11+Math.sin(q*.2+k)*4]);poly(c,W,ra(CS,.6),1.2);}
        arw(c,x+60,y+109,x+130,y+109,C.text,2.5,9);arw(c,x+380,y+109,x+310,y+109,C.text,2.5,9);K(c,'습곡 산맥',x+222,y+50,{size:13,w:600});SA_quake(c,x+222,y+118,t,0);T(c,'어느 판도 깊이 들어가지 못한다',x+28,y+152,{size:12,color:C.muted});}
      if(i===3){box(c,x+30,y+48,380,54,4,OC,OS,1.5);box(c,x+30,y+104,380,54,4,'#2C4B6B',OS,1.5);
        c.save();c.beginPath();c.rect(x+31,y+49,378,108);c.clip();for(let k=0;k<5;k++){const a=x+30+((k*76+t*20)%380),b=x+30+((k*76+380-(t*20)%380)%380);poly(c,[[a,y+50],[a,y+100]],ra(OS,.5),2);poly(c,[[b,y+106],[b,y+156]],ra(OS,.5),2);}c.restore();
        poly(c,[[x+30,y+103],[x+410,y+103]],SA_PK,3);arw(c,x+84,y+70,x+164,y+70,C.text,2.5,9);arw(c,x+356,y+136,x+276,y+136,C.text,2.5,9);
        [[110,0],[220,1],[330,2]].forEach(q=>SA_quake(c,x+q[0],y+103,t,q[1]));T(c,'변환 단층',x+268,y+82,{size:13,w:600,color:SA_PK});}}));
    SA_g(c,fin(t,9.8,.7),()=>K(c,'지진: 네 경계 모두 활발   ·   화산 활동: 발산형 · 섭입형은 활발, 충돌형 · 보존형은 거의 없음',480,510,{size:14,color:C.text}));
  }});

/* ───────── Ⅲ-4 자유 낙하 ───────── */
S.push({u:2,ch:'역학 시스템',title:'자유 낙하 운동',file:'04-mechanics.html',
  sub:'중력만 받아 떨어지는 물체는 속도가 1초마다 같은 양씩 커집니다. 속도–시간 그래프 아래 넓이가 떨어진 거리입니다.',
  fx:[{f:'v = gt',n:'t초 뒤의 속도'},{f:'s = ½gt^2',n:'t초 동안 낙하한 거리'},{w:1,f:'1초마다 떨어지는 거리: 5 m → 15 m → 25 m',n:'차가 10 m로 일정 (g = 10 m/s²)'}],
  pts:['힘(중력)이 연직 아래로 일정하게 작용하므로 <em>속도가 일정하게 커지는</em> 운동이 됩니다.','속도–시간 그래프가 원점을 지나는 직선이라, 아래 넓이는 삼각형 ½ × t × gt = <em>½gt²</em>입니다.','함정: 공기 저항을 무시하면 <em>질량이 달라도</em> 낙하 시간과 바닥에 닿는 속도가 같습니다. 질량이 2배면 중력도 2배지만 속도를 바꾸는 데 필요한 힘도 2배입니다.','섬광 사진에서 물체 사이 간격이 일정하게 넓어지면 가속도가 일정한 운동입니다.'],
  dur:15,still:6.8,
  draw(c,t){
    const G=IC[0],tau=clamp(((t%7.5)-.6)*.6,0,3),Y=m=>70+m*8,yb=Y(5*tau*tau),x1=150,x2=215;
    poly(c,[[84,70],[84,430]],C.dim,1.5);for(let m=0;m<=45;m+=5){poly(c,[[78,Y(m)],[84,Y(m)]],C.dim,1.5);if([0,5,20,45].includes(m))T(c,m+' m',72,Y(m),{size:12,font:MONO,color:C.muted,align:'right'});}
    T(c,'m',x1,40,{size:17,font:SERIF,it:true,align:'center',color:C.muted});T(c,'2m',x2,40,{size:17,font:SERIF,it:true,align:'center',color:C.muted});
    poly(c,[[50,446],[450,446]],C.line,3);
    for(let k=0;k<=3&&k<=tau+1e-6;k++){const y=Y(5*k*k);dot(c,x1,y,9,null,{stroke:G,lw:1.5,alpha:.5});dot(c,x2,y,14,null,{stroke:G,lw:1.5,alpha:.5});T(c,k+'초',246,y,{size:12.5,color:C.muted});
      if(k>0){const ya=Y(5*(k-1)*(k-1));poly(c,[[312,ya+3],[312,y-3]],G,2);poly(c,[[306,ya+3],[318,ya+3]],G,2);poly(c,[[306,y-3],[318,y-3]],G,2);T(c,(10*k-5)+' m',326,(ya+y)/2,{size:15,w:700,color:G});}
      if(k>1){const ym=(Y(5*(k-2)*(k-2))+Y(5*(k-1)*(k-1)))/2,yn=(Y(5*(k-1)*(k-1))+y)/2;T(c,'차 10 m',392,(ym+yn)/2,{size:13,color:C.u2});}}
    dot(c,x1,yb,9,G,{glow:14});dot(c,x2,yb,14,G,{glow:14});if(tau>.05&&tau<2.97)arw(c,114,yb,114,yb+tau*14,C.u2,3,9);
    SA_g(c,seg(tau,2.9,3),()=>{K(c,'공기 저항을 무시하면 — 질량이 달라도 동시에 닿는다',250,474,{size:14.5,w:600});K(c,'질량 2배 → 중력 2배, 속도를 바꾸는 데 필요한 힘도 2배',250,500,{size:12.5,color:C.muted});});
    const x0=560,y0=440,gx=q=>x0+q*100,gy=v=>y0-v*9;
    axes(c,x0,y0,372,310,'t (초)','v (m/s)');[1,2,3].forEach(k=>{label(c,String(k),gx(k),y0+15,C.muted,{size:12});T(c,String(k*10),x0-8,gy(k*10),{size:12,font:MONO,color:C.muted,align:'right'});poly(c,[[x0,gy(k*10)],[x0+5,gy(k*10)]],C.dim,1.5);});
    poly(c,[[x0,y0],[gx(tau),y0],[gx(tau),gy(10*tau)]],null,0,{fill:ra(G,.2),close:true});
    [1,2].forEach(k=>{if(tau>k)poly(c,[[gx(k),y0],[gx(k),gy(10*k)]],ra(G,.7),1.5,{dash:[4,4]});});
    poly(c,[[x0,y0],[gx(tau),gy(10*tau)]],G,3.5);dot(c,gx(tau),gy(10*tau),6,G,{glow:12});
    [[5,626,422],[15,712,398],[25,812,372]].forEach((a,k)=>SA_g(c,seg(tau,k+.85,k+1),()=>K(c,a[0]+' m',a[1],a[2],{size:14,w:700,color:G})));
    T(c,'기울기 = g = 10 m/s²',580,178,{size:13.5,color:C.muted});T(c,'아래 넓이 = 떨어진 거리 = ½gt²',580,202,{size:13.5,color:C.muted});
    label(c,'t = '+tau.toFixed(1)+' 초',610,62,C.text,{size:15});label(c,'v = '+(10*tau).toFixed(0)+' m/s',735,62,C.u2,{size:15});label(c,'s = '+(5*tau*tau).toFixed(1)+' m',860,62,G,{size:15});
  }});

/* ───────── Ⅲ-5 수평으로 던진 물체 ───────── */
S.push({u:2,ch:'역학 시스템',title:'수평으로 던진 물체의 운동',file:'04-mechanics.html',
  sub:'수평 방향으로는 힘이 없어 등속 운동, 연직 방향으로는 중력을 받아 자유 낙하와 똑같이 움직입니다. 그래서 가만히 놓은 물체와 동시에 바닥에 닿습니다.',
  fx:[{w:1,f:'수평: 힘 없음 → 등속 운동',n:'수평 거리 = 던진 속도 × 시간'},{w:1,f:'연직: 중력 → 자유 낙하와 같은 운동',n:'연직 속도 = gt · 낙하 거리 = ½gt²'},{w:1,f:'낙하 시간은 높이로만 정해진다',n:'던진 속도와 관계없음'}],
  pts:['중력은 연직 아래로만 작용하고 수평 방향으로는 힘이 없습니다. 그래서 <em>수평은 등속, 연직은 자유 낙하</em>로 나누어 봅니다.','같은 높이에서 가만히 놓은 물체와 수평으로 던진 물체는 <em>동시에</em> 바닥에 닿습니다. 연직 방향 운동이 같기 때문입니다.','함정: 더 빠르게 던져도 낙하 시간은 같습니다. 달라지는 것은 수평 거리뿐이고, <em>2배 빠르게 던지면 2배 멀리</em> 갑니다.','운동 방향은 계속 아래로 꺾이지만 <em>가속도</em>는 언제나 연직 아래 방향, 크기 g로 일정합니다.'],
  dur:16,still:6.5,
  draw(c,t){
    const G=IC[0],tau=2*clamp(((t%8)-.8)/2.4),Y=q=>96+75*q*q,XA=124,XB=q=>156+225*q,XC=q=>156+112.5*q;
    [['#E6EDF5','가만히 놓는다'],[SA_PK,'7.5 m/s로 던진다'],[G,'15 m/s로 던진다']].forEach((l,i)=>{dot(c,48+i*150,38,6,l[0]);T(c,l[1],60+i*150,38,{size:13,color:C.muted});});
    T(c,'높이 20 m',22,68,{size:12.5,color:C.muted});poly(c,[[22,84],[112,84]],C.dim,1.5,{dash:[3,4]});poly(c,[[20,408],[650,408]],C.line,3);
    for(let k=0;k<=4&&k*.5<=tau+1e-6;k++){const q=k*.5,y=Y(q);poly(c,[[XA,y],[XB(q),y]],C.dim,1.2,{dash:[3,5]});
      dot(c,XA,y,10,null,{stroke:'#E6EDF5',lw:1.5,alpha:.5});dot(c,XC(q),y,10,null,{stroke:SA_PK,lw:1.5,alpha:.55});dot(c,XB(q),y,10,null,{stroke:G,lw:1.5,alpha:.55});
      if(k>0){poly(c,[[XB(q-.5)+3,72],[XB(q)-3,72]],G,2);poly(c,[[XB(q)-3,66],[XB(q)-3,78]],G,2);K(c,'7.5 m',(XB(q-.5)+XB(q))/2,60,{size:12.5,color:G});
        T(c,(2.5*k-1.25)+' m',104,(Y(q-.5)+y)/2,{size:12.5,color:C.u2,align:'right'});}}
    poly(c,[[XB(0)+3,66],[XB(0)+3,78]],G,2);
    const y=Y(tau),bx=XB(tau);dot(c,XA,y,10,'#E6EDF5',{glow:10});dot(c,XC(tau),y,10,SA_PK,{glow:10});dot(c,bx,y,10,G,{glow:14});
    if(tau>.02&&tau<1.98){arw(c,bx+12,y,bx+52,y,G,3,9);arw(c,bx,y+12,bx,y+12+tau*17,C.u2,3,9);}
    SA_g(c,seg(tau,1.9,2),()=>{K(c,'15 m',XC(2),428,{size:13,color:SA_PK,w:600});K(c,'30 m',XB(2),428,{size:13,color:G,w:600});
      K(c,'같은 시각에 높이가 같다 → 셋이 동시에 바닥에 닿는다',335,462,{size:15,w:700});K(c,'낙하 시간은 높이로만 정해진다 (2초) · 던진 속도 2배 → 수평 거리 2배',335,490,{size:13,color:C.muted});});
    T(c,'두 방향으로 나누어 본다',690,56,{size:15,w:700});
    [[G,'수평 방향','힘이 없다 → 등속 운동','속도 15 m/s · 거리 '+(15*tau).toFixed(1)+' m'],[C.u2,'연직 방향','중력 → 자유 낙하와 같다','속도 '+(10*tau).toFixed(0)+' m/s · 거리 '+(5*tau*tau).toFixed(1)+' m']].forEach((d,i)=>{const yy=78+i*112;
      rr(c,690,yy,240,98,12,ra(d[0],.08),d[0],2);T(c,d[1],706,yy+22,{size:15,w:700,color:d[0]});T(c,d[2],706,yy+48,{size:13.5});T(c,d[3],706,yy+76,{size:12.5,font:MONO,color:C.muted});});
    rr(c,690,302,240,74,12,ra(SA_PK,.08),SA_PK,2);T(c,'가속도',706,324,{size:15,w:700,color:SA_PK});T(c,'언제나 연직 아래, 크기 g',706,352,{size:13.5});arw(c,902,316,902,362,SA_PK,3,10);
    label(c,'t = '+tau.toFixed(1)+' 초',810,404,C.text,{size:16});
  }});

/* ───────── Ⅲ-6 지구 주위를 도는 운동 ───────── */
S.push({u:2,ch:'역학 시스템',title:'지구 주위를 도는 운동',file:'04-mechanics.html',
  sub:'높은 곳에서 수평으로 충분히 빠르게 던지면 물체가 떨어지는 만큼 지표면도 휘어 내려가, 땅에 닿지 않고 지구 둘레를 돕니다. 인공위성과 달이 이렇게 움직입니다.',
  fx:[{w:1,f:'자유 낙하 · 수평으로 던진 물체 · 원운동',n:'힘은 모두 중력, 지구 중심 방향'},{w:1,f:'원운동: 속력 일정 · 운동 방향은 계속 변함',n:'그래도 가속도 운동'},{w:1,f:'중력이 사라지면 → 접선 방향으로 곧게',n:'그 순간의 운동 방향'}],
  pts:['충분히 빠르게 던지면 물체가 떨어지는 만큼 지표면도 휘어 내려가서, <em>계속 떨어지지만 땅에 닿지 않고</em> 지구 둘레를 돕니다.','속력이 그대로여도 <em>운동 방향이 바뀌면 가속도 운동</em>입니다. 방향을 바꾸는 힘이 지구 중심을 향하는 중력입니다.','함정: ‘인공위성에는 중력이 작용하지 않는다’는 틀린 문장입니다. 중력이 계속 당기기 때문에 원을 그립니다.','세 운동의 차이는 처음에 <em>수평 방향 속도</em>가 있었는지, 그 속도가 얼마나 컸는지뿐입니다.'],
  dur:16,still:13.5,
  draw(c,t){
    const G=IC[0],ex=250,ey=335,R=118,Ro=150,pt=(r,f)=>[ex+r*Math.sin(f),ey-r*Math.cos(f)];
    dot(c,ex,ey,R,ra(C.u2,.14),{stroke:C.u2,lw:2.5});dot(c,ex,ey,3,C.u2);T(c,'지구',ex,ey+22,{size:15,align:'center',color:C.u2,w:600});
    poly(c,[[ex-12,ey-R+2],[ex,ey-Ro+8],[ex+12,ey-R+2]],C.u2,2,{fill:'#1D4257',close:true});
    [[.55,.8,2.6,'①'],[1.5,3,5.4,'②']].forEach(s=>{const k=seg(t,s[1],s[2]);if(k<=0)return;const P=[];for(let q=0;q<=40*k;q++){const f=s[0]*q/40;P.push(pt(Ro-(Ro-R)*Math.pow(q/40,2),f));}
      poly(c,P,ra('#E6EDF5',k<1?.9:.5),2,{dash:[5,5]});const e=P[P.length-1];dot(c,e[0],e[1],k<1?7:4,k<1?G:'#E6EDF5',{glow:k<1?12:0});
      if(k>=1){const q=pt(R-16,s[0]);T(c,s[3],q[0],q[1],{size:15,align:'center',color:C.text});}});
    const lg=[['① 느리게 던지면 가까이 떨어진다',.8],['② 더 빠르게 던지면 더 멀리 가서 떨어진다',3],['③ 충분히 빠르면 떨어지는 만큼 지표면도 휘어',5.8],['     땅에 닿지 않고 계속 돈다',5.8]];
    lg.forEach((l,i)=>SA_g(c,fin(t,l[1],.5),()=>T(c,l[0],36,48+i*22,{size:13.5,color:i>1?G:C.text})));
    if(t>5.8){const f=(t-5.8)*1.1,p=pt(Ro,f),tx=Math.cos(f),ty=Math.sin(f);arc(c,ex,ey,Ro,-Math.PI/2,-Math.PI/2+Math.min(f,TAU),ra(G,.55),2);
      arw(c,p[0],p[1],p[0]+(ex-p[0])/Ro*46,p[1]+(ey-p[1])/Ro*46,SA_PK,3,10);arw(c,p[0],p[1],p[0]+tx*50,p[1]+ty*50,G,3,10);dot(c,p[0],p[1],8,'#E6EDF5',{glow:12});
      const q3=pt(Ro+16,-.5);T(c,'③',q3[0],q3[1],{size:15,align:'center',color:G});}
    SA_g(c,fin(t,6.4,.6),()=>{arw(c,60,512,92,512,G,3,9);T(c,'속도: 접선 방향',100,512,{size:13,color:C.muted});arw(c,236,512,268,512,SA_PK,3,9);T(c,'중력: 지구 중심 방향',276,512,{size:13,color:C.muted});});
    SA_g(c,fin(t,11.5,.7),()=>{const p=pt(Ro,4),ux=Math.cos(4),uy=Math.sin(4);dot(c,p[0],p[1],4,C.muted);poly(c,[p,[p[0]+ux*76,p[1]+uy*76]],C.muted,2,{dash:[5,4]});arw(c,p[0]+ux*76,p[1]+uy*76,p[0]+ux*96,p[1]+uy*96,C.muted,2,9);T(c,'중력이 없다면',126,p[1]+22,{size:12.5,color:C.muted,align:'right'});});
    T(c,'세 운동 모두 — 힘은 중력, 방향은 지구 중심',520,50,{size:15,w:700,color:SA_PK});
    T(c,'운동',536,84,{size:12.5,color:C.dim});K(c,'속력',730,84,{size:12.5,color:C.dim});K(c,'운동 방향',856,84,{size:12.5,color:C.dim});
    [['자유 낙하','커진다','변하지 않는다',-1],['수평으로 던진 물체','커진다','계속 변한다',t>.8&&t<5.8],['지구 주위의 원운동','일정하다','계속 변한다',t>=5.8]].forEach((r,i)=>SA_g(c,fin(t,.2+i*.25,.5),()=>{const y=100+i*56,on=r[3]===true;
      rr(c,520,y,410,48,10,on?ra(G,.13):SA_INK,on?G:C.line,on?2.4:1.4);T(c,r[0],536,y+24,{size:14.5,w:700});K(c,r[1],730,y+24,{size:14,color:r[1]==='일정하다'?C.u2:C.text,w:r[1]==='일정하다'?700:500});K(c,r[2],856,y+24,{size:14,color:i?G:C.text});}));
    SA_g(c,fin(t,7.6,.6),()=>T(c,'속력이 일정해도 방향이 바뀌면 가속도 운동',520,298,{size:15,w:700}));
    SA_g(c,fin(t,9.4,.6),()=>{crs(c,530,346,6,SA_PK);T(c,'“인공위성에는 중력이 작용하지 않는다”',548,346,{size:14,color:SA_PK});T(c,'→ 중력이 지구 중심 쪽으로 계속 당기므로',548,374,{size:13.5});T(c,'    직선으로 날아가 버리지 않고 원을 그린다',548,396,{size:13.5});});
    SA_g(c,fin(t,11.5,.6),()=>T(c,'중력이 갑자기 사라진다면 → 그 순간의 접선 방향으로 곧게',520,444,{size:13.5,color:C.muted}));
  }});

/* ───────── Ⅲ-7 운동량과 충격량 ───────── */
S.push({u:2,ch:'역학 시스템',title:'충격량과 충돌 시간',file:'04-mechanics.html',
  sub:'멈출 때 운동량의 변화량이 같으면 받는 충격량도 같습니다. 충돌 시간을 늘리면 같은 충격량에서 힘이 작아집니다.',
  fx:[{f:'p = mv',n:'운동량'},{f:'I = FΔt',n:'충격량 = 운동량의 변화량'},{w:1,f:'충격량이 같을 때: 충돌 시간 ↑ → 평균 힘 ↓',n:'에어백 · 범퍼 · 매트'},{w:1,f:'힘–시간 그래프 아래의 넓이 = 충격량',n:'가로 폭은 충돌 시간'}],
  pts:['멈출 때 <em>운동량의 변화량</em>은 이미 정해져 있어서 받는 충격량도 정해져 있습니다. 줄일 수 있는 것은 힘뿐이고, 방법은 <em>충돌 시간을 늘리는 것</em>입니다.','60 kg인 탑승자가 20 m/s에서 멈추면 변화량은 1200 kg·m/s입니다. 0.05초 만에 멈추면 평균 힘 24000 N, 에어백으로 0.4초에 걸쳐 멈추면 3000 N입니다.','함정: 에어백은 <em>충격량을 줄이는 것이 아닙니다.</em> 충격량은 같고 힘만 작아집니다.','운동량과 충격량에는 <em>방향</em>이 있습니다. 벽에 부딪혀 튀어나오면 처음과 나중 운동량에 부호를 붙여 뺍니다.'],
  dur:15,still:7.5,
  draw(c,t){
    const G=IC[0],p=t%9,v=110,L=[[128,.3,SA_HOT,'단단한 벽','0.05초 만에 멈춘다','평균 힘 = 1200 ÷ 0.05 = 24000 N'],[268,2.4,SA_GR,'에어백','0.4초에 걸쳐 멈춘다','평균 힘 = 1200 ÷ 0.4 = 3000 N']];
    T(c,'질량 60 kg · 속도 20 m/s → 운동량 60 × 20 = 1200 kg·m/s',40,46,{size:14});
    L.forEach((l,i)=>{const y=l[0],D=l[1],u=clamp((p-2)/D),d=v*D*(u-u*u/2),xr=p<2?300-v*(2-p):300+(i?d:0),w=i?50:50-d,hit=p>=2&&u<1;
      T(c,l[3],40,y-44,{size:15,w:700,color:l[2]});T(c,l[4],48+kw(c,l[3],15,700),y-43,{size:13,color:C.muted});poly(c,[[30,y+24],[480,y+24]],C.line,2);
      if(i){box(c,xr,y-30,448-xr,54,Math.min(22,(448-xr)/2),ra(SA_GR,.22),SA_GR,2);box(c,448,y-40,14,64,2,'#5E738B');}else box(c,300,y-40,14,64,2,'#5E738B');
      box(c,xr-w,y-22,w,44,6,ra(G,.85),G,2);
      if(p<2)arw(c,xr+6,y,xr+46,y,C.text,3,9);
      if(hit){const fl=i?16:92;arw(c,xr-w/2+fl/2,y-34,xr-w/2-fl/2,y-34,l[2],i?3:5,i?8:12);}
      SA_g(c,fin(p,2+D,.5),()=>T(c,l[5],40,y+46,{size:14,w:700,color:l[2]}));});
    SA_g(c,fin(p,4.8,.5),()=>rr(c,40,350,440,146,14,'rgba(255,255,255,.03)',C.line,1.4));
    [['멈출 때 운동량의 변화량: 둘 다 1200 kg·m/s',376,14.5,C.text,500],['→ 받는 충격량(F × Δt)도 같다',406,14.5,C.text,500],['충돌 시간 8배 → 평균 힘 1/8',442,18,G,700],['줄어드는 것은 충격량이 아니라 힘이다',472,13,C.muted,500]].forEach((r,i)=>SA_g(c,fin(p,4.8+i*.5,.5),()=>T(c,r[0],60,r[1],{size:r[2],color:r[3],w:r[4]})));
    const x0=560,y0=450;axes(c,x0,y0,350,330,'','힘');
    [[575,'0'],[617,'0.05초'],[895,'0.4초']].forEach(k=>{poly(c,[[k[0]===617?615:k[0],y0],[k[0]===617?615:k[0],y0+5]],C.dim,1.5);label(c,k[1],k[0],y0+17,C.muted,{size:12});});
    [[40,300,.3,SA_HOT],[320,37.5,2.4,SA_GR]].forEach(b=>{const u=clamp((p-2)/b[2]);if(u<=0)return;const P=[[575,y0]];for(let q=0;q<=u+1e-6;q+=.02)P.push([575+b[0]*q,y0-b[1]*Math.pow(Math.sin(Math.PI*q),2)]);P.push([575+b[0]*u,y0]);
      poly(c,P,b[3],2.5,{fill:ra(b[3],.3)});});
    SA_g(c,fin(p,2.4,.5),()=>{T(c,'단단한 벽',628,170,{size:14,w:700,color:SA_HOT});T(c,'폭 0.05초 · 힘이 크다',628,194,{size:13,color:C.muted});T(c,'넓이 1200 N·s',628,216,{size:13,color:C.muted});});
    SA_g(c,fin(p,4.5,.5),()=>{K(c,'에어백 — 폭 0.4초 · 힘이 작다',760,368,{size:14,w:700,color:SA_GR});K(c,'넓이는 똑같이 1200 N·s',760,392,{size:13,color:C.muted});});
    SA_g(c,fin(p,5.4,.6),()=>K(c,'넓이(충격량)는 같고, 폭과 높이만 다르다',745,92,{size:15,w:700}));
  }});

/* ───────── Ⅲ-8 세포막과 확산 ───────── */
function SA_hex(c,x,y,r,col){const P=[];for(let k=0;k<6;k++)P.push([x+Math.cos(k*TAU/6)*r,y+Math.sin(k*TAU/6)*r]);poly(c,P,col,1.5,{fill:ra(col,.45),close:true});}
function SA_ion(c,x,y,col){dot(c,x,y,8,ra(col,.3),{stroke:col,lw:1.5});poly(c,[[x-4,y],[x+4,y]],col,2);poly(c,[[x,y-4],[x,y+4]],col,2);}
S.push({u:2,ch:'생명 시스템',title:'세포막을 지나는 두 가지 길',file:'05-life-system.html',
  sub:'세포막은 인지질 2중층에 막단백질이 박힌 구조입니다. 물질의 크기와 성질에 따라 지나는 길이 다르고, 확산은 농도가 높은 쪽에서 낮은 쪽으로 일어납니다.',
  fx:[{w:1,f:'세포막 = 인지질 2중층 + 막단백질',n:'선택적 투과성'},{w:1,f:'산소 · 이산화 탄소: 2중층을 직접 통과',n:'작고 전하를 띠지 않음'},{w:1,f:'포도당 · 아미노산 · 이온: 막단백질로 통과',n:'크거나 전하를 띰'},{w:1,f:'확산: 농도 높은 쪽 → 낮은 쪽',n:'세포가 에너지를 쓰지 않음'}],
  pts:['인지질의 머리는 물과 잘 섞이고 꼬리는 섞이지 않습니다. 세포 안팎이 모두 물이라서 꼬리끼리 마주 보는 <em>2중층</em>이 저절로 됩니다.','작고 전하가 없는 산소·이산화 탄소는 2중층을 직접 지나고, 크거나 전하를 띤 포도당·이온은 <em>막단백질</em>로만 지납니다.','함정: 폐포에서 산소와 이산화 탄소는 방향이 반대지만 규칙은 같습니다. <em>각 물질이 자기 농도가 높은 쪽에서 낮은 쪽으로</em> 갑니다.','확산은 분자가 스스로 움직인 결과라서 세포가 에너지를 쓰지 않습니다.'],
  dur:15,still:12.5,
  draw(c,t){
    const PU=IC[1],PX=[610,800],GL='#FFD54F',CO='#C9D4E0';
    T(c,'세포 밖',28,150,{size:15,w:700,color:C.muted});T(c,'세포 안',28,400,{size:15,w:700,color:C.muted});T(c,'머리: 친수성',28,236,{size:12.5,color:C.muted});T(c,'꼬리: 소수성',28,275,{size:12.5,color:C.muted});
    poly(c,[[112,236],[146,236]],C.dim,1.2);poly(c,[[112,275],[146,275]],C.dim,1.2);
    SA_g(c,fin(t,.2,.8),()=>{for(let x=158;x<=926;x+=17){if(PX.some(p=>Math.abs(x-p)<40))continue;
        [[236,1],[314,-1]].forEach(h=>{poly(c,[[x-2.5,h[0]+h[1]*6],[x-2.5,h[0]+h[1]*33]],'#6C86A3',1.6);poly(c,[[x+2.5,h[0]+h[1]*6],[x+2.5,h[0]+h[1]*33]],'#6C86A3',1.6);dot(c,x,h[0],6.5,'#3F6C99',{stroke:'#8FB4DB',lw:1.3});});}
      PX.forEach(p=>{rr(c,p-32,222,64,106,14,ra(PU,.3),PU,2);box(c,p-8,222,16,106,0,'#0B1420');});});
    const col=(cx,nm,hue,down,a0,shape,ch)=>SA_g(c,fin(t,a0,.7),()=>{K(c,nm,cx,54,{size:15,w:700,color:hue});
      K(c,'농도가 '+(down?'높다':'낮다'),cx,84,{size:12.5,color:C.muted});K(c,'농도가 '+(down?'낮다':'높다'),cx,446,{size:12.5,color:C.muted});
      const many=(n,y0,y1,sd)=>{for(let k=0;k<n;k++)shape(cx-50+rnd(k*3.1+sd)*100+Math.sin(t*1.3+k)*3,y0+rnd(k*5.7+sd+9)*(y1-y0)+Math.cos(t*1.1+k*2)*3);};
      many(down?8:2,106,196,cx);many(down?2:8,352,424,cx+50);
      for(let k=0;k<3;k++){const u=(t*.26+k/3)%1,v=down?u:1-u,x=ch?cx:cx-34+k*34+Math.sin(u*7+k)*5;if(ch&&k===2)continue;shape(x,lerp(196,356,v));}
      const ax=cx+(ch?-58:66);if(ch){const yb=down?188+24*Math.abs(Math.sin(t*1.6)):362-24*Math.abs(Math.sin(t*1.6));shape(ax,yb);crs(c,ax,down?244:306,5,SA_PK,clamp(Math.abs(Math.sin(t*1.6))*1.6-.7));}
      else arw(c,ax,down?204:346,ax,down?346:204,ra(hue,.75),3.5,11);});
    col(250,'O₂ 산소',SA_BL,1,1.2,(x,y)=>dot(c,x,y,5.5,SA_BL),0);
    col(420,'CO₂ 이산화 탄소',CO,0,3.6,(x,y)=>dot(c,x,y,5.5,CO),0);
    col(610,'포도당',GL,1,6,(x,y)=>SA_hex(c,x,y,8,GL),1);
    col(800,'이온',SA_HOT,1,8.4,(x,y)=>SA_ion(c,x,y,SA_HOT),1);
    SA_g(c,fin(t,4.4,.6),()=>K(c,'작고 전하가 없다 → 인지질 2중층을 직접 통과',335,480,{size:14,color:SA_BL,w:600}));
    SA_g(c,fin(t,9.4,.6),()=>K(c,'크거나 전하를 띤다 → 막단백질로만 통과',705,480,{size:14,color:PU,w:600}));
    SA_g(c,fin(t,10.6,.6),()=>K(c,'확산: 농도가 높은 쪽 → 낮은 쪽 · 세포는 에너지를 쓰지 않는다',480,512,{size:15,w:700}));
  }});

/* ───────── Ⅲ-9 삼투 ───────── */
S.push({u:2,ch:'생명 시스템',title:'삼투: 움직이는 것은 물',file:'05-life-system.html',
  sub:'물은 잘 통과시키고 용질은 잘 통과시키지 않는 막을 사이에 두면, 물이 농도가 낮은 용액 쪽에서 높은 용액 쪽으로 이동합니다.',
  fx:[{w:1,f:'삼투: 물이 농도 낮은 용액 → 높은 용액 쪽으로',n:'용질은 막을 잘 지나지 못함'},{w:1,f:'밖이 더 묽다: 물이 들어온다 → 부푼다',n:'식물 세포는 세포벽이 있어 터지지 않음'},{w:1,f:'밖이 더 진하다: 물이 나간다 → 쭈그러든다',n:'식물 세포는 세포막이 세포벽에서 떨어짐'}],
  pts:['용질이 막을 지나지 못하니 <em>물이 움직여</em> 농도 차를 줄입니다. 물 분자 쪽에서 보면 물이 많은 쪽에서 적은 쪽으로 퍼지는 확산입니다.','함정: 이동하는 것은 물입니다. <em>‘소금이 세포 안으로 들어가서’</em>라고 설명하면 틀립니다. 배추가 절여지는 것도 물이 빠져나가서입니다.','함정: 농도가 같을 때 물의 이동이 멈춘 것이 아닙니다. <em>드나드는 양이 같아</em> 겉으로 변화가 없을 뿐입니다.','표에서 질량이 늘었으면 물이 들어온 것이고 바깥 용액이 더 묽습니다. 변화가 0인 용액의 농도가 세포 안과 같습니다.'],
  dur:14,still:8,
  draw(c,t){
    const k=ease(seg(t,1.2,5)),WA='#7EC8FF',SO='#FFB74D',CX=[190,480,770],ka=seg(k,.55,1);
    const HD=[['세포 밖 농도 < 세포 안','물: 밖 → 안'],['세포 밖 농도 = 세포 안','물: 드나드는 양이 같다'],['세포 밖 농도 > 세포 안','물: 안 → 밖']],C1=['부푼다 (심하면 터진다)','변화 없다','쭈그러든다'],C2=['팽팽해진다 · 세포벽이 있어 터지지 않는다','변화 없다','세포막이 세포벽에서 떨어진다'];
    T(c,'동물 세포 (적혈구)',24,116,{size:13,color:C.muted});T(c,'식물 세포',24,296,{size:13,color:C.muted});
    const wat=(x,y,dx,dy,r0,r1,dir,ph)=>{const u=(t*.55+ph)%1,v=dir>0?u:1-u,a=lerp(r0,r1,v),b=a+(dir>0?-13:13);arw(c,x+dx*a,y+dy*a,x+dx*b,y+dy*b,WA,2.2,7,Math.sin(u*Math.PI));};
    CX.forEach((cx,i)=>{const dir=i===0?1:i===2?-1:0,n=[3,9,18][i];
      rr(c,cx-130,38,260,58,12,'rgba(255,255,255,.03)',C.line,1.4);K(c,HD[i][0],cx,57,{size:15,w:700});K(c,HD[i][1],cx,80,{size:13.5,color:WA});
      const R=i===0?lerp(40,57,k):i===2?lerp(40,27,k):40,cy=192;let m=0;
      for(let q=0;q<60&&m<n;q++){const x=cx-122+rnd(q*2.3+i*17)*244,y=132+rnd(q*4.1+i*29+5)*128;if(Math.hypot(x-cx,y-cy)<72)continue;dot(c,x,y,3.2,SO);m++;}
      const O=[];for(let q=0;q<=48;q++){const a=q/48*TAU,r=R*(1+(i===2?.13*k*Math.sin(a*9):0));O.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}
      poly(c,O,SA_PK,2.5,{fill:ra(SA_PK,.28),close:true});dot(c,cx,cy,R*.42,null,{stroke:ra(SA_PK,.5),lw:1.5});
      for(let q=0;q<5;q++){const a=q/5*TAU+.4;dot(c,cx+Math.cos(a)*R*.66,cy+Math.sin(a)*R*.66,3.2,SO);}
      for(let q=0;q<6;q++){const a=q/6*TAU+.5,d=dir||(q%2?1:-1);wat(cx,cy,Math.cos(a),Math.sin(a),R+30,R-6,d,q/6);}
      SA_g(c,i===1?1:ka,()=>K(c,C1[i],cx,272,{size:14,w:700,color:i===1?C.muted:C.text}));
      const py=372;m=0;for(let q=0;q<70&&m<n;q++){const x=cx-122+rnd(q*3.7+i*13+40)*244,y=310+rnd(q*1.9+i*31+60)*122;if(Math.abs(x-cx)<92&&Math.abs(y-py)<62)continue;dot(c,x,y,3.2,SO);m++;}
      rr(c,cx-76,py-48,152,96,8,'#0B1622',SA_GR,4);const ins=i===0?lerp(8,5,k):i===2?lerp(8,24,k):8,rad=i===2?lerp(6,22,k):6;
      rr(c,cx-76+ins,py-48+ins,152-2*ins,96-2*ins,rad,ra(SA_GR,.25),'#B7F0BA',1.8);c.save();c.fillStyle=ra(WA,.3);c.beginPath();c.ellipse(cx,py,(76-ins)*.62,(48-ins)*.6,0,0,TAU);c.fill();c.restore();
      for(let q=0;q<4;q++){const a=q/4*TAU,d=dir||(q%2?1:-1),hx=Math.abs(Math.cos(a))>.5;wat(cx,py,Math.cos(a),Math.sin(a),(hx?76:48)+26,(hx?76:48)-10,d,q/4);}
      SA_g(c,i===1?1:ka,()=>K(c,C2[i],cx,444,{size:13,w:600,color:i===1?C.muted:C.text}));});
    dot(c,32,484,3.5,SO);T(c,'용질',44,484,{size:12.5,color:C.muted});arw(c,26,506,40,506,WA,2.2,7);T(c,'물',46,506,{size:12.5,color:C.muted});
    SA_g(c,fin(t,5.4,.6),()=>{K(c,'이동하는 것은 물 — 용질(소금)은 막을 잘 지나지 못한다',480,484,{size:15,w:700});K(c,'농도가 같을 때도 물은 드나든다. 드나드는 양이 같을 뿐이다',480,510,{size:13,color:C.muted});});
  }});

/* ───────── Ⅲ-10 효소 ───────── */
S.push({u:2,ch:'생명 시스템',title:'효소와 활성화 에너지',file:'05-life-system.html',
  sub:'효소는 반응물이 넘어야 하는 에너지 턱(활성화 에너지)을 낮춰 반응을 빠르게 합니다. 기질과 결합해 생성물을 내놓은 뒤 변하지 않고 다시 쓰입니다.',
  fx:[{w:1,f:'효소 + 기질 → 효소·기질 복합체 → 효소 + 생성물',n:'효소는 다시 쓰인다'},{w:1,f:'효소는 활성화 에너지를 낮춘다',n:'반응물 · 생성물의 에너지는 그대로'},{w:1,f:'2H₂O₂ → 2H₂O + O₂',n:'카탈레이스 (간 · 감자)'}],
  pts:['활성화 에너지(넘어야 하는 에너지 턱)가 낮아지면 같은 온도에서 턱을 넘는 분자가 많아져 <em>반응이 빨라집니다.</em>','효소는 봉우리만 낮춥니다. <em>반응물과 생성물의 에너지</em>, 드나드는 에너지의 양은 효소가 있든 없든 같습니다.','함정: 효소는 반응 전후에 변하지 않고 <em>다시 쓰입니다.</em> 기포가 멈춘 것은 효소가 아니라 기질이 다 쓰였기 때문입니다.','활성 부위와 구조가 맞는 기질만 결합합니다(<em>기질 특이성</em>). 삶은 간은 단백질의 입체 구조가 변해 기능을 잃습니다.'],
  dur:16,still:12.9,
  draw(c,t){
    const PU=IC[1],yR=290,yP=370,E=(x,Hh)=>{const u=clamp((x-170)/200);return lerp(yR,yP,ease(u))-Hh*Math.pow(Math.sin(Math.PI*u),1.5);};
    axes(c,70,420,410,340,'반응의 진행','에너지');T(c,'화살표 = 활성화 에너지 (반응물에서 봉우리 꼭대기까지)',96,56,{size:13,color:C.muted});
    [[195,SA_PK,.5,104,'효소가 없을 때'],[105,SA_GR,3.4,152,'효소가 있을 때']].forEach((cv,i)=>{const k=seg(t,cv[2],cv[2]+2);if(k<=0)return;const P=[];let bx=170,by=yR;
      for(let x=90;x<=450;x+=3){const y=E(x,cv[0]);if(y<by){by=y;bx=x;}if(x<=90+360*k)P.push([x,y]);}poly(c,P,cv[1],3);
      SA_g(c,fin(t,cv[2]+1.6,.5),()=>{poly(c,[[cv[3],by],[bx,by]],ra(cv[1],.7),1.3,{dash:[4,4]});arw(c,cv[3],yR,cv[3],by+2,cv[1],2.5,9);arw(c,cv[3],by+14,cv[3],yR,cv[1],2.5,9);T(c,cv[4],i?112:70,by-13,{size:12.5,color:cv[1],w:600});});
      if(k>=1)for(let q=0;q<4;q++){const ph=(t*.2+q/4+i*.11)%1,over=i===1||q===0,x=over?100+340*ph:100+128*Math.sin(Math.PI*ph);dot(c,x,E(x,cv[0])-8,5,cv[1],{glow:6,alpha:over?Math.min(1,(1-ph)*6):1});}});
    poly(c,[[372,yR],[452,yR]],C.dim,1.2,{dash:[4,4]});K(c,'반응물',128,308,{size:13,color:C.muted});K(c,'생성물',412,390,{size:13,color:C.muted});
    arw(c,444,yR+2,444,yP-2,SA_HOT,2.5,9);T(c,'에너지 방출',436,332,{size:12.5,color:SA_HOT,align:'right'});
    SA_g(c,fin(t,6,.6),()=>{K(c,'효소는 봉우리(활성화 에너지)만 낮춘다',275,464,{size:15,w:700,color:SA_GR});K(c,'반응물 · 생성물의 높이와 드나드는 에너지는 그대로',275,490,{size:13.5,color:C.muted});});
    const ex=700,ey=205,R=58,q=t<1?-1:(t-1)%5,ap=ease(seg(q,0,1.4)),cmp=q>=1.4&&q<2.4,out=ease(seg(q,2.4,3.8)),step=q<0?0:q<1.4?1:q<2.4?2:3;
    K(c,'효소 + 기질 → 효소·기질 복합체 → 효소 + 생성물',725,50,{size:14.5,w:700});
    c.save();c.beginPath();c.arc(ex,ey,R,-Math.PI/2+.44,-Math.PI/2-.44+TAU);c.lineTo(ex,ey-R+30);c.closePath();c.fillStyle=ra(PU,cmp?.5:.3);c.fill();c.strokeStyle=PU;c.lineWidth=2.5;if(cmp){c.shadowColor=PU;c.shadowBlur=18;}c.stroke();c.restore();
    T(c,'효소',ex,ey+14,{size:16,w:700,align:'center'});T(c,'활성 부위',640,128,{size:12.5,color:C.muted,align:'right'});poly(c,[[644,130],[684,152]],C.dim,1.2);
    const dia=(x,y,a,gap)=>{if(a<=.02)return;const D=[[0,-26],[24.6,-2],[0,26],[-24.6,-2]];c.save();c.globalAlpha*=a;
      [[-1,[D[0],D[3],D[2]]],[1,[D[0],D[1],D[2]]]].forEach(h=>poly(c,h[1].map(d=>[x+d[0]+h[0]*gap,y+d[1]-Math.abs(h[0])*gap*.5*(h[0]>0?1:2)]),GLD,2,{fill:ra(GLD,.5),close:true}));c.restore();};
    const GLD=IC[0],sx=lerp(590,ex,ap),sy=lerp(88,ey-R+4,ap);
    if(q>=0&&q<2.4){dia(sx,sy,1,0);if(q<1.4)K(c,'기질',sx,sy-40,{size:13,color:GLD,w:600});}
    if(q>=2.4&&q<3.8){dia(lerp(ex,790,out),lerp(ey-R+4,96,out),1-seg(q,3.4,3.8),2+26*out);K(c,'생성물',848,62+34,{size:13,color:GLD,w:600,alpha:1-seg(q,3.4,3.8)});}
    if(cmp)K(c,'효소·기질 복합체',ex,ey+R+22,{size:13.5,color:PU,w:700});
    const wz=Math.abs(Math.sin(t*.9)),wx=lerp(560,618,wz);box(c,wx-12,ey-12,24,24,3,ra(C.neu,.4),C.neu,1.8);crs(c,632,ey-26,5,SA_PK,clamp(wz*3-2));T(c,'구조가 맞지 않는 물질',534,ey+34,{size:12.5,color:C.muted});
    if(q>=0)K(c,'반응 '+(Math.floor((t-1)/5)+1)+'회째 — 효소는 변하지 않는다',ex,306,{size:13.5,color:C.text});
    [['① 기질이 활성 부위에 결합한다',1],['② 효소·기질 복합체가 된다',2],['③ 생성물을 내놓고, 효소는 새 기질과 다시 결합한다',3]].forEach((l,i)=>T(c,l[0],540,346+i*28,{size:13.5,color:step===l[1]?PU:C.muted,w:step===l[1]?700:500}));
    T(c,'기질 특이성: 활성 부위와 구조가 맞는 기질만 결합한다',540,440,{size:13.5,color:SA_PK});T(c,'카탈레이스: 2H₂O₂ → 2H₂O + O₂',540,468,{size:13,color:C.muted});
  }});

/* ───────── Ⅲ-11 유전자에서 단백질까지 ───────── */
const SA_BC={A:'#7BE07F',T:'#FF7A8A',U:'#FF9A4D',G:'#F4B544',C:'#6EA8FF'},SA_PAIR={A:'U',T:'A',G:'C',C:'G'};
function SA_base(c,x,y,ch,on){rr(c,x,y,40,36,7,ra(SA_BC[ch],on?.45:.2),SA_BC[ch],on?2.6:1.5);T(c,ch,x+20,y+19,{size:17,font:MONO,w:700,align:'center'});}
S.push({u:2,ch:'생명 시스템',title:'유전자에서 단백질까지',file:'05-life-system.html',
  sub:'DNA의 유전 정보는 핵에서 RNA로 옮겨지고(전사), 세포질의 리보솜에서 RNA의 염기 3개마다 아미노산 하나가 이어져 단백질이 됩니다(번역).',
  fx:[{w:1,f:'DNA —전사→ RNA —번역→ 단백질',n:'생명 중심 원리'},{w:1,f:'전사: 핵 · 번역: 세포질의 리보솜',n:'원본 DNA는 핵 안에 둔다'},{w:1,f:'RNA 염기 3개 = 코돈 1개 → 아미노산 1개',n:'4 × 4 × 4 = 64가지'},{w:1,f:'본 가닥 A · T · G · C → RNA U · A · C · G',n:'RNA에는 T 대신 U'}],
  pts:['유전자의 정보로 단백질이 만들어지고 그 단백질이 작용해 <em>형질</em>이 나타납니다. 염기 서열 → 아미노산 서열 → 단백질의 구조와 기능 → 형질.','염기는 4종류, 아미노산은 20종류입니다. 2개씩이면 16가지라 모자라고 <em>3개씩이면 64가지</em>라 충분합니다.','함정: 전사는 <em>핵</em>에서, 번역은 <em>세포질의 리보솜</em>에서 일어납니다. ‘번역이 핵에서 일어난다’는 틀린 보기입니다.','가닥에 <em>U가 보이면 RNA</em>입니다. 아미노산 수 = 코돈 수 = RNA 염기 수 ÷ 3.'],
  dur:16,still:14.5,
  draw(c,t){
    const PU=IC[1],U=C.u2,D='TACGGACTT',bx=i=>84+i*44+Math.floor(i/3)*12,m=ease(seg(t,6.2,7.8)),rx=170*m,ry=196+196*m,cur=t<1.2||t>5.9?-1:Math.min(8,Math.floor((t-1.2)/.5));
    rr(c,40,60,490,202,22,ra(PU,.07),ra(PU,.7),2);T(c,'핵 — 전사 (DNA → RNA)',58,81,{size:15,w:700,color:PU});T(c,'본 가닥',84,103,{size:12.5,color:C.muted});T(c,'DNA',74,132,{size:13,color:C.muted,align:'right',font:MONO});
    for(let i=0;i<9;i++){SA_base(c,bx(i),114,D[i],i===cur);const a=fin(t,1.2+i*.5,.35);if(a<=0)continue;
      poly(c,[[bx(i)+20,150],[bx(i)+20,196]],ra(SA_BC[SA_PAIR[D[i]]],.8),1.5,{dash:[3,3],alpha:a*(1-m)});SA_g(c,a,()=>SA_base(c,bx(i)+rx,ry,SA_PAIR[D[i]],i===cur));}
    SA_g(c,fin(t,1.2,.4),()=>T(c,'RNA',74+rx,ry+18,{size:13,color:C.muted,align:'right',font:MONO}));
    SA_g(c,m,()=>T(c,'원본 DNA는 핵 안에 남는다 — 필요한 유전자만 RNA로 복사해 내보낸다',84,206,{size:12.5,color:C.muted}));
    SA_g(c,Math.min(m*3,1),()=>{arw(c,96,268,96,372,ra(U,.8),2.5,10);T(c,'RNA가 핵 밖으로 나온다',110,284,{size:12.5,color:C.muted});});
    T(c,'세포질의 리보솜 — 번역',40,400,{size:15,w:700,color:U,alpha:.4+.6*fin(t,7.6,.6)});T(c,'(RNA → 단백질)',40,424,{size:13,color:C.muted,alpha:.4+.6*fin(t,7.6,.6)});
    if(t<=7.9)rr(c,bx(1)+190-76,346,152,94,28,ra(U,.04),ra(U,.35),1.5);
    if(t>7.9){const cxj=j=>bx(3*j+1)+190,jf=clamp((t-8.4)/1.4,0,2),j0=Math.floor(jf),rxx=lerp(cxj(j0),cxj(Math.min(2,j0+1)),ease(clamp((jf-j0)*2.2-1.2)));
      SA_g(c,fin(t,7.9,.5),()=>{rr(c,rxx-76,346,152,94,28,ra(U,.1),U,2);T(c,'리보솜',rxx,368,{size:12.5,align:'center',color:U});
        for(let j=0;j<3;j++){poly(c,[[cxj(j)-64,436],[cxj(j)+64,436]],ra(U,.6),2);K(c,'코돈 '+(j+1),cxj(j),454,{size:12.5,color:U});}});
      for(let j=0;j<3;j++){const a=fin(t,8.9+j*1.4,.5);if(a<=0)continue;if(j>0)poly(c,[[cxj(j-1)+17,318],[cxj(j)-17,318]],ra(SA_GR,a),3);
        SA_g(c,a,()=>{dot(c,cxj(j),318,17,ra(SA_GR,.3),{stroke:SA_GR,lw:2});T(c,'①②③'[j],cxj(j),319,{size:15,align:'center',w:700});});}
      SA_g(c,fin(t,8.9,.5),()=>T(c,'아미노산',cxj(0)-28,318,{size:12.5,color:SA_GR,align:'right'}));
      SA_g(c,fin(t,12.4,.6),()=>T(c,'→ 이어져 단백질이 된다',cxj(2)+28,318,{size:13,color:SA_GR}));}
    rr(c,560,60,370,128,14,'rgba(255,255,255,.03)',C.line,1.4);T(c,'전사: 짝이 되는 염기로 옮겨 쓴다',578,82,{size:14,w:700});T(c,'본 가닥',578,118,{size:12.5,color:C.muted});T(c,'RNA',578,164,{size:12.5,color:C.muted});
    'ATGC'.split('').forEach((b,i)=>{const x=672+i*62,on=cur>=0&&D[cur]===b;c.save();c.translate(x,100);c.scale(.8,.8);SA_base(c,0,0,b,on);c.restore();arw(c,x+16,131,x+16,146,on?C.text:C.dim,2,7);
      c.save();c.translate(x,148);c.scale(.8,.8);SA_base(c,0,0,SA_PAIR[b],on);c.restore();});
    rr(c,560,200,370,96,14,'rgba(255,255,255,.03)',C.line,1.4);T(c,'번역: 염기 3개(코돈) → 아미노산 1개',578,222,{size:14,w:700});T(c,'1개씩 4가지 · 2개씩 16가지 · 3개씩 64가지',578,248,{size:13});T(c,'아미노산 20종류를 가리키려면 3개가 필요하다',578,273,{size:13,color:C.muted});
    SA_g(c,fin(t,13,.7),()=>K(c,'염기 9개 → 코돈 3개 → 아미노산 3개  ·  염기 서열이 바뀌면 아미노산 → 단백질 → 형질이 달라질 수 있다',480,504,{size:13.5,color:C.text}));
  }});
