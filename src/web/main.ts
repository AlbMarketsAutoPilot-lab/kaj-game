// The game screens on top of the engine. Task 14 A2: poster, setup, home-area picker, and the
// landscape board (left: the current area drawn; right: the world map and the turn panel).
// Robots play with simple rules, at the level chosen for each seat (task 13).

import { BUSINESS_PRICE, CHALLENGE_POINTS, CONTINENT_BONUS, GO_HOME_TURNS, NOMAD_MIN_CONTINENTS, NOMAD_PENALTY, NOMAD_WARNING_ROUND, POINTS_BUSINESS_CITIZENSHIP, QUIZ_TRIES, TICKET_PRICE, TOUR_FEE, TRAVEL_TURNS, VISA_PRICE } from '../engine/constants.ts';
import {
  apply, blockedByMoney, bookedBy, businessAt, canPayAfterQuiz, destinations, businessValue, createGame, currentPlayer, entryFees, feeTotal, finalScore, homeFor, landTurnsToCard, legalActions, nomadPenalty,
} from '../engine/engine.ts';
import { robotAction } from '../engine/normal-robot.ts';
import { loadGame, saveGame } from '../engine/save.ts';
import type { Action, Area, BusinessKind, ChallengeResult, ChallengeType, Continent, Deck, DrawnCard, GameState, Payment, Player, Profile, RobotLevel, RouteKind, SeatKind } from '../engine/types.ts';
import { map30 } from '../maps/map30.ts';
import { shapes30 } from '../maps/shapes30.ts';
import { buildGeo, continentBox, pad, squeeze, svg, unionBox, type Box } from './maps.ts';

const COLOURS = ['#e4572e', '#2e86de', '#29a36a', '#e0a100'];
const COLOUR_NAMES = ['Red', 'Blue', 'Green', 'Yellow'];
const PROFILE_LABEL: Record<Profile, string> = {
  backpacker: '🎒 Backpacker',
  business: '💼 Business Traveler',
  luxury: '💎 Luxury Traveler',
  nomad: '💻 Digital Nomad',
};
const ROBOT_DELAY_MS = 600;
const LEVEL_LABEL: Record<RobotLevel, string> = { easy: 'Easy', normal: 'Normal', hard: 'Hard' };
const SAVE_KEY = 'kaj-save';
const QUIZ_SECONDS = 15;
// Travel-turn challenges: 15 seconds, time out = wrong answer (v1 scope, section 6).
const CHALLENGE_SECONDS = 15;
const CHALLENGE_NAME: Record<ChallengeType, string> = {
  flag: '🏳️ Which flag?', bigger: '📏 Which is bigger?', capital: '🏙️ Which capital?',
  continent: '🌍 Which continent?', neighbour: '🤝 Neighbours', currency: '💰 Which currency?',
};
// Flag pictures (assets/flags), put into the page by the build as data URIs.
const FLAGS: Record<string, string> = (window as unknown as { KAJ_FLAGS?: Record<string, string> }).KAJ_FLAGS ?? {};
// The owner's poster, put into the page by the build as a data URI.
const POSTER: string = (window as unknown as { KAJ_POSTER?: string }).KAJ_POSTER ?? '';
// Credits for the open data and flags (shown on the start screen).
const CREDITS = 'Country data: mledoze/countries, ODbL 1.0 · Flags: flag-icons by Panayiotis Lipiridis, MIT licence · Map shapes: Natural Earth · Lettering: Cinzel, SIL Open Font Licence';
// Citizenship test: 15 seconds for each question (owner's choice, task 8).
const EXAM_SECONDS = 15;
const VEHICLE: Record<RouteKind, string> = { airport: '✈️', port: '⛴️' };
const BUSINESS_ICON: Record<BusinessKind, string> = { tours: '🏛️', airline: '✈️', ferry: '⛴️' };
const BUSINESS_NAME: Record<BusinessKind, string> = { tours: 'guided tours', airline: 'airline', ferry: 'ferry agency' };
const BUSINESS_EARNS: Record<BusinessKind, string> = {
  tours: `every other player pays you ${plural(TOUR_FEE, 'point')} to enter`,
  airline: 'every paid plane ticket from here goes to you',
  ferry: 'every paid ship ticket from here goes to you',
};

const app = document.getElementById('app')!;
const areaById = new Map(map30.areas.map((a) => [a.id, a]));
const continents = [...new Set(map30.areas.map((a) => a.continent))];
const geo = buildGeo(map30, shapes30);
const worldBox = unionBox([...geo.values()].map((g) => g.box));
const hasRoute = (id: string, kind: RouteKind) => (map30.routes ?? []).some((r) => r.kind === kind && (r.a === id || r.b === id));

let state: GameState | null = null;
let robotSeed = 1;
let robotTimer = 0;
let quizTimer = 0;
// "Ask for citizenship where I arrive" (the tick box on the move panel).
let askCitizenship = false;
// A short message about the last move (e.g. "request approved"), shown on the next screen.
let note = '';
// A move into an area with fees (visa, tour fee), waiting for the player to confirm.
let pendingFees: Action | null = null;
// The "sell a business" list is open on the move panel.
let selling = false;
// Choosing the home area: the continent zoomed into, and the area tapped (waiting for "Start here").
let zoom: Continent | null = null;
let pickedStart: string | null = null;
// The area tapped on the world map (its details show in the side panel), and the player card opened.
let detailArea: string | null = null;
let shownPlayer: number | null = null;

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

// The title, in the poster's lettering (Cinzel, see web/style.css).
function title(tag: 'h1' | 'strong' = 'h1'): HTMLElement {
  return el(tag, { className: 'title', textContent: "Kris Ann's Journey" });
}

// ---------- start screen: the owner's poster ----------

function renderStart(): void {
  clearTimeout(robotTimer);
  clearInterval(quizTimer);
  state = null;
  const saved = readSave();
  const play = button('▶ Play', renderSetup);
  play.className = 'primary big';
  const resume = saved && 'state' in saved
    ? button(`Continue (round ${saved.state.round} / ${saved.state.totalRounds})`, () => { state = saved.state; render(); })
    : null;
  app.replaceChildren(
    el('section', { className: 'poster' },
      POSTER ? el('img', { src: POSTER, alt: "Kris Ann's Journey" }) : title(),
      el('div', { className: 'poster-buttons' }, play, resume ?? '')),
  );
}

// ---------- setup screen ----------

