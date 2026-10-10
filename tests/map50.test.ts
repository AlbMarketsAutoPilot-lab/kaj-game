import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cardEvery, GAME_LENGTHS, nomadWarningRound, PROFILES, START_CONTINENTS } from '../src/engine/constants.ts';
import { apply, createGame, currentPlayer, destinations, eligibleCards, legalActions, mapBusinesses } from '../src/engine/engine.ts';
import { validateMap, walkingGroups } from '../src/engine/map.ts';
import { robotAction, robotRound } from '../src/engine/normal-robot.ts';
import { randomRobotAction } from '../src/engine/robot.ts';
import { loadGame, saveGame } from '../src/engine/save.ts';
import { stuckProblems, travelGroups } from '../src/engine/stuck-check.ts';
import type { GameState, RobotLevel } from '../src/engine/types.ts';
import { mapById, mapFor } from '../src/maps/index.ts';
import { map30 } from '../src/maps/map30.ts';
import { INSIDE_30, map50 } from '../src/maps/map50.ts';
import { seatOf, seats, startedGame } from './helpers.ts';

// The 50-turn map (task M2, owner-approved list in docs/map50.md and walking links in M2).

const areas = map50.areas;
const routes = map50.routes ?? [];
const sites = (kind: string) => new Set(routes.filter((r) => r.kind === kind).flatMap((r) => [r.a, r.b]));

test('map choice: 30 turns by default, or 50', () => {
  assert.deepEqual([...GAME_LENGTHS], [30, 50]);
  assert.equal(mapFor(), map30);
  assert.equal(mapFor(30), map30);
  assert.equal(mapFor(50), map50);
  assert.equal(mapById('map30'), map30);
  assert.equal(mapById('map50'), map50);
  assert.equal(createGame({ seats: seats(2), seed: 1 }, map30).totalRounds, 30);
  assert.equal(createGame({ seats: seats(2), seed: 1 }, map50).totalRounds, 50);
});

test('50-turn map: valid, two-way links, no duplicates, nothing unreachable, nobody stuck', () => {
  assert.deepEqual(validateMap(map50), []);
  for (const a of areas) assert.equal(new Set(a.neighbours).size, a.neighbours.length, a.id);
  assert.equal(travelGroups(map50).length, 1);
  assert.deepEqual(stuckProblems(map50), []);
});

test('50-turn map: 84 areas, 11 wonders, 13 airports, 15 ports, 23 connections, 150 walking links', () => {
  assert.equal(areas.length, 84);
  assert.deepEqual(areas.filter((a) => a.wonder).map((a) => a.id).sort(), [
    'cambodia-laos-vietnam', 'egypt', 'greece', 'india', 'italy', 'japan', 'jordan', 'mexico', 'new-zealand', 'peru', 'tanzania',
  ]);
  assert.equal(sites('airport').size, 13);
  assert.equal(sites('port').size, 15);
  assert.equal(routes.filter((r) => r.kind === 'airport' || r.kind === 'port').length, 23);
  assert.equal(areas.reduce((n, a) => n + a.neighbours.length, 0) / 2, 150);
  for (const c of START_CONTINENTS) assert.ok(areas.some((a) => a.continent === c), c);
});

test('owner fixes: the ship to UK & Ireland leaves from Portugal (M2); Madagascar by ship only, to 3 places (M5); no Spain ↔ Morocco', () => {
  assert.ok(routes.some((r) => r.kind === 'port' && r.a === 'portugal' && r.b === 'uk-ireland'));
  assert.ok(!sites('port').has('spain'));
  assert.deepEqual(areas.find((a) => a.id === 'madagascar')!.neighbours, []);
  assert.deepEqual(destinations(map50, 'madagascar', 'port', 'nomad').sort(), ['south-africa', 'tanzania', 'zambezi']);
  assert.equal(areas.find((a) => a.id === 'tanzania')!.name, 'Tanzania');
  assert.ok(!areas.find((a) => a.id === 'spain')!.neighbours.includes('morocco'));
});

