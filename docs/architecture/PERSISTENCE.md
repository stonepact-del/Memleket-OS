# Persistence contract

## Boundary and storage

Gameplay persistence is local-first. Browser storage uses Dexie/IndexedDB behind the `SaveRepository` interface in `src/platform/saves.ts`; domain code must not access IndexedDB directly. `MemorySaveRepository` supports deterministic tests. Gameplay requires no backend, account, or network connection.

## Validation

Every save is untrusted input, including rows previously written by this application and JSON selected by the player. Validate with the strict Zod schema before saving or returning state to gameplay. Reject unknown structure, invalid timestamps, unsafe numeric values, and malformed nested records with an actionable error. Do not weaken validation to accept an ambiguous save.

Money is always a JavaScript safe integer representing **kuruş**, including balances, ledger entries, prices, salaries, rent, holdings cost, and migrated values. Formatting to TRY belongs at the presentation boundary.

## Versions and migrations

`schemaVersion` describes persisted structure; `simulationVersion` records simulation compatibility/provenance. A schema change requires:

1. a new schema version;
2. an explicit, ordered migration from every supported older version;
3. strict validation of the fully migrated result;
4. tests for valid migration, malformed old input, nested failure paths, and round-trip persistence;
5. a conscious compatibility decision if deterministic meaning changes.

Migrations operate on a clone, must not mutate the stored source before success, and must not guess when required source data is missing or malformed.

## Corruption and no-silent-loss policy

A corrupt record may be omitted from a normal summary list so other lives remain usable, but it must stay untouched in IndexedDB. Loading must report failure rather than delete or reset it. A failed import must not replace a valid save. Never silently truncate, repair, overwrite, or discard player data. Future recovery UI should preserve the raw record and make any destructive choice explicit.

## JSON import/export

Export produces the complete validated state as JSON. Import parses JSON, migrates supported versions, validates strictly, then saves atomically through the repository. Parsing or validation failure leaves existing records unchanged. Treat filenames, IDs, and all imported fields as hostile input; no imported value may bypass domain validation or trigger code/network access.
