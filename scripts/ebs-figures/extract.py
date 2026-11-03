# EBS 수능 연계 교재(수능특강·수능완성) PDF에서 그림·그래프·표 같은 '자료'만 잘라 낸다.
# 결과(webp + index.json)는 저장소 밖 폴더에 쓴다 — 교재 그림은 EBS 저작물이라 저장소·공개 버킷에 올리지 않는다.
# 쓰는 곳: 주인 계정만 보는 '수특 그림 모음'(/suneung-ebs/, worker/ebs.js). 올리기는 upload.sh.
#
#   python extract.py <교재.pdf> <출력 폴더> --sub bio1 --book 수능특강 [--pages 1-192] [--only 180,191] [--debug]
#
# 필요: PyMuPDF(pymupdf), Pillow. 쪽마다 선·면(벡터)과 사진(래스터)을 모아 덩어리로 묶고,
# 머리글·쪽 번호·단 구분선·<보기> 상자·글만 든 상자는 뺀다. 덩어리 근처의 짧은 글(그림 제목, (가)·(나))은 함께 자른다.
import argparse, io, json, os, re, sys
import pymupdf
from PIL import Image

ZOOM = 2.5          # 72dpi × 2.5 ≈ 180dpi
GAP = 8             # 이만큼 가까운 선·면은 한 덩어리
MERGE_X, MERGE_Y = 20, 12   # (가)·(나)처럼 나란한 그림은 한 장으로


def spans_of(page):
    out = []
    for b in page.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            for s in l["spans"]:
                t = s["text"].strip()
                if t:
                    out.append({"r": pymupdf.Rect(s["bbox"]), "t": t, "size": s["size"]})
    return out


def grow(r, dx, dy=None):
    dy = dx if dy is None else dy
    return pymupdf.Rect(r.x0 - dx, r.y0 - dy, r.x1 + dx, r.y1 + dy)


def area(r):
    return max(0, r.width) * max(0, r.height)


def page_state(page, spans, st):
    """장 번호·제목과 지금 쪽의 구역(개념 / 2점 / 3점)을 갱신한다."""
    W, H = page.rect.width, page.rect.height
    top = [s for s in spans if s["r"].y1 < 80]
    big = sorted((s for s in top if s["size"] > 30 and re.fullmatch(r"\d{1,2}", s["t"])), key=lambda s: s["r"].x0)
    if big:  # 장 첫 쪽: 큰 번호('0' '4'처럼 글자마다 나뉘기도 함) + 제목
        n = int("".join(s["t"] for s in big))
        title = " ".join(s["t"] for s in sorted(top, key=lambda s: s["r"].x0) if 15 < s["size"] < 30)
        st.update(ch=n, title=title.strip() or st.get("title"), kind="개념")
    if any("테스트" in s["t"] for s in top):  # '수능 2점 테스트' · '수능 3점 테스트' 머리띠
        digits = {s["t"] for s in top if s["t"] in ("2", "3")}
        st["kind"] = "3점" if "3" in digits else "2점" if "2" in digits else st.get("kind", "개념")
    # 홀수 쪽 아래 '12강 제목' 으로 장 번호를 맞춰 본다
    for s in spans:
        m = re.match(r"^(\d{1,2})강\s+(.+)$", s["t"])
        if m and s["r"].y0 > H - 50:
            if st.get("ch") != int(m.group(1)):
                st.update(ch=int(m.group(1)), title=m.group(2).strip())
    return st


