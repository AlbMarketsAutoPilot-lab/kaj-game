// The game screens on top of the engine. Task 14 A2: poster, setup, home-area picker, and the
// landscape board (left: the current area drawn; right: the world map and the turn panel).
// Robots play with simple rules, at the level chosen for each seat (task 13).

import { BUSINESS_PRICE, CHALLENGE_POINTS, CONTINENT_BONUS, POINTS_NOMAD_TRAVEL_TURN, POINTS_NEW_AREA, POINTS_NEW_CONTINENT, POINTS_WONDER, GO_HOME_TURNS, NOMAD_MIN_CONTINENTS, NOMAD_PENALTY, NOMAD_WARNING_ROUND, POINTS_BUSINESS_CITIZENSHIP, QUIZ_TRIES, TICKET_PRICE, TOUR_FEE, TRAVEL_TURNS, VISA_PRICE } from '../engine/constants.ts';
import {
  apply, blockedByMoney, bookedBy, businessAt, canPayAfterQuiz, destinations, businessValue, createGame, currentPlayer, entryFees, feeTotal, finalScore, homeFor, landTurnsToCard, legalActions, nomadPenalty,
} from '../engine/engine.ts';
import { robotAction } from '../engine/normal-robot.ts';
import { loadGame, saveGame } from '../engine/save.ts';
import type { Action, Area, BusinessKind, Challenge, ChallengeResult, ChallengeType, Continent, Deck, DrawnCard, GameState, Payment, Player, Profile, RobotLevel, RouteKind, SeatKind } from '../engine/types.ts';
import { map30 } from '../maps/map30.ts';
import { shapes30 } from '../maps/shapes30.ts';
import { countryCapital, countryFlag, WONDER_NAME } from './countries.ts';
import { buildGeo, colourAreas, continentBox, pad, squeeze, svg, unionBox, type Box } from './maps.ts';
import { airport, citizenFlag, monument, pawn, place, port } from './props.ts';

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
const areaColour = colourAreas(map30, geo);
const hasRoute = (id: string, kind: RouteKind) => (map30.routes ?? []).some((r) => r.kind === kind && (r.a === id || r.b === id));

let state: GameState | null = null;
let robotSeed = 1;
let robotTimer = 0;
let quizTimer = 0;
// What happened (other players' moves, payments, cards), shown in one popup (task 14 B2):
// on a person's turn, or straight after a person's own move (`newsNow`).
let news: string[] = [];
let newsNow = false;
// The popup after a person answers a quiz, test or challenge question: right or wrong, the
// right answer and the fact behind it (owner's request).
let answered: { ok: boolean; title: string; lines: string[] } | null = null;
// Event cards already shown in a popup (round, seat, card).
const seenCards = new Set<string>();
// What a person's last arrival earned, for the guide on their next turn.
const arrivals = new Map<number, { area: string; lines: string[] }>();
// The "Ask for citizenship" popup is open (owner's request: a button and a popup, not a tick box).
let citizenPopup = false;
// One countdown per question, kept across redraws.
let countdown: { key: string; deadline: number } | null = null;
// Guided help can be turned off; kept on the device (task 10 request, task 14 B2).
const GUIDE_KEY = 'kaj-guide-off';
let guideOff = (() => { try { return localStorage.getItem(GUIDE_KEY) === '1'; } catch { return false; } })();
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
// The open popup menu of a drawn prop, and the zoomed view of the area map (kept while the
// player's area stays the same).
let popup: { kind: PopupKind; area: string } | null = null;
let camera: { focus: string; box: Box } | null = null;

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
      counts, rows, guideBox(), start,
      saved && 'state' in saved ? el('p', { className: 'small', textContent: 'Starting a new journey replaces the saved game.' }) : '',
      error,
      el('div', { className: 'row' }, button('← Back', renderStart)),
      el('p', { className: 'small', textContent: CREDITS })),
  );
}

// "Guided help" on the setup screen: turns the guide back on after "Turn off guided help".
function guideBox(): HTMLElement {
  const tick = el('input', { type: 'checkbox', checked: !guideOff });
  tick.addEventListener('change', () => {
    guideOff = !tick.checked;
    try { localStorage.setItem(GUIDE_KEY, guideOff ? '1' : '0'); } catch { /* not kept */ }
  });
  return el('label', { className: 'small' }, tick, ' 🧭 Guided help for people (what you can do each turn)');
}

// "You chose …": the profile's advantages and weaknesses (rulebook section 12), shown while
// choosing the home country (owner's request).
function profileNote(p: Profile, who = ''): HTMLElement {
  const price = TICKET_PRICE[p];
  const plane = TRAVEL_TURNS[p].airport;
  const ship = TRAVEL_TURNS[p].port;
  const trips = `planes ${plane ? plural(plane, 'travel turn') : 'arrive right away'}, ships ${plural(ship, 'travel turn')}`;
  const good: Record<Profile, string[]> = {
    backpacker: ['Never pays for a ticket: always the free quiz.', `+${CONTINENT_BONUS.backpacker!.points} for visiting ${CONTINENT_BONUS.backpacker!.continents} continents.`, 'Its own Backpacker event cards.'],
    business: [`+${plural(POINTS_BUSINESS_CITIZENSHIP, 'point')} when you get citizenship (any area).`, `Fast: ${trips}.`],
    luxury: ['Can fly or sail to any airport or port.', 'Citizenship at once, with no test.', `+${CONTINENT_BONUS.luxury!.points} for visiting ${CONTINENT_BONUS.luxury!.continents} continents.`, `Fast: ${trips}.`],
    nomad: [`Cheapest ticket: ${plural(price ?? 0, 'point')}.`, `+${POINTS_NOMAD_TRAVEL_TURN} for every turn on a plane or ship.`],
  };
  const bad: Record<Profile, string[]> = {
    backpacker: ['Travels by plane or ship only with the quiz (one try per turn).', `Slow: ${trips}.`],
    business: [`Ticket ${plural(price ?? 0, 'point')}.`],
    luxury: [`The highest ticket: ${plural(price ?? 0, 'point')}.`],
    nomad: ['Can never ask for citizenship.', `−${NOMAD_PENALTY} at the end with fewer than ${NOMAD_MIN_CONTINENTS} continents.`, `Slow: ${trips}.`],
  };
  return el('div', { className: 'note profile-note' },
    el('strong', { textContent: `${who ? `${who}, you` : 'You'} chose ${PROFILE_LABEL[p]}.` }),
    el('p', { className: 'small', textContent: `👍 ${good[p].join(' ')}` }),
    el('p', { className: 'small', textContent: `👎 ${bad[p].join(' ')}` }));
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
  const before = state;
  state = apply(state, map30, action);
  const after = state.players[mover.seat];
  const lines: string[] = [];
  if (mover.kind === 'human') {
    answered = answerResult(before, state, action);
    // The start area gives the welcome bonus, not visit points: no arrival lines for it.
    const arrival = action.type === 'chooseStart' ? null : arrivalLines(mover, after);
    if (arrival) arrivals.set(mover.seat, arrival);
  }
  if (offer && action.type === 'sellAnswer' && !action.accept) {
    lines.push(`🙅 ${COLOUR_NAMES[offer.to]} said no to ${name}'s ${BUSINESS_NAME[offer.business]} in ${areaById.get(offer.area)!.name}.`);
  }
  if (!examBefore && after.exam) {
    const where = areaById.get(after.exam.area)!.name;
    // A person's own Luxury citizenship has its own "granted" popup.
    if (after.exam.stage === 'granted') {
      if (mover.kind !== 'human') lines.push(`💎 ${name} is now a citizen of ${citizenshipName(after.citizenship!)}: entering it costs a ${VISA_PRICE}-point visa to ${name}.`);
    } else {
      lines.push(mover.kind === 'human'
        ? `🛂 ${name}: your citizenship request for ${where} has been approved! Your turn ends now. Next turn: the citizenship test, ${after.exam.questions.length} questions, ${EXAM_SECONDS} seconds each. No looking things up! You stay in ${where} until citizenship is granted.`
        : `🛂 ${name} asked for citizenship of ${where} and stays there for the test.`);
    }
  }
  const bonus = mover.profile ? CONTINENT_BONUS[mover.profile] : undefined;
  if (bonus && mover.visitedContinents.length < bonus.continents && after.visitedContinents.length >= bonus.continents) {
    lines.push(`${PROFILE_LABEL[mover.profile!]} bonus: ${name} has visited ${bonus.continents} continents, +${bonus.points}!`);
  }
  if (home) lines.push(`🏠 ${name} ran out of money, so the trip ends here: ${name} goes home to ${areaById.get(home)!.name}, free of any fees.`);
  if (lastTry && answered) {
    answered.lines.push(lastTry.pays
      ? `${QUIZ_TRIES} wrong answers here, so you pay the ticket and travel.`
      : `${QUIZ_TRIES} wrong answers here and no money for the ticket, so the trip ends here: you go home to ${areaById.get(lastTry.home)!.name}, free of any fees.`);
  } else if (lastTry) {
    lines.push(lastTry.pays
      ? `❌ ${name}: ${QUIZ_TRIES} wrong answers here, so ${name} pays the ticket and travels.`
      : `❌ ${name}: ${QUIZ_TRIES} wrong answers here and no money for the ticket, so the trip ends here: ${name} goes home to ${areaById.get(lastTry.home)!.name}, free of any fees.`);
  }
  if (state.challenged && !answered) lines.push(challengeNote(state.challenged));
  lines.push(...state.payments.map(paymentNote).filter((t) => t !== ''));
  // Event cards drawn by this move; a human's own start-of-turn card has its own box instead.
  const next = currentPlayer(state);
  lines.push(...state.drawn.filter((c) => !(c === state!.card && next.kind === 'human' && c.seat === next.seat)).map(cardNote));
  news.push(...lines);
  if (mover.kind === 'human' && lines.length > 0) newsNow = true;
  pendingFees = null;
  selling = false;
  citizenPopup = false;
  zoom = null;
  pickedStart = null;
  popup = null;
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
    popup = null;
    render();
  } else {
    act(action);
  }
}

