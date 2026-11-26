# Balance lab — numbers before any change (owner, 2026-10-11)

Made by `node scripts/balance-lab/run.ts` and `node scripts/balance-lab/report.ts`. **The game is not changed:**
every rule package is played on a temporary copy of `src/`. Robots play every seat; profiles are given at random.
Owner's targets: each profile wins **20–30%** of 4-player games and **40–60%** of 2-player games (✅ inside, ❌ outside),
at 30 and 50 turns, with today's normal robots (N) and with planning robots (P4: normal answers, plans 4 moves).
With 400 games per line a win share is accurate to about ±2–4 points.

**Extended lab (step 2.7), for every fairness report from now on:**
`node scripts/balance-lab/lab2.ts <label> [games per line, default 1600] [source folder]` plays the 8 lines
(30 and 50 turns, 2 and 4 players, normal and planning robots) on a temporary copy of the source folder (default:
this project; give a scratch copy with a changed rule to measure that rule) and also counts go home, blocked turns,
the longest blocked streak, failed visa tests, draws and how often robots pay (the robot check). About 7–20 minutes.
`node scripts/balance-lab/report2.ts <label>` prints the full report; `report2.ts <before> <after>` compares two.
**Step 2.12 (J2, owner-approved in J1):** `lab2.ts … --lines=100` plays the 4 lines of the 100-turn game instead (2 and 4
players, normal and planning robots); `--first=<game>` starts at that game number (default 1; `--first=3201` plays new
games). `report2.ts` counts fair results of the lines given (of 40 for 30 and 50 turns, of 20 for 100 turns).
Results are kept in the system's temporary folder (`kaj-lab2/`), not in the project.

## Robots: head to head (2 players, today's rules)

| Game | A | B | A wins | B wins | Average score A – B |
|---|---|---|---|---|---|
| 30 turns | easy | normal | 33% | 67% | 41.1 – 47.1 |
| 30 turns | normal | hard | 41% | 59% | 47.7 – 51.3 |
| 30 turns | normal | normal answers, plans 4 moves | 34% | 66% | 47.0 – 51.5 |
| 30 turns | hard | hard, plans 4 moves | 36% | 64% | 49.9 – 53.4 |
| 30 turns | normal | normal, plans 2 moves | 51% | 49% | 48.3 – 48.2 |
| 30 turns | easy | normal, plans 2 moves | 28% | 72% | 41.9 – 48.6 |
| 30 turns | normal, plans 2 moves | hard, plans 3 moves | 32% | 68% | 47.7 – 53.2 |
| 30 turns | easy | hard, plans 4 moves | 12% | 88% | 40.6 – 53.6 |
| 30 turns | normal, plans 2 moves | hard, plans 4 moves | 35% | 65% | 48.5 – 52.7 |
| 30 turns | easy | hard, plans 3 moves | 11% | 89% | 40.6 – 54.4 |
| 50 turns | easy | normal | 21% | 79% | 61.3 – 70.6 |
| 50 turns | normal | hard | 38% | 62% | 70.1 – 74.8 |
| 50 turns | normal | normal answers, plans 4 moves | 26% | 74% | 69.4 – 77.8 |
| 50 turns | hard | hard, plans 4 moves | 36% | 64% | 74.9 – 79.8 |
| 50 turns | normal | normal, plans 2 moves | 39% | 61% | 69.8 – 73.5 |
| 50 turns | easy | normal, plans 2 moves | 16% | 84% | 60.1 – 74.1 |
| 50 turns | normal, plans 2 moves | hard, plans 3 moves | 32% | 68% | 72.5 – 79.3 |
| 50 turns | normal, plans 2 moves | hard, plans 4 moves | 29% | 72% | 71.8 – 79.0 |
| 50 turns | easy | hard, plans 3 moves | 6% | 95% | 59.9 – 80.4 |
| 50 turns | easy | hard, plans 4 moves | 5% | 95% | 60.1 – 80.9 |

## Package "today": the game as it is now

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (today) | 18% ❌ (42.1) | 43% ✅ (45.9) | 81% ❌ (52.2) | 57% ✅ (49.0) | — | — | |
| 30 turns, 4 players | normal (today) | 9% ❌ (42.7) | 15% ❌ (43.2) | 53% ❌ (50.5) | 24% ✅ (44.8) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 41% ✅ (50.4) | 39% ❌ (49.2) | 72% ❌ (54.9) | 49% ✅ (50.3) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 9% ❌ (47.1) | 19% ❌ (49.2) | 55% ❌ (55.8) | 17% ❌ (50.1) | — | — | |
| 50 turns, 2 players | normal (today) | 27% ❌ (65.7) | 44% ✅ (68.8) | 71% ❌ (73.9) | 56% ✅ (71.2) | — | — | |
| 50 turns, 4 players | normal (today) | 10% ❌ (63.4) | 14% ❌ (65.4) | 39% ❌ (70.9) | 37% ❌ (72.2) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 42% ✅ (76.2) | 30% ❌ (72.4) | 58% ✅ (77.8) | 71% ❌ (80.7) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 14% ❌ (72.2) | 14% ❌ (71.2) | 40% ❌ (76.9) | 32% ❌ (76.5) | — | — | 9/32 |

**9 of 32** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "D": Luxury 5-continent bonus removed; Backpacker 3 continents +8; Business citizenship +5; Nomad ticket 2

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 4 players | normal (today) | 28% ✅ (47.4) | 21% ✅ (44.9) | 29% ✅ (46.5) | 23% ✅ (44.5) | — | — | |
| 30 turns, 2 players | normal (today) | 36% ❌ (46.4) | 47% ✅ (48.0) | 60% ✅ (48.0) | 57% ✅ (49.5) | — | — | |
| 50 turns, 4 players | normal (today) | 24% ✅ (68.6) | 17% ❌ (67.1) | 18% ❌ (66.2) | 41% ❌ (72.5) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 61% ❌ (54.2) | 51% ✅ (51.6) | 48% ✅ (50.5) | 41% ✅ (50.1) | — | — | |
| 50 turns, 2 players | normal (today) | 51% ✅ (70.4) | 47% ✅ (70.5) | 44% ✅ (68.1) | 59% ✅ (72.8) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 26% ✅ (51.4) | 26% ✅ (51.2) | 29% ✅ (50.6) | 19% ❌ (49.5) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 46% ✅ (78.3) | 37% ❌ (74.9) | 52% ✅ (74.7) | 66% ❌ (78.5) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 41% ❌ (77.8) | 17% ❌ (71.7) | 16% ❌ (72.2) | 25% ✅ (74.6) | — | — | 21/32 |

**21 of 32** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "F": Luxury 5 continents +2; Backpacker 3 continents +6; Business citizenship +5; Nomad ticket 2

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (today) | 27% ❌ (44.8) | 47% ✅ (47.8) | 70% ❌ (50.0) | 55% ✅ (49.3) | — | — | |
| 30 turns, 4 players | normal (today) | 20% ✅ (45.4) | 22% ✅ (45.0) | 36% ❌ (48.2) | 22% ✅ (44.6) | — | — | |
| 50 turns, 4 players | normal (today) | 17% ❌ (66.8) | 18% ❌ (67.1) | 25% ✅ (68.2) | 40% ❌ (72.1) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 46% ✅ (52.5) | 49% ✅ (51.6) | 57% ✅ (53.4) | 47% ✅ (50.5) | — | — | |
| 50 turns, 2 players | normal (today) | 39% ❌ (68.6) | 45% ✅ (70.1) | 56% ✅ (70.5) | 59% ✅ (73.0) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 19% ❌ (49.2) | 30% ✅ (51.6) | 32% ❌ (51.7) | 20% ✅ (49.5) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 45% ✅ (76.8) | 39% ❌ (75.2) | 50% ✅ (75.3) | 67% ❌ (78.6) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 27% ✅ (75.5) | 22% ✅ (73.1) | 28% ✅ (74.0) | 23% ✅ (74.6) | — | — | 21/32 |

**21 of 32** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "G": Luxury 5 continents +2; Backpacker 3 continents +6; Business citizenship +6; Nomad ticket 2

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 4 players | normal (today) | 18% ❌ (45.4) | 27% ✅ (45.9) | 35% ❌ (48.1) | 21% ✅ (44.6) | — | — | |
| 30 turns, 2 players | normal (today) | 26% ❌ (44.8) | 50% ✅ (48.4) | 69% ❌ (49.9) | 53% ✅ (49.3) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 45% ✅ (52.5) | 54% ✅ (52.7) | 56% ✅ (53.5) | 43% ✅ (50.4) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 18% ❌ (49.3) | 33% ❌ (52.4) | 30% ✅ (51.7) | 19% ❌ (49.5) | — | — | |
| 50 turns, 4 players | normal (today) | 16% ❌ (66.8) | 22% ✅ (67.8) | 24% ✅ (68.4) | 38% ❌ (72.1) | — | — | |
| 50 turns, 2 players | normal (today) | 39% ❌ (68.6) | 47% ✅ (70.8) | 56% ✅ (70.5) | 58% ✅ (72.9) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 45% ✅ (76.8) | 40% ✅ (76.0) | 48% ✅ (75.3) | 67% ❌ (78.6) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 27% ✅ (75.5) | 23% ✅ (74.0) | 27% ✅ (74.0) | 23% ✅ (74.5) | — | — | 21/32 |

**21 of 32** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "H": Luxury 5 continents +3; Backpacker 3 continents +6; Business citizenship +6; Nomad ticket 2

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 4 players | normal (today) | 18% ❌ (45.4) | 26% ✅ (45.8) | 37% ❌ (48.8) | 20% ✅ (44.7) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 17% ❌ (50.2) | 31% ❌ (52.3) | 35% ❌ (52.7) | 17% ❌ (49.4) | — | — | |
| 30 turns, 2 players | normal (today) | 26% ❌ (44.9) | 51% ✅ (48.5) | 69% ❌ (50.5) | 53% ✅ (49.1) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 47% ✅ (52.4) | 53% ✅ (52.3) | 58% ✅ (54.1) | 41% ✅ (50.4) | — | — | |
| 50 turns, 2 players | normal (today) | 38% ❌ (68.7) | 47% ✅ (71.3) | 58% ✅ (71.2) | 56% ✅ (72.9) | — | — | |
| 50 turns, 4 players | normal (today) | 14% ❌ (66.7) | 19% ❌ (67.9) | 29% ✅ (69.6) | 38% ❌ (72.4) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 45% ✅ (77.5) | 37% ❌ (75.0) | 52% ✅ (76.3) | 67% ❌ (78.6) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 25% ✅ (75.2) | 25% ✅ (74.7) | 26% ✅ (75.1) | 24% ✅ (74.8) | — | — | 18/32 |

