# KAJ — all game rules as of 2026-11-22

Checked against the code (`src/engine/`, `src/maps/`, `src/cards/`) and `docs/engine.md`.
Rules marked **[2.6]** came with step 2.6 and **[2.7]** with step 2.7 (both 2026-11-19), **[2.8]** with step 2.8 and **[2.10]** with step 2.10 (both 2026-11-20), **[2.11]** with step 2.11 (2026-11-21), **[2.12]** with step 2.12 part J2 (2026-11-22). Rules marked
**[2.12, not yet playable]** are in the engine but the 100-turn game is not in the setup screen until step 2.12 part J5. Where a new rule replaced
an older one, the old one is shown ~~struck out~~.

## 1. Players and setup

- 2–4 players on one device, each a person or a robot (at least 1 person, at most 3 robots).
  Robots: easy, normal or hard.
- A random first player, then always the same order.
- ~~4 profiles: Backpacker, Business, Luxury, Digital Nomad. Each profile only once. They are chosen in
  turn order, and the last player gets the one left.~~ **[2.11]** 5 profiles: Backpacker, Business, Luxury, Digital
  Nomad, **Kris Ann**. Each profile only once, chosen in turn order; everyone chooses (no "last one left").
- **[2.11]** A robot takes Kris Ann if she is still free; otherwise a random free profile. So Kris Ann is in every
  game with a robot.
- Start area: every player starts on a different continent (Europe, Asia, Africa, North America,
  South America, Oceania; never Antarctica).
- **[2.6]** Only one player may start in a country. This matters only for Russia, whose parts lie on
  two continents.
- Welcome bonus: Europe, Asia, Africa +3; North and South America +4; Oceania +5.
- Game length: 30 rounds (53 areas, 7 wonders) or 50 rounds (84 areas, 11 wonders). Every player gets
  every round.
- **[2.12, not yet playable]** 100 rounds: 126 areas, 11 wonders (those of the 50-turn map), big countries in the same
  parts as on the 50-turn map; the plan is `docs/map100.md`.

## 2. Moving

- On a turn a player walks to a neighbouring area, or takes a trip (section 4).
- Two players are never in the same area.
- **Booked areas:** an area someone is travelling to is closed to everyone else until they land.
- **Blocked:** a player with no move at all loses the turn ("blocked").
- **Go home:** a player blocked for the 3rd turn in a row goes home, if at least one way out was
  closed by money (not only by players in the way). Home is the start area, or the nearest free area
  if someone stands there. Going home is free, with the normal arrival points. Nobody is ever
  eliminated.
- **[2.7] Going home gives +2**, every time (also after the 3rd wrong quiz answer, section 4, and also when
  the player already stands at home), so the player can pay a visa and start again.

## 3. Points

- New area +1. An area already visited gives 0.
- First arrival on a new continent +2 (not the start continent).
- Wonder, first visit: +1 more (the area point plus 1).
- **Big countries** (USA, Canada, Russia, China, Brazil, Australia; split into parts): a part gives 0
  until every part is visited. The last new part then gives +1 +N (2 parts: +3). A country in 3 parts
  (USA with Alaska, Canada, Russia) gives +5.
- **Whole continent:** every area of a continent visited gives, once:
  - 30 turns: Europe 4, Asia 5, Africa 3, North America 3, South America 2, Oceania 2;
  - 50 turns: Europe 6, Asia 8, Africa 6, North America 3, South America 3, Oceania 2;
  - **[2.12, not yet playable]** 100 turns: Europe 11, Asia 12, Africa 11, North America 4, South America 4, Oceania 2.
- **Madagascar** (50 turns; **[2.12, not yet playable]** and 100 turns): a secret SURPRISE +3 on the first arrival. It is never announced.
- Points never go below 0.
- **End of the game:** points plus the price of every business owned.
  - **[2.7]** Every player owning the most businesses (at least 1) gets **+1**.
  - ~~Ties are broken by more continents, then more areas.~~ **[2.7]** Ties are broken by **more businesses**,
    then more continents, then more areas; a full tie is a draw.

