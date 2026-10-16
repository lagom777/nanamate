-- users.id = 'kakao:<회원번호>'
-- exam: 회차 키(2025-csat). sub: 플레이어 SUB(math, korean, phys1 …). q: 문항 번호.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  exam TEXT NOT NULL,
  sub TEXT NOT NULL,
  q INTEGER NOT NULL,
  picked INTEGER NOT NULL,
  ok INTEGER NOT NULL,
  ts INTEGER NOT NULL
);

CREATE INDEX idx_attempts_user_sub_exam_q_ts ON attempts (user_id, sub, exam, q, ts);
