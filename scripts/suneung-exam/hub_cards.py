import json,re
R='/Users/kg/coding/nanamate/'
ex=json.load(open(R+'public/learn/suneung-exam/exams.json'))['exams']
n=lambda sub: sum(1 for e in ex if sub in e)
# 파트 수는 생성된 색인에서 센다
def parts(folder):
    s=open(R+f'public/learn/{folder}/index.html').read()
    return len(re.findall(r'class="outline-card" href="chapters/',s))
def sec(folder):  # 전략 챕터 제외
    return parts(folder)
cards=[
 ('aboutSuneungKorean','#b45309','국어','수능 국어','CSAT Korean','독서·문학·선택 %d파트 정리 · 기출 %d회 시험지 채점'%(parts('aboutSuneungKorean'),n('korean')),['📄 %d파트'%parts('aboutSuneungKorean'),'독서·문학·선택','📝 기출 %d회'%n('korean')]),
 ('aboutSuneungMath','#7c3aed','수학','수능 수학','CSAT Math','수학Ⅰ·수학Ⅱ·미적분 %d파트 정리 · 기출 %d회 %d문항 채점'%(parts('aboutSuneungMath'),n('math'),n('math')*30),['📄 %d파트'%parts('aboutSuneungMath'),'수Ⅰ·수Ⅱ·미적분','📝 기출 %d문항'%(n('math')*30)]),
 ('aboutSuneungEnglish','#2563eb','영어','수능 영어','CSAT English','듣기·독해 유형 %d파트 · 기출 %d회 채점 · 듣기 대본'%(parts('aboutSuneungEnglish'),n('english')),['📄 %d파트'%parts('aboutSuneungEnglish'),'듣기','절대평가']),
 ('aboutSuneungPhysics1','#0284c7','탐구','수능 물리학Ⅰ','CSAT Physics I','3단원 %d파트 정리 · 모션 노트 · 기출 %d회 채점·해설'%(parts('aboutSuneungPhysics1'),n('phys1')),['📄 %d파트'%parts('aboutSuneungPhysics1'),'🎬 모션 19장면','📝 기출 %d문항'%(n('phys1')*20)]),
 ('aboutSuneungChem1','#0d9488','탐구','수능 화학Ⅰ','CSAT Chemistry I','4단원 %d파트 정리 · 기출 %d회 채점'%(parts('aboutSuneungChem1'),n('chem1')),['📄 %d파트'%parts('aboutSuneungChem1'),'📝 기출 %d문항'%(n('chem1')*20)]),
 ('aboutSuneungBio1','#16a34a','탐구','수능 생명과학Ⅰ','CSAT Biology I','5단원 %d파트 정리 · 모션 노트 · 기출 %d회 채점·해설'%(parts('aboutSuneungBio1'),n('bio1')),['📄 %d파트'%parts('aboutSuneungBio1'),'🎬 모션 23장면','📝 기출 %d문항'%(n('bio1')*20)]),
 ('aboutSuneungEarth1','#ca8a04','탐구','수능 지구과학Ⅰ','CSAT Earth Science I','3단원 %d파트 정리 · 기출 %d회 채점'%(parts('aboutSuneungEarth1'),n('earth1')),['📄 %d파트'%parts('aboutSuneungEarth1'),'📝 기출 %d문항'%(n('earth1')*20)]),
 ('aboutSuneungScience2','#475569','탐구','수능 과학탐구Ⅱ','CSAT Science II','물리Ⅱ·화학Ⅱ·생명Ⅱ·지구Ⅱ 기출 풀어보기 · 채점',['📝 4과목','기출 %d문항×4'%(n('phys2')*20)]),
]
def card(c,pref):
    f,col,tag,title,en,desc,meta=c
    return f'''      <a href="{pref}{f}/index.html" class="subject-card" style="--card-accent:{col};">
        <div class="card-3d"><div class="card-face card-front">
            <div class="card-tag">{tag}</div><h3>{title}</h3><div class="card-en">{en}</div>
            <p>{desc}</p>
            <div class="card-meta">{''.join('<span>%s</span>'%m for m in meta)}</div>
        </div></div><div class="card-arrow">→</div>
      </a>
'''
for path,pref in [('index.html','public/learn/'),('public/learn/index.html','')]:
    s=open(R+path).read()
    i=s.index('<!-- 수능 -->'); j=s.index('<!-- 📅 일일 학습')
    seg=s[i:j]
    a=seg.index('<div class="card-grid">')+len('<div class="card-grid">\n')
    b=seg.rindex('    </div>')
    s=s[:i]+seg[:a]+''.join(card(c,pref) for c in cards)+seg[b:]+s[j:]
    open(R+path,'w').write(s)
print('hub cards rewritten', [(c[3],c[5]) for c in cards])
