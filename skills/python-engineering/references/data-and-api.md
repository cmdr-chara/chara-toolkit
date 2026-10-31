# Python data and callable contracts

Read when changing public functions, input parsing, return values, error handling, or a module port.

## Retain what callers can observe

Resolve positional and keyword arguments, defaults, return types, aliases/shared objects, eager versus lazy evaluation, and whether the function is synchronous, a coroutine, or an iterator. A generator can defer both work and errors until iteration; replacing it with a list can change memory use, failure timing, and which effects happen at all.

Defaults and class attributes may hold shared mutable state. Establish whether sharing is intended before changing it. Conversely, replacing a deliberately shared object with copies can break identity and coordination. Inspect callers, not only annotations.

Adding required keyword-only arguments, changing an exception class, normalizing text, returning a new data model, or converting a sync method to async can break callers. Keep the accepted change small and provide a compatibility path only when that path belongs to the task.

## Preserve information at input boundaries

Choose bytes, text, paths, numbers, mappings, and records according to the established domain. Distinguish missing keys from explicit null/`None`, empty values from defaults, and insertion ordering from sorted output. Arbitrarily sized Python integers do not justify silently widening or narrowing a port's specified numeric behavior.

Use annotations and existing validation mechanisms to make assumptions visible, but check untrusted runtime data where it enters the system. A cast for a type checker does not establish that a value meets the declared schema. A dataclass or protocol may clarify a stable boundary; neither is mandatory for every dictionary or small function.

Do not use assertions as the only enforcement for required caller-input validation: optimized execution can remove them. An assertion remains useful for an internal invariant when its execution semantics fit the contract.

## Error behavior is an interface

Preserve useful exception categories and attributes, causal information, CLI status, and diagnostics that callers inspect. Do not turn an operational failure into an empty success value merely to simplify the type. A broad catch may be justified at a process or framework boundary, but it needs an explicit recovery/translation policy and must not erase cancellation or termination semantics accidentally.

Keep sensitive values out of exception context, object formatting, and logs. Test redaction when a changed representation could expose credentials or user data. Match the project's error model; a custom exception hierarchy for every leaf operation adds no inherent value.

## Ports need a supported domain

Map the source's callable, serialization, numerical, collection, and failure behavior before selecting Python conveniences. Carry over meaningful tests and compare executions when both runtimes are available. Document authorized differences and unresolved ones separately; describing a divergence is not authorization to narrow the input contract. Source undefined behavior cannot be reproduced as a portable guarantee.

## Sources and refresh boundary

- [Python typing](https://docs.python.org/3/library/typing.html): annotations and runtime enforcement limits.
- [Built-in exceptions](https://docs.python.org/3/library/exceptions.html): hierarchy and exception context.
- [Assert semantics](https://docs.python.org/3/reference/simple_stmts.html#the-assert-statement): optimized execution behavior.

Check the target interpreter's documentation and actual framework/validation library before relying on a newer typing feature, model conversion rule, or exception behavior.
