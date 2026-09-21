"""Compute numeric summary values and render them into a report template."""

import argparse
import json
from pathlib import Path
from typing import Any


def compute_values(data: Any, number_field: str) -> dict[str, int | float]:
    """Compute count, total, average, minimum, and maximum for a field."""
    records = data if isinstance(data, list) else data.get("records", [])
    numbers = [float(record[number_field]) for record in records if number_field in record]
    if not numbers:
        return {"count": 0, "total": 0, "average": 0, "minimum": 0, "maximum": 0}
    return {
        "count": len(numbers),
        "total": sum(numbers),
        "average": sum(numbers) / len(numbers),
        "minimum": min(numbers),
        "maximum": max(numbers),
    }


def render(template: str, values: dict[str, int | float]) -> str:
    """Replace placeholders such as {{total}} with computed values."""
    for name, value in values.items():
        template = template.replace("{{" + name + "}}", str(value))
    return template


def main() -> None:
    parser = argparse.ArgumentParser(description="Render a report from computed values.")
    parser.add_argument("--template", type=Path, required=True)
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--number-field", required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    data = json.loads(args.data.read_text(encoding="utf-8"))
    values = compute_values(data, args.number_field)
    template = args.template.read_text(encoding="utf-8")
    args.output.write_text(render(template, values), encoding="utf-8")


if __name__ == "__main__":
    main()