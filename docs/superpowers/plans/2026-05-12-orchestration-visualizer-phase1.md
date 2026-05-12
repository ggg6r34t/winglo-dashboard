# Orchestration Visualizer — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a live `/orchestration` page with an agent graph and activity feed driven by real `ai_runs` and `agent_logs` data, updating in real-time via Supabase Realtime.

**Architecture:** Async Server Component fetches the last 20 runs and 100 logs for initial hydration; a Client Component seeds the Zustand store and mounts two Supabase Realtime channels (ai_runs + agent_logs postgres_changes). React Flow renders agent nodes with Framer Motion state transitions; an activity feed with AnimatePresence shows live log entries.

**Tech Stack:** Next.js 16 App Router, @xyflow/react v12, Framer Motion v12, Zustand v5, Supabase Realtime postgres_changes, TanStack Query v5, Tailwind v4 CSS variables, Vitest

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `features/orchestration/types/index.ts` | Create | AgentNodeState, AgentNodeData, ActivityEvent types |
| `lib/mock/fixtures/ai-runs.ts` | Modify | Add 3 research runs for fan-out demo |
| `lib/mock/fixtures/agent-logs.ts` | Modify | Add 3 research logs |
| `server/dal/ai-runs.ts` | Modify | Add `getOrgAgentLogs(orgId, limit)` |
| `features/orchestration/utils/graph-layout.ts` | Create | `computeGraphLayout`, `deriveNodeState` |
| `features/orchestration/utils/agent-colors.ts` | Create | State → CSS class mapping |
| `features/orchestration/hooks/use-orchestration-store.ts` | Create | Zustand store |
| `features/orchestration/hooks/use-realtime-runs.ts` | Create | Supabase Realtime subscriptions |
| `features/orchestration/components/agent-node.tsx` | Create | Custom React Flow node |
| `features/orchestration/components/workflow-edge.tsx` | Create | Animated custom edge |
| `features/orchestration/components/agent-graph.tsx` | Create | React Flow canvas |
| `features/orchestration/components/activity-feed.tsx` | Create | AnimatePresence log stream |
| `features/orchestration/components/orchestration-status-bar.tsx` | Create | Active runs / tokens / live indicator |
| `features/orchestration/components/orchestration-page-client.tsx` | Create | Client shell that seeds the store |
| `app/(dashboard)/orchestration/page.tsx` | Create | Async Server Component, initial hydration |
| `components/layout/sidebar/nav-items.tsx` | Modify | Add Orchestration nav item |
| `__tests__/orchestration-store.test.ts` | Create | Zustand store unit tests |
| `__tests__/graph-layout.test.ts` | Create | Layout + deriveNodeState tests |

---

## Task 1: Install @xyflow/react

**Files:**
- No source files (package.json + node_modules only)

- [ ] **Step 1: Install the package**

```bash
npm install @xyflow/react
```

Expected: exits with 0, `node_modules/@xyflow/react` exists.

- [ ] **Step 2: Verify the CSS asset is present**

```bash
ls node_modules/@xyflow/react/dist/style.css
```

Expected: file listed.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: install @xyflow/react for orchestration visualizer"
```

---

## Task 2: Types

**Files:**
- Create: `features/orchestration/types/index.ts`

- [ ] **Step 1: Create the types file**

Create `features/orchestration/types/index.ts`:

```typescript
import type { Node, Edge } from '@xyflow/react'
import type { AgentType } from '@/types'

export type AgentNodeState = 'idle' | 'queued' | 'executing' | 'completed' | 'failed'

export interface AgentNodeData extends Record<string, unknown> {
  label: string
  agentType: AgentType
  state: AgentNodeState
  lastRunDurationMs: number | null
  tokensUsed: number | null
  runId: string | null
}

export interface ActivityEvent {
  id: string
  aiRunId: string
  agentType: AgentType
  level: 'info' | 'warning' | 'error'
  message: string
  createdAt: string
}

export type AgentFlowNode = Node<AgentNodeData, 'agent'>
export type WorkflowFlowEdge = Edge<{ active: boolean }>
```

- [ ] **Step 2: Commit**

```bash
git add features/orchestration/types/index.ts
git commit -m "feat(orchestration): add Phase 1 types"
```

---

## Task 3: Mock Fixture Augmentation + DAL Extension

**Files:**
- Modify: `lib/mock/fixtures/ai-runs.ts`
- Modify: `lib/mock/fixtures/agent-logs.ts`
- Modify: `server/dal/ai-runs.ts`

- [ ] **Step 1: Add 3 research runs to ai-runs.ts**

Open `lib/mock/fixtures/ai-runs.ts`. After the closing `]` of the `mockAIRuns` array (before `]`), add three research runs. The full file becomes:

```typescript
import type { AIRun } from '@/types'
import { MOCK_ORG_ID } from './organizations'

const ORG = MOCK_ORG_ID

