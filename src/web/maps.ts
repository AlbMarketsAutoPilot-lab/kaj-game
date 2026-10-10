// Drawn maps for the screens (task 14, session A2): real area shapes as SVG.
// Coordinates: x = longitude, y = −latitude (a plain world map). Close-up views squeeze
// x by cos(latitude) so areas keep their real proportions.

import type { Area, Continent, GameMap } from '../engine/types.ts';
import { arcPoints, areaPolygons, type Ring } from '../maps/shapes.ts';
import type { Shapes } from '../maps/shapes.ts';

const SVG = 'http://www.w3.org/2000/svg';

export interface Box { x: number; y: number; w: number; h: number }

export interface AreaGeo {
  path: string; // SVG path in world units
  box: Box; // bounding box of the whole area
  core: Box; // the box to zoom to: far-away parts left out (Greenland, Alaska, small islands)
  centre: [number, number]; // centre of the biggest piece of the core (for icons and markers)
  touches: string[]; // areas that share a border line on the map
  // A point in the middle of the border shared with each touching area (x, y as in `path`).
  borderWith: Map<string, [number, number]>;
  // The outer rings of every piece (x, y as in `path`), to tell which area a point is in.
  rings: Ring[];
}

// Parts drawn but ignored for zooming and icons (owner's choice, task 14 B1):
// Greenland in Scandinavia, Hawaii in USA West (Alaska is its own area since task 14b). x = longitude.
const OUTLYING: Record<string, (x: number) => boolean> = {
  scandinavia: (x) => x < -11,
  'usa-west': (x) => x < -129,
};

export function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, ...children: (Node | string)[]): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  node.append(...children);
  return node;
}

function ringArea(r: Ring): number {
  let a = 0;
  for (let i = 0; i < r.length; i++) {
    const [x1, y1] = r[i];
    const [x2, y2] = r[(i + 1) % r.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
}

function ringCentre(r: Ring): [number, number] {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < r.length; i++) {
    const [x1, y1] = r[i];
    const [x2, y2] = r[(i + 1) % r.length];
    const f = x1 * y2 - x2 * y1;
    a += f;
    cx += (x1 + x2) * f;
    cy += (y1 + y2) * f;
  }
  if (Math.abs(a) < 1e-9) return r[0];
  return [cx / (3 * a), cy / (3 * a)];
}

const r1 = (n: number) => Math.round(n * 10) / 10;

function inside(r: Ring, x: number, y: number): boolean {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i];
    const [xj, yj] = r[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function edgeDistance(r: Ring, x: number, y: number): number {
  let best = Infinity;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [ax, ay] = r[j];
    const [bx, by] = r[i];
    const dx = bx - ax;
    const dy = by - ay;
    const t = dx || dy ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))) : 0;
    best = Math.min(best, Math.hypot(x - ax - t * dx, y - ay - t * dy));
  }
  return best;
}

// The point deepest inside a shape (task 14 B2 fix: the pawn and icons stay inside their area,
// even for curved shapes whose centre of mass lies outside). A grid search, refined twice.
function deepestPoint(r: Ring): [number, number] {
  const xs = r.map(([x]) => x);
  const ys = r.map(([, y]) => y);
  let [cx, cy] = ringCentre(r);
  let best = inside(r, cx, cy) ? edgeDistance(r, cx, cy) : -1;
  let w = Math.max(...xs) - Math.min(...xs);
  let h = Math.max(...ys) - Math.min(...ys);
  let x0 = Math.min(...xs);
  let y0 = Math.min(...ys);
  for (let round = 0; round < 3; round++) {
    const n = 20;
    let bx = cx;
    let by = cy;
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const x = x0 + (w * i) / n;
        const y = y0 + (h * j) / n;
        if (!inside(r, x, y)) continue;
        const d = edgeDistance(r, x, y);
        if (d > best) { best = d; bx = x; by = y; }
      }
    }
    cx = bx; cy = by;
    w /= 5; h /= 5;
    x0 = cx - w / 2; y0 = cy - h / 2;
  }
  return [cx, cy];
}

