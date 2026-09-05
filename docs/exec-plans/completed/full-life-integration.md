# Full life integration

Authorized by the full-game completion request on `gpt6/full-game-one-shot`.

Scope: preserve the current apps and their cross-app links while implementing a calendar-driven life from school to natural closure, explicit choices, routine/action execution, education alternatives, recurring personal economy and NPC changes. All quantities and dates are bundled fictional scenario values. No backend or production deployment.

Milestones:
1. Regress payroll/scheduler failures; introduce version 5 state, strict migration, shared clock/ledger primitives and decision/action contracts.
2. Implement and test school/YKS, university/vocational paths, adulthood/work/housing, NPC changes and later-life closure through the same scheduler.
3. Wire native apps and accessible decision/routine controls; verify actual phone and desktop journeys.
4. Run mandatory checks, inspect the release, configure and deploy only `memleket-os-astra-preview` when authenticated.

Acceptance: deterministic long-life replay and save/reload; blocked time cannot pass unresolved decisions; money reconciles; invalid/corrupt actions and imports preserve state; observable consequences in apps; all mandatory checks green, responsive screenshots outside git. See existing product, design, persistence and simulation documents for stable contracts.

Baseline: npm ci completed (0 vulnerabilities); typecheck, 51 tests and release build passed. Running home inspected at 390×844. Browser and Linux prerequisites installed in the Codespace. Existing UI is app-specific; lifecycle progression and recurring world events are missing.

Completed 2026-09-05. Version 5 now carries the deterministic lifecycle, decisions, routines, education alternatives, career/payroll, housing, recurring economy, evolving NPCs, retirement, bounded histories, and natural closure. Strict migrations, ledger reconciliation, transactional action failure, and ordered autosave are covered by behavior tests. The responsive browser suite passed at 320×568 through 1440×900, including large text and reduced motion. The final static bundle was deployed as Cloudflare preview `memleket-os-astra-preview`, version `88f61a57-80c4-4468-8e6c-1dd5e9cf3651`, at https://memleket-os-astra-preview.stonepact-ecb.workers.dev and returned HTTP 200.
