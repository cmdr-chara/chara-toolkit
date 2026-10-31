# Source sets, module dependencies and platform evidence

Read for Kotlin Multiplatform or Gradle module/build work. Gradle guidance also applies to JVM-only projects; KMP requirements apply only when those targets are declared.

## Inspect the real build contract

Use the checked-in wrapper and documented tasks when present. Inspect settings, included builds, convention plugins, module build files, version catalogs, compiler options, JDK/toolchain settings, dependency locks and CI relevant to the change. `gradle.properties` can contain credentials; inspect only needed settings without disclosing secrets.

Keep the declared Kotlin language/API level, JVM bytecode target and Java target compatible with the supported runtime. Distinguish the JDK running Gradle, the toolchain/JDK APIs available to compilation, and the minimum runtime. Resolve a genuine toolchain transition through its owner instead of silently raising a requirement.

Preserve project layering and dependency visibility. Where `api` and `implementation` are supported, a dependency type exposed in a public signature may need to remain visible to consumers. Hiding it because implementation-scoped dependencies are generally preferred can break downstream compilation. Confirm source-set and published-variant behavior before moving the declaration.

Task names depend on plugins and versions. Select module, variant and target tasks from repository evidence. A broad `build` or `allTests` may resolve/link targets unavailable on this host. Task listing/configuration also executes build logic; respect the existing execution boundary. Offline failures can mean missing cached artifacts, not faulty source.

## Place shared code deliberately

Map the declared targets and source-set hierarchy, including intermediate sets such as `iosMain` and their tests. Keep common code within APIs available to all of its consumers. A dependency being multiplatform does not make every platform-specific extension available in `commonMain`.

Use the existing interface/factory or `expect`/`actual` boundary for platform services. Do not introduce an expected class for every abstraction. When changing an expected declaration, inspect all actual implementations and the targets that inherit each one. Keep Android/JVM APIs and Apple/native resources in their proper source sets.

Preserve platform adapter semantics: errors, callback/thread requirements, cancellation, retained resources and serialization. If Swift/Objective-C consumers are affected, inspect the exported API and ownership/error boundary too; a matching Kotlin signature alone does not prove the foreign caller remains compatible.

## Verify a matrix, not a label

Choose checks by changed consumers, not the word "multiplatform":

- Common logic: relevant tests on available supported hosts, plus target compilation for changed APIs where feasible. A JVM host test exercises that implementation, not all platform adapters.
- Android: affected host/unit tests, compile/package/lint tasks, then applicable emulator/device behavior. Do not use an aggregate task as evidence of only JVM coverage without inspecting what ran.
- Apple: distinguish Kotlin metadata or `.klib` compilation, cinterop, framework linking, Xcode app build, simulator execution and physical iOS execution. Host and SDK support differ across these stages; consult the compiler's supported-host documentation and actual CI.
- Public libraries: check affected consumers, platform variants and existing binary/API checks; publishing is a separate authorization boundary.

Apple `.klib` production can be possible on a non-Apple host with restrictions while final Apple binaries require a supported Apple host. Never report an arm64 compile task as a linked/running iPhone app. If a target or SDK is unavailable, keep its result explicitly unverified; do not delete it, stub its behavior or alter declarations to make the local gate pass.

## Primary documentation

- [KMP source sets and target compilation](https://kotlinlang.org/docs/multiplatform/multiplatform-discover-project.html)
- [Expected and actual declarations](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)
- [Kotlin/Native targets and host restrictions](https://kotlinlang.org/docs/native-target-support.html)
- [Gradle Wrapper](https://docs.gradle.org/current/userguide/gradle_wrapper.html)
- [Gradle project boundaries](https://docs.gradle.org/current/userguide/multi_project_builds.html)
- [API versus implementation dependencies](https://docs.gradle.org/current/userguide/java_library_plugin.html)
- [Kotlin Gradle target/toolchain configuration](https://kotlinlang.org/docs/gradle-configure-project.html)
