# Rust API contracts

Use when the change affects callers, public types, trait implementations, or error handling. Start with the crate's consumers and documented guarantees.

## Design from use

- Determine whether the boundary is a published library, an internal crate, an application, or a foreign interface. Internal crates can still have compatibility-sensitive consumers.
- Borrow when the callee only needs access; transfer ownership when it must retain or consume a value. An API may legitimately accept or return `Arc`, `Rc`, or `Box` when shared identity, trait objects, allocation ownership, or framework requirements are part of its contract. Hiding ownership machinery is a design option, not a universal rule.
- Prefer borrowed views such as slices and `str` when they satisfy callers. Choose generic conversion inputs only when their flexibility is useful enough to justify inference and compilation costs.
- Use domain types when they enforce an actual invariant or prevent a plausible mix-up. A boolean setter, public data field, concrete collection, or small clone can be the clearest correct API. Do not add builders, wrappers, getters, or iterator types only to satisfy a style checklist.
- Preserve framework-generated and framework-consumed signatures. Inspect dependency versions and framework examples before changing system parameters, callback types, derives, component fields, or documented preludes.

## Compatibility includes more than names

Check representative consumer code when changing a signature, visibility, generic bound, auto trait, lifetime, constructor, feature, or exported dependency type. Renaming a getter, adding `Send`, replacing a boolean with an enum, making a field private, or introducing `non_exhaustive` can break valid consumers. Add compatibility paths only when the task warrants them; larger transitions need a migration decision.

Trait implementations are observable contracts. Check agreement between equality, hashing, and ordering over the relevant states; deriving an implementation is fine when it agrees with the others. Also consider ordering stability, `Clone` cost/identity, and whether implementing `Copy` or `Default` is semantically appropriate.

Serialization, error variants, panic behavior, and iteration order can affect consumers even when signatures still compile. Add tests at the boundary that would detect the material change.

## Failure and diagnostic contracts

- Represent an expected failure in the existing error model; distinguish a missing value from an error only where callers need that distinction. A panic may be part of a documented invariant or convenience API. Replacing it with `Result` changes the contract and requires the corresponding scope.
- Choose errors for what callers must inspect, recover from, or diagnose. Preserve useful causes and context without leaking secrets. Concrete errors are useful for stable recovery; opaque or boxed errors can be appropriate for other boundaries. Do not impose one error type policy on every crate.
- Apply `Send`, `Sync`, and lifetime bounds where the actual executor, sharing, or API contract requires them. Single-threaded or borrowed-error designs are legitimate; adding bounds can exclude valid implementations.
- Provide useful diagnostics while protecting sensitive data. Derive `Debug` only if all exposed fields are safe to log; otherwise use a redacted implementation or omit it as the API requires. Test redaction when accidental disclosure is a realistic risk.
- Document actionable errors, panic conditions, side effects, and unsafe caller obligations where relevant. A doc example should compile under the documented features and show the intended failure handling.

## Primary sources and refresh boundary

- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/checklist.html): conventions and API design questions; interpret them against real consumer needs.
- [Cargo compatibility guidance](https://doc.rust-lang.org/cargo/reference/semver.html): source and behavior compatibility categories.

Check the project's declared compiler and current official documentation before recommending a newer language/library feature or changing a compatibility guarantee. These sources inform decisions; they do not replace repository policy.
