#!/usr/bin/env python3
"""Validate the production workflow skill pack without changing target repository content."""
from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
import re
import sys
import tomllib
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import Iterable
from urllib.parse import unquote

EXPECTED_SKILLS = [
    "repository-intelligence",
    "multi-agent-work-coordinator",
    "codebase-evolution-controller",
    "verification-and-release",
    "debugging-investigator",
    "documentation-synchronizer",
    "product-design-director",
    "screenshot-to-interface",
    "production-web-builder",
    "mobile-architecture-director",
    "flutter-production-builder",
    "expo-react-native-builder",
    "review-and-refactor-code",
    "optimize-codebase-performance",
    "codebase-improvement-planner",
]

TOOLKIT_SKILLS = ["delegate-with-mission-cards", *EXPECTED_SKILLS]

MISSION_CONTROL_ROUTES = {
    "pathfinder-reader": ("gpt-5.6-luna", "max", "read-only"),
    "patcher-writer": ("gpt-5.6-luna", "max", "workspace-write"),
    "investigator-reader": ("gpt-5.6-luna", "max", "read-only"),
    "builder-writer": ("gpt-5.6-luna", "max", "workspace-write"),
    "sentinel-reader": ("gpt-5.6-sol", "high", "read-only"),
    "architect-writer": ("gpt-5.6-sol", "max", "workspace-write"),
}

REQUIRED_ROOT = [
    "README.md",
    "LICENSE",
    "THIRD_PARTY_NOTICES.md",
    "docs/responsibility-matrix.md",
    "docs/research-ledger.md",
    "docs/skill-system-design.md",
    "skills/llms.txt",
    "evaluations/README.md",
    "evaluations/routing-cases.json",
    "evaluations/overlap-cases.json",
    "evaluations/workflow-scenarios.md",
    "evaluations/adversarial-review.md",
    "evaluations/package-claim-review.md",
    "evaluations/post-install-routing-smoke.md",
]

CORE_SECTIONS = {
    "trigger boundary",
    "required inputs",
    "safety baseline",
    "workflow",
    "failure handling",
    "stop conditions",
}

BANNED_PHRASES = [
    "follow best practices",
    "todo",
    "tbd",
    "lorem ipsum",
    "insert here",
    "coming soon",
]

DESTRUCTIVE_PATTERNS = [
    r"git\s+reset\s+--hard",
    r"git\s+clean\s+-[^\n]*f",
    r"rm\s+-rf",
    r"rmdir\s+/s",
    r"shutil\.rmtree",
    r"os\.remove\(",
    r"\.unlink\(",
    r"drop\s+database",
    r"truncate\s+table",
]

NETWORK_MODULES = {"requests", "httpx", "urllib.request", "socket", "aiohttp", "ftplib"}
URL_RE = re.compile(r"https://[^\s)>]+")
MD_LINK_RE = re.compile(r"(?<!!)\[[^\]]*\]\(([^)]+)\)")
DATED_RE = re.compile(r"-(\d{4}-\d{2}-\d{2})\.md$")
NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


@dataclass
class Result:
    root: Path
    as_of: date
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)
    metrics: dict[str, object] = field(default_factory=dict)

    def error(self, message: str) -> None:
        self.errors.append(message)

    def warn(self, message: str) -> None:
        self.warnings.append(message)

    def note(self, message: str) -> None:
        self.notes.append(message)

    @property
    def passed(self) -> bool:
        return not self.errors


def rel(path: Path, root: Path) -> str:
    try:
        return path.relative_to(root).as_posix()
    except ValueError:
        return str(path)


def read_text(path: Path, result: Result) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        result.error(f"{rel(path, result.root)}: cannot read UTF-8 text: {exc}")
        return ""


def parse_frontmatter(text: str) -> tuple[dict[str, str], str, str | None]:
    if not text.startswith("---\n"):
        return {}, text, "missing opening YAML frontmatter delimiter"
    end = text.find("\n---\n", 4)
    if end < 0:
        return {}, text, "missing closing YAML frontmatter delimiter"
    raw = text[4:end]
    data: dict[str, str] = {}
    for line_no, line in enumerate(raw.splitlines(), 1):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            return {}, text, f"malformed frontmatter line {line_no}"
        key, value = line.split(":", 1)
        key, value = key.strip(), value.strip()
        if not key or key in data:
            return {}, text, f"invalid or duplicate frontmatter key on line {line_no}"
        if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
            value = value[1:-1]
        data[key] = value
    return data, text[end + 5 :], None


