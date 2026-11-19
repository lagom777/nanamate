import json, sys, glob, os, pymupdf
sys.path.insert(0, '/Users/kg/coding/nanamate/scripts/suneung-exam')
from kse_answers import rows_from, convert
EX = {e['key']: e for e in json.load(open('/Users/kg/coding/nanamate/public/learn/suneung-exam/exams.json'))['exams']}
files, ans = {}, {}
for d in sorted(glob.glob('dl/*/수학')):
    key = d.split('/')[1]
    pdfs = [os.path.join(d, f) for f in sorted(os.listdir(d)) if f.endswith('.pdf')]
    info = [(p, len(pymupdf.open(p)), pymupdf.open(p)[0].get_text()[:200].replace('\n', ' ')) for p in pdfs]
    q = [p for p, n, t in info if n >= 12 and '짝수형' not in t[:20]]
    a = [p for p, n, t in info if n < 12]
    if len(q) != 1 or not a: print('??', key, [(os.path.basename(p), n, t[:30]) for p, n, t in info]); continue
    m = {'c': {}, 'g': {}, 'm': {}, 'h': {}}
    for ap in a:
        for _, row in rows_from(ap, lambda t: '홀수' in t or '짝수' not in t):
            sel = [x for x in row if x[0] >= 23]
            for n, b, p in row:
                if n < 23: m['c'][str(n)] = [convert(b), p, b not in '①②③④⑤']
            if len(sel) == 3:
                for sec, (n, b, p) in zip('gmh', sel): m[sec][str(n)] = [convert(b), p, b not in '①②③④⑤']
            elif sel: print('sel?', key, row)
    files[f'{key}/수학'] = {'q': q[0], 'a': a[0]}
    ans[f'{key}/수학'] = m
    ma = EX[key]['math']['a']
    got = [m['c'].get(str(n), [None])[0] for n in range(1, 23)] + [m['m'].get(str(n), [None])[0] for n in range(23, 31)]
    tot = {s: sum(v[1] for v in m[s].values()) for s in m}
    print(key, 'ok' if got == ma else 'MISMATCH', {s: len(v) for s, v in m.items()}, tot)
json.dump(files, open('kse_files.json', 'w'), ensure_ascii=False)
json.dump(ans, open('kse_answers.json', 'w'), ensure_ascii=False)
