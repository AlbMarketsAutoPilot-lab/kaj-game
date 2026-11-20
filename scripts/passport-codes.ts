// Writes src/web/passport-codes.ts: the 3-letter code of every country of both maps, for the passport's data
// page and its machine-readable lines (step 2.10). Run: node scripts/passport-codes.ts
// Data: data/countries.json (mledoze/countries, ODbL 1.0).
import { readFileSync, writeFileSync } from 'node:fs';
import { map30 } from '../src/maps/map30.ts';
import { map50 } from '../src/maps/map50.ts';

const data: any[] = JSON.parse(readFileSync(new URL('../data/countries.json', import.meta.url), 'utf8'));
const byName = new Map(data.map((c) => [c.name, c]));
const codes = new Map<string, string>();
for (const map of [map30, map50]) {
  for (const a of map.areas) {
    // The passport uses the area's first country; it must have a code. Others are added when the data has them.
    (a.countries ?? []).forEach((n, i) => {
      const c = byName.get(n);
      if (c?.cca3) codes.set(n, c.cca3);
      else if (i === 0) throw new Error(`no country code for ${n} (${a.id})`);
    });
  }
}
const lines = [
  '// Made by `node scripts/passport-codes.ts` from data/countries.json (mledoze/countries, ODbL 1.0). Do not edit by hand.',
  '// The 3-letter code of every country of both maps, for the passport (step 2.10).',
  'export const COUNTRY_CODE3: Readonly<Record<string, string>> = {',
  ...[...codes].sort(([a], [b]) => a.localeCompare(b)).map(([n, c]) => `  ${JSON.stringify(n)}: ${JSON.stringify(c)},`),
  '};',
  '',
];
writeFileSync(new URL('../src/web/passport-codes.ts', import.meta.url), lines.join('\n'));
console.log(`src/web/passport-codes.ts: ${codes.size} countries`);
