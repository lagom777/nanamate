"""사탐 묶음 문항([a～b] 다음 자료를 보고…): 공통 자료를 앞 문항에서 떼어 a·b 문항 그림 위에 붙인다.
usage: soc_sets.py  (작업 디렉터리 past/work) → r2/<key>/<sub>/qNN.webp 덮어쓰기 + sets.json(조정값)"""
import pymupdf, glob, re, os, json, sys
from PIL import Image, ImageChops
SUBS = ['lifeeth','ethth','kgeo','wgeo','eahist','whist','econ','pol','soc']
ZOOM = 150 / 72; GAP = 10
def ink(img):
    return ImageChops.difference(img, Image.new('L', img.size, 255)).point(lambda p: 255 if p > 40 else 0).getbbox()
def render(page, rect):
    pix = page.get_pixmap(matrix=pymupdf.Matrix(ZOOM, ZOOM), clip=rect, colorspace=pymupdf.csGRAY)
    return Image.frombytes('L', (pix.width, pix.height), pix.samples)
def found_of(doc):
    found = {}
    for pi, page in enumerate(doc):
        W, H = page.rect.width, page.rect.height
        for x0, y0, x1, y1, t, *_ in page.get_text('words'):
            m = re.fullmatch(r'(\d{1,2})\.', t)
            if not m or y0 > H * 0.93 or y0 < H * 0.07: continue
            n = int(m.group(1)); col = 0 if x0 < W / 2 else 1
            if x0 - (0 if col == 0 else W / 2) > 0.12 * W or not 1 <= n <= 20: continue
            found.setdefault(n, (pi, col, y0, x0))
    return found
jobs = [(f, f.split('/')[1], SUBS[int(os.path.basename(f)[2:4]) - 1]) for f in sorted(glob.glob('dl/*/사회탐구/0_*.pdf'))]
jobs += [(f, '2027-csat', SUBS[int(f[-5]) - 1]) for f in sorted(glob.glob('../../csat27/dl2/42_?.pdf'))]
out = {}
for f, key, sub in jobs:
    doc = pymupdf.open(f); found = None
    for pi, page in enumerate(doc):
        for m in re.finditer(r'\[\s*(\d{1,2})\s*[~～∼]\s*(\d{1,2})\s*\]', page.get_text()):
            a, b = int(m.group(1)), int(m.group(2))
            found = found or found_of(doc)
            W, H = page.rect.width, page.rect.height
            hits = page.search_for(m.group(0))
            assert len(hits) == 1, (key, sub, m.group(0), hits)
            hr = hits[0]; col = 0 if hr.x0 < W / 2 else 1; left, right = (0, W / 2) if col == 0 else (W / 2, W)
            pa = found[a]
            if not (pa[0] == pi and pa[1] == col and pa[2] > hr.y0):
                print('MULTI-COLUMN', key, sub, a, b, 'header', pi, col, round(hr.y0), 'qa', pa); continue
            src = '../../csat27/work/soc/%s' % sub if key == '2027-csat' else f'soc/{key}/{sub}'
            dst = f'sets/{key}/{sub}'; os.makedirs(dst, exist_ok=True)
            # 자료(머리글~a번 앞)
            mat = render(page, pymupdf.Rect(left + 6, hr.y0 - 4, right - 6, pa[2] - 5))
            bb = ink(mat); mat = mat.crop((max(0, bb[0] - 8), max(0, bb[1] - 8), min(mat.width, bb[2] + 8), min(mat.height, bb[3] + 8)))
            mat_left = max(0, bb[0] - 8)
            rec = {}
            # 앞 문항: 머리글 위에서 끊는다
            prev = [n for n in found if found[n][0] == pi and found[n][1] == col and found[n][2] < hr.y0]
            if prev:
                p = max(prev, key=lambda n: found[n][2]); old = Image.open(f'{src}/q{p:02d}.webp').convert('L')
                im = render(page, pymupdf.Rect(left + 6, found[p][2] - 5, right - 6, hr.y0 - 4)); b2 = ink(im)
                im = im.crop((max(0, b2[0] - 8), max(0, b2[1] - 8), min(im.width, b2[2] + 8), min(im.height, b2[3] + 8)))
                im = im.crop((0, 0, min(im.width, old.width), im.height))
                im.save(f'{dst}/q{p:02d}.webp', 'WEBP', quality=75, method=6); rec[p] = [0, 0, im.width, im.height, old.width, old.height]
            for n in (a, b):
                q = Image.open(f'{src}/q{n:02d}.webp').convert('L')
                pn = found[n]; qleft = (pn[3] - ((0 if pn[1] == 0 else doc[pn[0]].rect.width / 2) + 6)) * ZOOM - 8
                base = min(mat_left, qleft); mx, qx = round(mat_left - base), round(qleft - base)
                Wd = max(mx + mat.width, qx + q.width); Ht = mat.height + GAP + q.height
                cv = Image.new('L', (Wd, Ht), 255); cv.paste(mat, (mx, 0)); cv.paste(q, (qx, mat.height + GAP))
                cv.save(f'{dst}/q{n:02d}.webp', 'WEBP', quality=75, method=6); rec[n] = [qx, mat.height + GAP, Wd, Ht, q.width, q.height]
            out[f'{key}/{sub}'] = {**out.get(f'{key}/{sub}', {}), **{str(k): v for k, v in rec.items()}}
            print(key, sub, m.group(0), 'prev', prev and max(prev, key=lambda n: found[n][2]), 'mat', mat.size)
json.dump(out, open('sets.json', 'w'))
print(len(out), 'papers')
