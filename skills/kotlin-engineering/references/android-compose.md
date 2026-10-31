# Android, Compose and managed UI lifetimes

Read only for Android or Compose work. Apply each subsection only to the platform/framework in the project; a Kotlin JVM library does not inherit these requirements.

## State and composition

Locate the owner of business state, navigation state, transient UI state and platform resources. Preserve existing module and design-system boundaries instead of moving business logic into composables or rebuilding an app's architecture for a local change.

- Keep composable execution free of uncontrolled I/O, player creation, callback registration and coroutine launches. Composition may run repeatedly or be abandoned. Use the existing event/effect boundary for the operation's lifetime.
- Distinguish `remember`, saveable UI state, and durable/domain state. Remembered state survives recomposition, not every recreation or process death. Persist only through the established storage contract.
- Publish changes through state that consumers observe. Mutating an ordinary list nested in remembered state may not invalidate readers. Replacing state with an equal value can also suppress updates; follow the actual state holder's policy.
- Choose effect keys from the identity that should restart work. `LaunchedEffect` cancels/restarts for changed keys and ends when its call leaves composition; it is not a process-lifetime scope. Use `rememberUpdatedState` when an effect must use a current callback without restarting.
- Pair listeners and other effect-owned resources with disposal. Changing the resource/lifecycle owner must detach the old registration. Do not release a shared process/session resource merely because one screen leaves composition.

## Lifecycle and platform work

For Android UI flows, use the project's supported lifecycle-aware collection API where collection should stop with visibility. With `repeatOnLifecycle`, the block is cancelled below the selected state and runs again on reentry; ensure producer work and side effects tolerate that restart. A plain launch in a long-lived scope does not acquire visibility semantics automatically.

For Compose Multiplatform, inspect its actual lifecycle dependencies, available source-set APIs and platform event mappings. Do not assume every AndroidX symbol is usable in common code, or that Android lifecycle behavior exactly matches iOS/desktop. Confirm the required main dispatcher on each target. Preserve intentional application/session work while stopping screen-owned work.

For Media3, trace player, session, service, controller and listener ownership separately. ExoPlayer calls must obey the instance's application-looper contract; moving all work to `Dispatchers.IO` can break it. Release only resources this owner acquired, on the required thread, at the appropriate lifetime boundary. A recomposition or screen disposal must not accidentally stop background playback.

Keep Android SDK/manifest/permission and lifecycle changes within the requested scope. Platform storage, audio focus, foreground service and device integration contracts need their specific official API documentation when touched; Kotlin-level compilation cannot validate them.

## Choose evidence for the change

Use focused state/logic tests and applicable lint/compile tasks. For effects and lifecycle changes, exercise the relevant restart/disposal, navigation or recreation path. UI checks should cover the changed state and established accessibility/design-system variants without imposing a new design direction.

Report host tests, APK packaging, emulator checks and device checks separately. Mocks do not validate a real Media3 looper, Bluetooth route, audio focus, native graphics or iOS lifecycle. State any platform behavior still unexecuted.

## Primary documentation

- [Compose observable and saved state](https://developer.android.com/develop/ui/compose/state)
- [Compose effect identity and cleanup](https://developer.android.com/develop/ui/compose/side-effects)
- [repeatOnLifecycle restart contract](https://developer.android.com/reference/androidx/lifecycle/RepeatOnLifecycleKt)
- [Compose Multiplatform lifecycle](https://kotlinlang.org/docs/multiplatform/compose-lifecycle.html)
- [ExoPlayer setup and threading](https://developer.android.com/media/media3/exoplayer/hello-world)
