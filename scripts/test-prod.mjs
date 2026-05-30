import { chromium } from "playwright";

const URL = "https://rumahku-app-nine.vercel.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));

await page.goto(URL + "/login", { waitUntil: "domcontentloaded" });
await page.fill('input[name="email"]', "landlord@demo.rumahku.my");
await page.fill('input[name="password"]', "rumahku123");
await page.click('button[type="submit"]');
await page
  .waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 25000 })
  .catch(() => {});
await page.waitForTimeout(2000);

const text = await page.locator("body").innerText();
console.log("after-login URL :", page.url());
console.log("has 'Welcome back':", text.includes("Welcome back"));
console.log("has 'Your listings':", text.includes("Your listings"));
console.log("page errors      :", errs.length ? errs : "none ✓");
await page.screenshot({ path: "qa-shots/prod-dashboard.png", fullPage: true });
await browser.close();
