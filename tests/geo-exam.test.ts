// Step 2.3: fact types and the citizenship test's geography facts.
import test from 'node:test';
import assert from 'node:assert/strict';
import { map30 } from '../src/maps/map30.ts';
import { map50, INSIDE_30 } from '../src/maps/map50.ts';
import { GEO_EXAM_50, GEO_EXAM_30_PICKS } from '../src/facts/geo-exam.ts';
import { FACT_TYPES } from '../src/facts/tags.ts';
import { factId, makeExam, makeQuestion } from '../src/engine/quiz.ts';
import type { Player } from '../src/engine/types.ts';

test('every fact on both maps has a type; the test-only facts are geography', () => {
  for (const map of [map30, map50]) {
    for (const facts of [...Object.values(map.facts!), ...Object.values(map.examFacts!)]) {
      for (const f of facts) assert.ok(FACT_TYPES[factId(f)], `no type: ${f.question}`);
    }
    for (const facts of Object.values(map.examFacts!)) for (const f of facts) assert.equal(FACT_TYPES[factId(f)], 'geography');
  }
});

test('2 test-only geography facts per 50-turn area; the 30-turn map takes at most 3, round by round', () => {
  for (const a of map50.areas) assert.equal(GEO_EXAM_50[a.id]?.length, 2, a.id);
  for (const a of map30.areas) {
    const parts = map50.areas.filter((b) => INSIDE_30[b.id] === a.id).map((b) => b.id);
    const expected: [string, number][] = [];
    for (let k = 0; k < 2; k++) for (const p of parts) if (expected.length < 3) expected.push([p, k]);
    assert.deepEqual(GEO_EXAM_30_PICKS[a.id], expected, a.id);
    assert.equal(map30.examFacts![a.id].length, expected.length);
  }
});

test('test-only facts come in the citizenship test, never in the airline quiz', () => {
  const extra = new Set(map50.examFacts!.japan.map(factId));
  const me = { seen: [] as string[] } as Player;
  let seed = 5;
  const asked = new Set<string>();
  for (let k = 0; k < 5; k++) {
    const [exam, next] = makeExam(map50, 'japan', 3, 6, seed, me);
    seed = next;
    for (const q of exam.questions) asked.add(q.id!);
  }
  // 14 facts: 5 tests of 3 questions ask all of them, the 2 new ones included.
  for (const id of extra) assert.ok(asked.has(id));
  for (let k = 0; k < 300; k++) {
    const [q, next] = makeQuestion(map50, 'japan', seed, me);
    seed = next;
    assert.ok(!extra.has(q.id!));
  }
});
