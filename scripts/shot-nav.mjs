import { chromium } from "playwright";

const base = "http://localhost:3000";
const browser = await chromium.launch();

async function shotFor(role, email) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 300 } });
  const page = await ctx.newPage();
  await page.goto(base + "/login", { waitUntil: "domcontentloaded" });
  await page.fill("#email", email);
  await page.fill("#password", "rumahku123");
  await page.getByRole("button", { name: /log in/i }).click();
  try {
    await page.waitForLoadState("networkidle", { timeout: 15000 });
  } catch {}
  await page.goto(base + "/browse", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `qa-shots/nav-${role}.png`, clip: { x: 0, y: 0, width: 1280, height: 72 } });
  const links = await page.$$eval("header nav a", (as) => as.map((a) => a.textContent?.trim()).filter(Boolean));
  console.log(`${role.padEnd(9)} primary nav: ${links.join(" · ")}`);
  await ctx.close();
}

await shotFor("tenant", "tenant@demo.rumahku.my");
await shotFor("landlord", "landlord@demo.rumahku.my");

await browser.close();
console.log("done");