## 4. Trips

| Kind | Who | Ticket | **[2.7]** Travel turns: paid / free (quiz or hitchhiking) |
|---|---|---|---|
| Plane | everyone | Nomad 1, Business 2, Luxury 3, **[2.11]** Kris Ann 4, Backpacker quiz only | 0 / 1 |
| Ship | everyone | the same (**[2.11]** Kris Ann 2) | 1 / 2 |
| Train (France ↔ Russia West or Turkey) | not Luxury | Business 2, Nomad ~~2~~ **[2.7] 1**, **[2.11]** Kris Ann 2, Backpacker quiz only | 0 / 1 |
| Bus (Mongolia → Siberia or China West, one way) | Nomad, Backpacker and **[2.11]** Kris Ann | Nomad 1, **[2.11]** Kris Ann 2, Backpacker quiz only | 0 / 1 |
| Car (Mexico → USA East or Canada West, one way) | everyone | Nomad 1, Business and Luxury ~~1~~ **[2.7] 2**, **[2.11]** Kris Ann 2 (no quiz); the Backpacker hitchhikes | 1 / 1 |

- **[2.7] Paid is fast, free is slow, for every profile.** The Backpacker never pays, so its trips always
  take the free time. ~~Old travel turns by profile: plane Backpacker and Nomad 1, Business and Luxury 0;
  ship Backpacker and Nomad 3, Business and Luxury 1; train, bus and car 1.~~ A paid trip after the 3rd
  wrong quiz answer is a paid trip (fast).
- **[2.7]** Before a quiz trip, a player who could pay (Nomad, Business, Luxury) sees a notice: the quiz
  trip takes longer than the paid one. **[2.8]** The notice only informs (quiz time, paid time, a wrong answer misses
  a turn), comes for a paid trip too, has no Cancel, and can be turned off ("Don't show this again").

- **Routes:** fixed routes, 1 or 2 destinations each; all plane and ship routes are two-way.
  - 30 turns: 13 airports, 11 ports.
  - 50 turns: 15 airports, 13 ports.
  - **[2.12, not yet playable]** 100 turns: 17 airports, 23 ports (25 routes); train, bus and car as on the 50-turn map.
  - Luxury may fly to any airport and sail to any port.
- **Airline quiz** (free ticket): one a/b question about the destination (9 in 10 from its facts,
  1 in 10 a challenge question), 15 seconds.
  - Right: board for free.
  - Wrong: the turn ends.
  - After the 3rd wrong answer in the same area, a player who can pay pays and travels; one who can't
    goes home.
- **Bus and car:** the destination country's points come at once (Russia +5, China +3, USA +5,
  Canada +5). Its other parts still give +1 each when first visited.
- **Hitchhiking** (secret, never shown): a car stops only if the Backpacker arrived in Mexico on an
  even round. If none stops, nothing happens and the player moves another way.
- **Challenges on trips:** on each travel turn a player may play one challenge (flags, capitals,
  continents, neighbours, bigger country, currency): right +1, wrong −1. Never obligatory, and not
  offered with 0 points. The Nomad gets none, except on its boss's turns (section 5).
- **Fees on a trip** (visa, tour fee) are paid at boarding, together with the ticket. A citizenship
  or tours that appear during the trip cost nothing on landing.
- A trip goes nowhere if its destination is booked or someone stands there.

## 5. Profiles

- **Backpacker:** never pays a ticket (quiz, or hitchhiking). +7 on reaching a 3rd continent (the
  start continent counts).
  - **[2.6]** No longer draws its 8 helper event cards (b1–b8). ~~They stay in the game's files, unused,
    in case step 2.7 needs them for balance.~~ **[2.11]** They were replaced by Kris Ann's 8 cards.
- **Business:** cheaper and faster trips (table above).
  - ~~+6 when granted citizenship~~ **[2.6]** removed.
  - **[2.6]** May take one 2nd citizenship, free (section 6).
  - **[2.6]** Never pays a visa, but takes the visa test.
