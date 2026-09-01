# Mobile phone-shell regression and swipe unlock

## Scope

Restore the fictional phone OS layout across the required mobile viewports and add an original, accessible pointer-driven lock-screen unlock gesture. This slice changes UI layout and interaction only; it does not alter simulation or persistence state.

## Plan

1. Reproduce the collapsed mobile app window through bounding-box E2E assertions.
2. Repair the `html` → app-body viewport/flex/grid sizing chain with dynamic viewport fallbacks and safe-area handling.
3. Add a clamped upward Pointer Events gesture, accessible click/keyboard fallback, and reduced-motion behaviour.
4. Verify lock → gesture → home → apps → home at required phone sizes, including a live viewport-height resize.
5. Run the mandatory checks and move this plan to `completed/`.

## Acceptance

- Lock, home, dock, system navigation, and native app bodies remain visibly within every required mobile viewport.
- The desktop rail and window treatment do not appear on mobile.
- Successful, insufficient, accessible fallback, and reduced-motion unlock paths are behaviourally covered.
- Unlocking remains local UI state and does not mutate simulation time.

## Completion

Completed. The layout chain now uses a viewport-height custom property with a dynamic-viewport override, mobile app rows no longer reserve nonexistent chrome, native app bodies have bounded grid sizing, and the lock screen supports clamped pointer drag plus accessible activation. Required viewport, resize, gesture, fallback, and reduced-motion E2E coverage passes.