def markdown_headings(body: str) -> list[str]:
    return [m.group(1).strip() for m in re.finditer(r"(?m)^##\s+(.+?)\s*$", body)]


def validate_root_structure(result: Result) -> None:
    root = result.root
    for item in REQUIRED_ROOT:
        if not (root / item).is_file():
            result.error(f"missing required file: {item}")

    skills_root = root / "skills"
    if not skills_root.is_dir():
        result.error("missing skills/ directory")
        return
    actual = sorted(p.name for p in skills_root.iterdir() if p.is_dir() and not p.name.startswith("."))
    expected = sorted(TOOLKIT_SKILLS)
    missing = sorted(set(expected) - set(actual))
    unexpected = sorted(set(actual) - set(expected))
    if missing:
        result.error(f"missing skill directories: {', '.join(missing)}")
    if unexpected:
        result.error(f"unexpected skill directories: {', '.join(unexpected)}")
    result.metrics["skill_directories"] = len(actual)

    forbidden_runtime_shared = skills_root / "shared"
    if forbidden_runtime_shared.exists():
        result.error("skills/shared exists despite the documented no-hidden-runtime-coupling decision")


def validate_mission_control(result: Result) -> None:
    agents_root = result.root / "agents" / "mission-control"
    if not agents_root.is_dir():
        result.error("missing agents/mission-control directory")
        return

    actual = {path.stem: path for path in agents_root.glob("*.toml")}
    missing = sorted(set(MISSION_CONTROL_ROUTES) - set(actual))
    unexpected = sorted(set(actual) - set(MISSION_CONTROL_ROUTES))
    if missing:
        result.error(f"missing Mission Control agents: {', '.join(missing)}")
    if unexpected:
        result.error(f"unexpected Mission Control agents: {', '.join(unexpected)}")

    for name, expected in MISSION_CONTROL_ROUTES.items():
        path = actual.get(name)
        if path is None:
            continue
        try:
            data = tomllib.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, tomllib.TOMLDecodeError) as exc:
            result.error(f"{rel(path, result.root)}: invalid TOML: {exc}")
            continue
        observed = (
            data.get("model"),
            data.get("model_reasoning_effort"),
            data.get("sandbox_mode"),
        )
        if data.get("name") != name:
            result.error(f"{rel(path, result.root)}: name must match filename stem {name!r}")
        if observed != expected:
            result.error(
                f"{rel(path, result.root)}: expected model/effort/sandbox {expected!r}, got {observed!r}"
            )

    result.metrics["mission_control_agents"] = len(actual)

    pycache = list(result.root.rglob("__pycache__"))
    if pycache:
        result.warn(f"generated __pycache__ directories should be removed before packaging: {len(pycache)}")


