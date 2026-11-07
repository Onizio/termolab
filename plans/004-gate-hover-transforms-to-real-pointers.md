# 004 — Gate hover transforms to real pointers

- **Status**: DONE
- **Commit**: n/a (not a git repository)
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 3 files

## Problem

About 20 :hover transform rules (lift/scale/rotate) ran on touch.

## Target / change made

Every :hover rule containing transform in styles.css, tabfolio.css, editorial.css wrapped in @media (hover: hover) and (pointer: fine).

## Verification

- Mechanical: npm run build, npm run lint, npm test all pass.
- Feel check: Emulate touch: tapping cards/buttons leaves no stuck lift or scale. Desktop hover unchanged.
