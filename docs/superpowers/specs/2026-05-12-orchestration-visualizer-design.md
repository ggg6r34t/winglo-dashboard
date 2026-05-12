# Orchestration Visualizer — Design Spec

**Date:** 2026-05-12  
**Status:** Approved  
**Goal:** A real-time operational AI orchestration visualizer — a live observability layer that lets users watch their AI agents work, inspect outputs, and understand execution history.

---

## Overview

A dedicated `/orchestration` page in the Winglo Growth Agent dashboard. Split layout: a live agent graph (60%) on the left, a real-time activity feed (40%) on the right. Built in three independent phases, each shippable on its own.

The system is NOT decorative. It reads from real `ai_runs` and `agent_logs` data, updates live via Supabase Realtime, and gives users genuine operational visibility into their AI workflows.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Language | TypeScript strict |
| Styling | Tailwind v4 (CSS variables) |
| Graph | `@xyflow/react` (React Flow v12) — NEW dependency |
| Animation | Framer Motion (already installed) |
| State | Zustand (already installed) |
| Data fetching | TanStack Query (already installed) |
| Realtime | Supabase Realtime postgres_changes |
| UI primitives | Radix UI (already installed) |

---

## Phase Decomposition

| Phase | New DB tables | Key deliverable |
|---|---|---|
| **1** | 0 | Live agent graph + real-time activity feed |
| **2** | 3 | Agent detail panels, tool call viewer, memory viewer |
| **3** | 0 | Execution timeline (Gantt), workflow replay inspector |

Each phase is independently deployable and produces a working system.

---

## Phase 1 — Core Observability

### What it delivers

A `/orchestration` page showing:
- All 7 agents as live nodes with animated state transitions
- Adaptive graph topology: linear pipeline → fan-out for parallel agents
- Real-time activity feed driven by `agent_logs`
- Status bar: active run count, total tokens, last run time

### Data layer

**Hydration (on mount):** TanStack Query fetches the last 20 `ai_runs` and last 100 `agent_logs` from the existing DAL.

**Live updates:** Two Supabase Realtime channels:
1. `postgres_changes` on `ai_runs` (INSERT + UPDATE) → updates agent node states in Zustand store
2. `postgres_changes` on `agent_logs` (INSERT) → prepends entries to the activity feed in Zustand store

Supabase Realtime must be enabled on `ai_runs` and `agent_logs` tables in the Supabase dashboard.

**Zustand store shape:**
```typescript
interface OrchestrationStore {
  // Agent nodes
  agentStates: Record<AgentType, AgentNodeState>
  activeRuns: AIRun[]
  
  // Activity feed
  feedEvents: ActivityEvent[]
  
  // Actions
  hydrateRuns: (runs: AIRun[]) => void
  hydrateLogs: (logs: AgentLog[]) => void
  upsertRun: (run: AIRun) => void
  appendLog: (log: AgentLog) => void
}
```

### Agent states

Derived from the most recent `ai_run` per agent type:

| `ai_runs.status` | Node visual state |
|---|---|
| No recent run | Idle |
| `queued` | Queued |
| `running` | Executing (animated pulse) |
| `complete` | Completed |
| `failed` | Failed (red) |

**Supported states with distinct visuals:**
`Idle` · `Queued` · `Executing` · `Completed` · `Failed`

### Graph topology

Fixed node positions with dynamic parallel sub-nodes:

```
[Intake] → [Discovery] → [Research×1..N] → [Scoring×1..N]
                                    ↓
                    [Outreach]   [Memory]   [Analytics]
```

- **Intake → Discovery**: sequential, single edge
- **Discovery → Research**: fan-out — N dynamic nodes appear when discovery completes, one per opportunity
- **Research → Scoring**: fan-out preserved — each research node connects to its scoring counterpart
- **Outreach / Memory / Analytics**: independent nodes below the pipeline, activate on their own runs

Dynamic nodes (Research×N, Scoring×N) are created in the Zustand store when `ai_runs` for those agent types appear with matching `input.profileId`. They collapse (removed from graph) 5 seconds after all their runs reach terminal state.

### WorkflowEdge

Edges have two visual modes:
- **Idle**: thin dotted line, static
- **Active**: solid line with a travelling dot animation (Framer Motion `pathLength` + offset)

Edge activity is derived from: both connected nodes have runs in the same discovery chain (same `input.profileId`).

### AgentNode

Each node displays:
- Agent name
- State badge (Idle / Executing / etc.)
- Last run duration (e.g. `4.2s`)
- Token count if available (e.g. `847 tok`)
- Subtle pulse animation when `Executing`

