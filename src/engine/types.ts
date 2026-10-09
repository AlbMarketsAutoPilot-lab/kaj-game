// Shared types for the KAJ rules engine. The engine has no screens:
// a game is a plain state object, changed only by apply(state, action).

import type { Fact } from '../facts/types.ts';

export type Continent =
  | 'Europe'
  | 'Asia'
  | 'Africa'
  | 'North America'
  | 'South America'
  | 'Oceania'
  | 'Antarctica';

export type Profile = 'backpacker' | 'business' | 'luxury' | 'nomad';

export type SeatKind = 'human' | 'robot';

// Robot levels (owner's change, task 13): one robot, three settings.
export type RobotLevel = 'easy' | 'normal' | 'hard';

export interface SeatConfig {
  kind: SeatKind;
  colour: string;
  // Robot seats only; default 'normal'.
  level?: RobotLevel;
}

export interface GameConfig {
  seats: SeatConfig[];
  seed: number;
  // Event cards on (default). Off only in rule tests that count exact points.
  eventCards?: boolean;
}

export interface Area {
  id: string;
  name: string;
  continent: Continent;
  // Walking neighbours: real land borders (plus fixed links such as the Channel Tunnel).
  neighbours: string[];
  // Real countries inside this area. A rule that names a country applies to this area.
  countries?: string[];
  wonder?: boolean;
  // Set on each part of a big country (USA, Canada, Russia, China, Brazil, Australia).
  bigCountry?: string;
}

export type RouteKind = 'airport' | 'port' | 'station';

// A fixed two-way route between two airports (or two ports, or two train stations): a <-> b.
// One airport, port or station can be in up to 3 routes (a hub).
export interface Route {
  kind: RouteKind;
  a: string;
  b: string;
}

export interface GameMap {
  id: string;
  areas: Area[];
  routes?: Route[];
  // Area id -> facts for the airline quiz and the citizenship exam.
  // Areas without facts get placeholder questions made from the map data.
  facts?: Record<string, Fact[]>;
}

export interface Player {
  seat: number;
  kind: SeatKind;
  colour: string;
  // The robot's level (null for a human seat).
  level: RobotLevel | null;
  profile: Profile | null;
  startContinent: Continent | null;
  area: string | null;
  points: number;
  visitedAreas: string[];
  visitedContinents: Continent[];
  // On a plane, ship or train (area is null while travelling).
  travel: Travel | null;
  // Wrong airline-quiz answers in the current area; back to 0 when the player leaves.
  quizWrong: number;
  // A player may ask for citizenship once per game (never the Digital Nomad).
  askedCitizenship: boolean;
  // The areas this player's citizenship covers: one area, or every part of a big country.
  citizenship: string[] | null;
  // The citizenship request in progress (the player stays in the area until it ends).
  exam: Exam | null;
  // The starting area: where "go home" sends a player who has run out of money.
  home: string | null;
  // Turns in a row blocked because the player can't pay (a visa, tour fee or ticket).
  // At GO_HOME_TURNS the player is sent home (docs/engine.md, task 9).
  broke: number;
  // An event card took this turn: the only move is "lostTurn" (task 11).
  loseTurn: boolean;
  // Turns begun in an area (trip turns don't count): every 3rd one draws an event card (task 12).
  landTurns: number;
}

// Businesses (rulebook section 6): guided tours at a wonder, an airline at an airport,
// a ferry agency at a port, a train ticket booth at a station (task 17).
// Bought by the player standing in the area.
export type BusinessKind = 'tours' | 'airline' | 'ferry' | 'train';

export interface Business {
  kind: BusinessKind;
  area: string;
  // Seat of the owner; null while nobody has bought it.
  owner: number | null;
}

// An offer to sell a business, waiting for the buyer's Yes or No (task 9b).
// The seller's turn goes on either way.
export interface SaleOffer {
  business: BusinessKind;
  area: string;
  from: number;
  to: number;
  // The price it was bought for.
  price: number;
}

// A payment made by the last move, so the screens can say who was paid.
// `to` is null when the points went to nobody (buying a business, a ticket with no owner).
// A sale: `from` is the buyer, `to` the seller.
export interface Payment {
  reason: 'visa' | 'tour' | 'ticket' | 'buy' | 'sale';
  from: number;
  to: number | null;
  amount: number;
  area: string;
  // The business involved: the one bought, or the airline, ferry agency or train booth a ticket went to.
  business?: BusinessKind;
}

// Citizenship steps (docs/engine.md, tasks 8 and 14d). Turn 1: the player asks in the area they
// stand in ("askCitizenship"), and the turn ends: "request approved, the test is next turn".
// - test: turn 2: read 6 facts, then 3 a/b questions about them; the player stays;
// - result: the answers are in, until the player's next turn;
// - granted: 2 or more right: citizenship was granted and the player moves (turn 3;
//   Luxury: at once when asking, no test, and the turn goes on);
// - failed: fewer than 2 right: no citizenship, and the player moves (turn 3). The one request
//   of the game is used up (owner's change, after task 14e).
export type ExamStage = 'test' | 'result' | 'granted' | 'failed';

export interface Exam {
  area: string;
  stage: ExamStage;
  // The facts to read before the questions (turn 2).
  study: string[];
  questions: QuizQuestion[];
  // The answers given so far, in question order.
  answers: (0 | 1)[];
}

export interface Travel {
  kind: RouteKind;
  from: string;
  to: string;
  // Travel turns still to come. At 0 the player lands, or waits if the destination is taken.
  turnsLeft: number;
}

