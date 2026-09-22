# Specification Clarification Review

## Review Scope

This review compares [constitution.md](constitution.md) with [specification.md](specification.md) as a senior implementation-readiness review. It identifies contradictions, missing decisions, and requirements that cannot yet be implemented or tested unambiguously.

## Summary

The specification establishes a useful MVP direction, but it is not yet ready for implementation planning without clarification. The highest-risk gaps are:

1. No authentication or authorization mechanism is selected, despite authorization being required throughout the specification and constitution.
2. Jira and Confluence source contracts, endpoints, authentication modes, required fields, and mappings are unspecified.
3. The report execution model is undefined: synchronous versus asynchronous processing, worker behavior, polling, concurrency, and recovery are not decided.
4. Empty results have no defined run state, although the state enum is presented as exhaustive.
5. Retry, idempotency, partial failure, and duplicate-run behavior are described conceptually but have no concrete contract.
6. The repository’s current application/tooling state does not yet demonstrate the React 18/Vite, Node.js/Express, or PostgreSQL implementation baseline asserted by the documents.

## Blocking Clarifications

These decisions should be resolved before implementation tasks are generated.

### C-001: Authentication and authorization

**References:** Constitution Principle II; Specification User Roles; FR-022; Security and Privacy Requirements; Assumptions and Open Decisions.

The specification requires authorized callers and separates Report User, Project Administrator, and Operator/Developer roles, but does not define the identity provider, login flow, session/token mechanism, role assignment, or authorization rules for each endpoint.

**Clarify:**

- Is authentication in scope for the MVP?
- Which mechanism is required: local accounts, OIDC/OAuth, JWT, reverse-proxy identity, or another provider?
- Which role may start runs, view history, download reports, configure sources, and inspect diagnostics?
- How are unauthenticated and unauthorized requests represented, including HTTP status and response body?
- Is the Operator/Developer role an application role or an operational access assumption?

### C-002: Jira and Confluence source contracts

**References:** Goals; FR-001 through FR-006; Data Model; Assumptions and Open Decisions.

The specification names Jira and Confluence but does not identify the supported Jira deployment/API version, Confluence deployment/API version, endpoints, query language, pagination model, authentication method, required permissions, response fields, or mapping into the common model.

**Clarify:**

- Are Jira Cloud, Jira Server/Data Center, Confluence Cloud, or Confluence Server/Data Center supported?
- Which API versions and endpoints are used for the MVP?
- What exact Jira issue fields and Confluence page fields are required?
- What is the normalized record schema for each source type?
- How are pagination, rate limits, deleted records, inaccessible records, and duplicate records handled?
- Can one report combine Jira and Confluence data, or is each run tied to exactly one source type?

### C-003: Report definition and required content

**References:** Primary outcome; FR-013 through FR-018; Success Criteria; Assumptions and Open Decisions.

The specification requires a versioned Markdown template and required metadata but does not define the report sections, required fields, ordering rules, link format, date/time zone, or a canonical example. The statement that report sections and required source fields will be finalized later conflicts with the requirement that the specification be testable before implementation.

**Clarify:**

- What exact sections must every report contain?
- Which fields are required in each section and what are their fallback values?
- What Markdown dialect and escaping rules are required for source content, URLs, tables, and multiline text?
- Which time zone and timestamp format are canonical?
- What is the expected output for no data, warnings, partial source data, and long content?
- Where is the golden sample input/output that tests FR-014 and FR-017?

### C-004: Execution model and run lifecycle

**References:** Scenario A; Scenario D; Scenario F; FR-019; FR-020; FR-032; API Contract.

The API starts a run and returns a status link, which suggests asynchronous processing, but no worker, queue, polling, refresh, or completion mechanism is defined. The behavior of `queued` and `running` is therefore unclear.

**Clarify:**

- Is `POST /api/report-runs` synchronous for small fixture runs or always asynchronous?
- What component executes queued work: the Express process, a background worker, or an external queue?
- How does the frontend learn that a run completed: polling interval, server-sent events, WebSocket, or manual refresh?
- What happens to `queued` or `running` runs after a process crash or restart?
- Is there a maximum run duration and a cancellation operation?
- What concurrency limit applies per user, source, and application instance?

### C-005: Empty-result state

**References:** Scenario C; FR-019; FR-025; Success Criteria.

Scenario C requires an explicit empty-result status or documented no-data outcome, but `empty` is absent from the enumerated run states. FR-012 also prevents a successful report when blocking validation errors exist, but it does not say whether zero records is a validation error, a warning, or a completed result.

**Clarify:**

- Add an explicit `completed_empty` state, or define empty results as `completed` with a required flag.
- Is an empty result downloadable as a report?
- Is no data expected and non-error for every report type, or only for selected scopes?
- What exact UI message and API payload represent this case?

### C-006: Retry and idempotency contract

**References:** Constitution Principle I and III; Scenario D; Scenario F; FR-004; FR-023; Reliability Requirements.

The documents require safe retries and idempotency but do not define an idempotency key, request fingerprint, retry count, backoff, timeout values, or duplicate detection policy. The MVP excludes destructive external updates, which reduces risk but does not resolve duplicate report-run creation.

