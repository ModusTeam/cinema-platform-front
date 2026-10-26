# vespre.

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Primary: moviegoers who want to find a movie, choose a session, select seats,
  and purchase tickets quickly.
- Secondary: cinema administrators managing movies, halls, sessions, pricing,
  and customers.
- Public discovery and informational content are accessible without signing in.
  The current booking page requires authentication. Administration requires an
  authenticated user with the admin role.

## Product Purpose

Cinema Platform combines cinema discovery, ticket booking, account services,
and cinema administration. The core customer journey is:

**Movie → Session → Seats → Checkout → Ticket**

Success means helping a customer choose a suitable screening, understand seat
availability and the payable amount, complete the purchase, and retrieve the
correct admission ticket. Administrators need to maintain the operational data
that makes this journey possible. Quantitative success targets are undecided.

## Operating Context

- Public experiences must support mobile, tablet, and desktop.
- Administration targets viewport widths of 768px and above; smartphone-specific
  admin UI is not required. This is a product requirement, not a verified claim
  about every existing admin screen.
- Current interface copy is Ukrainian, the document language is `uk`, and date
  displays use Ukrainian locale formatting. Checkout uses the backend currency;
  the current display fallback is `₴`. Market and future localization scope
  remain undecided.
- This is an existing React 19 and TypeScript Vite SPA, styled with Tailwind
  CSS v4 and organized using pragmatic Feature-Sliced Design. Bun is required.
  React Router owns navigation, TanStack Query owns server state, Axios handles
  REST requests, and SignalR carries booking notifications.

## Current Journeys and Surfaces

| Journey | Current implementation |
| --- | --- |
| Discover | `/` presents current movies and technology filters. `/sessions` provides the movie schedule browsing surface. `/movies/:id` presents movie details and a booking entry point. |
| Book | `/booking/:id` takes a **movie ID**, then handles session selection, seats, checkout, and success as internal steps. Checkout and success are not separate routes. |
| Retrieve tickets | Booking success links to `/profile`. Profile includes orders, ticket access, account settings, and achievements. Eligible paid orders expose valid ticket IDs, local QR codes, and ID copying. |
| Account and loyalty | `/auth/login`, `/auth/register`, `/profile`, `/account/loyalty`, `/account/loyalty/history`, and `/profile/achievements`. |
| Learn about the cinema | `/about`, `/faq`, `/offers`, `/bar`, `/careers`, `/technologies`, `/halls`, `/rules`, `/privacy`, `/offer`, and `/age-limits`. |
| Administer | Protected `/admin` dashboard and child routes for halls, sessions, users, movies, technologies, pricings, genres, loyalty, achievements, and user activity. |

Admin interactions include movie editing/import, hall geometry and seat types,
session scheduling, pricing rules, customer roles, loyalty adjustments, and
achievement management. Existing route coverage does not establish production
readiness or prove every operation works end to end.

## Capabilities and Constraints

### Booking integrity

- Booking combines REST seat lock/unlock calls with SignalR notifications and
  backend Redis locking. The browser does not manage Redis directly.
- `GET /sessions/{id}/seats` is authoritative for session occupancy and
  user-specific lock ownership. Notifications trigger reconciliation; an unlock
  event alone does not establish that a seat is available.
- Selection and checkout periodically reconcile availability while the page is
  active and online. Unverified availability or ownership blocks checkout.
  Preserve reconnect, conflict, pending, and failure handling.
- Seat types and labels come from backend data. The current renderer recognizes
  standard, VIP/luxury, and love/sofa naming patterns, but these are not a fixed
  inventory promise. Preserve sparse hall coordinates, gaps, maintenance states,
  sold seats, and locks owned by other customers.
- Explicit deselection and session/back navigation have defined lock-release
  behavior. Generic unmount may rely on backend expiry because another tab can
  share user-scoped ownership. Do not replace this with blanket unlocking.

### Checkout and ticket truth

- `POST /orders/checkout-preview` owns totals, discounts, loyalty eligibility,
  GOLD upgrade eligibility, and final payable amounts. The frontend must not
  independently calculate authoritative prices or invent benefit rules.
- Current submission uses legacy `POST /orders` with a mock payment token.
  This is not evidence of a completed production payment-provider integration.
  Adopting reservation, checkout, and status endpoints is separate work.
- Orders and tickets have different lifecycle states. Paid, processing, unknown
  payment outcome, failed, cancelled, and expired orders must remain distinct;
  reserved, valid, used, refunded, and released tickets must also remain distinct.
- Admission uses actual ticket identifiers, not order identifiers. Current QR
  generation happens locally in `TicketCard`; preserve admission-data privacy.
- Loyalty profile and transaction reads are integrated; the benefits adapter and
  older loyalty checkout preview adapter are placeholders. Booking uses the real
  order checkout preview instead.

