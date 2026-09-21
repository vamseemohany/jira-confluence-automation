---
name: use-render-computed-report
description: Compute numeric summaries and insert them into a report template.
---

- Use `tools/render_computed_report.py` when a report template needs calculated count, total, average, minimum, or maximum values.
- Pass `--template` with a text template containing placeholders such as `{{total}}` and `{{average}}`.
- Pass `--data` with a JSON list of records or an object containing a `records` list.
- Pass `--number-field` with the record field whose values should be calculated.
- Pass `--output` with the generated report path.
- Example: `python tools/render_computed_report.py --template reports/template.md --data work/progress.json --number-field completed --output work/report.md`.
- Confirm the input field contains numeric values and review the generated report for unreplaced placeholders.