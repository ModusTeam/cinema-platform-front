# Festival Signal: refined visual direction

**Status: proposed for review, not approved for implementation.**
The user selected Festival Signal from the Film Programme concepts on
2026-10-26. That identity selection is settled. Palette treatments, refined
mockups, and values below remain proposals. PRODUCT.md owns product truth;
`../cinema-experience-brief.md` owns the UX scope. This is not DESIGN.md or an
implementation direction contract.

## Deliverables and recommendation

- `palette-comparison.png`: three related color treatments of the same intended
  desktop composition, using the refined desktop as a reference.
- `home-desktop.png` and `home-mobile.png`: refined Original Festival Signal.
- Matching JSON files contain exact generation prompts and unapproved status.
- `contrast-report.json`: calculated contrast for the proposed opaque colors.

Recommend **Original Festival Signal**. Its emphatic blue frame, condensed titles,
and cinematic photography retain the selected identity with sufficient contrast
for its intended text roles. Deep Cobalt is calmer but less energetic; Midnight
is more subdued and requires stricter separation of blue accents from dark text
surfaces. This recommendation does not select a palette on the user's behalf.

## Palette treatments

| Treatment | Structural surface / blue | Content surface | Text | Selection |
| --- | --- | --- | --- | --- |
| A. Original, baseline | Ultramarine `#173FE5` | Chalk `#F5F4EF` | Near-black `#14181F` | Lemon `#F3E45A` |
| B. Deep Cobalt | Cobalt `#1736A6` | Same chalk | Same near-black | Muted yellow `#DDD075` |
| C. Midnight Signal | Near-black `#14181F`; accent blue `#3260F5` | Same chalk | Near-black on chalk; chalk on black | Yellow `#E9DC70` |

Original and Deep Cobalt use blue for the masthead and screening strip, with
chalk labels. Midnight uses near-black for those same regions, chalk labels,
and blue as an accent line or control boundary. It retains chalk film-content
surfaces. All three keep the same full-color film imagery, information hierarchy,
and intended geometry. Minor raster drift in generated views is not a design
decision or an exact color measurement; hex values here are authoritative for
this proposal. No gradients, glass, card shadows, or decorative effects.

Yellow marks an explicitly selected date, not the first unselected screening.
Selection also has a persistent dark underline and selected semantics. Screening
actions remain chalk with near-black labels. Do not equate visibility with seat
availability. Default functional secondary text on chalk is `#4D5360`.

## Contrast evaluation

Calculated from opaque token values with the sRGB relative-luminance formula;
these are not measurements of generated pixels. Threshold decisions use
unrounded results. See `contrast-report.json` for all pairs.

| Intended pair | Original | Deep Cobalt | Midnight |
| --- | --- | --- | --- |
| Chalk on blue | 6.62:1 | 9.02:1 | 4.62:1 |
| Near-black on chalk | 16.16:1 | 16.16:1 | 16.16:1 |
| Near-black on yellow | 13.60:1 | 11.31:1 | 12.66:1 |
| Blue against near-black | 2.44:1 | 1.79:1 | 3.50:1 |

Use at least 4.5:1 for normal text, 3:1 for large text, and 3:1 for essential
non-text boundaries as proposed implementation checks. The first two blue/black
pairs fail even the 3:1 boundary check. Midnight blue/black passes that boundary
check but fails normal-text contrast: use chalk labels on its black frame.
Its chalk/blue pair has limited margin; do not reduce opacity or assume nearby
shades pass. Yellow/chalk fails in every treatment: use dark labels and a dark
outline where a yellow control needs separation from chalk. Shared secondary
text on chalk measures 7.01:1.

Focus must remain visible on every surface: dark outline on chalk/yellow,
chalk outline on blue/black, with an offset that separates it from the control.
Do not reuse one global blue focus ring on every background.

