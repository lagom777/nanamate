"""출력물을 저장소로 합친다: 화Ⅰ·지Ⅰ·Ⅱ 4과목(out/) + 수학·국어·영어(out2/) → public/learn/suneung-exam (exams.json 병합)"""
import json, os, glob, shutil, sys
from tag2 import tag
DEST = '/Users/kg/coding/nanamate/public/learn/suneung-exam'
COPY = '--no-copy' not in sys.argv
ex = json.load(open(f'{DEST}/exams.json'))['exams']
by = {e['key']: e for e in ex}
TITLE = lambda key: f"{key[:4]}학년도 " + {'csat': '대학수학능력시험', 'jun': '6월 모의평가', 'sep': '9월 모의평가'}[key.split('-')[1]]
def ent(key):
    if key not in by:
        by[key] = {'key': key, 'title': TITLE(key), 'year': int(key[:4]), 'kind': key.split('-')[1]}
    return by[key]

def cp(src_dir, dst_dir, pats):
    os.makedirs(dst_dir, exist_ok=True)
    for p in pats:
        for f in glob.glob(f'{src_dir}/{p}'):
            shutil.copy(f, dst_dir)

# ── 과학 나머지 6과목 ──
man = json.load(open('out/manifest_more.json'))
for key, m in man.items():
    e = ent(key)
    for sub in ('chem1', 'earth1', 'phys2', 'chem2', 'bio2', 'earth2'):
        d = {'a': m[sub]['answers'], 'p': m[sub]['points']}
        if sub in ('chem1', 'earth1'):
            txt = json.load(open(f'out/{key}/{sub}/text.json'))
            d['t'] = [tag(sub, txt.get(str(n), ''))[0] for n in range(1, 21)]
        e[sub] = d
        if COPY:
            cp(f'out/{key}/{sub}', f'{DEST}/{key}/{sub}', ['q*.webp'])

# ── 수학·국어·영어 ──
A = json.load(open('kse_answers.json'))
for key in sorted(os.listdir('out2')):
    e = ent(key)
    mm = json.load(open(f'out2/{key}/수학/meta.json'))
    tf = f'grok-math-out/{key}.json'
    gt = json.load(open(tf)) if os.path.exists(tf) else {}
    txt = json.load(open(f'out2/{key}/수학/text.json'))
    tags = []
    for n in range(1, 31):
        auto = tag('math_calc' if n >= 23 else 'math', txt.get(str(n), ''))[0]
        g = gt.get(str(n))
        valid = ('c1', 'c2', 'c3') if n >= 23 else ('a1', 'a2', 'a3', 'b1', 'b2', 'b3')
        tags.append(g if g in valid else auto)
    e['math'] = {'a': mm['answers'], 'p': mm['points'], 't': tags, 'n': [int(x) for x in mm['numeric']]}
    e['korean'] = {'paper': 1}
    e['english'] = {'paper': 1}
    if COPY:
        for sub, name in (('수학', 'math'), ('국어', 'korean'), ('영어', 'english')):
            cp(f'out2/{key}/{sub}', f'{DEST}/{key}/{name}', ['*.webp', 'meta.json'])

rank = {'csat': 0, 'sep': 1, 'jun': 2}
exams = sorted(by.values(), key=lambda e: (-e['year'], rank[e['kind']]))
json.dump({'exams': exams}, open(f'{DEST}/exams.json', 'w'), ensure_ascii=False, separators=(',', ':'))
from collections import Counter
for sub in ('chem1', 'earth1', 'math'):
    print(sub, sorted(Counter(t for e in exams if sub in e for t in e[sub]['t']).items()))
print(len(exams), 'exams')
