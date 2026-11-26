// The passport and the records screen at the end of the game (step 2.10, owner-approved design).
// Passport: a cover with the country of citizenship and its flag; page 1 a data page (the profile icon as
// the photo, the profile name, nationality, the journey, the two machine-readable lines); then stamp
// pages, 6 stamps a page, one stamp for every area visited, in the order visited. Both open over the
// end popup, which stays until "Play again".

import type { Continent, Profile } from '../engine/types.ts';
import { iconEl } from './icons.ts';
import { ordinal, type Records } from './records.ts';

export interface Stamp { name: string; continent: Continent; flag: string }
export interface PassportData {
  profile: Profile;
  name: string; // the profile name, "Backpacker"
  country: string; // the cover's country: the citizenship, or the Nomad's start country
  nationality: string | null; // null: the Nomad, "none"
  code: string; // 3 letters, the cover country's
  flag: string; // the cover country's flag (a data URI), or ''
  number: string; // the passport number, "KAJ30-0007"
  turns: number;
  players: number;
  date: Date;
  areas: number;
  continents: number;
  points: number;
  stamps: Stamp[];
}

const PER_PAGE = 6;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
// Ink colours of the stamps, one per continent.
const INK: Record<Continent, string> = {
  Europe: '#2c4a9a', Asia: '#a0262e', Africa: '#7a4a12', 'North America': '#1f6a3a', 'South America': '#6a2a7a', Oceania: '#155f7a', Antarctica: '#3a4a5a',
};
const TILT = [-8, 5, -3, 9, -6, 4];

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}
function button(label: string, onClick: () => void): HTMLButtonElement {
  const b = el('button', { textContent: label });
  b.addEventListener('click', onClick);
  return b;
}
const img = (src: string) => (src ? el('img', { src, alt: '' }) : '');
const field = (label: string, value: string) => el('div', {}, el('i', { textContent: label }), el('b', { textContent: value }));

export const passportDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

// The two machine-readable lines, 44 characters each, as on a real passport.
export function mrz(p: PassportData): [string, string] {
  const clean = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]+/g, '<');
  const pad = (s: string) => (s + '<'.repeat(44)).slice(0, 44);
  const yymmdd = `${String(p.date.getFullYear() % 100).padStart(2, '0')}${String(p.date.getMonth() + 1).padStart(2, '0')}${String(p.date.getDate()).padStart(2, '0')}`;
  return [pad(`P<${p.code}${clean(p.name)}`), pad(`${clean(p.number).replace(/</g, '')}<${p.code}${yymmdd}<<${p.areas}<${p.continents}<${p.points}`)];
}

// Number of pages: the data page, then the stamp pages.
export const pageCount = (stamps: number) => 1 + Math.max(1, Math.ceil(stamps / PER_PAGE));

