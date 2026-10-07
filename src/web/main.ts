// First playable screen (task 3): a plain test board on top of the engine.
// No final art yet. Robots pick random legal moves.

import { TICKET_PRICE, TRAVEL_TURNS } from '../engine/constants.ts';
import { apply, createGame, currentPlayer, legalActions } from '../engine/engine.ts';
import { randomRobotAction } from '../engine/robot.ts';
import type { Action, Area, GameState, Player, Profile, RouteKind, SeatKind } from '../engine/types.ts';
import { map30 } from '../maps/map30.ts';

const COLOURS = ['#e4572e', '#2e86de', '#29a36a', '#e0a100'];
const COLOUR_NAMES = ['Red', 'Blue', 'Green', 'Yellow'];
const PROFILE_LABEL: Record<Profile, string> = {
  backpacker: '🎒 Backpacker',
  business: '💼 Business Traveler',
  luxury: '💎 Luxury Traveler',
  nomad: '💻 Digital Nomad',
};
const ROBOT_DELAY_MS = 600;
const QUIZ_SECONDS = 15;
const VEHICLE: Record<RouteKind, string> = { airport: '✈️', port: '⛴️' };

const app = document.getElementById('app')!;
const areaById = new Map(map30.areas.map((a) => [a.id, a]));
const continents = [...new Set(map30.areas.map((a) => a.continent))];

let state: GameState | null = null;
let robotSeed = 1;
let robotTimer = 0;
let quizTimer = 0;

// ---------- small DOM helpers ----------

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

function button(label: string, onClick: () => void, disabled = false): HTMLButtonElement {
  const b = el('button', { textContent: label, disabled });
  b.addEventListener('click', onClick);
  return b;
}

