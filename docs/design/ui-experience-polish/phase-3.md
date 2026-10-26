# Phase 3 Home interaction review

27 October 2026. Branch: `feat/ui-experience-polish`; PR context: #53, target
`develop`. Ready for visual review. No commit, push, new PR or merge performed.

## Changes and boundaries

The approved Phase 2 palette, fonts, shared actions, film selection and data
contracts remain the foundation. This increment changes Home presentation and
adds optional document smoothing while Home is mounted.

| Component / module | Responsibility |
| --- | --- |
| `widgets/home/ui/HomeScroll.tsx` | Reads the existing live motion preference; lazily loads scrolling inside a separate, null-fallback Suspense boundary. A failed enhancement import leaves the page visible with native scrolling. |
| `widgets/home/ui/SmoothDocumentScroll.tsx` | Official `lenis/react` root integration and official CSS, driven by Motion's frame loop. |
| `features/movies/ui/HeroSection.tsx`, `hero-section.css` | Keeps the query/selection hook intact; mounts scroll hooks only when a featured film exists. Refines imagery, title, spacing, controls and film transitions. |
| `widgets/home/ui/ProgrammeHeading.tsx` | One modest catalogue-entry transform/opacity transition. Cards and filters remain available throughout. |
| `shared/ui/TicketAction.tsx`, `ticket-action.css` | Native button with the shared primary action colors and a small ticket treatment. Used only for the featured booking action. |
| `app/ui/ScrollToTop.tsx` | Keeps existing resets on other pages and normal Home pushes; lets Home POP navigation and native hashes retain browser scroll behavior. |
| `app/layouts/MainLayout.tsx` | Only Home's lazy-route fallback reserves a viewport, preventing the footer from flashing into the first screen. Other route fallback heights stay as before. |

No API/query/auth/booking/payment/loyalty/admin business code changed. The ticket
still calls the existing handler and navigates to `/booking/{movieId}`, without
session preselection. Anonymous visitors retain the existing login redirect.
The lab, its fixtures and earlier screenshots remain temporary and intact.

## Lenis ownership and fallback