**18 of 32** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "I": Luxury 5 continents +0; Backpacker 3 continents +6; Business citizenship +6; Nomad ticket 2

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 4 players | normal (today) | 18% ❌ (45.5) | 28% ✅ (45.7) | 31% ❌ (46.5) | 23% ✅ (44.4) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 19% ❌ (49.3) | 31% ❌ (52.0) | 30% ✅ (50.5) | 21% ✅ (49.5) | — | — | |
| 30 turns, 2 players | normal (today) | 27% ❌ (44.6) | 54% ✅ (48.6) | 62% ❌ (48.0) | 56% ✅ (49.5) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 51% ✅ (52.1) | 59% ✅ (52.6) | 48% ✅ (50.5) | 42% ✅ (50.1) | — | — | |
| 50 turns, 4 players | normal (today) | 18% ❌ (66.5) | 21% ✅ (67.8) | 19% ❌ (66.3) | 42% ❌ (72.4) | — | — | |
| 50 turns, 2 players | normal (today) | 41% ✅ (68.4) | 53% ✅ (71.2) | 46% ✅ (68.1) | 60% ✅ (72.7) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 39% ❌ (76.2) | 39% ❌ (75.7) | 53% ✅ (74.7) | 69% ❌ (78.5) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 33% ❌ (75.8) | 21% ✅ (72.4) | 18% ❌ (72.2) | 28% ✅ (74.6) | — | — | 18/32 |

**18 of 32** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "easy60": robot ladder only: easy answers 60% right, keeps 5 points

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 30 turns | easy | normal | 44% | 56% |
| 30 turns | easy | normal, plans 2 moves | 36% | 64% |
| 30 turns | normal, plans 2 moves | hard, plans 4 moves | 35% | 65% |
| 50 turns | easy | normal | 32% | 69% |
| 50 turns | easy | normal, plans 2 moves | 20% | 80% |
| 50 turns | normal, plans 2 moves | hard, plans 4 moves | 29% | 72% |

## Robot variant "easy65": robot ladder only: easy answers 65% right, keeps 4 points

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 30 turns | easy | normal | 46% | 54% |
| 30 turns | easy | normal, plans 2 moves | 43% | 58% |
| 50 turns | easy | normal | 41% | 59% |
| 30 turns | normal, plans 2 moves | hard, plans 4 moves | 35% | 65% |
| 50 turns | easy | normal, plans 2 moves | 27% | 73% |
| 50 turns | normal, plans 2 moves | hard, plans 4 moves | 29% | 72% |

## Package "T1": 30 turns: Luxury 5 continents +0; Backpacker 3 continents +7; Business citizenship +5; Nomad ticket 1

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 54% ✅ (51.4) | 49% ✅ (48.9) | 43% ✅ (47.9) | 53% ✅ (50.4) | — | — | |
| 30 turns, 4 players | normal (plans 2) | 33% ❌ (50.7) | 18% ❌ (45.7) | 29% ✅ (48.8) | 21% ✅ (48.1) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 59% ✅ (53.7) | 49% ✅ (51.6) | 47% ✅ (50.4) | 45% ✅ (50.8) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 23% ✅ (50.5) | 28% ✅ (51.2) | 26% ✅ (50.3) | 23% ✅ (50.3) | — | — | 14/16 |

**14 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "T2": 30 turns: Luxury 5 continents +0; Backpacker 3 continents +7; Business citizenship +5; Nomad ticket 2

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 4 players | normal (plans 2) | 30% ✅ (50.4) | 23% ✅ (46.5) | 28% ✅ (48.9) | 20% ✅ (47.8) | — | — | |
| 30 turns, 2 players | normal (plans 2) | 64% ❌ (52.0) | 46% ✅ (47.9) | 45% ✅ (48.3) | 44% ✅ (48.5) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 55% ✅ (53.1) | 53% ✅ (51.9) | 47% ✅ (50.6) | 45% ✅ (50.5) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 24% ✅ (50.7) | 28% ✅ (51.3) | 29% ✅ (50.5) | 19% ❌ (49.4) | — | — | 14/16 |

**14 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "T3": 30 turns: Luxury 5 continents +1; Backpacker 3 continents +7; Business citizenship +5; Nomad ticket 1

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 4 players | normal (plans 2) | 33% ❌ (50.8) | 17% ❌ (45.4) | 30% ✅ (49.0) | 19% ❌ (48.1) | — | — | |
| 30 turns, 2 players | normal (plans 2) | 51% ✅ (51.3) | 47% ✅ (48.8) | 49% ✅ (48.9) | 52% ✅ (50.4) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 58% ✅ (53.6) | 48% ✅ (51.9) | 50% ✅ (51.6) | 45% ✅ (50.8) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 21% ✅ (50.3) | 29% ✅ (51.6) | 29% ✅ (51.0) | 21% ✅ (50.1) | — | — | 13/16 |

**13 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "U1": 50 turns: Luxury 5 continents +2; Backpacker 3 continents +7; Business citizenship +6; Nomad ticket 3; Nomad needs 3 continents (or −5)

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 4 players | normal (plans 2) | 26% ✅ (71.4) | 24% ✅ (70.3) | 38% ❌ (72.8) | 12% ❌ (67.6) | — | — | |
| 50 turns, 2 players | normal (plans 2) | 59% ✅ (75.6) | 44% ✅ (70.8) | 59% ✅ (73.8) | 38% ❌ (70.6) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 51% ✅ (78.8) | 47% ✅ (75.5) | 51% ✅ (75.6) | 52% ✅ (75.9) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 33% ❌ (76.9) | 24% ✅ (74.1) | 26% ✅ (74.2) | 17% ❌ (72.8) | — | — | 11/16 |

**11 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "U2": 50 turns: Luxury 5 continents +2; Backpacker 3 continents +7; Business citizenship +6; Nomad ticket 2; Nomad needs 4 continents (or −5)

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 4 players | normal (plans 2) | 22% ✅ (71.8) | 19% ❌ (69.6) | 35% ❌ (73.0) | 23% ✅ (71.3) | — | — | |
| 50 turns, 2 players | normal (plans 2) | 58% ✅ (75.5) | 37% ❌ (70.1) | 56% ✅ (74.0) | 49% ✅ (75.8) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 49% ✅ (78.7) | 47% ✅ (76.0) | 49% ✅ (75.5) | 55% ✅ (77.1) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 32% ❌ (76.7) | 27% ✅ (74.7) | 23% ✅ (73.5) | 19% ❌ (73.9) | — | — | 11/16 |

**11 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "U3": 50 turns: Luxury 5 continents +2; Backpacker 3 continents +7; Business citizenship +6; Nomad ticket 3; Nomad needs 4 continents (or −5)

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 4 players | normal (plans 2) | 26% ✅ (71.9) | 24% ✅ (70.7) | 34% ❌ (72.4) | 16% ❌ (69.5) | — | — | |
| 50 turns, 2 players | normal (plans 2) | 57% ✅ (75.5) | 38% ❌ (69.9) | 58% ✅ (74.2) | 47% ✅ (74.0) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 49% ✅ (78.4) | 48% ✅ (76.0) | 53% ✅ (75.5) | 50% ✅ (75.8) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 32% ❌ (76.3) | 25% ✅ (74.2) | 25% ✅ (74.2) | 18% ❌ (72.4) | — | — | 11/16 |

**11 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "T4": 30 turns: Luxury 5 continents +0; Backpacker 3 continents +6; Business citizenship +5; Nomad ticket 2

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 60% ✅ (51.0) | 48% ✅ (47.9) | 46% ✅ (48.3) | 45% ✅ (48.5) | — | — | |
| 30 turns, 4 players | normal (plans 2) | 26% ✅ (49.4) | 24% ✅ (46.5) | 29% ✅ (49.0) | 21% ✅ (47.8) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 50% ✅ (52.1) | 55% ✅ (51.9) | 49% ✅ (50.6) | 46% ✅ (50.5) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 20% ✅ (49.7) | 29% ✅ (51.3) | 31% ❌ (50.5) | 20% ✅ (49.4) | — | — | 15/16 |

**15 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "T5": 30 turns: Luxury 5 continents +0; Backpacker 3 continents +6; Business citizenship +5; Nomad ticket 1

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 4 players | normal (plans 2) | 28% ✅ (49.7) | 19% ❌ (45.7) | 31% ❌ (48.8) | 23% ✅ (48.1) | — | — | |
| 30 turns, 2 players | normal (plans 2) | 49% ✅ (50.4) | 50% ✅ (48.9) | 45% ✅ (47.9) | 56% ✅ (50.4) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 54% ✅ (52.7) | 51% ✅ (51.6) | 49% ✅ (50.4) | 47% ✅ (50.8) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 20% ✅ (49.5) | 29% ✅ (51.2) | 27% ✅ (50.3) | 24% ✅ (50.3) | — | — | 14/16 |

**14 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "V1": 50 turns: Luxury 5 continents +1; Backpacker 3 continents +6; Business citizenship +7; Nomad ticket 2; Nomad needs 4 continents (or −5)

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 4 players | normal (plans 2) | 23% ✅ (71.2) | 23% ✅ (69.7) | 28% ✅ (70.9) | 26% ✅ (71.4) | — | — | |
| 50 turns, 2 players | normal (plans 2) | 55% ✅ (74.7) | 44% ✅ (70.7) | 49% ✅ (72.0) | 51% ✅ (75.2) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 39% ❌ (76.8) | 52% ✅ (76.5) | 55% ✅ (75.3) | 55% ✅ (77.0) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 28% ✅ (76.0) | 30% ✅ (74.6) | 19% ❌ (72.3) | 24% ✅ (73.6) | — | — | 14/16 |

