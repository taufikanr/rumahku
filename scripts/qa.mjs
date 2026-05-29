import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:3000";
const OUT = "qa-shots";
fs.mkdirSync(OUT, { recursive: true });

const SAVED = ["l-001", "l-002", "l-007"];
const errors = [];

const browser = await chromium.launch();

async function shot(ctx, name, path) {
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => {
    if (m.type() === "error") errs.push(m.text());
  });
  page.on("pageerror", (e) => errs.push("PAGEERROR: " + e.message));
  await page
    .goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 30000 })
    .catch((e) => errs.push("GOTO: " + e.message));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  if (errs.length) errors.push({ name, path, errs });
  await page.close();
}

async function login(ctx, email) {
  const page = await ctx.newPage();
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', "rumahku123");
  await page.click('button[type="submit"]');
  await page
    .waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 15000 })
    .catch(() => {});
  await page.waitForTimeout(500);
  await page.close();
}

const VIEWPORTS = [
  ["mobile", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
  ["desktop", { viewport: { width: 1280, height: 900 } }],
];

for (const [vp, opts] of VIEWPORTS) {
  // Public pages (with a few saved listings primed)
  const pub = await browser.newContext(opts);
  await pub.addInitScript(
    (saved) => {
      try {
        localStorage.setItem("rumahku:saved", JSON.stringify(saved));
      } catch {}
    },
    SAVED,
  );
  for (const [n, p] of [
    ["home", "/"],
    ["browse", "/browse"],
    ["browse-filtered", "/browse?area=sepanggar&max=600&sort=match"],
    ["listing-safe", "/listing/l-001"],
    ["listing-scam", "/listing/l-023"],
    ["login", "/login"],
    ["signup", "/signup?role=landlord"],
    ["saved", "/saved"],
  ]) {
    await shot(pub, `${vp}-${n}`, p);
  }
  await pub.close();

  // Landlord
  const ll = await browser.newContext(opts);
  await login(ll, "landlord@demo.rumahku.my");
  for (const [n, p] of [
    ["dashboard", "/dashboard"],
    ["dashboard-new", "/dashboard/new"],
    ["tenancy", "/dashboard/tenancy"],
  ]) {
    await shot(ll, `${vp}-${n}`, p);
  }
  await ll.close();

  // Tenant
  const tn = await browser.newContext(opts);
  await tn.addInitScript(
    (saved) => {
      try {
        localStorage.setItem("rumahku:saved", JSON.stringify(saved));
      } catch {}
    },
    SAVED,
  );
  await login(tn, "tenant@demo.rumahku.my");
  for (const [n, p] of [
    ["bills", "/bills"],
    ["saved-auth", "/saved"],
  ]) {
    await shot(tn, `${vp}-${n}`, p);
  }
  await tn.close();
}

await browser.close();

console.log("=== CONSOLE/PAGE ERRORS ===");
console.log(errors.length ? JSON.stringify(errors, null, 2) : "none ✓");
console.log("screenshots:", fs.readdirSync(OUT).length);
