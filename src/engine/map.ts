import { MAX_DESTINATIONS } from './constants.ts';
import type { Area, GameMap } from './types.ts';

const CONTINENTS = new Set([
  'Europe',
  'Asia',
  'Africa',
  'North America',
  'South America',
  'Oceania',
  'Antarctica',
]);

// Returns a list of problems; an empty list means the map is valid.
export function validateMap(map: GameMap): string[] {
  const problems: string[] = [];
  const byId = new Map<string, Area>();

  for (const area of map.areas) {
    if (byId.has(area.id)) problems.push(`duplicate area id: ${area.id}`);
    byId.set(area.id, area);
    if (!CONTINENTS.has(area.continent)) {
      problems.push(`${area.id}: unknown continent ${area.continent}`);
    }
  }

  for (const area of map.areas) {
    for (const n of area.neighbours) {
      const other = byId.get(n);
      if (!other) problems.push(`${area.id}: unknown neighbour ${n}`);
      else if (n === area.id) problems.push(`${area.id}: neighbour of itself`);
      else if (!other.neighbours.includes(area.id)) {
        problems.push(`${area.id} -> ${n} is one-way`);
      }
    }
  }

  // An area has at most one airport and one port. Each has 1 to 3 fixed destinations
  // (v1 scope section 4); the traveller chooses one when boarding.
  const destinations = new Map<string, string[]>();
  for (const r of map.routes ?? []) {
    if (r.a === r.b) problems.push(`${r.kind} ${r.a}: route to itself`);
    for (const [from, to] of r.oneWay ? [[r.a, r.b]] : [[r.a, r.b], [r.b, r.a]]) {
      if (!byId.has(from)) problems.push(`${r.kind}: unknown area ${from}`);
      const key = `${from} ${r.kind}`;
      const list = destinations.get(key) ?? [];
      if (list.includes(to)) problems.push(`${key}: route to ${to} listed twice`);
      destinations.set(key, [...list, to]);
    }
  }
  for (const [key, list] of destinations) {
    if (list.length > MAX_DESTINATIONS) problems.push(`${key}: ${list.length} destinations (max ${MAX_DESTINATIONS})`);
  }

  return problems;
}

// Groups of areas joined by walking. Airports and ports must link these groups.
export function walkingGroups(map: GameMap): string[][] {
  const byId = new Map(map.areas.map((a) => [a.id, a]));
  const seen = new Set<string>();
  const groups: string[][] = [];
  for (const area of map.areas) {
    if (seen.has(area.id)) continue;
    const group = [area.id];
    seen.add(area.id);
    for (let i = 0; i < group.length; i++) {
      for (const n of byId.get(group[i])!.neighbours) {
        if (!seen.has(n)) {
          seen.add(n);
          group.push(n);
        }
      }
    }
    groups.push(group);
  }
  return groups;
}

export function areaById(map: GameMap, id: string): Area {
  const area = map.areas.find((a) => a.id === id);
  if (!area) throw new Error(`Unknown area: ${id}`);
  return area;
}
