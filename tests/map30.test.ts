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

// Task 14b (owner-approved): Alaska joins the rest of the USA through Canada or by its ferry
// to USA West, so a ship between two parts of the same country links them too.
test('big countries are never wonders, have 2+ parts and the parts are linked (walking or their own ship)', () => {
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

test('30-turn map: 8 airports, 9 ports, 3 stations, 1 bus stop, 17 connections, at most 3 destinations each', () => {
  const routes = map30.routes ?? [];
  const at = (kind: string) => new Set(routes.filter((r) => r.kind === kind).flatMap((r) => [r.a, r.b])).size;
  assert.equal(routes.length, 17);
  assert.equal(at('airport'), 8);
  assert.equal(at('port'), 9);
  assert.equal(at('station'), 3);
  assert.deepEqual(routes.filter((r) => r.kind === 'bus').map((r) => `${r.a} ${r.b} ${r.oneWay}`), ['mongolia russia-east true', 'mongolia china-west true']);
  for (const a of areas) {
    for (const kind of ['airport', 'port', 'station', 'bus']) {
      const n = routes.filter((r) => r.kind === kind && (r.a === a.id || r.b === a.id)).length;
      assert.ok(n <= 3, `${a.id} ${kind}: ${n} destinations`);
    }
  }
  // UK & Ireland and Japan have both an airport and a port (task 9b), New Zealand too (task 14b).
  const both = (id: string) => ['airport', 'port'].every((k) => routes.some((r) => r.kind === k && (r.a === id || r.b === id)));
  assert.deepEqual(map30.areas.filter((a) => both(a.id)).map((a) => a.id), ['uk-ireland', 'japan', 'new-zealand']);
});

test('30-turn map: every area reachable and no single visa area traps anyone', () => {
  assert.deepEqual(stuckProblems(map30), []);
});

// The 2 connections added in task 9b and the Australia East – New Zealand ship (task 14b) are
// extra by design. The original 9-connection map is still checked, with Alaska's ferry (task 14b),
// which Alaska needs: there, each of the 9 is needed (owner-approved).
const EXTRA_ROUTES = ['uk-ireland arabia', 'japan usa-west', 'australia-east new-zealand'];
const ALASKA_FERRY = 'usa-west alaska';

test('original 9-connection map: every connection is needed', () => {
  // The train and the bus (tasks 17, 18) are not counted: the stuck-state checker leaves them out.
  const kept = (map30.routes ?? []).filter((r) => r.kind !== 'station' && r.kind !== 'bus' && !EXTRA_ROUTES.includes(`${r.a} ${r.b}`));
  const original = kept.filter((r) => `${r.a} ${r.b}` !== ALASKA_FERRY);
  assert.equal(original.length, 9);
  assert.deepEqual(stuckProblems({ ...map30, routes: kept }), []);
  for (const r of original) {
    const without = { ...map30, routes: kept.filter((x) => x !== r) };
    assert.ok(stuckProblems(without).length > 0, `${r.a} – ${r.b} is not needed`);
  }
});

test('30-turn map: two visa areas at once trap someone in at most 44 of 946 pairs', () => {
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
  assert.ok(traps <= 44, `${traps} trapping pairs`);
});