**Clarify:**

- Does the client provide an `Idempotency-Key` header, or does the server derive a request fingerprint?
- What constitutes the same run: source, filter, report type, template version, and time window?
- How long are idempotency keys retained?
- Which error classes are retryable and what are the maximum attempts and backoff limits?
- Does a retry create a new run linked to the old run or resume the old run?

### C-007: Source configuration ownership

**References:** Report User role; Project Administrator role; FR-001 and FR-002; SourceConfiguration; Technical Stack.

Report Users are said to be able to configure a source, while Project Administrators configure source connection metadata through server-side configuration. No API, UI, or permission boundary resolves whether users can create/edit sources or only select preconfigured ones.

**Clarify:**

- Is source creation/editing in the MVP?
- If yes, which role can perform it and through which API/UI?
- If no, change Report User wording to “select a configured source.”
- Are source configurations stored in PostgreSQL or environment files?
- Where are credentials stored and how are they rotated?
- What source fields are mutable after runs have referenced them?

### C-008: Data persistence and report retention

**References:** Constitution Principle IV; Goals; FR-018 and FR-020; ReportRun; Security and Privacy Requirements.

The specification allows either storing report content or a durable output reference and defers retention/deletion until production use. This is insufficient for the MVP’s report-history and download requirements and leaves sensitive-content lifecycle undefined.

**Clarify:**

- Must PostgreSQL store the Markdown body, or is a filesystem/object store allowed?
- If an output reference is allowed, what storage system and local Docker setup are required?
- What retention period, deletion trigger, and operator deletion workflow apply?
- Are raw source records persisted, or only normalized data/report output?
- What size limit applies to report content and source payloads?
- How are old template versions and reports rendered or downloaded after a template change?

### C-009: Failure persistence when PostgreSQL is unavailable

**References:** Scenario D; FR-020 and FR-021; Reliability Requirements; `GET /ready`.

The system must persist lifecycle and failure details, but Scenario D includes database unavailability. If PostgreSQL is unavailable, the backend cannot reliably record the run’s final state or execution summary.

**Clarify:**

- Should a database outage prevent run creation before any integration call?
- Is an in-memory or file-backed failure record acceptable locally?
- How does the system reconcile a run after the database returns?
- What does `GET /ready` return during a database outage, and can health endpoints run without database access?

### C-010: API error and pagination contracts

**References:** API Contract; FR-004; FR-011; FR-031; FR-032.

The endpoint list names response fields but does not define JSON schemas, required versus nullable fields, HTTP status codes, error codes, validation error shape, pagination parameters, sorting, or maximum page size.

**Clarify:**

- Define request/response JSON schemas for every endpoint.
- Define status codes for validation, authentication, authorization, not found, conflict, rate limit, dependency failure, and internal failure.
- Define a stable error envelope with safe user messaging and correlation/run identifiers.
- Define `limit`, cursor or offset, sorting, default page size, and maximum page size for run history.
- Define whether `links` are absolute or relative and whether they are required in every response.

## Contradictions and Tensions

### X-001: Report User configuration versus server-managed configuration

The Report User is described as able to configure a source, while the Project Administrator owns configuration through server-side mechanisms. These permissions cannot both be authoritative without a defined distinction between selecting a source and editing a source.

### X-002: Empty-result behavior versus exhaustive status enum

An empty outcome is required but has no corresponding status in the only enumerated lifecycle list. The frontend is also required to show an empty state without an API representation for it.

### X-003: “Every completed report” versus incomplete/failed output

FR-016 requires metadata on every completed report, while the report endpoint disallows output for incomplete or failed runs. This is not inherently invalid, but the specification must distinguish `completed_empty`, `completed_with_warnings`, and failed runs and define whether a warning report is considered trustworthy output.

### X-004: MVP scope versus production-oriented requirements

Production deployment is out of scope, but the documents require authorization, least-privilege credentials, secrets management, audit context, retention behavior, health/readiness semantics, and production-use retention decisions. These may be appropriate design constraints, but the specification must label which are MVP implementation requirements and which are deployment prerequisites.

### X-005: Constitution audit requirement versus specification data model

The constitution requires enough context to audit who initiated an automation, what it attempted, and whether it succeeded. `ReportRun` has no actor/user identifier, request correlation identifier, audit event structure, or attempted-operation details.

### X-006: Constitution’s “safe to retry” requirement versus unspecified retry behavior

The constitution makes safe retry a non-negotiable outcome, while the specification leaves request identity, duplicate detection, retry limits, and interrupted-run recovery as open decisions. The implementation cannot demonstrate compliance until these are defined.

## Unclear or Non-Testable Requirements

### U-001: “Representative” and “known” data

Goals and verification require representative or known fixtures but do not define fixture contents, source shape, record count, edge cases, or expected report output.

### U-002: “Appropriate” retry rules and “bounded” timeouts

FR-004 and the Reliability Requirements use qualitative terms without numeric defaults or configuration boundaries. Define timeout budgets, connection timeout versus request timeout, maximum attempts, backoff, and retryable status/error codes.

