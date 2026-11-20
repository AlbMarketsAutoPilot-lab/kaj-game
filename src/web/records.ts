// Records on this device (step 2.10, owner): the top 10 wins by a person, one list per game length,
// ranked by points (then more areas; on a full tie the older win stays ahead). Robots never enter.
// Kept in the browser's storage under RECORDS_KEY; a browser that blocks storage keeps none.

import type { Profile } from '../engine/types.ts';

export const RECORDS_KEY = 'kaj-records';
export const RECORDS_TOP = 10;

export interface WinRecord {
  points: number;
  areas: number;
  continents: number;
  profile: Profile;
  players: number;
  date: string; // YYYY-MM-DD, the day the game ended
}
export type Records = Record<string, WinRecord[]>; // by game length: '30', '50'

// Better first: more points, then more areas. Equal records keep their order (older first).
const better = (a: WinRecord, b: WinRecord) => b.points - a.points || b.areas - a.areas;

// Adds a win to its list. Returns the new records and the win's place (1 = best), or null when it
// is not in the top 10.
export function addWin(records: Records, turns: number, win: WinRecord): { records: Records; place: number | null } {
  const list = [...(records[String(turns)] ?? []), win].sort(better);
  const place = list.indexOf(win) + 1;
  return {
    records: { ...records, [String(turns)]: list.slice(0, RECORDS_TOP) },
    place: place <= RECORDS_TOP ? place : null,
  };
}

const isWin = (w: unknown): w is WinRecord => typeof w === 'object' && w !== null
  && ['points', 'areas', 'continents', 'players'].every((k) => typeof (w as Record<string, unknown>)[k] === 'number')
  && typeof (w as WinRecord).profile === 'string' && typeof (w as WinRecord).date === 'string';

// Reads the records; anything unreadable counts as no records.
export function parseRecords(text: string | null): Records {
  try {
    const raw: unknown = JSON.parse(text ?? '{}');
    if (typeof raw !== 'object' || raw === null) return {};
    const out: Records = {};
    for (const [k, v] of Object.entries(raw)) if (Array.isArray(v)) out[k] = v.filter(isWin).sort(better).slice(0, RECORDS_TOP);
    return out;
  } catch {
    return {};
  }
}

export function loadRecords(): Records {
  try { return parseRecords(localStorage.getItem(RECORDS_KEY)); } catch { return {}; }
}
export function saveRecords(r: Records): void {
  try { localStorage.setItem(RECORDS_KEY, JSON.stringify(r)); } catch { /* not kept */ }
}

export const ordinal = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
