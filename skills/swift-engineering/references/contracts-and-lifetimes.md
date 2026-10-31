# Swift contracts, ARC, and bounded ports

Read when a change affects types, public APIs, errors, object/resource lifetime, or behavior ported into Swift.

## Preserve what callers observe

- Choose value or reference representation from copying, mutation, aliasing, and identity requirements. A struct can contain shared class instances; wrapping a reference does not create independent mutable state. Account for the existing copy-on-write boundary where it matters.
- Check access levels, argument labels, protocol conformances, initializer behavior, and exported signatures against real consumers. Keep the existing `throws`, optional, `Result`, or callback contract unless changing it is authorized. Do not replace recoverable failures with force unwraps, `try!`, traps, or swallowed errors.
- Preserve equality/hash consistency, `Codable` keys and absent/null behavior, ordering guarantees, and error information used by callers. Typed throws and newer ownership/type features require the actual supported compiler; they are not default rewrites.

## Trace ownership beyond the happy path

Map owners of stored/escaping closures, delegates, task handles, observer tokens, timers, and callbacks. Identify when each relationship ends. Strong capture may intentionally keep an operation alive; `[weak self]` can also discard required work. Choose captures from the lifetime contract rather than applying them mechanically. An `unowned` reference needs a defensible guarantee that its referent is alive at every use.

Separate object deallocation from timely resource shutdown. Define who closes a handle, unregisters an observer, cancels work, or releases foreign memory on success, error, and cancellation. Use the existing explicit lifecycle and scoped cleanup patterns where timing matters; do not rely on a retain cycle eventually reaching `deinit`.

For a lifetime regression, exercise owner release while work is pending, delayed completion, repeated start/stop, and failure paths as relevant. Check both unwanted retention and premature loss of work. A clean compile does not observe either.

## Port semantics, not surface syntax

Record source fixtures or characterization results within the accepted scope. Compare the supported input domain and observable results across both implementations, including error categories and side effects. Inspect differences that the source relies on: integer width/overflow/conversions, floating-point handling, Unicode/indexing, collection order, copy versus alias behavior, absent values, and callback/cancellation order.

Keep intentional incompatibilities explicit. A package-level implementation port does not authorize switching production consumers or removing the source implementation. For a foreign interface, load [apple-and-interop.md](apple-and-interop.md); its pointer and ownership requirements apply on portable targets too.

## Primary sources

- [Swift structures and classes](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/classesandstructures/)
- [Swift automatic reference counting](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/)
- [Swift error handling](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/errorhandling/)

Use the language and library documentation for the project's supported toolchain when a feature's availability or semantics decide the implementation.
