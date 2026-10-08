import type { Area, Continent, GameMap, Route } from '../engine/types.ts';
import { FACT_BATCHES } from '../facts/index.ts';

// The 30-turn map: 53 areas, 8 airports and 8 ports (12 connections).
// Task 14a (owner-approved): Canada and Russia in 3 parts (50 → 52 areas).
// Task 14b (owner-approved): Alaska is a 3rd part of the USA (53 areas); a ship Australia East ↔ New Zealand.
// Each walking link is written once in BORDERS below; neighbours are built from it.

interface AreaInfo {
  id: string;
  name: string;
  continent: Continent;
  countries: string[];
  wonder?: boolean;
  bigCountry?: string;
}

const AREAS: AreaInfo[] = [
  // Europe (12)
  { id: 'iberia', name: 'Spain & Portugal', continent: 'Europe', countries: ['Spain', 'Portugal', 'Andorra'] },
  { id: 'france', name: 'France', continent: 'Europe', countries: ['France', 'Monaco'] },
  { id: 'uk-ireland', name: 'UK & Ireland', continent: 'Europe', countries: ['United Kingdom', 'Ireland'] },
  {
    id: 'central-europe', name: 'Germany, Alps & Benelux', continent: 'Europe',
    countries: ['Germany', 'Austria', 'Switzerland', 'Liechtenstein', 'Belgium', 'Netherlands', 'Luxembourg'],
  },
  { id: 'italy', name: 'Italy', continent: 'Europe', countries: ['Italy', 'San Marino', 'Vatican City', 'Malta'], wonder: true },
  {
    id: 'scandinavia', name: 'Scandinavia', continent: 'Europe',
    countries: ['Norway', 'Sweden', 'Denmark', 'Finland', 'Greenland'],
  },
  { id: 'iceland', name: 'Iceland', continent: 'Europe', countries: ['Iceland'] },
  { id: 'poland-hungary', name: 'Poland, Czechia, Slovakia & Hungary', continent: 'Europe', countries: ['Poland', 'Czechia', 'Slovakia', 'Hungary'] },
  {
    id: 'eastern-europe', name: 'Baltics, Belarus & Ukraine', continent: 'Europe',
    countries: ['Estonia', 'Latvia', 'Lithuania', 'Belarus', 'Ukraine', 'Moldova'],
  },
  {
    id: 'balkans', name: 'Balkans', continent: 'Europe',
    countries: ['Slovenia', 'Croatia', 'Bosnia and Herzegovina', 'Serbia', 'Montenegro', 'Kosovo', 'North Macedonia', 'Albania', 'Romania', 'Bulgaria'],
  },
  { id: 'greece', name: 'Greece', continent: 'Europe', countries: ['Greece'] },
  { id: 'russia-west', name: 'Russia West', continent: 'Europe', countries: ['Russia'], bigCountry: 'Russia' },

  // Asia (16)
  { id: 'russia-east', name: 'Siberia', continent: 'Asia', countries: ['Russia'], bigCountry: 'Russia' },
  { id: 'russia-far-east', name: 'Russia Far East', continent: 'Asia', countries: ['Russia'], bigCountry: 'Russia' },
  { id: 'turkey-caucasus', name: 'Turkey & Caucasus', continent: 'Asia', countries: ['Turkey', 'Georgia', 'Armenia', 'Azerbaijan'] },
  {
    id: 'middle-east', name: 'Middle East', continent: 'Asia',
    countries: ['Israel', 'Palestine', 'Lebanon', 'Syria', 'Jordan', 'Iraq'],
  },
  {
    id: 'arabia', name: 'Arabian Peninsula', continent: 'Asia',
    countries: ['Saudi Arabia', 'Yemen', 'Oman', 'United Arab Emirates', 'Qatar', 'Bahrain', 'Kuwait'],
  },
  { id: 'iran', name: 'Iran', continent: 'Asia', countries: ['Iran'] },
  {
    id: 'central-asia', name: 'Central Asia', continent: 'Asia',
    countries: ['Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan'],
  },
  { id: 'pakistan-afghanistan', name: 'Pakistan & Afghanistan', continent: 'Asia', countries: ['Pakistan', 'Afghanistan'] },
  {
    id: 'india', name: 'India & South Asia', continent: 'Asia',
    countries: ['India', 'Sri Lanka', 'Nepal', 'Bhutan', 'Bangladesh', 'Maldives'], wonder: true,
  },
  { id: 'china-west', name: 'China West', continent: 'Asia', countries: ['China'], bigCountry: 'China' },
  { id: 'china-east', name: 'China East', continent: 'Asia', countries: ['China'], bigCountry: 'China' },
  { id: 'mongolia', name: 'Mongolia', continent: 'Asia', countries: ['Mongolia'] },
  { id: 'korea', name: 'Korea', continent: 'Asia', countries: ['South Korea', 'North Korea'] },
  { id: 'japan', name: 'Japan', continent: 'Asia', countries: ['Japan'], wonder: true },
  {
    id: 'southeast-asia', name: 'Mainland Southeast Asia', continent: 'Asia',
    countries: ['Myanmar', 'Thailand', 'Laos', 'Cambodia', 'Vietnam', 'Malaysia', 'Singapore', 'Brunei'],
  },
  {
    id: 'maritime-asia', name: 'Maritime Southeast Asia', continent: 'Asia',
    countries: ['Indonesia', 'Philippines', 'Timor-Leste', 'Papua New Guinea'],
  },

  // Africa (8)
  { id: 'north-africa', name: 'North Africa', continent: 'Africa', countries: ['Morocco', 'Western Sahara', 'Algeria', 'Tunisia', 'Libya'] },
  { id: 'egypt', name: 'Egypt', continent: 'Africa', countries: ['Egypt'], wonder: true },
  { id: 'sahel', name: 'Sahel', continent: 'Africa', countries: ['Mauritania', 'Mali', 'Niger', 'Chad', 'Burkina Faso'] },
  {
    id: 'west-africa', name: 'West Africa', continent: 'Africa',
    countries: ['Senegal', 'Gambia', 'Guinea-Bissau', 'Guinea', 'Sierra Leone', 'Liberia', "Côte d'Ivoire", 'Ghana', 'Togo', 'Benin', 'Nigeria', 'Cabo Verde'],
  },
  {
    id: 'horn-of-africa', name: 'Sudan & Horn of Africa', continent: 'Africa',
    countries: ['Sudan', 'South Sudan', 'Ethiopia', 'Eritrea', 'Djibouti', 'Somalia'],
  },
  {
    id: 'central-africa', name: 'Central Africa', continent: 'Africa',
    countries: ['Cameroon', 'Central African Republic', 'Equatorial Guinea', 'Gabon', 'Republic of the Congo', 'DR Congo', 'São Tomé and Príncipe'],
  },
  {
    id: 'east-africa', name: 'East Africa', continent: 'Africa',
    countries: ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'Madagascar', 'Seychelles', 'Comoros', 'Mauritius'],
  },
  {
    id: 'southern-africa', name: 'Southern Africa', continent: 'Africa',
    countries: ['Angola', 'Zambia', 'Malawi', 'Mozambique', 'Zimbabwe', 'Botswana', 'Namibia', 'South Africa', 'Lesotho', 'Eswatini'],
  },

  // North America (8)
  { id: 'canada-west', name: 'Canada West', continent: 'North America', countries: ['Canada'], bigCountry: 'Canada' },
  { id: 'canada-central', name: 'Canada Central', continent: 'North America', countries: ['Canada'], bigCountry: 'Canada' },
  { id: 'canada-east', name: 'Canada East', continent: 'North America', countries: ['Canada'], bigCountry: 'Canada' },
  { id: 'usa-west', name: 'USA West', continent: 'North America', countries: ['United States'], bigCountry: 'United States' },
  { id: 'alaska', name: 'Alaska', continent: 'North America', countries: ['United States'], bigCountry: 'United States' },
  { id: 'usa-east', name: 'USA East', continent: 'North America', countries: ['United States'], bigCountry: 'United States' },
  { id: 'mexico', name: 'Mexico', continent: 'North America', countries: ['Mexico'], wonder: true },
  {
    id: 'central-america', name: 'Central America & Caribbean', continent: 'North America',
    countries: ['Guatemala', 'Belize', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Cuba', 'Jamaica', 'Haiti', 'Dominican Republic', 'Bahamas'],
  },

  // South America (6)
  {
    id: 'northern-andes', name: 'Colombia, Venezuela & Guianas', continent: 'South America',
    countries: ['Colombia', 'Venezuela', 'Ecuador', 'Guyana', 'Suriname'],
  },
  { id: 'peru-bolivia', name: 'Peru & Bolivia', continent: 'South America', countries: ['Peru', 'Bolivia'], wonder: true },
  { id: 'chile', name: 'Chile', continent: 'South America', countries: ['Chile'] },
  { id: 'brazil-north', name: 'Brazil North', continent: 'South America', countries: ['Brazil'], bigCountry: 'Brazil' },
  { id: 'brazil-south', name: 'Brazil South', continent: 'South America', countries: ['Brazil'], bigCountry: 'Brazil' },
  { id: 'southern-cone', name: 'Argentina, Uruguay & Paraguay', continent: 'South America', countries: ['Argentina', 'Uruguay', 'Paraguay'] },

  // Oceania (3)
  { id: 'australia-west', name: 'Australia West', continent: 'Oceania', countries: ['Australia'], bigCountry: 'Australia' },
  { id: 'australia-east', name: 'Australia East', continent: 'Oceania', countries: ['Australia'], bigCountry: 'Australia' },
  { id: 'new-zealand', name: 'New Zealand', continent: 'Oceania', countries: ['New Zealand'], wonder: true },
];