// The move to make for a button (citizenship is a move of its own since task 14d).
function pick(_actions: Action[], plain: Action): Action {
  return plain;
}

const asksOffered = (actions: Action[]) => actions.filter((a) => a.type === 'askCitizenship');
const plainActions = (actions: Action[]) => actions.filter((a) => a.type !== 'askCitizenship');

function render(): void {
  if (!state) return renderStart();
  const s = state;
  const me = currentPlayer(s);
  const actions = legalActions(s, map30);
  // During a sale offer the buyer answers, on the seller's turn.
  const actor = s.offer ? s.players[s.offer.to] : me;
  const isRobot = s.phase !== 'finished' && actor.kind === 'robot';
  writeSave(s);
  clearTimeout(robotTimer);
  clearInterval(quizTimer);

  // The popup over the board (task 14 B2): main events show here, the right side is for info.
  const modal = renderModal(s, actions, isRobot);
  if (s.phase === 'chooseProfile') {
    const people = s.players.filter((p) => p.kind === 'human' && p.profile);
    app.replaceChildren(el('section', { className: 'card setup' }, title(), renderTurn(s, actions, isRobot),
      ...people.map((p) => profileNote(p.profile!, people.length > 1 ? COLOUR_NAMES[p.seat] : ''))));
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
    if (modal?.turn) {
      side.append(el('section', { className: 'card turn' }, el('h2', {}, dot(actor.seat), ` ${COLOUR_NAMES[actor.seat]}'s turn`)));
    } else {
      side.append(renderTurn(s, actions, isRobot));
    }
    // Right after choosing the profile, on the world view too, also while the robots choose
    // (owner's request): each person's profile, its advantages and weaknesses.
    if (s.phase === 'chooseStart') {
      const people = s.players.filter((p) => p.kind === 'human' && p.profile);
      for (const p of people) side.append(profileNote(p.profile!, people.length > 1 ? COLOUR_NAMES[p.seat] : ''));
    }
    app.replaceChildren(el('div', { className: 'game' }, header,
      el('div', { className: 'board' },
        el('div', { className: 'left' }, s.phase === 'chooseStart' ? renderStartMap(s, isRobot) : renderAreaView(s, isRobot)),
        side)),
      modal ? modal.node : '');
  }

  // Robots wait while a popup is open, so nothing is missed.
  if (isRobot && !modal) {
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
        ? `Tap an area in ${zoom} to choose it as your home country.`
        : 'Tap a continent on the map. Each player starts on a different continent. Welcome bonus: Europe, Asia, Africa +3 · Americas +4 · Oceania +5.' }),
      zoom ? el('p', { className: 'small', textContent: `⭐ Areas with a star have a wonder: your first visit there gives +${plural(POINTS_WONDER, 'point')} more. Each wonder has Guided Tours that one player can buy for ${plural(BUSINESS_PRICE.tours, 'point')}; after that, every other player who visits pays the owner a ${TOUR_FEE}-point tour fee.` }) : '',
      me.profile === 'backpacker'
        ? el('p', { className: 'small', textContent: '🎒 Tip: from Europe, Asia or Africa you can walk to 3 continents (+3 Backpacker bonus).' })
        : '');
  } else if (s.quiz) {
    renderQuiz(box, s, who);
  } else if (s.challenge) {
    renderChallenge(box, s, who);
  } else if (me.exam && (me.exam.stage === 'test' || me.exam.stage === 'result')) {
    renderCitizenship(box, s, who);
  } else if (me.loseTurn) {
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
    // Title, then the action buttons, then the guide (owner's order, task 14 B2).
    box.append(el('h2', {}, who, `, you are in ${here.name}`));
    if (actions.some((a) => a.type === 'blocked' || a.type === 'goHome') && blockedByMoney(s, map30, me)) {
      const homeName = areaById.get(homeFor(s, map30, me))!.name;
      const left = GO_HOME_TURNS - 1 - me.broke;
      box.append(el('p', { className: 'note', textContent: left <= 0
        ? `🏠 Your money has run out, and your trip ends here. You go home to ${homeName}, free of any fees.`
        : `💸 Out of money! You can't pay to enter any area or to board. ${s.businesses.some((b) => b.owner === me.seat) ? 'Sell a business to another player (💰 below), or wait for luck.' : 'Wait for luck.'} ${left === 1 ? 'Next turn' : `In ${left} turns`}, if you still can't pay, your trip ends and you go home to ${homeName}.` }));
    }
    const waiting = waitingNote(s);
    if (waiting) box.append(el('p', { className: 'small', textContent: waiting }));
    const warning = lastTryWarning(s, plainActions(actions));
    if (warning) box.append(el('p', { className: 'note', textContent: warning }));
    const row = el('div', { className: 'row' });
    if (asksOffered(actions).length > 0) {
      row.append(button(`🛂 Ask for citizenship of ${citizenshipName(citizenshipAreasOf(here.id))}…`, () => { citizenPopup = true; render(); }));
    }
    // Walking, planes, ships and buying are on the map (owner's choice, task 14 B1).
    for (const a of plainActions(actions)) {
      if (a.type === 'blocked') {
        row.append(button('⛔ No area you can enter — wait this turn', () => act(a)));
      } else if (a.type === 'goHome') {
        row.append(button(`🏠 Go home to ${areaById.get(homeFor(s, map30, me))!.name}`, () => act(a)));
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
      guideOff ? el('p', { className: 'small', textContent: 'Tap a green area to walk there. Tap the plane, ship or monument on your area for travel and tours. Tap any area for its details.' }) : '',
      renderGuide(s, actions),
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
  const left = EXAM_SECONDS;
  const clock = el('div', { className: 'clock' }, el('span', { className: 'secs', textContent: `⏱️ ${left} s` }), el('div', { className: 'timebar' }, el('span')));
  box.append(el('h2', {}, who, `: citizenship test for ${areaById.get(exam.area)!.name} — question ${n + 1} of ${exam.questions.length}`),
    el('p', { textContent: q.text }),
    el('div', { className: 'row' }, ...q.options.map((o, i) => button(o, () => act({ type: 'examAnswer', choice: i as 0 | 1 })))),
    clock);
  startCountdown(`examAnswer-${s.round}-${currentPlayer(s).seat}-${q.text}-${n}`, left, clock, () => act({ type: 'examAnswer', choice: (1 - q.correct) as 0 | 1 }));
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
  const left = QUIZ_SECONDS;
  const clock = el('div', { className: 'clock' }, el('span', { className: 'secs', textContent: `⏱️ ${left} s` }), el('div', { className: 'timebar' }, el('span')));
  box.append(el('h2', {}, who, `: Airline promotion — answer correctly and ${kind === 'airport' ? 'fly' : 'sail'} free to ${areaById.get(to)!.name}!`),
    el('p', { textContent: question.text }),
    el('div', { className: 'row' }, ...question.options.map((o, i) => button(o, () => act({ type: 'answer', choice: i as 0 | 1 })))),
    clock,
    el('p', { className: 'small', textContent: `Wrong answers here so far: ${currentPlayer(s).quizWrong}. A wrong answer uses this turn.${forcedPayNote(s, kind, to)}` }));
  startCountdown(`answer-${s.round}-${currentPlayer(s).seat}-${question.text}-${currentPlayer(s).quizWrong}`, left, clock, () => act({ type: 'answer', choice: (1 - question.correct) as 0 | 1 }));
}

// Travel-turn challenge: one a/b question, 15 seconds. Time out = wrong answer.
function renderChallenge(box: HTMLElement, s: GameState, who: HTMLElement): void {
  const c = s.challenge!;
  const left = CHALLENGE_SECONDS;
  const clock = el('div', { className: 'clock' }, el('span', { className: 'secs', textContent: `⏱️ ${left} s` }), el('div', { className: 'timebar' }, el('span')));
  const flag = c.flag && FLAGS[c.flag] ? el('img', { className: 'flag', src: FLAGS[c.flag], alt: 'A flag' }) : '';
  box.append(el('h2', {}, who, `: challenge! ${CHALLENGE_NAME[c.type]}`),
    flag,
    el('p', { textContent: c.question }),
    el('div', { className: 'row' }, ...c.options.map((o, i) => button(o, () => act({ type: 'challengeAnswer', choice: i as 0 | 1 })))),
    clock,
    el('p', { className: 'small', textContent: `Right +${CHALLENGE_POINTS}, wrong −${CHALLENGE_POINTS}. The journey goes on either way.` }));
  startCountdown(`challengeAnswer-${s.round}-${currentPlayer(s).seat}-${c.id}-${0}`, left, clock, () => act({ type: 'challengeAnswer', choice: (1 - c.correct) as 0 | 1 }));
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

// ---------- popups, answers and the guide (task 14 B2) ----------

// One countdown per question (a redraw doesn't restart it). Time out = wrong answer.
function startCountdown(key: string, seconds: number, clock: HTMLElement, onTimeout: () => void): void {
  if (countdown?.key !== key) countdown = { key, deadline: Date.now() + seconds * 1000 };
  const { deadline } = countdown;
  const secs = clock.querySelector<HTMLElement>('.secs')!;
  const bar = clock.querySelector<HTMLElement>('.timebar span')!;
  const tick = () => {
    const left = Math.max(0, deadline - Date.now());
    secs.textContent = `⏱️ ${Math.ceil(left / 1000)} s`;
    bar.style.width = `${(left / (seconds * 1000)) * 100}%`;
    clock.classList.toggle('hurry', left <= 5000);
    if (left <= 0) {
      clearInterval(quizTimer);
      onTimeout();
    }
  };
  tick();
  quizTimer = window.setInterval(tick, 250);
}

// The study line behind a quiz or test question (every fact has one).
function factFor(area: string, question: string): string {
  return map30.facts?.[area]?.find((f) => f.question === question)?.text ?? '';
}

// A line that teaches something after a challenge answer.
function challengeFact(c: Challenge): string {
  const right = c.options[c.correct];
  const cap = countryCapital(right);
  if (c.type === 'flag') return `This is the flag of ${right}.${cap ? ` Its capital is ${cap}.` : ''}`;
  if (c.type === 'capital') {
    const m = /capital of (?:the )?(.+)\?$/.exec(c.question);
    return m ? `${right} is the capital of ${m[1]}.` : '';
  }
  return cap ? `${right}: its capital is ${cap}.` : '';
}

// Right or wrong, the right answer and its fact, after a person's answer (owner's request).
function answerResult(before: GameState, after: GameState, action: Action): typeof answered {
  const me = currentPlayer(before);
  if (action.type === 'answer' && before.quiz) {
    const { question, to, kind } = before.quiz;
    const ok = action.choice === question.correct;
    const turns = me.profile ? TRAVEL_TURNS[me.profile][kind] : 0;
    return {
      ok,
      title: ok ? '✅ Right!' : '❌ Wrong answer',
      lines: [
        `${question.text} The answer is: ${question.options[question.correct]}.`,
        factFor(to, question.text),
        ok
          ? `${VEHICLE[kind]} Free ticket! You ${kind === 'airport' ? 'fly' : 'sail'} to ${areaById.get(to)!.name}${turns ? `: ${plural(turns, 'travel turn')}` : ' right away'}.`
          : `You lose this turn. Wrong answers here: ${after.players[me.seat].quizWrong || QUIZ_TRIES} of ${QUIZ_TRIES}.`,
      ].filter((t) => t !== ''),
    };
  }
  if (action.type === 'examAnswer' && me.exam) {
    const n = me.exam.answers.length;
    const q = me.exam.questions[n];
    const ok = action.choice === q.correct;
    return {
      ok,
      title: `${ok ? '✅ Right!' : '❌ Wrong answer'} (question ${n + 1} of ${me.exam.questions.length})`,
      lines: [`${q.text} The answer is: ${q.options[q.correct]}.`, factFor(me.exam.area, q.text)].filter((t) => t !== ''),
    };
  }
  if (action.type === 'challengeAnswer' && before.challenge) {
    const c = before.challenge;
    const ok = action.choice === c.correct;
    const change = after.challenged?.change ?? 0;
    return {
      ok,
      title: ok ? `✅ Right! +${plural(change, 'point')}` : `❌ Wrong answer${change ? ` −${plural(-change, 'point')}` : ''}`,
      lines: [`${c.question} The answer is: ${c.options[c.correct]}.`, challengeFact(c), 'The journey goes on.'].filter((t) => t !== ''),
    };
  }
  return null;
}

// What an arrival earned, for the guide on the next turn ("You got +1 for visiting Greece…").
function arrivalLines(before: Player, after: Player): { area: string; lines: string[] } | null {
  const id = after.area;
  if (!id || id === before.area) return null;
  const a = areaById.get(id)!;
  const lines: string[] = [];
  if (before.visitedAreas.includes(id)) {
    lines.push(`You had been here before, so visiting gives no points this time.`);
  } else {
    lines.push(`+${POINTS_NEW_AREA} for visiting a new area.`);
    if (a.wonder) lines.push(`+${POINTS_WONDER} more for visiting ${WONDER_NAME[id] ?? 'its wonder'}.`);
    if (!before.visitedContinents.includes(a.continent)) lines.push(`+${POINTS_NEW_CONTINENT} for a new continent: ${a.continent} (your ${plural(after.visitedContinents.length, 'continent')} so far).`);
    if (a.bigCountry) {
      const parts = map30.areas.filter((x) => x.bigCountry === a.bigCountry);
      const done = parts.filter((x) => after.visitedAreas.includes(x.id)).length;
      lines[0] = done === parts.length
        ? `🧩 ${a.bigCountry} is complete: all ${parts.length} parts visited!`
        : `🧩 ${a.bigCountry}: ${done} of ${parts.length} parts visited. Its points come when you have visited every part.`;
    }
  }
  const delta = after.points - before.points;
  lines.push(`In all: ${delta >= 0 ? '+' : '−'}${plural(Math.abs(delta), 'point')} (fees included). You have ${plural(after.points, 'point')}.`);
  return { area: id, lines: [`📍 You arrived in ${a.name}.`, ...lines] };
}

// Points a move would give, found by trying it on a copy of the state (fees not included).
function gainOf(s: GameState, action: Action, to: string): number {
  const me = currentPlayer(s);
  return apply(s, map30, action).players[me.seat].points - me.points + feeTotal(entryFees(s, me, me.area, to));
}

// The guide for the area the player is in (owner's request; texts approved in task 14).
function renderGuide(s: GameState, actions: Action[]): HTMLElement | string {
  const me = currentPlayer(s);
  if (guideOff || me.kind !== 'human' || s.phase !== 'play' || !me.area) return '';
  const here = areaById.get(me.area)!;
  const lines: string[] = [];
  const arrival = arrivals.get(me.seat);
  if (arrival && arrival.area === me.area) lines.push(...arrival.lines);

  for (const a of actions) {
    if (a.type !== 'buy') continue;
    const price = plural(BUSINESS_PRICE[a.business], 'point');
    lines.push(a.business === 'tours'
      ? `⭐ You can buy the Guided Tours of ${WONDER_NAME[here.id] ?? 'the wonder'}: it costs ${price}, and every other player who visits pays you ${plural(TOUR_FEE, 'point')}. Tap the monument.`
      : `${BUSINESS_ICON[a.business]} You can buy the ${BUSINESS_NAME[a.business]} here for ${price}: every paid ${a.business === 'airline' ? 'plane' : 'ship'} ticket from here goes to you. Tap the ${a.business === 'airline' ? 'plane' : 'ship'}.`);
  }

  const walks = plainActions(actions).flatMap((a) => (a.type === 'walk' ? [a] : []));
  if (walks.length > 0) {
    const list = walks.map((w) => {
      const g = gainOf(s, w, w.to);
      const fee = feeTotal(entryFees(s, me, me.area, w.to));
      return `${areaById.get(w.to)!.name} (${g > 0 ? `+${g}` : me.visitedAreas.includes(w.to) ? 'been there, +0' : '+0'}${fee ? `, fee ${fee}` : ''})`;
    });
    lines.push(`🚶 From ${here.name} you can walk to: ${list.join(', ')}. Tap a green area.`);
  }
  const closed = here.neighbours.flatMap((n) => {
    if (walks.some((w) => w.to === n)) return [];
    const there = s.players.find((p) => p.area === n);
    const booked = bookedBy(s, n);
    const name = areaById.get(n)!.name;
    if (there) return [`${name} (${COLOUR_NAMES[there.seat]} is there)`];
    if (booked) return [`${name} (booked by ${COLOUR_NAMES[booked.seat]})`];
    return [`${name} (you can't pay the fee)`];
  });
  if (closed.length > 0) lines.push(`⛔ Closed now: ${closed.join(', ')}.`);
  if (here.neighbours.length === 0) lines.push(`🏝️ You can't walk from here: take the plane or ship.`);

  const bonus = me.profile ? CONTINENT_BONUS[me.profile] : undefined;
  for (const w of walks) {
    const c = areaById.get(w.to)!.continent;
    if (me.visitedContinents.includes(c)) continue;
    const n = me.visitedContinents.length + 1;
    const more = bonus ? bonus.continents - n : 0;
    lines.push(`🌍 Going to ${areaById.get(w.to)!.name} takes you to your continent number ${n}: ${c} (+${POINTS_NEW_CONTINENT}).${
      bonus && more === 0 ? ` That also gives your +${bonus.points} ${PROFILE_LABEL[me.profile!]} bonus!`
      : bonus && more > 0 ? ` Then ${more} more for your +${bonus.points} bonus.` : ''}`);
    break;
  }

  for (const kind of ['airport', 'port'] as const) {
    if (!hasRoute(here.id, kind)) continue;
    const to = destinations(map30, here.id, kind, me.profile!).map((t) => areaById.get(t)!.name);
    const price = TICKET_PRICE[me.profile!];
    const turns = TRAVEL_TURNS[me.profile!][kind];
    lines.push(`${VEHICLE[kind]} There is ${kind === 'airport' ? 'an airport' : 'a port'} here: ${kind === 'airport' ? 'fly' : 'sail'} to ${to.join(', ')}. ${
      price === null ? 'Backpacker: only with the free quiz.' : `Ticket ${plural(price, 'point')}, or try the free quiz.`} ${turns ? plural(turns, 'travel turn') : 'You arrive right away'}. Tap the ${kind === 'airport' ? 'plane' : 'ship'}.`);
  }
  if (asksOffered(actions).length > 0) {
    lines.push(`🛂 You can ask for citizenship here (the button above). ${me.profile === 'luxury' ? 'Luxury: granted at once, and you can still move this turn.' : 'Your turn ends; next turn a short test, then citizenship is yours.'} Then every other player pays you ${plural(VISA_PRICE, 'point')} to enter.`);
  }

  const off = el('input', { type: 'checkbox' });
  off.addEventListener('change', () => {
    guideOff = true;
    try { localStorage.setItem(GUIDE_KEY, '1'); } catch { /* not kept */ }
    render();
  });
  return el('div', { className: 'guide' },
    el('h3', { textContent: '🧭 Guide' }),
    ...lines.map((t) => el('p', { className: 'small', textContent: t })),
    el('label', { className: 'small off' }, off, ' Turn off guided help'));
}

// Why a destination can't be chosen now (owner's report, task 14 B2: say it, don't just hide it).
function closedReason(s: GameState, to: string): string {
  const me = currentPlayer(s);
  const there = s.players.find((p) => p.area === to);
  if (there) return `⛔ ${COLOUR_NAMES[there.seat]} is there now`;
  const booked = bookedBy(s, to);
  if (booked && booked.seat !== me.seat) return `⏳ booked by ${COLOUR_NAMES[booked.seat]}`;
  const fees = feeTotal(entryFees(s, me, me.area, to));
  if (fees > me.points) return `💸 you can't pay the ${plural(fees, 'point')} fee`;
  return '⛔ not now';
}

// The popup over the board: an answer, what happened, an event card, or the current main event
// (quiz, test, challenge, entry fees, an offer). `turn` = the turn panel itself is in the popup.
function renderModal(s: GameState, actions: Action[], isRobot: boolean): { node: HTMLElement; turn: boolean } | null {
  const me = currentPlayer(s);
  const wrap = (content: HTMLElement, cls = '') => el('div', { className: 'modal-back' }, el('div', { className: `modal card ${cls}` }, content));
  const ok = (onClick: () => void, text = 'OK') => {
    const b = button(text, onClick);
    b.className = 'primary';
    return el('div', { className: 'row' }, b);
  };
  if (answered) {
    const r = answered;
    return { turn: false, node: wrap(el('div', {},
      el('h2', { textContent: r.title }),
      ...r.lines.map((t) => el('p', { textContent: t })),
      ok(() => { answered = null; render(); })), r.ok ? 'right' : 'wrong') };
  }
  if (news.length > 0 && (newsNow || !isRobot || s.phase === 'finished')) {
    return { turn: false, node: wrap(el('div', {},
      el('h2', { textContent: '📣 What happened' }),
      el('ul', {}, ...news.map((t) => el('li', { textContent: t }))),
      ok(() => { news = []; newsNow = false; render(); }))) };
  }
  const key = s.card ? `${s.card.round}-${s.card.seat}-${s.card.card.text}` : '';
  if (s.phase === 'play' && me.kind === 'human' && s.card?.seat === me.seat && !seenCards.has(key)) {
    return { turn: false, node: wrap(el('div', {}, renderCard(s.card), ok(() => { seenCards.add(key); render(); })), 'event') };
  }
  // Choosing the home country: stressed before it is confirmed (owner's request, task 14 A2).
  if (s.phase === 'chooseStart' && !isRobot && pickedStart) {
    const chosen = { type: 'chooseStart' as const, area: pickedStart };
    const name = areaById.get(pickedStart)!.name;
    const start = button(`🏠 Start in ${name}`, () => { detailArea = null; act(chosen); });
    start.className = 'primary';
    return { turn: false, node: wrap(el('div', {},
      el('h2', { textContent: `🏠 ${name} will be your home country for the whole game.` }),
      el('p', { textContent: 'Your home country is not a citizenship. If you are ever sent home (for example when your money runs out), you come back here.' }),
      el('div', { className: 'row' }, start, button('Choose again', () => { pickedStart = null; detailArea = null; render(); })))) };
  }
  // Citizenship steps, each in a popup (owner's request).
  if (citizenPopup && !isRobot && s.phase === 'play') {
    const where = me.area ? citizenshipName(citizenshipAreasOf(me.area)) : '';
    const yes = button(`🛂 Yes, ask for ${where}`, () => { citizenPopup = false; act({ type: 'askCitizenship' }); });
    yes.className = 'primary';
    return { turn: false, node: wrap(el('div', {},
      el('h2', { textContent: `🛂 Ask for citizenship of ${where}` }),
      el('p', { textContent: me.profile === 'luxury'
        ? `Luxury Traveler: no test. Citizenship of ${where} is granted at once, and you can still move this turn.`
        : `Your turn ends now and you stay in ${where}. Next turn: a short test (${EXAM_SECONDS} seconds a question). Then citizenship is yours and you can move on.` }),
      el('p', { textContent: `As a citizen, every other player pays you a ${VISA_PRICE}-point visa each time they enter that area${me.profile === 'business' ? `, and you get +${plural(POINTS_BUSINESS_CITIZENSHIP, 'point')} (Business Traveler)` : ''}. You can ask only once per game.` }),
      el('div', { className: 'row' }, yes, button('Not now', () => { citizenPopup = false; render(); })))) };
  }
  if (s.phase === 'play' && me.kind === 'human' && me.exam && (me.exam.stage === 'granted' || me.exam.stage === 'learning')) {
    const ek = `exam-${me.seat}-${me.exam.area}-${me.exam.stage}`;
    if (!seenCards.has(ek)) {
      const exam = me.exam;
      const bonus = me.profile === 'business' ? ` 💼 Business Traveler: +${plural(POINTS_BUSINESS_CITIZENSHIP, 'point')}.` : '';
      return { turn: false, node: wrap(el('div', {},
        el('h2', { textContent: `🎉 Citizenship granted: ${citizenshipName(me.citizenship!)}!` }),
        exam.stage === 'learning' ? el('p', { textContent: 'You learned the right answers 📖:' }) : '',
        exam.stage === 'learning' ? el('ol', {}, ...exam.questions.map((q, i) => {
          const mine = exam.answers[i];
          return el('li', {}, `${q.text} ✅ ${q.options[q.correct]}`, mine === q.correct ? '' : ` (you said: ${q.options[mine]})`);
        })) : '',
        el('p', { textContent: `Every other player now pays you a ${VISA_PRICE}-point visa to enter.${bonus} You may travel on.` }),
        ok(() => { seenCards.add(ek); render(); })), 'right') };
    }
  }
  // Every call to action is a popup (owner's request): quiz, test, challenge, fees, an offer,
  // the travel turn (play a challenge?), a lost turn, and being stuck or sent home.
  const main = !isRobot && s.phase === 'play'
    && (s.offer || s.quiz || s.challenge || pendingFees || me.travel || me.loseTurn
      || actions.some((a) => a.type === 'blocked' || a.type === 'goHome')
      || (me.exam && (me.exam.stage === 'test' || me.exam.stage === 'result')));
  if (main) return { turn: true, node: wrap(renderTurn(s, actions, isRobot)) };
  return null;
}

// ---------- drawn maps (task 14 A2, B1) ----------

interface Drawn { root: SVGSVGElement; labels: SVGGElement; paths: Map<string, SVGPathElement>; vb: Box; k: number; fs: number }

const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

// Draws the areas that show in the view (world units), squeezed by k across. Areas are filled
// with their own colour; no names on the map (owner's choice): tap an area for its details.
// Text and icons are sized in screen pixels (px), from the size of the pane the map fills.
function drawMap(view: Box, k: number, cls: (id: string) => string, onTap: (id: string) => (() => void) | null, pane: 'left' | 'world' = 'left', px = 15): Drawn {
  const vb = { x: view.x * k, y: view.y, w: view.w * k, h: view.h };
  const root = svg('svg', { viewBox: `${vb.x} ${vb.y} ${vb.w} ${vb.h}`, class: 'map-svg' });
  const shapes = svg('g', { transform: `scale(${k} 1)` });
  const paths = new Map<string, SVGPathElement>();
  for (const a of map30.areas) {
    const g = geo.get(a.id)!;
    if (!overlaps(g.box, view)) continue;
    const path = svg('path', { d: g.path, class: `land ${cls(a.id)}`, 'data-area': a.id });
    path.style.fill = areaColour.get(a.id)!;
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
  const h = pane === 'left' ? window.innerHeight - 115 : w / 2.6;
  const scale = Math.min(w / vb.w, h / vb.h);
  return { root, labels, paths, vb, k, fs: px / scale };
}

// Text at (x, y) in view units; a tappable one gets a pill behind it.
function label(d: Drawn, x: number, y: number, text: string, cls: string, size = 1, onTap?: () => void): void {
  const fs = d.fs * size;
  const g = svg('g', { class: `label ${cls}` });
  if (onTap) {
    const w = [...text].length * fs * 0.62 + fs;
    g.append(svg('rect', { x: x - w / 2, y: y - fs * 0.8, width: w, height: fs * 1.6, rx: fs * 0.8 }));
    g.classList.add('tap');
    g.addEventListener('click', (e) => { e.stopPropagation(); onTap(); });
  }
  g.append(svg('text', { x, y, 'font-size': fs, 'stroke-width': fs * 0.22, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, text));
  d.labels.append(g);
}

const inView = (d: Drawn, x: number, y: number) => x >= d.vb.x && x <= d.vb.x + d.vb.w && y >= d.vb.y && y <= d.vb.y + d.vb.h;

// Small icons on an area (neighbours and the world map): wonder, airport, port, citizenship.
function areaIcons(s: GameState, id: string): string {
  const a = areaById.get(id)!;
  const citizen = s.players.some((p) => p.citizenship?.includes(id));
  return `${a.wonder ? '⭐' : ''}${hasRoute(id, 'airport') ? '✈️' : ''}${hasRoute(id, 'port') ? '⛴️' : ''}${citizen ? '🛂' : ''}`;
}

// Visited marks (owner's request): one small dot per player who has been there.
function visitedDots(d: Drawn, s: GameState, id: string, x: number, y: number, r: number): void {
  const who = s.players.filter((p) => p.visitedAreas.includes(id));
  who.forEach((p, i) => {
    d.labels.append(svg('circle', { cx: x + (i - (who.length - 1) / 2) * r * 2.6, cy: y, r, fill: COLOURS[p.seat], class: 'visit' }));
  });
}

// Pinch to zoom and drag to move (owner's request, task 14 B1); a mouse wheel zooms too.
// The view is kept in `camera` until the player's area changes.
function attachZoom(root: SVGSVGElement, k: number): void {
  const pts = new Map<number, { x: number; y: number }>();
  let moved = false;
  let start: { box: Box; dist: number; mid: { x: number; y: number }; x: number; y: number } | null = null;
  const unit = () => {
    const r = root.getBoundingClientRect();
    return Math.max((camera!.box.w * k) / r.width, camera!.box.h / r.height);
  };
  const apply = (b: Box) => {
    const w = Math.min(Math.max(b.w, 1.5), 200);
    const h = (b.h * w) / b.w;
    camera!.box = { x: b.x + (b.w - w) / 2, y: b.y + (b.h - h) / 2, w, h };
    root.setAttribute('viewBox', `${camera!.box.x * k} ${camera!.box.y} ${camera!.box.w * k} ${camera!.box.h}`);
  };
  const begin = () => {
    const p = [...pts.values()];
    const mid = p.length > 1 ? { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 } : p[0];
    const dist = p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
    start = { box: { ...camera!.box }, dist, mid, x: mid.x, y: mid.y };
  };
  root.addEventListener('pointerdown', (e) => {
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) moved = false;
    begin();
  });
  root.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId) || !start) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = [...pts.values()];
    const u = unit();
    if (p.length > 1) {
      const dist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      const f = start.dist / Math.max(dist, 1);
      const b = start.box;
      apply({ x: b.x + (b.w - b.w * f) / 2, y: b.y + (b.h - b.h * f) / 2, w: b.w * f, h: b.h * f });
      moved = true;
    } else {
      const dx = p[0].x - start.x;
      const dy = p[0].y - start.y;
      if (!moved && Math.hypot(dx, dy) < 8) return;
      moved = true;
      apply({ ...start.box, x: start.box.x - (dx * u) / k, y: start.box.y - dy * u });
    }
  });
  const end = (e: PointerEvent) => {
    pts.delete(e.pointerId);
    if (pts.size > 0) begin();
  };
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);
  // A drag or pinch is not a tap.
  root.addEventListener('click', (e) => {
    if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
  }, true);
  root.addEventListener('wheel', (e) => {
    e.preventDefault();
    const f = e.deltaY > 0 ? 1.15 : 1 / 1.15;
    const b = camera!.box;
    apply({ x: b.x + (b.w - b.w * f) / 2, y: b.y + (b.h - b.h * f) / 2, w: b.w * f, h: b.h * f });
  }, { passive: false });
}

