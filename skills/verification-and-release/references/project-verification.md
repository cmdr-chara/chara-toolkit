# Project-specific application verification

Load when the user asks whether a real CLI, service, browser UI, or desktop app **works as a user would operate it**, or when a critical feature has only static/unit-level evidence.

## Source-grounded control recipe

1. Inspect the actual repository first: how to launch, readiness signal, user-facing entry points, how to drive them, and what persisted side effect or visible state establishes success.
2. Prefer existing Playwright/Cypress/device/E2E tests or CLI/API harnesses. Do not invent working selectors, routes, or credentials. If no harness exists, add the smallest project-owned one and verify it against a real instance before claiming success.
3. Treat separate instances/data stores as exclusive resources. A runner must not hijack a developer's live browser, customer account, home profile, port, or production database.
4. Run the real journey and one meaningful failure/recovery path with the project's supported tools. Capture action *and* outcome: exit status, trace, screenshot/DOM, logs, API response, or durable side effect.
5. Keep the evidence when tearing down only the processes and scratch state started for the check. A screenshot of the initial screen or an unexecuted command is not evidence of behavioral correctness.
6. Store a small feature map tied to source entry points. After implementation changes, reconcile its routes/selectors/commands with code and rerun changed journeys. Unreachable is a known gap, never a PASS.

### Optional project-local skill generator

Codex Toolkit ships a cross-agent tool at scripts/project-verification.mjs. First write a checked-in, explicit verification profile from repository evidence. The generator never launches or deletes anything:

    node scripts/project-verification.mjs generate --workspace /path/to/project --manifest verification-profile.json --out .agents/skills/verify-<app-id>
    node scripts/project-verification.mjs generate --workspace /path/to/project --manifest verification-profile.json --out .agents/skills/verify-<app-id> --write
    node scripts/project-verification.mjs check --workspace /path/to/project --manifest verification-profile.json --out .agents/skills/verify-<app-id>

Profile schema and an example are in docs/project-verification.md. Generate only after verifying every launch/doctor/drive argv against the actual project; generation does **not** execute or certify the app. When real execution is authorized in an OS-isolated test workspace, use scripts/drive-project-verification.mjs with explicit --acknowledge-live-execution to launch, health-check, drive, and stop the direct child process. Driver scripts must themselves assert the visible/durable outcome; a clean process exit alone is insufficient. The check fails closed on map drift rather than overwriting user edits. Keep the generated skill project-local and let the project owner choose how it is installed in different agent clients.

## Handoff

Feature builders own implementation and focused user-journey evidence. This release skill evaluates the final candidate, additional operational requirements, and remaining uncertainty. Never upgrade an unrun feature map or an unavailable browser to a READY verdict.
