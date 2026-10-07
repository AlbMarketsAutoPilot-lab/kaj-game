import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, finalScore, nomadPenalty, rank } from '../src/engine/engine.ts';
import type { Continent } from '../src/engine/types.ts';
import { seatOf, startedGame, testMap, walk } from './helpers.ts';

// Profile bonuses (rulebook section 12, task 10). The start continent counts.

test('Backpacker: +3 on the move that reaches a 3rd continent, once', () => {
  let s = startedGame(['eu-west', 'na-one']);
  assert.equal(seatOf(s, 0).profile, 'backpacker');
  s = walk(s, 'af-north'); // 2nd continent: +1 +2
  s = walk(s, 'as-east');
  assert.equal(seatOf(s, 0).points, 3 + 3);
  s = walk(s, 'as-west'); // 3rd continent: +1 +2 +3
  assert.equal(seatOf(s, 0).points, 3 + 3 + 6);
  s = walk(s, 'na-one');
  s = walk(s, 'as-east'); // a new area in Asia: +1 only
  seatOf(s, 1).area = 'af-south'; // move the other player out of the way
  s = walk(s, 'af-north');
  s = walk(s, 'na-one'); // 4th continent: +1 +2, no second bonus
  assert.equal(seatOf(s, 0).points, 12 + 1 + 3);
});

test('Luxury: +5 on the move that reaches a 5th continent, once', () => {
  let s = startedGame(['eu-west', 'af-south'], 1, undefined, ['luxury', 'backpacker']);
  const lux = seatOf(s, 0);
  assert.equal(lux.profile, 'luxury');
  lux.visitedContinents.push('South America', 'Oceania', 'Antarctica' as Continent); // 4 so far
  s = walk(s, 'af-north'); // 5th: +1 +2 +5
  s = apply(s, testMap, { type: 'blocked' }); // the other player can't move
  assert.equal(seatOf(s, 0).points, 3 + 8);
  s = walk(s, 'as-west'); // 6th: +1 +2, no new bonus
  assert.equal(seatOf(s, 0).points, 3 + 8 + 3);
});

test('Business: no continent bonus', () => {
  let s = startedGame(['eu-west', 'na-one'], 1, undefined, ['business', 'backpacker']);
  s = walk(s, 'af-north');
  s = walk(s, 'as-east');
  s = walk(s, 'as-west');
  assert.equal(seatOf(s, 0).points, 3 + 3 + 3);
  assert.equal(seatOf(s, 1).points, 4 + 3); // the Backpacker, 2 continents so far
});

test('Digital Nomad: −5 off the final score below 3 continents, never below 0', () => {
  const s = startedGame(['eu-west', 'af-south'], 1, undefined, ['nomad', 'backpacker']);
  const nomad = seatOf(s, 0);
  const other = seatOf(s, 1);
  assert.equal(nomad.profile, 'nomad');
  nomad.points = 9;
  other.points = 6;
  nomad.visitedContinents = ['Europe', 'Asia'];
  assert.equal(nomadPenalty(nomad), 5);
  assert.equal(finalScore(s, nomad), 4);
  assert.deepEqual(rank(s.players).winners, [other.seat]);
  nomad.points = 3;
  assert.equal(finalScore(s, nomad), 0);
  nomad.visitedContinents = ['Europe', 'Asia', 'Africa'];
  assert.equal(nomadPenalty(nomad), 0);
  assert.equal(finalScore(s, nomad), 3);
  assert.equal(nomadPenalty(other), 0); // only the Nomad
});
