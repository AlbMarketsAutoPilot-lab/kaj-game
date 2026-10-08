import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, createGame, currentPlayer, finalScore, legalActions, nomadPenalty } from '../src/engine/engine.ts';
import { randomInt } from '../src/engine/rng.ts';
import { randomRobotAction } from '../src/engine/robot.ts';
import { loadGame, saveGame } from '../src/engine/save.ts';
import type { Action, GameState } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { testMap } from './fixtures/test-map.ts';
import { seats } from './helpers.ts';

const GAMES = 1000;

function checkInvariants(s: GameState): void {
  for (const p of s.players) assert.ok(p.points >= 0, `seat ${p.seat} has ${p.points} points`);
  const areas = s.players.map((p) => p.area).filter((a) => a !== null);
  assert.equal(new Set(areas).size, areas.length, `two players share an area: ${areas}`);
}

// This tiny map has no airports or ports, so (unlike the real map) a visa area or a player
// staying for citizenship can trap others here. On it the robots never ask for citizenship
// (owner-approved, task 8); citizenship and visas are checked on the real map below.
function plainRobotAction(s: GameState, seed: number): [Action, number] {
  const plain = legalActions(s, testMap).filter((a) => !('citizenship' in a && a.citizenship));
  const [i, next] = randomInt(seed, plain.length);
  return [plain[i], next];
}

test(`random robots play ${GAMES} games: nobody stuck, points ≥ 0, never two in one area`, () => {
  let longestBlock = 0;
  for (let g = 0; g < GAMES; g++) {
    const n = 2 + (g % 3);
    let s = createGame({ seats: seats(n, n - 1), seed: g * 7919 }, testMap);
    let robotSeed = g;
    const blockedInARow = new Array(n).fill(0);
    let steps = 0;

    while (s.phase !== 'finished') {
      assert.ok(legalActions(s, testMap).length > 0, `game ${g}: no legal action`);
      const seat = currentPlayer(s).seat;
      const [action, next] = plainRobotAction(s, robotSeed);
      robotSeed = next;
      if (s.phase === 'play') {
        blockedInARow[seat] = action.type === 'blocked' ? blockedInARow[seat] + 1 : 0;
        longestBlock = Math.max(longestBlock, blockedInARow[seat]);
      }
      s = apply(s, testMap, action);
      checkInvariants(s);
      assert.ok(++steps < 1000, `game ${g} never ends`);
    }

    assert.equal(s.round, 30);
    assert.equal(s.result!.ranking.length, n);
  }
  // A blocked player is freed within a few turns; "stuck forever" would show up here.
  assert.ok(longestBlock <= 5, `a player was blocked ${longestBlock} turns in a row`);
});