**14 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "V2": 50 turns: Luxury 5 continents +0; Backpacker 3 continents +6; Business citizenship +7; Nomad ticket 2; Nomad needs 4 continents (or −5)

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 4 players | normal (plans 2) | 28% ✅ (71.9) | 22% ✅ (70.3) | 24% ✅ (69.8) | 27% ✅ (71.5) | — | — | |
| 50 turns, 2 players | normal (plans 2) | 56% ✅ (74.8) | 46% ✅ (70.8) | 48% ✅ (70.6) | 50% ✅ (75.2) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 40% ✅ (76.9) | 50% ✅ (76.5) | 56% ✅ (75.0) | 54% ✅ (76.8) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 31% ❌ (75.9) | 29% ✅ (74.4) | 16% ❌ (71.3) | 23% ✅ (73.6) | — | — | 14/16 |

**14 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "X1": 30 turns: no Luxury continent bonus; Backpacker 3 continents +6; Business citizenship +5; Nomad ticket 1, needs 3 continents or −5; Backpacker cards b1–b8; easy robot 65%

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 30 turns | easy | normal, plans 2 moves | 38% | 62% |
| 30 turns | normal, plans 2 moves | hard, plans 3 moves | 34% | 66% |

## Package "X1": 30 turns: no Luxury continent bonus; Backpacker 3 continents +6; Business citizenship +5; Nomad ticket 1, needs 3 continents or −5; Backpacker cards b1–b8; easy robot 65%

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 41% ✅ (48.9) | 52% ✅ (48.5) | 48% ✅ (47.4) | 58% ✅ (50.3) | — | — | |
| 30 turns, 4 players | normal (plans 2) | 23% ✅ (48.3) | 21% ✅ (45.8) | 32% ❌ (48.6) | 23% ✅ (48.1) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 46% ✅ (50.9) | 51% ✅ (51.3) | 50% ✅ (50.3) | 52% ✅ (50.8) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 15% ❌ (47.9) | 31% ❌ (51.3) | 28% ✅ (50.2) | 25% ✅ (50.2) | — | — | 13/16 |

**13 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "W1": 50 turns: no Luxury continent bonus; Backpacker 3 continents +6; Business citizenship +7; Nomad ticket 1, needs 4 continents or −5; Backpacker cards b1–b8; easy robot 65%

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 50 turns | easy | normal, plans 2 moves | 23% | 77% |
| 50 turns | normal, plans 2 moves | hard, plans 3 moves | 31% | 69% |

## Package "W1": 50 turns: no Luxury continent bonus; Backpacker 3 continents +6; Business citizenship +7; Nomad ticket 1, needs 4 continents or −5; Backpacker cards b1–b8; easy robot 65%

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 2 players | normal (plans 2) | 45% ✅ (72.9) | 42% ✅ (70.4) | 42% ✅ (70.1) | 71% ❌ (78.9) | — | — | |
| 50 turns, 4 players | normal (plans 2) | 21% ✅ (70.5) | 25% ✅ (70.9) | 23% ✅ (70.0) | 31% ❌ (73.2) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 28% ❌ (74.8) | 53% ✅ (76.5) | 53% ✅ (74.7) | 65% ❌ (79.0) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 24% ✅ (74.4) | 27% ✅ (74.3) | 19% ❌ (71.8) | 30% ✅ (75.4) | — | — | 11/16 |

**11 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "W2": 50 turns: no Luxury continent bonus; Backpacker 3 continents +6; Business citizenship +7; Nomad ticket 1, needs 4 continents or −8; Backpacker cards b1–b8; easy robot 65%

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 50 turns | easy | normal, plans 2 moves | 23% | 77% |
| 50 turns | normal, plans 2 moves | hard, plans 3 moves | 31% | 69% |

## Package "W2": 50 turns: no Luxury continent bonus; Backpacker 3 continents +6; Business citizenship +7; Nomad ticket 1, needs 4 continents or −8; Backpacker cards b1–b8; easy robot 65%

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 4 players | normal (plans 2) | 21% ✅ (70.5) | 25% ✅ (70.9) | 23% ✅ (70.0) | 31% ❌ (73.2) | — | — | |
| 50 turns, 2 players | normal (plans 2) | 45% ✅ (72.9) | 42% ✅ (70.4) | 42% ✅ (70.1) | 71% ❌ (78.9) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 32% ❌ (74.5) | 55% ✅ (76.4) | 55% ✅ (74.8) | 57% ✅ (77.1) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 26% ✅ (74.5) | 28% ✅ (73.9) | 21% ✅ (72.4) | 25% ✅ (74.5) | — | — | 13/16 |

**13 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "Y1": 30 turns: no Luxury continent bonus; Backpacker 3 continents +8, cards b1–b8; Business citizenship +5; Nomad ticket 1, no challenge on travel turns, 3 continents or −5; easy robot 65%

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 30 turns | easy | normal, plans 2 moves | 39% | 61% |
| 30 turns | normal, plans 2 moves | hard, plans 3 moves | 36% | 64% |
| 30 turns | normal, plans 2 moves | hard, plans 4 moves | 38% | 62% |

## Package "Y1": 30 turns: no Luxury continent bonus; Backpacker 3 continents +8, cards b1–b8; Business citizenship +5; Nomad ticket 1, no challenge on travel turns, 3 continents or −5; easy robot 65%

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 59% ✅ (50.8) | 54% ✅ (48.4) | 50% ✅ (47.2) | 37% ❌ (46.0) | — | — | |
| 30 turns, 4 players | normal (plans 2) | 34% ❌ (50.3) | 23% ✅ (45.9) | 34% ❌ (48.4) | 8% ❌ (43.4) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 58% ✅ (52.7) | 58% ✅ (51.4) | 54% ✅ (50.4) | 30% ❌ (46.6) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 26% ✅ (49.8) | 34% ❌ (51.2) | 30% ✅ (50.1) | 10% ❌ (46.2) | — | — | 9/16 |

**9 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "Y2": 30 turns: no Luxury continent bonus; Backpacker 3 continents +8, cards b1–b15; Business citizenship +5; Nomad ticket 1, no challenge on travel turns, 3 continents or −5; easy robot 65%

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 30 turns | easy | normal, plans 2 moves | 40% | 60% |
| 30 turns | normal, plans 2 moves | hard, plans 3 moves | 36% | 64% |
| 30 turns | normal, plans 2 moves | hard, plans 4 moves | 39% | 61% |

## Package "Y2": 30 turns: no Luxury continent bonus; Backpacker 3 continents +8, cards b1–b15; Business citizenship +5; Nomad ticket 1, no challenge on travel turns, 3 continents or −5; easy robot 65%

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 4 players | normal (plans 2) | 43% ❌ (52.2) | 21% ✅ (45.8) | 29% ✅ (48.3) | 7% ❌ (43.5) | — | — | |
| 30 turns, 2 players | normal (plans 2) | 66% ❌ (52.5) | 53% ✅ (48.5) | 47% ✅ (47.1) | 34% ❌ (45.9) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 64% ❌ (54.6) | 56% ✅ (51.5) | 52% ✅ (50.2) | 28% ❌ (46.6) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 30% ✅ (51.7) | 33% ❌ (51.2) | 28% ✅ (50.3) | 9% ❌ (46.2) | — | — | 8/16 |

**8 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "Z1": 50 turns: no Luxury continent bonus; Backpacker 3 continents +8, cards b1–b8; Business citizenship +7; Nomad ticket 1, no challenge on travel turns, 3 continents or −5; easy robot 70%

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 50 turns | easy | normal, plans 2 moves | 29% | 71% |
| 50 turns | normal, plans 2 moves | hard, plans 3 moves | 33% | 67% |
| 50 turns | normal, plans 2 moves | hard, plans 4 moves | 24% | 76% |

## Package "Z1": 50 turns: no Luxury continent bonus; Backpacker 3 continents +8, cards b1–b8; Business citizenship +7; Nomad ticket 1, no challenge on travel turns, 3 continents or −5; easy robot 70%

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 2 players | normal (plans 2) | 70% ❌ (75.5) | 52% ✅ (71.0) | 50% ✅ (70.0) | 29% ❌ (68.2) | — | — | |
| 50 turns, 4 players | normal (plans 2) | 35% ❌ (72.3) | 28% ✅ (70.7) | 32% ❌ (70.9) | 5% ❌ (63.9) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 39% ❌ (76.1) | 50% ✅ (75.7) | 56% ✅ (74.4) | 55% ✅ (75.3) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 38% ❌ (76.5) | 28% ✅ (74.0) | 21% ✅ (71.9) | 13% ❌ (70.6) | — | — | 8/16 |

**8 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "Z2": 50 turns: no Luxury continent bonus; Backpacker 3 continents +8, cards b1–b15; Business citizenship +7; Nomad ticket 1, no challenge on travel turns, 3 continents or −5; easy robot 70%

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 50 turns | easy | normal, plans 2 moves | 29% | 71% |
| 50 turns | normal, plans 2 moves | hard, plans 3 moves | 34% | 66% |
| 50 turns | normal, plans 2 moves | hard, plans 4 moves | 25% | 75% |

## Package "Z2": 50 turns: no Luxury continent bonus; Backpacker 3 continents +8, cards b1–b15; Business citizenship +7; Nomad ticket 1, no challenge on travel turns, 3 continents or −5; easy robot 70%

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 4 players | normal (plans 2) | 39% ❌ (73.9) | 27% ✅ (70.8) | 30% ✅ (70.7) | 4% ❌ (63.8) | — | — | |
| 50 turns, 2 players | normal (plans 2) | 72% ❌ (76.8) | 51% ✅ (71.1) | 50% ✅ (70.1) | 27% ❌ (68.1) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 48% ✅ (78.4) | 47% ✅ (75.8) | 56% ✅ (74.4) | 50% ✅ (75.4) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 45% ❌ (78.2) | 26% ✅ (74.1) | 17% ❌ (71.9) | 11% ❌ (70.7) | — | — | 9/16 |