// Can the human act on the map now (walk, open the airport or port menu, buy)?
function mapTurn(s: GameState, isRobot: boolean): boolean {
  const me = currentPlayer(s);
  return !isRobot && s.phase === 'play' && me.area !== null && !s.quiz && !s.challenge && !pendingFees && !s.offer
    && !me.loseTurn && !(me.exam && (me.exam.stage === 'test' || me.exam.stage === 'result'));
}

// Left half: the current area, zoomed in, with its drawn airport, port, wonder and citizenship
// flag; neighbours around it (tap a green one to walk there, any other for its details).
function renderAreaView(s: GameState, isRobot: boolean): HTMLElement {
  const me = currentPlayer(s);
  const focus = me.area ?? me.travel?.to ?? me.home ?? map30.areas[0].id;
  const here = areaById.get(focus)!;
  const base = pad(geo.get(focus)!.core, 0.25, 2.5);
  const k = squeeze(base);
  if (!camera || camera.focus !== focus) camera = { focus, box: base };
  const actions = legalActions(s, map30);
  const myTurn = mapTurn(s, isRobot);
  const walks = new Map(myTurn ? plainActions(actions).flatMap((a) => (a.type === 'walk' ? [[a.to, a] as const] : [])) : []);
  const walkTo = (id: string) => () => go(pick(legalActions(s, map30), walks.get(id)!));
  const details = (id: string) => () => { detailArea = id; render(); };
  const d = drawMap(camera.box, k,
    (id) => (id === focus ? 'here' : walks.has(id) ? 'go' : here.neighbours.includes(id) ? 'near' : 'far'),
    (id) => (walks.has(id) ? walkTo(id) : details(id)));

  const { fs } = d;
  // Walk badges (owner's report, Russia West's neighbours): each one sits just across the border
  // it shares with this area, on the neighbour's side, so the badges spread around the area. A
  // badge that would still cover one already placed moves a little further out.
  const v = d.root.viewBox.baseVal;
  const [fx, fy] = geo.get(focus)!.centre;
  const placed: Box[] = [];
  const overlapsPlaced = (x: number, y: number, w: number, h: number) =>
    placed.some((b) => Math.abs(b.x - x) < (b.w + w) / 2 && Math.abs(b.y - y) < (b.h + h) / 2);
  const badgeSpot = (id: string, w: number, h: number): [number, number] => {
    const border = geo.get(focus)!.borderWith.get(id);
    const [cx, cy] = border ?? geo.get(id)!.centre;
    let dx = cx * k - fx * k;
    let dy = cy - fy;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    let x = cx * k;
    let y = cy;
    for (let step = 0; step < 14; step++) {
      // Out across the border (a walking link with no shared border starts from the neighbour).
      const out = (border ? 1.6 : 0) * fs + step * fs * 0.9;
      x = Math.min(Math.max(cx * k + dx * out, v.x + w / 2), v.x + v.width - w / 2);
      y = Math.min(Math.max(cy + dy * out, v.y + h / 2), v.y + v.height - h / 2);
      if (!overlapsPlaced(x, y, w, h)) break;
    }
    placed.push({ x, y, w, h });
    return [x, y];
  };
  for (const id of d.paths.keys()) {
    if (id === focus) continue;
    const walk = walks.get(id);
    const [cx0, cy] = geo.get(id)!.centre;
    const x = cx0 * k;
    if (inView(d, x, cy)) {
      const icons = areaIcons(s, id);
      if (icons) label(d, x, cy - fs * 1.4, icons, 'icons', 0.95);
      if (!walk && bookedBy(s, id)) label(d, x, cy + fs * 1.4, '⏳', 'icons', 0.9);
      visitedDots(d, s, id, x, cy + fs * 1.5, fs * 0.28);
    }
    if (walk) {
      const fees = feeTotal(entryFees(s, me, me.area, id));
      const text = `🚶${gainLabel(s, walk, areaById.get(id)!) || ' +0'}${fees ? ` 💰−${fees}` : ''}`;
      const w = ([...text].length * fs * 0.62 + fs) * 0.9;
      const [bx, by] = badgeSpot(id, w, fs * 1.6 * 0.9);
      label(d, bx, by, text, 'go', 0.9, walkTo(id));
    }
  }

  // The drawn props on the current area (owner-approved icons).
  const [hx0, hy] = geo.get(focus)!.centre;
  const hx = hx0 * k;
  const P = fs * 4.2;
  const open = (kind: PopupKind) => () => { popup = { kind, area: focus }; render(); };
  const owner = (kind: BusinessKind) => {
    const b = businessAt(s, focus, kind);
    return b?.owner !== undefined && b.owner !== null ? COLOURS[b.owner] : undefined;
  };
  // The pawn stands in the middle of the area; the props sit around it.
  // Top row, centred over the pawn: the wonder and the citizenship flag (side by side if both).
  const citizen = s.players.find((p) => p.citizenship?.includes(focus));
  const both = here.wonder && citizen;
  if (here.wonder) d.labels.append(place(monument(owner('tours')), both ? hx - P * 0.6 : hx, hy - P * 0.95, P, `Wonder: ${WONDER_NAME[focus] ?? here.name}`, open('wonder')));
  if (citizen) d.labels.append(place(citizenFlag(COLOURS[citizen.seat]), both ? hx + P * 0.6 : hx, hy - P * 0.95, P * 0.9, `${COLOUR_NAMES[citizen.seat]}'s citizenship`, open('citizen')));
  if (hasRoute(focus, 'airport')) d.labels.append(place(airport(owner('airline')), hx - P * 1.2, hy, P, 'Airport', open('airport')));
  if (hasRoute(focus, 'port')) d.labels.append(place(port(owner('ferry')), hx + P * 1.2, hy, P, 'Port', open('port')));
  visitedDots(d, s, focus, hx, hy + P * 0.75, fs * 0.32);

  // Pawns: every player standing in a drawn area.
  for (const p of s.players) {
    if (!p.area || !d.paths.has(p.area)) continue;
    const [cx, cy] = geo.get(p.area)!.centre;
    const x = p.area === focus ? hx : cx * k;
    const y = p.area === focus ? hy : cy;
    if (!inView(d, x, y)) continue;
    d.labels.append(place(pawn(COLOURS[p.seat], p === me), x, y, p.area === focus ? fs * 2.8 : fs * 2.2, `${COLOUR_NAMES[p.seat]}${p.profile ? ` · ${PROFILE_LABEL[p.profile]}` : ''}`));
  }
  attachZoom(d.root, k);

  const caption = me.travel
    ? `${VEHICLE[me.travel.kind]} ${COLOUR_NAMES[me.seat]} is on the way to ${here.name}`
    : 'Pinch or scroll to zoom · drag to move';
  const reset = button('⤢', () => { camera = null; render(); });
  reset.title = 'Back to the area';
  return el('div', { className: 'areaview' },
    el('div', { className: 'where' }, dot(me.seat), ` ${here.name} · ${here.continent} `, reset),
    d.root,
    el('div', { className: 'small caption', textContent: caption }),
    popup ? renderPopup(s, popup, myTurn) : '');
}