// One a/b airline-quiz question. Nothing is secret in v1, so it can sit in the state.
export interface QuizQuestion {
  text: string;
  options: [string, string];
  correct: 0 | 1;
}

export interface PendingQuiz {
  kind: RouteKind;
  to: string;
  question: QuizQuestion;
}

export type Phase = 'chooseProfile' | 'chooseStart' | 'play' | 'finished';

export interface GameState {
  mapId: string;
  phase: Phase;
  rng: number;
  players: Player[];
  // Seat numbers in playing order: random first player, then a fixed order.
  turnOrder: number[];
  // Index into turnOrder of the player who acts now.
  current: number;
  // Round number, 1-based. A round ends when every player has had one turn.
  round: number;
  totalRounds: number;
  // The airline-quiz question the current player must answer now.
  quiz: PendingQuiz | null;
  // Every business on the map, with its owner.
  businesses: Business[];
  // The payments made by the last move (empty when nothing was paid).
  payments: Payment[];
  // A sale offer waiting for the buyer's answer.
  offer: SaleOffer | null;
  // The current player has already made a sale offer this turn (one per turn).
  offeredThisTurn: boolean;
  // Event cards on (see GameConfig).
  eventCards: boolean;
  // The card drawn at the start of the current player's turn, on show for the whole turn.
  card: DrawnCard | null;
  // The cards drawn by the last move (a travel card, and the next player's start-of-turn card),
  // so the screens can say what happened. Cleared by every move, like `payments`.
  drawn: DrawnCard[];
  // The challenge the current player must answer now (task 12).
  challenge: Challenge | null;
  // The challenge answered by the last move, so the screens can say what happened.
  // Cleared by every move, like `payments`.
  challenged: ChallengeResult | null;
  result: GameResult | null;
}

// Event cards (rulebook section 10, docs/engine.md task 11). The cards: src/cards/cards.ts.
export type Deck = 'country' | 'backpacker';

// ---------- travel-turn challenges (task 12) ----------

export type ChallengeType = 'flag' | 'bigger' | 'capital' | 'continent' | 'neighbour' | 'currency';

// One a/b question made from open data (src/challenges/challenges.ts).
export interface Challenge {
  id: string;
  type: ChallengeType;
  question: string;
  options: [string, string];
  correct: 0 | 1;
  // Flag questions: the flag to show (assets/flags/<flag>.svg).
  flag?: string;
}

export interface ChallengeResult {
  seat: number;
  challenge: Challenge;
  choice: 0 | 1;
  right: boolean;
  // The real change in points (a wrong answer at 1 point: −1; points never go below 0).
  change: number;
}

export interface EventCard {
  id: string;
  deck: Deck;
  // The news headline on the phone and the card (task 14k).
  title: string;
  text: string;
  // The change in points (points never go below 0).
  points: number;
  // This turn is lost.
  loseTurn?: true;
  // A country card drawn only in this area.
  area?: string;
}

export interface DrawnCard {
  seat: number;
  round: number;
  card: EventCard;
  // The points really won or lost (less than the card says when the player had too few).
  change: number;
}

export interface GameResult {
  // Seat numbers, best first.
  ranking: number[];
  // Seats sharing first place after all tie-breaks (one seat unless it's a draw).
  winners: number[];
}

export type Action =
  | { type: 'chooseProfile'; profile: Profile }
  | { type: 'chooseStart'; area: string }
  | { type: 'walk'; to: string }
  // Pay the ticket and board. Not for the Backpacker, who travels only with the quiz.
  // Luxury never takes the train (task 17).
  | { type: 'board'; kind: RouteKind; to: string }
  // Try the airline quiz for this trip; the next move is the answer.
  | { type: 'quiz'; kind: RouteKind; to: string }
  // Ask for citizenship of the area the player stands in (owner's rule, task 14d): never the
  // home country, once per game, never the Nomad, where nobody holds or is asking for it.
  // Luxury: granted at once and the turn goes on. Others: the turn ends, the test is next turn.
  | { type: 'askCitizenship' }
  | { type: 'answer'; choice: 0 | 1 }
  // One answer in the citizenship test (turn 2); the turn ends after the 3rd.
  | { type: 'examAnswer'; choice: 0 | 1 }
  // A turn in the air, at sea or on the train. With `challenge` the player plays a challenge: the turn goes
  // on, and the next move is the answer (task 12). Without it nothing happens.
  | { type: 'travel'; challenge?: true }
  // The answer to the challenge; the trip then goes on as on any travel turn.
  | { type: 'challengeAnswer'; choice: 0 | 1 }
  // Buy the business in the player's area. The turn goes on: the player still moves.
  | { type: 'buy'; business: BusinessKind }
  // Offer one of the player's businesses to another player at the price it was bought for.
  // One offer per turn; the turn goes on (task 9b).
  | { type: 'sell'; business: BusinessKind; area: string; to: number }
  // The buyer's answer to the offer (the buyer answers on the seller's turn).
  | { type: 'sellAnswer'; accept: boolean }
  // Blocked by lack of money for the 3rd turn in a row: the trip ends and the player is
  // sent home for free (docs/engine.md, task 9).
  | { type: 'goHome' }
  // Only legal when no neighbouring area can be entered and there is no trip. Not in the
  // rulebook; it stops the engine from freezing (see docs/engine.md).
  | { type: 'blocked' }
  // An event card took this turn.
  | { type: 'lostTurn' };
