import { legalActions } from './engine.ts';
import { randomInt } from './rng.ts';
import type { Action, GameMap, GameState } from './types.ts';

// The random robot: always picks one of the legal moves at random.
// It has its own seed, so it never disturbs the game's dice.
export function randomRobotAction(
  state: GameState,
  map: GameMap,
  seed: number,
): [action: Action, nextSeed: number] {
  const actions = legalActions(state, map);
  if (actions.length === 0) throw new Error('No legal actions: the game is over');
  const [i, next] = randomInt(seed, actions.length);
  return [actions[i], next];
}
