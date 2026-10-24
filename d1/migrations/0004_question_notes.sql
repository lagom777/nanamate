-- 문제별 메모와 선지 표시(○△✕). 로그인한 본인 것만 /api/qnotes 로 읽고 쓴다.
-- exam: 회차 키(2025-csat), sub: 플레이어 SUB, q: 문항 번호(국어 언매 35~45 는 화작과 겹쳐 135~145)
-- marks: '' 또는 선지 1~5 다섯 글자(o ○ · t △ · x ✕ · - 없음). 지운 것도 빈 값으로 남겨 기기 사이에 맞춘다.

CREATE TABLE question_notes (
  user_id TEXT NOT NULL,
  sub TEXT NOT NULL,
  exam TEXT NOT NULL,
  q INTEGER NOT NULL,
  marks TEXT NOT NULL DEFAULT '',
  memo TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, sub, exam, q)
);
