# MemleketOS product specification

## Stable vision

MemleketOS is a fictional, single-player personal-life simulation set in Türkiye. The player begins at approximately age 14–15, with a generated personal history, household, close relationships, school situation, money, and local context. Play follows that person over years through ordinary choices, constraints, opportunities, setbacks, and changing relationships.

The primary interface is a fictional phone operating system. On desktop, the same life and apps appear as a fictional computer presentation rather than as an administrative dashboard. The product is not a country-management, government, political, geopolitical, military, or grand-strategy game.

## Product promises

- **Personal, not institutional:** the unit of play is one person's life and immediate world.
- **Türkiye setting:** language, places, rhythms, institutions, and scenario data support a recognizably Turkish setting without claiming unverified facts.
- **Long-term progression:** adolescence can lead into exams, education, housing, work, finance, mobility, family and social change, later-life planning, and retirement.
- **Local-first and offline:** gameplay data stays on the device and the complete gameplay loop works without a server or network.
- **Deterministic:** a saved state plus the same ordered actions produces the same outcomes.
- **Player-respecting:** no paywalls, ads, telemetry, external account, or backend requirement.
- **Alternative paths:** an exam result, rejection, debt, or relationship setback changes the available story; it does not collapse into a generic game-over.

## Life domains

The intended life spans education and YKS, university and student support, household and housing, friendships and family, employment and career, banking and debt, purchases and vehicles, health and wellbeing, social insurance and long-term saving, local travel, news, markets, and regional economic context. Depth should arrive as bounded vertical slices rather than as shallow coverage of everything.

## Cross-app simulation philosophy

Apps are views and controls over one shared life, not separate minigames with copied state. Studying in Okulum can affect scheduled exams and later education choices. A Kariyer outcome can create Takvim events, Posta messages, CepBanka ledger entries, and social consequences. A SarıPazar purchase can affect funds, ownership, travel, and the life archive. Every effect has one authoritative domain owner and other apps project that state.

The phone metaphor should make systemic consequences legible: notifications, mail, calendar entries, statements, conversations, and news reveal the same underlying event from appropriate perspectives. Apps retain distinct identities while remaining consistent parts of one OS.

## Product boundaries

All gameplay content is fictional unless a versioned ruleset identifies a verified real-world concept. The product must never imply that simulated amounts or eligibility rules are current legal or financial advice. Runtime gameplay must not fetch rules from the web. Implementation architecture, schema versions, and module ownership belong in the architecture documents, not in this product specification.
