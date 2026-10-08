// Area shapes for the screens (task 14). The data is a compact topology made by
// scripts/map-shapes.ts: neighbouring areas share the same border lines.

export interface Shapes {
  transform: { scale: [number, number]; translate: [number, number] };
  arcs: number[][][]; // delta-encoded quantized points
  areas: Record<string, { type: 'Polygon' | 'MultiPolygon'; arcs: number[][] | number[][][] }>;
}

// Longitude, latitude.
export type Point = [number, number];
export type Ring = Point[];

const decoded = new WeakMap<Shapes, Point[][]>();

function arcPoints(s: Shapes): Point[][] {
  let out = decoded.get(s);
  if (!out) {
    const [kx, ky] = s.transform.scale;
    const [dx, dy] = s.transform.translate;
    out = s.arcs.map((arc) => {
      let x = 0;
      let y = 0;
      return arc.map(([px, py]) => {
        x += px;
        y += py;
        return [x * kx + dx, y * ky + dy] as Point;
      });
    });
    decoded.set(s, out);
  }
  return out;
}

function ring(points: Point[][], arcs: number[]): Ring {
  const r: Ring = [];
  for (const i of arcs) {
    const arc = i < 0 ? points[~i].slice().reverse() : points[i];
    r.push(...(r.length ? arc.slice(1) : arc));
  }
  return r;
}

// Each polygon is a list of rings (the first is the outline, the rest are holes).
export function areaPolygons(s: Shapes, id: string): Ring[][] {
  const g = s.areas[id];
  if (!g) return [];
  const points = arcPoints(s);
  const polys = (g.type === 'Polygon' ? [g.arcs] : g.arcs) as number[][][];
  return polys.map((p) => p.map((r) => ring(points, r)));
}
