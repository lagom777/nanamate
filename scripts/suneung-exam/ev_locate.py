"""해설모드 근거 상자: 해설 초안의 '근거 인용문'(문제지에 실제로 있는 글)을 문제지 PDF 에서 찾아 그림 위 좌표로 바꾼다.

초안(JSON)은 사람이든 AI 든 문제지를 읽고 쓴다. 좌표는 손으로 적지 않고 이 스크립트가 글자 자리로 계산한다.

usage
  paper (국어·영어 — 시험지 단 그림):
    ev_locate.py paper <문제지.pdf> <meta.json> <국어|영어> <회차키> <초안.json> <출력.json>
    초안 = {"c1": {"w": 정답 해설 html, "x": [선지별 한 줄 ×5], "ev": [{"c": 선지(없어도 됨), "n": 한 줄, "q": ["인용문", …]}]}, "a35": …}
    출력 = explain/<회차>-<korean|english>.json (ev 의 q 대신 b: [[구역, 단, x, y, w, h], …])
  items (수학·과탐 — 문항 그림):
    ev_locate.py items <문제지.pdf> <그림 폴더(qNN.webp)> <dpi> <초안.json> <해설 출력.json> <근거 출력.json>
    초안 = {"1": {"html": 해설 html, "ev": [{"n": 한 줄, "q": ["인용문"], "tq": ["보기 줄 인용문"], "tc": 선지}]}}
    출력 = explain/<회차>-<과목>.json ({번호: html}) 과 explain/<회차>-<과목>-ev.json ({번호: {w, h, ev: [{b, tb?, tc?, n}]}})
인용문은 띄어쓰기를 무시하고 글자 그대로 찾는다(수식 글꼴처럼 글자로 읽히지 않는 부분은 찾지 못한다 → 그 근거는 빠지고 목록에 남는다).
"""
import json, os, re, sys
import pymupdf
from PIL import Image, ImageChops, ImageStat

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def page_chars(page):
    """읽는 순서(글 흐름) 그대로 (글자, 상자) — 띄어쓰기·줄바꿈은 뺀다"""
    out = []
    for b in page.get_text('rawdict')['blocks']:
        for l in b.get('lines', []):
            for s in l['spans']:
                for c in s['chars']:
                    if not c['c'].strip():
                        continue
                    out.append((c['c'], pymupdf.Rect(c['bbox'])))
    return out


NORM = str.maketrans({'‘': "'", '’': "'", '“': '"', '”': '"', '․': '·', 'ㆍ': '·', '･': '·', '∼': '~', '～': '~'})


def norm(s):
    return re.sub(r'\s+', '', s.translate(NORM))


def find_all(chars, quote):
    """chars 에서 quote 가 나오는 모든 자리 → [[상자, …], …]"""
    text = ''.join(c for c, _ in chars).translate(NORM)
    q = norm(quote)
    res, i = [], text.find(q) if q else -1
    while i >= 0:
        res.append([r for _, r in chars[i:i + len(q)]])
        i = text.find(q, i + 1)
    return res


def lines_of(rects, pad=1.5):
    """같은 줄(세로 가운데가 3pt 안)끼리 묶은 상자들"""
    rects = sorted(rects, key=lambda r: ((r.y0 + r.y1) / 2, r.x0))
    out = []
    for r in rects:
        if out and abs((r.y0 + r.y1) / 2 - (out[-1].y0 + out[-1].y1) / 2) < 3 and r.x0 - out[-1].x1 < 20:
            out[-1] |= r
        else:
            out.append(pymupdf.Rect(r))
    return [pymupdf.Rect(r.x0 - pad, r.y0 - pad, r.x1 + pad, r.y1 + pad) for r in out]


