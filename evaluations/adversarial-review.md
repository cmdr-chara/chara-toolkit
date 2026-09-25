# Adversarial Self-Review

**Review date:** 2026-07-17  
**Scope:** all fourteen `SKILL.md` files, references, helpers, root routing/licensing material, and evaluations.

## Review questions and resolutions

| Risk | Finding | Correction or control | Status |
| --- | --- | --- | --- |
| Generic language | Early drafts contained broad quality phrases that could not guide an agent. | Replaced with evidence contracts, concrete inputs, ordered actions, output schemas, failure handling, verification, and stop conditions. Validator rejects `follow best practices`, placeholders, and empty generic headings. | Resolved |
| Trigger overlap | Repository analysis and delegation both discussed conflicts; design and builders both discussed UI; builders and release both discussed tests. | Responsibility matrix and every relevant skill now distinguish owned decision, prerequisite, feature-level verification, handoff, and final release gate. Added 18 ambiguity cases. | Resolved |
| Existing-toolkit duplication | A generic coordinator risked duplicating `delegate-with-mission-cards`. | Coordinator owns work DAG, ownership, dependency waves, integration, and acceptance. Existing Mission Control remains an optional model-agnostic role and mission-card adapter. | Resolved |
| Bloated skill bodies | The source design skill is large and prescriptive. | Re-authored concise operational bodies (all under 500 lines) and moved detail/volatile facts into intentionally linked references. | Resolved |
| Package shopping list | Web/mobile drafts could hard-code fashionable packages. | Package selection starts from repository and behavior; dated matrices include compatibility, maintenance, license, security/deprecation, cost, built-in alternative, and choose/avoid cases. | Resolved |
| Unsupported current facts | Framework/package versions can change after authoring. | Version claims are dated, sourced, and separated from core workflow. Validator checks age and required evidence columns. Known 2026-07-20 Next.js refresh is explicit. | Controlled; refresh required |
| Popularity as quality | Ecosystem adoption could be mistaken for endorsement. | Ledger and matrices state adoption is only a fit/risk signal; no choice is justified by stars/downloads alone. | Resolved |
| Unsafe Git/file behavior | Generic agents often clean/reset/stash or mass-format. | All skills preserve user work and prohibit destructive assumptions. Helpers are read-only, path-bounded, network-free, and standard-library Python. Validator scans for destructive command patterns. | Resolved |
| Generated files | Migration/docs/build workflows might edit generated artifacts directly. | Skills require identifying authoritative source/generator, single-owner generated surfaces, and repository commands; helpers report generated signals only. | Resolved |
| Release self-approval | Platform builders could declare final readiness after their own tests. | Builders own feature-level checks only; `verification-and-release` owns frozen-candidate evidence and `READY`/`CONDITIONAL`/`BLOCKED`. | Resolved |
| Debugging by upgrade | Version changes can mask an unknown root cause. | `debugging-investigator` diagnoses unknown failures; evolution controller changes versions after cause/target is defined. Ambiguity cases enforce order. | Resolved |
| Screenshot copying/rights | Fidelity work could redistribute protected assets or trace one viewport. | Added provenance/rights register, asset alternatives, responsive hypotheses, semantic/component requirements, accessibility, and exact visual comparison. | Resolved |
| Third-party license | Adapted design concepts could lose the upstream notice or imply endorsement. | Complete MIT notice, file/section map, modification description, no-endorsement statement, and per-skill provenance files are included. No source assets/code copied. | Resolved |
| Platform ideology | Mobile selection could default to Flutter or Expo. | Director compares Flutter, Expo/RN, native, shared-domain/native-UI, web/PWA/other against must constraints, disqualifiers, weighted criteria, and prototypes. | Resolved |
| Parser correctness | First Flutter inventory smoke test let indented YAML content bleed across top-level sections because a DOTALL regex was too broad. | Replaced it with a bounded line/indent parser, added `flutter_test` to selected evidence, and asserted environment/dependency/dev-dependency separation on a fixture. | Resolved |
| Heuristic overclaim | Repository/doc inventory scripts might be treated as semantic truth. | Every helper labels output as signals/review prompts; skill bodies require manual corroboration and confidence. | Resolved |
| Secret exposure | Environment/config inventory could read secret values. | Helpers report environment filenames/keys only where applicable and explicitly avoid file contents. Skills require redaction and trust-boundary review. | Resolved |
| Evaluation superficiality | Trigger examples alone would not test full workflows. | Added four positive and three negative cases per skill, ambiguity sequences, one full scenario per skill, package-claim protocol, and structural validator. | Resolved |

| Review and refactor overreach | A broad skill could report style preferences as bugs or rewrite code on a review request. | Added a five-part finding admission contract, separate optional improvements, behavior-parity evidence, and an AWAITING_APPROVAL stop before edits. | Resolved |
| Performance theater | Static hunches or incomparable timings could be presented as optimization wins. | Require a named critical path, reproducible baseline, falsifiable hypotheses, comparable remeasurement, correctness checks, and retained negative results. | Resolved |

## Manual review still required after merge

1. Run the validator in an actual checkout of `cmdr-chara/codex-toolkit` and confirm no collision with repository changes after 2026-07-17.
2. Append—not replace—the existing `skills/llms.txt` entry and preserve Mission Control files/installers.
3. Recheck the Next.js security release scheduled for 2026-07-20.
4. Resolve framework/package claims against the target project's actual lockfiles before using them.
5. Run routing cases in the intended Codex client/harness; static validation cannot measure model activation precision.
6. Run platform/device/browser/store scenarios with real toolchains where consequence warrants it; this build runtime did not include every ecosystem SDK or store credential.
