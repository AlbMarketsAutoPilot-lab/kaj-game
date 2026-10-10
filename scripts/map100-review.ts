// Makes docs/map100.md, the 100-turn map proposal for the owner to review (planning task, like M1).
// Run: node scripts/map100-review.ts
// Planning only: no engine or screen code uses this yet. It checks that every 50-turn area is split
// with the same countries, builds the walking links from the open country data (data/countries.json),
// compares them with the 50-turn links, and runs the stuck-state checker on the proposal.
import { readFileSync, writeFileSync } from 'node:fs';
import { map50 } from '../src/maps/map50.ts';
import { stuckProblems } from '../src/engine/stuck-check.ts';
import type { Area, GameMap, Route } from '../src/engine/types.ts';

type Opt = { w?: true; big?: string; parts?: string };
// [50-turn area id, 100-turn id, name, countries, options]
const S: [string, string, string, string[], Opt?][] = [
 // Europe
 ['spain','spain','Spain',['Spain','Andorra']],['portugal','portugal','Portugal',['Portugal']],
 ['france','france','France',['France','Monaco'],{w:true}],
 ['uk-ireland','uk','United Kingdom',['United Kingdom']],['uk-ireland','ireland','Ireland',['Ireland']],
 ['germany','germany','Germany',['Germany']],
 ['benelux','netherlands','Netherlands',['Netherlands']],['benelux','belgium-luxembourg','Belgium & Luxembourg',['Belgium','Luxembourg']],
 ['alps','switzerland','Switzerland & Liechtenstein',['Switzerland','Liechtenstein']],['alps','austria','Austria',['Austria']],
 ['italy','italy','Italy',['Italy','San Marino','Vatican City','Malta'],{w:true}],
 ['scandinavia','norway','Norway',['Norway']],['scandinavia','sweden','Sweden',['Sweden']],['scandinavia','denmark','Denmark & Greenland',['Denmark','Greenland']],
 ['finland','finland','Finland',['Finland']],['iceland','iceland','Iceland',['Iceland']],['poland','poland','Poland',['Poland']],
 ['czechia-slovakia-hungary','czechia','Czechia',['Czechia']],['czechia-slovakia-hungary','slovakia','Slovakia',['Slovakia']],
 ['czechia-slovakia-hungary','hungary','Hungary',['Hungary']],
 ['baltics','baltics','Baltics',['Estonia','Latvia','Lithuania']],
 ['belarus-ukraine-moldova','belarus','Belarus',['Belarus']],['belarus-ukraine-moldova','ukraine','Ukraine',['Ukraine']],
 ['belarus-ukraine-moldova','moldova','Moldova',['Moldova']],
 ['western-balkans','slovenia-croatia','Slovenia & Croatia',['Slovenia','Croatia']],
 ['western-balkans','bosnia-montenegro','Bosnia & Montenegro',['Bosnia and Herzegovina','Montenegro']],
 ['western-balkans','serbia-kosovo-macedonia','Serbia, Kosovo & North Macedonia',['Serbia','Kosovo','North Macedonia']],
 ['western-balkans','albania','Albania',['Albania']],
 ['romania-bulgaria','romania','Romania',['Romania']],['romania-bulgaria','bulgaria','Bulgaria',['Bulgaria']],
 ['greece','greece','Greece',['Greece'],{w:true}],
 ['russia-west','russia-west','Russia West',['Russia'],{big:'Russia',parts:'Central and North-West districts, Kaliningrad (Moscow, St Petersburg)'}],
 ['russia-west','russia-volga','Volga & South Russia',['Russia'],{big:'Russia',parts:'Volga, South and North Caucasus districts'}],
 // Asia
 ['russia-east','russia-urals','Urals & West Siberia',['Russia'],{big:'Russia',parts:'KGN SVE TYU KHM YAN CHE AL ALT KEM NVS OMS TOM'}],
 ['russia-east','russia-east','East Siberia',['Russia'],{big:'Russia',parts:'IRK KYA KK TY BU ZAB (Lake Baikal)'}],
 ['russia-far-east','russia-far-east','Russia Far East',['Russia'],{big:'Russia',parts:'as on the 50-turn map'}],
 ['turkey','turkey','Turkey',['Turkey'],{w:true}],['caucasus','caucasus','Caucasus',['Georgia','Armenia','Azerbaijan']],
 ['levant','levant','Levant',['Israel','Palestine','Lebanon','Syria']],['jordan','jordan','Jordan',['Jordan'],{w:true}],['iraq','iraq','Iraq',['Iraq']],
 ['saudi-yemen','saudi-arabia','Saudi Arabia',['Saudi Arabia']],['saudi-yemen','yemen','Yemen',['Yemen']],
 ['gulf-states','gulf-states','Gulf States',['United Arab Emirates','Qatar','Bahrain','Kuwait']],['gulf-states','oman','Oman',['Oman']],
 ['iran','iran','Iran',['Iran']],['kazakhstan','kazakhstan','Kazakhstan',['Kazakhstan']],
 ['central-asia','uzbekistan','Uzbekistan',['Uzbekistan']],['central-asia','turkmenistan','Turkmenistan',['Turkmenistan']],
 ['central-asia','kyrgyzstan-tajikistan','Kyrgyzstan & Tajikistan',['Kyrgyzstan','Tajikistan']],
 ['pakistan-afghanistan','pakistan','Pakistan',['Pakistan']],['pakistan-afghanistan','afghanistan','Afghanistan',['Afghanistan']],
 ['india','india','India',['India'],{w:true}],['india','sri-lanka','Sri Lanka & Maldives',['Sri Lanka','Maldives']],
 ['nepal-bhutan-bangladesh','nepal-bhutan-bangladesh','Nepal, Bhutan & Bangladesh',['Nepal','Bhutan','Bangladesh']],
 ['china-west','china-west','China West',['China'],{big:'China',parts:'as on the 50-turn map (Xinjiang, Tibet, Qinghai, Gansu)'}],
 ['china-east','china-north','China North',['China'],{big:'China',parts:'NM HL JL LN BJ TJ HE SX SN NX SD HA (Beijing)'}],
 ['china-east','china-south','China South',['China'],{big:'China',parts:'the rest, with Hong Kong and Macau (Shanghai)'}],
 ['mongolia','mongolia','Mongolia',['Mongolia']],['korea','korea','Korea',['South Korea','North Korea']],['japan','japan','Japan',['Japan'],{w:true}],
 ['myanmar','myanmar','Myanmar',['Myanmar']],['thailand','thailand','Thailand',['Thailand']],
 ['cambodia-laos-vietnam','cambodia','Cambodia',['Cambodia'],{w:true}],['cambodia-laos-vietnam','laos','Laos',['Laos']],
 ['cambodia-laos-vietnam','vietnam','Vietnam',['Vietnam']],
 ['malaysia-singapore-brunei','malaysia-singapore-brunei','Malaysia, Singapore & Brunei',['Malaysia','Singapore','Brunei']],
 ['maritime-asia','indonesia','Indonesia & Timor-Leste',['Indonesia','Timor-Leste']],
 ['maritime-asia','papua-new-guinea','Papua New Guinea',['Papua New Guinea']],['maritime-asia','philippines','Philippines',['Philippines']],
 // Africa
 ['morocco','morocco','Morocco & Western Sahara',['Morocco','Western Sahara'],{w:true}],['algeria','algeria','Algeria',['Algeria']],
 ['tunisia-libya','tunisia','Tunisia',['Tunisia']],['tunisia-libya','libya','Libya',['Libya']],['egypt','egypt','Egypt',['Egypt'],{w:true}],
 ['sahel-west','mauritania','Mauritania',['Mauritania']],['sahel-west','mali','Mali',['Mali']],['sahel-west','burkina-faso','Burkina Faso',['Burkina Faso']],
 ['sahel-east','niger','Niger',['Niger']],['sahel-east','chad','Chad',['Chad']],
 ['west-coast','senegal','Senegal, Gambia & Cabo Verde',['Senegal','Gambia','Cabo Verde']],
 ['west-coast','guinea','Guinea & Guinea-Bissau',['Guinea','Guinea-Bissau']],['west-coast','sierra-leone-liberia','Sierra Leone & Liberia',['Sierra Leone','Liberia']],
 ['gulf-of-guinea','cote-divoire',"Côte d'Ivoire",["Côte d'Ivoire"]],['gulf-of-guinea','ghana','Ghana',['Ghana']],
 ['gulf-of-guinea','togo-benin','Togo & Benin',['Togo','Benin']],['nigeria','nigeria','Nigeria',['Nigeria']],
 ['sudan','sudan','Sudan',['Sudan']],['sudan','south-sudan','South Sudan',['South Sudan']],
 ['horn-of-africa','ethiopia','Ethiopia',['Ethiopia']],['horn-of-africa','eritrea-djibouti','Eritrea & Djibouti',['Eritrea','Djibouti']],
 ['horn-of-africa','somalia','Somalia',['Somalia']],
 ['central-africa','cameroon','Cameroon',['Cameroon']],['central-africa','central-african-republic','Central African Republic',['Central African Republic']],
 ['central-africa','gabon','Gabon, Equatorial Guinea & São Tomé',['Gabon','Equatorial Guinea','São Tomé and Príncipe']],
 ['central-africa','congo','Republic of the Congo',['Republic of the Congo']],['dr-congo','dr-congo','DR Congo',['DR Congo']],
 ['kenya-uganda','kenya','Kenya',['Kenya']],['kenya-uganda','uganda','Uganda',['Uganda']],
 ['tanzania','tanzania','Tanzania',['Tanzania'],{w:true}],['tanzania','rwanda-burundi','Rwanda & Burundi',['Rwanda','Burundi']],
 ['madagascar','madagascar','Madagascar & Islands',['Madagascar','Seychelles','Comoros','Mauritius']],
 ['angola-namibia','angola','Angola',['Angola']],['angola-namibia','namibia','Namibia',['Namibia']],
 ['zambezi','zambia-malawi','Zambia & Malawi',['Zambia','Malawi']],['zambezi','mozambique','Mozambique',['Mozambique']],
 ['zambezi','zimbabwe','Zimbabwe',['Zimbabwe']],
 ['south-africa','south-africa','South Africa',['South Africa','Lesotho','Eswatini']],['south-africa','botswana','Botswana',['Botswana']],
 // North America
 ['canada-west','canada-west','Canada West',['Canada'],{big:'Canada',parts:'as on the 50-turn map (YT BC AB)'}],
 ['canada-central','canada-central','Canada Central',['Canada'],{big:'Canada',parts:'as on the 50-turn map (NT NU SK MB)'}],
 ['canada-east','ontario','Ontario',['Canada'],{big:'Canada',parts:'ON'}],
 ['canada-east','canada-east','Québec & Atlantic',['Canada'],{big:'Canada',parts:'QC NB NS PE NL'}],
 ['usa-west','usa-west','USA West',['United States'],{big:'United States',parts:'as on the 50-turn map'}],
 ['alaska','alaska','Alaska',['United States'],{big:'United States',parts:'as on the 50-turn map'}],
 ['usa-east','usa-east','USA East',['United States'],{big:'United States',parts:'as on the 50-turn map'}],
 ['mexico','mexico','Mexico',['Mexico'],{w:true}],
 ['central-america','guatemala-belize','Guatemala & Belize',['Guatemala','Belize']],
 ['central-america','honduras-el-salvador','Honduras & El Salvador',['Honduras','El Salvador']],
 ['central-america','nicaragua','Nicaragua',['Nicaragua']],['central-america','costa-rica-panama','Costa Rica & Panama',['Costa Rica','Panama']],
 ['central-america','caribbean','Caribbean',['Cuba','Jamaica','Haiti','Dominican Republic','Bahamas']],
 // South America
 ['colombia','colombia','Colombia',['Colombia']],['venezuela-guianas','venezuela-guianas','Venezuela & Guianas',['Venezuela','Guyana','Suriname']],
 ['ecuador','ecuador','Ecuador',['Ecuador']],['peru','peru','Peru',['Peru'],{w:true}],['bolivia','bolivia','Bolivia',['Bolivia']],
 ['chile','chile','Chile',['Chile'],{w:true}],
 ['brazil-north','brazil-north','Brazil North',['Brazil'],{big:'Brazil',parts:'AC AM RR RO PA AP TO (Amazon)'}],
 ['brazil-north','brazil-northeast','Brazil Northeast',['Brazil'],{big:'Brazil',parts:'MA PI CE RN PB PE AL SE BA'}],
 ['brazil-south','brazil-south','Brazil South',['Brazil'],{big:'Brazil',parts:'as on the 50-turn map'}],
 ['argentina','argentina','Argentina',['Argentina']],
 ['uruguay-paraguay','uruguay','Uruguay',['Uruguay']],['uruguay-paraguay','paraguay','Paraguay',['Paraguay']],
 // Oceania
 ['australia-west','australia-west','Western Australia',['Australia'],{big:'Australia',parts:'WA'}],
 ['australia-west','australia-centre','Australia Centre',['Australia'],{big:'Australia',parts:'NT SA'}],
 ['australia-east','australia-east','Australia East',['Australia'],{big:'Australia',parts:'as on the 50-turn map'}],
 ['new-zealand','new-zealand','New Zealand',['New Zealand'],{w:true}],
];

