/* 한국사 모션 노트 — 직접 그린 유물·건축·인물·사건 그림(캔버스 도형) + 그림 장면 템플릿(gallery·tree).
   hist-engine.js 뒤에 붙는다. 모든 그림은 실제 유물 사진을 옮긴 것이 아니라 생김새의 특징만 단순하게 그린 약화(略畫)다.
   PIC[key](c, x, y, s): (x,y)를 중심으로 한 변 s 크기 안에 그린다. */
const PIC={};
const STONE='#9AA7B4',BRONZE='#C9925A',GOLD='#F2C14E',JADE='#8FD3B6',WHITE='#EEF2F5',WOOD='#B07A4A',INK='#1B2A3A',RED='#E25D5D',BLUE='#4C7BD9';
function pth(c,pts,fill,stroke,lw=2){c.save();c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();
  if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.lineJoin='round';c.stroke();}c.restore();}
function rr(c,x,y,w,h,r,fill,stroke,lw=2){box(c,x,y,w,h,r,fill,stroke,lw);}
function ln(c,x1,y1,x2,y2,col,lw=2){c.save();c.strokeStyle=col;c.lineWidth=lw;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.restore();}
function ell(c,x,y,rx,ry,fill,stroke,lw=2,a0=0,a1=TAU){c.save();c.beginPath();c.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),0,a0,a1);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}c.restore();}
function roof(c,x,y,w,h,col){pth(c,[[x-w/2-8,y+h],[x-w/2+6,y],[x+w/2-6,y],[x+w/2+8,y+h],[x+w/2-2,y+h-4],[x-w/2+2,y+h-4]],col,'#0B1622',1.5);}
const P_=(s,k)=>s*k;

/* ── 선사·고조선 ── */
PIC.jumeok=(c,x,y,s)=>{const k=s/100;pth(c,[[x,y-44*k],[x+24*k,y-10*k],[x+30*k,y+22*k],[x+14*k,y+42*k],[x-14*k,y+42*k],[x-30*k,y+22*k],[x-24*k,y-10*k]],STONE,'#5E6B78',2);
  [[-12,-20,4,-4],[10,-14,-2,6],[-18,10,-2,22],[14,14,4,30],[-6,0,8,10]].forEach(a=>ln(c,x+a[0]*k,y+a[1]*k,x+a[2]*k,y+a[3]*k,'#6F7C8A',1.6));};
PIC.bitsal=(c,x,y,s)=>{const k=s/100;pth(c,[[x-32*k,y-38*k],[x+32*k,y-38*k],[x+24*k,y+10*k],[x,y+46*k],[x-24*k,y+10*k]],'#B88A63','#6E4B2E',2);
  for(let r=0;r<4;r++){const yy=y+(-30+r*14)*k,hw=(30-r*6)*k;for(let i=-3;i<=3;i++){const xx=x+i*hw/3.4;ln(c,xx-4*k,yy-4*k,xx+(r%2?4:-4)*k,yy+5*k,'#6E4B2E',1.4);}}};
PIC.bandal=(c,x,y,s)=>{const k=s/100;c.save();c.beginPath();c.moveTo(x-42*k,y+10*k);c.quadraticCurveTo(x,y-46*k,x+42*k,y+10*k);c.closePath();c.fillStyle=STONE;c.fill();c.strokeStyle='#5E6B78';c.lineWidth=2;c.stroke();c.restore();
  dot(c,x-9*k,y-6*k,4*k,'#0E1B2A');dot(c,x+9*k,y-6*k,4*k,'#0E1B2A');ln(c,x-38*k,y+10*k,x+38*k,y+10*k,'#DDE3E8',2);};
PIC.bipa=(c,x,y,s)=>{const k=s/100;c.save();c.beginPath();c.moveTo(x,y-46*k);c.quadraticCurveTo(x+8*k,y-20*k,x+6*k,y-8*k);c.quadraticCurveTo(x+18*k,y+6*k,x+10*k,y+22*k);c.lineTo(x-10*k,y+22*k);
  c.quadraticCurveTo(x-18*k,y+6*k,x-6*k,y-8*k);c.quadraticCurveTo(x-8*k,y-20*k,x,y-46*k);c.fillStyle=BRONZE;c.fill();c.strokeStyle='#7A5530';c.lineWidth=2;c.stroke();c.restore();
  ln(c,x,y-40*k,x,y+20*k,'#E7B98A',1.5);rr(c,x-5*k,y+22*k,10*k,22*k,3,'#6B4A2C');};
PIC.goindol=(c,x,y,s)=>{const k=s/100;rr(c,x-30*k,y-6*k,12*k,40*k,3,'#8C98A5','#5E6B78');rr(c,x+18*k,y-6*k,12*k,40*k,3,'#8C98A5','#5E6B78');
  pth(c,[[x-46*k,y-8*k],[x-36*k,y-24*k],[x+40*k,y-26*k],[x+48*k,y-10*k],[x+30*k,y-4*k],[x-34*k,y-4*k]],STONE,'#5E6B78',2);ln(c,x-48*k,y+36*k,x+48*k,y+36*k,'#4F6B57',3);};
PIC.sehyeong=(c,x,y,s)=>{const k=s/100;pth(c,[[x,y-46*k],[x+6*k,y-30*k],[x+6*k,y+20*k],[x-6*k,y+20*k],[x-6*k,y-30*k]],BRONZE,'#7A5530',2);ln(c,x,y-40*k,x,y+18*k,'#E7B98A',1.5);
  rr(c,x-12*k,y+20*k,24*k,6*k,2,'#7A5530');rr(c,x-4*k,y+26*k,8*k,18*k,3,'#6B4A2C');};
