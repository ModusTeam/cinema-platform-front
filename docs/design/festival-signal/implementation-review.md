# Initial New Home implementation review

2026-10-26. Review checkpoint: initial New Home only. No commit, push, PR or merge.

## Implementation and changed files

- `PRODUCT.md`, `docs/design/cinema-experience-brief.md`,
  `docs/design/festival-signal/visual-direction.md`, and the exploration README
  record approved vespre. / Festival Signal / Midnight Signal and Classic / New.
  Original-palette boards and all historical prompt sidecars are preserved.
- `DESIGN.md` and `.impeccable/design.json` describe the shipped scoped visual
  system. Classic's global palette and typography remain intact.
- `src/features/presentation/model/{preference,PresentationContext}.ts(x)` and
  `ui/{PresentationSwitch.tsx,presentation-switch.css}` own the local preference.
  The versioned storage key is `cinema-presentation-v1`. Missing, invalid and
  inaccessible storage default to Classic; writes are guarded.
- `src/app/DevelopmentApp.tsx` mounts the preference above the router without
  replacing existing query/auth providers. `MainLayout.tsx` changes its shell
  only for New at `/`; shared routes retain component identity and Classic UI.
- `src/app/layouts/components/ProgrammeHeader.tsx`, `ProgrammeFooter.tsx`, and
  `src/app/layouts/programme.css` supply the scoped masthead, navigation, footer,
  fonts and responsive presentation. No root Classic tokens are replaced.
- `src/pages/public/HomePage.tsx` retains the existing Classic implementation
  and lazily loads `src/widgets/home/ui/ProgrammeHome.tsx` for New.
- `src/widgets/home/model/useProgramme.ts` reuses existing movie, session and
  hall services through independent React Query requests. `lib/programme.ts`
  filters/sorts real future Scheduled sessions for active films and provides
  consistent Kyiv date/time formatting. First film follows returned API order.
- `index.html`, Classic Header/Footer, home PromoSection, CareersPage,
  HallsPage and PrivacyPage receive customer-facing brand substitutions only.
  Technical names, domains, package names and admin branding remain unchanged.
- `public/fonts/` contains Roboto Condensed and Golos Text variable TTF files
  and their original OFL licenses. No package dependencies were added.
- `tests/presentation.test.ts` and `tests/programme.test.ts` add five tests for
  storage defaults/failures, round-trip preferences, eligibility, simultaneous
  halls, date sorting, invalid timestamps, timezone/DST and absence of UI caps.

## Integration boundaries and deferred work

- Existing list adapters request page 1 with page sizes 100 movies, 1,000
  sessions and 100 halls. Backend limits may be smaller. Adapters discard total
  counts; New Home does not claim full coverage and adds no display truncation.
  Complete pagination remains a discovery-adapter follow-up.
- `/booking/:id` receives a movie ID. A displayed screening links to that movie's
  existing session-selection step. Visible copy explains re-selection; accessible
  link names include film, date, time and hall. No session handoff is implied.
- Session preselection through authentication and login return continuity remain
  follow-up work. Discovery never acquires locks. Booking, checkout, payment,
  seats, authentication, account, Schedule, Movie Details and Admin are unchanged.
- The presentation switch is absent throughout `/booking/*`. On shared pages,
  selecting a mode changes preference without remounting forms or providers.
- No price, seat count, age restriction or screening format is invented. Missing
  and broken artwork receive a local fallback; no generated mockup raster ships.

## Executed verification

| Check | Result |
| --- | --- |
| `bun run build` | Pass. Existing SignalR PURE-comment warnings remain. |
| `bun run test` | Pass: 84 tests, zero failures. Bun emits a directory-mismatch diagnostic; exit status is zero. |
| `bun test` | Fails: repository aliases require the configured script's `--tsconfig-override`; existing tests also fail this way. |
| `bun run lint` | Fails: 18 errors and 29 warnings in unchanged files, including admin UI and booking hooks. |
| Focused lint of all 17 changed/new application TS/TSX files | Pass, zero diagnostics. |
| `git diff --check` | Pass. |
| Font binary cmap check | Required Ukrainian letters/punctuation present in both; Golos Text also supplies the missing Roboto Condensed hryvnia glyph. |

