# Lifetimes and interface obligations

Read when an edit changes storage, ownership, borrowing, callback retention, failure cleanup, or a public/foreign interface.

## Follow the owner and every borrow

For each acquired allocation, handle, lock, registration, or thread, identify its releasing operation and owner. Fit existing RAII handles and allocator pairs; make partial initialization and early exits release acquired resources exactly once. Inspect destructor, copy/move, assignment, and moved-from obligations together when a type owns a resource. Shared ownership needs a real retention requirement and a plan for cycles; it does not make the pointed-to state thread-safe.

Trace references, raw pointers, iterators, spans, string views, and lambda captures through returns, storage, asynchronous work, and container mutation. A view describes accessible data; it does not extend the backing object's lifetime. Check the precise operation's invalidation rule, including past-the-end iterators. Reserving capacity once is not a general proof against later invalidation, and moving a container/type does not justify assuming every borrow remains valid.

For raw storage, placement construction, unions, casts, and foreign buffers, check object lifetime, alignment, bounds, aliasing, and destruction separately. Having an address with allocated storage is insufficient to establish a live object of the required type. Avoid treating a cast or `std::launder` as a general repair for an invalid lifetime argument.

## Preserve interface and failure semantics

Determine whether consumers depend on layout, symbol visibility, calling convention, virtual dispatch, inline definitions, allocator identity, or library/compiler ABI settings. At C/plugin boundaries, establish allocation/deallocation on both sides, buffer lengths and encoding, callback retention, thread rules, and how errors cross the boundary. Keep C declarations usable by their C consumers.

Preserve the project's exception policy and each operation's documented failure guarantee. Check `noexcept` promises and cleanup during unwinding; do not add throwing operations to a termination-sensitive path or silently replace errors with assertions. Callback reentry and calls made while holding a lock can invalidate assumptions even without another OS thread.

For a port, explicitly decide differences in signedness, narrowing, arithmetic, text representation, container ordering, and error propagation from the supported source contract. Prefer caller-level parity tests to tests of a new helper's internals.

## Primary sources

- [C++ working draft: object lifetime](https://eel.is/c++draft/basic.life)
- [C++ working draft: vector modifiers and invalidation](https://eel.is/c++draft/vector.modifiers)
- [C++ Core Guidelines: resource management](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#S-resource)

Use the project's selected C++ standard and actual library/framework documentation when a rule differs by language mode or implementation. The working draft and guidelines do not override that support contract.
