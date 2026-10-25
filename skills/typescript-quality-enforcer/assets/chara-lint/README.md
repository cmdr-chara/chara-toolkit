# chara-lint

Oxlint rules for JavaScript and TypeScript that keep type evidence intact: untrusted data is parsed once at a boundary, and the precise type then flows inward without being erased to `unknown`/`object`/open dictionaries or forged back with assertions.

- Plain ES modules (`.mjs`) with no runtime dependencies and no build step. It loads whether or not the consuming package sets `"type": "module"`.
- Purely syntactic and per-file: no type checker, no network, no filesystem access.
- Tested against `oxlint` 1.89.0 with the toolkit's fixture suite (`scripts/test_chara_lint.mjs`).

## Enable

```json
{
  "jsPlugins": ["./tools/oxlint/chara-lint/index.mjs"],
  "rules": {
    "chara-lint/no-double-assertion": "error",
    "chara-lint/require-assertion-justification": "error"
  }
}
```

Every rule is independent. Enable them in stages (see the skill's `references/adoption-strategy.md`).

## Rules

| Rule | Reports | Options |
| --- | --- | --- |
| `no-double-assertion` | `x as unknown as T` and any directly stacked assertions (a `!` between links does not break the chain); all-`as const` chains are allowed | — |
| `no-erase-then-assert` | A known value stored in an `unknown`/`object`/loose-record const and later asserted back in the same function | — |
| `require-assertion-justification` | Assertions without a preceding `// SAFETY: <invariant>` comment on the assertion or its enclosing statement. The search never crosses a function boundary | — |
| `no-widening-known-values` | Literals, lambdas, `new` expressions, and other syntax-known values stored into `unknown`, `object`, anonymous object types, or open dictionaries (`{}` accumulators are allowed) | — |
| `no-bare-object-params` | Parameters typed `object`, directly, in a union, or through local aliases | — |
| `no-unknown-inputs` | Parameters typed `unknown`, including unions where `unknown` absorbs the other members. A parameter named `cause` is exempt | — |
| `no-unknown-results` | Declared return types that are `unknown`, `Promise<unknown>`/`PromiseLike<unknown>`, or local aliases of them | — |
| `no-unknown-aliases` | Type aliases that resolve to `unknown` in any lexical scope | — |
| `no-loose-dictionary-values` | Open dictionaries (`Record<string, V>`, index signatures, broad-key mapped types) whose values are `unknown`, `any`, `object`, `{}`, or an empty interface | — |
| `no-typeof-checks` | Runtime `typeof` | `allowTypeGuards` (inside `value is T` / `asserts` functions), `allowEnvironmentChecks` (`typeof globalName === "undefined"`) |
| `no-reflective-apply` | Calls of the global `Reflect.apply` (also through `globalThis`) | — |
| `no-reflective-get` | Calls of the global `Reflect.get` (also through `globalThis`) | — |
| `no-empty-object-fallback-spread` | `...(cond ? { key } : {})` in object literals, including an asserted `{}` branch | — |
| `no-module-registry-mocks` | `vi.mock`, `vi.doMock`, `jest.mock`, `jest.doMock`, `jest.unstable_mockModule` on the global or imported test framework | — |
| `no-banned-identifier-terms` | Identifiers containing a banned term (default `shape`) | `terms` (string list), `ignoreForeignMembers` (skip property reads such as `schema.shape`) |

## Design notes

- "Resolves to" only ever follows type aliases declared in the same file, with type-parameter shadowing respected. Imported types are never guessed.
- Open dictionaries are restricted to open key domains (`string`, `number`, `symbol`, `PropertyKey`). `Record<"a" | "b", unknown>` and homomorphic mapped types describe fixed shapes and are not reported.
- A plain use of a non-generic alias whose declaration is already reported is not reported again. A generic alias used without arguments is resolved with its defaults.
