/* 수학 모션 노트 장면들 — build-motion.mjs 가 물리학Ⅰ 모션 노트의 플레이어 엔진 뒤에 붙인다.
   전제: W, H, TAU, C, UNITS, S, clamp, lerp, ease, seg, rnd, T, arrow, poly, dot, box, label, M 이 이미 정의되어 있다.
   사실·예시는 content/math-1·2·3.mjs 와 quick-math.mjs(⚡ 짧게 보기·🧠 외우기)에서 가져왔다. */
const VIO='#B69CFF',GRN='#7BE07F',PINK='#FF7A8A';

/* 패널 수식: 엔진의 fm은 sin만 바로 세우므로 이 노트에서는 cos·tan·log·ln·lim도 세운다(같은 이름의 선언이 엔진 것을 덮는다). */
function fm(s){
  return s.split('`').map((p,i)=>i%2?`<span class="u">${p}</span>`:
    p.replace(/(sin|cos|tan|log|ln|lim|max|min)|([A-Za-zθλαβ]+)|_\{([^}]*)\}|_(\S)|\^\{([^}]*)\}|\^(\S)/g,(m,up,w,b1,b2,p1,p2)=>{
      if(up)return up;
      if(w)return `<i>${w}</i>`;
      if(b1!=null||b2!=null)return `<sub>${fm(b1??b2)}</sub>`;
      return `<sup>${fm(p1??p2)}</sup>`;
    })).join('');
}

/* 캔버스 수식: 로마자 한 글자·α β θ는 기울이고, 숫자·기호·log·sin·lim 같은 이름은 세운다. 한글은 고딕.
   _x / _{..} 아래첨자, ^x / ^{..} 위첨자, 아래첨자 바로 뒤의 위첨자는 같은 자리에 겹쳐 쌓는다(∫_0^1, Σ_{k=1}^n). */
function F(c,s,x,y,o={}){
  const size=o.size||20,parts=[];let i=0;
  while(i<s.length){const ch=s[i];
    if((ch==='_'||ch==='^')&&i+1<s.length){let t;if(s[i+1]==='{'){const j=s.indexOf('}',i);t=s.slice(i+2,j);i=j+1}else{t=s[i+1];i+=2}parts.push({t,k:ch});}
    else{let j=i;while(j<s.length&&s[j]!=='_'&&s[j]!=='^')j++;parts.push({t:s.slice(i,j),k:''});i=j;}}
  const fnt=(r,k)=>{const z=k?size*.66:size;return r.ko?`500 ${z*.84}px ${SANS}`:`${r.it?'italic ':''}500 ${z}px ${SERIF}`;};
  c.save();c.fillStyle=o.color||C.text;c.textBaseline='middle';c.textAlign='left';if(o.alpha!=null)c.globalAlpha*=o.alpha;
  parts.forEach(p=>{p.runs=[];const re=/(log|ln|sin|cos|tan|lim|max|min)|([A-Za-zαβθ])|([가-힣]+)|([^A-Za-zαβθ가-힣]+)/g;let m;
    while((m=re.exec(p.t)))p.runs.push({t:m[0],it:!!m[2],ko:!!m[3]});
    p.w=0;p.runs.forEach(r=>{c.font=fnt(r,p.k);r.w=c.measureText(r.t).width;p.w+=r.w;});});
  let w=0;parts.forEach((p,j)=>{const q=parts[j-1];p.st=p.k==='^'&&q&&q.k==='_';w+=p.st?Math.max(0,p.w-q.w):p.w;});
  let cx=o.align==='center'?x-w/2:o.align==='right'?x-w:x;
  parts.forEach((p,j)=>{let px=cx;if(p.st){const q=parts[j-1];px=cx-q.w;cx+=Math.max(0,p.w-q.w);}else cx+=p.w;
    const dy=p.k==='_'?size*.32:p.k==='^'?-size*.38:0;
    p.runs.forEach(r=>{c.font=fnt(r,p.k);c.fillText(r.t,px,y+dy);px+=r.w;});});
  c.restore();return w;}
/* 곡선 위에 얹는 수식: 어두운 바탕을 깔아 선과 겹쳐도 읽히게 */
function FB(c,s,x,y,o={}){const w=F(c,s,x,y,{...o,alpha:0}),z=o.size||20,x0=o.align==='center'?x-w/2:o.align==='right'?x-w:x;
  box(c,x0-6,y-z*.72,w+12,z*1.44,6,'rgba(10,21,34,.86)',null,0,{alpha:o.alpha});return F(c,s,x,y,o);}
/* 좌표평면: 화면 상자 (x, y, w, h)에 수학 범위 [x0, x1] × [y0, y1]을 얹는다 */
function PL(x,y,w,h,x0,x1,y0,y1){return {x,y,w,h,x0,x1,y0,y1,X:v=>x+(v-x0)/(x1-x0)*w,Y:v=>y+h-(v-y0)/(y1-y0)*h};}
function AX(c,P,xl='x',yl='y'){const oy=P.Y(clamp(0,P.y0,P.y1)),ox=P.X(clamp(0,P.x0,P.x1));
  arrow(c,P.x-4,oy,P.x+P.w+12,oy,C.dim,1.6,9);arrow(c,ox,P.y+P.h+4,ox,P.y-12,C.dim,1.6,9);
  if(xl)F(c,xl,P.x+P.w+14,oy+18,{size:18,color:C.muted,align:'right'});if(yl)F(c,yl,ox+12,P.y-6,{size:18,color:C.muted});}
/* 매개 곡선 g(s) = [x, y] (s: a → b), 좌표 상자 밖은 자른다. 값이 끊기면 선도 끊는다 */
function CV(c,P,g,a,b,col,w=3,o={}){const n=o.n||320;let pts=[];c.save();c.beginPath();c.rect(P.x-2,P.y-2,P.w+4,P.h+4);c.clip();
  const out=()=>{if(pts.length>1)poly(c,pts,col,w,o);pts=[];};
  for(let i=0;i<=n;i++){const p=g(a+(b-a)*i/n);if(!p||!isFinite(p[0])||!isFinite(p[1])||Math.abs(p[1])>1e4){out();continue;}pts.push([P.X(p[0]),P.Y(p[1])]);}
  out();c.restore();}
const FN=(c,P,f,a,b,col,w,o)=>CV(c,P,s=>[s,f(s)],a,b,col,w,o);
const unit=v=>{const L=Math.hypot(v[0],v[1])||1;return [v[0]/L,v[1]/L];};
const bis=(p,p1,p2)=>{const u=unit([p1[0]-p[0],p1[1]-p[1]]),v=unit([p2[0]-p[0],p2[1]-p[1]]);return unit([u[0]+v[0],u[1]+v[1]]);};
function ang(c,p,p1,p2,r,col,w=2.5){const a1=Math.atan2(p1[1]-p[1],p1[0]-p[0]),a2=Math.atan2(p2[1]-p[1],p2[0]-p[0]);let d=a2-a1;
  while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;c.save();c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.arc(p[0],p[1],r,a1,a1+d,d<0);c.stroke();c.restore();}
const nf=(v,k=1)=>(Math.abs(v-Math.round(v))<.005?String(Math.round(v)):v.toFixed(k)).replace('-','−');

/* ───────── 0. 인트로 ───────── */
S.push({u:-1,ch:'시작',title:'수능 수학, 움직이며 정리하기',
  sub:'세 과목, 열여섯 개 개념. 식의 문자 하나가 바뀌면 그래프의 무엇이 따라 바뀌는지 움직여서 보여 줍니다.',
  fx:[{w:1,f:'Ⅰ 수학Ⅰ',n:'지수·로그 · 삼각함수 · 수열'},{w:1,f:'Ⅱ 수학Ⅱ',n:'함수의 극한과 연속 · 미분 · 적분'},{w:1,f:'Ⅲ 미적분',n:'수열의 극한 · 여러 가지 미분법 · 여러 가지 적분법'}],
  pts:['장면마다 <em>무엇을 바꾸면 무엇이 따라오는지</em>를 보세요. 밑 a, 계수, h, n 하나가 움직이면 그래프가 이유를 보여 줍니다.','재생 중에는 약 15초마다 다음 개념으로 넘어갑니다. 아래 막대를 눌러 원하는 개념으로 바로 이동할 수 있어요.','외우는 말(얼싸안코, 끊기면 연속 ✕ · 꺾이면 미분 ✕ …)은 각 장면 설명에 함께 적었습니다.','페이지 아래 <em>한눈에 정리</em>에 과목별 핵심 식이 모여 있습니다.'],
  dur:14,still:4,
  draw(c,t){
    label(c,'3 SUBJECTS · 16 CONCEPTS',480,52,C.dim,{size:15});
    const cx=[190,480,770],cy=230,R=110,nn=[5,6,5];
    UNITS.forEach((u,i)=>{const k=ease(seg(t,.1+i*.25,1+i*.25)),x0=cx[i];
      c.save();c.globalAlpha=k;dot(c,x0,cy,R,'rgba(255,255,255,.025)',{stroke:u.c+'66',lw:1.5});
      c.beginPath();c.arc(x0,cy,R-2,0,TAU);c.clip();
      if(i===0){ // 사인 곡선이 흘러간다
        poly(c,[[x0-R,cy],[x0+R,cy]],C.line,1.5);const pts=[];for(let x=-R;x<=R;x+=3)pts.push([x0+x,cy-42*Math.sin(x/26-t*2)]);
        poly(c,pts,u.c,3);dot(c,x0,cy-42*Math.sin(-t*2),7,u.c,{glow:14});
      }else if(i===1){ // 삼차 곡선 위를 미끄러지는 접선
        const f=q=>q*q*q-1.6*q,df=q=>3*q*q-1.6,X=q=>x0+q*62,Y=v=>cy-v*42,pts=[];for(let q=-1.7;q<=1.7;q+=.03)pts.push([X(q),Y(f(q))]);
        poly(c,pts,C.muted,2.5);const q0=1.25*Math.sin(t*.9),m=df(q0);
        poly(c,[[X(q0-.7),Y(f(q0)-.7*m)],[X(q0+.7),Y(f(q0)+.7*m)]],u.c,3);dot(c,X(q0),Y(f(q0)),7,u.c,{glow:14});
      }else{ // 변의 중점을 이어 넓이가 반씩 줄어드는 정사각형
        for(let j=0;j<7;j++){const s=150/Math.pow(Math.SQRT2,j),a=j*Math.PI/4+t*.15,pts=[];
          for(let v=0;v<4;v++){const b=a+Math.PI/4+v*Math.PI/2;pts.push([x0+Math.cos(b)*s/Math.SQRT2,cy+Math.sin(b)*s/Math.SQRT2]);}
          poly(c,pts,u.c,2,{close:true,alpha:1-j*.11,fill:j%2?'rgba(255,122,138,.10)':null});}
      }
      c.restore();c.save();c.globalAlpha=k;
      T(c,u.k,x0,cy+R+40,{font:DISP,size:34,color:u.c,align:'center',w:400});
      T(c,u.name,x0,cy+R+78,{size:20,align:'center',w:600});
      label(c,'개념 '+nn[i]+'개',x0,cy+R+106,C.dim,{size:15});c.restore();});
  }});

