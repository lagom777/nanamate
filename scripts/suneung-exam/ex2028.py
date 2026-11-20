"""2028학년도 수능 예시문항(통합사회·통합과학): 정답·배점 + ①~⑤ 자리(hot) + 그림을 저장소 fix/ 로.

usage: ex2028.py <작업 폴더> <저장소 public/learn/suneung-exam>
작업 폴더에는 ex/{soc,sci}-{q,a}.pdf (평가원 게시판 boardID=1500237 의 문제지·정답표)와,
`CROP_DPI=150 CROP_Q=70 crop.py ex/soc-q.pdf ex/soc-a.pdf out/soc 25` 로 자른 out/{soc,sci}/qNN.webp 가 있어야 한다.
결과: hot/intsoc.json·intsci.json, fix/2028-ex/<과목>/qNN.webp, 작업 폴더의 ap.json({과목: {a, p}} — exams.json 의 2028-ex 칸에 넣는다).
배점이 1.5·2·2.5점이라 crop.py 의 정답표 읽기(정수 배점)는 쓰지 않는다.
"""
import sys, re, json, os, shutil
import pymupdf, numpy as np, cv2
from PIL import Image
T, R = sys.argv[1], sys.argv[2]
KEY='2028-ex'; CIRC='①②③④⑤'; DPI=150; s=DPI/72
out={}
for src,sub in (('soc','intsoc'),('sci','intsci')):
    toks=' '.join(p.get_text() for p in pymupdf.open(f'{T}/ex/{src}-a.pdf')).split()
    ans={}; pts={}; i=0
    while i<len(toks)-2:
        if re.fullmatch(r'\d{1,2}',toks[i]) and toks[i+1] in CIRC and re.fullmatch(r'[12](\.5)?',toks[i+2]):
            n=int(toks[i]); ans[n]=CIRC.index(toks[i+1])+1; pts[n]=float(toks[i+2]); i+=3
        else: i+=1
    a=[ans[n] for n in range(1,26)]; p=[int(pts[n]) if pts[n]==int(pts[n]) else pts[n] for n in range(1,26)]
    assert sum(p)==50, sum(p)
    doc=pymupdf.open(f'{T}/ex/{src}-q.pdf')
    pages=[np.frombuffer((px:=pg.get_pixmap(dpi=DPI,colorspace=pymupdf.csGRAY)).samples,np.uint8).reshape(px.height,px.width) for pg in doc]
    chars=[]
    for pg in doc:
        cs=[]
        for b in pg.get_text('rawdict')['blocks']:
            for l in b.get('lines',[]):
                for sp in l['spans']:
                    for c in sp['chars']:
                        if c['c'] in CIRC: cs.append((c['c'],[v*s for v in c['bbox']]))
        chars.append(cs)
    hot={}; os.makedirs(f'{R}/fix/{KEY}/{sub}',exist_ok=True)
    for n in range(1,26):
        f=f'{T}/out/{src}/q{n:02d}.webp'; t=np.asarray(Image.open(f).convert('L')); h,w=t.shape; best=None
        for pi,im in enumerate(pages):
            _,m,_,loc=cv2.minMaxLoc(cv2.matchTemplate(im,t,cv2.TM_CCOEFF_NORMED))
            if not best or m>best[0]: best=(m,pi,loc)
        m,pi,(x,y)=best; assert m>0.9,(sub,n,m)
        inside=[(c,bb) for c,bb in chars[pi] if x-2<=bb[0] and bb[2]<=x+w+2 and y-2<=bb[1] and bb[3]<=y+h+2]
        # 읽는 순서로 마지막에 나오는 ①→⑤ 한 벌(본문 속 원문자가 아니라 선지)
        inside.sort(key=lambda r:(round(r[1][1]/6),r[1][0])); pick=None
        for st in range(len(inside)-4,-1,-1):
            if [c for c,_ in inside[st:st+5]]==list(CIRC): pick=inside[st:st+5]; break
        boxes=[[round(bb[0]-x-3),round(bb[1]-y-3),round(bb[2]-bb[0]+6),round(bb[3]-bb[1]+6)] for _,bb in pick] if pick else None
        if boxes: hot[str(n)]=[w,h,boxes]
        else: print('NO HOT',sub,n,[c for c,_ in inside])
        shutil.copy(f,f'{R}/fix/{KEY}/{sub}/q{n:02d}.webp')
    open(f'{R}/hot/{sub}.json','w').write(json.dumps({KEY:hot},ensure_ascii=False,separators=(',',':')))
    out[sub]={'a':a,'p':p}; print(sub,'ans',a,'pts',p,'hot',len(hot))
json.dump(out,open(f'{T}/ap.json','w'))
