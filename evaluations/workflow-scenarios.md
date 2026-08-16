# End-to-End Workflow Scenarios

**Information checked:** 2026-08-16

Each scenario tests the complete operating contract of one skill. A passing run produces the stated artifacts, cites repository or runtime evidence, respects the stop conditions, and does not silently absorb another skill's owned decision.

## 1. `repository-intelligence` — Shared authentication change in a polyglot monorepo

**Situation:** A team plans to replace token parsing in `packages/auth`, but the monorepo contains web, mobile, worker, CLI, and generated SDK consumers. Ownership is partially encoded in `CODEOWNERS`, CI paths, and deployment files.

**Inputs:** repository root; proposed symbol/path; base ref; existing ownership/build/deploy metadata.

**Expected workflow:**

1. Preserve and report working-tree state; inventory manifests, workspaces, build/test/deploy/ownership signals.
2. Model deployables and packages at natural boundaries rather than equating folders with components.
3. Trace imports, public exports, schemas, generated clients, configuration, runtime calls, data stores, and deployment coupling.
4. Classify evidence as observed, corroborated, inferred, or unknown.
5. Identify auth/security, shared lockfile/schema, high-churn, sparse-test, and generated-code hotspots.
6. Produce direct/indirect impact, likely conflicting edit surfaces, owners with confidence, and questions requiring confirmation.

**Expected artifacts:** repository map; dependency/ownership table; impact cone; hotspot/conflict register; evidence pointers; confidence/unknowns.

**Verification:** sampled consumers resolve to real files/symbols; public contract and generated sources are distinguished; ownership claims cite files/history/config rather than folder-name guesses.

**Stop/escalate:** stop before delegation or implementation. Mark dynamic/plugin/runtime dependencies unknown when static evidence cannot establish them.

## 2. `multi-agent-work-coordinator` — Parallel checkout implementation

**Situation:** Repository intelligence has already mapped a checkout change spanning an API service, web UI, schema/client generation, and documentation. Four agents are available.

**Inputs:** objective and acceptance criteria; repository/impact report; candidate tasks; known shared surfaces; validation commands.

**Expected workflow:**

1. Refuse to parallelize unresolved product or architecture decisions.
2. Build a DAG with read scope, exclusive write scope, dependencies, acceptance evidence, and stop conditions per mission.
3. Make schema source, generated client, lockfile, and shared release config single-owner surfaces.
4. Detect path/glob overlap with `ownership_check.py`; revise until no writer conflict remains.
5. Launch independent readers/writers in the smallest useful waves; use the existing Mission Control skill only as an optional role/model dispatch adapter.
6. Review every handoff, inspect diffs, reject scope violations, and integrate in dependency order.
7. Re-run integrated checks rather than accepting isolated green reports.

**Expected artifacts:** work DAG; ownership ledger; wave plan; mission cards; handoff statuses; integration record.

**Verification:** no write-scope overlap; every shared artifact has one owner; each accepted mission has exact files and evidence; integrated candidate is coherent.

**Stop/escalate:** retain tightly coupled work in the parent; stop a mission on unexpected shared-file need, stale input, destructive action, or unverifiable acceptance.

## 3. `codebase-evolution-controller` — Public API v1 to v2 transition

**Situation:** A service must rename and restructure a public payload while old mobile clients remain active for 90 days.

**Inputs:** current/target schemas; consumer inventory; traffic/version telemetry; manifests/toolchain; baseline fixtures; rollout and rollback capabilities.

**Expected workflow:**

1. Write current state, target, invariants, compatibility window, rollback trigger, and legacy-removal criteria.
2. Capture a reproducible baseline and contract fixtures before editing.
3. Verify target compatibility, peer/toolchain ranges, advisories, licenses, generated artifacts, and transitive consumers from primary sources.
4. Design additive v2 fields/endpoint or adapters; define dual path, telemetry, client negotiation, data/backfill behavior, and failure handling.
5. Implement/rehearse in stages: contract first, compatible producer/consumer paths, canary/cohort, expanded rollout, old-path removal only after exit metrics.
6. Document forward and rollback procedures, including irreversible data boundaries.
7. Hand migration docs to documentation and integrated evidence to release verification.

