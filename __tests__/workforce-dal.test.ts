import { describe, expect, it, vi } from 'vitest'
import { MOCK_ORG_ID } from '@/lib/mock'

vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'local')
vi.stubEnv('NEXT_PUBLIC_USE_MOCK_DATA', 'true')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'placeholder')
vi.stubEnv('OPENAI_API_KEY', 'sk-placeholder')

describe('workforce DAL mock adapters', () => {
  it('returns seeded agents from registry defaults', async () => {
    const { getAIAgents } = await import('@/server/dal/ai-agents')
    const agents = await getAIAgents(MOCK_ORG_ID)

    expect(agents.length).toBeGreaterThanOrEqual(8)
    expect(agents.some(agent => agent.slug === 'growth' && agent.deployed)).toBe(true)
  })

  it('returns pending approvals and can mark one approved', async () => {
    const { getApprovals, decideApproval } = await import('@/server/dal/approvals')
    const pending = await getApprovals(MOCK_ORG_ID, { status: 'pending' })

    expect(pending.length).toBeGreaterThan(0)

    const approved = await decideApproval(pending[0].id, 'approved', 'Looks good')
    expect(approved.status).toBe('approved')
    expect(approved.decision_note).toBe('Looks good')
  })

  it('returns connector accounts with catalog metadata', async () => {
    const { getConnectorAccounts } = await import('@/server/dal/connectors')
    const accounts = await getConnectorAccounts(MOCK_ORG_ID)

    expect(accounts.length).toBeGreaterThan(0)
    expect(accounts[0]).toHaveProperty('connector')
    expect(accounts.some(account => account.connector.key === 'hubspot')).toBe(true)
  })

  it('returns workflow definitions with recent runs', async () => {
    const { getWorkflows } = await import('@/server/dal/workflows')
    const workflows = await getWorkflows(MOCK_ORG_ID, { agentSlug: 'growth' })

    expect(workflows.length).toBeGreaterThan(0)
    expect(workflows[0].runs_recent.length).toBeGreaterThan(0)
  })

  it('returns reports and activity events', async () => {
    const [{ getReports }, { getActivityEvents }] = await Promise.all([
      import('@/server/dal/reports'),
      import('@/server/dal/activity-events'),
    ])

    const reports = await getReports(MOCK_ORG_ID)
    const events = await getActivityEvents(MOCK_ORG_ID)

    expect(reports.length).toBeGreaterThan(0)
    expect(events.length).toBeGreaterThan(0)
  })
})
