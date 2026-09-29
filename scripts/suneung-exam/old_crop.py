"""수학(문항별)·국어/영어(단 조각) 크롭. usage: kse_crop.py <exam-key> <subject> [outroot]
결과: <outroot>/<key>/<sub>/... + meta.json  (정답은 kse_answers.json)
"""
import sys, re, json, os
import pymupdf
from PIL import Image, ImageChops, ImageDraw

key, sub = sys.argv[1], sys.argv[2]
ROOT = sys.argv[3] if len(sys.argv) > 3 else 'out2'
OUT = os.path.join(ROOT, key, sub)
os.makedirs(OUT, exist_ok=True)
files = json.load(open('old_files.json'))[f'{key}/{sub}']
_a = json.load(open('old_answers.json'))[f'{key}/{sub}']
ANS = {'c': {n: v for n, v in _a.items()}}
ZOOM = float(os.environ.get('CROP_DPI', '150')) / 72
QUAL = int(os.environ.get('CROP_Q', '62'))
doc = pymupdf.open(files['q'])

def set_pages():
    end = len(doc)
    for i in range(1, len(doc)):
        t = doc[i].get_text()
        if '짝수형' in t or '1번부터 17번까지는' in t:
            end = i
            break
    return list(range(end))

PAGES = set_pages()

def trim(img, padx=8):
    g = img.convert('L')
    bg = Image.new('L', g.size, 255)
    diff = ImageChops.difference(g, bg).point(lambda p: 255 if p > 40 else 0)
    bb = diff.getbbox()
    if not bb:
        return img
    return img.crop((max(0, bb[0] - padx), max(0, bb[1] - padx), min(img.width, bb[2] + padx), min(img.height, bb[3] + padx)))

def render(page, clip, masks=()):
    pix = page.get_pixmap(matrix=pymupdf.Matrix(ZOOM, ZOOM), clip=clip, colorspace=pymupdf.csGRAY)
    img = Image.frombytes('L', (pix.width, pix.height), pix.samples)
    if masks:
        dw = ImageDraw.Draw(img)
        for r in masks:
            dw.rectangle(((r.x0 - clip.x0) * ZOOM - 3, (r.y0 - clip.y0) * ZOOM - 3, (r.x1 - clip.x0) * ZOOM + 3, (r.y1 - clip.y0) * ZOOM + 3), fill=255)
    return img

def margin_numbers(page, lo=1, hi=45):
    W, H = page.rect.width, page.rect.height
    res = []
    for x0, y0, x1, y1, t, *_ in page.get_text('words'):
        m = re.fullmatch(r'(\d{1,2})\.', t)
        if not m or y0 > H * 0.93 or y0 < H * 0.07:
            continue
        n = int(m.group(1))
        col = 0 if x0 < W / 2 else 1
        colx0 = 0 if col == 0 else W / 2
        if x0 - colx0 > 0.12 * W or not (lo <= n <= hi):
            continue
        res.append((n, col, y0, x0))
    return res

# ───────────── 수학: 문항별 크롭 ─────────────
def crop_questions(pages, lo, hi, found):
    for pi in pages:
        for n, col, y0, x0 in margin_numbers(doc[pi], lo, hi):
            if n not in found:
                found[n] = (pi, col, y0, x0)

def crop_one(n, found):
    pi, col, y0, x0 = found[n]
    page = doc[pi]
    W, H = page.rect.width, page.rect.height
    nxt = [found[m][2] for m in found if found[m][0] == pi and found[m][1] == col and found[m][2] > y0 + 1]
    limit = min(nxt) - 4 if nxt else H * 0.965
    left = 0 if col == 0 else W / 2
    right = W / 2 if col == 0 else W
    words = page.get_text('words')
    ws = [w for w in words if left <= w[0] < right and w[1] >= y0 - 5]
    ck = [w[1] for i, w in enumerate(ws) if w[4] == '*' and i + 1 < len(ws) and ws[i + 1][4] == '확인']
    cp = [w[1] for w in words if w[4] == '저작권은' and w[1] > y0]
    dd = [w[1] for w in ws if '단답형' in w[4] and w[1] > y0 + 8]   # 단답형 머리글은 다음 문항 몫
    if cp:
        limit = min(limit, min(cp) - 3)
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
    bottom = min(limit, cand)
    clip = pymupdf.Rect(left + 6, y0 - 11, right - 6, bottom)
    text = ' '.join(page.get_text('text', clip=clip).split())
    img = trim(render(page, clip, masks))
    img.save(os.path.join(OUT, f'q{n:02d}.webp'), 'WEBP', quality=QUAL, method=6)
    return text

