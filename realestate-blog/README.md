# 부동산 블로그 도구 모음

부동산 블로그 글을 **생성**하고 **SNS/네이버에 게시**하는 로컬 도구 묶음입니다. 모두 무료·로컬 중심이고, AI는 Gemini(무료 키)를 기본으로 씁니다.

## 3개 구성요소
| 도구 | 위치 | 무엇 |
|---|---|---|
| **글 생성기(웹)** | `index.html` | 브라우저로 여는 단일 HTML. 매물 정보/주제 입력 → 글·제목·SNS 요약·해시태그·검수 체크리스트. 엔진 Gemini/Claude/템플릿. "네이버 글쓰기 열기"·"Threads/X 올리기" 버튼 포함. |
| **Threads 자동 게시** | `threads-tool/` | 공식 Threads API로 진짜 자동 게시. `post-threads.mjs "내용" [--image 파일|URL]`. 토큰 1회 발급(`setup-threads.mjs`). |
| **트렌드 자동화 + 일괄 생성** | `auto/` | 트렌드(뉴스·Reddit·실거래가) 기반 글을 주 2회 자동 생성(`run.mjs`, launchd) / CSV 여러 주제 일괄 생성(`batch.mjs`) / 국토부 실거래가 커넥터(`realprice.mjs`). |

## 게시 방식 (왜 이렇게)
| 플랫폼 | 방식 | 자동화 |
|---|---|---|
| **Threads** | 공식 API | 🟢 완전 자동 |
| **네이버** | 본문 클립보드 복사 + 글쓰기창 열기 → 붙여넣기 발행 | 🟡 반자동 (글쓰기 API 2020 종료, 자동화는 계정 위험) |
| **X(트위터)** | 인텐트 프리필(작성창 자동 채움) | 🟡 반자동 (2026 글쓰기 종량제) |

## 빠른 시작
1. **글 하나 만들기**: `index.html` 을 브라우저로 열기 → ⚙️에 [Gemini 무료 키](https://aistudio.google.com/apikey) 입력 → 생성 → Threads "올리기" / 네이버 "글쓰기 열기".
2. **Threads 자동 게시**: `threads-tool/README.md` 따라 토큰 1회 발급 후 `node post-threads.mjs "내용"`.
3. **주 2회 자동 트렌드 글**: `auto/README.md` 따라 `config.local.json`에 키 넣고 launchd 등록.
4. **여러 주제 한 번에**: `auto/` 에서 `topics.sample.csv`→`topics.csv` 채우고 `node batch.mjs`.
5. **실수치 근거 강화(선택)**: `auto/README.md`의 "실거래가 연동" — data.go.kr 무료 키 + 지역코드.

> **셋업 점검**: `node auto/doctor.mjs` 로 키·토큰·설정·스케줄 상태와 빠진 항목을 한눈에 확인.

## 사용자 1회 셋업 체크리스트
- [ ] Gemini 무료 키 (웹은 ⚙️, 자동화는 `auto/config.local.json`)
- [ ] (선택) Threads 토큰 — `threads-tool/` Meta 앱 + `setup-threads.mjs`
- [ ] (선택) launchd 등록 — `auto/` 주 2회 자동 실행
- [ ] (선택) 국토부 실거래가 키 + `lawdCodes` — 실수치 근거

## 보안
- 모든 키·토큰은 로컬에만(브라우저 localStorage / `config.local.json` / `.threads-auth.json`, 권한 0600). 전부 `.gitignore` 처리되어 커밋 안 됨.
- 생성 글은 **게시 전 사람 검수 전제**(특히 네이버). 수치·정책은 시행 시점 재확인.

## 자세한 문서
- `threads-tool/README.md` — Threads 토큰 발급·게시·이미지 첨부
- `auto/README.md` — 트렌드 자동화·일괄 생성·실거래가·launchd
- 진행상황/설계 메모: `../../plan/부동산-블로그-자동화-진행상황.md` (coding/plan)
