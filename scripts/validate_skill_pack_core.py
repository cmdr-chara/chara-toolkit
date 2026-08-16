#!/usr/bin/env python3
"""Configured validator core for Codex Toolkit.

The large stable implementation lives in the private sibling module. This module
applies the current route/provenance/schema extensions and is a supported
entrypoint both as `python scripts/validate_skill_pack_core.py` and as a package
import.
"""
from __future__ import annotations

try:
    from . import _validate_skill_pack_impl as impl
except ImportError:  # Direct script execution puts scripts/ on sys.path.
    import _validate_skill_pack_impl as impl

for _skill in ("unlazy", "bug-finder"):
    if _skill not in impl.EXPECTED_SKILLS:
        impl.EXPECTED_SKILLS = [*impl.EXPECTED_SKILLS, _skill]
impl.TOOLKIT_SKILLS = ["delegate-with-mission-cards", *impl.EXPECTED_SKILLS]


def _load_json_objects(paths, key, result):
    """Load JSON object lists without silently discarding malformed entries."""
    collected = []
    for path in paths:
        if not path.is_file():
            continue
        try:
            data = impl.json.loads(impl.read_text(path, result))
        except impl.json.JSONDecodeError as exc:
            result.error(f"{impl.rel(path, result.root)}: invalid JSON: {exc}")
            continue
        if not isinstance(data, dict):
            result.error(f"{impl.rel(path, result.root)}: JSON root must be an object")
            continue
        values = data.get(key, [])
        if not isinstance(values, list):
            result.error(f"{impl.rel(path, result.root)}: {key} must be a list")
            continue
        for index, value in enumerate(values):
            if not isinstance(value, dict):
                result.error(
                    f"{impl.rel(path, result.root)}: {key}[{index}] must be an object"
                )
                continue
            collected.append(value)
    return collected


impl._load_json_objects = _load_json_objects
_original_evaluation_validation = impl.validate_evaluations


def validate_evaluations(result):
    """Run canonical evaluations plus required overlap coverage for newer routes."""
    _original_evaluation_validation(result)
    supplemental_path = (
        result.root / "evaluations/overlap-cases-content-provenance.json"
    )
    supplemental = _load_json_objects([supplemental_path], "cases", result)
    for case in supplemental:
        sequence = case.get("expected_sequence")
        if not isinstance(sequence, list) or not all(
            isinstance(item, str) and item for item in sequence
        ):
            result.error(
                "overlap-cases-content-provenance.json: expected_sequence must be "
                f"a non-empty string list in {case.get('id')!r}"
            )
    for skill in ("content-provenance-hygiene", "unlazy", "bug-finder"):
        if not any(
            isinstance(case.get("expected_sequence"), list)
            and skill in case["expected_sequence"]
            for case in supplemental
        ):
            result.error(
                "overlap-cases-content-provenance.json: missing overlap coverage "
                f"for {skill}"
            )


impl.validate_evaluations = validate_evaluations
_original_provenance_validation = impl.validate_responsibility_and_provenance


def validate_responsibility_and_provenance(result):
    """Run core checks plus provenance and orchestration contracts."""
    _original_provenance_validation(result)

    unlazy_reference = result.root / "skills/unlazy/references/upstream-provenance.md"
    unlazy_text = impl.read_text(unlazy_reference, result)
    for phrase in (
        "Leonxlnx/unlazy",
        "ed9e8d2b5919698cf2c54bda270d507e10b69617",
        "Copyright (c) 2026 Leonxlnx",
        "No endorsement by Leonxlnx is stated or implied",
    ):
        if phrase not in unlazy_text:
            result.error(f"skills/unlazy: upstream provenance missing {phrase!r}")

    service_reference = (
        result.root
        / "skills/content-provenance-hygiene/references/service-protocol.md"
    )
    service_text = impl.read_text(service_reference, result)
    for phrase in (
        "guillaumemeyer/watermarks-remover",
        "fcebf533583d7a313b348dbe421f3b4b17163b66",
        "License:** MIT",
        "does not vendor, redistribute, or silently install",
    ):
        if phrase not in service_text:
            result.error(
                "content-provenance-hygiene: service provenance missing "
                f"{phrase!r}"
            )

    notice = impl.read_text(result.root / "THIRD_PARTY_NOTICES.md", result)
    for phrase in (
        "## Leonxlnx/unlazy",
        "ed9e8d2b5919698cf2c54bda270d507e10b69617",
        "## guillaumemeyer/watermarks-remover",
        "Copyright (c) 2026 watermarks-remover contributors",
    ):
        if phrase not in notice:
            result.error(f"THIRD_PARTY_NOTICES.md: missing {phrase!r}")

    managed = result.root / "orchestration/managed-agents.md"
    workflows = result.root / "orchestration/workflows.md"
    for path in (managed, workflows):
        if not path.is_file():
            result.error(f"missing orchestration resource: {impl.rel(path, result.root)}")

    managed_text = impl.read_text(managed, result)
    for phrase in (
        "repository-intelligence",
        "bug-finder",
        "debugging-investigator",
        "unlazy",
        "verification-and-release",
        "workflows.md",
    ):
        if phrase not in managed_text:
            result.error(f"orchestration/managed-agents.md: missing {phrase!r}")

    workflows_text = impl.read_text(workflows, result)
    for phrase in (
        "Bug hunt — unknown defects",
        "Known bug — diagnose and fix",
        "Build or change a feature",
        "Improve an existing codebase",
        "Performance hunt",
        "Multi-agent execution",
        "bug-finder",
        "debugging-investigator",
        "unlazy",
        "verification-and-release",
    ):
        if phrase not in workflows_text:
            result.error(f"orchestration/workflows.md: missing {phrase!r}")

    package = result.root / "package.json"
    if package.is_file():
        try:
            package_data = impl.json.loads(impl.read_text(package, result))
        except impl.json.JSONDecodeError as exc:
            result.error(f"package.json: invalid JSON: {exc}")
        else:
            if package_data.get("bin", {}).get("codex-toolkit") != "bin/toolkit.mjs":
                result.error("package.json: codex-toolkit bin must route through bin/toolkit.mjs")
            files = package_data.get("files", [])
            if not isinstance(files, list) or "orchestration" not in files:
                result.error("package.json: orchestration directory must be included in package files")

    wrapper = result.root / "bin/toolkit.mjs"
    wrapper_text = impl.read_text(wrapper, result)
    for phrase in (
        "<!-- codex-toolkit:start -->",
        "<!-- codex-toolkit:end -->",
        "managed-agents.md",
        "workflows.md",
        "Refusing to edit",
    ):
        if phrase not in wrapper_text:
            result.error(f"bin/toolkit.mjs: missing managed-routing guard {phrase!r}")


impl.validate_responsibility_and_provenance = validate_responsibility_and_provenance

EXPECTED_SKILLS = impl.EXPECTED_SKILLS
TOOLKIT_SKILLS = impl.TOOLKIT_SKILLS
Result = impl.Result
main = impl.main


def __getattr__(name):
    return getattr(impl, name)


if __name__ == "__main__":
    raise SystemExit(main())
