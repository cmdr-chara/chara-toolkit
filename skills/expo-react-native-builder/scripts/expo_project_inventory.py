#!/usr/bin/env python3
"""Read-only inventory of Expo/React Native versions, config, native directories, and production signals."""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

IGNORE = {".git", "node_modules", ".expo", "dist", "build", "coverage", ".cache", ".turbo", "Pods", "DerivedData"}
SELECTED = {
    "expo", "react", "react-native", "expo-router", "expo-dev-client", "expo-updates", "expo-secure-store", "expo-sqlite", "expo-background-task",
    "@react-navigation/native", "@react-navigation/native-stack", "@tanstack/react-query", "@reduxjs/toolkit", "react-redux", "zustand", "jotai",
    "@react-native-async-storage/async-storage", "react-native-reanimated", "react-native-gesture-handler", "react-native-screens", "react-native-safe-area-context",
    "jest", "jest-expo", "@testing-library/react-native", "detox", "@sentry/react-native", "@opentelemetry/api",
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


def read_json(path: Path) -> tuple[dict[str, Any] | None, str | None]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        return None, str(exc)
    return data if isinstance(data, dict) else None, None if isinstance(data, dict) else "root is not an object"


def package_info(path: Path) -> dict[str, Any]:
    data, error = read_json(path)
    if data is None:
        return {"error": error}
    selected: dict[str, dict[str, str]] = {}
    for section in ("dependencies", "devDependencies", "peerDependencies", "overrides", "resolutions"):
        values = data.get(section)
        if isinstance(values, dict):
            for name, version in values.items():
                if name in SELECTED:
                    selected[name] = {"range": str(version), "section": section}
    scripts = data.get("scripts") if isinstance(data.get("scripts"), dict) else {}
    return {
        "name": data.get("name"), "private": data.get("private"), "packageManager": data.get("packageManager"), "engines": data.get("engines", {}),
        "selected_dependencies": dict(sorted(selected.items())), "script_names": sorted(scripts), "workspaces": data.get("workspaces"),
    }


def redact_config(data: dict[str, Any]) -> dict[str, Any]:
    expo = data.get("expo") if isinstance(data.get("expo"), dict) else data
    keep = ("name", "slug", "scheme", "version", "runtimeVersion", "sdkVersion", "platforms", "newArchEnabled", "orientation", "userInterfaceStyle")
    result = {key: expo.get(key) for key in keep if key in expo}
    for platform in ("ios", "android", "web"):
        value = expo.get(platform)
        if isinstance(value, dict):
            allowed = {k: value.get(k) for k in ("bundleIdentifier", "package", "buildNumber", "versionCode", "supportsTablet", "deploymentTarget", "targetSdkVersion", "minSdkVersion", "output") if k in value}
            if allowed:
                result[platform] = allowed
    plugins = expo.get("plugins")
    if isinstance(plugins, list):
        result["plugins"] = [p[0] if isinstance(p, list) and p else p for p in plugins]
    updates = expo.get("updates")
    if isinstance(updates, dict):
        result["updates_keys"] = sorted(updates.keys())
    return result


def inventory(root: Path, max_files: int) -> dict[str, Any]:
    files, truncated = walk(root, max_files)
    rel = lambda p: p.relative_to(root).as_posix()
    packages = []
    for path in files:
        if path.name == "package.json":
            packages.append({"path": rel(path), **package_info(path)})
    app_configs: list[dict[str, Any]] = []
    for name in ("app.json", "app.config.json"):
        path = root / name
        if path.is_file() and not path.is_symlink():
            data, error = read_json(path)
            app_configs.append({"path": name, "error": error} if data is None else {"path": name, "selected": redact_config(data)})
    dynamic_configs = sorted(rel(p) for p in files if p.name in {"app.config.js", "app.config.ts"})
    eas = None
    eas_path = root / "eas.json"
    if eas_path.is_file() and not eas_path.is_symlink():
        data, error = read_json(eas_path)
        if data is None:
            eas = {"path": "eas.json", "error": error}
        else:
            eas = {"path": "eas.json", "build_profiles": sorted(data.get("build", {}).keys()) if isinstance(data.get("build"), dict) else [], "submit_profiles": sorted(data.get("submit", {}).keys()) if isinstance(data.get("submit"), dict) else []}
    return {
        "root": str(root), "files_seen": len(files), "truncated": truncated,
        "package_manifests": packages,
        "lockfiles": sorted(rel(p) for p in files if p.name in {"package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"}),
        "app_json_configs": app_configs, "dynamic_app_configs": dynamic_configs, "eas": eas,
        "native_directories": [name for name in ("ios", "android") if (root / name).is_dir() and not (root / name).is_symlink()],
        "route_signals": sorted({rel(p.parent) for p in files if "app" in p.parts and p.suffix in {".tsx", ".ts", ".jsx", ".js"} and (p.name.startswith("_") or p.name.startswith("+") or p.name in {"index.tsx", "index.jsx"})})[:200],
        "test_configs": sorted(rel(p) for p in files if p.name in {"jest.config.js", "jest.config.ts", ".maestro", "detox.config.js", "detox.config.ts"} or p.name.startswith("playwright.config")),
        "environment_file_names_only": sorted(rel(p) for p in files if p.name.startswith(".env")),
        "review_prompts": [
            "Confirm resolved Expo SDK/RN/React/Node versions with Expo tooling and the lockfile.",
            "Inspect dynamic app config, config-plugin output, native manifests/entitlements, credentials, runtimeVersion, channels, and update policy manually.",
            "Environment filenames are reported only; contents are never read. EXPO_PUBLIC values are bundled and public.",
            "Check monorepo for duplicate React, React Native, Turbo, and Expo native modules.",
        ],
    }


def markdown(data: dict[str, Any]) -> str:
    lines = ["# Expo/React Native Project Inventory", "", f"- Root: `{data['root']}`", f"- Files seen: `{data['files_seen']}` (truncated: `{data['truncated']}`)", f"- Native directories: `{', '.join(data['native_directories']) or 'none detected'}`", "", "## Package manifests"]
    if data["package_manifests"]:
        for item in data["package_manifests"]:
            lines += [f"### `{item['path']}`", f"- Name: `{item.get('name')}`", f"- Package manager: `{item.get('packageManager')}`", f"- Engines: `{json.dumps(item.get('engines', {}), sort_keys=True)}`", "- Selected dependencies:"]
            deps = item.get("selected_dependencies", {})
            lines.extend(f"  - `{name}`: `{v['range']}` ({v['section']})" for name, v in deps.items()) if deps else lines.append("  - None detected")
            lines += [f"- Scripts: `{', '.join(item.get('script_names', []))}`", ""]
    else:
        lines += ["- None detected", ""]
    lines += ["## App config (selected non-secret fields)"]
    if data["app_json_configs"]:
        for item in data["app_json_configs"]:
            lines.append(f"- `{item['path']}`: `{json.dumps(item.get('selected', {'error': item.get('error')}), sort_keys=True)}`")
    else:
        lines.append("- No static JSON app config detected")
    lines += [f"- Dynamic app configs requiring manual review: `{', '.join(data['dynamic_app_configs']) or 'none'}`", "", "## EAS"]
    lines.append(f"- `{json.dumps(data['eas'], sort_keys=True)}`" if data["eas"] else "- No eas.json detected")
    for title, key in (("Lockfiles", "lockfiles"), ("Route signals", "route_signals"), ("Test configs", "test_configs"), ("Environment file names only", "environment_file_names_only")):
        lines += ["", f"## {title}"]
        vals = data[key]
        lines.extend(f"- `{x}`" for x in vals) if vals else lines.append("- None detected")
    lines += ["", "## Review prompts"] + [f"- {x}" for x in data["review_prompts"]]
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
