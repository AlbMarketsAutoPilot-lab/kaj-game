import { areaById } from './map.ts';
import { randomInt } from './rng.ts';
import { CHALLENGES } from '../challenges/challenges.ts';
import type { Fact } from '../facts/types.ts';
import type { Area, Challenge, GameMap, Player, QuizQuestion } from './types.ts';

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

// ---------- the rotation (version 2.0, step 2.1) ----------

// A fact's id in the rotation: a short hash of its question and right answer, so the same fact
// keeps its id on both maps.
export function factId(fact: Fact): string {
  let h = 0x811c9dc5;
  for (const ch of `${fact.question}|${fact.right}`) h = Math.imul(h ^ ch.codePointAt(0)!, 0x01000193);
  return `f${(h >>> 0).toString(36)}`;
}

// Draw `count` different ids from `pool`, each one evenly among those the player hasn't seen
// (no place in the list is favoured). When the pool is used up it starts again: its ids leave
// the seen list, except the ones just drawn and the last one asked, so a question never comes
// straight back. Returns the ids, the new seen list (oldest first) and the next seed.
export function drawFresh(pool: readonly string[], seen: readonly string[], count: number, seed: number): [string[], string[], number] {
  const ids = [...new Set(pool)];
  let kept = [...seen];
  const picked: string[] = [];
  let rng = seed;
  for (let k = 0; k < Math.min(count, ids.length); k++) {
    let fresh = ids.filter((id) => !kept.includes(id) && !picked.includes(id));
    if (fresh.length === 0) {
      const inPool = new Set(ids);
      const last = [...kept].reverse().find((id) => inPool.has(id));
      kept = kept.filter((id) => !inPool.has(id));
      fresh = ids.filter((id) => !picked.includes(id) && id !== last);
      if (fresh.length === 0) fresh = ids.filter((id) => !picked.includes(id));
    }
    let i: number;
    [i, rng] = randomInt(rng, fresh.length);
    picked.push(fresh[i]);
  }
  return [picked, [...kept.filter((id) => !picked.includes(id)), ...picked], rng];
}

// The challenges about the countries of an area (step 2.1: they join the airline-quiz pool).
export function areaChallenges(area: Area): Challenge[] {
  const countries = new Set(area.countries ?? []);
  return CHALLENGES.filter((c) => countries.has(c.country));
}

// Airline quiz: one question about the destination, from its facts and the challenges about its
// countries, in the player's rotation (`me.seen` is updated).
export function makeQuestion(map: GameMap, to: string, seed: number, me?: Player): [QuizQuestion, number] {
  const facts = map.facts?.[to] ?? [];
  if (facts.length === 0) return placeholderQuestion(map, to, seed);
  const challenges = areaChallenges(areaById(map, to));
  const pool = [...facts.map(factId), ...challenges.map((c) => c.id)];
  const [[id], seen, rng] = drawFresh(pool, me?.seen ?? [], 1, seed);
  if (me) me.seen = seen;
  const challenge = challenges.find((c) => c.id === id);
  if (challenge) {
    const q: QuizQuestion = { text: challenge.question, options: [...challenge.options], correct: challenge.correct, id };
    if (challenge.flag) q.flag = challenge.flag;
    return [q, rng];
  }
  return factQuestion(facts.find((f) => factId(f) === id)!, rng);
}

// Citizenship test (owner's change after task 15 planning): `studied` facts of the area to read,
// then `count` questions about `count` of them. The questions come from the player's rotation
// (step 2.1, `me.seen` is updated); the other study lines are drawn at random from the rest. The
// study lines keep the area's own order, so they don't show which facts are asked. An area
// without facts (the test maps) gets placeholder questions, each with its answer as the study line.
export function makeExam(map: GameMap, areaId: string, count: number, studied: number, seed: number, me?: Player): [{ questions: QuizQuestion[]; study: string[] }, number] {
  const all = map.facts?.[areaId] ?? [];
  const ids = all.map(factId);
  let [asked, seen, rng] = drawFresh(ids, me?.seen ?? [], Math.min(count, studied), seed);
  if (me) me.seen = seen;
  const picked = asked.map((id) => ids.indexOf(id));
  const left = all.map((_, i) => i).filter((i) => !picked.includes(i));
  for (let k = picked.length; k < Math.min(studied, all.length); k++) {
    let i: number;
    [i, rng] = randomInt(rng, left.length);
    picked.push(left.splice(i, 1)[0]);
  }
  const questions: QuizQuestion[] = [];
  const study: string[] = [];
  for (let k = 0; k < count; k++) {
    let q: QuizQuestion;
    if (k < asked.length) {
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
  return [{ text: fact.question, options, correct: correct as 0 | 1, id: factId(fact) }, rng];
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
