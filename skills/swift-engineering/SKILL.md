---
name: swift-engineering
description: Implement bounded Swift changes and ports after Swift is chosen, preserving API, lifetime, concurrency, and target contracts. Use when changing a Swift package, module, native bridge, or renderer. Not for general review, unknown failures, compiler/SDK migration, or release decisions.
---

# Swift Engineering

Implement the selected Swift behavior against the project's real consumers and supported targets. Swift packages and portable modules are first-class scope; Apple frameworks are conditional integrations.

## Trigger boundary

Use this skill for Swift features, fixes whose cause is already established, module/API work, and bounded ports into Swift after the language choice is settled. This includes an authorized Swift portion of a larger native bridge or rendering change.

Do not trigger for a review-only request, an unexplained crash or wrong result, language/platform selection, a compiler/SDK/dependency transition, or a release decision. A Swift file appearing in a repository does not make the whole task Swift implementation.

## Required inputs

Identify the requested outcome, owned paths, working-tree state, affected module and callers, public/data contracts, and available checks. Inspect `Package.swift`, `Package.resolved`, Xcode project/workspace settings, `.xcconfig` files, scripts, and CI as applicable. Resolve the compiler, language mode, concurrency checking/default isolation settings, target platforms, SDKs, deployment minimums, and build configurations separately; one does not establish the others.

For ports, obtain the source revision and observable behavior, including failures and supported input ranges. For bridges, obtain both sides' declarations and resource ownership. Do not assume an undeclared support minimum can be raised.

## Safety baseline

- Preserve callers' mutation, identity, error, serialization, and platform behavior unless the accepted change includes those contracts.
- Keep the existing dependency and UI architecture. Do not introduce a framework, rewrite callbacks into concurrency, or replace classes with values merely as a preference.
- Do not make diagnostics disappear by adding `@unchecked Sendable`, `@preconcurrency`, unsafe isolation escapes, or broad warning suppression. An existing interoperability exception needs its actual synchronization or isolation contract examined.
- Do not change language mode, concurrency settings, toolchain, deployment target, signing, or entitlements to make the patch pass. Route a needed transition separately.
- Package manifests, plugins, macros, build phases, and tests may execute code. Respect the repository's execution and dependency-resolution permissions; local build authority is not distribution authority.

## Workflow

1. **State the behavior to preserve and change.** Trace callers, state ownership, failure handling, and supported inputs. For API, value/reference, ARC, resource-lifetime, or porting changes, read [contracts-and-lifetimes.md](references/contracts-and-lifetimes.md).
2. **Choose checks for this module and target.** Reuse repository commands and existing XCTest or Swift Testing conventions. Capture relevant baseline failures before implementation. For a package, select affected products/targets/tests; for an Apple target, resolve the scheme, configuration, SDK, and destination rather than guessing them.
3. **Implement at the existing seam.** Keep portable code free of accidental Apple-only imports. Verify dependency APIs and language features against the supported compiler and target. Load only the relevant guidance:
   - For actors, tasks, async callbacks, shared state, or `Sendable`, read [concurrency.md](references/concurrency.md).
   - For Apple UI/lifecycle, SDK availability, or native/foreign interfaces, read [apple-and-interop.md](references/apple-and-interop.md). Its foreign-boundary guidance also applies to non-Apple modules.
   - For Metal, shaders, GPU resource use, or renderer parity, read [metal-and-rendering.md](references/metal-and-rendering.md).
4. **Exercise the changed contract.** Add focused regression or characterization coverage when behavior warrants it, using the established test framework. Cover consequential error, lifetime, cancellation, availability, or porting differences that a successful example would miss. Do not enlarge this into unrelated cleanup.
5. **Verify and report observable evidence.** Inspect the final source/configuration/dependency diff and run the affected checks. Distinguish source compilation, linked target build, test execution, launch, UI interaction, and GPU output. Report the actual host, target, relevant settings, outcomes, and gaps. Linux or host compilation does not establish Apple UI, device, or GPU behavior.

## Handoffs and interaction boundaries

`review-and-refactor-code` owns review findings and behavior-preserving refactors; its Swift checklist can be used without this skill. `debugging-investigator` owns unknown causes. `codebase-evolution-controller` owns compiler/SDK/dependency upgrades, compatibility transitions, and staged language migrations, and may delegate a bounded Swift implementation here. `optimize-codebase-performance` owns a measured bottleneck; `security-review` owns security-first analysis. Unresolved product/UI direction belongs to the relevant design specialist. `verification-and-release` retains integrated release judgment. These are conditional handoffs, not a required chain.

## Failure handling

If a diagnostic points to an unclear ownership or isolation boundary, inspect that boundary before changing annotations. If the requested contract conflicts with a supported target or foreign API, identify the conflict and stop dependent edits. Continue independent in-scope work. When the required Apple SDK, destination, compiler, or GPU is unavailable, leave reviewable artifacts and identify the checks that did not run; a stub, preview, or historical capture cannot close that gap.

## Stop conditions

Finish when the scoped behavior is implemented, protected contracts have evidence, and executed checks and outstanding target limitations are stated. Stop before an unresolved public-contract change, unapproved installation or settings transition, signing/distribution action, production replacement, or irreversible migration. Do not infer a release decision from a successful build.
