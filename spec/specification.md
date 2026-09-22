# Jira/Confluence Automation Specification

## Metadata

- **Status:** Draft for implementation planning
- **Version:** 1.0.0
- **Constitution:** [constitution.md](constitution.md)
- **Primary outcome:** A repeatable workflow that loads Jira/Confluence reporting data, validates and normalizes it, and produces a readable Markdown status report.

## 1. Overview

The system will provide a web-based workflow for preparing status reports from Jira and Confluence data. A user will select or provide an authorized source, request a report run, review the resulting status and validation messages, and retrieve the generated Markdown report.

The first release is an MVP focused on reliable data acquisition, normalization, templated report generation, and clear validation. It will establish service boundaries that can later support scheduled runs, additional report formats, and broader Jira/Confluence automation.

## 2. Goals

- Load representative data from configured Jira and Confluence sources.
- Validate required fields and identify missing, malformed, or empty input.
- Normalize source-specific data into a predictable internal model.
- Generate consistently structured Markdown status reports.
- Provide clear run status, errors, and output access through the web application.
- Persist report runs and their results in PostgreSQL 15.
- Make local development reproducible with Docker for PostgreSQL.
- Provide automated or repeatable checks for the critical workflow.

## Technical Stack

- **Frontend:** React 18 with Vite.
- **Backend:** Node.js with Express.
- **Database:** PostgreSQL 15 running through Docker for local development.
- **External systems:** Jira and Confluence APIs accessed through backend adapters.

## 3. Non-Goals

- Production deployment or cloud infrastructure.
- Replacing Jira or Confluence as a system of record.
- Arbitrary two-way synchronization of all Jira and Confluence content.
- Unapproved external integrations.
- Full workflow scheduling, notifications, or multi-tenant administration in the MVP.
- Destructive updates to Jira or Confluence content.
- A report format other than Markdown in the MVP.

## 4. User Roles

### Report User

Can configure or choose an available reporting source, start a report run, inspect validation results, and view or download completed reports.

### Project Administrator

Can configure source connection metadata and report templates through approved server-side configuration. Credentials remain server-managed and are never displayed in the browser.

### Operator or Developer

Can inspect structured run diagnostics, health information, and failure details needed to troubleshoot the workflow without exposing secrets or sensitive source content.

## 5. User Scenarios and Acceptance Criteria

### Scenario A: Generate a report from valid source data

**Given** an authorized, reachable Jira or Confluence source and valid reporting parameters, **when** the user starts a run, **then** the system validates the input, normalizes the source data, generates a Markdown report, persists the run result, and shows the completed report with its generation timestamp and source scope.

### Scenario B: Reject incomplete source data

**Given** source data is missing a required field, **when** the run is validated, **then** the system marks the run as failed validation, identifies the affected field or record, does not generate a misleading report, and provides an actionable correction message.

### Scenario C: Handle an empty result

**Given** the source responds successfully but contains no matching records, **when** the user runs the report, **then** the system completes with an explicit empty-result status or a clearly documented no-data outcome and does not present empty content as a successful populated report.

### Scenario D: Handle a transient integration failure

**Given** Jira, Confluence, or the database is temporarily unavailable, **when** the run encounters the failure, **then** the system uses bounded retries where appropriate, records a safe diagnostic, marks the run with a meaningful failure state, and allows the user to retry without duplicating a completed report.

### Scenario E: Review previous runs

**Given** report runs have been persisted, **when** the user opens run history, **then** the system lists the run status, source scope, timestamps, and report availability without exposing credentials or internal secrets.

### Scenario F: Recover from an interrupted run

**Given** a run stops before completion, **when** the user starts the same operation again, **then** the system does not claim the interrupted run succeeded and the retry has an explicit, documented idempotency behavior.

## 6. Functional Requirements

### 6.1 Source configuration and acquisition

- **FR-001:** The backend MUST accept a report request containing a source identifier, reporting period or filter, and requested report type.
- **FR-002:** The backend MUST resolve source credentials and connection details from protected server configuration.
- **FR-003:** The backend MUST call Jira and Confluence only from the server-side integration layer.
- **FR-004:** Integration requests MUST use bounded timeouts and classify authentication, authorization, validation, rate-limit, transient, and permanent failures.
- **FR-005:** The acquisition layer MUST return a stable internal result envelope containing source metadata, records, warnings, and failure details.
- **FR-006:** The system MUST support representative fixture or mock data so the workflow can be validated without live external access.

