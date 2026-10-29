# 부동산 블로그 도구 모음

부동산 블로그 글을 **자동 작성**하고 **SNS/네이버에 게시**하는 로컬 도구 묶음입니다. 현재 ChatGPT로 로그인된 Codex가 있으면 그 로그인을 AI 작성에 사용하고, 없으면 Gemini 또는 키 없는 로컬 엔진으로 제목·장문 본문·SNS 글을 완성합니다.

## 3개 구성요소
| 도구 | 위치 | 무엇 |
|---|---|---|
| **글 생성기(웹)** | `index.html` | 브라우저로 여는 단일 HTML. 매물 정보/주제 입력 → 글·제목·SNS 요약·해시태그·검수 체크리스트. 키 없는 로컬 자동 작성이 기본이며 Gemini/Claude도 선택 가능. |
| **Threads 자동 게시** | `threads-tool/` | 공식 Threads API로 진짜 자동 게시. `post-threads.mjs "내용" [--image 파일|URL]`. 토큰 1회 발급(`setup-threads.mjs`). |
| **트렌드 자동화 + 일괄 생성** | `auto/` | 현재 ChatGPT 로그인(Codex CLI) → Gemini → 로컬 엔진 순으로 자동 선택. 트렌드 글·CSV 여러 매물 글·국토부 실거래가 연동 지원. |

## 게시 방식 (왜 이렇게)
| 플랫폼 | 방식 | 자동화 |
|---|---|---|
| **Threads** | 공식 API | 🟢 완전 자동 |
| **네이버** | 본문 클립보드 복사 + 글쓰기창 열기 → 붙여넣기 발행 | 🟡 반자동 (글쓰기 API 2020 종료, 자동화는 계정 위험) |
| **X(트위터)** | 인텐트 프리필(작성창 자동 채움) | 🟡 반자동 (2026 글쓰기 종량제) |

## 빠른 시작
1. **글 하나 만들기**: `index.html` 을 브라우저로 열기 → 매물 정보 입력 → 생성. 키 없이 바로 제목·본문·SNS 글이 만들어집니다.
2. **Threads 자동 게시**: `threads-tool/README.md` 따라 토큰 1회 발급 후 `node post-threads.mjs "내용"`.
3. **주 2회 자동 트렌드 글**: `auto/README.md`에 따라 launchd만 등록하면 현재 ChatGPT 로그인으로 작성합니다.
4. **여러 주제 한 번에**: `auto/` 에서 `topics.sample.csv`→`topics.csv` 채우고 `node batch.mjs`.
5. **실수치 근거 강화(선택)**: `auto/README.md`의 "실거래가 연동" — data.go.kr 무료 키 + 지역코드.
6. **API 키 없이 Gemini 사용(선택)**: Google Cloud에서 OAuth 데스크톱 클라이언트를 만든 뒤 `node auto/setup-google-oauth.mjs` 1회. 이후 로그인 토큰이 자동 갱신됩니다.
7. **현재 ChatGPT 로그인 사용**: `codex login status`가 `Logged in using ChatGPT`이면 별도 설정 없이 자동화가 가장 먼저 사용합니다.

> **셋업 점검**: `node auto/doctor.mjs` 로 키·토큰·설정·스케줄 상태와 빠진 항목을 한눈에 확인.

## 사용자 1회 셋업 체크리스트
- [x] 키 없는 로컬 자동 작성 — 별도 설정 없음
- [x] 현재 ChatGPT 로그인 사용 — Codex CLI 로그인 상태를 공식 명령으로 확인하고 호출
- [ ] (선택) Gemini AI 문체 — API 키 또는 `auto/setup-google-oauth.mjs`의 Google 공식 OAuth
- [ ] (선택) Threads 토큰 — `threads-tool/` Meta 앱 + `setup-threads.mjs`
- [ ] (선택) launchd 등록 — `auto/` 주 2회 자동 실행
- [ ] (선택) 국토부 실거래가 키 + `lawdCodes` — 실수치 근거

## 보안
- ChatGPT 브라우저 쿠키나 Codex 자격 증명 파일을 직접 읽지 않고 공식 `codex exec` 명령만 사용합니다. 다른 키·토큰도 로컬 비공개 파일에만 저장되고 전부 git에서 제외됩니다.
- 생성 글은 **게시 전 사람 검수 전제**(특히 네이버). 수치·정책은 시행 시점 재확인.

## 자세한 문서
- `threads-tool/README.md` — Threads 토큰 발급·게시·이미지 첨부
- `auto/README.md` — 트렌드 자동화·일괄 생성·실거래가·launchd
- 진행상황/설계 메모: `../../plan/부동산-블로그-자동화-진행상황.md` (coding/plan)
