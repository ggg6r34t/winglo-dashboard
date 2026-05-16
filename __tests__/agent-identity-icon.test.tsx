import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { AgentIdentityIcon } from '@/components/agents/agent-identity-icon'
import type { AgentSlug } from '@/lib/agents/registry'

const ALL_SLUGS: AgentSlug[] = [
  'growth', 'social-media', 'seo', 'marketing', 'telehealth',
  'sales', 'research', 'outreach', 'analytics-manager',
]

describe('AgentIdentityIcon', () => {
  it('renders an SVG for every agent slug', () => {
    for (const slug of ALL_SLUGS) {
      const { container } = render(<AgentIdentityIcon slug={slug} />)
      expect(container.querySelector('svg')).not.toBeNull()
    }
  })

  it('applies accent color via wrapper style', () => {
    const { container } = render(<AgentIdentityIcon slug="growth" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.style.color).toBeTruthy()
  })

  it('passes size to the SVG', () => {
    const { container } = render(<AgentIdentityIcon slug="growth" size={40} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('40')
    expect(svg.getAttribute('height')).toBe('40')
  })

  it('accepts className on the wrapper', () => {
    const { container } = render(<AgentIdentityIcon slug="growth" className="shrink-0" />)
    expect(container.firstChild).toHaveClass('shrink-0')
  })
})