test('every 50-turn area lies inside one 30-turn area, and every country of that area is used once', () => {
  for (const a30 of map30.areas) {
    const parts = areas.filter((a) => INSIDE_30[a.id] === a30.id);
    assert.ok(parts.length > 0, a30.id);
    for (const p of parts) assert.equal(p.continent, a30.continent, p.id);
    assert.deepEqual(parts.flatMap((p) => p.countries ?? []).sort(), [...(a30.countries ?? [])].sort(), a30.id);
  }
});

test('the same big countries in the same parts; never wonders; parts linked', () => {
  const parts = (m: typeof map50, c: string) => m.areas.filter((a) => a.bigCountry === c).map((a) => a.id).sort();
  const names = [...new Set(areas.flatMap((a) => (a.bigCountry ? [a.bigCountry] : [])))].sort();
  assert.deepEqual(names, ['Australia', 'Brazil', 'Canada', 'China', 'Russia', 'United States']);
  for (const c of names) {
    assert.deepEqual(parts(map50, c), parts(map30, c), c);
    // Alaska joins the rest of the USA through Canada or by its ferry to USA West (as on the 30-turn map).
    const own = parts(map50, c);
    const ships = routes.filter((r) => r.kind === 'port' && own.includes(r.a) && own.includes(r.b));
    const linked = (id: string) => ships.flatMap((r) => (r.a === id ? [r.b] : r.b === id ? [r.a] : []));
    const inner = { id: c, areas: areas.filter((a) => a.bigCountry === c).map((a) => ({ ...a, neighbours: [...a.neighbours.filter((n) => own.includes(n)), ...linked(a.id)] })) };
    assert.equal(walkingGroups(inner).length, 1, c);
  }
  assert.ok(!areas.some((a) => a.bigCountry && a.wonder));
});

test('businesses: 11 guided tours, 13 airlines, 15 ferries, 3 train booths, 1 bus booth', () => {
  const count = (kind: string) => mapBusinesses(map50).filter((b) => b.kind === kind).length;
  assert.deepEqual(['tours', 'airline', 'ferry', 'train', 'bus'].map(count), [11, 13, 15, 3, 1]);
});

test('train: France ↔ Russia West or Turkey (not the Caucasus); Luxury can\'t take it', () => {
  assert.deepEqual(destinations(map50, 'france', 'station', 'nomad').sort(), ['russia-west', 'turkey']);
  assert.deepEqual(destinations(map50, 'turkey', 'station', 'business'), ['france']);
  assert.deepEqual(destinations(map50, 'russia-west', 'station', 'backpacker'), ['france']);
  assert.deepEqual(destinations(map50, 'caucasus', 'station', 'nomad'), []);
  assert.deepEqual(destinations(map50, 'france', 'station', 'luxury'), []);
});

test('bus: Mongolia one way to Siberia or China West; Russia\'s +5 at once by bus (M5)', () => {
  assert.deepEqual(destinations(map50, 'mongolia', 'bus', 'nomad').sort(), ['china-west', 'russia-east']);
  assert.deepEqual(destinations(map50, 'russia-east', 'bus', 'nomad'), []);
  let s = startedGame(['egypt', 'spain'], 1, map50, ['nomad', ...PROFILES]);
  seatOf(s, 0).area = 'mongolia';
  seatOf(s, 0).points = 10;
  s = apply(s, map50, { type: 'board', kind: 'bus', to: 'russia-east' });
  s = apply(s, map50, legalActions(s, map50).find((a) => a.type === 'walk')!);
  s = apply(s, map50, { type: 'travel' });
  const me = seatOf(s, 0);
  assert.equal(me.area, 'russia-east');
  assert.deepEqual(me.bigCountries, ['Russia']);
  assert.ok(!me.visitedAreas.includes('russia-west') && !me.visitedAreas.includes('russia-far-east'));
});

