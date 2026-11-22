import type { GameLength } from '../engine/constants.ts';
import type { GameMap } from '../engine/types.ts';
import { map30 } from './map30.ts';
import { map50 } from './map50.ts';
import { map100 } from './map100.ts';

// The map choice in the game setup (task M2): the 30-turn map (default) or the 50-turn map. Step 2.12 (part J2): the
// 100-turn map (not in the setup screen until part J5).
const BY_LENGTH: Readonly<Record<GameLength, GameMap>> = { 30: map30, 50: map50, 100: map100 };

export function mapFor(turns: GameLength = 30): GameMap {
  return BY_LENGTH[turns];
}

// The map of a saved game (GameState.mapId).
export function mapById(id: string): GameMap | undefined {
  return Object.values(BY_LENGTH).find((m) => m.id === id);
}
