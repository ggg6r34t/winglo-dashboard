import type { AIRun, AgentType } from '@/types'
import type { AgentNodeData, AgentNodeState, AgentFlowNode, WorkflowFlowEdge, ActivityEvent } from '../types'
import { AGENT_LABEL } from './agent-colors'

export function deriveNodeState(run: AIRun): AgentNodeState {
  switch (run.status) {
    case 'queued': return 'queued'
    case 'running': return 'executing'
    case 'complete': return 'completed'
    case 'failed': return 'failed'
    default: return 'idle'
  }
}

// 220px card width + 100px gap = 320px step
const STATIC_POSITIONS: Record<string, { x: number; y: number }> = {
  intake:    { x: 0,    y: 220 },
  discovery: { x: 320,  y: 220 },
  research:  { x: 640,  y: 220 },
  scoring:   { x: 960,  y: 220 },
  outreach:  { x: 1280, y: 40  },
  memory:    { x: 1280, y: 220 },
  analytics: { x: 1280, y: 400 },
}

const RESEARCH_X = 640
const SCORING_X  = 960
const FAN_SPACING = 180

function fanY(index: number, total: number): number {
  return 220 - ((total - 1) * FAN_SPACING) / 2 + index * FAN_SPACING
}

function makeIdleNodeData(agentType: AgentType, lastLogMessage: string | null = null): AgentNodeData {
  return {
    label: AGENT_LABEL[agentType],
    agentType,
    state: 'idle',
    lastRunDurationMs: null,
    tokensUsed: null,
    runId: null,
    lastLogMessage,
  }
}

function makeNodeData(run: AIRun, lastLogMessage: string | null = null): AgentNodeData {
  return {
    label: AGENT_LABEL[run.agent_type],
    agentType: run.agent_type,
    state: deriveNodeState(run),
    lastRunDurationMs: run.duration_ms,
    tokensUsed: run.tokens_used,
    runId: run.id,
    lastLogMessage,
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

export function computeGraphLayout(
  recentRuns: AIRun[],
  feedEvents: ActivityEvent[] = []
): GraphLayout {
  // Latest log message per agent type (feedEvents are newest-first)
  const latestLogByAgent = new Map<AgentType, string>()
  for (const event of feedEvents) {
    if (!latestLogByAgent.has(event.agentType)) {
      latestLogByAgent.set(event.agentType, event.message)
    }
  }

  // Most recent run per agent type
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
      const pid = typeof run.input?.profileId === 'string' ? run.input.profileId : '__default__'
      researchByProfile.set(pid, [...(researchByProfile.get(pid) ?? []), run])
    }
  }

  // Group scoring runs by profileId
  const scoringByProfile = new Map<string, AIRun[]>()
  for (const run of recentRuns) {
    if (run.agent_type === 'scoring') {
      const pid = typeof run.input?.profileId === 'string' ? run.input.profileId : '__default__'
      scoringByProfile.set(pid, [...(scoringByProfile.get(pid) ?? []), run])
    }
  }

  const nodes: AgentFlowNode[] = []
  const edges: WorkflowFlowEdge[] = []

  // Static nodes
  const STATIC_TYPES: AgentType[] = ['intake', 'discovery', 'outreach', 'memory', 'analytics']
  for (const type of STATIC_TYPES) {
    const run = latestByType.get(type)
    const logMsg = latestLogByAgent.get(type) ?? null
    nodes.push({
      id: type,
      type: 'agent',
      position: STATIC_POSITIONS[type],
      data: run ? makeNodeData(run, logMsg) : makeIdleNodeData(type, logMsg),
    })
  }

  const intakeData    = nodes.find(n => n.id === 'intake')!.data
  const discoveryData = nodes.find(n => n.id === 'discovery')!.data

  edges.push({
    id: 'e-intake-discovery',
    source: 'intake',
    target: 'discovery',
    type: 'workflow',
    data: { active: isEdgeActive(intakeData, discoveryData) },
  })

  const allProfileIds = new Set([...researchByProfile.keys(), ...scoringByProfile.keys()])

  if (allProfileIds.size === 0) {
    // No research/scoring runs — show idle identity cards for both so all 7 agents are visible
    const idleResearchData = makeIdleNodeData('research', latestLogByAgent.get('research') ?? null)
    const idleScoringData  = makeIdleNodeData('scoring',  latestLogByAgent.get('scoring')  ?? null)
    nodes.push(
      { id: 'research-idle', type: 'agent', position: STATIC_POSITIONS['research'], data: idleResearchData },
      { id: 'scoring-idle',  type: 'agent', position: STATIC_POSITIONS['scoring'],  data: idleScoringData  },
    )
    edges.push({
      id: 'e-discovery-research-idle',
      source: 'discovery',
      target: 'research-idle',
      type: 'workflow',
      data: { active: isEdgeActive(discoveryData, idleResearchData) },
    })
    edges.push({
      id: 'e-research-idle-scoring-idle',
      source: 'research-idle',
      target: 'scoring-idle',
      type: 'workflow',
      data: { active: false },
    })
    for (const target of ['outreach', 'memory', 'analytics'] as AgentType[]) {
      const targetData = nodes.find(n => n.id === target)!.data
      edges.push({
        id: `e-scoring-idle-${target}`,
        source: 'scoring-idle',
        target,
        type: 'workflow',
        data: { active: false },
      })
    }
    return { nodes, edges }
  }

  // Fan-out research and scoring per profileId
  let nodeIndex = 0
  for (const profileId of allProfileIds) {
    const researchRuns = researchByProfile.get(profileId) ?? []
    const scoringRuns  = scoringByProfile.get(profileId)  ?? []
    const total = Math.max(researchRuns.length, 1)

    const researchNodeIds: string[] = []
    researchRuns.forEach((run, i) => {
      const nodeId = `research-${run.id}`
      researchNodeIds.push(nodeId)
      const logMsg = latestLogByAgent.get('research') ?? null
      nodes.push({
        id: nodeId,
        type: 'agent',
        position: { x: RESEARCH_X, y: fanY(nodeIndex + i, total) },
        data: makeNodeData(run, logMsg),
      })
      edges.push({
        id: `e-discovery-${nodeId}`,
        source: 'discovery',
        target: nodeId,
        type: 'workflow',
        data: { active: isEdgeActive(discoveryData, makeNodeData(run)) },
      })
    })

    scoringRuns.forEach((run, i) => {
      const nodeId = `scoring-${run.id}`
      const logMsg = latestLogByAgent.get('scoring') ?? null
      nodes.push({
        id: nodeId,
        type: 'agent',
        position: { x: SCORING_X, y: fanY(nodeIndex + i, total) },
        data: makeNodeData(run, logMsg),
      })
      const sourceId   = researchNodeIds[i] ?? researchNodeIds[0] ?? 'discovery'
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

  // Bridge last scoring (or research) to terminal agents
  const lastScoringNodes  = nodes.filter(n => n.data.agentType === 'scoring')
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
