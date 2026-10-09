// The game screens on top of the engine. Task 14 A2: poster, setup, home-area picker, and the
// landscape board (left: the current area drawn; right: the world map and the turn panel).
// Robots play with simple rules, at the level chosen for each seat (task 13).

import { BUSINESS_PRICE, CHALLENGE_POINTS, CONTINENT_BONUS, EXAM_FACTS, EXAM_PASS, POINTS_NOMAD_TRAVEL_TURN, POINTS_NEW_AREA, POINTS_NEW_CONTINENT, POINTS_WONDER, GO_HOME_TURNS, NOMAD_MIN_CONTINENTS, NOMAD_PENALTY, NOMAD_WARNING_ROUND, POINTS_BUSINESS_CITIZENSHIP, QUIZ_TRIES, ROUTE_KINDS, TICKET_BUSINESS, TICKET_PRICE, ticketPrice, TOUR_FEE, TRAVEL_TURNS, VISA_PRICE } from '../engine/constants.ts';
import {
  apply, blockedByMoney, examPassed, bookedBy, businessAt, canPayAfterQuiz, destinations, businessValue, createGame, currentPlayer, entryFees, feeTotal, finalScore, homeFor, landTurnsToCard, legalActions, nomadPenalty,
} from '../engine/engine.ts';
import { robotAction } from '../engine/normal-robot.ts';
import { loadGame, saveGame } from '../engine/save.ts';
import type { Action, Area, BusinessKind, Challenge, ChallengeResult, ChallengeType, Continent, Deck, DrawnCard, GameState, Payment, Player, Profile, RobotLevel, RouteKind, SeatKind } from '../engine/types.ts';
import { map30 } from '../maps/map30.ts';
import { shapes30 } from '../maps/shapes30.ts';
import { countryCapital, countryFlag, WONDER_NAME, WONDER_PLACE } from './countries.ts';
import { buildGeo, colourAreas, continentBox, pad, squeeze, svg, unionBox, type Box } from './maps.ts';
import { airport, citizenFlag, monument, pawn, place, port, station } from './props.ts';
import { iconEl, iconUse, installIcons, PROFILE_COLOUR } from './icons.ts';
import { hasWonderScene, tripScene, wonderScene } from './scenes.ts';
import { guideSeen, runGuide } from './tutorial.ts';
import { play, setMusic, soundOn, startTimer, stopTimer, toggleSound, type SoundName } from './sound.ts';

