// Balance lab only (owner, 2026-10-11): a test-only planning robot. The game uses its engine version,
// src/engine/planner.ts. The lab results in docs/balance-lab.md were measured on the code of commit
// 01374db (before the balance change); the patches in packages.ts apply to that code only.
// It plays like the normal robot (src/engine/normal-robot.ts) in everything but the move: there it
// looks `depth` moves ahead (walks and trips, with their real turns, tickets, fees, quiz waits, the
// bus's whole country, big countries, whole continents, profile bonuses) and picks the first move of
// the best plan, by discounted points. Other players are not predicted (only the first move checks them).
import { canPayAfterQuiz, continentReward, currentPlayer, destinations, entryFees, feeTotal, legalActions } from '../../src/engine/engine.ts';
import { bigCountryPoints, CONTINENT_BONUS, POINTS_NEW_CONTINENT, QUIZ_TRIES, ROUTE_KINDS, ticketPrice, TRAVEL_TURNS } from '../../src/engine/constants.ts';
import { ROBOT_LEVELS, robotAction } from '../../src/engine/normal-robot.ts';
import { areaById } from '../../src/engine/map.ts';
import type { Action, GameMap, GameState, Player, RobotLevel, RouteKind } from '../../src/engine/types.ts';

export interface PlanLevel { accuracy: RobotLevel; depth: number }

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
    if (dests.length > 4) dests = dests.map((d) => [d, arrive(map, me, s, d, kind === 'bus')[0]] as const).sort((a, b) => b[1] - a[1]).slice(0, 4).map((d) => d[0]);
    for (const to of dests) {
      const f = fees(to);
      const ticket = ticketPrice(me.profile!, kind);
      const pay = ticket !== null && s.points - ticket - f >= reserve;
      if (!pay && f > s.points) continue;
      // Quiz: each wrong try uses a turn; at most QUIZ_TRIES tries.
      const wait = pay ? 0 : Math.min(QUIZ_TRIES - 1, (1 - p) / p);
      const travel = TRAVEL_TURNS[me.profile!][kind];
      const [g, n] = arrive(map, me, s, to, kind === 'bus');
      // The Nomad: +1 per trip (the game's rule since 2026-10-11).
      const nomad = me.profile === 'nomad' && travel > 0 ? 1 : 0;
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

export function planAction(state: GameState, map: GameMap, seed: number, level: PlanLevel): [Action, number] {
  const [base, next] = robotAction(state, map, seed, level.accuracy);
  const isMove = base.type === 'walk' || base.type === 'board' || base.type === 'quiz';
  if (!isMove || level.depth <= 1) return [base, next];
  const me = currentPlayer(state);
  const settings = ROBOT_LEVELS[level.accuracy];
  const legal = legalActions(state, map);
  const s: Sim = {
    area: me.area!, visited: new Set(me.visitedAreas), conts: new Set(me.visitedContinents), bigs: new Set(me.bigCountries),
    full: new Set(me.fullContinents), points: me.points,
  };
  const turnsLeft = state.totalRounds - state.round + 1;
  let choice: Action | null = null, bestValue = -Infinity;
  for (const st of steps(state, map, me, s, settings.reserve, settings.accuracy, true)) {
    let action: Action | undefined;
    if (st.kind === 'walk') action = legal.find((a) => a.type === 'walk' && a.to === st.to);
    else {
      const quiz = legal.find((a) => a.type === 'quiz' && a.kind === st.kind && a.to === st.to);
      const board = legal.find((a) => a.type === 'board' && a.kind === st.kind && a.to === st.to);
      const ticket = ticketPrice(me.profile!, st.kind);
      const fees = feeTotal(entryFees(state, me, me.area, st.to));
      const pay = board && ticket !== null && (me.quizWrong > 0 || !quiz) && me.points - ticket - fees >= settings.reserve;
      action = pay ? board : quiz;
      // A last quiz try that would send it home: only when it can't walk (as the robot).
      if (action === quiz && me.quizWrong >= QUIZ_TRIES - 1 && !canPayAfterQuiz(state, me, st.kind, st.to) && legal.some((a) => a.type === 'walk')) action = undefined;
    }
    if (!action || st.turns > turnsLeft) continue;
    const value = Math.pow(GAMMA, st.turns) * (st.gain + best(state, map, me, st.sim, level.depth - 1, turnsLeft - st.turns, settings.reserve, settings.accuracy));
    if (value > bestValue + 1e-9) { bestValue = value; choice = action; }
  }
  // Nothing worth points in the plan: the normal robot's way (towards the nearest new area).
  return [bestValue > 0.05 && choice ? choice : base, next];
}
