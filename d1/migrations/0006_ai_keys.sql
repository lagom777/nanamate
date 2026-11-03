-- 계정별 Anthropic API 키(AI 해설). SESSION_SECRET 에서 뽑은 AES-GCM 키로 암호화한 값만 둔다(worker/aikey.js).
-- 암호문은 user_id 에 묶이고, 키 원문은 브라우저로 다시 내려보내지 않는다(/api/claude/v1/messages 가 대신 전달).
-- hint: 화면에 보여 줄 앞 10자 + 끝 4자.

CREATE TABLE ai_keys (
  user_id TEXT PRIMARY KEY,
  iv TEXT NOT NULL,
  ct TEXT NOT NULL,
  hint TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
