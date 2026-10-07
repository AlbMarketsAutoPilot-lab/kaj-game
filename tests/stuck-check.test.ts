import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateMap } from '../src/engine/map.ts';
import { stuckProblems, travelGroups, visaUnits } from '../src/engine/stuck-check.ts';
import type { GameMap } from '../src/engine/types.ts';

// a — b — c, and island d. Big country "Big" = b1 + b2 hanging off c.
const small: GameMap = {
  id: 'small',
  areas: [
    { id: 'a', name: 'A', continent: 'Europe', neighbours: ['b'] },
    { id: 'b', name: 'B', continent: 'Europe', neighbours: ['a', 'c'] },
    { id: 'c', name: 'C', continent: 'Europe', neighbours: ['b', 'b1'] },
    { id: 'b1', name: 'B1', continent: 'Asia', neighbours: ['c', 'b2'], bigCountry: 'Big' },
    { id: 'b2', name: 'B2', continent: 'Asia', neighbours: ['b1'], bigCountry: 'Big' },
    { id: 'd', name: 'D', continent: 'Oceania', neighbours: [] },
  ],
};

test('a big country is one visa area', () => {
  assert.deepEqual(visaUnits(small), [['a'], ['b'], ['c'], ['d'], ['b1', 'b2']]);
});

test('an island with no route is unreachable; a visa area in a chokepoint traps', () => {
  const problems = stuckProblems(small);
  assert.ok(problems.includes('unreachable: d'));
  assert.ok(problems.includes('visa in b traps: a'));
});

test('routes join islands and open escape paths', () => {
  const map: GameMap = {
    ...small,
    routes: [
      { kind: 'airport', a: 'a', b: 'd' },
      { kind: 'port', a: 'd', b: 'c' },
      { kind: 'port', a: 'd', b: 'b2' },
    ],
  };
  assert.deepEqual(stuckProblems(map), []);
  assert.equal(travelGroups(map, new Set(['b'])).length, 1);
  // Without the port to b2, a visa in c traps the big country.
  const fewer = { ...map, routes: map.routes!.slice(0, 2) };
  assert.ok(stuckProblems(fewer).includes('visa in c traps: b1, b2'));
});

test('an airport or port has at most 3 destinations', () => {
  const hub = (n: number): GameMap => ({
    ...small,
    routes: ['b', 'c', 'd', 'b1'].slice(0, n).map((to) => ({ kind: 'airport', a: 'a', b: to })),
  });
  assert.deepEqual(validateMap(hub(3)), []);
  assert.deepEqual(validateMap(hub(4)), ['a airport: 4 destinations (max 3)']);
});

test('a route listed twice is reported', () => {
  const map: GameMap = { ...small, routes: [{ kind: 'port', a: 'a', b: 'd' }, { kind: 'port', a: 'd', b: 'a' }] };
  assert.ok(validateMap(map).some((p) => p.includes('listed twice')));
});
