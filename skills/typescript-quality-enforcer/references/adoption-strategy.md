# Staged TypeScript Quality Adoption

## Contents

- Principles
- Suggested stages
- Stage record
- Promotion criteria

Use this guide to turn a repository-wide quality concern into bounded enforcement stages. The rule order is a default heuristic, not a universal mandate.

## Principles

- Measure before enabling.
- Keep rule severity and remediation scope proportional to evidence.
- Separate mechanical corrections from architectural changes.
- Prefer a small stage that can become permanently green over a broad stage that creates hundreds of ignored findings.
- Do not treat `warning` as a migration strategy when CI does not enforce warnings; use a clearly time-bounded measurement phase instead.
- A rule is useful only if the team can state what invariant it protects and how legitimate exceptions are reviewed.

## Suggested stages

### Stage A — Assertion safety

Candidate rules:

- `chara-lint/no-double-assertion`
- `chara-lint/no-erase-then-assert`
- `chara-lint/require-assertion-justification`

Why first: these rules target places where TypeScript's evidence is explicitly discarded or recreated. Findings are usually local enough to inspect individually, while still surfacing real boundary problems.

Promote only when necessary assertions have a concrete checked invariant rather than a generic comment.

### Stage B — Contract precision

Candidate rules:

- `chara-lint/no-widening-known-values`
- `chara-lint/no-bare-object-params`
- `chara-lint/no-unknown-results`
- `chara-lint/no-unknown-aliases`
- `chara-lint/no-loose-dictionary-values`

These rules can expose public or cross-module contract debt. Before enabling, identify consumers and generated/public type surfaces. If a correction changes published API shape or serialization, route through controlled evolution.

### Stage C — Boundary discipline

Candidate rules:

- `chara-lint/no-unknown-inputs`
- `chara-lint/no-typeof-checks`

The desired end state is not “no unknown ever.” Untrusted input can begin unknown; the repository should parse or validate it at an explicit I/O boundary and pass a meaningful type inward.

For schema-free repositories, enable `allowTypeGuards` on `no-typeof-checks` so dedicated `value is T` / `asserts value is T` functions become the one place raw checks live, rather than inventing a suppression convention. Enable `allowEnvironmentChecks` when runtime feature detection (`typeof window === "undefined"`) is legitimate.

### Stage D — Dynamic access and low-signal patterns

Candidate rules:

- `chara-lint/no-reflective-get`
- `chara-lint/no-reflective-apply`
- `chara-lint/no-empty-object-fallback-spread`
- `chara-lint/no-banned-identifier-terms`

Treat this as repository-dependent. Reflection may represent a real framework boundary; naming rules may conflict with established domain language. Admit them only when the repository's own design goals support the invariant. `no-banned-identifier-terms` takes a `terms` list (default `["shape"]`) and `ignoreForeignMembers` for property reads on third-party objects such as schema libraries.

### Stage E — Test architecture

Candidate rule:

- `chara-lint/no-module-registry-mocks`

Do not treat this as a search-and-replace lint migration. A large count can be evidence that production code lacks explicit dependency seams. Characterize behavior and route structural work through `review-and-refactor-code` when necessary.

### Stage F — Compiler and base lint tightening

Examples include stricter TypeScript compiler options or additional built-in Oxlint rules. These are not part of chara-lint itself and can have a larger compatibility surface than individual plugin rules.

Estimate affected files first. A compiler-option change that touches broad public contracts, generated code, or many packages is a migration and should hand off to `codebase-evolution-controller`.

## Stage record

For each stage record:

```text
Stage:
Rules/settings:
Measured/estimated findings:
Dominant invariant:
Affected packages/components:
Mechanical findings:
Architectural findings:
Public/generated surfaces:
Effort:
Risk:
Reversibility:
Verification:
CI promotion criterion:
Specialist handoff:
```

## Promotion criteria

A stage is ready to become permanent when:

- findings are understood rather than merely suppressed;
- required contract/architecture changes are either completed or intentionally split into separate work;
- the selected rule configuration is explicit and reviewable;
- focused tests/typecheck pass;
- CI can enforce the rule without an unbounded allowlist;
- remaining exceptions have owners and concrete rationale.
