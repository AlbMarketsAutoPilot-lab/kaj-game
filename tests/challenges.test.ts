import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { CHALLENGES } from '../src/challenges/challenges.ts';
import { apply, CHALLENGE_TYPES, legalActions } from '../src/engine/engine.ts';
import type { Action, GameState, Profile } from '../src/engine/types.ts';
import { travelMap as map } from './fixtures/test-map.ts';
import { seatOf, startedGame } from './helpers.ts';

// Travel-turn challenges (docs/engine.md, task 12).
//   eu-north — eu-east — as-west — as-east — na-one      ✈️ eu-west ↔ as-east ↔ af-south
//      |      /            |                             ⛴️ eu-north ↔ na-one
//   eu-west — af-north ----+

function game(starts: string[], profiles: Profile[] = ['business', 'luxury']): GameState {
  return startedGame(starts, 1, map, profiles);
}
const go = (s: GameState, action: Action) => apply(s, map, action);
const p1 = (s: GameState) => seatOf(s, 0);
const pass = (s: GameState) => go(s, legalActions(s, map).find((a) => a.type === 'walk' || a.type === 'blocked')!);

// The Nomad is at sea (ship: 3 travel turns), on their first travel turn.
function atSea(): GameState {
  let s = game(['eu-north', 'as-east'], ['nomad', 'luxury']);
  s = go(s, { type: 'board', kind: 'port', to: 'na-one' });
  return pass(s);
}

test('the question file: 6 types, two different answers, unique ids, every flag present', () => {
  assert.ok(CHALLENGES.length >= 600, `${CHALLENGES.length} questions`);
  assert.equal(new Set(CHALLENGES.map((c) => c.id)).size, CHALLENGES.length, 'ids are unique');
  for (const type of CHALLENGE_TYPES) {
    assert.ok(CHALLENGES.filter((c) => c.type === type).length >= 80, type);
  }
  for (const c of CHALLENGES) {
    assert.ok(CHALLENGE_TYPES.includes(c.type), c.id);
    assert.notEqual(c.options[0], c.options[1], c.id);
    assert.ok(c.options.every((o) => o.length > 0), c.id);
    assert.ok(c.correct === 0 || c.correct === 1, c.id);
    assert.equal(c.type === 'flag', c.flag !== undefined, `${c.id}: a flag only on flag questions`);
    if (c.flag) assert.ok(existsSync(`assets/flags/${c.flag}.svg`), `${c.id}: no flag file`);
  }
  // The right answer is not always in the same place.
  const first = CHALLENGES.filter((c) => c.correct === 0).length / CHALLENGES.length;
  assert.ok(first > 0.4 && first < 0.6);
  assert.ok(readFileSync('assets/flags/LICENSE', 'utf8').includes('MIT'));
});

test('a travel turn: the challenge is offered, never obligatory', () => {
  const s = atSea();
  assert.deepEqual(legalActions(s, map), [{ type: 'travel' }, { type: 'travel', challenge: true }]);
});

test('no challenge with 0 points', () => {
  const s = atSea();
  p1(s).points = 0;
  assert.deepEqual(legalActions(s, map), [{ type: 'travel' }]);
});

test('saying no: nothing happens, the trip goes on (Nomad +1)', () => {
  const s = atSea();
  const t = go(s, { type: 'travel' });
  assert.equal(p1(t).travel!.turnsLeft, 2);
  assert.equal(p1(t).points, p1(s).points + 1);
  assert.equal(t.challenged, null);
  assert.deepEqual(t.drawn, []);
});

test('playing: the question comes now, the answer is the next move', () => {
  let s = atSea();
  s = go(s, { type: 'travel', challenge: true });
  assert.ok(s.challenge);
  assert.equal(p1(s).travel!.turnsLeft, 3, 'the trip goes on only after the answer');
  assert.deepEqual(legalActions(s, map), [{ type: 'challengeAnswer', choice: 0 }, { type: 'challengeAnswer', choice: 1 }]);
});

test('right +1, wrong −1; the trip goes on either way (Nomad +1)', () => {
  const s = go(atSea(), { type: 'travel', challenge: true });
  const before = p1(s).points;
  const right = go(s, { type: 'challengeAnswer', choice: s.challenge!.correct });
  assert.equal(p1(right).points, before + 1 + 1);
  assert.equal(p1(right).travel!.turnsLeft, 2);
  assert.deepEqual(right.challenged, { seat: p1(s).seat, challenge: s.challenge, choice: s.challenge!.correct, right: true, change: 1 });
  assert.equal(right.challenge, null);
  const wrong = go(s, { type: 'challengeAnswer', choice: s.challenge!.correct === 0 ? 1 : 0 });
  assert.equal(p1(wrong).points, before + 1 - 1);
  assert.equal(p1(wrong).travel!.turnsLeft, 2);
  assert.equal(wrong.challenged!.right, false);
  assert.equal(wrong.challenged!.change, -1);
});

test('the last travel turn lands first, then the challenge counts', () => {
  let s = game(['eu-west', 'af-south'], ['backpacker', 'luxury']); // Backpacker: plane 1 turn
  s = go(s, { type: 'quiz', kind: 'airport', to: 'as-east' });
  s = go(s, { type: 'answer', choice: s.quiz!.question.correct });
  s = pass(s);
  s = go(s, { type: 'travel', challenge: true });
  const before = p1(s).points;
  const t = go(s, { type: 'challengeAnswer', choice: s.challenge!.correct === 0 ? 1 : 0 });
  assert.equal(p1(t).area, 'as-east');
  assert.equal(p1(t).travel, null);
  assert.equal(p1(t).points, before + 1 + 2 - 1); // new area +1, new continent +2, challenge −1
});

test('the challenge is random but replays the same with the same seed', () => {
  const ids = new Set<string>();
  for (let r = 1; r < 200; r++) {
    const s = atSea();
    s.rng = r;
    const a = go(s, { type: 'travel', challenge: true });
    const b = go(s, { type: 'travel', challenge: true });
    assert.deepEqual(a.challenge, b.challenge);
    ids.add(a.challenge!.type);
  }
  assert.equal(ids.size, CHALLENGE_TYPES.length, 'every type comes up');
});
