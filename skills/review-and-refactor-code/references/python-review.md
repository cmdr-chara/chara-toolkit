# Reviewing Python behavior changes

Use for Python code within a defined review or behavior-preserving refactor. Finding admission, edit authority, and review depth stay with the general reviewer; this reference works without another skill installed.

## Inspect the execution contract

Resolve the actual interpreter/environment, relevant package metadata and import roots, public callers and framework entry points. Compare positional/keyword signatures, default values and shared mutable state, exception categories/attributes, iterator laziness, sync/async boundaries, serialized data, and CLI streams/status.

An annotation does not validate a runtime input. A new dataclass, protocol, generic type, package layout, or lint preference is not automatically an improvement or an introduced defect. Show an accepted input or caller that changed behavior. Test mutable-default aliasing and mutation/iteration semantics when the diff can affect them.

## Follow state and effects

- Follow cancellation through await points, exception translation, cleanup, spawned tasks, retries and shutdown. Confirm that interruption settles owned work and does not report a failed/partial operation as success.
- Inspect blocking dependencies in async handlers, framework-owned loops, and thread/process boundaries. Offloaded work may outlive the waiter; an assumed interpreter lock is not a proof of a multi-step invariant.
- Check file, connection, transaction, cursor and child-process ownership on partial failure. Preserve cancellation/termination propagation where required.
- Trace external inputs to shell commands, filesystem paths, database/network calls and runtime parsing when touched. Security-first exploitability retains its own specialist owner.
- Confirm that exception context, object representations, logs and outputs do not newly reveal protected values.

## Match checks to the delivered artifact

Importing or collecting tests can execute code; keep review tools within host permissions. Observe test collection and deciding assertions, not just exit status. Source-tree success may mask omitted package data, wrong import roots, or broken installed entry points. Check the affected supported interpreter/extras/platform combinations where evidence is available.

Missing coverage and static warnings are leads rather than demonstrated regressions. Preserve pre-existing failure attribution and report unexecuted environments plainly. A fix should preserve unrelated contracts and add an assertion that distinguishes the faulty behavior.

## Primary sources and refresh boundary

- [Python exception contracts](https://docs.python.org/3/library/exceptions.html)
- [asyncio task behavior](https://docs.python.org/3/library/asyncio-task.html)
- [Python typing](https://docs.python.org/3/library/typing.html)
- [Package metadata](https://packaging.python.org/en/latest/specifications/pyproject-toml/)

Use the actual interpreter and framework documentation for a version-sensitive review claim. A pass on another environment does not establish the project's supported runtime behavior.
