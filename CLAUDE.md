# AfroCuban Metronome

An Afro-Cuban percussion trainer for Vincent's (Roots of Salsa) percussion students. It plays clave, campana and catá patterns over a step-grid metronome, on desktop and mobile browsers.

**Current stage: local only.** A local git repo on the owner's Mac Studio, previewed with a local web server. There is no GitHub remote and no deployment yet. Later it will move to GitHub and GitHub Pages at metronome.rootsofsalsa.com, linked from rootsofsalsa.com (Squarespace). Keep the code ready for that, but don't set up remotes, workflows or DNS until the owner asks.

The owner is a professional percussionist and teacher, and new to Claude Code. Explain what you're about to do in plain language before doing it. Keep changes small and reviewable.

## Source of truth

- `prototype/afrocuban-metronome-v1.0.html` is the approved v1.0 prototype. Match its behavior and musical rules exactly unless the owner asks for a change. Don't edit this file; it is the reference.
- The musical rules below were confirmed by the owner. **Never change a pattern, name, meter or counting rule on your own judgment.** If something looks musically wrong, ask.

## Branding

- **`brand/BRANDBOOK.md` and `brand/logo.svg` are the owner's brand, and they control the look.** Use them for colors, typography, logo usage, spacing and tone of voice.
- **Precedence:** the owner's words first, then the brand book, then the prototype's styling. The prototype's *behavior and musical rules* still win over anything visual.
- Use the logo in the header and derive the favicon from it, following the brand book's rules on clear space, minimum size and color variants. Don't redraw, recolor or distort the logo unless the brand book allows it.
- If the brand book is silent on something (dark mode, grid-cell states, the two click colors), propose choices that fit the brand and ask before committing to them.
- If `brand/` is empty, stop and ask the owner for the files before doing any visual work.

## Patterns (canonical)

Steps are 0-based. `x` = stroke, `.` = rest, `|` = barline.

| id | Display name | Steps | Meter | Notation | Hit indices |
|---|---|---|---|---|---|
| tresdos | Clave Tres Dos | 16 | 4/4 | `x . . x . . x . \| . . x . x . . .` | 0,3,6,10,12 |
| yambu | Clave de Yambú Matancera | 16 | 4/4 | `x . . x x . . x \| x . x . x . . .` | 0,3,4,7,8,10,12 |
| dostres | Clave Dos Tres | 16 | 4/4 | `x . . x . . . x \| . . x . x . . .` | 0,3,7,10,12 |
| abakua | Campana de Abakuá | 12 | 6/8 | `x . x . . x \| . x . x . .` | 0,2,5,7,9 |
| seisxocho | Campana Seis por Ocho | 12 | 6/8 | `x . x . x x \| . x . x . x` | 0,2,4,5,7,9,11 |
| guiro | Campana de Güiro | 12 | 6/8 | `. x x . x x \| . x . x . x` | 1,2,4,5,7,9,11 |
| habanero | Catá Habanero | 16 | 4/4 | `x . x x . x . x \| x . x . x x . x` | 0,2,3,5,7,8,10,12,13,15 |
| matancero | Catá Matancero | 16 | 4/4 | `x x . x x x . x \| x . x . x x . x` | 0,1,3,4,5,7,8,10,12,13,15 |
| columbia | Catá de Columbia | 12 | 6/8 | `x . x x . x \| x x . x . .` | 0,2,3,5,6,7,9 |

