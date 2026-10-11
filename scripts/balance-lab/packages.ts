// Balance lab only: rule packages to measure. Each patch replaces text in a COPY of
// src/engine/constants.ts (never in the real file). "today" = the game as it is.
// A patch: [text, new text, file (default src/engine/constants.ts)]. ladderOnly: robot head-to-head games only.
export interface Package { name: string; about: string; patches: [string, string, string?][]; ladderOnly?: boolean; turns?: number[]; drivers?: string[]; ladder?: [string, string][] }

const LUX = 'luxury: { continents: 5, points: 5 }';
const BP = 'backpacker: { continents: 3, points: 3 }';
const BIZ = 'POINTS_BUSINESS_CITIZENSHIP = 3';
const NOMAD_TICKET = 'business: 2,\n  luxury: 3,\n  nomad: 1,';

import { readFileSync } from 'node:fs';
// The 7 Backpacker news cards added after task 18 (b9–b15, not studied): removed in the final packages.
const CARDS = readFileSync(new URL('../../src/cards/cards.ts', import.meta.url), 'utf8');
const BP_NEWS = CARDS.slice(CARDS.indexOf('  // More Backpacker news'), CARDS.indexOf('\n', CARDS.indexOf("id: 'b15'")) + 1);
const EASY = 'easy: { accuracy: 0.5, challengeFrom: 5, reserve: 5 }';
const RN = 'src/engine/normal-robot.ts';

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
  ...([['T1', 0, 7, 5, 1], ['T2', 0, 7, 5, 2], ['T3', 1, 7, 5, 1], ['T4', 0, 6, 5, 2], ['T5', 0, 6, 5, 1]] as const).map(([name, lux, bp, biz, nomad]) => ({
    name, turns: [30], drivers: ['N2', 'P4'],
    about: `30 turns: Luxury 5 continents +${lux}; Backpacker 3 continents +${bp}; Business citizenship +${biz}; Nomad ticket ${nomad}`,
    patches: [[LUX, `luxury: { continents: 5, points: ${lux} }`], [BP, `backpacker: { continents: 3, points: ${bp} }`],
      [BIZ, `POINTS_BUSINESS_CITIZENSHIP = ${biz}`], [NOMAD_TICKET, `business: 2,\n  luxury: 3,\n  nomad: ${nomad},`]] as [string, string][],
  })),
  ...([['U1', 2, 7, 6, 3, 3], ['U2', 2, 7, 6, 2, 4], ['U3', 2, 7, 6, 3, 4], ['V1', 1, 6, 7, 2, 4], ['V2', 0, 6, 7, 2, 4]] as const).map(([name, lux, bp, biz, nomad, conts]) => ({
    name, turns: [50], drivers: ['N2', 'P4'],
    about: `50 turns: Luxury 5 continents +${lux}; Backpacker 3 continents +${bp}; Business citizenship +${biz}; Nomad ticket ${nomad}; Nomad needs ${conts} continents (or −5)`,
    patches: [[LUX, `luxury: { continents: 5, points: ${lux} }`], [BP, `backpacker: { continents: 3, points: ${bp} }`],
      [BIZ, `POINTS_BUSINESS_CITIZENSHIP = ${biz}`], [NOMAD_TICKET, `business: 2,\n  luxury: 3,\n  nomad: ${nomad},`],
      ['NOMAD_MIN_CONTINENTS = 3', `NOMAD_MIN_CONTINENTS = ${conts}`]] as [string, string][],
  })),
  // Final round (owner, 2026-10-11): Luxury bonus removed at both lengths, Backpacker +6, Business +5 (30) / +7 (50),
  // Nomad ticket stays 1, Backpacker deck b1–b8, proposed robots (easy 65%, normal plans 2, hard plans 3).
  ...([['X1', 30, 5, 3, 5], ['W1', 50, 7, 4, 5], ['W2', 50, 7, 4, 8]] as const).map(([name, turns, biz, conts, pen]) => ({
    name, turns: [turns], drivers: ['N2', 'P4'], ladder: [['E', 'N2'], ['N2', 'H3']] as [string, string][],
    about: `${turns} turns: no Luxury continent bonus; Backpacker 3 continents +6; Business citizenship +${biz}; Nomad ticket 1, needs ${conts} continents or −${pen}; Backpacker cards b1–b8; easy robot 65%`,
    patches: [[LUX, 'luxury: { continents: 5, points: 0 }'], [BP, 'backpacker: { continents: 3, points: 6 }'],
      [BIZ, `POINTS_BUSINESS_CITIZENSHIP = ${biz}`], ['NOMAD_MIN_CONTINENTS = 3', `NOMAD_MIN_CONTINENTS = ${conts}`],
      ['NOMAD_PENALTY = 5', `NOMAD_PENALTY = ${pen}`], [BP_NEWS, '', 'src/cards/cards.ts'],
      [EASY, 'easy: { accuracy: 0.65, challengeFrom: 5, reserve: 4 }', RN]] as [string, string, string?][],
  })),
];
