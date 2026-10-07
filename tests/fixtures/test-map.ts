import type { GameMap } from '../../src/engine/types.ts';

// A tiny made-up map for tests: 8 areas on 4 continents, walking links only.
// Not real geography; the real 30-turn map comes later.
//
//   eu-north — eu-east — as-west — as-east — na-one
//      |      /            |
//   eu-west — af-north ----+
//                 |
//              af-south
export const testMap: GameMap = {
  id: 'test',
  areas: [
    { id: 'eu-west', name: 'West Europe', continent: 'Europe', neighbours: ['eu-north', 'eu-east', 'af-north'] },
    { id: 'eu-north', name: 'North Europe', continent: 'Europe', neighbours: ['eu-west', 'eu-east'] },
    { id: 'eu-east', name: 'East Europe', continent: 'Europe', neighbours: ['eu-west', 'eu-north', 'as-west'] },
    { id: 'as-west', name: 'West Asia', continent: 'Asia', neighbours: ['eu-east', 'as-east', 'af-north'] },
    { id: 'as-east', name: 'East Asia', continent: 'Asia', neighbours: ['as-west', 'na-one'] },
    { id: 'af-north', name: 'North Africa', continent: 'Africa', neighbours: ['eu-west', 'af-south', 'as-west'] },
    { id: 'af-south', name: 'South Africa', continent: 'Africa', neighbours: ['af-north'] },
    { id: 'na-one', name: 'North America', continent: 'North America', neighbours: ['as-east'] },
  ],
};

// The same map with airports and ports, for the travel tests:
//   ✈️ eu-west ↔ as-east ↔ af-south (as-east is a hub)   ⛴️ eu-north ↔ na-one
export const travelMap: GameMap = {
  ...testMap,
  id: 'test-travel',
  routes: [
    { kind: 'airport', a: 'eu-west', b: 'as-east' },
    { kind: 'airport', a: 'as-east', b: 'af-south' },
    { kind: 'port', a: 'eu-north', b: 'na-one' },
  ],
};