**9 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "FINAL-30": no Luxury continent bonus; Backpacker 3 continents +7, cards b1–b8; Business citizenship +6; Nomad ticket 1, no challenges, +5 for 3 continents

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 30 turns | easy | normal, plans 2 moves | 38% | 62% |
| 30 turns | normal, plans 2 moves | hard, plans 3 moves | 35% | 65% |

## Package "FINAL-30": no Luxury continent bonus; Backpacker 3 continents +7, cards b1–b8; Business citizenship +6; Nomad ticket 1, no challenges, +5 for 3 continents

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 43% ✅ (49.8) | 55% ✅ (49.3) | 42% ✅ (47.2) | 59% ✅ (50.9) | — | — | |
| 30 turns, 4 players | normal (plans 2) | 25% ✅ (49.2) | 24% ✅ (46.7) | 29% ✅ (48.4) | 21% ✅ (48.5) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 47% ✅ (51.8) | 55% ✅ (52.3) | 48% ✅ (50.4) | 50% ✅ (51.6) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 16% ❌ (48.8) | 33% ❌ (51.9) | 25% ✅ (50.0) | 26% ✅ (51.5) | — | — | 14/16 |

**14 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "FINAL-50": no Luxury continent bonus; Backpacker 3 continents +7, cards b1–b8; Business citizenship +6; Nomad ticket 1, no challenges, +5 for 3 continents

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 50 turns | easy | normal, plans 2 moves | 25% | 75% |
| 50 turns | normal, plans 2 moves | hard, plans 3 moves | 30% | 70% |

## Package "FINAL-50": no Luxury continent bonus; Backpacker 3 continents +7, cards b1–b8; Business citizenship +6; Nomad ticket 1, no challenges, +5 for 3 continents

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 2 players | normal (plans 2) | 61% ❌ (74.5) | 44% ✅ (70.2) | 47% ✅ (70.0) | 48% ✅ (73.2) | — | — | |
| 50 turns, 4 players | normal (plans 2) | 30% ✅ (71.7) | 23% ✅ (69.7) | 31% ❌ (70.9) | 15% ❌ (68.9) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 29% ❌ (75.0) | 43% ✅ (74.9) | 53% ✅ (74.3) | 74% ❌ (80.5) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 30% ✅ (75.4) | 22% ✅ (73.0) | 19% ❌ (71.9) | 29% ✅ (75.7) | — | — | 10/16 |

**10 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "LIFT-30": final candidate + Nomad +1 per trip (not per travel turn) + Backpacker lift once per continent

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 73% ❌ (55.4) | 51% ✅ (49.3) | 34% ❌ (46.6) | 41% ✅ (48.9) | — | — | |
| 30 turns, 4 players | normal (plans 2) | 53% ❌ (53.9) | 16% ❌ (46.1) | 18% ❌ (47.0) | 13% ❌ (46.5) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 75% ❌ (58.5) | 43% ✅ (52.4) | 37% ❌ (50.5) | 45% ✅ (52.7) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 40% ❌ (54.9) | 24% ✅ (51.8) | 19% ❌ (50.4) | 16% ❌ (50.9) | — | — | 5/16 |

**5 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "LIFT-50": final candidate + Nomad +1 per trip (not per travel turn) + Backpacker lift once per continent

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 4 players | normal (plans 2) | 47% ❌ (76.3) | 19% ❌ (69.5) | 21% ✅ (69.6) | 13% ❌ (68.8) | — | — | |
| 50 turns, 2 players | normal (plans 2) | 72% ❌ (78.0) | 39% ❌ (69.2) | 45% ✅ (70.2) | 44% ✅ (72.5) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 68% ❌ (81.6) | 36% ❌ (74.8) | 43% ✅ (74.4) | 52% ✅ (78.4) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 53% ❌ (81.1) | 14% ❌ (72.4) | 18% ❌ (73.3) | 15% ❌ (73.8) | — | — | 5/16 |

**5 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "SHIPPED-30": the balanced game as it is now in src/ (no patches), 30 turns

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 30 turns | easy | normal, plans 2 moves | 39% | 61% |
| 30 turns | normal, plans 2 moves | hard, plans 3 moves | 35% | 65% |

## Package "SHIPPED-30": the balanced game as it is now in src/ (no patches), 30 turns

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 47% ✅ (50.0) | 59% ✅ (49.5) | 42% ✅ (47.1) | 52% ✅ (49.0) | — | — | |
| 30 turns, 4 players | normal (plans 2) | 28% ✅ (49.3) | 23% ✅ (46.3) | 29% ✅ (48.1) | 20% ✅ (47.1) | — | — | |
| 30 turns, 2 players | planning (plans 4) | 43% ✅ (51.6) | 53% ✅ (52.8) | 44% ✅ (50.5) | 60% ✅ (53.5) | — | — | |
| 30 turns, 4 players | planning (plans 4) | 17% ❌ (49.2) | 30% ✅ (51.4) | 27% ✅ (50.5) | 26% ✅ (51.2) | — | — | 15/16 |

**15 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "SHIPPED-50": the balanced game as it is now in src/ (no patches), 50 turns

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 50 turns | easy | normal, plans 2 moves | 30% | 70% |
| 50 turns | normal, plans 2 moves | hard, plans 3 moves | 32% | 68% |

## Package "SHIPPED-50": the balanced game as it is now in src/ (no patches), 50 turns

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 2 players | normal (plans 2) | 60% ✅ (74.8) | 43% ✅ (69.9) | 47% ✅ (70.1) | 49% ✅ (73.0) | — | — | |
| 50 turns, 4 players | normal (plans 2) | 29% ✅ (71.5) | 23% ✅ (69.6) | 27% ✅ (70.4) | 21% ✅ (69.2) | — | — | |
| 50 turns, 2 players | planning (plans 4) | 34% ❌ (75.0) | 47% ✅ (75.5) | 52% ✅ (74.7) | 67% ❌ (78.9) | — | — | |
| 50 turns, 4 players | planning (plans 4) | 33% ❌ (75.9) | 21% ✅ (72.5) | 21% ✅ (72.5) | 26% ✅ (74.2) | — | — | 13/16 |

**13 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "2.1-BEFORE-30": before step 2.1 (question rotation), 30 turns

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 30 turns | easy | normal, plans 2 moves | 42% | 59% |
| 30 turns | normal, plans 2 moves | hard, plans 3 moves | 35% | 65% |

## Package "2.1-BEFORE-30": before step 2.1 (question rotation), 30 turns

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 43% ✅ (49.9) | 57% ✅ (50.2) | 44% ✅ (47.9) | 55% ✅ (49.3) | 32% | 2.7 lead changes, 28% won by ≤3 | |
| 30 turns, 4 players | normal (plans 2) | 27% ✅ (49.2) | 20% ✅ (46.0) | 31% ❌ (47.6) | 23% ✅ (47.3) | 36% | 4.5 lead changes, 43% won by ≤3 | |
| 30 turns, 2 players | planning (plans 4) | 47% ✅ (52.4) | 55% ✅ (53.0) | 37% ❌ (50.5) | 60% ✅ (54.0) | 36% | 2.8 lead changes, 29% won by ≤3 | |
| 30 turns, 4 players | planning (plans 4) | 17% ❌ (49.4) | 31% ❌ (51.2) | 28% ✅ (50.7) | 24% ✅ (50.7) | 35% | 4.7 lead changes, 46% won by ≤3 | 12/16 |

**12 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "2.1-BEFORE-50": before step 2.1 (question rotation), 50 turns

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 50 turns | easy | normal, plans 2 moves | 38% | 63% |
| 50 turns | normal, plans 2 moves | hard, plans 3 moves | 33% | 68% |

## Package "2.1-BEFORE-50": before step 2.1 (question rotation), 50 turns

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 2 players | normal (plans 2) | 61% ❌ (75.3) | 44% ✅ (70.2) | 50% ✅ (71.1) | 45% ✅ (73.3) | 28% | 3.3 lead changes, 22% won by ≤3 | |
| 50 turns, 4 players | normal (plans 2) | 29% ✅ (71.7) | 24% ✅ (70.0) | 27% ✅ (70.4) | 20% ✅ (69.1) | 27% | 5.6 lead changes, 31% won by ≤3 | |
| 50 turns, 2 players | planning (plans 4) | 39% ❌ (75.6) | 44% ✅ (75.4) | 46% ✅ (73.8) | 70% ❌ (79.0) | 28% | 3.6 lead changes, 23% won by ≤3 | |
| 50 turns, 4 players | planning (plans 4) | 33% ❌ (75.9) | 21% ✅ (71.8) | 19% ❌ (72.5) | 28% ✅ (74.9) | 29% | 6.0 lead changes, 35% won by ≤3 | 11/16 |

**11 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "2.1-AFTER-30": after step 2.1 (question rotation), 30 turns

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 30 turns | easy | normal, plans 2 moves | 39% | 61% |
| 30 turns | normal, plans 2 moves | hard, plans 3 moves | 40% | 60% |

## Package "2.1-AFTER-30": after step 2.1 (question rotation), 30 turns

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 47% ✅ (50.6) | 54% ✅ (50.5) | 48% ✅ (48.3) | 51% ✅ (49.2) | 32% | 2.7 lead changes, 27% won by ≤3 | |
| 30 turns, 4 players | normal (plans 2) | 27% ✅ (49.9) | 21% ✅ (46.9) | 30% ✅ (48.9) | 23% ✅ (47.3) | 35% | 4.9 lead changes, 39% won by ≤3 | |
| 30 turns, 2 players | planning (plans 4) | 51% ✅ (52.4) | 48% ✅ (52.4) | 43% ✅ (50.8) | 58% ✅ (53.3) | 36% | 2.9 lead changes, 28% won by ≤3 | |
| 30 turns, 4 players | planning (plans 4) | 20% ✅ (49.9) | 29% ✅ (52.3) | 23% ✅ (50.6) | 29% ✅ (52.1) | 35% | 4.7 lead changes, 46% won by ≤3 | 16/16 |

