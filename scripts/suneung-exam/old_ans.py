import json, re
from kse_answers import rows_from, convert, CIRC
files = json.load(open('old_files.json'))
NQ = {'국어': 45, '수학': 30, '영어': 45}
def parse(key, subj):
    pdf = files[f'{key}/{subj}']['a']
    def flt(t):
        tt = t.replace(' ', '')
        if subj == '수학' and ('나형' in tt[:400]): return False
        if subj == '수학' and '가형' not in tt[:400]: return False
        if '짝수' in tt[:400] or '(짝)' in tt[:400]: return False
        return True
    rows = rows_from(pdf, flt)
    ans = {}
    for pi, tri in rows:
        for n, tok, pt in tri:
            if n not in ans and 1 <= n <= NQ[subj]:
                ans[n] = (convert(tok), pt, tok not in CIRC)
    return ans
out = {}; bad = []
for k in sorted(files):
    key, subj = k.split('/')
    a = parse(key, subj)
    tot = sum(v[1] for v in a.values())
    ok = len(a) == NQ[subj] and tot == 100
    if not ok: bad.append((k, len(a), tot))
    out[k] = {str(n): list(v) for n, v in sorted(a.items())}
json.dump(out, open('old_answers.json', 'w'), ensure_ascii=False)
print('bad', bad)
