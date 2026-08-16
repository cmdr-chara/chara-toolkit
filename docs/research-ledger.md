# Ecosystem Research Ledger

**Information checked:** 2026-07-17; Next.js security refresh 2026-07-31; Codex model routing refresh 2026-08-16
**Research mode:** current public web, repository tree/raw-file inspection, official documentation, official package registries/repositories, and release/advisory pages.  
**Refresh policy:** stable workflow principles remain in `SKILL.md`; changing version/package/platform facts remain in dated references and must be rechecked before use.

## Method and evidence rules

1. Prefer framework/platform owners, standards bodies, package registries, and upstream repositories.
2. Treat a release number, peer range, store rule, security status, package license, or maintenance signal as time-sensitive.
3. Record compatibility, maintenance, adoption fit, license, security/deprecation, runtime/build cost, built-in alternative, and choose/avoid conditions for every named package recommendation.
4. Do not infer quality from stars or download counts. Adoption is one fit/risk signal only.
5. Verify the target repository's lockfile and resolved graph at execution time; a ledger cannot establish compatibility for an unseen project.
6. Do not copy source wording or assets merely because a repository is permissively licensed. Preserve attribution when adaptation is substantial.

## Repository inspection

| Source | Material inspected | Finding retained in the pack | Checked |
| --- | --- | --- | --- |
| https://github.com/cmdr-chara/codex-toolkit | Root tree, README, existing `skills/`, `agents/`, installers, package metadata | The toolkit is compact and already ships Mission Control. Integration must be additive. | 2026-07-17 |
| https://raw.githubusercontent.com/cmdr-chara/codex-toolkit/main/README.md | Installation model, catalog, safety statement, existing skill description | `delegate-with-mission-cards` owns role/model dispatch and parent-side verification. | 2026-07-17 |
| https://raw.githubusercontent.com/cmdr-chara/codex-toolkit/main/skills/delegate-with-mission-cards/SKILL.md | Delegation gate, mission cards, exclusive writer ownership, waves, handoff review | `multi-agent-work-coordinator` must add a generic work DAG/ownership/integration layer, not duplicate the six-role adapter. | 2026-07-17 |
| https://raw.githubusercontent.com/cmdr-chara/codex-toolkit/main/LICENSE | MIT terms, copyright | Pack root license preserves `Copyright (c) 2026 cmdr-chara`. | 2026-07-17 |
| https://github.com/Emanuele-web04/skills/tree/main/skills | Four public Markdown prompts covering code review, refactoring, and two overlapping performance workflows; no license file was exposed | Only general workflow ideas informed an independent two-skill design. No source prose or code was copied; the two performance concepts were merged to avoid ambiguous routing. | 2026-07-31 |
| https://github.com/Leonxlnx/taste-skill | Repository tree, README, design skill variants, local registry | Source separates taste, redesign, image-to-code, brand, and image-generation concerns. Only relevant concepts were selected. | 2026-07-17 |
| https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md | Brief inference, direction calibration, anti-template constraints, preflight concepts | Re-expressed as product evidence, design axes, system rules, states, accessibility, and handoffs. | 2026-07-17 |
| https://github.com/Leonxlnx/taste-skill/blob/main/skills/redesign-skill/SKILL.md | Audit-before-redesign concept | Re-expressed as a bounded redesign audit that preserves validated behavior and distinguishes diagnosis from direction. | 2026-07-17 |
| https://github.com/Leonxlnx/taste-skill/blob/main/skills/image-to-code-skill/SKILL.md | Reference analysis and iterative fidelity concepts | Re-expressed as provenance-aware structural decomposition, asset rights, responsive hypotheses, component boundaries, and evidence-based visual comparison. | 2026-07-17 |
| https://github.com/Leonxlnx/taste-skill/blob/main/LICENSE | MIT terms, copyright | Complete notice and adapted-file map preserved in `THIRD_PARTY_NOTICES.md`. | 2026-07-17 |

### Inspection limitation

The original 0.2.0 build could not clone the repository in its runtime. The 0.3.0 work was performed and validated in a direct checkout of cmdr-chara/codex-toolkit. The older web inspection remains part of the provenance record; current repository files are authoritative for the 0.3.0 integration.

## Codex and Agent Skills conventions

