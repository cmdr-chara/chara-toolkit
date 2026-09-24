---
name: documentation-synchronizer
description: Update documentation to match code, API, schema, configuration, deployment, or operational changes. Use when implementation changes create documentation drift.
---

# Documentation Synchronizer

Keep user and maintainer documentation aligned with implemented behavior without inventing product semantics.

## Trigger boundary

Use this skill when code/config/API/schema/UI/deployment/operations changed and documentation must be mapped and synchronized.

Do not trigger for unrelated marketing copy, invented product behavior, or as a substitute for implementation verification.

## Required inputs

Resolve the implementation diff/change set, authoritative behavior/contracts, audiences, release/version context, repository working tree, generated docs ownership, and protected user work.

For a read-only drift scan:

```sh
python skills/documentation-synchronizer/scripts/doc_drift_scan.py . --format markdown
```

Verify candidate matches against the real change.

## Safety baseline

- Preserve uncommitted work.
- Do not edit generated docs before identifying their source/generator.
- Do not copy stale docs forward merely for consistency.
- Mark unknown behavior and send it back to the implementer instead of inventing an answer.

## Workflow

1. **Extract the contract delta.** Identify what changed for users, developers, operators, APIs, config, schemas, or migrations.
2. **Map surfaces.** Use `references/doc-surface-map.md` to find READMEs, guides, API docs, examples, runbooks, migration notes, comments, schemas, and generated surfaces.
3. **Establish authority/audience.** Decide which source governs each claim.
4. **Update coherently.** Keep terminology, examples, commands, defaults, and migration/release notes aligned.
5. **Cross-check.** Use `references/update-checklist.md` for links, examples, config, versioned claims, and generated-doc handling.
6. **Report.** State changed surfaces, validated examples/links, known gaps, and behavior questions returned to implementation owners.

## Handoffs and interaction boundaries

Behavior ambiguity goes back to the owning implementation specialist. Migration semantics go to evolution, security-sensitive docs to `security-review`, and release-blocking documentation evidence to `verification-and-release`.

## Failure handling

If authoritative behavior cannot be established, do not harmonize conflicting docs by guess. Record the conflict and the owner needed to resolve it.

## Stop conditions

Stop when affected documentation surfaces agree with authoritative behavior and remaining unknowns or generated-doc actions are explicit.
