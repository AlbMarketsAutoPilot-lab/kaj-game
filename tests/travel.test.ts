import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, destinations, legalActions } from '../src/engine/engine.ts';
import type { Action, GameMap, GameState, Profile } from '../src/engine/types.ts';
import { PROFILES } from '../src/engine/constants.ts';
import { placeholderQuestion } from '../src/engine/quiz.ts';
import { map30 } from '../src/maps/map30.ts';
import { travelMap } from './fixtures/test-map.ts';
import { currentPlayer, seatOf, startedGame } from './helpers.ts';

// Player 1 (first in turn order) gets profiles[0], player 2 gets profiles[1].
function game(starts: string[], first: Profile, second: Profile = first === 'nomad' ? 'business' : 'nomad'): GameState {
  return startedGame(starts, 1, travelMap, [first, second, ...PROFILES]);
}

const go = (s: GameState, action: Action) => apply(s, travelMap, action);
const walk = (s: GameState, to: string) => go(s, { type: 'walk', to });
const board = (s: GameState, to: string, kind: 'airport' | 'port' = 'airport') => go(s, { type: 'board', kind, to });
const quiz = (s: GameState, to: string) => go(s, { type: 'quiz', kind: 'airport', to });
const travel = (s: GameState) => go(s, { type: 'travel' });

function answer(s: GameState, right: boolean): GameState {
  const correct = s.quiz!.question.correct;
  return go(s, { type: 'answer', choice: right ? correct : ((1 - correct) as 0 | 1) });
}

const trips = (s: GameState) =>
  legalActions(s, travelMap)
    .filter((a) => (a.type === 'board' || a.type === 'quiz') && !a.citizenship)
    .map((a) => `${a.type} ${'to' in a ? a.to : ''}`)
    .sort();

test('at an airport: pay or quiz for each destination, as well as walking (also on the first turn)', () => {
  const s = game(['as-east', 'eu-north'], 'nomad');
  assert.deepEqual(trips(s), ['board af-south', 'board eu-west', 'quiz af-south', 'quiz eu-west']);
  assert.ok(legalActions(s, travelMap).some((a) => a.type === 'walk'));
});

test('the Backpacker never pays: quiz only', () => {
  const s = game(['eu-west', 'af-north'], 'backpacker');
  assert.deepEqual(trips(s), ['quiz as-east']);
});

test('no "pay" option without enough points', () => {
  const s = game(['eu-west', 'af-north'], 'luxury');
  seatOf(s, 0).points = 2; // Luxury ticket is 3
  assert.deepEqual(trips(s), ['quiz af-south', 'quiz as-east']);
});

test('Luxury: any other airport by plane, any other port by ship', () => {
  assert.deepEqual(destinations(travelMap, 'eu-west', 'airport', 'luxury').sort(), ['af-south', 'as-east']);
  assert.deepEqual(destinations(travelMap, 'eu-west', 'airport', 'nomad'), ['as-east']);
  assert.deepEqual(destinations(travelMap, 'eu-west', 'port', 'luxury'), []);
  assert.equal(destinations(map30, 'japan', 'airport', 'luxury').length, 7);
  assert.deepEqual(destinations(map30, 'iceland', 'port', 'luxury').sort(),
    ['alaska', 'australia-east', 'canada-east', 'iberia', 'japan', 'new-zealand', 'uk-ireland', 'usa-west']);
});

test('Business plane: pay 2, 0 travel turns, land on the boarding turn with the arrival points', () => {
  let s = game(['eu-west', 'af-north'], 'business');
  s = board(s, 'as-east');
  assert.equal(seatOf(s, 0).area, 'as-east');
  assert.equal(seatOf(s, 0).travel, null);
  assert.equal(seatOf(s, 0).points, 3 - 2 + 1 + 2); // ticket, new area, new continent
  assert.equal(currentPlayer(s).seat, seatOf(s, 1).seat);
});

