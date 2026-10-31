# Apple targets and native interfaces

Read only for Apple framework/lifecycle/availability work or a native/foreign boundary. The foreign-interface section also applies to portable Swift. Do not introduce Apple dependencies into a portable module to follow this reference.

## Match the supported target

Resolve the actual Xcode scheme, build configuration, SDK, architecture, destination, and minimum OS from the project and CI. SDK symbol availability, runtime OS availability, and device/GPU capability are separate questions. `#if canImport` establishes module importability, not runtime availability of every API it contains. Use the project's availability annotations/guards and fallback behavior; do not raise a deployment target to avoid a missing guard.

When tests cannot exercise the minimum supported OS, state the gap. A simulator destination or a host build does not establish physical-device behavior. Keep signing, entitlements, packaging, and distribution changes outside ordinary implementation unless explicitly in scope.

## Respect UI and lifecycle ownership

For AppKit/UIKit, trace UI mutation to the main thread and its declared actor isolation, including entry through Objective-C delegates and foreign callbacks. Do not assume an async API, notification, or completion handler has the right executor. Follow framework isolation annotations for SwiftUI state as applicable; avoid annotating an entire portable domain model `@MainActor` merely to satisfy a UI caller.

Keep expensive synchronous work from blocking UI progress. Preserve view/window ownership, observation/subscription disposal, callback invalidation, and the point at which a closing/replaced view stops accepting results. Verify the actual interaction or visible state change when that behavior is part of the task.

## Check both sides of the bridge

- Inspect imported declarations and generated headers/module interfaces as used by consumers. Preserve selectors, argument/nullability mapping, error conventions, and callback cardinality; an `NSError`-producing import may expose `throws` rather than the original return shape.
- Specify who allocates, retains, releases, or destroys each object and buffer, and on which executor/thread. Account for callbacks retained by Objective-C, C/C++, Rust, or another native owner, including teardown while work is pending.
- For pointers, verify bounds, alignment, binding/initialization state, encoding, layout, and owner lifetime. Implicit array/string bridging and `withUnsafe*` closures do not grant a pointer lifetime beyond their documented scope. If the foreign API stores a pointer, provide storage with a matching lifetime and release contract.
- Use an agreed exported representation for foreign layout; do not assume an arbitrary Swift struct is a C ABI. Verify the existing bridge generator or interop mechanism rather than replacing it for style.
- Keep cancellation and errors valid on both sides. Use [concurrency.md](concurrency.md) for continuation or actor crossings; a detached task or unchecked annotation does not repair a foreign threading contract.

Exercise a real caller across the boundary where possible, including empty/null input, failure, delayed callback, and release/teardown cases that the change affects. Swift-only mocks cannot establish the foreign side's ownership behavior.

## Primary sources

- [Platform compilation and OS availability](https://developer.apple.com/documentation/xcode/running-code-on-a-specific-version)
- [UIKit and AppKit apps](https://developer.apple.com/documentation/technologyoverviews/uikit-appkit)
- [Imported C and Objective-C APIs](https://developer.apple.com/documentation/swift/imported-c-and-objective-c-apis)
- [Imported Cocoa error parameters](https://developer.apple.com/documentation/swift/about-imported-cocoa-error-parameters)
- [UnsafePointer lifetime and memory requirements](https://developer.apple.com/documentation/swift/unsafepointer)

Refresh version-sensitive API and importer details against the actual SDK and both sides of the native interface.
