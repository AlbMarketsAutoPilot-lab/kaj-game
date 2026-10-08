// Draws the 50 areas of the 30-turn map from real borders (task 14): node scripts/map-shapes.ts
//
// Merged areas (Scandinavia, Balkans, ...) are joined from their countries; the 6 big countries
// are split along their states or provinces (the lists below, checked by the owner).
// Writes src/maps/shapes30.ts (the shapes, as a compact topology) and docs/map-shapes.md (review page).
//
// Data: Natural Earth 1:10m admin-1 states and provinces (public domain), kept outside the repo:
//   curl -o <file> https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson
//   node scripts/map-shapes.ts --from <file>
import { readFileSync, writeFileSync } from 'node:fs';
// @ts-ignore: no types
import { topology } from 'topojson-server';
// @ts-ignore: no types
import { mergeArcs, neighbors } from 'topojson-client';
// @ts-ignore: no types
import { filter, filterWeight, presimplify, quantile, simplify, sphericalRingArea, sphericalTriangleArea } from 'topojson-simplify';
import { map30 } from '../src/maps/map30.ts';

const fromIndex = process.argv.indexOf('--from');
if (fromIndex < 0) throw new Error('Usage: node scripts/map-shapes.ts --from <ne_10m_admin_1_states_provinces.geojson>');
const source = JSON.parse(readFileSync(process.argv[fromIndex + 1], 'utf8'));

// Big countries: which states or provinces make each part (owner checks this list).
export const PARTS: Record<string, string[]> = {
  'usa-west': ['AK', 'HI', 'WA', 'OR', 'CA', 'NV', 'ID', 'MT', 'WY', 'UT', 'CO', 'AZ', 'NM'].map((c) => `US-${c}`),
  'canada-west': ['YT', 'NT', 'NU', 'BC', 'AB', 'SK', 'MB'].map((c) => `CA-${c}`),
  'china-west': ['XJ', 'XZ', 'QH', 'GS'].map((c) => `CN-${c}`),
  'russia-east': [
    'KGN', 'SVE', 'TYU', 'KHM', 'YAN', 'CHE', // Urals
    'AL', 'ALT', 'KEM', 'IRK', 'KYA', 'KK', 'NVS', 'OMS', 'TOM', 'TY', 'BU', 'ZAB', // Siberia
    'AMU', 'KAM', 'KHA', 'MAG', 'PRI', 'SA', 'SAK', 'YEV', 'CHU', // Far East
  ].map((c) => `RU-${c}`),
  'brazil-north': ['AC', 'AM', 'RR', 'RO', 'PA', 'AP', 'TO', 'MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'].map((c) => `BR-${c}`),
  'australia-west': ['WA', 'NT', 'SA'].map((c) => `AU-${c}`),
};
// The other part of each big country gets every remaining state or province.
const OTHER_PART: Record<string, string> = {
  'usa-west': 'usa-east', 'canada-west': 'canada-east', 'china-west': 'china-east',
  'russia-east': 'russia-west', 'brazil-north': 'brazil-south', 'australia-west': 'australia-east',
};

// Natural Earth names that differ from the map's country names.
const ALIASES: Record<string, string> = {
  'United States of America': 'United States', 'Czech Republic': 'Czechia', 'Republic of Serbia': 'Serbia',
  Macedonia: 'North Macedonia', 'Ivory Coast': "Côte d'Ivoire", 'Guinea Bissau': 'Guinea-Bissau',
  'Cape Verde': 'Cabo Verde', 'Democratic Republic of the Congo': 'DR Congo',
  'Sao Tome and Principe': 'São Tomé and Príncipe', 'United Republic of Tanzania': 'Tanzania',
  'S. Sudan': 'South Sudan', Swaziland: 'Eswatini', 'East Timor': 'Timor-Leste', 'The Bahamas': 'Bahamas',
  Vatican: 'Vatican City', 'West Bank': 'Palestine', 'Gaza Strip': 'Palestine',
};

