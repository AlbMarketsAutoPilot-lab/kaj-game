import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, createGame, currentPlayer, legalActions } from '../src/engine/engine.ts';
import { randomInt } from '../src/engine/rng.ts';
import { randomRobotAction } from '../src/engine/robot.ts';
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
  let longestTrip = 0;
  let longestBlock = 0;
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
      if (s.phase === 'play' && !s.quiz) {
        blockedInARow[seat] = action.type === 'blocked' ? blockedInARow[seat] + 1 : 0;
        longestBlock = Math.max(longestBlock, blockedInARow[seat]);
      }
      const owed = s.players.map((q) => q.points);
      s = apply(s, map30, action);
      checkInvariants(s);
      // A visa: another player gets exactly 2 points from this move.
      if (action.type !== 'exam') visas += s.players.filter((q, i) => q.seat !== seat && q.points - owed[i] === 2).length;
      const p = s.players[seat];
      if (p.travel) {
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
  }
  assert.ok(trips > GAMES, `only ${trips} trips`);
  assert.ok(citizens > GAMES, `only ${citizens} citizenships`);
  assert.ok(visas > GAMES / 2, `only ${visas} visas`);
  assert.ok(quizzes > GAMES, `only ${quizzes} quizzes`);
  // A ship takes at most 3 travel turns; a taken destination adds a few waiting turns.
  assert.ok(longestTrip <= 8, `a trip lasted ${longestTrip} turns`);
  assert.ok(longestBlock <= 5, `a player was blocked ${longestBlock} turns in a row`);
});
