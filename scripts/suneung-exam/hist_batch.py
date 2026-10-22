"""한국사 기출 내려받기 → out/<회차>/hist/q01~q20.webp + 정답·배점(manifest_hist.json). boards_hist.json(hist_boards.py) 사용.
수능은 문제지가 홀수형·짝수형 두 벌이고 정답표 첫 쪽이 홀수형이므로 홀수형 문제지를 쓴다.
정답표가 그림인 회차(2025학년도 수능)와 복수정답(2017학년도 수능 14번 ①·⑤)은 hist_fix.py 가 덮어쓴다.
usage: ./venv/bin/python hist_batch.py   (ONLY=2025-csat,... 로 일부만)"""
import json, re, os, subprocess, zipfile, pymupdf
rows = json.load(open('boards_hist.json'))
os.makedirs('dl', exist_ok=True)
def get(i):
    p = f'dl/{i}.bin'
    if not os.path.exists(p) or os.path.getsize(p) < 1000:
        subprocess.run(['curl', '-s', '-m', '180', '-L', f'https://www.suneung.re.kr/boardCnts/fileDown.do?fileSeq={i}', '-o', p], check=True)
    return p
def pdfs(p, d):
    os.makedirs(d, exist_ok=True)
    if open(p, 'rb').read(4) == b'%PDF':
        f = os.path.join(d, os.path.basename(p) + '.pdf'); open(f, 'wb').write(open(p, 'rb').read()); return [f]
    z = zipfile.ZipFile(p); out = []
    for i in z.infolist():
        n = i.filename
        if not (i.flag_bits & 0x800):
            try: n = n.encode('cp437').decode('cp949')
            except Exception: pass
        if n.lower().endswith('.pdf'):
            f = os.path.join(d, os.path.basename(n)); open(f, 'wb').write(z.read(i)); out.append(f)
    return out
man = {}
ONLY = set(filter(None, os.environ.get('ONLY', '').split(',')))
for b, pg, txt, ids in rows:
    m = re.search(r'\d+ (20\d\d) (?:(\d)월 )?한국사', txt)
    y = int(m.group(1)); mo = m.group(2)
    key = f'{y}-csat' if b == 1500234 else f"{y}-{'jun' if mo == '6' else 'sep'}"
    title = f'{y}학년도 대학수학능력시험' if b == 1500234 else f'{y}학년도 {mo}월 모의평가'
    if ONLY and key not in ONLY: continue
    files = []
    for i in ids: files += pdfs(get(i), f'x/{key}')
    q = a = None
    qs = []
    for f in files:
        d = pymupdf.open(f); t = d[0].get_text()
        if (('정답' in t[:600] or not t.strip()) and len(d) <= 2) or '정 답' in t[:600]: a = a or f
        elif len(d) >= 2: qs.append((f, t))
    # 수능은 홀수형·짝수형 두 벌: 정답표 첫 쪽이 홀수형이므로 문제지도 홀수형을 쓴다
    odd = [f for f, t in qs if '홀수' in t[:3000] or '홀수' in os.path.basename(f)]
    q = (odd or [f for f, t in qs])[0] if qs else None
    if not q or not a:
        print('!!', key, files); continue
    print('  q =', os.path.basename(q), '| a =', os.path.basename(a))
    out = f'out/{key}/hist'
    r = subprocess.run(['./venv/bin/python', 'crop.py', q, a, out, '20', '한국사'], capture_output=True, text=True, env={**os.environ, 'CROP_DPI': '160', 'CROP_Q': '70'})
    print(key, r.stdout.strip(), r.stderr.strip()[-160:])
    man[key] = {'title': title, 'hist': json.load(open(out + '/meta.json'))}
old = json.load(open('manifest_hist.json')) if os.path.exists('manifest_hist.json') else {}
old.update(man)
json.dump(old, open('manifest_hist.json', 'w'), ensure_ascii=False)