// The real 30-turn map, with planes, ships, tickets, the airline quiz, citizenship and visas.
test(`random robots play ${GAMES} games on the 30-turn map with planes and ships`, () => {
  let trips = 0;
  let quizzes = 0;
  let citizens = 0;
  let visas = 0;
  let purchases = 0;
  let offers = 0;
  let sales = 0;
  let income = 0;
  let longestTrip = 0;
  let longestBlock = 0;
  const bonuses = { backpacker: 0, luxury: 0, nomadPenalty: 0, nomadPenaltyLostWin: 0 };
  const profiles: Record<string, number> = {};
  let resumes = 0;
  const cards = { scheduled: 0, travel: 0, lostTurns: 0, won: 0, lost: 0 };
  const challenges = { travelTurns: 0, zeroPoints: 0, played: 0, right: 0, won: 0, lost: 0 };
  for (let g = 0; g < GAMES; g++) {
    const n = 2 + (g % 3);
    let s = createGame({ seats: seats(n, n - 1), seed: g * 7919 + 13 }, map30);
    let robotSeed = g + 101;
    const inTransit = new Array(n).fill(0);
    const blockedInARow = new Array(n).fill(0);
    let steps = 0;

    while (s.phase !== 'finished') {
      assert.ok(legalActions(s, map30).length > 0, `game ${g}: no legal action`);
      const seat = currentPlayer(s).seat;
      const [action, next] = randomRobotAction(s, map30, robotSeed);
      robotSeed = next;
      if (action.type === 'quiz') quizzes++;
      // Challenges (task 12): offered on every travel turn, except with 0 points.
      if (action.type === 'travel') {
        challenges.travelTurns++;
        if (s.players[seat].points === 0) challenges.zeroPoints++;
        if (action.challenge) challenges.played++;
      }
      if (s.phase === 'play' && !s.quiz && action.type !== 'buy') {
        blockedInARow[seat] = action.type === 'blocked' ? blockedInARow[seat] + 1 : 0;
        longestBlock = Math.max(longestBlock, blockedInARow[seat]);
      }
      if (action.type === 'sell') offers++;
      s = apply(s, map30, action);
      // Every 10th move, the game is saved and resumed from the save (task 10).
      if (steps % 10 === 0) {
        const loaded = loadGame(saveGame(s));
        assert.ok('state' in loaded, `game ${g}: the save could not be loaded`);
        s = loaded.state;
        resumes++;
      }
      checkInvariants(s);
      // Event cards (task 11).
      for (const c of s.drawn) {
        const travel = action.type === 'travel' && c.seat === seat;
        cards[travel ? 'travel' : 'scheduled']++;
        if (c.card.loseTurn) cards.lostTurns++;
        if (c.change > 0) cards.won += c.change;
        else cards.lost -= c.change;
      }
      if (s.challenged) {
        if (s.challenged.right) challenges.right++;
        if (s.challenged.change > 0) challenges.won += s.challenged.change;
        else challenges.lost -= s.challenged.change;
      }
      for (const pay of s.payments) {
        if (pay.reason === 'visa') visas++;
        if (pay.reason === 'buy') purchases++;
        if (pay.reason === 'sale') sales++;
        if ((pay.reason === 'tour' || pay.reason === 'ticket') && pay.to !== null && pay.to !== pay.from) income += pay.amount;
      }
      const p = s.players[seat];
      // A challenge question doesn't end the turn: only the answer counts as the travel turn.
      if (s.challenge) {
        // the turn goes on
      } else if (p.travel) {
        if (inTransit[seat] === 0) trips++;
        inTransit[seat]++;
        longestTrip = Math.max(longestTrip, inTransit[seat]);
      } else {
        inTransit[seat] = 0;
      }
      assert.ok(p.travel !== null || p.area !== null || s.phase !== 'play', `game ${g}: seat ${seat} is nowhere`);
      assert.ok(++steps < 2000, `game ${g} never ends`);
    }

    assert.equal(s.round, 30);
    assert.equal(s.result!.ranking.length, n);
    // One citizen per area or big country.
    const held = s.players.flatMap((q) => q.citizenship ?? []);
    assert.equal(new Set(held).size, held.length, `game ${g}: two citizens in one area`);
    citizens += s.players.filter((q) => q.citizenship).length;
    // Profile bonuses (task 10).
    for (const q of s.players) {
      profiles[q.profile!] = (profiles[q.profile!] ?? 0) + 1;
      if (q.profile === 'backpacker' && q.visitedContinents.length >= 3) bonuses.backpacker++;
      if (q.profile === 'luxury' && q.visitedContinents.length >= 5) bonuses.luxury++;
      if (q.profile === 'nomad' && nomadPenalty(q) > 0) {
        bonuses.nomadPenalty++;
        if (finalScore(s, q) + nomadPenalty(q) > Math.max(...s.players.filter((o) => o !== q).map((o) => finalScore(s, o)))) bonuses.nomadPenaltyLostWin++;
      }
    }
  }
  console.log(`task 11: cards ${JSON.stringify(cards)}, longest trip ${longestTrip}, longest blocked ${longestBlock}`);
  console.log(`task 12: challenges ${JSON.stringify(challenges)}`);
  console.log(`task 10: ${JSON.stringify(bonuses)} of ${JSON.stringify(profiles)}, ${resumes} save/resume round trips`);
  assert.ok(trips > GAMES, `only ${trips} trips`);
  assert.ok(cards.scheduled > GAMES, `only ${cards.scheduled} cards`);
  assert.equal(cards.travel, 0, 'no cards on trips (task 12)');
  assert.ok(challenges.played > GAMES, `only ${challenges.played} challenges`);
  assert.ok(citizens > GAMES, `only ${citizens} citizenships`);
  assert.ok(visas > GAMES / 2, `only ${visas} visas`);
  assert.ok(quizzes > GAMES, `only ${quizzes} quizzes`);
  assert.ok(purchases > GAMES, `only ${purchases} businesses bought`);
  assert.ok(income > GAMES, `only ${income} points of business income`);
  assert.ok(offers > GAMES && sales > GAMES / 2, `only ${offers} sale offers, ${sales} sales`);
  // A ship takes at most 3 travel turns; a taken destination adds a few. (Task 11's "late" cards
  // are gone since task 12.)
  // Limit raised from 8 to 10 in task 11 (owner-approved).
  assert.ok(longestTrip <= 10, `a trip lasted ${longestTrip} turns`);
  assert.ok(longestBlock <= 5, `a player was blocked ${longestBlock} turns in a row`);
});
