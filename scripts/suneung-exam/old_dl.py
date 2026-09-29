import json, re, os, zipfile, subprocess, pymupdf
rows = json.load(open('boards_old.json'))
def get(i):
    p = f'old/dl/{i}.bin'
    if not os.path.exists(p) or os.path.getsize(p) < 1000:
        subprocess.run(['curl', '-s', '-m', '300', '-L', f'https://www.suneung.re.kr/boardCnts/fileDown.do?fileSeq={i}', '-o', p], check=True)
    return p
def key_of(txt, b):
    m = re.search(r'(20\d\d) (?:(\d)월 )?(국어|수학|영어)', txt)
    y = int(m.group(1)); mo = m.group(2)
    return (f'{y}-csat' if b == 1500234 else f"{y}-{'jun' if mo == '6' else 'sep'}"), m.group(3)
res = {}
for b, pg, txt, ids in rows:
    if not re.search(r'국어|수학|영어', txt) or '과학' in txt or '제2외국어' in txt: continue
    key, subj = key_of(txt, b)
    d = f'old/{key}/{subj}'; os.makedirs(d, exist_ok=True)
    e = {}
    for i in ids:
        p = get(i)
        if open(p, 'rb').read(4) == b'%PDF':
            doc = pymupdf.open(p)
            t = doc[0].get_text()
            if '대본' in t[:400]: kind = 's'
            elif len(doc) <= 4 and ('정답' in t): kind = 'a'
            else: kind = 'q'
            if subj == '수학':
                # 가형(이과)만 쓴다: 정답표는 ( 가형 ), 문제지는 1번이 벡터·극한 등이라 가형 정답표와 짝지을 수 없어 문제지는 두 개 중 첫째(가형)
                if kind == 'a' and '나형' in t[:300].replace(' ', ''): continue
                if kind == 'q' and os.path.exists(f'{d}/q.pdf'): continue
            dest = f'{d}/{kind}.pdf'
            open(dest, 'wb').write(open(p, 'rb').read()); e[kind] = dest
        else:
            z = zipfile.ZipFile(p)
            for info in z.infolist():
                n = info.filename
                if not (info.flag_bits & 0x800):
                    try: n = n.encode('cp437').decode('cp949')
                    except Exception: pass
                if not n.lower().endswith('.pdf'): continue
                if '짝' in n or '나형' in n: continue
                if '대본' in n:
                    dest = f'{d}/s.pdf'; open(dest, 'wb').write(z.read(info)); e['s'] = dest; continue
                dest = f'{d}/q.pdf'; open(dest, 'wb').write(z.read(info)); e['q'] = dest; e['qname'] = n
    res[f'{key}/{subj}'] = e
json.dump(res, open('old_files.json', 'w'), ensure_ascii=False, indent=0)
for k, v in sorted(res.items()): print(k, sorted(v))
