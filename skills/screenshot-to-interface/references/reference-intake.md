# Reference intake

Use this before measuring anything. A reference you misread at intake skews every later measurement.

## Reference register

| Ref | Source and owner | Rights basis | Viewport (CSS px) | DPR | Theme / locale | State shown | Must match / guide only |
| --- | --- | --- | --- | --- | --- | --- | --- |

- **Rights basis** is one of: own product, licensed design deliverable, public reference used as inspiration only, or unknown. Inspiration-only references shape structure and behavior, never brand assets or distinctive visual identity. If the basis is unknown, stop before reproducing anything protected.
- **Viewport and DPR:** read them from file metadata or device frames when present. Otherwise infer them: divide the image width by a candidate DPR and check that known elements come out at plausible CSS sizes (body text 14–18px, touch targets of at least 44px on mobile). Record that the value was inferred.
- **State shown:** loaded-with-data, empty, error, logged-out, and so on. One image proves exactly one state.

## What a screenshot proves and what it doesn't

| It proves | It does not prove |
| --- | --- |
| Arrangement and visual hierarchy at that size | Behavior at other widths |
| Approximate spacing, sizes, and colors (lossy) | Exact tokens, font files, or font metrics |
| Copy as rendered in that locale | Truncation rules, pluralization, longer translations |
| One interaction state | Hover, focus, pressed, disabled, loading, error, empty |
| Visible content | Data model, sorting, pagination, permissions |

Everything in the right column goes into the assumption log with an owner. It does not get built silently.

Label every derived fact with its evidence level:

- **Observed:** directly visible in a reference.
- **Derived:** a relationship supported by several observations (a repeated 24px gap, a shared left edge).
- **Hypothesized:** likely, but it needs another reference or an implementation test (a breakpoint, a hover color).

## Image-quality checks

- **Compression artifacts** (JPEG blocks, chroma bleed): sample color from flat interior areas, never from edges or anti-aliased text.
- **Color management:** screenshots taken on wide-gamut displays can shift colors. Prefer design-tool exports, and treat sampled values as close but not exact.
- **Scaling:** a resized image breaks the DPR math. Ask for an original capture whenever exact sizes matter.
- **Device chrome:** crop status bars, browser UI, and device frames from measurements, but note the safe-area insets they imply.

## Output

The register, an assumption log (statement, why it can't be observed, owner, cheapest way to confirm), and the agreed fidelity threshold for each region (see `fidelity-verification.md`).