### U-003: “Actionable” and “safe” errors

The UI and API must provide actionable, safe errors, but no taxonomy maps internal failures to user messages. Define which details are shown to users, which are logged, and how support correlates the two.

### U-004: “Material” warnings

FR-016 requires material warnings, but materiality is undefined. Define warning categories, severity, whether warnings block download, and whether warning text is persisted verbatim.

### U-005: “Equivalent” contracts and structures

The API and data model say the implementation may provide equivalent contracts/structures. This weakens reviewability. Define normative field names, types, nullability, constraints, indexes, and migration expectations, or explicitly identify which parts remain implementation choices.

### U-006: Source scope and reporting parameters

`sourceScope`, `period`, and `filter` are used without types or grammar. Define whether a period is a date range, named reporting period, timezone-aware timestamp range, or Jira/Confluence query. Define supported filters and maximum query size.

### U-007: Status refresh behavior

The frontend may poll or refresh, but the required freshness, polling interval, terminal-state behavior, and handling of stale responses are unspecified.

### U-008: Download behavior

“View and download” does not define filename, MIME type, character encoding, line endings, caching headers, or whether the download includes warnings and metadata.

### U-009: Markdown safety

“Safely encoded for Markdown output” does not define escaping for headings, links, tables, HTML, code fences, or untrusted Jira/Confluence content. Define whether raw HTML is allowed and how links are validated.

### U-010: Accessibility threshold

The constitution and FR-028 require accessibility but do not specify a target such as WCAG 2.2 AA, supported browsers, focus behavior, or automated/manual checks.

### U-011: Operational diagnostics

Structured diagnostics are required, but the log schema, levels, retention, correlation ID format, metrics, and redaction rules are not specified. “Execution summary” is also not defined as an API response, log event, or persisted record.

### U-012: Performance and capacity

There are no targets for report completion time, API latency, maximum source records, maximum report size, concurrent runs, database growth, or rate-limit handling. Without these, timeout and pagination choices cannot be evaluated.

### U-013: Time and consistency semantics

The specification requires timestamps and stable repeated output but does not define clock source, timezone, precision, source snapshot consistency, or behavior when Jira/Confluence changes during a run.

### U-014: Template versioning

A versioned template is required, but the version format, storage location, compatibility policy, migration behavior, and relationship to `template_version` are missing.

### U-015: Partial source failures

The documents mention partial failures and warnings but do not define whether a report may be generated from partial Jira/Confluence data, which records are excluded, how completeness is shown, or what status applies.

### U-016: Configuration and onboarding

The constitution requires a contributor to install, configure, start, and validate the project, but the specification does not define required environment variables, Docker services, seed data, migration command, package manager, or frontend/backend start commands.

### U-017: Current repository baseline

The specification assumes the stated stack, while the current repository baseline does not yet establish a usable package manifest or demonstrated React/Vite, Express, and PostgreSQL application path. The implementation plan should either treat scaffolding as an explicit prerequisite or revise the specification to reflect the current MVP tooling.

## Missing Requirements

- Define audit fields and audit-event retention to satisfy the constitution’s auditability principle.
- Define CSRF protection, CORS policy, rate limiting, request size limits, and dependency security expectations for the web API.
- Define database constraints, indexes, uniqueness rules, and migration tooling for `ReportRun` and `SourceConfiguration`.
- Define source connection validation and a safe test-connection operation, if administrators can configure sources.
- Define authorization for report content because reports may contain sensitive Jira/Confluence information.
- Define whether raw external URLs may be displayed and how URL schemes/hosts are validated.
- Define a maximum number of records and a truncation/failure policy for oversized source results.
- Define how source schema/API changes are detected and reported.
- Define clock and timezone behavior for scheduled-like reporting periods even though scheduling is out of scope.
- Define browser support and frontend error behavior when the backend is unreachable.
- Define migration rollback or recovery expectations, especially because the constitution requires deliberate handling of destructive migrations.
- Define test isolation, fixture reset, and whether integration tests use a real PostgreSQL Docker container.
- Define how secrets are supplied in local development without committing `.env` values.
- Define whether report content is immutable after completion and whether a report can be regenerated from a stored snapshot.

## Recommended Clarification Order

1. Decide MVP boundary, current repository baseline, and whether authentication is included.
2. Define Jira/Confluence source types, API versions, authentication, normalized schema, and required fields.
3. Define the canonical report template, golden fixtures, empty/partial-result rules, and output encoding.
4. Choose synchronous/asynchronous execution and finalize lifecycle, retry, idempotency, concurrency, and recovery behavior.
5. Define authorization, API schemas, error envelopes, pagination, persistence, retention, and audit fields.
6. Add measurable reliability, performance, accessibility, security, and verification thresholds.

## Review Conclusion

The specification is directionally coherent with the constitution, but it should remain in clarification rather than advance directly to implementation tasks. The most important next artifact is a clarified contract for identity, source data, report content, run lifecycle, and persistence. Once those decisions are recorded, the remaining quality and operational requirements can be converted into testable plan and task items.