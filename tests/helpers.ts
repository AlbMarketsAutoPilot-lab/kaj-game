import { apply, createGame, currentPlayer } from '../src/engine/engine.ts';
import type { GameMap, GameState, Profile, SeatConfig } from '../src/engine/types.ts';
import { testMap } from './fixtures/test-map.ts';

export const COLOURS = ['red', 'blue', 'green', 'yellow'];

export function seats(n: number, robots = 0): SeatConfig[] {
  return Array.from({ length: n }, (_, i) => ({
    kind: i < n - robots ? 'human' : 'robot',
    colour: COLOURS[i],
  }));
}

// Plays the setup phases. starts[k] is the start area of the k-th player in turn order;
// profiles are taken in the order given (the first one still free).
export function startedGame(
  starts: string[],
  seed = 1,
  map: GameMap = testMap,
  profiles: Profile[] = ['backpacker', 'business', 'luxury', 'nomad'],
  eventCards = false,
): GameState {
  // Event cards are off by default here, so rule tests can count exact points.
  let s = createGame({ seats: seats(starts.length), seed, eventCards }, map);
  while (s.phase === 'chooseProfile') {
    const taken = new Set(s.players.map((p) => p.profile));
    s = apply(s, map, { type: 'chooseProfile', profile: profiles.find((p) => !taken.has(p))! });
  }
  for (const area of starts) s = apply(s, map, { type: 'chooseStart', area });
  return s;
}

export function walk(s: GameState, to: string): GameState {
  return apply(s, testMap, { type: 'walk', to });
}

export function seatOf(s: GameState, k: number) {
  return s.players[s.turnOrder[k]];
}

export { currentPlayer, testMap };
