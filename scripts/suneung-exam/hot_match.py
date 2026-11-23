"""문항 그림(qNN.webp)을 문제지 PDF 쪽 그림에서 직접 찾아 ①~⑤ 자리(hot)를 낸다 — 자르기 규칙을 다시 계산하지 않으므로
손으로 다시 자른 그림(쪽 머리 줄을 잘라 냄·위를 넓힘)에도 맞는다. ex2028.py 와 같은 생각이지만 OpenCV 없이 Pillow 만 쓴다.
usage: hot_match.py <문제지.pdf> <그림 폴더> <dpi> <문항 수> [단답형 번호,…]  → 표준출력에 {번호: [폭, 높이, [[x,y,w,h]×5]]} JSON
"""
import sys, re, json
import pymupdf
from PIL import Image, ImageChops, ImageStat

pdf, imgdir, dpi, nq = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
numeric = set(int(x) for x in sys.argv[5].split(',')) if len(sys.argv) > 5 and sys.argv[5] else set()
Z = dpi / 72; CIRC = '①②③④⑤'
doc = pymupdf.open(pdf)
pages, chars, found = [], [], {}
for pi, pg in enumerate(doc):
    pm = pg.get_pixmap(dpi=dpi, colorspace=pymupdf.csGRAY)
    pages.append(Image.frombytes('L', (pm.width, pm.height), pm.samples))
    cs = []
    for b in pg.get_text('rawdict')['blocks']:
        for l in b.get('lines', []):
            for sp in l['spans']:
                for c in sp['chars']:
                    if c['c'] in CIRC:
                        cs.append((c['c'], [v * Z for v in c['bbox']]))
    chars.append(cs)
    W, H = pg.rect.width, pg.rect.height
    for x0, y0, x1, y1, t, *_ in pg.get_text('words'):
        m = re.fullmatch(r'(\d{1,2})\.', t)
        if m and H * 0.05 < y0 < H * 0.95 and 1 <= int(m.group(1)) <= nq and (x0 if x0 < W / 2 else x0 - W / 2) < 0.12 * W:
            found.setdefault(int(m.group(1)), (pi, x0 * Z, y0 * Z))
out = {}
for n in range(1, nq + 1):
    im = Image.open(f'{imgdir}/q{n:02d}.webp').convert('L'); w, h = im.size
    pi, gx, gy = found[n]
    probe = im.crop((0, 0, w, min(h, 110)))
    best = None
    for y in range(int(gy) - 70, int(gy) + 6):
        for x in range(int(gx) - 30, int(gx) + 6):
            if x < 0 or y < 0:
                continue
            d = ImageStat.Stat(ImageChops.difference(probe, pages[pi].crop((x, y, x + probe.width, y + probe.height)))).sum[0]
            if best is None or d < best[0]:
                best = (d, x, y)
    d, x, y = best
    assert d / (probe.width * probe.height) < 12, (n, d / (probe.width * probe.height))
    if n in numeric:
        continue
    inside = [(c, bb) for c, bb in chars[pi] if x - 2 <= bb[0] and bb[2] <= x + w + 2 and y - 2 <= bb[1] and bb[3] <= y + h + 2]
    inside.sort(key=lambda r: (round(r[1][1] / 6), r[1][0])); pick = None
    for st in range(len(inside) - 5, -1, -1):   # 읽는 순서로 마지막 ①→⑤ 한 벌 = 선지
        if [c for c, _ in inside[st:st + 5]] == list(CIRC):
            pick = inside[st:st + 5]; break
    if pick:
        out[str(n)] = [w, h, [[round(bb[0] - x - 3), round(bb[1] - y - 3), round(bb[2] - bb[0] + 6), round(bb[3] - bb[1] + 6)] for _, bb in pick]]
    else:
        print('NO HOT', n, file=sys.stderr)
json.dump(out, sys.stdout, ensure_ascii=False, separators=(',', ':'))
