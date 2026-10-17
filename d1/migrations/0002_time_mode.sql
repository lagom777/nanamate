-- 풀이 시간(ms)과 모드(exam|practice). 기존 행·구버전 클라이언트는 NULL.

ALTER TABLE attempts ADD COLUMN ms INTEGER;
ALTER TABLE attempts ADD COLUMN mode TEXT;
