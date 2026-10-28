# Cinema Platform UI guidelines

## Design philosophy

Keep Cinema's dark cinematic shell and red branding. Public discovery combines
A24-inspired editorial spacing and image hierarchy with Siena-inspired physical
ticket details. Movie Details, catalogue/schedule and Account use scoped warm
paper surfaces. Booking pairs a dark seat map with a scoped paper order summary;
booking, checkout and admin remain task-oriented. Use actual film
artwork, readable metadata and restrained rules rather than decorative panels.

## Color and surfaces

The source of truth is `src/app/styles/index.css`; reuse its semantic variables.

| Role | Tokens and values |
| --- | --- |
| Dark surfaces | `--bg-main` #0c0c0e, `--surface-muted` #131315, `--bg-card` #19191c, `--surface-elevated` #222226, `--bg-hover` #29292e |
| Text | `--text-main` #f4f4f5, `--text-muted` #b5b5be, `--text-faint` #94949f |
| Brand | `--color-primary` #e5484d |
| Primary action | `--action-primary` #c52f3a, hover #b32732, active #9e202b; white labels |
| Other actions | Secondary #29292e / #34343a / #3e3e46; destructive #a82732 / #92202a / #7b1b24; success #15803d / #166534 / #14532d |
| Feedback | Error #ff929b, success #78dbaa, warning #edc36c |
| Selection | `--selection-bg` #351b23, `--selection-border` aliases brand |
| Boundaries and focus | `--border-default` #3c3c44, `--border-field` #777782, `--focus-ring` #ffafb3 |

Brand red is an accent; small white action labels use the darker action fill.
The legacy `--color-primary-hover` aliases `--action-primary-hover`.
Keep selection, destructive, error, VIP and maintenance meanings distinct.

Paper roles remain local in navigation, movie-details, catalogue, account and booking CSS:
paper #f5f1e8, ink #201f1d and muted ink #686259. Editorial rules use #c4bdb2;
Ticket Menu uses #9e9689 and hover #e6dfd2. Account ticket stock is #fffcf5,
with field borders #82796e, muted surface #eee8dd and elevated surface #e9e3d8.
Paper regions override focus to dark ink and keep a light native control scheme.
Do not turn these scoped roles into a global light theme.

## Typography and Fontsource

`src/app/styles/fonts.css` self-hosts normal variable fonts with `font-display:
swap`. Golos Text is the editorial interface/body family. Roboto Condensed is the
display family with an explicit Golos Text fallback for the hryvnia sign.
Montserrat remains the global fallback, Cinema wordmark and dense legacy UI.
Account explicitly opts into the editorial families. Keep Ukrainian glyphs,
apostrophes and currency coverage when adjusting imports or subsets.

Use the existing `font-public`, `type-public-*` and `type-*` utilities in
`foundation.css`; scoped page headings use fluid sizes. Preserve wrapping titles,
readable body line heights and tabular numerals for times/prices. Avoid remote
font calls and experimental font families.

## Component rules

Compose existing shared controls, loaders, empty/error states and feature modules;
their contracts and ownership are documented in AGENTS.md. Prefer spacing and
thin rules for editorial groups. Reserve borders for controls, separators and
meaningful selection. Keep gradients where film-image legibility needs them.
Use real links/buttons, explicit active/disabled states and useful loading,
empty, error and retry presentation. Missing artwork must have a stable fallback.

## Ticket patterns

The shared `TicketAction`, Ticket Menu and digital tickets use CSS concave cuts,
perforations and a separate stub. The whole action is interactive; decorative
cuts and arrows never become extra focus targets. Preserve focus visibility
around masked edges. Digital tickets wrap full titles and expand through native
disclosure. Ticket geometry must grow with content and remain readable on mobile.
QR disclosure retains existing paid-order/valid-ticket eligibility, seat-to-ticket
association and ticket-ID payload; visual grouping is not an admission rule.

## Motion and scrolling

Use the installed `motion/react` and CSS for purposeful feedback, image emphasis
and transitions. Ticket feedback is a small lift/press; the menu uses short
reveals. Keep content available before animation and respect reduced motion,
including runtime preference changes. Avoid mandatory snapping and scroll gates.

Lenis is lazy-loaded **only on Home** by `HomeScroll`, with native fallback on
load failure or reduced motion. Motion owns its single frame loop (`autoRaf:
false`); cleanup removes subscriptions. Native touch, nested scrolling, keyboard,
hashes and Home history behavior remain available. The shared modal body lock
pauses Lenis. Movie Details, catalogue/schedule, Account, booking/checkout and
admin use native scrolling. Do not expand Lenis scope implicitly.

## Styling conventions

Use Tailwind v4 first for layout, spacing, typography and responsive states.
Reuse semantic variables and `cn` for conditional classes. Scoped CSS handles
ticket masks/perforations, local paper roles, fluid typography and authored
effects where utilities are less clear. Avoid parallel palettes, global
restyling, new animation stacks or dependencies solely for decoration.

## Accessibility and responsive behavior

Keep visible keyboard focus, logical DOM order, meaningful names and native
semantics. Dialog/menu focus trapping, Escape, return focus and document locking
use the shared modal infrastructure. Controls generally provide at least 44px
targets; mobile inputs use 16px text. Preserve readable contrast, full status
labels, long Ukrainian text, enlarged text, reduced motion and native scrolling.
Reflow ticket stubs, navigation and metadata without hiding essential content.
The risk-based verification and temporary-artifact policy live in AGENTS.md.

## Inspiration

- [A24](https://a24films.com/) and [film index](https://a24films.com/films):
  editorial hierarchy, open image presentation and quiet metadata.
- [Siena Film Foundation](https://www.siena.film/): cinematic imagery and physical
  ticket cuts/stubs.
- [Lando Norris](https://landonorris.com/): reference for deliberate interaction
  feedback, adapted to Cinema's quieter booking context.

These are technique references; retain Cinema branding, fonts and functionality.

## Unfinished decisions and constraints

Booking uses named steps, the backend's sparse seat geometry and server checkout
previews. Hide totals while a preview changes or fails; order creation alone never
confirms payment. Order results read the server status without issuing admission QR codes.
Shared Header/Footer have known narrow-width overflow
with 200% root text; account content was checked separately. Root-font
enlargement is not browser-zoom or assistive-technology certification. Cross-browser
native date/input rendering still needs dedicated review. Do not infer available
screenings or recommendations from placeholder artwork or fabricated data.
Catalogue categories filter loaded pages only because the API has no status
filter; keep partial-results copy and explicit pagination. Schedule links pass
session navigation state; booking validates the screening against the requested
movie, time and status, then consumes the handoff once. Login accepts only internal
booking return paths. Home/Movie Details retain their bounded
aggregate previews. Admin's fixed narrow sidebar remains a separate layout
constraint and needs dedicated authenticated review.
Payment integration and loyalty placeholders remain governed by the existing
backend-compatibility notes in AGENTS.md; this guide introduces no business rules.
