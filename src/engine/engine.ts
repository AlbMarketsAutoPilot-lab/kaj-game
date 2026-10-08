import {
  BUSINESS_PRICE,
  CARD_EVERY,
  CHALLENGE_POINTS,
  CONTINENT_BONUS,
  EXAM_QUESTIONS,
  GO_HOME_TURNS,
  MAX_ROBOTS,
  MAX_SEATS,
  MIN_SEATS,
  NOMAD_MIN_CONTINENTS,
  NOMAD_PENALTY,
  bigCountryPoints,
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
  TOUR_FEE,
  TRAVEL_TURNS,
  VISA_PRICE,
  WELCOME_BONUS,
} from './constants.ts';
import { CARDS } from '../cards/cards.ts';
import { CHALLENGES } from '../challenges/challenges.ts';
import { areaById, validateMap } from './map.ts';
import { makeExam, makeQuestion } from './quiz.ts';
import { randomInt } from './rng.ts';
import type {
  Action,
  Area,
  Business,
  BusinessKind,
  Challenge,
  ChallengeType,
  Deck,
  DrawnCard,
  EventCard,
  Exam,
  GameConfig,
  GameMap,
  GameResult,
  GameState,
  Payment,
  Player,
  Profile,
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
    level: s.kind === 'robot' ? s.level ?? 'normal' : null,
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
    home: null,
    broke: 0,
    loseTurn: false,
    landTurns: 0,
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
    businesses: mapBusinesses(map),
    payments: [],
    offer: null,
    offeredThisTurn: false,
    eventCards: config.eventCards !== false,
    card: null,
    drawn: [],
    challenge: null,
    challenged: null,
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
      if (state.challenge) return [{ type: 'challengeAnswer', choice: 0 }, { type: 'challengeAnswer', choice: 1 }];
      if (state.offer) {
        const buyer = state.players[state.offer.to];
        return [
          ...(buyer.points >= state.offer.price ? [{ type: 'sellAnswer' as const, accept: true }] : []),
          { type: 'sellAnswer', accept: false },
        ];
      }
      // During a citizenship request the player stays, until it is granted.
      if (me.exam && !examOver(me.exam)) {
        return me.exam.stage === 'test'
          ? [{ type: 'examAnswer', choice: 0 }, { type: 'examAnswer', choice: 1 }]
          : [{ type: 'exam' }];
      }
      if (me.loseTurn) return [{ type: 'lostTurn' }];
      // A challenge is never obligatory, and not offered with 0 points (owner's rule, task 12).
      if (me.travel) {
        return me.points >= CHALLENGE_POINTS ? [{ type: 'travel' }, { type: 'travel', challenge: true }] : [{ type: 'travel' }];
      }
      // Booked areas (owner's rule, task 13): an area someone is travelling to by plane or ship
      // is closed, as if they were already there.
      const occupied = closedAreas(state, me.seat);
      const moves: Action[] = [];
      for (const to of areaById(map, me.area!).neighbours) {
        if (occupied.has(to)) continue;
        // Strict fees (owner's rule, task 9): no money, no entry. A visa or tour fee
        // the player can't pay closes the area.
        if (me.points < feeTotal(entryFees(state, me, me.area, to))) continue;
        moves.push(...withCitizenship(state, map, me, to, { type: 'walk', to }));
      }
      moves.push(...tripActions(state, me, map));
      if (moves.length === 0) {
        // Blocked by lack of money for the 3rd turn in a row: go home.
        const home = me.broke >= GO_HOME_TURNS - 1 && blockedByMoney(state, map, me);
        moves.push(home ? { type: 'goHome' } : { type: 'blocked' });
      }
      // Buying and selling never end the turn, so they come with the moves.
      return [...moves, ...buyActions(state, me), ...sellActions(state, me)];
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
  next.payments = [];
  next.drawn = [];
  next.challenged = null;
  const me = currentPlayer(next);
  // A card drawn at the start of this turn stays on show for the whole turn; any other card
  // (the last player's) is cleared by the next move.
  if (next.card && (next.card.seat !== me.seat || next.card.round !== next.round)) next.card = null;
  // The "citizenship granted" turn: the request is over once the player moves on.
  if (me.exam && examOver(me.exam)) me.exam = null;
  // Any move except waiting (or buying and selling, which don't end the turn) ends a
  // "no money" streak.
  // A turn lost to an event card leaves the count as it is.
  if (!['blocked', 'buy', 'sell', 'sellAnswer', 'lostTurn'].includes(action.type)) me.broke = 0;

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
      me.home = area.id;
      me.visitedAreas.push(area.id);
      me.visitedContinents.push(area.continent);
      me.points = addPoints(me.points, WELCOME_BONUS[area.continent]);
      advanceSetup(next);
      return next;
    }
    case 'walk': {
      me.quizWrong = 0;
      payFees(next, me, entryFees(next, me, me.area, action.to), action.to);
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
        // After the 3rd wrong answer a player who can pay (ticket and any fees) must pay and
        // board now; a player who can't (always the Backpacker) goes home (owner's rule, task 13).
        if (me.quizWrong >= QUIZ_TRIES) {
          if (canPayAfterQuiz(next, me, quiz.to)) {
            depart(next, map, me, quiz.kind, quiz.to, TICKET_PRICE[me.profile!]!, ask);
          } else {
            goHome(next, map, me);
          }
        }
      }
      endTurn(next, map);
      return next;
    }
    case 'exam': {
      // Only after a wrong answer (turn 3): "one more turn learning the right answers".
      me.exam!.stage = 'learning';
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
      // No event cards on trips (owner's rule, task 12). A challenge, if the player wants one,
      // is drawn now and answered with the next move; the trip goes on after the answer.
      if (action.challenge) {
        next.challenge = pickChallenge(next);
        return next;
      }
      travelOn(next, map, me);
      endTurn(next, map);
      return next;
    }
    case 'challengeAnswer': {
      const challenge = next.challenge!;
      next.challenge = null;
      travelOn(next, map, me);
      // After landing, so the arrival points are never lost to the "never below 0" floor.
      const right = action.choice === challenge.correct;
      const before = me.points;
      me.points = addPoints(me.points, right ? CHALLENGE_POINTS : -CHALLENGE_POINTS);
      next.challenged = { seat: me.seat, challenge, choice: action.choice, right, change: me.points - before };
      endTurn(next, map);
      return next;
    }
    case 'lostTurn':
      me.loseTurn = false;
      endTurn(next, map);
      return next;
    case 'buy': {
      const business = businessAt(next, me.area!, action.business)!;
      business.owner = me.seat;
      me.points = addPoints(me.points, -BUSINESS_PRICE[business.kind]);
      next.payments.push({ reason: 'buy', from: me.seat, to: null, amount: BUSINESS_PRICE[business.kind], area: business.area, business: business.kind });
      return next; // the turn goes on
    }
    case 'sell': {
      const business = businessAt(next, action.area, action.business)!;
      next.offer = { business: business.kind, area: business.area, from: me.seat, to: action.to, price: BUSINESS_PRICE[business.kind] };
      next.offeredThisTurn = true;
      return next; // the buyer answers next; the seller's turn goes on
    }
    case 'sellAnswer': {
      const offer = next.offer!;
      next.offer = null;
      if (action.accept) {
        const buyer = next.players[offer.to];
        buyer.points = addPoints(buyer.points, -offer.price);
        me.points = addPoints(me.points, offer.price);
        businessAt(next, offer.area, offer.business)!.owner = buyer.seat;
        next.payments.push({ reason: 'sale', from: buyer.seat, to: me.seat, amount: offer.price, area: offer.area, business: offer.business });
      }
      return next;
    }
    case 'blocked':
      // Count the turns in a row blocked by lack of money (not by players in the way).
      me.broke = blockedByMoney(next, map, me) ? me.broke + 1 : 0;
      endTurn(next, map);
      return next;
    case 'goHome':
      goHome(next, map, me);
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
// except to an area whose fees (visa, tour fee) the player can't pay: the fees are due even
// with a free ticket.
function tripActions(state: GameState, me: Player, map: GameMap): Action[] {
  const out: Action[] = [];
  const price = TICKET_PRICE[me.profile!];
  // No trip to an area where someone stands or that someone has booked (owner's rule, task 13).
  const closed = closedAreas(state, me.seat);
  for (const kind of ['airport', 'port'] as const) {
    for (const to of destinations(map, me.area!, kind, me.profile!)) {
      if (closed.has(to)) continue;
      const fees = feeTotal(entryFees(state, me, me.area, to));
      if (price !== null && me.points >= price + fees) {
        out.push(...withCitizenship(state, map, me, to, { type: 'board', kind, to }));
      }
      if (me.points >= fees) out.push(...withCitizenship(state, map, me, to, { type: 'quiz', kind, to }));
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
  // The ticket goes to the owner of the departure airline or ferry agency (the owner pays
  // their own ticket to themselves); with no owner it goes to nobody (there is no bank).
  // A free quiz ticket pays nobody.
  if (ticket > 0) {
    const business: BusinessKind = kind === 'airport' ? 'airline' : 'ferry';
    const owner = businessAt(state, me.area!, business)?.owner ?? null;
    me.points = addPoints(me.points, -ticket);
    if (owner !== null) state.players[owner].points = addPoints(state.players[owner].points, ticket);
    state.payments.push({ reason: 'ticket', from: me.seat, to: owner, amount: ticket, area: me.area!, business });
  }
  // The visa and tour fee due now are paid at boarding, with the ticket (owner's rule, task 11),
  // so nothing is owed on landing; a citizenship or tours that appear during the trip are free.
  payFees(state, me, entryFees(state, me, me.area, to), to);
  me.travel = {
    kind, from: me.area!, to, turnsLeft: TRAVEL_TURNS[me.profile!][kind],
    ...(ask ? { citizenship: true as const } : {}),
  };
  me.area = null;
  me.quizWrong = 0;
  if (me.travel.turnsLeft === 0) land(state, map, me);
}

// Two players are never in one area: if the destination is taken, the plane or ship
// waits and tries again at the end of the next travel turn. The fees were paid at boarding.
// Since task 13 a booked area can't be entered, so this is only a safety net.
function land(state: GameState, map: GameMap, me: Player): void {
  const trip = me.travel!;
  if (occupiedAreas(state, me.seat).has(trip.to)) return;
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

// ---------- businesses, fees and "go home" (rulebook section 6, docs/engine.md task 9) ----------

// One business per wonder (guided tours), airport (airline) and port (ferry agency).
export function mapBusinesses(map: GameMap): Business[] {
  const routes = map.routes ?? [];
  const has = (id: string, kind: 'airport' | 'port') => routes.some((r) => r.kind === kind && (r.a === id || r.b === id));
  return map.areas.flatMap((a): Business[] => [
    ...(a.wonder ? [{ kind: 'tours' as const, area: a.id, owner: null }] : []),
    ...(has(a.id, 'airport') ? [{ kind: 'airline' as const, area: a.id, owner: null }] : []),
    ...(has(a.id, 'port') ? [{ kind: 'ferry' as const, area: a.id, owner: null }] : []),
  ]);
}

export function businessAt(state: GameState, area: string, kind: BusinessKind): Business | undefined {
  return state.businesses.find((b) => b.area === area && b.kind === kind);
}

// What a player's businesses are worth: the price of each (counted in the final score).
export function businessValue(state: GameState, seat: number): number {
  return state.businesses.filter((b) => b.owner === seat).reduce((sum, b) => sum + BUSINESS_PRICE[b.kind], 0);
}

// The Digital Nomad's end penalty (0 for everyone else, and for a Nomad with 3 continents).
export function nomadPenalty(p: Player): number {
  return p.profile === 'nomad' && p.visitedContinents.length < NOMAD_MIN_CONTINENTS ? NOMAD_PENALTY : 0;
}

// Final score: points plus the price of every business owned (owner's rule, task 9),
// minus the Nomad penalty, never below 0.
export function finalScore(state: GameState, p: Player): number {
  return scoreWith(state.businesses, p);
}

function scoreWith(businesses: Business[], p: Player): number {
  const value = businesses.filter((b) => b.owner === p.seat).reduce((sum, b) => sum + BUSINESS_PRICE[b.kind], 0);
  return addPoints(p.points + value, -nomadPenalty(p));
}

// The player standing in an area may buy its business if nobody owns it and they can pay.
// Two players are never in one area, so the first to arrive has the first chance (⭐ right to
// buy at a wonder); if they leave without buying, whoever arrives next may buy.
function buyActions(state: GameState, me: Player): Action[] {
  return state.businesses
    .filter((b) => b.area === me.area && b.owner === null && me.points >= BUSINESS_PRICE[b.kind])
    .map((b) => ({ type: 'buy', business: b.kind }));
}

// Sale offers: any business the player owns, to any other player who can pay its price,
// once per turn (rulebook section 6; owner-approved in tasks 9 and 9b). Never to a player in
// the air or at sea: owner's choice, task 9b (made when fees were still paid on landing).
function sellActions(state: GameState, me: Player): Action[] {
  if (state.offeredThisTurn) return [];
  return state.businesses
    .filter((b) => b.owner === me.seat)
    .flatMap((b) => state.players
      .filter((p) => p.seat !== me.seat && p.travel === null && p.points >= BUSINESS_PRICE[b.kind])
      .map((p): Action => ({ type: 'sell', business: b.kind, area: b.area, to: p.seat })));
}

export interface Fee {
  reason: 'visa' | 'tour';
  to: Player;
  amount: number;
}

// What `me` must pay to enter `to` from `from` (null: from nowhere): the visa to the citizen,
// and the tour fee to the owner of the guided tours. Fees are strict: no money, no entry.
export function entryFees(state: GameState, me: Player, from: string | null, to: string): Fee[] {
  const fees: Fee[] = [];
  const citizen = visaOwner(state, me, from, to);
  if (citizen) fees.push({ reason: 'visa', to: citizen, amount: VISA_PRICE });
  const tours = businessAt(state, to, 'tours');
  if (tours && tours.owner !== null && tours.owner !== me.seat) {
    fees.push({ reason: 'tour', to: state.players[tours.owner], amount: TOUR_FEE });
  }
  return fees;
}

export function feeTotal(fees: Fee[]): number {
  return fees.reduce((sum, f) => sum + f.amount, 0);
}

function payFees(state: GameState, me: Player, fees: Fee[], area: string): void {
  for (const f of fees) {
    me.points = addPoints(me.points, -f.amount);
    f.to.points = addPoints(f.to.points, f.amount);
    const payment: Payment = { reason: f.reason, from: me.seat, to: f.to.seat, amount: f.amount, area };
    state.payments.push(payment);
  }
}

// The player has no move, and at least one way out is closed only by money (a visa, tour fee
// or ticket they can't pay), not just by other players standing in the way.
export function blockedByMoney(state: GameState, map: GameMap, me: Player): boolean {
  if (me.area === null) return false;
  const occupied = closedAreas(state, me.seat);
  const tooDear = (to: string) => !occupied.has(to) && me.points < feeTotal(entryFees(state, me, me.area, to));
  if (areaById(map, me.area).neighbours.some(tooDear)) return true;
  return (['airport', 'port'] as const).some((kind) => destinations(map, me.area!, kind, me.profile!).some(tooDear));
}

// Where "go home" sends a player: the starting area, or if someone stands there, the nearest
// free area to it (walking, planes and ships), never the area the player is leaving.
export function homeFor(state: GameState, map: GameMap, me: Player): string {
  const occupied = closedAreas(state, me.seat);
  const home = me.home!;
  if (!occupied.has(home)) return home;
  const links = (id: string) => [
    ...areaById(map, id).neighbours,
    ...(map.routes ?? []).flatMap((r) => (r.a === id ? [r.b] : r.b === id ? [r.a] : [])),
  ];
  const seen = new Set([home]);
  for (let queue = [home], i = 0; i < queue.length; i++) {
    for (const n of links(queue[i])) {
      if (seen.has(n)) continue;
      if (!occupied.has(n) && n !== me.area) return n;
      seen.add(n);
      queue.push(n);
    }
  }
  return me.area!;
}

// Whether a 3rd wrong quiz answer for `to` means paying the ticket (true) or going home (false).
export function canPayAfterQuiz(state: GameState, me: Player, to: string): boolean {
  const price = TICKET_PRICE[me.profile!];
  return price !== null && me.points >= price + feeTotal(entryFees(state, me, me.area, to));
}

// Go home: free (no visa, no tour fee: the game moves the player), with the normal arrival
// points (usually 0, as home is already visited).
function goHome(state: GameState, map: GameMap, me: Player): void {
  const to = homeFor(state, map, me);
  me.quizWrong = 0;
  if (to !== me.area) arrive(state, map, me, areaById(map, to), false);
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

// The arrival turn (citizenship turn 1): "request approved, the test is next turn".
// The questions are drawn now (nothing is secret in v1); Luxury needs no test.
function submitCitizenship(state: GameState, map: GameMap, me: Player, areaId: string): void {
  me.askedCitizenship = true;
  if (me.profile === 'luxury') {
    me.exam = { area: areaId, stage: 'submitted', questions: [], answers: [] };
    return;
  }
  const [questions, rng] = makeExam(map, areaId, EXAM_QUESTIONS, state.rng);
  state.rng = rng;
  me.exam = { area: areaId, stage: 'test', questions, answers: [] };
}

// Citizenship granted at the start of this turn: the player moves as usual.
function examOver(exam: Exam): boolean {
  return exam.stage === 'granted' || exam.stage === 'learning';
}

function passed(exam: Exam): boolean {
  return exam.questions.every((q, i) => exam.answers[i] === q.correct);
}

function grantCitizenship(map: GameMap, me: Player): void {
  me.citizenship = citizenshipAreas(map, me.exam!.area);
  if (me.profile === 'business') me.points = addPoints(me.points, POINTS_BUSINESS_CITIZENSHIP);
}

// Start of a player's turn: citizenship is granted at the start of the turn after arriving
// (Luxury), turn 3 (all answers right) or turn 4 (after the learning turn).
function startTurn(state: GameState, map: GameMap): void {
  const me = currentPlayer(state);
  countLandTurn(state, me);
  const exam = me.exam;
  if (!exam) return;
  if (exam.stage === 'submitted' || (exam.stage === 'result' && passed(exam))) {
    grantCitizenship(map, me);
    exam.stage = 'granted';
  } else if (exam.stage === 'learning') {
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
      // All or nothing: a part gives 0 until every part is visited, then +1 +N once (3 parts: +5).
      // Visited parts are kept, so a player can leave and continue later.
      const parts = bigCountryParts(map, area.bigCountry);
      if (parts.every((id) => me.visitedAreas.includes(id))) {
        me.points = addPoints(me.points, bigCountryPoints(parts.length));
      }
    } else {
      me.points = addPoints(me.points, POINTS_NEW_AREA);
      if (area.wonder) me.points = addPoints(me.points, POINTS_WONDER);
    }
  }
  if (!me.visitedContinents.includes(area.continent)) {
    me.visitedContinents.push(area.continent);
    me.points = addPoints(me.points, POINTS_NEW_CONTINENT);
    const bonus = me.profile ? CONTINENT_BONUS[me.profile] : undefined;
    if (bonus && me.visitedContinents.length === bonus.continents) me.points = addPoints(me.points, bonus.points);
  }
  if (asking) submitCitizenship(state, map, me, area.id);
}

// One travel turn: Nomad +1, and the player lands at the end of the last one.
function travelOn(state: GameState, map: GameMap, me: Player): void {
  const trip = me.travel!;
  if (me.profile === 'nomad') me.points = addPoints(me.points, POINTS_NOMAD_TRAVEL_TURN);
  if (trip.turnsLeft > 0) trip.turnsLeft -= 1;
  if (trip.turnsLeft === 0) land(state, map, me);
}

// ---------- travel-turn challenges (docs/engine.md task 12) ----------

export const CHALLENGE_TYPES: ChallengeType[] = ['flag', 'bigger', 'capital', 'continent', 'neighbour', 'currency'];

// A random type, then a random question of that type (the same question can come again).
// The random draw is hidden: no dice are shown.
function pickChallenge(state: GameState): Challenge {
  const [t, rng1] = randomInt(state.rng, CHALLENGE_TYPES.length);
  const list = CHALLENGES.filter((c) => c.type === CHALLENGE_TYPES[t]);
  const [i, rng2] = randomInt(rng1, list.length);
  state.rng = rng2;
  return list[i];
}

// ---------- event cards (rulebook section 10, docs/engine.md tasks 11 and 12) ----------

// Turns begun in an area are counted per player; every 3rd one has a card (none in the last
// round). The number of land turns to go before the next card (0: this turn is a card turn).
export function landTurnsToCard(me: Player): number {
  return (CARD_EVERY - (me.landTurns % CARD_EVERY)) % CARD_EVERY;
}

// Start of a turn: a turn begun in an area counts (also a lost or blocked turn, and a
// citizenship turn); a trip turn doesn't. Every 3rd one draws a card, except during a citizenship
// request (the exam is the event; the card is skipped, not moved) and in the last round.
function countLandTurn(state: GameState, me: Player): void {
  if (state.phase !== 'play' || me.travel || me.area === null) return;
  me.landTurns += 1;
  if (me.exam || landTurnsToCard(me) !== 0 || state.round >= state.totalRounds) return;
  scheduledCard(state, me);
}

function scheduledCard(state: GameState, me: Player): void {
  if (!state.eventCards) return;
  const decks: Deck[] = me.profile === 'backpacker' ? ['country', 'backpacker'] : ['country'];
  const card = pickCard(state, decks, me.area);
  state.card = applyCard(state, me, card);
  if (card.loseTurn) me.loseTurn = true;
}

// The cards that can be drawn: the decks' cards, with area cards only in their own area.
export function eligibleCards(decks: Deck[], area: string | null): EventCard[] {
  return CARDS.filter((c) => decks.includes(c.deck) && (c.area === undefined || c.area === area));
}

// A random card (the same card can come again), with the game's dice.
function pickCard(state: GameState, decks: Deck[], area: string | null): EventCard {
  const cards = eligibleCards(decks, area);
  const [i, rng] = randomInt(state.rng, cards.length);
  state.rng = rng;
  return cards[i];
}

function applyCard(state: GameState, me: Player, card: EventCard): DrawnCard {
  const before = me.points;
  me.points = addPoints(me.points, card.points);
  const drawn = { seat: me.seat, round: state.round, card, change: me.points - before };
  state.drawn.push(drawn);
  return drawn;
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

// Areas another player stands in or has booked (is travelling to by plane or ship).
export function closedAreas(state: GameState, exceptSeat: number): Set<string> {
  const closed = occupiedAreas(state, exceptSeat);
  for (const p of state.players) if (p.seat !== exceptSeat && p.travel) closed.add(p.travel.to);
  return closed;
}

// The player travelling to `area`, if someone has booked it.
export function bookedBy(state: GameState, area: string): Player | undefined {
  return state.players.find((p) => p.travel?.to === area);
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
    countLandTurn(state, currentPlayer(state)); // the first player's first turn
  }
}

function endTurn(state: GameState, map: GameMap): void {
  state.offeredThisTurn = false;
  state.current += 1;
  if (state.current >= state.players.length) {
    state.current = 0;
    state.round += 1;
    if (state.round > state.totalRounds) {
      state.round = state.totalRounds;
      state.phase = 'finished';
      state.result = rank(state.players, state.businesses);
      return;
    }
  }
  startTurn(state, map);
}

// The best final score (see finalScore) wins; ties go to more continents, then more areas.
export function rank(players: Player[], businesses: Business[] = []): GameResult {
  const key = (p: Player) => [scoreWith(businesses, p), p.visitedContinents.length, p.visitedAreas.length];
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
