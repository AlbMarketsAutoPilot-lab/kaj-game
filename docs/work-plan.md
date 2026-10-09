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
| M1 | 50-turn map: area list, wonders, airports and ports (`docs/map50.md`, made by `node scripts/map50-review.ts`) | **high** | 1 | 13 | ✅ written, owner to check |
| M2 | 50-turn map: engine (map choice, data, timing, stuck-state checker, 1,000 robot games, saves v7) | **high** | 1 | 13–14 | |
| M3 | 50-turn map: shapes, facts sorted by country (write only the missing ones) | medium | 1 | 14 | |
| M4 | 50-turn map: screens (turn picker, home country, world map, guide), web and APK | medium | 1 | 15 | |
| M5 | 50-turn map: full test games and fixes | medium | 1 | 15 | |
| M6 | Wonder posters for the 7 wonders of the 30-turn map (the 4 of the 50-turn map come with M4) | medium | 1 | 13 | ✅ done |
| 15 | Android release build (signed APK) | medium | 1 | — | postponed (owner, 2026-10-09) |
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
areas); 11 wonders. Task 15 is postponed. M1 proposal: 87 areas in `docs/map50.md`.

**M6 done (owner-approved drawings and rules, 2026-10-09):** `node scripts/wonders-make.ts` draws the 7
wonders (`assets/wonders/<area id>.svg`) over the game's background painting; the build inlines them.
The poster opens at the **start of a person's next turn** in the wonder area (when buying is allowed,
so no rule changes), 2 seconds after "Let's go": the name in the poster's lettering, "+1 point just for
visiting…", and the Guided Tours offer (Buy / Not now) when nobody owns them. Once per wonder per game,
never for robots, never in the home area. Not kept in the save: after "Continue" it may show once more.
Order: M6 is merged first, then the 50-turn work starts at high effort (owner).

### 15. Android release build — postponed

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
