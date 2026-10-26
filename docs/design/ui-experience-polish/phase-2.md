# Phase 2 production review

26 October 2026. Branch: `feat/ui-experience-polish`; existing PR context: #53,
target `develop`. Work remains local on the existing branch. No commit, push,
new PR, merge or next-phase work was performed.

## Production changes

| Surface/files | Result |
| --- | --- |
| `app/styles/index.css` | Adopted Phase 1 neutral surfaces, text, accent and semantic action/status palettes. Removed the failing third-party noise overlay; retained the radial wash and cinematic image gradients. |
| `app/styles/foundation.css` | 8px shared controls, medium action weight, functional secondary/selection borders, 44px minimum selections, explicit opaque disabled surfaces, visible 2px focus. Existing Button/Input APIs and field associations remain intact. |
| `app/styles/fonts.css`, `package.json`, `bun.lock` | Self-hosted normal variable Golos Text and Roboto Condensed. Moved these existing packages from development to runtime dependencies; versions unchanged. |
| `features/movies/ui/MovieCard.tsx` | 12px prices/formats, 14px genres, 22px title, 48px session links, neutral rating, 12px card corners, quieter grouping and wrapping technology labels. Preserved poster, overlay, future-session ordering/limit, URLs and navigation state. |
| `features/movies/ui/HeroSection.tsx` | Neutral rating/premiere treatment, calmer metadata/headline, unchanged image gradients and carousel controls. Extra top space below desktop prevents long titles colliding with autoplay controls. |
| `pages/public/HomePage.tsx`, `SessionsPage.tsx`, `widgets/movies-grid/ui/MoviesGrid.tsx`, `widgets/home/ui/PromoSection.tsx` | Adopted public font roles, removed duplicate filter frames/shadows, retained composition, filters, date scrolling, artwork and promo card. |
| `pages/account/ProfilePage.tsx` | Removed the disabled email field's local opacity/background overrides so shared disabled styling stays readable. |
| `features/admin/ui/SessionCard.tsx`, `PricingRulesEditor.tsx` | Corrected two status-color action fills to destructive/success action tokens so white action text remains legible with the lighter status palette. No mutation changes. |

MovieCard now displays a price only when supplied. An explicit `0` stays `0 ₴`;
an absent price leaves the session link available without a made-up amount.
This is display handling, not checkout calculation. The upstream technology
aggregation, including its existing `2D` fallback, is unchanged.

## Token decisions

Existing runtime CSS variables remain the sole production palette. No parallel
Tailwind palette or speculative component library was introduced.

| Role | Values |
| --- | --- |
| Canvas / muted / card / elevated / hover | `#0C0C0E` / `#131315` / `#19191C` / `#222226` / `#29292E` |
| Primary / secondary / faint text | `#F4F4F5` / `#B5B5BE` / `#94949F` |
| Brand accent | `#E5484D` |
| Primary action / hover / active | `#C52F3A` / `#B32732` / `#9E202B` |
| Secondary action / hover / active | `#29292E` / `#34343A` / `#3E3E46` |
| Destructive action / hover / active | `#A82732` / `#92202A` / `#7B1B24` |
| Success action / hover / active | Existing `#15803D` / `#166534` / `#14532D` |
| Error / success / warning text | `#FF929B` / `#78DBAA` / `#EDC36C` |
| Selected fill / edge | `#351B23` / `#E5484D` |
| Decorative / functional borders | `#3C3C44` / `#777782` |
| Keyboard focus | `#FFAFB3` |

`--color-primary-hover` deliberately aliases `--action-primary-hover`, rather
than the lab's brighter `#EC5D61`: existing consumers use that name for filled
buttons as well as links. Changing those button hovers to the bright proposal
would reduce white-label contrast. Default legacy brand-fill buttons remain a
known audit issue; this phase does not claim every local button is migrated.

