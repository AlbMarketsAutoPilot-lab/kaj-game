import type { Area, GameMap, Route } from '../engine/types.ts';
import { map30 } from './map30.ts';

// The 50-turn map (task M2, from the owner-approved list in docs/map50.md): 84 areas, 11 wonders,
// 13 airports and 13 ports (21 connections), the train and the bus. Every area lies inside one
// area of the 30-turn map (`inside`), whose continent it keeps. An area that is the same place as
// on the 30-turn map keeps its id, so its place cards and wonder drawing still work.
// Each walking link is written once in BORDERS below (owner-approved in M2); neighbours are built from it.
// Facts come in task M3; until then the quiz and the exam use placeholder questions.

interface AreaInfo {
  id: string;
  name: string;
  // The 30-turn area this area lies inside.
  inside: string;
  countries: string[];
  wonder?: boolean;
  bigCountry?: string;
  cardsFrom?: string;
}

const AREAS: AreaInfo[] = [
  // Europe (19)
  { id: 'spain', name: 'Spain', inside: 'iberia', countries: ['Spain', 'Andorra'] },
  { id: 'portugal', name: 'Portugal', inside: 'iberia', countries: ['Portugal'] },
  { id: 'france', name: 'France', inside: 'france', countries: ['France', 'Monaco'] },
  { id: 'uk-ireland', name: 'UK & Ireland', inside: 'uk-ireland', countries: ['United Kingdom', 'Ireland'] },
  { id: 'germany', name: 'Germany', inside: 'central-europe', countries: ['Germany'] },
  { id: 'benelux', name: 'Benelux', inside: 'central-europe', countries: ['Belgium', 'Netherlands', 'Luxembourg'] },
  { id: 'alps', name: 'Alps', inside: 'central-europe', countries: ['Switzerland', 'Austria', 'Liechtenstein'] },
  { id: 'italy', name: 'Italy', inside: 'italy', countries: ['Italy', 'San Marino', 'Vatican City', 'Malta'], wonder: true },
  { id: 'scandinavia', name: 'Scandinavia', inside: 'scandinavia', countries: ['Norway', 'Sweden', 'Denmark', 'Greenland'] },
  { id: 'finland', name: 'Finland', inside: 'scandinavia', countries: ['Finland'] },
  { id: 'iceland', name: 'Iceland', inside: 'iceland', countries: ['Iceland'] },
  { id: 'poland', name: 'Poland', inside: 'poland-hungary', countries: ['Poland'] },
  { id: 'czechia-slovakia-hungary', name: 'Czechia, Slovakia & Hungary', inside: 'poland-hungary', countries: ['Czechia', 'Slovakia', 'Hungary'] },
  { id: 'baltics', name: 'Baltics', inside: 'eastern-europe', countries: ['Estonia', 'Latvia', 'Lithuania'] },
  { id: 'belarus-ukraine-moldova', name: 'Belarus, Ukraine & Moldova', inside: 'eastern-europe', countries: ['Belarus', 'Ukraine', 'Moldova'] },
  {
    id: 'western-balkans', name: 'Western Balkans', inside: 'balkans',
    countries: ['Slovenia', 'Croatia', 'Bosnia and Herzegovina', 'Serbia', 'Montenegro', 'Kosovo', 'North Macedonia', 'Albania'],
  },
  { id: 'romania-bulgaria', name: 'Romania & Bulgaria', inside: 'balkans', countries: ['Romania', 'Bulgaria'] },
  { id: 'greece', name: 'Greece', inside: 'greece', countries: ['Greece'], wonder: true },
  { id: 'russia-west', name: 'Russia West', inside: 'russia-west', countries: ['Russia'], bigCountry: 'Russia' },

  // Asia (25)
  { id: 'russia-east', name: 'Siberia', inside: 'russia-east', countries: ['Russia'], bigCountry: 'Russia' },
  { id: 'russia-far-east', name: 'Russia Far East', inside: 'russia-far-east', countries: ['Russia'], bigCountry: 'Russia' },
  { id: 'turkey', name: 'Turkey', inside: 'turkey-caucasus', countries: ['Turkey'] },
  { id: 'caucasus', name: 'Caucasus', inside: 'turkey-caucasus', countries: ['Georgia', 'Armenia', 'Azerbaijan'] },
  { id: 'levant', name: 'Levant', inside: 'middle-east', countries: ['Israel', 'Palestine', 'Lebanon', 'Syria'] },
  { id: 'jordan', name: 'Jordan', inside: 'middle-east', countries: ['Jordan'], wonder: true },
  { id: 'iraq', name: 'Iraq', inside: 'middle-east', countries: ['Iraq'] },
  { id: 'saudi-yemen', name: 'Saudi Arabia & Yemen', inside: 'arabia', countries: ['Saudi Arabia', 'Yemen'] },
  { id: 'gulf-states', name: 'Gulf States', inside: 'arabia', countries: ['United Arab Emirates', 'Qatar', 'Bahrain', 'Kuwait', 'Oman'] },
  { id: 'iran', name: 'Iran', inside: 'iran', countries: ['Iran'] },
  { id: 'kazakhstan', name: 'Kazakhstan', inside: 'central-asia', countries: ['Kazakhstan'] },
  { id: 'central-asia', name: 'Central Asia', inside: 'central-asia', countries: ['Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan'] },
  { id: 'pakistan-afghanistan', name: 'Pakistan & Afghanistan', inside: 'pakistan-afghanistan', countries: ['Pakistan', 'Afghanistan'] },
  { id: 'india', name: 'India', inside: 'india', countries: ['India', 'Sri Lanka', 'Maldives'], wonder: true },
  { id: 'nepal-bhutan-bangladesh', name: 'Nepal, Bhutan & Bangladesh', inside: 'india', countries: ['Nepal', 'Bhutan', 'Bangladesh'] },
  { id: 'china-west', name: 'China West', inside: 'china-west', countries: ['China'], bigCountry: 'China' },
  { id: 'china-east', name: 'China East', inside: 'china-east', countries: ['China'], bigCountry: 'China' },
  { id: 'mongolia', name: 'Mongolia', inside: 'mongolia', countries: ['Mongolia'] },
  { id: 'korea', name: 'Korea', inside: 'korea', countries: ['South Korea', 'North Korea'] },
  { id: 'japan', name: 'Japan', inside: 'japan', countries: ['Japan'], wonder: true },
  { id: 'myanmar', name: 'Myanmar', inside: 'southeast-asia', countries: ['Myanmar'] },
  { id: 'thailand', name: 'Thailand', inside: 'southeast-asia', countries: ['Thailand'] },
  { id: 'cambodia-laos-vietnam', name: 'Cambodia, Laos & Vietnam', inside: 'southeast-asia', countries: ['Cambodia', 'Laos', 'Vietnam'], wonder: true },
  { id: 'malaysia-singapore-brunei', name: 'Malaysia, Singapore & Brunei', inside: 'southeast-asia', countries: ['Malaysia', 'Singapore', 'Brunei'] },
  { id: 'maritime-asia', name: 'Malay Islands', inside: 'maritime-asia', countries: ['Indonesia', 'Timor-Leste', 'Papua New Guinea', 'Philippines'] },

  // Africa (19)
  { id: 'morocco', name: 'Morocco & Western Sahara', inside: 'north-africa', countries: ['Morocco', 'Western Sahara'] },
  { id: 'algeria', name: 'Algeria', inside: 'north-africa', countries: ['Algeria'] },
  { id: 'tunisia-libya', name: 'Tunisia & Libya', inside: 'north-africa', countries: ['Tunisia', 'Libya'] },
  { id: 'egypt', name: 'Egypt', inside: 'egypt', countries: ['Egypt'], wonder: true },
  { id: 'sahel-west', name: 'Sahel West', inside: 'sahel', countries: ['Mauritania', 'Mali', 'Burkina Faso'] },
  { id: 'sahel-east', name: 'Sahel East', inside: 'sahel', countries: ['Niger', 'Chad'] },
  {
    id: 'west-coast', name: 'West Coast', inside: 'west-africa',
    countries: ['Senegal', 'Gambia', 'Guinea-Bissau', 'Guinea', 'Sierra Leone', 'Liberia', 'Cabo Verde'],
  },
  { id: 'gulf-of-guinea', name: 'Gulf of Guinea', inside: 'west-africa', countries: ["Côte d'Ivoire", 'Ghana', 'Togo', 'Benin'] },
  { id: 'nigeria', name: 'Nigeria', inside: 'west-africa', countries: ['Nigeria'] },
  { id: 'sudan', name: 'Sudan & South Sudan', inside: 'horn-of-africa', countries: ['Sudan', 'South Sudan'] },
  { id: 'horn-of-africa', name: 'Horn of Africa', inside: 'horn-of-africa', countries: ['Ethiopia', 'Eritrea', 'Djibouti', 'Somalia'] },
  {
    id: 'central-africa', name: 'Central Africa', inside: 'central-africa',
    countries: ['Cameroon', 'Central African Republic', 'Equatorial Guinea', 'Gabon', 'Republic of the Congo', 'São Tomé and Príncipe'],
  },
  { id: 'dr-congo', name: 'DR Congo', inside: 'central-africa', countries: ['DR Congo'] },
  { id: 'kenya-uganda', name: 'Kenya & Uganda', inside: 'east-africa', countries: ['Kenya', 'Uganda'] },
  { id: 'tanzania', name: 'Tanzania, Rwanda & Burundi', inside: 'east-africa', countries: ['Tanzania', 'Rwanda', 'Burundi'], wonder: true },
  { id: 'madagascar', name: 'Madagascar & Islands', inside: 'east-africa', countries: ['Madagascar', 'Seychelles', 'Comoros', 'Mauritius'] },
  { id: 'angola-namibia', name: 'Angola & Namibia', inside: 'southern-africa', countries: ['Angola', 'Namibia'] },
  { id: 'zambezi', name: 'Zambezi', inside: 'southern-africa', countries: ['Zambia', 'Malawi', 'Mozambique', 'Zimbabwe'] },
  { id: 'south-africa', name: 'South Africa', inside: 'southern-africa', countries: ['South Africa', 'Botswana', 'Lesotho', 'Eswatini'] },

  // North America (8)
  { id: 'canada-west', name: 'Canada West', inside: 'canada-west', countries: ['Canada'], bigCountry: 'Canada' },
  { id: 'canada-central', name: 'Canada Central', inside: 'canada-central', countries: ['Canada'], bigCountry: 'Canada' },
  { id: 'canada-east', name: 'Canada East', inside: 'canada-east', countries: ['Canada'], bigCountry: 'Canada' },
  { id: 'usa-west', name: 'USA West', inside: 'usa-west', countries: ['United States'], bigCountry: 'United States' },
  { id: 'alaska', name: 'Alaska', inside: 'alaska', countries: ['United States'], bigCountry: 'United States' },
  { id: 'usa-east', name: 'USA East', inside: 'usa-east', countries: ['United States'], bigCountry: 'United States' },
  { id: 'mexico', name: 'Mexico', inside: 'mexico', countries: ['Mexico'], wonder: true },
  {
    id: 'central-america', name: 'Central America', inside: 'central-america',
    countries: ['Guatemala', 'Belize', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba', 'Jamaica', 'Haiti', 'Dominican Republic', 'Bahamas'],
  },

  // South America (10)
  { id: 'colombia', name: 'Colombia', inside: 'northern-andes', countries: ['Colombia'] },
  { id: 'venezuela-guianas', name: 'Venezuela & Guianas', inside: 'northern-andes', countries: ['Venezuela', 'Guyana', 'Suriname'] },
  { id: 'ecuador', name: 'Ecuador', inside: 'northern-andes', countries: ['Ecuador'] },
  // Owner (M2): the 30-turn "Thin mountain air" card of Peru & Bolivia comes in Peru only.
  { id: 'peru', name: 'Peru', inside: 'peru-bolivia', countries: ['Peru'], wonder: true, cardsFrom: 'peru-bolivia' },
  { id: 'bolivia', name: 'Bolivia', inside: 'peru-bolivia', countries: ['Bolivia'] },
  { id: 'chile', name: 'Chile', inside: 'chile', countries: ['Chile'] },
  { id: 'brazil-north', name: 'Brazil North', inside: 'brazil-north', countries: ['Brazil'], bigCountry: 'Brazil' },
  { id: 'brazil-south', name: 'Brazil South', inside: 'brazil-south', countries: ['Brazil'], bigCountry: 'Brazil' },
  { id: 'argentina', name: 'Argentina', inside: 'southern-cone', countries: ['Argentina'] },
  { id: 'uruguay-paraguay', name: 'Uruguay & Paraguay', inside: 'southern-cone', countries: ['Uruguay', 'Paraguay'] },

  // Oceania (3)
  { id: 'australia-west', name: 'Australia West', inside: 'australia-west', countries: ['Australia'], bigCountry: 'Australia' },
  { id: 'australia-east', name: 'Australia East', inside: 'australia-east', countries: ['Australia'], bigCountry: 'Australia' },
  { id: 'new-zealand', name: 'New Zealand', inside: 'new-zealand', countries: ['New Zealand'], wonder: true },
];

// Walking links (owner-approved, M2): real land borders, the Channel Tunnel (France ↔ UK & Ireland,
// as on the 30-turn map) and one sea crossing, Madagascar & Islands ↔ Zambezi, so a citizenship
// of Tanzania can't trap Madagascar. No Spain ↔ Morocco (owner).
const BORDERS: [string, string][] = [
  // Europe
  ['spain', 'portugal'], ['spain', 'france'], ['france', 'benelux'], ['france', 'germany'], ['france', 'alps'],
  ['france', 'italy'], ['france', 'uk-ireland'], ['benelux', 'germany'], ['germany', 'alps'], ['germany', 'scandinavia'],
  ['germany', 'poland'], ['germany', 'czechia-slovakia-hungary'], ['alps', 'italy'], ['alps', 'czechia-slovakia-hungary'],
  ['alps', 'western-balkans'], ['italy', 'western-balkans'], ['scandinavia', 'finland'], ['scandinavia', 'russia-west'],
  ['finland', 'russia-west'], ['poland', 'czechia-slovakia-hungary'], ['poland', 'baltics'], ['poland', 'belarus-ukraine-moldova'],
  ['poland', 'russia-west'], ['czechia-slovakia-hungary', 'belarus-ukraine-moldova'], ['czechia-slovakia-hungary', 'western-balkans'],
  ['czechia-slovakia-hungary', 'romania-bulgaria'], ['baltics', 'belarus-ukraine-moldova'], ['baltics', 'russia-west'],
  ['belarus-ukraine-moldova', 'romania-bulgaria'], ['belarus-ukraine-moldova', 'russia-west'], ['western-balkans', 'romania-bulgaria'],
  ['western-balkans', 'greece'], ['romania-bulgaria', 'greece'], ['romania-bulgaria', 'turkey'], ['greece', 'turkey'],
  // Russia and China
  ['russia-west', 'russia-east'], ['russia-west', 'caucasus'], ['russia-west', 'kazakhstan'], ['russia-east', 'russia-far-east'],
  ['russia-east', 'kazakhstan'], ['russia-east', 'mongolia'], ['russia-east', 'china-west'], ['russia-east', 'china-east'],
  ['russia-far-east', 'china-east'], ['russia-far-east', 'korea'], ['china-west', 'china-east'], ['china-west', 'kazakhstan'],
  ['china-west', 'central-asia'], ['china-west', 'pakistan-afghanistan'], ['china-west', 'india'], ['china-west', 'nepal-bhutan-bangladesh'],
  ['china-west', 'mongolia'], ['china-east', 'mongolia'], ['china-east', 'korea'], ['china-east', 'myanmar'],
  ['china-east', 'cambodia-laos-vietnam'],
  // Rest of Asia
  ['turkey', 'caucasus'], ['turkey', 'levant'], ['turkey', 'iraq'], ['turkey', 'iran'], ['caucasus', 'iran'],
  ['levant', 'jordan'], ['levant', 'iraq'], ['levant', 'egypt'], ['jordan', 'iraq'], ['jordan', 'saudi-yemen'],
  ['iraq', 'saudi-yemen'], ['iraq', 'gulf-states'], ['iraq', 'iran'], ['saudi-yemen', 'gulf-states'],
  ['iran', 'pakistan-afghanistan'], ['iran', 'central-asia'], ['kazakhstan', 'central-asia'], ['central-asia', 'pakistan-afghanistan'],
  ['pakistan-afghanistan', 'india'], ['india', 'nepal-bhutan-bangladesh'], ['india', 'myanmar'], ['nepal-bhutan-bangladesh', 'myanmar'],
  ['myanmar', 'thailand'], ['myanmar', 'cambodia-laos-vietnam'], ['thailand', 'cambodia-laos-vietnam'],
  ['thailand', 'malaysia-singapore-brunei'], ['malaysia-singapore-brunei', 'maritime-asia'],
  // Africa
  ['morocco', 'algeria'], ['morocco', 'sahel-west'], ['algeria', 'tunisia-libya'], ['algeria', 'sahel-west'], ['algeria', 'sahel-east'],
  ['tunisia-libya', 'egypt'], ['tunisia-libya', 'sahel-east'], ['tunisia-libya', 'sudan'], ['egypt', 'sudan'],
  ['sahel-west', 'sahel-east'], ['sahel-west', 'west-coast'], ['sahel-west', 'gulf-of-guinea'], ['sahel-east', 'gulf-of-guinea'],
  ['sahel-east', 'nigeria'], ['sahel-east', 'central-africa'], ['sahel-east', 'sudan'], ['west-coast', 'gulf-of-guinea'],
  ['gulf-of-guinea', 'nigeria'], ['nigeria', 'central-africa'], ['sudan', 'horn-of-africa'], ['sudan', 'central-africa'],
  ['sudan', 'dr-congo'], ['sudan', 'kenya-uganda'], ['horn-of-africa', 'kenya-uganda'], ['central-africa', 'dr-congo'],
  ['central-africa', 'angola-namibia'], ['dr-congo', 'kenya-uganda'], ['dr-congo', 'tanzania'], ['dr-congo', 'zambezi'],
  ['dr-congo', 'angola-namibia'], ['kenya-uganda', 'tanzania'], ['tanzania', 'zambezi'], ['angola-namibia', 'zambezi'],
  ['angola-namibia', 'south-africa'], ['zambezi', 'south-africa'], ['madagascar', 'zambezi'],
  // North America
  ['canada-west', 'canada-central'], ['canada-west', 'alaska'], ['canada-west', 'usa-west'], ['canada-central', 'canada-east'],
  ['canada-central', 'usa-west'], ['canada-central', 'usa-east'], ['canada-east', 'usa-east'], ['usa-west', 'usa-east'],
  ['usa-west', 'mexico'], ['usa-east', 'mexico'], ['mexico', 'central-america'], ['central-america', 'colombia'],
  // South America
  ['colombia', 'venezuela-guianas'], ['colombia', 'ecuador'], ['colombia', 'peru'], ['colombia', 'brazil-north'],
  ['venezuela-guianas', 'brazil-north'], ['ecuador', 'peru'], ['peru', 'bolivia'], ['peru', 'chile'], ['peru', 'brazil-north'],
  ['bolivia', 'chile'], ['bolivia', 'argentina'], ['bolivia', 'uruguay-paraguay'], ['bolivia', 'brazil-north'],
  ['bolivia', 'brazil-south'], ['chile', 'argentina'], ['argentina', 'uruguay-paraguay'], ['argentina', 'brazil-south'],
  ['uruguay-paraguay', 'brazil-south'], ['brazil-north', 'brazil-south'],
  // Oceania
  ['australia-west', 'australia-east'],
];

// Airports and ports (owner-approved, M1): the 13 connections of the 30-turn map on the matching
// part, plus 8 new ones. Owner (M2): the ship to UK & Ireland leaves from Portugal (not Spain), so
// a citizenship of Spain can't trap Portugal.
const ROUTES: Route[] = [
  { kind: 'port', a: 'portugal', b: 'uk-ireland' },
  { kind: 'port', a: 'uk-ireland', b: 'iceland' },
  { kind: 'port', a: 'iceland', b: 'canada-east' },
  { kind: 'port', a: 'japan', b: 'usa-west' },
  { kind: 'port', a: 'australia-east', b: 'new-zealand' },
  { kind: 'port', a: 'usa-west', b: 'alaska' },
  { kind: 'port', a: 'madagascar', b: 'tanzania' },
  { kind: 'port', a: 'west-coast', b: 'brazil-north' },
  { kind: 'airport', a: 'gulf-states', b: 'australia-west' },
  { kind: 'airport', a: 'australia-west', b: 'maritime-asia' },
  { kind: 'airport', a: 'maritime-asia', b: 'japan' },
  { kind: 'airport', a: 'japan', b: 'new-zealand' },
  { kind: 'airport', a: 'new-zealand', b: 'chile' },
  { kind: 'airport', a: 'south-africa', b: 'chile' },
  { kind: 'airport', a: 'uk-ireland', b: 'gulf-states' },
  { kind: 'airport', a: 'uk-ireland', b: 'usa-east' },
  { kind: 'airport', a: 'usa-east', b: 'brazil-south' },
  { kind: 'airport', a: 'brazil-south', b: 'nigeria' },
  { kind: 'airport', a: 'india', b: 'gulf-states' },
  { kind: 'airport', a: 'india', b: 'maritime-asia' },
  { kind: 'airport', a: 'india', b: 'kenya-uganda' },
  // The train (owner, M1): France ↔ Russia West and France ↔ Turkey; the Caucasus has no train.
  { kind: 'station', a: 'france', b: 'russia-west' },
  { kind: 'station', a: 'france', b: 'turkey' },
  // The bus (owner, M1): from Mongolia one way to Siberia or China West, as on the 30-turn map.
  { kind: 'bus', a: 'mongolia', b: 'russia-east', oneWay: true },
  { kind: 'bus', a: 'mongolia', b: 'china-west', oneWay: true },
];

// 50-turn area id -> the 30-turn area it lies inside (for sorting the facts by country, M3).
export const INSIDE_30: Readonly<Record<string, string>> = Object.fromEntries(AREAS.map((a) => [a.id, a.inside]));

function build(): GameMap {
  const areas: Area[] = AREAS.map(({ inside, ...a }) => {
    const continent = map30.areas.find((x) => x.id === inside)?.continent;
    if (!continent) throw new Error(`Unknown 30-turn area: ${inside}`);
    return { ...a, continent, neighbours: [] };
  });
  const byId = new Map(areas.map((a) => [a.id, a]));
  for (const [a, b] of BORDERS) {
    const from = byId.get(a);
    const to = byId.get(b);
    if (!from || !to) throw new Error(`Border with unknown area: ${a} – ${b}`);
    from.neighbours.push(b);
    to.neighbours.push(a);
  }
  return { id: 'map50', rounds: 50, areas, routes: ROUTES, facts: {} };
}

export const map50: GameMap = build();
