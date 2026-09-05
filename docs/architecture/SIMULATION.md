# Simulation architecture

This document separates facts present on the current branch from intended architecture. “Target” items are not promises that a system exists.

## CURRENTLY IMPLEMENTED

- `src/core` is a platform-neutral TypeScript simulation with seeded `RNG`; life generation and tested outcomes are reproducible from seeds.
- Version 5 `State` stores world/character seeds, RNG state, ISO simulation time, schema/simulation versions, a versioned fictional Türkiye ruleset, explicit life/decision state, shared app data, events, and processed event IDs. Versions 1–4 migrate in order and validate before use.
- Time changes through `advanceTo`/`advanceMinutes`. Study, travel, routines, work, decision durations, and registered actions use the same scheduler rather than wall-clock time.
- Due events are ordered by timestamp and processed once. An unresolved blocking decision stops advancement at its timestamp and remains blocking after save/reload.
- The calendar-driven lifecycle covers high school, fictional YKS preparation and results, university or vocational alternatives, courses and credits, internships, work and payroll, housing, recurring personal finances, relationships, retirement, and natural story closure. Failure opens a recoverable path.
- `actions.ts` provides action definitions with prerequisites, duration, costs, cooldowns, and effects. Timed actions apply only after their duration completes and restore their prior state if a due expense makes completion invalid.
- Every balance change goes through `postLedger` as safe-integer kuruş. Validation reconciles each running balance and the final balance; older entries roll into a bounded ledger archive without losing their net value.
- Apps read one `State` object through the store. Decisions and consequences project into the relevant school, career, calendar, mail, notifications, bank, marketplace, chat, feed, map, and archive surfaces.
- Close NPCs age and change occupation and life stage on a deterministic monthly cadence. Contact, invitations, posts, memories, availability, relationship drift, and death persist on the same identities; distant population remains an aggregate.
- Potentially growing event, decision, ledger, message, post, comment, news, mail, notification, assessment, market-history, memory, and routine-journal collections have explicit retention bounds.
- IndexedDB remains behind `SaveRepository`. Store mutations validate a cloned state and ordered autosave snapshots prevent an older write from replacing a newer life.

## Invariants for current and future work

1. **Deterministic seeded state:** simulation-critical choices may not use `Math.random()` or wall-clock entropy. Save enough RNG state/provenance to replay outcomes.
2. **Authoritative simulation clock:** duration is calculated from `State.now`; UI timers may animate UI but never advance life.
3. **Exactly-once event processing:** stable event identity and a processed journal prevent duplicated consequences across advancement and reload.
4. **Blocking decisions:** time cannot pass beyond a decision that needs player input; partial actions apply only the elapsed portion or no effect where partial completion is invalid.
5. **Ledger authority:** every balance change is an integer-kuruş ledger transaction; no screen owns an independent balance.
6. **Cross-app state ownership:** each concept has one domain owner. Other apps query or project it rather than copying it.
7. **Bounded histories:** every potentially unbounded history must define retention/aggregation rules.

## TARGET ARCHITECTURE

### Decision and action engine

Represent actions as data-informed domain commands with prerequisites, duration, costs, effects, failure modes, and consequence scheduling. Execute them through one clock/scheduler path. Blocking decisions should have explicit resolution state rather than relying only on loosely typed event strings.

### Delayed consequences

Outcomes may schedule later events whose inputs are captured deterministically. Consequences must remain explainable and exactly-once across save/load, and should surface through appropriate shared projections such as mail, notifications, calendar, ledger, relationships, and archive.

### NPC level of detail

- **Close:** individually simulated relationships, memories, commitments, and life events.
- **Relevant:** enough persistent identity/state for recurring school, work, housing, or service interactions.
- **Distant/aggregate:** generated or aggregated only when needed, with deterministic promotion to a richer level.

The current `closeness` field and individual NPC list are only a foundation; lifecycle simulation and deterministic promotion/demotion are targets.

### World layers

- **Micro:** player, household, close NPCs, owned items, immediate places, scheduled commitments.
- **Meso:** school, employer, neighborhood, local services, housing and province-level opportunity pools.
- **Macro:** versioned scenario assumptions, fictional economy, broad labor/education conditions.

Updates should run at an appropriate cadence and detail level, never by simulating every resident. Macro and meso layers should influence personal opportunities without shifting play into institutional control.

### Domain ownership

Move toward explicit domain modules for education, career, finance, relationships, housing, mobility, and world/scenario rules, coordinated by the scheduler. React renders projections and dispatches commands. Zustand orchestrates loading/autosave and does not become a parallel simulation engine.
