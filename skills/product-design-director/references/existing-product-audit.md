# Existing Product Audit

Load for any redesign, refresh, or critique of a shipped product. The audit's first job is to find what must survive.

## Capture the current state

- Screens and flows for every primary job, at the breakpoints and themes actually shipped, including empty, error, and permission states (seed or mock data if needed; never alter production data to provoke states).
- Current tokens, components, and where the implementation deviates from them.
- Quantitative signals where available: task completion, time on task, drop-off steps, error and retry rates, support ticket themes, accessibility issue backlog.
- Who depends on current behavior: power users, integrations, documentation, training material, screenshots in help centers.

## Validated behavior register

List behaviors that evidence shows users rely on. Anything here is preserved by default; changing it requires a decision record and explicit approval.

| ID | Behavior | Evidence | Users affected | Preserve as | Risk if changed |
| --- | --- | --- | --- | --- | --- |
| V1 | `J`/`K` row navigation + `E` to edit | 38% of edits via keyboard (analytics) | Expert operators | Same keys, same scope | High: muscle memory, throughput |
| V2 | Filters persist across sessions | Repeated support complaints when it broke in v4 | All | Behavior, not visual form | Medium |

Typical candidates: keyboard shortcuts, saved views and filters, URL structures and deep links, bulk actions, column order customization, print/export layouts, terminology users have learned, positions of high-frequency controls.

## Heuristic pass

Review each primary flow against these lenses and log findings with evidence, not taste:

- **Clarity:** Is the decision hierarchy visible? Does the first thing noticed match the job?
- **Efficiency:** Steps, pointer travel, and mode switches for frequent tasks; are defaults right for the majority?
- **Error prevention and recovery:** Constraints before submission, undo, input preserved on failure, clear recovery paths.
- **Consistency:** Same thing, same name, same look, same place; deviations from the existing system catalogued.
- **State coverage:** Gaps in the matrix from `experience-model.md`.
- **Content:** Vocabulary mismatches, vague errors, generic button labels.
- **Accessibility:** Run the checks in `accessibility-and-responsive-review.md`; automated scans find only part of the issues, so include keyboard and screen-reader passes on primary flows.
- **Responsive behavior:** Intermediate widths, zoom, landscape, long content.
- **Visual system:** Hierarchy noise, ad-hoc values, contrast failures, inconsistent spacing or radius.

## Findings format

| ID | Finding | Evidence | Severity | Affected jobs | Change class | Recommendation | Preserves | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

Change class is one of: **preserve** (works, keep it), **clarify** (same structure, better labels, hierarchy, or feedback), **consolidate** (fold one-off variants into the system), **redesign** (the interaction model itself changes), **remove** (no evidenced job depends on it), or **prototype first** (evidence is too thin to decide without a test).

Severity: **Critical** blocks a primary job, loses data, or fails a hard accessibility/legal gate; **Major** causes frequent errors or significant slowdown; **Minor** causes friction with a workaround; **Polish** is cosmetic. Severity is about user consequence, never about how outdated something looks.

## Sequencing the redesign

- Fix Critical findings independently of the redesign when possible; do not hold them hostage to a large visual change.
- Prefer incremental slices that ship behind the existing system (token refresh, then component updates, then layout changes per flow) over a single big-bang reskin, unless evidence shows the incremental path is worse for users.
- For each slice, name the validated behaviors it touches, the metric that would show regression, and the rollback expectation for the builder.
- Communicate learned-behavior changes (moved controls, renamed terms) in release notes or in-product hints; that content is part of the design deliverable.
