# Reviewing Rust contract changes

Read for a Rust diff or bounded Rust refactor. This checklist adds language-specific evidence questions; the owning review workflow still decides finding admission, severity, scope, and approval.

## Find the affected contract

Inspect the selected crate, workspace inheritance, lockfile, compiler/edition/MSRV declarations, CI targets, and features. Trace changed callers and external usage examples. Review source and serialized compatibility, including auto traits, lifetime bounds, constructor/field access, error variants, iteration order, and panic behavior.

An API style preference is not a regression. Boolean setters, shared ownership in signatures, public plain data, explicit clones, thread-affine types, and framework preludes can be intentional. Show the actual consumer break or correctness consequence before reporting a finding. Do not require a Rust implementation skill to be installed to review Rust code.

## Challenge state and lifetime assumptions

- For async/shared state, follow lock order, callback reentry, await boundaries, cancellation, task handles, retries, and shutdown. Can interrupted work lose a resource, duplicate an effect, or leave an invariant broken?
- For unsafe code, identify the violated validity/lifetime/aliasing/threading requirement and the safe or foreign path that reaches it. Missing safety comments are evidence gaps, not proof of undefined behavior. Comments and a clean build also do not prove soundness.
- For foreign calls, check allocation/deallocation ownership, layout, encoding, retained pointers, callback lifetimes, and unwind behavior on both sides.
- For manual equality/hash/order implementations, test consistency over representative values. A derived counterpart is valid when its semantics agree; hand-writing every implementation is not an end in itself.
- For mutex poisoning, determine whether recovery proves or restores the protected invariant. Neither unconditional recovery nor unconditional panic is a universal correctness rule.
- For diagnostics, inspect derived formatting and error context for disclosure of sensitive fields. A convenient `Debug` implementation can change the data exposure contract.

## Run only meaningful checks

Respect repository execution permissions: Cargo can execute build scripts and procedural macros, and tests run application code. Prefer formatting checks to automatic rewrites during a review. Use the supported package/feature/target matrix; do not diagnose deliberately exclusive features from an invalid all-features invocation.

Check relevant tests and documentation examples. An all-targets test task omits doctests, and a host compilation cannot establish another target's runtime behavior. Preserve MSRV and dependency policy; changing the compiler or globally suppressing warnings is not a review fix.

When a defect is established, propose the smallest correction and a test that distinguishes the faulty behavior. Keep pre-existing issues, lint preferences, and unverified soundness concerns separate from introduced actionable defects. State what was actually executed and what remains unexamined.

## Primary sources and refresh boundary

- [Cargo compatibility guidance](https://doc.rust-lang.org/cargo/reference/semver.html)
- [Cargo test selection](https://doc.rust-lang.org/cargo/commands/cargo-test.html)
- [Rust Reference: undefined behavior](https://doc.rust-lang.org/reference/behavior-considered-undefined.html)
- [Standard-library mutex contract](https://doc.rust-lang.org/std/sync/struct.Mutex.html)

Check official documentation for the actual compiler, executor, framework, and foreign dependencies before using a version-sensitive claim to admit a finding.
