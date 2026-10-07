import {
  EXAM_QUESTIONS,
  MAX_ROBOTS,
  MAX_SEATS,
  MIN_SEATS,
  POINTS_BIG_COUNTRY_AREA,
  POINTS_BUSINESS_CITIZENSHIP,
  POINTS_NEW_AREA,
  POINTS_NEW_CONTINENT,
  POINTS_NOMAD_TRAVEL_TURN,
  POINTS_WONDER,
  PROFILES,
  QUIZ_TRIES,
  START_CONTINENTS,
  TICKET_PRICE,
  TOTAL_ROUNDS,
  TRAVEL_TURNS,
  VISA_PRICE,
  WELCOME_BONUS,
} from './constants.ts';
import { areaById, validateMap } from './map.ts';
import { makeExam, makeQuestion } from './quiz.ts';
import { randomInt } from './rng.ts';
import type {
  Action,
  Area,
  Exam,
  GameConfig,
  GameMap,
  GameResult,
  GameState,
  Player,
  Profile,
  QuizQuestion,
  RouteKind,
} from './types.ts';

export function createGame(config: GameConfig, map: GameMap): GameState {
  const { seats } = config;
  if (seats.length < MIN_SEATS || seats.length > MAX_SEATS) {
    throw new Error(`A game needs ${MIN_SEATS}–${MAX_SEATS} seats`);
  }
  if (seats.filter((s) => s.kind === 'robot').length > MAX_ROBOTS) {
    throw new Error(`At most ${MAX_ROBOTS} robots`);
  }
  if (!seats.some((s) => s.kind === 'human')) {
    throw new Error('At least one seat must be human');
  }
  const problems = validateMap(map);
  if (problems.length > 0) throw new Error(`Invalid map: ${problems.join('; ')}`);
  const startable = new Set(
    map.areas.map((a) => a.continent).filter((c) => START_CONTINENTS.includes(c)),
  );
  if (startable.size < seats.length) {
    throw new Error('The map has fewer starting continents than seats');
  }

  // Random first player, then always the same order.
  const [first, rng] = randomInt(config.seed | 0, seats.length);
  const turnOrder = seats.map((_, i) => (first + i) % seats.length);

  const players: Player[] = seats.map((s, seat) => ({
    seat,
    kind: s.kind,
    colour: s.colour,
    profile: null,
    startContinent: null,
    area: null,
    points: 0,
    visitedAreas: [],
    visitedContinents: [],
    travel: null,
    quizWrong: 0,
    askedCitizenship: false,
    citizenship: null,
    exam: null,
  }));

  return {
    mapId: map.id,
    phase: 'chooseProfile',
    rng,
    players,
    turnOrder,
    current: 0,
    round: 0,
    totalRounds: TOTAL_ROUNDS,
    quiz: null,
    result: null,
  };
}

export function currentPlayer(state: GameState): Player {
  return state.players[state.turnOrder[state.current]];
}

export function legalActions(state: GameState, map: GameMap): Action[] {
  checkMap(state, map);
  const me = currentPlayer(state);

  switch (state.phase) {
    case 'chooseProfile': {
      const taken = new Set(state.players.map((p) => p.profile));
      return PROFILES.filter((p) => !taken.has(p)).map((profile) => ({
        type: 'chooseProfile',
        profile,
      }));
    }
    case 'chooseStart': {
      const takenContinents = new Set(state.players.map((p) => p.startContinent));
      return map.areas
        .filter((a) => START_CONTINENTS.includes(a.continent))
        .filter((a) => !takenContinents.has(a.continent))
        .map((a) => ({ type: 'chooseStart', area: a.id }));
    }
    case 'play': {
      if (state.quiz) return [{ type: 'answer', choice: 0 }, { type: 'answer', choice: 1 }];
      // During a citizenship request the player stays; Luxury moves on once it is granted.
      if (me.exam && me.exam.stage !== 'granted') {
        return me.exam.stage === 'test'
          ? [{ type: 'examAnswer', choice: 0 }, { type: 'examAnswer', choice: 1 }]
          : [{ type: 'exam' }];
      }
      if (me.travel) return [{ type: 'travel' }];
      const occupied = occupiedAreas(state, me.seat);
      const moves: Action[] = [];
      for (const to of areaById(map, me.area!).neighbours) {
        if (occupied.has(to)) continue;
        // No money, no visa: an area whose visa the player can't pay can't be entered.
        if (visaOwner(state, me, me.area, to) && me.points < VISA_PRICE) continue;
        moves.push(...withCitizenship(state, map, me, to, { type: 'walk', to }));
      }
      moves.push(...tripActions(state, me, map));
      return moves.length > 0 ? moves : [{ type: 'blocked' }];
    }
    case 'finished':
      return [];
  }
}