- **Luxury:** fastest trips, flies and sails anywhere, can't take the train or the bus.
  - ~~Citizenship granted at once~~ **[2.6]** Never takes the visa test, but pays the visa.
- **Digital Nomad:** ticket 1 (plane, ship, train, bus, car).
  - +1 for every trip to an area it has not visited yet (0 to a visited one). **[2.7]** Only for a trip
    of at least 1 travel turn: a paid plane, train or bus (0 turns) gives nothing; a paid ship or car, and
    every quiz trip, gives +1.
  - ~~**[2.6]** A ship trip to a new area gives +2.~~ **[2.7]** removed.
  - **Boss alerts:** **[2.7]** only on free (quiz) ship trips to new areas, on the 2nd (last) travel turn,
    by turns. The 1st, 3rd, 5th … such trip may play one challenge; the 2nd, 4th … get a +1 bonus. A paid
    ship brings no alert.
  - ~~+5 on reaching a 3rd continent.~~ **[2.7]** removed.
  - Never holds a citizenship.
- **[2.11] Kris Ann** (the game's heroine, travelling with her Dad):
  - **+3 extra for every big country she finishes:** USA, Canada, Russia +8; China, Brazil, Australia +6. Also when
    the bus or the car gives the whole country at once.
  - May take the bus (Mongolia → Russia +8 or China +6).
  - **Never owns a business:** can't buy one and is never offered one.
  - Tickets: plane 4; ship, train, bus and car 2. Normal travel times (paid fast, quiz slow), the free quiz as everyone.
  - Only the start citizenship.
  - Her own 8 cards (section 8).

## 6. Citizenship and visas

~~Old rules (task 14d/14f): ask in the area you stand in (once per game, never the home country),
test next turn (read 6 facts, 3 questions, 2 right to pass), Luxury granted at once, Business +6.~~

**[2.6] New rules:**

- **Citizenship from turn 1:** every player except the Nomad is a citizen of their start country (a
  big country: all its parts). There is no asking and no citizenship test any more.
- Backpacker and Luxury: only this one citizenship.
- **Business, a 2nd citizenship:**
  - free (0 points), at any time on its turn;
  - only for the area (or big country) it stands in;
  - only if nobody holds that citizenship and it is not the Nomad's start country;
  - buying does not end the turn;
  - at most one; not counted at the end; can't be sold.
- **One citizen per country.**
- **Visa:** 2 points to the citizen on **every entry** into their country from outside. Moving between
  parts of the same big country is free, and the citizen enters free.
- **Visa test, on every entry:**
  - read 6 notes about the area, then answer 3 a/b questions in the same turn; **[2.12c]** the notes come from the area's
    facts, its test-only geography facts and the capital, neighbour and money challenges about its countries (each as
    a sentence with its answer), shown as a notebook page;
  - 15 seconds each, started with "Start";
  - **2 of 3 right:** pay the visa and enter;
  - **fewer:** nothing paid, no entry, the turn is used.
  - The Business takes the test but never pays; Luxury pays but never takes the test.
- **No money, no entry:** the test is offered only with the visa (and any ticket and tour fee) in hand.
- **Walking:** the test comes before entering; if it fails, the player stays where they were.
- **Plane, ship, train, bus, rented car:**
  1. first the ticket (pay, or a right airline-quiz answer);
  2. then the visa test;
  3. then everything is paid together.

  If the test fails: no trip and nothing paid. The free quiz ticket is lost, and the failed test does
  not count as a quiz try.
- **After the 3rd wrong quiz answer** (the forced paid trip): the visa test too. If it fails: no trip,
  nothing paid, and the try count starts again.
- **Hitchhiking:** the test only if a car stops. If it fails: no trip, and the turn ends.
- **Going home** is free: no test, no visa.

## 7. Businesses

| Business | Where | Price **[2.7]** (was) | Earns |
|---|---|---|---|
| Guided tours | each wonder | 1 (2) | 1 point each time another player enters the area |
| Airline | each airport | 2 (3) | paid plane tickets from there |
| Ferry agency | each port | 2 (2) | paid ship tickets from there |
| Train booth | France, Russia West, Turkey | 1 (2) | paid train tickets |
| Bus booth | Mongolia | 1 (2) | paid bus tickets |
| Car rental | Mexico | 1 (2) | paid car rentals |

- **Buying:** the player standing in the area may buy, if nobody owns it and they can pay. **[2.11]** Never Kris Ann. It does
  not end the turn, and there is no limit per player.
- **Selling:** on their own turn, before moving, a player may offer one business to another player
  who can pay its price; the buyer answers yes or no. One offer per turn, never to a player who is
  travelling.
- **At the end:** each business counts its price; **[2.7]** owning the most businesses gives +1, and more
  businesses break a tie (section 3).
- **[2.7]** A player with 0 points who owns a business sees a reminder that selling one brings points back.
- **Strict fees:** no money, no entry. A visa and a tour fee must be in hand to enter (with the ticket
  for a trip).

## 8. Event cards

- **When:** on every 3rd turn a player begins in an area (30 turns) or every 5th (50 turns; **[2.12, not yet
  playable]** and 100 turns). Trip turns don't count, and there are none in the last round.
- **Cards:** 45 news cards for everyone. ~~33 for anywhere, 12 only in their own area.~~ **[2.8]** All 45 can come
  everywhere: +1 ×17, −1 ×11, +2 ×5, −2 ×3, lose a turn ×5, +5 ×2, −5 ×2 (the 12 old own-area cards became general
  cards with the same points).
- **[2.8] News about the country where the player stands:** each card names that country, its capital or its
  currency (real data). In an area with several countries they take turns (very small ones are left out). In a part
  of a big country (USA, Canada, Russia, China, Brazil, Australia) a card never names the capital. ~~Personal events
  ("your phone battery dies").~~
- ~~The Backpacker's 8 helper cards (b1–b8, all +1 or +2) stay in the files, but **[2.6]** nobody draws
  them.~~ **[2.11]** They are replaced by **Kris Ann's 8 cards** (below).
- **[2.11] "Lose a turn" cards come half as often** as the other bad cards, for everyone.
- **Card mix by map and profile** (~~**[2.7]** mix "D1"~~, ~~**[2.8]** mix "N1"~~, ~~**[2.11]** mix "TG"~~, **[2.12]** mix
  "K1-3" for 30 and 50 turns, "F3-2" for 100 turns, exact values in `docs/card-mix-2.12.json`). The same cards; only how
  often good and bad ones come (good × / bad ×, rounded; bad share of the 45 cards, with "lose a turn" half as often).
  Owner (J1): bad shares outside 44–64% are accepted.

  | Map | Profile | 2 players | 3 or 4 players |
  |---|---|---|---|
  | 30 turns | Backpacker | 1 / 0.84: 39% bad | 0.93 / 1.95: 62% bad |
  | 30 turns | Business | 1.1 / 1.06: 43% bad | 1.2 / 1.8: 54% bad |
  | 30 turns | Luxury | 1 / 1.22: 48% bad | 1.3 / 1.25: 42% bad |
  | 30 turns | Nomad | 1.1 / 0.54: 28% bad | 1.1 / 0.82: 37% bad |
  | 30 turns | Kris Ann | 1 / 1.44: 53% bad | 1 / 0.81: 38% bad |
  | 50 turns | Backpacker | 1 / 1.44: 53% bad | 0.93 / 2.3: 66% bad |
  | 50 turns | Business | 1.1 / 1.5: 51% bad | 1.2 / 1.36: 47% bad |
  | 50 turns | Luxury | 1 / 1.47: 53% bad | 1.3 / 1.27: 43% bad |
  | 50 turns | Nomad | 1 / 0.8: 38% bad | 1.1 / 0.91: 39% bad |
  | 50 turns | Kris Ann | 1 / 1.06: 45% bad | 1 / 0.76: 37% bad |
  | 100 turns **[not yet playable]** | Backpacker | 1 / 1.69: 57% bad | 1 / 1.48: 53% bad |
  | 100 turns **[not yet playable]** | Business | 1 / 1.85: 59% bad | 1 / 1.53: 54% bad |
  | 100 turns **[not yet playable]** | Luxury | 1 / 1.85: 59% bad | 1 / 1.06: 45% bad |
  | 100 turns **[not yet playable]** | Nomad | 1 / 2.55: 66% bad | 1 / 0.89: 41% bad |
  | 100 turns **[not yet playable]** | Kris Ann | 1 / 0.51: 28% bad | 1 / 0.57: 31% bad |

  ~~TG (step 2.11): 30 turns Backpacker 1 / 0.91 and 0.93 / 1.81, Business 1.1 / 0.79 and 1.2 / 1.44, Luxury 1 / 1.12 and
  1.3 / 1.23, Nomad 1.1 / 0.66 and 1.1 / 0.81, Kris Ann 1 / 1.48 and 1 / 1.03; 50 turns Backpacker 1 / 1.29 and
  0.93 / 2.25, Business 1.1 / 1.13 and 1.2 / 1.19, Luxury 1 / 1.24 and 1.3 / 1.21, Nomad 1 / 0.72 and 1.1 / 0.81, Kris Ann
  1 / 1.25 and 1 / 0.97.~~
  ~~N1 (step 2.8): 30 turns Backpacker 1 / 1.37 and 0.93 / 1.6, Business 1.1 / 1.3 and 1.2 / 1.3, Luxury 1 / 1.37 and
  1.3 / 1.17, Nomad 1 / 1.37 and 1.1 / 1.26; 50 turns Backpacker 1 / 1.5 and 0.93 / 1.9, Business 1.1 / 1.3 and
  1.2 / 1.19, Luxury 1 / 1.37 and 1.3 / 1.17, Nomad 1 / 1.25 and 1.1 / 1.15.~~
- **[2.12] Catch-up** (secret, never shown, like hitchhiking): at a card draw, the player with the single highest score
  (points plus businesses, as at the end) draws bad cards (1 + catch-up) times as often; the player with the single
  lowest score draws good cards (1 + catch-up) times as often; nobody else changes, and nothing changes when the top or
  the bottom score is shared. Catch-up: 30 and 50 turns **1** (twice as often); **[2.12, not yet playable]** 100 turns
  **3** (4 times as often).
- **[2.11] Kris Ann's own cards:** 8 cards about Kris Ann and her Dad, each reminding of one rule. Only Kris Ann draws
  them, together with the news cards (each as often as one news card), and **none comes twice in a game** (about 1 or
  2 a game). Everyone sees them as a picture popup, also when Kris Ann is a robot (the only robot popup people see);
  never as phone news. Points (30 turns / 50 turns; **[2.12, not yet playable]** 100 turns: the 50-turn points): 1 Good at quizzes +2 / +2; 2 A wonder! +1 / +1; 3 One more area
  to go +1 / +1; 4 Exploring is good 0 / +1; 5 Visa required 0 / 0; 6 Not for sale −1 / −1; 7 Too fast! −1 / −1;
  8 The missed plane −2 / −1. Texts: `src/cards/cards.ts` and `docs/cards.md`.

## 9. Questions

- No question comes again until the player has seen the whole pool. People's history is kept on the
  device and shared by all human players; robots start fresh each game.
- About 37% (30 turns) and 32–33% (50 turns) of all questions are geography.

## 10. Saves

- The game saves after every move; one save slot.
- A save from another version can't be continued. The version is **[2.12] 22** (2.11: 21).

## 11. Passport and records [2.10]

- **End of the game:** the popup shows the ranking, a "Congratulations" for every winning person (robots and the
  other places are not cheered), a "🛂 Passport" button for each person, "▶ Play again" and "🏆 Records". It stays
  until "Play again" (the phone's back button still asks "Leave the game?").
- **Passport:** a blue cover with the country of citizenship and its flag (the Digital Nomad: its start country, nationality
  "none"); a data page with the profile icon and name, the journey and the final numbers; then a stamp for every area
  visited, in the order visited, 6 a page.
- **Records on this device:** the 10 best wins by a person, one list per game length, by points (then more areas).
  Robots never enter. Nothing leaves the device.
