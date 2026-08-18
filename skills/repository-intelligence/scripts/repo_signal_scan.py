#!/usr/bin/env python3
"""Read-only repository signal inventory for repository-intelligence."""
from __future__ import annotations

import argparse
import collections
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

IGNORED_DIRS = {
    ".git", ".hg", ".svn", ".idea", ".vscode", "node_modules", "vendor",
    "dist", "build", "target", ".next", ".dart_tool", ".gradle", ".venv",
    "venv", "__pycache__", "coverage", ".cache", ".turbo", ".expo",
}
MANIFEST_NAMES = {
    "package.json", "pnpm-workspace.yaml", "yarn.lock", "package-lock.json",
    "pnpm-lock.yaml", "bun.lock", "bun.lockb", "pyproject.toml", "poetry.lock",
    "requirements.txt", "Pipfile", "Cargo.toml", "Cargo.lock", "go.mod", "go.sum",
    "pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle",
    "settings.gradle.kts", "pubspec.yaml", "pubspec.lock", "Gemfile", "Gemfile.lock",
    "composer.json", "composer.lock", "Dockerfile", "docker-compose.yml",
    "docker-compose.yaml", "Makefile", "justfile", "Taskfile.yml",
}
SINGLE_OWNER_NAMES = {
    "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb",
    "Cargo.lock", "pubspec.lock", "poetry.lock", "Gemfile.lock", "composer.lock",
    "CHANGELOG.md", "CHANGELOG", "VERSION", "release-please-config.json",
}


def git_output(root: Path, *args: str) -> str | None:
    try:
        result = subprocess.run(
            ["git", "-C", str(root), *args], check=False, text=True,
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, timeout=10,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() if result.returncode == 0 else None


def walk_files(root: Path, max_files: int) -> tuple[list[Path], bool]:
    files: list[Path] = []
    for current, dirs, names in os.walk(root, topdown=True, followlinks=False):
        dirs[:] = sorted(d for d in dirs if d not in IGNORED_DIRS)
        for name in sorted(names):
            path = Path(current) / name
            try:
                if path.is_symlink() or not path.is_file():
                    continue
            except OSError:
                continue
            files.append(path)
            if len(files) > max_files:
                return files[:max_files], True
    return files, False


def rel(root: Path, path: Path) -> str:
    return path.relative_to(root).as_posix()


def scan(root: Path, max_files: int) -> dict[str, Any]:
    files, truncated = walk_files(root, max_files)
    rels = [rel(root, p) for p in files]
    ext_counts: collections.Counter[str] = collections.Counter()
    top_counts: collections.Counter[str] = collections.Counter()
    manifests: list[str] = []
    ci_files: list[str] = []
    ownership_files: list[str] = []
    migrations: list[str] = []
    schemas: list[str] = []
    generated_candidates: list[str] = []
    conflict_surfaces: list[str] = []

    for item in rels:
        path = Path(item)
        suffix = path.suffix.lower() or "[no extension]"
        ext_counts[suffix] += 1
        top_counts[path.parts[0] if path.parts else "."] += 1
        name_lower = path.name.lower()
        item_lower = item.lower()
        if path.name in MANIFEST_NAMES:
            manifests.append(item)
        if item.startswith(".github/workflows/") or any(
            token in item_lower for token in ("gitlab-ci", "azure-pipelines", "buildkite", "circleci")
        ):
            ci_files.append(item)
        if path.name in {"CODEOWNERS", "OWNERS", "MAINTAINERS", "MAINTAINERS.md"}:
            ownership_files.append(item)
        if "migration" in item_lower or "/migrations/" in f"/{item_lower}/":
            migrations.append(item)
        if any(token in name_lower for token in ("schema", "openapi", "swagger", "asyncapi")) or path.suffix in {".proto", ".graphql"}:
            schemas.append(item)
        if any(token in name_lower for token in ("generated", ".g.", ".freezed.", ".gen.")):
            generated_candidates.append(item)
        if path.name in SINGLE_OWNER_NAMES or any(
            token in item_lower for token in ("/migrations/", "schema", "codegen", "release")
        ):
            conflict_surfaces.append(item)

    status = git_output(root, "status", "--short")
    repo_root = git_output(root, "rev-parse", "--show-toplevel")
    branch = git_output(root, "branch", "--show-current")
    head = git_output(root, "rev-parse", "--short", "HEAD")

    return {
        "root": str(root),
        "git": {
            "detected": repo_root is not None,
            "repository_root": repo_root,
            "branch": branch or None,
            "head": head,
            "working_tree": status.splitlines() if status else [],
        },
        "scan": {"files_seen": len(files), "truncated": truncated, "max_files": max_files},
        "top_level_file_counts": dict(top_counts.most_common()),
        "extension_counts": dict(ext_counts.most_common(20)),
        "manifests_and_lockfiles": sorted(manifests),
        "ci_and_automation": sorted(ci_files),
        "ownership_signals": sorted(ownership_files),
        "migration_candidates": sorted(migrations)[:200],
        "schema_contract_candidates": sorted(schemas)[:200],
        "generated_candidates": sorted(generated_candidates)[:200],
        "likely_single_owner_or_conflict_surfaces": sorted(set(conflict_surfaces))[:300],
        "limitations": [
            "Signal inventory only; imports, runtime registration, ownership, and impact require manual corroboration.",
            "Ignored dependency, build, cache, and generated-directory defaults may be overridden only by editing the script deliberately.",
        ],
    }


def as_markdown(data: dict[str, Any]) -> str:
    lines = ["# Repository Signal Scan", "", f"- Root: `{data['root']}`"]
    git = data["git"]
    lines += [
        f"- Git detected: `{git['detected']}`",
        f"- Branch: `{git['branch'] or '[detached/unknown]'}`",
        f"- HEAD: `{git['head'] or '[unknown]'}`",
        f"- Files seen: `{data['scan']['files_seen']}` (truncated: `{data['scan']['truncated']}`)",
        "",
    ]
    for title, key in (
        ("Manifests and lockfiles", "manifests_and_lockfiles"),
        ("CI and automation", "ci_and_automation"),
        ("Ownership signals", "ownership_signals"),
        ("Migration candidates", "migration_candidates"),
        ("Schema/contract candidates", "schema_contract_candidates"),
        ("Likely conflict surfaces", "likely_single_owner_or_conflict_surfaces"),
    ):
        lines.append(f"## {title}")
        values = data[key]
        lines.extend(f"- `{value}`" for value in values) if values else lines.append("- None detected")
        lines.append("")
    lines.append("## Working-tree changes")
    lines.extend(f"- `{value}`" for value in git["working_tree"]) if git["working_tree"] else lines.append("- None reported or Git unavailable")
    lines += ["", "## Limitations"] + [f"- {x}" for x in data["limitations"]]
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".", help="repository root to inspect")
    parser.add_argument("--format", choices=("json", "markdown"), default="json")
    parser.add_argument("--max-files", type=int, default=100_000)
    args = parser.parse_args()
    root = Path(args.root).expanduser().resolve()
    if not root.is_dir():
        print(f"error: not a directory: {root}", file=sys.stderr)
        return 2
    if args.max_files < 1:
        print("error: --max-files must be positive", file=sys.stderr)
        return 2
    data = scan(root, args.max_files)
    print(json.dumps(data, indent=2) if args.format == "json" else as_markdown(data), end="\n" if args.format == "json" else "")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
