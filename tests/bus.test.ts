import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, businessAt, destinations, legalActions, mapBusinesses } from '../src/engine/engine.ts';
import { PROFILES } from '../src/engine/constants.ts';
import { robotAction } from '../src/engine/normal-robot.ts';
import { stuckProblems } from '../src/engine/stuck-check.ts';
import type { Action, GameState, Profile } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { seatOf, startedGame } from './helpers.ts';

// The bus (task 18, owner's rules): one bus stop, in Mongolia, one way to Siberia or China West.

const RUSSIA = ['russia-west', 'russia-east', 'russia-far-east'];
const CHINA = ['china-west', 'china-east'];

// Player 1 (first in turn order) gets `profile`, starts in West Africa (Africa), and stands in
// `from` with `points`; player 2 starts in Iberia.
function game(profile: Profile, from = 'mongolia', points = 10): GameState {
  const s = startedGame(['west-africa', 'iberia'], 1, map30, [profile, ...PROFILES]);
  seatOf(s, 0).area = from;
  seatOf(s, 0).points = points;
  return s;
}

const go = (s: GameState, action: Action) => apply(s, map30, action);
const me = (s: GameState) => seatOf(s, 0);
const other = (s: GameState) => seatOf(s, 1);

const buses = (s: GameState) =>
  legalActions(s, map30)
    .flatMap((a) => ((a.type === 'board' || a.type === 'quiz') && a.kind === 'bus' ? [`${a.type} ${a.to}`] : []))
    .sort();

function answer(s: GameState, right: boolean): GameState {
  const correct = s.quiz!.question.correct;
  return go(s, { type: 'answer', choice: right ? correct : ((1 - correct) as 0 | 1) });
}

// Player 2's turn: a plain walk, so the trip goes on.
function pass(s: GameState): GameState {
  const actions = legalActions(s, map30);
  return go(s, actions.find((a) => a.type === 'walk') ?? actions.find((a) => a.type !== 'buy' && a.type !== 'askCitizenship')!);
}

// Board (Nomad: pay 1) or win the quiz (Backpacker), then ride the 1 travel turn.
function ride(s: GameState, to: string): GameState {
  if (me(s).profile === 'nomad') s = go(s, { type: 'board', kind: 'bus', to });
  else s = answer(go(s, { type: 'quiz', kind: 'bus', to }), true);
  assert.deepEqual(me(s).travel, { kind: 'bus', from: 'mongolia', to, turnsLeft: 1 });
  s = pass(s);
  assert.deepEqual(legalActions(s, map30), [{ type: 'travel' }, { type: 'travel', challenge: true }]);
  return go(s, { type: 'travel' });
}

test('routes: from Mongolia only, one way to Siberia or China West', () => {
  assert.deepEqual(destinations(map30, 'mongolia', 'bus', 'nomad').sort(), ['china-west', 'russia-east']);
  assert.deepEqual(destinations(map30, 'russia-east', 'bus', 'nomad'), []);
  assert.deepEqual(destinations(map30, 'china-west', 'bus', 'backpacker'), []);
  assert.deepEqual(buses(game('nomad', 'russia-east')), []);
});

test('only the Nomad (ticket 1 or quiz) and the Backpacker (quiz only) take the bus', () => {
  assert.deepEqual(buses(game('nomad')), ['board china-west', 'board russia-east', 'quiz china-west', 'quiz russia-east']);
  assert.deepEqual(buses(game('backpacker')), ['quiz china-west', 'quiz russia-east']);
  assert.deepEqual(buses(game('business', 'mongolia', 20)), []);
  assert.deepEqual(buses(game('luxury', 'mongolia', 20)), []);
  let s = go(game('nomad'), { type: 'board', kind: 'bus', to: 'china-west' });
  assert.deepEqual(s.payments, [{ reason: 'ticket', from: me(s).seat, to: null, amount: 1, area: 'mongolia', business: 'bus' }]);
  s = game('nomad', 'mongolia', 0);
  assert.deepEqual(buses(s), ['quiz china-west', 'quiz russia-east']);
});

test('bus to Siberia: all of Russia visited, +5 once; Asia counts, Europe does not', () => {
  const s = ride(game('nomad'), 'russia-east');
  assert.equal(me(s).area, 'russia-east');
  for (const id of RUSSIA) assert.ok(me(s).visitedAreas.includes(id), id);
  assert.deepEqual(me(s).visitedContinents, ['Africa', 'Asia']);
  // 10 − 1 ticket + 1 Nomad bus turn + 5 Russia + 2 Asia.
  assert.equal(me(s).points, 17);
});

