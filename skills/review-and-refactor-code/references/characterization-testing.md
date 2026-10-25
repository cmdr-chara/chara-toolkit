# Characterization testing

Load this when a refactor touches behavior that existing tests don't pin down. A characterization test records what the code does today, not what it should do, so the refactor can prove nothing changed.

## When it is worth it

- The behavior matters to callers, and current tests would not notice it changing.
- The code is hard to reason about: deep branching, implicit state, or legacy formatting rules.
- Skip it when the area is already well covered, or the change is explicitly meant to alter the behavior. In that case write tests for the new specification instead.

## Finding the seam

Pin behavior at the narrowest boundary that the refactor will not move:

1. a pure function's inputs and outputs;
2. a public method of a class or module;
3. an HTTP, CLI, or file-format boundary, when internals are too tangled to call directly.

If no seam exists without changing code, make the smallest mechanical change that creates one, such as extracting a function or injecting a dependency. Do it as a separate commit, verified by the existing tests.

## Choosing inputs

Scope the net to the refactor's blast radius: the branches the change will touch, not the whole repository.

- Cover every branch you can find: use coverage reports to discover branches the inputs never reach.
- Include boundary values, empty inputs, nulls, unusual encodings, large inputs, and the error paths.
- Control nondeterminism (time, randomness, network, filesystem, shared database state) so that a diff always means behavior changed.
- Use real anonymized production samples when available. They reveal behavior that nobody remembers writing.

## Recording outputs

- Assert on the complete observable result: return value, side effects, emitted events, persisted state, and error type and message.
- Golden files and snapshots work well for large outputs. Keep them reviewable: stable ordering, normalized timestamps and IDs, one file per scenario.
- Record bugs as they behave today and label them, for example `// characterizes current behavior: rounds half down (issue #123)`. Fixing a bug is a separate, deliberate change.

## Using them during the refactor

- Run the characterization suite before you start. It must pass on untouched code, and must fail when you deliberately break the behavior it covers; otherwise it isn't checking anything.
- Re-run it after each refactor step. Any diff is either a regression or a documented, intentional change.
- Afterward, keep tests that describe intended behavior, rename them as specifications, and delete the ones that only pinned incidental details.
