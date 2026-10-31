# Kotlin types, APIs and Java boundaries

Read for changes to data models, nullability, public signatures, Java interoperability, or a component port. Apply the project's declared language/API level; a current documentation example does not authorize enabling a newer feature.

## Model the observable contract

- Decide what absence means at each boundary. A nullable result, missing field, empty collection and thrown exception can mean different things. Avoid replacing a failure with `?:` defaults or `mapNotNull` unless dropping the value is intended.
- Trace the proof behind `!!`, casts, `lateinit` and smart casts. Prefer a checked boundary when the input is uncertain, but do not rewrite an assertion that deliberately enforces a proven invariant solely for style.
- A read-only collection interface does not establish exclusive ownership or deep immutability. Account for retained mutable aliases and mutable elements when storing or publishing state.
- Generated data-class equality, hashing, destructuring and `copy` depend on primary-constructor properties; `copy` is shallow. Moving fields can change identity, cache keys, state emissions, logging and serialized expectations.
- Preserve explicit numeric ranges, overflow assumptions, character/byte encoding, ordering and exception behavior during ports. Check library differences with representative source/destination inputs instead of translating syntax alone.

## Keep consumers in view

Inspect consumers before changing parameter names/defaults, visibility, overloads, sealed variants, generic bounds, extension receivers, value/data classes or return types. Source compatibility, already-compiled binary compatibility and persisted compatibility are separate questions. Preserve the repository's API checks if present; compilation of this module alone omits downstream usage.

For Java-facing APIs, inspect generated names and callable shapes. Property accessors, file facade names, `@JvmName`, `@JvmStatic`, `@JvmField`, overloads and checked-exception declarations can be part of the consumer contract. Ordinary function default arguments do not automatically create Java overloads. Add interoperability annotations for an actual caller need, not to decorate every declaration.

Treat Java platform types as an uncertain boundary. Check declared nullability, collection contents, annotations and compiler configuration; assignment to a Kotlin non-null type can fail at runtime. Avoid propagating an unchecked assumption into domain state. Java collection mutation can also bypass assumptions made from a Kotlin read-only view.

## Focus verification

Use existing compiler/test tasks for the changed module and representative consumers. Test meaningful missing/malformed inputs, aliasing or equality behavior, and the failure contract where affected. Compile a Java caller when the change affects Java usability. Do not claim published binary compatibility from recompiling all sources; use existing compatibility tooling or state the gap.

## Primary documentation

- [Kotlin null safety](https://kotlinlang.org/docs/null-safety.html)
- [Calling Java from Kotlin](https://kotlinlang.org/docs/java-interop.html)
- [Calling Kotlin from Java](https://kotlinlang.org/docs/java-to-kotlin-interop.html)
- [Collection interfaces](https://kotlinlang.org/docs/collections-overview.html)
- [Data classes and copying](https://kotlinlang.org/docs/data-classes.html)

Resolve version-sensitive language and interoperability claims against the project's Kotlin/compiler configuration before changing its contract.
