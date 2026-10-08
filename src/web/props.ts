// Drawn icons for the area the player stands in (task 14 B1, owner-approved): an airport with a
// hovering plane, a port with a rocking ship, a monument for the wonder, a citizenship flag,
// and the players' pawns. Each one is drawn in a 40 × 40 box centred on (0, 0).

import { svg } from './maps.ts';

const INK = '#062a30';

// A prop placed at (x, y), size in view units; tappable when onTap is given.
export function place(prop: SVGGElement, x: number, y: number, size: number, title: string, onTap?: () => void): SVGGElement {
  const g = svg('g', { transform: `translate(${x} ${y}) scale(${size / 40})`, class: 'prop' + (onTap ? ' tap' : '') },
    svg('title', {}, title),
    // A soft round shadow under every prop.
    svg('ellipse', { cx: 0, cy: 16, rx: 17, ry: 4, class: 'prop-shadow' }),
    prop);
  if (onTap) g.addEventListener('click', (e) => { e.stopPropagation(); onTap(); });
  return g;
}

// A pennant in the business owner's colour, on a short pole.
function pennant(x: number, y: number, colour: string): SVGGElement {
  return svg('g', { transform: `translate(${x} ${y})` },
    svg('line', { x1: 0, y1: 0, x2: 0, y2: -14, stroke: INK, 'stroke-width': 1.6 }),
    svg('path', { d: 'M0 -14 L10 -10.5 L0 -7 Z', fill: colour, stroke: INK, 'stroke-width': 1 }));
}

export function airport(owner?: string): SVGGElement {
  const g = svg('g', {},
    // Runway with its centre line.
    svg('rect', { x: -18, y: 6, width: 36, height: 8, rx: 2, fill: '#3b4a4f', stroke: INK, 'stroke-width': 1.2, transform: 'rotate(-12)' }),
    svg('line', { x1: -14, y1: 10, x2: 14, y2: 10, stroke: '#f4f1de', 'stroke-width': 1.2, 'stroke-dasharray': '3 3', transform: 'rotate(-12)' }),
    // The plane, hovering above the runway.
    svg('g', { class: 'hover' },
      svg('path', {
        d: 'M-15 -4 Q-15 -7 -11 -7 L10 -7 Q16 -7 17 -4 Q16 -1 10 -1 L-11 -1 Q-15 -1 -15 -4 Z',
        fill: '#f7f7f2', stroke: INK, 'stroke-width': 1.2,
      }),
      svg('path', { d: 'M-2 -7 L-8 -17 L-3 -17 L6 -7 Z', fill: '#d9e4e6', stroke: INK, 'stroke-width': 1.1 }),
      svg('path', { d: 'M-2 -1 L-6 6 L-2 6 L5 -1 Z', fill: '#d9e4e6', stroke: INK, 'stroke-width': 1.1 }),
      svg('path', { d: 'M-15 -6 L-17 -13 L-13 -13 L-10 -7 Z', fill: '#e8a33d', stroke: INK, 'stroke-width': 1.1 }),
      svg('circle', { cx: 12, cy: -4.5, r: 1.2, fill: '#4aa3df' }),
      svg('line', { x1: -6, y1: -4.5, x2: 8, y2: -4.5, stroke: '#4aa3df', 'stroke-width': 1.4, 'stroke-dasharray': '1.5 1.5' })),
  );
  if (owner) g.append(pennant(15, 8, owner));
  return g;
}

