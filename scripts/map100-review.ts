// Makes docs/map100.md, the 100-turn map plan of version 2.0, step 2.12 (part J1, owner-approved 2026-11-22), and
// (part J2) the game's map src/maps/map100.ts from the same lines, in the same order.
// Run: node scripts/map100-review.ts
// 126 areas; big countries and wonders
// as on the 50-turn map; routes in the style of step 2.4. It checks that every country of the 50-turn map is used once,
// builds the walking links from the open country data (data/countries.json) and the 50-turn links of the big-country
// parts, checks that no 50-turn link is lost, and runs the stuck-state checker and the visa-trap counts on the plan.
import { readFileSync, writeFileSync } from 'node:fs';
import { map50 } from '../src/maps/map50.ts';
import { stuckProblems, travelGroups, visaUnits } from '../src/engine/stuck-check.ts';
import { continentRewardFor } from '../src/engine/constants.ts';
import type { Area, GameMap, Route } from '../src/engine/types.ts';

type O = { w?: true; cardsFrom?: string; surprise?: number };
// [50-turn parents, id, name, countries (empty = big-country part: same as on the 50-turn map), options]
const S: [string[], string, string, string[], O?][] = [
 // Europe
 [['spain'],'spain','Spain',['Spain','Andorra']],[['portugal'],'portugal','Portugal',['Portugal']],
 [['france'],'france','France',['France','Monaco']],
 [['uk-ireland'],'uk','United Kingdom',['United Kingdom']],[['uk-ireland'],'ireland','Ireland',['Ireland']],
 [['germany'],'germany','Germany',['Germany']],
 [['benelux'],'netherlands','Netherlands',['Netherlands']],[['benelux'],'belgium-luxembourg','Belgium & Luxembourg',['Belgium','Luxembourg']],
 [['alps'],'switzerland','Switzerland & Liechtenstein',['Switzerland','Liechtenstein']],[['alps'],'austria','Austria',['Austria']],
 [['italy'],'italy','Italy',['Italy','San Marino','Vatican City','Malta'],{w:true}],
 [['scandinavia'],'norway','Norway',['Norway']],[['scandinavia'],'sweden','Sweden',['Sweden']],[['scandinavia'],'denmark','Denmark & Greenland',['Denmark','Greenland']],
 [['finland'],'finland','Finland',['Finland']],[['iceland'],'iceland','Iceland',['Iceland']],[['poland'],'poland','Poland',['Poland']],
 [['czechia-slovakia-hungary'],'czechia','Czechia',['Czechia']],[['czechia-slovakia-hungary'],'slovakia','Slovakia',['Slovakia']],
 [['czechia-slovakia-hungary'],'hungary','Hungary',['Hungary']],
 [['baltics'],'baltics','Baltics',['Estonia','Latvia','Lithuania']],
 [['belarus-ukraine-moldova'],'belarus','Belarus',['Belarus']],[['belarus-ukraine-moldova'],'ukraine','Ukraine',['Ukraine']],
 [['belarus-ukraine-moldova'],'moldova','Moldova',['Moldova']],
 [['western-balkans'],'slovenia-croatia','Slovenia & Croatia',['Slovenia','Croatia']],
 [['western-balkans'],'bosnia-montenegro','Bosnia & Montenegro',['Bosnia and Herzegovina','Montenegro']],
 [['western-balkans'],'serbia-kosovo-macedonia','Serbia, Kosovo & North Macedonia',['Serbia','Kosovo','North Macedonia']],
 [['western-balkans'],'albania','Albania',['Albania']],
 [['romania-bulgaria'],'romania','Romania',['Romania']],[['romania-bulgaria'],'bulgaria','Bulgaria',['Bulgaria']],
 [['greece'],'greece','Greece',['Greece'],{w:true}],
 [['russia-west'],'russia-west','',[]],
 // Asia
 [['russia-east'],'russia-east','',[]],[['russia-far-east'],'russia-far-east','',[]],
 [['turkey'],'turkey','Turkey',['Turkey']],[['caucasus'],'caucasus','Caucasus',['Georgia','Armenia','Azerbaijan']],
 [['levant'],'levant','Levant',['Israel','Palestine','Lebanon','Syria']],[['jordan'],'jordan','Jordan',['Jordan'],{w:true}],[['iraq'],'iraq','Iraq',['Iraq']],
 [['saudi-yemen'],'saudi-arabia','Saudi Arabia',['Saudi Arabia']],[['saudi-yemen'],'yemen','Yemen',['Yemen']],
 [['gulf-states'],'gulf-states','Gulf States',['United Arab Emirates','Qatar','Bahrain','Kuwait']],[['gulf-states'],'oman','Oman',['Oman']],
 [['iran'],'iran','Iran',['Iran']],[['kazakhstan'],'kazakhstan','Kazakhstan',['Kazakhstan']],
 [['central-asia'],'uzbekistan','Uzbekistan',['Uzbekistan']],[['central-asia'],'turkmenistan','Turkmenistan',['Turkmenistan']],
 [['central-asia'],'kyrgyzstan-tajikistan','Kyrgyzstan & Tajikistan',['Kyrgyzstan','Tajikistan']],
 [['pakistan-afghanistan'],'pakistan','Pakistan',['Pakistan']],[['pakistan-afghanistan'],'afghanistan','Afghanistan',['Afghanistan']],
 [['india'],'india','India',['India'],{w:true}],[['india'],'sri-lanka','Sri Lanka & Maldives',['Sri Lanka','Maldives']],
 [['nepal-bhutan-bangladesh'],'nepal-bhutan-bangladesh','Nepal, Bhutan & Bangladesh',['Nepal','Bhutan','Bangladesh']],
 [['china-west'],'china-west','',[]],[['china-east'],'china-east','',[]],
 [['mongolia'],'mongolia','Mongolia',['Mongolia']],[['korea'],'korea','Korea',['South Korea','North Korea']],[['japan'],'japan','Japan',['Japan'],{w:true}],
 [['myanmar'],'myanmar','Myanmar',['Myanmar']],[['thailand'],'thailand','Thailand',['Thailand']],
 [['cambodia-laos-vietnam'],'cambodia','Cambodia',['Cambodia'],{w:true}],[['cambodia-laos-vietnam'],'laos','Laos',['Laos']],
 [['cambodia-laos-vietnam'],'vietnam','Vietnam',['Vietnam']],
 [['malaysia-singapore-brunei'],'malaysia-singapore-brunei','Malaysia, Singapore & Brunei',['Malaysia','Singapore','Brunei']],
 [['maritime-asia'],'indonesia','Indonesia & Timor-Leste',['Indonesia','Timor-Leste']],
 [['maritime-asia'],'papua-new-guinea','Papua New Guinea',['Papua New Guinea']],[['maritime-asia'],'philippines','Philippines',['Philippines']],
 // Africa (owner's 6 merges)
 [['morocco'],'morocco','Morocco & Western Sahara',['Morocco','Western Sahara']],[['algeria'],'algeria','Algeria',['Algeria']],
 [['tunisia-libya'],'tunisia','Tunisia',['Tunisia']],[['tunisia-libya'],'libya','Libya',['Libya']],[['egypt'],'egypt','Egypt',['Egypt'],{w:true}],
 [['sahel-west'],'mauritania','Mauritania',['Mauritania']],[['sahel-west'],'mali-burkina','Mali & Burkina Faso',['Mali','Burkina Faso']],
 [['sahel-east'],'sahel-east','Niger & Chad',['Niger','Chad']],
 [['west-coast'],'senegal','Senegal, Gambia & Cabo Verde',['Senegal','Gambia','Cabo Verde']],
 [['west-coast'],'guinea-sierra-leone-liberia','Guinea, Sierra Leone & Liberia',['Guinea','Guinea-Bissau','Sierra Leone','Liberia']],
 [['gulf-of-guinea'],'cote-divoire',"Côte d'Ivoire",["Côte d'Ivoire"]],[['gulf-of-guinea'],'ghana-togo-benin','Ghana, Togo & Benin',['Ghana','Togo','Benin']],
 [['nigeria'],'nigeria','Nigeria',['Nigeria']],
 [['sudan'],'sudan','Sudan',['Sudan']],[['sudan'],'south-sudan','South Sudan',['South Sudan']],
 [['horn-of-africa'],'ethiopia','Ethiopia',['Ethiopia']],[['horn-of-africa'],'eritrea-djibouti','Eritrea & Djibouti',['Eritrea','Djibouti']],
 [['horn-of-africa'],'somalia','Somalia',['Somalia']],
 [['central-africa'],'cameroon','Cameroon',['Cameroon']],[['central-africa'],'central-african-republic','Central African Republic',['Central African Republic']],
 [['central-africa'],'gabon','Gabon, Equatorial Guinea & São Tomé',['Gabon','Equatorial Guinea','São Tomé and Príncipe']],
 [['central-africa'],'congo','Republic of the Congo',['Republic of the Congo']],[['dr-congo'],'dr-congo','DR Congo',['DR Congo']],
 [['kenya-uganda'],'kenya','Kenya',['Kenya']],[['kenya-uganda','tanzania'],'uganda-rwanda-burundi','Uganda, Rwanda & Burundi',['Uganda','Rwanda','Burundi']],
 [['tanzania'],'tanzania','Tanzania',['Tanzania'],{w:true}],
 [['madagascar'],'madagascar','Madagascar & Islands',['Madagascar','Seychelles','Comoros','Mauritius'],{surprise:3}],
 [['angola-namibia'],'angola','Angola',['Angola']],[['angola-namibia'],'namibia','Namibia',['Namibia']],
 [['zambezi'],'zambia-malawi-zimbabwe','Zambia, Malawi & Zimbabwe',['Zambia','Malawi','Zimbabwe']],[['zambezi'],'mozambique','Mozambique',['Mozambique']],
 [['south-africa'],'south-africa','South Africa',['South Africa','Lesotho','Eswatini']],[['south-africa'],'botswana','Botswana',['Botswana']],
 // North America
 [['canada-west'],'canada-west','',[]],[['canada-central'],'canada-central','',[]],[['canada-east'],'canada-east','',[]],
 [['usa-west'],'usa-west','',[]],[['alaska'],'alaska','',[]],[['usa-east'],'usa-east','',[]],
 [['mexico'],'mexico','Mexico',['Mexico'],{w:true}],
 [['central-america'],'guatemala-belize','Guatemala & Belize',['Guatemala','Belize']],
 [['central-america'],'honduras-el-salvador','Honduras & El Salvador',['Honduras','El Salvador']],
 [['central-america'],'nicaragua','Nicaragua',['Nicaragua']],[['central-america'],'costa-rica-panama','Costa Rica & Panama',['Costa Rica','Panama']],
 [['central-america'],'caribbean','Caribbean',['Cuba','Jamaica','Haiti','Dominican Republic','Bahamas']],
 // South America
 [['colombia'],'colombia','Colombia',['Colombia']],[['venezuela-guianas'],'venezuela-guianas','Venezuela & Guianas',['Venezuela','Guyana','Suriname']],
 [['ecuador'],'ecuador','Ecuador',['Ecuador']],[['peru'],'peru','Peru',['Peru'],{w:true,cardsFrom:'peru-bolivia'}],[['bolivia'],'bolivia','Bolivia',['Bolivia']],
 [['chile'],'chile','Chile',['Chile']],
 [['brazil-north'],'brazil-north','',[]],[['brazil-south'],'brazil-south','',[]],
 [['argentina'],'argentina','Argentina',['Argentina']],
 [['uruguay-paraguay'],'uruguay','Uruguay',['Uruguay']],[['uruguay-paraguay'],'paraguay','Paraguay',['Paraguay']],
 // Oceania
 [['australia-west'],'australia-west','',[]],[['australia-east'],'australia-east','',[]],
 [['new-zealand'],'new-zealand','New Zealand',['New Zealand'],{w:true}],
];
const EXTRA: [string, string][] = [['france', 'uk'], ['denmark', 'sweden'], ['morocco', 'mauritania']];
const LEFT_OUT = new Set(['morocco|spain', 'india|sri-lanka']);
// Routes, 2.4 style: two-way, 1 or 2 destinations per airport and per port.
const ROUTES: [Route['kind'], string, string][] = [
 // Today's 18 of the 50-turn map, on the matching part
 ['port','new-zealand','chile'],['port','argentina','south-africa'],['port','south-africa','australia-west'],['port','alaska','japan'],
 ['port','canada-east','iceland'],['port','portugal','caribbean'],['port','costa-rica-panama','japan'],['port','brazil-north','nigeria'],
 ['airport','alaska','usa-west'],['airport','iceland','uk'],['airport','algeria','spain'],['airport','japan','korea'],
 ['airport','australia-east','new-zealand'],['airport','australia-east','indonesia'],['airport','india','indonesia'],['airport','india','gulf-states'],
 ['airport','madagascar','gulf-states'],['airport','south-africa','madagascar'],
 // New: islands and dead ends
 ['port','ireland','france'],['port','sri-lanka','india'],['port','sri-lanka','malaysia-singapore-brunei'],
 ['port','philippines','malaysia-singapore-brunei'],['airport','philippines','china-east'],
 ['port','papua-new-guinea','australia-east'],['port','caribbean','usa-east'],
];
const TRAIN_BUS_CAR: Route[] = [
 { kind: 'station', a: 'france', b: 'russia-west' }, { kind: 'station', a: 'france', b: 'turkey' },
 { kind: 'bus', a: 'mongolia', b: 'russia-east', oneWay: true }, { kind: 'bus', a: 'mongolia', b: 'china-west', oneWay: true },
 { kind: 'car', a: 'mexico', b: 'canada-west', oneWay: true }, { kind: 'car', a: 'mexico', b: 'usa-east', oneWay: true },
];



