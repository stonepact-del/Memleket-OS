# MemleketOS vertical-slice roadmap

This is an ordered planning guide, not a delivery claim. Each phase should be scoped into one or more independently reviewable vertical slices; never assign the whole roadmap as one implementation task. Before starting a phase, verify current code and write a bounded plan in `active/`.

## 1. Decision/action engine
- **Objective:** establish one explainable path for player actions, duration, blockers, costs, and consequences.
- **Domain work:** typed action definitions/results, prerequisites, central clock/scheduler execution, explicit decision resolution, deterministic consequence payloads.
- **UI work:** reusable action confirmation/result/blocker states without flattening app identity.
- **Cross-app effects:** calendar, notifications, mail, ledger, archive, and relevant domain projections receive the same event outcome.
- **Required tests:** deterministic replay; partial/interrupted duration; exactly-once effects; invalid prerequisites; insufficient funds/energy; blocker resolution after reload.
- **Definition of done:** at least one existing study flow and one travel or career flow use the engine end-to-end with preserved behaviour; no alternate duration or money path is introduced.

## 2. Procedural visual identity + app architecture
- **Objective:** make the fictional OS and each major app visually distinctive while preserving one shared system.
- **Domain work:** stable view models/selectors and procedural visual tokens derived without simulation randomness.
- **UI work:** OS primitives plus app-native layouts specified in the design system; responsive phone page and desktop workspace.
- **Cross-app effects:** shared badges, deep links, notifications, entities, and error states remain consistent.
- **Required tests:** interaction journeys for navigation/deep links; selector tests; narrow/desktop layout and accessibility checks; deterministic identity snapshots only where behaviourally useful.
- **Definition of done:** selected representative apps are recognizably native to their task, every shown control works, and no gameplay/domain rule moved into React.

## 3. High-school depth
- **Objective:** create a meaningful repeatable school-life loop before exam specialization.
- **Domain work:** subjects, attendance, energy/stress, study choices, assessments, school schedule, relationships and bounded history.
- **UI work:** notebook-style Okulum views for today, subjects, assessments, and actionable study planning.
- **Cross-app effects:** Takvim obligations, Posta results, Sohbet context, archive milestones, and household/time tradeoffs.
- **Required tests:** schedule conflicts, partial study, assessment calculation, missed obligations, bounds, deterministic outcomes and failure paths.
- **Definition of done:** multiple school weeks can be played with distinct choices and consequences that persist and surface across apps.

## 4. YKS vertical slice
- **Objective:** support preparation through a consequential fictionalized exam outcome and next-step choices.
- **Domain work:** versioned scenario concepts, preparation, exam scheduling, deterministic scoring/ranking abstraction, alternatives after weak outcomes.
- **UI work:** clear preparation/readiness and result/choice screens with simulated-value labeling.
- **Cross-app effects:** school, calendar, mail, news/context, household, relationships, and archive reflect the exam journey.
- **Required tests:** score determinism and boundaries, missed/interrupted exam, ruleset version, save migration, weak/strong outcome branches.
- **Definition of done:** a player can prepare, take or miss the exam, receive an explainable result, and choose among viable next paths without game-over.

## 5. University
- **Objective:** deliver admission choice and a playable academic-term loop.
- **Domain work:** fictional programs, admission options, enrollment, courses/credits, term progression, performance and departure/transfer alternatives.
- **UI work:** program comparison, enrollment decision, term notebook and progress views.
- **Cross-app effects:** housing, finance, calendar, mail, social graph, career eligibility and archive share university state.
- **Required tests:** admission constraints, enrollment conflicts, credit progression, failure/withdrawal paths, deterministic term outcomes and migrations.
- **Definition of done:** one complete term is playable and every completion/failure path leaves a coherent persisted next state.

## 6. Student support / dorm / credit
- **Objective:** make education affordability and living arrangements meaningful without asserting unverified policy.
- **Domain work:** versioned concepts, simulated applications/eligibility, dorm allocation, support/credit ledger schedules and repayment obligations.
- **UI work:** Memleket Kapısı-style application status plus housing/bank explanations clearly labeled as simulated.
- **Cross-app effects:** university, Evim, CepBanka, Posta, Takvim, household and relationships reflect decisions.
- **Required tests:** eligibility boundaries, rejection/waiting paths, exactly-once payments, debt creation, malformed rules and ruleset versions.
- **Definition of done:** application through outcome and first financial/housing consequence works offline with provenance labels and alternatives after rejection.

## 7. Housing / lease / rent / utilities
- **Objective:** support choosing and sustaining a home over time.
- **Domain work:** listings versus owned/leased residence, household membership, lease terms, deposits, recurring rent/utilities, maintenance and moves.
- **UI work:** distinct SarıPazar discovery and Evim management/obligation views.
- **Cross-app effects:** ledger, calendar, map/commute, career/school, household, mail and archive use the authoritative residence.
- **Required tests:** affordability, recurring exactly-once charges, failed payment, lease boundaries, move conflicts, save migration and history bounds.
- **Definition of done:** a player can compare, lease, occupy, pay for, and leave a residence with all dependent apps consistent.

## 8. Banking / debt
- **Objective:** deepen personal cash-flow and responsible debt simulation.
- **Domain work:** accounts/statements, scheduled transfers, debt principal/repayment, deterministic interest as explicitly simulated values, delinquency alternatives.
- **UI work:** financial-product layouts with exact transaction explanations, obligations, and confirmations.
- **Cross-app effects:** purchases, housing, education support, payroll, calendar, notifications and archive post through one ledger.
- **Required tests:** integer-kuruş arithmetic, rounding rules, insufficient funds, due processing, duplicate prevention, delinquency and migration.
- **Definition of done:** every supported balance change reconciles to ledger history and one debt can complete its lifecycle without silent value loss.

