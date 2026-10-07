import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, createGame, legalActions } from '../src/engine/engine.ts';
import { testMap } from './fixtures/test-map.ts';
import { currentPlayer, seatOf, seats, startedGame } from './helpers.ts';

test('a game needs 2–4 seats, at least 1 human, at most 3 robots', () => {
  assert.throws(() => createGame({ seats: seats(1), seed: 1 }, testMap));
  assert.throws(() => createGame({ seats: seats(5), seed: 1 }, testMap));
  assert.throws(() => createGame({ seats: seats(2, 2), seed: 1 }, testMap));
  assert.doesNotThrow(() => createGame({ seats: seats(4, 3), seed: 1 }, testMap));
});

test('the map must have a starting continent for every seat', () => {
  const oneContinent = { id: 'one', areas: testMap.areas.filter((a) => a.id.startsWith('eu-')) };
  assert.throws(() => createGame({ seats: seats(2), seed: 1 }, oneContinent));
});

test('first player is random, then the order stays fixed', () => {
  const firsts = new Set<number>();
  for (let seed = 0; seed < 50; seed++) {
    const s = createGame({ seats: seats(4), seed }, testMap);
    firsts.add(s.turnOrder[0]);
    // Same order around the table, starting from the first player.
    for (let i = 0; i < 4; i++) assert.equal(s.turnOrder[i], (s.turnOrder[0] + i) % 4);
  }
  assert.equal(firsts.size, 4);
});

test('the same seed gives the same game', () => {
  const a = createGame({ seats: seats(3), seed: 42 }, testMap);
  const b = createGame({ seats: seats(3), seed: 42 }, testMap);
  assert.deepEqual(a, b);
});

test('each profile can be taken by only one player; the last player gets the one left', () => {
  let s = createGame({ seats: seats(4), seed: 7 }, testMap);
  assert.equal(legalActions(s, testMap).length, 4);
  s = apply(s, testMap, { type: 'chooseProfile', profile: 'luxury' });
  assert.equal(legalActions(s, testMap).length, 3);
  assert.throws(() => apply(s, testMap, { type: 'chooseProfile', profile: 'luxury' }));
  s = apply(s, testMap, { type: 'chooseProfile', profile: 'nomad' });
  s = apply(s, testMap, { type: 'chooseProfile', profile: 'backpacker' });
  assert.equal(s.phase, 'chooseStart');
  assert.equal(seatOf(s, 3).profile, 'business');
});

test('with 2 players the second still chooses from the 3 left', () => {
  let s = createGame({ seats: seats(2), seed: 7 }, testMap);
  s = apply(s, testMap, { type: 'chooseProfile', profile: 'nomad' });
  assert.equal(s.phase, 'chooseProfile');
  assert.equal(legalActions(s, testMap).length, 3);
});

test('starting continents must all be different', () => {
  let s = createGame({ seats: seats(2), seed: 1 }, testMap);
  s = apply(s, testMap, { type: 'chooseProfile', profile: 'nomad' });
  s = apply(s, testMap, { type: 'chooseProfile', profile: 'luxury' });
  s = apply(s, testMap, { type: 'chooseStart', area: 'eu-west' });
  const options = legalActions(s, testMap).map((a) => (a.type === 'chooseStart' ? a.area : ''));
  assert.ok(!options.some((id) => id.startsWith('eu-')));
  assert.throws(() => apply(s, testMap, { type: 'chooseStart', area: 'eu-north' }));
});

test('welcome bonus: Europe/Asia/Africa +3, North America +4', () => {
  const s = startedGame(['eu-west', 'as-east', 'af-south', 'na-one']);
  assert.deepEqual(
    [0, 1, 2, 3].map((k) => seatOf(s, k).points),
    [3, 3, 3, 4],
  );
  assert.equal(s.phase, 'play');
  assert.equal(s.round, 1);
  assert.equal(currentPlayer(s).seat, s.turnOrder[0]);
});
