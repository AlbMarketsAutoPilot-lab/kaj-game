import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BUSINESS_PRICE, GO_HOME_TURNS, TOUR_FEE, VISA_PRICE } from '../src/engine/constants.ts';
import { apply, businessAt, finalScore, legalActions, mapBusinesses, rank } from '../src/engine/engine.ts';
import type { Action, BusinessKind, GameMap, GameState, Player, Profile } from '../src/engine/types.ts';
import { testMap, travelMap } from './fixtures/test-map.ts';
import { seatOf, startedGame } from './helpers.ts';

// The travel test map with two wonders: West Asia and North America.
//   eu-north — eu-east — as-west⭐ — as-east — na-one⭐       ✈️ eu-west ↔ as-east ↔ af-south
//      |      /            |                                 ⛴️ eu-north ↔ na-one
//   eu-west — af-north ----+
//                 |
//              af-south
const map: GameMap = {
  ...travelMap,
  id: 'test-business',
  areas: testMap.areas.map((a) => (a.id === 'as-west' || a.id === 'na-one' ? { ...a, wonder: true } : a)),
};

function game(starts: string[], profiles: Profile[] = ['business', 'luxury', 'nomad', 'backpacker']): GameState {
  return startedGame(starts, 1, map, profiles);
}

const go = (s: GameState, action: Action) => apply(s, map, action);
const p1 = (s: GameState) => seatOf(s, 0);
const p2 = (s: GameState) => seatOf(s, 1);
const buys = (s: GameState) => legalActions(s, map).filter((a) => a.type === 'buy');
const owner = (s: GameState, area: string, kind: BusinessKind) => businessAt(s, area, kind)!.owner;
const own = (s: GameState, area: string, kind: BusinessKind, p: Player) => { businessAt(s, area, kind)!.owner = p.seat; };
const canWalk = (s: GameState, to: string) => legalActions(s, map).some((a) => a.type === 'walk' && a.to === to);

// The current player's first plain move (never a purchase or a citizenship request).
function pass(s: GameState): GameState {
  return go(s, legalActions(s, map).find((a) => a.type !== 'buy' && !('citizenship' in a && a.citizenship))!);
}

test('the map has guided tours at each wonder, an airline at each airport and a ferry agency at each port', () => {
  const list = mapBusinesses(map).map((b) => `${b.kind} ${b.area}`).sort();
  assert.deepEqual(list, ['airline af-south', 'airline as-east', 'airline eu-west', 'ferry eu-north', 'ferry na-one', 'tours as-west', 'tours na-one']);
  assert.deepEqual(BUSINESS_PRICE, { tours: 2, airline: 3, ferry: 2 });
});

test('buying: the player standing there may buy; it costs the price and the turn goes on', () => {
  let s = game(['as-west', 'eu-west']); // a start area counts as arrived
  assert.equal(p1(s).points, 3);
  assert.deepEqual(buys(s), [{ type: 'buy', business: 'tours' }]);
  s = go(s, { type: 'buy', business: 'tours' });
  assert.equal(owner(s, 'as-west', 'tours'), p1(s).seat);
  assert.equal(p1(s).points, 1);
  assert.deepEqual(s.payments, [{ reason: 'buy', from: p1(s).seat, to: null, amount: 2, area: 'as-west', business: 'tours' }]);
  // Still the same player's turn, now without the buy option.
  assert.equal(s.turnOrder[s.current], p1(s).seat);
  assert.deepEqual(buys(s), []);
  s = go(s, { type: 'walk', to: 'as-east' });
  assert.equal(s.turnOrder[s.current], p2(s).seat);
});

test('buying needs the full price, and nobody can buy what someone owns', () => {
  let s = game(['af-south', 'eu-west']);
  p1(s).points = 2;
  assert.deepEqual(buys(s), []); // the airline costs 3
  p1(s).points = 3;
  assert.deepEqual(buys(s), [{ type: 'buy', business: 'airline' }]);
  own(s, 'af-south', 'airline', p2(s));
  assert.deepEqual(buys(s), []);
});

test('first to arrive may buy; if they leave without buying, the next player who arrives may buy', () => {
  let s = game(['as-west', 'eu-west']);
  s = go(s, { type: 'walk', to: 'as-east' }); // first there, did not buy
  s = go(s, { type: 'walk', to: 'af-north' });
  s = go(s, { type: 'walk', to: 'na-one' });
  s = go(s, { type: 'walk', to: 'as-west' });
  s = pass(s);
  assert.deepEqual(buys(s), [{ type: 'buy', business: 'tours' }]);
});