// Land drawn as part of an area although the map data doesn't list it as a country
// (no grey areas; drawing only, no rule names them).
const EXTRA: Record<string, string> = {
  Somaliland: 'horn-of-africa', Aland: 'scandinavia', 'Faroe Islands': 'scandinavia',
  'Hong Kong S.A.R.': 'china-east', 'Macau S.A.R': 'china-east', 'Siachen Glacier': 'india',
  'Baykonur Cosmodrome': 'central-asia', 'US Naval Base Guantanamo Bay': 'central-america',
  'Puerto Rico': 'central-america', 'Trinidad and Tobago': 'central-america',
  Gibraltar: 'iberia', 'Isle of Man': 'uk-ireland', Jersey: 'uk-ireland', Guernsey: 'uk-ireland',
};
// Single states or provinces that belong elsewhere, or are left out (null).
const BY_CODE: Record<string, string | null> = {
  'FR-GF': 'northern-andes', // French Guiana, in "Venezuela & Guianas"
  'FR-GP': null, 'FR-MQ': null, 'FR-RE': null, 'FR-YT': null, // other French overseas islands
  'NO-X01~': null, 'AU-X03~': null, 'CN-X01~': null, // Bouvet, Macquarie, Paracel Islands
};

const areaOfCountry = new Map<string, string>();
for (const a of map30.areas) for (const c of a.countries ?? []) if (!a.bigCountry) areaOfCountry.set(c, a.id);
const bigCountryParts = new Map<string, string>(); // country -> first part id
for (const [part, other] of Object.entries(OTHER_PART)) {
  const country = map30.areas.find((a) => a.id === part)!.countries![0];
  bigCountryParts.set(country, part);
  void other;
}

function areaOf(p: { admin: string; iso_3166_2: string }): string | null {
  if (p.iso_3166_2 in BY_CODE) return BY_CODE[p.iso_3166_2];
  if (EXTRA[p.admin]) return EXTRA[p.admin];
  const country = ALIASES[p.admin] ?? p.admin;
  const part = bigCountryParts.get(country);
  if (part) return PARTS[part].includes(p.iso_3166_2) ? part : OTHER_PART[part];
  return areaOfCountry.get(country) ?? null;
}

// Keeps a shape in one piece across the date line: Russia East and the Chukchi peninsula,
// USA West and the Aleutian Islands.
function shift(coords: any, by: (lon: number) => number): any {
  return typeof coords[0] === 'number' ? [by(coords[0]), coords[1]] : coords.map((c: any) => shift(c, by));
}
const SHIFT: Record<string, (lon: number) => number> = {
  'russia-east': (lon) => (lon < -100 ? lon + 360 : lon),
  'usa-west': (lon) => (lon > 100 ? lon - 360 : lon),
};

const byArea = new Map<string, any[]>();
const leftOut = new Map<string, number>();
for (const f of source.features) {
  const id = areaOf(f.properties);
  if (!id) {
    if (f.properties.iso_3166_2 in BY_CODE) continue;
    leftOut.set(f.properties.admin, (leftOut.get(f.properties.admin) ?? 0) + 1);
    continue;
  }
  const geometry = SHIFT[id] ? { ...f.geometry, coordinates: shift(f.geometry.coordinates, SHIFT[id]) } : f.geometry;
  if (!byArea.has(id)) byArea.set(id, []);
  byArea.get(id)!.push({ type: 'Feature', properties: {}, geometry });
}
const missing = map30.areas.filter((a) => !byArea.has(a.id)).map((a) => a.id);
if (missing.length) throw new Error(`Areas with no land: ${missing.join(', ')}`);

// One topology for all the land, so neighbouring areas share exactly the same border lines.
const units: any[] = [];
const unitArea: string[] = [];
for (const [id, features] of byArea) for (const f of features) { units.push(f); unitArea.push(id); }
let topo = topology({ units: { type: 'FeatureCollection', features: units } }, 1e5);
const geoms = topo.objects.units.geometries;
const merged = map30.areas.map((a) => {
  const g = mergeArcs(topo, geoms.filter((_: unknown, i: number) => unitArea[i] === a.id));
  return { ...g, id: a.id };
});
topo.objects = { areas: { type: 'GeometryCollection', geometries: merged } };

// Simpler lines and no tiny islands, to keep the game file small.
const MIN_ISLAND = 1.5e-6; // steradians, about 60 km²
const KEEP = 0.01; // share of the points kept
topo = filter(topo, filterWeight(topo, MIN_ISLAND, sphericalRingArea));
topo = presimplify(topo, sphericalTriangleArea);
topo = simplify(topo, quantile(topo, KEEP));

