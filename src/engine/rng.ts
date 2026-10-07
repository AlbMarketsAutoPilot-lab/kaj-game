// Seeded random numbers (mulberry32). The generator state is a plain number
// kept inside the game state, so the same seed always replays the same game.

export function nextRandom(seed: number): [value: number, next: number] {
  const next = (seed + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, next];
}

export function randomInt(seed: number, max: number): [value: number, next: number] {
  const [value, next] = nextRandom(seed);
  return [Math.floor(value * max), next];
}