/* ───────── Ⅰ-1 지수함수와 로그함수의 그래프 ───────── */
S.push({u:0,ch:'지수와 로그',title:'지수·로그 그래프와 밑 a',file:'01-exp-log.html',
  sub:'밑 a가 1을 지나는 순간 증가와 감소가 뒤바뀝니다. 지수함수는 (0, 1), 로그함수는 (1, 0)을 지나고, 두 그래프는 y = x를 접는 선으로 포개집니다.',
  fx:[{f:'y = a^x ⟷ y = log_a x',n:'서로 역함수 · 직선 y = x에 대하여 대칭'},{f:'a^0 = 1,  log_a 1 = 0',n:'지수는 (0, 1), 로그는 (1, 0)을 지난다'},{w:1,f:'a &gt; 1 증가 · 0 &lt; a &lt; 1 감소',n:'부등식도 밑이 1보다 작으면 부등호를 뒤집는다'}],
  pts:['지수함수의 점근선은 <em>x축(y = 0)</em>, 로그함수의 점근선은 <em>y축(x = 0)</em>. 정의역도 모든 실수 ↔ x &gt; 0으로 맞바뀝니다.','<em>a = 1</em>이면 y = 1 직선이라 밑이 될 수 없습니다. 그래서 밑의 조건은 a &gt; 0, a ≠ 1.','평행이동은 점근선과 지나는 점을 함께 옮깁니다. y = 3<sup>x</sup> + 1 → 점근선 y = 1, 점 (0, 2).','a &gt; 1이면 y = a<sup>x</sup>와 y = log<sub>a</sub> x의 교점은 있다면 모두 <em>y = x 위</em>에 있습니다. 0 &lt; a &lt; 1이면 밖에도 생길 수 있습니다.'],
  dur:16,still:1.5,
  draw(c,t){
    const p=t<3?1:t<7?lerp(1,-1,ease((t-3)/4)):t<10?-1:t<14?lerp(-1,1,ease((t-10)/4)):1,a=Math.pow(2,p),flat=Math.abs(p)<.03,G=C.u1;
    const P=PL(60,50,450,450,-3,4.5,-3,4.5);
    poly(c,[[P.x,P.Y(0)],[P.x+P.w,P.Y(0)]],G,7,{alpha:.16});poly(c,[[P.X(0),P.y],[P.X(0),P.y+P.h]],VIO,7,{alpha:.16});
    AX(c,P);poly(c,[[P.X(-3),P.Y(-3)],[P.X(4.5),P.Y(4.5)]],C.muted,1.5,{dash:[6,6]});
    FN(c,P,x=>Math.pow(a,x),-3,4.5,G,3.5);if(!flat)CV(c,P,s=>[Math.pow(a,s),s],-3,4.5,VIO,3.5);
    const s=.4+1.3*Math.sin(t*.8),q=Math.pow(a,s); // y = x를 사이에 둔 한 쌍의 점 (s, q) ↔ (q, s)
    if(!flat){poly(c,[[P.X(s),P.Y(q)],[P.X(q),P.Y(s)]],C.text,1.5,{dash:[3,4],alpha:.7});dot(c,P.X(q),P.Y(s),5,VIO);}
    dot(c,P.X(s),P.Y(q),5,G);dot(c,P.X(0),P.Y(1),7,G,{glow:12});if(!flat)dot(c,P.X(1),P.Y(0),7,VIO,{glow:12});
    // 오른쪽: 밑 a의 자리
    const RX=570,SX=v=>RX+v/3*340,SY=126,up=p>.03,dn=p<-.03;
    F(c,'a = '+a.toFixed(2),RX,70,{size:26});
    poly(c,[[SX(0),SY],[SX(1),SY]],PINK,6,{alpha:.55});poly(c,[[SX(1),SY],[SX(3),SY]],GRN,6,{alpha:.55});
    poly(c,[[SX(1),SY-12],[SX(1),SY+12]],C.text,2);label(c,'1',SX(1),SY+28,C.text,{size:15});dot(c,SX(a),SY,9,C.text,{glow:12});
    T(c,up?'증가':dn?'감소':'a = 1',RX,196,{font:DISP,size:40,color:up?GRN:dn?PINK:C.muted,w:400});
    T(c,up?'a > 1 : 오른쪽으로 갈수록 올라간다':dn?'0 < a < 1 : 오른쪽으로 갈수록 내려간다':'y = 1 직선 → 밑이 될 수 없다',RX,240,{size:17,color:C.muted});
    [['y = a^x',G,0],['y = log_a x',VIO,0],['y = x',C.muted,1]].forEach(([f,col,d],i)=>{const y=300+i*38;
      poly(c,[[RX,y],[RX+34,y]],col,3.5,{dash:d?[6,5]:null});F(c,f,RX+46,y,{size:21,color:col});});
    T(c,'지수는 (0, 1), 로그는 (1, 0)',RX,430,{size:18,w:600});
    T(c,'점근선: x축(y = 0) ↔ y축(x = 0)',RX,464,{size:17,color:C.muted});
  }});

/* ───────── Ⅰ-2 단위원과 사인 곡선 ───────── */
S.push({u:0,ch:'삼각함수',title:'단위원에서 사인 곡선으로',file:'02-trig.html',
  sub:'반지름 1인 원 위를 도는 점의 세로 높이가 sin θ, 가로 위치가 cos θ입니다. 점이 한 바퀴(2π) 도는 동안의 높이를 옆으로 펼치면 사인 곡선이 됩니다.',
  fx:[{f:'cos θ = x,  sin θ = y',n:'단위원 위의 점 (x, y) · tan θ = y/x'},{f:'sin^2θ + cos^2θ = 1',n:'반지름이 1 · 피타고라스 정리 그대로'},{w:1,f:'얼싸안코 = All · sin · tan · cos',n:'1·2·3·4사분면에서 + 인 것'}],
  pts:['사인은 <em>세로(y)</em>, 코사인은 <em>가로(x)</em>의 부호를 따릅니다. 3사분면은 둘 다 −라 나눈 tan만 +.','점이 한 바퀴(2π) 돌면 같은 높이가 되풀이되므로 sin, cos의 주기는 <em>2π</em>, tan의 주기는 <em>π</em>입니다.','값은 각을 0 이상 2π 미만으로 → 사분면으로 부호 → 기준각의 삼각비 순서. sin 210° = −1/2.','sin θ = 3/5이고 θ가 제2사분면이면 가로가 음수라 cos θ = <em>−4/5</em>.'],
  dur:14,still:2.56,
  draw(c,t){
    const cx=190,cy=270,R=120,th=TAU*(t%7)/7,q=Math.min(3,Math.floor(th/(Math.PI/2))),cs=Math.cos(th),sn=Math.sin(th),px=cx+R*cs,py=cy-R*sn;
    const X=v=>360+v*560/TAU,Y=v=>cy-R*v,G=C.u1,CY=C.u2;
    for(let k=0;k<4;k++)box(c,X(k*Math.PI/2),cy-R-14,140,2*R+28,0,k===q?'rgba(244,181,68,.09)':'rgba(255,255,255,.018)',null);
    poly(c,[[cx-R-34,cy],[cx+R+34,cy]],C.dim,1.5);poly(c,[[cx,cy-R-34],[cx,cy+R+34]],C.dim,1.5);dot(c,cx,cy,R,null,{stroke:C.muted,lw:2});
    [['얼 (All)',1,-1],['싸 (sin)',-1,-1],['안 (tan)',-1,1],['코 (cos)',1,1]].forEach(([s,sx,sy],k)=>
      T(c,s,cx+sx*114,cy+sy*114,{size:17,align:'center',w:k===q?700:500,color:k===q?G:C.dim}));
    c.save();c.beginPath();c.arc(cx,cy,28,0,-th,true);c.strokeStyle=C.text;c.lineWidth=2;c.stroke();c.restore();
    F(c,'θ',cx+46*Math.cos(th/2),cy-46*Math.sin(th/2),{size:19,align:'center'});
    poly(c,[[cx,cy],[px,py]],C.muted,2);poly(c,[[cx,cy],[px,cy]],CY,4);poly(c,[[px,cy],[px,py]],G,4);
    F(c,'sin θ',px+(cs<0?-10:10),(py+cy)/2,{size:19,color:G,align:cs<0?'right':'left'});
    F(c,'cos θ',(cx+px)/2,cy+(sn>=0?22:-22),{size:19,color:CY,align:'center'});dot(c,px,py,8,G,{glow:16});
    // 높이를 옆으로 펼친 그래프
    arrow(c,352,cy,936,cy,C.dim,1.6,9);poly(c,[[360,cy-R-20],[360,cy+R+20]],C.dim,1.5);
    const gh=[],tr=[];for(let v=0;v<=TAU+1e-9;v+=.03)gh.push([X(v),Y(Math.sin(v))]);for(let v=0;v<th;v+=.02)tr.push([X(v),Y(Math.sin(v))]);tr.push([X(th),Y(sn)]);
    poly(c,gh,C.muted,2,{alpha:.4,dash:[5,5]});poly(c,tr,G,3.5);
    poly(c,[[px,py],[X(th),py]],C.text,1.2,{dash:[3,5],alpha:.6});poly(c,[[X(th),cy],[X(th),py]],G,2,{alpha:.6});dot(c,X(th),py,7,G,{glow:14});
    [[Math.PI/2,''],[Math.PI,'π'],[1.5*Math.PI,''],[TAU,'2π']].forEach(([v,s])=>{poly(c,[[X(v),cy-6],[X(v),cy+6]],C.muted,2);if(s)label(c,s,X(v),cy+24,C.muted,{size:16});});
    F(c,'y = sin θ',X(Math.PI/2),Y(1)-28,{size:21,color:G,align:'center'});
    const by=cy+R+34;poly(c,[[X(0),by-6],[X(0),by],[X(TAU),by],[X(TAU),by-6]],C.dim,1.5);
    T(c,'한 바퀴 = 주기 2π',X(Math.PI),by+22,{size:17,align:'center',color:C.muted});
  }});

