"""Discover reporting input sources in a directory."""

import argparse
import json
from pathlib import Path


def discover_sources(directory: Path, pattern: str) -> list[dict[str, str | int]]:
    """Return metadata for files matching pattern below directory."""
    sources = []
    for path in sorted(directory.glob(pattern)):
        if path.is_file():
            sources.append(
                {
                    "path": str(path.resolve()),
                    "name": path.name,
                    "size_bytes": path.stat().st_size,
                }
            )
    return sources


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Find files that can serve as reporting input sources."
    )
    parser.add_argument("--directory", type=Path, required=True)
    parser.add_argument("--pattern", default="**/*")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    sources = discover_sources(args.directory, args.pattern)
    result = json.dumps(sources, indent=2)
    if args.output:
        args.output.write_text(result + "\n", encoding="utf-8")
    else:
        print(result)


if __name__ == "__main__":
    main()