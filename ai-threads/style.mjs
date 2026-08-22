// 접속부사·AI 상투어를 지우고 Threads 한도(500자)에 맞춘다.

export const THREADS_MAX = 500;

export const CONNECTIVES = [
  "그러나", "하지만", "그렇지만", "그런데",
  "따라서", "그러므로", "그래서", "그리하여", "이에 따라", "그 결과",
  "또한", "게다가", "아울러", "더불어", "뿐만 아니라", "뿐만아니라",
  "한편", "반면", "반면에", "이와 달리", "이와함께", "이와 함께",
  "즉", "다시 말해", "다시말해", "말하자면",
  "결국", "결론적으로", "요약하면", "정리하면", "요약하자면",
  "그럼에도 불구하고", "그럼에도불구하고", "그럼에도",
  "특히", "무엇보다", "우선", "먼저", "다음으로", "마지막으로",
  "실제로", "사실상", "본질적으로", "기본적으로",
];

export const AI_TELLS = [
  /주목할\s*(만점|점은|것은)/g,
  /흥미로운\s*(점|것은|사실은)/g,
  /눈여겨볼/g,
  /이는\s*.{0,12}의미/g,
  /오늘\s*.{0,10}정리/g,
  /핵심만\s*모았/g,
  /빠르게\s*살펴/g,
  /알아보겠습니다/g,
  /살펴보겠습니다/g,
  /세 가지로 정리/g,
  /다음과 같습니다/g,
  /중요한 것은/g,
  /앞으로의 전망/g,
];

const connectiveRe = new RegExp(
  `(^|[\\s\\n])(?:${CONNECTIVES.map((w) => w.replace(/\s+/g, "\\s+")).join("|")})(?=[\\s,.]|$)`,
  "g",
);

export function countChars(text) {
  return [...String(text || "")].length;
}

export function stripSourceSuffix(title) {
  return String(title || "")
    .replace(/\s+-\s+[^-]+$/, "")
    .replace(/\s+\|\s+[^|]+$/, "")
    .trim();
}

export function scrub(text) {
  let out = String(text || "").replace(/\r\n/g, "\n");
  out = out.replace(connectiveRe, "$1");
  for (const re of AI_TELLS) out = out.replace(re, "");
  out = out
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/^[ \t]+|[ \t]+$/gm, "")
    .trim();
  if (countChars(out) > THREADS_MAX) out = [...out].slice(0, THREADS_MAX).join("").trim();
  return out;
}

export function leftoverConnectives(text) {
  const found = [];
  for (const w of CONNECTIVES) {
    const re = new RegExp(`(^|[\\s\\n])${w.replace(/\s+/g, "\\s+")}(?=[\\s,.]|$)`);
    if (re.test(text)) found.push(w);
  }
  return found;
}
