# Audit before the first release (task 15, 2026-10-10)

Owner's request: a full audit of the Android app and the web game before the first signed build.
Owner-approved on 2026-10-10: fix groups A (Android) and B (web), target audience **under 13**.

## How it was checked

- Read line by line: every Android file (manifest, `MainActivity.java`, build and Gradle files, icons,
  values), the 3 GitHub workflows, `scripts/build-web.ts`, `web/index.html`, `web/style.css`, and the
  sound, save, timer, zoom and storage code in `src/web/`.
- Tested: `npm run build` (4,342 KB, same size as the owner's `index.html`), opened in Chromium at 7
  landscape screen sizes (568×320 to 1366×1024) with screenshots and layout measurements; start-up
  time with a normal and a 6× slowed CPU (0.9 s and 4.9 s).
- Game text scanned for the Families Policy (under 13): only educational history facts, 2 cultural
  mentions of wine; no violence, gambling or other unsuitable content.
- Not re-audited: the game rules (`src/engine`, frozen, covered by the 1,000-robot-game tests) and the
  flag and wonder drawings (pictures, not code).
- Limit: Google's Maven server is blocked from the cloud session, so the Android code is compiled by
  the owner's Android Studio and the GitHub Android workflow, not in the session.

## Findings

### Critical
| # | Problem | Evidence | Group |
|---|---|---|---|
| C1 | Back gesture leaves the game at once on Android 13+ ("Leave the game?" never shows). Caused by the SDK 36 change. | `MainActivity.java` used `onBackPressed`, no longer called for back gestures | A |
| C2 | The app crashes if Android stops the web engine (low memory). | No `onRenderProcessGone` in the `WebViewClient` | A |
| C3 | Music and sounds keep playing after leaving the app or locking the phone. | No `onPause`/`onResume`; `sound.ts` never pauses on a hidden page | A + B |

### User experience
| # | Problem | Evidence | Group |
|---|---|---|---|
| U1 | Blank white/black screen for 1–5 s at start. | Load test; no WebView or window background colour | A |
| U2 | The camera hole can cover the title (left) or "New game" (right). | Cut-out mode on, but no `viewport-fit=cover` and no safe-area space in the CSS | A + B |
| U3 | 4:3 and 16:10 tablets: the map fills about a third of its panel. | Screenshot 1366×1024; the zoom fits the width only | B |
| U4 | Small phones: smallest text 10.9 px, 4 header buttons under 32 px tall. | Measured at 568×320 and 640×360 | B |
| U5 | The first-time guide needs scrolling inside the card on small phones. | Screenshot 568×320 | B |
| U6 | The 15-second question clock keeps running while the app is in the background (counts as a timeout). Fair against cheating, harsh after a phone call. | `main.ts`, fixed deadline | owner's decision |

### Security
| # | Finding | Risk | Group |
|---|---|---|---|
| S1 | `setJavaScriptEnabled` warning | None in practice: no text input, no outside content, other links blocked, no JavaScript bridge, file access off | — |
| S2 | `content://` access not turned off | Low | A |
| S3 | No Content-Security-Policy in `index.html` | Low; extra protection against any internet loading | B |
| S4 | `allowBackup="true"` | Fine: saved games only, no personal data | — |

Good: no internet permission, no tracking, no personal data, no debugging in release, saves kept across
app updates (fixed address `https://appassets.androidplatform.net`).

### Tidiness (Android Studio warnings)
- T1 redundant `@SuppressWarnings`; T2 missing `@NonNull`; T3 old `setSystemUiVisibility` (Android 11+
  has a newer way). Group A.

### Google Play, under 13 (Families Policy)
- Allowed: no ads, no purchases, no data collected, no outside links, no permissions.
- Needed in the Play Console: a **privacy policy link** (required for apps for children), target age
  groups, content rating questionnaire, Data safety form ("no data collected").

## Fixes (2026-10-10, owner-approved groups A and B)

| # | Fix | Files | Checked |
|---|---|---|---|
| C1 | Back button and gesture use AndroidX `OnBackPressedDispatcher` (`ComponentActivity`); "Leave the game?" on every Android version | `MainActivity.java`, `app/build.gradle.kts` (`androidx.activity:activity:1.10.1`) | Owner's Android Studio + phone test |
| C2 | `onRenderProcessGone`: the web view is rebuilt and the game reopens (start screen offers Continue) | `MainActivity.java` | Owner's Android Studio |
| C3 | `onPause`/`onResume` pause the page; the page pauses music and the clock sound while hidden and resumes them | `MainActivity.java`, `src/web/sound.ts` | Owner's phone test |
| U1 | Game colour `#0A3A40` behind the web view and as window background; Android 12+ opening screen shows the icon on it | `MainActivity.java`, `res/values/themes.xml`, `res/values-v31/themes.xml`, manifest | Owner's phone test |
| U2 | The app sends the camera cut-out size (`--cut-*`); the page adds it as space (with `env(safe-area-inset-*)`, `viewport-fit=cover`) | `MainActivity.java`, `web/index.html`, `web/style.css`, `main.ts` (`--ui-zoom`) | Simulated 40 px hole: content moves 40 px in |
| U3 | Retested during play: the map fills the tablet panel well (1366×1024). Only the home-country choice (once per game) leaves space. **No change** | — | Screenshots |
| U4 | Small text a little bigger (`.small`, `.chip`, `.round`, header and map buttons); larger invisible touch area around header, chip and map buttons | `web/style.css` | Smallest text 10.2 → 10.9 px (568×320), 10.7 → 11.4 px (800×360) |
| U5 | Guide drawing takes the height the text leaves free; news phone always fits; event card more compact on phones | `web/style.css` | Guide, all 11 steps: before, 6 steps scrolled (up to 88 px at 800×360); after, only the small "Skip guide" button is partly hidden on 2 steps (10–18 px) |
| U6 | Owner's decision (2026-10-10): the clock keeps running when the player leaves the app (no looking up answers). No change | — | — |
| S2 | `setAllowContentAccess(false)` | `MainActivity.java` | — |
| S3 | Content-Security-Policy: only what is inside the file | `web/index.html` | No blocked item in the full test runs |
| T1–T3 | `@SuppressLint` with review note, `@NonNull`, Android 11+ `WindowInsetsController` | `MainActivity.java` | Owner's Android Studio warnings |

| Play | Privacy policy page (no data collected; contact info@connect.al, owner-approved), published with the website | `web/privacy.html`, `.github/workflows/pages.yml` | After merge: https://albmarketsautopilot-lab.github.io/kaj-game/privacy.html |

Web checks after the fixes: `npm run typecheck` clean, `npm test` 190 pass, `npm run build` 4,344 KB, no
layout overflow at the 7 screen sizes.
