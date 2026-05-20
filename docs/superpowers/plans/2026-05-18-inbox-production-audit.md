# Winglo Inbox — Production Audit & Implementation Blueprint

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Winglo Inbox from a fully static mock into a real-time, AI-native operational decision surface that aggregates agent-generated work items, decisions, approvals, reports, and operational events.

**Architecture:** Supabase-backed `inbox_items` + `inbox_artifacts` tables fed by AI pipeline outputs and agent orchestration events; Supabase Realtime for live updates; server actions for all mutations; the existing mock/live dual-mode pattern.

**Tech Stack:** Next.js 16 (React 19), Supabase (Postgres + Realtime + Storage), TypeScript, Tailwind CSS v4, Zustand (existing store pattern), Vitest.

---

## 1. Executive Summary

### Inbox Production Intent
The Winglo Inbox is the **operator's primary decision surface** — the place where all 8 AI employees deliver work, surface decisions, and route operational events to the human in charge. It is not a notification center. It is not a social inbox. It is the **operational command inbox of an AI-native business operating system**.

In production, the Inbox should function like a high-signal, low-noise **Linear Inbox** crossed with an **AI operations queue**: every item is actionable or informational-from-an-agent, items are threaded by agent and topic, and every action (approve, resolve, archive, reply) has real downstream consequences for agent workflows.

### Current Maturity: 0% Production-Ready
The entire Inbox page (`app/(dashboard)/workspace/inbox/page.tsx`) is a **design prototype** — 100% hardcoded mock data with zero backend integration, zero persistence, zero real-time capability, and four action buttons that do nothing.

### Biggest Implementation Gaps
1. No `inbox_items` or `inbox_artifacts` database tables exist
2. No server actions for any inbox mutation (read, resolve, archive, approve)
3. No AI pipeline emit — agents never write to any inbox table
4. No Realtime subscription — inbox is fully static
5. Sidebar badge count ("12") is hardcoded string literal
6. Approvals page and Inbox page have duplicate content with no shared backend
7. Reports page and Inbox report items have no cross-linking

### Operational Role
Inbox is the **unified delivery layer** between the AI workforce and the human operator. Every significant agent output that requires attention, decision, or acknowledgment should surface here. The operator should be able to start and end their day in Inbox and have a complete picture of what requires their attention.

---

## 2. Current Inbox Architecture

### Route
```
/workspace/inbox
→ app/(dashboard)/workspace/inbox/page.tsx
→ nested inside app/(dashboard)/layout.tsx (ShellLayout)
```

### Component Tree
```
ShellLayout (server, wraps all dashboard pages)
  └── Sidebar (client — shows hardcoded badge "12")
  └── InboxPage (client — "use client")
        ├── INBOX[] — 7 hardcoded InboxMsg objects
        ├── FILTERS[] — filter chips, counts computed from static array
        ├── inbox-list (left column, 360px)
        │     ├── inbox-filters (chip bar)
        │     └── InboxItem × N (PageAgentGlyph + metadata)
        └── inbox-detail (right column, 1fr)
              ├── detail-head (agent glyph + name + role + time + id)
              ├── detail-subject
              ├── detail-body (paragraphs)
              ├── artifacts (file cards with non-functional "Open" buttons)
              └── detail-actions (4 non-functional buttons)
```

### Service Dependencies (Current — All Static)
- `AGENT_MAP` from `components/workspace/page-agent-glyph.tsx` — the only real import
- No DAL imports
- No server actions
- No Supabase client
- No Realtime subscription
- No React Query / SWR / streaming

### Adjacent Pages with Overlapping Content
| Page | Route | Overlap with Inbox |
|---|---|---|
| Approvals | `/workspace/approvals` | AP-2241 = m-4 (launch approval), AP-2236 = m-6 (SEO fix) |
| Reports | `/workspace/reports` | R-228 = m-2 (research brief), R-227 = m-7 (analytics report) |
| Workflows | `/workspace/workflows` | wf-launch = m-4 (paused, awaiting approval) |
| Workspace Overview | `/workspace` | KPI "Pending approvals: 3", badge counts reference Inbox |
| Live | `/workspace/live` | Agent run states that complete should feed Inbox |

### CSS Architecture
Defined in `app/globals.css` (~lines 1040–1200):
- `.inbox` — `display: grid; grid-template-columns: 360px 1fr`
- `.inbox-list` — scrollable left column
- `.inbox-filters` — sticky filter bar
- `.inbox-item`, `.inbox-item.active`, `.inbox-item.unread` — list items
- `.inbox-detail` — right pane, max-width 760px
- `.artifact` — file attachment card
- `.detail-actions` — action button row

CSS is well-designed and production-ready. No CSS changes required for the initial production migration.

---

## 3. Static / Mock Inventory

| # | Item | File Path | Current Behavior | Intended Production Behavior | Required Backend Source | Priority |
|---|---|---|---|---|---|---|
| 1 | `INBOX[]` array (7 messages) | `inbox/page.tsx:20–111` | Hardcoded static array | Fetched from `inbox_items` table via DAL | Supabase `inbox_items` | P0 |
| 2 | `from` field (string key) | `inbox/page.tsx:22,38…` | Maps to AGENT_MAP by string key | Maps to `agent_slug` column, validated against AGENT_MAP | `inbox_items.agent_slug` | P0 |
| 3 | `time` field ("2m", "23m") | `inbox/page.tsx:25,41…` | Relative string literals | Computed from real `created_at` timestamp via `formatDistanceToNow` | `inbox_items.created_at` | P0 |
| 4 | `unread: true/false` | `inbox/page.tsx:25,41…` | Hardcoded booleans | Persisted per-user read state | `inbox_items.is_read` | P0 |
| 5 | `tags[]` | `inbox/page.tsx:25,41…` | Hardcoded string arrays | Written by agent pipeline at item creation | `inbox_items.tags` | P0 |
| 6 | `body[]` paragraph array | `inbox/page.tsx:26–31…` | Hardcoded strings | AI-generated text stored as JSONB array | `inbox_items.body` | P0 |
| 7 | `artifacts[]` | `inbox/page.tsx:33–35…` | Fake file names with no storage | Real files stored in Supabase Storage, metadata in `inbox_artifacts` | `inbox_artifacts` table + Storage | P1 |
| 8 | Sidebar badge `"12"` | `components/layout/sidebar/index.tsx` | Hardcoded string | Live count from `getUnreadInboxCount(orgId)` | `inbox_items` count query | P0 |
| 9 | Filter counts (computed from static) | `inbox/page.tsx:114–119` | `array.filter().length` on static data | Count queries or derived from fetched items | DAL filter queries | P1 |
| 10 | "Operational" filter (no count) | `inbox/page.tsx:118` | `countFn: () => undefined` | `items.filter(m => m.tags.includes("ops"))` | `inbox_items.tags` | P1 |
| 11 | "Approve & continue" button | `inbox/page.tsx:219` | `<button>` with no handler | Calls `approveAndContinue(itemId)` server action → marks resolved + triggers downstream workflow step | Server action + workflow orchestration | P0 |
| 12 | "Reply with note" button | `inbox/page.tsx:220` | `<button>` with no handler | Opens inline reply input → calls `replyWithNote(itemId, note)` → persists note, notifies agent pipeline | Server action + AgentLog write | P1 |
| 13 | "Mark resolved" button | `inbox/page.tsx:221` | `<button>` with no handler | Calls `resolveItem(itemId)` → sets `is_resolved=true`, `resolved_at=now()` | Server action | P0 |
| 14 | "Archive" button | `inbox/page.tsx:222` | `<button>` with no handler | Calls `archiveItem(itemId)` → sets `is_archived=true`, hides from default view | Server action | P0 |
| 15 | Artifact "Open" button | `inbox/page.tsx:212` | `<button>` with no handler | Fetches signed URL from Supabase Storage, opens in new tab | Storage signed URL endpoint | P1 |
| 16 | Message ID display (`m.id.toUpperCase()`) | `inbox/page.tsx:194` | Fake "M-1" through "M-7" | Real UUID or human-readable sequential ID (IB-XXXX format) | `inbox_items.id` or sequence | P1 |
| 17 | `APPROVAL_ITEMS[]` (approvals page) | `approvals/page.tsx:16–26` | 9 separate hardcoded items | Fetched from `inbox_items` where `tags @> '{approval}'` or a linked `approvals` relation | `inbox_items` or `approvals` table | P0 |
| 18 | `REPORTS_FULL[]` (reports page) | `reports/page.tsx:18–67` | 8 separate hardcoded reports | Fetched from `inbox_items` where `tags @> '{report}'` or dedicated `reports` table | `inbox_items` or `reports` table | P1 |
| 19 | Approvals sidebar badge `"3"` | `sidebar/index.tsx` | Hardcoded string | Live count of pending high-urgency approvals | `inbox_items` approval count | P0 |
| 20 | Workspace KPI "Pending approvals: 3" | `workspace/page.tsx:99` | Hardcoded `"3"` string | Live count from DAL | `inbox_items` count | P1 |
| 21 | `read` state on item click | `inbox/page.tsx:159` | No state change on click | Calling `markAsRead(itemId)` and updating local state optimistically | Server action | P0 |

