import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AgentCard } from '@/components/agents/agent-card'
import { AGENT_REGISTRY } from '@/lib/agents/registry'

const growthAgent = AGENT_REGISTRY.find(a => a.slug === 'growth')!
const seoAgent    = AGENT_REGISTRY.find(a => a.slug === 'seo')!

describe('AgentCard', () => {
  it('renders the agent name', () => {
    render(<AgentCard agent={growthAgent} status="idle" />)
    expect(screen.getByText('Head of Growth & Partnerships')).toBeInTheDocument()
  })

  it('renders the department', () => {
    render(<AgentCard agent={growthAgent} status="idle" />)
    expect(screen.getByText('Growth & Outreach')).toBeInTheDocument()
  })

  it('renders the status badge', () => {
    render(<AgentCard agent={growthAgent} status="active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows "Pending deployment" for not-deployed agents', () => {
    render(<AgentCard agent={seoAgent} status="not-deployed" />)
    expect(screen.getByText(/Pending deployment/i)).toBeInTheDocument()
  })

  it('shows currentTask when provided', () => {
    render(<AgentCard agent={growthAgent} status="active" currentTask="Discovering opportunities" />)
    expect(screen.getByText('Discovering opportunities')).toBeInTheDocument()
  })
})
