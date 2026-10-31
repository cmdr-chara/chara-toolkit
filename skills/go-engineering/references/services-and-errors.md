# Errors and external resource behavior

Read for error/interface changes, HTTP clients/handlers, streaming/file operations, or CLI effects.

## Treat errors as a caller contract

Inspect how callers compare errors, use `errors.Is`/`errors.As`, retry, map statuses, or choose exit codes. Wrapping an error can expose its identity to callers; replacing `%w` with text can remove it. Add context while preserving the established matching behavior, and avoid logging the same error at every layer. Do not turn a recoverable operation error into a panic or swallow it merely to simplify the signature.

Check interface returns for typed nil pointers. An interface holding a typed nil pointer is not itself nil; return an actual nil interface for success when that is the contract. Method receiver changes can also alter interface satisfaction and nil-receiver behavior. Tests should observe caller decisions rather than compare arbitrary error text unless that text is an intentional interface.

For a port, preserve which failures produce partial output or effects, how cleanup errors interact with the original failure, and whether retrying can duplicate an effect. Check nil versus empty collections, shared slice backing arrays, byte indexing versus decoded runes, and any caller-visible ordering. Do not invent stable map iteration or infer idempotency from a Go function's name or error result.

## Close resources at their owning boundary

Identify the owner of each file, response body, connection, timer, and background task. Arrange cleanup after successful acquisition, including early returns. A `defer` runs when its function returns; placing many defers in a long-running loop can retain resources beyond each iteration. Preserve meaningful close/flush errors where the caller's result depends on them.

For HTTP clients, propagate the request context, use the existing client/transport and timeout policy, inspect status codes explicitly, and close response bodies on all owned paths. Non-success HTTP statuses do not automatically become transport errors. Bound response processing according to the application; do not drain an unbounded body merely to encourage connection reuse. Verify the supported release's read/close behavior before relying on reuse.

For servers, preserve response status/header ordering, body limits, cancellation behavior, and shutdown ownership. Graceful shutdown and handler completion need an explicit wait/cancellation plan for application background work and long-lived connections. For CLIs, preserve stdout/stderr roles, exit behavior, signal handling, and cleanup before process termination.

## Useful evidence

Use controlled HTTP handlers/transports, temporary files, and injected failures instead of a live external service when the test can express the contract locally. Cover early body/read/write errors, cancellation, non-success statuses, typed nil success, and cleanup where relevant. Keep network, credentials, and production mutation outside implicit test setup.

## Primary sources

- [Go error wrapping and matching](https://pkg.go.dev/errors)
- [Go FAQ: nil errors and interface values](https://go.dev/doc/faq#nil_error)
- [Go specification: slices, strings, and iteration](https://go.dev/ref/spec)
- [Go HTTP client and server contracts](https://pkg.go.dev/net/http)

Check the declared release and any selected HTTP framework before using a version-sensitive behavior or newly added helper.