// Walking links of the big-country parts, written by hand (the country data has no state borders).
const BIG_LINKS: [string, string][] = [
 ['russia-west','finland'],['russia-west','norway'],['russia-west','baltics'],['russia-west','belarus'],['russia-west','ukraine'],
 ['russia-west','poland'],['russia-west','russia-volga'],['russia-west','russia-urals'],
 ['russia-volga','ukraine'],['russia-volga','kazakhstan'],['russia-volga','caucasus'],['russia-volga','russia-urals'],
 ['russia-urals','russia-east'],['russia-urals','kazakhstan'],['russia-urals','mongolia'],['russia-urals','china-west'],
 ['russia-east','russia-far-east'],['russia-east','mongolia'],['russia-east','china-north'],
 ['russia-far-east','china-north'],['russia-far-east','korea'],
 ['china-west','kazakhstan'],['china-west','kyrgyzstan-tajikistan'],['china-west','afghanistan'],['china-west','pakistan'],['china-west','india'],
 ['china-west','nepal-bhutan-bangladesh'],['china-west','mongolia'],['china-west','china-north'],['china-west','china-south'],
 ['china-north','china-south'],['china-north','mongolia'],['china-north','korea'],
 ['china-south','myanmar'],['china-south','laos'],['china-south','vietnam'],
 ['canada-west','canada-central'],['canada-west','alaska'],['canada-west','usa-west'],['canada-central','ontario'],
 ['canada-central','usa-west'],['canada-central','usa-east'],['ontario','canada-east'],['ontario','usa-east'],['canada-east','usa-east'],
 ['usa-west','usa-east'],['usa-west','mexico'],['usa-east','mexico'],
 ['brazil-north','venezuela-guianas'],['brazil-north','colombia'],['brazil-north','peru'],['brazil-north','bolivia'],
 ['brazil-north','brazil-northeast'],['brazil-north','brazil-south'],['brazil-northeast','brazil-south'],
 ['brazil-south','bolivia'],['brazil-south','paraguay'],['brazil-south','argentina'],['brazil-south','uruguay'],
 ['australia-west','australia-centre'],['australia-centre','australia-east'],
];
// Walking links that are not land borders, and land borders in the data that are left out.
const EXTRA_LINKS: [string, string, string][] = [
 ['france','uk','Channel Tunnel (as on the 30- and 50-turn maps)'],
 ['denmark','sweden','Øresund Bridge (new: Denmark and Sweden have no land border)'],
];
const LEFT_OUT: [string, string, string][] = [
 ['spain','morocco','no walk Spain ↔ Morocco (owner, M2)'],
 ['india','sri-lanka','the data lists a border, but Sri Lanka is an island: reached by ship'],
];