// Walking links: real land borders between the areas.
// One fixed link that is not a land border: the Channel Tunnel (UK & Ireland – France).
const BORDERS: [string, string][] = [
  ['iberia', 'france'],
  ['france', 'uk-ireland'],
  ['france', 'central-europe'],
  ['france', 'italy'],
  ['central-europe', 'italy'],
  ['central-europe', 'scandinavia'],
  ['central-europe', 'poland-hungary'],
  ['central-europe', 'balkans'],
  ['italy', 'balkans'],
  ['scandinavia', 'russia-west'],
  ['poland-hungary', 'eastern-europe'],
  ['poland-hungary', 'balkans'],
  ['poland-hungary', 'russia-west'],
  ['eastern-europe', 'balkans'],
  ['eastern-europe', 'russia-west'],
  ['balkans', 'greece'],
  ['balkans', 'turkey-caucasus'],
  ['greece', 'turkey-caucasus'],
  ['russia-west', 'russia-east'],
  ['russia-west', 'turkey-caucasus'],
  ['russia-west', 'central-asia'],
  ['russia-east', 'central-asia'],
  ['russia-east', 'mongolia'],
  ['russia-east', 'china-west'],
  ['russia-east', 'china-east'],
  ['russia-east', 'russia-far-east'],
  ['russia-far-east', 'china-east'],
  ['russia-far-east', 'korea'],
  ['turkey-caucasus', 'middle-east'],
  ['turkey-caucasus', 'iran'],
  ['middle-east', 'iran'],
  ['middle-east', 'arabia'],
  ['middle-east', 'egypt'],
  ['iran', 'central-asia'],
  ['iran', 'pakistan-afghanistan'],
  ['central-asia', 'pakistan-afghanistan'],
  ['central-asia', 'china-west'],
  ['pakistan-afghanistan', 'china-west'],
  ['pakistan-afghanistan', 'india'],
  ['india', 'china-west'],
  ['india', 'southeast-asia'],
  ['china-west', 'china-east'],
  ['china-west', 'mongolia'],
  ['china-east', 'mongolia'],
  ['china-east', 'korea'],
  ['china-east', 'southeast-asia'],
  ['southeast-asia', 'maritime-asia'],
  ['north-africa', 'egypt'],
  ['north-africa', 'sahel'],
  ['north-africa', 'horn-of-africa'],
  ['egypt', 'horn-of-africa'],
  ['sahel', 'west-africa'],
  ['sahel', 'central-africa'],
  ['sahel', 'horn-of-africa'],
  ['west-africa', 'central-africa'],
  ['horn-of-africa', 'central-africa'],
  ['horn-of-africa', 'east-africa'],
  ['central-africa', 'east-africa'],
  ['central-africa', 'southern-africa'],
  ['east-africa', 'southern-africa'],
  ['canada-west', 'canada-central'],
  ['canada-west', 'usa-west'],
  ['canada-west', 'alaska'],
  ['canada-central', 'canada-east'],
  ['canada-central', 'usa-west'],
  ['canada-central', 'usa-east'],
  ['canada-east', 'usa-east'],
  ['usa-west', 'usa-east'],
  ['usa-west', 'mexico'],
  ['usa-east', 'mexico'],
  ['mexico', 'central-america'],
  ['central-america', 'northern-andes'],
  ['northern-andes', 'peru-bolivia'],
  ['northern-andes', 'brazil-north'],
  ['peru-bolivia', 'brazil-north'],
  ['peru-bolivia', 'brazil-south'],
  ['peru-bolivia', 'chile'],
  ['peru-bolivia', 'southern-cone'],
  ['chile', 'southern-cone'],
  ['brazil-north', 'brazil-south'],
  ['brazil-south', 'southern-cone'],
  ['australia-west', 'australia-east'],
];

