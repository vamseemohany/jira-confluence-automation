"""Load JSON, CSV, or text source data into a predictable JSON structure."""

import argparse
import csv
import json
from pathlib import Path
from typing import Any


def load_source(path: Path, source_format: str) -> Any:
    """Read a source file using the requested format."""
    if source_format == "json":
        return json.loads(path.read_text(encoding="utf-8"))
    if source_format == "csv":
        with path.open(newline="", encoding="utf-8") as source_file:
            return list(csv.DictReader(source_file))
    return {"text": path.read_text(encoding="utf-8")}


def main() -> None:
    parser = argparse.ArgumentParser(description="Load report source data as JSON.")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--format", choices=("json", "csv", "text"), default="json")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    data = load_source(args.source, args.format)
    args.output.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()