// 수능 통합과학 — 통합과학1·2 (25문항 40분, 1.5·2·2.5점). 노트는 content/is-*.mjs, 풀어보기는 평가원 예시문항(2028-ex)
import { note, tip, tbl, examsOf } from "./lib.mjs";

const mods = await Promise.all(["is-1", "is-2", "is-3", "is-4"].map(async (n) => { try { return await import(`./content/${n}.mjs`); } catch { return { chapters: [], quick: {} }; } }));
const chapters = mods.flatMap((m) => m.chapters).sort((a, b) => a.file.localeCompare(b.file));
const quick = Object.assign({}, ...mods.map((m) => m.quick || {}));
const N = examsOf("intsci").length;

export const spec = {
  sub: "intsci", quick, folder: "aboutSuneungIntScience", label: "수능 통합과학", short: "통합과학", color: "#0f766e",
  glow: "rgba(15,118,110,0.12)", border: "rgba(15,118,110,0.16)",
  asideSub: "수능 통합과학 — 통합과학1·2 + 예시문항",
  h1: "수능 통합과학,<br><em>단원별</em>로<br>끝까지",
  authors: "25문항 · 40분 · 50점 · 모든 수험생 공통 · 평가원 예시문항 " + N * 25 + "문항 풀어보기",
  affiliation: "통합과학1 5파트 · 통합과학2 5파트 · 수능 풀어보기(채점·해설)",
  motion: false, kind: "items", qn: 25, minutes: 40,
  practiceBlurb: `평가원 예시문항 ${N}회 ${N * 25}문항 · 단원별 모아 풀기 · 채점·해설`,
  chapters,
  intro: `<h2>이 노트가 다루는 것</h2>
<p>수능 통합과학은 <strong>통합과학1·통합과학2</strong> 전 범위에서 나옵니다. 한 문항이 물리·화학·생명과학·지구과학 개념을 실험과 자료 해석으로 엮어 묻기 때문에, 파트마다 개념 → 자료(표·그래프·실험) 읽는 법 → 함정 → 직접 만든 예제 → 짝짓기·퀴즈 순으로 정리했습니다.</p>
${note("시험 구조", "25문항 · 40분 · 50점. 문항 배점은 1.5점 · 2점 · 2.5점입니다. 모든 수험생이 통합사회와 통합과학을 둘 다 봅니다.")}
<h2>단원 구성</h2>
${tbl(["과목", "단원", "파트"], [["통합과학1", "과학의 기초", "1 과학의 기초"], ["통합과학1", "물질과 규칙성", "2 물질과 규칙성"], ["통합과학1", "시스템과 상호작용", "3 지구시스템 · 4 역학 시스템 · 5 생명 시스템"], ["통합과학2", "변화와 다양성", "6 지질 시대와 생물 다양성 · 7 화학 변화"], ["통합과학2", "환경과 에너지", "8 생태계와 환경 · 9 에너지"], ["통합과학2", "과학과 미래 사회", "10 과학과 미래 사회"]])}
${tip("자료가 길어 보여도 묻는 것은 단원의 기본 개념입니다. 표·그래프의 축과 단위부터 읽고, 보기 ㄱ·ㄴ·ㄷ을 하나씩 개념에 대어 보세요.")}`,
  after: `<h2>풀어보기</h2><p>평가원이 공개한 <strong>수능 예시문항</strong> 문제지 ${N * 25}문항을 시험 모드(40분)와 연습 모드로 풀고 채점합니다. 문항마다 단원을 붙여 두어 파트별로 모아 풀 수 있습니다. 출처: 한국교육과정평가원 「2028학년도 대학수학능력시험 예시문항 안내」(2025년 4월).</p><p><a class="cta" href="practice.html">📝 통합과학 풀어보기 →</a></p>`,
};
