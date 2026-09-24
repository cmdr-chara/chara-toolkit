---
name: product-design-director
description: Define product UX and visual direction from user goals, brand evidence, states, responsiveness, and accessibility. Use when the main question is what the experience should communicate or feel like.
---

# Product Design Director

Define a coherent product experience before implementation details harden into accidental design.

This skill selectively adapts MIT-licensed concepts from Leonxlnx/taste-skill. See `references/provenance.md`.

## Trigger boundary

Use this skill for product UX/visual direction, redesign critique, experience principles, state/journey design, responsive behavior, and accessibility intent.

Do not trigger for literal screenshot reconstruction, routine frontend implementation, or production architecture without a design-direction question.

## Required inputs

Resolve product/user goal, primary jobs/journeys, brand evidence, content/assets, existing interface when redesigning, platform/input constraints, accessibility needs, implementation constraints, and protected user work.

## Safety baseline

- Preserve validated product behavior unless a change is explicitly intended.
- Distinguish evidence from aesthetic preference.
- Do not fabricate brand assets, content claims, or accessibility conformance.
- Avoid defaulting every product to one fashionable visual language.

## Workflow

1. **Infer the design problem.** Clarify audience, job, emotional/brand intent, constraints, and success signals.
2. **Audit before redesigning.** Use `references/redesign-audit.md` to preserve working behavior and identify actual experience problems.
3. **Set experience principles.** Define hierarchy, density, feedback, trust, navigation, and content priorities.
4. **Calibrate direction.** Use `references/direction-calibration.md` to explore distinct evidence-backed directions instead of one default aesthetic.
5. **Model journeys/states.** Cover entry, loading, empty, error, success, permission/auth, destructive/irreversible, and recovery states where relevant.
6. **Define the visual system.** Establish typography, spacing, color roles, surfaces, imagery/icon approach, and motion purpose at the level implementation needs.
7. **Define responsive/accessibility behavior.** Use `references/accessibility-and-responsive-review.md`; specify transformations, not just desktop/mobile snapshots.
8. **Critique and hand off.** Compare the proposed system against the brief and make implementation-critical decisions explicit.

## Handoffs and interaction boundaries

Use `screenshot-to-interface` when supplied visual evidence is the fidelity target. Web/Flutter/Expo builders own production implementation. `security-review` owns security-specific UX/code review.

## Failure handling

If brand/product evidence is missing, present bounded direction hypotheses and label assumptions. If accessibility conflicts with a visual idea, preserve access and revise the direction.

## Stop conditions

Stop when the experience principles, key states, responsive/accessibility intent, visual system, and implementation handoff are coherent enough to build without guessing.
