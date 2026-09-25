# Optional Mission Control Adapter

`delegate-with-mission-cards` supplies six portable reader/writer roles and mission-card formats. The coordinator still owns the work graph, write ownership, dependencies, and integration.

## Translation

1. Build and validate the work graph with `multi-agent-work-coordinator`.
2. Select only `READY` nodes.
3. Pass each node's objective, resource scopes, evidence, invariants, and stop conditions into the reader or writer mission-card shape.
4. Let Mission Control choose the lightest capable installed role by task shape and consequence.
5. Return results to the coordinator for ownership audit, acceptance classification, dependency release, and integration.

## Coordinator-owned fields

- decomposition and node IDs;
- dependencies and waves;
- exclusive mutable-resource ownership;
- semantic overlap controls;
- integration order;
- acceptance and graph closure.

## Mission-Control-owned fields

- portable role selection;
- role-specific dispatch wording;
- per-agent execution inside the approved mission.

Model and reasoning selection are **runtime-owned**, not Mission-Control-owned. Shipped agent profiles intentionally inherit the active Codex configuration.

## Runtime fallback

If named custom roles are unavailable, keep the same mission card and ownership contract in the parent or an available generic subagent. Do not claim that a named role, sandbox, model, or reasoning profile was applied when the runtime did not expose it.

## Prohibitions

- Do not hard-code model names into portable Mission Control routing.
- Do not let a role expand its owned write scope.
- Do not create a second ledger with conflicting mission states.
- Do not treat agent self-reported success as coordinator acceptance.