def validate_skills(result: Result) -> dict[str, str]:
    descriptions: dict[str, str] = {}
    line_counts: dict[str, int] = {}
    word_counts: dict[str, int] = {}
    for skill in EXPECTED_SKILLS:
        skill_dir = result.root / "skills" / skill
        path = skill_dir / "SKILL.md"
        if not path.is_file():
            continue
        text = read_text(path, result)
        data, body, error = parse_frontmatter(text)
        if error:
            result.error(f"{rel(path, result.root)}: {error}")
            continue
        unknown_keys = sorted(set(data) - {"name", "description", "license", "compatibility", "metadata", "allowed-tools"})
        if unknown_keys:
            result.warn(f"{rel(path, result.root)}: unrecognized frontmatter keys: {', '.join(unknown_keys)}")
        name = data.get("name", "")
        description = data.get("description", "")
        if name != skill:
            result.error(f"{rel(path, result.root)}: frontmatter name {name!r} does not match directory {skill!r}")
        if not NAME_RE.fullmatch(name) or len(name) > 64:
            result.error(f"{rel(path, result.root)}: name violates lowercase-hyphen/64-character constraint")
        if not description:
            result.error(f"{rel(path, result.root)}: missing description")
        elif len(description) > 1024:
            result.error(f"{rel(path, result.root)}: description exceeds 1024 characters")
        else:
            descriptions[skill] = description
            if "Use when" not in description or "Do not use" not in description:
                result.error(f"{rel(path, result.root)}: description must include explicit 'Use when' and 'Do not use' routing clauses")

        lines = text.splitlines()
        words = re.findall(r"\b\w+[\w'-]*\b", body)
        line_counts[skill] = len(lines)
        word_counts[skill] = len(words)
        if len(lines) >= 500:
            result.error(f"{rel(path, result.root)}: {len(lines)} lines; keep SKILL.md below 500 lines")
        if len(words) > 4000:
            result.error(f"{rel(path, result.root)}: {len(words)} words; likely exceeds the recommended 5,000-token body")
        if not body.strip().startswith("# "):
            result.error(f"{rel(path, result.root)}: body must start with an H1 title")

        headings = markdown_headings(body)
        normalized = {re.sub(r"[`*_]", "", h).strip().lower() for h in headings}
        missing_sections = sorted(CORE_SECTIONS - normalized)
        if missing_sections:
            result.error(f"{rel(path, result.root)}: missing operational sections: {', '.join(missing_sections)}")
        if not any("handoff" in h or "interaction" in h for h in normalized):
            result.error(f"{rel(path, result.root)}: missing explicit handoff/interaction-boundary section")
        if "Use this skill" not in body and "Use this skill for" not in body:
            result.error(f"{rel(path, result.root)}: positive trigger cases are not explicit in the body")
        if "Do not trigger" not in body:
            result.error(f"{rel(path, result.root)}: negative trigger cases are not explicit in the body")
        if not re.search(r"(?i)unknown|confidence|evidence", body):
            result.error(f"{rel(path, result.root)}: body lacks an evidence/unknown/confidence discipline")
        if not re.search(r"(?i)working tree|user work|uncommitted|preserve", body):
            result.error(f"{rel(path, result.root)}: body does not explicitly preserve repository/user state")
        if re.search(r"\b\d+\.\d+\.\d+\b", body):
            result.warn(f"{rel(path, result.root)}: exact version appears in core SKILL.md; verify it is not volatile guidance")

        low = text.lower()
        for phrase in BANNED_PHRASES:
            pattern = rf"(?<![a-z]){re.escape(phrase)}(?![a-z])"
            if re.search(pattern, low):
                result.error(f"{rel(path, result.root)}: contains banned placeholder/generic phrase {phrase!r}")
        for pattern in DESTRUCTIVE_PATTERNS:
            if re.search(pattern, low):
                # Prohibitive prose may name an unsafe command. Require explicit negation nearby; scripts are stricter.
                for match in re.finditer(pattern, low):
                    nearby = low[max(0, match.start() - 100) : match.end() + 100]
                    if not re.search(r"\b(do not|never|avoid|prohibit|forbid|without)\b", nearby):
                        result.error(f"{rel(path, result.root)}: unguarded destructive command/pattern {pattern!r}")

        references = skill_dir / "references"
        scripts = skill_dir / "scripts"
        if references.is_dir() and not re.search(r"references/", body):
            result.error(f"{rel(path, result.root)}: references/ exists but SKILL.md does not intentionally route to it")
        if scripts.is_dir():
            script_files = [p for p in scripts.iterdir() if p.is_file() and p.suffix == ".py"]
            for script in script_files:
                if f"scripts/{script.name}" not in body:
                    result.error(f"{rel(path, result.root)}: helper {script.name} is not referenced with usage guidance")

        interface_path = skill_dir / "agents" / "openai.yaml"
        if not interface_path.is_file():
            result.error(f"{rel(skill_dir, result.root)}: missing recommended agents/openai.yaml")
        else:
            interface_text = read_text(interface_path, result)
            if not interface_text.startswith("interface:\n"):
                result.error(f"{rel(interface_path, result.root)}: must start with interface:")
            allowed = {"interface", "display_name", "short_description", "default_prompt"}
            seen: dict[str, str] = {}
            for line in interface_text.splitlines():
                if not line.strip():
                    continue
                if ":" not in line:
                    result.error(f"{rel(interface_path, result.root)}: malformed metadata line {line!r}")
                    continue
                key, value = line.strip().split(":", 1)
                if key not in allowed:
                    result.error(f"{rel(interface_path, result.root)}: unsupported metadata key {key!r}")
                if key != "interface":
                    value = value.strip()
                    if len(value) < 2 or value[0] != '"' or value[-1] != '"':
                        result.error(f"{rel(interface_path, result.root)}: {key} must be quoted")
                    else:
                        seen[key] = value[1:-1]
            for key in ("display_name", "short_description", "default_prompt"):
                if not seen.get(key):
                    result.error(f"{rel(interface_path, result.root)}: missing {key}")
            short = seen.get("short_description", "")
            if short and not 25 <= len(short) <= 64:
                result.error(f"{rel(interface_path, result.root)}: short_description must be 25-64 characters")
            prompt = seen.get("default_prompt", "")
            if prompt and f"${skill}" not in prompt:
                result.error(f"{rel(interface_path, result.root)}: default_prompt must mention ${skill}")

    result.metrics["skill_line_counts"] = line_counts
    result.metrics["skill_word_counts"] = word_counts
    result.metrics["catalog_description_characters"] = sum(len(x) for x in descriptions.values())
    if len(set(descriptions.values())) != len(descriptions):
        result.error("two or more skills have identical frontmatter descriptions")
    return descriptions


