#!/usr/bin/env python3
"""Fail if markdown files are placed under src/pages."""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PAGES_DIR = ROOT / "src" / "pages"


def main() -> int:
    matches = sorted(PAGES_DIR.rglob("*.md")) + sorted(PAGES_DIR.rglob("*.mdx"))
    if matches:
        print("Markdown files under src/pages become public routes:")
        for path in matches:
            print(f"- {path.relative_to(ROOT)}")
        return 1

    print("No markdown files found under src/pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