// ---------- checks ----------
const a50 = new Map(map50.areas.map((a) => [a.id, a]));
const ids = S.map((s) => s[1]);
if (new Set(ids).size !== ids.length) throw new Error('duplicate id');
const entry = (id: string) => S.find((s) => s[1] === id)!;
const children = (p: string) => S.filter((s) => s[0].includes(p)).map((s) => s[1]);
const key = (a: string, b: string) => [a, b].sort().join('|');
const isBig = (id: string) => !!a50.get(id)?.bigCountry && entry(id)[3].length === 0;
// every country of the 50-turn map is used once (a big-country part: the same part)
const used = S.flatMap((s) => (s[3].length ? s[3] : [`big:${s[1]}`]));
const want = map50.areas.flatMap((a) => (a.bigCountry ? [`big:${a.id}`] : a.countries ?? []));
if (JSON.stringify([...used].sort()) !== JSON.stringify([...want].sort())) throw new Error('the countries differ from the 50-turn map');
const data: { name: string; cca3: string; borders: string[] }[] = JSON.parse(readFileSync(new URL('../data/countries.json', import.meta.url), 'utf8'));
const byCode = new Map(data.map((c) => [c.cca3, c.name]));
const areaOf = new Map<string, string>();
for (const s of S) for (const c of s[3]) areaOf.set(c, s[1]);
const links = new Map<string, string>();
for (const c of data) for (const b of c.borders) {
  const x = areaOf.get(c.name), y = areaOf.get(byCode.get(b) ?? '');
  if (x && y && x !== y && !LEFT_OUT.has(key(x, y))) links.set(key(x, y), 'border');
}
const WHY: Record<string, string> = { 'france|uk': 'Channel Tunnel (as on the 30- and 50-turn maps)', 'denmark|sweden': 'Øresund Bridge (Denmark and Sweden have no land border)', 'mauritania|morocco': 'land border with Western Sahara (not in the country data)' };
for (const [a, b] of EXTRA) links.set(key(a, b), WHY[key(a, b)]);
// a big-country part keeps each 50-turn link, to the areas whose countries border that big country
const bordersOf = (country: string) => new Set(data.find((x) => x.name === country)!.borders.map((b) => byCode.get(b)));
const lost: string[] = [];
for (const a of map50.areas) for (const n of a.neighbours) {
  if (!isBig(a.id) || (a.id > n && isBig(n))) continue;
  if (isBig(n)) { links.set(key(a.id, n), 'border'); continue; }
  const near = bordersOf(a.countries![0]);
  const kids = children(n).filter((k) => entry(k)[3].some((c) => near.has(c)));
  if (!kids.length) lost.push(`${a.id}-${n}`);
  for (const k of kids) links.set(key(a.id, k), 'border');
}
const parents = (id: string) => entry(id)[0];
const kept = new Set([...links.keys()].flatMap((k) => { const [a, b] = k.split('|'); return parents(a).flatMap((p) => parents(b).map((q) => key(p, q))); }));
for (const a of map50.areas) for (const n of a.neighbours) if (!kept.has(key(a.id, n))) lost.push(`${a.id}-${n}`);
if (lost.length) throw new Error('50-turn links lost: ' + lost.join(' '));
const deg = new Map<string, number>();
for (const [k, a, b] of ROUTES) for (const x of [a, b]) { if (!ids.includes(x)) throw new Error('route to an unknown area ' + x); deg.set(`${k} ${x}`, (deg.get(`${k} ${x}`) ?? 0) + 1); }
const over = [...deg].filter(([, v]) => v > 2);
if (over.length) throw new Error('more than 2 destinations: ' + over.map(([k]) => k).join(', '));

