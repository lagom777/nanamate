"""영어 듣기평가 음원 → 회차마다 한 파일(모노 64kbps CBR mp3) + 문항 시작 시각(meta.json 의 audio).
KICE 기출 게시판(1500234 수능, 1500236 6·9월 모의평가) 영어 행의 음원 zip(kse_dl.py·old_dl.py 는 건너뛴다)을 받아
트랙(안내멘트 · 문제 01~15 · 문제 16~17)을 이어 붙이고, 트랙 경계를 문항 시작 시각으로 쓴다.
트랙이 하나뿐인 회차(2018학년도 수능)는 답 쓰는 시간(9초 넘는 무음)이 끝나는 곳을 다음 문항 시작으로 잡는다.
usage (작업 디렉터리에서, ffmpeg 필요):
  python3 eng_audio.py          # → boards_eng.json, eaudio/<회차>/a.zip, r2/<회차>/english/listen-<md5 8자>.mp3, meta.json 의 audio
  python3 eng_audio.py --check  # 트랙이 나뉜 회차로 무음 규칙이 트랙 경계와 맞는지만 확인
  cd r2 && for f in */english/listen-*.mp3; do ROOT=$PWD ../r2up.sh $f; done   # R2 nanamate-suneung 에 올리기
"""
import hashlib, io, json, os, re, subprocess, sys, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
EXAM = os.path.join(HERE, '..', '..', 'public', 'learn', 'suneung-exam')
SR = 44100
LIST = 'https://www.suneung.re.kr/boardCnts/list.do?boardID={}&m=0403&s=suneung&page={}&searchStr='


def boards():
    if os.path.exists('boards_eng.json'):
        return json.load(open('boards_eng.json'))
    out = []
    for b, pages in ((1500234, range(1, 12)), (1500236, range(1, 24))):
        for pg in pages:
            h = subprocess.run(['curl', '-s', '-m', '30', '-L', LIST.format(b, pg)], capture_output=True).stdout.decode('utf-8', 'ignore')
            for r in re.findall(r'<tr.*?</tr>', h[h.find('<tbody'):], re.S):
                txt = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', r)).strip()
                m = re.search(r'^\d+ (20\d\d) (?:(\d)월 )?영어', txt)
                if not m or int(m.group(1)) < 2018:
                    continue
                key = f'{m.group(1)}-csat' if b == 1500234 else f"{m.group(1)}-{'jun' if m.group(2) == '6' else 'sep'}"
                out.append({'key': key, 'txt': txt[:80], 'files': re.findall(r"fn_fileDown\('([0-9a-f]+)'\);\" title='([^']*)'", r)})
    json.dump(out, open('boards_eng.json', 'w'), ensure_ascii=False, indent=0)
    return out


def download(row):
    au = [(i, n) for i, n in row['files'] if n.lower().endswith('.zip') and re.search(r'듣기|음원|mp3', n, re.I) and '대본' not in n]
    assert len(au) == 1, (row['key'], row['files'])
    p = f"eaudio/{row['key']}/a.zip"
    os.makedirs(os.path.dirname(p), exist_ok=True)
    if not os.path.exists(p) or os.path.getsize(p) < 100000:
        subprocess.run(['curl', '-s', '-m', '900', '-L', f'https://www.suneung.re.kr/boardCnts/fileDown.do?fileSeq={au[0][0]}', '-o', p], check=True)
    return p


def tracks(zpath):
    """[(문항 번호 · 0=안내 · 16=16~17번 · None=통째 한 파일, 이름, mp3)] — zip 안 zip·폴더·macOS '._' 파일도 처리"""
    out = []

    def walk(z):
        for info in z.infolist():
            n = info.filename
            if not (info.flag_bits & 0x800):
                try: n = n.encode('cp437').decode('cp949')
                except Exception: pass
            base = n.rsplit('/', 1)[-1]
            if info.is_dir() or base.startswith('._') or '__MACOSX' in n:
                continue
            if base.lower().endswith('.zip'):
                walk(zipfile.ZipFile(io.BytesIO(z.read(info))))
            elif base.lower().endswith('.mp3'):
                m = re.search(r'문제\D*(\d+)', base)
                out.append((int(m.group(1)) if m else 0 if '안내' in base else None, base, z.read(info)))
    walk(zipfile.ZipFile(zpath))
    return sorted(out, key=lambda t: -1 if t[0] is None else t[0])


