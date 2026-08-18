#!/usr/bin/env python3
"""Read-only inventory of Flutter project manifests, platforms, dependencies, and test/build signals."""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

IGNORE = {".git", ".dart_tool", "build", ".idea", ".gradle", "Pods", "DerivedData", ".symlinks", "ephemeral"}
SELECTED = {
    "go_router", "provider", "flutter_riverpod", "hooks_riverpod", "riverpod_annotation", "flutter_bloc", "bloc",
    "http", "dio", "json_serializable", "json_annotation", "freezed", "freezed_annotation", "build_runner",
    "shared_preferences", "flutter_secure_storage", "sqflite", "drift", "drift_dev", "path_provider",
    "flutter_test", "integration_test", "patrol", "mocktail", "mockito", "sentry_flutter", "firebase_crashlytics",
}


def walk(root: Path, max_files: int) -> tuple[list[Path], bool]:
    files: list[Path] = []
    for current, dirs, names in os.walk(root, topdown=True, followlinks=False):
        directory = Path(current)
        dirs[:] = sorted(
            d for d in dirs if d not in IGNORE and not (directory / d).is_symlink()
        )
        for name in sorted(names):
            path = directory / name
            if path.is_symlink() or not path.is_file():
                continue
            files.append(path)
            if len(files) >= max_files:
                return files, True
    return files, False


def top_level_blocks(text: str) -> dict[str, list[str]]:
    """Split a simple YAML document into top-level blocks without resolving YAML features.

    This deliberately avoids a third-party YAML dependency. It is an inventory helper, not a
    general parser: aliases, merge keys, and computed values remain evidence for manual review.
    """
    blocks: dict[str, list[str]] = {}
    current: str | None = None
    for raw_line in text.splitlines():
        top = re.match(r"^([A-Za-z_][\w-]*):(?:\s*(.*))?$", raw_line)
        if top:
            current = top.group(1)
            blocks.setdefault(current, [])
            inline = (top.group(2) or "").strip()
            if inline:
                blocks[current].append(f"__inline__: {inline}")
            continue
        if current is not None:
            blocks[current].append(raw_line)
    return blocks


def direct_mapping(lines: list[str]) -> dict[str, str]:
    """Read only the least-indented mapping entries in a top-level YAML block."""
    candidates: list[tuple[int, str, str]] = []
    for line in lines:
        if not line.strip() or line.lstrip().startswith("#") or line.startswith("__inline__:"):
            continue
        match = re.match(r"^( +)([\w-]+):\s*(.*?)\s*(?:#.*)?$", line)
        if match:
            candidates.append((len(match.group(1)), match.group(2), match.group(3).strip()))
    if not candidates:
        return {}
    direct_indent = min(indent for indent, _, _ in candidates)
    return {
        key: (value.strip("'\"") if value else "[nested/path/git/sdk]")
        for indent, key, value in candidates
        if indent == direct_indent
    }


def parse_pubspec(path: Path) -> dict[str, Any]:
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        return {"error": str(exc)}

    blocks = top_level_blocks(text)

    def scalar(key: str) -> str | None:
        inline = next((line.split(":", 1)[1].strip() for line in blocks.get(key, []) if line.startswith("__inline__:")), None)
        if inline is None:
            return None
        return inline.split("#", 1)[0].strip().strip("'\"") or None

    environment = direct_mapping(blocks.get("environment", []))
    sections: dict[str, dict[str, str]] = {}
    for section in ("dependencies", "dev_dependencies", "dependency_overrides"):
        values = direct_mapping(blocks.get(section, []))
        sections[section] = {k: v for k, v in values.items() if k in SELECTED or k == "flutter"}
    return {"name": scalar("name"), "version": scalar("version"), "environment": environment, **sections}


def inventory(root: Path, max_files: int) -> dict[str, Any]:
    files, truncated = walk(root, max_files)
    rel = lambda p: p.relative_to(root).as_posix()
    pubspecs = []
    for path in files:
        if path.name == "pubspec.yaml":
            pubspecs.append({"path": rel(path), **parse_pubspec(path)})
    platforms = [
        name
        for name in ("android", "ios", "macos", "windows", "linux", "web")
        if (root / name).is_dir() and not (root / name).is_symlink()
    ]
    configs = sorted(rel(p) for p in files if p.name in {"analysis_options.yaml", "build.yaml", "l10n.yaml", "melos.yaml", "Podfile", "gradle.properties", "settings.gradle", "settings.gradle.kts"})
    generated = sorted(rel(p) for p in files if any(token in p.name for token in (".g.dart", ".freezed.dart", ".mocks.dart")))
    tests = sorted({rel(p.parent) for p in files if p.suffix == ".dart" and any(part in {"test", "integration_test"} for part in p.parts)})
    env_names = sorted(rel(p) for p in files if p.name.startswith(".env") or p.name.endswith(".xcconfig"))
    return {
        "root": str(root), "files_seen": len(files), "truncated": truncated,
        "pubspecs": pubspecs, "lockfiles": sorted(rel(p) for p in files if p.name == "pubspec.lock"),
        "platform_directories": platforms, "configuration": configs, "test_roots": tests,
        "generated_files_sample": generated[:100], "environment_file_names_only": env_names,
        "review_prompts": [
            "Confirm actual Flutter/Dart version from repository pin/tool output; pubspec constraints are not the resolved SDK.",
            "Review native platform manifests, permissions, minimum OS/toolchain, signing, flavors, and plugin registration manually.",
            "Generated files are signals only; edit authoritative sources and use repository generation commands.",
        ],
    }


def markdown(data: dict[str, Any]) -> str:
    lines = ["# Flutter Project Inventory", "", f"- Root: `{data['root']}`", f"- Files seen: `{data['files_seen']}` (truncated: `{data['truncated']}`)", f"- Platforms: `{', '.join(data['platform_directories']) or 'none detected'}`", "", "## Pubspecs"]
    if data["pubspecs"]:
        for item in data["pubspecs"]:
            lines += [f"### `{item['path']}`", f"- Name/version: `{item.get('name')}` / `{item.get('version')}`", f"- Environment: `{json.dumps(item.get('environment', {}), sort_keys=True)}`"]
            for section in ("dependencies", "dev_dependencies", "dependency_overrides"):
                lines.append(f"- {section}:")
                vals = item.get(section, {})
                lines.extend(f"  - `{k}`: `{v}`" for k, v in vals.items()) if vals else lines.append("  - None selected")
            lines.append("")
    else:
        lines += ["- None detected", ""]
    for title, key in (("Lockfiles", "lockfiles"), ("Configuration", "configuration"), ("Test roots", "test_roots"), ("Generated files sample", "generated_files_sample"), ("Environment file names only", "environment_file_names_only")):
        lines.append(f"## {title}")
        vals = data[key]
        lines.extend(f"- `{x}`" for x in vals) if vals else lines.append("- None detected")
        lines.append("")
    lines += ["## Review prompts"] + [f"- {x}" for x in data["review_prompts"]]
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--format", choices=("json", "markdown"), default="json")
    parser.add_argument("--max-files", type=int, default=100_000)
    args = parser.parse_args()
    root = Path(args.root).expanduser().resolve()
    if not root.is_dir() or args.max_files < 1:
        print("error: valid directory and positive --max-files required", file=sys.stderr)
        return 2
    data = inventory(root, args.max_files)
    print(json.dumps(data, indent=2) if args.format == "json" else markdown(data), end="\n" if args.format == "json" else "")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
