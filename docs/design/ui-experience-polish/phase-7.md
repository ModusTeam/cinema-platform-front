# Phase 7: editorial account and digital tickets

28 October 2026 (Europe/Kyiv). Ready for visual review on
`feat/ui-experience-polish`, in the existing PR #53 context targeting `develop`.
Changes remain local; no commit, push, new PR or merge. Work stops after Phase 7.

## Account composition and architecture

`/profile` now uses an open editorial composition: large section navigation on
the left, spacious content on the right, warm paper, thin rules and restrained
red actions. Below 1024px the navigation becomes compact, wrapping into two
columns on phones. At enlarged text sizes it can stack without horizontal
scrolling. A single loyalty summary moves below content on smaller screens.
The active section has an underline and `aria-current`; controls remain native
buttons associated with the account content region.

Golos Text supplies interface text; Roboto Condensed supplies headings and
section names. The ticket repeats the existing monochrome Cinema wordmark.
The paper treatment is scoped to `.account`. Header, Ticket Menu, Footer,
Booking, Checkout, Admin and the dedicated Loyalty/Achievements pages retain
their existing designs and routes. The temporary Design Lab remains intact.

| Module | Responsibility |
| --- | --- |
| `pages/account/ProfilePage` | Composes navigation, content, request states and the responsive summary. |
| `features/profile/config/accountNavigation` | Existing four section IDs, labels and descriptions. |
| `AccountNavigation` | Accessible native section controls and current-section presentation. |
| `AccountOrders` | Shared active/history list presentation, distinct loading/error/empty states. |
| `TicketCard` | Physical ticket composition, native disclosure, QR presentation and clipboard feedback. |
| `AccountSettings`, `model/profile.schema` | Existing React Hook Form/Zod flows and unchanged validation rules, extracted from the page. |
| `AccountLoyaltySummary`, `AccountAchievements` | Small editorial presentations of existing hooks and adapters. |
| `entities/order/lib/orderPresentation` | Status copy, unchanged history predicate, index-preserving ticket association and QR eligibility. |
| `features/profile/ui/account.css` | Local paper roles, typography, ticket cuts/perforations, progress and field treatment. |

Account queries, API services and mutations remain in their established layers.
Keys remain `['my-orders']`, `['account-profile', userId]`,
`['loyalty-profile', userId]` and `['achievements-tab']`. Birth-date saving retains
the account-profile invalidation. Profile/password updates retain the existing
parallel mutation behavior, auth-context synchronization and toast feedback.
No endpoint, dependency, lockfile, backend feature or payment flow was added.

The account-profile query now exposes its loading/failure state to the settings
composition. An unavailable profile does not show an editable one-time birth-date
form. Settings remain mounted while sections switch, preserving unsaved values;
hidden fields cannot receive keyboard focus. Shared Input labels, error
associations, alert announcements and invalid-field focus remain in use.
Successful password saves clear password fields. An existing raw error-object
console log was removed to avoid logging request configuration or form secrets.

## Digital Ticket behavior

Tickets use a light paper surface, full wrapping film titles, date/time, actual
hall and seat labels, per-seat status and the existing order identifier.
The stub has a dashed perforation and concave edge cuts. On phones it becomes
a compact horizontal section. Missing or failed posters leave the title and
booking information intact, without a broken remote placeholder.

The amount is labelled **Сплачено** because the existing adapter supplies
`amountPaid` (falling back to `totalAmount`), including zero. No total, refund,
discount or payable amount is recalculated.

| API state | Presentation / QR behavior |
| --- | --- |
| Paid + Valid | QR available only after opening the disclosure. |
| Pending / PaymentProcessing / PaymentOutcomeUnknown | Explicit payment label; no admission QR. |
| Failed / Cancelled / Expired | Explicit terminal label in history; no admission QR. |
| Used / Refunded / Reserved / Released | Explicit seat status; no QR for that ticket, even in a paid order. |
| Unknown order or ticket status | Honest unknown-status copy; no QR. |
| Mixed multi-ticket order | Every ticket keeps its original seat, status and ID index. Only eligible entries receive QR. |

QR values remain the existing **ticket ID**, not `secretCode`, a constructed URL
or an order identifier. The implementation does not change QR generation,
scanner validation or payment logic. History grouping still uses the existing
past-session/cancelled/failed/expired predicate. A past-session ticket that the
API still reports as Paid + Valid retains the previous QR eligibility; the UI
labels the past session and leaves admission validation to the backend. No new
frontend expiry rule was introduced.

