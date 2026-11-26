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
  // Owner (step 2.12b): the border lines shared with another part of the same big country, by that part's id
  // (only from the part listed first on the map), as SVG paths in world units.
  inner: Map<string, string>;
}

// Parts drawn but ignored for zooming and icons (owner's choice, task 14 B1):
// Greenland in Scandinavia, Hawaii in USA West (Alaska is its own area since task 14b). x = longitude.
const OUTLYING: Record<string, (x: number) => boolean> = {
  scandinavia: (x) => x < -11,
  denmark: (x) => x < -11, // 100-turn map (step 2.12 J5): Greenland, as for Scandinavia on the 50-turn map
  'usa-west': (x) => x < -129,
};

// Is a point (longitude) on an area's far-away part? The map names never go there (owner, step 2.12 J5).
export const isOutlying = (id: string, x: number): boolean => OUTLYING[id]?.(x) ?? false;

export function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, ...children: (Node | string)[]): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  node.append(...children);
  return node;
}

// The glow around the area you stand in (2026-10-10): two soft lines over its edge, which keep
// their width on screen at any zoom. A CSS drop-shadow grew with the zoom instead, and on phones a
// small, zoomed-in area (Egypt) flickered under a popup.
export function glowFor(shapes: SVGGElement): SVGGElement {
  const g = svg('g', { transform: shapes.getAttribute('transform') ?? '' });
  for (const p of shapes.querySelectorAll('.land.here')) {
    for (const size of ['wide', 'narrow']) g.append(svg('path', { d: p.getAttribute('d')!, class: `halo ${size}` }));
  }
  return g;
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

// `centres`: the pawn spots made in advance by scripts/map-centres.ts (src/maps/centres.ts), so a
// phone does not search for them while the player waits (Google Play review, 2026-10-14: a slow
// phone froze 3.5 to 5 s). Without it, they are found here (scripts, tests).
export function buildGeo(map: GameMap, shapes: Shapes, centres?: Readonly<Record<string, readonly [number, number]>>): Map<string, AreaGeo> {
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
    const made = centres?.[a.id];
    const [cx, cy] = made ? [made[0], -made[1]] : best ? deepestPoint(best) : [0, 0];
    const rings = polys.map((poly) => poly[0].map(([x, y]) => [x, -y] as [number, number]));
    out.set(a.id, { path: parts.join(''), box: { x: minx, y: miny, w: maxx - minx, h: maxy - miny }, core, centre: [cx, -cy], touches: [], borderWith: new Map(), rings, inner: new Map() });
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
  // Borders inside a big country (step 2.12b), drawn thin and dashed.
  const order = new Map(map.areas.map((a, i) => [a.id, i]));
  const big = new Map(map.areas.map((a) => [a.id, a.bigCountry]));
  for (const [k, ids] of byArc) {
    if (ids.length !== 2 || !big.get(ids[0]) || big.get(ids[0]) !== big.get(ids[1])) continue;
    const [a, b] = ids.sort((x, y) => order.get(x)! - order.get(y)!);
    const inner = out.get(a)!.inner;
    inner.set(b, (inner.get(b) ?? '') + 'M' + points[k].map(([x, y]) => `${r1(x)} ${r1(-y)}`).join('L'));
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
// Names on the map (owner, 2026-11-25): for the drawing only; the engine and every other screen keep the area's name.
export const MAP_NAME: Readonly<Record<string, string>> = { 'serbia-kosovo-macedonia': 'Central Balkans', somalia: 'Horn of Africa' };

// The ways to write a name on the map, best first (owner, 2026-11-25): the whole name on one line, then on 2 or 3 lines
// (split after "," or "&"), then the same with North, South, West and East shortened to N., S., W. and E.
export function nameLayouts(name: string): string[][] {
  const ways = (n: string): string[][] => {
    const parts = n.split(/(?<=,|&) /);
    const two: string[][] = [];
    const three: string[][] = [];
    for (let i = 1; i < parts.length; i++) two.push([parts.slice(0, i).join(' '), parts.slice(i).join(' ')]);
    for (let i = 1; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
      three.push([parts.slice(0, i).join(' '), parts.slice(i, j).join(' '), parts.slice(j).join(' ')]);
    }
    const widest = (l: string[]) => Math.max(...l.map((x) => [...x].length));
    return [[n], ...two.sort((a, b) => widest(a) - widest(b)), ...three.sort((a, b) => widest(a) - widest(b))];
  };
  const short = name.replace(/\b(North|South|West|East)\b/g, (w) => `${w[0]}.`);
  return short === name ? ways(name) : [...ways(name), ...ways(short)];
}

// Owner (step 2.12b): teal and light green added, so that areas across the sea can differ too.
export const AREA_COLOURS = ['#e8a33d', '#d65f4e', '#8e6bbf', '#4aa3df', '#5cb85c', '#e3cf52', '#c47a55', '#d470a8', '#26a69a', '#abdda4'];

// Owner (step 2.12b): the borders between the parts of a big country, thin and dashed, for the areas drawn (`ids`). A
// line in the country's colour covers the normal border first; where a part glows (you stand there, can walk there,
// or have been there in the guide) the dashes go over the gold line instead, so both show. Put it inside the group of
// the area shapes (same scale).
export function innerBorders(geo: Map<string, AreaGeo>, ids: Iterable<string>, fill: (id: string) => string, cls: (id: string) => string): SVGGElement {
  const g = svg('g', { class: 'inner' });
  const drawn = new Set(ids);
  const glows = (id: string) => /\b(here|go|picked)\b/.test(cls(id));
  for (const id of drawn) {
    for (const [other, d] of geo.get(id)!.inner) {
      if (!drawn.has(other)) continue;
      if (!glows(id) && !glows(other)) {
        const cover = svg('path', { d, class: `land ${cls(id)} inner-cover` });
        cover.style.stroke = fill(id);
        g.append(cover);
      }
      g.append(svg('path', { d, class: 'inner-dash' }));
    }
  }
  return g;
}

// Owner (step 2.12b): areas closer than this across the sea never share a colour (Madagascar and Mozambique).
export const SEA_KM = 500;

// Area colours (owner, step 2.12b): every part of a big country has the same colour, and no two areas share a colour
// when they touch on the map, have a walking link, a plane or ship route, or lie within SEA_KM across the sea. The
// most constrained group is coloured first (DSatur), each with the least-used free colour (all colours appear evenly).
// Made once per map by scripts/map-centres.ts (src/maps/colours.ts); the game reads the stored colours.
export function colourAreas(map: GameMap, geo: Map<string, AreaGeo>): Map<string, string> {
  const group = new Map(map.areas.map((a) => [a.id, a.bigCountry ? `big:${a.bigCountry}` : a.id]));
  const groups = [...new Set(group.values())];
  const near = new Map(groups.map((g) => [g, new Set<string>()]));
  const link = (a: string, b: string) => {
    const ga = group.get(a);
    const gb = group.get(b);
    if (!ga || !gb || ga === gb) return;
    near.get(ga)!.add(gb);
    near.get(gb)!.add(ga);
  };
  for (const a of map.areas) {
    for (const n of a.neighbours) link(a.id, n);
    for (const t of geo.get(a.id)!.touches) link(a.id, t);
  }
  for (const r of map.routes ?? []) if (r.kind === 'airport' || r.kind === 'port') link(r.a, r.b);
  // Across the sea: any two points of the outlines closer than SEA_KM (x = longitude, y = −latitude; 111 km a degree),
  // also across the date line (Alaska and Russia Far East).
  const m = SEA_KM / 111;
  const ids = map.areas.map((a) => a.id);
  const boxNear = (A: Box, B: Box) => [-360, 0, 360].some((s) =>
    !(A.x - m > B.x + s + B.w || B.x + s - m > A.x + A.w || A.y - m > B.y + B.h || B.y - m > A.y + A.h));
  const dx = (x1: number, x2: number) => { const d = Math.abs(x1 - x2) % 360; return Math.min(d, 360 - d); };
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    if (!boxNear(geo.get(ids[i])!.box, geo.get(ids[j])!.box)) continue;
    if (group.get(ids[i]) === group.get(ids[j]) || near.get(group.get(ids[i])!)!.has(group.get(ids[j])!)) continue;
    const pb = geo.get(ids[j])!.rings.flat();
    const close = geo.get(ids[i])!.rings.flat().some(([x1, y1]) => {
      const c = Math.cos((y1 * Math.PI) / 180);
      return pb.some(([x2, y2]) => Math.hypot(dx(x1, x2) * c, y1 - y2) * 111 < SEA_KM);
    });
    if (close) link(ids[i], ids[j]);
  }
  // The most constrained group first: the most different colours already next to it, then the most neighbours.
  const index = new Map<string, number>();
  const count = AREA_COLOURS.map(() => 0);
  const usedNear = (g: string) => new Set([...near.get(g)!].map((n) => index.get(n)).filter((i) => i !== undefined));
  while (index.size < groups.length) {
    const g = groups.filter((x) => !index.has(x)).reduce((best, x) => {
      const d = usedNear(x).size - usedNear(best).size || near.get(x)!.size - near.get(best)!.size || best.localeCompare(x);
      return d > 0 ? x : best;
    });
    const used = usedNear(g);
    const free = AREA_COLOURS.map((_, i) => i).filter((i) => !used.has(i));
    if (free.length === 0) throw new Error(`No colour left for ${g} on ${map.id}`);
    const c = free.reduce((best, i) => (count[i] < count[best] ? i : best), free[0]);
    count[c]++;
    index.set(g, c);
  }
  return new Map(map.areas.map((a) => [a.id, AREA_COLOURS[index.get(group.get(a.id)!)!]]));
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

export type PropKind = 'wonder' | 'citizen' | 'airport' | 'port' | 'station' | 'bus' | 'car';

// Where each drawn prop of an area goes, around the pawn at the area's centre (view units: x is
// multiplied by k; P is the prop size). Owner's rule (M5): a prop never sits over another area, so
// it never looks like that area's. A port goes in the sea next to its area when it can; the others
// inside their own area. Each prop tries its usual side first (airport left, port right, wonder and
// flag above, station, bus and car below), then turns around the pawn and moves out step by step.
const PREFERRED: Record<PropKind, number> = { wonder: -90, citizen: -90, airport: 180, port: 0, station: 180, bus: 90, car: 90 };
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
