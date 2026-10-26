# The Film Programme: visual identity exploration

2026-10-26. Historical three-direction exploration. The user subsequently selected
Festival Signal for refinement; the earlier Programme Paper recommendation below
is superseded. No original mockup is an approved implementation specification.
See `../../festival-signal/visual-direction.md` for the approved Midnight Signal direction and implementation scope.
These are generated
raster concept boards, not running screens, responsive implementations, or a
production design system. PRODUCT.md remains authoritative; the selected UX
structure is recorded in `../../cinema-experience-brief.md`.

Each board pairs a desktop homepage with a separately composed mobile homepage.
All use the same illustrative film programme to support a fair comparison.
Images are stored here, outside `src` and `public`, with exact generation prompts
in matching JSON sidecars. The native image tool generated all imagery.

## Content and workflow provenance

No local film artwork was available beyond a WIP image; a read-only catalogue
request failed. Film titles are illustrative examples, generated images are not
actual film stills, and dates, halls, times, and short descriptions do not assert
actual screenings or verified catalogue content. Each board labels the programme
as demonstrational. Generated text may require correction in a later design pass.

The Impeccable context launcher could not load its missing engine. This exploration
uses the documented direct-context fallback and native image generation. It did
not install the engine, start a decision server, or enter a build phase. The
existing standing code-first preference was not changed: the user explicitly
requested visual concept images for this exploration, not a workflow default
change. No DESIGN.md or direction contract was created.

## A. Programme Paper — recommended

Board: `a-programme-paper.png`.

- Art direction: contemporary printed cinema programme, with warm ivory
  `#F2EBDD`, olive-black `#20251F`, forest green `#3F513F`, and restrained rust
  `#A4492B`. Film photography supplies most of the color and atmosphere.
- Type: expressive upright editorial serif for titles and a humanist sans for
  controls. PT Serif/PT Sans are candidate references, not installed or approved
  fonts. Clear tabular time numerals; metadata stays quieter than film names.
- Desktop: large first film/image spread, quieter text column, fine separators,
  and a compact second entry with a different image scale and placement.
- Mobile: title, shorter image, short synopsis, broad showtime actions; maintain
  a visible date context and prevent long titles pushing actions out of reach.
- Navigation: direct text destinations on desktop. The generated mobile header
  hides Films/Schedule behind a menu; a later revision must expose both, while
  retaining ticket access, to meet the UX brief.
- Motion proposal: brief image reveal and gentle state transitions on date
  changes, without automatically changing the film or moving reading content.
- Strength: the most balanced marriage of film discovery and practical booking;
  adapts to varied film imagery without making every entry a visual spectacle.
- Trade-off: can resemble a cultural publication if metadata and time actions
  become too restrained. Rust links and fine rules need contrast verification.
  Small mobile metadata must not inherit its rendered size literally.

## B. Festival Signal

Board: `b-festival-signal.png`.

- Art direction: contemporary festival graphics using ultramarine `#173FE5`,
  chalk `#F5F4EF`, near-black `#14181F`, and spare lemon `#F3E45A`. Flat planes,
  strong alignment, hard edges, full-color film images; no glass or ornamental
  effects.
- Type: large condensed Cyrillic sans titles with a readable neutral sans for
  body text and controls. Roboto Condensed/Golos Text are provisional references.
- Desktop: oversized title/image spread with an integrated high-contrast
  programme band. Subsequent films become more compact editorial rows.
- Mobile: reflow title, image, and screening band into one column. Showtimes
  remain visually emphatic; surrounding content is intentionally quieter.
- Navigation: explicit Films/Schedule/Tickets destinations in a solid masthead.
  The generated mobile navigation is too small; later work must reflow it into
  readable touch targets rather than shrink desktop navigation.
- Motion proposal: short directional changes for date selection and restrained
  image cuts. No flashing, marquee, rapidly changing color, or animated headlines.
- Strength: most assertive identity and strongest screening-action visibility.
- Trade-off: oversized condensed titles dominate film images and make long
  Ukrainian titles harder to fit. The generated spread crowds its title/image
  boundary. Retain readable body text and metadata, which are too sparse here.
  Yellow is an emphasis surface, never low-contrast small text on chalk.

## C. Velvet Interval

Board: `c-velvet-interval.png`.

- Art direction: deep aubergine `#2A1B2B`, pale peach `#F4DDD1`, and mauve
  `#C8B6C7`, with luminous full-color film imagery. The intention is an intimate
  cinema identity rather than black/red streaming-service styling.
- Type: italic editorial serif for display titles; plain sans for information
  and showtimes. PT Serif italic is a provisional character reference, not a
  mandatory font. Body text never uses extended italics.
- Desktop: off-center image/text diptych and a pale screening band beneath the
  film information. Secondary films retain restrained photographic rows.
- Mobile: title and short summary, a smaller image crop, then screening actions.
  Navigation is explicit; dates remain outside the image.
- Motion proposal: slow, short opacity transitions on user-directed image or
  date changes, with stable controls and immediate reduced-motion equivalents.
- Strength: strongest intimate atmosphere and visual continuity with a cinema
  visit; peach action surfaces separate practical choices from rich imagery.
- Trade-off: display italics are less easy to scan, especially for long titles.
  The generated mobile composition spends more vertical space before times.
  Mauve supporting text and fine rules need actual contrast checks; its rendered
  softness is not a reason to add background blur or glass effects.

## Comparison

These are design judgments, not measured usability or accessibility results.

| Criterion | Programme Paper | Festival Signal | Velvet Interval |
| --- | --- | --- | --- |
| Distinctiveness | Quiet, publication-led | Most assertive | Most atmospheric |
| Discovery usability | Best balance of image, story, times | Titles and actions dominate | Strong engagement, slower scan |
| Mobile | Straightforward reflow; expose primary nav | Excellent time visibility; enlarge nav | More title-height pressure |
| Accessibility risk | Thin rules/small secondary text | Condensed title density/tiny nav | Italics/muted text |
| Implementation feasibility | High; conventional semantic layout | High; careful title fitting | High; crop/vertical rhythm care |

Recommendation: carry A into a subsequent review, with explicit mobile
Films/Schedule navigation and verified body/metadata sizes. B is the stronger
alternative for a more emphatic identity; C favors atmosphere over programme
density. No direction, palette, typeface, or image has user approval yet.

## Shared boundaries and next review

- Use actual titles, genres, duration, imagery and scheduled sessions in any
  eventual implementation. The boards omit some metadata for legibility and
  cannot define the complete content contract.
- No prices, seat availability, urgency, age restrictions, or format guarantees
  should be inferred from these images. Discovery acquires no locks.
- Keep mobile/tablet/desktop public access, Ukrainian copy, readable contrast,
  text enlargement, keyboard focus, and reduced-motion behavior.
- Generated pixels cannot verify responsiveness, DOM reading order, contrast,
  focus, touch target size, date behavior, or booking functionality.
- Carrying sessions through sign-in remains a future frontend proposal; locking,
  payments, routing behavior, backend contracts, and administration are unchanged.
- Review A/B/C or request a revision before visual approval. Any next mockup
  should show real metadata and a long-title case, then discovery/detail states.
  Nothing in this package authorizes application implementation.

Verification: all three images were visually inspected in the image tool output;
file scope, PNG integrity, prompt provenance, and whitespace were checked. No
application tests or browser interaction checks were run for these documents
and concept rasters.
