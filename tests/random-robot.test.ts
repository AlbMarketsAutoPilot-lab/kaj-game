import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, createGame, currentPlayer, legalActions } from '../src/engine/engine.ts';
import { randomRobotAction } from '../src/engine/robot.ts';
import type { GameState } from '../src/engine/types.ts';
import { testMap } from './fixtures/test-map.ts';
import { seats } from './helpers.ts';

const GAMES = 1000;

function checkInvariants(s: GameState): void {
  for (const p of s.players) assert.ok(p.points >= 0, `seat ${p.seat} has ${p.points} points`);
  const areas = s.players.map((p) => p.area).filter((a) => a !== null);
  assert.equal(new Set(areas).size, areas.length, `two players share an area: ${areas}`);
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
      const [action, next] = randomRobotAction(s, testMap, robotSeed);
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
