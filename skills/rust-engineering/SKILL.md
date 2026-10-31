---
name: rust-engineering
description: Implement bounded Rust crate changes or source-language ports with explicit API, ownership, runtime, and compatibility contracts. Use when Rust is already chosen. Not for general PR review, unexplained failures, dependency upgrades, or release decisions.
---

# Rust Engineering

Deliver the requested Rust behavior within the crate's actual consumer and execution constraints. Make design choices explainable through contracts and evidence; keep language preferences subordinate to the task.

## Trigger boundary

Use this skill for Rust feature implementation, an already-explained Rust fix, crate/API construction, or a bounded implementation port whose target language is already decided.

Do not trigger for review-only requests, unknown symptoms, or rollout, compatibility-window, and dependency transitions. These stay with `review-and-refactor-code`, `debugging-investigator`, and `codebase-evolution-controller`, respectively. Merely mentioning Cargo, a trait, or a Rust dependency does not activate this skill.

## Required inputs

Resolve the requested behavior, repository and working-tree state, affected crate and consumers, existing tests, and protected interfaces. Inspect `Cargo.toml`, workspace inheritance, lockfile, `rust-toolchain` files, `.cargo/config` files, and CI when present for edition, minimum supported Rust version (MSRV), target, feature, runtime, and lint contracts. An absent declaration is an unknown, not permission to raise requirements.

For a port, establish the source revision, executable behavior and supported input domain before choosing replacement types. For FFI, resolve both sides' ABI and resource ownership.

## Safety baseline

- Preserve existing user edits, public signatures, error semantics, serialized formats, and feature behavior except where the request authorizes a change.
- Cargo compilation can execute build scripts and procedural macros; tests execute project code. Inspect relevant execution hooks and use the host's existing permissions and isolation. Do not treat a lint command as a read-only security boundary.
- Do not install toolchains, introduce a runtime, raise MSRV, replace lint policy, or regenerate unrelated lockfiles just to make a preferred solution work.
- A compile success, safety comment, or clean lint run does not establish behavioral correctness or soundness.

## Workflow

1. **Define the observable change.** Identify inputs, outputs, errors, state transitions, ownership, and callers. Separate the requested new behavior from interfaces that must remain compatible. For ports, load [porting-contract.md](references/porting-contract.md).
2. **Establish relevant baseline evidence.** Use repository commands and the declared support matrix. Distinguish existing failures from introduced ones. Read [verification.md](references/verification.md) to select meaningful checks without enlarging the task into workspace-wide cleanup.
3. **Choose a small implementation boundary.** Read [api-contracts.md](references/api-contracts.md) when changing public types, signatures, errors, or trait implementations. Fit existing abstractions and dependencies before adding new ones; record a material trade-off only when it affects callers or maintenance.
4. **Trace resource lifetimes.** Read [ownership-runtime.md](references/ownership-runtime.md) for shared ownership, async work, cancellation, locks, threads, or framework-managed functions. Read [unsafe-ffi.md](references/unsafe-ffi.md) before changing unsafe operations or a foreign boundary. Load only the relevant references.
5. **Implement and challenge the changed contract.** Use focused regression or characterization tests where behavior warrants them. Exercise failure paths and consumer usage, not just the successful example. Keep compatible signatures and data representations unless their change is part of the accepted scope.
6. **Verify the final candidate.** Run the affected checks, inspect the diff and lockfile, and state what actually ran. Include material feature/target/MSRV gaps. Report the changed behavior, deciding evidence, and remaining limitations; do not turn unfinished or unavailable checks into passes.

## Handoffs and interaction boundaries

This skill owns Rust implementation details, including narrow ports. A deployed service replacement, public compatibility transition, or multi-stage language migration belongs to `codebase-evolution-controller`, which may hand a bounded implementation stage here. `review-and-refactor-code` retains finding admission and refactor parity; `security-review` retains security-first exploit analysis; `optimize-codebase-performance` retains measured optimization. `verification-and-release` owns the integrated ship decision. These handoffs are conditional; the skill can implement a bounded crate change independently.

## Failure handling

If compatibility is unclear, inspect callers or characterize the behavior before changing it. Keep unresolved input-domain or runtime requirements visible. If the toolchain is unavailable, deliver the inspectable work and report unexecuted checks. An unavailable Miri run or foreign target is a coverage gap, not evidence that an unsafe boundary is sound. Stop dependent work when the missing contract could invalidate it; continue independent work within scope.

## Stop conditions

Finish when the requested Rust behavior is implemented, protected contracts remain intact or explicitly changed within scope, focused checks have observed outcomes, and material gaps are disclosed. Stop before an unapproved contract expansion, system installation, production rollout, or irreversible migration. Do not claim a release, full platform coverage, or universal soundness from local checks.