# ───────── paper ─────────
def do_paper(pdf, meta_f, subj, key, draft_f, out_f):
    import choices as C
    doc = pymupdf.open(pdf)
    meta = json.load(open(meta_f))
    draft = json.load(open(draft_f))
    Z = C.ZOOM
    secs = dict(C.sections(doc, C.set_pages(doc), subj, key))
    geo = {}   # 구역 → 단 목록
    for sec, pages in secs.items():
        st = C.strips_of(doc, pages)
        have = meta['strips'][sec]
        assert len(st) == len(have) and all(a['w'] == b['w'] for a, b in zip(st, have)), (sec, len(st), len(have))
        geo[sec] = st
    chars = {pi: page_chars(doc[pi]) for pages in secs.values() for pi in pages}

    def place(sec, rects, page):
        W = doc[page].rect.width
        res = []
        for r in lines_of(rects):
            col = 0 if (r.x0 + r.x1) / 2 < W / 2 else 1
            for idx, st in enumerate(geo[sec]):
                if st['page'] == page and st['col'] == col:
                    x, y = (r.x0 - st['x0']) * Z, (r.y0 - st['top']) * Z
                    if -4 <= y < st['h'] and -4 <= x < st['w']:
                        res.append([sec, idx, max(0, round(x)), max(0, round(y)), round(r.width * Z), round(r.height * Z)])
                        break
        return res

    def order_of(b):
        return (b[1], b[3])

    out, miss = {}, []
    for qk, ent in draft.items():
        sec, n = qk[0], qk[1:]
        anc = meta['anchors'][sec].get(n)
        nxt = sorted((tuple(a) for k, a in meta['anchors'][sec].items() if tuple(a) > tuple(anc)))[:1] if anc else []
        ev2 = []
        for e in ent.get('ev', []):
            boxes = []
            for q in e.get('q', []):
                cands = []
                for pi in secs[sec]:
                    for rects in find_all(chars[pi], q):
                        bx = place(sec, rects, pi)
                        if bx:
                            cands.append(bx)
                if not cands:
                    miss.append((qk, q)); continue
                if anc:
                    a = tuple(anc); end = nxt[0] if nxt else (10 ** 6, 0)
                    own = [c for c in cands if a <= order_of(c[0]) < end]
                    before = [c for c in cands if order_of(c[0]) < a]
                    pick = own[0] if own else (before[-1] if before else cands[0])
                else:
                    pick = cands[0]
                boxes += pick
            if boxes:
                e2 = {k: v for k, v in e.items() if k != 'q'}
                e2['b'] = boxes
                ev2.append(e2)
        o = {k: v for k, v in ent.items() if k != 'ev'}
        if ev2:
            o['ev'] = ev2
        out[qk] = o
    open(out_f, 'w').write(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
    nb = sum(len(v.get('ev', [])) for v in out.values())
    print(f'{key} {subj}: 문항 {len(out)} · 근거 {nb} · 못 찾은 인용 {len(miss)}')
    for m in miss:
        print('  MISS', m[0], m[1][:60])


# ───────── items ─────────
def locate_item(pages, chars, img, gx_hint=None):
    """문항 그림이 놓인 (쪽, x, y) — 그림 위쪽 110px 를 쪽 그림에서 찾는다"""
    w, h = img.size
    probe = img.crop((0, 0, w, min(h, 110)))
    best = None
    for pi, pg in enumerate(pages):
        cand = gx_hint.get(pi, []) if gx_hint else []
        for gx, gy in cand:
            for y in range(int(gy) - 70, int(gy) + 6, 1):
                for x in range(int(gx) - 30, int(gx) + 6, 1):
                    if x < 0 or y < 0:
                        continue
                    d = ImageStat.Stat(ImageChops.difference(probe, pg.crop((x, y, x + probe.width, y + probe.height)))).sum[0]
                    if best is None or d < best[0]:
                        best = (d, pi, x, y)
    return best


def do_items(pdf, imgdir, dpi, draft_f, html_f, ev_f):
    Z = dpi / 72
    doc = pymupdf.open(pdf)
    pages, chars, found = [], [], {}
    end = len(doc)
    for i in range(1, len(doc)):
        if '짝수형' in doc[i].get_text():
            end = i; break
    for pi in range(end):
        pg = doc[pi]
        pm = pg.get_pixmap(dpi=dpi, colorspace=pymupdf.csGRAY)
        pages.append(Image.frombytes('L', (pm.width, pm.height), pm.samples))
        chars.append(page_chars(pg))
        W, H = pg.rect.width, pg.rect.height
        for x0, y0, x1, y1, t, *_ in pg.get_text('words'):
            m = re.fullmatch(r'(\d{1,2})\.', t)
            if m and H * .05 < y0 < H * .95 and (x0 if x0 < W / 2 else x0 - W / 2) < 0.12 * W:
                found.setdefault(int(m.group(1)), []).append((pi, x0 * Z, y0 * Z))
    draft = json.load(open(draft_f))
    html, evs, miss = {}, {}, []
    for qn, ent in draft.items():
        n = int(qn)
        html[qn] = ent['html']
        img = Image.open(f'{imgdir}/q{n:02d}.webp').convert('L')
        w, h = img.size
        hint = {}
        for pi, gx, gy in found.get(n, []):
            hint.setdefault(pi, []).append((gx, gy))
        best = locate_item(pages, chars, img, hint)
        if not best or best[0] / (min(h, 110) * w) > 14:
            print('  NO PLACE', qn); continue
        _, pi, ox, oy = best
        box = pymupdf.Rect(ox / Z, oy / Z, (ox + w) / Z, (oy + h) / Z)
        inside = [(c, r) for c, r in chars[pi] if box.contains(r)]

        def boxes_for(qs):
            out = []
            for q in qs:
                hits = find_all(inside, q)
                if not hits:
                    miss.append((qn, q)); continue
                for r in lines_of(hits[0]):
                    out.append([max(0, round(r.x0 * Z - ox)), max(0, round(r.y0 * Z - oy)), round(r.width * Z), round(r.height * Z)])
            return out
        ev2 = []
        for e in ent.get('ev', []):
            b = boxes_for(e.get('q', []))
            if not b:
                continue
            e2 = {'b': b}
            tb = boxes_for(e.get('tq', []))
            if tb:
                e2['tb'] = tb
            if e.get('tc'):
                e2['tc'] = e['tc']
            e2['n'] = e['n']
            ev2.append(e2)
        if ev2:
            evs[qn] = {'w': w, 'h': h, 'ev': ev2}
    open(html_f, 'w').write(json.dumps(html, ensure_ascii=False, separators=(',', ':')))
    open(ev_f, 'w').write(json.dumps(evs, ensure_ascii=False, separators=(',', ':')))
    print(f'해설 {len(html)} · 근거 있는 문항 {len(evs)} · 근거 {sum(len(v["ev"]) for v in evs.values())} · 못 찾은 인용 {len(miss)}')
    for m in miss:
        print('  MISS', m[0], m[1][:60])


if __name__ == '__main__':
    if sys.argv[1] == 'paper':
        do_paper(*sys.argv[2:8])
    else:
        do_items(sys.argv[2], sys.argv[3], int(sys.argv[4]), *sys.argv[5:8])
