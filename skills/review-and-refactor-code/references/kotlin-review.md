# Reviewing Kotlin contract changes

Read for a Kotlin diff or bounded Kotlin refactor. This checklist is self-contained; it does not require a Kotlin implementation skill. The general reviewer retains finding admission, severity and scope. Report a reachable introduced failure, not a language convention or preferred architecture.

## Establish the affected consumers

Inspect local instructions, module/source-set boundaries, Kotlin language/API settings, JDK and bytecode targets, dependency visibility and relevant CI. Determine whether the changed code serves JVM/Java consumers, Android, Compose or KMP targets. Apply only the relevant platform checks; a Kotlin server/library need not adopt Android, Compose, coroutines or a particular server framework.

Check public signatures, named/default arguments, overloads, generated Java names, sealed variants, serialization and persisted values against actual callers. Distinguish source, already-compiled binary and data compatibility. An `api` dependency changed to `implementation` can hide a type consumers need; show the affected public surface before calling it a defect.

## Challenge Kotlin assumptions

- Nullability: trace platform types, Java annotations, casts, `!!`, `lateinit` and missing/malformed inputs to the failing consumer. Safe-call/default rewrites can silently discard errors or data. Neither an assertion nor nullable return is a finding by itself.
- Values and aliases: generated data-class equality/copy use primary-constructor properties and copying is shallow. Read-only collections can retain mutable aliases. Does the diff change identity, hashing, emitted state or a persisted representation for a reachable input?
- Java callers: verify property accessor/file facade names, overloads, exceptions and interoperability annotations where affected. A Kotlin caller compiling does not prove that the Java call shape still exists.
- Ports: compare numeric ranges, overflow assumptions, ordering, encoding, failure behavior and cleanup. An idiomatic expression is not evidence of behavioral parity.

## Coroutine and stream changes

Find the parent job, lifetime owner, dispatcher and failure observer. Trace changed cancellation, retries, supervision, resource cleanup and callback unregistering. `suspend` does not move blocking work off its caller's thread. A new detached scope, swallowed cancellation or changed dispatcher needs a reachable consequence before admission.

Check `CancellationException` through broad catches and `runCatching`; confirm a cancellation cannot continue the changed side effect unintentionally. Inspect races between cancellation, callback completion and disposal, as well as multi-step updates across suspensions. A thread-safe state holder does not establish transaction atomicity.

For Flow, compare hot/cold behavior, collector count, sharing lifetime, start/stop policy, replay, buffering, equality and loss expectations. `StateFlow` does not deliver every intermediate update, and in-place mutation can suppress observation. `SharedFlow` does not guarantee durable/exactly-once delivery. Moving `flowOn` changes eligible upstream execution, not downstream collection. Tie operator changes to concrete stale state, dropped/duplicated effects, ordering or resource failures.

## Android, Compose and KMP checks when applicable

- Compose: identify state ownership and observable updates. Inspect effect keys, captured callbacks, cancellation/restart and listener cleanup. A constant effect key, `remember`, or mutable state is not automatically wrong; prove the stale callback, lost state or incorrect lifetime. Do not recreate a shared player/session to fix screen-local behavior.
- Lifecycle: determine when collection should stop and restart, and whether repeated execution is safe. Long-lived background playback can be intentional. Check actual Compose Multiplatform APIs and event mappings before treating Android assumptions as portable.
- Media3: follow the player's application-looper contract, listeners, session/service ownership and release path. Moving every call to an IO dispatcher is not a universal correction. Host mocks do not establish device threading/audio behavior.
- KMP: trace all source sets consuming a changed common API, inherited actual declarations and dependency availability. Do not impose Android/JVM types on common code or assume one host's compilation covers Apple adapters and foreign consumers.

## Evidence and reporting

Build plugins, wrapper execution and tests run code and may download artifacts; stay within repository permissions. Prefer existing module/variant/target tasks. Do not upgrade dependencies, remove targets, add opt-ins or weaken lint just to obtain a green review check.

Use focused regression or parity checks for the alleged failure. Coroutine virtual time does not control arbitrary real dispatchers or native callbacks. Distinguish host tests, target compilation, framework linking, app packaging and simulator/device execution; an iOS `.klib` compile is not a running iOS app. Report unavailable target/device coverage explicitly.

Keep established regressions separate from pre-existing defects, style requests and unproven concerns. A preference for immutable APIs, `StateFlow`, a different scope, expression syntax or a newer library is not evidence of incorrect behavior.

## Primary sources

- [Kotlin null safety](https://kotlinlang.org/docs/null-safety.html), [Java platform types](https://kotlinlang.org/docs/java-interop.html) and [Java call shapes](https://kotlinlang.org/docs/java-to-kotlin-interop.html)
- [Data-class equality and shallow copy](https://kotlinlang.org/docs/data-classes.html)
- [Coroutine cancellation](https://kotlinlang.org/docs/coroutines-cancellation.html) and [StateFlow semantics](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/)
- [SharedFlow delivery](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-shared-flow/) and [Flow execution contexts](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html)
- [Compose effects](https://developer.android.com/develop/ui/compose/side-effects) and [multiplatform lifecycle](https://kotlinlang.org/docs/multiplatform/compose-lifecycle.html)
- [Media3 threading](https://developer.android.com/media/media3/exoplayer/hello-world)
- [KMP source sets](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html) and [Native host limits](https://kotlinlang.org/docs/native-target-support.html)
- [Gradle dependency visibility](https://docs.gradle.org/current/userguide/java_library_plugin.html)

Refresh version-sensitive API/toolchain facts against the project's declared versions before using them to admit a finding.
