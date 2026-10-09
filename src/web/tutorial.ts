// The guide for new players (owner's script, 2026-10-09): about 4 minutes, one step at a time,
// and the player does each thing once (travel, buy, ask for citizenship, answer). It starts by
// itself on the very first ▶ Play, can be skipped, and comes back with "📖 How to play". It is a
// practice board of its own: the saved game is never touched.

import { BUSINESS_PRICE, VISA_PRICE } from '../engine/constants.ts';
import type { AreaGeo } from './maps.ts';
import { pad, squeeze, svg, unionBox } from './maps.ts';
import { airport, place } from './props.ts';
import { play } from './sound.ts';

const DONE_KEY = 'kaj-guide-done';
export const guideSeen = () => { try { return localStorage.getItem(DONE_KEY) === '1'; } catch { return true; } };

type El = <K extends keyof HTMLElementTagNameMap>(tag: K, props?: Partial<HTMLElementTagNameMap[K]>, ...children: (Node | string)[]) => HTMLElementTagNameMap[K];

export interface GuideKit {
  app: HTMLElement;
  geo: Map<string, AreaGeo>;
  areaColour: Map<string, string>;
  el: El;
  button: (label: string, onClick: () => void) => HTMLButtonElement;
}

// One step: its lines, an optional picture, and either ▶ Next or a thing to do.
interface Step {
  title?: string;
  lines: string[];
  picture?: (done: () => void) => Node;
  // The step waits for the picture's action; `after` is shown once it is done.
  task?: boolean;
  after?: { title: string; lines: string[] };
  cls?: string;
}

const START_POINTS = 10;
const PROTEST_LOSS = 2;

