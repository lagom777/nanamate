// 수특 그림 모음: 교재 그림은 EBS 저작물이라 비공개 R2(env.EBS)에 두고 주인 계정(시크릿 env.EBS_OWNER)에게만 내준다.
import { safeEqual } from './session.js';

// <세트>/<과목>/index.json 과 <세트>/<과목>/p<쪽>-<번호>.webp 만 받는다
const KEY = /^\d{4}-[a-z]{2,8}\/[a-z0-9]{2,16}\/(?:index\.json|p\d{3}-\d{1,2}\.webp)$/;

export function ebsKey(path) {
  const k = path.slice('/api/ebs/'.length);
  return KEY.test(k) ? k : null;
}

/** 로그인 안 했으면 401, 주인이 아니면(주인 시크릿이 없을 때도) 403, 주인이면 0 */
export function ebsDenied(session, owner) {
  if (!session) return 401;
  if (typeof owner !== 'string' || !owner || !safeEqual(session.uid, owner)) return 403;
  return 0;
}