export function buildGeo(map: GameMap, shapes: Shapes): Map<string, AreaGeo> {
  const out = new Map<string, AreaGeo>();
  for (const a of map.areas) {
    let polys = areaPolygons(shapes, a.id);
    // Islands drawn across the date line (e.g. New Zealand's Chatham Islands) move next to the rest.
    const main = polys.reduce((m, p) => (ringArea(p[0]) > ringArea(m[0]) ? p : m), polys[0]);
    const mx = main ? ringCentre(main[0])[0] : 0;
    polys = polys.map((poly) => {
      const shift = ringCentre(poly[0])[0] - mx > 180 ? -360 : mx - ringCentre(poly[0])[0] > 180 ? 360 : 0;
      return shift ? poly.map((ring) => ring.map(([x, y]) => [x + shift, y] as [number, number])) : poly;
    });
    let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
    const parts: string[] = [];
    for (const poly of polys) {
      for (const ring of poly) {
        parts.push('M' + ring.map(([x, y]) => `${r1(x)} ${r1(-y)}`).join('L') + 'Z');
      }
      for (const [x, y] of poly[0]) {
        minx = Math.min(minx, x); maxx = Math.max(maxx, x);
        miny = Math.min(miny, -y); maxy = Math.max(maxy, -y);
      }
    }
    // The core: the pieces that are not outlying, without the tiny islands.
    const outlying = OUTLYING[a.id];
    const kept = polys.filter((p) => !outlying?.(ringCentre(p[0])[0]));
    const sizes = kept.map((p) => ringArea(p[0]));
    const biggest = Math.max(...sizes);
    const best: Ring | null = kept[sizes.indexOf(biggest)]?.[0] ?? null;
    const corePoints = kept.filter((_, i) => sizes[i] >= biggest * 0.03).flatMap((p) => p[0]);
    const xs = corePoints.map(([x]) => x);
    const ys = corePoints.map(([, y]) => -y);
    const core = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    const [cx, cy] = best ? deepestPoint(best) : [0, 0];
    const rings = polys.map((poly) => poly[0].map(([x, y]) => [x, -y] as [number, number]));
    out.set(a.id, { path: parts.join(''), box: { x: minx, y: miny, w: maxx - minx, h: maxy - miny }, core, centre: [cx, -cy], touches: [], borderWith: new Map(), rings });
  }
  // Areas that share a border line in the topology touch each other.
  const byArc = new Map<number, string[]>();
  for (const a of map.areas) {
    const g = shapes.areas[a.id];
    if (!g) continue;
    for (const i of new Set((g.arcs as unknown[]).flat(3) as number[])) {
      const k = i < 0 ? ~i : i;
      byArc.set(k, [...(byArc.get(k) ?? []), a.id]);
    }
  }
  const points = arcPoints(shapes);
  const longest = new Map<string, number[][]>(); // "a b" -> the longest shared arc
  for (const [k, ids] of byArc) {
    for (const id of ids) {
      const t = out.get(id)!.touches;
      for (const other of ids) {
        if (other === id) continue;
        if (!t.includes(other)) t.push(other);
        const key = `${id} ${other}`;
        if ((longest.get(key)?.length ?? 0) < points[k].length) longest.set(key, points[k]);
      }
    }
  }
  for (const [key, arc] of longest) {
    const [id, other] = key.split(' ');
    const [x, y] = arc[Math.floor(arc.length / 2)];
    out.get(id)!.borderWith.set(other, [x, -y]);
  }
  return out;
}

export function unionBox(boxes: Box[]): Box {
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  const x2 = Math.max(...boxes.map((b) => b.x + b.w));
  const y2 = Math.max(...boxes.map((b) => b.y + b.h));
  return { x, y, w: x2 - x, h: y2 - y };
}

export function pad(b: Box, f: number, min = 0): Box {
  const px = Math.max(b.w * f, min);
  const py = Math.max(b.h * f, min);
  return { x: b.x - px, y: b.y - py, w: b.w + 2 * px, h: b.h + 2 * py };
}

// Horizontal squeeze for a close view around this latitude (y = −latitude).
export function squeeze(b: Box): number {
  const lat = -(b.y + b.h / 2);
  return Math.max(0.35, Math.cos((lat * Math.PI) / 180));
}

export const continentBox = (map: GameMap, geo: Map<string, AreaGeo>, c: Continent): Box =>
  unionBox(map.areas.filter((a: Area) => a.continent === c).map((a) => geo.get(a.id)!.core));

// Risk-style colours (owner's choice, task 14 B1): areas that touch or are walking neighbours
// never share a colour. The areas with the most neighbours are coloured first.
export const AREA_COLOURS = ['#e8a33d', '#d65f4e', '#8e6bbf', '#4aa3df', '#5cb85c', '#e3cf52', '#c47a55', '#d470a8'];

