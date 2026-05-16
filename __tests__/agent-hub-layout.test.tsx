import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { AGENT_REGISTRY } from '@/lib/agents/registry'

vi.mock('next/navigation', () => ({
  usePathname: () => '/agents/growth',
}))

vi.mock('@/features/orchestration/hooks/use-orchestration-store', () => ({
  useOrchestrationStore: (selector: (s: { agentStates: Record<string, string> }) => unknown) =>
    selector({ agentStates: { intake: 'idle', discovery: 'idle', research: 'idle', scoring: 'idle', outreach: 'idle', memory: 'idle', analytics: 'idle' } }),
}))

const growthAgent = AGENT_REGISTRY.find(a => a.slug === 'growth')!

const TABS = [
  { label: 'Overview', href: '/agents/growth' },
  { label: 'Workflows', href: '/agents/growth/workflows' },
]

describe('AgentHubLayout', () => {
  it('renders the agent name', () => {
    render(
      <AgentHubLayout agent={growthAgent} tabs={TABS}>
        <div>content</div>
      </AgentHubLayout>
    )
    expect(screen.getByText('Head of Growth & Partnerships')).toBeInTheDocument()
  })

  it('renders tab labels', () => {
    render(
      <AgentHubLayout agent={growthAgent} tabs={TABS}>
        <div>content</div>
      </AgentHubLayout>
    )
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Workflows')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <AgentHubLayout agent={growthAgent} tabs={TABS}>
        <div>my content</div>
      </AgentHubLayout>
    )
    expect(screen.getByText('my content')).toBeInTheDocument()
  })

  it('renders without tabs when tabs is empty', () => {
    render(
      <AgentHubLayout agent={growthAgent} tabs={[]}>
        <div>content</div>
      </AgentHubLayout>
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
