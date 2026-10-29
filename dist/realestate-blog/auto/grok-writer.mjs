// xAI Grok 작성 엔진 — OpenAI 호환 chat/completions.
// 키: 환경변수 XAI_API_KEY 또는 config.local.json 의 xaiKey
// 문서: https://docs.x.ai (모델 기본 grok-4-latest)

export function grokStatus(config = {}) {
  const key = process.env.XAI_API_KEY || config.xaiKey || "";
  if (!String(key).trim()) return { ready: false, reason: "XAI_API_KEY 없음" };
  return { ready: true, reason: "xAI 키 있음", key: String(key).trim() };
}

export async function callGrok(system, user, { key, model = "grok-4-latest", timeoutMs = 180_000 } = {}) {
  if (!key) throw new Error("XAI_API_KEY 없음");
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: false,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content:
            "JSON 객체 하나만 출력하세요. 코드펜스·설명 없이. 입력 자료에 없는 수치·링크는 만들지 마세요.\n\n" +
            user,
        },
      ],
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Grok ${res.status}: ${text.slice(0, 240)}`);
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Grok 응답이 JSON이 아님");
  }
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Grok 빈 응답");
  }
  return content;
}