export function runGuide(kit: GuideKit, onDone: () => void): void {
  const { app, geo, areaColour, el, button } = kit;
  let points = START_POINTS;
  let index = 0;
  let solved = false;
  let bump = false;

  const finish = () => {
    try { localStorage.setItem(DONE_KEY, '1'); } catch { /* not kept */ }
    onDone();
  };
  const gain = (n: number) => { points += n; bump = true; };

  // Two neighbours: France (you are here) and Spain & Portugal (tap it to travel).
  const firstTrip = (done: () => void): Node => {
    const box = pad(unionBox(['france', 'iberia'].map((id) => geo.get(id)!.core)), 0.08, 1);
    const k = squeeze(box);
    const root = svg('svg', { viewBox: `${box.x * k} ${box.y} ${box.w * k} ${box.h}`, class: 'map-svg guide-map' });
    const g = svg('g', { transform: `scale(${k} 1)` });
    for (const id of ['france', 'iberia']) {
      const path = svg('path', { d: geo.get(id)!.path, class: `land ${id === 'france' ? 'here' : 'go tap guide-glow'}` });
      path.style.fill = areaColour.get(id)!;
      if (id === 'iberia') path.addEventListener('click', () => { play('walk'); gain(1); done(); });
      g.append(path);
    }
    root.append(g);
    return el('div', {}, root, el('p', { className: 'small', textContent: '🇫🇷 You are in France · tap 🇪🇸 Spain & Portugal' }));
  };

  const buyAirline = (done: () => void): Node => {
    const pic = svg('svg', { viewBox: '-30 -30 60 50', class: 'guide-prop' });
    pic.append(place(airport(), 0, 0, 40, 'Airport'));
    const buy = button(`✈️ Buy the airline (${BUSINESS_PRICE.airline} points)`, () => { play('coins'); gain(-BUSINESS_PRICE.airline); done(); });
    buy.className = 'primary guide-glow';
    return el('div', {}, pic, el('div', { className: 'row' }, buy));
  };

  const askCitizenship = (done: () => void): Node => {
    const ask = button('🛂 Ask for citizenship of France…', () => { play('citizenship'); done(); });
    ask.className = 'primary guide-glow';
    return el('div', { className: 'row' }, ask);
  };

  const protest = (done: () => void): Node => {
    const go = button('Continue', () => { gain(-PROTEST_LOSS); done(); });
    go.className = 'primary';
    play('card-bad');
    return el('div', {},
      el('div', { className: 'event-card' },
        el('div', { className: 'event-rays' }),
        el('div', { className: 'event-deck', textContent: '🤷' }),
        el('div', { className: 'event-kind', textContent: 'Country event card' }),
        el('p', { className: 'event-text', textContent: '“A protest blocks the roads in the country you are visiting. Your plans fall apart.”' }),
        el('div', { className: 'event-badge bad', textContent: `−${PROTEST_LOSS} points` })),
      el('div', { className: 'row' }, go));
  };

  const quiz = (done: () => void): Node => {
    const note = el('p', { className: 'small' });
    const options = ['Rome', 'Paris', 'Madrid', 'Berlin'].map((o) => button(o, () => {
      if (o === 'Paris') { play('right'); gain(1); done(); } else { play('wrong'); note.textContent = '❌ Not quite. Try again!'; }
    }));
    return el('div', {}, el('p', {}, el('b', { textContent: 'What is the capital of France?' })), el('div', { className: 'row' }, ...options), note);
  };

  const steps: Step[] = [
    { title: '🌍 Welcome, traveller!', task: true, picture: firstTrip,
      lines: ['The idea is simple: travel the world and collect points. But your turns are limited, so make every move count.', "Let's take your first trip!"],
      after: { title: '🎉 Your first trip!', lines: ['Every new country you visit gives you +1 point.', 'Your points are at the top. They are also your money: you pay tickets and fees with them.'] } },
    { title: '💡 More points, the easy way', lines: ['Reach a new continent: +2 points.'] },
    { title: '💡 More points, the easy way', lines: ['Countries with a famous wonder 🏛️ give +1 extra.'] },
    { title: '💡 More points, the easy way', lines: ['Big countries like Canada and Russia come in parts. Visit them all for a big bonus: +5.'] },
    { title: '💡 More points, the easy way', lines: ['Your traveller profile has its own bonuses. You will see them when you pick it.'] },
    { title: '💼 Own a business', task: true, picture: buyAirline,
      lines: ['Want more? Own a business, and the other players pay you:', '✈️ an airline at an airport · ⚓ a ferry agency at a port · 🏛️ guided tours at a wonder.', 'Try it: buy the airline at this airport.'],
      after: { title: '🎉 You own an airline!', lines: ['Every time another player buys a plane ticket here, the money goes to you.'] } },
    { title: '🛂 Citizenship', task: true, picture: askCitizenship,
      lines: ['One more trick: become a citizen of one country. Try it!'],
      after: { title: '🎉 Citizenship granted!', lines: [`Now every other player pays you a ${VISA_PRICE}-point visa to enter France.`, 'Choose a country that people pass through a lot. Choose wisely!'] } },
    { title: '🤔 Sounds too easy?', lines: ['Here is the catch: everything you can own, the other players can own too.', 'Then you pay: tickets, tour fees, visas. Be smart about where you go!'] },
    { title: '⏳ Don\'t waste turns', lines: ['Going back to a country you already visited gives 0 points, and the turn is gone.', 'Your turns are limited!'] },
    { title: '🔔 Things happen on the road', task: true, picture: protest, cls: 'event',
      lines: ['Some event cards bring points, some take them away. It happens to everyone!'],
      after: { title: '🤷 That\'s travel!', lines: ['Bad luck happens. Keep going, there are many ways to earn points back.'] } },
    { title: '🧠 Use your head', task: true, picture: quiz,
      lines: ['Short on points? Answer a quiz question instead of paying for a ticket.', 'And on long trips, other passengers may challenge you to a geography question: +1 if you are right.', 'Try one:'],
      after: { title: '✅ Right!', lines: ['+1 point. If only real life worked like that!'] } },
    { title: '🏁 You are ready!', lines: ['That is all you need. The rest you will learn by playing.', 'Have a great journey! 🌍'] },
  ];

  const draw = () => {
    const step = steps[index];
    const last = index === steps.length - 1;
    const next = () => { index++; solved = false; draw(); };
    const pts = el('div', { className: `guide-points${bump ? ' bump' : ''}`, textContent: `💰 ${points} points` });
    bump = false;
    const showAfter = step.task && solved && step.after;
    const body = showAfter
      ? [el('h2', { className: 'big-title', textContent: step.after!.title }), ...step.after!.lines.map((t) => el('p', { textContent: t }))]
      : [step.title ? el('h2', { textContent: step.title }) : '', ...step.lines.map((t) => el('p', { textContent: t })),
        step.picture ? step.picture(() => { solved = true; draw(); }) : ''];
    const go = button(last ? '▶ Start my first game' : 'Next ▶', last ? finish : next);
    go.className = 'primary';
    const skip = button('Skip guide', finish);
    const waiting = step.task && !solved;
    app.replaceChildren(el('div', { className: 'modal-back' },
      el('div', { className: `modal card guide ${showAfter ? 'gold' : step.cls ?? ''}` },
        el('div', { className: 'guide-top' }, pts, el('span', { className: 'small', textContent: `${index + 1} / ${steps.length}` })),
        ...body,
        el('div', { className: 'row' }, waiting ? '' : go, last ? '' : skip))));
  };
  draw();
}