/* ── 삼국 ── */
PIC.chilji=(c,x,y,s)=>{const k=s/100;ln(c,x,y+44*k,x,y-46*k,'#AEB8C2',6*k);
  [-26,-6,14].forEach((yy,i)=>{ln(c,x,y+yy*k,x-18*k,y+(yy-14)*k,'#AEB8C2',4*k);ln(c,x,y+(yy+8)*k,x+18*k,y+(yy-6)*k,'#AEB8C2',4*k);});rr(c,x-5*k,y+34*k,10*k,14*k,2,'#6B4A2C');};
PIC.stele=(c,x,y,s,txt)=>{const k=s/100;pth(c,[[x-20*k,y-44*k],[x+16*k,y-46*k],[x+22*k,y+40*k],[x-24*k,y+42*k]],'#9C9283','#6A6255',2);
  for(let i=0;i<4;i++)for(let j=0;j<6;j++)rr(c,x+(-14+i*8)*k,y+(-34+j*12)*k,4*k,8*k,1,'#5B5348');if(txt)T(c,txt,x,y+50*k,{size:10,align:'center',color:C.dim});};
PIC.hyangno=(c,x,y,s)=>{const k=s/100;ell(c,x,y+8*k,26*k,14*k,GOLD,'#8A6A20');pth(c,[[x-26*k,y+2*k],[x-20*k,y-18*k],[x-10*k,y-28*k],[x,y-24*k],[x+10*k,y-30*k],[x+20*k,y-18*k],[x+26*k,y+2*k]],'#E2B34A','#8A6A20',2);
  [[-14,-14],[0,-16],[14,-12],[-6,-4],[8,-4]].forEach(p=>ell(c,x+p[0]*k,y+p[1]*k,5*k,4*k,null,'#8A6A20',1.2));pth(c,[[x-4*k,y-28*k],[x,y-44*k],[x+10*k,y-38*k],[x+3*k,y-30*k]],'#F2C14E','#8A6A20',1.5);
  ln(c,x,y+22*k,x,y+34*k,'#8A6A20',5*k);ell(c,x,y+40*k,22*k,6*k,'#C99A3A','#8A6A20');};
PIC.brickTomb=(c,x,y,s)=>{const k=s/100;c.save();c.beginPath();c.moveTo(x-40*k,y+36*k);c.lineTo(x-40*k,y-4*k);c.arc(x,y-4*k,40*k,Math.PI,0);c.lineTo(x+40*k,y+36*k);c.closePath();c.fillStyle='#A8714E';c.fill();c.strokeStyle='#6B4430';c.lineWidth=2;c.stroke();c.restore();
  for(let r=0;r<5;r++)for(let i=0;i<5;i++){const bx=x+(-36+i*16+(r%2)*8)*k,by=y+(28-r*10)*k;if(Math.abs(bx-x)<36*k)rr(c,bx-6*k,by-3*k,12*k,6*k,1,null,'#6B4430',1);}
  c.save();c.beginPath();c.moveTo(x-14*k,y+36*k);c.lineTo(x-14*k,y+12*k);c.arc(x,y+12*k,14*k,Math.PI,0);c.lineTo(x+14*k,y+36*k);c.closePath();c.fillStyle='#1A1410';c.fill();c.restore();};
PIC.geumgwan=(c,x,y,s,t=0)=>{const k=s/100;rr(c,x-38*k,y+14*k,76*k,12*k,3,GOLD,'#8A6A20');
  [-26,0,26].forEach(dx=>{ln(c,x+dx*k,y+14*k,x+dx*k,y-38*k,GOLD,5*k);[-24,-10,4].forEach(dy=>{ln(c,x+dx*k,y+dy*k,x+(dx-8)*k,y+(dy-8)*k,GOLD,3.5*k);ln(c,x+dx*k,y+dy*k,x+(dx+8)*k,y+(dy-8)*k,GOLD,3.5*k);});});
  for(let i=0;i<9;i++){const xx=x+(-34+i*8.5)*k,sw=Math.sin(t*3+i)*2*k;dot(c,xx+sw,y+30*k,2.6*k,'#FFE08A');}
  [-38,38].forEach(dx=>{ln(c,x+dx*k,y+26*k,x+dx*k,y+46*k,GOLD,2);dot(c,x+dx*k,y+46*k,4*k,JADE);});};
PIC.cheomseong=(c,x,y,s)=>{const k=s/100;c.save();c.beginPath();c.moveTo(x-30*k,y+44*k);c.quadraticCurveTo(x-28*k,y-10*k,x-16*k,y-30*k);c.lineTo(x+16*k,y-30*k);c.quadraticCurveTo(x+28*k,y-10*k,x+30*k,y+44*k);c.closePath();
  c.fillStyle='#C9B38F';c.fill();c.strokeStyle='#7E6A4C';c.lineWidth=2;c.stroke();c.restore();for(let r=0;r<9;r++){const yy=y+(40-r*8)*k;ln(c,x-28*k+r*1.4*k,yy,x+28*k-r*1.4*k,yy,'#9C8763',1);}
  rr(c,x-7*k,y-6*k,14*k,14*k,1,'#1A1410');rr(c,x-20*k,y-40*k,40*k,6*k,1,'#B09A75','#7E6A4C',1.5);rr(c,x-20*k,y-34*k,40*k,4*k,1,'#B09A75','#7E6A4C',1.5);rr(c,x-34*k,y+42*k,68*k,6*k,1,'#9C8763');};
