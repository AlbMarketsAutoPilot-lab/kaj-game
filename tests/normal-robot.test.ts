import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apply, createGame, currentPlayer, legalActions } from '../src/engine/engine.ts';
import { robotAction } from '../src/engine/normal-robot.ts';
import { loadGame, saveGame } from '../src/engine/save.ts';
import type { Action, GameState, RobotLevel } from '../src/engine/types.ts';
import { map30 } from '../src/maps/map30.ts';
import { COLOURS, startedGame } from './helpers.ts';

const LEVELS: RobotLevel[] = ['easy', 'normal', 'hard'];
const GAMES = 1000;

function act(s: GameState, level: RobotLevel = 'normal', seed = 1): Action {
  return robotAction(s, map30, seed, level)[0];
}

test('the robot level is kept on the seat (default normal) and in the save', () => {
  const s = createGame({ seats: [
    { kind: 'human', colour: 'red' },
    { kind: 'robot', colour: 'blue', level: 'hard' },
    { kind: 'robot', colour: 'green' },
  ], seed: 1 }, map30);
  assert.deepEqual(s.players.map((p) => p.level), [null, 'hard', 'normal']);
  const loaded = loadGame(saveGame(s));
  assert.ok('state' in loaded);
  assert.deepEqual(loaded.state.players.map((p) => p.level), [null, 'hard', 'normal']);
});

test('start area: the highest welcome bonus, then the most neighbours; the Backpacker avoids Oceania and the Americas', () => {
  const setup = (profile: 'luxury' | 'backpacker') => {
    let s = createGame({ seats: [{ kind: 'human', colour: 'red' }, { kind: 'robot', colour: 'blue' }], seed: 3 }, map30);
    s = apply(s, map30, { type: 'chooseProfile', profile });
    return apply(s, map30, { type: 'chooseProfile', profile: 'business' });
  };
  for (let seed = 0; seed < 20; seed++) {
    const lux = act(setup('luxury'), 'normal', seed);
    assert.ok(lux.type === 'chooseStart');
    assert.ok(['australia-west', 'australia-east'].includes(lux.area), lux.area);
    const bp = act(setup('backpacker'), 'normal', seed);
    assert.ok(bp.type === 'chooseStart');
    // Europe, Asia or Africa (+3), with the most neighbours (6: Balkans, Russia, China West).
    const area = map30.areas.find((a) => a.id === bp.area)!;
    assert.ok(['Europe', 'Asia', 'Africa'].includes(area.continent) && area.neighbours.length === 6, bp.area);
  }
});

test('walking: most points now (a wonder), less after fees; citizenship in the first new area', () => {
  const s = startedGame(['central-europe', 'egypt'], 1, map30, ['business', 'luxury']);
  const a = act(s);
  assert.deepEqual(a, { type: 'walk', to: 'italy', citizenship: true });

  // Italy with a visa (2) gives 2 − 2 = 0: a plain new area (+1) is better.
  const visa = structuredClone(s);
  visa.players.find((p) => p !== currentPlayer(visa))!.citizenship = ['italy'];
  const b = act(visa);
  assert.ok(b.type === 'walk' && b.to !== 'italy');

  // After round 9 it no longer asks.
  const late = structuredClone(s);
  late.round = 10;
  assert.deepEqual(act(late), { type: 'walk', to: 'italy' });
});

test('businesses: bought only when the reserve is kept (easy 5, normal 3, hard 2)', () => {
  const s = startedGame(['italy', 'egypt'], 1, map30, ['business', 'luxury']);
  const me = currentPlayer(s);
  const withPoints = (n: number) => {
    const t = structuredClone(s);
    currentPlayer(t).points = n;
    return t;
  };
  assert.equal(me.points, 3);
  const buys = (level: RobotLevel, points: number) => act(withPoints(points), level).type === 'buy';
  assert.equal(buys('hard', 3), false); // 3 − 2 = 1 < 2
  assert.equal(buys('hard', 4), true);
  assert.equal(buys('normal', 4), false);
  assert.equal(buys('normal', 5), true);
  assert.equal(buys('easy', 6), false);
  assert.equal(buys('easy', 7), true);
});

