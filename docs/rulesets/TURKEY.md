# Versioned Türkiye scenario rules

This file defines how Türkiye-specific scenario knowledge should be represented. It is not a legal-facts reference and intentionally invents no eligibility, amount, date, rate, score, or formula.

## Evidence labels

Every rule or concept added to a versioned ruleset must use exactly one status:

- **VERIFIED REAL-WORLD CONCEPT:** the named institution/process is supported by dated, authoritative evidence. Record source, access date, jurisdiction/scope, effective period, and what was verified. This label does not make a gameplay value official.
- **SIMULATED GAME VALUE:** an authored number, probability, threshold, timeline, or simplification chosen for balance. Label it visibly in data/docs and never present it as current advice or entitlement.
- **UNVERIFIED/FUTURE RULE:** a placeholder research question or planned domain. It must not drive released gameplay or be described as fact.

Do not blend these labels. A verified concept may still use explicitly simulated values. When evidence changes, create a new ruleset version and migration/compatibility plan rather than silently changing existing lives.

## Candidate categories

Future rulesets may contain:

- YKS concepts and education transitions;
- university programs, calendars, and progression;
- student support, dormitory, scholarship, and credit concepts;
- employment relationships and payroll concepts;
- social insurance concepts;
- retirement concepts;
- BES/private pension concepts;
- housing, leases, rent, utilities, and ownership concepts;
- banking, consumer finance, debt, investment, and affordability concepts.

These categories are a research framework, not evidence that rules are implemented or verified.

## Packaging and runtime

Rules used by gameplay must ship as reviewed, versioned local data with stable identifiers and deterministic interpretation. Runtime gameplay must not require web access, scrape a website, call an external service, or silently update rules. Online research may inform a future authored release, but sources and verification dates belong in reviewable metadata.

Rules should separate stable concept identity from tunable game values and presentation copy. Tests must cover version selection, deterministic outcomes, boundary/eligibility cases, unavailable or malformed rule data, and save compatibility. Player-facing text must clearly distinguish fiction/simulation from official information and should direct users to authoritative services for real decisions.
