# Sounds: what the owner provides (task 14C)

The game plays one short sound for each event below. The owner provides the files; Claude adds
them to the game with a 🔊 on/off button (kept on the device).

## The files

| # | File name | When it plays | Length |
|---|---|---|---|
| 1 | `tap.mp3` | Any button tap | very short (≤ 0.2 s) |
| 2 | `walk.mp3` | Walking into a new area (footsteps) | ≤ 1 s |
| 3 | `plane.mp3` | Boarding a plane | ≤ 2 s |
| 4 | `ship.mp3` | Boarding a ship (horn or waves) | ≤ 2 s |
| 5 | `right.mp3` | A right answer (quiz, test, challenge) | ≤ 1 s |
| 6 | `wrong.mp3` | A wrong answer | ≤ 1 s |
| 7 | `card-good.mp3` / `card-bad.mp3` | An event card appears (good: points won; bad: points or a turn lost) | ≤ 3 s |
| 8 | `coins.mp3` | Money for you (visa, tour fee, ticket) and buying a business | ≤ 1.5 s |
| 9 | `citizenship.mp3` | Citizenship granted | ≤ 2 s |
| 10 | `milestone.mp3` | "Halfway there" and "The last five turns" | ≤ 2 s |
| 11 | `win.mp3` | The winner popup at the end (fanfare) | ≤ 4 s |
| 12 | `timer.mp3` | Under each 15-second question (quiz, test, challenge); stops on the answer | 16 s |
| 13 | `music.mp3` | Background music, looping the whole game: normal on the start screen, quiet in the game | 117 s, ≈ 700 KB |

**Done (task 14C, 2026-10-08):** all files above are in `assets/sounds/`, from Pixabay, checked,
trimmed, made mono and set to the same loudness. `right.mp3` and `win.mp3` were replaced by cleaner
ones. The music is ≈ 700 KB (owner's approval). Credits: `assets/sounds/CREDITS.txt`.

## Rules for the files

- **Format:** MP3 (or OGG). Mono is fine.
- **Size:** each sound **under 100 KB** (the music under 600 KB). Everything is packed inside
  the one game file, so small files keep the game fast to load.
- **Licence:** free to use in a game, with no payment and no "non-commercial only" condition.
  Good sources: **Kenney.nl** (CC0), **Pixabay sounds** (free licence), **freesound.org**
  (only sounds marked **CC0**).
- **Credits:** add a file `assets/sounds/CREDITS.txt` with one line per sound: the file name, where it
  came from (the link) and its licence.
- A missing sound is fine: the game just stays silent for that event.

## How to upload them (one step)

On GitHub: open the repository → the folder `assets` → **Add file → Upload files**. Drag the files,
and write `assets/sounds/` in front of the file names (or create the folder `sounds` first). Choose
**"Create a new branch"** and tell Claude its name.