PIC.pagoda=(c,x,y,s,floors=3)=>{const k=s/100,n=floors;rr(c,x-34*k,y+32*k,68*k,12*k,1,'#B9B2A6','#7C756A',1.5);
  for(let i=0;i<n;i++){const w=(44-i*8)*k,h=(16-i*2)*k,yy=y+(32-(i+1)*24)*k;rr(c,x-w/2+4*k,yy+6*k,w-8*k,h,1,'#CFC8BC','#7C756A',1.5);pth(c,[[x-w/2-6*k,yy+6*k],[x-w/2,yy],[x+w/2,yy],[x+w/2+6*k,yy+6*k]],'#B9B2A6','#7C756A',1.5);}
  ln(c,x,y+(32-n*24)*k,x,y+(32-n*24-14)*k,'#7C756A',3);};
PIC.seokguram=(c,x,y,s)=>{const k=s/100;ell(c,x,y+12*k,46*k,40*k,'#1A2734','#5E738B',2,Math.PI,TAU);rr(c,x-46*k,y+12*k,92*k,30*k,2,'#1A2734','#5E738B');
  ell(c,x,y-2*k,9*k,10*k,'#E6E0D2');ell(c,x,y+20*k,20*k,16*k,'#E6E0D2');ell(c,x,y+34*k,26*k,7*k,'#D5CDBB');dot(c,x,y-14*k,3*k,'#E6E0D2');ell(c,x,y-2*k,18*k,18*k,null,'#F2C14E',1.5);};
PIC.bell=(c,x,y,s)=>{const k=s/100;c.save();c.beginPath();c.moveTo(x-22*k,y-30*k);c.quadraticCurveTo(x-30*k,y+10*k,x-34*k,y+36*k);c.lineTo(x+34*k,y+36*k);c.quadraticCurveTo(x+30*k,y+10*k,x+22*k,y-30*k);c.closePath();
  c.fillStyle='#6E8F7E';c.fill();c.strokeStyle='#3F5A4C';c.lineWidth=2;c.stroke();c.restore();ell(c,x,y-34*k,10*k,7*k,null,'#3F5A4C',3);ell(c,x,y+14*k,9*k,9*k,null,'#A9C9B5',1.6);
  ln(c,x-30*k,y+28*k,x+30*k,y+28*k,'#A9C9B5',1.5);ln(c,x-20*k,y-24*k,x+20*k,y-24*k,'#A9C9B5',1.5);};
PIC.lantern=(c,x,y,s)=>{const k=s/100;rr(c,x-22*k,y+34*k,44*k,10*k,2,'#A9A296','#6D675C');ln(c,x,y+34*k,x,y+6*k,'#A9A296',10*k);rr(c,x-18*k,y-2*k,36*k,8*k,2,'#A9A296','#6D675C');
  rr(c,x-14*k,y-22*k,28*k,20*k,2,'#A9A296','#6D675C');rr(c,x-6*k,y-18*k,12*k,12*k,1,'#F2C14E');pth(c,[[x-26*k,y-22*k],[x,y-40*k],[x+26*k,y-22*k]],'#A9A296','#6D675C',1.5);};
/* ── 고려 ── */
PIC.celadon=(c,x,y,s)=>{const k=s/100;c.save();c.beginPath();c.moveTo(x-8*k,y-44*k);c.lineTo(x+8*k,y-44*k);c.quadraticCurveTo(x+8*k,y-34*k,x+26*k,y-24*k);c.quadraticCurveTo(x+38*k,y-10*k,x+20*k,y+30*k);c.lineTo(x+16*k,y+44*k);
  c.lineTo(x-16*k,y+44*k);c.lineTo(x-20*k,y+30*k);c.quadraticCurveTo(x-38*k,y-10*k,x-26*k,y-24*k);c.quadraticCurveTo(x-8*k,y-34*k,x-8*k,y-44*k);c.fillStyle=JADE;c.fill();c.strokeStyle='#4E8C74';c.lineWidth=2;c.stroke();c.restore();
  [[-14,-12],[8,-4],[-4,12],[12,18]].forEach(p=>{const xx=x+p[0]*k,yy=y+p[1]*k;ln(c,xx-5*k,yy-2*k,xx,yy+2*k,WHITE,1.6);ln(c,xx,yy+2*k,xx+5*k,yy-2*k,WHITE,1.6);});ell(c,x+2*k,y-20*k,9*k,4*k,null,WHITE,1.2);};
PIC.woodblock=(c,x,y,s)=>{const k=s/100;for(let i=0;i<3;i++){const ox=(i-1)*10*k,oy=(i-1)*-8*k;rr(c,x-30*k+ox,y-22*k+oy,60*k,44*k,2,i===2?'#C8955E':'#A87A48','#6B4A2C');
  rr(c,x-38*k+ox,y-22*k+oy,8*k,44*k,2,'#7A5530');rr(c,x+30*k+ox,y-22*k+oy,8*k,44*k,2,'#7A5530');}for(let r=0;r<4;r++)for(let j=0;j<6;j++)rr(c,x+(-14+j*7)*k,y+(-24+r*9)*k,4*k,5*k,1,'#6B4A2C');};
PIC.jikji=(c,x,y,s)=>{const k=s/100;rr(c,x-34*k,y-36*k,50*k,66*k,3,'#D9C59A','#8A7550');ln(c,x-28*k,y-36*k,x-28*k,y+30*k,'#8A7550',1.5);
  for(let i=0;i<4;i++)ln(c,x+(-18+i*9)*k,y-28*k,x+(-18+i*9)*k,y+22*k,'#5B4A2E',1.2);for(let i=0;i<3;i++)for(let j=0;j<2;j++)rr(c,x+(20+j*10)*k,y+(10+i*10)*k,8*k,8*k,1,'#9AA7B4','#5E6B78',1);
  T(c,'直指',x-9*k,y-46*k,{size:12*k,align:'center',color:C.muted,w:700});};