| Source | Retained guidance | Stability |
| --- | --- | --- |
| https://developers.openai.com/codex/build-skills | A skill is a directory with required `SKILL.md` and optional `scripts/`, `references/`, and `assets/`; discovery starts from metadata and loads detail progressively. | Convention; recheck when Codex docs change |
| https://developers.openai.com/codex/customization/overview | Repo skills can live in `.agents/skills`; clear descriptions govern implicit routing; references/scripts load on demand. | Convention |
| https://agentskills.io/specification | Required `name` and `description`; directory/name constraints; progressive disclosure; concise instructions. | Specification |
| https://agentskills.io/skill-creation/best-practices | Keep the operational body focused (under roughly 500 lines/5,000 tokens recommended) and point to specific resources only when needed. | Authoring guidance |
| https://agentskills.io/skill-creation/optimizing-descriptions | The description is a routing contract and should state concrete positive conditions. | Authoring guidance |
| https://developers.openai.com/blog/skills-agents-sdk | Narrow, repository-grounded trigger descriptions outperform vague capability labels in real maintenance workflows. | Current implementation guidance |
| https://developers.openai.com/api/docs/guides/latest-model | GPT-5.6 Luna targets efficient, high-volume workloads; GPT-5.6 Sol is the frontier tier; `max` reasoning is supported and should be reserved for quality-first work. The page does not currently use the “Subagents V2” label. | Current model guidance; checked 2026-08-16 |

## Web platform and production interface research

Detailed package decisions are in `skills/production-web-builder/references/web-ecosystem-2026-07-31.md`.

| Area | Primary sources checked | Finding retained |
| --- | --- | --- |
| React | https://react.dev/blog/2025/10/01/react-19-2 ; https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components ; https://react.dev/blog/2025/02/14/sunsetting-create-react-app | React 19.2 is the current documented feature line; use security-fixed RSC package patches; CRA is deprecated for new apps. |
| Next.js | https://nextjs.org/blog/next-16-2 ; https://nextjs.org/blog/next-16-3-instant-navigations ; https://nextjs.org/blog/july-2026-security-release ; https://nextjs.org/support-policy ; https://nextjs.org/docs | 16.2 is Active LTS and 16.3 remains preview-only. The July release fixed 4 high- and 5 medium-severity vulnerabilities; use at least 16.2.11 or 15.5.21. Refreshed 2026-07-31. |
| Rendering/data/cache | https://nextjs.org/docs/app/building-your-application/data-fetching ; https://react.dev/reference/rsc/server-components ; https://tanstack.com/query/v5/docs/framework/react/overview | Select server, route, and client data ownership from behavior/latency/offline needs; do not duplicate caches reflexively. |
| Forms/validation | https://developer.mozilla.org/docs/Learn_web_development/Extensions/Forms ; https://react-hook-form.com/ ; https://zod.dev/ | Prefer native semantics and server boundaries where sufficient; add client form/schema libraries only for material complexity or untrusted boundary parsing. |
| State | https://react.dev/learn/managing-state ; https://redux-toolkit.js.org/ ; https://zustand.docs.pmnd.rs/ ; https://jotai.org/ | Classify local, URL, form, server, and durable state before choosing a store. |
| UI primitives | https://www.w3.org/WAI/ARIA/apg/ ; https://base-ui.com/ ; https://www.radix-ui.com/primitives | Prefer native controls; use one maintained primitive layer for complex semantics and test focus/keyboard/portal behavior. |
| Motion | https://developer.mozilla.org/docs/Web/CSS/@media/prefers-reduced-motion ; https://motion.dev/docs/react ; https://developer.mozilla.org/docs/Web/API/View_Transition_API | Use CSS/platform transitions for simple cases; add an engine for coordinated gestures/layout/springs; reduced motion is part of the interaction contract. |
| Testing | https://playwright.dev/docs/intro ; https://vitest.dev/guide/ ; https://testing-library.com/docs/ ; https://mswjs.io/docs/ | Match unit/component/contract/browser checks to risk and observable behavior; avoid snapshot-only evidence. |
| Accessibility | https://www.w3.org/WAI/standards-guidelines/wcag/ ; https://www.w3.org/WAI/WCAG22/quickref/ ; https://www.w3.org/WAI/ARIA/apg/ | WCAG 2.2 success criteria and actual keyboard/screen-reader behavior guide conformance; an automated scan is not conformance proof. |
| Performance | https://web.dev/articles/vitals ; https://web.dev/articles/inp ; https://web.dev/articles/lcp | Measure LCP, INP, and CLS in representative lab/field conditions; budgets are product/context decisions, not universal magic numbers. |
| Observability | https://opentelemetry.io/docs/languages/js/ ; https://opentelemetry.io/docs/concepts/signals/ | Instrument user-critical paths and failures with privacy-aware logs, metrics, and traces; package choice depends on deployment/runtime support. |
| Security | https://nextjs.org/docs/app/guides/security ; https://cheatsheetseries.owasp.org/ ; https://github.com/advisories | Validate at trust boundaries, keep secrets server-side, recheck framework/package advisories and actual resolved versions. |
| SEO/deployment | https://developers.google.com/search/docs/crawling-indexing/overview ; https://nextjs.org/docs/app/getting-started/deploying | SEO applies only where discovery matters; verify rendered metadata, canonicalization, crawl behavior, runtime environment, and deployment adapter. |