test('tour fee: 1 point to the owner each time another player enters; the owner enters free', () => {
  let s = game(['as-west', 'eu-west']);
  s = go(s, { type: 'buy', business: 'tours' });
  s = go(s, { type: 'walk', to: 'as-east' });
  s = go(s, { type: 'walk', to: 'af-north' });
  s = go(s, { type: 'walk', to: 'na-one' });
  const before = p2(s).points;
  const owners = p1(s).points;
  s = go(s, { type: 'walk', to: 'as-west' });
  // −1 tour fee, then +1 area +1 wonder +2 new continent.
  assert.equal(p2(s).points, before - TOUR_FEE + 4);
  assert.equal(p1(s).points, owners + TOUR_FEE);
  assert.deepEqual(s.payments, [{ reason: 'tour', from: p2(s).seat, to: p1(s).seat, amount: 1, area: 'as-west' }]);
  // The owner walks back into their own wonder for free.
  s = go(s, { type: 'walk', to: 'as-east' });
  s = go(s, { type: 'walk', to: 'eu-east' });
  const mine = p1(s).points;
  s = go(s, { type: 'walk', to: 'as-west' });
  assert.equal(p1(s).points, mine);
  assert.deepEqual(s.payments, []);
});

test('strict fees: without the tour fee (or visa + tour fee) the area cannot be entered', () => {
  const s = game(['as-east', 'af-north']);
  own(s, 'as-west', 'tours', p1(s));
  s.current = 1; // p2's turn, in af-north next to as-west
  p2(s).points = 0;
  assert.ok(!canWalk(s, 'as-west'));
  p2(s).points = 1;
  assert.ok(canWalk(s, 'as-west'));
  // Also a citizenship there: visa 2 + tour fee 1 = 3.
  p1(s).citizenship = ['as-west'];
  p2(s).points = 2;
  assert.ok(!canWalk(s, 'as-west'));
  p2(s).points = 3;
  const after = go(s, { type: 'walk', to: 'as-west' });
  assert.equal(p1(after).points, p1(s).points + VISA_PRICE + TOUR_FEE);
  assert.deepEqual(after.payments.map((p) => p.reason), ['visa', 'tour']);
});

test('tickets go to the owner of the departure airport; the owner pays themselves', () => {
  let s = game(['eu-west', 'af-south']); // p1 Business (ticket 2), p2 Luxury (ticket 3)
  own(s, 'eu-west', 'airline', p2(s));
  const mine = p1(s).points;
  const theirs = p2(s).points;
  s = go(s, { type: 'board', kind: 'airport', to: 'as-east' }); // Business: lands at once
  assert.equal(p1(s).points, mine - 2 + 1 + 2); // ticket, then +1 area +2 Asia
  assert.equal(p2(s).points, theirs + 2);
  assert.deepEqual(s.payments, [{ reason: 'ticket', from: p1(s).seat, to: p2(s).seat, amount: 2, area: 'eu-west', business: 'airline' }]);
  // The owner flies from their own airport: the ticket goes back to themselves.
  p2(s).points = 10;
  s = go(s, { type: 'buy', business: 'airline' });
  s = go(s, { type: 'board', kind: 'airport', to: 'eu-west' });
  assert.equal(p2(s).points, 7 + 1 + 2); // ticket paid and received; +1 area +2 Europe
  assert.deepEqual(s.payments, [{ reason: 'ticket', from: p2(s).seat, to: p2(s).seat, amount: 3, area: 'af-south', business: 'airline' }]);
});

test('free quiz ticket pays nobody; the 3rd wrong answer pays the owner', () => {
  let s = game(['eu-west', 'af-south']);
  own(s, 'eu-west', 'airline', p2(s));
  const theirs = p2(s).points;
  s = go(s, { type: 'quiz', kind: 'airport', to: 'as-east' });
  s = go(s, { type: 'answer', choice: s.quiz!.question.correct });
  assert.equal(p2(s).points, theirs);
  assert.deepEqual(s.payments, []);

  s = game(['eu-west', 'af-south']);
  own(s, 'eu-west', 'airline', p2(s));
  for (let i = 0; i < 3; i++) {
    s = go(s, { type: 'quiz', kind: 'airport', to: 'as-east' });
    s = go(s, { type: 'answer', choice: (1 - s.quiz!.question.correct) as 0 | 1 });
    if (i < 2) s = pass(s);
  }
  assert.deepEqual(s.payments, [{ reason: 'ticket', from: p1(s).seat, to: p2(s).seat, amount: 2, area: 'eu-west', business: 'airline' }]);
  assert.equal(p1(s).area, 'as-east');
});

