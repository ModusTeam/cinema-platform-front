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

Paper roles remain local in navigation, movie-details, catalogue, account, auth and booking CSS:
paper #f5f1e8, ink #201f1d and muted ink #686259. Editorial rules use #c4bdb2;
Ticket Menu uses #9e9689 and hover #e6dfd2. Account ticket stock is #fffcf5,
with field borders #82796e, muted surface #eee8dd and elevated surface #e9e3d8.
Paper regions override focus to dark ink and keep a light native control scheme.
Do not turn these scoped roles into a global light theme.

Public information pages share `EditorialPageLayout`: open sections on dark
surfaces for About, Halls, Technologies and Careers; scoped paper for the Bar,
FAQ, recommendations and legal reading. `StaticPageLayout` keeps legal copy in
a 72ch reading column without a surrounding card. Use semantic specification
lists and aligned menu prices. FAQ buttons name their answer panels and closed
answers use native `hidden`; category filters expose `aria-pressed`. Presentation
changes must preserve static menu data and substantive legal/policy text.

Authentication uses the Account paper/ink roles and existing editorial fonts.
On desktop, a quiet dark introduction sits beside the paper form; narrow layouts
prioritize the form. Use square shared fields/actions, visible labels, associated
inline validation and accurate account copy. Keep native password autocomplete
and the existing safe booking return; registration confirms through the shared
toast before returning to Login, without authenticating automatically.

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

The public Footer closes the page with large editorial navigation on near-black,
smaller cinema/help links and a separate legal row divided by thin rules. Preserve
working destinations; omit social, store and recovery promotions without real
functionality. Header controls may wrap with enlarged text; its measured height
sets the content offset on non-Home routes. Ticket Menu keeps its paper geometry
with wrapping labels and a scrollable body at narrow widths.

Account, Loyalty, point history and Achievements share the scoped Account
paper/ink roles and editorial headings. Keep the membership card dark, tier
progress native and labelled, and transactions in a ledger with signed amounts,
operation labels, dates and server balances. Reuse achievement presentation in
Account previews; identify locked secrets only through public hints, and reserve
awarded-reward wording for unlocked achievements. Category and rarity labels are
Ukrainian; their API values remain unchanged.

Form dialogs compose `FormDialog` over `Dialog` and the existing modal focus
infrastructure. Keep headers and actions outside the scrolling form body, protect
dirty work on dismissal, disable submissions while pending, and retain input with
inline errors on failure. Use `ConfirmModal` for destructive actions. Dialogs use
dark semantic surfaces even when launched from scoped paper content.

Toasts use compact neutral surfaces with semantic icon accents and individual
live regions: urgent errors, polite routine feedback. Errors remain until closed;
other messages use severity-based timers paused on hover or close-button focus.
Deduplicate matching messages, cap the stack at four, preserve errors ahead of
routine feedback, and clear timers when items unmount. Important form errors also
remain inline; asynchronous import acknowledgement is informational.

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

Admin uses a dark Golos Text workspace with compact navigation, open KPI groups,
thin separators and dense tables. Shared Admin headers, scroll regions and
pagination live in `features/admin/ui`; retain the existing shared form and dialog
controls. Keep row actions visible and reserve red for brand and destructive
meaning. Session groups use schedule rows rather than animated cards.

Admin supports CSS viewport widths from 768px: a persistent 224px sidebar from
1024px and a modal navigation drawer at 768–1023px. Below 768px, `AdminLayout`
shows the dedicated unsupported-viewport state without mounting its Outlet.
Resizing restores the current route; this is a usability rule, independent of
`AdminRoute` authorization. Complex tables scroll internally. Admin retains
native scrolling and does not load Lenis.

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
Shared Header/Footer and authentication layouts were checked at 320px and 390px
with 200% root text; account content was checked separately. Root-font
enlargement is not browser-zoom or assistive-technology certification. Cross-browser
native date/input rendering still needs dedicated review. Do not infer available
screenings or recommendations from placeholder artwork or fabricated data.
Catalogue categories filter loaded pages only because the API has no status
filter; keep partial-results copy and explicit pagination. Schedule links pass
session navigation state; booking validates the screening against the requested
movie, time and status, then consumes the handoff once. Login accepts only internal
booking return paths. Home/Movie Details retain their bounded
aggregate previews. Native date/input rendering remains browser-dependent.
Payment integration and loyalty placeholders remain governed by the existing
backend-compatibility notes in AGENTS.md; this guide introduces no business rules.
