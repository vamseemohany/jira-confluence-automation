---
name: main
description: Main project agent that coordinates the available instruction files.
---

# Instruction Files

- `instructions/create-status-report.agent.md` - Generates concise weekly status reports in Markdown.
	+ Status: Battle-tested through three generated reports and structural validation.
- [`./instructions/creating-instructions.agent.md`](./creating-instructions.agent.md) - Creates and maintains reusable project instructions and instruction catalogs.
	+ Keywords: create instruction, update instruction, instruction catalog, agent instructions
	+ Status: Battle-tested through instruction creation, catalog updates, and validation.
- [`./instructions/complete-backlog-tasks.agent.md`](./complete-backlog-tasks.agent.md) - Completes backlog tasks incrementally with validation and accurate tracking.
	+ Keywords: backlog, TODO, unchecked tasks, phase, step by step, validate
	+ Status: Battle-tested through two backlog executions, a recovery rerun, and validation.

- [`./instructions/use-discover-sources.agent.md`](./use-discover-sources.agent.md) - Finds candidate reporting input files with the source discovery script.
	+ Keywords: discover sources, find files, input sources, source inventory
	+ Status: Tested with repository Markdown source discovery.
- [`./instructions/use-load-source-data.agent.md`](./use-load-source-data.agent.md) - Loads JSON, CSV, or text source files into normalized JSON.
	+ Keywords: load data, source data, CSV, JSON, normalize input
	+ Status: Tested with Markdown text loading.
- [`./instructions/use-render-computed-report.agent.md`](./use-render-computed-report.agent.md) - Computes numeric summaries and renders them into a report template.
	+ Keywords: computed values, calculate totals, render report, report template
	+ Status: Tested with discovered source metadata and report rendering.

# Project Documentation

- [`../reports/project-scope.md`](../reports/project-scope.md) - Defines the reporting workflow scope, success criteria, and MVP boundaries.
- [`../reports/repository-structure.md`](../reports/repository-structure.md) - Documents repository structure and naming conventions.
