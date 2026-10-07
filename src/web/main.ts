// First playable screen (task 3): a plain test board on top of the engine.
// No final art yet. Robots pick random legal moves.

import { POINTS_BUSINESS_CITIZENSHIP, TICKET_PRICE, TRAVEL_TURNS, VISA_PRICE } from '../engine/constants.ts';
import { apply, createGame, currentPlayer, legalActions, visaOwner } from '../engine/engine.ts';
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
// Citizenship test: 15 seconds for each question (owner's choice, task 8).
const EXAM_SECONDS = 15;
const VEHICLE: Record<RouteKind, string> = { airport: '✈️', port: '⛴️' };

const app = document.getElementById('app')!;
const areaById = new Map(map30.areas.map((a) => [a.id, a]));
const continents = [...new Set(map30.areas.map((a) => a.continent))];

let state: GameState | null = null;
let robotSeed = 1;
let robotTimer = 0;
let quizTimer = 0;
// "Ask for citizenship where I arrive" (the tick box on the move panel).
let askCitizenship = false;
// A short message about the last move (e.g. "request approved"), shown on the next screen.
let note = '';
// A move into a visa area, waiting for the player to confirm the 2-point visa.
let pendingVisa: Action | null = null;

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
  const mover = currentPlayer(state);
  const name = COLOUR_NAMES[mover.seat];
  const examBefore = mover.exam;
  const trip = mover.travel;
  const owner = action.type === 'walk' ? visaOwner(state, mover, mover.area, action.to) : null;
  state = apply(state, map30, action);
  const after = state.players[mover.seat];
  const landed = trip?.visa && !after.travel ? state.players.find((p) => p.seat !== mover.seat && p.citizenship?.includes(trip.to)) : null;
  const paidTo = owner ?? landed ?? null;
  if (!examBefore && after.exam) {
    const where = areaById.get(after.exam.area)!.name;
    note = after.exam.stage === 'submitted'
      ? `💎 ${name}: your citizenship request for ${where} is accepted. Citizenship will be granted next turn!`
      : `🛂 ${name}: your citizenship request for ${where} has been approved! Next turn: the citizenship test, ${after.exam.questions.length} questions, ${EXAM_SECONDS} seconds each. No looking things up!`;
  } else if (paidTo) {
    note = `🛂 ${name} paid a ${VISA_PRICE}-point visa to ${COLOUR_NAMES[paidTo.seat]} to enter ${areaById.get(after.area!)!.name}.`;
  } else {
    note = '';
  }
  askCitizenship = false;
  pendingVisa = null;
  render();
}

// Moves into a visa area ask first: "entering costs a 2-point visa".
function go(action: Action): void {
  const s = state!;
  if ('to' in action && visaOwner(s, currentPlayer(s), currentPlayer(s).area, action.to)) {
    pendingVisa = action;
    render();
  } else {
    act(action);
  }
}

// The move to make for a button: with the citizenship request if it is ticked and offered.
function pick(actions: Action[], plain: Action): Action {
  if (!askCitizenship) return plain;
  const key = JSON.stringify({ ...plain, citizenship: true });
  return actions.find((a) => JSON.stringify(a) === key) ?? plain;
}

const asksOffered = (actions: Action[]) => actions.filter((a) => 'citizenship' in a && a.citizenship);
const plainActions = (actions: Action[]) => actions.filter((a) => !('citizenship' in a && a.citizenship));

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
        el('div', { className: 'small', textContent: p.citizenship
          ? `🛂 Citizen of ${citizenshipName(p.citizenship)}`
          : p.exam ? `🛂 Asking for citizenship in ${areaById.get(p.exam.area)!.name}` : '' }),
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

  if (note) box.append(el('p', { className: 'note', textContent: note }));
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
  } else if (me.exam && (me.exam.stage === 'test' || me.exam.stage === 'result')) {
    renderCitizenship(box, s, who);
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
    if (pendingVisa && 'to' in pendingVisa) {
      const a = pendingVisa;
      const owner = visaOwner(s, me, me.area, a.to)!;
      const where = areaById.get(a.to)!.name;
      const when = a.type === 'walk' ? 'Entering it costs' : 'You will pay on landing';
      box.append(el('h2', {}, who, `: ${where} needs a visa 🛂`),
        el('p', { textContent: `${where} is ${COLOUR_NAMES[owner.seat]}'s citizenship. ${when} a ${VISA_PRICE}-point visa, paid to ${COLOUR_NAMES[owner.seat]}.` }),
        el('div', { className: 'row' },
          button(a.type === 'walk' ? `Pay ${VISA_PRICE} and enter` : 'Go anyway', () => act(a)),
          button('Cancel', () => { pendingVisa = null; render(); })));
      return box;
    }
    if (me.exam?.stage === 'granted') {
      box.append(el('p', { className: 'note', textContent: `🎉 Citizenship granted! Welcome, citizen of ${citizenshipName(me.citizenship!)}! Every other player now pays you a ${VISA_PRICE}-point visa to enter.${me.profile === 'business' ? ` 💼 Business Traveler: +${POINTS_BUSINESS_CITIZENSHIP} points.` : ''} You may travel on.` }));
    } else if (me.exam?.stage === 'learning') {
      const exam = me.exam;
      box.append(el('div', { className: 'note' },
        el('p', { textContent: 'These are the right answers. Learn them! 📖' }),
        el('ol', {}, ...exam.questions.map((q, i) => {
          const mine = exam.answers[i];
          return el('li', {}, `${q.text} ✅ ${q.options[q.correct]}`, mine === q.correct ? '' : ` (you said: ${q.options[mine]})`);
        })),
        el('p', { textContent: `🎉 Your citizenship of ${citizenshipName(me.citizenship!)} is now granted! You may travel on.${me.profile === 'business' ? ` 💼 +${POINTS_BUSINESS_CITIZENSHIP} points.` : ''}` })));
    }
    box.append(el('h2', {}, who, `, you are in ${here.name}`), el('p', { className: 'small', textContent: travelNote(me) }));
    const offered = asksOffered(actions);
    if (offered.length > 0) {
      const tick = el('input', { type: 'checkbox', checked: askCitizenship });
      tick.addEventListener('change', () => { askCitizenship = tick.checked; render(); });
      box.append(el('label', { className: 'ask' }, tick,
        ' 🛂 Ask for citizenship where I arrive — you can ask only once per game. Moves marked 🛂 allow it.'));
    }
    const canAsk = (a: Action) => offered.some((o) => 'to' in o && 'to' in a && o.type === a.type && o.to === a.to
      && (!('kind' in a) || ('kind' in o && o.kind === a.kind)));
    const row = el('div', { className: 'row' });
    for (const a of plainActions(actions)) {
      const mark = canAsk(a) ? ' 🛂' : '';
      if (a.type === 'walk') {
        const to = areaById.get(a.to)!;
        row.append(button(`🚶 ${to.name}${gainLabel(s, a, to)}${visaLabel(s, a.to)}${mark}`, () => go(pick(actions, a))));
      } else if (a.type === 'board') {
        row.append(button(`${VEHICLE[a.kind]} Pay ${TICKET_PRICE[me.profile!]} → ${areaById.get(a.to)!.name}${visaLabel(s, a.to)}${mark}`, () => go(pick(actions, a))));
      } else if (a.type === 'quiz') {
        row.append(button(`${VEHICLE[a.kind]} Quiz for a free ticket → ${areaById.get(a.to)!.name}${visaLabel(s, a.to)}${mark}`, () => go(pick(actions, a))));
      } else if (a.type === 'blocked') {
        row.append(button('⛔ No area you can enter — wait this turn', () => act(a)));
      }
    }
    box.append(row,
      el('p', { className: 'small', textContent: 'New area +1 · new continent +2 · ⭐ wonder +1 more · 🧩 big country: 0 until every part is visited, then +1 + number of parts.' }),
      renderBigCountries(me));
  }
  return box;
}

