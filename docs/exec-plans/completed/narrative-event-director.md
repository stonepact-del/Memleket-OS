# Narrative event director

## Scope

Add a bounded, deterministic authored-event layer to the existing v5 life
simulation. It uses the current scheduler, decision engine, ledger and save
boundary; it does not replace them.

## Delivery slices

1. Persist bounded narrative history and chain context compatibly with v5 saves.
2. Add an authored registry and deterministic director, with NPC selection,
   eligibility, cooldown and pacing.
3. Project outcomes into the existing app state and semantic NPC memories.
4. Make all blocking decisions, including interviews/offers, globally persistent
   and conceal delayed outcomes in the choice surface.
5. Cover replay, blockers, reload, chains, cooldowns, semantic memories and
   cross-app artifacts with behavioural tests; run the release checks.

## Risks

Long skips must remain calm enough to be playable while stopping exactly once at
important choices. New persisted fields default for existing v5 saves so no
existing save is discarded or silently altered.
