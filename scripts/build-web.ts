// Builds dist/kaj.html: one self-contained file (script, styles, poster, background art, font and sounds inlined).
// It opens straight from disk, with no server: npm run build
import { build } from 'esbuild';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root));
const dataUri = (p: string, type = 'image/webp') => `data:${type};base64,${read(p).toString('base64')}`;

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
  .replace('BG_LANDSCAPE', dataUri('assets/art/background.webp'))
  .replace('FONT_CINZEL', dataUri('assets/fonts/cinzel-700.woff2', 'font/woff2'));
const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

// Flags for the challenges (task 12), as data URIs keyed by country code.
const flags = Object.fromEntries(
  readdirSync(new URL('assets/flags/', root))
    .filter((f) => f.endsWith('.svg'))
    .map((f) => [f.slice(0, -4), `data:image/svg+xml;base64,${read(`assets/flags/${f}`).toString('base64')}`]),
);

// Wonder posters (task M6), as SVG text keyed by area id.
const wonders = Object.fromEntries(
  readdirSync(new URL('assets/wonders/', root))
    .filter((f) => f.endsWith('.svg'))
    .map((f) => [f.slice(0, -4), read(`assets/wonders/${f}`).toString()]),
);

// Sounds (task 14C), as data URIs keyed by file name.
const sounds = Object.fromEntries(
  readdirSync(new URL('assets/sounds/', root))
    .filter((f) => f.endsWith('.mp3'))
    .map((f) => [f.slice(0, -4), dataUri(`assets/sounds/${f}`, 'audio/mpeg')]),
);

const html = read('web/index.html')
  .toString()
  .replace('/*STYLE*/', () => css)
  .replace('/*FLAGS*/', () => JSON.stringify(flags))
  .replace('/*SOUNDS*/', () => JSON.stringify(sounds))
  .replace('/*WONDERS*/', () => JSON.stringify(wonders).replace(/<\/script/gi, '<\\/script'))
  .replace('/*POSTER*/', () => dataUri('assets/art/poster.webp'))
  .replace('/*SCRIPT*/', () => js);

mkdirSync(new URL('dist/', root), { recursive: true });
writeFileSync(new URL('dist/kaj.html', root), html);
console.log(`dist/kaj.html: ${Math.round(html.length / 1024)} KB`);
