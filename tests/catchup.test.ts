import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BUSINESS_PRICE, CATCH_UP, catchUpFor } from '../src/engine/constants.ts';
import { finalScore, withCatchUp } from '../src/engine/engine.ts';
import type { GameState, Profile } from '../src/engine/types.ts';
import { travelMap as map } from './fixtures/test-map.ts';
import { startedGame } from './helpers.ts';

// Step 2.12 (owner, secret rule): catch-up at a card draw. The single leader (finalScore: points plus businesses, as
// at the end) multiplies the bad weight by (1 + catch-up); the single last player multiplies the good weight by
// (1 + catch-up); nobody else changes; a shared top or bottom score changes nothing. 30 and 50 turns 1, 100 turns 3.

const MIX = { good: 1.1, bad: 0.8 };
function game(points: number[], totalRounds = 30): GameState {
  const starts = ['eu-west', 'as-east', 'af-south', 'na-one'].slice(0, points.length);
  const s = startedGame(starts, 1, map, (['business', 'luxury', 'nomad', 'backpacker'] as Profile[]).slice(0, points.length), true);
  points.forEach((p, k) => (s.players[k].points = p));
  s.totalRounds = totalRounds;
  return s;
}
const mixOf = (s: GameState, seat: number) => withCatchUp(s, s.players[seat], MIX);

test('catch-up: 1 on 30 and 50 turns, 3 on 100 turns', () => {
  assert.deepEqual(CATCH_UP, { 30: 1, 50: 1, 100: 3 });
  assert.deepEqual([catchUpFor(30), catchUpFor(50), catchUpFor(100)], [1, 1, 3]);
});

test('catch-up: the single leader draws bad cards (1 + catch-up) times as often, the single last good cards; the others unchanged', () => {
  const s = game([10, 5, 7, 2]);
  assert.deepEqual(mixOf(s, 0), { good: 1.1, bad: 0.8 * 2 });
  assert.deepEqual(mixOf(s, 3), { good: 1.1 * 2, bad: 0.8 });
  assert.deepEqual(mixOf(s, 1), MIX);
  assert.deepEqual(mixOf(s, 2), MIX);
  const long = game([10, 5, 7, 2], 100);
  assert.deepEqual(mixOf(long, 0), { good: 1.1, bad: 0.8 * 4 });
  assert.deepEqual(mixOf(long, 3), { good: 1.1 * 4, bad: 0.8 });
  assert.deepEqual(mixOf(long, 1), MIX);
  assert.deepEqual(mixOf(game([10, 5, 7, 2], 50), 0), { good: 1.1, bad: 0.8 * 2 });
  // 2 players: one leader, one last.
  const two = game([4, 3]);
  assert.deepEqual(mixOf(two, 0), { good: 1.1, bad: 1.6 });
  assert.deepEqual(mixOf(two, 1), { good: 2.2, bad: 0.8 });
});

test('catch-up: nothing changes when the top or the bottom score is shared', () => {
  const top = game([10, 10, 7, 2]);
  assert.deepEqual(mixOf(top, 0), MIX);
  assert.deepEqual(mixOf(top, 1), MIX);
  assert.deepEqual(mixOf(top, 3), { good: 2.2, bad: 0.8 });
  const bottom = game([10, 2, 7, 2]);
  assert.deepEqual(mixOf(bottom, 1), MIX);
  assert.deepEqual(mixOf(bottom, 3), MIX);
  assert.deepEqual(mixOf(bottom, 0), { good: 1.1, bad: 1.6 });
  const level = game([5, 5]);
  assert.deepEqual(mixOf(level, 0), MIX);
  assert.deepEqual(mixOf(level, 1), MIX);
});

test('catch-up: a game can switch it off (only the card-mix test does)', () => {
  const s = game([10, 5, 7, 2]);
  assert.equal(s.catchUp, true);
  s.catchUp = false;
  assert.deepEqual(mixOf(s, 0), MIX);
  assert.deepEqual(mixOf(s, 3), MIX);
});

test('catch-up: the score counts businesses, as at the end (finalScore)', () => {
  const s = game([6, 7, 5]);
  const b = s.businesses[0];
  b.owner = s.players[0].seat;
  assert.equal(finalScore(s, s.players[0]), 6 + BUSINESS_PRICE[b.kind] + 1); // + the most-businesses bonus
  assert.ok(finalScore(s, s.players[0]) > 7);
  assert.deepEqual(mixOf(s, 0), { good: 1.1, bad: 1.6 });
  assert.deepEqual(mixOf(s, 1), MIX);
  assert.deepEqual(mixOf(s, 2), { good: 2.2, bad: 0.8 });
});
