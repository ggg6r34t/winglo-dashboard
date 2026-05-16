import { describe, it, expect } from 'vitest'
import { AGENT_REGISTRY, getAgentBySlug, getDeployedAgents } from '@/lib/agents/registry'

describe('AGENT_REGISTRY', () => {
  it('contains 9 agents', () => {
    expect(AGENT_REGISTRY).toHaveLength(9)
  })

  it('has unique slugs', () => {
    const slugs = AGENT_REGISTRY.map(a => a.slug)
    expect(new Set(slugs).size).toBe(9)
  })

  it('marks only growth as deployed', () => {
    const deployed = AGENT_REGISTRY.filter(a => a.deployed)
    expect(deployed).toHaveLength(1)
    expect(deployed[0].slug).toBe('growth')
  })

  it('all agents have required string fields', () => {
    for (const agent of AGENT_REGISTRY) {
      expect(agent.name.length).toBeGreaterThan(0)
      expect(agent.department.length).toBeGreaterThan(0)
      expect(agent.mission.length).toBeGreaterThan(0)
      expect(agent.standbyText.length).toBeGreaterThan(0)
    }
  })

  it('all accents are valid hex colors', () => {
    for (const agent of AGENT_REGISTRY) {
      expect(agent.accent).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('all agents have at least one capability', () => {
    for (const agent of AGENT_REGISTRY) {
      expect(agent.capabilities.length).toBeGreaterThan(0)
    }
  })
})

describe('getAgentBySlug', () => {
  it('returns the correct agent', () => {
    const agent = getAgentBySlug('growth')
    expect(agent.name).toBe('Head of Growth & Partnerships')
  })

  it('throws for an unknown slug', () => {
    expect(() => getAgentBySlug('unknown' as never)).toThrow('Agent not found: unknown')
  })
})

describe('getDeployedAgents', () => {
  it('returns only deployed agents', () => {
    const deployed = getDeployedAgents()
    expect(deployed.length).toBeGreaterThan(0)
    expect(deployed.every(a => a.deployed)).toBe(true)
  })

  it('growth is in deployed agents', () => {
    const slugs = getDeployedAgents().map(a => a.slug)
    expect(slugs).toContain('growth')
  })
})
