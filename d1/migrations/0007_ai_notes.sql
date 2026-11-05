-- 계정별 AI 해설·분석(수능 풀어보기). id 는 화면이 쓰는 이름(q:과목:회차/번호:답 · h · x · s · w), data 는 {turns,u,c,w} JSON(worker/ainotes.js).
-- worker 가 처음 쓸 때 같은 문장(IF NOT EXISTS)으로 만들어 두므로, 이 파일을 나중에 적용해도 겹치지 않는다.

CREATE TABLE IF NOT EXISTS ai_notes (
  user_id TEXT NOT NULL,
  id TEXT NOT NULL,
  sub TEXT NOT NULL,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, id)
);
CREATE INDEX IF NOT EXISTS ai_notes_sub ON ai_notes (user_id, sub, updated_at);
