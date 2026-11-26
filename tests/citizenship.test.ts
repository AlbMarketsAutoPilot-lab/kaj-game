import assert from 'node:assert/strict';
import { test } from 'node:test';
import { VISA_PRICE } from '../src/engine/constants.ts';
import { apply, createGame, finalScore, legalActions, needsVisaTest } from '../src/engine/engine.ts';
import { areaChallenges, challengeStudyLine, makeExam, makeQuestion, VISA_CHALLENGE_TYPES } from '../src/engine/quiz.ts';
import { CHALLENGES } from '../src/challenges/challenges.ts';
import type { Action, GameMap, GameState, Profile } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { testMap, travelMap } from './fixtures/test-map.ts';
import { passVisaTest, seatOf, seats, startedGame } from './helpers.ts';

// Step 2.6 (owner): citizenship of the start country from turn 1 (not the Nomad), the Business's free
// 2nd citizenship, and the visa test on every entry into another player's country.
//
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

// Player 1 (first in turn order) gets `first`, player 2 gets `second`; start citizenships on.
function game(starts: string[], first: Profile, second: Profile): GameState {
  return startedGame(starts, 1, map, [first, second, 'luxury', 'nomad', 'backpacker', 'business'], false, false, true);
}

const go = (s: GameState, action: Action) => apply(s, map, action);
const me = (s: GameState) => seatOf(s, 0);
const other = (s: GameState) => seatOf(s, 1);
const types = (s: GameState) => [...new Set(legalActions(s, map).map((a) => a.type))].sort();
const can = (s: GameState, a: Action) => legalActions(s, map).some((b) => JSON.stringify(b) === JSON.stringify(a));
const pass = (s: GameState) => passVisaTest(s, map);
const fail = (s: GameState) => passVisaTest(s, map, true);
// The other player's turn: a move that ends it (a walk with no visa test, a paid trip or blocked;
// never the airline quiz, whose answer would come first).
function next(s: GameState): GameState {
  const ends = (a: Action) => (a.type === 'walk' && !needsVisaTest(s, seatOf(s, 1), a.to)) || a.type === 'blocked' || a.type === 'goHome';
  return go(s, legalActions(s, map).find(ends) ?? legalActions(s, map).find((a) => a.type === 'board')!);
}

// The Nomad (player 1) at eu-west, the Backpacker (player 2) a citizen of North Africa, standing in South Africa.
function visaGame(first: Profile = 'nomad'): GameState {
  const s = game(['eu-west', 'af-north'], first, first === 'backpacker' ? 'business' : 'backpacker');
  other(s).area = 'af-south';
  return s;
}

test('citizenship of the start country from turn 1, for everyone but the Nomad; a big country is the whole country', () => {
  const s = game(['eu-west', 'as-east'], 'nomad', 'backpacker');
  assert.equal(me(s).citizenship, null);
  assert.deepEqual(other(s).citizenship, ['as-west', 'as-east']);
  for (const profile of ['business', 'luxury', 'backpacker'] as Profile[]) {
    const t = game(['eu-west', 'af-north'], profile, 'nomad');
    assert.deepEqual(me(t).citizenship, ['eu-west'], profile);
    assert.equal(me(t).bought, null);
  }
});

test('one start per country: after a start in Russia West, no other player may start in Russia', () => {
  let s = createGame({ seats: seats(2), seed: 1 }, map30);
  s = apply(s, map30, { type: 'chooseProfile', profile: 'backpacker' });
  s = apply(s, map30, { type: 'chooseProfile', profile: 'nomad' });
  s = apply(s, map30, { type: 'chooseStart', area: 'russia-west' });
  const starts = legalActions(s, map30).map((a) => (a as { area: string }).area);
  assert.ok(starts.includes('japan'));
  for (const russia of ['russia-east', 'russia-far-east']) assert.ok(!starts.includes(russia), russia);
});

test('walking into a citizen\'s country: the visa test first; passed: the visa is paid and the player enters', () => {
  let s = visaGame();
  s = go(s, { type: 'walk', to: 'af-north' });
  assert.equal(me(s).area, 'eu-west', 'not yet entered');
  assert.deepEqual(types(s), ['visaAnswer']);
  assert.equal(s.visa!.questions.length, 3);
  assert.ok(s.visa!.study.length > 0);
  const before = other(s).points;
  s = pass(s);
  assert.equal(me(s).area, 'af-north');
  assert.equal(me(s).points, 3 - VISA_PRICE + 1 + 2);
  assert.equal(other(s).points, before + VISA_PRICE);
  assert.deepEqual(s.visaTested && { passed: s.visaTested.passed, right: s.visaTested.right }, { passed: true, right: 3 });
  assert.notEqual(s.turnOrder[s.current], me(s).seat, 'the turn ends');
});

