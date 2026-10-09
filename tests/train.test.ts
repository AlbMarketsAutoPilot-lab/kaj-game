import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, businessAt, destinations, legalActions, mapBusinesses } from '../src/engine/engine.ts';
import { PROFILES } from '../src/engine/constants.ts';
import { robotAction } from '../src/engine/normal-robot.ts';
import { stuckProblems } from '../src/engine/stuck-check.ts';
import type { Action, GameState, Profile } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { seatOf, startedGame } from './helpers.ts';

// The train (task 17, owner's rules): France <-> Russia West and France <-> Turkey, 30-turn map.

// Player 1 (first in turn order) gets `profile` and starts in `from`; player 2 starts in West Africa.
function game(profile: Profile, from = 'france', points = 10): GameState {
  const s = startedGame(['iberia', 'west-africa'], 1, map30, [profile, ...PROFILES]);
  seatOf(s, 0).area = from;
  seatOf(s, 0).points = points;
  return s;
}

const go = (s: GameState, action: Action) => apply(s, map30, action);
const me = (s: GameState) => seatOf(s, 0);
const other = (s: GameState) => seatOf(s, 1);

// Train moves only, as "type to".
const trains = (s: GameState) =>
  legalActions(s, map30)
    .flatMap((a) => ((a.type === 'board' || a.type === 'quiz') && a.kind === 'station' ? [`${a.type} ${a.to}`] : []))
    .sort();

function answer(s: GameState, right: boolean): GameState {
  const correct = s.quiz!.question.correct;
  return go(s, { type: 'answer', choice: right ? correct : ((1 - correct) as 0 | 1) });
}

// Player 2's turn: a plain walk (never a purchase), so the trip goes on.
function pass(s: GameState): GameState {
  const actions = legalActions(s, map30);
  return go(s, actions.find((a) => a.type === 'walk') ?? actions.find((a) => a.type !== 'buy' && a.type !== 'askCitizenship')!);
}

test('routes: in France a choice of Russia West or Turkey; from either, only back to France', () => {
  assert.deepEqual(destinations(map30, 'france', 'station', 'business').sort(), ['russia-west', 'turkey-caucasus']);
  assert.deepEqual(destinations(map30, 'russia-west', 'station', 'business'), ['france']);
  assert.deepEqual(destinations(map30, 'turkey-caucasus', 'station', 'nomad'), ['france']);
  assert.deepEqual(trains(game('business')), ['board russia-west', 'board turkey-caucasus', 'quiz russia-west', 'quiz turkey-caucasus']);
  assert.deepEqual(trains(game('business', 'russia-west')), ['board france', 'quiz france']);
  assert.deepEqual(trains(game('nomad', 'turkey-caucasus')), ['board france', 'quiz france']);
});

test('Luxury can never take the train', () => {
  for (const area of ['france', 'russia-west', 'turkey-caucasus']) {
    assert.deepEqual(destinations(map30, area, 'station', 'luxury'), []);
    assert.deepEqual(trains(game('luxury', area, 20)), []);
  }
});

test('the Backpacker never pays: the quiz only', () => {
  assert.deepEqual(trains(game('backpacker')), ['quiz russia-west', 'quiz turkey-caucasus']);
});

test('ticket 2 for Business and for the Nomad; no "pay" option with fewer points', () => {
  for (const profile of ['business', 'nomad'] as const) {
    let s = game(profile);
    s = go(s, { type: 'board', kind: 'station', to: 'turkey-caucasus' });
    assert.equal(me(s).points, 8);
    assert.deepEqual(s.payments, [{ reason: 'ticket', from: me(s).seat, to: null, amount: 2, area: 'france', business: 'train' }]);
    assert.deepEqual(trains(game(profile, 'france', 1)), ['quiz russia-west', 'quiz turkey-caucasus']);
  }
});

test('one travel turn for every profile, with a challenge offered; the Nomad gets +1', () => {
  for (const profile of ['business', 'nomad', 'backpacker'] as const) {
    let s = game(profile);
    s = go(s, { type: 'quiz', kind: 'station', to: 'turkey-caucasus' });
    s = answer(s, true); // free ticket
    assert.deepEqual(me(s).travel, { kind: 'station', from: 'france', to: 'turkey-caucasus', turnsLeft: 1 });
    assert.equal(me(s).area, null);
    s = pass(s);
    assert.deepEqual(legalActions(s, map30), [{ type: 'travel' }, { type: 'travel', challenge: true }]);
    s = go(s, { type: 'travel' });
    assert.equal(me(s).area, 'turkey-caucasus');
    assert.equal(me(s).travel, null);
    // 10 + new area 1 + new continent (Asia) 2, and the Nomad's train turn +1.
    assert.equal(me(s).points, 13 + (profile === 'nomad' ? 1 : 0), profile);
  }
});