### ActivityFeed

Chronological list of `agent_logs` entries. Each entry shows:
- Relative timestamp (`08:42`)
- Agent type badge (color-coded)
- Log level badge (info / warning / error)
- Message text

New entries slide in at the top with a brief fade-in (Framer Motion `AnimatePresence`). The feed auto-scrolls to top on new entries unless the user has manually scrolled down.

### OrchestrationStatusBar

Appears at the top of the page below `PageHeader`:
```
[2 active runs]  [1,247 tokens today]  [Last run: 2m ago]  [● Live]
```
The `● Live` indicator pulses green when the Realtime subscription is connected, turns grey if disconnected.

### Page layout

```
┌──────────────────────────────────────────────────────────────┐
│ PageHeader: "Orchestration"   [status bar]                   │
├──────────────────────────────────┬───────────────────────────┤
│                                  │                           │
│   AgentGraph                     │   ActivityFeed            │
│   (React Flow, ~60% width)       │   (~40% width)            │
│                                  │                           │
│   [Intake]→[Discovery]→[R1][R2]  │   08:44 Discovery ✓       │
│                        ↓  ↓      │   08:44 Research started  │
│                    [S1][S2]       │   08:43 Memory retrieved  │
│   [Outreach] [Memory] [Analytics]│   08:42 Discovery started │
│                                  │                           │
└──────────────────────────────────┴───────────────────────────┘
```

### Phase 1 file structure

```
features/orchestration/
  components/
    agent-graph.tsx               — React Flow canvas + layout
    agent-node.tsx                — node with Framer Motion state transitions
    workflow-edge.tsx             — animated edge (idle / active modes)
    activity-feed.tsx             — live log stream with AnimatePresence
    orchestration-status-bar.tsx  — active runs, tokens, live indicator
  hooks/
    use-orchestration-store.ts    — Zustand store + actions
    use-realtime-runs.ts          — Supabase Realtime subscriptions
  types/
    index.ts                      — AgentNodeState, ActivityEvent, NodeMode types
  utils/
    graph-layout.ts               — adaptive layout: positions + fan-out logic
    agent-colors.ts               — state → Tailwind CSS variable mapping

app/(dashboard)/orchestration/
  page.tsx                        — async Server Component, initial hydration
```

### Phase 1 mock support

When `NEXT_PUBLIC_USE_MOCK_DATA=true`, the Zustand store is hydrated from `mockAIRuns` and `mockAgentLogs` (extending the existing `lib/mock` fixtures). Realtime subscriptions are skipped. A mock "run in progress" fixture simulates a live discovery chain for demo purposes.

Phases 2 and 3 mock support follows the same pattern: empty arrays for `tool_calls`, `agent_messages`, and `memory_access_logs` in mock mode. The `AgentDetailPanel` renders with the Phase 1 data (logs, status) and shows empty states for tool calls and memory tabs.

---

## Phase 2 — Rich Event Schema + Detail Panels

### New tables

```sql
-- Tool calls made during an agent run
tool_calls (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  ai_run_id UUID NOT NULL REFERENCES ai_runs(id),
  tool_name TEXT NOT NULL,           -- 'openai_completion', 'supabase_query', 'embedding_search'
  input JSONB,
  output JSONB,
  status TEXT NOT NULL,              -- 'success' | 'error'
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Inter-agent handoffs during orchestration
agent_messages (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  from_run_id UUID REFERENCES ai_runs(id),
  to_agent_type TEXT NOT NULL,       -- the agent type receiving the handoff
  content JSONB NOT NULL,            -- the payload transferred
  message_type TEXT NOT NULL,        -- 'handoff' | 'delegation' | 'result'
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Memory system access events
memory_access_logs (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  ai_run_id UUID REFERENCES ai_runs(id),
  operation TEXT NOT NULL,           -- 'read' | 'write' | 'search'
  query TEXT,
  result_count INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Graph enhancements

Edges between connected agents in the same chain gain **payload labels**:
- Discovery → Research: `"7 opportunities"`
- Research → Scoring: `"5 enriched"`
- Discovery → Memory: `"3 memories retrieved"`

Labels fade in when the run completes and persist for the session. Derived from `agent_messages.content`.

### AgentDetailPanel

Slide-over panel from the right — triggered by clicking any agent node. The graph remains fully visible (panel overlays the activity feed, which collapses).

Four tabs:
1. **Overview** — agent name, last run status, duration, tokens used, health (pass/fail rate over last 10 runs)
2. **Logs** — `agent_logs` stream for the selected run, same visual style as activity feed
3. **Tool Calls** — list of `tool_calls` rows, each expandable with input/output JSON
4. **Memory** — `memory_access_logs` rows: operation type badge, query text, result count, latency

### Phase 2 instrumentation

The following existing code is updated to write to new tables:

- `features/intake/server/actions.ts` — `runDiscovery` writes `agent_messages` rows at each phase handoff (discovery→research, research→scoring)
- `server/dal/memory-entries.ts` — `searchMemoriesBySimilarity` writes one `memory_access_logs` row per call
- `lib/ai/providers/openai.ts` and `lib/ai/providers/anthropic.ts` — `complete()` writes one `tool_calls` row per LLM completion (mock provider skips this)

### Phase 2 new components

```
features/orchestration/components/
  agent-detail-panel.tsx    — slide-over with 4-tab inspection
  tool-call-viewer.tsx      — expandable input/output per tool call
  memory-viewer.tsx         — memory access log with operation badges