/* ───────── Ⅰ-3 y = a sin bx + d ───────── */
S.push({u:0,ch:'삼각함수',title:'y = a sin bx + d 읽기',file:'02-trig.html',
  sub:'a는 위아래 폭, b는 한 바퀴의 길이, d는 가운데 줄의 높이를 바꿉니다. 그래서 최댓값은 |a| + d, 최솟값은 −|a| + d, 주기는 2π/|b|입니다.',
  fx:[{f:'y = a sin bx + d',n:'a 진폭 · b 주기 · d 위아래 이동'},{f:'주기 = 2π/|b|',n:'tan의 주기는 π/|b|'},{f:'최댓값 |a| + d,  최솟값 −|a| + d',n:'a가 음수여도 진폭은 |a|'}],
  pts:['a가 음수면 산과 골짜기 자리만 바뀝니다. y = −2 cos x + 3의 최댓값은 1이 아니라 <em>|−2| + 3 = 5</em>.','|b|가 클수록 주기가 짧아져 같은 구간에 물결이 더 들어옵니다. 0 ≤ x &lt; 2π에서 sin 2x = 1/2의 해는 <em>4개</em>.','괄호는 b로 묶어 읽습니다. 2 sin(2x − π/3) + 1 = 2 sin 2(x − π/6) + 1 → 오른쪽으로 <em>π/6</em>, 최댓값 3, 최솟값 −1.','sin x = k의 해 개수는 수평선 y = k와 만나는 점의 수입니다.'],
  dur:18,still:15,
  draw(c,t){
    const a=1+ease(seg(t,1,3.5)),b=1+ease(seg(t,5,7.5)),d=ease(seg(t,9,11.5)),ph=t<1?0:t<5?1:t<9?2:t<13?3:4,G=C.u1;
    const P=PL(60,60,540,420,0,TAU+.35,-2.4,3.6),X=P.X,Y=P.Y,hl=k=>k===ph?G:C.text;
    box(c,P.x,Y(d+a),X(TAU)-P.x,Y(d-a)-Y(d+a),0,'rgba(244,181,68,.06)',null);
    AX(c,P);FN(c,P,x=>Math.sin(x),0,TAU,C.muted,2,{dash:[5,5],alpha:.5});
    [[d+a,4],[d,3],[d-a,4]].forEach(([v,k])=>poly(c,[[P.x,Y(v)],[P.x+P.w+8,Y(v)]],k===ph?G:C.dim,1.5,{dash:[6,5]}));
    FN(c,P,x=>a*Math.sin(b*x)+d,0,TAU,G,3.5);
    [[Math.PI,'π'],[TAU,'2π']].forEach(([v,s])=>{poly(c,[[X(v),Y(0)-6],[X(v),Y(0)+6]],C.muted,2);label(c,s,X(v),Y(0)+21,C.muted,{size:15});});
    // 진폭 화살표와 주기 괄호
    const xa=X(Math.PI/(2*b));arrow(c,xa,Y(d),xa,Y(d+a),hl(1),2.5,9);arrow(c,xa,Y(d+a),xa,Y(d),hl(1),2.5,9);
    FB(c,'|a| = '+nf(a),xa+10,(Y(d)+Y(d+a))/2,{size:19,color:hl(1)});
    const yb=Y(d-a)+26,pr=2/b,ps=Math.abs(pr-1)<.005?'π':nf(pr)+'π';
    poly(c,[[X(0),yb-7],[X(0),yb],[X(2*Math.PI/b),yb],[X(2*Math.PI/b),yb-7]],hl(2),2);
    F(c,'주기 2π/|b| = '+ps,X(Math.PI/b),yb+22,{size:19,color:hl(2),align:'center'});
    // 오른쪽 끝: 최댓값 · 가운데 줄 · 최솟값
    [['최댓값','|a| + d = '+nf(a+d),d+a,4],['가운데 줄','y = d = '+nf(d),d,3],['최솟값','−|a| + d = '+nf(d-a),d-a,4]].forEach(([n,f,v,k])=>{
      T(c,n,618,Y(v),{size:16,color:k===ph?G:C.muted});F(c,f,700,Y(v),{size:20,color:hl(k)});});
    const fs='y = '+(Math.abs(a-1)<.005?'':nf(a)+' ')+'sin '+(Math.abs(b-1)<.005?'':nf(b))+'x'+(d<.005?'':' + '+nf(d));
    F(c,fs,60,30,{size:26});
    T(c,['기본: y = sin x','a를 키우면 → 위아래 폭만 커진다','b를 키우면 → 한 바퀴가 짧아진다','d를 키우면 → 가운데 줄이 올라간다','최댓값·최솟값·주기를 그래프에서 읽기'][ph],940,30,{size:17,color:G,align:'right',w:600});
  }});

/* ───────── Ⅰ-4 사인법칙과 코사인법칙 ───────── */
S.push({u:0,ch:'삼각함수',title:'사인법칙 vs 코사인법칙',file:'02-trig.html',
  sub:'마주 보는 변과 각의 쌍이 보이면 사인법칙, 두 변과 그 끼인각이 보이면 코사인법칙입니다. 사인법칙의 값 a / sin A는 외접원의 지름 2R입니다.',
  fx:[{f:'a / sin A = b / sin B = 2R',n:'사인법칙 · R은 외접원의 반지름'},{f:'a^2 = b^2 + c^2 − 2bc cos A',n:'코사인법칙 · A는 b, c의 끼인각'},{f:'S = ½bc sin A',n:'넓이도 끼인각의 sin · 둔각이어도 sin은 양수'}],
  pts:['<em>두 각과 한 변</em> → 사인법칙 · <em>두 변과 끼인각</em> → 코사인법칙으로 마주 보는 변 · <em>세 변</em> → 코사인법칙으로 각.','같은 현 BC를 보는 각은 A가 원 위 어디에 있든 같습니다. 점선처럼 A를 지름 끝으로 옮기면 직각삼각형이라 <em>a = 2R sin A</em>.','cos A의 부호가 각의 종류를 정합니다. a<sup>2</sup> &gt; b<sup>2</sup> + c<sup>2</sup>이면 cos A &lt; 0, <em>둔각</em>.','두 변과 끼인각이 아닌 각이 주어지면 B와 180° − B 두 후보를 각의 합으로 검사합니다.'],
  dur:16,still:6.43,
  draw(c,t){
    const G=C.u1,K=GRN,w=TAU/8,rad=Math.PI/180;
    poly(c,[[480,36],[480,520]],C.line,1.5);
    // 왼쪽: 마주 보는 쌍 → 사인법칙
    T(c,'마주 보는 쌍  →  사인법칙',245,52,{size:20,align:'center',w:700,color:G});
    const O=[245,282],R=128,pt=d=>[O[0]+R*Math.cos(d*rad),O[1]-R*Math.sin(d*rad)];
    const B=pt(240),Cc=pt(300),C2=pt(120),A=pt(90+50*Math.sin(w*t));
    dot(c,O[0],O[1],R,null,{stroke:C.line,lw:2});dot(c,O[0],O[1],3.5,C.dim);
    poly(c,[Cc,C2],C.dim,1.5,{dash:[5,5]});poly(c,[C2,B],C.dim,1.5,{dash:[5,5]});
    const u1=unit([Cc[0]-B[0],Cc[1]-B[1]]),u2=unit([C2[0]-B[0],C2[1]-B[1]]);
    poly(c,[[B[0]+u1[0]*13,B[1]+u1[1]*13],[B[0]+u1[0]*13+u2[0]*13,B[1]+u1[1]*13+u2[1]*13],[B[0]+u2[0]*13,B[1]+u2[1]*13]],C.dim,1.5);
    ang(c,C2,B,Cc,24,C.dim,2);
    poly(c,[A,B],C.muted,2.5);poly(c,[A,Cc],C.muted,2.5);poly(c,[B,Cc],G,4.5);ang(c,A,B,Cc,30,G,3);
    const bA=bis(A,B,Cc);F(c,'A',A[0]-bA[0]*22,A[1]-bA[1]*22,{size:21,align:'center'});label(c,'30°',A[0]+bA[0]*56,A[1]+bA[1]*56,G,{size:15});
    F(c,'a = 3',O[0],B[1]-16,{size:19,color:G,align:'center'});
    F(c,'a / sin A = 2R',245,458,{size:24,align:'center'});F(c,'3 ÷ sin 30° = 6 = 2R',245,494,{size:20,color:C.muted,align:'center'});
    // 오른쪽: 두 변 + 끼인각 → 코사인법칙
    T(c,'두 변 + 끼인각  →  코사인법칙',715,52,{size:20,align:'center',w:700,color:G});
    const phi=(75-45*Math.cos(w*t))*rad,A2=[640,398],B2=[892,398],C3=[640+180*Math.cos(phi),398-180*Math.sin(phi)],a2=74-70*Math.cos(phi);
    poly(c,[A2,B2],G,4.5);poly(c,[A2,C3],G,4.5);poly(c,[B2,C3],K,4.5);ang(c,A2,B2,C3,34,G,3);
    const nb=[-Math.sin(phi),-Math.cos(phi)];F(c,'b = 5',640+90*Math.cos(phi)+nb[0]*44,398-90*Math.sin(phi)+nb[1]*44,{size:19,color:G,align:'center'});
    F(c,'c = 7',766,422,{size:19,color:G,align:'center'});F(c,'A',622,418,{size:21,align:'center'});
    const N=[(B2[0]+C3[0])/2,(B2[1]+C3[1])/2];let na=unit([C3[1]-B2[1],-(C3[0]-B2[0])]);if(na[0]*(A2[0]-N[0])+na[1]*(A2[1]-N[1])>0)na=[-na[0],-na[1]];
    F(c,'a',N[0]+na[0]*24,N[1]+na[1]*24,{size:22,color:K,align:'center'});
    F(c,'a^2 = 5^2 + 7^2 − 2·5·7 cos A',715,462,{size:21,align:'center'});
    F(c,'A = '+Math.round(phi/rad)+'°  →  a^2 ≈ '+a2.toFixed(0),715,498,{size:21,color:K,align:'center'});
  }});