**16 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "2.1-AFTER-50": after step 2.1 (question rotation), 50 turns

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 50 turns | easy | normal, plans 2 moves | 34% | 66% |
| 50 turns | normal, plans 2 moves | hard, plans 3 moves | 30% | 71% |

## Package "2.1-AFTER-50": after step 2.1 (question rotation), 50 turns

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 2 players | normal (plans 2) | 60% ✅ (75.1) | 45% ✅ (70.4) | 48% ✅ (70.7) | 48% ✅ (73.2) | 28% | 3.3 lead changes, 28% won by ≤3 | |
| 50 turns, 4 players | normal (plans 2) | 32% ❌ (71.8) | 24% ✅ (69.9) | 27% ✅ (70.1) | 17% ❌ (69.0) | 28% | 5.7 lead changes, 37% won by ≤3 | |
| 50 turns, 2 players | planning (plans 4) | 38% ❌ (75.1) | 44% ✅ (75.5) | 45% ✅ (73.9) | 72% ❌ (78.9) | 28% | 3.5 lead changes, 21% won by ≤3 | |
| 50 turns, 4 players | planning (plans 4) | 31% ❌ (76.3) | 19% ❌ (72.0) | 23% ✅ (73.1) | 27% ✅ (74.8) | 29% | 6.4 lead changes, 43% won by ≤3 | 10/16 |

**10 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "2.3-AFTER-30": after step 2.3 (airline quiz 1 challenge in 10, test-only geography facts), 30 turns

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 30 turns | easy | normal, plans 2 moves | 42% | 59% |
| 30 turns | normal, plans 2 moves | hard, plans 3 moves | 37% | 63% |

## Package "2.3-AFTER-30": after step 2.3 (airline quiz 1 challenge in 10, test-only geography facts), 30 turns

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 47% ✅ (50.3) | 55% ✅ (50.0) | 50% ✅ (47.3) | 46% ✅ (48.7) | 32% | 2.5 lead changes, 26% won by ≤3 | |
| 30 turns, 4 players | normal (plans 2) | 23% ✅ (49.0) | 26% ✅ (46.5) | 32% ❌ (48.4) | 20% ✅ (46.7) | 36% | 4.6 lead changes, 41% won by ≤3 | |
| 30 turns, 2 players | planning (plans 4) | 49% ✅ (52.5) | 49% ✅ (52.2) | 43% ✅ (50.0) | 59% ✅ (53.7) | 36% | 2.8 lead changes, 25% won by ≤3 | |
| 30 turns, 4 players | planning (plans 4) | 19% ❌ (49.5) | 30% ✅ (51.4) | 28% ✅ (50.8) | 22% ✅ (50.9) | 35% | 4.8 lead changes, 44% won by ≤3 | 14/16 |

**14 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "2.3-AFTER-50": after step 2.3 (airline quiz 1 challenge in 10, test-only geography facts), 50 turns

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 50 turns | easy | normal, plans 2 moves | 36% | 64% |
| 50 turns | normal, plans 2 moves | hard, plans 3 moves | 30% | 70% |

## Package "2.3-AFTER-50": after step 2.3 (airline quiz 1 challenge in 10, test-only geography facts), 50 turns

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 2 players | normal (plans 2) | 54% ✅ (74.6) | 41% ✅ (70.7) | 54% ✅ (72.0) | 51% ✅ (73.1) | 27% | 3.1 lead changes, 20% won by ≤3 | |
| 50 turns, 4 players | normal (plans 2) | 28% ✅ (71.8) | 20% ✅ (69.5) | 33% ❌ (71.5) | 20% ✅ (68.9) | 27% | 5.6 lead changes, 34% won by ≤3 | |
| 50 turns, 2 players | planning (plans 4) | 36% ❌ (75.2) | 49% ✅ (75.8) | 44% ✅ (73.9) | 70% ❌ (78.9) | 28% | 3.6 lead changes, 23% won by ≤3 | |
| 50 turns, 4 players | planning (plans 4) | 39% ❌ (76.8) | 18% ❌ (72.2) | 20% ✅ (72.8) | 23% ✅ (74.3) | 29% | 6.3 lead changes, 40% won by ≤3 | 11/16 |

**11 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "2.3-FINAL-30": step 2.3 final (also travel challenges geography 1 in 3), 30 turns

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 30 turns | easy | normal, plans 2 moves | 41% | 59% |
| 30 turns | normal, plans 2 moves | hard, plans 3 moves | 38% | 63% |

## Package "2.3-FINAL-30": step 2.3 final (also travel challenges geography 1 in 3), 30 turns

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 53% ✅ (51.0) | 51% ✅ (49.6) | 50% ✅ (47.7) | 46% ✅ (49.2) | 32% | 2.5 lead changes, 29% won by ≤3 | |
| 30 turns, 4 players | normal (plans 2) | 25% ✅ (49.3) | 26% ✅ (46.9) | 29% ✅ (48.1) | 21% ✅ (47.1) | 36% | 4.6 lead changes, 40% won by ≤3 | |
| 30 turns, 2 players | planning (plans 4) | 49% ✅ (53.3) | 50% ✅ (52.0) | 39% ❌ (49.7) | 61% ❌ (53.6) | 36% | 2.8 lead changes, 25% won by ≤3 | |
| 30 turns, 4 players | planning (plans 4) | 19% ❌ (49.4) | 27% ✅ (51.4) | 28% ✅ (50.4) | 27% ✅ (51.3) | 35% | 4.8 lead changes, 45% won by ≤3 | 13/16 |

**13 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "2.3-FINAL-50": step 2.3 final (also travel challenges geography 1 in 3), 50 turns

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 50 turns | easy | normal, plans 2 moves | 36% | 64% |
| 50 turns | normal, plans 2 moves | hard, plans 3 moves | 31% | 69% |

## Package "2.3-FINAL-50": step 2.3 final (also travel challenges geography 1 in 3), 50 turns

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 2 players | normal (plans 2) | 57% ✅ (74.7) | 42% ✅ (69.8) | 55% ✅ (71.4) | 48% ✅ (72.8) | 27% | 3.1 lead changes, 19% won by ≤3 | |
| 50 turns, 4 players | normal (plans 2) | 30% ✅ (72.3) | 27% ✅ (70.5) | 26% ✅ (70.5) | 18% ❌ (69.4) | 27% | 5.7 lead changes, 32% won by ≤3 | |
| 50 turns, 2 players | planning (plans 4) | 45% ✅ (76.4) | 44% ✅ (75.6) | 44% ✅ (73.8) | 66% ❌ (79.4) | 27% | 3.6 lead changes, 25% won by ≤3 | |
| 50 turns, 4 players | planning (plans 4) | 38% ❌ (76.9) | 16% ❌ (71.7) | 20% ✅ (72.5) | 26% ✅ (74.8) | 29% | 6.3 lead changes, 39% won by ≤3 | 12/16 |

**12 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "2.4-AFTER-30": after step 2.4 (new plane and ship routes), 30 turns

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 30 turns | easy | normal, plans 2 moves | 28% | 73% |
| 30 turns | normal, plans 2 moves | hard, plans 3 moves | 33% | 67% |

## Package "2.4-AFTER-30": after step 2.4 (new plane and ship routes), 30 turns

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 46% ✅ (49.4) | 51% ✅ (49.6) | 52% ✅ (49.9) | 50% ✅ (47.9) | 34% | 2.6 lead changes, 25% won by ≤3 | |
| 30 turns, 4 players | normal (plans 2) | 26% ✅ (49.2) | 36% ❌ (49.8) | 25% ✅ (47.8) | 13% ❌ (45.8) | 35% | 4.4 lead changes, 42% won by ≤3 | |
| 30 turns, 2 players | planning (plans 4) | 38% ❌ (50.9) | 54% ✅ (50.7) | 66% ❌ (53.0) | 40% ✅ (49.8) | 33% | 2.6 lead changes, 27% won by ≤3 | |
| 30 turns, 4 players | planning (plans 4) | 20% ✅ (50.2) | 30% ✅ (50.4) | 34% ❌ (51.2) | 16% ❌ (47.6) | 34% | 4.7 lead changes, 45% won by ≤3 | 10/16 |

**10 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)

## Robot variant "2.4-AFTER-50": after step 2.4 (new plane and ship routes), 50 turns

| Game | A | B | A wins | B wins |
|---|---|---|---|---|
| 50 turns | easy | normal, plans 2 moves | 35% | 65% |
| 50 turns | normal, plans 2 moves | hard, plans 3 moves | 26% | 74% |

## Package "2.4-AFTER-50": after step 2.4 (new plane and ship routes), 50 turns

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement | Fair? |
|---|---|---|---|---|---|---|---|---|
| 50 turns, 4 players | normal (plans 2) | 29% ✅ (71.1) | 27% ✅ (69.5) | 26% ✅ (67.4) | 18% ❌ (68.8) | 28% | 5.6 lead changes, 35% won by ≤3 | |
| 50 turns, 2 players | normal (plans 2) | 52% ✅ (72.6) | 56% ✅ (71.3) | 40% ✅ (68.6) | 52% ✅ (71.7) | 27% | 3.3 lead changes, 24% won by ≤3 | |
| 50 turns, 2 players | planning (plans 4) | 45% ✅ (78.5) | 60% ✅ (77.2) | 52% ✅ (75.3) | 42% ✅ (75.5) | 28% | 3.2 lead changes, 26% won by ≤3 | |
| 50 turns, 4 players | planning (plans 4) | 33% ❌ (74.8) | 23% ✅ (72.2) | 23% ✅ (71.7) | 21% ✅ (72.2) | 27% | 5.6 lead changes, 41% won by ≤3 | 14/16 |

**14 of 16** profile results inside the target. (Wins %, with the average final score in brackets.)


## Step 2.7 (2026-11-19): paid trips fast, new prices, go home +2, card mix D1 — before and after

Measured during the session with scratch copies of the game (not with `run.ts`, so not in `results.json`): 1,600 games
per line, the same seeds for every version, robots in every seat, normal robots (plans 2) and planning robots (plans 4).
At 1,600 games a 4-player win share is accurate to about ±1 point, a 2-player one to about ±1.5.

