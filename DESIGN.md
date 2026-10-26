---
name: vespre. — New Home
description: Festival Signal identity in the approved Midnight Signal palette, scoped to New Home.
colors:
  midnight: '#14181F'
  chalk: '#F5F4EF'
  signal-blue: '#3260F5'
  selected-yellow: '#E9DC70'
  secondary-ink: '#4D5360'
  link-blue: '#3260F5'
  divider: '#A5A6A3'
  artwork-fallback: '#E3E3DF'
typography:
  display:
    fontFamily: 'Roboto Condensed Variable, Golos Text Variable, sans-serif'
    fontSize: 'clamp(3rem, 5.8vw, 5.5rem)'
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Roboto Condensed Variable, Golos Text Variable, sans-serif'
    fontSize: 'clamp(1.875rem, 3vw, 2.75rem)'
    fontWeight: 800
    lineHeight: 1.06
    letterSpacing: '-0.025em'
  body:
    fontFamily: 'Golos Text Variable, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  screening-time:
    fontFamily: 'Roboto Condensed Variable, Golos Text Variable, sans-serif'
    fontSize: '2rem'
    fontWeight: 700
    lineHeight: 1.1
rounded:
  square: '0'
spacing:
  compact: '8px'
  small: '12px'
  gutter-mobile: '16px'
  section: '24px'
  gutter-desktop: '32px'
  masthead-gap: '48px'
components:
  screening:
    backgroundColor: '{colors.chalk}'
    textColor: '{colors.midnight}'
    rounded: '{rounded.square}'
    padding: '12px 16px'
  screening-hover:
    backgroundColor: '{colors.selected-yellow}'
    textColor: '{colors.midnight}'
  date:
    backgroundColor: '{colors.midnight}'
    textColor: '{colors.chalk}'
    rounded: '{rounded.square}'
    padding: '10px 18px'
  date-selected:
    backgroundColor: '{colors.selected-yellow}'
    textColor: '{colors.midnight}'
---

# Design System: vespre. — New Home

## Overview

**Creative North Star: "Festival Signal"**

The approved Midnight Signal treatment pairs a midnight cinema frame with chalk
film spreads, condensed Ukrainian titles and full-color film imagery. Blue rules
organize the programme; yellow identifies selection and provides screening hover
feedback. The character is editorial, direct and flat.

This document records the initial **New Home** implementation approved on
2026-10-26. Tokens apply inside `.programme-shell`, including its masthead and
footer; they do not redefine root styling or the Classic design system. Classic
is preserved and remains the initial default. Explicit Classic / New preference
persists locally. Unfinished shared pages retain Classic presentation; the
switch is omitted from booking. Administration remains unchanged.

**Key Characteristics:**

- Midnight structural bands and chalk reading surfaces.
- Condensed film titles paired with clear body text.
- Square screening actions with real time and hall labels.
- Broad lead composition followed by compact programme entries.
- API-provided artwork and quiet missing-image treatment.

## Colors

Midnight and chalk carry the composition; blue marks structure and yellow marks
selection or an action's hover response. Frontmatter is the normative color list.

### Primary

- **Signal Blue**: masthead and schedule rules, date-control boundaries and scoped
  action tokens. Ordinary detail links use the deeper **Link Blue**.

### Secondary

- **Selected Yellow**: selected dates, text selection and screening hover. Date
  selection also carries an underline, dark lower boundary and `aria-pressed`.

### Neutral

- **Midnight**: masthead, footer, lead screening band and primary text on chalk.
- **Chalk**: reading surface, labels on midnight and lead screening actions.
- **Secondary Ink**: body-supporting notices and missing-artwork labels.
- **Divider**: thin separators between programme entries.
- **Artwork Fallback**: quiet backing for absent or failed API imagery.

**The Surface Focus Rule.** Focus must separate from its local surface: the
implementation uses offset current-color outlines, with a chalk override for
links and buttons inside the midnight booking band.

## Typography

**Display Font:** Roboto Condensed Variable, followed explicitly by Golos Text Variable, sans-serif.
**Body Font:** Golos Text Variable, sans-serif.

Titles are uppercase, tightly tracked and naturally wrapping. Body copy stays
uncondensed. Screening times use tabular numerals. Full film titles remain in
the reading flow; no fixed title heights, clipping or horizontal type scaling.

### Hierarchy

- **Display:** frontmatter desktop lead size; mobile uses
  `clamp(2.375rem, 10vw, 4rem)` at widths up to 767px.
- **Headline:** frontmatter secondary title size; compact mobile entries use
  1.75rem. Titles share the same weight, tracking and line height as the lead.
- **Body:** frontmatter base size; descriptions use 1.55 line height and a 65ch
  maximum measure. Metadata uses weight 500.
- **Screening time:** frontmatter size and weight, with tabular numerals.
- **Navigation:** condensed 1.5rem, changing to 1.375rem on mobile.
- **Brand:** condensed weight 800, 3rem desktop and 2.375rem mobile, with
  -0.03em tracking. The identity is always lowercase **vespre.**, including period.

The fonts are provided by `@fontsource-variable/roboto-condensed` and
`@fontsource-variable/golos-text` (5.3.0), imported once through
`src/app/styles/fonts.css` using their normal `wght.css` entries. The application
font theme adds `font-programme-display` and `font-programme-body` utilities;
only New components apply them. Classic retains Montserrat Variable.

