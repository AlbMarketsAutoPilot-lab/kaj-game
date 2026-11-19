// How much geography a player sees (version 2.0, step 2.3). Run: node scripts/geo-count.ts [games per line, default 200]
//
// 1. Facts per type on each map (from src/facts/tags.ts; challenges are all geography).
// 2. Robot games (normal robots, 2 and 4 players, both maps): every question actually asked, by screen
//    (airline quiz, visa test, travel challenge), with the question rotation of step 2.1.
//    The 6 study lines of the visa test are counted apart (they are read, not answered).
import { apply, createGame } from '../src/engine/engine.ts';
import { robotAction } from '../src/engine/normal-robot.ts';
import { mapFor } from '../src/maps/index.ts';
import { factId } from '../src/engine/quiz.ts';
import { FACT_TYPES } from '../src/facts/tags.ts';
import { CHALLENGES } from '../src/challenges/challenges.ts';
import type { GameMap, GameState } from '../src/engine/types.ts';
import type { GameLength } from '../src/engine/constants.ts';

const GAMES = Number(process.argv[2] ?? 200);
const challengeType = new Map(CHALLENGES.map((c) => [c.id, c.type]));
const pct = (a: number, b: number) => (b ? `${Math.round((100 * a) / b)}%` : '–');

function typeOf(id: string | undefined): string {
  if (!id) return 'none';
  // Owner (2026-11-16): flags and currencies are not geography; capitals, continents, neighbours and size are.
  if (challengeType.has(id)) return ['flag', 'currency'].includes(challengeType.get(id)!) ? 'flags and money' : 'geography';
  const t = FACT_TYPES[id];
  if (!t) throw new Error(`fact ${id} has no type in src/facts/tags.ts`);
  return t;
}

function factCount(map: GameMap): string {
  const all: Record<string, number> = {};
  const unique = new Map<string, string>();
  for (const facts of Object.values(map.facts ?? {})) for (const f of facts) {
    const t = typeOf(factId(f));
    all[t] = (all[t] ?? 0) + 1;
    unique.set(factId(f), t);
  }
  const n = Object.values(all).reduce((a, b) => a + b, 0);
  const order = ['geography', 'culture', 'history', 'nature', 'science'];
  return `${n} facts (${unique.size} different): ` + order.map((t) => `${t} ${all[t] ?? 0} (${pct(all[t] ?? 0, n)})`).join(', ');
}

// What kind of question: a fact's type, or "challenge: <type>".
const kindOf = (id: string | undefined) => (id && challengeType.has(id) ? `challenge: ${challengeType.get(id)}` : `fact: ${typeOf(id)}`);
type Tally = Record<string, { geo: number; all: number }>;
const mix: Record<string, number> = {};

function play(map: GameMap, players: number, seed: number, tally: Tally) {
  const seats = Array.from({ length: players }, (_, i) => ({ kind: i === 0 ? 'human' as const : 'robot' as const, colour: ['red', 'blue', 'green', 'yellow'][i], level: 'normal' as const }));
  let s: GameState = createGame({ seats, seed }, map);
  let rs = seed ^ 0x5bd1e995;
  let steps = 0;
  const add = (screen: string, id: string | undefined) => {
    tally[screen] ??= { geo: 0, all: 0 };
    tally[screen].all++;
    if (typeOf(id) === 'geography') tally[screen].geo++;
    if (screen !== 'visa test study lines') mix[kindOf(id)] = (mix[kindOf(id)] ?? 0) + 1;
  };
  while (s.phase !== 'finished') {
    const before = s;
    let a;
    [a, rs] = robotAction(s, map, rs, 'normal');
    s = apply(s, map, a);
    if (s.quiz && s.quiz !== before.quiz && s.quiz.question !== before.quiz?.question) add('airline quiz', s.quiz.question.id);
    if (s.challenge && s.challenge !== before.challenge) add('travel challenge', s.challenge.id);
    // The visa test (step 2.6; it replaced the citizenship test): its questions and study lines.
    if (s.visa && !before.visa) {
      for (const q of s.visa.questions) add('visa test', q.id);
      for (const line of s.visa.study) {
        const fact = [...(map.facts?.[s.visa.to] ?? []), ...(map.examFacts?.[s.visa.to] ?? [])].find((f) => f.text === line);
        add('visa test study lines', fact ? factId(fact) : undefined);
      }
    }
    if (++steps > 20000) throw new Error('never ends');
  }
}

for (const turns of [30, 50] as GameLength[]) {
  const map = mapFor(turns);
  console.log(`\n${turns}-turn map: ${factCount(map)}`);
  for (const players of [2, 4]) {
    const tally: Tally = {};
    for (let g = 0; g < GAMES; g++) play(map, players, g * 7919 + 3, tally);
    let geo = 0, all = 0;
    const parts = Object.entries(tally).map(([k, v]) => {
      if (k !== 'visa test study lines') { geo += v.geo; all += v.all; }
      return `${k} ${(v.all / GAMES).toFixed(1)}/game, ${pct(v.geo, v.all)} geography`;
    });
    console.log(`  ${players} players, ${GAMES} games: questions asked ${(all / GAMES).toFixed(1)}/game, ${pct(geo, all)} geography`);
    for (const p of parts) console.log(`    ${p}`);
    console.log('    mix of questions asked: ' + Object.entries(mix).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${pct(v, all)}`).join(', '));
    for (const k of Object.keys(mix)) delete mix[k];
  }
}
