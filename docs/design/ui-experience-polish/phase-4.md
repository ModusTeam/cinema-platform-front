# Phase 4: editorial Header and Ticket Menu

Review checkpoint: 27 October 2026. Branch: `feat/ui-experience-polish`, continuing
the work associated with PR #53 targeting `develop`. No commit, push, new PR or
merge was performed. Scope ends with Header, navigation and its Home scroll
integration; the temporary Design Lab remains.

## References and design decisions

Used the installed [Craftwork Design skill](../../../.agents/skills/craftwork-assets/SKILL.md).
Craftwork MCP was unavailable. Studied the supplied
[Craftwork Siena curation](https://craftwork.design/curated/website/siena-film-foundation)
and the actual live sites through Playwright, including opening Siena's menu.
The Browser plugin was unavailable; regular Playwright MCP supplied screenshots,
DOM measurements and interaction verification, including A24's mobile menu
opening and closing. Impeccable's context launcher
could not initialize its external engine cache; existing source and the previous
review documents supplied project context instead.

Design read: an editorial cinema navigation for Ukrainian visitors, with the
physical admission ticket as the single motif. Restrained motion and density;
the approved Phase 2 type and semantic colors remain the foundation.

| Source | Observed at 1440px | Application / deliberate difference |
| --- | --- | --- |
| [A24](https://a24films.com/) | Centered wordmark, balanced navigation, 24px side inset, approximately 77px header; navigation uses neueMontreal at 12px in 36px-high targets | 80px Header, 32px desktop / 16px mobile insets, centered existing Cinema wordmark on desktop, two primary links and plain account entry. Targets are at least 44px. |
| [Siena](https://www.siena.film/) | Upper-right paper ticket about 341px wide, 32px top inset, 103px close stub, circular cuts and perforations. Neue Brucke navigation at 32px / 28.8px line height, short offset reveals with observed stagger and transitions up to 800ms | A 520px ticket accommodates five Ukrainian destinations and account/support access. 80px close stub, real transparent corner/seam cuts, 48px desktop / 32px narrow navigation, faster 180–240ms transitions and 25ms item stagger. |

Reference captures: [A24](screenshots/a24-reference-header.png),
[A24 mobile menu](screenshots/a24-reference-mobile-menu.png),
[Siena open menu](screenshots/siena-reference-open.png).

Locked treatment: existing dark cinematic shell; scoped warm paper `#f5f1e8`,
ink `#201f1d`, muted print `#686259`, perforation `#9e9689`. Sharp edges and real
concave cuts, no paper texture download, decorative icon tiles or blur. Golos
Text interface copy and Roboto Condensed navigation retain the approved public
roles; Montserrat retains the Cinema wordmark. Existing primary red remains.

Resource plan, closed: live references supplied proportions; no template was
needed for this component replacement. Craftwork component export was unavailable,
so existing Motion supplied the small transitions. Retained existing fonts and
Lucide's close icon. Rejected shaders, mockups, raster textures, illustrations and
3D because this menu is typography and native CSS geometry. No assets were
purchased, generated or copied from the reference implementations.

## Architecture and behavior

- `Header.tsx` owns open state and route-change dismissal. Desktop links lead to
  Home's existing catalogue and `/sessions`; mobile exposes the menu without
  squeezing desktop links into its width. Account entry reflects authentication.
- `TicketMenu.tsx` portals the modal outside the application root. The existing
  `useModalFocus` owns focus, Escape, background isolation and the sole document
  overflow lock. The close button receives initial focus and remains outside the
  ticket's internal scroll area. Closing restores the existing trigger.
- `useIsPresent` makes the exiting menu inert and hidden from accessibility APIs
  immediately. Route navigation is immediate; the short exit does not delay it.
- `navigation.config.ts` holds the numbered primary destinations. Authenticated
  “Кабінет і квитки” reuses `/profile`, whose default tab contains tickets.
  Login, registration, logout, FAQ, phone and email retain valid existing workflows.
- `navigation.css` holds scoped paper/header roles, masks, perforation geometry
  and focus treatment. Tailwind handles layout, typography and responsive states.
- `SmoothDocumentScroll.tsx` subscribes to the actual root instance through
  `useLenis`. Its observer mirrors the shared body overflow lock using stop/start;
  it introduces no second lock or fixed-body scroll-position workaround. The
  subscription also handles Lenis mounting while a menu is already open. Existing
  Home-only loading, Motion frame clock, native touch and route restrictions stay.

The Header uses a restrained solid scrolled/public-page state. Home has a local
scrim so it remains readable over bright artwork. A white-field browser fixture
verified the final treatment; conservative link-text contrast at 64% scrim is
about 5.42:1. Scoped header ink/surface roles provide an extension point for
future editorial pages without retheming current routes.

No API, auth service, React Query, payment, booking lock, admin or TicketAction
implementation was changed. No dependency or lockfile change was needed.

## Verification

| Check actually run | Result |
| --- | --- |
| `bun run build` | Pass. TypeScript and Vite; existing SignalR annotation warnings remain. |
| `bun run test` | 86 pass, 0 fail. |
| `bun run lint` | Existing failure: 17 errors, 29 warnings, 1 info, identical to the captured Phase 3 baseline. |
| Focused `bunx biome check` on changed TS/TSX | Pass. |
| `git diff --check` | Pass. Git may emit line-ending conversion notices. |
| Production artifact inspection | One HTML entry; no Design Lab modules/HTML, stress fixtures, experimental Onest/Unbounded assets or lab CSS markers. |
| Fixture browser matrix | 163 passing checks; zero console/runtime errors and zero API mutations. |
| Additional lifecycle cases | 10 passing [edge checks](phase-4-edge-results.json). Includes the regression discovered when toggling reduced motion under an open menu. |
| Real API/browser | Separate [live environment report](phase-4-local.md); no mock interception. |

The [browser harness](phase-4.browser.mjs) follows the existing disposable-context
workflow. Pass its complete file content as Playwright MCP's `code` argument;
do not use an eval-based filesystem loader. The default endpoint is `:5175`.
Set the function's `edgeCases` option to true for the additional suite. The normal
matrix and [raw results](phase-4-browser-results.json) cover:

- 1440, 768, 390 and 320px; normal and reduced motion.
- Home top/scrolled, a standard public route, current-route links and navigation.
- Initial focus, Tab/Shift+Tab wrap, focus isolation, Escape, backdrop dismissal,
  restoration, 44px targets and hidden-menu removal.
- Body/Lenis lock and restoration, native scrolling outside Home, all configured
  public route patterns, simulated account access and token-clearing logout.
- Short-height internal scrolling, long Ukrainian identity text, keyboard use,
  active inertia, repeated toggles, history navigation and runtime preference
  changes. A stressed navigation label is fixture-only.

The first two browser loader attempts were rejected by automatic approval review
because filesystem-loaded code was not visible to the reviewer. The executed
approach supplied the complete bounded fixture code, allowing its read interception
and screenshot writes to be inspected. No rejected operation remains necessary.

## Screenshot review

All catalogue data in the fixture images is synthetic. Live captures are marked
separately below. The first visual pass corrected narrow-header crowding and
strengthened the ticket's seam cuts; the confirmation pass verified the final
silhouette, alignment, type and focus treatment against the reference captures.

| State | Desktop | Tablet | Mobile | Narrow |
| --- | --- | --- | --- | --- |
| Before | [Closed](screenshots/phase-4-before-closed-1440.png), [open](screenshots/phase-4-before-open-1440.png) | — | [Open](screenshots/phase-4-before-open-390.png) | — |
| Final closed | [1440](screenshots/phase-4-closed-1440.png) | [768](screenshots/phase-4-closed-768.png) | [390](screenshots/phase-4-closed-390.png) | [320](screenshots/phase-4-closed-320.png) |
| Final ticket | [1440](screenshots/phase-4-open-1440.png) | [768](screenshots/phase-4-open-768.png) | [390](screenshots/phase-4-open-390.png) | [320](screenshots/phase-4-open-320.png) |
| Scrolled | [1440](screenshots/phase-4-scrolled-1440.png) | [768](screenshots/phase-4-scrolled-768.png) | [390](screenshots/phase-4-scrolled-390.png) | [320](screenshots/phase-4-scrolled-320.png) |

Additional evidence: [short viewport](screenshots/phase-4-short-320.png),
[authenticated](screenshots/phase-4-authenticated-390.png),
[long label](screenshots/phase-4-long-label-320.png),
[white-field contrast](screenshots/phase-4-bright-header-1440.png).
Live: [Home](screenshots/phase-4-live-home-1440.png),
[desktop ticket](screenshots/phase-4-live-menu-1440.png),
[mobile ticket](screenshots/phase-4-live-menu-390.png),
[public desktop](screenshots/phase-4-live-public-1440.png),
[public mobile](screenshots/phase-4-live-public-390.png).

Limitations: Chromium and emulated viewport/touch checks; no Safari, Firefox,
screen-reader session, live login/refresh, payment or admin mutation verification
is claimed. Normal workers remain active in the requested local stack. Existing
out-of-date session data and About's external texture failure are recorded in the
live report. The optional Browser plugin would improve future in-app visual QA.

Suggested commit: `feat(ui): introduce editorial header and ticket navigation`
