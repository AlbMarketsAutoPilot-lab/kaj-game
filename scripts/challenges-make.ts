// Makes the travel-turn challenges (task 12) from open data: node scripts/challenges-make.ts
//
// Writes src/challenges/challenges.ts (the questions) and docs/challenges.md (the review page).
// Data: data/countries.json, a small extract of mledoze/countries (ODbL 1.0, see data/README.md).
// Flags: assets/flags/*.svg, from flag-icons by Panayiotis Lipiridis (MIT, see assets/flags/LICENSE).
//
// To refresh the extract and the flags from fresh downloads (kept outside the repo):
//   node scripts/challenges-make.ts --from <countries.json> --flags <flag-icons/flags/4x3>
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { map30 } from '../src/maps/map30.ts';
import { randomInt } from '../src/engine/rng.ts';
import type { Challenge, ChallengeType, Continent } from '../src/engine/types.ts';

interface Country {
  cca2: string;
  cca3: string;
  name: string;
  capital: string[];
  currencies: Record<string, string>; // code -> name
  borders: string[]; // cca3 codes, land borders
  area: number; // km²
}

// Map names that the dataset spells differently.
const ALIAS: Record<string, string> = {
  Turkey: 'Türkiye', 'Cabo Verde': 'Cape Verde', "Côte d'Ivoire": 'Ivory Coast', 'Republic of the Congo': 'Congo',
};
// Not independent, or disputed: never asked about (owner-approved).
const SKIP = new Set(['Greenland', 'Western Sahara', 'Palestine', 'Kosovo']);
// On two continents, or on a different continent on our map than in most atlases.
const SKIP_CONTINENT = new Set(['Russia', 'Turkey', 'Kazakhstan', 'Egypt', 'Georgia', 'Armenia', 'Azerbaijan', 'Papua New Guinea']);
// More than one capital in everyday use (the dataset lists one for Bolivia).
const SKIP_CAPITAL = new Set(['Bolivia']);
// Names that take "the" inside a question ("What is the capital of the Netherlands?").
const THE = new Set([
  'United Kingdom', 'United States', 'Netherlands', 'Philippines', 'United Arab Emirates', 'Bahamas', 'Gambia',
  'Central African Republic', 'Republic of the Congo', 'DR Congo', 'Maldives', 'Comoros', 'Seychelles',
]);
const the = (name: string) => (THE.has(name) ? `the ${name}` : name);
// Flags that look almost the same are never asked together.
const LOOK_ALIKE = [
  ['td', 'ro', 'ad', 'md'], ['id', 'mc', 'pl'], ['ie', 'ci', 'it', 'mx'], ['nl', 'lu', 'py', 'hr', 'ru', 'si', 'sk', 'rs'],
  ['au', 'nz'], ['sn', 'ml', 'gn', 'cm'], ['co', 'ec', 've'], ['sv', 'ni', 'hn', 'ar', 'gt'], ['qa', 'bh'],
  ['sy', 'iq', 'eg', 'ye', 'sd'], ['no', 'is', 'dk', 'fi', 'se'], ['kw', 'ae', 'jo'], ['tn', 'tr'], ['ne', 'in'],
  ['lv', 'at'], ['be', 'de'], ['bf', 'gh', 'et', 'bo', 'lt'], ['cg', 'ga'], ['hu', 'tj', 'bg', 'ir'], ['my', 'us', 'lr'],
];

// ---------- refresh the extract and the flags (only with --from / --flags) ----------

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const mapNames = [...new Set(map30.areas.flatMap((a) => a.countries ?? []))].filter((n) => !SKIP.has(n));

