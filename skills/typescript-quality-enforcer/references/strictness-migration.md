# TypeScript strictness migration

Adapted concepts from SkillMedev/skills under MIT; see the repository `THIRD_PARTY_NOTICES.md`.

Use this reference when moving an existing TypeScript codebase toward stronger compiler guarantees.

## Principles

- Stop new debt before draining old debt.
- Measure error volume per flag or project slice before enabling a broad gate.
- Prefer narrowing and boundary validation over assertions.
- Treat `strict` as a baseline; stronger flags may be valuable when the repository can absorb them.
- Do not create a permanent allowlist of unexplained errors.

## Staged sequence

A common migration order is:
1. remove or prevent new implicit `any`;
2. establish null-safety and the rest of the strict family;
3. enable `strict` as the consolidated baseline;
4. evaluate `noUncheckedIndexedAccess`;
5. evaluate `exactOptionalPropertyTypes`;
6. add other evidence-backed flags such as override/return/fallthrough checks when they match repository policy.

If one step creates too much simultaneous churn, ratchet by package/directory/project-reference boundary instead of weakening the target globally.

## Escape hatches

- External data starts as `unknown` and is parsed/narrowed at the boundary.
- A necessary cast should be isolated where the type system loses evidence and justified locally.
- Prefer `@ts-expect-error` with a reason over `@ts-ignore`, and remove it when the underlying mismatch disappears.
- Double assertions should not become production architecture.

Verify each stage with the repository's typecheck plus targeted tests for affected runtime boundaries.
