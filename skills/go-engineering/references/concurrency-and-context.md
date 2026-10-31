# Concurrent work, cancellation, and shutdown

Read when work crosses goroutines, shared-state boundaries, blocking operations, timers, or request lifetimes.

## Make work finite and owned

For each new goroutine, identify its creator, inputs, state owner, cancellation signal, blocking points, and completion observer. Follow every exit path, including errors and abandoned consumers. A context signals cancellation; it does not forcibly interrupt an arbitrary function or wait for work to finish. A caller that needs completion must observe it through the existing join/result mechanism.

Propagate the caller's context through request-scoped work and outgoing calls. Derive a shorter deadline only when the operation requires one and call the returned cancellation function on all paths. Do not replace an incoming context with `Background` to avoid an error. Detached work needs an intentional owner and lifetime rather than an accidental escape from request cancellation. Keep context values for appropriate request-scoped data, not hidden required dependencies.

## Trace synchronization and shutdown together

For shared maps, slices, pointed-to data, and caches, identify the lock/channel/atomic operation that establishes the required visibility and serializes mutation. Passing a pointer through a channel does not prevent later concurrent writes to its target. Keep synchronization-bearing values from being copied after use according to their type's contract.

For each channel, establish who sends, who may close it, who receives, and what happens if either side stops. Check blocked sends/receives, close/send races, buffered capacity, and zero-value/nil-channel paths. Channel closure is a lifecycle decision, not a universal requirement for every channel. Preserve intentional backpressure and bounded concurrency.

Inspect lock ordering, calls made while holding locks, callbacks, and shutdown waits for dependency cycles. Do not replace mutexes with channels or atomics without a behavior-based reason and a complete ownership argument. Cancellation, worker exit, draining, resource cleanup, and waiting must agree; shutdown should not require a consumer that has already returned.

## Test the relevant orderings

Use explicit barriers, controllable dependencies/clocks, or the repository's supported concurrency-test facilities to arrange the event under test. A timeout is a test failure bound, not a substitute for synchronization. Ensure test workers finish and propagate failures/results to the test goroutine; do not let goroutines outlive fixtures or shared state used by another parallel test.

Exercise cancellation before work, while blocked, and during shutdown when those cases affect the change. Run supported race checks on meaningful paths. A clean race run covers executed accesses, and does not establish absence of deadlocks, leaks, lost results, or incorrect ordering. Repeated runs may expose a defect but do not replace a causal regression test.

## Primary sources

- [Context propagation and cancellation contract](https://pkg.go.dev/context)
- [Go memory model](https://go.dev/ref/mem)
- [Race detector usage and coverage limits](https://go.dev/doc/articles/race_detector)

Use APIs and concurrency-test support available in the project's declared Go version; do not raise that version for a test convenience.
