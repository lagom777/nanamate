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
cards=[   # 2028학년도 수능(2027년 11월) 체제의 과목
 ('aboutSuneungKorean','#b45309','국어','수능 국어','CSAT Korean','2028부터 선택과목 없음(화법과 언어·독서와 작문·문학) · %d파트 정리 · 예시문항·기출 %d회 채점'%(parts('aboutSuneungKorean'),n('korean')),['📄 %d파트'%parts('aboutSuneungKorean'),'45문항 · 80분','📝 %d회'%n('korean')]),
 ('aboutSuneungMath','#7c3aed','수학','수능 수학','CSAT Math','2028 범위: 대수·미적분Ⅰ·확률과 통계 · 노트 %d파트 · 예시문항·기출 %d회 채점'%(parts('aboutSuneungMath'),n('math')),['📄 %d파트'%parts('aboutSuneungMath'),'30문항 · 100분','📝 %d회'%n('math')]),
 ('aboutSuneungEnglish','#2563eb','영어','수능 영어','CSAT English','듣기·독해 유형 %d파트 · 기출 %d회 채점 · 듣기 음성·대본'%(parts('aboutSuneungEnglish'),n('english')),['📄 %d파트'%parts('aboutSuneungEnglish'),'듣기','절대평가']),
 ('aboutSuneungHistory','#be123c','필수','수능 한국사','CSAT Korean History','시대별 9파트 정리 · 모션 노트 86장면 · 영토 지도 · 기출 %d회 채점'%n('hist'),['📄 9파트','🎬 모션 86장면','📝 기출 %d회'%n('hist')]),
 ('aboutSuneungIntegrated','#0f766e','탐구','수능 통합사회·통합과학','CSAT Integrated Social Studies &amp; Science','2028학년도 수능부터의 탐구 · 평가원 예시문항 풀어보기 · 채점',['📝 2과목','25문항 · 40분','예시문항 %d문항'%(n('intsoc')*25+n('intsci')*25)]),
]
old_cards=[   # 2027학년도 수능까지의 선택과목(지난 체제)
 ('aboutSuneungPhysics1','#0284c7','탐구','수능 물리학Ⅰ','CSAT Physics I','3단원 %d파트 정리 · 모션 노트 · 기출 %d회 채점·해설'%(parts('aboutSuneungPhysics1'),n('phys1')),['📄 %d파트'%parts('aboutSuneungPhysics1'),'🎬 모션 %d장면'%scenes('aboutSuneungPhysics1'),'📝 기출 %d문항'%(n('phys1')*20)]),
 ('aboutSuneungChem1','#0d9488','탐구','수능 화학Ⅰ','CSAT Chemistry I','4단원 %d파트 정리 · 기출 %d회 채점'%(parts('aboutSuneungChem1'),n('chem1')),['📄 %d파트'%parts('aboutSuneungChem1'),'📝 기출 %d문항'%(n('chem1')*20)]),
 ('aboutSuneungBio1','#16a34a','탐구','수능 생명과학Ⅰ','CSAT Biology I','5단원 %d파트 정리 · 모션 노트 · 기출 %d회 채점·해설'%(parts('aboutSuneungBio1'),n('bio1')),['📄 %d파트'%parts('aboutSuneungBio1'),'🎬 모션 %d장면'%scenes('aboutSuneungBio1'),'📝 기출 %d문항'%(n('bio1')*20)]),
 ('aboutSuneungEarth1','#ca8a04','탐구','수능 지구과학Ⅰ','CSAT Earth Science I','3단원 %d파트 정리 · 기출 %d회 채점'%(parts('aboutSuneungEarth1'),n('earth1')),['📄 %d파트'%parts('aboutSuneungEarth1'),'📝 기출 %d문항'%(n('earth1')*20)]),
 ('aboutSuneungScience2','#475569','탐구','수능 과학탐구Ⅱ','CSAT Science II','물리Ⅱ·화학Ⅱ·생명Ⅱ·지구Ⅱ 기출 풀어보기 · 채점',['📝 4과목','기출 %d문항×4'%(n('phys2')*20)]),
 ('aboutSuneungSocial','#c2410c','탐구','수능 사회탐구','CSAT Social Studies','생윤·윤사·한지·세지·동사·세사·경제·정법·사문 기출 풀어보기 · 채점',['📝 9과목','기출 %d문항×9'%(n('lifeeth')*20)]),
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
TITLE='<h3 id="suneung" class="category-title" style="font-size:1.2em;color:#dc2626;margin:48px 0 20px;padding-left:14px;border-left:3px solid #dc2626;font-family:\'Space Grotesk\',sans-serif;">수능 · 2028학년도 (2027년 11월)</h3>'
# 바뀐 체제 한눈에(접어 둠) — 근거: 교육부·평가원 「2028학년도 대학수학능력시험 예시문항 안내」(2025-04-15)
ROWS=[('국어','45문항 · 80분','화법과 언어 · 독서와 작문 · 문학 (선택과목 없음)'),('수학','30문항 · 100분','대수 · 미적분Ⅰ · 확률과 통계 (선택과목 없음)'),('영어','45문항 · 70분','그대로 (절대평가)'),('한국사','20문항 · 30분','그대로 (필수 · 절대평가)'),('통합사회','25문항 · 40분','선택과목 없이 모두 응시 · 1.5 / 2 / 2.5점'),('통합과학','25문항 · 40분','선택과목 없이 모두 응시 · 1.5 / 2 / 2.5점')]
INFO='''    <details class="sn2028" style="margin:-8px 0 18px;font-size:.92em;">
      <summary style="cursor:pointer;">2028학년도 수능부터 선택과목이 없어져요 — 국어·수학은 공통, 탐구는 통합사회·통합과학 (눌러서 표 보기)</summary>
      <table style="border-collapse:collapse;margin:10px 0 4px;width:100%;max-width:640px;">
'''+''.join('        <tr><th style="text-align:left;padding:5px 10px 5px 0;white-space:nowrap;">%s</th><td style="padding:5px 10px;white-space:nowrap;">%s</td><td style="padding:5px 0;">%s</td></tr>\n'%r for r in ROWS)+'''      </table>
      <p style="margin:4px 0 0;opacity:.75;">출처: 교육부·한국교육과정평가원 「2028학년도 대학수학능력시험 예시문항 안내」(2025-04-15). 2027학년도 수능(2026년 11월)이 선택과목 체제의 마지막이었어요.</p>
    </details>
'''
OLD_TITLE='    <h3 class="category-title" style="font-size:1.05em;color:#64748b;margin:34px 0 16px;padding-left:14px;border-left:3px solid #94a3b8;font-family:\'Space Grotesk\',sans-serif;">지난 선택과목 · 2027학년도 수능까지 (기출·노트는 그대로)</h3>\n'
for path,pref in [('index.html','public/learn/'),('public/learn/index.html','')]:
    s=open(R+path).read()
    i=s.index('<!-- 수능 -->'); j=s.index('<!-- 📅 일일 학습')
    body='<!-- 수능 -->\n    '+TITLE+'\n'+INFO+'    <div class="card-grid">\n'+''.join(card(c,pref) for c in cards)+'    </div>\n'+OLD_TITLE+'    <div class="card-grid">\n'+''.join(card(c,pref) for c in old_cards)+'    </div>\n\n    '
    open(R+path,'w').write(s[:i]+body+s[j:])
print('hub cards rewritten', [(c[3],c[5]) for c in cards+old_cards])
