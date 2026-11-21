import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CARDS } from '../src/cards/cards.ts';
import { cardMix, LOSE_TURN_WEIGHT } from '../src/engine/constants.ts';
import { apply, createGame, eligibleCards, landTurnsToCard, legalActions, newsCard } from '../src/engine/engine.ts';
import { CARD_COUNTRIES } from '../src/cards/countries.ts';
import { randomRobotAction } from '../src/engine/robot.ts';
import { loadGame, saveGame } from '../src/engine/save.ts';
import type { Action, DrawnCard, GameState, Profile } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { map50 } from '../src/maps/map50.ts';
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

test('the card file: 40–60 cards, allowed strengths, area cards on the real map', () => {
  assert.ok(CARDS.length >= 40 && CARDS.length <= 60, `${CARDS.length} cards`);
  assert.equal(new Set(CARDS.map((c) => c.id)).size, CARDS.length, 'ids are unique');
  const areas = new Set(map30.areas.map((a) => a.id));
  for (const c of CARDS) {
    // The news cards' allowed strengths; Kris Ann's cards (step 2.11, owner-approved, some 0) are checked below.
    if (c.deck === 'country') assert.ok([-5, -2, -1, 1, 2, 5].includes(c.points) || (c.points === 0 && c.loseTurn), c.id);
    if (c.loseTurn) assert.equal(c.points, 0, c.id);
    if (c.area) {
      assert.equal(c.deck, 'country', c.id);
      assert.ok(areas.has(c.area), `${c.id}: unknown area ${c.area}`);
    }
    // The news cards (the phone) keep their 110-character limit; Kris Ann's cards (step 2.11) are picture popups
    // with longer, owner-approved texts, checked on the small phone screens (568×320) instead.
    if (c.deck === 'country') assert.ok(c.text.length > 0 && c.text.length <= 110, `${c.id}: text length`);
    if (c.deck === 'krisann') assert.ok(c.points >= -2 && c.points <= 2 && !c.loseTurn && c.text.includes('Kris Ann'), `${c.id}: Kris Ann card`);
  }
  for (const deck of ['country', 'krisann'] as const) {
    assert.ok(CARDS.filter((c) => c.deck === deck).length >= 8, deck);
  }
  // Mostly ±1, some ±2 or "lose a turn", rare ±5.
  const share = (f: (p: number) => boolean) => CARDS.filter((c) => f(c.points)).length / CARDS.length;
  assert.ok(share((p) => Math.abs(p) === 1) >= 0.5);
  assert.ok(share((p) => Math.abs(p) === 5) <= 0.1);
});

// Step 2.8 (owner, option 1): no card is kept for one area; every country card can come everywhere.
test('which cards can be drawn: every country card everywhere (step 2.8)', () => {
  const ids = (decks: Parameters<typeof eligibleCards>[0], area: string | null) => eligibleCards(decks, area).map((c) => c.id);
  const country = CARDS.filter((c) => c.deck === 'country').map((c) => c.id);
  assert.equal(country.length, 45);
  assert.ok(CARDS.every((c) => c.area === undefined));
  for (const area of ['egypt', 'iceland', 'france']) assert.deepEqual(ids(['country'], area), country);
  assert.ok(ids(['country', 'krisann'], 'france').some((id) => id.startsWith('k')));
});

