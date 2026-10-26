# Verification and limits

Flow under test: isolated development entry → font/surface/title/state selection
→ rendered comparison; ticket action → focused session picker → selected time;
profile edit → local acknowledgement. No server mutation is part of this story.

## Environment and evidence

- Vite dev URL: `http://127.0.0.1:5174`.
- Browser plugin: not available; used the available Playwright MCP browser tools.
- Chromium `156.0.4314.42`, locale `uk-UA`, timezone `Europe/Kyiv`, 1× scale.
- Widths: 1440, 768, 390, 320. Heights: 1000 or 844; full-page PNGs.
- Browser clock fixed at `2026-10-26T09:00:00Z`; comparisons use reduced motion.
- 24 font/width/title comparisons, 2 current-surface comparisons, 5 interaction/
  state captures and 6 production-entry fixture captures: **37 PNGs**.
- [browser-results.json](browser-results.json) contains computed typography,
  overflow, actual per-node font glyph sources, focus and motion results.
- [production-smoke-results.json](production-smoke-results.json) records actual
  unchanged public screens with intercepted API reads.

| Check | Result | Evidence |
| --- | --- | --- |
| Page identity | Pass | Exact lab title and one `.design-lab` root checked after navigation |
| Meaningful content / framework overlay | Pass | h1 visible; no Vite error overlay |
| Console and page errors | Pass, lab | Zero error messages/page errors in final isolated run |
| Network independence | Pass, lab | Zero unexpected external/API requests; candidates load from local Fontsource packages |
| Horizontal page overflow | Pass | All 24 typography combinations fit the viewport |
| Ukrainian glyph sources | Pass for pairings | No system fallback after explicit Golos Text fallback for C's ₴ |
| Keyboard focus | Pass | Tab/Shift+Tab yields visible 2px outline; CTA mask becomes none |
| CTA and time selection | Pass | Click and Enter move focus; first session selection changes aria-pressed and 16:30 status |
| Form specimen | Pass | Unicode name edited; native date/time fields render; submit displays local acknowledgement |
| Empty/loading states | Pass | Selector changes state; empty-state recovery restores actual MovieCard |
| Motion preference | Pass | Hover matrix translates −2px; reduced-motion transform is none |
| Production-entry isolation | Pass within scope | Home/Sessions/Details at 1440/390 keep Montserrat, no candidate font requests, no page errors or mutations |
| Build isolation | Pass | No lab HTML, candidate font asset or `.design-lab` CSS in dist |

Two exploratory issues were corrected before the final capture: candidate font
imports were aligned with the installed variable-package entry points, and C's
missing currency glyph received an explicit paired-font fallback. An ambiguous
test locator was also scoped to the typography combobox. The initial global
noise request produced HTTP 402; the lab disables it before stylesheet loading.
Production smoke intercepts this decorative asset and records that limitation.

The normal MovieCard's two-line title clamp is retained. Long titles truncate
there by design; the full heading and unconstrained specimen reveal complete
wrapping. No passing overflow check is represented as proof of untruncated text.

## Configured checks actually run

| Command | Result |
| --- | --- |
| `bun run build` | Pass: TypeScript project check and Vite production output |
| `bun run test` | Pass: 79 tests across 8 files, zero failures |
| `bun run lint` | Fails on existing source: 18 errors, 29 warnings, 1 info |
| `bunx biome check --write src/app/design-lab` | Pass: all 5 new TypeScript/TSX files, no remaining fixes/errors |

Sandbox file permissions initially prevented Bun from loading dependencies and
TypeScript/Vite from writing their existing caches. Dependency install, dev
server, build and tests were then run with the approved command escalation.
The successful test run still printed Bun's internal “directory mismatch”
diagnostic and expected simulated-offline SignalR logs, but exited 0 with all
79 tests passing. The build reports SignalR dependency PURE-annotation warnings.

Lint failures are in unchanged files: ScrollToTop, ChangeRoleModal,
CreateTechnologyModal, ImportMovieModal, seatSelection, useBooking,
useSeatOccupancy, AdminDashboard and AdminLoyaltyPage. The lab introduces no lint
errors. Existing files changed only in `package.json` and `bun.lock`; production
source files were not edited. Unrelated lint fixes are intentionally deferred.

## Reproduce browser captures

Start Vite with the README command and create the screenshot directory. The two
`.browser.mjs` files contain async function expressions for the available
Playwright `browser_run_code` tool, like the repository's existing accessibility
browser helper. They are not part of `bun run test`, and add no test dependency.

Read [capture.browser.mjs](capture.browser.mjs), assign its function expression to
`run`, then invoke it inside the tool function with an existing absolute output
directory:

```js
async (page) => {
  const run = /* contents of capture.browser.mjs, excluding its leading comments */
  return await run(page, {
    baseUrl: 'http://127.0.0.1:5174',
    outputDir: 'D:/PROGRAMMINGPROJECTS/cinema-platform-front/docs/design/ui-experience-polish/screenshots',
  })
}
```

Use [baseline.browser.mjs](baseline.browser.mjs) the same way for production-entry
captures. Paths are caller-supplied; the reusable helper does not hardcode the
workspace. Each helper creates and closes its own disposable context. API
fixtures for production captures exist only in Playwright network interception.
It passes actual movie DTO fields, paginated responses, session `price` (mapped
by the production adapter to `priceBase`) and hall summary fields. Navigation
documents are explicitly excluded from API matching.

## Limits

- Chromium only; Firefox, Safari, real touch hardware, native OS picker behavior,
  assistive technology, zoom and forced-colors were not tested.
- Lab fixtures are typed against the current frontend MovieDto/Movie/Session
  contracts, not validated against a running backend. Dates/prices/loyalty rows
  are illustrative. Reusing a film still as poster keeps the experiment local
  and comparable, but does not validate real poster crops.
- Existing public-page smoke is read-only and fixture driven. No live backend,
  login/session refresh, protected admin, Redis, SignalR lock or payment flow was
  browser tested. Existing Bun tests cover their configured units only.
- Account/admin/booking audit findings are based on inspected code. The lab's
  form/table/session specimens do not claim complete profile/checkout fidelity.
- The current/proposed treatments change the specimen board, not production
  routes. Production output remains single-entry; raw source deployment or a
  future multi-entry build must continue excluding the lab.
- Contrast ratios cover documented solid token pairs, not every image overlay
  and legacy control. Complete control contrast needs its own adoption review.

Phase 1 ends here. Production typography/palette adoption and any scrolling
implementation require the next selected direction. No PR or merge was created.
