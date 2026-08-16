#!/usr/bin/env python3
"""Verify release-facing metadata stays synchronized with the canonical package and skill catalog."""
from __future__ import annotations

import argparse
import hashlib
import json
import struct
from pathlib import Path


def fail(message: str) -> int:
    print(f"release metadata: FAIL: {message}")
    return 1


def git_blob_sha1(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("utf-8")
    return hashlib.sha1(header + data).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".", help="codex-toolkit repository root")
    args = parser.parse_args()
    root = Path(args.root).expanduser().resolve()
    if not root.is_dir():
        parser.error("root must be a directory")

    package_path = root / "package.json"
    catalog_path = root / "skills" / "llms.txt"
    manifest_path = root / ".github" / "assets" / "social-preview-manifest.json"
    preview_path = root / ".github" / "assets" / "codex-toolkit-social-preview.png"
    renderer_path = root / ".github" / "render_social_preview.py"
    changelog_path = root / "CHANGELOG.md"

    try:
        package = json.loads(package_path.read_text(encoding="utf-8"))
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        return fail(f"cannot parse package/preview metadata: {exc}")

    version = package.get("version") if isinstance(package, dict) else None
    if not isinstance(version, str) or not version:
        return fail("package.json has no non-empty version")

    try:
        skill_count = sum(
            1 for line in catalog_path.read_text(encoding="utf-8").splitlines() if line.strip()
        )
    except (OSError, UnicodeError) as exc:
        return fail(f"cannot read skill catalog: {exc}")

    if manifest.get("version") != version:
        return fail(
            f"social preview version {manifest.get('version')!r} does not match package version {version!r}"
        )
    if manifest.get("skill_count") != skill_count:
        return fail(
            f"social preview skill_count {manifest.get('skill_count')!r} does not match catalog count {skill_count}"
        )

    try:
        preview = preview_path.read_bytes()
    except OSError as exc:
        return fail(f"cannot read social preview PNG: {exc}")
    if len(preview) < 24 or preview[:8] != b"\x89PNG\r\n\x1a\n":
        return fail("social preview is not a valid PNG header")
    width, height = struct.unpack(">II", preview[16:24])
    if (width, height) != (1280, 640):
        return fail(f"social preview dimensions are {(width, height)}, expected (1280, 640)")
    actual_blob = git_blob_sha1(preview)
    if manifest.get("image_git_blob_sha1") != actual_blob:
        return fail(
            f"social preview Git blob id {actual_blob} does not match manifest {manifest.get('image_git_blob_sha1')!r}"
        )

    try:
        renderer = renderer_path.read_text(encoding="utf-8")
        changelog = changelog_path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        return fail(f"cannot read renderer/changelog: {exc}")
    for stale in ("15 SKILLS", '"v0.4.0"'):
        if stale in renderer:
            return fail(f"renderer still contains stale hard-coded release copy {stale!r}")
    if "release_metadata()" not in renderer or "skill_count" not in renderer or "version" not in renderer:
        return fail("renderer must derive release metadata from package.json and skills/llms.txt")
    if "image_git_blob_sha1" not in renderer or "git_blob_sha1(OUTPUT)" not in renderer:
        return fail("renderer must record the committed preview using Git blob identity")
    if f"## {version} - " not in changelog:
        return fail(f"CHANGELOG.md has no release section for {version}")

    print(f"release metadata: PASS (v{version}, {skill_count} skills, {width}x{height}, blob {actual_blob})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
