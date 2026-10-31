# Native builds and validation evidence

Read for compiler/CMake edits, cross-platform native code, or checks involving sanitizers and binary consumers.

## Match the target's configuration

Start from repository build/test commands and inspect the selected preset, generator, toolchain, configuration, standard library, and compiler flags. Avoid reusing a build directory with incompatible toolchains or SDKs. In multi-configuration generators, report which configuration was actually built and tested.

In CMake, express added requirements on the affected target. Choose `PRIVATE`, `PUBLIC`, and `INTERFACE` from whether the target's consumers need each compile feature, include path, definition, or link dependency. An implementation-only requirement should not become a consumer requirement accidentally; headers can require propagation. Check existing `CXX_STANDARD_REQUIRED` and `CXX_EXTENSIONS` behavior when touching the language mode: `CXX_STANDARD` alone may permit fallback. Do not raise the standard globally to use a convenient helper.

Respect mixed C/C++ languages, generated sources, exported targets, platform branches, and plugin boundaries. Android native work additionally needs the declared NDK/ABI/API target; a desktop compiler pass does not check those constraints. Generated outputs are not a replacement for fixing their actual input.

## Select evidence for the changed risk

- Compile and link affected targets plus a representative consumer when headers, exports, templates, or link requirements change. Run the existing test selection that reaches the changed behavior.
- For memory/lifetime risks, use an available AddressSanitizer or UndefinedBehaviorSanitizer configuration appropriate to the compiler and platform. For shared-state changes, use supported ThreadSanitizer builds separately as needed; do not invent an unsupported sanitizer combination.
- Record instrumentation and uninstrumented components. Sanitizers inspect exercised operations and supported checks; missing instrumentation, suppressions, excluded dependencies, and unexecuted paths limit the result. Neither ASan nor UBSan is an exhaustive C++ undefined-behavior proof, and TSan cannot prove deadlock freedom.
- Separate compile/link results from runtime behavior, media/backend availability, UI checks, foreign consumers, and device tests. A cross-compiled test binary has not run merely because it linked.

Use existing formatting/static-analysis policy on changed code. Do not introduce broad warning suppressions or reformat unrelated files. If a required tool is missing, state the gap before selecting a narrower available check; dependency installation is a separate action.

## Primary sources

- [CMake: target compile features and propagation](https://cmake.org/cmake/help/latest/command/target_compile_features.html)
- [CMake: C++ standard target property](https://cmake.org/cmake/help/latest/prop_tgt/CXX_STANDARD.html)
- [Clang: AddressSanitizer](https://clang.llvm.org/docs/AddressSanitizer.html)
- [Clang: UndefinedBehaviorSanitizer](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html)
- [Clang: ThreadSanitizer](https://clang.llvm.org/docs/ThreadSanitizer.html)

Consult the documentation matching the installed compiler/CMake and target before relying on a platform, flag, or diagnostic guarantee.
