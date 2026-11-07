# 007 — Bar grow without squashing rounded ends

- **Status**: DONE
- **Commit**: n/a (not a git repository)
- **Severity**: LOW
- **Category**: Physicality
- **Estimated scope**: 1 file

## Problem

apple.css tl-bar-grow used scaleX(0)→1, distorting 999px radius.

## Target / change made

Keyframe uses clip-path: inset(0 100% 0 0 round 999px) → inset(0 0 0 0 round 999px); transform-origin removed.

## Verification

- Mechanical: npm run build, npm run lint, npm test all pass.
- Feel check: Open Combustão result: bar reveals left to right with round end intact. Slow playback 10%.
