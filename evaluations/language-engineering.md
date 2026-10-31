# Language implementation probes

The Kotlin, Python, C++, Swift and Go routes use original fixture tasks to test bounded behavior and evidence discipline. The general reviewer keeps its own language references. Test definitions, candidate observations, and matched comparative experiments are distinct records.

## Protocol

Give a fresh working agent only the selected skill snapshot, raw fixture and realistic request. Keep observer checks, prior answers, suspected remedies and other runs separate. Work in isolated temporary directories with no production credentials, dependency/toolchain installs or global configuration changes. Preserve initial inputs and record skill/source fingerprints and actual tool settings.

The independent observer checks the delivered source or artifact against the requested contract. A deliberately faulty initial fixture can show that a probe fails, but it is not a no-skill model baseline. Repeated matched model/runtime runs with the same independent acceptance checks are needed for comparative claims. The [outcome evaluator](outcome-benchmarks.md) can compare completed workspaces; it does not supply their provenance or make source-level reasoning equivalent to execution.

## Kotlin: suspend lookup and cleanup

Use a dependency-free JVM fixture with its existing JVM target and these declarations:

```kotlin
package fixture

class MissingItem(message: String) : Exception(message)
class Activity(var active: Int = 0)

suspend fun lookup(load: suspend () -> Any?, activity: Activity): Any? {
    activity.active += 1
    return try {
        load()
    } catch (_: Exception) {
        null
    }
}
```

Request: preserve the API and successful result identity; return null for `MissingItem` only; propagate other failures and cancellation unchanged; balance each invocation's activity contribution when it finishes. Calls can overlap on one coroutine execution thread. Do not add Android, a coroutine framework, or dependencies to a plain JVM fixture.

Observer criteria: success/null, missing-item fallback, ordinary error and cancellation identity, activity before/after suspension, failure after suspension, and overlapping settlement. A manually controlled continuation can establish these deterministic paths without a scheduler dependency; it does not establish kotlinx Job, Android lifecycle or iOS behavior. Use an available compiler without mutating caches or downloading one, and disclose any unavailable execution.

## Python: async lookup and cleanup

Use a dependency-free package with its declared interpreter requirement and this module:

```python
class MissingItem(LookupError):
    pass

class Activity:
    def __init__(self):
        self.active = 0

async def lookup(loader, activity):
    activity.active += 1
    try:
        return await loader()
    except BaseException:
        return None
```

Request: preserve the public callable/classes; return successful results unchanged and None only for `MissingItem`; propagate all other failures including cancellation; always balance the invocation's activity contribution. Multiple calls may overlap in the same event loop. Do not change interpreter support, package dependencies or the existing signature.

Observer criteria: object identity, null result, fallback, exception identity, cancellation before/after suspension, and counter state while concurrent calls settle. Use explicit events/continuations rather than sleeps to arrange order. Observe the declared minimum interpreter when available. Import/source checks do not establish installed-distribution or external-service behavior.

## C++: capacity arithmetic at representable limits

Use a header-only target under its existing C++ standard with this API and initial implementation:

```cpp
#pragma once
#include <cstddef>

class Budget {
public:
    explicit Budget(std::size_t limit) noexcept : limit_(limit) {}
    bool reserve(std::size_t amount) noexcept {
        if (used_ + amount > limit_) return false;
        used_ += amount;
        return true;
    }
    bool release(std::size_t amount) noexcept {
        if (amount > used_) return false;
        used_ -= amount;
        return true;
    }
    std::size_t used() const noexcept { return used_; }
private:
    std::size_t limit_;
    std::size_t used_ = 0;
};
```

Request: for every representable size value, reserve succeeds exactly when the request fits remaining capacity and increments usage by that amount; release succeeds exactly when it does not exceed usage and decrements it. Rejection leaves state unchanged. Zero-sized operations follow the same rules. Preserve the public header/API, `noexcept`, layout and selected standard; this is not a concurrent class.

Observer criteria: compile a separate consumer and compare sequences with an independent capacity model, including zero, exact boundaries and maximum representable values. Keep arithmetic defined in the fixture; do not execute known invalid memory accesses to produce evidence. Host compilation/tests do not establish Qt/QML, plugin ABI, foreign architecture or exhaustive UB coverage.

## Swift: latest invocation supersedes older completion

Use a dependency-free Swift package under its existing tool/language settings:

```swift
public actor PreviewModel {
    public private(set) var frame: String = ""
    private var generation: Int = 0

    public init() {}

    public func refresh(load: @Sendable () async throws -> String) async throws {
        generation += 1
        let ticket = generation
        let value = try await load()
        frame = value
    }
}
```

Request: once a newer invocation starts, a successful completion from an older invocation must not replace frame. A successful latest invocation updates frame, and thrown failures retain their contract. Keep public API, package requirements and dependency-free design. Do not change language mode, add unchecked isolation escapes, or install an SDK/compiler.

Observer criteria: arrange older completion both before and after a newer success, newer failure followed by an older success, and superseded failures. Inspect the state decision after suspension. Source-level reasoning can establish a proposed interleaving and whether the patch addresses it; compilation and execution need a Swift compiler. Apple UI and Metal need their own SDK/destination/GPU evidence even if a portable package compiles.

## Go: cancellation, errors, panic and permit ownership

Use a dependency-free module under its existing Go support declaration:

```go
package gate

import "context"

type Gate struct { slots chan struct{} }

func New(capacity int) *Gate { return &Gate{slots: make(chan struct{}, capacity)} }

func (g *Gate) Run(ctx context.Context, work func(context.Context) error) error {
    select {
    case g.slots <- struct{}{}:
    case <-ctx.Done():
        return ctx.Err()
    }
    return work(ctx)
}
```

