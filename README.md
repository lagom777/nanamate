# nanamate

사이트: https://nanamate.petal-bite.workers.dev


정적 HTML 학습 허브. Cloudflare Pages는 `public/learn`을 사이트 루트로 올립니다.

- **허브** — `index.html` / `public/learn/index.html`
- **강의 노트** — `aboutAI`, `aboutPsy`, TOEIC, TEPS, …
- **Lab** — `lab.html` 시그니처 게임

## 실행

정적 파일만 서빙하면 됩니다. 빌드 없음.

```bash
python3 -m http.server 8080 --directory public/learn
```
