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

export interface SeatConfig {
  kind: SeatKind;
  colour: string;
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

export type RouteKind = 'airport' | 'port';

// A fixed two-way route between two airports (or two ports): a <-> b.
// One airport or port can be in up to 3 routes (a hub).
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
  profile: Profile | null;
  startContinent: Continent | null;
  area: string | null;
  points: number;
  visitedAreas: string[];
  visitedContinents: Continent[];
  // On a plane or ship (area is null while travelling).
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
}

// Businesses (rulebook section 6): guided tours at a wonder, an airline at an airport,
// a ferry agency at a port. Bought by the player standing in the area; no selling yet.
export type BusinessKind = 'tours' | 'airline' | 'ferry';

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
  // The business involved: the one bought, or the airline or ferry agency a ticket went to.
  business?: BusinessKind;
}

// Citizenship steps (docs/engine.md, task 8, owner's shorter timeline). The arrival turn is
// citizenship turn 1: "request approved, the test is next turn".
// - test: turn 2, 3 a/b questions; the player stays;
// - result: turn 3 after a wrong answer: "one more turn learning"; the player stays;
// - learning: turn 4: the right answers are shown, citizenship is granted, the player moves;
// - granted: citizenship was granted at the start of this turn and the player moves
//   (turn 3 after all right answers; Luxury: the turn after arriving, no test);
// - submitted: Luxury only, until the start of its next turn.
export type ExamStage = 'submitted' | 'test' | 'result' | 'learning' | 'granted';

export interface Exam {
  area: string;
  stage: ExamStage;
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
  // Ask for citizenship on landing, if the area can still take one.
  citizenship?: true;
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
  // Ask for citizenship on arrival (carried to the trip if the answer is right).
  citizenship?: true;
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
  result: GameResult | null;
}

// Event cards (rulebook section 10, docs/engine.md task 11). The cards: src/cards/cards.ts.
export type Deck = 'country' | 'plane' | 'ship' | 'backpacker';

export interface EventCard {
  id: string;
  deck: Deck;
  text: string;
  // The change in points (points never go below 0).
  points: number;
  // In an area: this turn is lost. On a trip: the plane or ship is one turn late.
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

// `citizenship: true` on walk, board and quiz asks for citizenship on arrival
// (only offered where the player could still get one).
export type Action =
  | { type: 'chooseProfile'; profile: Profile }
  | { type: 'chooseStart'; area: string }
  | { type: 'walk'; to: string; citizenship?: true }
  // Pay the ticket and board. Not for the Backpacker, who travels only with the quiz.
  | { type: 'board'; kind: RouteKind; to: string; citizenship?: true }
  // Try the airline quiz for this trip; the next move is the answer.
  | { type: 'quiz'; kind: RouteKind; to: string; citizenship?: true }
  | { type: 'answer'; choice: 0 | 1 }
  // A citizenship turn with nothing to choose ("approved", "granted", "learn the answers").
  | { type: 'exam' }
  // One answer in the citizenship test (turn 2); the turn ends after the 3rd.
  | { type: 'examAnswer'; choice: 0 | 1 }
  // A turn in the air or at sea: an event card is drawn (challenges come in task 12).
  | { type: 'travel' }
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
