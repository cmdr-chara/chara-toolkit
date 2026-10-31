# Python environment and artifact evidence

Read when selecting commands, changing imports/dependencies, or delivering a CLI/package/service.

## Establish the executable environment

Inspect project metadata, requirements and lock files, environment managers, task definitions, and CI. Confirm the interpreter, implementation/build, import roots, extras, and platform selected by the intended task. Use repository commands; do not replace its environment manager or dependency constraints to get a convenient local pass.

A virtual environment separates package installation from the host environment but does not isolate file, network, or process access. Builds, imports, test collection, plugins, and dependency hooks can execute arbitrary project/dependency code. Inspect unfamiliar hooks and use controlled fixture accounts, paths, and services. Respect existing host and network permissions.

Check `requires-python` and classifiers against actual CI/consumer support. New syntax, standard-library APIs, extension wheels, or dependency requirements can exclude older interpreters even if the newest host succeeds. Keep unsupported/unexecuted configurations visible rather than updating the support claim as part of an unrelated feature.

## Choose evidence for the boundary

| Boundary | Useful check |
| --- | --- |
| Pure behavior | Focused unit/property tests covering deciding inputs and errors |
| Async/resource behavior | Controlled interruption/failure with observed cleanup and task outcomes |
| Import or optional dependency | Import the intended entry point under the corresponding supported environment/extras |
| CLI | Run it as users invoke it; verify stdin/stdout/stderr, exit status, encoding and paths |
| Distributed package | Build/install with the repository's existing tooling in an isolated location, then test the installed artifact away from the source tree |
| Native extension/platform | Execute on the supported interpreter/platform with the actual extension; mocked imports prove less |

Source-directory tests can accidentally import local files that were omitted from the distribution. An installed-artifact check can expose missing package data, import roots, namespace handling, and entry points. Use the build backend and policy already present; do not publish or add a packaging tool merely to perform a small source fix.

Static analysis and the configured type checker provide additional evidence, not runtime schema validation. Use existing lint/format tasks in check mode where available. Scope corrections to the affected change and do not replace meaningful assertions with weaker checks or broad suppressions.

## Report what ran

Record interpreter and environment identity, exact scoped commands, collected tests, results, and material differences from CI/production. Keep syntax/typing, test behavior, package installation, external integration, and deployment claims separate. Missing service access, platform hardware, native wheels, or supported interpreter coverage remains a named limitation.

## Sources and refresh boundary

- [Project metadata specification](https://packaging.python.org/en/latest/specifications/pyproject-toml/): build-system and interpreter metadata.
- [Python imports](https://docs.python.org/3/library/importlib.html): module discovery and execution boundaries.
- [Python virtual environments](https://docs.python.org/3/library/venv.html): environment behavior and limitations.

Before selecting a new flag, dependency, extension wheel, or syntax feature, check the declared interpreter/build/backend documentation and the repository's current support matrix. Do not infer minimum-version support from the current documentation's default version.