function renderSetup(): void {
  clearTimeout(robotTimer);
  clearInterval(quizTimer);
  state = null;
  const kinds: SeatKind[] = ['human', 'robot', 'robot', 'robot'];
  const levels: RobotLevel[] = ['normal', 'normal', 'normal', 'normal'];
  let count = 2;

  const rows = el('div', { className: 'seats' });
  const counts = el('div', { className: 'row' });
  const error = el('p', { className: 'error' });
  const draw = () => {
    counts.replaceChildren('Players: ', ...[2, 3, 4].map((n) => {
      const b = button(String(n), () => { count = n; draw(); });
      if (n === count) b.className = 'chosen';
      return b;
    }));
    rows.replaceChildren(
      ...kinds.slice(0, count).map((kind, i) => {
        const select = el('select');
        for (const k of ['human', 'robot'] as const) {
          select.append(el('option', { value: k, textContent: k === 'human' ? '🙂 Person' : '🤖 Robot', selected: k === kind }));
        }
        select.addEventListener('change', () => { kinds[i] = select.value as SeatKind; draw(); });
        // Each robot seat has a level (owner's change, task 13).
        const level = el('select', { title: 'Robot level' });
        for (const l of ['easy', 'normal', 'hard'] as const) {
          level.append(el('option', { value: l, textContent: LEVEL_LABEL[l], selected: l === levels[i] }));
        }
        level.addEventListener('change', () => (levels[i] = level.value as RobotLevel));
        return el('div', { className: 'seat' }, dot(i), ` ${COLOUR_NAMES[i]} `, select, kind === 'robot' ? level : '');
      }),
    );
  };
  draw();

  const saved = readSave();
  const start = button('Start journey', () => {
    try {
      const seed = Math.floor(Math.random() * 2 ** 31);
      robotSeed = seed ^ 0x5bd1e995;
      const seats = kinds.slice(0, count).map((kind, i) => ({ kind, colour: COLOUR_NAMES[i], ...(kind === 'robot' ? { level: levels[i] } : {}) }));
      zoom = null;
      pickedStart = null;
      state = createGame({ seats, seed }, map30);
      render();
    } catch (e) {
      error.textContent = (e as Error).message;
    }
  });
  start.className = 'primary';

  app.replaceChildren(
    el('section', { className: 'card setup' },
      title(),
      el('p', { textContent: '30 rounds around the world: walk, fly and sail.' }),
      saved && 'error' in saved ? el('p', { className: 'small', textContent: `${saved.error} It can't be continued; start a new journey.` }) : '',
      counts, rows, start,
      saved && 'state' in saved ? el('p', { className: 'small', textContent: 'Starting a new journey replaces the saved game.' }) : '',
      error,
      el('div', { className: 'row' }, button('← Back', renderStart)),
      el('p', { className: 'small', textContent: CREDITS })),
  );
}

// ---------- automatic save (task 10) ----------

// Browser storage can be missing or blocked; the game then simply isn't saved.
function readSave(): ReturnType<typeof loadGame> | null {
  try {
    const text = localStorage.getItem(SAVE_KEY);
    return text === null ? null : loadGame(text);
  } catch {
    return null;
  }
}

// Saved after every move; a finished game is removed, so "Continue" never shows it.
function writeSave(s: GameState): void {
  try {
    if (s.phase === 'finished') localStorage.removeItem(SAVE_KEY);
    else localStorage.setItem(SAVE_KEY, saveGame(s));
  } catch {
    // not saved
  }
}

// ---------- game screen ----------

function act(action: Action): void {
  if (!state) return;
  const mover = currentPlayer(state);
  const name = COLOUR_NAMES[mover.seat];
  const examBefore = mover.exam;
  const home = action.type === 'goHome' ? homeFor(state, map30, mover) : null;
  // A 3rd wrong quiz answer: pay and travel, or go home (owner's rule, task 13).
  const quiz = state.quiz;
  const lastTry = action.type === 'answer' && quiz && action.choice !== quiz.question.correct && mover.quizWrong >= QUIZ_TRIES - 1
    ? { pays: canPayAfterQuiz(state, mover, quiz.to), home: homeFor(state, map30, mover) } : null;
  const offer = state.offer;
  state = apply(state, map30, action);
  const after = state.players[mover.seat];
  const lines: string[] = [];
  if (offer && action.type === 'sellAnswer' && !action.accept) {
    lines.push(`🙅 ${COLOUR_NAMES[offer.to]} said no to ${name}'s ${BUSINESS_NAME[offer.business]} in ${areaById.get(offer.area)!.name}.`);
  }
  if (!examBefore && after.exam) {
    const where = areaById.get(after.exam.area)!.name;
    lines.push(after.exam.stage === 'submitted'
      ? `💎 ${name}: your citizenship request for ${where} is accepted. Citizenship will be granted next turn!`
      : `🛂 ${name}: your citizenship request for ${where} has been approved! Next turn: the citizenship test, ${after.exam.questions.length} questions, ${EXAM_SECONDS} seconds each. No looking things up!`);
  }
  const bonus = mover.profile ? CONTINENT_BONUS[mover.profile] : undefined;
  if (bonus && mover.visitedContinents.length < bonus.continents && after.visitedContinents.length >= bonus.continents) {
    lines.push(`${PROFILE_LABEL[mover.profile!]} bonus: ${name} has visited ${bonus.continents} continents, +${bonus.points}!`);
  }
  if (home) lines.push(`🏠 ${name} ran out of money, so the trip ends here: ${name} goes home to ${areaById.get(home)!.name}, free of any fees.`);
  if (lastTry) {
    lines.push(lastTry.pays
      ? `❌ ${name}: ${QUIZ_TRIES} wrong answers here, so ${name} pays the ticket and travels.`
      : `❌ ${name}: ${QUIZ_TRIES} wrong answers here and no money for the ticket, so the trip ends here: ${name} goes home to ${areaById.get(lastTry.home)!.name}, free of any fees.`);
  }
  if (state.challenged) lines.push(challengeNote(state.challenged));
  lines.push(...state.payments.map(paymentNote).filter((t) => t !== ''));
  // Event cards drawn by this move; a human's own start-of-turn card has its own box instead.
  const next = currentPlayer(state);
  lines.push(...state.drawn.filter((c) => !(c === state!.card && next.kind === 'human' && c.seat === next.seat)).map(cardNote));
  note = lines.join(' ');
  askCitizenship = false;
  pendingFees = null;
  selling = false;
  zoom = null;
  pickedStart = null;
  render();
}

// ---------- event cards (task 11) ----------

const DECK_ICON: Record<Deck, string> = { country: '🗺️', backpacker: '🎒' };

// What the card did: the points really won or lost, or the lost turn.
function cardEffect(c: DrawnCard): string {
  const { points, loseTurn } = c.card;
  if (loseTurn) return '⏸️ This turn is lost.';
  if (points > 0) return `+${plural(points, 'point')}.`;
  if (c.change === 0) return `−${plural(-points, 'point')}, but there were no points to lose.`;
  if (c.change !== points) return `−${plural(-points, 'point')}: only ${-c.change} to lose, so ${-c.change} lost.`;
  return `−${plural(-points, 'point')}.`;
}

