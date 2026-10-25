-- 헷갈림 표시(맞았어도 다시 볼 문항, 0·1)와 내가 고른 오답 원인(concept 개념 모름 · cond 조건 놓침 · choice 선지 판단 실수 · calc 계산 실수 · time 시간 부족, '' 없음)

ALTER TABLE question_notes ADD COLUMN unsure INTEGER NOT NULL DEFAULT 0;
ALTER TABLE question_notes ADD COLUMN cause TEXT NOT NULL DEFAULT '';
