"""시험지 단 위 ①~⑤ 자리(풀어보기에서 누르면 그 답을 고른다): KICE 문제지 PDF 의 글자 위치 → 단 이미지 픽셀 좌표.
국어·영어 meta.json 에 choices = {구역: {번호: [[단, x, y, w, h], …(① 부터 ⑤ 까지)]}} 를 넣는다.
단 자르기는 kse_crop.py·old_crop.py 의 make_strips 를 그대로 다시 계산해 meta.json 의 단 수·폭·높이와 맞는지 먼저 확인한다.
쪽 번호 상자를 잘못 찾아 단 마지막 줄이 잘렸던 단은 고친 footer_top 으로 다시 만들어 r2/ 에 두고 meta 를 바꾼다(r2up.sh 로 올리기).
문항마다 앵커(문항 번호)부터 다음 앵커 전까지에서 읽는 순서로 처음 ①→②→③→④→⑤ 가 다 나오는 줄을 고른다
(어법·무관한 문장·문장 넣기처럼 지문 속 ①~⑤ 가 선지인 문항도 그대로 맞는다).
usage (작업 디렉터리에서, venv 에 pymupdf·pillow, CROP_DPI 는 원래 자르기와 같은 140):
  python3 choices.py [회차 …]        # SUBJ=국어,영어 (기본 둘 다) → qpdf/<회차>-<과목>.pdf 받아 두고 meta.json 갱신
"""
import hashlib, io, json, os, re, subprocess, sys, zipfile
import pymupdf
from PIL import Image, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
EXAM = os.path.join(HERE, '..', '..', 'public', 'learn', 'suneung-exam')
ZOOM = float(os.environ.get('CROP_DPI', '140')) / 72
SUBS = {'국어': 'korean', '영어': 'english'}
CIRC = '①②③④⑤'
LIST = 'https://www.suneung.re.kr/boardCnts/list.do?boardID={}&m=0403&s=suneung&page={}&searchStr='
XL, XR = 78, 764   # kse_crop.py 와 같은 단 좌우(pt)


def boards():
    """국어·영어 행의 첨부(이름 포함) — boards_ko_en.json 에 담아 둔다"""
    if os.path.exists('boards_ko_en.json'):
        return json.load(open('boards_ko_en.json'))
    out = []
    for b, pages in ((1500234, range(1, 12)), (1500236, range(1, 24))):
        for pg in pages:
            h = subprocess.run(['curl', '-s', '-m', '30', '-L', LIST.format(b, pg)], capture_output=True).stdout.decode('utf-8', 'ignore')
            for r in re.findall(r'<tr.*?</tr>', h[h.find('<tbody'):], re.S):
                txt = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', r)).strip()
                m = re.search(r'^\d+ (20\d\d) (?:(\d)월 )?(국어|영어)', txt)
                if not m or int(m.group(1)) < 2018:
                    continue
                key = f'{m.group(1)}-csat' if b == 1500234 else f"{m.group(1)}-{'jun' if m.group(2) == '6' else 'sep'}"
                out.append({'key': key, 'subj': m.group(3), 'files': re.findall(r"fn_fileDown\('([0-9a-f]+)'\);\" title='([^']*)'", r)})
    json.dump(out, open('boards_ko_en.json', 'w'), ensure_ascii=False, indent=0)
    return out


def get(fid):
    p = f'qpdf/dl/{fid}.bin'
    os.makedirs('qpdf/dl', exist_ok=True)
    if not os.path.exists(p) or os.path.getsize(p) < 1000:
        subprocess.run(['curl', '-s', '-m', '600', '-L', f'https://www.suneung.re.kr/boardCnts/fileDown.do?fileSeq={fid}', '-o', p], check=True)
    return open(p, 'rb').read()


def zname(info):
    n = info.filename
    if not (info.flag_bits & 0x800):
        try: n = n.encode('cp437').decode('cp949')
        except Exception: pass
    return n


