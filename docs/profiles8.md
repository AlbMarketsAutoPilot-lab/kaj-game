# 8 profiles — 4 new profiles and their balance on paper (planning, no code)

Status: **proposal for the owner** (2026-10-10). Nothing in the game is changed by this file.
Rulebook v7: "4 players and 8 profiles may come later". v1 scope: "8 profiles are not planned".
Adding profiles changes the rules, screens and saves of the **frozen** 30- and 50-turn games, so it
needs the owner's decision to unfreeze them (planned as v2, after v1).

## 1. Today's 4 profiles, measured

Robot games (normal robots, every seat; measured on 2026-10-10 with the current engine, 600 games per
line). A fair share of wins is 50% with 2 players and 25% with 4.

| Game | Backpacker | Business | Luxury | Nomad |
|---|---|---|---|---|
| 30 turns, 2 players: average score / wins | 42.7 / 18% | 46.6 / 48% | 52.1 / **76%** | 49.2 / 55% |
| 30 turns, 4 players | 42.6 / **8%** | 43.3 / 16% | 49.9 / **50%** | 45.1 / 26% |
| 50 turns, 2 players | 66.3 / 30% | 68.3 / 43% | 73.9 / **73%** | 72.2 / 53% |
| 50 turns, 4 players | 64.4 / **10%** | 64.8 / 13% | 71.2 / 38% | 71.9 / 39% |

