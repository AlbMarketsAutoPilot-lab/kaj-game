import type { Continent, Profile } from './types.ts';

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

// An airport or port has 1 or 2 fixed destinations (v1 scope section 4).
export const MAX_DESTINATIONS = 2;
