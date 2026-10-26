# Color and surface inventory

## Current source of truth

`src/app/styles/index.css` defines a useful semantic foundation. The primary
problem is partial adoption, not the mere existence of several red values.

| Role | Current values/use | Assessment |
| --- | --- | --- |
| Main/card/hover | `#0a0a0a`, `#171717`, `#262626` | Coherent neutral hierarchy; preserve the dark identity |
| Muted/elevated surfaces | `#111111`, `#1c1c1c` | Useful roles, but local `bg-white/5`, `/[0.03]`, `/[0.035]` produce many effective shades |
| Brand | `#ef4444`, hover `#dc2626` | Recognizable; white normal-sized text on brand fill fails 4.5:1 |
| Primary action | `#dc2626 → #b91c1c → #991b1b` | Intentionally darker accessible fill; do not collapse into brand |
| Destructive action | `#b91c1c → #991b1b → #7f1d1d` | Separate role even where the red ramp overlaps primary |
| Errors | `--color-error: #ef4444`; red-200/300/400/500/600 local states | Text, tinted panel and action fill need different contrast, not arbitrary substitution |
| Success | `#22c55e` text, `#15803d` action; green/emerald locals in tickets | Successful state and success button are different contrast roles |
| Selection | `#321818` and brand border; local red-600 toggle fills | Needs consistent vocabulary; preserve selected indication independently of error |
| Neutral borders | `#404040` default, `#737373` field, white/5, /10, /20 | Field boundary is functional; repeated low-opacity borders are usually decorative |
| Other darks | Header `#050505`, TicketCard `#171717`, black overlays, zinc/neutral ramps | Tokenize recurring surface roles; keep black alpha on photographs when needed |
| Warning/tier/category | amber/yellow, `#f59e0b` loyalty notices, VIP yellow, sofa pink, sky maintenance | Distinct meanings. Do not recolor these red |
| Depth/effects | Hero shadows/glow, global radial wash/noise, glass-panel, local blur fields, shadow-lg/xl/2xl | Contextual image legibility is useful; passive badges and nested dark panels rarely need all of them |

Concrete locations and impact are in [audit.md](audit.md). This is a role
inventory, not an assertion that every literal color is a defect. Brand, error,
selection and destructive actions are not interchangeable, even within one hue.

## Proposed roles implemented only inside the lab

The scoped `[data-treatment='proposed']` block in
`src/app/design-lab/lab.css` is the executable proposal. No production `:root`
values were edited. Values are ordinary CSS variables, so the existing Tailwind
v4 `bg-[var(--bg-card)]` conventions continue to work.

| Role/token | Proposed value | Use |
| --- | --- | --- |
| `--bg-main` | `#0c0c0e` | Canvas |
| `--surface-muted` | `#131315` | Recessed field/quiet region |
| `--bg-card` | `#19191c` | Grouped content |
| `--surface-elevated` | `#222226` | Popover/dialog surface |
| `--bg-hover` | `#29292e` | Hover fill |
| `--text-main` | `#f4f4f5` | Reading text |
| `--text-muted` | `#b5b5be` | Secondary text |
| `--text-faint` | `#94949f` | Captions; still readable |
| `--color-primary` | `#e5484d` | Brand mark, selected edge, occasional accent |
| `--color-primary-hover` | `#ec5d61` | Accent links, never a small white-label action fill |
| `--action-primary` / hover / active | `#c52f3a` / `#b32732` / `#9e202b` | Purchase action |
| `--action-secondary` / hover / active | `#29292e` / `#34343a` / `#3e3e46` | Neutral supporting actions |
| `--action-destructive` / hover / active | `#a82732` / `#92202a` / `#7b1b24` | Explicit destructive action |
| `--color-on-primary`, `--text-on-action` | White (existing alias) | Filled action labels |
| `--selection-bg`, `--selection-border` | `#351b23`, `#e5484d` | Selected session, accompanied by check/pressed semantics |
| `--color-error` | `#ff929b` | Error text/icon, not a CTA fill |
| `--color-success` | `#78dbaa` | Positive state text |
| `--color-warning` | `#edc36c` | Warning text |
| `--border-default` | `#3c3c44` | Subtle decorative division |
| `--border-field` | `#777782` | Identifiable field boundary |
| `--focus-ring` | `#ffafb3` | Shared visible keyboard focus |

Success action fills continue using the existing accessible green ramp; no
success mutation is invented for the specimen. Tier/VIP/maintenance colors
remain domain roles rather than new copies of the brand ramp.

An optional future Tailwind alias can expose existing runtime variables without
duplicating values:

```css
/* Proposal only; not installed in the production theme. */
@theme inline {
  --color-canvas: var(--bg-main);
  --color-surface: var(--bg-card);
  --color-surface-raised: var(--surface-elevated);
  --color-ink: var(--text-main);
  --color-ink-muted: var(--text-muted);
  --color-brand: var(--color-primary);
  --color-action: var(--action-primary);
}
```

Do not create a second runtime palette or rename existing tokens across the app
just to obtain shorter utility classes.

## Solid-color contrast checks

Calculated with WCAG relative sRGB luminance, `(Llighter + .05)/(Ldarker + .05)`.
These checks describe token pairs; they are not a complete accessibility audit
of text over every movie image, disabled control or legacy production component.

| Foreground / background | Ratio |
| --- | ---: |
| White / proposed primary default | 5.47:1 |
| White / primary hover | 6.46:1 |
| White / primary active | 7.79:1 |
| White / destructive default | 7.00:1 |
| Muted / card | 8.62:1 |
| Faint / elevated | 5.28:1 |
| Field boundary / card | 3.96:1 |
| Field boundary / elevated | 3.58:1 |
| Focus / elevated | 9.08:1 |
| Main text / selection fill | 14.34:1 |
| Selection edge / selection fill | 4.03:1 |
| Error / card | 8.22:1 |
| Success / card | 10.45:1 |
| Warning / card | 10.54:1 |
| White / proposed brand red | **3.91:1: not suitable for small white-label buttons** |

Keep borders for fields, true separators and meaningful selected states. Remove
passive outer borders only where surface/spacing already establishes grouping.
The lab still uses the existing neutral session-control edge; before production
adoption, review non-text contrast of the complete control set, including neutral
session boundaries and secondary buttons. Focus is not replaced by hover or a
red edge. Do not apply this proposal globally until a direction is selected.