def do_math():
    hdr = lambda pi, s: any(l.strip() == s for l in doc[pi].get_text().split('\n'))
    found = {}
    crop_questions(PAGES, 1, 30, found)
    missing = [n for n in range(1, 31) if n not in found]
    if missing:
        print('MISSING', key, missing)
    texts = {n: crop_one(n, found) for n in sorted(found)}
    ans = [None] * 30
    pts = [None] * 30
    for n, (a, p, isnum) in ANS['c'].items():
        ans[int(n) - 1] = a
        pts[int(n) - 1] = p
    meta = {'answers': ans, 'points': pts, 'numeric': [n for n, v in ANS['c'].items() if v[2]]}
    json.dump(texts, open(os.path.join(OUT, 'text.json'), 'w'), ensure_ascii=False)
    json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'), ensure_ascii=False)
    print('math', key, 'cropped', len(found), 'sum', sum(p or 0 for p in pts if p))

# ───────────── 국어/영어: 단 조각 + 앵커 ─────────────
XL, XR = 78, 764   # 조각 좌우 (pt, A3 스캔 좌표계 842 폭 기준)

def header_bottom(page):
    W, H = page.rect.width, page.rect.height
    ys = []
    for d in page.get_drawings():
        r = d['rect']
        if r.width > W * 0.7 and r.height < 4 and H * 0.05 < r.y0 < H * 0.30:
            ys.append(r.y1)
    return (max(ys) + 4) if ys else H * 0.13

def footer_top(page):
    W, H = page.rect.width, page.rect.height
    ys = [d['rect'].y0 for d in page.get_drawings() if d['rect'].y0 > H * 0.88 and d['rect'].width < W * 0.1 and d['rect'].height < 40]
    return (min(ys) - 4) if ys else H * 0.955

def make_strips(pages, prefix):
    """pages -> strips 리스트: [{file, page, col, top}], 그리고 문항 앵커 후보"""
    strips, cands = [], []
    for pi in pages:
        page = doc[pi]
        W, H = page.rect.width, page.rect.height
        top, bot = header_bottom(page), footer_top(page)
        nums = margin_numbers(page, 1, 45)
        for col in (0, 1):
            x0 = XL if col == 0 else W / 2 + 4
            x1 = W / 2 - 4 if col == 0 else XR
            clip = pymupdf.Rect(x0, top, x1, bot)
            img = render(page, clip)
            # 아래쪽 빈 여백만 잘라낸다 (위는 그대로)
            g = ImageChops.difference(img, Image.new('L', img.size, 255)).point(lambda p: 255 if p > 40 else 0)
            bb = g.getbbox()
            hgt = min(img.height, (bb[3] + 12)) if bb else img.height
            if not bb or hgt < 40:
                continue
            img = img.crop((0, 0, img.width, hgt)).point(lambda p: (p // 16) * 17)   # 16단계 회색 + 무손실 webp: 글자는 또렷하고 용량은 절반
            idx = len(strips)
            name = f'{prefix}{idx:02d}.webp'
            img.save(os.path.join(OUT, name), 'WEBP', lossless=True, method=6)
            strips.append({'file': name, 'w': img.width, 'h': img.height})
            for n, c, y0, xx in nums:
                if c == col and top <= y0 < top + hgt / ZOOM:
                    cands.append((idx, n, round((y0 - top) * ZOOM - 6)))
    return strips, cands

def pick_anchors(cands, lo, hi):
    """읽는 순서대로 lo, lo+1, ... 순으로만 채택"""
    anchors, want = {}, lo
    for idx, n, y in cands:
        if n == want and want <= hi:
            anchors[n] = [idx, max(0, y)]
            want += 1
    return anchors

def do_paper(sections):
    """sections: [(name, lo, hi)] — 페이지 범위는 앵커로 자동 분할"""
    # 문항 번호 첫 등장 페이지로 구역 나누기
    firsts = []
    for name, lo, hi in sections:
        pass
    return None

def do_korean():
    strips, cands = make_strips(PAGES, 'c')
    an = pick_anchors(cands, 1, 45)
    miss = [n for n in range(1, 46) if n not in an]
    if miss:
        print('MISSING', key, miss)
    meta = {'strips': {'c': strips}, 'anchors': {'c': an},
            'answers': {'c': [ANS['c'][str(n)][0] for n in range(1, 46)]},
            'points': {'c': [ANS['c'][str(n)][1] for n in range(1, 46)]}}
    json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'), ensure_ascii=False)
    print('korean', key, len(strips), 'strips')

def do_english():
    strips, cands = make_strips(PAGES, 'e')
    an = pick_anchors(cands, 1, 45)
    miss = [n for n in range(1, 46) if n not in an]
    if miss:
        print('MISSING', key, miss)
    meta = {'strips': {'c': strips}, 'anchors': {'c': an},
            'answers': {'c': [ANS['c'][str(n)][0] for n in range(1, 46)]},
            'points': {'c': [ANS['c'][str(n)][1] for n in range(1, 46)]}}
    json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'), ensure_ascii=False)
    print('english', key, len(strips), 'strips')

{'수학': do_math, '국어': do_korean, '영어': do_english}[sub]()