export const mockAIRuns: AIRun[] = [
  {
    id: 'run-00000000000000000000000001',
    organization_id: ORG,
    agent_type: 'intake',
    status: 'complete',
    input: { website_url: 'https://acme-ai.example.com', run_type: 'full_analysis' },
    output: { profile_id: 'bp-0000-0000-0000-000000000001', sections_completed: 5 },
    error: null,
    duration_ms: 4210,
    tokens_used: 1840,
    started_at: '2026-05-10T09:00:00Z',
    completed_at: '2026-05-10T09:00:04Z',
    created_at: '2026-05-10T09:00:00Z',
  },
  {
    id: 'run-00000000000000000000000002',
    organization_id: ORG,
    agent_type: 'discovery',
    status: 'complete',
    input: { profileId: 'bp-0000-0000-0000-000000000001' },
    output: { opportunities_found: 8, opportunities_created: 8 },
    error: null,
    duration_ms: 12400,
    tokens_used: 4200,
    started_at: '2026-05-10T09:01:00Z',
    completed_at: '2026-05-10T09:01:12Z',
    created_at: '2026-05-10T09:01:00Z',
  },
  {
    id: 'run-00000000000000000000000003',
    organization_id: ORG,
    agent_type: 'scoring',
    status: 'complete',
    input: { opportunity_ids: ['opp-00000000-0000-0000-000000000001', 'opp-00000000-0000-0000-000000000002'], profileId: 'bp-0000-0000-0000-000000000001' },
    output: { scored: 2, avg_score: 89.5 },
    error: null,
    duration_ms: 6800,
    tokens_used: 2100,
    started_at: '2026-05-10T09:02:00Z',
    completed_at: '2026-05-10T09:02:07Z',
    created_at: '2026-05-10T09:02:00Z',
  },
  {
    id: 'run-00000000000000000000000004',
    organization_id: ORG,
    agent_type: 'outreach',
    status: 'running',
    input: { opportunity_id: 'opp-00000000-0000-0000-000000000003', channels: ['email', 'linkedin'] },
    output: null,
    error: null,
    duration_ms: null,
    tokens_used: null,
    started_at: '2026-05-11T08:55:00Z',
    completed_at: null,
    created_at: '2026-05-11T08:55:00Z',
  },
  {
    id: 'run-00000000000000000000000005',
    organization_id: ORG,
    agent_type: 'memory',
    status: 'failed',
    input: { source: 'partner_interaction', raw_notes: '...' },
    output: null,
    error: 'Rate limit exceeded — retrying in 60s',
    duration_ms: 1200,
    tokens_used: null,
    started_at: '2026-05-11T08:40:00Z',
    completed_at: '2026-05-11T08:40:01Z',
    created_at: '2026-05-11T08:40:00Z',
  },
  {
    id: 'run-00000000000000000000000006',
    organization_id: ORG,
    agent_type: 'analytics',
    status: 'queued',
    input: { snapshot_date: '2026-05-11', org_id: ORG },
    output: null,
    error: null,
    duration_ms: null,
    tokens_used: null,
    started_at: null,
    completed_at: null,
    created_at: '2026-05-11T09:00:00Z',
  },
  {
    id: 'run-00000000000000000000000007',
    organization_id: ORG,
    agent_type: 'research',
    status: 'complete',
    input: { profileId: 'bp-0000-0000-0000-000000000001', opportunityId: 'opp-00000000-0000-0000-000000000001' },
    output: { company: 'Acme Corp', intelligence_confidence: 'high' },
    error: null,
    duration_ms: 9100,
    tokens_used: 2300,
    started_at: '2026-05-10T09:01:15Z',
    completed_at: '2026-05-10T09:01:24Z',
    created_at: '2026-05-10T09:01:15Z',
  },
  {
    id: 'run-00000000000000000000000008',
    organization_id: ORG,
    agent_type: 'research',
    status: 'complete',
    input: { profileId: 'bp-0000-0000-0000-000000000001', opportunityId: 'opp-00000000-0000-0000-000000000002' },
    output: { company: 'Bolt Payments', intelligence_confidence: 'medium' },
    error: null,
    duration_ms: 11200,
    tokens_used: 2800,
    started_at: '2026-05-10T09:01:15Z',
    completed_at: '2026-05-10T09:01:26Z',
    created_at: '2026-05-10T09:01:15Z',
  },
  {
    id: 'run-00000000000000000000000009',
    organization_id: ORG,
    agent_type: 'research',
    status: 'running',
    input: { profileId: 'bp-0000-0000-0000-000000000001', opportunityId: 'opp-00000000-0000-0000-000000000003' },
    output: null,
    error: null,
    duration_ms: null,
    tokens_used: null,
    started_at: '2026-05-10T09:01:15Z',
    completed_at: null,
    created_at: '2026-05-10T09:01:15Z',
  },
]
```

Note: also updated the discovery run's input key from `profile_id` to `profileId` to match what the graph layout expects.

- [ ] **Step 2: Add research logs to agent-logs.ts**

Open `lib/mock/fixtures/agent-logs.ts`. Replace the full content with:

```typescript
import type { AgentLog } from '@/types'
import { MOCK_ORG_ID } from './organizations'

const ORG = MOCK_ORG_ID