/* ───────── Ⅰ-5 등차수열과 등비수열 ───────── */
S.push({u:0,ch:'수열',title:'등차는 더하고, 등비는 곱한다',file:'03-sequence.html',
  sub:'등차수열은 매번 같은 수 d를 더해 막대가 같은 만큼씩 자라고, 등비수열은 같은 수 r을 곱해 점점 크게 자랍니다. 등차의 합은 같은 수열을 거꾸로 붙이면 직사각형이 됩니다.',
  fx:[{f:'a_n = a + (n − 1)d',n:'등차 · 이웃한 항의 차가 d'},{f:'a_n = ar^{n−1}',n:'등비 · 이웃한 항의 비가 r'},{f:'S_n = n(a + l)/2',n:'등차의 합 · (첫째항 + 끝항) × 개수 ÷ 2'},{f:'S_n = a(r^n − 1)/(r − 1)',n:'등비의 합 (r ≠ 1) · r = 1이면 na'}],
  pts:['같은 수열을 거꾸로 붙이면 모든 칸이 <em>첫째항 + 끝항</em>으로 같아져 직사각형이 됩니다. 그 절반이 합입니다.','중항: 등차는 <em>더해서 반</em>(2b = a + c), 등비는 <em>곱해서 루트</em>(b<sup>2</sup> = ac, ± 둘).','S<sub>n</sub>이 주어지면 a<sub>n</sub> = S<sub>n</sub> − S<sub>n−1</sub> (n ≥ 2), 첫째항은 a<sub>1</sub> = S<sub>1</sub>로 따로 확인합니다.','제3항 7, 제7항 19 → 4칸에 12 늘어 d = 3, a = 1 → S<sub>10</sub> = 10 × (1 + 28)/2 = <em>145</em>.'],
  dur:16,still:13,
  draw(c,t){
    const G=C.u1,CY=C.u2,base=468,bw=50,gap=22,L0=70,R0=530,ua=25,ug=20;
    poly(c,[[480,36],[480,520]],C.line,1.5);
    // 등차: 1, 4, 7, 10, 13 (+3씩)
    T(c,'등차수열 · 공차 d = 3',250,48,{size:19,align:'center',w:700,color:G});F(c,'1,  4,  7,  10,  13',250,84,{size:22,align:'center'});
    for(let k=0;k<5;k++){const g=ease(seg(t,.3+k*.7,.9+k*.7)),h=(1+3*k)*ua*g,x=L0+k*(bw+gap);if(g<=0)continue;
      box(c,x,base-h,bw,h,4,'rgba(244,181,68,.26)',G,2);if(k>0)box(c,x+2,base-h+2,bw-4,3*ua*g-2,3,'rgba(244,181,68,.5)',null);}
    F(c,'+3',L0+bw+gap+bw/2,base-62,{size:19,align:'center',alpha:seg(t,1,1.6)});
    for(let k=0;k<5;k++){const g=ease(seg(t,5.5+k*.25,7+k*.25)),h=(1+3*k)*ua,hr=(13-3*k)*ua,x=L0+k*(bw+gap);if(g<=0)continue;
      box(c,x,base-h-hr-(1-g)*160,bw,hr,4,'rgba(79,209,232,.22)',CY,2,{alpha:g});}
    const kr=seg(t,8.6,9.4);if(kr>0){box(c,L0-6,base-14*ua-6,5*bw+4*gap+12,14*ua+12,6,null,C.text,2,{alpha:kr});
      label(c,'14',L0-14,base-7*ua,C.text,{size:17,align:'right',alpha:kr});}
    F(c,'S_5 = 5 × 14 ÷ 2 = 35',250,508,{size:22,align:'center',color:G,alpha:seg(t,9,10)});
    // 등비: 1, 2, 4, 8, 16 (×2씩)
    T(c,'등비수열 · 공비 r = 2',710,48,{size:19,align:'center',w:700,color:G});F(c,'1,  2,  4,  8,  16',710,84,{size:22,align:'center'});
    for(let k=0;k<5;k++){const g=ease(seg(t,.3+k*.7,.9+k*.7)),h=Math.pow(2,k)*ug*g,x=R0+k*(bw+gap);if(g<=0)continue;
      box(c,x,base-h,bw,h,4,'rgba(244,181,68,.26)',G,2);if(k>0&&g>.99)poly(c,[[x+4,base-h/2],[x+bw-4,base-h/2]],G,1.5,{dash:[4,3]});}
    F(c,'×2',R0+4*(bw+gap)+bw+10,base-12*ug,{size:19,alpha:seg(t,3.4,4)});
    F(c,'S_5 = (2^5 − 1)/(2 − 1) = 31',710,508,{size:22,align:'center',color:G,alpha:seg(t,9,10)});
  }});

/* ───────── Ⅱ-1 함수의 극한과 연속 ───────── */
S.push({u:1,ch:'함수의 극한과 연속',title:'극한과 연속 — 세 칸 체크',file:'04-limit.html',
  sub:'왼쪽과 오른쪽에서 다가가며 읽은 높이가 극한, 그 자리에 찍힌 점의 높이가 함숫값입니다. 둘이 같은 높이에서 만나야 연속입니다.',
  fx:[{f:'lim_{x→a} f(x) = L',n:'좌극한 = 우극한 = L일 때만 극한이 있다'},{f:'lim_{x→a} f(x) = f(a)',n:'연속 · 점이 있고, 극한이 있고, 둘이 같다'},{w:1,f:'사잇값 정리 · 최대·최소 정리',n:'닫힌 구간에서 연속이어야 쓸 수 있다'}],
  pts:['극한은 그 점의 함숫값을 보지 않습니다. <em>구멍의 높이</em>가 극한, <em>칠해진 점의 높이</em>가 함숫값입니다.','세로선 x = a를 긋고 <em>왼쪽 높이 · 오른쪽 높이 · 찍힌 점</em>을 세 칸에 적으세요. 앞의 둘이 같으면 극한, 셋이 같으면 연속.','구멍만 있고 점이 없으면 ①부터 ✕. 점을 구멍 높이로 옮기면 그 점에서 연속이 됩니다(제거 가능 불연속).','0/0 꼴은 인수분해·유리화로 약분한 뒤 대입: lim<sub>x→1</sub> (x<sup>2</sup> − 1)/(x − 1) = lim (x + 1) = <em>2</em>.'],
  dur:16,still:5,
  draw(c,t){
    const tau=t%8,s=ease(seg(tau,.4,3)),k=seg(tau,3.2,3.8),CY=C.u2,bg='#0B1724';
    const cases=[['구멍 + 딴 점',x=>x+1,x=>x+1,4,'③ ✕  극한 2 ≠ 함숫값 4',PINK],['끊김',x=>x+1,x=>x+3,4,'② ✕  왼쪽 2 ≠ 오른쪽 4',PINK],['이어짐',x=>x+1,x=>x+1,2,'①②③ ✓  연속',GRN]];
    cases.forEach(([name,fl,fr,fa,verdict,vc],i)=>{
      const x0=20+i*310,P=PL(x0+34,118,250,272,-.25,2.25,0,5.6),X=P.X,Y=P.Y;
      T(c,name,x0+155,76,{size:20,align:'center',w:700,color:CY});
      AX(c,P,'','');poly(c,[[X(1),P.y+8],[X(1),P.y+P.h]],C.dim,1.2,{dash:[4,5]});F(c,'a',X(1),P.y+P.h+20,{size:18,color:C.muted,align:'center'});
      FN(c,P,fl,-.25,1,C.text,3);FN(c,P,fr,1,2.25,C.text,3);
      const xl=1-1.15*(1-s),xr=1+1.15*(1-s),yl=fl(xl),yr=fr(xr);
      poly(c,[[X(0),Y(yl)],[X(xl),Y(yl)]],CY,1.5,{dash:[4,4],alpha:.85});poly(c,[[X(0),Y(yr)],[X(xr),Y(yr)]],VIO,1.5,{dash:[4,4],alpha:.85});
      dot(c,X(xl),Y(yl),6,CY,{glow:12});dot(c,X(xr),Y(yr),6,VIO,{glow:12});
      if(fl(1)!==fa)dot(c,X(1),Y(fl(1)),7,bg,{stroke:C.text,lw:2.5});      // 구멍: 다가가는 높이
      if(fr(1)!==fa&&fr(1)!==fl(1))dot(c,X(1),Y(fr(1)),7,bg,{stroke:C.text,lw:2.5});
      dot(c,X(1),Y(fa),7,C.text,{glow:10});                               // 찍힌 점: 함숫값
      T(c,verdict,x0+155,P.y+P.h+50,{size:17,align:'center',w:600,color:vc,alpha:k});
    });
    T(c,'연속 = ① 점이 있고  ② 극한이 있고  ③ 둘이 같다',480,492,{size:19,align:'center',w:600});
    T(c,'왼쪽 높이 · 오른쪽 높이 · 찍힌 점 — 세 칸을 따로 적는다',480,522,{size:16,align:'center',color:C.muted});
  }});

/* ───────── Ⅱ-2 할선에서 접선으로 ───────── */
S.push({u:1,ch:'미분',title:'할선이 접선이 될 때 — f′(a)',file:'05-diff.html',
  sub:'두 점을 잇는 할선의 기울기가 평균변화율입니다. 오른쪽 점을 끌어와 h → 0이 되면 할선이 접선에 붙고, 그 기울기가 미분계수 f′(a)입니다.',
  fx:[{f:'(f(b) − f(a)) / (b − a)',n:'평균변화율 · 두 점을 잇는 할선의 기울기'},{f:'f′(a) = lim_{h→0} (f(a + h) − f(a)) / h',n:'미분계수 · 그 점에서 그은 접선의 기울기'},{f:'y − f(a) = f′(a)(x − a)',n:'접선의 방정식'}],
  pts:['미분계수는 <em>한 점에서의 변화율</em>입니다. 왼쪽(h → 0<sup>−</sup>)과 오른쪽(h → 0<sup>+</sup>)에서 같은 값이어야 미분가능합니다.','<em>끊기면 연속 ✕, 꺾이면 미분 ✕</em>. y = |x|는 x = 0에서 연속이지만 왼쪽 기울기 −1, 오른쪽 1이라 미분할 수 없습니다.','미분가능하면 연속입니다. 거꾸로는 성립하지 않습니다.','그림: f(x) = x<sup>2</sup>, a = 1 → 할선 기울기 2 + h → <em>f′(1) = 2</em>, 접선 y = 2x − 1.'],
  dur:16,still:5.03,
  draw(c,t){
    const CY=C.u2,G=C.u1,h=.02+.98*(1-ease(seg(t,1,9))),done=seg(t,9.3,10.2),f=x=>x*x,m=2+h;
    const P=PL(60,50,500,440,-.5,2.6,-.6,4.8),X=P.X,Y=P.Y;
    AX(c,P);
    FN(c,P,x=>2*x-1,-.5,2.6,GRN,2.5,{dash:done>0?null:[7,6],alpha:.45+.55*done});
    FN(c,P,f,-.5,2.6,C.text,3.5);
    if(done<1)FN(c,P,x=>1+m*(x-1),-.5,2.6,CY,3,{alpha:1-done});
    const qx=1+h,qy=f(qx),la=clamp((h-.08)/.2)*(1-done);
    poly(c,[[X(1),Y(1)],[X(qx),Y(1)],[X(qx),Y(qy)]],G,2,{dash:[4,4],alpha:la});
    F(c,'h',X(1+h/2),Y(1)+18,{size:19,color:G,align:'center',alpha:la});
    F(c,'f(1 + h) − f(1)',X(qx)+10,(Y(1)+Y(qy))/2,{size:18,color:G,alpha:la});
    dot(c,X(qx),Y(qy),7,CY,{glow:12,alpha:1-done});dot(c,X(1),Y(1),7,C.text,{glow:12});
    // 오른쪽: 평균변화율 → 미분계수
    F(c,'f(1 + h) − f(1)',720,112,{size:22,align:'center'});poly(c,[[640,136],[800,136]],C.text,2);F(c,'h',720,160,{size:22,align:'center'});
    F(c,'= 2 + h',812,136,{size:24});
    F(c,'h = '+h.toFixed(2),640,236,{size:30,color:G});
    F(c,'할선 기울기 = '+m.toFixed(2),640,290,{size:26,color:CY});
    T(c,'h → 0 이면 할선 → 접선',640,380,{size:19,w:600});
    F(c,'f′(1) = lim_{h→0} (2 + h) = 2',640,430,{size:22,color:GRN});
  }});

