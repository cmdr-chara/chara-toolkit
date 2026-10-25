# Strictness migration

Turning on compiler strictness is a migration, not a config edit. Flip flags in stages, measure each one, and never let the error count grow back.

## Know the flags

Check the installed TypeScript version first (`npx tsc --version`). Recent major versions have changed defaults, so read the current `tsconfig` reference instead of assuming them.

| Flag | What it catches | Typical cost |
| --- | --- | --- |
| `strict` (family: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `useUnknownInCatchVariables`, `alwaysStrict`) | Implicit `any`, null/undefined misuse, unsound callbacks | `strictNullChecks` usually dominates |
| `noUncheckedIndexedAccess` | Array and record reads that might be `undefined` | High in data-heavy code; it finds real bugs |
| `exactOptionalPropertyTypes` | `undefined` assigned to optional properties | Medium; friction with libraries |
| `noImplicitOverride` | Accidental overrides | Low |
| `noPropertyAccessFromIndexSignature` | Dot access on index signatures | Low to medium |
| `noFallthroughCasesInSwitch`, `noImplicitReturns` | Control-flow slips | Low |

## Stage the rollout

1. **Baseline.** For each candidate flag, run `tsc --noEmit` with the flag enabled and record the error count by flag and by directory. Pick the order with the best ratio of bugs found to errors. Without evidence for another order, the default is: stop new implicit `any`, then `strictNullChecks` and the rest of the strict family, then `strict` as the consolidated baseline, then `noUncheckedIndexedAccess`, then `exactOptionalPropertyTypes`, then the low-cost flags.
2. **Choose a containment strategy:**
   - **Per directory:** a stricter `tsconfig` for migrated folders (project references, or `include` lists) that grows over time.
   - **Ratchet:** commit the current error count per flag. CI fails if it goes up, and the committed number may only go down.
   - **Whole-project switch:** only when the error count is small enough to fix in one reviewed change.
3. **Fix by root cause, not by line.** Repair the type at the boundary where bad data enters (parsing, API clients, untyped modules) before patching call sites.
4. **Lock it in.** Once a flag reaches zero errors, enable it in the main `tsconfig` and remove the ratchet entry.

## Debt rules

- Stop new debt before draining old debt: the ratchet or the stricter per-directory config lands first.
- External data starts as `unknown` and is parsed once at the boundary. It does not travel inward as `unknown`.
- Only use `@ts-expect-error`, never `@ts-ignore`, and always with a reason and a tracking reference. It fails once the error disappears, so the debt can't hide.
- A non-null assertion (`!`) or `as` cast is a claim. Each one needs evidence (a prior check, a documented invariant) or a runtime guard.
- Double assertions (`as unknown as T`) never become architecture. `chara-lint/no-double-assertion` and `require-assertion-justification` can enforce this.
- Don't widen types to `any` or `unknown` just to silence a newly strict flag. Count those as regressions in review.

## Evidence

Record the error counts per flag before and after, which strategy was used, the remaining tracked exceptions, and the CI command that enforces the ratchet.
