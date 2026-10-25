# Decomposition and mapping

Work from the outside in: page frame, then regions, components, and finally values. Convert every measurement to CSS pixels (device pixels ÷ DPR) before reasoning about it.

## 1. Structure

- Identify landmarks (header, navigation, main, complementary, footer) and the reading order. This becomes DOM or widget order, independent of visual position.
- Find the layout grid: content max-width, column count, gutters, and outer margins. Measure at least three repeated edges before you declare a grid.
- For each region, decide its layout primitive (stack, cluster, grid, sidebar, or overlay) and how it should respond as width changes. The response is an assumption unless another viewport reference shows it.
- Note behavior the layout implies: sticky or fixed regions, scroll containers, overlays and their stacking, disclosure, carousels, and safe-area handling. These are hypotheses until a second reference or the product owner confirms them.

## 2. Values

| Dimension | How to measure | Mapping rule |
| --- | --- | --- |
| Spacing | Gaps between element boxes, not glyph ink | `measure_tokens.py scale`; snap to existing spacing tokens and log residuals above 2px |
| Type | Cap height or x-height compared against known fonts; line-height from baseline-to-baseline distance | Map to the type ramp by role (display, heading, body, caption), not by exact pixel size |
| Color | Flat-area samples, several per role | `measure_tokens.py colors`; a ΔE2000 under ~3 snaps to the token, anything larger is logged as a deviation |
| Radius, borders, elevation | Corner geometry and shadow extent at 2x zoom | Map to shape and elevation tokens; do not invent per-component values |
| Icons | Size and stroke weight | Match against the project's icon set first |

Run `measure_tokens.py contrast` on every text/background pair and every UI-component/background pair you derive. A failing pair is an accessibility finding, even when the reference shows it.

## 3. Component inventory

| Region | Visual pattern | Existing component | Fit (exact / variant / compose / new) | Props or slots | Inferred states |
| --- | --- | --- | --- | --- | --- |

- Prefer an existing component even when it's a few pixels off, and log the gap. A near-duplicate component is a maintenance cost the screenshot doesn't justify.
- Visual rectangles alone are not component boundaries. A boundary is justified when the part has independent state or semantics, repeats with meaningful variants, is an existing design-system primitive, needs isolated accessibility or responsive testing, or has an independently reusable data source.
- "New" needs a reason: the pattern recurs, or no composition of existing parts expresses it. New shared components and token overrides are an approval stop.
- Name components by role (`PlanCard`), not by appearance (`BlueBoxWithShadow`).

## 4. Deviation log

| Location | Reference value | Built value | Reason (token snap / accessibility / platform / unknown) | Accepted by |
| --- | --- | --- | --- | --- |

Every intentional difference from the reference is listed here. A deviation that nobody logged counts as a defect.
