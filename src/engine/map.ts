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