test('the Backpacker never pays a ticket, so an owner earns nothing from its trips', () => {
  let s = game(['eu-west', 'af-south'], ['backpacker', 'luxury']);
  own(s, 'eu-west', 'airline', p2(s));
  assert.ok(!legalActions(s, map).some((a) => a.type === 'board'));
  s = go(s, { type: 'quiz', kind: 'airport', to: 'as-east' });
  s = go(s, { type: 'answer', choice: s.quiz!.question.correct });
  assert.deepEqual(s.payments, []);
});

test('by ship: the ferry owner gets the ticket; the tour fee is paid at boarding', () => {
  let s = game(['eu-north', 'as-east'], ['nomad', 'luxury']); // Nomad: ticket 1, ship 3 turns
  own(s, 'eu-north', 'ferry', p2(s));
  own(s, 'na-one', 'tours', p2(s));
  p1(s).points = 0;
  // The tour fee is due even with a free quiz ticket.
  assert.ok(!legalActions(s, map).some((a) => (a.type === 'board' || a.type === 'quiz') && a.to === 'na-one'));
  p1(s).points = 2; // ticket 1 + tour fee 1
  s = go(s, { type: 'board', kind: 'port', to: 'na-one' });
  assert.deepEqual(s.payments, [
    { reason: 'ticket', from: p1(s).seat, to: p2(s).seat, amount: 1, area: 'eu-north', business: 'ferry' },
    { reason: 'tour', from: p1(s).seat, to: p2(s).seat, amount: 1, area: 'na-one' },
  ]);
  s = pass(s);
  let landing = s;
  for (let i = 0; i < 3; i++) s = pass((landing = go(s, { type: 'travel' })));
  assert.equal(p1(s).area, 'na-one');
  assert.deepEqual(landing.payments, []); // nothing is owed on landing
});

test('tours bought while the player is at sea cost nothing on landing', () => {
  let s = game(['eu-north', 'as-east'], ['nomad', 'luxury']);
  s = go(s, { type: 'board', kind: 'port', to: 'na-one' });
  own(s, 'na-one', 'tours', p2(s));
  s = pass(s);
  let landing = s;
  for (let i = 0; i < 3; i++) s = pass((landing = go(s, { type: 'travel' })));
  assert.equal(p1(s).area, 'na-one');
  assert.deepEqual(landing.payments, []);
});

// Two players. p1 stands in af-south with 1 point: the walk to af-north and the plane to
// as-east both need p2's 2-point visa. p2 starts in na-one and walks away from p1's home.
function brokeGame(): GameState {
  const s = game(['eu-west', 'na-one']);
  p1(s).area = 'af-south';
  p1(s).visitedAreas.push('af-south');
  p1(s).points = 1;
  p2(s).citizenship = ['af-north', 'as-east'];
  return s;
}

test(`go home: blocked by lack of money ${GO_HOME_TURNS} turns in a row sends the player home, for free`, () => {
  let s = brokeGame();
  for (let turn = 1; turn < GO_HOME_TURNS; turn++) {
    assert.deepEqual(legalActions(s, map), [{ type: 'blocked' }]);
    s = go(s, { type: 'blocked' });
    assert.equal(p1(s).broke, turn);
    s = pass(s);
  }
  assert.deepEqual(legalActions(s, map), [{ type: 'goHome' }]);
  // Home is p2's citizenship now: going home is still free.
  p2(s).citizenship!.push('eu-west');
  s = go(s, { type: 'goHome' });
  assert.equal(p1(s).area, 'eu-west');
  assert.equal(p1(s).points, 1);
  assert.equal(p1(s).broke, 0);
  assert.deepEqual(s.payments, []);
});

test('go home: if someone stands at home, the nearest free area', () => {
  let s = brokeGame();
  for (let turn = 1; turn < GO_HOME_TURNS; turn++) s = pass(go(s, { type: 'blocked' }));
  p2(s).area = 'eu-west';
  s = go(s, { type: 'goHome' });
  assert.equal(p1(s).area, 'eu-north');
});

test('a move, or being blocked only by players, ends the "no money" count', () => {
  let s = brokeGame();
  s = pass(go(s, { type: 'blocked' }));
  assert.equal(p1(s).broke, 1);
  p1(s).points = 2; // enough for the visa
  s = go(s, { type: 'walk', to: 'af-north' });
  assert.equal(p1(s).broke, 0);

  // Blocked only because every neighbour is taken: not counted.
  s = game(['eu-west', 'as-west', 'na-one', 'af-south']);
  p1(s).area = 'af-north';
  p1(s).broke = 1;
  seatOf(s, 2).area = 'eu-west';
  assert.deepEqual(legalActions(s, map), [{ type: 'blocked' }]);
  s = go(s, { type: 'blocked' });
  assert.equal(p1(s).broke, 0);
});

