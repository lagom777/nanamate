-- 사용자별 공부 성향. 로그인한 본인에게만 /api/style 로 보여 준다(공개 파일에 두지 않음).
-- body: JSON 문자열 { title, summary, groups: [{ title, items: [문장] }], source }

CREATE TABLE user_styles (
  user_id TEXT PRIMARY KEY,
  body TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
