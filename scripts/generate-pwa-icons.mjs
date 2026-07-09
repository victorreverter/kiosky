import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const icons = [
  { src: 'pwa-192x192.svg', size: 192, out: 'pwa-192x192.png', bg: '#3b82f6' },
  { src: 'pwa-512x512.svg', size: 512, out: 'pwa-512x512.png', bg: '#3b82f6' },
  { src: 'apple-touch-icon.svg', size: 180, out: 'apple-touch-icon.png', bg: '#3b82f6' },
];

for (const icon of icons) {
  try {
    const svgBuffer = fs.readFileSync(join(publicDir, icon.src));
    await sharp(svgBuffer)
      .resize(icon.size, icon.size)
      .png()
      .toFile(join(publicDir, icon.out));
    console.log(`Generated ${icon.out}`);
  } catch (err) {
    console.warn(`Skipping ${icon.src}: ${err.message}`);
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.size} ${icon.size}">
  <rect width="${icon.size}" height="${icon.size}" rx="${Math.round(icon.size * 0.2)}" fill="${icon.bg}"/>
  <text x="${icon.size / 2}" y="${icon.size * 0.65}" font-family="Arial, sans-serif" font-size="${Math.round(icon.size * 0.55)}" font-weight="bold" fill="white" text-anchor="middle">K</text>
</svg>`;
    await sharp(Buffer.from(svgContent))
      .resize(icon.size, icon.size)
      .png()
      .toFile(join(publicDir, icon.out));
    console.log(`Generated ${icon.out} from fallback SVG`);
  }
}