const from = arg('--from');
if (from) {
  const raw = JSON.parse(readFileSync(from, 'utf8'));
  const extract = mapNames.map((n) => {
    const c = raw.find((d: any) => d.name.common === (ALIAS[n] ?? n));
    if (!c) throw new Error(`Not in the dataset: ${n}`);
    if (!c.independent) throw new Error(`Not independent: ${n}`);
    return {
      cca2: c.cca2.toLowerCase(),
      cca3: c.cca3,
      name: n,
      capital: c.capital ?? [],
      currencies: Object.fromEntries(Object.entries(c.currencies ?? {}).map(([k, v]: [string, any]) => [k, v.name])),
      borders: c.borders ?? [],
      area: c.area,
    } satisfies Country;
  });
  mkdirSync('data', { recursive: true });
  writeFileSync('data/countries.json', JSON.stringify(extract, null, 1) + '\n');
  console.log(`data/countries.json: ${extract.length} countries`);
}
const flagDir = arg('--flags');
if (flagDir) {
  rmSync('assets/flags', { recursive: true, force: true });
  mkdirSync('assets/flags', { recursive: true });
  for (const c of JSON.parse(readFileSync('data/countries.json', 'utf8')) as Country[]) {
    copyFileSync(`${flagDir}/${c.cca2}.svg`, `assets/flags/${c.cca2}.svg`);
  }
}

// ---------- make the questions ----------

const countries: Country[] = JSON.parse(readFileSync('data/countries.json', 'utf8'));
const byCode = new Map(countries.map((c) => [c.cca3, c]));
// The continent on our map (the first area that lists the country).
const continentOf = new Map<string, Continent>();
for (const a of map30.areas) for (const n of a.countries ?? []) if (!continentOf.has(n)) continentOf.set(n, a.continent);
const CONTINENTS: Continent[] = ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'];

let seed = 20261012;
const pick = <T>(list: T[]): T => {
  if (list.length === 0) throw new Error('nothing to pick from');
  const [i, next] = randomInt(seed, list.length);
  seed = next;
  return list[i];
};
const sameContinent = (c: Country) => countries.filter((o) => o !== c && continentOf.get(o.name) === continentOf.get(c.name));

const out: Challenge[] = [];
const add = (type: ChallengeType, c: Country, question: string, right: string, wrong: string, flag?: string) => {
  const correct = pick([0, 1] as const);
  const options: [string, string] = correct === 0 ? [right, wrong] : [wrong, right];
  out.push({ id: `${type}-${c.cca3.toLowerCase()}`, type, question, options, correct, ...(flag ? { flag } : {}) });
};

// Which flag? Wrong answer: any other country whose flag doesn't look the same.
for (const c of countries) {
  const alike = new Set(LOOK_ALIKE.filter((g) => g.includes(c.cca2)).flat());
  add('flag', c, 'Which country has this flag?', c.name, pick(countries.filter((o) => o !== c && !alike.has(o.cca2))).name, c.cca2);
}
// Which is bigger? A country of the same continent, at least 1.5 times bigger or smaller.
for (const c of countries) {
  const other = pick(sameContinent(c).filter((o) => Math.max(o.area, c.area) >= 1.5 * Math.min(o.area, c.area)));
  const [big, small] = c.area > other.area ? [c, other] : [other, c];
  add('bigger', c, 'Which country is bigger?', big.name, small.name);
}
// Which capital? One capital only; never one that gives the answer away (Panama City).
const capitalOk = (c: Country) => c.capital.length === 1 && !SKIP_CAPITAL.has(c.name) && !c.capital[0].includes(c.name);
for (const c of countries.filter(capitalOk)) {
  add('capital', c, `What is the capital of ${the(c.name)}?`, c.capital[0], pick(sameContinent(c).filter(capitalOk)).capital[0]);
}
// Which continent? The continent on our map.
for (const c of countries.filter((c) => !SKIP_CONTINENT.has(c.name))) {
  const right = continentOf.get(c.name)!;
  add('continent', c, `Where is ${the(c.name)}?`, right, pick(CONTINENTS.filter((k) => k !== right)));
}
// Neighbours: a land neighbour, against a country of the same continent that isn't one.
for (const c of countries) {
  const near = c.borders.map((b) => byCode.get(b)).filter((o) => o !== undefined);
  if (near.length === 0) continue;
  const far = sameContinent(c).filter((o) => !c.borders.includes(o.cca3));
  add('neighbour', c, `Which country borders ${the(c.name)}?`, pick(near).name, pick(far).name);
}
// Which currency? One currency only; the wrong one is a different currency of the same continent
// (never two CFA francs).
const single = (c: Country) => Object.keys(c.currencies).length === 1;
for (const c of countries.filter(single)) {
  const [code, name] = Object.entries(c.currencies)[0];
  const others = sameContinent(c).filter(single).map((o) => Object.entries(o.currencies)[0])
    .filter(([k, n]) => k !== code && !(n.includes('CFA') && name.includes('CFA')));
  add('currency', c, `What money does ${the(c.name)} use?`, name, pick(others)[1]);
}

