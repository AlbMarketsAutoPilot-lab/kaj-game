import assert from 'node:assert/strict';
import { test } from 'node:test';
import { START_CONTINENTS } from '../src/engine/constants.ts';
import { createGame } from '../src/engine/engine.ts';
import { validateMap, walkingGroups } from '../src/engine/map.ts';
import { stuckProblems, travelGroups, visaUnits } from '../src/engine/stuck-check.ts';
import { map30 } from '../src/maps/map30.ts';
import { seats } from './helpers.ts';

const areas = map30.areas;

test('30-turn map: valid, two-way links, no duplicate links', () => {
  assert.deepEqual(validateMap(map30), []);
  for (const a of areas) assert.equal(new Set(a.neighbours).size, a.neighbours.length, a.id);
});

test('30-turn map: 53 areas (task 14a: Canada and Russia in 3 parts; 14b: Alaska) and 6–7 wonders', () => {
  assert.equal(areas.length, 53);
  const wonders = areas.filter((a) => a.wonder).length;
  assert.ok(wonders >= 6 && wonders <= 7, `${wonders} wonders`);
});

test('every starting continent has areas; Antarctica is not on the map', () => {
  for (const c of START_CONTINENTS) assert.ok(areas.some((a) => a.continent === c), c);
  assert.ok(!areas.some((a) => a.continent === 'Antarctica'));
});

// Task 14b (owner-approved): Alaska joins the rest of the USA through Canada or by its own route
// to USA West (a ferry until step 2.4, a plane since), so a route between two parts of one country links them too.
test('big countries are never wonders, have 2+ parts and the parts are linked (walking or their own plane or ship)', () => {
  const big = new Map<string, string[]>();
  for (const a of areas.filter((x) => x.bigCountry)) {
    assert.ok(!a.wonder, `${a.id} is a big country and a wonder`);
    big.set(a.bigCountry!, [...(big.get(a.bigCountry!) ?? []), a.id]);
  }
  assert.deepEqual([...big.keys()].sort(), ['Australia', 'Brazil', 'Canada', 'China', 'Russia', 'United States']);
  for (const [country, parts] of big) {
    assert.ok(parts.length >= 2, country);
    const ships = (map30.routes ?? []).filter((r) => parts.includes(r.a) && parts.includes(r.b));
    const linked = (id: string) => ships.flatMap((r) => (r.a === id ? [r.b] : r.b === id ? [r.a] : []));
    const inner = { id: country, areas: areas.filter((a) => parts.includes(a.id)).map((a) => ({ ...a, neighbours: [...a.neighbours.filter((n) => parts.includes(n)), ...linked(a.id)] })) };
    assert.equal(walkingGroups(inner).length, 1, `${country} parts are not linked`);
  }
});

test('each country is in one area only (big countries excepted)', () => {
  const seen = new Map<string, string>();
  for (const a of areas.filter((x) => !x.bigCountry)) {
    for (const c of a.countries ?? []) {
      assert.ok(!seen.has(c), `${c} in ${seen.get(c)} and ${a.id}`);
      seen.set(c, a.id);
    }
  }
});

test('Taiwan and Cyprus are never on the map', () => {
  const all = areas.flatMap((a) => a.countries ?? []);
  assert.ok(!all.includes('Taiwan') && !all.includes('Cyprus'));
});

const BOTH_30 = ['iberia', 'iceland', 'japan', 'alaska', 'new-zealand'];

test('walking groups: airports and ports join these 6 groups', () => {
  const groups = walkingGroups(map30).map((g) => g.sort());
  const small = groups.filter((g) => g.length < 10).map((g) => g.join(',')).sort();
  assert.equal(groups.length, 6);
  assert.deepEqual(small, ['australia-east,australia-west', 'iceland', 'japan', 'new-zealand']);
  const americas = groups.find((g) => g.includes('usa-east'))!;
  assert.equal(americas.length, 14); // with Alaska (task 14b)
});

test('a game can start on the 30-turn map with 4 seats', () => {
  assert.doesNotThrow(() => createGame({ seats: seats(4), seed: 3 }, map30));
});

test('30-turn map: 13 airports, 11 ports, 3 stations, 1 bus stop, 1 car rental, 21 connections, at most 2 destinations each', () => {
  const routes = map30.routes ?? [];
  const at = (kind: string) => new Set(routes.filter((r) => r.kind === kind).flatMap((r) => [r.a, r.b])).size;
  assert.equal(routes.length, 21);
  assert.equal(at('airport'), 13);
  assert.equal(at('port'), 11);
  assert.equal(at('station'), 3);
  assert.deepEqual(routes.filter((r) => r.kind === 'bus').map((r) => `${r.a} ${r.b} ${r.oneWay}`), ['mongolia russia-east true', 'mongolia china-west true']);
  assert.deepEqual(routes.filter((r) => r.kind === 'car').map((r) => `${r.a} ${r.b} ${r.oneWay}`), ['mexico usa-west true', 'mexico usa-east true']);
  for (const a of areas) {
    for (const kind of ['airport', 'port', 'station', 'bus', 'car']) {
      const n = routes.filter((r) => r.kind === kind && (r.a === a.id || r.b === a.id)).length;
      assert.ok(n <= 2, `${a.id} ${kind}: ${n} destinations`);
    }
  }
  // Step 2.4: every plane and ship route two-way, exactly the owner's list.
  assert.ok(routes.filter((r) => r.kind === 'airport' || r.kind === 'port').every((r) => !r.oneWay));
  const both = (id: string) => ['airport', 'port'].every((k) => routes.some((r) => r.kind === k && (r.a === id || r.b === id)));
  assert.deepEqual(map30.areas.filter((a) => both(a.id)).map((a) => a.id), BOTH_30);
});

test('30-turn map: every area reachable and no single visa area traps anyone', () => {
  assert.deepEqual(stuckProblems(map30), []);
});

// Step 2.4 (owner-approved): the stuck-state checker needs exactly these 5 plane and ship routes;
// the others are extra. The train, the bus and the car are left out, as in the checker.
test('30-turn map: the stuck-state checker needs exactly 5 routes', () => {
  const kept = (map30.routes ?? []).filter((r) => r.kind === 'airport' || r.kind === 'port');
  const needed = kept.filter((r) => stuckProblems({ ...map30, routes: kept.filter((x) => x !== r) }).length > 0).map((r) => `${r.a} ${r.b}`);
  assert.deepEqual(needed.sort(), ['australia-east new-zealand', 'canada-east iceland', 'iceland uk-ireland', 'india arabia', 'new-zealand chile']);
});

// Step 2.4: 13 pairs (was 19 with the old routes; 44 in task 2b). Mostly Iceland, UK & Ireland and Canada.
test('30-turn map: two visa areas at once trap someone in at most 13 of 946 pairs', () => {
  const units = visaUnits(map30);
  let pairs = 0;
  let traps = 0;
  for (let i = 0; i < units.length; i++) {
    for (let j = i + 1; j < units.length; j++) {
      pairs++;
      if (travelGroups(map30, new Set([...units[i], ...units[j]])).length > 1) traps++;
    }
  }
  assert.equal(pairs, 946);
  assert.ok(traps <= 13, `${traps} trapping pairs`);
});
