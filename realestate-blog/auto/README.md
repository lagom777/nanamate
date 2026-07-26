# 부동산 트렌드 자동 글쓰기 (주 2회)

실시간 트렌드(한국 부동산 뉴스·통계 + 글로벌 추세 + Reddit 인기글)를 모아 **한국어 블로그 글 + SNS 요약을 자동 작성**하고,
**Threads 게시는 검증 통과 시 자동**(`autoPostThreads` 기본 꺼짐), **네이버용 초안은 폴더에 저장**(직접 붙여넣어 발행)하는 로컬 자동화입니다.

```
맥 스케줄러(launchd, 월·목 8:57)
  └─ run.mjs
       ├─ 트렌드 수집 (구글뉴스 RSS 한/영 + Reddit)
       ├─ 작성 엔진 자동 선택 (ChatGPT 로그인/Codex → Gemini API 키 → Google OAuth → 로컬 작성)
       ├─ output/<날짜>/ 에 blog.md · naver.txt · threads.txt · sources.md 저장
       ├─ 게시 전 출력 검증 → 통과 + autoPostThreads=true 일 때만 Threads 게시
       └─ 데스크톱 알림 → 네이버는 naver.txt 붙여넣어 발행
```

> 네이버는 글쓰기 API가 없고 자동 게시는 계정 위험이 커서 **의도적으로 수동**입니다. 알림을 받고 `naver.txt`를 복사해 글쓰기창에 붙여넣어 발행하세요.

## 1. 설정
1. **현재 ChatGPT 로그인 사용(기본)**: `codex login status`가 `Logged in using ChatGPT`이면 자동으로 Codex CLI를 읽기 전용·일회성 모드로 호출합니다. 브라우저 쿠키나 저장된 자격 증명을 직접 읽지 않습니다. 비활성화하려면 `config.json`의 `preferChatGPTLogin`을 `false`로 바꾸거나 실행할 때 `--offline`을 사용합니다.
2. **설정 없이 시작**: ChatGPT/Codex 로그인이 없어도 로컬 작성 엔진이 입력 자료만으로 제목·장문 본문·SNS 글을 자동 생성합니다. 입력에 없는 가격·통계는 만들지 않습니다.
3. **API 키 없이 Gemini 사용(선택)**: Google 공식 OAuth를 연결할 수 있습니다.
   - Google Cloud 프로젝트에서 Generative Language API 활성화
   - OAuth 동의 화면 구성 후 데스크톱 앱 OAuth client JSON 다운로드
   - `node setup-google-oauth.mjs` 실행 → JSON 경로와 프로젝트 ID 입력 → 브라우저에서 Google 계정 1회 승인
   - 자격 증명은 `.google-oauth.json`(0600, git 제외)에 저장되며 자동 갱신됩니다. Gemini 웹사이트 쿠키를 읽거나 복사하지 않습니다.
4. **Gemini API 키(선택)**: 키 방식을 선호하면 `auto/config.local.json` 생성 (이 파일은 git 제외됨)
   ```json
   { "geminiKey": "AIza...여기에_키" }
   ```
   저장 후 본인만 읽도록 권한 제한 권장: `chmod 600 config.local.json`.
   (또는 파일 대신 환경변수 `GEMINI_API_KEY` 사용 — launchd plist의 `EnvironmentVariables`에 넣거나 셸 프로필에서 export.)
5. **Threads 자동 게시(선택, 기본 꺼짐)**: `../threads-tool/` 에서 `node setup-threads.mjs` 로 토큰을 만든 뒤 `config.json`(또는 `config.local.json`)의 `autoPostThreads`를 `true`로 바꾸면 자동 게시됩니다. 토큰이 없으면 게시는 건너뛰고 글만 저장합니다.
   > 기본값이 `false`인 이유: 수집 자료(구글뉴스·**Reddit**)는 외부인이 쓴 텍스트라 프롬프트 주입으로 게시문을 바꾸려는 시도가 가능합니다. 켜더라도 게시 직전 출력 검증(`screenThreadsPost`)을 통과한 글만 나가고, 걸리면 게시를 멈추고 `output/<날짜-시각>/REVIEW-REQUIRED.txt` 에 사유를 남깁니다.
6. **소스 조정(선택)**: `config.json` 에서 `newsKR`/`newsGlobal`/`subreddits`/`lengthHint`/`autoPostThreads` 수정.
7. **Threads 이미지(선택)**: `config.json` 의 `imageForThreads` 에 고정 이미지(로컬 파일 경로 또는 공개 URL)를 넣으면 자동 게시 시 첨부됩니다(예: 브랜드 배너). 빈 문자열이면 텍스트만 게시. JPEG/PNG·8MB·가로 320~1440px 제약.

