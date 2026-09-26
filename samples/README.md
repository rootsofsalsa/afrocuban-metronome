# Samples

Recorded one-shot strokes of Vincent's instruments. In the repo, the served files go in `site/samples/`. Keep the raw recordings in `samples-raw/`, which is not served (add it to `.gitignore` if the files are large).

## Naming

`<instrument>-<stroke>-<take>.m4a`

| Instrument | Strokes | Example |
|---|---|---|
| clave | `main`, `soft` (optional) | `clave-main-1.m4a` |
| campana | `open` (mouth), `closed` (body) | `campana-open-1.m4a` |
| cata | `main`, or `right` and `left` if the sticks sound different | `cata-main-1.m4a` |

If there are several takes of one stroke, the app can rotate through them so repeated strokes sound less mechanical.

## Recording checklist

- **Mic:** condenser 6–12 inches from the striking point. Put blankets or a closet of clothes around you to kill basement reverb.
- **Levels:** hardest strokes peak around −12 dBFS. Clave transients clip easily.
- **Takes:** 5–10 single strokes per sound, with about a second of silence between them. Record dry, with no reverb or effects.
- **Format:** 48 kHz, 24-bit WAV. Claude Code trims, levels and converts the files to mono `.m4a` for the site. On the Mac, it can use `ffmpeg` (`brew install ffmpeg`).
- **Bonus:** about 30 seconds of each full pattern played the way you teach it, for future "hear it in context" loops.