PIC.hall=(c,x,y,s)=>{const k=s/100;rr(c,x-44*k,y+30*k,88*k,10*k,1,'#9C8C76');for(let i=0;i<5;i++)rr(c,x+(-36+i*17.5)*k,y-6*k,5*k,36*k,1,'#A0442E');
  rr(c,x-40*k,y-12*k,80*k,8*k,1,'#3C6E5A');roof(c,x,y-36*k,76*k,24*k,'#4A5A66');};
/* ── 조선 ── */
PIC.hunmin=(c,x,y,s)=>{const k=s/100;rr(c,x-44*k,y-30*k,42*k,60*k,2,'#EFE3C2','#8A7550');rr(c,x+2*k,y-30*k,42*k,60*k,2,'#EFE3C2','#8A7550');
  const L=['ㄱ','ㄴ','ㅁ','ㅅ','ㅇ','ㆍ','ㅡ','ㅣ'];L.forEach((ch,i)=>T(c,ch,x+(i<4?-23:23)*k+((i%2)?8:-8)*k,y+(-14+Math.floor((i%4)/2)*24)*k,{size:15*k,align:'center',w:700,color:INK}));};
PIC.rain=(c,x,y,s,t=0)=>{const k=s/100;rr(c,x-26*k,y+18*k,52*k,24*k,2,'#B9B2A6','#7C756A');rr(c,x-14*k,y-36*k,28*k,54*k,3,'#7FA6C9','#3F6788');
  for(let i=0;i<5;i++)ln(c,x-14*k,y+(-26+i*10)*k,x-6*k,y+(-26+i*10)*k,'#DDE7F0',1.2);for(let i=0;i<4;i++){const yy=y+((t*60+i*20)%40-48)*k;ln(c,x+(-10+i*6)*k,yy,x+(-12+i*6)*k,yy+6*k,'#8FC6FF',1.5);}};
PIC.angbu=(c,x,y,s)=>{const k=s/100;ell(c,x,y-4*k,38*k,30*k,'#C9925A','#7A5530',2,0,Math.PI);ln(c,x-38*k,y-4*k,x+38*k,y-4*k,'#7A5530',3);
  for(let i=1;i<6;i++){const a=Math.PI*i/6;ln(c,x+Math.cos(a)*36*k,y-4*k+Math.sin(a)*28*k,x+Math.cos(a)*12*k,y-4*k+Math.sin(a)*8*k,'#7A5530',1);}
  ln(c,x,y-4*k,x+18*k,y-22*k,'#F2C14E',2.5);[-24,0,24].forEach(dx=>ln(c,x+dx*k,y+20*k,x+dx*1.3*k,y+42*k,'#7A5530',3));};
PIC.book=(c,x,y,s,txt='',col='#2F5F8F')=>{const k=s/100;rr(c,x-30*k,y-40*k,60*k,80*k,3,col,'#0B1622');ln(c,x-22*k,y-40*k,x-22*k,y+40*k,'#0B1622',1.5);
  rr(c,x-12*k,y-30*k,30*k,46*k,1,'#EFE3C2');String(txt).split('').slice(0,5).forEach((ch,i)=>T(c,ch,x+3*k,y+(-22+i*9.5)*k,{size:9*k,align:'center',w:700,color:INK}));};
PIC.turtle=(c,x,y,s,t=0)=>{const k=s/100,b=Math.sin(t*2)*2*k;pth(c,[[x-46*k,y+10*k+b],[x+40*k,y+10*k+b],[x+30*k,y+28*k+b],[x-38*k,y+28*k+b]],'#8A5A36','#4F311C',2);
  ell(c,x-2*k,y+10*k+b,38*k,20*k,'#3F6E5A','#20382E',2,Math.PI,TAU);for(let i=0;i<7;i++)for(let j=0;j<2;j++){const xx=x+(-28+i*9.5)*k,yy=y+(2-j*9)*k+b;ln(c,xx,yy,xx,yy-5*k,'#C9D3DC',1.5);}
  pth(c,[[x+36*k,y+6*k+b],[x+52*k,y-4*k+b],[x+48*k,y+12*k+b]],'#C9925A','#4F311C',1.5);for(let i=0;i<5;i++)ln(c,x+(-30+i*14)*k,y+28*k+b,x+(-34+i*14)*k,y+40*k+b,'#B07A4A',2);
  ln(c,x-50*k,y+34*k,x+54*k,y+34*k,'#3C7AA6',2);};
PIC.jar=(c,x,y,s)=>{const k=s/100;ell(c,x,y+2*k,40*k,38*k,WHITE,'#A8B4BF',2);rr(c,x-14*k,y-42*k,28*k,8*k,2,WHITE,'#A8B4BF');rr(c,x-12*k,y+36*k,24*k,6*k,2,'#DDE3E8');};
PIC.gate=(c,x,y,s)=>{const k=s/100;rr(c,x-46*k,y-2*k,92*k,40*k,2,'#B8AE9C','#6D6556');for(let i=0;i<9;i++)rr(c,x+(-46+i*10.5)*k,y-8*k,6*k,6*k,1,'#B8AE9C');
  c.save();c.beginPath();c.moveTo(x-12*k,y+38*k);c.lineTo(x-12*k,y+16*k);c.arc(x,y+16*k,12*k,Math.PI,0);c.lineTo(x+12*k,y+38*k);c.closePath();c.fillStyle='#1A1410';c.fill();c.restore();
  rr(c,x-28*k,y-22*k,56*k,14*k,1,'#A0442E');roof(c,x,y-40*k,58*k,18*k,'#4A5A66');};