function cardNote(c: DrawnCard): string {
  return `🔔 ${COLOUR_NAMES[c.seat]}'s ${c.card.deck} card ${DECK_ICON[c.card.deck]}: “${c.card.text}” ${cardEffect(c)}`;
}

function renderCard(c: DrawnCard): HTMLElement {
  return el('div', { className: 'note' },
    el('strong', { textContent: `🔔 Event card · ${DECK_ICON[c.card.deck]} ${c.card.deck} card` }),
    el('p', { textContent: `“${c.card.text}”` }),
    el('p', { textContent: cardEffect(c) }));
}

// "Who was paid", after a move.
function paymentNote(p: Payment): string {
  const from = COLOUR_NAMES[p.from];
  const to = p.to === null ? '' : COLOUR_NAMES[p.to];
  const where = areaById.get(p.area)!.name;
  switch (p.reason) {
    case 'visa':
      return `🛂 ${from} paid a ${p.amount}-point visa to ${to} to enter ${where}.`;
    case 'tour':
      return `🏛️ ${from} paid a ${p.amount}-point tour fee to ${to}, owner of the guided tours in ${where}.`;
    case 'ticket': {
      const business = `${BUSINESS_ICON[p.business!]} ${BUSINESS_NAME[p.business!]} in ${where}`;
      if (p.to === null) return '';
      return p.to === p.from
        ? `${from}'s ${p.amount}-point ticket went to ${from}'s own ${business}.`
        : `${from}'s ${p.amount}-point ticket went to ${to}, owner of the ${business}.`;
    }
    case 'sale':
      return `🤝 ${from} bought ${to}'s ${BUSINESS_ICON[p.business!]} ${BUSINESS_NAME[p.business!]} in ${where} for ${plural(p.amount, 'point')}. It now earns for ${from}, and counts ${plural(p.amount, 'point')} at the end.`;
    case 'buy':
      return `${BUSINESS_ICON[p.business!]} ${from} bought the ${BUSINESS_NAME[p.business!]} in ${where} for ${plural(p.amount, 'point')}: ${BUSINESS_EARNS[p.business!].replace('you', from)}. It counts ${plural(p.amount, 'point')} at the end.`;
  }
}

