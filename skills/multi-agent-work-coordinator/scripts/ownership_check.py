#!/usr/bin/env python3
"""Read-only checker for overlapping writer scopes in a work-graph JSON file."""
from __future__ import annotations

import argparse
import fnmatch
import json
import re
import sys
from pathlib import Path, PurePosixPath
from typing import Any

GLOB_CHARS = re.compile(r"[*?[{]")
WINDOWS_ABSOLUTE_PATH = re.compile(r"^[A-Za-z]:/")


def normalize(raw: str) -> str:
    value = raw.strip().replace("\\", "/")
    if value.startswith("/") or WINDOWS_ABSOLUTE_PATH.match(value):
        raise ValueError(f"absolute scope is not repository-relative: {raw!r}")
    while value.startswith("./"):
        value = value[2:]
    value = re.sub(r"/+", "/", value).rstrip("/")
    if not value or value == "." or value.startswith("../") or "/../" in f"/{value}/":
        raise ValueError(f"unsafe or empty repository-relative scope: {raw!r}")
    return value


def static_prefix(pattern: str) -> str:
    parts: list[str] = []
    for part in PurePosixPath(pattern).parts:
        if GLOB_CHARS.search(part):
            break
        parts.append(part)
    return "/".join(parts)


def is_literal(pattern: str) -> bool:
    return GLOB_CHARS.search(pattern) is None


def literal_contains(parent: str, child: str) -> bool:
    return child == parent or child.startswith(parent.rstrip("/") + "/")


def patterns_overlap(a: str, b: str) -> tuple[bool, str]:
    if a == b:
        return True, "identical scope"
    if is_literal(a) and is_literal(b):
        if literal_contains(a, b) or literal_contains(b, a):
            return True, "one literal scope contains the other"
        return False, ""
    if is_literal(a) and fnmatch.fnmatchcase(a, b):
        return True, "literal path matches peer glob"
    if is_literal(b) and fnmatch.fnmatchcase(b, a):
        return True, "literal path matches peer glob"
    pa, pb = static_prefix(a), static_prefix(b)
    if not pa or not pb:
        return True, "broad glob has no exclusive static prefix"
    if literal_contains(pa, pb) or literal_contains(pb, pa):
        return True, "glob static prefixes overlap conservatively"
    return False, ""


def load_plan(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"cannot read valid JSON: {exc}") from exc
    if not isinstance(data, dict) or not isinstance(data.get("missions"), list):
        raise ValueError("root must be an object containing a missions array")
    return data


def validate_graph(data: dict[str, Any]) -> list[dict[str, str]]:
    issues: list[dict[str, str]] = []
    missions = data["missions"]
    ids: set[str] = set()
    writers: list[tuple[str, list[str]]] = []

    for index, mission in enumerate(missions):
        if not isinstance(mission, dict):
            issues.append({"type": "schema", "mission": str(index), "detail": "mission is not an object"})
            continue
        mid = mission.get("id")
        if not isinstance(mid, str) or not mid.strip():
            issues.append({"type": "schema", "mission": str(index), "detail": "missing non-empty id"})
            continue
        if mid in ids:
            issues.append({"type": "schema", "mission": mid, "detail": "duplicate mission id"})
        ids.add(mid)
        kind = mission.get("kind", "writer" if mission.get("write_scope") else "reader")
        raw_scopes = mission.get("write_scope", [])
        if not isinstance(raw_scopes, list) or any(not isinstance(x, str) for x in raw_scopes):
            issues.append({"type": "schema", "mission": mid, "detail": "write_scope must be an array of strings"})
            continue
        try:
            scopes = [normalize(x) for x in raw_scopes]
        except ValueError as exc:
            issues.append({"type": "schema", "mission": mid, "detail": str(exc)})
            continue
        if kind == "reader" and scopes:
            issues.append({"type": "schema", "mission": mid, "detail": "reader has non-empty write_scope"})
        if kind == "writer" and not scopes:
            issues.append({"type": "schema", "mission": mid, "detail": "writer has no write_scope"})
        if scopes:
            writers.append((mid, scopes))

    for mission in missions:
        if not isinstance(mission, dict) or not isinstance(mission.get("id"), str):
            continue
        deps = mission.get("dependencies", [])
        if not isinstance(deps, list) or any(not isinstance(x, str) for x in deps):
            issues.append({"type": "schema", "mission": mission["id"], "detail": "dependencies must be an array of IDs"})
            continue
        for dep in deps:
            if dep not in ids:
                issues.append({"type": "dependency", "mission": mission["id"], "detail": f"unknown dependency {dep}"})
            if dep == mission["id"]:
                issues.append({"type": "dependency", "mission": mission["id"], "detail": "self dependency"})

    for i, (left_id, left_scopes) in enumerate(writers):
        for right_id, right_scopes in writers[i + 1 :]:
            for left in left_scopes:
                for right in right_scopes:
                    overlap, reason = patterns_overlap(left, right)
                    if overlap:
                        issues.append({
                            "type": "write-overlap", "mission": f"{left_id},{right_id}",
                            "detail": f"{left!r} vs {right!r}: {reason}",
                        })

    raw_single = data.get("single_owner_surfaces", [])
    if not isinstance(raw_single, list) or any(not isinstance(x, str) for x in raw_single):
        issues.append({"type": "schema", "mission": "[root]", "detail": "single_owner_surfaces must be an array of strings"})
    else:
        try:
            singles = [normalize(x) for x in raw_single]
        except ValueError as exc:
            issues.append({"type": "schema", "mission": "[root]", "detail": str(exc)})
            singles = []
        for single in singles:
            owners: list[str] = []
            for mid, scopes in writers:
                if any(patterns_overlap(single, scope)[0] for scope in scopes):
                    owners.append(mid)
            if len(owners) > 1:
                issues.append({"type": "single-owner", "mission": ",".join(owners), "detail": f"{single!r} has multiple candidate owners"})

    # Cycle check for valid IDs.
    graph: dict[str, list[str]] = {}
    for m in missions:
        if isinstance(m, dict) and isinstance(m.get("id"), str) and isinstance(m.get("dependencies", []), list):
            graph[m["id"]] = [d for d in m.get("dependencies", []) if isinstance(d, str) and d in ids]
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(node: str, chain: list[str]) -> None:
        if node in visiting:
            issues.append({"type": "dependency-cycle", "mission": node, "detail": " -> ".join(chain + [node])})
            return
        if node in visited:
            return
        visiting.add(node)
        for dep in graph.get(node, []):
            visit(dep, chain + [node])
        visiting.remove(node)
        visited.add(node)

    for mid in graph:
        visit(mid, [])
    return issues


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plan", type=Path, help="work-graph JSON file")
    parser.add_argument("--json", action="store_true", help="emit machine-readable result")
    args = parser.parse_args()
    try:
        data = load_plan(args.plan)
        issues = validate_graph(data)
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    result = {"valid": not issues, "issue_count": len(issues), "issues": issues}
    if args.json:
        print(json.dumps(result, indent=2))
    elif issues:
        print(f"OWNERSHIP CHECK FAILED ({len(issues)} issue(s))")
        for issue in issues:
            print(f"- [{issue['type']}] {issue['mission']}: {issue['detail']}")
    else:
        print("OWNERSHIP CHECK PASSED")
    return 0 if not issues else 1


if __name__ == "__main__":
    raise SystemExit(main())
