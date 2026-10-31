# Reviewing Swift changes

Read for a Swift diff or bounded Swift refactor. The review workflow retains finding admission, severity, approval, and iteration limits. This checklist is self-contained; installing an implementation skill is not required.

## Establish the effective contract

Inspect affected packages/targets, callers, compiler and language mode, strict concurrency/default isolation settings, enabled features, supported platforms, and CI. For Apple targets, separate SDK, deployment minimum, architecture, configuration, and destination. A compiler version or host build does not establish all of these.

Trace changes to access levels, labels, initializers, protocols, value/reference identity, copying/mutation, error/optional behavior, serialization, and ordering. Check exported/native callers where relevant. Prefer a reachable consumer or behavior regression over a language-style preference: classes, callbacks, locks, value wrappers, strong captures, and existing UI frameworks may be deliberate.

## Challenge lifetime and ordering assumptions

- Follow stored/escaping closure owners, captures, delegates, observers, timers, task handles, and native resources through teardown and failure. Can an introduced cycle retain required cleanup, or a weak capture discard required work? Is an `unowned` referent provably alive at use?
- Follow each isolation crossing under the effective compiler settings. Does `Sendable` match reachable mutable state? New unchecked, preconcurrency, unsafe-isolation, or warning-suppression annotations need their actual contract examined; the annotation itself is neither proof of safety nor proof of a defect.
- Recheck invariants across `await`. Actor serialization does not make the full suspended operation atomic. Can a stale callback overwrite current state, cancellation duplicate/lose an effect, or task work outlive its owner?
- For continuations, challenge all completion/error/cancellation paths and competing callbacks against exactly-once resumption. Trace lock/queue reentry and blocking waits that can prevent executor progress.
- For unsafe/native boundaries, check pointer validity, layout, encoding, ownership, callback lifetime/executor, nullability, and error mapping on both sides. A Swift-only mock does not establish foreign retention or destruction behavior.

## Load Apple and GPU concerns only when touched

For Apple UI changes, check main-thread/actor entry from framework and native callbacks, observation disposal, view/window replacement, and actual interaction state. Verify availability guards and fallback behavior against the supported OS; `canImport` is not a runtime API-availability check. Raising deployment targets or relaxing concurrency settings is a contract change, not an ordinary review fix.

For Metal/rendering changes, trace shader/CPU layout, pipeline/attachment compatibility, storage/hazard mode, resource retention, conflicting reads/writes, completion, reuse, and readback/presentation. Check the API generation actually used; current Metal synchronization defaults do not apply universally. Require output evidence relevant to the claim, with identifiable revision, device, viewport/scale, content, and comparison tolerance where applicable.

## Select meaningful verification

Use repository-supported package/test commands or the actual Xcode scheme/configuration/destination. Respect execution permissions for manifests, plugins, macros, build phases, and tests. Do not install tools, change signing, raise OS/compiler minimums, or rewrite architecture merely to run a review check.

Exercise the observable failure and affected caller where feasible; distinguish baseline failures from introduced ones. Match build/test configuration to the changed contract. Report compilation, tests, launch, interaction, and GPU evidence separately. Linux/host compilation, simulator tests, or historical captures leave distinct Apple/device/rendering coverage gaps.

Retire candidates without a reachable contract violation. State executed checks and unexamined targets; a clean diagnostic run does not establish lifetime, cancellation, logical ordering, or rendered parity.

## Primary sources and refresh boundary

- [Swift ARC](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/)
- [Swift concurrency](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/)
- [Concurrency compiler diagnostics and contracts](https://www.swift.org/migration/documentation/swift-6-concurrency-migration-guide/commonproblems/)
- [Apple platform and OS availability](https://developer.apple.com/documentation/xcode/running-code-on-a-specific-version)
- [UnsafePointer requirements](https://developer.apple.com/documentation/swift/unsafepointer)
- [Metal resource synchronization](https://developer.apple.com/documentation/metal/resource-synchronization)

Consult official documentation for the actual compiler, SDK, foreign API, and GPU when a version-sensitive claim determines a finding.
