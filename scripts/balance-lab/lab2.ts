// Balance lab, extended (step 2.7): the 8 fairness lines with every counter of the owner's reports.
// Run: node scripts/balance-lab/lab2.ts <label> [games per line, default 1600] [source folder, default this project]
//
// The source folder is a copy of the project (src/ and scripts/balance-lab/), for example a scratch copy with a
// changed rule. Its code is copied again to a temporary folder and played there, so nothing is changed. Lines:
// 30 and 50 turns × 2 and 4 players × normal robots (N2, plans 2) and planning robots (P4, plans 4); robots in
// every seat, profiles at random. Each line is split into 8 chunks run in parallel (same games as one run).
// The result is written to <temporary folder>/kaj-lab2/<label>.json (the path is printed); read it with report2.ts.
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { cpus, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

export const RESULTS = join(tmpdir(), 'kaj-lab2');
const [label, gamesArg = '1600', sourceArg] = process.argv.slice(2);
if (!label) throw new Error('usage: node scripts/balance-lab/lab2.ts <label> [games per line] [source folder]');
const GAMES = Number(gamesArg);
const CHUNKS = 8;
if (GAMES % CHUNKS !== 0) throw new Error(`games per line must be a multiple of ${CHUNKS}`);
const source = resolve(sourceArg ?? new URL('../../', import.meta.url).pathname);
const here = new URL('.', import.meta.url).pathname;

const dir = mkdtempSync(join(tmpdir(), `kaj-lab2-${label}-`));
cpSync(join(source, 'src'), join(dir, 'src'), { recursive: true });
cpSync(join(source, 'scripts/balance-lab'), join(dir, 'scripts/balance-lab'), { recursive: true });
// Always this version of measure2.ts, so an older source folder is measured the same way.
cpSync(join(here, 'measure2.ts'), join(dir, 'scripts/balance-lab/measure2.ts'));

const jobs: any[] = [];
for (const turns of [30, 50]) for (const players of [2, 4]) for (const driver of ['N2', 'P4']) {
  for (let c = 0; c < CHUNKS; c++) jobs.push({ kind: 'profiles', turns, players, driver, start: (c * GAMES) / CHUNKS, games: GAMES / CHUNKS });
}
// The slowest lines first (50 turns, 4 players, planning robots).
const weight = (j: any) => j.turns * j.players * (j.driver === 'P4' ? 3 : 1);
jobs.sort((a, b) => weight(b) - weight(a));

const run = (job: any) => new Promise<any>((res, rej) => {
  const p = spawn(process.execPath, [join(dir, 'scripts/balance-lab/measure2.ts'), JSON.stringify(job)]);
  let out = '';
  p.stdout.on('data', (d) => (out += d));
  p.stderr.on('data', (d) => process.stderr.write(d));
  p.on('close', (code) => (code === 0 ? res(JSON.parse(out)) : rej(new Error('job failed ' + JSON.stringify(job)))));
});
const results: any[] = [];
let next = 0;
await Promise.all(Array.from({ length: Math.max(1, cpus().length) }, async () => {
  while (next < jobs.length) { const j = jobs[next++]; results.push(await run(j)); process.stdout.write('.'); }
}));

// Merge the chunks of each line.
const merged: Record<string, any> = {};
for (const r of results) {
  const k = `${r.job.turns}t ${r.job.players}p ${r.job.driver}`;
  const m = merged[k] ??= { games: 0, profiles: {}, feelSum: { boredom: 0, leadChanges: 0, margin: 0, close: 0 }, extra: {} };
  m.games += r.job.games;
  for (const [p, v] of Object.entries<any>(r.profiles)) {
    const q = m.profiles[p] ??= { score: 0, wins: 0, games: 0 };
    q.score += v.score; q.wins += v.wins; q.games += v.games;
  }
  for (const f of ['boredom', 'leadChanges', 'margin', 'close']) m.feelSum[f] += r.feel[f] * r.job.games;
  for (const [e, v] of Object.entries<number>(r.extra)) m.extra[e] = e === 'maxStreak' ? Math.max(m.extra[e] ?? 0, v) : (m.extra[e] ?? 0) + v;
}
mkdirSync(RESULTS, { recursive: true });
const file = join(RESULTS, `${label}.json`);
writeFileSync(file, JSON.stringify(merged, null, 1));
rmSync(dir, { recursive: true, force: true });
console.log(`\nsaved ${file}`);
