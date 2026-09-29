// 수능 과목별 노트 생성: node scripts/generate-suneung-subjects.mjs [폴더키워드 ...]
// motion.html 은 손으로 만든 정적 파일이라 생성기가 건드리지 않는다.
// 노트 내용 데이터는 scripts/suneung/content/*.mjs (규격: scripts/suneung/CONTENT_SPEC.md)
import { writeAll } from "./suneung/lib.mjs";
import { spec as phys } from "./suneung/physics1.mjs";
import { spec as bio } from "./suneung/bio1.mjs";
import { spec as math } from "./suneung/math.mjs";
import { spec as korean } from "./suneung/korean.mjs";
import { spec as english } from "./suneung/english.mjs";
import { spec as chem } from "./suneung/chem1.mjs";
import { spec as earth } from "./suneung/earth1.mjs";
import { writeScience2 } from "./suneung/science2.mjs";

const only = process.argv.slice(2);
const want = (spec) => !only.length || only.some((k) => spec.folder.toLowerCase().includes(k.toLowerCase()));
for (const s of [phys, bio, math, korean, english, chem, earth]) if (want(s)) writeAll(s);
if (!only.length || only.some((k) => "science2".includes(k.toLowerCase()))) writeScience2();
