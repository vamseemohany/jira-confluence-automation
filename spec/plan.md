# Jira/Confluence Automation Implementation Plan

## Metadata

- **Status:** Proposed
- **Version:** 1.0.0
- **Governing constitution:** [constitution.md](constitution.md)
- **Source specification:** [specification.md](specification.md)
- **Clarification review:** [clarify.md](clarify.md)
- **Planning principle:** Resolve implementation-blocking decisions before creating production code that depends on them.

## 1. Delivery Strategy

The implementation will proceed in vertical, testable increments. Each phase produces a usable artifact and has an explicit exit gate. The MVP will first prove the workflow with fixtures, then add live Jira/Confluence adapters, persistence, and the React experience around the same application-service contracts.

The plan deliberately starts with a clarification and architecture gate because the current specification leaves authentication, source contracts, report content, execution mode, empty-result behavior, retry/idempotency, and retention unresolved.

## 2. MVP Boundary

### Included

- React 18/Vite frontend.
- Node.js/Express backend.
- PostgreSQL 15 through Docker for local development.
- Configured Jira and Confluence source adapters.
- Fixture-backed acquisition for development and automated tests.
- Input validation, source validation, normalization, and warning/error classification.
- Versioned Markdown report template and deterministic rendering.
- Persisted report-run history and generated report retrieval.
- Run status, history, report viewing/download, health/readiness, and structured diagnostics.
- Authentication and authorization only to the level selected during Phase 0.

### Excluded

- Production deployment and cloud infrastructure.
- Scheduling, notifications, arbitrary two-way synchronization, destructive external updates, advanced analytics, multi-tenancy, and automated issue creation.

## 3. Phase Overview

| Phase | Name | Primary outcome | Exit milestone |
| --- | --- | --- | --- |
| 0 | Clarify and baseline | Decisions and repository baseline are implementation-ready | M0: Approved implementation contract |
| 1 | Bootstrap foundation | Runnable React, Express, PostgreSQL, and Docker development environment | M1: Clean local bootstrap |
| 2 | Domain and contract design | Versioned schemas, states, errors, persistence model, and golden fixtures | M2: Contract approval |
| 3 | Core backend workflow | Fixture-backed report generation and persisted run lifecycle | M3: Backend vertical slice |
| 4 | External integrations | Tested Jira and Confluence acquisition adapters | M4: Live adapter slice |
| 5 | Frontend workflow | Accessible UI for starting, tracking, reviewing, and downloading runs | M5: End-to-end user slice |
| 6 | Hardening and handoff | Security, reliability, quality, documentation, and release readiness | M6: MVP acceptance |

Phases 1 through 3 should establish a working fixture-based path before live credentials are required. Phase 4 can proceed with mocks in parallel after the normalized contract is approved. Phase 5 depends on stable API contracts from Phases 2 and 3.

## 4. Phase 0: Clarify and Baseline

### Objective

Close the blocking findings in [clarify.md](clarify.md) and document the actual repository/tooling starting point.

### Decisions required

1. Select the MVP authentication and authorization mechanism, roles, endpoint permissions, and error behavior.
2. Select supported Jira and Confluence deployment/API versions, endpoints, authentication modes, permissions, pagination, and rate-limit behavior.
3. Define the normalized source record model and required fields for each supported source type.
4. Approve the canonical report sections, field mappings, Markdown safety rules, timestamp format, timezone, and golden input/output fixtures.
5. Choose synchronous or asynchronous execution, including worker ownership, status refresh, crash recovery, timeout, cancellation, and concurrency limits.
6. Add an explicit empty-result state or define empty results as a completed state with a required outcome field.
7. Define idempotency keys or request fingerprints, retryable failures, retry limits, backoff, and duplicate-run behavior.
8. Decide whether source configuration is preconfigured server-side or editable through an administrator API/UI.
9. Choose report-content storage, retention, deletion, size limits, and whether raw source records are persisted.
10. Define API schemas, HTTP statuses, error envelopes, pagination, and correlation identifiers.

### Work items

