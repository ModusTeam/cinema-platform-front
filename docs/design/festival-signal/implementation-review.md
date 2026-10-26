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
