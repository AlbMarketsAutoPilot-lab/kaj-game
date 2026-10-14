// Makes src/maps/centres.ts: the pawn spot of every area on both maps (the point deepest inside
// its biggest piece), found once here instead of on the phone at every start (Google Play review,
// 2026-10-14). Run after changing map shapes: node scripts/map-centres.ts
import { writeFileSync } from 'node:fs';
import { map30 } from '../src/maps/map30.ts';
import { map50 } from '../src/maps/map50.ts';
import { shapes30 } from '../src/maps/shapes30.ts';
import { shapes50 } from '../src/maps/shapes50.ts';
import { buildGeo } from '../src/web/maps.ts';

const out: Record<string, Record<string, [number, number]>> = {};
for (const [map, shapes] of [[map30, shapes30], [map50, shapes50]] as const) {
  out[map.id] = Object.fromEntries([...buildGeo(map, shapes)].map(([id, g]) => [id, g.centre]));
}
writeFileSync(new URL('../src/maps/centres.ts', import.meta.url),
  '// Made by scripts/map-centres.ts. Do not edit by hand.\n\n'
  + `export const centres: Record<string, Record<string, [number, number]>> = ${JSON.stringify(out)};\n`);