// Players are named by their profile, with its icon and colour (owner's change, after task 14g);
// before the profiles are chosen they are "Player 1", "Player 2"…
const PROFILE_LABEL: Record<Profile, string> = {
  backpacker: 'Backpacker',
  business: 'Business Traveler',
  luxury: 'Luxury Traveler',
  nomad: 'Digital Nomad',
};
// The short names, where the long ones don't fit (the top bar, map pieces).
const PROFILE_SHORT: Record<Profile, string> = { backpacker: 'Backpacker', business: 'Business', luxury: 'Luxury', nomad: 'Nomad' };
const profileOf = (seat: number): Profile | null => state?.players[seat]?.profile ?? null;
const nameOf = (seat: number): string => { const p = profileOf(seat); return p ? PROFILE_LABEL[p] : `Player ${seat + 1}`; };
const shortOf = (seat: number): string => { const p = profileOf(seat); return p ? PROFILE_SHORT[p] : `Player ${seat + 1}`; };
const colourOf = (seat: number): string => { const p = profileOf(seat); return p ? PROFILE_COLOUR[p] : '#cfe6e2'; };
// A calmer pace (owner's request, task 14i): robots wait longer, and a walk is shown.
const ROBOT_DELAY_MS = 1400;
const WALK_MS = 1500;
// A calm game (owner's request): after a popup is closed, the board shows for a moment before the
// next popup opens. Popups that answer the player's own tap (a quiz, an answer, fees) open at once.
const POPUP_PAUSE_MS = 2000;
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
const CREDITS = 'Country data: mledoze/countries, ODbL 1.0 · Flags: flag-icons by Panayiotis Lipiridis, MIT licence · Map shapes: Natural Earth · Lettering: Cinzel, SIL Open Font Licence · Sounds: Pixabay, Pixabay Content License';
// Citizenship test: 15 seconds for each question (owner's choice, task 8).
const EXAM_SECONDS = 15;
const VEHICLE: Record<RouteKind, string> = { airport: '✈️', port: '⚓', station: '🚆' };
// Words for each way to travel (the train: task 17).
const TRAVEL_WORDS: Readonly<Record<RouteKind, { verb: string; vehicle: string; place: string; a: string; sound: SoundName; promo: string }>> = {
  airport: { verb: 'fly', vehicle: 'plane', place: 'airport', a: 'a plane', sound: 'plane', promo: 'Airline' },
  port: { verb: 'sail', vehicle: 'ship', place: 'port', a: 'a ship', sound: 'ship', promo: 'Airline' },
  station: { verb: 'ride the train', vehicle: 'train', place: 'station', a: 'the train', sound: 'train', promo: 'Railway' },
};
const BUSINESS_ICON: Record<BusinessKind, string> = { tours: '🏛️', airline: '✈️', ferry: '⚓', train: '🚆' };
const BUSINESS_NAME: Record<BusinessKind, string> = { tours: 'guided tours', airline: 'airline', ferry: 'ferry agency', train: 'train ticket booth' };
const BUSINESS_EARNS: Record<BusinessKind, string> = {
  tours: `every other player pays you ${plural(TOUR_FEE, 'point')} to enter`,
  airline: 'every paid plane ticket from here goes to you',
  ferry: 'every paid ship ticket from here goes to you',
  train: 'every paid train ticket from here goes to you',
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
// The end of a turn (owner's request, task 14i): the map stays on the player who just moved
// while their piece walks there; a person then sees what the turn gave and taps "End turn"
// (a robot's ends by itself).
let hold: { seat: number; from: string | null; to: string | null; lines: string[]; ready: boolean; animated: boolean } | null = null;
let holdTimer = 0;
let quizTimer = 0;
// What happened (other players' moves, payments, cards), shown in one popup (task 14 B2):
// on a person's turn, or straight after a person's own move (`newsNow`).
let news: string[] = [];
let newsNow = false;
// Money people earn from others (visa, tour fee, a ticket on their airline or ferry): a gold
// popup for each person, never for a robot (owner's request).
let income: { seat: number; text: string }[] = [];
// The popup after a person answers a quiz, test or challenge question: right or wrong, the
// right answer and the fact behind it (owner's request).
let answered: { ok: boolean; title: string; lines: string[] } | null = null;
// Event cards already shown in a popup (round, seat, card).
const seenCards = new Set<string>();
// The "Ask for citizenship" popup is open (owner's request: a button and a popup, not a tick box).
let citizenPopup = false;
// Until when the next popup waits (POPUP_PAUSE_MS after a popup was closed).
let pauseUntil = 0;
let pauseTimer = 0;
const pauseNext = () => { pauseUntil = Date.now() + POPUP_PAUSE_MS; };
// The citizenship test question the player said "ready" for (its clock runs only after that).
let examReady: string | null = null;
// One countdown per question, kept across redraws.
let countdown: { key: string; deadline: number } | null = null;
// The popup that last played its sound (task 14C).
let lastSound: unknown;
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

// A profile button: its icon and name.
function iconButton(profile: Profile, onClick: () => void): HTMLButtonElement {
  const b = button(` ${PROFILE_LABEL[profile]}`, onClick);
  b.prepend(iconEl(profile));
  return b;
}

// The player's icon (a plain dot before the profiles are chosen).
function dot(seat: number): Element {
  const p = profileOf(seat);
  if (p) return iconEl(p);
  return el('span', { className: 'dot', title: nameOf(seat) });
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

// The 🔊 / 🔇 button: all sounds and the music on or off, kept on the device (task 14C).
function soundButton(): HTMLButtonElement {
  const b = button(soundOn() ? '🔊' : '🔇', () => { toggleSound(); b.textContent = soundOn() ? '🔊' : '🔇'; });
  b.title = 'Sound on or off';
  return b;
}

// The title, in the poster's lettering (Cinzel, see web/style.css).
function title(tag: 'h1' | 'strong' = 'h1'): HTMLElement {
  return el(tag, { className: 'title', textContent: "Kris Ann's Journey" });
}

// ---------- start screen: the owner's poster ----------

function renderStart(): void {
  clearTimeout(robotTimer);
  clearTimeout(holdTimer);
  hold = null;
  clearInterval(quizTimer);
  stopTimer();
  setMusic('menu');
  state = null;
  const saved = readSave();
  // The guide starts by itself on the very first ▶ Play (owner's request).
  const guide = (after: () => void) => runGuide({
    app, geo, areaColour, el, button,
    flag: (country) => { const code = countryFlag(country); return code && FLAGS[code] ? el('img', { className: 'mini-flag', src: FLAGS[code], alt: '' }) : ''; },
    question: (title, text, options, correct, onAnswer, key, note) => timedQuestion([title], text, options, correct, onAnswer, QUIZ_SECONDS, key, note),
    stopClock: () => { clearInterval(quizTimer); stopTimer(); },
  }, after);
  const play = button('▶ Play', () => (guideSeen() ? renderSetup() : guide(renderSetup)));
  play.className = 'primary big';
  const howTo = button('📖 How to play', () => guide(renderStart));
  const resume = saved && 'state' in saved
    ? button(`Continue (round ${saved.state.round} / ${saved.state.totalRounds})`, () => { state = saved.state; render(); })
    : null;
  app.replaceChildren(
    el('section', { className: 'poster' },
      POSTER ? el('img', { src: POSTER, alt: "Kris Ann's Journey" }) : title(),
      el('div', { className: 'poster-buttons' }, play, resume ?? '', howTo, soundButton())),
  );
}

// ---------- setup screen ----------

function renderSetup(): void {
  clearTimeout(robotTimer);
  clearTimeout(holdTimer);
  hold = null;
  clearInterval(quizTimer);
  stopTimer();
  setMusic('menu');
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
        return el('div', { className: 'seat' }, `Player ${i + 1} `, select, kind === 'robot' ? level : '');
      }),
    );
  };
  draw();

  const saved = readSave();
  const start = button('Start journey', () => {
    try {
      const seed = Math.floor(Math.random() * 2 ** 31);
      robotSeed = seed ^ 0x5bd1e995;
      const seats = kinds.slice(0, count).map((kind, i) => ({ kind, colour: ['red', 'blue', 'green', 'yellow'][i], ...(kind === 'robot' ? { level: levels[i] } : {}) }));
      zoom = null;
      pickedStart = null;
      seenCards.clear();
      news = [];
      income = [];
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
    nomad: [`Cheapest plane and ship ticket: ${plural(price ?? 0, 'point')}.`, `+${POINTS_NOMAD_TRAVEL_TURN} for every turn on a plane, ship or train.`],
  };
  const bad: Record<Profile, string[]> = {
    backpacker: ['Travels by plane, ship or train only with the quiz (one try per turn).', `Slow: ${trips}.`],
    business: [`Ticket ${plural(price ?? 0, 'point')}.`],
    luxury: [`The highest ticket: ${plural(price ?? 0, 'point')}.`, 'Can\'t take the train.'],
    nomad: [`Train ticket ${plural(ticketPrice('nomad', 'station') ?? 0, 'point')}.`, 'Can never ask for citizenship.', `−${NOMAD_PENALTY} at the end with fewer than ${NOMAD_MIN_CONTINENTS} continents.`, `Slow: ${trips}.`],
  };
  return el('div', { className: 'note profile-note' },
    el('strong', {}, who ? '' : 'You chose ', iconEl(p), ` ${PROFILE_LABEL[p]}${who ? '' : '.'}`),
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
  const name = nameOf(mover.seat);
  const examBefore = mover.exam;
  const home = action.type === 'goHome' ? homeFor(state, map30, mover) : null;
  // A 3rd wrong quiz answer: pay and travel, or go home (owner's rule, task 13).
  const quiz = state.quiz;
  const lastTry = action.type === 'answer' && quiz && action.choice !== quiz.question.correct && mover.quizWrong >= QUIZ_TRIES - 1
    ? { pays: canPayAfterQuiz(state, mover, quiz.kind, quiz.to), home: homeFor(state, map30, mover) } : null;
  const offer = state.offer;
  const before = state;
  state = apply(state, map30, action);
  const after = state.players[mover.seat];
  const lines: string[] = [];
  stopTimer();
  if (mover.kind === 'human') {
    moveSound(action, state.payments.some((p) => p.from === mover.seat && (p.reason === 'buy' || p.reason === 'sale')));
    answered = answerResult(before, state, action);
  } else if (action.type === 'walk') {
    play('walk');
  }
  // The turn is over: hold the map on the mover (the start area gives the welcome bonus, not
  // visit points: no hold for choosing it).
  if (state.phase === 'play' && action.type !== 'chooseStart' && (currentPlayer(state).seat !== mover.seat || state.round !== before.round)) {
    const walked = action.type === 'walk' || action.type === 'goHome';
    hold = { seat: mover.seat, from: walked ? mover.area : null, to: walked ? after.area : null, lines: arrivalLines(mover, after)?.lines ?? [], ready: false, animated: false };
    const h = hold;
    clearTimeout(holdTimer);
    holdTimer = window.setTimeout(() => {
      if (hold !== h) return;
      if (mover.kind === 'robot') hold = null;
      else h.ready = true;
      render();
    }, walked ? WALK_MS + 300 : mover.kind === 'robot' ? 600 : 200);
  }
  if (offer && action.type === 'sellAnswer' && !action.accept) {
    lines.push(`🙅 ${nameOf(offer.to)} said no to ${name}'s ${BUSINESS_NAME[offer.business]} in ${areaById.get(offer.area)!.name}.`);
  }
  if (!examBefore && after.exam) {
    const where = areaById.get(after.exam.area)!.name;
    // A person's own Luxury citizenship has its own "granted" popup.
    if (after.exam.stage === 'granted') {
      if (mover.kind !== 'human') lines.push(`💎 ${name} is now a citizen of ${citizenshipName(after.citizenship!)}: entering it costs a ${VISA_PRICE}-point visa to ${name}.`);
    } else {
      lines.push(mover.kind === 'human'
        ? `🛂 ${name}: your citizenship request for ${where} has been approved! Your turn ends now. Next turn: read ${EXAM_FACTS} facts about ${where}, then answer ${after.exam.questions.length} questions about them, ${EXAM_SECONDS} seconds each. ${EXAM_PASS} right answers or more: citizenship is yours. You stay in ${where} until then.`
        : `🛂 ${name} asked for citizenship of ${where} and stays there for the test.`);
    }
  }
  const bonus = mover.profile ? CONTINENT_BONUS[mover.profile] : undefined;
  if (bonus && mover.visitedContinents.length < bonus.continents && after.visitedContinents.length >= bonus.continents) {
    lines.push(`${PROFILE_LABEL[mover.profile!]} bonus: ${name} has visited ${bonus.continents} continents, +${bonus.points}!`);
  }
  // A robot's citizenship test result, at the start of its turn 3.
  for (const p of state.players) {
    const was = before.players[p.seat].exam;
    if (p.kind === 'human' || was?.stage !== 'result' || !p.exam || p.exam.stage === 'result') continue;
    const who = nameOf(p.seat);
    const where = areaById.get(p.exam.area)!.name;
    lines.push(p.exam.stage === 'granted'
      ? `🛂 ${who} passed the citizenship test and is now a citizen of ${citizenshipName(p.citizenship!)}: entering it costs a ${VISA_PRICE}-point visa to ${who}.`
      : `🛂 ${who} failed the citizenship test: no citizenship of ${where}.`);
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
  // A robot's trip (owner's request, task 17): which plane, ship or train it took, and where to.
  const tripKind = action.type === 'board' ? action.kind : action.type === 'answer' && quiz ? quiz.kind : null;
  const tripTo = action.type === 'board' ? action.to : quiz?.to;
  if (mover.kind === 'robot' && tripKind && tripTo && (after.travel?.to === tripTo || (after.area === tripTo && mover.area !== tripTo))) {
    const free = action.type === 'answer' && action.choice === quiz!.question.correct ? ' with a free quiz ticket' : '';
    lines.push(`${VEHICLE[tripKind]} ${name} took ${TRAVEL_WORDS[tripKind].a} to ${areaById.get(tripTo)!.name}${free}.`);
  }
  // Robots' challenges and event cards are not told to people (owner's request, task 17).
  if (state.challenged && !answered && state.players[state.challenged.seat].kind === 'human') lines.push(challengeNote(state.challenged));
  for (const p of state.payments) {
    const line = incomeLine(state, p);
    if (line) income.push(line);
    else if (paymentNote(p) !== '') lines.push(paymentNote(p));
  }
  if (mover.kind === 'human' && income.length > 0) newsNow = true;
  // Event cards drawn by this move; a human's own start-of-turn card has its own box instead.
  const next = currentPlayer(state);
  lines.push(...state.drawn.filter((c) => state!.players[c.seat].kind === 'human' && !(c === state!.card && next.kind === 'human' && c.seat === next.seat)).map(cardNote));
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

// A person's own move: footsteps, a plane, a ship, a train, or coins for buying a business (task 14C).
// Answers, cards, money from others and the end of the game sound with their popups.
function moveSound(action: Action, bought: boolean): void {
  if (bought) play('coins');
  else if (action.type === 'walk') play('walk');
  else if (action.type === 'board') play(TRAVEL_WORDS[action.kind].sound);
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
  return `🔔 ${nameOf(c.seat)}'s ${c.card.deck} card ${DECK_ICON[c.card.deck]}: “${c.card.text}” ${cardEffect(c)}`;
}

function renderCard(c: DrawnCard): HTMLElement {
  return el('div', { className: 'note' },
    el('strong', { textContent: `🔔 Event card · ${DECK_ICON[c.card.deck]} ${c.card.deck} card` }),
    el('p', { textContent: `“${c.card.text}”` }),
    el('p', { textContent: cardEffect(c) }));
}

// The event card in its popup: a big golden card (owner's request: "it must look like an event").
// Where the news comes from: the area the player is in (Backpacker tips come from the road).
function newsFrom(c: DrawnCard): string {
  const area = state?.players[c.seat].area;
  if (c.card.deck === 'backpacker') return 'Backpacker news';
  return area ? `News from ${areaById.get(area)!.name}` : 'News';
}

// The phone that buzzes before an event card (owner's request, task 14k): only "Read".
function phoneNews(c: DrawnCard, onRead: () => void): HTMLElement {
  const read = button('📱 Read', onRead);
  read.className = 'primary';
  const area = state?.players[c.seat].area;
  return el('div', { className: 'phone-wrap' },
    el('div', { className: 'phone' }, el('div', { className: 'phone-screen' },
      el('div', { className: 'phone-notch' }),
      el('div', { className: 'phone-time', textContent: new Date().toTimeString().slice(0, 5) }),
      el('div', { className: 'phone-date', textContent: `Round ${state?.round} of ${state?.totalRounds}` }),
      el('div', { className: 'phone-note' },
        el('div', { className: 'phone-app' }, el('span', { className: 'phone-badge', textContent: 'K' }), 'KAJ News', el('span', { className: 'phone-now', textContent: 'now' })),
        el('h4', {}, dot(c.seat), ` ${nameOf(c.seat)}, breaking news!`),
        el('p', { textContent: area ? `📍 From ${areaById.get(area)!.name}, where you are now…` : '📍 Where you are now…' })),
      el('div', { className: 'phone-read' }, read))));
}

function eventCard(c: DrawnCard): HTMLElement {
  const { points, loseTurn } = c.card;
  const badge = loseTurn ? '⏸️ Lose a turn' : points > 0 ? `+${plural(points, 'point')}` : `−${plural(Math.abs(points), 'point')}`;
  return el('div', { className: 'event-card' },
    el('div', { className: 'event-rays' }),
    el('div', { className: 'event-kind' }, dot(c.seat), ` ${nameOf(c.seat)} · 📰 ${newsFrom(c)}`),
    el('h2', { className: 'event-title', textContent: c.card.title }),
    el('p', { className: 'event-text', textContent: `“${c.card.text}”` }),
    el('div', { className: 'event-meaning' }, 'What this means for you: ',
      el('span', { className: `event-badge ${loseTurn || points < 0 ? 'bad' : 'good'}`, textContent: badge })),
    // Only when it says more than the badge (e.g. "only 1 to lose").
    !loseTurn && c.change !== points ? el('p', { className: 'small', textContent: cardEffect(c) }) : '');
}

// A payment to a person from someone else: their income, cheered in a popup (owner's request).
function incomeLine(s: GameState, p: Payment): { seat: number; text: string } | null {
  if (p.to === null || p.to === p.from || s.players[p.to].kind !== 'human') return null;
  const from = `${nameOf(p.from)}${s.players[p.from].kind === 'robot' ? ' 🤖' : ''}`;
  const where = areaById.get(p.area)!.name;
  const pts = plural(p.amount, 'point');
  switch (p.reason) {
    case 'visa': return { seat: p.to, text: `🛂 ${from} just paid you a ${pts} visa to enter ${where}, your citizenship country!` };
    case 'tour': return { seat: p.to, text: `🏛️ ${from} just paid you ${pts} to visit your Guided Tours of ${WONDER_NAME[p.area] ?? where}!` };
    case 'ticket': return { seat: p.to, text: `${p.business === 'ferry' ? '⚓' : '✈️'} ${from} just ${p.business === 'ferry' ? 'sailed with your ferry agency' : 'flew with your airline'} from ${where}: +${pts} for you!` };
    default: return null;
  }
}

// The end of the game: the winner popup. People are always cheered, robots never (owner's rule).
function finishPopup(s: GameState, close: () => void): HTMLElement {
  const r = s.result!;
  const name = (seat: number) => `${nameOf(seat)}${s.players[seat].kind === 'robot' ? ' 🤖' : ''}`;
  const people = s.players.filter((p) => p.kind === 'human');
  const humanWinners = r.winners.filter((w) => s.players[w].kind === 'human');
  const title = humanWinners.length > 0
    ? `🎉 ${humanWinners.map((w) => nameOf(w)).join(' and ')} ${humanWinners.length > 1 || r.winners.length > 1 ? 'share the cup' : 'wins'}!`
    : '🏁 The journey is over!';
  const cheers = people.map((p) => (r.winners.includes(p.seat)
    ? `🏆 Congratulations, ${nameOf(p.seat)}! What a journey: ${plural(finalScore(s, p), 'point')}, ${plural(p.visitedAreas.length, 'area')} and ${plural(p.visitedContinents.length, 'continent')}!`
    : `🌟 ${nameOf(p.seat)}, you did a great job: ${plural(p.visitedAreas.length, 'area')} and ${plural(p.visitedContinents.length, 'continent')} explored! You'll do even better next time.`));
  const again = button('▶ Play again', renderSetup);
  again.className = 'primary big';
  return el('div', { className: 'finish' },
    el('div', { className: 'trophy', textContent: humanWinners.length > 0 ? '🏆' : '🧭' }),
    el('h2', { className: 'big-title', textContent: title }),
    ...cheers.map((t) => el('p', { className: 'cheer', textContent: t })),
    el('ol', { className: 'ranking' }, ...r.ranking.map((seat) => {
      const p = s.players[seat];
      const value = businessValue(s, seat);
      const penalty = nomadPenalty(p);
      const detail = [`${p.points} travel`, `${value} assets`].join(' + ') + (penalty ? ` − ${penalty} Nomad penalty` : '');
      return el('li', {}, dot(seat), ` ${name(seat)}: `, el('b', { textContent: plural(finalScore(s, p), 'point') }), ` (${detail})`);
    })),
    el('div', { className: 'row' }, again, button('See the map', close)));
}

// The wonder poster (task M6): the drawing, the name in the poster's lettering, the wonder point
// earned on arrival, and the Guided Tours offer when the player may buy them.
function wonderPoster(s: GameState, me: Player, actions: Action[], seen: () => void): HTMLElement {
  const area = me.area!;
  const name = WONDER_NAME[area] ?? areaById.get(area)!.name;
  const tours = s.businesses.find((b) => b.area === area && b.kind === 'tours');
  const buy = actions.find((a) => a.type === 'buy' && a.business === 'tours');
  const price = plural(BUSINESS_PRICE.tours, 'point');
  const close = () => { seen(); pauseNext(); render(); };
  let offer: string;
  let buttons: HTMLElement[];
  if (buy) {
    offer = `Nobody runs its Guided Tours yet. Buy them now for ${price}: every other player who visits ${name} pays you a ${TOUR_FEE}-point tour fee, and the tours count ${price} at the end. Or leave them and travel on.`;
    const yes = button(`🏛️ Buy the tours · ${price}`, () => { seen(); act(buy); });
    yes.className = 'primary';
    buttons = [yes, button('Not now', close)];
  } else {
    offer = tours && tours.owner !== null
      ? `Its Guided Tours belong to ${nameOf(tours.owner)}.`
      : `Nobody runs its Guided Tours yet. They cost ${price}, and you have ${plural(me.points, 'point')}.`;
    const ok = button('OK', close);
    ok.className = 'primary';
    buttons = [ok];
  }
  const title = name.replace(/^the /, '');
  return el('div', { className: 'trip-turn' }, wonderScene(area), el('div', { className: 'trip-text' },
    el('h1', { className: 'title wonder-name', textContent: title }),
    el('p', { className: 'wonder-where', textContent: WONDER_PLACE[area] ?? '' }),
    el('h2', { textContent: `🏛️ ${nameOf(me.seat)}, you reached a wonder!` }),
    el('p', {}, el('span', { className: 'wonder-points', textContent: `+${plural(POINTS_WONDER, 'point')}` }), ` just for visiting ${name}!`),
    el('p', { className: 'small', textContent: offer }),
    el('div', { className: 'row' }, ...buttons)));
}

// Halfway and the last five turns (owner's request): one popup each per game.
const MILESTONES = [
  { key: 'milestone-half', round: 16, title: '🧭 Halfway there!', text: 'Half of your journey is already behind you: 15 more turns to go. Think about where you still want to go!' },
  { key: 'milestone-last', round: 26, title: '⏳ The last five turns!', text: 'These are the last five turns of the journey. Make them count: new areas, wonders and the continents you still need!' },
];

// "Who was paid", after a move.
function paymentNote(p: Payment): string {
  const from = nameOf(p.from);
  const to = p.to === null ? '' : nameOf(p.to);
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
  setMusic('game');

  // The popup over the board (task 14 B2): main events show here, the right side is for info.
  let modal = renderModal(s, actions, isRobot);
  // The pause after a closed popup: the board shows, and taps wait until the next popup opens.
  clearTimeout(pauseTimer);
  if (modal && Date.now() < pauseUntil) {
    pauseTimer = window.setTimeout(() => { if (state === s) render(); }, pauseUntil - Date.now());
    // An hourglass shows there is more to come; a tap opens the next popup at once (owner's choice).
    const skip = el('div', { className: 'modal-back wait' }, el('div', { className: 'hourglass', textContent: '⌛' }));
    skip.addEventListener('click', (e) => { e.stopPropagation(); pauseUntil = 0; render(); });
    modal = { turn: false, node: skip };
  }
  // Each popup sounds once, not on every redraw.
  if (modal?.sound && modal.soundKey !== lastSound) play(modal.sound);
  lastSound = modal?.soundKey;
  if (s.phase === 'chooseProfile') {
    const people = s.players.filter((p) => p.kind === 'human' && p.profile);
    app.replaceChildren(el('section', { className: 'card setup' }, title(), renderTurn(s, actions, isRobot),
      ...people.map((p) => profileNote(p.profile!, people.length > 1 ? nameOf(p.seat) : ''))));
  } else {
    const header = el('header', {},
      title('strong'),
      el('span', { className: 'round', textContent: s.phase === 'play' || s.phase === 'finished' ? `Round ${s.round} / ${s.totalRounds}` : 'Getting ready' }),
      renderChips(s),
      soundButton(),
      button('New game', renderSetup));
    const side = el('div', { className: 'side' });
    if (s.phase !== 'chooseStart') side.append(renderWorld(s));
    if (detailArea) side.append(renderAreaDetails(s, detailArea));
    if (shownPlayer !== null) side.append(playerCard(s, shownPlayer));
    if (hold) {
      side.append(el('section', { className: 'card turn' }, el('h2', {}, dot(hold.seat), ` ${nameOf(hold.seat)}'s turn`)));
    } else if (modal?.turn) {
      side.append(el('section', { className: 'card turn' }, el('h2', {}, dot(actor.seat), ` ${nameOf(actor.seat)}'s turn`)));
    } else {
      side.append(renderTurn(s, actions, isRobot));
    }
    // Right after choosing the profile, on the world view too, also while the robots choose
    // (owner's request): each person's profile, its advantages and weaknesses.
    if (s.phase === 'chooseStart') {
      const people = s.players.filter((p) => p.kind === 'human' && p.profile);
      for (const p of people) side.append(profileNote(p.profile!, people.length > 1 ? nameOf(p.seat) : ''));
    }
    app.replaceChildren(el('div', { className: 'game' }, header,
      el('div', { className: 'board' },
        el('div', { className: 'left' }, s.phase === 'chooseStart' ? renderStartMap(s, isRobot) : renderAreaView(s, isRobot)),
        side)),
      modal ? modal.node : '');
  }

  // Robots wait while a popup is open, so nothing is missed.
  if (isRobot && !modal && !hold) {
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
  const me = hold ? s.players[hold.seat] : currentPlayer(s);
  return el('div', { className: 'chips' }, ...s.turnOrder.map((seat) => {
    const p = s.players[seat];
    const points = s.phase === 'finished' ? finalScore(s, p) : p.points;
    const chip = el('button', { className: 'chip' + (p === me && s.phase !== 'finished' ? ' active' : '') + (shownPlayer === seat ? ' open' : ''), title: 'Show details' },
      dot(seat), ` ${shortOf(seat)}${p.kind === 'robot' ? ' 🤖' : ''} `, el('b', { textContent: String(points) }),
      businessValue(s, seat) && s.phase !== 'finished' ? ` +🏢${businessValue(s, seat)}` : '');
    chip.style.borderColor = colourOf(seat);
    chip.addEventListener('click', () => { shownPlayer = shownPlayer === seat ? null : seat; render(); });
    return chip;
  }));
}

function playerCard(s: GameState, seat: number): HTMLElement {
  const p = s.players[seat];
  const area = p.area ? areaById.get(p.area)!.name
    : p.travel ? `${VEHICLE[p.travel.kind]} to ${areaById.get(p.travel.to)!.name}` : '—';
  const card = el('div', { className: 'player' },
    el('div', {}, dot(seat), ` ${nameOf(seat)} ${p.kind === 'robot' ? `🤖 ${LEVEL_LABEL[p.level ?? 'normal']}` : '🙂'} `,
      button('✕', () => { shownPlayer = null; render(); })),
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
  card.style.borderColor = colourOf(seat);
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
  const who = el('span', {}, dot(me.seat), ` ${nameOf(me.seat)}`);
  const box = el('section', { className: 'card turn' });

  if (s.phase === 'finished') {
    const r = s.result!;
    const names = r.winners.map((w) => nameOf(w)).join(' and ');
    box.append(
      el('h2', { textContent: r.winners.some((w) => s.players[w].kind === 'human')
        ? (r.winners.length > 1 ? `It's a draw: ${names}! 🎉` : `${names} wins! 🎉`)
        : '🏁 The journey is over!' }),
      el('ol', {}, ...r.ranking.map((seat) => {
        const p = s.players[seat];
        const value = businessValue(s, seat);
        const penalty = nomadPenalty(p);
        // One total in points: travel points + assets (businesses at their price) − Nomad penalty.
        const detail = [`${p.points} travel`, `${value} assets`]
          .join(' + ') + (penalty ? ` − ${penalty} Nomad penalty` : '');
        return el('li', {}, dot(seat), ` ${nameOf(seat)}: ${plural(finalScore(s, p), 'point')} (${detail}), ${plural(p.visitedContinents.length, 'continent')}, ${plural(p.visitedAreas.length, 'area')}`);
      })),
      button('Play again', renderSetup));
    return box;
  }

  if (s.offer) {
    const o = s.offer;
    const buyer = el('span', {}, dot(o.to), ` ${nameOf(o.to)}`);
    const what = `the ${BUSINESS_ICON[o.business]} ${BUSINESS_NAME[o.business]} in ${areaById.get(o.area)!.name}`;
    if (isRobot) {
      box.append(el('h2', {}, buyer, ` is thinking about ${nameOf(o.from)}'s offer… 🤖`));
      return box;
    }
    box.append(el('h2', {}, buyer, `: ${nameOf(o.from)} offers you ${what} for ${plural(o.price, 'point')}`),
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
        a.type === 'chooseProfile' ? iconButton(a.profile, () => act(a)) : '')));
  } else if (s.phase === 'chooseStart') {
    box.append(el('h2', {}, who, ', choose your home country'),
      el('p', { className: 'small', textContent: zoom
        ? `Tap an area in ${zoom} to choose it as your home country.`
        : 'Tap a continent on the map. Each player starts on a different continent. Welcome bonus: Europe, Asia, Africa +3 · Americas +4 · Oceania +5.' }),
      zoom ? el('p', { className: 'small', textContent: `🏛️ Areas with this sign have a wonder: your first visit there gives +${plural(POINTS_WONDER, 'point')} more. Each wonder has Guided Tours that one player can buy for ${plural(BUSINESS_PRICE.tours, 'point')}; after that, every other player who visits pays the owner a ${TOUR_FEE}-point tour fee.` }) : '',
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
    // A trip turn: the plane, ship or train scene (owner-approved, task 14j; train: task 17), with who is travelling.
    const trip = me.travel;
    const to = areaById.get(trip.to)!.name;
    const plane = trip.kind === 'airport';
    const train = trip.kind === 'station';
    const total = me.profile ? TRAVEL_TURNS[me.profile][trip.kind] : trip.turnsLeft;
    const step = trip.turnsLeft > 0
      ? ` · ${plane ? 'flight' : train ? 'journey' : 'day'} ${total - trip.turnsLeft + 1} of ${total}`
      : ` · waiting to land (${to} is taken)`;
    const challenge = actions.some((a) => a.type === 'travel' && a.challenge);
    const offer = plane
      ? `The seat-belt sign goes off. A fellow passenger leans over: "Long flight… fancy a geography challenge? Right +${CHALLENGE_POINTS}, wrong −${CHALLENGE_POINTS}."`
      : train
      ? `Clickety-clack through the night. In the dining car someone unfolds a map: "A geography challenge? Right +${CHALLENGE_POINTS}, wrong −${CHALLENGE_POINTS}."`
      : `Calm water, a sky full of stars. In the ship's lounge someone sets up a quiz table: "A geography challenge? Right +${CHALLENGE_POINTS}, wrong −${CHALLENGE_POINTS}."`;
    const play = button('🌍 Play the challenge', () => act({ type: 'travel', challenge: true }));
    play.className = 'primary';
    box.classList.add('trip-turn');
    box.append(tripScene(trip.kind), el('div', { className: 'trip-text' },
      el('h2', {}, who, ` ${plane ? 'is flying' : train ? 'is on the train' : 'is at sea'} to ${to}${step}`),
      el('p', { className: 'small', textContent: challenge
        ? `${offer} One question, ${CHALLENGE_SECONDS} seconds. You don't have to play.`
        : `A challenge needs at least ${plural(CHALLENGE_POINTS, 'point')}, so there is none this turn.` }),
      me.profile === 'nomad' ? el('p', { className: 'small', textContent: '💻 Digital Nomad: +1 for this travel turn either way.' }) : '',
      el('div', { className: 'row' }, ...(challenge
        ? [play, button(plane || train ? '😴 No thanks' : '🌅 No thanks', () => act({ type: 'travel' }))]
        : [button('Continue the trip', () => act({ type: 'travel' }))]))));
  } else {
    const here = areaById.get(me.area!)!;
    if (pendingFees && (pendingFees.type === 'walk' || pendingFees.type === 'board' || pendingFees.type === 'quiz')) {
      const a = pendingFees;
      const fees = entryFees(s, me, me.area, a.to);
      const where = areaById.get(a.to)!.name;
      box.append(el('h2', {}, who, `: entering ${where} costs ${plural(feeTotal(fees), 'point')}`),
        el('ul', {}, ...fees.map((f) => el('li', { textContent: f.reason === 'visa'
          ? `🛂 Visa: ${plural(f.amount, 'point')} to ${nameOf(f.to.seat)} (${where} is ${nameOf(f.to.seat)}'s citizenship)`
          : `🏛️ Tour fee: ${plural(f.amount, 'point')} to ${nameOf(f.to.seat)} (owner of the guided tours in ${where})` }))),
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
          ? button(`Sell ${BUSINESS_ICON[a.business]} ${BUSINESS_NAME[a.business]} in ${areaById.get(a.area)!.name} to ${nameOf(a.to)} for ${BUSINESS_PRICE[a.business]}`, () => act(a)) : ''),
        button('Cancel', () => { selling = false; render(); })));
    }
    box.append(
      guideOff ? el('p', { className: 'small', textContent: 'Tap a green area to walk there. Tap the plane, ship, train or monument on your area for travel and tours. Tap any area for its details.' }) : '',
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
    ? ` 🛂 visa −${f.amount} to ${nameOf(f.to.seat)}`
    : ` 🏛️ tour −${f.amount} to ${nameOf(f.to.seat)}`).join('');
}

// Who gets the ticket from this airport or port: " (to the Backpacker's airline)".
function ticketTo(s: GameState, kind: RouteKind): string {
  const me = currentPlayer(s);
  const business = businessAt(s, me.area!, TICKET_BUSINESS[kind]);
  if (business?.owner === undefined || business.owner === null) return '';
  return business.owner === me.seat ? ' (to yourself)' : ` (to ${nameOf(business.owner)})`;
}

function capital(text: string): string {
  return text[0].toUpperCase() + text.slice(1);
}

function citizenshipName(areas: string[]): string {
  const first = areaById.get(areas[0])!;
  return areas.length > 1 && first.bigCountry ? first.bigCountry : first.name;
}

// The citizenship test turn (turn 2): read the facts, then one question at a time. Each
// question waits for "Start", so its clock never runs while the last answer is on show.
// "Granted" and "not granted" are shown on turn 3, above the moves (renderTurn).
function renderCitizenship(box: HTMLElement, s: GameState, who: HTMLElement): void {
  const me = currentPlayer(s);
  const exam = me.exam!;
  const n = exam.answers.length;
  const key = `${s.round}-${me.seat}-${exam.area}-${n}`;
  if (examReady === key || me.kind !== 'human') {
    renderExamQuestion(box, s, who);
    return;
  }
  const where = areaById.get(exam.area)!.name;
  const ready = () => { examReady = key; render(); };
  if (n === 0) {
    box.append(el('h2', {}, who, `: citizenship test for ${where}`),
      el('p', { textContent: `To become a citizen of ${where}, read these ${exam.study.length} facts. ${exam.questions.length} questions will be asked about them, ${EXAM_SECONDS} seconds each. ${EXAM_PASS} right answers or more: citizenship is yours. Fewer: no citizenship, and you can't ask again in this game.` }),
      el('ol', { className: 'facts' }, ...exam.study.map((t) => el('li', { textContent: t }))),
      el('p', { className: 'small', textContent: 'Take your time. Tap "I\'m ready" when done.' }),
      el('div', { className: 'row' }, button('📖 I\'m ready', ready)));
  } else {
    box.append(el('h2', {}, who, `: question ${n + 1} of ${exam.questions.length}`),
      el('p', { textContent: `Ready for the next question? The ${EXAM_SECONDS}-second clock starts when you tap Start.` }),
      el('div', { className: 'row' }, button('▶ Start', ready)));
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

// The timed a/b question box (airline quiz, also used by the guide): the question, the answer
// buttons, the 15-second clock and a note. Time out = the wrong answer.
function timedQuestion(title: (Node | string)[], text: string, options: string[], correct: number, onAnswer: (i: number) => void, seconds: number, key: string, note: string): HTMLElement[] {
  const clock = el('div', { className: 'clock' }, el('span', { className: 'secs', textContent: `⏱️ ${seconds} s` }), el('div', { className: 'timebar' }, el('span')));
  const nodes = [el('h2', {}, ...title),
    el('p', { textContent: text }),
    el('div', { className: 'row' }, ...options.map((o, i) => button(o, () => onAnswer(i)))),
    clock,
    el('p', { className: 'small', textContent: note })];
  startCountdown(key, seconds, clock, () => onAnswer(1 - correct));
  return nodes;
}

// Airline quiz: one a/b question about the destination, 15 seconds. Time out = wrong answer.
function renderQuiz(box: HTMLElement, s: GameState, who: HTMLElement): void {
  const { question, to, kind } = s.quiz!;
  box.append(...timedQuestion([who, `: ${TRAVEL_WORDS[kind].promo} promotion — answer correctly and ${TRAVEL_WORDS[kind].verb} free to ${areaById.get(to)!.name}!`],
    question.text, question.options, question.correct, (i) => act({ type: 'answer', choice: i as 0 | 1 }), QUIZ_SECONDS,
    `answer-${s.round}-${currentPlayer(s).seat}-${question.text}-${currentPlayer(s).quizWrong}`,
    `Wrong answers here so far: ${currentPlayer(s).quizWrong}. A wrong answer uses this turn.${forcedPayNote(s, kind, to)}`));
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
  const name = nameOf(r.seat);
  if (r.right) return `❓ ${name}'s challenge: right, it is ${r.challenge.options[r.challenge.correct]}! +${plural(r.change, 'point')}.`;
  const lost = r.change === 0 ? 'No points to lose' : `−${plural(-r.change, 'point')}`;
  return `❓ ${name}'s challenge: wrong, the answer was ${r.challenge.options[r.challenge.correct]}. ${lost}.`;
}

// After the 3rd wrong answer a player who can pay must pay: say who gets the ticket.
function forcedPayNote(s: GameState, kind: RouteKind, dest: string): string {
  const me = currentPlayer(s);
  if (me.quizWrong >= QUIZ_TRIES - 1) return ` ${lastTryText(s, kind, dest)}`;
  const price = ticketPrice(me.profile!, kind);
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
    ...ROUTE_KINDS.flatMap((kind) => destinations(map30, me.area!, kind, me.profile!)),
  ]);
  const lines = [...near].flatMap((id) => {
    const p = bookedBy(s, id);
    return p && p.seat !== me.seat ? [`${areaById.get(id)!.name} is waiting for ${nameOf(p.seat)} ${VEHICLE[p.travel!.kind]} (booked)`] : [];
  });
  return lines.length ? `⏳ ${lines.join(' · ')}: nobody else can go there until they land.` : '';
}

// Told before the 3rd quiz try in an area (owner's rule, task 13): what a wrong answer means.
function lastTryText(s: GameState, kind: RouteKind, dest: string): string {
  const me = currentPlayer(s);
  const name = areaById.get(dest)!.name;
  return canPayAfterQuiz(s, me, kind, dest)
    ? `⚠️ Last try here for ${name}: Attention! If wrong, you pay the ${ticketPrice(me.profile!, kind)}-point ticket with your points and travel.`
    : `⚠️ Last try here for ${name}: Attention! If wrong, you go home to ${areaById.get(homeFor(s, map30, me))!.name}.`;
}

function lastTryWarning(s: GameState, actions: Action[]): string {
  if (currentPlayer(s).quizWrong < QUIZ_TRIES - 1) return '';
  return actions.flatMap((a) => (a.type === 'quiz' ? [lastTryText(s, a.kind, a.to)] : [])).join(' ');
}

function travelNote(me: Player): string {
  const has = (kind: RouteKind) => (map30.routes ?? []).some((r) => r.kind === kind && (r.a === me.area || r.b === me.area));
  const price = TICKET_PRICE[me.profile!];
  const notes = ROUTE_KINDS.filter(has).map((kind) => {
    const vehicle = capital(TRAVEL_WORDS[kind].vehicle);
    if (kind === 'station' && me.profile === 'luxury') return `${VEHICLE[kind]} ${vehicle}: Luxury can't take the train`;
    const ticketCost = ticketPrice(me.profile!, kind);
    const turns = TRAVEL_TURNS[me.profile!][kind];
    return `${VEHICLE[kind]} ${vehicle}: ${ticketCost === null ? 'you travel only with the quiz' : `ticket ${ticketCost}`}, ${plural(turns, 'travel turn')}`;
  });
  const quiz = price === null
    ? 'The quiz is free; a wrong answer uses the turn, and you may try again on later turns.'
    : 'The quiz is free; a wrong answer uses the turn, and after 3 wrong answers you pay and go (if you can).';
  return notes.length ? `${notes.join(' · ')}. ${quiz}` : '';
}

// ---------- popups, answers and the guide (task 14 B2) ----------

// One countdown per question (a redraw doesn't restart it). Time out = wrong answer.
function startCountdown(key: string, seconds: number, clock: HTMLElement, onTimeout: () => void): void {
  if (countdown?.key !== key) {
    countdown = { key, deadline: Date.now() + seconds * 1000 };
    startTimer();
  }
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
      stopTimer();
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
// After the last test answer: passed or not (citizenship itself comes on the next turn).
function examVerdict(after: Player): string {
  const exam = after.exam;
  if (exam?.stage !== 'result') return '';
  const right = exam.questions.filter((q, i) => exam.answers[i] === q.correct).length;
  const where = areaById.get(exam.area)!.name;
  return examPassed(exam)
    ? `🎉 ${right} of ${exam.questions.length} right: you passed! Citizenship of ${where} is yours at the start of your next turn.`
    : `😞 ${right} of ${exam.questions.length} right (${EXAM_PASS} needed): you failed the test, and citizenship of ${where} was not granted.`;
}

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
          ? `${VEHICLE[kind]} Free ticket! You ${TRAVEL_WORDS[kind].verb} to ${areaById.get(to)!.name}${turns ? `: ${plural(turns, 'travel turn')}` : ' right away'}.`
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
      lines: [`${q.text} The answer is: ${q.options[q.correct]}.`, factFor(me.exam.area, q.text), examVerdict(after.players[me.seat])].filter((t) => t !== ''),
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

// What an arrival earned, for the end-of-turn popup ("+1 for visiting a new area…").
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

  for (const a of actions) {
    if (a.type !== 'buy') continue;
    const price = plural(BUSINESS_PRICE[a.business], 'point');
    lines.push(a.business === 'tours'
      ? `🏛️ You can buy the Guided Tours of ${WONDER_NAME[here.id] ?? 'the wonder'}: it costs ${price}, and every other player who visits pays you ${plural(TOUR_FEE, 'point')}. Tap the monument.`
      : `${BUSINESS_ICON[a.business]} You can buy the ${BUSINESS_NAME[a.business]} here for ${price}: ${BUSINESS_EARNS[a.business]}. Tap the ${a.business === 'airline' ? 'plane' : a.business === 'train' ? 'train' : 'ship'}.`);
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
    if (there) return [`${name} (${nameOf(there.seat)} is there)`];
    if (booked) return [`${name} (booked by ${nameOf(booked.seat)})`];
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

  for (const kind of ROUTE_KINDS) {
    if (!hasRoute(here.id, kind)) continue;
    const words = TRAVEL_WORDS[kind];
    const placeName = kind === 'airport' ? 'an airport' : `a ${words.place}`;
    if (kind === 'station' && me.profile === 'luxury') {
      lines.push(`${VEHICLE[kind]} There is ${placeName} here, but Luxury can't take the train. You may still buy its ticket booth.`);
      continue;
    }
    const to = destinations(map30, here.id, kind, me.profile!).map((t) => areaById.get(t)!.name);
    const price = ticketPrice(me.profile!, kind);
    const turns = TRAVEL_TURNS[me.profile!][kind];
    lines.push(`${VEHICLE[kind]} There is ${placeName} here: ${words.verb} to ${to.join(' or ')}. ${
      price === null ? 'Backpacker: only with the free quiz.' : `Ticket ${plural(price, 'point')}, or try the free quiz.`} ${turns ? plural(turns, 'travel turn') : 'You arrive right away'}. Tap the ${words.vehicle}.`);
  }
  if (asksOffered(actions).length > 0) {
    lines.push(`🛂 You can ask for citizenship here (the button above). ${me.profile === 'luxury' ? 'Luxury: granted at once, and you can still move this turn.' : `Your turn ends; next turn you read ${EXAM_FACTS} facts and answer 3 questions about them: ${EXAM_PASS} right answers or more, and citizenship is yours.`} Then every other player pays you ${plural(VISA_PRICE, 'point')} to enter.`);
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
  if (there) return `⛔ ${nameOf(there.seat)} is there now`;
  const booked = bookedBy(s, to);
  if (booked && booked.seat !== me.seat) return `⏳ booked by ${nameOf(booked.seat)}`;
  const fees = feeTotal(entryFees(s, me, me.area, to));
  if (fees > me.points) return `💸 you can't pay the ${plural(fees, 'point')} fee`;
  return '⛔ not now';
}

// The popup over the board: an answer, what happened, an event card, or the current main event
// (quiz, test, challenge, entry fees, an offer). `turn` = the turn panel itself is in the popup.
type Modal = { node: HTMLElement; turn: boolean; sound?: SoundName; soundKey?: unknown };

function renderModal(s: GameState, actions: Action[], isRobot: boolean): Modal | null {
  const me = currentPlayer(s);
  const wrap = (content: HTMLElement, cls = '') => el('div', { className: 'modal-back' }, el('div', { className: `modal card ${cls}` }, content));
  // Closing a popup gives the next one a pause (POPUP_PAUSE_MS).
  const ok = (onClick: () => void, text = 'OK') => {
    const b = button(text, () => { pauseNext(); onClick(); });
    b.className = 'primary';
    return el('div', { className: 'row' }, b);
  };
  if (answered) {
    const r = answered;
    return { turn: false, node: wrap(el('div', {},
      el('h2', { textContent: r.title }),
      ...r.lines.map((t) => el('p', { textContent: t })),
      ok(() => { answered = null; render(); })), r.ok ? 'right' : 'wrong'), sound: r.ok ? 'right' : 'wrong', soundKey: r };
  }
  // The end of a person's turn: what it gave, then "End turn" (the walk is shown first).
  if (hold) {
    const h = hold;
    if (!h.ready) return null;
    const p = s.players[h.seat];
    const end = () => { hold = null; news = []; newsNow = false; render(); };
    const arrived = h.lines.length > 0 ? h.lines[0].replace('📍 You arrived in ', '').replace(/\.$/, '') : '';
    return { turn: false, node: wrap(el('div', {},
      el('h2', {}, dot(h.seat), arrived ? ` You arrived in ${arrived}!` : ` ${nameOf(h.seat)}, your turn is over`),
      ...h.lines.slice(1).map((t) => el('p', { textContent: t })),
      news.length ? el('ul', {}, ...news.map((t) => el('li', { textContent: t }))) : '',
      h.lines.length ? '' : el('p', { className: 'small', textContent: `You have ${plural(p.points, 'point')}.` }),
      ok(end, '✔ End turn'))) };
  }
  // Money for people: a gold popup per person (never for a robot).
  if (income.length > 0 && (newsNow || !isRobot || s.phase === 'finished')) {
    const seats = [...new Set(income.map((i) => i.seat))];
    return { turn: false, node: wrap(el('div', { className: 'income' },
      el('div', { className: 'coins', textContent: '💰' }),
      ...seats.map((seat) => el('div', {},
        el('h2', { className: 'big-title', textContent: `Great news, ${nameOf(seat)}!` }),
        el('ul', {}, ...income.filter((i) => i.seat === seat).map((i) => el('li', { textContent: i.text }))))),
      ok(() => { income = []; if (news.length === 0) newsNow = false; render(); }, 'Wonderful!')), 'gold'), sound: 'coins', soundKey: income };
  }
  if (news.length > 0 && (newsNow || !isRobot || s.phase === 'finished')) {
    return { turn: false, node: wrap(el('div', {},
      el('h2', { textContent: '📣 What happened' }),
      el('ul', {}, ...news.map((t) => el('li', { textContent: t }))),
      ok(() => { news = []; newsNow = false; render(); }))) };
  }
  // A person's turn begins (owner's request, task 14i): who plays now.
  const turnKey = `turn-${s.round}-${me.seat}`;
  if (s.phase === 'play' && me.kind === 'human' && !isRobot && !seenCards.has(turnKey)) {
    const where = me.area ? areaById.get(me.area)!.name : me.travel ? `on the way to ${areaById.get(me.travel.to)!.name}` : '';
    return { turn: false, node: wrap(el('div', { className: 'handover' },
      el('div', { className: 'handover-icon' }, me.profile ? iconEl(me.profile) : dot(me.seat)),
      el('h2', { className: 'big-title', textContent: `${nameOf(me.seat)}, it's your turn!` }),
      el('p', { textContent: `Round ${s.round} of ${s.totalRounds}${where ? ` · 📍 ${where}` : ''} · ${plural(me.points, 'point')}` }),
      ok(() => { seenCards.add(turnKey); render(); }, "▶ Let's go"))), sound: 'tap', soundKey: turnKey };
  }
  const key = s.card ? `${s.card.round}-${s.card.seat}-${s.card.card.text}` : '';
  if (s.phase === 'play' && me.kind === 'human' && s.card?.seat === me.seat && !seenCards.has(key)) {
    const bad = s.card.card.loseTurn || s.card.card.points < 0;
    // Two steps (task 14k): the phone buzzes, then the news and what it means.
    if (!seenCards.has(`${key}-phone`)) {
      return { turn: false, node: wrap(phoneNews(s.card, () => { seenCards.add(`${key}-phone`); render(); }), 'phone-modal'), sound: 'tap', soundKey: `${key}-phone` };
    }
    return { turn: false, node: wrap(el('div', {}, eventCard(s.card), ok(() => { seenCards.add(key); render(); })), 'event'), sound: bad ? 'card-bad' : 'card-good', soundKey: key };
  }
  // A wonder poster (task M6, owner's rules): a person's turn begins in a wonder area they
  // reached on their last turn; shown once per wonder per game, never for robots and never for
  // the home area (no wonder point there). Buying the tours is allowed now (the turn begins here).
  const here = me.area;
  const wonderKey = `wonder-${here}`;
  if (s.phase === 'play' && me.kind === 'human' && !isRobot && here && here !== me.home && !seenCards.has(wonderKey)
    && areaById.get(here)!.wonder && hasWonderScene(here) && me.visitedAreas.includes(here)
    && !s.quiz && !s.challenge && !s.offer && !me.exam && !me.loseTurn && !pendingFees) {
    return { turn: false, node: wrap(wonderPoster(s, me, actions, () => { seenCards.add(wonderKey); }), 'trip'), sound: 'milestone', soundKey: wonderKey };
  }
  // Halfway and the last five turns, on a person's turn.
  if (s.phase === 'play' && !isRobot && me.kind === 'human') {
    const due = MILESTONES.filter((m) => s.round >= m.round && !seenCards.has(m.key));
    if (due.length > 0) {
      const m = due[due.length - 1];
      return { turn: false, node: wrap(el('div', { className: 'milestone' },
        el('h2', { className: 'big-title', textContent: m.title }),
        el('p', { textContent: m.text }),
        el('p', { className: 'small', textContent: `Round ${s.round} of ${s.totalRounds}.` }),
        ok(() => { for (const x of due) seenCards.add(x.key); render(); }, "Let's go!")), 'gold'), sound: 'milestone', soundKey: m.key };
    }
  }
  // The end of the game: the winner popup.
  if (s.phase === 'finished' && !seenCards.has('finished')) {
    return { turn: false, node: wrap(finishPopup(s, () => { seenCards.add('finished'); render(); }), 'gold'), sound: 'win', soundKey: 'finished' };
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
        : `Your turn ends now and you stay in ${where}. Next turn: a citizenship test. You read ${EXAM_FACTS} facts about ${where}, then answer 3 questions about them (${EXAM_SECONDS} seconds a question). ${EXAM_PASS} right answers or more: citizenship is yours. Fewer: no citizenship. Either way you move on the turn after.` }),
      el('p', { textContent: `As a citizen, every other player pays you a ${VISA_PRICE}-point visa each time they enter that area${me.profile === 'business' ? `, and you get +${plural(POINTS_BUSINESS_CITIZENSHIP, 'point')} (Business Traveler)` : ''}. You can ask only once per game.` }),
      el('div', { className: 'row' }, yes, button('Not now', () => { citizenPopup = false; render(); })))) };
  }
  if (s.phase === 'play' && me.kind === 'human' && me.exam && (me.exam.stage === 'granted' || me.exam.stage === 'failed')) {
    const ek = `exam-${me.seat}-${me.exam.area}-${me.exam.stage}`;
    if (!seenCards.has(ek)) {
      const exam = me.exam;
      const done = () => { seenCards.add(ek); render(); };
      // The answers, for a test that was taken (Luxury takes none).
      const answers = exam.questions.length === 0 ? '' : el('ol', {}, ...exam.questions.map((q, i) => {
        const mine = exam.answers[i];
        return el('li', { textContent: mine === q.correct ? `${q.text} ✅ ${q.options[q.correct]}` : `${q.text} ❌ ${q.options[mine]} → ✅ ${q.options[q.correct]}` });
      }));
      if (exam.stage === 'failed') {
        return { turn: false, node: wrap(el('div', {},
          el('h2', { textContent: `😞 Citizenship not granted: ${areaById.get(exam.area)!.name}` }),
          el('p', { textContent: `You failed the citizenship test: fewer than ${EXAM_PASS} right answers. The right answers 📖:` }),
          answers,
          el('p', { textContent: 'You can\'t ask for citizenship again in this game. You may travel on.' }),
          ok(done)), 'wrong'), sound: 'wrong', soundKey: ek };
      }
      const bonus = me.profile === 'business' ? ` 💼 Business Traveler: +${plural(POINTS_BUSINESS_CITIZENSHIP, 'point')}.` : '';
      return { turn: false, node: wrap(el('div', {},
        el('h2', { textContent: `🎉 Citizenship granted: ${citizenshipName(me.citizenship!)}!` }),
        answers,
        el('p', { textContent: `Every other player now pays you a ${VISA_PRICE}-point visa to enter.${bonus} You may travel on.` }),
        ok(done)), 'right'), sound: 'citizenship', soundKey: ek };
    }
  }
  // Every call to action is a popup (owner's request): quiz, test, challenge, fees, an offer,
  // the travel turn (play a challenge?), a lost turn, and being stuck or sent home.
  const main = !isRobot && s.phase === 'play'
    && (s.offer || s.quiz || s.challenge || pendingFees || me.travel || me.loseTurn
      || actions.some((a) => a.type === 'blocked' || a.type === 'goHome')
      || (me.exam && (me.exam.stage === 'test' || me.exam.stage === 'result')));
  if (main) {
    // A trip turn sounds its plane, ship or train once.
    const trip = me.travel && !s.challenge ? { sound: TRAVEL_WORDS[me.travel.kind].sound, soundKey: `trip-${s.round}-${me.seat}` } : {};
    return { turn: true, node: wrap(renderTurn(s, actions, isRobot), me.travel && !s.challenge ? 'trip' : ''), ...trip };
  }
  return null;
}

// ---------- drawn maps (task 14 A2, B1) ----------

interface Drawn { root: SVGSVGElement; names: SVGGElement; labels: SVGGElement; paths: Map<string, SVGPathElement>; vb: Box; k: number; fs: number; px: number }

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
  const names = svg('g', { class: 'names' });
  const labels = svg('g');
  root.append(shapes, names, labels);
  // The page is zoomed to the screen (uiZoom): sizes here are in page pixels.
  const w = window.innerWidth / uiZoom / 2 - 12;
  const h = pane === 'left' ? window.innerHeight / uiZoom - 115 : w / 2.6;
  const scale = Math.min(w / vb.w, h / vb.h);
  return { root, names, labels, paths, vb, k, fs: px / scale, px };
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

// Area names on the map (owner's request): a name shows only where it fits inside its area
// without touching another name, at a fixed size on screen. So zooming in shows more names
// (small areas like Europe's only when there is room). Biggest areas first. Returns the update
// for a zoom (view units per screen pixel; the page zoom makes a page pixel uiZoom screen pixels). `shift` moves a name down (below a drawn icon).
const NAME_PX = 11;
function areaNames(d: Drawn, ids: string[], shift: (id: string) => number = () => 0): (unit: number) => void {
  const items = ids.map((id) => {
    const g = geo.get(id)!;
    const y = g.centre[1] + shift(id);
    const text = svg('text', { x: g.centre[0] * d.k, y, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, areaById.get(id)!.name);
    d.names.append(text);
    return { id, text, chars: [...areaById.get(id)!.name].length, x: g.centre[0] * d.k, y, w: g.core.w * d.k, h: g.core.h };
  }).sort((a, b) => b.w * b.h - a.w * a.h);
  // Never over another area (a long thin area like Chile): the ends of the name are tested.
  const overOthers = (id: string, x: number, y: number, w: number) => [-0.5, -0.25, 0.25, 0.5].some((f) => {
    const pt = new DOMPoint((x + f * w) / d.k, y);
    return [...d.paths].some(([other, path]) => other !== id && path.isPointInFill(pt));
  });
  const update = (unit: number) => {
    const fs = NAME_PX * uiZoom * unit;
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    for (const it of items) {
      const w = it.chars * fs * 0.58;
      const h = fs * 1.2;
      // The centre first, then a little higher or lower.
      const y = w <= it.w && h <= it.h * 0.8 ? [0, 1, -1, 2, -2].map((n) => it.y + n * h).find((y) =>
        !placed.some((b) => Math.abs(b.x - it.x) < (b.w + w) / 2 && Math.abs(b.y - y) < (b.h + h) / 2)
        && !overOthers(it.id, it.x, y, w)) : undefined;
      it.text.setAttribute('font-size', String(fs));
      it.text.setAttribute('stroke-width', String(fs * 0.22));
      it.text.style.display = y === undefined ? 'none' : '';
      if (y !== undefined) {
        it.text.setAttribute('y', String(y));
        placed.push({ x: it.x, y, w, h });
      }
    }
  };
  // The fill test needs the map on the page: names are placed on the next frame.
  requestAnimationFrame(() => update(d.fs / d.px / uiZoom));
  return update;
}

// A player's piece on the world or start map: the profile icon (a dot before profiles).
function piece(seat: number, x: number, y: number, size: number): SVGElement {
  const p = profileOf(seat);
  return p ? iconUse(p, x, y, size) : svg('circle', { cx: x, cy: y, r: size / 3.5, fill: colourOf(seat), class: 'piece' });
}

const inView = (d: Drawn, x: number, y: number) => x >= d.vb.x && x <= d.vb.x + d.vb.w && y >= d.vb.y && y <= d.vb.y + d.vb.h;

// Small icons on an area (neighbours and the world map): wonder, airport, port, station, citizenship.
function areaIcons(s: GameState, id: string): string {
  const a = areaById.get(id)!;
  const citizen = s.players.some((p) => p.citizenship?.includes(id));
  return `${a.wonder ? '🏛️' : ''}${hasRoute(id, 'airport') ? '✈️' : ''}${hasRoute(id, 'port') ? '⚓' : ''}${hasRoute(id, 'station') ? '🚆' : ''}${citizen ? '🛂' : ''}`;
}

// Visited marks (owner's request): one small dot per player who has been there.
function visitedDots(d: Drawn, s: GameState, id: string, x: number, y: number, r: number): void {
  const who = s.players.filter((p) => p.visitedAreas.includes(id));
  who.forEach((p, i) => {
    d.labels.append(svg('circle', { cx: x + (i - (who.length - 1) / 2) * r * 2.6, cy: y, r, fill: colourOf(p.seat), class: 'visit' }));
  });
}

// Pinch to zoom and drag to move (owner's request, task 14 B1); a mouse wheel zooms too.
// The view is kept in `camera` until the player's area changes.
function attachZoom(root: SVGSVGElement, k: number, onZoom?: (unit: number) => void): void {
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
    onZoom?.(unit());
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
  // At the end of a turn the map stays on the player who just moved (task 14i).
  const me = hold ? s.players[hold.seat] : currentPlayer(s);
  const focus = me.area ?? me.travel?.to ?? me.home ?? map30.areas[0].id;
  const here = areaById.get(focus)!;
  const base = pad(geo.get(focus)!.core, 0.25, 2.5);
  const k = squeeze(base);
  if (!camera || camera.focus !== focus) camera = { focus, box: base };
  const actions = legalActions(s, map30);
  const myTurn = !hold && mapTurn(s, isRobot);
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
    return b?.owner !== undefined && b.owner !== null ? colourOf(b.owner) : undefined;
  };
  // The pawn stands in the middle of the area; the props sit around it.
  // Top row, centred over the pawn: the wonder and the citizenship flag (side by side if both).
  const citizen = s.players.find((p) => p.citizenship?.includes(focus));
  const both = here.wonder && citizen;
  if (here.wonder) d.labels.append(place(monument(owner('tours')), both ? hx - P * 0.6 : hx, hy - P * 0.95, P, `Wonder: ${WONDER_NAME[focus] ?? here.name}`, open('wonder')));
  if (citizen) d.labels.append(place(citizenFlag(colourOf(citizen.seat)), both ? hx + P * 0.6 : hx, hy - P * 0.95, P * 0.9, `${nameOf(citizen.seat)}'s citizenship`, open('citizen')));
  if (hasRoute(focus, 'airport')) d.labels.append(place(airport(owner('airline')), hx - P * 1.2, hy, P, 'Airport', open('airport')));
  if (hasRoute(focus, 'port')) d.labels.append(place(port(owner('ferry')), hx + P * 1.2, hy, P, 'Port', open('port')));
  // The station (task 17): in the first free side slot, else under the pawn.
  if (hasRoute(focus, 'station')) {
    const [sx, sy] = !hasRoute(focus, 'airport') ? [hx - P * 1.2, hy] : !hasRoute(focus, 'port') ? [hx + P * 1.2, hy] : [hx, hy + P * 1.1];
    d.labels.append(place(station(owner('train')), sx, sy, P, 'Station', open('station')));
  }
  visitedDots(d, s, focus, hx, hy + P * 0.75, fs * 0.32);

  // Pawns: every player standing in a drawn area.
  for (const p of s.players) {
    if (!p.area || !d.paths.has(p.area)) continue;
    const [cx, cy] = geo.get(p.area)!.centre;
    const x = p.area === focus ? hx : cx * k;
    const y = p.area === focus ? hy : cy;
    if (!inView(d, x, y)) continue;
    const piece = p.profile ? svg('g', { class: p === me ? 'pawn active' : 'pawn' }, iconUse(p.profile, 0, -2, 34)) : pawn(colourOf(p.seat), p === me);
    const placed = place(piece, x, y, p.area === focus ? fs * 2.8 : fs * 2.2, nameOf(p.seat));
    // The walk that just ended this turn: the piece goes from the old area to the new one, once.
    if (hold && hold.seat === p.seat && hold.from && hold.to === p.area && !hold.animated && geo.has(hold.from)) {
      hold.animated = true;
      const [fx0, fy0] = geo.get(hold.from)!.centre;
      const walker = svg('g', {}, placed);
      placed.setAttribute('transform', placed.getAttribute('transform')!.replace(/translate\([^)]*\)/, 'translate(0 0)'));
      walker.append(svg('animateTransform', { attributeName: 'transform', type: 'translate', from: `${fx0 * k} ${fy0}`, to: `${x} ${y}`, dur: `${WALK_MS}ms`, fill: 'freeze', calcMode: 'spline', keySplines: '0.4 0 0.2 1', keyTimes: '0;1' }));
      walker.setAttribute('transform', `translate(${fx0 * k} ${fy0})`);
      d.labels.append(walker);
      continue;
    }
    d.labels.append(placed);
  }
  attachZoom(d.root, k, areaNames(d, [...d.paths.keys()].filter((id) => id !== focus)));

  const caption = me.travel
    ? `${VEHICLE[me.travel.kind]} ${nameOf(me.seat)} is on the way to ${here.name}`
    : 'Pinch or scroll to zoom · drag to move';
  const reset = button('⤢', () => { camera = null; render(); });
  reset.title = 'Back to the area';
  return el('div', { className: 'areaview' },
    el('div', { className: 'where' }, dot(me.seat), ` ${here.name} · ${here.continent} `, reset),
    d.root,
    el('div', { className: 'small caption', textContent: caption }),
    popup ? renderPopup(s, popup, myTurn) : '');
}