/* ───────── Ⅱ-3 도함수의 부호와 증가·감소 ───────── */
S.push({u:1,ch:'미분',title:'f′의 부호가 f의 오르막·내리막',file:'05-diff.html',
  sub:'f′이 +인 구간에서 f는 오르고, −인 구간에서 내려갑니다. f′의 부호가 + → −로 바뀌는 곳이 극대, − → +로 바뀌는 곳이 극소입니다.',
  fx:[{f:'f′(x) > 0 → 증가,  f′(x) < 0 → 감소',n:'도함수의 부호 = 접선 기울기의 부호'},{w:1,f:'+ → − 극대 · − → + 극소',n:'부호가 바뀌는 곳에서만 극값'},{f:'f′(x) = 3(x + 1)(x − 1)',n:'그림의 예 f(x) = x³ − 3x · 극댓값 2, 극솟값 −2'}],
  pts:['f′(c) = 0만으로는 극값이 아닙니다. y = x<sup>3</sup>은 x = 0 양쪽이 모두 오르막이라 <em>부호가 안 바뀌어</em> 극값이 없습니다.','모양을 물으면 f′을 인수분해해 <em>부호표(+ − +)</em>부터 만드세요.','방정식 f(x) = k의 실근 개수는 y = k와 그래프의 교점 수. x<sup>3</sup> − 3x = k는 −2 &lt; k &lt; 2일 때 <em>3개</em>.','닫힌 구간의 최댓값·최솟값은 극값과 끝점의 함숫값을 함께 비교합니다.'],
  dur:16,still:4,
  draw(c,t){
    const f=x=>x*x*x-3*x,df=x=>3*x*x-3,CY=C.u2;
    const P1=PL(70,44,610,226,-2.3,2.3,-3.2,3.2),P2=PL(70,306,610,204,-2.3,2.3,-3.6,6);
    const fill=(a,b,col)=>{const pts=[[P2.X(a),P2.Y(0)]];for(let i=0;i<=60;i++){const x=a+(b-a)*i/60;pts.push([P2.X(x),P2.Y(clamp(df(x),-3.6,6))]);}
      pts.push([P2.X(b),P2.Y(0)]);poly(c,pts,null,0,{fill:col,close:true});};
    fill(-2.3,-1,'rgba(123,224,127,.16)');fill(-1,1,'rgba(255,122,138,.16)');fill(1,2.3,'rgba(123,224,127,.16)');
    AX(c,P1,'','');AX(c,P2,'','');
    [-1,1].forEach(v=>poly(c,[[P1.X(v),P1.y],[P1.X(v),P2.y+P2.h]],C.dim,1.2,{dash:[4,5]}));
    FN(c,P2,df,-2.3,2.3,CY,3);
    FN(c,P1,f,-2.3,-1,GRN,3.5);FN(c,P1,f,-1,1,PINK,3.5);FN(c,P1,f,1,2.3,GRN,3.5);
    [['+',-1.75,1.6,GRN],['−',0,-1.5,PINK],['+',1.75,1.6,GRN]].forEach(([s,x,y,col])=>T(c,s,P2.X(x),P2.Y(y),{size:28,align:'center',w:700,color:col}));
    [-1,1].forEach(v=>label(c,v<0?'−1':'1',P2.X(v),P2.Y(0)+18,C.muted,{size:15}));
    // 훑는 세로선: 접선 기울기 = f′의 높이
    const tau=t%8,xs=-2.1+4.2*ease(seg(tau,.3,7)),m=df(xs),up=m>.05,dn=m<-.05,col=up?GRN:dn?PINK:C.text;
    poly(c,[[P1.X(xs),P1.y],[P1.X(xs),P2.y+P2.h]],C.muted,1.2,{dash:[2,4]});
    FN(c,P1,x=>f(xs)+m*(x-xs),xs-.42,xs+.42,col,3);
    dot(c,P1.X(xs),P1.Y(f(xs)),7,col,{glow:14});dot(c,P2.X(xs),P2.Y(clamp(m,-3.6,6)),7,col,{glow:14});
    dot(c,P1.X(-1),P1.Y(2),6,C.text);dot(c,P1.X(1),P1.Y(-2),6,C.text);
    T(c,'극대 2',P1.X(-1),P1.Y(2)-22,{size:18,align:'center',w:700});T(c,'극소 −2',P1.X(1),P1.Y(-2)+24,{size:18,align:'center',w:700});
    // 오른쪽
    F(c,'f(x) = x^3 − 3x',715,70,{size:21});
    T(c,up?'오르막 · f′ > 0':dn?'내리막 · f′ < 0':'f′ = 0 · 평평',715,150,{size:21,w:700,color:col});
    T(c,'f′ : + → − 이면 극대',715,206,{size:17,color:C.muted});T(c,'f′ : − → + 이면 극소',715,236,{size:17,color:C.muted});
    F(c,'f′(x) = 3(x + 1)(x − 1)',715,340,{size:18,color:CY});
  }});

/* ───────── Ⅱ-4 삼차함수의 개형과 점대칭 ───────── */
S.push({u:1,ch:'미분',title:'삼차함수 개형 — b² − 3ac와 점대칭',file:'05-diff.html',
  sub:'f′(x) = 3ax² + 2bx + c의 판별식 b² − 3ac가 양수면 언덕과 골짜기, 0 이하면 쭉 오르막입니다. 언덕과 골짜기는 변곡점을 중심으로 점대칭입니다.',
  fx:[{f:'f′(x) = 3ax^2 + 2bx + c',n:'판별식 D/4 = b² − 3ac'},{w:1,f:'b² − 3ac &gt; 0 → 언덕·골짜기 · ≤ 0 → 쭉 오르막',n:'a &gt; 0일 때 · a &lt; 0이면 모두 거꾸로'},{f:'중심 x = −b/(3a)',n:'두 극점의 중점 = 변곡점 · 높이는 극값의 평균'}],
  pts:['모든 삼차함수는 <em>변곡점에 대하여 점대칭</em>입니다. 중심에서 같은 거리의 두 함숫값을 더하면 중심 높이의 두 배.','예: x<sup>3</sup> − 3x<sup>2</sup> + 5 → 극점 x = 0, 2 → 중심 x = 1, (5 + 1)/2 = <em>3 = f(1)</em>.','b<sup>2</sup> − 3ac = 0이면 수평 접선이 하나 있지만 부호가 안 바뀌어 <em>극값은 없습니다</em>.','극댓값과 극솟값 사이에 k가 있으면 f(x) = k의 실근은 3개입니다.'],
  dur:16,still:2.5,
  draw(c,t){
    const cc=t<4?0:t<7?3*ease(seg(t,4,7)):t<9?3:t<11.5?lerp(3,5,ease(seg(t,9,11.5))):t<13.5?5:5*(1-ease(seg(t,13.5,16)));
    const k=3-cc,f=x=>(x-1)**3-k*(x-1)+3,CY=C.u2,G=C.u1; // x³ − 3x² + cx + d 꼴, 중심 (1, 3)이 그대로 있게 d를 맞춤
    const P=PL(60,50,540,450,-1.2,3.2,-1.5,7.5),X=P.X,Y=P.Y;
    AX(c,P);FN(c,P,f,-1.2,3.2,CY,3.5);
    const s=.55+.5*Math.abs(Math.sin(t*.9)),pa=[1-s,f(1-s)],pb=[1+s,f(1+s)]; // 중심을 사이에 둔 두 점
    poly(c,[[X(pa[0]),Y(pa[1])],[X(pb[0]),Y(pb[1])]],C.text,1.5,{dash:[4,5],alpha:.7});dot(c,X(pa[0]),Y(pa[1]),5,C.text);dot(c,X(pb[0]),Y(pb[1]),5,C.text);
    let fmax=null,fmin=null;
    if(k>.05){const r=Math.sqrt(k/3);fmax=f(1-r);fmin=f(1+r);
      poly(c,[[X(1-r),Y(fmax)],[X(1+r),Y(fmin)]],G,2,{dash:[6,5]});dot(c,X(1-r),Y(fmax),8,G,{glow:12});dot(c,X(1+r),Y(fmin),8,G,{glow:12});
      T(c,'극대',X(1-r),Y(fmax)-24,{size:18,align:'center',w:700,color:G});T(c,'극소',X(1+r),Y(fmin)+26,{size:18,align:'center',w:700,color:G});}
    dot(c,X(1),Y(3),8,C.text,{glow:14});
    // 오른쪽: 계수 → 판별식 → 개형
    F(c,'f(x) = x^3 − 3x^2 + cx + d',640,58,{size:20});
    F(c,'c = '+nf(cc),640,102,{size:26,color:G});
    F(c,'b^2 − 3ac = 9 − 3c = '+nf(9-3*cc),640,144,{size:20});
    F(c,'f′(x) = 3x^2 − 6x + c',650,190,{size:17,color:C.muted});
    const Q=PL(650,212,270,118,-.4,2.4,-3.5,6);AX(c,Q,'','');FN(c,Q,x=>3*x*x-6*x+cc,-.4,2.4,CY,2.5);
    if(k>.05){const r=Math.sqrt(k/3);dot(c,Q.X(1-r),Q.Y(0),5,G);dot(c,Q.X(1+r),Q.Y(0),5,G);}else if(k>-.05)dot(c,Q.X(1),Q.Y(0),5,G);
    const st=k>.05?['> 0 → 언덕과 골짜기 (극값 2개)',G]:k>-.05?['= 0 → 수평 접선 하나, 극값 없음',C.text]:['< 0 → 극값 없이 쭉 오르막',PINK];
    T(c,st[0],640,372,{size:18,w:700,color:st[1]});
    dot(c,648,418,7,C.text,{glow:10});T(c,'변곡점 = 대칭의 중심',664,418,{size:17});
    F(c,'중심 x = −b/(3a) = 1',640,458,{size:20});
    if(fmax!=null)F(c,'(극댓값 + 극솟값)/2 = '+nf((fmax+fmin)/2),640,496,{size:19,color:G});
    else T(c,'극값이 없어도 대칭의 중심은 그대로',640,496,{size:16,color:C.muted});
  }});

