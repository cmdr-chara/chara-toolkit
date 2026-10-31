---
name: cpp-engineering
description: Implement bounded C++ features, explained fixes, or source-language ports while preserving lifetime, ABI, compiler, and runtime contracts. Use when C++ is already chosen. Not for C-only changes, review-only work, unexplained failures, or migrations.
---

# C++ Engineering

Make the requested C++ behavior fit the target's ownership model, consumers, and supported builds. Prefer an explicit lifetime argument over a change justified only by successful compilation.

## Trigger boundary

Use this skill for a scoped C++ implementation, a fix with an established cause, or a bounded port into C++ with an agreed behavior contract.

Do not trigger for a C translation unit merely because the repository also contains C++, a review-only request, an unexplained crash, a compiler/dependency transition, or choosing whether to migrate a product to C++. Framework names and CMake files alone do not establish this boundary.

## Required inputs

Identify the affected executable/library, consumers, relevant tests, and source-language revision for a port. Inspect build files, presets/toolchain files, CI, public headers, and repository guidance for the C++ standard, compiler/standard library, supported OS/architecture, ABI/export rules, exceptions, RTTI, allocation policy, and runtime/framework ownership. Missing declarations remain unresolved constraints; do not infer permission to modernize them.

For a port, record observable inputs, outputs, encoding, integer/overflow behavior, errors, ordering, and resource lifetime. A source implementation with undefined behavior needs an agreed supported input domain, not a promise to reproduce undefined results.

## Safety baseline

- Keep source and binary compatibility, serialized layouts, callbacks, exception/error behavior, and thread affinity within the authorized change. A private member or inline header edit can affect binary consumers.
- Use the established allocator and resource owner. Do not replace framework ownership or project handles with standard smart pointers by taste, or compile C source as C++ to avoid resolving its actual contract.
- Preserve the declared standard, exception/RTTI policy, dependencies, and warning rules. Changing a flag to conceal a defect is not an implementation fix.
- Inspect relevant CMake/custom build hooks before execution: configuration and builds can run commands or fetch content. Use authorized build locations and existing isolation; do not install SDKs or run privileged application tests implicitly.

## Workflow

1. **Locate the behavior boundary.** Trace changed headers, callers, plugin/foreign interfaces, and callbacks. Separate the requested behavior from protected contracts; characterize source behavior before translating a port.
2. **Resolve lifetime and failure behavior.** Read [lifetime-and-interfaces.md](references/lifetime-and-interfaces.md) when changing owners, views, containers, callbacks, exceptions, or ABI boundaries. Establish who releases each resource and what invalidates each retained reference.
3. **Fit the active build.** Read [builds-and-validation.md](references/builds-and-validation.md) for CMake/compiler changes, mixed native targets, sanitizers, or platform evidence. Change the affected target rather than altering global flags or unrelated consumers.
4. **Apply framework rules conditionally.** Read [qt-qml.md](references/qt-qml.md) only for Qt/QML, QObject ownership, event loops, or Qt media workers. For other frameworks, inspect their actual lifecycle and threading contracts instead.
5. **Implement and exercise the contract.** Keep the change small. Where behavior warrants a test, cover the distinguishing result plus relevant destruction, mutation, failure, or shutdown path. Ports need observable parity over representative valid and invalid inputs, not a line-for-line rewrite.
6. **Report bounded evidence.** Inspect the final diff and run the affected build/tests under supported configurations available locally. State compiler, target/configuration, instrumentation, observed results, and material untested consumers or platforms.

## Handoffs and interaction boundaries

This skill supplies C++ implementation decisions without requiring other skills to be installed. When available, `review-and-refactor-code` owns review findings and behavior-preserving refactor judgment; `debugging-investigator` owns causal diagnosis of unknown failures. `codebase-evolution-controller` owns compatibility transitions and product migrations, and may delegate a bounded port here. Security-first analysis, measured optimization, and integrated release readiness remain with `security-review`, `optimize-codebase-performance`, and `verification-and-release`. Pass the relevant contract and evidence when that decision becomes necessary; do not load every specialist for an ordinary edit.

## Failure handling

If a lifetime, ABI, or exception guarantee cannot be established, inspect the allocating side, consumers, and build policy before changing representation. A sanitizer report needs its reachable operation and violated rule identified; a clean run cannot settle an unexecuted path. Separate environment failures from changed-code failures. With an unavailable compiler, SDK, or device, keep the patch inspectable and identify the exact unrun checks; never raise requirements merely to obtain a local pass.

## Stop conditions

Conclude when the requested behavior and necessary caller/build updates are present, lifetime and compatibility obligations have evidence, relevant checks have observed outcomes, and remaining coverage gaps are explicit. Pause dependent work before an unresolved ABI/product decision, unapproved policy change, destructive cleanup, deployment, or external release. A host build does not establish plugin compatibility, device behavior, or absence of undefined behavior.