**Catá sticking (owner's, keep exactly):** `R` = right hand, `L` = left hand, `F` = flam. Each letter sits on a stroke of the notation above.

| id | Sticking |
|---|---|
| habanero | `R . L R . L . L \| R . L . R L . L` |
| matancero | `R L . L R L . L \| R . L . R L . L` |
| columbia | `F . R L . R \| L R . F . .` |

- A stroke removed on the grid and added back keeps its hand. A stroke added on a new step, and every stroke of a pattern without a sticking, plays `R`.
- **Pattern sound:** choosing a pattern also picks its instrument (Clave, Campana or Catá) as the pattern sound. The user can still change it.

**Naming conventions (owner's lineage, keep exactly):**
- No article ("La"). Capitalize the main words; "de" and "por" stay lowercase.
- "Clave Dos Tres" is what many sources call "3-2 rumba clave". Don't rename it.
- "Catá Habanero" is what many sources call "cáscara". Never call it cáscara in the UI.
- There is no son clave 2-3 or rumba clave 2-3 in the app. Don't add patterns the owner didn't give.

## Counting and meter rules

- **4/4 patterns count in cut time.** BPM = half notes, two beats per bar. Rumba is fast.
- **6/8 patterns count in dotted quarters.** BPM = dotted quarter notes, two beats per bar. The alternative "6/8 in 6" option has BPM = eighth notes.
- The BPM display always names its unit ("per half note", "per dotted quarter note"). Don't use Italian tempo words.
- "One cycle" options for each pattern (`spb` = steps per BPM beat, `num` = steps per numerator beat of the time signature):
  - 16-step patterns: `2bar` = 2 bars of 4/4 on an 8th-note grid (spb 4, num 2, 2 beats/bar); `1bar` = 1 bar of 4/4 on a 16th grid (spb 8, num 4).
  - 12-step patterns: `dq` = 2 bars of 6/8, dotted-quarter pulse (spb 3, num 1, 2 beats/bar); `e` = 2 bars of 6/8, eighth-note pulse (spb 1, num 1, 6 beats/bar).
- **Free mode** (pattern Off) offers only: 4/4 cut time (in 2), 4/4 (in 4), 6/8 (in 2), 6/8 (in 6). Subdivisions are "None" or 2, 3, 4 or 6 per beat. No quintuplets, no other meters, no swing.

## Grid model

- Everything runs on one step grid. With a pattern, the grid is the pattern's cycle. In free mode, it's one bar of beats × subdivision.
- **Metronome row:** each step is 0 off, 1 click, or 2 downbeat click. There are exactly two click sounds, chosen separately. All regular clicks sound identical. The row has an on/off toggle.
- **Quick fills:**
  - **Beats** puts clicks on every numerator beat of the time signature, with the downbeat click where BPM is measured. This is also the default.
  - **Downbeats** puts downbeat clicks only on the two main pulses of each bar: the half notes in 4/4, the dotted quarters in 6/8. In the "counted in 2" settings these are the BPM beats. In 4/4 (in 4) they fall on every 2nd BPM beat; in 6/8 (in 6) and the 12-step `e` span, on every 3rd.
  - **Every step** puts downbeat clicks where Downbeats does and regular clicks everywhere else.
  - Downbeats and Every step were changed from the v1.0 prototype at the owner's request (Phase 2). Don't revert them to "where BPM is measured".
  - **Clear** turns every step off.
- **Pattern row:** step toggles (edits are allowed and marked "(edited)"), plus an on/off toggle. Both rows share one playhead.
- **Listen, then play:** silent sections counted in *pattern cycles* (bars in free mode). Silence targets "pattern only" (the default), "metronome only" or "everything". The status badge shows "Listen · n of N" and "Your turn · n of N", and the pattern row dims during the student's turn.
- Other features to keep: tap tempo, speed trainer, count-in, keyboard shortcuts (Space, ↑/↓, Shift, T), and saved setups in localStorage.
- Removed on purpose, don't bring back: swing, beat flash, beat pads, Italian tempo markings.

## Architecture

- A static site: plain HTML, CSS and vanilla JavaScript ES modules. **No build step and no framework.** Everything served lives in `site/`, which a local server serves now and GitHub Pages will serve later.
- Audio uses the Web Audio API with a lookahead scheduler (timer every 25 ms, scheduling 120 ms ahead). Never schedule sound with `setTimeout` timing.
- **Phones (owner-confirmed after testing on an iPhone, Phase 3):** the page uses the "playback" audio session, so it plays with the silent switch on and pauses other apps' audio (Spotify) when Start is tapped. That is the desired behavior. On touch screens the metronome stops when the page goes to the background, because the phone can't keep it in time there; the owner chose stopping over trying to play on. Keep both. Verified on the owner's iPhone 16 Pro Max, iOS 26.6.2 (2026-09-26). That iOS has the Audio Session API, so the silent `<audio>` fallback for iOS before 16.4 hasn't been tested on a real phone.
- **Samples:** load recorded one-shots from `site/samples/` when present, and fall back to the synthesized voices. A stroke must not cut off the previous stroke of the same instrument abruptly; use a short fade (choke) when a new stroke starts.
  - Files (owner): `clave-main-N.m4a`, `campana-main-N.m4a`, and `cata-right-N`, `cata-left-N`, `cata-flam-N.m4a`. Catá plays the recording for each stroke's hand from the sticking. Naming lives in `site/js/samples.js` and `site/samples/README.md`.
  - Only the pattern sounds (Clave, Campana, Catá) use recordings. The metronome click sounds are Click, Woodblock, Rim and Beep, always synthesized; never offer the instruments as click sounds (owner).
  - The synthesized catá stand-in plays a flam as one ordinary stroke. Don't try to synthesize a flam (owner).
  - Later, not in v1 (owner): once the recordings have proven reliable with students for a while, remove the synthesized pattern sounds altogether. Discuss with the owner first.
- Pattern definitions live in one data file (`site/js/patterns.js`). Adding a pattern should only mean editing that file.
- Later (not now): deploy through a GitHub Actions workflow on every push to `main`.

## Commands

- Local preview: `python3 -m http.server 8000 --directory site`, then open http://localhost:8000. ES modules don't load from `file://`, so always use the server.
- Phone testing on the same Wi-Fi: `python3 -m http.server 8000 --directory site --bind 0.0.0.0`, then open `http://<Mac's local IP>:8000` on the phone. Screen wake lock needs HTTPS or localhost, so it won't work over the LAN address. That's expected until the site is on GitHub Pages.
- Tests: `node --test tests/` (Node 22+). Keep the pattern-data tests passing; they guard the notation above.

## Working agreements

- Before a multi-file change, show a short plan and wait for approval.
- Commit locally in small, logical steps with clear messages. There's no remote yet, so never push.
- After each change, tell the owner exactly what to click or listen for to check it.
- Test mobile behavior, especially iPhone Safari: the silent switch, audio unlocking on first tap, and the screen staying awake.