test('booths: 3 train ticket booths at 2 points; the ticket goes to the departure booth owner', () => {
  const booths = mapBusinesses(map30).filter((b) => b.kind === 'train').map((b) => b.area).sort();
  assert.deepEqual(booths, ['france', 'russia-west', 'turkey-caucasus']);
  // Luxury can't ride, but may buy a booth (owner's answer).
  let s = game('luxury');
  assert.ok(legalActions(s, map30).some((a) => a.type === 'buy' && a.business === 'train'));
  s = go(s, { type: 'buy', business: 'train' });
  assert.equal(me(s).points, 8);
  assert.equal(businessAt(s, 'france', 'train')!.owner, me(s).seat);
  // Player 2 (Business) owns the France booth: player 1's ticket goes to them.
  s = game('nomad');
  businessAt(s, 'france', 'train')!.owner = other(s).seat;
  const before = other(s).points;
  s = go(s, { type: 'board', kind: 'station', to: 'russia-west' });
  assert.equal(other(s).points, before + 2);
  assert.equal(s.payments[0].to, other(s).seat);
  // The booth at the other end earns nothing from this trip.
  s = game('nomad');
  businessAt(s, 'russia-west', 'train')!.owner = other(s).seat;
  s = go(s, { type: 'board', kind: 'station', to: 'russia-west' });
  assert.equal(s.payments[0].to, null);
});

test('fees: the visa is paid on boarding, and with no money for it there is no train', () => {
  let s = game('business');
  other(s).citizenship = ['turkey-caucasus'];
  const before = other(s).points;
  s = go(s, { type: 'board', kind: 'station', to: 'turkey-caucasus' });
  assert.equal(me(s).points, 10 - 2 - 2);
  assert.equal(other(s).points, before + 2);
  // 1 point: neither the visa nor the quiz trip to Turkey; Russia West is still open.
  s = game('business', 'france', 1);
  other(s).citizenship = ['turkey-caucasus'];
  assert.deepEqual(trains(s), ['quiz russia-west']);
});

test('booked areas: no train to an area someone is travelling to', () => {
  const s = game('business');
  other(s).area = null;
  other(s).travel = { kind: 'airport', from: 'arabia', to: 'turkey-caucasus', turnsLeft: 1 };
  assert.deepEqual(trains(s), ['board russia-west', 'quiz russia-west']);
});

test('3 wrong quiz answers: Business and Nomad pay the 2-point train ticket; the Backpacker goes home', () => {
  for (const profile of ['business', 'nomad', 'backpacker'] as const) {
    let s = game(profile);
    me(s).quizWrong = 2;
    s = go(s, { type: 'quiz', kind: 'station', to: 'russia-west' });
    s = answer(s, false);
    if (profile === 'backpacker') {
      assert.equal(me(s).travel, null);
      assert.equal(me(s).area, 'iberia');
    } else {
      assert.equal(me(s).travel?.kind, 'station');
      assert.equal(me(s).points, 8, profile);
    }
  }
});

test('the stuck-state checker leaves the train out: the map must work without it (Luxury)', () => {
  const noTrain = { ...map30, routes: (map30.routes ?? []).filter((r) => r.kind !== 'station') };
  assert.deepEqual(stuckProblems(map30), stuckProblems(noTrain));
  assert.deepEqual(stuckProblems(map30), []);
});

test('the robot takes the train when it gains a new continent, and Luxury never does', () => {
  // A Business robot in France with Turkey (Asia, new) one train ride away.
  // Nothing to buy or ask for, every neighbour already visited.
  let s = game('business');
  businessAt(s, 'france', 'train')!.owner = other(s).seat;
  me(s).askedCitizenship = true;
  me(s).visitedAreas.push('central-europe', 'italy', 'uk-ireland', 'russia-west');
  const [action] = robotAction(s, map30, 1, 'hard');
  assert.deepEqual(action, { type: 'quiz', kind: 'station', to: 'turkey-caucasus' });
  s = game('luxury', 'france', 20);
  for (let seed = 1; seed < 30; seed++) {
    const [a] = robotAction(s, map30, seed, 'hard');
    assert.ok(!('kind' in a && a.kind === 'station'), JSON.stringify(a));
  }
});
