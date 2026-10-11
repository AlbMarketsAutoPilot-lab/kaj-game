// Balance lab only: rule packages to measure. Each patch replaces text in a COPY of
// src/engine/constants.ts (never in the real file). "today" = the game as it is.
// A patch: [text, new text, file (default src/engine/constants.ts)]. ladderOnly: robot head-to-head games only.
export interface Package { name: string; about: string; patches: [string, string, string?][]; ladderOnly?: boolean; turns?: number[]; drivers?: string[] }

const LUX = 'luxury: { continents: 5, points: 5 }';
const BP = 'backpacker: { continents: 3, points: 3 }';
const BIZ = 'POINTS_BUSINESS_CITIZENSHIP = 3';
const NOMAD_TICKET = 'business: 2,\n  luxury: 3,\n  nomad: 1,';

export const PACKAGES: Package[] = [
  { name: 'today', about: 'the game as it is now', patches: [] },
  {
    name: 'D', about: 'Luxury 5-continent bonus removed; Backpacker 3 continents +8; Business citizenship +5; Nomad ticket 2',
    patches: [[LUX, 'luxury: { continents: 5, points: 0 }'], [BP, 'backpacker: { continents: 3, points: 8 }'], [BIZ, 'POINTS_BUSINESS_CITIZENSHIP = 5'], [NOMAD_TICKET, 'business: 2,\n  luxury: 3,\n  nomad: 2,']],
  },
  ...([['F', 2, 6, 5], ['G', 2, 6, 6], ['H', 3, 6, 6], ['I', 0, 6, 6]] as const).map(([name, lux, bp, biz]) => ({
    name, about: `Luxury 5 continents +${lux}; Backpacker 3 continents +${bp}; Business citizenship +${biz}; Nomad ticket 2`,
    patches: [[LUX, `luxury: { continents: 5, points: ${lux} }`], [BP, `backpacker: { continents: 3, points: ${bp} }`],
      [BIZ, `POINTS_BUSINESS_CITIZENSHIP = ${biz}`], [NOMAD_TICKET, 'business: 2,\n  luxury: 3,\n  nomad: 2,']] as [string, string][],
  })),
  ...([['easy60', 0.6, 5], ['easy65', 0.65, 4]] as const).map(([name, acc, reserve]) => ({
    name, about: `robot ladder only: easy answers ${acc * 100}% right, keeps ${reserve} points`, ladderOnly: true,
    patches: [['easy: { accuracy: 0.5, challengeFrom: 5, reserve: 5 }', `easy: { accuracy: ${acc}, challengeFrom: 5, reserve: ${reserve} }`, 'src/engine/normal-robot.ts']] as [string, string, string][],
  })),
  // Round 3 (owner, 2026-10-11): numbers per game length, no caps; profile tests with the proposed robots
  // (normal plans 2 moves; planning robots plan 4 moves).
  ...([['T1', 0, 7, 5, 1], ['T2', 0, 7, 5, 2], ['T3', 1, 7, 5, 1]] as const).map(([name, lux, bp, biz, nomad]) => ({
    name, turns: [30], drivers: ['N2', 'P4'],
    about: `30 turns: Luxury 5 continents +${lux}; Backpacker 3 continents +${bp}; Business citizenship +${biz}; Nomad ticket ${nomad}`,
    patches: [[LUX, `luxury: { continents: 5, points: ${lux} }`], [BP, `backpacker: { continents: 3, points: ${bp} }`],
      [BIZ, `POINTS_BUSINESS_CITIZENSHIP = ${biz}`], [NOMAD_TICKET, `business: 2,\n  luxury: 3,\n  nomad: ${nomad},`]] as [string, string][],
  })),
  ...([['U1', 3, 3], ['U2', 2, 4], ['U3', 3, 4]] as const).map(([name, nomad, conts]) => ({
    name, turns: [50], drivers: ['N2', 'P4'],
    about: `50 turns: Luxury 5 continents +2; Backpacker 3 continents +7; Business citizenship +6; Nomad ticket ${nomad}; Nomad needs ${conts} continents (or −5)`,
    patches: [[LUX, 'luxury: { continents: 5, points: 2 }'], [BP, 'backpacker: { continents: 3, points: 7 }'],
      [BIZ, 'POINTS_BUSINESS_CITIZENSHIP = 6'], [NOMAD_TICKET, `business: 2,\n  luxury: 3,\n  nomad: ${nomad},`],
      ['NOMAD_MIN_CONTINENTS = 3', `NOMAD_MIN_CONTINENTS = ${conts}`]] as [string, string][],
  })),
];
