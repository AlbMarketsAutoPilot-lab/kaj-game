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
- each of the 9 connections is needed (since task 9b: checked on the original 9-connection map;
  the 2 added connections are extra by design).

Known limit (owner-approved): with 3–4 players, two visa areas at once can trap a player in
44 of 946 possible pairs (21 since task 9b's 2 new connections), only while that player has
fewer than 2 points. Event cards can give
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
  (Changed in task 13: 3 tries for everyone; after the 3rd wrong answer a player who can't pay goes home.)
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
  is paid on landing (since task 11: at boarding). A citizenship granted while the player is travelling costs nothing on
  landing.
- **Blocked:** if no neighbour can be entered (taken, or a visa the player can't pay) and
  there is no trip, the player gets the "blocked" turn.
- **Airline quiz** now uses the checked facts of the destination (task C); areas without facts
  (the test maps) still get placeholder questions.
- 1,000 random-robot games on the 30-turn map: about 2,200 citizenships and 1,400 visas, never
  two citizens in one area, longest "blocked" streak 4 turns, nobody stuck in the air.

Task 9: businesses, strict fees and "go home" (`tests/business.test.ts`).

- **Businesses:** 🏛️ guided tours at each wonder (2), ✈️ airline at each airport (3), ⛴️ ferry
  agency at each port (2): 18 on the 30-turn map.
- **Buying:** the player standing in the area may buy, on any turn they begin there (a start area
  counts), if nobody owns it and they have the price. It is an option on the move panel and does
  not end the turn. Two players are never in one area, so the first to arrive has the first
  chance (⭐ "first here" on the test board); whoever arrives next may buy if they didn't.
  No limit per player. No selling yet (task 9b).
- **Tour fee:** 1 point to the owner each time another player enters the wonder area (walking or
  landing). The owner enters free.
- **Tickets:** a paid ticket goes to the owner of the departure airline or ferry agency (also the
  forced payment after the 3rd wrong quiz answer). The owner pays their own ticket to themselves
  (they still need it in hand). The free quiz ticket and Backpacker trips pay nobody. No owner:
  the ticket goes to nobody.
- **Strict fees (owner's rule):** no money, no entry. A visa (2) and a tour fee (1) must both be
  in hand to enter (3 if both); boarding needs the ticket plus the fees, the quiz needs the fees.
  Fees for a trip are paid on landing (since task 11: at boarding). Exception: a citizenship granted or tours bought while the
  player is travelling cost nothing on landing.
- **End score:** points plus the price of every business owned (owner's rule). Ties as before.
- **Go home (owner's rule):** a player whose only move is "blocked" and who has at least one way
  out closed by money (not only by players in the way) gets a warning: on the 1st and 2nd such
  turn in a row "Out of money… in N turns you go home"; on the 3rd the move is "go home". The
  player goes to their starting area (if someone stands there: the nearest free area), free of
  any fees, with the normal arrival points (usually 0). Any other move ends the count. Everyone
  plays to the end (no elimination). Event cards (task 11) and selling (task 9b) will be the ways
  to get money back during the countdown.
- The engine lists the payments of the last move (`state.payments`), so the screens say who was
  paid. The test board warns before a move with fees (visa and tour fee in one box), shows the
  ticket owner on the "Pay" buttons and in the quiz, and the businesses on the map and players.
- 1,000 random-robot games on the 30-turn map: about 3,700 businesses bought (1,700 tours,
  1,400 airlines, 700 ferry agencies), 580 points of tour fees and 780 points of tickets paid to
  other players, about 1,400 visas, longest "blocked" streak 4 turns, nobody stuck. Random robots
  were never blocked by money, so nobody went home; "go home" is checked by the rule tests.
- The stuck-state checker needs no change: every single area is already checked as a closed
  area, which covers a tour area as well as a visa area; going home covers the rest.

Task 9b: selling, and 2 areas with both an airport and a port (`tests/business.test.ts`,
`tests/map30.test.ts`).

- **Selling:** on their own turn, before moving, a player may offer any business they own (wherever
  it is) to another player who can pay the price it was bought for. The buyer answers Yes or No
  on the same screen; the seller's turn goes on either way. One offer per turn. Not on travel or
  citizenship turns, and never to a player in the air or at sea (they may owe a fee on landing).
  The test board's robots accept whenever they can pay; the random robot answers at random.
  The "out of money" warning suggests selling when the player owns a business.
- **Map:** UK & Ireland ✈️ ↔ Arabian Peninsula, Japan ⛴️ ↔ USA West: 8 airports, 6 ports,
  11 connections. Japan has 3 businesses (tours, airline, ferry agency), UK & Ireland 2.
  The stuck-state check passes; two visa areas at once can trap someone in 21 of 946 pairs
  (was 44). The "every connection is needed" test runs on the original 9-connection map.
- 1,000 random-robot games: about 4,200 businesses bought, 13,700 sale offers and 6,900 sales,
  1,200 points of tour fees and 1,400 of tickets paid to other players, about 1,600 visas,
  longest "blocked" streak 3 turns, longest trip 7 turns, nobody stuck, nobody sent home.

Task 10: profile bonuses, save and resume (`tests/profiles.test.ts`, `tests/save.test.ts`).

- **Backpacker +3** on the move that reaches a 3rd continent; **Luxury +5** on the move that
  reaches a 5th. Once each; the start continent counts. The ✨ on the move already includes it,
  and a note says so afterwards.
- **Digital Nomad −5** off the final score (points + businesses, never below 0) with fewer than
  3 continents; it counts for the winner.
- Test board: a continent bar for Backpacker (x/3), Luxury (x/5) and Nomad (x/3); from round 25
  the Nomad's bar turns red ("−5 at the end unless…"). The end screen shows one total in points
  (owner's request): e.g. "9 points (8 travel + 6 assets − 5 Nomad penalty)". The
  Backpacker tip shows on the Backpacker's start-area turn (checked true on the map: on foot,
  Europe/Asia/Africa reach 3 continents, the Americas 2, Oceania 1).
- **Save:** `src/engine/save.ts` (`saveGame` / `loadGame`, with `SAVE_VERSION`). The test board
  saves after every move (browser storage, one slot), removes the save when the game ends, and
  shows "Continue game (round X / 30)" on the start screen. A damaged save or one from another
  version is not continued. A resumed quiz or exam question restarts its 15-second timer.
- 1,000 random-robot games on the 30-turn map, saved and resumed every 10th move (14,600 round
  trips): Backpacker bonus 302 of 742 Backpackers, Luxury bonus 299 of 739, Nomad penalty 349 of
  764 Nomads (in about 105 games it cost the Nomad first place). A game resumed after every move
  ends exactly like one never saved (20 games).

Task 11: event cards (`src/cards/cards.ts`, review page [`cards.md`](cards.md), `tests/cards.test.ts`).

- **53 cards** in 4 decks: country (12 anywhere + 12 that belong to one area, drawn only there),
  plane 10, ship 11, Backpacker 8 (all helpful, drawn only by the Backpacker, with the country
  cards). Mostly ±1, some ±2 or "lose a turn", rare ±5. A random card each time (the same card can
  come again), with the game's dice.
- **When** (changed in task 12: each player's 3rd, 6th … land turn, and no cards on trips): at the start of every player's turn in rounds 3, 6 … 27 (9 cards; none in the last
  round), standing in an area; and on every travel turn (a plane or ship card). One card per turn
  at most: a traveller draws only the travel card. No scheduled card during a citizenship request
  (the exam is the event); it is skipped, not moved.
- **Effects:** points (never below 0; the card says what was really lost), or "lose a turn". In an
  area the turn is lost (the only move is "lostTurn"; it leaves the "out of money" count as it is).
  On a trip the plane or ship is one turn late, with no Nomad +1 for that turn.
- **Fees at boarding (owner's rule, task 11):** the visa and tour fee are paid when boarding,
  together with the ticket (a right quiz answer: the fees only), to the citizen and tour owner of
  that moment. Nothing is owed on landing, so a card at sea can never stop a landing. A
  citizenship or tours that appear during the trip still cost nothing.
- The engine keeps the card of the current turn (`state.card`, on show for the whole turn) and the
  cards drawn by the last move (`state.drawn`), so the screens say what happened. The test board
  shows a card box, "🔔 Next event card: round N" on each player, "draws an event card" on the
  travel button, and a "Lose this turn" button. Rule tests that count exact points switch the cards
  off (`eventCards: false`); every real game has them.
- **Saves:** version 2. A version-1 save can't be continued.
- 1,000 random-robot games on the 30-turn map: 22,100 scheduled cards and 10,300 travel cards,
  1,600 lost turns and 1,650 late trips; 26,700 points won and 22,900 lost (about 4 points per
  player per game in each direction); longest trip 9 turns (1 trip in 6,000; was 7; the test limit was raised from 8 to 10,
  owner-approved), longest
  "blocked" streak 2, nobody stuck.

Task 12: challenges (`src/challenges/challenges.ts`, review page [`challenges.md`](challenges.md),
`tests/challenges.test.ts`).

- **995 questions of 6 types** (flag 174, bigger 174, capital 164, continent 166, neighbours 147,
  currency 170), made by `node scripts/challenges-make.ts` from `data/countries.json` (an extract of
  mledoze/countries, ODbL 1.0) and our map's continents; flags from flag-icons (MIT) in
  `assets/flags/`. The start screen shows the credits. Only the 174 independent countries on the map
  (not Greenland, Western Sahara, Palestine, Kosovo).
- **On a trip there are no event cards** (owner's rule: the 21 plane and ship cards were rewritten as walking cards c13–c33, same strengths, so there are still 53 cards). Each
  travel turn the player may play one challenge, or say no and travel on (nothing happens). Never
  obligatory, and **not offered with 0 points**. The game picks a type, then a question, with a
  hidden random draw (no dice shown). The answer is the next move, in the same turn: right +1,
  wrong −1 (never below 0), 15 seconds, time out = wrong. The trip goes on either way (Nomad +1),
  and on the last travel turn the player lands first, then the ±1 counts.
- **Event cards count land turns** (owner's rule): each player counts their own turns begun in an
  area (also lost, blocked and citizenship turns); trip turns don't count. A card on the 3rd, 6th,
  9th … land turn; none during a citizenship request (skipped) and none in the last round. The
  test board shows "🔔 Event card: in N turns on land".
- The engine keeps the question (`state.challenge`) and the result of the last move
  (`state.challenged`), so the screens say what happened. The test board shows the choice on the
  travel panel ("Play the challenge (+1 / −1)" or "Continue the journey (no challenge)"), the
  question with the flag and a 15-second timer, and the result line.
- **Saves:** version 3. A version-2 save can't be continued.
- 1,000 random-robot games on the 30-turn map: 9,484 travel turns (390 with 0 points, so no
  challenge), 4,595 challenges played, 2,275 right; 2,275 points won and 2,320 lost; 22,822
  event cards (15,889 points won, 15,725 lost), 2,603 lost turns; longest trip 8 turns (was 9),
  longest "blocked" streak 5 (the test limit is 5), nobody stuck. The dist/kaj.html file is now about 2.2 MB (flags about 1.2 MB).

Task 13: the robot, with three levels (`src/engine/normal-robot.ts`, `tests/normal-robot.test.ts`).

- **One robot, three levels** (owner's change): easy, normal, hard, a setting of each robot seat
  (`level` on the seat and the player; default normal). The test board has a level picker on each
  robot seat and shows "🤖 Hard" on the player. The random robot stays for the 1,000-game checks.
- It scores the legal moves and picks the best, with a hidden random tie-break (its own seed, never
  the game's dice).

  | | Easy | Normal | Hard |
  |---|---|---|---|
  | Right answers (airline quiz, exam, challenges) | 50% | 75% | 90% |
  | Plays a challenge with at least | 5 points | 3 | 1 |
  | Points kept after a ticket or a business | 5 | 3 | 2 |

- **Walking:** most points now (new area, wonder, new continent, profile bonus, finishing a big
  country; a new part of an unfinished big country counts ½), minus visa and tour fees; on a tie,
  the step with the most unvisited areas next. With nothing new in reach: the quickest way towards
  an unvisited area (walking, planes, ships), which also stops it walking back and forth.
- **Planes and ships:** when the destination gives at least 1 point more than the best walk (the
  Nomad's +1 per travel turn counts), or no new area is in reach on foot. The free quiz first; after
  a wrong answer it pays, if that keeps the reserve. The Backpacker always takes the quiz.
- **Citizenship:** once, in the first new area it reaches before round 10 (never the Nomad).
- **Businesses:** bought when the reserve is kept: tours, then airline, then ferry agency.
- **Selling:** only during the "out of money" warning: the dearest business, to the richest player
  who can pay. Offers it receives: accepted whenever it can pay (task 9b).
- **Setup:** random profile; start area with the highest welcome bonus, then the most neighbours;
  the Backpacker avoids Oceania and the Americas (it can't walk to 3 continents from there).
- **Nomad:** from round 18 with fewer than 3 continents, the quickest way to a new continent.
- **Quiz tries (owner's rule):** 3 tries per area for everyone, the Backpacker too. After the 3rd
  wrong answer a player who can pay (ticket and fees) pays and travels; one who can't (always the
  Backpacker) goes home, free of fees, with the normal arrival points. If home is the area they
  stand in, they stay and the count starts again. Before the 3rd try the test board warns
  "⚠️ Last try here: Attention! If wrong, you go home to …" (or "…you pay the N-point ticket with
  your points and travel"), and says afterwards what happened. The robot skips a last try that
  would send it home when it can walk.
- **Booked areas (owner's rule):** an area someone is travelling to by plane or ship is booked:
  nobody else may walk in or board for it until the traveller lands, as if they were already
  there. Nobody boards for an area where someone stands. Walking races stay as before (the first
  to arrive gets in; the other picks another move). "Go home" never sends a player into a booked
  area. The map shows "⏳ Waiting for Red ✈️", and the move panel says which areas nearby are booked.
- **Saves:** version 4 (the level is saved). A version-3 save can't be continued.
- 1,000 games for each level on the 30-turn map (2–4 players): nobody stuck, points ≥ 0, never two
  in one area. Average final score: easy 42, normal 46, hard 49 (random robot 18).
- Before and after the two new rules (1,000 games each; random / easy / normal / hard):

  | | Before | After |
  |---|---|---|
  | Longest trip (turns) | 6 / 11 / 6 / 6 | 3 / 3 / 3 / 3 |
  | Waits in the air before landing | 285 / 43 / 3 / 0 | 0 |
  | Trips per game | 6.7 / 7.0 / 8.0 / 8.4 | 6.3 / 6.5 / 7.5 / 7.9 |
  | Longest "blocked" streak | 3 / 3 / 2 / 2 | 3 / 2 / 3 / 2 |
  | Average final score | 18.0 / 42.2 / 46.7 / 49.1 | 18.1 / 42.1 / 46.1 / 48.5 |
  | Areas visited per player | 11.3 / 20.6 / 22.0 / 22.7 | 11.5 / 20.8 / 22.1 / 22.8 |
- Head to head (`node scripts/robot-report.ts`, 1,000 two-player games each, seats swapped):

  | Game | Wins |
  |---|---|
  | easy vs random | 99% – 1% |
  | normal vs random | 100% – 0% |
  | hard vs random | 100% – 0% |
  | normal vs easy | 64% – 36% |
  | hard vs normal | 63% – 37% |
  | hard vs easy | 74% – 26% |

Task 14a: Canada and Russia in 3 parts (owner's change; `tests/scoring.test.ts`, `tests/map30.test.ts`).

- **Map: 52 areas.** Canada West (British Columbia, Alberta, Yukon), Canada Central (Saskatchewan,
  Manitoba, Northwest Territories, Nunavut), Canada East (as before). Russia West (as before), Siberia
  (the area id stays `russia-east`: the Urals and Siberia up to Chita), Russia Far East (Yakutia to
  Chukotka, Sakhalin and Primorye). New walking links: Canada West – Canada Central – Canada East,
  Canada Central – USA West and USA East (Canada West keeps USA West only); Siberia – Russia Far East,
  Russia Far East – China East and Korea (Siberia keeps China East, through Chita). The drawn shapes
  touch exactly these links (only Tibet – Myanmar touches with no link, owner-approved).
- **Scoring:** completing a 3-part big country gives **+5** (`POINTS_BIG_COUNTRY_3_PARTS`); 2 parts
  still +1 +2. All or nothing as before. The robot values the +5 the same way.
- **Facts:** the 2 new areas have 12 facts each. Siberia kept 7 of its facts and Russia Far East got
  the other 5 (Oymyakon, Amur tiger, Kamchatka, Vladivostok, Yakutia); Canada Central got 2 of Canada
  West's (prairie wheat, longest coastline). 24 new facts for the owner to check (batches 2 and 4,
  which now have 11 areas).
- **Saves:** version 5. A version-4 save can't be continued.
- 1,000 games per level, before → after (+5): average score easy 42.0 → 41.0, normal 45.9 → 45.0,
  hard 48.5 → 47.5. Players completing Canada about 20% → 10%, Russia about 42% → 14%; with +4 the
  robots play almost the same (they don't plan several turns ahead). Two visa areas at once still
  trap someone in 21 of 946 pairs; nobody stuck.

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
   and tries again. Any destination can be chosen when boarding. (Task 13: a booked area can't be
   entered and nobody boards for a taken area, so this is only a safety net.)
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

## Choices made in task 9 (approved by the owner)

1. **Who may buy:** the player standing in the area, on any turn they begin there; buying does
   not end the turn.
2. **Tickets** go to the departure airline or ferry agency; the owner pays themselves; quiz and
   Backpacker tickets pay nobody.
3. **Strict fees, no exceptions** except a citizenship or tours that appeared during a trip.
4. **Businesses count their price at the end**; buying in the last round is allowed; no limit.
5. **Go home** after 3 turns in a row blocked by money, for every profile (no Nomad exception),
   free of fees; nobody is eliminated.
6. **Task 9b:** selling at the bought price to another player (who answers yes or no), and
   UK & Ireland gets an airport (to the Arabian Peninsula), Japan a port (to USA West).

## Choices made in task 9b (approved by the owner)

1. **Selling** on your own turn, before moving, any business you own, wherever you are; not on
   travel or citizenship turns. **One offer per turn.** Only to a player who can pay.
2. **No offers to a player in the air or at sea** (they may owe a visa or tour fee on landing).
3. **Robot buyers** accept whenever they can pay (random robots in the tests: at random).
4. A fee due when a player boarded goes to whoever owns the business when they land.
   (Replaced in task 11: fees are paid at boarding, to the owner of that moment.)
5. **The "every connection is needed" test** runs on the original 9-connection map.

## Choices made in task 10 (approved by the owner)

1. **The start continent counts** for the Backpacker, Luxury and Nomad.
2. **The +3 / +5 is given on arrival**, on the move that reaches the 3rd / 5th continent.
3. **The Nomad −5 comes off the final total** (points + businesses), never below 0.
4. **Warning before −5:** the Nomad's bar is always shown and turns red from round 25; no popup.
   The end screen says what happened.
5. **The Backpacker tip shows before the choice**, on the start-area turn.
6. **One save slot**; starting a new journey replaces it (the start screen says so); the save is
   removed when the game ends.
7. **A resumed quiz or exam question restarts its timer.**
8. **Saves carry a version**; a save from another version can't be continued, so no game is
   scored by rules that did not exist when its moves were made.
9. **Robots carry on by themselves** after a resume.

## Choices made in task 11 (approved by the owner)

1. **Scheduled cards in rounds 3, 6 … 27** (9 per player; none in the last round). Task 12: every 3rd land turn instead.
2. **At the start of the turn**, shown before the move; no question to the player.
3. **No card during a citizenship request**; skipped, not moved to a later turn.
4. **One card per turn**: a traveller in a card round draws only the plane or ship card. Task 12: no cards on trips.
5. **"Lose a turn" in an area:** this turn is lost.
6. **"Lose a turn" on a trip:** one turn late, no Nomad +1 for that turn.
7. **A lost turn leaves the "out of money" count as it is.**
8. **Backpacker cards** are all helpful (+1 or +2), drawn with the country cards; no moving cards.
9. **Random draw** from the cards that fit; the same card can come again.
10. **Warnings:** "Next event card: round N" and the travel button note before; the card box after.
11. **Visa and tour fee paid at boarding**, with the ticket (also with a free quiz ticket), to the
    citizen or owner of that moment; anything new during the trip is free.

## Choices made in task 12 (approved by the owner)

1. **No event cards on trips; only challenges**, and a challenge is never obligatory.
2. **No challenge with 0 points** (rather than a lost turn: no loop, matches "no money, no entry").
3. **Hidden random draw:** a random type, then a random question; the same one can come again.
4. **Event cards count each player's land turns** (trip turns don't count); lost, blocked and
   citizenship turns count.
5. **Data:** mledoze/countries (ODbL 1.0) and flag-icons (MIT), with credits on the start screen.
6. **Only the map's independent countries**; countries on two continents (Russia, Turkey,
   Kazakhstan, Egypt, the Caucasus) and Papua New Guinea not in the continent questions; Bolivia and
   countries with several capitals or currencies skipped for those questions.
7. **Fair answers:** "bigger" pairs differ at least 1.5×; wrong capital, neighbour and currency from
   the same continent; flags that look alike never asked together; land borders only.
8. **Robots** pick a challenge or not at random and answer at random (task 13 makes them smarter).
9. **The train** (France ↔ Russia West, France ↔ Turkey) is deferred: maybe later, if time allows.

## Choices made in task 13 (approved by the owner)

1. **Levels differ only** by right answers, the challenge threshold and the reserve (table above).
2. **The Backpacker robot avoids Oceania and the Americas** as a start.
3. **A plane or ship only for at least 1 point more** than the best walk, or when nothing new is in
   reach on foot.
4. **Robot buyers accept offers** whenever they can pay (as in task 9b).
5. **Sale offers** go to the richest player who can pay.
6. **Head-to-head games:** 2 players, random profiles; a draw counts as nobody winning.
7. **Head-to-head games are a report script**, not part of `npm test` (the 1,000 games per level are).
8. **Test limits stay** unless the owner agrees to change them.
9. **3 quiz tries for everyone**; after the 3rd wrong answer: pay and travel, or (no money) go home.
10. **Booked areas:** closed to walking and boarding while someone travels there; no boarding for an
    area where someone stands.

## Project setup

- TypeScript, run directly by Node 22.18 or newer (no build step for tests).
- Only development tools: `typescript` and `@types/node`. No game dependencies.
- GitHub Actions (`.github/workflows/ci.yml`) runs the type check and tests on every pull request.
- Art from the owner: `assets/art/` (poster and background, landscape and portrait).