// The popup menus of the drawn props (planes, ships, trains, wonder, citizenship).
type PopupKind = RouteKind | 'wonder' | 'citizen';

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
      : b.owner === me.seat ? 'yours.' : `owned by ${nameOf(b.owner)}.`}` });
  };

  if (p.kind === 'wonder') {
    box.append(el('div', { className: 'row spread' }, el('h3', { textContent: `🏛️ ${capital(WONDER_NAME[p.area] ?? 'the wonder')}` }), close),
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
        : `${nameOf(c.seat)} is a citizen here: to enter you pay ${nameOf(c.seat)} a ${VISA_PRICE}-point visa.` }));
    return box;
  }

  const kind: RouteKind = p.kind;
  const price = me.profile ? ticketPrice(me.profile, kind) : null;
  const turns = me.profile ? TRAVEL_TURNS[me.profile][kind] : 0;
  const noTrain = kind === 'station' && me.profile === 'luxury';
  const dests = me.profile && me.area === p.area ? destinations(map30, p.area, kind, me.profile)
    : (map30.routes ?? []).filter((r) => r.kind === kind && (r.a === p.area || r.b === p.area)).map((r) => (r.a === p.area ? r.b : r.a));
  box.append(el('div', { className: 'row spread' }, el('h3', { textContent: `${VEHICLE[kind]} ${capital(TRAVEL_WORDS[kind].place)} of ${area.name}` }), close),
    el('p', { className: 'small', textContent: noTrain ? 'Luxury can\'t take the train, but may buy the ticket booth.'
      : `${price === null ? 'Backpacker: you travel only with the quiz.' : `Ticket ${plural(price, 'point')}${ticketTo(s, kind)}.`} ${plural(turns, 'travel turn')}. The quiz is free; a wrong answer uses the turn.` }),
    businessLine(TICKET_BUSINESS[kind]),
    el('div', { className: 'row' }, buyButton(TICKET_BUSINESS[kind])));
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
    if (b) path.style.stroke = colourOf(b.seat);
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
    line.style.stroke = colourOf(p.seat);
    d.labels.append(line, piece(p.seat, ax + (bx - ax) * t, ay + (by - ay) * t, d.fs * 1.6));
  }
  for (const p of s.players) {
    if (!p.area) continue;
    const [cx, cy] = centre(p.area);
    d.labels.append(piece(p.seat, cx + (p.seat - 1.5) * d.fs * 0.9, cy, d.fs * 1.6));
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
    a.wonder ? `🏛️ ${capital(WONDER_NAME[id] ?? 'a wonder')}: the first visit gives +1 point more` : '',
    a.bigCountry ? `🧩 Part of ${a.bigCountry}: ${me.profile ? `you have visited ${parts.filter((x) => me.visitedAreas.includes(x.id)).length}/${parts.length} parts` : `${parts.length} parts`}` : '',
    routes('airport').length ? `✈️ Airport: flights to ${routes('airport').join(', ')}` : '',
    routes('port').length ? `⚓ Port: ships to ${routes('port').join(', ')}` : '',
    routes('station').length ? `🚆 Station: trains to ${routes('station').join(', ')} (not for Luxury)` : '',
    `🚶 Walk to: ${a.neighbours.map((n) => areaById.get(n)!.name).join(', ') || 'nowhere (plane or ship only)'}`,
    ...s.businesses.filter((b) => b.area === id).map((b) => `${BUSINESS_ICON[b.kind]} ${capital(BUSINESS_NAME[b.kind])}: ${b.owner === null ? `for sale, ${plural(BUSINESS_PRICE[b.kind], 'point')}` : `owned by ${nameOf(b.owner)}`}`),
    ...s.players.filter((p) => p.citizenship?.includes(id)).map((p) => `🛂 ${nameOf(p.seat)} is a citizen here: others pay a ${VISA_PRICE}-point visa`),
    ...s.players.filter((p) => p.area === id).map((p) => `📍 ${nameOf(p.seat)} is here`),
    ...s.players.filter((p) => p.home === id).map((p) => `🏠 ${nameOf(p.seat)}'s home country`),
    bookedBy(s, id) ? `⏳ Booked: ${nameOf(bookedBy(s, id)!.seat)} is on the way here` : '',
    `Visited by: ${s.players.filter((p) => p.visitedAreas.includes(id)).map((p) => nameOf(p.seat)).join(', ') || 'nobody yet'}`,
  ].filter((t) => t !== '');
  return el('div', { className: 'card details' },
    el('div', { className: 'row spread' }, el('h3', { textContent: a.name }), button('✕', () => { detailArea = null; render(); })),
    ...countries,
    ...lines.map((t) => el('p', { className: 'small', textContent: t })));
}

