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
const ENG = 'src/engine/engine.ts';

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
  // Round 5 (owner, 2026-10-11): the Nomad works on travel turns (no challenge); Backpacker +8, with its
  // deck b1–b8 or b1–b15; easy robot 65% (30 turns) or 70% (50 turns); hard plans 3 (and 4, to compare).
  ...([['Y1', 30, 5, false, 0.65], ['Y2', 30, 5, true, 0.65], ['Z1', 50, 7, false, 0.7], ['Z2', 50, 7, true, 0.7]] as const).map(([name, turns, biz, news, easy]) => ({
    name, turns: [turns], drivers: ['N2', 'P4'], ladder: [['E', 'N2'], ['N2', 'H3'], ['N2', 'H4']] as [string, string][],
    about: `${turns} turns: no Luxury continent bonus; Backpacker 3 continents +8, cards ${news ? 'b1–b15' : 'b1–b8'}; Business citizenship +${biz}; Nomad ticket 1, no challenge on travel turns, 3 continents or −5; easy robot ${easy * 100}%`,
    patches: [[LUX, 'luxury: { continents: 5, points: 0 }'], [BP, 'backpacker: { continents: 3, points: 8 }'],
      [BIZ, `POINTS_BUSINESS_CITIZENSHIP = ${biz}`],
      ["return me.points >= CHALLENGE_POINTS ? [", "return me.points >= CHALLENGE_POINTS && me.profile !== 'nomad' ? [", 'src/engine/engine.ts'],
      ...(news ? [] : [[BP_NEWS, '', 'src/cards/cards.ts']]),
      [EASY, `easy: { accuracy: ${easy}, challengeFrom: 5, reserve: 4 }`, RN]] as [string, string, string?][],
  })),
  // Final candidate (2026-10-11): the same rules on both maps. Luxury no continent bonus; Backpacker +7, cards b1–b8;
  // Business citizenship +6; Nomad ticket 1, no challenges, +5 for 3 continents (no −5). Robots: easy 65% (30) / 70% (50).
  ...([['FINAL-30', 30, 0.65], ['FINAL-50', 50, 0.7]] as const).map(([name, turns, easy]) => ({
    name, turns: [turns], drivers: ['N2', 'P4'], ladder: [['E', 'N2'], ['N2', 'H3']] as [string, string][],
    about: 'no Luxury continent bonus; Backpacker 3 continents +7, cards b1–b8; Business citizenship +6; Nomad ticket 1, no challenges, +5 for 3 continents',
    patches: [[LUX, 'luxury: { continents: 5, points: 0 },\n  nomad: { continents: 3, points: 5 }'], [BP, 'backpacker: { continents: 3, points: 7 }'],
      [BIZ, 'POINTS_BUSINESS_CITIZENSHIP = 6'], ['NOMAD_PENALTY = 5', 'NOMAD_PENALTY = 0'],
      ["return me.points >= CHALLENGE_POINTS ? [", "return me.points >= CHALLENGE_POINTS && me.profile !== 'nomad' ? [", 'src/engine/engine.ts'],
      [BP_NEWS, '', 'src/cards/cards.ts'], [EASY, `easy: { accuracy: ${easy}, challengeFrom: 5, reserve: 4 }`, RN]] as [string, string, string?][],
  })),
  // Owner (2026-10-11): the final candidate plus (1) the Nomad's +1 per trip, not per travel turn, and (2) the
  // Backpacker's lift: once per continent, on its first walking turn there, it may walk a 2nd area in the same
  // turn (each area its points and fees, only through free areas; one area is fine, the lift is then used up).
  ...([['LIFT-30', 30], ['LIFT-50', 50]] as const).map(([name, turns]) => ({
    name, turns: [turns], drivers: ['N2', 'P4'],
    about: 'final candidate + Nomad +1 per trip (not per travel turn) + Backpacker lift once per continent',
    patches: [[LUX, 'luxury: { continents: 5, points: 0 },\n  nomad: { continents: 3, points: 5 }'], [BP, 'backpacker: { continents: 3, points: 7 }'],
      [BIZ, 'POINTS_BUSINESS_CITIZENSHIP = 6'], ['NOMAD_PENALTY = 5', 'NOMAD_PENALTY = 0'],
      ["return me.points >= CHALLENGE_POINTS ? [", "return me.points >= CHALLENGE_POINTS && me.profile !== 'nomad' ? [", ENG],
      [BP_NEWS, '', 'src/cards/cards.ts'],
      // Nomad: +1 once per trip (on its first travel turn).
      ["  if (me.profile === 'nomad') me.points = addPoints(me.points, POINTS_NOMAD_TRAVEL_TURN);",
        "  if (me.profile === 'nomad' && trip.turnsLeft === TRAVEL_TURNS.nomad[trip.kind]) me.points = addPoints(me.points, POINTS_NOMAD_TRAVEL_TURN);", ENG],
      ["const nomad = me.profile === 'nomad' ? travel : 0;", "const nomad = me.profile === 'nomad' ? 1 : 0;", RN],
      ["const nomad = me.profile === 'nomad' ? travel : 0;", "const nomad = me.profile === 'nomad' ? 1 : 0;", 'scripts/balance-lab/planner.ts'],
      // Backpacker lift: the 2nd step of the turn.
      ["      if (me.loseTurn) return [{ type: 'lostTurn' }];", `      if (me.loseTurn) return [{ type: 'lostTurn' }];
      if ((state as any).liftStep) {
        const shut = closedAreas(state, me.seat);
        const steps: Action[] = areaById(map, me.area!).neighbours
          .filter((to) => !shut.has(to) && me.points >= feeTotal(entryFees(state, me, me.area, to))).map((to) => ({ type: 'walk', to }));
        return [...steps, { type: 'liftStop' } as any];
      }`, ENG],
      [`      arrive(next, map, me, areaById(map, action.to));
      endTurn(next, map);
      return next;
    }
    case 'askCitizenship': {`, `      const liftFrom = areaById(map, me.area!).continent;
      arrive(next, map, me, areaById(map, action.to));
      const lifts: string[] = ((me as any).lifts ??= []);
      if (!(next as any).liftStep && me.profile === 'backpacker' && !lifts.includes(liftFrom)) {
        lifts.push(liftFrom);
        (next as any).liftStep = true;
        return next;
      }
      (next as any).liftStep = false;
      endTurn(next, map);
      return next;
    }
    case 'liftStop' as any: {
      (next as any).liftStep = false;
      endTurn(next, map);
      return next;
    }
    case 'askCitizenship': {`, ENG]] as [string, string, string?][],
  })),
];
