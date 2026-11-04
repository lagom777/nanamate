"""문항 그림(수학·과탐 8과목·한국사) 위 ①~⑤ 자리: 문제지 PDF 의 글자 위치 → 문항 그림(q01.webp …) 픽셀.
결과 public/learn/suneung-exam/hot/<과목>.json = {회차: {번호: [그림 폭, 높이, [[x, y, w, h] ×5]]}} — 풀어보기가 그 자리에 투명 단추를 얹는다.
문항 자르기는 crop.py(과탐·한국사)·kse_crop.py / old_crop.py(수학)의 crop_one 을 그대로 다시 계산하고(가장자리 trim 포함),
R2 의 그림 크기와 같은지 확인한다. 회차·과목마다 DPI(140·150·160·180) 중 크기가 맞는 값을 고른다.
usage (작업 디렉터리에서, venv 에 pymupdf·pillow):  python3 choices_items.py [과목 …]   # 기본 전부, ONLY=2026-csat,… 로 일부 회차만
"""
import concurrent.futures as cf, io, json, os, re, subprocess, sys, urllib.request, zipfile
import pymupdf
from PIL import Image, ImageChops, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
EXAM = os.path.join(HERE, '..', '..', 'public', 'learn', 'suneung-exam')
R2 = 'https://pub-920d78ae5be2443d84da6b3e8a54a5af.r2.dev/'
LIST = 'https://www.suneung.re.kr/boardCnts/list.do?boardID={}&m=0403&s=suneung&page={}&searchStr='
CIRC = '①②③④⑤'
SCI = {'phys1': '물리학Ⅰ', 'bio1': '생명과학Ⅰ', 'chem1': '화학Ⅰ', 'earth1': '지구과학Ⅰ', 'phys2': '물리학Ⅱ', 'chem2': '화학Ⅱ', 'bio2': '생명과학Ⅱ', 'earth2': '지구과학Ⅱ'}
DPIS = (140, 150, 160, 180)


def boards():
    if os.path.exists('boards_items.json'):
        return json.load(open('boards_items.json'))
    out = []
    for b, pages in ((1500234, range(1, 12)), (1500236, range(1, 24))):
        for pg in pages:
            h = subprocess.run(['curl', '-s', '-m', '30', '-L', LIST.format(b, pg)], capture_output=True).stdout.decode('utf-8', 'ignore')
            for r in re.findall(r'<tr.*?</tr>', h[h.find('<tbody'):], re.S):
                txt = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', r)).strip()
                m = re.search(r'^\d+ (20\d\d) (?:(\d)월 )?(수학|과학탐구|한국사)', txt)
                if not m or int(m.group(1)) < 2017:
                    continue
                key = f'{m.group(1)}-csat' if b == 1500234 else f"{m.group(1)}-{'jun' if m.group(2) == '6' else 'sep'}"
                out.append({'key': key, 'subj': m.group(3), 'files': re.findall(r"fn_fileDown\('([0-9a-f]+)'\);\" title='([^']*)'", r)})
    json.dump(out, open('boards_items.json', 'w'), ensure_ascii=False, indent=0)
    return out


def get(fid):
    p = f'qpdf/dl/{fid}.bin'
    os.makedirs('qpdf/dl', exist_ok=True)
    if not os.path.exists(p) or os.path.getsize(p) < 1000:
        subprocess.run(['curl', '-s', '-m', '900', '-L', f'https://www.suneung.re.kr/boardCnts/fileDown.do?fileSeq={fid}', '-o', p], check=True)
    return open(p, 'rb').read()


def pdfs_of(data):
    """첨부 하나 → [(이름, PDF 바이트)] (zip 안 zip 도)"""
    if data[:4] == b'%PDF':
        return [('', data)]
    out = []
    try:
        z = zipfile.ZipFile(io.BytesIO(data))
    except zipfile.BadZipFile:
        return out
    for info in z.infolist():
        n = info.filename
        if not (info.flag_bits & 0x800):
            try: n = n.encode('cp437').decode('cp949')
            except Exception: pass
        n = os.path.basename(n)
        if n.lower().endswith('.pdf'):
            out.append((n, z.read(info)))
        elif n.lower().endswith('.zip'):
            out += pdfs_of(z.read(info))
    return out