PIC.crane=(c,x,y,s,t=0)=>{const k=s/100,lift=(Math.sin(t*1.6)+1)*8*k;ln(c,x-32*k,y+40*k,x-10*k,y-40*k,WOOD,4);ln(c,x+32*k,y+40*k,x+10*k,y-40*k,WOOD,4);ln(c,x-14*k,y-38*k,x+14*k,y-38*k,WOOD,5);
  dot(c,x,y-30*k,6*k,'#8A6A40',{stroke:'#4F311C',lw:1.5});dot(c,x,y-10*k,5*k,'#8A6A40',{stroke:'#4F311C',lw:1.5});ln(c,x,y-30*k,x,y+14*k-lift,'#DCC9A6',1.5);
  rr(c,x-12*k,y+14*k-lift,24*k,14*k,2,STONE,'#5E6B78');ln(c,x-6*k,y-30*k,x-40*k,y+10*k,'#DCC9A6',1.2);};
PIC.mapdoc=(c,x,y,s)=>{const k=s/100;for(let i=0;i<4;i++){rr(c,x+(-42+i*21)*k,y-34*k+(i%2)*4*k,20*k,68*k,1,i%2?'#E8DBB9':'#F1E6C8','#8A7550',1);}
  poly(c,[[x-30*k,y-24*k],[x-14*k,y-8*k],[x-20*k,y+8*k],[x+2*k,y+14*k],[x+12*k,y+28*k]],'#3C7AA6',2);poly(c,[[x-36*k,y+18*k],[x-10*k,y-20*k],[x+20*k,y-6*k],[x+36*k,y-26*k]],'#6B4A2C',1.6,{dash:[3,3]});
  [[-10,-20],[20,-6],[2,14]].forEach(p=>dot(c,x+p[0]*k,y+p[1]*k,2.5*k,RED));};
PIC.coin=(c,x,y,s)=>{const k=s/100;dot(c,x,y,40*k,'#B88A4A',{stroke:'#6E4B2E',lw:2});rr(c,x-10*k,y-10*k,20*k,20*k,1,'#0E1B2A','#6E4B2E',2);
  [['常',0,-24],['平',0,24],['通',24,0],['寶',-24,0]].forEach(a=>T(c,a[0],x+a[1]*k,y+a[2]*k,{size:13*k,align:'center',w:700,color:'#3A2814'}));};
PIC.frame=(c,x,y,s)=>{const k=s/100;rr(c,x-42*k,y-34*k,84*k,68*k,2,'#E8DBB9','#7A5530',3);dot(c,x-12*k,y-6*k,7*k,'#3A2814');rr(c,x-18*k,y,12*k,18*k,3,'#5B6B7A');dot(c,x+14*k,y-6*k,7*k,'#3A2814');rr(c,x+8*k,y,12*k,18*k,3,'#8A6A40');
  ln(c,x-6*k,y+6*k,x+8*k,y+4*k,'#3A2814',2);ell(c,x,y+24*k,30*k,4*k,null,'#A08A62',1);T(c,'풍속화',x,y+44*k,{size:10,align:'center',color:C.dim});};
/* ── 근대·일제·현대 ── */
PIC.cheokhwa=(c,x,y,s)=>{const k=s/100;rr(c,x-20*k,y-40*k,40*k,74*k,3,'#9C9283','#6A6255');pth(c,[[x-24*k,y-40*k],[x,y-50*k],[x+24*k,y-40*k]],'#7E7568','#6A6255',1.5);
  ['洋','夷','侵','犯'].forEach((ch,i)=>T(c,ch,x,y+(-28+i*14)*k,{size:11*k,align:'center',w:700,color:'#2B261F'}));rr(c,x-28*k,y+34*k,56*k,10*k,2,'#7E7568');};
PIC.taegeuk=(c,x,y,s,t=0)=>{const k=s/100,wv=t?Math.sin(t*2)*2*k:0;rr(c,x-46*k,y-31*k+wv,92*k,62*k,2,'#FAFAF7','#B9C2CC',1.5);
  c.save();c.translate(x,y+wv);c.rotate(Math.atan2(2,3));const r=15*k;c.beginPath();c.arc(0,0,r,Math.PI,0);c.arc(r/2,0,r/2,0,Math.PI,true);c.arc(-r/2,0,r/2,0,Math.PI);c.fillStyle='#CD2E3A';c.fill();
  c.beginPath();c.arc(0,0,r,0,Math.PI);c.arc(-r/2,0,r/2,Math.PI,0,true);c.arc(r/2,0,r/2,Math.PI,0);c.fillStyle='#0047A0';c.fill();c.restore();
  const tri=(cx,cy,ang,pat)=>{c.save();c.translate(cx,cy+wv);c.rotate(ang);pat.forEach((b,i)=>{const yy=(i-1)*5*k;if(b)rr(c,-9*k,yy-1.6*k,18*k,3.2*k,0,'#111');else{rr(c,-9*k,yy-1.6*k,8*k,3.2*k,0,'#111');rr(c,1*k,yy-1.6*k,8*k,3.2*k,0,'#111');}});c.restore();};
  const a=Math.atan2(2,3);tri(x-30*k,y-20*k,-a+Math.PI/2,[1,1,1]);tri(x+30*k,y+20*k,-a+Math.PI/2,[0,0,0]);tri(x+30*k,y-20*k,a+Math.PI/2,[0,1,0]);tri(x-30*k,y+20*k,a+Math.PI/2,[1,0,1]);};
PIC.arch=(c,x,y,s)=>{const k=s/100;rr(c,x-40*k,y-30*k,80*k,70*k,2,'#C9C2B5','#7C756A');rr(c,x-46*k,y-38*k,92*k,10*k,1,'#B4AC9E','#7C756A');
  c.save();c.beginPath();c.moveTo(x-16*k,y+40*k);c.lineTo(x-16*k,y+2*k);c.arc(x,y+2*k,16*k,Math.PI,0);c.lineTo(x+16*k,y+40*k);c.closePath();c.fillStyle='#1A1410';c.fill();c.restore();
  T(c,'獨立門',x,y-18*k,{size:10*k,align:'center',w:700,color:'#3A342B'});for(let r=0;r<5;r++)ln(c,x-40*k,y+(-6+r*10)*k,x-18*k,y+(-6+r*10)*k,'#9C9587',1);};