Native `details`/`summary` replaces the sliding overlay. Opening reveals a
dedicated QR area for each eligible ticket and IDs/statuses for the others.
Closing from inside returns focus to the summary; collapsed QR/copy controls
are unmounted. The layout grows with the tickets rather than clipping them in
a fixed-height overlay. Clipboard success is reported only after the write
resolves; denial produces an error toast and leaves selectable ID text.
A failed order refetch shows retry UI rather than exposing stale admission QR.

## Loyalty and achievements

The summary uses `useLoyaltyProfile` and the existing mapped tier, balance,
progress and next-tier threshold. Bronze/Silver/Gold thresholds and point
calculations are unchanged. Zero balance is shown as zero; loading and failure
are distinct, and failure exposes retry. No benefits or reward eligibility are
invented. **Докладніше** opens `/account/loyalty`.

The achievement overview reuses `useAchievementsTabData`: up to three unlocked
items and the existing first item in progress, with actual reward points,
category/rarity labels and numeric progress. It keeps loading, error and empty
states, and links to `/profile/achievements`. The full dedicated implementations
were not duplicated or restyled.

## References, concept and resource decisions

Craftwork Design, frontend-app-builder, frontend-testing-debugging and React
best-practice skills informed the implementation. Browser plugin was not
available; regular Playwright MCP supplied browser verification. Craftwork MCP
tools were unavailable and its public catalog returned an unsupported content
type to the web tool. No private route, paid resource or additional connection
was used.

