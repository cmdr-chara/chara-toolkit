# Porting against an explicit contract

Use when a source module is being implemented in Rust. A bounded port can be implemented here; deployment order, cross-service compatibility, persisted-data migration, and legacy retirement need the transition owner.

## Establish the domain before translating

Record the source revision and callable/CLI/wire boundary. Determine accepted inputs from the public contract, production callers, fixtures, and tests. Include outputs, ordering, failure category, state changes, and external side effects. Missing tests do not mean a behavior is unimportant.

Do not label Unicode, binary data, large integers, duplicate keys, or empty values unsupported merely because a Rust standard-library function differs. Narrowing an established domain needs explicit authorization. When the domain cannot be inferred and affects the design, preserve the known behavior, characterize the uncertain boundary, or ask the smallest deciding question before dependent implementation.

Classify each material difference as preserved, explicitly authorized to change, or unresolved. A note explaining a difference does not authorize it. Keep intentional bug repair separate from parity work. Source-language undefined behavior has no portable parity guarantee; identify a valid supported contract rather than emulating invalid memory access.

## Map semantics, then types

| Boundary | Question that decides the Rust representation |
| --- | --- |
| Text and bytes | Is the input UTF-8 text, arbitrary bytes, a platform path, or a foreign string? Which normalization and whitespace rules apply? |
| Numbers | What ranges, overflow, signed division/remainder, and floating-point distinctions are observable? |
| Collections | Are insertion order, stable ties, duplicate keys, and identity significant? |
| Optional values | Can callers distinguish absent, explicit null, empty, and defaulted values? |
| Failures | Which failures are recoverable, which categories are inspected, and are messages or exit codes part of the interface? |
| Resources | What must finish, close, cancel, or roll back on partial failure? |

Use Rust types that express the established answer. A sized integer is appropriate only when its range covers the contract or overflow behavior is deliberately specified. Collapsing missing and null into one `Option`, using an unordered map, or decoding bytes as text can discard information. Avoid runtime emulation that the supported domain does not need, but establish that exclusion before taking the shortcut.

## Obtain parity evidence

Run the original tests when possible and carry their observable assertions to the new implementation. Track which source behaviors each Rust test covers; a rigid one-to-one test layout is unnecessary if coverage is clear. Characterize important untested behavior before replacing it.

Compare source and port using the same valid inputs and normalized boundary outputs. Cover ordinary cases plus limits, empty/malformed data, ordering, and error paths from the actual contract. For a large or hostile domain, property-based or differential fuzz testing can be valuable; retain a failing seed and turn a deciding divergence into a focused test. Do not equate either a small sample or a large fuzz run with complete equivalence.

If the original cannot execute, distinguish contract-derived tests from observed source parity. If compatibility requires a new dependency or unsupported toolchain, expose the trade-off rather than silently changing the accepted domain.

## Handoff record

Keep a short API/behavior mapping, evidence of parity, authorized differences with their authority, unresolved differences, and execution gaps. Use the repository's existing migration/documentation location; do not create an obligatory file for every tiny port. Do not retire the source or compatibility adapter until the task's removal criteria are met.

## Primary sources and refresh boundary

- [Rust integer operations](https://doc.rust-lang.org/std/primitive.i64.html): range, overflow, and arithmetic behavior.
- [Rust string contract](https://doc.rust-lang.org/std/string/struct.String.html): UTF-8 and byte/string boundaries.

Check the source language's official documentation and the resolved Rust libraries for each observable semantic difference. Version-specific behavior belongs in the task's evidence, not a permanent language-equivalence table.