def norm(s):
    return s.replace(' ', '').replace('Ⅱ', '2').replace('II', '2').replace('Ⅰ', '1').replace('I', '1').replace('물리학', '물리')


def question_pdf(row, sub):
    """홀수형 문제지 PDF 경로(qpdf/<회차>-<과목>.pdf): 정답·짝수형·나형을 빼고, 과탐은 과목 이름으로, 수학 구 교육과정은 가형"""
    p = f"qpdf/{row['key']}-{sub}.pdf"
    if os.path.exists(p):
        return p
    cands = []
    for fid, name in row['files']:
        if re.search(r'정답|대본|짝', name):
            continue
        cands += [(n or name, d) for n, d in pdfs_of(get(fid))]
    good = []
    for n, data in cands:
        if re.search(r'짝|정답|나형', n):
            continue
        if sub in SCI and not re.search(norm(SCI[sub]) + r'(?![0-9])', norm(n)):
            continue
        d = pymupdf.open(stream=data, filetype='pdf')
        t = d[0].get_text()
        if '정답' in t[:300] or len(d) < 2:
            continue
        if sub == 'math' and int(row['key'][:4]) < 2022 and '가형' not in n and '가형' not in t.replace(' ', '')[:3000]:
            continue
        if sub == 'hist' and '짝수' in t[:3000]:
            continue
        good.append((n, data))
    assert len(good) >= 1, (row['key'], sub, [n for n, _ in cands])
    open(p, 'wb').write(good[0][1])
    return p


# ───── 자르기 다시 계산 (crop.py · kse_crop.py crop_one) ─────
def trim_box(img, pad=8):
    bb = ImageChops.difference(img, Image.new('L', img.size, 255)).point(lambda p: 255 if p > 40 else 0).getbbox()
    if not bb:
        return (0, 0, img.width, img.height)
    return (max(0, bb[0] - pad), max(0, bb[1] - pad), min(img.width, bb[2] + pad), min(img.height, bb[3] + pad))


def margin_numbers(page, lo, hi):
    W, H = page.rect.width, page.rect.height
    res = []
    for x0, y0, x1, y1, t, *_ in page.get_text('words'):
        m = re.fullmatch(r'(\d{1,2})\.', t)
        if not m or y0 > H * 0.93 or y0 < H * 0.07:
            continue
        n = int(m.group(1))
        col = 0 if x0 < W / 2 else 1
        if x0 - (0 if col == 0 else W / 2) > 0.12 * W or not (lo <= n <= hi):
            continue
        res.append((n, col, y0, x0))
    return res


def set_pages(doc):
    for i in range(1, len(doc)):
        t = doc[i].get_text()
        if '짝수형' in t or '1번부터 17번까지는' in t:
            return list(range(i))
    return list(range(len(doc)))


def found_of(doc, sub, key):
    found = {}
    def scan(pages, lo, hi):
        for pi in pages:
            for n, col, y0, x0 in margin_numbers(doc[pi], lo, hi):
                if n not in found:
                    found[n] = (pi, col, y0, x0)
    if sub != 'math':
        scan(range(len(doc)), 1, 20)   # crop.py: 모든 쪽
    elif int(key[:4]) >= 2022:
        pages = set_pages(doc)
        hdr = lambda pi, s: any(l.strip() == s for l in doc[pi].get_text().split('\n'))
        first_prob = next(pi for pi in pages if hdr(pi, '(확률과 통계)'))
        scan([pi for pi in pages if pi < first_prob], 1, 22)
        scan([pi for pi in pages if hdr(pi, '(미적분)')], 23, 30)
    else:
        scan(set_pages(doc), 1, 30)
    return found


