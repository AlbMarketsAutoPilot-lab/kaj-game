// Balance lab only: plays one line of games and prints the result as JSON (used by run.ts).
// node measure.ts <job JSON>
//   {kind:'versus', turns, a, b, games}  2 players, seats swapped every other game
//   {kind:'profiles', turns, players, driver, games}  every seat the same driver
// A driver: E, N, H (today's robots) or N2, H4, P4 (planning: accuracy of normal/hard, depth).
import { apply, createGame, currentPlayer, finalScore } from '../../src/engine/engine.ts';
import { robotAction } from '../../src/engine/normal-robot.ts';
import { mapFor } from '../../src/maps/index.ts';
import type { Action, GameState, RobotLevel } from '../../src/engine/types.ts';
import type { GameLength } from '../../src/engine/constants.ts';
import { planAction, type PlanLevel } from './planner.ts';

const DRIVERS: Record<string, PlanLevel> = {
  E: { accuracy: 'easy', depth: 1 }, N: { accuracy: 'normal', depth: 1 }, H: { accuracy: 'hard', depth: 1 },
  N2: { accuracy: 'normal', depth: 2 }, H3: { accuracy: 'hard', depth: 3 }, H4: { accuracy: 'hard', depth: 4 },
  P4: { accuracy: 'normal', depth: 4 },
};
const job = JSON.parse(process.argv[2]);
const map = mapFor(job.turns as GameLength);
const COLOURS = ['red', 'blue', 'green', 'yellow'];

function play(drivers: string[], seed: number): GameState {
  const seats = drivers.map((d, i) => ({ kind: i === 0 ? 'human' as const : 'robot' as const, colour: COLOURS[i], level: DRIVERS[d].accuracy as RobotLevel }));
  let s = createGame({ seats, seed }, map);
  let rs = seed ^ 0x5bd1e995;
  let steps = 0;
  while (s.phase !== 'finished') {
    const seat = s.offer ? s.offer.to : currentPlayer(s).seat;
    const lvl = DRIVERS[drivers[seat]];
    let a: Action;
    // Sale answers and other players' choices: the driver of the seat that acts.
    [a, rs] = s.offer ? robotAction(s, map, rs, lvl.accuracy) : planAction(s, map, rs, lvl);
    s = apply(s, map, a);
    if (++steps > 20000) throw new Error('never ends');
  }
  return s;
}

const out: Record<string, unknown> = { job };
if (job.kind === 'versus') {
  const wins = [0, 0]; const score = [0, 0]; let draws = 0;
  for (let g = 0; g < job.games; g++) {
    const swap = g % 2 === 1;
    const s = play(swap ? [job.b, job.a] : [job.a, job.b], g * 104729 + 7);
    const seatOf = (k: number) => (swap ? 1 - k : k);
    for (const k of [0, 1]) score[k] += finalScore(s, s.players[seatOf(k)]);
    if (s.result!.winners.length !== 1) draws++;
    else wins[s.result!.winners[0] === seatOf(0) ? 0 : 1]++;
  }
  Object.assign(out, { winsA: wins[0], winsB: wins[1], draws, scoreA: score[0] / job.games, scoreB: score[1] / job.games });
} else {
  const st: Record<string, { score: number; wins: number; games: number }> = {};
  for (let g = 0; g < job.games; g++) {
    const s = play(Array(job.players).fill(job.driver), g * 7919 + 3);
    for (const p of s.players) {
      const k = p.profile!;
      st[k] ??= { score: 0, wins: 0, games: 0 };
      st[k].score += finalScore(s, p); st[k].games++;
      if (s.result!.winners.length === 1 && s.result!.winners[0] === p.seat) st[k].wins++;
    }
  }
  out.profiles = st;
}
console.log(JSON.stringify(out));
