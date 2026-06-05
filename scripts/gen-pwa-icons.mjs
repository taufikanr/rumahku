import sharp from "sharp";
import { fileURLToPath } from "node:url";
const MARK = fileURLToPath(new URL("../public/brand/logo-mark.png", import.meta.url));
const PUB = fileURLToPath(new URL("../public/", import.meta.url));
async function make(size, padRatio) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const resized = await sharp(MARK)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toFile(PUB + `icon-${size}.png`);
}
await make(192, 0.16);
await make(512, 0.16);
console.log("pwa icons done");
