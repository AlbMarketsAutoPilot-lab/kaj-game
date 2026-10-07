import assert from 'node:assert/strict';
import { test } from 'node:test';
import { POINTS_BUSINESS_CITIZENSHIP, VISA_PRICE } from '../src/engine/constants.ts';
import { apply, canAskCitizenship, legalActions } from '../src/engine/engine.ts';
import { makeExam, makeQuestion } from '../src/engine/quiz.ts';
import type { Action, GameMap, GameState, Profile } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { testMap, travelMap } from './fixtures/test-map.ts';
import { currentPlayer, seatOf, startedGame } from './helpers.ts';

// The travel test map, with West Asia + East Asia as one big country ("Bigland").
//   eu-north — eu-east — as-west — as-east — na-one       ✈️ eu-west ↔ as-east ↔ af-south
//      |      /            |                              ⛴️ eu-north ↔ na-one
//   eu-west — af-north ----+
//                 |
//              af-south
const map: GameMap = {
  ...travelMap,
  id: 'test-visa',
  areas: testMap.areas.map((a) => (a.id.startsWith('as-') ? { ...a, bigCountry: 'Bigland' } : a)),
};

// Player 1 (first in turn order) gets `first`, player 2 gets `second`.
function game(starts: string[], first: Profile, second: Profile = first === 'business' ? 'backpacker' : 'business'): GameState {
  return startedGame(starts, 1, map, [first, second, 'luxury', 'nomad', 'backpacker', 'business']);
}

const go = (s: GameState, action: Action) => apply(s, map, action);
const me = (s: GameState) => seatOf(s, 0);
const other = (s: GameState) => seatOf(s, 1);
const types = (s: GameState) => [...new Set(legalActions(s, map).map((a) => a.type))].sort();
const asks = (s: GameState) => legalActions(s, map).filter((a) => 'citizenship' in a && a.citizenship);

// The other player's turn: its first plain move (walk, trip or blocked), never a citizenship request.
function pass(s: GameState): GameState {
  return go(s, legalActions(s, map).find((a) => !('citizenship' in a && a.citizenship))!);
}

// Answers the 3 test questions: all right, or the first one wrong.
function answerTest(s: GameState, allRight: boolean): GameState {
  for (const [i, q] of me(s).exam!.questions.entries()) {
    const right = allRight || i > 0;
    s = go(s, { type: 'examAnswer', choice: right ? q.correct : ((1 - q.correct) as 0 | 1) });
  }
  return s;
}

test('the citizenship request is an option on the move, only for a new area', () => {
  let s = game(['eu-west', 'af-south'], 'backpacker');
  // Walking to af-north, eu-east or eu-north, and the quiz to as-east: with and without a request.
  assert.deepEqual(asks(s).map((a) => `${a.type} ${'to' in a ? a.to : ''}`).sort(),
    ['quiz as-east', 'walk af-north', 'walk eu-east', 'walk eu-north']);
  s = go(s, { type: 'walk', to: 'eu-north' }); // no request
  assert.equal(me(s).exam, null);
  s = pass(s);
  // Back to the start area (already visited): no request offered there.
  assert.ok(!asks(s).some((a) => a.type === 'walk' && a.to === 'eu-west'));
  assert.ok(asks(s).some((a) => a.type === 'walk' && a.to === 'eu-east'));
});

test('the Digital Nomad can never ask for citizenship', () => {
  const s = game(['eu-west', 'af-south'], 'nomad');
  assert.deepEqual(asks(s), []);
});

test('all answers right: request approved on arrival, test next turn, granted and moves on turn 3', () => {
  let s = game(['eu-west', 'af-south'], 'backpacker');
  s = go(s, { type: 'walk', to: 'eu-north', citizenship: true }); // turn 1: approved
  assert.equal(me(s).exam!.stage, 'test');
  assert.equal(me(s).askedCitizenship, true);
  assert.equal(me(s).exam!.questions.length, 3);
  s = pass(s);

  assert.deepEqual(types(s), ['examAnswer']); // turn 2: the 3 questions, in one turn; stays
  s = answerTest(s, true);
  assert.equal(me(s).exam!.stage, 'result');
  assert.equal(me(s).citizenship, null);
  s = pass(s);

  assert.deepEqual(me(s).citizenship, ['eu-north']); // turn 3: granted, and moves
  assert.equal(me(s).exam!.stage, 'granted');
  assert.ok(types(s).includes('walk'));
  s = go(s, { type: 'walk', to: 'eu-east' });
  assert.equal(me(s).exam, null);
});

