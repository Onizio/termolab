# 003 — Cancel and clean up the Equilíbrio rAF loop

- **Status**: DONE
- **Commit**: n/a (not a git repository)
- **Severity**: MEDIUM
- **Category**: Performance / Interruptibility
- **Estimated scope**: 1 file

## Problem

EquilibrioTermico.jsx runSimulation started requestAnimationFrame with no handle: no cancel on rerun, no unmount cleanup.

## Target / change made

rafRef = useRef(null); cancel in runSimulation before starting; store each frame id; cleanup effect on unmount. NOT done: per-frame setState in BancadaCombustao.jsx (cleanup already exists); needs a ref/CSS-variable refactor, separate plan.

## Verification

- Mechanical: npm run build, npm run lint, npm test all pass.
- Feel check: Click Simular repeatedly: one animation, no jumps. Switch tab mid-run: no console warnings.