def figures(page, spans):
    W, H = page.rect.width, page.rect.height
    # 머리띠('수능 2점 테스트')나 장 제목이 있는 쪽만 위 72pt를 비우고, 이어지는 쪽은 위 48pt만
    top_cut = 72 if any("테스트" in s["t"] or s["size"] > 30 for s in spans if s["r"].y1 < 80) else 48
    els = []
    white = lambda c: c is not None and min(c) > 0.97
    for d in page.get_drawings():
        r = d["rect"]
        if r.is_empty and (r.width < 0.5 and r.height < 0.5):
            continue
        if (d.get("fill") is None or white(d.get("fill"))) and (d.get("color") is None or white(d.get("color"))):
            continue                                            # 흰 선·흰 면(종이에서 안 보임)
        if r.x0 < -1 or r.y0 < -1 or r.x1 > W + 1 or r.y1 > H + 1:   # 쪽 밖으로 나간 장식·재단선
            continue
        if r.width > 0.85 * W or r.height > 0.8 * H:          # 쪽 테두리·띠
            continue
        if (r.width < 3 and r.height > 150) or (r.height < 3 and r.width > 330):   # 단 구분선
            continue
        if r.height > 250 and r.width < 0.12 * W:               # 옆 날개(개념 체크)를 묶는 대괄호
            continue
        if r.y1 < top_cut or r.y0 > H - 45:                          # 머리글·쪽 번호
            continue
        els.append([pymupdf.Rect(r), 1, 0])
    for im in page.get_image_info():
        r = pymupdf.Rect(im["bbox"])
        if r.width < 12 or r.height < 12 or r.width > 0.85 * W:
            continue
        if r.y1 < top_cut or r.y0 > H - 45:
            continue
        els.append([r, 0, 1])
    # 가까운 것끼리 묶기
    groups = []
    for r, nd, ni in els:
        g = [pymupdf.Rect(r), nd, ni]
        merged = True
        while merged:
            merged = False
            for o in groups:
                if grow(o[0], GAP).intersects(g[0]):
                    g = [g[0] | o[0], g[1] + o[1], g[2] + o[2]]
                    groups.remove(o)
                    merged = True
                    break
        groups.append(g)
    # 나란한 덩어리 합치기
    changed = True
    while changed:
        changed = False
        for i in range(len(groups)):
            for j in range(i + 1, len(groups)):
                a, b = groups[i], groups[j]
                if grow(a[0], MERGE_X, MERGE_Y).intersects(b[0]) and min(a[1] + a[2], b[1] + b[2]) >= 3:
                    groups[i] = [a[0] | b[0], a[1] + b[1], a[2] + b[2]]
                    groups.pop(j)
                    changed = True
                    break
            if changed:
                break
    out = []
    for r, nd, ni in groups:
        if r.width < 50 or r.height < 30 or nd + ni < 4:
            continue
        if r.height > 300 and r.height > 3 * r.width:          # 옆 날개(개념 체크) 세로띠
            continue
        # 안쪽 글자 + 바로 옆에 붙은 짧은 이름표(축 이름·범례 글자)
        inside = [s for s in spans if grow(r, 2).intersects(s["r"])
                  or (grow(r, 9, 3).intersects(s["r"]) and len(s["t"]) <= 24 and s["size"] < 8.6)]
        # <보기> 상자, 글만 든 상자는 뺀다
        if any(s["t"].replace(" ", "") == "보기" and r.y0 - 24 < s["r"].y0 < r.y0 + 22 and r.x0 <= s["r"].x0 <= r.x1 for s in spans):
            continue                                            # 이름표가 테두리 위·안에 붙은 <보기>
        if {"ㄱ.", "ㄴ."} <= {s["t"][:2] for s in inside}:     # ㄱ. ㄴ. ㄷ. 항목이 든 상자
            continue
        txt = sum(area(s["r"] & r) for s in inside)
        if ni == 0 and txt > 0.42 * area(r):
            continue
        # 이름표가 여러 조각이면 같은 줄로 이어진 조각까지(‘(가) 발현 ’ + ‘남자’)
        got = {id(s) for s in inside}
        for _ in range(6):
            more = [s for s in spans if id(s) not in got and len(s["t"]) <= 24 and s["size"] < 8.6 and any(
                abs(s["r"].y0 - t["r"].y0) < 3 and -1 <= max(s["r"].x0 - t["r"].x1, t["r"].x0 - s["r"].x1) <= 4 for t in inside)]
            if not more:
                break
            inside += more
            got |= {id(s) for s in more}
        # 그림 안 글자와 아래 붙은 짧은 제목을 함께
        box = pymupdf.Rect(r)
        for s in inside:
            box |= s["r"]
        cap = []   # 바로 아래 한 줄(그림 제목·(가)·(나))만 — 문제 글로 번지지 않게 처음 덩어리 기준
        under = [s for s in spans if r.x0 - 4 <= (s["r"].x0 + s["r"].x1) / 2 <= r.x1 + 4 and 0 <= s["r"].y0 - box.y1 <= 14]
        if under:
            line_y = min(s["r"].y0 for s in under)
            line = [s for s in under if abs(s["r"].y0 - line_y) < 4]
            text = "".join(s["t"] for s in spans if abs(s["r"].y0 - line_y) < 4)   # 그 줄 전체로 판단
            if len(text) <= 30 and not text.startswith(("이에", "①", "보기")) and not re.search(r"\?|것은|다\.$|\(단,", text):
                for s in sorted(line, key=lambda s: s["r"].x0):
                    box |= s["r"]
                    cap.append(s["t"])
        if box.width > 0.97 * W or box.height > 0.85 * H:
            continue
        out.append({"r": box, "cap": " ".join(cap), "nd": nd, "ni": ni})
    return out


