#!/usr/bin/env python3
"""Read-only inventory of common manifests, lockfiles, tool versions, and workspaces."""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

IGNORE = {".git", "node_modules", "vendor", "dist", "build", "target", ".next", ".dart_tool", ".gradle", ".venv", "venv", ".cache"}
NAMES = {
    "package.json", "package-lock.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "yarn.lock", "bun.lock", "bun.lockb",
    "pyproject.toml", "poetry.lock", "requirements.txt", "Pipfile", "Pipfile.lock",
    "Cargo.toml", "Cargo.lock", "go.mod", "go.sum", "pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts",
    "pubspec.yaml", "pubspec.lock", "Gemfile", "Gemfile.lock", "composer.json", "composer.lock",
    ".nvmrc", ".node-version", ".python-version", ".ruby-version", "rust-toolchain", "rust-toolchain.toml", "mise.toml", ".tool-versions",
}
LOCKFILE_NAMES = {
    "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb",
    "poetry.lock", "Pipfile.lock", "Cargo.lock", "go.sum", "pubspec.lock",
    "Gemfile.lock", "composer.lock",
}


def read_limited(path: Path, limit: int = 2_000_000) -> str | None:
    try:
        if path.stat().st_size > limit:
            return None
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None


def parse_package_json(path: Path) -> dict[str, Any]:
    text = read_limited(path)
    if text is None:
        return {"error": "unreadable or too large"}
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        return {"error": f"invalid JSON: {exc}"}
    return {
        "name": data.get("name"),
        "version": data.get("version"),
        "private": data.get("private"),
        "packageManager": data.get("packageManager"),
        "engines": data.get("engines", {}),
        "workspaces": data.get("workspaces"),
        "dependency_counts": {
            key: len(data.get(key, {})) if isinstance(data.get(key), dict) else 0
            for key in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies")
        },
    }


def parse_go_mod(path: Path) -> dict[str, Any]:
    text = read_limited(path) or ""
    module = re.search(r"(?m)^module\s+(\S+)", text)
    gov = re.search(r"(?m)^go\s+(\S+)", text)
    toolchain = re.search(r"(?m)^toolchain\s+(\S+)", text)
    return {"module": module.group(1) if module else None, "go": gov.group(1) if gov else None, "toolchain": toolchain.group(1) if toolchain else None}


def parse_pubspec(path: Path) -> dict[str, Any]:
    text = read_limited(path) or ""
    def scalar(key: str) -> str | None:
        match = re.search(rf"(?m)^{re.escape(key)}:\s*['\"]?([^'\"#\n]+)", text)
        return match.group(1).strip() if match else None
    sdk = re.search(r"(?ms)^environment:\s*\n(?:^[ \t].*\n)*?^[ \t]+sdk:\s*['\"]?([^'\"#\n]+)", text)
    flutter = re.search(r"(?ms)^environment:\s*\n(?:^[ \t].*\n)*?^[ \t]+flutter:\s*['\"]?([^'\"#\n]+)", text)
    return {"name": scalar("name"), "version": scalar("version"), "dart_sdk": sdk.group(1).strip() if sdk else None, "flutter": flutter.group(1).strip() if flutter else None}


def describe(path: Path) -> dict[str, Any]:
    info: dict[str, Any] = {"name": path.name, "size_bytes": path.stat().st_size}
    if path.name == "package.json":
        info["parsed"] = parse_package_json(path)
    elif path.name == "go.mod":
        info["parsed"] = parse_go_mod(path)
    elif path.name == "pubspec.yaml":
        info["parsed"] = parse_pubspec(path)
    elif path.name in {".nvmrc", ".node-version", ".python-version", ".ruby-version"}:
        text = read_limited(path, 10_000)
        info["declared_version"] = text.strip() if text else None
    return info


def inventory(root: Path, max_files: int) -> dict[str, Any]:
    results: list[dict[str, Any]] = []
    seen = 0
    truncated = False
    for current, dirs, files in os.walk(root, topdown=True, followlinks=False):
        dirs[:] = sorted(d for d in dirs if d not in IGNORE)
        for filename in sorted(files):
            seen += 1
            if seen > max_files:
                truncated = True
                break
            if filename in NAMES:
                path = Path(current) / filename
                item = describe(path)
                item["path"] = path.relative_to(root).as_posix()
                results.append(item)
        if truncated:
            break
    locks = [r["path"] for r in results if r["name"] in LOCKFILE_NAMES]
    return {
        "root": str(root), "files_scanned": min(seen, max_files), "truncated": truncated,
        "manifests": results, "lockfiles": locks,
        "warning": "Inventory only. Resolve versions from the active tool and lockfile; do not infer compatibility from filenames.",
    }


def markdown(data: dict[str, Any]) -> str:
    lines = ["# Manifest Inventory", "", f"- Root: `{data['root']}`", f"- Files scanned: `{data['files_scanned']}`", f"- Truncated: `{data['truncated']}`", "", "| Path | Size | Parsed signal |", "| --- | ---: | --- |"]
    for item in data["manifests"]:
        signal = item.get("parsed", item.get("declared_version", ""))
        compact = json.dumps(signal, sort_keys=True, ensure_ascii=False) if signal else ""
        lines.append(f"| `{item['path']}` | {item['size_bytes']} | `{compact.replace('|', '\\|')}` |")
    if not data["manifests"]:
        lines.append("| _None detected_ | | |")
    lines += ["", f"> {data['warning']}"]
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
