"""Render the exact GitHub social preview for Codex Toolkit."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / ".github" / "assets"
OUTPUT = ASSET_DIR / "codex-toolkit-social-preview.png"
MANIFEST = ASSET_DIR / "social-preview-manifest.json"
PACKAGE = ROOT / "package.json"
CATALOG = ROOT / "skills" / "llms.txt"

PAPER = "#F1EFE8"
INK = "#101820"
BLUE = "#245BE8"
TEAL = "#159D91"
WHITE = "#F8F7F2"
MUTED = "#AAB4BD"


def release_metadata() -> tuple[str, int]:
    """Resolve release version and skill count from canonical repository metadata."""
    package = json.loads(PACKAGE.read_text(encoding="utf-8"))
    version = package.get("version")
    if not isinstance(version, str) or not version:
        raise ValueError("package.json must contain a non-empty version")
    skill_count = sum(1 for line in CATALOG.read_text(encoding="utf-8").splitlines() if line.strip())
    if skill_count < 1:
        raise ValueError("skills/llms.txt must contain at least one skill")
    return version, skill_count


def font(size: int, *, bold: bool = False, mono: bool = False) -> ImageFont.FreeTypeFont:
    """Load a local font with Windows and Linux fallbacks."""
    if mono:
        candidates = [
            Path("C:/Windows/Fonts/consolab.ttf" if bold else "C:/Windows/Fonts/consola.ttf"),
            Path(
                "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
                if bold
                else "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
            ),
        ]
    else:
        candidates = [
            Path("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
            Path(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
                if bold
                else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
            ),
        ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    raise FileNotFoundError("No suitable UI font was found")


def render() -> Path:
    """Render a 1280 by 640 social card without external assets."""
    version, skill_count = release_metadata()
    image = Image.new("RGB", (1280, 640), PAPER)
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 0, 18, 640), fill=BLUE)
    draw.rectangle((18, 0, 28, 640), fill=TEAL)

    draw.text((70, 48), "CODEX TOOLKIT", font=font(19, bold=True, mono=True), fill=BLUE)
    draw.text(
        (70, 84),
        f"{skill_count} SKILLS  /  6 AGENTS  /  OFFLINE CHECKS",
        font=font(15, mono=True),
        fill=INK,
    )
    draw.line((70, 124, 610, 124), fill="#B6B7B1", width=2)

    draw.text((68, 166), "Inspect.", font=font(65, bold=True), fill=INK)
    draw.text((68, 238), "Change.", font=font(65, bold=True), fill=INK)
    draw.text((68, 310), "Prove.", font=font(65, bold=True), fill=INK)

    draw.text(
        (72, 414),
        "Focused playbooks for real repositories.",
        font=font(23),
        fill=INK,
    )
    draw.text(
        (72, 453),
        "Install one skill. Keep the workflow visible.",
        font=font(18),
        fill="#4D565E",
    )

    panel = (666, 42, 1230, 546)
    draw.rectangle(panel, fill=INK)
    draw.text((702, 72), "FIELD MANUAL", font=font(14, bold=True, mono=True), fill=TEAL)
    draw.text((1100, 72), f"v{version}", font=font(14, mono=True), fill=MUTED)

    rows = [
        ("01", "MAP THE REPOSITORY", "repository-intelligence"),
        ("02", "TRACE THE FAILURE", "debugging-investigator"),
        ("03", "CONTROL THE CHANGE", "evolution + refactoring"),
        ("04", "VERIFY THE RELEASE", "risk-based evidence"),
    ]
    y = 132
    for number, title, detail in rows:
        draw.text((702, y), number, font=font(20, bold=True, mono=True), fill=BLUE)
        draw.text((760, y - 2), title, font=font(21, bold=True), fill=WHITE)
        draw.text((760, y + 31), detail, font=font(15, mono=True), fill=MUTED)
        draw.line((702, y + 68, 1194, y + 68), fill="#35414A", width=1)
        y += 94

    command = "npx skills add github.com/cmdr-chara/codex-toolkit --list"
    draw.rectangle((70, 558, 1230, 606), fill=WHITE, outline=INK, width=2)
    draw.rectangle((70, 558, 236, 606), fill=BLUE)
    draw.text((91, 572), "START HERE", font=font(14, bold=True, mono=True), fill=WHITE)
    draw.text((261, 572), command, font=font(15, mono=True), fill=INK)

    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT, format="PNG", optimize=True)

    manifest = {
        "file": str(OUTPUT.relative_to(ROOT)).replace("\\", "/"),
        "dimensions": {"width": 1280, "height": 640},
        "format": "PNG",
        "source": str(Path(__file__).relative_to(ROOT)).replace("\\", "/"),
        "external_assets": [],
        "fonts": ["Segoe UI", "Consolas", "DejaVu Sans fallback"],
        "purpose": "GitHub repository social preview",
        "copy_reviewed": True,
        "version": version,
        "skill_count": skill_count,
        "image_sha256": hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return OUTPUT


if __name__ == "__main__":
    print(render())
