# Staged TypeScript Quality Adoption

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

- `anti-slop/no-chained-type-assertions`
- `anti-slop/no-widen-then-assert`
- `anti-slop/require-safety-comment-for-type-assertion`

Why first: these rules target places where TypeScript's evidence is explicitly discarded or recreated. Findings are usually local enough to inspect individually, while still surfacing real boundary problems.

Promote only when necessary assertions have a concrete checked invariant rather than a generic comment.

### Stage B — Contract precision

Candidate rules:

- `anti-slop/no-known-value-widening`
- `anti-slop/no-object-parameters`
- `anti-slop/no-unknown-returns`
- `anti-slop/no-unknown-type-aliases`
- `anti-slop/no-unsafe-dictionary-type`

These rules can expose public or cross-module contract debt. Before enabling, identify consumers and generated/public type surfaces. If a correction changes published API shape or serialization, route through controlled evolution.

### Stage C — Boundary discipline

Candidate rules:

- `anti-slop/no-unknown-parameters`
- `anti-slop/no-runtime-typeof`

The desired end state is not “no unknown ever.” Untrusted input can begin unknown; the repository should parse or validate it at an explicit I/O boundary and pass a meaningful type inward.

For schema-free repositories, evaluate the upstream-supported type-guard option for `no-runtime-typeof` rather than inventing a suppression convention.

### Stage D — Dynamic access and low-signal patterns

Candidate rules:

- `anti-slop/no-reflect-get`
- `anti-slop/no-reflect-apply`
- `anti-slop/no-conditional-empty-object-spread`
- `anti-slop/no-shape-in-symbol-names`

Treat this as repository-dependent. Reflection may represent a real framework boundary; naming rules may conflict with established domain language. Admit them only when the repository's own design goals support the invariant.

### Stage E — Test architecture

Candidate rule:

- `anti-slop/no-module-mocking`

Do not treat this as a search-and-replace lint migration. A large count can be evidence that production code lacks explicit dependency seams. Characterize behavior and route structural work through `review-and-refactor-code` when necessary.

### Stage F — Compiler and base lint tightening

Examples include stricter TypeScript compiler options or additional built-in Oxlint rules. These are not part of anti-slop itself and can have a larger compatibility surface than individual plugin rules.

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
