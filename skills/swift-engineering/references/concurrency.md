# Swift isolation, tasks, and callbacks

Read for actor/task changes, async bridges, shared mutable state, or `Sendable` boundaries. Keep existing queue/lock designs when they satisfy the contract; adoption of actors or async APIs is not an automatic goal.

## Establish the effective mode

Inspect the selected target's compiler and language mode, strict-concurrency checking, default actor isolation, and enabled upcoming features. Check effective build settings as well as manifests. Compiler version alone does not determine isolation inference or diagnostic severity. Do not enable a new mode merely to use a preferred API.

Trace the executor/isolation of entry points, protocol requirements, closures, tasks, and imported callbacks. `async` does not promise background execution; do not assume suspension moves expensive work off the UI executor. `Sendable` concerns safe transfers across isolation boundaries and must account for reachable mutable references, not just outer value syntax.

## Protect invariants across suspension

- Actor serialization prevents simultaneous isolated access but does not make a multi-step operation atomic across `await`. Recheck state after suspension where another operation can invalidate the decision; use identity/generation or another existing invariant when stale work could overwrite newer state.
- Establish who owns, awaits, cancels, and observes failure from each task. Distinguish structured child work from unstructured and detached work, including inherited isolation, priority, and task-local context. Do not use `Task.detached` as a diagnostic escape.
- Cancellation is cooperative. Define when effects become committed, where cancellation is checked, and who cleans up. A cancellation request alone does not stop a foreign operation or prevent a late callback from publishing stale state.
- For continuations, cover synchronous completion, failure, cancellation, and competing callbacks. Resume the active continuation exactly once and release registrations/retained state. Checked continuations can expose misuse; they do not supply missing synchronization.
- Keep blocking waits out of paths that must make executor progress. When bridging queues/locks with tasks, trace reentry, lock ordering, callback execution context, and shutdown.

Do not add `@unchecked Sendable`, `@preconcurrency`, `nonisolated(unsafe)`, or relaxed checking simply to quiet diagnostics. If an existing boundary relies on one, identify the synchronization/isolation guarantee and its evidence. A needed new exception or public isolation change requires a justified contract decision within the approved scope; otherwise hand off before changing it.

## Evidence

Compile the affected targets under their supported settings. Use controlled ordering or explicit synchronization in consequential concurrency tests so they expose stale completion, cancellation, or duplicate callback behavior. A sleep-based success and a race-free build do not establish logical ordering. Add sanitizer/runtime checks only when supported and relevant; record what they exercised.

For Apple UI state or imported framework callbacks, also read [apple-and-interop.md](apple-and-interop.md).

## Primary sources

- [Swift concurrency](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/)
- [Enable data-race safety checking](https://www.swift.org/migration/documentation/swift-6-concurrency-migration-guide/enabledataracesafety/)
- [Common concurrency compiler errors](https://www.swift.org/migration/documentation/swift-6-concurrency-migration-guide/commonproblems/)
- [Default actor isolation inference](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0466-control-default-actor-isolation.md)
- [Actor reentrancy design](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0306-actors.md#actor-reentrancy)
- [CheckedContinuation contract](https://developer.apple.com/documentation/swift/checkedcontinuation)

Check the effective toolchain's documentation before asserting mode-sensitive inference or callback isolation.
