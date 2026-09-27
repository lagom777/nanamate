import { chromium } from "playwright";
const ids = [
  "/",
  "/play/era",
  "/play/writing",
  "/play/english",
  "/play/religion",
  "/play/tarot",
  "/play/shame",
  "/play/astrology",
  "/play/saju",
  "/play/ai",
  "/play/db",
  "/play/socio",
  "/play/harness",
  "/play/disgust",
  "/play/joy",
  "/play/fengshui",
  "/play/frontend",
  "/play/law",
  "/play/chinese",
  "/play/toeic",
  "/play/toefl",
  "/play/finance",
  "/play/startup",
  "/play/politics",
  "/play/love",
  "/play/surprise",
  "/play/cannon",
];
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 1100, height: 740 } });
const out = [];
for (const path of ids) {
  const errors = [];
  const onC = (m) => { if (m.type() === "error") errors.push(m.text()); };
  const onE = (e) => errors.push(String(e));
  page.on("console", onC);
  page.on("pageerror", onE);
  const resp = await page.goto(`http://127.0.0.1:8080${path}`, { waitUntil: "networkidle", timeout: 25000 });
  await page.waitForTimeout(800);
  const name = path === "/" ? "hub" : path.split("/").pop();
  await page.screenshot({ path: `/workspace/screenshots/rw-${name}.png` });
  const text = (await page.locator("body").innerText()).replace(/\n/g, " ").slice(0, 140);
  const canvas = await page.locator("canvas").count();
  out.push({ path, status: resp?.status(), canvas, errors: errors.slice(0, 4), text });
  page.off("console", onC);
  page.off("pageerror", onE);
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
