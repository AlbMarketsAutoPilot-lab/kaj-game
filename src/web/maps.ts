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
  centre: [number, number]; // centre of the biggest piece (for labels and markers)
}

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
    let best: Ring | null = null;
    let bestArea = -1;
    const parts: string[] = [];
    for (const poly of polys) {
      for (const ring of poly) {
        parts.push('M' + ring.map(([x, y]) => `${r1(x)} ${r1(-y)}`).join('L') + 'Z');
      }
      for (const [x, y] of poly[0]) {
        minx = Math.min(minx, x); maxx = Math.max(maxx, x);
        miny = Math.min(miny, -y); maxy = Math.max(maxy, -y);
      }
      const size = ringArea(poly[0]);
      if (size > bestArea) { bestArea = size; best = poly[0]; }
    }
    const [cx, cy] = best ? ringCentre(best) : [0, 0];
    out.set(a.id, { path: parts.join(''), box: { x: minx, y: miny, w: maxx - minx, h: maxy - miny }, centre: [cx, -cy] });
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
  unionBox(map.areas.filter((a: Area) => a.continent === c).map((a) => geo.get(a.id)!.box));