def pcm(mp3):
    return subprocess.run(['ffmpeg', '-v', 'error', '-i', 'pipe:0', '-ac', '1', '-ar', str(SR), '-f', 's16le', 'pipe:1'], input=mp3, capture_output=True, check=True).stdout


def silences(raw):
    err = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', 'pipe:0', '-af', 'silencedetect=noise=-45dB:d=1.5', '-f', 'null', '-'],
                         input=raw, capture_output=True).stderr.decode()
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', err)]
    en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', err)]
    return list(zip(st, en))


def by_silence(raw):
    """트랙이 하나뿐인 회차: 문항마다 끝에 답 쓰는 무음(12~15초)이 있고, 16~17번 담화 뒤에는 두 번 있다.
    끝에서 17번째~3번째 긴 무음(1~15번 문항 뒤)이 끝나는 곳 = 2~15번 · 16~17번 시작,
    1번 시작 = 1번 뒤 긴 무음 앞에서 가장 가까운 2초 넘는 무음(안내 멘트 끝)이 끝나는 곳(1번 안 '1번' 뒤 숨 고르기는 1.5초쯤)."""
    sil = silences(raw)
    long = [s for s in sil if s[1] - s[0] >= 9]
    after = long[-17:-2]
    assert len(after) == 15, len(long)
    t = {str(q): round(after[q - 2][1], 2) for q in range(2, 17)}
    t['1'] = round(max(e for s, e in sil if e - s >= 2 and e <= after[0][0] - 10), 2)
    return t


def build(row):
    key = row['key']
    tr = tracks(download(row))
    if len(tr) == 1 and tr[0][0] is None:
        raw = pcm(tr[0][2])
        q = by_silence(raw)
    else:
        assert [t[0] for t in tr] == list(range(17)), (key, [t[1] for t in tr])
        parts, q, at = [], {}, 0
        for n, name, mp3 in tr:
            if n:
                q[str(n)] = round(at / 2 / SR, 2)
            parts.append(pcm(mp3))
            at += len(parts[-1])
        raw = b''.join(parts)
    mp3 = subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', 'pipe:0', '-c:a', 'libmp3lame', '-b:a', '64k', '-f', 'mp3', 'pipe:1'],
                         input=raw, capture_output=True, check=True).stdout
    name = f'listen-{hashlib.md5(mp3).hexdigest()[:8]}.mp3'
    d = f'r2/{key}/english'
    os.makedirs(d, exist_ok=True)
    for old in os.listdir(d):
        os.remove(f'{d}/{old}')
    open(f'{d}/{name}', 'wb').write(mp3)
    dur = round(len(raw) / 2 / SR, 1)
    mf = os.path.join(EXAM, key, 'english', 'meta.json')
    meta = json.load(open(mf))
    meta['audio'] = {'file': name, 'dur': dur, 'q': dict(sorted(q.items(), key=lambda kv: int(kv[0])))}
    open(mf, 'w').write(json.dumps(meta, ensure_ascii=False))
    print(key, name, f'{len(mp3) / 1e6:.1f}MB', f'{dur:.0f}s', 'silence' if len(tr) == 1 else 'tracks', flush=True)


def check(rows):
    """트랙이 나뉜 회차를 이어 붙여 by_silence 가 트랙 경계를 다시 찾는지"""
    for row in rows:
        tr = tracks(download(row))
        if len(tr) == 1:
            continue
        parts, truth, at = [], {}, 0
        for n, name, mp3 in tr:
            if n:
                truth[str(n)] = at / 2 / SR
            parts.append(pcm(mp3))
            at += len(parts[-1])
        try:
            got = by_silence(b''.join(parts))
            err = max(abs(got[k] - truth[k]) for k in truth)
            print(row['key'], 'max err %.2fs' % err, flush=True)
        except AssertionError as e:
            print(row['key'], 'FAIL', e, flush=True)


if __name__ == '__main__':
    rows = boards()
    only = os.environ.get('ONLY')
    rows = [r for r in rows if not only or r['key'] in only.split(',')]
    if '--check' in sys.argv:
        check(rows)
    else:
        for r in rows:
            build(r)
