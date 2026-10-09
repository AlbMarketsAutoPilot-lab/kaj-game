// The guide for new players (owner's script, 2026-10-09): about 5 minutes, one step at a time,
// and the player does each thing once (travel, cross Canada, buy, ask for citizenship, answer
// the game's own timed quiz). It starts by itself on the very first ▶ Play, can be skipped, and
// comes back with "📖 How to play". It is a practice board of its own: the saved game is never
// touched.

import { BUSINESS_PRICE, POINTS_BIG_COUNTRY_3_PARTS, VISA_PRICE } from '../engine/constants.ts';
import type { AreaGeo } from './maps.ts';
import { pad, squeeze, svg, unionBox } from './maps.ts';
import { airport, citizenFlag, pawn, place } from './props.ts';
import { play, stopTimer } from './sound.ts';

const DONE_KEY = 'kaj-guide-done';
export const guideSeen = () => { try { return localStorage.getItem(DONE_KEY) === '1'; } catch { return true; } };

type El = <K extends keyof HTMLElementTagNameMap>(tag: K, props?: Partial<HTMLElementTagNameMap[K]>, ...children: (Node | string)[]) => HTMLElementTagNameMap[K];

export interface GuideKit {
  app: HTMLElement;
  geo: Map<string, AreaGeo>;
  areaColour: Map<string, string>;
  el: El;
  button: (label: string, onClick: () => void) => HTMLButtonElement;
  // The country's flag picture, if there is one.
  flag: (country: string) => Node | '';
  // The game's own timed a/b question box (the airline quiz) and a way to stop its clock.
  question: (title: string, text: string, options: string[], correct: number, onAnswer: (i: number) => void, key: string, note: string) => HTMLElement[];
  stopClock: () => void;
}

// One step: its lines, an optional picture, and either ▶ Next or a thing to do.
interface Step {
  title: string;
  lines: string[];
  picture?: (done: () => void) => Node;
  // The step waits for the picture's action; `after` is shown once it is done.
  task?: boolean;
  after?: { title: string; lines: string[]; picture?: () => Node };
  cls?: string;
}

const START_POINTS = 10;
const PROTEST_LOSS = 2;
const ME = '#2e86de';

