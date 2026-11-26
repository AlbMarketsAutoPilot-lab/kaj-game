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

Task 14b: Alaska and two ships (owner's change; `tests/map30.test.ts`, `tests/scoring.test.ts`).

- **Map: 53 areas.** Alaska (US-AK, with the Aleutians) is a 3rd part of the USA; USA West keeps
  Hawaii and the other western states. Alaska's only walking link is Canada West (the drawn shapes
  touch exactly this link). Completing the USA now needs 3 parts: **+5**, like Canada and Russia.
- **Ships:** Australia East ⛴️ New Zealand, and USA West ⛴️ Alaska (Alaska's ferry). Without the
  ferry a Canadian citizenship (all 3 parts of Canada) trapped Alaska; the owner chose the ferry.
  8 airports, 9 ports, 13 connections; New Zealand has an airport and a port.
- **Big countries:** parts must be linked by walking or by their own ship (Alaska–USA West).
- **Facts:** Alaska has 12 (2 moved from USA West: bought from Russia, Denali; 10 new); USA West got
  2 new ones (Las Vegas, Crater Lake). 12 facts for the owner to check (batch 4, now 12 areas).
- **Placeholder quiz:** a big-country part never gets its own country as the wrong answer.
- **Saves:** version 6. A version-5 save can't be continued.
- 1,000 games per level, before → after: average score easy 41.0 → 39.6, normal 45.0 → 44.2, hard
  47.5 → 47.2. With normal robots (300 games): the USA completed by 53% → 22% of players, New Zealand
  visited by 44% → 63%. Two citizenships at once trap someone in 21 → 19 of 946 pairs; nobody stuck.

Task 14d: citizenship asked where the player stands (owner's change; `tests/citizenship.test.ts`).

- **Asking** is a move of its own (`askCitizenship`), for the area the player stands in, on their
  turn: any area except the home country (for a big country: no part of the home country's
  country), also an area visited before. Never while travelling, never the Nomad, once per game,
  and only where nobody holds or is asking for that citizenship. It replaces the request carried
  by a walk, plane or quiz (task 8). A player out of money may ask too.
- **Timeline:** asking ends the turn (citizenship turn 1); the test is next turn; then granted and
  moves (or one learning turn after a wrong answer), as before. One turn longer than task 8.
  **Luxury:** granted at once, and the turn goes on (the player may still move).
- **Robots:** ask in the first area where they can, before round 10.
- **Saves:** version 7.
- 1,000 games per level, before → after: average score easy 39.6 → 38.8, normal 44.2 → 43.5, hard
  47.2 → 46.2.

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

Task 14f: a fair citizenship test (owner's change; `tests/citizenship.test.ts`).

- **Turn 2:** the player reads 6 facts of the area (no timer, "I'm ready"), then answers 3 a/b
  questions about 3 of them, in the same turn. Each question waits for "Start"; its 15 s clock
  runs only after that, so it never runs while the last answer is on show.
- **Turn 3:** 2 or more right: granted, moves (`granted`). Fewer: no citizenship, moves
  (`failed`); the one request of the game is used up. The learning turn and the `exam` move are
  gone. Robots answer at their level's rate, as before (normal passes about 84% of the time).
- The save version goes to 8 (the exam carries its study lines).

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
9. **The train** (France ↔ Russia West, France ↔ Turkey) was deferred here; added in task 17.

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

## The train (task 17, approved by the owner)

30-turn map only. The train is a third route kind, `station`, next to `airport` and `port`.

- **Routes:** France ↔ Russia West and France ↔ Turkey & Caucasus (`turkey-caucasus`). In France the
  player chooses one of the two; from Russia West or Turkey the train goes only back to France.
- **Travel:** 1 travel turn for every profile (Business and Luxury too, unlike planes and ships).
  The Digital Nomad gets +1 for the train turn, and a challenge is offered as on planes and ships.
- **Ticket:** 2 points for Business and for the Nomad (`TRAIN_TICKET_PRICE`, `ticketPrice()`).
  The Backpacker never pays: the quiz only. Business and Nomad may also try the quiz (3 tries;
  after the 3rd wrong answer they pay the 2-point train ticket and go, or with no money go home).
- **Luxury can't take the train:** no train destinations for Luxury, ever.
- **Fees:** as on planes and ships: visa and tour fee paid on boarding, booked areas closed,
  no money, no entry.
- **Train ticket booths:** 3 businesses (`train`) at 2 points, in France, Russia West and Turkey.
  Bought like the airline and ferry agency (Luxury may buy one too, owner's answer). A paid train
  ticket goes to the owner of the booth at the departure station; with no owner, to nobody.
- **Stuck-state checker:** leaves the train out (Luxury can't take it), so the map must work
  without it. All three train areas can be reached on foot.
- **Robots:** use the train like planes and ships (Luxury never), and buy booths after the other
  businesses. 1,000 mixed robot games: no stuck game, ~230 train rides, scores as before.
- **Save version 9:** older saves are not continued.

## The bus (task 18, approved by the owner)

30-turn map only. A fourth route kind, `bus`, on a **one-way** route (`oneWay: true`: from `a` to
`b` only).

- **Route:** the only bus stop is in Mongolia. The bus goes to Siberia (`russia-east`) or China West;
  there is no bus back (those areas have no bus stop).
- **Who:** only the Nomad (ticket 1, or the quiz) and the Backpacker (the quiz only). Business and
  Luxury can't take the bus (`canRide()`). After 3 wrong quiz answers the Nomad pays 1 and goes;
  the Backpacker goes home.
- **Travel:** 1 travel turn; the Nomad gets +1 for it; a challenge is offered.
- **Whole country (changed in M5, see "Owner's test fixes"):** arriving by bus in Siberia marks all 3 parts of Russia visited and gives +5;
  in China West both parts of China and +3. Given once, also when some parts were visited before;
  a country already complete gives nothing more. Only areas are marked: the continent counted is
  the one of the area really entered (Asia), never Europe for Russia West; no visa or tour fee for
  the other parts.
- **Fees:** as usual for the destination: visa and tour fee paid on boarding, booked areas closed.
- **Bus ticket booth:** 1 business (`bus`) at 2 points, in Mongolia; anyone may buy it. A paid bus
  ticket goes to its owner.
- **Stuck-state checker:** leaves the bus out, like the train.
- **Robots:** the Nomad and Backpacker robots value the whole country when choosing the bus.
  1,000 mixed robot games: no stuck game, ~50 bus rides, scores as before.
- **Save version 10.**

## The car (task 19, approved by the owner, both games)

A fifth route kind, `car`, one way (`oneWay: true`) from Mexico to USA West or USA East (the player
chooses), on the 30- and 50-turn maps. The owner's last change before the final freeze.

- **Rent (Nomad, Business, Luxury):** 1 point (`CAR_TICKET_PRICE`), never a quiz. With less than
  1 point (plus any fees) there is no car.
- **Hitchhike (Backpacker only, free):** the action `hitchhike`. **Secret, never shown or explained:**
  a car stops only when the Backpacker arrived in Mexico on an even round (`Player.arrivedRound`,
  `hitchhikeStops()`); the starting area counts as round 1. If no car stops nothing happens: no
  points, no turn lost, no second try that turn (`Player.hitchFailedRound`); the player must move
  another way. `GameState.hitchhiked` tells the screens what happened. Robots don't know the
  secret: they just try.
- **Points like the bus:** the USA's +5 at once (no Alaska needed), once; only the arrival area is
  marked visited, and the other USA parts still give +1 each (`wholeCountryTrip()`).
- **Travel:** 1 travel turn for everyone; the Nomad's +1 per trip; challenges as on every trip (the
  Nomad gets its boss's message instead).
- **Fees:** as usual: visa and tour fee paid on boarding (a hitchhike pays them only if a car
  stops); booked areas closed.
- **Car rental:** 1 business (`car`) at 2 points, in Mexico; anyone may buy it (the Backpacker too).
  A paid rental goes to its owner.
- **Screens:** the turn buttons say "30 rounds around the world." and "50 rounds around a bigger
  world."; a rental sign and a red car on the map, but a hitchhiker with a raised thumb for a
  Backpacker; the car added to the guide's travel slide and business slide, profile cards, popups,
  tips and area details; a desert-road trip scene, and the thumb scenes (a car stops / rushes past).
- **Stuck-state checker:** leaves the car out, like the train and the bus.
- **Save version 14:** no older save is continued.
- **Robot report (1,000 games per line):** no stuck or endless game. Average scores alone, before → with
  the car: 30 turns easy 44.6 → 45.0, normal 48.0 → 50.9, hard 52.2 → 52.2; 50 turns easy 66.3 → 67.8,
  normal 70.9 → 73.1, hard 75.7 → 77.2. The levels keep their order (hard beats normal 57% / 61%).

## Owner's test fixes (task M5, both games; the 30-turn game is unfrozen)

- **The bus (replaces task 18's "whole country visited"):** arriving by bus in Siberia or China West
  gives the country's points at once (Russia +5, China +3), once, also when some parts were visited
  before. Only the destination is marked visited; every other part still gives **+1** when first
  visited (owner: a reward for the Nomad and the Backpacker). `Player.bigCountries` lists the
  countries whose points a player has had (all parts walked, or by bus).
- **Whole continents:** every area of a continent visited gives, once, `continentRewardFor(areas)`
  = areas ÷ 3 rounded, at least 2. 30 turns: Europe 4, Asia 5, Africa 3, North America 3, South
  America 2, Oceania 2. 50 turns: Europe 6, Asia 8, Africa 6, North America 3, South America 3,
  Oceania 2 (owner-approved after measuring: robots finish Europe and Asia 0% of the time,
  Oceania about a third). Only areas really visited count. `Player.fullContinents`;
  `GameState.rewards` tells the screens. People see "Welcome to Africa! Visit all 19 areas for
  +6" on their first turn on a continent, and a gold popup when they finish it.
- **Madagascar (50 turns):** no walk (the M2 sea crossing to Zambezi is gone); its port sails to
  Tanzania, Zambezi or South Africa (23 connections). **SURPRISE!** +3 on the first arrival
  (`Area.surprise`), never as the home area, never announced before; a robot's surprise is not told.
- **"Tanzania"** is the short name of Tanzania, Rwanda & Burundi.
- **Save version 12:** no older save is continued.
- **Robot report (1,000 games per line):** no stuck or endless game. Average scores, normal robots:
  30 turns 43.9 → 45.9, 50 turns 66.7 → 68.6 (easy 41.0 / 61.3, hard 49.0 / 73.2); the levels keep
  their order (hard beats normal 63% / 64%).
- Rule tests on the tiny test map switch whole-continent rewards off (`continentRewards: false`,
  like `eventCards`); the real games always have them.

## The 50-turn game (task M2, approved by the owner)

The 30-turn game is frozen and unchanged. The 50-turn game uses all its rules; only the map and
the timing below differ. Engine only: the screens come in M4 (until then the web game is 30 turns).

- **Map choice:** `mapFor(turns)` in `src/maps/index.ts`, 30 (default) or 50 (`GAME_LENGTHS`);
  `mapById()` finds the map of a saved game. A map sets its own length (`GameMap.rounds`: 50 on
  `map50`; 30 when not set), so `createGame()` makes a 50-round game on the 50-turn map.
- **Map (`src/maps/map50.ts`, from `docs/map50.md`):** 84 areas, 11 wonders, 13 airports and 13
  ports (21 connections), the train (France ↔ Russia West or Turkey; the Caucasus has none) and the
  bus (Mongolia → Siberia or China West, whole country). Each area lies inside one 30-turn area
  (`INSIDE_30`) and keeps its continent; the same big countries in the same parts. An area that is
  the same place as on the 30-turn map keeps its id (place cards, wonder drawings).
- **Walking links (owner-approved):** 151: the real land borders, the Channel Tunnel (France ↔
  UK & Ireland) and one sea crossing, Madagascar & Islands ↔ Zambezi. No Spain ↔ Morocco. The ship
  to UK & Ireland leaves from Portugal (not Spain). Without these two fixes a citizenship of Spain
  trapped Portugal, and one of Tanzania trapped Madagascar.
- **Event cards:** every 5th land turn (`cardEvery()`; every 3rd in the 30-turn game), none in the
  last round.
- **Place cards:** the 30-turn place cards come in the area with the same id. "Thin mountain air"
  (Peru & Bolivia) comes in Peru only (`Area.cardsFrom`).
- **Timing scaled to 50 turns:** robots ask for citizenship before round 17 (10 in 30 turns), the
  robot Nomad heads for a 3rd continent from round 30 (18) (`robotRound()`); the Nomad's warning
  starts 5 turns before the end, round 45 (`nomadWarningRound()`). Mini missions are not in v1.
- **Facts (M3, owner-approved):** 12 for every area. Areas that are the same place as on the
  30-turn map keep its 12 facts; the facts of the 22 split areas are sorted by country
  (`src/facts/sort50.ts`; a fact about two parts goes to both), and 330 new facts fill each area to
  12 (`src/facts/new50.ts`: Europe 82, Asia 96, Africa 111, South America 41).
- **Shapes (M3):** `node scripts/map-shapes.ts --from <file> --map 50` makes `src/maps/shapes50.ts`
  and `docs/map-shapes50.md` from the same Natural Earth data. Every walking link touches on the
  drawing except the Channel Tunnel and Madagascar ↔ Zambezi; China West touches Myanmar without a
  link (as on the 30-turn map).
- **Checks:** the map check and the stuck-state checker pass. Robot report
  (`node scripts/robot-report.ts 1000 50`, 10,000 games): no stuck or endless game; average scores
  easy 59, normal 67, hard 71, random 25 (30 turns: 39, 44, 47, 17); hard beats normal 66%.
- **Screens (M4, session A):** the setup screen has a "Journey: 30 turns / 50 turns" picker
  (30 by default). The screens use the map of the game on screen (`useMap()` in
  `src/web/main.ts`); a saved game continues on its own map; the guide plays on the 30-turn map.
  "Halfway there!" and "The last five turns!" come at rounds 26 and 46 of 50, the Nomad warning at
  45, the card countdown every 5. Wonder names (owner): the Parthenon, Petra, Angkor Wat, Mount
  Kilimanjaro; Peru shows the Machu Picchu drawing. Session B: their drawings (owner-approved), made
  by `node scripts/wonders-make.ts` in the style of the M6 posters.
- **Save version 11.** Owner: a version-10 save of a 30-turn game still loads (its rules did not
  change); other older saves are not continued.

## Profile balance and planning robots (owner, 2026-10-11, both games)

Measured in a test-only lab (`scripts/balance-lab/`, results in `docs/balance-lab.md`): robot games on
a copy of the engine, with today's normal robots and with planning robots. Owner's rules for the study:
the same rules on both maps, real-life rules, no caps; the numbers decide. Before: 9 of 32 results fair
(each profile 20–30% of 4-player wins, 40–60% of 2-player wins); the measured rule set: 24 of 32.

- **Luxury:** the +5 for 5 continents is removed (`CONTINENT_BONUS`).
- **Backpacker:** +7 for 3 continents (was +3); its helper cards are b1–b8 again (b9–b15 removed).
- **Business:** +6 for citizenship (was +3, `POINTS_BUSINESS_CITIZENSHIP`).
- **Digital Nomad:** ticket 1 as before; **+1 per trip** (`POINTS_NOMAD_TRIP`, paid on the first travel
  turn; a ship's 3 turns give +1, not +3; a wait for a taken destination gives nothing); **+5 for 3
  continents**, and no more −5 at the end with fewer; **no travel challenges** (it works on trips): the
  "Play the challenge" button stays, and a person who presses it gets a joke from the boss ("back to
  work!", and its "No thanks" reads "Keep working") and the trip goes on. **Secret surprise** (owner, never
  in the rules or the guide, like Madagascar's): on a ship, the Nomad's 3rd press of "Play" on the same
  trip gives a real challenge (`nomadSurprise`). Robot Nomads never press "Play", so the measured balance
  is unchanged.
- **Robots** (`ROBOT_LEVELS`, `src/engine/planner.ts`): easy answers 65% right (70% in the 50-turn game),
  keeps 4 points, doesn't plan; normal 75%, keeps 3, plans 2 moves ahead; hard 90%, keeps 2, plans 3.
  The planner looks ahead over walks and trips (turns, tickets, fees, quiz waits, the bus, big countries,
  whole continents, profile bonuses) and counts a point k turns later as 0.85^k.
- **Save version 13:** no older save is continued.

## Question rotation (version 2.0, step 2.1, owner-approved 2026-11-16)

- **No repeats until the pool is used up:** each player keeps the ids of the questions they were
  asked (`Player.seen`, oldest first). Each question is drawn evenly among the pool's unseen ones
  (`drawFresh` in `src/engine/quiz.ts`), so no place in a list is favoured. When a pool is used up it
  starts again, and the question just asked never comes straight back.
- **One rotation for everything:** the airline quiz, the citizenship test and the challenges share the
  seen list (a fact's id is a short hash of its question and answer, `factId`, the same on both maps;
  a challenge keeps its id).
- **Airline-quiz pool:** the destination's facts plus the challenges about its countries (each
  challenge now has `country`, made by `node scripts/challenges-make.ts`; the questions are unchanged).
  Step 2.3 changed this: 1 question in 10 is a challenge, the others are facts (below).
  A flag question shows its flag in the quiz.
- **Citizenship test:** its 3 questions are the player's next unseen facts of the area; the other 3 study
  lines are drawn at random. **Challenges:** a random type, then an unseen question of that type. The
  visa test (step 2.6) will use the same rotation.
- **On the device (owner's choice A):** one memory for all human players (`kaj-seen` in browser
  storage). Every human seat starts a game from it (`SeatConfig.seen`); after every move it becomes
  what the humans have seen. Robots start empty each game.
- **Save version 15:** no older save is continued (a game in progress from version 14 or older is lost).
- **Balance (`docs/balance-lab.md`, packages 2.1-BEFORE and 2.1-AFTER, 400 games per line):** robots
  answer at a fixed rate whatever the question, so only random differences: fair results 12 → 16 of 16
  (30 turns) and 11 → 10 of 16 (50 turns), average scores within 1.4 points; boredom 32–36% / 27–29%
  and lead changes about the same. The lab report has two new columns, **boredom** (turns blocked,
  lost or worth 0 points) and **excitement** (leader changes per game, games won by 3 points or less).

## Geography questions (version 2.0, step 2.3, owner-approved 2026-11-17)

- **Owner's aim:** geography fairly represented, about 35–40% of what a player is asked, never dominating.
  **Geography** = places and the land: rivers, mountains, seas, islands, deserts, climate, where a place is,
  borders, size, capitals, population. Not geography: animals and plants, flags, currencies, history,
  culture, science.
- **Every fact has a type** (`src/facts/tags.ts`, keyed by `factId`): geography, culture, history, nature
  or science, tagged by Claude fact by fact. Of the 966 different facts: geography 302, culture 330,
  history 132, nature 111, science 91. Challenges: capital, continent, neighbour and bigger are geography;
  flag and currency are not.
- **Count:** `node scripts/geo-count.ts [games]` plays normal-robot games (2 and 4 players, both maps) and
  reports every question asked, by screen. Before step 2.3: 48–50% geography (the airline quiz drew
  evenly from the destination's facts and its challenges, so about half of all questions were challenges).
- **Airline quiz:** 1 question in 10 (`AIRLINE_CHALLENGE_ONE_IN`) is a challenge about the destination's
  countries, the others are its facts; each part keeps its own rotation (replaces step 2.1's single pool).
- **Citizenship test:** 2 extra geography facts per 50-turn area (`src/facts/geo-exam.ts`, 168, checked and
  approved by the owner; review page `docs/facts/geo-exam.md`, made by `node scripts/geo-exam-review.ts`),
  kept in `GameMap.examFacts`: asked and read in the citizenship test, **never in the airline quiz**. The
  30-turn map takes at most 3 per area: the 1st fact of each part in map order, then the 2nd
  (`GEO_EXAM_30_PICKS`). This also makes each area's test rotation 2–3 questions longer.
- **Travel challenges (owner, still over 40% without this):** 1 in 3 (`TRAVEL_GEOGRAPHY_ONE_IN`) is a
  geography type (capital, continent, neighbours, bigger), the other 2 a flag or a currency (was: one of
  the 6 types at random, so 4 in 6 geography). Replaces task 12's "a random type".
- **After (200 games per line):** all questions asked **37% geography (30 turns), 32–33% (50 turns)**
  (before 48–50%); the citizenship test 29–39% (was 23–27%), the airline quiz 32–37%, travel challenges
  33–35%. Without the travel-challenge change: 43–45% / 40–41%.
- **Balance (`docs/balance-lab.md`, 400 games per line; before = 2.1-AFTER, then 2.3-AFTER without the
  travel-challenge change, then 2.3-FINAL):** robots answer at a fixed rate whatever the question, so only
  random differences: fair results 16 → 14 → 13 of 16 (30 turns) and 10 → 11 → 12 of 16 (50 turns),
  average scores within about 1 point; boredom 32–36% / 27–29% and lead changes about the same.
- **No rule changes; save version stays 15** (only which question is drawn changes, and saves hold only
  question ids).

## New plane and ship routes (version 2.0, step 2.4, owner-approved 2026-11-17)

- **Routes (owner's lists, `src/maps/map30.ts` and `src/maps/map50.ts`):** every plane and ship route is two-way,
  with 1 or 2 destinations; they replace all earlier airports and ports (tasks 2b, 9b, 14b, M1, M2, M5). The
  train, the bus and the car are unchanged. Luxury still flies to any airport and sails to any port.
  - 30 turns, ships: New Zealand–Chile, Río de la Plata–Southern Africa, Southern Africa–Australia West,
    Alaska–Japan, Canada East–Iceland, Iberia–Central America, Central America–Japan. Planes: Alaska–USA West,
    Iceland–UK & Ireland, North Africa–Iberia, Japan–Korea, Australia East–New Zealand, Australia East–Malay
    Islands, India–Malay Islands, India–Arabia.
  - 50 turns, ships: New Zealand–Chile, Argentina–South Africa, South Africa–Australia West, Alaska–Japan,
    Canada East–Iceland, Portugal–Central America, Central America–Japan, Brazil North–Nigeria. Planes:
    Alaska–USA West, Iceland–UK & Ireland, Algeria–Spain, Japan–Korea, Australia East–New Zealand, Australia
    East–Malay Islands, India–Malay Islands, India–Gulf States, Madagascar–Gulf States, South Africa–Madagascar.
- **Counts (before → after):** 30 turns: airports 8 → 13, ports 9 → 11, connections 13 → 15, airlines and ferry
  agencies 17 → 24 (all businesses 29 → 36). 50 turns: airports 13 → 15, ports 15 → 13, connections 23 → 18,
  airlines and ferry agencies 28 → 28 (all businesses 44). At most 2 destinations everywhere (was 3 on the 50-turn
  map; the limit `MAX_DESTINATIONS` stays 3).
- **Gained / lost:** 30 turns: airports gained in Alaska, USA West, Iceland, North Africa, Iberia, Korea, Australia
  East, India; lost in Australia West, Chile, Southern Africa. Ports gained in Chile, Río de la Plata, Southern
  Africa, Australia West, Central America; lost in UK & Ireland, USA West, Australia East. 50 turns: airports
  gained in Alaska, USA West, Iceland, Algeria, Spain, Korea, Australia East, Madagascar; lost in Australia West,
  Chile, USA East, Brazil South, Nigeria, Kenya-Uganda. Ports gained in Chile, Argentina, Australia West, Central
  America, Nigeria; lost in UK & Ireland, USA West, Australia East, Madagascar, Tanzania, Zambezi, West Coast.
- **Map check and stuck-state checker:** pass on both maps (one citizenship). The checker needs exactly 5 routes
  on the 30-turn map (New Zealand–Chile, Canada East–Iceland, Iceland–UK & Ireland, Australia East–New Zealand,
  India–Arabia) and 7 on the 50-turn map (the same first four, Portugal–Central America, and Madagascar's two
  planes); these tests replace task 2b's "each of the 9 connections is needed". Two citizenships at once trap
  someone in **13 of 946 pairs** (30 turns, was 19) and **20 of 2,775** (50 turns, was 18), mostly Iceland,
  UK & Ireland and the 3 parts of Canada; the known limit stays (only while the player has fewer than 2 points;
  "go home" is the way out). Every walking group has at least 2 routes out; 9 (30 turns) and 12 (50 turns)
  areas have a single route.
- **Madagascar (50 turns):** no walk and no port; planes to the Gulf States and South Africa (both needed). Its
  SURPRISE +3 is unchanged. **Alaska:** its plane to USA West links the 3 parts of the USA (was the ferry).
  **Portugal:** its ship to Central America keeps a citizenship of Spain from trapping Portugal (M2's reason).
- **Robots (owner-approved):** with the new map, robots planning 2 moves ahead swung back and forth beside areas
  worth nothing yet (USA West ↔ Canada Central, Mexico ↔ USA West): per player per 50-turn game, Backpacker
  0.3 → 3.4, Luxury 0.3 → 2.2 (the lab's planner Luxury 0.6 → 7.7). The engine now remembers where a player
  walked from (`Player.cameFrom`, null after a trip, going home or the start), and a robot doesn't walk straight
  back there unless that gives points or it has no other move (`noWalkBack` in `src/engine/normal-robot.ts`, also
  in the lab's planner). After: under 0.1 per game for every profile.
- **Screens:** no code change for airports, ports, menus, area details and trip scenes (they read the map). A
  route across the date line (Japan–Alaska, Japan–Central America, New Zealand–Chile) is drawn from both ends
  on the world map. The guide's airport page: "UK & Ireland: its airport flies to Iceland" (was Arabia).
- **Saves: version 16.** No older save is continued (a game in progress from version 15 or older is lost).
- **Balance (`docs/balance-lab.md`, 400 games per line; before = 2.3-FINAL, after = 2.4-AFTER with the robot
  fix):** fair results **13 → 10 of 16 (30 turns)** and **12 → 14 of 16 (50 turns)**. Boredom 32–36% → 33–35%
  (30 turns) and 27–29% → 27–28% (50 turns); lead changes and close finishes about the same. Outside the target
  on the 30-turn map: Nomad with 4 players (normal robots 21% → 13%, planning 27% → 16%), Luxury with planning
  robots (2 players 39% → 66%, 4 players 28% → 34%), Business with 4 normal robots (26% → 36%), Backpacker with
  2 planning robots (49% → 38%). 50 turns: Nomad with 4 normal robots 18% (was 18%), Backpacker with 4 planning
  robots 33% (was 38%). Left for step 2.7 (balance tuning).
- **Trips (game robots, normal, per player per game, 300 games per line, scratch script):** Backpacker and Nomad
  fly about half as often and sail about twice as often (30 turns, 2 players: Nomad planes 3.1 → 1.7, ships
  1.2 → 2.3; Backpacker planes 2.2 → 1.2, ships 0.5 → 1.0); Luxury flies more (3.5 → 4.8). Areas visited: about the
  same for Backpacker, Business and Luxury; the Nomad about 1 fewer on the 30-turn map (21.1 → 19.7), the same on
  the 50-turn map.

## Nomad boss alerts and the car to Canada (version 2.0, step 2.5, owner's final decision 2026-11-18)

The owner's decision after measuring: of the planned step 2.5 only these changes; everything else stays as it was
(travel turns, prices, the quiz for every profile, "+1 for the other parts" after the bus or car).

- **Nomad, +1 per trip only to a new area** (`POINTS_NOMAD_TRIP`, `travelOn`): a trip to an area the Nomad has
  already visited gives 0, and brings no alert.
- **Nomad boss alerts (replace the secret ship surprise of 2026-10-11, now removed):** a ship trip to an area not
  visited yet brings, at the start of its 3rd (last) travel turn, a phone message from the boss (the event-news
  phone), by turns (`Player.nomadShips`, `Travel.alert`, `nomadAlert()`):
  - 1st, 3rd, 5th … such trip: *"Your boss appreciates you working hard, so he has changed his mind! You can accept
    a challenge this turn if you want."* The Nomad may play one challenge that turn (+1 / −1, as for everyone).
  - 2nd, 4th … such trip: *"Your boss is very happy with your work! You receive a bonus +1 point for this trip."*
    (`POINTS_NOMAD_BONUS`, paid on that turn). So such a trip gives +2 in all.
  - On the other travel turns "Play" still brings the boss's "back to work" message. Robots play the challenge
    on their challenge turn and value the alerts when they plan (`nomadTripValue` in `src/engine/planner.ts`).
- **Car (both maps):** from Mexico one way to **USA East or Canada West** (was USA West or USA East). Canada West
  gives Canada's +5 at once, like the USA; the other parts still give +1 each (M5). Hitchhiking works the same
  (the even-round secret), to both destinations.
- **Robot fix:** a robot left with no move it wants (a ticket below its reserve, the walk back filtered out) now
  takes the first legal move (found with the new car route: a Nomad in Mexico with 2 points).
- **Screens:** the boss's phone alert; the trip panel (the challenge on the boss's turn, the bonus line); car texts
  "all of the USA or all of Canada (+5)"; the Nomad's profile card and guide ("+1 for every trip to a new area").
- **Save version 17:** a game in progress from version 16 or older can't be continued.
- **Balance (robot games, 1,600 per line, measured during the session, not kept in the lab report):** fair results
  today 24 of 32 (30 turns 11, 50 turns 13); with these changes 22 of 32 (10 and 12). The owner chose them for the
  story (no secret surprise, the boss alerts) and a second car destination; tuning is step 2.7. Tests: 224 pass.

## Citizenship from turn 1, the visa test and the card mix (version 2.0, step 2.6, owner-approved 2026-11-19)

Replaces task 8's asking on a move, tasks 14d and 14f (the "Ask for citizenship" button and the citizenship test),
Luxury's instant citizenship and the Business's +6. Rules in full: `docs/rules-now.md`.

- **Citizenship from turn 1:** everyone but the Digital Nomad is a citizen of the start country (a big country: all
  its parts; `Player.citizenship`, set on `chooseStart`). No asking, no citizenship test. **One start per country**
  (only Russia has parts on two start continents: once anyone starts in it, its other parts can't be chosen).
- **Business, a 2nd citizenship** (`buyCitizenship`, `canBuyCitizenship`, `Player.bought`): free
  (`SECOND_CITIZENSHIP_PRICE = 0`), once, of the area (or big country) it stands in, if nobody holds it and it is not
  the Nomad's start country. It doesn't end the turn, is not counted at the end and can't be sold.
  Backpacker and Luxury: only the start citizenship.
- **Visa** (`visaOwner`, `entryFees`): 2 points to the citizen on **every entry** from outside; moving inside a big
  country is free; the citizen enters free. **The Business never pays a visa.** No money, no entry, as before.
- **Visa test** (`GameState.visa`, `visaAnswer`, `needsVisaTest`): entering another player's country (not Luxury)
  means reading 6 facts of the area and answering 3 a/b questions in the same turn (`VISA_TEST_*`, the question
  rotation of step 2.1). 2 right: the move goes ahead and everything is paid together; fewer: nothing paid, no
  entry, the turn is used (`GameState.visaTested` tells the screens). **Luxury** pays with no test; the
  **Business** takes the test but pays nothing.
  - Walking: the test before entering; failed, the player stays.
  - Plane, ship, train, bus, rented car: the ticket first (pay, or a right airline-quiz answer), then the test.
    Failed: no trip, nothing paid; the free quiz ticket is lost and the failure is not a quiz try.
  - After the 3rd wrong quiz answer (the forced paid trip): the test too; failed: no trip, nothing paid, the count
    starts again. Hitchhiking: the test only if a car stops; failed: no trip, the turn ends.
  - Going home is free: no test, no visa. "Go home" still counts only ways out closed by money.
- **Nomad:** a ship trip to a new area gives **+2** (`POINTS_NOMAD_SHIP`; other trips to new areas +1), plus the
  step 2.5 boss alerts.
- **Event cards, mix "G"** (`EVENT_MIX`, `cardMix()`): the same cards for everyone; a good card counts `good` times
  and a bad one (points below 0 or a lost turn) `bad` times in the draw. Business 1.1 / 0.95 (2 and 4 players); with
  3 or 4 players Backpacker 1 / 1.2, Luxury 1.15 / 0.9, Nomad 1.25 / 0.85; otherwise the normal deck. The
  Backpacker's helper cards b1–b8 are **no longer drawn** but kept in `src/cards/cards.ts` (owner: a possible lever
  for step 2.7). The "no card during a citizenship request" rule is gone with the request.
- **Robots (owner-approved):** answer the visa test at their level's rate; the Business takes its 2nd citizenship when
  it keeps its reserve, after businesses; the "ask before round 10" rule is removed; the planner's Nomad trip value
  counts +2 for ships (`nomadTripValue`, also used by the lab's planning robot).
- **Screens:** the visa test uses the old citizenship test screens (read the facts, "I'm ready", "Start", 15 s per
  question) with the rule in one sentence; the warning before a move says a test comes first; the Business's
  "🛂 Take citizenship of …" button and popup; "Citizen of …" on the players; the home-country popup, profile cards,
  area details and the guide's citizenship slide explain the new rules.
- **Tests:** `tests/citizenship.test.ts` rewritten (start citizenship, one start per country, the test when walking,
  flying, after the quiz and the forced trip, every entry, big countries, Luxury, Business, buying); the card mix
  (`tests/cards.test.ts`); 3 start citizenships at once trap someone in at most **261 of 6,667** start sets (30 turns)
  and **530 of 30,301** (50 turns) (`tests/map30.test.ts`, `tests/map50.test.ts`; the known limit: only while a player
  has fewer than 2 points, and "go home" is the way out). The rule tests on the tiny test maps switch the start
  citizenships off (`startedGame`, like the event cards); on the walking-only test map the random robots play with no
  citizenships (as owner-approved in task 8). The test limits are unchanged. 221 tests pass.
- **Save version 18:** a game in progress from version 17 or older can't be continued.
- **Balance (robot games, 1,600 per line, both maps, 2 and 4 players, normal and planning robots):** fair results
  **21 of 32 before → 29 of 32** with this step (the build matches the scratch measurement exactly). Outside the
  target: Nomad 19.6% (30 turns, 4 normal robots), Backpacker 16% (30 turns, 4 planning robots), Luxury 31% (50 turns,
  4 normal robots). Boredom 26–34% (unchanged), close finishes 39–40% in every 4-player line. Nobody went home, longest
  blocked streak 2, 15–16% of visa tests failed. Tried and dropped (see `docs/work-plan.md`, step 2.6): the bought
  citizenship at 5 points, the rule without card changes (10 of 32), Backpacker +1 travel turn (21 of 32), 10 other
  card mixes.

## Paid trips fast, new prices, go home +2 and the card mix D1 (version 2.0, step 2.7, owner-approved 2026-11-19)

The owner's new rules, then the balance tuning. Rules in full: `docs/rules-now.md` ([2.7]).

- **Travel turns** (`PAID_TRAVEL_TURNS`, `FREE_TRAVEL_TURNS`, `travelTurns(profile, kind, paid)`, `Travel.paid`): a paid
  ticket is fast (plane, train, bus 0; ship 1; car 1), a free one, the quiz or hitchhiking, slow (plane, train, bus 1;
  ship 2; car 1), for every profile. The Backpacker never pays. A paid trip after the 3rd wrong quiz answer is fast.
- **Tickets:** train for the Nomad 1 (was 2); car rental for Business and Luxury 2 (was 1), the Nomad 1.
- **Nomad:** +1 only for a trip to a new area of at least 1 travel turn (a paid plane, train or bus gives nothing); the
  ship +2 of step 2.6 and the +5 for 3 continents are removed; the boss alerts come only on free ship trips to new areas,
  on the 2nd (last) travel turn, by turns (challenge, then +1). The robot Nomad's "rush to a 3rd continent" rule is off
  (it followed the +5).
- **Businesses** (`BUSINESS_PRICE`): tours 1, airline 2, ferry 2, train, bus and car booths 1. At the end every player
  owning the most businesses (at least 1) gets +1 (`MOST_BUSINESSES_BONUS`, `mostBusinessesBonus`, counted in
  `finalScore`); ties go to more businesses (`businessCount`), then continents, then areas (`rank`).
- **Go home +2** (`GO_HOME_POINTS`): every time, also after the 3rd wrong quiz answer and when already at home
  (a `home` reward, shown as "🏠 Home again!").
- **Luxury +5 at the start:** proposed by the owner, measured, and **dropped** (owner's decision, see Balance).
- **Event cards, mix "D1"** (`EVENT_MIX`, replaces 2.6's "G"): 2 players: Business 1.1 / 0.95, the others the normal
  deck; 3–4 players: Backpacker 0.93 / 1.3, Business 1.2 / 0.87, Luxury 1.3 / 0.85, Nomad 1.1 / 0.92 (good / bad).
- **Robots** (owner-approved): the planning robots (`src/engine/planner.ts`, the lab's planner) weigh paying against
  the quiz: each travel turn saved (and the expected quiz wait) is worth `TURN_VALUE` = 2.5 points; a ticket is paid
  when it is worth it. Measured with the Luxury +5: 2.5 gave every profile its highest average score of 5 styles (the first new
  version, quiz first as before, always pay, 1.5, 2.5); checked again without the +5 against always pay and 1.5: still
  the best on average (Luxury level with 1.5). Robots now pay for 40–60% of their trips
  (before 2–12%). The easy robot still tries the quiz first.
- **Screens:** before a quiz trip, a player who could pay sees "⚠️ Attention! The quiz trip is slower" (the quiz time,
  the paid time, "Take the quiz", "Pay N instead", "Cancel"); the airport, port, station and bus menus and the area panel
  give both times; profile cards ("fast when it pays", "slower with the free quiz"); the guide ("Paying is faster, the
  quiz is slower"; businesses decide close games; the welcome slide's tie rule); a 0-points reminder that selling a
  business brings points; the end screens show the score's parts, the business count, the +1 and the tie rule; the
  score chips show ⭐+1 for the most businesses; "go home" texts say +2.
- **Save version 19:** a game in progress from version 18 or older can't be continued.
- **Tests:** updated to the new rules (no test limit changed), new tests for paid and quiz travel times, go home +2
  (also at home), the most-businesses +1 and the tie order, the car and train prices, the card mix D1.
- **Balance (robot games, 1,600 per line, both maps, 2 and 4 players, normal and planning robots; details in
  `docs/balance-lab.md`, step 2.7):** before (the 2.6 game) **29 of 32**; the owner's rules with the Luxury +5 and the
  corrected robots 11 of 32 (Luxury 39–48% of 4-player wins); undoing one change at a time showed the **Luxury +5 as the
  cause** (without it 26 of 32; every other change 1–13). Final, without the +5 and with mix D1: **29 of 32**. Misses:
  Backpacker 18% and Business 32% (30 turns, 4 players, planning), Backpacker 31% (50 turns, 4 players, normal); the two
  maps need opposite changes there, which one card mix can't give. Boredom 23–28% (was 27–34%), lead changes 2.2–5.7,
  games won by 3 points or less 20–39%, draws 0–1 per 1,600, go home after 3 turns without money 0, longest blocked
  streak 2, failed visa tests 15–18%.
- **Measured and not adopted:** card mixes inside 45–59% bad cards (best 27 of 32); keeping the +5 with stronger cards
  (best 28 of 32, Luxury 78% bad cards); 8 rule simplifications together (26 of 32); one mission per player (26 of 32).

## News cards about the country and one card mix per map (version 2.0, step 2.8, owner-approved 2026-11-20)

Rules in full: `docs/rules-now.md` ([2.8]). Card texts: `docs/cards.md`.

- **News about the country (owner):** the 45 country cards are short news items about the country where the player
  stands, no longer personal events. A card's text holds {country}, {capital} and {currency}; `newsCard` in
  `src/engine/engine.ts` fills them in when the card is drawn, from `src/cards/countries.ts` (made by
  `node scripts/card-countries.ts` from `data/countries.json`: name, with "the" where English needs it, capital,
  currency, size). Several currencies in the data: the first, except Cuba (Cuban peso) and Zimbabwe (US dollar).
- **Areas with several countries:** they take turns by the number of cards drawn in the game so far (no dice, so the
  robot games are not changed by the texts); countries under a tenth of the area's biggest are left out (no Andorra in
  "News from Iberia"). Test maps without real countries use the area's name.
- **Big countries (owner):** a card that names the capital has a second text (`big`) used in a part of a big country,
  so "News from USA West" never says Washington. The drawn card keeps only the filled-in text.
- **No own-area cards (owner, option 1):** a1–a12 became general cards c34–c45 with the same points and new texts;
  all 45 come everywhere. Counts: +1 ×17, −1 ×11, +2 ×5, −2 ×3, lose a turn ×5, +5 ×2, −5 ×2 (47% bad, was 55% of
  the 33 cards for anywhere). `Area.cardsFrom` and the `area` field stay in the code, unused by the cards.
- **One card mix per map** (`EVENT_MIX['30' | '50']`, `cardMix(profile, players, totalRounds)`), mix "N1": D1 adjusted
  to the 45 cards (the same bad shares), then per map: 30 turns, 4 players, Backpacker fewer bad cards (1.6) and
  Business more (1.3); 50 turns, 2 players, Backpacker 1.5 and Nomad 1.25; 4 players, Backpacker 1.9 and Nomad 1.15.
  Table in `docs/rules-now.md` §8.
- **Texts:** three approved texts were shortened a little to keep the 110-character test limit (c11, c14, c33).
- **Save version 20:** a game in progress from version 19 or older can't be continued.
- **Tests:** the two tests of own-area cards now check that every card comes everywhere (also in Peru and Bolivia on
  the 50-turn map, naming that country); new test: all 45 cards filled in every area of both maps, never a capital in
  a big country; the card-mix test checks N1 on both maps. No test limit changed. 226 tests pass.
- **Balance (1,600 games per line, details in `docs/balance-lab.md`, step 2.8):** before **29 of 32**, after
  **30 of 32**. Misses: the Backpacker with 4 players and normal robots, 31% (30 turns) and 30% (50 turns), within
  chance; the planning robots' Backpacker on the same maps is at 20% and 23%, so cards can't move both. Boredom
  23–28% (the same), lead changes 2.3–5.7, won by 3 or less 22–39%.
- **Screens that show the rules (owner, same session; screens only, no rule or balance change):**
  - Start map: each continent shows its welcome bonus ("Africa +3"); a chosen continent shows the player's icon and its
    name only (no profile name, no piece in the area).
  - Choosing a profile: a popup lists the profile's advantages (`profileNote(p, GOOD_ONLY)`), with "✔ Play as …" and
    "↩ Choose another" (nothing is chosen until "Play as"). Nomad texts: "Gets paid +1 during trips to new areas"; the
    boss alerts are no longer mentioned (a surprise).
  - "It's your turn" popup: progress towards every bonus: the 6 continents ("Europe 1/12 · all +4"; N./S. America), the
    big countries ("USA 0/3 · all +5"), the wonders ("Wonders 0/7 · each +1 more"), the Backpacker's "Bonus 1/3
    continents +7", the Business's "Citizenship 1/2"; a chip whose number went up since the player's last turn glows
    (`lastChips`). About 12.5 px on screen (11.5 on short screens, with a smaller profile icon).
  - World map: only the visited dots of the player whose turn it is (a robot's too), a bit bigger, kept small in small
    areas (Korea).
  - Name box: "+🏢2 (+1)" for the most businesses (was "⭐+1").
  - Free or paid trip (was "⚠️ Attention! The quiz trip is slower"): "[Profile]: free or paid trip", "Free quiz = 1
    travel turn / 3-point ticket = 0 travel turns (you arrive right away) / Wrong quiz answer = miss a turn"; shown when
    the player taps the quiz or the ticket and both are possible; "Take the quiz" and "Pay N" (no Cancel).
  - Rule notices, each with "OK, I understand" and "Don't show this again" (kept on the device, `kaj-info-*-off`,
    `kaj-quiz-notice-off`): 🛂 visa before entering another player's country (texts by profile: the Business pays
    nothing, Luxury takes no test); 🏢 the first time a player can buy a business (once per game); 🏠 on the 2nd turn in
    a row blocked by money ("Blocked 2 turns · 3rd blocked turn = go home +2").

## Passport and records at the end of the game (version 2.0, step 2.10, owner-approved 2026-11-20)

Screens only: no rule, robot, balance or save change (the save stays version 20). Rules in `docs/rules-now.md` §11.

- **End popup (owner's design):** two columns. Left: the trophy, the title, a cheer for every winning person (robots
  never; the other places are not mentioned) and, under it, "🏆 New record: Nth best win on this device (30 turns)" ("the best win" for 1st)
  when the win entered the top 10 (shorter in a shared win). Right: the ranking (detail on a small second line), a
  "🛂 Passport" button on each person's row (none for robots), then "▶ Play again" and "🏆 Records". "See the map" is
  gone; there is no Leave button (owner): the phone's back button already asks "Leave the game?". The tie-break line
  is no longer in the popup (it stays in the board's end panel).
- **Passport and records open over the popup** (`openOverlay` in `src/web/main.ts`), with "✕ Close"; closing them
  leaves the popup as it was. The back button closes them first.
- **Passport (`src/web/passport.ts`):** a navy blue cover (owner: blue for everyone) with the country of citizenship and its flag; page 1 a data
  page (the profile icon as the photo; type P, 3-letter code, passport number; name = the profile name; nationality;
  journey turns and players; date of issue; areas · continents · points; two 44-character machine-readable lines);
  then stamp pages, 6 a page, two pages at a time with ‹ ›: one ink stamp per area visited (the start area too), in
  the order visited, in its continent's colour, with the continent, the flag, the area name and "ARRIVED · n" (no
  dates: the game keeps none). Owner: no wonder or home marks. The cover country is the start citizenship (a big
  country: its name); the **Digital Nomad** shows its start country with "Nationality: none". An area with several
  countries shows the area's name and the flag of its first country (also on stamps). 3-letter codes:
  `src/web/passport-codes.ts`, made by `node scripts/passport-codes.ts` from `data/countries.json`.
- **Records (`src/web/records.ts`, `tests/records.test.ts`):** each person's win is kept on the device
  (`kaj-records`), once per game, robots never: points, areas, continents, profile, players, date. One top-10 list
  per game length, **by points** (owner's choice after measuring 400 robot winners per map: areas tie too often,
  8 of the top 10 on 30 turns), then more areas; on a full tie the older win stays ahead. The records screen has a
  tab per length and marks today's new wins. A browser that blocks storage keeps no records.
- **Tests:** 4 new (ranking, top 10, unreadable storage, ordinals); 230 pass.

## Kris Ann, the 5th profile (version 2.0, step 2.11, owner-approved 2026-11-21)

Rules in full: `docs/rules-now.md` ([2.11]). Chosen from `docs/profiles8.md` (the Explorer), then named Kris Ann, the
game's heroine, by the owner. Measured in scratch copies first (`docs/balance-lab.md`, step 2.11); the built game
measures exactly the same (all 40 results identical to the scratch version "KA5").

- **Profile `krisann`** (`Profile`, `PROFILES`, last in the list): "Kris Ann" on every screen, a 3D compass icon
  (`src/web/icons.ts`, colour `#1f9c8a`).
- **Choosing:** with 5 profiles and at most 4 players everyone chooses; "the last player gets the one left" is removed.
  **A robot takes Kris Ann if she is free** (`normal-robot.ts`), otherwise a random free profile.
- **+3 extra for every big country she finishes** (`KRISANN_BIG_COUNTRY_EXTRA`, `bigCountryReward(profile, parts)`),
  also all at once by bus or car: USA, Canada, Russia +8; China, Brazil, Australia +6. Robots and both planners use
  `bigCountryReward`.
- **Never owns a business** (`ownsNoBusiness`): no `buy` action, never offered a sale.
- **Tickets:** plane 4 (`KRISANN_PLANE_PRICE`), ship, train, bus and car 2; she may take the bus (`canRide`). Normal
  travel times (paid fast, quiz slow) and the free quiz, so the stuck-state checker is unchanged. Only the start
  citizenship.
- **Card mix "TG"** (`EVENT_MIX`, all 5 profiles, one per map) and **"lose a turn" cards half as often** for everyone
  (`LOSE_TURN_WEIGHT` = 0.5). TG was tuned before the owner's 44–64% bad-card limit of the later tests: some shares are
  lower (Nomad 32–36%).
- **Kris Ann's own 8 cards** (`src/cards/cards.ts`, deck `krisann`, ids k1–k8, replacing the Backpacker's unused helper
  cards b1–b8): drawn only by her, together with the news cards (`KRISANN_CARD_WEIGHT` = 1: each as often as one news
  card), **none twice in a game** (`Player.ownCards`); `points` in the 30-turn game, `points50` in the 50-turn game
  (30 / 50: +2/+2, +1/+1, +1/+1, 0/+1, 0/0, −1/−1, −1/−1, −2/−1). About 1.2 a game; none in about 1 game in 4.
- **Screens:** her card is a picture popup like the wonder posters (the owner's 8 pictures, `assets/krisann/k1–k8.webp`,
  960 px, about 26 KB each, inlined by `scripts/build-web.ts` as `KAJ_KRISANN`), with "🧭 Kris Ann & Dad", the title,
  the text, the points and OK; shown to **every player, also when Kris Ann is a robot** (the robot waits for OK; the
  only robot popup people see); never the phone news. Profile popup and side note (her advantages and limits), the
  guide's profiles slide (a 5th line), the big-country chips and the bus/car line show her +8 / +6.
- **Guide (owner-approved, 12 slides):** the profiles slide is gone (players see each profile when they choose it);
  "Travel faster" is 3 slides (the 5 ways to travel; the free quiz, with the 3-wrong-answers rule; a paid / free quiz
  table of travel turns, the car and challenges); the citizenship slide has a clearer text ("another player's
  citizenship country") and a real visa test for France (6 facts from the game, "I'm ready", 3 timed questions), then
  "Welcome to France!" or "No entry into France"; "area" instead of "country" where points are counted.
- **Audit fixes (screens):** the car and bus texts show the player's own big-country points (Kris Ann +8 / +6); the bus
  is "Nomad, Backpacker and Kris Ann"; businesses and guided tours say "Kris Ann never owns a business" to her; the
  profile popups and area details show each profile's own car price (before, always the Nomad's 1 point).
- **Lab (owner-approved):** `measure2.ts`: seat 0 stands for the person and chooses a profile at random among the free
  ones; the robots take Kris Ann first, so she is in every robot game. `report2.ts`: a Kris Ann column; the old 4
  profiles counted as before (of 32), Kris Ann apart (of 8).
- **Save version 21:** a game in progress from version 20 or older can't be continued.
- **Tests:** `tests/krisann.test.ts` (tickets and the bus, +3 by car, no business, the robot's choice, her cards: only
  hers, none twice, 50-turn points); setup (5 profiles, no "last one left"), car prices, card mix TG, save 21. The news
  cards keep their 110-character limit and their allowed strengths; Kris Ann's cards (longer, some 0 points,
  owner-approved) are checked by their own lines and on the 568×320 screen. 235 tests pass.
- **Balance (1,600 games per line, details in `docs/balance-lab.md`, step 2.11):** before (the game of step 2.10)
  **30 of 32**; after **old profiles 26 of 32, Kris Ann 8 of 8 (34 of 40)**. Misses, all on the 50-turn map: Business
  35% / 68% (2 players, normal / planning robots) and 19% / 30% (4 players), Backpacker 36% / 16% (4 players): each
  the same profile doing well with one robot type and badly with the other, which no card mix can fix. Boredom 25.3% →
  26.2%, lead changes 3.84 → 4.60, won by 3 or less 29.5% → 31.8% (averages of the 8 lines).

## The 100-turn map, catch-up and the new card mixes (version 2.0, step 2.12 part J2, owner-approved 2026-11-22)

Rules in full: `docs/rules-now.md` ([2.12]). Decided and measured in J1 (`docs/map100.md`, `docs/card-mix-2.12.json`,
`docs/balance-lab.md` step 2.12); built in J2 exactly as measured. The 100-turn game is in the engine but **not in the
setup screen** until part J5 (`SETUP_LENGTHS` = 30, 50).

- **Map `map100`** (`src/maps/map100.ts`, made by `node scripts/map100-review.ts` from the same lines as the plan): 126
  areas, 238 walking links, 25 plane and ship routes plus the train, bus and car of the 50-turn map. Area order,
  neighbour order and route order are the plan's (they change the robot games). `GAME_LENGTHS` = 30, 50, 100; `mapFor(100)`,
  `mapById('map100')`; `rounds: 100`.
- **Facts until part J4 (test only, never released):** each area borrows the facts and the test-only geography facts of
  its 50-turn area(s) (`inside`), joined in that order (Uganda, Rwanda & Burundi: Kenya & Uganda, then Tanzania).
- **Cards:** every 5th land turn on 100 turns (`cardEvery`, as on 50 turns); Kris Ann's cards use `points50` on 100
  turns (as on 50 turns). Card mixes (`EVENT_MIX`, exact values of `docs/card-mix-2.12.json`): 30 and 50 turns "K1-3",
  100 turns "F3-2" (`cardMix`: 100 turns or more use '100').
- **Catch-up on every map** (`CATCH_UP` 30: 1, 50: 1, 100: 3; `catchUpFor`, `withCatchUp` in `engine.ts`): at a card
  draw, the single highest `finalScore` multiplies the bad weight by (1 + catch-up), the single lowest the good weight;
  nobody else changes, a shared top or bottom changes nothing. Applied to the profile's mix before the card is picked. A
  secret rule: no text on any screen. A test-only switch (`GameConfig.catchUp`, on by default, owner's choice A) turns
  it off: only the step 2.11 card-mix test uses it, so that test still measures the card mix alone (with catch-up on,
  random-robot Nomads often lead and draw more bad cards than Luxury: 41.4% against 38.9%).
- **Lab (owner-approved in J1):** `lab2.ts … --lines=100` plays the 4 lines of the 100-turn game (default: the 8 lines
  of 30 and 50 turns); `--first=<game>` starts at that game number (default 1; `--first=3201` plays new games).
  `report2.ts` counts fair results of the lines given (4 lines of 20, 8 lines of 40).
- **Save version 22:** a game in progress from version 21 or older can't be continued.
- **Tests:** `tests/map100.test.ts` (map check, stuck-state checker, trap counts 41 of 6,786 pairs and 1,084 of 109,567
  start sets, big countries, borrowed facts, businesses, random-robot 100-round games with cards every 5th land turn and a
  save), `tests/catchup.test.ts` (leader, last, ties, businesses counted, ×1 and ×3, the switch); card mixes of all 3 maps against
  the JSON (`tests/cards.test.ts`), game lengths (`tests/map50.test.ts`), save 22 (`tests/rotation.test.ts`).
- **Proof (lab, games 1–3,200 per line, 1 run each):** the built game measures exactly as the J1 scratch versions. 30
  and 50 turns: 33 of 40 (old profiles 25 of 32, Kris Ann 8 of 8), boredom 26.2%, lead changes 5.40, won by 3 or less
  42.9% (K1-3). 100 turns: 16 of 20, boredom 25.1%, lead changes 10.52, won by 3 or less 50.2% (F3-2), every win share
  and average score as in `docs/balance-lab.md`, step 2.12. 249 tests pass; the web build works (setup: 30 and 50 turns).

## The 100-turn map shapes (version 2.0, step 2.12 part J3, owner-approved plan 2026-11-22)

No rule, balance, save or screen change; the 100-turn game stays out of the setup screen until part J5.

- **Shapes:** `node scripts/map-shapes.ts --from <file> --map 100` makes `src/maps/shapes100.ts` (195 KB, 126 areas) and
  `docs/map-shapes100.md` from the same Natural Earth 1:10m admin-1 data as M3 (downloaded outside the project). The
  big-country parts use the 50-turn lists (same part ids); every other area is joined from its countries in `map100.ts`.
  Places that are not countries in the map data go to the 100-turn area they lie in (`AREA_100`): Somaliland → Somalia,
  Åland → Finland, Faroe Islands → Denmark & Greenland, Hong Kong and Macau → China East, Siachen Glacier → India,
  Baikonur → Kazakhstan, Guantánamo, Puerto Rico, Trinidad and Tobago → Caribbean, Gibraltar → Spain, Isle of Man, Jersey,
  Guernsey → United Kingdom, French Guiana → Venezuela & Guianas.
- **Checks:** every country of the map is found in the data (none named differently beyond the old `ALIASES`); the 20
  small countries are all drawn (each island group has at least one island shape: Maldives 5, Cabo Verde 8, São Tomé and
  Príncipe 2, Comoros 3, Seychelles 1, Mauritius 1, Malta 2, Bahrain 1, Singapore 1, Bahamas 23; the others are joined to
  a neighbour). Every walking link touches on the drawing except the Channel Tunnel (France ↔ United Kingdom) and the
  Øresund Bridge (Denmark & Greenland ↔ Sweden); China West touches Myanmar without a link (as on the 30- and 50-turn
  maps). The 30- and 50-turn shapes, re-made from the same data, are byte-identical.
- **Pawn spots:** `node scripts/map-centres.ts` adds `map100` to `src/maps/centres.ts`; the `map30` and `map50` entries are
  unchanged.
- **Screens:** `SHAPES` in `src/web/main.ts` has `map100`, so a 100-turn game (a saved one) draws with its own shapes. The
  web game file grows from 4,820 to 5,020 KB.
- **Tests:** `tests/map-shapes100.test.ts` (every area drawn; drawn borders against walking links, with the two fixed links
  and China West – Myanmar; the 7 islands with no walk touch no area); `tests/centres.test.ts` checks the 3 maps. The
  "no drawn prop over another area" check for the 100-turn map waits for part J5 (owner).

## The 100-turn map facts (version 2.0, step 2.12 part J4, owner-approved plan 2026-11-25)

No rule, balance, save or screen change; the 100-turn game stays out of the setup screen until part J5. Two sessions, both done.

- **Owner's decisions:** the plan as proposed; test facts **A** (every area gets 2 test-only geography facts); geography
  about **35–40%** of what a player sees, never dominating (as in step 2.3; the new facts are about half geography).
- **Facts (`src/maps/map100.ts`, made by `node scripts/map100-review.ts`):** the 55 areas that are the same place as on the
  50-turn map keep their 12 facts and 2 test facts. The 71 other areas take the facts of their 50-turn area(s) sorted by
  country (`src/facts/sort100.ts`, `SORT_100` and `EXAM_SORT_100`, sorted by Claude fact by fact; a fact about several
  parts goes to each, joined with "+"; "-" leaves out a fact that repeats another in the same area: Ganvié, Gulf of
  Guinea 8), then new facts (`src/facts/new100.ts`, `FACTS_100_NEW` and `GEO_EXAM_100_NEW`) up to 12 and 2. Needed after the
  sort: **480 new facts** (Europe 153, Asia 112, Africa 156, North America 48, South America 11; the sort saved 24, not the
  10% of the plan) and **71 new test facts** (Europe 23, Asia 17, Africa 24, North America 5, South America 2). Every new fact
  has its type in `src/facts/tags.ts`; every test fact is geography.
- **Review pages** (`node scripts/facts100-review.ts`): `docs/facts/new100-1.md` (Europe and Asia), `docs/facts/new100-2.md`
  (Africa and the Americas), `docs/facts/sort100.md` (where each 50-turn fact went).
- **Session 1 (2026-11-25):** the whole sort; Europe and Asia written: 265 facts (136 geography, 51%) and 40 test facts, to
  be checked by the owner. Until session 2, an area with fewer than 12 facts or 2 test facts (Africa and the Americas) still
  borrows all the facts of its 50-turn area(s), as in J2. Tests (`tests/map100.test.ts`): the sort covers every fact of
  each split area and sends it only to areas inside it; every area has at least 12 facts and 2 test facts, every fact a type,
  every test fact geography; Europe and Asia exactly 12 and 2 with no fact twice. Replaces J2's borrowing test. 260 tests
  pass; the web build works (5,084 KB).
- **Session 2 (2026-11-25):** Africa 156, North America 48, South America 11 facts (215, 117 geography, 54%) and 31 test
  facts, to be checked by the owner (`docs/facts/new100-2.md`). No area borrows any more: every area has exactly 12 facts
  and 2 test facts, no fact twice in an area (this also ends J2's repeats in Uganda, Rwanda & Burundi). In all, 480 new
  facts (253 geography, 53%) and 71 test facts. `docs/map100.md` notes the result. Tests: every area exactly 12 and 2.
- **Geography (`node scripts/geo-count.ts`, now also the 100-turn map, 200 games per line):** 100-turn map facts 39%
  geography (1,512 facts, 1,445 different); questions asked **35% (2 players), 38% (4 players)**, inside the owner's
  35–40%. 30 turns 35% / 38%, 50 turns 36% / 38% (unchanged maps).
- **Robot games:** robots answer at a fixed rate whatever the question, so new facts change only which question is drawn;
  the 30- and 50-turn games are unchanged. Lab run of the 100-turn lines (owner-approved, games 1–3,200 per line): **identical to
  J2 on every line**, 16 of 20 (`docs/balance-lab.md`, step 2.12 J4). 260 tests pass; the web build works (5,118 KB).

## The visa test with challenges and the notebook (version 2.0, step 2.12c, owner-approved 2026-11-25/26)

Owner: the visa test was too repetitive (it drew only from the area's 12 facts and 2–3 test facts). No rule, save or
balance change: only which questions the test draws, and how its notes look.
- **Pool (`makeExam` in `src/engine/quiz.ts`):** the area's facts, its test-only geography facts, then the challenges about
  its countries of the types in `VISA_CHALLENGE_TYPES`: **capital, neighbour and money** (owner's choice A). Each challenge
  is read first as a study line made from its answer (`challengeStudyLine`: "The capital of Spain is Madrid.", "Spain
  borders Andorra.", "The money of Spain is the Euro."; "the" as the other challenges write the country). Never flags (a
  study line can't show the flag). Questions still come from the player's rotation (step 2.1), which the airline quiz shares.
- **Pool size (average per area):** 30 turns 14 → 24, 50 turns 14 → 20, 100 turns 14 → 18.
- **Geography (`node scripts/geo-count.ts`, 200 games per line; challenge study lines now counted too):** all 5 non-flag
  types gave 40–42% with 4 players, over the owner's 35–40%; choice A: 30 turns 34% / 40%, 50 turns 37% / 40%, 100 turns
  36% / 39% (2 / 4 players); the visa test itself 47–53%. Also measured: capital and money only, 34–36% / 38–39%.
- **The notebook (screens only, `studyNotebook` in `src/web/main.ts`, `.notebook` in `web/style.css`):** the notes as a
  notebook page: cream lined paper, red margin line, spiral rings, the title "Study notes for your visa: <area>" in a
  handwriting font of the device (the system font where there is none), a tilted red "VISA TEST" stamp, numbered notes,
  and "3 questions · 15 seconds each · 2 right to pass". The page opens once per test (0.45 s); redrawn after another
  popup, it stays still; nothing keeps moving (step 2.2). Styles only, no picture files. Checked at 667×375, 900×430,
  1280×720 and 1920×1080 (screenshots for the owner); the game file grows 5,118 → 5,122 KB.
- **Tests:** the visa test's 6 lines in the area's order with 3 different questions, and 12 different questions in 4
  tests, now with the challenges (`tests/citizenship.test.ts`, `tests/rotation.test.ts`; no limit changed); every
  non-flag challenge has a study line with its answer; flags never come. 261 tests pass.
- **Lab (owner-approved, 3,200 games per line, same seeds as J2):** 30 and 50 turns 34 of 40 (J2 33), 100 turns 18 of 20
  (J2 16); every win share within 2 points of J2 (the dice change with the questions drawn), boredom and excitement the same (`docs/balance-lab.md`, step 2.12c).

## Area names on the maps (owner, 2026-11-25; screens only)

On the area view and the home-country map of all 3 maps (`areaNames` in `src/web/main.ts`; helpers in `src/web/maps.ts`):
a name may stick out of its area **over sea**, never over another area; it sits on the part of its area that is on screen;
it is never cut at the edge of the map or under a walk badge or drawn icon (such a name is hidden instead). A long name
may take **2 or 3 lines**, split after "," or "&"; if it still doesn't fit, **North, South, West, East become N., S., W.,
E.** (`nameLayouts`). **Map names** (drawing only; the engine and every other screen keep the area's name): on the
100-turn map Serbia, Kosovo & North Macedonia is drawn as "Central Balkans" and Somalia as "Horn of Africa" (`MAP_NAME`).
No rule, balance or save change. Tests: `tests/map-names.test.ts`. Stricter test and no names on Greenland or Hawaii
since step 2.12 J5 ("The 100-turn screens").

## Big countries and area colours on the maps (step 2.12b, owner-approved 2026-11-25; screens only)

All 3 maps (`colourAreas` and `buildGeo` in `src/web/maps.ts`, drawing in `drawMap` in `src/web/main.ts`):
- **One colour per big country** (USA, Canada, Russia, China, Brazil, Australia: all parts the same colour).
- **No two areas share a colour** when they touch on the map, have a walking link, a plane or ship route, or lie within
  **500 km across the sea** (`SEA_KM`; also across the date line, Alaska and Russia Far East). This fixes Madagascar and the
  mainland, and New Zealand and Australia East (50-turn map).
- **10 colours** (owner's choice B): the 8 before, plus teal `#26a69a` and light green `#abdda4` (with 8 or 9, the 100-turn
  map had an area with no colour left). The most constrained area is coloured first (DSatur), each with its least-used
  free colour.
- **Borders inside a big country** are thin and dashed (`innerBorders`: a line in the country's colour covers the normal
  border); where a part glows (the area you stand in, one you can walk to, or one visited in the guide) the dashes go
  over the gold line, so both show. On the game's maps and in the guide (Canada in 3 parts); not on the continent picker.
- The colours are made in advance with the pawn spots (`node scripts/map-centres.ts` writes `src/maps/colours.ts`), so the
  phone doesn't compute them at the start. Tests: `tests/colours.test.ts`. No rule, balance or save change.

## The 100-turn screens (version 2.0, step 2.12 part J5, owner-approved 2026-11-26)

Screens only: no rule, balance or save change; the robot games and the balance lab are not affected (not run). The map
stays as approved in J1 except the one name below (owner, 2026-11-26).

- **Session 1:** records get a "100 turns" tab; Angkor Wat on the 100-turn map (`cambodia`) uses the existing drawing.
  Denmark's zoom leaves Greenland out (`OUTLYING` in `src/web/maps.ts`; pawn spot remade, map30 and map50 identical).
  Walk badges on all 3 maps move towards their own area when they overlap another badge or sit on another area
  (`badgeSpot` in `src/web/main.ts`; script check at 667x375: wrong-area badges 30 turns 33 → 6, 50 turns 53 → 13,
  100 turns 101 → 23; overlaps 1 → 0, 1 → 0, 9 → 2; the owner accepted the ones left, e.g. Austria's badge on Germany in
  the Switzerland view). New props test for the 100-turn map (`tests/props-place.test.ts`).
- **Session 2, setup:** `SETUP_LENGTHS` = 30, 50, 100; the setup text for 100 turns is "100 rounds around the whole
  world." (30 and 50 keep theirs). The three Journey buttons have less side padding (`.journey` in `web/style.css`) so
  they fit on one line at every screen size (before: "100 turns" took a second line at 667x375, 1280x720, 1920x1080).
- **Denmark (owner):** Greenland is not a country. The area `denmark` is named **"Denmark"** (was "Denmark & Greenland";
  `scripts/map100-review.ts` remade `src/maps/map100.ts` and `docs/map100.md`; only the name changed, the id stays, so
  saves and robots are the same). Greenland's land stays in its area (as Scotland in the United Kingdom); the area
  details and the end-of-turn popup no longer list a "Greenland" row (all 3 maps; `countryRows`).
- **Area names (all 3 maps, `areaNames`):** a name is never over another area. The test points are now every 0.2 of a
  letter along each line in 5 rows (before: 5 points a line, which missed thin land, e.g. Scotland under "Denmark &
  Greenland"), with the real width of the text (measured once; the old guess was up to 11% short). Only areas whose box
  meets the name are tested (fast). A name never goes on an area's far-away part (Greenland, Hawaii: `isOutlying`); it
  sits on the main part or is hidden. Script check on the home maps of every continent, 3 maps, 4 sizes: names over
  another area 40 → 1 (a thin edge of India under "Indochina", 30 turns, 900x430); a few names that touched a neighbour
  are now hidden. Speed (CPU slowed 6×): a drag or pinch step on the area view as before; opening a continent about
  twice as long (about 1.4 s against 0.6 s slowed, about 0.25 s against 0.1 s at normal speed).
- **Final check (script):** a 100-turn game started from the setup screen and played 3 rounds at 667x375, 900x430,
  1280x720 and 1920x1080 (setup, continent picker, the 6 home maps, area view, world map); no page error.
- **App:** the Play Store app needs a new signed build with the new `index.html` in step 2.13 (versionCode raised with
  the owner's OK).
- Tests: `tests/map100.test.ts` checks `SETUP_LENGTHS` = 30, 50, 100. 262 tests pass; the web build works.

## Project setup

- TypeScript, run directly by Node 22.18 or newer (no build step for tests).
- Only development tools: `typescript` and `@types/node`. No game dependencies.
- GitHub Actions (`.github/workflows/ci.yml`) runs the type check and tests on every pull request.
- Art from the owner: `assets/art/` (poster and background, landscape and portrait).