Method and thresholds:
[W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
This evaluation is not accessibility certification. DOM order, keyboard use,
focus, text enlargement, motion, touch targets, and assistive technology remain
unverified until a running implementation exists.

## Typography and fitting

| Role | Proposed family / weight | Desktop | Tablet | Mobile |
| --- | --- | --- | --- | --- |
| Film display title | Roboto Condensed, 700–800 | 64–88px | 48–64px | 36–48px |
| Secondary film title | Roboto Condensed, 700 | 32–44px | 30–40px | 28–34px |
| Description | Golos Text, 400 | 18px | 16–18px | 16px |
| Metadata / navigation | Golos Text, 400 / 600 | 16px | 16px | 16px |
| Screening time | Roboto Condensed, 700 | 28–32px | 24–28px | 22–26px |
| Hall/date label | Golos Text, 500–600 | 16px | 16px | 14–16px |

Titles use roughly 1.0–1.08 line height; body copy 1.45–1.6. These are readable
starting ranges, not a command to shrink every title to fit a fixed box. Never
horizontally scale type, clip a title, impose a fixed text height, or make
controls condensed for the sake of style. The generated display face is an
approximation and must not dictate impossible proportions for the actual font.

Allow natural word wrapping and container growth. When a title needs more than
three lines at its comfortable size, switch that spread to stacked composition
before reducing it below the range. At narrow widths or text enlargement, let
screening actions stack and the page grow. Keep full titles in the reading flow.

Roboto Condensed and Golos Text are realistic self-hosting candidates: official
Google Fonts metadata lists Cyrillic and Cyrillic Extended subsets and variable
weight ranges of 100–900 and 400–900 respectively. Both publish OFL licenses.
They are not installed in this project. Local Arial Narrow and Roboto files are
available on the development machine, but are not web-delivery guarantees.

Metadata and licensing were checked; font binary retrieval from the shell failed,
so no exact glyph or shaping check is claimed. Before approval for implementation,
proof the chosen files with `Єє Іі Її Ґґ ’ ʼ ₴`, `Памфір`, `Тіні забутих предків`,
and a long-title specimen such as `Людина, яка хотіла залишатися собою` (explicitly
fictional fitting text). Include Latin titles, numerals, missing-font fallback,
and zoom. Preserve Cyrillic, punctuation, and the hryvnia sign when subsetting.

Sources:
[Roboto Condensed metadata](https://github.com/google/fonts/blob/main/ofl/robotocondensed/METADATA.pb),
[Golos Text metadata](https://github.com/google/fonts/blob/main/ofl/golostext/METADATA.pb),
[Roboto license](https://github.com/google/fonts/blob/main/ofl/robotocondensed/OFL.txt),
[Golos license](https://github.com/google/fonts/blob/main/ofl/golostext/OFL.txt).
No fonts or dependencies were installed.

## Composition, spacing, and responsive behavior

Use a 4px spacing unit, with 8/12/16/24/32/48px steps. Broad film spreads give
way to compact programme entries; no repeated cards. Align text, image edges,
and programme actions to deliberate shared columns. Use flat surfaces, square
corners, thin purposeful separators, and no text over busy photographs.

| Width | Proposed behavior |
| --- | --- |
| 320–767px | 16px page gutters. Two-row masthead: brand/account, then three equally accessible Films/Schedule/Tickets targets. Title and metadata stack above a compact 140–190px image. Dates remain understandable; screening controls wrap or stack. |
| 768–1199px | 24px gutters. Keep a two-column film spread only while full title and metadata fit comfortably; otherwise stack it. Let dates and screenings use separate rows. Do not squeeze mobile or desktop navigation into one cramped line. |
| 1200px+ | 32–48px gutters, roughly 1440px maximum reading canvas. First spread around 40% title / 60% imagery with at least 32px separation. One screening band groups dates and clearly separated film actions. Secondary entries are more compact. |

These are proposed breakpoints; content overflow takes precedence. Tablet is
specified, not visually tested. Preserve the important subject in image crops;
if source framing cannot survive a narrow crop, use a wider/shorter image.
Missing artwork gets a quiet title-bearing fallback, not fabricated film art.

Mobile navigation and primary controls target at least 48px height. Secondary
actions target at least 44px height with spacing. Do not encode touch sizes by
scaling a raster. Aim to expose a screening action early for typical titles;
never hide content or shrink functional text to guarantee a fold position for
all titles, languages, zoom settings, and viewport heights.

## Components, states, and interaction principles

- Masthead: persistent access to films, schedule, and tickets; current destination
  indicated by text/underline as well as color. Secondary links may use a menu.
- Film identity: full title, real genre/duration when available, concise synopsis,
  linked details, and cinematic imagery; factual metadata stays in readable type.
- Date selector: show day/month context, current selection and explicit access to
  more dates. One programme date is the default proposal; repeated date controls
  in generated secondary entries must synchronize rather than silently disagree.
- Screening group: full start time and hall, plus date context. One screening
  gets a normal full-size action; 2–4 wrap; larger groups provide a labelled
  expansion or all-times destination with every matching screening reachable.
  Do not silently truncate, require hover, or force a horizontal swipe to book.
- Zero screenings: explain whether this film has no scheduled showings or the
  chosen date/filter has none; offer another date where known. Failed requests
  use recovery messaging, not a false empty-programme state.
- Loading/partial failure: retain readable film content where possible; mark the
  affected schedule region as loading or unavailable. No stale availability claim.
- Date changes: maintain focus, update relevant results, and announce the update
  concisely. Controls stay stable while reading. Motion is brief (about 120–200ms)
  and user-directed; reduced motion removes movement without losing feedback.
- No autoplay hero, flashing, marquee, gradient transitions, or decorative tilts.
  Trailer playback is deliberate. Locking starts only in the existing booking flow.

## Confirmed future Classic / Festival boundary

This requirement is confirmed by the user; its implementation is not authorized.
Preserve the existing customer-facing interface as **Classic**, the initial
default. Introduce Festival Signal as a separate selectable presentation with a
clear user-controlled switch accessible from both versions. Persist an explicit
choice across visits; no prior choice, unavailable preference storage, or an
invalid saved value falls back to Classic. Do not change the default silently.

Both presentations share domain models, business logic, API integrations, query
state, authentication, booking, and payment behavior. Do not fork services or
create a second booking engine. Preference changes must not log users out,
discard form/booking state, or acquire/release locks. Keep the current shared
seat-booking and checkout workflows; admin experience is outside the switch.
Exact switch placement, persistence key, account-page coverage, and behavior
during an active transaction need a later implementation brief. No new URLs,
routes, switch UI, preference storage, or behavior are implemented here.

The earlier proposed selected-session handoff through login remains separate
future frontend work. This refinement authorizes no auth or routing changes.

## Review and verification limits

The selected identity is Festival Signal, not Programme Paper. Only the three
related palette treatments are being compared. Original remains the baseline;
the two standalone views use it, with no implication of palette approval.

All titles, imagery, descriptions, durations, dates, halls, and showtimes are
illustrative. The generated secondary-film metadata varies between views and is
not a content source. Eventual UI must use real API data. Never infer prices,
seat availability, formats, age limits, premiere dates, or urgency from these
rasters. No mockup becomes a production asset automatically.

Before implementation, review palette A/B/C, type feasibility with actual font
files, long-title/tablet fitting, and the Classic boundary. Browser contrast,
focus, keyboard, zoom, and responsive checks remain future work. Image integrity,
token arithmetic, prompt provenance, and documentation scope are the checks
performed here. No application build/test or browser workflow check was run.