test('final score: points plus the price of every business owned', () => {
  const s = game(['as-west', 'eu-west']);
  p1(s).points = 5;
  p2(s).points = 4;
  own(s, 'eu-west', 'airline', p2(s));
  assert.equal(finalScore(s, p2(s)), 7);
  assert.deepEqual(rank(s.players, s.businesses).winners, [p2(s).seat]);
  assert.deepEqual(rank(s.players).winners, [p1(s).seat]);
});

// ---------- selling (task 9b) ----------

const sells = (s: GameState) => legalActions(s, map).filter((a) => a.type === 'sell');

test('selling: any business the player owns, to a player who can pay, at the price it was bought for', () => {
  let s = game(['eu-west', 'af-south']); // p1 Business, p2 Luxury
  own(s, 'eu-west', 'airline', p1(s));
  own(s, 'na-one', 'tours', p1(s)); // far away: can still be sold
  p2(s).points = 2;
  // p2 can pay the tours (2) but not the airline (3).
  assert.deepEqual(sells(s), [{ type: 'sell', business: 'tours', area: 'na-one', to: p2(s).seat }]);
  p2(s).points = 5;
  assert.equal(sells(s).length, 2);
  const mine = p1(s).points;
  s = go(s, { type: 'sell', business: 'airline', area: 'eu-west', to: p2(s).seat });
  assert.deepEqual(s.offer, { business: 'airline', area: 'eu-west', from: p1(s).seat, to: p2(s).seat, price: 3 });
  assert.deepEqual(legalActions(s, map), [{ type: 'sellAnswer', accept: true }, { type: 'sellAnswer', accept: false }]);
  s = go(s, { type: 'sellAnswer', accept: true });
  assert.equal(owner(s, 'eu-west', 'airline'), p2(s).seat);
  assert.equal(p1(s).points, mine + 3);
  assert.equal(p2(s).points, 2);
  assert.deepEqual(s.payments, [{ reason: 'sale', from: p2(s).seat, to: p1(s).seat, amount: 3, area: 'eu-west', business: 'airline' }]);
  // Still p1's turn; one offer per turn, so no more selling now.
  assert.equal(s.turnOrder[s.current], p1(s).seat);
  assert.deepEqual(sells(s), []);
  assert.ok(legalActions(s, map).some((a) => a.type === 'walk'));
});

test('a refused offer changes nothing, and uses the one offer of the turn', () => {
  let s = game(['eu-west', 'af-south']);
  own(s, 'na-one', 'tours', p1(s));
  s = go(s, { type: 'sell', business: 'tours', area: 'na-one', to: p2(s).seat });
  s = go(s, { type: 'sellAnswer', accept: false });
  assert.equal(owner(s, 'na-one', 'tours'), p1(s).seat);
  assert.deepEqual(s.payments, []);
  assert.deepEqual(sells(s), []);
  // Next turn: p1 may offer again.
  s = pass(pass(s));
  assert.equal(sells(s).length, 1);
});

test('no sale offers to a player in the air or at sea', () => {
  let s = game(['eu-north', 'as-east'], ['luxury', 'nomad']);
  own(s, 'na-one', 'tours', p1(s));
  s = go(s, { type: 'walk', to: 'eu-west' });
  s = go(s, { type: 'quiz', kind: 'airport', to: 'af-south' });
  s = go(s, { type: 'answer', choice: s.quiz!.question.correct }); // Nomad: 1 travel turn
  assert.notEqual(p2(s).travel, null);
  p2(s).points = 10;
  assert.deepEqual(sells(s), []);
});

test('out of money: selling gives the points to move on in the same turn', () => {
  let s = brokeGame();
  own(s, 'na-one', 'tours', p1(s));
  s = pass(go(s, { type: 'blocked' }));
  assert.equal(p1(s).broke, 1);
  s = go(s, { type: 'sell', business: 'tours', area: 'na-one', to: p2(s).seat });
  s = go(s, { type: 'sellAnswer', accept: true });
  assert.equal(p1(s).points, 3);
  s = go(s, { type: 'walk', to: 'af-north' }); // the 2-point visa
  assert.equal(p1(s).area, 'af-north');
  assert.equal(p1(s).broke, 0);
});

test('a sold business counts for its new owner at the end', () => {
  let s = game(['eu-west', 'af-south']);
  own(s, 'eu-west', 'airline', p1(s));
  s = go(s, { type: 'sell', business: 'airline', area: 'eu-west', to: p2(s).seat });
  s = go(s, { type: 'sellAnswer', accept: true });
  assert.equal(finalScore(s, p2(s)), p2(s).points + 3);
  assert.equal(finalScore(s, p1(s)), p1(s).points);
});