const areas: Area[] = S.map(([p, id, name, countries, o]) => {
  const base = a50.get(p[0])!;
  const big = countries.length === 0;
  return {
    id, name: big ? base.name : name, continent: base.continent,
    neighbours: [...links.keys()].flatMap((k) => { const [a, b] = k.split('|'); return a === id ? [b] : b === id ? [a] : []; }),
    countries: big ? base.countries : countries,
    ...(big ? { bigCountry: base.bigCountry } : {}), ...(o?.w ? { wonder: true } : {}),
    ...(o?.cardsFrom ? { cardsFrom: o.cardsFrom } : {}), ...(o?.surprise ? { surprise: o.surprise } : {}),
  } as Area;
});
const map: GameMap = { id: 'map100-proposal', rounds: 100, areas, routes: [...ROUTES.map(([kind, a, b]) => ({ kind, a, b })), ...TRAIN_BUS_CAR] };
const problems = stuckProblems(map);
// visa traps, as the tests count them on the 30- and 50-turn maps (tests/helpers.ts)
const units = visaUnits(map);
let pairs = 0, pairTraps = 0;
for (let i = 0; i < units.length; i++) for (let j = i + 1; j < units.length; j++) {
  pairs++; if (travelGroups(map, new Set([...units[i], ...units[j]])).length > 1) pairTraps++;
}
const START = ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'];
const contOf = new Map(areas.map((a) => [a.id, a.continent]));
const homes = units.map((u) => new Set(u.map((id) => contOf.get(id)!).filter((c) => START.includes(c))));
const apart = (a: number, b: number, c: number) => [...homes[a]].some((x) => [...homes[b]].some((y) => y !== x && [...homes[c]].some((z) => z !== x && z !== y)));
let triples = 0, tripleTraps = 0;
for (let a = 0; a < units.length; a++) for (let b = a + 1; b < units.length; b++) for (let c = b + 1; c < units.length; c++) {
  if (!apart(a, b, c)) continue;
  triples++; if (travelGroups(map, new Set([...units[a], ...units[b], ...units[c]])).length > 1) tripleTraps++;
}

