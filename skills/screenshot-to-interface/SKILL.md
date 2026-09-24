---
name: screenshot-to-interface
description: Reconstruct a maintainable interface from screenshots or visual references. Use when fidelity to supplied visual evidence is the primary requirement.
---

# Screenshot to Interface

Treat screenshots as evidence to reconstruct, not as permission to guess hidden behavior or copy unowned assets.

This skill selectively adapts MIT-licensed visual-reference concepts from Leonxlnx/taste-skill. See `references/provenance.md`.

## Trigger boundary

Use this skill when screenshots or visual references define the primary fidelity target.

Do not trigger for greenfield art direction, generic production hardening, or asset copying without rights.

## Required inputs

Resolve reference images/viewports, target stack/environment, repository state, available assets and rights, required interactions/states, acceptable fidelity tolerance, and protected user work.

## Safety baseline

- Preserve uncommitted work.
- Record uncertainty where screenshots do not reveal behavior or responsive rules.
- Do not redistribute protected assets without permission.
- Keep semantic/accessibility behavior even when pixels alone do not show it.

## Workflow

1. **Register evidence.** Record each reference, viewport, state, crop, and confidence.
2. **Inspect implementation context.** Map routes/components/styles/tokens/assets and existing behavior.
3. **Decompose visuals.** Use `references/visual-decomposition.md` for layout, typography, spacing, color, component, and image treatment.
4. **Handle assets.** Use `references/asset-handling.md`; prefer provided/original assets and document substitutions.
5. **Infer responsive behavior.** Treat each viewport as a constraint; test intermediate widths rather than interpolating blindly.
6. **Choose component boundaries.** Preserve semantic structure and avoid over-general abstractions built only to mimic one screenshot.
7. **Implement a bounded first pass.**
8. **Compare iteratively.** Use `references/fidelity-loop.md` for side-by-side/overlay comparison and mismatch classification.
9. **Verify interaction/accessibility.** Check focus, keyboard/touch, reduced motion, text expansion, and state transitions that visual evidence alone cannot prove.

## Handoffs and interaction boundaries

Use product design when the reference does not resolve experience direction. Use the relevant builder for production architecture/hardening. Security-specific review goes to `security-review`.

## Failure handling

If reference detail is insufficient, request/derive better evidence or document the hypothesis rather than pretending certainty. If an exact asset is unavailable or unlicensed, substitute explicitly.

## Stop conditions

Stop when measured visual mismatches are within the agreed tolerance, responsive/interaction behavior is verified for the required states, and unresolved evidence gaps are documented.
