// Planning robots (owner, 2026-10-11, measured in docs/balance-lab.md): the normal robot looks
// 2 moves ahead and the hard robot 3; the easy robot doesn't plan. The robot (normal-robot.ts) makes
// every other choice; for a move, the planner looks `depth` moves ahead (walks and trips with their real
// turns, tickets, fees, quiz waits, the bus's whole country, big countries, whole continents and profile
// bonuses) and picks the first move of the plan worth the most points, a point k turns later counting
// GAMMA^k. Other players are not predicted (only the first move checks them). The same algorithm as the
// balance lab's test robot (scripts/balance-lab/planner.ts).
import { canPayAfterQuiz, continentReward, destinations, entryFees, feeTotal } from './engine.ts';
import { bigCountryPoints, CONTINENT_BONUS, POINTS_NEW_CONTINENT, POINTS_NOMAD_TRIP, QUIZ_TRIES, ROUTE_KINDS, ticketPrice, TRAVEL_TURNS, wholeCountryTrip } from './constants.ts';
import { areaById } from './map.ts';
import type { Action, GameMap, GameState, Player, RouteKind } from './types.ts';

interface Sim { area: string; visited: Set<string>; conts: Set<string>; bigs: Set<string>; full: Set<string>; points: number }
interface Step { to: string; kind: RouteKind | 'walk'; gain: number; turns: number; sim: Sim }

const partsCache = new WeakMap<GameMap, Map<string, string[]>>();
function parts(map: GameMap, country: string): string[] {
  let m = partsCache.get(map);
  if (!m) { m = new Map(); partsCache.set(map, m); }
  if (!m.has(country)) m.set(country, map.areas.filter((a) => a.bigCountry === country).map((a) => a.id));
  return m.get(country)!;
}

// Points for arriving in `to` (as the engine scores it; a surprise is secret, as for the robots).
function arrive(map: GameMap, me: Player, s: Sim, to: string, byBus: boolean): [number, Sim] {
  const n: Sim = { ...s, area: to, visited: new Set(s.visited), conts: new Set(s.conts), bigs: new Set(s.bigs), full: new Set(s.full) };
  const area = areaById(map, to);
  let gain = 0;
  if (!n.visited.has(to)) {
    n.visited.add(to);
    const c = area.bigCountry;
    if (c) {
      if (n.bigs.has(c)) gain += 1;
      else if (byBus || parts(map, c).every((id) => n.visited.has(id))) { gain += bigCountryPoints(parts(map, c).length); n.bigs.add(c); }
    } else gain += area.wonder ? 2 : 1;
    if (!n.full.has(area.continent) && map.areas.every((a) => a.continent !== area.continent || n.visited.has(a.id))) {
      gain += continentReward(map, area.continent); n.full.add(area.continent);
    }
  }
  if (!n.conts.has(area.continent)) {
    n.conts.add(area.continent);
    gain += POINTS_NEW_CONTINENT;
    const bonus = CONTINENT_BONUS[me.profile!];
    if (bonus && n.conts.size === bonus.continents) gain += bonus.points;
  }
  return [gain, n];
}

function steps(state: GameState, map: GameMap, me: Player, s: Sim, reserve: number, p: number, first: boolean): Step[] {
  const out: Step[] = [];
  const fees = (to: string) => feeTotal(entryFees(state, { ...me, area: s.area }, s.area, to));
  for (const to of areaById(map, s.area).neighbours) {
    const f = fees(to);
    if (f > s.points) continue;
    const [g, n] = arrive(map, me, s, to, false);
    n.points += g - f;
    out.push({ to, kind: 'walk', gain: g - f, turns: 1, sim: n });
  }
  for (const kind of ROUTE_KINDS) {
    let dests = destinations(map, s.area, kind, me.profile!);
    if (dests.length === 0) continue;
    // Luxury may go to any airport or port: only the 4 best first arrivals are looked at.
    if (dests.length > 4) dests = dests.map((d) => [d, arrive(map, me, s, d, wholeCountryTrip(kind))[0]] as const).sort((a, b) => b[1] - a[1]).slice(0, 4).map((d) => d[0]);
    for (const to of dests) {
      const f = fees(to);
      const ticket = ticketPrice(me.profile!, kind);
      const pay = ticket !== null && s.points - ticket - f >= reserve;
      if (!pay && f > s.points) continue;
      // The car has no quiz (task 19): pay, or the Backpacker hitchhikes (robots don't know the secret).
      if (kind === 'car' && !pay && ticket !== null) continue;
      // Quiz: each wrong try uses a turn; at most QUIZ_TRIES tries.
      const wait = pay || kind === 'car' ? 0 : Math.min(QUIZ_TRIES - 1, (1 - p) / p);
      const travel = TRAVEL_TURNS[me.profile!][kind];
      const [g, n] = arrive(map, me, s, to, wholeCountryTrip(kind));
      const nomad = me.profile === 'nomad' && travel > 0 ? POINTS_NOMAD_TRIP : 0;
      const gain = g + nomad - f - (pay ? ticket! : 0);
      n.points += gain;
      // Boarding uses a turn (the area was entered on an earlier turn, except on the first step).
      out.push({ to, kind, gain, turns: 1 + travel + wait, sim: n });
    }
  }
  return out;
}

