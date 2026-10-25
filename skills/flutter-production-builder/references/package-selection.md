# Flutter Package Selection

Start from the Flutter SDK, the Dart libraries, and what the repository already uses. Add a package only when it owns a problem nothing installed solves, and record why. Versions, minimum Dart versions, and maintenance status change often, so verify them when you decide (see the last section).

## Options by concern

| Concern | Default first | Common options when needed | Choose a package when | Avoid when |
| --- | --- | --- | --- | --- |
| Navigation | `Navigator` / `Router` in the SDK | go_router | deep links, nested navigation, or URL-based routing would otherwise need custom Router code | a few screens with simple push/pop |
| State | `setState`, `ValueNotifier`, `ChangeNotifier`, `InheritedWidget` | Provider, Riverpod, Bloc | the repository already standardizes on one, or state crosses many screens with its own lifecycle | adding a second state system next to the existing one |
| HTTP | `http` package or `dart:io` client | Dio | interceptors, cancellation, or retries are needed across many calls | a few simple requests |
| JSON and models | hand-written `fromJson`/`toJson` | json_serializable, Freezed | many models, unions, or immutable copy helpers justify code generation | a few small models; codegen adds build time and generator upgrades |
| Local storage | shared_preferences for small preferences | Drift, sqflite; flutter_secure_storage for secrets | relational queries, migrations, or encrypted secrets are required | storing secrets in plain preferences |
| Dates and localization | `intl` (often already present) | — | always check `intl` first | adding packages that duplicate `intl` |
| Tests | `flutter_test`, `integration_test` | mocktail or mockito | fakes are not enough at a boundary | mocking everything, including the code under test |
| Auth, crash reporting, telemetry | backend and platform capabilities | vendor SDKs | evaluated with the same rubric: native platform support, privacy, symbol upload, offline buffering, binary and startup cost, terms | adding a vendor SDK before checking what the backend already provides |

## Rules that do not change between releases

- Plugin and platform-channel behavior needs evidence from a real device or emulator; Dart tests with mocked channels do not prove the native side.
- Code generators and their annotation packages upgrade together; align them before changing either.
- Choose packages that support every target platform the app ships (Android, iOS, web, desktop) before adopting them.

## Verify current state before deciding

1. `flutter pub outdated` and `flutter pub deps` in the project: available versions, constraints, and transitive dependencies.
2. The package's pub.dev page: verified publisher, supported platforms, minimum Dart/Flutter SDK, and recent changelog entries.
3. Flutter's breaking-changes page and release notes for the project's Flutter version.
4. The package repository's open security advisories and deprecation notices.
5. Record the package, the problem it owns, the alternative you rejected, the license, and the date you checked in the decision record.