// The popup menus of the drawn props (planes, ships, wonder, citizenship).
type PopupKind = 'airport' | 'port' | 'wonder' | 'citizen';

function renderPopup(s: GameState, p: { kind: PopupKind; area: string }, myTurn: boolean): HTMLElement {
  const me = currentPlayer(s);
  const area = areaById.get(p.area)!;
  const actions = myTurn && me.area === p.area ? legalActions(s, map30) : [];
  const close = button('✕', () => { popup = null; render(); });
  const box = el('div', { className: 'popup card' });
  const buyButton = (kind: BusinessKind) => {
    const buy = actions.find((a) => a.type === 'buy' && a.business === kind);
    return buy ? button(`${BUSINESS_ICON[kind]} Buy for ${plural(BUSINESS_PRICE[kind], 'point')}`, () => act(buy)) : '';
  };
  const businessLine = (kind: BusinessKind) => {
    const b = businessAt(s, p.area, kind);
    if (!b) return '';
    return el('p', { className: 'small', textContent: `${BUSINESS_ICON[kind]} ${capital(BUSINESS_NAME[kind])}: ${b.owner === null
      ? `for sale, ${plural(BUSINESS_PRICE[kind], 'point')}; then ${BUSINESS_EARNS[kind]}.`
      : b.owner === me.seat ? 'yours.' : `owned by ${COLOUR_NAMES[b.owner]}.`}` });
  };

  if (p.kind === 'wonder') {
    box.append(el('div', { className: 'row spread' }, el('h3', { textContent: `⭐ ${capital(WONDER_NAME[p.area] ?? 'the wonder')}` }), close),
      el('p', { className: 'small', textContent: `A wonder of ${area.name}: the first visit gives +1 point more.` }),
      businessLine('tours'),
      el('div', { className: 'row' }, buyButton('tours')));
    return box;
  }
  if (p.kind === 'citizen') {
    const c = s.players.find((x) => x.citizenship?.includes(p.area))!;
    box.append(el('div', { className: 'row spread' }, el('h3', { textContent: `🛂 ${citizenshipName(c.citizenship!)}` }), close),
      el('p', { className: 'small', textContent: c === me
        ? `You are a citizen here: every other player pays you a ${VISA_PRICE}-point visa to enter.`
        : `${COLOUR_NAMES[c.seat]} is a citizen here: to enter you pay ${COLOUR_NAMES[c.seat]} a ${VISA_PRICE}-point visa.` }));
    return box;
  }

  const kind: RouteKind = p.kind;
  const price = me.profile ? TICKET_PRICE[me.profile] : null;
  const turns = me.profile ? TRAVEL_TURNS[me.profile][kind] : 0;
  const dests = me.profile && me.area === p.area ? destinations(map30, p.area, kind, me.profile)
    : (map30.routes ?? []).filter((r) => r.kind === kind && (r.a === p.area || r.b === p.area)).map((r) => (r.a === p.area ? r.b : r.a));
  box.append(el('div', { className: 'row spread' }, el('h3', { textContent: `${VEHICLE[kind]} ${kind === 'airport' ? 'Airport' : 'Port'} of ${area.name}` }), close),
    el('p', { className: 'small', textContent: `${price === null ? 'Backpacker: you travel only with the quiz.' : `Ticket ${plural(price, 'point')}${ticketTo(s, kind)}.`} ${plural(turns, 'travel turn')}. The quiz is free; a wrong answer uses the turn.` }),
    businessLine(kind === 'airport' ? 'airline' : 'ferry'),
    el('div', { className: 'row' }, buyButton(kind === 'airport' ? 'airline' : 'ferry')));
  const warning = lastTryWarning(s, plainActions(actions));
  if (warning) box.append(el('p', { className: 'note', textContent: warning }));
  const list = el('div', { className: 'dests' });
  for (const to of dests) {
    const t = areaById.get(to)!;
    const board = plainActions(actions).find((a) => a.type === 'board' && a.kind === kind && a.to === to);
    const quiz = plainActions(actions).find((a) => a.type === 'quiz' && a.kind === kind && a.to === to);
    const booked = bookedBy(s, to);
    const gain = board ?? quiz;
    const name = el('button', { className: 'link', textContent: `${t.name}${areaIcons(s, to) ? ` ${areaIcons(s, to)}` : ''}` });
    name.addEventListener('click', () => { detailArea = to; render(); });
    list.append(el('div', { className: 'dest' + (detailArea === to ? ' picked' : '') },
      name,
      el('span', { className: 'small', textContent: `${t.continent}${gain ? gainLabel(s, gain, t) : ''}${me.area === p.area ? feeLabel(s, to) : ''}` }),
      el('span', { className: 'row' },
        board ? button(`Pay ${price}`, () => go(pick(actions, board))) : '',
        quiz ? button('Quiz (free)', () => go(pick(actions, quiz))) : '',
        !board && !quiz && me.area === p.area ? el('span', { className: 'small', textContent: closedReason(s, to) }) : '')));
  }
  box.append(list);
  return box;
}

