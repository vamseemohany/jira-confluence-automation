---
name: use-load-source-data
description: Normalize JSON, CSV, or text source files into JSON for report processing.
---

- Use `tools/load_source_data.py` when a report workflow needs to read a source file into a predictable JSON artifact.
- Pass `--source` with the input file and `--output` with the destination JSON file.
- Pass `--format json` for JSON, `--format csv` for tabular data, or `--format text` for plain text.
- Ensure the CSV has a header row when using `--format csv`.
- Example: `python tools/load_source_data.py --source data/progress.csv --format csv --output work/progress.json`.
- Inspect the output before passing it to downstream report calculations.