def normalize_link_target(raw: str) -> str:
    value = raw.strip()
    if value.startswith("<") and value.endswith(">"):
        value = value[1:-1]
    # Markdown permits an optional quoted title after a whitespace separator.
    value = re.split(r"\s+[\"']", value, maxsplit=1)[0]
    return unquote(value)


def validate_links(result: Result, generated_targets: set[Path]) -> None:
    checked = 0
    external = 0
    for md in sorted(result.root.rglob("*.md")):
        text = read_text(md, result)
        for raw in MD_LINK_RE.findall(text):
            target = normalize_link_target(raw)
            if not target or target.startswith("#") or target.startswith(("mailto:", "data:")):
                continue
            if target.startswith(("https://", "http://")):
                external += 1
                if target.startswith("http://"):
                    result.warn(f"{rel(md, result.root)}: non-TLS external link: {target}")
                continue
            local = target.split("#", 1)[0].split("?", 1)[0]
            if not local:
                continue
            resolved = (md.parent / local).resolve() if not local.startswith("/") else Path(local).resolve()
            checked += 1
            if resolved in generated_targets:
                continue
            if not resolved.exists():
                result.error(f"{rel(md, result.root)}: broken local link {target!r}")
            try:
                resolved.relative_to(result.root)
            except ValueError:
                result.error(f"{rel(md, result.root)}: local link escapes pack root: {target!r}")
    result.metrics["local_links_checked"] = checked
    result.metrics["external_markdown_links_seen"] = external