export function port(owner?: string): SVGGElement {
  const g = svg('g', {},
    // Pier on posts.
    svg('rect', { x: -18, y: 4, width: 18, height: 4, fill: '#9a6b44', stroke: INK, 'stroke-width': 1.1 }),
    svg('line', { x1: -15, y1: 8, x2: -15, y2: 14, stroke: INK, 'stroke-width': 1.4 }),
    svg('line', { x1: -5, y1: 8, x2: -5, y2: 14, stroke: INK, 'stroke-width': 1.4 }),
    // The ship, rocking on the water.
    svg('g', { class: 'rock' },
      svg('path', { d: 'M-4 2 L18 2 L14 10 L0 10 Z', fill: '#d65f4e', stroke: INK, 'stroke-width': 1.2 }),
      svg('rect', { x: 1, y: -5, width: 12, height: 7, rx: 1, fill: '#f7f7f2', stroke: INK, 'stroke-width': 1.1 }),
      svg('circle', { cx: 4.5, cy: -1.5, r: 1.2, fill: '#4aa3df' }),
      svg('circle', { cx: 9.5, cy: -1.5, r: 1.2, fill: '#4aa3df' }),
      svg('rect', { x: 6, y: -11, width: 4, height: 6, fill: '#e3cf52', stroke: INK, 'stroke-width': 1.1 })),
    // Waves.
    svg('path', { d: 'M-2 13 q3 -3 6 0 t6 0 t6 0 t6 0', fill: 'none', stroke: '#bfe9ff', 'stroke-width': 1.5, class: 'wave' }),
  );
  if (owner) g.append(pennant(-17, 4, owner));
  return g;
}

// One monument for every wonder (owner's choice): steps, columns and a pediment, with a sparkle.
export function monument(owner?: string): SVGGElement {
  const columns = [-11, -4, 3, 10].map((x) => svg('rect', { x, y: -4, width: 3.6, height: 13, fill: '#fbf3dc', stroke: INK, 'stroke-width': 0.9 }));
  const g = svg('g', {},
    svg('rect', { x: -17, y: 12, width: 34, height: 3.5, fill: '#e9dcb5', stroke: INK, 'stroke-width': 1 }),
    svg('rect', { x: -15, y: 9, width: 30, height: 3.5, fill: '#f1e6c4', stroke: INK, 'stroke-width': 1 }),
    ...columns,
    svg('rect', { x: -15, y: -7, width: 30, height: 3.5, fill: '#f1e6c4', stroke: INK, 'stroke-width': 1 }),
    svg('path', { d: 'M-16 -7 L0 -16 L16 -7 Z', fill: '#e9c46a', stroke: INK, 'stroke-width': 1.1 }),
    svg('path', { d: 'M15 -20 L16.5 -16.5 L20 -15 L16.5 -13.5 L15 -10 L13.5 -13.5 L10 -15 L13.5 -16.5 Z', fill: '#fff6c8', class: 'twinkle' }),
  );
  if (owner) g.append(pennant(-17, 12, owner));
  return g;
}

// A flag pole in the citizen's colour, with a passport stamp; centred on (0, 0) (owner's fix).
export function citizenFlag(colour: string): SVGGElement {
  return svg('g', {},
    svg('line', { x1: -12, y1: 15, x2: -12, y2: -17, stroke: INK, 'stroke-width': 2 }),
    svg('path', { d: 'M-12 -17 Q-4 -20 2 -16 T12 -15 L12 -3 Q6 -6 0 -4 T-12 -5 Z', fill: colour, stroke: INK, 'stroke-width': 1.2, class: 'wave-flag' }),
    svg('circle', { cx: 0, cy: 8, r: 7, fill: '#fbf3dc', stroke: '#7a3b8f', 'stroke-width': 1.6 }),
    svg('text', { x: 0, y: 8, 'font-size': 6.5, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#7a3b8f', 'font-weight': 700 }, 'VISA'),
  );
}

// A traveller pawn in the player's colour.
export function pawn(colour: string, active: boolean): SVGGElement {
  return svg('g', { class: active ? 'pawn active' : 'pawn' },
    svg('path', { d: 'M-9 15 Q-9 2 0 2 Q9 2 9 15 Z', fill: colour, stroke: '#fff', 'stroke-width': 2 }),
    svg('circle', { cx: 0, cy: -5, r: 7, fill: colour, stroke: '#fff', 'stroke-width': 2 }),
  );
}
