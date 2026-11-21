// Balance lab, extended (step 2.7): plays one chunk of games and prints the result as JSON (used by lab2.ts).
// node measure2.ts <job JSON>   {kind:'profiles', turns, players, driver, games, start}
// Like measure.ts (wins, scores, boredom, excitement), plus the counters the owner asks for in every report:
// go home (all, and after 3 turns without money), blocked turns, the longest blocked streak, visa tests and
// failed ones, draws, and how often robots take the quiz or pay (the robot check).
// Games `start` … `start + games − 1` use the same seeds as measure.ts (game g: seed g × 7919 + 3), so a line
// split into chunks gives the same games as one run.
import { apply, createGame, currentPlayer, finalScore, legalActions } from '../../src/engine/engine.ts';
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
const extra: Record<string, number> = { goHome: 0, homeBlocked: 0, blocked: 0, maxStreak: 0, visaTests: 0, visaFailed: 0, draws: 0, quiz: 0, paid: 0 };

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
  const streak = drivers.map(() => 0);
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
    // Sale answers: the buyer's robot; every other choice: the seat's driver.
    // Step 2.11 (owner): seat 0 stands for the person, who chooses a profile freely (here: at random among the
    // free ones); the robots take Kris Ann first (normal-robot.ts), so she is in every robot game.
    if (s.phase === 'chooseProfile' && seat === 0) {
      const options = legalActions(s, map);
      a = options[Math.floor((((seed * 2654435761) >>> 0) / 2 ** 32) * options.length)];
    } else [a, rs] = s.offer ? robotAction(s, map, rs, lvl.accuracy) : planAction(s, map, rs, lvl);
    if (a.type === 'blocked' || a.type === 'lostTurn') turnDull = true;
    if (a.type === 'blocked') { extra.blocked++; streak[seat]++; extra.maxStreak = Math.max(extra.maxStreak, streak[seat]); }
    else if (a.type === 'walk' || a.type === 'board' || a.type === 'quiz' || a.type === 'goHome') streak[seat] = 0;
    if (a.type === 'quiz') extra.quiz++;
    if (a.type === 'board') extra.paid++;
    if (a.type === 'goHome') extra.homeBlocked++;
    s = apply(s, map, a);
    // Every way home (3 turns without money, or the 3rd wrong quiz answer) gives a 'home' reward (step 2.7).
    extra.goHome += s.rewards.filter((r) => r.kind === 'home').length;
    if (s.visaTested) { extra.visaTests++; if (!s.visaTested.passed) extra.visaFailed++; }
    if (++steps > 20000) throw new Error('never ends');
  }
  closeTurn();
  const end = s.players.map((p) => finalScore(s, p)).sort((x, y) => y - x);
  feel.games++; feel.margin += end[0] - end[1]; if (end[0] - end[1] <= 3) feel.close++;
  if (s.result!.winners.length !== 1) extra.draws++;
  return s;
}

const out: Record<string, unknown> = { job };
const st: Record<string, { score: number; wins: number; games: number }> = {};
const start = job.start ?? 0;
for (let g = start; g < start + job.games; g++) {
  const s = play(Array(job.players).fill(job.driver), g * 7919 + 3);
  for (const p of s.players) {
    const k = p.profile!;
    st[k] ??= { score: 0, wins: 0, games: 0 };
    st[k].score += finalScore(s, p); st[k].games++;
    if (s.result!.winners.length === 1 && s.result!.winners[0] === p.seat) st[k].wins++;
  }
}
out.profiles = st;
out.feel = { boredom: feel.dull / feel.turns, leadChanges: feel.leadChanges / feel.games, margin: feel.margin / feel.games, close: feel.close / feel.games };
out.extra = extra;
console.log(JSON.stringify(out));