test('a wrong answer: one more turn learning, then granted and moves on turn 4', () => {
  let s = game(['eu-west', 'af-south'], 'backpacker');
  s = go(s, { type: 'walk', to: 'eu-north', citizenship: true });
  s = pass(s);
  s = answerTest(s, false);
  s = pass(s);

  assert.equal(me(s).citizenship, null); // turn 3: not passed, stays
  assert.deepEqual(types(s), ['exam']);
  s = go(s, { type: 'exam' });
  assert.equal(me(s).exam!.stage, 'learning');
  s = pass(s);

  assert.deepEqual(me(s).citizenship, ['eu-north']); // turn 4: answers shown, granted, moves
  assert.equal(me(s).exam!.stage, 'learning');
  assert.ok(types(s).includes('walk'));
  s = pass(s); // its first move
  assert.equal(me(s).exam, null);
});

test('Luxury: no test; granted at the start of the next turn, and moves in that turn', () => {
  let s = game(['eu-west', 'af-south'], 'luxury');
  s = go(s, { type: 'walk', to: 'eu-north', citizenship: true });
  assert.deepEqual(me(s).exam!.questions, []);
  assert.equal(me(s).citizenship, null);
  s = pass(s);
  assert.deepEqual(me(s).citizenship, ['eu-north']);
  assert.equal(me(s).exam!.stage, 'granted');
  assert.ok(types(s).includes('walk'));
  s = go(s, { type: 'walk', to: 'eu-east' });
  assert.equal(me(s).exam, null);
});

test('Business: +3 when citizenship is granted', () => {
  let s = game(['eu-west', 'af-south'], 'business');
  s = go(s, { type: 'walk', to: 'eu-north', citizenship: true });
  s = pass(s);
  s = answerTest(s, true);
  const before = me(s).points;
  s = pass(s);
  assert.equal(me(s).points, before + POINTS_BUSINESS_CITIZENSHIP);
});

test('only one request per game', () => {
  let s = game(['eu-west', 'af-south'], 'luxury');
  s = go(s, { type: 'walk', to: 'eu-north', citizenship: true });
  s = pass(s);
  assert.deepEqual(asks(s), []);
});

test('one citizen per area: nobody else can ask there, also during the test', () => {
  let s = game(['eu-north', 'af-north'], 'backpacker');
  s = go(s, { type: 'walk', to: 'eu-east', citizenship: true });
  assert.equal(canAskCitizenship(s, map, other(s), 'eu-east'), false); // during the request
  s = pass(s);
  s = answerTest(s, true);
  s = pass(s);
  assert.equal(canAskCitizenship(s, map, other(s), 'eu-east'), false); // held
});

test('a big country is one citizenship: every part is covered', () => {
  let s = game(['eu-east', 'af-south'], 'luxury');
  s = go(s, { type: 'walk', to: 'as-west', citizenship: true });
  s = pass(s);
  assert.deepEqual(me(s).citizenship!.sort(), ['as-east', 'as-west']);
});

test('visa: 2 points to the citizen each time another player enters; moving inside is free', () => {
  let s = game(['eu-east', 'af-south'], 'luxury', 'business');
  s = go(s, { type: 'walk', to: 'as-west', citizenship: true }); // Luxury: Bigland
  s = go(s, { type: 'walk', to: 'af-north' });
  s = go(s, { type: 'walk', to: 'eu-east' }); // granted, then the citizen leaves Bigland
  const citizen = me(s).points;
  const visitor = other(s).points;
  s = go(s, { type: 'walk', to: 'as-west' }); // big-country part: 0; new continent +2; visa −2
  assert.equal(other(s).points, visitor + 2 - VISA_PRICE);
  assert.equal(me(s).points, citizen + VISA_PRICE);
  s = pass(s);
  const afterVisa = other(s).points;
  const citizenNow = me(s).points;
  s = go(s, { type: 'walk', to: 'as-east' }); // inside Bigland: no visa (and Bigland is complete)
  assert.ok(other(s).points > afterVisa);
  assert.equal(me(s).points, citizenNow);
});

test('no money, no visa: a visa area can\'t be entered with fewer than 2 points', () => {
  let s = game(['eu-east', 'af-south'], 'luxury', 'business');
  s = go(s, { type: 'walk', to: 'as-west', citizenship: true });
  s = go(s, { type: 'walk', to: 'af-north' });
  s = go(s, { type: 'walk', to: 'eu-east' });
  other(s).points = 1;
  assert.ok(!legalActions(s, map).some((a) => a.type === 'walk' && a.to === 'as-west'));
  other(s).points = 2;
  assert.ok(legalActions(s, map).some((a) => a.type === 'walk' && a.to === 'as-west'));
});

