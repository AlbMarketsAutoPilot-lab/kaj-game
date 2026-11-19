import { START_CONTINENTS } from '../src/engine/constants.ts';
import { apply, createGame, currentPlayer } from '../src/engine/engine.ts';
import { travelGroups, visaUnits } from '../src/engine/stuck-check.ts';
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
  continentRewards = false,
  startCitizenships = false,
): GameState {
  // Event cards are off by default here, so rule tests can count exact points; whole-continent
  // rewards too (owner, M5), as the test maps' continents have 1 to 3 areas. The start citizenships
  // of step 2.6 too (they would charge visas on unrelated moves); tests/citizenship.test.ts turns them on.
  let s = createGame({ seats: seats(starts.length), seed, eventCards, continentRewards }, map);
  while (s.phase === 'chooseProfile') {
    const taken = new Set(s.players.map((p) => p.profile));
    s = apply(s, map, { type: 'chooseProfile', profile: profiles.find((p) => !taken.has(p))! });
  }
  for (const area of starts) s = apply(s, map, { type: 'chooseStart', area });
  if (!startCitizenships) for (const p of s.players) p.citizenship = null;
  return s;
}

export function walk(s: GameState, to: string): GameState {
  return apply(s, testMap, { type: 'walk', to });
}

export function seatOf(s: GameState, k: number) {
  return s.players[s.turnOrder[k]];
}

// Answers a visa test in progress (step 2.6): all right, or (fail) all wrong.
export function passVisaTest(s: GameState, map: GameMap = testMap, fail = false): GameState {
  if (!s.visa) throw new Error('no visa test in progress');
  while (s.visa) {
    const q = s.visa.questions[s.visa.answers.length];
    s = apply(s, map, { type: 'visaAnswer', choice: (fail ? 1 - q.correct : q.correct) as 0 | 1 });
  }
  return s;
}

export { currentPlayer, testMap };

// Step 2.6: every set of 3 start citizenships (homes on 3 different start continents, as the setup
// allows) and how many of them cut some area off, by the stuck-state checker's method (walking,
// planes, ships). The known limit: only while a player has fewer than 2 points; "go home" is the way out.
export function startTriples(map: GameMap): { sets: number; traps: number } {
  const units = visaUnits(map);
  const continentOf = new Map(map.areas.map((a) => [a.id, a.continent]));
  const homes = units.map((u) => new Set(u.map((id) => continentOf.get(id)!).filter((c) => START_CONTINENTS.includes(c))));
  const apart = (a: number, b: number, c: number) =>
    [...homes[a]].some((x) => [...homes[b]].some((y) => y !== x && [...homes[c]].some((z) => z !== x && z !== y)));
  let sets = 0;
  let traps = 0;
  for (let a = 0; a < units.length; a++) {
    for (let b = a + 1; b < units.length; b++) {
      for (let c = b + 1; c < units.length; c++) {
        if (!apart(a, b, c)) continue;
        sets++;
        if (travelGroups(map, new Set([...units[a], ...units[b], ...units[c]])).length > 1) traps++;
      }
    }
  }
  return { sets, traps };
}
