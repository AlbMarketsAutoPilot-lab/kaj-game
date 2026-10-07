import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateMap } from '../src/engine/map.ts';
import { testMap } from './fixtures/test-map.ts';

test('the test map is valid', () => {
  assert.deepEqual(validateMap(testMap), []);
});

test('one-way, unknown and unreachable links are reported', () => {
  const problems = validateMap({
    id: 'bad',
    areas: [
      { id: 'a', name: 'A', continent: 'Europe', neighbours: ['b'] },
      { id: 'b', name: 'B', continent: 'Europe', neighbours: ['zz'] },
    ],
  });
  assert.ok(problems.includes('a -> b is one-way'));
  assert.ok(problems.includes('b: unknown neighbour zz'));

  const islands = validateMap({
    id: 'islands',
    areas: [
      { id: 'a', name: 'A', continent: 'Europe', neighbours: [] },
      { id: 'b', name: 'B', continent: 'Asia', neighbours: [] },
    ],
  });
  assert.deepEqual(islands, ['b: unreachable']);
});
