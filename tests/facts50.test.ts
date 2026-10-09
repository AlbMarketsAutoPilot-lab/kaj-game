import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FACT_BATCHES } from '../src/facts/index.ts';
import { FACTS_50_NEW } from '../src/facts/new50.ts';
import { SORT_50 } from '../src/facts/sort50.ts';
import { INSIDE_30, map50 } from '../src/maps/map50.ts';

// The 50-turn map's facts (task M3): the 30-turn facts sorted by country, plus new ones.


test('the sort sends each fact of a split area to one or more of its own parts', () => {
  const old = Object.assign({}, ...FACT_BATCHES);
  for (const [id30, list] of Object.entries(SORT_50)) {
    assert.equal(list.length, old[id30].length, id30);
    const parts = new Set(Object.keys(INSIDE_30).filter((id) => INSIDE_30[id] === id30));
    assert.ok(parts.size > 1, id30);
    for (const entry of list) for (const id of entry.split('+')) assert.ok(parts.has(id), `${id30}: ${id}`);
  }
});

test('new facts only for split areas, each complete, and no text or question repeats any fact', () => {
  const texts = new Set(FACT_BATCHES.flatMap((b) => Object.values(b).flat().map((x) => x.text)));
  const questions = new Set(FACT_BATCHES.flatMap((b) => Object.values(b).flat().map((x) => x.question)));
  for (const [id, facts] of Object.entries(FACTS_50_NEW)) {
    assert.ok(SORT_50[INSIDE_30[id]], `${id}: not a split area`);
    for (const x of facts) {
      for (const s of [x.text, x.question, x.right, x.wrong]) assert.ok(s.trim().length > 0, `${id}: empty field`);
      assert.match(x.question, /[?…]$/, `${id}: ${x.question}`);
      assert.notEqual(x.right.toLowerCase(), x.wrong.toLowerCase(), `${id}: ${x.question}`);
      assert.ok(!texts.has(x.text), `repeated fact: ${x.text}`);
      assert.ok(!questions.has(x.question), `repeated question: ${x.question}`);
      texts.add(x.text);
      questions.add(x.question);
    }
  }
});

test('every area has at least 12 facts (owner), and no more new ones than needed', () => {
  for (const a of map50.areas) {
    const n = map50.facts![a.id].length;
    assert.ok(n >= 12, `${a.id}: ${n} facts`);
    if (FACTS_50_NEW[a.id]) assert.equal(n, 12, `${a.id}: ${n} facts`);
  }
});
