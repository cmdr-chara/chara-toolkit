# Reviewing C++ behavior and lifetime changes

Use for a defined C++ diff or bounded refactor. This is an independent checklist: review ownership, finding admission, and approval remain with the invoking review workflow; no C++ implementation skill is required.

## Establish the compiled and consumed contract

Inspect the actual targets, language modes, compiler/standard library, exception/RTTI rules, ABI exports, supported platforms, and affected callers. Do not assume every native translation unit is C++. A changed private layout, inline/template definition, virtual member, calling convention, or allocator can affect consumers even when the local target compiles.

For CMake changes, check target scope and propagation of compile features, definitions, includes, and links. Verify selected presets/configurations and generated sources. Raising the global standard or disabling a warning needs authorization and a demonstrated contract reason; it is not a routine review correction.

## Follow lifetime and failure paths

- Identify owners and their acquire/release pairs, including partial construction and early exits. Check copy/move/destruction together for resource-owning types. Framework-managed raw pointers can be intentional; their spelling alone does not prove a leak or justify another owner.
- Trace retained references, views, iterators, pointers, and captures through mutation, returns, asynchronous work, and destruction. Use the exact container operation's invalidation rule, including past-the-end iterators. A clean ASan result does not settle an unexecuted dangling path.
- For raw storage, casts, unions, and foreign buffers, name the reachable operation and the object-lifetime, alignment, bounds, aliasing, or representation rule it violates. Suspicious casts or missing comments alone are insufficient evidence of undefined behavior.
- Preserve error and exception guarantees, including `noexcept`, unwinding cleanup, destructor behavior, and C/plugin boundaries. Check allocation/deallocation and callback/thread obligations on both sides of foreign APIs.
- Trace lock order, callback reentry, shutdown/join paths, and data races. Shared ownership only establishes retention; it does not serialize object mutation.

## Apply Qt rules only to Qt code

For a Qt/QML diff, trace QObject parent ownership, JavaScript ownership, engine lifetime, thread affinity, receiver event loops, and connection type. A QThread object is distinct from its worker thread; `deleteLater()` needs appropriate event-loop/shutdown conditions. Check QML property/notify/registration changes and AUTOMOC target coverage. C++ compilation alone does not prove bindings update or media workers shut down correctly.

## Calibrate the evidence

Prefer existing focused tests and an affected consumer build for headers/ABI/link changes. Inspect execution hooks before running CMake or native tests. Separate build, runtime, sanitizers, UI/media, and device evidence. Sanitizers have supported configurations and instrumentation/path limits; clean results do not prove absence of all undefined behavior, races, or deadlocks.

Admit a defect only with an affected operation, reachable caller/configuration, and concrete consequence. Keep API style preferences, pre-existing defects, and unsupported-platform guesses separate. Propose the smallest repair and a discriminating test when a behavioral defect is established.

## Primary sources

- [C++ working draft: lifetime](https://eel.is/c++draft/basic.life)
- [C++ working draft: vector invalidation](https://eel.is/c++draft/vector.modifiers)
- [CMake target requirements](https://cmake.org/cmake/help/latest/command/target_compile_features.html)
- [Qt objects and event loops](https://doc.qt.io/qt-6/threads-qobject.html)
- [Clang sanitizer documentation](https://clang.llvm.org/docs/AddressSanitizer.html)

Check the project's selected standard, compiler, framework, and SDK documentation before admitting a finding that depends on their particular behavior.
