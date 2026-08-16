#!/usr/bin/env python3
"""Run reproducible, network-free smoke tests for the skill-pack helpers.

The harness creates disposable synthetic repositories, executes every deterministic
skill helper, checks semantic outputs, and verifies that fixture inputs were not
modified. Run `validate_skill_pack.py` separately for structural validation. It never
invokes package managers, Git mutation, browser runtimes, mobile toolchains, or
network services.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any


@dataclass
class CommandResult:
    name: str
    command: list[str]
    returncode: int
    stdout: str
    stderr: str


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def write_json(path: Path, value: Any) -> None:
    write_text(path, json.dumps(value, indent=2, sort_keys=True) + "\n")



def remove_generated_tree(root: Path) -> None:
    """Remove only the workspace created by this process."""
    if not root.exists():
        return
    for directory, dirnames, filenames in os.walk(root, topdown=False):
        current = Path(directory)
        for filename in filenames:
            (current / filename).unlink(missing_ok=True)
        for dirname in dirnames:
            child = current / dirname
            if child.is_symlink():
                child.unlink(missing_ok=True)
            else:
                child.rmdir()
    root.rmdir()


def fixture_digest(root: Path) -> str:
    digest = hashlib.sha256()
    for path in sorted(p for p in root.rglob("*") if p.is_file()):
        relative = path.relative_to(root).as_posix()
        digest.update(relative.encode("utf-8"))
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def build_fixtures(base: Path) -> dict[str, Path]:
    fixtures = base / "fixtures"
    outputs = base / "outputs"
    outputs.mkdir(parents=True, exist_ok=True)

    repo = fixtures / "repository"
    write_json(
        repo / "package.json",
        {
            "name": "sample-monorepo",
            "private": True,
            "workspaces": ["apps/*", "packages/*"],
            "scripts": {"lint": "oxlint .", "typecheck": "tsc --noEmit", "test": "vitest run"},
            "dependencies": {"react": "0.0.0-fixture", "zod": "0.0.0-fixture"},
            "devDependencies": {"typescript": "0.0.0-fixture", "oxlint": "0.0.0-fixture"},
        },
    )
    write_json(
        repo / "tsconfig.json",
        {
            "compilerOptions": {
                "strict": True,
                "noImplicitAny": True,
                "useUnknownInCatchVariables": True,
                "noUncheckedIndexedAccess": False,
                "exactOptionalPropertyTypes": False,
            }
        },
    )
    write_text(repo / "oxlint.config.ts", "export default { rules: {} };\n")
    write_text(
        repo / "packages/auth/src/unsafe.ts",
        """type User = { id: string };
export function decode(input: unknown): unknown {
  // Fixture intentionally contains quality signals for the read-only scanner.
  const user = input as unknown as User;
  const metadata: Record<string, unknown> = {};
  Reflect.get(metadata, "id");
  return user;
}
vi.mock("./user-store");
""",
    )
    write_text(
        repo / "pyproject.toml",
        "[project]\nname = \"sample-service\"\nversion = \"0.1.0\"\nrequires-python = \">=3.12\"\n\n[tool.pytest.ini_options]\naddopts = \"-q\"\n",
    )
    write_text(repo / "CODEOWNERS", "/services/api/ @api-team\n/apps/web/ @web-team\n")
    write_text(
        repo / ".github/workflows/ci.yml",
        "name: ci\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo test\n",
    )
    write_text(repo / "deploy/k8s/deployment.yaml", "apiVersion: apps/v1\nkind: Deployment\n")
    write_text(repo / "openapi/api.yaml", "openapi: 3.1.0\ninfo:\n  title: Demo\n  version: 1.0.0\n")
    write_text(repo / "tests/test_api.py", "def test_health():\n    assert True\n")
    write_text(repo / "apps/web/src/page.tsx", "export default function Page(){return <main>Demo</main>}\n")
    write_text(repo / "packages/auth/src/tokens.ts", "export const tokenTtl = 3600;\n")
    write_text(repo / "services/api/src/server.py", "def health():\n    return {'ok': True}\n")

    web = fixtures / "web"
    write_json(
        web / "package.json",
        {
            "name": "web-demo",
            "private": True,
            "packageManager": "pnpm@0.0.0-fixture",
            "engines": {"node": ">=22"},
            "scripts": {"build": "next build", "test": "vitest", "e2e": "playwright test"},
            "dependencies": {
                "next": "0.0.0-fixture",
                "react": "0.0.0-fixture",
                "react-dom": "0.0.0-fixture",
                "zod": "0.0.0-fixture",
            },
            "devDependencies": {"@playwright/test": "0.0.0-fixture", "vitest": "0.0.0-fixture"},
        },
    )
    write_text(web / "app/page.tsx", "export default function Page(){return <main>Smoke</main>}\n")
    write_text(web / "next.config.ts", "export default {};\n")
    write_text(web / "playwright.config.ts", "export default {};\n")

    flutter = fixtures / "flutter"
    write_text(
        flutter / "pubspec.yaml",
        """name: demo_app
