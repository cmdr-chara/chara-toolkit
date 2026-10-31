---
name: python-engineering
description: Implement bounded Python modules, services, scripts, or ports under their interpreter, API, packaging, and runtime contracts. Use for Python implementation after the language is chosen. Not for general review, unexplained failures, interpreter migrations, or release decisions.
---

# Python Engineering

Implement the requested Python behavior while retaining the call, data, and execution contracts on which its users depend. Select idioms and checks from the actual application and supported interpreter.

## Trigger boundary

Use this skill for Python feature work, an already-explained correction, a CLI/module implementation, or a local port into an already-selected Python package. Libraries, services, bots, and automation are valid contexts; a framework is not required.

Do not trigger for a findings-only review, an unknown causal failure, a Python-version or framework transition, language selection, or final release approval. Those decisions retain their existing specialist owners. A Python helper inside another stack does not automatically make that entire task Python implementation.

## Required inputs

Resolve the requested behavior and execution entry point, repository state and protected edits, callers, source-domain constraints for a port, supported interpreters/platforms, dependencies, and documented test commands. Inspect applicable `pyproject.toml`, requirements/lock files, build configuration, task runners and CI. Establish the intended environment and import path; an available `python` executable need not be the project's interpreter.

Identify public call signatures, keyword arguments, exception behavior, synchronous/asynchronous boundaries, iterator behavior, and import-time effects relevant to the change. Framework/application hooks, file formats, CLI streams and exit codes can be public interfaces too.

## Safety baseline

- Preserve current user work, dependency policy, interpreter support, and externally observed behavior except for the requested change.
- Importing modules, collecting tests, loading plugins, and running package build hooks can execute code. Review the affected entry points and isolate real services and user data; a virtual environment controls dependencies, not execution authority.
- Avoid global installs, new frameworks, unrequested lockfile updates, and whole-project lint or annotation campaigns. Use the established environment without silently upgrading it.
- Type annotations describe contracts to tools; they do not validate untrusted runtime values. Successful imports or static checks are also not proof of correct state transitions.

## Workflow

1. **Fix the boundary to implement.** Establish expected inputs, outputs, mutation, errors, and effects. Read [data-and-api.md](references/data-and-api.md) for callable, data-model, compatibility, or source-language-port changes. Characterize material existing behavior before replacing it.
2. **Select the actual interpreter and checks.** Read [environment-and-verification.md](references/environment-and-verification.md) for environment, packaging, imports, and supported-version evidence. Use repository tasks and distinguish pre-existing failures from the candidate's effects.
3. **Implement the smallest useful change.** Reuse the project's types, libraries, and error model. Add explicit validation at real input boundaries when required; preserve accepted values, exception categories, laziness, and object identity where callers rely on them.
4. **Close resource and task lifetimes.** For asynchronous work, bots, workers, blocking integrations, or acquired resources, read [async-and-resources.md](references/async-and-resources.md). Connect cancellation, failure, retries, and shutdown to the state they must leave behind.
5. **Challenge observable behavior.** Test deciding inputs and failure paths using controlled dependencies, temporary data, and deterministic synchronization. For ports, compare both implementations on the accepted domain and keep unsupported or unobserved cases explicit.
6. **Check the final artifact and report.** Run the scoped available tests and existing lint/type tasks, inspect changed packaging/import behavior and the final diff, and distinguish source-tree success from installed-artifact or service execution. State missing interpreter/platform/service evidence plainly.

## Handoffs and interaction boundaries

`review-and-refactor-code` owns review findings and behavior-preserving structural refactors. `debugging-investigator` establishes unexplained causes; `codebase-evolution-controller` owns interpreter/framework upgrades and staged service replacement; `security-review` owns security-first trust-boundary assessment; `optimize-codebase-performance` owns measured bottlenecks. A broader product builder may hand over a bounded Python backend/helper stage. `verification-and-release` retains the integrated release decision. These are handoffs when needed, not a required chain for a small module change.

## Failure handling

If the intended interpreter or dependencies are unavailable, separate static inspection and executable evidence; do not alter project requirements to fit the host. If callers disagree about an exception, input domain, or async boundary, resolve the contract before dependent changes. Keep raw evidence of failed imports or tests and change the hypothesis before retrying an identical failure.

## Stop conditions

Finish when the scoped Python behavior is present, affected consumer contracts are preserved or deliberately changed within scope, and the final checks have observed outcomes and named gaps. Stop before unsupported environment mutation, an unapproved public behavior change, external side effects, or service rollout. A local pass does not establish every supported interpreter or deployed environment.
