import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CARDS } from '../src/cards/cards.ts';
import { apply, createGame, eligibleCards, landTurnsToCard, legalActions } from '../src/engine/engine.ts';
import { randomRobotAction } from '../src/engine/robot.ts';
import { loadGame, saveGame } from '../src/engine/save.ts';
import type { Action, DrawnCard, GameState, Profile } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { travelMap as map } from './fixtures/test-map.ts';
import { seatOf, seats, startedGame } from './helpers.ts';

// Event cards (docs/engine.md, task 11; since task 12: no cards on trips, and each player's
// card comes on every 3rd turn begun in an area).
//   eu-north — eu-east — as-west — as-east — na-one      ✈️ eu-west ↔ as-east ↔ af-south
//      |      /            |                             ⛴️ eu-north ↔ na-one
//   eu-west — af-north ----+
//                 |
//              af-south

function game(starts: string[], profiles: Profile[] = ['business', 'luxury', 'nomad', 'backpacker']): GameState {
  return startedGame(starts, 1, map, profiles, true);
}
const go = (s: GameState, action: Action) => apply(s, map, action);
const p1 = (s: GameState) => seatOf(s, 0);
const p2 = (s: GameState) => seatOf(s, 1);
function pass(s: GameState): GameState {
  return go(s, legalActions(s, map).find((a) => a.type === 'walk' || a.type === 'travel' || a.type === 'lostTurn' || a.type === 'blocked')!);
}

// Plays `action` with dice chosen so the card drawn matches `wanted`.
function withCard(s: GameState, action: Action, wanted: (c: DrawnCard) => boolean): GameState {
  for (let r = 1; r < 20000; r++) {
    const t = structuredClone(s);
    t.rng = r;
    const next = go(t, action);
    if (next.drawn.length === 1 && wanted(next.drawn[0])) return next;
  }
  throw new Error('no such card');
}

test('the card file: 30–60 cards, allowed strengths, area cards on the real map', () => {
  assert.ok(CARDS.length >= 30 && CARDS.length <= 60, `${CARDS.length} cards`);
  assert.equal(new Set(CARDS.map((c) => c.id)).size, CARDS.length, 'ids are unique');
  const areas = new Set(map30.areas.map((a) => a.id));
  for (const c of CARDS) {
    assert.ok([-5, -2, -1, 1, 2, 5].includes(c.points) || (c.points === 0 && c.loseTurn), c.id);
    if (c.loseTurn) assert.equal(c.points, 0, c.id);
    if (c.area) {
      assert.equal(c.deck, 'country', c.id);
      assert.ok(areas.has(c.area), `${c.id}: unknown area ${c.area}`);
    }
    if (c.deck === 'backpacker') assert.ok(c.points > 0 && !c.loseTurn, `${c.id}: Backpacker cards help`);
    assert.ok(c.text.length > 0 && c.text.length <= 110, `${c.id}: text length`);
  }
  for (const deck of ['country', 'backpacker'] as const) {
    assert.ok(CARDS.filter((c) => c.deck === deck).length >= 8, deck);
  }
  // Mostly ±1, some ±2 or "lose a turn", rare ±5.
  const share = (f: (p: number) => boolean) => CARDS.filter((c) => f(c.points)).length / CARDS.length;
  assert.ok(share((p) => Math.abs(p) === 1) >= 0.5);
  assert.ok(share((p) => Math.abs(p) === 5) <= 0.1);
});

test('which cards can be drawn: area cards only in their area', () => {
  const ids = (decks: Parameters<typeof eligibleCards>[0], area: string | null) => eligibleCards(decks, area).map((c) => c.id);
  assert.ok(ids(['country'], 'egypt').includes('a1'));
  assert.ok(!ids(['country'], 'egypt').includes('a4'));
  assert.ok(!ids(['country'], 'iceland').includes('a1'));
  assert.ok(ids(['country', 'backpacker'], 'france').some((id) => id.startsWith('b')));
});

test('the count: every 3rd land turn', () => {
  const after = (landTurns: number) => landTurnsToCard({ landTurns } as GameState['players'][number]);
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(after), [0, 2, 1, 0, 2, 1, 0]);
});

test('walking every turn: a card at the start of each turn in round 3, shown for the whole turn', () => {
  let s = game(['eu-west', 'as-east']);
  while (s.round < 3) {
    assert.equal(s.card, null, `no card in round ${s.round}`);
    s = pass(s);
  }
  // Round 3 has begun: the first player's card is on show before they move.
  assert.equal(s.card!.seat, p1(s).seat);
  assert.equal(s.card!.round, 3);
  const deck = s.card!.card.deck;
  assert.ok(deck === 'country', 'the Business traveller draws a country card');
  // The second player's turn starts with their own card.
  if (!s.card!.card.loseTurn) {
    s = pass(s);
    assert.equal(s.card!.seat, p2(s).seat);
  }
});

