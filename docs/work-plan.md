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
| 9b | Selling, 2 areas with airport and port | **high** | 1 | 6–7 | |
| 10 | Profile bonuses, save and resume | medium | 1 | 7 | |
| 11 | Event cards | medium | 1 | 7–8 | |
| 12 | Challenges (6 types from open data) | medium | 1.5 | 8–9 | |
| 13 | Normal robot | medium | 1 | 10 | |
| 14 | Real screens, art and sounds | medium | 3 | 11–13 | |
| 15 | Android release build (signed APK) | medium | 1 | 14 | |
| 16 | Full-game tests, bug fixes, buffer | medium | 1–2 | 15 | |

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

### 10. Profile bonuses, save and resume — day 7

- Backpacker +3 for 3 continents; Luxury +5 for 5 continents; Nomad −5 at the end with fewer
  than 3 continents (and the "Continents 2/3" bar); Backpacker tip for the Americas/Oceania.
- Automatic save after every move; "Continue game" on the start screen.

### 11. Event cards — days 7–8

- A card every 3 turns, and on a travel turn when the player says no to a challenge.
- Decks: country, plane, ship, Backpacker. Mostly ±1, some ±2 or "lose a turn", rare ±5.
- No keep cards and no mini missions in v1.
- About 40–60 cards, written into a file; the owner reads them once.

### 12. Challenges — days 8–9

- The 6 types in the scope (flag, bigger, capital, continent, neighbours, currency), made by
  a script from open datasets. 15-second timer. Win +1, lose −1.
- Open question: which datasets and flag images (free licences; credits shown in the app).

### 13. Normal robot — day 10

- Random robot + simple rules: prefer new areas, wonders and finishing big countries; buy
  businesses it can afford; quiz or pay sensibly; answers quizzes right most of the time.

### 14. Real screens, art and sounds — days 11–13

- Replace the test board: setup (players, profiles, continent then area), the area view
  (neighbours, airport, port), world map with routes, exam, quiz, challenge, event card,
  end screen. Style of the owner's poster and backgrounds. Sounds from the owner.
- Phone first: portrait and landscape.
- Open question: how the world map looks (simple drawn map of the 50 areas, or a list view).
- Owner notes from the phone test (task 6):
  - The background (portrait and landscape) is stretched past the screen; the poster's borders
    must stay inside the screen.
  - Show the poster at the start of the game.
  - Write "Kris Ann's Journey" like on the poster, and use that design in the whole game.

### 15. Android release build — day 14

- Signed APK from GitHub Actions; app icon, name, splash, screen orientation.
- Owner steps: create the signing key and add it to GitHub secrets (one step at a time).

### 16. Full-game tests and fixes — day 15

- The owner plays full games on a phone (2, 3 and 4 players, with robots).
- Fix what they find. This day is also the buffer.

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
