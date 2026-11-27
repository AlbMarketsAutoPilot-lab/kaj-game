// The game screens on top of the engine. Task 14 A2: poster, setup, home-area picker, and the
// landscape board (left: the current area drawn; right: the world map and the turn panel).
// Robots play with simple rules, at the level chosen for each seat (task 13).

import { BUSINESS_PRICE, cardEvery, CHALLENGE_POINTS, SETUP_LENGTHS, CONTINENT_BONUS, VISA_TEST_FACTS, VISA_TEST_PASS, POINTS_NOMAD_BONUS, POINTS_NOMAD_TRIP, POINTS_NEW_AREA, POINTS_NEW_CONTINENT, POINTS_WONDER, WELCOME_BONUS, GO_HOME_POINTS, GO_HOME_TURNS, MOST_BUSINESSES_BONUS, QUIZ_TRIES, ROUTE_KINDS, bigCountryReward, ownsNoBusiness, KRISANN_BIG_COUNTRY_EXTRA, KRISANN_PLANE_PRICE, canRide, TICKET_BUSINESS, TICKET_PRICE, ticketPrice, TOUR_FEE, travelTurns, VISA_PRICE } from '../engine/constants.ts';
import {
  apply, blockedByMoney, continentReward, citizenAreas, citizenshipOf, needsVisaTest, visaOwner, bookedBy, businessAt, canPayAfterQuiz, destinations, businessValue, businessCount, mostBusinessesBonus, createGame, currentPlayer, entryFees, feeTotal, finalScore, homeFor, landTurnsToCard, legalActions, nomadAlert,
} from '../engine/engine.ts';
import { robotAction } from '../engine/normal-robot.ts';
import { loadGame, saveGame } from '../engine/save.ts';
import type { Action, Area, BusinessKind, Reward, Challenge, ChallengeResult, ChallengeType, Continent, Deck, DrawnCard, GameState, NomadAlert, Payment, Player, Profile, RobotLevel, RouteKind, SeatKind } from '../engine/types.ts';
import type { GameLength } from '../engine/constants.ts';
import type { GameMap } from '../engine/types.ts';
import { mapById, mapFor } from '../maps/index.ts';
import { map30 } from '../maps/map30.ts';
import type { Shapes } from '../maps/shapes.ts';
import { shapes30 } from '../maps/shapes30.ts';
import { shapes50 } from '../maps/shapes50.ts';
import { shapes100 } from '../maps/shapes100.ts';
import { centres } from '../maps/centres.ts';
import { colours } from '../maps/colours.ts';
import { countryCapital, countryFlag, SURPRISE_FACT, WONDER_NAME, WONDER_PLACE } from './countries.ts';
import { passportBook, recordLine, recordsBox, type PassportData } from './passport.ts';
import { COUNTRY_CODE3 } from './passport-codes.ts';
import { addWin, loadRecords, saveRecords, type WinRecord } from './records.ts';
import { areaAt, buildGeo, colourAreas, continentBox, glowFor, innerBorders, isOutlying, MAP_NAME, nameLayouts, pad, propSpots, squeeze, svg, unionBox, type Box, type PropKind } from './maps.ts';
import { airport, busStop, carRental, citizenFlag, monument, pawn, place, port, station } from './props.ts';
import { iconEl, iconUse, installIcons, PROFILE_COLOUR } from './icons.ts';
import { hitchScene, tripScene, wonderScene } from './scenes.ts';
import { guideSeen, runGuide } from './tutorial.ts';
import { play, setMusic, soundOn, startTimer, stopTimer, toggleSound, type SoundName } from './sound.ts';

// Players are named by their profile, with its icon and colour (owner's change, after task 14g);
// before the profiles are chosen they are "Player 1", "Player 2"…
const PROFILE_LABEL: Record<Profile, string> = {
  backpacker: 'Backpacker',
  business: 'Business Traveler',
  luxury: 'Luxury Traveler',
  nomad: 'Digital Nomad',
  krisann: 'Kris Ann',
};
// The short names, where the long ones don't fit (the top bar, map pieces).
const PROFILE_SHORT: Record<Profile, string> = { backpacker: 'Backpacker', business: 'Business', luxury: 'Luxury', nomad: 'Nomad', krisann: 'Kris Ann' };
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
// Step 2.1 (owner's choice A): one memory of seen questions for all human players on this device.
const SEEN_KEY = 'kaj-seen';
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
// The privacy and copyright pages (web/privacy.html, web/copyright.html), inlined by the build and
// shown inside the app (task 15): the credits and licences are on the copyright page.
const LEGAL: Record<LegalPage, string> = (window as unknown as { KAJ_LEGAL?: Record<LegalPage, string> }).KAJ_LEGAL ?? { privacy: '', copyright: '' };
type LegalPage = 'privacy' | 'copyright';
const LEGAL_NAME: Record<LegalPage, string> = { privacy: 'Privacy Policy', copyright: 'Copyright' };
// Visa test (step 2.6; the old citizenship test): 15 seconds for each question (owner's choice, task 8).
const EXAM_SECONDS = 15;
const VEHICLE: Record<RouteKind, string> = { airport: '✈️', port: '⚓', station: '🚆', bus: '🚌', car: '🚗' };
// Words for each way to travel (the train: task 17).
const TRAVEL_WORDS: Readonly<Record<RouteKind, { verb: string; vehicle: string; place: string; a: string; sound: SoundName; promo: string }>> = {
  airport: { verb: 'fly', vehicle: 'plane', place: 'airport', a: 'a plane', sound: 'plane', promo: 'Airline' },
  port: { verb: 'sail', vehicle: 'ship', place: 'port', a: 'a ship', sound: 'ship', promo: 'Ferry' },
  station: { verb: 'ride the train', vehicle: 'train', place: 'station', a: 'the train', sound: 'train', promo: 'Railway' },
  bus: { verb: 'take the bus', vehicle: 'bus', place: 'bus stop', a: 'the bus', sound: 'bus', promo: 'Bus' },
  car: { verb: 'drive', vehicle: 'car', place: 'car rental', a: 'a rented car', sound: 'car', promo: 'Car rental' },
};
// Who can't take a trip of this kind (see canRide), as told on the screens.
const NO_RIDE: Partial<Record<RouteKind, string>> = {
  station: 'Luxury can\'t take the train',
  bus: 'Only the Nomad, the Backpacker and Kris Ann take the bus',
};
const BUSINESS_ICON: Record<BusinessKind, string> = { tours: '🏛️', airline: '✈️', ferry: '⚓', train: '🚆', bus: '🚌', car: '🚗' };
const BUSINESS_NAME: Record<BusinessKind, string> = { tours: 'guided tours', airline: 'airline', ferry: 'ferry agency', train: 'train ticket booth', bus: 'bus ticket booth', car: 'car rental' };
const BUSINESS_EARNS: Record<BusinessKind, string> = {
  tours: `every other player pays you ${plural(TOUR_FEE, 'point')} to enter`,
  airline: 'every paid plane ticket from here goes to you',
  ferry: 'every paid ship ticket from here goes to you',
  train: 'every paid train ticket from here goes to you',
  bus: 'every paid bus ticket from here goes to you',
  car: 'every car rented here pays you',
};

const app = document.getElementById('app')!;
// The map of the game on screen (task M4): the 30-turn map (default), the 50- or the 100-turn map, set by
// useMap() when a game starts or a saved game continues. The drawings of each map are made once.
// The 100-turn map's shapes (step 2.12, J3) are here, but its game is not in the setup screen until J5.
const SHAPES: Record<string, Shapes> = { map30: shapes30, map50: shapes50, map100: shapes100 };
const drawn = new Map<string, { geo: ReturnType<typeof buildGeo>; colour: Map<string, string> }>();
let gameMap: GameMap = map30;
let areaById = new Map<string, Area>();
let continents: Continent[] = [];
let geo: ReturnType<typeof buildGeo> = new Map();
let worldBox: Box;
let areaColour = new Map<string, string>();
function useMap(m: GameMap): void {
  if (!drawn.has(m.id)) {
    const g = buildGeo(m, SHAPES[m.id], centres[m.id]);
    drawn.set(m.id, { geo: g, colour: colours[m.id] ? new Map(Object.entries(colours[m.id])) : colourAreas(m, g) });
  }
  gameMap = m;
  areaById = new Map(m.areas.map((a) => [a.id, a]));
  continents = [...new Set(m.areas.map((a) => a.continent))];
  ({ geo, colour: areaColour } = drawn.get(m.id)!);
  worldBox = unionBox([...geo.values()].map((g) => g.box));
}
useMap(map30);
// Where the routes of this kind go from an area (a one-way route, the bus, only from its start).
const routeEnds = (id: string, kind: RouteKind) => (gameMap.routes ?? []).filter((r) => r.kind === kind)
  .flatMap((r) => (r.a === id ? [r.b] : r.b === id && !r.oneWay ? [r.a] : []));
const hasRoute = (id: string, kind: RouteKind) => routeEnds(id, kind).length > 0;

let state: GameState | null = null;
let robotSeed = 1;
let robotTimer = 0;
// The game state the robot's timer was started for (see render).
let robotFor: GameState | null = null;
// The end of a turn (owner's request, task 14i): the map stays on the player who just moved
// while their piece walks there; a person then sees what the turn gave and taps "End turn"
// (a robot's ends by itself).
let hold: { seat: number; from: string | null; to: string | null; lines: string[]; area: string | null; ready: boolean; animated: boolean } | null = null;
let holdTimer = 0;
let quizTimer = 0;
// The Nomad pressed "Play the challenge": it works on trips (owner, 2026-10-11), so a joke instead.
let nomadAtWork = false;
// What happened (other players' moves, payments, cards), shown in one popup (task 14 B2):
// on a person's turn, or straight after a person's own move (`newsNow`).
let news: string[] = [];
let newsNow = false;
// Money people earn from others (visa, tour fee, a ticket on their airline or ferry): a gold
// popup for each person, never for a robot (owner's request).
let income: { seat: number; text: string }[] = [];
// A person's surprise or whole continent (owner, M5): a gold popup each. A robot's continent is
// told in "What happened"; a robot's surprise stays secret.
let celebrations: Reward[] = [];
// The popup after a person answers a quiz, test or challenge question: right or wrong, the
// right answer and the fact behind it (owner's request).
let answered: { ok: boolean; title: string; lines: string[] } | null = null;
// A person's hitchhike (task 19): the thumb by the road, and whether a car stopped.
let hitched: { stopped: boolean; to: string } | null = null;
// Event cards already shown in a popup (round, seat, card).
const seenCards = new Set<string>();
// The Business's "Take citizenship" popup is open (step 2.6; a button and a popup, owner's request).
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
// A small note on the area map (owner, M5): why a tapped area can't be reached; it fades away.
let mapNote: { text: string; until: number } | null = null;
const NOTE_MS = 5000;
// The visited area the player tapped: asked "Go anyway?" first (owner, M5).
let confirmWalk: string | null = null;
// The world map shown full screen (owner, M5).
let worldFull = false;
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
  legalOpen = false;
  clearTimeout(robotTimer);
  robotFor = null;
  clearTimeout(holdTimer);
  hold = null;
  clearInterval(quizTimer);
  stopTimer();
  setMusic('menu');
  state = null;
  useMap(map30); // the guide plays on the 30-turn map
  const saved = readSave();
  // The guide starts by itself on the very first ▶ Play (owner's request).
  const guide = (after: () => void, doneLabel?: string) => runGuide({
    app, geo, areaColour, el, button,
    flag: (country) => { const code = countryFlag(country); return code && FLAGS[code] ? el('img', { className: 'mini-flag', src: FLAGS[code], alt: '' }) : ''; },
    question: (title, text, options, correct, onAnswer, key, note) => timedQuestion([title], text, options, correct, onAnswer, QUIZ_SECONDS, key, note),
    stopClock: () => { clearInterval(quizTimer); stopTimer(); },
  }, after, doneLabel);
  const play = button('▶ Play', () => (guideSeen() ? renderSetup() : guide(renderSetup)));
  play.className = 'primary big';
  const howTo = button('📖 How to play', () => guide(renderStart, '✔ Back to the start'));
  // A saved game continues on its own map (task M4).
  const savedMap = saved && 'state' in saved ? mapById(saved.state.mapId) : undefined;
  // Audit 2.13: before the game starts (profiles and home countries) there is no round yet.
  const resume = saved && 'state' in saved && savedMap
    ? button(saved.state.phase === 'play' ? `Continue (round ${saved.state.round} / ${saved.state.totalRounds})` : 'Continue (getting ready)', () => {
      useMap(savedMap);
      resetScreen();
      state = saved.state;
      // Audit 2.13: an answer popup that was open when the app closed comes back.
      answered = readAnswered(state);
      // Step 2.12 J6: Halfway and the last five turns are not shown again when their round has passed.
      for (const m of milestones(state.totalRounds)) if (state.round > m.round) seenCards.add(m.key);
      render();
    })
    : null;
  app.replaceChildren(
    el('section', { className: 'poster' },
      POSTER ? el('img', { src: POSTER, alt: "Kris Ann's Journey" }) : title(),
      el('div', { className: 'poster-buttons' }, play, resume ?? '', howTo, soundButton()),
      el('footer', { className: 'poster-legal' },
        el('p', {}, legalLink('privacy'), legalLink('copyright')),
        el('p', { textContent: '© 2026 Connect AL. All rights reserved.' }))),
  );
}

// A link to the privacy or copyright page (owner, task 15); it opens inside the app.
function legalLink(page: LegalPage): HTMLElement {
  const link = el('span', { className: 'legal-link', textContent: LEGAL_NAME[page], role: 'link', tabIndex: 0 });
  link.addEventListener('click', () => renderLegal(page));
  link.addEventListener('keydown', (e) => { if (e.key === 'Enter') renderLegal(page); });
  return link;
}

// The privacy or copyright page; Back (or the phone's back button) returns to the start screen.
let legalOpen = false;
function renderLegal(page: LegalPage): void {
  legalOpen = true;
  const text = el('div');
  text.innerHTML = LEGAL[page]; // the game's own pages, from the build
  app.replaceChildren(
    el('section', { className: 'card legal' },
      el('div', { className: 'row' }, button('← Back', renderStart)),
      text,
      el('div', { className: 'row' }, button('← Back', renderStart))),
  );
  window.scrollTo(0, 0);
}

// ---------- setup screen ----------

function renderSetup(): void {
  clearTimeout(robotTimer);
  robotFor = null;
  clearTimeout(holdTimer);
  hold = null;
  clearInterval(quizTimer);
  stopTimer();
  setMusic('menu');
  state = null;
  const kinds: SeatKind[] = ['human', 'robot', 'robot', 'robot'];
  const levels: RobotLevel[] = ['normal', 'normal', 'normal', 'normal'];
  let count = 2;
  // The journey's length (task M4): 30 turns (default), 50 turns or, since step 2.12 part J5, 100 turns.
  let turns: GameLength = SETUP_LENGTHS[0];

  const rows = el('div', { className: 'seats' });
  const counts = el('div', { className: 'row' });
  const lengths = el('div', { className: 'row journey' });
  const about = el('p');
  const error = el('p', { className: 'error' });
  const draw = () => {
    lengths.replaceChildren('Journey: ', ...SETUP_LENGTHS.map((n) => {
      const b = button(`${n} turns`, () => { turns = n; draw(); });
      if (n === turns) b.className = 'chosen';
      return b;
    }));
    about.textContent = turns === 100
      ? 'Best played on a big screen or at KriTere.com' // owner (2.13): no period after the website
      : turns === SETUP_LENGTHS[0]
        ? `${turns} rounds around the world.`
        : `${turns} rounds around a bigger world.`;
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
      const seats = kinds.slice(0, count).map((kind, i) => ({ kind, colour: ['red', 'blue', 'green', 'yellow'][i], ...(kind === 'robot' ? { level: levels[i] } : { seen: readSeen() }) }));
      resetScreen();
      clearClock();
      writeAnswered(null, null);
      useMap(mapFor(turns));
      state = createGame({ seats, seed }, gameMap);
      render();
    } catch (e) {
      error.textContent = (e as Error).message;
    }
  });
  start.className = 'primary';

  app.replaceChildren(
    // Two columns, so the whole screen fits a phone held sideways (2026-10-10).
    el('section', { className: 'card setup new-game' },
      title(),
      el('div', { className: 'setup-cols' },
        el('div', { className: 'setup-col' },
          lengths, about,
          saved && 'error' in saved ? el('p', { className: 'small', textContent: `${saved.error} It can't be continued; start a new journey.` }) : '',
          counts),
        el('div', { className: 'setup-col' }, rows)),
      guideBox(),
      noticesBox(),
      el('div', { className: 'row' }, button('← Back', renderStart), start),
      saved && 'state' in saved ? el('p', { className: 'small', textContent: 'Starting a new journey replaces the saved game.' }) : '',
      error),
  );
}

// "Guided help" on the setup screen: turns the guide back on after "Turn off guided help".
// "What happened" popups: turned off only during a game, with "Don't show again" (owner, M5);
// not on the setup screen (owner, 2026-10-10). Kept on this device.
const NEWS_KEY = 'kaj-news-off';
let newsOff = (() => { try { return localStorage.getItem(NEWS_KEY) === '1'; } catch { return false; } })();
function setNewsOff(off: boolean): void {
  newsOff = off;
  try { localStorage.setItem(NEWS_KEY, off ? '1' : '0'); } catch { /* not kept */ }
}

// Rule notices (owner, step 2.8): visa, businesses, going home. Each has "Don't show this again", kept on this device.
type InfoKind = 'visa' | 'business' | 'home';
const INFO_KEY = (k: InfoKind) => `kaj-info-${k}-off`;
const infoOff = (k: InfoKind) => { try { return localStorage.getItem(INFO_KEY(k)) === '1'; } catch { return false; } };
function setInfoOff(k: InfoKind): void {
  try { localStorage.setItem(INFO_KEY(k), '1'); } catch { /* not kept */ }
}
// A move into a visa country waits here until the visa notice is read.
let visaInfo: Action | null = null;
// Step 2.12 J6: the seat whose start passport is open (just after choosing the home country).
let startPassport: number | null = null;

