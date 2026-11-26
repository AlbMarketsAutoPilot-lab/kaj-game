// Flags and capitals for the area details (task 14 B1), read from the challenge data
// (mledoze/countries, ODbL 1.0; flags from flag-icons, MIT). Nothing new is downloaded.

import { CHALLENGES } from '../challenges/challenges.ts';

const flagCode = new Map<string, string>();
const capitals = new Map<string, string>();
for (const c of CHALLENGES) {
  const answer = c.options[c.correct];
  if (c.type === 'flag' && c.flag) flagCode.set(answer, c.flag);
  if (c.type === 'capital') {
    const m = /^What is the capital of (?:the )?(.+)\?$/.exec(c.question);
    if (m) capitals.set(m[1], answer);
  }
}

export const countryFlag = (country: string): string | undefined => flagCode.get(country);
export const countryCapital = (country: string): string | undefined => capitals.get(country);

// The wonder in each wonder area. Draft names, to be checked by the owner.
export const WONDER_NAME: Record<string, string> = {
  italy: 'the Colosseum',
  india: 'the Taj Mahal',
  japan: 'Mount Fuji',
  egypt: 'the Pyramids of Giza',
  mexico: 'Chichén Itzá',
  'peru-bolivia': 'Machu Picchu',
  'new-zealand': 'Milford Sound',
  // The 50-turn map (task M4, owner-approved names).
  greece: 'the Parthenon',
  jordan: 'Petra',
  'cambodia-laos-vietnam': 'Angkor Wat',
  tanzania: 'Mount Kilimanjaro',
  peru: 'Machu Picchu',
  // The 100-turn map (step 2.12 J5): Angkor Wat's area is Cambodia alone.
  cambodia: 'Angkor Wat',
};

// Where each wonder is, under its name on the wonder poster (task M6).
export const WONDER_PLACE: Record<string, string> = {
  italy: 'Rome · Italy',
  india: 'Agra · India',
  japan: 'Honshu · Japan',
  egypt: 'Giza · Egypt',
  mexico: 'Yucatán · Mexico',
  'peru-bolivia': 'Cusco · Peru',
  'new-zealand': 'Fiordland · New Zealand',
  greece: 'Athens · Greece',
  jordan: 'Wadi Musa · Jordan',
  'cambodia-laos-vietnam': 'Siem Reap · Cambodia',
  tanzania: 'Kilimanjaro · Tanzania',
  peru: 'Cusco · Peru',
  cambodia: 'Siem Reap · Cambodia',
};

// The 50-turn Peru shows the Machu Picchu drawing of the 30-turn Peru & Bolivia (task M4); the 100-turn
// Cambodia shows the Angkor Wat drawing of the 50-turn Cambodia, Laos & Vietnam (step 2.12 J5).
export const WONDER_ART: Record<string, string> = { peru: 'peru-bolivia', cambodia: 'cambodia-laos-vietnam' };

// The surprise's fact (owner, M5; a safer figure than "150,000 species", which varies by source).
export const SURPRISE_FACT: Record<string, string> = {
  madagascar: 'About 9 in 10 of its plants and animals live nowhere else on Earth.',
};
