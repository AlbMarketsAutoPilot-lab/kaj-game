// First playable screen (task 3): a plain test board on top of the engine.
// No final art yet. Robots pick random legal moves.

import { apply, createGame, currentPlayer, legalActions } from '../engine/engine.ts';
import { randomRobotAction } from '../engine/robot.ts';
import type { Action, Area, GameState, Profile, SeatKind } from '../engine/types.ts';
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

const app = document.getElementById('app')!;
const areaById = new Map(map30.areas.map((a) => [a.id, a]));
const continents = [...new Set(map30.areas.map((a) => a.continent))];

let state: GameState | null = null;
let robotSeed = 1;
let robotTimer = 0;

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
      el('p', { textContent: 'Test board — 30 rounds on the 30-turn map. Walking only for now.' }),
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
      const area = p.area ? areaById.get(p.area)!.name : '—';
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
  } else {
    const here = areaById.get(me.area!)!;
    box.append(el('h2', {}, who, `, you are in ${here.name}`), el('p', { className: 'small', textContent: travelNote(here) }));
    const row = el('div', { className: 'row' });
    for (const a of actions) {
      if (a.type === 'walk') {
        const to = areaById.get(a.to)!;
        const isNew = !me.visitedAreas.includes(to.id);
        row.append(button(`🚶 ${to.name}${isNew ? ' ✨' : ''}`, () => act(a)));
      } else if (a.type === 'blocked') {
        row.append(button('⛔ All neighbours are taken — wait this turn', () => act(a)));
      }
    }
    box.append(row, el('p', { className: 'small', textContent: '✨ = new area (+1). A new continent gives +2 more.' }));
  }
  return box;
}

function travelNote(area: Area): string {
  const out: string[] = [];
  for (const r of map30.routes ?? []) {
    const to = r.a === area.id ? r.b : r.b === area.id ? r.a : null;
    if (to) out.push(`${r.kind === 'airport' ? '✈️' : '⛴️'} ${areaById.get(to)!.name}`);
  }
  return out.length ? `Travel from here (coming soon): ${out.join(' · ')}` : '';
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
          const tags = `${a.wonder ? '⭐' : ''}${(map30.routes ?? []).some((r) => r.kind === 'airport' && (r.a === a.id || r.b === a.id)) ? '✈️' : ''}${(map30.routes ?? []).some((r) => r.kind === 'port' && (r.a === a.id || r.b === a.id)) ? '⛴️' : ''}`;
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