// Step 2.8 (owner): the news names the country the player stands in, never a capital in a big country.
test('news cards: every card filled in every area of both maps', () => {
  for (const m of [map30, map50]) {
    for (const a of m.areas) {
      for (const c of CARDS.filter((x) => x.deck === 'country')) {
        for (const k of [0, 1, 2]) {
          const n = newsCard(c, a, k);
          assert.ok(!/[{}]/.test(n.text) && n.big === undefined && /^[A-Z0-9]/.test(n.text), `${c.id} in ${a.id}: ${n.text}`);
          assert.equal(n.points, c.points);
          if (a.bigCountry && c.big) assert.equal(n.text.includes(CARD_COUNTRIES[a.bigCountry]?.capital ?? '#'), false, `${c.id} in ${a.id}`);
        }
      }
    }
  }
  const at = (id: string, area: string) => newsCard(CARDS.find((c) => c.id === id)!, map30.areas.find((a) => a.id === area)!, 0).text;
  assert.equal(at('c31', 'japan'), 'Strike in Tokyo: buses and trains stop for a day. Nobody leaves the city.');
  assert.equal(at('c31', 'russia-far-east'), 'Strike across Russia: buses and trains stop for a day. Nobody travels.');
  assert.equal(at('c40', 'usa-west').slice(0, 17), 'The United States');
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

test('no card on a trip: a travel turn draws nothing and does not count', () => {
  let s = game(['eu-north', 'as-east'], ['nomad', 'luxury']); // Nomad by quiz: ship 2 turns (step 2.7)
  s = go(s, { type: 'quiz', kind: 'port', to: 'na-one' }); // land turn 1
  s = go(s, { type: 'answer', choice: s.quiz!.question.correct });
  s = pass(s);
  for (let i = 0; i < 2; i++) {
    const before = p1(s).points;
    s = go(s, { type: 'travel' });
    assert.ok(s.drawn.every((c) => c.seat !== p1(s).seat), 'no travel card');
    // Nomad: a trip to a new area +1, once, on the first travel turn; landing: area +1, continent +2.
    // (The boss's alert of the 2nd turn is a challenge offer here, not played.)
    assert.equal(p1(s).points, before + (i === 0 ? 1 : 0) + (i === 1 ? 1 + 2 : 0));
    assert.equal(p1(s).landTurns, 1, 'trip turns are not counted');
    s = pass(s);
  }
  // Rounds 2–3 were at sea, so the card comes on land turn 3 (round 5), not in round 3.
  assert.equal(s.round, 4);
  assert.equal(p1(s).landTurns, 2);
  assert.ok(s.card === null || s.card.seat !== p1(s).seat, 'no card for the traveller yet');
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

// Step 2.6; step 2.7 (mix "D1"); step 2.8 ("N1"); step 2.11 (owner's final mix "TG", one mix per map, measured 34 of 40):
// the same news cards for everyone, but how often good and bad ones come depends on the map, the profile and the number
// of players (3 players use the 4-player mix). Only Kris Ann draws her own 8 cards.
test('the card mix by map, profile and number of players; only Kris Ann draws her own cards (step 2.11)', () => {
  assert.deepEqual(cardMix('business', 2), { good: 1.1, bad: 0.79 });
  assert.deepEqual(cardMix('nomad', 2), { good: 1.1, bad: 0.66 });
  assert.deepEqual(cardMix('nomad', 3), cardMix('nomad', 4));
  assert.deepEqual(cardMix('backpacker', 4), { good: 0.93, bad: 1.81 });
  assert.deepEqual(cardMix('business', 4), { good: 1.2, bad: 1.44 });
  assert.deepEqual(cardMix('luxury', 4), { good: 1.3, bad: 1.23 });
  assert.deepEqual(cardMix('nomad', 4), { good: 1.1, bad: 0.81 });
  assert.deepEqual(cardMix('krisann', 4), { good: 1, bad: 1.03 });
  // The 50-turn map has its own mix.
  assert.deepEqual(cardMix('backpacker', 2, 50), { good: 1, bad: 1.29 });
  assert.deepEqual(cardMix('nomad', 2, 50), { good: 1, bad: 0.72 });
  assert.deepEqual(cardMix('backpacker', 4, 50), { good: 0.93, bad: 2.25 });
  assert.deepEqual(cardMix('business', 4, 50), { good: 1.2, bad: 1.19 });
  assert.deepEqual(cardMix('krisann', 2, 50), { good: 1, bad: 1.25 });
  assert.equal(LOSE_TURN_WEIGHT, 0.5);
  // Kris Ann's 8 cards, as measured: points 30 turns +2 +1 +1 0 0 −1 −1 −2; 50 turns +2 +1 +1 +1 0 −1 −1 −1.
  const own = CARDS.filter((c) => c.deck === 'krisann');
  assert.deepEqual(own.map((c) => c.points), [2, 1, 1, 0, 0, -1, -1, -2]);
  assert.deepEqual(own.map((c) => c.points50 ?? c.points), [2, 1, 1, 1, 0, -1, -1, -1]);
  const bad = (c: DrawnCard) => c.card.loseTurn === true || c.card.points < 0;
  const drawn: Record<string, { all: number; bad: number }> = {};
  for (let g = 0; g < 150; g++) {
    let s = createGame({ seats: seats(4, 3), seed: g * 31 + 7 }, map30);
    let r = g + 5;
    while (s.phase !== 'finished') {
      let a: Action;
      [a, r] = randomRobotAction(s, map30, r);
      s = apply(s, map30, a);
      for (const c of s.drawn) {
        const p = s.players[c.seat].profile!;
        if (c.card.deck === 'krisann') assert.equal(p, 'krisann', `${c.card.id} drawn by ${p}`);
        drawn[p] ??= { all: 0, bad: 0 };
        drawn[p].all++;
        if (bad(c)) drawn[p].bad++;
      }
    }
  }
  const share = (p: Profile) => drawn[p].bad / drawn[p].all;
  // 30 turns, 4 players, the 45 news cards with "lose a turn" half as often (in theory): Backpacker 60% bad, Business
  // 48%, Luxury 42%, Nomad 36%.
  assert.ok(share('backpacker') > share('business') && share('business') > share('luxury') && share('luxury') > share('nomad'), JSON.stringify(drawn));
});
