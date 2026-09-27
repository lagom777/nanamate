import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
mkdirSync("/workspace/screenshots", { recursive: true });

const ids = [
  "philo",
  "myth",
  "fear",
  "pride",
  "chinese",
  "toeic",
  "toefl",
  "anger",
  "sadness",
  "surprise",
  "psy",
  "teps",
  "joy",
  "disgust",
];

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const reports = [];

for (const id of ids) {
  const cons = [];
  const pages = [];
  page.removeAllListeners("console");
  page.removeAllListeners("pageerror");
  page.on("console", (m) => {
    if (m.type() === "error") cons.push(m.text());
  });
  page.on("pageerror", (e) => pages.push(String(e?.message || e)));
  const r = await page.goto(`http://127.0.0.1:8080/play/${id}`, {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.waitForTimeout(700);
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  const title = await page.locator("h1").innerText().catch(() => "");
  const coach = await page.locator("p").nth(1).innerText().catch(() => "");
  if (box) {
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.55);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.42, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: `/workspace/screenshots/new-${id}.png` });
  reports.push({
    id,
    status: r?.status(),
    title,
    coach: coach.slice(0, 80),
    canvas: Boolean(box),
    cons,
    pages,
  });
}

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
for (const id of ["philo", "chinese", "joy", "psy", "anger"]) {
  const cons = [];
  mobile.removeAllListeners("console");
  mobile.on("console", (m) => {
    if (m.type() === "error") cons.push(m.text());
  });
  await mobile.goto(`http://127.0.0.1:8080/play/${id}`, { waitUntil: "networkidle" });
  await mobile.waitForTimeout(500);
  const overflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
  );
  await mobile.screenshot({ path: `/workspace/screenshots/new-${id}-m.png` });
  reports.push({ id: id + "-m", overflow, cons });
}

console.log(JSON.stringify(reports, null, 2));
await browser.close();