test('bus to China West: both parts of China visited, +3', () => {
  const s = ride(game('backpacker'), 'china-west');
  for (const id of CHINA) assert.ok(me(s).visitedAreas.includes(id), id);
  // 10 + 3 China + 2 Asia (free quiz ticket, no Nomad bonus).
  assert.equal(me(s).points, 15);
});

test('parts visited before: the bus completes the country with the full +5 once', () => {
  // Siberia itself visited before (Russia West and the Far East not).
  let s = game('backpacker');
  me(s).visitedAreas.push('russia-east');
  me(s).visitedContinents.push('Asia');
  s = ride(s, 'russia-east');
  for (const id of RUSSIA) assert.ok(me(s).visitedAreas.includes(id), id);
  assert.equal(me(s).points, 15);
  // Russia West visited before.
  s = game('backpacker');
  me(s).visitedAreas.push('russia-west');
  me(s).visitedContinents.push('Asia');
  s = ride(s, 'russia-east');
  assert.equal(me(s).points, 15);
  // Already complete: nothing more (Asia already counted).
  s = game('backpacker');
  me(s).visitedAreas.push(...RUSSIA);
  me(s).visitedContinents.push('Asia');
  s = ride(s, 'russia-east');
  assert.equal(me(s).points, 10);
});

test('booth: one bus ticket booth, in Mongolia, 2 points, anyone may buy; the ticket goes to its owner', () => {
  assert.deepEqual(mapBusinesses(map30).filter((b) => b.kind === 'bus').map((b) => b.area), ['mongolia']);
  let s = game('luxury');
  s = go(s, { type: 'buy', business: 'bus' });
  assert.equal(me(s).points, 8);
  s = game('nomad');
  businessAt(s, 'mongolia', 'bus')!.owner = other(s).seat;
  const before = other(s).points;
  s = go(s, { type: 'board', kind: 'bus', to: 'russia-east' });
  assert.equal(other(s).points, before + 1);
});

test('fees and booked areas as usual: the visa is paid on boarding; no bus to a booked area', () => {
  let s = game('nomad');
  other(s).citizenship = [...RUSSIA];
  s = go(s, { type: 'board', kind: 'bus', to: 'russia-east' });
  assert.equal(me(s).points, 10 - 1 - 2);
  s = game('nomad');
  other(s).area = null;
  other(s).travel = { kind: 'airport', from: 'japan', to: 'china-west', turnsLeft: 1 };
  assert.deepEqual(buses(s), ['board russia-east', 'quiz russia-east']);
});

test('3 wrong quiz answers: the Nomad pays the 1-point bus ticket; the Backpacker goes home', () => {
  let s = game('nomad');
  me(s).quizWrong = 2;
  s = answer(go(s, { type: 'quiz', kind: 'bus', to: 'china-west' }), false);
  assert.equal(me(s).travel?.kind, 'bus');
  assert.equal(me(s).points, 9);
  s = game('backpacker');
  me(s).quizWrong = 2;
  s = answer(go(s, { type: 'quiz', kind: 'bus', to: 'china-west' }), false);
  assert.equal(me(s).area, 'west-africa');
});

test('the stuck-state checker leaves the bus out', () => {
  const noBus = { ...map30, routes: (map30.routes ?? []).filter((r) => r.kind !== 'bus') };
  assert.deepEqual(stuckProblems(map30), stuckProblems(noBus));
});

test('the Nomad robot takes the bus for Russia; Business and Luxury robots never do', () => {
  let s = game('nomad');
  businessAt(s, 'mongolia', 'bus')!.owner = other(s).seat;
  me(s).askedCitizenship = true;
  me(s).visitedContinents.push('Asia');
  me(s).visitedAreas.push('mongolia', 'china-west', 'china-east');
  const [action] = robotAction(s, map30, 1, 'hard');
  assert.ok(action.type === 'quiz' || action.type === 'board');
  assert.deepEqual([(action as { kind: string }).kind, (action as { to: string }).to], ['bus', 'russia-east']);
  for (const profile of ['business', 'luxury'] as const) {
    s = game(profile, 'mongolia', 20);
    for (let seed = 1; seed < 20; seed++) {
      const [a] = robotAction(s, map30, seed, 'hard');
      assert.ok(!('kind' in a && a.kind === 'bus'), JSON.stringify(a));
    }
  }
});