export function apply(state: GameState, map: GameMap, action: Action): GameState {
  if (!isLegal(state, map, action)) {
    throw new Error(`Illegal action: ${JSON.stringify(action)}`);
  }
  const next = structuredClone(state);
  const me = currentPlayer(next);
  // Luxury's "citizenship granted" turn: the request is over once the player moves on.
  if (me.exam?.stage === 'granted') me.exam = null;

  switch (action.type) {
    case 'chooseProfile': {
      me.profile = action.profile;
      advanceSetup(next);
      // The last player to choose gets the one profile left.
      const left = PROFILES.filter((p) => !next.players.some((q) => q.profile === p));
      if (next.phase === 'chooseProfile' && next.current === next.players.length - 1 && left.length === 1) {
        currentPlayer(next).profile = left[0];
        advanceSetup(next);
      }
      return next;
    }
    case 'chooseStart': {
      const area = areaById(map, action.area);
      me.startContinent = area.continent;
      me.area = area.id;
      // The starting area counts as visited but earns no area point;
      // the welcome bonus replaces it (see docs/engine.md).
      me.visitedAreas.push(area.id);
      me.visitedContinents.push(area.continent);
      me.points = addPoints(me.points, WELCOME_BONUS[area.continent]);
      advanceSetup(next);
      return next;
    }
    case 'walk': {
      me.quizWrong = 0;
      const owner = visaOwner(next, me, me.area, action.to);
      if (owner) payVisa(me, owner);
      arrive(next, map, me, areaById(map, action.to), action.citizenship === true);
      endTurn(next, map);
      return next;
    }
    case 'board':
      depart(next, map, me, action.kind, action.to, TICKET_PRICE[me.profile!]!, action.citizenship === true);
      endTurn(next, map);
      return next;
    case 'quiz': {
      // The question is about the destination. The turn goes on: the next move is the answer.
      const [question, rng] = makeQuestion(map, action.to, next.rng);
      next.rng = rng;
      next.quiz = { kind: action.kind, to: action.to, question, ...(action.citizenship ? { citizenship: true as const } : {}) };
      return next;
    }
    case 'answer': {
      const quiz = next.quiz!;
      next.quiz = null;
      const ask = quiz.citizenship === true;
      if (action.choice === quiz.question.correct) {
        depart(next, map, me, quiz.kind, quiz.to, 0, ask); // free ticket
      } else {
        me.quizWrong += 1;
        // After the 3rd wrong answer a player who can pay (ticket and any visa) must pay
        // and board now. A player who can't pay may keep trying on later turns, or walk away.
        const price = TICKET_PRICE[me.profile!];
        const visa = visaOwner(next, me, me.area, quiz.to) ? VISA_PRICE : 0;
        if (price !== null && me.quizWrong >= QUIZ_TRIES && me.points >= price + visa) {
          depart(next, map, me, quiz.kind, quiz.to, price, ask);
        }
      }
      endTurn(next, map);
      return next;
    }
    case 'exam': {
      const exam = me.exam!;
      if (exam.stage === 'submitted') exam.stage = 'test';
      else if (exam.stage === 'result' && !passed(exam)) exam.stage = 'learning';
      else me.exam = null; // granted (at the start of this turn): moves again next turn
      endTurn(next, map);
      return next;
    }
    case 'examAnswer': {
      const exam = me.exam!;
      exam.answers.push(action.choice);
      // The 3 answers come in one turn; the turn ends after the last one.
      if (exam.answers.length < exam.questions.length) return next;
      exam.stage = 'result';
      endTurn(next, map);
      return next;
    }
    case 'travel': {
      const trip = me.travel!;
      if (me.profile === 'nomad') me.points = addPoints(me.points, POINTS_NOMAD_TRAVEL_TURN);
      if (trip.turnsLeft > 0) trip.turnsLeft -= 1;
      if (trip.turnsLeft === 0) land(next, map, me);
      endTurn(next, map);
      return next;
    }
    case 'blocked':
      endTurn(next, map);
      return next;
  }
}

// Where a plane (airport) or ship (port) can go from an area: its fixed routes.
// Luxury: any other airport (by plane) or any other port (by ship).
export function destinations(map: GameMap, from: string, kind: RouteKind, profile: Profile): string[] {
  const routes = (map.routes ?? []).filter((r) => r.kind === kind);
  if (!routes.some((r) => r.a === from || r.b === from)) return [];
  if (profile === 'luxury') {
    const all = new Set(routes.flatMap((r) => [r.a, r.b]));
    all.delete(from);
    return [...all];
  }
  return routes.flatMap((r) => (r.a === from ? [r.b] : r.b === from ? [r.a] : []));
}