PIC.house=(c,x,y,s,col='#7B8FA3',flag)=>{const k=s/100;rr(c,x-36*k,y-10*k,72*k,48*k,2,col,'#3D4E5F');pth(c,[[x-42*k,y-8*k],[x,y-36*k],[x+42*k,y-8*k]],'#5A3E30','#2E1F17',1.5);
  for(let i=0;i<3;i++)rr(c,x+(-26+i*20)*k,y+2*k,12*k,12*k,1,'#F2D88A');rr(c,x-7*k,y+20*k,14*k,18*k,1,'#2E1F17');if(flag)PIC.taegeuk(c,x+38*k,y-40*k,26);};
PIC.tram=(c,x,y,s,t=0)=>{const k=s/100,dx=Math.sin(t)*4*k;rr(c,x-40*k+dx,y-18*k,80*k,40*k,6,'#C94A3A','#6E2A20');for(let i=0;i<4;i++)rr(c,x+(-32+i*17)*k+dx,y-10*k,12*k,12*k,2,'#F2E6C8');
  ln(c,x+dx,y-18*k,x+10*k+dx,y-40*k,'#2B2B2B',2);ln(c,x-50*k,y-42*k,x+50*k,y-42*k,'#5E738B',1.5);dot(c,x-24*k+dx,y+24*k,6*k,'#222');dot(c,x+24*k+dx,y+24*k,6*k,'#222');ln(c,x-50*k,y+30*k,x+50*k,y+30*k,'#8A8F96',2);};
PIC.train=(c,x,y,s,t=0)=>{const k=s/100;rr(c,x-40*k,y-10*k,56*k,30*k,3,'#2E3A46','#111');rr(c,x+16*k,y-26*k,22*k,46*k,3,'#3A4856','#111');rr(c,x-34*k,y-26*k,10*k,16*k,1,'#2E3A46');
  for(let i=0;i<3;i++){const p=(t*.8+i/3)%1;dot(c,x-29*k+p*10*k,y-30*k-p*26*k,(4+p*8)*k,'#B9C2CC',{alpha:1-p});}[-26,-6,26].forEach(dx=>dot(c,x+dx*k,y+26*k,8*k,'#111',{stroke:'#7A8590',lw:2}));ln(c,x-50*k,y+34*k,x+50*k,y+34*k,'#8A8F96',2);};
PIC.manse=(c,x,y,s,t=0)=>{const k=s/100;for(let i=0;i<3;i++){const xx=x+(-28+i*28)*k,up=Math.max(0,Math.sin(t*3+i*1.3))*8*k;dot(c,xx,y+6*k,9*k,'#E6C9A8');rr(c,xx-10*k,y+16*k,20*k,26*k,4,'#EFEFEA','#9AA4AE',1.5);
  ln(c,xx+8*k,y+18*k,xx+14*k,y-14*k-up,'#E6C9A8',4*k);ln(c,xx+14*k,y-14*k-up,xx+14*k,y-40*k-up,'#6B4A2C',1.5);PIC.taegeuk(c,xx+24*k,y-34*k-up,20);}};
PIC.ballot=(c,x,y,s,t=0)=>{const k=s/100,d=((t*.7)%1);rr(c,x-34*k,y-6*k,68*k,46*k,3,'#D7DEE5','#6F7C8A');rr(c,x-16*k,y-8*k,32*k,5*k,1,'#3D4E5F');
  rr(c,x-10*k,y-40*k+d*28*k,20*k,26*k,1,'#FFFFFF','#9AA4AE',1);T(c,'✓',x,y-27*k+d*28*k,{size:13*k,align:'center',w:700,color:RED});};
PIC.handshake=(c,x,y,s)=>{const k=s/100;pth(c,[[x-46*k,y-6*k],[x-10*k,y-14*k],[x+6*k,y-4*k],[x-8*k,y+8*k],[x-46*k,y+12*k]],'#E6C9A8','#9C7A5A',1.5);
  pth(c,[[x+46*k,y-6*k],[x+10*k,y-10*k],[x-6*k,y+2*k],[x+6*k,y+14*k],[x+46*k,y+12*k]],'#D9B48F','#9C7A5A',1.5);rr(c,x-54*k,y-12*k,10*k,26*k,2,'#3D5A80');rr(c,x+44*k,y-12*k,10*k,26*k,2,'#6B3D3D');};
PIC.protest=(c,x,y,s,t=0)=>{const k=s/100;for(let i=0;i<5;i++){const xx=x+(-40+i*20)*k,yy=y+(i%2?6:0)*k;dot(c,xx,yy,7*k,'#2B2B2B');rr(c,xx-8*k,yy+8*k,16*k,26*k,4,i%2?'#3D4E5F':'#4F6272');
  const up=Math.max(0,Math.sin(t*3+i))*6*k;if(i%2===0)ln(c,xx+6*k,yy+10*k,xx+10*k,yy-18*k-up,'#2B2B2B',3.5*k);}rr(c,x-24*k,y-44*k,48*k,16*k,2,'#F2F2EE','#9AA4AE',1);T(c,'민주',x,y-36*k,{size:10*k,align:'center',w:700,color:RED});};
