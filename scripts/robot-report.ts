// Robot report (task 13): games on the 30-turn map, each level alone and head to head.
// Run: node scripts/robot-report.ts [games]   (default 1,000 per line)
import { apply, createGame, currentPlayer, finalScore, legalActions } from '../src/engine/engine.ts';
import { robotAction } from '../src/engine/normal-robot.ts';
import { randomRobotAction } from '../src/engine/robot.ts';
import type { Action, GameState, RobotLevel } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';

type Driver = RobotLevel | 'random';
const GAMES = Number(process.argv[2] ?? 1000);
const COLOURS = ['red', 'blue', 'green', 'yellow'];

function play(drivers: Driver[], seed: number): GameState {
  // Seat 0 is a "human" seat (a game needs one), played here by its robot.
  const seats = drivers.map((d, i) => ({ kind: i === 0 ? 'human' as const : 'robot' as const, colour: COLOURS[i], ...(d === 'random' ? {} : { level: d }) }));
  let s = createGame({ seats, seed }, map30);
  let robotSeed = seed ^ 0x5bd1e995;
  let steps = 0;
  while (s.phase !== 'finished') {
    if (legalActions(s, map30).length === 0) throw new Error(`seed ${seed}: stuck`);
    const seat = s.offer ? s.offer.to : currentPlayer(s).seat;
    const d = drivers[seat];
    let action: Action;
    [action, robotSeed] = d === 'random' ? randomRobotAction(s, map30, robotSeed) : robotAction(s, map30, robotSeed, d);
    s = apply(s, map30, action);
    if (++steps > 5000) throw new Error(`seed ${seed}: never ends`);
  }
  return s;
}

function alone(level: Driver): string {
  let score = 0, players = 0;
  for (let g = 0; g < GAMES; g++) {
    const n = 2 + (g % 3);
    const s = play(Array(n).fill(level), g * 7919 + 13);
    for (const p of s.players) { score += finalScore(s, p); players++; }
  }
  return `${level.padEnd(6)} alone (2–4 players): average final score ${(score / players).toFixed(1)}`;
}

function versus(a: Driver, b: Driver): string {
  const wins = [0, 0];
  let draws = 0;
  const score = [0, 0];
  for (let g = 0; g < GAMES; g++) {
    // Swap the seats every other game; the first player is random anyway.
    const swap = g % 2 === 1;
    const s = play(swap ? [b, a] : [a, b], g * 104729 + 7);
    const seatOf = (k: number) => (swap ? 1 - k : k);
    for (const k of [0, 1]) score[k] += finalScore(s, s.players[seatOf(k)]);
    if (s.result!.winners.length !== 1) draws++;
    else wins[s.result!.winners[0] === seatOf(0) ? 0 : 1]++;
  }
  const pct = (n: number) => `${Math.round((100 * n) / GAMES)}%`;
  return `${a} vs ${b}: ${a} wins ${pct(wins[0])}, ${b} wins ${pct(wins[1])}, draws ${pct(draws)} · average score ${(score[0] / GAMES).toFixed(1)} vs ${(score[1] / GAMES).toFixed(1)}`;
}

for (const level of ['easy', 'normal', 'hard', 'random'] as const) console.log(alone(level));
for (const [a, b] of [['easy', 'random'], ['normal', 'random'], ['hard', 'random'], ['normal', 'easy'], ['hard', 'normal'], ['hard', 'easy']] as const) {
  console.log(versus(a, b));
}
