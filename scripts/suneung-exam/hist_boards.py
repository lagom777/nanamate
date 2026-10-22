"""KICE 기출 게시판에서 한국사 영역(문제·정답) 파일 ID를 모아 boards_hist.json 으로 저장.
1500234 = 수능, 1500236 = 6·9월 모의평가. 한국사는 2017학년도부터 필수·절대평가라 그 해부터 모은다.  usage: python3 hist_boards.py
"""
import re, subprocess, json
out = []
for b, pages in ((1500234, range(1, 11)), (1500236, range(1, 22))):
    for pg in pages:
        h = subprocess.run(['curl', '-s', '-m', '30', '-L', f'https://www.suneung.re.kr/boardCnts/list.do?boardID={b}&m=0403&s=suneung&page={pg}&searchStr='], capture_output=True).stdout.decode('utf-8', 'ignore')
        i = h.find('<tbody')
        for r in re.findall(r'<tr.*?</tr>', h[i:], re.S):
            txt = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', r)).strip()
            ids = re.findall(r"fn_fileDown\('([0-9a-f]+)'\)", r)
            m = re.search(r'\d+ (20\d\d) (?:\d월 )?한국사', txt)
            if m and int(m.group(1)) >= 2017:
                out.append((b, pg, txt[:80], ids))
json.dump(out, open('boards_hist.json', 'w'), ensure_ascii=False)
print(len(out), 'rows')
