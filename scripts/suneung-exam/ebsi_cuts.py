import subprocess, re, html, json, sys, time
SOC = {'생활과 윤리':'lifeeth','윤리와 사상':'ethth','한국지리':'kgeo','세계지리':'wgeo','동아시아사':'eahist','세계사':'whist','경제':'econ','정치와 법':'pol','사회·문화':'soc','사회문화':'soc'}
SCI = {'물리학Ⅰ':'phys1','화학Ⅰ':'chem1','생명과학Ⅰ':'bio1','지구과학Ⅰ':'earth1','물리학Ⅱ':'phys2','화학Ⅱ':'chem2','생명과학Ⅱ':'bio2','지구과학Ⅱ':'earth2'}
def post(path, **d):
    a = ['curl', '-s', '-m', '40', '-A', 'Mozilla/5.0', '-X', 'POST']
    for k, v in d.items(): a += ['--data-urlencode', f'{k}={v}']
    return subprocess.run(a + [f'https://www.ebsi.co.kr/ebs/xip/xipa/{path}.ajax'], capture_output=True).stdout.decode('utf-8', 'ignore')
def table(year, month, tab):
    tabs = json.loads(post('retrievePastGrdCutTabList', year=year, stdntGrd=3, month=month))['result']
    code = next((t['code'] for t in tabs if tab in t['value']), None)
    if not code: print('tabs?', year, month, [(t['value']) for t in tabs], file=sys.stderr); return {}
    h = post('retrievePastGrdCutList', year=year, stdntGrd=3, month=month, subjCd=code)
    out = {}
    # 과목 덩어리: 과목 이름 … 표
    parts = re.split(r'(?=평균\s*:)', h)
    for i in range(1, len(parts)):
        name = html.unescape(re.sub(r'<[^>]+>', ' ', parts[i - 1])).split()
        seg = parts[i]
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', seg, re.S)
        cuts = {}
        for r in rows:
            c = [html.unescape(re.sub(r'<[^>]+>', '', x)).strip() for x in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.S)]
            if len(c) >= 2 and re.fullmatch(r'[1-8]', c[0]): cuts[int(c[0])] = int(c[1]) if re.fullmatch(r'\d+', c[1]) else None
        import itertools
        tail = list(itertools.takewhile(lambda x: not re.fullmatch(r'[\d.]+', x), reversed(name)))[::-1]
        out[' '.join(tail)] = [cuts.get(g) for g in range(1, 9)]
    return out
if __name__ == '__main__':
    tab, keys = sys.argv[1], sys.argv[2:]
    res = {}
    for key in keys:
        y, k = key.split('-'); mo = {'csat': '11', 'jun': '06', 'sep': '09'}[k]
        res[key] = table(y, mo, tab); print(key, {n: v for n, v in list(res[key].items())[:2]}, len(res[key]), file=sys.stderr)
        time.sleep(0.5)
    json.dump(res, sys.stdout, ensure_ascii=False)