export const mockAgentLogs: AgentLog[] = [
  {
    id: 'log-0000000000000000000000001',
    ai_run_id: 'run-00000000000000000000000001',
    organization_id: ORG,
    level: 'info',
    message: 'Starting intake analysis for https://acme-ai.example.com',
    metadata: { step: 'init' },
    created_at: '2026-05-10T09:00:00Z',
  },
  {
    id: 'log-0000000000000000000000002',
    ai_run_id: 'run-00000000000000000000000001',
    organization_id: ORG,
    level: 'info',
    message: 'Extracted ICP: B2B SaaS, VP Sales, 200–2000 employees',
    metadata: { step: 'icp_extraction', confidence: 0.92 },
    created_at: '2026-05-10T09:00:01Z',
  },
  {
    id: 'log-0000000000000000000000003',
    ai_run_id: 'run-00000000000000000000000001',
    organization_id: ORG,
    level: 'info',
    message: 'Growth brief generated with 4 recommended partnership categories',
    metadata: { step: 'growth_brief', categories: 4 },
    created_at: '2026-05-10T09:00:04Z',
  },
  {
    id: 'log-0000000000000000000000004',
    ai_run_id: 'run-00000000000000000000000005',
    organization_id: ORG,
    level: 'error',
    message: 'OpenAI API rate limit hit — 429 Too Many Requests',
    metadata: { step: 'embedding_generation', retry_after: 60 },
    created_at: '2026-05-11T08:40:01Z',
  },
  {
    id: 'log-0000000000000000000000005',
    ai_run_id: 'run-00000000000000000000000004',
    organization_id: ORG,
    level: 'info',
    message: 'Generating email outreach for Outreach.io (tone: direct)',
    metadata: { step: 'draft_generation', channel: 'email', opportunity: 'opp-00000000-0000-0000-000000000003' },
    created_at: '2026-05-11T08:55:01Z',
  },
  {
    id: 'log-0000000000000000000000006',
    ai_run_id: 'run-00000000000000000000000007',
    organization_id: ORG,
    level: 'info',
    message: 'Company Intelligence Agent: researching Acme Corp',
    metadata: { step: 'research_start', company: 'Acme Corp' },
    created_at: '2026-05-10T09:01:15Z',
  },
  {
    id: 'log-0000000000000000000000007',
    ai_run_id: 'run-00000000000000000000000008',
    organization_id: ORG,
    level: 'info',
    message: 'Company Intelligence Agent: researching Bolt Payments',
    metadata: { step: 'research_start', company: 'Bolt Payments' },
    created_at: '2026-05-10T09:01:15Z',
  },
  {
    id: 'log-0000000000000000000000008',
    ai_run_id: 'run-00000000000000000000000009',
    organization_id: ORG,
    level: 'info',
    message: 'Company Intelligence Agent: researching Outreach.io',
    metadata: { step: 'research_start', company: 'Outreach.io' },
    created_at: '2026-05-10T09:01:15Z',
  },
]
```

- [ ] **Step 3: Add getOrgAgentLogs to server/dal/ai-runs.ts**

Open `server/dal/ai-runs.ts`. At the end of the file, append:

```typescript
export async function getOrgAgentLogs(
  orgId: string,
  limit: number = 100
): Promise<AgentLog[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockAgentLogs
      .filter(l => l.organization_id === orgId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('agent_logs')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}
```

Also add `mockAgentLogs` to the import at the top of `server/dal/ai-runs.ts`:

Change:
```typescript
import { mockAIRuns, mockAgentLogs } from '@/lib/mock'
```

(It's already imported — verify by reading line 2 of the file before editing.)

- [ ] **Step 4: Commit**

```bash
git add lib/mock/fixtures/ai-runs.ts lib/mock/fixtures/agent-logs.ts server/dal/ai-runs.ts
git commit -m "feat(orchestration): augment mock fixtures and add getOrgAgentLogs DAL"
```

---

## Task 4: Write Failing Tests

**Files:**
- Create: `__tests__/orchestration-store.test.ts`
- Create: `__tests__/graph-layout.test.ts`

- [ ] **Step 1: Write orchestration store tests**

Create `__tests__/orchestration-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import type { AIRun, AgentLog } from '@/types'
import { mockAIRuns, mockAgentLogs, MOCK_ORG_ID } from '@/lib/mock'

// Import after implementation is created — will fail until Task 5
import { useOrchestrationStore } from '@/features/orchestration/hooks/use-orchestration-store'

function makeRun(overrides: Partial<AIRun>): AIRun {
  return {
    id: 'run-test-1',
    organization_id: MOCK_ORG_ID,
    agent_type: 'intake',
    status: 'complete',
    input: null,
    output: null,
    error: null,
    duration_ms: 1000,
    tokens_used: 500,
    started_at: '2026-05-10T09:00:00Z',
    completed_at: '2026-05-10T09:00:01Z',
    created_at: '2026-05-10T09:00:00Z',
    ...overrides,
  }
}

function makeLog(overrides: Partial<AgentLog>): AgentLog {
  return {
    id: 'log-test-1',
    ai_run_id: 'run-test-1',
    organization_id: MOCK_ORG_ID,
    level: 'info',
    message: 'test log',
    metadata: {},
    created_at: '2026-05-10T09:00:00Z',
    ...overrides,
  }
}

describe('useOrchestrationStore', () => {
  beforeEach(() => {
    useOrchestrationStore.setState({
      recentRuns: [],
      feedEvents: [],
      isLive: false,
    })
  })

  it('hydrateRuns populates recentRuns sorted newest first', () => {
    const runs = [
      makeRun({ id: 'r1', created_at: '2026-05-10T09:00:00Z' }),
      makeRun({ id: 'r2', created_at: '2026-05-10T09:01:00Z' }),
    ]
    useOrchestrationStore.getState().hydrateRuns(runs)
    const { recentRuns } = useOrchestrationStore.getState()
    expect(recentRuns[0].id).toBe('r2')
    expect(recentRuns[1].id).toBe('r1')
  })

  it('hydrateRuns sets agentStates for each hydrated run type', () => {
    const runs = [
      makeRun({ agent_type: 'intake', status: 'complete' }),
      makeRun({ id: 'r2', agent_type: 'discovery', status: 'running' }),
    ]
    useOrchestrationStore.getState().hydrateRuns(runs)
    const { agentStates } = useOrchestrationStore.getState()
    expect(agentStates.intake).toBe('completed')
    expect(agentStates.discovery).toBe('executing')
    expect(agentStates.outreach).toBe('idle')
  })

  it('upsertRun inserts a new run and updates agentStates', () => {
    const run = makeRun({ agent_type: 'outreach', status: 'running' })
    useOrchestrationStore.getState().upsertRun(run)
    const { agentStates, recentRuns } = useOrchestrationStore.getState()
    expect(recentRuns).toHaveLength(1)
    expect(agentStates.outreach).toBe('executing')
  })

  it('upsertRun replaces an existing run with the same id', () => {
    const run = makeRun({ agent_type: 'intake', status: 'running' })
    useOrchestrationStore.getState().upsertRun(run)
    const updated = { ...run, status: 'complete' as const }
    useOrchestrationStore.getState().upsertRun(updated)
    const { recentRuns, agentStates } = useOrchestrationStore.getState()
    expect(recentRuns).toHaveLength(1)
    expect(agentStates.intake).toBe('completed')
  })

  it('hydrateLogs creates ActivityEvents sorted newest first', () => {
    const run = makeRun({ agent_type: 'intake' })
    useOrchestrationStore.getState().hydrateRuns([run])
    const logs = [
      makeLog({ id: 'l1', created_at: '2026-05-10T09:00:00Z' }),
      makeLog({ id: 'l2', created_at: '2026-05-10T09:00:01Z' }),
    ]
    useOrchestrationStore.getState().hydrateLogs(logs)
    const { feedEvents } = useOrchestrationStore.getState()
    expect(feedEvents).toHaveLength(2)
    expect(feedEvents[0].id).toBe('l2')
    expect(feedEvents[0].agentType).toBe('intake')
  })

  it('appendLog prepends to feedEvents and derives agentType', () => {
    const run = makeRun({ id: 'run-test-1', agent_type: 'memory' })
    useOrchestrationStore.getState().upsertRun(run)
    useOrchestrationStore.getState().hydrateLogs([])
    const log = makeLog({ id: 'l-new', ai_run_id: 'run-test-1', message: 'memory stored' })
    useOrchestrationStore.getState().appendLog(log)
    const { feedEvents } = useOrchestrationStore.getState()
    expect(feedEvents[0].id).toBe('l-new')
    expect(feedEvents[0].agentType).toBe('memory')
    expect(feedEvents[0].message).toBe('memory stored')
  })

  it('feedEvents are capped at 200 entries', () => {
    const run = makeRun({ id: 'run-test-1' })
    useOrchestrationStore.getState().upsertRun(run)
    for (let i = 0; i < 210; i++) {
      useOrchestrationStore.getState().appendLog(
        makeLog({ id: `l-${i}`, created_at: new Date(Date.now() + i).toISOString() })
      )
    }
    const { feedEvents } = useOrchestrationStore.getState()
    expect(feedEvents.length).toBeLessThanOrEqual(200)
  })

  it('setLive updates isLive', () => {
    useOrchestrationStore.getState().setLive(true)
    expect(useOrchestrationStore.getState().isLive).toBe(true)
    useOrchestrationStore.getState().setLive(false)
    expect(useOrchestrationStore.getState().isLive).toBe(false)
  })
})
```

- [ ] **Step 2: Write graph layout tests**

Create `__tests__/graph-layout.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import type { AIRun } from '@/types'

// Import after implementation is created — will fail until Task 6
import { deriveNodeState, computeGraphLayout } from '@/features/orchestration/utils/graph-layout'
import { MOCK_ORG_ID } from '@/lib/mock'

function makeRun(overrides: Partial<AIRun>): AIRun {
  return {
    id: 'run-test',
    organization_id: MOCK_ORG_ID,
    agent_type: 'intake',
    status: 'complete',
    input: null,
    output: null,
    error: null,
    duration_ms: 1000,
    tokens_used: null,
    started_at: null,
    completed_at: null,
    created_at: '2026-05-10T09:00:00Z',
    ...overrides,
  }
}

describe('deriveNodeState', () => {
  it('maps queued → queued', () => {
    expect(deriveNodeState(makeRun({ status: 'queued' }))).toBe('queued')
  })
  it('maps running → executing', () => {
    expect(deriveNodeState(makeRun({ status: 'running' }))).toBe('executing')
  })
  it('maps complete → completed', () => {
    expect(deriveNodeState(makeRun({ status: 'complete' }))).toBe('completed')
  })
  it('maps failed → failed', () => {
    expect(deriveNodeState(makeRun({ status: 'failed' }))).toBe('failed')
  })
})

describe('computeGraphLayout', () => {
  it('returns 7 static nodes when no research runs present', () => {
    const runs = [
      makeRun({ agent_type: 'intake', status: 'complete' }),
      makeRun({ id: 'r2', agent_type: 'discovery', status: 'complete' }),
    ]
    const { nodes } = computeGraphLayout(runs)
    const types = nodes.map(n => n.data.agentType)
    expect(types).toContain('intake')
    expect(types).toContain('discovery')
    expect(types).toContain('outreach')
    expect(types).toContain('memory')
    expect(types).toContain('analytics')
    // no research or scoring fan-out nodes
    const researchNodes = nodes.filter(n => n.data.agentType === 'research')
    expect(researchNodes).toHaveLength(0)
  })

  it('creates N research nodes when N research runs exist for the same profileId', () => {
    const runs = [
      makeRun({ agent_type: 'discovery', input: { profileId: 'p1' } }),
      makeRun({ id: 'r2', agent_type: 'research', input: { profileId: 'p1', opportunityId: 'o1' } }),
      makeRun({ id: 'r3', agent_type: 'research', input: { profileId: 'p1', opportunityId: 'o2' } }),
      makeRun({ id: 'r4', agent_type: 'research', input: { profileId: 'p1', opportunityId: 'o3' } }),
    ]
    const { nodes } = computeGraphLayout(runs)
    const researchNodes = nodes.filter(n => n.data.agentType === 'research')
    expect(researchNodes).toHaveLength(3)
  })

  it('creates edges from discovery to each research node', () => {
    const runs = [
      makeRun({ agent_type: 'discovery', input: { profileId: 'p1' } }),
      makeRun({ id: 'r2', agent_type: 'research', input: { profileId: 'p1', opportunityId: 'o1' } }),
      makeRun({ id: 'r3', agent_type: 'research', input: { profileId: 'p1', opportunityId: 'o2' } }),
    ]
    const { edges } = computeGraphLayout(runs)
    const discoveryEdges = edges.filter(e => e.source === 'discovery')
    expect(discoveryEdges).toHaveLength(2)
  })

  it('active edge data is true when source is completed/executing and target has a run', () => {
    const runs = [
      makeRun({ agent_type: 'intake', status: 'complete' }),
      makeRun({ id: 'r2', agent_type: 'discovery', status: 'running' }),
    ]
    const { edges } = computeGraphLayout(runs)
    const intakeEdge = edges.find(e => e.source === 'intake' && e.target === 'discovery')
    expect(intakeEdge).toBeDefined()
    expect(intakeEdge?.data?.active).toBe(true)
  })

  it('each node has a defined position', () => {
    const { nodes } = computeGraphLayout([])
    for (const node of nodes) {
      expect(typeof node.position.x).toBe('number')
      expect(typeof node.position.y).toBe('number')
    }
  })
})
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
npx vitest run --reporter verbose __tests__/orchestration-store.test.ts __tests__/graph-layout.test.ts
```

Expected: both test files fail with "Cannot find module" or similar import errors.

- [ ] **Step 4: Commit**

```bash
git add __tests__/orchestration-store.test.ts __tests__/graph-layout.test.ts
git commit -m "test(orchestration): add failing unit tests for store and graph layout"
```

---

## Task 5: Zustand Store

**Files:**
- Create: `features/orchestration/hooks/use-orchestration-store.ts`

- [ ] **Step 1: Create the store**

Create `features/orchestration/hooks/use-orchestration-store.ts`:

```typescript
import { create } from 'zustand'
import type { AIRun, AgentLog, AgentType } from '@/types'
import type { AgentNodeState, ActivityEvent } from '../types'
import { deriveNodeState } from '../utils/graph-layout'

const ALL_AGENTS: AgentType[] = [
  'intake', 'research', 'discovery', 'scoring', 'outreach', 'memory', 'analytics',
]

function buildAgentStates(runs: AIRun[]): Record<AgentType, AgentNodeState> {
  const seen = new Set<AgentType>()
  const states: Partial<Record<AgentType, AgentNodeState>> = {}
  // runs must be sorted newest-first so the first encountered per type wins
  for (const run of runs) {
    if (!seen.has(run.agent_type)) {
      seen.add(run.agent_type)
      states[run.agent_type] = deriveNodeState(run)
    }
  }
  const result = {} as Record<AgentType, AgentNodeState>
  for (const type of ALL_AGENTS) {
    result[type] = states[type] ?? 'idle'
  }
  return result
}

function toActivityEvent(log: AgentLog, run: AIRun | undefined): ActivityEvent {
  return {
    id: log.id,
    aiRunId: log.ai_run_id,
    agentType: run?.agent_type ?? 'intake',
    level: log.level,
    message: log.message,
    createdAt: log.created_at,
  }
}

interface StoreState {
  recentRuns: AIRun[]
  agentStates: Record<AgentType, AgentNodeState>
  feedEvents: ActivityEvent[]
  isLive: boolean
}

interface StoreActions {
  hydrateRuns: (runs: AIRun[]) => void
  hydrateLogs: (logs: AgentLog[]) => void
  upsertRun: (run: AIRun) => void
  appendLog: (log: AgentLog) => void
  setLive: (live: boolean) => void
}

const INITIAL_STATES = ALL_AGENTS.reduce(
  (acc, t) => ({ ...acc, [t]: 'idle' as AgentNodeState }),
  {} as Record<AgentType, AgentNodeState>
)

export const useOrchestrationStore = create<StoreState & StoreActions>((set, get) => ({
  recentRuns: [],
  agentStates: { ...INITIAL_STATES },
  feedEvents: [],
  isLive: false,

  hydrateRuns(runs) {
    const sorted = [...runs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    set({ recentRuns: sorted, agentStates: buildAgentStates(sorted) })
  },

  hydrateLogs(logs) {
    const { recentRuns } = get()
    const runMap = new Map(recentRuns.map(r => [r.id, r]))
    const events = [...logs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(log => toActivityEvent(log, runMap.get(log.ai_run_id)))
    set({ feedEvents: events })
  },

  upsertRun(run) {
    const prev = get().recentRuns
    const idx = prev.findIndex(r => r.id === run.id)
    const next = idx >= 0
      ? prev.map(r => (r.id === run.id ? run : r))
      : [run, ...prev]
    const sorted = next.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    set({ recentRuns: sorted, agentStates: buildAgentStates(sorted) })
  },

  appendLog(log) {
    const { recentRuns, feedEvents } = get()
    const run = recentRuns.find(r => r.id === log.ai_run_id)
    const event = toActivityEvent(log, run)
    set({ feedEvents: [event, ...feedEvents].slice(0, 200) })
  },

  setLive(live) {
    set({ isLive: live })
  },
}))
```

- [ ] **Step 2: Run store tests**

```bash
npx vitest run --reporter verbose __tests__/orchestration-store.test.ts
```

Expected: all 8 store tests pass.

- [ ] **Step 3: Commit**

```bash
git add features/orchestration/hooks/use-orchestration-store.ts
git commit -m "feat(orchestration): implement Zustand orchestration store"
```

---

## Task 6: Graph Layout Utilities + Agent Colors

**Files:**
- Create: `features/orchestration/utils/graph-layout.ts`
- Create: `features/orchestration/utils/agent-colors.ts`

- [ ] **Step 1: Create agent-colors.ts**

Create `features/orchestration/utils/agent-colors.ts`:

```typescript
import type { AgentType } from '@/types'
import type { AgentNodeState } from '../types'

export const STATE_RING: Record<AgentNodeState, string> = {
  idle: 'border-[var(--border-color)]',
  queued: 'border-amber-400',
  executing: 'border-[var(--accent)]',
  completed: 'border-green-500',
  failed: 'border-[var(--destructive)]',
}

export const STATE_TEXT: Record<AgentNodeState, string> = {
  idle: 'text-[var(--text-muted)]',
  queued: 'text-amber-400',
  executing: 'text-[var(--accent)]',
  completed: 'text-green-500',
  failed: 'text-[var(--destructive)]',
}

export const STATE_BG: Record<AgentNodeState, string> = {
  idle: 'bg-[var(--surface)]',
  queued: 'bg-amber-400/5',
  executing: 'bg-[var(--accent)]/5',
  completed: 'bg-green-500/5',
  failed: 'bg-[var(--destructive)]/5',
}

export const AGENT_LABEL: Record<AgentType, string> = {
  intake: 'Intake',
  discovery: 'Discovery',
  research: 'Research',
  scoring: 'Scoring',
  outreach: 'Outreach',
  memory: 'Memory',
  analytics: 'Analytics',
}

export const AGENT_TYPE_COLOR: Record<AgentType, string> = {
  intake: 'text-violet-400',
  discovery: 'text-blue-400',
  research: 'text-cyan-400',
  scoring: 'text-teal-400',
  outreach: 'text-emerald-400',
  memory: 'text-amber-400',
  analytics: 'text-orange-400',
}
```

- [ ] **Step 2: Create graph-layout.ts**

Create `features/orchestration/utils/graph-layout.ts`:

```typescript
import type { Node, Edge } from '@xyflow/react'
import type { AIRun, AgentType } from '@/types'
import type { AgentNodeData, AgentNodeState, AgentFlowNode, WorkflowFlowEdge } from '../types'
import { AGENT_LABEL } from './agent-colors'

export function deriveNodeState(run: AIRun): AgentNodeState {
  switch (run.status) {
    case 'queued': return 'queued'
    case 'running': return 'executing'
    case 'complete': return 'completed'
    case 'failed': return 'failed'
  }
}

const STATIC_POSITIONS: Record<string, { x: number; y: number }> = {
  intake:    { x: 0,   y: 160 },
  discovery: { x: 240, y: 160 },
  outreach:  { x: 720, y: 20  },
  memory:    { x: 720, y: 160 },
  analytics: { x: 720, y: 300 },
}

const RESEARCH_X = 480
const SCORING_X  = 600
const FAN_SPACING = 110

function fanY(index: number, total: number): number {
  return 160 - ((total - 1) * FAN_SPACING) / 2 + index * FAN_SPACING
}

function makeIdleNodeData(agentType: AgentType): AgentNodeData {
  return {
    label: AGENT_LABEL[agentType],
    agentType,
    state: 'idle',
    lastRunDurationMs: null,
    tokensUsed: null,
    runId: null,
  }
}

function makeNodeData(run: AIRun): AgentNodeData {
  return {
    label: AGENT_LABEL[run.agent_type],
    agentType: run.agent_type,
    state: deriveNodeState(run),
    lastRunDurationMs: run.duration_ms,
    tokensUsed: run.tokens_used,
    runId: run.id,
  }
}

function isEdgeActive(source: AgentNodeData, target: AgentNodeData): boolean {
  const sourceActive = source.state === 'executing' || source.state === 'completed'
  const targetExists = target.state !== 'idle'
  return sourceActive && targetExists
}

export interface GraphLayout {
  nodes: AgentFlowNode[]
  edges: WorkflowFlowEdge[]
}

export function computeGraphLayout(recentRuns: AIRun[]): GraphLayout {
  // Build a map: agent_type → most recent run (runs should be sorted newest first)
  const latestByType = new Map<AgentType, AIRun>()
  for (const run of recentRuns) {
    if (!latestByType.has(run.agent_type)) {
      latestByType.set(run.agent_type, run)
    }
  }

  // Group research runs by profileId for fan-out
  const researchByProfile = new Map<string, AIRun[]>()
  for (const run of recentRuns) {
    if (run.agent_type === 'research') {
      const pid = (run.input?.profileId as string) ?? '__default__'
      const existing = researchByProfile.get(pid) ?? []
      researchByProfile.set(pid, [...existing, run])
    }
  }

  // Group scoring runs by profileId
  const scoringByProfile = new Map<string, AIRun[]>()
  for (const run of recentRuns) {
    if (run.agent_type === 'scoring') {
      const pid = (run.input?.profileId as string) ?? '__default__'
      const existing = scoringByProfile.get(pid) ?? []
      scoringByProfile.set(pid, [...existing, run])
    }
  }

  const nodes: AgentFlowNode[] = []
  const edges: WorkflowFlowEdge[] = []

  // Static nodes
  const STATIC_TYPES: AgentType[] = ['intake', 'discovery', 'outreach', 'memory', 'analytics']
  for (const type of STATIC_TYPES) {
    const run = latestByType.get(type)
    nodes.push({
      id: type,
      type: 'agent',
      position: STATIC_POSITIONS[type],
      data: run ? makeNodeData(run) : makeIdleNodeData(type),
    })
  }

  const intakeData = nodes.find(n => n.id === 'intake')!.data
  const discoveryData = nodes.find(n => n.id === 'discovery')!.data

  // intake → discovery edge
  edges.push({
    id: 'e-intake-discovery',
    source: 'intake',
    target: 'discovery',
    type: 'workflow',
    data: { active: isEdgeActive(intakeData, discoveryData) },
  })

  // Fan-out: research nodes per profile
  const allProfileIds = new Set([...researchByProfile.keys(), ...scoringByProfile.keys()])

  if (allProfileIds.size === 0) {
    // No research/scoring: edges from discovery to standalone outreach/memory/analytics
    for (const target of ['outreach', 'memory', 'analytics'] as AgentType[]) {
      const targetData = nodes.find(n => n.id === target)!.data
      edges.push({
        id: `e-discovery-${target}`,
        source: 'discovery',
        target,
        type: 'workflow',
        data: { active: isEdgeActive(discoveryData, targetData) },
      })
    }
    return { nodes, edges }
  }

  // With research/scoring: build fan-out per profileId
  let nodeIndex = 0
  for (const profileId of allProfileIds) {
    const researchRuns = researchByProfile.get(profileId) ?? []
    const scoringRuns = scoringByProfile.get(profileId) ?? []
    const total = Math.max(researchRuns.length, 1)

    // Research nodes
    const researchNodeIds: string[] = []
    researchRuns.forEach((run, i) => {
      const nodeId = `research-${run.id}`
      researchNodeIds.push(nodeId)
      nodes.push({
        id: nodeId,
        type: 'agent',
        position: { x: RESEARCH_X, y: fanY(nodeIndex + i, total) },
        data: makeNodeData(run),
      })
      // discovery → research edge
      edges.push({
        id: `e-discovery-${nodeId}`,
        source: 'discovery',
        target: nodeId,
        type: 'workflow',
        data: { active: isEdgeActive(discoveryData, makeNodeData(run)) },
      })
    })

    // Scoring nodes
    scoringRuns.forEach((run, i) => {
      const nodeId = `scoring-${run.id}`
      nodes.push({
        id: nodeId,
        type: 'agent',
        position: { x: SCORING_X, y: fanY(nodeIndex + i, total) },
        data: makeNodeData(run),
      })
      // research → scoring edge (pair by index, or connect all if counts differ)
      const sourceId = researchNodeIds[i] ?? researchNodeIds[0] ?? 'discovery'
      const sourceData = nodes.find(n => n.id === sourceId)?.data ?? discoveryData
      edges.push({
        id: `e-${sourceId}-${nodeId}`,
        source: sourceId,
        target: nodeId,
        type: 'workflow',
        data: { active: isEdgeActive(sourceData, makeNodeData(run)) },
      })
    })

    nodeIndex += total
  }

  // scoring/research last node → outreach, memory, analytics
  const lastScoringNodes = nodes.filter(n => n.data.agentType === 'scoring')
  const lastResearchNodes = nodes.filter(n => n.data.agentType === 'research')
  const bridgeSource = lastScoringNodes.length > 0
    ? lastScoringNodes[lastScoringNodes.length - 1]
    : lastResearchNodes.length > 0
    ? lastResearchNodes[lastResearchNodes.length - 1]
    : nodes.find(n => n.id === 'discovery')!

  for (const target of ['outreach', 'memory', 'analytics'] as AgentType[]) {
    const targetData = nodes.find(n => n.id === target)!.data
    edges.push({
      id: `e-${bridgeSource.id}-${target}`,
      source: bridgeSource.id,
      target,
      type: 'workflow',
      data: { active: isEdgeActive(bridgeSource.data, targetData) },
    })
  }

  return { nodes, edges }
}
```

- [ ] **Step 3: Run graph layout tests**

```bash
npx vitest run --reporter verbose __tests__/graph-layout.test.ts
```

Expected: all graph layout tests pass.

- [ ] **Step 4: Run store tests to confirm still passing**

```bash
npx vitest run --reporter verbose __tests__/orchestration-store.test.ts
```

Expected: all store tests pass.

- [ ] **Step 5: Commit**

```bash
git add features/orchestration/utils/graph-layout.ts features/orchestration/utils/agent-colors.ts
git commit -m "feat(orchestration): implement graph layout utilities and agent color mapping"
```

---

## Task 7: AgentNode Component

**Files:**
- Create: `features/orchestration/components/agent-node.tsx`

- [ ] **Step 1: Create the AgentNode component**

Create `features/orchestration/components/agent-node.tsx`:

```typescript
'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { AgentNodeData } from '../types'
import { STATE_RING, STATE_TEXT, STATE_BG, AGENT_TYPE_COLOR } from '../utils/agent-colors'

const STATE_LABEL: Record<string, string> = {
  idle: 'Idle',
  queued: 'Queued',
  executing: 'Executing',
  completed: 'Done',
  failed: 'Failed',
}

function formatDuration(ms: number | null): string | null {
  if (ms == null) return null
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

export const AgentNode = memo(function AgentNode({ data, selected }: NodeProps<AgentNodeData>) {
  const isExecuting = data.state === 'executing'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative px-3 py-2.5 rounded-lg border-2 min-w-[120px] cursor-pointer select-none',
        'bg-[var(--surface)] transition-shadow',
        STATE_RING[data.state],
        STATE_BG[data.state],
        selected && 'shadow-[0_0_0_2px_var(--accent)]'
      )}
    >
      {/* Executing pulse ring */}
      {isExecuting && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-[var(--accent)]"
          animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <Handle type="target" position={Position.Left} className="!border-[var(--border-color)] !bg-[var(--surface-raised)]" />

      <div className="flex flex-col gap-0.5">
        <span className={cn('text-xs font-semibold', AGENT_TYPE_COLOR[data.agentType])}>
          {data.label}
        </span>
        <span className={cn('text-[10px] font-medium', STATE_TEXT[data.state])}>
          {STATE_LABEL[data.state]}
        </span>
        {(data.lastRunDurationMs != null || data.tokensUsed != null) && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {data.lastRunDurationMs != null && (
              <span className="text-[9px] text-[var(--text-muted)]">
                {formatDuration(data.lastRunDurationMs)}
              </span>
            )}
            {data.tokensUsed != null && (
              <span className="text-[9px] text-[var(--text-muted)]">
                {data.tokensUsed.toLocaleString()} tok
              </span>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!border-[var(--border-color)] !bg-[var(--surface-raised)]" />
    </motion.div>
  )
})
```

- [ ] **Step 2: Commit**

```bash
git add features/orchestration/components/agent-node.tsx
git commit -m "feat(orchestration): implement AgentNode component with state animations"
```

---

## Task 8: WorkflowEdge Component

**Files:**
- Create: `features/orchestration/components/workflow-edge.tsx`

- [ ] **Step 1: Create the WorkflowEdge component**

Create `features/orchestration/components/workflow-edge.tsx`:

```typescript
'use client'

import { memo } from 'react'
import { getStraightPath, type EdgeProps } from '@xyflow/react'
import { motion } from 'framer-motion'

interface WorkflowEdgeData extends Record<string, unknown> {
  active: boolean
}

export const WorkflowEdge = memo(function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps<WorkflowEdgeData>) {
  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  const active = data?.active ?? false

  return (
    <>
      {/* Base path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={active ? 'var(--accent)' : 'var(--border-color)'}
        strokeWidth={active ? 2 : 1}
        strokeDasharray={active ? undefined : '4 4'}
        className="transition-all duration-300"
      />

      {/* Travelling dot on active edges */}
      {active && (
        <motion.circle
          r={3}
          fill="var(--accent)"
          animate={{ offsetDistance: ['0%', '100%'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          style={{
            offsetPath: `path("${edgePath}")`,
            offsetRotate: '0deg',
          } as React.CSSProperties}
        />
      )}
    </>
  )
})
```

- [ ] **Step 2: Commit**

```bash
git add features/orchestration/components/workflow-edge.tsx
git commit -m "feat(orchestration): implement WorkflowEdge with idle/active animated modes"
```

---

## Task 9: AgentGraph Component

**Files:**
- Create: `features/orchestration/components/agent-graph.tsx`

- [ ] **Step 1: Create the AgentGraph component**

Create `features/orchestration/components/agent-graph.tsx`:

```typescript
'use client'

import { useMemo } from 'react'
import { ReactFlow, Background, BackgroundVariant, MiniMap } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useOrchestrationStore } from '../hooks/use-orchestration-store'
import { computeGraphLayout } from '../utils/graph-layout'
import { AgentNode } from './agent-node'
import { WorkflowEdge } from './workflow-edge'

const nodeTypes = { agent: AgentNode }
const edgeTypes = { workflow: WorkflowEdge }

export function AgentGraph() {
  const recentRuns = useOrchestrationStore(s => s.recentRuns)

  const { nodes, edges } = useMemo(
    () => computeGraphLayout(recentRuns),
    [recentRuns]
  )

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-[var(--text-muted)]">
        No agent runs yet. Submit a business profile to get started.
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--surface)' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--border-color)"
        />
        <MiniMap
          nodeColor={() => 'var(--surface-raised)'}
          maskColor="var(--surface)"
          style={{ background: 'var(--surface-raised)', border: '1px solid var(--border-color)' }}
        />
      </ReactFlow>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add features/orchestration/components/agent-graph.tsx
git commit -m "feat(orchestration): implement AgentGraph with React Flow canvas"
```

---

## Task 10: ActivityFeed Component

**Files:**
- Create: `features/orchestration/components/activity-feed.tsx`

- [ ] **Step 1: Create the ActivityFeed component**

Create `features/orchestration/components/activity-feed.tsx`:

```typescript
'use client'

import { useRef, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useOrchestrationStore } from '../hooks/use-orchestration-store'
import { AGENT_TYPE_COLOR, AGENT_LABEL } from '../utils/agent-colors'

const LEVEL_STYLES: Record<string, string> = {
  info: 'text-[var(--text-muted)]',
  warning: 'text-amber-400',
  error: 'text-[var(--destructive)]',
}

const LEVEL_BADGE: Record<string, string> = {
  info: 'bg-[var(--surface-raised)] text-[var(--text-muted)]',
  warning: 'bg-amber-400/10 text-amber-400',
  error: 'bg-[var(--destructive)]/10 text-[var(--destructive)]',
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function ActivityFeed() {
  const feedEvents = useOrchestrationStore(s => s.feedEvents)
  const containerRef = useRef<HTMLDivElement>(null)
  const [userScrolled, setUserScrolled] = useState(false)

  // Auto-scroll to top (newest entries) unless user scrolled down
  useEffect(() => {
    if (!userScrolled && containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [feedEvents, userScrolled])

  function handleScroll() {
    if (!containerRef.current) return
    setUserScrolled(containerRef.current.scrollTop > 10)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)]">
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Activity
        </span>
        {feedEvents.length > 0 && (
          <span className="text-xs text-[var(--text-muted)]">{feedEvents.length} events</span>
        )}
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1"
      >
        {feedEvents.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] pt-4 text-center">
            No activity yet.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {feedEvents.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start gap-2 py-1.5 border-b border-[var(--border-color)]/50 last:border-0"
              >
                <span className="text-[10px] text-[var(--text-muted)] shrink-0 pt-0.5 tabular-nums">
                  {formatTime(event.createdAt)}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium shrink-0 px-1 rounded',
                    AGENT_TYPE_COLOR[event.agentType],
                    'bg-[var(--surface-raised)]'
                  )}
                >
                  {AGENT_LABEL[event.agentType]}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium shrink-0 px-1 rounded',
                    LEVEL_BADGE[event.level]
                  )}
                >
                  {event.level}
                </span>
                <span className={cn('text-xs leading-relaxed', LEVEL_STYLES[event.level])}>
                  {event.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add features/orchestration/components/activity-feed.tsx
git commit -m "feat(orchestration): implement ActivityFeed with AnimatePresence"
```

---

## Task 11: OrchestrationStatusBar + Realtime Hook

**Files:**
- Create: `features/orchestration/components/orchestration-status-bar.tsx`
- Create: `features/orchestration/hooks/use-realtime-runs.ts`

- [ ] **Step 1: Create OrchestrationStatusBar**

Create `features/orchestration/components/orchestration-status-bar.tsx`:

```typescript
'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useOrchestrationStore } from '../hooks/use-orchestration-store'
import { useRealtimeRuns } from '../hooks/use-realtime-runs'

function relativeTime(iso: string | null): string {
  if (!iso) return 'never'
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  return `${Math.floor(diffMin / 60)}h ago`
}

export function OrchestrationStatusBar() {
  useRealtimeRuns()

  const recentRuns = useOrchestrationStore(s => s.recentRuns)
  const isLive = useOrchestrationStore(s => s.isLive)

  const activeCount = useMemo(
    () => recentRuns.filter(r => r.status === 'running' || r.status === 'queued').length,
    [recentRuns]
  )

  const totalTokensToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return recentRuns
      .filter(r => r.created_at.startsWith(today))
      .reduce((sum, r) => sum + (r.tokens_used ?? 0), 0)
  }, [recentRuns])

  const lastRunAt = useMemo(() => {
    const completed = recentRuns
      .filter(r => r.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    return completed[0]?.completed_at ?? null
  }, [recentRuns])

  return (
    <div className="flex items-center gap-6 px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--surface)] text-xs text-[var(--text-muted)]">
      <span>
        <span className="font-semibold text-[var(--text-primary)]">{activeCount}</span>{' '}
        active run{activeCount !== 1 ? 's' : ''}
      </span>
      <span>
        <span className="font-semibold text-[var(--text-primary)]">
          {totalTokensToday.toLocaleString()}
        </span>{' '}
        tokens today
      </span>
      <span>Last run: {relativeTime(lastRunAt)}</span>
      <span className="flex items-center gap-1.5 ml-auto">
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            isLive ? 'bg-green-500 animate-pulse' : 'bg-[var(--text-muted)]'
          )}
        />
        <span className={isLive ? 'text-green-500' : 'text-[var(--text-muted)]'}>
          {isLive ? 'Live' : 'Offline'}
        </span>
      </span>
    </div>
  )
}
```

- [ ] **Step 2: Create useRealtimeRuns hook**

Create `features/orchestration/hooks/use-realtime-runs.ts`:

```typescript
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MOCK_ORG_ID } from '@/lib/mock'
import type { AIRun, AgentLog } from '@/types'
import { useOrchestrationStore } from './use-orchestration-store'

export function useRealtimeRuns() {
  const upsertRun = useOrchestrationStore(s => s.upsertRun)
  const appendLog = useOrchestrationStore(s => s.appendLog)
  const setLive = useOrchestrationStore(s => s.setLive)

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return

    const supabase = createClient()
    const channel = supabase
      .channel('orchestration-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_runs',
          filter: `organization_id=eq.${MOCK_ORG_ID}`,
        },
        payload => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            upsertRun(payload.new as AIRun)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_logs',
          filter: `organization_id=eq.${MOCK_ORG_ID}`,
        },
        payload => {
          appendLog(payload.new as AgentLog)
        }
      )
      .subscribe(status => {
        setLive(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel).catch(() => {})
    }
  }, [upsertRun, appendLog, setLive])
}
```

- [ ] **Step 3: Commit**

```bash
git add features/orchestration/components/orchestration-status-bar.tsx features/orchestration/hooks/use-realtime-runs.ts
git commit -m "feat(orchestration): add OrchestrationStatusBar and Supabase Realtime hook"
```

---

## Task 12: Page, Nav Item, and Client Shell

**Files:**
- Create: `features/orchestration/components/orchestration-page-client.tsx`
- Create: `app/(dashboard)/orchestration/page.tsx`
- Modify: `components/layout/sidebar/nav-items.tsx`

- [ ] **Step 1: Create OrchestrationPageClient**

Create `features/orchestration/components/orchestration-page-client.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import type { AIRun, AgentLog } from '@/types'
import { useOrchestrationStore } from '../hooks/use-orchestration-store'
import { AgentGraph } from './agent-graph'
import { ActivityFeed } from './activity-feed'
import { OrchestrationStatusBar } from './orchestration-status-bar'

