# KAJ — all game rules as of 2026-11-19

Checked against the code (`src/engine/`, `src/maps/`, `src/cards/`) and `docs/engine.md`.
Rules marked **[2.6]** are the ones decided in step 2.6, session 1. They are **not in the game yet**;
session 2 builds them. Where a [2.6] rule replaces an older one, the old one is shown ~~struck out~~.

## 1. Players and setup

- 2–4 players on one device, each a person or a robot (at least 1 person, at most 3 robots).
  Robots: easy, normal or hard.
- A random first player, then always the same order.
- 4 profiles: Backpacker, Business, Luxury, Digital Nomad. Each profile only once. They are chosen in
  turn order, and the last player gets the one left.
- Start area: every player starts on a different continent (Europe, Asia, Africa, North America,
  South America, Oceania; never Antarctica).
- **[2.6]** Only one player may start in a country. This matters only for Russia, whose parts lie on
  two continents.
- Welcome bonus: Europe, Asia, Africa +3; North and South America +4; Oceania +5.
- Game length: 30 rounds (53 areas, 7 wonders) or 50 rounds (84 areas, 11 wonders). Every player gets
  every round.

## 2. Moving

- On a turn a player walks to a neighbouring area, or takes a trip (section 4).
- Two players are never in the same area.
- **Booked areas:** an area someone is travelling to is closed to everyone else until they land.
- **Blocked:** a player with no move at all loses the turn ("blocked").
- **Go home:** a player blocked for the 3rd turn in a row goes home, if at least one way out was
  closed by money (not only by players in the way). Home is the start area, or the nearest free area
  if someone stands there. Going home is free, with the normal arrival points. Nobody is ever
  eliminated.

## 3. Points

- New area +1. An area already visited gives 0.
- First arrival on a new continent +2 (not the start continent).
- Wonder, first visit: +1 more (the area point plus 1).
- **Big countries** (USA, Canada, Russia, China, Brazil, Australia; split into parts): a part gives 0
  until every part is visited. The last new part then gives +1 +N (2 parts: +3). A country in 3 parts
  (USA with Alaska, Canada, Russia) gives +5.
- **Whole continent:** every area of a continent visited gives, once:
  - 30 turns: Europe 4, Asia 5, Africa 3, North America 3, South America 2, Oceania 2;
  - 50 turns: Europe 6, Asia 8, Africa 6, North America 3, South America 3, Oceania 2.
- **Madagascar** (50 turns): a secret SURPRISE +3 on the first arrival. It is never announced.
- Points never go below 0.
- **End of the game:** points plus the price of every business owned. Ties are broken by more
  continents, then more areas; a full tie is a draw.

## 4. Trips

| Kind | Who | Ticket | Travel turns |
|---|---|---|---|
| Plane | everyone | Nomad 1, Business 2, Luxury 3, Backpacker quiz only | Backpacker and Nomad 1; Business and Luxury 0 |
| Ship | everyone | the same | Backpacker and Nomad 3; Business and Luxury 1 |
| Train (France ↔ Russia West or Turkey) | not Luxury | Business 2, Nomad 2, Backpacker quiz only | 1 |
| Bus (Mongolia → Siberia or China West, one way) | Nomad and Backpacker only | Nomad 1, Backpacker quiz only | 1 |
| Car (Mexico → USA East or Canada West, one way) | everyone | Nomad, Business, Luxury rent for 1 (no quiz); the Backpacker hitchhikes | 1 |

- **Routes:** fixed routes, 1 or 2 destinations each; all plane and ship routes are two-way.
  - 30 turns: 13 airports, 11 ports.
  - 50 turns: 15 airports, 13 ports.
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
  - **[2.6]** No longer draws its 8 helper event cards (b1–b8). They stay in the game's files, unused,
    in case step 2.7 needs them for balance.
- **Business:** cheaper and faster trips (table above).
  - ~~+6 when granted citizenship~~ **[2.6]** removed.
  - **[2.6]** May take one 2nd citizenship, free (section 6).
  - **[2.6]** Never pays a visa, but takes the visa test.
- **Luxury:** fastest trips, flies and sails anywhere, can't take the train or the bus.
  - ~~Citizenship granted at once~~ **[2.6]** Never takes the visa test, but pays the visa.
- **Digital Nomad:** ticket 1.
  - +1 for every trip to an area it has not visited yet (0 to a visited one).
  - **[2.6]** A ship trip to a new area gives +2.
  - **Boss alerts:** on ship trips to new areas, on the 3rd travel turn, by turns. The 1st, 3rd, 5th …
    such trip may play one challenge; the 2nd, 4th … get a +1 bonus.
  - +5 on reaching a 3rd continent.
  - Never holds a citizenship.

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
  - read 6 facts of the area, then answer 3 a/b questions in the same turn;
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

| Business | Where | Price | Earns |
|---|---|---|---|
| Guided tours | each wonder | 2 | 1 point each time another player enters the area |
| Airline | each airport | 3 | paid plane tickets from there |
| Ferry agency | each port | 2 | paid ship tickets from there |
| Train booth | France, Russia West, Turkey | 2 | paid train tickets |
| Bus booth | Mongolia | 2 | paid bus tickets |
| Car rental | Mexico | 2 | paid car rentals |

- **Buying:** the player standing in the area may buy, if nobody owns it and they can pay. It does
  not end the turn, and there is no limit per player.
- **Selling:** on their own turn, before moving, a player may offer one business to another player
  who can pay its price; the buyer answers yes or no. One offer per turn, never to a player who is
  travelling.
- **At the end:** each business counts its price.
- **Strict fees:** no money, no entry. A visa and a tour fee must be in hand to enter (with the ticket
  for a trip).

## 8. Event cards

- **When:** on every 3rd turn a player begins in an area (30 turns) or every 5th (50 turns). Trip
  turns don't count, and there are none in the last round.
- **Cards:** 45 news cards for everyone (33 for anywhere, 12 only in their own area). Effects: ±1, ±2,
  ±5, or lose a turn.
- The Backpacker's 8 helper cards (b1–b8, all +1 or +2) stay in the files, but **[2.6]** nobody draws
  them. They are kept as a possible balance lever for step 2.7.
- **[2.6] Card mix by profile.** The same cards; only how often good and bad ones come:

  | Profile | 2 players | 3 or 4 players |
  |---|---|---|
  | Backpacker | normal deck: 55% bad | bad cards 1.2× as often: 59% bad |
  | Business | good 1.1×, bad 0.95×: 51% bad | the same: 51% bad |
  | Luxury | normal deck: 55% bad | good 1.15×, bad 0.9×: 48% bad |
  | Nomad | normal deck: 55% bad | good 1.25×, bad 0.85×: 45% bad |

## 9. Questions

- No question comes again until the player has seen the whole pool. People's history is kept on the
  device and shared by all human players; robots start fresh each game.
- About 37% (30 turns) and 32–33% (50 turns) of all questions are geography.

## 10. Saves

- The game saves after every move; one save slot.
- A save from another version can't be continued. Today the version is 17; **[2.6]** makes it 18.