**Expected artifacts:** migration plan; compatibility matrix; staged change set; telemetry/exit criteria; rollback plan; removal checklist.

**Verification:** old and new client fixtures pass; unknown/mixed versions are tested; canary metrics and rollback are observable; no temporary bridge lacks an owner/removal condition.

**Stop/escalate:** block on unsupported target, unowned consumer, unrehearsable irreversible migration, missing restore/forward-recovery path, or unexplained baseline failure.

## 4. `verification-and-release` — Feature-flagged payment release

**Situation:** Backend, web, mobile, schema, and docs changes have been integrated. CI is green, but payment authorization, duplicate submission, migration, and rollback consequences are high.

**Inputs:** exact candidate/artifacts; integrated diff; claims/acceptance criteria; architecture impact; CI/test reports; observability; rollout/rollback mechanisms.

**Expected workflow:**

1. Freeze candidate identity and distinguish known baseline failures from candidate regressions.
2. Classify risk by consequence, novelty, blast radius, and reversibility—not diff size.
3. Build a claim-to-evidence matrix across static, unit, contract, integration, E2E, security, accessibility, performance, operations, and rollback layers.
4. Audit skips, filters, retries, flakiness, environment mismatch, and artifact/ref mismatch.
5. Require payment idempotency/duplicate paths, authorization boundaries, mixed schema/client versions, representative browser/device flows, telemetry, and rollback rehearsal.
6. Define cohort, abort thresholds, monitoring owner, hold period, and post-release checks.
7. Issue `READY`, `CONDITIONAL`, or `BLOCKED` with explicit residual risk and approver-owned exceptions.

**Expected artifacts:** evidence ledger; gap list; release decision record; rollout/monitor/rollback plan.

**Verification:** every material claim has traceable evidence against the frozen candidate; missing critical evidence cannot be hidden by aggregate pass counts.

**Stop/escalate:** block on candidate mismatch, skipped critical path, unsafe data rollback, unresolved high-severity finding, or unowned operational response.

## 5. `debugging-investigator` — Intermittent duplicate jobs

**Situation:** A production queue occasionally processes the same order twice during retries; logs are incomplete and the issue cannot initially be reproduced locally.

**Inputs:** symptom/expected contract; timestamps/IDs; first/last known versions; queue/retry config; traces/logs; recent changes; production safety limits.

**Expected workflow:**

1. Normalize a precise failure statement and preserve raw evidence.
2. Validate clocks, candidate/version, correlation IDs, sampling, and whether logs describe the same job attempt.
3. Bound the condition space by retry timing, lease/visibility timeout, idempotency key, worker concurrency, transaction boundary, and deployment version.
4. Create a ranked hypothesis ledger with predicted observations and discriminating experiments.
5. Add narrowly scoped, privacy-safe instrumentation for job attempt, lock/lease, transaction, and side-effect boundaries.
6. Falsify alternatives and build a causal chain from retry to duplicated side effect.
7. Recommend the smallest fix that restores the contract and a deterministic regression/concurrency test.

**Expected artifacts:** timeline; hypothesis ledger; experiment/instrumentation log; causal graph; minimal-fix recommendation; regression design.

**Verification:** the fix explains positive and negative evidence; at least one plausible competing hypothesis is falsified; reproduction is achieved or bounded with calibrated confidence.

**Stop/escalate:** stop before speculative broad refactor; escalate if safe observation is impossible, evidence integrity is compromised, or the proposed fix crosses a version/schema migration boundary.

## 6. `documentation-synchronizer` — CLI configuration rename

**Situation:** A CLI replaces `--cache-dir` and `CACHE_DIR` with a namespaced configuration key, changes precedence, and introduces a migration warning.

**Inputs:** final implementation diff; authoritative parser/config source; docs tree; generated-reference process; supported versions and audiences.

**Expected workflow:**