def clip_of(doc, found, n, sub):
    """crop_one 그대로: (쪽, 자르기 상자, 가릴 쪽 번호 상자들)"""
    pi, col, y0, x0 = found[n]
    page = doc[pi]
    W, H = page.rect.width, page.rect.height
    nxt = [found[m][2] for m in found if found[m][0] == pi and found[m][1] == col and found[m][2] > y0 + 1]
    limit = min(nxt) - 4 if nxt else H * 0.965
    left, right = (0, W / 2) if col == 0 else (W / 2, W)
    words = page.get_text('words')
    ws = [w for w in words if left <= w[0] < right and w[1] >= y0 - 5]
    ck = [w[1] for i, w in enumerate(ws) if w[4] == '*' and i + 1 < len(ws) and ws[i + 1][4] == '확인']
    cp = [w[1] for w in words if w[4] == '저작권은' and w[1] > y0]
    if cp:
        limit = min(limit, min(cp) - 3)
    if sub == 'math':
        dd = [w[1] for w in ws if '단답형' in w[4] and w[1] > y0 + 8]
        if dd:
            limit = min(limit, min(dd) - 3)
    ckY = min(ck) if ck and min(ck) < limit else None
    if ckY is not None:
        limit = min(limit, ckY - 3)
    inside = [w for w in ws if w[3] <= limit and w[1] < limit]
    last = max(w[3] for w in inside) if inside else limit
    cand = last + 26
    dr = [d['rect'] for d in page.get_drawings() if d['rect'].x1 > left and d['rect'].x0 < right and d['rect'].y0 > y0]
    pagebox = lambda r: r.y0 > H * 0.88 and r.width < W * 0.1
    footer = lambda r: pagebox(r) or (ckY is not None and r.y0 >= ckY - 16)
    for r in dr:
        if ckY is not None and not pagebox(r) and footer(r) and r.y0 > last + 1:
            cand = min(cand, r.y0 - 1)
    body = [r.y1 for r in dr if not footer(r) and r.y1 <= limit and r.y0 < cand + 200]
    if body:
        cand = max(cand, max(body) + 4)
    for r in dr:
        if ckY is not None and not pagebox(r) and footer(r) and r.y0 > last + 1:
            cand = min(cand, r.y0 - 1)
    masks = [r for r in dr if pagebox(r)]
    return page, pymupdf.Rect(left + 6, y0 - (11 if sub == 'math' else 5), right - 6, min(limit, cand)), masks


def render_box(page, clip, masks, dpi):
    z = dpi / 72
    pix = page.get_pixmap(matrix=pymupdf.Matrix(z, z), clip=clip, colorspace=pymupdf.csGRAY)
    img = Image.frombytes('L', (pix.width, pix.height), pix.samples)
    if masks:
        dw = ImageDraw.Draw(img)
        for r in masks:
            dw.rectangle(((r.x0 - clip.x0) * z - 3, (r.y0 - clip.y0) * z - 3, (r.x1 - clip.x0) * z + 3, (r.y1 - clip.y0) * z + 3), fill=255)
    return trim_box(img)


