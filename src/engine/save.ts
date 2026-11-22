import type { GameState } from './types.ts';

// Saved games carry this number. A save from another version is never continued, so a game
// is never scored by rules that did not exist when its moves were made.
// Version 11: the 50-turn map (task M2). Version 12 (owner, M5): new rules for both games (the bus,
// whole continents, Madagascar), so no older save is continued. Version 13 (owner, 2026-10-11): the
// profile balance and the planning robots, for both games. Version 14 (owner, task 19): the car.
// Version 15 (2.0, step 2.1): each player's seen questions (the rotation); no older save is continued.
// Version 16 (2.0, step 2.4): new plane and ship routes on both maps; no older save is continued.
// Version 17 (2.0, step 2.5): Nomad boss alerts, the car to Canada West. Version 18 (2.0, step 2.6):
// citizenship from turn 1, the visa test, the Business's 2nd citizenship, the event-card mix; no older
// save is continued. Version 19 (2.0, step 2.7): paid trips fast, free trips slow, new prices, go home +2,
// Luxury +5 at the start, the most-businesses bonus; no older save is continued. Version 20 (2.0, step 2.8):
// news cards about the country, all 45 drawn everywhere, one card mix per map; no older save is continued.
// Version 21 (2.0, step 2.11): the 5th profile, Kris Ann, her own cards, the new card mix; no older save is continued.
// Version 22 (2.0, step 2.12): the 100-turn map, catch-up cards and new card mixes on every map; no older save is continued.
export const SAVE_VERSION = 22;

export function saveGame(state: GameState): string {
  return JSON.stringify({ version: SAVE_VERSION, state });
}

// The saved game, or the reason it can't be continued.
export function loadGame(text: string): { state: GameState } | { error: string } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { error: 'The saved game is damaged.' };
  }
  if (typeof data !== 'object' || data === null) return { error: 'The saved game is damaged.' };
  const { version, state } = data as { version?: unknown; state?: GameState };
  if (version !== SAVE_VERSION) return { error: 'The saved game is from another version of KAJ.' };
  if (typeof state !== 'object' || state === null || !Array.isArray(state.players) || typeof state.round !== 'number') {
    return { error: 'The saved game is damaged.' };
  }
  return { state };
}
