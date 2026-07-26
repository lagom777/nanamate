// 현재 `codex login status`가 ChatGPT 로그인이면 Codex CLI를 글 작성 엔진으로 사용한다.
// 브라우저 쿠키나 Codex 자격 증명 파일을 직접 읽지 않고 공식 CLI만 호출한다.

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const SCHEMA = join(DIR, "post.schema.json");

export function codexChatGPTStatus() {
  const result = spawnSync("codex", ["login", "status"], {
    encoding: "utf8",
    timeout: 10_000,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  if (result.error?.code === "ENOENT") return { ready: false, reason: "Codex CLI 없음" };
  if (result.status !== 0) return { ready: false, reason: "Codex 로그인 상태 확인 실패" };
  if (!/Logged in using ChatGPT/i.test(output)) return { ready: false, reason: "ChatGPT 로그인이 아님" };
  return { ready: true, reason: "ChatGPT 로그인됨" };
}

export function callCodexChatGPT(system, user) {
  const status = codexChatGPTStatus();
  if (!status.ready) throw new Error(status.reason);
  if (!existsSync(SCHEMA)) throw new Error("Codex 출력 스키마가 없습니다.");

  const tempDir = mkdtempSync(join(tmpdir(), "reblog-codex-"));
  const outputFile = join(tempDir, "post.json");
  const prompt = `다음 자료만 사용해 한국어 부동산 게시글 JSON을 작성하세요.\n`+
    `도구를 호출하거나 파일·인터넷을 열지 마세요. 입력에 없는 사실과 수치는 만들지 마세요.\n`+
    `body_markdown은 게시 가능한 완성 원고로 작성하고, body_naver는 같은 내용의 일반 텍스트로 작성하세요.\n`+
    `첫 문장을 '안녕하세요', '오늘은', '알아보겠습니다'로 시작하지 말고 매물의 핵심 조건이나 독자의 질문으로 바로 시작하세요.\n`+
    `sources_used는 입력에 실제로 있는 출처만 넣고 없으면 빈 배열로 두세요.\n\n`+
    `[작성 원칙]\n${system}\n\n[입력 자료]\n${user}`;

  try {
    const result = spawnSync("codex", [
      "exec",
      "--ephemeral",
      "--ignore-user-config",
      "--ignore-rules",
      "--skip-git-repo-check",
      "--sandbox", "read-only",
      "--color", "never",
      "--output-schema", SCHEMA,
      "--output-last-message", outputFile,
      // 작업 루트를 빈 임시 폴더로 둔다. auto/ 에는 config.local.json·.google-oauth.json 등
      // 시크릿이 있고, read-only 샌드박스도 읽기는 허용하므로 작업 루트로 주지 않는다.
      "-C", tempDir,
      "-",
    ], {
      input: prompt,
      encoding: "utf8",
      timeout: 240_000,
      maxBuffer: 8 * 1024 * 1024,
      stdio: ["pipe", "pipe", "pipe"],
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      const detail = String(result.stderr || result.stdout || "").replace(/\s+/g, " ").slice(-500);
      throw new Error(`Codex 글 작성 실패(${result.status}): ${detail || "출력 없음"}`);
    }
    if (!existsSync(outputFile)) throw new Error("Codex 최종 출력 파일이 없습니다.");
    const text = readFileSync(outputFile, "utf8").trim();
    if (!text) throw new Error("Codex 최종 출력이 비어 있습니다.");
    return text;
  } finally {
    try { rmSync(tempDir, { recursive: true, force: true }); } catch {}
  }
}
