import assert from 'node:assert/strict';
import { test } from 'node:test';
import { START_CONTINENTS } from '../src/engine/constants.ts';
import { createGame } from '../src/engine/engine.ts';
import { validateMap, walkingGroups } from '../src/engine/map.ts';
import { map30 } from '../src/maps/map30.ts';
import { seats } from './helpers.ts';

const areas = map30.areas;

test('30-turn map: valid, two-way links, no duplicate links', () => {
  assert.deepEqual(validateMap(map30), []);
  for (const a of areas) assert.equal(new Set(a.neighbours).size, a.neighbours.length, a.id);
});

test('30-turn map: 45–50 areas and 6–7 wonders', () => {
  assert.ok(areas.length >= 45 && areas.length <= 50, `${areas.length} areas`);
  const wonders = areas.filter((a) => a.wonder).length;
  assert.ok(wonders >= 6 && wonders <= 7, `${wonders} wonders`);
});

test('every starting continent has areas; Antarctica is not on the map', () => {
  for (const c of START_CONTINENTS) assert.ok(areas.some((a) => a.continent === c), c);
  assert.ok(!areas.some((a) => a.continent === 'Antarctica'));
});

test('big countries are never wonders, have 2+ parts and the parts are walking-linked', () => {
  const big = new Map<string, string[]>();
  for (const a of areas.filter((x) => x.bigCountry)) {
    assert.ok(!a.wonder, `${a.id} is a big country and a wonder`);
    big.set(a.bigCountry!, [...(big.get(a.bigCountry!) ?? []), a.id]);
  }
  assert.deepEqual([...big.keys()].sort(), ['Australia', 'Brazil', 'Canada', 'China', 'Russia', 'United States']);
  for (const [country, parts] of big) {
    assert.ok(parts.length >= 2, country);
    const inner = { id: country, areas: areas.filter((a) => parts.includes(a.id)).map((a) => ({ ...a, neighbours: a.neighbours.filter((n) => parts.includes(n)) })) };
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

test('walking groups: airports and ports (task 2b) must join these 6 groups', () => {
  const groups = walkingGroups(map30).map((g) => g.sort());
  const small = groups.filter((g) => g.length < 10).map((g) => g.join(',')).sort();
  assert.equal(groups.length, 6);
  assert.deepEqual(small, ['australia-east,australia-west', 'iceland', 'japan', 'new-zealand']);
  const americas = groups.find((g) => g.includes('usa-east'))!;
  assert.equal(americas.length, 12);
});

test('a game can start on the 30-turn map with 4 seats', () => {
  assert.doesNotThrow(() => createGame({ seats: seats(4), seed: 3 }, map30));
});