1. Run the drift scanner as a heuristic and manually verify affected surfaces.
2. Map user quickstarts, command reference, configuration/env docs, examples, CI snippets, migration guide, architecture notes, runbooks, and release notes.
3. Establish terminology/default/precedence/version truth from code and tests, not from old docs.
4. Edit source docs and generator inputs; never hand-edit generated output without its workflow.
5. Add old-to-new mapping, compatibility window, warning/removal behavior, rollback implications, and exact examples.
6. Validate commands/examples where safe; check links/anchors/navigation, search for stale terms, and compare all public surfaces.
7. Record intentionally unchanged docs and remaining ambiguity.

**Expected artifacts:** doc-impact map; synchronized edits; stale-term search; command/link/generator validation record.

**Verification:** all audiences receive consistent names/defaults/precedence; examples match parser behavior; generated sources and outputs are not confused.

**Stop/escalate:** stop when intended behavior is ambiguous or implementation/tests disagree; return that contract question to the implementer rather than inventing prose.

## 7. `product-design-director` — Redesign a B2B operations console

**Situation:** Users find a dense operations console hard to scan. The team wants a more confident brand expression without losing expert workflows.

**Inputs:** user jobs/research; product metrics; current screens; approved brand assets; platform constraints; content/data density; accessibility target.

**Expected workflow:**

1. Frame product jobs, decision hierarchy, business objective, constraints, and evidence gaps.
2. Audit current information architecture, state coverage, interaction friction, visual hierarchy, accessibility, responsive behavior, and preserved strengths.
3. Generate two or three materially different direction hypotheses on explicit axes—density, typography, color/contrast, shape, imagery, motion, and navigation.
4. Evaluate each against expert scanning, error consequence, brand evidence, implementation constraints, and accessibility.
5. Select a direction and define semantic tokens, hierarchy, component/state rules, responsive adaptation, empty/loading/error/permission states, motion intent, and reduced-motion behavior.
6. Deliver prioritized redesign guidance and acceptance examples; do not silently implement production architecture.

**Expected artifacts:** audit; direction comparison; selected design brief; UX/state model; visual-system rules; responsive/accessibility intent; implementation handoff.

**Verification:** direction decisions trace to user/product/brand evidence; dense expert tasks remain efficient; contrast/focus/target/text-scaling conflicts are resolved before handoff.

**Stop/escalate:** stop when the brief lacks the product decision needed to choose between directions; log assumptions rather than defaulting to a fashionable aesthetic.

## 8. `screenshot-to-interface` — Responsive storefront reconstruction

**Situation:** Approved desktop and mobile screenshots must be implemented in an existing React storefront. Original logo/icon files exist, but font identity and tablet behavior are uncertain.

**Inputs:** reference files and dimensions; viewport/device/state metadata; target repo/design system; asset rights; content and interaction contract; fidelity tolerance.

**Expected workflow:**

1. Build a reference register with provenance, viewport/state, crop/occlusion, and known/unknown facts.
2. Inspect existing tokens, components, routes, content/data boundaries, tests, and assets before creating new primitives.
3. Decompose regions, flow/grid/flex/overlay behavior, alignment lines, typography roles, image crops, z-order, and component repetition.
4. Form responsive hypotheses from cross-reference invariants; avoid one-screenshot coordinate tracing.
5. Use owned original assets; approximate unknown font only with an explicit licensed/project-safe fallback and log the fidelity limitation.
6. Implement semantic, maintainable components and all required states.
7. Render exact target viewports, compare side-by-side/overlay, classify structural vs cosmetic mismatch, iterate largest errors first, and verify keyboard/screen-reader/reduced-motion behavior.

**Expected artifacts:** reference register; decomposition/component map; responsive hypotheses; implementation; asset/provenance log; visual-diff record.

**Verification:** target viewports and one inferred intermediate width are compared; no screenshot-as-background hack; unresolved font/tablet assumptions are explicit.

**Stop/escalate:** stop on unlicensed assets, contradictory references, missing behavior contract that materially changes structure, or a production concern outside the bounded reconstruction.