test('a card changes points, never below 0, and says what really happened', () => {
  let s = game(['eu-west', 'as-east']);
  p2(s).landTurns = 2; // the second player's next turn is their 3rd land turn
  p2(s).points = 0;
  const lost = withCard(s, { type: 'walk', to: 'eu-north' }, (c) => c.card.points < 0);
  assert.equal(p2(lost).points, 0);
  assert.equal(lost.drawn[0].change, 0);
  p2(s).points = 4;
  const won = withCard(s, { type: 'walk', to: 'eu-north' }, (c) => c.card.points === 2);
  assert.equal(p2(won).points, 6);
  assert.equal(won.drawn[0].change, 2);
  assert.deepEqual(won.card, won.drawn[0], 'on show for the whole turn');
});

test('lose a turn in an area: the only move is "lostTurn"; it changes nothing else', () => {
  let s = game(['eu-west', 'as-east']);
  p2(s).landTurns = 2;
  p2(s).broke = 1;
  s = withCard(s, { type: 'walk', to: 'eu-north' }, (c) => c.card.loseTurn === true);
  assert.deepEqual(legalActions(s, map), [{ type: 'lostTurn' }]);
  const before = structuredClone(p2(s));
  s = go(s, { type: 'lostTurn' });
  assert.equal(p2(s).area, before.area);
  assert.equal(p2(s).points, before.points);
  assert.equal(p2(s).broke, 1, 'the "out of money" count stays as it was');
  assert.equal(p2(s).loseTurn, false);
});

test('no scheduled card during a citizenship request (the exam is the event)', () => {
  let s = game(['eu-west', 'as-east']);
  p2(s).landTurns = 2;
  p2(s).exam = { area: 'as-east', stage: 'test', questions: [], answers: [] };
  s = go(s, { type: 'walk', to: 'eu-north' });
  assert.equal(s.card, null);
});

test('no card on a trip: a travel turn draws nothing and does not count', () => {
  let s = game(['eu-north', 'as-east'], ['nomad', 'luxury']); // Nomad: ship 3 turns
  s = go(s, { type: 'board', kind: 'port', to: 'na-one' }); // land turn 1
  s = pass(s);
  for (let i = 0; i < 3; i++) {
    const before = p1(s).points;
    s = go(s, { type: 'travel' });
    assert.ok(s.drawn.every((c) => c.seat !== p1(s).seat), 'no travel card');
    assert.equal(p1(s).points, before + 1 + (i === 2 ? 1 + 2 : 0)); // Nomad +1; landing: area +1, continent +2
    assert.equal(p1(s).landTurns, 1, 'trip turns are not counted');
    s = pass(s);
  }
  // Rounds 2–4 were at sea, so the card comes on land turns 3 (round 6), not in round 3.
  assert.equal(s.round, 5);
  assert.equal(p1(s).landTurns, 2);
  assert.equal(s.card, null);
  s = pass(s);
  s = pass(s);
  assert.equal(s.card!.seat, p1(s).seat);
  assert.equal(p1(s).landTurns, 3);
});

test('no card in the last round', () => {
  let s = game(['eu-west', 'as-east']);
  s.round = s.totalRounds;
  p2(s).landTurns = 2;
  s = pass(s);
  assert.equal(p2(s).landTurns, 3);
  assert.equal(s.card, null);
});

test('cards off (rule tests only): no cards at all', () => {
  let s = startedGame(['eu-west', 'as-east'], 1, map);
  while (s.round < 7) {
    assert.equal(s.card, null);
    assert.deepEqual(s.drawn, []);
    s = pass(s);
  }
});

test('the same seed draws the same cards; saves from versions 1 and 2 are not continued', () => {
  const play = () => {
    let s = createGame({ seats: seats(3, 2), seed: 5 }, map30);
    let seed = 9;
    const cards: string[] = [];
    while (s.phase !== 'finished') {
      const [a, n] = randomRobotAction(s, map30, seed);
      seed = n;
      s = apply(s, map30, a);
      for (const c of s.drawn) cards.push(`${c.seat}:${c.round}:${c.card.id}`);
    }
    return cards;
  };
  const a = play();
  assert.ok(a.length > 0);
  assert.deepEqual(play(), a);
  for (const version of [1, 2]) {
    const old = JSON.stringify({ version, state: JSON.parse(saveGame(createGame({ seats: seats(2), seed: 1 }, map30))).state });
    assert.ok('error' in loadGame(old));
  }
});