def question_pdf(row):
    """홀수형 문제지 PDF 바이트: 첨부 PDF·zip(안 zip 포함)에서 정답·대본·음원·짝수형을 빼고, 첫 쪽에 과목명이 있는 것"""
    p = f"qpdf/{row['key']}-{row['subj']}.pdf"
    if os.path.exists(p):
        return p
    cands = []
    for fid, name in row['files']:
        if re.search(r'정답|대본|음원|듣기|mp3', name, re.I) or '짝' in name:
            continue
        data = get(fid)
        if data[:4] == b'%PDF':
            cands.append((name, data))
            continue
        try:
            z = zipfile.ZipFile(io.BytesIO(data))
        except zipfile.BadZipFile:
            continue
        for info in z.infolist():
            n = zname(info)
            if n.lower().endswith('.pdf') and not re.search(r'짝|정답|대본|나형', n):
                cands.append((n, z.read(info)))
    good = []
    for n, data in cands:
        d = pymupdf.open(stream=data, filetype='pdf')
        t = d[0].get_text()
        if '정답' in t[:200] or '대본' in t[:400] or len(d) < 4:
            continue
        good.append((n, data))
    assert len(good) == 1, (row['key'], row['subj'], [n for n, _ in good], [n for n, _ in cands])
    open(p, 'wb').write(good[0][1])
    return p


# ───── kse_crop.py 와 같은 자르기 ─────
def set_pages(doc):
    for i in range(1, len(doc)):
        t = doc[i].get_text()
        if '짝수형' in t or '1번부터 17번까지는' in t:
            return list(range(i))
    return list(range(len(doc)))


def margin_numbers(page, lo=1, hi=45):
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


def header_bottom(page):
    W, H = page.rect.width, page.rect.height
    ys = [d['rect'].y1 for d in page.get_drawings() if d['rect'].width > W * 0.7 and d['rect'].height < 4 and H * 0.05 < d['rect'].y0 < H * 0.30]
    return (max(ys) + 4) if ys else H * 0.13


def footer_top(page):
    """쪽 번호 상자 위. 상자는 가운데 아래의 폭 20pt·높이 10pt 넘는 작은 네모 — 예전 규칙(kse_crop.py)은 쪽 아래 12% 안의 밑줄·보기 상자 테두리도
    상자로 보고 그 높이에서 잘라 단 마지막 줄(선지 ⑤ 등)이 빠졌다"""
    W, H = page.rect.width, page.rect.height
    ys = [d['rect'].y0 for d in page.get_drawings() if d['rect'].y0 > H * 0.88 and 20 < d['rect'].width < W * 0.1 and 10 < d['rect'].height < 40 and abs(d['rect'].x0 + d['rect'].x1 - W) < W * 0.12]
    return (min(ys) - 4) if ys else H * 0.955