// Audit 2.13: "What happened" and the rule notices, turned off with "Don't show … again", come back from here.
function noticesBox(): HTMLElement {
  const kinds: InfoKind[] = ['visa', 'business', 'home'];
  const tick = el('input', { type: 'checkbox', checked: !newsOff && kinds.every((k) => !infoOff(k)) });
  tick.addEventListener('change', () => {
    setNewsOff(!tick.checked);
    for (const k of kinds) { try { localStorage.setItem(INFO_KEY(k), tick.checked ? '0' : '1'); } catch { /* not kept */ } }
  });
  return el('label', { className: 'small' }, tick, ' 📣 "What happened" and rule notices');
}

function guideBox(): HTMLElement {
  const tick = el('input', { type: 'checkbox', checked: !guideOff });
  tick.addEventListener('change', () => {
    guideOff = !tick.checked;
    try { localStorage.setItem(GUIDE_KEY, guideOff ? '1' : '0'); } catch { /* not kept */ }
  });
  return el('label', { className: 'small' }, tick, ' 🧭 Guided help for people (what you can do each turn)');
}

// Step 2.8 (owner): the profile's advantages alone, in the popup before a person confirms a profile.
const GOOD_ONLY = '\u0000good';
// The profile a person tapped, waiting for "Play as …" or "Choose another" (owner, step 2.8).
let pendingProfile: Profile | null = null;
// What the "It's your turn" chips showed last time, per seat: a chip whose number went up glows (owner, step 2.8).
const lastChips = new Map<number, Map<string, number>>();

// "You chose …": the profile's advantages and weaknesses (rulebook section 12), shown while
// choosing the home country (owner's request).
function profileNote(p: Profile, who = ''): HTMLElement {
  const price = TICKET_PRICE[p];
  const plane = travelTurns(p, 'airport', true);
  const ship = travelTurns(p, 'port', true);
  const trips = `planes ${plane ? plural(plane, 'travel turn') : 'arrive right away'}, ships ${plural(ship, 'travel turn')}`;
  // Step 2.7 (owner): with the free quiz every profile travels like the Backpacker.
  const quizTrips = `with the free quiz: planes ${plural(travelTurns(p, 'airport', false), 'travel turn')}, ships ${plural(travelTurns(p, 'port', false), 'travel turn')}`;
  const CITIZEN_LINE = `A citizen of its home country from the start: others pay it a ${VISA_PRICE}-point visa to enter.`;
  const CAR_LINE = `Can rent a car in Mexico (${plural(ticketPrice(p, 'car') ?? 0, 'point')}): all of the USA or all of Canada (+${bigCountryReward(p, 3)}) at once.`;
  const good: Record<Profile, string[]> = {
    backpacker: ['Never pays for a ticket: always the free quiz.', 'Can take the bus from Mongolia: all of Russia (+5) or all of China (+3) at once.', 'Can try to hitchhike from Mexico: all of the USA or all of Canada (+5) at once, if a car stops.', `+${CONTINENT_BONUS.backpacker!.points} for visiting ${CONTINENT_BONUS.backpacker!.continents} continents.`, CITIZEN_LINE],
    business: [CITIZEN_LINE, 'Can take a 2nd citizenship for free, once, in an area it stands in.', 'Never pays a visa (but takes the visa test).', `Fast when it pays: ${trips}.`, CAR_LINE],
    luxury: ['Can fly or sail to any airport or port.', CITIZEN_LINE, 'Never takes a visa test (it pays the visa).', `Fast when it pays: ${trips}.`, CAR_LINE],
    // Step 2.8 (owner): the boss alerts stay a surprise; the trip point in one short line.
    nomad: [`The cheapest tickets: ${plural(price ?? 0, 'point')} for planes, ships and trains; fast when it pays: ${trips}.`, `Gets paid +${POINTS_NOMAD_TRIP} during trips to new areas.`, 'Can take the bus from Mongolia: all of Russia (+5) or all of China (+3) at once.', CAR_LINE],
    // Step 2.11 (owner): Kris Ann, the game's heroine, travels with her Dad.
    krisann: [`+${KRISANN_BIG_COUNTRY_EXTRA} extra for every big country she finishes: USA, Canada, Russia +${bigCountryReward('krisann', 3)}; China, Brazil, Australia +${bigCountryReward('krisann', 2)}.`, `Can take the bus from Mongolia: all of Russia (+${bigCountryReward('krisann', 3)}) or all of China (+${bigCountryReward('krisann', 2)}) at once.`, `Can rent a car in Mexico (${plural(ticketPrice('krisann', 'car') ?? 0, 'point')}): all of the USA or all of Canada (+${bigCountryReward('krisann', 3)}) at once.`, `A citizen of her home country from the start: others pay her a ${VISA_PRICE}-point visa to enter.`, 'Travels with Dad.'],
  };
  const bad: Record<Profile, string[]> = {
    backpacker: ['Travels by plane, ship, train or bus only with the quiz (one try per turn), and never rents a car.', `Slow: ${trips}.`],
    business: [`Ticket ${plural(price ?? 0, 'point')}.`, `Slower ${quizTrips}.`, 'Can\'t take the bus.'],
    luxury: [`The highest ticket: ${plural(price ?? 0, 'point')}.`, `Slower ${quizTrips}.`, 'Can\'t take the train or the bus.'],
    nomad: ['No citizenship: it pays visas but never receives any.', 'Works on trips: no travel challenges.', `No trip point for a paid plane, train or bus (0 travel turns). Slower ${quizTrips}.`],
    krisann: ['Never owns a business.', `Plane ticket ${plural(KRISANN_PLANE_PRICE, 'point')}; ship, train, bus and car ${plural(price ?? 0, 'point')}.`, `Slower ${quizTrips}.`],
  };
  if (who === GOOD_ONLY) return el('ul', { className: 'profile-good' }, ...good[p].map((t) => el('li', { textContent: t })));
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

// The questions seen by any human on this device (step 2.1), oldest first.
function readSeen(): string[] {
  try {
    const list: unknown = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]');
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

// Every human started the game from the device's memory; the new memory is what they have all
// seen now (a pool used up by one of them starts again for that player).
function writeSeen(s: GameState): void {
  const all = s.players.filter((p) => p.kind === 'human').flatMap((p) => p.seen);
  const last = new Map(all.map((id, i) => [id, i]));
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(all.filter((id, i) => last.get(id) === i)));
  } catch {
    // not kept
  }
}

// Audit 2.13: a new or continued game starts with a clean screen. Details, a player card or popups left open in the
// last game could name an area or a player the new game doesn't have (the screen then stopped updating).
function resetScreen(): void {
  clearTimeout(holdTimer);
  hold = null;
  seenCards.clear();
  lastChips.clear();
  news = [];
  newsNow = false;
  income = [];
  celebrations = [];
  answered = null;
  hitched = null;
  nomadAtWork = false;
  citizenPopup = false;
  pendingFees = null;
  pendingProfile = null;
  visaInfo = null;
  startPassport = null;
  selling = false;
  zoom = null;
  pickedStart = null;
  detailArea = null;
  shownPlayer = null;
  mapNote = null;
  confirmWalk = null;
  worldFull = false;
  popup = null;
  camera = null;
  examReady = null;
  countdown = null;
  notebookOpened = '';
}

// Audit 2.13: the question clock and the right-or-wrong popup are kept on the device (not in the saved game), so
// closing and reopening the app neither gives a fresh 15 seconds nor loses the answer's popup.
const CLOCK_KEY = 'kaj-clock';
const ANSWER_KEY = 'kaj-answered';
function storedClock(key: string): number | null {
  try {
    const c: unknown = JSON.parse(localStorage.getItem(CLOCK_KEY) ?? 'null');
    return c && typeof c === 'object' && (c as { key?: unknown }).key === key && typeof (c as { deadline?: unknown }).deadline === 'number'
      ? (c as { deadline: number }).deadline : null;
  } catch {
    return null;
  }
}
function storeClock(key: string, deadline: number): void {
  try { localStorage.setItem(CLOCK_KEY, JSON.stringify({ key, deadline })); } catch { /* not kept */ }
}
function clearClock(): void {
  try { localStorage.removeItem(CLOCK_KEY); } catch { /* not kept */ }
}
// The answer popup belongs to the saved state it followed (its round and turn).
function writeAnswered(s: GameState | null, a: typeof answered): void {
  try {
    if (a && s) localStorage.setItem(ANSWER_KEY, JSON.stringify({ round: s.round, current: s.current, phase: s.phase, answered: a }));
    else localStorage.removeItem(ANSWER_KEY);
  } catch { /* not kept */ }
}
function readAnswered(s: GameState): typeof answered {
  try {
    const x = JSON.parse(localStorage.getItem(ANSWER_KEY) ?? 'null') as { round: number; current: number; phase: string; answered: NonNullable<typeof answered> } | null;
    return x && x.round === s.round && x.current === s.current && x.phase === s.phase && Array.isArray(x.answered?.lines) ? x.answered : null;
  } catch {
    return null;
  }
}

