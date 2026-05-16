import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComingSoonView } from '@/components/workspace/coming-soon-view'

describe('ComingSoonView', () => {
  it('renders the title', () => {
    render(<ComingSoonView title="Workflows" description="Cross-agent workflow management" />)
    expect(screen.getByText('Workflows')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<ComingSoonView title="Workflows" description="Cross-agent workflow management" />)
    expect(screen.getByText('Cross-agent workflow management')).toBeInTheDocument()
  })
})