Installed `lenis@1.3.27` with Bun; updated `package.json` and `bun.lock` only.
The integration follows the [official React/Motion recipe](https://github.com/darkroomengineering/lenis/tree/main/packages/react).
`autoRaf: false` leaves Motion as the frame owner: one `frame.update` callback
passes its millisecond timestamp to `lenis.raf`, and cleanup calls `cancelFrame`.
ReactLenis owns destruction of its instance, observers, input listeners and root
classes. The extra keyboard/hash/history listeners are removed by the component.

Conservative `lerp: 0.16`, native touch (`syncTouch: false`), vertical defaults
and `allowNestedScroll: true` avoid touch inertia changes and nested-panel
interception. No snapping, pinning or horizontal-wheel conversion was added.
Native anchors are deliberate (`anchors: false`): browser URL, focus and history
behavior stay intact. Native keyboard/hash/history events cancel outstanding
inertia at the current position rather than forcing a new position.

Only Home imports the component. Reduced motion prevents its import on initial
entry and unmounts it when the preference changes at runtime. Other public
pages, auth, account, booking and admin do not mount it. A blocked enhancement
module was explicitly tested: content and native document scrolling survived.

## Hero, transition and ticket

Desktop uses a 90svh minimum with natural growth, a narrower upcoming-film rail
and a title around 95px at 1440px (600 weight, existing Roboto Condensed). Existing
image gradients remain. Supporting copy uses Golos Text and the approved tokens.
Title/description entries last 360ms; the image crossfade lasts 450ms. The action
and selection controls retain their DOM identity during title changes.

One scroll-driven transition moves the desktop image by at most 64px and scales
it to at most 1.045. The programme heading moves 16px and goes from 0.8 to 1
opacity. Motion values handle progress without React state on each frame. No
content starts fully hidden. Below 1024px, image parallax is disabled; reduced
motion removes these transforms, copy animation and image-transition duration.
Mobile has a content-sized minimum rather than a forced full-viewport scene.
Long Ukrainian titles wrap completely and may increase the hero's height.

The ticket develops the Phase 1 experiment: 56px target, 56px icon stub, dashed
perforation and two 4px notches. It uses the existing primary fill, 8px radius and
native button attributes. The mask is removed on keyboard focus so the existing
2px outline remains complete. Mouse hover lifts 2px; press scales to 0.98; both
are absent under reduced motion. Details remains a standard shared action.
Direct links to the programme anchor and full schedule sit beneath the actions.

## References and resource decisions

Craftwork Design was used as a reference, honoring its existing-project rule.
No Craftwork MCP tools were connected; the public catalog could not be read by
the web tool. No asset, template, font, shader or paid resource was obtained.
Existing film artwork, Fontsource families, Lucide icons and tokens fit the brief.
No generated imagery, replacement layout, GSAP or Three.js was introduced.

| Live reference inspected | Applied / intentionally declined |
| --- | --- |
| [A24](https://a24films.com/) — lead composition reference | Measured a 225px / 180px-line-height hero heading at 1440px with about 1379px width, neueMontreal, over a full-frame film still. Borrowed image emphasis and title confidence, scaled down to retain cinema metadata and booking usability. Kept Cinema's navigation and carousel composition. |
| [Siena](https://www.siena.film/) | Inspected its dark entrance and ticket CTA; sampled film headings at 89.6px with Neue Brucke. Borrowed restrained ticket edges. Declined an entrance gate and duplicated animated typography. |
| [Lando Norris](https://landonorris.com/) | Inspected the image-led animated entrance and live DOM; visual brand lettering differs from its accessibility headings. Declined the bright palette, loading gate and extensive immersive effects. No pixel-size claims for its hidden h1. |

Style lock: Phase 2 dark surfaces and red primary; existing condensed display /
Golos interface roles; spacing instead of extra passive frames; no new shadows
or decorative textures; one modest scroll transition; shared visible focus.
Reference screenshots are indexed with the project captures.

## Browser verification

Browser plugin not available; used the existing Playwright MCP Chromium workflow
against `http://127.0.0.1:5174`, `uk-UA`, `Europe/Kyiv`. Read-only API fixtures use
the existing lab movie and still. Catalogue dates stay at 26 October for Phase 2
comparison. The new helper fixes Date only: Playwright's clock shim froze WAAPI
crossfades in this environment, so animation/performance clocks stay native.

The flow under test: Home entry → featured-film controls, programme navigation,
scrolling and route exit/reentry → correct content, focus, motion and cleanup.

| Check | Result |
| --- | --- |
| Page identity / meaningful content / framework overlay | Pass at 1440, 768, 390 and 320px in normal and reduced motion. |
| Layout / long Ukrainian titles | Pass at all four widths and both preferences; full h1, actions below title, no Home horizontal overflow. |
| Keyboard focus | Ticket receives Tab focus with a 2px outline and no mask; 56px target. |
| Film controls | Manual selection and explicit autoplay pause work. Time-separated captures show two overlapping images during crossfade and one fully opaque image afterward. Existing selection/timer hook unchanged. |
| Actual wheel / scroll progress | A 620px wheel input progresses through intermediate positions to 620px; image transform and programme heading advance with it. |
| Keyboard / anchors | Home, PageDown, keyboard interruption of inertia, native anchor focus/hash, same-page Back, and direct hash entry pass. |
| Native nested wheel / touch | Nested panel moves 240px while document stays at 0; Chromium CDP touch gesture scrolls the document with no mobile image parallax. |
| History / StrictMode cleanup | Back restores Home to 500px; Forward removes Lenis. Three additional same-document reentry/exit cycles retain exactly one / zero wheel listeners. Source review confirms one frame subscription with cleanup and `autoRaf: false`. |
| Runtime motion preference | Normal → reduce removes Lenis/listeners and transforms while native wheel works; reduce → normal mounts one instance. |
| Route exclusion | Sessions, login, profile, loyalty, About and synthetic authenticated `/admin/movies` have no Lenis. Anonymous `/admin` redirects to Home as designed. Booking navigation is observed before the existing anonymous login redirect. No checkout is exercised. |
| Failure/loading/empty states | Captured all three; failed catalogue retry restores cards. Blocking the optional scrolling module preserves Home and native scrolling. |
| Console / mutations | Zero unexpected errors and zero mutations. Thirteen expected console messages came from deliberate module failure and 503 fixtures. |
| Ticket mouse states | Separate mouse-capable probe verifies -2px hover, 0.98 press and no reduced-motion transform. |

The [screenshot index](screenshots/phase-3/README.md) includes matched before/after
full pages, normal/reduced first screens, long titles and timed motion frames.
[Full results](phase-3-browser-results.json): 72 passing observations/checks.
[Mouse/performance probe](phase-3-probe-results.json): three passing checks.

Reproduce with `bun run dev --host 127.0.0.1 --port 5174 --strictPort`. Read
[phase-3.browser.mjs](phase-3.browser.mjs) into Playwright's code tool as `run`,
then call `await run(page)`. Use `await run(page, { probe: true, hasTouch: false })`
for desktop hover/press and startup-shift measurement. This optional helper is
not part of `bun run test`. Its output path is explicit for this Windows checkout.
The existing Phase 2 helper supplied the matched before/after reduced-motion
comparison captures. No browser dependency was installed.

## Performance and final checks

Active hero imagery is eager/high priority with async decoding; inactive rail
images are lazy. MovieCard's existing lazy images remain untouched. The fixture
downloads one shared still, so this does not establish real-catalogue bandwidth.
No extra film scene or image preload was added.

The browser probe identified footer movement from the 60vh route fallback and a
50px loader-to-hero change. Home now reserves the viewport during route loading
and matches its hero loader to ready geometry. Final observed startup layout
shift sum was about 0.0002, from small font/header/filter changes. This is a local
fixture observation, not a field Core Web Vitals or Lighthouse score. Selecting
a much longer film title can still grow the hero naturally, as in Phase 2.

| Build artifact | Phase 2 baseline → Phase 3 (raw / gzip) |
| --- | --- |
| Home JS entry | 15.95 / 5.85 kB → 25.09 / 9.41 kB |
| Optional scrolling JS | New lazy chunk: 21.01 / 6.30 kB; skipped on initial reduced-motion entry. |
| Home / scrolling CSS | 2.35 / 0.84 kB and 0.46 / 0.23 kB respectively. |
| Shared app chunk | 317.10 / 104.78 kB → 317.46 / 104.96 kB. Rollup also extracts a 3.84 / 1.82 kB shared helper chunk; this table is not a whole-bundle delta. |

| Command actually run | Final result |
| --- | --- |
| `bun run build` | Pass, TypeScript + Vite. Existing SignalR PURE annotation warnings remain. |
| `bun run test` | 86 pass, 0 fail. Existing Bun directory diagnostic and simulated-offline SignalR logs remain. Removed one obsolete assertion requiring inline CSS in hero markup; browser tests now verify actual motion behavior. |
| `bun run lint` | Fails on 17 existing errors, 29 warnings, 1 info, compared with the captured Phase 2 baseline of 18 / 29 / 1. No new findings; changed source files pass focused Biome checks. |
| `git diff --check` | Pass; Git may print LF/CRLF conversion notices. |
| Production artifact inspection | One HTML entry; no lab modules/HTML, fixture stress title/IDs, lab CSS markers or experimental Onest/Unbounded assets in `dist`. |

Initial sandbox attempts denied generated cache writes and dependency reads;
the successful build/test runs used the approved expanded execution permission.

Known limits: Chromium only; touch is emulated rather than real hardware. The
same still is deliberately reused for fixture films; different real poster crops
and slow image downloads still need live-catalogue review. No screen-reader,
Safari/Firefox, live API/auth refresh, locks, checkout, payment or admin mutation
verification is claimed. The synthetic narrow admin surface has existing
overflow; its check proves Lenis exclusion only. No unrelated admin layout fix
was attempted. Optional Browser plugin installation would make future in-app
visual QA easier.

Suggested commit: `feat(ui): add cinematic Home motion and ticket action`

Stop here for Phase 3 visual review; no Movie Details, Booking or Admin phase,
and no final Design Lab cleanup.
