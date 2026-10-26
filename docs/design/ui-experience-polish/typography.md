# Typography comparison

Recommendation: take **C, Roboto Condensed + Golos Text**, into the next review.
It adds a film-poster voice to headings and handles compact Ukrainian layouts
better than B. Keep the Cinema wordmark in Montserrat. No global font change is
made in this phase, and A remains a defensible lower-risk choice.

## Fair comparison

All captures share the local Fight Club still, movie content, 760px maximum hero
text width, layout, selected session, controls, surfaces and viewport dimensions.
Only font family changes between A/B/C. The toolbar and wordmark deliberately
stay Montserrat so experiment controls do not bias the specimen.

| Variant | Display | Body/UI | Browser assessment |
| --- | --- | --- | --- |
| A | Montserrat Variable | Montserrat Variable | Familiar and coherent. Wide forms and headings need space; current production heaviness comes partly from black weights and uppercase, not the family itself |
| B | Unbounded Variable | Onest Variable | Distinctive geometric display; Onest remains calm in forms. Broad headings dominate small utility sections. Short film title already wraps at 320px; long titles impose substantial height |
| C | Roboto Condensed Variable, Golos Text currency fallback | Golos Text Variable | Narrower display reads as cinema lettering. Interface text retains natural width. Stronger hierarchy without enlarging headings; best long-title fit in this experiment |

Fontsource variable packages are dev dependencies. Candidate imports use
`wght.css`, normal weights only, with Unicode-subset loading. The installed
Fontsource variable package does not provide the static-package `latin.css`
entry; no CDN or Google Fonts runtime calls are needed. Each package includes
its OFL license in `node_modules/@fontsource-variable/<family>/LICENSE`.

Sources: [Unbounded](https://fontsource.org/fonts/unbounded/use),
[Onest](https://fontsource.org/fonts/onest/use),
[Roboto Condensed](https://fontsource.org/fonts/roboto-condensed/use),
[Golos Text](https://fontsource.org/fonts/golos-text/use).

## Scale tested

- Hero: 52px at 1440px, 30.72px at 768px, 30px on mobile; weight 600,
  line-height 1.16, tracking −0.025em. No family-specific size adjustment.
- Section: 24px desktop, 22px mobile; weight 600, line-height 1.3.
- Movie card title: proposed 22px/1.3, weight 600. The existing two-line clamp
  remains, so the stress title is intentionally truncated in narrow cards.
- Reading text: 16px/1.65. Shared controls: 14px desktop; inputs become 16px
  on mobile. Captions/prices/format labels: 12px.
- Tables and session time controls use `font-variant-numeric: tabular-nums`.
  Native date/time controls were rendered as well as ordinary text labels.

Long-title specimen:

> Бійцівський клуб: спеціальний показ оригінальної режисерської версії

This is a synthetic stress title, labelled as such in the lab, not a claim about
a scheduled release. The normal title is “Бійцівський клуб”.

Measured hero line counts (height divided by computed line-height; rounded):

| Width | A long | B long | C long | Normal title |
| --- | ---: | ---: | ---: | --- |
| 1440 | 4 | 4 | 3 | One line in all variants |
| 768 | 2 | 3 | 2 | One line in all variants |
| 390 | 4 | 6 | 4 | One line in all variants |
| 320 | 7 | 7 | 4 | B wraps to two lines; A/C remain one |

The desktop hero has a larger type size than tablet, explaining why the same
long title can take more lines at 1440 than 768. Measurements are recorded in
[browser-results.json](browser-results.json), rather than inferred from font names.

## Ukrainian and currency verification

Specimen at both display and interface weights:

`Є є І і Ї ї Ґ ґ • п’ять • премʼєра • об'єкт • 0123456789 • 250 ₴`

This includes straight apostrophe U+0027, typographic apostrophe U+2019,
modifier-letter apostrophe U+02BC, Ukrainian uppercase/lowercase letters,
numerals and U+20B4 hryvnia. Chromium DevTools Protocol
`CSS.getPlatformFontsForNode` confirms the fonts that actually supply glyphs;
`document.fonts.check` alone would not reveal per-glyph fallback.

| Family / role | Result |
| --- | --- |
| Montserrat display and body | All specimen glyphs from the self-hosted font |
| Unbounded display | All specimen glyphs from the self-hosted font |
| Onest interface | All specimen glyphs from the self-hosted font |
| Roboto Condensed display, original stack | Ukrainian letters and apostrophes render; `₴` falls back to Arial |
| C with explicit Golos Text fallback | 63 glyphs from Roboto Condensed, 1 currency glyph from self-hosted Golos Text; no system fallback |
| Golos Text interface | All specimen glyphs from the self-hosted font |

The `Montserrat Thin` family name in CDP is the installed variable font's
internal name, not evidence that the CSS requested a thin weight. Computed
weights remain 500 in the display glyph specimen and 400 in the body specimen.

C's proposed display stack is therefore explicitly:

```css
font-family: 'Roboto Condensed Variable', 'Golos Text Variable', sans-serif;
```

Prices belong in Golos Text interface roles in normal use. Do not claim native
Roboto Condensed hryvnia coverage based only on a Cyrillic subset label.

## Review decision

Prefer C if the goal is a recognizable cinema voice without a larger visual
footprint. B is an expressive alternate suitable for occasional campaign
headings, but too broad as a general section-heading default here. A has the
smallest migration cost and benefits substantially from surface/weight cleanup.

Before production adoption, review with real long catalogue titles, paragraphs,
dialogs and admin rows; test Firefox/Safari and native input rendering. Native
date/time field presentation still depends on browser/OS conventions, even with
`uk-UA` locale. Do not replace native controls just to force a screenshot format.

Compare [all screenshots](screenshots/README.md). Keep production Montserrat
until this review checkpoint is resolved.