PIC.road=(c,x,y,s,t=0)=>{const k=s/100;pth(c,[[x-46*k,y+40*k],[x+46*k,y+40*k],[x+6*k,y-34*k],[x-6*k,y-34*k]],'#3A4450','#222');for(let i=0;i<5;i++){const p=((t*.5+i/5)%1),yy=y-30*k+p*66*k,w=(1+p*3)*k;rr(c,x-w,yy,w*2,6*p*k+2*k,0,'#F2D24E');}
  rr(c,x-46*k,y-46*k,40*k,14*k,2,'#2E7D4F');T(c,'경부',x-26*k,y-39*k,{size:9*k,align:'center',w:700,color:'#fff'});};
PIC.ship=(c,x,y,s,t=0)=>{const k=s/100,b=Math.sin(t*2)*2*k;pth(c,[[x-46*k,y+6*k+b],[x+46*k,y+6*k+b],[x+36*k,y+26*k+b],[x-40*k,y+26*k+b]],'#2E5A7D','#16324A',1.5);
  const cols=['#E25D5D','#F2C14E','#4C7BD9','#7BE07F'];for(let i=0;i<6;i++)rr(c,x+(-38+i*12)*k,y-8*k+b,11*k,14*k,1,cols[i%4]);rr(c,x+28*k,y-24*k+b,12*k,30*k,1,'#E6EDF5');ln(c,x-50*k,y+30*k,x+50*k,y+30*k,'#3C7AA6',2);};
PIC.torch=(c,x,y,s,t=0)=>{const k=s/100;pth(c,[[x-10*k,y-10*k],[x+10*k,y-10*k],[x+4*k,y+40*k],[x-4*k,y+40*k]],'#C9C2B5','#7C756A',1.5);const f=1+Math.sin(t*9)*.1;
  pth(c,[[x-12*k,y-12*k],[x,y-46*k*f],[x+12*k,y-12*k]],'#FF9A4D');pth(c,[[x-6*k,y-12*k],[x,y-32*k*f],[x+6*k,y-12*k]],'#FDE047');};
PIC.factory=(c,x,y,s,t=0)=>{const k=s/100;pth(c,[[x-44*k,y+36*k],[x-44*k,y-4*k],[x-24*k,y+8*k],[x-24*k,y-4*k],[x-4*k,y+8*k],[x-4*k,y-4*k],[x+16*k,y+8*k],[x+44*k,y+8*k],[x+44*k,y+36*k]],'#5B6B7A','#2E3A46',1.5);
  rr(c,x+22*k,y-34*k,10*k,42*k,1,'#6F7C8A');for(let i=0;i<3;i++){const p=(t*.6+i/3)%1;dot(c,x+27*k+p*12*k,y-38*k-p*20*k,(4+p*7)*k,'#9AA7B4',{alpha:1-p});}};
/* 인물(초상이 아니라 신분·역할을 나타내는 아이콘) */
PIC.person=(c,x,y,s,kind='scholar',t=0)=>{const k=s/100,b=Math.sin(t*2)*1.2*k;
  const robe={king:'#C8372D',scholar:'#E8E4DA',general:'#5B6B7A',monk:'#8C6A4A',woman:'#D97FA0',modern:'#2E3A46',student:'#22303D'}[kind]||'#888';
  pth(c,[[x-30*k,y+46*k],[x-24*k,y+8*k+b],[x+24*k,y+8*k+b],[x+30*k,y+46*k]],robe,'#0B1622',1.5);dot(c,x,y-10*k+b,17*k,'#EBCBA6',{stroke:'#9C7A5A',lw:1.2});
  if(kind==='king'){rr(c,x-15*k,y-34*k+b,30*k,12*k,3,'#222');rr(c,x-20*k,y-30*k+b,6*k,6*k,2,'#222');rr(c,x+14*k,y-30*k+b,6*k,6*k,2,'#222');dot(c,x,y+18*k+b,6*k,GOLD);}
  else if(kind==='scholar'){ell(c,x,y-26*k+b,30*k,4*k,'#151515');rr(c,x-9*k,y-40*k+b,18*k,14*k,3,'#151515');ln(c,x-10*k,y-20*k+b,x-6*k,y+2*k+b,'#151515',1);ln(c,x+10*k,y-20*k+b,x+6*k,y+2*k+b,'#151515',1);}
  else if(kind==='general'){pth(c,[[x-18*k,y-18*k+b],[x,y-38*k+b],[x+18*k,y-18*k+b]],'#5E6B78','#2E3A46',1.5);ln(c,x,y-38*k+b,x,y-48*k+b,RED,3);}
  else if(kind==='monk'){dot(c,x,y-12*k+b,17*k,'#EBCBA6');ln(c,x-22*k,y+10*k+b,x+22*k,y+40*k,'#C9792E',5*k);}
  else if(kind==='woman'){ell(c,x,y-24*k+b,18*k,9*k,'#1E1E1E');dot(c,x,y-34*k+b,7*k,'#1E1E1E');}
  else if(kind==='modern'){rr(c,x-14*k,y-34*k+b,28*k,12*k,3,'#1E1E1E');ell(c,x,y-23*k+b,22*k,4*k,'#1E1E1E');ln(c,x,y+10*k+b,x,y+30*k,RED,3);}
  else if(kind==='student'){rr(c,x-15*k,y-30*k+b,30*k,8*k,2,'#111');rr(c,x-16*k,y-24*k+b,32*k,4*k,1,'#111');}
  dot(c,x-6*k,y-10*k+b,1.8*k,'#2B1D12');dot(c,x+6*k,y-10*k+b,1.8*k,'#2B1D12');};

