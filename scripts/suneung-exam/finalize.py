import json,glob,os,shutil,subprocess
from tag import tag
OV={
 # bio
 '2022-csat/bio1/4':'b2','2022-csat/bio1/7':'b7','2022-sep/bio1/6':'b8','2022-sep/bio1/14':'b6','2023-jun/bio1/7':'b6',
 '2023-sep/bio1/18':'b7','2024-csat/bio1/11':'b6','2024-sep/bio1/11':'b6','2024-sep/bio1/18':'b8','2025-jun/bio1/12':'b7',
 '2025-jun/bio1/18':'b8','2026-jun/bio1/16':'b7','2026-sep/bio1/3':'b2','2026-sep/bio1/16':'b6','2027-jun/bio1/4':'b2',
 '2027-jun/bio1/17':'b7','2027-sep/bio1/10':'b4','2027-sep/bio1/17':'b7','2027-sep/bio1/19':'b7',
 # phys
 '2022-csat/phys1/12':'p5','2022-csat/phys1/20':'p2','2023-csat/phys1/16':'p1','2023-sep/phys1/7':'p1','2023-sep/phys1/8':'p2',
 '2023-sep/phys1/13':'p1','2023-sep/phys1/17':'p4','2024-jun/phys1/19':'p1','2025-sep/phys1/7':'p1','2026-sep/phys1/17':'p2',
 '2027-jun/phys1/18':'p1','2027-sep/phys1/8':'p1','2027-sep/phys1/14':'p1',
}
man=json.load(open('out/manifest.json'))
exams=[]
for key in sorted(man,reverse=True):
    y=int(key[:4]); kind=key.split('-')[1]
    e={'key':key,'title':man[key]['title'],'year':y,'kind':kind}
    for sub in ('phys1','bio1'):
        txt=json.load(open(f'out/{key}/{sub}/text.json'))
        tags=[]
        for n in range(1,21):
            k=f'{key}/{sub}/{n}'
            if k in OV: t=OV[k]
            elif sub=='bio1' and n==1: t='b1'
            else: t=tag(sub,txt[str(n)])[0]
            tags.append(t)
        m=man[key][sub]
        e[sub]={'a':m['answers'],'p':m['points'],'t':tags}
    exams.append(e)
# order: kind order within year: csat, sep, jun
rank={'csat':0,'sep':1,'jun':2}
exams.sort(key=lambda e:(-e['year'],rank[e['kind']]))
DEST=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../public/learn/suneung-exam'))
os.makedirs(DEST,exist_ok=True)
for e in exams:
    for sub in ('phys1','bio1'):
        d=f"{DEST}/{e['key']}/{sub}"; os.makedirs(d,exist_ok=True)
        for f in glob.glob(f"out/{e['key']}/{sub}/q*.webp"): shutil.copy(f,d)
json.dump({'exams':exams},open(f'{DEST}/exams.json','w'),ensure_ascii=False,separators=(',',':'))
from collections import Counter
for sub in ('phys1','bio1'):
    print(sub,sorted(Counter(t for e in exams for t in e[sub]['t']).items()))
print(len(exams),'exams', sum(len(glob.glob(f'{DEST}/*/*/q*.webp')) for _ in [0]),'images')