## 9. `production-web-builder` — Authenticated account recovery flow

**Situation:** Add account recovery to an existing Next.js application with server rendering, email provider, rate limits, analytics, and internationalization.

**Inputs:** repository/framework/versions; approved UX; auth/data contracts; supported browsers/locales; deployment/runtime; security/privacy/performance requirements.

**Expected workflow:**

1. Inventory the project and resolve repository conventions, rendering/data boundaries, auth ownership, tests, deployment, and observability.
2. Model routes/components/server actions or handlers, validation boundaries, rate limiting, token lifecycle, error/retry states, and no-JS/native form behavior where applicable.
3. Prefer platform/framework capabilities; evaluate any form/schema/state/motion package conditionally against the dated matrix and resolved peers.
4. Implement semantic components with accessible labels, errors, focus, live-region behavior, responsive layouts, reduced motion, and localized content.
5. Keep secrets/server trust boundaries out of client bundles; make analytics privacy-aware and exclude recovery secrets/tokens.
6. Add unit/contract/integration/browser tests for enumeration resistance, expiry, replay, rate limits, success/error recovery, keyboard/screen reader, and supported browsers.
7. Verify browser console/network errors, production-like deployment, telemetry, metadata/SEO only where applicable, and performance impact.

**Expected artifacts:** bounded code change; architecture/package rationale; tests; browser/a11y/performance/observability evidence; docs handoff.

**Verification:** exact repository commands pass; critical browser journeys run against representative backend behavior; security and error states are observable without leaking secrets.

**Stop/escalate:** stop on ambiguous auth contract, unsupported runtime/package peer, unowned email/token security, or destructive schema action; hand final integrated gate to release verification.

## 10. `mobile-architecture-director` — Offline clinical field app

**Situation:** A clinical team needs iOS and Android tablet/phone support, long offline sessions, Bluetooth device integration, strict local-data protection, and a small web admin surface. The team knows TypeScript and Kotlin but not Dart.

**Inputs:** user workflows; device/API and offline constraints; regulatory/security controls; team/roadmap; UI divergence; release cadence; budget; vendor SDKs; prototype capacity.

**Expected workflow:**

1. Convert requirements into must/should/could constraints and disqualifiers.
2. Compare Flutter, Expo/RN, native, shared-domain/native-UI, and web/PWA where feasible.
3. Weight native SDK fit, offline database/sync, security/key management, performance, accessibility, platform UX, team skills, testing, CI/signing, store delivery, longevity, and escape cost.
4. Verify volatile framework/platform/vendor claims from current primary sources.
5. Identify uncertainty requiring prototypes: Bluetooth vendor SDK, encrypted offline store, background sync, large-form performance, and accessibility on target devices.
6. Run/define time-boxed spikes with measurable pass/fail criteria; update the weighted decision.
7. Produce ADR, native/shared boundaries, data/offline architecture, delivery model, risks, and reconsideration triggers.

**Expected artifacts:** constraints/disqualifiers; weighted matrix; prototype plan/results; platform ADR; architecture outline; risk/reversibility record.

**Verification:** chosen option satisfies all must constraints; alternatives are not rejected by popularity or team fashion; uncertain claims have prototype evidence or remain explicit blockers.

**Stop/escalate:** do not implement the app; block platform commitment when a must-have vendor/security/offline claim remains untested.

## 11. `flutter-production-builder` — Offline-first maintenance work orders

**Situation:** Flutter is selected. Technicians need cached assets/work orders, offline edits/photos, conflict resolution, background sync, deep links, and Android/iOS release.

**Inputs:** Flutter/Dart/project pins; backend contracts; offline/conflict policy; approved UI; device/storage/security needs; store targets; existing architecture.

**Expected workflow:**

