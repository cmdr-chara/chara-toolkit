#!/usr/bin/env python3
"""Read-only inventory of a JavaScript/TypeScript web project's production signals."""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

IGNORE = {".git", "node_modules", ".next", "dist", "build", "coverage", ".cache", ".turbo", "vendor"}
CONFIG_NAMES = {
    "next.config.js", "next.config.mjs", "next.config.ts", "vite.config.js", "vite.config.ts", "vite.config.mjs",
    "astro.config.mjs", "astro.config.ts", "remix.config.js", "svelte.config.js", "nuxt.config.ts",
    "tsconfig.json", "jsconfig.json", "eslint.config.js", "eslint.config.mjs", "eslint.config.ts",
    "playwright.config.ts", "playwright.config.js", "vitest.config.ts", "vitest.config.js", "jest.config.js", "jest.config.ts",
    "tailwind.config.js", "tailwind.config.ts", "postcss.config.js", "postcss.config.mjs", "components.json",
    "vercel.json", "netlify.toml", "wrangler.toml", "Dockerfile", ".env.example", ".env.sample",
}
INTERESTING_PACKAGES = {
    "next", "react", "react-dom", "@tanstack/react-query", "react-hook-form", "zod", "zustand", "@reduxjs/toolkit", "react-redux", "jotai",
    "motion", "framer-motion", "@base-ui-components/react", "radix-ui", "@radix-ui/react-dialog", "@playwright/test", "vitest",
    "@testing-library/react", "msw", "@opentelemetry/api", "@opentelemetry/sdk-trace-web", "@sentry/nextjs",
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


def package_info(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        return {"path": str(path), "error": str(exc)}
    all_deps: dict[str, str] = {}
    locations: dict[str, str] = {}
    for section in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
        values = data.get(section)
        if isinstance(values, dict):
            for name, version in values.items():
                all_deps[name] = str(version)
                locations[name] = section
    selected = {name: {"range": all_deps[name], "section": locations[name]} for name in sorted(all_deps) if name in INTERESTING_PACKAGES or name.startswith("@radix-ui/")}
    scripts = data.get("scripts") if isinstance(data.get("scripts"), dict) else {}
    return {
        "path": str(path), "name": data.get("name"), "private": data.get("private"), "packageManager": data.get("packageManager"),
        "engines": data.get("engines", {}), "workspaces": data.get("workspaces"),
        "selected_dependencies": selected,
        "script_names": sorted(scripts),
    }


def inventory(root: Path, max_files: int) -> dict[str, Any]:
    files, truncated = walk(root, max_files)
    rel = lambda p: p.relative_to(root).as_posix()
    package_files = [p for p in files if p.name == "package.json"]
    configs = sorted(rel(p) for p in files if p.name in CONFIG_NAMES)
    route_roots = sorted({rel(p.parent) for p in files if p.name in {"page.tsx", "page.jsx", "route.ts", "route.js", "layout.tsx", "layout.jsx"}})
    source_roots = sorted({Path(rel(p)).parts[0] for p in files if Path(rel(p)).parts and Path(rel(p)).parts[0] in {"app", "pages", "src", "public", "tests", "test", "e2e", "components"}})
    env_files = sorted(rel(p) for p in files if p.name.startswith(".env"))
    lockfiles = sorted(rel(p) for p in files if p.name in {"package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"})
    packages = []
    for p in package_files:
        info = package_info(p)
        info["path"] = rel(p)
        packages.append(info)
    return {
        "root": str(root), "files_seen": len(files), "truncated": truncated,
        "package_manifests": packages, "lockfiles": lockfiles, "configuration": configs,
        "detected_source_roots": source_roots, "app_router_signal_roots": route_roots[:200], "environment_files": env_files,
        "review_prompts": [
            "Confirm server/client execution boundaries, deployment adapter, supported browsers, and actual resolved versions.",
            "Environment filenames are reported only; contents are never read. Verify no secrets are committed.",
            "Package presence is not a recommendation and package absence is not a defect.",
        ],
    }


def markdown(data: dict[str, Any]) -> str:
    lines = ["# Web Project Inventory", "", f"- Root: `{data['root']}`", f"- Files seen: `{data['files_seen']}` (truncated: `{data['truncated']}`)", "", "## Package manifests"]
    if data["package_manifests"]:
        for package in data["package_manifests"]:
            lines += [f"### `{package['path']}`", f"- Name: `{package.get('name')}`", f"- Package manager: `{package.get('packageManager')}`", f"- Engines: `{json.dumps(package.get('engines', {}), sort_keys=True)}`", "- Selected dependencies:"]
            deps = package.get("selected_dependencies", {})
            lines.extend(f"  - `{name}`: `{details['range']}` ({details['section']})" for name, details in deps.items()) if deps else lines.append("  - None detected")
            lines += [f"- Scripts: `{', '.join(package.get('script_names', []))}`", ""]
    else:
        lines += ["- None detected", ""]
    for title, key in (("Lockfiles", "lockfiles"), ("Configuration", "configuration"), ("Source roots", "detected_source_roots"), ("App Router signals", "app_router_signal_roots"), ("Environment files (names only)", "environment_files")):
        lines.append(f"## {title}")
        values = data[key]
        lines.extend(f"- `{value}`" for value in values) if values else lines.append("- None detected")
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
