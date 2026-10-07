import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FACT_BATCHES } from '../src/facts/index.ts';
import { map30 } from '../src/maps/map30.ts';

const ids = new Set(map30.areas.map((a) => a.id));
const all = FACT_BATCHES.flatMap((b) => Object.entries(b));

test('each batch has 10 real areas, and no area is in two batches', () => {
  for (const batch of FACT_BATCHES) assert.equal(Object.keys(batch).length, 10);
  const seen = all.map(([id]) => id);
  for (const id of seen) assert.ok(ids.has(id), `unknown area ${id}`);
  assert.equal(new Set(seen).size, seen.length);
});

test('every area in a batch has 12 facts', () => {
  for (const [id, facts] of all) assert.equal(facts.length, 12, id);
});

test('every fact is complete, its two answers differ, and nothing repeats', () => {
  const texts = new Set<string>();
  const questions = new Set<string>();
  for (const [id, facts] of all) {
    for (const f of facts) {
      for (const s of [f.text, f.question, f.right, f.wrong]) assert.ok(s.trim().length > 0, `${id}: empty field`);
      assert.match(f.question, /[?…]$/, `${id}: ${f.question}`);
      assert.notEqual(f.right.toLowerCase(), f.wrong.toLowerCase(), `${id}: ${f.question}`);
      assert.ok(!texts.has(f.text), `repeated fact: ${f.text}`);
      assert.ok(!questions.has(f.question), `repeated question: ${f.question}`);
      texts.add(f.text);
      questions.add(f.question);
    }
  }
});
