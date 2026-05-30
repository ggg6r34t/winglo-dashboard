# Workspace Approvals MVQP And Future Roadmap

## Current MVQP Implementation

The workspace approvals surface is now a production-oriented decision console instead of a static mock queue.

- `/workspace/approvals` is server-rendered from org-scoped approval data.
- The page uses an interactive approval review component with queue selection, artifact metadata, decision notes, pending state, and error handling.
- Approvals support approve and reject server actions.
- Rejections require a decision note so negative decisions have audit context.
- Approval decisions are constrained to pending approvals in the active organization.
- Decision actions write activity events for operational auditability.
- Local/mock mode persists approval decisions in an in-memory mock adapter for development without sign-in.
- Live mode updates Supabase approval records with status, decision note, decision actor, and decision timestamp.
- `/api/workspace/approvals/counts` exposes pending approval counts for layout badges.
- Viewer-role users can see approval counts through the shared count badge without receiving mutation controls outside the approval console.
- The sidebar and right panel use live approval counts instead of hardcoded approval fixtures.
- The right panel no longer renders fake approve/decline/discuss buttons; it links into the approval console.
- Focused tests cover approval decision rules, client-side rejection validation, optimistic queue removal, and the approval count badge.

## Enterprise Defaults Chosen

- Approvals are generic artifacts, not only Growth Agent outreach approvals.
- Approval decisions are immutable business events even when the approval row itself stores the latest status.
- Rejection requires a written reason; approval notes remain optional.
- Production should never silently fall back to static approval fixtures.
- Development can access the dashboard without sign-in through the existing local/mock organization resolver.
- Reports remain accessible through the reports archive rather than directly from approval cards.
- Approval count visibility is allowed for viewer-role users; mutation permissions should be enforced by server-side role checks as RBAC is expanded.

## Current Data Sources

- Mock/local: `server/dal/approvals.ts` in-memory approval store seeded from mock fixtures.
- Live: `approvals` Supabase table via the approvals DAL.
- Events: `activity_events` through workforce server actions.
- Counts: `getApprovalCounts(orgId)` and `/api/workspace/approvals/counts`.
- Layout badges: `components/workspace/approval-count-badge.tsx`.
- Decision UI: `components/workspace/approval-review-client.tsx`.

## MVQP Constraints

- Approval artifact opening is intentionally constrained. Reports should be reviewed through `/workspace/reports`.
- External publishing, ad spend, CRM writeback, and email sends remain blocked behind approval decisions and future connector permissions.
- The right panel is a navigation summary, not a second mutation surface.
- Mock approval state is suitable for local development and tests, not production persistence.

## Planned Future Implementation

- Add role-aware decision permissions for owner/admin/operator while keeping viewer count visibility.
- Add approval comments and discussion threads.
- Add artifact-specific review renderers for outreach drafts, reports, workflow plans, connector sync diffs, and content assets.
- Add batch approval with policy checks for low-risk artifacts only.
- Add SLA timers, escalation routing, and notification delivery.
- Add approval policy templates by agent, workflow, connector, risk level, and spend threshold.
- Add webhook and Slack approval actions with signed callbacks.
- Add enterprise audit export for approval decisions.
- Add analytics for approval latency, rejection reasons, and agent rework loops.

## Operational Readiness Notes

- Every mutation should keep writing `activity_events`.
- Every live decision should be org-scoped and status-guarded to prevent duplicate or cross-tenant decisions.
- Count endpoints should remain read-only and cache-safe only after role and org isolation are fully enforced.
- Production deploys must keep mock-data guardrails enabled so fixtures cannot mask missing approval data.
