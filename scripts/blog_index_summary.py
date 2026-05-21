#!/usr/bin/env python3
"""Print a compact blog index summary for routing and review."""

from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BLOG_DIR = ROOT / "src" / "content" / "blog"


def parse_frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8-sig")
    match = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n", text, re.S)
    if not match:
        return {}

    data: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if line.startswith((" ", "\t")) or ":" not in line:
            continue
        key, value = line.split(":", 1)
        value = value.strip()
        if value:
            data[key.strip()] = value.strip('"\'')
    return data


def main() -> int:
    groups: dict[str, list[tuple[str, str, str]]] = defaultdict(list)
    for path in sorted(BLOG_DIR.glob("*.md"), key=lambda p: p.name.lower()):
        data = parse_frontmatter(path)
        category = data.get("category", "Uncategorised")
        groups[category].append((
            data.get("pubDate", "no-date"),
            data.get("title", path.stem),
            data.get("region", "no-region"),
        ))

    for category in sorted(groups):
        print(f"{category} ({len(groups[category])})")
        for pub_date, title, region in sorted(groups[category], reverse=True):
            print(f"- {pub_date} | {title} | {region}")
        print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