Disabled controls use muted fill, faint text and a subdued border with opacity
1. Selected disabled buttons retain disabled styling. Selection borders stay
functional; passive card/technology/filter frames were removed. Hero pills and
the existing ticket, avatar and dialog proportions remain intentional exceptions
to the shared control radius. Tier, seat-type and occupancy colors are unchanged.

Solid-pair contrast tests cover all shared action states at 4.5:1, supporting and
status text on canvas/card/elevated at 4.5:1, field/focus indicators at 3:1 and
selection edges at 3:1. White on primary is 5.47:1; faint on elevated is 5.28:1.
This is not a whole-application WCAG certification or an image-overlay audit.

## Typography scope and visual assessment

Direction C is the provisional production candidate. Roboto Condensed supplies
expressive headings on Home (including the existing membership promo), Sessions
and MovieCard. Golos Text supplies supporting public UI, metadata and prices.
The opt-in roles use 36/48/60px display sizes, 24/30px section headings and 22px
card headings, all at weight 600. No forced uppercase or forced line breaks.

Montserrat remains the global default, Cinema wordmark, profile, booking, dense
admin UI and forms. The decorative member-card wordmark explicitly keeps it.
The new fonts add self-hosted font assets, but glyph subsets are loaded by the
browser only when required. Onest and Unbounded remain development-only.

Chromium's actual glyph-source inspection confirms 62 Roboto Condensed glyphs
and one Golos Text fallback glyph in the display specimen, and 63 Golos Text
glyphs in the interface specimen. The specimen includes Є/І/Ї/Ґ, three apostrophe
forms, numerals, punctuation and hryvnia. The explicit display fallback is
`'Roboto Condensed Variable', 'Golos Text Variable', sans-serif`.

Before/after visual review used the same local still, catalogue fixtures, dates
and viewport sizes. Artwork, poster proportions, gradients, carousel behavior
and purposeful motion remain recognizable. Smaller heading footprints and
neutral ratings give imagery more room; stronger functional borders improve
control recognition. The trade-off is a clearer outlined appearance for real
controls. The existing two-line card-title clamp remains; the full title is
available in the image alt text, details link context and title tooltip.
Long hero titles wrap fully and may increase the section's height.

Craftwork Design was used as a quality reference with the existing Phase 1
reference study. No Craftwork MCP tools were connected. Existing artwork,
Fontsource fonts and Lucide icons were retained; no new templates, imagery,
effects, shaders or paid resources were needed for this refinement.

## Browser verification and evidence

Vite: `http://127.0.0.1:5174`. Browser plugin unavailable; used Playwright MCP
Chromium, `uk-UA`, `Europe/Kyiv`, reduced motion, fixed browser clock
`2026-10-26T09:00:00Z`. API reads were intercepted; no backend/database needed.
Movies reuse the existing type-checked lab MovieDto fixture; wire session
responses use `price`, matching the adapter that produces `priceBase`.

| Check | Result / exact scope |
| --- | --- |
| Home, Sessions | Before and after at 1440, 768, 390, 320px; correct content, no framework overlay, no page overflow, no console/page errors in the intercepted runs. |
| MovieCard variants | Active, long title, coming soon, no sessions; visible focus, 48px session links. Ready/empty/loading captures for both routes at 320px. |
| Interaction loop | Soon → pressed state/coming-soon card; Schedule → tomorrow → empty → reset today → sessions restored; Shift+Tab/Tab → session outline. Long-film hero control → matching full h1. |
| Shared components | Actual Button/Input modules mounted in a disposable specimen outside lab overrides at all four widths. Unicode editing, associated hint/error, disabled input/action, loading action, selection and keyboard focus. |
| Button states | Primary default/hover/active are `rgb(197,47,58)` / `rgb(179,39,50)` / `rgb(158,32,43)`; disabled fill `rgb(19,19,21)` with opacity 1; focus outline 2px. All action variants captured together. |
| Profile | Synthetic authenticated settings at all four widths; email disabled and readable; headings retain Montserrat. No profile save sent. |
| Booking | Synthetic authenticated session picker at all four widths. **Step 1 only**; no seat selection, hub, locks, preview or payment verified in the browser. |
| Admin | Synthetic admin movie edit dialog at 1440/768px; fields render, description label associates, Escape restores trigger focus. No save/mutation sent; narrow admin viewports not tested. |
| Ukrainian fonts | CDP platform-font inspection verifies the actual glyph sources and explicit currency fallback. |
| API mutations | Zero in both successful browser helpers, including zero lock requests. |

