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

  it('hydrateLogs skips logs whose run is not in recentRuns', () => {
    // Hydrate with one run, then pass a log for an unknown run
    const run = makeRun({ id: 'run-known', agent_type: 'discovery' })
    useOrchestrationStore.getState().hydrateRuns([run])
    const logs = [
      makeLog({ id: 'l-known',   ai_run_id: 'run-known',   message: 'in window' }),
      makeLog({ id: 'l-orphan',  ai_run_id: 'run-unknown', message: 'outside window' }),
    ]
    useOrchestrationStore.getState().hydrateLogs(logs)
    const { feedEvents } = useOrchestrationStore.getState()
    expect(feedEvents).toHaveLength(1)
    expect(feedEvents[0].id).toBe('l-known')
    expect(feedEvents[0].agentType).toBe('discovery')
  })

  it('appendLog does not add event when run is not in recentRuns', () => {
    const orphanLog = makeLog({ id: 'l-orphan', ai_run_id: 'run-nonexistent' })
    useOrchestrationStore.getState().appendLog(orphanLog)
    const { feedEvents } = useOrchestrationStore.getState()
    expect(feedEvents).toHaveLength(0)
  })
})
