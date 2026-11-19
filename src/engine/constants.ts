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

// The ways to travel beyond walking: plane, ship, train (task 17), bus (task 18) and car (task 19).
export const ROUTE_KINDS: readonly RouteKind[] = ['airport', 'port', 'station', 'bus', 'car'];

// An airport or port has 1 to 3 fixed destinations (v1 scope section 4).
export const MAX_DESTINATIONS = 3;

// Ticket price per plane or ship trip (rulebook sections 5 and 12). The Backpacker never pays: quiz only.
export const TICKET_PRICE: Readonly<Record<Profile, number | null>> = {
  backpacker: null,
  business: 2,
  luxury: 3,
  nomad: 1,
};

// Train ticket (task 17, owner's rule; step 2.7: the Nomad pays 1): Business 2, Nomad 1; the
// Backpacker never pays (quiz only); Luxury can't take the train.
export const TRAIN_TICKET_PRICE: Readonly<Record<Profile, number | null>> = {
  backpacker: null,
  business: 2,
  luxury: null,
  nomad: 1,
};

// Bus ticket (task 18, owner's rule): 1 for the Nomad; the Backpacker never pays (quiz only);
// Business and Luxury can't take the bus.
export const BUS_TICKET_PRICE: Readonly<Record<Profile, number | null>> = {
  backpacker: null,
  business: null,
  luxury: null,
  nomad: 1,
};

// Car rental (task 19, owner's rule; step 2.7: Business and Luxury pay 2): Nomad 1, Business 2,
// Luxury 2, never a quiz. The Backpacker never pays: it hitchhikes (see `hitchhikeStops` in engine.ts).
export const CAR_TICKET_PRICE: Readonly<Record<Profile, number | null>> = {
  backpacker: null,
  business: 2,
  luxury: 2,
  nomad: 1,
};

// Who may take each kind of trip: everyone, except Luxury on the train (task 17), and only the
// Nomad and the Backpacker on the bus (task 18). Everyone takes the car (task 19).
export function canRide(profile: Profile, kind: RouteKind): boolean {
  if (kind === 'station') return profile !== 'luxury';
  if (kind === 'bus') return profile === 'nomad' || profile === 'backpacker';
  return true;
}

// The ticket for a trip of this kind; null: quiz only (or no trip at all, see canRide).
export function ticketPrice(profile: Profile, kind: RouteKind): number | null {
  if (kind === 'bus') return BUS_TICKET_PRICE[profile];
  if (kind === 'car') return CAR_TICKET_PRICE[profile];
  return kind === 'station' ? TRAIN_TICKET_PRICE[profile] : TICKET_PRICE[profile];
}

// Travel turns (step 2.7, owner): a paid ticket is fast, a free one (the airline quiz, hitchhiking)
// is slow, for every profile. Paid: plane 0, ship 1, train 0, bus 0, car 1. Free: plane 1, ship 2,
// train 1, bus 1, car (hitchhiking) 1. The Backpacker never pays, so it always travels the free way.
export const PAID_TRAVEL_TURNS: Readonly<Record<RouteKind, number>> = { airport: 0, port: 1, station: 0, bus: 0, car: 1 };
export const FREE_TRAVEL_TURNS: Readonly<Record<RouteKind, number>> = { airport: 1, port: 2, station: 1, bus: 1, car: 1 };
export function travelTurns(profile: Profile, kind: RouteKind, paid: boolean): number {
  return paid && ticketPrice(profile, kind) !== null ? PAID_TRAVEL_TURNS[kind] : FREE_TRAVEL_TURNS[kind];
}

// After this many wrong quiz answers in one area, a player who can pay must pay and board.
export const QUIZ_TRIES = 3;

// Digital Nomad: +1 for every trip by plane, ship, train, bus or car (balance, owner 2026-10-11: per trip,
// no longer per travel turn). Step 2.5 (owner): only on a trip to an area the Nomad has not visited yet; a
// repeated trip gives 0. Step 2.7 (owner): only on a trip with at least 1 travel turn (it works on the way),
// so a paid plane, train or bus trip (0 turns) gives nothing; the ship's +2 of step 2.6 is gone.
export const POINTS_NOMAD_TRIP = 1;
// Step 2.5 (owner): the boss's bonus on every second free ship trip to a new area (the other one brings a
// challenge offer instead; see nomadAlert in engine.ts).
export const POINTS_NOMAD_BONUS = 1;

// Visa: paid to the citizen each time another player enters their country from outside (rulebook
// section 7; step 2.6: every entry). The Business never pays a visa; Luxury pays but takes no test.
export const VISA_PRICE = 2;

// Step 2.6 (owner): the Business's one 2nd citizenship is free. (The +6 for citizenship is gone.)
export const SECOND_CITIZENSHIP_PRICE = 0;