The live [A24](https://a24films.com/) and [Siena](https://www.siena.film/)
references were inspected, alongside the approved Phase 2–6 documentation and
existing Ticket Menu. At 1440px the A24 homepage's lead heading computed to
Neue Montreal, 225px/180px; Siena's film headings used Neue Brucke at
89.6px/~69px. Their large type, open spacing and ticket material informed the
composition; the account uses the project's smaller, readable display scale.
No reference code, branding or artwork was copied. The previously mentioned
A24 Account screenshot was not present in the available attachments; exact
comparison to that screenshot could not be performed.

A built-in Image Gen [concept](screenshots/phase-7/concept.png) explored the
whole account composition. The [exact prompt](phase-7-concept-prompt.md) is
saved beside this report. It is a study, not production artwork or user approval.

| Resource step | Taken / rejected |
| --- | --- |
| Inspiration | Supplied live A24/Siena references and the approved project screenshots. |
| Templates/layouts | Existing account contracts and approved composition were sufficient; no new template. |
| Animated components | Native disclosure and existing shared Motion behavior; no component export or new animation dependency. |
| Fonts | Existing Golos Text / Roboto Condensed / Montserrat roles. |
| Icons | Existing Lucide icons only for shared request states. |
| Shaders | Rejected; no account task benefits from an animated background. |
| Mockups/backgrounds | Native CSS paper and actual API posters; no raster texture or device mockup in production. |
| 3D/illustrations | Rejected; tickets, settings and loyalty copy need no ornamental object. |

| Comparison | Final decision |
| --- | --- |
| Concept navigation and paper | Retained the spacious sidebar/content relationship and tear-off ticket structure. |
| Concept serif type | Replaced with the explicitly requested, established Roboto Condensed and Golos Text. |
| Concept QR always visible | Replaced with an accessible disclosure and per-ticket eligibility checks. |
| Concept loyalty values | Used actual adapter values and existing thresholds, including the 2000-point Silver threshold. |
| Concept inline settings below tickets | Preserved the real four-section navigation and focused settings view. |
| Mobile ticket | Shortened the stub and kept full titles/statuses visible without clipping. |
| Enlarged date field | Corrected an implicit grid track that allowed the native date input to exceed the 320px account surface at 200% text. |

The concept and final desktop/mobile browser screenshots were opened with
`view_image`. These intentional differences follow the task's explicit design,
accessibility and contract requirements. This remains a user visual-review
checkpoint, not a claim of pixel-identical reproduction of A24.

## Browser and accessibility verification

The [fixture harness](phase-7.browser.mjs) creates and closes a disposable
Chromium context. All account details, IDs, QR payloads and passwords are
synthetic. GETs and the four attempted mutation requests are fulfilled inside
Playwright; no request writes to the real database. Passwords are cleared before
screenshots, and request bodies/tokens are not included in the results.

The final [raw results](phase-7-browser-results.json) contain **220 passing
checks**, zero runtime errors, no console errors in normal scenarios, and 11
expected 503 resource logs in simulated failure scenarios.

An additional [focused achievement run](phase-7-achievements.browser.mjs) adds
[24 passing checks](phase-7-achievement-results.json) across the same viewport
and motion matrix, verifying API-provided rewards and numeric progress.

The final [settings run](phase-7-settings.browser.mjs) adds
[24 passing checks](phase-7-settings-results.json) for enlarged text and the
accessible full-date hint. Account-only enlarged-text captures temporarily hide
the fixed Header in the fixture context; whole-page captures retain it.

| Coverage | Result |
| --- | --- |
| Page identity, meaningful content, framework overlay | Pass; correct title and visible account content, no Vite overlay. |
| 1440 / 768 / 390 / 320px | Active/history tickets, achievements and settings pass with normal and reduced motion. |
| QR disclosure | Two valid tickets retain their distinct seats/IDs; refunded, used, reserved, released and unsupported order states expose no QR. |
| Keyboard | Tab/Enter changes sections; native disclosure opens; collapse restores focus; hidden settings/disclosure controls do not intercept navigation. |
| Clipboard | Original ticket-ID payload preserved; success and permission-denial feedback verified. |
| Forms | Required-field focus/alerts, current-password requirement, profile synchronization, password clearing, failed-save retention, established DOB lock and one-time DOB save pass. |
| Loyalty/achievements | Loading, failure/retry presentation, empty/zero states and dedicated-page links verified. |
| Long content / missing art | Full Ukrainian titles and long synthetic names wrap; missing poster does not create broken media. |
| 200% root text | Account content, expanded tickets and settings stay within their surface at all four widths after the date-grid fix. |

Known shared-layout limitation: Header/Footer still overflow at narrow widths
with 200% root text, as documented in Phase 6. Account has no surface overflow.
The root-font method is not a browser-zoom or assistive-technology certification.
Only existing color transitions and the shared route transition remain; Account
does not mount Lenis or add GSAP/Three.js. Native disclosure has no transform
animation that can hide focused controls.

See the [before/after and state screenshot index](screenshots/phase-7/README.md).

## Build, tests and lint

| Command / inspection | Result |
| --- | --- |
| `bun run build` | Pass; TypeScript and production Vite build. Existing SignalR annotation warnings remain. |
| `bun run test` | 155 pass, 0 fail. Includes the exhaustive order/ticket state matrix, seat association, unchanged history grouping, navigation markup and extracted form validation. |
| `bun run lint` | Existing baseline unchanged: 17 errors, 29 warnings, 1 info. |
| Focused Biome check on changed TS/TSX and new tests | Pass. |
| `git diff --check` | Pass; Git may print existing LF/CRLF conversion notices. |
| Production output inspection | One HTML entry; no synthetic fixture identifiers, Design Lab code, Onest or Unbounded markers. Profile CSS remains a separate route chunk. |

The sandbox initially denied dependency/cache access for build/tests. The
configured commands passed with the required access; no dependency installation
or configuration workaround was introduced. Bun still prints its existing
directory-mismatch diagnostic, and booking tests intentionally log simulated
offline SignalR failures while passing.

## Local stack and limits

The existing local processes and volumes were reused. No database reset,
reseed, account creation, backend rebuild or service restart was performed.
All required services remain running.

| Service | Verified address / status |
| --- | --- |
| Frontend / account review | http://localhost:5176/profile; existing sign-in required for real account data. |
| Frontend | http://localhost:5176/; a fresh browser context confirmed a real `http://localhost:5211/api/movies` response with status 200 and no runtime errors. |
| API | http://localhost:5211/api; public movie reads return 200. `/health` is not a configured endpoint (404). |
| Swagger | http://localhost:5211/swagger/index.html; HTTP 200. |
| PostgreSQL | :5432; Docker healthy, `pg_isready` accepts connections. |
| Loyalty database | :5433; `pg_isready` accepts connections. |
| Redis | :6379; running, responds with the expected authentication-required challenge to an unauthenticated ping. |
| RabbitMQ | :5672 / :15672; running, diagnostic ping passes. |
| Loyalty service | HTTP :3000 and gRPC 127.0.0.1:50051 listeners present. No new authenticated loyalty transaction was exercised. |

Real paid orders and the full state matrix were not assumed to exist in local
data. Account review uses isolated fixtures; live authentication/refresh,
payments, scanner admission, real clipboard/browser permission differences,
Firefox/Safari, screen readers and hardware touch were not exercised.
Live reads confirmed one catalogue film and four aggregate sessions. The
previously documented sparse local catalogue remains a limitation for
future-screening review. API and loyalty contracts, backend admission and
payment boundaries remain authoritative.

Suggested commit: `feat(account): add editorial profile and accessible digital tickets`
