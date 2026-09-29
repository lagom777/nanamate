# nanamate

사이트: https://nanamate.petal-bite.workers.dev


정적 HTML 학습 허브. Cloudflare Pages는 `public/learn`을 사이트 루트로 올립니다.

- **허브** — `index.html` / `public/learn/index.html`
- **수능** — `suneung.html` 수능 이과 전용 목록(과목별 탭)
- **강의 노트** — `aboutAI`, `aboutPsy`, TOEIC, TEPS, …
- **수능 이과** — 과목별 노트 `aboutSuneungKorean` · `Calculus` · `English` · `Physics1` · `Bio1`. 물리학Ⅰ·생명과학Ⅰ은 파트별 정리 + 모션 노트 + 기출 풀어보기(채점·해설). 페이지 생성 `node scripts/generate-suneung-subjects.mjs`, 문항 이미지는 `suneung-exam/` (파이프라인은 `scripts/suneung-exam/README.md`)

## 실행

정적 파일만 서빙하면 됩니다. 빌드 없음.

```bash
python3 -m http.server 8080 --directory public/learn
```