test('2 of 3 right pass; fewer: nothing paid, no entry, the turn is used', () => {
  let s = go(visaGame(), { type: 'walk', to: 'af-north' });
  const q = s.visa!.questions;
  s = go(s, { type: 'visaAnswer', choice: (1 - q[0].correct) as 0 | 1 });
  s = go(s, { type: 'visaAnswer', choice: q[1].correct });
  s = go(s, { type: 'visaAnswer', choice: q[2].correct });
  assert.equal(me(s).area, 'af-north', '2 of 3 right: passed');

  const before = visaGame();
  s = fail(go(before, { type: 'walk', to: 'af-north' }));
  assert.equal(me(s).area, 'eu-west');
  assert.equal(me(s).points, 3);
  assert.equal(other(s).points, other(before).points);
  assert.equal(s.visaTested!.passed, false);
  assert.notEqual(s.turnOrder[s.current], me(s).seat, 'the turn is used');
});

test('the visa and the test on every entry; moving inside a big country is free; the citizen enters free', () => {
  let s = visaGame();
  other(s).area = 'eu-north';
  s = pass(go(s, { type: 'walk', to: 'af-north' }));
  s = go(s, { type: 'walk', to: 'eu-east' }); // player 2
  s = go(s, { type: 'walk', to: 'eu-west' }); // leaving is free
  s = go(s, { type: 'walk', to: 'eu-north' }); // player 2
  s = go(s, { type: 'walk', to: 'af-north' });
  assert.ok(s.visa, 'a second entry: a new test');

  // Bigland: the test and the visa once at the border, then free inside.
  let b = game(['eu-east', 'as-east'], 'nomad', 'backpacker');
  other(b).area = 'eu-north';
  b = next(pass(go(b, { type: 'walk', to: 'as-west' })));
  const points = me(b).points;
  b = go(b, { type: 'walk', to: 'as-east' });
  assert.equal(b.visa, null);
  assert.equal(me(b).area, 'as-east');
  assert.ok(me(b).points >= points, 'no visa inside the country');

  // The citizen walks into its own country with no test.
  let c = visaGame('backpacker');
  me(c).citizenship = ['af-north'];
  other(c).citizenship = null;
  c = go(c, { type: 'walk', to: 'af-north' });
  assert.equal(c.visa, null);
  assert.equal(me(c).area, 'af-north');
});

test('Luxury pays the visa with no test; the Business takes the test but never pays', () => {
  let s = go(visaGame('luxury'), { type: 'walk', to: 'af-north' });
  assert.equal(s.visa, null);
  assert.equal(me(s).area, 'af-north');
  assert.equal(me(s).points, 3 - VISA_PRICE + 1 + 2);

  let b = visaGame('business');
  me(b).points = 0;
  assert.ok(can(b, { type: 'walk', to: 'af-north' }), 'no visa to pay, so no money is needed');
  b = go(b, { type: 'walk', to: 'af-north' });
  assert.ok(b.visa, 'the Business takes the test');
  const before = other(b).points;
  b = pass(b);
  assert.equal(me(b).area, 'af-north');
  assert.equal(me(b).points, 0 + 1 + 2);
  assert.equal(other(b).points, before);
});

test('no money, no test: with fewer than 2 points the country can\'t be entered', () => {
  const s = visaGame();
  me(s).points = 1;
  assert.ok(!can(s, { type: 'walk', to: 'af-north' }));
});

test('plane: the ticket first, then the test; passed: ticket and visa together; failed: no trip, nothing paid', () => {
  // The Backpacker (player 2) holds Bigland and stands in North America.
  const start = () => { const s = game(['eu-west', 'as-east'], 'nomad', 'backpacker'); other(s).area = 'na-one'; return s; };
  let s = go(start(), { type: 'board', kind: 'airport', to: 'as-east' });
  assert.equal(me(s).points, 3, 'nothing paid before the test');
  s = pass(s);
  // A paid plane takes 0 turns (step 2.7): there at once (a part of Bigland 0, Asia +2).
  assert.equal(me(s).area, 'as-east');
  assert.equal(me(s).points, 3 - 1 - VISA_PRICE + 2);

  s = fail(go(start(), { type: 'board', kind: 'airport', to: 'as-east' }));
  assert.equal(me(s).travel, null);
  assert.equal(me(s).area, 'eu-west');
  assert.equal(me(s).points, 3);
});

test('airline quiz: a right answer, then the test; failed: no trip, and it is not a quiz try', () => {
  const start = () => { const s = game(['eu-west', 'as-east'], 'nomad', 'backpacker'); other(s).area = 'na-one'; return s; };
  let s = go(start(), { type: 'quiz', kind: 'airport', to: 'as-east' });
  s = go(s, { type: 'answer', choice: s.quiz!.question.correct });
  assert.ok(s.visa);
  s = fail(s);
  assert.equal(me(s).area, 'eu-west');
  assert.equal(me(s).quizWrong, 0);
  assert.equal(me(s).points, 3);

  // After the 3rd wrong answer (the forced paid trip): the test too; failed: no trip, the count starts again.
  let f = start();
  me(f).quizWrong = 2;
  f = go(f, { type: 'quiz', kind: 'airport', to: 'as-east' });
  f = go(f, { type: 'answer', choice: (1 - f.quiz!.question.correct) as 0 | 1 });
  assert.equal(f.visa?.via, 'forced');
  f = fail(f);
  assert.equal(me(f).area, 'eu-west');
  assert.equal(me(f).points, 3);
  assert.equal(me(f).quizWrong, 0);
});

