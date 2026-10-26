# Existing interface audit

Scope: refinement of the existing dark cinematic product. Evidence combines
source inspection with fixture-driven Chromium renders of Home, Sessions and
Movie Details, plus the isolated specimen board. Account, booking and admin
observations below are source findings, not claims of authenticated browser QA.

## Preserve these decisions

- Dark surfaces, the Cinema wordmark, red accent, film imagery and the existing
  navigation/page structure remain the visual authority.
- Hero image gradients provide legibility. They are purposeful, not automatically
  removable decoration. Preserve the gradients and responsive image crops.
- Header rolling lettering and restrained hero fades give the product character.
  Existing reduced-motion behavior, autoplay pause/focus/visibility handling and
  manual slide controls are useful foundations.
- Ticket perforations in `features/profile/ui/TicketCard.tsx:175` already belong
  to the product. A small ticket CTA extends that language naturally.
- Seat category colors (VIP yellow, sofa pink), maintenance/occupancy indicators,
  payment statuses and loyalty tiers communicate different domain concepts.
  They must survive any palette consolidation.
- Shared Button, Input, Dialog, EmptyState and UnavailableState already solve
  real responsibilities. Do not replace them with another component library.

## Findings and proposed improvements

Paths below are relative to `src/`. Line numbers refer to this checkout.