// Moves into an area with fees ask first: "entering costs a 2-point visa / 1-point tour fee".
function go(action: Action): void {
  const s = state!;
  if ((action.type === 'walk' || action.type === 'board' || action.type === 'quiz')
    && entryFees(s, currentPlayer(s), currentPlayer(s).area, action.to).length > 0) {
    pendingFees = action;
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
  if (!state) return renderStart();
  const s = state;
  const me = currentPlayer(s);
  const actions = legalActions(s, map30);
  // During a sale offer the buyer answers, on the seller's turn.
  const actor = s.offer ? s.players[s.offer.to] : me;
  const isRobot = s.phase !== 'finished' && actor.kind === 'robot';
  writeSave(s);

  if (s.phase === 'chooseProfile') {
    app.replaceChildren(el('section', { className: 'card setup' }, title(), renderTurn(s, actions, isRobot)));
  } else {
    const header = el('header', {},
      title('strong'),
      el('span', { className: 'round', textContent: s.phase === 'play' || s.phase === 'finished' ? `Round ${s.round} / ${s.totalRounds}` : 'Getting ready' }),
      renderChips(s),
      button('New game', renderSetup));
    const side = el('div', { className: 'side' });
    if (s.phase !== 'chooseStart') side.append(renderWorld(s));
    if (detailArea) side.append(renderAreaDetails(s, detailArea));
    if (shownPlayer !== null) side.append(playerCard(s, shownPlayer));
    side.append(renderTurn(s, actions, isRobot));
    app.replaceChildren(el('div', { className: 'game' }, header,
      el('div', { className: 'board' },
        el('div', { className: 'left' }, s.phase === 'chooseStart' ? renderStartMap(s, isRobot) : renderAreaView(s, isRobot)),
        side)));
  }

  clearTimeout(robotTimer);
  clearInterval(quizTimer);
  if (isRobot) {
    robotTimer = window.setTimeout(() => {
      if (state !== s) return;
      // A robot buyer accepts an offer whenever it can pay (owner's choice, task 9b).
      const [action, next] = robotAction(s, map30, robotSeed, actor.level ?? 'normal');
      robotSeed = next;
      act(action);
    }, ROBOT_DELAY_MS);
  }
}

// One small chip per player in the top bar; tapping it opens the full player card.
function renderChips(s: GameState): HTMLElement {
  const me = currentPlayer(s);
  return el('div', { className: 'chips' }, ...s.turnOrder.map((seat) => {
    const p = s.players[seat];
    const points = s.phase === 'finished' ? finalScore(s, p) : p.points;
    const chip = el('button', { className: 'chip' + (p === me && s.phase !== 'finished' ? ' active' : '') + (shownPlayer === seat ? ' open' : ''), title: 'Show details' },
      dot(seat), ` ${COLOUR_NAMES[seat]}${p.kind === 'robot' ? ' 🤖' : ''} `, el('b', { textContent: String(points) }),
      businessValue(s, seat) && s.phase !== 'finished' ? ` +🏢${businessValue(s, seat)}` : '');
    chip.style.borderColor = COLOURS[seat];
    chip.addEventListener('click', () => { shownPlayer = shownPlayer === seat ? null : seat; render(); });
    return chip;
  }));
}

function playerCard(s: GameState, seat: number): HTMLElement {
  const p = s.players[seat];
  const area = p.area ? areaById.get(p.area)!.name
    : p.travel ? `${VEHICLE[p.travel.kind]} to ${areaById.get(p.travel.to)!.name}` : '—';
  const card = el('div', { className: 'player' },
    el('div', {}, dot(seat), ` ${COLOUR_NAMES[seat]} ${p.kind === 'robot' ? `🤖 ${LEVEL_LABEL[p.level ?? 'normal']}` : '🙂'} `,
      button('✕', () => { shownPlayer = null; render(); })),
    el('div', { className: 'small', textContent: p.profile ? PROFILE_LABEL[p.profile] : 'no profile yet' }),
    el('div', { className: 'points', textContent: s.phase === 'finished'
      ? plural(finalScore(s, p), 'point')
      : `${plural(p.points, 'point')}${businessValue(s, seat) ? ` + 🏢 ${businessValue(s, seat)}` : ''}` }),
    el('div', { className: 'small', textContent: `📍 ${area}${p.home ? ` · 🏠 Home: ${areaById.get(p.home)!.name}` : ''}` }),
    el('div', { className: 'small', textContent: p.citizenship
      ? `🛂 Citizen of ${citizenshipName(p.citizenship)}`
      : p.exam ? `🛂 Asking for citizenship in ${areaById.get(p.exam.area)!.name}` : '' }),
    el('div', { className: 'small', textContent: `${plural(p.visitedContinents.length, 'continent')} · ${plural(p.visitedAreas.length, 'area')}` }),
    continentBar(s, p),
    el('div', { className: 'small', textContent: s.phase === 'play' ? nextCardText(s, p) : '' }),
    el('div', { className: 'small', textContent: s.businesses.filter((b) => b.owner === seat)
      .map((b) => `${BUSINESS_ICON[b.kind]} ${areaById.get(b.area)!.name}`).join(' · ') }));
  card.style.borderColor = COLOURS[seat];
  return card;
}

// When the player's next event card comes: every 3rd turn begun in an area; trip turns don't
// count (task 12); none in the last round (and none during a citizenship request).
function nextCardText(s: GameState, p: Player): string {
  if (s.card?.seat === p.seat && s.card.round === s.round && currentPlayer(s) === p) return '🔔 Event card this turn';
  const order = s.turnOrder.indexOf(p.seat);
  const started = order <= s.current; // this round's turn has begun (and is counted) or is over
  const turns = landTurnsToCard(p) || 3;
  const turnsLeft = s.totalRounds - 1 - s.round + (started ? 0 : 1); // turns that can still have a card
  if (turns > turnsLeft) return '🔔 No more event cards';
  return turns === 1 ? '🔔 Event card: next turn on land' : `🔔 Event card: in ${turns} turns on land`;
}

// "Continents 2/3" for the profiles with a continent bonus or penalty (rulebook section 14).
function continentBar(s: GameState, p: Player): HTMLElement | string {
  const n = p.visitedContinents.length;
  const bonus = p.profile ? CONTINENT_BONUS[p.profile] : undefined;
  const goal = bonus?.continents ?? (p.profile === 'nomad' ? NOMAD_MIN_CONTINENTS : 0);
  if (!goal) return '';
  const bar = `Continents ${'▰'.repeat(Math.min(n, goal))}${'▱'.repeat(Math.max(0, goal - n))} ${Math.min(n, goal)}/${goal}`;
  if (bonus) return el('div', { className: 'small', textContent: n >= goal ? `${bar} ✅ +${bonus.points} earned` : `${bar} (+${bonus.points} at ${goal})` });
  if (n >= goal) return el('div', { className: 'small', textContent: `${bar} ✅ no penalty` });
  const warn = s.round >= NOMAD_WARNING_ROUND && s.phase === 'play';
  return el('div', { className: warn ? 'small error' : 'small', textContent: warn
    ? `${bar} ⚠️ −${NOMAD_PENALTY} at the end unless you reach a ${goal}rd continent`
    : `${bar} (−${NOMAD_PENALTY} at the end below ${goal})` });
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
        const value = businessValue(s, seat);
        const penalty = nomadPenalty(p);
        // One total in points: travel points + assets (businesses at their price) − Nomad penalty.
        const detail = [`${p.points} travel`, `${value} assets`]
          .join(' + ') + (penalty ? ` − ${penalty} Nomad penalty` : '');
        return el('li', {}, dot(seat), ` ${COLOUR_NAMES[seat]}: ${plural(finalScore(s, p), 'point')} (${detail}), ${plural(p.visitedContinents.length, 'continent')}, ${plural(p.visitedAreas.length, 'area')}`);
      })),
      button('Play again', renderSetup));
    return box;
  }

  if (note) box.append(el('p', { className: 'note', textContent: note }));
  if (s.offer) {
    const o = s.offer;
    const buyer = el('span', {}, dot(o.to), ` ${COLOUR_NAMES[o.to]}`);
    const what = `the ${BUSINESS_ICON[o.business]} ${BUSINESS_NAME[o.business]} in ${areaById.get(o.area)!.name}`;
    if (isRobot) {
      box.append(el('h2', {}, buyer, ` is thinking about ${COLOUR_NAMES[o.from]}'s offer… 🤖`));
      return box;
    }
    box.append(el('h2', {}, buyer, `: ${COLOUR_NAMES[o.from]} offers you ${what} for ${plural(o.price, 'point')}`),
      el('p', { textContent: `If you buy it, ${BUSINESS_EARNS[o.business]}, and it counts ${plural(o.price, 'point')} for you at the end. You have ${plural(s.players[o.to].points, 'point')}.` }),
      el('div', { className: 'row' }, ...actions.map((a) => a.type === 'sellAnswer'
        ? button(a.accept ? `Yes, buy it (−${o.price})` : 'No, thanks', () => act(a)) : '')));
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
    box.append(el('h2', {}, who, ', choose your home country'),
      el('p', { className: 'small', textContent: zoom
        ? `Tap a green area in ${zoom}.`
        : 'Tap a continent on the map. Each player starts on a different continent. Welcome bonus: Europe, Asia, Africa +3 · Americas +4 · Oceania +5.' }),
      me.profile === 'backpacker'
        ? el('p', { className: 'small', textContent: '🎒 Tip: from Europe, Asia or Africa you can walk to 3 continents (+3 Backpacker bonus).' })
        : '');
    // The home area is stressed before it is confirmed (owner's request, task 14 A2):
    // it is not a citizenship, and "go home" always comes back here.
    if (pickedStart) {
      const chosen = { type: 'chooseStart' as const, area: pickedStart };
      const start = button(`🏠 Start in ${areaById.get(pickedStart)!.name}`, () => act(chosen));
      start.className = 'primary';
      box.append(el('div', { className: 'note home' },
        el('strong', { textContent: `🏠 ${areaById.get(pickedStart)!.name} will be your home country for the whole game.` }),
        el('p', { textContent: 'Your home country is not a citizenship. If you are ever sent home (for example when your money runs out), you come back here.' }),
        el('div', { className: 'row' }, start, button('Choose again', () => { pickedStart = null; render(); }))));
    }
  } else if (s.quiz) {
    renderQuiz(box, s, who);
  } else if (s.challenge) {
    renderChallenge(box, s, who);
  } else if (me.exam && (me.exam.stage === 'test' || me.exam.stage === 'result')) {
    renderCitizenship(box, s, who);
  } else if (me.loseTurn) {
    if (s.card?.seat === me.seat) box.append(renderCard(s.card));
    box.append(el('h2', {}, who, ', you lose this turn'),
      el('div', { className: 'row' }, button('⏸️ Lose this turn', () => act({ type: 'lostTurn' }))));
  } else if (me.travel) {
    const trip = me.travel;
    const to = areaById.get(trip.to)!.name;
    const where = trip.kind === 'airport' ? 'in the air' : 'at sea';
    box.append(el('h2', {}, who, `, you are ${where} ${VEHICLE[trip.kind]} to ${to}`),
      el('p', { className: 'small', textContent: trip.turnsLeft > 0
        ? `${plural(trip.turnsLeft, 'travel turn')} left; you land at the end of the last one.`
        : `${to} is taken, so you wait one more turn and try to land again.` }),
      el('p', { className: 'small', textContent: `❓ Another passenger would like to play a geography challenge with you: one question, ${CHALLENGE_SECONDS} seconds. Right +${CHALLENGE_POINTS}, wrong −${CHALLENGE_POINTS}. You don't have to play.${me.profile === 'nomad' ? ' 💻 Digital Nomad: +1 for this travel turn either way.' : ''}` }),
      me.points < CHALLENGE_POINTS ? el('p', { className: 'small', textContent: `A challenge needs at least ${plural(CHALLENGE_POINTS, 'point')}, so there is none this turn.` }) : '',
      el('div', { className: 'row' },
        ...(actions.some((a) => a.type === 'travel' && a.challenge) ? [button(`❓ Play the challenge (+${CHALLENGE_POINTS} / −${CHALLENGE_POINTS})`, () => act({ type: 'travel', challenge: true }))] : []),
        button('Continue the journey (no challenge)', () => act({ type: 'travel' }))));
  } else {
    const here = areaById.get(me.area!)!;
    if (pendingFees && (pendingFees.type === 'walk' || pendingFees.type === 'board' || pendingFees.type === 'quiz')) {
      const a = pendingFees;
      const fees = entryFees(s, me, me.area, a.to);
      const where = areaById.get(a.to)!.name;
      box.append(el('h2', {}, who, `: entering ${where} costs ${plural(feeTotal(fees), 'point')}`),
        el('ul', {}, ...fees.map((f) => el('li', { textContent: f.reason === 'visa'
          ? `🛂 Visa: ${plural(f.amount, 'point')} to ${COLOUR_NAMES[f.to.seat]} (${where} is ${COLOUR_NAMES[f.to.seat]}'s citizenship)`
          : `🏛️ Tour fee: ${plural(f.amount, 'point')} to ${COLOUR_NAMES[f.to.seat]} (owner of the guided tours in ${where})` }))),
        el('p', { className: 'small', textContent: a.type === 'walk' ? 'You pay when you enter.'
          : a.type === 'board' ? 'You pay now, with the ticket. Nothing more to pay when you land.'
          : 'You pay when you board (a right answer, or the ticket after the 3rd wrong one).' }),
        el('div', { className: 'row' },
          button(a.type === 'walk' ? `Pay ${feeTotal(fees)} and enter` : 'Go anyway', () => act(a)),
          button('Cancel', () => { pendingFees = null; render(); })));
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
        el('p', { textContent: `🎉 Your citizenship of ${citizenshipName(me.citizenship!)} is now granted! You may travel on.${me.profile === 'business' ? ` 💼 +${plural(POINTS_BUSINESS_CITIZENSHIP, 'point')}.` : ''}` })));
    }
    if (s.card?.seat === me.seat) box.append(renderCard(s.card));
    box.append(el('h2', {}, who, `, you are in ${here.name}`), el('p', { className: 'small', textContent: travelNote(me) }));
    const businessesHere = s.businesses.filter((b) => b.area === here.id);
    if (businessesHere.length > 0) {
      box.append(el('p', { className: 'small', textContent: businessesHere.map((b) => `${BUSINESS_ICON[b.kind]} ${capital(BUSINESS_NAME[b.kind])} here: ${
        b.owner === null ? `for sale, ${plural(BUSINESS_PRICE[b.kind], 'point')} (${BUSINESS_EARNS[b.kind]})` : b.owner === me.seat ? 'yours' : `owned by ${COLOUR_NAMES[b.owner]}`}`).join(' · ') }));
    }
    if (actions.some((a) => a.type === 'blocked' || a.type === 'goHome') && blockedByMoney(s, map30, me)) {
      const homeName = areaById.get(homeFor(s, map30, me))!.name;
      const left = GO_HOME_TURNS - 1 - me.broke;
      box.append(el('p', { className: 'note', textContent: left <= 0
        ? `🏠 Your money has run out, and your trip ends here. You go home to ${homeName}, free of any fees.`
        : `💸 Out of money! You can't pay to enter any area or to board. ${s.businesses.some((b) => b.owner === me.seat) ? 'Sell a business to another player (💰 below), or wait for luck.' : 'Wait for luck.'} ${left === 1 ? 'Next turn' : `In ${left} turns`}, if you still can't pay, your trip ends and you go home to ${homeName}.` }));
    }
    const offered = asksOffered(actions);
    if (offered.length > 0) {
      const tick = el('input', { type: 'checkbox', checked: askCitizenship });
      tick.addEventListener('change', () => { askCitizenship = tick.checked; render(); });
      box.append(el('label', { className: 'ask' }, tick,
        ' 🛂 Ask for citizenship where I arrive — you can ask only once per game. Moves marked 🛂 allow it.'));
    }
    const canAsk = (a: Action) => offered.some((o) => 'to' in o && 'to' in a && o.type === a.type && o.to === a.to
      && (!('kind' in a) || ('kind' in o && o.kind === a.kind)));
    const waiting = waitingNote(s);
    if (waiting) box.append(el('p', { className: 'small', textContent: waiting }));
    const warning = lastTryWarning(s, plainActions(actions));
    if (warning) box.append(el('p', { className: 'note', textContent: warning }));
    const row = el('div', { className: 'row' });
    for (const a of plainActions(actions)) {
      const mark = canAsk(a) ? ' 🛂' : '';
      if (a.type === 'walk') {
        const to = areaById.get(a.to)!;
        row.append(button(`🚶 ${to.name}${gainLabel(s, a, to)}${feeLabel(s, a.to)}${mark}`, () => go(pick(actions, a))));
      } else if (a.type === 'board') {
        row.append(button(`${VEHICLE[a.kind]} Pay ${TICKET_PRICE[me.profile!]}${ticketTo(s, a.kind)} → ${areaById.get(a.to)!.name}${feeLabel(s, a.to)}${mark}`, () => go(pick(actions, a))));
      } else if (a.type === 'quiz') {
        row.append(button(`${VEHICLE[a.kind]} Quiz for a free ticket → ${areaById.get(a.to)!.name}${feeLabel(s, a.to)}${mark}`, () => go(pick(actions, a))));
      } else if (a.type === 'blocked') {
        row.append(button('⛔ No area you can enter — wait this turn', () => act(a)));
      } else if (a.type === 'goHome') {
        row.append(button(`🏠 Go home to ${areaById.get(homeFor(s, map30, me))!.name}`, () => act(a)));
      } else if (a.type === 'buy') {
        const first = !s.players.some((p) => p.seat !== me.seat && p.visitedAreas.includes(here.id));
        row.append(button(`${BUSINESS_ICON[a.business]} Buy the ${BUSINESS_NAME[a.business]} here −${BUSINESS_PRICE[a.business]}${first ? ' ⭐ first here' : ''}`, () => act(a)));
      }
    }
    const sales = actions.filter((a) => a.type === 'sell');
    if (sales.length > 0 && !selling) row.append(button('💰 Sell a business…', () => { selling = true; render(); }));
    box.append(row);
    if (selling) {
      box.append(el('p', { className: 'small', textContent: 'Sell at the price it was bought for. The buyer says yes or no; your turn goes on. One offer per turn.' }),
        el('div', { className: 'row' }, ...sales.map((a) => a.type === 'sell'
          ? button(`Sell ${BUSINESS_ICON[a.business]} ${BUSINESS_NAME[a.business]} in ${areaById.get(a.area)!.name} to ${COLOUR_NAMES[a.to]} for ${BUSINESS_PRICE[a.business]}`, () => act(a)) : ''),
        button('Cancel', () => { selling = false; render(); })));
    }
    box.append(
      el('p', { className: 'small', textContent: 'New area +1 · new continent +2 · ⭐ wonder +1 more · 🧩 big country: 0 until every part is visited, then +1 + number of parts (Canada and Russia, 3 parts: +5).' }),
      el('p', { className: 'small', textContent: `Businesses: buying doesn't end your turn, and each one counts its price at the end. Fees are strict: no money, no entry. Can't pay for ${GO_HOME_TURNS} turns in a row? You go home.` }),
      renderBigCountries(me));
  }
  return box;
}