// Boarding options in the player's area: pay the ticket (if they can) or try the quiz.
// Every profile may always try the quiz, so a trip is always possible from an airport or port,
// except to a visa area the player can't pay: the visa needs 2 points even with a free ticket.
function tripActions(state: GameState, me: Player, map: GameMap): Action[] {
  const out: Action[] = [];
  const price = TICKET_PRICE[me.profile!];
  for (const kind of ['airport', 'port'] as const) {
    for (const to of destinations(map, me.area!, kind, me.profile!)) {
      const visa = visaOwner(state, me, me.area, to) ? VISA_PRICE : 0;
      if (price !== null && me.points >= price + visa) {
        out.push(...withCitizenship(state, map, me, to, { type: 'board', kind, to }));
      }
      if (me.points >= visa) out.push(...withCitizenship(state, map, me, to, { type: 'quiz', kind, to }));
    }
  }
  return out;
}

// A move, plus the same move with a citizenship request where the player could still get one.
function withCitizenship<A extends Action & { to: string }>(state: GameState, map: GameMap, me: Player, to: string, action: A): A[] {
  return canAskCitizenship(state, map, me, to) ? [action, { ...action, citizenship: true }] : [action];
}

function depart(
  state: GameState, map: GameMap, me: Player, kind: RouteKind, to: string, ticket: number, ask: boolean,
): void {
  // Task 9: the ticket goes to the owner of the departure airport or port.
  // Until there are owners it goes to nobody (there is no bank).
  me.points = addPoints(me.points, -ticket);
  me.travel = { kind, from: me.area!, to, turnsLeft: TRAVEL_TURNS[me.profile!][kind], ...(ask ? { citizenship: true as const } : {}) };
  me.area = null;
  me.quizWrong = 0;
  if (me.travel.turnsLeft === 0) land(state, map, me);
}

// Two players are never in one area: if the destination is taken, the plane or ship
// waits and tries again at the end of the next travel turn. It also waits if the player
// can't pay the destination's visa (no money, no entry).
function land(state: GameState, map: GameMap, me: Player): void {
  const trip = me.travel!;
  if (occupiedAreas(state, me.seat).has(trip.to)) return;
  const owner = visaOwner(state, me, trip.from, trip.to);
  if (owner && me.points < VISA_PRICE) return;
  if (owner) payVisa(me, owner);
  me.travel = null;
  arrive(state, map, me, areaById(map, trip.to), trip.citizenship === true);
}

// ---------- visas and citizenship (rulebook sections 7 and 8, docs/engine.md task 8) ----------

// The areas one citizenship covers: the area, or every part of its big country.
export function citizenshipAreas(map: GameMap, areaId: string): string[] {
  const area = areaById(map, areaId);
  return area.bigCountry ? bigCountryParts(map, area.bigCountry) : [area.id];
}

// The player who is owed a visa when `me` goes from `from` (null: from nowhere) into `to`.
// Moving inside the citizenship's own areas (a big country) is free.
export function visaOwner(state: GameState, me: Player, from: string | null, to: string): Player | null {
  const owner = state.players.find((p) => p.seat !== me.seat && p.citizenship?.includes(to));
  if (!owner || (from !== null && owner.citizenship!.includes(from))) return null;
  return owner;
}

function payVisa(me: Player, owner: Player): void {
  me.points = addPoints(me.points, -VISA_PRICE);
  owner.points = addPoints(owner.points, VISA_PRICE);
}

// Citizenship can be asked on arrival in a new area, once per game, never by the Nomad,
// and only where nobody holds it or is asking for it (one citizen per area or big country).
export function canAskCitizenship(state: GameState, map: GameMap, me: Player, areaId: string): boolean {
  if (me.profile === 'nomad' || me.askedCitizenship || me.visitedAreas.includes(areaId)) return false;
  const covered = citizenshipAreas(map, areaId);
  return !state.players.some(
    (p) => p.citizenship?.includes(areaId) || (p.exam !== null && covered.includes(p.exam.area)),
  );
}

// The arrival turn: "your request has been submitted". The questions are drawn now
// (nothing is secret in v1); Luxury needs no test.
function submitCitizenship(state: GameState, map: GameMap, me: Player, areaId: string): void {
  me.askedCitizenship = true;
  let questions: QuizQuestion[] = [];
  if (me.profile !== 'luxury') [questions, state.rng] = makeExam(map, areaId, EXAM_QUESTIONS, state.rng);
  me.exam = { area: areaId, stage: 'submitted', questions, answers: [] };
}

