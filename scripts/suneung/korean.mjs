// 수능 국어 — 독서 · 문학 · 선택(화법과 작문 / 언어와 매체) (content/ko-*.mjs, 전략은 content/st-ko.mjs)
import { note, tip, tbl, examsOf } from "./lib.mjs";
import { maps } from "./maps-korean.mjs";

const load = async (n) => { try { return (await import(`./content/${n}.mjs`)).chapters; } catch { return []; } };
const ko2 = await load("ko-2");
const at = ko2.findIndex((c) => c.file === "08-classic-poetry.html") + 1;
const chapters = [...(await load("ko-1")), ...ko2.slice(0, at), ...(await load("ko-vocab")), ...ko2.slice(at), ...(await load("ko-3")), ...(await load("st-ko"))];
const N = examsOf("korean").length;

export const spec = {
  sub: "korean", folder: "aboutSuneungKorean", label: "수능 국어", short: "국어", color: "#b45309",
  glow: "rgba(180,83,9,0.12)", border: "rgba(180,83,9,0.16)",
  asideSub: "수능 국어 — 독서·문학·선택 + 기출",
  h1: "수능 국어,<br><em>독서·문학·선택</em><br>파트별로",
  authors: "2015 개정 교육과정 · 2027학년도 수능까지 · 실제 시험지 " + N + "회 풀어보기",
  affiliation: "독서 5파트 · 문학 5파트 · 화법과 작문/언어와 매체 · 전략 · 수능 풀어보기(채점)",
  summary: true, summaryBlurb: "파트별 표·기호·함정을 카드 한 장씩에 — 시험 직전 훑어보기용", maps,
  motion: false, kind: "paper", qn: 45, minutes: 80,
  practiceBlurb: `실제 시험지 ${N}회 · 공통 34 + 선택 11문항 · 답안지 채점`,
  chapters,
  intro: `<h2>이 노트가 다루는 것</h2>
<p>수능 국어 영역의 <strong>독서·문학(공통)</strong>과 <strong>선택과목(화법과 작문 / 언어와 매체)</strong>을 갈래별로 나눠, 지문을 읽는 절차와 선지를 가르는 기준을 정리했습니다. 국어는 외워서 푸는 과목이 아니라 <em>읽는 순서와 판단 기준</em>을 익히는 과목이라, 각 파트는 개념 → 읽는 절차 → 오답 패턴 → 직접 만든 예제 → 짝짓기·퀴즈로 구성했습니다. 실제 시험지로 풀어 보는 <em>수능 풀어보기</em>는 시험지 전체를 그대로 보여 주고 답안지로 채점합니다.</p>
${note("시험 구조", "80분 · 45문항 · 100점. 공통(독서·문학) 1~34번과 선택 35~45번(화법과 작문 또는 언어와 매체 중 택1)입니다. 모두 5지 선다이며 점수는 2점·3점 문항으로 나뉩니다.")}
<h2>파트 구성</h2>
${tbl(["영역", "파트", "핵심"], [["독서", "1 총론 · 2 인문·철학·예술 · 3 사회·경제·법 · 4 과학·기술 · 5 주제 통합", "구조 파악·선지 판별·〈보기〉 적용"], ["문학", "6 현대시 · 7 현대소설 · 8 고전시가 · 9 고전소설·수필 · 10 극·수필·복합", "표현·서술상 특징·감상"], ["선택", "11 화법과 작문 · 12 언어와 매체", "발표·토론·작문 / 문법·매체"]])}
${tip("독서는 문단 구조(핵심어 → 관계)를 붙잡는 훈련이 먼저입니다. 문학은 작품 갈래별 ‘묻는 방식’이 정해져 있으니 6→7→8→9 순으로 한 갈래씩 잡고, 선택과목은 자신의 선택 하나만 집중해서 보세요.")}`,
  after: `<h2>기출 데이터</h2><p>수능 2018~2026학년도, 6월·9월 모의평가 2018~2027학년도(2018~2021학년도는 2009 개정 교육과정 시험) <strong>${N}회</strong> 시험지의 지문·문항 이미지와 정답·배점이 들어 있습니다. 홀수형 기준이고, 2018~2021학년도는 선택과목 없는 통합 45문항 시험이며, 지문은 단(段) 단위 이미지로 이어 붙여 보여 줍니다.</p>`,
};
