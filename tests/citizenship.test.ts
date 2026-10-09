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
const canAsk = (s: GameState) => legalActions(s, map).some((a) => a.type === 'askCitizenship');
const ask = (s: GameState) => go(s, { type: 'askCitizenship' });

// The other player's turn: its first plain move (walk, trip or blocked), never a citizenship request.
function pass(s: GameState): GameState {
  return go(s, legalActions(s, map).find((a) => a.type !== 'askCitizenship')!);
}

// Answers the 3 test questions, `wrong` of them wrong (the first ones).
function answerTest(s: GameState, wrong: number): GameState {
  for (const [i, q] of me(s).exam!.questions.entries()) {
    const right = i >= wrong;
    s = go(s, { type: 'examAnswer', choice: right ? q.correct : ((1 - q.correct) as 0 | 1) });
  }
  return s;
}

// Task 14d (owner's rule): citizenship is asked in the area the player stands in, as a move of its own.
test('asking is a move of its own, in the area the player stands in; never in the home country', () => {
  let s = game(['eu-west', 'af-south'], 'backpacker');
  assert.equal(canAsk(s), false); // the home country
  s = go(s, { type: 'walk', to: 'eu-north' });
  s = pass(s);
  assert.equal(canAsk(s), true);
  s = go(s, { type: 'walk', to: 'eu-east' });
  s = pass(s);
  s = go(s, { type: 'walk', to: 'eu-north' }); // visited before: still possible
  s = pass(s);
  assert.equal(canAsk(s), true);
});

test('the home country is never asked for, nor another part of the same big country', () => {
  let s = game(['as-west', 'af-south'], 'luxury');
  assert.equal(canAsk(s), false);
  s = go(s, { type: 'walk', to: 'as-east' });
  s = pass(s);
  assert.equal(canAsk(s), false); // Bigland is one citizenship, and it holds the home country
});

test('the Digital Nomad can never ask for citizenship', () => {
  let s = game(['eu-west', 'af-south'], 'nomad');
  s = go(s, { type: 'walk', to: 'eu-north' });
  s = pass(s);
  assert.equal(canAsk(s), false);
});

test('all answers right: asking ends the turn, test next turn, granted and moves on turn 3', () => {
  let s = game(['eu-west', 'af-south'], 'backpacker');
  s = go(s, { type: 'walk', to: 'eu-north' });
  s = pass(s);
  s = ask(s); // turn 1: approved; the turn ends
  assert.equal(me(s).exam!.stage, 'test');
  assert.equal(me(s).askedCitizenship, true);
  assert.equal(me(s).exam!.questions.length, 3);
  assert.equal(currentPlayer(s).seat, other(s).seat);
  s = pass(s);

  assert.deepEqual(types(s), ['examAnswer']); // turn 2: the 3 questions, in one turn; stays
  assert.equal(me(s).exam!.study.length, 3); // the test map has no facts: a study line per question
  s = answerTest(s, 0);
  assert.equal(me(s).exam!.stage, 'result');
  assert.equal(me(s).citizenship, null);
  s = pass(s);

  assert.deepEqual(me(s).citizenship, ['eu-north']); // turn 3: granted, and moves
  assert.equal(me(s).exam!.stage, 'granted');
  assert.ok(types(s).includes('walk'));
  s = pass(s); // its first move
  assert.equal(me(s).exam, null);
});

test('one wrong answer of 3: still passed, granted on turn 3', () => {
  let s = game(['eu-west', 'af-south'], 'backpacker');
  s = go(s, { type: 'walk', to: 'eu-north' });
  s = pass(s);
  s = ask(s);
  s = pass(s);
  s = answerTest(s, 1);
  s = pass(s);

  assert.deepEqual(me(s).citizenship, ['eu-north']);
  assert.equal(me(s).exam!.stage, 'granted');
  assert.ok(types(s).includes('walk'));
});

test('two wrong answers of 3: no citizenship, moves on turn 3, and no second request', () => {
  let s = game(['eu-west', 'af-south'], 'backpacker');
  s = go(s, { type: 'walk', to: 'eu-north' });
  s = pass(s);
  s = ask(s);
  s = pass(s);
  s = answerTest(s, 2);
  s = pass(s);

  assert.equal(me(s).citizenship, null); // turn 3: refused, and moves
  assert.equal(me(s).exam!.stage, 'failed');
  assert.ok(types(s).includes('walk'));
  assert.equal(canAsk(s), false);
  s = pass(s); // its first move
  assert.equal(me(s).exam, null);
  assert.equal(me(s).citizenship, null);
  s = pass(s);
  assert.equal(canAsk(s), false); // the one request of the game is used up
});

test('Luxury: no test; granted at once, and the turn goes on', () => {
  let s = game(['eu-west', 'af-south'], 'luxury');
  s = go(s, { type: 'walk', to: 'eu-north' });
  s = pass(s);
  s = ask(s);
  assert.deepEqual(me(s).citizenship, ['eu-north']);
  assert.equal(me(s).exam!.stage, 'granted');
  assert.equal(currentPlayer(s).seat, me(s).seat);
  assert.ok(types(s).includes('walk'));
  s = go(s, { type: 'walk', to: 'eu-east' });
  assert.equal(me(s).exam, null);
});

