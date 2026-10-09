import { areaById } from './map.ts';
import { randomInt } from './rng.ts';
import type { Fact } from '../facts/types.ts';
import type { Area, GameMap, QuizQuestion } from './types.ts';

// Questions for the airline quiz and the citizenship test: from the area's facts (task C),
// or, for an area without facts (the test maps), placeholder questions made from the map data.

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
  // Never a country of this area as the wrong answer (big countries have several parts).
  const wrong = map.areas.filter((a) => a.id !== area.id).flatMap((a) => a.countries ?? [])
    .filter((c) => !(area.countries ?? []).includes(c));
  return { text: `Which country is part of ${area.name}?`, right: own, wrong };
}

// Airline quiz: one question about the destination.
export function makeQuestion(map: GameMap, to: string, seed: number): [QuizQuestion, number] {
  const facts = map.facts?.[to] ?? [];
  if (facts.length === 0) return placeholderQuestion(map, to, seed);
  const [fact, rng] = pick(seed, facts);
  return factQuestion(fact, rng);
}

// Citizenship test (owner's change after task 15 planning): `studied` facts of the area to read,
// then `count` questions about `count` of them. The study lines keep the area's own order, so
// they don't show which facts are asked. An area without facts (the test maps) gets placeholder
// questions, each with its answer as the study line.
export function makeExam(map: GameMap, areaId: string, count: number, studied: number, seed: number): [{ questions: QuizQuestion[]; study: string[] }, number] {
  const all = map.facts?.[areaId] ?? [];
  const left = all.map((_, i) => i);
  const picked: number[] = [];
  let rng = seed;
  for (let k = 0; k < Math.min(studied, all.length); k++) {
    let i: number;
    [i, rng] = randomInt(rng, left.length);
    picked.push(left.splice(i, 1)[0]);
  }
  const questions: QuizQuestion[] = [];
  const study: string[] = [];
  for (let k = 0; k < count; k++) {
    let q: QuizQuestion;
    if (k < picked.length) {
      [q, rng] = factQuestion(all[picked[k]], rng);
    } else {
      [q, rng] = placeholderQuestion(map, areaId, rng);
      study.push(`${q.text} ${q.options[q.correct]}.`);
    }
    questions.push(q);
  }
  study.unshift(...[...picked].sort((a, b) => a - b).map((i) => all[i].text));
  return [{ questions, study }, rng];
}

function factQuestion(fact: Fact, seed: number): [QuizQuestion, number] {
  const [correct, rng] = randomInt(seed, 2);
  const options: [string, string] = correct === 0 ? [fact.right, fact.wrong] : [fact.wrong, fact.right];
  return [{ text: fact.question, options, correct: correct as 0 | 1 }, rng];
}

export function placeholderQuestion(map: GameMap, to: string, seed: number): [QuizQuestion, number] {
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
