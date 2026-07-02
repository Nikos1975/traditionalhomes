#!/usr/bin/env python3
"""Audit blog frontmatter for scan, SEO, and index metadata."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BLOG_DIR = ROOT / "src" / "content" / "blog"
REQUIRED_FIELDS = ("title", "description", "pubDate", "category", "region", "tags", "image", "imageAlt")


def parse_frontmatter(path: Path) -> dict[str, object]:
    text = path.read_text(encoding="utf-8-sig")
    match = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n", text, re.S)
    if not match:
        return {}

    data: dict[str, object] = {}
    current_key: str | None = None
    for raw_line in match.group(1).splitlines():
        line = raw_line.rstrip()
        if not line or line.lstrip().startswith("#"):
            continue
        if line.startswith((" ", "\t")) and current_key:
            value = line.strip()
            if value.startswith("- "):
                existing = data.setdefault(current_key, [])
                if isinstance(existing, list):
                    existing.append(value[2:].strip().strip('"\''))
            continue
        key, sep, value = line.partition(":")
        if not sep:
            continue
        current_key = key.strip()
        value = value.strip()
        if value:
            data[current_key] = value.strip('"\'')
        else:
            data[current_key] = []
    return data


def main() -> int:
    if not BLOG_DIR.exists():
        print(f"Missing blog directory: {BLOG_DIR.relative_to(ROOT)}", file=sys.stderr)
        return 2

    posts = sorted(BLOG_DIR.glob("*.md"), key=lambda p: p.name.lower())
    failures: list[str] = []
    categories: dict[str, int] = {}

    for path in posts:
        data = parse_frontmatter(path)
        missing = [field for field in REQUIRED_FIELDS if not data.get(field)]
        category = str(data.get("category") or "Uncategorised")
        categories[category] = categories.get(category, 0) + 1
        if missing:
            failures.append(f"{path.relative_to(ROOT)} missing: {', '.join(missing)}")

    print(f"Blog posts: {len(posts)}")
    print("Categories:")
    for category, count in sorted(categories.items()):
        print(f"- {category}: {count}")

    if failures:
        print("\nMetadata gaps:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("\nAll blog posts include required metadata.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
