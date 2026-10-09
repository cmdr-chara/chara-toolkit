# Contributing

Chara's Toolkit accepts small, testable improvements. An issue or pull request should state the user request it addresses and the behavior that should change.

## Before editing

- Keep each skill self-contained. Do not add a hidden shared runtime.
- Put trigger conditions in the `description` field of `SKILL.md`, not in a body-only "when to use" section.
- Keep detailed or time-sensitive material in `references/` and link it directly from `SKILL.md`.
- Prefer read-only helper scripts. If a script can write, its scope and safety checks must be explicit.
- Do not copy unlicensed prompts, prose, or code.

## What to update

| Change | Expected evidence |
| --- | --- |
| Trigger or routing behavior | Positive, negative, and overlap cases where relevant |
| Workflow or stopping point | Matching workflow scenario and adversarial review note |
| Helper script | A smoke fixture that proves output and input preservation |
| Time-sensitive package claim | Primary source, checked date, and refresh boundary |
| New skill | `SKILL.md`, `agents/openai.yaml`, routing cases, workflow scenario, and any required notices |

## Run the checks

```sh
python scripts/validate_skill_pack.py . --as-of YYYY-MM-DD
python scripts/run_smoke_tests.py . --as-of YYYY-MM-DD
npm pack --dry-run
```

Use the date on which you checked time-sensitive sources. The pull request should explain any warning instead of hiding it with an older date.

## Pull requests

Keep one behavioral change per pull request when practical. Describe what you ran, what passed, and what still requires a live Codex routing check.
