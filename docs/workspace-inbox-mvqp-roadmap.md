# Workspace Inbox MVQP And Future Roadmap

## Current MVQP Implementation

The `/workspace/inbox` page has been converted from a static mock into an operational inbox surface with production-grade boundaries. Local development remains sign-in-free through the demo org/user resolvers, while production fails loudly if organization or user resolution is not configured.

Implemented MVQP behavior:

- Server-rendered inbox page that loads org-scoped inbox data before handing interactivity to a focused client component.
- Typed inbox model for items, counts, artifacts, comments, filters, statuses, priorities, and actions.
- `server/dal/inbox.ts` with mock and live Supabase behavior.
- Materialized inbox schema migration:
  - `notification_inbox`
  - `inbox_item_reads`
  - `inbox_comments`
  - `inbox_artifacts`
- Org-scoped RLS policies and production indexes for inbox list, filters, reads, comments, and artifacts.
- Local mock inbox adapter with safe Growth/report/operational examples only.
- Master/detail inbox UI backed by real data contracts.
- Filters for All, Unread, Decisions, Reports, and Operational.
- Persistent actions:
  - mark read
  - approve linked approval
  - reply with internal note
  - mark resolved
  - archive
- Action audit logging through `activity_events`.
- Approval inbox items delegate to the existing approval DAL and revalidate workspace/approval surfaces.
- Artifact rows open through explicit `open_href` targets, with reports routed through the reports archive.
- Sidebar and top-bar notification counts use a shared `/api/workspace/inbox/counts` route instead of hardcoded numbers.
- Tests for inbox filtering/counts, mutations, client action wiring, and live count display.

## Enterprise Defaults Chosen

- Inbox items are organization-shared.
- Read/archive state is designed to be per-user through `inbox_item_reads`.
- Resolve is a shared operational state because it changes the team queue.
- In local/dev environments, `local-dev-user` is used when no authenticated user exists.
- In production, missing user/org resolution is treated as a configuration failure.
- Approving from inbox approves the linked artifact/request and resolves the inbox item; workflow continuation remains the responsibility of the workflow runner.
- Inbox items are materialized in `notification_inbox` so badges, filters, audit trails, and retention can be reliable. Source-table composition can be used later as a backfill/synthesis job.

## Current Data Sources

The inbox currently uses:

- `notification_inbox` for primary messages.
- `inbox_item_reads` for the target per-user read/archive model.
- `inbox_comments` for internal notes/replies.
- `inbox_artifacts` for attached artifacts.
- `approvals` when an inbox item points to a pending approval.
- `activity_events` for audit logging.

Mock mode uses a local in-memory inbox adapter only when runtime mock data is allowed.

## MVQP Constraints

- Real RBAC roles are not fully implemented yet; actions are org-scoped and ready for RBAC enforcement once membership is available.
- The top-bar count is intentionally compact and links indirectly through the inbox route rather than becoming a second notification center.
- Healthcare/telehealth inbox examples are intentionally excluded from the MVQP mock set.
- Social publishing, ad spend, CRM writeback, and healthcare workflows are not triggered directly from inbox.
- Artifact opening uses explicit route targets now; signed storage URLs should be added when private file storage is introduced.

## Planned Future Implementation

Phase 2:

- Implement authenticated user and organization membership resolution.
- Enforce RBAC:
  - viewers can read and archive for themselves
  - operators/admins can resolve shared items
  - operators/admins can approve linked decisions
- Add source synthesis jobs that materialize inbox items from approvals, reports, alerts, workflow failures, and connector failures.
- Add dedicated notification dropdown backed by the inbox service.
- Add source drilldowns for workflow runs, AI runs, opportunities, and outreach drafts.
- Add signed URL generation for private artifacts.
- Add retention and archive controls.

Phase 3:

- Add threaded multi-agent conversations.
- Add agent memory writeback from user replies.
- Add direct workflow resume/retry controls with idempotency keys.
- Add social/marketing content asset review from inbox.
- Add SEO diff review and approval workflows.
- Add AI prioritization and daily inbox briefing.

Future Enterprise:

- Full enterprise RBAC/policy engine.
- SAML/SCIM organization provisioning.
- Legal hold, audit export, and retention schedules.
- Regulated healthcare inbox with PHI-safe data isolation, encryption, access logging, and HIPAA-grade controls.
- Cross-workspace inbox federation.
- Advanced evaluation and policy checks before agent-generated items enter the inbox.

## Operational Readiness Notes

- Every inbox mutation should emit `activity_events`; this is implemented for the current actions.
- Production must not run with mock data enabled.
- Production must not run without a configured user/org resolver.
- The `notification_inbox` table should be the system of record for operational inbox queue state.
- Source entities remain the system of record for business state, such as approvals and reports.
