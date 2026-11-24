// 수능 수학 — 대수 · 미적분Ⅰ · 확률과 통계(선택과목 없음, 30문항 100분). 노트는 대수(content/math-1.mjs)·미적분Ⅰ(math-2.mjs), 전략은 content/st-math.mjs.
// 미적분Ⅱ(옛 미적분, content/math-3.mjs)는 지금 수능 범위가 아니라 뺐다(파일은 남겨 둠).
import { note, tip, tbl, examsOf } from "./lib.mjs";
import { maps as allMaps } from "./maps-math.mjs";
import { styles } from "./content/style-math.mjs";
import { quick } from "./content/quick-math.mjs";
import { motionLinks } from "./build-motion.mjs";

const load = async (n) => { try { return (await import(`./content/${n}.mjs`)).chapters; } catch { return []; } };
const all = [...(await load("math-1")), ...(await load("math-2")), ...(await load("math-3")), ...(await load("st-math"))];
// 지금 수능 범위(대수·미적분Ⅰ)만: 옛 미적분(c1~c3) 장은 뺀다. 요약 맵은 장 순서와 짝이라 같이 고른다
const keep = all.map((c) => c.group !== "미적분");
const chapters = all.filter((_, i) => keep[i]);
const maps = allMaps.filter((_, i) => keep[i]);
// 모션 노트 장면 중 이 장 file 이 붙은 것을 장 노트의 '🎬 모션으로 보기' 링크로
const ml = motionLinks("math");
for (const c of chapters) if (ml[c.file]) c.motion = ml[c.file];
// 묶음 이름을 지금 과목 이름으로(2015 개정 수학Ⅰ → 대수, 수학Ⅱ → 미적분Ⅰ)
const GROUP = { "수학Ⅰ": "대수", "수학Ⅱ": "미적분Ⅰ" };
for (const c of chapters) if (GROUP[c.group]) c.group = GROUP[c.group];
const N = examsOf("mathprob").length;   // 지금 시험과 같은 구성(공통 1~22 + 확률과 통계 23~30) + 예시문항. 과목 키 math 는 옛 공통+미적분(지난 수능 복습용)

