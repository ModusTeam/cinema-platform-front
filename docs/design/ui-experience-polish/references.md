# Reference study and resource decisions

Design read: refinement of a Ukrainian cinema booking product, in its existing
dark cinematic language, using the current wordmark, Lucide icons and local film
artwork. The single exploratory motif is a ticket, already present in profile
tickets. Public discovery may be expressive; forms, booking and admin remain
task-oriented. No replacement visual identity or festival aesthetic is proposed.

The installed `.agents/skills/craftwork-assets/SKILL.md` was read. Its project-first
rule, typographic testing, consistent role colors, spacing-led grouping and
state/accessibility criteria informed the review. Its recommendations were not
treated as commands to remove purposeful imagery, gradients or motion.

## Live references inspected

Sources were opened on 26 October 2026. Browser captures and DOM style reads
used a 1440×1000 viewport. Values below describe that observation, not a stable
contract for third-party sites.

| Reference | Observed technique / measured detail | Borrow / intentional deviation |
| --- | --- | --- |
| [Siena Film Foundation](https://www.siena.film/) | Film stills dominate, ticket edges and compact credit groups repeat. Entry gate has a perforated ticket action. Browser DOM reports NB International for film labels at 20px/26px; heading declarations around 89.6px; ticket text uses Neue Brucke at 12px | Borrow the ticket's separation of label and stub; keep Cinema's red and rounded controls. Avoid copying the gate, proprietary fonts, branding or immersive scrolling structure |
| [A24](https://a24films.com/) | Artwork and typography carry hierarchy with limited chrome. Sampled navigation uses neueMontreal at 12px/12px within 36px-high links; first-screen title is intentionally much larger than a product UI heading | Borrow editorial discipline and quiet metadata. Do not copy its oversized title scale, navigation dimensions or page composition |
| [Lando Norris](https://landonorris.com/) | Distinct action feedback and transitions add personality. Sampled menu control is 60×60px, radius about 9.87px; transition declaration uses 750ms and cubic-bezier(.65,.05,0,1). Mona Sans Variable and Brier establish contrast | Borrow confidence in one authored interaction. Use the existing Motion stack and a shorter 180ms ticket response. Avoid cursor effects, WebGL scenes or branded color/lettering |
| [Craftwork's Siena curation](https://craftwork.design/curated/website/siena-film-foundation) | Public page and preview frame Siena as a cinematic image-led reference | Use as corroborating reference; the original live site supplied the interaction study |

The request specified techniques rather than layout reproduction. The specimen
uses existing Cinema components and conventions as its lead layout reference.
Siena contributes the ticket detail; A24 contributes information restraint;
Lando contributes motion character. None supplies copied code or imagery.

## Resource plan, closed

| Skill resource step | Outcome |
| --- | --- |
| Inspiration | Studied the three requested live sites and Craftwork curation, with screenshots and computed-style samples |
| Templates/layouts | Not needed: preserving the current product and composing an isolated specimen, not scaffolding a new site |
| Animated components | Craftwork MCP unavailable. Built a small Motion interaction using installed conventions, no copied marketplace implementation |
| Fonts | Used the three requested directions through Fontsource; evaluated actual browser text and glyph sources |
| Icons | Kept existing Lucide outline icons; no second icon family |
| Shaders | Rejected: no section benefits from adding another animated background |
| Mockups/backgrounds | Reused existing repository film still; no device mockup or third-party texture needed in the lab |
| 3D/illustrations | Rejected: the movie artwork already supplies the meaningful visual material |

Craftwork-specific MCP tools are not exposed in this session. The public API
catalog URL was attempted; the web reader rejected its `application/linkset+json`
content type. No private endpoints, paid downloads or quota workarounds were
used. The public reference sites remained available.

Impeccable's context launcher was attempted as an additional review aid; it could
not initialize its engine cache under the permitted environment. Project context
was read directly instead. No missing PRODUCT.md/DESIGN.md was fabricated, and
no abandoned exploration was imported.

## Mismatch ledger

| Reference cue | Experiment evidence | Decision |
| --- | --- | --- |
| Siena ticket perforation | Notches, dashed stub seam and small arrow in hero CTA | Keep as an isolated concept; remove mask on keyboard focus so outline remains visible |
| A24 sparse image presentation | Local still remains the full-width hero; passive badges and panel borders recede in proposed treatment | Keep gradients that make title legible; no empty image slot or generated filler |
| Lando expressive motion | Only CTA moves 2px on hover and scales to .98 on press | Intentional quieter motion for a booking product; reduce-motion removes movement |
| Broad display personality | B is expressive but wraps more at small widths | Recommend C for this product; no family is adopted globally yet |

No account memory, seasonal campaign page, extra font exploration or template
migration was created; none is needed to satisfy this bounded phase.
