import assert from 'node:assert/strict';
import { test } from 'node:test';
import { colours } from '../src/maps/colours.ts';
import { map30 } from '../src/maps/map30.ts';
import { map50 } from '../src/maps/map50.ts';
import { map100 } from '../src/maps/map100.ts';
import { shapes30 } from '../src/maps/shapes30.ts';
import { shapes50 } from '../src/maps/shapes50.ts';
import { shapes100 } from '../src/maps/shapes100.ts';
import { AREA_COLOURS, buildGeo, colourAreas } from '../src/web/maps.ts';

// Area colours (owner, step 2.12b), made in advance by scripts/map-centres.ts (src/maps/colours.ts).
const MAPS = [[map30, shapes30], [map50, shapes50], [map100, shapes100]] as const;

test('stored area colours match the computed ones on the 3 maps', () => {
  for (const [map, shapes] of MAPS) {
    assert.deepEqual(colours[map.id], Object.fromEntries(colourAreas(map, buildGeo(map, shapes))), map.id);
  }
});

test('every part of a big country has one colour; the 10 colours are all used', () => {
  for (const [map] of MAPS) {
    const c = colours[map.id];
    for (const country of new Set(map.areas.flatMap((a) => (a.bigCountry ? [a.bigCountry] : [])))) {
      assert.equal(new Set(map.areas.filter((a) => a.bigCountry === country).map((a) => c[a.id])).size, 1, `${map.id} ${country}`);
    }
    assert.equal(new Set(Object.values(c)).size, AREA_COLOURS.length, map.id);
  }
});

test('no two neighbours share a colour: touching, walking, plane or ship route', () => {
  for (const [map, shapes] of MAPS) {
    const c = colours[map.id];
    const geo = buildGeo(map, shapes);
    const country = (id: string) => map.areas.find((a) => a.id === id)!.bigCountry ?? id;
    const pairs = [
      ...map.areas.flatMap((a) => [...a.neighbours, ...geo.get(a.id)!.touches].map((n) => [a.id, n])),
      ...(map.routes ?? []).filter((r) => r.kind === 'airport' || r.kind === 'port').map((r) => [r.a, r.b]),
    ];
    for (const [a, b] of pairs) if (country(a) !== country(b)) assert.notEqual(c[a], c[b], `${map.id} ${a} – ${b}`);
  }
  // The owner's examples: New Zealand and Australia East (50 turns), Madagascar and the mainland across from it.
  assert.notEqual(colours.map50['new-zealand'], colours.map50['australia-east']);
  for (const id of ['zambezi', 'tanzania', 'south-africa']) assert.notEqual(colours.map50.madagascar, colours.map50[id], id);
  for (const id of ['mozambique', 'tanzania', 'south-africa']) assert.notEqual(colours.map100.madagascar, colours.map100[id], id);
  // Across the date line: Alaska (USA) and Russia Far East (Russia).
  for (const m of ['map30', 'map50', 'map100']) assert.notEqual(colours[m].alaska, colours[m]['russia-far-east'], m);
});

test('the borders inside big countries are found (dashed on the map)', () => {
  for (const [map, shapes] of MAPS) {
    const geo = buildGeo(map, shapes);
    const big = map.areas.filter((a) => geo.get(a.id)!.inner.size > 0).map((a) => a.id);
    for (const id of big) assert.ok(map.areas.find((a) => a.id === id)!.bigCountry, `${map.id} ${id}`);
    assert.ok(geo.get('usa-west')!.inner.has('usa-east'), map.id);
  }
});
