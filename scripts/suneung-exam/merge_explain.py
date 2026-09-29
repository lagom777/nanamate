import json, os, glob, sys
from check_out import check
DEST = '/Users/kg/coding/nanamate/public/learn/suneung-exam/explain'
tot = 0
for f in sorted(glob.glob('grok-out/*.json')):
    name = os.path.basename(f)[:-5]
    if name.endswith('.log') or name.startswith('_'): continue
    if os.path.exists(f'{DEST}/{name}.json') and name in ('2026-csat-phys1','2026-csat-bio1','2027-sep-phys1','2027-sep-bio1'): continue
    r = check(name)
    if not r: continue
    d = json.load(open(f))
    out = {}
    for i in r['match']:
        e = d[str(i)]
        if e.get('confidence') == 'low': continue
        if any(b[0] == i for b in r['bad_html']): continue
        out[str(i)] = e['html'].strip()
    if not out: continue
    # 파일명: <key>-<sub>.json  (name 은 이미 그 형태)
    json.dump(out, open(f'{DEST}/{name}.json', 'w'), ensure_ascii=False, indent=0)
    tot += len(out)
    print(name, len(out), 'entries; dropped', 20 - len(out))
print('total', tot)
