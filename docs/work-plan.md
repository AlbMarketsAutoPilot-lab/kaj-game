# KAJ v1 — work plan (15 days)

Status: **approved by the owner** (2026-10-07).
Every session reads this file after `CLAUDE.md`, `docs/KAJ-v1-scope.md` and `docs/engine.md`.

## How every session starts

1. Read the 4 documents above.
2. Find the **first task below that is not done** (status table).
3. Tell the owner: the task, its effort level (switch to high or medium), and the plan for it.
4. Wait for approval (`CLAUDE.md` rule 2). Ask the open questions listed for that task.
5. At the end: tests pass, the web build works, pull request, and **update the status table**.

Every task also adds its part to the test board, so there is **always a playable build**.

## Dates

- Day 1 = 2026-10-07 (tasks 1–4 done). **Day 15 = 2026-10-21: v1 finished.**
- Pace so far: tasks 1–4 took about one day. The plan below needs about **20 sessions in
  14 days** (about 1.5 per day), which leaves about **1 day of buffer**.
- One "session" = one focused task in one chat. Claude cannot see the plan limits; the owner
  watches them. If a day is lost, use the cut order (bottom of this file).

## Frozen games

- **30- and 50-turn games frozen (owner, 2026-10-10):** no more changes to their rules, maps, data,
  texts, screens or saved-game formats. Next: planning the 100-turn map (owner).
- **Next session (new chat): task 15, publishing the signed AAB on Google Play.** Version 1.0 = the 30- and
  50-turn games as they are now (frozen), with no mention of the 100-turn game or 8 profiles.
- **Future standalone paid app (owner, 2026-10-11):** the 100-turn game with 8 profiles, built later as a
  separate app (section L, `docs/map100.md`, `docs/profiles8.md`). Version 1.1 of this app will mention it.
- **Profile balance and planning robots (owner, 2026-10-11), then the final freeze** of the 30- and
  50-turn games: see `docs/engine.md` ("Profile balance and planning robots") and `docs/balance-lab.md`.
- **100-turn map planned (L1, 2026-10-10):** proposal in `docs/map100.md`, waiting for the owner's answers. See section L.

- **Version 2.0 (owner, 2026-11-16):** the 30- and 50-turn games are **unfrozen**; plan and order in
  section "Version 2.0" below (status rows 2.1 … 2.12, one per step).

## Status table

