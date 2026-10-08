import {
  bigCountryParts, blockedByMoney, canPayAfterQuiz, currentPlayer, entryFees, feeTotal, legalActions,
} from './engine.ts';
import { BUSINESS_PRICE, bigCountryPoints, CONTINENT_BONUS, NOMAD_MIN_CONTINENTS, QUIZ_TRIES, TICKET_PRICE, TRAVEL_TURNS, WELCOME_BONUS } from './constants.ts';
import { areaById } from './map.ts';
import { nextRandom } from './rng.ts';
import type { Action, BusinessKind, Continent, GameMap, GameState, Player, RobotLevel, RouteKind } from './types.ts';

// The robot (task 13): the random robot plus simple rules. It scores the legal moves and picks
// the best one, with a hidden random tie-break. One robot, three levels (owner's change, task 13).
// Like the random robot it has its own seed, so it never disturbs the game's dice.

export interface LevelSettings {
  // How often it answers a quiz, exam or challenge question right.
  accuracy: number;
  // Plays a challenge only with at least this many points.
  challengeFrom: number;
  // Points it keeps after paying a ticket or buying a business.
  reserve: number;
}

export const ROBOT_LEVELS: Readonly<Record<RobotLevel, LevelSettings>> = {
  easy: { accuracy: 0.5, challengeFrom: 5, reserve: 5 },
  normal: { accuracy: 0.75, challengeFrom: 3, reserve: 3 },
  hard: { accuracy: 0.9, challengeFrom: 1, reserve: 2 },
};

// Asks for citizenship in the first area it can (not its home country) before this round.
export const ROBOT_CITIZENSHIP_BEFORE = 10;
// From this round the Nomad heads for a 3rd continent.
export const ROBOT_NOMAD_ROUND = 18;
// A new part of a big country gives 0 now, but it is progress: worth more than a visited area.
const PART_PROGRESS = 0.5;
// A trip uses extra turns, so it must give at least 1 point more than the best walk.
const TRIP_EXTRA = 0.99;
const BUY_ORDER: BusinessKind[] = ['tours', 'airline', 'ferry'];

export function robotAction(state: GameState, map: GameMap, seed: number, level?: RobotLevel): [action: Action, nextSeed: number] {
  const actions = legalActions(state, map);
  if (actions.length === 0) throw new Error('No legal actions: the game is over');
  const me = currentPlayer(state);
  // During a sale offer the buyer answers.
  const actor = state.offer ? state.players[state.offer.to] : me;
  const settings = ROBOT_LEVELS[level ?? actor.level ?? 'normal'];
  const rnd = new Rand(seed);
  const action = choose(state, map, actions, me, settings, rnd);
  return [action, rnd.seed];
}

class Rand {
  seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    const [v, s] = nextRandom(this.seed);
    this.seed = s;
    return v;
  }
  // The best items by score (higher is better), one of them at random.
  best<T>(items: T[], score: (t: T) => number[]): T {
    const keyed = items.map((t) => ({ t, k: [...score(t), this.next()] }));
    keyed.sort((a, b) => {
      for (let i = 0; i < a.k.length; i++) if (a.k[i] !== b.k[i]) return b.k[i] - a.k[i];
      return 0;
    });
    return keyed[0].t;
  }
}

function answer(correct: 0 | 1, settings: LevelSettings, rnd: Rand): 0 | 1 {
  return rnd.next() < settings.accuracy ? correct : ((1 - correct) as 0 | 1);
}