---

## 4. Production Intent Findings

### What Inbox Should Become

The Winglo Inbox is the **primary operator interface for managing the AI workforce's output**. In production, it should function as:

**An AI-native operational decision surface** where:
- Every item is a message FROM a specific AI agent TO the human operator
- Items represent work the agent has completed and needs the operator to see, decide on, or acknowledge
- The operator can approve, reject, resolve, reply, or archive — and those actions have real downstream effects on agent workflows
- New items arrive in real-time as agents complete tasks
- The unread count drives a meaningful daily cadence ("check inbox first thing")

### Operational Philosophy

**Signal over noise.** Not every agent action creates an inbox item. Only items that:
1. Require a human decision before the agent can proceed (`decision`, `approval`)
2. Deliver a significant completed work product (`report`, `strategic`)
3. Report an escalation requiring awareness (`escalation`, `routing`)
4. Surface a discoverable fix or opportunity the human should know about (`fix`, `ops`)

**Calm intelligence.** Items are ranked by urgency (implied by tag), not recency alone. The operator sees what matters most, not what arrived most recently.

**Continuity between surfaces.** Inbox items cross-link to their counterparts in Approvals, Reports, and Workflows. Clicking "Approve & continue" in Inbox resolves the item AND the corresponding approval without requiring navigation.

### AI-Native Behavior

The inbox behaves like a **briefing from your AI team**, not a notification stream:
- Each item is written in the agent's voice (first person, confident, contextual)
- Each item includes the agent's recommendation when one exists
- Each item surfaces the context the operator needs to make the decision (performance data, historical comparisons, risk level)
- The "Approve & continue" action flows back into the AI pipeline to continue the workflow

### Item Taxonomy

| Tag | Meaning | Required Action | Example |
|---|---|---|---|
| `decision` | Agent has options, operator must choose | Choose option → operator selection propagates to workflow | Reel tone A vs B |
| `approval` | Work is ready, needs sign-off to publish/send | Approve → triggers downstream publish step | Launch announcement |
| `report` | Analysis complete, delivering summary | Acknowledge (mark read) or pin | Competitive brief, weekly pipeline |
| `escalation` | High-severity event requiring awareness | Acknowledge or take action | Patient escalation, system failure |
| `routing` | Agent took autonomous action, informing operator | Acknowledge | Duplicate lead merged |
| `fix` | Agent found issue and has proposed resolution | Approve fix to ship | Canonical tag diff |
| `strategic` | Long-horizon insight from research | Pin or archive | Pricing shift observation |
| `ops` | Background operational update | Auto-read after 24h | Report delivered to Slack |

---

## 5. Component-by-Component Findings

### InboxPage (`inbox/page.tsx`)

**Current:** `"use client"` component, fully self-contained with static INBOX array, useState for filter/active, no server interaction.

**Required production behavior:**
- Convert to a server component shell that fetches initial items via DAL
- Pass hydrated items to a `InboxClient` client component (mirrors existing pattern in Growth agent tabs)
- `InboxClient` subscribes to Supabase Realtime for live new items
- Filter state remains client-side (no server round-trip on filter change)
- `activeId` state remains client-side

**Missing systems:**
- DAL function `getInboxItems(orgId, options)` 
- Realtime subscription hook
- Server action wrappers for all mutations
- Optimistic update pattern for read/resolve/archive

### InboxList (left column — unnamed, inline in page)

**Current:** Renders filtered static array. `onClick` sets `activeId` only.

**Required production behavior:**
- On click: set `activeId` + call `markAsRead(itemId)` if item is unread
- Optimistic: immediately flip `unread` to false locally, server action confirms
- Unread indicator dot updates immediately
- New items prepend to top of list via Realtime insert handler
- Filter counts update when new items arrive

**Missing systems:** `markAsRead` server action, Realtime insert handler in Zustand or local state

### InboxDetail (right column — unnamed, inline in page)

**Current:** Renders static active message. All buttons are `<button>` with no onClick.

**Required production behavior:**

| Button | Action | Server Call | Downstream Effect |
|---|---|---|---|
| "Approve & continue" | Approve item | `approveAndContinue(itemId)` | Sets `is_resolved=true`; if linked `approval_id`, approves that approval; emits event to resume paused workflow step |
| "Reply with note" | Open inline note input | `replyWithNote(itemId, note)` | Writes note to `inbox_item_replies`; creates AgentLog entry for the agent pipeline to consume |
| "Mark resolved" | Resolve without approval | `resolveItem(itemId)` | Sets `is_resolved=true`, `resolved_at=now()` |
| "Archive" | Archive item | `archiveItem(itemId)` | Sets `is_archived=true`; item disappears from default view |

**Missing systems:** All four server actions, optimistic state updates, loading states per button, success/error toasts

### Artifact Cards

**Current:** Static file info (`name`, `meta`, `icon`). "Open" button does nothing.

**Required production behavior:**
- "Open" button calls `/api/inbox/artifacts/[id]/signed-url` 
- Returns a 60-second signed URL from Supabase Storage
- Opens in new tab
- For text artifacts (MD, DIFF), optionally opens inline in an expanded pane

**Missing systems:** `inbox_artifacts` table, Supabase Storage bucket, signed URL API route

### Filter Chips

**Current:** `countFn` callbacks on static INBOX array. "Operational" has no count.

**Required production behavior:**
- Counts derived from fetched items array (same pattern, just on real data)
- Filter change is instant (client-side filter on fetched data, no server round-trip needed for reasonable item counts)
- "Operational" tag becomes `m.tags.includes("ops")`

**Missing systems:** Just needs real data; filter logic is correct.

### Sidebar Badge ("12")

**Current:** Hardcoded string `badge="12"` in sidebar NavItem.

**Required production behavior:**
- `getUnreadInboxCount(orgId)` DAL function called in sidebar layout or a shared server action
- Updates via Realtime when inbox items are inserted or marked read
- Sidebar is a client component — it needs to subscribe to count updates

**Missing systems:** `getUnreadInboxCount` DAL, count update propagation (Realtime or context)

---

## 6. Interaction & Action Map

### Mark as Read (implicit, on item click)
| | |
|---|---|
| **Current** | `setActiveId(m.id)` — no read state change |
| **Intended** | Click item → optimistic flip `unread=false` → call `markAsRead(itemId)` server action → update sidebar badge count |
| **Backend** | `UPDATE inbox_items SET is_read=true WHERE id=$1 AND organization_id=$2` |
| **Optimistic** | Yes — local state updates immediately |
| **Audit** | Record `inbox_item_events(type='read', item_id, user_id, created_at)` |

### Approve & Continue
| | |
|---|---|
| **Current** | `<button className="btn primary">Approve &amp; continue</button>` — no handler |
| **Intended** | Call `approveAndContinue(itemId)` → mark item resolved → if linked approval, approve it → if linked workflow step, emit resume event |
| **Backend** | `UPDATE inbox_items SET is_resolved=true, resolved_at=now() WHERE id=$1`; if `approval_id` present, `UPDATE approvals SET status='approved'...`; emit `workflow_resume` event |
| **Optimistic** | Yes — item visually resolves immediately, next item becomes active |
| **Success state** | Item removed from active list (or shown with "Approved" badge), toast "Approved — workflow continuing" |
| **Failure state** | Revert, toast with error, button re-enabled |
| **Audit** | `inbox_item_events(type='approved', item_id, user_id)` |

### Reply with Note
| | |
|---|---|
| **Current** | `<button className="btn">Reply with note</button>` — no handler |
| **Intended** | Toggle inline textarea below body; on submit call `replyWithNote(itemId, note)` |
| **Backend** | Insert into `inbox_item_replies(inbox_item_id, note, user_id, created_at)` + create `AgentLog` entry so the pipeline can pick it up |
| **Optimistic** | Yes — reply appears immediately in thread |
| **Success state** | Textarea closes, reply shown inline |

### Mark Resolved
| | |
|---|---|
| **Current** | `<button className="btn">Mark resolved</button>` — no handler |
| **Intended** | Call `resolveItem(itemId)` |
| **Backend** | `UPDATE inbox_items SET is_resolved=true, resolved_at=now()` |
| **Optimistic** | Yes — item gets "Resolved" visual state, exits active queue |

### Archive
| | |
|---|---|
| **Current** | `<button className="btn">Archive</button>` — no handler |
| **Intended** | Call `archiveItem(itemId)` — item disappears from default view |
| **Backend** | `UPDATE inbox_items SET is_archived=true, archived_at=now()` |
| **Optimistic** | Yes — item immediately exits list |

### Open Artifact
| | |
|---|---|
| **Current** | `<button className="btn">Open</button>` — no handler |
| **Intended** | Fetch signed URL → open in new tab (or inline for text formats) |
| **Backend** | `GET /api/inbox/artifacts/[artifactId]/signed-url` → `storage.createSignedUrl(path, 60)` |
| **Failure state** | Toast "Could not open file" |

