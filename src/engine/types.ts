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
  // The destination needed a visa when the player boarded. A citizenship granted during
  // the trip costs nothing on landing: a player is never charged for a rule that did not
  // exist when they left (owner's choice, task 8).
  visa?: true;
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
  result: GameResult | null;
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
  // A turn in the air or at sea (challenges and event cards come in tasks 11–12).
  | { type: 'travel' }
  // Only legal when every neighbouring area is taken. Not in the rulebook;
  // it stops the engine from freezing (see docs/engine.md).
  | { type: 'blocked' };
