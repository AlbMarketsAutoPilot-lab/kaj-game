import assert from 'node:assert/strict';
import { test } from 'node:test';
import { START_CONTINENTS } from '../src/engine/constants.ts';
import { apply, continentReward, legalActions } from '../src/engine/engine.ts';
import type { GameState } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { map50 } from '../src/maps/map50.ts';
import { seatOf, startedGame, testMap } from './helpers.ts';

// Owner's rules (M5): a reward for visiting every area of a continent, and Madagascar's surprise.

test('whole-continent rewards: areas ÷ 3, at least 2 (the approved table for both maps)', () => {
  const table = (m: typeof map30) => START_CONTINENTS.map((c) => continentReward(m, c));
  // Europe, Asia, Africa, North America, South America, Oceania.
  assert.deepEqual(table(map30), [4, 5, 3, 3, 2, 2]);
  assert.deepEqual(table(map50), [6, 8, 6, 3, 3, 2]);
});

test('every area of a continent visited: its reward once, on the move that completes it', () => {
  // Test map: Asia has 2 areas (as-west, as-east). Rewards on (the helper turns them off by default).
  let s = startedGame(['as-west', 'af-south'], 1, testMap, undefined, false, true);
  s = apply(s, testMap, { type: 'walk', to: 'as-east' });
  // 3 welcome + 1 area + 2 whole Asia.
  assert.equal(seatOf(s, 0).points, 6);
  assert.deepEqual(seatOf(s, 0).fullContinents, ['Asia']);
  assert.deepEqual(s.rewards, [{ seat: seatOf(s, 0).seat, kind: 'continent', points: 2, continent: 'Asia' }]);
  s = apply(s, testMap, { type: 'walk', to: 'af-north' });
  s = apply(s, testMap, { type: 'walk', to: 'as-west' }); // back: nothing more
  assert.equal(seatOf(s, 0).points, 6);
  assert.deepEqual(s.rewards, []);
});

test('rewards can be switched off for exact-point rule tests only', () => {
  let s = startedGame(['as-west', 'af-south']);
  s = apply(s, testMap, { type: 'walk', to: 'as-east' });
  assert.equal(seatOf(s, 0).points, 4);
});

function toMadagascar(s: GameState): GameState {
  seatOf(s, 0).area = 'tanzania';
  seatOf(s, 0).points = 10;
  s = apply(s, map50, { type: 'board', kind: 'port', to: 'madagascar' }); // Business: ticket 2, 1 travel turn
  s = apply(s, map50, legalActions(s, map50).find((a) => a.type === 'walk')!);
  return apply(s, map50, { type: 'travel' });
}

test('Madagascar: SURPRISE! +3 on the first arrival, once', () => {
  let s = toMadagascar(startedGame(['egypt', 'spain'], 1, map50, ['business', 'nomad']));
  assert.equal(seatOf(s, 0).area, 'madagascar');
  // 10 − 2 ticket + 1 new area + 3 surprise (Africa already counted).
  assert.equal(seatOf(s, 0).points, 12);
  assert.deepEqual(s.rewards, [{ seat: seatOf(s, 0).seat, kind: 'surprise', points: 3, area: 'madagascar' }]);
  // A second arrival gives nothing.
  s = startedGame(['egypt', 'spain'], 1, map50, ['business', 'nomad']);
  seatOf(s, 0).visitedAreas.push('madagascar');
  s = toMadagascar(s);
  assert.equal(seatOf(s, 0).points, 8);
  assert.deepEqual(s.rewards, []);
});

test('Madagascar as the home country: no surprise (the welcome bonus only)', () => {
  const s = startedGame(['madagascar', 'spain'], 1, map50);
  assert.equal(seatOf(s, 0).points, 3);
});