### Filter Change
| | |
|---|---|
| **Current** | `setFilter(f.id)` — instant client-side filter |
| **Intended** | Same pattern — no change needed. Filter on client over fetched items array. |

---

## 7. Proposed Production Data Model

### Table: `inbox_items`
```sql
CREATE TABLE inbox_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_slug        text NOT NULL,                          -- 'social', 'research', 'growth', etc.
  subject           text NOT NULL,
  preview           text NOT NULL,                          -- 2-line truncated preview
  body              jsonb NOT NULL DEFAULT '[]',            -- text[] paragraph array
  tags              text[] NOT NULL DEFAULT '{}',           -- decision, approval, report, escalation, routing, fix, strategic, ops
  priority          smallint NOT NULL DEFAULT 3,            -- 1=critical, 2=high, 3=normal, 4=low
  is_read           boolean NOT NULL DEFAULT false,
  is_resolved       boolean NOT NULL DEFAULT false,
  is_archived       boolean NOT NULL DEFAULT false,
  related_ai_run_id uuid REFERENCES ai_runs(id),            -- which run generated this item
  related_approval_id uuid,                                 -- FK to approvals table (future)
  related_report_id uuid,                                   -- FK to reports table (future)
  resolved_at       timestamptz,
  archived_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inbox_items_org_created ON inbox_items(organization_id, created_at DESC);
CREATE INDEX idx_inbox_items_org_unread  ON inbox_items(organization_id, is_read) WHERE is_read = false;
CREATE INDEX idx_inbox_items_tags        ON inbox_items USING gin(tags);
CREATE INDEX idx_inbox_items_ai_run      ON inbox_items(related_ai_run_id);
```

**RLS Policy:**
```sql
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;

-- Service role bypass (AI pipeline writes)
CREATE POLICY "service_role_all" ON inbox_items 
  FOR ALL TO service_role USING (true);

-- Org members read their own org's items
CREATE POLICY "org_member_select" ON inbox_items 
  FOR SELECT TO authenticated 
  USING (organization_id IN (
    SELECT organization_id FROM org_members WHERE user_id = auth.uid()
  ));

-- Org members mutate their own org's items (for read/resolve/archive)
CREATE POLICY "org_member_update" ON inbox_items 
  FOR UPDATE TO authenticated 
  USING (organization_id IN (
    SELECT organization_id FROM org_members WHERE user_id = auth.uid()
  ));
```

### Table: `inbox_artifacts`
```sql
CREATE TABLE inbox_artifacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_item_id   uuid NOT NULL REFERENCES inbox_items(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,                    -- "q3-competitive-brief.pdf"
  storage_path    text,                             -- Supabase Storage path; null for external
  external_url    text,                             -- for externally-hosted artifacts
  file_size_bytes bigint,
  mime_type       text,
  icon_label      text NOT NULL DEFAULT 'FILE',     -- "PDF", "MP4", "MD", "ZIP", "DIFF"
  metadata        jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inbox_artifacts_item ON inbox_artifacts(inbox_item_id);
```

### Table: `inbox_item_replies`
```sql
CREATE TABLE inbox_item_replies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_item_id uuid NOT NULL REFERENCES inbox_items(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL,               -- who replied
  note          text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inbox_replies_item ON inbox_item_replies(inbox_item_id);
```

### Table: `inbox_item_events` (audit log)
```sql
CREATE TABLE inbox_item_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_item_id uuid NOT NULL REFERENCES inbox_items(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL,
  event_type    text NOT NULL,   -- 'created', 'read', 'resolved', 'archived', 'approved', 'replied'
  user_id       uuid,            -- null for system-generated events
  metadata      jsonb NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inbox_events_item ON inbox_item_events(inbox_item_id, created_at DESC);
```

### Retention Strategy
- `inbox_items`: retain 90 days; archive older items (set `is_archived=true` via scheduled function)
- `inbox_artifacts`: retain storage files for 90 days; clean up orphaned files via cron
- `inbox_item_events`: retain 180 days for audit purposes
- `inbox_item_replies`: retain indefinitely (operational record)

---

## 8. AI Workflow Map

### How Inbox Items Get Created

The key architectural insight: **no agent creates inbox items directly**. The AI pipeline (`lib/ai/pipeline/`) creates inbox items as a side-effect of completing work stages that require human attention.

#### Workflow: Research Report Delivery
| | |
|---|---|
| **Trigger** | `research` AgentType run completes with status `complete` |
| **Pipeline step** | After writing output to `ai_runs.output`, call `createInboxItem(orgId, { agent_slug: 'research', tags: ['report', 'strategic'], subject: derivedSubject, preview: derivedPreview, body: derivedParagraphs, related_ai_run_id: run.id })` |
| **Artifacts** | If pipeline wrote a report file to Storage, create `inbox_artifact` row |
| **Operator action** | Read → pin → archive |
| **No further workflow trigger** | Reports are delivery-only; no downstream continuation |

#### Workflow: Approval-Gated Publish
| | |
|---|---|
| **Trigger** | Any agent completes a publishable asset (blog, social post, email campaign) |
| **Pipeline step** | Create `inbox_item` with `tags: ['approval']`, `priority: 2 (high)` + suspend workflow execution |
| **Operator action** | "Approve & continue" → `approveAndContinue(itemId)` |
| **Downstream** | Server action emits `workflow_resume` event, pipeline continues to publish step |
| **Affected agents** | social (Lyra), marketing (Orion), seo (Vega), growth (Atlas) |

