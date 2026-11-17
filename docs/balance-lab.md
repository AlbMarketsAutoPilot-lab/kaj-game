# Balance lab — numbers before any change (owner, 2026-10-11)

Made by `node scripts/balance-lab/run.ts` and `node scripts/balance-lab/report.ts`. **The game is not changed:**
every rule package is played on a temporary copy of `src/`. Robots play every seat; profiles are given at random.
Owner's targets: each profile wins **20–30%** of 4-player games and **40–60%** of 2-player games (✅ inside, ❌ outside),
at 30 and 50 turns, with today's normal robots (N) and with planning robots (P4: normal answers, plans 4 moves).
With 400 games per line a win share is accurate to about ±2–4 points.

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
