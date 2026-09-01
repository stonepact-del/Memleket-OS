# MemleketOS agent map

## Product
- MemleketOS is a Turkish personal-life simulation controlled primarily through a fictional phone OS.
- The mobile page is the phone; desktop presents the same fictional OS in a computer workspace.
- It follows one person from roughly age 14–15 through long-term life progression in Türkiye.
- Never turn it into a strategy, government, political, geopolitical, or military dashboard.
- Failure should open believable alternative paths, not produce a generic game-over.
- Gameplay is local-first, offline-capable, and deterministic.
- No backend is required for gameplay. Add no analytics, telemetry, ads, paywalls, or tracking.

## Source-of-truth map
- Stable product truth: `docs/product-specs/MEMLEKETOS.md`.
- Approved phone/desktop experience: `docs/design-docs/PHONE_OS.md`.
- App-specific visual language: `docs/design-docs/APP_DESIGN_SYSTEM.md`.
- Current versus target simulation architecture: `docs/architecture/SIMULATION.md`.
- Save guarantees, migrations, and import policy: `docs/architecture/PERSISTENCE.md`.
- Versioned Türkiye-rules framework: `docs/rulesets/TURKEY.md`.
- Ordered future slices and acceptance gates: `docs/exec-plans/ROADMAP.md`.
- Audited current debt: `docs/TECH_DEBT.md`.
- `docs/exec-plans/active/` contains approved in-flight plans; move completed plans to `completed/`.
- Prefer links to these documents over copying their contents into new files.

## Architecture boundaries
- `src/core/`: platform-neutral entities, seeded RNG, simulation clock, scheduler, ledger, actions.
- `src/data/`: bundled content and scenario data; runtime gameplay must not need the web.
- `src/platform/`: persistence repositories, IndexedDB, validation, and migrations.
- `src/store.ts`: thin UI orchestration/autosave adapter; do not make it a second domain layer.
- `src/ui/`: React presentation and input wiring only.
- Domain logic must not live inside React components.
- Cross-app screens must reference shared domain state rather than duplicate state.
- Preserve these dependency directions; the core must not import React, DOM, or storage APIs.

## Simulation invariants
- Never use simulation-critical `Math.random()`; use deterministic seeded randomness.
- The saved seed/RNG state and identical actions must reproduce identical outcomes.
- Simulation time comes only from the authoritative simulation clock.
- Time-consuming actions must use the authoritative clock/event scheduler.
- Events must process exactly once; unresolved blocking decisions stop time advancement.
- Money is integer kuruş and must remain within JavaScript safe-integer bounds.
- Every financial change must use the authoritative ledger.
- Keep growing histories explicitly bounded.
- Existing logic must not be removed during refactors unless the task explicitly requires it.
- Preserve current functioning behavior while reorganizing code.

## Persistence and safety
- IndexedDB is accessed through the `SaveRepository` boundary.
- Treat stored data and imported saves as untrusted input.
- Validate strictly with Zod before use.
- Schema changes require an explicit migration and validation/migration tests.
- Never silently delete, overwrite, or partially accept corrupt saves.
- JSON import/export must preserve a validated, complete save.

## UI and product integrity
- Every visible interactive control must work.
- Do not expose placeholder functionality as finished gameplay.
- OS-wide consistency and individual app identity must coexist.
- Do not render every app as generic cards with only a new title or accent color.
- Do not copy Apple, Android, FiveM, or commercial role-play phone products.
- Do not redesign the UI incidentally while changing domain or documentation code.
- Maintain Turkish player-facing language and accessible semantic controls.

## Testing doctrine
- Tests verify observable behaviour, not internal implementation details.
- Prefer behavioural tests over implementation-detail tests.
- Never write tests that merely confirm the implementation that was just created.
- Assertions must be strict enough that broken behaviour cannot pass.
- Cover validation, interruption, insufficient-resource, and corruption paths—not only happy paths.
- For bugs and tricky logic, write a failing regression test first where practical.
- First identify failure modes; then make the regression test fail for the intended reason.
- Implement only after that failure, make the regression pass, and run the related suite.
- Before PR completion run all mandatory verification commands below.

## Mandatory verification
- Install exactly from the lockfile: `npm ci`.
- Typecheck: `npm run typecheck`.
- Lint all tracked source/docs configuration: `npm run lint`.
- Run unit/behaviour tests: `npm test`.
- Produce the release build: `npm run build`.
- Run `npm run test:e2e` when visible flows or interactions change.
- If the runnable UI changes perceptibly, capture a screenshot for review but do not commit it.

## Task sizing and plans
- A future implementation task should normally be one coherent vertical slice.
- The slice must be independently implementable, reviewable, and end in a verifiable working state.
- Limit it to the relevant domain, UI, cross-app effects, migrations, and tests.
- Never ask one agent task to implement the entire roadmap.
- For multi-step or risky work, create a bounded plan in `docs/exec-plans/active/`.
- Do not claim target architecture is already implemented; check `SIMULATION.md` and current code.

## Git and PR rules
- Start from current `main`; use one purpose-named branch and create one PR for the task.
- Do not create duplicate branches or duplicate PRs.
- Keep commits focused; do not mix unrelated cleanup, gameplay, or visual redesign into a task.
- Never commit screenshots, Playwright videos, debug artifacts, coverage, build output, or binary test output.
- Review `git diff` and `git status` before committing.
- The PR body must state scope, behavioural impact, tests, risks, and migrations when relevant.
- Documentation-only work must not change production behaviour merely to satisfy checks.

## Definition of done
- Requested acceptance criteria are demonstrably met without unrelated scope.
- Architecture boundaries and all simulation/persistence invariants still hold.
- Every changed visible control works and no placeholder is presented as complete.
- Relevant behavioural/regression and migration tests exist and pass.
- `npm ci`, typecheck, lint, unit tests, and build pass; applicable E2E checks pass.
- Documentation reflects current reality and distinguishes implemented work from targets.
- No artifacts or accidental files are staged; one reviewed commit/branch/PR represents the task.

## Major traps
- Do not invent Turkish legal, benefit, education, tax, insurance, or retirement facts.
- Do not require network access at runtime for scenario rules or core gameplay.
- Do not bypass the scheduler for duration, the ledger for money, or repositories for storage.
- Do not conceal coupling by copying state or business rules into another app/component.
- Do not weaken schemas or assertions merely to make a test pass.
- Do not fix unrelated technical debt while delivering a bounded slice.