Build and tests needed execution with dependency access after sandboxed attempts
were denied reads/writes under `node_modules`. No dependency or tooling workaround
was added. Impeccable's context engine could not initialize its cache; existing
project documents were read directly and no detector result is claimed.

## Browser checks

Browser plugin was unavailable; the provided Playwright tools tested
`http://127.0.0.1:5173/` in disposable Chromium contexts with intercepted API
fixtures. Fixture films/screenings do not ship. Loaded-image cropping used a
temporary Unsplash landscape photograph rather than claiming a real film still;
missing-image fixtures were also inspected. Production API requests failed in
the browsing environment, so these checks do not establish live backend health.

- Page title is vespre.; rendered content exists; no framework error overlay.
- Classic initial default, New selection, refresh persistence and restoration
  of Classic passed.
- Keyboard date selection updates matching hall/actions and the polite status
  announcement. Focus remains on the date even when selecting it changes the
  lead film. Selected controls retain a chalk outline on the midnight band.
- `/faq` returns to the Classic shell after navigation completes. A filled login
  email survives switching. Booking exposes zero presentation controls.
- 320, 390, 768 and 1440px widths have no horizontal overflow. At 768px with root
  font size enlarged to 200%, the catalogue remains inside the viewport.
- Long Ukrainian titles, reduced motion, loaded/missing art, empty programme,
  film failure and partial schedule failure were exercised. Schedule failure
  retains film entries. No uncaught page errors occurred in the fixture run;
  injected 503 responses produced expected request-error logging.

Independent Impeccable finish review requested corrections for focus contrast,
announcements, compact mobile entries and integrated dates. The correction
verdict scored these resolved and allowed shipping once documentation completed.
Desktop/mobile/enlarged captures were kept outside the repository in temporary
QA files. This is a bounded initial review, not whole-product certification.

## Remaining manual checks

Review against the live catalogue on desktop and physical mobile devices;
confirm actual film image crops, backend date/status conventions and session
selection after real authentication. Safari/Firefox, screen-reader announcement
quality and browser-native zoom remain manual checks. The 200% check used CSS
text enlargement rather than browser-native zoom. Real payments and seat-lock
transactions were outside this presentation iteration.

Suggested commit: `feat(home): add vespre new experience with classic preference`

## Technical refinement of PR #52

2026-10-26. Existing branch: `design/cinema-experience-exploration`. This is a
technical refinement of the approved foundation; no new PR or merge is created.
The initial implementation record above is historical evidence.

### Changes and file inventory

- `package.json` and `bun.lock`: Bun-installed
  `@fontsource-variable/roboto-condensed` and `@fontsource-variable/golos-text`,
  both 5.3.0. The npm lockfile is unchanged.
- `src/app/styles/fonts.css`: imports each normal variable `wght.css` once.
  `src/app/styles/index.css`: adds distinct programme font utilities and a body
  `100dvh` minimum-height with the existing `100vh` fallback. Classic's root
  font and palette tokens remain intact.
- Removed `public/fonts/{RobotoCondensed,GolosText}.ttf` and their two standalone
  OFL files after verifying the replacement. Fontsource packages retain licenses.
- `src/app/layouts/MainLayout.tsx`: both shells are minimum-height flex columns;
  Main grows and Footer is its following sibling. Existing Main route keys,
  transitions, Suspense and ScrollToTop remain. No provider/cache/auth changes.
- `ProgrammeHeader.tsx`, `ProgrammeFooter.tsx`, `ProgrammeHome.tsx`: Tailwind
  utilities replace layout, spacing, typography, surface and state CSS.
  `ProgrammeBrand.tsx` shares the exact brand treatment between header/footer.
  `ProgrammeFilm.tsx` keeps the cohesive film/artwork/screening presentation
  separate from Home's data/date orchestration without changing its logic.
- `src/app/layouts/programme.css`: reduced from 440 lines to 15 scoped-token
  lines. Font declarations, media queries and layout rules are removed. The
  broad `.programme-shell .rounded-2xl` override is replaced by focused feedback
  call-site utilities. No `@apply` abstractions are added.
