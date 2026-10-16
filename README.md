# nanamate

사이트: https://nanamate.petal-bite.workers.dev


정적 HTML 학습 허브. Cloudflare Pages는 `public/learn`을 사이트 루트로 올립니다.

- **허브** — `index.html` / `public/learn/index.html`
- **강의 노트** — `aboutAI`, `aboutPsy`, TOEIC, TEPS, …
- **수능** — 과목별 노트 `aboutSuneungKorean` · `Math` · `English` · `Physics1` · `Chem1` · `Bio1` · `Earth1` · `Science2`(물Ⅱ·화Ⅱ·생Ⅱ·지Ⅱ, 기출만). 국어·수학·영어·과학Ⅰ은 파트별 정리 + 기출 풀어보기(채점), 물리Ⅰ·생명Ⅰ은 모션 노트·해설 포함. 페이지 생성 `node scripts/generate-suneung-subjects.mjs`(노트 내용은 `scripts/suneung/content/*.mjs`, 규격 `CONTENT_SPEC.md`, 검증 `validate-chapters.mjs`), 문항 이미지는 `suneung-exam/` (파이프라인은 `scripts/suneung-exam/README.md`)

## 실행

정적 파일만 서빙하면 됩니다. 빌드 없음.

```bash
python3 -m http.server 8080 --directory public/learn
```

## 카카오 로그인 · 오답 저장

기출 풀이 기록은 Worker(`worker/index.js`)와 D1에 둔다. `wrangler.jsonc`의 `database_id`(`REPLACE_WITH_D1_ID`)를 만든 데이터베이스 아이디로 바꾼 뒤 마이그레이션과 시크릿 세 개를 등록한다.

```bash
npx wrangler d1 create nanamate
npx wrangler d1 migrations apply nanamate --remote
npx wrangler secret put KAKAO_REST_API_KEY
npx wrangler secret put KAKAO_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET
```

카카오 Redirect URI는 `https://nanamate.petal-bite.workers.dev/api/auth/kakao/callback` 와 `http://localhost:8787/api/auth/kakao/callback` 이다. 로컬은 `npx wrangler d1 migrations apply nanamate --local` 다음 `npx wrangler dev --local --port 8787`.
