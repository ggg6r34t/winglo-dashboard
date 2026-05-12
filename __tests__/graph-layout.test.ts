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
  it('returns all 7 agent nodes when no research runs present', () => {
    const runs = [
      makeRun({ agent_type: 'intake', status: 'complete' }),
      makeRun({ id: 'r2', agent_type: 'discovery', status: 'complete' }),
    ]
    const { nodes } = computeGraphLayout(runs)
    expect(nodes).toHaveLength(7)
    const types = nodes.map(n => n.data.agentType)
    expect(types).toContain('intake')
    expect(types).toContain('discovery')
    expect(types).toContain('research')
    expect(types).toContain('scoring')
    expect(types).toContain('outreach')
    expect(types).toContain('memory')
    expect(types).toContain('analytics')
  })

  it('idle research and scoring nodes are in idle state when no runs exist', () => {
    const { nodes } = computeGraphLayout([])
    const research = nodes.find(n => n.id === 'research-idle')
    const scoring = nodes.find(n => n.id === 'scoring-idle')
    expect(research).toBeDefined()
    expect(research?.data.state).toBe('idle')
    expect(scoring).toBeDefined()
    expect(scoring?.data.state).toBe('idle')
  })

  it('routes edges through idle research/scoring when no runs exist', () => {
    const { edges } = computeGraphLayout([])
    expect(edges.some(e => e.source === 'discovery' && e.target === 'research-idle')).toBe(true)
    expect(edges.some(e => e.source === 'research-idle' && e.target === 'scoring-idle')).toBe(true)
    expect(edges.some(e => e.source === 'scoring-idle' && e.target === 'outreach')).toBe(true)
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
