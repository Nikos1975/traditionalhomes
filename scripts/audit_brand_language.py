#!/usr/bin/env python3
"""Scan public content for high-risk promotional or generic travel phrasing."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIRS = (
    ROOT / "src" / "content" / "blog",
    ROOT / "src" / "content" / "houses",
    ROOT / "src" / "content" / "villa",
)
TERMS = (
    "best",
    "complete guide",
    "discover",
    "exclusive",
    "haunting",
    "hidden gem",
    "lavish",
    "luxury",
    "meticulously",
    "must-see",
    "paradise",
    "perfect",
    "premier",
    "pro tip",
    "spectacular",
    "ultimate",
    "unforgettable",
    "world-class",
)
PATTERN = re.compile(r"\b(" + "|".join(re.escape(term) for term in TERMS) + r")\b", re.I)


def main() -> int:
    findings: list[tuple[Path, int, str]] = []
    for base in CONTENT_DIRS:
        if not base.exists():
            continue
        for path in sorted(base.rglob("*.md")):
            for line_number, line in enumerate(path.read_text(encoding="utf-8-sig").splitlines(), start=1):
                if PATTERN.search(line):
                    findings.append((path, line_number, line.strip()))

    if findings:
        print("Brand-language review needed:")
        for path, line_number, line in findings:
            print(f"- {path.relative_to(ROOT)}:{line_number}: {line}")
        return 1

    print("No high-risk brand-language terms found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
