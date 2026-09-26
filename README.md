# AfroCuban Metronome

An Afro-Cuban percussion trainer for Roots of Salsa percussion students. It plays clave, campana and catá patterns over a step-grid metronome, on desktop and mobile browsers.

It's a static site: plain HTML, CSS and JavaScript modules, with no build step and no framework. Everything the browser loads lives in `site/`.

## Preview it locally

On the Mac:

```bash
python3 -m http.server 8000 --directory site
```

Then open http://localhost:8000. Press Ctrl+C in Terminal to stop the server.

On a phone on the same Wi-Fi:

```bash
python3 -m http.server 8000 --directory site --bind 0.0.0.0
```

Then open `http://<Mac's local IP>:8000` on the phone. To find the Mac's IP, go to System Settings → Wi-Fi → Details. Keeping the screen awake needs HTTPS or localhost, so it won't work over this address. That's expected until the site is on GitHub Pages.

The page won't work if you double-click `site/index.html`, because browsers don't load JavaScript modules from `file://`. Always use the server.

## Tests

```bash
node --test tests/
```

Needs Node 22 or newer (on the Mac: `brew install node`). No npm packages are needed.

- `tests/patterns.test.js` checks every pattern's name, step count and strokes against the pattern table in `CLAUDE.md`, and the "One cycle" counting rules.
- `tests/grid.test.js` checks the metronome-row quick fills (Beats, Downbeats, Every step, Clear) for every "One cycle" option and free-mode meter, plus "Listen, then play" cycle counting.

If a test fails, the app has drifted from the owner's musical rules. Fix the app, not the test, unless the owner has changed the rule.

## Project layout

| Path | What it is |
|---|---|
| `site/` | The website: `index.html`, `css/styles.css`, `favicon.svg`, `js/`, `samples/` |
| `site/js/patterns.js` | Every pattern: name, step count, hit positions. The single source of truth. |
| `site/js/meters.js` | Free-mode meters and subdivisions |
| `site/js/grid.js` | Metronome-row defaults and quick fills |
| `site/js/audio.js` | Sounds: synthesized voices, later recorded samples |
| `site/js/scheduler.js` | Timing: lookahead scheduler, count-in, listen-then-play, speed trainer |
| `site/js/storage.js` | Saved settings and setups (localStorage) |
| `site/js/main.js` | Wires the page controls to everything above |
| `tests/` | Automated checks, run with Node |
| `prototype/` | The approved v1.0 prototype. Reference only, never served. |
| `brand/` | Roots of Salsa brand book and logo |
| `docs/BUILD_BRIEF_v1.md` | The build plan, phase by phase |
| `CLAUDE.md` | Project rules for Claude Code, including the canonical patterns and counting rules |

## Add a pattern

Edit `site/js/patterns.js` only. Add an entry with an id, the display name, the step count (12 or 16) and the 0-based step positions of the strokes. The "One cycle" options come from the step count, so a new pattern must have 12 or 16 steps.

Also add the pattern to the table in `CLAUDE.md` and to the `CANON` list in `tests/patterns.test.js`, then run `node --test tests/`. Follow the naming conventions in `CLAUDE.md`.

## Add recorded samples

Follow the naming convention and recording checklist in `site/samples/README.md`. Keep raw WAV recordings in `samples-raw/`; git ignores that folder. The sample-ready audio engine arrives in Phase 4 of the build brief. Until then, the app uses synthesized sounds.

## Deploy

Not deployed yet. The plan is GitHub Pages at metronome.rootsofsalsa.com, deployed by a GitHub Actions workflow on every push to `main`. See "Later: migrate to GitHub and GitHub Pages" in `docs/BUILD_BRIEF_v1.md`.