## Flutter and Dart research

Detailed decisions are in `skills/flutter-production-builder/references/flutter-ecosystem-2026-07-17.md`.

| Area | Primary sources checked | Finding retained |
| --- | --- | --- |
| Current framework | https://docs.flutter.dev/release/release-notes ; https://docs.flutter.dev/release/whats-new ; https://docs.flutter.dev/release/breaking-changes | Flutter 3.44 is the current stable feature release at check; repository pins and patch releases remain authoritative for a project. |
| Architecture/state | https://docs.flutter.dev/app-architecture ; https://api.flutter.dev/flutter/widgets/InheritedWidget-class.html ; https://pub.dev/packages/riverpod ; https://pub.dev/packages/flutter_bloc | Start with ownership and lifecycle; choose built-ins, Riverpod, or BLoC conditionally rather than prescribing one global state library. |
| Routing | https://docs.flutter.dev/ui/navigation ; https://pub.dev/packages/go_router | Router choice depends on deep links, nested navigation, restoration, web URLs, and repository convention. |
| Networking/serialization | https://api.dart.dev/dart-io/HttpClient-class.html ; https://pub.dev/packages/http ; https://pub.dev/packages/dio ; https://pub.dev/packages/json_serializable ; https://pub.dev/packages/freezed | Built-in or small clients suit simple calls; richer interceptors/cancellation/code generation must earn their maintenance and build cost. |
| Persistence/offline | https://docs.flutter.dev/cookbook/persistence ; https://pub.dev/packages/shared_preferences ; https://pub.dev/packages/flutter_secure_storage ; https://pub.dev/packages/sqflite ; https://pub.dev/packages/drift | Separate preferences, secrets, files, and structured durable data; offline-first requires an explicit source of truth, outbox, conflicts, migrations, and recovery. |
| Accessibility/adaptive UI | https://docs.flutter.dev/ui/accessibility-and-internationalization/accessibility ; https://docs.flutter.dev/ui/adaptive-responsive | Validate semantics, text scaling, focus, input modes, safe areas, platform conventions, and large-screen behavior on devices. |
| Testing/performance | https://docs.flutter.dev/testing/overview ; https://docs.flutter.dev/perf | Use unit/widget/integration/profile-mode evidence; debug-mode feel and golden tests alone are insufficient. |
| Build/release | https://docs.flutter.dev/deployment/android ; https://docs.flutter.dev/deployment/ios ; https://developer.apple.com/app-store/review/guidelines/ ; https://developer.android.com/google/play/requirements/target-sdk | Signing, permissions, target SDK, privacy, store metadata, and review policy are release inputs, not post-build paperwork. |

## Expo and React Native research

Detailed decisions are in `skills/expo-react-native-builder/references/expo-react-native-ecosystem-2026-07-17.md`.