- Record decisions in the specification and remove or resolve the corresponding open decisions.
- Add audit fields for actor, request/correlation ID, attempted operation, and outcome.
- Inspect the repository and define scaffolding work for the currently missing or incomplete application baseline.
- Choose package manager, Node.js version policy, migration tool, test runner, lint/format tools, and Docker Compose layout.
- Define environment variable names and provide safe example values without secrets.

### Deliverables

- Updated approved specification.
- Decision record covering authentication, integrations, execution, persistence, and report contract.
- Repository baseline assessment.
- Toolchain and local-development decision record.

### Exit criteria: M0

- No clarification item marked blocking remains unanswered.
- Every user scenario maps to a concrete API state and test fixture.
- The constitution’s auditability and safe-retry principles have corresponding data and behavior.
- Implementation can begin without inventing source fields, report sections, or authorization rules.

## 5. Phase 1: Bootstrap Foundation

### Objective

Create a reproducible application skeleton that runs locally with the required stack.

### Work items

- Establish the root, client, server, database migration, test, and fixture directories.
- Configure React 18 with Vite and a minimal accessible application shell.
- Configure Node.js with Express, environment loading, request parsing, error middleware, and route registration.
- Add PostgreSQL 15 Docker configuration with persistent local volume, health check, and non-secret defaults.
- Add database migration and seed commands.
- Add `.env.example`, `.gitignore` rules, and startup instructions.
- Add package scripts for install, development, build, test, lint, formatting, migration, and fixture verification.
- Implement `GET /health` without requiring the database.
- Implement `GET /ready` with explicit database dependency status.
- Add a shared configuration module that validates required environment variables at startup.

### Deliverables

- Runnable client and server.
- Docker PostgreSQL 15 service.
- Initial migration/seed workflow.
- Local setup documentation.
- CI-compatible quality commands.

### Exit criteria: M1

- A clean checkout can install dependencies and start the client, server, and PostgreSQL using documented commands.
- Health and readiness responses have stable schemas and correct dependency behavior.
- Missing or invalid configuration fails safely without exposing secrets.
- Lint, syntax/type checks, and a smoke test pass.

## 6. Phase 2: Domain and Contract Design

### Objective

Turn the approved specification into executable contracts shared by the backend, frontend, fixtures, and tests.

### Work items

- Define request schemas for source ID, period/filter, and report type.
- Define normalized records for Jira issues and Confluence pages, including source identity and source URL rules.
- Define validation result shape with blocking errors, warnings, record references, and safe messages.
- Define the full run state machine, including empty-result and warning semantics.
- Define retry/idempotency metadata and uniqueness constraints.
- Define API response and error envelopes, status codes, pagination, sorting, and nullable fields.
- Define `ReportRun`, `SourceConfiguration`, and audit structures with indexes, constraints, timestamps, and retention metadata.
- Define the versioned Markdown template and golden fixtures.
- Define report filename, MIME type, encoding, line endings, and download headers.
- Define Markdown escaping and safe URL handling for untrusted source content.

### Deliverables

- Versioned API schemas.
- Database migration design.
- Normalized domain model.
- Run state transition table.
- Golden fixture input/output pairs.
- Report-template specification.

### Exit criteria: M2

- Backend and frontend can consume the same contract definitions.
- Every state has defined entry conditions, terminal behavior, UI representation, and API representation.
- Golden fixtures cover valid, invalid, empty, warning, malformed, and partial-result cases.
- Schema review confirms that report history, auditability, retention, and idempotency are representable.

## 7. Phase 3: Core Backend Workflow

### Objective

Deliver a complete fixture-backed vertical slice from API request through validation, normalization, rendering, persistence, and report retrieval.

### Work items

