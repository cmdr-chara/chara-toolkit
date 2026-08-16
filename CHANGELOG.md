# Changelog

## Unreleased

## 0.5.0 - 2026-08-16

- Add `codebase-improvement-planner` for open-ended repository improvement discovery, Major/Medium/Minor magnitude classification, evidence-backed ranking, and next-upgrade selection.
- Add `typescript-quality-enforcer` for evidence-backed TypeScript/JavaScript quality audits, staged lint/type-safety enforcement, and approval-gated remediation without diagnostic laundering.
- Vendor the MIT-licensed `dmmulroy/anti-slop` Oxlint runtime from pinned base revision `446268e5d15baa968eaec669ff65358d36ae6259`, preserve attribution, and document three local correctness patches with a checked-in integrity manifest.
- Harden the TypeScript quality inventory with directory pruning, JSONC tsconfig parsing, nested workspace tsconfig discovery, and focused regression coverage.
- Enforce vendored anti-slop content integrity file-by-file in CI rather than validating filenames alone.
- Refresh the repository social preview for seventeen skills and derive its version/skill count from canonical package/catalog metadata.
- Add automatic GitHub release publishing on package-version changes to `main`: validate the pack, create the version tag, publish changelog-backed release notes, and clean up the known merged feature branches.
- Include the 0.4.1 Mission Control routing refresh already present on `main`, with Luna Max for general subagents and Sol reserved for higher-consequence escalation.

## 0.4.1 - 2026-08-16

- Route the four general Mission Control roles through GPT-5.6 Luna with `max` reasoning for the current Codex Subagents V2 runtime.
- Route high-risk read-only review through GPT-5.6 Sol High and reserve Sol Max for extreme-risk implementation.
- Remove Terra from Mission Control routing and validate the model-tier policy as part of the structural check.
- Document the distinction between verified public model guidance and the newer Subagents V2 runtime label.

## 0.4.0 - 2026-08-11

- Add public CI for structural validation, helper smoke tests, package inspection, and an isolated Mission Control install.
- Scope the package name to `@cmdr-chara/codex-toolkit` to avoid colliding with an unrelated npm package.
- Require PowerShell 7 for the repository-owned installer and make its default home-directory lookup profile-independent.
- Tighten the README around the fastest useful install, trust signals, and the distinction between individual skills and Mission Control.
- Correct the evaluation guide to reflect all fifteen primary skill routes.

## 0.3.0 - 2026-07-31

- Add review-and-refactor-code for evidence-backed findings and behavior-preserving refactors.
- Add optimize-codebase-performance for measured bottleneck analysis and bounded optimization.
- Require both skills to stop at a concrete proposal before editing repository files.
- Add focused references, routing cases, overlap cases, workflow scenarios, and live smoke prompts.
- Rewrite the README in simpler language with shorter task-based skill selection and installation guidance.
- Make validator counts derive from the canonical skill list instead of fixed twelve-skill wording.
- Record the unlicensed public skill collection as conceptual research only; no source prose or code is included.
- Refresh Next.js security evidence with the July 2026 fixed releases and next review date.

## 0.2.0 - 2026-07-17

- Add twelve production workflow skills for repository intelligence, coordination, evolution, verification, debugging, documentation, product design, screenshot reconstruction, web development, mobile architecture, Flutter, and Expo/React Native.
- Add human-facing `agents/openai.yaml` metadata for every new skill.
- Add eight read-only repository inventory and verification helpers.
- Add routing, overlap, workflow, provenance, and time-sensitive package research evaluations.
- Add network-free structural and smoke-test harnesses.
- Preserve Mission Control as the optional model-routed delegation bundle and document its handoff from the generic work coordinator.
- Credit the MIT-licensed Taste Skill adaptations in `THIRD_PARTY_NOTICES.md`.

## 0.1.0 - 2026-07-11

- Add the `delegate-with-mission-cards` Mission Control skill.
- Add six reader and writer roles routed across GPT-5.6 Luna, Terra, and Sol.
- Add cross-platform GitHub-backed `npx` installation with conflict backups.
- Support standard `npx skills add` discovery and skill-only installation.
