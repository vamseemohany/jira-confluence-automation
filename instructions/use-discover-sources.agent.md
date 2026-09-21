---
name: use-discover-sources
description: Find candidate reporting input files with the source discovery script.
---

- Use `tools/discover_sources.py` when you need to identify files that may provide reporting input data.
- Pass `--directory` with the directory to search.
- Pass `--pattern` with a recursive glob such as `**/*.json` or `**/*.csv`.
- Pass `--output` to save the JSON inventory; omit it to print the inventory to the terminal.
- Example: `python tools/discover_sources.py --directory data --pattern "**/*.json" --output sources.json`.
- Confirm the discovered paths and file sizes before loading source data.