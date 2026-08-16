# Violation Remediation Guide

The central rule is: **repair the violated invariant, not the diagnostic text.**

## Anti-laundering rules

Never resolve a quality finding by:

- replacing `unknown` with `any`;
- replacing one assertion with a different assertion that carries no stronger evidence;
- adding `@ts-ignore`, `eslint-disable`, blanket Oxlint disables, or broad ignore patterns merely to reduce counts;
- weakening a public contract to `object`, `{}`, `Record<string, unknown>`, or another escape hatch;
- adding a `SAFETY:` comment that does not name a checked invariant;
- moving problematic code into an ignored/generated-looking path;
- mocking a lower-level module through a different framework API when the invariant is an explicit dependency seam.

## Assertion findings

Ask where the asserted type evidence comes from.

Preferred outcomes include:

- preserve inference from a precise value;
- use `satisfies` when the goal is compatibility checking without widening;
- parse or validate untrusted data once at its I/O boundary;
- use a named constructor/factory that checks the invariant before branding;
- keep a necessary assertion only when the repository can state the invariant TypeScript cannot express.

A `SAFETY:` comment must identify that invariant, for example that a parser, range check, protocol decoder, or framework guarantee has already been executed.

## `unknown` findings

`unknown` is appropriate at an untrusted boundary. The smell is allowing it to travel through ordinary application contracts.

Trace the value to its ingress:

1. identify the external source;
2. parse/decode/validate at that boundary;
3. convert failures into the repository's normal error model;
4. pass a meaningful domain type inward;
5. test malformed and boundary inputs.

Do not add a schema dependency automatically; use the repository's established parser/schema approach when sufficient.

## Unsafe dictionary findings

Determine whether the structure is:

- truly heterogeneous external data;
- an internal registry with a finite/known value contract;
- a generic accumulator;
- serialized metadata with a schema;
- generated/framework-owned data.

Prefer the owner/schema-derived value type. If data is externally heterogeneous, parse it into a domain representation rather than pretending the dictionary itself is safe.

## Known-value widening

When a concrete literal/object/function is widened into a broad target, ask whether the broad type exists for a real abstraction boundary or convenience.

Prefer precise inference or `satisfies` when callers benefit from retained keys/value types. Keep a broad contract only when it is the intentional owner interface.

## Runtime `typeof`

Do not replace `typeof` with a cast. Identify whether the check is:

- an I/O parser/type guard;
- ordinary application branching on unparsed external representation;
- framework compatibility code;
- performance-sensitive primitive dispatch.

Boundary/type-guard use may be legitimate depending on configuration. Application code should usually branch on parsed domain values.

## Reflection

For `Reflect.get`/`Reflect.apply`, determine why static access/calls are unavailable. Preferred outcomes are typed property access, a named dispatch table, or an explicit plugin/interface boundary. Framework internals may justify an exception when dynamic access is intrinsic and tested.

## Module mocking

A module-mocking finding can be architectural. Determine whether the test needs:

- an explicit interface and dependency injection;
- a service/factory parameter;
- a faithful in-memory implementation;
- process/network/filesystem isolation at a higher integration boundary.

Do not refactor production architecture solely to satisfy a rule without behavior characterization and an approved structural proposal.

## Verification

For every remediation capture:

```text
Finding:
Invariant:
Evidence source:
Remediation:
Why evidence is stronger now:
Focused test:
Typecheck/lint result:
Compatibility impact:
Residual exception:
```
