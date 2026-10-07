import { areaById } from './map.ts';
import { randomInt } from './rng.ts';
import type { Area, GameMap, QuizQuestion } from './types.ts';

// Placeholder airline-quiz questions made from the map data (task 7).
// They will be replaced by questions from the facts file (task C).

interface Draft {
  text: string;
  // Any of these is a right answer; one of them is used.
  right: string[];
  wrong: string[];
}

function pick<T>(seed: number, list: readonly T[]): [T, number] {
  const [i, next] = randomInt(seed, list.length);
  return [list[i], next];
}

function continentDraft(map: GameMap, area: Area): Draft | null {
  const wrong = [...new Set(map.areas.map((a) => a.continent))].filter((c) => c !== area.continent);
  return { text: `Which continent is ${area.name} in?`, right: [area.continent], wrong };
}

function neighbourDraft(map: GameMap, area: Area): Draft | null {
  if (area.neighbours.length === 0) return null;
  const wrong = map.areas
    .filter((a) => a.id !== area.id && !area.neighbours.includes(a.id))
    .map((a) => a.name);
  const right = area.neighbours.map((id) => areaById(map, id).name);
  return { text: `Which area borders ${area.name}?`, right, wrong };
}

function countryDraft(map: GameMap, area: Area): Draft | null {
  // Skip countries already named in the area name (too easy).
  const own = (area.countries ?? []).filter((c) => !area.name.toLowerCase().includes(c.toLowerCase()));
  if (own.length === 0) return null;
  const wrong = map.areas.filter((a) => a.id !== area.id).flatMap((a) => a.countries ?? []);
  return { text: `Which country is part of ${area.name}?`, right: own, wrong };
}

export function makeQuestion(map: GameMap, to: string, seed: number): [QuizQuestion, number] {
  const area = areaById(map, to);
  const drafts = [continentDraft, neighbourDraft, countryDraft]
    .map((make) => make(map, area))
    .filter((d): d is Draft => d !== null && d.wrong.length > 0);

  let [draft, rng] = pick(seed, drafts);
  let right: string;
  [right, rng] = pick(rng, draft.right);
  let wrong: string;
  [wrong, rng] = pick(rng, draft.wrong);
  let correct: number;
  [correct, rng] = randomInt(rng, 2);
  const options: [string, string] = correct === 0 ? [right, wrong] : [wrong, right];
  return [{ text: draft.text, options, correct: correct as 0 | 1 }, rng];
}