// Visa test (step 2.6, the screens of the old citizenship test): read 6 facts, then 3 a/b questions
// about them in the same turn; 2 right answers or more pass.
export const VISA_TEST_FACTS = 6;
export const VISA_TEST_QUESTIONS = 3;
export const VISA_TEST_PASS = 2;

// Businesses (rulebook section 6). At the end of the game each one counts for its price.
// Step 2.7 (owner): airline and ferry agency 2; guided tours, train, bus and car booths 1.
export const BUSINESS_PRICE: Readonly<Record<BusinessKind, number>> = {
  tours: 1,
  airline: 2,
  ferry: 2,
  train: 1,
  bus: 1,
  car: 1,
};
// Step 2.7 (owner): at the end, every player owning the most businesses (at least 1) gets +1.
export const MOST_BUSINESSES_BONUS = 1;

// The business that sells the tickets at each kind of departure point.
export const TICKET_BUSINESS: Readonly<Record<RouteKind, BusinessKind>> = {
  airport: 'airline',
  port: 'ferry',
  station: 'train',
  bus: 'bus',
  car: 'car',
};

// The bus and the car give a big country's points at once (owner, M5 and task 19).
export function wholeCountryTrip(kind: RouteKind): boolean {
  return kind === 'bus' || kind === 'car';
}

// Guided tours: 1 point to the owner each time another player enters the wonder area.
export const TOUR_FEE = 1;

// Blocked by lack of money this many turns in a row: the player is sent home (task 9).
export const GO_HOME_TURNS = 3;
// Step 2.7 (owner): going home (after 3 turns blocked by money, or after the 3rd wrong quiz answer with
// no money for the ticket) gives +2 every time, so the player can pay a visa and start again.
export const GO_HOME_POINTS = 2;


// Profile bonuses (rulebook section 12). The start continent counts. The bonus is given once,
// on the move that reaches that many continents. Balance (owner, 2026-10-11, measured in
// docs/balance-lab.md): Backpacker +7 (was +3); the Luxury +5 for 5 continents is removed; the
// Nomad gets +5 for 3 continents (instead of −5 at the end with fewer than 3).
// Step 2.7 (owner): the Nomad's +5 for 3 continents is removed.
export const CONTINENT_BONUS: Readonly<Partial<Record<Profile, { continents: number; points: number }>>> = {
  backpacker: { continents: 3, points: 7 },
};

// Whole continent (owner, M5): every area of a continent visited gives, once, the number of its
// areas divided by 3 (rounded), and at least 2. So bigger continents and the bigger map give more:
// 30 turns Europe 4, Asia 5, Africa 3, North America 3, South America 2, Oceania 2;
// 50 turns Europe 6, Asia 8, Africa 6, North America 3, South America 3, Oceania 2.
export const CONTINENT_REWARD_AREAS = 3;
export const CONTINENT_REWARD_MIN = 2;
export function continentRewardFor(areas: number): number {
  return Math.max(CONTINENT_REWARD_MIN, Math.round(areas / CONTINENT_REWARD_AREAS));
}

// Event cards (task 11, count changed in task 12): at the start of each player's 3rd, 6th, 9th …
// turn that begins in an area (trip turns don't count); none in the last round.
export const CARD_EVERY = 3;
// The 50-turn game (owner, task M2, as in the rulebook): every 5th land turn.
export const CARD_EVERY_50 = 5;
export function cardEvery(totalRounds: number): number {
  return totalRounds >= 50 ? CARD_EVERY_50 : CARD_EVERY;
}

// Event-card mix by profile and number of players (step 2.6; step 2.7, owner's final mix "D1", measured in
// robot games): the same cards for everyone; only how often good and bad ones come. A good card (points
// above 0) counts `good` times, a bad one (points below 0, or losing a turn) `bad` times. 3 players use the
// 4-player mix. Not listed: the normal deck (1 and 1). The Backpacker's helper cards b1–b8 are not drawn
// (kept in cards.ts).
export interface CardMix { good: number; bad: number }
export const EVENT_MIX: Readonly<Record<'2' | '4', Partial<Record<Profile, CardMix>>>> = {
  2: { business: { good: 1.1, bad: 0.95 } },
  4: {
    backpacker: { good: 0.93, bad: 1.3 },
    business: { good: 1.2, bad: 0.87 },
    luxury: { good: 1.3, bad: 0.85 },
    nomad: { good: 1.1, bad: 0.92 },
  },
};
export function cardMix(profile: Profile, players: number): CardMix {
  return EVENT_MIX[players <= 2 ? '2' : '4'][profile] ?? { good: 1, bad: 1 };
}

// Travel-turn challenges (task 12): right +1, wrong −1; not offered with 0 points.
export const CHALLENGE_POINTS = 1;
