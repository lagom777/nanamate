import os, re, sys, glob, json, subprocess, pymupdf
SUBS = ['lifeeth','ethth','kgeo','wgeo','eahist','whist','econ','pol','soc']
NAMES = ['생활과윤리','윤리와사상','한국지리','세계지리','동아시아사','세계사','경제','정치와법','사회문화']
CROP = sys.argv[1]
norm = lambda s: re.sub(r'[\s·･․.ㆍ]', '', s)
res = {}
for d in sorted(glob.glob('dl/*/사회탐구')):
    key = d.split('/')[1]
    pdfs = sorted(f for f in os.listdir(d) if f.endswith('.pdf'))
    qs, as_ = {}, {}
    for f in pdfs:
        doc = pymupdf.open(os.path.join(d, f)); t = norm(doc[0].get_text()[:400])
        isans = '정답표' in t or len(doc) < 2
        hit = [i for i, n in enumerate(NAMES) if n in norm(f)]
        # 파일 이름이 가장 긴 과목 이름과 맞는 것(세계사 ⊂ 동아시아사 없음, 윤리 겹침 없음)
        if len(hit) != 1: print('??', key, f, hit); continue
        (as_ if isans else qs)[SUBS[hit[0]]] = os.path.join(d, f)
        if not isans and NAMES[hit[0]] not in t: print('name mismatch', key, f, t[:40])
    for s in SUBS:
        if s not in qs or s not in as_: print('MISSING', key, s); continue
        out = f'soc/{key}/{s}'
        if not os.path.exists(out + '/meta.json'):
            r = subprocess.run([sys.executable, '-I', CROP, qs[s], as_[s], out, '20'], capture_output=True, text=True, env={**os.environ, 'CROP_DPI': '150', 'CROP_Q': '62'})
            tail = (r.stdout + r.stderr).strip().split('\n')[-3:]
        m = json.load(open(out + '/meta.json')) if os.path.exists(out + '/meta.json') else None
        ok = m and all(m['answers']) and sum(p or 0 for p in m['points']) == 50 and len(glob.glob(out + '/q*.webp')) == 20
        if not ok: print('BAD', key, s, m and m['answers'], m and sum(p or 0 for p in m['points']), len(glob.glob(out + '/q*.webp')))
        res[f'{key}/{s}'] = bool(ok)
print(sum(res.values()), '/', len(res), 'ok')
