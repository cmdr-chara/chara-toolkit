# Direction Options and Decision Records

Load when a direction must be chosen, compared, or justified.

## Generate materially different options

Produce two or three directions that differ on explicit axes. Options that differ only in accent color or font are one option.

| Axis | Low end | High end | Typical evidence that moves it |
| --- | --- | --- | --- |
| Density | Spacious, one task per view | Compact, many items per view | Frequency of use, expertise, scan-and-act jobs |
| Hierarchy contrast | Flat, even weight | Strong focal point per screen | Number of competing priorities |
| Typographic voice | Neutral system sans | Distinctive display + text pairing | Brand principles, reading load, localization |
| Color role | Monochrome with semantic hues only | Brand color carries structure | Brand evidence, data-viz needs, status complexity |
| Shape language | Sharp, rectilinear | Soft, rounded | Brand geometry, platform conventions |
| Imagery | None or iconographic | Photographic or illustrative | Content availability, rights, emotional job |
| Motion | Instant, functional only | Choreographed transitions | Spatial-model needs, performance, vestibular risk |
| Navigation model | Flat, persistent | Deep, progressive disclosure | IA breadth, task switching frequency |
| Interaction novelty | Native, familiar controls | Custom but learnable interaction model | Frequency of use, discoverability, platform conventions |
| System rigidity | Strict reusable primitives only | Art-directed exceptions per page | Product scale, team size, page uniqueness, maintenance horizon |

For each option give: a one-sentence thesis, axis positions, one key screen described or sketched at the target breakpoints, how it handles the riskiest state (usually error or empty), and what it costs to build given the existing system.

Axis rules that hold for every option:

- High expression never requires low contrast, high density, or heavy motion. The axes move independently.
- Low composition risk is not a license for generic, repeated card grids. Hierarchy still has to come from the content.
- A custom interaction keeps a familiar semantic, keyboard, and touch path underneath it.
- Art-directed exceptions get explicit boundaries (which pages, which tokens) so they don't leak into the component system.
- Calibrate from this brief. Never carry another project's axis positions over automatically.

Avoid defaulting to whatever is currently fashionable. If an option exists only because it looks current, name the evidence that supports it or drop it.

## Evaluate against criteria, not preference

Weight criteria from the framing before scoring, so the weights cannot be tuned to favor a favorite.

| Criterion | Weight | Option A | Option B | Option C |
| --- | --- | --- | --- | --- |
| Primary job speed / clarity | 0.30 | | | |
| Error prevention and recovery | 0.20 | | | |
| Brand fit (against extracted principles) | 0.15 | | | |
| Accessibility headroom | 0.15 | | | |
| Fit with existing system / build cost | 0.10 | | | |
| Responsive and localization robustness | 0.10 | | | |

- Hard gates (accessibility target, legal copy, platform rules) are pass/fail before scoring; a failing option is out regardless of score.
- Score 1–5 with a one-line justification citing evidence IDs. A score without a cited reason is an opinion; mark it so.
- Run a sensitivity check: if a small, plausible weight change flips the winner, say so and name the evidence that would settle it (a quick usability test, an analytics query, a stakeholder decision).

## Decision record

Write one record per decision that a builder or future designer could otherwise relitigate. Keep records short and append-only; supersede rather than rewrite.

```markdown
### DR-003: Compact table density for the queue view
Status: Accepted (2026-10-25) | Supersedes: none
Context: Dispatchers scan 40+ rows and act on few (E1); current 56px rows show 11 rows above the fold at 1366x768.
Decision: 36px rows, 13px/20px body text, row hover + focus highlight, status as icon + text label.
Alternatives: Card list (rejected: halves visible rows); 44px rows (kept as "comfortable" density setting).
Consequences: Touch targets below 44px on desktop only; tablet breakpoint switches to 44px rows. Requires density token set.
Evidence: E1, E4; Assumptions: A2 (keyboard-heavy usage, unverified).
Revisit if: task completion time does not improve or error rate rises after release.
```

## Approval gate

Present the comparison and recommended option before producing full specs. Stop for explicit approval when the recommendation changes brand expression, navigation structure, or more than one primary flow, or when it removes a behavior listed as validated. Record who approved and when in the decision record.
