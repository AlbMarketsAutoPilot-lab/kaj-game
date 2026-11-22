// Balance lab, extended (step 2.7): reports for results of lab2.ts.
// node scripts/balance-lab/report2.ts <label>                 the full report of one result
// node scripts/balance-lab/report2.ts <label A> <label B>     before → after, line by line
//
// Every report starts with the robot check line (how often robots pay for trips), then every line of both maps:
// wins and average score per profile, fair or not (owner's targets: 20–30% of 4-player wins, 40–60% of 2-player
// wins), boredom, excitement, go home, blocked turns and failed visa tests. "Outside" = how many percentage points
// the unfair results lie outside the target, in total. At 1,600 games per line a win share is accurate to about
// ±1 point (4 players) and ±1.5 (2 players).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const RESULTS = join(tmpdir(), 'kaj-lab2');
// Step 2.11: Kris Ann reported in her own column and counted apart (her 8 results), the old 4 as before (32).
// Step 2.12: counted of the lines in the result: 8 lines (30 and 50 turns) of 40, 4 lines (100 turns) of 20.
const OLD = ['backpacker', 'business', 'luxury', 'nomad'];
const PROFILES = [...OLD, 'krisann'];
const load = (label: string) => JSON.parse(readFileSync(join(RESULTS, `${label}.json`), 'utf8'));
const lineName = (k: string) => { const [t, p, d] = k.split(' '); return `${t.replace('t', '')} turns, ${p.replace('p', '')} players, ${d === 'N2' ? 'normal' : 'planning'}`; };
const pct = (a: number, b: number) => (b ? (100 * a) / b : 0);

function cell(r: any, k: string, p: string): { text: string; fair: boolean; outside: number } {
  const v = r[k].profiles[p];
  if (!v) return { text: '—', fair: false, outside: 0 };
  const w = pct(v.wins, v.games);
  const [lo, hi] = k.includes('4p') ? [20, 30] : [40, 60];
  const fair = w >= lo && w <= hi;
  return { text: `${w.toFixed(0)}% ${fair ? '✅' : '❌'} (${(v.score / v.games).toFixed(1)})`, fair, outside: fair ? 0 : w < lo ? lo - w : w - hi };
}

function summary(label: string, r: any): string {
  const keys = Object.keys(r).sort();
  let fair = 0, outside = 0, ka = 0, kaOut = 0;
  for (const k of keys) for (const p of OLD) { const c = cell(r, k, p); if (c.fair) fair++; outside += c.outside; }
  const hasKa = keys.some((k) => r[k].profiles.krisann);
  for (const k of keys) { const c = cell(r, k, 'krisann'); if (c.fair) ka++; kaOut += c.outside; }
  const range = (f: (k: string) => number, d = 0) => { const v = keys.map(f); return `${Math.min(...v).toFixed(d)}–${Math.max(...v).toFixed(d)}`; };
  const e = (k: string) => r[k].extra;
  return [
    `**${label}: old profiles ${fair} of ${4 * keys.length} fair**, ${outside.toFixed(0)} points outside the target` + (hasKa ? `; **Kris Ann ${ka} of ${keys.length}**, ${kaOut.toFixed(0)} outside; total ${fair + ka} of ${5 * keys.length}.` : '.'),
    `Robot check: robots pay for ${range((k) => pct(e(k).paid, e(k).paid + e(k).quiz))}% of their trips.`,
    `Boredom ${range((k) => pct(r[k].feelSum.boredom, r[k].games))}%; lead changes ${range((k) => r[k].feelSum.leadChanges / r[k].games, 1)}; won by 3 or less ${range((k) => pct(r[k].feelSum.close, r[k].games))}%; draws ${range((k) => e(k).draws)} per line.`,
    `Go home ${range((k) => e(k).goHome)} per line (after 3 turns without money: ${range((k) => e(k).homeBlocked)}); blocked turns ${range((k) => e(k).blocked)}; longest blocked streak ${Math.max(...keys.map((k) => e(k).maxStreak))}; failed visa tests ${range((k) => pct(e(k).visaFailed, e(k).visaTests), 1)}%.`,
  ].join('\n');
}

const [a, b] = process.argv.slice(2);
if (!a) throw new Error('usage: node scripts/balance-lab/report2.ts <label> [<label after>]');
const A = load(a);
if (!b) {
  console.log(summary(a, A) + '\n');
  console.log('| Line | Backpacker | Business | Luxury | Nomad | Kris Ann | Boredom | Excitement |\n|---|---|---|---|---|---|---|---|');
  for (const k of Object.keys(A).sort()) {
    const f = A[k].feelSum, n = A[k].games;
    console.log(`| ${lineName(k)} | ${PROFILES.map((p) => cell(A, k, p).text).join(' | ')} | ${pct(f.boredom, n).toFixed(0)}% | ${(f.leadChanges / n).toFixed(1)} lead changes, ${pct(f.close, n).toFixed(0)}% won by ≤3 |`);
  }
} else {
  const B = load(b);
  console.log(summary(a, A) + '\n\n' + summary(b, B) + '\n');
  console.log(`| Line | Backpacker | Business | Luxury | Nomad | Kris Ann |\n|---|---|---|---|---|---|`);
  for (const k of Object.keys(A).sort()) console.log(`| ${lineName(k)} | ${PROFILES.map((p) => `${cell(A, k, p).text} → ${cell(B, k, p).text}`).join(' | ')} |`);
}
