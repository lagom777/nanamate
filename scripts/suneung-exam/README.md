# 수능 기출 문항 이미지 파이프라인

`public/learn/suneung-exam/`(문항 webp, `exams.json`)를 만든 과정. 작업 디렉터리에서 실행한다.

```bash
python3 -m venv venv && ./venv/bin/pip install pymupdf pillow
python3 fetch_boards.py      # KICE 기출 게시판 → boards.json (파일 ID)
python3 batch.py             # PDF 다운로드·압축 해제 → 문항별 webp + 정답표 → out/
python3 fix2025.py           # 2025학년도 수능 정답표는 글자가 그림이라 손으로 옮긴 값을 덮어쓴다
python3 finalize.py          # 파트 자동 분류 + public/learn/suneung-exam 으로 복사
```

- `crop.py`: 좌/우 2단 시험지에서 `N.` 로 시작하는 위치를 찾아 문항별로 자르고, 쪽번호 상자·"확인 사항"을 제외한다. 정답표는 `pdftotext`가 아니라 PyMuPDF 텍스트로 읽는다.
- `tag.py`: 문항 본문 키워드로 파트(p1~p7, b1~b8)를 자동 분류. 애매한 문항은 `finalize.py`의 `OV`에서 손으로 고친다.
- 모든 회차는 배점 합 50점, 정답 20개로 검증한다.
- 문제지 저작권은 한국교육과정평가원에 있다. 이미지 아래에 출처를 표기한다.

## 과학탐구 나머지 6과목 · 2022학년도 6월
`batch.py`는 인자로 과목(`chem1,earth1,phys2,chem2,bio2,earth2`)과 매니페스트 경로를 받고, 환경변수 `ONLY=2022-jun` 으로 한 회차만 돌린다. 새 과목은 `CROP_DPI=150 CROP_Q=62`(물Ⅰ·생Ⅰ은 180/75).
2025학년도 수능 정답표는 그림이라 `fixmore.py`에 손으로 옮겨 두었다(배점합 50 검증). `finalize2.py`가 화Ⅰ·지Ⅰ은 `tag2.py` 키워드 분류로 파트(k1~k9, e1~e6)를 붙이고, Ⅱ 4과목은 정답·배점만 넣는다. `add_2022jun.py`는 2022학년도 6월 회차를 뒤늦게 추가한 스크립트다.

## 국어·수학·영어 (`kse_*`)
```bash
python3 kse_dl.py        # KICE 게시판(boards_kse.json)에서 문제지·정답표·듣기 대본 PDF → kse2/<회차>/<과목>/
python3 kse_answers.py   # 정답표 PDF 표 파싱 (2025학년도 수능만 그림이라 손으로 kse_answers.json 에 추가, 배점합 100 검증)
python3 kse_crop.py <회차> <수학|국어|영어>   # CROP_DPI=140
python3 kse_script.py    # 영어 듣기 대본 → meta.json 의 script
python3 finalize2.py     # exams.json 병합 + public/learn/suneung-exam 복사
```
- **수학**: 홀수형 공통 22 + 미적분 8(= 30문항)을 문항별로 크롭(`q01~q30.webp`), 단답형은 `numeric` 목록으로 표시. 단원 태그(a1~c3)는 Grok(문항 이미지 직접 보고 분류) 결과를 우선하고 키워드 규칙(`tag2.py`)이 보조.
- **국어·영어**: 문항 단위로 자르면 지문이 쪼개지므로 시험지를 좌/우 **단 조각**(`c00.webp`…, 16단계 회색 무손실 webp)으로 자르고, 문항 번호가 왼쪽 여백에 나타나는 위치를 앵커(`meta.json`)로 저장한다. 국어는 `c`(공통) / `a`(화법과 작문) / `b`(언어와 매체) 구역으로 나눈다.
- 해설: `merge_explain.py` 는 Grok이 쓴 해설 중 **공식 정답과 답이 일치하고 HTML 검증을 통과한 것만** `explain/` 에 합친다.

## 영어 듣기 음성 (`eng_audio.py`)
`kse_dl.py`·`old_dl.py` 는 음원 zip 을 건너뛰므로 따로 받는다. 작업 디렉터리에서:
```bash
python3 eng_audio.py --check   # 트랙이 나뉜 회차로 '무음으로 문항 찾기' 규칙 확인(28회 모두 트랙 경계와 2초 안)
python3 eng_audio.py           # → r2/<회차>/english/listen-<md5 8자>.mp3 (모노 64kbps CBR) + meta.json 의 audio {file, dur, q}
cd r2 && for f in */english/listen-*.mp3; do ROOT=$PWD WR="npx --yes wrangler" ../r2up.sh $f; done
```
- 음원 zip 은 안내멘트·문제 01~15·문제 16~17 트랙(폴더·zip 안 zip·macOS `._` 파일이 섞인 회차도 있다)이라 이어 붙이고 트랙 경계를 `q`(문항 시작 초, 16 = 16~17번)로 쓴다. 2018학년도 수능만 한 파일이라 답 쓰는 무음(9초 넘게) 끝을 문항 시작으로 잡는다.
- 파일 이름에 내용 해시를 붙여 R2 의 1년 immutable 캐시와 충돌하지 않게 했다. 플레이어는 `preload=none` 이라 누를 때만 받는다(R2 는 Range 지원).