test('Nomad plane: pay 1, 1 travel turn (+1), then land', () => {
  let s = game(['eu-west', 'af-north'], 'nomad');
  s = board(s, 'as-east');
  assert.equal(seatOf(s, 0).area, null);
  assert.equal(seatOf(s, 0).points, 3 - 1);
  s = walk(s, 'af-south');
  // A challenge is offered too (task 12); saying no is the plain travel turn.
  assert.deepEqual(legalActions(s, travelMap), [{ type: 'travel' }, { type: 'travel', challenge: true }]);
  s = travel(s);
  assert.equal(seatOf(s, 0).area, 'as-east');
  assert.equal(seatOf(s, 0).points, 3 - 1 + 1 + 1 + 2);
});

test('Nomad ship: 3 travel turns (+3); Business ship: 1 travel turn', () => {
  let s = game(['eu-north', 'af-north'], 'nomad');
  s = board(s, 'na-one', 'port');
  for (const p2 of ['af-south', 'af-north', 'af-south']) {
    s = walk(s, p2);
    assert.equal(seatOf(s, 0).area, null);
    s = travel(s);
  }
  assert.equal(seatOf(s, 0).area, 'na-one');
  assert.equal(seatOf(s, 0).points, 3 - 1 + 3 + 1 + 2);

  let b = game(['eu-north', 'af-north'], 'business');
  b = board(b, 'na-one', 'port');
  b = walk(b, 'af-south');
  b = travel(b);
  assert.equal(seatOf(b, 0).area, 'na-one');
  assert.equal(seatOf(b, 0).points, 3 - 2 + 1 + 2);
});

// Owner's rule (task 13): a booked area (someone is travelling there) is closed, as if the
// traveller were already there; and nobody boards for an area where someone stands.
test('booked: nobody walks into or boards for an area someone is travelling to', () => {
  let s = game(['eu-west', 'as-west'], 'nomad');
  s = board(s, 'as-east');
  assert.equal(seatOf(s, 0).travel?.to, 'as-east');
  const moves = legalActions(s, travelMap);
  assert.ok(!moves.some((a) => 'to' in a && a.to === 'as-east'), 'as-east is booked');
  s = walk(s, 'eu-east');
  s = travel(s);
  assert.equal(seatOf(s, 0).area, 'as-east');
});

test("booked: no trip to an area where someone stands", () => {
  let s = game(['eu-west', 'af-north'], 'business');
  s = walk(s, 'eu-north');
  s = walk(s, 'as-west');
  s = walk(s, 'eu-west');
  s = walk(s, 'as-east'); // player 2 stands at the hub
  s = walk(s, 'eu-north');
  assert.ok(!legalActions(s, travelMap).some((a) => (a.type === 'board' || a.type === 'quiz') && a.to === 'as-east'));
});

test('destination taken at landing (safety net): wait one more travel turn (Nomad +1), then land', () => {
  let s = game(['eu-west', 'as-west'], 'nomad');
  s = board(s, 'as-east');
  s = walk(s, 'eu-east');
  seatOf(s, 1).area = 'as-east'; // only possible by changing the state by hand
  s = travel(s);
  assert.equal(seatOf(s, 0).area, null);
  s = walk(s, 'na-one');
  s = travel(s);
  assert.equal(seatOf(s, 0).area, 'as-east');
});

test('quiz: the answer comes in the same turn; right = free ticket, board now', () => {
  let s = game(['eu-west', 'af-north'], 'business');
  s = quiz(s, 'as-east');
  assert.equal(currentPlayer(s).seat, seatOf(s, 0).seat);
  assert.deepEqual(legalActions(s, travelMap), [{ type: 'answer', choice: 0 }, { type: 'answer', choice: 1 }]);
  s = answer(s, true);
  assert.equal(s.quiz, null);
  assert.equal(seatOf(s, 0).area, 'as-east');
  assert.equal(seatOf(s, 0).points, 3 + 1 + 2); // no ticket paid
});

test('quiz: a wrong answer uses the turn; the 3rd wrong answer pays and boards', () => {
  let s = game(['eu-west', 'af-north'], 'business');
  for (let i = 1; i <= 2; i++) {
    s = answer(quiz(s, 'as-east'), false);
    assert.equal(seatOf(s, 0).area, 'eu-west');
    assert.equal(seatOf(s, 0).quizWrong, i);
    s = walk(s, i === 1 ? 'af-south' : 'af-north');
  }
  s = answer(quiz(s, 'as-east'), false);
  assert.equal(seatOf(s, 0).area, 'as-east');
  assert.equal(seatOf(s, 0).points, 3 - 2 + 1 + 2);
  assert.equal(seatOf(s, 0).quizWrong, 0);
});

