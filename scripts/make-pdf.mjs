import { chromium } from "playwright";
import path from "node:path";

const [htmlPath, outPath] = process.argv.slice(2);
if (!htmlPath || !outPath) {
  console.error("usage: node scripts/make-pdf.mjs <input.html> <output.pdf>");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("file://" + path.resolve(htmlPath), { waitUntil: "load" });
await page.waitForTimeout(400);
await page.pdf({
  path: outPath,
  format: "A4",
  printBackground: true,
  margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" },
});
await browser.close();
console.log("✅ PDF written:", outPath);