| Area | Primary sources checked | Finding retained |
| --- | --- | --- |
| Current framework | https://expo.dev/changelog/sdk-57 ; https://docs.expo.dev/versions/latest/ ; https://reactnative.dev/blog/2026/06/11/react-native-0.86 ; https://reactnative.dev/docs/releases | Expo SDK 57 pairs with React Native 0.86 and React 19.2 at check. The project lockfile and Expo diagnostics remain authoritative. |
| Architecture/native modules | https://docs.expo.dev/guides/new-architecture/ ; https://docs.expo.dev/modules/overview/ ; https://reactnative.dev/architecture/landing-page | The New Architecture is the current baseline; native capability availability, config plugins, build ownership, and module maintenance can disqualify Expo-managed choices. |
| Routing/builds/updates | https://docs.expo.dev/router/introduction/ ; https://docs.expo.dev/develop/development-builds/introduction/ ; https://docs.expo.dev/build/introduction/ ; https://docs.expo.dev/eas-update/introduction/ | Use development builds for production-like work; OTA updates cannot safely change the native runtime and require runtime/channel/rollback governance. |
| State/data/offline | https://react.dev/learn/managing-state ; https://tanstack.com/query/v5/docs/framework/react/overview ; https://docs.expo.dev/guides/local-first/ ; https://docs.expo.dev/versions/latest/sdk/sqlite/ | Classify state first; a request cache is not a durable offline database; Expo's local-first guide was explicitly still evolving at check. |
| Storage/security | https://docs.expo.dev/versions/latest/sdk/securestore/ ; https://react-native-async-storage.github.io/async-storage/ ; https://docs.expo.dev/guides/environment-variables/ | AsyncStorage is not encrypted; SecureStore is for small secrets with platform recovery behavior; `EXPO_PUBLIC` values are public in the bundle. |
| Animation/gestures | https://docs.swmansion.com/react-native-reanimated/ ; https://docs.swmansion.com/react-native-gesture-handler/ ; https://expo.dev/changelog/sdk-57 | Add native animation/gesture packages only when interaction complexity warrants them; SDK 57 documented a Reanimated/Hermes memory regression that requires current recheck and measurement. |
| Testing/performance/observability | https://docs.expo.dev/develop/unit-testing/ ; https://reactnative.dev/docs/testing-overview ; https://reactnative.dev/docs/performance ; https://reactnative.dev/docs/react-native-devtools | Combine unit/component tests with device E2E and release-mode profiling; simulator success does not prove device/native/store behavior. |
| Distribution | https://docs.expo.dev/submit/introduction/ ; https://developer.apple.com/app-store/review/guidelines/ ; https://developer.android.com/google/play/requirements/target-sdk | Signed artifacts, account/store policy, privacy declarations, review notes, target APIs, staged rollout, and rollback must be owned explicitly. |

## Mobile platform-selection research

Detailed comparison is in `skills/mobile-architecture-director/references/platform-decision-matrix-2026-07-17.md`.

| Option | Authoritative sources | Decision signal retained |
| --- | --- | --- |
| Flutter | https://docs.flutter.dev/ ; https://docs.flutter.dev/platform-integration ; https://docs.flutter.dev/add-to-app | Strong shared rendered UI and multiplatform ownership; native/plugin/platform fit and team/tooling constraints still require prototypes. |
| Expo/React Native | https://docs.expo.dev/ ; https://reactnative.dev/docs/getting-started ; https://docs.expo.dev/modules/overview/ | Strong React/TypeScript and Expo delivery ecosystem; native-module, architecture, memory/performance, and update constraints remain product-specific. |
| Native iOS/Android | https://developer.apple.com/documentation/ ; https://developer.android.com/ | Prefer when platform-specific UX/APIs, performance envelope, security/compliance, or independent platform roadmaps dominate shared-code value. |
| Kotlin Multiplatform / shared domain alternatives | https://kotlinlang.org/docs/multiplatform.html | Consider shared domain/data with native UI when UI conventions diverge but business logic reuse is valuable; validate tooling/team fit. |
| Web/PWA/other | https://web.dev/learn/pwa/ ; platform distribution/API docs | Consider when reach and deployment speed dominate and required device APIs, background execution, offline, performance, and store presence are feasible. |

## Package metadata and license checks

Named package rows were checked against their official docs/repositories and, where a concrete release was recorded, npm or pub.dev metadata. The dated matrices deliberately state when to choose and avoid each package. They do not convert package popularity into a recommendation.

- Web matrix: `skills/production-web-builder/references/web-ecosystem-2026-07-31.md`
- Flutter matrix: `skills/flutter-production-builder/references/flutter-ecosystem-2026-07-17.md`
- Expo/RN matrix: `skills/expo-react-native-builder/references/expo-react-native-ecosystem-2026-07-17.md`
- Platform matrix: `skills/mobile-architecture-director/references/platform-decision-matrix-2026-07-17.md`

## Known refresh triggers

- **2026-08-20:** recheck the next monthly Next.js security release and update fixed versions/advisories if needed.
- Any framework stable/SDK release, store policy/target API change, critical advisory, package deprecation, ownership transfer, or license change.
- A target repository resolving versions outside the dated matrices.
- A builder encountering a native module, deployment adapter, database/sync engine, authentication provider, or observability vendor not already evaluated.
