#!/usr/bin/env python3
"""Safe deterministic scaffolder for an approved ICM workspace plan.

Creates missing directories and minimal placeholder files. It never overwrites an
existing file unless --force is supplied. This script does not design the architecture;
the architecture must be approved first.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import sys


def slug(value: str) -> str:
    value = value.strip().lower().replace(" ", "_")
    value = re.sub(r"[^a-z0-9_-]+", "", value)
    value = re.sub(r"_+", "_", value)
    return value.strip("_")


def write_file(path: Path, content: str, force: bool, created: list[str], skipped: list[str]) -> None:
    if path.exists() and not force:
        skipped.append(str(path))
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    created.append(str(path))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("plan", type=Path, help="Approved workspace-plan JSON")
    parser.add_argument("target", type=Path, help="Target project directory")
    parser.add_argument("--force", action="store_true", help="Allow overwriting generated placeholder files")
    args = parser.parse_args()

    plan = json.loads(args.plan.read_text(encoding="utf-8"))
    target = args.target.resolve()
    target.mkdir(parents=True, exist_ok=True)

    project_name = plan.get("project_name", "ICM Workspace")
    root_map = plan.get("root_map", "AGENTS.md")
    if Path(root_map).name != root_map:
        raise SystemExit("root_map must be a filename, not a path")

    created: list[str] = []
    skipped: list[str] = []

    root_content = f"""# {project_name}\n\n[Project identity — fill after review.]\n\n## Routing\n\n| Task | Go to | Read | Skills / tools |\n|---|---|---|---|\n| [task] | [path] | CONTEXT.md | — |\n\n## Critical rules\n\n- Load only routed context.\n- Do not overwrite, delete, publish, deploy, or send without approval.\n"""
    write_file(target / root_map, root_content, args.force, created, skipped)

    if plan.get("root_context", False):
        write_file(
            target / "CONTEXT.md",
            "# Workspace Context\n\n[Describe overall flow, shared references, and handoff rules.]\n",
            args.force,
            created,
            skipped,
        )

    for ref_dir in plan.get("shared_reference_dirs", []):
        (target / ref_dir).mkdir(parents=True, exist_ok=True)

    stages = plan.get("stages", [])
    for stage in stages:
        number = int(stage["number"])
        name = slug(stage["name"])
        purpose = stage.get("purpose", "[One job only.]")
        stage_dir = target / "stages" / f"{number:02d}_{name}"
        (stage_dir / "references").mkdir(parents=True, exist_ok=True)
        (stage_dir / "output").mkdir(parents=True, exist_ok=True)
        stage_context = f"""# {stage['name'].title()}\n\n## Purpose\n\n{purpose}\n\n## Inputs\n\n| Layer | Path | Why needed | Read scope |\n|---|---|---|---|\n| L3 | [path] | [constraint] | [scope] |\n| L4 | [path] | [working input] | [scope] |\n\n## Process\n\n1. [step]\n\n## Outputs\n\n| Artifact | Destination | Format |\n|---|---|---|\n| [artifact] | output/ | Markdown |\n\n## Done looks like\n\n- [acceptance criterion]\n\n## Review gate\n\n[Stop/continue rule.]\n"""
        write_file(stage_dir / "CONTEXT.md", stage_context, args.force, created, skipped)

    print(json.dumps({"created": created, "skipped_existing": skipped}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
