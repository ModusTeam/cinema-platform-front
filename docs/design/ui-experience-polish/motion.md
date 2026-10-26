# Motion and future scrolling strategy

Current Phase 3 implementation and verification are in the [Home motion review](phase-3.md).
The sections below preserve the Phase 1 experiment and its original future plan.

## Implemented experiment

One ticket-inspired purchase CTA uses the installed `motion/react`: 180ms ease-out,
2px hover lift and .98 press scale. The dashed stub and two 4px edge notches are
native CSS, not animation dependencies. The whole 48px-high button is the target;
the stub is decorative. The keyboard outline stays intact by removing the mask
under `:focus-visible`. Click or Enter focuses the session heading. This is an
in-page specimen action, not checkout.

`useReducedMotion` removes transform feedback. The lab's CSS reduced-motion rule
also disables skeleton animation and CSS transitions. Content is visible without
reveal animation. No timer, autoplay, scroll snap or scroll interception is added.

Future ordinary interactions should continue using Motion/CSS: focus/hover
feedback, dialog transitions, image crossfades and a few scroll-linked transforms.
Keep DOM order and meaningful controls available before an animation starts.
Do not add filmstrip decorations to every form or table.

## Optional Lenis trial in a later phase

Lenis is **not installed**, and this phase adds no global scroll behavior.
The current app owns native document scrolling through MainLayout and
`app/ui/ScrollToTop.tsx`; that component currently resets pathname navigations to
the top. Any later enhancement must replace or coordinate that behavior rather
than run two scroll controllers concurrently.

Official references consulted:
[Lenis core documentation](https://github.com/darkroomengineering/lenis#readme) and
[React/Motion integration example](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md).
The documented React bridge disables `autoRaf` and calls `lenis.raf(timestamp)`
from Motion's frame loop, with the subscription cancelled on cleanup. Verify
the scheduler exports against the installed `motion/react` version when building
the trial; do not add `framer-motion` as a second animation package just to copy
the example import.

| Concern | Proposed integration rule | Required follow-up verification |
| --- | --- | --- |
| Eligibility | Opt in on selected cinematic public discovery routes, initially Home and Movie Details. Leave schedule/filter-heavy experiences native unless the trial adds value | Route entry/exit does not retain wheel handlers or stale RAF subscriptions |
| One clock | Choose one RAF owner. If Motion drives Lenis, disable Lenis autoRaf; feed timestamps in milliseconds and cancel the exact callback on cleanup | No duplicate loops under React StrictMode; scrolling remains smooth under image loading |
| Motion scroll linkage | First evaluate Motion `useScroll` against the actual scroll container. Bridge to Lenis scroll values only if measured synchronization requires it | Reveals track visual position; avoid state updates on every frame |
| Router PUSH/REPLACE | On a completed new route transition, resize measurement and scroll to top immediately; coordinate with existing ScrollToTop | Lazy route resolution and delayed poster dimensions do not cause jumps |
| Router POP/history | Store position by history entry key, not only pathname. Restore once content can support that position. Pick one owner of `history.scrollRestoration` | Back/forward between movie, list/filter state and home restores useful positions |
| Anchors | Allow hash navigation and browser URL history. Resolve async content before scrolling; account for fixed header offset using scroll-margin-top | Same-route/different-route hashes, direct deep links and keyboard activation |
| Focus | Scrolling does not substitute for focus management. Keep skip links and meaningful destination focus; avoid focusing every purely visual reveal | Keyboard/screen-reader reading order remains native |
| Reduced motion | Do not instantiate Lenis while reduction is requested. If preference changes, destroy the instance and retain current position | System preference changes during use; no residual transformed scroll offset |
| Nested containers | Keep date strips, tables, seat panning, dropdowns and other overflow regions native; mark known regions with documented prevent/data-lenis-prevent handling | Wheel, touch, keyboard and overscroll at container boundaries |
| Modals/header menu | Existing `useModalFocus` locks document overflow and traps focus. Pause the page controller while any modal is active; keep the modal's own scroll native; resume after final close | Nested dialogs, Escape, focus return, menu scrolling and background position |
| Booking/Checkout | Exclude `/booking/*` completely, including seat selection and completion. Preserve native horizontal panning, scroll-to-errors and existing hub behavior | No change in seat ownership, reconciliation, amount display or payment handling |
| Account/Admin | Keep native scrolling on profile, loyalty and all `/admin/*` routes. Sticky headers and tables do not need eased document scroll | Switching between public and admin tears down enhancement completely |
| Images/loading | Supply dimensions/aspect ratio and refresh measurements after relevant content changes; avoid continuous global observers without evidence | No scroll jump on late image/query results |
| Touch/inputs | Start with native touch scrolling; never capture input gestures or keyboard scroll to force an effect | iOS Safari, Android Chrome, date/time pickers, text selection and focused form fields |

Full-viewport features could later use `min-height: 100svh/100dvh` with generous
content allowance. Filmstrip transitions can use a clipped image wrapper driven
by scroll progress; avoid pinning essential copy or forcing a scroll stop.
No mandatory snapping, horizontal wheel hijacking or intercepting browser
navigation. GSAP + ScrollTrigger is not justified by any current interaction.

Start a Lenis trial only after a typography/surface decision. Measure the actual
route behavior and accessibility before expanding beyond one public route.
