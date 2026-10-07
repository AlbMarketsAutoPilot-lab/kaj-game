import type { GameMap } from './types.ts';

// Stuck-state checker for a map (rulebook sections 7 and 11, v1 scope section 4).
//
// A visa area is everything one citizenship covers: one area, or every part of a
// big country. A player who can't pay a visa can't enter it, but can always walk,
// and can always fly or sail for free with the airline quiz (unlimited tries).
// So a player is never trapped by one visa area if the map stays connected
// (walking + airports + ports) after that visa area is taken out.
// Every single area is checked this way, so this also covers a guided-tours area whose 1-point
// fee the player can't pay (task 9). Anything worse ends with "go home" (docs/engine.md).

// Every citizenship that can exist on the map, as a list of area ids.
export function visaUnits(map: GameMap): string[][] {
  const big = new Map<string, string[]>();
  const units: string[][] = [];
  for (const a of map.areas) {
    if (a.bigCountry) big.set(a.bigCountry, [...(big.get(a.bigCountry) ?? []), a.id]);
    else units.push([a.id]);
  }
  return [...units, ...big.values()];
}

// Groups of areas that can reach each other without entering `blocked`,
// by walking, airports and ports.
export function travelGroups(map: GameMap, blocked: ReadonlySet<string> = new Set()): string[][] {
  const links = new Map<string, string[]>(map.areas.map((a) => [a.id, [...a.neighbours]]));
  for (const r of map.routes ?? []) {
    links.get(r.a)!.push(r.b);
    links.get(r.b)!.push(r.a);
  }
  const seen = new Set<string>();
  const groups: string[][] = [];
  for (const area of map.areas) {
    if (seen.has(area.id) || blocked.has(area.id)) continue;
    const group = [area.id];
    seen.add(area.id);
    for (let i = 0; i < group.length; i++) {
      for (const n of links.get(group[i])!) {
        if (!seen.has(n) && !blocked.has(n)) {
          seen.add(n);
          group.push(n);
        }
      }
    }
    groups.push(group);
  }
  return groups;
}

// Returns a list of problems; an empty list means:
// - every area can be reached from every other (no unreachable island), and
// - no single visa area can cut any area off from the rest of the map.
export function stuckProblems(map: GameMap): string[] {
  const problems: string[] = [];
  const all = travelGroups(map);
  if (all.length > 1) {
    for (const g of all.slice(1)) problems.push(`unreachable: ${g.join(', ')}`);
  }
  for (const unit of visaUnits(map)) {
    const groups = travelGroups(map, new Set(unit));
    // The biggest group is "the rest of the map"; every other group is trapped.
    groups.sort((x, y) => y.length - x.length);
    for (const g of groups.slice(1)) problems.push(`visa in ${unit.join(' + ')} traps: ${g.join(', ')}`);
  }
  return problems;
}
