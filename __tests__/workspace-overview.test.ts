import { describe, expect, it, vi, afterEach } from 'vitest'

const MOCK_ORG_ID = '00000000-0000-0000-0000-000000000001'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('workspace overview aggregation', () => {
  it('counts full source collections while limiting preview lists', async () => {
    stubRequiredEnv()
    const { buildWorkspaceOverview } = await import('@/lib/workforce/workspace-overview')

    const overview = buildWorkspaceOverview({
      appEnv: 'local',
      agents: [
        agent('growth', true),
        agent('seo', false),
      ],
      activeRuns: [run('run-1'), run('run-2')],
      approvals: [
        approval('ap-1'),
        approval('ap-2'),
        approval('ap-3'),
        approval('ap-4'),
        approval('ap-5'),
        approval('ap-6'),
      ],
      workflows: [
        workflow('wf-1'),
        workflow('wf-2'),
        workflow('wf-3'),
        workflow('wf-4'),
        workflow('wf-5'),
        workflow('wf-6'),
      ],
      reports: [report('report-1')],
      activity: [event('evt-1')],
      connectorAccounts: [
        connectorAccount('hubspot', 'connected'),
        connectorAccount('ga4', 'attention'),
        connectorAccount('slack', 'error'),
        connectorAccount('stripe', 'not_connected'),
      ],
    })

    expect(overview.counts.pendingApprovals).toBe(6)
    expect(overview.counts.workflows).toBe(6)
    expect(overview.approvals).toHaveLength(5)
    expect(overview.workflows).toHaveLength(5)
    expect(overview.connectorHealth).toEqual({
      connected: 1,
      attention: 1,
      error: 1,
      notConnected: 1,
      total: 4,
    })
  })

  it('shows only deployed agents in production totals', async () => {
    stubRequiredEnv()
    const { buildWorkspaceOverview } = await import('@/lib/workforce/workspace-overview')

    const overview = buildWorkspaceOverview({
      appEnv: 'production',
      agents: [
        agent('growth', true),
        agent('seo', false),
      ],
      activeRuns: [],
      approvals: [],
      workflows: [],
      reports: [],
      activity: [],
      connectorAccounts: [],
    })

    expect(overview.counts.deployedAgents).toBe(1)
    expect(overview.counts.visibleAgents).toBe(1)
  })
})

describe('workspace org resolution', () => {
  it('keeps local development sign-in-free with the demo organization', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'local')
    vi.stubEnv('WINGLO_DEFAULT_ORG_ID', '')

    const { getCurrentOrgId } = await import('@/server/auth/org')

    await expect(getCurrentOrgId()).resolves.toBe(MOCK_ORG_ID)
  })

  it('fails loudly in production when no authenticated/default organization is configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'production')
    vi.stubEnv('WINGLO_DEFAULT_ORG_ID', '')

    const { getCurrentOrgId } = await import('@/server/auth/org')

    await expect(getCurrentOrgId()).rejects.toThrow('Production organization resolution is not configured')
  })
})

function agent(slug: string, deployed: boolean) {
  return {
    id: `agent-${slug}`,
    organization_id: MOCK_ORG_ID,
    slug,
    name: slug,
    department: 'Test',
    mission: 'Test',
    capabilities: [],
    deployed,
    status: deployed ? 'idle' as const : 'not-deployed' as const,
    config: {},
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  }
}

function run(id: string) {
  return {
    id,
    organization_id: MOCK_ORG_ID,
    agent_type: 'discovery' as const,
    status: 'running' as const,
    input: {},
    output: null,
    error: null,
    duration_ms: null,
    tokens_used: null,
    started_at: null,
    completed_at: null,
    created_at: '2026-05-01T00:00:00Z',
  }
}

function approval(id: string) {
  return {
    id,
    organization_id: MOCK_ORG_ID,
    agent_slug: 'growth',
    approval_type: 'outreach',
    title: id,
    summary: 'Review required',
    entity_type: null,
    entity_id: null,
    status: 'pending' as const,
    urgency: 'low' as const,
    requested_by_run_id: null,
    decided_by: null,
    decided_at: null,
    decision_note: null,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  }
}

function workflow(id: string) {
  return {
    id,
    organization_id: MOCK_ORG_ID,
    agent_slug: 'growth',
    key: id,
    title: id,
    state: 'run' as const,
    runs: 1,
    success: 1,
    schedule: 'Manual',
    last_run: 'Never',
    description: 'Test',
    avg_duration: '0s',
    enabled: true,
    trigger_type: 'manual' as const,
    approval_policy: {},
    config: {},
    runs_recent: [],
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  }
}

function report(id: string) {
  return {
    id,
    organization_id: MOCK_ORG_ID,
    agent_slug: 'growth',
    source_run_id: null,
    title: id,
    summary: 'Report',
    category: 'Weekly',
    status: 'published' as const,
    pinned: false,
    tags: [],
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  }
}

function event(id: string) {
  return {
    id,
    organization_id: MOCK_ORG_ID,
    agent_slug: 'growth',
    actor_type: 'agent' as const,
    event_type: 'test',
    entity_type: null,
    entity_id: null,
    severity: 'info' as const,
    message: id,
    metadata: {},
    created_at: '2026-05-01T00:00:00Z',
  }
}

function connectorAccount(key: string, status: 'connected' | 'attention' | 'error' | 'not_connected') {
  return {
    id: `acct-${key}`,
    organization_id: MOCK_ORG_ID,
    connector_id: `conn-${key}`,
    connector: {
      id: `conn-${key}`,
      key,
      name: key,
      category: 'Test',
      scopes: [],
      oauth_enabled: true,
      created_at: '2026-05-01T00:00:00Z',
    },
    status,
    scopes: [],
    last_sync_at: null,
    error: null,
    config: {},
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  }
}

function stubRequiredEnv() {
  vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'local')
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK_DATA', 'true')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-key')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'placeholder')
  vi.stubEnv('OPENAI_API_KEY', 'sk-placeholder')
}