### 6.2 Validation and normalization

- **FR-007:** Required request fields MUST be validated before an external call is made.
- **FR-008:** External records MUST be validated against a documented source contract before report rendering.
- **FR-009:** The system MUST identify missing, malformed, duplicate, and unsupported records without silently discarding them.
- **FR-010:** Valid source records MUST be normalized into a common model independent of Jira or Confluence response shape.
- **FR-011:** Validation results MUST distinguish blocking errors from non-blocking warnings.
- **FR-012:** A report MUST NOT be marked successful when blocking validation errors prevent trustworthy output.

### 6.3 Report generation

- **FR-013:** The renderer MUST generate Markdown using a versioned template.
- **FR-014:** Generated reports MUST use stable section ordering, headings, labels, bullets, spacing, and metadata formatting.
- **FR-015:** The renderer MUST support optional sections and omit unavailable optional content without breaking the report.
- **FR-016:** Every completed report MUST identify its reporting period, source scope, generation time, and any material warnings.
- **FR-017:** Repeating the same normalized input and template version MUST produce equivalent report content.
- **FR-018:** The system MUST retain or make available the generated Markdown for a completed run.

### 6.4 Run lifecycle and persistence

- **FR-019:** Each run MUST have a unique identifier and one of these states: `queued`, `running`, `completed`, `completed_with_warnings`, `failed_validation`, `failed_integration`, or `failed_internal`.
- **FR-020:** The backend MUST persist run request metadata, lifecycle timestamps, status, warnings, failure classification, and output location or content reference.
- **FR-021:** Related run and output writes MUST be transactional when partial persistence would create misleading history.
- **FR-022:** The API MUST expose run status and completed output only to an authorized caller.
- **FR-023:** Retrying a run MUST have documented idempotency behavior and MUST NOT duplicate a known completed output unintentionally.

### 6.5 Frontend experience

- **FR-024:** The React application MUST provide controls for source scope, reporting parameters, and starting a run.
- **FR-025:** The interface MUST show loading, empty, validation-error, integration-error, completed, and warning states.
- **FR-026:** The interface MUST provide a run-history view with filtering or selection sufficient to find a recent run.
- **FR-027:** A completed run MUST provide an accessible way to view and download the Markdown report.
- **FR-028:** Forms and status controls MUST support keyboard navigation, meaningful labels, readable contrast, and non-color-only status communication.

### 6.6 Operations and observability

- **FR-029:** The backend MUST provide application health and database readiness checks.
- **FR-030:** Logs MUST include a correlation or run identifier for workflow events and MUST exclude credentials, tokens, and unnecessary sensitive source data.
- **FR-031:** User-visible failures MUST include an operation, safe reason, and next action where practical.
- **FR-032:** The workflow MUST produce an execution summary suitable for troubleshooting and repeatable verification.

## 7. API Contract

The exact route names may be finalized during planning, but the implementation MUST provide equivalent contracts.

### Start a report run

`POST /api/report-runs`

Request fields:

- `sourceId`: configured source identifier.
- `period` or `filter`: reporting scope.
- `reportType`: supported report template identifier.

Response fields:

- `runId`
- `status`
- `createdAt`
- `links.status`

### Get run status

`GET /api/report-runs/:runId`

Response fields:

- `runId`
- `status`
- `sourceScope`
- `createdAt`
- `startedAt`
- `completedAt`
- `warnings`
- `error`
- `reportAvailable`
- `links.report` when available

### Get report output

`GET /api/report-runs/:runId/report`

Returns the generated Markdown for an authorized completed run. Incomplete or failed runs MUST return a structured error rather than partial content unless partial output is explicitly supported by a future specification.

### List run history

`GET /api/report-runs`

Returns a paginated list of runs with status, scope, timestamps, and report availability. It MUST NOT return secrets or raw credentials.

### Health and readiness

- `GET /health` reports application process health.
- `GET /ready` reports whether required local dependencies, including PostgreSQL, are available.

## 8. Data Model

The implementation MUST provide equivalent persistent structures for the following concepts:

### ReportRun

