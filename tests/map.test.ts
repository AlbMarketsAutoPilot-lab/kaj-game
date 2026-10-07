import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateMap, walkingGroups } from '../src/engine/map.ts';
import { testMap } from './fixtures/test-map.ts';

test('the test map is valid', () => {
  assert.deepEqual(validateMap(testMap), []);
});

test('one-way and unknown links are reported; walking groups are found', () => {
  const problems = validateMap({
    id: 'bad',
    areas: [
      { id: 'a', name: 'A', continent: 'Europe', neighbours: ['b'] },
      { id: 'b', name: 'B', continent: 'Europe', neighbours: ['zz'] },
    ],
  });
  assert.ok(problems.includes('a -> b is one-way'));
  assert.ok(problems.includes('b: unknown neighbour zz'));

  const islands = walkingGroups({
    id: 'islands',
    areas: [
      { id: 'a', name: 'A', continent: 'Europe', neighbours: [] },
      { id: 'b', name: 'B', continent: 'Asia', neighbours: [] },
    ],
  });
  assert.deepEqual(islands, [['a'], ['b']]);
  assert.equal(walkingGroups(testMap).length, 1);
});
