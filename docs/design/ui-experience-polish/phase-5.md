# Phase 5: editorial Movie Details

Ready for review, 28 October 2026 (Europe/Kyiv). Branch:
`feat/ui-experience-polish`. This is the Movie Details / Discover More checkpoint
for the existing PR #53 targeting `develop`. No commit, push, new PR or merge.

## Result and boundaries

Movie Details now connects a cinematic introduction, warm paper film information,
screenings / trailer, and dark catalogue discovery. The approved Header, Ticket
Menu and TicketAction are reused without changes. Home, Sessions, Profile,
Footer, Booking, Admin, authentication and router configuration are unchanged.
The temporary Design Lab is retained; final cleanup has not started.

The main booking action preserves the original contract: guests go to login
with `state.from = /booking/{movieId}`; signed-in visitors go to that movie's
booking page. There is no session preselection or new payment behavior.
The hero action remains available even when no upcoming screening is found,
as in the original flow; the screening section states availability accurately.
The second booking action appears only with actual upcoming screenings.
No sticky action bar: it would compete with the approved fixed Header and the
two naturally separated booking positions.

## Reference and design decisions

Primary source: [A24 — The Drama](https://a24films.com/films/the-drama), inspected
in the live browser at desktop and mobile sizes. The source study recorded
Neue Montreal body text at 27px / 29.7px in the details paragraph, a 648px text
measure, and a 443 × 665px poster at 1440px. Labels, rules, asymmetrical text /
poster balance and the open dark discovery composition inform this page.
Source screenshots are in [the evidence index](screenshots/phase-5/README.md).

The project keeps Golos Text and Roboto Condensed from Phase 2 and its existing
wordmark. The cinematic title caps at 96px; titles longer than 60 characters use
a wider measure and a 72px desktop cap. This prevents the stress-test title from
dominating seven desktop lines. Hero height grows with content, rather than
clipping text or actions. An absent backdrop uses a shorter dark opening.

Paper roles are scoped to `.movie-details`: paper `#f5f1e8`, ink `#201f1d`,
muted ink `#686259`, rule `#c4bdb2`. The first three match the approved ticket
paper language. No body color or global theme change. The existing Header
already uses its solid dark surface on this route and remains readable over
paper, so no shared Header adjustment was needed.

Craftwork resource decisions: its local skill was applied, but Craftwork MCP
tools are absent. The public catalogue linkset could not be read by the web
tool. The supplied A24 reference therefore leads; existing Siena study informs
restrained physical ticket / image interactions. No template, paid download,
new font, icon pack, shader, mockup or 3D object was needed. Actual API artwork
is the production visual material.

An Image Gen overview explored these same four sections
([`concept.png`](screenshots/phase-5/concept.png)); it is a design study, not an
application image or invented production content. The built-in tool was used.
Its brief specified A24 proportions, dark / ticket-paper surfaces, existing
fonts and ticket action, Ukrainian film text, large poster, metadata / cast
rows, real screening states, click-loaded trailer and open dark discovery.
The implementation preserves the existing wordmark and uses available API
artwork rather than the study's imagined artwork, player duration or claims.

## Architecture

`MoviePage` and its loading, error and 404 behavior are unchanged.
`MovieDetails` now composes:

| Component | Responsibility |
| --- | --- |
| `MovieHero` | Backdrop, responsive title, supported metadata, existing booking action, trailer anchor |
| `MovieEditorial` | Description, optional metadata and all named cast members / roles, large poster |
| `MovieScreenings` | Independent session query, future scheduled screenings, loading / failure / empty states |
| `MovieTrailer` | Click-to-load player, focus transfer, reserved video geometry, YouTube fallback link |
| `DiscoverMovies` | Public catalogue query, filtered deterministic links, loading / failure / empty states |
| `MovieImage` | Local image rendering / failure handling; eager hero and lazy downstream media |

Recurring copy is in the widget's `config/movieDetails.copy.ts`.
Domain selection helpers live in `entities/movie/lib` and `entities/session/lib`.
No dependency, provider or architectural layer was added.

Metadata omits absent / zero year, duration and rating. Genres and cast rows
appear only with supported data, and long names / roles wrap. All supplied cast
members are shown, rather than truncating to four. Absent posters remove the
poster column; image request failures remove the broken image. The legacy
external placeholder URL from the existing adapter is suppressed locally.
Discovery can use an available poster when the adapter supplies a missing
backdrop placeholder.

## API contracts and limits

The existing `GET /movies/recommendations` is **not** used. Its controller has
`[Authorize]`; its handler requires a current user and constructs a preference
vector from paid ticket history. Without that history it returns an empty list.
It is a personalized feed, not a current-film similarity endpoint. Its compact
response also lacks year / status information needed here.

Discovery uses the existing public `moviesService.getAll()` and
`['movies']` query. It excludes the current ID case-insensitively, archived /
deleted entries, and duplicate IDs. Active and coming-soon films sort by year
descending, then Ukrainian title and ID. Up to four are shown; there are no
similarity claims. Zero, current-only, one-other and multiple-film catalogues
are covered.

The existing catalogue adapter requests the first 100 films. The backend orders
by release year and title and excludes soft-deleted records. Discovery filters
this returned window; it does not search all pages to fill four positions.
With many archived films in that window it can show fewer entries. This avoids
inventing another API contract or fetching an unbounded catalogue for this page.

Screenings use the existing `getByMovieId` adapter, which fetches the first 1000
sessions and filters by movie ID. The new domain helper includes only
`Scheduled` entries with a valid future start time and sorts chronologically.
The first three are displayed with real hall names and local Ukrainian date /
time formatting. Query key: `['sessions', 'movie', movieId, 'upcoming']`.
A 30-second foreground refetch re-evaluates time as well as server data.
The existing API window is a limit: this is a preview of returned sessions,
not a guarantee of an exhaustive schedule. No prices, seats, screening status
promises or session selection are fabricated.

YouTube watch, short-link, embed and legacy video URL forms remain supported;
the URL parser validates the host and video ID. Invalid or missing URLs omit
both the trailer section and its hero link. No iframe / YouTube request exists
before activation. Activation preserves the existing embed URL behavior without
adding autoplay, focuses the iframe, and exposes a separate YouTube link.
Player state resets on film changes. The external player can still be blocked
by browser policy or the video owner; the fallback remains accessible.

## Browser verification

Playwright MCP was used because the Browser plugin / skill is unavailable.
The production entry was exercised through disposable browser contexts with
isolated GET fixtures. The manually accessible local app has no fixture
interception. Fixture media lives under `docs`, outside production assets.

Browser: Chromium 156.0.4314.50; locale `uk-UA`; zone `Europe/Kyiv`.
Fixture clock: 28 October 2026, 09:00 UTC. No real API mutation was performed.

| Check | Result |
| --- | --- |
| 1440, 768, 390, 320px × normal / long / sparse × normal / reduced motion | 24 cases pass |
| Page identity, meaningful content, no Vite overlay, no horizontal overflow | Pass in every case |
| Correct fonts; dark fixed Header; scoped paper treatment; no Lenis | Pass |
| Long Ukrainian title, five-paragraph description, long cast names / roles | Pass |
| Missing poster, cast, backdrop, rating, genres and trailer | Natural omission; no broken image request |
| Future / past / cancelled / unrelated session fixtures | Only the correct future scheduled screening appears |
| No upcoming screenings; empty / current-only / one-other / multi-film discovery | Pass |
| Independent loading and 503 states; both retry actions | Pass; failures do not appear as empty data |
| Ticket keyboard focus; guest login return path; signed-in booking route | Pass |
| Trailer anchor, Enter activation, deferred iframe, focus, film-change reset | Pass |
| Discover link navigation and Phase 4 menu / Escape / scroll restoration | Pass |
| Dynamic reduced motion | Image hover returns from scale 1.025 to no transform |
| 200% text at all four widths | Movie Details remains within its own column |
| Normal / long / sparse console health | No runtime or console errors |

Error-state fixtures deliberately produce 503 resource errors and existing API
service console logging. Those expected diagnostics are retained in the raw
results; they are not reported as a clean-console run.

Known existing accessibility limitation: at 200% root text size and 320px, the
shared Header navigation / menu and Footer store buttons overflow. The movie
article itself does not. These existing shared surfaces were preserved under
the explicit Phase 4 / Footer scope constraints.

Measured contrast: paper body **14.61:1**, muted paper text **5.35:1**, white
primary-action text **5.47:1**. Backdrop text uses a neutral protective gradient.
Focus styles are inherited from Phase 2, with dark focus ink on paper.
Native links / buttons, semantic headings, definition lists and time elements
are retained. Motion uses existing Motion for a small, already-visible section
reveal and CSS for image hover. Reduced motion removes movement. No snapping,
pinning, scroll interception or layout-shifting reveal was added.

The before captures render the original `HEAD` MovieDetails composition with
the same normal fixture and cached media as the after captures. A bounded visual
review compared those, the A24 details / discovery captures and the concept:
poster on the right, plain ruled metadata, readable paper copy, dark large-image
discovery. The one refinement widened / reduced long titles and shortened the
missing-backdrop hero. Full-page captures and legible section captures are
indexed [here](screenshots/phase-5/README.md).

Reproduction: pass the function from [phase-5.browser.mjs](phase-5.browser.mjs)
to Playwright's code tool and invoke with `scenario` normal / long / sparse,
`reducedMotion` reduce / no-preference and the local `baseUrl`.
`interactions: true` adds booking, trailer, discovery and menu checks.
[phase-5-edge.browser.mjs](phase-5-edge.browser.mjs) covers loading, error /
retry, catalogue counts, text enlargement, contrast and motion.
Raw evidence: [phase-5-browser-results.json](phase-5-browser-results.json).

## Verification and bundle impact

| Command | Actual result |
| --- | --- |
| `bun run build` | Pass: TypeScript and Vite production build |
| `bun run test` | 93 pass, 0 fail across 10 files, including seven new domain regression tests |
| Focused `bunx biome check` on changed source / tests | Pass, 13 files |
| `bun run lint` | Same baseline: 17 errors, 29 warnings, 1 info |
| `git diff --check` | Pass |

The baseline and final lint diagnostics have the same identities, not just
counts; no unrelated lint cleanup was done. Initial sandbox attempts could not
read some dependencies / write the TypeScript cache. The recorded passing
build and test commands were rerun successfully with normal filesystem access.
Bun also prints a directory-mismatch internal diagnostic; tests still
finish successfully.

Same-environment production build comparison:

| Asset | Before | After |
| --- | --- | --- |
| Lazy MoviePage JS | 8.05 kB / 2.51 kB gzip | 13.03 kB / 4.71 kB gzip |
| Route-specific MoviePage CSS | None | 2.43 kB / 0.94 kB gzip |
| Global CSS | 139.41 kB / 20.32 kB gzip | 138.52 kB / 20.33 kB gzip |
| Sum of all emitted JS + CSS | 1609.60 kB / 501.49 kB gzip | 1616.29 kB / 505.00 kB gzip |

Total emitted JS + CSS changes by approximately **6.69 kB raw / 3.51 kB gzip**.
These sums describe all emitted chunks, not the initial network transfer.
No new runtime dependency or font file. Film imagery, QA screenshots and the
generated concept are not imported into the production bundle.

## Real local environment at handoff

All services had stopped since Phase 4. Only the four existing dependency
containers were started; existing volumes were preserved and the seeder was
excluded. Cinema PostgreSQL completed automatic crash recovery after its prior
unclean shutdown. No recovery bypass, database reset, reseed, volume deletion,
or tracked backend / loyalty edit was made.

The API reuses the inspected Phase 4 no-seed compiled entry documented in
[phase-4-local.md](phase-4-local.md). The initial API launch exited while
PostgreSQL was recovering; it was relaunched after readiness. Loyalty uses its
existing compiled build and existing internal key. Normal background consumers
remain enabled. Detached processes use `Start-Process -WindowStyle Hidden`;
logs and PID files are under `%TEMP%/cinema-phase5`.

| Service | Address / check | Verified status |
| --- | --- | --- |
| Frontend | [Live Movie Details](http://localhost:5176/movies/c0b51881-c4d0-4bac-8501-86557175e360) | HTTP 200; real browser at 1440 / 390; no console errors |
| API | [Movies](http://localhost:5211/api/movies), sessions, movie details | HTTP 200; one real film, four past sessions, zero future screenings |
| Swagger | [Swagger UI](http://localhost:5211/swagger/index.html) | HTTP 200 |
| Loyalty | HTTP :3000, gRPC 127.0.0.1:50051 | Both listeners reachable; startup logs confirm database and RMQ / gRPC startup |
| `cinema-postgres` | :5432 | Running, Docker healthy, `pg_isready` accepts connections |
| `cinema_loyalty_db` | :5433 | Running, `pg_isready` accepts connections |
| `cinema-redis` | :6379 | Running, listener reachable; real API reads succeed |
| `cinema-rabbitmq` | :5672 / :15672 | Running, listener reachable, diagnostics ping succeeds |

Only Cinema PostgreSQL has a configured Docker healthcheck; no healthcheck
status is invented for the other services. PID files identify frontend launcher
20680, API 15232 and Loyalty 23564 at this checkpoint. No processes or containers
were stopped as cleanup.

The live film has no artwork / trailer / cast and a zero rating. Its actual
description is shown; missing fields are omitted. The live page accurately
shows no upcoming screenings and no other catalogue films. Multi-film artwork
and future screenings appear only in isolated fixtures. Live sign-in, payment,
third-party YouTube playback, other browsers and admin mutations were not tested.

Suggested commit: `feat(movie-details): add editorial film experience and discovery`.
