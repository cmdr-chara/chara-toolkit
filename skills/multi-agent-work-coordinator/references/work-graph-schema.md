# Work Graph Schema

The ownership checker accepts workspace-relative file/glob scopes and path-like logical resource IDs. This lets the same graph coordinate code, documents, research artifacts, datasets, configuration, and other bounded work.

```json
{
  "version": 1,
  "objective": "Prepare a launch brief from independent research streams",
  "workspace_state": "optional branch, workspace, document-set, or dataset snapshot",
  "single_owner_resources": [
    "brief/final",
    "sources/normalized",
    "data/merged.csv"
  ],
  "missions": [
    {
      "id": "M1",
      "objective": "Compare vendor A evidence against the decision criteria",
      "kind": "writer",
      "dependencies": [],
      "read_scope": ["sources/vendor-a/**", "criteria/**"],
      "write_scope": ["analysis/vendor-a.md"],
      "produces": ["evidence-backed vendor A analysis"],
      "invariants": ["every conclusion cites supplied evidence"],
      "forbidden": ["brief/final", "analysis/vendor-b.md"],
      "acceptance_evidence": ["all criteria answered or explicitly unknown"],
      "integration_checks": ["parent comparison uses the same criteria"],
      "stop_when": ["required source material is missing"]
    }
  ],
  "integration_order": ["M1", "M2", "M3"],
  "final_checks": ["cross-mission consistency review", "ownership audit"]
}
```

## Scope rules

- Mission IDs are unique and dependencies reference existing IDs.
- The dependency graph is acyclic unless a documented manual loop is intentionally serialized outside concurrent execution.
- `read_scope` and `write_scope` entries are workspace-relative paths/globs or path-like logical resource IDs such as `research/vendor-a`.
- Absolute paths, parent traversal, and empty scopes are invalid.
- Two writers may not have overlapping write scopes.
- Prefer `single_owner_resources` for resources that must have one writer. The checker still accepts legacy `single_owner_surfaces` plans.
- Read overlap is allowed. Write/read overlap is expected only when dependency order makes the producer/consumer relationship explicit.
- Generated inputs and outputs stay with one owner unless their generation contract makes separation safe.
- Integration order includes every writer or explains why a node has no integration artifact.
- For repository work, file scopes remain repository-relative and protected working-tree state remains part of the mission contract.

## Status ledger

```text
ID | state | owner | dependencies | owned writes | evidence | integration result
```

Allowed states: `PLANNED`, `READY`, `RUNNING`, `PASS`, `PARTIAL`, `BLOCKED`, `ACCEPTED`, `REWORK`, `REJECTED`, `CANCELLED`.
