// The guide for new players (owner's script, 2026-10-09): about 5 minutes, one step at a time,
// and the player does each thing once (travel, cross Canada, buy, take a visa test (step 2.11), answer
// the game's own timed quiz). Owner's new texts and order in M5 (11 slides). It starts by itself on the very first ▶ Play, can be skipped, and
// comes back with "📖 How to play". It is a practice board of its own: the saved game is never
// touched.

import { bigCountryPoints, BUSINESS_PRICE, FREE_TRAVEL_TURNS, MOST_BUSINESSES_BONUS, PAID_TRAVEL_TURNS, QUIZ_TRIES, VISA_TEST_FACTS, VISA_TEST_PASS, POINTS_BIG_COUNTRY_3_PARTS, POINTS_NEW_CONTINENT, POINTS_WONDER, VISA_PRICE } from '../engine/constants.ts';
import { batch1 } from '../facts/batch1.ts';
import type { AreaGeo } from './maps.ts';
import { glowFor, innerBorders, pad, squeeze, svg, unionBox } from './maps.ts';
import { airport, pawn, place } from './props.ts';
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
    // Step 2.12b: the parts of a big country (Canada) with dashed borders between them, as on the game's maps.
    g.append(innerBorders(geo, ids, (id) => areaColour.get(id)!, cls));
    root.append(g, glowFor(g));
    const at = (id: string): [number, number] => { const [x, y] = geo.get(id)!.centre; return [x * k, y]; };
    if (props) root.append(...props(at, Math.min(box.w * k, box.h) * 0.3));
    return root;
  };

  // A word on the map, readable on any colour.
  const tag = (x: number, y: number, size: number, text: string): SVGElement =>
    svg('text', { x, y, class: 'guide-tag', 'font-size': size, 'stroke-width': size * 0.22, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, text);
  // Two neighbours: France (you are here) and Iberia (tap it to travel). The very first slide, so
  // it says it all on the map (owner, M5): "You are here", and a hand on Iberia.
  const firstTrip = (done: () => void): Node => el('div', {},
    view(['france', 'iberia'], (id) => (id === 'france' ? 'here' : 'go'),
      (id) => (id === 'iberia' ? () => { play('walk'); gain(1); done(); } : null),
      (pos, size) => {
        const [fx, fy] = pos('france');
        const [ix, iy] = pos('iberia');
        return [place(pawn(ME, true), fx, fy, size * 0.55, 'You are here'), tag(fx, fy + size * 0.48, size * 0.26, 'You are here'),
          tag(ix, iy - size * 0.08, size * 0.5, '👆'), tag(ix, iy + size * 0.36, size * 0.24, 'Tap here to continue')];
      }),
    el('p', { className: 'small', textContent: '🇫🇷 You are in France · tap 🇪🇸 Iberia' }));

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
      el('p', { className: 'small', textContent: '🇬🇧 UK & Ireland: its airport flies to Iceland' }),
      el('div', { className: 'row' }, buy));
  };

  // Step 2.11 (owner): a real visa test for France, as in the game: read the facts, "I'm ready", then 3 questions,
  // each started with "Start" and timed. The next view says whether the player entered France.
  const FRANCE = batch1.france.slice(0, VISA_TEST_FACTS);
  const VISA_QUESTIONS = [0, 2, 4].map((i, k) => {
    const fact = FRANCE[i];
    const correct = k % 2 === 0 ? 1 : 0;
    return { text: fact.question, options: correct === 1 ? [fact.wrong, fact.right] : [fact.right, fact.wrong], correct };
  });
  let visaRight = 0;
  let visaTries = 0;
  const visaTest = (done: () => void): Node => {
    const box = el('div', {});
    visaTries++;
    let right = 0;
    const ask = (q: number) => {
      if (q === VISA_QUESTIONS.length) {
        visaRight = right;
        box.closest('.guide')?.classList.remove('quiz-on');
        if (right >= VISA_TEST_PASS) { play('coins'); gain(-VISA_PRICE); }
        done();
        return;
      }
      const go = button(`▶ Start question ${q + 1} of ${VISA_QUESTIONS.length}`, () => {
        const v = VISA_QUESTIONS[q];
        box.closest('.guide')?.classList.add('quiz-on'); // only the question now, as in the airline quiz
        box.replaceChildren(el('section', { className: 'card turn guide-quiz' },
          ...kit.question(`🛂 Visa test · France · question ${q + 1} of ${VISA_QUESTIONS.length}`, v.text, v.options, v.correct,
            (i) => { kit.stopClock(); if (i === v.correct) { right++; play('right'); } else play('wrong'); ask(q + 1); },
            `guide-visa-${visaTries}-${q}`, `${VISA_TEST_PASS} right answers of ${VISA_QUESTIONS.length} let you in.`)));
      });
      go.className = 'primary guide-glow';
      box.replaceChildren(el('p', { className: 'small', textContent: `🛂 Right answers so far: ${right}` }), el('div', { className: 'row' }, go));
    };
    const ready = button("✔ I'm ready", () => ask(0));
    ready.className = 'primary guide-glow';
    // First the slide's text and one button; then the facts take the text's place (as the airline quiz does).
    const take = button('🛂 Take the visa test', () => {
      box.closest('.guide')?.classList.add('quiz-on');
      box.replaceChildren(
        el('p', { className: 'small' }, kit.flag('France'), ` 🛂 Read these ${VISA_TEST_FACTS} facts about France. The questions come next.`),
        el('ul', { className: 'guide-facts' }, ...FRANCE.map((x) => el('li', { textContent: x.text }))),
        el('div', { className: 'row' }, ready));
    });
    take.className = 'primary guide-glow';
    box.append(el('div', { className: 'row' }, take));
    return box;
  };
  // After the test: inside France (passed) or still in Iberia (failed).
  const visaResult = (): Node => {
    const inside = visaRight >= VISA_TEST_PASS;
    return el('div', {},
      view(['france', 'iberia'], (id) => (id === (inside ? 'france' : 'iberia') ? 'here' : 'far'), undefined,
        (pos, size) => [place(pawn(ME, true), ...pos(inside ? 'france' : 'iberia'), size * 0.45, 'You')]),
      el('p', { className: 'small', textContent: inside ? `🇫🇷 In France · ${VISA_PRICE}-point visa paid to its citizen` : '🇪🇸 Still in Iberia · nothing paid' }));
  };

  // The three ways of a trip, side by side (step 2.11: the travel slides in three parts).
  const ways = (): Node => el('div', { className: 'guide-ways' },
    ...[['✈️', 'Plane', 'between airports'], ['⛴️', 'Ferry', 'between ports'], ['🚆', 'Train', 'France ↔ Russia or Turkey'],
      ['🚌', 'Bus', 'Mongolia → Russia or China'], ['🚗', 'Car', 'Mexico → USA or Canada']]
      .map(([icon, name, where]) => el('div', { className: 'guide-way' }, el('div', { className: 'guide-way-icon', textContent: icon }), el('strong', { textContent: name }), el('span', { className: 'small', textContent: where }))));
  const turns = (n: number) => (n === 0 ? 'arrives right away' : n === 1 ? '1 travel turn' : `${n} travel turns`);
  const payOrQuiz = (): Node => el('table', { className: 'guide-table' },
    el('tr', {}, el('th', { textContent: '' }), el('th', { textContent: '💰 Paid ticket' }), el('th', { textContent: '🧠 Free quiz' })),
    el('tr', {}, el('td', { textContent: '✈️ 🚆 🚌 Plane, train, bus' }), el('td', { textContent: turns(PAID_TRAVEL_TURNS.airport) }), el('td', { textContent: turns(FREE_TRAVEL_TURNS.airport) })),
    el('tr', {}, el('td', { textContent: '⛴️ Ship' }), el('td', { textContent: turns(PAID_TRAVEL_TURNS.port) }), el('td', { textContent: turns(FREE_TRAVEL_TURNS.port) })),
    el('tr', {}, el('td', { textContent: '🚗 Car (Mexico)' }), el('td', { textContent: turns(PAID_TRAVEL_TURNS.car) }), el('td', { textContent: 'no quiz' })));

  // A country already visited: your pawn is there, and going back gives nothing.
  const revisitView = (): Node => el('div', {},
    view(['france', 'iberia'], (id) => (id === 'iberia' ? 'here' : 'picked'), undefined,
      (pos, size) => [place(pawn(ME, true), ...pos('iberia'), size * 0.45, 'You'),
        svg('text', { x: pos('france')[0], y: pos('france')[1], class: 'guide-zero', 'font-size': size * 0.35, 'text-anchor': 'middle' }, '✔ +0')]),
    el('p', { className: 'small', textContent: '🇫🇷 France: already visited ✔ · going back = 0 points and a lost turn' }));

  const protest = (done: () => void): Node => {
    const go = button('Continue guide', () => { gain(-PROTEST_LOSS); done(); });
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
      box.closest('.guide')?.classList.add('quiz-on'); // only the question now (owner, M5)
      box.replaceChildren(el('section', { className: 'card turn guide-quiz' },
        ...kit.question('✈️ Airline promotion — answer correctly and fly free to Iceland!',
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

  // The owner's texts (M5). **…** is shown in bold.
  const steps: Step[] = [
    { title: '🌍 Welcome, traveller!', task: true, picture: firstTrip,
      lines: ['This is a **short guide (about 5 minutes) before your first game**. Nothing here counts: it\'s just practice.', '**KAJ is simple: the more you travel, the more points you collect!** But your turns are limited, so make every move count. When the last turn ends, the player with the **most points wins** (on equal points, **more businesses** wins).', "Let's take your first trip!"],
      after: { title: '🎉 Your first trip!', lines: ['Every **new area** you visit gives you **+1 point**.', 'You also **pay with your points** for faster travel (**planes, ferries, trains, buses and cars**) and for fees such as visas and guided tours at wonders.'] } },
    { title: '💡 More points, the easy way', lines: [`Reach a **new continent: +${POINTS_NEW_CONTINENT} points**.`, `Areas with a famous **wonder 🏛️ give +${POINTS_WONDER} extra**.`, `Visit **every part of a big country** like the USA or Canada: **+${bigCountryPoints(2)} or +${POINTS_BIG_COUNTRY_3_PARTS}**.`, 'Visit **every area of a continent: a big reward**, bigger for bigger continents.'] },
    { title: '💡 Big countries, big bonus', task: true, picture: crossCanada,
      lines: ['Big countries like Canada and Russia come in parts. Visit every part for a big bonus.', '**Cross Canada to continue the guide!**'],
      after: { title: `🎉 All of Canada! +${POINTS_BIG_COUNTRY_3_PARTS}`, lines: [`You visited all 3 parts of Canada: +${POINTS_BIG_COUNTRY_3_PARTS} points.`] } },
    // Step 2.11 (owner): the travel slide in three parts, with pictures; the profiles slide is gone (players see each
    // profile when they choose it).
    { title: '🚀 Travel faster (1/3): the ways to travel', picture: ways,
      lines: ['In KAJ you usually travel **on foot**: one neighbouring area per turn, for free.', 'To go further and faster, take a **plane, ferry, train, bus or car**.', 'Faster travel **costs points**… unless you\'re smart and **pay with your knowledge!**'] },
    { title: '🚀 Travel faster (2/3): the free quiz', task: true, picture: quiz,
      lines: ['**Short on points, or want to save them?** Planes, ferries, trains and buses give you a **free ticket if you pass their quiz**.', '**Try one now!**'],
      after: { title: '✅ Right!', lines: ['Free ticket! If only real life worked like that!', `In the game a **wrong answer uses your turn**. After **${QUIZ_TRIES} wrong answers** in the same place you must **pay**, or **go home** if you can\'t.`] } },
    { title: '🚀 Travel faster (3/3): pay or quiz?', picture: payOrQuiz,
      lines: ['**Paying is faster, the quiz is slower.**', '**In Mexico, rent a car 🚗** (no quiz) and get **all of the USA or all of Canada at once**. The Backpacker can\'t rent: it **tries to hitchhike** 👍.', 'On long trips, other passengers may **challenge you**: **+1** if you\'re right, **−1** if you\'re wrong.'] },
    { title: '💼 Own a business', task: true, picture: buyAirline,
      lines: ['Want more? Own a business, and the other players pay you:', `**Businesses decide close games:** each one counts its price at the end, owning **the most businesses gives +${MOST_BUSINESSES_BONUS}**, and on equal points **more businesses wins**.`, '✈️ an airline at an airport · ⚓ a ferry agency at a port · 🚆 a train ticket booth at a station · 🚌 a bus ticket booth at the bus stop · 🚗 a car rental in Mexico · 🏛️ guided tours at a wonder.', '**Buy the airline at this airport to continue the guide.**'],
      after: { title: '🎉 You own the airline of UK & Ireland!', picture: () => airportView(true),
        lines: ['Your flag now flies over the airport. Every time another player flies from UK & Ireland, the ticket money goes to you.'] } },
    // Step 2.11 (owner): clearer texts, and a real visa test instead of raising a flag.
    { title: '🛂 Citizenship and visas', task: true, picture: visaTest,
      lines: ['From the first turn, everyone is a **citizen of their home country** (except the Digital Nomad).', `To enter **another player\'s citizenship country** you need a **visa**: read ${VISA_TEST_FACTS} facts about the country, answer 3 questions, **${VISA_TEST_PASS} right** to pass, then pay the **${VISA_PRICE}-point visa** to its citizen.`, 'Let\'s try: **France belongs to another player.**'],
      after: {
        get title() { return visaRight >= VISA_TEST_PASS ? '🎉 Welcome to France!' : '⛔ No entry into France'; },
        get lines() {
          return [visaRight >= VISA_TEST_PASS
            ? `${visaRight} of 3 right: you passed the visa test, paid the ${VISA_PRICE}-point visa to France\'s citizen and entered France.`
            : `Only ${visaRight} of 3 right: no entry. Nothing is paid, you stay where you were, and the turn is used.`,
          'Your own home country works the same way: **other players pay you** to enter it.'];
        },
        picture: visaResult } },
    { title: '🤔 Sounds too easy?', lines: ['Here is the catch: **everything you can own, the other players can own too.**', '**Be smart about where you go and what you do!**'] },
    { title: '⏳ Don\'t waste turns', picture: revisitView, lines: ['Going back to an area you already visited gives 0 points, and the turn is gone.', 'Your turns are limited!'] },
    { title: '📱 Breaking news!', task: true, picture: protest, cls: 'event',
      lines: ['Every few turns your phone buzzes with news from the country you are in. Some news brings points, some takes them away. It happens to everyone!'],
      after: { title: '🤷 That\'s travel!', lines: ['Bad luck happens. Keep going, there are many ways to earn points back.'] } },
    { title: '🏁 You are ready!', lines: ['That is all you need. The rest you will learn by playing.', 'Have a great journey! 🌍'] },
  ];

  // A line of text: **bold** and *italic* parts (owner, M5: important things in bold).
  const line = (t: string): HTMLElement => el('p', { className: 'guide-line' }, ...t.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).filter(Boolean)
    .map((part) => (part.startsWith('**') ? el('strong', { textContent: part.slice(2, -2) }) : part.startsWith('*') ? el('em', { textContent: part.slice(1, -1) }) : part)));

  const draw = () => {
    stopTimer();
    const step = steps[index];
    const last = index === steps.length - 1;
    const next = () => { index++; solved = false; draw(); };
    const pts = el('div', { className: `guide-points${bump ? ' bump' : ''}`, textContent: `💰 ${points} points` });
    bump = false;
    const after = step.task && solved ? step.after : undefined;
    const text = after
      ? [el('h2', { className: 'big-title', textContent: after.title }), ...after.lines.map(line)]
      : [el('h2', { textContent: step.title }), ...step.lines.map(line)];
    const picture = after ? after.picture?.() : step.picture?.(() => { solved = true; draw(); });
    const go = button(last ? '▶ Start my first game' : 'Next ▶', last ? finish : next);
    go.className = 'primary';
    const skip = button('Skip guide', finish);
    const waiting = step.task && !solved;
    const buttons = el('div', { className: 'row' }, waiting ? '' : go, last ? '' : skip);
    // A map goes on the right half of the sideways screen, as big as the screen allows; the
    // text and buttons on the left (owner, 2026-10-10: the maps were too small on a phone).
    const map = picture instanceof Element && (picture.matches('.guide-map') || picture.querySelector('.guide-map'));
    const body = map
      ? [el('div', { className: 'guide-split' }, el('div', { className: 'guide-text' }, ...text, buttons), el('div', { className: 'guide-pic' }, picture))]
      : [...text, picture ?? '', buttons];
    app.replaceChildren(el('div', { className: 'modal-back' },
      el('div', { className: `modal card guide ${map ? 'split' : ''} ${after ? 'gold' : step.cls ?? ''}` },
        el('div', { className: 'guide-top' }, pts, el('span', { className: 'small', textContent: `${index + 1} / ${steps.length}` })),
        ...body)));
  };
  draw();
}
