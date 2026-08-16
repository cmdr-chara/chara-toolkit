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

## Acceptance

- Pass all 15 primary routes.
- Pass at least seven of nine overlap sequences with no incorrect co-primary activation.
- Treat a missing skill, stale display label, or wrong primary route as a failure even if the eventual answer is plausible.
- If a case fails, record client version, installed skill path, selected skills, and rationale; fix metadata or trigger boundaries, then rerun only the failed case and its nearest overlap case.
