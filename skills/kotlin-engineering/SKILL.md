---
name: kotlin-engineering
description: Use for bounded Kotlin implementation or local ports after Kotlin is chosen, preserving JVM, coroutine, and platform contracts. Android, Compose, and KMP guidance is conditional. Not for review-only work, unexplained failures, framework/toolchain migrations, or release decisions.
---

# Kotlin Engineering

Implement the requested Kotlin behavior in the project's existing language, build, and runtime boundaries. Kotlin does not imply Android, Compose, a server framework, or a new coroutine architecture.

## Trigger boundary

Use this skill to implement a Kotlin feature, apply a fix with an established cause, extend a Kotlin library, or port a bounded component to an already-selected Kotlin target.

Do not trigger for general reviews or behavior-preserving refactors, unexplained symptoms, platform selection, dependency/framework/toolchain transitions, or release approval. A Kotlin file in a reviewed diff does not transfer review ownership here.

## Required inputs

Identify the requested behavior, source and destination for a port, protected interfaces, affected callers, owned modules/source sets, local instructions, and working-tree changes. Resolve the existing build invocation, Kotlin language/API settings, JDK and bytecode targets, dependency declarations, supported platforms, and relevant CI checks. Inspect Gradle settings, convention plugins, version catalogs and wrapper files when present; respect another established build system.

For async or UI work, identify who owns the scope, state, callbacks, and resources, and when they stop. For a public library, identify Kotlin and Java consumers and any published binary or serialization compatibility requirement. Unknown requirements must remain visible.

## Safety baseline

- Retain local edits, module layering, persistence formats, error behavior, public API, and supported targets unless changing them is authorized.
- Use existing dependencies and compiler features. Do not upgrade Kotlin, Gradle, AGP, Compose, the JDK, or libraries as an incidental fix, or introduce Android/Spring into unrelated JVM work.
- Build configuration, plugins and tests execute code; a wrapper can download its declared distribution. Use the project's execution permissions and approved environment. Do not treat task discovery as a sandbox.
- Avoid blanket conversions of null handling, collections, dispatchers, Flow types, effects, or API style. Explain any changed behavior through its actual consumers.

## Workflow

1. **Specify the result.** Describe the input, output, failure and state transitions that change, plus the interfaces that remain compatible. For a port, capture representative source behavior, including nulls, numeric ranges, ordering, exceptions and resource cleanup; preserve those semantics deliberately.
2. **Select relevant detail.** Read [kotlin-contracts.md](references/kotlin-contracts.md) for changed types, nullability, public APIs, Java boundaries or ports. Read [coroutines-flow.md](references/coroutines-flow.md) only for coroutine, Flow, concurrent-state or callback-lifetime work.
3. **Locate the platform boundary.** Read [android-compose.md](references/android-compose.md) only when Android, Compose or lifecycle-managed UI is involved. Read [multiplatform-gradle.md](references/multiplatform-gradle.md) when source sets, KMP targets, Gradle module dependencies or verification tasks matter. Skip those references for an unrelated JVM component.
4. **Implement within the established design.** Keep domain logic and platform resources in their assigned layers. Follow existing lifecycle, cancellation and state ownership; do not move work to a new scope or dispatcher merely to silence a symptom.
5. **Exercise the changed contract.** Use focused tests or characterization where behavior warrants them. Include meaningful null/error, interruption, state-transition and consumer cases for the changed path. Follow repository task names rather than guessing from another Kotlin project.
6. **Report observed evidence.** Inspect the final diff and dependency changes. State changed behavior, checks run and outcomes, plus material gaps. Distinguish compilation, host tests, framework linking, app packaging, emulator/simulator execution, and physical-device behavior.

## Handoffs and interaction boundaries

`review-and-refactor-code` owns general reviews, finding admission and refactor parity. `debugging-investigator` owns unknown causes; `codebase-evolution-controller` owns framework/toolchain or compatibility transitions and can assign a bounded implementation here. `security-review` owns security-first analysis, `optimize-codebase-performance` owns measured optimization, and `verification-and-release` owns the integrated release decision. Use these handoffs when their decision is actually needed, without imposing a chain on a local feature.

## Failure handling

For an unavailable SDK, cached artifact, JDK or Apple host, report the exact blocked check and continue independent implementation or supported checks. Do not remove targets, weaken tests, change compiler flags, or download a replacement toolchain to manufacture a pass. If a failure's cause is unknown, preserve a reproducible case for debugging. If a caller or lifetime contract is missing and could invalidate the edit, stop the dependent change.

## Stop conditions

Complete the bounded change when its behavior is implemented, protected contracts are accounted for, relevant checks have recorded outcomes, and coverage gaps are explicit. Stop before an unresolved product/architecture decision, unauthorized API or platform expansion, tool installation, data migration, publishing or release. A successful host build never proves iOS execution, native playback, device lifecycle behavior, or hardware integration.