// Points this move would give, found by trying it on a copy of the state (fees not included).
function gainLabel(s: GameState, action: Action, to: Area): string {
  const before = currentPlayer(s).points;
  const after = apply(s, map30, action).players[currentPlayer(s).seat].points;
  const gain = after - before + feeTotal(entryFees(s, currentPlayer(s), currentPlayer(s).area, to.id));
  if (gain > 0) return ` ✨ +${gain}`;
  const me = currentPlayer(s);
  return to.bigCountry && !me.visitedAreas.includes(to.id) ? ' 🧩' : '';
}

function feeLabel(s: GameState, to: string): string {
  return entryFees(s, currentPlayer(s), currentPlayer(s).area, to).map((f) => f.reason === 'visa'
    ? ` 🛂 visa −${f.amount} to ${COLOUR_NAMES[f.to.seat]}`
    : ` 🏛️ tour −${f.amount} to ${COLOUR_NAMES[f.to.seat]}`).join('');
}

// Who gets the ticket from this airport or port: " (to Blue's airline)".
function ticketTo(s: GameState, kind: RouteKind): string {
  const me = currentPlayer(s);
  const business = businessAt(s, me.area!, kind === 'airport' ? 'airline' : 'ferry');
  if (business?.owner === undefined || business.owner === null) return '';
  return business.owner === me.seat ? ' (to yourself)' : ` (to ${COLOUR_NAMES[business.owner]})`;
}

