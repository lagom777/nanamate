// 수능 과목별 노트 생성: node scripts/generate-suneung-subjects.mjs
// motion.html 은 손으로 만든 정적 파일이라 생성기가 건드리지 않는다.
import { writeAll } from "./suneung/lib.mjs";
import { spec as phys } from "./suneung/physics1.mjs";
import { spec as bio } from "./suneung/bio1.mjs";

writeAll(phys);
writeAll(bio);