// Airports and ports (owner-approved, task 2b). Some have 2 destinations.
// The stuck-state checker needs every one of these 9 connections.
const ROUTES: Route[] = [
  { kind: 'port', a: 'iberia', b: 'uk-ireland' },
  { kind: 'port', a: 'uk-ireland', b: 'iceland' },
  { kind: 'port', a: 'iceland', b: 'canada-east' },
  { kind: 'airport', a: 'arabia', b: 'australia-west' },
  { kind: 'airport', a: 'australia-west', b: 'maritime-asia' },
  { kind: 'airport', a: 'maritime-asia', b: 'japan' },
  { kind: 'airport', a: 'japan', b: 'new-zealand' },
  { kind: 'airport', a: 'new-zealand', b: 'chile' },
  { kind: 'airport', a: 'southern-africa', b: 'chile' },
  // Task 9b (owner-approved): two areas with both an airport and a port.
  { kind: 'airport', a: 'uk-ireland', b: 'arabia' },
  { kind: 'port', a: 'japan', b: 'usa-west' },
  // Task 14b (owner-approved): New Zealand can be reached by sea from Australia.
  { kind: 'port', a: 'australia-east', b: 'new-zealand' },
];

function build(): GameMap {
  const areas: Area[] = AREAS.map((a) => ({ ...a, neighbours: [] }));
  const byId = new Map(areas.map((a) => [a.id, a]));
  for (const [a, b] of BORDERS) {
    const from = byId.get(a);
    const to = byId.get(b);
    if (!from || !to) throw new Error(`Border with unknown area: ${a} – ${b}`);
    from.neighbours.push(b);
    to.neighbours.push(a);
  }
  return { id: 'map30', areas, routes: ROUTES, facts: Object.assign({}, ...FACT_BATCHES) };
}

export const map30: GameMap = build();
