# 006 — Delete dead and overridden motion rules

- **Status**: DONE
- **Commit**: n/a (not a git repository)
- **Severity**: LOW
- **Category**: Cohesion
- **Estimated scope**: 4 files

## Problem

Tab entrance defined 4×; only tl-tab-in (apple.css) wins. Bare-ease width/left/height transitions overridden by apple.css. tabFadeIn unused.

## Target / change made

Removed editorial.css rise-in on .workbench/.content-section, apple.css apple-fade-in no-preference block, tabFadeIn keyframes, and bare-ease transitions at styles.css (.thermo-pointer, .thermometer-pin, .efficiency-fill, .bar-fill, .thermo-mercury-fill) and tabfolio.css (.thermo-*, .heat-bar-fill). NOT done: mobile-menu CSS in editorial.css has no JSX users; remove separately.

## Verification

- Mechanical: npm run build, npm run lint, npm test all pass.
- Feel check: Tab switch still fades+rises 6px/240ms. Bars and thermometer still animate (apple.css rules).
