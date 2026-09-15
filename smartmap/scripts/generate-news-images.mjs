#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../public/images/news");
mkdirSync(outDir, { recursive: true });

const heroes = [
  { file: "politics.jpg", colors: ["#0a1628", "#6366f1"] },
  { file: "technology.jpg", colors: ["#1e1b4b", "#06b6d4"] },
  { file: "sports.jpg", colors: ["#0a1628", "#8b5cf6"] },
  { file: "science.jpg", colors: ["#134e4a", "#06b6d4"] },
  { file: "business.jpg", colors: ["#1e293b", "#fbbf24"] },
  { file: "entertainment.jpg", colors: ["#4c1d95", "#ec4899"] },
  { file: "health.jpg", colors: ["#064e3b", "#34d399"] },
  { file: "africa.jpg", colors: ["#7c2d12", "#fbbf24"] },
  { file: "world.jpg", colors: ["#1e3a8a", "#6366f1"] },
];

for (const { file, colors } of heroes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors[0]}"/><stop offset="100%" stop-color="${colors[1]}"/>
    </linearGradient></defs>
    <rect width="800" height="450" fill="url(#g)"/>
    <circle cx="700" cy="80" r="120" fill="white" opacity="0.06"/>
    <circle cx="100" cy="380" r="80" fill="white" opacity="0.04"/>
  </svg>`;

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(outDir, file));
  console.log(`✓ public/images/news/${file}`);
}
