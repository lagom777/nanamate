import json, os, glob, shutil
from tag import tag as tag1
from tag2 import tag as tag2
DEST = '/Users/kg/coding/nanamate/public/learn/suneung-exam'
ex = json.load(open(f'{DEST}/exams.json'))['exams']
by = {e['key']: e for e in ex}
man = json.load(open('out/manifest_old_all.json'))
TITLE = lambda key: f"{key[:4]}학년도 " + {'csat': '대학수학능력시험', 'jun': '6월 모의평가', 'sep': '9월 모의평가'}[key.split('-')[1]] + ' (구 교육과정)'
STAGE = f'{DEST}'  # 이미지는 임시로 여기에 두고 R2 업로드 뒤 지운다
for key in sorted(man):
    e = by.setdefault(key, {'key': key, 'title': TITLE(key), 'year': int(key[:4]), 'kind': key.split('-')[1], 'old': 1})
    for sub in ('phys1', 'bio1', 'chem1', 'earth1', 'phys2', 'chem2', 'bio2', 'earth2'):
        m = man[key][sub]
        a = list(m['answers'])
        if key == '2018-sep' and sub == 'earth1':
            a[16] = [1, 5]; m['points'][16] = 3
        d = {'a': a, 'p': m['points']}
        txt = json.load(open(f'out/{key}/{sub}/text.json'))
        if sub in ('phys1', 'bio1'):
            d['t'] = [('b1' if (sub == 'bio1' and n == 1) else tag1(sub, txt.get(str(n), ''))[0]) for n in range(1, 21)]
        elif sub in ('chem1', 'earth1'):
            d['t'] = [tag2(sub, txt.get(str(n), ''))[0] for n in range(1, 21)]
        e[sub] = d
        os.makedirs(f'{STAGE}/{key}/{sub}', exist_ok=True)
        for f in glob.glob(f'out/{key}/{sub}/q*.webp'): shutil.copy(f, f'{STAGE}/{key}/{sub}')
    mm = json.load(open(f'out_old/{key}/수학/meta.json'))
    e['math'] = {'a': mm['answers'], 'p': mm['points'], 'n': [int(x) for x in mm['numeric']]}
    e['korean'] = {'paper': 1}; e['english'] = {'paper': 1}
    for sub, name in (('수학', 'math'), ('국어', 'korean'), ('영어', 'english')):
        os.makedirs(f'{STAGE}/{key}/{name}', exist_ok=True)
        for f in glob.glob(f'out_old/{key}/{sub}/*.webp') + [f'out_old/{key}/{sub}/meta.json']:
            shutil.copy(f, f'{STAGE}/{key}/{name}')
rank = {'csat': 0, 'sep': 1, 'jun': 2}
exams = sorted(by.values(), key=lambda x: (-x['year'], rank[x['kind']]))
json.dump({'exams': exams}, open(f'{DEST}/exams.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(exams), 'exams;', sum(1 for x in exams if x.get('old')), 'old')
