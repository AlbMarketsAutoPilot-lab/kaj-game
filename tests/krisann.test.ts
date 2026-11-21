import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CARDS } from '../src/cards/cards.ts';
import { bigCountryReward, canRide, PROFILES, ticketPrice, travelTurns } from '../src/engine/constants.ts';
import { apply, createGame, legalActions, mapBusinesses } from '../src/engine/engine.ts';
import { robotAction } from '../src/engine/normal-robot.ts';
import { randomRobotAction } from '../src/engine/robot.ts';
import type { Action, GameState, Profile } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { map50 } from '../src/maps/map50.ts';
import { seatOf, seats, startedGame } from './helpers.ts';

// Step 2.11 (owner): the 5th profile, Kris Ann. +3 extra for every big country she finishes (also by bus or car);
// may take the bus; never owns a business; plane ticket 4, ship, train, bus and car 2; normal travel times; only the
// start citizenship. Her own 8 cards, none twice in a game, with their own points in the 50-turn game.

test('Kris Ann: tickets, the bus and normal travel times', () => {
  assert.equal(ticketPrice('krisann', 'airport'), 4);
  for (const kind of ['port', 'station', 'bus', 'car'] as const) assert.equal(ticketPrice('krisann', kind), 2, kind);
  assert.ok(canRide('krisann', 'bus') && canRide('krisann', 'station'));
  for (const kind of ['airport', 'port', 'station', 'bus', 'car'] as const) {
    for (const paid of [true, false]) assert.equal(travelTurns('krisann', kind, paid), travelTurns('nomad', kind, paid), `${kind} ${paid}`);
  }
});

test('Kris Ann: +3 extra for every big country she finishes, also all at once by car', () => {
  assert.equal(bigCountryReward('krisann', 3), 8);
  assert.equal(bigCountryReward('krisann', 2), 6);
  assert.equal(bigCountryReward('business', 3), 5);
  // The same car trip from Mexico to the USA: Kris Ann gains exactly 3 more than the Business.
  const gain = (profile: Profile): number => {
    let s = startedGame(['west-africa', 'iberia'], 1, map30, [profile, ...PROFILES]);
    seatOf(s, 0).area = 'mexico';
    seatOf(s, 0).points = 10;
    s = apply(s, map30, { type: 'board', kind: 'car', to: 'usa-east' });
    const boarded = seatOf(s, 0).points;
    while (seatOf(s, 0).travel) {
      const a = legalActions(s, map30);
      s = apply(s, map30, a.find((x) => x.type === 'travel' && !x.challenge) ?? a.find((x) => x.type === 'walk') ?? a[0]);
    }
    return seatOf(s, 0).points - boarded;
  };
  assert.equal(gain('krisann') - gain('business'), 3);
});

test('Kris Ann never owns a business: she can\'t buy one and is never offered one', () => {
  const s = startedGame(['west-africa', 'iberia'], 1, map30, ['krisann', 'business', ...PROFILES]);
  const airport = mapBusinesses(map30).find((b) => b.kind === 'airline')!.area;
  seatOf(s, 0).area = airport;
  seatOf(s, 0).points = 20;
  assert.ok(!legalActions(s, map30).some((a) => a.type === 'buy'));
  // The Business, owning a business, can offer it to nobody but other players who may own one.
  const t = startedGame(['west-africa', 'iberia', 'india'], 1, map30, ['business', 'krisann', 'nomad']);
  t.businesses.find((b) => b.area === airport && b.kind === 'airline')!.owner = seatOf(t, 0).seat;
  seatOf(t, 1).points = 20;
  seatOf(t, 2).points = 20;
  const to = legalActions(t, map30).flatMap((a) => (a.type === 'sell' ? [t.players[a.to].profile] : []));
  assert.ok(to.includes('nomad') && !to.includes('krisann'), JSON.stringify(to));
});

test('the first robot to choose takes Kris Ann; the others choose at random', () => {
  const s = createGame({ seats: seats(3, 2), seed: 5 }, map30);
  const [a] = robotAction(s, map30, 1, 'normal');
  assert.deepEqual(a, { type: 'chooseProfile', profile: 'krisann' });
  const t = apply(s, map30, a);
  const [b] = robotAction(t, map30, 1, 'normal');
  assert.ok(b.type === 'chooseProfile' && b.profile !== 'krisann');
});

test('Kris Ann\'s own cards: only hers, none twice in a game, 50-turn points in the 50-turn game', () => {
  let own = 0;
  for (const [map, games] of [[map30, 60], [map50, 30]] as const) {
    for (let g = 0; g < games; g++) {
      let s: GameState = createGame({ seats: seats(4, 3), seed: g * 13 + 1 }, map);
      let r = g + 3;
      const seen = new Map<number, string[]>();
      while (s.phase !== 'finished') {
        let a: Action;
        [a, r] = randomRobotAction(s, map, r);
        s = apply(s, map, a);
        for (const c of s.drawn) {
          if (c.card.deck !== 'krisann') continue;
          own++;
          assert.equal(s.players[c.seat].profile, 'krisann');
          const list = seen.get(c.seat) ?? [];
          assert.ok(!list.includes(c.card.id), `${c.card.id} twice`);
          seen.set(c.seat, [...list, c.card.id]);
          const card = CARDS.find((x) => x.id === c.card.id)!;
          assert.equal(c.card.points, map === map50 ? card.points50 ?? card.points : card.points, c.card.id);
        }
      }
    }
  }
  assert.ok(own > 0, 'some of her cards were drawn');
});