```

---

## Phase 3 — Execution Timeline + Replay Inspector

### ExecutionTimeline

A tab below the main graph (toggle between "Graph" and "Timeline" views). Renders a horizontal Gantt chart from `ai_runs.started_at` and `ai_runs.completed_at` — no new schema required.

Each row is one `ai_run`. Parallel runs (research × N, scoring × N) stack as adjacent rows sharing the same time axis. Color encodes agent type. Width encodes duration. A vertical cursor shows current time during a live run.

```
Intake      ████ 4.1s
Discovery        █████████ 8.7s
Research-1                 █████████████ 12.3s
Research-2                 ██████████ 10.1s
Research-3                 █████████████ 13.0s
Scoring-1                                ████ 3.9s
Scoring-2                                ████ 4.0s
─────────────────────────────────────────────────
0s          5s          15s         25s   29s
```

Hovering a bar shows a tooltip: agent type, duration, token count, status.

### WorkflowInspector

A run selector dropdown at the top of the page (available in both Graph and Timeline views). Selecting a completed run from history:

1. Loads all `ai_runs` and `agent_logs` for that discovery chain
2. Animates the graph through execution states in order at 2× real speed
3. Pause / scrub controls (a progress slider mapped to elapsed time)
4. The activity feed replays log entries as the scrubber moves

Driven entirely by existing timestamped data — no new schema.

### Phase 3 new components

```
features/orchestration/components/
  execution-timeline.tsx    — Gantt chart (D3 or CSS grid based)
  workflow-inspector.tsx    — run selector + replay controls
  run-selector.tsx          — dropdown to select historical runs
```

---

## Visual Design

The UI follows the existing app's dark theme conventions:

- **Surface**: `var(--surface)` / `var(--surface-raised)`
- **Borders**: `var(--border-color)`
- **Text**: `var(--text-primary)` / `var(--text-muted)`
- **Accent**: `var(--accent)` for active/running states
- **Destructive**: `var(--destructive)` for failed states

Agent state colors:
| State | Color |
|---|---|
| Idle | `var(--text-muted)` — grey |
| Queued | `amber-400` |
| Executing | `var(--accent)` — blue, pulse |
| Completed | `green-500` |
| Failed | `var(--destructive)` — red |

No gradients. No glow effects. Subtle Framer Motion transitions (200ms ease). Operational clarity over visual drama.

---

## Navigation

Add `/orchestration` to the sidebar nav (after Analytics):

```typescript
{ label: 'Orchestration', href: '/orchestration', icon: NetworkIcon }
```

---

## Error and Disconnection States

- **Realtime disconnected**: `● Live` indicator turns grey, feeds a warning into the status bar: "Live updates paused — reconnecting"
- **Run stuck in `running`**: nodes show a warning state after 5 minutes with no log activity
- **No runs yet**: empty state in the graph ("No agent runs yet. Submit a business profile to get started.")
- **Failed run**: node turns red, activity feed entry shows the error message

---

## Testing

Each phase includes:
- Unit tests for the Zustand store (state transitions, hydration, realtime event handling)
- Unit tests for `graph-layout.ts` (fan-out logic, node positions)
- Component tests for `AgentNode` (all state visual variants)
- Mock mode must render without errors and show realistic fixture data

---

## Out of Scope

- Authentication (still uses `MOCK_ORG_ID` — same limitation as rest of app)
- Background job processing (runs still execute in HTTP request lifecycle)
- Cross-org orchestration views
- Custom workflow definitions (the graph topology is derived from agent types, not user-defined)