def strips_of(doc, pages, keep=False):
    """make_strips 와 같은 순서·건너뛰기로 단마다 (쪽, x0, 위, 폭, 높이) — keep 이면 16단계 회색 그림도"""
    out = []
    for pi in pages:
        page = doc[pi]
        W = page.rect.width
        top, bot = header_bottom(page), footer_top(page)
        for col in (0, 1):
            x0 = XL if col == 0 else W / 2 + 4
            x1 = W / 2 - 4 if col == 0 else XR
            pix = page.get_pixmap(matrix=pymupdf.Matrix(ZOOM, ZOOM), clip=pymupdf.Rect(x0, top, x1, bot), colorspace=pymupdf.csGRAY)
            img = Image.frombytes('L', (pix.width, pix.height), pix.samples)
            bb = ImageChops.difference(img, Image.new('L', img.size, 255)).point(lambda p: 255 if p > 40 else 0).getbbox()
            hgt = min(img.height, bb[3] + 12) if bb else img.height
            if not bb or hgt < 40:
                continue
            out.append({'page': pi, 'col': col, 'x0': x0, 'top': top, 'w': img.width, 'h': hgt})
            if keep:
                out[-1]['img'] = img.crop((0, 0, img.width, hgt)).point(lambda p: (p // 16) * 17)
    return out


def sections(doc, pages, subj, key):
    if subj == '영어':
        return [('c', pages)]
    if int(key[:4]) < 2022:   # 구 교육과정 국어: 45문항 한 구역(old_crop.py)
        return [('c', pages)]
    starts = [pi for pi in pages if any(n == 35 for n, *_ in margin_numbers(doc[pi], 35, 35))]
    a, b = pages.index(starts[0]), pages.index(starts[1])
    return [('c', pages[:a]), ('a', pages[a:b]), ('b', pages[b:])]


def choices_for(doc, strips, anchors):
    """구역 하나: 문항마다 ①~⑤ 상자 [단, x, y, w, h] 다섯 개"""
    glyphs, chars = [], {}
    for idx, st in enumerate(strips):
        page = doc[st['page']]
        W = page.rect.width
        if st['page'] not in chars:   # 글자를 하나씩 읽는다(page.search_for 는 국어 PDF 에서 한 줄 아래 자리를 돌려주는 일이 있다)
            chars[st['page']] = [(c['c'], pymupdf.Rect(c['bbox'])) for b in page.get_text('rawdict')['blocks'] for l in b.get('lines', []) for s in l['spans'] for c in s['chars'] if c['c'] in CIRC]
        for ch, r in chars[st['page']]:
            if (0 if (r.x0 + r.x1) / 2 < W / 2 else 1) != st['col']:
                continue
            x, y = (r.x0 - st['x0']) * ZOOM, (r.y0 - st['top']) * ZOOM
            if 0 <= y < st['h'] and 0 <= x < st['w']:
                glyphs.append([idx, round(x), round(y), round(r.width * ZOOM), round(r.height * ZOOM), CIRC.index(ch) + 1])
    # 읽는 순서: 단 → 줄(글자 중심이 6px 안이면 같은 줄) → 왼쪽부터
    glyphs.sort(key=lambda g: (g[0], g[2] + g[4] / 2))
    line, prev = 0, None
    for g in glyphs:
        yc = g[2] + g[4] / 2
        if prev is None or g[0] != prev[0] or yc - prev[1] > 6:
            line += 1
        prev = (g[0], yc)
        g.append(line)
    glyphs.sort(key=lambda g: (g[6], g[1]))
    order = sorted(((a[0], a[1], int(n)) for n, a in anchors.items()))
    res = {}
    for i, (ai, ay, n) in enumerate(order):
        end = order[i + 1][:2] if i + 1 < len(order) else (10 ** 6, 0)
        mine = [g for g in glyphs if (ai, ay) <= (g[0], g[2] + g[4] / 2) < tuple(end)]
        run = []
        for g in mine:
            if g[5] == 1:
                run = [g]
            elif run and g[5] == len(run) + 1:
                run.append(g)
            if len(run) == 5:
                res[str(n)] = [g[:5] for g in run]
                break
    return res


def build(row):
    key, subj, sub = row['key'], row['subj'], SUBS[row['subj']]
    mf = os.path.join(EXAM, key, sub, 'meta.json')
    if not os.path.exists(mf):
        return print('no meta', key, sub)
    meta = json.load(open(mf))
    doc = pymupdf.open(question_pdf(row))
    out, bad, redo = {}, [], []
    for sec, pages in sections(doc, set_pages(doc), subj, key):
        strips, have = strips_of(doc, pages, True), meta['strips'][sec]
        same = len(strips) == len(have) and all(s['w'] == h['w'] and s['h'] >= h['h'] - 3 for s, h in zip(strips, have))
        if not same:
            bad.append(sec)
            print('STRIPS DIFFER', key, sub, sec, [(s['w'], s['h']) for s in strips][:4], [(h['w'], h['h']) for h in have][:4])
            continue
        for idx, (st, h) in enumerate(zip(strips, have)):
            if st['h'] <= h['h'] + 3:
                continue
            # 잘렸던 단: 더 긴 그림을 r2/<회차>/<과목>/<이름>.<md5 6자>.webp 로 새로 만든다(R2 는 1년 캐시라 이름을 바꾼다)
            buf = io.BytesIO()
            st['img'].save(buf, 'WEBP', lossless=True, method=6)
            name = f"{h['file'].split('.')[0]}.{hashlib.md5(buf.getvalue()).hexdigest()[:6]}.webp"
            os.makedirs(f'r2/{key}/{sub}', exist_ok=True)
            open(f'r2/{key}/{sub}/{name}', 'wb').write(buf.getvalue())
            redo.append(f"{sec}{idx}:{h['h']}→{st['h']}")
            have[idx] = {'file': name, 'w': st['w'], 'h': st['h']}
        out[sec] = choices_for(doc, strips, meta['anchors'][sec])
    if bad:
        return
    nq = {sec: len(meta['answers'][sec]) for sec in out}
    miss = {sec: [n for n in meta['anchors'][sec] if n not in out[sec]] for sec in out}
    meta['choices'] = out
    open(mf, 'w').write(json.dumps(meta, ensure_ascii=False))
    print(key, sub, {sec: f'{len(out[sec])}/{nq[sec]}' for sec in out}, {s: m for s, m in miss.items() if m} or '', ('다시 자름 ' + ' '.join(redo)) if redo else '', flush=True)


if __name__ == '__main__':
    want = set(sys.argv[1:])
    subjs = os.environ.get('SUBJ', '국어,영어').split(',')
    for row in boards():
        if row['subj'] in subjs and (not want or row['key'] in want):
            build(row)
