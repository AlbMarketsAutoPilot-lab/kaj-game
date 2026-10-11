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

| Game | Robots | Backpacker | Business | Luxury | Nomad | Fair? |
|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal | 18% ❌ (42.1) | 43% ✅ (45.9) | 81% ❌ (52.2) | 57% ✅ (49.0) | |
| 30 turns, 4 players | normal | 9% ❌ (42.7) | 15% ❌ (43.2) | 53% ❌ (50.5) | 24% ✅ (44.8) | |
| 30 turns, 2 players | planning | 41% ✅ (50.4) | 39% ❌ (49.2) | 72% ❌ (54.9) | 49% ✅ (50.3) | |
| 30 turns, 4 players | planning | 9% ❌ (47.1) | 19% ❌ (49.2) | 55% ❌ (55.8) | 17% ❌ (50.1) | |
| 50 turns, 2 players | normal | 27% ❌ (65.7) | 44% ✅ (68.8) | 71% ❌ (73.9) | 56% ✅ (71.2) | |
| 50 turns, 4 players | normal | 10% ❌ (63.4) | 14% ❌ (65.4) | 39% ❌ (70.9) | 37% ❌ (72.2) | |
| 50 turns, 2 players | planning | 42% ✅ (76.2) | 30% ❌ (72.4) | 58% ✅ (77.8) | 71% ❌ (80.7) | |
| 50 turns, 4 players | planning | 14% ❌ (72.2) | 14% ❌ (71.2) | 40% ❌ (76.9) | 32% ❌ (76.5) | 9/32 |

**9 of 32** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "D": Luxury 5-continent bonus removed; Backpacker 3 continents +8; Business citizenship +5; Nomad ticket 2

| Game | Robots | Backpacker | Business | Luxury | Nomad | Fair? |
|---|---|---|---|---|---|---|
| 30 turns, 4 players | normal | 28% ✅ (47.4) | 21% ✅ (44.9) | 29% ✅ (46.5) | 23% ✅ (44.5) | |
| 30 turns, 2 players | normal | 36% ❌ (46.4) | 47% ✅ (48.0) | 60% ✅ (48.0) | 57% ✅ (49.5) | |
| 50 turns, 4 players | normal | 24% ✅ (68.6) | 17% ❌ (67.1) | 18% ❌ (66.2) | 41% ❌ (72.5) | |
| 30 turns, 2 players | planning | 61% ❌ (54.2) | 51% ✅ (51.6) | 48% ✅ (50.5) | 41% ✅ (50.1) | |
| 50 turns, 2 players | normal | 51% ✅ (70.4) | 47% ✅ (70.5) | 44% ✅ (68.1) | 59% ✅ (72.8) | |
| 30 turns, 4 players | planning | 26% ✅ (51.4) | 26% ✅ (51.2) | 29% ✅ (50.6) | 19% ❌ (49.5) | |
| 50 turns, 2 players | planning | 46% ✅ (78.3) | 37% ❌ (74.9) | 52% ✅ (74.7) | 66% ❌ (78.5) | |
| 50 turns, 4 players | planning | 41% ❌ (77.8) | 17% ❌ (71.7) | 16% ❌ (72.2) | 25% ✅ (74.6) | 21/32 |

**21 of 32** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "F": Luxury 5 continents +2; Backpacker 3 continents +6; Business citizenship +5; Nomad ticket 2

| Game | Robots | Backpacker | Business | Luxury | Nomad | Fair? |
|---|---|---|---|---|---|---|
| 30 turns, 2 players | normal | 27% ❌ (44.8) | 47% ✅ (47.8) | 70% ❌ (50.0) | 55% ✅ (49.3) | |
| 30 turns, 4 players | normal | 20% ✅ (45.4) | 22% ✅ (45.0) | 36% ❌ (48.2) | 22% ✅ (44.6) | |
| 50 turns, 4 players | normal | 17% ❌ (66.8) | 18% ❌ (67.1) | 25% ✅ (68.2) | 40% ❌ (72.1) | |
| 30 turns, 2 players | planning | 46% ✅ (52.5) | 49% ✅ (51.6) | 57% ✅ (53.4) | 47% ✅ (50.5) | |
| 50 turns, 2 players | normal | 39% ❌ (68.6) | 45% ✅ (70.1) | 56% ✅ (70.5) | 59% ✅ (73.0) | |
| 30 turns, 4 players | planning | 19% ❌ (49.2) | 30% ✅ (51.6) | 32% ❌ (51.7) | 20% ✅ (49.5) | |
| 50 turns, 2 players | planning | 45% ✅ (76.8) | 39% ❌ (75.2) | 50% ✅ (75.3) | 67% ❌ (78.6) | |
| 50 turns, 4 players | planning | 27% ✅ (75.5) | 22% ✅ (73.1) | 28% ✅ (74.0) | 23% ✅ (74.6) | 21/32 |

**21 of 32** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "G": Luxury 5 continents +2; Backpacker 3 continents +6; Business citizenship +6; Nomad ticket 2

