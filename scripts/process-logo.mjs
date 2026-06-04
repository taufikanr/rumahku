import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../LatestLogo.jpg", import.meta.url));
const OUT_DIR = fileURLToPath(new URL("../public/brand/", import.meta.url));
const APP_DIR = fileURLToPath(new URL("../src/app/", import.meta.url));
mkdirSync(OUT_DIR, { recursive: true });

// Knock the solid-black background out to transparency.
// The darkest *content* in the logo is navy (luminance well above pure black),
// so a low threshold with a small anti-alias ramp keeps edges clean.
async function knockoutBlack(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const maxC = Math.max(data[i], data[i + 1], data[i + 2]);
    let a;
    if (maxC <= 12) a = 0;
    else if (maxC >= 40) a = 255;
    else a = Math.round(((maxC - 12) / (40 - 12)) * 255);
    data[i + 3] = a;
  }
  return { data, width, height, channels };
}

const { data, width, height, channels } = await knockoutBlack(SRC);
const raw = { width, height, channels };
const fresh = () => sharp(Buffer.from(data), { raw });

// 1) Full lockup, transparent background, trimmed to content.
await fresh().trim({ threshold: 1 }).png().toFile(OUT_DIR + "logo-full.png");

// 2) Icon-only mark: crop the shield region from the upper-centre of the
//    1024x1024 artwork (fixed box; tight enough to exclude the wordmark below).
const markBuf = await fresh()
  .extract({ left: 286, top: 150, width: 452, height: 438 })
  .png()
  .toBuffer();
await sharp(markBuf).toFile(OUT_DIR + "logo-mark.png");

// 3) Favicon: shield centred on a 512x512 transparent canvas with light padding.
//    Next's `app/icon.png` file convention serves this as the site icon.
const PAD = 48;
const inner = 512 - PAD * 2;
const resized = await sharp(markBuf)
  .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: resized, gravity: "center" }])
  .png()
  .toFile(APP_DIR + "icon.png");

console.log("done:", { width, height, channels });
