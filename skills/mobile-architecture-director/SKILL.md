---
name: mobile-architecture-director
description: Choose a mobile architecture among Flutter, Expo/React Native, native, and other viable options. Use when platform choice or mobile architecture direction is unresolved.
---

# Mobile Architecture Director

Choose a mobile approach from product and operating constraints rather than framework preference.

## Trigger boundary

Use this skill when platform choice, native/shared boundaries, or mobile architecture direction is unresolved.

Do not trigger to implement an already selected Flutter or Expo/React Native application.

## Required inputs

Resolve product journeys, target platforms/devices, team skills, native/API requirements, offline/data model, security/privacy, accessibility, performance, distribution/update constraints, long-term ownership, working-tree state, and decision reversibility.

## Safety baseline

- Preserve user work and existing repository evidence.
- Treat current framework/store/platform claims as volatile and verify them from primary sources.
- Do not choose by popularity or one benchmark.
- A must-have capability can disqualify an option regardless of weighted score.

## Workflow

1. **Define must-have gates.** Record platform/API/store/security/offline/accessibility constraints and explicit disqualifiers.
2. **Model the product architecture.** Identify shared domain/data logic, native integrations, UI/platform-specific behavior, background work, and distribution boundaries.
3. **Compare viable options.** Use `references/platform-decision-matrix-2026-07-17.md`; include Flutter, Expo/RN, separate native, and other relevant approaches rather than forcing all options.
4. **Weight criteria.** Score only criteria that matter to this product and show the weights so the result is inspectable.
5. **Prototype uncertainty.** Define proof spikes for critical unknowns such as native SDKs, background work, performance, accessibility, build/signing, or offline durability.
6. **Test sensitivity.** Re-run the decision when plausible weight changes or proof-spike results could flip it.
7. **Define boundaries.** State what is shared versus native/platform-specific and who owns escape hatches.
8. **Produce the decision record.** Use `references/mobile-nonfunctional-requirements.md` for nonfunctional coverage and state when to reconsider the choice.

## Handoffs and interaction boundaries

Hand selected Flutter work to `flutter-production-builder`, Expo/RN to `expo-react-native-builder`, native work to the appropriate native implementation workflow, security-first questions to `security-review`, and final release judgment to `verification-and-release`.

## Failure handling

If evidence cannot distinguish viable options, do not fabricate a winner; define the smallest prototype or missing fact that would. If a must-have fails, remove the option before weighted comparison.

## Stop conditions

Stop when the viable options, disqualifiers, weights, sensitivity, proof spikes, chosen boundaries, and reconsideration triggers are explicit enough to commit to a platform direction.
