#!/usr/bin/env node
/**
 * Generate Smart Map PWA icons from brand SVG.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svg = readFileSync(join(root, "public/brand/smart-map-icon.svg"));

const outputs = [
  { path: "public/icons/icon-192.png", size: 192 },
  { path: "public/icons/icon-512.png", size: 512 },
  { path: "public/icons/apple-touch-icon.png", size: 180 },
  { path: "public/icons/icon-32.png", size: 32 },
  { path: "src/app/icon.png", size: 512 },
  { path: "public/og-image.png", size: 1200, height: 630 },
];

async function generateSplash() {
  const width = 1284;
  const height = 2778;
  const iconSize = 280;
  const iconBuffer = await sharp(svg).resize(iconSize, iconSize).png().toBuffer();

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 11, g: 58, b: 99, alpha: 1 },
    },
  })
    .composite([
      { input: iconBuffer, top: Math.round(height * 0.32), left: Math.round((width - iconSize) / 2) },
    ])
    .png({ compressionLevel: 9 })
    .toFile(join(root, "public/splash.png"));
}

async function main() {
  for (const { path, size, height } of outputs) {
    const out = join(root, path);
    let pipeline = sharp(svg).resize(size, height ?? size, {
      fit: "contain",
      background: { r: 11, g: 58, b: 99, alpha: 1 },
    });

    if (path.endsWith("og-image.png")) {
      pipeline = sharp(svg)
        .resize(400, 400)
        .extend({
          top: 115,
          bottom: 115,
          left: 400,
          right: 400,
          background: { r: 11, g: 58, b: 99, alpha: 1 },
        });
    }

    await pipeline.png({ compressionLevel: 9, quality: 90 }).toFile(out);
    const info = await sharp(out).metadata();
    console.log(`✓ ${path} (${info.width}x${info.height})`);
  }

  const favicon32 = await sharp(svg).resize(32, 32).png().toBuffer();
  writeFileSync(join(root, "public/favicon.ico"), favicon32);
  console.log("✓ public/favicon.ico (32x32)");

  await generateSplash();
  console.log("✓ public/splash.png (1284x2778)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