Request: positive capacities bound concurrent callbacks; admitted work runs once with the exact caller context; callback errors and panics propagate; each acquired permit returns on every callback finish. Already-cancelled callers and callers cancelled while waiting must return their context error without invoking work. Preserve API/module support and avoid new dependencies or detached workers.

Observer criteria: capacity under coordinated concurrent work, context/error identity, panic preservation and permit reuse, pre-cancelled entry, and cancelled waiting. Timeouts bound a failing test; they do not arrange an ordering. Keep cache/temp outputs scoped, disable implicit network/toolchain/workspace resolution for the fixture, and record actual test/vet/race configuration. A host's newer Go pass does not establish execution on the module minimum or every build tag/cgo/platform.

## Routing and decision probes

The routing and overlap corpora include positive implementation requests, negative review/diagnosis/migration cases, and mixed caller/helper or native-stage handoffs. [behavioral-cases.json](behavioral-cases.json) adds text/zero-write probes for each language's decision boundaries. Phrase matches remain proxies requiring human review. Metadata-only selection, installed-client invocation, generated-code behavior and release readiness are different claims.

## Observed candidate evidence

On 2026-10-31, fresh-context working agents received the relevant skill, raw fixture and request above, without the observer's tests or a proposed remedy. A separate parent pass inspected their artifacts and ran independently authored acceptance checks in temporary workspaces. No dependencies or toolchains were installed for these exercises. These are single-task observations, not a paired no-skill experiment.

| Language | Parent observation | Evidence limits |
| --- | --- | --- |
| Kotlin | Compiled the delivered implementation with cached Kotlin 2.4.20, JVM target 17 and JDK 17.0.21. Ten controlled-continuation cases passed, including result/error identity, suspension, cancellation exceptions and overlapping completion. The same observer failed on the initial implementation. | Fixture compilation/runtime used the standard library only; compiler runtime dependencies stayed separate. No kotlinx Job scheduler, Android, iOS or multithreaded execution was exercised. |
| Python | Six independent async tests passed on Python 3.11.17 and 3.14.8, covering values, the specified fallback, other failure identity, task cancellation, overlapping calls and a synchronous loader failure. The initial implementation failed the observer. | Source-module execution only; no installed distribution, bot service, external dependency or other interpreter was exercised. |
| C++ | A separate C++17 consumer compiled with GCC 16.2.1 and retained the API's checked signatures and `noexcept` properties. All 4,000 operations over 25 capacity sequences matched an independent unbounded-integer model, including zero and maximum-size boundaries. The initial implementation disagreed on 3,164 operation results/state observations. | Native Linux host and one compiler/configuration; no Qt/QML, plugin ABI, foreign target or sanitizer claim. A finite corpus is not exhaustive representable-input execution. |
| Swift | Source inspection found a generation check after the throwing suspension and before frame assignment, preserving error propagation and the public API. Four controlled-interleaving XCTest cases were delivered. | **Compilation and execution remain unverified:** no Swift compiler was available. No Apple SDK, application, device or Metal output was exercised. |
| Go | Five independent tests, `go vet ./...`, and the same tests with `-race` passed on Go 1.27.3, linux/amd64, cgo enabled. Tests covered context/error identity, pre-cancellation, panic/permit reuse, cancellation while waiting, capacity and callback count. The initial implementation failed the panic/permit-reuse test. | Module declaration remained Go 1.21, but that minimum was not executed. Network/toolchain/workspace resolution was disabled (`GOPROXY=off`, `GOTOOLCHAIN=local`, `GOWORK=off`); other platforms, tags and native integrations were not exercised. |

A separate selection agent received only the 28 skill names/descriptions and 30 held-out prompts: three implementation requests and two negative boundaries per language, plus five mixed-language/general cases. Its 30 primary selections matched the intended owner or no-skill outcome. This is a catalog-only observation, not automatic invocation in an installed client. The metadata snapshot SHA-256 is `6e34801268a5c038ac67e141e8a9a6bcc9fc7a1e1e672fcc7b13472887fa30c9` (names/descriptions sorted by skill path, JSON sorted keys and compact separators).

The new implementation skill snapshots used for these observations have the following SHA-256 digests. Each digest hashes sorted skill-relative file paths, a NUL, file bytes, and a NUL; it excludes this evaluation document and the separate reviewer folder.

| Skill folder | SHA-256 |
| --- | --- |
| `kotlin-engineering` | `f7a5314406f280ce2e154df77a3a45ae0eaf9a056c3256768ec8e5968e115759` |
| `python-engineering` | `b437f990a4fe18717ca651ce7aceeebe6c815a50413a0f13136a2b0624f142a4` |
| `cpp-engineering` | `0fda2a74aa9ddeb48ac0775072754fc0595f77443b06561c893018114c8120c9` |
| `swift-engineering` | `a0d911ea1d70b3cf8df368fdb6b6f13d26cd88a198f217a10360ec7230d6229c` |
| `go-engineering` | `fade4d81fe6b8600a7e513e3b22c9a8de41dd71c05cd34d24718b7f34446da39` |

Toolkit integration checks observed zero structural errors/warnings, 65 passing Node tests with none skipped, 16 helper smoke commands with 31 assertions and unchanged input fixtures, and passing TypeScript-quality/release-metadata checks. An isolated setup installed 28 skills into each of the standard and Claude folders, byte-compared all 189 skill files per target, preserved user instruction text and a single managed block, and remained unchanged on a second setup. Six native Codex roles and the Mission Control check passed. These local observations do not establish remote CI, every supported client/OS, release readiness, comparative model quality or token savings. The added decision-boundary corpus is a test definition; its full paired model benchmark was not run.
