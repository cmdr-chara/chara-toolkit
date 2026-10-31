# Rust verification by supported configuration

Use to choose checks for a bounded change. Prefer repository tasks and CI definitions; commands below are options to scope, not a mandatory universal sequence.

## Establish execution and policy

Inspect the affected manifests, Cargo configuration, build scripts, procedural macros, and test setup before executing unfamiliar project code. Network access, compilation, and tests retain host permission boundaries. Use isolated fixtures for external side effects and avoid real user data. `--offline` limits dependency access; it is not an execution sandbox.

Record toolchain, edition, declared MSRV, target, crate type, workspace lint inheritance, features, and relevant baseline failures. Keep the existing lockfile policy. Do not install missing tools, raise MSRV, disable checks, or change support claims to make verification pass.

## Select checks for the claim

| Claim | Useful deciding evidence |
| --- | --- |
| New behavior or explained fix works | Focused tests that can fail on the old implementation, including material error/state paths |
| Public API remains usable | Representative consumer compilation/tests, important trait bounds, documented examples, compatibility tools already used by the project |
| Supported feature configuration builds | Separate checks for declared default, minimal, and relevant optional configurations |
| Declared minimum compiler still works | Build/check the affected supported configuration on the declared minimum toolchain when available |
| Foreign or platform integration works | Actual target/native-library execution; cross-compilation alone proves less |
| Unsafe path has been challenged | Invariant review and applicable interpreter/native tests, with explicit coverage limits |

`cargo fmt --check` can inspect formatting without rewriting source. Apply formatting only to the authorized change; keep unrelated churn out of the patch. `cargo clippy` inspects the selected target/configuration under the project's lint policy. Scope package, target, and feature flags to the claim. Strict warnings are useful when already required or when the authorized change adopts them; do not turn old warnings into unrelated cleanup.

`cargo test` normally includes documentation tests for selected library packages, while `cargo test --all-targets` does not run doctests. Add an explicit `cargo test --doc` invocation with the relevant package/features if the chosen test task omits them. A build or documentation render does not execute examples as tests.

Cargo features are intended to compose, but some existing crates have mutually exclusive backends. `--all-features` is not a substitute for the supported matrix and can be invalid for that project. Inspect exclusions and exercise each promised backend separately. Likewise, checking a host build does not establish a `no_std` or cross-target contract; dev dependencies can mask missing configuration coverage.

## Lint policy is an explicit change

Use existing rustc/Clippy settings first. If policy work is requested, baseline the chosen lints, check compiler/MSRV availability and framework exceptions, and adopt a small justified set with a reproducible command. A suppression can document a deliberate exception; it is not automatically evidence of a defect. Do not enable entire pedantic/restriction groups or impose stylistic API breaks without evaluating their cost and scope.

## Report evidence precisely

Record actual command, working directory, toolchain/configuration, outcome, and material limitations. Attribute failures to baseline or candidate only when comparable evidence supports that classification. Identify configuration checks not run because a target/tool is unavailable. Keep build, test, runtime, parity, and release claims distinct.

## Primary sources and refresh boundary

- [Cargo tests](https://doc.rust-lang.org/cargo/commands/cargo-test.html): test target selection and doctests.
- [Cargo features](https://doc.rust-lang.org/cargo/reference/features.html): feature composition and mutually exclusive features.
- [Cargo MSRV declaration](https://doc.rust-lang.org/cargo/reference/rust-version.html): declared toolchain support.
- [Cargo build scripts](https://doc.rust-lang.org/cargo/reference/build-scripts.html): compilation can run project code.

Before selecting new tool flags or lint levels, check the installed/declared toolchain's official documentation and the repository's current CI matrix. Availability on the newest compiler does not establish availability on the supported minimum.
