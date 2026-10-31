---
name: go-engineering
description: Implement bounded Go package, service, CLI, or source-language port changes with explicit concurrency, error, and build contracts. Use when Go is already chosen. Not for review-only work, unknown failures, dependency transitions, or release decisions.
---

# Go Engineering

Deliver the requested Go behavior with a clear owner for background work, shared state, and external resources. Let the repository's supported module and runtime contracts determine the implementation.

## Trigger boundary

Use this skill for a bounded Go feature, an explained defect's implementation, or a port whose Go target and observable behavior are already agreed.

Do not trigger for reviewing a diff without implementation work, diagnosing an unknown hang or race, upgrading the Go/dependency support matrix, or deciding to replace an existing service with Go. A mention of goroutines, a `go.mod`, or a Go-based tool does not by itself select this skill.

## Required inputs

Determine the package/module boundary, affected callers, existing checks, and service or CLI lifecycle. Inspect `go.mod`, active `go.work`, toolchain directives, vendor/replacement policy, build tags, generated code, CI, supported GOOS/GOARCH, and cgo use. Establish public signatures, error matching, wire/storage formats, cancellation, output, and exit-code contracts before editing them.

For a port, identify the source revision and supported input domain, including ordering, numeric/text behavior, failures, timeouts, and external effects. Resolve deployment or coexistence changes separately from the bounded implementation.

## Safety baseline

- Keep public API and error identity/wrapping, operational limits, dependencies, and the declared Go version within scope. Do not add a library, introduce generics/newer APIs, or run broad module updates just to match a preferred style.
- Preserve intentional mutex, channel, and ownership designs unless the requested behavior requires changing them. Channels do not automatically improve an existing lock-based design.
- Account for command side effects: Go tooling may download modules/toolchains, tests execute code, cgo invokes native tools, and generators execute programs. Inspect relevant hooks and use existing authorization; `go generate` is not an automatic validation step.
- Do not turn test setup into a live service change, use production credentials by default, or silently overwrite generated files and unrelated module sums.

## Workflow

1. **Define caller-visible behavior.** Trace the package's callers, command entry point, request handlers, and startup/shutdown path. For ports, characterize representative source results before selecting replacement types and APIs.
2. **Confirm the build boundary.** Read [modules-and-builds.md](references/modules-and-builds.md) for module/workspace, version, build-tag, cgo, or cross-platform decisions. Determine the exact package/configuration set before choosing test commands.
3. **Assign concurrent work and state.** Read [concurrency-and-context.md](references/concurrency-and-context.md) when goroutines, locks, channels, cancellation, timers, or shutdown are affected. Identify how work stops and how its completion is observed.
4. **Preserve external semantics.** Read [services-and-errors.md](references/services-and-errors.md) for errors/interfaces, HTTP, streams, files, or CLI effects. Establish cleanup and error precedence before changing success paths.
5. **Implement and test the distinction.** Add focused behavior/port-parity coverage where warranted. Exercise relevant failure, cancellation, and cleanup paths. Coordinate concurrent tests with observable barriers or events; elapsed sleeps do not prove an ordering.
6. **Validate the delivered configuration.** Apply repository formatting, affected tests and vet checks, plus supported race/build-tag/platform checks warranted by the change. Inspect the final diff and module files; report executed packages/configurations and meaningful coverage gaps.

## Handoffs and interaction boundaries

Go implementation and a scoped port can run using this package alone. Where installed, `review-and-refactor-code` decides review findings/refactor parity, and `debugging-investigator` investigates unknown failures. Changing a service's compatibility or rollout contract belongs to `codebase-evolution-controller`; it can hand a bounded implementation stage here. Use `security-review` for a security-first decision, `optimize-codebase-performance` for a measured bottleneck, and `verification-and-release` for integrated release judgment when those tasks arise. Their absence does not transfer authority for an unresolved migration or ship decision.

## Failure handling

When cancellation or ownership is ambiguous, trace the creating caller, blocked operations, and shutdown wait before adding another goroutine. A flaky concurrent test needs a causal ordering or lifecycle explanation; retries and longer sleeps are not evidence of a repair. Report unavailable modules, race support, native tools, or foreign targets precisely, without changing the version or dependency policy to hide the gap. Continue independent implementation only where the missing contract cannot invalidate it.

## Stop conditions

Finish with the requested behavior implemented, callers/error/resource obligations addressed, focused checks observed, and untested configurations disclosed. Stop before an unresolved API/error change, support-version increase, new dependency, production mutation, or migration decision outside the request. Passing tests, vet, and race checks is bounded evidence, not proof of all schedules or deployment readiness.