// Right half: the whole world. Players, trips, routes, booked and visited areas; tap for details.
function renderWorld(s: GameState): HTMLElement {
  const me = currentPlayer(s);
  const d = drawMap(pad(worldBox, 0.01), 1,
    (id) => [
      id === me.area ? 'here' : '',
      bookedBy(s, id) ? 'booked' : '',
      id === detailArea ? 'picked' : '',
    ].join(' '),
    (id) => () => { detailArea = detailArea === id ? null : id; render(); },
    'world', 10);
  for (const [id, path] of d.paths) {
    const b = bookedBy(s, id);
    if (b) path.style.stroke = COLOURS[b.seat];
    const [cx, cy] = geo.get(id)!.centre;
    visitedDots(d, s, id, cx, cy + d.fs * 0.55, d.fs * 0.2);
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
    d.labels.append(line, svg('circle', { cx: ax + (bx - ax) * t, cy: ay + (by - ay) * t, r: d.fs * 0.45, fill: COLOURS[p.seat], class: 'piece' }));
  }
  for (const p of s.players) {
    if (!p.area) continue;
    const [cx, cy] = centre(p.area);
    d.labels.append(svg('circle', { cx: cx + (p.seat - 1.5) * d.fs * 0.5, cy, r: d.fs * 0.45, fill: COLOURS[p.seat], class: 'piece' }));
  }
  return el('div', { className: 'world' }, d.root);
}

