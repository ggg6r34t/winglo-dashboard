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
  lastLogMessage: string | null
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
