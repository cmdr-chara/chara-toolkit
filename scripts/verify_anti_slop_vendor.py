#!/usr/bin/env python3
"""Verify the vendored anti-slop runtime against its checked-in integrity manifest."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

EXPECTED_REVISION = "446268e5d15baa968eaec669ff65358d36ae6259"
EXPECTED_LOCAL_PATCHES = {
    "rules/no-unknown-parameters.ts",
    "rules/no-unknown-type-aliases.ts",
    "rules/require-safety-comment-for-type-assertion.ts",
}


def git_blob_sha1(path: Path) -> str:
    data = path.read_bytes()
    header = f"blob {len(data)}\0".encode("utf-8")
    return hashlib.sha1(header + data).hexdigest()


def fail(message: str) -> int:
    print(f"anti-slop vendor integrity: FAIL: {message}")
    return 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".", help="codex-toolkit repository root")
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()
    asset_root = root / "skills" / "typescript-quality-enforcer" / "assets" / "anti-slop"
    manifest_path = (
        root
        / "skills"
        / "typescript-quality-enforcer"
        / "references"
        / "anti-slop-vendor-manifest.json"
    )
    if not asset_root.is_dir():
        return fail(f"missing asset directory: {asset_root}")
    if not manifest_path.is_file():
        return fail(f"missing manifest: {manifest_path}")

    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        return fail(f"cannot parse manifest: {exc}")
    if not isinstance(manifest, dict):
        return fail("manifest root must be an object")
    if manifest.get("schema_version") != 1:
        return fail("unsupported manifest schema")
    if manifest.get("hash_kind") != "git-blob-sha1":
        return fail("manifest hash_kind must be git-blob-sha1")
    if manifest.get("upstream_revision") != EXPECTED_REVISION:
        return fail("manifest upstream revision does not match the pinned base revision")

    local_patches = manifest.get("local_patches")
    if not isinstance(local_patches, list) or set(local_patches) != EXPECTED_LOCAL_PATCHES:
        return fail("manifest local_patches does not match the documented patch set")

    files = manifest.get("files")
    if not isinstance(files, dict) or not files:
        return fail("manifest files must be a non-empty object")

    actual_paths = {
        path.relative_to(asset_root).as_posix()
        for path in asset_root.rglob("*")
        if path.is_file()
    }
    expected_paths = set(files)
    if actual_paths != expected_paths:
        missing = sorted(expected_paths - actual_paths)
        unexpected = sorted(actual_paths - expected_paths)
        return fail(f"asset file set mismatch; missing={missing}, unexpected={unexpected}")

    mismatches: list[str] = []
    for relative in sorted(expected_paths):
        expected = files.get(relative)
        if not isinstance(expected, str) or len(expected) != 40:
            mismatches.append(f"{relative}: invalid recorded Git blob id")
            continue
        actual = git_blob_sha1(asset_root / relative)
        if actual != expected:
            mismatches.append(f"{relative}: expected {expected}, got {actual}")
    if mismatches:
        return fail("; ".join(mismatches))

    print(
        "anti-slop vendor integrity: PASS "
        f"({len(expected_paths)} files, {len(EXPECTED_LOCAL_PATCHES)} documented local patches)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