test('the citizen enters their own area for free', () => {
  let s = game(['eu-north', 'af-south'], 'luxury');
  s = go(s, { type: 'walk', to: 'eu-east', citizenship: true });
  s = pass(s);
  s = go(s, { type: 'walk', to: 'eu-north' });
  s = pass(s);
  const before = me(s).points;
  s = go(s, { type: 'walk', to: 'eu-east' });
  assert.equal(me(s).points, before);
});

test('plane to a visa area: boarding needs the ticket + 2 (the quiz needs 2); paid at boarding', () => {
  // Luxury holds Bigland (as-west + as-east); Business flies eu-west → as-east.
  let s = game(['af-north', 'eu-west'], 'luxury', 'business');
  s = go(s, { type: 'walk', to: 'as-west', citizenship: true });
  s = go(s, { type: 'walk', to: 'eu-north' });
  s = go(s, { type: 'walk', to: 'af-north' }); // granted; leaves
  s = go(s, { type: 'walk', to: 'eu-west' });
  s = pass(s);

  const trips = (st: GameState) => legalActions(st, map).filter((a) => a.type === 'board' || a.type === 'quiz').map((a) => a.type);
  other(s).points = 3; // ticket 2 + visa 2 = 4 needed
  assert.deepEqual(trips(s), ['quiz']);
  other(s).points = 1;
  assert.deepEqual(trips(s), []);
  other(s).points = 4;
  const citizen = me(s).points;
  s = go(s, { type: 'board', kind: 'airport', to: 'as-east' }); // Business: 0 travel turns
  assert.equal(other(s).area, 'as-east');
  assert.equal(other(s).points, 4 - 2 - VISA_PRICE + 2); // ticket, visa, new continent (Asia)
  assert.equal(me(s).points, citizen + VISA_PRICE);
});

test('citizenship granted during a trip: no visa on landing', () => {
  // The Backpacker sails eu-north → na-one (3 turns at sea); meanwhile Luxury becomes
  // the citizen of na-one and leaves. The citizenship came after boarding: no visa.
  let t = game(['eu-north', 'as-east'], 'backpacker', 'luxury');
  t = go(t, { type: 'quiz', kind: 'port', to: 'na-one' });
  t = go(t, { type: 'answer', choice: t.quiz!.question.correct }); // 3 turns at sea
  t = go(t, { type: 'walk', to: 'na-one', citizenship: true }); // Luxury takes na-one
  t = go(t, { type: 'travel' });
  t = go(t, { type: 'walk', to: 'as-east' }); // granted at the start of this turn; leaves
  t = go(t, { type: 'travel' });
  assert.deepEqual(other(t).citizenship, ['na-one']);
  t = pass(t);
  const points = me(t).points;
  const citizen = other(t).points;
  t = go(t, { type: 'travel' }); // lands: no visa, the citizenship came after boarding
  assert.equal(me(t).area, 'na-one');
  assert.equal(other(t).points, citizen);
  assert.ok(me(t).points >= points);
});

test('the test questions come from 3 different facts of the area', () => {
  let seed = 7;
  for (const area of ['france', 'japan', 'chile']) {
    const [questions, next] = makeExam(map30, area, 3, seed);
    seed = next;
    const facts = map30.facts![area];
    assert.equal(new Set(questions.map((q) => q.text)).size, 3);
    for (const q of questions) {
      const fact = facts.find((f) => f.question === q.text)!;
      assert.equal(q.options[q.correct], fact.right);
      assert.equal(q.options[1 - q.correct], fact.wrong);
    }
  }
});

test('the airline quiz asks about the destination, from its facts', () => {
  let seed = 3;
  for (let i = 0; i < 20; i++) {
    const [q, next] = makeQuestion(map30, 'japan', seed);
    seed = next;
    const fact = map30.facts!.japan.find((f) => f.question === q.text);
    assert.ok(fact, q.text);
    assert.equal(q.options[q.correct], fact.right);
  }
});

test('no citizenship question in the start area', () => {
  const s = startedGame(['eu-west', 'af-south'], 1, map);
  assert.equal(currentPlayer(s).exam, null);
  assert.equal(currentPlayer(s).askedCitizenship, false);
});
