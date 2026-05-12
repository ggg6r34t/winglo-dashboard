'use client'

import { useCallback, useMemo } from 'react'
import { ReactFlow, Background, BackgroundVariant, type NodeMouseHandler } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { AgentType } from '@/types'
import { useOrchestrationStore } from '../hooks/use-orchestration-store'
import { computeGraphLayout } from '../utils/graph-layout'
import { AgentNode } from './agent-node'
import { WorkflowEdge } from './workflow-edge'
import type { AgentNodeData } from '../types'

const nodeTypes = { agent: AgentNode }
const edgeTypes = { workflow: WorkflowEdge }

interface Props {
  selectedAgentType: AgentType | null
  onAgentClick: (agentType: AgentType) => void
  onDeselect: () => void
}

export function AgentGraph({ selectedAgentType, onAgentClick, onDeselect }: Props) {
  const recentRuns = useOrchestrationStore(s => s.recentRuns)
  const feedEvents = useOrchestrationStore(s => s.feedEvents)

  const { nodes: layoutNodes, edges } = useMemo(
    () => computeGraphLayout(recentRuns, feedEvents),
    [recentRuns, feedEvents]
  )

  // Inject React Flow `selected` from our controlled state so the ring renders correctly
  const nodes = useMemo(
    () => layoutNodes.map(n => ({
      ...n,
      selected: (n.data as AgentNodeData).agentType === selectedAgentType,
    })),
    [layoutNodes, selectedAgentType]
  )

  const handleNodeClick = useCallback<NodeMouseHandler>(
    (_, node) => {
      const agentType = (node.data as AgentNodeData).agentType
      onAgentClick(agentType)
    },
    [onAgentClick]
  )

  return (
    <div className="h-full w-full relative">
      {recentRuns.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <p className="text-sm text-[var(--text-muted)] bg-[var(--surface)] px-3 py-1.5 rounded">
            No agent runs yet. Submit a business profile to get started.
          </p>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={onDeselect}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'var(--background)' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--border-color)"
        />
      </ReactFlow>
    </div>
  )
}
