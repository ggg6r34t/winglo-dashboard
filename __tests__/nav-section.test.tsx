import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NavSection } from '@/components/layout/sidebar/nav-section'

describe('NavSection', () => {
  it('renders the section label when not collapsed', () => {
    render(
      <NavSection label="WORKSPACE" collapsed={false}>
        <div>child</div>
      </NavSection>
    )
    expect(screen.getByText('WORKSPACE')).toBeInTheDocument()
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('hides the label when collapsed', () => {
    render(
      <NavSection label="WORKSPACE" collapsed={true}>
        <div>child</div>
      </NavSection>
    )
    expect(screen.queryByText('WORKSPACE')).not.toBeInTheDocument()
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('renders a trailing element when provided', () => {
    render(
      <NavSection label="AGENTS" collapsed={false} trailing={<span>View all</span>}>
        <div>child</div>
      </NavSection>
    )
    expect(screen.getByText('View all')).toBeInTheDocument()
  })
})