| Priority / issue | Where and evidence | Why it matters | Proposed improvement | Other components affected |
| --- | --- | --- | --- | --- |
| P1: action and brand usage drift | `app/styles/index.css:16,28`; `pages/admin/AdminSessionsPage.tsx:104` uses brand fill while shared Button uses action fill; Header login CTA also uses brand fill | White normal-size text on current `#ef4444` is only 3.76:1. Existing darker action tokens solve this, but local buttons bypass them | Adopt shared Button/buttonStyles for real actions after review; retain brighter brand red for accents | Admin create actions, navigation registration, loyalty achievement action; not every red badge |
| P1: movie-card metadata too small | `features/movies/ui/MovieCard.tsx:90,112`, 9px prices/technology; coming-soon badge 10px | Price and format are decision information. They are hard to read, especially at narrow card widths | Lab raises price and technology to 12px. Later give card sessions a consistent 44px control height, keeping actual backend prices | Home and Sessions share this card |
| P1: mobile details CTA is far down the page | `widgets/movie-details/ui/MovieDetails.tsx:118` hides hero action below sm; remaining action is in the later details panel | In the fixture 390px render, title is followed by plot, poster and metadata before the purchase action | Evaluate a visible hero action on mobile, or a compact sticky action respecting safe areas. Do not change booking eligibility/navigation logic | Movie Details only; sticky action would need keyboard/modal QA |
| P1: keyboard gaps in admin controls | `features/admin/ui/ChangeRoleModal.tsx:56,83` clickable divs; `CreateTechnologyModal.tsx:65` unassociated label; `pages/admin/AdminLoyaltyPage.tsx:79,161` buttons omit type | Real accessibility/behavior concerns, also reported by current lint | Replace role choices with native buttons/radios and associate field IDs; set explicit button types in a separate focused fix | Admin dialogs/forms; preserve mutation contracts |
| P1: third-party decorative asset fails | `app/styles/index.css:63-75` fixed noise overlay requests `grainy-gradients.vercel.app/noise.svg`; observed HTTP 402 | A global decoration introduces a network failure and external dependency on every screen | Prefer a small licensed local texture, or omit it if it is not perceptible. The lab disables it before CSS loads | All routes; preserve image gradients and useful contrast overlays |
| P2: many boxes express the same grouping | `pages/public/HomePage.tsx:48` filter plate contains individually bordered selection controls; `widgets/movies-grid/ui/MoviesGrid.tsx:99` repeats the pattern | Outer border, tinted container and inner borders all compete for the same role | Keep the selected state and useful field edges; let spacing group the parent. Do not remove focus outlines | Home/Sessions filters and profile tabs |
| P2: card border stack | `features/movies/ui/MovieCard.tsx:31,50,82,108,112` borders on outer card, rating, sessions, divider and each technology chip | Repeated outlines give ancillary metadata nearly equal prominence to the title/artwork | Lab removes passive card/technology edges and retains controls. Keep image badge contrast, simplify its shadow | Both catalogue entry points |
| P2: inconsistent rating meaning | Hero uses yellow star; MovieCard red star; MovieDetails green IMDb badge | Three semantic-looking colors for the same rating weaken color meanings | Use a neutral rating treatment across surfaces, reserving success green for actual success | Hero/Card/Details; no rating/data changes |
| P2: typographic scale overrides | `foundation.css` supplies `type-display`, but MovieDetails combines it with `text-5xl sm:text-7xl lg:text-8xl` and `leading-[0.9]`; Hero uses `font-black`; Home h2 uses tracking-wide uppercase | Page headings vary in weight, tracking and density. Long Cyrillic titles become large blocks | Trial display 30–52px/1.16 at weight 600 and balanced wrapping; section 22–24px/1.3. Select a font before migration | Public headings; admin should keep a quieter task-oriented scale |
| P2: emphasis effects accumulate | Hero premiere glow and large text shadows; Home filter shadow; TicketCard hover glow; loyalty tier-colored 600×400 blurred field | Film imagery, not each badge/panel, should lead attention | Lab keeps image overlays, removes badge glow and passive panel shadows. Retain a local cinema-screen light cue where it explains the screen | Hero, filters, profile/loyalty panels; review individually |
| P2: radii reflect locations more than roles | shared actions/fields 12px; MovieCard 16px; profile main 24px; booking ticket shell 24px; loyalty panels 8px; hero actions pill | Nested shapes do not consistently communicate control vs panel vs poster | Trial 8px controls, 12px panels/cards, round avatar/status indicators. Large ticket shells may retain purposeful proportions | Shared roles first; do not blindly replace every rounded-full |
| P2: profile surfaces nest deeply | `pages/account/ProfilePage.tsx:418` bordered main panel, bordered tab buttons, TicketCard/EmptyState inside; sidebar has independently boxed links | Sections and data cards compete; large empty areas inherit several outlines | Separate navigation with spacing; keep one container level and the actual ticket silhouette. Lab demonstrates quieter form/table grouping | Profile tabs, ticket history and empty panels |
| P2: loyalty duplicates selection styling | `features/loyalty/ui/LoyaltyCheckoutCard.tsx:46-73` hardcoded red toggle and border; `features/booking/ui/CheckoutToggle.tsx:22-38` similar but different radii/heights | Same select/toggle intent diverges from `.selection-control` and from other forms | Align state colors and switch dimensions. Extract a generic switch only if keyboard/ARIA behavior and actual consumers match | Loyalty preview and checkout presentation; leave calculation/server authority untouched |
| P2: booking has nested elevation | `features/booking/ui/SeatSelector.tsx:120` bordered rounded-3xl shadowed surface; `pages/booking/BookingPage.tsx:398` another shadowed shell in checkout | Heavy frames obscure grouping and waste narrow-screen space | Later remove redundant outer elevation, preserve sparse geometry, horizontal panning and screen orientation glow | Booking selection/checkout. No logic or geometry changes in this phase |
| P2: admin density at small widths | `app/layouts/AdminLayout.tsx:44,90` fixed 176px sidebar and matching main offset below lg; `pages/admin/UsersPage.tsx:113` clipped wrapper around wide table | At 320px only about 112px remains after sidebar and main padding. This is a structural constraint, not a border fix | Later use a collapsible admin navigation and explicit table overflow or narrow-screen rows | All admin routes; needs dedicated authenticated/device QA |
| P2: local form styling bypasses foundation | UsersPage search has custom field focus/radius; CreateSessionModal already uses `.field`, but its close Button overrides minimum size to zero | Input rhythm/focus and close targets vary between otherwise similar tasks | Reuse `.field` or Input and keep icon-button targets at 40–44px. Preserve Dialog focus trap/return behavior | Admin searches and modal headers |
| P3: broad/inert transition declarations | `TicketCard.tsx:92` transition-all, `LoyaltyDashboard.tsx:161` transition-all; several `animate-in` classes appear, but no dedicated animation utility dependency is declared | Broad transitions are hard to reason about; class names alone do not prove motion exists | Prefer explicit properties and inspect computed motion. Use installed Motion for a concrete interaction | Public and admin local motion; not a reason to install GSAP |
| P3: no generic Card component | Cards are domain compositions, whereas Button/Input/Dialog already have shared implementations | A speculative Card wrapper would conceal different needs without resolving them | Keep domain cards. Consolidate surface tokens and documented roles before considering a wrapper | No extra shared abstraction introduced |

## Quick wins after direction selection

1. Adopt existing accessible action tokens wherever a small label currently sits
   on brand red; fix admin keyboard/label defects in a separate change.
2. Raise catalogue price/format metadata to 12px and normalize hit areas.
3. Remove glow from the premiere badge and duplicate filter/container outlines.
4. Align rating treatment, neutral surfaces and a small set of corner roles.
5. Make the global noise texture local or optional and document its license.

These are recommendations only. A shared-token change affects many routes and
must be verified across those routes, even if its diff is small.

## Larger follow-up work

- Select typography and check real catalogue lengths, then migrate public type
  roles in one bounded pass. Keep admin dense UI readable rather than turning
  it into a movie poster.
- Improve mobile Movie Details purchase access and admin navigation/table layout.
- Unify toggle behavior after examining keyboard/ARIA requirements; preserve
  checkout preview and server-derived amounts.
- Trial public-only scroll enhancement separately, using [motion.md](motion.md).

No business defect was changed as part of this visual experiment. Current code
already includes payment-aware order/ticket labels, contrary to the older
compatibility note in AGENTS.md; do not infer missing status handling from that
note. This task intentionally leaves agent instructions and payment code alone.
