# Phase 6: editorial film catalogue and daily schedule

28 October 2026 (Europe/Kyiv). Ready for visual review on
`feat/ui-experience-polish`, in the existing PR #53 context targeting `develop`.
Changes are local: no commit, push, PR creation or merge. Phase 6 stops here.

## Result and boundaries

`/sessions` now opens a poster-led film catalogue, independent of today's
screenings. A compact film index is an alternative presentation of the same
loaded data. The adjacent **Сеанси** navigation opens the daily schedule in one
action. Category, view, selected date and selected film are shareable URL state.

Home, Header, Ticket Menu, Movie Details and Footer retain their compositions,
styles and labels. Their explicit schedule links now target
`/sessions?mode=schedule`, preserving the meaning of “Сеанси”, “Повний розклад”
and “Розклад сеансів”. The original `/sessions` URL still works. Booking,
Profile, Admin, auth, payment, loyalty and backend implementations are unchanged.
The shared MovieCard stays intact for Home and the temporary Design Lab.

## Visual decisions and reference study

Lead reference: [A24 Films](https://a24films.com/films), inspected in the live
browser on desktop and mobile. At a 1440px viewport its section heading used
Neue Montreal at **96px / 83.52px**, with approximately **24px side insets** and
a **1377px heading measure**. Its theatrical gallery prioritizes artwork over
containers; its All Films section uses large linked names and thin row rules.
No A24 code, branding, posters or unsupported director/writer columns were copied.

The existing Phase 3–5 A24/Siena studies and approved Movie Details supplied the
secondary references: image emphasis, restrained movement and ticket-paper
surfaces. This page extends that established identity.

Locked design: warm paper `#f5f1e8`, ink `#201f1d`, muted print `#686259`, rules
`#c4bdb2`; scoped image fallback `#e9e3d8`. Existing red and action colors remain
semantic. Roboto Condensed supplies the 56–96px heading and 28–40px film names;
Golos Text supplies controls and metadata. The existing wordmark remains.
Tailwind handles layout and responsive rules; native CSS is limited to scoped
tokens, type roles, selected/focus/hover states and the precise index columns.
There is no new SCSS, dependency, shader, GSAP or global Lenis integration.

The gallery uses three columns at desktop, two from 600px and one on phones,
with 32–48px horizontal and 56px vertical gaps. Artwork sits in plain 2:3 frames
with `object-contain`, preserving its proportions. Full titles wrap rather than
clamp. No rating overlay, hover-only details action or decorative card frame.
Absent/failed posters use a quiet typographic panel; the complete title remains
outside it. The index uses year / title / genres-duration / screening-access
columns from 1024px, then stacks each entry without a scrolling table.

An [Image Gen concept](screenshots/phase-6/concept.png) explored both modes before
implementation. This was a built-in-tool design study, not production artwork.
Its brief specified the approved paper tokens/fonts, open poster frames, Film /
Schedule navigation, category and view controls, full titles, supported metadata,
honest screening access, pagination and ruled index rows. Production uses API
content and existing fixture media, never the study's imagined films or artwork.
The study proposed four columns; three were chosen to prioritize larger posters.
The Header remains the actual approved implementation rather than the concept's
approximation. The index uses larger, more readable rows than the compressed study.

Craftwork Design, frontend-app-builder, frontend-testing-debugging, Impeccable
and React best-practice guidance informed the work. Craftwork MCP tools were not
connected; its public API catalog returned an unsupported content type to the
web tool. Impeccable's context engine could not initialize its external cache,
so existing source and Phase 2–5 documents supplied context. No template, font,
icon pack, shader, mockup, 3D asset or paid download was obtained. Existing fonts,
Lucide icons and actual movie artwork fit the task; ornamental alternatives
were rejected because they add no film-discovery information.

### Visual comparison ledger

The concept, A24 captures and latest browser PNGs were opened with `view_image`.
Desktop, tablet, mobile, narrow mobile, sparse real data and enlarged-text states
were visually inspected in addition to automated geometry checks.

| Comparison | Rendered evidence / decision |
| --- | --- |
| Composition | Open poster surfaces and ruled rows replace the old framed card grid. Three desktop columns deliberately give the artwork more room than the concept's four. |
| Typography | Browser computed styles confirm the existing Roboto Condensed display family; full Ukrainian stress titles wrap. Golos Text remains the UI face. |
| Palette | Browser confirms paper `rgb(245,241,232)`; colors match the approved Movie Details and Ticket Menu. No new red variation. |
| Asset treatment | 2:3 reserved geometry, undistorted real poster media, explicit missing and corrupt-image fallbacks. No invented live poster. |
| Spacing and columns | Shared gutters, aligned poster tops and precise desktop index columns; stacked tablet/mobile entries preserve full names and actions. |
| Copy | “Фільми”, “Сеанси”, “Усі фільми”, “В афіші”, “Скоро”, “Постери”, “Індекс” and “Знайти сеанси” follow the design brief. The availability note and partial-page text are intentional additions required by actual API limits. No director/writer, price, seat-count or premiere-date claims. |
| Motion | Small 160–180ms view entries begin visible; 350ms poster hover scales by 1.018. Runtime reduced-motion changes remove the hover transform. |

The implementation was verified against the concept and reference direction,
with the intentional differences above. Phase 6 remains a user visual-review
checkpoint, not a claim of user approval or pixel-identical reproduction of A24.

## Architecture

| Module | Responsibility |
| --- | --- |
| `pages/public/SessionsPage` | Composes the catalogue/schedule widget. |
| `widgets/movies-grid/ui/MoviesGrid` | URL-derived mode/category/view/date, section navigation and links into the schedule. |
| `widgets/movies-grid/model/useCatalogue` | One React Query infinite query, 12 records per explicit page request. |
| `Catalogue`, `FilmGallery`, `FilmIndex`, `CatalogueLoading` | Independent request states, shared pagination, two presentations and accessible loading output. |
| `features/movies/ui/CataloguePoster` | Image decoding/failure state and stable poster geometry. |
| `DailySchedule` | Date controls, independent daily query and grouped real screening links. |
| `entities/movie/lib/catalogue` | Public statuses, deletion/duplicate exclusion, optional metadata; preserves server order. |
| `entities/session/lib/sessionDates`, `dailySchedule` | Valid local dates, UTC request boundaries, future scheduled-session selection, ordering and movie grouping. |
| `movies.service`, `sessions.service` | Existing contracts; optional cancellation for paginated movies and a new adapter for the existing date endpoint. Session mapping is shared with the existing aggregate reader. |

Query keys: `['movies', 'catalogue', { pageSize: 12 }]` and
`['sessions', 'by-local-date', date]`. Both retain the existing domain prefixes
for mutation invalidation. Category/view changes reuse loaded pages and do not
request sessions or halls. Schedule-only entry does not fetch the catalogue.
Query abort signals reach Axios. No new provider or architectural layer.

## Catalogue and schedule behavior

| URL / action | Behavior |
| --- | --- |
| `/sessions` | Poster gallery, all loaded public films. Active films remain visible with no future screenings. |
| `?view=index` | Same data and category in the editorial index. |
| `?category=active` / `?category=soon` | Filters loaded records using the existing Active / ComingSoon values. Archived/deleted entries are excluded. |
| `?mode=schedule&date=2026-10-29` | Direct daily schedule. A valid date without an explicit mode also opens the schedule. Invalid dates fall back to today. |
| “Знайти сеанси” | Opens schedule mode for that movie, preserving the selected day. This action promises a lookup, not available tickets. |
| Coming soon | Status and “Дату показів буде оголошено”; no booking or screening-availability promise. |
| Poster/title link | Existing `/movies/{movieId}` route. |
| Actual screening link | Existing `/booking/{movieId}`, with the existing `{ sessionId }` navigation state convention. |
| Browser Back / Forward | Restores the URL-derived category, view, mode and date. |

The existing booking hook does **not** consume that session navigation state;
it still starts with its session picker. The screening action therefore enters
the existing booking journey, without adding session preselection, changing
guest auth redirects or creating locks/orders. This existing limitation remains
for the later booking phase. The selected film can be cleared directly in the
schedule. Seven local-day shortcuts and a labelled native date input provide
both quick navigation and dates outside that week.

The schedule excludes past/invalid timestamps and cancelled sessions, sorts by
time and groups by case-insensitive movie ID. It displays actual hall names and
local times, with no invented price or seat availability. Only actual Scheduled
future records receive booking links. A foreground 30-second refetch updates
the schedule; a failed request removes screening actions and offers a retry.
No request failure appears as an empty-data message. Loading, empty category,
partially loaded category, empty date and request failure are separate states.

## Data and coverage limits

The inspected backend movie query supports page number/size, title search and
genre ID, orders by release year descending then title, and excludes deleted
records. It has **no server status filter**. The catalogue therefore loads one
12-record page at a time and filters only those pages locally. It never fetches
every page automatically to fill a category. The UI explicitly states this
while more pages exist, reports loaded records versus the API total, and says
“Серед завантажених записів…” when the subset is empty. “Показати ще” remains
available even when that subset contains no films. Counts use “записів” because
the backend total can include archived entries; the public subset is separate.
Next-page errors retain loaded content and can be retried without starting over.

The 125-film fixture reached a coming-soon film on page 11, beyond the old
first-100 window. Duplicate IDs across returned pages are excluded defensively;
the underlying API is offset pagination, so concurrent catalogue edits can
still shift page boundaries. No snapshot/cursor consistency is invented.

`GET /sessions/by-date?date=YYYY-MM-DD` already exists and returns the complete
UTC calendar day rather than the aggregate endpoint's first 1000 entries.
A visitor's local day spans one or two UTC days. The adapter requests only those
days in parallel, then filters to the selected local date. Browser checks cover
00:15 / 23:45 Kyiv shows, exclude the following midnight, and cover both DST
transition dates and year end. If either request fails, the schedule fails as a
whole rather than silently showing an incomplete day. This endpoint has no
within-day pagination, so an unusually busy date can return a larger payload.

Home and Movie Details retain their existing aggregate adapters: first 100 movies
and first 1000 sessions where previously used. Phase 6 fixes the new catalogue /
schedule coverage, not those separate existing previews. “В афіші” is explicitly
identified as catalogue status, not confirmation of current screenings. Browser
local time is retained; no new fixed cinema-timezone contract was introduced.

## Browser and accessibility verification

Browser plugin / skill unavailable; used regular Playwright MCP with disposable
GET-only fixture contexts, `uk-UA`, `Europe/Kyiv`, fixed fixture clock
`2026-10-28T09:00:00Z`. The manually accessible app has no fixture interception.
The tool's filename shortcut could not read this workspace, so the full helper
source was passed through its `code` argument. No dependency was installed.

Evidence: [83 main checks](phase-6-browser-results.json),
[16 edge checks](phase-6-edge-results.json),
[screenshots](screenshots/phase-6/README.md),
[main helper](phase-6.browser.mjs), [edge helper](phase-6-edge.browser.mjs).

| Check | Actual scope / result |
| --- | --- |
| 1440, 768, 390, 320px | Gallery, index and several-screening schedule pass at normal and reduced motion. No page overflow, blank page, Vite overlay or Lenis on these routes. |
| Content variants | Long Ukrainian title, coming soon, missing poster, corrupt poster, archived/deleted exclusions and active films independent of screenings. One sparse film captured at 390px; the real one-film catalogue checked at 1440 / 390px. |
| Pagination | 125 records over eleven explicitly requested pages; failed second page retains 12 entries, pending action disables duplicate clicks, retry recovers, categories remain honest before later matches load. |
| Empty/loading/failure | Catalogue and schedule states captured separately at 1440px; empty schedule and return to films also checked at 390px. Retry recovers both requests. |
| Keyboard and history | Tab/Shift+Tab focus outline on view switch; Enter switches to index; Back restores category. Native film links reach Movie Details; the real film link was also activated with Enter. |
| Motion | Dynamic preference removes poster hover transform; new loading icon and view entry respect reduced motion. No meaningful information requires hover. |
| 200% root text | All four widths × gallery/index/schedule stay within the catalogue surface. This follows the previous phase's root-font enlargement method, not a full assistive-technology or browser-zoom certification. |
| API truth | Future Scheduled records only; invalid/past/cancelled records excluded; UTC/local midnight and DST cases pass. No fabricated amounts or availability. |
| Existing navigation | Home full-schedule action opens schedule mode directly; catalogue → Movie Details works; real Movie Details → full schedule works. |
| Console / mutations | Main fixture run: zero console/runtime errors and zero mutations. Edge run: eight expected 503 resource logs, zero runtime errors, zero mutations. |
| Live API | Real catalogue, movie details and date endpoints returned 200. Live gallery/index/schedule at 1440 / 390px have no overflow or console/runtime errors. |

Known shared-layout limitation is preserved: Header / Footer overflow with 200%
root text at narrow widths. This run also observes it at 390px, as well as 320px;
the catalogue/schedule descendants stay inside their own surface. No Header,
Footer or Booking redesign was folded into this phase. Screen reader behavior,
Firefox/Safari, real touch hardware, live login, locks, checkout, payment and
admin mutations were not tested. Multi-film art and future screenings remain
fixture-only because the actual database has one sparse film and no future shows.

## Verification and bundle impact

| Command/check | Result |
| --- | --- |
| `bun run build` | Pass, TypeScript and Vite; existing SignalR PURE annotation warnings remain. |
| `bun run test` | 100 pass, 0 fail across 11 files. Seven new tests cover public status/deletion/duplicate handling, no eight-film truncation, metadata omission, valid dates, UTC bounds and daily filtering/grouping. |
| Focused Biome check | Pass for the new catalogue/widget/domain/test files and changed session adapter. |
| `bun run lint` | Existing baseline: 17 errors, 29 warnings, 1 info before and after. All 47 final diagnostic entries point to unmodified files; no unrelated cleanup. |
| `git diff --check` | Pass; existing Git LF/CRLF notices are not whitespace errors. |
| Production exclusion | Only `dist/index.html` emitted. No Design Lab / helper / stress-film markers, experimental Onest/Unbounded assets or extra HTML found in the build. The lab remains in source. |

Sandbox attempts could not read some dependencies or write TypeScript caches.
Build/test were rerun successfully with normal filesystem access. Bun's existing
directory-mismatch diagnostic and simulated-offline test logs remain. No package
or lockfile change was necessary.

Same-environment build comparison (Vite's rounded emitted-asset measurements):

| Asset | Before raw / gzip | After raw / gzip |
| --- | --- | --- |
| Sessions lazy JS | 4.80 / 2.15 kB | 16.61 / 5.37 kB |
| Sessions CSS | None | 2.56 / 0.86 kB |
| Global CSS | 138.52 / 20.33 kB | 140.26 / 20.54 kB |
| Home lazy JS | 24.71 / 9.30 kB | 27.88 / 10.13 kB |
| Movie Details lazy JS | 13.03 / 4.71 kB | 13.05 / 4.71 kB |
| All emitted JS + CSS | 1616.29 / 505.00 kB | 1633.99 / 509.47 kB |

Total emitted change: approximately **17.70 kB raw / 4.47 kB gzip**. These totals
include every chunk, not initial transfer. Shared query/service code and chunk
allocation affect Home's emitted size even though its composition is unchanged.
No new runtime library or font file; concept, references and fixture screenshots
are outside production assets.

## Real local environment at handoff

All previously running processes and containers were reused. Nothing was stopped,
reset, reseeded or migrated; Docker volumes were preserved. No backend/loyalty
source edit or service restart was needed. Existing Phase 5 hidden processes and
no-seed compiled API setup remain as documented in [Phase 4 local setup](phase-4-local.md)
and [Phase 5](phase-5.md). Their logs/PID files remain under `%TEMP%/cinema-phase5`.

| Service / review URL | Verified status |
| --- | --- |
| [Poster catalogue](http://localhost:5176/sessions) | HTTP 200, real one-film data, desktop/mobile browser checked. |
| [Film index](http://localhost:5176/sessions?view=index) | Real API; no poster fabrication. |
| [Daily schedule](http://localhost:5176/sessions?mode=schedule) | HTTP 200; accurate empty-screening state. |
| [API movies](http://localhost:5211/api/movies?pageNumber=1&pageSize=12) | HTTP 200; total one. |
| [API daily sessions](http://localhost:5211/api/sessions/by-date?date=2026-10-28) | HTTP 200; selected day empty. Existing aggregate total four, all past. |
| [Swagger](http://localhost:5211/swagger/index.html) | HTTP 200. |
| Loyalty HTTP :3000 / gRPC :50051 | Both TCP listeners reachable; no invented root health endpoint. |
| `cinema-postgres` :5432 | Running, Docker healthy, `pg_isready` accepts connections. |
| `cinema_loyalty_db` :5433 | Running, `pg_isready` accepts connections. |
| `cinema-redis` :6379 | Running, TCP reachable; real API reads succeed. |
| `cinema-rabbitmq` :5672 / :15672 | Running, diagnostics ping succeeds. |

Suggested commit: `feat(catalogue): add editorial film views and daily schedule`.

Stop after Phase 6 for visual review. Keep the Design Lab and running services.
