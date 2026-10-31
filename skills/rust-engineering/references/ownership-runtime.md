# Ownership across runtime boundaries

Use for resource sharing, async operations, worker threads, callbacks, and framework-owned execution.

## Trace who owns the state

Identify who creates a resource, who can mutate it, which operations share its identity, and what closes it. Choose unique ownership, borrowing, reference counting, or synchronization from those requirements. A cheap clone may intentionally extend shared ownership; replacing it with a borrow can change lifetime and scheduling constraints.

For framework callbacks or ECS systems, inspect the resolved dependency and its documented conventions. Framework-owned arguments may already represent borrows and require by-value signatures. Keep public plain data or a documented prelude when they fit the framework; do not reshape these interfaces to quiet unrelated lints.

## Follow suspension and cancellation

For each material await point, ask what state has changed, what remains owned or locked, and what happens if the future is dropped there. Separate cancellation of a waiter from cancellation of work that has already started. Check spawned-task ownership, join errors, retries, and shutdown; a dropped handle is not evidence that background side effects stopped.

Do not add `Send` or a multithreaded runtime to thread-affine code merely to use a familiar spawn API. Establish whether work stays on one thread, can move between threads, or must be shared concurrently. Compile-check the required bound or representative caller rather than asserting every future should be `Send`.

Keep blocking I/O and long CPU work compatible with the actual executor. Use its existing facilities for blocking work, concurrency limits, and cooperative scheduling when needed. Introducing an executor or thread pool changes deployment and shutdown behavior and belongs in the accepted scope.

## Locks and recovery

Trace lock order, guard lifetimes, reentrant callbacks, and blocking under contention. Holding a guard across an await can deadlock or reduce progress even when the future compiles. Establish the invariant protected by each lock and the failure behavior for cancellation or panic while that invariant is temporarily broken.

A poisoned standard-library mutex indicates a panic may have interrupted protected work. Propagating failure, stopping a subsystem, or recovering can each be appropriate. Recovery requires evidence that data remains valid or is restored before reuse; taking the inner guard alone establishes neither corruption nor repair. Poisoning is advisory and cannot be the foundation of an unsafe soundness argument.

## Deciding evidence

Prefer deterministic synchronization and controlled state transitions to sleep-based race tests. Useful checks include cancellation before and after a side effect, concurrent capacity exhaustion, repeated shutdown, and callback reentry. Test the state invariant and eventual cleanup/progress; do not infer a race fix from one successful run.

## Primary sources and refresh boundary

- [Async Rust: blocking and cancellation](https://rust-lang.github.io/async-book/part-guide/more-async-await.html): executor progress and dropped work.
- [Standard-library mutex contract](https://doc.rust-lang.org/std/sync/struct.Mutex.html): poisoning, recovery, and limits of the mechanism.

Resolve executor/framework versions from the target repository and check their current official cancellation, task, and error-handler documentation before changing runtime behavior.