### Before: the game of step 2.6

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement |
|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 48% ✅ (50.4) | 49% ✅ (48.9) | 50% ✅ (48.9) | 53% ✅ (50.6) | 34% | 3.0 lead changes, 28% won by ≤3 |
| 30 turns, 2 players | planning (plans 4) | 43% ✅ (51.8) | 48% ✅ (50.5) | 54% ✅ (51.7) | 55% ✅ (53.2) | 31% | 3.0 lead changes, 27% won by ≤3 |
| 30 turns, 4 players | normal (plans 2) | 25% ✅ (48.8) | 29% ✅ (49.1) | 27% ✅ (48.3) | 20% ❌ (48.5) | 33% | 4.5 lead changes, 40% won by ≤3 |
| 30 turns, 4 players | planning (plans 4) | 16% ❌ (49.2) | 30% ✅ (51.7) | 29% ✅ (51.0) | 25% ✅ (51.3) | 32% | 4.7 lead changes, 39% won by ≤3 |
| 50 turns, 2 players | normal (plans 2) | 44% ✅ (72.1) | 47% ✅ (70.6) | 51% ✅ (71.0) | 58% ✅ (74.0) | 28% | 3.9 lead changes, 24% won by ≤3 |
| 50 turns, 2 players | planning (plans 4) | 52% ✅ (77.7) | 59% ✅ (76.6) | 43% ✅ (73.7) | 47% ✅ (76.7) | 27% | 3.8 lead changes, 25% won by ≤3 |
| 50 turns, 4 players | normal (plans 2) | 26% ✅ (70.8) | 22% ✅ (68.6) | 31% ❌ (69.6) | 21% ✅ (70.7) | 27% | 5.8 lead changes, 39% won by ≤3 |
| 50 turns, 4 players | planning (plans 4) | 30% ✅ (75.1) | 24% ✅ (72.9) | 21% ✅ (72.4) | 25% ✅ (74.5) | 27% | 5.7 lead changes, 39% won by ≤3 |

**29 of 32** inside the target. (Wins %, with the average final score in brackets.)

### After: the owner's final rules, without the Luxury +5, card mix D1, robots weighing paid against quiz trips (2.5)

| Game | Robots | Backpacker | Business | Luxury | Nomad | Boredom | Excitement |
|---|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal (plans 2) | 55% ✅ (50.9) | 44% ✅ (47.3) | 45% ✅ (48.1) | 56% ✅ (49.8) | 28% | 2.2 lead changes, 25% won by ≤3 |
| 30 turns, 2 players | planning (plans 4) | 57% ✅ (55.5) | 51% ✅ (51.4) | 43% ✅ (50.7) | 49% ✅ (52.4) | 26% | 2.5 lead changes, 26% won by ≤3 |
| 30 turns, 4 players | normal (plans 2) | 28% ✅ (49.8) | 25% ✅ (48.3) | 25% ✅ (48.1) | 22% ✅ (47.7) | 28% | 3.9 lead changes, 39% won by ≤3 |
| 30 turns, 4 players | planning (plans 4) | 18% ❌ (50.6) | 32% ❌ (53.2) | 24% ✅ (51.1) | 26% ✅ (51.6) | 27% | 4.4 lead changes, 38% won by ≤3 |
| 50 turns, 2 players | normal (plans 2) | 60% ✅ (73.3) | 43% ✅ (67.7) | 53% ✅ (69.9) | 44% ✅ (70.2) | 23% | 3.0 lead changes, 20% won by ≤3 |
| 50 turns, 2 players | planning (plans 4) | 60% ✅ (77.3) | 48% ✅ (75.8) | 48% ✅ (74.8) | 44% ✅ (75.5) | 23% | 3.5 lead changes, 23% won by ≤3 |
| 50 turns, 4 players | normal (plans 2) | 31% ❌ (72.8) | 23% ✅ (69.3) | 25% ✅ (70.0) | 20% ✅ (68.8) | 23% | 5.5 lead changes, 33% won by ≤3 |
| 50 turns, 4 players | planning (plans 4) | 25% ✅ (74.4) | 24% ✅ (73.6) | 25% ✅ (73.1) | 26% ✅ (73.6) | 24% | 5.7 lead changes, 37% won by ≤3 |

**29 of 32** inside the target. (Wins %, with the average final score in brackets.)

Go home after 3 turns without money: 0 in every line; go home after a 3rd wrong quiz answer 15–58 per 1,600 games;
longest blocked streak 2; failed visa tests 15–18%; draws 0–1 per 1,600 games; robots pay for 39–59% of their trips.

### How the answer was found

- **Robots first.** With the owner's rules the old robot paid for only 2–12% of its trips. 5 ways of choosing between
  paying and the quiz were measured (average score per profile, every line): counting a saved turn as 2.5 points scored
  highest for every profile on average; checked again without the Luxury +5.
- **The owner's rules with the Luxury +5:** 11 of 32 (Luxury 39–48% of 4-player wins, 70–83% of 2-player wins).
- **One change undone at a time** (fair results / points outside the target): Luxury +5 26 / 8; car price 13 / 174;
  train price 11 / 172; the most-businesses +1 and tie order 11 / 164; go home +2 11 / 174; business prices 10 / 151;
  Nomad +5 for 3 continents 7 / 207; travel times 6 / 380; Nomad trip points 1 / 296.
- **Card mixes tried:** with the +5, 26, 27, 27 and 28 of 32 (the best gives Luxury 78% bad cards with 2 players);
  without the +5: D1 29 of 32 (largest bad share 63%), two mixes inside 45–59% bad cards 27 of 32.
- **Also measured, not adopted:** 8 rule simplifications together 26 of 32; one mission per player 26 of 32.
- **Misses no card mix can fix:** in 30 turns, 4 players, planning, the Backpacker is weak and Business strong; in 50
  turns, 4 players, normal, the reverse. The card mix is the same on both maps.

## Step 2.8 (2026-11-20): news cards everywhere, one card mix per map — before and after

Extended lab (`lab2.ts`, 1,600 games per line, the same seeds). Before: the game on main (`before28`); after: the 45
news cards drawn everywhere with mix N1 (`N1`, scratch copy; the game in `src/` is the same, checked file by
file).

**Before: 29 of 32**, 5 points outside the target (the same as step 2.7, line for line). **After: 30 of 32**, 1 point
outside. Robot check: robots pay for 39–59% of their trips, before and after.

| Line | Backpacker | Business | Luxury | Nomad |
|---|---|---|---|---|
| 30 turns, 2 players, normal | 55% ✅ → 56% ✅ (51.3) | 44% ✅ → 48% ✅ (48.3) | 45% ✅ → 42% ✅ (48.5) | 56% ✅ → 54% ✅ (50.0) |
| 30 turns, 2 players, planning | 57% ✅ → 57% ✅ (56.7) | 51% ✅ → 52% ✅ (52.2) | 43% ✅ → 45% ✅ (52.0) | 49% ✅ → 46% ✅ (52.6) |
| 30 turns, 4 players, normal | 28% ✅ → 31% ❌ (51.1) | 25% ✅ → 21% ✅ (48.3) | 25% ✅ → 27% ✅ (49.1) | 22% ✅ → 21% ✅ (48.1) |
| 30 turns, 4 players, planning | 18% ❌ → 20% ✅ (51.8) | 32% ❌ → 28% ✅ (53.1) | 24% ✅ → 25% ✅ (51.5) | 26% ✅ → 26% ✅ (51.9) |
| 50 turns, 2 players, normal | 60% ✅ → 58% ✅ (73.7) | 43% ✅ → 43% ✅ (68.8) | 53% ✅ → 53% ✅ (71.1) | 44% ✅ → 45% ✅ (71.0) |
| 50 turns, 2 players, planning | 60% ✅ → 54% ✅ (77.6) | 48% ✅ → 48% ✅ (76.4) | 48% ✅ → 50% ✅ (75.2) | 44% ✅ → 48% ✅ (76.4) |
| 50 turns, 4 players, normal | 31% ❌ → 30% ❌ (73.1) | 23% ✅ → 23% ✅ (69.6) | 25% ✅ → 26% ✅ (71.0) | 20% ✅ → 21% ✅ (69.9) |
| 50 turns, 4 players, planning | 25% ✅ → 23% ✅ (74.9) | 24% ✅ → 22% ✅ (74.3) | 25% ✅ → 25% ✅ (73.9) | 26% ✅ → 29% ✅ (75.0) |

(After: average final score in brackets.) Boredom 23–28% before and after; lead changes 2.2–5.7 → 2.3–5.7; won by 3
or less 20–39% → 22–39%; draws 0–1 per line; go home 15–58 → 15–54 per line (after 3 turns without money 0); blocked
turns 0–56 → 0–48; longest blocked streak 2; failed visa tests 15–18% → 14–17%. Most single changes are within
chance (±1 point with 4 players, ±1.5 with 2). The two misses (Backpacker, 4 players, normal robots) are just over
30%, while the planning robots' Backpacker on the same maps is at 20–23%: a card mix can't move one without the other.
Not measured (owner chose N1): a smaller weight for the 5 "lose a turn" cards, the only card lever for boredom.

## Step 2.9 (2026-11-20): three new wonders — measured, not adopted

Extended lab (`lab2.ts`, 1,600 games per line). Before: the game on main (`before29`). After (`wonders3`, scratch copy,
only these 3 lines changed): Petra (Middle East) and Angkor Wat (Indochina) wonders on the 30-turn map, Victoria Falls
(Zambezi) on the 50-turn map; their guided tours come with them.

**Before: 30 of 32** (as in step 2.8). **After: 22 of 32**, 37 points outside the target (before 1). Robot check: robots
pay for 39–59% → 39–58% of their trips. **Owner: no new wonders.**

