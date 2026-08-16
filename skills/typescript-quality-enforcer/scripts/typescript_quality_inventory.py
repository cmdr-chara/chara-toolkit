#!/usr/bin/env python3
"""Read-only TypeScript/JavaScript quality signal inventory.

This helper never changes the target repository. It reports configuration and
heuristic source signals that require manual or parser-backed verification; it
must not be treated as an anti-slop rule engine.
"""
from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Iterable

SOURCE_SUFFIXES = {".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"}
SKIP_DIRS = {
    ".git",
    ".next",
    ".nuxt",
    ".output",
    ".turbo",
    ".yarn",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
    "target",
    "vendor",
}
MAX_EXAMPLES = 8

PATTERNS: dict[str, re.Pattern[str]] = {
    "chained_assertion": re.compile(r"\bas\s+(?:unknown|any|object|[A-Za-z_$][\w$<>., |&\[\]]*)\s+as\s+", re.MULTILINE),
    "as_any": re.compile(r"\bas\s+any\b"),
    "as_unknown": re.compile(r"\bas\s+unknown\b"),
    "ts_ignore": re.compile(r"@ts-ignore\b"),
    "ts_expect_error": re.compile(r"@ts-expect-error\b"),
    "lint_disable": re.compile(r"(?:eslint|oxlint)-disable(?:-next-line|-line)?\b"),
    "module_mock": re.compile(r"\b(?:vi|jest)\.(?:doMock|mock|unstable_mockModule)\s*\("),
    "reflect_get": re.compile(r"\bReflect\.get\s*\("),
    "reflect_apply": re.compile(r"\bReflect\.apply\s*\("),
    "unsafe_record": re.compile(r"\bRecord\s*<\s*(?:string|number|PropertyKey)\s*,\s*(?:unknown|any|object|\{\s*\})\s*>"),
    "unknown_annotation": re.compile(r":\s*unknown\b"),
    "any_annotation": re.compile(r":\s*any\b"),
    "runtime_typeof": re.compile(r"\btypeof\s+[A-Za-z_$({[]"),
    "non_null_assertion": re.compile(r"\b[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*!\b"),
}


def iter_source_files(root: Path) -> Iterable[Path]:
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in SOURCE_SUFFIXES:
            continue
        try:
            relative = path.relative_to(root)
        except ValueError:
            continue
        if any(part in SKIP_DIRS for part in relative.parts[:-1]):
            continue
        yield path


def read_json(path: Path) -> object | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError):
        return None


def tsconfig_summary(root: Path) -> list[dict[str, object]]:
    results: list[dict[str, object]] = []
    for path in sorted(root.glob("tsconfig*.json")):
        data = read_json(path)
        if not isinstance(data, dict):
            results.append({"path": path.name, "parseable_json": False})
            continue
        compiler = data.get("compilerOptions")
        compiler = compiler if isinstance(compiler, dict) else {}
        results.append(
            {
                "path": path.name,
                "parseable_json": True,
                "extends": data.get("extends"),
                "strict": compiler.get("strict"),
                "noImplicitAny": compiler.get("noImplicitAny"),
                "useUnknownInCatchVariables": compiler.get("useUnknownInCatchVariables"),
                "noUncheckedIndexedAccess": compiler.get("noUncheckedIndexedAccess"),
                "exactOptionalPropertyTypes": compiler.get("exactOptionalPropertyTypes"),
                "noImplicitOverride": compiler.get("noImplicitOverride"),
            }
        )
    return results


def package_summary(root: Path) -> dict[str, object]:
    package = read_json(root / "package.json")
    if not isinstance(package, dict):
        return {"present": False}
    dependencies: dict[str, object] = {}
    for key in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
        value = package.get(key)
        if isinstance(value, dict):
            dependencies.update(value)
    scripts = package.get("scripts") if isinstance(package.get("scripts"), dict) else {}
    interesting = {
        name: dependencies[name]
        for name in ("typescript", "oxlint", "@oxlint/plugins", "eslint", "vite-plus")
        if name in dependencies
    }
    return {
        "present": True,
        "packageManager": package.get("packageManager"),
        "tool_dependencies": interesting,
        "scripts": {
            name: command
            for name, command in scripts.items()
            if isinstance(command, str)
            and any(term in name.lower() for term in ("lint", "check", "type", "test"))
        },
    }


