---
name: production-web-builder
description: Build or audit production web interfaces across architecture, data, interaction, accessibility, performance, security, and browser behavior. Use when web implementation quality is the main decision.
---

# Production Web Builder

Build web behavior around repository constraints, trust boundaries, and user journeys rather than a default dependency stack.

## Trigger boundary

Use this skill for production web implementation or audits covering rendering, components, data, forms, auth boundaries, responsive behavior, accessibility, performance, SEO, observability, or browser integration.

Do not trigger for visual direction alone, literal screenshot reconstruction alone, mobile-platform selection, or a version migration whose central decision is compatibility.

## Required inputs

Resolve repository/working-tree state, framework/runtime, routes and rendering model, product flows/states, data/auth contracts, supported browsers/devices, deployment adapter, existing tests, and protected user work.

When useful, run the read-only inventory:

```sh
python skills/production-web-builder/scripts/web_project_inventory.py . --format markdown
```

Verify its signals manually.

## Safety baseline

- Preserve uncommitted work and existing repository conventions.
- Do not start with a package list.
- Prefer built-in platform/framework capabilities or existing repository packages when sufficient.
- For new dependencies, verify compatibility, maintenance, license, security/deprecation, runtime/bundle cost, and removal path.
- Client validation is not authorization; keep secrets and privileged enforcement server-side.

## Workflow

1. **Map execution and trust.** Identify server/edge/client/build-time ownership, caching, authentication/authorization, assets, CSP/security headers, and deployment limits.
2. **Model behavior first.** Define initial/loading/empty/error/retry/offline/stale/unauthorized states, mutation semantics, navigation, focus, and recovery.
3. **Choose architecture conditionally.** Read `references/package-selection.md` and the dated ecosystem reference only when a dependency/framework decision is material.
4. **Implement semantic boundaries.** Prefer native semantics and explicit component/data ownership. Keep invalid state combinations unrepresentable where practical.
5. **Implement data/forms safely.** Validate untrusted input at the server boundary, authorize protected operations, define cache/invalidation ownership, preserve recoverable form input, and control duplicate effects.
6. **Apply responsive/a11y behavior.** Test intermediate widths, zoom, long/localized content, input modes, reduced motion, focus, and semantic interaction.
7. **Measure web performance when material.** Read `references/core-web-vitals.md` for field-first LCP/INP/CLS work; use measured evidence rather than Lighthouse-score chasing.
8. **Verify production behavior.** Use `references/production-readiness.md` for browser journeys, failure paths, observability, build/preview behavior, SEO where relevant, and rollback/flag controls.

## Handoffs and interaction boundaries

Product design owns unresolved visual direction; screenshot reconstruction owns fidelity-first work; `security-review` owns security-focused review; evolution owns framework/version transitions; debugging owns concrete unexplained failures; `verification-and-release` owns final ship judgment.

## Failure handling

If runtime/package facts are volatile, refresh them from current primary sources. If browser/device evidence is unavailable, state the exact gap rather than treating unit tests as equivalent. Keep performance claims tied to comparable measurements.

## Stop conditions

Stop when requested web behavior is integrated, focused browser/accessibility/performance checks appropriate to risk are recorded, and remaining deployment/release gaps have an explicit owner.
