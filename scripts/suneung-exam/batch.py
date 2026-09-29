import json, re, os, subprocess, zipfile

boards = json.load(open(os.environ.get('BOARDS','boards.json')))
plan = []
for b, pg, txt, ids in boards:
    m = re.search(r'\d+ (20\d\d) (?:(\d)월 )?과학탐구', txt)
    if not m:
        continue
    y = int(m.group(1)); mo = m.group(2)
    if b == 1500234:
        key = f"{y}-csat"; title = f"{y}학년도 대학수학능력시험"
    elif b == 1500236:
        key = f"{y}-{'jun' if mo == '6' else 'sep'}"; title = f"{y}학년도 {mo}월 모의평가"
    else:
        continue
    if y < int(os.environ.get('YMIN', '2022')) or y > int(os.environ.get('YMAX', '2100')):
        continue
    plan.append((key, title, tuple(ids)))
plan = sorted(set(plan))
if os.environ.get('ONLY'):
    plan = [p for p in plan if p[0] == os.environ['ONLY']]
print(len(plan), 'exams')
os.makedirs('dl', exist_ok=True)


def get(id):
    p = f'dl/{id}.bin'
    if not os.path.exists(p) or os.path.getsize(p) < 1000:
        subprocess.run(['curl', '-s', '-m', '120', '-L', f'https://www.suneung.re.kr/boardCnts/fileDown.do?fileSeq={id}', '-o', p], check=True)
    return p


def unz(p, d):
    os.makedirs(d, exist_ok=True)
    r = {}
    if open(p, 'rb').read(4) == b'%PDF':
        f = os.path.join(d, 'single.pdf')
        open(f, 'wb').write(open(p, 'rb').read())
        return {'single.pdf': f}
    z = zipfile.ZipFile(p)
    for i in z.infolist():
        n = i.filename
        if not (i.flag_bits & 0x800):
            try:
                n = n.encode('cp437').decode('cp949')
            except Exception:
                pass
        n = os.path.basename(n)
        if not n.lower().endswith('.pdf'):
            continue
        f = os.path.join(d, n)
        open(f, 'wb').write(z.read(i))
        r[n] = f
    return r


manifest = {}
import sys
ALL = {'phys1': '물리학Ⅰ', 'bio1': '생명과학Ⅰ', 'chem1': '화학Ⅰ', 'earth1': '지구과학Ⅰ', 'phys2': '물리학Ⅱ', 'chem2': '화학Ⅱ', 'bio2': '생명과학Ⅱ', 'earth2': '지구과학Ⅱ'}
SUBJ = [(k, ALL[k]) for k in (sys.argv[1].split(',') if len(sys.argv) > 1 else ['phys1', 'bio1'])]
MANI = sys.argv[2] if len(sys.argv) > 2 else 'out/manifest.json'
for key, title, ids in plan:
    q = unz(get(ids[0]), f'x/{key}/q')
    a = unz(get(ids[1]), f'x/{key}/a')
    print(key, title, len(q), len(a))
    for sub, label in SUBJ:
        norm = lambda s: s.replace(' ', '').replace('Ⅱ', '2').replace('II', '2').replace('Ⅰ', '1').replace('I', '1').replace('물리학', '물리')
        lab = norm(label)
        qf = [f for n, f in q.items() if re.search(lab + r'(?![0-9])', norm(n))]
        af = [f for n, f in a.items() if re.search(lab + r'(?![0-9])', norm(n))] or ([a['single.pdf']] if 'single.pdf' in a else [])
        if len(qf) != 1 or len(af) != 1:
            print('  !!', sub, sorted(q), sorted(a))
            continue
        out = f'out/{key}/{sub}'
        r = subprocess.run(['./venv/bin/python', 'crop.py', qf[0], af[0], out, '20', label], capture_output=True, text=True)
        print(' ', sub, r.stdout.strip(), r.stderr.strip()[-200:])
        manifest.setdefault(key, {'title': title})[sub] = json.load(open(out + '/meta.json'))
json.dump(manifest, open(MANI, 'w'), ensure_ascii=False)
