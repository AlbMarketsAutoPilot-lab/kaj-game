import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, createGame } from '../src/engine/engine.ts';
import type { GameState, Profile } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { seatOf, seats } from './helpers.ts';

// Wonders and big countries (rulebook section 3), on the real 30-turn map.

function started(starts: string[]): GameState {
  let s = createGame({ seats: seats(starts.length), seed: 1 }, map30);
  const profiles: Profile[] = ['backpacker', 'business', 'luxury', 'nomad'];
  while (s.phase === 'chooseProfile') {
    const taken = new Set(s.players.map((p) => p.profile));
    s = apply(s, map30, { type: 'chooseProfile', profile: profiles.find((p) => !taken.has(p))! });
  }
  for (const area of starts) s = apply(s, map30, { type: 'chooseStart', area });
  return s;
}

const walk = (s: GameState, to: string) => apply(s, map30, { type: 'walk', to });

test('wonder: first visit +1 area +1 wonder; a repeat visit gives 0', () => {
  let s = started(['usa-east', 'north-africa']);
  s = walk(s, 'usa-west');
  s = walk(s, 'egypt');
  assert.equal(seatOf(s, 1).points, 3 + 1 + 1);
  s = walk(s, 'usa-east');
  s = walk(s, 'north-africa');
  s = walk(s, 'usa-west');
  s = walk(s, 'egypt');
  assert.equal(seatOf(s, 1).points, 3 + 1 + 1);
});

test('starting in a wonder gives only the welcome bonus', () => {
  const s = started(['mexico', 'egypt']);
  assert.equal(seatOf(s, 0).points, 4);
  assert.equal(seatOf(s, 1).points, 3);
});

test('big country: all or nothing, continue where you stopped, bonus only once', () => {
  let s = started(['mexico', 'north-africa']);
  s = walk(s, 'usa-west'); // USA 1 of 2: 0
  assert.equal(seatOf(s, 0).points, 4);
  s = walk(s, 'egypt');
  s = walk(s, 'canada-west'); // left the USA halfway; Canada 1 of 2: 0
  assert.equal(seatOf(s, 0).points, 4);
  s = walk(s, 'north-africa');
  s = walk(s, 'usa-east'); // USA complete: +1 +2
  assert.equal(seatOf(s, 0).points, 4 + 3);
  s = walk(s, 'egypt');
  s = walk(s, 'canada-east'); // Canada complete: +1 +2
  assert.equal(seatOf(s, 0).points, 4 + 3 + 3);
  s = walk(s, 'north-africa');
  s = walk(s, 'usa-east'); // never again
  assert.equal(seatOf(s, 0).points, 4 + 3 + 3);
});

test('big country: the starting part counts toward the country', () => {
  let s = started(['usa-east', 'egypt']);
  s = walk(s, 'usa-west');
  assert.equal(seatOf(s, 0).points, 4 + 3);
});

test('big country across two continents: +1 +2 for Russia, +2 for the new continent', () => {
  let s = started(['russia-west', 'egypt']);
  s = walk(s, 'russia-east');
  assert.equal(seatOf(s, 0).points, 3 + 3 + 2);
});
