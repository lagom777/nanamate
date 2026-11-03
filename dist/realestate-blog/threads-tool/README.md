# Threads 자동 게시 도구 (로컬·무료)

부동산 블로그 생성기에서 만든 **SNS 요약**을 내 Threads 계정에 **진짜 자동 게시**하는 로컬 Node 도구입니다.
공식 [Threads API](https://developers.facebook.com/docs/threads/)를 쓰며, 브라우저 자동조종이 아니라 정식 API 호출이라 안전합니다.

- 의존성 0 (Node 18+ 내장 `fetch`만 사용)
- 무료 — 내 계정 하나만 쓰면 App 심사 불필요(자신을 Threads Tester로 등록)
- 하루 250개까지 게시 가능 / 토큰 60일·자동 갱신

> **네이버·X는 포함하지 않습니다.**
> - **네이버**: 블로그 글쓰기 API가 2020년 종료되어 자동 게시 불가 → 생성기의 "네이버 글쓰기 열기"(본문 클립보드 복사 + 편집창 열기)로 붙여넣어 발행하세요.
> - **X(트위터)**: 2026년부터 글쓰기가 종량제(링크 포함 글 약 $0.20/건) → 생성기의 "X에 올리기"(작성창 프리필) 사용을 권장.

---

## 1. 사전 준비 (1회, 약 5분)

### ① Meta 개발자 앱 만들기
1. <https://developers.facebook.com/apps> → **앱 만들기**
2. 사용 사례에서 **Threads** 선택 → 앱 생성
3. 좌측 **Threads → 설정(Settings)** 에서 **Threads App ID** 와 **Threads App Secret** 확인

### ② Redirect URI 등록
- Threads 설정의 **Redirect Callback URLs** 에 아래를 추가 (끝 슬래시까지 정확히):
  ```
  http://localhost:8723/callback
  ```
- 만약 Meta가 `http://localhost` 를 거부하면 `https://localhost:8723/callback` 으로 등록하고, 아래 setup에서 **수동 붙여넣기**로 진행하세요(자동 캡처만 안 될 뿐 동일하게 동작).

### ③ 본인 계정을 Threads Tester로 추가
1. 앱 대시보드 **앱 역할(App roles) → 역할** 에서 **Threads Tester** 로 본인 Threads 계정 추가
2. 본인 **Threads 앱 → 프로필 → 설정 → 웹사이트 권한(또는 초대)** 에서 테스터 초대 **수락**
   (수락해야 토큰 발급이 됩니다.)

---

## 2. 토큰 설정 (1회)

```bash
cd realestate-blog/threads-tool
node setup-threads.mjs
```

- App ID / App Secret / Redirect URI 입력
- 출력된 **인증 URL을 브라우저에서 열어 권한 허용**
- `http://localhost:8723/...` 로 등록했다면 → 자동으로 인식되어 끝
- 다른 URI로 등록했다면 → 이동된 주소창의 URL을 복사해 터미널에 붙여넣기
- 성공하면 `.threads-auth.json` 에 60일 토큰이 저장됩니다.
- 콜백 서버는 **127.0.0.1 에만** 바인드되고(같은 네트워크의 다른 기기는 접근 불가), 인증 URL에 넣은 1회용 `state` 가 일치하는 응답만 받습니다. 붙여넣는 URL의 `state` 가 다르면 거부됩니다(순수 `code` 값만 붙여넣는 것은 허용).

---

## 3. 게시하기

생성기(HTML)에서 **📣 SNS 요약 → Threads 카드 → 복사** 한 다음:

```bash
# 방법 A: 실행 후 붙여넣기 (여러 줄 가능, 끝나면 Ctrl+D 또는 EOF)
node post-threads.mjs

# 방법 B: 인자로 바로 전달
node post-threads.mjs "송파 잠실엘스 84타입 시세 정리했어요 ... 블로그에서 확인하세요 👇 #잠실 #부동산"

# 방법 C: 파일에서
node post-threads.mjs --file summary.txt

# 이미지 첨부 (로컬 파일 또는 공개 URL). 로컬 파일은 catbox에 자동 업로드 후 첨부.
node post-threads.mjs "신축 단지 시세 정리 👇" --image ~/photos/danji.jpg --alt "단지 전경"
node post-threads.mjs --file summary.txt --image https://example.com/chart.png
```

**이미지 제약(Threads)**: JPEG/PNG, 8MB 이하, 가로 320~1440px, 비율 10:1 이내. 텍스트 없이 이미지만 올려도 됩니다.
로컬 파일은 게시 순간 메타가 가져갈 수 있도록 [catbox.moe](https://catbox.moe)(무인증 공개 호스트)에 올린 뒤 그 URL을 첨부합니다.

- 500자 초과면 게시하지 않고 글자수를 알려줍니다.
- 토큰이 만료 7일 이내면 자동 갱신합니다.
- 성공하면 media id를 출력합니다. <https://www.threads.net/@me> 에서 확인하세요.

---

## 보안
- `.threads-auth.json` 에는 **App Secret과 액세스 토큰**이 들어 있습니다. **절대 커밋·공유하지 마세요** (`.gitignore`로 제외되며, 파일은 소유자 전용 권한 `0600`으로 저장됩니다).
- 토큰이 새면 Meta 앱 대시보드에서 시크릿을 재발급하고 다시 `setup-threads.mjs` 를 실행하세요.
- 장기 토큰 교환·갱신은 Threads API 규격상 HTTPS GET 쿼리스트링으로 토큰을 보냅니다(회피 불가). 신뢰할 수 없는 프록시 뒤에서는 실행하지 마세요.

## 한도·참고
- 게시: 프로필당 24시간 250개. 토큰: 60일(자동 갱신).
- 현재는 TEXT(텍스트) 게시만 지원합니다. 이미지/링크 첨부가 필요하면 알려주세요.
