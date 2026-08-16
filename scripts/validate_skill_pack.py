#!/usr/bin/env python3
"""Public structural-validator entrypoint for Codex Toolkit."""
from __future__ import annotations

try:
    from . import validate_skill_pack_core as core
except ImportError:  # Direct script execution puts scripts/ on sys.path.
    import validate_skill_pack_core as core

EXPECTED_SKILLS = core.EXPECTED_SKILLS
TOOLKIT_SKILLS = core.TOOLKIT_SKILLS
Result = core.Result
main = core.main


def __getattr__(name):
    return getattr(core, name)


if __name__ == "__main__":
    raise SystemExit(main())
