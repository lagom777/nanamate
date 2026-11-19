import pymupdf, glob, os, re, json, sys
from PIL import Image, ImageOps
CIRC = '①②③④⑤'; DPI = 200; Z = DPI / 72
def page_img(p):
    pm = p.get_pixmap(dpi=DPI, colorspace=pymupdf.csGRAY)
    return Image.frombytes('L', (pm.width, pm.height), pm.samples)
def glyph(img, cx, cy, r=13):
    c = img.crop((int((cx - r) * Z), int((cy - r) * Z), int((cx + r) * Z), int((cy + r) * Z)))
    b = c.point(lambda v: 255 if v < 140 else 0)
    bb = b.getbbox()
    if not bb: return None
    return b.crop(bb).resize((28, 28), Image.BILINEAR)
def dist(a, b):
    return sum(abs(x - y) for x, y in zip(a.tobytes(), b.tobytes())) / (28 * 28 * 255)
# 기준: 글자가 있는 2024 수능 사탐 정답표 9장 → 칸 위치 + 글자 틀
tmpl = {'a': [], 'p': []}; cells = None
for f in sorted(glob.glob('dl/2024-csat/사회탐구/1_*.pdf')):
    p = pymupdf.open(f)[0]; img = page_img(p)
    ws = sorted(p.get_text('words'), key=lambda w: ((w[1] + w[3]) / 2, w[0]))
    rows = {}
    for w in ws:
        rows.setdefault(round((w[1] + w[3]) / 2 / 8), []).append(w)
    cs = {}
    for k in rows:
        r = sorted(rows[k], key=lambda w: w[0]); i = 0
        while i < len(r) - 2:
            a, b, c = r[i:i + 3]
            if re.fullmatch(r'\d{1,2}', a[4]) and b[4] in CIRC and re.fullmatch(r'[23]', c[4]):
                ctr = lambda w: ((w[0] + w[2]) / 2, (w[1] + w[3]) / 2)
                cs[int(a[4])] = (ctr(b), ctr(c)); tmpl['a'].append((CIRC.index(b[4]) + 1, glyph(img, *ctr(b)))); tmpl['p'].append((int(c[4]), glyph(img, *ctr(c)))); i += 3
            else: i += 1
    assert len(cs) == 20, (f, len(cs))
    if cells is None: cells = cs
    else:
        for n in cs: assert abs(cs[n][0][0] - cells[n][0][0]) < 3 and abs(cs[n][0][1] - cells[n][0][1]) < 3, (f, n)
print('templates', len(tmpl['a']), len(tmpl['p']))
def classify(g, kind):
    sc = {}
    for lab, t in tmpl[kind]:
        d = dist(g, t); sc[lab] = min(sc.get(lab, 9), d)
    o = sorted(sc.items(), key=lambda x: x[1])
    return o[0][0], o[0][1], o[1][1]
out = {}
for f in sorted(glob.glob(sys.argv[1])):
    p = pymupdf.open(f)[0]; img = page_img(p)
    A, P, weak = [], [], []
    for n in range(1, 21):
        (ax, ay), (px, py) = cells[n]
        a, d1, d2 = classify(glyph(img, ax, ay), 'a'); pt, e1, e2 = classify(glyph(img, px, py), 'p')
        A.append(a); P.append(pt)
        if d2 - d1 < 0.04 or d1 > 0.2: weak.append((n, a, round(d1, 3), round(d2, 3)))
    out[os.path.basename(f)] = {'a': A, 'p': P}
    print(os.path.basename(f)[:12], A, sum(P), 'weak', weak)
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False)
