import pymupdf,re,json,sys,glob
CIRC="①②③④⑤"
def rows_from(pdf,page_filter=None):
    """정답표 PDF에서 (문항, 정답토큰, 배점) 삼중항을 행 단위로 뽑는다."""
    d=pymupdf.open(pdf); out=[]
    for pi,p in enumerate(d):
        t=p.get_text()
        if page_filter and not page_filter(t): continue
        ws=p.get_text('words')
        # y로 행 묶기
        ws=sorted(ws,key=lambda w:(w[1]+w[3])/2)
        rows={}; cur=None; ky=0
        for w in ws:
            yc=(w[1]+w[3])/2
            if cur is None or abs(yc-cur)>6: cur=yc; ky+=1
            rows.setdefault(ky,[]).append(w)
        for k in sorted(rows):
            toks=[w[4] for w in sorted(rows[k],key=lambda w:w[0])]
            # 삼중항: 정수, (원문자|정수), 정수
            i=0; tri=[]
            while i<len(toks)-2:
                a,b,c=toks[i:i+3]
                if re.fullmatch(r'\d{1,2}',a) and (b in CIRC or re.fullmatch(r'\d{1,3}',b)) and re.fullmatch(r'[1-9]',c):
                    tri.append((int(a),b,int(c))); i+=3
                else: i+=1
            if tri: out.append((pi,tri))
    return out
def convert(b): return CIRC.index(b)+1 if b in CIRC else int(b)
if __name__=='__main__':
    res=json.load(open('kse_files.json'))
    for key in sorted(res):
        if not key.endswith('/'+sys.argv[1]): continue
        rows=rows_from(res[key]['a'],lambda t:'홀수' in t or '정답' in t and '짝수' not in t)
        n=sum(len(t) for _,t in rows)
        print(key,'rows',len(rows),'triples',n)
