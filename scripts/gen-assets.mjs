/* Génère favicon.png, apple-touch-icon.png et l'image Open Graph (og.png)
   à partir de sources SVG. Lancé automatiquement avant `astro build`
   (hook npm `prebuild`). Échoue en douceur si sharp est indisponible. */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const pub = join(here, '..', 'public');

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('[gen-assets] sharp indisponible — étape ignorée.');
  process.exit(0);
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#0c0c0d"/>
  <rect x="40.5" y="46" width="4.5" height="5" fill="#c0362c"/>
  <text x="32" y="45" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="34" letter-spacing="-1.5" fill="#f2f0ed">AL</text>
</svg>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0c0c0d"/>
  <g fill="none" stroke="rgba(255,255,255,0.10)">
    ${Array.from({ length: 7 }, (_, i) => `<line x1="${-100 + i * 220}" y1="0" x2="${100 + i * 220}" y2="630"/>`).join('')}
  </g>
  <rect x="0" y="558" width="1200" height="4" fill="#c0362c"/>
  <text x="72" y="150" font-family="Georgia, 'Times New Roman', serif" font-size="22" letter-spacing="6" fill="rgba(255,255,255,0.55)">ADRIEN LASSAU</text>
  <text x="68" y="360" font-family="Arial, sans-serif" font-weight="800" font-size="150" letter-spacing="-6" fill="#f2f0ed">ADRIEN</text>
  <text x="68" y="500" font-family="Arial, sans-serif" font-weight="800" font-size="150" letter-spacing="-6" fill="#f2f0ed">LASSAU</text>
  <text x="72" y="600" font-family="Georgia, serif" font-size="20" letter-spacing="4" fill="rgba(255,255,255,0.55)">CONTENU SOCIAL · PHOTO · VIDÉO — CÔTE D'AZUR</text>
</svg>`;

async function png(svg, size, name) {
  const buf = Buffer.from(svg);
  const img =
    typeof size === 'number'
      ? sharp(buf, { density: 384 }).resize(size, size)
      : sharp(buf, { density: 144 });
  await img.png().toFile(join(pub, name));
  console.log('[gen-assets]', name);
}

await png(favicon, 32, 'favicon.png');
await png(favicon, 180, 'apple-touch-icon.png');
await png(og, null, 'og.png');
console.log('[gen-assets] terminé.');