export function colourAreas(map: GameMap, geo: Map<string, AreaGeo>): Map<string, string> {
  const near = new Map(map.areas.map((a) => [a.id, new Set([...a.neighbours, ...geo.get(a.id)!.touches])]));
  for (const [id, set] of near) for (const n of set) near.get(n)?.add(id);
  const order = [...map.areas].sort((a, b) => near.get(b.id)!.size - near.get(a.id)!.size || a.id.localeCompare(b.id));
  const index = new Map<string, number>();
  const count = AREA_COLOURS.map(() => 0);
  for (const a of order) {
    const used = new Set([...near.get(a.id)!].map((n) => index.get(n)));
    // The least-used free colour, so all colours appear evenly.
    const free = AREA_COLOURS.map((_, i) => i).filter((i) => !used.has(i));
    const c = free.reduce((m, i) => (count[i] < count[m] ? i : m), free[0]);
    count[c]++;
    index.set(a.id, c);
  }
  return new Map([...index].map(([id, c]) => [id, AREA_COLOURS[c]]));
}

// ---------- drawn props inside their own area (owner, M5) ----------

// The area a point is in (x, y as in `path`), or null for the sea.
export function areaAt(geo: Map<string, AreaGeo>, x: number, y: number): string | null {
  for (const [id, g] of geo) {
    const b = g.box;
    if (x < b.x || x > b.x + b.w || y < b.y || y > b.y + b.h) continue;
    if (g.rings.some((r) => inside(r, x, y))) return id;
  }
  return null;
}

export type PropKind = 'wonder' | 'citizen' | 'airport' | 'port' | 'station' | 'bus';

// Where each drawn prop of an area goes, around the pawn at the area's centre (view units: x is
// multiplied by k; P is the prop size). Owner's rule (M5): a prop never sits over another area, so
// it never looks like that area's. A port goes in the sea next to its area when it can; the others
// inside their own area. Each prop tries its usual side first (airport left, port right, wonder and
// flag above, station and bus below), then turns around the pawn and moves out step by step.
const PREFERRED: Record<PropKind, number> = { wonder: -90, citizen: -90, airport: 180, port: 0, station: 180, bus: 90 };
export function propSpots(geo: Map<string, AreaGeo>, focus: string, kinds: PropKind[], P: number, k: number): Map<PropKind, [number, number]> {
  const [cx0, cy] = geo.get(focus)!.centre;
  const cx = cx0 * k;
  const taken: [number, number, number][] = [[cx, cy, P * 0.55]]; // the pawn
  const spots = new Map<PropKind, [number, number]>();
  const owner = (x: number, y: number) => areaAt(geo, x / k, y);
  const half = P * 0.42;
  const samples = (x: number, y: number): [number, number][] =>
    [[x, y], [x - half, y - half], [x + half, y - half], [x - half, y + half], [x + half, y + half]];
  const free = (x: number, y: number) => taken.every(([tx, ty, r]) => Math.hypot(tx - x, ty - y) > r + P * 0.5);
  for (const kind of kinds) {
    const start = PREFERRED[kind];
    const angles = [0, 30, -30, 60, -60, 90, -90, 120, -120, 150, -150, 180].map((a) => ((start + a) * Math.PI) / 180);
    const candidates: [number, number][] = [];
    for (const r of [1.15, 1.45, 1.8, 2.2, 2.7, 3.3]) for (const a of angles) candidates.push([cx + Math.cos(a) * r * P, cy + Math.sin(a) * r * P]);
    const ok = (x: number, y: number, centre: 'own' | 'sea' | 'any') => {
      if (!free(x, y)) return false;
      const at = samples(x, y).map(([sx, sy]) => owner(sx, sy));
      if (at.some((id) => id !== null && id !== focus)) return false;
      return centre === 'any' || (centre === 'own' ? at[0] === focus : at[0] === null);
    };
    const tries: ('own' | 'sea' | 'any')[] = kind === 'port' ? ['sea', 'any'] : ['own', 'any'];
    let spot: [number, number] | undefined;
    for (const t of tries) { spot = candidates.find(([x, y]) => ok(x, y, t)); if (spot) break; }
    spot ??= candidates.find(([x, y]) => free(x, y)) ?? candidates[0];
    taken.push([spot[0], spot[1], P * 0.5]);
    spots.set(kind, spot);
  }
  return spots;
}
