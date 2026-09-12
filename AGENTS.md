# Codex Toolkit agent instructions

## Purpose

This repository defines reusable Codex skills, agents, routing, installation, and evaluation behavior. Keep repository guidance small and durable; detailed task procedures belong in the relevant skill, orchestration document, script, or runbook.

## Core invariants

- Route to the smallest specialist/workflow that owns the task. Do not turn optional workflow edges into mandatory chains.
- Repository-local `AGENTS.md` instructions remain authoritative over generic toolkit guidance.
- Specialist safety, approval, migration, and stop conditions cannot be bypassed by orchestration or completion helpers.
- `unlazy` owns completion discipline; `verification-and-release` owns integrated ship/no-ship judgment. Keep those responsibilities distinct.
- Managed global `AGENTS.md` installation must preserve all user content outside the toolkit markers and fail closed on malformed/duplicate managed blocks.
- Auto-update behavior follows published releases, not unreleased `main` commits.

## Changes

- Prefer editing an existing skill or router when the concept already has an owner; avoid overlapping skills with near-identical triggers.
- Keep skill descriptions precise about when the skill applies. Put long procedures and references behind progressive disclosure instead of front-loading them into descriptions or global routing.
- Do not encode model weaknesses as permanent ceremony when the behavior can be expressed as a durable constraint, permission boundary, trigger, or completion condition.
- Preserve installer idempotence, custom `CODEX_HOME`, and cross-platform behavior when changing packaging or setup code.

## Verification

Use the narrowest relevant checks while iterating. Before an integrated toolkit change is complete, run the repository-provided validation for the affected skills/routing/installer and the normal package/CI checks. Do not weaken validators to make a new skill or workflow pass.

## Completion

A toolkit change is complete when routing remains unambiguous, installation/update behavior is preserved, affected validators/evaluations pass, public docs reflect user-visible changes, and any compatibility or rollout risk is stated explicitly.
