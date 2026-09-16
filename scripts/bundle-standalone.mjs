/* Produit un fichier HTML autonome (CSS, JS et polices integres) a partir de
   dist/. Ouvrable au double-clic, sans serveur. Lancer `npm run standalone`
   (fait le build puis ce script).

   Sorties :
   - portfolio/dist/site-autonome.html
   - apercu-site-complet.html   (a la racine du dossier CLAUDE)                 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const projectDir = fileURLToPath(new URL('..', import.meta.url));
const dist = join(projectDir, 'dist');
const inDist = (...s) => join(dist, ...s);

let html = await readFile(inDist('index.html'), 'utf8');

/* --- 1. CSS : recupere le(s) fichier(s) references, integre les polices ---- */
const cssHrefs = [...html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
let cssBundle = '';
for (const m of cssHrefs) {
  let css = await readFile(inDist(m[1].replace(/^\//, '')), 'utf8');
  for (const f of ['syne-latin', 'syne-latin-ext', 'jetbrainsmono-latin', 'jetbrainsmono-latin-ext']) {
    const file = `${f}.woff2`;
    const b64 = (await readFile(inDist('fonts', file))).toString('base64');
    css = css.split(`url(/fonts/${file})`).join(`url(data:font/woff2;base64,${b64})`);
  }
  cssBundle += css;
}

/* --- 2. JS module --------------------------------------------------------- */
const jsSrcs = [...html.matchAll(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)];
let jsBundle = '';
for (const m of jsSrcs) {
  const js = await readFile(inDist(m[1].replace(/^\//, '')), 'utf8');
  jsBundle += js.split('</script').join('<\\/script') + '\n';
}

/* --- 3. images optimisees (astro:assets, ex. photos du hero) -> data: URI -- */
const mimeOf = { avif: 'image/avif', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
const imgPaths = new Set(
  [...html.matchAll(/\/_astro\/[A-Za-z0-9_.-]+\.(avif|webp|jpe?g|png)/g)].map((m) => m[0]),
);
for (const path of imgPaths) {
  const ext = path.split('.').pop();
  const buf = await readFile(inDist(path.replace(/^\//, '')));
  const uri = `data:${mimeOf[ext]};base64,${buf.toString('base64')}`;
  html = html.split(path).join(uri);
}

/* --- 4. favicon SVG en data: URI --------------------------------------------*/
const favSvg = await readFile(join(projectDir, 'public', 'favicon.svg'), 'utf8');
const favUri = `data:image/svg+xml;base64,${Buffer.from(favSvg).toString('base64')}`;

/* --- 5. reecriture du HTML --------------------------------------------------*/
html = html
  .replace(/<link rel="stylesheet"[^>]*href="\/_astro\/[^"]+"[^>]*>/g, '')
  .replace(/<script type="module"[^>]*src="\/_astro\/[^"]+"><\/script>/g, '')
  .replace(/<link rel="icon" href="\/favicon\.svg"[^>]*>/, `<link rel="icon" type="image/svg+xml" href="${favUri}">`)
  .replace(/<link rel="icon" href="\/favicon\.png"[^>]*>\s*/, '')
  .replace(/<link rel="apple-touch-icon"[^>]*>\s*/, '')
  .replace(/<link rel="preload" href="\/fonts\/[^"]+"[^>]*>\s*/g, '')
  .replace(/<meta property="og:image[^"]*"[^>]*>\s*/g, '')
  .replace(/<meta name="twitter:image"[^>]*>\s*/g, '')
  .replace('</head>', `<style>${cssBundle}</style></head>`)
  .replace('</body>', `<script type="module">${jsBundle}</script></body>`);

const banner =
  '<!-- Fichier autonome genere depuis le projet Astro (portfolio/). ' +
  'CSS, JS et polices integres. Regenerer avec: npm run standalone -->\n';
html = html.replace(/^<!DOCTYPE html>/i, `<!DOCTYPE html>\n${banner}`);

await writeFile(inDist('site-autonome.html'), html);
await writeFile(join(projectDir, '..', 'apercu-site-complet.html'), html);

console.log(`[standalone] ${(Buffer.byteLength(html) / 1024).toFixed(0)} Ko`);
console.log('  portfolio/dist/site-autonome.html');
console.log('  apercu-site-complet.html');
