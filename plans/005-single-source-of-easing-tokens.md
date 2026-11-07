# 005 — Single source of easing tokens

- **Status**: DONE
- **Commit**: n/a (not a git repository)
- **Severity**: LOW
- **Category**: Cohesion
- **Estimated scope**: 4 files

## Problem

--ease-out lived only in apple.css; 13 hardcoded 0.16,1,0.3,1; 3 hardcoded 0.2,0.75,0.25,1; --ease-release duplicated --ease-out.

## Target / change made

styles.css :root: --ease-out cubic-bezier(0.23, 1, 0.32, 1); --ease-in-out cubic-bezier(0.77, 0, 0.175, 1); --ease-drawer cubic-bezier(0.32, 0.72, 0, 1). Hardcoded curves replaced with var(--ease-out); apple.css --ease-spring and --ease-release alias var(--ease-out). NOT done: duration tokens; transition lists with identical six properties.

## Verification

- Mechanical: npm run build, npm run lint, npm test all pass.
- Feel check: grep -n cubic-bezier src/*.css shows only :root definitions.
