#!/usr/bin/env python3
"""Read-only aggregation of JUnit XML and LCOV summary data."""
from __future__ import annotations

import argparse
import json
import os
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any, Iterable


def iter_files(paths: Iterable[Path], suffixes: tuple[str, ...]) -> list[Path]:
    found: list[Path] = []
    for path in paths:
        if path.is_file() and path.suffix.lower() in suffixes:
            found.append(path)
        elif path.is_dir():
            for current, dirs, files in os.walk(path):
                dirs[:] = [d for d in dirs if d not in {".git", "node_modules", "vendor"}]
                found.extend(Path(current) / name for name in files if Path(name).suffix.lower() in suffixes)
    return sorted(set(p.resolve() for p in found))


def number(value: str | None, default: float = 0.0) -> float:
    try:
        return float(value) if value is not None else default
    except ValueError:
        return default


def junit_aggregate_suites(root: ET.Element) -> list[ET.Element]:
    """Select the highest aggregate nodes available without counting nested suites twice."""
    tag = root.tag.rsplit("}", 1)[-1]
    if tag in {"testsuite", "testsuites"} and root.get("tests") is not None:
        return [root]
    suites: list[ET.Element] = []
    for child in root:
        child_tag = child.tag.rsplit("}", 1)[-1]
        if child_tag in {"testsuite", "testsuites"}:
            suites.extend(junit_aggregate_suites(child))
    return suites


def junit_summary(files: list[Path]) -> dict[str, Any]:
    totals = {"tests": 0, "failures": 0, "errors": 0, "skipped": 0, "time_seconds": 0.0}
    parsed: list[dict[str, Any]] = []
    problems: list[str] = []
    for path in files:
        try:
            root = ET.parse(path).getroot()
        except (ET.ParseError, OSError) as exc:
            problems.append(f"{path}: {exc}")
            continue
        suites = junit_aggregate_suites(root)
        item = {"path": str(path), "tests": 0, "failures": 0, "errors": 0, "skipped": 0, "time_seconds": 0.0}
        for suite in suites:
            item["tests"] += int(number(suite.get("tests")))
            item["failures"] += int(number(suite.get("failures")))
            item["errors"] += int(number(suite.get("errors")))
            item["skipped"] += int(number(suite.get("skipped") or suite.get("disabled")))
            item["time_seconds"] += number(suite.get("time"))
        parsed.append(item)
        for key in totals:
            totals[key] += item[key]
    totals["time_seconds"] = round(totals["time_seconds"], 3)
    return {"files": parsed, "totals": totals, "parse_problems": problems}


def lcov_summary(files: list[Path]) -> dict[str, Any]:
    totals = {"lines_found": 0, "lines_hit": 0, "functions_found": 0, "functions_hit": 0, "branches_found": 0, "branches_hit": 0}
    parsed: list[dict[str, Any]] = []
    problems: list[str] = []
    mapping = {"LF": "lines_found", "LH": "lines_hit", "FNF": "functions_found", "FNH": "functions_hit", "BRF": "branches_found", "BRH": "branches_hit"}
    for path in files:
        item = {key: 0 for key in totals}
        try:
            lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        except OSError as exc:
            problems.append(f"{path}: {exc}")
            continue
        for line in lines:
            if ":" not in line:
                continue
            key, raw = line.split(":", 1)
            if key in mapping:
                try:
                    item[mapping[key]] += int(raw.strip())
                except ValueError:
                    problems.append(f"{path}: invalid {key} value {raw!r}")
        parsed.append({"path": str(path), **item})
        for key in totals:
            totals[key] += item[key]
    def pct(hit: int, found: int) -> float | None:
        return round(hit * 100.0 / found, 2) if found else None
    percentages = {
        "lines": pct(totals["lines_hit"], totals["lines_found"]),
        "functions": pct(totals["functions_hit"], totals["functions_found"]),
        "branches": pct(totals["branches_hit"], totals["branches_found"]),
    }
    return {"files": parsed, "totals": totals, "percentages": percentages, "parse_problems": problems}


def coverage_cell(hit: int, found: int, percentage: float | None) -> str:
    rendered = f"{percentage}%" if percentage is not None else "n/a"
    return f"{hit}/{found} ({rendered})"


def markdown(data: dict[str, Any]) -> str:
    jt = data["junit"]["totals"]
    lt = data["lcov"]["totals"]
    lp = data["lcov"]["percentages"]
    lines = [
        "# Test Report Summary", "",
        "## JUnit", "",
        "| Files | Tests | Failures | Errors | Skipped | Time (s) |",
        "| ---: | ---: | ---: | ---: | ---: | ---: |",
        f"| {len(data['junit']['files'])} | {jt['tests']} | {jt['failures']} | {jt['errors']} | {jt['skipped']} | {jt['time_seconds']} |",
        "", "## LCOV", "",
        "| Files | Lines | Functions | Branches |",
        "| ---: | ---: | ---: | ---: |",
        f"| {len(data['lcov']['files'])} | {coverage_cell(lt['lines_hit'], lt['lines_found'], lp['lines'])} | {coverage_cell(lt['functions_hit'], lt['functions_found'], lp['functions'])} | {coverage_cell(lt['branches_hit'], lt['branches_found'], lp['branches'])} |",
        "", "> Coverage totals locate gaps; they do not establish release readiness.",
    ]
    problems = data["junit"]["parse_problems"] + data["lcov"]["parse_problems"]
    if problems:
        lines += ["", "## Parse problems"] + [f"- {problem}" for problem in problems]
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--junit", nargs="*", type=Path, default=[])
    parser.add_argument("--lcov", nargs="*", type=Path, default=[])
    parser.add_argument("--format", choices=("json", "markdown"), default="json")
    args = parser.parse_args()
    junit_files = iter_files(args.junit, (".xml",))
    lcov_files = iter_files(args.lcov, (".info", ".lcov"))
    data = {"junit": junit_summary(junit_files), "lcov": lcov_summary(lcov_files)}
    print(json.dumps(data, indent=2) if args.format == "json" else markdown(data), end="\n" if args.format == "json" else "")
    return 0 if not (data["junit"]["parse_problems"] or data["lcov"]["parse_problems"]) else 1


if __name__ == "__main__":
    raise SystemExit(main())
