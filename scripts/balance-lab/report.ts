// Balance lab only: writes docs/balance-lab.md from scripts/balance-lab/results.json.
// Run: node scripts/balance-lab/report.ts
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const R = JSON.parse(readFileSync(new URL('scripts/balance-lab/results.json', root), 'utf8'));
const PROFILES = ['backpacker', 'business', 'luxury', 'nomad'];
const NAMES: Record<string, string> = {
  E: 'easy', N: 'normal', H: 'hard', N2: 'normal, plans 2 moves', H3: 'hard, plans 3 moves', H4: 'hard, plans 4 moves', P4: 'normal answers, plans 4 moves',
};
const pct = (n: number, d: number) => Math.round((100 * n) / d);
// Fair targets (owner, 2026-10-11): 20–30% with 4 players, 40–60% with 2.
const fair = (w: number, players: number) => (players === 4 ? w >= 20 && w <= 30 : w >= 40 && w <= 60);

let md = `# Balance lab — numbers before any change (owner, 2026-10-11)

Made by \`node scripts/balance-lab/run.ts\` and \`node scripts/balance-lab/report.ts\`. **The game is not changed:**
every rule package is played on a temporary copy of \`src/\`. Robots play every seat; profiles are given at random.
Owner's targets: each profile wins **20–30%** of 4-player games and **40–60%** of 2-player games (✅ inside, ❌ outside),
at 30 and 50 turns, with today's normal robots (N) and with planning robots (P4: normal answers, plans 4 moves).
With ${R.today?.games ?? 400} games per line a win share is accurate to about ±2–4 points.
`;

const ladder = R.today?.lines ?? {};
md += `\n## Robots: head to head (2 players, today's rules)\n\n| Game | A | B | A wins | B wins | Average score A – B |\n|---|---|---|---|---|---|\n`;
for (const [key, v] of Object.entries<any>(ladder)) {
  if (!key.startsWith('versus')) continue;
  const g = v.job.games;
  md += `| ${v.job.turns} turns | ${NAMES[v.job.a]} | ${NAMES[v.job.b]} | ${pct(v.winsA, g)}% | ${pct(v.winsB, g)}% | ${v.scoreA.toFixed(1)} – ${v.scoreB.toFixed(1)} |\n`;
}

for (const [name, pkg] of Object.entries<any>(R)) {
  const versus = Object.entries<any>(pkg.lines).filter(([k]) => k.startsWith('versus'));
  if (name !== 'today' && versus.length) {
    md += `\n## Robot variant "${name}": ${pkg.about}\n\n| Game | A | B | A wins | B wins |\n|---|---|---|---|---|\n`;
    for (const [, v] of versus) md += `| ${v.job.turns} turns | ${NAMES[v.job.a]} | ${NAMES[v.job.b]} | ${pct(v.winsA, v.job.games)}% | ${pct(v.winsB, v.job.games)}% |\n`;
  }
  if (!Object.keys(pkg.lines).some((k) => k.startsWith('profiles'))) continue;
  md += `\n## Package "${name}": ${pkg.about}\n\n| Game | Robots | ${PROFILES.map((p) => p[0].toUpperCase() + p.slice(1)).join(' | ')} | Fair? |\n|---|---|---|---|---|---|---|\n`;
  let ok = 0, all = 0;
  for (const [key, v] of Object.entries<any>(pkg.lines)) {
    if (!key.startsWith('profiles')) continue;
    const cells = PROFILES.map((p) => {
      const s = v.profiles[p]; if (!s) return '—';
      const w = pct(s.wins, s.games); const f = fair(w, v.job.players);
      all++; if (f) ok++;
      return `${w}% ${f ? '✅' : '❌'} (${(s.score / s.games).toFixed(1)})`;
    });
    md += `| ${v.job.turns} turns, ${v.job.players} players | ${v.job.driver === 'N' ? 'normal' : 'planning'} | ${cells.join(' | ')} | |\n`;
  }
  md = md.replace(/\| \|\n(?![\s\S]*\| \|\n)/, `| ${ok}/${all} |\n`);
  md += `\n**${ok} of ${all}** profile results inside the target. (Wins %, with the average final score in brackets.)\n`;
}
writeFileSync(new URL('docs/balance-lab.md', root), md);
console.log(md.replace(/^# [\s\S]*?(?=\n## )/, '').replace(/\(\d+\.\d\)/g, ''));
