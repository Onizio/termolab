# 001 — Rename duplicate flameFlicker keyframes

- **Status**: DONE
- **Commit**: n/a (not a git repository)
- **Severity**: MEDIUM
- **Category**: Cohesion
- **Estimated scope**: 2 files

## Problem

styles.css:3347 and tabfolio.css:1020 both define @keyframes flameFlicker; later file wins, so styles.css flames (0.15–0.2s) run the 5-step rotate/opacity version.

## Target / change made

Rename the tabfolio.css keyframe and its one use (.flame-active/.lamp-flame, 0.45s) to flameFlickerLamp.

## Verification

- Mechanical: npm run build, npm run lint, npm test all pass.
- Feel check: Feel-check: lamp flames in Combustão and Bancada flicker as before at 0.15–0.2s; .flame-active unchanged at 0.45s.