See the [screenshot index](screenshots/phase-2/README.md),
[production results](phase-2-browser-results.json) and
[state/glyph results](phase-2-states-results.json). Screenshots were opened and
reviewed visually, including desktop, tablet, mobile, narrow mobile and targeted
protected screens. Review corrected long-hero control overlap and restored
explicit date/tab flex alignment; the final captures show the corrected code.

The optional [production helper](phase-2.browser.mjs) and
[state helper](phase-2-states.browser.mjs) are async expressions for Playwright's
code tool, like the Phase 1 helpers. Read the file into `run`, then call
`await run(page, { stage: 'after', outputDir: '<absolute screenshot directory>' })`
for the production helper; omit `stage` for the state helper. Start the README's
Vite command first. They are not executed by `bun run test`. The state helper
uses an identifier prefix when mounting its second React root to keep generated
field IDs separate from the hidden application root.

## Checks and remaining limits

| Command/check actually run | Result |
| --- | --- |
| `bun run build` | Pass after the final layout correction; TypeScript and Vite. Existing SignalR PURE annotation warnings remain. |
| `bun run test` | 86 pass, 0 fail, 9 files. Added observable MovieCard price tests and expanded existing semantic contrast tests. Existing Bun directory diagnostic and simulated-offline SignalR logs remain. |
| `bun run lint` | Same Phase 1 baseline: 18 errors, 29 warnings, 1 info. No additional findings; unrelated lint fixes deferred. |
| Focused Biome lint | Changed discovery/profile TSX and both changed/new test files pass. The two admin token-only edits retain their pre-existing findings. |
| `git diff --check` | Pass. Git may print existing LF/CRLF conversion notices. |
| Production bundle inspection | One HTML entry (`dist/index.html`); no lab modules/CSS markers, fixture IDs/stress-title text, lab HTML, exploratory screenshots, Onest or Unbounded assets. Golos Text/Roboto Condensed are now intentional production assets. |

No live API/auth refresh, real poster catalogue, SignalR/Redis locking, seat
geometry, checkout/loyalty calculations, payments or admin mutations were
browser verified. Those contracts and business hooks were not edited. Booking
seat/checkout surfaces and admin pages outside the movie dialog were reviewed
from source for token consequences, not claimed as end-to-end tested.
Firefox, Safari, real touch hardware and assistive technology remain untested.

Deferred: local brand-fill button migration outside shared controls, broader
public typography adoption, Movie Details/mobile purchase changes, booking
layout refinements, narrow admin structure, full toggle consolidation and any
scrolling enhancements. No Lenis, GSAP or Three.js installed.

## Required final-phase cleanup (do not do during Phase 2)

- Delete `src/app/design-lab` completely and
  `docs/design/ui-experience-polish/lab/index.html`.
- Remove exploratory screenshots, raw experiment results, fixtures, temporary
  browser helpers (Phase 1 and Phase 2) and derived comparison/review images.
- Remove unused experimental fonts/dependencies, including Onest/Unbounded
  unless later approved for production. Retain the production font packages.
- Retain necessary production code, useful automated tests and approved design
  documentation. Keep exploratory entries out of build inputs until deletion.

For now the lab remains available. Its `current` palette is explicitly frozen to
Phase 1 for comparison; its shared components follow current production source.
The actual `before-*` production screenshots are the historical visual baseline.
Hallmark and `.codex` files were not restored or created.

Suggested commit: `feat(ui): polish public discovery and shared control foundations`

Phase 2 stops here for review.
