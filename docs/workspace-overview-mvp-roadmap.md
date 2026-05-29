# Workspace Overview MVP And Future Roadmap

## Current MVP Implementation

The `/workspace` dashboard overview is implemented as a production-oriented command center for the Winglo AI workforce. It remains accessible in local development without sign-in by using the demo organization ID, but production now fails loudly when no organization resolver/default organization is configured.

Implemented MVP behavior:

- Server-rendered overview page at `/workspace`.
- Page-level `WorkspaceOverviewService` in `lib/workforce/workspace-overview.ts`.
- Mock/live data source resolution through existing runtime environment guardrails.
- Local development can use the demo org without sign-in.
- Production does not silently fall back to the demo org when no organization is configured.
- KPI cards for deployed AI employees, active runs, pending approvals, and workflows.
- Production agent visibility is limited to deployed agents.
- Pending approval count remains visible to viewer-role users because the overview is read-only.
- Latest workflow, approval, report, and activity previews.
- Connector health panel with connected, attention, error, and not-connected counts.
- Inline “New operation” launcher from the overview header.
- Reports are previewed on the overview but only opened through the reports archive.
- Panel-level empty states for workflows, approvals, reports, and activity.
- Panel-level load failure messages instead of silently hiding backend errors.
- Tests for overview aggregation, production org guardrails, dev demo-org access, and launcher behavior.

## Current Data Sources

The overview currently reads through DAL-backed services:

- `ai_agents` via `getAIAgents`
- `ai_runs` via `getActiveAIRuns`
- `approvals` via `getApprovals`
- `workflows` via `getWorkflows`
- `reports` via `getReports`
- `activity_events` via `getActivityEvents`
- `connector_accounts` via `getConnectorAccounts`

When `NEXT_PUBLIC_USE_MOCK_DATA=true`, these DAL calls can still return fixture-backed data in local or explicitly opted-in preview environments. Production mock mode remains blocked by runtime guardrails.

## MVP Constraints

The overview page is intentionally read-mostly in MVP.

- Inline approval decisions are handled on `/workspace/approvals`, not on the overview.
- Workflow creation and execution are handled on `/workspace/workflows`, not directly on the overview.
- Report artifacts are opened from `/workspace/reports`, not directly from the overview preview.
- Connector OAuth/configuration is handled on `/workspace/integrations`.
- The inline launcher routes users into existing production-ready surfaces instead of starting autonomous operations directly.
- Authenticated organization membership is not fully implemented yet; production currently requires `WINGLO_DEFAULT_ORG_ID` until the real auth resolver is added.

## Planned Future Implementation

Phase 2:

- Replace `WINGLO_DEFAULT_ORG_ID` production fallback with authenticated user, organization membership, and active organization switching.
- Add role-aware authorization for operation launch, workflow mutation, approval decisions, and connector configuration.
- Add true aggregate count queries instead of loading full collections for counts.
- Add connector freshness, last sync age, and sync failure drilldowns.
- Add alert and signal summaries to the overview.
- Add workspace briefing generation from recent runs, approvals, connector state, and reports.
- Add workflow run summaries from `workflow_runs` alongside `ai_runs`.

Phase 3:

- Add a richer operation launcher that can start validated workflow runs directly from the overview.
- Add multi-agent handoff visibility.
- Add cross-agent orchestration status and queued work by department.
- Add inline retry/escalation affordances for failed runs.
- Add trend deltas for approvals, run volume, connector health, and report generation.

Future Enterprise:

- Full RBAC and permission-policy engine.
- SCIM/SAML organization provisioning.
- Enterprise audit export and retention controls.
- Distributed orchestration health and queue visibility.
- Advanced evals, policy checks, and self-optimizing workforce recommendations.
- Regulated-data controls for healthcare/telehealth agents before enabling healthcare connectors.

## Open Implementation Notes

- The overview service currently captures panel errors and displays them in the UI, but production observability should send these failures to the app’s logging provider.
- Connector health is account-state based; deeper provider health requires real sync jobs and OAuth credentials.
- The launcher is intentionally conservative. It opens existing surfaces rather than creating runs until workflow authorization and idempotency are complete.
- Viewer-role approval count visibility is implemented by keeping the overview read-only. Approval decisions still require authorization on the approvals page/actions.
