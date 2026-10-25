#!/usr/bin/env python3
"""Read-only measurement helper for screenshot reconstruction.

Subcommands (standard library only; reads optional token JSON, never writes files):

  contrast FG BG [FG BG ...]
      WCAG 2.x contrast ratio for each foreground/background hex pair, with
      pass/fail for normal text (4.5:1), large text and non-text UI (3:1).

  colors --tokens tokens.json HEX [HEX ...] [--threshold 3.0]
      Nearest color token for each sampled hex by CIEDE2000 distance. Distances
      above the threshold are flagged as "no match" so they are logged as a
      deviation instead of silently snapped.

  scale VALUE [VALUE ...] [--dpr 2] [--tokens tokens.json --group spacing]
      Normalizes device-pixel measurements to CSS px, proposes the base unit
      that best explains them (or snaps to existing dimension tokens), and
      prints the residual for each value.

Token JSON may be flat ({"color.text.primary": "#111"}) or nested, including
DTCG-style objects with "$value". Aliases ("{color.blue.600}") are resolved.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path

HEX_RE = re.compile(r"^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
DIM_RE = re.compile(r"^(-?\d+(?:\.\d+)?)(px|rem)?$")
ALIAS_RE = re.compile(r"^\{([^}]+)\}$")


def parse_hex(value: str) -> tuple[int, int, int]:
    match = HEX_RE.match(value.strip())
    if not match:
        raise ValueError(f"not a hex color: {value!r}")
    digits = match.group(1)
    if len(digits) == 3:
        digits = "".join(ch * 2 for ch in digits)
    return int(digits[0:2], 16), int(digits[2:4], 16), int(digits[4:6], 16)


def _linear(channel: int) -> float:
    c = channel / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def relative_luminance(rgb: tuple[int, int, int]) -> float:
    r, g, b = (_linear(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(fg: tuple[int, int, int], bg: tuple[int, int, int]) -> float:
    l1, l2 = relative_luminance(fg), relative_luminance(bg)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


def rgb_to_lab(rgb: tuple[int, int, int]) -> tuple[float, float, float]:
    r, g, b = (_linear(c) for c in rgb)
    x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047
    y = 0.2126729 * r + 0.7151522 * g + 0.0721750 * b
    z = (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.08883

    def f(t: float) -> float:
        return t ** (1 / 3) if t > 216 / 24389 else (24389 / 27 * t + 16) / 116

    fx, fy, fz = f(x), f(y), f(z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)


def ciede2000(lab1: tuple[float, float, float], lab2: tuple[float, float, float]) -> float:
    l1, a1, b1 = lab1
    l2, a2, b2 = lab2
    c1, c2 = math.hypot(a1, b1), math.hypot(a2, b2)
    c_bar = (c1 + c2) / 2
    g = 0.5 * (1 - math.sqrt(c_bar**7 / (c_bar**7 + 25**7)))
    a1p, a2p = (1 + g) * a1, (1 + g) * a2
    c1p, c2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p = math.degrees(math.atan2(b1, a1p)) % 360
    h2p = math.degrees(math.atan2(b2, a2p)) % 360
    dlp = l2 - l1
    dcp = c2p - c1p
    if c1p * c2p == 0:
        dhp = 0.0
    elif abs(h2p - h1p) <= 180:
        dhp = h2p - h1p
    elif h2p - h1p > 180:
        dhp = h2p - h1p - 360
    else:
        dhp = h2p - h1p + 360
    dHp = 2 * math.sqrt(c1p * c2p) * math.sin(math.radians(dhp / 2))
    lp_bar = (l1 + l2) / 2
    cp_bar = (c1p + c2p) / 2
    if c1p * c2p == 0:
        hp_bar = h1p + h2p
    elif abs(h1p - h2p) <= 180:
        hp_bar = (h1p + h2p) / 2
    elif h1p + h2p < 360:
        hp_bar = (h1p + h2p + 360) / 2
    else:
        hp_bar = (h1p + h2p - 360) / 2
    t = (
        1
        - 0.17 * math.cos(math.radians(hp_bar - 30))
        + 0.24 * math.cos(math.radians(2 * hp_bar))
        + 0.32 * math.cos(math.radians(3 * hp_bar + 6))
        - 0.20 * math.cos(math.radians(4 * hp_bar - 63))
    )
    d_theta = 30 * math.exp(-(((hp_bar - 275) / 25) ** 2))
    rc = 2 * math.sqrt(cp_bar**7 / (cp_bar**7 + 25**7))
    sl = 1 + (0.015 * (lp_bar - 50) ** 2) / math.sqrt(20 + (lp_bar - 50) ** 2)
    sc = 1 + 0.045 * cp_bar
    sh = 1 + 0.015 * cp_bar * t
    rt = -math.sin(math.radians(2 * d_theta)) * rc
    return math.sqrt(
        (dlp / sl) ** 2 + (dcp / sc) ** 2 + (dHp / sh) ** 2 + rt * (dcp / sc) * (dHp / sh)
    )


def flatten_tokens(node: object, prefix: str = "") -> dict[str, object]:
    flat: dict[str, object] = {}
    if isinstance(node, dict):
        if "$value" in node:
            flat[prefix] = node["$value"]
            return flat
        for key, value in node.items():
            if key.startswith("$"):
                continue
            path = f"{prefix}.{key}" if prefix else key
            flat.update(flatten_tokens(value, path))
    else:
        flat[prefix] = node
    return flat


def resolve_aliases(flat: dict[str, object]) -> dict[str, object]:
    resolved: dict[str, object] = {}
    for name, value in flat.items():
        seen = {name}
        current = value
        while isinstance(current, str) and ALIAS_RE.match(current.strip()):
            target = ALIAS_RE.match(current.strip()).group(1)
            if target in seen or target not in flat:
                current = None
                break
            seen.add(target)
            current = flat[target]
        resolved[name] = current
    return resolved


def load_tokens(path: str) -> dict[str, object]:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    return resolve_aliases(flatten_tokens(data))


def color_tokens(tokens: dict[str, object]) -> dict[str, tuple[int, int, int]]:
    out: dict[str, tuple[int, int, int]] = {}
    for name, value in tokens.items():
        if isinstance(value, str) and HEX_RE.match(value.strip()):
            out[name] = parse_hex(value)
    return out


def dimension_tokens(tokens: dict[str, object], group: str, root_px: float) -> dict[str, float]:
    out: dict[str, float] = {}
    for name, value in tokens.items():
        if group and not (name == group or name.startswith(group + ".")):
            continue
        if isinstance(value, (int, float)):
            out[name] = float(value)
        elif isinstance(value, str):
            match = DIM_RE.match(value.strip())
            if match:
                number = float(match.group(1))
                out[name] = number * root_px if match.group(2) == "rem" else number
    return out


def cmd_contrast(args: argparse.Namespace) -> int:
    if len(args.colors) % 2:
        print("contrast expects FG BG pairs", file=sys.stderr)
        return 2
    print("| Foreground | Background | Ratio | Text 4.5:1 | Large text / UI 3:1 |")
    print("| --- | --- | --- | --- | --- |")
    for fg, bg in zip(args.colors[0::2], args.colors[1::2]):
        ratio = contrast_ratio(parse_hex(fg), parse_hex(bg))
        print(
            f"| {fg} | {bg} | {ratio:.2f}:1 | {'pass' if ratio >= 4.5 else 'FAIL'} "
            f"| {'pass' if ratio >= 3.0 else 'FAIL'} |"
        )
    return 0


def cmd_colors(args: argparse.Namespace) -> int:
    palette = color_tokens(load_tokens(args.tokens))
    if not palette:
        print("no hex color tokens found", file=sys.stderr)
        return 1
    labs = {name: rgb_to_lab(rgb) for name, rgb in palette.items()}
    print("| Sampled | Nearest token | Token value | dE2000 | Decision |")
    print("| --- | --- | --- | --- | --- |")
    for sample in args.colors:
        lab = rgb_to_lab(parse_hex(sample))
        name, distance = min(((n, ciede2000(lab, l)) for n, l in labs.items()), key=lambda x: x[1])
        r, g, b = palette[name]
        decision = "use token" if distance <= args.threshold else "no match: log deviation"
        print(f"| {sample} | {name} | #{r:02x}{g:02x}{b:02x} | {distance:.2f} | {decision} |")
    return 0


def cmd_scale(args: argparse.Namespace) -> int:
    values = [v / args.dpr for v in args.values]
    if args.tokens:
        dims = dimension_tokens(load_tokens(args.tokens), args.group, args.root_px)
        if not dims:
            print("no dimension tokens found for the requested group", file=sys.stderr)
            return 1
        print("| Measured (device px) | CSS px | Nearest token | Token px | Residual |")
        print("| --- | --- | --- | --- | --- |")
        for raw, css in zip(args.values, values):
            name, px = min(dims.items(), key=lambda item: abs(item[1] - css))
            print(f"| {raw:g} | {css:.2f} | {name} | {px:g} | {css - px:+.2f} |")
        return 0
    fits = []
    for base in args.bases:
        residuals = [abs(v - round(v / base) * base) for v in values]
        fits.append((sum(residuals) / len(residuals), base))
    # Finer units always fit at least as well, so prefer the coarsest unit whose
    # fit is within half a CSS pixel of the best one.
    tightest = min(mean for mean, _ in fits)
    mean, base = max((fit for fit in fits if fit[0] <= tightest + 0.5), key=lambda fit: fit[1])
    print(f"Proposed base unit: {base:g}px (mean residual {mean:.2f}px over {len(values)} values)")
    print("| Measured (device px) | CSS px | Snapped | Step | Residual |")
    print("| --- | --- | --- | --- | --- |")
    for raw, css in zip(args.values, values):
        step = round(css / base)
        snapped = step * base
        print(f"| {raw:g} | {css:.2f} | {snapped:g} | {step} | {css - snapped:+.2f} |")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    p_contrast = sub.add_parser("contrast", help="WCAG contrast for FG BG hex pairs")
    p_contrast.add_argument("colors", nargs="+")
    p_contrast.set_defaults(func=cmd_contrast)

    p_colors = sub.add_parser("colors", help="match sampled colors to color tokens")
    p_colors.add_argument("--tokens", required=True)
    p_colors.add_argument("--threshold", type=float, default=3.0)
    p_colors.add_argument("colors", nargs="+")
    p_colors.set_defaults(func=cmd_colors)

    p_scale = sub.add_parser("scale", help="infer spacing base unit or snap to dimension tokens")
    p_scale.add_argument("values", nargs="+", type=float)
    p_scale.add_argument("--dpr", type=float, default=1.0)
    p_scale.add_argument("--bases", nargs="+", type=float, default=[2, 4, 6, 8])
    p_scale.add_argument("--tokens")
    p_scale.add_argument("--group", default="")
    p_scale.add_argument("--root-px", type=float, default=16.0)
    p_scale.set_defaults(func=cmd_scale)

    args = parser.parse_args()
    try:
        return args.func(args)
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