- Implement source configuration lookup using safe fixture configuration.
- Implement request validation before acquisition.
- Implement fixture acquisition behind the same adapter interface used by live integrations.
- Implement source-record validation and normalized internal records.
- Implement blocking-error and warning classification.
- Implement deterministic Markdown rendering from the versioned template.
- Implement run creation, state transitions, timestamps, correlation IDs, and audit fields.
- Implement transaction boundaries for final run state and report output.
- Implement idempotency and duplicate-run behavior selected in Phase 0.
- Implement `POST /api/report-runs`, `GET /api/report-runs/:runId`, `GET /api/report-runs/:runId/report`, and `GET /api/report-runs`.
- Implement safe error mapping and structured diagnostics.
- Add unit and integration tests using PostgreSQL fixtures.

### Deliverables

- Fixture-backed report-run API.
- Persistence migrations and repositories.
- Validation, normalization, and rendering services.
- Deterministic sample report.
- Backend test suite.

### Exit criteria: M3

- A valid fixture produces a persisted, retrievable report.
- Invalid, empty, warning, integration-failure, and internal-failure paths produce their specified states and error envelopes.
- Repeating the same request follows the approved idempotency policy.
- No route handler contains duplicated domain logic or direct external-system access.
- Tests cover all run-state transitions and required rendering behavior.

## 8. Phase 4: External Integrations

### Objective

Replace fixture acquisition with production-shaped Jira and Confluence adapters while preserving the domain contract.

### Work items

- Implement Jira adapter for the approved deployment/API version and query contract.
- Implement Confluence adapter for the approved deployment/API version and query contract.
- Implement credential loading from protected server configuration.
- Implement pagination, bounded timeouts, rate-limit handling, retry/backoff, and error classification.
- Map source responses to normalized records without leaking provider-specific shapes into the renderer.
- Detect malformed, inaccessible, duplicate, deleted, and unsupported records according to Phase 0 decisions.
- Add adapter contract tests with recorded or synthetic responses; never require live secrets in automated tests.
- Add an explicit safe connection-validation operation if source administration is in scope.
- Verify logs redact tokens, credentials, sensitive payloads, and unsafe query content.

### Deliverables

- Jira adapter and tests.
- Confluence adapter and tests.
- Source contract documentation.
- Integration configuration documentation.
- Failure and retry behavior tests.

### Exit criteria: M4

- Each supported source can produce the approved normalized model.
- Authentication, authorization, timeout, rate-limit, malformed-response, empty, and pagination cases are tested.
- Live verification, if performed, uses least-privilege test credentials and contains no secrets in artifacts.
- Fixture and live adapters produce equivalent domain inputs for equivalent source data.

## 9. Phase 5: Frontend Workflow

### Objective

Deliver the accessible React workflow for starting runs, monitoring status, reviewing history, and retrieving reports.

### Work items

- Build source and reporting-parameter form with client-side validation.
- Add authentication/session handling required by the selected authorization model.
- Implement run submission and the selected polling, refresh, or event-stream behavior.
- Build status presentation for queued, running, completed, completed-with-warnings, empty, validation failure, integration failure, and internal failure.
- Build run history with approved pagination, sorting, filtering, and selection behavior.
- Build report preview and download using the approved output contract.
- Add accessible labels, keyboard flow, focus management, readable contrast, and non-color status indicators.
- Handle backend-unavailable, stale, unauthorized, and expired-session states.
- Add frontend tests for form validation, status transitions, history, report access, and accessibility-critical behavior.

### Deliverables

- End-to-end report-run user interface.
- Accessible status and error components.
- Run-history and report views.
- Frontend test suite.

### Exit criteria: M5

- A user can complete the approved happy path from source selection to report download.
- Every backend terminal state has a clear, accessible UI outcome.
- The frontend never calls Jira, Confluence, or PostgreSQL directly.
- Keyboard and accessibility checks pass for the primary workflow.

## 10. Phase 6: Hardening and Handoff

### Objective

Verify constitutional compliance and prepare the MVP for handoff and repeatable maintenance.

### Work items

- Run unit, integration, adapter, end-to-end, lint, formatting, syntax/type, migration, and fixture-stability checks.
- Run security review for secrets, authorization, CORS, CSRF, request limits, URL handling, Markdown encoding, dependency vulnerabilities, and log redaction.
- Test PostgreSQL restart, application restart, interrupted runs, retry behavior, and migration recovery.
- Validate report determinism, record limits, report-size limits, and configured timeout budgets.
- Verify health/readiness semantics and operational diagnostics.
- Review database indexes, retention/deletion behavior, immutable report policy, and audit records.
- Document setup, environment variables, Docker commands, migrations, test commands, supported integrations, known limitations, and troubleshooting.
- Create a release checklist and record unresolved follow-up work.

