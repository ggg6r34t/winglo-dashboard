import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { AgentNode } from '@/features/orchestration/components/agent-node'
import type { NodeProps } from '@xyflow/react'
import type { AgentFlowNode } from '@/features/orchestration/types'

function makeProps(overrides: Partial<AgentFlowNode['data']> = {}): NodeProps<AgentFlowNode> {
  return {
    id: 'test-node',
    type: 'agent',
    selected: false,
    dragging: false,
    zIndex: 1,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    data: {
      label: 'Test Agent',
      agentType: 'intake',
      state: 'idle',
      lastRunDurationMs: null,
      tokensUsed: null,
      runId: null,
      lastLogMessage: null,
      ...overrides,
    },
  } as NodeProps<AgentFlowNode>
}

function renderNode(props: NodeProps<AgentFlowNode>) {
  return render(
    <ReactFlowProvider>
      <AgentNode {...props} />
    </ReactFlowProvider>
  )
}

describe('AgentNode', () => {
  it('renders the agent role title for intake', () => {
    renderNode(makeProps({ agentType: 'intake', state: 'idle' }))
    expect(screen.getByText('Business Analyst')).toBeInTheDocument()
  })

  it('renders the department label for intake', () => {
    renderNode(makeProps({ agentType: 'intake', state: 'idle' }))
    expect(screen.getByText('Intelligence Intake')).toBeInTheDocument()
  })

  it('shows "On Standby" when state is idle', () => {
    renderNode(makeProps({ state: 'idle' }))
    expect(screen.getByText('On Standby')).toBeInTheDocument()
  })

  it('shows "Queued" when state is queued', () => {
    renderNode(makeProps({ state: 'queued' }))
    expect(screen.getByText('Queued')).toBeInTheDocument()
  })

  it('shows "Working" when state is executing', () => {
    renderNode(makeProps({ state: 'executing' }))
    expect(screen.getByText('Working')).toBeInTheDocument()
  })

  it('shows "Completed" when state is completed', () => {
    renderNode(makeProps({ state: 'completed' }))
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('shows "Failed" when state is failed', () => {
    renderNode(makeProps({ state: 'failed' }))
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('renders duration when lastRunDurationMs is set', () => {
    renderNode(makeProps({ state: 'completed', lastRunDurationMs: 4200 }))
    expect(screen.getByText('4.2s')).toBeInTheDocument()
  })

  it('renders sub-second duration in ms', () => {
    renderNode(makeProps({ state: 'completed', lastRunDurationMs: 350 }))
    expect(screen.getByText('350ms')).toBeInTheDocument()
  })

  it('renders lastLogMessage as activity text', () => {
    renderNode(makeProps({ state: 'executing', lastLogMessage: 'Analyzing profile...' }))
    expect(screen.getByText('Analyzing profile...')).toBeInTheDocument()
  })

  it('shows standby text when idle and no log message', () => {
    renderNode(makeProps({ agentType: 'intake', state: 'idle', lastLogMessage: null }))
    expect(screen.getByText('Monitoring for incoming profiles')).toBeInTheDocument()
  })

  it('omits duration when lastRunDurationMs is null', () => {
    renderNode(makeProps({ lastRunDurationMs: null }))
    expect(screen.queryByText(/^\d+(ms|s)$/)).toBeNull()
  })
})
