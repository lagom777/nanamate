// 수능 수학 — 수학Ⅰ · 수학Ⅱ · 미적분 (파트별 노트는 content/math-*.mjs, 전략은 content/st-math.mjs)
import { note, tip, tbl, examsOf } from "./lib.mjs";
import { maps } from "./maps-math.mjs";

const load = async (n) => { try { return (await import(`./content/${n}.mjs`)).chapters; } catch { return []; } };
const chapters = [...(await load("math-1")), ...(await load("math-2")), ...(await load("math-3")), ...(await load("st-math"))];
const N = examsOf("math").length;

export const spec = {
  sub: "math", folder: "aboutSuneungMath", label: "수능 수학", short: "수학", color: "#7c3aed",
  glow: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.16)",
  asideSub: "수능 수학 — 수학Ⅰ·수학Ⅱ·미적분 + 기출",
  h1: "수능 수학,<br><em>Ⅰ·Ⅱ·미적분</em><br>파트별로 끝까지",
  authors: "2015 개정 교육과정 · 2027학년도 수능까지 · 실제 기출 " + N + "회 " + N * 30 + "문항 풀어보기",
  affiliation: "수학Ⅰ 3파트 · 수학Ⅱ 3파트 · 미적분 3파트 · 전략 · 수능 풀어보기(채점)",
  imageMaps: [
    { img: "images/01-numbers-sets.svg", title: "수와 집합", desc: "수 체계 확장(ℕ~ℂ), 벤다이어그램, 드모르간 법칙, 귀류법", chapter: "01-exp-log.html" },
    { img: "images/02-algebra.svg", title: "대수 — 다항식과 방정식", desc: "곱셈공식, 나머지정리, 판별식 D, 근과 계수의 관계, 근의 분리", chapter: "01-exp-log.html" },
    { img: "images/03-functions.svg", title: "함수와 그래프", desc: "일대일대응, 역함수(y=x 대칭), 평행·대칭이동, 점근선 개형", chapter: "04-limit.html" },
    { img: "images/04-geometry.svg", title: "기하 — 도형과 좌표기하", desc: "피타고라스 정리, 특수각 삼각비, 점과 직선 거리, 원과 접선", chapter: "02-trig.html" },
    { img: "images/05-trigonometry.svg", title: "삼각함수 — 원과 파동", desc: "단위원, 호도법(π=180°), 주기 2π/|b|, 사인법칙, 코사인법칙", chapter: "02-trig.html" },
    { img: "images/06-exponential-log.svg", title: "지수와 로그", desc: "거듭제곱근 개수, 밑변환 공식, 지수·로그 그래프와 역함수 대칭", chapter: "01-exp-log.html" },
    { img: "images/07-sequences-limits.svg", title: "수열과 극한", desc: "등차·등비 일반항과 합, 시그마 ∑k 공식, 무한등비급수 a/(1-r)", chapter: "03-sequence.html" },
    { img: "images/08-differentiation.svg", title: "미분 — 도함수와 그래프", desc: "미분계수 정의, 극대·극소 판정, 접선의 방정식, 3·4차함수 비율관계", chapter: "05-diff.html" },
    { img: "images/09-integration.svg", title: "적분과 통계", desc: "미적분학 기본정리(FTC), 곡선 넓이 공식, 중복조합, 정규분포 표준화 Z", chapter: "06-integral.html" },
  ],
  summary: true, summaryBlurb: "파트별 공식·그래프·비교표·함정을 카드 한 장씩에 — 시험 직전 훑어보기용", maps,
  motion: false, kind: "items", qn: 30, minutes: 100,
  practiceBlurb: `실제 시험지 ${N}회 ${N * 30}문항(2022~: 공통 22 + 미적분 8, ~2021: 가형) · 단답형 입력 · 채점`,
  chapters,
  intro: `<h2>이 노트가 다루는 것</h2>
<p>수능 수학의 <strong>공통 범위(수학Ⅰ·수학Ⅱ)와 선택과목 미적분</strong>을 과목별로 묶고, 각 과목을 다시 세 파트로 나눠 정리했습니다. 파트마다 개념 정리 → 그래프·식 읽는 법 → 기출에서 반복되는 함정 → 대표 예제 → 짝짓기·퀴즈 순으로 이어지고, 맨 아래에서 그 파트의 기출만 모아 풀 수 있습니다. 실제 시험지로 풀어 보는 <em>수능 풀어보기</em>는 이 수학 폴더 하나에서 통합해 제공합니다.</p>
${note("시험 구조", "100분 · 30문항 · 100점. 공통 22문항(수학Ⅰ·수학Ⅱ, 1~22번)과 선택 8문항(23~30번)으로 구성되고, 1~15·23~28번은 5지 선다, 16~22·29~30번은 답을 숫자로 적는 단답형입니다. 이 사이트는 선택과목 중 <strong>미적분</strong>을 다룹니다(확률과 통계·기하는 범위 밖).")}
<h2>과목·파트 구성</h2>
${tbl(["과목", "파트", "핵심"], [["수학Ⅰ", "1 지수와 로그 · 2 삼각함수 · 3 수열", "식 변형·그래프·규칙 찾기"], ["수학Ⅱ", "4 함수의 극한과 연속 · 5 미분 · 6 적분", "극한·접선·극값·넓이"], ["미적분", "7 수열의 극한 · 8 여러 가지 미분법 · 9 여러 가지 적분법", "급수·합성/매개변수 미분·치환/부분적분"]])}
${tip("수학Ⅱ의 미분·적분과 수학Ⅰ의 수열·지수로그가 공통 22문항의 뼈대입니다. 처음이라면 4→5→6→1→3→2 순으로 수학Ⅱ부터 잡고, 미적분 선택자는 7→8→9로 이어 가세요.")}`,
  after: `<h2>기출 데이터</h2><p>수능 2018~2026학년도, 6월·9월 모의평가 2018~2027학년도(2018~2021학년도는 2009 개정 교육과정 시험) <strong>${N}회 ${N * 30}문항</strong>(홀수형 · 공통 22 + 미적분 8)의 (2018~2021학년도는 구 교육과정의 수학 가형(이과) 30문항이라 단원 분류에는 들어가지 않습니다) 문제지 이미지·정답·배점이 들어 있습니다. 문항은 단원별로 분류해 각 파트 페이지의 출제 비중이 계산되며, 분류에는 일부 오차가 있을 수 있습니다.</p>`,
};