function capital(text: string): string {
  return text[0].toUpperCase() + text.slice(1);
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
    el('p', { className: 'small', textContent: `Wrong answers here so far: ${currentPlayer(s).quizWrong}. A wrong answer uses this turn.${forcedPayNote(s, kind, to)}` }));
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

// Travel-turn challenge: one a/b question, 15 seconds. Time out = wrong answer.
function renderChallenge(box: HTMLElement, s: GameState, who: HTMLElement): void {
  const c = s.challenge!;
  let left = CHALLENGE_SECONDS;
  const clock = el('p', { className: 'small', textContent: `⏱️ ${left} s` });
  const flag = c.flag && FLAGS[c.flag] ? el('img', { className: 'flag', src: FLAGS[c.flag], alt: 'A flag' }) : '';
  box.append(el('h2', {}, who, `: challenge! ${CHALLENGE_NAME[c.type]}`),
    flag,
    el('p', { textContent: c.question }),
    el('div', { className: 'row' }, ...c.options.map((o, i) => button(o, () => act({ type: 'challengeAnswer', choice: i as 0 | 1 })))),
    clock,
    el('p', { className: 'small', textContent: `Right +${CHALLENGE_POINTS}, wrong −${CHALLENGE_POINTS}. The journey goes on either way.` }));
  quizTimer = window.setInterval(() => {
    if (state !== s) return clearInterval(quizTimer);
    left -= 1;
    clock.textContent = `⏱️ ${left} s`;
    if (left <= 0) {
      clearInterval(quizTimer);
      act({ type: 'challengeAnswer', choice: (1 - c.correct) as 0 | 1 });
    }
  }, 1000);
}

function challengeNote(r: ChallengeResult): string {
  const name = COLOUR_NAMES[r.seat];
  if (r.right) return `❓ ${name}'s challenge: right, it is ${r.challenge.options[r.challenge.correct]}! +${plural(r.change, 'point')}.`;
  const lost = r.change === 0 ? 'No points to lose' : `−${plural(-r.change, 'point')}`;
  return `❓ ${name}'s challenge: wrong, the answer was ${r.challenge.options[r.challenge.correct]}. ${lost}.`;
}

// After the 3rd wrong answer a player who can pay must pay: say who gets the ticket.
function forcedPayNote(s: GameState, kind: RouteKind, dest: string): string {
  const me = currentPlayer(s);
  if (me.quizWrong >= QUIZ_TRIES - 1) return ` ${lastTryText(s, dest)}`;
  const price = TICKET_PRICE[me.profile!];
  const to = ticketTo(s, kind);
  return price === null
    ? ` After ${QUIZ_TRIES} wrong answers here your trip ends and you go home.`
    : ` After ${QUIZ_TRIES} wrong answers here you must pay the ${price}-point ticket and go${to ? ` (the ticket goes ${to.slice(2, -1)})` : ''}; if you can't pay, you go home.`;
}

// Neighbours and destinations closed because someone is travelling there (owner's rule, task 13).
function waitingNote(s: GameState): string {
  const me = currentPlayer(s);
  const near = new Set([
    ...areaById.get(me.area!)!.neighbours,
    ...(['airport', 'port'] as const).flatMap((kind) => destinations(map30, me.area!, kind, me.profile!)),
  ]);
  const lines = [...near].flatMap((id) => {
    const p = bookedBy(s, id);
    return p && p.seat !== me.seat ? [`${areaById.get(id)!.name} is waiting for ${COLOUR_NAMES[p.seat]} ${VEHICLE[p.travel!.kind]} (booked)`] : [];
  });
  return lines.length ? `⏳ ${lines.join(' · ')}: nobody else can go there until they land.` : '';
}

// Told before the 3rd quiz try in an area (owner's rule, task 13): what a wrong answer means.
function lastTryText(s: GameState, dest: string): string {
  const me = currentPlayer(s);
  const name = areaById.get(dest)!.name;
  return canPayAfterQuiz(s, me, dest)
    ? `⚠️ Last try here for ${name}: Attention! If wrong, you pay the ${TICKET_PRICE[me.profile!]}-point ticket with your points and travel.`
    : `⚠️ Last try here for ${name}: Attention! If wrong, you go home to ${areaById.get(homeFor(s, map30, me))!.name}.`;
}

