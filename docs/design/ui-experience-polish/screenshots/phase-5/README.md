# Phase 5 visual evidence

Captured through Playwright on 28 October 2026. These PNGs are review evidence,
not application assets. Fixture content never changes the real catalogue.

## Direct comparison

| Evidence | Link |
| --- | --- |
| A24 desktop details: measured text / poster composition | [Reference](a24-details-1440.png) |
| A24 mobile details | [Reference](a24-details-390.png) |
| A24 cinematic introduction | [Reference](a24-intro-1440.png) |
| A24 dark discovery imagery and title / year treatment | [Reference](a24-discover-1440.png) |
| Generated four-section design study | [Concept](concept.png) |
| Original HEAD composition, same normal fixture / media | [1440px](before-1440.png), [390px](before-390.png) |
| Final normal composition | [1440px](after-normal-reduced-1440.png), [768px](after-normal-reduced-768.png), [390px](after-normal-reduced-390.png), [320px](after-normal-reduced-320.png) |
| Legible desktop editorial and discovery viewports | [Details](review-editorial-1440.png), [Discover](review-discover-1440.png) |
| Legible mobile hero and editorial viewports | [Hero](review-hero-390.png), [Details](review-editorial-390.png) |
| Unmocked real catalogue page | [1440px](live-1440.png), [390px](live-390.png) |

## Full fixture matrix

Each row has full-page captures at all four required widths.

| Content / motion | 1440px | 768px | 390px | 320px |
| --- | --- | --- | --- | --- |
| Normal / motion | [PNG](after-normal-motion-1440.png) | [PNG](after-normal-motion-768.png) | [PNG](after-normal-motion-390.png) | [PNG](after-normal-motion-320.png) |
| Normal / reduced | [PNG](after-normal-reduced-1440.png) | [PNG](after-normal-reduced-768.png) | [PNG](after-normal-reduced-390.png) | [PNG](after-normal-reduced-320.png) |
| Long / motion | [PNG](after-long-motion-1440.png) | [PNG](after-long-motion-768.png) | [PNG](after-long-motion-390.png) | [PNG](after-long-motion-320.png) |
| Long / reduced | [PNG](after-long-reduced-1440.png) | [PNG](after-long-reduced-768.png) | [PNG](after-long-reduced-390.png) | [PNG](after-long-reduced-320.png) |
| Sparse / motion | [PNG](after-sparse-motion-1440.png) | [PNG](after-sparse-motion-768.png) | [PNG](after-sparse-motion-390.png) | [PNG](after-sparse-motion-320.png) |
| Sparse / reduced | [PNG](after-sparse-reduced-1440.png) | [PNG](after-sparse-reduced-768.png) | [PNG](after-sparse-reduced-390.png) | [PNG](after-sparse-reduced-320.png) |

Normal includes artwork, cast / roles, a supported trailer, a future screening
and two other catalogue films. The catalogue also includes archived / deleted
and duplicate entries to verify exclusions. Long replaces the title, adds five
paragraphs and long cast / role strings. Sparse omits poster, backdrop, cast,
trailer, genres and rating; only a past session and the current film remain.

Other states: [503 request failure](error-390.png),
[one other film](single-discover-390.png),
[activated trailer](trailer-active-390.png),
[200% text at 320px](text-200-320.png).
The enlarged capture also records existing Header / Footer overflow; the movie
article itself stays within its column.

Film image fixtures are cached from TMDB for repeatable QA, outside the
production entry. Dune poster:
`https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg`;
Dune still:
`https://image.tmdb.org/t/p/w1280/o869RihWTdTyBcEZBjz0izvEsVf.jpg`;
Arrival poster:
`https://image.tmdb.org/t/p/w1280/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg`.
The synthetic Dune catalogue fixture reuses the Dune still; these images do not
assert that the real local catalogue contains those films or artwork.