// Saved after every move; a finished game is removed, so "Continue" never shows it.
function writeSave(s: GameState): void {
  writeSeen(s);
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
  const home = action.type === 'goHome' ? homeFor(state, gameMap, mover) : null;
  // A 3rd wrong quiz answer: pay and travel, or go home (owner's rule, task 13).
  const quiz = state.quiz;
  const lastTry = action.type === 'answer' && quiz && action.choice !== quiz.question.correct && mover.quizWrong >= QUIZ_TRIES - 1
    ? { pays: canPayAfterQuiz(state, mover, quiz.kind, quiz.to), home: homeFor(state, gameMap, mover) } : null;
  const offer = state.offer;
  const before = state;
  state = apply(state, gameMap, action);
  const after = state.players[mover.seat];
  const lines: string[] = [];
  stopTimer();
  clearClock();
  if (mover.kind === 'human') {
    moveSound(action, state.payments.some((p) => p.from === mover.seat && (p.reason === 'buy' || p.reason === 'sale')));
    answered = answerResult(before, state, action);
    if (answered) writeAnswered(state, answered);
    if (action.type === 'hitchhike' && state.hitchhiked) hitched = { stopped: state.hitchhiked.stopped, to: action.to };
  } else if (action.type === 'walk') {
    play('walk');
  }
  // The turn is over: hold the map on the mover (the start area gives the welcome bonus, not
  // visit points: no hold for choosing it).
  if (state.phase === 'play' && action.type !== 'chooseStart' && (currentPlayer(state).seat !== mover.seat || state.round !== before.round)) {
    const walked = action.type === 'walk' || action.type === 'goHome';
    const arrival = arrivalLines(mover, after);
    hold = { seat: mover.seat, from: walked ? mover.area : null, to: walked ? after.area : null, lines: arrival?.lines ?? [], area: arrival?.area ?? null, ready: false, animated: false };
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
  if (action.type === 'buyCitizenship' && after.bought) {
    lines.push(`🛂 ${name} is now also a citizen of ${citizenshipName(after.bought)}: entering it means a visa test and a ${VISA_PRICE}-point visa to ${name}.`);
  }
  // A robot's visa test (a person sees the answers in the popups).
  if (state.visaTested && mover.kind !== 'human') {
    const v = state.visaTested;
    lines.push(v.passed
      ? `🛂 ${name} passed the visa test for ${areaById.get(v.to)!.name} (${v.right} of ${v.test.questions.length} right).`
      : `🛂 ${name} failed the visa test for ${areaById.get(v.to)!.name} (${v.right} of ${v.test.questions.length} right): no entry, the turn is over.`);
  }
  const bonus = mover.profile ? CONTINENT_BONUS[mover.profile] : undefined;
  if (bonus && mover.visitedContinents.length < bonus.continents && after.visitedContinents.length >= bonus.continents) {
    lines.push(`${PROFILE_LABEL[mover.profile!]} bonus: ${name} has visited ${bonus.continents} continents, +${bonus.points}!`);
  }
  // Audit 2.13: going home after 3 turns blocked by money ("you" for a person; the +2 is told with the reward).
  if (home) {
    lines.push(mover.kind === 'human'
      ? `🏠 You could not pay to move for ${GO_HOME_TURNS} turns, so you go home to ${areaById.get(home)!.name}, free of any fees.`
      : `🏠 ${name} could not pay to move for ${GO_HOME_TURNS} turns, so ${name} goes home to ${areaById.get(home)!.name}, free of any fees.`);
  }
  // A robot's 3rd wrong answer (a person reads it in the answer popup, wrongQuizLine), with the same rule: the ticket
  // is bought, first the visa test if the country needs one, or home when there is no ticket to buy.
  if (lastTry && mover.kind !== 'human' && quiz) {
    const where = areaById.get(quiz.to)!.name;
    const price = mover.profile ? ticketPrice(mover.profile, quiz.kind) : null;
    lines.push(state.visa
      ? `❌ ${name}: ${QUIZ_TRIES} wrong answers here, so ${name} buys the ticket (${plural(price ?? 0, 'point')}), but first takes the visa test for ${where}.`
      : lastTry.pays
        ? `❌ ${name}: ${QUIZ_TRIES} wrong answers here, so ${name} buys the ticket (${plural(price ?? 0, 'point')}) and travels to ${where}.`
        : `❌ ${name}: ${QUIZ_TRIES} wrong answers here and ${price === null ? `the ${PROFILE_LABEL[mover.profile!]} travels only with the quiz` : 'not enough points for the ticket'}, so ${name} goes home to ${areaById.get(lastTry.home)!.name}, free of any fees.`);
  }
  // A robot's trip (owner's request, task 17): which plane, ship or train it took, and where to.
  const tripKind = action.type === 'board' ? action.kind : action.type === 'answer' && quiz ? quiz.kind : null;
  const tripTo = action.type === 'board' ? action.to : quiz?.to;
  if (mover.kind === 'robot' && !lastTry && tripKind && tripTo && (after.travel?.to === tripTo || (after.area === tripTo && mover.area !== tripTo))) {
    const free = action.type === 'answer' && action.choice === quiz!.question.correct ? ' with a free quiz ticket' : '';
    lines.push(`${VEHICLE[tripKind]} ${name} took ${TRAVEL_WORDS[tripKind].a} to ${areaById.get(tripTo)!.name}${free}.`);
  }
  // A robot's hitchhike (task 19).
  if (mover.kind === 'robot' && action.type === 'hitchhike' && state.hitchhiked) {
    lines.push(state.hitchhiked.stopped
      ? `👍 ${name} hitchhiked: a car stopped and took ${name} to ${areaById.get(action.to)!.name}.`
      : `👍 ${name} tried to hitchhike, but no car stopped.`);
  }
  // Robots' challenges and event cards are not told to people (owner's request, task 17).
  if (state.challenged && !answered && state.players[state.challenged.seat].kind === 'human') lines.push(challengeNote(state.challenged));
  for (const p of state.payments) {
    const line = incomeLine(state, p);
    if (line) income.push(line);
    else if (paymentNote(p) !== '') lines.push(paymentNote(p));
  }
  for (const r of state.rewards) {
    if (state.players[r.seat].kind === 'human') celebrations.push(r);
    else if (r.kind === 'continent') lines.push(`🌍 ${nameOf(r.seat)} visited every area of ${r.continent}: +${plural(r.points, 'point')}!`);
    else if (r.kind === 'home') lines.push(`🏠 ${nameOf(r.seat)} went home: +${plural(r.points, 'point')} to start again.`);
  }
  if (mover.kind === 'human' && (income.length > 0 || celebrations.length > 0)) newsNow = true;
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

const DECK_ICON: Record<Deck, string> = { country: '🗺️', krisann: '🧭' };

// What the card did: the points really won or lost, or the lost turn.
function cardEffect(c: DrawnCard): string {
  const { points, loseTurn } = c.card;
  if (loseTurn) return '⏸️ This turn is lost.';
  if (points === 0) return '0 points.';
  if (points > 0) return `+${plural(points, 'point')}.`;
  if (c.change === 0) return `−${plural(-points, 'point')}, but there were no points to lose.`;
  if (c.change !== points) return `−${plural(-points, 'point')}: only ${-c.change} to lose, so ${-c.change} lost.`;
  return `−${plural(-points, 'point')}.`;
}

function cardNote(c: DrawnCard): string {
  return `🔔 ${nameOf(c.seat)}'s ${c.card.deck} card ${DECK_ICON[c.card.deck]}: “${c.card.text}” ${cardEffect(c)}`;
}

// The event card in its popup: a big golden card (owner's request: "it must look like an event").
// Where the news comes from: the area the player is in (Backpacker tips come from the road).
function newsFrom(c: DrawnCard): string {
  const area = state?.players[c.seat].area;
  if (c.card.deck === 'krisann') return 'Kris Ann & Dad';
  return area ? `News from ${areaById.get(area)!.name}` : 'News';
}

// Step 2.11 (owner): Kris Ann's own card, a picture popup like the wonder posters (the owner's art), shown to every
// player, also when Kris Ann is a robot: the only robot popup people see. Never the phone news.
const KRISANN_ART: Record<string, string> = (window as unknown as { KAJ_KRISANN?: Record<string, string> }).KAJ_KRISANN ?? {};
function krisAnnCard(c: DrawnCard, close: () => void): HTMLElement {
  const okButton = button('OK', close);
  okButton.className = 'primary';
  const art = KRISANN_ART[c.card.id];
  return el('div', { className: 'trip-turn ka-card' },
    art ? el('img', { className: 'ka-art', src: art, alt: '' }) : el('div', {}),
    el('div', { className: 'trip-text' },
      el('p', { className: 'ka-kicker', textContent: '🧭 Kris Ann & Dad' }),
      el('h2', { className: 'ka-title', textContent: c.card.title }),
      el('p', { textContent: c.card.text }),
      el('p', { className: `ka-points${c.card.points < 0 ? ' bad' : ''}`, textContent: cardEffect(c) }),
      el('div', { className: 'row' }, okButton)));
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

// The Nomad's boss alert (step 2.5, owner): on a free (quiz) ship trip to a new area, at the start of its last (2nd) travel turn (step 2.7),
// by turns a challenge offer or a +1 bonus. The same phone as the event news.
const BOSS_ALERT: Record<NomadAlert, string> = {
  challenge: 'Your boss appreciates you working hard, so he has changed his mind! You can accept a challenge this turn if you want.',
  bonus: `Your boss is very happy with your work! You receive a bonus +${plural(POINTS_NOMAD_BONUS, 'point')} for this trip.`,
};
function phoneBoss(seat: number, alert: NomadAlert, onRead: () => void): HTMLElement {
  const read = button('👍 OK', onRead);
  read.className = 'primary';
  return el('div', { className: 'phone-wrap' },
    el('div', { className: 'phone' }, el('div', { className: 'phone-screen' },
      el('div', { className: 'phone-notch' }),
      el('div', { className: 'phone-time', textContent: new Date().toTimeString().slice(0, 5) }),
      el('div', { className: 'phone-date', textContent: `Round ${state?.round} of ${state?.totalRounds}` }),
      el('div', { className: 'phone-note' },
        el('div', { className: 'phone-app' }, el('span', { className: 'phone-badge', textContent: '💼' }), 'Message from your boss', el('span', { className: 'phone-now', textContent: 'now' })),
        el('h4', {}, dot(seat), ` ${nameOf(seat)}, ${alert === 'bonus' ? 'a bonus!' : 'good news!'}`),
        el('p', { textContent: BOSS_ALERT[alert] })),
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

const TICKET_WORDS: Record<BusinessKind, string> = {
  tours: 'visited your guided tours', airline: 'flew with your airline', ferry: 'sailed with your ferry agency',
  train: 'took the train with your ticket booth', bus: 'took the bus with your ticket booth', car: 'rented a car at your car rental',
};
// A payment to a person from someone else: their income, cheered in a popup (owner's request).
function incomeLine(s: GameState, p: Payment): { seat: number; text: string } | null {
  if (p.to === null || p.to === p.from || s.players[p.to].kind !== 'human') return null;
  const from = `${nameOf(p.from)}${s.players[p.from].kind === 'robot' ? ' 🤖' : ''}`;
  const where = areaById.get(p.area)!.name;
  const pts = plural(p.amount, 'point');
  switch (p.reason) {
    case 'visa': return { seat: p.to, text: `🛂 ${from} just paid you a ${p.amount}-point visa to enter ${where}, your citizenship country!` };
    case 'tour': return { seat: p.to, text: `🏛️ ${from} just paid you ${pts} to visit your Guided Tours of ${WONDER_NAME[p.area] ?? where}!` };
    // Audit 2.13: the words of each business (a train, bus or car ticket is not a flight).
    case 'ticket': return { seat: p.to, text: `${BUSINESS_ICON[p.business!]} ${from} just ${TICKET_WORDS[p.business!]} from ${where}: +${pts} for you!` };
    default: return null;
  }
}

// Step 2.7 (owner): the final score's parts, and the order of a tie: points, then more businesses, then
// more continents, then more areas (the engine's rank).
function scoreDetail(s: GameState, seat: number): string {
  const p = s.players[seat];
  const bonus = mostBusinessesBonus(s.businesses, seat);
  const owned = businessCount(s.businesses, seat);
  return [`${p.points} travel`, `${businessValue(s, seat)} from businesses`, ...(bonus ? [`${bonus} for the most businesses`] : [])].join(' + ')
    + `; ${owned === 1 ? '1 business' : `${owned} businesses`}`;
}
function rankKey(s: GameState, p: Player): number[] {
  return [finalScore(s, p), businessCount(s.businesses, p.seat), p.visitedContinents.length, p.visitedAreas.length];
}
function placeOf(s: GameState, p: Player): number {
  const better = (a: number[], b: number[]) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i]; return false; };
  return 1 + s.players.filter((o) => better(rankKey(s, o), rankKey(s, p))).length;
}
const TIE_RULE = `Equal points? The player with more businesses wins, then more continents, then more areas. Owning the most businesses also gives +${MOST_BUSINESSES_BONUS} at the end.`;

// The end of the game: the winner popup (step 2.10 design, owner). Left: the trophy, the title, a cheer for
// every winning person (robots never; other places are not mentioned) with their new record, if any. Right:
// the ranking, a passport button on each person's row, then "Play again" and "Records". The passport and
// the records open over this popup, which stays until "Play again" (or the back button).
function finishPopup(s: GameState): HTMLElement {
  const r = s.result!;
  const { places, date } = recordWins(s);
  const humanWinners = r.winners.filter((w) => s.players[w].kind === 'human');
  // Audit 2.13: a shared win names every winner ("… shares the cup with Luxury Traveler 🤖").
  const robotWinners = r.winners.filter((w) => s.players[w].kind !== 'human').map((w) => `${nameOf(w)} 🤖`);
  const people = humanWinners.map((w) => nameOf(w)).join(' and ');
  const title = humanWinners.length === 0
    ? '🏁 The journey is over!'
    : r.winners.length === 1
      ? `🎉 ${people} wins!`
      : `🎉 ${people} ${humanWinners.length > 1 ? 'share' : 'shares'} the cup${robotWinners.length ? ` with ${robotWinners.join(' and ')}` : ''}!`;
  const short = humanWinners.length > 1;
  const cheers = humanWinners.flatMap((w) => {
    const p = s.players[w];
    const place = places.get(w);
    return [el('p', { className: 'cheer', textContent: short
      ? `🏆 Congratulations, ${nameOf(w)}! ${plural(finalScore(s, p), 'point')}, ${plural(p.visitedAreas.length, 'area')}!`
      : `🏆 Congratulations, ${nameOf(w)}! ${plural(finalScore(s, p), 'point')}, ${plural(p.visitedAreas.length, 'area')}, ${plural(p.visitedContinents.length, 'continent')}!` }),
      ...(place ? [el('p', { className: 'rec-line', textContent: recordLine(place, s.totalRounds, short) })] : [])];
  });
  const again = button('▶ Play again', () => { closeOverlay(); renderSetup(); });
  again.className = 'primary';
  const records = button('🏆 Records', () => openOverlay(recordsBox(loadRecords(), s.totalRounds, { turns: s.totalRounds, places: [...places.values()] }, closeOverlay)));
  return el('div', { className: 'finish fin2' },
    el('div', {},
      el('div', { className: 'trophy', textContent: humanWinners.length > 0 ? '🏆' : '🧭' }),
      el('h2', { className: 'big-title', textContent: title }),
      ...cheers),
    el('div', {},
      el('ol', { className: 'ranking' }, ...r.ranking.map((seat) => {
        const p = s.players[seat];
        // A medal for the first three places; a full tie shares a place (step 2.7: ties go to more
        // businesses, then continents, then areas).
        const place = placeOf(s, p);
        const passport = p.kind === 'human'
          ? [button('🛂 Passport', () => openOverlay(passportBook(passportData(s, p, date), closeOverlay)))]
          : [];
        if (passport[0]) passport[0].className = 'ppb';
        return el('li', { className: place === 1 ? 'first' : '' },
          el('div', {},
            el('span', { className: 'medal', textContent: ['🥇', '🥈', '🥉'][place - 1] ?? `${place}.` }),
            ' ', dot(seat), ` ${nameOf(seat)}${p.kind === 'robot' ? ' 🤖' : ''}: `, el('b', { textContent: plural(finalScore(s, p), 'point') }),
            el('small', { textContent: scoreDetail(s, seat).replace('; ', ' · ') })),
          ...passport);
      })),
      el('div', { className: 'row' }, again, records)));
}

// Step 2.10: each person's win goes into the records on this device once per game (robots never).
const recordedGames = new WeakMap<GameState, { places: Map<number, number>; date: Date }>();
function recordWins(s: GameState): { places: Map<number, number>; date: Date } {
  const done = recordedGames.get(s);
  if (done) return done;
  const date = new Date();
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const places = new Map<number, number>();
  let records = loadRecords();
  const wins = s.result!.winners.map((w) => s.players[w]).filter((p) => p.kind === 'human' && p.profile);
  const added: { seat: number; win: WinRecord }[] = [];
  for (const p of wins) {
    const win: WinRecord = { points: finalScore(s, p), areas: p.visitedAreas.length, continents: p.visitedContinents.length, profile: p.profile!, players: s.players.length, date: iso };
    records = addWin(records, s.totalRounds, win).records;
    added.push({ seat: p.seat, win });
  }
  // Places once all of this game's wins are in (a shared win: both rows).
  for (const { seat, win } of added) {
    const i = (records[String(s.totalRounds)] ?? []).indexOf(win);
    if (i >= 0) places.set(seat, i + 1);
  }
  if (wins.length) saveRecords(records);
  const out = { places, date };
  recordedGames.set(s, out);
  return out;
}

// The passport of a person (step 2.10): the cover country is the citizenship (the Nomad: its start
// country, with nationality "none"); an area with several countries shows the area's name and the flag of
// its first country.
function passportData(s: GameState, p: Player, date: Date): PassportData {
  const home = areaById.get(p.home!)!;
  const country = p.citizenship ? citizenshipName(p.citizenship) : home.bigCountry ?? home.name;
  const first = areaById.get((p.citizenship ?? [home.id])[0])!.countries?.[0] ?? '';
  const flagOf = (c: string) => { const code = countryFlag(c); return code && FLAGS[code] ? FLAGS[code] : ''; };
  return {
    profile: p.profile!,
    name: PROFILE_LABEL[p.profile!],
    country,
    nationality: p.citizenship ? country : null,
    code: COUNTRY_CODE3[first] ?? 'KAJ',
    flag: flagOf(first),
    number: `KAJ${s.totalRounds}-${String(p.seat + 1)}${String(s.rng % 1000).padStart(3, '0')}`,
    turns: s.totalRounds,
    players: s.players.length,
    date,
    areas: p.visitedAreas.length,
    continents: p.visitedContinents.length,
    points: finalScore(s, p),
    stamps: p.visitedAreas.map((id) => { const a = areaById.get(id)!; return { name: a.name, continent: a.continent, flag: flagOf(a.countries?.[0] ?? '') }; }),
  };
}

// The passport and the records open over the end popup (step 2.10); closing them leaves it as it was.
let overlay: HTMLElement | null = null;
function closeOverlay(): void {
  overlay?.remove();
  overlay = null;
}
function openOverlay(node: HTMLElement): void {
  closeOverlay();
  overlay = node;
  document.body.append(node);
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
      : ownsNoBusiness(me.profile) ? 'Nobody runs its Guided Tours yet. Kris Ann never owns a business.'
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

// Halfway and the last five turns (owner's request): one popup each per game. Rounds 16 and 26
// of 30; 26 and 46 of 50 (task M4); 51 and 96 of 100 (step 2.12 J5).
const milestones = (total: number) => [
  { key: 'milestone-half', round: total / 2 + 1, title: '🧭 Halfway there!', text: `Half of your journey is already behind you: ${total / 2} more turns to go. Think about where you still want to go!` },
  { key: 'milestone-last', round: total - 4, title: '⏳ The last five turns!', text: 'These are the last five turns of the journey. Make them count: new areas, wonders and the continents you still need!' },
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

// Moves into an area with fees or a visa test ask first: "entering costs a 2-point visa / 1-point tour fee".
function go(action: Action, visaSeen = false): void {
  const s = state!;
  const me = currentPlayer(s);
  // Owner (step 2.12 J6): a free quiz to a country with a visa test explains the visa after the quiz (a right answer),
  // so the quiz isn't taken for part of the visa test. A paid trip and a walk still explain it first.
  const quizThenVisa = action.type === 'quiz' && needsVisaTest(s, me, action.to);
  // Step 2.8 (owner): entering another player's country, the visa rule first (until "Don't show this again").
  if ((action.type === 'walk' || action.type === 'board' || action.type === 'quiz') && !visaSeen && !infoOff('visa') && !quizThenVisa
    && (needsVisaTest(s, me, action.to) || entryFees(s, me, me.area, action.to).some((f) => f.reason === 'visa'))) {
    visaInfo = action;
    popup = null;
    render();
    return;
  }
  visaInfo = null;
  if ((action.type === 'walk' || action.type === 'board' || action.type === 'quiz' || action.type === 'hitchhike')
    && (quizThenVisa ? entryFees(s, me, me.area, action.to).some((f) => f.reason !== 'visa')
      : entryFees(s, me, me.area, action.to).length > 0 || needsVisaTest(s, me, action.to))) {
    pendingFees = action;
    popup = null;
    render();
  } else {
    act(action);
  }
}

const plainActions = (actions: Action[]) => actions.filter((a) => a.type !== 'buyCitizenship');

function render(): void {
  if (!state) return renderStart();
  const s = state;
  const me = currentPlayer(s);
  const actions = legalActions(s, gameMap);
  // During a sale offer the buyer answers, on the seller's turn.
  const actor = s.offer ? s.players[s.offer.to] : me;
  const isRobot = s.phase !== 'finished' && actor.kind === 'robot';
  writeSave(s);
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
      ...people.map((p) => profileNote(p.profile!, people.length > 1 ? nameOf(p.seat) : ''))),
      // Step 2.8 (owner): the tapped profile's advantages, before it is confirmed.
      ...(pendingProfile && modal ? [modal.node] : []));
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
    // Audit 2.13: on the world view only; not while a continent's areas are shown (the side panel then had to scroll).
    if (s.phase === 'chooseStart' && !detailArea && zoom === null) {
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
  // Audit 2.13: a redraw (a tap on the map) no longer restarts the robot's wait: one timer per game state.
  if (isRobot && !modal && !hold) {
    if (robotFor === s) return;
    clearTimeout(robotTimer);
    robotFor = s;
    robotTimer = window.setTimeout(() => {
      robotFor = null;
      if (state !== s) return;
      // A robot buyer accepts an offer whenever it can pay (owner's choice, task 9b).
      const [action, next] = robotAction(s, gameMap, robotSeed, actor.level ?? 'normal');
      robotSeed = next;
      act(action);
    }, ROBOT_DELAY_MS);
  } else {
    clearTimeout(robotTimer);
    robotFor = null;
  }
}

// One small chip per player in the top bar; tapping it opens the full player card.
function renderChips(s: GameState): HTMLElement {
  const me = hold ? s.players[hold.seat] : currentPlayer(s);
  // Audit 2.13: with 3 or 4 players the chips are a little smaller, so they keep to one row where they can.
  return el('div', { className: s.players.length > 2 ? 'chips many' : 'chips' }, ...s.turnOrder.map((seat) => {
    const p = s.players[seat];
    const points = s.phase === 'finished' ? finalScore(s, p) : p.points;
    const chip = el('button', { className: 'chip' + (p === me && s.phase !== 'finished' ? ' active' : '') + (shownPlayer === seat ? ' open' : ''), title: 'Show details' },
      dot(seat), ` ${shortOf(seat)}`, p.kind === 'robot' ? el('span', { className: 'bot', textContent: ' 🤖' }) : '', ' ', el('b', { textContent: String(points) }),
      // Owner (step 2.12 J6): points + businesses = their total; the most-businesses bonus only in the final ranking.
      businessValue(s, seat) && s.phase !== 'finished' ? ` +🏢${businessValue(s, seat)}=${p.points + businessValue(s, seat)}` : '');
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
      ? `🛂 Citizen of ${citizenshipName(p.citizenship)}${p.bought ? ` and ${citizenshipName(p.bought)}` : ''}`
      : p.profile === 'nomad' ? '🛂 No citizenship (Digital Nomad)' : '' }),
    el('div', { className: 'small', textContent: `${plural(p.visitedContinents.length, 'continent')} · ${plural(p.visitedAreas.length, 'area')}` }),
    continentBar(p),
    el('div', { className: 'small', textContent: s.phase === 'play' ? nextCardText(s, p) : '' }),
    el('div', { className: 'small', textContent: s.businesses.filter((b) => b.owner === seat)
      .map((b) => `${BUSINESS_ICON[b.kind]} ${areaById.get(b.area)!.name}`).join(' · ') }));
  card.style.borderColor = colourOf(seat);
  return card;
}

// When the player's next event card comes: every 3rd turn begun in an area (every 5th in the
// 50- and 100-turn games); trip turns don't count (task 12); none in the last round.
function nextCardText(s: GameState, p: Player): string {
  if (s.card?.seat === p.seat && s.card.round === s.round && currentPlayer(s) === p) return '🔔 Event card this turn';
  const order = s.turnOrder.indexOf(p.seat);
  const started = order <= s.current; // this round's turn has begun (and is counted) or is over
  const every = cardEvery(s.totalRounds);
  const turns = landTurnsToCard(p, every) || every;
  const turnsLeft = s.totalRounds - 1 - s.round + (started ? 0 : 1); // turns that can still have a card
  if (turns > turnsLeft) return '🔔 No more event cards';
  return turns === 1 ? '🔔 Event card: next turn on land' : `🔔 Event card: in ${turns} turns on land`;
}

// "Continents 2/3" for the profiles with a continent bonus (rulebook section 14).
function continentBar(p: Player): HTMLElement | string {
  const n = p.visitedContinents.length;
  const bonus = p.profile ? CONTINENT_BONUS[p.profile] : undefined;
  if (!bonus) return '';
  const goal = bonus.continents;
  const bar = `Continents ${'▰'.repeat(Math.min(n, goal))}${'▱'.repeat(Math.max(0, goal - n))} ${Math.min(n, goal)}/${goal}`;
  return el('div', { className: 'small', textContent: n >= goal ? `${bar} ✅ +${bonus.points} earned` : `${bar} (+${bonus.points} at ${goal})` });
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
        // One total in points: travel points + points from businesses (at their price) + the most-businesses bonus.
        // Owner (step 2.12 J6): never the word "assets" on screen.
        const detail = scoreDetail(s, seat);
        return el('li', {}, dot(seat), ` ${nameOf(seat)}: ${plural(finalScore(s, p), 'point')} (${detail}), ${plural(p.visitedContinents.length, 'continent')}, ${plural(p.visitedAreas.length, 'area')}`);
      })),
      el('p', { className: 'small', textContent: TIE_RULE }),
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
        a.type === 'chooseProfile' ? iconButton(a.profile, () => { pendingProfile = a.profile; render(); }) : '')));
  } else if (s.phase === 'chooseStart') {
    box.append(el('h2', {}, who, ', choose your home country'),
      el('p', { className: 'small', textContent: zoom
        ? `Tap an area in ${zoom} to choose it as your home country.`
        : 'Tap a continent on the map. Each player starts on a different continent. Welcome bonus: Europe, Asia, Africa +3 · Americas +4 · Oceania +5.' }),
      zoom ? el('p', { className: 'small', textContent: `🏛️ Areas with this sign have a wonder: your first visit there gives +${plural(POINTS_WONDER, 'point')} more. Each wonder has Guided Tours that one player can buy for ${plural(BUSINESS_PRICE.tours, 'point')}; after that, every other player who visits pays the owner a ${TOUR_FEE}-point tour fee.` }) : '',
      me.profile === 'backpacker'
        ? el('p', { className: 'small', textContent: `🎒 Tip: from Europe, Asia or Africa you can walk to 3 continents (+${CONTINENT_BONUS.backpacker!.points} Backpacker bonus). Your free quiz works on every plane, ship, train and bus: a right answer is a free trip. In Mongolia, the bus gives you all of Russia's points (+5) or all of China's (+3) at once. In Mexico, try to hitchhike: if a car stops, all of the USA's or Canada's points (+5) at once.` })
        : '');
  } else if (s.visa) {
    renderVisaTest(box, s, who);
  } else if (s.quiz) {
    renderQuiz(box, s, who);
  } else if (s.challenge) {
    renderChallenge(box, s, who);
  } else if (me.loseTurn) {
    box.append(el('h2', {}, who, ', you lose this turn'),
      el('div', { className: 'row' }, button('⏸️ Lose this turn', () => act({ type: 'lostTurn' }))));
  } else if (me.travel) {
    // A trip turn: the plane, ship or train scene (owner-approved, task 14j; train: task 17), with who is travelling.
    const trip = me.travel;
    const to = areaById.get(trip.to)!.name;
    const plane = trip.kind === 'airport';
    const train = trip.kind === 'station';
    const bus = trip.kind === 'bus';
    const car = trip.kind === 'car';
    const hitch = car && me.profile === 'backpacker';
    const total = me.profile ? travelTurns(me.profile, trip.kind, trip.paid) : trip.turnsLeft;
    const step = trip.turnsLeft > 0
      ? ` · ${plane ? 'flight' : train || bus || car ? 'journey' : 'day'}\u00a0${total - trip.turnsLeft + 1}\u00a0of\u00a0${total}`
      : ` · waiting to land (${to} is taken)`;
    const challenge = actions.some((a) => a.type === 'travel' && a.challenge);
    const offer = plane
      ? `The seat-belt sign goes off. A fellow passenger leans over: "Long flight… fancy a geography challenge? Right +${CHALLENGE_POINTS}, wrong −${CHALLENGE_POINTS}."`
      : car
      ? `${hitch ? 'The driver turns down the radio' : 'At a roadside diner'}: "A geography challenge for the road? Right +${CHALLENGE_POINTS}, wrong −${CHALLENGE_POINTS}."`
      : bus
      ? `The bus rolls across the steppe. The passenger next to you pulls out a quiz book: "A geography challenge? Right +${CHALLENGE_POINTS}, wrong −${CHALLENGE_POINTS}."`
      : train
      ? `Clickety-clack through the night. In the dining car someone unfolds a map: "A geography challenge? Right +${CHALLENGE_POINTS}, wrong −${CHALLENGE_POINTS}."`
      : `Calm water, a sky full of stars. In the ship's lounge someone sets up a quiz table: "A geography challenge? Right +${CHALLENGE_POINTS}, wrong −${CHALLENGE_POINTS}."`;
    const play = button('🌍 Play the challenge', () => {
      // The boss answers, except on its challenge turn (step 2.5, engine.ts nomadAlert).
      if (me.profile === 'nomad' && nomadAlert(me) !== 'challenge') { nomadAtWork = true; render(); return; }
      act({ type: 'travel', challenge: true });
    });
    play.className = 'primary';
    box.classList.add('trip-turn');
    if (nomadAtWork && me.profile === 'nomad') {
      box.append(tripScene(trip.kind, hitch), el('div', { className: 'trip-text' },
        el('h2', {}, '📧 Ping! A message from your boss'),
        el('p', { textContent: `"Quizzes? QUIZZES?! You're supposed to be working! I'm paying you +${plural(POINTS_NOMAD_TRIP, 'point')} to work during trips! Laptop open, coffee in hand, back to work!" 😤☕💻` }),
        el('div', { className: 'row' }, button('💻 Back to work', () => { nomadAtWork = false; act({ type: 'travel', challenge: true }); }))));
      return box;
    }
    box.append(tripScene(trip.kind, hitch), el('div', { className: 'trip-text' },
      el('h2', {}, who, ` ${plane ? 'is flying' : train ? 'is on the train' : bus ? 'is on the bus' : hitch ? 'is hitchhiking' : car ? 'is driving' : 'is at sea'} to ${to}${step}`),
      el('p', { className: 'small', textContent: challenge
        ? `${offer} One question, ${CHALLENGE_SECONDS} seconds. You don't have to play.`
        : `A challenge needs at least ${plural(CHALLENGE_POINTS, 'point')}, so there is none this turn.` }),
      me.profile === 'nomad' ? el('p', { className: 'small', textContent: nomadAlert(me) === 'bonus' ? `🎁 Your boss's bonus: +${plural(POINTS_NOMAD_BONUS, 'point')} on this trip.` : `💻 +${POINTS_NOMAD_TRIP} for a trip to a new area (1 travel turn or more).` }) : '',
      el('div', { className: 'row' }, ...(challenge
        ? [play, button(me.profile === 'nomad' && nomadAlert(me) !== 'challenge' ? '💻 Keep working' : plane || train || bus || car ? '😴 No thanks' : '🌅 No thanks', () => act({ type: 'travel' }))]
        : [button('Continue the trip', () => act({ type: 'travel' }))]))));
  } else {
    const here = areaById.get(me.area!)!;
    if (pendingFees && (pendingFees.type === 'walk' || pendingFees.type === 'board' || pendingFees.type === 'quiz' || pendingFees.type === 'hitchhike')) {
      const a = pendingFees;
      // Owner (step 2.12 J6): before a free quiz to a visa-test country, only the tour fee; the visa comes after the quiz.
      const visaLater = a.type === 'quiz' && needsVisaTest(s, me, a.to);
      const fees = entryFees(s, me, me.area, a.to).filter((f) => !visaLater || f.reason !== 'visa');
      const where = areaById.get(a.to)!.name;
      const test = !visaLater && needsVisaTest(s, me, a.to);
      box.append(el('h2', {}, who, feeTotal(fees) > 0 ? `: entering ${where} costs ${plural(feeTotal(fees), 'point')}` : `: a visa test for ${where}`),
        test ? el('p', { className: 'note', textContent: `${visaTestIntro(s, me, { to: a.to, via: a.type === 'walk' ? 'walk' : 'trip' })} (${VISA_TEST_FACTS} facts to read, then 3 questions.)` }) : '',
        el('ul', {}, ...fees.map((f) => el('li', { textContent: f.reason === 'visa'
          ? `🛂 Visa: ${plural(f.amount, 'point')} to ${nameOf(f.to.seat)} (${where} is ${nameOf(f.to.seat)}'s citizenship)`
          : `🏛️ Tour fee: ${plural(f.amount, 'point')} to ${nameOf(f.to.seat)} (owner of the guided tours in ${where})` }))),
        feeTotal(fees) === 0 ? '' : el('p', { className: 'small', textContent: a.type === 'walk' ? `You pay when you enter${test ? ', after passing the test' : ''}.`
          : a.type === 'board' ? `You pay ${test ? 'after passing the test' : 'now'}, with the ticket. Nothing more to pay when you land.`
          : a.type === 'hitchhike' ? `You pay only if a car stops for you${test ? ' and you pass the test' : ''}.`
          : `You pay when you board (a right answer, or the ticket after the 3rd wrong one)${test ? ', after passing the test' : ''}.` }),
        el('div', { className: 'row' },
          button(test ? '🛂 Take the visa test' : a.type === 'walk' ? `Pay ${feeTotal(fees)} and enter` : 'Go anyway', () => act(a)),
          button('Cancel', () => { pendingFees = null; render(); })));
      return box;
    }
    // Title, then the action buttons, then the guide (owner's order, task 14 B2).
    box.append(el('h2', {}, who, `, you are in ${here.name}`));
    if (actions.some((a) => a.type === 'blocked' || a.type === 'goHome') && blockedByMoney(s, gameMap, me)) {
      const homeName = areaById.get(homeFor(s, gameMap, me))!.name;
      const left = GO_HOME_TURNS - 1 - me.broke;
      box.append(el('p', { className: 'note', textContent: left <= 0
        ? `🏠 Your money has run out: you go home to ${homeName}, free of any fees, and get +${GO_HOME_POINTS} to start again.`
        : `💸 Out of money! You can't pay to enter any area or to board. ${s.businesses.some((b) => b.owner === me.seat) ? 'Sell a business to another player (💰 below), or wait for luck.' : 'Wait for luck.'} ${left === 1 ? 'Next turn' : `In ${left} turns`}, if you still can't pay, you go home to ${homeName} (+${GO_HOME_POINTS} to start again).` }));
    } else if (me.points === 0 && actions.some((a) => a.type === 'sell')) {
      // Step 2.7 (owner): with 0 points and a business to sell, a reminder that selling brings points.
      const owned = s.businesses.filter((b) => b.owner === me.seat).length;
      box.append(el('p', { className: 'note', textContent: `💰 You have 0 points, but you own ${owned === 1 ? '1 business' : `${owned} businesses`}. You can sell one to another player (💰 below) to get points back.` }));
    }
    const waiting = waitingNote(s);
    if (waiting) box.append(el('p', { className: 'small', textContent: waiting }));
    const warning = lastTryWarning(s, plainActions(actions));
    if (warning) box.append(el('p', { className: 'note', textContent: warning }));
    const row = el('div', { className: 'row' });
    // Step 2.6: the Business's free 2nd citizenship, of the area it stands in.
    if (actions.some((a) => a.type === 'buyCitizenship')) {
      row.append(button(`🛂 Take citizenship of ${citizenshipName(citizenshipAreasOf(here.id))}…`, () => { citizenPopup = true; render(); }));
    }
    // Walking, planes, ships and buying are on the map (owner's choice, task 14 B1).
    for (const a of plainActions(actions)) {
      if (a.type === 'blocked') {
        row.append(button('⛔ No area you can enter — wait this turn', () => act(a)));
      } else if (a.type === 'goHome') {
        row.append(button(`🏠 Go home to ${areaById.get(homeFor(s, gameMap, me))!.name}`, () => act(a)));
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
      guideOff ? el('p', { className: 'small', textContent: 'Tap an area marked 🚶 to walk there. Tap the plane, ship, train, bus, car or monument on your area for travel and tours. Tap any area for its details.' }) : '',
      renderGuide(s, actions),
      renderBigCountries(me));
  }
  return box;
}