// Owner's rule (task 13): no more endless tries. After the 3rd wrong answer, a player who can't
// pay the ticket (always the Backpacker) goes home, free of fees, with the normal arrival points.
function threeWrong(profile: Profile, points: number): GameState {
  let s = game(['eu-west', 'af-north'], profile);
  seatOf(s, 0).points = points;
  seatOf(s, 0).home = 'eu-north'; // as if the journey had started there
  for (let i = 1; i <= 2; i++) {
    s = answer(quiz(s, 'as-east'), false);
    assert.equal(seatOf(s, 0).area, 'eu-west');
    assert.equal(seatOf(s, 0).quizWrong, i);
    s = walk(s, i === 1 ? 'af-south' : 'af-north');
  }
  return answer(quiz(s, 'as-east'), false);
}

test("quiz: can't pay after 3 wrong answers → go home", () => {
  const s = threeWrong('luxury', 2); // ticket 3
  assert.equal(seatOf(s, 0).area, 'eu-north');
  assert.equal(seatOf(s, 0).points, 2 + 1); // no fees, a new area +1
  assert.equal(seatOf(s, 0).quizWrong, 0);
  assert.deepEqual(s.payments, []);
});

test('Backpacker: 3 quiz tries too, then home', () => {
  const s = threeWrong('backpacker', 3);
  assert.equal(seatOf(s, 0).area, 'eu-north');
  assert.equal(seatOf(s, 0).quizWrong, 0);
  assert.equal(seatOf(s, 0).travel, null);
});

test('home is the area itself: the player stays and the count starts again', () => {
  let s = game(['eu-west', 'af-north'], 'backpacker');
  for (let i = 1; i <= 3; i++) {
    s = answer(quiz(s, 'as-east'), false);
    if (i < 3) s = walk(s, i === 1 ? 'af-south' : 'af-north');
  }
  assert.equal(seatOf(s, 0).area, 'eu-west');
  assert.equal(seatOf(s, 0).quizWrong, 0);
});

// The stuck-state checker (task 2b) assumes the quiz is always possible:
// any profile, any airport or port of the 30-turn map, even with 0 points.
test('30-turn map: the quiz is offered for every destination, for every profile, with 0 points', () => {
  for (const profile of PROFILES) {
    for (const r of map30.routes ?? []) {
      for (const [from, to] of [[r.a, r.b], [r.b, r.a]]) {
        const s = withPlayerAt(map30, profile, from);
        const offered = legalActions(s, map30).some((a) => a.type === 'quiz' && a.kind === r.kind && a.to === to);
        assert.ok(offered, `${profile} at ${from}: no quiz to ${to}`);
      }
    }
  }
});

test('placeholder quiz questions: two different options, and the marked one is right', () => {
  const ends = new Set((map30.routes ?? []).flatMap((r) => [r.a, r.b]));
  const names = new Map(map30.areas.map((a) => [a.id, a.name]));
  let seed = 1;
  for (const to of ends) {
    const area = map30.areas.find((a) => a.id === to)!;
    for (let i = 0; i < 20; i++) {
      const [q, next] = placeholderQuestion(map30, to, seed);
      seed = next;
      assert.notEqual(q.options[0], q.options[1], q.text);
      const right = q.options[q.correct];
      const wrong = q.options[1 - q.correct];
      if (q.text.startsWith('Which continent')) {
        assert.equal(right, area.continent);
      } else if (q.text.startsWith('Which area borders')) {
        const borders = area.neighbours.map((n) => names.get(n));
        assert.ok(borders.includes(right) && !borders.includes(wrong), q.text);
      } else {
        assert.ok(area.countries!.includes(right) && !area.countries!.includes(wrong), q.text);
      }
    }
  }
});

function withPlayerAt(map: GameMap, profile: Profile, area: string): GameState {
  const s = startedGame(['iberia', 'west-africa'], 1, map, [profile, ...PROFILES]);
  const other = seatOf(s, 1);
  if (other.area === area) other.area = 'france';
  seatOf(s, 0).area = area;
  seatOf(s, 0).points = 0;
  return s;
}