test('the Business: one free 2nd citizenship where it stands; not its own, not a held one, not the Nomad\'s start country', () => {
  let s = game(['eu-west', 'af-north'], 'business', 'nomad');
  const buy: Action = { type: 'buyCitizenship' };
  assert.ok(!can(s, buy), 'its own country');
  s = next(go(s, { type: 'walk', to: 'eu-north' }));
  assert.ok(can(s, buy));
  const points = me(s).points;
  s = go(s, buy);
  assert.deepEqual(me(s).bought, ['eu-north']);
  assert.equal(me(s).points, points, 'free');
  assert.equal(s.turnOrder[s.current], me(s).seat, 'the turn goes on');
  assert.equal(finalScore(s, me(s)), me(s).points, 'not counted at the end');
  s = next(go(s, { type: 'walk', to: 'eu-east' }));
  assert.ok(!can(s, buy), 'only one');

  // The Nomad's start country is never sold; nor is a country someone holds.
  let n = game(['eu-west', 'af-north'], 'business', 'nomad');
  other(n).area = 'af-south';
  n = go(n, { type: 'walk', to: 'af-north' });
  n = next(n);
  assert.equal(me(n).area, 'af-north');
  assert.ok(!can(n, buy));
  const h = game(['eu-west', 'af-north'], 'business', 'backpacker');
  me(h).area = 'af-north';
  other(h).area = 'af-south';
  assert.ok(!can(h, buy));
});

test('a bought citizenship of a big country covers it all, and others pay the Business the visa there', () => {
  let s = game(['eu-east', 'af-south'], 'business', 'nomad');
  me(s).area = 'as-west';
  s = go(s, { type: 'buyCitizenship' });
  assert.deepEqual(me(s).bought, ['as-west', 'as-east']);
  s = go(s, { type: 'walk', to: 'af-north' });
  // The Nomad walks to West Asia: the test, then the visa to the Business.
  other(s).area = 'eu-east';
  const before = me(s).points;
  s = pass(go(s, { type: 'walk', to: 'as-west' }));
  assert.equal(other(s).area, 'as-west');
  assert.equal(me(s).points, before + VISA_PRICE);
});

test('the Digital Nomad never holds a citizenship and can\'t take one', () => {
  const s = game(['eu-west', 'af-north'], 'nomad', 'backpacker');
  assert.equal(me(s).citizenship, null);
  me(s).area = 'eu-north';
  assert.ok(!can(s, { type: 'buyCitizenship' }));
});

test('6 lines to read, in the area\'s order; the 3 questions come from 3 different ones of them', () => {
  let seed = 7;
  for (const area of ['france', 'japan', 'chile']) {
    const [{ questions, study }, next] = makeExam(map30, area, 3, 6, seed);
    seed = next;
    // The area's facts, then its test-only geography facts (step 2.3), then the challenges about its countries except
    // flags, each with its study line (step 2.12c).
    const challenges = areaChallenges(map30.areas.find((a) => a.id === area)!).filter((c) => VISA_CHALLENGE_TYPES.includes(c.type))
      .map((c) => ({ text: challengeStudyLine(c), question: c.question, right: c.options[c.correct], wrong: c.options[1 - c.correct] }));
    const facts = [...map30.facts![area], ...map30.examFacts![area], ...challenges];
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

test('the airline quiz asks about the destination, from its facts or the challenges about its countries', () => {
  // Step 2.1: the pool is the destination's facts plus the challenges about its countries.
  const japan = map30.areas.find((a) => a.id === 'japan')!;
  let seed = 3;
  for (let i = 0; i < 20; i++) {
    const [q, next] = makeQuestion(map30, 'japan', seed);
    seed = next;
    const fact = map30.facts!.japan.find((f) => f.question === q.text);
    const challenge = CHALLENGES.find((c) => c.id === q.id);
    assert.ok(fact || (challenge && japan.countries!.includes(challenge.country)), q.text);
    assert.equal(q.options[q.correct], fact ? fact.right : challenge!.options[challenge!.correct]);
  }
});

test('step 2.12c: every challenge but flags has a study line with its right answer; flags never come in the visa test', () => {
  for (const c of CHALLENGES.filter((x) => VISA_CHALLENGE_TYPES.includes(x.type))) {
    const line = challengeStudyLine(c);
    assert.ok(line.includes(c.options[c.correct]), `${c.id}: ${line}`);
    assert.ok(/^[A-Z].*\.$/.test(line) && !line.includes('?'), `${c.id}: ${line}`);
  }
  assert.ok(!VISA_CHALLENGE_TYPES.includes('flag'));
  const flags = new Set(CHALLENGES.filter((c) => c.type === 'flag').map((c) => c.id));
  let seed = 3;
  for (let k = 0; k < 40; k++) {
    const [{ questions }, next] = makeExam(map30, 'france', 3, 6, seed);
    seed = next;
    for (const q of questions) assert.ok(!flags.has(q.id!), q.text);
  }
});