1. Run read-only inventory; confirm actual SDK/toolchain, manifests, platforms, generation, tests, and project conventions.
2. Define feature/domain/data boundaries, ownership and state lifecycle before choosing Provider/Riverpod/BLoC/built-ins.
3. Define routes/deep links/restoration; API client/error/auth/token refresh; typed serialization and generator ownership.
4. Design local source of truth, schema migrations, outbox/idempotency, attachment lifecycle, sync state machine, conflict policy, retention/logout/account switching, and recovery.
5. Use secure storage only for small secrets; keep large/structured data in an appropriate store; evaluate packages against the dated matrix and exact project compatibility.
6. Implement adaptive layouts, semantics, text scaling, focus/keyboard/switch/voice behaviors, safe areas, permissions, and platform conventions.
7. Add unit/widget/golden only where stable, database/migration/integration/device tests, network-loss/restart/partial-sync cases, and profile-mode performance/memory checks.
8. Build/sign through established profiles, validate permissions/privacy/store metadata, stage rollout, and prepare rollback/forward recovery.

**Expected artifacts:** Flutter implementation; architecture/data decisions; migrations; tests; device/a11y/performance evidence; build/release checklist; docs handoff.

**Verification:** analyze/test and required generators pass; clean/install/upgrade/migration paths are tested without destructive assumptions; representative devices complete offline/online and recovery journeys.

**Stop/escalate:** stop on unresolved platform choice, unsupported plugin/native API, unclear conflict/security policy, or irreversible data migration without recovery.

## 12. `expo-react-native-builder` — Consumer app with OTA delivery and one native SDK

**Situation:** Expo is selected. The app uses Expo Router, push notifications, a vendor native identity SDK, local SQLite cache, animations, EAS Build, staged EAS Update, and App Store/Play release.

**Inputs:** package/lockfile and SDK pins; route/product design; vendor SDK docs; backend/auth contracts; offline/update/store policy; devices and environments.

**Expected workflow:**

1. Inventory package/config/native directories and confirm resolved Expo/RN/React/Node versions with official tooling and lockfile.
2. Model Router layouts/groups/modal/deep links and separate navigation state from product/server/durable state.
3. Decide whether an existing maintained module/config plugin fits the identity SDK; otherwise define owned Expo module/native boundary, build implications, permissions, and device tests.
4. Design API/auth refresh, public vs secret environment values, SecureStore use, SQLite migrations/cache/outbox/conflicts, account cleanup, and offline recovery.
5. Add Reanimated/Gesture Handler only for interactions that warrant them; measure current SDK/device memory and honor reduced motion.
6. Build unit/component tests plus development-build device E2E for auth, notifications, offline restart/sync, deep links, accessibility, and release-mode performance.
7. Define EAS build profiles, credentials, runtime version, channels, signed updates where applicable, staged OTA rollout, telemetry/abort/rollback, and binary-only cases.
8. Prepare store artifacts, privacy/permissions/metadata/review notes, target API compliance, staged store release, and rollback.

**Expected artifacts:** Expo/RN implementation; native/config decision; offline/security/update records; tests/device evidence; EAS/store checklist; docs handoff.

**Verification:** `expo-doctor` and repository checks pass where applicable; development builds—not Expo Go alone—exercise native behavior; OTA candidate matches its native runtime; known SDK regressions are rechecked and measured.

**Stop/escalate:** stop on incompatible native SDK/New Architecture support, ambiguous runtime/update policy, leaked secrets, unowned credentials, or native changes proposed as OTA-only.

## 13. `review-and-refactor-code` - Review and modularize a payment rules engine

**Situation:** A branch changes payment-rule ordering and the team also wants to split one large evaluator. The change must be reviewed before any structural edit.

**Inputs:** repository and cleanly identified diff; intended ordering and error contracts; callers; generated boundaries; existing tests; explicit approval state.

**Expected workflow:**

1. Freeze base/head, working-tree state, intended behavior, scope, and exclusions.
2. Trace changed rules through callers, data contracts, side effects, tests, and operational consumers.
3. Admit only findings with an observable failure, tight location, trigger, evidence, correction, priority, and confidence.
4. Build a behavior-parity ledger and propose small refactor slices with characterization tests and rollback points.
5. Stop at AWAITING_APPROVAL without editing.
6. After explicit approval, recheck repository state, execute only approved slices, and verify each invariant.