/* ───────── Ⅱ-5 정적분과 넓이 ───────── */
S.push({u:1,ch:'적분',title:'정적분과 넓이 — 직사각형에서 |f|까지',file:'06-integral.html',
  sub:'구간을 n등분해 세운 직사각형의 합은 n이 커질수록 한 값으로 다가갑니다. 그 값이 정적분이고 x축 아래는 음수로 셉니다. 넓이는 아래 조각을 뒤집은 |f|를 적분합니다.',
  fx:[{f:'∫_a^b f(x) dx = F(b) − F(a)',n:'F′ = f · 직사각형 합의 극한'},{f:'넓이 = ∫_a^b |f(x)| dx',n:'f = 0인 점에서 끊고 각각 절댓값'},{f:'∫_a^c f = ∫_a^b f + ∫_b^c f',n:'구간을 나눠 더해도 같다'}],
  pts:['정적분은 x축 위를 +, 아래를 −로 센 값입니다. ∫<sub>−1</sub><sup>2</sup> (x<sup>2</sup> − 1) dx = 0이지만 넓이는 <em>0이 아니라 8/3</em>.','넓이는 f = 0인 점(여기서는 x = −1, 1)에서 구간을 끊고, 아래 조각은 부호를 바꿔 더합니다.','두 곡선 사이 넓이는 ∫(위 − 아래) dx. y = x와 y = x<sup>2</sup> 사이(0~1)는 <em>1/6</em>.','−a부터 a까지면 <em>우(偶)는 두 배, 기(奇)는 0</em>: 짝수 차항만 두 배로 남깁니다.'],
  dur:18,still:14,
  draw(c,t){
    const f=x=>x*x-1,CY=C.u2,ns=[3,6,12,24,48],n=ns[clamp(Math.floor((t-.5)/1.6),0,4)],dx=3/n,fade=seg(t,9,10),flip=ease(seg(t,11,13)),sg=1-2*flip;
    const P=PL(60,70,540,420,-1.5,2.4,-1.6,3.6),X=P.X,Y=P.Y;
    let sum=0;for(let k=1;k<=n;k++){const x1=-1+k*dx,h=f(x1);sum+=h*dx; // 오른쪽 끝의 높이로 세운 직사각형
      box(c,X(x1-dx),Math.min(Y(0),Y(h)),X(x1)-X(x1-dx),Math.abs(Y(h)-Y(0)),0,h>=0?'rgba(79,209,232,.30)':'rgba(255,122,138,.30)',h>=0?CY:PINK,1,{alpha:1-.75*fade});}
    if(fade>0){const reg=(a,b,m,col)=>{const pts=[[X(a),Y(0)]];for(let i=0;i<=60;i++){const x=a+(b-a)*i/60;pts.push([X(x),Y(m*f(x))]);}pts.push([X(b),Y(0)]);
        poly(c,pts,null,0,{fill:col,close:true,alpha:fade});};
      reg(-1,1,sg,flip>.5?'rgba(79,209,232,.42)':'rgba(255,122,138,.42)');reg(1,2,1,'rgba(79,209,232,.42)');}
    AX(c,P,'x','');FN(c,P,f,-1.5,2.4,C.text,3.5);if(flip>0)FN(c,P,x=>sg*f(x),-1,1,CY,2.5,{alpha:flip});
    [[-1,'−1'],[1,'1'],[2,'2']].forEach(([v,s])=>label(c,s,X(v),Y(0)+18,C.muted,{size:15}));
    T(c,flip>.5?'+4/3':'−4/3',X(0),Y(-.5*sg),{size:20,w:700,align:'center',color:flip>.5?CY:PINK,alpha:fade});
    T(c,'+4/3',X(1.68),Y(.7),{size:20,w:700,align:'center',color:CY,alpha:fade});
    // 오른쪽
    F(c,'f(x) = x^2 − 1',640,72,{size:24});
    F(c,'n = '+n,640,130,{size:26,color:CY});
    F(c,'Σ f(x_k)Δx = '+sum.toFixed(2),640,172,{size:20});
    F(c,'∫_{−1}^2 (x^2 − 1) dx = 4/3 − 4/3 = 0',640,250,{size:19,alpha:fade});
    T(c,'넓이는 아래 조각을 뒤집어 더한다',640,300,{size:17,color:C.muted,alpha:fade});
    F(c,'∫_{−1}^2 |x^2 − 1| dx = 4/3 + 4/3 = 8/3',640,350,{size:19,color:GRN,alpha:seg(t,12.5,13.5)});
  }});

/* ───────── Ⅱ-6 속도 그래프로 위치와 이동 거리 ───────── */
S.push({u:1,ch:'적분',title:'속도 그래프로 위치와 이동 거리',file:'06-integral.html',
  sub:'속도 v(t) 그래프 아래 넓이가 쌓여 위치가 바뀝니다. 되돌아오는 구간(v < 0)은 위치를 깎지만, 움직인 거리에는 더해집니다.',
  fx:[{f:'x(t) = x(0) + ∫_0^t v(s) ds',n:'위치 = 처음 위치 + 속도 그래프의 넓이'},{f:'변위 = ∫_a^b v(t) dt',n:'t축 위 넓이 − 아래 넓이 · 되돌아온 만큼 빠진다'},{f:'거리 = ∫_a^b |v(t)| dt',n:'위·아래 넓이를 모두 더한다'}],
  pts:['<em>미분은 한 칸 아래로, 적분은 한 칸 위로</em>: 위치 x — 속도 v — 가속도 a.','방향은 v의 부호가 바뀌는 시각(그래프가 t축을 가로지르는 점)에서 바뀝니다. 그림에서는 <em>t = 1, 3</em>.','x(t) = t<sup>3</sup> − 6t<sup>2</sup> + 9t → 0~4초 위치 변화량 4, 움직인 거리 4 + 4 + 4 = <em>12</em>.','속력이 늘어나는 것은 v와 a의 부호가 같을 때입니다.'],
  dur:16,still:14,
  draw(c,t){
    const v=s=>3*(s-1)*(s-3),xp=s=>s*s*s-6*s*s+9*s,ts=4*seg(t,.5,11),CY=C.u2,G=C.u1;
    const dist=s=>s<=1?xp(s):s<=3?8-xp(s):8+xp(s);
    // 위: 수직선 위의 위치 (시간이 흐를수록 아래로 내려오는 자취)
    const XN=p=>120+p*100,NY=112,parts=[[0,1,CY],[1,3,PINK],[3,4,CY]];
    poly(c,[[100,NY],[560,NY]],C.dim,2);for(let p=0;p<=4;p++)poly(c,[[XN(p),NY-6],[XN(p),NY+6]],C.dim,2);
    label(c,'0',XN(0),NY+22,C.muted,{size:15});label(c,'4',XN(4),NY+22,C.muted,{size:15});T(c,'위치',96,NY,{size:16,align:'right',color:C.muted});
    parts.forEach(([a,b,col])=>{if(ts<=a)return;const e=Math.min(ts,b),pts=[];for(let s=a;s<e;s+=.02)pts.push([XN(xp(s)),34+14*s]);pts.push([XN(xp(e)),34+14*e]);poly(c,pts,col,3);});
    const px=XN(xp(ts));poly(c,[[px,34+14*ts],[px,NY]],C.muted,1,{dash:[2,3]});dot(c,px,NY,8,v(ts)>=0?CY:PINK,{glow:14});
    // 아래: v–t 그래프, 넓이가 쌓인다
    const P=PL(80,170,460,330,0,4.3,-4,10),X=P.X,Y=P.Y;
    const area=(a,b,col)=>{if(ts<=a)return;const e=Math.min(ts,b),pts=[[X(a),Y(0)]];for(let i=0;i<=50;i++){const s=a+(e-a)*i/50;pts.push([X(s),Y(v(s))]);}
      pts.push([X(e),Y(0)]);poly(c,pts,null,0,{fill:col,close:true});};
    parts.forEach(([a,b,col])=>area(a,b,col===CY?'rgba(79,209,232,.35)':'rgba(255,122,138,.35)'));
    AX(c,P,'t','');FN(c,P,v,0,4.15,C.text,3.5);
    poly(c,[[X(ts),Y(0)],[X(ts),Y(v(ts))]],C.text,1.5);dot(c,X(ts),Y(v(ts)),7,v(ts)>=0?CY:PINK,{glow:12});
    if(ts>=1)T(c,'+4',X(.35),Y(3),{size:20,w:700,align:'center',color:CY});
    if(ts>=3)T(c,'−4',X(2),Y(-1.5),{size:20,w:700,align:'center',color:PINK});
    if(ts>=4)T(c,'+4',X(3.68),Y(2.2),{size:20,w:700,align:'center',color:CY});
    F(c,'v(t) = 3(t − 1)(t − 3)',X(2),P.y+4,{size:19,align:'center'});
    // 오른쪽: 변위와 거리
    F(c,'변위 = ∫_0^t v dt = '+nf(xp(ts),2),600,240,{size:26,color:CY});
    F(c,'거리 = ∫_0^t |v| dt = '+nf(dist(ts),2),600,330,{size:26,color:G});
    F(c,'4 − 4 + 4 = 4',600,420,{size:21,color:CY,alpha:seg(t,11,12)});
    F(c,'4 + 4 + 4 = 12',600,456,{size:21,color:G,alpha:seg(t,11,12)});
  }});

