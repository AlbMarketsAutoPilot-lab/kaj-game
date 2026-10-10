import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { GameMap } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { map50 } from '../src/maps/map50.ts';
import type { Shapes } from '../src/maps/shapes.ts';
import { shapes30 } from '../src/maps/shapes30.ts';
import { shapes50 } from '../src/maps/shapes50.ts';
import { areaAt, buildGeo, pad, propSpots, squeeze, type PropKind } from '../src/web/maps.ts';

// Owner (M5): a drawn port, airport, station, bus stop or wonder never sits over another area
// (e.g. Portugal's port over Spain, the UK's over Benelux). Checked at the area view's usual
// zoom, with the prop size it uses there (about a tenth of the view).
function overOthers(map: GameMap, shapes: Shapes): string[] {
  const geo = buildGeo(map, shapes);
  const bad: string[] = [];
  for (const a of map.areas) {
    const has = (kind: string) => (map.routes ?? []).some((r) => r.kind === kind && (r.a === a.id || (r.b === a.id && !r.oneWay)));
    const kinds: PropKind[] = [...(a.wonder ? ['wonder' as const] : []), ...(['airport', 'port', 'station', 'bus'] as const).filter(has)];
    if (kinds.length === 0) continue;
    const base = pad(geo.get(a.id)!.core, 0.25, 2.5);
    const k = squeeze(base);
    const P = 0.1 * Math.max(base.w * k, base.h);
    for (const [kind, [x, y]] of propSpots(geo, a.id, kinds, P, k)) {
      const h = P * 0.42;
      const at = [[x, y], [x - h, y - h], [x + h, y - h], [x - h, y + h], [x + h, y + h]].map(([sx, sy]) => areaAt(geo, sx / k, sy));
      const over = at.filter((id) => id !== null && id !== a.id);
      if (over.length) bad.push(`${a.id} ${kind} over ${[...new Set(over)].join(', ')}`);
    }
  }
  return bad;
}

test('30-turn map: no drawn prop sits over another area', () => {
  assert.deepEqual(overOthers(map30, shapes30), []);
});

test('50-turn map: no drawn prop sits over another area (Portugal\'s port, the UK\'s port)', () => {
  assert.deepEqual(overOthers(map50, shapes50), []);
});
