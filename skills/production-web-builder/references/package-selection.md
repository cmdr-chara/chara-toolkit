# Conditional Package Selection

A dependency is a design decision with ongoing update, security, bundle/runtime, and migration cost.

## Decision record

```markdown
Package/capability:
Problem owned:
Existing/native/framework alternative:
Repository compatibility and peer constraints:
Maintenance/release evidence:
License:
Security/deprecation evidence:
Runtime/build/bundle effect:
Choose when:
Avoid when:
Removal/migration cost:
Sources and information checked date:
```

## Common decisions

| Concern | Prefer built-in/existing when | Consider a package when | Avoid package when |
| --- | --- | --- | --- |
| Server data | framework server fetch/cache/mutations cover ownership and rendering | rich client cache, background refresh, optimistic mutations, offline/retry coordination are required | duplicating server cache or a handful of static requests |
| Client state | local state, URL, form, or server cache owns it | independent cross-tree client state with real lifecycle/persistence exists | storing server data or every component value globally |
| Forms | native form/action and simple controlled/uncontrolled fields are sufficient | dynamic arrays, complex validation/state, large forms, performance/ergonomics justify it | simple contact/search/login form with no complexity |
| Validation | narrow handwritten boundary checks or generated schema suffice | shared runtime schema parsing and typed inference reduce contract drift | validating trusted internal objects repeatedly on hot paths |
| Accessible primitives | native element or existing system implements the pattern | complex dialog/menu/combobox/popover behavior needs maintained primitives | wrapping native buttons/inputs in a second incompatible system |
| Motion | CSS/Web Animations handle state transition | coordinated layout/gesture/scroll/spring orchestration is central | decorative reveal-only animation or tight performance budget |
| Testing | framework runner and current harness suffice | missing browser, unit, component, or network boundary requires a focused tool | adding two overlapping runners or testing internals |
| Observability | deployment platform provides adequate traces/logs/errors | vendor-neutral context propagation or custom instrumentation is required | blanket browser auto-instrumentation without privacy/performance review |

Do not choose two packages for the same state, form, component, or animation layer without a written migration boundary.

## Common options

When a package is justified, these are the usual candidates. Names are stable; versions, peer ranges, and support status are not, so verify them as described below.

| Concern | Common options |
| --- | --- |
| Server data | TanStack Query, RTK Query, or the framework's own data layer |
| Client state | Zustand, Redux Toolkit, Jotai |
| Forms and validation | React Hook Form; Zod or another schema library at untrusted boundaries |
| Accessible primitives | Radix Primitives, Base UI, or the design system already in use |
| Motion | CSS and the Web Animations API first; Motion for coordinated layout and gesture work |
| Testing | Vitest or the framework's runner, Testing Library, Playwright for browsers, Mock Service Worker at the network boundary |
| Observability | the platform's own tooling first; OpenTelemetry for vendor-neutral tracing (server support is more mature than browser) |

## Verify current state before deciding

1. In the target repository, read the resolved versions and peer constraints (`npm ls <package>`, the lockfile) and the framework's own support policy for its current major versions.
2. `npm view <package> version peerDependencies deprecated` for every candidate.
3. Read the official release, migration, and security notes for the framework and candidates, and check open advisories (`npm audit`, GitHub Security Advisories).
4. Confirm the license in the registry and the repository.
5. Measure or estimate the client, server, and build cost in this architecture, and re-check built-in and already-installed alternatives.
6. Record the result, with the date you checked, in the decision record above.