- `id`
- `source_id`
- `report_type`
- `period_or_filter`
- `status`
- `created_at`
- `started_at`
- `completed_at`
- `template_version`
- `warning_summary`
- `error_code`
- `error_summary`
- `report_content` or a durable output reference

### SourceConfiguration

- `id`
- `name`
- `source_type`
- `base_url` or connection reference without secret material
- `enabled`
- `created_at`
- `updated_at`

Secret values MUST be stored outside source control and MUST NOT be returned by API responses. The final schema and migration strategy MUST be documented in the implementation plan.

## 9. Architecture and Boundaries

- **React/Vite frontend:** user interaction, request initiation, run polling or refresh, report display, and accessible status presentation.
- **Node.js/Express API:** authentication and authorization boundary, request validation, run lifecycle coordination, and response contracts.
- **Application services:** source acquisition, normalization, validation, report rendering, and retry/idempotency policy.
- **Persistence layer:** PostgreSQL 15 access, migrations, transactions, and run history storage.
- **Integration adapters:** Jira and Confluence clients with source-specific mapping, timeout, retry, and error classification.
- **Docker:** local PostgreSQL runtime and reproducible development dependency.

The frontend MUST NOT call Jira, Confluence, or PostgreSQL directly. Route handlers MUST delegate business behavior to application services.

## 10. Security and Privacy Requirements

- Credentials and tokens MUST be supplied through environment configuration or a secrets manager.
- Secrets MUST NOT appear in committed files, browser bundles, API responses, logs, error messages, or generated reports.
- External API permissions MUST follow least privilege.
- Every report run and report retrieval MUST pass the applicable authorization check.
- User-provided filters and external content MUST be validated and safely encoded for Markdown output.
- The system MUST define retention and deletion behavior for persisted report content before production use.

## 11. Reliability Requirements

- Integration calls MUST have bounded timeouts.
- Retries MUST be limited to transient failures and MUST use an explicit backoff policy.
- A retry MUST NOT repeat a destructive external operation because the MVP does not perform destructive external updates.
- Database writes that define a run’s final state MUST be durable and transactional.
- The application MUST fail with a classified, user-safe error when a dependency is unavailable.

## 12. Quality and Verification

The implementation is acceptable only when all of the following are demonstrated:

- Unit tests cover validation, normalization, conditional sections, status transitions, and Markdown rendering.
- Integration tests cover the API-to-service-to-database path using representative fixture data.
- Adapter tests cover successful responses, authentication failures, rate limits, timeouts, malformed responses, and empty results.
- An end-to-end verification produces a known report from a known input and checks structure and required content.
- Repeated runs with identical input produce stable output apart from explicitly dynamic metadata.
- Linting, formatting, type or syntax checks, and migration checks pass.
- The UI is verified for keyboard access and all required run states.
- Documentation describes setup, environment variables, local Docker usage, execution, and troubleshooting.

## 13. Success Criteria

- A new contributor can start PostgreSQL 15 through Docker and run the application using documented steps.
- A representative Jira/Confluence fixture can be loaded without live credentials.
- Valid input produces a structured Markdown report with required metadata.
- Invalid, empty, and unavailable-source cases produce distinct, actionable outcomes.
- A user can inspect run history and retrieve a completed report through the React interface.
- No secrets are exposed in source control, browser output, logs, API responses, or reports.
- The workflow has automated or repeatable regression checks and documented known limitations.

## 14. Assumptions and Open Decisions

- The initial report format is Markdown and follows the repository’s existing report conventions.
- Jira and Confluence authentication details and exact API versions will be selected during technical planning.
- The MVP uses configured source connections rather than user-managed OAuth flows unless a later specification adds that capability.
- The precise report sections and required source fields must be finalized before implementation tasks are generated.
- Authentication provider, authorization roles, report retention duration, and production deployment model remain implementation-planning decisions.

## 15. Out of Scope for This Specification

Scheduling, notifications, bulk mutation of Jira or Confluence, production infrastructure, advanced analytics, organization-wide multi-tenancy, and automated issue creation are deferred until separately specified.

## 16. Definition of Done

A change covered by this specification is complete when its acceptance criteria, tests or repeatable checks, API and data contracts, user-facing states, security review, and relevant documentation are all updated and passing. Any deviation from the constitution MUST be documented with its rationale, risk, mitigation, and review condition.