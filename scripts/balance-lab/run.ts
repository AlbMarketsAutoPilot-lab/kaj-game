// Balance lab (owner, 2026-10-11): numbers and real percentages before anything frozen is touched.
// Run: node scripts/balance-lab/run.ts [games per line, default 400] [package names...]
//
// The game code in src/ is NEVER changed. For each rule package the lab copies src/ and the lab
// scripts to a temporary folder, changes the copy's src/engine/constants.ts, and plays robot games
// there (measure.ts). Results are kept in scripts/balance-lab/results.json and written to
// docs/balance-lab.md.
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir, cpus } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { PACKAGES } from './packages.ts';

const root = new URL('../../', import.meta.url).pathname;
const GAMES = Number(process.argv[2] ?? 400);
const wanted = process.argv.slice(3);
const resultsFile = join(root, 'scripts/balance-lab/results.json');
const results: Record<string, any> = existsSync(resultsFile) ? JSON.parse(readFileSync(resultsFile, 'utf8')) : {};

function copyFor(pkg: (typeof PACKAGES)[number]): string {
  const dir = mkdtempSync(join(tmpdir(), 'kaj-lab-'));
  cpSync(join(root, 'src'), join(dir, 'src'), { recursive: true });
  cpSync(join(root, 'scripts/balance-lab'), join(dir, 'scripts/balance-lab'), { recursive: true });
  for (const [from, to, rel = 'src/engine/constants.ts'] of pkg.patches) {
    const file = join(dir, rel);
    const text = readFileSync(file, 'utf8');
    if (!text.includes(from)) throw new Error(`${pkg.name}: "${from}" not found in ${rel}`);
    writeFileSync(file, text.replace(from, to));
  }
  return dir;
}

function run(dir: string, job: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [join(dir, 'scripts/balance-lab/measure.ts'), JSON.stringify(job)]);
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => process.stderr.write(d));
    p.on('close', (code) => (code === 0 ? resolve(JSON.parse(out)) : reject(new Error(`job failed: ${JSON.stringify(job)}`))));
  });
}

async function pool<T>(tasks: (() => Promise<T>)[], n: number): Promise<T[]> {
  const out: T[] = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < tasks.length) { const k = i++; out[k] = await tasks[k](); } }));
  return out;
}

const tasks: (() => Promise<void>)[] = [];
const dirs: string[] = [];
for (const pkg of PACKAGES.filter((p) => wanted.length === 0 || wanted.includes(p.name))) {
  const dir = copyFor(pkg); dirs.push(dir);
  results[pkg.name] = { about: pkg.about, games: GAMES, lines: {} };
  const jobs: [string, object][] = [];
  for (const turns of [30, 50]) {
    if (!pkg.ladderOnly) for (const players of [4, 2]) for (const driver of ['N', 'P4']) jobs.push([`profiles ${turns} ${players} ${driver}`, { kind: 'profiles', turns, players, driver, games: GAMES }]);
    // The robot ladder: on today's rules only.
    if (pkg.ladderOnly) for (const [a, b] of [['E', 'N'], ['E', 'N2'], ['N2', 'H4']]) jobs.push([`versus ${turns} ${a} ${b}`, { kind: 'versus', turns, a, b, games: GAMES }]);
    if (pkg.name === 'today') for (const [a, b] of [['E', 'N'], ['N', 'H'], ['N', 'P4'], ['H', 'H4'], ['N', 'N2'], ['E', 'N2'], ['N2', 'H4'], ['E', 'H4'], ['N2', 'H3'], ['E', 'H3']]) {
      jobs.push([`versus ${turns} ${a} ${b}`, { kind: 'versus', turns, a, b, games: GAMES }]);
    }
  }
  for (const [key, job] of jobs) tasks.push(async () => {
    results[pkg.name].lines[key] = await run(dir, job);
    process.stdout.write('.');
  });
}
await pool(tasks, Math.max(1, cpus().length));
for (const d of dirs) rmSync(d, { recursive: true, force: true });
writeFileSync(resultsFile, JSON.stringify(results, null, 1));
console.log('\nsaved', Object.keys(results).join(', '));
