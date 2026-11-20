// Records on this device (step 2.10): the top 10 wins by a person, one list per game length, by points.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addWin, ordinal, parseRecords, RECORDS_TOP, type Records, type WinRecord } from '../src/web/records.ts';

const win = (points: number, areas = 20, date = '2026-11-20'): WinRecord => ({ points, areas, continents: 3, profile: 'backpacker', players: 2, date });

test('records: ranked by points, then areas; one list per game length; place of the new win', () => {
  let r: Records = {};
  for (const p of [50, 70, 60]) r = addWin(r, 30, win(p)).records;
  const added = addWin(r, 30, win(65));
  assert.equal(added.place, 2);
  assert.deepEqual(added.records['30'].map((w) => w.points), [70, 65, 60, 50]);
  assert.equal(added.records['50'], undefined);
  // Equal points: more areas first.
  const more = addWin(added.records, 30, win(65, 25));
  assert.equal(more.place, 2);
  assert.deepEqual(more.records['30'].map((w) => [w.points, w.areas]), [[70, 20], [65, 25], [65, 20], [60, 20], [50, 20]]);
});

test('records: only the top 10 are kept; a full tie keeps the older win ahead', () => {
  let r: Records = {};
  for (let i = 0; i < RECORDS_TOP; i++) r = addWin(r, 50, win(60 + i)).records;
  const low = addWin(r, 50, win(40));
  assert.equal(low.place, null);
  assert.equal(low.records['50'].length, RECORDS_TOP);
  const tie = addWin(r, 50, win(60, 20, '2026-12-01'));
  assert.equal(tie.place, null, 'equal to the 10th: the older win stays');
  const top = addWin(r, 50, win(99));
  assert.equal(top.place, 1);
  assert.equal(top.records['50'].at(-1)!.points, 61);
});

test('records: unreadable storage counts as no records', () => {
  assert.deepEqual(parseRecords(null), {});
  assert.deepEqual(parseRecords('not json'), {});
  assert.deepEqual(parseRecords('{"30":[{"points":"x"}],"50":[' + JSON.stringify(win(70)) + ']}'), { 30: [], 50: [win(70)] });
});

test('ordinal places', () => {
  assert.deepEqual([1, 2, 3, 4, 10, 11, 12, 13, 21].map(ordinal), ['1st', '2nd', '3rd', '4th', '10th', '11th', '12th', '13th', '21st']);
});
