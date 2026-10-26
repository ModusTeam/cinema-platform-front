# UI experience polish: Phase 1

Phase 1 below is a historical checkpoint. Production adoption is now documented
in the [Phase 2 review](phase-2.md), including the
[before/after screenshot index](screenshots/phase-2/README.md).
The lab remains temporary and excluded from the production build.

Review checkpoint, 26 October 2026. Working branch: `feat/ui-experience-polish`.
The brief names `ui-experience-polish` and `develop`; the existing checkout was
retained. No branch switch, commit, push, PR or merge was performed.

**Recommendation for review:** direction C, Roboto Condensed headings with Golos
Text interface text, using the proposed dark surfaces and red ramp. This is a
recommendation, not a production font or palette change. C needs the explicit
Golos Text currency fallback described in [typography.md](typography.md).

## Open the experiment

```powershell
bun install
bun run dev --host 127.0.0.1 --port 5174 --strictPort
```

Visit [the development lab](http://127.0.0.1:5174/docs/design/ui-experience-polish/lab/index.html).
Select A/B/C, current/proposed surfaces, normal/long title and ready/empty/loading
states. The ticket CTA moves focus to the session specimen; session selection,
profile edits and save acknowledgement work locally. No payment or reservation
is made. The original MovieCard links remain inside a MemoryRouter; they do not
open real details or booking screens. The menu icon only announces the specimen
sections; it is not the production menu.

Deep links:

- [A](http://127.0.0.1:5174/docs/design/ui-experience-polish/lab/index.html?variant=a)
- [B](http://127.0.0.1:5174/docs/design/ui-experience-polish/lab/index.html?variant=b)
- [C](http://127.0.0.1:5174/docs/design/ui-experience-polish/lab/index.html?variant=c)
- [Current surfaces, A](http://127.0.0.1:5174/docs/design/ui-experience-polish/lab/index.html?variant=a&treatment=current)
- [C, long title](http://127.0.0.1:5174/docs/design/ui-experience-polish/lab/index.html?variant=c&title=long)

This is a second Vite HTML entry under `docs`, not a React Router route. Its
guarded module lives in `src/app/design-lab`, so TypeScript and Biome check it.
The normal `index.html`, router, app providers and production styles do not import
it. `bun run build` emits neither this HTML, the lab CSS nor candidate font files.
Do not add this HTML to production Rollup inputs or move fixtures into `public`.
The project still requires its normal local environment to start production UI;
the lab itself imports no API configuration or credentials.

## Review material

| Deliverable | File |
| --- | --- |
| Code-level audit and prioritized opportunities | [audit.md](audit.md) |
| Color/surface inventory, proposed tokens and contrast | [colors.md](colors.md) |
| Browser-rendered typography, glyph verification and recommendation | [typography.md](typography.md) |
| Reference study and resource decisions | [references.md](references.md) |
| Motion and future Lenis integration | [motion.md](motion.md) |
| Verification, reproduction and limits | [verification.md](verification.md) |
| 37 labelled fixture screenshots | [screenshots/README.md](screenshots/README.md) |
| Raw lab metrics and rendered font evidence | [browser-results.json](browser-results.json) |
| Unmodified production-entry fixture smoke | [production-smoke-results.json](production-smoke-results.json) |

The lab is a specimen board composed from the existing hero/card/session/form/
loyalty vocabulary. It is not a proposed replacement homepage. A is the font
baseline; `current` is the surface baseline on this same board, not a pixel copy
of the production homepage. Separate `fixture-production-*` images show actual
unchanged Home, Sessions and Movie Details with intercepted read responses.
Every screenshot uses mock catalogue data. The local still is deliberately
reused as a cropped poster, not represented as an official poster.

## What changed

- Added the isolated lab HTML, app composition, typed presentation fixtures and
  scoped experimental CSS. Used the actual `MovieCard`, `Button`, `Input` and
  `EmptyState` components without editing them.
- Added four requested Fontsource families as dev dependencies; updated only
  `package.json` and `bun.lock` among existing files.
- Added this review material, reusable Playwright functions, raw results and PNGs.

Production UI, booking/checkout, API services, authentication and SignalR code
were left unchanged. No Lenis or GSAP package was installed. No external assets
were purchased or generated. The abandoned Festival Signal direction was not
used; no PRODUCT.md or DESIGN.md was found in the repository.

Build and 79 tests pass. Focused lab Biome checks pass. Repository lint fails on
18 existing errors in unchanged files; see [verification.md](verification.md).

Suggested commit, when approved:
`docs(design): add phase-one UI audit and isolated comparison lab`