export function runGuide(kit: GuideKit, onDone: () => void): void {
  const { app, geo, areaColour, el, button } = kit;
  let points = START_POINTS;
  let index = 0;
  let solved = false;
  let bump = false;

  const finish = () => {
    kit.stopClock();
    try { localStorage.setItem(DONE_KEY, '1'); } catch { /* not kept */ }
    onDone();
  };
  const gain = (n: number) => { points += n; bump = true; };

  // A close view of a few areas, as in the game's country view. `cls` styles each area
  // ('here', 'go', 'far'), `onTap` makes one tappable, `props` adds drawn icons (x, y in view units).
  const view = (ids: string[], cls: (id: string) => string, onTap?: (id: string) => (() => void) | null,
    props?: (at: (id: string) => [number, number], size: number) => SVGElement[]): SVGSVGElement => {
    const box = pad(unionBox(ids.map((id) => geo.get(id)!.core)), 0.1, 1);
    const k = squeeze(box);
    const root = svg('svg', { viewBox: `${box.x * k} ${box.y} ${box.w * k} ${box.h}`, class: 'map-svg guide-map' });
    const g = svg('g', { transform: `scale(${k} 1)` });
    for (const id of ids) {
      const path = svg('path', { d: geo.get(id)!.path, class: `land ${cls(id)}` });
      path.style.fill = areaColour.get(id)!;
      const tap = onTap?.(id);
      if (tap) { path.classList.add('tap', 'guide-glow'); path.addEventListener('click', tap); }
      g.append(path);
    }
    root.append(g);
    const at = (id: string): [number, number] => { const [x, y] = geo.get(id)!.centre; return [x * k, y]; };
    if (props) root.append(...props(at, Math.min(box.w * k, box.h) * 0.3));
    return root;
  };

  // Two neighbours: France (you are here) and Spain & Portugal (tap it to travel).
  const firstTrip = (done: () => void): Node => el('div', {},
    view(['france', 'iberia'], (id) => (id === 'france' ? 'here' : 'go'),
      (id) => (id === 'iberia' ? () => { play('walk'); gain(1); done(); } : null)),
    el('p', { className: 'small', textContent: '🇫🇷 You are in France · tap 🇪🇸 Spain & Portugal' }));

  // Canada in three parts: start in the West, walk to Central, then East.
  const CANADA = ['canada-west', 'canada-central', 'canada-east'];
  const crossCanada = (done: () => void): Node => {
    let at = 0;
    const box = el('div', {});
    const draw = () => {
      const next = CANADA[at + 1];
      box.replaceChildren(
        view(CANADA, (id) => (id === CANADA[at] ? 'here' : CANADA.indexOf(id) < at ? 'picked' : id === next ? 'go' : 'far'),
          (id) => (id === next ? () => { play('walk'); at++; if (at === CANADA.length - 1) { gain(POINTS_BIG_COUNTRY_3_PARTS); done(); } else draw(); } : null),
          (pos, size) => [place(pawn(ME, true), ...pos(CANADA[at]), size * 0.5, 'You')]),
        el('p', { className: 'small', textContent: `🇨🇦 Canada: ${at + 1} of 3 parts · tap the glowing part` }));
    };
    draw();
    return box;
  };

  // UK & Ireland with its drawn airport; after buying, the airport carries your pennant.
  const airportView = (owned: boolean, onTap?: () => void): SVGSVGElement =>
    view(['uk-ireland'], () => 'here', undefined, (pos, size) => [place(airport(owned ? ME : undefined), ...pos('uk-ireland'), size, 'Airport', onTap)]);
  const buyAirline = (done: () => void): Node => {
    const buy = button(`✈️ Buy the airline (${BUSINESS_PRICE.airline} points)`, () => { play('coins'); gain(-BUSINESS_PRICE.airline); done(); });
    buy.className = 'primary guide-glow';
    return el('div', {}, airportView(false),
      el('p', { className: 'small', textContent: '🇬🇧 UK & Ireland: its airport flies to the Arabian Peninsula' }),
      el('div', { className: 'row' }, buy));
  };

  const askCitizenship = (done: () => void): Node => {
    const ask = button('🛂 Ask for citizenship of France…', () => { play('citizenship'); done(); });
    ask.className = 'primary guide-glow';
    return el('div', {}, view(['france'], () => 'here'), el('div', { className: 'row' }, ask));
  };
  const citizenView = (): Node => el('div', {},
    view(['france'], () => 'here', undefined, (pos, size) => [place(citizenFlag(ME), ...pos('france'), size * 0.8, 'Your citizenship')]),
    el('p', { className: 'guide-badge' }, kit.flag('France'), ` 🛂 Visa to enter France: ${VISA_PRICE} points → you`));

  // A country already visited: your pawn is there, and going back gives nothing.
  const revisitView = (): Node => el('div', {},
    view(['france', 'iberia'], (id) => (id === 'iberia' ? 'here' : 'picked'), undefined,
      (pos, size) => [place(pawn(ME, true), ...pos('iberia'), size * 0.45, 'You'),
        svg('text', { x: pos('france')[0], y: pos('france')[1], class: 'guide-zero', 'font-size': size * 0.35, 'text-anchor': 'middle' }, '✔ +0')]),
    el('p', { className: 'small', textContent: '🇫🇷 France: already visited ✔ · going back = 0 points and a lost turn' }));

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

  // "Try one": the game's own airline quiz, with its 15-second clock.
  let tries = 0;
  const quiz = (done: () => void): Node => {
    const box = el('div', {});
    const start = () => {
      tries++;
      box.replaceChildren(el('section', { className: 'card turn guide-quiz' },
        ...kit.question('✈️ Airline promotion — answer correctly and fly free to the Arabian Peninsula!',
          'What is the capital of France?', ['Rome', 'Paris'], 1,
          (i) => {
            kit.stopClock();
            if (i === 1) { play('right'); gain(1); done(); return; }
            play('wrong');
            const again = button('Try again', start);
            again.className = 'primary';
            box.replaceChildren(el('div', { className: 'modal card wrong guide-inline' },
              el('h2', { textContent: '❌ Wrong answer' }), el('p', { textContent: 'The answer is: Paris. In the game a wrong answer uses your turn. Here, try again!' }),
              el('div', { className: 'row' }, again)));
          },
          `guide-quiz-${tries}`, 'A wrong answer (or no answer in time) uses this turn.')));
    };
    const tryOne = button('✈️ Try one', start);
    tryOne.className = 'primary guide-glow';
    box.append(el('div', { className: 'row' }, tryOne));
    return box;
  };

  const steps: Step[] = [
    { title: '🌍 Welcome, traveller!', task: true, picture: firstTrip,
      lines: ['The idea is simple: travel the world and collect points. But your turns are limited, so make every move count.', "Let's take your first trip!"],
      after: { title: '🎉 Your first trip!', lines: ['Every new country you visit gives you +1 point.', 'Your points are at the top. They are also your money: you pay tickets and fees with them.'] } },
    { title: '💡 More points, the easy way', lines: ['Reach a new continent: +2 points.'] },
    { title: '💡 More points, the easy way', lines: ['Countries with a famous wonder 🏛️ give +1 extra.'] },
    { title: '💡 Big countries, big bonus', task: true, picture: crossCanada,
      lines: ['Big countries like Canada and Russia come in parts. Visit every part for a big bonus.', 'Try it: cross Canada!'],
      after: { title: `🎉 All of Canada! +${POINTS_BIG_COUNTRY_3_PARTS}`, lines: [`You visited all 3 parts of Canada: +${POINTS_BIG_COUNTRY_3_PARTS} points.`] } },
    { title: '💡 More points, the easy way', lines: ['Your traveller profile has its own bonuses. You will see them when you pick it.'] },
    { title: '💼 Own a business', task: true, picture: buyAirline,
      lines: ['Want more? Own a business, and the other players pay you:', '✈️ an airline at an airport · ⚓ a ferry agency at a port · 🏛️ guided tours at a wonder.', 'Try it: buy the airline at this airport.'],
      after: { title: '🎉 You own the airline of UK & Ireland!', picture: () => airportView(true),
        lines: ['Your flag now flies over the airport. Every time another player flies from UK & Ireland, the ticket money goes to you.'] } },
    { title: '🛂 Citizenship', task: true, picture: askCitizenship,
      lines: ['One more trick: become a citizen of one country. Try it!'],
      after: { title: '🎉 Citizenship granted!', picture: citizenView,
        lines: [`Now every other player pays you a ${VISA_PRICE}-point visa to enter France.`, 'Choose a country that people pass through a lot. Choose wisely!'] } },
    { title: '🤔 Sounds too easy?', lines: ['Here is the catch: everything you can own, the other players can own too.', 'Then you pay: tickets, tour fees, visas. Be smart about where you go!'] },
    { title: '⏳ Don\'t waste turns', picture: revisitView, lines: ['Going back to a country you already visited gives 0 points, and the turn is gone.', 'Your turns are limited!'] },
    { title: '🔔 Things happen on the road', task: true, picture: protest, cls: 'event',
      lines: ['Some event cards bring points, some take them away. It happens to everyone!'],
      after: { title: '🤷 That\'s travel!', lines: ['Bad luck happens. Keep going, there are many ways to earn points back.'] } },
    { title: '🧠 Use your head', task: true, picture: quiz,
      lines: ['Short on points? An airline may give you a free ticket for a right answer: you have 15 seconds.', 'On long trips, other passengers may challenge you too: +1 if you are right.'],
      after: { title: '✅ Right!', lines: ['Free ticket! If only real life worked like that!'] } },
    { title: '🏁 You are ready!', lines: ['That is all you need. The rest you will learn by playing.', 'Have a great journey! 🌍'] },
  ];

  const draw = () => {
    stopTimer();
    const step = steps[index];
    const last = index === steps.length - 1;
    const next = () => { index++; solved = false; draw(); };
    const pts = el('div', { className: `guide-points${bump ? ' bump' : ''}`, textContent: `💰 ${points} points` });
    bump = false;
    const after = step.task && solved ? step.after : undefined;
    const body = after
      ? [el('h2', { className: 'big-title', textContent: after.title }), ...after.lines.map((t) => el('p', { textContent: t })), after.picture ? after.picture() : '']
      : [el('h2', { textContent: step.title }), ...step.lines.map((t) => el('p', { textContent: t })),
        step.picture ? step.picture(() => { solved = true; draw(); }) : ''];
    const go = button(last ? '▶ Start my first game' : 'Next ▶', last ? finish : next);
    go.className = 'primary';
    const skip = button('Skip guide', finish);
    const waiting = step.task && !solved;
    app.replaceChildren(el('div', { className: 'modal-back' },
      el('div', { className: `modal card guide ${after ? 'gold' : step.cls ?? ''}` },
        el('div', { className: 'guide-top' }, pts, el('span', { className: 'small', textContent: `${index + 1} / ${steps.length}` })),
        ...body,
        el('div', { className: 'row' }, waiting ? '' : go, last ? '' : skip))));
  };
  draw();
}
