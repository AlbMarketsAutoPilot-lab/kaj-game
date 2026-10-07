import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CARDS } from '../src/cards/cards.ts';
import { CARD_LAST_ROUND } from '../src/engine/constants.ts';
import { apply, createGame, eligibleCards, isCardRound, legalActions, nextCardRound } from '../src/engine/engine.ts';
import { randomRobotAction } from '../src/engine/robot.ts';
import { loadGame, saveGame } from '../src/engine/save.ts';
import type { Action, DrawnCard, GameState, Profile } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { travelMap as map } from './fixtures/test-map.ts';
import { seatOf, seats, startedGame } from './helpers.ts';

// Event cards (docs/engine.md, task 11).
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

test('the card file: 40–60 cards, allowed strengths, area cards on the real map', () => {
  assert.ok(CARDS.length >= 40 && CARDS.length <= 60, `${CARDS.length} cards`);
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
  for (const deck of ['country', 'plane', 'ship', 'backpacker'] as const) {
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
  assert.ok(ids(['plane'], null).every((id) => id.startsWith('p')));
  assert.ok(ids(['ship'], null).every((id) => id.startsWith('s')));
});

test('the schedule: rounds 3, 6 … 27, none in the last round', () => {
  const rounds = Array.from({ length: 30 }, (_, i) => i + 1).filter(isCardRound);
  assert.deepEqual(rounds, [3, 6, 9, 12, 15, 18, 21, 24, 27]);
  assert.equal(CARD_LAST_ROUND, 27);
  assert.equal(nextCardRound(1), 3);
  assert.equal(nextCardRound(4), 6);
  assert.equal(nextCardRound(28), null);
});

test('a card at the start of each turn in round 3, shown for the whole turn', () => {
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
  s.round = 3; // the second player's turn starts in a card round
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
  s.round = 3;
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
  s.round = 3;
  p2(s).exam = { area: 'as-east', stage: 'test', questions: [], answers: [] };
  s = go(s, { type: 'walk', to: 'eu-north' });
  assert.equal(s.card, null);
});

test('a travel turn draws a ship card; "lose a turn" makes the ship one turn late, no Nomad point', () => {
  let s = game(['eu-north', 'as-east'], ['nomad', 'luxury']); // Nomad: ship 3 turns
  s = go(s, { type: 'board', kind: 'port', to: 'na-one' });
  s = pass(s);
  const late = withCard(s, { type: 'travel' }, (c) => c.card.loseTurn === true);
  assert.equal(late.drawn[0].card.deck, 'ship');
  assert.equal(late.card, null, 'a travel card is shown with the move, not kept for a turn');
  assert.equal(p1(late).travel!.turnsLeft, 3);
  assert.equal(p1(late).points, p1(s).points);
  const onTime = withCard(s, { type: 'travel' }, (c) => c.card.points === 1);
  assert.equal(p1(onTime).travel!.turnsLeft, 2);
  assert.equal(p1(onTime).points, p1(s).points + 1 + 1); // Nomad +1, card +1
});

test('one card per turn: a traveller in a card round draws only the travel card', () => {
  let s = game(['eu-west', 'as-east'], ['nomad', 'luxury']); // Nomad: plane 1 turn
  s.round = 2;
  s = go(s, { type: 'board', kind: 'airport', to: 'as-east' });
  s = go(s, { type: 'walk', to: 'as-west' }); // ends round 2: round 3 starts with the traveller
  assert.equal(s.round, 3);
  assert.equal(s.card, null, 'no scheduled card for a traveller');
  s = go(s, { type: 'travel' });
  assert.equal(s.drawn[0].seat, p1(s).seat);
  assert.equal(s.drawn[0].card.deck, 'plane');
  // The next player's turn (round 3) starts with their own card, listed after it.
  assert.equal(s.drawn.length, 2);
  assert.deepEqual(s.card, s.drawn[1]);
});

test('cards off (rule tests only): no cards at all', () => {
  let s = startedGame(['eu-west', 'as-east'], 1, map);
  while (s.round < 7) {
    assert.equal(s.card, null);
    assert.deepEqual(s.drawn, []);
    s = pass(s);
  }
});

test('the same seed draws the same cards; saves from version 1 are not continued', () => {
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
  const old = JSON.stringify({ version: 1, state: JSON.parse(saveGame(createGame({ seats: seats(2), seed: 1 }, map30))).state });
  assert.ok('error' in loadGame(old));
});
