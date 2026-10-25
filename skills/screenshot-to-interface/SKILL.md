---
name: screenshot-to-interface
description: Reconstruct a maintainable interface from screenshots or visual references. Use when fidelity to supplied visual evidence is the primary requirement. Not for greenfield art direction or copying logos, photos, or fonts without rights.
---

# Screenshot to Interface

A screenshot is evidence of one rendered state at one size. Rebuild what it proves with the target codebase's own components and tokens, label everything it does not prove as an assumption, and measure fidelity instead of eyeballing it.

## Trigger boundary

Use this skill when screenshots, mockup exports, or visual references define the primary fidelity target: rebuilding a screen from an image, matching an approved design export, or porting a captured UI into an existing codebase.

Do not trigger for greenfield art direction (`product-design-director`), production hardening without a visual target (the platform builder), or copying assets the user has no rights to.

## Required inputs

- Every reference image with its source, owner, capture viewport, device pixel ratio, and theme.
- The rights basis: the user's own product, a licensed design, or inspiration only.
- Target platform, framework, design system, tokens, and component library.
- Which areas must match exactly and which may follow the design system.
- Interactive behavior the reference cannot show, or permission to infer it as labelled assumptions.
- Working-tree state of the target repository.

## Safety baseline

- Preserve uncommitted work and existing components; extend or compose them rather than forking near-duplicates.
- Do not extract logos, photos, illustrations, icons, or fonts from a screenshot for shipping. Follow `references/asset-handling.md`.
- Reproducing a third party's distinctive trade dress or a whole product UI needs a stated rights basis; without one, reconstruct layout and behavior with the target's own visual identity.
- Never invent data, copy, or legal text that the reference shows as real content; use labelled placeholders.
- Accessibility does not degrade for fidelity: semantics, focus order, contrast, and target sizes meet the project's target even where the image suggests otherwise.

## Workflow

1. **Intake the reference.** Record provenance, rights, viewport, DPR, and theme for each image, and what each one does and does not prove. Read `references/reference-intake.md`.
2. **Decompose and measure.** Derive the layout structure, spacing scale, type ramp, color roles, and component inventory from measurements, not impressions. Map each measured value to an existing token or log a deviation. Read `references/decomposition-and-mapping.md`, and use the helper below.
3. **Plan the build.** Map regions to existing components, name the new components needed, and list inferred states and responsive behavior as assumptions. Stop for confirmation when the plan adds new design-system components or overrides tokens.
4. **Build semantically.** Implement with real structure (landmarks, headings, lists, buttons, labelled inputs), the target's tokens, and the asset decision order.
5. **Verify fidelity.** Capture the build at the reference's exact viewport, DPR, theme, and content, compare it, and fix the largest deviations first. Read `references/fidelity-verification.md`.
6. **Report.** Give the deviation log, assumptions, asset record, and the accessibility checks that ran.

### Measurement helper

`scripts/measure_tokens.py` is read-only and uses only the standard library:

```sh
python skills/screenshot-to-interface/scripts/measure_tokens.py contrast "#111827" "#ffffff"
python skills/screenshot-to-interface/scripts/measure_tokens.py colors --tokens tokens.json "#2564ea"
python skills/screenshot-to-interface/scripts/measure_tokens.py scale 16 32 48 --dpr 2
python skills/screenshot-to-interface/scripts/measure_tokens.py scale 15 33 --tokens tokens.json --group spacing
```

`contrast` checks WCAG ratios, `colors` snaps sampled colors to the nearest token by CIEDE2000 and flags non-matches, and `scale` converts device pixels to CSS pixels and infers a base unit or snaps values to dimension tokens. Treat its output as measurement evidence; the decision to adopt a token or log a deviation is still yours.

## Handoffs and interaction boundaries

Use `product-design-director` when the reference does not settle the experience direction or conflicts with the existing design system. Use the relevant builder (`production-web-builder`, `flutter-production-builder`, `expo-react-native-builder`) for production architecture and hardening. Security-specific review goes to `security-review`.

## Failure handling

- **Unknown viewport or DPR:** infer it from known element sizes (for example a 16px body font), state the inference, and lower the fidelity claim.
- **Compressed or blurry reference:** measure at structural boundaries and snap to the scale. Do not chase single-pixel noise.
- **Reference conflicts with tokens:** follow the token where the gap is under the deviation threshold, and log larger gaps for a design decision.
- **Hidden states:** build the states the platform needs (hover, focus, disabled, loading, error, empty), mark them as inferred, and ask for references when they matter.

## Stop conditions

- Stop when the rights basis for the reference or its assets is unknown and the work would reproduce protected material.
- Stop for confirmation before adding design-system components or overriding shared tokens.
- The work is complete when every captured viewport passes the agreed fidelity threshold, or the remaining deviations are logged with a reason; assets have recorded sources; inferred behavior is labelled; and accessibility checks pass.
