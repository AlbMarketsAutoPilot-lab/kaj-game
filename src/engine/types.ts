// Shared types for the KAJ rules engine. The engine has no screens:
// a game is a plain state object, changed only by apply(state, action).

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
export interface Route {
  kind: RouteKind;
  a: string;
  b: string;
}

export interface GameMap {
  id: string;
  areas: Area[];
  routes?: Route[];
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
  result: GameResult | null;
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
  // Only legal when every neighbouring area is taken. Not in the rulebook;
  // it stops the engine from freezing (see docs/engine.md).
  | { type: 'blocked' };