/* ───────── Ⅲ-1 rⁿ의 극한과 등비급수 ───────── */
S.push({u:2,ch:'수열의 극한',title:'rⁿ의 극한과 등비급수',file:'07-seq-limit.html',
  sub:'공비 r의 크기가 1보다 작으면 rⁿ은 0으로 줄고, 등비급수도 첫째항/(1 − 공비)로 모입니다. 변의 중점을 이어 만든 정사각형의 넓이 4 + 2 + 1 + …은 8로 다가갑니다.',
  fx:[{f:'lim r^n = 0 (|r| < 1),  1 (r = 1)',n:'r > 1이면 ∞, r ≤ −1이면 진동'},{f:'a + ar + ar^2 + … = a / (1 − r)',n:'−1 < r < 1일 때만 · 그 밖은 발산'},{w:1,f:'수열은 1까지, 급수는 1 앞에서',n:'rⁿ: −1 &lt; r ≤ 1 · 등비급수: −1 &lt; r &lt; 1'}],
  pts:['−1 &lt; r &lt; 0이어도 <em>수렴</em>합니다. 부호는 바뀌지만 진폭이 0으로 줄어듭니다. 진동 발산은 r ≤ −1일 때.','r = 1이면 수열 1, 1, 1, …은 1로 수렴하지만 급수 a + a + a + …는 <em>발산</em>합니다.','도형 반복은 길이 비가 r이면 넓이 공비는 <em>r<sup>2</sup></em>. 중점 연결은 변이 1/√2배라 넓이 공비 1/2.','일반항이 0으로 가도 급수는 발산할 수 있습니다(1/n). 거꾸로, 급수가 수렴하면 일반항은 반드시 0입니다.'],
  dur:16,still:8,
  draw(c,t){
    const RS=[1.2,1,.6,-.6,-1],st=Math.min(4,Math.floor(t/3)),r=st?lerp(RS[st-1],RS[st],ease(seg(t-3*st,0,.7))):RS[0],K=C.u3,G=C.u1;
    const P=PL(70,70,380,300,-.5,10.5,-1.6,2.6),X=P.X,Y=P.Y;
    AX(c,P,'n','');[1,-1].forEach(v=>poly(c,[[P.x,Y(v)],[P.x+P.w,Y(v)]],C.dim,1,{dash:[4,5]}));
    c.save();c.beginPath();c.rect(P.x,P.y-8,P.w,P.h+8);c.clip();for(let n=0;n<=10;n++)dot(c,X(n),Y(Math.pow(r,n)),6,K,{glow:8});c.restore();
    const one=Math.abs(r-1)<=1e-3,conv=Math.abs(r)<1-1e-3,col=one||conv?GRN:PINK;
    F(c,'r = '+r.toFixed(2),70,36,{size:24,color:K});
    T(c,r>1+1e-3?'∞로 발산':one?'1로 수렴':conv?(r<0?'0으로 수렴 (부호가 바뀌며)':'0으로 수렴'):'진동 (발산)',200,36,{size:19,w:700,color:col});
    // r의 자리: 수열은 −1 < r ≤ 1, 급수는 −1 < r < 1
    const RX=v=>70+(v+1.5)/3*380,bg='#0B1724';
    poly(c,[[RX(-1.5),462],[RX(1.5),462]],C.dim,1.5);[-1,0,1].forEach(v=>poly(c,[[RX(v),456],[RX(v),468]],C.muted,2));
    label(c,'−1',RX(-1),444,C.muted,{size:15});label(c,'1',RX(1),444,C.muted,{size:15});
    poly(c,[[RX(-1),486],[RX(1),486]],GRN,6,{alpha:.55});dot(c,RX(-1),486,6,bg,{stroke:GRN,lw:2});dot(c,RX(1),486,6,GRN);
    poly(c,[[RX(-1),510],[RX(1),510]],GRN,6,{alpha:.55});dot(c,RX(-1),510,6,bg,{stroke:GRN,lw:2});dot(c,RX(1),510,6,bg,{stroke:GRN,lw:2});
    T(c,'수열',458,486,{size:16,color:C.muted});T(c,'급수',458,510,{size:16,color:C.muted});
    dot(c,RX(clamp(r,-1.5,1.5)),462,8,K,{glow:12});
    // 오른쪽: 4 + 2 + 1 + … → 8
    const m=1+Math.floor(seg(t,.5,7)*7.999),cx=700,cy=225;
    T(c,'변의 중점을 이으면 넓이가 반 → 공비 1/2',cx,46,{size:17,align:'center',color:C.muted});
    for(let j=0;j<m;j++){const s=220/Math.pow(Math.SQRT2,j),pts=[];for(let q=0;q<4;q++){const b=j*Math.PI/4+Math.PI/4+q*Math.PI/2;pts.push([cx+Math.cos(b)*s/Math.SQRT2,cy+Math.sin(b)*s/Math.SQRT2]);}
      poly(c,pts,j===m-1?C.text:K,j===m-1?3:2,{close:true,fill:'rgba(255,122,138,'+(j%2?.10:.18)+')'});}
    const BX=v=>520+v*50,BY=430;let Sm=0;box(c,BX(0),BY-10,400,20,4,'rgba(255,255,255,.05)',C.line,1);
    for(let j=0;j<m;j++){const ar=4/Math.pow(2,j);box(c,BX(Sm)+1,BY-9,Math.max(1,ar*50-2),18,3,j%2?'rgba(255,122,138,.55)':K,null);Sm+=ar;}
    poly(c,[[BX(8),BY-22],[BX(8),BY+22]],C.text,2,{dash:[3,3]});label(c,'8',BX(8),BY-34,C.text,{size:16});
    F(c,'S_'+m+' = '+nf(Sm,3),520,394,{size:22,color:K});
    F(c,'S = 4 + 2 + 1 + 1/2 + …',520,472,{size:21});F(c,'= 4 / (1 − 1/2) = 8',520,506,{size:21,color:G});
  }});

/* ───────── Ⅲ-2 합성함수의 미분 ───────── */
S.push({u:2,ch:'여러 가지 미분법',title:'합성함수 미분 — 겉 미분 × 속 미분',file:'08-diff-methods.html',
  sub:'x를 조금 움직이면 속 u = x²가 2x배로 늘고, 그 변화가 겉 y = sin u에서 다시 cos u배가 됩니다. 두 배율이 곱해져 dy/dx = cos(x²) · 2x입니다.',
  fx:[{f:'{f(g(x))}′ = f′(g(x)) · g′(x)',n:'겉 미분(속은 그대로) × 속 미분'},{f:'dy/dx = (dy/du) · (du/dx)',n:'변화율이 사슬처럼 곱해진다'},{f:'(f^{−1})′(b) = 1 / f′(a)',n:'b = f(a) · 역함수의 기울기는 역수'}],
  pts:['y = sin(x<sup>2</sup>) → 겉 sin을 미분해 cos(x<sup>2</sup>), 속 x<sup>2</sup>을 미분해 2x → <em>y′ = 2x cos(x<sup>2</sup>)</em>.','속을 미분하지 않으면 (e<sup>2x</sup>)′을 e<sup>2x</sup>로 쓰게 됩니다. 맞는 값은 <em>2e<sup>2x</sup></em>.','cos(x<sup>2</sup>)가 음수가 되면 늘어난 폭이 <em>뒤집혀</em> 기울기도 음수가 됩니다.','역함수: f(2) = 5, f′(2) = 4면 (f<sup>−1</sup>)′(5) = <em>1/4</em> (1/f′(5) ✕).'],
  dur:16,still:.13,
  draw(c,t){
    const x=.95+.55*Math.sin(TAU*t/9),dx=.16,u1=x*x,u2=(x+dx)**2,y1=Math.sin(u1),y2=Math.sin(u2),K=C.u3,G=C.u1,CY=C.u2;
    const L=v=>120+v*150,Ly=v=>270+v*150,Y0=[118,268,418];
    poly(c,[[L(0),Y0[0]],[L(2),Y0[0]]],C.dim,2);poly(c,[[L(0),Y0[1]],[L(4),Y0[1]]],C.dim,2);poly(c,[[Ly(-1),Y0[2]],[Ly(1),Y0[2]]],C.dim,2);
    [0,1,2].forEach(v=>poly(c,[[L(v),Y0[0]-6],[L(v),Y0[0]+6]],C.dim,2));[0,1,2,3,4].forEach(v=>poly(c,[[L(v),Y0[1]-6],[L(v),Y0[1]+6]],C.dim,2));
    [-1,0,1].forEach(v=>poly(c,[[Ly(v),Y0[2]-(v?6:10)],[Ly(v),Y0[2]+(v?6:10)]],C.dim,2));
    poly(c,[[L(x),Y0[0]+8],[L(x+dx),Y0[0]+8],[L(u2),Y0[1]-8],[L(u1),Y0[1]-8]],null,0,{fill:'rgba(244,181,68,.22)',close:true});
    poly(c,[[L(u1),Y0[1]+8],[L(u2),Y0[1]+8],[Ly(y2),Y0[2]-8],[Ly(y1),Y0[2]-8]],null,0,{fill:'rgba(255,122,138,.22)',close:true});
    arrow(c,L(x),Y0[0],L(x+dx),Y0[0],CY,6,10);arrow(c,L(u1),Y0[1],L(u2),Y0[1],G,6,10);arrow(c,Ly(y1),Y0[2],Ly(y2),Y0[2],K,6,10);
    F(c,'x',100,Y0[0],{size:22,color:CY,align:'right'});F(c,'u = x^2',100,Y0[1],{size:20,color:G,align:'right'});F(c,'y = sin u',100,Y0[2],{size:20,color:K,align:'right'});
    T(c,'속을 미분',760,176,{size:16,color:C.muted});F(c,'× 2x = '+(2*x).toFixed(2),760,204,{size:22,color:G});
    T(c,'겉을 미분',760,326,{size:16,color:C.muted});F(c,'× cos u = '+Math.cos(u1).toFixed(2),760,354,{size:22,color:K});
    F(c,'y = sin(x^2)',120,46,{size:26});F(c,'x = '+x.toFixed(2),330,46,{size:24,color:CY});
    F(c,'dy/dx = cos(x^2) · 2x = '+(2*x*Math.cos(u1)).toFixed(2),480,492,{size:24,align:'center'});
  }});

