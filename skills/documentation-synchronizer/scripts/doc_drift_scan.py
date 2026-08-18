#!/usr/bin/env python3
"""Read-only heuristic mapping from changed files to documentation surfaces."""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


def git_changed(root: Path, base: str) -> list[str]:
    try:
        result = subprocess.run(
            ["git", "-C", str(root), "diff", "--name-only", "--no-renames", base, "--"],
            check=False, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=20,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        raise ValueError(f"cannot obtain Git diff: {exc}") from exc
    if result.returncode != 0:
        raise ValueError(result.stderr.strip() or f"git diff failed with {result.returncode}")
    return [line.strip().replace("\\", "/") for line in result.stdout.splitlines() if line.strip()]


def classify(path: str) -> list[dict[str, str]]:
    p = path.lower()
    name = Path(p).name
    results: list[dict[str, str]] = []
    def add(surface: str, reason: str) -> None:
        if not any(item["surface"] == surface for item in results):
            results.append({"surface": surface, "reason": reason})
    if any(token in p for token in ("openapi", "swagger", "asyncapi", ".graphql", ".proto", "schema")):
        add("API/schema reference and generated-client source", "contract or schema artifact changed")
        add("migration/deprecation guide", "consumers may require compatibility guidance")
    if any(token in p for token in ("cli", "command", "commands/", "argparse", "cobra", "click")):
        add("CLI reference, help snapshots, and automation examples", "command behavior may have changed")
    if name in {"package.json", "pyproject.toml", "pubspec.yaml", "cargo.toml", "go.mod", "pom.xml"} or "lock" in name:
        add("installation, support matrix, and developer setup", "dependency or toolchain surface changed")
        add("release/migration notes", "resolved versions or requirements may change")
    if any(token in p for token in ("config", ".env", "settings", "values.yaml", "helm", "terraform", "deploy", "docker")):
        add("configuration reference and sample configuration", "configuration/deployment surface changed")
        add("operations and rollback runbook", "runtime or deployment procedure may change")
    if any(token in p for token in ("migration", "migrations/", "database", "db/", "model", "entity")):
        add("data migration, backup/restore, and mixed-version guidance", "persistent data surface changed")
    if any(token in p for token in ("auth", "security", "permission", "policy", "privacy", "secret")):
        add("security, permission, privacy, and administration docs", "sensitive behavior may have changed")
    if any(token in p for token in ("ui/", "components/", "screens/", "pages/", "routes/", "app/")) or Path(p).suffix in {".tsx", ".jsx", ".vue", ".svelte", ".dart"}:
        add("user guide, UI state descriptions, screenshots, and accessibility instructions", "user-visible interface may have changed")
    if any(token in p for token in ("metric", "trace", "logging", "observability", "alert", "monitor", "runbook")):
        add("observability reference and incident runbook", "diagnostic or operational signals changed")
    if any(token in p for token in ("architecture", "adr", "service", "module", "workspace")):
        add("architecture overview, diagrams, ownership, and contributor guide", "component boundary may have changed")
    if p.startswith("docs/") or name.startswith("readme") or Path(p).suffix in {".md", ".mdx", ".rst", ".adoc"}:
        add("cross-document consistency and inbound links", "documentation source changed")
    if not results:
        add("nearest README/API comments/tests/examples", "source changed without a specific heuristic match")
    return results


def normalize_changed_path(raw: str) -> str:
    """Normalize an explicit path without stripping meaningful leading dots."""
    value = raw.strip().replace("\\", "/")
    while value.startswith("./"):
        value = value[2:]
    return value


def build(root: Path, files: list[str]) -> dict[str, Any]:
    normalized: list[str] = []
    for raw in files:
        p = normalize_changed_path(raw)
        if p and p not in normalized:
            normalized.append(p)
    items = [{"path": p, "suggested_surfaces": classify(p)} for p in sorted(normalized)]
    surface_map: dict[str, list[str]] = {}
    for item in items:
        for suggestion in item["suggested_surfaces"]:
            surface_map.setdefault(suggestion["surface"], []).append(item["path"])
    return {
        "root": str(root), "changed_files": items, "surface_summary": surface_map,
        "limitations": [
            "Heuristic only: inspect semantic diffs and authoritative artifacts before editing documentation.",
            "The script does not edit files, build documentation, validate links, or infer final behavior.",
        ],
    }


def markdown(data: dict[str, Any]) -> str:
    lines = ["# Documentation Drift Scan", "", f"- Root: `{data['root']}`", f"- Changed files: `{len(data['changed_files'])}`", "", "## Suggested surfaces"]
    if data["surface_summary"]:
        for surface, files in sorted(data["surface_summary"].items()):
            lines += [f"### {surface}"] + [f"- `{path}`" for path in files] + [""]
    else:
        lines.append("- No changed files supplied")
    lines += ["## Limitations"] + [f"- {x}" for x in data["limitations"]]
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--base", help="Git base/ref passed to git diff --name-only")
    source.add_argument("--files", nargs="+", help="explicit repository-relative changed files")
    parser.add_argument("--format", choices=("json", "markdown"), default="json")
    args = parser.parse_args()
    root = Path(args.root).expanduser().resolve()
    if not root.is_dir():
        print(f"error: not a directory: {root}", file=sys.stderr)
        return 2
    try:
        files = git_changed(root, args.base) if args.base else list(args.files or [])
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    data = build(root, files)
    print(json.dumps(data, indent=2) if args.format == "json" else markdown(data), end="\n" if args.format == "json" else "")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