def webp_size(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Range': 'bytes=0-63'})
    try:
        b = urllib.request.urlopen(req, timeout=30).read()
    except Exception:
        return None
    fmt = b[12:16]
    if fmt == b'VP8 ':
        return int.from_bytes(b[26:28], 'little') & 0x3fff, int.from_bytes(b[28:30], 'little') & 0x3fff
    if fmt == b'VP8L':
        v = int.from_bytes(b[21:25], 'little')
        return (v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1
    if fmt == b'VP8X':
        return int.from_bytes(b[24:27], 'little') + 1, int.from_bytes(b[27:30], 'little') + 1
    return None


def choices_in(page, clip, box, dpi):
    """잘라 낸 문항 그림 안 ①~⑤ 중 읽는 순서로 처음 ①→⑤ 한 줄 → [[x, y, w, h] ×5] (그림 픽셀)"""
    z = dpi / 72
    gl = []
    for b in page.get_text('rawdict', clip=clip)['blocks']:
        for l in b.get('lines', []):
            for s in l['spans']:
                for c in s['chars']:
                    if c['c'] not in CIRC:
                        continue
                    r = pymupdf.Rect(c['bbox'])
                    if not clip.contains(pymupdf.Point((r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2)):
                        continue
                    x, y = (r.x0 - clip.x0) * z - box[0], (r.y0 - clip.y0) * z - box[1]
                    gl.append([round(x), round(y), round(r.width * z), round(r.height * z), CIRC.index(c['c']) + 1])
    gl.sort(key=lambda g: g[1] + g[3] / 2)
    line, prev = 0, None
    for g in gl:
        yc = g[1] + g[3] / 2
        if prev is None or yc - prev > 6:
            line += 1
        prev = yc
        g.append(line)
    gl.sort(key=lambda g: (g[5], g[0]))
    run = []
    for g in gl:
        if g[4] == 1:
            run = [g]
        elif run and g[4] == len(run) + 1:
            run.append(g)
        if len(run) == 5:
            return [g[:4] for g in run]
    return None


def build(row, sub, entry):
    key = row['key']
    doc = pymupdf.open(question_pdf(row, sub))
    found = found_of(doc, sub, key)
    nq = len(entry['a'])
    numeric = set(entry.get('n') or [])
    sizes = {}
    with cf.ThreadPoolExecutor(8) as ex:
        for n, s in zip(range(1, nq + 1), ex.map(lambda n: webp_size(f'{R2}{key}/{sub}/q{n:02d}.webp'), range(1, nq + 1))):
            sizes[n] = s
    dpi, out, miss, off = None, {}, [], []
    for n in range(1, nq + 1):
        if n not in found or not sizes.get(n):
            miss.append(n)
            continue
        page, clip, masks = clip_of(doc, found, n, sub)
        tries = [dpi] if dpi else DPIS
        hit = None
        for d in tries:
            box = render_box(page, clip, masks, d)
            if abs(box[2] - box[0] - sizes[n][0]) <= 2 and abs(box[3] - box[1] - sizes[n][1]) <= 2:
                hit = (d, box)
                break
        if not hit:
            off.append(n)
            continue
        dpi = hit[0]
        if n in numeric:
            continue
        ch = choices_in(page, clip, hit[1], dpi)
        if ch:
            out[str(n)] = [sizes[n][0], sizes[n][1], ch]
        else:
            miss.append(n)
    mc = nq - len(numeric)
    print(key, sub, f'dpi {dpi}', f'{len(out)}/{mc}', ('빠짐 ' + ','.join(map(str, miss))) if miss else '', ('크기 다름 ' + ','.join(map(str, off))) if off else '', flush=True)
    return out


if __name__ == '__main__':
    want = sys.argv[1:] or ['math', 'hist'] + list(SCI)
    only = set(filter(None, os.environ.get('ONLY', '').split(',')))
    exams = json.load(open(os.path.join(EXAM, 'exams.json')))['exams']
    rows = boards()
    os.makedirs(os.path.join(EXAM, 'hot'), exist_ok=True)
    for sub in want:
        subj = '수학' if sub == 'math' else '한국사' if sub == 'hist' else '과학탐구'
        dest = os.path.join(EXAM, 'hot', f'{sub}.json')
        res = json.load(open(dest)) if os.path.exists(dest) else {}
        for e in exams:
            if sub not in e or (only and e['key'] not in only):
                continue
            row = next((r for r in rows if r['key'] == e['key'] and r['subj'] == subj), None)
            if not row:
                print('no board row', e['key'], sub)
                continue
            try:
                res[e['key']] = build(row, sub, e[sub])
            except AssertionError as err:
                print('SKIP', e['key'], sub, err)
        open(dest, 'w').write(json.dumps(res, ensure_ascii=False, separators=(',', ':')))
