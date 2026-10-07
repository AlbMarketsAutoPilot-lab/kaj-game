import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, createGame } from '../src/engine/engine.ts';
import { randomRobotAction } from '../src/engine/robot.ts';
import { SAVE_VERSION, loadGame, saveGame } from '../src/engine/save.ts';
import type { GameState } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { seats } from './helpers.ts';

// Automatic save and resume (task 10).

function play(seed: number, resumeEvery: number): GameState {
  let s = createGame({ seats: seats(3, 2), seed }, map30);
  let robotSeed = seed + 1;
  for (let step = 1; s.phase !== 'finished'; step++) {
    const [action, next] = randomRobotAction(s, map30, robotSeed);
    robotSeed = next;
    s = apply(s, map30, action);
    if (step % resumeEvery === 0) {
      const loaded = loadGame(saveGame(s));
      assert.ok('state' in loaded);
      s = loaded.state;
    }
  }
  return s;
}

test('a game resumed after every move ends exactly like one never saved', () => {
  for (let seed = 1; seed <= 20; seed++) {
    assert.deepEqual(play(seed, 1), play(seed, Infinity));
  }
});

test('a damaged save or a save from another version is not continued', () => {
  const s = createGame({ seats: seats(2), seed: 1 }, map30);
  assert.ok('error' in loadGame('{not json'));
  assert.ok('error' in loadGame('null'));
  assert.ok('error' in loadGame(JSON.stringify({ version: SAVE_VERSION })));
  assert.ok('error' in loadGame(JSON.stringify({ version: SAVE_VERSION + 1, state: s })));
  assert.ok('error' in loadGame(JSON.stringify(s))); // no version: older than task 10
  assert.deepEqual(loadGame(saveGame(s)), { state: s });
});
