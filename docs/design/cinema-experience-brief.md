# Cinema experience: The Film Programme

Status: Approved 2026-10-26: vespre., Festival Signal identity, Midnight Signal
palette, and incremental Classic / New rollout, initially defaulting to Classic.
Initial implementation covers New Home only. PRODUCT.md is
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
  payment boundaries, and admin workflows. Only the presentation foundation and
  New Home are authorized for this iteration.

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

Complete schedule retrieval and formal
accessibility target remain open. Festival Signal is the selected identity;
the approved Midnight Signal palette and composition specification are recorded
in `festival-signal/visual-direction.md`. Display timezone ambiguity is
resolved for New Home by displaying screening dates and times in Europe/Kyiv.

## Confirmed future experience boundary

Preserve the existing customer-facing interface as Classic. Festival Signal will
be a separate, selectable frontend experience. The initial default remains
Classic; an explicit user choice persists across visits. Both experiences share
business logic, APIs, authentication, seat booking, and payment behavior. A
visual switch must not create parallel domain logic or reset an active booking.
Admin workflows remain unchanged. The implementation uses a presentation context
above the router and a guarded localStorage preference. Only Home branches its
presentation. Shared routes keep their component identity, auth and query providers.

## Direction contract

THESIS: Let visitors discover films and compare real dated screenings in an
editorial programme rather than a repeated poster-card grid. Surface mode: Operate.

OWN-WORLD: Midnight masthead and screening bands, chalk film spreads, condensed
Cyrillic titles, blue rules, square actions, yellow selected dates.

STORY: Read the film, choose an available date, compare times and halls, then
enter the existing movie-based booking route. Session selection happens again there.

FIRST VIEWPORT: A visible vespre. masthead, film/schedule/ticket navigation,
one prominent title beside cinematic artwork, date controls and nearby screenings.
Mobile stacks full titles, imagery and actions; subsequent films are compact.

FORM: User-selected Festival Signal composition, palette C. No new concept seed:
the supplied approved composition supersedes concept selection. Original desktop
and mobile boards define composition only and retain their historical palette.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Exploration artifacts

See `explorations/film-programme/README.md`. Generated images use an explicitly
illustrative programme because the live catalogue could not be retrieved and no
local film artwork was available. They do not establish actual screenings or
licensed film artwork.
