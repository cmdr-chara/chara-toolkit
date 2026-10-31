# Python task and resource lifetimes

Read for bots, services, workers, asynchronous APIs, subprocesses, and acquired resources.

## Connect cancellation to state

For each await that can interrupt a multi-step operation, identify the state already changed, resources acquired, effects committed, and ownership of any cleanup. Cancellation is an outcome to propagate through the surrounding contract; it is not automatically a retryable ordinary error or a successful fallback.

Use the project's structured task facilities when they fit its supported interpreter. Retain and observe the tasks the component owns, decide who cancels and waits for them, and surface unexpected failures. Creating a task does not establish successful completion, and dropping a reference is not a reliable shutdown protocol.

Keep cleanup in an appropriate context manager or `finally` path. If handling cancellation explicitly, preserve its propagation after the required bounded cleanup unless the operation's documented contract intentionally transforms it. Consider cancellation during cleanup itself, partial acquisition, and whether a later retry could repeat an already-committed effect.

## Respect the actual execution model

Use the event loop and lifecycle owned by the application/framework; do not start another top-level event loop inside a running async application. Identify synchronous blocking calls in async handlers and use the existing offload or async client facilities when needed. Offloading work to a thread does not make it forcibly cancellable or make its side effects disappear when the awaiting task ends.

Do not rely on an assumed interpreter lock to make a multi-step shared-state update atomic. Establish the thread/process/runtime model and protect the actual invariant when data is shared. Introducing worker threads, processes, queues, or a different async framework changes ownership and shutdown behavior and must fit the accepted scope.

## Close external boundaries

State who owns open files, sockets, clients, cursors, transactions, and child processes. Borrowed resources should not be closed by an operation that does not own them. For partial failures, determine whether rollback, retry, compensation, or explicit failure is required by the external protocol.

Construct subprocess arguments as structured arguments rather than interpolating untrusted shell strings. Validate file and command scope independently of quoting. Define timeouts and termination/wait behavior for the process tree actually owned; a timeout or kill request is not itself proof that every descendant stopped.

## Use deciding tests

Exercise cancellation after acquisition and before completion, repeated shutdown, a failed dependency, and a retry after a committed effect where those paths are material. Coordinate with events, fake clocks, or controlled adapters instead of timing a race with sleeps. Assert resource/state outcomes and task settlement, not merely that a coroutine returned once.

## Sources and refresh boundary

- [asyncio tasks and cancellation](https://docs.python.org/3/library/asyncio-task.html): task ownership, cancellation and structured execution.
- [Subprocess management](https://docs.python.org/3/library/subprocess.html): arguments, streams, waits and termination.

Resolve the interpreter and the framework/client versions in the repository before selecting cancellation, timeout, task-group, or process APIs. Check their official lifecycle contracts; behavior across threads, remote services, and processes is not interchangeable.
