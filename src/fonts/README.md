# Self-hosted fonts

## Array

- **Files:** `Array-Regular.woff2` (400), `Array-Bold.woff2` (700)
- **Source:** [fontshare.com/fonts/array](https://www.fontshare.com/fonts/array) — Indian Type
  Foundry, designed by Frode Helland
- **Licence:** ITF Free Font License — free for personal and commercial use
- **Why self-hosted:** Array is not on Google Fonts, so it is served through
  `next/font/local` rather than `next/font/google`. It is the only preloaded face.

Array is built on a dot grid — stems widen from two dots at Regular to four at Bold — and was
designed to work on electronic displays. That construction is the reason it is the display face
here: a typeface assembled the way a machine readout is assembled.

**Open item:** Array has not been specimen-tested at 375px yet. Dot-grid faces can break down at
small sizes. If it fails that test, the display role falls back to Archivo with its width axis
pushed wide, and the type plan loses its strongest justification.

## Archivo and Martian Mono

Loaded from Google Fonts via `next/font/google` (subset `latin`, `display: swap`, not preloaded).
No files are checked in for these.