// Points this move would give, found by trying it on a copy of the state (visa not included).
function gainLabel(s: GameState, action: Action, to: Area): string {
  const before = currentPlayer(s).points;
  const after = apply(s, map30, action).players[currentPlayer(s).seat].points;
  const gain = after - before + (visaOwner(s, currentPlayer(s), currentPlayer(s).area, to.id) ? VISA_PRICE : 0);
  if (gain > 0) return ` ✨ +${gain}`;
  const me = currentPlayer(s);
  return to.bigCountry && !me.visitedAreas.includes(to.id) ? ' 🧩' : '';
}

function visaLabel(s: GameState, to: string): string {
  const owner = visaOwner(s, currentPlayer(s), currentPlayer(s).area, to);
  return owner ? ` 🛂 visa −${VISA_PRICE} to ${COLOUR_NAMES[owner.seat]}` : '';
}

function citizenshipName(areas: string[]): string {
  const first = areaById.get(areas[0])!;
  return areas.length > 1 && first.bigCountry ? first.bigCountry : first.name;
}

// The citizenship turns when the player stays (owner's timeline, docs/engine.md task 8):
// the test (turn 2) and, after a wrong answer, the learning turn (turn 3).
// "Granted" and "the right answers" are shown above the moves (renderTurn).
function renderCitizenship(box: HTMLElement, s: GameState, who: HTMLElement): void {
  const exam = currentPlayer(s).exam!;
  if (exam.stage === 'test') {
    renderExamQuestion(box, s, who);
  } else {
    box.append(el('h2', {}, who, ': you did not pass the citizenship test this time.'),
      el('p', { textContent: 'You will spend one more turn learning the right answers. Then citizenship is yours.' }),
      el('div', { className: 'row' }, button('Continue', () => act({ type: 'exam' }))));
  }
}

// One test question, 15 seconds. Time out = wrong answer.
function renderExamQuestion(box: HTMLElement, s: GameState, who: HTMLElement): void {
  const exam = currentPlayer(s).exam!;
  const n = exam.answers.length;
  const q = exam.questions[n];
  let left = EXAM_SECONDS;
  const clock = el('p', { className: 'small', textContent: `⏱️ ${left} s` });
  box.append(el('h2', {}, who, `: citizenship test for ${areaById.get(exam.area)!.name} — question ${n + 1} of ${exam.questions.length}`),
    el('p', { textContent: q.text }),
    el('div', { className: 'row' }, ...q.options.map((o, i) => button(o, () => act({ type: 'examAnswer', choice: i as 0 | 1 })))),
    clock);
  quizTimer = window.setInterval(() => {
    if (state !== s) return clearInterval(quizTimer);
    left -= 1;
    clock.textContent = `⏱️ ${left} s`;
    if (left <= 0) {
      clearInterval(quizTimer);
      act({ type: 'examAnswer', choice: (1 - q.correct) as 0 | 1 });
    }
  }, 1000);
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
          const citizen = s.players.find((p) => p.citizenship?.includes(a.id));
          const tile = el('div', { className: 'area' + (canGo ? ' legal' : '') + (here ? ' occupied' : ''), title: (a.countries ?? []).join(', ') },
            el('div', { className: 'name' }, `${a.name} ${tags}`, ...(citizen ? [' 🛂', dot(citizen.seat)] : [])),
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
            tile.addEventListener('click', () => (s.phase === 'chooseStart' ? act(action) : go(pick(legalActions(s, map30), action))));
          }
          return tile;
        })))));
}

renderSetup();
