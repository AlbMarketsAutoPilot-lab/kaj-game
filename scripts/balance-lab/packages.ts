// Balance lab only: rule packages to measure. Each patch replaces text in a COPY of
// src/engine/constants.ts (never in the real file). "today" = the game as it is.
// A patch: [text, new text, file (default src/engine/constants.ts)]. ladderOnly: robot head-to-head games only.
export interface Package { name: string; about: string; patches: [string, string, string?][]; ladderOnly?: boolean }

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
];
