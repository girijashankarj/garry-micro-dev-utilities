/**
 * Rasterize public/favicon.svg to PNGs for PWA install prompts (Chrome requires PNG).
 * Run: npm run icons
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svgPath = path.join(root, 'public', 'favicon.svg');
const outDir = path.join(root, 'public');

async function main() {
  if (!fs.existsSync(svgPath)) {
    console.error('Missing', svgPath);
    process.exit(1);
  }
  await sharp(svgPath).resize(192, 192).png().toFile(path.join(outDir, 'pwa-192.png'));
  await sharp(svgPath).resize(512, 512).png().toFile(path.join(outDir, 'pwa-512.png'));
  await sharp(svgPath).resize(180, 180).png().toFile(path.join(outDir, 'apple-touch-icon.png'));
  console.log('Wrote pwa-192.png, pwa-512.png, apple-touch-icon.png to public/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
