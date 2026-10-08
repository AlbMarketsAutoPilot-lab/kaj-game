// Drawn maps for the screens (task 14, session A2): real area shapes as SVG.
// Coordinates: x = longitude, y = −latitude (a plain world map). Close-up views squeeze
// x by cos(latitude) so areas keep their real proportions.

import type { Area, Continent, GameMap } from '../engine/types.ts';
import { areaPolygons, type Ring } from '../maps/shapes.ts';
import type { Shapes } from '../maps/shapes.ts';

const SVG = 'http://www.w3.org/2000/svg';

export interface Box { x: number; y: number; w: number; h: number }

export interface AreaGeo {
  path: string; // SVG path in world units
  box: Box; // bounding box of the whole area
  core: Box; // the box to zoom to: far-away parts left out (Greenland, Alaska, small islands)
  centre: [number, number]; // centre of the biggest piece of the core (for icons and markers)
  touches: string[]; // areas that share a border line on the map
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
    const [cx, cy] = best ? ringCentre(best) : [0, 0];
    out.set(a.id, { path: parts.join(''), box: { x: minx, y: miny, w: maxx - minx, h: maxy - miny }, core, centre: [cx, -cy], touches: [] });
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
  for (const ids of byArc.values()) {
    for (const id of ids) {
      const t = out.get(id)!.touches;
      for (const other of ids) if (other !== id && !t.includes(other)) t.push(other);
    }
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
