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

  // Walking only for now: every area must be reachable from every other.
  // Airports and ports will join this check when they are added.
  if (map.areas.length > 0 && problems.length === 0) {
    const seen = new Set([map.areas[0].id]);
    const queue = [map.areas[0].id];
    while (queue.length > 0) {
      for (const n of byId.get(queue.shift()!)!.neighbours) {
        if (!seen.has(n)) {
          seen.add(n);
          queue.push(n);
        }
      }
    }
    for (const area of map.areas) {
      if (!seen.has(area.id)) problems.push(`${area.id}: unreachable`);
    }
  }

  return problems;
}

export function areaById(map: GameMap, id: string): Area {
  const area = map.areas.find((a) => a.id === id);
  if (!area) throw new Error(`Unknown area: ${id}`);
  return area;
}
