# Coroutine, Flow and resource lifetimes

Read only for asynchronous work, streams, concurrent state or callback bridges. Preserve the selected runtime and existing ownership model; synchronous Kotlin does not need to acquire coroutines.

## Scope, cancellation and failure

- Identify the parent scope, job, dispatcher, lifetime owner and completion/error observer. A service scope, screen scope and caller scope can have different shutdown requirements. Do not detach work with `GlobalScope`, a replacement `Job`, or a fresh scope to make cancellation disappear.
- `suspend` permits suspension; it does not make blocking code safe for the current thread or move execution to a background dispatcher. Follow the actual caller/thread contract and existing dispatcher injection. Keep framework-affine calls on their required executor or thread.
- Preserve cancellation propagation through broad catches, `runCatching`, retries and fallback paths. When handling ordinary failures, do not consume `CancellationException`. Trace child-failure behavior before replacing `coroutineScope` with supervision or vice versa.
- Cancellation is cooperative. Long-running loops and blocking APIs need an appropriate cancellation/interrupt strategy. Account for state changes and acquired resources when cancellation occurs between steps; use bounded cleanup with the existing resource owner.
- For callback adapters, unregister callbacks on cancellation/disposal, prevent duplicate completion, and handle callbacks racing with cancellation. Cleanup must match the original API's ownership and threading requirements.
- Follow shared-state access across suspensions and callbacks. A thread-safe flow or collection does not make a multi-step read/modify/write transaction atomic. Avoid holding a blocking lock across suspension or external reentrant callbacks without proving that contract safe.

## Flow represents behavior

Before changing operators or stream types, establish whether consumers require current state, every event, replay, completion, or recovery. Inspect collection count and the sharing scope. Cold producers can run again for each collector; hot producers and their resources may outlive a collector.

`StateFlow` keeps current state and suppresses equal updates; it does not guarantee observation of every intermediate value. In-place mutation of the current object can leave consumers unaware. `SharedFlow` replay, buffer and overflow settings determine what late, slow or absent subscribers receive; it is not automatically a durable or exactly-once event channel.

Preserve ordering and loss expectations when adding `buffer`, `conflate`, `collectLatest`, `shareIn` or `stateIn`. Cancellation of prior work can interrupt side effects. `flowOn` changes eligible upstream operators, not the downstream collector; moving it is a semantic change. Check the location of `catch`/retry and whether the error belongs to upstream work or collection.

## Verify interruption and time

Use the project's coroutine-test setup when available. Keep cooperating test dispatchers on the intended scheduler; virtual time does not advance arbitrary dispatchers, real I/O or native callbacks. Restore global dispatcher overrides and close test-owned resources.

Choose tests that observe the changed behavior: parent cancellation, cleanup, failure propagation, stale-result suppression, sharing restart, replay, or a slow/absent collector. Do not require a collector to observe every `StateFlow` intermediate update. Host scheduling tests cannot establish a platform API's thread or lifecycle behavior.

## Primary documentation

- [Scope and structured concurrency](https://kotlinlang.org/docs/coroutines-basics.html)
- [Cancellation and cooperative interruption](https://kotlinlang.org/docs/coroutines-cancellation.html)
- [StateFlow contract](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/)
- [SharedFlow contract](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/)
- [flowOn context boundary](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html)
- [Coroutine test facilities](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/)
