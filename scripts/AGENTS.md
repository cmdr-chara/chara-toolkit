# Validator and helper contracts

- Validators must detect broken contracts, not rewrite evidence or silently repair the inspected input.
- Preserve read-only helper defaults. Any intentional writer needs an explicit output scope, input-preservation checks, and deterministic temporary fixtures.
- Keep the supported script entry points and direct-execution/import behavior intact when changing shared implementations.
- Do not skip failing cases, loosen assertions, suppress warnings, or backdate `--as-of` to make a result green. Report unavailable prerequisites distinctly from a passing check.
- Avoid coupling fixture expectations to incidental formatting when the contract is semantic; include rejection cases for unsafe or malformed inputs.

The canonical commands are `python scripts/validate_skill_pack.py . --as-of YYYY-MM-DD` and `python scripts/run_smoke_tests.py . --as-of YYYY-MM-DD`, run from the repository root with the actual review date. See [CONTRIBUTING.md](../CONTRIBUTING.md); a static pass does not establish live Codex behavior.
