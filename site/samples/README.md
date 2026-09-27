# Samples

Recorded one-shot strokes of Vincent's instruments. The files the site plays go in `site/samples/`. Keep the raw recordings in `samples-raw/`, which git ignores and the site never serves.

## Naming

`<instrument>-<stroke>-<take>.m4a`

| Instrument | Strokes | Example |
|---|---|---|
| clave | `main` | `clave-main-1.m4a` |
| campana | `main` | `campana-main-1.m4a` |
| cata | `right` (right hand), `left` (left hand), `flam` | `cata-right-1.m4a`, `cata-left-1.m4a`, `cata-flam-1.m4a` |

Number the takes 1, 2, 3… with no gaps, up to 10 per stroke. The app stops looking at the first missing number.

## How the app uses them

- It looks for these files when the page opens and decodes each one once. Nothing to change in the code: add or remove files and reload the page.
- Only the pattern sounds (Clave, Campana, Catá) use recordings. The metronome clicks (Click, Woodblock, Rim, Beep) are always synthesized.
- A sound with no recording plays its synthesized version, with no error.
- Takes rotate in order (1, 2, 3… then back to 1), so repeated strokes sound less mechanical.
- Catá plays the right-hand, left-hand or flam recording for each stroke, following the sticking in `site/js/patterns.js`.
- When a new stroke of the same instrument starts, the previous one fades out over 15 ms (choke) instead of ringing on under it.

## The recordings in the app (owner, 2026-09-27)

| Files | Takes | From raw hits |
|---|---|---|
| `clave-main-1` … `8` | 8 | 1–8 (the bright strokes 2–8, plus 1, the brightest of the rest) |
| `campana-main-1` … `8` | 8 | 2, 4, 5, 6, 7, 9, 11, 12 |
| `cata-right-1` … `7` | 7 | 2, 5, 6, 9, 10, 12, 13 |
| `cata-left-1` … `5` | 5 | 5, 7, 8, 11, 12 |
| `cata-flam-1` … `5` | 5 | 4, 5, 6, 8, 9 (the tighter flams, grace note about 20 ms ahead) |

Raw hits are numbered in playing order within each raw file (about 15 per sound).

**Why these counts:** because takes rotate in order, a take count that fits evenly into a pattern's strokes would put the same take on the same note every cycle. Each count shares no factor with the strokes per cycle it plays: clave and campana play 5 or 7 per cycle (8 takes); catá right hand 3 or 4 (7 takes); left hand 2, 6 or 7 (5 takes); flam 2 (5 takes). Keep this in mind when adding a pattern or changing a count.

**How they were made:** each stroke starts 0.5 ms into its file (a tiny fade-in, so it lands on time) and keeps its ring until it is 60 dB down, with a 30 ms fade-out. All takes of an instrument are matched in loudness (the catá right, left and flam together), and the loudest take peaks at −3 dBFS. Converted with `afconvert` to AAC at 128 kbps. Chrome and Safari were checked to skip the AAC encoder's 44 ms lead-in, so strokes aren't late. The lossless edited takes are in `samples-raw/processed/`, and the scripts in `samples-raw/tools/`.

## Recording checklist

- **Mic:** condenser 6–12 inches from the striking point. Put blankets or a closet of clothes around you to kill basement reverb.
- **Levels:** hardest strokes peak around −12 dBFS. Clave transients clip easily.
- **Takes:** about 15 single strokes per sound, so the most even ones can be chosen, with about a second of silence between them. Record dry, with no reverb or effects. For catá, record the right hand, the left hand and the flam as separate sounds.
- **Format:** 48 kHz, 24-bit WAV. Claude Code trims, levels and converts the files to mono `.m4a` for the site. On the Mac, it can use `ffmpeg` (installed) or the built-in `afconvert`.
- **Bonus:** about 30 seconds of each full pattern played the way you teach it, for future "hear it in context" loops.