// Drop arcs no longer used, and the points removed by the simplification.
const used = new Map<number, number>();
const remap = (i: number) => {
  const k = i < 0 ? ~i : i;
  if (!used.has(k)) used.set(k, used.size);
  return i < 0 ? ~used.get(k)! : used.get(k)!;
};
const walk = (a: any): any => (typeof a === 'number' ? remap(a) : a.map(walk));
for (const g of topo.objects.areas.geometries) if (g.arcs) g.arcs = walk(g.arcs);
const arcs: number[][][] = [];
// After simplify the points are longitude/latitude; store them in steps of 0.01° (about 1 km).
const STEP = 0.01;
for (const [old, now] of used) arcs[now] = topo.arcs[old];
const all = arcs.flat();
const x0 = all.reduce((m, p) => Math.min(m, p[0]), Infinity);
const y0 = all.reduce((m, p) => Math.min(m, p[1]), Infinity);
const q = (v: number, o: number) => Math.round((v - o) / STEP);
// Delta encoding (TopoJSON style), dropping points that land on the same step.
const encoded = arcs.map((arc) => {
  const out: number[][] = [];
  let px = 0;
  let py = 0;
  arc.forEach((p, i) => {
    const x = q(p[0], x0);
    const y = q(p[1], y0);
    if (i && i < arc.length - 1 && x === px && y === py) return;
    out.push(out.length ? [x - px, y - py] : [x, y]);
    px = x;
    py = y;
  });
  return out;
});

// Neighbours drawn on the map vs. walking links in the map data.
const nb: number[][] = neighbors(topo.objects.areas.geometries);
const ids = topo.objects.areas.geometries.map((g: any) => g.id as string);
const drawn = new Set<string>();
nb.forEach((list, i) => list.forEach((j) => drawn.add([ids[i], ids[j]].sort().join(' – '))));
const data = new Set<string>();
for (const a of map30.areas) for (const n of a.neighbours) data.add([a.id, n].sort().join(' – '));
const FIXED_LINKS = new Set(['france – uk-ireland']); // Channel Tunnel
const onlyDrawn = [...drawn].filter((p) => !data.has(p)).sort();
const onlyData = [...data].filter((p) => !drawn.has(p) && !FIXED_LINKS.has(p)).sort();

const shapes = {
  transform: { scale: [STEP, STEP], translate: [x0, y0] },
  arcs: encoded,
  areas: Object.fromEntries(topo.objects.areas.geometries.map((g: any) => [g.id, { type: g.type, arcs: g.arcs }])),
};
const json = JSON.stringify(shapes);
writeFileSync(new URL('../src/maps/shapes30.ts', import.meta.url), [
  '// Made by scripts/map-shapes.ts from Natural Earth (public domain). Do not edit by hand.',
  "import type { Shapes } from './shapes.ts';",
  '',
  `export const shapes30: Shapes = ${json};`,
  '',
].join('\n'));

const nameOf = (id: string) => map30.areas.find((a) => a.id === id)!.name;
const lines = [
  '# Map shapes (30-turn map)',
  '',
  'Made by `node scripts/map-shapes.ts --from <file>` from Natural Earth 1:10m states and provinces',
  '(public domain). Do not edit by hand: change the lists in the script and run it again.',
  '',
  '## Big countries: which states or provinces make each part',
  '',
  '| Part | States or provinces | Other part |',
  '|---|---|---|',
  ...Object.entries(PARTS).map(([part, codes]) => {
    const names = source.features.filter((f: any) => codes.includes(f.properties.iso_3166_2)).map((f: any) => f.properties.name);
    return `| ${nameOf(part)} | ${[...new Set(names)].sort().join(', ')} | ${nameOf(OTHER_PART[part])}: all the others |`;
  }),
  '',
  '## Drawn with an area, although not a country in the map data',
  '',
  ...Object.entries(EXTRA).map(([place, id]) => `- ${place} → ${nameOf(id)}`),
  '- French Guiana → Colombia, Venezuela & Guianas',
  '',
  '## Left out (not drawn)',
  '',
  `- ${[...leftOut.keys()].sort().join(', ')}`,
  '- French overseas islands (Guadeloupe, Martinique, Réunion, Mayotte), Bouvet Island, Macquarie Island, Paracel Islands',
  `- Islands smaller than about 60 km² (too small to see).`,
  '',
  '## Check: drawn borders vs. walking links',
  '',
  `- Touching on the map but no walking link: ${onlyDrawn.length ? onlyDrawn.join('; ') : 'none'}`,
  `- Walking link but not touching on the map: ${onlyData.length ? onlyData.join('; ') : 'none'} (the Channel Tunnel is a fixed link)`,
  '',
];
writeFileSync(new URL('../docs/map-shapes.md', import.meta.url), lines.join('\n'));
console.log(`shapes30.ts: ${Math.round(json.length / 1024)} KB, ${arcs.length} arcs, ${encoded.reduce((n, a) => n + a.length, 0)} points`);
console.log('only drawn:', onlyDrawn.join('; ') || 'none');
console.log('only data:', onlyData.join('; ') || 'none');
