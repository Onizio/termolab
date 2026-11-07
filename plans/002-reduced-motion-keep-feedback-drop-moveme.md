# 002 — Reduced motion: keep feedback, drop movement

- **Status**: DONE
- **Commit**: n/a (not a git repository)
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 2 files

## Problem

editorial.css:696-703 set transition-duration:0.01ms !important on *, killing color/opacity feedback; .sim-spinner froze.

## Target / change made

Remove the transition-duration line. In apple.css reduce block: transition-property limited to background-color, border-color, color, box-shadow, opacity for buttons/tabs/chips; .sim-spinner uses animation tl-spinner-pulse 0.9s ease-in-out infinite alternate (opacity 0.35→1).

## Verification

- Mechanical: npm run build, npm run lint, npm test all pass.
- Feel check: DevTools Rendering: emulate prefers-reduced-motion. Press a button: no scale, opacity dips. Spinner pulses, does not spin.
