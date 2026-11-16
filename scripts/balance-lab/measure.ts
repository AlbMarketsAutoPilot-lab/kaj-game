// Balance lab only: plays one line of games and prints the result as JSON (used by run.ts).
// node measure.ts <job JSON>
//   {kind:'versus', turns, a, b, games}  2 players, seats swapped every other game
//   {kind:'profiles', turns, players, driver, games}  every seat the same driver
// Boredom (owner, 2026-11-16): share of turns blocked, lost, or worth 0 points (waiting turns
// included). Excitement: changes of the leader (checked after every round) and how close the finish is.
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

const feel = { turns: 0, dull: 0, leadChanges: 0, margin: 0, close: 0, games: 0 };

function leader(s: GameState): number | null {
  const scores = s.players.map((p) => finalScore(s, p));
  const best = Math.max(...scores);
  return scores.filter((x) => x === best).length === 1 ? scores.indexOf(best) : null;
}

function play(drivers: string[], seed: number): GameState {
  const seats = drivers.map((d, i) => ({ kind: i === 0 ? 'human' as const : 'robot' as const, colour: COLOURS[i], level: DRIVERS[d].accuracy as RobotLevel }));
  let s = createGame({ seats, seed }, map);
  let rs = seed ^ 0x5bd1e995;
  let steps = 0;
  let turnKey = ''; let turnSeat = -1; let turnStart = 0; let turnDull = false;
  let lastRound = 0; let lead: number | null = null;
  const closeTurn = () => {
    if (turnSeat < 0) return;
    feel.turns++;
    if (turnDull || finalScore(s, s.players[turnSeat]) <= turnStart) feel.dull++;
  };
  while (s.phase !== 'finished') {
    if (s.phase === 'play' && !s.offer) {
      const key = `${s.round}:${s.current}`;
      if (key !== turnKey) {
        closeTurn();
        turnKey = key; turnSeat = currentPlayer(s).seat; turnStart = finalScore(s, currentPlayer(s)); turnDull = false;
        if (s.round !== lastRound) {
          const now = leader(s);
          if (lastRound > 0 && now !== null && lead !== null && now !== lead) feel.leadChanges++;
          if (now !== null) lead = now;
          lastRound = s.round;
        }
      }
    }
    const seat = s.offer ? s.offer.to : currentPlayer(s).seat;
    const lvl = DRIVERS[drivers[seat]];
    let a: Action;
    // Sale answers and other players' choices: the driver of the seat that acts.
    [a, rs] = s.offer ? robotAction(s, map, rs, lvl.accuracy) : planAction(s, map, rs, lvl);
    if (a.type === 'blocked' || a.type === 'lostTurn') turnDull = true;
    s = apply(s, map, a);
    if (++steps > 20000) throw new Error('never ends');
  }
  closeTurn();
  const end = s.players.map((p) => finalScore(s, p)).sort((x, y) => y - x);
  feel.games++; feel.margin += end[0] - end[1]; if (end[0] - end[1] <= 3) feel.close++;
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
out.feel = { boredom: feel.dull / feel.turns, leadChanges: feel.leadChanges / feel.games, margin: feel.margin / feel.games, close: feel.close / feel.games };
console.log(JSON.stringify(out));
