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
- Takes rotate, so repeated strokes sound less mechanical.
- Catá plays the right-hand, left-hand or flam recording for each stroke, following the sticking in `site/js/patterns.js`.
- When a new stroke of the same instrument starts, the previous one fades out over 15 ms (choke) instead of ringing on under it.

## Recording checklist

- **Mic:** condenser 6–12 inches from the striking point. Put blankets or a closet of clothes around you to kill basement reverb.
- **Levels:** hardest strokes peak around −12 dBFS. Clave transients clip easily.
- **Takes:** 5–10 single strokes per sound, with about a second of silence between them. Record dry, with no reverb or effects. For catá, record the right hand, the left hand and the flam as separate sounds.
- **Format:** 48 kHz, 24-bit WAV. Claude Code trims, levels and converts the files to mono `.m4a` for the site. On the Mac, it can use `ffmpeg` (installed) or the built-in `afconvert`.
- **Bonus:** about 30 seconds of each full pattern played the way you teach it, for future "hear it in context" loops.
