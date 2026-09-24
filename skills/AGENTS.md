# Skill authoring instructions

Applies to `skills/`.

- Each skill must have one clear decision domain and a trigger narrow enough to avoid irrelevant loading.
- Prefer a short `SKILL.md` router plus task-specific references/scripts over a monolithic instruction file. Keep discovery descriptions to the smallest wording that reliably distinguishes activation.
- State durable constraints, required evidence, permissions, and completion conditions; avoid rigid step ordering unless the order is semantically required.
- Reuse existing specialists before creating a new overlapping skill.
- Keep examples representative rather than exhaustive. Do not make every historical edge case part of the default context.
- Treat roughly 180 root lines / 1400 body words as a review signal, not a target or hard limit. Extract conditional checklists, rare failure cases, ecosystem guidance, and specialist playbooks behind explicit `references/` routing.
- Preserve explicit safety, approval, migration, and stop conditions when simplifying instructions.
- When behavior changes, update the matching validator/evaluation and any catalog text that users rely on.