function choose(state: GameState, map: GameMap, actions: Action[], me: Player, settings: LevelSettings, rnd: Rand): Action {
  if (actions.length === 1) return actions[0];
  const first = actions[0];

  // A robot buyer accepts a sale offer whenever it can pay (owner's choice, task 9b).
  if (first.type === 'sellAnswer') return actions.find((a) => a.type === 'sellAnswer' && a.accept) ?? first;
  if (first.type === 'answer') return { type: 'answer', choice: answer(state.quiz!.question.correct, settings, rnd) };
  if (first.type === 'challengeAnswer') return { type: 'challengeAnswer', choice: answer(state.challenge!.correct, settings, rnd) };
  if (first.type === 'examAnswer') {
    const exam = me.exam!;
    return { type: 'examAnswer', choice: answer(exam.questions[exam.answers.length].correct, settings, rnd) };
  }
  if (first.type === 'travel') {
    const play = me.points >= settings.challengeFrom;
    return actions.find((a) => a.type === 'travel' && (a.challenge === true) === play) ?? first;
  }
  if (first.type === 'chooseProfile') return actions[Math.floor(rnd.next() * actions.length)];
  if (first.type === 'chooseStart') return chooseStart(map, actions, me, rnd);

  // Buy a business when it keeps the reserve: tours, then airline, then ferry agency.
  const buy = BUY_ORDER.map((kind) => actions.find((a) => a.type === 'buy' && a.business === kind))
    .find((a) => a && me.points - BUSINESS_PRICE[(a as { business: BusinessKind }).business] >= settings.reserve);
  if (buy) return buy;

  // Citizenship: once, in the first area where it can ask, before round 10 (task 14d: asked in
  // the area it stands in; the engine never offers it to the Nomad or in the home country).
  const ask = actions.find((a) => a.type === 'askCitizenship');
  if (ask && state.round < ROBOT_CITIZENSHIP_BEFORE) return ask;

  const moves = actions.filter((a) => a.type === 'walk' || a.type === 'board' || a.type === 'quiz');
  if (moves.length === 0) {
    // Sell only during the "out of money" warning: the dearest business, to the richest buyer.
    const sells = actions.filter((a) => a.type === 'sell');
    if (sells.length > 0 && blockedByMoney(state, map, me)) {
      return rnd.best(sells, (a) => a.type === 'sell' ? [BUSINESS_PRICE[a.business], state.players[a.to].points] : []);
    }
    return actions.find((a) => a.type === 'goHome' || a.type === 'blocked' || a.type === 'lostTurn' || a.type === 'exam') ?? first;
  }
  return chooseMove(state, map, moves, me, settings, rnd);
}

// Start area: the highest welcome bonus, then the most neighbours. The Backpacker avoids the
// Americas and Oceania, where it can't walk to 3 continents (owner-approved, task 13).
function chooseStart(map: GameMap, actions: Action[], me: Player, rnd: Rand): Action {
  const far: Continent[] = ['North America', 'South America', 'Oceania'];
  const area = (a: Action) => areaById(map, (a as { area: string }).area);
  let options = actions;
  if (me.profile === 'backpacker' && actions.some((a) => !far.includes(area(a).continent))) {
    options = actions.filter((a) => !far.includes(area(a).continent));
  }
  return rnd.best(options, (a) => [WELCOME_BONUS[area(a).continent], area(a).neighbours.length]);
}

interface Move {
  action: Action;
  to: string;
  // Points now (arrival, Nomad travel turns) minus fees and ticket.
  gain: number;
  // Turns the move uses.
  turns: number;
  trip: boolean;
}

