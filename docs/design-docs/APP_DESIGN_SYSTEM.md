# App design system

## Shared foundation

All apps inherit the fictional OS's typography scale, spacing rhythm, accessibility states, system navigation, status treatment, notification semantics, and restrained motion. Apps may introduce domain-specific layouts and components, but must not fork basic OS behaviour. Information shown in multiple apps must come from shared domain state.

**Hard rule:** do not implement every app as the same collection of generic cards with a different title or accent color.

## Major app directions

| App | Native direction | Character to preserve |
| --- | --- | --- |
| **Sohbet** | Messaging-native conversation list and threaded bubbles | Recency, unread state, relationship context, compact composer |
| **Akış** | Social-feed stream with posts, reactions, comments | People-first rhythm and conversational density |
| **CepBanka** | Financial-product overview, account statement, transaction rows | Trust, exact integer-kuruş amounts, clear inflow/outflow hierarchy |
| **SarıPazar** | Visual marketplace with imagery-led listings, filters and negotiation | Browsing, condition/price comparison, seller dialogue and ownership state |
| **Okulum** | Education/notebook workspace with subjects, progress and schedule | Student perspective, upcoming obligations, actionable study context |
| **Kariyer** | Career/work pipeline with roles, applications, interviews and employment | Status progression, employer context, explicit decisions |
| **Posta** | Mail-client inbox and message reader | Sender/subject hierarchy, read state, linked source app |
| **Takvim** | Calendar-native agenda/day/month structures | Simulation time, scheduled events, blockers and consequences |
| **Gündem** | Editorial/news front with lead story and sections | Fictional labeling, chronology, connections to world entities |
| **Piyasa** | Financial-market watchlist, instrument detail and history visualization | Exact orders, holdings, fictional-market disclosure, trend legibility |
| **Harita** | Abstract visual map and destination/transport selection | Place relationships and travel costs/durations, not a generic list |
| **Notlar** | Paper/editor canvas with direct writing emphasis | Calm, low chrome, obvious persistence |
| **Ayarlar** | OS-native grouped settings and data-management controls | Predictable toggles, save import/export safety, accessibility |

Hayat Arşivi should read as a chronological personal record rather than a metrics dashboard. Home should prioritize glanceable widgets, app discovery, badges, and the fixed dock rather than duplicating every app's detail.

## Future app directions

- **Memleket Kapısı:** service portal with eligibility/status journeys; never imply simulated rules are official.
- **Evim:** spatial household/home management with lease, utilities, maintenance, and cohabitation context.
- **Garajım:** owned-vehicle lifecycle, condition, costs, documents, and trips rather than listings.
- **Güvence:** insurance/social-protection overview with clear provenance for verified concepts and simulated values.

These names are design reservations, not claims that the apps or their domains are implemented.
