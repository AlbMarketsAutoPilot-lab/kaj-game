import type { BusinessKind, Continent, Profile, RouteKind } from './types.ts';

// The 30-turn game is the default; a map may set its own length (the 50-turn map, task M2).
export const TOTAL_ROUNDS = 30;

// The game lengths to choose from in the setup (task M2), the first one by default.
export const GAME_LENGTHS = [30, 50] as const;
export type GameLength = (typeof GAME_LENGTHS)[number];

export const MIN_SEATS = 2;
export const MAX_SEATS = 4;
export const MAX_ROBOTS = 3;

export const PROFILES: readonly Profile[] = ['backpacker', 'business', 'luxury', 'nomad'];

// Six starting continents in v1; Antarctica is never a start.
export const START_CONTINENTS: readonly Continent[] = [
  'Europe',
  'Asia',
  'Africa',
  'North America',
  'South America',
  'Oceania',
];

export const WELCOME_BONUS: Readonly<Record<Continent, number>> = {
  Europe: 3,
  Asia: 3,
  Africa: 3,
  'North America': 4,
  'South America': 4,
  Oceania: 5,
  Antarctica: 0,
};

export const POINTS_NEW_AREA = 1;
export const POINTS_NEW_CONTINENT = 2;
// Wonder area, first visit: +1 extra on top of the area point.
export const POINTS_WONDER = 1;
// Big country with N parts, all parts visited: +1 (the area point) +N, given once.
export const POINTS_BIG_COUNTRY_AREA = 1;
// Task 14a (owner-approved): a big country in 3 parts (Canada, Russia) gives +5 instead of +1 +3.
export const POINTS_BIG_COUNTRY_3_PARTS = 5;

// Points for completing a big country with this many parts.
export function bigCountryPoints(parts: number): number {
  return parts >= 3 ? POINTS_BIG_COUNTRY_3_PARTS : POINTS_BIG_COUNTRY_AREA + parts;
}

// The ways to travel beyond walking: plane, ship, train (task 17) and bus (task 18).
export const ROUTE_KINDS: readonly RouteKind[] = ['airport', 'port', 'station', 'bus'];

// An airport or port has 1 to 3 fixed destinations (v1 scope section 4).
export const MAX_DESTINATIONS = 3;

// Ticket price per plane or ship trip (rulebook sections 5 and 12). The Backpacker never pays: quiz only.
export const TICKET_PRICE: Readonly<Record<Profile, number | null>> = {
  backpacker: null,
  business: 2,
  luxury: 3,
  nomad: 1,
};

// Train ticket (task 17, owner's rule): 2 for Business and Nomad; the Backpacker never pays
// (quiz only); Luxury can't take the train.
export const TRAIN_TICKET_PRICE: Readonly<Record<Profile, number | null>> = {
  backpacker: null,
  business: 2,
  luxury: null,
  nomad: 2,
};

// Bus ticket (task 18, owner's rule): 1 for the Nomad; the Backpacker never pays (quiz only);
// Business and Luxury can't take the bus.
export const BUS_TICKET_PRICE: Readonly<Record<Profile, number | null>> = {
  backpacker: null,
  business: null,
  luxury: null,
  nomad: 1,
};

// Who may take each kind of trip: everyone, except Luxury on the train (task 17), and only the
// Nomad and the Backpacker on the bus (task 18).
export function canRide(profile: Profile, kind: RouteKind): boolean {
  if (kind === 'station') return profile !== 'luxury';
  if (kind === 'bus') return profile === 'nomad' || profile === 'backpacker';
  return true;
}

// The ticket for a trip of this kind; null: quiz only (or no trip at all, see canRide).
export function ticketPrice(profile: Profile, kind: RouteKind): number | null {
  if (kind === 'bus') return BUS_TICKET_PRICE[profile];
  return kind === 'station' ? TRAIN_TICKET_PRICE[profile] : TICKET_PRICE[profile];
}

// Travel turns: plane 1, ship 3; Business and Luxury: plane 0, ship 1. Train and bus: 1 for
// everyone (tasks 17 and 18).
export const TRAVEL_TURNS: Readonly<Record<Profile, Readonly<Record<RouteKind, number>>>> = {
  backpacker: { airport: 1, port: 3, station: 1, bus: 1 },
  business: { airport: 0, port: 1, station: 1, bus: 1 },
  luxury: { airport: 0, port: 1, station: 1, bus: 1 },
  nomad: { airport: 1, port: 3, station: 1, bus: 1 },
};

// After this many wrong quiz answers in one area, a player who can pay must pay and board.
export const QUIZ_TRIES = 3;

// Digital Nomad: +1 for every turn on a plane, ship, train or bus.
export const POINTS_NOMAD_TRAVEL_TURN = 1;

// Visa: paid to the citizen each time another player enters their area (rulebook section 7).
export const VISA_PRICE = 2;

// Business Traveler: +3 when granted citizenship (rulebook section 12).
export const POINTS_BUSINESS_CITIZENSHIP = 3;

// Citizenship test (owner's change, after task 14e): read 6 facts, then 3 a/b questions about
// them in the same turn; 2 right answers or more pass, fewer: no citizenship.
export const EXAM_FACTS = 6;
export const EXAM_QUESTIONS = 3;
export const EXAM_PASS = 2;

// Businesses (rulebook section 6). At the end of the game each one counts for its price.
export const BUSINESS_PRICE: Readonly<Record<BusinessKind, number>> = {
  tours: 2,
  airline: 3,
  ferry: 2,
  train: 2,
  bus: 2,
};

// The business that sells the tickets at each kind of departure point.
export const TICKET_BUSINESS: Readonly<Record<RouteKind, BusinessKind>> = {
  airport: 'airline',
  port: 'ferry',
  station: 'train',
  bus: 'bus',
};

// Guided tours: 1 point to the owner each time another player enters the wonder area.
export const TOUR_FEE = 1;

// Blocked by lack of money this many turns in a row: the player is sent home (task 9).
export const GO_HOME_TURNS = 3;

// Profile bonuses (rulebook section 12). The start continent counts. The bonus is given once,
// on the move that reaches that many continents.
export const CONTINENT_BONUS: Readonly<Partial<Record<Profile, { continents: number; points: number }>>> = {
  backpacker: { continents: 3, points: 3 },
  luxury: { continents: 5, points: 5 },
};

// Digital Nomad: −5 off the final score (never below 0) with fewer than 3 continents.
export const NOMAD_MIN_CONTINENTS = 3;
export const NOMAD_PENALTY = 5;
// From this round the Nomad's continent bar warns about the penalty (the last 5 turns).
export const NOMAD_WARNING_ROUND = 25;
export function nomadWarningRound(totalRounds: number): number {
  return totalRounds - 5;
}

// Event cards (task 11, count changed in task 12): at the start of each player's 3rd, 6th, 9th …
// turn that begins in an area (trip turns don't count); none in the last round.
export const CARD_EVERY = 3;
// The 50-turn game (owner, task M2, as in the rulebook): every 5th land turn.
export const CARD_EVERY_50 = 5;
export function cardEvery(totalRounds: number): number {
  return totalRounds >= 50 ? CARD_EVERY_50 : CARD_EVERY;
}

// Travel-turn challenges (task 12): right +1, wrong −1; not offered with 0 points.
export const CHALLENGE_POINTS = 1;