**Finding:** Luxury is clearly the strongest profile and the Backpacker the weakest, as the rulebook
appendix feared ("Luxury: watch in the simulator"). Robots play some profiles worse than a person
would (for example the Backpacker's quiz trips), so a person's results may be closer. The new profiles
below are aimed at the **middle**: about Business + 2 to Nomad, never above Luxury.

What a player does in one game (4 players, normal robots, average of Backpacker, Business and Luxury),
used for the sums below:

| Per player | 30 turns | 50 turns |
|---|---|---|
| Wonders visited | 3.6 | 6.1 |
| Big countries completed | 1.6 | 1.9 |
| Times another player paid them (tickets, tour fees, visas, sales) | 6.2 | 7.5 |
| Points received that way | 9.7 | 11.1 |
| Trips (plane, ship, train, bus) | 2.2 | 3.1 |

## 2. The 4 new profiles

Each uses a part of the game that no profile rewards yet, so all 8 feel different. Same welcome bonus,
same start, same scoring as everyone else unless written here.

| Profile | Ticket | Plane | Ship | Advantage | Limit |
|---|---|---|---|---|---|
| 📸 **Photographer** | 2 | 1 turn | 3 turns | **+1 extra at every wonder** (first visit: area +1, wonder +1, photo +1). Never pays a guided-tour fee. | **Can't own Guided Tours** (the ⭐ right to buy passes to the next player). |
| 🎓 **Student** | **1** (student discount) | 1 turn | 3 turns | **Travel challenges: a right answer +2** (others +1). | **A wrong answer −2** (others −1). Knowledge decides: guessing gains nothing. |
| 🏪 **Merchant** | 2 | 1 turn | 3 turns | **+1 extra every time another player pays them** (ticket, tour fee, visa, a business sold). | **Never travels free:** no airline quiz (also on the train and bus) — always pays. **Can't ask for citizenship.** |
| 🧭 **Explorer** | 2 | **2 turns** | 3 turns | **+3 extra for every big country completed** (USA, Canada, Russia +8; China, Brazil, Australia +6). The bus stays Nomad and Backpacker only. | **Planes are slow: 2 turns** in the air. |

Kid-friendly sentences for the setup screen (draft):
- 📸 "Collects wonders: +1 extra at every wonder. Can't own guided tours."
- 🎓 "Loves quizzes: travel challenges count double, right and wrong. Cheap tickets."
- 🏪 "Runs businesses: +1 extra every time someone pays you. Always pays to travel."
- 🧭 "Crosses big countries: +3 extra for each one finished. Slow planes."

Rejected while checking:
- **Explorer "ships only, no planes":** on both maps Oceania's only ship route is Australia East ↔
  New Zealand (`map30`/`map50` routes), so an Explorer could never reach or leave Oceania.
- **Merchant "businesses cost 1 less":** at the end businesses count their price, so the discount is
  either worth nothing (counted at the price paid) or +1 per business, about +6 a game (too strong).
- **Explorer "+1 for every 5 areas walked":** fine at 30 turns (+4), far too strong at 100 turns.
- **Diplomat (never pays visas):** visas are rare (about 1–2 a game), so the profile would feel empty.

## 3. Balance on paper (4 players, normal play)

Target: net edge about **+4 to +5** (between Business and Nomad today). Sums use the table in section 1;
"seeking" means a player who chooses routes for their advantage visits a little more.

| Profile | Advantage, 30 / 50 turns | Limit, 30 / 50 turns | Net, 30 / 50 |
|---|---|---|---|
| 📸 Photographer | wonders 3.6 → about 4.1 seeking: **+4**; 6.1 → about 7: **+7**; no tour fees about +1 | tour income lost (about a third of 9.7 / 11.1 received): **−2 / −3** | **+3 / +5** |
| 🎓 Student | about 4 / 7 challenges; at 75% right each is worth +1.0 instead of +0.5: **+2 / +3.5**; ticket 1 instead of 2 on about 2.5 / 3 paid trips: **+2.5 / +3** | built in: at 50% right (guessing) the challenge gain is **0** | **+4.5 / +6.5** (a guesser: +2.5 / +3) |
| 🏪 Merchant | payments without visas about 5.5 / 7, buying a bit more: **+6 / +8** | no citizenship (visa income) **−1.5**; no free travel **−1 / −2** | **+3.5 / +4.5** |
| 🧭 Explorer | big countries 1.6 → about 2 seeking: **+6**; 1.9 → about 2.5: **+7.5** | about 1.5 / 2 plane trips, 1 turn slower each: **−1.5 / −2** | **+4.5 / +5.5** |

**2 players:** the Merchant gets fewer payments (1 other player instead of 3), about **+1.5 net**, too weak.
Proposal: with 2 players the Merchant earns **+2** extra per payment (to be measured). The other three
don't depend on the number of players.

**100-turn map:** 15 wonders and 6 big countries in more parts make the Photographer and Explorer
grow with the map, about +8 to +10 each, still under Luxury (measured +5 above the average at 30 turns).

**Watch in the robot games:** the Student at 50 turns (+6.5, upper edge) and the Merchant with 2 players.
Expected order after tuning: Luxury > Nomad ≈ Student ≈ Explorer ≈ Photographer ≈ Merchant > Business > Backpacker.

## 4. What else changes (no code yet)

- **Setup:** 8 profiles, each taken once; with 2–4 players the last player no longer "gets the one left"
  (4–6 are always free). Robots need a way to choose (proposal: random among the free ones, as now).
- **Stuck-state rules:** the Merchant can't use the free quiz, so the checker's "can always travel free"
  doesn't hold for it. The existing **"go home after 3 turns blocked by money"** covers it, as for any
  player with no money; the checker itself does not change.
- **Robots:** a strategy line per new profile (seek wonders, seek big countries, take challenges, buy
  businesses early).
- **Screens:** 4 new icons in the profile style (the shaded map pieces of task 14h), setup texts, guide
  slides, guided help, end-screen lines ("+4 photos"), continent bars stay for the old 3.
- **Saves:** a new save version (13). Old saves would not continue — this is why the frozen games must be
  unfrozen by the owner.
- **Event cards:** no new decks (only the Backpacker has its own, as now).

## 5. Sessions (after v1)

| # | Session | Effort | Sessions |
|---|---|---|---|
| P1 | This plan | high | 1 (done) |
| P2 | Engine: the 4 profiles, setup with 8, saves 13, tests | **high** | 1–2 |
| P3 | Robots and balance: 1,000 games per mix, tune the numbers above | **high** | 1 |
| P4 | Screens: icons, setup, guide, help texts, end screen; web and APK | medium | 1–2 |
| P5 | Full test games and fixes | medium | 1 |

About **5–6 sessions**, no new facts. (The 100-turn map: 9 sessions and about 580 facts.)

## 6. Questions for the owner

1. Are these 4 the right ideas (Photographer, Student, Merchant, Explorer), and their names and icons?
2. The numbers: OK as a starting point, to be tuned by the robot games in P3?
3. The Merchant with 2 players: +2 per payment, or another fix?
4. While the games are unfrozen for this: also weaken Luxury and help the Backpacker (section 1), or
   leave the 4 old profiles exactly as they are?
5. Does this come before or instead of the 100-turn map, after v1?