Roboto Condensed supports weights 100–900; Golos Text supports 400–900.
Both include Latin, Latin Extended, Cyrillic and Cyrillic Extended subsets with
`font-display: swap`. Browser proof loaded display weights 700/800 and body
weights 400/600 for `Єє Іі Її Ґґ ’ ʼ ₴`. Chromium's platform-font inspection
confirmed the explicit Golos fallback supplies the glyph missing from Roboto
Condensed. Blocking WOFF2 requests still leaves readable system fallback text.
The old TTF files, standalone license copies and New `@font-face` declarations
were removed; licenses remain in the installed Fontsource packages.

## Layout

New Home has a 1536px maximum container, 32px horizontal padding and 64px bottom
padding. At widths up to 767px it uses 16px gutters and 40px bottom padding.
The repeated spacing rhythm is recorded in frontmatter.

The desktop lead uses 2fr / 3fr copy-and-artwork columns. Its midnight booking
band spans both columns, integrating wrapping dates and screening actions. At
1100px and below, the lead stacks. Standard entries use image, copy and screening
columns; at 1100px screenings move below. At 767px and below, secondary entries
use a compact 0.7fr / 1.3fr image-and-copy grid, with full-width times beneath.
Mobile secondary artwork has a 3:4 crop; lead artwork uses 16:8. Desktop artwork
uses 16:9 with `object-fit: cover`.

The masthead wraps from brand/navigation/account to a mobile brand/account row
and full-width navigation. The compact version dropdown sits near account access
on desktop and below primary navigation on mobile. The footer stacks on mobile. At 1600px and above,
masthead and footer padding aligns with the centered programme canvas.

Both presentation shells are minimum-height flex columns, using `100dvh` where
supported with a `100vh` fallback. Main grows; Footer is its normal-flow sibling.
It reaches the viewport bottom on short pages and follows long content without
positioning, spacers or viewport-height calculations. Route transitions remain
on Main, and its existing Suspense boundary and scrolling behavior are preserved.

## Elevation & Depth

The New Home world has no card shadows, gradients or glass. Depth comes from
midnight versus chalk bands, film photography, type hierarchy and thin rules.
Shared feedback components inside New Home receive the scoped surface tokens;
their corners are made square at the feedback call sites rather than through a
broad override of every rounded component in the shell.

## Shapes

Square controls, rectangular imagery and straight separators define the form.
Screening actions have a one-pixel current-color border. Date controls have a
two-pixel lower boundary; the masthead has a four-pixel blue lower rule. These
boundaries communicate grouping and state without ornamental containers.

## Components

### Buttons

Date controls are square, wrapping buttons with a minimum 48px height and
frontmatter padding; mobile horizontal padding becomes 12px. Selected dates use
yellow with dark text, a dark lower boundary and an underline. Visible focus is
an offset two-pixel outline. Retry controls are underlined text buttons.

### Cards / Containers

Film entries are flat editorial articles separated by rules, with no individual
card background or shadow. A lead entry combines title/copy, API artwork and the
midnight booking band. Missing imagery displays a quiet film outline and
Ukrainian explanation rather than fabricated film art.

### Navigation

The masthead exposes Films, Schedule and Tickets, plus account access and the
borderless **Версія** trigger with a small chevron. Its flat dropdown offers
Classic and New as menu radio items, with a check and subtle background on the
active option. Enter/Space, arrows, Home/End and first-letter navigation work;
Escape restores focus, Tab continues normally and outside clicks dismiss it.
Classic uses its existing surfaces and restrained rounded menu. Classic mobile
access lives in its navigation dialog; Escape closes the dropdown first.
The control remains absent from all booking steps. Links underline on hover and retain offset visible focus.
The brand and film navigation use condensed type. Footer links use body type.

### Screening Action

A bordered time/hall/action link has a minimum 64px height, 12px internal gap
and frontmatter padding. Lead actions are chalk on midnight. Hover uses yellow
with dark text. Actions wrap and permit long hall names. Accessible labels
include movie, date, time, hall and the next step. Times are displayed in
Europe/Kyiv with page-level date context. Links retain the existing movie-based
booking route; the page explains that session selection happens again there.

### Feedback

Loading, empty results, failed requests and partial schedule/hall failures remain
distinct. Shared EmptyState and UnavailableState are reused with scoped colors.
Date changes announce date/time context and the returned screening count.
There are no New Home input fields or form-specific visual tokens to extend.

## Do's and Don'ts

### Do:

- **Do** scope this system to New Home and preserve Classic as the initial default.
- **Do** preserve full Ukrainian titles and allow controls and content to grow.
- **Do** pair selected dates with an underline and selected semantics.
- **Do** keep visible focus legible on each local surface.
- **Do** use API-provided film imagery and a quiet missing-artwork fallback.
- **Do** keep date, time and hall context readable beside screening actions.

### Don't:

- **Don't** replace root Classic tokens with the New Home palette.
- **Don't** add gradients, glass, card shadows, autoplay heroes or decorative tilts.
- **Don't** treat a visible screening as a promise of seats or price.
- **Don't** ship exploratory generated film rasters as production artwork.
- **Don't** clip titles or horizontally scale type to enforce a fixed composition.

Source of implementation evidence: the scoped tokens in
`src/app/layouts/programme.css`, font imports/theme in `src/app/styles`, and
Tailwind utilities in `ProgrammeHeader.tsx`, `ProgrammeFooter.tsx`,
`ProgrammeBrand.tsx`, `ProgrammeHome.tsx`, `ProgrammeFilm.tsx`, and
`PresentationSwitch.tsx`. Layout, responsive, typography, surface and interaction
styles live beside their TSX markup; no new `@apply` layer is introduced.
Historical concept boards establish composition only; their original blue
palette is superseded by Midnight Signal. No generated or static film raster
ships in New Home; all production film artwork remains API-provided.
