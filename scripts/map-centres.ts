// Makes src/maps/centres.ts: the pawn spot of every area on the 3 maps (the point deepest inside
// its biggest piece), found once here instead of on the phone at every start (Google Play review,
// 2026-10-14). Also src/maps/colours.ts, the area colours (step 2.12b), for the same reason.
// Run after changing map shapes, areas or routes: node scripts/map-centres.ts
import { writeFileSync } from 'node:fs';
import { map30 } from '../src/maps/map30.ts';
import { map50 } from '../src/maps/map50.ts';
import { map100 } from '../src/maps/map100.ts';
import { shapes30 } from '../src/maps/shapes30.ts';
import { shapes50 } from '../src/maps/shapes50.ts';
import { shapes100 } from '../src/maps/shapes100.ts';
import { buildGeo, colourAreas } from '../src/web/maps.ts';

const out: Record<string, Record<string, [number, number]>> = {};
const colours: Record<string, Record<string, string>> = {};
for (const [map, shapes] of [[map30, shapes30], [map50, shapes50], [map100, shapes100]] as const) {
  const geo = buildGeo(map, shapes);
  out[map.id] = Object.fromEntries([...geo].map(([id, g]) => [id, g.centre]));
  colours[map.id] = Object.fromEntries(colourAreas(map, geo));
}
writeFileSync(new URL('../src/maps/centres.ts', import.meta.url),
  '// Made by scripts/map-centres.ts. Do not edit by hand.\n\n'
  + `export const centres: Record<string, Record<string, [number, number]>> = ${JSON.stringify(out)};\n`);
writeFileSync(new URL('../src/maps/colours.ts', import.meta.url),
  '// Made by scripts/map-centres.ts (step 2.12b). Do not edit by hand.\n\n'
  + `export const colours: Record<string, Record<string, string>> = ${JSON.stringify(colours)};\n`);
