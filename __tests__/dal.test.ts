import { describe, it, expect } from 'vitest'
import { vi } from 'vitest'

// Force mock mode
vi.stubEnv('NEXT_PUBLIC_USE_MOCK_DATA', 'true')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-key')

import { MOCK_ORG_ID } from '@/lib/mock'

describe('DAL - mock mode', () => {
  it('getOrganizations returns all orgs', async () => {
    const { getOrganizations } = await import('@/server/dal/organizations')
    const orgs = await getOrganizations()
    expect(orgs.length).toBeGreaterThanOrEqual(2)
    expect(orgs[0]).toHaveProperty('id')
    expect(orgs[0]).toHaveProperty('slug')
  })

  it('getOrganizationById returns correct org', async () => {
    const { getOrganizationById } = await import('@/server/dal/organizations')
    const org = await getOrganizationById(MOCK_ORG_ID)
    expect(org?.slug).toBe('acme-ai')
  })

  it('getOpportunities filters by orgId', async () => {
    const { getOpportunities } = await import('@/server/dal/opportunities')
    const opps = await getOpportunities(MOCK_ORG_ID)
    expect(opps.length).toBeGreaterThan(0)
    opps.forEach(o => expect(o.organization_id).toBe(MOCK_ORG_ID))
  })

  it('getOpportunities filters by status', async () => {
    const { getOpportunities } = await import('@/server/dal/opportunities')
    const approved = await getOpportunities(MOCK_ORG_ID, { status: 'approved' })
    approved.forEach(o => expect(o.status).toBe('approved'))
  })

  it('getAIRuns returns runs for org', async () => {
    const { getAIRuns } = await import('@/server/dal/ai-runs')
    const runs = await getAIRuns(MOCK_ORG_ID)
    expect(runs.length).toBeGreaterThan(0)
  })

  it('getActiveAIRuns returns only running/queued', async () => {
    const { getActiveAIRuns } = await import('@/server/dal/ai-runs')
    const active = await getActiveAIRuns(MOCK_ORG_ID)
    active.forEach(r => expect(['running', 'queued']).toContain(r.status))
  })

  it('createBusinessProfile returns a BusinessProfile in mock mode', async () => {
    const { createBusinessProfile } = await import('@/server/dal/business-profiles')
    const profile = await createBusinessProfile(MOCK_ORG_ID, {
      name: 'Test Business',
      website_url: 'https://test.example.com',
      description: 'A test business',
      status: 'draft',
    })
    expect(profile).toHaveProperty('id')
    expect(profile.name).toBe('Test Business')
    expect(profile.status).toBe('draft')
    expect(profile.organization_id).toBe(MOCK_ORG_ID)
  })

  it('updateBusinessProfile returns updated profile in mock mode', async () => {
    const { updateBusinessProfile } = await import('@/server/dal/business-profiles')
    const { MOCK_PROFILE_ID } = await import('@/lib/mock')
    const updated = await updateBusinessProfile(MOCK_PROFILE_ID, { status: 'complete' })
    expect(updated.id).toBe(MOCK_PROFILE_ID)
    expect(updated.status).toBe('complete')
  })

  it('createAIRun returns an AIRun in mock mode', async () => {
    const { createAIRun } = await import('@/server/dal/ai-runs')
    const run = await createAIRun(MOCK_ORG_ID, 'intake', { name: 'Test' })
    expect(run).toHaveProperty('id')
    expect(run.agent_type).toBe('intake')
    expect(run.status).toBe('queued')
  })

  it('updateAIRun returns updated run in mock mode', async () => {
    const { createAIRun, updateAIRun } = await import('@/server/dal/ai-runs')
    const run = await createAIRun(MOCK_ORG_ID, 'intake', {})
    const updated = await updateAIRun(run.id, { status: 'complete' })
    expect(updated.status).toBe('complete')
  })

  it('createOpportunities returns mock fixtures regardless of input in mock mode', async () => {
    // Mock mode ignores the input array and returns existing fixtures.
    // This is intentional: in the real flow, Server Actions short-circuit
    // before calling createOpportunities in mock mode.
    const { createOpportunities } = await import('@/server/dal/opportunities')
    const { MOCK_PROFILE_ID } = await import('@/lib/mock')
    const inputOpp = {
      company_name: 'Test Partner',
      company_url: 'https://test.example.com',
      company_description: 'A test partner',
      opportunity_type: 'integration' as const,
      score: 75,
      score_rationale: {
        strategic_fit: 'Good fit',
        audience_overlap: 'High overlap',
        growth_potential: 'Strong',
        ease_of_execution: 'Easy',
      },
      estimated_impact: '$100k ARR',
    }
    const result = await createOpportunities(MOCK_ORG_ID, MOCK_PROFILE_ID, [inputOpp])
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    // Mock returns fixtures, not constructed objects — verify by checking that
    // the mock fixture company name is present, not the input company name
    expect(result.some(o => o.company_name === 'Salesforce')).toBe(true)
    expect(result.some(o => o.company_name === 'Test Partner')).toBe(false)
  })

  it('updateOpportunityStatus returns updated opportunity in mock mode', async () => {
    const { updateOpportunityStatus } = await import('@/server/dal/opportunities')
    const updated = await updateOpportunityStatus('opp-00000000-0000-0000-000000000001', 'approved')
    expect(updated.id).toBe('opp-00000000-0000-0000-000000000001')
    expect(updated.status).toBe('approved')
  })
})
