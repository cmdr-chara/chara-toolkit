# Evidence and Framing

Load before proposing any direction. A direction is only as defensible as the evidence it rests on.

## Evidence ledger

Record every input that will shape a decision. Rate confidence honestly; a stakeholder opinion is evidence of a stakeholder opinion, not of user behavior.

| ID | Claim | Source | Type | Confidence | Decision it affects |
| --- | --- | --- | --- | --- | --- |
| E1 | Dispatchers scan 40+ rows per shift and act on 3–5 | Support tickets + session recordings, Q3 | Observed behavior | High | Density, row hierarchy |
| E2 | Brand should feel "more premium" | Marketing lead, kickoff | Stakeholder intent | Medium | Expression axis only |

Types, strongest to weakest for behavioral decisions: observed behavior (analytics, recordings, research sessions) → direct user statements → support/sales signal → domain or regulatory constraint → stakeholder intent → competitor or trend reference → designer intuition.

- Constraints (legal, platform, accessibility policy, engineering limits) are not weaker evidence; they are hard bounds. Mark them `Constraint` and treat them as gates, not weights.
- Competitor and trend references justify at most the expression layer, never information architecture or behavior.
- Write unknowns as rows with `Confidence: Unknown` so they become explicit assumptions instead of silent defaults.

## Framing questions

Answer from evidence where possible; otherwise log as an assumption with an owner.

- **Users and context:** Who uses this, how often, on what devices, in what environment (glare, gloves, shared screens, interruptions, low bandwidth)? Novice, expert, or both on the same screen?
- **Jobs:** What is the user trying to get done, what triggers it, what does "done" look like, and what does failure cost them (annoyance, lost money, safety, legal exposure)?
- **Decision hierarchy:** On each key screen, what must the user notice first, decide second, and be able to ignore?
- **Business objective:** Which measurable outcome should move (activation, task time, error rate, conversion, retention, support volume)? Which must not regress?
- **Existing system:** What brand assets, design system, tokens, component library, and content guidelines already exist and are approved? What is mandated vs merely habitual?
- **Constraints:** Platforms, frameworks, localization and text expansion, accessibility target, regulatory copy, performance budget, release cadence, team capacity.
- **Validated behavior:** Which flows, shortcuts, and layouts do users rely on today and would notice losing? (See `existing-product-audit.md`.)

## Brand extraction from approved assets

When brand evidence exists (logo, guidelines, marketing site, packaging, previous product), extract principles before choosing values:

1. Inventory each asset with its approval status and date; ignore unapproved explorations.
2. Describe observable traits, not adjectives: stroke contrast, letterform width, corner geometry, color temperature and saturation range, use of whitespace, photographic vs illustrative imagery, motion character if any.
3. Convert traits into 3–5 principles phrased as testable rules, for example "Geometry is rectilinear; radii stay at or below 4px except for avatars and pills."
4. Separate marketing expression from product expression. Product surfaces usually need lower saturation, higher information density, and quieter motion than campaign material.
5. Flag gaps the brand does not answer (data-visualization palette, error/warning hues, dark theme, dense tables) as decisions this skill must make and record.

## Problem statement

Close framing with a short statement the team can disagree with:

> For [users] who need to [job] in [context], the experience must make [priority] obvious and [risk] hard, while expressing [brand principles]. Success is [metric] without regressing [guardrail].

If the statement cannot be completed without guessing at the job, the priority, or the guardrail, stop and ask; that missing product decision will otherwise be made silently by aesthetics.
