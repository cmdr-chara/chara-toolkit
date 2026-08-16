# Codex Toolkit workflow catalog

Use these as **conditional orchestration patterns**, not mandatory chains. A step runs only when its trigger is true, and the primary specialist retains authority over its own decision and stopping conditions.

## Routing principles

- Prefer the smallest workflow that covers the user's request.
- Keep one primary specialist at a time. Supporting skills provide evidence, completion discipline, orchestration, or final release judgment.
- Skip `repository-intelligence` when the relevant architecture and blast radius are already known.
- Do not use `unlazy` for trivial work. Use it when the accepted task is substantial enough that incomplete delivery is a realistic failure mode.
- Do not use `verification-and-release` unless there is an integrated candidate whose readiness actually needs judgment.
- A workflow never overrides a specialist's `AWAITING_APPROVAL`, safety restriction, migration boundary, or user constraint.
- When a handoff changes the task class, explicitly pass the evidence and scope that justified the transition.

## Bug hunt — unknown defects

Use when the user asks to find important bugs that are not already known.

```text
repository-intelligence? → bug-finder
                         → debugging-investigator? (per confirmed candidate needing causal proof)
                         → owning implementation specialist? (when a fix is authorized)
                         → unlazy? (substantial remediation)
                         → verification-and-release? (integrated release candidate)
```

Rules:

- `bug-finder` discovers and proves/retire candidates; it does not call suspicious code a bug without an observable contract violation.
- Hand a confirmed candidate to `debugging-investigator` when the causal chain or minimal explanatory fix remains uncertain.
- Multiple read-only hunt slices may run in parallel after ownership/scope is mapped. Multiple writers require `multi-agent-work-coordinator` and exclusive write scopes.
- A successful bug hunt may end with findings only; code edits are not required unless the user asked for remediation.

## Known bug — diagnose and fix

Use when the user already supplied a concrete wrong behavior but the cause is unknown.

```text
repository-intelligence? → debugging-investigator
                         → owning implementation specialist? (authorized fix)
                         → unlazy? (multi-surface remediation)
                         → verification-and-release?
```

Do not insert `bug-finder`: the symptom is already known.

## Build or change a feature

```text
repository-intelligence? → owning specialist
                         → multi-agent-work-coordinator? (safe parallel decomposition)
                         → unlazy? (substantial accepted scope)
                         → documentation-synchronizer? (public/config/ops behavior changed)
                         → verification-and-release?
```

Typical owning specialists include `production-web-builder`, `flutter-production-builder`, `expo-react-native-builder`, `codebase-evolution-controller`, or another domain workflow available in the environment.

## Improve an existing codebase

Use when the user has not preselected the improvement.

```text
repository-intelligence → codebase-improvement-planner
                        → selected specialist
                        → unlazy? (substantial approved execution)
                        → verification-and-release?
```

The planner chooses **what** improvement is worth doing; once chosen, the specialist owns **how** it is executed.

## Performance hunt

Use for a named slow path or measurable resource problem.

```text
repository-intelligence? → optimize-codebase-performance
                         → debugging-investigator? (unexpected correctness/lifecycle symptom)
                         → owning implementation specialist? (authorized change)
                         → unlazy?
                         → verification-and-release?
```

Do not optimize from intuition alone. Preserve comparable baseline/candidate evidence.

## Review and refactor

```text
repository-intelligence? → review-and-refactor-code
                         → unlazy? (approved multi-slice refactor)
                         → documentation-synchronizer? (contracts/docs changed)
                         → verification-and-release?
```

A defined PR/branch/diff should route here rather than to `bug-finder`.

## TypeScript quality hardening

```text
repository-intelligence? → typescript-quality-enforcer
                         → selected specialist? (architectural finding leaves lint scope)
                         → unlazy? (approved staged remediation)
                         → verification-and-release?
```

Do not disguise migrations, runtime bugs, or structural redesign as lint cleanup.

## Dependency / framework / schema evolution

```text
repository-intelligence? → codebase-evolution-controller
                         → debugging-investigator? (unknown migration failure)
                         → documentation-synchronizer
                         → unlazy? (large approved migration)
                         → verification-and-release
```

Compatibility, rollout, rollback, and removal criteria remain owned by the evolution specialist.

## Product/interface work

Direction first when product behavior/visual intent is unresolved:

```text
product-design-director → production-web-builder | flutter-production-builder | expo-react-native-builder
                       → unlazy?
                       → verification-and-release?
```

Reference reconstruction instead:

```text
screenshot-to-interface → relevant builder? (production integration)
                        → unlazy?
                        → verification-and-release?
```

## Multi-agent execution

`multi-agent-work-coordinator` is an orchestration helper, not a default prefix. Use it only after the work is understood well enough to define exclusive writes and integration order.

```text
mapped/approved work
        ↓
multi-agent-work-coordinator
        ├─ mission A (exclusive writes)
        ├─ mission B (exclusive writes)
        └─ mission C (read-only or exclusive writes)
        ↓
integration gates
        ↓
unlazy? → verification-and-release?
```

Mission Control may select reader/writer agents for approved missions. The parent task remains responsible for accepting handoffs and integrated verification.

## Completion and release

`unlazy` and `verification-and-release` are deliberately different:

```text
unlazy
= Did we actually finish the accepted task and prove every required deliverable?

verification-and-release
= Is the final integrated candidate safe and sufficiently evidenced to ship?
```

A task can be `COMPLETION: PASS` and still be blocked from release because release-specific evidence, rollout, rollback, platform coverage, or operational controls are missing.
