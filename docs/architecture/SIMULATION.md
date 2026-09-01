# Simulation architecture

This document separates facts present on the current branch from intended architecture. “Target” items are not promises that a system exists.

## CURRENTLY IMPLEMENTED

- `src/core` is a platform-neutral TypeScript simulation with seeded `RNG`; life generation and tested outcomes are reproducible from seeds.
- `State` stores world/character seeds, RNG state, ISO simulation time, schema/simulation versions, shared data for all current apps, events, and processed event IDs.
- Time changes through `advanceTo`/`advanceMinutes`; study and travel use this scheduler rather than wall-clock time.
- Due events are ordered by timestamp. Processed events are marked and journaled. An unresolved `requiresInput` event stops advancement at its timestamp.
- Event effects currently cover exams, a scheduled bill, job-application progression, salary, and an economy update. Applications can create a blocking interview decision.
- Financial mutation for bills, purchases, transport, salary, and trades goes through `postLedger`; money validation requires safe integers.
- Apps read one `State` object through the store. School, career, calendar, mail, notifications, bank, marketplace, social, travel, and market interactions have some cross-app effects.
- Close/relevant/distant NPC labels exist, while current generated NPCs are individual objects with bounded relationship memories. There is no population-scale simulation.
- NPC memories are capped at 20, post comments at 12, and company price histories at 24. Other collections are not uniformly bounded.
- Actions are functions but are not yet represented by a unified data-driven action definition/registry.

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
