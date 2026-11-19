"""choices_items.py(TOL=1) 로 hot 을 새로 만든 바로 뒤에 한 번만 돌린다(두 번 돌리면 두 번 옮겨진다): 사탐 묶음 문항처럼 '원래 자르기'와 다르게 다시 만든 그림의 ①~⑤ 자리를 옮긴다.
usage: python3 hot_fix.py <sets.json>   (sets.json = {회차/과목: {번호: [dx, dy, 새 폭, 새 높이, 원래 폭, 원래 높이]}} — 묶음 자료를 위에 붙여 문항이 dy 만큼 내려간 것)
끝에 사탐·확통·기하 hot 의 모든 자리가 그림 안에 있는지 확인한다(1쪽 과목 탭을 잘라 낸 그림 포함)."""
import json, os, sys

EXAM = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'learn', 'suneung-exam')
SUBS = ['lifeeth', 'ethth', 'kgeo', 'wgeo', 'eahist', 'whist', 'econ', 'pol', 'soc', 'mathprob', 'mathgeo']
sets = json.load(open(sys.argv[1]))
hot = {s: json.load(open(os.path.join(EXAM, 'hot', s + '.json'))) for s in SUBS}
moved = 0
for ks, items in sets.items():
    key, sub = ks.split('/')
    for n, (dx, dy, w, h, ow, oh) in items.items():
        e = hot[sub].get(key, {}).get(n)
        if not e:
            continue
        e[2] = [[x + dx, y + dy, cw, ch] for x, y, cw, ch in e[2]]
        e[0], e[1] = w, h
        moved += 1
# fix/ 에 둔 그림(R2 원본 대신 쓰는 것)은 그 파일 크기로
import glob, struct
for p in glob.glob(os.path.join(EXAM, 'fix', '*', '*', 'q*.webp')):
    key, sub, q = p.split(os.sep)[-3:]
    e = hot.get(sub, {}).get(key, {}).get(str(int(q[1:3])))
    if not e:
        continue
    b = open(p, 'rb').read(30)
    assert b[12:16] == b'VP8 ', p
    e[0], e[1] = struct.unpack('<H', b[26:28])[0] & 0x3fff, struct.unpack('<H', b[28:30])[0] & 0x3fff
bad = []
for s in SUBS:
    for key, qs in hot[s].items():
        for n, (w, h, ch) in qs.items():
            if any(x < -2 or y < -2 or x + cw > w + 2 or y + c_h > h + 2 for x, y, cw, c_h in ch):
                bad.append((s, key, n, w, h))
    open(os.path.join(EXAM, 'hot', s + '.json'), 'w').write(json.dumps(hot[s], ensure_ascii=False, separators=(',', ':')))
print('moved', moved, 'out of bounds', bad)
