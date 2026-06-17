import { chromium } from "playwright";

const base = "http://localhost:3000";
const shots = [
  ["browse", "/browse"],
  ["listing-verified", "/listing/l-001"],
  ["certificate", "/listing/l-001/verified"],
  ["listing-flagged", "/listing/l-023"],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });

for (const [name, path] of shots) {
  const res = await page.goto(base + path, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `qa-shots/vr-${name}.png`, fullPage: true });
  console.log(`${name.padEnd(18)} ${path.padEnd(26)} HTTP ${res?.status()}`);
}

await browser.close();
console.log("done");
