import assert from 'node:assert/strict';
import { test } from 'node:test';
import { map100 } from '../src/maps/map100.ts';
import { areaPolygons } from '../src/maps/shapes.ts';
import { shapes100 } from '../src/maps/shapes100.ts';

// The 100-turn map shapes (step 2.12, part J3), made by `node scripts/map-shapes.ts --from <file> --map 100`.

// Two drawn areas touch when they share a border line (an arc of the topology).
function drawnTouches(): Set<string> {
  const arcsOf = new Map<string, Set<number>>();
  for (const [id, g] of Object.entries(shapes100.areas)) {
    arcsOf.set(id, new Set((g.arcs as unknown[]).flat(3).map((i) => (Number(i) < 0 ? ~Number(i) : Number(i)))));
  }
  const pairs = new Set<string>();
  const ids = [...arcsOf.keys()];
  for (const a of ids) for (const b of ids) {
    if (a < b && [...arcsOf.get(a)!].some((i) => arcsOf.get(b)!.has(i))) pairs.add(`${a} – ${b}`);
  }
  return pairs;
}

test('100-turn map shapes: every area is drawn', () => {
  for (const a of map100.areas) assert.ok(areaPolygons(shapes100, a.id).length > 0, a.id);
  assert.equal(Object.keys(shapes100.areas).length, map100.areas.length);
});

test('100-turn map shapes: drawn borders match the walking links', () => {
  const data = new Set<string>();
  for (const a of map100.areas) for (const n of a.neighbours) data.add([a.id, n].sort().join(' – '));
  const drawn = drawnTouches();
  // Walking links that are not plain land borders (docs/map100.md): the Channel Tunnel and the Øresund Bridge.
  const notDrawn = [...data].filter((p) => !drawn.has(p)).sort();
  assert.deepEqual(notDrawn, ['denmark – sweden', 'france – uk']);
  // Tibet (China West) touches Myanmar on the map, with no walking link (as on the 30- and 50-turn maps).
  const noLink = [...drawn].filter((p) => !data.has(p));
  assert.deepEqual(noLink, ['china-west – myanmar']);
});

test('100-turn map shapes: the islands with no walk touch no other area', () => {
  const islands = ['iceland', 'sri-lanka', 'japan', 'philippines', 'madagascar', 'caribbean', 'new-zealand'];
  const drawn = [...drawnTouches()];
  for (const id of islands) {
    assert.deepEqual(map100.areas.find((a) => a.id === id)!.neighbours, [], id);
    assert.deepEqual(drawn.filter((p) => p.split(' – ').includes(id)), [], id);
  }
});
