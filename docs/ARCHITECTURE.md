# Architecture

## Layers

- `src/core`: Deterministic, seeded, platform-neutral simulation, entities, scheduler, ledger and actions.
- `src/data`: Bundled Turkish geography and procedural content vocabularies.
- `src/platform`: Versioned `SaveRepository`; IndexedDB/Dexie and in-memory test adapters, validation and migrations.
- `src/store.ts`: Thin Zustand orchestration and autosave boundary.
- `src/ui`: Responsive phone-first and distinct desktop-window presentation over identical state.

Simulation time is an ISO calendar controlled solely by player actions. Scheduled events carry stable IDs and a processed-ID journal for exactly-once effects. Monetary values are safe integer kuruş; every balance mutation passes through the ledger. Histories are bounded where they can grow (company price history and NPC memories). Close NPCs are represented individually; no population-scale agents exist.

## Saves and PWA

Every save contains `worldSeed`, `characterSeed`, RNG state, simulation/schema versions, and shared application state. Zod validates stored/imported envelopes and migrations are explicit; corrupt input raises an error and is never silently deleted. Workbox precaches immutable application assets while IndexedDB remains separate. No network dependency exists in gameplay.

A future Capacitor package needs only a native `SaveRepository` and optional capability adapters. The core imports no browser or React APIs.