// The passport, over everything; `close` removes it.
export function passportBook(p: PassportData, close: () => void): HTMLElement {
  const pages = pageCount(p.stamps.length);
  // Spread 0: the data page (left: the security pattern); spread k: stamp pages 2k and 2k+1.
  const spreads = 1 + Math.ceil((pages - 1) / 2);
  let at = -1; // -1: the cover
  const box = el('div', { className: 'pp-book' });
  const back = el('div', { className: 'modal-back pp-back' }, box, button('✕ Close', close));
  (back.lastChild as HTMLElement).className = 'pp-x';

  const stampPage = (n: number) => {
    const page = el('div', { className: 'pp-page' }, el('div', { className: 'pp-pno', textContent: String(n) }));
    if (n > pages) return page;
    const list = el('div', { className: 'pp-stamps' });
    p.stamps.slice((n - 2) * PER_PAGE, (n - 1) * PER_PAGE).forEach((s, i) => {
      const k = (n - 2) * PER_PAGE + i;
      const st = el('div', { className: `pp-stamp${k % 3 === 1 ? ' round' : ''}` },
        el('span', { className: 'c', textContent: s.continent }), img(s.flag), el('span', { className: 'n', textContent: s.name }),
        el('span', { className: 'no', textContent: `ARRIVED · ${k + 1}` }));
      st.style.color = INK[s.continent];
      st.style.transform = `rotate(${TILT[k % TILT.length]}deg)`;
      list.append(st);
    });
    page.prepend(list);
    return page;
  };

  const draw = () => {
    if (at < 0) {
      const open = button('Open ›', () => { at = 0; draw(); });
      box.replaceChildren(
        el('div', { className: 'pp-cover' },
          el('div', { className: 'country', textContent: p.country.toUpperCase() }),
          el('div', { className: 'emblem' }, img(p.flag)),
          el('div', { className: 'word', textContent: 'PASSPORT' }),
          el('div', { className: 'chip' })),
        el('div', { className: 'pp-nav' }, el('span', { textContent: `${p.name}'s passport` }), open));
      return;
    }
    let spread: HTMLElement;
    let label: string;
    if (at === 0) {
      const photo = el('div', { className: 'photo' }, iconEl(p.profile));
      const [l1, l2] = mrz(p);
      spread = el('div', { className: 'pp-spread' },
        el('div', { className: 'pp-page' }, el('div', { className: 'guill' }), el('div', { className: 'pp-pno', textContent: `KAJ · Journey of ${p.turns} turns` })),
        el('div', { className: 'pp-page' }, el('div', { className: 'dp' },
          el('h4', { textContent: `PASSPORT · ${p.country.toUpperCase()}` }),
          el('div', { className: 'body' }, photo, el('div', { className: 'fields' },
            field('Type / Code / Passport No.', `P   ${p.code}   ${p.number}`),
            field('Name', p.name.toUpperCase()),
            field('Nationality', (p.nationality ?? 'none').toUpperCase()),
            field('Journey', `${p.turns} TURNS · ${p.players} PLAYERS`),
            field('Date of issue', passportDate(p.date)),
            field('Areas · Continents · Points', `${p.areas} · ${p.continents} · ${p.points}`))),
          el('div', { className: 'mrz', textContent: `${l1}\n${l2}` })),
        el('div', { className: 'pp-pno', textContent: '1' })));
      label = `Page 1 of ${pages}`;
    } else {
      const left = 2 * at;
      spread = el('div', { className: 'pp-spread' }, stampPage(left), stampPage(left + 1));
      label = left + 1 <= pages ? `Pages ${left}–${left + 1} of ${pages}` : `Page ${left} of ${pages}`;
    }
    const prev = button('‹', () => { at--; draw(); });
    const next = button('›', () => { at++; draw(); });
    next.disabled = at >= spreads - 1;
    box.replaceChildren(spread, el('div', { className: 'pp-nav' }, prev, el('span', { textContent: label }), next));
  };
  draw();
  return back;
}

const PROFILE_NAME: Record<Profile, string> = { backpacker: 'Backpacker', business: 'Business Traveler', luxury: 'Luxury Traveler', nomad: 'Digital Nomad', krisann: 'Kris Ann' };

// The records on this device: a tab per game length, the top 10 by points; `fresh` marks today's new wins.
export function recordsBox(records: Records, turns: number, fresh: { turns: number; places: number[] }, close: () => void): HTMLElement {
  let shown = String(turns);
  const card = el('div', { className: 'modal card gold pp-rec' });
  const back = el('div', { className: 'modal-back pp-back' }, card, button('✕ Close', close));
  (back.lastChild as HTMLElement).className = 'pp-x';
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const day = (d: string) => {
    if (d === iso) return 'Today';
    const [y, m, dd] = d.split('-').map(Number);
    return y && m && dd ? `${dd} ${MONTHS[m - 1][0]}${MONTHS[m - 1].slice(1).toLowerCase()} ${y}` : d;
  };
  const draw = () => {
    const tab = (t: string) => {
      const b = button(`${t} turns`, () => { shown = t; draw(); });
      if (t === shown) b.className = 'on';
      return b;
    };
    const list = records[shown] ?? [];
    const rows = list.map((w, i) => {
      const who = el('td', {}, iconEl(w.profile), ` ${PROFILE_NAME[w.profile]}`);
      return el('tr', { className: Number(shown) === fresh.turns && fresh.places.includes(i + 1) ? 'new' : '' },
        el('td', { textContent: ['🥇', '🥈', '🥉'][i] ?? `${i + 1}.` }), el('td', {}, el('b', { textContent: String(w.points) })), who,
        el('td', { textContent: String(w.areas) }), el('td', { textContent: String(w.players) }), el('td', { textContent: day(w.date) }));
    });
    card.replaceChildren(
      el('h2', { className: 'big-title', textContent: '🏆 Records on this device' }),
      el('div', { className: 'pp-tabs' }, tab('30'), tab('50'), tab('100')),
      list.length
        ? el('table', {}, el('tr', {}, ...['', 'Points', 'Winner', 'Areas', 'Players', 'Date'].map((h) => el('th', { textContent: h }))), ...rows)
        : el('p', { textContent: `No wins in ${shown}-turn games yet.` }),
      el('p', { className: 'small', textContent: `Wins by people only · top 10 by points` }));
  };
  draw();
  return back;
}

// 1st place reads "the best win" (owner); 2nd to 10th "Nth best win".
export const recordLine = (place: number, turns: number, short: boolean) =>
  `🏆 New record: ${place === 1 ? 'the' : ordinal(place)} best win${short ? '' : ` on this device (${turns} turns)`}`;