// ---------- the review page ----------
const conts = ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'] as const;
const sites = (k: string) => new Set(ROUTES.filter((r) => r[0] === k).flatMap((r) => [r[1], r[2]]));
const ap = sites('airport'), pt = sites('port');
const name = (id: string) => areas.find((a) => a.id === id)!.name;
const same = S.filter((s) => s[0].length === 1 && children(s[0][0]).length === 1);
const fmt = (n: number) => n.toLocaleString('en-US');
const nf = 12 * (areas.length - same.length) - 12 * (map50.areas.length - same.length);
const icon = (k: string) => ({ airport: '✈️', port: '⛴️', station: '🚆', bus: '🚌', car: '🚗' })[k];
let md = `# 100-turn map — plan for version 2.0, step 2.12

Made by \`node scripts/map100-review.ts\`, which also makes the game's map \`src/maps/map100.ts\` (step 2.12, part J2; not in the
setup screen until part J5).
Status: **owner-approved (2026-11-22), J1 done.** The 100-turn game is part of this app (version 2.0), with the 5 profiles
and all 2.0 rules. It replaces the proposal of 2026-10-10 (138 areas, 8 profiles, a separate paid app, save version 12).

**Owner's decisions (J1):** 126 areas; big countries **as on the 50-turn map** (USA, Canada, Russia 3 parts; China,
Brazil, Australia 2), so their points stay as today; the **11 wonders of the 50-turn map**, no new ones; sensitive regions
kept grouped; routes in the style of step 2.4; the bus to Siberia gives all of Russia (as today); cards, card mix and
catch-up as measured (below); save version 22. Every 100-turn area lies inside one 50-turn area, except Uganda, Rwanda &
Burundi (inside Kenya & Uganda and Tanzania); an area that is the same place as on the 50-turn map keeps its id.

**Totals:** ${areas.length} areas (${same.length} the same as on the 50-turn map) · ${fmt(new Set(areas.flatMap((a) => a.bigCountry ? [a.bigCountry] : a.countries ?? [])).size)} real countries · ${areas.filter((a) => a.wonder).length} wonders (🏛️) ·
${ap.size} airports · ${pt.size} ports · ${ROUTES.length} connections · ${links.size} walking links · train, bus and car as on the 50-turn map.

**Checks run by the script:** every country of the 50-turn map is used once; every 50-turn walking link is kept; no airport
or port has more than 2 destinations; stuck-state checker (every area reachable, no single citizenship traps anyone,
without the train and bus): **${problems.length ? 'fails: ' + problems.join('; ') : 'passes'}**. Two citizenships at once trap someone in
**${fmt(pairTraps)} of ${fmt(pairs)} pairs**; 3 start citizenships at once in **${fmt(tripleTraps)} of ${fmt(triples)} start sets** (the known limit, as on the
30- and 50-turn maps: only while a player has fewer than 2 points, and "go home" is the way out).

`;
for (const c of conts) {
  const list = S.filter((s) => a50.get(s[0][0])!.continent === c);
  md += `## ${c} (${list.length})\n\n| Area | Countries | Inside 50-turn area | ✈️ | ⛴️ |\n|---|---|---|---|---|\n`;
  for (const s of list) {
    const a = areas.find((x) => x.id === s[1])!;
    md += `| ${a.wonder ? '🏛️ ' : ''}${a.name} | ${a.bigCountry ? `${a.bigCountry} (part)` : a.countries!.join(', ')} | ${s[0].map((p) => a50.get(p)!.name).join(' + ')} | ${ap.has(a.id) ? '✈️' : ''} | ${pt.has(a.id) ? '⛴️' : ''} |\n`;
  }
  md += '\n';
}
md += `## Big countries and wonders

As on the 50-turn map (owner): ${[...new Set(areas.filter((a) => a.bigCountry).map((a) => a.bigCountry!))].map((b) => `${b} ${areas.filter((a) => a.bigCountry === b).length}`).join(', ')} parts; the points stay as today
(\`bigCountryPoints\`; Kris Ann +3 more). Wonders (11, as on the 50-turn map): ${areas.filter((a) => a.wonder).map((a) => a.name).join(', ')}.
Madagascar & Islands keeps its secret +3.

## Connections (${ROUTES.length})

The 18 routes of the 50-turn map on the matching part (Central America's go from the Caribbean and Costa Rica & Panama,
the Malay Islands' from Indonesia), plus 7 new ones for islands and dead ends. All two-way; 1 or 2 destinations each.

| | From | To |
|---|---|---|
${ROUTES.map(([k, a, b]) => `| ${icon(k)} | ${name(a)} | ${name(b)} |`).join('\n')}

Train, bus and car (as on the 50-turn map): ${TRAIN_BUS_CAR.map((r) => `${icon(r.kind)} ${name(r.a)} ${r.oneWay ? '→' : '↔'} ${name(r.b)}`).join(' · ')}.

## Walking links that are not plain land borders

${[...links].filter(([, v]) => v !== 'border').map(([k, v]) => `- ${k.split('|').map(name).join(' ↔ ')}: ${v}`).join('\n')}
- Left out: Spain ↔ Morocco (owner, M2); India ↔ Sri Lanka (an island: by ship).

Islands with no walk (plane or ship only): ${areas.filter((a) => !a.neighbours.length).map((a) => a.name).join(', ')}.

## Facts (12 per area)

${same.length} areas are the same place as on the 50-turn map and keep their 12 facts. The other ${areas.length - same.length} areas share the facts of their
${map50.areas.length - same.length} 50-turn areas, sorted by country, and new facts fill each to 12: at most **${nf} new facts**; with the sort (it saved
about 10% in M3) **about ${Math.round((nf * 0.9) / 10) * 10}** for the owner to check (about ${Math.ceil((nf * 0.9) / 120)} days at 120 a day).

## Whole continents (areas ÷ 3, at least 2; the rule of every map)

${conts.map((c) => `${c} ${areas.filter((a) => a.continent === c).length} areas +${continentRewardFor(areas.filter((a) => a.continent === c).length)}`).join(' · ')}.

## Cards and balance (owner's final decisions, 2026-11-22)

Measured with the extended lab at 3,200 games per line, then checked on 3,200 and 6,400 new games; details in
\`docs/balance-lab.md\`, step 2.12.

- **100 turns (version F3-2):** an event card every **5th** land turn; its own card mix; **catch-up ×3** (the leader draws bad
  cards 4 times as often, the last player good cards 4 times as often). Fair **16 of 20** (new games: 16 and 15 of 20);
  boredom 25.1%, lead changes 10.5, won by 3 or less 50%.
- **30 and 50 turns (version K1-3):** **catch-up ×1** (the leader draws bad cards twice as often, the last player good cards
  twice as often) and a new card mix. Fair **32 of 40** on new games, as today's game; lead changes 4.6 → 5.4, won by 3 or
  less 32% → 42%; boredom the same (26.2%).
- Exact card mixes: \`docs/card-mix-2.12.json\`. Kris Ann's cards use their 50-turn points.
`;
writeFileSync(new URL('../docs/map100.md', import.meta.url), md);

