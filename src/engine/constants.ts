import type { BusinessKind, Continent, Profile, RouteKind } from './types.ts';

// v1 has only the 30-turn map (KAJ-v1-scope.md section 4).
export const TOTAL_ROUNDS = 30;

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
// Big country with N parts, all parts visited: +1 (the area point) +N.
export const POINTS_BIG_COUNTRY_AREA = 1;

// An airport or port has 1 to 3 fixed destinations (v1 scope section 4).
export const MAX_DESTINATIONS = 3;

// Ticket price per trip (rulebook sections 5 and 12). The Backpacker never pays: quiz only.
export const TICKET_PRICE: Readonly<Record<Profile, number | null>> = {
  backpacker: null,
  business: 2,
  luxury: 3,
  nomad: 1,
};

// Travel turns: plane 1, ship 3; Business and Luxury: plane 0, ship 1.
export const TRAVEL_TURNS: Readonly<Record<Profile, Readonly<Record<RouteKind, number>>>> = {
  backpacker: { airport: 1, port: 3 },
  business: { airport: 0, port: 1 },
  luxury: { airport: 0, port: 1 },
  nomad: { airport: 1, port: 3 },
};

// After this many wrong quiz answers in one area, a player who can pay must pay and board.
export const QUIZ_TRIES = 3;

// Digital Nomad: +1 for every turn on a plane or ship.
export const POINTS_NOMAD_TRAVEL_TURN = 1;

// Visa: paid to the citizen each time another player enters their area (rulebook section 7).
export const VISA_PRICE = 2;

// Business Traveler: +3 when granted citizenship (rulebook section 12).
export const POINTS_BUSINESS_CITIZENSHIP = 3;

// Citizenship test: 3 a/b questions (v1 scope, changed by the owner in task 8: no study step).
export const EXAM_QUESTIONS = 3;

// Businesses (rulebook section 6). At the end of the game each one counts for its price.
export const BUSINESS_PRICE: Readonly<Record<BusinessKind, number>> = {
  tours: 2,
  airline: 3,
  ferry: 2,
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
// From this round the Nomad's continent bar warns about the penalty.
export const NOMAD_WARNING_ROUND = 25;

// Event cards (task 11): at the start of every player's turn in rounds 3, 6 … 27
// (owner's choice: none in the last round), and on every travel turn.
export const CARD_EVERY = 3;
export const CARD_LAST_ROUND = 27;
