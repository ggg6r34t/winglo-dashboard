import { create } from 'zustand'
import type { AIRun, AgentLog, AgentType } from '@/types'
import type { AgentNodeState, ActivityEvent } from '../types'
import { deriveNodeState } from '../utils/graph-layout'

const ALL_AGENTS: AgentType[] = [
  'intake', 'discovery', 'research', 'scoring', 'outreach', 'memory', 'analytics',
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

function toActivityEvent(log: AgentLog, run: AIRun): ActivityEvent {
  return {
    id: log.id,
    aiRunId: log.ai_run_id,
    agentType: run.agent_type,
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
      .filter(log => runMap.has(log.ai_run_id))
      .map(log => toActivityEvent(log, runMap.get(log.ai_run_id)!))
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
    if (!run) return
    const event = toActivityEvent(log, run)
    set({ feedEvents: [event, ...feedEvents].slice(0, 200) })
  },

  setLive(live) {
    set({ isLive: live })
  },
}))
