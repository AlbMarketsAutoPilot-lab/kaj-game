import assert from 'node:assert/strict';
import { test } from 'node:test';
import { centres } from '../src/maps/centres.ts';
import { map30 } from '../src/maps/map30.ts';
import { map50 } from '../src/maps/map50.ts';
import { shapes30 } from '../src/maps/shapes30.ts';
import { shapes50 } from '../src/maps/shapes50.ts';
import { buildGeo } from '../src/web/maps.ts';

// The pawn spots made in advance (Google Play review, 2026-10-14) are exactly the ones the game
// would find itself, for every area on both maps; if map shapes change, run npm run map:centres.
test('stored pawn spots match the computed ones on both maps', () => {
  for (const [map, shapes] of [[map30, shapes30], [map50, shapes50]] as const) {
    const fresh = buildGeo(map, shapes);
    const stored = buildGeo(map, shapes, centres[map.id]);
    assert.deepEqual(Object.keys(centres[map.id]).sort(), map.areas.map((a) => a.id).sort(), map.id);
    for (const a of map.areas) assert.deepEqual(stored.get(a.id), fresh.get(a.id), `${map.id} ${a.id}`);
  }
});