test('a last quiz try that would send it home: the robot walks instead, if it can', () => {
  // A Backpacker in UK & Ireland (airport and port) after 2 wrong answers.
  const s = startedGame(['uk-ireland', 'egypt'], 1, map30, ['backpacker', 'luxury']);
  currentPlayer(s).visitedAreas.push('iceland', 'arabia', 'iberia', 'france');
  currentPlayer(s).quizWrong = 2;
  assert.deepEqual(act(s), { type: 'walk', to: 'france' });
  // With France taken there is no walk: it takes the last try.
  const taken = structuredClone(s);
  taken.players.find((p) => p !== currentPlayer(taken))!.area = 'france';
  assert.equal(act(taken).type, 'quiz');
});

test('challenges: played only with enough points (easy 5, normal 3, hard 1)', () => {
  const s = startedGame(['iberia', 'egypt'], 1, map30, ['business', 'luxury']);
  const travelling = (points: number) => {
    const t = structuredClone(s);
    const me = currentPlayer(t);
    me.travel = { kind: 'port', from: 'iberia', to: 'uk-ireland', turnsLeft: 1 };
    me.area = null;
    me.points = points;
    return t;
  };
  const plays = (level: RobotLevel, points: number) => {
    const a = act(travelling(points), level);
    assert.equal(a.type, 'travel');
    return a.type === 'travel' && a.challenge === true;
  };
  assert.equal(plays('hard', 1), true);
  assert.equal(plays('normal', 2), false);
  assert.equal(plays('normal', 3), true);
  assert.equal(plays('easy', 4), false);
  assert.equal(plays('easy', 5), true);
});

test('answers: right about 50% (easy), 75% (normal), 90% (hard) of the time', () => {
  const s = startedGame(['iberia', 'egypt'], 1, map30, ['business', 'luxury']);
  s.quiz = { kind: 'port', to: 'uk-ireland', question: { text: '?', options: ['a', 'b'], correct: 1 } };
  const expected = { easy: 0.5, normal: 0.75, hard: 0.9 };
  for (const level of LEVELS) {
    let right = 0;
    let seed = 42;
    for (let i = 0; i < 4000; i++) {
      const [a, next] = robotAction(s, map30, seed, level);
      seed = next;
      if (a.type === 'answer' && a.choice === 1) right++;
    }
    assert.ok(Math.abs(right / 4000 - expected[level]) < 0.03, `${level}: ${right / 4000}`);
  }
});

for (const level of LEVELS) {
  test(`${level} robots play ${GAMES} games on the 30-turn map: nobody stuck, points ≥ 0, never two in one area`, () => {
    let longestBlock = 0;
    let longestTrip = 0;
    for (let g = 0; g < GAMES; g++) {
      const n = 2 + (g % 3);
      const seats = COLOURS.slice(0, n).map((colour, i) => ({ kind: i === 0 ? 'human' as const : 'robot' as const, colour, level }));
      let s = createGame({ seats, seed: g * 7919 + 13 }, map30);
      let robotSeed = g + 101;
      const blockedInARow = new Array(n).fill(0);
      const inTransit = new Array(n).fill(0);
      let steps = 0;
      while (s.phase !== 'finished') {
        assert.ok(legalActions(s, map30).length > 0, `game ${g}: no legal action`);
        const seat = currentPlayer(s).seat;
        let action: Action;
        [action, robotSeed] = robotAction(s, map30, robotSeed, level);
        if (s.phase === 'play' && !s.quiz && !s.offer && action.type !== 'buy' && action.type !== 'sell') {
          blockedInARow[seat] = action.type === 'blocked' ? blockedInARow[seat] + 1 : 0;
          longestBlock = Math.max(longestBlock, blockedInARow[seat]);
        }
        s = apply(s, map30, action);
        // Counted like the random robot's games: each move made while on a trip (a challenge
        // question doesn't end the turn, only its answer counts).
        const p = s.players[seat];
        for (const q of s.players) assert.ok(q.points >= 0);
        if (!s.challenge) {
          inTransit[seat] = p.travel ? inTransit[seat] + 1 : 0;
          longestTrip = Math.max(longestTrip, inTransit[seat]);
        }
        const areas = s.players.map((p) => p.area).filter((a) => a !== null);
        assert.equal(new Set(areas).size, areas.length, `game ${g}: two players share an area`);
        assert.ok(++steps < 3000, `game ${g} never ends`);
      }
      assert.equal(s.round, 30);
    }
    // The same limits as the random robot (task 12).
    assert.ok(longestBlock <= 5, `a player was blocked ${longestBlock} turns in a row`);
    assert.ok(longestTrip <= 10, `a trip took ${longestTrip} turns`);
  });
}
