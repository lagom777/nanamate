import pymupdf, re, json, os, sys
files = json.load(open('kse_files.json'))
for key in sorted(os.listdir('out2')):
    f = files[f'{key}/영어'].get('s')
    if not f:
        print('no script', key); continue
    d = pymupdf.open(f)
    lines = []
    for p in d:
        for l in p.get_text().split('\n'):
            l = l.rstrip()
            if not l.strip() or '저작권은' in l or re.fullmatch(r'\s*-\s*\d+\s*-\s*', l) or re.search(r'학년도 (대학수학능력시험|\d월 모의)', l) or '듣기평가 대본' in l or '듣기 평가 대본' in l:
                continue
            lines.append(l)
    text = '\n'.join(lines)
    # 문항 시작 위치
    marks = []
    want = 1
    for m in re.finditer(r'(?m)^(?:\[(\d+)[～~](\d+)\]|(\d{1,2})\.)\s', text):
        n = int(m.group(1) or m.group(3))
        if n == want:
            marks.append((n, m.start(), m.group(2)))
            want = int(m.group(2)) + 1 if m.group(2) else want + 1
    scripts = {}
    for i, (n, s, second) in enumerate(marks):
        e = marks[i + 1][1] if i + 1 < len(marks) else len(text)
        body = text[s:e].strip()
        body = re.sub(r'(?m)(?<![.?!”"])\n(?=[A-Za-z])', ' ', body)  # 줄바꿈 접기(영어 줄)
        scripts[str(n)] = body
        if second:
            scripts[str(int(second))] = f'({n}번과 이어지는 하나의 담화입니다. {n}번 대본을 보세요.)'
    have = [n for n in range(1, 18) if str(n) not in scripts]
    mf = f'out2/{key}/영어/meta.json'
    meta = json.load(open(mf)); meta['script'] = scripts; json.dump(meta, open(mf, 'w'), ensure_ascii=False)
    print(key, len(scripts), 'missing' if have else 'ok', have)