def import_names(tree: ast.AST) -> set[str]:
    names: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            names.update(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            names.add(node.module)
    return names


def validate_scripts(result: Result) -> None:
    scripts = sorted(p for p in result.root.rglob("*.py") if "__pycache__" not in p.parts)
    skill_scripts = [p for p in scripts if "skills" in p.parts]
    compiled = 0
    for path in scripts:
        text = read_text(path, result)
        try:
            compile(text, str(path), "exec")
            compiled += 1
            tree = ast.parse(text, filename=str(path))
        except SyntaxError as exc:
            result.error(f"{rel(path, result.root)}: Python syntax failure: {exc}")
            continue
        if path in skill_scripts:
            doc = ast.get_docstring(tree) or ""
            if "read-only" not in doc.lower():
                result.error(f"{rel(path, result.root)}: helper docstring must state read-only intent")
            imports = import_names(tree)
            for imported in imports:
                if any(imported == item or imported.startswith(item + ".") for item in NETWORK_MODULES):
                    result.error(f"{rel(path, result.root)}: helper imports network-capable module {imported!r}")
                top = imported.split(".", 1)[0]
                if top not in sys.stdlib_module_names and top != "__future__":
                    result.error(f"{rel(path, result.root)}: helper must remain standard-library-only; imports {imported!r}")
            low = text.lower()
            for pattern in DESTRUCTIVE_PATTERNS:
                if re.search(pattern, low):
                    result.error(f"{rel(path, result.root)}: read-only helper contains destructive pattern {pattern!r}")
            for node in ast.walk(tree):
                if isinstance(node, ast.Call):
                    func = node.func
                    name = ""
                    if isinstance(func, ast.Attribute):
                        parts: list[str] = [func.attr]
                        value = func.value
                        while isinstance(value, ast.Attribute):
                            parts.append(value.attr)
                            value = value.value
                        if isinstance(value, ast.Name):
                            parts.append(value.id)
                        name = ".".join(reversed(parts))
                    elif isinstance(func, ast.Name):
                        name = func.id
                    if name in {"open"}:
                        for kw in node.keywords:
                            if kw.arg == "mode" and isinstance(kw.value, ast.Constant) and isinstance(kw.value.value, str) and any(x in kw.value.value for x in "wax+"):
                                result.error(f"{rel(path, result.root)}: helper opens a file in write mode")
                    if name.endswith(("write_text", "write_bytes", "unlink", "rename", "mkdir", "touch")):
                        result.error(f"{rel(path, result.root)}: helper invokes mutating path method {name}")
    result.metrics["python_files_compiled"] = compiled
    result.metrics["skill_helper_scripts"] = len(skill_scripts)


def parse_label_date(text: str, label: str) -> date | None:
    match = re.search(rf"(?im)^\*\*{re.escape(label)}:\*\*\s*(\d{{4}}-\d{{2}}-\d{{2}})", text)
    if not match:
        return None
    try:
        return date.fromisoformat(match.group(1))
    except ValueError:
        return None


def validate_dated_references(result: Result, max_age_days: int) -> None:
    dated: list[Path] = []
    for path in result.root.rglob("*.md"):
        match = DATED_RE.search(path.name)
        if not match:
            continue
        dated.append(path)
        file_date = date.fromisoformat(match.group(1))
        text = read_text(path, result)
        checked = parse_label_date(text, "Information checked")
        next_review = parse_label_date(text, "Next review")
        if checked != file_date:
            result.error(f"{rel(path, result.root)}: filename date and Information checked date must match")
        if checked and (result.as_of - checked).days > max_age_days:
            result.error(f"{rel(path, result.root)}: dated evidence is {(result.as_of - checked).days} days old (limit {max_age_days})")
        if checked and checked > result.as_of:
            result.error(f"{rel(path, result.root)}: Information checked is after --as-of")
        if not next_review:
            result.error(f"{rel(path, result.root)}: missing parseable Next review date")
        elif next_review < result.as_of:
            result.error(f"{rel(path, result.root)}: Next review {next_review} has passed as of {result.as_of}")
        urls = URL_RE.findall(text)
        if len(urls) < 3:
            result.error(f"{rel(path, result.root)}: dated reference needs at least three primary source URLs")

        low = text.lower()
        if "ecosystem" in path.name:
            required = [
                "compatibility", "maintenance", "license", "security/deprecation",
                "runtime/build cost", "built-in", "choose when", "avoid when", "sources",
            ]
            for term in required:
                if term not in low:
                    result.error(f"{rel(path, result.root)}: ecosystem matrix missing field/concept {term!r}")
        if "platform-decision-matrix" in path.name:
            for term in ("option comparison", "weighted criteria", "prototype", "disqualifier", "source urls"):
                if term not in low:
                    result.error(f"{rel(path, result.root)}: platform matrix missing {term!r}")
    result.metrics["dated_references"] = len(dated)
    if len(dated) != 4:
        result.error(f"expected four dated ecosystem/platform references, found {len(dated)}")

    ledger = result.root / "docs/research-ledger.md"
    if ledger.is_file():
        text = read_text(ledger, result)
        checked = parse_label_date(text, "Information checked")
        if checked != date(2026, 7, 17):
            result.error("docs/research-ledger.md: missing or unexpected Information checked date")
        urls = URL_RE.findall(text)
        if len(urls) < 25:
            result.error(f"docs/research-ledger.md: source ledger is too sparse ({len(urls)} URLs)")
        for term in ("compatibility", "maintenance", "license", "security/deprecation", "runtime/build cost", "built-in alternative", "popularity"):
            if term.lower() not in text.lower():
                result.error(f"docs/research-ledger.md: research method omits {term!r}")
        result.metrics["research_source_urls"] = len(urls)


def validate_evaluations(result: Result) -> None:
    routing_path = result.root / "evaluations/routing-cases.json"
    overlap_path = result.root / "evaluations/overlap-cases.json"
    all_ids: list[str] = []
    positive_total = negative_total = 0
    if routing_path.is_file():
        try:
            data = json.loads(read_text(routing_path, result))
        except json.JSONDecodeError as exc:
            result.error(f"{rel(routing_path, result.root)}: invalid JSON: {exc}")
            data = {}
        entries = data.get("skills", []) if isinstance(data, dict) else []
        by_name = {entry.get("skill"): entry for entry in entries if isinstance(entry, dict)}
        if sorted(by_name) != sorted(EXPECTED_SKILLS):
            result.error(f"routing-cases.json: skill set does not exactly match the {len(EXPECTED_SKILLS)} canonical skills")
        for skill in EXPECTED_SKILLS:
            entry = by_name.get(skill, {})
            positives = entry.get("positive", []) if isinstance(entry, dict) else []
            negatives = entry.get("negative", []) if isinstance(entry, dict) else []
            positive_total += len(positives)
            negative_total += len(negatives)
            if len(positives) < 4:
                result.error(f"routing-cases.json: {skill} has fewer than four positive cases")
            if len(negatives) < 3:
                result.error(f"routing-cases.json: {skill} has fewer than three negative cases")
            for case in list(positives) + list(negatives):
                if not isinstance(case, dict):
                    result.error(f"routing-cases.json: {skill} contains a non-object case")
                    continue
                all_ids.append(str(case.get("id", "")))
                if not case.get("prompt") or not case.get("reason") or not case.get("expected"):
                    result.error(f"routing-cases.json: incomplete case in {skill}: {case.get('id')!r}")
        if "" in all_ids or len(all_ids) != len(set(all_ids)):
            result.error("routing-cases.json: case IDs must be non-empty and unique")

    if overlap_path.is_file():
        try:
            data = json.loads(read_text(overlap_path, result))
        except json.JSONDecodeError as exc:
            result.error(f"{rel(overlap_path, result.root)}: invalid JSON: {exc}")
            data = {}
        cases = data.get("cases", []) if isinstance(data, dict) else []
        if len(cases) < len(EXPECTED_SKILLS):
            result.error(f"overlap-cases.json: need at least {len(EXPECTED_SKILLS)} cross-skill ambiguity cases")
        for case in cases:
            if not isinstance(case, dict) or not all(case.get(k) for k in ("id", "prompt", "expected_sequence", "primary_decision", "anti_route")):
                result.error(f"overlap-cases.json: incomplete overlap case {case!r}")

    workflow = result.root / "evaluations/workflow-scenarios.md"
    if workflow.is_file():
        text = read_text(workflow, result)
        for index, skill in enumerate(EXPECTED_SKILLS, 1):
            if not re.search(rf"(?m)^##\s+{index}\.\s+`{re.escape(skill)}`(?:\s|—|-)", text):
                result.error(f"workflow-scenarios.md: missing numbered scenario for {skill}")
        for term in ("Expected workflow", "Expected artifacts", "Verification", "Stop/escalate"):
            if text.count(f"**{term}:**") < len(EXPECTED_SKILLS):
                result.error(f"workflow-scenarios.md: fewer than {len(EXPECTED_SKILLS)} {term!r} blocks")

    post_install = result.root / "evaluations/post-install-routing-smoke.md"
    if post_install.is_file():
        text = read_text(post_install, result)
        for skill in EXPECTED_SKILLS:
            if f"`{skill}`" not in text:
                result.error(f"post-install-routing-smoke.md: missing route for {skill}")
        if text.count("| R") < len(EXPECTED_SKILLS) or text.count("| O") < 4:
            result.error(f"post-install-routing-smoke.md: needs at least {len(EXPECTED_SKILLS)} primary and 4 overlap cases")

    result.metrics["positive_trigger_cases"] = positive_total
    result.metrics["negative_trigger_cases"] = negative_total


def validate_responsibility_and_provenance(result: Result) -> None:
    matrix = result.root / "docs/responsibility-matrix.md"
    if matrix.is_file():
        text = read_text(matrix, result)
        for skill in EXPECTED_SKILLS:
            if text.count(f"`{skill}`") < 1:
                result.error(f"docs/responsibility-matrix.md: missing {skill}")
        for header in ("Primary trigger", "Non-trigger", "Required inputs", "Output", "Owned decisions", "Handoffs", "Expected verification"):
            if header not in text:
                result.error(f"docs/responsibility-matrix.md: missing column {header!r}")

    notice = result.root / "THIRD_PARTY_NOTICES.md"
    if notice.is_file():
        text = read_text(notice, result)
        required = [
            "Copyright (c) 2026 Leonxlnx",
            "Permission is hereby granted, free of charge",
            "THE SOFTWARE IS PROVIDED \"AS IS\"",
            "skills/taste-skill/SKILL.md",
            "skills/redesign-skill/SKILL.md",
            "skills/image-to-code-skill/SKILL.md",
            "skills/product-design-director/SKILL.md",
            "skills/screenshot-to-interface/SKILL.md",
            "No endorsement by Leonxlnx is stated or implied",
            "Meaningful modifications include",
        ]
        for phrase in required:
            if phrase not in text:
                result.error(f"THIRD_PARTY_NOTICES.md: missing required notice/provenance text {phrase!r}")

    license_path = result.root / "LICENSE"
    if license_path.is_file():
        text = read_text(license_path, result)
        for phrase in ("MIT License", "Copyright (c) 2026 cmdr-chara", "Permission is hereby granted"):
            if phrase not in text:
                result.error(f"LICENSE: missing target toolkit MIT text {phrase!r}")


def extract_paragraphs(body: str) -> Iterable[str]:
    in_fence = False
    current: list[str] = []
    for line in body.splitlines():
        if line.strip().startswith("```"):
            in_fence = not in_fence
            if current:
                yield " ".join(current)
                current = []
            continue
        if in_fence or line.startswith("#") or re.match(r"^\s*(?:[-*+] |\d+\. )", line):
            if current:
                yield " ".join(current)
                current = []
            continue
        if not line.strip():
            if current:
                yield " ".join(current)
                current = []
        else:
            current.append(line.strip())
    if current:
        yield " ".join(current)


def validate_duplication(result: Result) -> None:
    occurrences: dict[str, list[str]] = defaultdict(list)
    for skill in EXPECTED_SKILLS:
        path = result.root / "skills" / skill / "SKILL.md"
        if not path.is_file():
            continue
        text = read_text(path, result)
        _, body, _ = parse_frontmatter(text)
        for paragraph in extract_paragraphs(body):
            normalized = re.sub(r"\s+", " ", paragraph).strip().lower()
            if len(normalized.split()) >= 20:
                occurrences[normalized].append(skill)
    duplicates = {p: skills for p, skills in occurrences.items() if len(set(skills)) > 1}
    for paragraph, skills in duplicates.items():
        preview = paragraph[:120] + ("…" if len(paragraph) > 120 else "")
        result.error(f"duplicated long paragraph across {sorted(set(skills))}: {preview}")
    result.metrics["duplicated_long_paragraphs"] = len(duplicates)


def validate_catalog(result: Result, descriptions: dict[str, str]) -> None:
    path = result.root / "skills" / "llms.txt"
    if not path.is_file():
        return
    lines = [line.strip() for line in read_text(path, result).splitlines() if line.strip()]
    if len(lines) != len(TOOLKIT_SKILLS):
        result.error(f"skills/llms.txt: expected {len(TOOLKIT_SKILLS)} non-empty lines, found {len(lines)}")
    names: list[str] = []
    for line in lines:
        if ":" not in line:
            result.error(f"skills/llms.txt: malformed line {line!r}")
            continue
        name, summary = line.split(":", 1)
        names.append(name.strip())
        if not summary.strip():
            result.error(f"skills/llms.txt: empty summary for {name.strip()}")
    if names != TOOLKIT_SKILLS:
        result.error("skills/llms.txt: order/names must match the canonical toolkit order")
    if descriptions and sum(len(x) for x in descriptions.values()) > 8000:
        result.warn("combined descriptions exceed the documented 8,000-character fallback catalog budget")


def validate_conditional_decisions(result: Result) -> None:
    mobile = read_text(result.root / "skills/mobile-architecture-director/SKILL.md", result)
    for term in ("must-have", "disqual", "weight", "prototype", "sensitivity", "reconsider"):
        if term.lower() not in mobile.lower():
            result.error(f"mobile-architecture-director: missing conditional evidence concept {term!r}")
    for skill in ("flutter-production-builder", "expo-react-native-builder"):
        text = read_text(result.root / "skills" / skill / "SKILL.md", result)
        if "Do not trigger" not in text or "mobile-architecture-director" not in text:
            result.error(f"{skill}: must reject unresolved cross-platform selection")
        if not re.search(r"(?i)built-in|existing|repository convention", text):
            result.error(f"{skill}: package decisions do not visibly prefer built-in/existing capabilities when sufficient")
    web = read_text(result.root / "skills/production-web-builder/SKILL.md", result)
    for term in ("Do not start with a package list", "built-in", "compatibility", "license", "security"):
        if term.lower() not in web.lower():
            result.error(f"production-web-builder: missing conditional package decision concept {term!r}")


def write_report(result: Result, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    status = "PASS" if result.passed else "FAIL"
    lines = [
        "# Validation Report",
        "",
        f"**Status:** {status}  ",
        f"**As-of date:** {result.as_of.isoformat()}  ",
        f"**Validator:** `scripts/validate_skill_pack.py`  ",
        "",
        "## Summary",
        "",
        f"- Errors: {len(result.errors)}",
        f"- Warnings: {len(result.warnings)}",
        f"- Skills: {result.metrics.get('skill_directories', 0)}",
        f"- Positive trigger cases: {result.metrics.get('positive_trigger_cases', 0)}",
        f"- Negative trigger cases: {result.metrics.get('negative_trigger_cases', 0)}",
        f"- Python files compiled: {result.metrics.get('python_files_compiled', 0)}",
        f"- Dated references: {result.metrics.get('dated_references', 0)}",
        f"- Research source URLs: {result.metrics.get('research_source_urls', 0)}",
        f"- Local links checked: {result.metrics.get('local_links_checked', 0)}",
        f"- Duplicated long paragraphs: {result.metrics.get('duplicated_long_paragraphs', 0)}",
        "",
        "## Metrics",
        "",
        "```json",
        json.dumps(result.metrics, indent=2, sort_keys=True),
        "```",
        "",
    ]
    for title, items in (("Errors", result.errors), ("Warnings", result.warnings), ("Notes", result.notes)):
        lines += [f"## {title}", ""]
        if items:
            lines.extend(f"- {item}" for item in items)
        else:
            lines.append("- None")
        lines.append("")
    lines += [
        "## Interpretation",
        "",
        "A structural pass confirms pack shape, routing/evaluation coverage, local resources, dated-evidence fields, script syntax/safety heuristics, and provenance text. It does not replace model-routing trials, real repository integration, browser/device tests, current registry/advisory checks, or store review.",
        "",
    ]
    target.write_text("\n".join(lines), encoding="utf-8")


def manifest_digest(root: Path) -> str:
    """Digest authored content while excluding generated integrity files."""
    digest = hashlib.sha256()
    excluded = {"MANIFEST.sha256", "validation/VALIDATION_REPORT.md"}
    for path in sorted(p for p in root.rglob("*") if p.is_file() and "__pycache__" not in p.parts):
        relative = path.relative_to(root).as_posix()
        if relative in excluded:
            continue
        digest.update(relative.encode())
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".", help="skill-pack root")
    parser.add_argument("--as-of", default=date.today().isoformat(), help="validation date (YYYY-MM-DD)")
    parser.add_argument("--max-reference-age", type=int, default=180, help="maximum age for dated evidence")
    parser.add_argument("--json", action="store_true", help="emit machine-readable result")
    parser.add_argument("--report", help="write Markdown report relative to root or as an absolute path")
    args = parser.parse_args()

    try:
        as_of = date.fromisoformat(args.as_of)
    except ValueError:
        parser.error("--as-of must be YYYY-MM-DD")
    root = Path(args.root).expanduser().resolve()
    if not root.is_dir():
        parser.error("root must be a directory")
    if args.max_reference_age < 1:
        parser.error("--max-reference-age must be positive")

    result = Result(root=root, as_of=as_of)
    report_target: Path | None = None
    generated_targets: set[Path] = set()
    if args.report:
        report_target = Path(args.report).expanduser()
        if not report_target.is_absolute():
            report_target = root / report_target
        report_target = report_target.resolve()
        generated_targets.add(report_target)

    validate_root_structure(result)
    validate_mission_control(result)
    descriptions = validate_skills(result)
    validate_links(result, generated_targets)
    validate_scripts(result)
    validate_dated_references(result, args.max_reference_age)
    validate_evaluations(result)
    validate_responsibility_and_provenance(result)
    validate_duplication(result)
    validate_catalog(result, descriptions)
    validate_conditional_decisions(result)
    result.metrics["pack_digest_excluding_generated_integrity_files"] = manifest_digest(root)
    result.note("Structural validation cannot prove model routing precision; run the supplied routing cases in the target Codex client.")
    result.note("Current package/store claims remain dated evidence and must be resolved against the target repository and current primary sources.")

    if report_target:
        try:
            report_target.relative_to(root)
        except ValueError:
            result.error("--report target must be inside the pack root")
        else:
            write_report(result, report_target)

    payload = {
        "status": "PASS" if result.passed else "FAIL",
        "as_of": result.as_of.isoformat(),
        "errors": result.errors,
        "warnings": result.warnings,
        "notes": result.notes,
        "metrics": result.metrics,
        "report": rel(report_target, root) if report_target else None,
    }
    if args.json:
        print(json.dumps(payload, indent=2, sort_keys=True))
    else:
        print(f"{payload['status']}: {len(result.errors)} error(s), {len(result.warnings)} warning(s)")
        for message in result.errors:
            print(f"ERROR: {message}")
        for message in result.warnings:
            print(f"WARNING: {message}")
        for message in result.notes:
            print(f"NOTE: {message}")
    return 0 if result.passed else 1


if __name__ == "__main__":
    raise SystemExit(main())