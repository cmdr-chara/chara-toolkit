# Orchestration instructions

Applies to `orchestration/`.

- Treat workflow diagrams as conditional routing patterns, not mandatory pipelines.
- Keep one primary specialist responsible for the current decision; supporting skills may add evidence, coordination, completion discipline, or release judgment without stealing ownership.
- Do not insert repository mapping, preflight, multi-agent coordination, `unlazy`, or release verification unless its trigger is actually present.
- Handoffs must preserve the scope, evidence, constraints, approvals, and unresolved risks that justified the transition.
- Orchestration must never override specialist safety/approval/stop conditions or repository-local instructions.
- Keep the managed global routing block compact. Detailed workflow explanations belong in the workflow catalog, not the global `AGENTS.md` block.