// [kind, from, to, why] — the 23 of the 50-turn map on the matching part, then the new ones.
const R: [Route['kind'], string, string, string][] = [
 ['port','portugal','uk',''],['port','uk','iceland',''],['port','iceland','canada-east',''],['port','japan','usa-west',''],
 ['port','australia-east','new-zealand',''],['port','usa-west','alaska',''],['port','madagascar','tanzania',''],
 ['port','madagascar','mozambique',''],['port','madagascar','south-africa',''],['port','senegal','brazil-northeast',''],
 ['airport','gulf-states','australia-west',''],['airport','australia-west','indonesia',''],['airport','indonesia','japan',''],
 ['airport','japan','new-zealand',''],['airport','new-zealand','chile',''],['airport','south-africa','chile',''],
 ['airport','uk','gulf-states',''],['airport','uk','usa-east',''],['airport','usa-east','brazil-south',''],
 ['airport','brazil-south','nigeria',''],['airport','india','gulf-states',''],['airport','india','indonesia',''],['airport','india','kenya',''],
 ['port','ireland','france','needed: Ireland walks only to the UK'],
 ['port','sri-lanka','india','needed: island'],['port','sri-lanka','malaysia-singapore-brunei','needed: island (2nd way)'],
 ['port','philippines','malaysia-singapore-brunei','needed: island'],['airport','philippines','japan','needed: island (2nd way)'],
 ['airport','papua-new-guinea','australia-east','needed: Papua New Guinea walks only to Indonesia'],
 ['port','caribbean','usa-east','needed: island'],['port','caribbean','colombia','needed: island (2nd way)'],
 ['airport','philippines','china-south','optional: Hong Kong, the first route in China'],
 ['airport','spain','mexico','optional: a 2nd flight Europe ↔ North America'],
 ['airport','usa-west','australia-east','optional: a flight across the Pacific'],
];
const TRAIN_BUS: [Route['kind'], string, string, string][] = [
 ['station','france','russia-west','both ways'],['station','france','turkey','both ways'],
 ['bus','mongolia','russia-east','one way, Russia\'s points at once'],['bus','mongolia','china-west','one way, China\'s points at once'],
];