/* ───────── Ⅲ-3 오목·볼록과 변곡점 ───────── */
S.push({u:2,ch:'여러 가지 미분법',title:'오목·볼록과 변곡점 — f″의 부호',file:'08-diff-methods.html',
  sub:'접선의 기울기 f′이 줄어드는 동안 곡선은 위로 볼록(f″ < 0), 늘어나는 동안 아래로 볼록(f″ > 0)입니다. f″의 부호가 바뀌는 점이 변곡점입니다.',
  fx:[{f:'f″(x) > 0 → 아래로 볼록',n:'접선이 곡선 아래 · 물이 고이는 모양'},{f:'f″(x) < 0 → 위로 볼록',n:'접선이 곡선 위'},{w:1,f:'변곡점: f″의 부호가 바뀌는 점',n:'f″(c) = 0만으로는 부족 (x⁴은 변곡점이 아니다)'}],
  pts:['f′의 그래프가 오르는 구간에서 f는 아래로 볼록, 내리는 구간에서 위로 볼록입니다. <em>f′의 극점 = f의 변곡점 후보</em>.','f″(c) = 0만으로는 변곡점이 아닙니다. x<sup>4</sup>은 f″(0) = 0이지만 부호가 안 바뀌어 변곡점이 아닙니다.','y = e<sup>x</sup>는 아래로 볼록, y = ln x는 위로 볼록(f″ = −1/x<sup>2</sup> &lt; 0)입니다.','x e<sup>−x</sup>: f″ = e<sup>−x</sup>(x − 2) → x = 2에서 부호가 바뀌어 변곡점 <em>(2, 2/e<sup>2</sup>)</em>.'],
  dur:16,still:5,
  draw(c,t){
    const K=C.u3,P1=PL(70,60,600,250,-.3,TAU+.3,-1.4,1.4),P2=PL(70,350,600,150,-.3,TAU+.3,-1.3,1.3),pi=Math.PI;
    const fill=(a,b,col)=>{const pts=[[P2.X(a),P2.Y(0)]];for(let i=0;i<=50;i++){const x=a+(b-a)*i/50;pts.push([P2.X(x),P2.Y(-Math.sin(x))]);}pts.push([P2.X(b),P2.Y(0)]);
      poly(c,pts,null,0,{fill:col,close:true});};
    fill(-.3,0,'rgba(123,224,127,.16)');fill(0,pi,'rgba(255,122,138,.16)');fill(pi,TAU,'rgba(123,224,127,.16)');fill(TAU,TAU+.3,'rgba(255,122,138,.16)');
    AX(c,P1,'','');AX(c,P2,'','');
    [[-.3,0,GRN],[0,pi,PINK],[pi,TAU,GRN],[TAU,TAU+.3,PINK]].forEach(([a,b,col])=>FN(c,P1,Math.sin,a,b,col,3.5));
    FN(c,P2,x=>-Math.sin(x),-.3,TAU+.3,K,3);
    [0,pi,TAU].forEach(v=>{poly(c,[[P1.X(v),P1.Y(0)],[P1.X(v),P2.Y(0)]],C.dim,1.2,{dash:[4,5]});dot(c,P1.X(v),P1.Y(0),6,C.text);});
    T(c,'위로 볼록',P1.X(pi/2),P1.Y(1)-22,{size:18,align:'center',w:700,color:PINK});T(c,'아래로 볼록',P1.X(1.5*pi),P1.Y(-1)+26,{size:18,align:'center',w:700,color:GRN});
    T(c,'변곡점',P1.X(pi)+12,P1.Y(0)-20,{size:17,w:700});
    T(c,'−',P2.X(pi/2),P2.Y(-.55),{size:28,align:'center',w:700,color:PINK});T(c,'+',P2.X(1.5*pi),P2.Y(.55),{size:28,align:'center',w:700,color:GRN});
    label(c,'π',P2.X(pi)+12,P2.Y(0)+18,C.muted,{size:16});label(c,'2π',P2.X(TAU)+16,P2.Y(0)+18,C.muted,{size:16});
    // 움직이는 접선: 곡선 위(위로 볼록)인지 아래(아래로 볼록)인지
    const xs=.2+(TAU-.4)*ease(seg(t%8,.3,7.3)),d2=-Math.sin(xs),col=d2<-.03?PINK:d2>.03?GRN:C.text;
    FN(c,P1,x=>Math.sin(xs)+Math.cos(xs)*(x-xs),xs-.9,xs+.9,col,3);dot(c,P1.X(xs),P1.Y(Math.sin(xs)),7,col,{glow:14});
    poly(c,[[P1.X(xs),P1.Y(Math.sin(xs))],[P2.X(xs),P2.Y(d2)]],C.muted,1.2,{dash:[2,4]});dot(c,P2.X(xs),P2.Y(d2),6,col,{glow:12});
    // 오른쪽
    F(c,'f(x) = sin x',700,80,{size:22});
    T(c,d2<-.03?'위로 볼록 · f″ < 0':d2>.03?'아래로 볼록 · f″ > 0':'변곡점 · f″ = 0',700,150,{size:20,w:700,color:col});
    T(c,'기울기 f′ 감소 → 위로 볼록',700,200,{size:16,color:C.muted});T(c,'기울기 f′ 증가 → 아래로 볼록',700,230,{size:16,color:C.muted});
    F(c,'f″(x) = −sin x',700,380,{size:20,color:K});
  }});

/* ───────── Ⅲ-4 구분구적법 ───────── */
S.push({u:2,ch:'여러 가지 적분법',title:'구분구적법 — 급수를 정적분으로',file:'09-int-methods.html',
  sub:'[0, 1]을 n등분한 직사각형의 높이는 f(k/n), 너비는 1/n입니다. n → ∞이면 합 Σ f(k/n) · 1/n이 넓이 ∫₀¹ f(x) dx로 다가갑니다.',
  fx:[{f:'lim_{n→∞} Σ_{k=1}^n f(k/n) · 1/n = ∫_0^1 f(x) dx',n:'k/n → x, 1/n → dx, lim Σ → ∫₀¹'},{f:'lim Σ k^2/n^3 = ∫_0^1 x^2 dx = 1/3',n:'(k/n)² · (1/n)로 쪼개 읽기'},{f:'Σ f(a + k(b − a)/n) · (b − a)/n',n:'구간이 [a, b]이면 너비는 (b − a)/n'}],
  pts:['번역 순서: <em>1/n을 먼저 떼어 낸다</em> → 남은 것이 f(k/n)인지 확인 → k/n을 x로, 1/n을 dx로.','1/n을 빼먹으면 합이 n배 커진 채 극한을 구하게 됩니다.','왼쪽 끝(k = 0 ~ n − 1)으로 세워도 연속함수면 같은 정적분입니다.','√(n + k)/n<sup>3/2</sup> = (1/n)√(1 + k/n) → ∫<sub>0</sub><sup>1</sup> √(1 + x) dx.'],
  dur:16,still:13,
  draw(c,t){
    const ns=[2,4,8,16,32,64],n=ns[clamp(Math.floor((t-.4)/1.8),0,5)],f=x=>x*x,K=C.u3,G=C.u1,CY=C.u2;
    const P=PL(70,60,470,420,-.08,1.15,-.06,1.12),X=P.X,Y=P.Y,hk=Math.max(1,Math.round(n*.7)),h0=f(hk/n);
    let sum=0;for(let k=1;k<=n;k++){const h=f(k/n),on=k===hk;sum+=h/n; // 오른쪽 끝 높이 f(k/n), 너비 1/n
      box(c,X((k-1)/n),Y(h),X(k/n)-X((k-1)/n),Y(0)-Y(h),0,on?'rgba(244,181,68,.5)':'rgba(255,122,138,.26)',on?G:K,on?2:1);}
    AX(c,P,'x','');FN(c,P,f,0,1.08,C.text,3.5);
    poly(c,[[X(1),Y(0)],[X(1),Y(1)]],C.dim,1.2,{dash:[4,4]});label(c,'1',X(1),Y(0)+18,C.muted,{size:15});
    const xa=X((hk-1)/n),xb=X(hk/n);
    poly(c,[[xa,Y(h0)-14],[xa,Y(h0)-8],[xb,Y(h0)-8],[xb,Y(h0)-14]],G,2);FB(c,'1/n',(xa+xb)/2,Y(h0)-30,{size:19,color:G,align:'center'});
    FB(c,'(k/n)^2',xa-12,Y(h0),{size:18,align:'right'});F(c,'k/n',xb,Y(0)+20,{size:18,color:CY,align:'center'});
    // 오른쪽: 합 → 번역 → 정적분
    F(c,'n = '+n,600,80,{size:28,color:K});
    F(c,'Σ_{k=1}^n (k/n)^2 · 1/n = '+sum.toFixed(3),600,136,{size:21});
    F(c,'k/n  →  x',600,234,{size:24,color:CY});F(c,'1/n  →  dx',600,280,{size:24,color:G});F(c,'lim Σ  →  ∫_0^1',600,326,{size:24,color:K});
    F(c,'∫_0^1 x^2 dx = 1/3 ≈ 0.333',600,420,{size:22,color:GRN,alpha:seg(t,10,11)});
  }});

/* ───────── Ⅲ-5 단면으로 구하는 부피 ───────── */
S.push({u:2,ch:'여러 가지 적분법',title:'단면으로 부피 — 넓이 S(x)를 쌓기',file:'09-int-methods.html',
  sub:'x축에 수직인 단면의 넓이 S(x)를 알면 얇은 조각 S(x) · Δx를 쌓아 부피를 구합니다. 넓이를 적분하면 부피, V = ∫ S(x) dx입니다.',
  fx:[{f:'V = ∫_a^b S(x) dx',n:'S(x): x에서 x축에 수직으로 자른 단면의 넓이'},{f:'S(x) = (√x)^2 = x',n:'그림: 밑면 0 ≤ y ≤ √x, 한 변 √x인 정사각형 단면'},{f:'V = ∫_0^1 x dx = 1/2',n:'π는 원·반원 단면에만 붙인다'}],
  pts:['먼저 적을 두 가지: 단면이 <em>어느 축에 수직</em>인지, 단면이 <em>어떤 모양</em>(정사각형·정삼각형·반원)인지.','한 변 s(x)인 정삼각형 단면이면 S(x) = (√3/4)s(x)<sup>2</sup>, 지름 s(x)인 반원이면 πs(x)<sup>2</sup>/8.','곡선을 축 둘레로 돌린 회전체의 부피는 2015 개정 미적분 범위 밖입니다. 문제가 알려 주는 단면에서 넓이를 구해 적분합니다.'],
  dur:16,still:12.5,
  draw(c,t){
    const K=C.u3,G=C.u1,pr=(x,y,z)=>[110+330*x+110*y,440-230*z-80*y],xc=seg(t,.5,9); // 비스듬히 본 입체: x 오른쪽, y 안쪽, z 위
    const slab=(x,fill,stroke,lw)=>{const s=Math.sqrt(x);poly(c,[pr(x,0,0),pr(x,s,0),pr(x,s,s),pr(x,0,s)],stroke,lw,{close:true,fill});};
    const edge=(g,col,w,o)=>{const pts=[];for(let i=0;i<=60;i++){const x=i/60;pts.push(g(x,Math.sqrt(x)));}poly(c,pts,col,w,o);};
    arrow(c,...pr(-.05,0,0),...pr(1.18,0,0),C.dim,1.6,9);F(c,'x',pr(1.18,0,0)[0]+4,pr(1.18,0,0)[1]+18,{size:18,color:C.muted});
    edge((x,s)=>pr(x,s,0),C.muted,2.5);F(c,'y = √x',pr(1,1,0)[0]+12,pr(1,1,0)[1],{size:19,color:C.muted});
    edge((x,s)=>pr(x,0,s),C.dim,1.5,{dash:[4,4]});edge((x,s)=>pr(x,s,s),C.dim,1.5,{dash:[4,4]});slab(1,null,C.dim,1.5);
    for(let k=1;k<=12;k++){const x=k/12;if(x>xc+1e-9)break;slab(x,'rgba(255,122,138,.16)',K,1.2);}
    if(xc>.004)slab(xc,'rgba(244,181,68,.5)',G,2.5);
    F(c,'단면의 넓이 S(x) = (√x)^2 = x',60,56,{size:21,color:G});
    // 오른쪽: S(x) 그래프 아래 넓이 = 지금까지 쌓인 부피
    const Q=PL(660,130,250,250,0,1.1,0,1.1);
    poly(c,[[Q.X(0),Q.Y(0)],[Q.X(xc),Q.Y(xc)],[Q.X(xc),Q.Y(0)]],null,0,{fill:'rgba(244,181,68,.32)',close:true});
    AX(c,Q,'x','S');FN(c,Q,x=>x,0,1.05,G,3.5);poly(c,[[Q.X(1),Q.Y(0)],[Q.X(1),Q.Y(1)]],C.dim,1.2,{dash:[4,4]});label(c,'1',Q.X(1),Q.Y(0)+18,C.muted,{size:15});
    T(c,'S(x) 아래 넓이 = 쌓인 부피',660,96,{size:17,color:C.muted});
    F(c,'V(x) = x^2/2 = '+(xc*xc/2).toFixed(3),660,442,{size:22,color:G});
    F(c,'V = ∫_0^1 x dx = 1/2',660,488,{size:24,color:GRN,alpha:seg(t,9.5,10.5)});
  }});