**Expected artifacts:** prioritized findings; optional improvements kept separate; parity ledger; bounded proposal; approval state; post-approval diff and verification record when authorized.

**Verification:** review locations resolve; speculative and style observations are excluded; the first run changes no files; approved slices preserve inputs, outputs, errors, ordering, side effects, and callers.

**Stop/escalate:** stop on ambiguous approval, missing behavior evidence, generated source confusion, a required compatibility migration, or a newly discovered failure needing causal debugging.

## 14. `optimize-codebase-performance` - Reduce search API tail latency

**Situation:** Search p99 rises under representative concurrent load. The team wants a measured optimization without changing result order, permissions, or pagination.

**Inputs:** critical path; workload and data shape; environment and build; metric and threshold; profiler and telemetry; correctness invariants; compute budget; explicit approval state.

**Expected workflow:**

1. Record the performance contract and capture comparable baseline samples with raw artifacts.
2. Trace application, database, external-service, memory, and infrastructure evidence relevant to the measured path.
3. Write falsifiable bottleneck hypotheses and reject those contradicted by profiles, plans, counters, or controlled comparisons.
4. Rank bounded batches by impact, evidence, risk, reversibility, and measurement cost.
5. Stop at AWAITING_APPROVAL without editing.
6. After explicit approval, implement one batch, run correctness checks, repeat the same benchmark, and accept or reject it from evidence.

**Expected artifacts:** baseline record; hypothesis ledger; bounded proposal; approval state; comparable result table; negative experiments; trade-offs and residual bottlenecks.

**Verification:** baseline and candidate use the same workload and material environment; p99 and secondary metrics are reported with units and variance; permissions, ordering, pagination, and errors remain valid.

**Stop/escalate:** stop when no safe representative baseline exists, measurements are non-comparable, approval is ambiguous, the remedy becomes a migration, or production or cost authority is required.

## 15. `codebase-improvement-planner` — Prioritize the next codebase upgrade

**Situation:** A mature repository has accumulated technical debt, inconsistent tests, several old dependencies, duplicated domain logic, and manual release steps. The team knows it should improve the codebase but has not chosen a specific change.

**Inputs:** repository root and working-tree state; product/operational constraints; protected contracts; current build/test/CI/deploy evidence; optional maintenance goals; implementation authorization state.

**Expected workflow:**

1. Freeze audit scope, exclusions, protected behavior, and whether the task is discovery-only or may continue after approval.
2. Establish a breadth-first baseline across architecture, contracts, tests, CI, tooling, dependency/runtime health, developer workflow, reliability, observability, and operations.
3. Admit only candidates with concrete repository evidence, expected benefit, confidence, unknowns, verification target, and a likely owning workflow.
4. Classify each admitted candidate as Major, Medium, or Minor from contract reach, coordination, reversibility, and verification burden rather than line count.
5. Rank candidates separately from magnitude using value, evidence strength, cost of delay, effort, risk, reversibility, and verifiability.
6. Recommend one next upgrade and one runner-up when repository evidence cannot resolve a business-priority tie; explain why a smaller candidate may outrank a Major change.
7. Produce the grouped backlog and a bounded execution slice, then stop at AWAITING_APPROVAL before broad edits.
8. After explicit approval, either hand the selected migration/debugging/performance/refactor/platform task to its specialist or execute only the approved maintenance slice and verify it.

**Expected artifacts:** scope/evidence limits; Major, Medium, and Minor backlog; candidate evidence/confidence/verification fields; recommended next upgrade; runner-up when needed; bounded proposal; specialist handoff or approved maintenance verification.

**Verification:** every recommendation resolves to repository evidence; magnitude and priority remain separate; speculative/style-only items are rejected; broad discovery changes no files; any approved execution stays inside the proposed slice and reports evidence gained or improved.

**Stop/escalate:** stop when evidence is too weak to rank candidates, a selected candidate becomes a specialist-owned workflow, repository state materially changes, approval is absent, or implementation would exceed the proposed magnitude/scope.