// Choosing the home country: the 6 continents first, then a zoom into one (area names where
// they fit; the tapped area's details show on the right).
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
      label(d, x, y, taken ? `${c}: ${nameOf(taken.seat)}` : c, open(c) ? 'go' : 'near', 1,
        open(c) ? () => { zoom = c; render(); } : undefined);
    }
    for (const p of s.players) {
      if (!p.area) continue;
      const [cx, cy] = geo.get(p.area)!.centre;
      d.labels.append(piece(p.seat, cx + (p.seat - 1.5) * d.fs * 1.2, cy, d.fs * 1.8));
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
  areaNames(d, [...d.paths.keys()].filter((id) => areaById.get(id)!.continent === c), (id) => (areaById.get(id)!.wonder ? d.fs * 1.4 : 0));
  for (const a of map30.areas.filter((x) => x.continent === c)) {
    const [x, y] = geo.get(a.id)!.centre;
    if (a.wonder) label(d, x * k, y, '🏛️', 'icons', 1.1);
  }
  wrap.append(el('div', { className: 'where' }, button('← All continents', () => { zoom = null; pickedStart = null; detailArea = null; render(); }), ` ${c}: tap an area`), d.root);
  return wrap;
}

// One layout for every screen (owner's request, task 14l): it was made for a landscape phone
// (about 820–900 × 430); bigger screens, tablets too, zoom it up, the smallest phones a little down.
let uiZoom = 1;
function applyZoom(): void {
  uiZoom = Math.min(2.4, Math.max(0.8, Math.min(window.innerWidth / 820, window.innerHeight / 430)));
  document.documentElement.style.setProperty('zoom', String(uiZoom));
  // Screen units for the CSS (style.css uses var(--vh) and var(--vw)): a zoomed page would
  // otherwise make 100vh taller than the screen.
  document.documentElement.style.setProperty('--vh', `${window.innerHeight / uiZoom / 100}px`);
  document.documentElement.style.setProperty('--vw', `${window.innerWidth / uiZoom / 100}px`);
}
applyZoom();
let resizeTimer = 0;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => { applyZoom(); if (state) render(); }, 150);
});

installIcons();
renderStart();