export const spec = {
  sub: "mathprob", styles, quick, folder: "aboutSuneungMath", label: "수능 수학", short: "수학", color: "#7c3aed",
  glow: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.16)",
  asideSub: "수능 수학 — 대수·미적분Ⅰ + 기출",
  h1: "수능 수학,<br><em>대수·미적분Ⅰ·확통</em><br>파트별로 끝까지",
  authors: "30문항 · 100분 · 선택과목 없음 · 예시문항 + 기출 " + N + "회 " + N * 30 + "문항 풀어보기",
  affiliation: "대수 3파트 · 미적분Ⅰ 3파트 · 전략 · 수능 풀어보기(채점)",
  imageMaps: [
    { img: "images/01-numbers-sets.svg", title: "수와 집합", desc: "수 체계 확장(ℕ~ℂ), 벤다이어그램, 드모르간 법칙, 귀류법", chapter: "01-exp-log.html" },
    { img: "images/02-algebra.svg", title: "대수 — 다항식과 방정식", desc: "곱셈공식, 나머지정리, 판별식 D, 근과 계수의 관계, 근의 분리", chapter: "01-exp-log.html" },
    { img: "images/03-functions.svg", title: "함수와 그래프", desc: "일대일대응, 역함수(y=x 대칭), 평행·대칭이동, 점근선 개형", chapter: "04-limit.html" },
    { img: "images/04-geometry.svg", title: "기하 — 도형과 좌표기하", desc: "피타고라스 정리, 특수각 삼각비, 점과 직선 거리, 원과 접선", chapter: "02-trig.html" },
    { img: "images/05-trigonometry.svg", title: "삼각함수 — 원과 파동", desc: "단위원, 호도법(π=180°), 주기 2π/|b|, 사인법칙, 코사인법칙", chapter: "02-trig.html" },
    { img: "images/06-exponential-log.svg", title: "지수와 로그", desc: "거듭제곱근 개수, 밑변환 공식, 지수·로그 그래프와 역함수 대칭", chapter: "01-exp-log.html" },
    { img: "images/07-sequences-limits.svg", title: "수열과 극한", desc: "등차·등비 일반항과 합, 시그마 ∑k 공식, 무한등비급수 a/(1-r)", chapter: "03-sequence.html" },
    { img: "images/08-differentiation.svg", title: "미분 — 도함수와 그래프", desc: "미분계수 정의, 극대·극소 판정, 접선의 방정식, 3·4차함수 비율관계", chapter: "05-diff.html" },
    { img: "images/09-integration.svg", title: "적분과 통계", desc: "미적분학 기본정리(FTC), 곡선 넓이 공식 (중복조합·정규분포 표준화 Z는 확률과 통계 — 이 노트 범위 밖)", chapter: "06-integral.html" },
    { img: "images/10-quadratic-ratios.svg", title: "이차함수 — 포물선의 길이·넓이·기울기", desc: "포물선과 두 접선(길이비 1:1, 넓이비 1:2), 꼭짓점에서 가로 k → 세로 |a|k², 인수 꼴이면 함숫값은 거리의 곱", chapter: "05-diff.html" },
    { img: "images/11-cubic-ratios.svg", title: "삼차함수 — 비율 관계와 거리의 곱", desc: "극점 높이의 수평선(같은 간격, 2:1), 대칭점 1:√3, 중근이 있으면 1:2, 근에서의 기울기 = 다른 근까지 거리의 곱", chapter: "05-diff.html" },
    { img: "images/12-quartic-areas.svg", title: "사차함수 비율 관계와 넓이 공식", desc: "W자 1:√2와 높이 차 |a|d⁴, 한쪽이 평평한 사차 3:1, 넓이 공식 |a|/6·|a|/12·|a|/4, 도함수 넓이 = 높이 차", chapter: "06-integral.html" },
  ],
  summary: true, summaryBlurb: "파트별 공식·그래프·비교표·함정을 카드 한 장씩에 — 시험 직전 훑어보기용", maps,
  motion: true, motionBlurb: "그래프가 움직이며 바뀌는 것 — 밑·주기·기울기·넓이가 변할 때 무엇이 따라 변하나", kind: "items", qn: 30, minutes: 100,
  practiceBlurb: `평가원 예시문항 + 기출 ${N}회 ${N * 30}문항(대수·미적분Ⅰ 22 + 확률과 통계 8) · 단답형 입력 · 채점`,
  chapters,
  intro: `<h2>이 노트가 다루는 것</h2>
<p>수능 수학의 출제 과목은 <strong>대수 · 미적분Ⅰ · 확률과 통계</strong>이고 선택과목이 없습니다. 이 노트는 그중 <strong>대수와 미적분Ⅰ</strong>을 세 파트씩 정리했습니다. 파트마다 개념 정리 → 그래프·식 읽는 법 → 기출에서 반복되는 함정 → 대표 예제 → 짝짓기·퀴즈 순으로 이어지고, 맨 아래에서 그 파트의 기출만 모아 풀 수 있습니다. <strong>확률과 통계는 아직 노트가 없고</strong> 풀어보기의 23~30번으로 연습할 수 있습니다.</p>
${note("시험 구조", "100분 · 30문항 · 100점. 평가원 예시문항 기준으로 1~21번은 5지 선다, 22~30번은 답을 숫자로 적는 단답형입니다. 모든 수험생이 같은 문제를 풉니다.")}
<h2>과목·파트 구성</h2>
${tbl(["과목", "파트", "핵심"], [["대수", "1 지수와 로그 · 2 삼각함수 · 3 수열", "식 변형·그래프·규칙 찾기"], ["미적분Ⅰ", "4 함수의 극한과 연속 · 5 미분 · 6 적분", "극한·접선·극값·넓이"], ["확률과 통계", "노트 준비 중 — 풀어보기 23~30번", "경우의 수·확률·통계"]])}
${tip("처음이라면 4→5→6→1→3→2 순으로 미적분Ⅰ부터 잡으세요. 미분·적분과 수열·지수로그가 문항의 뼈대입니다.")}`,
  after: `<h2>기출 데이터</h2><p>평가원 <strong>수능 예시문항</strong>(30문항)과 2022~2027학년도 수능·6월·9월 모의평가 <strong>${N - 1}회</strong>의 문제지 이미지·정답·배점이 들어 있습니다. 2022~2027학년도 시험은 선택과목이 있던 때라, <strong>공통 1~22번(대수·미적분Ⅰ)에 확률과 통계 23~30번</strong>을 붙여 지금 범위와 같게 맞췄습니다. 1~22번은 단원별로 분류해 각 파트 페이지의 출제 비중이 계산되며, 분류에는 일부 오차가 있을 수 있습니다.</p>`,
};