### Integration boundaries

Preserve functional workflows, accessibility requirements, authentication and
authorization, backend contracts, server-owned business rules, and the existing
Feature-Sliced dependency boundaries. Configuration uses `VITE_API_URL` and an
optional `VITE_TICKET_HUB_URL`; never embed secrets or deployment-specific URLs
as product facts. A visual exploration does not authorize changing payment or
seat-lock semantics.

## Brand Commitments and Exploration Boundaries

The customer-facing brand is **vespre.**, always lowercase with the period.
Technical identifiers, repositories, APIs, and domains retain their names.
The user approved **Festival Signal / Midnight Signal** on 2026-10-26:
near-black `#14181F`, chalk `#F5F4EF`, blue `#3260F5`, yellow `#E9DC70`.
Customer-facing presentation names are **Classic / New**. Classic is initially
the default; explicit selection persists locally. Rollout is incremental,
beginning with New Home. Shared unfinished pages retain Classic presentation;
booking and administration behavior remain unchanged.

The user requires a distinctive,
thoughtful cinema experience and rejects generic AI-generated website styling:
default SaaS patterns, repetitive cards, excessive gradients, decorative icon
tiles, and copied templates.

Cinema-related imagery, meaningful typography, editorial composition, clear
showtimes, and intentional animation matter to future exploration. These are
criteria for implementing the approved direction. Detailed composition and
typography are recorded in `docs/design/festival-signal/visual-direction.md`.

Existing layouts and UI patterns may be replaced when a better experience is
justified. Their present appearance is evidence of the implementation, not a
binding design direction. Functional and contractual requirements remain binding.

## Product Principles

1. Keep movie discovery and the path to a usable ticket clear and efficient.
2. Show trustworthy availability, pricing, and transaction states; expose
   uncertainty rather than implying success.
3. Let cinema content and relevant screening information guide decisions.
4. Respect each audience's operating context: responsive public access and
   administration from 768px upward.
5. Explore boldly while preserving accessibility and backend-owned behavior.

## Accessibility & Inclusion

Preserve keyboard access, visible focus, meaningful control names, form labels
and errors, modal focus behavior, readable contrast, and reduced-motion support.
Seat controls must communicate seat identity, type, availability, selection,
and pending state without relying only on color. Empty results and failed
requests must remain distinguishable, with recovery actions where available.

The repository includes shared input/modal accessibility behavior, focus styles,
seat ARIA states, contrast checks, and optional browser accessibility checks.
These are implementation evidence, not certification. A formal accessibility
standard and conformance target remain undecided.

## Evidence on Hand

- `AGENTS.md`: architecture, workflow rules, accessibility and backend constraints.
- `package.json`, `index.html`, and `src/app/router.tsx`: stack, language, and
  route inventory.
- `src/pages/public/HomePage.tsx`, `src/widgets/movies-grid`, and
  `src/widgets/movie-details`: discovery and booking entry behavior.
- `src/pages/booking/BookingPage.tsx` and `src/features/booking`: booking steps,
  authoritative preview, seat ownership, and real-time reconciliation.
- `src/features/profile/ui/TicketCard.tsx`, `src/entities/order`, and
  `src/pages/account`: ticket retrieval, order states, and account surfaces.
- `src/pages/admin` and `src/features/admin`: implemented operational surfaces.
- `public/cinema.svg`: existing identity asset. Movie imagery is referenced by
  content data; its presence does not establish licensing or future availability.
- `tests/`: focused booking, hall, interaction, contrast, and accessibility checks;
  existing checks were inspected, not executed during this initialization.
- Backend `Cinema.Booking.Infrastructure/Services/RedisSeatLockingService.cs`
  confirms server-side Redis locking.
- `README.md` and `docs/backend-compatibility-review.md` supply historical
  context, but some statements are stale. Current code takes precedence:
  SignalR events now trigger occupancy reads, local ticket QR codes exist, and
  Bun tests are configured.

No user research, measured conversion baseline, or independently verified
commercial differentiator was established in this discovery pass. Do not invent
testimonials, customer counts, operating locations, or performance claims from
promotional copy or sample content.

## Open Decisions and Known Gaps

- Formal accessibility target, measured booking-success targets, and market /
  localization scope: explicitly left undecided by the user.
- Production payment integration and ambiguous-payment recovery: separate future
  scope; the mock-token legacy flow remains the current implementation.
- Authentication continuity: movie details passes a booking destination to
  login, but login currently navigates to `/profile`. Returning customers to
  their interrupted booking is a future journey question, not an init change.
- Responsive and accessibility conformance across the whole product has not been
  verified in a browser during initialization.
- New Home is the initial implementation boundary. Other public surfaces and
  session handoff through authentication remain future work.
