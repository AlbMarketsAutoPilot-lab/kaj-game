import assert from 'node:assert/strict';
import { test } from 'node:test';
import { map30 } from '../src/maps/map30.ts';
import { areaPolygons } from '../src/maps/shapes.ts';
import { shapes30 } from '../src/maps/shapes30.ts';

// Two drawn areas touch when they share a border line (an arc of the topology).
function drawnTouches(): Set<string> {
  const arcsOf = new Map<string, Set<number>>();
  for (const [id, g] of Object.entries(shapes30.areas)) {
    arcsOf.set(id, new Set((g.arcs as unknown[]).flat(3).map((i) => (Number(i) < 0 ? ~Number(i) : Number(i)))));
  }
  const pairs = new Set<string>();
  const ids = [...arcsOf.keys()];
  for (const a of ids) for (const b of ids) {
    if (a < b && [...arcsOf.get(a)!].some((i) => arcsOf.get(b)!.has(i))) pairs.add(`${a} – ${b}`);
  }
  return pairs;
}

test('map shapes: every area is drawn', () => {
  for (const a of map30.areas) assert.ok(areaPolygons(shapes30, a.id).length > 0, a.id);
  assert.equal(Object.keys(shapes30.areas).length, map30.areas.length);
});

test('map shapes: drawn borders match the walking links', () => {
  const data = new Set<string>();
  for (const a of map30.areas) for (const n of a.neighbours) data.add([a.id, n].sort().join(' – '));
  const drawn = drawnTouches();
  // The Channel Tunnel is a fixed link, not a land border.
  const notDrawn = [...data].filter((p) => !drawn.has(p));
  assert.deepEqual(notDrawn, ['france – uk-ireland']);
  // Tibet (China West) touches Myanmar (Mainland Southeast Asia) on the map, with no walking link.
  const noLink = [...drawn].filter((p) => !data.has(p));
  assert.deepEqual(noLink, ['china-west – southeast-asia']);
});