// Points this move would give, found by trying it on a copy of the state (fees not included).
// Audit 2.13: the area's own points. The copy has no visa test, no visa and no tour fee for the destination, and a trip
// lands at once (with the Nomad's trip point), so another player's country no longer shows its visa fee as a gain.
function arrivalGain(s: GameState, action: Action): number {
  if (action.type !== 'walk' && action.type !== 'board' && action.type !== 'quiz') return 0;
  const copy = structuredClone(s);
  const me = currentPlayer(copy);
  const to = action.to;
  for (const p of copy.players) {
    if (p.seat === me.seat) continue;
    if (p.citizenship?.includes(to)) p.citizenship = null;
    if (p.bought?.includes(to)) p.bought = null;
  }
  for (const b of copy.businesses) if (b.area === to && b.kind === 'tours') b.owner = null;
  copy.quiz = null;
  copy.visa = null;
  copy.challenge = null;
  copy.offer = null;
  me.loseTurn = false;
  const before = me.points;
  let extra = 0;
  let after: GameState;
  if (action.type === 'walk') {
    after = apply(copy, gameMap, { type: 'walk', to });
  } else {
    const paid = action.type === 'board';
    // The Nomad's trip point comes on the first of 2 travel turns; the copy lands after one.
    if (me.profile === 'nomad' && travelTurns('nomad', action.kind, paid) > 1 && !me.visitedAreas.includes(to)) extra = POINTS_NOMAD_TRIP;
    me.travel = { kind: action.kind, from: me.area!, to, turnsLeft: 1, paid };
    me.area = null;
    after = apply(copy, gameMap, { type: 'travel' });
  }
  // A surprise stays secret (owner, M5): never in the preview.
  const area = areaById.get(to)!;
  const secret = area.surprise && !me.visitedAreas.includes(to) ? area.surprise : 0;
  return after.players[me.seat].points - before + extra - secret;
}

function gainLabel(s: GameState, action: Action, to: Area): string {
  const gain = arrivalGain(s, action);
  if (gain > 0) return ` +${gain}`;
  const me = currentPlayer(s);
  return to.bigCountry && !me.visitedAreas.includes(to.id) ? ' 🧩' : '';
}

