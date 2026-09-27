import { chromium } from "playwright";
const ids = ["cannon","orbit","chem","chinese","pride","anger","math","market"];
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox","--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 1100, height: 720 } });
const out = [];
for (const id of ids) {
  const errors = [];
  page.on("console", (m) => { if (m.type()==="error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  const resp = await page.goto(`http://127.0.0.1:8080/play/${id}`, { waitUntil: "networkidle", timeout: 25000 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `/workspace/screenshots/feel-${id}.png` });
  const text = (await page.locator("body").innerText()).replace(/\n/g," ").slice(0,160);
  out.push({ id, status: resp?.status(), errors, text });
  page.removeAllListeners("console");
  page.removeAllListeners("pageerror");
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
