# Mobile Platform Decision Matrix — 2026-07-17

**Information checked:** 2026-07-17 (original decision-matrix snapshot; follow-up checked 2026-10-16)  
**Next review:** 2026-11-10 or earlier after a platform/framework/store change.  
**Purpose:** Current evidence prompts for architecture selection; not a universal ranking.

## Current framework observations

- Flutter's current stable feature line is Flutter 3.47, announced August 12, 2026, per official release notes.
- Expo SDK 58 was announced on 2026-10-15 and maps to React Native 0.88, React 19.3.0, and minimum Node.js 22.13.x in Expo's versioned table; SDK 57 remains a separate historical compatibility line.
- React Native 0.87 was released on 2026-08-11 with Strict TypeScript API defaults, Metro changes, experimental Swift Package Manager support, and higher Node/Android build-tool requirements. Recheck the standalone RN support schedule and the chosen Expo SDK's pinned RN version.
- Expo SDK 55+ always uses React Native's New Architecture; it cannot be disabled.

Recheck exact patch versions, OS/toolchain minimums, and store requirements during implementation.

## Option comparison

| Option | Strong fit | Material risks/costs | Prototype before choosing when |
| --- | --- | --- | --- |
| Flutter | One team needs highly consistent/custom UI across iOS/Android; Dart ownership is acceptable; shared widget/rendering system has high value; additional desktop/web targets may share product UI | platform conventions need deliberate adaptation; plugin/native integration and binary/startup/memory must be measured; native teams still needed for complex APIs/release issues | critical native SDK/plugin, extension/widget, advanced media/graphics, background, accessibility, startup/binary, or platform-specific UX is central |
| Expo/React Native | React/TypeScript team; iOS/Android with native components/APIs; Expo build/update/module ecosystem reduces native operations; product benefits from web/domain reuse | native-module/New Architecture compatibility; JS/native performance and lifecycle; dependency duplication; update runtime policy; native code still required for unsupported integrations | custom native module, high-rate animation/media, background work, monorepo dependency shape, memory/startup, or store/update constraints are critical |
| Separate native iOS + Android | Maximal platform API access, conventions, performance control, extensions/widgets/background, and independent platform delivery | two UI implementations, duplicated testing/product work, staffing and release coordination; shared behavior can drift | business assumes native is prohibitively slow or cross-platform is automatically cheaper—prototype comparable slices and operating cost |
| Kotlin Multiplatform + native UI | Kotlin expertise; shared domain/data/network logic is valuable while preserving SwiftUI/Compose UX and native APIs | shared boundary design, interop, two UIs, iOS tooling/ownership; not a one-codebase UI solution by default | complex concurrency, persistence, networking, Swift interop, binary size/build, or shared-domain test workflow is central |
| Capacitor/web container or PWA | Existing web product dominates; content/forms/enterprise workflows; native API set is modest; one web delivery path has high value | platform feel, offline/background, performance, keyboard/webview quirks, app-store policy, native plugins and accessibility need proof | camera/media/maps/files/background/push, offline durability, high-motion UI, or store expectations are important |

## Weighted criteria template

| Criterion | Weight | Flutter | Expo/RN | Native | KMP + native UI | Web container/PWA |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Hard native/API fit | | | | | | |
| UX/platform convention | | | | | | |
| Performance/resource | | | | | | |
| Offline/data | | | | | | |
| Accessibility | | | | | | |
| Security/compliance | | | | | | |
| Team/ownership | | | | | | |
| Build/store/update operations | | | | | | |
| Shared-code value | | | | | | |
| Migration/reversibility | | | | | | |

Every score needs evidence and confidence. Apply disqualifiers before totals and perform sensitivity analysis.

## Targeted source recheck — 2026-10-16

- Flutter 3.47, Expo SDK 58, and React Native 0.87 have superseded the original July framework snapshot. The platform fit/risks comparison remains conditional rather than a new stack recommendation.
- Expo 58's compatibility table lists React Native 0.88; the separately dated React Native 0.87 post establishes Strict TypeScript and toolchain changes. Use the Expo SDK table for Expo app compatibility, not a generic RN roadmap.
- Sources: https://docs.flutter.dev/release/release-notes/release-notes-3.47.0 ; https://expo.dev/changelog/sdk-58 ; https://docs.expo.dev/versions/v58.0.0/ ; https://reactnative.dev/blog/2026/08/11/react-native-0.87

## Source URLs

- https://docs.flutter.dev/release/release-notes/release-notes-3.47.0
- https://docs.flutter.dev/app-architecture
- https://docs.flutter.dev/ui/accessibility-and-internationalization/accessibility
- https://docs.flutter.dev/perf
- https://expo.dev/changelog/sdk-57
- https://docs.expo.dev/versions/latest/
- https://docs.expo.dev/guides/new-architecture/
- https://reactnative.dev/docs/releases
- https://developer.apple.com/design/human-interface-guidelines/
- https://developer.android.com/design/ui/mobile
- https://kotlinlang.org/docs/multiplatform.html
- https://capacitorjs.com/docs
- https://web.dev/learn/pwa/
