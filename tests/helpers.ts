import { apply, createGame, currentPlayer } from '../src/engine/engine.ts';
import type { GameState, Profile, SeatConfig } from '../src/engine/types.ts';
import { testMap } from './fixtures/test-map.ts';

export const COLOURS = ['red', 'blue', 'green', 'yellow'];

export function seats(n: number, robots = 0): SeatConfig[] {
  return Array.from({ length: n }, (_, i) => ({
    kind: i < n - robots ? 'human' : 'robot',
    colour: COLOURS[i],
  }));
}

// Plays the setup phases. starts[k] is the start area of the k-th player in turn order.
export function startedGame(starts: string[], seed = 1): GameState {
  let s = createGame({ seats: seats(starts.length), seed }, testMap);
  const profiles: Profile[] = ['backpacker', 'business', 'luxury', 'nomad'];
  while (s.phase === 'chooseProfile') {
    const taken = new Set(s.players.map((p) => p.profile));
    s = apply(s, testMap, { type: 'chooseProfile', profile: profiles.find((p) => !taken.has(p))! });
  }
  for (const area of starts) s = apply(s, testMap, { type: 'chooseStart', area });
  return s;
}

export function walk(s: GameState, to: string): GameState {
  return apply(s, testMap, { type: 'walk', to });
}

export function seatOf(s: GameState, k: number) {
  return s.players[s.turnOrder[k]];
}

export { currentPlayer, testMap };