| Line | Backpacker | Business | Luxury | Nomad |
|---|---|---|---|---|
| 30 turns, 2 players, normal | 56% ✅ → 65% ❌ (54.3) | 48% ✅ → 31% ❌ (48.1) | 42% ✅ → 49% ✅ (50.4) | 54% ✅ → 55% ✅ (51.5) |
| 30 turns, 2 players, planning | 57% ✅ → 65% ❌ (58.8) | 52% ✅ → 36% ❌ (51.4) | 45% ✅ → 48% ✅ (52.9) | 46% ✅ → 51% ✅ (54.4) |
| 30 turns, 4 players, normal | 31% ❌ → 31% ❌ (53.2) | 21% ✅ → 17% ❌ (48.6) | 27% ✅ → 31% ❌ (51.8) | 21% ✅ → 21% ✅ (49.4) |
| 30 turns, 4 players, planning | 20% ✅ → 29% ✅ (54.6) | 28% ✅ → 22% ✅ (53.0) | 25% ✅ → 25% ✅ (52.8) | 26% ✅ → 24% ✅ (52.4) |
| 50 turns, 2 players, normal | 58% ✅ → 67% ❌ (75.8) | 43% ✅ → 42% ✅ (68.8) | 53% ✅ → 47% ✅ (70.7) | 45% ✅ → 43% ✅ (71.7) |
| 50 turns, 2 players, planning | 54% ✅ → 52% ✅ (78.3) | 48% ✅ → 41% ✅ (75.2) | 50% ✅ → 60% ❌ (77.8) | 48% ✅ → 48% ✅ (77.4) |
| 50 turns, 4 players, normal | 30% ❌ → 28% ✅ (73.8) | 23% ✅ → 23% ✅ (70.2) | 26% ✅ → 22% ✅ (71.1) | 21% ✅ → 28% ✅ (71.4) |
| 50 turns, 4 players, planning | 23% ✅ → 25% ✅ (75.6) | 22% ✅ → 24% ✅ (75.0) | 25% ✅ → 20% ✅ (73.0) | 29% ✅ → 32% ❌ (76.6) |

(After: average final score in brackets.) Boredom 23–28% before and after; lead changes 2.3–5.7 → 2.3–5.4; won by 3 or
less 22–39% → 20–36%; draws 0–1 per line; go home 15–54 → 12–52 per line (after 3 turns without money 0); blocked turns
0–48 → 0–59; longest blocked streak 2; failed visa tests 13.8–16.9% → 15.3–17.6%. The biggest shifts (Business −16,
Backpacker +9 on the 30-turn map with 2 players; Luxury +10 with one wonder on the 50-turn map) are far beyond chance
(±1.5 points with 2 players). The cause was not measured.

## Step 2.11 (2026-11-21): Kris Ann, the 5th profile — before and after

Extended lab (`lab2.ts`, 1,600 games per line). Lab changes (owner-approved): seat 0 stands for the person and chooses
a profile at random among the free ones; the robots take Kris Ann first, so she is in every robot game; the report
counts the old 4 profiles of 32 and Kris Ann apart (of 8). With 2 players each old profile plays only about 400 games
per line: about ±2.5 points by chance (4 players ±1.2). Before: the game on main (`before211`); after: the built game
(`build211`), identical to the scratch version KA5 in all 40 results.

**Before: 30 of 32** (as in step 2.8). **After: old profiles 26 of 32, Kris Ann 8 of 8, 34 of 40.** Robot check: robots
pay for 39–59% → 42–56% of their trips.

| Line | Backpacker | Business | Luxury | Nomad | Kris Ann |
|---|---|---|---|---|---|
| 30 turns, 2 players, normal | 56% ✅ → 42% ✅ (57.9) | 48% ✅ → 56% ✅ (53.7) | 42% ✅ → 48% ✅ (52.5) | 54% ✅ → 57% ✅ (56.4) | 49% ✅ (55.1) |
| 30 turns, 2 players, planning | 57% ✅ → 54% ✅ (61.1) | 52% ✅ → 45% ✅ (58.1) | 45% ✅ → 45% ✅ (57.4) | 46% ✅ → 44% ✅ (57.9) | 53% ✅ (59.9) |
| 30 turns, 4 players, normal | 31% ❌ → 29% ✅ (52.4) | 21% ✅ → 26% ✅ (50.5) | 27% ✅ → 26% ✅ (50.9) | 21% ✅ → 24% ✅ (51.8) | 21% ✅ (51.3) |
| 30 turns, 4 players, planning | 20% ✅ → 24% ✅ (54.8) | 28% ✅ → 27% ✅ (54.9) | 25% ✅ → 22% ✅ (54.1) | 26% ✅ → 23% ✅ (55.2) | 28% ✅ (56.4) |
| 50 turns, 2 players, normal | 58% ✅ → 56% ✅ (77.9) | 43% ✅ → 35% ❌ (74.0) | 53% ✅ → 41% ✅ (74.7) | 45% ✅ → 57% ✅ (81.5) | 53% ✅ (78.2) |
| 50 turns, 2 players, planning | 54% ✅ → 43% ✅ (84.7) | 48% ✅ → 68% ❌ (85.5) | 50% ✅ → 56% ✅ (84.3) | 48% ✅ → 41% ✅ (84.2) | 48% ✅ (85.0) |
| 50 turns, 4 players, normal | 30% ❌ → 36% ❌ (75.8) | 23% ✅ → 19% ❌ (70.8) | 26% ✅ → 26% ✅ (73.3) | 21% ✅ → 24% ✅ (73.4) | 20% ✅ (74.1) |
| 50 turns, 4 players, planning | 23% ✅ → 16% ❌ (76.0) | 22% ✅ → 30% ❌ (79.5) | 25% ✅ → 24% ✅ (77.5) | 29% ✅ → 30% ✅ (80.3) | 25% ✅ (79.6) |

(After: average final score in brackets.) Boredom 23–28% → 22–32% (average 25.3% → 26.2%); lead changes 2.3–5.7 →
3.0–6.6 (average 3.84 → 4.60); won by 3 or less 22–39% → 25–38% (29.5% → 31.8%); draws 0–1 → 0 per line; go home
15–54 → 4–48 per line (after 3 turns without money 0); blocked turns 0–48 → 0–50; longest blocked streak 2; failed
visa tests 13.8–16.9% → 14.4–16.4%. The 6 misses (all on the 50-turn map) are profiles doing well with one robot type
and badly with the other (Business 35% / 68%, Backpacker 36% / 16%, Business 19% / 30%); a card mix moves both
together, so it can't fix them. Checked with a point breakdown (300–800 games): in 2-player games Kris Ann's opponent
owns every business and earns her paid tickets; the Backpacker is the only profile that gains nothing from planning.

**Every version measured** (1,600 games per line; old profiles of 32 / Kris Ann of 8 / points outside the target /
average boredom / lead changes / won by 3 or less; "mix" = card mix tuned per map, profile and player count):

| Version | Kris Ann's rules and cards | Old | KA | Outside | Boredom | Lead | Close |
|---|---|---|---|---|---|---|---|
| F1–F5 | the starting design + one lever each (no business; plane 4; helper cards; bus; +1 per part) | 5–18 | 0–6 | 152–530 | 22.3–27.7% | 3.9–4.6 | 25–31% |
| TA | no business, plane 4 + mix | 25 | 7 | 32 | 27.7% | 4.63 | 32.1% |
| TB | + 1 point per big-country part + mix | 16 | 2 | 98 | 23.8% | 4.64 | 30.3% |
| TC / TD | TA + helper cards / + bus, mix | 21 / 24 | 8 / 8 | 43 / 21 | 27.6 / 27.0% | 4.6 | 32% |
| TE / TF | TA / TC + "lose a turn" half as often, mix | 23 / 19 | 7 / 8 | 35 / 29 | 26.9 / 26.8% | 4.6 | 31–32% |
| **TG** | **TD + "lose a turn" half as often, mix** | **26** | **8** | **22** | **26.2%** | **4.56** | **31.3%** |
| TH | TD + helper cards (old points), mix | 26 | 8 | 21 | 27.0% | 4.55 | 32.3% |
| GF2 / MF2 | tickets 1 above the dearest, quiz trips as fast as paid, her cards tuned; from TG / from N1 | 17 / 22 | 7 / 8 | 49 / 37 | 25.7 / 26.5% | 3.8 | 31% |
| GS2 / MS2 | the same with normal quiz times | 20 / 22 | 5 / 5 | 58 / 56 | 26.5 / 27.3% | 4.2 | 31% |
| FT / FR | TG with tickets 1 above the dearest, her cards; FR with robots counting each big-country part | 22 / 23 | 5 / 7 | 53 / 34 | 27.4 / 28.6% | 4.2 / 4.5 | 31 / 33% |
| TX2 | TG + her cards, normal "lose a turn" cards | 24 | 8 | 39 | 27.0% | 4.57 | 31.6% |
| KA1 / KA2 | TG + her cards, points adding up to 0 | 25 / 25 | 7 / 7 | 25 / 23 | 26.2% | 4.6 | 31.8% |
| KA3 | TG + her cards, 50-turn points a little kinder | 26 | 8 | 24 | 26.2% | 4.60 | 31.9% |
| KA4 | KA1 with her cards half as often on the 50-turn map | 24 | 8 | 22 | 26.2% | 4.59 | 31.5% |
| **KA5 (built)** | **KA3, none of her cards twice in a game** | **26** | **8** | **24** | **26.2%** | **4.60** | **31.8%** |

## Step 2.12, part J1 (2026-11-21/22): the 100-turn game and catch-up cards — measured, owner's final decision

Extended lab (`lab2.ts`), every run in scratch copies outside the project; nothing in `src/` changed. Test-only changes
in the scratch copies: a draft 126-area map (`scripts/map100-review.ts`, facts borrowed from the 50-turn areas), a lab
option for the 100-turn lines and for the first game number (to play new games), and the catch-up rule. Exact card
mixes: `docs/card-mix-2.12.json`. They come into the game in J2 (owner-approved).

