import assert from 'node:assert/strict';
import { test } from 'node:test';
import { map30 } from '../src/maps/map30.ts';
import { map50 } from '../src/maps/map50.ts';
import { map100 } from '../src/maps/map100.ts';
import { MAP_NAME, nameLayouts } from '../src/web/maps.ts';

// Names on the map (owner, 2026-11-25): for the drawing only.

test('map names: one line first, then 2 or 3 lines split after "," or "&"', () => {
  assert.deepEqual(nameLayouts('Chile'), [['Chile']]);
  assert.deepEqual(nameLayouts('Morocco & Western Sahara'), [['Morocco & Western Sahara'], ['Morocco &', 'Western Sahara']]);
  assert.deepEqual(nameLayouts('Uganda, Rwanda & Burundi'), [
    ['Uganda, Rwanda & Burundi'], ['Uganda,', 'Rwanda & Burundi'], ['Uganda, Rwanda &', 'Burundi'], ['Uganda,', 'Rwanda &', 'Burundi'],
  ]);
});

test('map names: North, South, West, East become N., S., W., E. only after the full name', () => {
  assert.deepEqual(nameLayouts('Brazil North'), [['Brazil North'], ['Brazil N.']]);
  assert.deepEqual(nameLayouts('Sudan & South Sudan'), [['Sudan & South Sudan'], ['Sudan &', 'South Sudan'], ['Sudan & S. Sudan'], ['Sudan &', 'S. Sudan']]);
  assert.deepEqual(nameLayouts('Western Sahara'), [['Western Sahara']]); // whole words only
});

test('map names: Central Balkans and Horn of Africa, only on the 100-turn map; the engine names stay', () => {
  assert.deepEqual(MAP_NAME, { 'serbia-kosovo-macedonia': 'Central Balkans', somalia: 'Horn of Africa' });
  const name = (m: typeof map30, id: string) => m.areas.find((a) => a.id === id)?.name;
  assert.equal(name(map100, 'serbia-kosovo-macedonia'), 'Serbia, Kosovo & North Macedonia');
  assert.equal(name(map100, 'somalia'), 'Somalia');
  for (const m of [map30, map50]) for (const id of Object.keys(MAP_NAME)) assert.equal(name(m, id), undefined, `${m.id} ${id}`);
});