// --- checks ---
const a50 = new Map(map50.areas.map((a) => [a.id, a]));
const ids = new Set(S.map((s) => s[1]));
if (ids.size !== S.length) throw new Error('duplicate id');
const name = new Map(S.map((s) => [s[1], s[2]]));
const parent = new Map(S.map((s) => [s[1], s[0]]));
const area = (id: string) => { if (!ids.has(id)) throw new Error('unknown area ' + id); return id; };
// every country of every 50-turn area is used exactly once (big countries: once per part)
for (const a of a50.values()) {
  const used = S.filter((s) => s[0] === a.id).flatMap((s) => s[3]);
  const want = a.bigCountry ? used.map(() => a.bigCountry!) : [...(a.countries ?? [])];
  if (!used.length || JSON.stringify([...used].sort()) !== JSON.stringify(want.sort())) throw new Error(a.id + ': ' + used);
}
// land borders between the countries of areas that hold no big country
const data: { cca3: string; name: string; borders: string[] }[] = JSON.parse(readFileSync(new URL('../data/countries.json', import.meta.url), 'utf8'));
const byCode = new Map(data.map((c) => [c.cca3, c.name]));
const areaOf = new Map<string, string>();
// Not in the country data; their land borders are covered by the links of their area, plus Western Sahara ↔ Mauritania.
const NO_DATA = ['Greenland', 'Kosovo', 'Palestine', 'Western Sahara'];
for (const s of S) if (!s[4]?.big) for (const c of s[3]) {
  if (!data.some((d) => d.name === c) && !NO_DATA.includes(c)) throw new Error('no data: ' + c);
  areaOf.set(c, s[1]);
}
const key = (a: string, b: string) => [a, b].sort().join('|');
const links = new Map<string, string>();
const leftOut = new Set(LEFT_OUT.map(([a, b]) => key(a, b)));
for (const c of data) for (const b of c.borders) {
  const x = areaOf.get(c.name), y = areaOf.get(byCode.get(b) ?? '');
  if (x && y && x !== y && !leftOut.has(key(x, y))) links.set(key(x, y), 'border');
}
links.set(key('morocco', 'mauritania'), 'border');
for (const [a, b] of BIG_LINKS) links.set(key(area(a), area(b)), 'border');
for (const [a, b, why] of EXTRA_LINKS) links.set(key(area(a), area(b)), why);
// each link lies on a 50-turn link (or inside one 50-turn area), and each 50-turn link is kept
const l50 = new Set(map50.areas.flatMap((a) => a.neighbours.map((n) => key(a.id, n))));
for (const k of links.keys()) {
  const [a, b] = k.split('|'); const pa = parent.get(a)!, pb = parent.get(b)!;
  if (pa !== pb && !l50.has(key(pa, pb))) throw new Error('not on a 50-turn link: ' + k);
}
const p100 = new Set([...links.keys()].map((k) => { const [a, b] = k.split('|'); return key(parent.get(a)!, parent.get(b)!); }));
for (const k of l50) if (!p100.has(k)) throw new Error('50-turn link lost: ' + k);
for (const [, a, b] of [...R, ...TRAIN_BUS]) { area(a); area(b); }
for (const id of ids) for (const k of ['airport', 'port']) {
  const d = R.filter((r) => r[0] === k && (r[1] === id || r[2] === id)).length;
  if (d > 3) throw new Error(`${id} has ${d} ${k} destinations`);
}
// the stuck-state checker on the proposal (like the engine's, without the train and the bus)
const map: GameMap = {
  id: 'map100-proposal', rounds: 100,
  areas: S.map(([p, id, n, countries, o]) => ({
    id, name: n, countries, continent: a50.get(p)!.continent, neighbours: [...links.keys()].flatMap((k) => {
      const [a, b] = k.split('|'); return a === id ? [b] : b === id ? [a] : [];
    }), ...(o?.w ? { wonder: true } : {}), ...(o?.big ? { bigCountry: o.big } : {}),
  } as Area)),
  routes: [...R, ...TRAIN_BUS].map(([kind, a, b]) => ({ kind, a, b, ...(kind === 'bus' ? { oneWay: true as const } : {}) })),
};
const problems = stuckProblems(map);

