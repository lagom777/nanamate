"""KICE(suneung.re.kr) 기출 게시판에서 과학탐구 문제·정답 파일 ID를 모아 boards.json 으로 저장.
boards: 1500234 = 수능 기출, 1500236 = 6·9월 모의평가.  usage: python3 fetch_boards.py
"""
import re, subprocess, json
out = []
for b, pages in ((1500234, range(1, 5)), (1500236, range(1, 11))):
    for pg in pages:
        h = subprocess.run(['curl', '-s', '-m', '30', '-L', f'https://www.suneung.re.kr/boardCnts/list.do?boardID={b}&m=0403&s=suneung&page={pg}&searchStr='], capture_output=True).stdout.decode('utf-8', 'ignore')
        i = h.find('<tbody')
        for r in re.findall(r'<tr.*?</tr>', h[i:], re.S):
            txt = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', r)).strip()
            ids = re.findall(r"fn_fileDown\('([0-9a-f]+)'\)", r)
            if '과학탐구' in txt and len(ids) >= 2:
                out.append((b, pg, txt[:60], ids[:2]))
json.dump(out, open('boards.json', 'w'), ensure_ascii=False)
print(len(out), 'rows')
