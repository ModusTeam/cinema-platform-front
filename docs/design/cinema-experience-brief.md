# Cinema experience: The Film Programme

Status: Film Programme UX structure and Festival Signal identity selected by the
user on 2026-10-26 for further refinement. Refined palette, final mockups, and
implementation remain unapproved. PRODUCT.md is
the authoritative product context. This brief preserves the prior Shape work;
details below remain proposed unless explicitly identified as confirmed.

## Confirmed direction

- Prioritize discovering a film, with suitable showtimes close to the moment of
  interest. Core journey: Movie -> Session -> Seats -> Checkout -> Ticket.
- Use a film-first editorial programme. Existing hero slider, card grid,
  navigation, layouts, dark theme, red accents, and Montserrat may be replaced.
- Explore home, film discovery/schedule, movie details, session selection, and
  entry into existing seat booking. Public pages support mobile, tablet, desktop.
- Include a future frontend proposal to carry the chosen session through
  authentication into the existing seat-selection path.
- Preserve accessibility, backend contracts, seat locking and reconciliation,
  payment boundaries, and admin workflows. No implementation is authorized.

## Proposed experience

| Surface | Hierarchy and behavior |
| --- | --- |
| Home | Visible wayfinding, prominent film with real dated showtimes, varied film programme, upcoming films, secondary cinema content. Keep the first film and its screening action together. |
| Discovery `/sessions` | Date context, optional filters, film-grouped results and matching times. Explicit access to additional screenings and results; preserve filters and return position. |
| Movie `/movies/:id` | Film identity/imagery, genres/duration and showtimes, synopsis, cast, deliberate trailer playback. Showtimes precede long supporting sections. |
| Session choice | Identify date, start time, hall, and confirmed screening information. Distinguish simultaneous screenings. |
| Booking entry | Retain movie/session through sign-in; validate eligibility before entering existing seat-selection behavior. Explain invalid selections and offer current alternatives. |

Changing the date updates screening choices without resetting browsing context.
Layout and motion support comprehension; information stays stable while reading.
Mobile navigation exposes films, schedule, and ticket access. No mandatory
carousel, hover-only action, autoplay trailer, or full-screen promotional block
that hides screening actions. Reduced motion preserves all state feedback.

## Truth and recovery

- Use authoritative session eligibility; do not imply availability from a time
  alone. Discovery acquires no locks.
- Show prices only when supported and qualified; checkout preview remains the
  authority. Do not reuse placeholder prices as commercial claims.
- Hall capabilities do not prove screening-specific formats. No invented seat
  counts, urgency, release dates, age ratings, or personalized recommendations.
- Distinguish loading, empty filters, request failures, and partial data failures.
- Plan for missing artwork/trailers, long Ukrainian titles, text enlargement,
  sparse and dense catalogues, keyboard access, and image cropping on mobile.
- Current list adapters have retrieval caps. Complete programme coverage needs
  verification before an implementation can claim completeness.

## Review criteria and open decisions

Validate discovery of an unfamiliar film, comparison of its sessions, distinction
between same-time screenings, and recovery of the selected session after login.
Check mobile, keyboard, reduced-motion, empty, and failure paths. These are
proposed evaluation tasks, not results or numerical success commitments.

Lead-film selection, display timezone, complete schedule retrieval, and formal
accessibility target remain open. Festival Signal is the selected identity;
its refined palette, typography, motion, and composition specification remain
proposed in `festival-signal/visual-direction.md` until reviewed.

## Confirmed future experience boundary

Preserve the existing customer-facing interface as Classic. Festival Signal will
be a separate, selectable frontend experience. The initial default remains
Classic; an explicit user choice persists across visits. Both experiences share
business logic, APIs, authentication, seat booking, and payment behavior. A
visual switch must not create parallel domain logic or reset an active booking.
Admin workflows remain unchanged. This records a requirement only; no switch,
storage key, route, source component, or behavior has been implemented.

## Exploration artifacts

See `explorations/film-programme/README.md`. Generated images use an explicitly
illustrative programme because the live catalogue could not be retrieved and no
local film artwork was available. They do not establish actual screenings or
licensed film artwork.