// ---------- the game's map (step 2.12, part J2): src/maps/map100.ts ----------
// The same areas, neighbours and routes in the same order as above (the order changes the robot games).
const q = (x: unknown) => JSON.stringify(x);
const areaLine = (a: Area, i: number) => {
  const { id, name, continent, neighbours, countries, bigCountry, wonder, cardsFrom, surprise } = a as Area;
  return `  { id: ${q(id)}, name: ${q(name)}, continent: ${q(continent)}, inside: ${q(S[i][0])}, neighbours: ${q(neighbours)}, countries: ${q(countries)}`
    + `${bigCountry ? `, bigCountry: ${q(bigCountry)}` : ''}${wonder ? ', wonder: true' : ''}${cardsFrom ? `, cardsFrom: ${q(cardsFrom)}` : ''}${surprise ? `, surprise: ${surprise}` : ''} },`;
};
const routeLine = (r: Route) => `  { kind: ${q(r.kind)}, a: ${q(r.a)}, b: ${q(r.b)}${r.oneWay ? ', oneWay: true' : ''} },`;
const ts = `// Made by \`node scripts/map100-review.ts\` from the owner-approved plan (docs/map100.md, step 2.12). Do not edit by hand.
// The 100-turn map (step 2.12, part J2): ${areas.length} areas, ${areas.filter((a) => a.wonder).length} wonders, ${ap.size} airports, ${pt.size} ports, ${ROUTES.length} connections, the train, bus and car.
// Area order, neighbour order and route order are the plan's: they change the robot games, so keep them.
// \`inside\`: the 50-turn area(s) the area lies inside. Facts (step 2.12 part J4): an area that is the same place as on the
// 50-turn map keeps all its facts; any other area takes the facts sorted to it by country (src/facts/sort100.ts) from
// each 50-turn area in \`inside\` order, then its new facts (src/facts/new100.ts). The same for the test-only geography
// facts (2 per area). J4 session 1 of 2: an area not written yet (fewer than 12 facts or 2 test facts) still borrows
// all the facts of its 50-turn area(s), as in J2 (test only; the 100-turn game is not in the setup screen until J5).
import type { Area, GameMap, Route } from '../engine/types.ts';
import type { Fact } from '../facts/types.ts';
import { FACTS_100_NEW, GEO_EXAM_100_NEW } from '../facts/new100.ts';
import { EXAM_SORT_100, SORT_100 } from '../facts/sort100.ts';
import { map50 } from './map50.ts';

interface AreaInfo extends Area { inside: string[] }

const AREAS: AreaInfo[] = [
${areas.map(areaLine).join('\n')}
];

const ROUTES: Route[] = [
${map.routes!.map(routeLine).join('\n')}
];

type Sort = Readonly<Record<string, readonly string[]>>;

function sortFacts(from: Record<string, Fact[]> | undefined, sort: Sort, added: Record<string, Fact[]>, need: number): Record<string, Fact[]> {
  return Object.fromEntries(AREAS.map((a) => {
    const kept = a.inside.flatMap((p) => (from?.[p] ?? []).filter((_, i) => !sort[p] || sort[p][i].split('+').includes(a.id)));
    const facts = [...kept, ...(added[a.id] ?? [])];
    return [a.id, facts.length >= need ? facts : a.inside.flatMap((p) => from?.[p] ?? [])];
  }));
}

function build(): GameMap {
  const list: Area[] = AREAS.map(({ inside, ...a }) => a);
  return {
    id: 'map100', rounds: 100, areas: list, routes: ROUTES,
    facts: sortFacts(map50.facts, SORT_100, FACTS_100_NEW, 12),
    examFacts: sortFacts(map50.examFacts, EXAM_SORT_100, GEO_EXAM_100_NEW, 2),
  };
}

export const map100: GameMap = build();
`;
writeFileSync(new URL('../src/maps/map100.ts', import.meta.url), ts);
console.log(`${areas.length} areas, ${areas.filter((a) => a.wonder).length} wonders, ${ap.size} airports, ${pt.size} ports, ${ROUTES.length} connections, ${links.size} walking links, stuck problems: ${problems.length}, pair traps ${pairTraps}/${pairs}, start-set traps ${tripleTraps}/${triples}, new facts about ${Math.round((nf * 0.9) / 10) * 10}`);
