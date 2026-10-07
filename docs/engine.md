# KAJ rules engine

The engine has no screens. A game is a plain state object; it changes only through:

- `legalActions(state, map)` — every move allowed right now;
- `apply(state, map, action)` — the new state after that move (the old state is never changed).

Dice use a seed stored in the state, so the same seed replays the same game.
Code: `src/engine/`. Tests: `tests/` (`npm test`). Type check: `npm run typecheck`.

## What works now (task 1)

- 2–4 seats, human or robot (at least 1 human, at most 3 robots).
- Random first player, then a fixed order.
- Profiles: one per player, chosen in turn order; the last player gets the one left.
- Starting area: all starting continents different (6 choices, never Antarctica); welcome bonus
  Europe/Asia/Africa +3, North/South America +4, Oceania +5.
- Walking to a neighbouring area; two players never in the same area.
- Scoring: new area +1, repeat 0, first arrival on a new continent +2 (not the start continent);
  points never below 0.
- End after 30 rounds; winner by points, then continents, then areas (a full tie is a draw).
- Random robot, and a check that plays 1,000 random games (nobody stuck, points ≥ 0,
  never two players in one area).
- A tiny made-up test map (`tests/fixtures/test-map.ts`), not real geography.

Task 2a: the 30-turn map data (`src/maps/map30.ts`, table in [`map-30.md`](map-30.md)).

Not yet: planes and ships, quizzes, visas, citizenship, businesses, big countries,
wonders, event cards, challenges, screens, Android app.

## Choices made in task 1 (approved by the owner)

These points are not spelled out in the rulebook or the v1 scope.

1. **The starting area counts as visited but gives no +1.** The welcome bonus replaces it.
   Returning there later gives 0.
2. **"30 turns" means 30 rounds**: every player gets 30 turns.
3. **"Blocked" turn.** If every neighbouring area is taken by other players, the player's only
   move is "blocked": the turn ends with no points. Without it the game could freeze.
   In 1,000 test games the longest wait was 3 turns.
4. **Starting continent and starting area are one engine move** (choosing the area also
   chooses its continent). The screens can still show two steps (continent, then zoom in).

## Project setup

- TypeScript, run directly by Node 22.18 or newer (no build step for tests).
- Only development tools: `typescript` and `@types/node`. No game dependencies.
- GitHub Actions (`.github/workflows/ci.yml`) runs the type check and tests on every pull request.
- Art from the owner: `assets/art/` (poster and background, landscape and portrait).
