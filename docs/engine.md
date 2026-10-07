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

Task 2b: airports and ports (7 airports, 4 ports, 9 connections, 1–3 destinations each) and the
stuck-state checker (`src/engine/stuck-check.ts`). The checker proves on every test run:

- every area can be reached (walking, airports, ports);
- no single visa area (one area, or a whole big country) can trap anyone, because a player can
  always walk and can always travel free with the airline quiz;
- each of the 9 connections is needed.

Known limit (owner-approved): with 3–4 players, two visa areas at once can trap a player in
44 of 946 possible pairs, only while that player has fewer than 2 points. Event cards can give
the points back.

Task 4: wonder and big-country scoring (`tests/scoring.test.ts`).

- Wonder area, first visit: +1 area +1 wonder. Repeat visits give 0.
- Big country with N parts: each part gives 0 until every part is visited; the last new part
  gives +1 +N once (USA, Canada, China, Brazil, Australia, Russia: +3 each on this map).
- Visited parts are kept, so a player can leave halfway and continue later.
- The test board shows the points each move gives (✨ +N), 🧩 on big-country parts, and each
  player's big-country progress (e.g. "Canada 1/2").

Task 7: planes, ships, tickets and the airline quiz (`tests/travel.test.ts`).

- In an area with an airport or port, a player may walk on, **pay and board**, or **try the
  airline quiz**, for one of the destinations. Arriving there uses the turn, so boarding is
  always on a later turn (a start area counts as arrived: boarding on the first turn is fine).
- Destinations: the fixed routes. Luxury: any other airport by plane, any other port by ship
  (never a plane to a port).
- Ticket: Nomad 1, Business 2, Luxury 3. The Backpacker never pays (quiz only).
  "Pay" is offered only with enough points. Ticket money goes to nobody until task 9 (owners).
- Travel turns: plane 1, ship 3; Business and Luxury plane 0, ship 1. With 0 turns the player
  lands at the end of the boarding turn. Otherwise each travel turn is a `travel` move, and the
  player lands at the end of the last one, with the normal arrival points. Nomad +1 per travel
  turn. While travelling the player is in no area.
- Quiz: one a/b question about the destination (placeholder questions from the map data,
  `src/engine/quiz.ts`, until the facts are ready). The answer comes in the same turn.
  Right: free ticket, board now. Wrong: the turn ends. The 3rd wrong answer (or later) in the
  same area: pay and board now, if the player can pay; if not, keep trying on later turns or
  walk away. Leaving the area starts the count again. The Backpacker has no limit.
- The test board has a 15-second quiz timer; time out = wrong answer.
- 1,000 random-robot games on the 30-turn map: nobody stuck, about 6,000 paid trips and
  10,700 quiz tries, longest time in transit 6 turns.

Task 8: visas and citizenship (`tests/citizenship.test.ts`).

- **Asking.** There is no question on arrival. A move (walk, pay and board, or quiz) can carry
  a citizenship request, offered only where it is still possible: a new area (never the start
  area), nobody holds or is asking for that citizenship, the player has not asked before (once
  per game), and never the Digital Nomad. The test board shows it as a tick box on the move
  panel; moves marked 🛂 allow it. On a trip, the request is made on landing, if the area can
  still take it; otherwise it is dropped and the player keeps their one request.
- **Timeline** (owner's shorter version; the player stays in the area until it is granted):

  | Turn | Normal | Luxury |
  |---|---|---|
  | 1 (arrival) | asks; "request approved, the test is next turn" | asks; "granted next turn" |
  | 2 | 3 a/b questions from 3 different facts of the area, 15 s each (time out = wrong) | granted; moves |
  | 3 | all right: granted, moves; any wrong: "one more turn learning", stays | — |
  | 4 | wrong: right answers shown, granted, moves | — |

  Business +3 when citizenship is granted. Nothing is secret in v1, so the questions sit in the
  state (honour system).
- **Citizenship** covers the area, or every part of a big country. One citizen per area.
- **Visa:** 2 points to the citizen each time another player enters; moving inside a big
  country is free; the citizen enters free. Without 2 points the area can't be entered.
  The test board warns before a move into a visa area ("entering costs a 2-point visa, paid
  to …", Pay and enter / Cancel) and says afterwards who was paid.
- **By plane or ship:** boarding to a visa area needs the ticket plus 2 (the quiz: 2); the visa
  is paid on landing. A citizenship granted while the player is travelling costs nothing on
  landing.
- **Blocked:** if no neighbour can be entered (taken, or a visa the player can't pay) and
  there is no trip, the player gets the "blocked" turn.
- **Airline quiz** now uses the checked facts of the destination (task C); areas without facts
  (the test maps) still get placeholder questions.
- 1,000 random-robot games on the 30-turn map: about 2,200 citizenships and 1,400 visas, never
  two citizens in one area, longest "blocked" streak 4 turns, nobody stuck in the air.

Not yet: businesses, event cards, challenges.

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

## Choices made in task 4 (approved by the owner)

1. **Starting in a wonder gives no wonder point**, like the start area gives no area point
   (choice 1 above): the welcome bonus replaces both.
2. **A starting area inside a big country counts as a visited part.** Starting in USA East and
   walking to USA West gives the full +1 +2.
3. **The new-continent +2 is not all or nothing.** Entering Russia East (Asia) from Russia West
   gives +2 for Asia at once, even though Russia is not complete.

## Choices made in task 7 (approved by the owner)

1. **A right quiz answer boards at once** (same turn).
2. **The 3rd wrong answer pays and boards at once**, if the player can pay. Otherwise the
   player may keep trying on later turns or walk away; the count starts again on leaving.
3. **Destination taken at landing:** the plane or ship waits one more travel turn (Nomad +1)
   and tries again. Any destination can be chosen when boarding.
4. **Luxury "any":** plane to any airport, ship to any port.
5. **Boarding on the first turn** from a starting airport or port is allowed.

## Choices made in task 8 (approved by the owner)

1. **No study step:** the test is 3 questions, 15 seconds each. The right answers are shown in
   the extra turn after a wrong answer.
2. **The shorter timeline above** (asking on arrival is turn 1; granted and moving on turn 3,
   or turn 4 after a wrong answer), replacing the rulebook's "granted on turn 3 / turn 4".
3. **No repeated question:** the request is an option on the move, not a question each turn.
4. **One citizen per area or big country**, also while someone is asking there.
5. **No citizenship in the start area.**
6. **Visa by plane or ship:** ticket plus 2 to board; paid on landing; **a citizenship granted
   during the trip costs nothing on landing** (a player is never charged for a rule that did
   not exist when they left).
7. **On the tiny test map** (no airports or ports) the random robots never ask for
   citizenship, so its "blocked" check tests walking only; citizenship and visas are checked
   on the real map, with the full check, and by the rule tests.

## Project setup

- TypeScript, run directly by Node 22.18 or newer (no build step for tests).
- Only development tools: `typescript` and `@types/node`. No game dependencies.
- GitHub Actions (`.github/workflows/ci.yml`) runs the type check and tests on every pull request.
- Art from the owner: `assets/art/` (poster and background, landscape and portrait).