// What a walk badge means, in words (owner, M5): shown on hover, and as the legend under the map.
const WALK_LEGEND = '🚶 walk · +1 points · +0 visited · 🧩 big-country part · 💰 fee';
function walkHint(text: string, name: string): string {
  const parts = [`Walk to ${name} (uses your turn).`];
  const gain = /\+(\d+)/.exec(text);
  parts.push(gain && gain[1] !== '0' ? `You get +${gain[1]}.` : text.includes('🧩') ? 'A part of a big country: points when you have visited every part.' : 'Already visited: no points.');
  const fee = /💰−(\d+)/.exec(text);
  if (fee) parts.push(`You pay ${fee[1]} on arrival (visa or tour fee).`);
  return parts.join(' ');
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

// The visa test (step 2.6, the screens of the old citizenship test): read the facts, then one question
// at a time, in the same turn. Each question waits for "Start", so its clock never runs while the last
// answer is on show.
function renderVisaTest(box: HTMLElement, s: GameState, who: HTMLElement): void {
  const me = currentPlayer(s);
  const test = s.visa!;
  const n = test.answers.length;
  const key = `${s.round}-${me.seat}-${test.to}-${n}`;
  if (examReady === key || me.kind !== 'human') {
    renderVisaQuestion(box, s, who);
    return;
  }
  const where = areaById.get(test.to)!.name;
  const ready = () => { examReady = key; render(); };
  if (n === 0) {
    // Audit 2.13: a short intro (the rule was told just before), and "I'm ready" always on screen at the bottom.
    const owner = visaOwner(s, me, me.area, test.to);
    box.append(el('h2', {}, who, `: visa test for ${where}`),
      el('p', { className: 'small', textContent: `🛂 ${where} is ${owner ? `${nameOf(owner.seat)}'s` : 'another player\'s'} citizenship. Read your notes: the questions are about them. Take your time.` }),
      studyNotebook(key, where, test.study, test.questions.length),
      el('div', { className: 'row stick ready' }, button('📖 I\'m ready', ready)));
  } else {
    box.append(el('h2', {}, who, `: question ${n + 1} of ${test.questions.length}`),
      el('p', { textContent: `Ready for the next question? The ${EXAM_SECONDS}-second clock starts when you tap Start.` }),
      el('div', { className: 'row' }, button('▶ Start', ready)));
  }
}

// The notes to read before the visa test, as a notebook page (step 2.12c, owner-approved design): lined paper,
// spiral rings, a handwritten title with a "VISA TEST" stamp, numbered notes and the test's rules at the bottom.
// The page opens once per test: when the screen is drawn again (another popup closed), it stays still.
let notebookOpened = '';
function studyNotebook(key: string, where: string, lines: string[], questions: number): HTMLElement {
  const rings = el('div', { className: 'nb-rings' });
  rings.setAttribute('aria-hidden', 'true');
  const still = notebookOpened === key;
  notebookOpened = key;
  return el('div', { className: still ? 'notebook still' : 'notebook' }, rings,
    el('div', { className: 'nb-head' },
      el('div', { className: 'nb-title', textContent: `Study notes for your visa: ${where}` }),
      el('div', { className: 'nb-stamp', textContent: 'VISA TEST' })),
    el('ol', { className: 'nb-notes' }, ...lines.map((line) => el('li', { textContent: line }))),
    el('div', { className: 'nb-foot', textContent: `${questions} questions · ${EXAM_SECONDS} seconds each · ${VISA_TEST_PASS} right to pass` }));
}

// What the visa test decides, in one sentence (also used in the warning before the move).
function visaTestIntro(s: GameState, me: GameState['players'][number], move: { to: string; via?: string }): string {
  const owner = visaOwner(s, me, me.area, move.to);
  const country = owner ? citizenshipName(citizenshipOf(owner, move.to)!) : areaById.get(move.to)!.name;
  const enter = move.via === undefined || move.via === 'walk' ? 'enter' : 'travel';
  const pay = me.profile === 'business'
    ? 'you enter with no visa to pay (💼 Business Traveler)'
    : `you pay the ${VISA_PRICE}-point visa to ${owner ? nameOf(owner.seat) : 'the citizen'} and ${enter}`;
  return `🛂 ${country} is ${owner ? nameOf(owner.seat) : 'another player'}'s citizenship: a visa test first. ${VISA_TEST_PASS} right answers or more: ${pay}. Fewer: nothing is paid, you don't ${enter}, and your turn ends.`;
}

// One visa test question, 15 seconds. Time out = wrong answer.
function renderVisaQuestion(box: HTMLElement, s: GameState, who: HTMLElement): void {
  const test = s.visa!;
  const n = test.answers.length;
  const q = test.questions[n];
  const left = EXAM_SECONDS;
  const clock = el('div', { className: 'clock' }, el('span', { className: 'secs', textContent: `⏱️ ${left} s` }), el('div', { className: 'timebar' }, el('span')));
  box.append(el('h2', {}, who, `: visa test for ${areaById.get(test.to)!.name} — question ${n + 1} of ${test.questions.length}`),
    el('p', { textContent: q.text }),
    el('div', { className: 'row' }, ...q.options.map((o, i) => button(o, () => act({ type: 'visaAnswer', choice: i as 0 | 1 })))),
    clock);
  startCountdown(`visaAnswer-${s.round}-${currentPlayer(s).seat}-${q.text}-${n}`, left, clock, () => act({ type: 'visaAnswer', choice: (1 - q.correct) as 0 | 1 }));
}

function renderBigCountries(me: GameState['players'][number]): HTMLElement {
  const names = [...new Set(gameMap.areas.flatMap((a) => (a.bigCountry ? [a.bigCountry] : [])))];
  const started = names.flatMap((c) => {
    const parts = gameMap.areas.filter((a) => a.bigCountry === c);
    const done = parts.filter((a) => me.visitedAreas.includes(a.id)).length;
    // ✅ once its points are had (all parts, or by bus or car: then each other part still +1).
    return done > 0 ? [`${c} ${done}/${parts.length}${me.bigCountries.includes(c) ? ' ✅' : ''}`] : [];
  });
  return el('p', { className: 'small', textContent: started.length ? `🧩 Big countries: ${started.join(' · ')}` : '' });
}

// The timed a/b question box (airline quiz, also used by the guide): the question, the answer
// buttons, the 15-second clock and a note. Time out = the wrong answer.
function timedQuestion(title: (Node | string)[], text: string, options: string[], correct: number, onAnswer: (i: number) => void, seconds: number, key: string, note: string, flag?: string): HTMLElement[] {
  const clock = el('div', { className: 'clock' }, el('span', { className: 'secs', textContent: `⏱️ ${seconds} s` }), el('div', { className: 'timebar' }, el('span')));
  const nodes = [el('h2', {}, ...title),
    ...(flag && FLAGS[flag] ? [el('img', { className: 'flag', src: FLAGS[flag], alt: 'A flag' })] : []),
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
    `Wrong answers here so far: ${currentPlayer(s).quizWrong}. A wrong answer uses this turn.${forcedPayNote(s, kind, to)}`, question.flag));
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
    ? ` After ${QUIZ_TRIES} wrong answers here you go home (+${GO_HOME_POINTS} to start again).`
    : ` After ${QUIZ_TRIES} wrong answers here you must pay the ${price}-point ticket and go${to ? ` (the ticket goes ${to.slice(2, -1)})` : ''}${needsVisaTest(s, me, dest) ? ', after the visa test' : ''}; if you can't pay, you go home (+${GO_HOME_POINTS} to start again).`;
}

// Neighbours and destinations closed because someone is travelling there (owner's rule, task 13).
function waitingNote(s: GameState): string {
  const me = currentPlayer(s);
  const near = new Set([
    ...areaById.get(me.area!)!.neighbours,
    ...ROUTE_KINDS.flatMap((kind) => destinations(gameMap, me.area!, kind, me.profile!)),
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
    ? `⚠️ Last try here for ${name}: Attention! If wrong, you pay the ${ticketPrice(me.profile!, kind)}-point ticket with your points and travel${needsVisaTest(s, me, dest) ? ' (first the visa test)' : ''}.`
    : `⚠️ Last try here for ${name}: Attention! If wrong, you go home to ${areaById.get(homeFor(s, gameMap, me))!.name} (+${GO_HOME_POINTS} to start again).`;
}

function lastTryWarning(s: GameState, actions: Action[]): string {
  if (currentPlayer(s).quizWrong < QUIZ_TRIES - 1) return '';
  return actions.flatMap((a) => (a.type === 'quiz' ? [lastTryText(s, a.kind, a.to)] : [])).join(' ');
}

// Step 2.7 (owner): a paid ticket is fast, the free quiz is slow. "arrive right away" or "N travel turns".
function turnsWord(n: number): string {
  return n === 0 ? 'you arrive right away' : plural(n, 'travel turn');
}


// ---------- popups, answers and the guide (task 14 B2) ----------

// One countdown per question (a redraw doesn't restart it). Time out = wrong answer.
function startCountdown(key: string, seconds: number, clock: HTMLElement, onTimeout: () => void): void {
  if (countdown?.key !== key) {
    // Audit 2.13: the same question after closing and reopening the app keeps its clock (owner, audit U6: the clock
    // runs on while the player is away).
    // The guide's practice questions are not kept.
    const kept = !key.startsWith('guide-');
    countdown = { key, deadline: (kept ? storedClock(key) : null) ?? Date.now() + seconds * 1000 };
    if (kept) storeClock(key, countdown.deadline);
    startTimer();
  }
  const { deadline } = countdown;
  const secs = clock.querySelector<HTMLElement>('.secs')!;
  const bar = clock.querySelector<HTMLElement>('.timebar span')!;
  // Step 2.12 J6: one clock at a time. A question drawn twice in one redraw (in the popup and, during the
  // 2-second pause after a closed popup, in the side panel) started two clocks and only one was stopped;
  // the other then gave its time-out answer 4 times a second for the rest of the game.
  clearInterval(quizTimer);
  let id = 0;
  let done = false;
  const tick = () => {
    if (done) return;
    const left = Math.max(0, deadline - Date.now());
    secs.textContent = `⏱️ ${Math.ceil(left / 1000)} s`;
    bar.style.width = `${(left / (seconds * 1000)) * 100}%`;
    clock.classList.toggle('hurry', left <= 5000);
    if (left <= 0) {
      done = true;
      clearInterval(id);
      clearInterval(quizTimer);
      stopTimer();
      onTimeout();
    }
  };
  tick();
  if (!done) id = quizTimer = window.setInterval(tick, 250);
}

// The study line behind a quiz or test question (every fact has one).
function factFor(area: string, question: string): string {
  return [...(gameMap.facts?.[area] ?? []), ...(gameMap.examFacts?.[area] ?? [])].find((f) => f.question === question)?.text ?? '';
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
// After the last visa test answer: passed (the move went ahead) or not (nothing paid, no entry).
function visaVerdict(after: GameState): string {
  const v = after.visaTested;
  if (!v) return '';
  const where = areaById.get(v.to)!.name;
  const n = v.test.questions.length;
  if (!v.passed) return `😞 ${v.right} of ${n} right (${VISA_TEST_PASS} needed): no visa. Nothing is paid, you don't go to ${where}, and your turn ends.`;
  return v.test.via === 'walk'
    ? `🎉 ${v.right} of ${n} right: visa granted! You enter ${where}.`
    : `🎉 ${v.right} of ${n} right: visa granted! You ${TRAVEL_WORDS[v.test.kind!].verb} to ${where}.`;
}

// A wrong quiz answer: the turn is lost, or (owner, step 2.12 J6) after the 3rd one, clearly what happens now: the ticket
// is bought and the trip goes on (first the visa test, if the country needs one), or the player can't pay and goes home.
function wrongQuizLine(before: GameState, after: GameState, kind: RouteKind, to: string): string {
  const me = currentPlayer(before);
  const now = after.players[me.seat];
  const where = areaById.get(to)!.name;
  const third = me.quizWrong + 1 >= QUIZ_TRIES;
  const price = me.profile ? ticketPrice(me.profile, kind) : null;
  if (!third) return `You lose this turn. Wrong answers here: ${me.quizWrong + 1} of ${QUIZ_TRIES}.`;
  if (after.visa) return `That was your ${QUIZ_TRIES}rd wrong answer here, so now you buy the ticket (${plural(price ?? 0, 'point')}). But first, the visa test for ${where}.`;
  if (now.travel || (now.area === to && me.area !== to)) return `That was your ${QUIZ_TRIES}rd wrong answer here, so you buy the ticket (${plural(price ?? 0, 'point')}) and ${TRAVEL_WORDS[kind].verb} to ${where}.`;
  // Audit 2.13: the Backpacker never buys a ticket; the others don't have enough points for it.
  const why = price === null ? `the ${PROFILE_LABEL[me.profile!]} travels only with the quiz` : `you don't have the ${plural(price, 'point')} for the ticket`;
  return `That was your ${QUIZ_TRIES}rd wrong answer here, and ${why}: you go home to ${areaById.get(now.area ?? me.home ?? to)!.name} (+${plural(GO_HOME_POINTS, 'point')} to start again).`;
}

function answerResult(before: GameState, after: GameState, action: Action): typeof answered {
  const me = currentPlayer(before);
  if (action.type === 'answer' && before.quiz) {
    const { question, to, kind } = before.quiz;
    const ok = action.choice === question.correct;
    const turns = me.profile ? travelTurns(me.profile, kind, false) : 0;
    return {
      ok,
      title: ok ? '✅ Right!' : '❌ Wrong answer',
      lines: [
        `${question.text} The answer is: ${question.options[question.correct]}.`,
        factFor(to, question.text),
        ok && after.visa
          ? `${VEHICLE[kind]} Free ticket! But first, the visa test for ${areaById.get(to)!.name}.`
          : ok
          ? `${VEHICLE[kind]} Free ticket! You ${TRAVEL_WORDS[kind].verb} to ${areaById.get(to)!.name}${turns ? `: ${plural(turns, 'travel turn')}` : ' right away'}.`
          : wrongQuizLine(before, after, kind, to),
      ].filter((t) => t !== ''),
    };
  }
  if (action.type === 'visaAnswer' && before.visa) {
    const n = before.visa.answers.length;
    const q = before.visa.questions[n];
    const ok = action.choice === q.correct;
    return {
      ok,
      title: `${ok ? '✅ Right!' : '❌ Wrong answer'} (question ${n + 1} of ${before.visa.questions.length})`,
      lines: [`${q.text} The answer is: ${q.options[q.correct]}.`, factFor(before.visa.to, q.text), after.visa ? '' : visaVerdict(after)].filter((t) => t !== ''),
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
    if (a.bigCountry && before.bigCountries.includes(a.bigCountry)) {
      lines[0] = `+${POINTS_NEW_AREA} for a new part of ${a.bigCountry} (its big bonus came by bus or car).`;
    } else if (a.bigCountry) {
      const parts = gameMap.areas.filter((x) => x.bigCountry === a.bigCountry);
      const done = parts.filter((x) => after.visitedAreas.includes(x.id)).length;
      lines[0] = done === parts.length
        ? `🧩 ${a.bigCountry} is complete: all ${parts.length} parts visited!`
        : `🧩 ${a.bigCountry}: ${done} of ${parts.length} parts visited. Its points come when you have visited every part.`;
    }
  }
  // The bus and the car (owner's rule, M5, task 19): the whole country's points at once.
  const by = before.travel?.kind;
  const country = by === 'bus' || by === 'car' ? a.bigCountry : undefined;
  if (country && !before.bigCountries.includes(country) && after.bigCountries.includes(country)) {
    const parts = gameMap.areas.filter((x) => x.bigCountry === country);
    const how = by === 'bus' ? '🚌 The bus' : before.profile === 'backpacker' ? '👍 Hitchhiking' : '🚗 The car';
    lines[0] = `${how} gives all of ${country}'s points at once: +${bigCountryReward(before.profile, parts.length)}! Its other parts still give +${POINTS_NEW_AREA} each when you visit them.`;
  }
  // A whole continent (owner, M5); the surprise has its own popup.
  for (const c of after.fullContinents.filter((x) => !before.fullContinents.includes(x))) {
    lines.push(`🌍 You visited every area of ${c}: +${continentReward(gameMap, c)}!`);
  }
  if (after.points > before.points && a.surprise && !before.visitedAreas.includes(id)) lines.push(`🎁 SURPRISE! +${a.surprise}`);
  const delta = after.points - before.points;
  lines.push(`In all: ${delta >= 0 ? '+' : '−'}${plural(Math.abs(delta), 'point')} (fees included). You have ${plural(after.points, 'point')}.`);
  return { area: id, lines: [`📍 You arrived in ${a.name}.`, ...lines] };
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
      : `${BUSINESS_ICON[a.business]} You can buy the ${BUSINESS_NAME[a.business]} here for ${price}: ${BUSINESS_EARNS[a.business]}. Tap the ${a.business === 'airline' ? 'plane' : a.business === 'train' ? 'train' : a.business === 'bus' ? 'bus' : a.business === 'car' ? (me.profile === 'backpacker' ? 'hitchhiker' : 'car') : 'ship'}.`);
  }

  const walks = plainActions(actions).flatMap((a) => (a.type === 'walk' ? [a] : []));
  if (walks.length > 0) {
    const list = walks.map((w) => {
      const g = arrivalGain(s, w);
      const fee = feeTotal(entryFees(s, me, me.area, w.to));
      return `${areaById.get(w.to)!.name} (${g > 0 ? `+${g}` : me.visitedAreas.includes(w.to) ? 'been there, +0' : '+0'}${fee ? `, fee ${fee}` : ''})`;
    });
    lines.push(`🚶 From ${here.name} you can walk to: ${list.join(', ')}. Tap an area marked 🚶.`);
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
    if (!canRide(me.profile!, kind)) {
      lines.push(`${VEHICLE[kind]} There is ${placeName} here, but ${NO_RIDE[kind]![0].toLowerCase()}${NO_RIDE[kind]!.slice(1)}. You may still buy its ticket booth.`);
      continue;
    }
    const to = destinations(gameMap, here.id, kind, me.profile!).map((t) => areaById.get(t)!.name);
    const price = ticketPrice(me.profile!, kind);
    const turns = travelTurns(me.profile!, kind, true);
    const slow = travelTurns(me.profile!, kind, false);
    if (kind === 'car') {
      lines.push(price === null
        ? `👍 Cars drive from here to ${to.join(' or ')}. Want to try to hitchhike? If a car stops, you ride for free and get all of the USA's or Canada's points (+${bigCountryReward(me.profile, 3)}) at once; its other parts still give +1 each. If none stops, walk on. Tap the hitchhiker.`
        : `🚗 There is a car rental here: rent a car to ${to.join(' or ')} for ${plural(price, 'point')} (no quiz) and get all of the USA's or Canada's points (+${bigCountryReward(me.profile, 3)}) at once; its other parts still give +1 each. ${plural(turns, 'travel turn')}. Tap the car.`);
      continue;
    }
    lines.push(`${VEHICLE[kind]} There is ${placeName} here: ${words.verb} to ${to.join(' or ')}. ${
      price === null ? `Backpacker: only with the free quiz, ${turnsWord(slow)}.` : `Ticket ${plural(price, 'point')}: ${turnsWord(turns)}. Or the free quiz: slower, ${turnsWord(slow)}.`}${
      kind === 'bus' ? ` The bus gives the whole country's points at once: Russia +${bigCountryReward(me.profile, 3)} or China +${bigCountryReward(me.profile, 2)}; its other parts still give +1 each when you visit them.` : ''} Tap the ${words.vehicle}.`);
  }
  if (actions.some((a) => a.type === 'buyCitizenship')) {
    lines.push(`🛂 Business Traveler: you can take a 2nd citizenship here, for free and only once (the button above). Then the other players take a visa test and pay you ${plural(VISA_PRICE, 'point')} each time they enter (Luxury pays without a test).`);
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
  if (hitched) {
    const h = hitched;
    const where = areaById.get(h.to)!.name;
    return { turn: false, node: wrap(el('div', { className: 'trip-turn' }, hitchScene(h.stopped), el('div', { className: 'trip-text' },
      el('h2', { textContent: h.stopped ? '👍 A car stops!' : '👍 No luck this time' }),
      el('p', { textContent: h.stopped
        ? `You raise your thumb, and a car pulls over. The driver is going to ${where} and has a free seat: you ride for free, ${plural(travelTurns('backpacker', 'car', false), 'travel turn')}.`
        : 'You raise your thumb… the cars rush past, and none stops. If you can, walk on to another area this turn.' }),
      ok(() => { hitched = null; render(); }))), 'trip'), sound: h.stopped ? 'car' : 'wrong', soundKey: h };
  }
  if (answered) {
    const r = answered;
    return { turn: false, node: wrap(el('div', {},
      el('h2', { textContent: r.title }),
      ...r.lines.map((t) => el('p', { textContent: t })),
      ok(() => { answered = null; writeAnswered(null, null); render(); })), r.ok ? 'right' : 'wrong'), sound: r.ok ? 'right' : 'wrong', soundKey: r };
  }
  // Owner (step 2.12 J6): the passport of a person who just chose the home country; robots wait while it is open.
  // Audit 2.13: right after "Start in …", before any turn popup (with 2 people it came after the other person's).
  if (startPassport !== null && s.players[startPassport]?.citizenship) {
    const p = s.players[startPassport];
    const country = citizenshipName(p.citizenship!);
    const node = passportBook({ ...passportData(s, p, new Date()), stamps: [] }, () => { startPassport = null; render(); }, {
      title: '🎉 Congratulations!',
      text: ['You are a citizen of ', el('strong', { textContent: country }), ', and all other players need a visa to enter your home country.',
        // Owner (step 2.12 J6): the Business Traveler only; no passport is shown for the 2nd citizenship.
        ...(p.profile === 'business' ? [' You can have a second citizenship in another country of your choice.'] : [])],
      button: "✔ Let's go",
    });
    return { turn: false, node, sound: 'milestone', soundKey: `passport-${startPassport}` };
  }
  // The end of a person's turn: what it gave, then "End turn" (the walk is shown first).
  if (hold) {
    const h = hold;
    if (!h.ready) return null;
    const p = s.players[h.seat];
    // Audit 2.13: the person's own gold popups (whole continent, home again, surprise) come now, before the robots move.
    const end = () => { hold = null; news = []; newsNow = celebrations.length > 0 || income.length > 0; render(); };
    const arrived = h.lines.length > 0 ? h.lines[0].replace('📍 You arrived in ', '').replace(/\.$/, '') : '';
    return { turn: false, node: wrap(el('div', {},
      el('h2', {}, dot(h.seat), arrived ? ` You arrived in ${arrived}!` : ` ${nameOf(h.seat)}, your turn is over`),
      // Owner (2026-11-25): the countries of the area, with a flag and a capital only when the data has them.
      ...(arrived && h.area ? countryRows(areaById.get(h.area)!) : []),
      ...h.lines.slice(1).map((t) => el('p', { textContent: t })),
      news.length ? el('ul', {}, ...news.map((t) => el('li', { textContent: t }))) : '',
      h.lines.length ? '' : el('p', { className: 'small', textContent: `You have ${plural(p.points, 'point')}.` }),
      ok(end, '✔ End turn'))) };
  }
  // Money for people: a gold popup per person (never for a robot).
  if (celebrations.length > 0 && (newsNow || !isRobot || s.phase === 'finished')) {
    const r = celebrations[0];
    const who = nameOf(r.seat);
    const area = r.area ? areaById.get(r.area)! : null;
    const title = r.kind === 'surprise' ? '🎁 SURPRISE!' : r.kind === 'home' ? '🏠 Home again!' : `🌍 All of ${r.continent}!`;
    const text = r.kind === 'surprise'
      ? `Thank you for visiting ${area!.name}, ${who}! ${area!.name} rewards you with +${plural(r.points, 'point')}. ${SURPRISE_FACT[r.area!] ?? ''}`
      : r.kind === 'home' ? `${who}, you are back in ${area!.name}: +${plural(r.points, 'point')} to start your trip again.`
      : `${who}, you visited every area of ${r.continent}: +${plural(r.points, 'point')}!`;
    return { turn: false, node: wrap(el('div', { className: 'income' },
      el('div', { className: 'coins', textContent: r.kind === 'surprise' ? '🎁' : r.kind === 'home' ? '🏠' : '🌍' }),
      el('h2', { className: 'big-title', textContent: title }),
      el('p', { textContent: text }),
      ok(() => { celebrations.shift(); if (news.length === 0 && income.length === 0 && celebrations.length === 0) newsNow = false; render(); }, 'Wonderful!')), 'gold'), sound: 'milestone', soundKey: r };
  }
  if (income.length > 0 && (newsNow || !isRobot || s.phase === 'finished')) {
    const seats = [...new Set(income.map((i) => i.seat))];
    return { turn: false, node: wrap(el('div', { className: 'income' },
      el('div', { className: 'coins', textContent: '💰' }),
      ...seats.map((seat) => el('div', {},
        el('h2', { className: 'big-title', textContent: `Great news, ${nameOf(seat)}!` }),
        el('ul', {}, ...income.filter((i) => i.seat === seat).map((i) => el('li', { textContent: i.text }))))),
      ok(() => { income = []; if (news.length === 0) newsNow = false; render(); }, 'Wonderful!')), 'gold'), sound: 'coins', soundKey: income };
  }
  // Owner (M5): "Don't show again" turns this popup off on this device (back on in the setup).
  if (news.length > 0 && newsOff) { news = []; newsNow = false; }
  if (news.length > 0 && (newsNow || !isRobot || s.phase === 'finished')) {
    const hide = el('input', { type: 'checkbox' });
    return { turn: false, node: wrap(el('div', {},
      el('h2', { textContent: '📣 What happened' }),
      el('ul', {}, ...news.map((t) => el('li', { textContent: t }))),
      el('label', { className: 'small' }, hide, ' Don\'t show "What happened" again'),
      ok(() => { if (hide.checked) setNewsOff(true); news = []; newsNow = false; render(); }))) };
  }
  // Step 2.8 (owner): a tapped profile shows its advantages first; the person plays it or chooses another.
  if (s.phase === 'chooseProfile' && pendingProfile && !isRobot) {
    const prof = pendingProfile;
    const pick = actions.find((a) => a.type === 'chooseProfile' && a.profile === prof);
    if (!pick) pendingProfile = null;
    else {
      const yes = button(`✔ Play as ${PROFILE_LABEL[prof]}`, () => { pendingProfile = null; act(pick); });
      yes.className = 'primary';
      return { turn: false, node: wrap(el('div', { className: 'handover' },
        el('div', { className: 'handover-icon' }, iconEl(prof)),
        el('h2', { className: 'big-title', textContent: PROFILE_LABEL[prof] }),
        profileNote(prof, GOOD_ONLY),
        el('div', { className: 'row' }, yes, button('↩ Choose another', () => { pendingProfile = null; render(); })))) };
    }
  }
  // A person's turn begins (owner's request, task 14i): who plays now. Step 2.8 (owner): with the player's progress
  // towards every bonus (continents, big countries, wonders; the Backpacker's continents, the Business's citizenships).
  const turnKey = `turn-${s.round}-${me.seat}`;
  if (s.phase === 'play' && me.kind === 'human' && !isRobot && !seenCards.has(turnKey)) {
    const where = me.area ? areaById.get(me.area)!.name : me.travel ? `on the way to ${areaById.get(me.travel.to)!.name}` : '';
    const before = lastChips.get(me.seat);
    const now = new Map<string, number>();
    const chip = (key: string, text: string, n: number, total: number) => {
      now.set(key, n);
      const pct = Math.round((100 * n) / total);
      const c = el('div', { className: `turn-chip${before && n > (before.get(key) ?? 0) ? ' glow' : ''}`, textContent: text });
      c.style.background = `linear-gradient(90deg, var(--chip-fill) ${pct}%, var(--chip-empty) ${pct}%)`;
      return c;
    };
    const visited = new Set(me.visitedAreas);
    const count = (ids: Area[]) => ids.filter((a) => visited.has(a.id)).length;
    const shortName = (c: string) => c.replace('North ', 'N. ').replace('South ', 'S. ');
    const continentsList = continents.map((c) => {
      const all = gameMap.areas.filter((a) => a.continent === c);
      return chip(`c-${c}`, `${shortName(c)} ${count(all)}/${all.length} · all +${continentReward(gameMap, c)}`, count(all), all.length);
    });
    const ORDER = ['United States', 'Canada', 'Russia', 'China', 'Brazil', 'Australia'];
    const bigNames = [...new Set(gameMap.areas.flatMap((a) => (a.bigCountry ? [a.bigCountry] : [])))]
      .sort((x, y) => (ORDER.indexOf(x) + 99) % 99 - (ORDER.indexOf(y) + 99) % 99);
    const bigList = bigNames.map((b) => {
      const all = gameMap.areas.filter((a) => a.bigCountry === b);
      return chip(`b-${b}`, `${b === 'United States' ? 'USA' : b} ${count(all)}/${all.length} · all +${bigCountryReward(me.profile, all.length)}`, count(all), all.length);
    });
    const wonders = gameMap.areas.filter((a) => a.wonder);
    const last: HTMLElement[] = [chip('w', `🏛️ Wonders ${count(wonders)}/${wonders.length} · each +${POINTS_WONDER} more`, count(wonders), wonders.length)];
    const bp = CONTINENT_BONUS.backpacker!;
    if (me.profile === 'backpacker') {
      const n = new Set(me.visitedAreas.map((id) => areaById.get(id)!.continent)).size;
      last.push(chip('bp', `🎒 Bonus ${Math.min(n, bp.continents)}/${bp.continents} continents +${bp.points}`, Math.min(n, bp.continents), bp.continents));
    }
    if (me.profile === 'business') {
      const n = (me.citizenship?.length ? 1 : 0) + (me.bought?.length ? 1 : 0);
      last.push(chip('cz', `🛂 Citizenship ${n}/2`, n, 2));
    }
    const row = (title: string, items: HTMLElement[]) => el('div', { className: 'turn-goals' }, el('div', { className: 'turn-goals-title', textContent: title }), el('div', { className: 'turn-grid' }, ...items));
    return { turn: false, node: wrap(el('div', { className: 'handover' },
      el('div', { className: 'handover-icon' }, me.profile ? iconEl(me.profile) : dot(me.seat)),
      el('h2', { className: 'big-title', textContent: `${nameOf(me.seat)}, it's your turn!` }),
      el('p', { textContent: `Round ${s.round} of ${s.totalRounds}${where ? ` · 📍 ${where}` : ''} · ${plural(me.points, 'point')}` }),
      row('🌍 Whole continents', continentsList),
      row('🧩 Big countries', bigList),
      el('div', { className: 'turn-last' }, ...last),
      ok(() => { seenCards.add(turnKey); lastChips.set(me.seat, now); render(); }, "▶ Let's go"))), sound: 'tap', soundKey: turnKey };
  }
  // A person's first turn on a continent (owner, M5): the whole-continent reward to aim for.
  const here2 = me.area ? areaById.get(me.area)! : null;
  const contKey = here2 ? `continent-${me.seat}-${here2.continent}` : '';
  if (s.phase === 'play' && me.kind === 'human' && !isRobot && here2 && !seenCards.has(contKey) && !me.fullContinents.includes(here2.continent)) {
    const c = here2.continent;
    const total = gameMap.areas.filter((a) => a.continent === c).length;
    const seen = gameMap.areas.filter((a) => a.continent === c && me.visitedAreas.includes(a.id)).length;
    return { turn: false, node: wrap(el('div', { className: 'milestone' },
      el('h2', { className: 'big-title', textContent: `🌍 Welcome to ${c}!` }),
      el('p', {}, 'Visit ', el('strong', { textContent: `all ${total} areas of ${c}` }), ' for a ', el('strong', { textContent: `+${continentReward(gameMap, c)} reward` }), `. You have visited ${seen} so far.`),
      ok(() => { seenCards.add(contKey); render(); }, "Let's go!")), 'gold'), sound: 'milestone', soundKey: contKey };
  }
  // Rule notices (owner, step 2.8): short, only information, "OK, I understand" and "Don't show this again".
  const info = (kind: InfoKind, title: string, lines: string[], done: () => void) => {
    const hide = el('input', { type: 'checkbox' });
    return { turn: false, node: wrap(el('div', {},
      el('h2', { textContent: title }),
      el('div', { className: 'note' }, ...lines.map((t) => el('div', { textContent: t }))),
      el('label', { className: 'small' }, hide, ' Don\'t show this again'),
      ok(() => { if (hide.checked) setInfoOff(kind); done(); }, 'OK, I understand'))) };
  };
  if (visaInfo && me.kind === 'human' && !isRobot && (visaInfo.type === 'walk' || visaInfo.type === 'board' || visaInfo.type === 'quiz')) {
    const a = visaInfo;
    const visa = entryFees(s, me, me.area, a.to).find((f) => f.reason === 'visa');
    const to = visa ? ` to ${nameOf(visa.to.seat)}` : '';
    const lines = me.profile === 'luxury'
      ? [`You will pay ${plural(VISA_PRICE, 'point')}${to}.`, 'Luxury travellers take no visa test.']
      : me.profile === 'business'
        ? ['Business travellers pay nothing, but take the visa test.', `Answer ${VISA_TEST_PASS} of 3 questions right and you get the visa; otherwise no entry, and this turn is used.`]
        : [`You will pay ${plural(VISA_PRICE, 'point')}${to}, and take a visa test.`, `Answer ${VISA_TEST_PASS} of 3 questions right and you get the visa; otherwise no entry, and this turn is used (nothing paid).`];
    return info('visa', '🛂 You need a visa!', lines, () => { visaInfo = null; go(a, true); });
  }
  // Owner (step 2.12 J6): after a free quiz (or the ticket forced after the 3rd wrong answer), the visa rule comes now,
  // before the notebook (until "Don't show this again").
  const visaKey = s.visa ? `visanote-${s.round}-${me.seat}-${s.visa.to}` : '';
  if (s.phase === 'play' && s.visa && (s.visa.via === 'quiz' || s.visa.via === 'forced') && s.visa.answers.length === 0
    && me.kind === 'human' && !isRobot && !infoOff('visa') && !seenCards.has(visaKey)) {
    const lines = me.profile === 'business'
      ? ['Business travellers pay nothing, but take the visa test.', `Answer ${VISA_TEST_PASS} of 3 questions right and you get the visa; otherwise no entry, and this turn is used.`]
      : [`You will pay ${plural(VISA_PRICE, 'point')}${(() => { const o = visaOwner(s, me, me.area, s.visa!.to); return o ? ` to ${nameOf(o.seat)}` : ''; })()}, and take a visa test.`, `Answer ${VISA_TEST_PASS} of 3 questions right and you get the visa; otherwise no entry, and this turn is used (nothing paid).`];
    return info('visa', '🛂 You need a visa!', lines, () => { seenCards.add(visaKey); render(); });
  }
  const bizKey = `bizinfo-${me.seat}`;
  if (s.phase === 'play' && me.kind === 'human' && !isRobot && !seenCards.has(bizKey) && !infoOff('business') && actions.some((a) => a.type === 'buy')) {
    return info('business', '🏢 You can buy a business!', [
      'Bus, car, train, ship, plane or wonder: others pay to use your business.',
      'Buying loses no points: each business counts its price.',
      // Audit 2.13: the guide's example (the old "2 + 2 = 4" didn't say where the 4 came from).
      `Example: you have 10 points and buy an airline for ${BUSINESS_PRICE.airline}. You keep ${10 - BUSINESS_PRICE.airline} points + a ${BUSINESS_PRICE.airline}-point airline = still 10.`,
      'Owning the most businesses at the end gives you an extra point.',
    ], () => { seenCards.add(bizKey); render(); });
  }
  const homeKey = `homeinfo-${s.round}-${me.seat}`;
  if (s.phase === 'play' && me.kind === 'human' && !isRobot && !seenCards.has(homeKey) && !infoOff('home')
    && me.broke === GO_HOME_TURNS - 2 && actions.some((a) => a.type === 'blocked') && blockedByMoney(s, gameMap, me)) {
    return info('home', '🏠 Blocked again', [`Blocked ${GO_HOME_TURNS - 1} turns · ${GO_HOME_TURNS}rd blocked turn = go home +${GO_HOME_POINTS}.`],
      () => { seenCards.add(homeKey); render(); });
  }
  const key = s.card ? `${s.card.round}-${s.card.seat}-${s.card.card.text}` : '';
  // Step 2.11 (owner): Kris Ann's card shows to everyone, also on a robot's turn (the robot waits for OK).
  if (s.phase === 'play' && s.card?.card.deck === 'krisann' && s.card.seat === me.seat && !seenCards.has(key)) {
    const c = s.card;
    return { turn: false, node: wrap(krisAnnCard(c, () => { seenCards.add(key); pauseNext(); render(); }), 'trip'),
      sound: c.card.points < 0 ? 'card-bad' : c.card.points > 0 ? 'card-good' : 'tap', soundKey: key };
  }
  if (s.phase === 'play' && me.kind === 'human' && s.card?.seat === me.seat && !seenCards.has(key)) {
    const bad = s.card.card.loseTurn || s.card.card.points < 0;
    // Two steps (task 14k): the phone buzzes, then the news and what it means.
    if (!seenCards.has(`${key}-phone`)) {
      return { turn: false, node: wrap(phoneNews(s.card, () => { seenCards.add(`${key}-phone`); render(); }), 'phone-modal'), sound: 'tap', soundKey: `${key}-phone` };
    }
    return { turn: false, node: wrap(el('div', {}, eventCard(s.card), ok(() => { seenCards.add(key); render(); })), 'event'), sound: bad ? 'card-bad' : 'card-good', soundKey: key };
  }
  // The Nomad's boss alert (step 2.5, owner): shown once, at the start of the travel turn it is for.
  const bossAlert = s.phase === 'play' && me.kind === 'human' && !isRobot && !s.challenge ? nomadAlert(me) : null;
  const bossKey = `boss-${s.round}-${me.seat}`;
  if (bossAlert && !seenCards.has(bossKey)) {
    return { turn: false, node: wrap(phoneBoss(me.seat, bossAlert, () => { seenCards.add(bossKey); render(); }), 'phone-modal'), sound: 'tap', soundKey: bossKey };
  }
  // A wonder poster (task M6, owner's rules): a person's turn begins in a wonder area they
  // reached on their last turn; shown once per wonder per game, never for robots and never for
  // the home area (no wonder point there). Buying the tours is allowed now (the turn begins here).
  const here = me.area;
  const wonderKey = `wonder-${me.seat}-${here}`; // per person (audit 2.13: with 2 people only the first saw it)
  if (s.phase === 'play' && me.kind === 'human' && !isRobot && here && here !== me.home && !seenCards.has(wonderKey)
    && areaById.get(here)!.wonder && me.visitedAreas.includes(here)
    && !s.quiz && !s.visa && !s.challenge && !s.offer && !me.loseTurn && !pendingFees) {
    return { turn: false, node: wrap(wonderPoster(s, me, actions, () => { seenCards.add(wonderKey); }), 'trip'), sound: 'milestone', soundKey: wonderKey };
  }
  // Halfway and the last five turns, on a person's turn.
  if (s.phase === 'play' && !isRobot && me.kind === 'human') {
    const due = milestones(s.totalRounds).filter((m) => s.round >= m.round && !seenCards.has(m.key));
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
    return { turn: false, node: wrap(finishPopup(s), 'gold fin-modal'), sound: 'win', soundKey: 'finished' };
  }
  // Choosing the home country: stressed before it is confirmed (owner's request, task 14 A2).
  if (s.phase === 'chooseStart' && !isRobot && pickedStart) {
    const chosen = { type: 'chooseStart' as const, area: pickedStart };
    const name = areaById.get(pickedStart)!.name;
    // Owner (step 2.12 J6): then the person's passport, with the new citizenship (not for the Digital Nomad, who has none).
    const start = button(`🏠 Start in ${name}`, () => { detailArea = null; startPassport = me.profile !== 'nomad' ? me.seat : null; act(chosen); });
    start.className = 'primary';
    return { turn: false, node: wrap(el('div', {},
      el('h2', { textContent: `🏠 ${name} will be your home country for the whole game.` }),
      el('p', { textContent: me.profile === 'nomad'
        ? 'The Digital Nomad has no citizenship: you pay visas, but never receive any. If you are ever sent home (for example when your money runs out), you come back here.'
        : `From the first turn you are a citizen of ${citizenshipName(citizenshipAreasOf(pickedStart))}: every other player takes a visa test and pays you a ${VISA_PRICE}-point visa each time they enter it (Luxury pays without a test${me.profile === 'business' ? '' : ', and the Business Traveler takes the test but never pays'}). If you are ever sent home, you come back here.` }),
      el('div', { className: 'row' }, start, button('Choose again', () => { pickedStart = null; detailArea = null; render(); })))) };
  }
  // The Business's 2nd citizenship (step 2.6), in a popup (owner's request).
  if (citizenPopup && !isRobot && s.phase === 'play') {
    const where = me.area ? citizenshipName(citizenshipAreasOf(me.area)) : '';
    const yes = button(`🛂 Yes, take ${where}`, () => { citizenPopup = false; act({ type: 'buyCitizenship' }); });
    yes.className = 'primary';
    return { turn: false, node: wrap(el('div', {},
      el('h2', { textContent: `🛂 A 2nd citizenship: ${where}` }),
      el('p', { textContent: `Business Traveler: you may take one 2nd citizenship, for free. Then every other player takes a visa test and pays you a ${VISA_PRICE}-point visa each time they enter ${where} (Luxury pays without a test). You can do this only once in the game; it doesn't end your turn and doesn't count at the end.` }),
      el('div', { className: 'row' }, yes, button('Not now', () => { citizenPopup = false; render(); })))) };
  }
  // Every call to action is a popup (owner's request): quiz, test, challenge, fees, an offer,
  // the travel turn (play a challenge?), a lost turn, and being stuck or sent home.
  const main = !isRobot && s.phase === 'play'
    && (s.offer || s.quiz || s.challenge || pendingFees || me.travel || me.loseTurn
      || actions.some((a) => a.type === 'blocked' || a.type === 'goHome')
      || s.visa);
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
  for (const a of gameMap.areas) {
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
  // Owner (step 2.12b): the border between two parts of a big country is thin and dashed.
  shapes.append(innerBorders(geo, paths.keys(), (id) => areaColour.get(id)!, cls));
  const names = svg('g', { class: 'names' });
  const labels = svg('g');
  root.append(shapes, glowFor(shapes), names, labels);
  // The page is zoomed to the screen (uiZoom): sizes here are in page pixels.
  const w = window.innerWidth / uiZoom / 2 - 12;
  const h = pane === 'left' ? window.innerHeight / uiZoom - 115 : w / 2.6;
  const scale = Math.min(w / vb.w, h / vb.h);
  return { root, names, labels, paths, vb, k, fs: px / scale, px };
}

// Text at (x, y) in view units; a tappable one gets a pill behind it.
function label(d: Drawn, x: number, y: number, text: string, cls: string, size = 1, onTap?: () => void, hint?: string): void {
  const fs = d.fs * size;
  const g = svg('g', { class: `label ${cls}` });
  if (hint) g.append(svg('title', {}, hint)); // shown on hover (computer)
  if (onTap) {
    const w = [...text].length * fs * 0.62 + fs;
    g.append(svg('rect', { x: x - w / 2, y: y - fs * 0.8, width: w, height: fs * 1.6, rx: fs * 0.8 }));
    g.classList.add('tap');
    g.addEventListener('click', (e) => { e.stopPropagation(); onTap(); });
  }
  g.append(svg('text', { x, y, 'font-size': fs, 'stroke-width': fs * 0.22, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, text));
  d.labels.append(g);
}

// Area names on the map (owner's request), at a fixed size on screen, so zooming in shows more names. Biggest areas
// first. A name shows only where it doesn't touch another name, a badge or a drawn icon, and is fully on screen.
// Owner (2026-11-25): it may stick out of its area over sea, never over another area; it sits on the part of its area
// that is on screen; a long name may take 2 or 3 lines, and North, South, West, East may become N., S., W., E.
// (`nameLayouts`); a few areas have a map name (`MAP_NAME`). Returns the update for a zoom (view units per screen
// pixel; the page zoom makes a page pixel uiZoom screen pixels). `shift` moves a name down (below a drawn icon).
const NAME_PX = 11;
function areaNames(d: Drawn, ids: string[], shift: (id: string) => number = () => 0): (unit: number) => void {
  const items = ids.map((id) => {
    const g = geo.get(id)!;
    const name = MAP_NAME[id] ?? areaById.get(id)!.name;
    const text = svg('text', { x: g.centre[0] * d.k, y: g.centre[1] + shift(id), 'text-anchor': 'middle', 'dominant-baseline': 'central' }, name);
    d.names.append(text);
    return { id, text, layouts: nameLayouts(name), x: g.centre[0] * d.k, y: g.centre[1] + shift(id), size: g.core.w * d.k * g.core.h };
  }).sort((a, b) => b.size - a.size);
  // Is a point (x as in the drawing) on this area? The area's box is checked first (fast).
  const inArea = (id: string, x: number, y: number) => {
    const b = geo.get(id)!.box;
    const wx = x / d.k;
    if (wx < b.x || wx > b.x + b.w || y < b.y || y > b.y + b.h) return false;
    return d.paths.get(id)?.isPointInFill(new DOMPoint(wx, y)) ?? false;
  };
  // The other areas whose box meets a name's box (drawing units): only these can be under the name (fast).
  const drawnIds = [...d.paths.keys()];
  const near = (id: string, x0: number, x1: number, y0: number, y1: number) => drawnIds.filter((o) => {
    const b = geo.get(o)!.box;
    return o !== id && b.x <= x1 / d.k && b.x + b.w >= x0 / d.k && b.y <= y1 && b.y + b.h >= y0;
  });
  // The width of a line of text at size 1, measured once (step 2.12 J5: the old guess, 0.58 of the size a letter,
  // was up to 11% short); the guess only if the page can't measure.
  const textWidth = new Map<string, number>();
  const update = (unit: number) => {
    const fs = NAME_PX * uiZoom * unit;
    const lh = fs * 1.2;
    // The part of the map really on screen, in drawing units.
    const svgRect = d.root.getBoundingClientRect();
    const paneRect = (d.root.parentElement ?? d.root).getBoundingClientRect();
    const sc = Math.min(svgRect.width / d.vb.w, svgRect.height / d.vb.h) || 1;
    const ox = svgRect.left + (svgRect.width - d.vb.w * sc) / 2;
    const oy = svgRect.top + (svgRect.height - d.vb.h * sc) / 2;
    const toX = (px: number) => d.vb.x + (px - ox) / sc;
    const toY = (py: number) => d.vb.y + (py - oy) / sc;
    const vis = {
      x0: toX(Math.max(svgRect.left, paneRect.left)), x1: toX(Math.min(svgRect.right, paneRect.right)),
      y0: toY(Math.max(svgRect.top, paneRect.top)), y1: toY(Math.min(svgRect.bottom, paneRect.bottom)),
    };
    // Walk badges and drawn icons count as taken.
    const placed: Box[] = [...d.labels.children].map((g) => {
      const r = g.getBoundingClientRect();
      return { x: toX((r.left + r.right) / 2), y: toY((r.top + r.bottom) / 2), w: r.width / sc, h: r.height / sc };
    });
    // The middle of the part of each area that is on screen (a grid of test points).
    const N = 28;
    const seen = new Map<string, { sx: number; sy: number; n: number }>();
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const px = vis.x0 + ((i + 0.5) / N) * (vis.x1 - vis.x0);
      const py = vis.y0 + ((j + 0.5) / N) * (vis.y1 - vis.y0);
      const it = items.find((x) => inArea(x.id, px, py));
      if (!it || isOutlying(it.id, px / d.k)) continue; // not on a far-away part (Greenland, Hawaii)
      const m = seen.get(it.id) ?? { sx: 0, sy: 0, n: 0 };
      m.sx += px;
      m.sy += py;
      m.n++;
      seen.set(it.id, m);
    }
    for (const it of items) {
      let best: { x: number; y: number; lines: string[]; w: number; h: number } | undefined;
      const m = seen.get(it.id);
      const anchors: [number, number][] = [[it.x, it.y], ...(m ? [[m.sx / m.n, m.sy / m.n] as [number, number]] : [])];
      // A line's width with the letters' outline.
      const widthOf = (l: string) => {
        let r = textWidth.get(l);
        if (r === undefined) {
          it.text.style.display = '';
          it.text.setAttribute('font-size', '100');
          it.text.textContent = l;
          r = it.text.getComputedTextLength() / 100 || [...l].length * 0.58;
          if (document.fonts.status === 'loaded') textWidth.set(l, r); // not before the game's font is ready
        }
        return r * fs + fs * 0.22;
      };
      for (const [ax, ay] of anchors) for (const lines of it.layouts) {
        if (best) break;
        const w = Math.max(...lines.map(widthOf));
        const h = lines.length * lh;
        // The middle first, then a little higher or lower, or sideways (towards the sea).
        for (const n of [0, 1, -1, 2, -2]) for (const f of [0, -0.25, 0.25, -0.5, 0.5, -0.75, 0.75]) {
          if (best) break;
          const x = ax + f * w;
          const y = ay + n * lh;
          if (x - w / 2 < vis.x0 || x + w / 2 > vis.x1 || y - h / 2 < vis.y0 || y + h / 2 > vis.y1) continue;
          if (placed.some((b) => Math.abs(b.x - x) < (b.w + w) / 2 && Math.abs(b.y - y) < (b.h + h) / 2)) continue;
          // Test points every 0.2 of a letter along each line, 5 rows (step 2.12 J5: 5 points a line missed thin land,
          // e.g. Scotland under "Denmark & Greenland").
          const pts: [number, number][] = [];
          const steps = Math.max(4, Math.ceil(w / (fs * 0.2)));
          for (let r = 0; r < lines.length; r++) for (let k = 0; k <= steps; k++) for (const fy of [-0.4, -0.2, 0, 0.2, 0.4]) {
            pts.push([x - w / 2 + (k / steps) * w, y - h / 2 + (r + 0.5 + fy) * lh]);
          }
          const others = near(it.id, x - w / 2, x + w / 2, y - h / 2, y + h / 2);
          if (others.length && pts.some(([px, py]) => others.some((o) => inArea(o, px, py)))) continue; // never over another area
          // Always on its own area too, on its main part (never only on Greenland or Hawaii).
          if (!pts.some(([px, py]) => inArea(it.id, px, py) && !isOutlying(it.id, px / d.k))) continue;
          best = { x, y, lines, w, h };
        }
      }
      it.text.setAttribute('font-size', String(fs));
      it.text.setAttribute('stroke-width', String(fs * 0.22));
      it.text.style.display = best ? '' : 'none';
      if (best) {
        const b = best;
        it.text.setAttribute('x', String(b.x));
        it.text.setAttribute('y', String(b.y));
        it.text.textContent = '';
        b.lines.forEach((l, i) => it.text.append(svg('tspan', { x: b.x, dy: i === 0 ? -((b.lines.length - 1) / 2) * lh : lh }, l)));
        placed.push({ x: b.x, y: b.y, w: b.w, h: b.h });
      }
    }
  };
  // The tests need the map on the page: names are placed on the next frame.
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
  const citizen = s.players.some((p) => citizenAreas(p).includes(id));
  return `${a.wonder ? '🏛️' : ''}${hasRoute(id, 'airport') ? '✈️' : ''}${hasRoute(id, 'port') ? '⚓' : ''}${hasRoute(id, 'station') ? '🚆' : ''}${hasRoute(id, 'bus') ? '🚌' : ''}${hasRoute(id, 'car') ? '🚗' : ''}${citizen ? '🛂' : ''}`;
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
    && !me.loseTurn && !s.visa;
}

// Left half: the current area, zoomed in, with its drawn airport, port, wonder and citizenship
// flag; neighbours around it (tap a green one to walk there, any other for its details).
function renderAreaView(s: GameState, isRobot: boolean): HTMLElement {
  // At the end of a turn the map stays on the player who just moved (task 14i).
  const me = hold ? s.players[hold.seat] : currentPlayer(s);
  const focus = me.area ?? me.travel?.to ?? me.home ?? gameMap.areas[0].id;
  const here = areaById.get(focus)!;
  const base = pad(geo.get(focus)!.core, 0.25, 2.5);
  const k = squeeze(base);
  if (!camera || camera.focus !== focus) camera = { focus, box: base };
  const actions = legalActions(s, gameMap);
  const myTurn = !hold && mapTurn(s, isRobot);
  const walks = new Map(myTurn ? plainActions(actions).flatMap((a) => (a.type === 'walk' ? [[a.to, a] as const] : [])) : []);
  const walkNow = (id: string) => go(walks.get(id)!);
  // Owner (M5): going back to a visited area asks first (no points, and the turn is used).
  const walkTo = (id: string) => () => {
    if (me.visitedAreas.includes(id)) { confirmWalk = id; render(); } else walkNow(id);
  };
  // Owner (M5): tapping an area you can't walk to says why, in a small note on the map; its
  // details still open beside it.
  const details = (id: string) => () => {
    detailArea = id;
    mapNote = myTurn && id !== focus ? { text: noWalkReason(s, me, here, id), until: Date.now() + NOTE_MS } : null;
    render();
  };
  const d = drawMap(camera.box, k,
    (id) => (id === focus ? 'here' : walks.has(id) ? 'go' : here.neighbours.includes(id) ? 'near' : 'far'),
    (id) => (walks.has(id) ? walkTo(id) : details(id)));
  // On your turn, the areas you can't walk to are dimmed more, so the ones you can stand out.
  if (myTurn && walks.size > 0) d.root.classList.add('turn');

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
    // Owner (step 2.12 J5, all 3 maps): a badge that covers another one, or sits on another area (the 100-turn
    // map's small areas), moves towards its own area's centre until it sits inside it and is free.
    const own = (bx: number, by: number) => [bx - w * 0.4, bx, bx + w * 0.4].every((px) => areaAt(geo, px / k, by) === id);
    if (overlapsPlaced(x, y, w, h) || !own(x, y)) {
      const [tx, ty] = geo.get(id)!.centre;
      for (let i = 1; i <= 20; i++) {
        const nx = Math.min(Math.max(x + ((tx * k - x) * i) / 20, v.x + w / 2), v.x + v.width - w / 2);
        const ny = Math.min(Math.max(y + ((ty - y) * i) / 20, v.y + h / 2), v.y + v.height - h / 2);
        if (own(nx, ny) && !overlapsPlaced(nx, ny, w, h)) { x = nx; y = ny; break; }
      }
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
    }
    // Visited dots on every drawn area, also outside the first view (owner, M5: they were missing
    // after zooming or moving the map); drawn on top at the end.
    visitedDots(d, s, id, x, cy + fs * 1.5, fs * 0.28);
    if (walk) {
      const fees = feeTotal(entryFees(s, me, me.area, id));
      const text = `🚶${gainLabel(s, walk, areaById.get(id)!) || ' +0'}${fees ? ` 💰−${fees}` : ''}`;
      const w = ([...text].length * fs * 0.62 + fs) * 0.9;
      const [bx, by] = badgeSpot(id, w, fs * 1.6 * 0.9);
      label(d, bx, by, text, 'go', 0.9, walkTo(id), walkHint(text, areaById.get(id)!.name));
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
  const citizen = s.players.find((p) => citizenAreas(p).includes(focus));
  // Each prop inside its own area, or a port in the sea next to it, never over another area
  // (owner, M5: Portugal's port over Spain looked like Spain's): see propSpots.
  const kinds = ([...(here.wonder ? ['wonder'] : []), ...(citizen ? ['citizen'] : []),
    ...(['airport', 'port', 'station', 'bus', 'car'] as const).filter((kind) => hasRoute(focus, kind))]) as PropKind[];
  const spot = propSpots(geo, focus, kinds, P, k);
  const put = (kind: PropKind, prop: SVGGElement, size: number, title: string) => {
    const [x, y] = spot.get(kind)!;
    d.labels.append(place(prop, x, y, size, title, open(kind)));
  };
  if (here.wonder) put('wonder', monument(owner('tours')), P, `Wonder: ${WONDER_NAME[focus] ?? here.name}`);
  if (citizen) put('citizen', citizenFlag(colourOf(citizen.seat)), P * 0.9, `${nameOf(citizen.seat)}'s citizenship`);
  if (hasRoute(focus, 'airport')) put('airport', airport(owner('airline')), P, 'Airport');
  if (hasRoute(focus, 'port')) put('port', port(owner('ferry')), P, 'Port');
  if (hasRoute(focus, 'station')) put('station', station(owner('train')), P, 'Station');
  if (hasRoute(focus, 'bus')) put('bus', busStop(owner('bus')), P, 'Bus stop');
  // The car (task 19): a Backpacker sees a hitchhiker, never a rental.
  const hiker = me.profile === 'backpacker';
  if (hasRoute(focus, 'car')) put('car', carRental(owner('car'), hiker), P, hiker ? 'Hitchhike' : 'Car rental');
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
  for (const dotEl of [...d.labels.querySelectorAll('.visit')]) d.labels.append(dotEl); // dots on top
  attachZoom(d.root, k, areaNames(d, [...d.paths.keys()].filter((id) => id !== focus)));
  const note = mapNote && mapNote.until > Date.now() ? el('div', { className: 'map-note', textContent: mapNote.text }) : '';
  if (note) {
    note.style.animationDelay = `${mapNote!.until - NOTE_MS - Date.now()}ms`; // a redraw doesn't restart it
    setTimeout(() => note.remove(), mapNote!.until - Date.now());
  }
  const ask = confirmWalk && myTurn && walks.has(confirmWalk) ? confirmBox(areaById.get(confirmWalk)!, () => { const id = confirmWalk!; confirmWalk = null; walkNow(id); }) : '';
  if (!ask) confirmWalk = null;

  const caption = me.travel
    ? `${VEHICLE[me.travel.kind]} ${nameOf(me.seat)} is on the way to ${here.name}`
    : `${WALK_LEGEND} · pinch to zoom`;
  const reset = button('⤢', () => { camera = null; render(); });
  reset.title = 'Back to the area';
  return el('div', { className: 'areaview' },
    el('div', { className: 'where' }, dot(me.seat), ` ${here.name} · ${here.continent} `, reset),
    d.root, note, ask,
    // Each part of the caption stays on one line (2026-10-10): no break inside "big-country part".
    el('div', { className: 'small caption' }, ...caption.split(' · ').flatMap((part, i) => [i ? ' · ' : '', el('span', { textContent: part })])),
    popup ? renderPopup(s, popup, myTurn) : '');
}

// "Already visited" (owner, M5): a small question on the map before walking back.
function confirmBox(to: Area, yes: () => void): HTMLElement {
  const go = button('Yes, go', yes);
  go.className = 'primary';
  return el('div', { className: 'map-ask' },
    el('p', {}, el('strong', { textContent: `You have already been to ${to.name}.` }), ' Going back gives no points, and the walk uses your turn. Go anyway?'),
    el('div', { className: 'row' }, go, button('No', () => { confirmWalk = null; render(); })));
}

// Why a tapped area can't be reached on foot now (owner, M5).
function noWalkReason(s: GameState, me: Player, here: Area, id: string): string {
  const to = areaById.get(id)!;
  if (!here.neighbours.includes(id)) {
    const near = here.neighbours.map((n) => areaById.get(n)!.name);
    const trips = ROUTE_KINDS.filter((kind) => hasRoute(here.id, kind)).map((kind) => TRIP_WORD[kind]);
    return `🚫 No land border between ${here.name} and ${to.name}. `
      + (near.length ? `From ${here.name} you can walk to ${near.join(', ')}.` : `${here.name} has no land border.`)
      + (trips.length ? ` Or travel by ${trips.join(' or ')} from here.` : '');
  }
  const there = s.players.find((p) => p.seat !== me.seat && p.area === id);
  if (there) return `🚫 ${nameOf(there.seat)} is in ${to.name}: two players can never share an area.`;
  const booked = bookedBy(s, id);
  if (booked && booked.seat !== me.seat) return `🚫 ${nameOf(booked.seat)} is travelling to ${to.name}: it stays closed until they arrive.`;
  const fees = feeTotal(entryFees(s, me, me.area, id));
  if (fees > me.points) return `🚫 Entering ${to.name} costs ${plural(fees, 'point')} (visa or tour fee), and you have ${plural(me.points, 'point')}.`;
  return `🚫 You can't walk to ${to.name} now.`;
}
const TRIP_WORD: Record<RouteKind, string> = { airport: 'plane', port: 'ship', station: 'train', bus: 'bus', car: 'car' };

// The popup menus of the drawn props (planes, ships, trains, the bus, the car, wonder, citizenship).
type PopupKind = RouteKind | 'wonder' | 'citizen';

function renderPopup(s: GameState, p: { kind: PopupKind; area: string }, myTurn: boolean): HTMLElement {
  const me = currentPlayer(s);
  const area = areaById.get(p.area)!;
  const actions = myTurn && me.area === p.area ? legalActions(s, gameMap) : [];
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
      ? `for sale, ${plural(BUSINESS_PRICE[kind], 'point')}; then ${BUSINESS_EARNS[kind]}.${ownsNoBusiness(me.profile) ? ' Kris Ann never owns a business.' : ''}`
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
    const c = s.players.find((x) => citizenAreas(x).includes(p.area))!;
    box.append(el('div', { className: 'row spread' }, el('h3', { textContent: `🛂 ${citizenshipName(citizenshipOf(c, p.area)!)}` }), close),
      el('p', { className: 'small', textContent: c === me
        ? `You are a citizen here: every other player takes a visa test and pays you a ${VISA_PRICE}-point visa to enter (Luxury pays without a test; the Business Traveler takes the test but never pays).`
        : me.profile === 'luxury' ? `${nameOf(c.seat)} is a citizen here: to enter you pay ${nameOf(c.seat)} a ${VISA_PRICE}-point visa (no test for Luxury).`
        : me.profile === 'business' ? `${nameOf(c.seat)} is a citizen here: to enter you pass a visa test (no visa to pay for the Business Traveler).`
        : `${nameOf(c.seat)} is a citizen here: to enter you pass a visa test and pay ${nameOf(c.seat)} a ${VISA_PRICE}-point visa.` }));
    return box;
  }

  const kind: RouteKind = p.kind;
  if (kind === 'car') return carPopup(s, p.area, actions, close, box, businessLine, buyButton);
  const price = me.profile ? ticketPrice(me.profile, kind) : null;
  const turns = me.profile ? travelTurns(me.profile, kind, true) : 0;
  const slowTurns = me.profile ? travelTurns(me.profile, kind, false) : 0;
  const noRide = me.profile !== null && !canRide(me.profile, kind);
  const dests = me.profile && me.area === p.area ? destinations(gameMap, p.area, kind, me.profile) : routeEnds(p.area, kind);
  box.append(el('div', { className: 'row spread' }, el('h3', { textContent: `${VEHICLE[kind]} ${capital(TRAVEL_WORDS[kind].place)} of ${area.name}` }), close),
    el('p', { className: 'small', textContent: noRide ? `${NO_RIDE[kind]}; you may still buy the ticket booth.`
      : `${price === null ? `Backpacker: you travel only with the quiz, ${turnsWord(slowTurns)}.` : `Ticket ${plural(price, 'point')}${ticketTo(s, kind)}: ${turnsWord(turns)}. The free quiz is slower: ${turnsWord(slowTurns)}.`} A wrong quiz answer uses the turn.` }),
    businessLine(TICKET_BUSINESS[kind]),
    el('div', { className: 'row' }, buyButton(TICKET_BUSINESS[kind])));
  const warning = lastTryWarning(s, plainActions(actions));
  if (warning) box.append(el('p', { className: 'note', textContent: warning }));
  const list = el('div', { className: 'dests' });
  for (const to of dests) {
    const t = areaById.get(to)!;
    const board = plainActions(actions).find((a) => a.type === 'board' && a.kind === kind && a.to === to);
    const quiz = plainActions(actions).find((a) => a.type === 'quiz' && a.kind === kind && a.to === to);
    const gain = board ?? quiz;
    const name = el('button', { className: 'link', textContent: `${t.name}${areaIcons(s, to) ? ` ${areaIcons(s, to)}` : ''}` });
    name.addEventListener('click', () => { detailArea = to; render(); });
    list.append(el('div', { className: 'dest' + (detailArea === to ? ' picked' : '') },
      name,
      el('span', { className: 'small', textContent: `${t.continent}${gain ? gainLabel(s, gain, t) : ''}${me.area === p.area ? feeLabel(s, to) : ''}` }),
      el('span', { className: 'row' },
        board ? button(`Pay ${price}`, () => go(board)) : '',
        quiz ? button('Quiz (free)', () => go(quiz)) : '',
        !board && !quiz && me.area === p.area ? el('span', { className: 'small', textContent: closedReason(s, to) }) : '')));
  }
  box.append(list);
  return box;
}

// The car's popup (task 19). Nomad, Business and Luxury rent a car (no quiz); the Backpacker
// only ever sees hitchhiking, and is never told when a car stops.
function carPopup(
  s: GameState, areaId: string, actions: Action[], close: HTMLElement, box: HTMLElement,
  businessLine: (kind: BusinessKind) => HTMLElement | string, buyButton: (kind: BusinessKind) => HTMLElement | string,
): HTMLElement {
  const me = currentPlayer(s);
  const area = areaById.get(areaId)!;
  const hiker = me.profile === 'backpacker';
  const price = me.profile ? ticketPrice(me.profile, 'car') : null;
  const turns = me.profile ? travelTurns(me.profile, 'car', price !== null) : 1;
  const dests = me.profile && me.area === areaId ? destinations(gameMap, areaId, 'car', me.profile) : routeEnds(areaId, 'car');
  const tried = me.area === areaId && me.hitchFailedRound === s.round;
  box.append(el('div', { className: 'row spread' }, el('h3', { textContent: hiker ? `👍 Hitchhiking in ${area.name}` : `🚗 Car rental of ${area.name}` }), close),
    el('p', { className: 'small', textContent: hiker
      ? `Want to try to hitchhike, so you can see all of the USA or Canada? Raise your thumb: if a car stops, you ride for free (${plural(turns, 'travel turn')}) and get all of the USA's or Canada's points (+${bigCountryReward(me.profile, 3)}) at once. If none stops, you walk on.`
      : `Want to rent a car to see all of the USA or Canada? ${plural(price ?? 0, 'point')}, no quiz, ${plural(turns, 'travel turn')}: all of the USA's or Canada's points (+${bigCountryReward(me.profile, 3)}) at once; its other parts still give +1 each.` }),
    businessLine('car'),
    el('div', { className: 'row' }, buyButton('car')));
  if (tried) box.append(el('p', { className: 'note', textContent: '👍 No car stopped this turn. Walk on to another area.' }));
  const list = el('div', { className: 'dests' });
  for (const to of dests) {
    const t = areaById.get(to)!;
    const board = plainActions(actions).find((a) => a.type === 'board' && a.kind === 'car' && a.to === to);
    const thumb = plainActions(actions).find((a) => a.type === 'hitchhike' && a.to === to);
    // Never preview a hitchhike: trying it would give away whether a car stops (a secret).
    const gain = board;
    const name = el('button', { className: 'link', textContent: `${t.name}${areaIcons(s, to) ? ` ${areaIcons(s, to)}` : ''}` });
    name.addEventListener('click', () => { detailArea = to; render(); });
    list.append(el('div', { className: 'dest' + (detailArea === to ? ' picked' : '') },
      name,
      el('span', { className: 'small', textContent: `${t.continent}${gain ? gainLabel(s, gain, t) : ''}${me.area === areaId ? feeLabel(s, to) : ''}` }),
      el('span', { className: 'row' },
        board ? button(`Rent for ${price}`, () => go(board)) : '',
        thumb ? button('👍 Try to hitchhike', () => go(thumb)) : '',
        !board && !thumb && me.area === areaId && !tried ? el('span', { className: 'small', textContent: closedReason(s, to) }) : '')));
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
    'world', worldFull ? 5 : 10); // full screen: the map grows, pieces and marks keep their size
  for (const [id, path] of d.paths) {
    const b = bookedBy(s, id);
    if (b) path.style.stroke = colourOf(b.seat);
    // Owner (2026-11-20): only the dots of the player whose turn it is (a robot's too), a bit bigger; in a small
    // area (Korea) the dot stays small enough to leave the area visible.
    if (me.visitedAreas.includes(id)) {
      const g = geo.get(id)!;
      const [cx, cy] = g.centre;
      const r = Math.min(d.fs * 0.32, g.core.w * 0.22, g.core.h * 0.22);
      d.labels.append(svg('circle', { cx, cy: cy + Math.min(d.fs * 0.55, g.core.h * 0.3), r, fill: colourOf(me.seat), class: 'visit' }));
    }
  }
  const centre = (id: string) => geo.get(id)!.centre;
  for (const r of gameMap.routes ?? []) {
    const [ax, ay] = centre(r.a);
    const [bx, by] = centre(r.b);
    // A route across the date line (e.g. Japan – Alaska) leaves the map at one edge and comes back
    // at the other: drawn from both ends (step 2.4), so each end shows its line.
    const shift = bx - ax > 180 ? -360 : ax - bx > 180 ? 360 : 0;
    d.labels.append(svg('line', { x1: ax, y1: ay, x2: bx + shift, y2: by, class: `route ${r.kind}` }));
    if (shift) d.labels.append(svg('line', { x1: bx, y1: by, x2: ax - shift, y2: ay, class: `route ${r.kind}` }));
  }
  for (const p of s.players) {
    if (!p.travel) continue;
    const [ax, ay] = centre(p.travel.from);
    const [bx, by] = centre(p.travel.to);
    const total = p.profile ? travelTurns(p.profile, p.travel.kind, p.travel.paid) : 1;
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
  // Full screen and back (owner, M5: with 4 players the small map gets busy), like a video player.
  const toggle = button(worldFull ? '✕' : '⛶', () => { worldFull = !worldFull; render(); });
  toggle.className = 'world-full-btn';
  toggle.title = worldFull ? 'Back to the small map' : 'World map full screen';
  return el('div', { className: worldFull ? 'world full' : 'world' }, d.root, toggle);
}

// The areas a citizenship of this area covers: the area, or every part of its big country.
function citizenshipAreasOf(id: string): string[] {
  const a = areaById.get(id)!;
  return a.bigCountry ? gameMap.areas.filter((x) => x.bigCountry === a.bigCountry).map((x) => x.id) : [id];
}

// The details of a tapped area (for planning; nobody moves): name, flags, capitals, wonder,
// businesses, routes, citizenship, visits.
// The countries of an area: a flag and a capital only when the data has them (the area details
// and the end-of-turn popup).
// Greenland is not a country (owner, step 2.12 J5): its land stays in its area, but no row names it.
function countryRows(a: Area): HTMLElement[] {
  return (a.countries ?? []).filter((c) => c !== 'Greenland').map((c) => {
    const code = countryFlag(c);
    const cap = countryCapital(c);
    return el('div', { className: 'country' },
      code && FLAGS[code] ? el('img', { className: 'mini-flag', src: FLAGS[code], alt: '' }) : '',
      el('span', { textContent: `${c}${cap ? ` · capital ${cap}` : ''}` }));
  });
}

function renderAreaDetails(s: GameState, id: string): HTMLElement {
  const a = areaById.get(id)!;
  const me = currentPlayer(s);
  const routes = (kind: RouteKind) => routeEnds(id, kind).map((t) => areaById.get(t)!.name);
  const countries = countryRows(a);
  const parts = a.bigCountry ? gameMap.areas.filter((x) => x.bigCountry === a.bigCountry) : [];
  const total = gameMap.areas.filter((x) => x.continent === a.continent).length;
  const lines = [
    `${a.continent} · 🌍 visit all ${total} areas of ${a.continent}: +${continentReward(gameMap, a.continent)}`,
    a.wonder ? `🏛️ ${capital(WONDER_NAME[id] ?? 'a wonder')}: the first visit gives +1 point more` : '',
    a.bigCountry ? `🧩 Part of ${a.bigCountry}: ${me.profile ? `you have visited ${parts.filter((x) => me.visitedAreas.includes(x.id)).length}/${parts.length} parts` : `${parts.length} parts`}` : '',
    routes('airport').length ? `✈️ Airport: flights to ${routes('airport').join(', ')}` : '',
    routes('port').length ? `⚓ Port: ships to ${routes('port').join(', ')}` : '',
    routes('station').length ? `🚆 Station: trains to ${routes('station').join(', ')} (not for Luxury)` : '',
    routes('bus').length ? `🚌 Bus stop: buses to ${routes('bus').join(' or ')}, one way (Nomad, Backpacker and Kris Ann only): the whole country\'s points at once` : '',
    routes('car').length ? (me.profile === 'backpacker'
      ? `👍 Hitchhiking to ${routes('car').join(' or ')}, one way, free if a car stops: all of the USA\'s or Canada\'s points at once`
      : `🚗 Car rental: cars to ${routes('car').join(' or ')}, one way, ${plural(ticketPrice(me.profile ?? 'nomad', 'car') ?? 0, 'point')} (no quiz): all of the USA\'s or Canada\'s points at once`) : '',
    `🚶 Walk to: ${a.neighbours.map((n) => areaById.get(n)!.name).join(', ') || 'nowhere (plane or ship only)'}`,
    ...s.businesses.filter((b) => b.area === id).map((b) => `${BUSINESS_ICON[b.kind]} ${capital(BUSINESS_NAME[b.kind])}: ${b.owner === null ? `for sale, ${plural(BUSINESS_PRICE[b.kind], 'point')}${ownsNoBusiness(me.profile) ? ' (Kris Ann never owns a business)' : ''}` : `owned by ${nameOf(b.owner)}`}`),
    ...s.players.filter((p) => citizenAreas(p).includes(id)).map((p) => `🛂 ${nameOf(p.seat)} is a citizen here: others take a visa test and pay a ${VISA_PRICE}-point visa`),
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
  const legal = new Set(isRobot ? [] : legalActions(s, gameMap).flatMap((a) => (a.type === 'chooseStart' ? [a.area] : [])));
  const homes = new Map(s.players.flatMap((p) => (p.area ? [[p.area, p] as const] : [])));
  const open = (c: Continent) => gameMap.areas.some((a) => a.continent === c && legal.has(a.id));
  const wrap = el('div', { className: 'areaview' });
  if (zoom === null) {
    // Audit 2.13: a bigger world on the picker: the far north (Arctic islands) is left out and the map is a little
    // narrower, so it fills more of the pane; the continent names are a little smaller and cover less land.
    const top = Math.max(worldBox.y, -72);
    const d = drawMap(pad({ ...worldBox, y: top, h: worldBox.y + worldBox.h - top }, 0.01), 0.75,
      (id) => {
        const c = areaById.get(id)!.continent;
        return `c${continents.indexOf(c)}${homes.has(id) ? ' here' : open(c) ? '' : ' dim'}`;
      },
      (id) => (open(areaById.get(id)!.continent) ? () => { zoom = areaById.get(id)!.continent; render(); } : null));
    for (const path of d.paths.values()) path.style.fill = '';
    d.root.querySelector('g.inner')?.remove(); // continents only: no country borders to show
    for (const c of continents) {
      const ids = gameMap.areas.filter((a) => a.continent === c).map((a) => geo.get(a.id)!.centre);
      const x = ids.reduce((t, p) => t + p[0], 0) / ids.length;
      const y = ids.reduce((t, p) => t + p[1], 0) / ids.length;
      const taken = s.players.find((p) => p.startContinent === c);
      // Owner (step 2.8): the welcome bonus next to each continent's name, so it is part of the choice; a taken
      // continent shows only its name and the icon of the player who chose it (no profile name).
      const text = taken ? c : `${c} +${WELCOME_BONUS[c]}`;
      label(d, x * d.k, y, text, open(c) ? 'go' : 'near', 0.85,
        open(c) ? () => { zoom = c; render(); } : undefined);
      if (taken) d.labels.append(piece(taken.seat, x * d.k - ([...text].length * d.fs * 0.85 * 0.31 + d.fs * 1.1), y, d.fs * 1.4));
    }
    wrap.append(el('div', { className: 'where' }, 'The world: tap a continent'), d.root);
    return wrap;
  }
  const c = zoom;
  const view = pad(continentBox(gameMap, geo, c), 0.04, 1.5);
  const k = squeeze(view);
  const pickArea = (id: string) => () => { pickedStart = id; detailArea = id; render(); };
  const d = drawMap(view, k,
    (id) => (id === pickedStart ? 'here' : legal.has(id) ? 'go' : areaById.get(id)!.continent === c ? 'far' : 'dim'),
    (id) => (legal.has(id) ? pickArea(id) : null));
  areaNames(d, [...d.paths.keys()].filter((id) => areaById.get(id)!.continent === c), (id) => (areaById.get(id)!.wonder ? d.fs * 1.4 : 0));
  for (const a of gameMap.areas.filter((x) => x.continent === c)) {
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
  document.documentElement.style.setProperty('--ui-zoom', String(uiZoom));
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

// "Leave the game?" (owner, 2026-10-10): the Android app's back button calls kajBack(), and the
// game asks in its own popup, over any other popup. "Leave" opens kaj://leave, which closes the app;
// a second back press closes the question.
let leaveBox: HTMLElement | null = null;
function closeLeave(): void {
  leaveBox?.remove();
  leaveBox = null;
}
(window as Window & { kajBack?: () => void }).kajBack = () => {
  if (leaveBox) return closeLeave();
  if (overlay) return closeOverlay(); // step 2.10: a passport or the records close first
  if (legalOpen) return renderStart();
  const stay = button('Stay', closeLeave);
  stay.className = 'primary';
  leaveBox = el('div', { className: 'modal-back leave' },
    el('section', { className: 'card modal' },
      el('h2', { textContent: 'Leave the game?' }),
      el('div', { className: 'row' }, stay, button('Leave', leaveApp))));
  document.body.append(leaveBox);
};

// The Windows app (task W, windows/KAJ) shows the game in WebView2, which gives the page
// chrome.webview to talk to the app. There Esc works like Android's back button, F11 switches
// full screen, "Leave" closes the app, and the phone-only screen and text selection are off.
const windowsApp = (window as Window & { chrome?: { webview?: { postMessage(m: string): void } } }).chrome?.webview;
function leaveApp(): void {
  if (windowsApp) windowsApp.postMessage('leave');
  else location.href = 'kaj://leave';
}
if (windowsApp) {
  document.documentElement.classList.add('windows-app');
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') (window as Window & { kajBack?: () => void }).kajBack?.();
    else if (e.key === 'F11') windowsApp.postMessage('fullscreen');
    else return;
    e.preventDefault();
  });
}

installIcons();
renderStart();
