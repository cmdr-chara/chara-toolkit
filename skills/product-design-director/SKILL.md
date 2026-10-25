---
name: product-design-director
description: Direct product UX and visual systems from user jobs, brand and design-system evidence, states, and accessibility. Use when the question is what an experience should do or look like before it is built. Not for rebuilding a screenshot or routine frontend coding.
---

# Product Design Director

Turn evidence about users, jobs, brand, and constraints into a direction builders can implement without inventing behavior, copy, or visual values. Every recommendation traces to evidence or to a logged assumption.

## Trigger boundary

Use this skill for product UX/visual direction, redesign critique, experience principles, state/journey design, responsive behavior, and accessibility intent. That includes brand extraction into a token system, comparing experience directions, audit-first redesigns, content design for flows, and density/hierarchy decisions.

Do not trigger for literal screenshot reconstruction, routine frontend implementation, or production architecture without a design-direction question. Do not trigger for standalone asset production (resizing or exporting logos), marketing copywriting with no product surface, or documentation drift.

## Required inputs

Resolve before deciding, or log as an assumption with an owner:

- Users, their jobs, frequency, context, and the cost of failure.
- Business objective and the guardrail metric that must not regress.
- Existing brand assets, design system, tokens, components, and content guidelines, with approval status.
- Platforms, breakpoints, localization, accessibility target (default WCAG 2.2 AA, recorded as an assumption), and engineering constraints.
- For redesigns: current screens and flows across states, usage evidence, and who depends on current behavior.
- Repository and working-tree state when design files, tokens, or specs live in the repository.

## Safety baseline

- Preserve uncommitted work, existing tokens, and approved brand assets; propose changes as additions, supersessions, or deprecations rather than overwriting them.
- Preserve validated user behavior by default. Removing or relocating a behavior users rely on requires a decision record and explicit approval.
- Do not invent research findings, metrics, quotes, or user statements. Separate observed evidence from stakeholder intent and from your own judgment.
- Do not use copyrighted imagery, fonts, or third-party trade dress as product assets; cite references as inspiration only and confirm licenses for anything shipped.
- Accessibility outcomes are gates, not weights. When brand expression conflicts with access, access wins and the decision is recorded.
- Do not implement production architecture; hand off to the owning builder.

## Workflow

1. **Frame with evidence.** Build the evidence ledger, answer the framing questions, extract brand principles, and write the problem statement. Read `references/evidence-and-framing.md`.
2. **Audit what exists** when redesigning. Capture current states, build the validated behavior register, and log findings by user consequence. Read `references/existing-product-audit.md`.
3. **Explore options.** Generate two or three directions that differ on explicit axes, apply hard gates, score against pre-weighted criteria with cited evidence, and check sensitivity. Read `references/direction-options-and-decisions.md`.
4. **Approval stop.** Present the comparison and recommendation before detailed specs whenever the direction changes brand expression, navigation structure, more than one primary flow, or any validated behavior. Record the approval in a decision record.
5. **Model the experience.** Define object model, journeys, the full state coverage matrix (empty, loading, partial/stale, error, no permission, offline, extreme content), content design, and density/hierarchy decisions. Read `references/experience-model.md`.
6. **Define the visual system.** Extend existing tokens through reference, system, and component tiers; set color roles with verified contrast pairs, type ramp, spacing, shape, elevation, motion with reduced-motion behavior, and imagery rules. Read `references/visual-system-and-tokens.md`.
7. **Set accessibility and responsive contracts.** Apply the WCAG 2.2 criteria that change design, and specify per-range behavior for every region. Read `references/accessibility-and-responsive-review.md`.
8. **Hand off.** Assemble the package with acceptance criteria and a decision-ownership split. Read `references/builder-handoff.md`.

Scale depth to the request: a focused critique may need only steps 1–2 and a findings table; a greenfield product needs all steps. Skip a step only when its output already exists and is approved.

## Outputs

- Evidence ledger and assumption log with confidence levels.
- Audit findings and validated behavior register (redesigns).
- Direction comparison and decision records, including approvals.
- Experience model: journeys, state coverage matrix, content sheet, density/hierarchy decisions.
- Token changes in the repository's format, with rationale and contrast pairs.
- Responsive contract, accessibility acceptance, and Given/When/Then acceptance criteria for builders.

## Handoffs and interaction boundaries

Use `screenshot-to-interface` when supplied visual evidence is the fidelity target, including an approved reference screen produced after this direction. Web/Flutter/Expo builders own production implementation (`production-web-builder`, `flutter-production-builder`, `expo-react-native-builder`); `mobile-architecture-director` owns unresolved mobile stack selection. `security-review` owns security-specific UX/code review. Design-to-builder deviations return here as decision-record updates rather than being resolved silently in code.

## Failure handling

- **Thin evidence:** proceed with clearly labelled assumptions, lower confidence, and name the cheapest test that would settle the riskiest one (five-user test, analytics query, stakeholder decision).
- **Conflicting evidence:** show both sources, state which decision each would drive, and ask for the product call rather than averaging them.
- **Brand gaps** (no dark theme, no status colors, no data palette): decide, record as a decision, and flag for brand-owner review.
- **Accessibility conflict** with approved brand values: propose the nearest compliant variant and record the deviation.
- **Unavailable states or screens** for audit: request seeded or mock data; do not alter production data to provoke states.

## Stop conditions

- Stop and ask when the brief lacks the product decision needed to choose between directions (who the user is, the primary job, or the guardrail); do not let a fashionable aesthetic decide it.
- Stop for explicit approval before large visual rewrites, navigation restructuring, brand-expression changes, or removing validated behavior.
- Stop when a requested asset or reference cannot be used with confirmed rights.
- The work is complete when every decision traces to evidence or a logged assumption, key states and breakpoints are specified with copy, token pairs pass contrast, accessibility conflicts are resolved, and the handoff package names what builders own.