// ---------- write the file and the review page ----------

const TYPES: Record<ChallengeType, string> = {
  flag: 'Which flag?', bigger: 'Which is bigger?', capital: 'Which capital?',
  continent: 'Which continent?', neighbour: 'Neighbours', currency: 'Which currency?',
};
const json = (o: unknown) => JSON.stringify(o);
writeFileSync(
  'src/challenges/challenges.ts',
  [
    '// The travel-turn challenges (task 12). Generated by `node scripts/challenges-make.ts`: do not edit by hand.',
    '// Made from mledoze/countries (ODbL 1.0) and our map; flags from flag-icons (MIT).',
    "import type { Challenge } from '../engine/types.ts';",
    '',
    'export const CHALLENGES: Challenge[] = [',
    ...out.map((c) => `  ${json(c)},`),
    '];',
    '',
  ].join('\n'),
);

const lines = [
  '# Challenges (generated by `node scripts/challenges-make.ts`, do not edit by hand)',
  '',
  `${out.length} questions. Source: \`src/challenges/challenges.ts\`. ` +
    Object.entries(TYPES).map(([t, title]) => `${title} ${out.filter((c) => c.type === t).length}`).join(' · ') + '.',
  '',
  'On a travel turn (plane or ship) the player may play one challenge: right +1, wrong −1, 15 seconds',
  '(time out = wrong). Not offered with 0 points. The game picks a type, then a question, at random.',
  'The right answer is in **bold**; the order on screen is the order shown here.',
  '',
  'Data: country data from [mledoze/countries](https://github.com/mledoze/countries) (ODbL 1.0);',
  'continents from our map; flags from [flag-icons](https://github.com/lipis/flag-icons) (MIT).',
  '',
  'To report a problem, give the id (for example "capital-per: wrong").',
];
const show = (c: Challenge) => c.options.map((o, i) => (i === c.correct ? `**${o}**` : o)).join(' / ');
for (const [type, title] of Object.entries(TYPES)) {
  const list = out.filter((c) => c.type === type);
  lines.push('', `## ${title} (${list.length})`, '');
  if (type === 'flag') {
    lines.push('| Id | Flag | Answers |', '|---|---|---|');
    for (const c of list) lines.push(`| ${c.id} | <img src="../assets/flags/${c.flag}.svg" height="18"> | ${show(c)} |`);
  } else {
    lines.push('| Id | Question | Answers |', '|---|---|---|');
    for (const c of list) lines.push(`| ${c.id} | ${c.question} | ${show(c)} |`);
  }
}
writeFileSync('docs/challenges.md', lines.join('\n') + '\n');

const flagBytes = readdirSync('assets/flags').filter((f) => f.endsWith('.svg'))
  .reduce((n, f) => n + readFileSync(`assets/flags/${f}`).length, 0);
console.log(`src/challenges/challenges.ts and docs/challenges.md: ${out.length} questions; flags ${Math.round(flagBytes / 1024)} KB`);
if (!existsSync('assets/flags/LICENSE')) console.log('Note: assets/flags/LICENSE is missing');