// --- the review page ---
const sites = (k: string) => new Set(R.filter((r) => r[0] === k).flatMap((r) => [r[1], r[2]]));
const ap = sites('airport'), pt = sites('port');
const wonders = S.filter((s) => s[4]?.w);
const conts = ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'] as const;
const cont = (s: (typeof S)[number]) => a50.get(s[0])!.continent;
const same = S.filter((s) => S.filter((t) => t[0] === s[0]).length === 1);
const splits = [...a50.keys()].filter((id) => S.filter((s) => s[0] === id).length > 1);
const newAreas = S.length - a50.size;
const bigs = [...new Set(S.flatMap((s) => (s[4]?.big ? [s[4].big] : [])))];
const partsOf = (c: string) => S.filter((s) => s[4]?.big === c);
const notBorder = [...links].filter(([, v]) => v !== 'border');
const kept = R.filter((r) => !r[3]), added = R.filter((r) => r[3]);
const icon = (k: string) => ({ airport: '✈️', port: '⛴️', station: '🚆', bus: '🚌' })[k];

let md = `# 100-turn map — proposal for review (planning)

Made by \`node scripts/map100-review.ts\` (planning only: no engine or screen code uses it yet).
Basis (rulebook v7 and the owner, 2026-10-10): 120–140 areas, mostly single countries, sensitive regions
kept grouped; the 30- and 50-turn games stay **frozen**; the 100-turn game reuses their rules and design.
**Every 100-turn area lies inside one 50-turn area** (and keeps its continent), so the 50-turn facts can be
sorted by country, as in M3. An area that is the same place as on the 50-turn map keeps its id.

**Totals:** ${S.length} areas (${same.length} same as on the 50-turn map, ${splits.length} 50-turn areas split, ${newAreas} more areas) ·
${wonders.length} wonders (🏛️) · ${ap.size} airports · ${pt.size} ports · ${R.length} connections (${kept.length} kept + ${added.length} new) ·
${links.size} walking links · train and bus as on the 50-turn map.

**Checks run by the script:** every country of the 50-turn map is used once; every walking link lies on a
50-turn link and no 50-turn link is lost; no airport or port has more than 3 destinations;
stuck-state checker (every area reachable, no single citizenship traps anyone, without the train and bus):
**${problems.length ? problems.length + ' problems: ' + problems.join('; ') : 'passes'}**.
`;
for (const c of conts) {
  const rows = S.filter((s) => cont(s) === c);
  md += `\n## ${c} (${rows.length})\n\n| Area | Countries | Inside 50-turn area | ✈️ | ⛴️ |\n|---|---|---|---|---|\n`;
  for (const s of rows) {
    const [p, id, n, cs, o] = s;
    md += `| ${o?.w ? '🏛️ ' : ''}${n} | ${o?.big ? o.big + ' (part)' : cs.join(', ')} | ${a50.get(p)!.name} | ${ap.has(id) ? '✈️' : ''} | ${pt.has(id) ? '⛴️' : ''} |\n`;
  }
}
md += `\n## Big countries (${bigs.length})\n\nEach part lies inside one 50-turn part. States and provinces as in \`scripts/map-shapes.ts\` (Natural Earth codes).\n\n| Country | Parts | Parts on the 50-turn map | The parts (states or provinces) |\n|---|---|---|---|\n`;
for (const c of bigs) {
  const ps = partsOf(c);
  md += `| ${c} | ${ps.length} | ${new Set(ps.map((s) => s[0])).size} | ${ps.map((s) => `**${s[2]}**: ${s[4]!.parts}`).join('; ')} |\n`;
}
md += `\nPoints when all parts are visited: today's rule gives **+5 for 3 or more parts** (\`bigCountryPoints\`), so Canada (4) and
Russia (5) would also give +5. Proposal: **parts + 2 from 4 parts** (Canada +6, Russia +7; 3 parts stay +5, 2 parts +3),
checked with 1,000 robot games in the engine session. The 30- and 50-turn maps have no country in 4 or more parts, so they don't change.

## Wonders (${wonders.length})

${conts.map((c) => `${c} ${wonders.filter((s) => cont(s) === c).length} (${wonders.filter((s) => cont(s) === c).map((s) => s[2]).join(', ')})`).join(' · ')}.
All 15 of the rulebook. New compared with the 50-turn map: France, Turkey, Morocco & Western Sahara, Chile
(4 new wonder drawings and names). Tanzania, India and Cambodia are now one country each.

## Connections (${R.length})

The ${kept.length} connections of the 50-turn map are kept on the matching part, plus ${added.length} new ones.

| | From | To | |\n|---|---|---|---|\n`;
for (const [k, a, b, why] of R) md += `| ${icon(k)} | ${name.get(a)} | ${name.get(b)} | ${why ? 'new: ' + why : ''} |\n`;
md += `\n## Train and bus (as on the 50-turn map, not counted in the ${R.length})\n\n| | From | To | |\n|---|---|---|---|\n`;
for (const [k, a, b, why] of TRAIN_BUS) md += `| ${icon(k)} | ${name.get(a)} | ${name.get(b)} | ${why} |\n`;
md += `\nThe train stays in Russia West (Moscow); the bus goes to East Siberia (Lake Baikal, the Trans-Mongolian line) or China West.

## Walking links that are not plain land borders

| From | To | Why |\n|---|---|---|\n`;
for (const [k, v] of notBorder) { const [a, b] = k.split('|'); md += `| ${name.get(a)} | ${name.get(b)} | ${v} |\n`; }
for (const [a, b, why] of LEFT_OUT) md += `| ${name.get(a)} | ${name.get(b)} | **left out:** ${why} |\n`;
md += `\nAll other ${links.size - notBorder.length} links are real land borders (country data for single countries; written by hand for the big-country parts, in the script).
Islands with no walk (plane or ship only): Iceland, Sri Lanka & Maldives, Philippines, Caribbean, Japan,
Madagascar & Islands, New Zealand. Ireland walks only to the UK, so it gets a port (to France).

## Facts (12 per area)

${same.length} areas are the same place as on the 50-turn map and keep their 12 facts. The ${splits.length} split areas become
${S.length - same.length} areas: their 50-turn facts are sorted by country, then new ones fill each area to 12.
At least ${12 * newAreas} new facts (12 × ${newAreas} more areas); in M3 the sort saved about 10% (330 written instead of 372),
so **about ${Math.round(12 * newAreas * 0.9 / 10) * 10} new facts** for the owner to check (about ${Math.round(12 * newAreas * 0.9 / 120)} days at 120 a day).

## Whole continents (areas ÷ 3, at least 2)

${conts.map((c) => { const n = S.filter((s) => cont(s) === c).length; return `${c} ${n} areas +${Math.max(2, Math.round(n / 3))}`; }).join(' · ')}.
`;
md += `
## Questions for the owner

1. **Size:** ${S.length} areas, about ${Math.round(12 * newAreas * 0.9 / 10) * 10} new facts to check. OK, or fewer areas? Each area fewer saves about 11 facts.
   Easy merges: Kyrgyzstan & Tajikistan into Uzbekistan (Central Asia), Zambia & Malawi + Zimbabwe (Zambezi), Togo & Benin + Ghana.
2. **Sensitive regions kept grouped:** Levant (Israel, Palestine, Lebanon, Syria), Korea, Caucasus, Morocco & Western Sahara,
   Serbia, Kosovo & North Macedonia, Venezuela & Guianas (Essequibo), Somalia (with Somaliland), Tibet inside China West;
   Taiwan and Cyprus not shown. Crimea is drawn as Natural Earth draws it, now next to its own Ukraine area. OK?
3. **Islands:** Sri Lanka & Maldives by ship only (no walk from India); one Caribbean area with a port; Madagascar & Islands
   stays one area (with its +3 SURPRISE); Denmark ↔ Sweden walk over the Øresund Bridge. OK?
4. **Big countries:** USA stays in 3 parts (rulebook), or 4 (USA East split into Central and East)?
   Points from 4 parts: parts + 2 (Canada +6, Russia +7), or +5 as today's rule gives?
5. **Bus:** with Russia in 5 parts, the bus to East Siberia gives Russia's points at once. Keep that?
6. **Connections:** the 8 needed new ones; and the 3 optional ones (Hong Kong ↔ Philippines, Spain ↔ Mexico,
   USA West ↔ Australia East): keep, or leave out? Train and bus unchanged (no new lines)?
7. **Saves:** 30- and 50-turn saves are frozen, so the 100-turn game would keep save version 12 and only add its map id
   (no version change). OK?
8. **Wonder names** for the 4 new drawings: Eiffel Tower (France), Hagia Sophia (Turkey), Chefchaouen or the Hassan II Mosque
   (Morocco), Easter Island (Chile)?
`;
writeFileSync(new URL('../docs/map100.md', import.meta.url), md);
console.log(`${S.length} areas, ${wonders.length} wonders, ${ap.size} airports, ${pt.size} ports, ${R.length} connections, ${links.size} walking links, stuck problems: ${problems.length}`);
if (problems.length) console.log(problems.join('\n'));
