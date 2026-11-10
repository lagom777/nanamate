-- 계정별 풀이 상태(수능 풀어보기): 회차마다 고른 답·채점 여부. id 는 'exam:<회차>', data 는 {ans|pa,g,gs,left,ut} JSON(worker/pstate.js).
-- worker 가 처음 쓸 때 같은 문장(IF NOT EXISTS)으로 만들어 두므로, 이 파일을 나중에 적용해도 겹치지 않는다.

CREATE TABLE IF NOT EXISTS exam_states (
  user_id TEXT NOT NULL,
  sub TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, sub, id)
);
