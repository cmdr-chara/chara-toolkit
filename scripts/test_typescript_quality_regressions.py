#!/usr/bin/env python3
"""Run focused regressions for the TypeScript quality inventory and local anti-slop patches."""
from __future__ import annotations

import argparse
import importlib.util
import tempfile
from pathlib import Path
from types import ModuleType


def load_inventory(pack_root: Path) -> ModuleType:
    path = (
        pack_root
        / "skills"
        / "typescript-quality-enforcer"
        / "scripts"
        / "typescript_quality_inventory.py"
    )
    spec = importlib.util.spec_from_file_location("typescript_quality_inventory", path)
    if spec is None or spec.loader is None:
        raise AssertionError(f"cannot load inventory helper from {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def assert_vendor_patch_shapes(pack_root: Path) -> None:
    rules = pack_root / "skills" / "typescript-quality-enforcer" / "assets" / "anti-slop" / "rules"

    unknown_parameters = (rules / "no-unknown-parameters.ts").read_text(encoding="utf-8")
    if 'type.type === "TSUnionType"' not in unknown_parameters or "type.types.some(resolvesToUnknown)" not in unknown_parameters:
        raise AssertionError("no-unknown-parameters must detect unknown-dominated union annotations")

    safety = (rules / "require-safety-comment-for-type-assertion.ts").read_text(encoding="utf-8")
    if r"/\bSAFETY\s*:\s*\S/u" not in safety:
        raise AssertionError("SAFETY comments must require non-whitespace justification text")

    aliases = (rules / "no-unknown-type-aliases.ts").read_text(encoding="utf-8")
    for token in ("TSTypeAliasDeclaration(node)", '"TSModuleBlock"', "aliasesVisibleFrom"):
        if token not in aliases:
            raise AssertionError(f"no-unknown-type-aliases is missing lexical alias handling token {token!r}")


def run_inventory_regression(pack_root: Path) -> None:
    inventory = load_inventory(pack_root)
    with tempfile.TemporaryDirectory(prefix="typescript-quality-regression-") as temporary:
        root = Path(temporary)
        (root / "packages" / "auth" / "src").mkdir(parents=True)
        (root / "node_modules" / "fake").mkdir(parents=True)
        (root / "build").mkdir()

        (root / "package.json").write_text(
            '{"devDependencies":{"typescript":"fixture","oxlint":"fixture"}}\n',
            encoding="utf-8",
        )
        (root / "tsconfig.json").write_text(
            """{
  // JSONC comment is valid in TypeScript config.
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": false,
  },
}
""",
            encoding="utf-8",
        )
        (root / "packages" / "auth" / "tsconfig.json").write_text(
            """{
  "compilerOptions": {
    "strict": false,
  },
}
""",
            encoding="utf-8",
        )
        (root / "packages" / "auth" / "src" / "unsafe.ts").write_text(
            "const user = input as unknown as User;\n",
            encoding="utf-8",
        )
        (root / "node_modules" / "fake" / "ignored.ts").write_text(
            "Reflect.apply(fn, null, []);\n",
            encoding="utf-8",
        )
        (root / "build" / "ignored.ts").write_text(
            "const value = input as any;\n",
            encoding="utf-8",
        )

        report = inventory.build_report(root)
        configs = {item["path"]: item for item in report["tsconfigs"]}
        if set(configs) != {"tsconfig.json", "packages/auth/tsconfig.json"}:
            raise AssertionError(f"nested tsconfig discovery failed: {sorted(configs)}")
        if configs["tsconfig.json"]["strict"] is not True:
            raise AssertionError("root JSONC tsconfig was not parsed")
        if configs["packages/auth/tsconfig.json"]["strict"] is not False:
            raise AssertionError("package tsconfig enforcement state was not captured")

        counts = report["heuristic_counts"]
        if counts.get("chained_assertion", 0) < 1:
            raise AssertionError("owned source quality signal was not detected")
        if counts.get("reflect_apply", 0) != 0 or counts.get("as_any", 0) != 0:
            raise AssertionError("skipped dependency/build directories leaked into the source scan")
        if report["files_scanned"] != 1:
            raise AssertionError(f"expected one owned source file, scanned {report['files_scanned']}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".", help="codex-toolkit repository root")
    args = parser.parse_args()
    pack_root = Path(args.root).expanduser().resolve()
    if not pack_root.is_dir():
        parser.error("root must be a directory")

    run_inventory_regression(pack_root)
    assert_vendor_patch_shapes(pack_root)
    print("TypeScript quality regressions: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
