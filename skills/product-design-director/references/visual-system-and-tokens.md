# Visual System and Token Handoff

Load when defining or extending color, type, spacing, shape, elevation, motion, or iconography, or when handing tokens to builders.

## Start from what exists

Inventory the repository's current tokens, theme files, and component library before proposing values. Extend the existing system unless a decision record justifies replacing it. Replacing a token set is a migration with a builder-owned rollout, not a design tweak.

## Token tiers

| Tier | Purpose | Example name | Example value |
| --- | --- | --- | --- |
| Reference (primitive) | Raw palette and scales; never used directly by components | `color.blue.600` | `#2456d6` |
| System (semantic) | Intent, theme-aware; what components consume | `color.action.primary.bg` | `{color.blue.600}` |
| Component (optional) | Only where a component must diverge from system intent | `button.primary.bg.hover` | `{color.blue.700}` |

- Name semantic tokens by role and state, not appearance: `color.text.muted`, not `color.gray-500-text`.
- Every semantic color used for text, icons, or boundaries declares its intended background pair so contrast can be verified per theme.
- Themes (light, dark, high contrast, brand variants) swap reference values behind the same semantic names; components should not know which theme is active.

## Color

- Define roles: surface levels, text (primary, secondary, disabled, inverse), border/divider, action (primary, secondary, destructive), focus ring, and status (info, success, warning, danger) each with background, foreground, and border variants.
- Verify contrast for each declared pair: 4.5:1 for normal text, 3:1 for large text (at least 24px regular or 18.66px bold), 3:1 for meaningful non-text boundaries, icons, and focus indicators against adjacent colors.
- Status is never color alone: pair with icon, text, or shape.
- Dark themes are designed, not inverted: reduce large-area saturation, express elevation with lighter surfaces rather than shadows, and re-verify every pair.
- Data visualization needs its own categorical and sequential ramps checked for color-vision deficiency and distinguishable without hue (labels, patterns, direct annotation).

## Typography

- Define a ramp of roles (display, heading levels, body, body-small, label, caption, code/numeric) rather than a list of sizes. Each role sets size, line height, weight, letter spacing, and allowed truncation.
- Pick a modular step deliberately (for example 1.125–1.25 for dense product UI, larger for editorial) and round to whole pixels.
- Body line height around 1.4–1.6; tighter for large headings; line length around 45–80 characters for reading text.
- Use tabular numerals for tables, prices, and timers.
- Sizes must scale with user text settings (rem/sp/Dynamic Type); specify which roles may wrap vs truncate at 200% text.
- Fonts need license confirmation for every platform shipped (web embedding, app bundling).

## Space, layout, shape, elevation

- Spacing scale on a base unit (commonly 4px) with named steps; component internals use smaller steps than layout gaps so grouping reads correctly.
- Layout grid per breakpoint: columns, gutter, margin, max content width.
- Radius scale tied to brand geometry; nested elements use radius = outer radius − padding to keep curves concentric.
- Elevation levels defined by purpose (raised, overlay, modal) with shadow and z-index tokens; avoid ad-hoc z-index values.

## Motion

- Motion explains change: spatial origin, state continuity, feedback. Decorative motion needs an evidence-backed reason.
- Duration tokens (for example fast ~100–150ms for feedback, medium ~200–300ms for transitions, slow reserved for large spatial moves) and easing tokens for enter, exit, and standard.
- Every motion specifies its reduced-motion behavior (crossfade or instant), and nothing essential depends on animation completing.
- Nothing flashes more than three times per second.

## Iconography and imagery

- One icon family, consistent stroke and grid; icons with meaning carry an accessible name or adjacent text.
- Imagery rules: subject, crop ratios per breakpoint, focal point, treatment, and the rights/source requirement for every asset.

## Handoff format

Deliver tokens in the format the repository already uses (CSS custom properties, Tailwind theme, Style Dictionary or DTCG-style JSON, Flutter `ThemeData`, React Native theme objects). When none exists, propose a DTCG-style JSON source with `$value`, `$type`, and `$description`, and state that the build pipeline is a builder decision.

Each token change in the handoff lists: name, tier, value per theme, intended pairing, rationale or decision record ID, and whether it is new, changed, or deprecated (with replacement).
