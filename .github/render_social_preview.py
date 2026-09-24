"""Render canonical GitHub artwork for Codex Toolkit."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / ".github" / "assets"
OUTPUT = ASSET_DIR / "codex-toolkit-social-preview.png"
README_HERO = ASSET_DIR / "codex-toolkit-readme-hero.png"
MANIFEST = ASSET_DIR / "social-preview-manifest.json"
PACKAGE = ROOT / "package.json"
CATALOG = ROOT / "skills" / "llms.txt"

PAPER = "#F1EFE8"
INK = "#101820"
BLUE = "#245BE8"
TEAL = "#159D91"
WHITE = "#F8F7F2"
MUTED = "#AAB4BD"

HERO_PAPER = "#F8F7F1"
HERO_INK = "#071A2E"
HERO_BLUE = "#1264F3"
HERO_TEAL = "#45C6BC"
HERO_MUTED = "#64738C"
HERO_RULE = "#B9C0C8"


def release_metadata() -> tuple[str, int]:
    """Resolve release version and skill count from canonical repository metadata."""
    package = json.loads(PACKAGE.read_text(encoding="utf-8"))
    version = package.get("version")
    if not isinstance(version, str) or not version:
        raise ValueError("package.json must contain a non-empty version")
    skill_count = sum(
        1 for line in CATALOG.read_text(encoding="utf-8").splitlines() if line.strip()
    )
    if skill_count < 1:
        raise ValueError("skills/llms.txt must contain at least one skill")
    return version, skill_count


def git_blob_sha1(path: Path) -> str:
    """Return the Git object identity for a file's current bytes."""
    data = path.read_bytes()
    header = f"blob {len(data)}\0".encode("utf-8")
    return hashlib.sha1(header + data).hexdigest()


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


def draw_toolkit_logo(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float = 1.0) -> None:
    """Draw the three-part Codex Toolkit mark used in the README hero."""
    def points(values: list[tuple[int, int]]) -> list[tuple[int, int]]:
        return [(x + int(px * scale), y + int(py * scale)) for px, py in values]

    draw.polygon(
        points([(0, 35), (62, 0), (62, 20), (18, 45), (18, 103), (50, 121), (50, 145), (0, 116)]),
        fill=HERO_INK,
    )
    draw.polygon(
        points([(26, 45), (79, 16), (79, 37), (45, 56), (45, 93), (70, 107), (70, 129), (26, 104)]),
        fill=HERO_BLUE,
    )
    draw.polygon(
        points([(55, 64), (101, 39), (101, 61), (74, 76), (74, 94), (97, 82), (97, 105), (55, 128)]),
        fill=HERO_TEAL,
    )


def render_social_preview() -> Path:
    """Render the existing 1280 by 640 GitHub social card."""
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
        "image_git_blob_sha1": git_blob_sha1(OUTPUT),
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return OUTPUT


def render_readme_hero() -> Path:
    """Render the 16:9 README hero approved for Codex Toolkit."""
    version, skill_count = release_metadata()
    width, height = 1200, 675
    image = Image.new("RGB", (width, height), HERO_PAPER)
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 0, 22, height), fill=HERO_BLUE)
    draw.rectangle((22, 0, 32, height), fill=HERO_TEAL)

    draw_toolkit_logo(draw, 73, 47, 0.72)
    draw.line((200, 70, 200, 145), fill=HERO_RULE, width=1)
    draw.text((218, 72), "CODEX TOOLKIT", font=font(31, bold=True, mono=True), fill=HERO_INK)
    draw.text((218, 116), "UNDERSTAND  IMPROVE  SHIP", font=font(15, mono=True), fill=HERO_MUTED)

    draw.text((890, 78), f"v{version}", font=font(14, mono=True), fill=HERO_MUTED)
    draw.line((971, 72, 971, 105), fill=HERO_RULE, width=1)
    draw.text((1005, 78), "OPEN SOURCE", font=font(14, mono=True), fill=HERO_MUTED)

    hero_x = 96
    draw.text((hero_x, 190), "Inspect.", font=font(79, bold=True), fill=HERO_INK)
    draw.text((hero_x, 276), "Change.", font=font(79, bold=True), fill=HERO_BLUE)
    draw.text((hero_x, 362), "Prove.", font=font(79, bold=True), fill=HERO_INK)
    draw.text(
        (hero_x, 471),
        "Focused skills for real repositories.",
        font=font(24, bold=True),
        fill=HERO_MUTED,
    )

    draw.line((720, 170, 720, 514), fill=HERO_RULE, width=1)
    rows = [
        ("01", "MAP", "Understand context"),
        ("02", "TRACE", "Find root cause"),
        ("03", "CONTROL", "Make safe changes"),
        ("04", "VERIFY", "Prove it works"),
    ]
    y = 181
    for index, (number, title, detail) in enumerate(rows):
        draw.text((762, y), number, font=font(27, mono=True), fill=HERO_MUTED)
        draw.text((832, y - 2), title, font=font(28, bold=True, mono=True), fill=HERO_INK)
        draw.text((832, y + 36), detail, font=font(17, mono=True), fill=HERO_MUTED)
        draw.text((1086, y + 6), "→", font=font(30), fill=HERO_INK)
        if index < len(rows) - 1:
            draw.line((762, y + 70, 1110, y + 70), fill="#D1D5DA", width=1)
        y += 90

    box_x, box_y, box_w, box_h = 96, 545, 1020, 58
    draw.rectangle((box_x, box_y, box_x + box_w, box_y + box_h), outline="#657387", width=1)
    draw.text((116, 559), "›", font=font(28), fill=HERO_BLUE)
    draw.text(
        (160, 562),
        "npx skills add github.com/cmdr-chara/codex-toolkit --list",
        font=font(17, mono=True),
        fill=HERO_INK,
    )
    draw.rectangle((1043, box_y, 1116, box_y + box_h), fill=HERO_BLUE)
    draw.text((1064, 556), "→", font=font(30), fill=WHITE)

    draw.text((96, 627), f"{skill_count} SKILLS  /  6 AGENTS", font=font(14, mono=True), fill=HERO_MUTED)
    draw.text((915, 627), "BUILT FOR REAL WORK", font=font(14, mono=True), fill=HERO_MUTED)
    draw.line((1093, 637, 1116, 637), fill=HERO_BLUE, width=2)

    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    image.save(README_HERO, format="PNG", optimize=True)
    return README_HERO


def render() -> Path:
    """Render all canonical repository artwork."""
    render_social_preview()
    render_readme_hero()
    return OUTPUT


if __name__ == "__main__":
    print(render())
