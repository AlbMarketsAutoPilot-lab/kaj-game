// Writes src/cards/countries.ts: name, capital and currency of every country the event cards may name
// (step 2.8). Run: node scripts/card-countries.ts
// Data: data/countries.json (mledoze/countries, ODbL 1.0). Every country of both maps with a capital and a
// currency; `size` (km²) lets the game skip the very small ones (src/engine/engine.ts, cardCountry).
import { readFileSync, writeFileSync } from 'node:fs';
import { map30 } from '../src/maps/map30.ts';
import { map50 } from '../src/maps/map50.ts';

const data: any[] = JSON.parse(readFileSync(new URL('../data/countries.json', import.meta.url), 'utf8'));
const byName = new Map(data.map((c) => [c.name, c]));
// Names read with "the" in a sentence ("in the United States").
const THE = new Set(['United Kingdom', 'Netherlands', 'United Arab Emirates', 'Maldives', 'Philippines', 'Central African Republic',
  'Republic of the Congo', 'Dominican Republic', 'Bahamas', 'Seychelles', 'Comoros', 'United States']);

// Several currencies in the data: the first one is the country's own, except here (the convertible peso was
// abolished in 2021; Zimbabwe's list starts with the Botswana pula, the US dollar is the one used most).
const CURRENCY: Record<string, string> = { Cuba: 'Cuban peso', Zimbabwe: 'United States dollar' };
const used = new Set<string>();
for (const map of [map30, map50]) {
  for (const a of map.areas) {
    const cs = (a.countries ?? []).map((n) => byName.get(n)).filter((c) => c && c.capital?.length && Object.keys(c.currencies ?? {}).length);
    if (!cs.length) throw new Error(`no country data for ${a.id}`);
    cs.forEach((c) => used.add(c.name));
  }
}
const lines = [
  '// Made by `node scripts/card-countries.ts` from data/countries.json (mledoze/countries, ODbL 1.0). Do not edit by hand.',
  '// The countries the event cards may name (step 2.8): the name as used in a sentence, capital, currency, size in km².',
  'export interface CardCountry { name: string; capital: string; currency: string; size: number }',
  'export const CARD_COUNTRIES: Readonly<Record<string, CardCountry>> = {',
  ...[...used].sort().map((n) => {
    const c = byName.get(n);
    return `  ${JSON.stringify(n)}: { name: ${JSON.stringify((THE.has(n) ? 'the ' : '') + n)}, capital: ${JSON.stringify(c.capital[0])}, currency: ${JSON.stringify(CURRENCY[n] ?? String(Object.values(c.currencies)[0]))}, size: ${Math.round(c.area)} },`;
  }),
  '};',
];
writeFileSync(new URL('../src/cards/countries.ts', import.meta.url), lines.join('\n') + '\n');
console.log(`src/cards/countries.ts: ${used.size} countries`);
