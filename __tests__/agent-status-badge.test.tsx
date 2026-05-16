import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AgentStatusBadge } from '@/components/agents/agent-status-badge'

describe('AgentStatusBadge', () => {
  it('renders "Active" for active status', () => {
    render(<AgentStatusBadge status="active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders "Queued" for queued status', () => {
    render(<AgentStatusBadge status="queued" />)
    expect(screen.getByText('Queued')).toBeInTheDocument()
  })

  it('renders "Idle" for idle status', () => {
    render(<AgentStatusBadge status="idle" />)
    expect(screen.getByText('Idle')).toBeInTheDocument()
  })

  it('renders "Not Deployed" for not-deployed status', () => {
    render(<AgentStatusBadge status="not-deployed" />)
    expect(screen.getByText('Not Deployed')).toBeInTheDocument()
  })

  it('accepts additional className', () => {
    const { container } = render(<AgentStatusBadge status="active" className="mt-2" />)
    expect(container.firstChild).toHaveClass('mt-2')
  })
})