| Game | Robots | Backpacker | Business | Luxury | Nomad | Fair? |
|---|---|---|---|---|---|---|
| 30 turns, 4 players | normal | 18% ❌ (45.4) | 27% ✅ (45.9) | 35% ❌ (48.1) | 21% ✅ (44.6) | |
| 30 turns, 2 players | normal | 26% ❌ (44.8) | 50% ✅ (48.4) | 69% ❌ (49.9) | 53% ✅ (49.3) | |
| 30 turns, 2 players | planning | 45% ✅ (52.5) | 54% ✅ (52.7) | 56% ✅ (53.5) | 43% ✅ (50.4) | |
| 30 turns, 4 players | planning | 18% ❌ (49.3) | 33% ❌ (52.4) | 30% ✅ (51.7) | 19% ❌ (49.5) | |
| 50 turns, 4 players | normal | 16% ❌ (66.8) | 22% ✅ (67.8) | 24% ✅ (68.4) | 38% ❌ (72.1) | |
| 50 turns, 2 players | normal | 39% ❌ (68.6) | 47% ✅ (70.8) | 56% ✅ (70.5) | 58% ✅ (72.9) | |
| 50 turns, 2 players | planning | 45% ✅ (76.8) | 40% ✅ (76.0) | 48% ✅ (75.3) | 67% ❌ (78.6) | |
| 50 turns, 4 players | planning | 27% ✅ (75.5) | 23% ✅ (74.0) | 27% ✅ (74.0) | 23% ✅ (74.5) | 21/32 |

**21 of 32** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "H": Luxury 5 continents +3; Backpacker 3 continents +6; Business citizenship +6; Nomad ticket 2

| Game | Robots | Backpacker | Business | Luxury | Nomad | Fair? |
|---|---|---|---|---|---|---|
| 30 turns, 4 players | normal | 18% ❌ (45.4) | 26% ✅ (45.8) | 37% ❌ (48.8) | 20% ✅ (44.7) | |
| 30 turns, 4 players | planning | 17% ❌ (50.2) | 31% ❌ (52.3) | 35% ❌ (52.7) | 17% ❌ (49.4) | |
| 30 turns, 2 players | normal | 26% ❌ (44.9) | 51% ✅ (48.5) | 69% ❌ (50.5) | 53% ✅ (49.1) | |
| 30 turns, 2 players | planning | 47% ✅ (52.4) | 53% ✅ (52.3) | 58% ✅ (54.1) | 41% ✅ (50.4) | |
| 50 turns, 2 players | normal | 38% ❌ (68.7) | 47% ✅ (71.3) | 58% ✅ (71.2) | 56% ✅ (72.9) | |
| 50 turns, 4 players | normal | 14% ❌ (66.7) | 19% ❌ (67.9) | 29% ✅ (69.6) | 38% ❌ (72.4) | |
| 50 turns, 2 players | planning | 45% ✅ (77.5) | 37% ❌ (75.0) | 52% ✅ (76.3) | 67% ❌ (78.6) | |
| 50 turns, 4 players | planning | 25% ✅ (75.2) | 25% ✅ (74.7) | 26% ✅ (75.1) | 24% ✅ (74.8) | 18/32 |

**18 of 32** profile results inside the target. (Wins %, with the average final score in brackets.)

## Package "I": Luxury 5 continents +0; Backpacker 3 continents +6; Business citizenship +6; Nomad ticket 2

| Game | Robots | Backpacker | Business | Luxury | Nomad | Fair? |
|---|---|---|---|---|---|---|
| 30 turns, 4 players | normal | 18% ❌ (45.5) | 28% ✅ (45.7) | 31% ❌ (46.5) | 23% ✅ (44.4) | |
| 30 turns, 4 players | planning | 19% ❌ (49.3) | 31% ❌ (52.0) | 30% ✅ (50.5) | 21% ✅ (49.5) | |
| 30 turns, 2 players | normal | 27% ❌ (44.6) | 54% ✅ (48.6) | 62% ❌ (48.0) | 56% ✅ (49.5) | |
| 30 turns, 2 players | planning | 51% ✅ (52.1) | 59% ✅ (52.6) | 48% ✅ (50.5) | 42% ✅ (50.1) | |
| 50 turns, 4 players | normal | 18% ❌ (66.5) | 21% ✅ (67.8) | 19% ❌ (66.3) | 42% ❌ (72.4) | |
| 50 turns, 2 players | normal | 41% ✅ (68.4) | 53% ✅ (71.2) | 46% ✅ (68.1) | 60% ✅ (72.7) | |
| 50 turns, 2 players | planning | 39% ❌ (76.2) | 39% ❌ (75.7) | 53% ✅ (74.7) | 69% ❌ (78.5) | |
| 50 turns, 4 players | planning | 33% ❌ (75.8) | 21% ✅ (72.4) | 18% ❌ (72.2) | 28% ✅ (74.6) | 18/32 |

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
