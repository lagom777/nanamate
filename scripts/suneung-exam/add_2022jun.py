import json, os, glob, shutil
from tag import tag as tag1
from tag2 import tag as tag2
DEST = '/Users/kg/coding/nanamate/public/learn/suneung-exam'
ex = json.load(open(f'{DEST}/exams.json'))['exams']
by = {e['key']: e for e in ex}
key = '2022-jun'
e = by.setdefault(key, {'key': key, 'title': '2022학년도 6월 모의평가', 'year': 2022, 'kind': 'jun'})
ma = json.load(open('out/manifest_2022jun_a.json'))[key]
mb = json.load(open('out/manifest_2022jun_b.json'))[key]
OV = {('bio1', 15): 'b7'}
for sub in ('phys1', 'bio1', 'chem1', 'earth1', 'phys2', 'chem2', 'bio2', 'earth2'):
    m = (ma if sub in ma else mb)[sub]
    d = {'a': m['answers'], 'p': m['points']}
    txt = json.load(open(f'out/{key}/{sub}/text.json'))
    if sub in ('phys1', 'bio1'):
        d['t'] = [OV.get((sub, n)) or ('b1' if (sub == 'bio1' and n == 1) else tag1(sub, txt[str(n)])[0]) for n in range(1, 21)]
    elif sub in ('chem1', 'earth1'):
        d['t'] = [tag2(sub, txt.get(str(n), ''))[0] for n in range(1, 21)]
    e[sub] = d
    os.makedirs(f'{DEST}/{key}/{sub}', exist_ok=True)
    for f in glob.glob(f'out/{key}/{sub}/q*.webp'):
        shutil.copy(f, f'{DEST}/{key}/{sub}')
rank = {'csat': 0, 'sep': 1, 'jun': 2}
exams = sorted(by.values(), key=lambda x: (-x['year'], rank[x['kind']]))
json.dump({'exams': exams}, open(f'{DEST}/exams.json', 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(exams), [x['key'] for x in exams][-3:], sum(1 for x in exams if 'phys1' in x))
