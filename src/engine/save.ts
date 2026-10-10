import type { GameState } from './types.ts';

// Saved games carry this number. A save from another version is never continued, so a game
// is never scored by rules that did not exist when its moves were made.
// Version 11: the 50-turn map (task M2). Version 12 (owner, M5): new rules for both games (the bus,
// whole continents, Madagascar), so no older save is continued.
export const SAVE_VERSION = 12;

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
