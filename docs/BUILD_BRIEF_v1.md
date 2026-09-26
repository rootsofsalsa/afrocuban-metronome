# Build brief: AfroCuban Metronome v1 (local first)

**Goal:** turn the approved single-file prototype (`prototype/afrocuban-metronome-v1.0.html`) into a clean static site in a **local git repo** on the owner's Mac Studio, previewed locally and working well on desktop and mobile. GitHub, GitHub Pages and the metronome.rootsofsalsa.com domain come later, in the section at the end. Don't do them now. Read `CLAUDE.md` first; its musical rules are fixed.

Work through the phases in order. At the end of each phase, stop, summarize what changed, tell the owner how to check it, and wait for a go-ahead before starting the next.

---

## Phase 0: Repo setup

1. Initialize a **local** git repo (`git init`, no remote) with this layout:
   ```
   CLAUDE.md
   brand/BRANDBOOK.md       # owner-supplied
   brand/logo.svg           # owner-supplied
   README.md                 # what it is, local preview, how to deploy, how to add a pattern or sample
   prototype/afrocuban-metronome-v1.0.html   # reference only, never served
   docs/BUILD_BRIEF_v1.md
   site/
     index.html
     css/styles.css
     js/main.js              # UI wiring
     js/audio.js             # AudioContext, synthesized voices, sample loading, choke
     js/scheduler.js         # lookahead scheduler, grid stepping, listen-then-play, trainer
     js/patterns.js          # PATTERNS + SPANS data (single source of truth)
     js/meters.js            # free-mode meters and subdivisions
     js/grid.js              # metronome-row defaults and quick fills (pure functions)
     js/storage.js           # localStorage with try/catch
     samples/README.md       # naming convention (copy from kit)
     favicon.svg
   tests/
     patterns.test.js
     grid.test.js
   .gitignore
   ```
2. Keep `grid.js` and `patterns.js` free of DOM and audio code so they can be tested in Node.
3. Make the first commit.

**Done when:** `git log` shows the initial commit and the structure matches.

## Phase 1: Port the prototype faithfully

1. Split the prototype into the modules above. Behavior and look should be the same as v1.0.
2. The prototype relied on the artifact host for its page skeleton. Add a proper `<!doctype html>`, `<html lang="en">`, `<meta charset="utf-8">`, the viewport meta with `viewport-fit=cover`, `<title>AfroCuban Metronome</title>`, a meta description and a favicon.
3. Keep the Google Fonts links (Big Shoulders Display, Instrument Sans, JetBrains Mono) with their fallback stacks.
4. Keep light and dark themes working through `prefers-color-scheme`.
5. The localStorage keys can be renamed to `afrocuban.*`.
6. Keep the prototype's styling in this phase. Branding comes in Phase 1b, so any visual change can be judged on its own.

**Done when:** a side-by-side check against the prototype shows the same patterns, grid behavior, quick fills, meter display, listen-then-play, trainer, count-in, saved setups and keyboard shortcuts.

## Phase 1b: Apply the Roots of Salsa brand

1. Read `brand/BRANDBOOK.md` and `brand/logo.svg`. If either is missing, stop and ask.
2. Summarize the brand rules you'll apply (palette, type, logo usage, voice) in a few lines, and list any gaps the brand book doesn't cover. Wait for approval.
3. Put the brand into CSS custom properties (design tokens) in `styles.css`, so colors and fonts live in one place. Define light and dark values. If the brand book only defines one theme, propose the other and ask.
4. Replace the text header with the logo, following clear-space and minimum-size rules. Keep "AfroCuban Metronome" as the page title and as an accessible label (`alt` or `aria-label`).
5. Generate `favicon.svg` (and a 180 px `apple-touch-icon.png` for iPhone home screens) from the logo, as the brand book permits.
6. Restyle the grid states within the brand palette: the downbeat click, click, off, stroke, playhead and "Your turn" dimming. They must stay clearly distinguishable, including for color-blind users, so use shape or fill as well as hue.
7. Check contrast: text and essential UI need WCAG AA (4.5:1 for body text).

**Done when:** the owner signs off on screenshots at desktop and phone widths, in light and dark.

## Phase 2: Tests that protect the music

