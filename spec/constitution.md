# Project Constitution

## Project

Jira/Confluence Automation

## Purpose

This constitution defines the non-negotiable engineering principles for building and maintaining the Jira/Confluence automation project. It is the governing reference for feature specifications, implementation plans, code reviews, and acceptance decisions.

## Principles

### I. User-Visible Outcomes First

Every feature MUST describe the user-visible outcome, supported workflow, acceptance criteria, and failure behavior before implementation begins. Automation MUST be predictable, explainable, and safe to retry. A feature is incomplete until its documentation and validation path are defined.

### II. Layered Web Architecture

The frontend MUST use React 18 with Vite and remain responsible for presentation, interaction state, and client-side validation. The backend MUST use Node.js with Express and remain responsible for authentication, authorization, business rules, integration orchestration, and persistence access. Frontend code MUST NOT connect directly to PostgreSQL or contain server credentials.

The API boundary MUST use explicit request and response contracts. Business logic MUST be kept out of route handlers when it can be expressed in a service or domain module, and shared behavior MUST NOT be duplicated across controllers.

### III. Secure External Integrations

Jira and Confluence credentials, tokens, and connection details MUST be supplied through environment configuration or a secrets manager and MUST NOT be committed to source control, exposed to the browser, or written to logs. Integration calls MUST use least-privilege credentials, bounded timeouts, appropriate retry rules, and actionable error handling.

Operations that create, update, or delete external content MUST be explicit about their target, authorization, and idempotency behavior. The system MUST preserve enough context to audit who initiated an automation, what it attempted, and whether it succeeded.

### IV. Data Integrity and PostgreSQL Ownership

PostgreSQL 15 is the system of record for application data that must persist across restarts. Database access MUST go through the backend data-access boundary. Schema changes MUST be versioned and reproducible, and destructive migrations MUST require deliberate review.

Input from users and external APIs MUST be validated at the boundary, normalized before storage, and handled without silently discarding information. Transactions MUST be used when multiple related writes must succeed or fail together.

### V. Reproducible Local Development

PostgreSQL MUST be runnable through Docker with documented configuration and initialization steps. A new contributor MUST be able to install dependencies, configure required environment variables, start the frontend and backend, and run validation using repository documentation alone.

Local and automated environments MUST use repeatable commands and MUST avoid dependence on untracked machine-specific state.

### VI. Testable, Observable Delivery

Each feature MUST include validation appropriate to its risk. API contracts, authorization rules, data transformations, and Jira/Confluence integration behavior MUST have automated tests or a documented repeatable verification procedure. Regression coverage MUST be added when fixing a defect.

The backend MUST emit useful structured diagnostics without logging secrets or sensitive content. Failures MUST identify the operation and a remediation path where practical. Health and readiness checks MUST distinguish application availability from database or integration availability.

### VII. Accessible and Maintainable UI

The React interface MUST support keyboard navigation, meaningful labels, readable contrast, and clear loading, empty, success, and error states. Components SHOULD be small, composable, and consistent with established project patterns. User-facing automation results MUST communicate status, scope, and actionable failures without requiring access to server logs.

### VIII. Documentation as a Delivery Artifact

Specifications, API contracts, setup instructions, environment requirements, migration notes, and operational limitations MUST be updated with the implementation they describe. Documentation MUST state assumptions and out-of-scope behavior rather than implying unsupported capabilities.

## Technical Baseline

- Frontend: React 18 with Vite.
- Backend: Node.js with Express.
- Database: PostgreSQL 15, run locally through Docker.
- External systems: Jira and Confluence APIs accessed only by the backend.
- Primary quality gates: linting, automated tests, API validation, database migration checks, and documented end-to-end verification.

## Change Control

Any proposal that violates a principle MUST document the reason, affected behavior, risk, mitigation, and expiration or review condition. Temporary exceptions require explicit approval in the relevant specification or pull request. New principles and amendments MUST be reviewed for impact on existing specifications, tests, and operational documentation.

## Compliance Review

Before implementation is considered complete, reviewers MUST verify that:

- The specification and acceptance criteria are present and testable.
- The frontend/backend boundary and API contract are respected.
- Secrets and external integration permissions are handled securely.
- Database changes are reproducible and preserve data integrity.
- Automated or repeatable validation covers the changed behavior.
- User-facing states and relevant documentation are complete.

**Version:** 1.0.0  
**Ratified:** 2026-09-22