**Today's game at more games (main, unchanged):** 34 of 40 at 1,600 games per line (step 2.11), **32 of 40 at 3,200**,
32 of 40 on 3,200 and on 6,400 new games (games 3,201–9,600). The 34 had two borderline results inside by luck (Business
20%, Luxury 39%, 50 turns); it was also the best of about 30 versions measured on the same 1,600 games, so a little
flattering. Averages: boredom 26.2–26.3%, lead changes 4.57–4.59, won by 3 or less 31.9%.

**100 turns** (lines 100 turns × 2 and 4 players × normal and planning robots; fair of 20):

| Version | Games per line | Fair | Boredom | Lead changes | Won by ≤3 |
|---|---|---|---|---|---|
| First run: cards every 10, the 50-turn card mix | 3,200 | 7 | 24–26% | 4.2–8.6 | 16–30% |
| Cards every 5, card mix tuned (6 tries) | 800 | best 13 | 25.1% | 6.6 | 22% |
| + catch-up ×1 / ×2 / ×3 / ×5 (4–6 tries each) | 800 | best 12 / 14 / 15 / 14 | 25.1% | 8.6 / 9.7 / 10.5 / 11.4 | 37 / 46 / 48 / 55% |
| **F3-2 (frozen): every 5, its mix, catch-up ×3** | **3,200** | **16** | **25.1%** | **10.5** | **50.2%** |
| F3-2, first half of the same games | 1,600 | 15 | 25.1% | 10.5 | 50% |
| F3-2, new games 3,201–6,400 / 3,201–9,600 | 3,200 / 6,400 | 16 / 15 | 25.1% | 10.5 | 50% |
| Business extra catch-up, 4 players (3 tries) | 800 | 13–15 | 25.1% | 10.6–10.8 | 48–50% |

F3-2 at 3,200 (average score in brackets): 2 players normal: Backpacker 51% (128.9), Business 42% (119.2), Luxury 54%
(121.9), Nomad 43% (123.7), Kris Ann 53% (125.4); 2 players planning: 49%, 60%, 46%, 57%, 47%; 4 players normal: 30%,
**17%** ❌, 26%, 21%, 29%; 4 players planning: **20%** ❌ (just under), **32%** ❌, 22%, **31%** ❌, 21%. Robot check: robots pay
for 38–58% of their trips. Go home after 3 turns without money 0; longest blocked streak 2 (3 on 6,400 new games); failed
visa tests 15–16%. Bad-card shares of the 100-turn mix: Kris Ann 28–31%, the others 41–66%. On 6,400 new games the misses
are Business 4 players 17% / 33%, Business 2 players planning 63%, Backpacker 4 players normal 31%, Kris Ann 4 players
planning 19.5%.

Why the first run was unfair (point split, scratch script, 60–300 games): in 2-player games Kris Ann's opponent owns every
business, so her tickets, visas and tour fees (about 10 points a game) go to the opponent; her +3 per big country does not
grow with the game. The misses left after tuning are a profile doing well with one robot type and badly with the other:
the planning Business uses its cheap fast trips better (about 83 areas a game against 75). Card rules can't separate them.

**30 and 50 turns with catch-up** (fair of 40, 3,200 games per line):

| Version | Fair | Boredom | Lead changes | Won by ≤3 |
|---|---|---|---|---|
| Today (TG) | 32 | 26.2% | 4.59 | 31.9% |
| Catch-up ×1 / ×2 / ×3, today's mix | 26 / 23 / 22 | 26.1–26.2% | 5.43 / 5.91 / 6.19 | 42.4 / 47.8 / 50.0% |
| **K1-3: catch-up ×1, card mix tuned (tries 3–6 the same)** | **33** | **26.2%** | **5.40** | **42.9%** |
| K1-3, first half of the same games (1,600) | 31 | 26.2% | 5.40 | 42.9% |
| K1-3, new games 3,201–6,400 / 3,201–9,600 | 32 / 32 | 26.2–26.3% | 5.38–5.39 | 42.4–42.6% |

Try 1 of the tuning repeated the earlier catch-up ×1 run exactly (0 differences in 8 lines). On new games today's game
and K1-3 are equally fair (32 of 40); K1-3 is clearly more exciting. K1-3 misses (6,400 new games): 30 turns 2 players
normal Business 60.3%; 50 turns 2 players normal Nomad 61.4%; 2 players planning Business 64.2%, Luxury 61.1%; 4 players
normal Backpacker 35.0%, Business 19.2%; 4 players planning Backpacker 17.4%, Business 31.3%. Bad-card shares of K1-3:
30 turns 28–62%, 50 turns 37–66%.

**Owner's final decision (2026-11-22):** the 30- and 50-turn games adopt catch-up ×1 (K1-3); the 100-turn game F3-2.
Fairness about 80% at 3,200 games per line is accepted (the 34 of 40 at 1,600 stays the aim).

## Step 2.12, part J2 (2026-11-22): the built game measures as J1

The game with the 100-turn map, the three card mixes and catch-up built in (`src/`), measured once per map with the
lab options of J2 (`lab2.ts <label> 3200` and `lab2.ts <label> 3200 --lines=100`, games 1–3,200 per line, the same
seeds as J1). Both match the J1 scratch versions exactly.

**30 and 50 turns (K1-3): old profiles 25 of 32, Kris Ann 8 of 8, 33 of 40.** Robot check: robots pay for 42–56% of
their trips. Averages: boredom 26.2%, lead changes 5.40, won by 3 or less 42.9%.

| Line | Backpacker | Business | Luxury | Nomad | Kris Ann | Boredom | Excitement |
|---|---|---|---|---|---|---|---|
| 30 turns, 2 players, normal | 47% ✅ (59.0) | 59% ✅ (52.9) | 49% ✅ (53.0) | 52% ✅ (56.3) | 48% ✅ (55.5) | 29% | 4.0 lead changes, 41% won by ≤3 |
| 30 turns, 2 players, planning | 48% ✅ (61.4) | 46% ✅ (57.5) | 53% ✅ (58.8) | 44% ✅ (59.2) | 52% ✅ (60.0) | 32% | 4.6 lead changes, 38% won by ≤3 |
| 30 turns, 4 players, normal | 30% ✅ (52.1) | 23% ✅ (50.3) | 25% ✅ (51.2) | 26% ✅ (51.8) | 22% ✅ (51.5) | 27% | 4.9 lead changes, 48% won by ≤3 |
| 30 turns, 4 players, planning | 22% ✅ (54.3) | 27% ✅ (54.9) | 24% ✅ (54.7) | 25% ✅ (55.5) | 27% ✅ (56.6) | 27% | 5.4 lead changes, 48% won by ≤3 |
| 50 turns, 2 players, normal | 49% ✅ (77.4) | 39% ❌ (74.4) | 42% ✅ (75.8) | 59% ✅ (81.8) | 52% ✅ (78.7) | 23% | 4.9 lead changes, 41% won by ≤3 |
| 50 turns, 2 players, planning | 52% ✅ (86.0) | 66% ❌ (84.7) | 60% ✅ (84.5) | 40% ❌ (84.2) | 46% ✅ (85.2) | 26% | 5.4 lead changes, 37% won by ≤3 |
| 50 turns, 4 players, normal | 34% ❌ (75.2) | 19% ❌ (71.7) | 26% ✅ (73.6) | 22% ✅ (73.3) | 25% ✅ (74.8) | 22% | 6.6 lead changes, 45% won by ≤3 |
| 50 turns, 4 players, planning | 17% ❌ (76.4) | 31% ❌ (79.6) | 23% ✅ (78.1) | 28% ✅ (79.9) | 25% ✅ (79.8) | 24% | 7.4 lead changes, 46% won by ≤3 |

Go home 12–94 per line (after 3 turns without money 0); blocked turns 0–105; longest blocked streak 2; failed visa tests
15.1–16.1%; draws 0–1 per line.

**100 turns (F3-2): old profiles 12 of 16, Kris Ann 4 of 4, 16 of 20.** Robot check: robots pay for 38–58% of their
trips. Averages: boredom 25.1%, lead changes 10.52, won by 3 or less 50.2%.

| Line | Backpacker | Business | Luxury | Nomad | Kris Ann | Boredom | Excitement |
|---|---|---|---|---|---|---|---|
| 100 turns, 2 players, normal | 51% ✅ (128.9) | 42% ✅ (119.2) | 54% ✅ (121.9) | 43% ✅ (123.7) | 53% ✅ (125.4) | 26% | 8.6 lead changes, 44% won by ≤3 |
| 100 turns, 2 players, planning | 49% ✅ (131.7) | 60% ✅ (131.6) | 46% ✅ (134.6) | 57% ✅ (133.5) | 47% ✅ (133.4) | 24% | 10.0 lead changes, 55% won by ≤3 |
| 100 turns, 4 players, normal | 30% ✅ (122.3) | 17% ❌ (116.8) | 26% ✅ (120.5) | 21% ✅ (119.9) | 29% ✅ (121.4) | 26% | 11.0 lead changes, 50% won by ≤3 |
| 100 turns, 4 players, planning | 20% ❌ (126.6) | 32% ❌ (128.7) | 22% ✅ (127.6) | 31% ❌ (129.0) | 21% ✅ (128.2) | 24% | 12.4 lead changes, 52% won by ≤3 |

Go home 40–138 per line (after 3 turns without money 0); blocked turns 0–75; longest blocked streak 2; failed visa tests
15.4–16.0%; draws 0. Time on this machine (4 cores): 11 minutes (30 and 50 turns), 26 minutes (100 turns).

## Step 2.12, part J4 (2026-11-25): the 100-turn facts change nothing in robot games

After J4 (every 100-turn area with its own 12 facts and 2 test-only geography facts), the 4 lines of the 100-turn game
were measured again (owner-approved): `lab2.ts J4 3200 --lines=100`, games 1–3,200 per line, the same seeds as J2.
**Every line is identical to J2**: 16 of 20 (old profiles 12 of 16, Kris Ann 4 of 4), the same win shares, average scores,
boredom (24–26%), lead changes (8.6–12.4), won by 3 or less (44–55%), go home, blocked turns and failed visa tests
(15.4–16.0%). Robots answer at a fixed rate whatever the question, so which fact is drawn does not change their games.
The 30- and 50-turn maps were not run (their facts did not change).