environment:
  sdk: \">=0.0.0 <100.0.0\"
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: 0.0.0-fixture
  go_router: 0.0.0-fixture
dev_dependencies:
  flutter_test:
    sdk: flutter
  build_runner: 0.0.0-fixture
""",
    )
    write_text(flutter / "pubspec.lock", "packages: {}\n")
    write_text(flutter / "lib/main.dart", "void main() {}\n")
    write_text(flutter / "test/widget_test.dart", "void main() {}\n")
    write_text(flutter / "android/app/src/main/AndroidManifest.xml", "<manifest />\n")
    write_text(flutter / "ios/Runner/Info.plist", "<?xml version=\"1.0\"?><plist />\n")

    expo = fixtures / "expo"
    write_json(
        expo / "package.json",
        {
            "name": "expo-demo",
            "scripts": {"start": "expo start", "test": "jest"},
            "dependencies": {
                "expo": "0.0.0-fixture",
                "expo-router": "0.0.0-fixture",
                "expo-sqlite": "0.0.0-fixture",
                "react": "0.0.0-fixture",
                "react-native": "0.0.0-fixture",
                "react-native-reanimated": "0.0.0-fixture",
            },
            "devDependencies": {"jest-expo": "0.0.0-fixture"},
        },
    )
    write_json(
        expo / "app.json",
        {
            "expo": {
                "name": "Demo",
                "slug": "demo",
                "plugins": ["expo-router", "expo-sqlite"],
                "runtimeVersion": {"policy": "appVersion"},
            }
        },
    )
    write_json(expo / "eas.json", {"build": {"production": {}}, "submit": {}})
    write_text(expo / "app/_layout.tsx", "export default function Layout(){return null}\n")
    write_text(expo / "app/index.tsx", "export default function Screen(){return null}\n")
    write_text(expo / "__tests__/home.test.tsx", "test('smoke', () => expect(true).toBe(true));\n")

    reports = fixtures / "reports"
    write_text(
        reports / "junit.xml",
        """<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="smoke" tests="3" failures="1" errors="0" skipped="1" time="1.25">
  <testcase classname="demo" name="passes" time="0.25" />
  <testcase classname="demo" name="fails" time="0.50"><failure message="expected failure" /></testcase>
  <testcase classname="demo" name="skips" time="0.50"><skipped /></testcase>
</testsuite>
""",
    )
    write_text(
        reports / "lcov.info",
        """TN:
