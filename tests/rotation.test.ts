import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CHALLENGES } from '../src/challenges/challenges.ts';
import { apply, createGame } from '../src/engine/engine.ts';
import { AIRLINE_CHALLENGE_ONE_IN, areaChallenges, drawFresh, factId, makeExam, makeQuestion } from '../src/engine/quiz.ts';
import { SAVE_VERSION, loadGame, saveGame } from '../src/engine/save.ts';
import type { Player } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { map50 } from '../src/maps/map50.ts';
import { seats } from './helpers.ts';

// Version 2.0, step 2.1: question rotation.

const pool = Array.from({ length: 12 }, (_, i) => `q${i}`);

test('rotation: no question comes again until the whole pool is used up', () => {
  let seen: string[] = [];
  let seed = 11;
  for (let round = 0; round < 5; round++) {
    const got: string[] = [];
    for (let k = 0; k < pool.length; k++) {
      let ids: string[];
      [ids, seen, seed] = drawFresh(pool, seen, 1, seed);
      got.push(ids[0]);
    }
    assert.deepEqual([...got].sort(), [...pool].sort(), `round ${round}: every question exactly once`);
  }
});

test('rotation: the question just asked never comes straight back when the pool starts again', () => {
  let seen: string[] = [];
  let seed = 5;
  let last = '';
  for (let k = 0; k < 400; k++) {
    let ids: string[];
    [ids, seen, seed] = drawFresh(pool, seen, 1, seed);
    assert.notEqual(ids[0], last);
    last = ids[0];
  }
});

test('rotation: the draw is even, the start of a list is never favoured', () => {
  const counts = new Map(pool.map((id) => [id, 0]));
  const games = 12000;
  for (let g = 0; g < games; g++) {
    const [[id]] = drawFresh(pool, [], 1, g * 7919 + 1);
    counts.set(id, counts.get(id)! + 1);
  }
  // Expected 1,000 each; allow ±15%.
  for (const [id, n] of counts) assert.ok(n > 850 && n < 1150, `${id}: ${n}`);
  // Also with half the pool seen: only the unseen half, evenly.
  const half = pool.slice(0, 6);
  const c2 = new Map<string, number>();
  for (let g = 0; g < 6000; g++) {
    const [[id]] = drawFresh(pool, half, 1, g * 104729 + 3);
    c2.set(id, (c2.get(id) ?? 0) + 1);
  }
  assert.deepEqual([...c2.keys()].sort(), pool.slice(6).sort());
  for (const [id, n] of c2) assert.ok(n > 850 && n < 1150, `${id}: ${n}`);
});

test('rotation: several questions at once are all different, also when the pool starts again', () => {
  const seen = pool.slice(0, 11);
  const [ids, after] = drawFresh(pool, seen, 3, 9);
  assert.equal(new Set(ids).size, 3);
  assert.ok(ids.includes('q11'), 'the last unseen one comes first');
  for (const id of ids) assert.ok(after.includes(id));
});

test('every country on both maps has its challenges (except the 4 left out of the challenges)', () => {
  const skip = new Set(['Greenland', 'Western Sahara', 'Palestine', 'Kosovo']);
  for (const map of [map30, map50]) {
    for (const a of map.areas) {
      for (const c of a.countries ?? []) {
        if (skip.has(c)) continue;
        assert.ok(CHALLENGES.some((q) => q.country === c), `${map.id} ${a.id}: ${c}`);
      }
    }
  }
});

test('airline quiz (step 2.3): about 1 question in 10 is a challenge, the rest facts, each in rotation', () => {
  const area = map30.areas.find((a) => a.id === 'iberia')!;
  const facts = map30.facts!.iberia.map(factId);
  const challenges = new Set(areaChallenges(area).map((c) => c.id));
  assert.ok(challenges.size > 0);
  assert.equal(AIRLINE_CHALLENGE_ONE_IN, 10);
  const me = { seen: [] as string[] } as Player;
  let seed = 1;
  const asked: string[] = [];
  for (let k = 0; k < 600; k++) {
    const [q, next] = makeQuestion(map30, 'iberia', seed, me);
    seed = next;
    asked.push(q.id!);
    if (q.id!.startsWith('flag-')) assert.ok(q.flag, 'a flag question shows its flag');
  }
  const fromChallenges = asked.filter((id) => challenges.has(id));
  const fromFacts = asked.filter((id) => !challenges.has(id));
  assert.ok(fromFacts.every((id) => facts.includes(id)));
  assert.ok(fromChallenges.length >= 35 && fromChallenges.length <= 90, `challenges asked: ${fromChallenges.length} of 600`);
  assert.equal(new Set(fromFacts.slice(0, facts.length)).size, facts.length, 'every fact once before any comes again');
  assert.equal(new Set(fromChallenges.slice(0, challenges.size)).size, challenges.size, 'every challenge once before any comes again');
});

test('citizenship test: the 3 questions come from the rotation and are among the 6 study lines', () => {
  const me = { seen: [] as string[] } as Player;
  const facts = [...map30.facts!.japan, ...map30.examFacts!.japan];
  const asked: string[] = [];
  let seed = 4;
  for (let k = 0; k < 4; k++) {
    const [exam, next] = makeExam(map30, 'japan', 3, 6, seed, me);
    seed = next;
    assert.equal(exam.study.length, 6);
    for (const q of exam.questions) {
      const fact = facts.find((f) => factId(f) === q.id)!;
      assert.ok(exam.study.includes(fact.text));
      asked.push(q.id!);
    }
  }
  // 14 facts (12 + 2 test-only, step 2.3): 4 tests of 3 questions never repeat one.
  assert.equal(new Set(asked).size, 12);
});

test('challenges and the quiz share one rotation per player, carried into the next game', () => {
  const remembered = CHALLENGES.filter((c) => c.type === 'flag').map((c) => c.id);
  const s = createGame({ seats: [{ kind: 'human', colour: 'red', seen: remembered }, { kind: 'robot', colour: 'blue' }], seed: 1 }, map30);
  assert.deepEqual(s.players[0].seen, remembered);
  assert.deepEqual(s.players[1].seen, []);
  // Japan's flag was seen (in a challenge or a game before): the airline quiz to Japan asks every
  // other question of its pool first.
  const me = s.players[0];
  const others = areaChallenges(map30.areas.find((a) => a.id === 'japan')!).length - 1;
  let seed = 8;
  let challengesAsked = 0;
  while (challengesAsked < others) {
    const [q, next] = makeQuestion(map30, 'japan', seed, me);
    seed = next;
    assert.notEqual(q.id, 'flag-jpn');
    if (CHALLENGES.some((c) => c.id === q.id)) challengesAsked++;
  }
});

test('save version 16 (step 2.4): the seen questions are saved; a version-15 save is not continued', () => {
  assert.equal(SAVE_VERSION, 16);
  let s = createGame({ seats: seats(2), seed: 3 }, map30);
  s = apply(s, map30, { type: 'chooseProfile', profile: 'backpacker' });
  s.players[0].seen = ['flag-esp'];
  const back = loadGame(saveGame(s));
  assert.ok('state' in back);
  assert.deepEqual(back.state.players[0].seen, ['flag-esp']);
  const old = loadGame(JSON.stringify({ version: 15, state: s }));
  assert.ok('error' in old);
});
