# Modules, build selection, and evidence

Read when a task touches package boundaries, Go versions, dependencies, build tags, cgo, or platform support.

## Identify the selected source and toolchain

Inspect the actual module root and active workspace, including `use`/`replace` directives, vendor mode, the `go` and `toolchain` lines, and repository CI commands. A workspace can make local replacements succeed while an independently consumed module fails. Do not commit a developer-specific workspace or remove a replacement without resolving its purpose.

The selected toolchain can differ from the executable initially on PATH, and automatic selection can download another toolchain. Observe relevant `go env` settings and the effective toolchain within existing execution permissions. Do not force a download or raise the module's required language version to obtain a convenient API. A preferred development toolchain and the supported module minimum serve different purposes.

Respect the existing dependency/vendor policy. `go mod tidy`, `go get`, and regeneration can change more than the edited package; use them only when the authorized change requires their effect and inspect the resulting diff. Avoid treating a missing network download as a reason to update versions.

## Choose configurations deliberately

Trace `//go:build` expressions, OS/architecture filename suffixes, cgo constraints, and tags used by CI. Tests exercise the files selected for that configuration; a default `go test ./...` does not cover every tag, nested module, workspace module, or foreign platform. Select affected packages from each required module using repository commands rather than assuming one glob covers them all.

For cgo, inspect native headers/libraries, linker flags, allocation ownership, retained pointers, callbacks, and thread requirements. Follow the current Go/C pointer-passing and pinning rules; a pointer-shaped value is not permission for C to retain Go memory. Verify the actual C toolchain/SDK where available. Disabling cgo can select a different implementation instead of testing the one being changed.

## State what ran

Use formatting and `go vet` according to repository policy, plus focused tests and any necessary broader package test selection. Separate vet's static checks from runtime assertions; `go test` does not run every possible vet analyzer. Use the race detector for changed concurrent paths where the platform supports it and disclose excluded paths or cgo limitations.

Report GOOS/GOARCH, tags, cgo selection, relevant module/workspace mode, and executed tests when they change the evidence. Cross-compilation proves compilation/linking for that selection; runtime tests need an appropriate host, runner, or device. Check repository-specific CLI/service packaging when entry points or generated assets change.

## Primary sources

- [Go modules reference](https://go.dev/ref/mod)
- [Go toolchain selection](https://go.dev/doc/toolchain)
- [Go command: build constraints and testing](https://pkg.go.dev/cmd/go)
- [cgo: passing pointers](https://pkg.go.dev/cmd/cgo#hdr-Passing_pointers)

Read documentation for the supported Go release before relying on a newer language feature, library API, or tool behavior.
