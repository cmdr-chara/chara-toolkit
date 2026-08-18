#!/usr/bin/env python3
"""Read-only TypeScript/JavaScript quality signal inventory.

This helper never changes the target repository. It reports configuration and
heuristic source signals that require manual or parser-backed verification; it
must not be treated as an anti-slop rule engine.
"""
from __future__ import annotations

import argparse
import json
import os
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


def iter_repository_files(root: Path) -> Iterable[Path]:
    """Yield owned files without descending into dependency/generated trees."""
    for current, dirnames, filenames in os.walk(root, topdown=True, followlinks=False):
        directory = Path(current)
        dirnames[:] = sorted(
            name
            for name in dirnames
            if name not in SKIP_DIRS and not (directory / name).is_symlink()
        )
        for filename in sorted(filenames):
            path = directory / filename
            if path.is_symlink() or not path.is_file():
                continue
            yield path


def iter_source_files(root: Path) -> Iterable[Path]:
    for path in iter_repository_files(root):
        if path.suffix.lower() in SOURCE_SUFFIXES:
            yield path


def iter_tsconfig_files(root: Path) -> Iterable[Path]:
    for path in iter_repository_files(root):
        if path.suffix.lower() == ".json" and path.name.lower().startswith("tsconfig"):
            yield path


def strip_jsonc_comments(text: str) -> str:
    output: list[str] = []
    index = 0
    in_string = False
    escaped = False
    while index < len(text):
        char = text[index]
        if in_string:
            output.append(char)
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            index += 1
            continue

        if char == '"':
            in_string = True
            output.append(char)
            index += 1
            continue

        if char == "/" and index + 1 < len(text):
            next_char = text[index + 1]
            if next_char == "/":
                index += 2
                while index < len(text) and text[index] not in "\r\n":
                    index += 1
                continue
            if next_char == "*":
                index += 2
                while index + 1 < len(text) and text[index : index + 2] != "*/":
                    if text[index] in "\r\n":
                        output.append(text[index])
                    index += 1
                index = min(len(text), index + 2)
                continue

        output.append(char)
        index += 1
    return "".join(output)


def strip_jsonc_trailing_commas(text: str) -> str:
    output: list[str] = []
    index = 0
    in_string = False
    escaped = False
    while index < len(text):
        char = text[index]
        if in_string:
            output.append(char)
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            index += 1
            continue

        if char == '"':
            in_string = True
            output.append(char)
            index += 1
            continue

        if char == ",":
            lookahead = index + 1
            while lookahead < len(text) and text[lookahead].isspace():
                lookahead += 1
            if lookahead < len(text) and text[lookahead] in "}]":
                index += 1
                continue

        output.append(char)
        index += 1
    return "".join(output)


def read_json(path: Path) -> object | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError):
        return None


def read_jsonc(path: Path) -> object | None:
    try:
        text = path.read_text(encoding="utf-8")
        normalized = strip_jsonc_trailing_commas(strip_jsonc_comments(text))
        return json.loads(normalized)
    except (OSError, UnicodeError, json.JSONDecodeError):
        return None


def tsconfig_summary(root: Path) -> list[dict[str, object]]:
    results: list[dict[str, object]] = []
    for path in sorted(iter_tsconfig_files(root), key=lambda item: item.relative_to(root).as_posix()):
        relative = path.relative_to(root).as_posix()
        data = read_jsonc(path)
        if not isinstance(data, dict):
            results.append({"path": relative, "parseable_jsonc": False})
            continue
        compiler = data.get("compilerOptions")
        compiler = compiler if isinstance(compiler, dict) else {}
        results.append(
            {
                "path": relative,
                "parseable_jsonc": True,
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
    package_path = root / "package.json"
    if package_path.is_symlink() or not package_path.is_file():
        return {"present": False}
    package = read_json(package_path)
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
    return [
        name
        for name in candidates
        if (root / name).is_file() and not (root / name).is_symlink()
    ]


def scan_sources(root: Path) -> tuple[Counter[str], dict[str, list[dict[str, object]]], int]:
    counts: Counter[str] = Counter()
    examples: dict[str, list[dict[str, object]]] = defaultdict(list)
    files_scanned = 0
    for path in iter_source_files(root):
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
        for path in iter_repository_files(root)
        if path.name == "index.ts" and "anti-slop" in path.as_posix().lower()
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
