import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cardEvery, cardMix, GAME_LENGTHS, SETUP_LENGTHS, START_CONTINENTS } from '../src/engine/constants.ts';
import { apply, createGame, mapBusinesses } from '../src/engine/engine.ts';
import { validateMap } from '../src/engine/map.ts';
import { randomRobotAction } from '../src/engine/robot.ts';
import { loadGame, saveGame } from '../src/engine/save.ts';
import { stuckProblems, travelGroups, visaUnits } from '../src/engine/stuck-check.ts';
import type { GameState } from '../src/engine/types.ts';
import { mapById, mapFor } from '../src/maps/index.ts';
import { map50 } from '../src/maps/map50.ts';
import { map100 } from '../src/maps/map100.ts';
import { factId } from '../src/engine/quiz.ts';
import { FACTS_100_NEW } from '../src/facts/new100.ts';
import { EXAM_SORT_100, SORT_100 } from '../src/facts/sort100.ts';
import { FACT_TYPES } from '../src/facts/tags.ts';
import { readFileSync } from 'node:fs';
import { seats, startTriples } from './helpers.ts';

// Each area's 50-turn area(s) (`inside`, not kept in the built map): read from the made file.
const SORT_INSIDE = new Map([...readFileSync(new URL('../src/maps/map100.ts', import.meta.url), 'utf8')
  .matchAll(/id: "([^"]+)".*?inside: (\[[^\]]*\])/g)].map((m) => [m[1], JSON.parse(m[2]) as string[]]));

// The 100-turn map (step 2.12, part J2): made by scripts/map100-review.ts from the owner-approved plan (docs/map100.md).

const areas = map100.areas;
const routes = map100.routes ?? [];
const sites = (kind: string) => new Set(routes.filter((r) => r.kind === kind).flatMap((r) => [r.a, r.b]));

test('game length 100 on the 100-turn map; hidden in the setup screen until part J5', () => {
  assert.deepEqual([...GAME_LENGTHS], [30, 50, 100]);
  assert.deepEqual([...SETUP_LENGTHS], [30, 50]);
  assert.equal(mapFor(100), map100);
  assert.equal(mapById('map100'), map100);
  assert.equal(createGame({ seats: seats(2), seed: 1 }, map100).totalRounds, 100);
  assert.equal(cardEvery(100), 5);
});

test('100-turn map: valid, two-way links, no duplicates, nothing unreachable, nobody stuck', () => {
  assert.deepEqual(validateMap(map100), []);
  for (const a of areas) assert.equal(new Set(a.neighbours).size, a.neighbours.length, a.id);
  assert.equal(travelGroups(map100).length, 1);
  assert.deepEqual(stuckProblems(map100), []);
});

test('100-turn map: 126 areas, 11 wonders, 17 airports, 23 ports, 25 connections, 238 walking links, as in the plan', () => {
  assert.equal(areas.length, 126);
  const count = (c: string) => areas.filter((a) => a.continent === c).length;
  assert.deepEqual(['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'].map(count), [32, 35, 33, 12, 11, 3]);
  assert.deepEqual(areas.filter((a) => a.wonder).map((a) => a.id).sort(), [
    'cambodia', 'egypt', 'greece', 'india', 'italy', 'japan', 'jordan', 'mexico', 'new-zealand', 'peru', 'tanzania',
  ]);
  assert.equal(sites('airport').size, 17);
  assert.equal(sites('port').size, 23);
  assert.equal(routes.filter((r) => r.kind === 'airport' || r.kind === 'port').length, 25);
  for (const a of areas) for (const kind of ['airport', 'port']) {
    assert.ok(routes.filter((r) => r.kind === kind && (r.a === a.id || r.b === a.id)).length <= 2, `${a.id} ${kind}`);
  }
  assert.ok(routes.filter((r) => r.kind === 'airport' || r.kind === 'port').every((r) => !r.oneWay));
  assert.equal(areas.reduce((n, a) => n + a.neighbours.length, 0) / 2, 238);
  assert.equal(new Set(areas.flatMap((a) => (a.bigCountry ? [a.bigCountry] : a.countries ?? []))).size, 178);
  for (const c of START_CONTINENTS) assert.ok(areas.some((a) => a.continent === c), c);
  // Train, bus and car as on the 50-turn map.
  const other = (m: typeof map50) => (m.routes ?? []).filter((r) => r.kind === 'station' || r.kind === 'bus' || r.kind === 'car');
  assert.deepEqual(other(map100), other(map50));
  assert.equal(areas.find((a) => a.id === 'madagascar')!.surprise, 3);
  assert.deepEqual(areas.filter((a) => !a.neighbours.length).map((a) => a.id).sort(),
    ['caribbean', 'iceland', 'japan', 'madagascar', 'new-zealand', 'philippines', 'sri-lanka']);
});

test('100-turn map: big countries in the same parts as on the 50-turn map; never wonders', () => {
  const parts = (m: typeof map50, c: string) => m.areas.filter((a) => a.bigCountry === c).map((a) => a.id).sort();
  for (const c of ['Australia', 'Brazil', 'Canada', 'China', 'Russia', 'United States']) assert.deepEqual(parts(map100, c), parts(map50, c), c);
  assert.ok(!areas.some((a) => a.bigCountry && a.wonder));
});

test('100-turn map: two citizenships at once trap someone in 41 of 6,786 pairs (docs/map100.md)', () => {
  const units = visaUnits(map100);
  let pairs = 0;
  let traps = 0;
  for (let i = 0; i < units.length; i++) {
    for (let j = i + 1; j < units.length; j++) {
      pairs++;
      if (travelGroups(map100, new Set([...units[i], ...units[j]])).length > 1) traps++;
    }
  }
  assert.equal(pairs, 6786);
  assert.equal(traps, 41);
});

test('100-turn map: 3 start citizenships cut some area off in 1,084 of 109,567 start sets (docs/map100.md)', () => {
  assert.deepEqual(startTriples(map100), { sets: 109567, traps: 1084 });
});

// Step 2.12 part J4: the facts of the 100-turn map.

test('J4: the sort lists every fact of each split 50-turn area, to areas that lie inside it', () => {
  const inside = (id: string, p: string) => SORT_INSIDE.get(id)?.includes(p);
  for (const [sort, from] of [[SORT_100, map50.facts!], [EXAM_SORT_100, map50.examFacts!]] as const) {
    for (const [p, list] of Object.entries(sort)) {
      assert.equal(list.length, from[p].length, p);
      for (const to of list.flatMap((s) => s.split('+'))) if (to !== '-') assert.ok(inside(to, p), `${p} → ${to}`);
    }
  }
});

test('J4: every area has exactly 12 facts and 2 test facts, no fact twice in an area, every fact typed', () => {
  for (const a of areas) {
    const facts = map100.facts?.[a.id] ?? [];
    const exam = map100.examFacts?.[a.id] ?? [];
    for (const f of [...facts, ...exam]) assert.ok(FACT_TYPES[factId(f)], `no type: ${a.id} ${f.question}`);
    for (const f of exam) assert.equal(FACT_TYPES[factId(f)], 'geography', `${a.id} ${f.question}`);
    assert.equal(facts.length, 12, a.id);
    assert.equal(exam.length, 2, a.id);
    const ids = [...facts, ...exam].map(factId);
    assert.equal(new Set(ids).size, ids.length, a.id);
  }
  // The same place as on the 50-turn map: the same facts. A split area: its sorted facts first, then its new ones.
  assert.deepEqual(map100.facts!.france, map50.facts!.france);
  assert.deepEqual(map100.examFacts!.france, map50.examFacts!.france);
  assert.deepEqual(map100.facts!.uk, [...map50.facts!['uk-ireland'].filter((_, i) => SORT_100['uk-ireland'][i] === 'uk'), ...FACTS_100_NEW.uk]);
});

test('businesses: 11 guided tours, 17 airlines, 23 ferries, 3 train booths, 1 bus booth, 1 car rental', () => {
  const count = (kind: string) => mapBusinesses(map100).filter((b) => b.kind === kind).length;
  assert.deepEqual(['tours', 'airline', 'ferry', 'train', 'bus', 'car'].map(count), [11, 17, 23, 3, 1, 1]);
});

test('random robots finish 100-round games; cards every 5th land turn with the 100-turn mix, never in the last round; save and load', () => {
  for (let seed = 1; seed <= 4; seed++) {
    let s: GameState = createGame({ seats: seats(2 + (seed % 3), 1 + (seed % 3)), seed }, map100);
    let robotSeed = seed + 1;
    let cards = 0;
    for (let steps = 0; s.phase !== 'finished'; steps++) {
      assert.ok(steps < 20000, `seed ${seed}: never ends`);
      const [action, next] = randomRobotAction(s, map100, robotSeed);
      robotSeed = next;
      s = apply(s, map100, action);
      for (const c of s.drawn) {
        assert.equal(s.players[c.seat].landTurns % 5, 0, `seed ${seed}`);
        assert.ok(c.round < 100, `seed ${seed}`);
        cards++;
      }
      if (steps === 500) {
        const back = loadGame(saveGame(s));
        assert.ok('state' in back && back.state.mapId === 'map100');
      }
    }
    assert.equal(s.round, 100);
    assert.ok(s.result);
    assert.ok(cards > 0);
  }
  assert.notDeepEqual(cardMix('nomad', 2, 100), cardMix('nomad', 2, 50));
});