test('Business: +3 when citizenship is granted', () => {
  let s = game(['eu-west', 'af-south'], 'business');
  s = go(s, { type: 'walk', to: 'eu-north' });
  s = pass(s);
  s = ask(s);
  s = pass(s);
  s = answerTest(s, 0);
  const before = me(s).points;
  s = pass(s);
  assert.equal(me(s).points, before + POINTS_BUSINESS_CITIZENSHIP);
});

test('only one request per game', () => {
  let s = game(['eu-west', 'af-south'], 'luxury');
  s = go(s, { type: 'walk', to: 'eu-north' });
  s = pass(s);
  s = ask(s);
  s = go(s, { type: 'walk', to: 'eu-east' });
  s = pass(s);
  assert.equal(canAsk(s), false);
});

test('one citizen per area: nobody else can ask there, also during the test', () => {
  let s = game(['eu-north', 'af-north'], 'backpacker');
  s = go(s, { type: 'walk', to: 'eu-east' });
  s = pass(s);
  s = ask(s);
  assert.equal(canAskCitizenship(s, map, other(s), 'eu-east'), false); // during the request
  s = pass(s);
  s = answerTest(s, 0);
  s = pass(s);
  assert.equal(canAskCitizenship(s, map, other(s), 'eu-east'), false); // held
});

test('a big country is one citizenship: every part is covered', () => {
  let s = game(['eu-east', 'af-south'], 'luxury');
  s = go(s, { type: 'walk', to: 'as-west' });
  s = pass(s);
  s = ask(s);
  assert.deepEqual(me(s).citizenship!.sort(), ['as-east', 'as-west']);
});

// Luxury holds Bigland (granted at once) and walks back to eu-east in the same turn.
function blandCitizen(): GameState {
  let s = game(['eu-east', 'af-south'], 'luxury', 'business');
  s = go(s, { type: 'walk', to: 'as-west' });
  s = go(s, { type: 'walk', to: 'af-north' });
  s = ask(s);
  return go(s, { type: 'walk', to: 'eu-east' });
}

test('visa: 2 points to the citizen each time another player enters; moving inside is free', () => {
  let s = blandCitizen();
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
  const s = blandCitizen();
  other(s).points = 1;
  assert.ok(!legalActions(s, map).some((a) => a.type === 'walk' && a.to === 'as-west'));
  other(s).points = 2;
  assert.ok(legalActions(s, map).some((a) => a.type === 'walk' && a.to === 'as-west'));
});

test('the citizen enters their own area for free', () => {
  let s = game(['eu-north', 'af-south'], 'luxury');
  s = go(s, { type: 'walk', to: 'eu-east' });
  s = pass(s);
  s = ask(s);
  s = go(s, { type: 'walk', to: 'eu-north' });
  s = pass(s);
  const before = me(s).points;
  s = go(s, { type: 'walk', to: 'eu-east' });
  assert.equal(me(s).points, before);
});

test('plane to a visa area: boarding needs the ticket + 2 (the quiz needs 2); paid at boarding', () => {
  // Luxury holds Bigland (as-west + as-east); Business flies eu-west → as-east.
  let s = game(['af-north', 'eu-west'], 'luxury', 'business');
  s = go(s, { type: 'walk', to: 'as-west' });
  s = go(s, { type: 'walk', to: 'eu-north' });
  s = ask(s); // granted at once
  s = go(s, { type: 'walk', to: 'af-north' }); // leaves in the same turn
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
  // The Backpacker sails eu-north → na-one (3 turns at sea); meanwhile Luxury becomes the citizen
  // of na-one. Since task 13 nobody can enter a booked area, so this happens only through a big
  // country (a citizenship of one part covers the others); here it is set by hand.
  let t = game(['eu-north', 'as-east'], 'backpacker', 'luxury');
  t = go(t, { type: 'quiz', kind: 'port', to: 'na-one' });
  t = go(t, { type: 'answer', choice: t.quiz!.question.correct }); // 3 turns at sea
  assert.ok(!legalActions(t, map).some((a) => a.type === 'walk' && a.to === 'na-one'), 'na-one is booked');
  other(t).citizenship = ['na-one'];
  t = pass(t);
  t = go(t, { type: 'travel' });
  t = pass(t);
  t = go(t, { type: 'travel' });
  t = pass(t);
  const points = me(t).points;
  const citizen = other(t).points;
  t = go(t, { type: 'travel' }); // lands: no visa, the citizenship came after boarding
  assert.equal(me(t).area, 'na-one');
  assert.equal(other(t).points, citizen);
  assert.ok(me(t).points >= points);
});

test('6 facts to read, in the area\'s order; the 3 questions come from 3 different ones of them', () => {
  let seed = 7;
  for (const area of ['france', 'japan', 'chile']) {
    const [{ questions, study }, next] = makeExam(map30, area, 3, 6, seed);
    seed = next;
    const facts = map30.facts![area];
    assert.equal(new Set(study).size, 6);
    const order = study.map((t) => facts.findIndex((f) => f.text === t));
    assert.ok(order.every((i, k) => i >= 0 && (k === 0 || i > order[k - 1])));
    assert.equal(new Set(questions.map((q) => q.text)).size, 3);
    for (const q of questions) {
      const fact = facts.find((f) => f.question === q.text)!;
      assert.ok(study.includes(fact.text));
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