test('timing (owner, M2): a card every 5 land turns, robots and the Nomad warning scaled to 50 turns', () => {
  assert.equal(cardEvery(30), 3);
  assert.equal(cardEvery(50), 5);
  assert.deepEqual([robotRound(10, 30), robotRound(18, 30)], [10, 18]);
  assert.deepEqual([robotRound(10, 50), robotRound(18, 50)], [17, 30]);
  assert.deepEqual([nomadWarningRound(30), nomadWarningRound(50)], [25, 45]);
});

// Plays a whole game with random robots; checks every card is drawn on a 5th land turn, never in
// the last round. Returns the end state and the number of cards drawn.
function randomGame(seed: number, n: number): [GameState, number] {
  let s = createGame({ seats: seats(n, n - 1), seed }, map50);
  let robotSeed = seed + 1;
  let cards = 0;
  for (let steps = 0; s.phase !== 'finished'; steps++) {
    assert.ok(steps < 8000, `seed ${seed}: never ends`);
    const [action, next] = randomRobotAction(s, map50, robotSeed);
    robotSeed = next;
    s = apply(s, map50, action);
    // s.drawn: the cards drawn by this move, each as the player's land turn is counted.
    for (const c of s.drawn) {
      assert.equal(s.players[c.seat].landTurns % 5, 0, `seed ${seed}`);
      assert.ok(c.round < 50, `seed ${seed}`);
      cards++;
    }
  }
  return [s, cards];
}

test('random robots finish 50-round games; cards come every 5th land turn, never in the last round', () => {
  for (let seed = 1; seed <= 12; seed++) {
    const [s, cards] = randomGame(seed, 2 + (seed % 3));
    assert.equal(s.round, 50);
    assert.ok(s.result);
    assert.ok(cards > 0);
  }
});

test('robots of every level finish 50-round games', () => {
  const levels: RobotLevel[] = ['easy', 'normal', 'hard'];
  for (let seed = 1; seed <= 6; seed++) {
    let s = createGame({ seats: levels.map((level, i) => ({ kind: i === 0 ? 'human' as const : 'robot' as const, colour: `c${i}`, level })), seed }, map50);
    let robotSeed = seed;
    for (let steps = 0; s.phase !== 'finished'; steps++) {
      assert.ok(steps < 8000);
      const seat = s.offer ? s.offer.to : currentPlayer(s).seat;
      let action;
      [action, robotSeed] = robotAction(s, map50, robotSeed, levels[seat]);
      s = apply(s, map50, action);
    }
    assert.equal(s.round, 50);
  }
});

test('"Thin mountain air" (Peru & Bolivia on the 30-turn map) comes in Peru only (owner)', () => {
  const peru = areas.find((a) => a.id === 'peru')!;
  assert.equal(peru.cardsFrom, 'peru-bolivia');
  assert.ok(eligibleCards(['country'], peru.cardsFrom!).some((c) => c.id === 'a6'));
  assert.ok(!eligibleCards(['country'], 'bolivia').some((c) => c.id === 'a6'));
  // In a game: the second player's 5th land turn starts in Peru (or Bolivia), many seeds.
  const seen = { peru: 0, bolivia: 0 };
  for (const where of ['peru', 'bolivia'] as const) {
    for (let seed = 1; seed <= 300; seed++) {
      let s = startedGame(['egypt', 'spain'], seed, map50, PROFILES.slice(1), true);
      seatOf(s, 1).area = where;
      seatOf(s, 1).landTurns = 4;
      s = apply(s, map50, legalActions(s, map50).find((a) => a.type === 'walk')!);
      if (s.card?.seat === seatOf(s, 1).seat && s.card.card.id === 'a6') seen[where]++;
    }
  }
  assert.ok(seen.peru > 0);
  assert.equal(seen.bolivia, 0);
});

test('saves version 12 (owner, M5): games resume; older saves (10, 11) are not continued', () => {
  const [s50] = randomGame(3, 2);
  assert.deepEqual(loadGame(saveGame(s50)), { state: s50 });
  const s30 = createGame({ seats: seats(2), seed: 1 }, map30);
  assert.deepEqual(loadGame(saveGame(s30)), { state: s30 });
  for (const version of [10, 11]) assert.ok('error' in loadGame(JSON.stringify({ version, state: s30 })));
});