function dot(seat: number): HTMLSpanElement {
  const d = el('span', { className: 'dot', title: COLOUR_NAMES[seat] });
  d.style.background = COLOURS[seat];
  return d;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

// ---------- setup screen ----------

function renderSetup(): void {
  clearTimeout(robotTimer);
  clearInterval(quizTimer);
  state = null;
  const kinds: SeatKind[] = ['human', 'robot', 'robot', 'robot'];
  let count = 2;

  const rows = el('div', { className: 'seats' });
  const error = el('p', { className: 'error' });
  const draw = () => {
    rows.replaceChildren(
      ...kinds.slice(0, count).map((kind, i) => {
        const select = el('select');
        for (const k of ['human', 'robot'] as const) {
          select.append(el('option', { value: k, textContent: k === 'human' ? '🙂 Person' : '🤖 Robot', selected: k === kind }));
        }
        select.addEventListener('change', () => (kinds[i] = select.value as SeatKind));
        return el('div', { className: 'seat' }, dot(i), ` ${COLOUR_NAMES[i]} `, select);
      }),
    );
  };
  draw();

  const counts = el('div', { className: 'row' }, 'Players: ',
    ...[2, 3, 4].map((n) => button(String(n), () => { count = n; draw(); })));

  const start = button('Start journey', () => {
    try {
      const seed = Math.floor(Math.random() * 2 ** 31);
      robotSeed = seed ^ 0x5bd1e995;
      const seats = kinds.slice(0, count).map((kind, i) => ({ kind, colour: COLOUR_NAMES[i] }));
      state = createGame({ seats, seed }, map30);
      render();
    } catch (e) {
      error.textContent = (e as Error).message;
    }
  });
  start.className = 'primary';

  app.replaceChildren(
    el('section', { className: 'card setup' },
      el('h1', { textContent: "Kris Ann's Journey" }),
      el('p', { textContent: 'Test board — 30 rounds on the 30-turn map. Walking, planes and ships.' }),
      counts, rows, start, error),
  );
}

// ---------- game screen ----------

function act(action: Action): void {
  if (!state) return;
  state = apply(state, map30, action);
  render();
}

function render(): void {
  if (!state) return renderSetup();
  const s = state;
  const me = currentPlayer(s);
  const actions = legalActions(s, map30);
  const isRobot = s.phase !== 'finished' && me.kind === 'robot';

  app.replaceChildren(
    el('header', {},
      el('strong', { textContent: "Kris Ann's Journey" }),
      el('span', { textContent: s.phase === 'play' || s.phase === 'finished' ? `Round ${s.round} / ${s.totalRounds}` : 'Getting ready' }),
      button('New game', renderSetup)),
    renderPlayers(s),
    renderTurn(s, actions, isRobot),
    renderMap(s),
  );

  clearTimeout(robotTimer);
  clearInterval(quizTimer);
  if (isRobot) {
    robotTimer = window.setTimeout(() => {
      if (state !== s) return;
      const [action, next] = randomRobotAction(s, map30, robotSeed);
      robotSeed = next;
      act(action);
    }, ROBOT_DELAY_MS);
  }
}

function renderPlayers(s: GameState): HTMLElement {
  const me = currentPlayer(s);
  return el('section', { className: 'players' },
    ...s.turnOrder.map((seat) => {
      const p = s.players[seat];
      const area = p.area ? areaById.get(p.area)!.name
        : p.travel ? `${VEHICLE[p.travel.kind]} to ${areaById.get(p.travel.to)!.name}` : '—';
      const card = el('div', { className: 'player' + (p === me && s.phase !== 'finished' ? ' active' : '') },
        el('div', {}, dot(seat), ` ${COLOUR_NAMES[seat]} ${p.kind === 'robot' ? '🤖' : '🙂'}`),
        el('div', { className: 'small', textContent: p.profile ? PROFILE_LABEL[p.profile] : 'no profile yet' }),
        el('div', { className: 'points', textContent: `${p.points} points` }),
        el('div', { className: 'small', textContent: `📍 ${area}` }),
        el('div', { className: 'small', textContent: `${plural(p.visitedContinents.length, 'continent')} · ${plural(p.visitedAreas.length, 'area')}` }));
      card.style.borderColor = COLOURS[seat];
      return card;
    }));
}

function renderTurn(s: GameState, actions: Action[], isRobot: boolean): HTMLElement {
  const me = currentPlayer(s);
  const who = el('span', {}, dot(me.seat), ` ${COLOUR_NAMES[me.seat]}`);
  const box = el('section', { className: 'card turn' });

  if (s.phase === 'finished') {
    const r = s.result!;
    const names = r.winners.map((w) => COLOUR_NAMES[w]).join(' and ');
    box.append(
      el('h2', { textContent: r.winners.length > 1 ? `It's a draw: ${names}! 🎉` : `${names} wins! 🎉` }),
      el('ol', {}, ...r.ranking.map((seat) => {
        const p = s.players[seat];
        return el('li', {}, dot(seat), ` ${COLOUR_NAMES[seat]}: ${p.points} points, ${p.visitedContinents.length} continents, ${p.visitedAreas.length} areas`);
      })),
      button('Play again', renderSetup));
    return box;
  }

  if (isRobot) {
    box.append(el('h2', {}, who, ' is thinking… 🤖'));
    return box;
  }

  if (s.phase === 'chooseProfile') {
    box.append(el('h2', {}, who, ', choose your traveller'),
      el('div', { className: 'row' }, ...actions.map((a) =>
        button(a.type === 'chooseProfile' ? PROFILE_LABEL[a.profile] : '', () => act(a)))));
  } else if (s.phase === 'chooseStart') {
    box.append(el('h2', {}, who, ', choose where your journey starts'),
      el('p', { className: 'small', textContent: 'Each player starts on a different continent. Welcome bonus: Europe, Asia, Africa +3 · Americas +4 · Oceania +5.' }),
      el('p', { className: 'small', textContent: 'Tap a green area on the map below.' }));
  } else if (s.quiz) {
    renderQuiz(box, s, who);
  } else if (me.travel) {
    const trip = me.travel;
    const to = areaById.get(trip.to)!.name;
    const where = trip.kind === 'airport' ? 'in the air' : 'at sea';
    box.append(el('h2', {}, who, `, you are ${where} ${VEHICLE[trip.kind]} to ${to}`),
      el('p', { className: 'small', textContent: trip.turnsLeft > 0
        ? `${plural(trip.turnsLeft, 'travel turn')} left; you land at the end of the last one.`
        : `${to} is taken, so you wait one more turn and try to land again.` }),
      el('p', { className: 'small', textContent: me.profile === 'nomad' ? '💻 Digital Nomad: +1 for this travel turn.' : 'Challenges and event cards come later.' }),
      el('div', { className: 'row' }, button('Continue the journey', () => act({ type: 'travel' }))));
  } else {
    const here = areaById.get(me.area!)!;
    box.append(el('h2', {}, who, `, you are in ${here.name}`), el('p', { className: 'small', textContent: travelNote(me) }));
    const row = el('div', { className: 'row' });
    for (const a of actions) {
      if (a.type === 'walk') {
        const to = areaById.get(a.to)!;
        row.append(button(`🚶 ${to.name}${gainLabel(s, a, to)}`, () => act(a)));
      } else if (a.type === 'board') {
        row.append(button(`${VEHICLE[a.kind]} Pay ${TICKET_PRICE[me.profile!]} → ${areaById.get(a.to)!.name}`, () => act(a)));
      } else if (a.type === 'quiz') {
        row.append(button(`${VEHICLE[a.kind]} Quiz for a free ticket → ${areaById.get(a.to)!.name}`, () => act(a)));
      } else if (a.type === 'blocked') {
        row.append(button('⛔ All neighbours are taken — wait this turn', () => act(a)));
      }
    }
    box.append(row,
      el('p', { className: 'small', textContent: 'New area +1 · new continent +2 · ⭐ wonder +1 more · 🧩 big country: 0 until every part is visited, then +1 + number of parts.' }),
      renderBigCountries(me));
  }
  return box;
}

// Points this move would give, found by trying it on a copy of the state.
function gainLabel(s: GameState, action: Action, to: Area): string {
  const before = currentPlayer(s).points;
  const after = apply(s, map30, action).players[currentPlayer(s).seat].points;
  const gain = after - before;
  if (gain > 0) return ` ✨ +${gain}`;
  const me = currentPlayer(s);
  return to.bigCountry && !me.visitedAreas.includes(to.id) ? ' 🧩' : '';
}

function renderBigCountries(me: GameState['players'][number]): HTMLElement {
  const names = [...new Set(map30.areas.flatMap((a) => (a.bigCountry ? [a.bigCountry] : [])))];
  const started = names.flatMap((c) => {
    const parts = map30.areas.filter((a) => a.bigCountry === c);
    const done = parts.filter((a) => me.visitedAreas.includes(a.id)).length;
    return done > 0 ? [`${c} ${done}/${parts.length}${done === parts.length ? ' ✅' : ''}`] : [];
  });
  return el('p', { className: 'small', textContent: started.length ? `🧩 Big countries: ${started.join(' · ')}` : '' });
}

// Airline quiz: one a/b question about the destination, 15 seconds. Time out = wrong answer.
function renderQuiz(box: HTMLElement, s: GameState, who: HTMLElement): void {
  const { question, to, kind } = s.quiz!;
  let left = QUIZ_SECONDS;
  const clock = el('p', { className: 'small', textContent: `⏱️ ${left} s` });
  box.append(el('h2', {}, who, `: Airline promotion — answer correctly and ${kind === 'airport' ? 'fly' : 'sail'} free to ${areaById.get(to)!.name}!`),
    el('p', { textContent: question.text }),
    el('div', { className: 'row' }, ...question.options.map((o, i) => button(o, () => act({ type: 'answer', choice: i as 0 | 1 })))),
    clock,
    el('p', { className: 'small', textContent: `Wrong answers here so far: ${currentPlayer(s).quizWrong}. A wrong answer uses this turn.` }));
  quizTimer = window.setInterval(() => {
    if (state !== s) return clearInterval(quizTimer);
    left -= 1;
    clock.textContent = `⏱️ ${left} s`;
    if (left <= 0) {
      clearInterval(quizTimer);
      act({ type: 'answer', choice: (1 - question.correct) as 0 | 1 });
    }
  }, 1000);
}

function travelNote(me: Player): string {
  const has = (kind: RouteKind) => (map30.routes ?? []).some((r) => r.kind === kind && (r.a === me.area || r.b === me.area));
  const price = TICKET_PRICE[me.profile!];
  const ticket = price === null ? 'you travel only with the quiz' : `ticket ${price}`;
  const notes = (['airport', 'port'] as const).filter(has).map((kind) => {
    const turns = TRAVEL_TURNS[me.profile!][kind];
    return `${VEHICLE[kind]} ${kind === 'airport' ? 'Plane' : 'Ship'}: ${ticket}, ${plural(turns, 'travel turn')}`;
  });
  const quiz = price === null
    ? 'The quiz is free; a wrong answer uses the turn, and you may try again on later turns.'
    : 'The quiz is free; a wrong answer uses the turn, and after 3 wrong answers you pay and go (if you can).';
  return notes.length ? `${notes.join(' · ')}. ${quiz}` : '';
}

function renderMap(s: GameState): HTMLElement {
  const me = currentPlayer(s);
  const legal = new Set(
    legalActions(s, map30).flatMap((a) => (a.type === 'chooseStart' ? [a.area] : a.type === 'walk' ? [a.to] : [])),
  );
  const humanTurn = s.phase !== 'finished' && me.kind === 'human';

  return el('section', { className: 'map' },
    ...continents.map((c) =>
      el('div', { className: 'continent' },
        el('h3', { textContent: c }),
        el('div', { className: 'areas' }, ...map30.areas.filter((a) => a.continent === c).map((a) => {
          const here = s.players.find((p) => p.area === a.id);
          const visitedBy = s.players.filter((p) => p.visitedAreas.includes(a.id));
          const canGo = humanTurn && legal.has(a.id);
          const tags = `${a.wonder ? '⭐' : ''}${a.bigCountry ? '🧩' : ''}${(map30.routes ?? []).some((r) => r.kind === 'airport' && (r.a === a.id || r.b === a.id)) ? '✈️' : ''}${(map30.routes ?? []).some((r) => r.kind === 'port' && (r.a === a.id || r.b === a.id)) ? '⛴️' : ''}`;
          const tile = el('div', { className: 'area' + (canGo ? ' legal' : '') + (here ? ' occupied' : ''), title: (a.countries ?? []).join(', ') },
            el('div', { className: 'name', textContent: `${a.name} ${tags}` }),
            el('div', { className: 'marks' }, ...visitedBy.map((p) => {
              const m = dot(p.seat);
              m.classList.add(p.area === a.id ? 'big' : 'faint');
              return m;
            })));
          if (here) tile.style.borderColor = COLOURS[here.seat];
          if (canGo) {
            const action = s.phase === 'chooseStart'
              ? { type: 'chooseStart' as const, area: a.id }
              : { type: 'walk' as const, to: a.id };
            tile.addEventListener('click', () => act(action));
          }
          return tile;
        })))));
}

renderSetup();