def config_files(root: Path) -> list[str]:
    candidates = [
        "oxlint.config.ts",
        "oxlint.config.js",
        "oxlint.config.mjs",
        "oxlint.config.cjs",
        ".oxlintrc.json",
        ".oxlintrc",
        "eslint.config.js",
        "eslint.config.mjs",
        "eslint.config.cjs",
        "eslint.config.ts",
        ".eslintrc",
        ".eslintrc.json",
        "vite.config.ts",
        "vite.config.js",
    ]
    return [name for name in candidates if (root / name).is_file()]


def scan_sources(root: Path) -> tuple[Counter[str], dict[str, list[dict[str, object]]], int]:
    counts: Counter[str] = Counter()
    examples: dict[str, list[dict[str, object]]] = defaultdict(list)
    files_scanned = 0
    for path in sorted(iter_source_files(root)):
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeError):
            continue
        files_scanned += 1
        relative = path.relative_to(root).as_posix()
        for name, pattern in PATTERNS.items():
            for match in pattern.finditer(text):
                counts[name] += 1
                if len(examples[name]) >= MAX_EXAMPLES:
                    continue
                line = text.count("\n", 0, match.start()) + 1
                snippet_start = text.rfind("\n", 0, match.start()) + 1
                snippet_end = text.find("\n", match.end())
                if snippet_end < 0:
                    snippet_end = len(text)
                snippet = text[snippet_start:snippet_end].strip()
                if len(snippet) > 180:
                    snippet = snippet[:177] + "..."
                examples[name].append({"path": relative, "line": line, "snippet": snippet})
    return counts, examples, files_scanned


def build_report(root: Path) -> dict[str, object]:
    counts, examples, files_scanned = scan_sources(root)
    anti_slop_paths = [
        path.relative_to(root).as_posix()
        for path in root.rglob("index.ts")
        if "anti-slop" in path.as_posix().lower() and path.is_file()
    ]
    return {
        "root": str(root),
        "files_scanned": files_scanned,
        "package": package_summary(root),
        "tsconfigs": tsconfig_summary(root),
        "lint_config_files": config_files(root),
        "anti_slop_candidate_paths": sorted(anti_slop_paths)[:20],
        "heuristic_counts": dict(sorted(counts.items())),
        "examples": {name: values for name, values in sorted(examples.items())},
        "disclaimer": "Heuristic text signals only; verify findings manually and with parser-backed lint rules before remediation.",
    }


def markdown(report: dict[str, object]) -> str:
    lines = [
        "# TypeScript Quality Inventory",
        "",
        f"- Root: `{report['root']}`",
        f"- Source files scanned: {report['files_scanned']}",
        f"- Lint configs: {', '.join(report['lint_config_files']) or 'none detected at root'}",
        f"- anti-slop candidate paths: {', '.join(report['anti_slop_candidate_paths']) or 'none detected'}",
        "",
        "## Package/tooling",
        "",
        "```json",
        json.dumps(report["package"], indent=2, sort_keys=True),
        "```",
        "",
        "## TypeScript configs",
        "",
        "```json",
        json.dumps(report["tsconfigs"], indent=2, sort_keys=True),
        "```",
        "",
        "## Heuristic signals",
        "",
        "| Signal | Count |",
        "| --- | ---: |",
    ]
    counts = report["heuristic_counts"]
    assert isinstance(counts, dict)
    for name in sorted(PATTERNS):
        lines.append(f"| `{name}` | {counts.get(name, 0)} |")
    lines += ["", "## Examples", ""]
    examples = report["examples"]
    assert isinstance(examples, dict)
    for name, values in examples.items():
        lines.append(f"### `{name}`")
        lines.append("")
        for value in values:
            lines.append(f"- `{value['path']}:{value['line']}` — `{value['snippet']}`")
        lines.append("")
    lines += ["## Interpretation", "", str(report["disclaimer"]), ""]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".")
    parser.add_argument("--format", choices=("markdown", "json"), default="markdown")
    args = parser.parse_args()
    root = Path(args.root).expanduser().resolve()
    if not root.is_dir():
        parser.error("root must be a directory")
    report = build_report(root)
    if args.format == "json":
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print(markdown(report))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
