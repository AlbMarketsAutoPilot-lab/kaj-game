import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addPoints, apply, legalActions, rank } from '../src/engine/engine.ts';
import { testMap } from './fixtures/test-map.ts';
import { seatOf, startedGame, walk } from './helpers.ts';

test('walking to a new area: +1', () => {
  let s = startedGame(['eu-west', 'as-east']);
  s = walk(s, 'eu-north');
  assert.equal(seatOf(s, 0).points, 3 + 1);
  assert.equal(seatOf(s, 0).area, 'eu-north');
});

test('a repeat visit gives 0, including the starting area', () => {
  let s = startedGame(['eu-west', 'as-east']);
  s = walk(s, 'eu-north'); // +1
  s = walk(s, 'as-west'); // player 2: new area
  s = walk(s, 'eu-west'); // back to start: 0
  assert.equal(seatOf(s, 0).points, 3 + 1);
  s = walk(s, 'as-east');
  s = walk(s, 'eu-north'); // repeat: 0
  assert.equal(seatOf(s, 0).points, 3 + 1);
});

test('first arrival on a new continent: +1 area +2 continent; the start continent never counts', () => {
  let s = startedGame(['eu-east', 'af-south']);
  s = walk(s, 'as-west');
  assert.equal(seatOf(s, 0).points, 3 + 1 + 2);
  s = walk(s, 'af-north'); // player 2 stays in Africa: area only
  assert.equal(seatOf(s, 1).points, 3 + 1);
  s = walk(s, 'eu-east'); // player 1 back in Europe (start continent): 0
  assert.equal(seatOf(s, 0).points, 3 + 1 + 2);
});

test('two players are never in the same area', () => {
  let s = startedGame(['eu-west', 'af-north']);
  const moves = legalActions(s, testMap).flatMap((a) => (a.type === 'walk' && !a.citizenship ? [a.to] : []));
  assert.deepEqual(moves.sort(), ['eu-east', 'eu-north']);
  assert.throws(() => walk(s, 'af-north'));
  // Once the other player leaves, the area is free again.
  s = walk(s, 'eu-north');
  s = walk(s, 'af-south');
  s = walk(s, 'eu-west');
  assert.ok(legalActions(s, testMap).some((a) => a.type === 'walk' && a.to === 'af-north'));
});

test('only neighbouring areas can be walked to', () => {
  const s = startedGame(['eu-west', 'as-east']);
  assert.throws(() => walk(s, 'af-south'));
});

test('when every neighbour is taken the only action is "blocked", which ends the turn', () => {
  let s = startedGame(['af-south', 'as-east']);
  s = walk(s, 'af-north'); // player 1 leaves af-south
  s = walk(s, 'as-west');
  s = walk(s, 'af-south'); // player 1 back into the dead end
  s = walk(s, 'af-north'); // player 2 closes it
  assert.deepEqual(legalActions(s, testMap), [{ type: 'blocked' }]);
  const before = seatOf(s, 0).points;
  s = apply(s, testMap, { type: 'blocked' });
  assert.equal(seatOf(s, 0).points, before);
  assert.equal(s.turnOrder[s.current], seatOf(s, 1).seat);
});

test('points never go below 0', () => {
  assert.equal(addPoints(1, -5), 0);
  assert.equal(addPoints(0, -1), 0);
  assert.equal(addPoints(2, 3), 5);
});

test('apply never changes the old state', () => {
  const s = startedGame(['eu-west', 'as-east']);
  const copy = structuredClone(s);
  walk(s, 'eu-north');
  assert.deepEqual(s, copy);
});

test('the game ends after 30 rounds, with a winner', () => {
  let s = startedGame(['eu-west', 'af-south']);
  // Player 1 shuttles between two areas; player 2 does too.
  for (let r = 0; r < 30; r++) {
    assert.equal(s.phase, 'play');
    s = walk(s, r % 2 === 0 ? 'eu-north' : 'eu-west');
    s = walk(s, r % 2 === 0 ? 'af-north' : 'af-south');
  }
  assert.equal(s.phase, 'finished');
  assert.deepEqual(legalActions(s, testMap), []);
  // Both: 3 + 1 point, 1 continent, 2 areas → a draw.
  assert.deepEqual(s.result!.winners.sort(), [0, 1].sort());
});

test('tie-break: more continents, then more areas', () => {
  const s = startedGame(['eu-west', 'as-east', 'af-south']);
  const [a, b, c] = s.players.map((p) => structuredClone(p));
  a.points = b.points = c.points = 7;
  a.visitedContinents = ['Europe'];
  b.visitedContinents = c.visitedContinents = ['Asia', 'Europe'];
  b.visitedAreas = ['as-east', 'as-west', 'eu-east'];
  c.visitedAreas = ['af-south', 'af-north', 'eu-west', 'eu-north'];
  assert.deepEqual(rank([a, b, c]), { ranking: [c.seat, b.seat, a.seat], winners: [c.seat] });

  c.visitedAreas = b.visitedAreas;
  assert.deepEqual(rank([a, b, c]).winners, [b.seat, c.seat]);
});