/* ── 그림 카드 장면: 그림이 하나씩 등장, 지금 카드는 확대·강조 ── */
TPL.gallery=function(c,t,d){
  const col=colOf(d);kicker(c,d,col);const its=d.items,n=its.length,cols=n<=3?n:n===4?4:Math.ceil(n/2),rows=Math.ceil(n/cols);
  const gx=24,gy=18,top=84,bw=(960-96-(cols-1)*gx)/cols,bh=(540-top-56-(rows-1)*gy)/rows,t0=.4,step=(d.dur-1.5)/n,cur=clamp(Math.floor((t-t0)/step),0,n-1);
  its.forEach((it,i)=>{const r=Math.floor(i/cols),cc=i%cols,x=48+cc*(bw+gx),y=top+r*(bh+gy),k=ease(seg(t,t0+i*step,t0+i*step+.6));if(k<=0)return;
    const on=i===cur,pop=on?1+.035*Math.sin(t*4):1,cx=x+bw/2,cy=y+bh/2;c.save();c.translate(cx,cy);c.scale(k*pop,k*pop);c.translate(-cx,-cy);
    box(c,x,y,bw,bh,16,on?'#13283B':'#0E1B2A',on?col:col+'55',on?2.4:1.4,{glow:on?16:0,gc:col});
    const ps=Math.min(bw*.62,bh-74),py=y+12+ps/2;const f=PIC[it.pic];if(f)f(c,cx,py,ps,it.arg??t,t);
    if(it.y)pill(c,it.y,x+bw-14-(it.y.length*3.4+8),y+18,col,{size:11.5,fill:'#09131F'});
    T(c,it.n,cx,y+bh-40,{size:fit(c,it.n,bw-20,18,800),w:800,align:'center',color:on?C.text:'#D3DCE6'});
    WT(c,it.s||'',cx,y+bh-18,bw-20,15,{size:fit(c,it.s||'',(bw-20)*1.9,12.5,500)<10?10:12.5,align:'center',color:C.muted});c.restore();});
  if(d.foot)label(c,d.foot,480,524,C.dim,{size:11.5});
};
/* person 은 종류를 arg 로, 나머지는 시간 t 를 받는다 */
const _person=PIC.person;PIC.person=(c,x,y,s,a,t)=>_person(c,x,y,s,typeof a==='string'?a:'scholar',t||0);
['geumgwan','rain','turtle','crane','taegeuk','tram','train','manse','ballot','protest','road','ship','torch','factory'].forEach(key=>{const f=PIC[key];PIC[key]=(c,x,y,s,a,t)=>f(c,x,y,s,typeof a==='number'?a:(t||0));});
['stele','book','pagoda','house'].forEach(key=>{const f=PIC[key];PIC[key]=(c,x,y,s,a)=>Array.isArray(a)?f(c,x,y,s,...a):f(c,x,y,s);});

/* ── 구조도: 맨 위 기관 → 가지 → 잎. 선이 자라면서 차례로 등장 ── */
TPL.tree=function(c,t,d){
  const col=colOf(d);kicker(c,d,col);const br=d.branches,n=br.length,t0=.4,step=(d.dur-2)/(n+1);
  const rk=ease(seg(t,t0,t0+.7)),rw=320;
  c.save();c.globalAlpha=rk;box(c,480-rw/2,84,rw,54,14,col+'2A',col,2.4,{glow:12,gc:col});T(c,(d.root.e||'')+' '+d.root.n,480,104,{size:20,w:800,align:'center'});
  if(d.root.s)T(c,d.root.s,480,125,{size:12.5,align:'center',color:C.muted});c.restore();
  const bw=(864-(n-1)*16)/n;
  br.forEach((b,i)=>{const x=48+i*(bw+16),cx=x+bw/2,ts=t0+(i+1)*step,k=ease(seg(t,ts-step*.5,ts));if(k<=0)return;const bc=b.c||PAL[i%PAL.length];
    poly(c,[[480,138],[480,154],[cx,154],[cx,154+14*k]],bc,2,{alpha:k});
    c.save();c.globalAlpha=k;box(c,x,168,bw,58,12,'#0E1B2A',bc,2);T(c,(b.e||'')+' '+b.n,cx,188,{size:fit(c,(b.e||'')+' '+b.n,bw-14,17,800),w:800,align:'center',color:bc});
    T(c,b.s||'',cx,211,{size:fit(c,b.s||'',bw-14,12,500),align:'center',color:C.muted});c.restore();
    (b.kids||[]).forEach((kd,j)=>{const kk=ease(seg(t,ts+.15+j*.22,ts+.6+j*.22));if(kk<=0)return;const gap=Math.min(62,250/(b.kids.length||1)),yy=244+j*gap,py=j?244+(j-1)*gap+Math.min(52,gap-8):226;
      poly(c,[[cx,py],[cx,yy]],bc+'88',1.5,{alpha:kk});c.save();c.globalAlpha=kk;box(c,x+6,yy,bw-12,Math.min(52,gap-8),10,'#101F2E',bc+'66',1.2);box(c,x+6,yy,bw-12,Math.min(52,gap-8),10,bc+'1C',null);
      T(c,kd[0],cx,yy+15,{size:fit(c,kd[0],bw-24,14.5,700),w:700,align:'center'});if(kd[1])T(c,kd[1],cx,yy+33,{size:fit(c,kd[1],bw-24,11.5,500),align:'center',color:C.muted});c.restore();});});
  if(d.foot)label(c,d.foot,480,524,C.dim,{size:11.5});
};
/* 그림 장면 지도에서 쓰는 지명 추가(경도, 위도, 라벨 방향) */
Object.assign(PLACES,{'원산':[127.44,39.15,'r'],'인천':[126.63,37.46,'l'],'정주':[125.33,39.69,'l'],'대구':[128.6,35.87,'r'],'판문점':[126.68,37.96,'l'],'초산':[125.8,40.83,'r']});