- `PresentationSwitch.tsx`: a borderless Версія trigger and chevron open a
  presentation-aware dropdown. Menu radio semantics expose selection; keyboard,
  Escape, outside click, Tab dismissal and focus restoration are implemented.
  Classic mobile access is inside its existing navigation dialog; New mobile
  access is in secondary navigation below the primary links.
- `Header.tsx`: desktop/mobile dropdown placement, still excluded on booking.
  `presentation-switch.css` is removed entirely (21 lines).
- `tests/presentation.browser.mjs`: optional, repeatable Playwright regression
  function with isolated API fixtures and disposable contexts. Pass its contents
  as the browser tool's `code` argument if `filename` cannot access this workspace.
  No browser dependency or new runner is installed.
- `DESIGN.md` and `.impeccable/design.json`: update the actual font families and
  document the changed layout/style ownership and selector interaction.

### Live API diagnosis

Both local `.env` and `.env.production` configure
`VITE_API_URL=https://cinemaplatformapi.dev/api`. The value is present, valid,
and resolves to the same host as the committed Vercel rewrite destination.
DNS resolves `cinemaplatformapi.dev` to `64.226.93.109` at the time of inspection.

Actual Chromium requests to `/api/movies?pageNumber=1&pageSize=100`,
`/api/sessions?pageNumber=1&pageSize=1000`, and
`/api/halls?pageNumber=1&pageSize=100` fail with
`net::ERR_SSL_PROTOCOL_ERROR`, without an HTTP response. An independent Python
TLS probe receives `TLSV1_ALERT_INTERNAL_ERROR` from port 443. Plain HTTP port 80
returns a Caddy/Next.js HTML 404 for `/api/movies`.

The precise blocker is the configured host's TLS/connectivity failure before
HTTP. Its HTTP route also does not currently expose the expected cinema API.
This points to host/deployment/TLS routing rather than missing Vite config,
authentication, CORS response handling or DTO parsing. The evidence does not
establish whether the backend application behind that host is running.
No API URL, auth, services, fallback data or production error handling was changed.
The domain's TLS and API routing need to be checked by its deployment owner.

### Refinement verification

- `bun run build`: passed, with existing SignalR PURE-annotation warnings.
- `bun run test`: passed, 84 tests and zero failures. Bun still prints its
  pre-existing directory-mismatch diagnostic; exit status is zero.
- `bun run lint`: 18 errors, 29 warnings and one info, matching the captured
  pre-refinement baseline. No unrelated lint fixes were made.
- Focused lint/check of changed TSX components: passed.
- `git diff --check`: passed.
- Browser plugin is unavailable; the provided Playwright tools ran the new
  regression function successfully: 87 checks. It covers Classic/New desktop
  and mobile, dropdown input/dismissal/focus, localStorage persistence, shared
  form preservation, booking exclusion, short/loading/error/empty/long footer
  behavior and overflow at 320/390/768/1440px. New also passes 200% text at 768px.
- Before/after desktop/mobile captures retain the programme composition. With
  the same fixture, desktop lead title/row heights remain approximately
  266px/604px, and mobile approximately 83px/689px. The intentional mobile header
  difference is secondary version access outside the masthead's account row.
- Fontsource browser proof loaded Roboto weights 700/800 and Golos 400/600 for
  the requested Ukrainian specimen. Chromium platform-font inspection showed
  Roboto glyphs with Golos fallback; blocked-font requests retained readable
  fallback text without horizontal overflow. Classic still uses Montserrat.
- API 503 responses in browser tests are explicit test fixtures. Production
  data remains exclusively API-backed. Photographic parity captures use the
  temporary QA landscape from the initial review, not a shipped film asset.

Remaining limitations: the live programme cannot be verified until TLS/API
routing works. Physical-device/Safari/Firefox behavior, real screen-reader
announcement quality and browser-native zoom remain manual checks. Existing
pagination caps and movie-based booking handoff are unchanged. No payments,
reservation locks or authenticated backend mutations were exercised.

Suggested commit: `refactor(home): streamline vespre fonts, layout and version menu`