function passed(exam: Exam): boolean {
  return exam.questions.every((q, i) => exam.answers[i] === q.correct);
}

function grantCitizenship(map: GameMap, me: Player): void {
  me.citizenship = citizenshipAreas(map, me.exam!.area);
  if (me.profile === 'business') me.points = addPoints(me.points, POINTS_BUSINESS_CITIZENSHIP);
}

// Start of a player's turn: citizenship is granted at the start of turn 1 (Luxury),
// turn 3 (all answers right) or turn 4 (after the learning turn).
function startTurn(state: GameState, map: GameMap): void {
  const me = currentPlayer(state);
  const exam = me.exam;
  if (!exam) return;
  if (exam.stage === 'submitted' && me.profile === 'luxury') {
    grantCitizenship(map, me);
    exam.stage = 'granted';
  } else if ((exam.stage === 'result' && passed(exam)) || exam.stage === 'learning') {
    grantCitizenship(map, me);
  }
}

// Scoring for arriving in an area (rulebook section 3), by walking, plane or ship,
// and the citizenship request if the player asked for one (and the area can still take it).
function arrive(state: GameState, map: GameMap, me: Player, area: Area, ask: boolean): void {
  const asking = ask && canAskCitizenship(state, map, me, area.id);
  me.area = area.id;
  if (!me.visitedAreas.includes(area.id)) {
    me.visitedAreas.push(area.id);
    if (area.bigCountry) {
      // All or nothing: a part gives 0 until every part is visited, then +1 +N once.
      // Visited parts are kept, so a player can leave and continue later.
      const parts = bigCountryParts(map, area.bigCountry);
      if (parts.every((id) => me.visitedAreas.includes(id))) {
        me.points = addPoints(me.points, POINTS_BIG_COUNTRY_AREA + parts.length);
      }
    } else {
      me.points = addPoints(me.points, POINTS_NEW_AREA);
      if (area.wonder) me.points = addPoints(me.points, POINTS_WONDER);
    }
  }
  if (!me.visitedContinents.includes(area.continent)) {
    me.visitedContinents.push(area.continent);
    me.points = addPoints(me.points, POINTS_NEW_CONTINENT);
  }
  if (asking) submitCitizenship(state, map, me, area.id);
}

export function bigCountryParts(map: GameMap, country: string): string[] {
  return map.areas.filter((a) => a.bigCountry === country).map((a) => a.id);
}

// Points can never go below 0 (rulebook section 3).
export function addPoints(points: number, change: number): number {
  return Math.max(0, points + change);
}

function isLegal(state: GameState, map: GameMap, action: Action): boolean {
  const wanted = actionKey(action);
  return legalActions(state, map).some((a) => actionKey(a) === wanted);
}

// Compares actions whatever the order of their fields.
function actionKey(action: Action): string {
  return JSON.stringify(Object.entries(action).sort(([a], [b]) => a.localeCompare(b)));
}

function checkMap(state: GameState, map: GameMap): void {
  if (state.mapId !== map.id) throw new Error(`Game uses map ${state.mapId}, got ${map.id}`);
}

function occupiedAreas(state: GameState, exceptSeat: number): Set<string> {
  return new Set(
    state.players.filter((p) => p.seat !== exceptSeat && p.area !== null).map((p) => p.area!),
  );
}

function advanceSetup(state: GameState): void {
  state.current += 1;
  if (state.current < state.players.length) return;
  state.current = 0;
  if (state.phase === 'chooseProfile') {
    state.phase = 'chooseStart';
  } else {
    state.phase = 'play';
    state.round = 1;
  }
}

function endTurn(state: GameState, map: GameMap): void {
  state.current += 1;
  if (state.current >= state.players.length) {
    state.current = 0;
    state.round += 1;
    if (state.round > state.totalRounds) {
      state.round = state.totalRounds;
      state.phase = 'finished';
      state.result = rank(state.players);
      return;
    }
  }
  startTurn(state, map);
}

// Most points wins; ties go to more continents, then more areas.
export function rank(players: Player[]): GameResult {
  const key = (p: Player) => [p.points, p.visitedContinents.length, p.visitedAreas.length];
  const compare = (a: Player, b: Player) => {
    const ka = key(a);
    const kb = key(b);
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return kb[i] - ka[i];
    return 0;
  };
  const sorted = [...players].sort(compare);
  return {
    ranking: sorted.map((p) => p.seat),
    winners: sorted.filter((p) => compare(p, sorted[0]) === 0).map((p) => p.seat),
  };
}
