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
};
