import json,re,subprocess,os,zipfile,shutil
rows=json.load(open('boards_kse.json')); meta=json.load(open('kse_meta.json'))
os.makedirs('kse2',exist_ok=True)
def key_of(txt,b):
    m=re.search(r'(20\d\d) (?:(\d)월 )?(국어|수학|영어)',txt)
    y=int(m.group(1)); mo=m.group(2)
    if b==1500234: return f'{y}-csat',m.group(3)
    return f"{y}-{'jun' if mo=='6' else 'sep'}",m.group(3)
def dl(i,dest):
    subprocess.run(['curl','-s','-m','300','-L',f'https://www.suneung.re.kr/boardCnts/fileDown.do?fileSeq={i}','-o',dest],check=True)
res={}
for b,pg,txt,ids in rows:
    m=re.search(r'(20\d\d)',txt)
    if int(m.group(1))<2022: continue
    key,subj=key_of(txt,b)
    d=f'kse2/{key}/{subj}'; os.makedirs(d,exist_ok=True)
    entry={}
    for i in ids:
        nm=meta[i]['name']
        if '짝수' in nm: continue
        if nm.endswith('.zip') and ('문제지' not in nm): continue   # 음원
        kind='q' if '문제지' in nm else 'a' if ('정답' in nm) else 's' if '대본' in nm else None
        if kind is None: continue
        dest=f'{d}/{kind}.{"zip" if nm.endswith(".zip") else "pdf"}'
        if not os.path.exists(dest) or os.path.getsize(dest)<1000: dl(i,dest)
        entry[kind]=dest
    res[f'{key}/{subj}']=entry
# unzip problem zips
for k,e in res.items():
    if 'q' in e and e['q'].endswith('.zip'):
        z=zipfile.ZipFile(e['q']); d=os.path.dirname(e['q'])
        for info in z.infolist():
            n=info.filename
            if not(info.flag_bits&0x800):
                try:n=n.encode('cp437').decode('cp949')
                except Exception:pass
            if n.lower().endswith('.pdf') and '짝수' not in n:
                open(f'{d}/q.pdf','wb').write(z.read(info)); e['q']=f'{d}/q.pdf'; print('zip pdf',k,n)
                break
json.dump(res,open('kse_files.json','w'),ensure_ascii=False,indent=0)
print(len(res),'entries')
for k,e in sorted(res.items()):
    print(k,sorted(e))
