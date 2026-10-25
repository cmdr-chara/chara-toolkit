# Mobile Platform Decision Matrix

Compare options against this product's constraints. The strengths and risks below are structural and change slowly. Anything about current versions, store rules, or SDK support is a fact to verify when you decide (see "Verify current platform facts").

## Option comparison

| Option | Strong fit | Material risks/costs | Prototype before choosing when |
| --- | --- | --- | --- |
| Flutter | One team needs highly consistent/custom UI across iOS/Android; Dart ownership is acceptable; shared widget/rendering system has high value; additional desktop/web targets may share product UI | platform conventions need deliberate adaptation; plugin/native integration and binary/startup/memory must be measured; native teams still needed for complex APIs/release issues | critical native SDK/plugin, extension/widget, advanced media/graphics, background, accessibility, startup/binary, or platform-specific UX is central |
| Expo/React Native | React/TypeScript team; iOS/Android with native components/APIs; Expo build/update/module ecosystem reduces native operations; product benefits from web/domain reuse | native-module and React Native architecture compatibility; JS/native performance and lifecycle; dependency duplication; update runtime policy; native code still required for unsupported integrations | custom native module, high-rate animation/media, background work, monorepo dependency shape, memory/startup, or store/update constraints are critical |
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

## Verify current platform facts

Check these at decision time and cite what you found in the decision record, with the date you checked:

1. **Framework support:** each candidate's current stable release, supported OS minimums, and announced deprecations, from its official release notes and roadmap.
2. **Required native capabilities:** for every must-have API or vendor SDK, an official integration for the candidate (plugin, module, or documented interop), and whether it supports the framework's current architecture.
3. **Store and OS policy:** current App Store and Google Play requirements that affect the choice, such as target SDK level, background execution limits, privacy manifests, and rules for over-the-air updates.
4. **Team and tooling:** whether the team can own each option's build, signing, and release tooling today, not just its UI code.

A fact that cannot be verified stays an assumption in the decision record and becomes a proof-spike candidate.
