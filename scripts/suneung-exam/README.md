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

## 2018~2021학년도(구 교육과정) · R2 업로드
`old_dl.py`(다운로드·분류) → `old_ans.py`(정답표, 수학은 가형 홀수형) → `old_crop.py`(국어=통합 45문항 단일 구역, 수학=가형 30문항) → `old_script.py` → `finalize_old.py`(과탐은 `BOARDS=boards_all.json YMIN=2018 YMAX=2021 python batch.py …` 결과 `manifest_old_all.json` 사용). 2018 9월 지구과학Ⅰ 17번은 복수정답(①,⑤)이라 `finalize_old.py`에서 배열로 넣는다.
문항·시험지 이미지는 저장소에 두지 않는다. `r2up.sh <경로>`(wrangler `r2 object put`)로 Cloudflare R2 버킷 `nanamate-suneung`에 올리고, 플레이어의 `imgBase`(`scripts/suneung/lib.mjs` `IMG_BASE`)가 그 공개 주소를 가리킨다. 병렬은 3 이하로(429 제한), 올린 뒤 HTTP 200을 확인하고 로컬 webp를 지운다.
