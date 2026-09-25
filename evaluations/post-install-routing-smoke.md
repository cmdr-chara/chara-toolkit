# Post-install Routing Smoke Test

Run each prompt in a fresh Codex task after installing the pack. Do not name a skill in the prompt. Record the first skill selected by the client before evaluating the answer.

## Primary routes

| ID | Prompt | Expected primary skill |
| --- | --- | --- |
| R1 | Map this unfamiliar monorepo's deployables, ownership evidence, dependency boundaries, hotspots, and likely blast radius for changing the auth token schema. | `repository-intelligence` |
| R2 | Split this already-mapped migration between agents with exclusive write scopes, dependency waves, handoff evidence, and integration order. | `multi-agent-work-coordinator` |
| R3 | Upgrade this public API from v1 to v2 with compatibility adapters, telemetry, staged rollout, deprecation, and rollback. | `codebase-evolution-controller` |
| R4 | Decide whether this integrated release candidate is ready, conditional, or blocked from the supplied CI, rollback, and operational evidence. | `verification-and-release` |
| R5 | Investigate why checkout intermittently returns stale totals after retries; rank hypotheses, isolate the cause, and design a regression test. | `debugging-investigator` |
| R6 | This CLI flag rename changed defaults; find and update every affected user guide, example, configuration reference, migration note, and runbook. | `documentation-synchronizer` |
| R7 | Define a distinctive UX and visual direction for a new planning product, including hierarchy, responsive rules, accessibility, and motion intent. | `product-design-director` |
| R8 | Recreate these supplied desktop and mobile screenshots as maintainable responsive components while preserving measured visual fidelity. | `screenshot-to-interface` |
| R9 | Implement this approved responsive checkout flow in the existing Next.js app, including data, forms, accessibility, tests, and browser verification. | `production-web-builder` |
| R10 | Compare Flutter, Expo/React Native, and native for this product using hard gates, weighted criteria, proof spikes, and operational constraints. | `mobile-architecture-director` |
| R11 | Implement this approved feature in the existing Flutter app with routing, offline persistence, platform integration, tests, and release checks. | `flutter-production-builder` |
| R12 | Implement this approved feature in the existing Expo app with Router, development builds, offline behavior, device tests, EAS Build, and Update policy. | `expo-react-native-builder` |
| R13 | Review this feature branch for actionable defects, assess whether its duplicated parser should be refactored, and stop with a concrete proposal before editing. | `review-and-refactor-code` |
| R14 | Profile this API's p99 under a representative workload, identify falsifiable bottlenecks, and stop with a bounded optimization proposal before editing. | `optimize-codebase-performance` |
| R15 | Inspect this repository without a predefined change, group the best improvement opportunities into Major, Medium, and Minor, and recommend the highest-value next upgrade. | `codebase-improvement-planner` |
| R16 | Audit this TypeScript repository for unsafe assertions, broad unknown/any contracts, suppressions, boundary-parsing debt, and staged deterministic anti-slop enforcement; stop before changing policy or source. | `typescript-quality-enforcer` |
| R17 | Inspect this user-owned PDF for Content Credentials and document metadata, preserve the original, propose only the smallest deterministic cleanup, and verify any approved cleaned copy without claiming it proves human authorship. | `content-provenance-hygiene` |
| R18 | This substantial task is already scoped. Use explicit completion gates, prove every requested deliverable, rerun stale checks on the final candidate, and re-measure every count before reporting success. | `unlazy` |
| R19 | Hunt this repository for important correctness bugs we do not know about yet. Derive invariants, inspect high-risk lifecycle/concurrency/persistence boundaries, and prove or retire concrete candidates rather than listing code smells. | `bug-finder` |
| R20 | This Windows task is blocked by a policy-blocked npm shim, nested native-command quoting failures, and an unknown browser executable. Resolve one supported local invocation before retrying the build and browser check. | `toolchain-preflight` |
| R21 | Review these tenant-scoped invoice endpoints and signed attachment fetches for authorization bypass, SSRF, unsafe input handling, and realistic security regressions. | `security-review` |

## High-risk overlaps

