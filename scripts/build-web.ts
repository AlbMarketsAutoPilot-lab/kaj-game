// Builds dist/kaj.html: one self-contained file (script, styles, background art inlined).
// It opens straight from disk, with no server: npm run build
import { build } from 'esbuild';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root));
const dataUri = (p: string) => `data:image/webp;base64,${read(p).toString('base64')}`;

const result = await build({
  entryPoints: [new URL('src/web/main.ts', root).pathname],
  bundle: true,
  format: 'iife',
  target: 'es2020',
  minify: true,
  write: false,
});

const css = read('web/style.css')
  .toString()
  .replace('BG_LANDSCAPE', dataUri('assets/art/background-landscape.webp'))
  .replace('BG_PORTRAIT', dataUri('assets/art/background-portrait.webp'));
const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

// Flags for the challenges (task 12), as data URIs keyed by country code.
const flags = Object.fromEntries(
  readdirSync(new URL('assets/flags/', root))
    .filter((f) => f.endsWith('.svg'))
    .map((f) => [f.slice(0, -4), `data:image/svg+xml;base64,${read(`assets/flags/${f}`).toString('base64')}`]),
);

const html = read('web/index.html')
  .toString()
  .replace('/*STYLE*/', () => css)
  .replace('/*FLAGS*/', () => JSON.stringify(flags))
  .replace('/*SCRIPT*/', () => js);

mkdirSync(new URL('dist/', root), { recursive: true });
writeFileSync(new URL('dist/kaj.html', root), html);
console.log(`dist/kaj.html: ${Math.round(html.length / 1024)} KB`);