1. `tests/patterns.test.js` asserts every pattern's display name, step count and hit indices exactly as listed in `CLAUDE.md`. It also checks that no other patterns exist.
2. `tests/grid.test.js` asserts the quick-fill output for each span and each free-mode meter. Expected rows (D = downbeat click, x = click, . = off):

   | Span or meter | Beats | Downbeats |
   |---|---|---|
   | 16-step `2bar` | `D.x.D.x.D.x.D.x.` | `D...D...D...D...` |
   | 16-step `1bar` | `D...x...D...x...` | `D.......D.......` |
   | 12-step `dq` | `DxxDxxDxxDxx` | `D..D..D..D..` |
   | 12-step `e` | `DDDDDDDDDDDD` | `D..D..D..D..` (owner's correction; was `DDDDDDDDDDDD`) |
   | Free: 4/4 cut time, 2 per beat | `DxDx` | `D.D.` |
   | Free: 6/8 in 2, 3 per beat | `DxxDxx` | `D..D..` |

3. Run them with `node --test tests/` (no npm needed), and note the command in the README.

**Done when:** `node --test tests/` passes locally.

## Phase 3: Mobile and iPhone reliability

1. **Unlock audio on the first tap.** Create or resume the AudioContext inside the Start click handler. Also resume it on `visibilitychange` when the page becomes visible again.
2. **iPhone silent switch.** Web Audio is muted when the ringer switch is on silent.
   - Where supported, set `navigator.audioSession.type = "playback"` (Safari 16.4+).
   - Otherwise, on Start, play a short silent looping `<audio>` element to move the page into the media-playback category.
   - Verify on a real iPhone with the switch on silent, using the local Wi-Fi preview (see CLAUDE.md).
3. **Screen wake lock** while playing. Request it on Start, release it on Stop, and re-request after the page becomes visible again. Tolerate rejection. It only works over HTTPS or localhost, so on a phone it can't be fully tested until the site is on GitHub Pages. Say so in the summary.
4. **Touch targets** at least 40 px for grid cells, toggles and transport buttons. At phone width (about 390 px), the grid must fit with no horizontal page scroll. If 16 cells get too small, let the grid wrap to two rows at the barline.
5. Make sure Space and arrow shortcuts don't fire while typing in inputs.

**Done when:** the owner confirms, over the local Wi-Fi preview, that it plays with the silent switch on and stays in time for 5+ minutes. Check at least one iPhone, plus an Android phone if available.

## Phase 4: Sample-ready audio engine

1. In `audio.js`, support per-instrument sample sets loaded from `site/samples/`. The naming convention is in `site/samples/README.md`.
2. Map sounds to voices:
   - Pattern sound options: **Clave**, **Campana** and **Catá**. Each uses its recorded sample if present, otherwise the synthesized voice.
   - Click sounds: keep the synthesized click, woodblock, rim and beep. Add the recorded instruments as choices once they exist.
3. Choke: when a new stroke of the same instrument starts, fade the previous one over about 15 ms.
4. Decode samples once at startup, after the first user gesture, and cache the buffers. Show no errors if a sample is missing; fall back silently.
5. Keep the total sample payload small: trimmed mono files, AAC (`.m4a`) or MP3 for Safari compatibility, plus WAV originals kept out of the served folder.

**Done when:** dropping correctly named files into `site/samples/` changes the sound with no code edits, and removing them falls back to synthesized voices.

---

## Later: migrate to GitHub and GitHub Pages (only when the owner asks)

### Step A: Push to GitHub and deploy to metronome.rootsofsalsa.com

0. Create the GitHub repo in the owner's `rootsofsalsa` organization, add it as the remote, and push the existing local history. Nothing is lost; all local commits carry over.

1. Create `.github/workflows/pages.yml` using the official GitHub Pages actions. It triggers on push to `main` and runs the test job, then uploads `site/` as the Pages artifact and deploys it.
2. Walk the owner through these steps. They're done in the browser and DNS, not in code:
   - In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
   - In the same Pages settings, set **Custom domain** to `metronome.rootsofsalsa.com`.
   - In Squarespace, open the domain's DNS settings for rootsofsalsa.com. Add a **CNAME** record with host `metronome` and data `<github-account>.github.io` (the account or organization name, not the repo name).
   - Recommended: verify the domain for the GitHub account under **Settings → Pages → Verified domains**.
   - Once DNS resolves, tick **Enforce HTTPS**.
3. Help the owner confirm the site loads at https://metronome.rootsofsalsa.com on a phone.

**Done when:** a push to `main` updates the live site within a few minutes, and HTTPS works.

### Step B: Put it on rootsofsalsa.com

Give the owner copy-paste instructions for Squarespace:
- **Link:** add a navigation link or button to `https://metronome.rootsofsalsa.com`. This is the full-screen experience and the best one on phones.
- **Optional embed:** add a Squarespace Embed block with:
  ```html
  <iframe src="https://metronome.rootsofsalsa.com" title="AfroCuban Metronome"
          style="width:100%;height:1100px;border:0"
          allow="autoplay; screen-wake-lock"></iframe>
  ```
  Tell the owner to test that audio starts on tap inside the embed. If anything is flaky on phones, use the link instead.

---

## Out of scope for v1 (discuss with the owner before building)

- Weekly homework packs and exercise links
- Practice streaks and milestones
- Lineage notes for each pattern
- "Hear it in context" loops
- Hiding strokes during "Your turn"
- An iPhone App Store version
- Analytics
- Removing the synthesized pattern sounds, once the owner and students have used the recordings long enough to trust them (owner's plan, noted in Phase 4)

Suggest these when relevant, but don't build them until asked.
