# Fidelity verification

Fidelity is a measured comparison under matched conditions, not an opinion.

## Match the capture conditions

Capture the build at the reference's viewport, DPR, browser or device, theme, locale, reduced-motion setting, scroll position, keyboard and safe-area state, and font loading state, with the same content. Use fixture data that mirrors the reference copy. Disable animations and carets, and wait for fonts and images to finish loading. Use the project's existing browser or device test tooling where it exists.

## Compare in this order

1. **Structure.** The same regions appear in the same reading order, and nothing is missing or extra. Check this first, because pixel diffs say nothing useful while structure is wrong.
2. **Geometry.** Overlay or diff the two images and measure region bounding boxes. Fix the layout model first (container, stacking, scroll, breakpoint), then typography metrics and wrapping, then media crop and aspect, then spacing and dimensions. Fine offsets cannot repair a wrong constraint model.
3. **Values.** Spot-check spacing, type sizes, and colors against the deviation log.
4. **Pixels.** Run a perceptual or pixel diff for a final score. Mask regions with dynamic content (dates, avatars, ads) and regions where the log records an accepted deviation.

## Thresholds

Structural, interaction, overflow, and accessibility mismatches have zero tolerance unless explicitly approved. Pixel thresholds apply only to what is left.

Agree on thresholds per region at intake. Without an agreement, use these defaults and say you did:

| Region type | Default threshold |
| --- | --- |
| Exact-match regions (brand header, hero) | Geometry within 2 CSS px; colors within the token snap rule |
| Design-system regions | Correct component and tokens; geometry within 4 CSS px |
| Content regions | Correct structure and type roles; text reflow differences allowed |

## Iterate with a budget

Each loop fixes the largest remaining deviation and recaptures. Stop when every region meets its threshold, or after three loops without measurable improvement. At that point, report what remains and why: font rendering, platform controls, or an unknown source.

## Beyond the reference

- **Responsive:** capture at the narrowest supported width, at each breakpoint the project defines, and at intermediate widths between the reference viewports, with extreme content (long names, many items, large text). Check that the inferred behavior holds without overflow or clipped content, and keep it labelled as inferred.
- **States:** render every inferred state and record a screenshot of each in the report.
- **Accessibility:** run the project's automated checker if it has one, and check keyboard and touch operation, focus visibility, accessible names, reduced-motion behavior, text expansion, and 200% zoom/text-resize behavior by hand.

## Report

Include the fidelity table (region, threshold, result, evidence path), the deviation log, the assumption log, the asset record, and the accessibility results. Say plainly which checks were not run.