function chooseMove(state: GameState, map: GameMap, moves: Action[], me: Player, settings: LevelSettings, rnd: Rand): Action {
  const plain = moves;
  const options: Move[] = [];
  const ticket = TICKET_PRICE[me.profile!];
  const tripsSeen = new Set<string>();
  for (const a of plain) {
    if (a.type === 'walk') {
      const fees = feeTotal(entryFees(state, me, me.area, a.to));
      options.push({ action: a, to: a.to, gain: arrivalValue(map, me, a.to) - fees, turns: 1, trip: false });
    } else if (a.type === 'board' || a.type === 'quiz') {
      const key = `${a.kind}:${a.to}`;
      if (tripsSeen.has(key)) continue;
      tripsSeen.add(key);
      const fees = feeTotal(entryFees(state, me, me.area, a.to));
      // Try the free quiz first; after a wrong answer pay, if that keeps the reserve.
      const quiz = plain.find((b) => b.type === 'quiz' && b.kind === a.kind && b.to === a.to);
      const board = plain.find((b) => b.type === 'board' && b.kind === a.kind && b.to === a.to);
      const pay = board && ticket !== null && (me.quizWrong > 0 || !quiz) && me.points - ticket - fees >= settings.reserve;
      const action = pay ? board : quiz;
      if (!action) continue;
      // A last try that sends it home if wrong: only when it can't walk (owner's rule, task 13).
      const lastTry = action === quiz && me.quizWrong >= QUIZ_TRIES - 1 && !canPayAfterQuiz(state, me, a.to);
      if (lastTry && plain.some((b) => b.type === 'walk')) continue;
      const travel = TRAVEL_TURNS[me.profile!][a.kind as RouteKind];
      const nomad = me.profile === 'nomad' ? travel : 0;
      options.push({
        action, to: a.to, trip: true, turns: 1 + travel,
        gain: arrivalValue(map, me, a.to) + nomad - fees - (pay ? ticket! : 0),
      });
    }
  }

  let chosen: Move;
  const nomadTarget = me.profile === 'nomad' && state.round >= ROBOT_NOMAD_ROUND && me.visitedContinents.length < NOMAD_MIN_CONTINENTS;
  if (nomadTarget) {
    // Nomad from round 18 with fewer than 3 continents: the quickest way to a new continent.
    const dist = distances(map, me, (id) => !me.visitedContinents.includes(areaById(map, id).continent));
    chosen = rnd.best(options, (m) => [-(dist.get(m.to)! + m.turns), m.gain]);
  } else {
    const net = (m: Move) => (m.trip ? m.gain - TRIP_EXTRA : m.gain);
    const gaining = options.filter((m) => net(m) > 0);
    if (gaining.length > 0) {
      // Most points now; on a tie, the step with the most unvisited areas next.
      chosen = rnd.best(gaining, (m) => [net(m), unvisitedNext(map, me, m.to)]);
    } else {
      // Nothing new in reach: the quickest way towards an unvisited area (this also stops it
      // walking back and forth), then the cheapest.
      const dist = distances(map, me, (id) => !me.visitedAreas.includes(id));
      chosen = rnd.best(options, (m) => [-(dist.get(m.to)! + m.turns), m.gain, unvisitedNext(map, me, m.to)]);
    }
  }
  return chosen.action;
}

// The points arriving in `to` gives now (as the engine scores it), plus a little for a new
// part of a big country.
export function arrivalValue(map: GameMap, me: Player, to: string): number {
  const area = areaById(map, to);
  let value = 0;
  if (!me.visitedAreas.includes(to)) {
    if (area.bigCountry) {
      const parts = bigCountryParts(map, area.bigCountry);
      value += parts.every((id) => id === to || me.visitedAreas.includes(id)) ? bigCountryPoints(parts.length) : PART_PROGRESS;
    } else {
      value += area.wonder ? 2 : 1;
    }
  }
  if (!me.visitedContinents.includes(area.continent)) {
    value += 2;
    const bonus = CONTINENT_BONUS[me.profile!];
    if (bonus && me.visitedContinents.length + 1 === bonus.continents) value += bonus.points;
  }
  return value;
}

function unvisitedNext(map: GameMap, me: Player, to: string): number {
  return areaById(map, to).neighbours.filter((id) => !me.visitedAreas.includes(id)).length;
}

// Steps from every area to the nearest target area, walking, by plane or by ship (Luxury: any
// airport to any airport, any port to any port).
function distances(map: GameMap, me: Player, target: (id: string) => boolean): Map<string, number> {
  const links = new Map<string, Set<string>>(map.areas.map((a) => [a.id, new Set(a.neighbours)]));
  const routes = map.routes ?? [];
  for (const r of routes) {
    links.get(r.a)!.add(r.b);
    links.get(r.b)!.add(r.a);
  }
  if (me.profile === 'luxury') {
    for (const kind of ['airport', 'port'] as const) {
      const ends = [...new Set(routes.filter((r) => r.kind === kind).flatMap((r) => [r.a, r.b]))];
      for (const a of ends) for (const b of ends) if (a !== b) links.get(a)!.add(b);
    }
  }
  const dist = new Map<string, number>();
  const queue = map.areas.map((a) => a.id).filter(target);
  for (const id of queue) dist.set(id, 0);
  for (let i = 0; i < queue.length; i++) {
    for (const n of links.get(queue[i])!) {
      if (dist.has(n)) continue;
      dist.set(n, dist.get(queue[i])! + 1);
      queue.push(n);
    }
  }
  // Nothing left to reach: every area is equally far.
  for (const a of map.areas) if (!dist.has(a.id)) dist.set(a.id, 0);
  return dist;
}
