# Reviewing Go package and concurrency changes

Use for a selected Go diff or behavior-preserving refactor. The invoking review workflow owns scope, finding admission, severity, and approval. This checklist works without installing a Go implementation skill.

## Locate the active program

Inspect affected packages/callers, module and active workspace files, version/toolchain requirements, replacements/vendor policy, build tags, GOOS/GOARCH, and cgo selection. Trace exported types and methods, error matching, wire/storage formats, CLI output/exit behavior, and request/shutdown semantics. A workspace replacement or host-only test may hide a broken published-module or platform path.

Treat synchronization and API style as design choices until a concrete consequence is demonstrated. Mutexes need not become channels; interfaces need not be introduced for every type. A preferred newer library API does not justify raising the Go requirement or adding a dependency in a review fix.

## Challenge concurrent ownership

- For each goroutine, find its creator, cancellation signal, blocked operations, and completion observer. Cancellation does not wait for completion or stop a context-unaware operation. Can abandoned consumers leave a send or shutdown wait blocked?
- Follow the incoming context through outgoing calls and derived contexts; check cancellation cleanup on every path. Detaching from a request needs an intentional background owner. Do not label a missing context parameter a defect without showing the affected lifecycle.
- Identify the synchronization that orders shared accesses, including map/slice elements and data reachable through pointers. Channel transfer does not prevent later mutation. Check copies of mutex/synchronization-bearing values after use.
- Establish channel send/close ownership and lock ordering. Examine callback reentry, resource cleanup, and waits for dependency cycles. A clean race run cannot prove absence of deadlocks, leaks, or lost effects.

## Check error and resource boundaries

Preserve sentinel/type matching and wrapping exposed to callers, including `errors.Is`/`errors.As` behavior and typed nil returns through interfaces. Show the changed caller decision before treating an error-text/style difference as a regression.

Check file/response-body/connection/timer ownership, early returns, partial effects, and close/flush errors. Defers in a long-running loop may postpone cleanup. For HTTP, inspect request context, timeouts, status handling, bounded reads, body closure, and shutdown of application workers or long-lived connections. For cgo, verify native ownership and legal retained Go pointers against the actual boundary.

## Verify the selected configuration

Prefer formatting checks during read-only review. Use repository package tests and vet configuration; tests execute code and tooling may fetch modules/toolchains. `go test ./...` does not cover every workspace/nested module, build tag, OS, or cgo branch, and its vet selection is not exhaustive. Cross-compilation does not execute tests.

Concurrent tests should arrange the ordering under scrutiny with explicit coordination and finish their workers. Longer sleeps and retries can hide the defect. Race detection only observes exercised accesses on supported configurations; state untested paths explicitly. A finding needs a reachable changed path and consequence, with the smallest useful regression test when feasible.

## Primary sources

- [Go modules and workspaces](https://go.dev/ref/mod)
- [Go command and build constraints](https://pkg.go.dev/cmd/go)
- [Context lifecycle](https://pkg.go.dev/context)
- [Go memory model](https://go.dev/ref/mem)
- [Race detector evidence limits](https://go.dev/doc/articles/race_detector)
- [Go error interfaces and typed nil](https://go.dev/doc/faq#nil_error)
- [HTTP resource contracts](https://pkg.go.dev/net/http)

Consult the project's supported Go/native/framework release before applying a version-specific guarantee to a finding.