SF:src/demo.ts
FNF:2
FNH:2
BRF:4
BRH:3
LF:10
LH:8
end_of_record
""",
    )

    ownership = fixtures / "ownership"
    write_json(
        ownership / "valid.json",
        {
            "missions": [
                {"id": "api", "write_scope": ["services/api/**"]},
                {"id": "web", "write_scope": ["apps/web/**"]},
                {"id": "schema", "write_scope": ["openapi/api.yaml", "generated/**"]},
            ]
        },
    )
    write_json(
        ownership / "conflict.json",
        {
            "missions": [
                {"id": "api", "write_scope": ["services/**", "openapi/**"]},
                {"id": "web", "write_scope": ["apps/web/**", "openapi/api.yaml"]},
            ]
        },
    )

    return {
        "fixtures": fixtures,
        "outputs": outputs,
        "repo": repo,
        "web": web,
        "flutter": flutter,
        "expo": expo,
        "reports": reports,
        "ownership": ownership,
    }


def run_command(name: str, command: list[str], expected_codes: set[int]) -> CommandResult:
    print(f"[smoke] running {name}", file=sys.stderr, flush=True)
    completed = subprocess.run(command, text=True, capture_output=True, check=False)
    print(f"[smoke] completed {name} with exit {completed.returncode}", file=sys.stderr, flush=True)
    result = CommandResult(name, command, completed.returncode, completed.stdout, completed.stderr)
    if completed.returncode not in expected_codes:
        rendered = " ".join(command)
        raise AssertionError(
            f"{name} returned {completed.returncode}, expected {sorted(expected_codes)}: {rendered}\n{completed.stderr}"
        )
    return result


def parse_json_output(result: CommandResult) -> Any:
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise AssertionError(f"{result.name} did not emit valid JSON: {exc}\n{result.stdout}") from exc


def contains_surface(doc_result: dict[str, Any], surface: str) -> bool:
    return surface in doc_result.get("surface_summary", {})


def execute(pack_root: Path, as_of: str, workspace: Path) -> dict[str, Any]:
    paths = build_fixtures(workspace)
    fixtures = paths["fixtures"]
    before = fixture_digest(fixtures)
    py = sys.executable

    scripts = {
        "repository_inventory": pack_root / "skills/repository-intelligence/scripts/repo_signal_scan.py",
        "manifest_inventory": pack_root / "skills/codebase-evolution-controller/scripts/manifest_inventory.py",
        "documentation_mapping": pack_root / "skills/documentation-synchronizer/scripts/doc_drift_scan.py",
        "test_report_summary": pack_root / "skills/verification-and-release/scripts/summarize_test_reports.py",
        "ownership_check": pack_root / "skills/multi-agent-work-coordinator/scripts/ownership_check.py",
        "web_inventory": pack_root / "skills/production-web-builder/scripts/web_project_inventory.py",
        "flutter_inventory": pack_root / "skills/flutter-production-builder/scripts/flutter_project_inventory.py",
        "expo_inventory": pack_root / "skills/expo-react-native-builder/scripts/expo_project_inventory.py",
        "typescript_quality_inventory": pack_root / "skills/typescript-quality-enforcer/scripts/typescript_quality_inventory.py",
    }
    missing = [str(path) for path in scripts.values() if not path.is_file()]
    if missing:
        raise AssertionError(f"missing scripts: {missing}")

    commands: list[CommandResult] = []
    commands.append(run_command("repository_inventory", [py, str(scripts["repository_inventory"]), str(paths["repo"]), "--format", "json"], {0}))
    commands.append(run_command("manifest_inventory", [py, str(scripts["manifest_inventory"]), str(paths["repo"]), "--format", "json"], {0}))
    commands.append(
        run_command(
            "documentation_mapping",
            [
                py,
                str(scripts["documentation_mapping"]),
                str(paths["repo"]),
                "--files",
                "deploy/k8s/deployment.yaml",
                "openapi/api.yaml",
                "packages/auth/src/tokens.ts",
                "--format",
                "json",
            ],
            {0},
        )
    )
    commands.append(
        run_command(
            "test_report_summary",
            [
                py,
                str(scripts["test_report_summary"]),
                "--junit",
                str(paths["reports"] / "junit.xml"),
                "--lcov",
                str(paths["reports"] / "lcov.info"),
                "--format",
                "json",
            ],
            {0},
        )
    )
    commands.append(run_command("ownership_valid", [py, str(scripts["ownership_check"]), str(paths["ownership"] / "valid.json"), "--json"], {0}))
    commands.append(run_command("ownership_conflict", [py, str(scripts["ownership_check"]), str(paths["ownership"] / "conflict.json"), "--json"], {1}))
    commands.append(run_command("web_inventory", [py, str(scripts["web_inventory"]), str(paths["web"]), "--format", "json"], {0}))
    commands.append(run_command("flutter_inventory", [py, str(scripts["flutter_inventory"]), str(paths["flutter"]), "--format", "json"], {0}))
    commands.append(run_command("expo_inventory", [py, str(scripts["expo_inventory"]), str(paths["expo"]), "--format", "json"], {0}))
    commands.append(run_command("typescript_quality_inventory", [py, str(scripts["typescript_quality_inventory"]), str(paths["repo"]), "--format", "json"], {0}))

    parsed = {item.name: parse_json_output(item) for item in commands}
    assertions: list[str] = []

    def check(condition: bool, label: str) -> None:
        if not condition:
            raise AssertionError(label)
        assertions.append(label)

    check("CODEOWNERS" in parsed["repository_inventory"]["ownership_signals"], "repository scanner detects ownership signal")
    check(".github/workflows/ci.yml" in parsed["repository_inventory"]["ci_and_automation"], "repository scanner detects CI")
    check(any(item["name"] == "package.json" for item in parsed["manifest_inventory"]["manifests"]), "manifest inventory parses package.json")
    check(contains_surface(parsed["documentation_mapping"], "API/schema reference and generated-client source"), "documentation mapper flags API reference")
    check(contains_surface(parsed["documentation_mapping"], "operations and rollback runbook"), "documentation mapper flags operations runbook")
    junit = parsed["test_report_summary"]["junit"]["totals"]
    lcov = parsed["test_report_summary"]["lcov"]["totals"]
    check(junit == {"tests": 3, "failures": 1, "errors": 0, "skipped": 1, "time_seconds": 1.25}, "JUnit aggregation preserves totals")
    check(lcov["lines_found"] == 10 and lcov["lines_hit"] == 8, "LCOV aggregation preserves line totals")
    check(parsed["ownership_valid"] == {"valid": True, "issue_count": 0, "issues": []}, "non-overlapping ownership plan passes")
    check(parsed["ownership_conflict"]["valid"] is False and parsed["ownership_conflict"]["issue_count"] >= 1, "overlapping ownership plan fails with evidence")
    web_packages = parsed["web_inventory"]["package_manifests"][0]["selected_dependencies"]
    check(web_packages["next"]["range"] == "0.0.0-fixture", "web inventory reports manifest value without recommending it")
    flutter_pubspec = parsed["flutter_inventory"]["pubspecs"][0]
    check(flutter_pubspec["environment"] == {"sdk": ">=0.0.0 <100.0.0"}, "Flutter parser keeps environment section bounded")
    check("flutter_test" in flutter_pubspec["dev_dependencies"] and "flutter_riverpod" not in flutter_pubspec["dev_dependencies"], "Flutter parser separates dependency sections")
    check(set(parsed["flutter_inventory"]["platform_directories"]) == {"android", "ios"}, "Flutter inventory detects platform directories")
    check(parsed["expo_inventory"]["eas"]["build_profiles"] == ["production"], "Expo inventory detects EAS build profile")
    check(parsed["expo_inventory"]["route_signals"] == ["app"], "Expo inventory detects router signal")

    ts_quality = parsed["typescript_quality_inventory"]
    check(ts_quality["package"]["tool_dependencies"]["typescript"] == "0.0.0-fixture", "TypeScript quality inventory reports manifest TypeScript without recommending a version")
    check(ts_quality["package"]["tool_dependencies"]["oxlint"] == "0.0.0-fixture", "TypeScript quality inventory detects existing Oxlint")
    check(ts_quality["tsconfigs"][0]["strict"] is True and ts_quality["tsconfigs"][0]["noUncheckedIndexedAccess"] is False, "TypeScript quality inventory records compiler enforcement state")
    quality_counts = ts_quality["heuristic_counts"]
    check(quality_counts["chained_assertion"] >= 1, "TypeScript quality inventory detects chained assertion signal")
    check(quality_counts["module_mock"] >= 1, "TypeScript quality inventory detects module-mocking signal")
    check(quality_counts["unsafe_record"] >= 1, "TypeScript quality inventory detects unsafe dictionary signal")
    check(quality_counts["reflect_get"] >= 1, "TypeScript quality inventory detects reflection signal")
    check("Heuristic text signals only" in ts_quality["disclaimer"], "TypeScript quality inventory labels heuristic evidence limits")

    after = fixture_digest(fixtures)
    check(before == after, "all helper executions preserve fixture inputs byte-for-byte")

    command_summary = [
        {
            "name": item.name,
            "returncode": item.returncode,
            "expected_nonzero": item.name == "ownership_conflict",
            "stderr": item.stderr.strip(),
        }
        for item in commands
    ]
    return {
        "status": "PASS",
        "as_of": as_of,
        "pack_root": str(pack_root),
        "commands": command_summary,
        "assertion_count": len(assertions),
        "assertions": assertions,
        "fixture_digest_before": before,
        "fixture_digest_after": after,
        "read_only_fixture_check": before == after,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=Path(__file__).resolve().parents[1], help="skill-pack root")
    parser.add_argument("--as-of", default=date.today().isoformat(), help="validation date (YYYY-MM-DD)")
    parser.add_argument("--json", action="store_true", help="emit machine-readable results")
    parser.add_argument("--keep-workspace", action="store_true", help="retain the generated temporary workspace and report its path")
    args = parser.parse_args()

    try:
        date.fromisoformat(args.as_of)
    except ValueError:
        parser.error("--as-of must be YYYY-MM-DD")

    pack_root = Path(args.root).expanduser().resolve()
    if not pack_root.is_dir():
        parser.error("root must be a directory")

    workspace = Path(tempfile.mkdtemp(prefix="codex-skill-pack-smoke-"))
    try:
        result = execute(pack_root, args.as_of, workspace)
        if args.keep_workspace:
            result["workspace"] = str(workspace)
        if args.json:
            print(json.dumps(result, indent=2, sort_keys=True))
        else:
            print(f"Smoke tests: {result['status']}")
            print(f"Commands: {len(result['commands'])}")
            print(f"Assertions: {result['assertion_count']}")
            print(f"Read-only fixture check: {'PASS' if result['read_only_fixture_check'] else 'FAIL'}")
            if args.keep_workspace:
                print(f"Workspace: {workspace}")
        return 0
    except (AssertionError, OSError, subprocess.SubprocessError) as exc:
        payload = {"status": "FAIL", "as_of": args.as_of, "error": str(exc)}
        if args.keep_workspace:
            payload["workspace"] = str(workspace)
        if args.json:
            print(json.dumps(payload, indent=2, sort_keys=True))
        else:
            print(f"Smoke tests: FAIL\n{exc}", file=sys.stderr)
        return 1
    finally:
        if not args.keep_workspace:
            remove_generated_tree(workspace)


if __name__ == "__main__":
    raise SystemExit(main())
