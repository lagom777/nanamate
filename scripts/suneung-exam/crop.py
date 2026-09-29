"""Crop per-question images out of a KICE exam PDF and read the answer key.

usage: crop.py <question.pdf> <answer.pdf> <outdir> <nq> [--first N]
Writes <outdir>/q01.webp ... and <outdir>/meta.json ({"answers":[...], "points":[...]})
"""
import sys, re, json, os, io
import pymupdf
from PIL import Image, ImageChops

qpdf, apdf, out, nq = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
LABEL = sys.argv[5] if len(sys.argv) > 5 else None
os.makedirs(out, exist_ok=True)
ZOOM = float(os.environ.get('CROP_DPI', '180')) / 72
CIRC = "①②③④⑤"

doc = pymupdf.open(qpdf)
found = {}  # qnum -> (page, col, y0, x0)
cols_by_page = {}
for pi, page in enumerate(doc):
    W, H = page.rect.width, page.rect.height
    words = page.get_text("words")
    for x0, y0, x1, y1, t, *_ in words:
        m = re.fullmatch(r"(\d{1,2})\.", t)
        if not m or y0 > H * 0.93 or y0 < H * 0.07:
            continue
        n = int(m.group(1))
        col = 0 if x0 < W / 2 else 1
        colx0 = 0 if col == 0 else W / 2
        # the number sits at the left margin of its column
        if x0 - colx0 > 0.12 * W:
            continue
        if n < 1 or n > nq:
            continue
        # keep the first occurrence at left margin, earliest page
        if n not in found:
            found[n] = (pi, col, y0, x0)

missing = [n for n in range(1, nq + 1) if n not in found]
if missing:
    print("MISSING", missing)

def trim(img):
    g = img.convert("L")
    bg = Image.new("L", g.size, 255)
    diff = ImageChops.difference(g, bg).point(lambda p: 255 if p > 40 else 0)
    bb = diff.getbbox()
    if not bb:
        return img
    pad = 8
    return img.crop((max(0, bb[0] - pad), max(0, bb[1] - pad), min(img.width, bb[2] + pad), min(img.height, bb[3] + pad)))

texts = {}
for n in range(1, nq + 1):
    if n not in found:
        continue
    pi, col, y0, x0 = found[n]
    page = doc[pi]
    W, H = page.rect.width, page.rect.height
    # next question in the same column/page
    nxt = [found[m][2] for m in found if found[m][0] == pi and found[m][1] == col and found[m][2] > y0 + 1]
    limit = min(nxt) - 4 if nxt else H * 0.965
    left = 0 if col == 0 else W / 2
    right = W / 2 if col == 0 else W
    ws = [w for w in page.get_text("words") if left <= w[0] < right and w[1] >= y0 - 5]
    ck = [w[1] for i, w in enumerate(ws) if w[4] == "*" and i + 1 < len(ws) and ws[i + 1][4] == "확인"]
    cp = [w[1] for w in page.get_text('words') if w[4] == '저작권은' and w[1] > y0]
    if cp:
        limit = min(limit, min(cp) - 3)
    ckY = min(ck) if ck and min(ck) < limit else None
    if ckY is not None:
        limit = min(limit, ckY - 3)
    inside = [w for w in ws if w[3] <= limit and w[1] < limit]
    last = max(w[3] for w in inside) if inside else limit
    cand = last + 26  # 분수 모양 선지의 분모는 글자 상자에 잡히지 않아 여유를 둔다(빈 여백은 trim이 제거)
    dr = [d["rect"] for d in page.get_drawings() if d["rect"].x1 > left and d["rect"].x0 < right and d["rect"].y0 > y0]
    def pagebox(r):
        return r.y0 > H * 0.88 and r.width < W * 0.1
    def footer(r):
        return pagebox(r) or (ckY is not None and r.y0 >= ckY - 16)
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
    clip = pymupdf.Rect(left + 6, y0 - 5, right - 6, bottom)
    texts[n] = " ".join(page.get_text("text", clip=clip).split())
    pix = page.get_pixmap(matrix=pymupdf.Matrix(ZOOM, ZOOM), clip=clip, colorspace=pymupdf.csGRAY)
    img = Image.frombytes("L", (pix.width, pix.height), pix.samples)
    if masks:
        from PIL import ImageDraw
        dw = ImageDraw.Draw(img)
        for r in masks:
            dw.rectangle(((r.x0 - clip.x0) * ZOOM - 3, (r.y0 - clip.y0) * ZOOM - 3, (r.x1 - clip.x0) * ZOOM + 3, (r.y1 - clip.y0) * ZOOM + 3), fill=255)
    img = trim(img)
    img.save(os.path.join(out, f"q{n:02d}.webp"), "WEBP", quality=int(os.environ.get('CROP_Q', '75')), method=6)

json.dump(texts, open(os.path.join(out, "text.json"), "w"), ensure_ascii=False)
# answer key
adoc = pymupdf.open(apdf)
pages = [p.get_text() for p in adoc]
if LABEL:
    sel = [t for t in pages if re.search(r"\(\s*" + LABEL + r"\s*\)", t)]
    if sel:
        pages = sel
text = "\n".join(pages)
toks = text.split()
ans, pts = {}, {}
i = 0
while i < len(toks) - 2:
    if re.fullmatch(r"\d{1,2}", toks[i]) and (toks[i + 1] in list(CIRC) or re.fullmatch(r"\d{1,3}", toks[i + 1])) and re.fullmatch(r"[1-9]", toks[i + 2]):
        n = int(toks[i])
        if 1 <= n <= nq and n not in ans:
            a = toks[i + 1]
            ans[n] = CIRC.index(a) + 1 if a in CIRC else int(a)
            pts[n] = int(toks[i + 2])
            i += 3
            continue
    i += 1
meta = {"answers": [ans.get(n) for n in range(1, nq + 1)], "points": [pts.get(n) for n in range(1, nq + 1)]}
json.dump(meta, open(os.path.join(out, "meta.json"), "w"), ensure_ascii=False)
print("cropped", len(found), "answers", sum(1 for a in meta["answers"] if a), "points sum", sum(p or 0 for p in meta["points"]))
