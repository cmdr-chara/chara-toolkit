#!/usr/bin/env python3
"""Read-only scanner for invisible and format-control Unicode in text files.

Reports every code point that renders invisibly or changes text direction:
zero-width characters, bidirectional controls, Unicode tag characters,
variation selectors, soft hyphens, and other format (Cf) characters.
Files are never modified.

Exit codes: 0 = nothing found, 1 = findings reported, 2 = usage or read error.
"""

from __future__ import annotations

import argparse
import json
import sys
import unicodedata
from pathlib import Path

BIDI_CONTROLS = set(range(0x202A, 0x202F)) | set(range(0x2066, 0x206A)) | {0x200E, 0x200F, 0x061C}
ZERO_WIDTH = {0x200B, 0x200C, 0x200D, 0x2060, 0xFEFF, 0x180E}
TAGS = range(0xE0000, 0xE0080)
VARIATION_SELECTORS = set(range(0xFE00, 0xFE10)) | set(range(0xE0100, 0xE01F0))


def classify(code: int) -> str | None:
    if code in BIDI_CONTROLS:
        return "bidi-control"
    if code in ZERO_WIDTH:
        return "zero-width"
    if code in TAGS:
        return "tag"
    if code in VARIATION_SELECTORS:
        return "variation-selector"
    if code == 0x00AD:
        return "soft-hyphen"
    if unicodedata.category(chr(code)) == "Cf":
        return "format"
    return None


def scan(path: Path) -> list[dict[str, object]]:
    findings = []
    text = path.read_text(encoding="utf-8")
    for line_number, line in enumerate(text.splitlines(), 1):
        for column, char in enumerate(line, 1):
            kind = classify(ord(char))
            if kind is None:
                continue
            # A BOM at the very start of a file is an encoding marker, not hidden content.
            if ord(char) == 0xFEFF and line_number == 1 and column == 1:
                kind = "byte-order-mark"
            findings.append(
                {
                    "file": str(path),
                    "line": line_number,
                    "column": column,
                    "codepoint": f"U+{ord(char):04X}",
                    "name": unicodedata.name(char, "<unnamed>"),
                    "kind": kind,
                }
            )
    return findings


def iter_files(paths: list[str]) -> list[Path]:
    files = []
    for raw in paths:
        path = Path(raw)
        if path.is_dir():
            files.extend(sorted(p for p in path.rglob("*") if p.is_file() and ".git" not in p.parts))
        else:
            files.append(path)
    return files


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("paths", nargs="+", help="files or directories to scan")
    parser.add_argument("--format", choices=("markdown", "json"), default="markdown")
    args = parser.parse_args()

    findings: list[dict[str, object]] = []
    skipped: list[str] = []
    for path in iter_files(args.paths):
        try:
            findings.extend(scan(path))
        except UnicodeDecodeError:
            skipped.append(f"{path} (not UTF-8 text)")
        except OSError as exc:
            print(f"error: {path}: {exc}", file=sys.stderr)
            return 2

    summary: dict[str, int] = {}
    for finding in findings:
        summary[str(finding["kind"])] = summary.get(str(finding["kind"]), 0) + 1

    if args.format == "json":
        print(json.dumps({"findings": findings, "summary": summary, "skipped": skipped}, indent=2))
    else:
        if findings:
            print("| Location | Code point | Name | Kind |")
            print("| --- | --- | --- | --- |")
            for f in findings:
                print(f"| {f['file']}:{f['line']}:{f['column']} | {f['codepoint']} | {f['name']} | {f['kind']} |")
        else:
            print("No invisible or format-control characters found.")
        if summary:
            print("\nSummary: " + ", ".join(f"{kind}={count}" for kind, count in sorted(summary.items())))
        for item in skipped:
            print(f"Skipped: {item}")
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