## 9. Career / payroll
- **Objective:** make finding, starting, performing, leaving, and being paid for work a durable loop.
- **Domain work:** job requirements, application decisions, interviews, schedule, performance, payroll, exit/termination and alternative paths.
- **UI work:** career pipeline and workplace views; mail/calendar decision surfaces; readable payslip/statement projection.
- **Cross-app effects:** school qualifications, companies, schedule, relationships, map, social state, bank and archive share employment identity.
- **Required tests:** application branches, blockers, shift conflicts, exactly-once payroll, job exit, deterministic decisions and reload.
- **Definition of done:** one job lifecycle from discovery through at least one pay period and exit works with coherent cross-app consequences.

## 10. Social insurance / BES
- **Objective:** introduce understandable long-term protection/saving concepts without legal claims.
- **Domain work:** versioned verified concepts versus simulated contribution/benefit values, enrollment, contribution history and long-horizon projections.
- **UI work:** Güvence overview with provenance, assumptions, scenarios, and non-advisory language.
- **Cross-app effects:** employment/payroll, bank, calendar, retirement planning, mail and archive reference shared records.
- **Required tests:** version selection, integer contributions, enrollment boundaries, exactly-once payroll effects, projection determinism and migrations.
- **Definition of done:** enrollment through multiple contributions is playable offline, auditable in the ledger, and clearly separated from real advice.

## 11. Vehicle lifecycle
- **Objective:** extend purchase into ownership, use, upkeep, sale, and loss of utility.
- **Domain work:** authoritative vehicle identity, condition, maintenance, recurring costs, travel capability, depreciation and disposal.
- **UI work:** Garajım ownership/condition history; distinct marketplace sale/purchase and map travel controls.
- **Cross-app effects:** bank, calendar, map, marketplace, housing/parking, mail and archive share the vehicle.
- **Required tests:** purchase transfer, unavailable/broken travel, costs exactly once, condition bounds, sale, insufficient funds and migration.
- **Definition of done:** one vehicle completes purchase-use-maintain-sell lifecycle with no duplicate ownership or bypassed ledger entry.

## 12. NPC Life Engine V2
- **Objective:** let important people change over time at an appropriate level of detail.
- **Domain work:** close/relevant/distant model, deterministic promotion, goals, commitments, life events, relationship effects and bounded memories.
- **UI work:** richer context in chat/feed/archive without exposing raw simulation metrics as a dashboard.
- **Cross-app effects:** school, work, housing, calendar, messages, feed and personal events reference the same NPC state.
- **Required tests:** deterministic evolution, level promotion continuity, relationship/failure paths, event deduplication, bounds and performance.
- **Definition of done:** close and relevant NPCs show persistent multi-domain change while distant populations remain aggregate/on-demand.

## 13. Economy/province depth
- **Objective:** make local opportunities and costs vary coherently without creating a country-control game.
- **Domain work:** meso/macro cadence, province scenario profiles, fictional company/labor/housing signals, bounded aggregates and causal inputs.
- **UI work:** editorial Gündem, abstract Harita, Piyasa and contextual app explanations from the personal perspective.
- **Cross-app effects:** jobs, housing, education, prices, travel, companies and NPC opportunities consume versioned shared signals.
- **Required tests:** deterministic cadence, bounds, ruleset compatibility, province differences, history aggregation and performance budgets.
- **Definition of done:** selected provinces produce explainable, reproducible personal differences without player control over institutions.

## 14. Full integration/refactor
- **Objective:** consolidate domain ownership and remove transitional duplication without losing behaviour.
- **Domain work:** explicit module boundaries, selectors/projections, action/event contracts, invariant checks and migration consolidation.
- **UI work:** replace remaining direct state derivations with domain projections while preserving approved UX.
- **Cross-app effects:** audit every shared entity, deep link, notification, ledger post, schedule item and archive entry for one owner.
- **Required tests:** characterization before refactor, all behavioural/migration suites, representative full-life journeys and save fixtures.
- **Definition of done:** duplicated ownership is removed, existing functioning paths remain, architecture docs match code, and no compatibility issue is silent.

## 15. Visual/gameplay/performance QA
- **Objective:** prove the integrated game is usable, legible, reliable, and performant across supported presentations.
- **Domain work:** profiling-driven bounds and safe optimizations only; deterministic diagnostics and recovery behaviour.
- **UI work:** complete phone/desktop, accessibility, motion, Turkish copy, empty/error states and app-identity review.
- **Cross-app effects:** end-to-end journeys validate consequences and navigation across the full app suite.
- **Required tests:** full verification, targeted E2E journeys, accessibility checks, save corruption/recovery, long-run simulation and measured performance budgets.
- **Definition of done:** release checklist has evidence, no visible dead controls/placeholders remain, required journeys pass, and generated artifacts are not committed.

## Recommended first implementation slice

Begin phase 1 with a narrow **study action through the decision/action engine** slice: define the minimal typed action contract, route the existing study duration through the authoritative scheduler, preserve its current interruption and stat effects, surface the same Okulum feedback, and add behavioural regression coverage. Do not generalize every action in that task; use the result to refine the contract before a second travel/action slice.