| # | Task | Effort | Sessions | Day | Status |
|---|---|---|---|---|---|
| 1 | Project setup, rules engine skeleton | medium | — | 1 | ✅ done |
| 2 | 30-turn map, airports/ports, stuck-state checker | high | — | 1 | ✅ done |
| 3 | First playable screen (test board) | medium | — | 1 | ✅ done |
| 4 | Wonder and big-country scoring | high | — | 1 | ✅ done |
| 5 | This work plan | high | 1 | 1 | ✅ done |
| 6 | Android shell and APK build (early) | medium | 1 | 2 | ✅ done |
| 7 | Planes, ships, tickets, airline quiz | **high** | 1 | 2 | ✅ done |
| C | Facts: about 12 per area (5 batches, in parallel) | medium | 1.5 | 3–8 | ✅ done |
| 8 | Visas and citizenship (exam) | **high** | 2 | 4–5 | ✅ done |
| 9 | Businesses, strict fees, go home | **high** | 1 | 6 | ✅ done |
| 9b | Selling, 2 areas with airport and port | **high** | 1 | 6 | ✅ done |
| 10 | Profile bonuses, save and resume | medium | 1 | 7 | ✅ done |
| 11 | Event cards | medium | 1 | 7–8 | ✅ done |
| 12 | Challenges (6 types from open data) | medium | 1.5 | 8–9 | ✅ done |
| 13 | Robot: easy, normal and hard | medium | 1 | 10 | ✅ done |
| 14 | Real screens, art and sounds | medium | 5 (A1, A2, B1, B2, C) | 11–14 | A1 ✅ A2 ✅ B1 ✅ B2 ✅ C ✅ (sounds: 13 Pixabay files, music, 🔊 button) |
| 14a | Canada and Russia in 3 parts (+5 bonus) | **high** | 1 | 11 | ✅ done (24 new facts checked by the owner) |
| 14b | Ships Australia East ↔ New Zealand and USA West ↔ Alaska; Alaska as a 3rd USA part (+5) | **high** | 1 | 12 | ✅ done (12 facts to check) |
| 14d | Citizenship asked in the area you stand in (button) | **high** | 1 | 12 | ✅ done |
| 14e | Guide for new players (owner's script, first ▶ Play + 📖 How to play) | medium | 1 | 14 | ✅ done |
| 14f | Fair citizenship test: read 6 facts, 2 of 3 right to pass, "Start" before each question | **high** | 1 | 14 | ✅ done |
| 14g | Short area names, shown on the maps where they fit; 🏛️ for wonders; the guide says who wins | medium | 1 | 14 | ✅ done |
| 14h | Players named by profile (no Red/Blue), with 4 shaded profile icons as map pieces and in the top bar | medium | 1 | 14 | ✅ done |
| 14i | Calmer turns: the walk is shown with footsteps, "You arrived…" and ✔ End turn, "It's your turn" hand-over, slower robots; white border on the icons | medium | 1 | 14 | ✅ done |
| 14j | Trip turns: plane and ship scenes on the background painting, with who is travelling and "No thanks" | medium | 1 | 14 | ✅ done |
| 14k | Events as phone news: the phone buzzes (only "Read"), then the card with a headline and "What this means for you"; 53 headlines to check in docs/cards.md | medium | 1 | 14 | ✅ done |
| 14l | Every screen fits every size: the interface scales to the screen (checked at 667×375, 900×430, 1024×768, 1280×720, 1920×1080); guide line on long trips | medium | 1 | 14 | ✅ done |
| M1 | 50-turn map: area list, wonders, airports and ports (`docs/map50.md`, made by `node scripts/map50-review.ts`) | **high** | 1 | 13 | ✅ done (owner-approved 2026-10-09: 84 areas, 11 wonders, 21 connections, train and bus) |
| M2 | 50-turn map: engine (map choice, data, timing, stuck-state checker, 1,000 robot games, saves v11) | **high** | 1 | 13–14 | ✅ done (owner-approved 2026-10-09: 151 walking links, ship from Portugal, Madagascar ↔ Zambezi, cards every 5 turns, v10 30-turn saves still load) |
| M3 | 50-turn map: shapes, facts sorted by country (write only the missing ones) | medium | 1 | 14 | ✅ done (owner-approved 2026-10-09: 12 facts per area, 330 new) |
| M4 | 50-turn map: screens (turn picker, home country, world map, guide), web and APK | medium | 1 | 15 | ✅ done (owner-approved 2026-10-09: screens, and the 4 new wonder drawings) |
| M5 | 50-turn map: full test games and fixes | medium | 3 | 15 | ✅ sessions 1 (guide, texts, money names, What happened switch), 2 (map screens) and 3 (rules: bus, whole continents, Madagascar, saves v12) |
| M6 | Wonder posters for the 7 wonders of the 30-turn map (the 4 of the 50-turn map come with M4) | medium | 1 | 13 | ✅ done |
| 15 | Android release build (signed AAB for Play, built by the owner in Android Studio) | medium/high | 1 | — | 1.0.0 rejected 2026-10-14 (unresponsive: start-up freeze on slow phones); 1.0.1 (code 3) in review; 1.0.2 (code 4, privacy and copyright pages) ready to build; see section 15 |
| 17 | Train France ↔ Russia West and France ↔ Turkey (30-turn map): A rules **high**, B screens medium | **high** / medium | 2 | 13–14 | done (A rules, robots, tests, save 9; B screens, sound) |
| 18 | Bus from Mongolia to Siberia or China West (30-turn map), whole country at once | **high** | 1 | — | done (owner-approved 2026-10-09) |
| 15v | Visual polish (owner, 2026-10-10): no rule, text or save changes | medium | 1 | — | ✅ done; the in-game "Leave the game?" popup needs the owner's phone test (Galaxy S25: map no longer shakes?) |
| 16 | Full-game tests, bug fixes, buffer | medium | 1–2 | 15 | |
| B | Profile balance and planning robots, both games (test-only lab first, then the rules; saves v13) | **high** | — | 5 | ✅ done (owner, 2026-10-11): final freeze of the 30- and 50-turn games |
| 19 | The car in Mexico (both games): rent 1 (Nomad, Business, Luxury), Backpacker hitchhikes (secret: even arrival round), USA +5 at once; turn buttons without "walk, fly and sail"; saves v14 | **high** | 1 | — | ✅ done (owner, 2026-10-11): the last change, then the final freeze |
| L1 | 100-turn map: plan (`docs/map100.md`, made by `node scripts/map100-review.ts`) | **high** | 1 | 4 | ✅ proposal done; moved to the future standalone app (owner, 2026-10-11) |
| W | Windows app for the Microsoft Store (WebView2 app packaged as MSIX): see section W | medium | 2–3 | — | session 1 code written (2026-10-18), not yet built: needs the owner's Visual Studio build and PC test |
| L2 | 100-turn map: engine (map100, points for 4–5 parts, cards every 10, timing, stuck-state checker, 1,000 robot games, save stays 12) | **high** | 2 | standalone app | |
| L3 | 100-turn map: shapes (new splits; 30- and 50-turn shape files unchanged) | medium | 1 | standalone app | |
| L4 | 100-turn map: facts (sort the 50-turn facts, about 580 new ones; owner checks about 5 days) | medium | 2 | standalone app | |
| L5 | 100-turn map: screens (turn picker, small areas, 4 wonder drawings, guide), web and APK | medium | 2 | standalone app | |
| L6 | 100-turn map: full test games and fixes | medium (high if a rule changes) | 2 | standalone app | |
| 2.1 | Question rotation: no repeat until the pool is used up, kept on the device; bigger airline-quiz pool | medium | 1 | — | ✅ done (one memory per device, owner's choice A; saves v15; lab before/after in `docs/balance-lab.md`) |
| 2.2 | Flickering on slow tablets and Galaxy S25: measure, fix, owner's phone test | medium | 1 | — | ✅ done (walk glow and guide map glow still, no pulse; small drawings keep moving, owner); the owner's phone test runs over the coming months |
| 2.3 | More geography questions: tag every fact, ~250 new geography facts (owner checks), script-made questions | medium | 2 | — | ✅ done (owner-approved): every fact tagged, airline quiz 1 challenge in 10, 168 test-only geography facts, travel challenges geography 1 in 3; 37% / 32–33% geography (was 48–50%); script-made questions not needed; save stays 15 |
| 2.4 | New ship and plane routes on both maps, map check, stuck-state checker | **high** | 1 | — | ✅ done (owner-approved): the owner's routes on both maps (30 turns 13 airports / 11 ports / 15 connections, 50 turns 15 / 13 / 18), robots no longer walk straight back for nothing, Pacific route lines from both ends, guide says Iceland; fair 13 → 10 of 16 (30) and 12 → 14 of 16 (50), tuning in 2.7; saves v16 |
| 2.5 | Travel by profile (turns, prices, quiz = Backpacker turns, quiz popup), bus and car whole country | **high** | 2 | — | ✅ done (owner's final decision, 2026-11-18): only the Nomad boss alerts (+1 per trip to new areas only; ship alerts: a challenge, then a +1 bonus, by turns; surprise removed) and the car to USA East or Canada West; the rest of 2.5 dropped; saves v17 |
| 2.6 | Citizenship from turn 1, Business buys 2nd/3rd, visa test | **high** | 2 | — | ✅ done (owner's final rules, 2026-11-19): start citizenship for all but the Nomad, the Business's one free 2nd citizenship (never pays visas), visa test on every entry (Luxury pays with no test), Nomad ship +2, event-card mix "G" (helpers b1–b8 kept, not drawn); fair 21 → 29 of 32 at 1,600 games per line; saves v18; `docs/rules-now.md` lists every rule |
| 2.7 | Balance tuning of all 2.0 rule changes (4 profiles, boredom, excitement) | **high** | 1 | — | ✅ done (owner's final decision, 2026-11-19): paid trips fast, quiz trips slow (with a notice), train Nomad 1, car Business/Luxury 2, cheaper businesses, +1 for the most businesses and business tiebreak, go home +2, Nomad changes; the Luxury +5 measured and dropped; robots weigh paying (2.5 points per saved turn); card mix D1; fair 29 of 32 (as before); saves v19 |
| 2.8 | Event cards as real geography news | medium | 1 | — | ✅ done (owner's decisions, 2026-11-20): the 45 cards are news about the country where the player stands (country, capital, currency filled in; no capital in big countries), the 12 own-area cards became general cards (same points), one card mix per map (N1); fair 29 → 30 of 32 at 1,600 games per line; boredom the same; saves v20; screens that show the rules (start-map bonuses, profile popup with "Choose another", bonus progress in "It's your turn", world-map dots of the current player only, free-or-paid, visa, business and go-home notices) |
| 2.9 | More wonders, history and curiosity for each, new design | medium | 2 | — | ⛔ stopped (owner, 2026-11-20): no new wonders; Petra and Angkor Wat (30 turns) and Victoria Falls (50 turns) measured 30 → 22 of 32 at 1,600 games per line; history and curiosity of the 11 wonders kept for later |
| 2.10 | Passport with stamps, records on the device | medium | 1–2 | — | ✅ done (owner-approved design, 2026-11-20): end popup in two columns (only winners cheered, new-record line, a passport button per person, Play again and Records, no Leave); passport cover with the citizenship and flag, data page, stamps 6 a page; records top 10 by points per game length; screens only, save stays 20 |
| 2.11 | Kris Ann, a 5th profile (the Explorer of `docs/profiles8.md`), her 8 cards with the owner's pictures | **high** | 1 | — | ✅ done (owner's final decisions, 2026-11-21): +3 per big country, bus, no business, plane 4, card mix TG with "lose a turn" half as often, her 8 cards (none twice a game, shown to everyone), robots take her first; 34 of 40 fair (old 26 of 32, Kris Ann 8 of 8) at 1,600 games per line (before 30 of 32); saves v21 |
| 2.12 | 100-turn map in this app (J1 plan high, J2 engine high, J3–J6 medium) | **high** / medium | ~10 | — | J1 ✅ done (owner's final decisions, 2026-11-22): 126 areas (`docs/map100.md`), big countries and the 11 wonders as on the 50-turn map, 25 routes in the 2.4 style; 100 turns: cards every 5, own mix, catch-up ×3 (F3-2, 16 of 20 at 3,200 games per line); 30 and 50 turns adopt catch-up ×1 (K1-3, 32 of 40 on new games, as today, more exciting); saves v22 in J2. J2 ✅ done (2026-11-22): map100 in the engine (hidden in the setup until J5), the three card mixes, catch-up on every map, lab options, saves v22; the built game measures exactly as J1 (33 of 40, 16 of 20). J3 ✅ done (2026-11-25): shapes of the 126 areas (`src/maps/shapes100.ts`), every country found, all areas drawn, pawn spots, `SHAPES` in the screens (still hidden in the setup). The map stays exactly as in J1 (owner, 2026-11-25). J4 ✅ done (2026-11-25, 2 sessions): every area 12 facts and 2 test facts; 480 new facts (53% geography) and 71 test facts for the owner to check (`docs/facts/new100-1.md`, `new100-2.md`); questions asked 35–38% geography. 2.12c ✅ (2026-11-26): the visa test also asks the capital, neighbour and money challenges (owner's choice A, geography 34–40%), notes shown as a notebook page. J5 ✅ done (2026-11-26, 2 sessions): 100 turns in the setup screen ("100 rounds around the whole world."), records tab, Angkor Wat, walk badges inside their area, area names never over another area or on Greenland/Hawaii, the area "Denmark & Greenland" renamed "Denmark" (owner: Greenland is not a country); screens only. J6 session 1 ✅ (2026-11-26): full 100-turn test games by script and screenshots at 4 sizes; fixes: one question clock at a time, no second "Halfway" after Continue, "Ferry promotion"; the owner's route changes measured (29 of 40, 12 of 20) and taken back, maps and saves (v22) as before. J6 owner's changes ✅ (2026-11-27): the guide in 16 slides; screens: softer turn glow, "from businesses", the visa after a free quiz, clearer wrong-answer texts, the start passport, "+🏢2=12" chips, the "free or paid" notice removed; two rules tried in the lab and taken back (people choose first: 32 of 40, 15 of 20; Kris Ann's cards: 33 of 40, 16 of 20; base 34, 18). Next: 2.13 (release) |
| 2.12b | Big countries look like one country on the 30-, 50- and 100-turn maps (owner, 2026-11-25): one colour for all parts, never the colour of a neighbour (also across the sea, e.g. Madagascar; New Zealand and Australia East on the 50-turn map), thin dashed borders between the parts | medium | 1 | — || ✅ done (owner-approved, 2026-11-25): one colour per big country, dashed borders inside it; no shared colour with an area touching, linked by a route or within 500 km across the sea; 10 colours (teal and light green added); screens only (`docs/engine.md`, step 2.12b) |
| 2.13 | Full test games, release 2.0 (web on kaj.kritere.com and app) | medium | 1–2 | — | Audit before 2.13 (2026-11-27): 13 test games, about 90 screens at 4 sizes, all findings fixed (screens only, no rule, balance or save change). |

## The tasks

### 6. Android shell and APK build (early) — day 2

Why early: the Android part is the only piece that is not plain web code, and it needs steps
from the owner (Android Studio, a phone, signing keys). Finding problems on day 2 is cheap;
on day 14 it could miss the deadline.

- A small Android project (one screen with a WebView) that shows the game file from inside
  the APK (works offline).
- GitHub Actions builds an APK on every pull request, so the owner can install each new
  version on a phone.
- Checks on a real phone: the test board works, saving works, the back button behaves.
- Owner steps: install the APK on a phone; later (task 15) create the signing key.
- Lowest Android version: **7.0** (owner-approved).
- Done: `android/` (one WebView screen, Java), `npm run android:assets` copies the game file in,
  `.github/workflows/android.yml` builds `app-debug.apk` (download it from the run page).

### 7. Planes, ships, tickets, airline quiz — days 2–3 (high)

- Arrive at an airport/port (one turn); on a later turn: walk on, or board.
- Choose a destination (1–3 fixed ones; Luxury: any airport or port).
- Pay the ticket (Nomad 1, Business 2, Luxury 3; Backpacker never pays, quiz only), or try
  the airline quiz (each try uses the turn; after the 3rd wrong answer you must pay; if you
  can't pay, you may keep trying).
- Travel time: plane 1 turn / ship 3 turns (Business and Luxury: 0 / 1).
- Travel turns: for now they just pass (challenges and event cards come in tasks 11–12).
  Nomad +1 for every travel turn.
- Ticket money goes to the owner of the departure airport/port (owners come in task 9).
- Quiz questions: placeholder questions from the map data until the facts are ready.
- Random robot (1,000 games) and stuck-state checker updated.
- Done: rules in `docs/engine.md` (task 7 and its 5 owner-approved choices), quiz questions in
  `src/engine/quiz.ts`, tests in `tests/travel.test.ts`, 1,000 games on the 30-turn map.

### C. Facts — days 3–8, in parallel with the engine tasks

- About 12 facts per area × 50 areas ≈ 600 facts, in 5 batches of 10 areas.
- Claude writes each batch **straight into a file** (not into the chat). The owner checks
  about 120 facts per day.
- Used by the citizenship exam (6 facts + 3 questions) and the airline quiz.
- This is the owner's biggest time cost, so it starts early.
- Owner-approved: each fact = one study line + one a/b question (right and wrong answer);
  the airline quiz switches to checked facts in task 8, not before.
- Done so far: `src/facts/batch1-5.ts` (all 50 areas in map order, 600 facts), review pages
  `docs/facts/batch-N.md` (made by `node scripts/facts-review.ts`), checks in `tests/facts.test.ts`.
  All 5 batches checked and corrected by the owner.

### 8. Visas and citizenship — days 4–5 (high)

- On arriving in a new area: "Ask for citizenship here?" (not the Nomad; once per game).
- Exam: turn 1 study 6 facts (45 s), turn 2 answer 3 a/b questions (30 s); all correct →
  granted on turn 3, otherwise one more turn showing the answers → granted on turn 4.
  Luxury: instant. Business: +3 for citizenship.
- Citizenship covers the whole area or big country.
- Visa: 2 points to the citizen, every time another player enters; moving inside is free;
  no money, no entry.
- Stuck-state checker with visas (keep the known limit from task 2b).
- Done: rules and the 7 owner-approved choices in `docs/engine.md` (task 8): the request is an
  option on the move, the owner's shorter timeline, no study step (3 questions, 15 s each), visa
  warning on the test board, no visa for a citizenship granted during a trip. Tests in
  `tests/citizenship.test.ts`; the airline quiz now uses the checked facts.

### 9. Businesses — day 6 (high)

- Guided tours (wonder, 2), airline (airport, 3), ferry agency (port, 2).
- The first player to arrive may buy (⭐ right to buy at a wonder); if not, the next one.
- Income: 1 point from every other player entering a tour area; tickets to the owner.
- No selling in v1.
- Done: rules and the 6 owner-approved choices in `docs/engine.md` (task 9): buying is an option
  on the move (no turn used), strict fees (no money, no entry), businesses count their price at
  the end, "go home" after 3 turns blocked by money. Tests in `tests/business.test.ts`.

### 9b. Selling and 2 areas with an airport and a port — day 6–7 (high)

- Selling (owner-approved in task 9): at the price it was bought for, to another player, who
  answers Yes or No on the same screen; robots accept if they can pay. Offered on the move panel,
  and suggested in the "out of money" warning.
- Map: UK & Ireland gets an airport (↔ Arabian Peninsula), Japan a port (↔ USA West). The test
  "each of the 9 connections is needed" checks only the original 9 (owner-approved).
- Stuck-state checker and 1,000 random games on the new map.
- This extra session uses the 1-day buffer.
- Done: rules and the 5 owner-approved choices in `docs/engine.md` (task 9b); no sale offers to a
  player who is travelling; 8 airports, 6 ports, 11 connections.

### 10. Profile bonuses, save and resume — day 7

- Backpacker +3 for 3 continents; Luxury +5 for 5 continents; Nomad −5 at the end with fewer
  than 3 continents (and the "Continents 2/3" bar); Backpacker tip for the Americas/Oceania.
- Automatic save after every move; "Continue game" on the start screen.
- Done: rules and the 9 owner-approved choices in `docs/engine.md` (task 10); `src/engine/save.ts`;
  continent bars, the Nomad warning from round 25, the tip, and the end-screen penalty line.

### 11. Event cards — days 7–8

- A card every 3 turns, and on a travel turn when the player says no to a challenge.
- Decks: country, plane, ship, Backpacker. Mostly ±1, some ±2 or "lose a turn", rare ±5.
- No keep cards and no mini missions in v1.
- About 40–60 cards, written into a file; the owner reads them once.
- Done: 53 cards in `src/cards/cards.ts` (review page `docs/cards.md`, made by
  `node scripts/cards-review.ts`), rules and the 11 owner-approved choices in `docs/engine.md`
  (task 11), including the visa and tour fee paid at boarding. Saves are version 2. Test limit for
  the longest trip raised from 8 to 10 (owner-approved).

### 12. Challenges — days 8–9

- The 6 types in the scope (flag, bigger, capital, continent, neighbours, currency), made by
  a script from open datasets. 15-second timer. Win +1, lose −1.
- Done: 995 questions in `src/challenges/challenges.ts` (review page `docs/challenges.md`, made by
  `node scripts/challenges-make.ts`), data from mledoze/countries (ODbL 1.0) and flags from
  flag-icons (MIT), credits on the start screen. Owner's changes: the 21 plane and ship cards rewritten as walking cards (53 cards); no event cards on trips (only
  challenges, never obligatory, none with 0 points); event cards count each player's land turns.
  Saves are version 3. Rules and the 9 owner-approved choices in `docs/engine.md` (task 12).
- Deferred (owner): a train France ↔ Russia West and France ↔ Turkey for Backpacker and Nomad
  (2 points, 1 travel turn, fees only on arrival, a train booth to buy). Only if time allows.

### 13. Robot: easy, normal and hard — day 10

- Random robot + simple rules: prefer new areas, wonders and finishing big countries; buy
  businesses it can afford; quiz or pay sensibly; answers quizzes right most of the time.
- Owner's change: **three levels** (easy, normal, hard), one robot with a level setting; right
  answers about 50% / 75% / 90%; a level picker on each robot seat (default normal).
- Done: `src/engine/normal-robot.ts`, rules and the owner-approved choices in `docs/engine.md`
  (task 13), tests in `tests/normal-robot.test.ts`, head-to-head report `node scripts/robot-report.ts`.
  Saves are version 4. Owner's rules added: 3 airline quiz tries for everyone (no money after the
  3rd wrong answer: go home), and booked areas (nobody goes to an area someone is flying or sailing to).

### 14. Real screens, art and sounds — days 11–13

- Replace the test board: setup (players, profiles, continent then area), the area view
  (neighbours, airport, port), world map with routes, exam, quiz, challenge, event card,
  end screen. Style of the owner's poster and backgrounds. Sounds from the owner.
- Phone first: portrait and landscape.
- Open question: how the world map looks (simple drawn map of the 50 areas, or a list view).
- **Guided help for human players (owner's request, task 10; planned here so it covers every
  feature):** each turn a short guide box explains what the player can do now and what it costs
  or earns (e.g. "You can ask for citizenship here: a test next turn, then every other player
  pays you 2 points to enter. You can also fly from here: 1 turn, ticket 1 point…"). Every guide
  box has a tick box "Turn off guided help"; once ticked, no guide boxes show (a setting that is
  kept on the device). The exact texts and when each shows are decided with the owner in task 14.
- Owner notes from the phone test (task 6):
  - The background (portrait and landscape) is stretched past the screen; the poster's borders
    must stay inside the screen.
  - Show the poster at the start of the game.
  - Write "Kris Ann's Journey" like on the poster, and use that design in the whole game.

- **Owner decisions (task 14, session A1):**
  - The view (rulebook section 2): a world view with the 6 continents (no Antarctica), then a zoom
    into the chosen continent, where the player taps their starting area ("home country"); after
    that, one area at a time, never zoomed out.
  - **Landscape only** (Android locked to landscape; a browser held upright shows "Please turn your
    phone"). Left half: the current area drawn with its airport, port and wonder, and its
    neighbours as tappable connections at the edges. Right half: a small world map with every
    player's position, trips on their route, booked areas and visited areas; tapping an area there
    shows its details (for planning, no moving).
  - **Real shapes, never labelled tiles**: `node scripts/map-shapes.ts --from <file>` builds
    `src/maps/shapes30.ts` from Natural Earth (public domain); review page `docs/map-shapes.md`.
    Big-country splits approved. The data is not changed (e.g. Crimea stays as Natural Earth
    draws it). Tibet (China West) touches Myanmar (Mainland Southeast Asia) on the map with no
    walking link: the rules stay as they are.
  - Sessions: A1 map shapes ✅; A2 poster, background, lettering, setup, area view with the world
    map, landscape lock, "1 point"; B quiz, exam, challenge, event card, sale, go home, end screen;
    C guided help, sounds, polish.
- **Done in A2:** start poster (borders inside the screen) with Play / Continue; background kept inside
  the screen; lettering in Cinzel (free, SIL Open Font Licence, inside the game file) like the poster;
  setup; home country picker (world with 6 continents → zoom → tap an area → the owner's message
  "… will be your home country for the whole game", not a citizenship, "go home" comes back here →
  "Start in …"); the board: left half the current area drawn with its neighbours (tap a green one to
  walk), right half the world map (players, trips, routes, booked, visited; tap an area for its
  details) and the turn panel; players as chips in the top bar (tap for the full card). Landscape
  only: Android locked (`sensorLandscape`), a phone browser held upright shows "Please turn your
  phone". Wording: "1 point", never "1 points". The quiz, exam, challenge, event card, sale and end
  screen still use the simple panels until session B.
- **Owner's phone test after A2 → new plan (owner-approved):** B1 maps and full screen; B2 popups,
  answers with explanations, guide for the area you're in (moved up from C); sounds move to task 16
  or are cut. Rule ideas waiting for the owner: a ship Australia East ↔ New Zealand; Alaska as a 3rd
  part of the USA (+5). Both are rule changes (high effort).
- **Done in B1:** full screen on Android (clock, notifications and back/home bar hidden; a swipe shows
  them for a moment); the owner's 20:9 poster and background fill the screen (portrait images
  deleted); Risk-style map: each area its own colour (touching areas never share one), **no names on
  the map** (tap an area: name, flags, capitals, wonder, businesses, routes, citizenship, visits on the
  right); zoom to the area itself (Greenland and Alaska ignored for zooming), pinch or scroll to zoom
  and drag to move; small icons ⭐ ✈️ ⛴️ 🛂 on the other areas; drawn airport (hovering plane), port
  (rocking ship), wonder monument (one for all) and citizenship flag on the player's area; tapping
  them opens a menu (destinations with price, quiz and fees; buy the business; the wonder and its
  tours); pawns; visited dots in each player's colour; no destination buttons. Wonder names are a
  draft for the owner to check (`src/web/countries.ts`).
- **B2 (next, medium):** popups for the quiz, test, challenge, event cards, entry fees and others'
  moves; quiz timer bug (the countdown is stopped right after it starts) and a visible countdown;
  right/wrong popup with the right answer and its fact; the guide for the area you're in.
- Owner: wonder names OK; ship Australia East ↔ New Zealand and Alaska as a 3rd part of the USA
  (+5, still left out of the zoom) approved → task 14b (high effort, its own session).
- **Done in B2:** popups over the board for the quiz, citizenship test, challenge, entry fees, sale
  offers, event cards and "What happened" (other players' moves, shown on a person's turn or right
  after their own move; robots wait while a popup is open); the countdown bug fixed (a redraw
  stopped the timer) with a visible bar; after every answer a ✅/❌ popup with the right answer and
  the fact behind it ("You lose this turn" when wrong); the guide for the area you're in (what the
  arrival earned, walks with points, closed neighbours and why, next continent and bonus, plane and
  ship, businesses to buy, citizenship) with "Turn off guided help" (kept on the device; turned
  back on from the setup screen).

### 14a. Canada and Russia in 3 parts — before session A2 (high)

Owner-approved rule change (task 14, A1). The map grows from 50 to 52 areas.

- Canada West (British Columbia, Alberta, Yukon), Canada Central (Saskatchewan, Manitoba, Northwest
  Territories, Nunavut), Canada East (Ontario, Québec, Atlantic provinces).
- Russia West (as now), Siberia (Urals and Siberia, up to Lake Baikal and Chita), Russia Far East
  (Yakutia, Amur, Khabarovsk, Primorye, Magadan, Kamchatka, Chukotka, Sakhalin).
- Completing Canada or Russia: **+5** (instead of +1 +N); other big countries +3 as now. Check with
  the 1,000-game robot runs (the owner also accepts +4 after the calculations).
- 2 new areas need about 12 facts each (owner checks); event cards tied to Russia or Canada;
  robot, stuck-state check, tests, shapes, scope document (52 areas). Saves version 5.
- Done: rules and numbers in `docs/engine.md` (task 14a). No event cards are tied to Russia or Canada.
  The owner checked and approved the 24 new facts (`docs/facts/batch-2.md` Siberia and Russia Far East,
  `docs/facts/batch-4.md` Canada West and Canada Central).

### 14b. Alaska and two ships — day 12 (high)

Owner-approved rule change (after the phone test of task 14 A2). Done: rules and numbers in
`docs/engine.md` (task 14b). Alaska is a 3rd part of the USA (+5 for the whole USA), walking from
Canada West; ships Australia East ↔ New Zealand and USA West ↔ Alaska (the owner chose the ferry so
a Canadian citizenship can't trap Alaska). Saves version 6. 12 new facts for the owner to check
(`docs/facts/batch-4.md`: Alaska 3–12, USA West 8–9).

### 14c. Owner's phone test after 14b — fixes (medium)

Done: slim solid borders (no moving lines); "Tap an area in …" text and a ⭐ wonder explanation on
the home-country picker; pawns and icons in the deepest point of each area (no longer outside it);
turn panel order: title, action buttons (Ask for citizenship…, sell, go home), then the guide;
citizenship is a button with a popup (and a "request ready" note); popups for the home country, the
travel turn (challenge offer), a lost turn, being stuck or sent home, and citizenship granted or
learned; the airport and port menus say why a destination is closed (a player is there, booked, or
fees too high).

### 14e. Owner's review: celebrations (medium)

Done: event cards as a big golden card popup; popups at round 16 ("Halfway there, 15 more turns")
and round 26 ("the last five turns"); the winner popup with the trophy, ranking and Play again;
"Great news, Red!" income popups when someone pays a person a visa, tour fee or ticket. Messages
always cheer people (winners congratulated, others encouraged) and never cheer robots.
Sounds: not in yet (they need the owner's sound files; see task 16).

### Next session (prepared 2026-10-08): sounds, links to check, then task 15

Everything before this is merged on `main` (pull requests 22–28). Work in this order, one step at a
time (`CLAUDE.md` rule 1), medium effort:

1. **Sounds (task 14C).** The owner uploads the files listed in `docs/sounds.md` to a new branch.
   Claude: copy them to `assets/sounds/`, inline them in `dist/kaj.html` from `scripts/build-web.ts`
   (as data URIs, like the poster and flags), play each one at its event (the table in
   `docs/sounds.md`), add a 🔊 on/off button in the header (kept on the device, like "guided help";
   default on), and add the sound credits to the start screen's credits line. Check the file size
   stays small. Tests pass, build works, pull request.
2. **Links for the owner to check.**
   - **App:** the `kaj-debug-apk` artifact of the pull request's "Android" run (link format:
     `https://github.com/AlbMarketsAutoPilot-lab/kaj-game/actions/runs/<run id>/artifacts/<artifact id>`).
   - **Web:** there is no web link yet. Proposal for the owner to approve: a GitHub Pages site
     built by GitHub Actions from `main` (`dist/kaj.html` published as `index.html`), so the
     newest game is always at `https://albmarketsautopilot-lab.github.io/kaj-game/`. Owner step:
     GitHub → Settings → Pages → Source: "GitHub Actions" (one step at a time). Cost: one small
     workflow file. Risk: the page is public (anyone with the link can play it); the owner decides.
     **Approved by the owner (2026-10-08, public repository):** `.github/workflows/pages.yml`.
3. **Task 15: Android release build** (below). Owner steps one at a time: create the signing key,
   add it to GitHub secrets.

Things the owner noted that are still open (for task 16 if not done earlier): the income popup
("Great news, Red!") was checked by reading the code only, not seen in a test game.

### M. The 50-turn map — part of v1 (owner, 2026-10-09)

Owner's decisions: 80–90 areas; the 30-turn game stays **frozen**, and the 50-turn game uses its
rules and design; the same big-country splits; facts reused by country (only missing ones written);
about 13 airports, 13 ports and 21 connections (the rulebook's 8 and 4–5 were too few for 80–90
areas); 11 wonders. Task 15 is postponed. M1 proposal: 84 areas in `docs/map50.md` (87 before the owner kept the Philippines, Sri Lanka & Maldives and the Caribbean inside their bigger 30-turn areas).
Owner (2026-10-09, M1 review): the train is kept on the 50-turn map, France ↔ Russia West and
France ↔ Turkey (the Caucasus is its own area and gets no train); 50-turn saves are version 11.
The bus is kept too (Mongolia → Siberia or China West, whole country at once, as on the 30-turn map).

**M2 done (engine, owner-approved 2026-10-09):** `src/maps/map50.ts` and the map choice (30 by default
or 50). Walking links: the real land borders, the Channel Tunnel and Madagascar & Islands ↔ Zambezi
(no Spain ↔ Morocco); the ship to UK & Ireland leaves from Portugal. Event cards every 5 land turns;
robots and the Nomad warning scaled to 50 turns; "Thin mountain air" in Peru only; saves version 11,
version-10 saves of 30-turn games still load. Rules in `docs/engine.md`. Screens wait for M4.

**M3 done (owner-approved 2026-10-09):** shapes for the 84 areas (`src/maps/shapes50.ts`, same data and
splits; the 30-turn shapes unchanged). Facts: 12 per area (owner). The 30-turn facts sorted by country
(`src/facts/sort50.ts`) plus 330 new ones (`src/facts/new50.ts`, Europe, Asia, Africa, South America),
to be checked by the owner.

**M6 done (owner-approved drawings and rules, 2026-10-09):** `node scripts/wonders-make.ts` draws the 7
wonders (`assets/wonders/<area id>.svg`) over the game's background painting; the build inlines them.
The poster opens at the **start of a person's next turn** in the wonder area (when buying is allowed,
so no rule changes): the name in the poster's lettering, "+1 point just for
visiting…", and the Guided Tours offer (Buy / Not now) when nobody owns them. Once per wonder per game,
never for robots, never in the home area. Not kept in the save: after "Continue" it may show once more.
**Calm popups (owner, all popups):** after a popup is closed (OK, Let's go, End turn…), the board shows
for 2 seconds with a turning ⌛ before the next popup opens (a tap opens it at once); popups that answer the player's own tap (quiz,
answer, fees, citizenship) open at once. Order: M6 is merged first, then the 50-turn work starts at high effort (owner).

### M5. Owner's test fixes (owner, 2026-10-10)

The 30-turn game is **unfrozen**: these changes apply to both games. Session 1 (medium, done): the guide
rewritten with the owner's texts (11 slides, bold key facts, "You are here" and "Tap here to continue" on the
first map); "Tap an area marked 🚶" instead of the old "green area"; walk badges without ✨, with a legend and
hover texts; "Don't show again" on "What happened"; short money names. Session 2 (medium, done): where you can
walk (the walkable areas glow and the others are dimmed; the walking lines were removed by the owner, a small note when a tap can't go), visited dots, "already visited" warning, icons
inside their own area, world map full screen. Session 3 (**high**, done): Madagascar by ship only (Tanzania,
Zambezi, South Africa) with a +3 SURPRISE, "Tanzania" as the name, whole-continent rewards (areas ÷ 3, at
least +2), the bus gives +5/+3 at once and the other parts still +1 each, saves version 12.

### 15. Android release build — done, in Google Play review (2026-10-12)

- 2026-10-12, Play Console (owner): app "Kris Ann's Journey" (com.kaj.game, developer Connect AL),
  free, Board game; tags Board, Educational, Trivia, Party games, Strategy. Production release 1.0.0
  (code 1), all 177 countries, sent for review. Target ages 6–8, 9–12, 13–15, 16–17, 18+ (Families
  Policy), Teacher Approved opted in, no ads, no data collected, no sign-in, privacy policy link set.
  Content rating: all ages everywhere (ESRB Everyone, PEGI 3, USK 0, South Korea All).
- Same day, owner-approved code and text changes (PRs #61, #62): `LICENSE` (© 2026 Connect AL, all
  rights reserved), README section, Connect AL named in the privacy policy, © in the in-game credits;
  2 wine facts and 11 war facts replaced with neutral facts of the same country (the first rating
  was 15+ in South Korea and Taiwan). CLAUDE.md rule 4: verify, never guess.
- Store listing: short description "Strategy board game meets trivia quiz: travel the world with
  family and friends."; full description with the game's own icons; feature graphic from the
  owner's poster (1024×500); phone screenshots taken from real games (engine-played states opened in
  the web build). R8/deobfuscation warning left as is (no shrinking in 1.0.0, owner's choice).
- Open: Google's review result; "Google Play Games on PC" shows as opted in (check after review).
- 2026-10-14: **rejected** (Broken Functionality: "unresponsive app"; no device or screenshot given).
  Found by measuring with a 6× slower CPU: the pawn-spot search (`deepestPoint` in `maps.ts`) froze
  the screen 3.5 s at start and 5.2 s on "Continue" of a 50-turn game. Owner-approved fixes for
  1.0.1 (code 3): spots made in advance (`scripts/map-centres.ts` → `src/maps/centres.ts`, test
  `tests/centres.test.ts`: identical maps) — now 0.5 s and 0.7 s at 6×; music starts as the app
  opens; R8 on for release (`proguard-rules.pro`). Internal test: version 2 (1.0.0). Owner: turn off
  Google Play Games on PC and Android XR. The task 15 audit had measured 4.9 s and missed it.
- 1.0.1 (code 3) sent for review with Google Play Games on PC kept on (owner's choice).
- 2026-10-17, 1.0.2 (code 4), owner-approved: Google Play needs a privacy policy link inside the app.
  Start screen: "Privacy Policy" and "Copyright" links at the bottom, centred, then "© 2026 Connect
  AL. All rights reserved."; both pages open inside the app (no internet), Back returns to the
  start screen. New `web/copyright.html` (the LICENSE text and the credits), also on GitHub Pages;
  the credits line left the setup screen. Addresses inside the pages are plain text. Checked at
  568×320 to 1920×1080, touch and mouse wheel. `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` comes from
  androidx.core 1.13.0 (via androidx.activity); kept (signature-level, harmless).

- Owner's decision: build and sign in Android Studio on the owner's computer (no GitHub secrets); an
  AAB for Google Play; target audience under 13 (Families Policy).
- Done: app icon (owner's design, adaptive), `appCategory="game"`, version 1.0.0, target SDK 36
  (Play requirement), AGP 8.10.1, Gradle 8.11.1 for Android Studio, audit and fixes
  (`docs/audit-task15.md`).
- Next: owner's Android Studio sync and warning check, phone test (Back, leaving the app, camera
  hole, opening screen), upload key, signed AAB, Play Console (privacy policy link, age groups,
  content rating, Data safety).
- Updating the app later: replace `assets/index.html`, raise `versionCode`, sign with the same key.

### W. Windows app for the Microsoft Store (owner-approved 2026-10-17/18)

- **Decision (owner, way B):** a small C# WinUI 3 app shows `dist/kaj.html` in WebView2, packaged as
  MSIX. Checked in Microsoft's documentation: the Store re-signs MSIX packages for free (no
  certificate to buy); a WebView2 app counts as Win32, so the privacy policy URL is required (policy
  10.5.1); age rating by the IARC questionnaire (the Google Play IARC rating ID can be reused); at
  least 1 desktop screenshot of 1366×768 or larger; versions like 1.0.2.0 (last number 0). Not
  chosen: a packaged PWA (needs internet at first, GitHub sees players' IP addresses, every push to
  `main` would change the Store app without review, the game's CSP blocks a service worker).
- **Session 1 (done, not yet built):** `windows/` (open `windows/KAJ.sln` in Visual Studio).
  The game file is served from the package at `https://kaj.example/index.html` (copied by
  `npm run windows:assets`, like `android:assets`); saves (localStorage) stay in the package's own
  folder, which Windows deletes on uninstall. Opens once only (two windows would overwrite each
  other's save), 1280×720 centred, minimum 800×480; no right-click menu, zoom, F5, developer tools;
  a message when the WebView2 Runtime is missing; the game is reopened if the web engine stops.
  Game changes only inside the Windows app (detected by WebView2's `chrome.webview`): Esc = Android's
  back button (`kajBack`), F11 = full screen, "Leave" closes the app, no "Please turn your phone"
  screen, no text selection. Checked in Chromium: a normal browser is unchanged.
  Package images made from the Android icon (`windows/KAJ/Assets`). Windows App SDK 2.4.0 on .NET 8,
  as in Microsoft's current WindowsAppSDK-Samples.
- **Owner's PC (2026-10-18):** Visual Studio could not be installed (C: has under 8 GB free; even with
  Visual Studio on E:, parts must go on C:). Owner-approved instead: GitHub builds the Store file
  (`.github/workflows/windows.yml`, Microsoft's WinUI CI article; unsigned, the Store signs it),
  artifact `kaj-windows-store`. No Visual Studio needed.
- **Owner's decisions (2026-10-18):** name reserved in Partner Center; package identity in
  `Package.appxmanifest` (PR #68). First submission: **Private audience** (only the owner's personal
  Microsoft account; Microsoft: once submitted as Public it can never go back to Private), then a
  public submission after the owner's test. **OneDrive backup box: unticked** (Properties > Product
  declarations). Privacy page: a Windows section (effective 18 October 2026).
- **Earlier plan (replaced):** owner installs Visual Studio Community (WinUI workload) and checks
  its licence covers Connect AL; build and run on the PC; reserve the name in Partner Center and
  "Associate App with the Store" (fills the package identity); Windows App Certification Kit;
  privacy page: a Windows section and the OneDrive backup choice (ask the owner); listing
  images and screenshots; upload `.msixupload`.
- **Not verified yet:** that saves survive app updates (normal for MSIX, page not read); whether
  music can start before the first click in WebView2 (now it starts at the first click, as in a
  browser); the units of `PreferredMinimumWidth` (taken as screen pixels).

### 17. The train — 30-turn map only (owner-approved 2026-10-09; the 50-turn work waits)

Session A (**high**, done): rules in the engine, robots, stuck-state checker (leaves the train out:
Luxury can't take it), tests, 1,000 robot games, saves version 9, rules written in `docs/engine.md`;
Luxury may buy a booth (owner). Session B (medium, done): station drawing and popup, 🚆 on the maps,
rail route lines, train trip scene, texts, guide, sound (trimmed to 2 s, levelled). Also (owner,
2026-10-09): robots' event cards and challenges are no longer told to people; robots' trips are
("🚆 Robot 2 took the train to Turkey"); business, citizenship and visa news stay.
Owner's rules:

- **Routes:** France ↔ Russia West and France ↔ Turkey & Caucasus (`turkey-caucasus`). In France the
  player chooses one of the two; Russia West and Turkey go only back to France (never to each other).
- **Travel:** 1 turn for every profile (Business too). Digital Nomad +1 for the train turn. A travel
  challenge is offered, as on planes and ships.
- **Ticket:** 2 points for Business and Nomad. Backpacker never pays: the quiz only (as on planes).
  **Luxury can't take the train.** Others may also try the quiz, as with planes (3 tries).
- **Fees:** all the usual rules: visa and tour fees on entering, booked areas, no money means no entry.
- **Booths:** 3 🚆 train ticket booths for sale at **2 points**: France, Russia West, Turkey. Bought like
  the airline and ferry agency; the ticket money goes to the owner of the departure booth.
- **Screens (B):** a drawn station on the area view (style of the airport and port props), 🚆 on the
  continent and world maps, a train scene on the background painting (like the plane and ship),
  popups for buying the booth and for the train trip with its challenge, guide texts, route lines.
- **Sound:** `assets/sounds/train.mp3` (uploaded by the owner; trim and level it, play it like the
  plane and ship sounds).

### 18. The bus — 30-turn map only (owner-approved 2026-10-09, done)

One session at high effort: rules, robots, stuck-state checker, tests, 1,000 robot games, saves
version 10, rules in `docs/engine.md`, and the screens. Owner's rules:

- **Route:** the only bus stop is in Mongolia; one way to Siberia or China West (no bus back).
- **Who:** the Nomad (ticket 1, or the quiz) and the Backpacker (quiz only); not Business or Luxury.
- **Travel:** 1 travel turn; Nomad +1; a challenge is offered.
- **Whole country:** by bus, Siberia marks all of Russia visited (+5), China West all of China
  (+3), once, also after some parts were visited; nothing more if already complete. No Europe.
- **Booth:** 1 🚌 bus ticket booth in Mongolia, 2 points, anyone may buy; the ticket goes to its owner.
- **Screens:** a drawn bus stop, 🚌 on the maps, a route line, a bus trip scene, texts, guide;
  `assets/sounds/bus.mp3` (from the owner, Pixabay) trimmed and levelled.

### 30-turn game: frozen (owner, 2026-10-09)

The 30-turn game is finished: no more rule or content changes. Last changes: 7 more Backpacker
news cards (b9–b15, all positive; 60 cards in all, the test limit) and Backpacker tips on the home
choice (3 continents, the free quiz on every trip, the bus). Next: the 50-turn game, in a new session.

### 15v. Visual polish — done (2026-10-10)

Owner-approved, one item at a time, each with before/after screenshots:
- Setup screen: the "What happened" tick box removed (it is turned off only in a game, with
  "Don't show again", and stays off on that phone: owner's choice); two columns, so the screen
  fits a sideways phone; gold tick boxes.
- Back button: "Leave the game?" is now the game's own popup (Stay / Leave), no longer Android's
  box, which looked out of place and made the map shake. "Leave" opens `kaj://leave`, which closes
  the app (`MainActivity.java`; no new suppressions). To check on the owner's phone.
- Loading screen: title, turning globe and "Loading…" until the start screen shows.
- Top bar: title above the round, player chips in tidy rows for 3 or 4 players.
- Map caption: smaller, breaks only between its parts. (A fade at the bottom of the right side
  was removed again the same day: on the owner's Galaxy S25 it made the panel flicker.)
- Map glow (owner's Galaxy S25 video, 2026-10-10): the glow around the area you stand in and the
  guide's tap glow were CSS drop-shadows, which grow with the map zoom; on a small, zoomed-in area
  (Egypt) the phone drew the map only every other frame under a popup ("trembling"). Now two soft
  lines that keep their width at any zoom (`maps.ts` `glowFor`), for every area.
- Guide pages with a map (owner: too small on a phone): text and buttons on the left, the map on
  the right as tall as the screen allows (about 3 times bigger: 95 → 295 px at 900×430).
- Save and load: autosave after every move plus "Continue" stays; no save slots (owner, 2026-10-10).
- Full world map: a framed card over the dimmed painting, round gold ✕.
- Guide maps: rounded frame, bigger words on the first trip map.
- End screen: medals (🥇🥈🥉) and soft rows in the ranking, the winner's row in gold.
- Colours: one name for each shared colour (`style.css` `:root`); side panel titles in gold.

### L. The 100-turn map (owner, 2026-10-10) — now the future standalone paid app

**Owner's decision (2026-10-11):** the 100-turn game will be a separate, paid app with **8 profiles**
(`docs/profiles8.md`: Photographer, Student, Merchant, Explorer, plus the 4 of this app), built later.
This app's version 1.0 mentions neither; version 1.1 will mention the new app. What was decided in this
app since these plans were written also applies there: the same rules on every map, real-life rules with
no caps, the numbers decide the balance (`docs/balance-lab.md`, the balanced profile rules and the planning
robots in `docs/engine.md`).

The 30- and 50-turn games stay frozen; the 100-turn game reuses their rules and design, as the 50-turn
game reused the 30-turn one. **L1 (high, done):** proposal `docs/map100.md`, made by
`node scripts/map100-review.ts`: 138 areas, each inside one 50-turn area (Europe 33, Asia 37, Africa 39,
North America 13, South America 12, Oceania 4); 15 wonders; 20 airports, 24 ports, 34 connections (23 kept,
8 needed new, 3 optional); 266 walking links (new: Øresund Bridge); Russia 5 parts, Canada 4, China 3,
Brazil 3, Australia 3, USA 3. The stuck-state checker passes on the proposal. 8 questions for the owner
at the end of `docs/map100.md`.

Rules for the next sessions: no change to the 30- or 50-turn rules, maps, data, texts, screens or save
format. The 100-turn game keeps save version 12 and adds only its map id (question 7). Points for 4 or more
parts only touch the 100-turn map (no 30- or 50-turn country has more than 3 parts). The v1 scope
(`docs/KAJ-v1-scope.md`) would need a line for the 100-turn map, like the one for the 50-turn map (owner).

Sessions after L1: **9** (L2 2 high; L3 1, L4 2, L5 2, L6 2 medium), plus about 5 days of fact checking by the owner.

**Dates and budget (checked 2026-10-10, day 4):** still open for v1: task 15 (1 session + the owner's
Android Studio and Play steps) and task 16 (1–2). At about 1.5 sessions a day, 11 days leave room for
about 16 sessions, so 3 + 9 = 12 fit on the calendar with about 2–3 days to spare. They do not fit safely
on the budget: the owner's weekly Claude allowance is already 80% used, 2 sessions are high effort,
the owner checks about 580 facts, and 100-turn test games are long. **Decision proposed: the 100-turn map
comes after v1** (tasks 15 and 16 first, v1 = the 30- and 50-turn games). Doing it before would push back
task 15 (the Play release) and task 16 (full-game tests) to the last days with no buffer.

### 16. Full-game tests and fixes — day 15

- The owner plays full games on a phone (2, 3 and 4 players, with robots).
- Fix what they find. This day is also the buffer.

## Version 2.0 (owner-approved plan, 2026-11-16)

Owner (2026-11-16): this work is **version 2.0**; every step adds one: 2.1, 2.2 … 2.13 (the status rows; renumbered by the owner on 2026-11-20),
so each change can be tracked.

Game design changes before web play on https://kaj.kritere.com. One task per session, in the order of the
status rows (2.1 first). Each task: tests pass, web build works, docs updated, pull request (ask first).

### Decisions taken (owner)

- The **30- and 50-turn games are unfrozen** (2026-11-16).
- ~~The **100-turn game is part of 2.0**, with the same **4 profiles** (replaces "separate paid app" in
  `KAJ-v1-scope.md` §10; `docs/profiles8.md` is not used).~~ **Owner, 2026-11-20:** one 5th profile first (step 2.11,
  chosen from `docs/profiles8.md`), then the 100-turn game (step 2.12) with the 5 profiles, then the release (2.13).
- The **passport screen** comes in 2.0 (was "Not in v1", scope §9).
- **Balance rule:** no change goes in without an analysis of how it affects each profile (Backpacker,
  Business, Luxury, Nomad), boredom and excitement, measured with the balance lab and planning robots
  (`docs/balance-lab.md`) before and after, with fair/unfair results reported. The lab report gets two new
  lines: **boredom** = share of turns blocked, lost, waiting or worth 0 points; **excitement** = lead changes
  and how close the finish is.
- **Saves:** every rule task raises the save version; the task says which older saves can't continue.
- **Visa (owner's answer):** the visa stays **2 points**, paid **only after passing** the visa test.
  A failed test costs nothing: no entry, the turn is used, the area is not visited.
- **Big countries:** a citizenship keeps covering the **whole country** (also a start citizenship).
- **Wonders:** big countries are **never** wonders (rulebook §3 kept).
- **Luxury keeps the quiz** (rulebook §4 kept), so "anyone can always travel free" stays true for the
  stuck-state checker.

### Findings of the planning session

- **Why questions repeat** (`src/engine/quiz.ts` `makeQuestion`, `engine.ts` `pickChallenge`): every
  question is a new random draw from the full list, with no memory of what a player has seen, in the game
  or between games; the airline quiz uses only the destination's 12 facts, and the same areas are
  destinations every game. Measured (300 normal-robot games per map): the draw is not biased to the start of
  a list (each of 12 facts 7–9%), but 6% of quiz questions repeat in one game, 3 tries at one airport repeat
  a question 24% of the time, and across games everything repeats.
- **Questions today:** 995 challenges (all geography, open data); facts 636 (30 turns) / 966 (50 turns),
  with no type field. A keyword script puts at most about 45% as geography (an over-count).
- **New routes, tested in memory:** small map 13 airports / 11 ports, big map 15 / 13, at most 2
  destinations each; the one-citizenship check passes on both; two citizenships at once trap someone in
  13 of 946 pairs (today 19) and 20 of 2,775 (today 18), mostly Iceland, UK & Ireland and Canada.
  Madagascar: 2 planes (Gulf States, South Africa), no ship. No area has only one route.
- **Flickering, likely cause (to be measured):** colour filters on every map area (`web/style.css`
  182–211) and endless animations of filter and border width (`walk-glow` line 189, `glow-land` line 340)
  make the phone redraw every filtered country every frame.

### The tasks

**2.1 (A1) Question rotation (medium, 1).** Each player draws from a shuffled pool without putting questions
back; a question comes again only when the pool is used up. What a player has seen is kept on the device, so
the next game goes on with the rotation. Airline-quiz pool: the destination's facts plus the challenge
questions about the destination's countries. The citizenship test, visa test and challenges use the same
rotation. Save version up.

**2.2 (I) Flickering (medium, 1).** Measure with a slowed-down browser (paint and frame times), remove the
real cause (if it is the glow around borders, remove it), then the owner's test on an old tablet and the
Galaxy S25.
- **Done (2026-11-16, owner-approved):** every frame Chromium showed was recorded with a popup open and
  checked by its pixels, with weak-tablet settings (little graphics memory, CPU 6× slower, 1280×800 at
  density 1.5). In many frames the **whole map under the popup vanished** (Mongolia 104 of 229 frames, Egypt
  86/249, Algeria 76/212, USA East 80/222, China East 117/239). Switching off one thing at a time: only the
  pulsing walk glow (`walk-glow`, added in M5) caused it; the drawn props, colour filters, popup animations
  and the dark popup layer did not. The 15v fix had changed a different glow (the area you stand in).
  Fix: the walkable areas keep their gold border, still (`web/style.css`). After: 0 vanishing frames in 13
  areas on both maps; redraws under a still popup 598 → 0 in 5 s. The guide's tap glow in "How to play"
  was measured too: no vanishing frames, so it is unchanged. Not reproduced with phone-like settings
  (Galaxy S25): only the owner's phone test can confirm it there. No change to rules, saves or balance.
- **Extra test (same day, owner-approved):** with the still walk glow, 0 vanishing frames on event cards
  (8 areas), quizzes (6), the full world map with and without a popup, the board with no popup, the ⌛ pause
  (old build 29–45 frames), 900×430, and the guide pages. Only at an extreme setting (phone size, 8 MB of
  graphics memory) the map still vanished, from two other endless animations: the guide's map glow
  (`glow-land`, about 100 frames in 5 s per page) and the small drawings on the map (wonder twinkle,
  hovering bus: Egypt 42/84, Mongolia 123/233 frames). Owner: the guide's map glow is now a still bright
  edge (0 frames after); the small drawings **keep moving** (owner's decision, not to be changed).

**2.3 (A2) Geography questions (medium, 2).** Tag every fact with its type and count exactly; add 3 written
geography facts per 50-turn area (rivers, mountains, deserts, climate; about 250, checked by the owner,
reused by country on the 30-turn map) and script-made geography questions from open data. Target: at least
half of what a player sees is geography. No other type is removed.

**2.4 (D) Routes (high, 1).** All two-way; they replace today's airports and ports (the train stays).
Area ids: Argentina = `southern-cone` (small) / `argentina` (big), Malay Islands = `maritime-asia`.
- Small, ship: New Zealand–Chile; Argentina–South Africa; South Africa–Australia West; Alaska–Japan;
  Canada East–Iceland; Iberia–Central America; Central America–Japan.
- Small, plane: Alaska–USA West; Iceland–UK & Ireland; North Africa–Iberia; Japan–Korea;
  Australia East–New Zealand; Australia East–Malay Islands; India–Malay Islands; India–Arabia.
- Big, ship: New Zealand–Chile; Argentina–South Africa; South Africa–Australia West; Alaska–Japan;
  Canada East–Iceland; Portugal–Central America; Central America–Japan; Brazil North–Nigeria.
- Big, plane: Alaska–USA West; Iceland–UK & Ireland; Algeria–Spain; Japan–Korea; Australia East–New
  Zealand; Australia East–Malay Islands; India–Malay Islands; India–Gulf States; Madagascar–Gulf States;
  South Africa–Madagascar.
Map check, stuck-state checker, businesses at the new airports and ports, map screens, guide.
- **Done (2026-11-17, owner-approved):** rules and numbers in `docs/engine.md` ("New plane and ship routes"). Checked
  numbers: today 8 / 9 / 13 and 13 / 15 / 23; the planning session's trapped pairs confirmed (13 of 946, 20 of 2,775;
  19 and 18 before). Its "no area has only one route" holds per walking group (each has 2 or more routes out), not per
  area (9 and 12 areas have one). Found on the way: robots planning 2 moves swung back and forth beside areas worth
  nothing yet (USA West ↔ Canada Central); owner's choice B: they no longer walk straight back for nothing
  (`Player.cameFrom`). Watch in 2.7: the Nomad with 4 players and Luxury with planning robots on the 30-turn map.

**2.5 (C+E) Travel by profile, bus and car (high, 2).** Replaces today's turns and prices (`docs/engine.md`):

| Profile | Paid ticket | Travel turns when paid | With the quiz |
|---|---|---|---|
| Luxury | 3 | plane, ship, car 0 (no train, no bus) | 3 turns |
| Business | 2 | plane, ship, car, train 1 | 3 turns |
| Digital Nomad | 1 | plane, ship, car, bus, train 2; **+1 per travel turn** | 3 turns |
| Backpacker | never pays | plane, ship, bus, train, hitchhiking 3 | quiz only (hitchhiking free, as today) |

- **Quiz or pay is a strategy choice (owner):** before a Luxury, Business or Nomad player takes the quiz, a
  popup says plainly what it costs: "The free quiz trip takes 3 turns. Paying takes 0 (Luxury) / 1
  (Business) / 2 (Nomad): **you lose 3 / 2 / 1 extra turns** instead of points." The guide, the airport,
  port and station menus and the profile cards say the same, so the choice between time and points is
  part of the game.
- **Robots and the new choice (to measure in this task):** robots must weigh the extra turns against the
  ticket (the planner already counts turns, tickets and points). The lab reports, per profile and level,
  how often robots pay and how often they take the quiz, before and after, with scores and win shares.
- The Nomad's secret ship surprise (`nomadSurprise`) is removed.
- **Bus** (Mongolia → Siberia or China West, Nomad and Backpacker) and **car** (Mexico → **USA East or
  Canada West**): the whole country's points at once; its other parts then give **0** (replaces M5's +1).

- **Done (2026-11-18, owner's final decision after measuring):** the travel table, the 3-turn quiz trips and "other
  parts 0" were measured and **dropped** (a 3-turn free trip failed the random-robot visa test; no version improved
  fairness on both maps). Kept: the Nomad's +1 only for trips to new areas, its boss alerts on ship trips to new
  areas (a challenge, then a +1 bonus, by turns; the secret surprise removed), the car to USA East or Canada West,
  and a robot fix. Rules in `docs/engine.md` ("Nomad boss alerts and the car to Canada"). Also measured, not
  adopted: Luxury without the quiz (fixes the 30-turn map, too weak on the 50-turn map; it would also need "go home"
  to count tickets it can't pay) and quiz discounts for Business and Luxury (same pattern). Robot-game fairness at
  1,600 games per line: today 24 of 32, with this step 22 of 32. Saves v17.

**2.6 (B) Citizenship and visa test (high, 2).** Replaces scope §9 "button in the area", tasks 14d/14f,
Luxury's instant citizenship and Business's +6.
- Every player except the Digital Nomad holds the citizenship of their **start area from turn 1**, with no
  test (a big country: the whole country). The Nomad has none. Luxury and Business lose their citizenship
  advantages.
- **Business may buy a 2nd and a 3rd citizenship, 5 points each.** Proposal: bought in the area it stands
  in, if nobody holds it; buying does not end the turn. Estimate: one citizenship earns about 1.3 points of
  visas in a 30-turn game (1,400 visas × 2 / 2,200 citizenships, task 8), so 5 points spent is about −3.7
  (too dear); **counted at the end like businesses** it is about +1.3 plus blocking (a small advantage).
  Recommended: count it at the end; confirm with the lab.
- **Visa test:** entering an area where another player has citizenship (bought ones too): read the area's
  facts and answer 3 questions in the same turn (the citizenship test screens). **2 of 3 right:** pay the
  2-point visa and enter; next turn move on. **Fewer:** nothing paid, no entry, the turn is used, the area is
  not visited. Walking: the test comes before entering (refused: stay where you were). Plane or ship: the
  test comes at boarding (fees are paid at boarding since task 11); refused: no trip, no ticket. Proposal:
  the test is offered only with the 2 points in hand ("no money, no entry"). **Luxury never takes the test**,
  only pays the visa.
- Stuck-state checker with 3 citizenships from turn 1 (plus bought ones); robots; guide and help texts.
- **Session 1 done (2026-11-19, owner's final decisions; nothing built yet, session 2 builds it).** Measured in
  scratch copies (robot games, 1,600 per line, normal and planning robots, 2 and 4 players, both maps).
  - **Rules:**
    - Citizenship of the start country from turn 1 for all but the Nomad; one start per country
      (Russia: only one player may start in it).
    - No asking button, no citizenship test, no Business +6, no Luxury instant citizenship.
      Backpacker and Luxury: one citizenship only.
    - **Business:** may take one 2nd citizenship, **free**, in the area it stands in, if nobody holds
      it and it is not the Nomad's start country. It doesn't end the turn, is not counted at the end
      and can't be sold. The Business **never pays a visa but takes the test.**
    - **Luxury** pays the visa but never takes the test.
    - **Visa and test on every entry** from outside (2 points to the citizen); moving inside a big
      country is free.
    - **Visa test:** read 6 facts, 3 questions, 2 right to pass. Offered only with the money in hand.
      Failed: nothing paid, no entry, the turn is used.
    - **On a trip:** ticket first (pay or a right quiz), then the test, then everything is paid.
      Failed: no trip, the free quiz ticket is lost, and it is not a quiz try. After the 3rd wrong
      quiz answer the test comes too (failed: no trip, nothing paid, the count starts again).
      Hitchhiking: the test only if a car stops. Going home is free.
    - **Nomad:** a ship trip to a new area gives **+2** (other trips +1), plus the boss alerts as
      in 2.5.
    - **Event cards by profile and player count** (mix "G"; 3 players use the 4-player mix): the
      Backpacker no longer draws its helper cards b1–b8. Owner: **keep them in `src/cards/cards.ts`,
      unused**, as a possible lever for step 2.7. Each draw is weighted (good / bad):
      - Business 1.1 / 0.95 (2 and 4 players);
      - with 4 players: Backpacker 1 / 1.2, Luxury 1.15 / 0.9, Nomad 1.25 / 0.85;
      - with 2 players: Backpacker, Luxury and Nomad use the normal deck.
    - Save version 18.
  - **Robots (owner-approved):** answer the visa test at their level's rate; the Business buys its 2nd
    citizenship when it keeps its reserve, after businesses; the "ask" rule is removed; the planner's
    Nomad trip value counts +2 for ships.
  - **Fairness, 1,600 games per line:** 21 of 32 before the change → **29 of 32** after. Misses:
    Nomad 19.6% and Backpacker 16% (30 turns, 4 players), Luxury 31% (50 turns, 4 players).
    Boredom unchanged (26–34%), close finishes 39–40% in every 4-player line. Nobody went home,
    longest blocked streak 2, 15–16% of visa tests failed.
  - **Tried and dropped:**
    - the bought citizenship at 5 points (Business 8–31%), then the corrected rule without
      card changes (10 of 32);
    - Backpacker +1 travel turn per trip (21 of 32);
    - 10 other card mixes (8–28 of 32).
  - **Map traps (known limit):** the 3 start citizenships cut off some area in 3.9% (30 turns) and 1.7%
    (50 turns) of possible start sets; with a bought one, more. "Go home" remains the way out; it never
    triggered in robot games.
- **Session 2 done (2026-11-19):** built as decided (`docs/engine.md`, step 2.6). The build measured the same as the
  scratch copy, 29 of 32, every line identical. 221 tests pass; the web build works. The rule tests on the tiny test
  maps switch the start citizenships off (like event cards); the walking-only random-robot test plays with no
  citizenships, as owner-approved in task 8 for asking. No test limit changed.

**2.7 (balance) Balance tuning (high, 1).** All lab packages on both maps, 2 and 4 players, normal and planning
robots; tune the numbers; report fair/unfair, boredom and excitement. Watch: Backpacker (much slower trips),
Nomad (citizen areas from turn 1, none of its own), Luxury (faster ships).

- **Done (2026-11-19, owner's final decisions):** the owner's new rules (travel turns paid 0/1, free 1/2; train Nomad 1;
  car Business and Luxury 2; businesses 1 or 2; +1 for the most businesses, ties by businesses first; go home +2; Nomad
  +1 only for trips of 1 turn or more, no ship +2, no +5 for 3 continents, boss alerts only on free ships; a quiz notice;
  a 0-points sell reminder). Measured at 1,600 games per line: the robots first had to learn when paying is worth it
  (2.5 points per saved turn, the best of 5 styles); then the owner's rules gave 11 of 32, and undoing one rule at a time
  showed the Luxury +5 as the cause (owner: dropped). Card mix D1: **29 of 32** (the 2.6 game: 29). Not adopted after
  measuring: cards with the +5 (best 28), cards inside 45–59% bad (27), 8 simplifications (26), missions (26), challenges
  without −1 (not measured, owner). Details: `docs/engine.md` and `docs/balance-lab.md`, step 2.7. Saves v19.

**2.8 (F) Breaking news (medium, 1).** Replace the personal event cards with short, all-ages geography news
that is true every year, about the area (about 60 cards, same mix of effects; owner checks). Samples:
"PERU — The Inca Trail closes every February for repairs. Walkers wait a day." (lose a turn);
"INDIA — The monsoon arrives: four months of rain fill the rivers and flood the roads." (−1);
"JAPAN — Cherry blossom season! Forecasters follow the 'sakura front' as it moves north." (+1).

- **Done (2026-11-20, owner's decisions):** the samples above (news true every year about one country) would need about
  300 cards to cover every area, so the owner chose news **about the country where the player stands**, made from real
  data: the 33 cards for anywhere were rewritten as country news ({country}, {capital}, {currency} filled in; a part of a
  big country never names the capital), all approved after one correction (c33). The 12 own-area cards had no note on
  why those places; owner: they become general cards with new texts and the same points (option 1, no 88 new cards).
  One card mix per map (N1, measured): **29 → 30 of 32** at 1,600 games per line; boredom 23–28% (the same). Details:
  `docs/engine.md` and `docs/balance-lab.md`, step 2.8. Saves v20.
  Also in this session (owner): screens that show the rules instead of learning them by heart (list in `docs/engine.md`,
  step 2.8); screens only, no rule or balance change.

**2.9 (G) Wonders (medium, 2).** Proposal (none in a big country): 30-turn map +5: Parthenon (Greece), Eiffel
Tower (France), Hagia Sophia (Turkey), Petra (Middle East), Angkor Wat (Indochina). 50-turn map +5: Eiffel
Tower (France), Hagia Sophia (Turkey), Easter Island (Chile), Victoria Falls (Zambezi), Stonehenge
(UK & Ireland). For every wonder, old and new: a short history and a short curiosity, shown with a proper
design. Balance check (more wonder points and tours).

- **Stopped (owner, 2026-11-20): no new wonders.** Measured first with only 3 (owner's choice): Petra (Middle East)
  and Angkor Wat (Indochina) on the 30-turn map, Victoria Falls (Zambezi) on the 50-turn map, in a scratch copy.
  Fairness at 1,600 games per line: **30 → 22 of 32** (1 → 37 points outside the target); biggest shifts on the
  30-turn map with 2 players (Business 48% → 31%, Backpacker 56% → 65%). Table in `docs/balance-lab.md`, step 2.9.
  Owner: no card-mix repair tried; nothing built, game unchanged (save stays 20). The history and curiosity texts
  for the 11 wonders already in the game are **kept for later** (no rule or balance change).

**2.10 (H) Passport and records (medium, 1–2).** Each human player's passport at the end of the game, a stamp
for every area visited. Records on this device only: the top 10 counts of games won by a human ("Your win
country count ranks 3rd"). Proposal: count areas, one list per game length.

**2.11 (K) Kris Ann, a 5th profile (high, 1).** Owner (2026-11-20): one new profile from `docs/profiles8.md` before the
100-turn game. The Explorer was chosen, then named **Kris Ann** (the game's heroine) by the owner.

- **Done (2026-11-21, owner's final decisions after measuring):** rules in `docs/rules-now.md` ([2.11]) and
  `docs/engine.md` (step 2.11). Kris Ann: +3 extra for every big country she finishes (also by bus or car); may take the
  bus; never owns a business; plane ticket 4, ship, train, bus and car 2; normal travel times; only the start
  citizenship. Robots take her first. Card mix "TG" for all 5 profiles with "lose a turn" cards half as often (for
  everyone). Her own 8 cards (the owner's pictures and texts, each reminding of a rule; points 30 / 50 turns +2/+2,
  +1/+1, +1/+1, 0/+1, 0/0, −1/−1, −1/−1, −2/−1), drawn only by her, none twice in a game, shown to every player as a
  picture popup, also when she is a robot. 1,600 games per line: before 30 of 32; after old profiles 26 of 32 and Kris
  Ann 8 of 8 (34 of 40); the 6 misses are on the 50-turn map, profiles doing well with one robot type and badly with
  the other, which no card mix can fix. Every version measured (about 30, from 0 to 34 of 40): `docs/balance-lab.md`,
  step 2.11. Not adopted after measuring: quiz trips as fast as paid ones, tickets 1 above the dearest profile on every
  route, 1 point per big-country part, a robot that counts big-country parts (better for Kris Ann, more boredom). Found
  and not fixed (owner's choice): the Backpacker gains nothing from planning robots. Saves v21.

**2.12 (J) 100-turn map (about 10 sessions + about 5 days of fact checking).** J1 (high): rework
`docs/map100.md` to about 100–125 areas, 5 profiles, the new route style; ask its 8 open questions. J2
engine (high, 2), J3 shapes, J4 facts (2), J5 screens (2), J6 test games (2), medium.

- **J1 done (2026-11-21/22, owner's final decisions):** plan in `docs/map100.md` (made by `node scripts/map100-review.ts`),
  results in `docs/balance-lab.md` (step 2.12), exact card mixes in `docs/card-mix-2.12.json`.
  - **Map:** 126 areas (Europe 32, Asia 35, Africa 33, North America 12, South America 11, Oceania 3), 178 real countries;
    the owner's 6 African merges; big countries as on the 50-turn map (no 4 or 5 parts, points as today); the 11 wonders
    of the 50-turn map (no new art); sensitive regions grouped; Sri Lanka by ship, one Caribbean area, Madagascar's two
    planes and secret +3, the Øresund Bridge; 25 routes (17 airports, 23 ports, at most 2 destinations, all two-way), train,
    bus (Siberia: all of Russia) and car as on the 50-turn map. Stuck-state checker passes; traps: 41 of 6,786 citizenship
    pairs, 1,084 of 109,567 start sets. About 450 new facts for the owner (about 4 days).
  - **100 turns (F3-2):** an event card every 5th land turn; its own card mix; catch-up ×3 (the leader draws bad cards 4
    times as often, the last player good cards 4 times as often); Kris Ann's cards with their 50-turn points. Fair 16 of
    20 at 3,200 games per line (15–16 on new games); boredom 25.1%, lead changes 10.5, won by 3 or less 50%.
  - **30 and 50 turns (K1-3, owner: adopted):** catch-up ×1 (twice as often) and a new card mix. Fair 32 of 40 on new
    games, the same as today's game measured the same way (today: 34 at 1,600, 32 at 3,200); lead changes 4.6 → 5.4, won by
    3 or less 32% → 42%, boredom the same. This changes the 30- and 50-turn games (owner's decision, 2026-11-22).
  - **Accepted:** fairness about 80% at 3,200 games per line; card-mix bad shares outside 44–64% (28–66%); catch-up is a
    secret rule (like hitchhiking). The misses left are robot-type gaps (Business, Backpacker), which card rules can't fix.
  - **Measured and not adopted:** cards every 10 (7 of 20); catch-up ×1, ×2, ×5 on 100 turns; extra catch-up for the
    Business; catch-up ×2 and ×3 on 30 and 50 turns.
  - **J2 (engine, high, 2 sessions):** `src/maps/map100.ts` from the plan; game length 100; cards every 5 on 100 turns;
    the three card mixes and catch-up exactly as in `docs/card-mix-2.12.json`; the lab gets the 100-turn lines (owner-
    approved) and a first-game option; tests (map check, stuck-state checker, trap counts, catch-up, card mixes); saves
    v22 (no older save continues); `docs/rules-now.md` updated when the rules are in the code. Proof: the built game must
    measure exactly as the scratch versions (K1-3 and F3-2, same seeds, line by line). Until J4, the 100-turn areas
    borrow the facts of their 50-turn areas (test only; not released).
  - **J2 done (2026-11-22, one session):** built as decided (`docs/engine.md`, step 2.12 part J2; rules in
    `docs/rules-now.md`, [2.12]). `src/maps/map100.ts` is made by `node scripts/map100-review.ts` from the plan's lines
    (same area, neighbour and route order); game length 100 (`GAME_LENGTHS`; the setup screen shows only 30 and 50 until
    J5); card mixes K1-3 and F3-2 and catch-up exactly as in `docs/card-mix-2.12.json`; lab `--lines=100` and `--first=`;
    saves v22. Proof (games 1–3,200 per line, 1 run each): 30 and 50 turns 33 of 40 (25 of 32, Kris Ann 8 of 8), boredom
    26.2%, lead changes 5.40, won by 3 or less 42.9%; 100 turns 16 of 20, boredom 25.1%, lead changes 10.52, won by 3 or
    less 50.2%; every line as in J1 (`docs/balance-lab.md`). Tests: new `tests/map100.test.ts` and `tests/catchup.test.ts`;
    the card-mix, game-length and save-version tests take the new values. One existing check failed with catch-up (step
    2.11: Luxury draws more bad cards than the Nomad, 30 turns, 4 random robots: 38.9% against 41.4%); owner's choice A:
    that test turns catch-up off with a test-only switch (`GameConfig.catchUp`), so it measures the card mix alone; no
    limit changed. 249 tests pass; the web build works.
  - **J3 done (2026-11-25, owner-approved plan):** `node scripts/map-shapes.ts --from <file> --map 100` makes
    `src/maps/shapes100.ts` and `docs/map-shapes100.md` (same Natural Earth data and big-country splits as M3); the 30- and
    50-turn shapes stay byte-identical. All 178 countries found in the data; every area drawn, and each of the 20 small countries checked on the drawing. Drawn
    borders match the walking links except the Channel Tunnel and the Øresund Bridge; China West touches Myanmar (as on the
    other maps). Pawn spots for map100 in `src/maps/centres.ts` (map30, map50 unchanged); `SHAPES` in `src/web/main.ts`
    (the setup still shows 30 and 50 only); the game file grows 4,820 → 5,020 KB. New `tests/map-shapes100.test.ts`;
    `tests/centres.test.ts` covers the 3 maps; the props test for map100 waits for J5. Found: `docs/map-shapes.md` (30-turn
    review page) has old area names (renamed after task 14); not changed. 252 tests pass; the web build works.
  - **Owner (2026-11-25):** the 100-turn map stays **exactly as approved in J1**: no merged area, no new name, no other
    change to the engine or the map files.
  - **Owner (2026-11-25), screens only:** the end-of-turn popup lists the area's countries with flags and capitals (pull
    request #91); area names on all 3 maps may stick out over sea, take 2 or 3 lines, shorten North/South/West/East, and the
    100-turn map draws "Central Balkans" and "Horn of Africa" as map names only (`docs/engine.md`, "Area names on the maps").

  - **J4 plan (owner-approved, 2026-11-25):** facts sorted by country, new facts up to 12 per area; test facts **A** (2 per
    area, new ones where the sort leaves fewer); geography about 35–40%, never dominating. Two sessions, each ending playable.
    Details in `docs/engine.md`, step 2.12 part J4.
  - **J4 session 1 done (2026-11-25):** `src/facts/sort100.ts` (all 29 split 50-turn areas), `src/facts/new100.ts` Europe 153
    and Asia 112 facts (51% geography) and 40 test facts, tags, review pages (`node scripts/facts100-review.ts`). Africa and
    the Americas still borrow until session 2. 260 tests pass; the web build works.
  - **J4 session 2 done (2026-11-25):** Africa 156, North America 48, South America 11 facts (54% geography) and 31 test
    facts (`docs/facts/new100-2.md`); no area borrows (tests: exactly 12 and 2 everywhere, no fact twice);
    `scripts/geo-count.ts` also counts the 100-turn map: 35% (2 players) and 38% (4 players) geography. 260 tests pass; the
    web build works. Lab run of the 100-turn lines (owner-approved): identical to J2 on every line, 16 of 20.
  - **Owner (2026-11-25): the citizenship and visa test is too repetitive** (it draws only from the area's 12 facts and 2–3
    test facts). **2.12c, owner-approved (2026-11-25), one medium session after J4 session 2:**
    - the visa test also uses the challenges about the area's countries (capital, continent, neighbour, bigger, currency;
      not flags), each with a study line made from its answer ("The capital of Spain is Madrid."); measure geography with
      geo-count (if over 35–40%, challenges less often, as in the airline quiz); all 3 maps; no rule or save change;
    - **the notebook** (screens only): the facts before the visa test shown as a notebook page in the popup: cream lined
      paper, red margin line, spiral rings on top; handwriting-style title "Study notes for your visa: <area>" with a
      tilted red "VISA TEST" stamp; numbered notes in the normal game font; at the bottom "3 questions · 15 seconds each ·
      2 right to pass" and "📖 I'm ready"; the page slides open once (no endless animation, step 2.2); fits every screen
      size (14l); styles only, no picture files. Screenshots for the owner before committing.
    - **2.12c done (2026-11-26):** all 5 challenge types measured 40–42% geography with 4 players (over 40%); owner's choice
      A: capital, neighbour and money (30 turns 34% / 40%, 50 turns 37% / 40%, 100 turns 36% / 39%); pool per area 14 → 18–24.
      Notebook built as designed and checked on 4 screen sizes; the title's handwriting font depends on the device. 261
      tests pass; the web build works. Lab (owner-approved): 34 of 40 (30/50 turns) and 18 of 20 (100 turns), within chance of
      J2. Details: `docs/engine.md`, step 2.12c.
  - **J5 done (2026-11-26, 2 medium sessions, owner-approved):** session 1: records tab "100 turns", Angkor Wat on the
    100-turn map, Denmark's zoom without Greenland, walk badges moved towards their own area (all 3 maps), props test for
    map100. Session 2: `SETUP_LENGTHS` = 30, 50, 100 with the text "100 rounds around the whole world."; Journey buttons on
    one line at every size; area names (all 3 maps) tested densely with their real width (over another area 40 → 1 in a
    script check), never on Greenland or Hawaii; owner: Greenland is not a country, so the area is named "Denmark" (id
    unchanged) and no "Greenland" row in the area details. Screens only (no rule, balance or save change; the lab was not
    run). Checked by script at 4 screen sizes. 262 tests pass; the web build works. The app needs a new signed build in
    2.13. Details: `docs/engine.md`, "The 100-turn screens".

  - **J6 session 1 done (2026-11-26, owner-approved; medium, high for the route trial):** full 100-turn games by script
    (2–4 players, 5 profiles, 6 start continents, save and Continue, end popup, passport, records) and screenshots of 38
    screens at 4 sizes: no layout problem. Fixed (screens, all 3 maps): two question clocks after a quick tap (old, also in
    1.0.2: a forgotten clock froze or answered later questions), "Halfway" again after Continue, "Airline promotion" on
    ships → "Ferry promotion". The owner's new routes (Alaska ✈️ USA East, and 11 changes on the 100-turn map) were built
    and measured, then taken back: the lab gave 29 of 40 (30/50 turns, was 34) and 12 of 20 (100 turns, was 18). Maps,
    routes and saves (v22) are as before J6. The Play Store app (1.0.2) has the old clock bug until a new build.
    Details: `docs/engine.md`, step 2.12 part J6.
  - **J6, the owner's guide changes (2026-11-26, owner-approved):** 16 slides: the pawn walks on the first slide, no "pay"
    words, bus and car with a hitchhiking try, challenges with a real challenge, "Businesses never waste your points",
    "Choose your traveller", clearer citizenship text. Screens only. Details: `docs/engine.md`, "The guide in 16 slides".
  - **J6, the owner's screen changes (2026-11-27, owner-approved):** softer "It's your turn" glow, "N from businesses",
    the visa notice after a free quiz's right answer, clearer wrong-answer texts, the start passport for citizens,
    "+🏢2=12" chips, the "free or paid trip" notice removed. Two rules (people choose their profile first; Kris Ann's
    cards k5 and k8) were measured alone against the base (34 of 40, 18 of 20): 32 / 15 and 33 / 16, so both were taken
    back. No rule, balance or save change. Details: `docs/engine.md`, "The owner's screen changes after the test games".

**2.13 (release) Release (medium, 1–2).** Full test games (2–4 players, all lengths), web at kaj.kritere.com and app.

**How the Play Store app gets the 2.0 changes (checked 2026-11-16 in the 1.0.2 release chat):**
- Every step is merged into `main` when it is done; GitHub Pages (`.github/workflows/pages.yml`) then
  updates the web game by itself. The Play Store app does **not** update by itself: it holds its own copy of
  the game file, so it needs a new signed build. The app's code is Java (`MainActivity.java`, no Kotlin);
  2.1 and 2.2 changed only the web game, so no Java change was needed for them.
- **A Gradle sync alone is not enough**: it does not change the game file inside the app.
- Before the build, raise the version in `android/app/build.gradle.kts` (owner's approval first): today
  `versionCode = 4`, `versionName = "1.0.2"`; Play accepts only a higher `versionCode` (next: 5).
- The owner builds and signs on their PC in Android Studio (task 15). The project folder used for 1.0.2:
  `C:\Users\grise\Desktop\kaj-game-main\android`. Steps used for 1.0.2, one at a time (`CLAUDE.md` rule 1):
  1. Command Prompt: download the new game file into the app (it must be the merged `main` build):
     `curl.exe -L -o "C:\Users\grise\Desktop\kaj-game-main\android\app\src\main\assets\index.html" https://albmarketsautopilot-lab.github.io/kaj-game/index.html`
     (earlier releases ran `npm run android:assets` in PowerShell instead, which builds the same file).
  2. Command Prompt: download the file with the new version number:
     `curl.exe -L -o "C:\Users\grise\Desktop\kaj-game-main\android\app\build.gradle.kts" https://raw.githubusercontent.com/AlbMarketsAutoPilot-lab/kaj-game/main/android/app/build.gradle.kts`
     and check it with `findstr /c:"versionCode" /c:"versionName" "C:\Users\grise\Desktop\kaj-game-main\android\app\build.gradle.kts"`.
  3. Android Studio: **File → Sync Project with Gradle Files** ("Gradle sync finished", no red errors).
  4. **Build → Assemble Project** (BUILD SUCCESSFUL).
  5. **Build → Generate Signed App Bundle or APK…** with the existing upload key (passwords never in chat);
     an AAB for Play, then upload it in Play Console with the release notes. R8 is on: upload the mapping file
     `android\app\build\outputs\mapping\release\mapping.txt` when Play asks.
- Before releasing, check with the owner which files besides `index.html` and `build.gradle.kts` changed in
  `android/` since 1.0.2 (`git diff` from the 1.0.2 commit); each changed file must be copied too.
- Saves: 2.1 raised the save version to 15, so a game in progress from 1.0.2 cannot be continued after the
  update (say so in the release notes).

## Browser version or Android only?

**Short answer: do both, because they are the same work.**

- The game is already a web page: `npm run build` makes one file, `dist/kaj.html`, that opens
  in any browser with no server.
- The Android app is that same file shown inside a WebView. Android adds only a small shell
  (task 6) and the release build (task 15), about 2 sessions in total.
- So a browser version costs **nothing extra**: at any moment the owner can share
  `dist/kaj.html` (or a free preview link, optional).
- Going "directly to Android" (a native Android app without web code) would mean writing the
  screens twice or in a slower tool. It would **not** save time; it would cost a lot more.
- What would waste time and is **not** planned: a desktop-only layout, online hosting as a
  product, install-as-app (PWA) features. The layout is made for phones; it also works in a
  desktop browser.
- The change from the original order: the Android **shell** moves to day 2 (task 6) instead of
  the end, so phone problems show up early. The release build stays near the end.

## If time runs short: cut order (from the v1 scope)

1. 2 challenge types instead of 6
2. 6 facts per area instead of 12
3. a simpler robot

Signs that a cut is needed: on day 8 tasks 7–9 are not done, or on day 12 task 13 is not done.
Always keep a playable build.