## 국어·영어 시험지 위 ①~⑤ 누르기 (`choices.py`)
문제지 PDF 의 ①~⑤ 글자 자리를 단 이미지 픽셀로 바꿔 `meta.json` 의 `choices = {구역: {번호: [[단, x, y, w, h] ×5]}}` 에 넣는다(플레이어가 그 자리에 투명 단추를 얹는다). 작업 디렉터리에서 `python3 choices.py [회차 …]`(venv 에 pymupdf·pillow, CROP_DPI 140).
- 글자 자리는 `rawdict` 로 한 글자씩 읽는다 — `page.search_for('①')` 는 국어 PDF 에서 한 줄 아래 자리를 돌려주는 일이 있다.
- 문항 앵커부터 다음 앵커 전까지 읽는 순서로 처음 ①→⑤ 가 다 나오는 줄을 고른다. 그림 속 번호(영어 4·6번 그림 문항, 국어 일부 표·메모)는 글자가 아니라 빠진다(약 2%).
- **단이 잘리던 버그(2026-11-04 수정)**: 예전 `footer_top` 이 쪽 아래 12% 안의 밑줄까지 쪽 번호 상자로 보고 그 높이에서 잘라, 국·영 58회 중 200여 단에서 마지막 줄(선지 ⑤·지문 끝 줄)이 빠졌다. 상자는 '가운데 아래의 높이 있는 작은 네모'로 고쳤고(kse_crop.py·old_crop.py 도), `choices.py` 가 더 길어진 단을 `r2/<회차>/<과목>/<이름>.<md5 6자>.webp` 로 다시 만들어 meta 를 바꾼다 → `cd r2 && for f in */*/*.webp; do ROOT=$PWD WR="npx --yes wrangler" ../r2up.sh $f; done`. 위쪽은 예전 그림과 픽셀까지 같아서 앵커·펜 표시(키는 점 앞 이름)는 그대로다.

## 문항 그림(수학·과탐 8과목·한국사) 위 ①~⑤ (`choices_items.py`)
`python3 choices_items.py [과목 …]` → `public/learn/suneung-exam/hot/<과목>.json = {회차: {번호: [그림 폭, 높이, [[x,y,w,h]×5]]}}`(풀어보기가 과목 페이지에서만 불러온다). crop.py·kse_crop.py·old_crop.py 의 crop_one(가장자리 trim 포함)을 다시 계산하고, R2 그림 크기(webp 머리 64바이트)와 맞는 DPI(수학 140·과탐Ⅰ 물·생 180·나머지 150·한국사 160)를 찾는다. 수학 구 교육과정은 이름·첫 쪽에 '가형'인 홀수형. 약 5,860문항 중 2017 9월 한국사(글자 층에 ①~⑤ 없음) 등 몇십 개만 빠진다.

## 2018~2021학년도(구 교육과정) · R2 업로드
`old_dl.py`(다운로드·분류) → `old_ans.py`(정답표, 수학은 가형 홀수형) → `old_crop.py`(국어=통합 45문항 단일 구역, 수학=가형 30문항) → `old_script.py` → `finalize_old.py`(과탐은 `BOARDS=boards_all.json YMIN=2018 YMAX=2021 python batch.py …` 결과 `manifest_old_all.json` 사용). 2018 9월 지구과학Ⅰ 17번은 복수정답(①,⑤)이라 `finalize_old.py`에서 배열로 넣는다.
문항·시험지 이미지는 저장소에 두지 않는다. `r2up.sh <경로>`(wrangler `r2 object put`)로 Cloudflare R2 버킷 `nanamate-suneung`에 올리고, 플레이어의 `imgBase`(`scripts/suneung/lib.mjs` `IMG_BASE`)가 그 공개 주소를 가리킨다. 병렬은 3 이하로(429 제한), 올린 뒤 HTTP 200을 확인하고 로컬 webp를 지운다.

## 한국사 (2017학년도~, `hist_*`)
한국사는 2017학년도 수능부터 필수·절대평가(20문항 50점 30분)라 그 해부터 모은다(수능 10회 + 6·9월 모의평가 22회 = 32회, 2027학년도 9월까지).
```bash
python3 hist_boards.py            # 게시판에서 한국사 행 → boards_hist.json
./venv/bin/python hist_batch.py   # PDF → out/<회차>/hist/q01~q20.webp + manifest_hist.json (CROP_DPI=160 CROP_Q=70)
python3 hist_fix.py               # 2025 수능 정답표(그림)·2017 수능 14번 복수정답 보정, 배점합 50 검증
```
그다음 manifest 의 `answers/points` 를 `exams.json` 각 회차의 `hist: {a, p}` 로 넣고(없는 2017 회차는 새로 만든다, 기존 과목 데이터는 건드리지 않는다) webp 를 R2 `nanamate-suneung/<회차>/hist/` 로 올린다. 파트 태그(`t`)는 아직 없어 풀어보기는 회차 단위만 된다.