| ID | Prompt | Expected sequence |
| --- | --- | --- |
| O1 | We have an unfamiliar monorepo and want four agents to modernize authentication safely. | `repository-intelligence` then `multi-agent-work-coordinator` |
| O2 | A framework upgrade now crashes startup for an unknown reason; determine why, then finish the migration safely. | `debugging-investigator` then `codebase-evolution-controller` |
| O3 | Redesign this dashboard from product goals, then implement the approved direction in its existing web app. | `product-design-director` then `production-web-builder` |
| O4 | Choose our mobile stack, then build the feature after the architecture decision is approved. | `mobile-architecture-director` then exactly one of `flutter-production-builder` or `expo-react-native-builder` |
| O5 | Map an unfamiliar service, then review a defined diff inside it. | `repository-intelligence` then `review-and-refactor-code` |
| O6 | A refactor caused a deadlock; find the cause, then propose a safe structural correction. | `debugging-investigator` then `review-and-refactor-code` |
| O7 | The API returns wrong totals and is slow; fix the evidence order. | `debugging-investigator` then `optimize-codebase-performance` |
| O8 | Measure and optimize p99, then decide whether the integrated release can ship. | `optimize-codebase-performance` then `verification-and-release` |
| O9 | We do not know what to improve yet; inspect the repository, choose the best upgrade, then route that concrete task to the specialist that owns it. | `codebase-improvement-planner` then the selected specialist skill |
| O10 | We do not know what to improve first; after the repository planner identifies recurring TypeScript type-evidence loss as the best next upgrade, stage deterministic enforcement without turning it into a toolchain migration. | `codebase-improvement-planner` then `typescript-quality-enforcer` |
| O11 | The provenance service corrupts a PDF during an authorized metadata cleanup; first preserve the failed artifact and establish the sanitation evidence, then investigate why the service produced an invalid file. | `content-provenance-hygiene` then `debugging-investigator` |
| O12 | The approved refactor has five required slices and keeps getting reported done early; preserve the refactor approval boundary, then use completion gates to prove every slice and integration invariant. | `review-and-refactor-code` then `unlazy` |
| O13 | We do not have a known provider bug. Hunt for one, prove the strongest candidate, and only then determine the causal chain for that confirmed failure. | `bug-finder` then `debugging-investigator` |
| O14 | The repository test command cannot start because the shell shim is blocked; first establish a supported invocation, then investigate the reproducible stale-total failure that appears once the tests run. | `toolchain-preflight` then `debugging-investigator` |
| O15 | Review a refactor that changes tenant authorization. Security exploitability is primary; ordinary structural cleanup comes after the trust-boundary review. | `security-review` then `review-and-refactor-code` |

## Acceptance

- Pass all 21 primary routes.
- Pass at least thirteen of fifteen overlap sequences with no incorrect co-primary activation.
- Treat a missing skill, stale display label, or wrong primary route as a failure even if the eventual answer is plausible.
- If a case fails, record client version, installed skill path, selected skills, and rationale; fix metadata or trigger boundaries, then rerun only the failed case and its nearest overlap case.

## Mission Control portability smoke

Run these separately from the primary skill-routing table. They test the optional Mission Control bundle, not a production-skill route.

| ID | Prompt | Expected role |
| --- | --- | --- |
| M1 | Search these twelve supplied policy documents in parallel and return the exact clauses about retention and deletion. Do not edit them. | `pathfinder-reader` |
| M2 | Compare four independent research tracks against the same criteria and return evidence-backed findings for parent synthesis. | `investigator-reader` |
| M3 | Apply three independent one-line corrections to three separately owned Markdown files. | `patcher-writer` |
| M4 | Build three independent sections of a report, one writer per section, then return them for parent integration. | `builder-writer` |
| M5 | Adversarially review a privacy policy for high-consequence gaps without changing the source. | `sentinel-reader` |
| M6 | Migrate a regulated data dictionary and operator runbook as one bounded high-consequence change with recovery evidence. | `architect-writer` |

If named custom roles are unavailable, record the runtime fallback rather than counting a generic subagent as the named role.