#### Workflow: Decision Required
| | |
|---|---|
| **Trigger** | Agent has two viable options and operator preference is required |
| **Pipeline step** | Create `inbox_item` with `tags: ['decision']`, body contains option comparison + agent recommendation, artifacts contain both options if applicable |
| **Operator action** | "Approve & continue" (selects agent's recommendation) or "Reply with note" (specifies choice) |
| **Downstream** | Reply text parsed by pipeline to determine selected option; workflow continues with selected option |

#### Workflow: Escalation Notification
| | |
|---|---|
| **Trigger** | Agent encounters a case exceeding autonomous-action threshold |
| **Pipeline step** | Create `inbox_item` with `tags: ['escalation']`, `priority: 1 (critical)` |
| **Operator action** | Acknowledge (mark resolved) |
| **Downstream** | No automatic continuation; escalation is informational |
| **Affected agents** | telehealth (Mira), sales (Hale), growth (Atlas) |

#### Workflow: Autonomous Action Notice
| | |
|---|---|
| **Trigger** | Agent completed a significant autonomous action that operator should know about |
| **Pipeline step** | Create `inbox_item` with `tags: ['routing']` or `tags: ['ops']`, `priority: 4 (low)` |
| **Operator action** | Auto-reads after 24h if not opened |
| **Downstream** | None |

#### Workflow: Anomaly / Fix Available
| | |
|---|---|
| **Trigger** | Audit or monitoring run detects an issue with a proposed fix |
| **Pipeline step** | Create `inbox_item` with `tags: ['fix']`, artifact contains the diff/patch |
| **Operator action** | "Approve & continue" → merges/applies the fix; "Archive" → defers |
| **Affected agents** | seo (Vega) |

### Growth Agent Pipeline Integration (Priority P0)
The existing `lib/ai/pipeline/discovery.ts` orchestrates `discovery → research → scoring`. After each stage completes, it should emit an inbox item:
- Post-discovery: `tags: ['ops']` — "Discovery run completed, N opportunities scored"
- Post-scoring when opportunities exceed threshold: `tags: ['report', 'strategic']` — scoring summary
- Post-outreach draft creation: `tags: ['approval']` — "Outreach draft ready for N contacts"

---

## 9. Connector & Event Architecture

### Which Connectors Feed Inbox

| Connector | Event Type | Inbox Item Tag | Example |
|---|---|---|---|
| Supabase AI Pipeline | Run completion with human-attention flag | `report`, `approval`, `decision` | Research brief completed |
| Supabase AI Pipeline | Escalation detected | `escalation` | Telehealth overnight escalation |
| Supabase AI Pipeline | Autonomous action taken | `routing`, `ops` | Duplicate lead merged |
| Cron (`/api/cron/discovery`) | Weekly report generation | `report`, `ops` | Weekly pipeline velocity report |
| Publishing systems (future) | Publish failure | `escalation` | LinkedIn post failed to publish |
| Monitoring (future) | Agent failure | `escalation` | Agent run failed after 3 retries |
| Connector health (future) | Connector disconnected | `ops` | Google Search Console token expired |

### Events That Should NOT Create Inbox Items
- Individual log lines from AI runs
- Routine agent heartbeats
- Analytics snapshot generation
- Memory entry creation
- Search and discovery sub-steps that are not final outputs

### Realtime Architecture
```
Supabase Postgres → inbox_items INSERT/UPDATE
      ↓ (Realtime publication)
Supabase Realtime channel: inbox:org_id
      ↓ (WebSocket)
InboxClient component → useEffect subscription
      ↓
Local state update → list prepend / badge decrement
```

The Realtime channel should filter by `organization_id` to prevent cross-org leakage:
```typescript
supabase
  .channel(`inbox:${orgId}`)
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'inbox_items',
    filter: `organization_id=eq.${orgId}` 
  }, handleNewItem)
  .subscribe()
```

---

## 10. Operational UX Recommendations

### Information Hierarchy (Priority Order)
1. **Unread + Decision/Approval** — top of list, always
2. **Unread + Escalation** — surface immediately with visual urgency indicator
3. **Unread + Report** — after decisions, before archived
4. **Read + Unresolved** — still needs attention
5. **Resolved/Archived** — hidden from default view, accessible via filter

### Urgency Indicators
- `priority: 1` (critical/escalation) — red left border on list item
- `priority: 2` (approval/decision) — blue unread dot + bold subject
- `priority: 3` (normal) — standard unread dot
- `priority: 4` (ops/routing) — no special indicator

### Calmness Principles
- Do NOT show a notification badge for `ops`/`routing` items that require no action
- Auto-read `ops` items after 24h if not opened (background job)
- The sidebar badge should count only items requiring action (decisions + approvals + unread reports + escalations)
- "Operational" filter tab gives access to `ops`/`routing` items without cluttering the main view

### "Approve All Low-Risk" Pattern (from Approvals page)
The Approvals page has a "Approve all low-risk" button. Inbox should support a similar batch action for `priority: 4` items: "Mark all ops as read" to clear low-priority informational items.

### Interaction Speed
All mutations must use optimistic updates. The operator moves fast through the inbox. Any perceptible latency on approve/resolve/archive will break the operational flow. The pattern:
1. User clicks action
2. Local state updates immediately (item resolves/archives visually)
3. Server action fires in background
4. On error: revert + toast

### Contextual Links
Each inbox item should surface links to its counterpart in other pages:
- `tags: ['approval']` → "View in Approvals →" button (links to `/workspace/approvals#AP-XXXX`)
- `tags: ['report']` → "Full report →" button (links to `/workspace/reports#R-XXX`)
- `from: 'growth'` → agent glyph click → navigates to `/agents/growth`

### Empty States
- **All items resolved**: "You're caught up. Your AI team is working." (calm, not congratulatory)
- **No items (new org)**: "Inbox will fill as your AI employees complete their first tasks."
- **Filtered view empty**: "No [filter] items right now."

---

## 11. Mock-to-Production Migration Architecture

### Environment Guardrails
```typescript
// lib/inbox/guards.ts
export function assertProductionInboxData(items: InboxMsg[]) {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    throw new Error('FATAL: Mock data enabled in production for inbox. Set NEXT_PUBLIC_USE_MOCK_DATA=false.')
  }
}
```

### Mock/Live Boundary Pattern (follows existing DAL pattern)
```typescript
// server/dal/inbox.ts
export async function getInboxItems(orgId: string, options?: InboxQueryOptions) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return MOCK_INBOX_ITEMS.filter(/* options */);
  }
  // Real Supabase query
  const { data } = await createServiceClient()
    .from('inbox_items')
    .select('*, inbox_artifacts(*)')
    .eq('organization_id', orgId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });
  return data ?? [];
}
```

### Feature Flag Strategy
- `NEXT_PUBLIC_USE_MOCK_DATA=true` → use `lib/mock/fixtures/inbox.ts` mock items
- `NEXT_PUBLIC_USE_MOCK_DATA=false` → real Supabase + Realtime
- No preview-mode exceptions for inbox (operational data must be real in preview)

### Background Jobs Required
| Job | Trigger | Action |
|---|---|---|
| Auto-read ops items | Cron, every 24h | `UPDATE inbox_items SET is_read=true WHERE tags @> '{ops}' AND created_at < now() - interval '24h' AND is_read=false` |
| Inbox retention cleanup | Cron, weekly | `UPDATE inbox_items SET is_archived=true WHERE created_at < now() - interval '90 days' AND is_archived=false` |
| Badge count cache | Realtime + on mutation | Cache `getUnreadInboxCount` result in-process, invalidate on insert/update |

### Observability
- Log every inbox item creation: `console.log('[inbox] created item', { id, orgId, agentSlug, tags })`
- Log every mutation: `console.log('[inbox] action', { type: 'approved'|'resolved'|'archived', itemId, userId })`
- Alert if inbox item creation fails: the AI pipeline should not silently drop inbox items

### Rollback Strategy
If inbox production goes wrong:
1. Set `NEXT_PUBLIC_USE_MOCK_DATA=true` → falls back to mock items instantly
2. No data loss risk (inbox_items are append-only from user's perspective; mutations are soft-deletes)

---

## 12. Inbox Production Implementation Prompt

---

> **ENTERPRISE-GRADE IMPLEMENTATION PROMPT**
> 
> Use `superpowers:subagent-driven-development` to execute this plan task-by-task with review checkpoints.

---

### Context for the Implementing Engineer

You are productionizing the Winglo Inbox — the central operational decision surface of an AI-native business OS. Winglo has 8 AI agents (Atlas/growth, Lyra/social, Vega/seo, Orion/marketing, Hale/sales, Mira/telehealth, Cael/analytics, Sable/research). The Inbox is where agents deliver completed work and decisions to the human operator.

**Critical existing patterns you MUST follow:**
- DAL functions live in `server/dal/` with dual mock/Supabase mode gated by `NEXT_PUBLIC_USE_MOCK_DATA`
- Server actions live in `features/*/server/` with `'use server'` directive
- Client components receive hydrated data as props from async server component parents
- CSS uses `var(--token)` form everywhere (never shorthand)
- Agent IDs map from `AgentSlug` (UI-facing: "social", "growth") to `AGENT_MAP` in `components/workspace/page-agent-glyph.tsx`
- The existing `inbox` CSS grid layout in `globals.css` is correct and complete — do NOT modify it

**Do NOT:**
- Modify `app/globals.css` CSS variables or the `.inbox` layout rules
- Replace mock data in pages that are not inbox (approvals/reports have their own roadmap)
- Add speculative features not listed in the tasks below
- Change `AgentType` (the 7 pipeline types) — these are distinct from `AgentSlug` (the 8 UI agents)

---

### Task 1: Database Schema — `inbox_items` and related tables

**Files:**
- Create: `supabase/migrations/20260518_inbox_tables.sql`
- Create: `types/database.ts` (modify — add InboxItem, InboxArtifact, InboxItemReply types)

- [ ] **Step 1: Write migration file**

```sql
-- supabase/migrations/20260518_inbox_tables.sql

CREATE TABLE inbox_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_slug        text NOT NULL CHECK (agent_slug IN ('growth','social','seo','marketing','sales','telehealth','analytics','research')),
  subject           text NOT NULL,
  preview           text NOT NULL,
  body              jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags              text[] NOT NULL DEFAULT '{}',
  priority          smallint NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 4),
  is_read           boolean NOT NULL DEFAULT false,
  is_resolved       boolean NOT NULL DEFAULT false,
  is_archived       boolean NOT NULL DEFAULT false,
  related_ai_run_id uuid REFERENCES ai_runs(id) ON DELETE SET NULL,
  resolved_at       timestamptz,
  archived_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inbox_items_org_created ON inbox_items(organization_id, created_at DESC);
CREATE INDEX idx_inbox_items_org_unread  ON inbox_items(organization_id, is_read) WHERE NOT is_read;
CREATE INDEX idx_inbox_items_tags        ON inbox_items USING gin(tags);

ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON inbox_items FOR ALL TO service_role USING (true);

-- -------------------------------------------------------

CREATE TABLE inbox_artifacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_item_id   uuid NOT NULL REFERENCES inbox_items(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            text NOT NULL,
  storage_path    text,
  external_url    text,
  file_size_bytes bigint,
  mime_type       text,
  icon_label      text NOT NULL DEFAULT 'FILE',
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inbox_artifacts_item ON inbox_artifacts(inbox_item_id);
ALTER TABLE inbox_artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON inbox_artifacts FOR ALL TO service_role USING (true);

-- -------------------------------------------------------

CREATE TABLE inbox_item_replies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_item_id   uuid NOT NULL REFERENCES inbox_items(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  note            text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inbox_replies_item ON inbox_item_replies(inbox_item_id);
ALTER TABLE inbox_item_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON inbox_item_replies FOR ALL TO service_role USING (true);
```

- [ ] **Step 2: Add TypeScript types to `types/database.ts`**

After the existing `AnalyticsSnapshot` interface, add:

```typescript
export type InboxItemTag = 'decision' | 'approval' | 'report' | 'escalation' | 'routing' | 'fix' | 'strategic' | 'ops'
export type InboxPriority = 1 | 2 | 3 | 4  // 1=critical, 2=high, 3=normal, 4=low

export interface InboxArtifact {
  id: string
  inbox_item_id: string
  organization_id: string
  name: string
  storage_path: string | null
  external_url: string | null
  file_size_bytes: number | null
  mime_type: string | null
  icon_label: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface InboxItemReply {
  id: string
  inbox_item_id: string
  organization_id: string
  note: string
  created_at: string
}

export interface InboxItem {
  id: string
  organization_id: string
  agent_slug: string
  subject: string
  preview: string
  body: string[]                    // stored as jsonb, deserialized to string[]
  tags: InboxItemTag[]
  priority: InboxPriority
  is_read: boolean
  is_resolved: boolean
  is_archived: boolean
  related_ai_run_id: string | null
  resolved_at: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
  inbox_artifacts?: InboxArtifact[] // joined via select('*, inbox_artifacts(*)')
}
```

- [ ] **Step 3: Apply migration**

```bash
npx supabase db push
# or for local dev:
npx supabase migration up
```

Expected: Tables created, no errors.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260518_inbox_tables.sql types/database.ts
git commit -m "feat: add inbox_items, inbox_artifacts, inbox_item_replies schema"
```

---

### Task 2: Mock Fixtures — `lib/mock/fixtures/inbox.ts`

**Files:**
- Create: `lib/mock/fixtures/inbox.ts`
- Modify: `lib/mock/index.ts`

- [ ] **Step 1: Write the mock fixture**

```typescript
// lib/mock/fixtures/inbox.ts
import type { InboxItem, InboxArtifact } from '@/types/database'
import { MOCK_ORG_ID } from './organizations'

export const MOCK_INBOX_ITEMS: InboxItem[] = [
  {
    id: 'ib-001',
    organization_id: MOCK_ORG_ID,
    agent_slug: 'social',
    subject: 'Tone check on crisis-response reel — need your read',
    preview: 'I drafted two variants for the reel announcing the service outage. A is empathetic, B is informational. I'm 60/40 leaning A but it's your call — both attached.',
    body: [
      'I drafted two variants for the reel announcing this morning\'s brief service outage. Both are 22s, both lead with the resolution and route to the status page.',
      'Variant A opens with a personal note from you and apologizes for the disruption. Variant B opens with the timeline and links to the post-mortem.',
      'My read: A performs better historically for outages under 30 minutes — saves/shares are 1.8× higher when the founder is on camera and tone is empathetic. B is the safer choice for repeat incidents.',
      'I haven\'t scheduled either. Just need you to pick.',
    ],
    tags: ['decision', 'tone'],
    priority: 2,
    is_read: false,
    is_resolved: false,
    is_archived: false,
    related_ai_run_id: null,
    resolved_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    inbox_artifacts: [
      { id: 'ia-001', inbox_item_id: 'ib-001', organization_id: MOCK_ORG_ID, name: 'outage-reel-A_empathetic.mp4', storage_path: null, external_url: null, file_size_bytes: 14_680_064, mime_type: 'video/mp4', icon_label: 'MP4', metadata: { duration: '22s', status: 'draft' }, created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
      { id: 'ia-002', inbox_item_id: 'ib-001', organization_id: MOCK_ORG_ID, name: 'outage-reel-B_informational.mp4', storage_path: null, external_url: null, file_size_bytes: 12_582_912, mime_type: 'video/mp4', icon_label: 'MP4', metadata: { duration: '22s', status: 'draft' }, created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'ib-002',
    organization_id: MOCK_ORG_ID,
    agent_slug: 'research',
    subject: 'Q3 competitive brief is ready',
    preview: 'Synthesized 14 sources covering Acme, Coil, Northwind, and four smaller players. Headline: pricing is converging on usage. Full brief and one-page exec summary attached.',
    body: [
      'Brief is done. I covered the seven competitors on our watchlist plus three you flagged last sprint.',
      'Headline finding: three of seven are off seat-based pricing in the last 60 days, converging on usage hybrids. Acme moved on May 9, Northwind on May 2, Coil announced today.',
      'Recommendation: we should run the pricing experiment we discussed in April. I\'ve left a hook in the brief for Orion to take this into the launch narrative.',
    ],
    tags: ['report', 'strategic'],
    priority: 3,
    is_read: false,
    is_resolved: false,
    is_archived: false,
    related_ai_run_id: null,
    resolved_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
    inbox_artifacts: [
      { id: 'ia-003', inbox_item_id: 'ib-002', organization_id: MOCK_ORG_ID, name: 'q3-competitive-brief.pdf', storage_path: null, external_url: null, file_size_bytes: 1_468_006, mime_type: 'application/pdf', icon_label: 'PDF', metadata: { pages: 18 }, created_at: new Date(Date.now() - 23 * 60 * 1000).toISOString() },
      { id: 'ia-004', inbox_item_id: 'ib-002', organization_id: MOCK_ORG_ID, name: 'exec-summary.md', storage_path: null, external_url: null, file_size_bytes: 2_048, mime_type: 'text/markdown', icon_label: 'MD', metadata: { pages: 1 }, created_at: new Date(Date.now() - 23 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'ib-003',
    organization_id: MOCK_ORG_ID,
    agent_slug: 'growth',
    subject: 'Flagging a duplicate lead — Maya Chen at Loop',
    preview: 'Hale opened a thread with Maya yesterday. I just enriched her contact via Apollo and found a match in our existing pipeline under a different email. Routing back to Hale.',
    body: [
      'Quick heads-up. Hale started a re-engagement thread yesterday with maya.chen@loop.io. My enrichment shows she\'s already in the pipeline as maya@loop.app — a trial signup from March that cooled in week 2.',
      'I\'ve merged the records and notified Hale to pick up the existing thread instead of starting fresh. No action needed from you.',
    ],
    tags: ['routing'],
    priority: 4,
    is_read: true,
    is_resolved: false,
    is_archived: false,
    related_ai_run_id: null,
    resolved_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    inbox_artifacts: [],
  },
  {
    id: 'ib-004',
    organization_id: MOCK_ORG_ID,
    agent_slug: 'marketing',
    subject: 'Launch announcement — final review before scheduling',
    preview: 'Blog, email, X thread, LinkedIn variants are all drafted and ready for embargo Thursday 09:00. Approval is in your queue. Sharing here for visibility.',
    body: [
      'All four channels are drafted: blog (1,420 words), email (lead + body, 3 variants for A/B), X thread (11 posts), LinkedIn (long-form + short).',
      'I held the embargo at Thursday 09:00 PT. Lyra has the reels queued behind this. Sable\'s brief informed the positioning.',
      'Approval is in your queue (Approvals tab, top item). Sending this so you have context before you open it.',
    ],
    tags: ['approval', 'launch'],
    priority: 2,
    is_read: true,
    is_resolved: false,
    is_archived: false,
    related_ai_run_id: null,
    resolved_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    inbox_artifacts: [
      { id: 'ia-005', inbox_item_id: 'ib-004', organization_id: MOCK_ORG_ID, name: 'launch-package-v4.zip', storage_path: null, external_url: null, file_size_bytes: 245_760, mime_type: 'application/zip', icon_label: 'ZIP', metadata: { files: 4 }, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'ib-005',
    organization_id: MOCK_ORG_ID,
    agent_slug: 'telehealth',
    subject: 'Two intake cases escalated overnight',
    preview: 'Both routed to on-call. Patient A: chest pain symptom cluster, escalated to Dr. Park at 03:14. Patient B: medication reconciliation, scheduled for morning call.',
    body: [
      'Overnight intake summary: 8 cases, 2 escalated, 6 routed to scheduled care.',
      'Patient A: presented chest pain + radiating arm pain at 02:51. Symptom cluster matched escalation criteria 4-c. Routed to Dr. Park at 03:14. Confirmed received at 03:16. Status: in care.',
      'Patient B: medication reconciliation needed before refill — non-urgent. Booked for Dr. Reyes at 09:30 today.',
    ],
    tags: ['escalation', 'ops'],
    priority: 2,
    is_read: true,
    is_resolved: false,
    is_archived: false,
    related_ai_run_id: null,
    resolved_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    inbox_artifacts: [],
  },
  {
    id: 'ib-006',
    organization_id: MOCK_ORG_ID,
    agent_slug: 'seo',
    subject: '11 duplicate canonicals in /docs/api',
    preview: 'Crawl finished. Found 11 duplicate canonical URLs concentrated in /docs/api/v2/*. Recommending the fixes in the attached diff. Low risk to ship.',
    body: [
      'Daily audit caught 11 duplicate canonical tags in the /docs/api/v2 cluster. Most are caused by the SDK page generator using the same canonical for paginated endpoints.',
      'Patch is attached as a diff. Low risk — affects 11 files, no traffic change expected on the canonical pages themselves, but should consolidate signal to the right URLs.',
    ],
    tags: ['fix', 'ops'],
    priority: 3,
    is_read: true,
    is_resolved: false,
    is_archived: false,
    related_ai_run_id: null,
    resolved_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    inbox_artifacts: [
      { id: 'ia-006', inbox_item_id: 'ib-006', organization_id: MOCK_ORG_ID, name: 'canonical-fix.diff', storage_path: null, external_url: null, file_size_bytes: 8_192, mime_type: 'text/x-diff', icon_label: 'DIFF', metadata: { files_changed: 11, additions: 24, deletions: 24 }, created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'ib-007',
    organization_id: MOCK_ORG_ID,
    agent_slug: 'analytics',
    subject: 'Weekly pipeline report delivered',
    preview: 'Pipeline velocity report for W22 is in #leadership. Highlights: stage-2 conversion +11.4% wow, SMB segment stalling at stage-4.',
    body: [
      'Standard weekly is in #leadership channel. Three things to know:',
      '1. Stage-2 → stage-3 conversion is up 11.4% wow, driven primarily by Atlas-enriched inbound.',
      '2. Stage-4 stall in SMB — 18% of deals are sitting 21+ days. I\'ve flagged this to Hale.',
      '3. Forecast accuracy is at 94% for the rolling quarter, in line with my baseline.',
    ],
    tags: ['report', 'ops'],
    priority: 4,
    is_read: true,
    is_resolved: false,
    is_archived: false,
    related_ai_run_id: null,
    resolved_at: null,
    archived_at: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    inbox_artifacts: [],
  },
]

export function getMockUnreadCount(): number {
  return MOCK_INBOX_ITEMS.filter(i => !i.is_read && !i.is_archived).length
}
```

- [ ] **Step 2: Re-export from `lib/mock/index.ts`**

Add to the exports:
```typescript
export { MOCK_INBOX_ITEMS, getMockUnreadCount } from './fixtures/inbox'
```

- [ ] **Step 3: Commit**

```bash
git add lib/mock/fixtures/inbox.ts lib/mock/index.ts
git commit -m "feat: add inbox mock fixtures with real timestamps and typed InboxItem shape"
```

---

### Task 3: DAL — `server/dal/inbox.ts`

**Files:**
- Create: `server/dal/inbox.ts`

- [ ] **Step 1: Write the DAL**

```typescript
// server/dal/inbox.ts
import 'server-only'
import type { InboxItem } from '@/types/database'
import { createServiceClient } from '@/lib/supabase/server'
import { MOCK_INBOX_ITEMS, getMockUnreadCount } from '@/lib/mock'

export interface InboxQueryOptions {
  tags?: string[]
  includeRead?: boolean
  includeArchived?: boolean
  includeResolved?: boolean
  limit?: number
}

export async function getInboxItems(orgId: string, options: InboxQueryOptions = {}): Promise<InboxItem[]> {
  const {
    tags,
    includeRead = true,
    includeArchived = false,
    includeResolved = false,
    limit = 50,
  } = options

  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    let items = [...MOCK_INBOX_ITEMS]
    if (!includeArchived) items = items.filter(i => !i.is_archived)
    if (!includeResolved) items = items.filter(i => !i.is_resolved)
    if (!includeRead) items = items.filter(i => !i.is_read)
    if (tags?.length) items = items.filter(i => tags.some(t => i.tags.includes(t as any)))
    return items.slice(0, limit)
  }

  let query = createServiceClient()
    .from('inbox_items')
    .select('*, inbox_artifacts(*)')
    .eq('organization_id', orgId)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!includeArchived) query = query.eq('is_archived', false)
  if (!includeResolved) query = query.eq('is_resolved', false)
  if (tags?.length) query = query.overlaps('tags', tags)

  const { data, error } = await query
  if (error) throw new Error(`getInboxItems: ${error.message}`)
  return (data ?? []) as InboxItem[]
}

export async function getUnreadInboxCount(orgId: string): Promise<number> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return getMockUnreadCount()
  }

  const { count, error } = await createServiceClient()
    .from('inbox_items')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('is_read', false)
    .eq('is_archived', false)
    .eq('is_resolved', false)

  if (error) throw new Error(`getUnreadInboxCount: ${error.message}`)
  return count ?? 0
}

export async function createInboxItem(
  orgId: string,
  data: Pick<InboxItem, 'agent_slug' | 'subject' | 'preview' | 'body' | 'tags' | 'priority'> & { related_ai_run_id?: string }
): Promise<InboxItem> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const item: InboxItem = {
      id: `ib-mock-${Date.now()}`,
      organization_id: orgId,
      is_read: false,
      is_resolved: false,
      is_archived: false,
      related_ai_run_id: data.related_ai_run_id ?? null,
      resolved_at: null,
      archived_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      inbox_artifacts: [],
      ...data,
    }
    MOCK_INBOX_ITEMS.unshift(item)
    return item
  }

  const { data: item, error } = await createServiceClient()
    .from('inbox_items')
    .insert({
      organization_id: orgId,
      ...data,
      related_ai_run_id: data.related_ai_run_id ?? null,
    })
    .select('*, inbox_artifacts(*)')
    .single()

  if (error) throw new Error(`createInboxItem: ${error.message}`)
  return item as InboxItem
}

export async function markItemRead(orgId: string, itemId: string): Promise<void> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const item = MOCK_INBOX_ITEMS.find(i => i.id === itemId)
    if (item) item.is_read = true
    return
  }

  const { error } = await createServiceClient()
    .from('inbox_items')
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('organization_id', orgId)

  if (error) throw new Error(`markItemRead: ${error.message}`)
}

export async function resolveItem(orgId: string, itemId: string): Promise<void> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const item = MOCK_INBOX_ITEMS.find(i => i.id === itemId)
    if (item) { item.is_resolved = true; item.resolved_at = new Date().toISOString() }
    return
  }

  const { error } = await createServiceClient()
    .from('inbox_items')
    .update({ is_resolved: true, resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('organization_id', orgId)

  if (error) throw new Error(`resolveItem: ${error.message}`)
}

export async function archiveItem(orgId: string, itemId: string): Promise<void> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const item = MOCK_INBOX_ITEMS.find(i => i.id === itemId)
    if (item) { item.is_archived = true; item.archived_at = new Date().toISOString() }
    return
  }

  const { error } = await createServiceClient()
    .from('inbox_items')
    .update({ is_archived: true, archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('organization_id', orgId)

  if (error) throw new Error(`archiveItem: ${error.message}`)
}
```

- [ ] **Step 2: Write tests**

Create `__tests__/dal-inbox.test.ts`:

```typescript
// __tests__/dal-inbox.test.ts
import { describe, it, expect, beforeEach } from 'vitest'

process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true'

// Must import AFTER setting env var
const { getInboxItems, getUnreadInboxCount, resolveItem, archiveItem } = await import('../server/dal/inbox')

describe('inbox DAL (mock mode)', () => {
  it('returns all non-archived items by default', async () => {
    const items = await getInboxItems('mock-org')
    expect(items.length).toBeGreaterThan(0)
    expect(items.every(i => !i.is_archived)).toBe(true)
  })

  it('filters by tag', async () => {
    const items = await getInboxItems('mock-org', { tags: ['report'] })
    expect(items.every(i => i.tags.includes('report'))).toBe(true)
  })

  it('getUnreadInboxCount returns count of unread items', async () => {
    const count = await getUnreadInboxCount('mock-org')
    expect(count).toBeGreaterThanOrEqual(0)
  })

  it('resolveItem marks item as resolved', async () => {
    const items = await getInboxItems('mock-org')
    const target = items[0]
    await resolveItem('mock-org', target.id)
    const after = await getInboxItems('mock-org', { includeResolved: true })
    expect(after.find(i => i.id === target.id)?.is_resolved).toBe(true)
  })

  it('archiveItem marks item as archived', async () => {
    const items = await getInboxItems('mock-org')
    const target = items.find(i => !i.is_archived)!
    await archiveItem('mock-org', target.id)
    const after = await getInboxItems('mock-org')
    expect(after.find(i => i.id === target.id)).toBeUndefined()
  })
})
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run __tests__/dal-inbox.test.ts
```

Expected: All 5 tests pass.

- [ ] **Step 4: Commit**

```bash
git add server/dal/inbox.ts __tests__/dal-inbox.test.ts
git commit -m "feat: inbox DAL with dual mock/Supabase mode and full mutation coverage"
```

---

### Task 4: Server Actions — `features/inbox/server/actions.ts`

**Files:**
- Create: `features/inbox/server/actions.ts`

- [ ] **Step 1: Write server actions**

```typescript
// features/inbox/server/actions.ts
'use server'

import { markItemRead, resolveItem, archiveItem, createInboxItem } from '@/server/dal/inbox'
import { MOCK_ORG_ID } from '@/lib/mock'

function getOrgId(): string {
  // In production, derive from auth session.
  // For now, use MOCK_ORG_ID pattern consistent with existing server actions.
  return MOCK_ORG_ID
}

export async function markAsReadAction(itemId: string): Promise<void> {
  await markItemRead(getOrgId(), itemId)
}

export async function resolveItemAction(itemId: string): Promise<void> {
  await resolveItem(getOrgId(), itemId)
}

export async function archiveItemAction(itemId: string): Promise<void> {
  await archiveItem(getOrgId(), itemId)
}

export async function approveAndContinueAction(itemId: string): Promise<void> {
  // Mark the inbox item resolved
  await resolveItem(getOrgId(), itemId)
  // TODO: if item has related_approval_id, approve that approval
  // TODO: if item has related_ai_run_id, emit workflow_resume event
  // These hooks are stubs until approval and workflow orchestration tables exist
}

export async function replyWithNoteAction(itemId: string, note: string): Promise<void> {
  if (!note.trim()) return
  const orgId = getOrgId()

  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    console.log('[inbox] reply stub (mock mode):', { itemId, note })
    return
  }

  const { createServiceClient } = await import('@/lib/supabase/server')
  const { error } = await createServiceClient()
    .from('inbox_item_replies')
    .insert({ inbox_item_id: itemId, organization_id: orgId, note })
  if (error) throw new Error(`replyWithNoteAction: ${error.message}`)
}
```

- [ ] **Step 2: Commit**

```bash
git add features/inbox/server/actions.ts
git commit -m "feat: inbox server actions for read, resolve, archive, approve, reply"
```

---

### Task 5: Utility — relative time formatter

**Files:**
- Create: `lib/utils/format-time.ts`

- [ ] **Step 1: Write formatter**

```typescript
// lib/utils/format-time.ts
export function formatRelativeTime(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m`
  if (diffHr < 24) return `${diffHr}h`
  if (diffDay === 1) return '1d'
  return `${diffDay}d`
}
```

- [ ] **Step 2: Write test**

```typescript
// __tests__/format-time.test.ts
import { describe, it, expect } from 'vitest'
import { formatRelativeTime } from '../lib/utils/format-time'

describe('formatRelativeTime', () => {
  it('shows "just now" for < 1 minute', () => {
    expect(formatRelativeTime(new Date(Date.now() - 30_000).toISOString())).toBe('just now')
  })
  it('shows minutes', () => {
    expect(formatRelativeTime(new Date(Date.now() - 5 * 60_000).toISOString())).toBe('5m')
  })
  it('shows hours', () => {
    expect(formatRelativeTime(new Date(Date.now() - 3 * 3600_000).toISOString())).toBe('3h')
  })
  it('shows days', () => {
    expect(formatRelativeTime(new Date(Date.now() - 2 * 86400_000).toISOString())).toBe('2d')
  })
})
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run __tests__/format-time.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 4: Commit**

```bash
git add lib/utils/format-time.ts __tests__/format-time.test.ts
git commit -m "feat: formatRelativeTime utility for inbox timestamps"
```

---

### Task 6: Productionize the Inbox Page

**Files:**
- Modify: `app/(dashboard)/workspace/inbox/page.tsx` (full rewrite to server + client split)
- Create: `features/inbox/components/inbox-client.tsx`

- [ ] **Step 1: Write `InboxClient` client component**

```tsx
// features/inbox/components/inbox-client.tsx
'use client'

import { useState, useTransition } from 'react'
import type { InboxItem } from '@/types/database'
import { PageAgentGlyph, AGENT_MAP } from '@/components/workspace/page-agent-glyph'
import { formatRelativeTime } from '@/lib/utils/format-time'
import {
  markAsReadAction,
  resolveItemAction,
  archiveItemAction,
  approveAndContinueAction,
  replyWithNoteAction,
} from '@/features/inbox/server/actions'

type FilterId = 'all' | 'unread' | 'decision' | 'reports' | 'ops'

const FILTERS: { id: FilterId; label: string; countFn: (items: InboxItem[]) => number | undefined }[] = [
  { id: 'all',      label: 'All',         countFn: items => items.length },
  { id: 'unread',   label: 'Unread',      countFn: items => items.filter(m => !m.is_read).length },
  { id: 'decision', label: 'Decisions',   countFn: items => items.filter(m => m.tags.includes('decision') || m.tags.includes('approval')).length },
  { id: 'reports',  label: 'Reports',     countFn: items => items.filter(m => m.tags.includes('report')).length },
  { id: 'ops',      label: 'Operational', countFn: items => items.filter(m => m.tags.includes('ops') || m.tags.includes('routing')).length },
]

interface Props {
  initialItems: InboxItem[]
}

export function InboxClient({ initialItems }: Props) {
  const [items, setItems] = useState<InboxItem[]>(initialItems)
  const [filter, setFilter] = useState<FilterId>('all')
  const [activeId, setActiveId] = useState<string>(initialItems[0]?.id ?? '')
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = items.filter(m => {
    if (m.is_archived || m.is_resolved) return false
    if (filter === 'unread') return !m.is_read
    if (filter === 'decision') return m.tags.includes('decision') || m.tags.includes('approval')
    if (filter === 'reports') return m.tags.includes('report')
    if (filter === 'ops') return m.tags.includes('ops') || m.tags.includes('routing')
    return true
  })

  const active = items.find(m => m.id === activeId)

  function handleItemClick(itemId: string) {
    setActiveId(itemId)
    setReplyOpen(false)
    setReplyText('')
    const item = items.find(i => i.id === itemId)
    if (item && !item.is_read) {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_read: true } : i))
      startTransition(() => { markAsReadAction(itemId) })
    }
  }

  function handleResolve(itemId: string) {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_resolved: true } : i))
    const nextActive = filtered.find(i => i.id !== itemId)
    if (nextActive) setActiveId(nextActive.id)
    startTransition(() => { resolveItemAction(itemId) })
  }

  function handleArchive(itemId: string) {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_archived: true } : i))
    const nextActive = filtered.find(i => i.id !== itemId)
    if (nextActive) setActiveId(nextActive.id)
    startTransition(() => { archiveItemAction(itemId) })
  }

  function handleApprove(itemId: string) {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_resolved: true } : i))
    const nextActive = filtered.find(i => i.id !== itemId)
    if (nextActive) setActiveId(nextActive.id)
    startTransition(() => { approveAndContinueAction(itemId) })
  }

  function handleReply(itemId: string) {
    if (!replyText.trim()) return
    setReplyOpen(false)
    setReplyText('')
    startTransition(() => { replyWithNoteAction(itemId, replyText) })
  }

  return (
    <div className="inbox fade-in">
      {/* Left: message list */}
      <div className="inbox-list">
        <div className="inbox-filters">
          {FILTERS.map(f => {
            const count = f.countFn(items)
            return (
              <button
                key={f.id}
                className={'chip' + (filter === f.id ? ' active' : '')}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                {count != null && <span className="count">{count}</span>}
              </button>
            )
          })}
        </div>
        {filtered.map(m => {
          const agent = AGENT_MAP[m.agent_slug]
          return (
            <div
              key={m.id}
              className={'inbox-item' + (m.id === activeId ? ' active' : '') + (!m.is_read ? ' unread' : '')}
              onClick={() => handleItemClick(m.id)}
            >
              <PageAgentGlyph agentId={m.agent_slug} size={26} />
              <div style={{ minWidth: 0 }}>
                <div className="inbox-meta-row">
                  <div className="inbox-from">{agent?.name}</div>
                  <div className="inbox-time">{formatRelativeTime(m.created_at)}</div>
                </div>
                <div className="inbox-subject">{m.subject}</div>
                <div className="inbox-preview">{m.preview}</div>
                <div className="inbox-tags">
                  {m.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 12.5 }}>
            {filter === 'all' ? 'You\'re caught up. Your AI team is working.' : `No ${filter} items right now.`}
          </div>
        )}
      </div>

      {/* Right: message detail */}
      {active && !active.is_resolved && !active.is_archived && (() => {
        const agent = AGENT_MAP[active.agent_slug]
        return (
          <div className="inbox-detail fade-in" key={active.id}>
            <div className="detail-head">
              <div className="detail-from">
                <PageAgentGlyph agentId={active.agent_slug} size={34} />
                <div>
                  <div style={{ fontSize: 13, color: 'var(--fg-0)', fontWeight: 500 }}>{agent?.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {agent?.role}
                  </div>
                </div>
              </div>
              <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
                {formatRelativeTime(active.created_at)} ago · {active.id.slice(0, 8).toUpperCase()}
              </div>
            </div>
            <h1 className="detail-subject">{active.subject}</h1>
            <div className="detail-body">
              {active.body.map((p, i) => <p key={i}>{p}</p>)}
              {active.inbox_artifacts && active.inbox_artifacts.length > 0 && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 8 }}>
                    Attached artifacts
                  </div>
                  {active.inbox_artifacts.map((a) => (
                    <div className="artifact" key={a.id}>
                      <div className="artifact-icon">{a.icon_label}</div>
                      <div>
                        <div className="artifact-name">{a.name}</div>
                        <div className="artifact-meta">
                          {a.file_size_bytes ? `${(a.file_size_bytes / 1024).toFixed(0)}KB` : ''}{a.metadata?.pages ? ` · ${a.metadata.pages} pages` : ''}
                          {a.metadata?.duration ? ` · ${a.metadata.duration}` : ''}
                          {a.metadata?.files_changed ? ` · ${a.metadata.files_changed} files` : ''}
                        </div>
                      </div>
                      <button className="btn" disabled={!a.storage_path && !a.external_url}>
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {replyOpen && (
                <div style={{ marginTop: 16 }}>
                  <textarea
                    autoFocus
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Add a note for the agent..."
                    style={{
                      width: '100%', minHeight: 80, padding: '8px 10px',
                      background: 'var(--bg-2)', border: '1px solid var(--line-2)',
                      borderRadius: 'var(--r-sm)', color: 'var(--fg-0)',
                      fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn primary" onClick={() => handleReply(active.id)} disabled={!replyText.trim()}>
                      Send note
                    </button>
                    <button className="btn" onClick={() => { setReplyOpen(false); setReplyText('') }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="detail-actions">
              <button className="btn primary" disabled={isPending} onClick={() => handleApprove(active.id)}>
                Approve &amp; continue
              </button>
              <button className="btn" onClick={() => setReplyOpen(r => !r)}>
                Reply with note
              </button>
              <button className="btn" disabled={isPending} onClick={() => handleResolve(active.id)}>
                Mark resolved
              </button>
              <button className="btn" style={{ marginLeft: 'auto', color: 'var(--fg-3)' }} disabled={isPending} onClick={() => handleArchive(active.id)}>
                Archive
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `app/(dashboard)/workspace/inbox/page.tsx` as server component shell**

```tsx
// app/(dashboard)/workspace/inbox/page.tsx
import { getInboxItems } from '@/server/dal/inbox'
import { MOCK_ORG_ID } from '@/lib/mock'
import { InboxClient } from '@/features/inbox/components/inbox-client'

export default async function InboxPage() {
  const items = await getInboxItems(MOCK_ORG_ID)
  return <InboxClient initialItems={items} />
}
```

- [ ] **Step 3: Start dev server and verify**

```bash
npm run dev
```

Navigate to `http://localhost:3000/workspace/inbox`. Verify:
- Items load from mock fixture (same visual as before)
- Timestamps show relative format ("2m", "23m", etc.)
- Click an item → marks it read (unread dot disappears)
- "Mark resolved" → item disappears from list, next item becomes active
- "Archive" → item disappears from list
- "Reply with note" → textarea opens, submit closes it
- Filter chips update counts correctly

- [ ] **Step 4: Commit**

```bash
git add app/'(dashboard)'/workspace/inbox/page.tsx features/inbox/components/inbox-client.tsx
git commit -m "feat: productionize inbox page — server component shell + InboxClient with real actions"
```

---

### Task 7: Update Sidebar Badge to Live Count

**Files:**
- Modify: `components/layout/sidebar/index.tsx`

- [ ] **Step 1: Find the hardcoded badge**

In `components/layout/sidebar/index.tsx`, locate the line:
```tsx
<NavItem href="/workspace/inbox" icon="inbox" label="Inbox" badge="12" />
```

- [ ] **Step 2: Understand the sidebar pattern**

The sidebar is a `'use client'` component. It cannot directly call server-only DAL functions. Options:
1. Fetch count in the server layout and pass as prop ← simplest, consistent with project pattern
2. Use a server component wrapper ← breaks the client component pattern
3. API route + SWR ← overkill for a count

Use option 1: pass `inboxCount` prop from the server layout.

- [ ] **Step 3: Modify the dashboard layout**

In `app/(dashboard)/layout.tsx`, add count fetch and pass to ShellLayout (or sidebar):

```tsx
// app/(dashboard)/layout.tsx — add import and count fetch
import { getUnreadInboxCount } from '@/server/dal/inbox'
import { MOCK_ORG_ID } from '@/lib/mock'

// In the async server component:
const inboxUnreadCount = await getUnreadInboxCount(MOCK_ORG_ID).catch(() => 0)

// Pass to ShellLayout or sidebar as prop:
<ShellLayout inboxUnreadCount={inboxUnreadCount}>
  {children}
</ShellLayout>
```

Then in sidebar, replace `badge="12"` with `badge={inboxUnreadCount > 0 ? String(inboxUnreadCount) : undefined}`.

Note: Read the existing `app/(dashboard)/layout.tsx` first to understand the exact ShellLayout props interface before editing. Trace the prop through ShellLayout → Sidebar if needed.

- [ ] **Step 4: Commit**

```bash
git add app/'(dashboard)'/layout.tsx components/layout/sidebar/index.tsx
git commit -m "feat: wire inbox unread count to sidebar badge from server DAL"
```

---

### Task 8: AI Pipeline Integration — Growth Agent Inbox Emit

**Files:**
- Modify: `lib/ai/pipeline/discovery.ts`

- [ ] **Step 1: Read `lib/ai/pipeline/discovery.ts`**

Read the full file to understand its structure before modifying.

- [ ] **Step 2: Add inbox emit after pipeline stages**

After the pipeline completes a full run (`discovery → research → scoring`), emit an inbox item:

```typescript
// At the end of a successful pipeline run in discovery.ts:
import { createInboxItem } from '@/server/dal/inbox'

// After scoring stage completes:
await createInboxItem(orgId, {
  agent_slug: 'growth',
  subject: `Discovery run complete — ${opportunities.length} opportunities scored`,
  preview: `${approvedCount} above threshold, ${reviewingCount} reviewing, ${rejectedCount} below threshold. Top opportunity: ${topOpportunity?.company_name ?? 'none'}.`,
  body: [
    `Completed discovery run for ${orgId}. Processed ${opportunities.length} partnership candidates.`,
    `Score distribution: ${approvedCount} approved (>75), ${reviewingCount} reviewing (50–75), ${rejectedCount} below threshold (<50).`,
    topOpportunity ? `Top opportunity this run: ${topOpportunity.company_name} (score: ${topOpportunity.score}). ${topOpportunity.estimated_impact ?? ''}` : 'No high-confidence opportunities this run.',
  ],
  tags: ['report', 'ops'],
  priority: 3,
  related_ai_run_id: run.id,
})
```

This is the foundation for the AI-to-Inbox pipeline. Add the import at the top of the file and the emit at the correct location after reading the file.

- [ ] **Step 3: Commit**

```bash
git add lib/ai/pipeline/discovery.ts
git commit -m "feat: emit inbox item from growth agent discovery pipeline on completion"
```

---

### Task 9: Verification — End-to-End Smoke Test

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass, no regressions.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: No TypeScript errors, no build failures.

- [ ] **Step 3: Lint**

```bash
npm run lint
```

Expected: No new lint errors.

- [ ] **Step 4: Manual smoke test (dev server)**

```bash
npm run dev
```

Navigate and verify:
1. `/workspace/inbox` loads without console errors
2. 7 items shown, timestamps are formatted correctly
3. Unread items show blue dot
4. Clicking read item — no unread dot, no server error
5. "Mark resolved" removes item from list without page reload
6. "Archive" removes item from list without page reload
7. "Approve & continue" removes item from list without page reload
8. "Reply with note" opens textarea, submit closes it
9. Empty state shows when all items are resolved/archived
10. Filter chips count correctly
11. Sidebar badge reflects actual unread count (should be 2 — ib-001 and ib-002)

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: inbox production — full mock-to-production migration complete"
```

---

## 13. Risks & Open Questions

### Highest Risk: Sidebar Badge Prop Threading
The sidebar badge count requires threading a server-fetched value through the layout prop chain. The exact shape of `ShellLayout` props must be read before implementing Task 7 — if ShellLayout does not currently accept dynamic props, a small refactor is needed. This should not break existing functionality but requires careful reading of the layout file.

### Open Questions Requiring Product Decisions

| Question | Impact | Recommended Default |
|---|---|---|
| Should "Approve & continue" on a `decision` item (not `approval`) resume a workflow, or just resolve the item? | Workflow orchestration | Resolve only, until workflow orchestration is wired |
| Should Inbox show resolved items in a "Done" section or only via a filter? | UX | Hidden by default, accessible via "Resolved" filter (add to FILTERS) |
| Should agents other than growth emit inbox items today, or only growth? | Pipeline scope | Growth only in P0; others in P1 |
| Should `replyWithNote` send the reply back to the agent in any machine-readable way? | AI pipeline feedback loop | Log only in P0; structured reply routing in P1 |
| What is the sidebar badge threshold? All unread, or only decision/approval/escalation? | UX signal quality | Only decision + approval + escalation + unread report (exclude ops/routing) |
| Should Realtime be wired in the first production pass or in P1? | Complexity | P1 — initial pass uses server fetch + manual refresh |

### Missing Credentials / Infrastructure
- Supabase Storage bucket for artifact files (currently no bucket exists for inbox artifacts)
- Supabase Realtime publication must include `inbox_items` table (check `supabase/config.toml`)
- Auth system for `getOrgId()` — currently uses hardcoded `MOCK_ORG_ID`; needs real auth session in production

### Scope Intentionally Deferred to P1
- Realtime subscription for live new items
- Artifact file upload from AI pipeline to Supabase Storage  
- Cross-linking between Inbox items and Approvals page items
- Cross-linking between Inbox items and Reports page items
- "Approve all low-risk" bulk action
- Auto-read ops items via background job
- Inbox search
- Notification / push for new inbox items
- Per-user read state (currently per-org; needs `user_id` column once multi-user is supported)