## 2. 먼저 손으로 돌려보기
```bash
cd realestate-blog/auto
node doctor.mjs              # 셋업 상태 점검(키/토큰/설정/스케줄) — 무엇이 빠졌는지 한눈에
codex login status           # 현재 ChatGPT 로그인 사용 가능 여부
node setup-google-oauth.mjs  # 선택: API 키 없이 Google 계정으로 Gemini 연결
node run.mjs --gather-only   # 트렌드 수집·파싱만 확인 (키 불필요)
node run.mjs --no-post       # 키가 없어도 글 생성·저장 (Threads 게시 안 함)
node run.mjs --offline       # AI를 호출하지 않고 로컬 엔진만 사용
node run.mjs                 # 전체 (생성+저장+검증+알림, autoPostThreads=true면 Threads 게시)
node --test                  # 순수 로직 테스트(출력 검증 게이트·로컬 작성 엔진)
```
결과는 `output/<날짜-시각>/` 에 생깁니다. AI 호출이 실패해도 로컬 작성으로 전환되므로 글 파일은 계속 만들어집니다. `naver.txt` 를 네이버에 붙여넣어 발행하세요.

## 여러 주제 일괄 생성 (batch.mjs)
트렌드 자동화와 별개로, **내가 정한 여러 주제/매물을 한 번에** 글로 만들 수 있어요.
1. `topics.sample.csv` 를 `topics.csv` 로 복사 후 행을 채웁니다(열: `type,topic,area,name,deal,price,size,keyword,length,notes`). `type`은 listing/price/location/subscription/policy/interior/invest/process/custom. `custom`이면 `topic`에 주제를 적습니다.
2. 실행:
```bash
node batch.mjs --dry-run            # CSV 파싱·프롬프트 미리보기(키 불필요)
node batch.mjs --offline --no-post  # ChatGPT/Gemini를 호출하지 않고 로컬 작성
node batch.mjs --no-post            # 전체 생성·저장(게시 안 함)
node batch.mjs --limit 3            # 위에서 3개만
node batch.mjs                      # 생성 + (설정 시) Threads 연속 게시
```
결과는 `output/batch-<날짜>/01-…/` 등 각 폴더에 `blog.md·naver.txt·threads.txt` 로 저장됩니다. 연속 Threads 게시 시 글 사이 10초 간격. `topics.csv`는 git에서 제외됩니다.

## 실거래가 연동 (선택 — 실수치 근거 강화)
트렌드 글이 헤드라인뿐 아니라 **실제 매매 수치**를 근거로 쓰게 하려면 국토부 실거래가를 붙일 수 있어요.
1. [공공데이터포털](https://www.data.go.kr) 가입 → "국토교통부 아파트 매매 실거래가" API 활용신청(무료) → 일반 인증키(serviceKey) 발급
2. `config.local.json` 에 키 추가: `{ "geminiKey":"...", "dataGoKrKey":"발급키" }`
3. `config.json` 의 `lawdCodes` 에 관심 지역의 **법정동코드 앞 5자리(시군구)** 입력 (예: 서울 송파구 `11710`). `realPriceMonthsBack`(기본 1=지난달, 데이터가 더 차 있음).
4. 테스트: `node realprice.mjs 11710 202605` → "실거래 N건, 매매가 X~Y억(평균 Z억) · 주요 단지…" 가 나오면 OK.
5. 이후 `run.mjs` 가 수집 단계에서 자동으로 실거래가 요약을 트렌드 자료에 포함합니다.
- 등록 시 받은 엔드포인트가 기본값과 다르면 `config.json` 의 `realPriceEndpoint` 에 정확한 URL을 넣으세요. 키/코드가 없으면 자동으로 건너뜁니다.

## 3. 주 2회 자동 실행 (launchd)
```bash
# 1) plist를 LaunchAgents로 복사
cp com.studywithai.reblog.plist ~/Library/LaunchAgents/
# 2) 등록 (로그인 시 로드)
launchctl load ~/Library/LaunchAgents/com.studywithai.reblog.plist
# 3) (테스트) 즉시 한 번 실행
launchctl start com.studywithai.reblog
# 해제하려면
launchctl unload ~/Library/LaunchAgents/com.studywithai.reblog.plist
```
- 기본 일정은 **월·목 오전 8:57**. 바꾸려면 plist의 `StartCalendarInterval` 수정 후 unload→load.
- node 경로가 다르면(`which node` 로 확인) plist의 `/opt/homebrew/bin/node` 를 교체하세요.
- **맥이 켜져·깨어 있어야** 실행됩니다(절전 중이면 깬 뒤 실행). 실행 로그: `run.log`, `launchd.out/err.log`.

## 참고·주의
- 생성 글은 **트렌드 자료에 근거**해 출처·시점을 표기하도록 프롬프트가 강제하지만, **게시 전(특히 네이버) 사람 검수**를 전제로 합니다. 수치·정책은 한 번 더 확인하세요.
- Reddit은 접근을 막을 수 있습니다 — 실패하면 자동으로 건너뛰고 뉴스 자료만으로 작성합니다.
- 수집 자료는 프롬프트에서 `<<자료 시작>> ~ <<자료 끝>>` 으로 격리해 "신뢰할 수 없는 인용"으로 넣습니다. 다만 이 격리는 완전한 방어가 아니므로(모델이 자료 속 지시를 따를 수 있음) **실제 방어는 게시 직전 출력 검증**입니다. 링크·명령·지시문·자격증명·비정상 길이·자료 주제 이탈이 있으면 자동 게시를 멈춥니다.
- `output/`·`config.local.json`·`.google-oauth.json`·`client_secret*.json`·로그는 `.gitignore` 처리되어 커밋되지 않습니다.