function lastTryWarning(s: GameState, actions: Action[]): string {
  if (currentPlayer(s).quizWrong < QUIZ_TRIES - 1) return '';
  const dests = [...new Set(actions.flatMap((a) => (a.type === 'quiz' ? [a.to] : [])))];
  return dests.map((d) => lastTryText(s, d)).join(' ');
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

// ---------- drawn maps (task 14 A2) ----------

interface Drawn { root: SVGSVGElement; labels: SVGGElement; paths: Map<string, SVGPathElement>; vb: Box; k: number; fs: number }

const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

// Draws the areas that show in the view (world units), squeezed by k across.
// Text is sized in screen pixels (px), from the size of the pane the map fills.
function drawMap(view: Box, k: number, cls: (id: string) => string, onTap: (id: string) => (() => void) | null, pane: 'left' | 'world' = 'left', px = 13): Drawn {
  const vb = { x: view.x * k, y: view.y, w: view.w * k, h: view.h };
  const root = svg('svg', { viewBox: `${vb.x} ${vb.y} ${vb.w} ${vb.h}`, class: 'map-svg' });
  const shapes = svg('g', { transform: `scale(${k} 1)` });
  const paths = new Map<string, SVGPathElement>();
  for (const a of map30.areas) {
    const g = geo.get(a.id)!;
    if (!overlaps(g.box, view)) continue;
    const path = svg('path', { d: g.path, class: `land ${cls(a.id)}` });
    const tap = onTap(a.id);
    if (tap) {
      path.classList.add('tap');
      path.addEventListener('click', tap);
    }
    paths.set(a.id, path);
    shapes.append(path);
  }
  const labels = svg('g');
  root.append(shapes, labels);
  const w = window.innerWidth / 2 - 12;
  const h = pane === 'left' ? window.innerHeight - 90 : w / 2.6;
  const scale = Math.min(w / vb.w, h / vb.h);
  return { root, labels, paths, vb, k, fs: px / scale };
}

// A label at (x, y) in view units; a tappable one gets a pill behind it.
function label(d: Drawn, x: number, y: number, text: string, cls: string, size = 1, onTap?: () => void): void {
  const fs = d.fs * size;
  const g = svg('g', { class: `label ${cls}` });
  if (onTap) {
    const w = [...text].length * fs * 0.62 + fs;
    g.append(svg('rect', { x: x - w / 2, y: y - fs * 0.8, width: w, height: fs * 1.6, rx: fs * 0.8 }));
    g.classList.add('tap');
    g.addEventListener('click', onTap);
  }
  g.append(svg('text', { x, y, 'font-size': fs, 'stroke-width': fs * 0.22, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, text));
  d.labels.append(g);
}

// Players' pieces: one dot each, side by side in the middle of their area.
function pieces(d: Drawn, s: GameState, r: number): void {
  for (const p of s.players) {
    if (!p.area) continue;
    const [cx, cy] = geo.get(p.area)!.centre;
    const x = cx * d.k + (p.seat - 1.5) * r * 2.3;
    if (x < d.vb.x || x > d.vb.x + d.vb.w || cy < d.vb.y || cy > d.vb.y + d.vb.h) continue;
    d.labels.append(svg('circle', { cx: x, cy: cy + r * 2.4, r, fill: COLOURS[p.seat], class: 'piece' }));
  }
}

// Left half: the current area, its neighbours around it (tap a green one to walk there).
function renderAreaView(s: GameState, isRobot: boolean): HTMLElement {
  const me = currentPlayer(s);
  const focus = me.area ?? me.travel?.to ?? me.home ?? map30.areas[0].id;
  const here = areaById.get(focus)!;
  const view = pad(geo.get(focus)!.box, 0.5, 4);
  const k = squeeze(view);
  const actions = legalActions(s, map30);
  const canWalk = !isRobot && s.phase === 'play' && !s.quiz && !s.challenge && !pendingFees;
  const walks = new Map(canWalk ? plainActions(actions).flatMap((a) => (a.type === 'walk' ? [[a.to, a] as const] : [])) : []);
  const walkTo = (id: string) => () => go(pick(legalActions(s, map30), walks.get(id)!));
  const d = drawMap(view, k,
    (id) => (id === focus ? 'here' : walks.has(id) ? 'go' : here.neighbours.includes(id) ? 'near' : ''),
    (id) => (walks.has(id) ? walkTo(id) : null));

  const { vb, fs } = d;
  for (const n of here.neighbours) {
    const area = areaById.get(n)!;
    const [cx, cy] = geo.get(n)!.centre;
    const name = area.name;
    const w = ([...name].length * fs * 0.62 + fs * 3) / 2;
    const x = clamp(cx * k, vb.x + w, vb.x + vb.w - w);
    const y = clamp(cy, vb.y + fs, vb.y + vb.h - fs);
    const walk = walks.get(n);
    if (walk) {
      const fees = feeTotal(entryFees(s, me, me.area, n));
      label(d, x, y, `🚶 ${name}${gainLabel(s, walk, area)}${fees ? ` 💰−${fees}` : ''}`, 'go', 1, walkTo(n));
    } else {
      label(d, x, y, `${name}${bookedBy(s, n) ? ' ⏳' : ''}`, 'near', 0.85);
    }
  }
  const [hx, hy] = geo.get(focus)!.centre;
  const icons = `${here.wonder ? '⭐' : ''}${hasRoute(focus, 'airport') ? '✈️' : ''}${hasRoute(focus, 'port') ? '⛴️' : ''}${here.bigCountry ? '🧩' : ''}`;
  label(d, hx * k, hy - fs * 1.1, here.name, 'here', 1.25);
  if (icons) label(d, hx * k, hy + fs * 0.4, icons, 'here', 1.1);
  pieces(d, s, fs * 0.45);

  const caption = me.travel
    ? `${VEHICLE[me.travel.kind]} ${COLOUR_NAMES[me.seat]} is on the way to ${here.name}`
    : (['airport', 'port'] as const).flatMap((kind) => {
      const to = me.profile ? destinations(map30, focus, kind, me.profile) : [];
      return to.length ? [`${VEHICLE[kind]} ${kind === 'airport' ? 'Plane' : 'Ship'} to ${to.map((t) => areaById.get(t)!.name).join(', ')}`] : [];
    }).join(' · ');
  return el('div', { className: 'areaview' },
    el('div', { className: 'where' }, dot(me.seat), ` ${here.name} · ${here.continent}`),
    d.root,
    caption ? el('div', { className: 'small caption', textContent: caption }) : '');
}

// Right half: the whole world. Players, trips, routes, booked and visited areas; tap for details.
function renderWorld(s: GameState): HTMLElement {
  const me = currentPlayer(s);
  const d = drawMap(pad(worldBox, 0.01), 1,
    (id) => [
      id === me.area ? 'here' : '',
      me.visitedAreas.includes(id) ? 'visited' : '',
      bookedBy(s, id) ? 'booked' : '',
      id === detailArea ? 'picked' : '',
    ].join(' '),
    (id) => () => { detailArea = detailArea === id ? null : id; render(); },
    'world');
  for (const [id, path] of d.paths) {
    const b = bookedBy(s, id);
    if (b) path.style.stroke = COLOURS[b.seat];
  }
  const centre = (id: string) => geo.get(id)!.centre;
  for (const r of map30.routes ?? []) {
    const [ax, ay] = centre(r.a);
    let [bx, by] = centre(r.b);
    if (bx - ax > 180) bx -= 360;
    if (ax - bx > 180) bx += 360;
    d.labels.append(svg('line', { x1: ax, y1: ay, x2: bx, y2: by, class: `route ${r.kind}` }));
  }
  for (const p of s.players) {
    if (!p.travel) continue;
    const [ax, ay] = centre(p.travel.from);
    const [bx, by] = centre(p.travel.to);
    const total = p.profile ? TRAVEL_TURNS[p.profile][p.travel.kind] : 1;
    const t = Math.min(1, Math.max(0, (total - p.travel.turnsLeft) / (total + 1)));
    const line = svg('line', { x1: ax, y1: ay, x2: bx, y2: by, class: 'trip' });
    line.style.stroke = COLOURS[p.seat];
    d.labels.append(line, svg('circle', { cx: ax + (bx - ax) * t, cy: ay + (by - ay) * t, r: d.fs * 0.4, fill: COLOURS[p.seat], class: 'piece' }));
  }
  pieces(d, s, d.fs * 0.4);
  return el('div', { className: 'world' }, d.root);
}

// The details of an area tapped on the world map (for planning; nobody moves).
function renderAreaDetails(s: GameState, id: string): HTMLElement {
  const a = areaById.get(id)!;
  const routes = (kind: RouteKind) => (map30.routes ?? []).filter((r) => r.kind === kind && (r.a === id || r.b === id))
    .map((r) => areaById.get(r.a === id ? r.b : r.a)!.name);
  const lines = [
    `${a.continent} · ${(a.countries ?? []).join(', ')}`,
    a.wonder ? '⭐ Wonder: +1 more the first time you visit' : '',
    a.bigCountry ? `🧩 Part of ${a.bigCountry}` : '',
    routes('airport').length ? `✈️ Airport: flights to ${routes('airport').join(', ')}` : '',
    routes('port').length ? `⛴️ Port: ships to ${routes('port').join(', ')}` : '',
    `🚶 Walk to: ${a.neighbours.map((n) => areaById.get(n)!.name).join(', ') || 'nowhere (island)'}`,
    ...s.businesses.filter((b) => b.area === id).map((b) => `${BUSINESS_ICON[b.kind]} ${capital(BUSINESS_NAME[b.kind])}: ${b.owner === null ? `for sale, ${plural(BUSINESS_PRICE[b.kind], 'point')}` : `owned by ${COLOUR_NAMES[b.owner]}`}`),
    ...s.players.filter((p) => p.citizenship?.includes(id)).map((p) => `🛂 ${COLOUR_NAMES[p.seat]} is a citizen here: others pay a ${VISA_PRICE}-point visa`),
    ...s.players.filter((p) => p.area === id).map((p) => `📍 ${COLOUR_NAMES[p.seat]} is here`),
    ...s.players.filter((p) => p.home === id).map((p) => `🏠 ${COLOUR_NAMES[p.seat]}'s home country`),
    bookedBy(s, id) ? `⏳ Booked: ${COLOUR_NAMES[bookedBy(s, id)!.seat]} is on the way here` : '',
    `Visited by: ${s.players.filter((p) => p.visitedAreas.includes(id)).map((p) => COLOUR_NAMES[p.seat]).join(', ') || 'nobody yet'}`,
  ].filter((t) => t !== '');
  return el('div', { className: 'card details' },
    el('div', { className: 'row spread' }, el('h3', { textContent: a.name }), button('✕', () => { detailArea = null; render(); })),
    ...lines.map((t) => el('p', { className: 'small', textContent: t })));
}

// Choosing the home country: the 6 continents first, then a zoom into one.
function renderStartMap(s: GameState, isRobot: boolean): HTMLElement {
  const legal = new Set(isRobot ? [] : legalActions(s, map30).flatMap((a) => (a.type === 'chooseStart' ? [a.area] : [])));
  const homes = new Map(s.players.flatMap((p) => (p.area ? [[p.area, p] as const] : [])));
  const open = (c: Continent) => map30.areas.some((a) => a.continent === c && legal.has(a.id));
  const wrap = el('div', { className: 'areaview' });
  if (zoom === null) {
    const d = drawMap(pad(worldBox, 0.01), 1,
      (id) => {
        const c = areaById.get(id)!.continent;
        return `c${continents.indexOf(c)}${homes.has(id) ? ' here' : open(c) ? '' : ' dim'}`;
      },
      (id) => (open(areaById.get(id)!.continent) ? () => { zoom = areaById.get(id)!.continent; render(); } : null));
    for (const c of continents) {
      const ids = map30.areas.filter((a) => a.continent === c).map((a) => geo.get(a.id)!.centre);
      // The middle of the continent's areas (Greenland would pull Europe's box far west).
      const x = ids.reduce((t, p) => t + p[0], 0) / ids.length;
      const y = ids.reduce((t, p) => t + p[1], 0) / ids.length;
      const taken = s.players.find((p) => p.startContinent === c);
      label(d, x, y, taken ? `${c}: ${COLOUR_NAMES[taken.seat]}` : c, open(c) ? 'go' : 'near', 1,
        open(c) ? () => { zoom = c; render(); } : undefined);
    }
    pieces(d, s, d.fs * 0.4);
    wrap.append(el('div', { className: 'where' }, 'The world: tap a continent'), d.root);
    return wrap;
  }
  const c = zoom;
  const view = pad(continentBox(map30, geo, c), 0.06, 2);
  const k = squeeze(view);
  const d = drawMap(view, k,
    (id) => (id === pickedStart ? 'here' : legal.has(id) ? 'go' : areaById.get(id)!.continent === c ? '' : 'dim'),
    (id) => (legal.has(id) ? () => { pickedStart = id; render(); } : null));
  for (const a of map30.areas.filter((x) => x.continent === c)) {
    const [x, y] = geo.get(a.id)!.centre;
    label(d, x * k, y, `${a.name}${a.wonder ? ' ⭐' : ''}`, a.id === pickedStart ? 'here' : legal.has(a.id) ? 'go' : 'near', 0.85,
      legal.has(a.id) ? () => { pickedStart = a.id; render(); } : undefined);
  }
  pieces(d, s, d.fs * 0.4);
  wrap.append(el('div', { className: 'where' }, button('← All continents', () => { zoom = null; pickedStart = null; render(); }), ` ${c}`), d.root);
  return wrap;
}

renderStart();
