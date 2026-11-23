import json,re
R='/Users/kg/coding/nanamate/'
ex=json.load(open(R+'public/learn/suneung-exam/exams.json'))['exams']
n=lambda sub: sum(1 for e in ex if sub in e)
# 파트 수는 생성된 색인에서 센다
def parts(folder):
    s=open(R+f'public/learn/{folder}/index.html').read()
    return len(re.findall(r'class="outline-card" href="chapters/',s))
def scenes(folder):  # 모션 노트 장면 수(머리글 'N개 핵심 개념' — 생성기가 센 값)
    return int(re.search(r'(\d+)개 핵심 개념', open(R+f'public/learn/{folder}/motion.html').read()).group(1))
def sec(folder):  # 전략 챕터 제외
    return parts(folder)
cards=[   # 지금 수능 과목(국어·수학·영어·한국사 + 통합사회·통합과학). 2027학년도까지의 선택과목은 메뉴에서 내렸다
 ('aboutSuneungKorean','#b45309','국어','수능 국어','CSAT Korean','독서·문학·화법·작문·언어 %d파트 정리 · 예시문항·기출 %d회 시험지 채점'%(parts('aboutSuneungKorean'),n('korean')),['📄 %d파트'%parts('aboutSuneungKorean'),'45문항 · 80분','📝 %d회'%n('korean')]),
 ('aboutSuneungMath','#7c3aed','수학','수능 수학','CSAT Math','대수·미적분Ⅰ %d파트 정리 · 예시문항·기출 %d회 %d문항 채점'%(parts('aboutSuneungMath'),n('math'),n('math')*30),['📄 %d파트'%parts('aboutSuneungMath'),'30문항 · 100분','📝 %d회'%n('math')]),
 ('aboutSuneungEnglish','#2563eb','영어','수능 영어','CSAT English','듣기·독해 유형 %d파트 · 기출 %d회 채점 · 듣기 음성·대본'%(parts('aboutSuneungEnglish'),n('english')),['📄 %d파트'%parts('aboutSuneungEnglish'),'듣기','절대평가']),
 ('aboutSuneungHistory','#be123c','필수','수능 한국사','CSAT Korean History','시대별 9파트 정리 · 모션 노트 86장면 · 영토 지도 · 기출 %d회 채점'%n('hist'),['📄 9파트','🎬 모션 86장면','📝 기출 %d회'%n('hist')]),
 ('aboutSuneungIntegrated','#0f766e','탐구','수능 통합사회·통합과학','CSAT Integrated Social Studies &amp; Science','평가원 예시문항 풀어보기 · 해설 · 채점',['📝 2과목','25문항 · 40분','예시문항 %d문항'%(n('intsoc')*25+n('intsci')*25)]),
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
TITLE='<h3 id="suneung" class="category-title" style="font-size:1.2em;color:#dc2626;margin:48px 0 20px;padding-left:14px;border-left:3px solid #dc2626;font-family:\'Space Grotesk\',sans-serif;">수능</h3>'
for path,pref in [('index.html','public/learn/'),('public/learn/index.html','')]:
    s=open(R+path).read()
    i=s.index('<!-- 수능 -->'); j=s.index('<!-- 📅 일일 학습')
    body='<!-- 수능 -->\n    '+TITLE+'\n    <div class="card-grid">\n'+''.join(card(c,pref) for c in cards)+'    </div>\n\n    '
    open(R+path,'w').write(s[:i]+body+s[j:])
print('hub cards rewritten', [(c[3],c[5]) for c in cards])