### Deliverables

- MVP verification report.
- Security and privacy review.
- Operational runbook.
- Contributor setup and maintenance documentation.
- Known limitations and deferred-work register.

### Exit criteria: M6

- All specification acceptance criteria pass.
- Constitution compliance review passes or approved exceptions are recorded.
- No secret appears in source, generated artifacts, logs, fixtures, or test output.
- A clean environment can reproduce the documented workflow.
- The MVP has a named owner for remaining operational decisions and follow-up work.

## 11. Milestone Dependencies

| Milestone | Depends on | Cannot start until |
| --- | --- | --- |
| M0 | None | Blocking clarification questions have owners and decisions |
| M1 | M0 | Stack, package tooling, Docker layout, and configuration policy are selected |
| M2 | M0, M1 | The repository can run tests and migrations |
| M3 | M2 | API, domain, state, persistence, and report contracts are approved |
| M4 | M2, M3 | Adapter interfaces and normalized records are stable |
| M5 | M2, M3 | API response and state contracts are stable |
| M6 | M3, M4, M5 | The full fixture and live-shaped workflows are available |

## 12. Cross-Cutting Quality Gates

Every phase that changes executable behavior must preserve these gates:

- No credentials, tokens, or sensitive source content are committed or logged.
- Input and external data are validated at the owning boundary.
- API contracts remain explicit and versioned when changed.
- Database changes include reproducible migrations and relevant constraints/tests.
- User-visible errors include safe reason and next action where practical.
- Tests cover both success and failure paths for changed behavior.
- Documentation is updated with implementation changes.
- Any constitutional exception records rationale, risk, mitigation, and review condition.

## 13. Suggested Workstream Breakdown

### Workstream A: Product and contracts

Own Phase 0 decisions, report template, normalized model, acceptance fixtures, API schemas, and clarification updates.

### Workstream B: Platform and persistence

Own Phase 1 bootstrap, Docker PostgreSQL, migrations, repositories, configuration, health/readiness, and operational diagnostics.

### Workstream C: Domain workflow

Own validation, normalization, state machine, idempotency, rendering, report persistence, and backend tests.

### Workstream D: Integrations

Own Jira and Confluence adapters, authentication/configuration, pagination, retry behavior, mapping, and adapter tests.

### Workstream E: Frontend

Own source/run forms, status/history/report views, accessibility, session handling, and frontend tests.

### Workstream F: Verification and handoff

Own end-to-end verification, security review, documentation, release checklist, and known limitations.

## 14. Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Authentication decision is delayed | API and frontend authorization work cannot stabilize | Resolve in M0 and use a documented local test identity for development |
| Jira/Confluence APIs differ from assumptions | Adapter and report work may be reworked | Approve source contracts and fixtures before adapter implementation |
| Large or unstable source responses | Timeouts, memory pressure, incomplete reports | Define pagination, record/size limits, timeouts, and partial-result policy in M0/M2 |
| Report content contains sensitive data | Privacy or access-control incident | Define retention, authorization, redaction, and deletion before M3 persistence is finalized |
| Process interruption loses run state | Misleading history or duplicate work | Use durable state transitions, recovery rules, and idempotency tests |
| Current repository lacks application scaffolding | Schedule and dependency uncertainty | Make bootstrap an explicit M1 milestone and verify from a clean checkout |
| Live integration tests require secrets | Unsafe or non-repeatable CI | Use fixtures/contract tests by default and isolate optional live verification |

## 15. Definition of Plan Completion

This implementation plan is complete when every phase has an owner, deliverables, dependencies, exit criteria, and verification approach; all Phase 0 blocking decisions are recorded; and the resulting implementation tasks can be traced to specification requirements and constitution principles.