# Core Web Vitals workflow

Adapted concepts from SkillMedev/skills under MIT; see `THIRD_PARTY_NOTICES.md`.

Use this reference when user-visible web performance is the primary problem.

## Field-first method

1. Prefer field/RUM or CrUX data for the affected page/template and audience. Lab data is diagnostic, not proof of real-user success.
2. Identify which current Core Web Vital is failing for the target population and record the percentile/window.
3. Reproduce under representative device/network constraints.
4. Identify the concrete cause before editing: LCP element/resource discovery, long interaction tasks, layout-shift source, server TTFB, or third-party cost.
5. Change one causally related factor at a time when attribution matters.
6. Re-measure under comparable lab conditions, then confirm the field metric over its appropriate collection window before claiming a durable user-facing win.

Typical levers include resource priority/size, image dimensions, font loading, client JavaScript, long tasks, third-party scripts, rendering/caching, and layout reservation. Do not lazy-load the actual LCP resource or optimize a passing metric while a more material metric fails.

Thresholds and browser definitions can change; verify current Web Vitals guidance before using numeric budgets in a release decision.