def problems(spans, W):
    """문항 번호(01, 02 …)와 EBS 문항 코드([26025-0193])."""
    nums = [s for s in spans if re.fullmatch(r"0\d|[1-4]\d", s["t"]) and s["size"] >= 15]
    codes = [s for s in spans if re.fullmatch(r"\[\d{5}-\d{4}\]", s["t"])]
    out = []
    for n in nums:
        code = None
        for c in codes:
            if -16 <= c["r"].y1 - n["r"].y0 <= 14 and c["r"].x0 > n["r"].x0:
                code = c["t"].strip("[]")
                break
        out.append({"n": n["t"], "code": code, "x": n["r"].x0, "y": n["r"].y0})
    two_col = any(p["x"] > W * 0.45 for p in out) and any(p["x"] < W * 0.3 for p in out)
    return out, two_col


def owner(fig, probs, two_col, W, carry):
    cx = (fig["r"].x0 + fig["r"].x1) / 2
    col = (cx > W / 2) if two_col else False
    best = None
    for p in probs:
        pcol = (p["x"] > W / 2) if two_col else False
        if pcol == col and p["y"] < fig["r"].y0 + 6 and (best is None or p["y"] > best["y"]):
            best = p
    return best or carry.get(col) or carry.get(False)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("out")
    ap.add_argument("--sub", required=True)
    ap.add_argument("--book", required=True)
    ap.add_argument("--pages", default="")
    ap.add_argument("--only", default="")
    ap.add_argument("--debug", action="store_true")
    a = ap.parse_args()
    doc = pymupdf.open(a.pdf)
    lo, hi = 1, doc.page_count
    if a.pages:
        lo, hi = map(int, a.pages.split("-"))
    only = {int(x) for x in a.only.split(",") if x}
    os.makedirs(a.out, exist_ok=True)
    st, carry, chapters, n_fig = {"kind": "개념"}, {}, {}, 0
    for pno in range(lo, hi + 1):
        page = doc[pno - 1]
        W = page.rect.width
        spans = spans_of(page)
        page_state(page, spans, st)
        probs, two_col = problems(spans, W)
        figs = figures(page, spans)
        if (not only or pno in only) and st.get("ch"):   # 장이 시작되기 전(앞붙이)은 건너뜀
            for i, f in enumerate(sorted(figs, key=lambda f: (f["r"].x0 > W / 2 if two_col else 0, f["r"].y0))):
                p = owner(f, probs, two_col, W, carry) if st["kind"] in ("2점", "3점") else None
                clip = grow(f["r"], 4) & page.rect
                pix = page.get_pixmap(matrix=pymupdf.Matrix(ZOOM, ZOOM), clip=clip, alpha=False)
                img = Image.open(io.BytesIO(pix.tobytes("png")))
                fid = f"p{pno:03d}-{i + 1}"
                img.save(os.path.join(a.out, fid + ".webp"), "WEBP", quality=80, method=6)
                ch = chapters.setdefault(st.get("ch", 0), {"n": st.get("ch", 0), "title": st.get("title", ""), "figs": []})
                ch["figs"].append({"id": fid, "page": pno, "kind": st["kind"], "num": p and p["n"], "code": p and p["code"],
                                   "cap": f["cap"], "w": img.width, "h": img.height})
                n_fig += 1
            if a.debug:
                sh = page.new_shape()
                for f in figs:
                    sh.draw_rect(f["r"])
                sh.finish(color=(0, 0.6, 0), width=1.5)
                sh.commit()
                page.get_pixmap(matrix=pymupdf.Matrix(1.2, 1.2)).save(os.path.join(a.out, f"_debug-p{pno:03d}.png"))
        # 다음 쪽으로 이어지는 문항: 단마다 마지막 문항을 기억
        if probs and not two_col:
            carry = {False: max(probs, key=lambda p: p["y"])}
        elif probs:
            for col in (False, True):
                cs = [p for p in probs if (p["x"] > W / 2) == col]
                if cs:
                    carry[col] = max(cs, key=lambda p: p["y"])
    idx = {"sub": a.sub, "book": a.book, "chapters": [chapters[k] for k in sorted(chapters)]}
    with open(os.path.join(a.out, "index.json"), "w", encoding="utf-8") as fp:
        json.dump(idx, fp, ensure_ascii=False, indent=0)
    print(f"{a.sub} {a.book}: 그림 {n_fig}장, 장 {len(chapters)}개 → {a.out}")


if __name__ == "__main__":
    main()
