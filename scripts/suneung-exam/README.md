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