// Discount: a point k turns later is worth GAMMA^k now. At the end of a plan, each unvisited
// neighbour (at most 3) is worth FRONTIER, so a plan doesn't end in a dead end.
const GAMMA = 0.85;
const FRONTIER = 0.4;
function frontier(map: GameMap, s: Sim): number {
  return FRONTIER * Math.min(3, areaById(map, s.area).neighbours.filter((id) => !s.visited.has(id)).length);
}
// Best discounted points over the next `depth` moves, within the turns left in the game.
function best(state: GameState, map: GameMap, me: Player, s: Sim, depth: number, turnsLeft: number, reserve: number, p: number): number {
  if (depth === 0 || turnsLeft <= 0) return frontier(map, s);
  let top = frontier(map, s) * GAMMA;
  for (const st of steps(state, map, me, s, reserve, p, false)) {
    if (st.turns > turnsLeft) continue;
    const d = Math.pow(GAMMA, st.turns);
    top = Math.max(top, d * (st.gain + best(state, map, me, st.sim, depth - 1, turnsLeft - st.turns, reserve, p)));
  }
  return top;
}

// The planned move, or null when no plan is worth points (then the robot's own move stands).
export function planMove(state: GameState, map: GameMap, me: Player, legal: Action[], depth: number, reserve: number, accuracy: number): Action | null {
  const s: Sim = {
    area: me.area!, visited: new Set(me.visitedAreas), conts: new Set(me.visitedContinents), bigs: new Set(me.bigCountries),
    full: new Set(me.fullContinents), points: me.points,
  };
  const turnsLeft = state.totalRounds - state.round + 1;
  let choice: Action | null = null, bestValue = -Infinity;
  for (const st of steps(state, map, me, s, reserve, accuracy, true)) {
    let action: Action | undefined;
    if (st.kind === 'walk') action = legal.find((a) => a.type === 'walk' && a.to === st.to);
    else if (st.kind === 'car' && ticketPrice(me.profile!, 'car') === null) action = legal.find((a) => a.type === 'hitchhike' && a.to === st.to);
    else {
      const quiz = legal.find((a) => a.type === 'quiz' && a.kind === st.kind && a.to === st.to);
      const board = legal.find((a) => a.type === 'board' && a.kind === st.kind && a.to === st.to);
      const ticket = ticketPrice(me.profile!, st.kind);
      const fees = feeTotal(entryFees(state, me, me.area, st.to));
      const pay = board && ticket !== null && (me.quizWrong > 0 || !quiz) && me.points - ticket - fees >= reserve;
      action = pay ? board : quiz;
      // A last quiz try that would send it home: only when it can't walk (as the robot).
      if (action === quiz && me.quizWrong >= QUIZ_TRIES - 1 && !canPayAfterQuiz(state, me, st.kind, st.to) && legal.some((a) => a.type === 'walk')) action = undefined;
    }
    if (!action || st.turns > turnsLeft) continue;
    const value = Math.pow(GAMMA, st.turns) * (st.gain + best(state, map, me, st.sim, depth - 1, turnsLeft - st.turns, reserve, accuracy));
    if (value > bestValue + 1e-9) { bestValue = value; choice = action; }
  }
  return bestValue > 0.05 ? choice : null;
}