interface Props {
  initialRuns: AIRun[]
  initialLogs: AgentLog[]
}

export function OrchestrationPageClient({ initialRuns, initialLogs }: Props) {
  const hydrateRuns = useOrchestrationStore(s => s.hydrateRuns)
  const hydrateLogs = useOrchestrationStore(s => s.hydrateLogs)
  const isLive = useOrchestrationStore(s => s.isLive)

  useEffect(() => {
    hydrateRuns(initialRuns)
  }, [initialRuns, hydrateRuns])

  useEffect(() => {
    hydrateLogs(initialLogs)
  }, [initialLogs, hydrateLogs])

  return (
    <div className="flex flex-col gap-4 h-full">
      <OrchestrationStatusBar />

      {!isLive && process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true' && (
        <div className="text-xs text-amber-400 bg-amber-400/5 border border-amber-400/20 rounded px-3 py-2">
          Live updates paused — reconnecting
        </div>
      )}

      <div className="flex flex-1 gap-4 min-h-0">
        {/* Agent graph: 60% */}
        <div className="flex-[3] min-h-0 rounded-lg border border-[var(--border-color)] overflow-hidden" style={{ height: '600px' }}>
          <AgentGraph />
        </div>

        {/* Activity feed: 40% */}
        <div className="flex-[2] min-h-0 rounded-lg border border-[var(--border-color)] overflow-hidden" style={{ height: '600px' }}>
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create the Server Component page**

Create `app/(dashboard)/orchestration/page.tsx`:

```typescript
import { PageHeader } from '@/components/shared/page-header'
import { OrchestrationPageClient } from '@/features/orchestration/components/orchestration-page-client'
import { getAIRuns, getOrgAgentLogs } from '@/server/dal/ai-runs'
import { MOCK_ORG_ID } from '@/lib/mock'

export default async function OrchestrationPage() {
  const [initialRuns, initialLogs] = await Promise.all([
    getAIRuns(MOCK_ORG_ID, { limit: 20 }),
    getOrgAgentLogs(MOCK_ORG_ID, 100),
  ])

  return (
    <>
      <PageHeader
        title="Orchestration"
        subtitle="Live AI agent workflow observability"
      />
      <OrchestrationPageClient
        initialRuns={initialRuns}
        initialLogs={initialLogs}
      />
    </>
  )
}
```

- [ ] **Step 3: Add Orchestration nav item**

Open `components/layout/sidebar/nav-items.tsx`. After the Analytics nav item object (before the closing `]` of the `navItems` array), add:

```typescript
  {
    label: 'Orchestration',
    href: '/orchestration',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
  },
```

- [ ] **Step 4: Commit**

```bash
git add features/orchestration/components/orchestration-page-client.tsx app/(dashboard)/orchestration/page.tsx components/layout/sidebar/nav-items.tsx
git commit -m "feat(orchestration): add orchestration page, client shell, and nav item"
```

---

## Task 13: Type-Check + Build Verification

**Files:**
- No new files; fix any type errors surfaced

- [ ] **Step 1: Run TypeScript strict check**

```bash
npx tsc --noEmit
```

Expected: exits with 0, no errors.

If errors: fix them. Common issues:
- `offsetPath` CSS property not in `React.CSSProperties` — cast to `React.CSSProperties & { offsetPath: string; offsetRotate: string }` in workflow-edge.tsx
- Zustand v5 `setState` API — if needed, use `useOrchestrationStore.setState({ ... })` directly in tests (this is valid in Zustand v5)
- React Flow v12 `Node` type generic — verify `AgentFlowNode = Node<AgentNodeData, 'agent'>` matches usage

- [ ] **Step 2: Run all orchestration tests**

```bash
npx vitest run --reporter verbose __tests__/orchestration-store.test.ts __tests__/graph-layout.test.ts
```

Expected: all tests pass.

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run --reporter verbose
```

Expected: all existing tests still pass. New tests pass. Zero regressions.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: exits with 0. The build may produce a warning about `offsetPath` being an unknown CSS property — this is acceptable (it's valid CSS Motion Path). Any error that isn't a warning must be fixed.

- [ ] **Step 5: Commit fixes if any**

```bash
git add -p
git commit -m "fix(orchestration): resolve type errors from tsc strict check"
```

- [ ] **Step 6: Final commit if clean**

If no fixes needed:

```bash
git commit --allow-empty -m "chore(orchestration): Phase 1 complete — all tests green, build passes"
```

---

## Spec Coverage Self-Check

| Spec requirement | Task |
|---|---|
| `/orchestration` page with 60/40 split layout | Task 12 |
| All 7 agents as live nodes | Task 9 (computeGraphLayout returns all 7 static nodes) |
| Adaptive topology: linear pipeline + fan-out for parallel agents | Task 6 |
| Real-time via Supabase Realtime postgres_changes | Task 11 |
| Zustand store shape (agentStates, activeRuns, feedEvents) | Task 5 |
| TanStack Query hydration — replaced by Server Component + props | Task 12 |
| AgentNode: name, state badge, duration, tokens, pulse | Task 7 |
| WorkflowEdge: idle dotted / active travelling dot | Task 8 |
| ActivityFeed: timestamp, agent badge, level badge, AnimatePresence | Task 10 |
| OrchestrationStatusBar: active runs, tokens, last run, live indicator | Task 11 |
| Live indicator pulses green / grey on disconnect | Task 11 |
| Mock mode: skip Realtime, use fixture data | Task 11 (useRealtimeRuns early-returns), Task 3 (fixtures) |
| Navigation: Orchestration after Analytics | Task 12 |
| Unit tests: store transitions + graph layout | Tasks 4–6 |
| Empty state: "No agent runs yet" | Task 9 |
| Disconnection warning banner | Task 12 |
| Agent state colors per spec (amber/accent/green/destructive) | Task 6 (agent-colors.ts) |
