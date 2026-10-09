# Real application verification

For meaningful user-facing changes, unit tests alone rarely prove the actual user journey. Use the relevant builder skill, then the conditional workflow in skills/verification-and-release/references/project-verification.md.

## Optional project-local verification skill

The toolkit can generate a small, project-owned verification skill from an **explicit, source-grounded profile**. It never invents routes or executes commands. Before writing a profile, inspect the source of truth for start commands, readiness checks and existing UI/CLI/API tests. The operator is responsible for confirming that all commands are safe in an isolated test account or environment.

Example file verification-profile.json (replace with actual project commands and file paths):

    {
      "schema": 1,
      "app": {"id": "checkout-app", "name": "Checkout App"},
      "launch": {"argv": ["node", "scripts/start-test-server.mjs"]},
      "doctor": {"argv": ["node", "scripts/health-check.mjs"]},
      "features": [
        {
          "id": "buy-item",
          "title": "Buy an item",
          "entry": "Test checkout route",
          "drive": {"argv": ["node", "tests/checkout-smoke.mjs"]},
          "sources": ["src/routes/checkout.ts", "tests/checkout-smoke.mjs"],
          "expected": "Confirmation visible and transaction saved to test storage"
        }
      ]
    }

Create a plan without writing:

    node scripts/project-verification.mjs generate --workspace /path/to/project --manifest verification-profile.json --out .agents/skills/verify-checkout-app

After reviewing the plan, explicitly create the skill:

    node scripts/project-verification.mjs generate --workspace /path/to/project --manifest verification-profile.json --out .agents/skills/verify-checkout-app --write

Verify after every relevant change:

    node scripts/project-verification.mjs check --workspace /path/to/project --manifest verification-profile.json --out .agents/skills/verify-checkout-app

To execute the approved launch, readiness check and feature drivers in a deliberately isolated test workspace (scripts may have side effects):

    node scripts/drive-project-verification.mjs --workspace /tmp/isolated-project --manifest verification-profile.json --acknowledge-live-execution

Use --feature buy-item to run one mapped feature. The runner starts the declared process with no shell, retries the doctor check, executes the declared driver argv, records exit codes and output hashes, and terminates **only its direct launched process**. It cannot certify a browser interaction unless that driver actually asserts a user-visible outcome and durable effect. Processes spawned by the test server may need their own project-specific cleanup. Do not point it at personal accounts or production systems.

The check detects changed *listed source files* through SHA-256 fingerprints, modified generated recipes, missing feature entries, and unexpected files. It does not know about newly created routes that are absent from the manifest. Periodically inspect routes, CLI commands, and production behavior for newly introduced features, then update and review the manifest. The generator refuses to overwrite existing output: move a reviewed replacement into place using your project's approved change procedure, preserving edits and backups.

Generated files are ordinary Agent Skills files. Put them under an agent-supported project skill directory for clients that do not discover .agents/skills; do not change the toolkit's 22 global specialists.

## Runtime verification acceptance

The agent executes the exact documented project launch/doctor/drive commands using its host tools. For each feature, record candidate SHA, environment, action, actual exit/visible result, persisted side effect, accessibility/error behavior when applicable, and the evidence file. Exercise one critical negative path. Launch only isolated instances, avoid personal user profiles, and tear down what the check created without erasing evidence.

A generated map that was never driven is a recipe, not a passed test. Never claim full coverage when only a subset was checked.

## Maintenance contract

Treat a feature map as authoritative only for reviewed routes. Changes to the listed source files invalidate its fingerprints, requiring an inspection/review; changes elsewhere may not. If the script cannot inspect a project, report a precise gap rather than inventing instructions. Favor existing Playwright, native device harnesses, API fixtures, and CLI tests before creating new tooling.
