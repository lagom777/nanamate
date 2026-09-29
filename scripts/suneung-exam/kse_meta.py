import json,os
from kse_answers import rows_from,convert
res=json.load(open('kse_files.json'))
GROUPS={'국어':[('c',1,17),('c',18,34),('a',35,45),('b',35,45)],'수학':[('c',1,11),('c',12,22),('g',23,30),('m',23,30),('h',23,30)],'영어':[('c',1,12),('c',13,24),('c',25,36),('c',37,45)]}
out={}
for key in sorted(res):
    ex,subj=key.split('/')
    if not os.path.exists(res[key]['a']) : continue
    rows=rows_from(res[key]['a'],lambda t:'홀수' in t or ('정답' in t and '짝수' not in t))
    if not rows: continue
    secs={}
    for pi,tri in rows:
        for gi,(n,ans,pt) in enumerate(tri):
            sec,lo,hi=GROUPS[subj][gi]
            assert lo<=n<=hi,(key,gi,n)
            secs.setdefault(sec,{})[n]=(convert(ans),pt,not ans in '①②③④⑤')
    out[key]=secs
json.dump({k:{s:{str(n):v for n,v in d.items()} for s,d in secs.items()} for k,secs in out.items()},open('kse_answers.json','w'),ensure_ascii=False)
# checks
for key,secs in out.items():
    ex,subj=key.split('/')
    def tot(*ss): return sum(v[1] for s in ss for v in secs[s].values())
    if subj=='국어': ok=(len(secs['c'])==34 and len(secs['a'])==11 and len(secs['b'])==11 and tot('c','a')==100 and tot('c','b')==100)
    elif subj=='수학': ok=(len(secs['c'])==22 and len(secs['m'])==8 and tot('c','m')==100 and tot('c','g')==100 and tot('c','h')==100)
    else: ok=(len(secs['c'])==45 and tot('c')==100)
    if not ok: print('CHECK FAIL',key,{s:len(d) for s,d in secs.items()},tot(*secs.keys()))
print(len(out),'parsed')