// The areas a citizenship of this area covers: the area, or every part of its big country.
function citizenshipAreasOf(id: string): string[] {
  const a = areaById.get(id)!;
  return a.bigCountry ? map30.areas.filter((x) => x.bigCountry === a.bigCountry).map((x) => x.id) : [id];
}

// The details of a tapped area (for planning; nobody moves): name, flags, capitals, wonder,
// businesses, routes, citizenship, visits.
function renderAreaDetails(s: GameState, id: string): HTMLElement {
  const a = areaById.get(id)!;
  const me = currentPlayer(s);
  const routes = (kind: RouteKind) => (map30.routes ?? []).filter((r) => r.kind === kind && (r.a === id || r.b === id))
    .map((r) => areaById.get(r.a === id ? r.b : r.a)!.name);
  const countries = (a.countries ?? []).map((c) => {
    const code = countryFlag(c);
    const cap = countryCapital(c);
    return el('div', { className: 'country' },
      code && FLAGS[code] ? el('img', { className: 'mini-flag', src: FLAGS[code], alt: '' }) : '',
      el('span', { textContent: `${c}${cap ? ` · capital ${cap}` : ''}` }));
  });
  const parts = a.bigCountry ? map30.areas.filter((x) => x.bigCountry === a.bigCountry) : [];
  const lines = [
    a.continent,
    a.wonder ? `⭐ ${capital(WONDER_NAME[id] ?? 'a wonder')}: the first visit gives +1 point more` : '',
    a.bigCountry ? `🧩 Part of ${a.bigCountry}: ${me.profile ? `you have visited ${parts.filter((x) => me.visitedAreas.includes(x.id)).length}/${parts.length} parts` : `${parts.length} parts`}` : '',
    routes('airport').length ? `✈️ Airport: flights to ${routes('airport').join(', ')}` : '',
    routes('port').length ? `⛴️ Port: ships to ${routes('port').join(', ')}` : '',
    `🚶 Walk to: ${a.neighbours.map((n) => areaById.get(n)!.name).join(', ') || 'nowhere (plane or ship only)'}`,
    ...s.businesses.filter((b) => b.area === id).map((b) => `${BUSINESS_ICON[b.kind]} ${capital(BUSINESS_NAME[b.kind])}: ${b.owner === null ? `for sale, ${plural(BUSINESS_PRICE[b.kind], 'point')}` : `owned by ${COLOUR_NAMES[b.owner]}`}`),
    ...s.players.filter((p) => p.citizenship?.includes(id)).map((p) => `🛂 ${COLOUR_NAMES[p.seat]} is a citizen here: others pay a ${VISA_PRICE}-point visa`),
    ...s.players.filter((p) => p.area === id).map((p) => `📍 ${COLOUR_NAMES[p.seat]} is here`),
    ...s.players.filter((p) => p.home === id).map((p) => `🏠 ${COLOUR_NAMES[p.seat]}'s home country`),
    bookedBy(s, id) ? `⏳ Booked: ${COLOUR_NAMES[bookedBy(s, id)!.seat]} is on the way here` : '',
    `Visited by: ${s.players.filter((p) => p.visitedAreas.includes(id)).map((p) => COLOUR_NAMES[p.seat]).join(', ') || 'nobody yet'}`,
  ].filter((t) => t !== '');
  return el('div', { className: 'card details' },
    el('div', { className: 'row spread' }, el('h3', { textContent: a.name }), button('✕', () => { detailArea = null; render(); })),
    ...countries,
    ...lines.map((t) => el('p', { className: 'small', textContent: t })));
}

