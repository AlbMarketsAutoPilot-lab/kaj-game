import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, createGame } from '../src/engine/engine.ts';
import type { GameState, Profile } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { seatOf, seats } from './helpers.ts';

// Wonders and big countries (rulebook section 3), on the real 30-turn map.

function started(starts: string[]): GameState {
  let s = createGame({ seats: seats(starts.length), seed: 1, eventCards: false }, map30);
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
  s = walk(s, 'usa-west'); // USA 1 of 3 (with Alaska, task 14b): 0
  assert.equal(seatOf(s, 0).points, 4);
  s = walk(s, 'egypt');
  s = walk(s, 'canada-west'); // left the USA; Canada 1 of 3: 0
  s = walk(s, 'north-africa');
  s = walk(s, 'canada-central'); // Canada 2 of 3: 0
  s = walk(s, 'egypt');
  s = walk(s, 'usa-east'); // left Canada; USA 2 of 3: 0
  assert.equal(seatOf(s, 0).points, 4);
  s = walk(s, 'north-africa');
  s = walk(s, 'canada-east'); // Canada complete, 3 parts: +5 (task 14a)
  assert.equal(seatOf(s, 0).points, 4 + 5);
  s = walk(s, 'egypt');
  s = walk(s, 'canada-central');
  s = walk(s, 'north-africa');
  s = walk(s, 'canada-west');
  s = walk(s, 'egypt');
  s = walk(s, 'alaska'); // USA complete, 3 parts: +5 (task 14b)
  assert.equal(seatOf(s, 0).points, 4 + 5 + 5);
  s = walk(s, 'north-africa');
  s = walk(s, 'canada-west');
  s = walk(s, 'egypt');
  s = walk(s, 'usa-west'); // never again
  assert.equal(seatOf(s, 0).points, 4 + 5 + 5);
});

test('big country: the starting part counts toward the country', () => {
  let s = started(['brazil-south', 'egypt']);
  s = walk(s, 'brazil-north'); // Brazil, 2 parts: +1 +2
  assert.equal(seatOf(s, 0).points, 4 + 3);
});

test('big country across two continents: +2 for the new continent at once, +5 when Russia is complete', () => {
  let s = started(['russia-west', 'egypt']);
  s = walk(s, 'russia-east'); // Siberia: Russia 2 of 3: 0, Asia +2
  assert.equal(seatOf(s, 0).points, 3 + 2);
  s = walk(s, 'north-africa');
  s = walk(s, 'russia-far-east'); // Russia complete, 3 parts: +5 (task 14a)
  assert.equal(seatOf(s, 0).points, 3 + 2 + 5);
});
