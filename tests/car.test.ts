import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, businessAt, destinations, hitchhikeStops, legalActions, mapBusinesses } from '../src/engine/engine.ts';
import { PROFILES } from '../src/engine/constants.ts';
import type { Action, GameState, Profile } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { map50 } from '../src/maps/map50.ts';
import { seatOf, startedGame } from './helpers.ts';

// The car (task 19, owner's rules): a car rental in Mexico, one way to USA West or USA East.
// Nomad, Business and Luxury pay 1 (no quiz); the Backpacker hitchhikes, and a car stops only
// when it arrived in Mexico on an even round (a secret). The USA's points at once, like the bus.

const USA = ['usa-west', 'alaska', 'usa-east'];

// Player 1 (first in turn order) gets `profile`, starts in West Africa, and stands in `from`
// with `points`, having arrived there on round `arrived`; player 2 starts in Iberia.
function game(profile: Profile, from = 'mexico', points = 10, arrived = 2): GameState {
  const s = startedGame(['west-africa', 'iberia'], 1, map30, [profile, ...PROFILES]);
  seatOf(s, 0).area = from;
  seatOf(s, 0).points = points;
  seatOf(s, 0).arrivedRound = arrived;
  return s;
}

const go = (s: GameState, action: Action) => apply(s, map30, action);
const me = (s: GameState) => seatOf(s, 0);

const cars = (s: GameState) =>
  legalActions(s, map30)
    .flatMap((a) => ((a.type === 'board' || a.type === 'quiz') && a.kind === 'car' ? [`${a.type} ${a.to}`] : a.type === 'hitchhike' ? [`hitchhike ${a.to}`] : []))
    .sort();

// Player 2's turn: a plain walk, so the trip goes on.
function pass(s: GameState): GameState {
  const actions = legalActions(s, map30);
  return go(s, actions.find((a) => a.type === 'walk') ?? actions.find((a) => a.type !== 'buy' && a.type !== 'askCitizenship')!);
}

test('routes: from Mexico only, one way to USA West or USA East, on both maps', () => {
  for (const map of [map30, map50]) {
    assert.deepEqual(destinations(map, 'mexico', 'car', 'business').sort(), ['usa-east', 'usa-west']);
    assert.deepEqual(destinations(map, 'usa-west', 'car', 'nomad'), []);
    assert.deepEqual(destinations(map, 'usa-east', 'car', 'luxury'), []);
    assert.deepEqual(mapBusinesses(map).filter((b) => b.kind === 'car').map((b) => b.area), ['mexico']);
  }
});

test('Nomad, Business and Luxury rent the car for 1 point, never by quiz', () => {
  for (const profile of ['nomad', 'business', 'luxury'] as const) {
    assert.deepEqual(cars(game(profile)), ['board usa-east', 'board usa-west'], profile);
    assert.deepEqual(cars(game(profile, 'mexico', 0)), [], `${profile} with 0 points`);
    const s = go(game(profile), { type: 'board', kind: 'car', to: 'usa-east' });
    assert.deepEqual(s.payments, [{ reason: 'ticket', from: me(s).seat, to: null, amount: 1, area: 'mexico', business: 'car' }]);
    assert.deepEqual(me(s).travel, { kind: 'car', from: 'mexico', to: 'usa-east', turnsLeft: 1 });
  }
});

test('the rent goes to the owner of the car rental (2 points to buy)', () => {
  let s = game('business');
  s = go(s, { type: 'buy', business: 'car' });
  assert.equal(me(s).points, 8);
  assert.equal(businessAt(s, 'mexico', 'car')!.owner, me(s).seat);
  s = game('nomad');
  businessAt(s, 'mexico', 'car')!.owner = seatOf(s, 1).seat;
  const before = seatOf(s, 1).points;
  s = go(s, { type: 'board', kind: 'car', to: 'usa-west' });
  assert.equal(seatOf(s, 1).points, before + 1);
});

test('car to USA West: the USA\'s +5 at once without Alaska, only USA West marked visited', () => {
  let s = go(game('business'), { type: 'board', kind: 'car', to: 'usa-west' });
  s = pass(s);
  const before = me(s).points;
  s = go(s, { type: 'travel' });
  assert.equal(me(s).area, 'usa-west');
  assert.deepEqual(USA.filter((id) => me(s).visitedAreas.includes(id)), ['usa-west']);
  assert.deepEqual(me(s).bigCountries, ['United States']);
  assert.ok(me(s).points - before >= 5);
});

test('the Backpacker hitchhikes: free, and a car stops after arriving on an even round', () => {
  assert.deepEqual(cars(game('backpacker')), ['hitchhike usa-east', 'hitchhike usa-west']);
  const s = go(game('backpacker', 'mexico', 0, 4), { type: 'hitchhike', to: 'usa-west' });
  assert.deepEqual(s.hitchhiked, { seat: me(s).seat, to: 'usa-west', stopped: true });
  assert.deepEqual(s.payments, []);
  assert.equal(me(s).points, 0);
  assert.deepEqual(me(s).travel, { kind: 'car', from: 'mexico', to: 'usa-west', turnsLeft: 1 });
  assert.notEqual(s.turnOrder[s.current], me(s).seat);
});

test('no car stops after an odd round: nothing happens, no second try, the player must move', () => {
  let s = go(game('backpacker', 'mexico', 3, 3), { type: 'hitchhike', to: 'usa-east' });
  assert.deepEqual(s.hitchhiked, { seat: me(s).seat, to: 'usa-east', stopped: false });
  assert.equal(me(s).area, 'mexico');
  assert.equal(me(s).travel, null);
  assert.equal(me(s).points, 3);
  assert.equal(s.turnOrder[s.current], me(s).seat); // still its turn
  assert.deepEqual(cars(s), []);
  const moves = legalActions(s, map30).filter((a) => a.type === 'walk').map((a) => (a as { to: string }).to).sort();
  assert.ok(moves.length > 0);
  assert.ok(!legalActions(s, map30).some((a) => a.type === 'blocked'));
  s = go(s, { type: 'walk', to: moves[0] });
  assert.notEqual(me(s).area, 'mexico');
});

test('the arrival round: walking in sets it, the start area counts as round 1', () => {
  let s = game('backpacker', 'central-america', 10, 1);
  s.round = 6;
  s = go(s, { type: 'walk', to: 'mexico' });
  assert.equal(me(s).arrivedRound, 6);
  assert.equal(hitchhikeStops(me(s)), true);
  s = startedGame(['mexico', 'iberia'], 1, map30, ['backpacker', ...PROFILES]);
  assert.equal(seatOf(s, 0).arrivedRound, 1);
  assert.equal(hitchhikeStops(seatOf(s, 0)), false);
});

test('robots in Mexico: a car or a walk, never stuck after a failed hitchhike', async () => {
  const { robotAction } = await import('../src/engine/normal-robot.ts');
  for (const profile of PROFILES) {
    for (const arrived of [1, 2]) {
      let s = game(profile, 'mexico', 6, arrived);
      let seed = 7;
      for (let i = 0; i < 6 && s.turnOrder[s.current] === me(s).seat; i++) {
        const [a, next] = robotAction(s, map30, seed);
        seed = next;
        s = go(s, a);
      }
      assert.notEqual(s.turnOrder[s.current], me(s).seat, `${profile} arrived ${arrived}`);
    }
  }
});