// Choosing the home country: the 6 continents first, then a zoom into one (no names on the map:
// the tapped area's name and details show on the right).
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
    for (const path of d.paths.values()) path.style.fill = '';
    for (const c of continents) {
      const ids = map30.areas.filter((a) => a.continent === c).map((a) => geo.get(a.id)!.centre);
      const x = ids.reduce((t, p) => t + p[0], 0) / ids.length;
      const y = ids.reduce((t, p) => t + p[1], 0) / ids.length;
      const taken = s.players.find((p) => p.startContinent === c);
      label(d, x, y, taken ? `${c}: ${COLOUR_NAMES[taken.seat]}` : c, open(c) ? 'go' : 'near', 1,
        open(c) ? () => { zoom = c; render(); } : undefined);
    }
    for (const p of s.players) {
      if (!p.area) continue;
      const [cx, cy] = geo.get(p.area)!.centre;
      d.labels.append(svg('circle', { cx: cx + (p.seat - 1.5) * d.fs * 0.8, cy, r: d.fs * 0.4, fill: COLOURS[p.seat], class: 'piece' }));
    }
    wrap.append(el('div', { className: 'where' }, 'The world: tap a continent'), d.root);
    return wrap;
  }
  const c = zoom;
  const view = pad(continentBox(map30, geo, c), 0.04, 1.5);
  const k = squeeze(view);
  const pickArea = (id: string) => () => { pickedStart = id; detailArea = id; render(); };
  const d = drawMap(view, k,
    (id) => (id === pickedStart ? 'here' : legal.has(id) ? 'go' : areaById.get(id)!.continent === c ? 'far' : 'dim'),
    (id) => (legal.has(id) ? pickArea(id) : null));
  for (const a of map30.areas.filter((x) => x.continent === c)) {
    const [x, y] = geo.get(a.id)!.centre;
    if (a.wonder) label(d, x * k, y, '⭐', 'icons', 1.1);
  }
  wrap.append(el('div', { className: 'where' }, button('← All continents', () => { zoom = null; pickedStart = null; detailArea = null; render(); }), ` ${c}: tap an area`), d.root);
  return wrap;
}

renderStart();
