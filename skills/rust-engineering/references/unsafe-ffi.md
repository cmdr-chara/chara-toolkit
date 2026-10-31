# Unsafe and foreign boundaries

Use before adding or changing unsafe operations, ABI declarations, raw resources, or safe wrappers around foreign code.

## Write the argument before the operation

For each unsafe operation, identify the caller obligations and the facts the implementation establishes: allocation lifetime, alignment, bounds, initialized values, aliasing, pointer validity, threading, and any library-specific requirements. A safety comment should connect those facts to the operation, not just announce that it is safe.

Check whether safe callers can violate the wrapper's invariant through another method, reentry, cloning, destruction, a panic, or concurrent access. The soundness boundary includes every operation that can affect the state, not only the unsafe block's lexical scope.

Use a safe existing operation when it meets the contract. New unsafe code needs a reason grounded in an actual capability or measured constraint. An undocumented block is a documentation/evidence gap; demonstrating undefined behavior requires a violated requirement and reachable path. Conversely, complete comments do not prove soundness.

## Foreign ownership and failure

Resolve calling convention, layout, integer widths, string encoding, null/length combinations, and ownership for each argument and result. Rust text types are not automatic replacements for arbitrary byte strings. `repr(C)` addresses layout but does not establish value validity, allocation lifetime, or ownership.

Match allocation with the correct deallocator and library lifetime. State whether a foreign handle can be copied, moved across threads, called concurrently, or used after a callback. Account for callbacks during destruction and for buffers retained after a foreign call returns.

Choose an explicit unwind policy at the ABI boundary. If using `catch_unwind`, verify that unwinding is enabled, that state remains valid, and that the caught failure maps to a documented foreign result. It cannot recover from aborts or undefined behavior; an unwind-capable ABI has its own requirements. Do not add a catch and then claim all foreign failure paths are handled.

## Verification limits

Use Miri for relevant supported Rust execution paths when available, and native integration tests for foreign interactions. Test valid edge cases that challenge lengths, lifetimes, cleanup, and state transitions. Do not deliberately execute known UB on the host to manufacture proof. A failure can establish a defect; a passing tool run only covers the exercised configurations and paths.

Report unavailable interpreter/target/native-library coverage. Never add an `unsafe impl Send` or `Sync` merely to satisfy a compiler error: prove that sharing and movement preserve the resource's real contract.

## Primary sources and refresh boundary

- [Rust Reference: undefined behavior](https://doc.rust-lang.org/reference/behavior-considered-undefined.html): validity and soundness obligations.
- [Rustonomicon: FFI](https://doc.rust-lang.org/nomicon/ffi.html): foreign ownership, layout, and unwinding.

Check current official documentation for the compiler, ABI, interpreter, and foreign library used by the project. Do not assume every target or foreign call can run under an interpreter.
