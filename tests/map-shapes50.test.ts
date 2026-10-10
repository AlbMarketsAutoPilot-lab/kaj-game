import assert from 'node:assert/strict';
import { test } from 'node:test';
import { map50 } from '../src/maps/map50.ts';
import { areaPolygons } from '../src/maps/shapes.ts';
import { shapes50 } from '../src/maps/shapes50.ts';

// The 50-turn map shapes (task M3), made by `node scripts/map-shapes.ts --from <file> --map 50`.

// Two drawn areas touch when they share a border line (an arc of the topology).
function drawnTouches(): Set<string> {
  const arcsOf = new Map<string, Set<number>>();
  for (const [id, g] of Object.entries(shapes50.areas)) {
    arcsOf.set(id, new Set((g.arcs as unknown[]).flat(3).map((i) => (Number(i) < 0 ? ~Number(i) : Number(i)))));
  }
  const pairs = new Set<string>();
  const ids = [...arcsOf.keys()];
  for (const a of ids) for (const b of ids) {
    if (a < b && [...arcsOf.get(a)!].some((i) => arcsOf.get(b)!.has(i))) pairs.add(`${a} – ${b}`);
  }
  return pairs;
}

test('50-turn map shapes: every area is drawn', () => {
  for (const a of map50.areas) assert.ok(areaPolygons(shapes50, a.id).length > 0, a.id);
  assert.equal(Object.keys(shapes50.areas).length, map50.areas.length);
});

test('50-turn map shapes: drawn borders match the walking links', () => {
  const data = new Set<string>();
  for (const a of map50.areas) for (const n of a.neighbours) data.add([a.id, n].sort().join(' – '));
  const drawn = drawnTouches();
  // The Channel Tunnel is a fixed link, not a land border (Madagascar has no walk since M5).
  const notDrawn = [...data].filter((p) => !drawn.has(p)).sort();
  assert.deepEqual(notDrawn, ['france – uk-ireland']);
  // Tibet (China West) touches Myanmar on the map, with no walking link (as on the 30-turn map).
  const noLink = [...drawn].filter((p) => !data.has(p));
  assert.deepEqual(noLink, ['china-west – myanmar']);
});
