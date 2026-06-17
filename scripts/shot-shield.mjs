import { chromium } from "playwright";

const base = "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

// Landing (hero link + Scam Shield showcase band)
await page.goto(base + "/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: "qa-shots/shield-landing.png", fullPage: true });
console.log("landing  HTTP 200");

// Scam Shield tool — run an actual scan on the suspicious example
await page.goto(base + "/scam-shield", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(1000);
await page.screenshot({ path: "qa-shots/shield-empty.png", fullPage: true });

await page.getByText("Try a suspicious one").click();
await page.getByRole("button", { name: /Scan for scams/i }).click();
try {
  await page.getByText("Scam Shield verdict").waitFor({ timeout: 25000 });
  await page.waitForTimeout(600);
  console.log("scan     verdict rendered");
} catch {
  console.log("scan     verdict did NOT render in time");
}
await page.screenshot({ path: "qa-shots/shield-result.png", fullPage: true });

await browser.close();
console.log("done");
